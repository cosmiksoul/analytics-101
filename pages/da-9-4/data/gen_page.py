"""Данные страницы 9.4 «Метрики роста и дерево метрик».

Считает по учебному журналу data/events (соглашения темы: без дублей event_id, без ботов, минский день,
человек = аккаунт со склейкой устройств, выручка — только серверный order_paid) всё, что показывают
сцена, интерактив и текст, запускает код страницы (decompose.py, active.sql) и вписывает данные и
настоящий вывод в page.js между /*data:start*/ и /*data:end*/. Повторный запуск даёт тот же файл.

python3 pages/da-9-4/data/gen_page.py
"""
import json, re, subprocess
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).parent
EV = HERE.parents[2] / 'data' / 'events'
PAGE = HERE.parent / 'page.js'

# ---------- журнал по соглашениям темы ----------
e = pd.read_parquet(EV / 'events.parquet').drop_duplicates('event_id')
e['day'] = e.event_time.dt.tz_convert('Europe/Minsk').dt.tz_localize(None).dt.normalize()
per_day = e[e.origin == 'client'].groupby(['anonymous_id', 'day']).size()
bots = per_day[per_day > 100].index.get_level_values(0).unique()
assert len(bots) == 6
e = e[~e.anonymous_id.isin(bots) & e.day.between('2026-01-05', '2026-06-28')].copy()
dev = e.dropna(subset=['anonymous_id', 'user_id']).groupby('anonymous_id').user_id.first()
e['person'] = e.user_id.fillna(e.anonymous_id.map(dev)).fillna(e.anonymous_id)
e['week'] = e.day.dt.to_period('W').dt.start_time
paid = e[e.event_name == 'order_paid']
users = pd.read_csv(EV / 'users.csv', parse_dates=['signup_time'])
users['sday'] = users.signup_time.dt.tz_convert('Europe/Minsk').dt.tz_localize(None).dt.normalize()
old = set(users.user_id[users.sday < '2026-01-05'])

WEEKS = sorted(e.week.unique())
W0, W1 = pd.Timestamp('2026-05-25'), pd.Timestamp('2026-06-01')
PL = ['android', 'ios', 'web']
PLN = {'android': 'Android', 'ios': 'iOS', 'web': 'сайт'}

# ---------- DAU, MAU, липкость ----------
dau = e.groupby('day').person.nunique()
mau = e.groupby(e.day.dt.to_period('M')).person.nunique()
dau_m = dau.groupby(dau.index.to_period('M')).mean()
MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь']
months = [{'m': MONTHS[i], 'dau': round(float(dau_m.iloc[i]), 1), 'mau': int(mau.iloc[i]),
           'st': round(float(dau_m.iloc[i] / mau.iloc[i]), 3)} for i in range(6)]
dau_u = e.dropna(subset=['user_id']).groupby('day').user_id.nunique()
dau_acc_ratio = round(float(dau_u.sum() / dau.sum()), 2)

# ---------- баланс активных по неделям ----------
pw = e[['person', 'week']].drop_duplicates()
first = pw.groupby('person').week.min()
S = {w: set(pw.person[pw.week == w]) for w in WEEKS}
bal = []
for i, w in enumerate(WEEKS):
    cur, prev = S[w], (S[WEEKS[i - 1]] if i else set())
    new = {p for p in cur if first[p] == w and p not in old}
    kept = cur & prev
    back = cur - prev - new
    gone = prev - cur
    bal.append({'w': w, 'wau': len(cur), 'new': len(new), 'kept': len(kept), 'back': len(back), 'gone': len(gone), 'prev': len(prev)})
bal = pd.DataFrame(bal).set_index('w')
assert ((bal.prev + bal.new + bal.back - bal.gone) == bal.wau).all()


# ---------- дерево: множители выручки ----------
def facts(week, platform=None):
    x = e[(e.week == week) & ((e.platform == platform) if platform else True)]
    p = x[x.event_name == 'order_paid']
    A, P, O, R = x.person.nunique(), p.person.nunique(), p.order_id.nunique(), int(p.revenue.sum())
    return {'R': R, 'A': A, 'C': P / A, 'F': O / P, 'S': R / O, 'P': P, 'O': O}


series = {}                                 # недельные ряды каждого узла
for w in WEEKS:
    f = facts(w)
    for k in 'RACFS':
        series.setdefault(k, []).append(f[k])
    for pl in PL:
        f = facts(w, pl)
        for k in 'RCFS':
            series.setdefault(k + '_' + pl, []).append(f[k])
