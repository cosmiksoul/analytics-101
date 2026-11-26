import numpy as np, pandas as pd

amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
sigma = amount.std()            # ddof=0: 20 000 чеков — вся совокупность
rng = np.random.default_rng(54)

print(f"σ чеков = {sigma:.0f} ₽")
print("    n  разброс средних   σ/√n  SD/SE   SD при n/4 / SD при n")
prev = None
for n in [1, 4, 16, 64, 256, 1024]:
    sd = rng.choice(amount, size=(10_000, n)).mean(axis=1).std()   # разброс 10 000 средних
    se = sigma / np.sqrt(n)                                          # стандартная ошибка по формуле
    ratio = "" if prev is None else f"{prev / sd:.2f}"
    print(f"{n:>5} {sd:14.0f} {se:8.0f} {sd / se:9.3f}   {ratio}")
    prev = sd
