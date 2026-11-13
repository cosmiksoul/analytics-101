import numpy as np, pandas as pd

amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
mu, sigma = amount.mean(), amount.std()
rng = np.random.default_rng(57)
skew = lambda x: ((x - x.mean()) ** 3).mean() / x.std() ** 3

for n in [1_000, 10_000]:
    one = rng.choice(amount, size=n)                           # одна выборка из n чеков
    means = rng.choice(amount, size=(2_000, n)).mean(axis=1)   # 2 000 средних по n чеков
    print(f"n = {n:>6}: асимметрия чеков в выборке {skew(one):5.2f}, асимметрия средних {skew(means):5.2f}")

print(f"μ ± 2σ для одного чека: [{mu - 2 * sigma:.0f}; {mu + 2 * sigma:.0f}] ₽")
print(f"чеков дороже μ + 2σ: {np.mean(amount > mu + 2 * sigma):.1%}, дешевле μ − 2σ: {np.mean(amount < mu - 2 * sigma):.1%}")
