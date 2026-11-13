"""Сверка генератора интерактива «Сто интервалов» с NumPy — по смыслу, через покрытие.

Запуск из любой папки:  python3 pages/da-6-2/data/check_js.py
Берёт из page.js данные (/*data:start*/ … /*data:end*/) и код генератора (/*gen:start*/ … /*gen:end*/),
запускает его в Node и считает долю промахов t-интервалов на 20 сотнях (2 000 интервалов) для каждой пары
«данные × n × уровень» и процентильного бутстрэпа на 5 сотнях (500 интервалов) для 95%.
Те же доли считает NumPy на 20 000 выборках (t) и 2 000 выборках по 1 000 перевыборок (бутстрэп), seed 6290.
Генераторы разные (mulberry32 и PCG64), поэтому числа совпадают не до знака, а в пределах случайной погрешности:
печатается разница в п. п. и её отношение к стандартной ошибке разницы (|z| < 3 — согласие).
"""
import json
import re
import subprocess
from pathlib import Path

import numpy as np
from scipy import stats

HERE = Path(__file__).resolve().parent
src = (HERE.parent / "page.js").read_text(encoding="utf-8")
data = json.loads(re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", src, re.S).group(1))
gen = re.search(r"/\*gen:start\*/(.*?)/\*gen:end\*/", src, re.S).group(1)
DI = data["inter"]

node = f"""
const DI = {json.dumps(DI)};
{gen}
const out = {{ t: {{}}, b: {{}}, first: {{}} }};
for (const d of ['gaps', 'checks']) for (const [ni, n] of DI.ns.entries()) {{
  const mu = DI.mu[d], hs = [];
  for (let h = 1; h <= 20; h++) hs.push(makeHundred(d, n, h));
  DI.lv.forEach((l, li) => {{
    const t = DI.tq[ni][li]; let miss = 0, below = 0;
    hs.forEach((H, hi) => {{ let m1 = 0; for (let i = 0; i < 100; i++) {{ const se = H.s[i] / Math.sqrt(n), lo = H.m[i] - t * se, up = H.m[i] + t * se; if (up < mu) {{ miss++; below++; if (hi === 0) m1++; }} else if (lo > mu) {{ miss++; if (hi === 0) m1++; }} }} if (hi === 0) out.first[`${{d}}|${{n}}|${{l}}`] = m1; }});
    out.t[`${{d}}|${{n}}|${{l}}`] = [miss, 2000, below];
  }});
  if (n <= 100) {{
    let miss = 0, first = 0;
    for (let h = 1; h <= 5; h++) {{
      const H = makeHundred(d, n, h);
      for (let i = 0; i < 100; i++) {{
        const a = Float64Array.from(bootMeans(H.xs.subarray(i * n, (i + 1) * n), bootKey(d, n, h, i))).sort();
        const lo = quant(a, 0.025), up = quant(a, 0.975);
        if (lo > mu || up < mu) {{ miss++; if (h === 1) first++; }}
      }}
    }}
    out.b[`${{d}}|${{n}}|0.95`] = [miss, 500, first];
  }}
}}
console.log(JSON.stringify(out));
"""
js = json.loads(subprocess.run(["node", "-e", node], capture_output=True, text=True, check=True).stdout)

pops = {}
import pandas as pd
P = HERE.parents[2] / "data" / "probability"
pops["gaps"] = pd.read_csv(P / "order_gaps.csv")["gap_days"].to_numpy(float)
pops["checks"] = pd.read_csv(P / "checks.csv")["amount"].to_numpy(float)
rng = np.random.default_rng(6290)


def z(p1, n1, p2, n2):
    se = np.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
    return (p1 - p2) / se if se > 0 else 0.0


worst = 0.0
print("t-интервалы: доля промахов JS (2 000 интервалов) и NumPy (20 000)")
print(f"{'данные':>7} {'n':>4} {'уровень':>7} {'JS':>7} {'NumPy':>7} {'разница':>8} {'z':>6}  первая сотня JS")
for d in ("gaps", "checks"):
    pop, mu = pops[d], pops[d].mean()
    for ni, n in enumerate(DI["ns"]):
        S = rng.choice(pop, size=(20_000, n))
        m, se = S.mean(axis=1), S.std(axis=1, ddof=1) / np.sqrt(n)
        for li, lvl in enumerate(DI["lv"]):
            t = stats.t.ppf(0.5 + lvl / 2, n - 1)
            npm = float(np.mean(np.abs(m - mu) > t * se))
            jm, jn, _ = js["t"][f"{d}|{n}|{lvl}"]
            zz = z(jm / jn, jn, npm, 20_000); worst = max(worst, abs(zz))
            print(f"{d:>7} {n:>4} {lvl:>7.0%} {jm / jn:>7.1%} {npm:>7.1%} {100 * (jm / jn - npm):>+7.1f} {zz:>+6.2f}  {js['first'][f'{d}|{n}|{lvl}']}")

print("\nпроцентильный бутстрэп 95%: доля промахов JS (500 интервалов) и NumPy (2 000 выборок × 1 000 перевыборок)")
for d in ("gaps", "checks"):
    pop, mu = pops[d], pops[d].mean()
    for n in (10, 20, 40, 100):
        miss = 0
        for _ in range(2000):
            x = rng.choice(pop, n)
            lo, hi = np.quantile(x[rng.integers(0, n, size=(1000, n))].mean(axis=1), [0.025, 0.975])
            miss += lo > mu or hi < mu
        jm, jn, first = js["b"][f"{d}|{n}|0.95"]
        zz = z(jm / jn, jn, miss / 2000, 2000); worst = max(worst, abs(zz))
        print(f"{d:>7} {n:>4} {'95%':>7} {jm / jn:>7.1%} {miss / 2000:>7.1%} {100 * (jm / jn - miss / 2000):>+7.1f} {zz:>+6.2f}  {first}")
print(f"\nнаибольшее |z| = {worst:.2f}: {'согласие в пределах случайной погрешности' if worst < 3 else 'есть расхождение — проверить генератор'}")
