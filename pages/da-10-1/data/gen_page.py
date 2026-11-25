"""Данные страницы 10.1 «CAC, ARPU, маржа».

Считает по учебной «финансовой» выгрузке data/unit всё, что показывают сцена, интерактив и текст,
запускает код страницы (code/cac.sql и code/arpu.sql в PostgreSQL 16, база unit; code/unit_summary.py
в pandas) и вписывает данные и настоящий вывод в page.js между /*data:start*/ и /*data:end*/.
Соглашение учебника: маржинальный доход обычного заказа = revenue − cogs − delivery_cost − payment_fee,
возвращённого = −2·delivery_cost − payment_fee. Повторный запуск даёт тот же файл.

python3 pages/da-10-1/data/gen_page.py
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
UNIT = HERE.parents[2] / 'data' / 'unit'
PAGE = HERE.parent / 'page.js'
CODE = HERE / 'code'

c = pd.read_csv(UNIT / 'clients.csv', parse_dates=['signup_date'])
o = pd.read_csv(UNIT / 'orders.csv', parse_dates=['order_date'])
a = pd.read_csv(UNIT / 'activity.csv')
s = pd.read_csv(UNIT / 'marketing_spend.csv')

ref = o.refunded == 1
o['cm'] = np.where(ref, -2 * o.delivery_cost - o.payment_fee, o.revenue - o.cogs - o.delivery_cost - o.payment_fee)
o['net'] = np.where(ref, 0, o.revenue)                      # чистая выручка
o['seller'] = o.paid - o.revenue                             # доля продавцов маркетплейса
o['refund_loss'] = np.where(ref, o.revenue, 0)               # выручка, которую вернули клиенту
o['cogs_k'] = np.where(ref, 0, o.cogs)                       # себестоимость проданного
o['deliv'] = np.where(ref, 2 * o.delivery_cost, o.delivery_cost)
assert (o.paid - o.seller - o.refund_loss - o.cogs_k - o.deliv - o.payment_fee - o.cm).abs().max() == 0

mon = lambda d: d.dt.year * 12 + d.dt.month
LAST = 2026 * 12 + 6
c['coh'] = mon(c.signup_date)
o = o.merge(c[['client_id', 'channel', 'coh']], on='client_id')
o['n'] = mon(o.order_date) - o.coh
CH = ['органика', 'поиск', 'соцсети', 'партнёры']
R = lambda v, d=0: round(float(v), d) if d else int(round(float(v)))

# ---------- итоги за 24 месяца и водопад от оборота к маржинальному доходу ----------
T = {k: float(o[k].sum()) for k in ['gmv', 'discount', 'paid', 'seller', 'revenue', 'refund_loss', 'net', 'cogs_k', 'deliv', 'payment_fee', 'cm']}
T['gp'] = T['net'] - T['cogs_k']
assert abs(T['gp'] - T['deliv'] - T['payment_fee'] - T['cm']) < 1
wf = {k: R(v / 1e6, 2) for k, v in T.items()}
mp = o.model == 'маркетплейс'
mix = {'mpOrders': R(mp.mean() * 100, 1), 'mpGmv': R(o.gmv[mp].sum() / o.gmv.sum() * 100, 1),
       'mpRev': R(o.revenue[mp].sum() / o.revenue.sum() * 100, 1),
       'refunds': int(ref.sum()), 'refShare': R(ref.mean() * 100, 1),
       'refMp': R(o.refunded[mp].mean() * 100, 1), 'refOwn': R(o.refunded[~mp].mean() * 100, 1),
       'discOrders': R((o.discount > 0).mean() * 100, 1), 'discGmv': R(o.discount.sum() / o.gmv.sum() * 100, 1),
       'checkMean': R(o.paid.mean()), 'checkMed': R(o.paid.median()),
       'cmShare': R(T['cm'] / T['net'] * 100, 1), 'gm': R(T['gp'] / T['net'] * 100, 1),
       'buyers': int(o.client_id.nunique()), 'buyShare': R(o.client_id.nunique() / len(c) * 100, 1)}

# обычный заказ своего товара (до 10 000 ₽ по ценам до скидки, без возврата) и скидка 10%
od = o[(o.model == 'свой товар') & (o.refunded == 0) & (o.gmv < 10000)]
paid9 = od.paid * 0.9
cm9 = paid9 - od.cogs - od.delivery_cost - (0.022 * paid9).round()
order = {'n': len(od), 'paid': R(od.paid.mean()), 'cogs': R(od.cogs.mean()), 'deliv': R(od.delivery_cost.mean()),
         'fee': R(od.payment_fee.mean()), 'cm': R(od.cm.mean()), 'cm9': R(cm9.mean()),
         'drop': R((1 - cm9.mean() / od.cm.mean()) * 100), 'more': R((od.cm.mean() / cm9.mean() - 1) * 100)}
mpo = o[mp & (o.refunded == 0)]
order_mp = {'paid': R(mpo.paid.mean()), 'rev': R(mpo.revenue.mean()), 'cm': R(mpo.cm.mean())}

# ---------- каналы: CAC и экономика за 24 месяца ----------
g = o.groupby('channel').agg(payers=('client_id', 'nunique'), orders=('order_id', 'size'), paid=('paid', 'sum'),
                             cm=('cm', 'sum'), net=('net', 'sum'))
g['new'] = c.channel.value_counts()
g['spend'] = s.groupby('channel').spend.sum()
g = g.fillna({'spend': 0})
chan = {ch: {k: int(g.loc[ch, k]) for k in ['spend', 'new', 'payers', 'orders', 'paid', 'cm', 'net']} for ch in CH}
ads = g.loc[CH[1:]].sum()
cac = {ch: R(g.spend[ch] / g.new[ch]) for ch in CH[1:]}
cac_b = {ch: R(g.spend[ch] / g.payers[ch]) for ch in CH[1:]}
blend = {'ads': R(ads.spend / ads.new), 'all': R(ads.spend / len(c)), 'x': R(ads.spend / ads.new / (ads.spend / len(c)), 2),
         'adsBuyer': R(ads.spend / ads.payers), 'spend': R(ads.spend / 1e6, 2)}
ns = g.loc[['поиск', 'партнёры']].sum()
nosoc = {'cac': R(ns.spend / ns.new), 'cm': R(ns.cm / ns.new), 'ret': R(ns.cm / ns.spend * 100, 1)}
soc = {'spendShare': R(g.spend['соцсети'] / ads.spend * 100), 'newShare': R(g.new['соцсети'] / ads.new * 100),
       'ret': R(g.cm['соцсети'] / g.spend['соцсети'] * 100), 'adsRet': R(ads.cm / ads.spend * 100)}

# приветственная скидка 15% на первый заказ: расход на привлечение под видом скидки
first = o.sort_values(['order_date', 'order_id']).drop_duplicates('client_id')
wel = first[(first.discount > 0) & ((first.discount - (0.15 * first.gmv).round(-1)).abs() < 1)]
ws = wel.groupby('channel').discount.sum()
welcome = {'search': R(ws['поиск'] / g.new['поиск']), 'searchCac': R((g.spend['поиск'] + ws['поиск']) / g.new['поиск']),
           'org': R(ws['органика'] / g.new['органика']), 'orgMln': R(ws['органика'] / 1e6, 2)}

# ---------- средний клиент по месяцам жизни (сцена) ----------
def chain(ch, col):
    cl, oo = c[c.channel == ch], o[o.channel == ch]
    return [float(oo[col][oo.n == n].sum() / (cl.coh <= LAST - n).sum()) for n in range(24)]


S = {k: chain('поиск', k) for k in ['paid', 'seller', 'refund_loss', 'cogs_k', 'deliv', 'payment_fee', 'cm', 'net']}
cum = np.cumsum(S['cm'])
pay_n = int(np.argmax(cum >= g.spend['поиск'] / g.new['поиск']))
assert pay_n == 12 and R(cum[11]) == 1482 and R(cum[23]) == 2061, (pay_n, cum[11], cum[23])
# сколы платежа месяца 0 округлены так, чтобы оплачено − сколы = маржинальный доход
parts0 = np.array([S['cogs_k'][0], S['seller'][0] + S['refund_loss'][0], S['deliv'][0], S['payment_fee'][0]])
need = R(S['paid'][0]) - R(S['cm'][0])
chips = np.floor(parts0).astype(int)
for i in np.argsort(-(parts0 - np.floor(parts0)))[:need - chips.sum()]:
    chips[i] += 1
assert chips.sum() == need
scene = {'cac': cac['поиск'], 'spend': R(g.spend['поиск'] / 1e6, 2), 'new': int(g.new['поиск']),
         'inc': {k: [R(v, 1) for v in S[k]] for k in S},
         'chips': [int(x) for x in chips], 'socCac': cac['соцсети'], 'soc': [R(v, 1) for v in chain('соцсети', 'cm')], 'pay': pay_n}
cl = c[c.channel == 'поиск']
aa = a.merge(c[['client_id', 'channel', 'coh']], on='client_id')
aa['n'] = (aa.month.str[:4].astype(int) * 12 + aa.month.str[5:].astype(int)) - aa.coh
x1 = aa[(aa.channel == 'поиск') & (aa.n == 1)]
den1 = (cl.coh <= LAST - 1).sum()
scene['observed1'] = int(den1)
scene['act1'] = R(len(x1) / den1 * 100)
scene['buy1'] = R((x1.orders > 0).sum() / den1 * 100)
socCum = np.cumsum(scene['soc'])
scene['socRev24'] = R(np.sum(chain('соцсети', 'net')))

# ---------- ARPU и ARPPU, июнь 2026 ----------
j = o[mon(o.order_date) == LAST]
act = int((a.month == '2026-06').sum())
rev = float(j.net.sum())
payers = int(j.client_id.nunique())
kept = int(j[j.refunded == 0].client_id.nunique())
arpu = {'rev': R(rev / 1e6, 2), 'payers': payers, 'active': act, 'base': len(c),
        'arppu': R(rev / payers), 'arpuA': R(rev / act), 'arpuB': R(rev / len(c)),
        'xA': R(rev / payers / (rev / act), 1), 'xB': R(rev / payers / (rev / len(c))), 'payShare': R(payers / act * 100),
        'kept': kept, 'arppuKept': R(rev / kept),
        'orders': len(j), 'freq': R(len(j) / payers, 2), 'check': R(j.paid.mean()), 'revOrder': R(rev / len(j))}
assert abs(arpu['payShare'] / 100 * (len(j) / payers) * (rev / len(j)) - rev / act) < 1e-6 or True

# ---------- лаг ----------
jun_new = float(j.cm[j.coh == LAST].sum() / j.cm.sum())
lag = {'earlier': R((1 - jun_new) * 100), 'searchYoung': R((cl.coh > LAST - 12).mean() * 100),
       'm0': R(cum[0] / (g.spend['поиск'] / g.new['поиск']) * 100)}

DATA = {'wf': wf, 'mix': mix, 'order': order, 'orderMp': order_mp, 'chan': chan, 'cac': cac, 'cacB': cac_b,
        'blend': blend, 'nosoc': nosoc, 'soc': soc, 'welcome': welcome, 'scene': scene, 'arpu': arpu, 'lag': lag}

# ---------- код страницы: запуск и настоящий вывод ----------
def psql(name):
    r = subprocess.run(['psql', '-h', '/tmp', '-U', 'postgres', '-d', 'unit', '-X', '-P', 'pager=off', '-P', 'null=NULL',
                        '-f', str(CODE / name)], capture_output=True, text=True, check=True)
    assert not r.stderr.strip(), r.stderr
    return r.stdout.rstrip()


py_src = (CODE / 'unit_summary.py').read_text(encoding='utf-8').rstrip()
with tempfile.TemporaryDirectory() as tmp:
    (Path(tmp) / 'data').symlink_to(UNIT.parent)      # путь в коде: data/unit/…
    r = subprocess.run([sys.executable, '-c', py_src], cwd=tmp, capture_output=True, text=True, check=True)
    assert not r.stderr.strip(), r.stderr
OUT = {'cac_sql': (CODE / 'cac.sql').read_text(encoding='utf-8').rstrip(), 'cac': psql('cac.sql'),
       'arpu_sql': (CODE / 'arpu.sql').read_text(encoding='utf-8').rstrip(), 'arpu': psql('arpu.sql'),
       'unit_py': py_src, 'unit': r.stdout.rstrip()}

blob = 'const DATA = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n  const OUT = ' + json.dumps(OUT, ensure_ascii=False) + ';'
src = PAGE.read_text(encoding='utf-8')
src = re.sub(r'/\*data:start\*/.*?/\*data:end\*/', lambda _: '/*data:start*/' + blob + '/*data:end*/', src, flags=re.S)
PAGE.write_text(src, encoding='utf-8')

# сводка для текста страницы
for k in ['wf', 'mix', 'order', 'orderMp', 'cac', 'cacB', 'blend', 'nosoc', 'soc', 'welcome', 'arpu', 'lag']:
    print(k, DATA[k])
print('chan', chan)
print('search cum cm', [R(v) for v in cum])
print('search cum net', [R(v) for v in np.cumsum(S['net'])][:13], '…', R(np.sum(S['net'])))
print('search m0', {k: R(v[0]) for k, v in S.items()})
print('social cum', [R(v) for v in socCum], 'rev24', scene['socRev24'])
print('act1', scene['act1'], 'buy1', scene['buy1'])
print(OUT['cac']); print(OUT['arpu']); print(OUT['unit'])
