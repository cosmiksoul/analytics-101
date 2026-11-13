"""Данные сцены и интерактива страницы 9.2 «Воронки и конверсии» из учебного журнала data/events.

Запуск из любой папки:  python3 pages/da-9-2/data/gen_page.py
Соглашения темы 09: без дублей event_id, без ботов (больше 100 клиентских событий за сутки),
человек = аккаунт (склейка anonymous_id → user_id), время и день — по Минску, сессия — 30 минут
неактивности на устройстве, оплата — серверный order_paid.

Считает:
- воронки новичков мая по людям: любой и строгий порядок × окно 1 сутки, 7 суток, без окна;
- воронки по сессиям тех же людей (оплата привязана к сессии устройства, где она случилась);
- судьбы 1 000 точек сцены (совместное распределение «докуда дошёл» в четырёх определениях);
- числа для текста: время между шагами, сессии, сегменты, нюансы.
Данные сцены и интерактива вписываются в page.js между /*data:start*/ и /*data:end*/,
числа для текста печатаются. Повторный запуск даёт тот же файл.
"""
import json, re
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
DATA = PAGE.parent.parent / "data" / "events"
MSK = "Europe/Minsk"
STEPS = ["app_open", "product_view", "add_to_cart", "checkout_start", "order_paid"]
TS = lambda s: pd.Timestamp(s, tz=MSK)

# ---------- журнал по соглашениям темы ----------
ev = pd.read_parquet(DATA / "events.parquet")
users = pd.read_csv(DATA / "users.csv", parse_dates=["signup_time"])
ev = ev.drop_duplicates("event_id")
ev["t"] = ev.event_time.dt.tz_convert(MSK)
cl0 = ev[ev.origin == "client"]
per_day = cl0.groupby(["anonymous_id", cl0.t.dt.date]).size()
bots = per_day[per_day > 100].index.get_level_values(0).unique()
ev = ev[~ev.anonymous_id.isin(bots)].copy()
dev = ev.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id").user_id.first()
ev["person"] = ev.user_id.fillna(ev.anonymous_id.map(dev)).fillna(ev.anonymous_id)
END = TS("2026-06-29 03:00")                      # конец журнала по Минску

old = set(users.loc[users.signup_time < pd.Timestamp("2026-01-05", tz=MSK), "user_id"])
f = ev[ev.event_name.isin(STEPS)]
first = ev[ev.event_name == "app_open"].sort_values(["t", "event_id"]).groupby("person").first()
first = first[~first.index.isin(old)]           # старые аккаунты — не новички
may = first[(first.t >= TS("2026-05-01")) & (first.t < TS("2026-06-01"))].t


def reach(start, window, strict):
    """Номер последнего шага (1…5), до которого дошёл каждый человек из start."""
    g = f[f.person.isin(start.index)].merge(start.rename("t0"), left_on="person", right_index=True)
    lim = g.t0 + (pd.Timedelta(window) if window else pd.Timedelta(days=9999))
    g = g[(g.t >= g.t0) & (g.t <= lim)]
    r = pd.Series(1, index=start.index)
    if not strict:                                # все шаги 1…k есть в окне, порядок любой
        have = g.groupby(["person", "event_name"]).size().unstack().reindex(index=start.index, columns=STEPS).notna()
        return have.cummin(axis=1).sum(axis=1)
    alive = start.copy()                          # строгий: каждый следующий шаг не раньше предыдущего
    for k, s in enumerate(STEPS[1:], start=2):
        e = g[g.event_name == s]
        e = e[e.t >= e.person.map(alive)]
        alive = e.groupby("person").t.min()
        r[alive.index] = k
    return r


def counts(r):
    return [int((r >= k).sum()) for k in range(1, 6)]


WIN = {"1": "1D", "7": "7D", "0": None}
R = {(o, w): reach(may, WIN[w], o == "s") for o in "as" for w in "170"}
U = {f"u{o}{w}": counts(R[(o, w)]) for (o, w) in R}

