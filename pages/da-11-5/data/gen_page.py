"""Данные страницы 11.5 «Ускорение: CUPED и последовательные тесты».

Считает по учебным данным data/ab (эксперимент checkout_v2, без ботов, группа по exposures.csv) всё,
что показывают сцена, интерактив и текст, берёт границы и симуляцию последовательных тестов из sequential_sim.py
(A/A — общий набор data/ab/aa_sim.py, как на 11.4), запускает код страницы (code/cuped.py, code/sequential.py, code/bayes.py — из папки
data/ab) и вписывает данные и настоящий вывод в page.js между /*data:start*/ и /*data:end*/.
Повторный запуск даёт тот же файл.

python3 pages/da-11-5/data/gen_page.py
"""
import json, os, re, subprocess, sys
from pathlib import Path
import numpy as np
import pandas as pd
from scipy import optimize, stats
import statsmodels.formula.api as smf

HERE = Path(__file__).resolve().parent
AB = HERE.parents[2] / 'data' / 'ab'
PAGE = HERE.parent / 'page.js'
CODE = HERE / 'code'
R = lambda v, d=0: round(float(v), d) if d else int(round(float(v)))
BOTS = ['u_025389', 'u_053191', 'u_055948']

# ---------------------------------------------------------------- данные checkout_v2
s = pd.read_parquet(AB / 'sessions.parquet')
e = pd.read_csv(AB / 'exposures.csv', parse_dates=['exposed_at'])
u = pd.read_csv(AB / 'users.csv', dtype={'app_version': str}, parse_dates=['signup_date'])
pre = pd.read_csv(AB / 'pre_period.csv').set_index('user_id')
ex = e[(e.experiment == 'checkout_v2') & ~e.user_id.isin(BOTS)].set_index('user_id').sort_index()
ss = s[(s.experiment == 'checkout_v2') & ~s.user_id.isin(BOTS)].copy()
start = pd.Timestamp('2026-09-07', tz='Europe/Minsk')
ss['day'] = (ss.session_start.dt.tz_convert('Europe/Minsk') - start).dt.days
ex['day'] = (ex.exposed_at.dt.tz_convert('Europe/Minsk') - start).dt.days
g = ss.groupby('user_id').agg(rev=('revenue', 'sum'), conv=('converted', 'max'), sess=('session_id', 'size'),
                              orders=('orders', 'sum'))
d = ex[['group', 'day']].join(g).fillna({'rev': 0, 'conv': 0, 'sess': 0, 'orders': 0})
d = d.join(pre).join(u.set_index('user_id')[['signup_date', 'platform']])
d['haspre'] = d.sessions_pre.notna()
d[['sessions_pre', 'orders_pre', 'revenue_pre']] = d[['sessions_pre', 'orders_pre', 'revenue_pre']].fillna(0)
d['new'] = (d.signup_date >= pd.Timestamp('2026-09-07')).astype(int)
d['B'] = (d.group == 'B').astype(int)
A_, B_ = d.group == 'A', d.group == 'B'
assert len(d) == 56797 and A_.sum() == 28439 and B_.sum() == 28358


def eff(y):
    a, b = y[A_], y[B_]
    diff, se = b.mean() - a.mean(), np.sqrt(a.var() / len(a) + b.var() / len(b))
    return diff, se


X, Y = d.revenue_pre, d.rev
theta = np.cov(X, Y)[0, 1] / X.var()
rho = np.corrcoef(X, Y)[0, 1]
YC = Y - theta * (X - X.mean())
e0, s0 = eff(Y)
e1, s1 = eff(YC)
ratio = YC.var() / Y.var()
cup = {'n': len(d), 'nA': int(A_.sum()), 'nB': int(B_.sum()), 'meanA': R(Y[A_].mean(), 1), 'meanB': R(Y[B_].mean(), 1),
       'eff': R(e0, 1), 'lo': R(e0 - 1.96 * s0, 1), 'hi': R(e0 + 1.96 * s0, 1), 'z': R(e0 / s0, 2), 'hw': R(1.96 * s0, 1),
       'effC': R(e1, 1), 'loC': R(e1 - 1.96 * s1, 1), 'hiC': R(e1 + 1.96 * s1, 1), 'zC': R(e1 / s1, 2), 'hwC': R(1.96 * s1, 1),
       'theta': R(theta, 3), 'rho': R(rho, 3), 'xbar': R(X.mean(), 1), 'ybar': R(Y.mean(), 1), 'shift': R(theta * X.mean()),
       'sd': R(Y.std()), 'sdC': R(YC.std()), 'red': R((1 - ratio) * 100, 1), 'sdRed': R((1 - np.sqrt(ratio)) * 100, 1),
       'days': R(28 * ratio, 1), 'mdeRed': R((1 - np.sqrt(ratio)) * 100), 'rel': R(e0 / Y[A_].mean() * 100, 1)}
