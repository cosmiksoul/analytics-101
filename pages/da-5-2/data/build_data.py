"""Данные страницы 5.2 «Случайные величины и распределения».

Запуск: python3 pages/da-5-2/data/build_data.py
Что делает:
1. запускает блоки кода из code/*.py из корня учебника (пути в коде — data/probability/…) и берёт настоящий вывод;
2. считает данные сцены (гистограммы по мере роста выборки, кривые SciPy при разных параметрах);
3. считает данные интерактива (гистограмма чеков, хвост, лучшие подборы);
4. строит точки Q–Q-графика и SVG к нему.
Результат вписывается в page.js между /*gen:start*/ и /*gen:end*/ и в article.html между <!--qq:start--> и <!--qq:end-->.
Учебные данные не меняются: файлы только читаются.
"""
import json
import re
import subprocess
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
DATA = PAGE.parents[1] / 'data' / 'probability'
CODE_ORDER = ['density', 'var_sum', 'log_normal', 'mean_median', 'scipy_basics', 'daily', 'fit_qq']


def r(v, d=4):
    return float(np.round(v, d))


def g4(a):
    """Короткая запись плотностей: четыре значащие цифры."""
    return [float(f'{x:.4g}') for x in a]


# ---------- 1. блоки кода: запуск и вывод ----------
code = {}
for name in CODE_ORDER:
    src = (HERE / 'code' / f'{name}.py').read_text(encoding='utf-8').rstrip('\n')
    res = subprocess.run(['python3', '-I', str(HERE / 'code' / f'{name}.py')], cwd=PAGE.parents[1], capture_output=True, text=True, check=True)
    code[name] = {'code': src, 'out': res.stdout.rstrip('\n')}

# ---------- 2. сцена ----------
bought = pd.read_csv(DATA / 'visits.csv')['bought'].to_numpy()
series = bought.reshape(1000, 100).sum(axis=1)          # покупок в каждой сотне визитов, по порядку файла
gaps = pd.read_csv(DATA / 'order_gaps.csv')['gap_days'].to_numpy()
amount = pd.read_csv(DATA / 'checks.csv')['amount'].to_numpy()


def grow(x, edges, steps=25, *, include_last=True):
    """Гистограмма первых n наблюдений при n = N/steps … N, бегущие среднее и медиана."""
    n_all = len(x)
    out = {'n': [], 'h': [], 'mean': [], 'med': []}
    for j in range(1, steps + 1):
        n = round(n_all * j / steps)
        part = x[:n]
        out['n'].append(n)
        visible = part if include_last else part[part < edges[-1]]
        out['h'].append(np.histogram(visible, bins=edges)[0].astype(int).tolist())
        out['mean'].append(r(part.mean(), 3))
        out['med'].append(r(np.median(part), 3))
    return out


P_HAT = 0.034
kk = np.arange(0, 13)
binom_frames = []
for n in range(100, 1001, 100):
    d = stats.binom(n, P_HAT)
    binom_frames.append({'n': n, 'pmf': [int(round(v * 1e4)) for v in d.pmf(np.arange(0, 61))], 'mean': r(d.mean(), 1), 'med': int(d.median())})  # pmf · 10⁴

x_gap = np.arange(0, 60.01, 0.5)
gap_frames = []
for m in [12, 11, 10, 9, 8, 7, 6]:
    d = stats.expon(scale=m)
    gap_frames.append({'m': m, 'pdf': [int(round(v * 1e5)) for v in d.pdf(x_gap)], 'mean': m, 'med': r(d.median(), 2)})  # плотность · 10⁵

x_chk = np.arange(0, 30000.1, 250)
chk_frames = []
for s in np.round(np.arange(0.3, 1.001, 0.1), 1):
    d = stats.lognorm(s, scale=3200)
    chk_frames.append({'s': float(s), 'pdf': [int(round(v * 1e7)) for v in d.pdf(x_chk)], 'mean': round(float(d.mean())), 'med': 3200})  # плотность · 10⁷

