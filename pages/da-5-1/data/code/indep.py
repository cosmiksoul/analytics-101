import pandas as pd
from scipy.stats import chi2_contingency

v = pd.read_csv("data/probability/visits.csv")
t = pd.crosstab(v["source"], v["bought"])

# 1. Сравним доли визитов с покупкой по источникам с общей долей.
print(v.groupby("source")["bought"].mean().round(4).to_dict(), round(v["bought"].mean(), 4))

# 2. Число визитов, которое ожидается в каждой ячейке при независимости.
res = chi2_contingency(t)
print(pd.DataFrame(res.expected_freq, index=t.index, columns=t.columns).round(1))

# 3. Критерий хи-квадрат оценивает расхождение наблюдаемых и ожидаемых частот.
print(f"хи-квадрат = {res.statistic:.1f}, степеней свободы {res.dof}, p = {res.pvalue:.1e}")

# Для сравнения проверим, связана ли покупка с чётностью номера визита.
even = v["visit_id"] % 2 == 0
r2 = chi2_contingency(pd.crosstab(even, v["bought"]))
print(f"чётность: хи-квадрат = {r2.statistic:.2f}, p = {r2.pvalue:.2f}")
