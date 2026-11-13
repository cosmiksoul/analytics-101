"""Данные сцены и калькулятора страницы 11.2 из учебных данных data/ab (и одно число из data/unit).

Запуск:  python3 pages/da-11-2/data/gen_page.py
Пользовательские метрики — по соглашению README темы 11: конверсия — доля людей хотя бы с одной покупкой
за время теста, выручка — сумма revenue на человека; боты исключены, группа — по exposures.csv, день — минский.
Вписывает DATA в page.js между /*data:start*/ и /*data:end*/ и печатает числа, которые стоят в тексте страницы.
"""
import json, re
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
ROOT = PAGE.parents[1]
AB, UNIT = ROOT / "data" / "ab", ROOT / "data" / "unit"
BOTS = ["u_025389", "u_053191", "u_055948"]

exp = pd.read_csv(AB / "exposures.csv", parse_dates=["exposed_at"])
exp = exp[~exp.user_id.isin(BOTS)]
ses = pd.read_parquet(AB / "sessions.parquet")
ses = ses[~ses.user_id.isin(BOTS)]
users = (ses.groupby(["experiment", "user_id"]).agg(conv=("converted", "max"), revenue=("revenue", "sum"))
            .reset_index().merge(exp, on=["experiment", "user_id"]))
exp["day"] = exp.exposed_at.dt.tz_convert("Europe/Minsk").dt.date

z = lambda q: stats.norm.ppf(q)
ZA, ZB = z(0.975), z(0.8)
Z2 = (ZA + ZB) ** 2


def n_prop(p0, d, za=ZA, zb=ZB):
    p1 = p0 + d
    return (za + zb) ** 2 * (p0 * (1 - p0) + p1 * (1 - p1)) / d ** 2


facts = {}
# --- база: контроль checkout_v2 (4 недели) и A/A aa_check (2 недели) ---
chk = users[users.experiment == "checkout_v2"]
A, B = chk[chk.group == "A"], chk[chk.group == "B"]
p0, mu, sd = A.conv.mean(), A.revenue.mean(), A.revenue.std()
aa = users[users.experiment == "aa_check"]
aaA, aaB = aa[aa.group == "A"], aa[aa.group == "B"]
facts["база checkout_v2 A"] = dict(n=len(A), p0=round(p0, 5), mu=round(mu, 1), sd=round(sd, 1), cv=round(sd / mu, 2))
facts["aa_check 2 недели"] = dict(n=len(aa), conv=round(aa.conv.mean(), 4), mu=round(aa.revenue.mean(), 1),
                                  cv=round(aa.revenue.std() / aa.revenue.mean(), 2))

# --- A/A: баланс, конверсия, выручка ---
nA, nB = len(aaA), len(aaB)
chi = stats.chisquare([nA, nB])
xA, xB = aaA.conv.sum(), aaB.conv.sum()
pp = (xA + xB) / (nA + nB)
zz = (xB / nB - xA / nA) / np.sqrt(pp * (1 - pp) * (1 / nA + 1 / nB))
w = stats.ttest_ind(aaB.revenue, aaA.revenue, equal_var=False)
facts["A/A"] = dict(nA=nA, nB=nB, chi_p=round(chi.pvalue, 3), convA=round(xA / nA, 4), convB=round(xB / nB, 4),
                    z=round(zz, 2), p=round(2 * stats.norm.sf(abs(zz)), 3), revA=round(aaA.revenue.mean(), 1),
                    revB=round(aaB.revenue.mean(), 1), rev_p=round(w.pvalue, 3))

# --- MDE из денег ---
o = pd.read_csv(UNIT / "orders.csv")
o["margin"] = o.revenue - o.cogs - o.delivery_cost - o.payment_fee
retail = o[(o.model == "свой товар") & (o.refunded == 0) & (o.gmv < 10_000)]
margin = round(retail.margin.mean())
people = len(chk)
point = people * 0.01 * margin * 13
mde = round(5e6 / point / 100, 4)
d_rev = round(mu * mde / p0)
facts["деньги"] = dict(margin=margin, people=people, buyers_per_pp=round(people * 0.01), point_4w=round(point / 13),
                       point_year=round(point), mde=mde, mde_rel=round(mde / p0, 4), d_rev=d_rev)

# --- размеры выборки ---
n_c = int(np.ceil(n_prop(p0, mde)))
n_r = int(np.ceil(Z2 * 2 * sd ** 2 / d_rev ** 2))
n_half = int(np.ceil(n_prop(p0, mde / 2)))
flow = exp[exp.experiment == "checkout_v2"].day.value_counts().sort_index()
facts["выборка"] = dict(n_conv=n_c, n_rev=n_r, ratio=round(n_r / n_c, 2), n_half=n_half, half_ratio=round(n_half / n_c, 2),
                        flow_mean=round(flow.mean(), 1), days_conv=int(np.ceil(2 * n_c / flow.mean())),
                        days_rev=int(np.ceil(2 * n_r / flow.mean())), first_day=int(flow.iloc[0]),
                        last_week=round(flow.iloc[-7:].mean(), 1))
