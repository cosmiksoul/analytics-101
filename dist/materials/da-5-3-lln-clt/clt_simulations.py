"""Шесть примеров из урока в одном скрипте.

Страница 5.3 «Закон больших чисел и ЦПТ» курса «Аналитика 101». Первые три примера показывают, как меняется разброс среднего чека и конверсии при увеличении выборки. Следующие три помогают проверить точность нормального приближения, сравнить суммы отдельных чеков с выборочными средними и оценить разброс двух недельных метрик.
Запуск из корня папки материалов: python da-5-3-lln-clt/clt_simulations.py
Нужен общий набор data/probability/.
"""

# ===== Как меняется распределение средних с ростом числа чеков в выборке =====
import numpy as np, pandas as pd

amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
rng = np.random.default_rng(53)

def sample_means(x, n, k=10_000):
    """Возвращает средние по k случайным выборкам из n значений с возвращением."""
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
print(f"вне 2000–9000: {np.sum((m < 2000) | (m > 9000))}")

# ===== Как меняется стандартная ошибка при увеличении выборки =====
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

# ===== Разброс доли покупок по выборкам из 30, 300 и 3 000 визитов =====
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

# ===== Как часто среднее выходит за границы нормального приближения =====
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

# ===== Распределение отдельных чеков и распределение выборочных средних =====
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

# ===== Относительный разброс недельного среднего чека и конверсии =====
import numpy as np, pandas as pd

bought = pd.read_csv("data/probability/visits.csv")["bought"].to_numpy(np.int8)
amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
per_day = pd.read_csv("data/probability/daily_orders.csv")["orders"].mean()   # заказов в день
p = bought.mean()
visits = round(per_day * 7 / p)          # визитов в неделю при такой конверсии
rng = np.random.default_rng(58)
cv = lambda x: x.std() / x.mean()        # коэффициент вариации

conv, check = [], []
for week in range(2_000):                # 2 000 учебных недель
    v = rng.choice(bought, size=visits)                    # визиты недели
    conv.append(v.mean())                                  # конверсия недели
    check.append(rng.choice(amount, size=v.sum()).mean())  # средний чек по её покупкам
conv, check = np.array(conv), np.array(check)

print(f"неделя: {visits} визитов, ≈ {visits * p:.0f} покупок")
print(f"CV индикатора покупки {np.sqrt((1 - p) / p):.2f}, CV одного чека {cv(amount):.2f}")
print(f"CV недельной конверсии   {cv(conv):.3f}, формула √(1 − p)/√(ожидаемое число покупок) = {np.sqrt((1 - p) / (visits * p)):.3f}")
print(f"CV недельного среднего чека {cv(check):.3f}, формула CV чека/√(ожидаемое число покупок) = {cv(amount) / np.sqrt(visits * p):.3f}")
print(f"Отношение CV среднего чека к CV конверсии: {cv(check) / cv(conv):.2f}")
