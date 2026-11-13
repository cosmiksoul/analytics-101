"""Данные сцены и интерактива страницы 10.2 «LTV через удержание» из учебной выгрузки data/unit.

Запуск:  python3 pages/da-10-2/data/gen_page.py
Соглашения темы 10 (data/unit/README.md):
- когорта — месяц регистрации клиента, месяц жизни n = 0 — месяц регистрации;
- удержание r(n) — доля когорты, заходившей в месяц n (activity.csv), месяц 0 всегда 100%;
- маржинальный доход заказа: revenue − cogs − delivery_cost − payment_fee, у возврата −2·delivery_cost − payment_fee;
- чистая выручка — revenue без возвращённых заказов;
- LTV — на одного зарегистрированного клиента: LTV_H = сумма маржи когорты за месяцы 0…H−1 / размер когорты
  = Σ r(n)·m(n), где m(n) — маржа на активного клиента в месяц n.
Группа страницы — 12 когорт июля 2024 — июня 2025: у всех есть месяцы 0–12.

Подгонки хвоста (степенная, экспонента, плато) — scipy.optimize.curve_fit. Пишет в page.js между
/*data:start*/ и /*data:end*/ объект DATA (числа для сцены, подгонки и контрольные LTV для интерактива),
в терминал — числа для текста страницы. Повторный запуск даёт тот же файл.
"""
import json, re
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.optimize import curve_fit

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
D = PAGE.parents[1] / "data" / "unit"

cl = pd.read_csv(D / "clients.csv", parse_dates=["signup_date"])
od = pd.read_csv(D / "orders.csv", parse_dates=["order_date"])
ac = pd.read_csv(D / "activity.csv")
sp = pd.read_csv(D / "marketing_spend.csv")

od["margin"] = np.where(od.refunded == 1, -2 * od.delivery_cost - od.payment_fee,
                        od.revenue - od.cogs - od.delivery_cost - od.payment_fee)
od["net"] = np.where(od.refunded == 1, 0, od.revenue)
cl["cohort"] = cl.signup_date.dt.strftime("%Y-%m")
first = dict(zip(cl.client_id, cl.signup_date.dt.year * 12 + cl.signup_date.dt.month))
coh_of = dict(zip(cl.client_id, cl.cohort))
ch_of = dict(zip(cl.client_id, cl.channel))
ac["n"] = ac.month.str[:4].astype(int) * 12 + ac.month.str[5:].astype(int) - ac.client_id.map(first)
od["n"] = od.order_date.dt.year * 12 + od.order_date.dt.month - od.client_id.map(first)
for t in (ac, od):
    t["cohort"] = t.client_id.map(coh_of)
    t["channel"] = t.client_id.map(ch_of)

COH = sorted(cl.cohort.unique())                       # 24 когорты: 2024-07 … 2026-06
LAST = 2026 * 12 + 6
age = {c: LAST - (int(c[:4]) * 12 + int(c[5:])) for c in COH}   # сколько месяцев жизни после месяца 0
size = cl.groupby("cohort").size()
ACT = ac.groupby(["cohort", "n"]).size().unstack().reindex(COH)
MAR = od.groupby(["cohort", "n"]).margin.sum().unstack().reindex(COH)
NET = od.groupby(["cohort", "n"]).net.sum().unstack().reindex(COH)

G12 = COH[:12]                                         # июль 2024 — июнь 2025
N = 13                                                 # месяцы 0…12 есть у всех 12 когорт


def group(cs, nmax=N):
    s = size[cs].sum()
    a = ACT.loc[cs, range(nmax)].sum()
    m = MAR.loc[cs, range(nmax)].fillna(0).sum()
    return s, (a / s).to_numpy(), (m / a).to_numpy(), a.to_numpy(), m.to_numpy()


def power(n, a, b):
    return a * n ** (-b)


def expo(n, a, k):
    return a * np.exp(-k * n)


def plateau(n, p, q, k):
    return p + q * np.exp(-k * n)


MODELS = [("pow", power, (0.4, 0.5)), ("exp", expo, (0.4, 0.1)), ("plat", plateau, (0.15, 0.3, 0.5))]