facts["множители"] = dict(alpha01=round((z(0.995) + ZB) ** 2 / Z2, 3), power90=round((ZA + z(0.9)) ** 2 / Z2, 3),
                          one_sided=round((z(0.95) + ZB) ** 2 / Z2, 3),
                          split80=round(1 / (4 * 0.8 * 0.2), 4), split90=round(1 / (4 * 0.9 * 0.1), 4))
facts["+5%"] = dict(rel=int(np.ceil(n_prop(p0, 0.05 * p0))), abs=int(np.ceil(n_prop(p0, 0.05))))
buyers = A[A.conv == 1]
cv_b = buyers.revenue.std() / buyers.revenue.mean()
facts["средний чек"] = dict(cv=round(cv_b, 2), buyers_need=int(np.ceil(Z2 * 2 * cv_b ** 2 / (mde / p0) ** 2)),
                            users_need=int(np.ceil(Z2 * 2 * cv_b ** 2 / (mde / p0) ** 2 / p0)))
r = A.revenue.to_numpy()
top = np.sort(r)[::-1][: int(round(len(r) * 0.01))]
dev = (r - mu) ** 2
facts["хвост"] = dict(top1_n=len(top), top1_min=int(top.min()), rev_share=round(top.sum() / r.sum(), 3),
                      var_share=round(np.sort(dev)[::-1][: len(top)].sum() / dev.sum(), 3))
# недельный цикл: сессии группы A checkout_v2 в выходные против будней той же недели (недели 2–4),
# конверсия сессии в «контрольных» данных (aa_check целиком, группы A двух других тестов)
ses["d"] = ses.session_start.dt.tz_convert("Europe/Minsk").dt.normalize()
sA = ses[(ses.experiment == "checkout_v2") & ses.user_id.isin(A.user_id)]
daily = sA.groupby("d").size().iloc[7:].to_numpy().reshape(3, 7)              # недели 2–4, пн…вс
ctl = ses[(ses.experiment == "aa_check") | ((ses.experiment != "aa_check") & (ses.group == "A"))]
cw = ctl.groupby(ctl.d.dt.dayofweek >= 5).converted.mean()
facts["неделя"] = dict(sess_weekend=round(daily[:, 5:].mean() / daily[:, :5].mean() - 1, 3),
                       conv_weekday=round(cw[False], 4), conv_weekend=round(cw[True], 4), conv_rel=round(cw[True] / cw[False] - 1, 3))

# --- результаты checkout_v2 и мощность дизайна ---
nA2, nB2 = len(A), len(B)
se_c = np.sqrt(p0 * (1 - p0) / nA2 + B.conv.mean() * (1 - B.conv.mean()) / nB2)
eff_c = B.conv.mean() - p0
se_r = np.sqrt(A.revenue.var() / nA2 + B.revenue.var() / nB2)
eff_r = B.revenue.mean() - mu
mde_real = 0.01                                                              # MDE набранной выборки: d = 2,8 · SE(p0, p0 + d)
for _ in range(50):
    mde_real = (ZA + ZB) * np.sqrt(p0 * (1 - p0) / nA2 + (p0 + mde_real) * (1 - p0 - mde_real) / nB2)
facts["checkout_v2"] = dict(nA=nA2, nB=nB2, eff_pp=round(eff_c * 100, 2), ci=[round((eff_c - ZA * se_c) * 100, 2), round((eff_c + ZA * se_c) * 100, 2)],
                            mde_real_pp=round(mde_real * 100, 2),
                            power_obs=round(stats.norm.cdf(eff_c / se_c - ZA), 3),
                            rev_rel=round(eff_r / mu, 3), rev_mde=round((ZA + ZB) * se_r), rev_mde_rel=round((ZA + ZB) * se_r / mu, 3),
                            rev_power=round(stats.norm.cdf(eff_r / se_r - ZA), 3))

# --- кривая набора людей в checkout_v2: среднее двух групп к концу каждого дня ---
cum = pd.crosstab(exp[exp.experiment == "checkout_v2"].day, exp[exp.experiment == "checkout_v2"].group).cumsum()
cum_avg = ((cum.A + cum.B) / 2).round(1).tolist()
tail_flow = round((cum_avg[-1] - cum_avg[-8]) / 7, 2)                        # в группу в день, последняя неделя

DATA = dict(p0=round(p0, 6), mu=round(mu, 3), sd=round(sd, 2), mde=mde, dRev=d_rev, flow=round(flow.mean(), 2),
            p0aa=round(aa.conv.mean(), 4), cum=cum_avg, tail=tail_flow)
facts["сцена"] = dict(cum_day1=cum_avg[0], cum_day7=cum_avg[6], cum_day14=cum_avg[13], cum_day28=cum_avg[-1], tail=tail_flow,
                      day_half=round(28 + (n_half - cum_avg[-1]) / tail_flow, 1))

for k, v in facts.items():
    print(f"{k}: {v}")

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s, k = re.subn(r"/\*data:start\*/.*?/\*data:end\*/",
               lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False) + ";/*data:end*/", s, flags=re.S)
assert k == 1, "метка data не найдена"
js.write_text(s, encoding="utf-8")
