"""Данные сцены и интерактива страницы 9.3 «Удержание и когорты» из учебного журнала data/events.

Запуск:  python3 pages/da-9-3/data/gen_page.py
Соглашения темы 09: человек = аккаунт (склейка устройств), без дублей event_id, без ботов (больше 100 клиентских
событий за сутки), день — минский, неполные дни по краям (вечер 4 января по Минску и 29 июня) отброшены.
Когорта — календарная неделя прихода (пн–вс); приход — более ранняя из дат: первый день в журнале или регистрация.
Старые аккаунты (регистрация до 5 января) — не новички и в когорты не входят.

Пишет в page.js между /*data:start*/ и /*data:end*/ объект DATA, в терминал — числа для текста страницы.
Повторный запуск даёт тот же файл.
"""
import json, re
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
EV = PAGE.parents[1] / "data" / "events"
START, LAST = pd.Timestamp("2026-01-05"), pd.Timestamp("2026-06-28")
NW = 25                                                     # недель в журнале
NDAY = (LAST - START).days + 1                              # 175 дней
RELEASE_W, CAMP_W = 10, (13, 16)                            # 16 марта; 6 апреля — 3 мая
ADD_FROM = 17                                               # ползунок: когорты 4 мая — 22 июня

# ---------- журнал → таблица «пользователь — день» ----------
ev = pd.read_parquet(EV / "events.parquet").drop_duplicates("event_id")
ev["ts"] = ev["event_time"].dt.tz_convert("Europe/Minsk").dt.tz_localize(None)
ev["day"] = ev["ts"].dt.normalize()
per_day = ev[ev["origin"] == "client"].groupby(["anonymous_id", "day"]).size()
bots = per_day[per_day > 100].index.get_level_values("anonymous_id").unique()
ev = ev[~ev["anonymous_id"].isin(bots)]
acc = ev.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id")["user_id"].first()
ev["person"] = ev["user_id"].fillna(ev["anonymous_id"].map(acc)).fillna(ev["anonymous_id"])
ev = ev[ev["day"].between(START, LAST)]
ud = (ev.assign(app=ev["event_name"].eq("app_open"), paid=ev["event_name"].eq("order_paid"))
        .groupby(["person", "day"]).agg(events=("event_id", "size"), app_opens=("app", "sum"), orders=("paid", "sum"))
        .reset_index())

users = pd.read_csv(EV / "users.csv", parse_dates=["signup_time"])
signup = users.set_index("user_id")["signup_time"].dt.tz_convert("Europe/Minsk").dt.tz_localize(None).dt.normalize()
first_day = ud.groupby("person")["day"].min()
arrived_all = pd.concat([first_day, signup.reindex(first_day.index)], axis=1).min(axis=1)
old = signup.reindex(first_day.index) < START
arrived = arrived_all[~old]
cohort = (arrived - START).dt.days // 7
week = lambda d: (d - START).dt.days // 7

ud["w"] = week(ud["day"])
new_ud = ud[ud["person"].isin(cohort.index)].copy()
new_ud["c"] = new_ud["person"].map(cohort)
new_ud["n"] = new_ud["w"] - new_ud["c"]
size = cohort.value_counts().sort_index().reindex(range(NW)).astype(int)


def mats(u, people):
    """Счётчики трёх видов удержания: [когорта][n-1] для n = 1…24−c (прожитые недели)."""
    act = u[u["n"] >= 1].drop_duplicates(["person", "n"])
    coh = cohort.reindex(people)
    cl = act.groupby(["c", "n"])["person"].nunique()
    last = act.groupby("person")["n"].max().reindex(people)
    firstn = act.groupby("person")["n"].min().reindex(people)
    C, R, B = [], [], []
    for c in range(NW):
        idx = coh.index[coh == c]
        L, F = last.reindex(idx), firstn.reindex(idx)
        ns = range(1, NW - c)
        C.append([int(cl.get((c, n), 0)) for n in ns])
        R.append([int((L >= n).sum()) for n in ns])
        B.append([int((F <= n).sum()) for n in ns])
    return C, R, B


