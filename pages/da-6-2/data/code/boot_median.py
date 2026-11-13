import numpy as np, pandas as pd
from scipy import stats

checks = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
x = checks[:270]                                    # та же неделя, 270 чеков
rng = np.random.default_rng(62)
B = 10_000
idx = rng.integers(0, x.size, size=(B, x.size))     # B перевыборок с возвращением: номера чеков
boot = np.median(x[idx], axis=1)                    # медиана каждой перевыборки
lo, hi = np.quantile(boot, [0.025, 0.975])          # процентильный интервал
print(f"медиана недели {np.median(x):.0f} ₽, бутстрэп 95%: [{lo:.0f}; {hi:.0f}]")
print(f"разброс бутстрэп-медиан: {boot.std(ddof=1):.0f} ₽")

for method in ("percentile", "BCa"):                # то же в SciPy
    r = stats.bootstrap((x,), np.median, n_resamples=B, method=method, rng=63)
    ci = r.confidence_interval
    print(f"scipy {method:>10}: [{ci.low:.0f}; {ci.high:.0f}]")
print(f"медиана всех 20 000 чеков = {np.median(checks):.0f} ₽")