for k, col in (('new', 'new'), ('back', 'back'), ('kept', 'kept')):
    series[k] = list(bal[col])
series = pd.DataFrame(series, index=WEEKS)
pct = (series / series.shift(1) - 1) * 100
i1 = WEEKS.index(W1)
hist = pct.iloc[i1 - 12:i1]                 # 12 недельных изменений до сравнения: 9 марта … 25 мая
assert hist.index[0] == pd.Timestamp('2026-03-09') and hist.index[-1] == W0
band = pd.DataFrame({'lo': hist.mean() - 2 * hist.std(), 'hi': hist.mean() + 2 * hist.std(),
                     'min': hist.min(), 'max': hist.max()})

f0, f1 = facts(W0), facts(W1)
R0, R1 = f0['R'], f1['R']
dR = R1 - R0
L = (R1 - R0) / np.log(R1 / R0)
x0 = np.array([f0[k] for k in 'ACFS']); x1 = np.array([f1[k] for k in 'ACFS'])
logc = L * np.log(x1 / x0)


def chain(order):
    cur, out = x0.copy(), np.zeros(4)
    for i in order:
        b = cur.prod(); cur[i] = x1[i]; out[i] = cur.prod() - b
    return out


fwd, bwd = chain([0, 1, 2, 3]), chain([3, 2, 1, 0])
perm = np.array([chain(list(o)) for o in __import__('itertools').permutations(range(4))])
assert abs(logc.sum() - dR) < 1e-6 and abs(fwd.sum() - dR) < 1e-6
pf = {pl: (facts(W0, pl), facts(W1, pl)) for pl in PL}


def node(nid, label, kind, v0, v1, key, **kw):
    ch = (v1 / v0 - 1) * 100
    b = band.loc[key]
    d = {'id': nid, 'label': label, 'kind': kind, 'v0': round(float(v0), 4), 'v1': round(float(v1), 4),
         'ch': round(float(ch), 1), 'lo': round(float(b.lo), 1), 'hi': round(float(b.hi), 1),
         'mn': round(float(b['min']), 1), 'mx': round(float(b['max']), 1),
         'out': bool(ch < b.lo or ch > b.hi)}
    d.update(kw)
    return d


NAMES = {'A': 'Активные (WAU)', 'C': 'Доля платящих', 'F': 'Заказов на платящего', 'S': 'Средний чек, ₽'}
FMT = {'A': 'int', 'C': 'sh', 'F': 'r3', 'S': 'rub'}
mult = []
for i, k in enumerate('ACFS'):
    n = node(k, NAMES[k], FMT[k], f0[k], f1[k], k, c=[int(round(logc[i])), int(round(fwd[i])), int(round(bwd[i]))],
             cmin=int(round(perm[:, i].min())), cmax=int(round(perm[:, i].max())))
    if k == 'A':
        kids = []
        for kk, lab in (('new', 'новые'), ('back', 'вернувшиеся'), ('kept', 'удержанные')):
            a, b = int(bal.loc[W0, kk]), int(bal.loc[W1, kk])
            kids.append(node(kk, lab, 'int', a, b, kk, gain=int(round(-R1 * (b - a) / f1['A']))))
        n['kids'] = kids
        n['gone'] = [int(bal.loc[W0, 'gone']), int(bal.loc[W1, 'gone'])]
    else:
        n['kids'] = [node(k + '_' + pl, PLN[pl], FMT[k], pf[pl][0][k], pf[pl][1][k], k + '_' + pl,
                          gain=int(round(pf[pl][1]['R'] * (pf[pl][0][k] / pf[pl][1][k] - 1))))
                     for pl in PL]
    mult.append(n)
plat = [node('R_' + pl, PLN[pl], 'rub', pf[pl][0]['R'], pf[pl][1]['R'], 'R_' + pl,
             gain=int(pf[pl][0]['R'] - pf[pl][1]['R'])) for pl in PL]
root = node('R', 'Выручка, ₽', 'rub', R0, R1, 'R', d=int(dR))

# лист, который объясняет падение: за коридором и возвращает больше половины падения
found = [k['id'] for m in mult for k in m['kids'] if k['out'] and k['gain'] >= 0.5 * abs(dR)]
assert found == ['C_android'], found

# ---------- защитная метрика, тщеславные метрики, среднее и медиана ----------
ff = e[e.event_name.isin(['payment_failed', 'order_paid'])]
def fail_share(w, pl):
    x = ff[(ff.week == w) & (ff.platform == pl)].event_name.value_counts()
    return int(x.get('payment_failed', 0)), int(x.get('order_paid', 0))
