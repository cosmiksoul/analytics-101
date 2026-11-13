import numpy as np
import pandas as pd

amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy()
rng = np.random.default_rng(52)
x, y = rng.permutation(amount).reshape(2, -1)   # 10 000 пар разных чеков
mln = lambda v: round(v / 1e6, 1)                 # дисперсия в млн ₽²
print("Var X + Var Y =", mln(x.var() + y.var()))
print("Var(X + Y)    =", mln((x + y).var()))
print("Var(X + X)    =", mln((x + x).var()), "и 4·Var X =", mln(4 * x.var()))
print("ст. откл. суммы", round((x + y).std()), "а не", round(x.std() + y.std()))

week = rng.poisson(38, size=(100_000, 7)).sum(axis=1)   # заказы за 7 дней
print("заказы за неделю: дисперсия", round(week.var(), 1), "≈ 7 · 38 =", 7 * 38)
