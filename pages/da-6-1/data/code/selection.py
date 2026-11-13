import numpy as np, pandas as pd

users = pd.read_csv("data/inference/users.csv")    # учебная совокупность: 100 000 пользователей
spend = users["spend"].to_numpy()            # траты за квартал, ₽
mu = spend.mean()                            # параметр: его и хотим оценить
N = len(users)
rng = np.random.default_rng(61)

def random_pick(n):                          # простая случайная выборка
    return rng.choice(N, n, replace=False)

def survey(n):                               # опрос в приложении: отвечает, кто захотел
    answered = rng.random(N) < users["p_answer"].to_numpy()
    return rng.choice(np.flatnonzero(answered), n, replace=False)

def first_visitors(n):                       # «первые сто»: первые n из зашедших сегодня
    visited = rng.random(N) < users["active_days"].to_numpy() / 90
    return rng.choice(np.flatnonzero(visited), n, replace=False)

print(f"μ = {mu:.0f} ₽, σ = {spend.std():.0f} ₽")
print("способ           n   среднее оценок  смещение  разброс")
for name, pick in [("случайно", random_pick), ("кто ответил", survey), ("первые n", first_visitors)]:
    for n in [100, 1600]:
        est = np.array([spend[pick(n)].mean() for _ in range(1000)])   # 1 000 выборок — 1 000 оценок
        print(f"{name:<12} {n:>5} {est.mean():13.0f} {est.mean() - mu:+10.0f} {est.std():8.0f}")
