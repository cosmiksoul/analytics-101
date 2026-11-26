"""Сверка формул калькулятора страницы 11.2 (JS в page.js) со SciPy и statsmodels.

Запуск:  python3 pages/da-11-2/data/check_calc.py   (нужен node)
node выполняет page.js с заглушкой window и считает PAGE.calc на сетке параметров; Python сравнивает:
- Φ и Φ⁻¹ с scipy.stats.norm;
- размер группы A с NormalIndPower.solve_power (две стороны, как в statsmodels): для доли — с эффектом Δ/σ̄,
  σ̄ = √((p₀q₀ + p₁q₁)/2), и для справки с арксинусом proportion_effectsize; для среднего — с эффектом Δ/σ
  и ratio = (1 − w)/w при неравных группах.
"""
import itertools, json, math, subprocess
from pathlib import Path

import numpy as np
from scipy.stats import norm
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize

PAGE = Path(__file__).resolve().parent.parent
P0 = [0.02, 0.05, 0.1408, 0.3, 0.5]
REL = [0.02, 0.05, 0.061, 0.1, 0.2]
AL = [0.01, 0.05, 0.1]
PW = [0.7, 0.8, 0.9, 0.95]
W = [0.5, 0.8, 0.9]
grid_c = [dict(kind="conv", p0=p, mde=p * r, alpha=a, power=b, wA=0.5, flow=1000, share=1)
          for p, r, a, b in itertools.product(P0, REL, AL, PW)]
grid_r = [dict(kind="rev", sd=sd, mde=d, alpha=a, power=b, wA=w, flow=1000, share=1)
          for sd, d, a, b, w in itertools.product([1000, 6911.72], [20, 61, 150], AL, PW, W)]
xs = list(np.linspace(-6, 6, 241))
ps = [1e-6, 1e-4, 0.001, 0.01, 0.02425, 0.05, 0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 0.975, 0.995, 0.9999]
js = f"""
global.window = {{}};
eval(require('fs').readFileSync({json.dumps(str(PAGE / 'page.js'))}, 'utf8'));
const C = window.PAGE.calc;
const out = {{ phi: {json.dumps(xs)}.map(C.Phi), inv: {json.dumps(ps)}.map(C.invPhi),
  conv: {json.dumps(grid_c)}.map(s => C.plan(s).nA), rev: {json.dumps(grid_r)}.map(s => C.plan(s).nA) }};
console.log(JSON.stringify(out));
"""
r = json.loads(subprocess.run(["node", "-"], input=js, capture_output=True, text=True, check=True).stdout)

print("Φ: наибольшая абсолютная ошибка", f"{max(abs(a - norm.cdf(x)) for a, x in zip(r['phi'], xs)):.1e}")
print("Φ⁻¹: наибольшая абсолютная ошибка", f"{max(abs(a - norm.ppf(p)) for a, p in zip(r['inv'], ps)):.1e}")

pw = NormalIndPower()
d_same, d_asin = [], []
for s, n_js in zip(grid_c, r["conv"]):
    p0, p1 = s["p0"], s["p0"] + s["mde"]
    es = s["mde"] / math.sqrt((p0 * (1 - p0) + p1 * (1 - p1)) / 2)
    n_sm = math.ceil(pw.solve_power(es, alpha=s["alpha"], power=s["power"]) - 1e-7)
    n_as = math.ceil(pw.solve_power(proportion_effectsize(p1, p0), alpha=s["alpha"], power=s["power"]) - 1e-7)
    d_same.append(n_js - n_sm)
    d_as = (n_js - n_as) / n_as
    d_asin.append(d_as)
print(f"доля, {len(grid_c)} точек: JS − statsmodels(Δ/σ̄) от {min(d_same)} до {max(d_same)} человек; "
      f"JS против арксинуса от {min(d_asin):+.2%} до {max(d_asin):+.2%}")
d_rev = []
for s, n_js in zip(grid_r, r["rev"]):
    w = s["wA"]
    n_sm = math.ceil(pw.solve_power(s["mde"] / s["sd"], alpha=s["alpha"], power=s["power"], ratio=(1 - w) / w) - 1e-7)
    d_rev.append(n_js - n_sm)
print(f"среднее, {len(grid_r)} точек (50/50, 80/20, 90/10): JS − statsmodels от {min(d_rev)} до {max(d_rev)} человек в группе A")
