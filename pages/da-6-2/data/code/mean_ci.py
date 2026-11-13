import numpy as np, pandas as pd
from scipy import stats
from statsmodels.stats.weightstats import DescrStatsW

checks = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
week = checks[:270]                     # неделя продаж — 270 чеков
n, mean, s = week.size, week.mean(), week.std(ddof=1)   # s — по выборке, с n − 1
se = s / np.sqrt(n)                     # стандартная ошибка среднего
t = stats.t.ppf(0.975, df=n - 1)        # множитель t для 95%
print(f"n = {n}, среднее {mean:.0f} ₽, s = {s:.0f} ₽, SE = {se:.0f} ₽")
print(f"t = {t:.3f}, z = {stats.norm.ppf(0.975):.3f}")
print(f"по формуле:  [{mean - t * se:.0f}; {mean + t * se:.0f}]")

ds = DescrStatsW(week)                  # statsmodels: тот же t-интервал
for level in (0.80, 0.95, 0.99):
    lo, hi = ds.tconfint_mean(alpha=1 - level)
    print(f"statsmodels {level:.0%}: [{lo:.0f}; {hi:.0f}], ширина {hi - lo:.0f} ₽")
print(f"μ всех 20 000 чеков = {checks.mean():.0f} ₽")
