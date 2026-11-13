"""Распределения в scipy.stats, Пуассон для заказов за день, подбор логнормального к чекам.

Страница 5.2 «Случайные величины и распределения» курса «Аналитика 101». Три блока раздела «Код» подряд: общие методы распределений, сравнение заказов за день с Пуассоном, подбор логнормального распределения к чекам и точки Q–Q-графика.
Запуск из корня папки материалов: python da-5-2-distributions/distributions.py
Нужен общий набор data/probability/.
"""

# ===== У всех распределений scipy.stats одни и те же методы =====
from scipy import stats

buys = stats.binom(n=100, p=0.034)          # покупок из 100 визитов
print("P(K = 3)  =", buys.pmf(3).round(4))
print("P(K <= 5) =", buys.cdf(5).round(4))
print("среднее", buys.mean().round(2), "дисперсия", buys.var().round(3))

gap = stats.expon(scale=12)                  # дней между заказами, среднее 12
print("плотность в нуле:", gap.pdf(0).round(4), "на день")
print("P(интервал <= 7 дней) =", gap.cdf(7).round(4))
print("медиана", gap.median().round(2), "95-й перцентиль", gap.ppf(0.95).round(2))

check = stats.lognorm(s=0.6, scale=3000)     # чек: медиана 3 000 ₽, сигма 0,6
print("квантили 5, 50 и 95%:", check.ppf([0.05, 0.5, 0.95]).round())
print("среднее", check.mean().round())

sample = check.rvs(size=5, random_state=505) # генерация с зерном
print("пять чеков:", sample.round(-1))

# ===== Заказы за день похожи на Пуассона: среднее близко к дисперсии =====
import pandas as pd
from scipy import stats

orders = pd.read_csv("data/probability/daily_orders.csv")["orders"]
print(len(orders), "дней: среднее", round(orders.mean(), 2),
      "дисперсия", round(orders.var(), 2))

model = stats.poisson(mu=orders.mean())      # у Пуассона среднее = дисперсии
bins = [(0, 32), (33, 37), (38, 42), (43, 47), (48, 100)]
for lo, hi in bins:
    fact = orders.between(lo, hi).mean()
    theory = model.cdf(hi) - model.cdf(lo - 1)
    print(f"{lo:>3}–{hi:<3} заказов: дни {fact:.3f}  Пуассон {theory:.3f}")

# ===== Логнормальное повторяет медиану чеков и промахивается в хвосте =====
import numpy as np
import pandas as pd
from scipy import stats

amount = pd.read_csv("data/probability/checks.csv")["amount"]
s, loc, scale = stats.lognorm.fit(amount, floc=0)   # loc = 0: чек не бывает меньше нуля
print(f"сигма {s:.3f}, медиана модели {scale:.0f} ₽")
model = stats.lognorm(s, scale=scale)

p = [0.5, 0.9, 0.95, 0.99, 0.999]
table = pd.DataFrame({"чеки": amount.quantile(p).values, "модель": model.ppf(p)}, index=p)
print(table.round(-1).astype(int))
print("дороже 15 000 ₽: чеки", round((amount > 15_000).mean(), 4),
      "модель", model.sf(15_000).round(4))

# точки Q–Q-графика: те же уровни у данных и у модели
probs = (np.arange(1, 400) - 0.5) / 399
qq = pd.DataFrame({"модель": model.ppf(probs), "чеки": np.quantile(amount, probs)})
print(len(qq), "точек; последние три:")
print(qq.tail(3).round(-1).astype(int).to_string(index=False))
