import numpy as np, pandas as pd
from scipy import stats
from statsmodels.stats.proportion import proportion_confint

gaps = pd.read_csv("data/probability/order_gaps.csv")["gap_days"].to_numpy(float)
checks = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
rng = np.random.default_rng(64)

def t_coverage(pop, n, k=10_000, level=0.95):
    S = rng.choice(pop, size=(k, n))                       # k выборок по n значений
    m, se = S.mean(axis=1), S.std(axis=1, ddof=1) / np.sqrt(n)
    t = stats.t.ppf(0.5 + level / 2, df=n - 1)
    return np.mean(np.abs(m - pop.mean()) <= t * se)        # доля интервалов, накрывших μ

print("покрытие t-интервала 95%")
for n in (10, 40, 270, 1000):
    print(f"  n = {n:>4}: дни между заказами {t_coverage(gaps, n):.1%}, чеки {t_coverage(checks, n):.1%}")

p = pd.read_csv("data/probability/visits.csv")["bought"].mean()   # истинная конверсия
print(f"покрытие интервала для доли 95%, p = {p:.2%}")
for n in (50, 100, 300, 1000, 3000):
    k = rng.binomial(n, p, size=20_000)                    # 20 000 выборок по n визитов
    cov = {}
    for method in ("normal", "wilson"):
        lo, hi = proportion_confint(k, n, method=method)
        cov[method] = np.mean((lo <= p) & (p <= hi))
    print(f"  n = {n:>4}: нормальный {cov['normal']:.1%}, Вилсон {cov['wilson']:.1%}")