def fit(r, n):
    return {k: curve_fit(f, n, r[n], p0=p0, maxfev=20000)[0] for k, f, p0 in MODELS}


F = {k: f for k, f, _ in MODELS}
R2 = lambda x: float(round(float(x), 2))
R4 = lambda x: float(round(float(x), 4))
R5 = lambda x: float(round(float(x), 5))

# ===================== Сцена: 12 когорт, данные 0–12, хвосты 13–35 =====================
S12, r, m, a12, m12 = group(G12)
v = r * m                                              # ₽ на одного новичка в месяц n
cum = np.cumsum(v)
n_all = np.arange(1, N)
fit_sc = fit(r, n_all)
m_tail = m12[10:13].sum() / a12[10:13].sum()           # маржа на активного за три последних месяца данных
tails = {k: F[k](np.arange(N, 36), *p) * m_tail for k, p in fit_sc.items()}
ltv_sc = {k: {H: float(cum[-1] + t[:H - N].sum()) for H in (24, 36)} for k, t in tails.items()}
a_e, k_e = fit_sc["exp"]
ltv_exp_inf = cum[-1] + m_tail * a_e * np.exp(-k_e * N) / (1 - np.exp(-k_e))
d_m = 1.2 ** (1 / 12) - 1                              # 20% годовых → в месяц
v24 = np.concatenate([v, tails["pow"][:24 - N]])
disc24 = float((v24 / (1 + d_m) ** np.arange(24)).sum())
disc12 = float((v[:12] / (1 + d_m) ** np.arange(12)).sum())

# бутстрэп по когортам — тот же алгоритм и то же зерно, что в блоке кода 3
M12 = MAR.loc[G12, range(N)].fillna(0).to_numpy()
A12 = ACT.loc[G12, range(N)].to_numpy()
Sz = size[G12].to_numpy()


def ltv_boot(pick):
    s = Sz[pick].sum()
    rr = A12[pick].sum(0) / s
    ltv12 = M12[pick, :12].sum() / s
    (pa, pb), _ = curve_fit(power, np.arange(1, 13), rr[1:13], p0=(0.4, 0.5))
    mt = M12[pick, 10:13].sum() / A12[pick, 10:13].sum()
    ltv24 = M12[pick].sum() / s + (power(np.arange(13, 24), pa, pb) * mt).sum()
    return ltv12, ltv24


rng = np.random.default_rng(10)
boot = np.array([ltv_boot(rng.integers(0, 12, size=12)) for _ in range(2000)])
lo, hi = np.percentile(boot, [2.5, 97.5], axis=0)

# ===================== Интерактив: 6 месяцев данных, подгонка по 1–6 =====================
GROUPS = [("all", "12 когорт", G12), ("h2", "июль–дек. 2024", COH[0:6]), ("h1", "янв.–июнь 2025", COH[6:12]),
          ("jul", "июль 2024", COH[0:1])]
W = []
for key, name, cs in GROUPS:
    s, rg, mg, ag, mmg = group(cs)
    fs = fit(rg, np.arange(1, 7))
    mbar = mmg[4:7].sum() / ag[4:7].sum()               # свежая маржа на активного: месяцы 4–6
    known = rg[:7] * mg[:7]

    def ltv(k, H):
        if H <= 7:
            return float(known[:H].sum())
        return float(known.sum() + (F[k](np.arange(7, H), *fs[k]) * mbar).sum())

    chk = {k: {str(H): round(ltv(k, H), 2) for H in (6, 12, 24, 36)} for k in fs}
    mae = {k: R4(np.abs(F[k](np.arange(7, 13), *fs[k]) - rg[7:13]).mean()) for k in fs}
    W.append({"key": key, "name": name, "size": int(s), "r": [R5(x) for x in rg], "m": [R2(x) for x in mg],
              "mbar": R2(mbar), "fit": {k: [float(f"{x:.6g}") for x in p] for k, p in fs.items()},
              "real12": round(float((rg[:12] * mg[:12]).sum()), 2), "mae": mae, "chk": chk})