C, R, B = mats(new_ud, cohort.index)
pct = lambda cnt, c: [round(100 * x / size[c], 1) for x in cnt]
classic = pd.DataFrame([pct(C[c], c) + [np.nan] * c for c in range(NW)], columns=range(1, NW))

# ---------- реклама в когортах кампании: кривые для модели ползунка ----------
e_new = ev[ev["person"].isin(cohort.index)].sort_values(["ts", "event_id"])
first_src = e_new[e_new["event_name"] == "app_open"].groupby("person")["traffic_source"].first()
first_plat = e_new.groupby("person")["platform"].first()
camp_ad = cohort.index[(cohort.between(*CAMP_W)) & (first_src.reindex(cohort.index) == "ad")]
cad = new_ud[new_ud["person"].isin(camp_ad)]
nca = len(camp_ad)
H = NW - 1 - ADD_FROM                                       # самая длинная история добавленной когорты: 7 недель
act = cad[cad["n"] >= 1].drop_duplicates(["person", "n"])
cl_ad = [act[act["n"] == n]["person"].nunique() / nca for n in range(1, H + 1)]
fn = act.groupby("person")["n"].min().reindex(camp_ad)
ret_ad = [float((fn <= n).sum()) / nca for n in range(1, H + 1)]
roll_ad = []                                                # [h-1][n-1]: активен в одну из недель n…h
for h in range(1, H + 1):
    a = act[act["n"] <= h]
    lh = a.groupby("person")["n"].max().reindex(camp_ad)
    roll_ad.append([round(float((lh >= n).sum()) / nca, 4) for n in range(1, h + 1)])
arr = arrived.reindex(camp_ad)
cad = cad.assign(t=(cad["day"] - cad["person"].map(arr)).dt.days)
TMAX = NDAY - 7 * ADD_FROM                                  # 56 дней
daily_ad = [round(cad[cad["t"] == t]["person"].nunique() / nca, 4) for t in range(TMAX)]
assert (arr + pd.Timedelta(days=TMAX - 1) <= LAST).all()

# ---------- DAU: все люди, включая старые аккаунты ----------
dau = ud.groupby("day")["person"].nunique().reindex(pd.date_range(START, LAST)).fillna(0).astype(int)

# ---------- герой примера: три вида удержания на одном человеке ----------
HERO = "u_03753"
hero_w = sorted(new_ud[new_ud["person"] == HERO]["n"].unique().tolist())

labels = [(START + pd.Timedelta(weeks=c)) for c in range(NW)]
MON = ["янв", "фев", "мар", "апр", "мая", "июн"]
lab = [f"{d.day} {MON[d.month - 1]}" for d in labels]

DATA = {
    "weeks": lab, "size": size.tolist(),
    "C": C, "R": R, "B": B,
    "add": {"n": int(nca), "from": ADD_FROM, "C": [round(x, 4) for x in cl_ad], "B": [round(x, 4) for x in ret_ad],
            "R": roll_ad, "d": daily_ad},
    "dau": dau.tolist(),
    "hero": {"id": HERO, "w": hero_w},
}

js = PAGE / "page.js"
if js.exists():
    s = js.read_text(encoding="utf-8")
    s2 = re.sub(r"/\*data:start\*/.*?/\*data:end\*/",
                lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/",
                s, flags=re.S)
    js.write_text(s2, encoding="utf-8")
    print("page.js:", "обновлён" if s2 != s else "без изменений", f"({len(json.dumps(DATA, separators=(',', ':'))) / 1024:.1f} КБ данных)")

# ---------- числа для текста ----------
r1 = lambda v: round(float(v), 1)
print("людей после склейки", ud["person"].nunique(), "| новичков", len(cohort), "| старых аккаунтов в журнале", int(old.sum()))
print("размеры когорт", size.tolist())
pl = classic.loc[:, 4:9].mean(axis=1)
print("плато 4–9 по когортам", [r1(x) for x in pl])
grp = {"до релиза": range(0, 10), "релиз": range(10, 13), "кампания": range(13, 17), "после": range(17, 21)}
for k, g in grp.items():
    g = list(g)
    w = size[g].to_numpy()
    print(f"  {k}: плато {r1(pl[g].mean())} | нед.1 {r1(classic.loc[g, 1].mean())} | нед.4 невзв {r1(classic.loc[g, 4].mean())} взв {r1((classic.loc[g, 4] * w).sum() / w.sum())}")
