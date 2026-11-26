import numpy as np, pandas as pd

bought = pd.read_csv("data/probability/visits.csv")["bought"].to_numpy(np.int8)
p = bought.mean()
sigma = np.sqrt(p * (1 - p))            # σ индикатора покупки (0 или 1)
rng = np.random.default_rng(55)
skew = lambda x: ((x - x.mean()) ** 3).mean() / x.std() ** 3

print(f"конверсия p = {p:.4f}, σ индикатора покупки = {sigma:.4f}")
for n in [30, 300, 3000]:
    shares = rng.choice(bought, size=(10_000, n)).mean(axis=1)   # доля покупок в n визитах
    print(f"n = {n:>4}: разброс долей {shares.std():.4f}, σ/√n {sigma / np.sqrt(n):.4f}, "
          f"без покупок {np.mean(shares == 0):5.1%}, асимметрия {skew(shares):.2f}")
