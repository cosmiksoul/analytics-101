"""Плотность при смене единиц измерения, дисперсия суммы, логарифм, среднее и медиана.

Страница 5.2 «Случайные величины и распределения» курса «Аналитика 101». Четыре блока раздела «Нюансы» подряд.
Запуск из корня папки материалов: python da-5-2-distributions/nuances.py
Нужен общий набор data/probability/.
"""

# ===== Как меняется плотность при переводе дней в годы =====
from scipy import stats, integrate

days = stats.expon(scale=12)          # интервал между заказами в днях
years = stats.expon(scale=12 / 365)   # тот же интервал в годах
print("плотность в нуле:", days.pdf(0).round(3), "на день,",
      years.pdf(0).round(1), "на год")
print("P(до 7 дней):", days.cdf(7).round(4), "и", years.cdf(7 / 365).round(4))
area, err = integrate.quad(years.pdf, 0, 1)
print("площадь под плотностью в годах:", round(area, 6))

# ===== Как рассчитать дисперсию суммы =====
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

# ===== Асимметрия сумм покупок до и после логарифмирования =====
import numpy as np
import pandas as pd
from scipy import stats

rng = np.random.default_rng(505)
retail = rng.lognormal(mean=np.log(3000), sigma=0.6, size=20_000)
amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy()

for name, x in [("логнормальная выборка", retail), ("чеки checks.csv", amount)]:
    print(f"{name}: асимметрия {stats.skew(x):.2f}, "
          f"у логарифма {stats.skew(np.log(x)):.2f}")
logs = np.log(retail)
print("логарифм выборки: среднее", logs.mean().round(3), "ст. откл.", logs.std().round(3))
print("ln 3000 =", np.log(3000).round(3))

# ===== Как изменятся среднее и медиана без 1% самых дорогих чеков =====
import pandas as pd

amount = pd.read_csv("data/probability/checks.csv")["amount"]
print("все чеки:       среднее", round(amount.mean()), "медиана", int(amount.median()))

rest = amount.drop(amount.nlargest(200).index)            # без 1% самых дорогих
print("без 1% дорогих:  среднее", round(rest.mean()), "медиана", int(rest.median()))

plus = pd.concat([amount, pd.Series([1_000_000])])        # плюс один чек на 1 млн ₽
print("плюс чек 1 млн:  среднее", round(plus.mean()), "медиана", int(plus.median()))
print("доля чеков дешевле среднего:", round((amount < amount.mean()).mean(), 3))
