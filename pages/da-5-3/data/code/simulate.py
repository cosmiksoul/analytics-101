import numpy as np, pandas as pd

amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
rng = np.random.default_rng(53)

def sample_means(x, n, k=10_000):
    """k случайных выборок по n значений (с возвращением) и среднее каждой"""
    return rng.choice(x, size=(k, n)).mean(axis=1)

print(f"чеки: μ = {amount.mean():.0f} ₽, медиана {np.median(amount):.0f} ₽")
for n in [1, 5, 30, 120, 480]:
    m = sample_means(amount, n)
    lo, hi = np.percentile(m, [2.5, 97.5])
    print(f"n = {n:>3}: среднее средних {m.mean():5.0f}, 95% средних в [{lo:5.0f}; {hi:5.0f}]")

m = sample_means(amount, 30)                  # текстовая гистограмма средних по 30 чеков
counts, edges = np.histogram(m, bins=np.arange(2000, 9001, 500))
for c, e in zip(counts, edges):
    print(f"{e:4.0f}–{e + 500:<4.0f} {'█' * round(c / 50):<34} {c}")
print(f"вне 2000–9000: {np.sum((m < 2000) | (m >= 9000))}")
