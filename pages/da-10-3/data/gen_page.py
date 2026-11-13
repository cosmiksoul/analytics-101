"""Данные сцены и интерактива страницы 10.3 из учебной выгрузки data/unit.

Запуск:  python3 pages/da-10-3/data/gen_page.py
Считает по соглашениям README темы 10 (маржинальный доход заказа, LTV на зарегистрированного клиента,
прирост месяца n — по когортам, дожившим до n) и вписывает DATA в page.js между /*data:start*/ и /*data:end*/.
Печатает числа, которые стоят в тексте страницы: их сверяют с выводом при каждом перезапуске.
"""
import json, re
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
U = PAGE.parents[1] / "data" / "unit"

cl = pd.read_csv(U / "clients.csv", parse_dates=["signup_date"])
od = pd.read_csv(U / "orders.csv", parse_dates=["order_date"])
ac = pd.read_csv(U / "activity.csv")
sp = pd.read_csv(U / "marketing_spend.csv")

od["margin"] = np.where(od.refunded == 1, -2 * od.delivery_cost - od.payment_fee,
                        od.revenue - od.cogs - od.delivery_cost - od.payment_fee)
od["netrev"] = np.where(od.refunded == 1, 0, od.revenue)
month = lambda d: d.dt.year * 12 + d.dt.month
LAST = 2026 * 12 + 6
cl["m"] = month(cl.signup_date)
od = od.merge(cl[["client_id", "channel", "m"]], on="client_id")
od["n"] = month(od.order_date) - od.m
ac["n"] = ac.month.str[:4].astype(int) * 12 + ac.month.str[5:].astype(int)
ac = ac.merge(cl[["client_id", "channel", "m"]], on="client_id")
ac["n"] = ac.n - ac.m

S = sp.pivot(index="month", columns="channel", values="spend")
N = pd.crosstab(cl.signup_date.dt.strftime("%Y-%m"), cl.channel)
CAC = (S.sum() / N[S.columns].sum()).to_dict()


def lived(ch, n):
    size = cl[cl.channel == ch].groupby("m").size()
    return size[size.index + n <= LAST].sum()


def inc(ch, col="margin"):
    s = od[od.channel == ch].groupby("n")[col].sum()
    return np.array([s.get(n, 0) / lived(ch, n) for n in range(24)])


def ret(ch, n):
    return (ac[(ac.channel == ch) & (ac.n == n)].shape[0]) / lived(ch, n)


KEYS = {"поиск": "search", "соцсети": "social", "партнёры": "partners"}
ch_data, facts = {}, {}
for ch, key in KEYS.items():
    m, r = inc(ch), inc(ch, "netrev")
    o = od[od.channel == ch]
    cum = m.cumsum()
    hit = np.flatnonzero(cum >= CAC[ch])
    ch_data[key] = {"name": ch, "cac": round(CAC[ch], 2), "inc": [round(x, 4) for x in m],
                    "aov": round(o.paid.mean()), "mr": round(o.margin.sum() / o.paid.sum() * 100, 1),
                    "r1": round(ret(ch, 1) * 100, 1), "r12": round(ret(ch, 12) * 100, 1)}
    facts[ch] = {"CAC": round(CAC[ch]), "inc0": round(m[0]), "bal": {n: round(cum[n] - CAC[ch]) for n in (0, 5, 6, 11, 12, 23)},
                 "LTV12": round(cum[11], 1), "LTV24": round(cum[23]), "LTV24 rev": round(r.cumsum()[23]),
                 "rev0": round(r[0]), "rev/margin 24": round(r.cumsum()[23] / cum[23], 2),
                 "LTV24/CAC": round(cum[23] / CAC[ch], 2), "LTV24rev/CAC": round(r.cumsum()[23] / CAC[ch], 2),
                 "LTV12/CAC": round(cum[11] / CAC[ch], 2), "payback n": int(hit[0]) if len(hit) else None,
                 "AOV": ch_data[key]["aov"], "margin %": ch_data[key]["mr"], "R1": ch_data[key]["r1"], "R12": ch_data[key]["r12"],
                 "first incs": [round(x) for x in m[:13]], "max CAC 12 (int)": int(np.floor(cum[11]))}

# числа для текста
tot = od.netrev.sum() / od.margin.sum()
search = inc("поиск"); cs = search.cumsum()
beta = {ch: np.polyfit(np.log(S[ch]), np.log(N[ch]), 1)[0] for ch in ["поиск", "соцсети"]}
marg = {ch: CAC[ch] / b for ch, b in beta.items()}
pay_marg = int(np.flatnonzero(cs >= marg["поиск"])[0])
cac_attr = CAC["поиск"] / 1.1
pay_attr = int(np.flatnonzero(cs >= cac_attr)[0])
year = cl[cl.signup_date >= "2025-07-01"].channel.value_counts()
gain_rel = sum(year[ch] * 0.02 * inc(ch)[1:12].sum() for ch in year.index)
r1s = ret("поиск", 1)
gain_pp = sum(year[ch] * (0.02 / ret(ch, 1)) * inc(ch)[1:12].sum() for ch in year.index)
blended = S.sum().sum() / len(cl)
paid_only = S.sum().sum() / N[S.columns].sum().sum()
facts["_"] = {"net revenue / margin, all": round(tot, 2), "beta": {k: round(v, 3) for k, v in beta.items()},
              "marginal CAC": {k: round(v) for k, v in marg.items()}, "search marginal payback n": pay_marg,
              "search CAC if +10% attributed": round(cac_attr), "payback n then": pay_attr,
              "+2% rel per search client": round(0.02 * search[1:12].sum(), 1), "+2% rel year, mln": round(gain_rel / 1e6, 2),
              "+2 pp search rel": round(0.02 / r1s * 100, 1), "+2 pp year, mln": round(gain_pp / 1e6, 2),
              "newcomers year": int(year.sum()), "blended CAC": round(blended), "paid CAC": round(paid_only),
              "social Oct→Nov": (int(S.loc["2025-10", "соцсети"]), int(S.loc["2025-11", "соцсети"]),
                                 int(N.loc["2025-10", "соцсети"]), int(N.loc["2025-11", "соцсети"])),
              "search 2026H1 spend avg": round(S.loc["2026-01":"2026-06", "поиск"].mean())}

DATA = {"ch": ch_data, "beta": {KEYS[k]: round(v, 3) for k, v in beta.items()}}
js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s, k = re.subn(r"/\*data:start\*/.*?/\*data:end\*/",
               lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False) + ";/*data:end*/", s, flags=re.S)
assert k == 1, "метка data не найдена"
js.write_text(s, encoding="utf-8")
for k_, v in facts.items():
    print(k_, v)
