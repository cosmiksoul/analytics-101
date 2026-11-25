"""Градиентный спуск для линейной модели spend ~ income + orders.

Страница 4.3 «Производная и градиент» курса «Аналитика 101». Скрипт сравнивает коэффициенты модели с результатом lstsq, а затем показывает, как масштаб признаков влияет на скорость спуска при разных шагах обучения.
Запуск из корня папки материалов: python da-4-3-derivative-gradient/regression_gd.py
Нужен общий набор data/clients/.
"""

# ===== После 60 итераций коэффициенты совпадают с результатом lstsq при округлении =====
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

b = w[1:] / sd                                   # коэффициенты при признаках в исходных единицах
w_gd = np.r_[w[0] - b @ mu, b]
w_ls, *_ = np.linalg.lstsq(np.c_[np.ones(len(y)), F], y, rcond=None)
print("спуск:", np.round(w_gd, 4))
print("lstsq:", np.round(w_ls, 4))

# ===== На исходных признаках даже 10 000 шагов дают большую ошибку, чем 60 после стандартизации =====
import numpy as np, pandas as pd
np.set_printoptions(precision=4, suppress=True)

df = pd.read_csv("data/clients/clients.csv")
y = df["spend"].to_numpy(float)
F = df[["income", "orders"]].to_numpy(float)
raw = np.c_[np.ones(len(y)), F]                          # доход в рублях и число заказов
std = np.c_[np.ones(len(y)), (F - F.mean(0)) / F.std(0)] # оба признака в стандартных отклонениях

def descend(X, eta, steps):
    w = np.zeros(3)
    for _ in range(steps):
        w = w - eta * 2 / len(y) * X.T @ (X @ w - y)
    return w, np.sqrt(np.mean((X @ w - y) ** 2))         # веса модели и RMSE в рублях

print("градиент в нуле, сырые:   ", 2 / len(y) * raw.T @ -y)
print("градиент в нуле, стандарт:", 2 / len(y) * std.T @ -y)
w, r = descend(raw, 3e-10, 30);     print(f"сырые, η = 3e-10, 30 шагов:      RMSE = {r:.2e}")
w, r = descend(raw, 1e-10, 10_000); print(f"сырые, η = 1e-10, 10 000 шагов:  RMSE = {r:.1f}, w = {w}")
w, r = descend(std, 0.3, 60);       print(f"стандарт, η = 0.3, 60 шагов:    RMSE = {r:.1f}")