DATA = {
    "sc": {"size": int(S12), "r": [R5(x) for x in r], "m": [R2(x) for x in m], "mtail": R2(m_tail),
           "fit": {k: [float(f"{x:.6g}") for x in p] for k, p in fit_sc.items()},
           "ltv": {k: {str(H): round(x) for H, x in d.items()} for k, d in ltv_sc.items()},
           "boot": {"lo12": round(lo[0]), "hi12": round(hi[0]), "lo24": round(lo[1]), "hi24": round(hi[1])},
           "disc24": round(disc24), "disc12": round(disc12), "d": R5(d_m)},
    "w": W,
}

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s2 = re.sub(r"/\*data:start\*/.*?/\*data:end\*/",
            lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/",
            s, flags=re.S)
if s2 != s:
    js.write_text(s2, encoding="utf-8")

# ===================== Числа для текста =====================
P = lambda x: f"{100 * x:.1f}".replace(".", ",")
print("== 12 когорт ==", S12, "клиентов")
print("r(n), %:", [P(x) for x in r])
print("m(n), ₽:", [round(x) for x in m], "m_tail", round(m_tail))
print("v(n), ₽:", [round(x) for x in v])
print("LTV по месяцам:", [round(x) for x in cum], " LTV6", round(cum[5]), "LTV12", round(cum[11]),
      "доля месяца 0", P(cum[0] / cum[11]), "доля 0–5", P(cum[5] / cum[11]))
print("подгонки по 1–12:", {k: np.round(p, 4) for k, p in fit_sc.items()})
print("LTV24/36 по хвостам:", {k: {H: round(x) for H, x in d.items()} for k, d in ltv_sc.items()},
      "экспонента до бесконечности", round(ltv_exp_inf))
print("хвосты в месяц 35, ₽:", {k: round(t[-1], 1) for k, t in tails.items()})
print("степенная: b < 1 — сумма до бесконечности расходится:", fit_sc["pow"][1] < 1)
print("дисконт 20% годовых: в месяц", P(d_m), "LTV12", round(cum[11]), "→", round(disc12),
      "LTV24 степ.", round(ltv_sc["pow"][24]), "→", round(disc24), "минус", P(1 - disc24 / ltv_sc["pow"][24]))
print("бутстрэп: LTV12", round(cum[11]), [round(lo[0]), round(hi[0])], "LTV24 степ.", round(ltv_boot(np.arange(12))[1]),
      [round(lo[1]), round(hi[1])])

churn = 1 - r[1:] / r[:-1]
print("отток когорты c(n) = 1 − r(n+1)/r(n), %:", [P(x) for x in churn])
arpu = m12[:12].sum() / a12[:12].sum()
c_first = churn[0]
c_old = 1 - (r[12] / r[6]) ** (1 / 6)
c_year = 1 - r[12] ** (1 / 12)
print("ARPU (маржа на активного, месяцы 0–11):", round(arpu))
for nm, c in [("отток первого месяца", c_first), ("средний за год", c_year), ("отток старожилов, месяцы 6–12", c_old)]:
    print(f"  {nm}: c = {P(c)}% → LTV = {round(arpu / c)}")
# отток по людям: был активен в месяц t, не был в t+1
ids_m = ac.groupby("month").client_id.apply(set)
ms = sorted(ids_m.index)
ch_people = [1 - len(ids_m[ms[i]] & ids_m[ms[i + 1]]) / len(ids_m[ms[i]]) for i in range(12, 23)]
print("отток по людям (месяц к месяцу, июль 2025 — июнь 2026), %:", P(np.mean(ch_people)))
back = []
for i in range(12, 17):
    gone = ids_m[ms[i]] - ids_m[ms[i + 1]]
    later = set().union(*[ids_m[ms[j]] for j in range(i + 2, min(i + 8, 24))])
    back.append(len(gone & later) / len(gone))
print("  из них вернулись в следующие полгода, %:", P(np.mean(back)))

print("== горизонты ==", "LTV6", round(cum[5]), "LTV12", round(cum[11]),
      "LTV24", {k: ltv_sc[k][24] for k in ltv_sc}, "LTV36", {k: ltv_sc[k][36] for k in ltv_sc})