assert cup['red'] == 21.4 and cup['zC'] == 1.66 and cup['days'] == 22.0
# ρ для 17 дней и другие метрики со своей ковариатой
r_conv = np.corrcoef(d.orders_pre, d.conv)[0, 1]
r_sess = np.corrcoef(d.sessions_pre, d.sess)[0, 1]
oth = {'rhoConv': R(r_conv, 2), 'daysConv': R(28 * (1 - r_conv ** 2), 1), 'rhoSess': R(r_sess, 2),
       'daysSess': R(28 * (1 - r_sess ** 2), 1), 'rho17': R(np.sqrt(1 - 17 / 28), 4)}
# CUPED конверсии по orders_pre
xc = d.orders_pre
cc = d.conv - np.cov(xc, d.conv)[0, 1] / xc.var() * (xc - xc.mean())
ec0, sc0 = eff(d.conv)
ec1, sc1 = eff(cc)
oth.update({'convRed': R((1 - cc.var() / d.conv.var()) * 100, 1), 'convZ': R(ec0 / sc0, 2), 'convZC': R(ec1 / sc1, 2),
            'convA': R(d.conv[A_].mean() * 100, 2), 'convB': R(d.conv[B_].mean() * 100, 2), 'convEff': R(ec0 * 100, 2)})