fails = {pl: [fail_share(W0, pl), fail_share(W1, pl)] for pl in PL}
fd = ff[(ff.platform == 'android') & (ff.day == '2026-06-02')].event_name.value_counts()
fail_jun2 = round(float(fd['payment_failed'] / fd.sum()) * 100)

raw = pd.read_parquet(EV / 'events.parquet')
raw['day'] = raw.event_time.dt.tz_convert('Europe/Minsk').dt.tz_localize(None).dt.normalize()
raw['week'] = raw.day.dt.to_period('W').dt.start_time
pv_raw = raw[raw.event_name == 'product_view'].groupby('week').size()
pv = e[e.event_name == 'product_view'].groupby('week').size()
acc_total = [int((users.sday <= w + pd.Timedelta(days=6)).sum()) for w in (W0, W1)]

mm = {}
for w, nm in ((W0, 'w0'), (W1, 'w1')):
    p = paid[paid.week == w]
    mm[nm] = {'check_mean': round(float(p.revenue.mean())), 'check_med': float(p.revenue.median()),
              'opp_mean': round(float(p.groupby('person').order_id.nunique().mean()), 3),
              'opp_med': float(p.groupby('person').order_id.nunique().median())}

DATA = {
    'months': months, 'dauAcc': dau_acc_ratio,
    'bal': [{'w': w.strftime('%d.%m'), 'prev': int(r.prev), 'new': int(r.new), 'kept': int(r.kept), 'back': int(r.back),
             'gone': int(r.gone), 'wau': int(r.wau)} for w, r in bal.loc['2026-05-04':].iterrows()],
    'root': root, 'mult': mult, 'plat': plat, 'found': found[0],
    'pay': {k: [f0[k], f1[k]] for k in ('P', 'O')},
    'fails': fails, 'failJun2': fail_jun2,
    'pv': {'raw': [int(pv_raw[W0]), int(pv_raw[W1])], 'clean': [int(pv[W0]), int(pv[W1])]},
    'orders': [f0['O'], f1['O']], 'acc': acc_total, 'mm': mm,
}

# ---------- код страницы: запуск и настоящий вывод ----------
dec = subprocess.run(['python3', str(HERE / 'decompose.py')], cwd=EV.parents[1], capture_output=True, text=True, check=True).stdout.rstrip()
sql = (HERE / 'active.sql').read_text(encoding='utf-8')
psql = subprocess.run(['psql', '-h', '/tmp', '-U', 'postgres', '-d', 'events', '-P', 'pager=off', '-P', 'null=NULL', '-f', str(HERE / 'active.sql')],
                      capture_output=True, text=True, check=True).stdout.rstrip()
parts = psql.split('\n\n')
assert parts[0].startswith('SELECT 45250'), parts[0][:40]
OUT = {'decompose': dec, 'dau': parts[0], 'balance': parts[1],
       'decompose_src': (HERE / 'decompose.py').read_text(encoding='utf-8').rstrip(),
       'sql_dau': sql[sql.index('-- 1.'):sql.index('-- 3.')].rstrip(), 'sql_bal': sql[sql.index('-- 3.'):].rstrip()}

blob = 'const DATA = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n  const OUT = ' + json.dumps(OUT, ensure_ascii=False) + ';'
src = PAGE.read_text(encoding='utf-8')
src = re.sub(r'/\*data:start\*/.*?/\*data:end\*/', lambda _: '/*data:start*/' + blob + '/*data:end*/', src, flags=re.S)
PAGE.write_text(src, encoding='utf-8')

# сводка для текста страницы
print(pd.DataFrame(months).to_string(index=False))
print(bal.loc['2026-05-04':].to_string())
print('DAU только по аккаунтам / DAU со склейкой:', dau_acc_ratio)
print('root', root)
for m in mult:
    print(m['id'], m['v0'], m['v1'], m['ch'], (m['lo'], m['hi']), m['out'], m['c'], (m['cmin'], m['cmax']))
    for k in m['kids']:
        print('    ', k['id'], k['v0'], k['v1'], k['ch'], (k['lo'], k['hi']), (k['mn'], k['mx']), 'OUT' if k['out'] else '', k['gain'])
for p in plat:
    print('  plat', p['id'], p['v0'], p['v1'], p['ch'], (p['lo'], p['hi']), (p['mn'], p['mx']), 'OUT' if p['out'] else '', p['gain'])
print('fails', fails, 'jun2', fail_jun2, 'pv', DATA['pv'], 'orders', DATA['orders'], 'acc', acc_total, 'mm', mm)
print(OUT['decompose']); print(OUT['dau']); print(OUT['balance'])
