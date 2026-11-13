# sales, t, MONTHS — из кода «Анатомии графика»
import seaborn as sns

sns.set_theme(style="whitegrid")       # меняет rcParams: так теперь выглядят все графики
sales["mln"] = sales["revenue"] / 1e6

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 3.6), sharey=True, layout="constrained")
t.plot(ax=ax1, title="pandas: t.plot(ax=ax1)")                    # таблица «месяц × год»
sns.lineplot(data=sales, x="m", y="mln", hue="year",               # длинная таблица, 960 строк
             estimator="sum", errorbar=None, ax=ax2)
ax2.set_title('seaborn: lineplot(estimator="sum")')
for ax in (ax1, ax2):
    ax.set_xticks(range(1, 13), MONTHS)
    ax.set_xlabel("")
    ax.set_ylim(0, 45)
fig.suptitle("pandas и seaborn нарисовали одно и то же и вернули обычные Axes")
fig.savefig("pandas_vs_seaborn.png", dpi=150)

print(type(ax1).__name__, type(ax2).__name__)
print("seaborn, январь:", ax2.lines[0].get_ydata()[0].round(2), "| pandas:", t.loc[1, "2024"].round(2))
fig2, ax3 = plt.subplots()
sns.lineplot(data=sales, x="m", y="mln", hue="year", ax=ax3)       # без estimator
print("по умолчанию, январь:", ax3.lines[0].get_ydata()[0].round(2),
      "— среднее 40 строк, полос интервала:", len(ax3.collections))