gap_edges = np.arange(0, 60.01, 2)
chk_edges = np.arange(0, 30001, 500)
scene = {
    'coin': bought[:100].astype(int).tolist(),
    'first': series[:8].astype(int).tolist(),
    'pHat': r(bought.mean(), 4),
    'binGrow': grow(series, np.arange(-0.5, 13.5, 1)),
    'binPmf': [r(v) for v in stats.binom(100, P_HAT).pmf(kk)],
    'scale': {'binFrames': 1e4, 'gapFrames': 1e5, 'chkFrames': 1e7},
    'binFrames': binom_frames,
    'binStats': {'mean': r(series.mean(), 3), 'med': int(np.median(series)), 'p95': r(np.quantile(series, 0.95), 2), 'max': int(series.max())},
    'gapGrow': grow(gaps, gap_edges),
    'gapFrames': gap_frames,
    'gapStats': {'mean': r(gaps.mean(), 2), 'med': r(np.median(gaps), 2), 'p95': r(np.quantile(gaps, 0.95), 2),
                 'le7': r((gaps <= 7).mean(), 4), 'le7model': r(stats.expon(scale=12).cdf(7), 4), 'over60': r((gaps > 60).mean(), 4)},
    'chkGrow': grow(amount, chk_edges, include_last=False),
    'chkFrames': chk_frames,
    'chkStats': {'mean': round(float(amount.mean())), 'med': int(np.median(amount)), 'p95': round(float(np.quantile(amount, 0.95))),
                 'max': int(amount.max()), 'over30': r((amount >= 30000).mean(), 4)},
}

# ---------- 3. интерактив: чеки ----------
hist = np.histogram(amount[amount < chk_edges[-1]], bins=chk_edges)[0] / len(amount)
tail_edges = [10000, 15000, 25000, 50000, np.inf]
tail = [r(((amount >= a) & (amount < b)).mean(), 4) for a, b in zip(tail_edges[:-1], tail_edges[1:])]


def tv(dist):
    m = np.diff(dist.cdf(chk_edges))
    m = np.append(m, dist.sf(30000))
    return 0.5 * (dist.cdf(0) + np.abs(np.append(hist, (amount >= 30000).mean()) - m).sum())


best_ln = min((tv(stats.lognorm(s, scale=md)), md, s) for md in range(2000, 5001, 50) for s in np.round(np.arange(0.3, 1.21, 0.01), 2))
best_no = min((tv(stats.norm(mu, sd)), mu, sd) for mu in range(1000, 8001, 100) for sd in range(500, 8001, 100))
best_ex = min((tv(stats.expon(scale=m)), m) for m in range(500, 10001, 50))
s_mle, _, sc_mle = stats.lognorm.fit(amount, floc=0)
checks = {
    'bins': [r(v, 5) for v in hist], 'over30': r((amount >= 30000).mean(), 5), 'tail': tail,
    'mean': round(float(amount.mean())), 'med': int(np.median(amount)), 'sd': round(float(amount.std())),
    'p95': round(float(np.quantile(amount, 0.95))), 'over15': r((amount > 15000).mean(), 4),
    'best': {'ln': [r(best_ln[0], 4), best_ln[1], float(best_ln[2])], 'norm': [r(best_no[0], 4), best_no[1], best_no[2]], 'exp': [r(best_ex[0], 4), best_ex[1]]},
    'mle': [r(s_mle, 3), round(float(sc_mle)), r(tv(stats.lognorm(s_mle, scale=sc_mle)), 4)],
}

# ---------- 4. Q–Q-график: те же точки, что в fit_qq.py ----------
model = stats.lognorm(s_mle, scale=sc_mle)
probs = (np.arange(1, 400) - 0.5) / 399
qx, qy = model.ppf(probs), np.quantile(amount, probs)
W, H, L, R, T, B = 480, 360, 54, 16, 14, 46
lo, hi = np.log10(100), np.log10(100000)
X = lambda v: L + (np.log10(v) - lo) / (hi - lo) * (W - L - R)
Y = lambda v: H - B - (np.log10(v) - lo) / (hi - lo) * (H - T - B)
ticks = [100, 300, 1000, 3000, 10000, 30000, 100000]
lab = lambda v: f'{v:,}'.replace(',', ' ')
tlab = lambda v: f'{v / 1000:g}'.replace('.', ',')   # подписи осей в тысячах рублей
svg = [f'<svg class="d52-qq" viewBox="0 0 {W} {H}" role="img" aria-label="Q–Q-график: квантили логнормальной модели по горизонтали и квантили чеков по вертикали, обе оси в логарифмическом масштабе. На уровне 0,95 значения близки. На уровне 0,99 выборочный квантиль выше модельного.">']
for v in ticks:
    svg.append(f'<line class="d52-gr" x1="{X(v):.1f}" y1="{T}" x2="{X(v):.1f}" y2="{H - B}"/><line class="d52-gr" x1="{L}" y1="{Y(v):.1f}" x2="{W - R}" y2="{Y(v):.1f}"/>')
    anc = 'end' if v == ticks[-1] else 'middle'
    svg.append(f'<text class="d52-tk" x="{X(v):.1f}" y="{H - B + 16}" text-anchor="{anc}">{tlab(v)}</text><text class="d52-tk" x="{L - 6}" y="{Y(v) + 4:.1f}" text-anchor="end">{tlab(v)}</text>')
