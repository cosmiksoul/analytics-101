import numpy as np, pandas as pd
from scipy import stats
from statsmodels.stats.weightstats import DescrStatsW

spend = pd.read_csv("data/inference/users.csv")["spend"].to_numpy()
rng = np.random.default_rng(62)
n = 400
x = spend[rng.choice(len(spend), n, replace=False)]   # одна выборка: в жизни есть только она

s = x.std(ddof=1)                                      # оценка σ по выборке
print(f"оценка среднего       x̄ = {x.mean():.0f} ₽")
print(f"стандартное отклонение s = {s:.0f} ₽  (σ всех 100 000: {spend.std():.0f})")
print(f"стандартная ошибка  s/√n = {s / np.sqrt(n):.0f} ₽")
print(f"scipy.stats.sem          = {stats.sem(x):.0f} ₽")
print(f"statsmodels std_mean     = {DescrStatsW(x).std_mean:.0f} ₽")

p_hat = (x > 0).mean()                                 # доля купивших за квартал
print(f"\nдоля покупателей     p̂ = {p_hat:.3f}")
print(f"стандартная ошибка доли = {np.sqrt(p_hat * (1 - p_hat) / n):.4f}")

# проверка: 10 000 выборок по 400 (с возвращением: при 400 из 100 000 разницы почти нет)
X = rng.choice(spend, size=(10_000, n))
p = (spend > 0).mean()
print(f"\nразброс 10 000 средних  = {X.mean(axis=1).std():.0f} ₽,   σ/√n = {spend.std() / np.sqrt(n):.0f} ₽")
print(f"разброс 10 000 долей    = {(X > 0).mean(axis=1).std():.4f},  √(p(1 − p)/n) = {np.sqrt(p * (1 - p) / n):.4f}")
