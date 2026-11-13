import pandas as pd
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest

# 1. Источник визита × покупка: 100 000 учебных визитов
v = pd.read_csv("data/probability/visits.csv")
table = pd.crosstab(v.source, v.bought)
res = stats.chi2_contingency(table)
print(table)
print(f"хи-квадрат = {res.statistic:.1f}, степеней свободы {res.dof}, p = {res.pvalue:.1e}")
print("ожидаемые покупки без связи:", res.expected_freq[:, 1].round(1))
print("доля покупок:", (table[1] / table.sum(axis=1)).round(3).to_dict())

# 2. Доля оплативших в A/B-тесте: z-тест и хи-квадрат 2 × 2 — один и тот же тест
ab = pd.read_csv("data/inference/ab.csv")
paid = ab.groupby("group").paid.agg(["sum", "count"])
z, p = proportions_ztest(paid["sum"], paid["count"])
chi2 = stats.chi2_contingency(pd.crosstab(ab.group, ab.paid), correction=False)
print(paid.assign(share=paid["sum"] / paid["count"]).round(4))
print(f"z = {z:.3f}, z² = {z ** 2:.2f}, p = {p:.4f}")
print(f"хи-квадрат = {chi2.statistic:.2f}, p = {chi2.pvalue:.4f}")
