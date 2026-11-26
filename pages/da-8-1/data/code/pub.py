import os

import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams["svg.fonttype"] = "none"   # подписи можно редактировать как текст

# 1. Данные: 960 строк «месяц × канал × страна» → таблица «месяц × год», млн ₽
sales = pd.read_csv("data/viz/sales_monthly.csv")
sales["year"] = sales["month"].str[:4]
sales["m"] = sales["month"].str[5:].astype(int)
t = sales.pivot_table(index="m", columns="year",
                      values="revenue", aggfunc="sum") / 1e6
MONTHS = "янв фев мар апр май июн июл авг сен окт ноя дек".split()

# 2. Фигура и оси — явно, в одну строку
fig, ax = plt.subplots(figsize=(8, 4.5), layout="constrained")

# 3. Данные: серая линия за 2024 год, зелёная за 2025-й
ax.plot(t.index, t["2024"], color="#9aa3b2", linewidth=1.5, label="2024")
ax.plot(t.index, t["2025"], color="#0d7468", linewidth=2.5, label="2025")

# 4. Оси: деления, пределы, формат подписей
ax.set_xticks(t.index, MONTHS)
ax.set_ylim(0, 50)
ax.yaxis.set_major_formatter("{x:.0f} млн ₽")
ax.spines[["top", "right"]].set_visible(False)
ax.grid(axis="y", color="#dde1e8")

# 5. Подписи: заголовок-вывод, легенда без рамки, источник
ax.set_title("С июня по декабрь выручка была на 11–18% выше прошлогодней",
             loc="left", fontweight="bold")
ax.legend(frameon=False, loc="lower right", ncols=2)
fig.supxlabel("Учебные данные магазина: sales_monthly.csv, все каналы и страны",
              x=0.01, ha="left", fontsize=8, color="#737c8f")   # строка под всей фигурой

# 6. Сохранение: PNG для слайда и письма, SVG для статьи
fig.savefig("revenue_yoy.png", dpi=200)
fig.savefig("revenue_yoy.svg")

growth = t["2025"] / t["2024"] - 1
print(t.round(1).T[[1, 5, 6, 12]])
print(f"рост к тому же месяцу 2024 года, июнь–декабрь: {growth.loc[6:].min():.1%} … {growth.loc[6:].max():.1%}")
for f in ("revenue_yoy.png", "revenue_yoy.svg"):
    print(f, round(os.path.getsize(f) / 1024), "КиБ")
