import pandas as pd
from scipy import stats

orders = pd.read_csv("data/probability/daily_orders.csv")["orders"]
print(len(orders), "дней: среднее", round(orders.mean(), 2),
      "дисперсия", round(orders.var(), 2))

model = stats.poisson(mu=orders.mean())      # в модели Пуассона среднее и дисперсия равны λ
bins = [(0, 32), (33, 37), (38, 42), (43, 47), (48, 100)]
for lo, hi in bins:
    fact = orders.between(lo, hi).mean()
    theory = model.cdf(hi) - model.cdf(lo - 1)
    print(f"{lo:>3}–{hi:<3} заказов: дни {fact:.3f}  Пуассон {theory:.3f}")