# нули, новички, хвост
zz = (X == 0) & (Y == 0)
cov_c = ((X - X.mean()) * (Y - Y.mean())).sort_values(ascending=False)
top50 = cov_c.index[:50]
m50 = ~d.index.isin(top50)
zero = {'zz': int(zz.sum()), 'zzShare': R(zz.mean() * 100, 1), 'new': int(d.new.sum()), 'newShare': R(d.new.mean() * 100, 1),
        'haspre': R(d.haspre.mean() * 100, 1), 'preBuy': R((X > 0).mean() * 100, 1), 'oldNoPre': R(((d.new == 0) & ~d.haspre).mean() * 100, 1),
        'top50': R(cov_c.iloc[:50].sum() / cov_c.sum() * 100), 'rhoNo50': R(np.corrcoef(X[m50], Y[m50])[0, 1], 2),
        'top1var': R(((Y - Y.mean()) ** 2).sort_values(ascending=False).iloc[:len(d) // 100].sum() / ((Y - Y.mean()) ** 2).sum() * 100)}
seg = {}
for nm, mask in [('new', d.new == 1), ('old', d.new == 0)]:
    seg[nm] = R((1 - YC[mask].var() / Y[mask].var()) * 100, 1)
seg['newVar'] = R(Y[d.new == 1].var() * (d.new == 1).sum() / (Y.var() * len(d)) * 100, 1)
zero['seg'] = seg

# три способа: обрезка хвоста, стратификация, ковариаты
cap = Y.quantile(.99)
yw = Y.clip(upper=cap)
ew, sw = eff(yw)
d['stratum'] = np.where(d.new == 1, 'new', np.where(d.revenue_pre > 0, 'buyer', 'old0'))
within = d.groupby('stratum').rev.transform('mean')
wplat = d.groupby('platform').rev.transform('mean')
w = d.stratum.value_counts(normalize=True)
mm = d.groupby(['stratum', 'group']).rev.agg(['mean', 'var', 'size'])
est = sum(w[k] * (mm.loc[(k, 'B'), 'mean'] - mm.loc[(k, 'A'), 'mean']) for k in w.index)
sest = np.sqrt(sum(w[k] ** 2 * (mm.loc[(k, 'B'), 'var'] / mm.loc[(k, 'B'), 'size'] + mm.loc[(k, 'A'), 'var'] / mm.loc[(k, 'A'), 'size']) for k in w.index))
multi = smf.ols('rev ~ B + revenue_pre + orders_pre + sessions_pre + new + C(platform)', d).fit()
ways = {'cap': R(cap), 'capRed': R((1 - yw.var() / Y.var()) * 100), 'capEff': R(ew, 1), 'capZ': R(ew / sw, 2),
        'capRel': R(ew / yw[A_].mean() * 100, 1),
        'stratRed': R((1 - (Y - within).var() / Y.var()) * 100, 1), 'platRed': R((1 - (Y - wplat).var() / Y.var()) * 100, 1),
        'stratEff': R(est, 1), 'stratZ': R(est / sest, 2),
        'multiRed': R((1 - multi.resid.var() / Y.var()) * 100, 1), 'multiEff': R(multi.params['B'], 1), 'multiZ': R(multi.params['B'] / multi.bse['B'], 2),
        'strat': {k: R(v * 100, 1) for k, v in w.items()}}

# если честно урезать тест: относительная точность CUPED к дню T против 28 дней без CUPED
rel = {}
for T in range(14, 29):
    us = d[d.day < T].copy()
    gt = ss[ss.day < T].groupby('user_id').revenue.sum()
    yt = gt.reindex(us.index).fillna(0)
    xt = us.revenue_pre
    yct = yt - np.cov(xt, yt)[0, 1] / xt.var() * (xt - xt.mean())
    a, b = us.group == 'A', us.group == 'B'
    se_t = lambda v: np.sqrt(v[a].var() / a.sum() + v[b].var() / b.sum())
    rel[T] = (se_t(yt) / yt.mean(), se_t(yct) / yt.mean())
target = rel[28][0]
cut = min(T for T in rel if rel[T][1] <= target)
ways['cutDay'] = cut
ways['cutStable'] = max(T for T in rel if rel[T][1] > target) + 1    # дальше уже всегда не хуже

# ---------------------------------------------------------------- сцена: точки облака
THR, STEP = 20000, 50
big = d[(X >= THR) | (Y >= THR)]
rest = d.drop(big.index)
rng_sc = np.random.default_rng(11505)
pick = rest.iloc[np.sort(rng_sc.choice(len(rest), len(rest) // STEP, replace=False))]
pick = pick[(pick.revenue_pre > 0) | (pick.rev > 0)]
B64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'


def enc(v, n):
    v = int(v)
    assert 0 <= v < 64 ** n, v
    return ''.join(B64[(v // 64 ** i) % 64] for i in reversed(range(n)))


pts = []
for kind, frame in (('1', big), ('0', pick)):
    for uid, r in frame.iterrows():
        assert r.revenue_pre % 10 == 0 and r.rev % 10 == 0
        flag = int(kind) + 2 * int(r.new)
        pts.append(enc(r.revenue_pre // 10, 3) + enc(r.rev // 10, 3) + str(flag))
scene = {'pts': ''.join(pts), 'nBig': len(big), 'nPick': len(pick), 'nRest': len(rest), 'thr': THR, 'step': STEP,
         'newBig': int(big.new.sum()), 'maxY': R(Y.max()), 'maxX': R(X.max()),
         'beyond': int(((big.revenue_pre > 250000) | (big.rev > 250000)).sum())}

# ---------------------------------------------------------------- последовательные тесты
# Границы и симуляция — в sequential_sim.py (этот же файл идёт в материалы читателя). A/A-тесты — общий набор темы
# data/ab/aa_sim.py: те же прогоны и та же сотня показанных тестов, что на странице 11.4.
sys.path.insert(0, str(HERE))
import sequential_sim as SS  # noqa: E402

sq = SS.compute()
KS, N, P, RUNS, DELTA, TAU = SS.KS, SS.N, SS.P, SS.RUNS, sq['delta'], sq['tau']
POC, OBF, AV, rates, shown, infl, bayes_peek = sq['poc'], sq['obf'], sq['av'], sq['rates'], sq['shown'], sq['infl'], sq['bayes']


def enc_paths(z):
    v = np.clip(np.round(z * 100).astype(int), -2047, 2047) + 2048
    return ''.join(enc(x, 2) for x in v.ravel())


seq = {'N': N, 'p': P, 'delta': DELTA, 'tau': TAU, 'runs': RUNS, 'ks': KS,
       'poc': {K: R(POC[K], 3) for K in KS}, 'obf': {K: R(OBF[K], 3) for K in KS}, 'av': [R(v, 3) for v in AV],
       'rates': rates, 'shown': shown, 'infl': infl, 'bayesPeek': bayes_peek,
       'aa': enc_paths(sq['z_aa']), 'ab': enc_paths(sq['z_ab'])}

# ---------------------------------------------------------------- облако для интерактива (стандартизовано точно)
rng_c = np.random.default_rng(115)
M = rng_c.normal(size=(120, 2))
M -= M.mean(0)
q, _ = np.linalg.qr(M)                      # два ортогональных столбца с нулевым средним
q *= np.sqrt(len(M) - 1)                    # выборочная дисперсия ровно 1
cloud = ''.join(enc(R((v + 4) * 400), 2) for v in q.ravel())

# ---------------------------------------------------------------- код страницы: запуск
OUT = {}
for name in ['cuped', 'sequential', 'bayes']:
    src = (CODE / f'{name}.py').read_text(encoding='utf-8')
    res = subprocess.run([sys.executable, str(CODE / f'{name}.py')], cwd=AB.parents[1], capture_output=True, encoding="utf-8", env={**os.environ, "PYTHONIOENCODING": "utf-8"}, check=True)
    OUT[name + '_py'] = src.rstrip('\n')
    OUT[name] = res.stdout.rstrip('\n')
weeks = []
for line in OUT['sequential'].splitlines()[1:]:
    p = line.split()
    weeks.append({'day': int(p[0]), 'n': int(p[1]), 'eff': float(p[2]), 'z': float(p[3]), 't': float(p[4]),
                  'obf': float(p[5]), 'poc': float(p[6])})
# недельные z для выручки с CUPED — для текста
wk_rev = []
for T in [7, 14, 21, 28]:
    us = d[d.day < T]
    yt = ss[ss.day < T].groupby('user_id').revenue.sum().reindex(us.index).fillna(0)
    xt = us.revenue_pre
    yct = yt - np.cov(xt, yt)[0, 1] / xt.var() * (xt - xt.mean())
    a, b = us.group == 'A', us.group == 'B'
    wk_rev.append(R((yct[b].mean() - yct[a].mean()) / np.sqrt(yct[a].var() / a.sum() + yct[b].var() / b.sum()), 2))

DATA = {'cup': cup, 'oth': oth, 'zero': zero, 'ways': ways, 'scene': scene, 'seq': seq, 'cloud': cloud,
        'weeks': weeks, 'wkRev': wk_rev}
blob = '/*data:start*/const DATA = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n  const OUT = ' + \
       json.dumps(OUT, ensure_ascii=False) + ';/*data:end*/'
js = PAGE.read_text(encoding='utf-8')
js2 = re.sub(r'/\*data:start\*/.*?/\*data:end\*/', lambda _: blob, js, flags=re.S)
assert js2 != js or blob in js
PAGE.write_text(js2, encoding='utf-8')

print(json.dumps({k: v for k, v in DATA.items() if k not in ('scene', 'seq', 'cloud')}, ensure_ascii=False, indent=None))
print('scene', {k: v for k, v in scene.items() if k != 'pts'}, 'len pts', len(scene['pts']))
print('seq poc', seq['poc'], 'obf', seq['obf'], 'av day1/7/28', seq['av'][0], seq['av'][6], seq['av'][27], 'delta', DELTA)
print('rates', rates)
print('shown', shown)
print('infl', infl, 'bayesPeek', bayes_peek)
print('relSE', {T: tuple(round(x, 4) for x in v) for T, v in rel.items()})
print('sizes: aa', len(seq['aa']), 'cloud', len(cloud), 'blob KB', round(len(blob.encode()) / 1024, 1))
