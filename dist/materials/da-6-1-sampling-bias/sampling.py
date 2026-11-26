"""Четыре примера расчёта по данным пользователей магазина.

Страница 6.1 «Выборка, оценка и стандартная ошибка» курса «Аналитика 101». Сначала сравним способы отбора при разных размерах выборки, оценим стандартную ошибку и проверим, как влияет деление на n или на n − 1. Затем учтём активность участников опроса с помощью весов.
Запуск из корня папки материалов: python da-6-1-sampling-bias/sampling.py
Нужен общий набор data/inference/ (users.csv).
"""

# ===== При увеличении выборки в 16 раз разброс средних уменьшается примерно вчетверо =====
import numpy as np, pandas as pd

users = pd.read_csv("data/inference/users.csv")    # учебная совокупность: 100 000 пользователей
spend = users["spend"].to_numpy()            # траты за квартал, ₽
mu = spend.mean()                            # параметр: его и хотим оценить
N = len(users)
rng = np.random.default_rng(61)

def random_pick(n):                          # простая случайная выборка
    return rng.choice(N, n, replace=False)

def survey(n):                               # ответ с индивидуальной вероятностью p_answer
    answered = rng.random(N) < users["p_answer"].to_numpy()
    return rng.choice(np.flatnonzero(answered), n, replace=False)

def first_visitors(n):                       # случайные n пользователей из посетителей за день
    visited = rng.random(N) < users["active_days"].to_numpy() / 90
    return rng.choice(np.flatnonzero(visited), n, replace=False)

print(f"μ = {mu:.0f} ₽, σ = {spend.std():.0f} ₽")
print("способ           n   среднее оценок  смещение  разброс")
for name, pick in [("случайно", random_pick), ("кто ответил", survey), ("первые n", first_visitors)]:
    for n in [100, 1600]:
        est = np.array([spend[pick(n)].mean() for _ in range(1000)])   # 1 000 выборок — 1 000 оценок
        print(f"{name:<12} {n:>5} {est.mean():13.0f} {est.mean() - mu:+10.0f} {est.std():8.0f}")

# ===== Как оценить стандартную ошибку средних трат и доли покупателей =====
import numpy as np, pandas as pd
from scipy import stats
from statsmodels.stats.weightstats import DescrStatsW

spend = pd.read_csv("data/inference/users.csv")["spend"].to_numpy()
rng = np.random.default_rng(62)
n = 400
x = spend[rng.choice(len(spend), n, replace=False)]   # одна случайная выборка пользователей

s = x.std(ddof=1)                                      # оценка σ по выборке
print(f"оценка среднего       x̄ = {x.mean():.0f} ₽")
print(f"стандартное отклонение s = {s:.0f} ₽  (σ всех 100 000: {spend.std():.0f})")
print(f"стандартная ошибка  s/√n = {s / np.sqrt(n):.0f} ₽")
print(f"scipy.stats.sem          = {stats.sem(x):.0f} ₽")
print(f"statsmodels std_mean     = {DescrStatsW(x).std_mean:.0f} ₽")

p_hat = (x > 0).mean()                                 # доля пользователей с покупкой за квартал
print(f"\nдоля покупателей     p̂ = {p_hat:.3f}")
print(f"стандартная ошибка доли = {np.sqrt(p_hat * (1 - p_hat) / n):.4f}")

# проверка: 10 000 выборок по 400 (с возвращением: при 400 из 100 000 разницы почти нет)
X = rng.choice(spend, size=(10_000, n))
p = (spend > 0).mean()
print(f"\nразброс 10 000 средних  = {X.mean(axis=1).std():.0f} ₽,   σ/√n = {spend.std() / np.sqrt(n):.0f} ₽")
print(f"разброс 10 000 долей    = {(X > 0).mean(axis=1).std():.4f},  √(p(1 − p)/n) = {np.sqrt(p * (1 - p) / n):.4f}")

# ===== При n = 5 делитель n занижает дисперсию в среднем на 20% =====
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

# ===== После взвешивания средние траты в опросе всё ещё выше истинных на 14,5% =====
import numpy as np, pandas as pd
from statsmodels.stats.weightstats import DescrStatsW

users = pd.read_csv("data/inference/users.csv")
spend = users["spend"].to_numpy()
rng = np.random.default_rng(64)
answered = rng.random(len(users)) < users["p_answer"].to_numpy()   # одна волна опроса

# активность известна по логам у всех: и у ответивших, и у молчавших
group = pd.cut(users["active_days"], [-1, 0, 3, 10, 30, 90], labels=["0", "1–3", "4–10", "11–30", "31+"])
share_all = group.value_counts(normalize=True, sort=False)
share_ans = group[answered].value_counts(normalize=True, sort=False)
print(pd.DataFrame({"в совокупности": share_all, "среди ответивших": share_ans}).rename_axis("дней с заходами").round(3).to_string())

w = (share_all / share_ans)[group[answered]].to_numpy()          # вес = доля в совокупности / доля в ответах
mu, raw = spend.mean(), spend[answered].mean()
weighted = DescrStatsW(spend[answered], weights=w).mean
print(f"\nответили {answered.sum()} из {len(users)}")
print(f"без весов           {raw:6.0f} ₽  ({raw / mu - 1:+.1%})")
print(f"с весами по группам {weighted:6.0f} ₽  ({weighted / mu - 1:+.1%})")
print(f"истинное μ          {mu:6.0f} ₽")
