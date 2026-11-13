"""Регрессия spend ~ income + orders градиентным спуском.

Страница 4.3 «Производная и градиент» курса «Аналитика 101». Два блока кода страницы подряд: спуск по стандартизованным признакам приходит к весам lstsq, а без стандартизации разлетается или ползёт.
Запуск из корня папки материалов: python da-4-3-derivative-gradient/regression_gd.py
Нужен общий набор data/clients/.
"""

# ===== Спуск приходит к тем же весам, что lstsq =====
import numpy as np, pandas as pd
np.set_printoptions(precision=4, suppress=True)

df = pd.read_csv("data/clients/clients.csv")
y = df["spend"].to_numpy(float)
F = df[["income", "orders"]].to_numpy(float)
mu, sd = F.mean(axis=0), F.std(axis=0)
X = np.c_[np.ones(len(y)), (F - mu) / sd]        # столбец единиц + стандартизованные признаки

w, eta = np.zeros(3), 0.3
for k in range(1, 61):
    grad = 2 / len(y) * X.T @ (X @ w - y)        # градиент MSE по трём весам
    w = w - eta * grad
    if k in (1, 5, 20, 60):
        rmse = np.sqrt(np.mean((X @ w - y) ** 2))
        print(f"шаг {k:>2}: RMSE = {rmse:8.1f} ₽, |градиент| = {np.linalg.norm(grad):.3g}")

b = w[1:] / sd                                   # веса обратно в рубли и штуки
w_gd = np.r_[w[0] - b @ mu, b]
w_ls, *_ = np.linalg.lstsq(np.c_[np.ones(len(y)), F], y, rcond=None)
print("спуск:", np.round(w_gd, 4))
print("lstsq:", np.round(w_ls, 4))

# ===== Без стандартизации спуск разлетается или ползёт =====
import numpy as np, pandas as pd
np.set_printoptions(precision=4, suppress=True)

df = pd.read_csv("data/clients/clients.csv")
y = df["spend"].to_numpy(float)
F = df[["income", "orders"]].to_numpy(float)
raw = np.c_[np.ones(len(y)), F]                          # доход в рублях, заказы в штуках
std = np.c_[np.ones(len(y)), (F - F.mean(0)) / F.std(0)] # оба признака в стандартных отклонениях

def descend(X, eta, steps):
    w = np.zeros(3)
    for _ in range(steps):
        w = w - eta * 2 / len(y) * X.T @ (X @ w - y)
    return w, np.sqrt(np.mean((X @ w - y) ** 2))         # веса и RMSE, ₽

print("градиент в нуле, сырые:   ", 2 / len(y) * raw.T @ -y)
print("градиент в нуле, стандарт:", 2 / len(y) * std.T @ -y)
w, r = descend(raw, 3e-10, 30);     print(f"сырые, η = 3e-10, 30 шагов:      RMSE = {r:.2e}")
w, r = descend(raw, 1e-10, 10_000); print(f"сырые, η = 1e-10, 10 000 шагов:  RMSE = {r:.1f}, w = {w}")
w, r = descend(std, 0.3, 60);       print(f"стандарт, η = 0.3, 60 шагов:    RMSE = {r:.1f}")