for n in (1, 4):
    g = [c for c in range(NW) if n < NW - c]
    w = size[g].to_numpy()
    print(f"нед.{n} по всем {len(g)} когортам: невзвешенное {r1(classic.loc[g, n].mean())}, взвешенное {r1((classic.loc[g, n] * w).sum() / w.sum())}")
g = list(range(10, 21))
w = size[g].to_numpy()
print("весна 16 мар–24 мая, нед.1: невзв", r1(classic.loc[g, 1].mean()), "взв", r1((classic.loc[g, 1] * w).sum() / w.sum()),
      "| нед.4: невзв", r1(classic.loc[g, 4].mean()), "взв", r1((classic.loc[g, 4] * w).sum() / w.sum()))
print("реклама в когортах кампании:", nca, "чел.; нед.1", r1(100 * cl_ad[0]), "нед.4", r1(100 * cl_ad[3]), "нед.4–7", r1(100 * np.mean(cl_ad[3:7])))
print("доля рекламы в когортах кампании", [r1(100 * ((cohort == c) & (first_src.reindex(cohort.index) == "ad")).sum() / size[c]) for c in range(13, 17)])
print("герой", HERO, "недели активности", hero_w)
m = pd.Series(dau.values, index=dau.index).groupby(dau.index.month).mean()
print("DAU по месяцам", [round(x) for x in m])
# приложение до и после релиза
app = first_plat.reindex(cohort.index).isin(["android", "ios"])
au = new_ud[new_ud["person"].isin(app.index[app])]
Ca, _, _ = mats(au, app.index[app])
sa = cohort[app].value_counts().sort_index()
pa = pd.DataFrame([[100 * x / sa[c] for x in Ca[c]] + [np.nan] * c for c in range(NW)], columns=range(1, NW)).loc[:, 4:9].mean(axis=1)
print("приложение: плато до релиза", r1(pa[0:10].mean()), "| 16–30 марта", r1(pa[10:13].mean()), "| диапазон до", r1(pa[0:10].min()), r1(pa[0:10].max()), "после", r1(pa[10:13].min()), r1(pa[10:13].max()))
# ловушка: когорта по первому событию, старые аккаунты внутри
coh_fe = (first_day - START).dt.days // 7
size_fe = coh_fe.value_counts().sort_index()
ud_fe = ud.assign(c=ud["person"].map(coh_fe))
ud_fe["n"] = ud_fe["w"] - ud_fe["c"]
af =ud_fe[ud_fe["n"] >= 1].drop_duplicates(["person", "n"]).groupby(["c", "n"])["person"].nunique().unstack()
pf = af.div(size_fe, axis=0) * 100
old_fe = coh_fe[old[old].index]
print("ловушка: размеры янв по первому событию", size_fe[:4].tolist(), "верно", size[:4].tolist(),
      "| старых в янв.", int((old_fe <= 3).sum()), "из", int(old.sum()))
print("  5 янв: нед.1", r1(pf.loc[0, 1]), "vs", r1(classic.loc[0, 1]), "| плато", r1(pf.loc[0, 4:9].mean()), "vs", r1(pl[0]))
jf, jr = size_fe[:4], size[:4]
print("  январь взв.: нед.1", r1((pf.loc[:3, 1] * jf).sum() / jf.sum()), "vs", r1((classic.loc[:3, 1] * jr).sum() / jr.sum()),
      "| плато", r1((pf.loc[:3, 4:9].mean(axis=1) * jf).sum() / jf.sum()), "vs", r1((pl[:4] * jr).sum() / jr.sum()))
print("  старые по неделе первого события", old_fe.value_counts().sort_index().tolist())

