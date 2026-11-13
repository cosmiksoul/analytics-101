import numpy as np, pandas as pd

spend = pd.read_csv("data/inference/users.csv")["spend"].to_numpy()
sigma2 = spend.var()               # σ² всей совокупности: здесь делим на N, это все 100 000
rng = np.random.default_rng(63)

print(" n   ÷n: среднее / σ²   ÷(n − 1): среднее / σ²   (n − 1)/n   s / σ")
for n in [2, 3, 5, 10, 30]:
    X = rng.choice(spend, size=(200_000, n))           # 200 000 выборок по n
    v0 = X.var(axis=1, ddof=0).mean() / sigma2         # делим на n
    v1 = X.var(axis=1, ddof=1).mean() / sigma2         # делим на n − 1
    sd = X.std(axis=1, ddof=1).mean() / np.sqrt(sigma2)
    print(f"{n:>2} {v0:15.3f} {v1:22.3f} {(n - 1) / n:15.3f} {sd:7.3f}")
