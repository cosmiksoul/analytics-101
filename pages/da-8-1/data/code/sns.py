# sales, t, MONTHS — из кода «Анатомии графика»
import seaborn as sns

sns.set_theme(style="whitegrid")       # меняет rcParams: так теперь выглядят все графики
sales["mln"] = sales["revenue"] / 1e6

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 3.6), sharey=True, layout="constrained")
from_pandas = t.plot(ax=ax1, title="pandas: t.plot(ax=ax1)")  # готовые месячные суммы
from_seaborn = sns.lineplot(
    data=sales, x="m", y="mln", hue="year",                 # 960 исходных строк
    estimator="sum", errorbar=None, ax=ax2,
)
ax2.set_title('seaborn: lineplot(estimator="sum")')
for ax in (ax1, ax2):
    ax.set_xticks(range(1, 13), MONTHS)
    ax.set_xlabel("")
    ax.set_ylabel("Выручка, млн ₽" if ax is ax1 else "")
    ax.legend(title="Год")
    ax.set_ylim(0, 45)
fig.suptitle("Месячная выручка по данным всех каналов и стран")
fig.savefig("pandas_vs_seaborn.png", dpi=150)

print("Типы возвращённых объектов:", type(from_pandas).__name__, type(from_seaborn).__name__)
print("seaborn, январь:", ax2.lines[0].get_ydata()[0].round(2), "| pandas:", t.loc[1, "2024"].round(2))
fig2, ax3 = plt.subplots()
sns.lineplot(data=sales, x="m", y="mln", hue="year", ax=ax3)       # среднее и интервал по умолчанию
print("по умолчанию, январь:", ax3.lines[0].get_ydata()[0].round(2),
      "— среднее по 40 строкам. Число доверительных полос:", len(ax3.collections))
