import numpy as np, pandas as pd

amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
mu, sigma = amount.mean(), amount.std()
rng = np.random.default_rng(56)
skew = lambda x: ((x - x.mean()) ** 3).mean() / x.std() ** 3

print(f"асимметрия чеков: {skew(amount):.2f}")
for n in [30, 100, 300, 1000]:
    m = rng.choice(amount, size=(20_000, n)).mean(axis=1)
    se = sigma / np.sqrt(n)
    left, right = np.mean(m < mu - 1.96 * se), np.mean(m > mu + 1.96 * se)
    print(f"n = {n:>4}: асимметрия средних {skew(m):.2f} (формула {skew(amount) / np.sqrt(n):.2f}), "
          f"за μ ± 1,96·SE слева {left:.1%}, справа {right:.1%}")