print("== рост удержания месяца 1 на 5 п. п. ==")
k1 = (r[1] + 0.05) / r[1]
print("  множитель", round(k1, 4), "LTV12", round(cum[11]), "→", round(cum[0] + k1 * (cum[11] - cum[0])),
      "только месяц 1:", round(0.05 * m[1]), "LTV24 степ.", round(ltv_sc["pow"][24]), "→",
      round(cum[0] + k1 * (ltv_sc["pow"][24] - cum[0])))

print("== выручка и маржа ==")
net12 = NET.loc[G12, range(12)].fillna(0).sum().sum() / S12
print("  LTV12 по чистой выручке", round(net12), "по марже", round(cum[11]), "в", round(net12 / cum[11], 2), "раза",
      " за 24 мес. всего: чистая выручка", round(od.net.sum() / 1e6, 2), "маржа", round(od.margin.sum() / 1e6, 2),
      round(od.net.sum() / od.margin.sum(), 2))

print("== каналы, 12 когорт ==")
for ch in ["органика", "поиск", "соцсети", "партнёры"]:
    ids = cl[(cl.channel == ch) & cl.cohort.isin(G12)].client_id
    o = od[od.client_id.isin(ids)]
    n_ = len(ids)
    spend = sp[(sp.channel == ch) & (sp.month >= "2024-07") & (sp.month <= "2025-06")].spend.sum()
    print(f"  {ch}: {n_} клиентов, LTV6 {round(o[o.n <= 5].margin.sum() / n_)}, LTV12 {round(o[o.n <= 11].margin.sum() / n_)},"
          f" LTV12 по выручке {round(o[o.n <= 11].net.sum() / n_)}, CAC {round(spend / n_) if spend else '—'}")
for cc in ["BY", "RU", "KZ", "UZ"]:
    ids = cl[(cl.country == cc) & cl.cohort.isin(G12)].client_id
    print(f"  страна {cc}: LTV12 {round(od[od.client_id.isin(ids) & (od.n <= 11)].margin.sum() / len(ids))}")

print("== выжившие когорты ==")
halves = {"июль–дек. 2024": COH[0:6], "янв.–июнь 2025": COH[6:12], "июль–дек. 2025": COH[12:18], "янв.–июнь 2026": COH[18:24]}
for nm, cs in halves.items():
    row = []
    for n in (1, 3, 6, 12):
        ok = [c for c in cs if age[c] >= n]
        row.append(P(ACT.loc[ok, n].sum() / size[ok].sum()) if ok else "—")
    print(" ", nm, row)
for n in (1, 6, 12, 18, 23):
    ok = [c for c in COH if age[c] >= n]
    print(f"  месяц {n}: когорт {len(ok)} ({ok[0]} … {ok[-1]})")

print("== тяжёлый хвост ==")
netc = od.groupby("client_id").net.sum().reindex(cl.client_id).fillna(0).sort_values(ascending=False).to_numpy()
for q in (0.01, 0.05):
    k = int(round(q * len(netc)))
    print(f"  {q:.0%} клиентов ({k}) — {P(netc[:k].sum() / netc.sum())}% чистой выручки за 24 мес.")
ids = cl[cl.cohort.isin(G12)].client_id
per = od[od.client_id.isin(ids) & (od.n <= 11)].groupby("client_id").margin.sum().reindex(ids).fillna(0)
per = per.sort_values(ascending=False).to_numpy()
k = int(round(0.01 * len(per)))
print(f"  LTV12: 1% клиентов ({k}) — {P(per[:k].sum() / per.sum())}% маржи; среднее {round(per.mean())},"
      f" без них {round(per[k:].mean())}, медиана {round(float(np.median(per)))}, без покупок {P((per == 0).mean())}%")

print("== интерактив ==")
for w in W:
    print(" ", w["name"], w["size"], "mbar", w["mbar"], "real12", round(w["real12"]), "mae п.п.",
          {k: round(100 * x, 2) for k, x in w["mae"].items()})
    print("    ", {k: {H: round(x) for H, x in d.items()} for k, d in w["chk"].items()})
    print("     r12 прогноз:", {k: P(F[k](12, *w_fit)) for k, w_fit in [(k, np.array(p)) for k, p in w["fit"].items()]},
          "факт", P(w["r"][12]))
