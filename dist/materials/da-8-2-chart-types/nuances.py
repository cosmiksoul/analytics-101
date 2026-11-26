"""Четыре рисунка раздела «Нюансы»: ось с нуля, сортировка, число категорий, две оси Y.

Страница 8.2 «Как выбрать график для задачи» курса «Аналитика 101».
Запуск из корня папки материалов:
  python da-8-2-chart-types/nuances.py
Нужен общий набор data/viz/ (sales_monthly.csv).

Скрипт сохраняет в рабочую папку nu_zero.svg, nu_sort.svg, nu_many.svg и nu_dual.svg — это рисунки из текста
страницы — и печатает числа, которые стоят в их заголовках и в тексте нюансов. На странице каждый рисунок строит
отдельный скрипт, поэтому здесь перед каждым следующим стоит plt.rcdefaults(): настройки предыдущего не переходят
на следующий.
"""

# ===== Нюанс 1. Ось столбцов начинается с нуля =====
import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5,
                     "axes.spines.top": False, "axes.spines.right": False})
df = pd.read_csv("data/viz/sales_monthly.csv")
c = df[df["month"].str.startswith("2025")].groupby("country")["revenue"].sum().div(1e6).sort_values()

fig, (a, b) = plt.subplots(1, 2, figsize=(6.4, 1.9), layout="constrained")
a.barh(c.index, c.values, color="#0d7468")
a.set_title(f"От нуля: отношение длин {c['BY'] / c['UZ']:.1f}".replace(".", ","), loc="left", fontsize=8.5)
b.barh(c.index, c.values, color="#bf3a2e")
b.set_xlim(40, None)                                   # ось с 40 млн ₽
b.set_title(f"От 40 млн ₽: отношение длин {(c['BY'] - 40) / (c['UZ'] - 40):.1f}".replace(".", ","), loc="left", fontsize=8.5)
for ax in (a, b):
    ax.set_xlabel("выручка за 2025 год, млн ₽")
fig.savefig("nu_zero.svg")
print(c.round(1).to_dict(), "| отношение BY/UZ:", round(c["BY"] / c["UZ"], 2),
      "| отношение длин при оси с 40:", round((c["BY"] - 40) / (c["UZ"] - 40), 1))

# ===== Нюанс 2. Как порядок категорий влияет на сравнение =====
plt.rcdefaults()
import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5,
                     "axes.spines.top": False, "axes.spines.right": False})
df = pd.read_csv("data/viz/sales_monthly.csv")
s = df[df["month"].str.startswith("2025")].groupby("channel")["revenue"].sum().div(1e6)

fig, (a, b) = plt.subplots(1, 2, figsize=(6.4, 2.3), layout="constrained")
abc = s.sort_index(ascending=False)                    # barh располагает категории снизу вверх
a.barh(abc.index, abc.values, color="#9aa3b2")
a.set_title("Каналы по алфавиту", loc="left", fontsize=8.5)
val = s.sort_values()
b.barh(val.index, val.values, color="#0d7468")
b.set_title("Каналы по убыванию выручки", loc="left", fontsize=8.5)
for ax in (a, b):
    ax.set_xlabel("выручка за 2025 год, млн ₽")
fig.savefig("nu_sort.svg")
print("по алфавиту:", list(abc.index[::-1]))
print("по убыванию:", list(val.index[::-1]))

# ===== Нюанс 3. Как показать выручку десяти каналов =====
plt.rcdefaults()
import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5,
                     "axes.spines.top": False, "axes.spines.right": False})
df = pd.read_csv("data/viz/sales_monthly.csv")
wide = df.pivot_table(index="month", columns="channel", values="revenue", aggfunc="sum") / 1e6
top3 = wide.loc["2025-01":].sum().nlargest(3).index
grouped = wide[top3].assign(**{"остальные 7": wide.drop(columns=top3).sum(axis=1)})

fig, (a, b) = plt.subplots(1, 2, figsize=(6.4, 2.5), layout="constrained")
wide.plot(ax=a, legend=False, linewidth=1)            # десять цветов из палитры tab10
a.legend(fontsize=5.5, ncol=2, frameon=False, loc="upper left", bbox_to_anchor=(0, 1.02))
a.set_title("Десять каналов с общей легендой", loc="left", fontsize=8.5)
colors = ["#0d7468", "#2f6db5", "#d27a12", "#9aa3b2"]
for (name, col), c in zip(grouped.items(), colors):
    b.plot(range(24), col.values, color=c, linewidth=1.4)
    b.text(23.6, col.iloc[-1], name, color=c, va="center", fontsize=7)   # подпись у конца линии
b.set_xlim(0, 30)
b.set_title("Три крупнейших канала и остальные", loc="left", fontsize=8.5)
for ax in (a, b):
    ax.set_xticks([0, 12], ["2024-01", "2025-01"])
    ax.set_xlabel("")
    ax.set_ylim(0, None)
fig.savefig("nu_many.svg")
print("три крупнейших в 2025:", list(top3))
print("остальные 7 каналов в декабре 2025, млн ₽:", round(grouped["остальные 7"].iloc[-1], 1))

# ===== Нюанс 4. Как пределы второй оси меняют вид линий =====
plt.rcdefaults()
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5, "axes.spines.top": False})
df = pd.read_csv("data/viz/sales_monthly.csv")
sales = df.groupby("month")["revenue"].sum().div(1e6)          # выручка магазина, млн ₽
noise = 100 + np.random.default_rng(8).normal(0, 3, 24).cumsum()  # случайное блуждание: с продажами не связано
x = np.arange(24)

fig, axes = plt.subplots(1, 2, figsize=(6.4, 2.2), layout="constrained")
limits = {"Правая ось в пределах случайного ряда": (noise.min() - 1, noise.max() + 1),
          "Правая ось от 0 до 220": (0, 220)}
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

# Вывод:
# {'UZ': 46.0, 'KZ': 79.3, 'RU': 140.7, 'BY': 150.8} | отношение BY/UZ: 3.28 | отношение длин при оси с 40: 18.5
# по алфавиту: ['кешбэк-сервисы', 'колл-центр', 'маркетплейс', 'офлайн-точки', 'партнёры', 'поиск', 'приложение', 'рассылка', 'сайт', 'соцсети']
# по убыванию: ['сайт', 'маркетплейс', 'приложение', 'поиск', 'рассылка', 'соцсети', 'партнёры', 'офлайн-точки', 'кешбэк-сервисы', 'колл-центр']
# три крупнейших в 2025: ['сайт', 'маркетплейс', 'приложение']
# остальные 7 каналов в декабре 2025, млн ₽: 15.8
# корреляция уровней: 0.52
# корреляция изменений за месяц: 0.31
