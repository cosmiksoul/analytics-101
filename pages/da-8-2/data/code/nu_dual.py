# Нюанс 4: две оси Y рисуют любую связь — проверяем на двух заведомо несвязанных рядах
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5, "axes.spines.top": False})
df = pd.read_csv("data/viz/sales_monthly.csv")
sales = df.groupby("month")["revenue"].sum().div(1e6)          # выручка магазина, млн ₽
noise = 100 + np.random.default_rng(8).normal(0, 3, 24).cumsum()  # случайное блуждание: с продажами не связано
x = np.arange(24)

fig, axes = plt.subplots(1, 2, figsize=(6.4, 2.2), layout="constrained")
limits = {"Подогнали правую ось: «растут вместе»": (noise.min() - 1, noise.max() + 1),
          "Сдвинули правую ось: «связи нет»": (0, 220)}
for ax, (title, lim) in zip(axes, limits.items()):
    ax.plot(x, sales.values, color="#0d7468", linewidth=1.4)
    ax.set_ylabel("выручка, млн ₽", color="#0d7468")
    right = ax.twinx()                                   # вторая ось Y со своей шкалой
    right.plot(x, noise, color="#d27a12", linewidth=1.4)
    right.set_ylim(*lim)                                 # её пределы автор выбирает сам
    right.set_ylabel("случайный ряд", color="#d27a12")
    ax.set_xticks([0, 12], ["2024-01", "2025-01"])
    ax.set_title(title, loc="left", fontsize=8.5)
fig.savefig("nu_dual.svg")

print("корреляция уровней:", np.corrcoef(sales, noise)[0, 1].round(2))
print("корреляция изменений за месяц:", np.corrcoef(np.diff(sales), np.diff(noise))[0, 1].round(2))
