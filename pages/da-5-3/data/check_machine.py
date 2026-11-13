"""Сверка «Машины выборок» с NumPy: те же распределения, те же n, разные генераторы.

Запуск из папки страницы:  python3 data/check_machine.py
Генератор машины берётся из page.js (метки /*gen:start*/ и /*gen:end*/) и запускается в node.
Для каждого распределения и n — 10 000 средних: среднее средних, разброс, σ/√n, асимметрия.
Совпадать должны с точностью до статистической погрешности, а не до знака.
"""
import json, re, subprocess
from pathlib import Path
import numpy as np, pandas as pd

PAGE = Path(__file__).resolve().parent.parent
src = (PAGE / "page.js").read_text(encoding="utf-8")
data = re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", src, re.S).group(1)
gen = re.search(r"/\*gen:start\*/(.*?)/\*gen:end\*/", src, re.S).group(1)
CASES = [("checks", 30), ("checks", 1000), ("conv", 30), ("conv", 1000), ("expo", 30), ("expo", 1000), ("pareto", 30), ("pareto", 1000)]
K = 10_000
js = f"""const lerp=(a,b,t)=>a+(b-a)*t; const DATA = {data};
{gen}
const out = {{}};
for (const [d, n] of {json.dumps(CASES)}) {{
  const r = mulberry32(seedOf(d + '|' + n)), m = [];
  for (let i = 0; i < {K}; i++) m.push(sampleMean(DISTS[d], n, r));
  out[d + '|' + n] = m;
}}
out.theory = Object.fromEntries(Object.entries(DISTS).map(([k, v]) => [k, [v.mu, v.sigma, v.skew]]));
console.log(JSON.stringify(out));"""
res = json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)

amount = pd.read_csv(PAGE.parents[1] / "data" / "probability" / "checks.csv")["amount"].to_numpy(float)
p = pd.read_csv(PAGE.parents[1] / "data" / "probability" / "visits.csv")["bought"].mean()
rng = np.random.default_rng(5302)
def np_draws(d, size):
    if d == "checks": return rng.choice(amount, size=size)
    if d == "conv": return (rng.random(size) < p).astype(float)
    if d == "expo": return rng.exponential(12, size)
    return 1000 * (1 + rng.pareto(1.5, size))
skew = lambda x: float(((x - x.mean()) ** 3).mean() / x.std() ** 3)
print(f"{'распределение':<8} {'n':>5} | {'JS: среднее':>12} {'разброс':>9} {'асимм.':>7} | {'NumPy: среднее':>14} {'разброс':>9} {'асимм.':>7} | {'σ/√n':>9}")
for d, n in CASES:
    j = np.array(res[f"{d}|{n}"]); mu, sg, sk = res["theory"][d]
    m = np.concatenate([np_draws(d, (K // 10, n)).mean(axis=1) for _ in range(10)])
    se = sg / np.sqrt(n) if sg is not None else float("inf")
    print(f"{d:<8} {n:>5} | {j.mean():12.4f} {j.std():9.4f} {skew(j):7.2f} | {m.mean():14.4f} {m.std():9.4f} {skew(m):7.2f} | {se:9.4f}")
print("теория:", {k: [round(v[0], 4), v[1] if v[1] is None else round(v[1], 4), v[2] if v[2] is None else round(v[2], 3)] for k, v in res["theory"].items()})