# ---------- сессии: 30 минут тишины на устройстве; оплата — в сессию, где она случилась ----------
cl = ev[ev.origin == "client"].sort_values(["anonymous_id", "event_time", "event_id"]).copy()
gap = cl.groupby("anonymous_id").event_time.diff()
cl["sid"] = (gap.isna() | (gap > pd.Timedelta(minutes=30))).cumsum()
paid = ev[ev.event_name == "order_paid"][["event_time", "person", "platform", "order_id"]].sort_values("event_time")
last = cl[["sid", "event_time", "person", "platform"]].rename(columns={"event_time": "ct"}).sort_values("ct")
pm = pd.merge_asof(paid, last, left_on="event_time", right_on="ct", by=["person", "platform"], direction="backward")
pm["sid"] = pm.sid.where((pm.event_time - pm.ct) <= pd.Timedelta(minutes=30))
cm = cl[cl.person.isin(may.index)]
sx = pd.concat([cm[["sid", "event_time", "event_name"]],
                pm[pm.sid.isin(cm.sid)][["sid", "event_time"]].assign(event_name="order_paid")])
sx = sx[sx.event_name.isin(STEPS)]
n_sess = int(cm.sid.nunique())


def sess_counts(strict):
    if not strict:
        have = sx.groupby(["sid", "event_name"]).size().unstack().reindex(columns=STEPS).notna()
        return [int(have.iloc[:, :k].all(axis=1).sum()) for k in range(1, 6)]
    alive = sx[sx.event_name == "app_open"].groupby("sid").event_time.min()
    out = [len(alive)]
    for s in STEPS[1:]:
        e = sx[sx.event_name == s]
        e = e[e.event_time >= e.sid.map(alive)]
        alive = e.groupby("sid").event_time.min()
        out.append(len(alive))
    return out


U["sa"], U["ss"] = sess_counts(False), sess_counts(True)
assert U["sa"][0] == n_sess

# ---------- сцена: судьбы точек, 1 610 человек → 1 000 точек ----------
fates = pd.DataFrame({"A": R[("a", "0")], "B": R[("s", "0")], "C": R[("s", "7")], "D": R[("s", "1")]})
joint = fates.value_counts().sort_index()
raw = joint * 1000 / len(fates)
base = np.floor(raw).astype(int)
rest = 1000 - base.sum()
base[(raw - base).sort_values(ascending=False, kind="stable").index[:rest]] += 1   # наибольшие остатки
# подгонка: столбцы сцены должны совпасть с округлёнными долями журнала (30,4 % → 304 точки)
keys = list(base.index)
K = np.array(keys)
target = {c: [int(np.floor(x * 1000 / len(fates) + 0.5)) for x in counts(fates[c])] for c in "ABCD"}
def err(nv):
    return sum(abs(int(nv[K[:, i] >= k].sum()) - target[c][k - 1]) for i, c in enumerate("ABCD") for k in range(2, 6))
nv = base.to_numpy().copy()
while err(nv):
    best = None
    for i in range(len(keys)):
        if nv[i] == 0:
            continue
        for j in range(len(keys)):
            if i == j:
                continue
            nv[i] -= 1; nv[j] += 1
            cand = (err(nv), abs(nv[i] - raw.iloc[i]) + abs(nv[j] - raw.iloc[j]), i, j)
            nv[i] += 1; nv[j] -= 1
            if best is None or cand < best:
                best = cand
    assert best[0] < err(nv), "подгонка застряла"
    nv[best[2]] -= 1; nv[best[3]] += 1
base = pd.Series(nv, index=base.index)
DOTS = [[*map(int, k), int(v)] for k, v in base.items() if v > 0]
dots = pd.DataFrame([k for k, v in base.items() for _ in range(v)], columns=list("ABCD"))
SC = {c: [int((dots[c] >= k).sum()) for k in range(1, 6)] for c in "ABCD"}

# ---------- числа для текста ----------
T = {}
T["may"] = len(may)
T["sess_per_person"] = round(n_sess / len(may), 1)
conv_people = R[("a", "0")][R[("a", "0")] == 5].index
cs = sx.copy(); cs["person"] = cs.sid.map(cm.groupby("sid").person.first())
full = sx.groupby(["sid", "event_name"]).size().unstack().reindex(columns=STEPS).notna().all(axis=1)
full_people = set(cs[cs.sid.isin(full[full].index)].person)
T["conv_people"] = len(conv_people)
T["conv_sessions"] = int(cm[cm.person.isin(conv_people)].sid.nunique())
T["conv_sess_per"] = round(T["conv_sessions"] / len(conv_people), 1)
T["non_sess_per"] = round(cm[~cm.person.isin(conv_people)].sid.nunique() / (len(may) - len(conv_people)), 1)
T["conv_with_full_session"] = len(full_people & set(conv_people))
T["sess_with_paid"] = int(sx[sx.event_name == "order_paid"].sid.nunique())