svg.append(f'<line class="d52-diag" x1="{X(100):.1f}" y1="{Y(100):.1f}" x2="{X(100000):.1f}" y2="{Y(100000):.1f}"/>')
path = ''.join(f'M{X(a):.0f} {Y(b):.0f}h0' for a, b in zip(qx, qy))
svg.append(f'<path class="d52-pts" d="{path}"/>')
mx99, dy99 = model.ppf(0.99), np.quantile(amount, 0.99)          # те же числа, что в таблице fit_qq.py
svg.append(f'<text class="d52-an" x="{X(mx99) - 12:.1f}" y="{Y(dy99) - 30:.1f}" text-anchor="end"><tspan>99-й перцентиль:</tspan><tspan x="{X(mx99) - 12:.1f}" dy="1.2em">чеки {lab(int(round(dy99, -1)))} ₽, модель {lab(int(round(mx99, -1)))} ₽</tspan></text>')
svg.append(f'<circle class="d52-hl" cx="{X(mx99):.1f}" cy="{Y(dy99):.1f}" r="6"/>')
svg.append(f'<text class="d52-an d52-an2" x="{X(1500):.1f}" y="{Y(600):.1f}">средние квантили</text><text class="d52-an d52-an2" x="{X(1500):.1f}" y="{Y(600) + 16:.1f}">близки к модели</text>')
svg.append(f'<text class="d52-ax" x="{(L + W - R) / 2:.0f}" y="{H - 8}" text-anchor="middle">квантиль модели, тыс. ₽ (шкала логарифмическая)</text>')
svg.append(f'<text class="d52-ax" transform="translate(14 {(T + H - B) / 2:.0f}) rotate(-90)" text-anchor="middle">квантиль чеков, тыс. ₽</text>')
svg.append('</svg>')
qq_html = ('<figure class="d52-fig wide"><figcaption>Модель занижает 99-й перцентиль суммы покупки</figcaption>\n'
           + ''.join(svg) + '\n<p class="d52-figsub">Каждая из 399 точек соответствует уровню p = (i − 0,5) / 399, где i меняется от 1 до 399. На диагонали квантиль модели равен выборочному квантилю.</p></figure>')

# ---------- запись ----------
gen = {'scene': scene, 'checks': checks, 'code': code}
js = '/*gen:start*/\n  const GEN = ' + json.dumps(gen, ensure_ascii=False, separators=(',', ':')) + ';\n  /*gen:end*/'
pj = PAGE / 'page.js'
t = pj.read_text(encoding='utf-8')
t = re.sub(r'/\*gen:start\*/.*?/\*gen:end\*/', lambda m: js, t, flags=re.S)
pj.write_text(t, encoding='utf-8')
ah = PAGE / 'article.html'
t = ah.read_text(encoding='utf-8')
t = re.sub(r'<!--qq:start-->.*?<!--qq:end-->', lambda m: '<!--qq:start-->' + qq_html + '<!--qq:end-->', t, flags=re.S)
ah.write_text(t, encoding='utf-8')
print('GEN', len(js) // 1024, 'КБ; Q–Q SVG', len(qq_html) // 1024, 'КБ')
print('лучшие подборы:', checks['best'], 'MLE', checks['mle'])
print('хвост чеков:', tail, 'дороже 15 000:', checks['over15'])