# ---------- «день 1» двумя способами: календарные сутки и 24 часа от первого события ----------
t0 = ev.groupby("person")["ts"].min()
pp = arrived.index[arrived == first_day.reindex(arrived.index)]          # приход — по первому событию
e1 = ev[ev["person"].isin(pp)][["person", "ts", "day"]].merge(t0.rename("t0"), left_on="person", right_index=True)
e1["dd"] = (e1["day"] - e1["t0"].dt.normalize()).dt.days
e1["hh"] = (e1["ts"] - e1["t0"]) / pd.Timedelta(hours=24)
for N in (1, 7, 30):
    elig = t0[pp][t0[pp] + pd.Timedelta(days=N + 1) <= LAST + pd.Timedelta(days=1)].index
    ee = e1[e1["person"].isin(elig)]
    cal, h24 = set(ee[ee["dd"] == N]["person"]), set(ee[(ee["hh"] >= N) & (ee["hh"] < N + 1)]["person"])
    k = len(elig)
    print(f"день {N}: {k} чел.; календарный {r1(100 * len(cal) / k)} %, 24 часа {r1(100 * len(h24) / k)} %;"
          f" оба {r1(100 * len(cal & h24) / k)}, только календарь {r1(100 * len(cal - h24) / k)}, только 24 ч {r1(100 * len(h24 - cal) / k)}")
    if N == 1:
        ev_h = t0[elig].dt.hour >= 18
        late = ev_h.index[ev_h]
        print(f"  пришли после 18:00 ({len(late)}): календарный {r1(100 * len(cal & set(late)) / len(late))}, 24 ч {r1(100 * len(h24 & set(late)) / len(late))}")
