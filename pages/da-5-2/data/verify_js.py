"""Сверка формул интерактива (блок /*dist:start*/ … /*dist:end*/ в page.js) со scipy.stats.

Запуск: python3 pages/da-5-2/data/verify_js.py
Блок формул выполняется в Node, те же величины считает SciPy 1.18.1; печатается число точек и худшее расхождение.
"""
import json
import re
import subprocess
from pathlib import Path

from scipy import stats

PAGE = Path(__file__).resolve().parent.parent
block = re.search(r'/\*dist:start\*/(.*?)/\*dist:end\*/', (PAGE / 'page.js').read_text(encoding='utf-8'), re.S).group(1)

# (распределение JS, параметры JS, объект SciPy, метод, аргумент)
CASES = []
def add(js, P, sp, pts):
    for meth, arg in pts:
        CASES.append((js, P, sp, meth, arg))

add('bern', {'p': 0.034}, stats.bernoulli(0.034), [('pmf', 0), ('pmf', 1), ('median', None), ('ppf', 0.97), ('mean', None), ('var', None)])
add('bern', {'p': 0.5}, stats.bernoulli(0.5), [('median', None), ('ppf', 0.5)])
add('binom', {'n': 100, 'p': 0.034}, stats.binom(100, 0.034), [('pmf', k) for k in range(0, 11)] + [('cdf', 3), ('cdf', 5), ('median', None), ('ppf', 0.95), ('ppf', 0.9999), ('mean', None), ('var', None)])
add('binom', {'n': 200, 'p': 0.5}, stats.binom(200, 0.5), [('pmf', 100), ('pmf', 80), ('median', None), ('ppf', 0.05)])
add('binom', {'n': 1000, 'p': 0.034}, stats.binom(1000, 0.034), [('pmf', 34), ('median', None)])
add('pois', {'lam': 38}, stats.poisson(38), [('pmf', 30), ('pmf', 38), ('pmf', 50), ('cdf', 40), ('median', None), ('ppf', 0.95), ('mean', None), ('var', None)])
add('pois', {'lam': 0.5}, stats.poisson(0.5), [('pmf', k) for k in range(4)] + [('median', None), ('ppf', 0.95)])
add('pois', {'lam': 80}, stats.poisson(80), [('pmf', 80), ('ppf', 0.9999)])
add('expo', {'m': 12}, stats.expon(scale=12), [('pdf', 0), ('pdf', 7), ('pdf', 30), ('cdf', 7), ('ppf', 0.5), ('ppf', 0.95), ('mean', None), ('var', None)])
add('norm', {'mu': 4330, 'sd': 270}, stats.norm(4330, 270), [('pdf', 4000), ('cdf', 4000), ('ppf', 0.05), ('ppf', 0.5), ('ppf', 0.95)])
add('norm', {'mu': 0, 'sd': 1}, stats.norm(), [('cdf', -3), ('cdf', -1), ('cdf', 0), ('cdf', 1.96), ('cdf', 8), ('ppf', 0.001), ('ppf', 0.025), ('ppf', 0.975), ('ppf', 0.9999)])
add('norm', {'mu': 4330, 'sd': 5420}, stats.norm(4330, 5420), [('cdf', 0)])
add('logn', {'med': 3000, 's': 0.6}, stats.lognorm(0.6, scale=3000), [('pdf', 1000), ('pdf', 3000), ('pdf', 10000), ('cdf', 15000), ('ppf', 0.05), ('ppf', 0.5), ('ppf', 0.95), ('mean', None), ('var', None)])
add('logn', {'med': 3200, 's': 1.0}, stats.lognorm(1.0, scale=3200), [('mean', None), ('cdf', 30000), ('ppf', 0.99)])

js_cases = [[c[0], c[1], c[3], c[4]] for c in CASES]
js = block + f"""
const C = {json.dumps(js_cases)};
const out = C.map(([id, P, m, a]) => {{
  const D = DIST[id];
  if (m === 'pmf') return D.pmf(a, P);
  if (m === 'pdf') return D.pdf(a, P);
  if (m === 'cdf') return cdfOf(D, a, P);
  if (m === 'ppf') return quantOf(D, a, P);
  if (m === 'median') return quantOf(D, 0.5, P);
  if (m === 'mean') return D.mean(P);
  if (m === 'var') return D.var(P);
}});
console.log(JSON.stringify(out));
"""
res = json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout)
worst = (0, None)
for (jsid, P, sp, meth, arg), v in zip(CASES, res):
    ref = float(getattr(sp, meth)() if arg is None else getattr(sp, meth)(arg))
    err = abs(v - ref) / max(abs(ref), 1e-300) if ref != 0 else abs(v)
    if err > worst[0]:
        worst = (err, f'{jsid} {P} {meth}({arg}): JS {v!r}, SciPy {ref!r}')
    if err > 1e-9:
        print('РАСХОЖДЕНИЕ', jsid, P, meth, arg, v, ref)
print(f'точек: {len(CASES)}; худшее относительное расхождение {worst[0]:.2e} — {worst[1]}')
