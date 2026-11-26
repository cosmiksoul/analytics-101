import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 8,
                     "axes.spines.top": False, "axes.spines.right": False})
ACC, GREY = "#0d7468", "#9aa3b2"

df = pd.read_csv("data/viz/sales_monthly.csv")            # длинный формат, 960 строк
wide = df.pivot_table(index="month", columns="channel",
                      values="revenue", aggfunc="sum") / 1e6  # 24 месяца × 10 каналов, млн ₽
y24, y25 = wide.loc["2024-01":"2024-12"], wide.loc["2025-01":"2025-12"]


def chart_for(question, ax):
    """Вопрос → тип графика. Данные одни и те же, меняется форма."""
    if question == "сравнение":        # кто больше → столбцы по убыванию
        s = y25.sum().sort_values()
        ax.barh(s.index, s.values, color=ACC)
        ax.set_xlabel("выручка за 2025 год, млн ₽")
    elif question == "динамика":       # как менялось → линия по времени
        total = wide.sum(axis=1)
        ax.plot(total.index, total.values, color=ACC)  # месяцы-строки идут по порядку
        ax.set_xticks(["2024-01", "2024-07", "2025-01", "2025-07"])
        ax.set_ylabel("выручка за месяц, млн ₽")
    elif question == "распределение":  # какие значения обычны → гистограмма
        ax.hist(wide.to_numpy().ravel(), bins=np.arange(0, 11.5, 0.5),
                color=ACC, edgecolor="white", linewidth=0.5)
        ax.set_xlabel("выручка канала за месяц, млн ₽")
        ax.set_ylabel("число наблюдений")
    elif question == "связь":          # меняется ли одно вместе с другим → рассеяние
        ax.scatter(y24.to_numpy().ravel(), y25.to_numpy().ravel(), s=7, color=ACC)
        ax.axline((0, 0), slope=1, color=GREY, linewidth=0.8)  # линия «2025 = 2024»
        ax.set_xlabel("выручка за месяц в 2024 году, млн ₽")
        ax.set_ylabel("тот же месяц в 2025 году, млн ₽")
    else:
        raise ValueError(f"нет графика для вопроса «{question}»")
    return ax


TITLES = {  # заголовки панелей
    "сравнение": "По годовой выручке лидирует сайт",
    "динамика": "Максимум в декабре 2025 года",
    "распределение": "Чаще встречаются суммы до 2,5 млн ₽",
    "связь": "Выручка в том же месяце год спустя",
}
fig, axes = plt.subplots(2, 2, figsize=(6.4, 4.6), layout="constrained")
for (q, title), ax in zip(TITLES.items(), axes.flat):
    chart_for(q, ax).set_title(title, loc="left", fontsize=8.5)
fig.savefig("question_to_chart.svg")

total = wide.sum(axis=1)
values = wide.to_numpy().ravel()
print("сравнение:", y25.sum().nlargest(3).round(1).to_dict())
print("максимум выручки, млн ₽:", total.idxmax(), round(total.max(), 1),
      "| минимум:", total.idxmin(), round(total.min(), 1))
print("распределение: меньше 2,5 млн —", f"{(values < 2.5).mean():.0%}", "наблюдений по каналам и месяцам")
print("связь: r =", np.corrcoef(y24.to_numpy().ravel(), y25.to_numpy().ravel())[0, 1].round(3))
