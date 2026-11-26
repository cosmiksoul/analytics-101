import numpy as np
from scipy import stats

def bayes_ab(nA, sA, nB, sB, draws=400_000, seed=11):
    """Для каждой группы обновляем равномерное распределение Beta(1, 1) по числу покупателей."""
    rng = np.random.default_rng(seed)
    pA = stats.beta(1 + sA, 1 + nA - sA).rvs(draws, random_state=rng)
    pB = stats.beta(1 + sB, 1 + nB - sB).rvs(draws, random_state=rng)
    lo, hi = np.percentile(pB - pA, [2.5, 97.5]) * 100
    print(f"  P(B > A) = {(pB > pA).mean():.5f}")
    print(f"  ожидаемые потери, если внедрить B: {np.maximum(pA - pB, 0).mean() * 100:.4f} п. п.")
    print(f"  ожидаемые потери, если оставить A: {np.maximum(pB - pA, 0).mean() * 100:.4f} п. п.")
    print(f"  95%-й байесовский интервал B − A: [{lo:.2f}; {hi:.2f}] п. п.")

# по каждой группе указаны участники и покупатели после исключения ботов
for name, counts in {"checkout_v2": (28439, 4005, 28358, 4326),
                     "aa_check": (19988, 2101, 20091, 2033)}.items():
    print(name)
    bayes_ab(*counts)
