import numpy as np
import pandas as pd
import statsmodels.formula.api as smf

BOTS = ["u_025389", "u_053191", "u_055948"]
exp = pd.read_csv("data/ab/exposures.csv").query("experiment == 'checkout_v2' and user_id not in @BOTS")
ses = pd.read_parquet("data/ab/sessions.parquet").query("experiment == 'checkout_v2'")
pre = pd.read_csv("data/ab/pre_period.csv")

d = (exp[["user_id", "group"]]                                     # назначенный вариант из журнала показов
     .merge(ses.groupby("user_id", as_index=False).revenue.sum(), on="user_id", how="left")
     .merge(pre[["user_id", "revenue_pre"]], on="user_id", how="left")
     .fillna({"revenue": 0, "revenue_pre": 0}))                    # в учебных данных нет покупок до теста — траты равны 0
y, x = d.revenue, d.revenue_pre
theta = np.cov(x, y)[0, 1] / x.var()                               # один θ на обе группы
d["revenue_cuped"] = y - theta * (x - x.mean())

def effect(col):
    a, b = d.loc[d.group == "A", col], d.loc[d.group == "B", col]
    diff, se = b.mean() - a.mean(), np.sqrt(a.var() / len(a) + b.var() / len(b))
    return f"{diff:+.1f} ₽ [{diff - 1.96 * se:.1f}; {diff + 1.96 * se:.1f}], z = {diff / se:.2f}"

ratio = d.revenue_cuped.var() / y.var()
print(f"θ = {theta:.3f}, корреляция ρ = {x.corr(y):.3f}, дисперсия {ratio - 1:+.1%}")
print("без CUPED:", effect("revenue"))
print("с CUPED:  ", effect("revenue_cuped"))
print(f"Расчётный срок набора при равномерном притоке: {28 * ratio:.1f} дня вместо 28")

# сравниваем с оценкой коэффициента группы в линейной регрессии
fit = smf.ols("revenue ~ C(group) + revenue_pre", data=d).fit()
print(f"регрессия: {fit.params['C(group)[T.B]']:+.1f} ₽, SE {fit.bse['C(group)[T.B]']:.1f}")
