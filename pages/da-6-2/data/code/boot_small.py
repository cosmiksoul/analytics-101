import numpy as np, pandas as pd
from scipy import stats

gaps = pd.read_csv("data/probability/order_gaps.csv")["gap_days"].to_numpy(float)
checks = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
rng = np.random.default_rng(65)

def boot_ci(x, B=2000):
    boot = x[rng.integers(0, x.size, size=(B, x.size))].mean(axis=1)
    return np.quantile(boot, [0.025, 0.975])          # процентильный 95%

mu = gaps.mean()
print("2 000 выборок дней между заказами: покрытие и средняя ширина 95%")
for n in (10, 40):
    t = stats.t.ppf(0.975, n - 1)
    hit_b = hit_t = w_b = w_t = 0
    for _ in range(2000):
        x = rng.choice(gaps, n)
        lo, hi = boot_ci(x)
        se = x.std(ddof=1) / np.sqrt(n)
        hit_b += lo <= mu <= hi; w_b += hi - lo
        hit_t += abs(x.mean() - mu) <= t * se; w_t += 2 * t * se
    print(f"  n = {n}: бутстрэп {hit_b / 2000:.1%}, ширина {w_b / 2000:.1f} дн. · "
          f"t {hit_t / 2000:.1%}, ширина {w_t / 2000:.1f} дн.")

x = rng.choice(checks[checks < 15_000], 270)          # выгрузка потеряла чеки дороже 15 000 ₽
lo, hi = boot_ci(x)
print(f"без опта: бутстрэп 95% [{lo:.0f}; {hi:.0f}] ₽, а μ = {checks.mean():.0f} ₽")