# время между шагами: строгий порядок без окна, у тех, кто дошёл до оплаты
g = f[f.person.isin(may.index)]
alive, Tm = may.copy(), {"app_open": may}
for s in STEPS[1:]:
    e = g[g.event_name == s]; e = e[e.t >= e.person.map(alive)]
    alive = e.groupby("person").t.min(); Tm[s] = alive
Dm = pd.DataFrame(Tm).dropna()
fmt_td = lambda d: f"{int(d.total_seconds() // 86400)} д {int(d.total_seconds() % 86400 // 3600)} ч {int(d.total_seconds() % 3600 // 60)} мин {int(d.total_seconds() % 60)} с"
T["step_medians"] = {f"{a}→{b}": fmt_td((Dm[b] - Dm[a]).median()) for a, b in zip(STEPS, STEPS[1:])}
T["open_paid_median"] = fmt_td((Dm.order_paid - Dm.app_open).median())
cp = Dm.order_paid - Dm.add_to_cart
T["cart_paid_median"] = fmt_td(cp.median())
T["cart_paid_share_lt1h"] = round(float((cp < pd.Timedelta(hours=1)).mean()) * 100, 1)
T["cart_paid_share_gt1d"] = round(float((cp > pd.Timedelta(days=1)).mean()) * 100, 1)
op = Dm.order_paid - Dm.app_open
T["open_paid_gt1d"] = round(float((op > pd.Timedelta(days=1)).mean()) * 100, 1)
T["open_paid_gt7d"] = round(float((op > pd.Timedelta(days=7)).mean()) * 100, 1)
plat0 = np.where(first.platform.reindex(Dm.index) == "web", "сайт", "приложение")
T["open_paid_median_by_platform"] = {p: fmt_td(x) for p, x in op.groupby(plat0).median().items()}
T["cart_paid_median_by_platform"] = {p: fmt_td(x) for p, x in cp.groupby(plat0).median().items()}
T["strict_payers"] = len(Dm)

# любой → строгий: кто срезан на корзине и почему
cut = R[("a", "0")][(R[("a", "0")] >= 3) & (R[("s", "0")] < 3)].index
T["cut_at_cart"] = len(cut)
T["cut_payers"] = int(((R[("a", "0")] == 5) & (R[("s", "0")] < 5)).sum())
fv = g[g.event_name == "product_view"].groupby("person").t.min()
lc = g[g.event_name == "add_to_cart"].groupby("person").t.max()
T["cut_all_carts_before_first_view"] = int((lc.reindex(cut) < fv.reindex(cut)).sum())

# сегменты: новички до 22 июня, окно 7 суток, любой порядок
new = first[first.t < TS("2026-06-22")]
rn = reach(new.t, "7D", False)
seg = pd.DataFrame({"chan": new.traffic_source.replace({"search": "органика", "direct": "органика", "partner": "партнёры", "ad": "реклама", "push": "прочее", "email": "прочее"}),
                    "plat": np.where(new.platform == "web", "сайт", "приложение"), "ok": rn == 5})
SIMP = {c: {p: [round(float(x.ok.mean()) * 100, 1), len(x)] for p, x in d.groupby("plat")} for c, d in seg.groupby("chan")}
SIMP["всего"] = {p: [round(float(x.ok.mean()) * 100, 1), len(x)] for p, x in seg.groupby("plat")}
T["simpson_n"] = len(seg)
# время до оплаты по платформам у сегментной выборки (оплатившие за 7 суток)
gn = f[f.person.isin(new.index)]
fpaid = gn[gn.event_name == "order_paid"].merge(new.t.rename("t0"), left_on="person", right_index=True)
fpaid = fpaid[fpaid.t >= fpaid.t0].groupby("person").agg(t=("t", "min"), t0=("t0", "first"))
fpaid = fpaid[fpaid.index.isin(rn[rn == 5].index)]
dd = fpaid.t - fpaid.t0
T["seg_open_paid_median_by_platform"] = {p: fmt_td(x) for p, x in dd.groupby(np.where(new.platform.reindex(fpaid.index) == "web", "сайт", "приложение")).median().items()}
T["seg_within_1d_by_platform"] = {p: round(float((x <= pd.Timedelta(days=1)).mean()) * 100, 1) for p, x in dd.groupby(np.where(new.platform.reindex(fpaid.index) == "web", "сайт", "приложение"))}