# неделя 1: календарная против семи суток (дни 7–13)
nu = new_ud.assign(k=(new_ud["day"] - new_ud["person"].map(arrived)).dt.days // 7, wd=new_ud["person"].map(arrived.dt.dayofweek))
el7 = arrived[arrived <= LAST - pd.Timedelta(days=13)]
print("неделя 1 семь суток (дни 7–13):", r1(100 * nu[(nu["k"] == 1) & nu["person"].isin(el7.index)]["person"].nunique() / len(el7)),
      "| календарная, взвешенно по 24 когортам:", r1(100 * sum(C[c][0] for c in range(24)) / size[:24].sum()))
elc = cohort[cohort <= 23]
wd = arrived.dt.dayofweek
cal_wd = nu[(nu["n"] == 1) & nu["person"].isin(elc.index)].groupby("wd")["person"].nunique() / elc.groupby(wd).size()
win_wd = nu[(nu["k"] == 1) & nu["person"].isin(el7.index)].groupby("wd")["person"].nunique() / el7.groupby(wd).size()
print("неделя 1 по дню прихода пн…вс: календарная", [r1(100 * x) for x in cal_wd], "| семь суток", [r1(100 * x) for x in win_wd])
print("приход по дням недели, %", [r1(100 * x) for x in arrived.dt.dayofweek.value_counts(normalize=True).sort_index()])

# ---------- отток: интервал использования и возвраты после тишины ----------
sq = new_ud.sort_values(["person", "day"])[["person", "day"]]
sq["nxt"] = sq.groupby("person")["day"].shift(-1)
two = sq.groupby("person")["day"].apply(lambda s: (s.iloc[1] - s.iloc[0]).days if len(s) > 1 else np.nan)
el60 = first_day.reindex(two.index)[first_day.reindex(two.index) <= LAST - pd.Timedelta(days=60)].index
rep = two[el60]
rep = rep[rep <= 60]
print(f"интервал использования: из {len(el60)} новичков (пришли до {(LAST - pd.Timedelta(days=60)):%d.%m}) вернулись за 60 дней {len(rep)};"
      f" медиана {rep.median():.0f} дн., 80 % — за {rep.quantile(.8):.0f} дн.")
po = new_ud[new_ud["orders"] > 0].sort_values(["person", "day"])
twp = po.groupby("person")["day"].apply(lambda s: (s.iloc[1] - s.iloc[0]).days if len(s) > 1 else np.nan)
fp = po.groupby("person")["day"].min()
elp = fp[fp <= LAST - pd.Timedelta(days=60)].index
rp = twp[elp]
rp = rp[rp <= 60]
print(f"  по покупке: из {len(elp)} купивших повторили за 60 дней {len(rp)}; 80 % — за {rp.quantile(.8):.0f} дн.")
for k in (7, 14, 28, 42):
    x = sq[sq["day"] + pd.Timedelta(days=k + 28) <= LAST]
    sil = x[x["nxt"].isna() | ((x["nxt"] - x["day"]).dt.days > k)].groupby("person").head(1)
    back = ((sil["nxt"] - sil["day"]).dt.days <= k + 28).mean()
    print(f"  тишина {k} дн.: {len(sil)} чел., вернулись в следующие 28 дней {r1(100 * back)} %")

# ---------- нюансы: событие «вернулся», поведенческие когорты, зрелость ----------
def classic_by(u):
    Cx, _, _ = mats(u, cohort.index)
    return pd.DataFrame([[100 * x / size[c] for x in Cx[c]] + [np.nan] * c for c in range(NW)], columns=range(1, NW))
for nm, u in [("любое событие", new_ud), ("app_open", new_ud[new_ud["app_opens"] > 0]), ("покупка order_paid", new_ud[new_ud["orders"] > 0])]:
    mm = classic_by(u)
    p4 = mm.loc[:, 4:9].mean(axis=1)
    print(f"{nm}: нед.1 {r1((mm.loc[:23, 1] * size[:24]).sum() / size[:24].sum())} | плато до релиза {r1(p4[0:10].mean())}, 16–30 марта {r1(p4[10:13].mean())}, кампания {r1(p4[13:17].mean())}")
buy0 = set(new_ud[(new_ud["n"] == 0) & (new_ud["orders"] > 0)]["person"])
for flag, nm in ((True, "купили в неделю прихода"), (False, "не купили")):
    ids = cohort.index[cohort.index.isin(buy0) == flag]
    u = new_ud[new_ud["person"].isin(ids)]
    a = u[u["n"] >= 1].drop_duplicates(["person", "n"])
    e15 = ids[cohort[ids] <= 15]
    e23 = ids[cohort[ids] <= 23]
    plv = np.mean([a[(a["n"] == n) & a["person"].isin(e15)]["person"].nunique() / len(e15) for n in range(4, 10)])
    w1 = a[(a["n"] == 1) & a["person"].isin(e23)]["person"].nunique() / len(e23)
    print(f"{nm}: {len(ids)} чел. ({r1(100 * len(ids) / len(cohort))} %), нед.1 {r1(100 * w1)}, плато 4–9 {r1(100 * plv)}")
print("скользящее нед.1 по когортам:", [round(100 * R[c][0] / size[c]) for c in range(24)])
print("сколько когорт за точкой средней кривой: n=4 —", NW - 4, ", n=12 —", NW - 12, ", n=20 —", NW - 20)
# модель ползунка: +1000 рекламных новичков в каждую когорту мая–июня
K = 1000
w1r = [C[c][0] for c in range(24)]
w1m = [C[c][0] + (K * cl_ad[0] if c >= ADD_FROM else 0) for c in range(24)]
sm = [size[c] + (K if c >= ADD_FROM else 0) for c in range(24)]
unw = lambda cnt, sz: r1(np.mean([100 * a / b for a, b in zip(cnt, sz)]))
wgt = lambda cnt, sz: r1(100 * sum(cnt) / sum(sz))
print(f"+{K}/нед.: нед.1 по 24 когортам невзв {unw(w1r, size[:24])} → {unw(w1m, sm)}, взв {wgt(w1r, size[:24])} → {wgt(w1m, sm)}")
# средние из сырых счётчиков (как в интерактиве): весна и плато групп (взвешенная кривая, недели 4–9, прожитые всеми)
for a, b, nm in ((10, 20, "весна 16 мар–24 мая"), (0, 23, "все 24 когорты")):
    g = range(a, b + 1)
    print(f"{nm}, нед.1: невзв {r1(np.mean([100 * C[c][0] / size[c] for c in g]))}, взв {r1(100 * sum(C[c][0] for c in g) / size[list(g)].sum())}")
for nm, (a, b) in {"до релиза": (0, 9), "16–30 марта": (10, 12), "кампания": (13, 16)}.items():
    cur = [sum(C[c][n - 1] for c in range(a, b + 1)) / size[a:b + 1].sum() for n in range(1, min(12, 24 - b) + 1)]
    print(f"плато {nm} (взвешенная кривая): {r1(100 * np.mean(cur[3:9]))}")
