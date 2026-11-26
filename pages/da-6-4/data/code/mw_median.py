import numpy as np
import pandas as pd
from scipy import stats

checks = pd.read_csv("data/probability/checks.csv").amount.to_numpy(float)
med = np.median(checks)                       # 3 080 ₽


def upsell(x):
    # вариант Б: заказам дороже медианы предложили допродажу, они выросли на 30%
    return np.where(x > med, x * 1.3, x)


print("медианы совокупностей:", med, np.median(upsell(checks)))

rng = np.random.default_rng(604)
a = rng.choice(checks, 1000)
b = upsell(rng.choice(checks, 1000))
res = stats.mannwhitneyu(b, a)
print(f"медианы выборок: А {np.median(a):.0f}, Б {np.median(b):.0f} ₽")
print(f"Манн — Уитни: p = {res.pvalue:.1e}, U/(nА·nБ) с половинным весом совпадений = {res.statistic / (len(a) * len(b)):.3f}")

# 10 000 пар групп по 200 чеков: как часто тест значим
pv = stats.mannwhitneyu(upsell(rng.choice(checks, (10_000, 200))), rng.choice(checks, (10_000, 200)), axis=1).pvalue
print(f"значим в {(pv < 0.05).mean():.1%} повторов при равных медианах совокупностей")