# нюанс 1: повторные проходы
po = paid[paid.person.isin(conv_people)].groupby("person").size()
T["conv_orders"], T["conv_2plus"] = int(po.sum()), int((po >= 2).sum())
T["conv_2plus_share"] = round(float((po >= 2).mean()) * 100, 1)
T["orders_per_newcomer"] = round(float(po.sum()) / len(may) * 100, 1)
T["max_orders"] = int(po.max())

# нюанс 2: незавершённые окна — неделя 15–21 июня глазами отчёта 22 июня и сейчас
def conv7(cohort_from, cohort_to, asof):
    co = first[(first.t >= TS(cohort_from)) & (first.t < TS(cohort_to))].t
    ff = f[f.t < TS(asof)]
    g2 = ff[ff.person.isin(co.index)].merge(co.rename("t0"), left_on="person", right_index=True)
    g2 = g2[(g2.t >= g2.t0) & (g2.t <= g2.t0 + pd.Timedelta(days=7))]
    have = g2.groupby(["person", "event_name"]).size().unstack().reindex(index=co.index, columns=STEPS).notna()
    ok = have.cummin(axis=1)["order_paid"]
    return int(ok.sum()), len(co), round(float(ok.mean()) * 100, 1)
T["w15_asof22"] = conv7("2026-06-15", "2026-06-22", "2026-06-22 03:00")
T["w15_final"] = conv7("2026-06-15", "2026-06-22", "2026-06-29 03:00")
T["w22_now"] = conv7("2026-06-22", "2026-06-29", "2026-06-29 03:00")
co = first[(first.t >= TS("2026-06-22")) & (first.t < TS("2026-06-29"))].t
avail = ((END - co).dt.total_seconds() / 86400).clip(upper=7)
T["w22_full_window"] = int((avail >= 7).sum())
T["w22_mean_days"] = round(float(avail.mean()), 1)
T["w08_asof15"] = conv7("2026-06-08", "2026-06-15", "2026-06-15 03:00")
T["w08_final"] = conv7("2026-06-08", "2026-06-15", "2026-06-29 03:00")

# нюанс 3: шаги, которые не трекаются
buyers = set(paid.person); client_people = set(ev[ev.origin == "client"].person)
web_buyers = set(paid[paid.platform == "web"].person)
T["buyers"], T["buyers_server_only"] = len(buyers), len(buyers - client_people)
T["web_buyers"], T["web_server_only"] = len(web_buyers), len(web_buyers - client_people)
pur = ev[ev.event_name == "purchase"]
T["purchase_ratio"] = {p: round(len(pur[pur.platform == p]) / len(paid[paid.platform == p]), 3) for p in ["android", "ios", "web"]}
T["purchase_total"], T["paid_total"] = len(pur), len(paid)

# нюанс 4: путь к оплате в продукте без линейного пути (заказы новичков мая)
mo = pm[pm.person.isin(may.index)].copy()
ss = cl[cl.sid.isin(mo.sid.dropna())]
sv = ss[ss.event_name == "product_view"].groupby("sid").event_time.min()
sc = ss[ss.event_name == "add_to_cart"].groupby("sid").event_time.min()
def path(s):
    if pd.isna(s): return "не видно"
    if s not in sc.index: return "корзина из прошлой сессии"
    if s not in sv.index: return "без карточки"
    return "быстрое добавление" if sc[s] < sv[s] else "по шагам"
mo["path"] = mo.sid.map(path)
T["paths"] = {k: [int(v), round(v / len(mo) * 100, 1)] for k, v in mo.path.value_counts().items()}
T["paths_n"] = len(mo)

# ---------- запись в page.js ----------
data = {"U": U, "DOTS": DOTS, "SC": SC, "SIMP": SIMP, "NS": n_sess, "NP": len(may)}
js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s, n = re.subn(r"/\*data:start\*/.*?/\*data:end\*/",
               lambda _: "/*data:start*/const D = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/", s, flags=re.S)
assert n == 1, "метка /*data:start*/ в page.js не найдена"
js.write_text(s, encoding="utf-8")

print("воронки (дошли до шагов 1…5):")
for k, v in U.items():
    print(f"  {k}: {v}  → {v[-1] / v[0] * 100:.2f} %")
print("сцена, 1 000 точек:", SC)
print("сегменты:", json.dumps(SIMP, ensure_ascii=False))
print(json.dumps(T, ensure_ascii=False, indent=1))
print("page.js обновлён")
