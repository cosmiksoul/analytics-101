"""Сверка мишени «Смещение против разброса» с NumPy: те же способы отбора, те же n, разные генераторы.

Запуск из любой папки:  python3 pages/da-6-1/data/check_target.py   (нужен node)
Генератор мишени берётся из page.js (метки /*gen:start*/ и /*gen:end*/) и запускается в node с теми же
зёрнами, что на странице («survey|100» и т. п.), по 10 000 выборок на пару «способ × n».
Сравнение: среднее оценок и их разброс у JS, теория (взвешенные среднее и σ/√n по всем 100 000)
и настоящий процесс NumPy (опрос и «первые n» без возвращения, как в блоке кода «Смещённый отбор»).
Совпадать должны с точностью до статистической погрешности, а не до знака.
"""
import json, re, subprocess
from pathlib import Path
import numpy as np, pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
src = (PAGE / "page.js").read_text(encoding="utf-8")
data = re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", src, re.S).group(1)
gen = re.search(r"/\*gen:start\*/(.*?)/\*gen:end\*/", src, re.S).group(1)
CASES = [(m, n) for m in ("random", "survey", "first") for n in (25, 100, 400, 1600)]
K = 10_000
js = f"""const DATA = {data};
{gen}
const out = {{}};
for (const [m, n] of {json.dumps(CASES)}) {{
  const r = mulberry32(seedOf(m + '|' + n)), e = [];
  for (let i = 0; i < {K}; i++) e.push(estimate(m, n, r));
  out[m + '|' + n] = e;
}}
console.log(JSON.stringify(out));"""
res = json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)
D = json.loads(data)

users = pd.read_csv(PAGE.parents[1] / "data" / "inference" / "users.csv")
spend = users.spend.to_numpy(); N = len(users)
pans = users.p_answer.to_numpy(); visit = users.active_days.to_numpy() / 90
rng = np.random.default_rng(6102)
def pick(m, n):
    if m == "random": return rng.choice(N, n, replace=False)
    pool = np.flatnonzero(rng.random(N) < (pans if m == "survey" else visit))
    return rng.choice(pool, n, replace=False)

mu, p = D["mu"], D["p"]
print(f"μ = {mu:.0f} ₽, доля покупателей p = {p:.4f}; JS — {K} выборок, NumPy — 2 000 выборок настоящим процессом")
print(f"{'способ':<7} {'n':>5} | {'JS: среднее':>11} {'разброс':>8} {'доля':>7} {'разброс':>8} | {'теория: среднее':>15} {'σ/√n':>7} {'доля':>7} {'√(p(1−p)/n)':>11} | {'NumPy: среднее':>14} {'разброс':>8}")
for m, n in CASES:
    e = np.array(res[f"{m}|{n}"]); t = D["theory"][m]
    se, pse = t["sd"] / np.sqrt(n), np.sqrt(t["p"] * (1 - t["p"]) / n)
    npm = np.array([spend[pick(m, n)].mean() for _ in range(2000)])
    print(f"{m:<7} {n:>5} | {e[:, 0].mean():11.0f} {e[:, 0].std():8.1f} {e[:, 1].mean():7.4f} {e[:, 1].std():8.4f} | {t['mean']:15.0f} {se:7.1f} {t['p']:7.4f} {pse:11.4f} | {npm.mean():14.0f} {npm.std():8.1f}")
