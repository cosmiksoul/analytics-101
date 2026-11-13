# sales, pd, plt — из кода «Анатомии графика»
import matplotlib.dates as mdates

ym = sales.groupby("month")["revenue"].sum() / 1e6                     # 24 месяца
app = sales[sales["channel"] == "приложение"].groupby("month")["revenue"].sum() / 1e6
dates = pd.to_datetime(ym.index)                                       # строки → даты
cm = sales.pivot_table(index=["channel", "m"], columns="year",
                       values="revenue", aggfunc="sum") / 1e6          # канал × месяц

fig, axes = plt.subplots(2, 2, figsize=(10, 6), sharex="col", layout="constrained")

axes[0, 0].plot(dates, ym)                                   # линия: динамика
axes[0, 0].set_title("Выручка магазина растёт, пик — в декабре")
axes[1, 0].bar(dates, app, width=20)                         # столбцы: сравнение
axes[1, 0].set_title("Приложение удвоилось с июня 2025")
axes[1, 0].xaxis.set_major_locator(mdates.MonthLocator(bymonth=[1, 7]))
axes[1, 0].xaxis.set_major_formatter(mdates.DateFormatter("%m.%Y"))     # 01.2025

axes[0, 1].scatter(cm["2024"], cm["2025"], s=12)             # рассеяние: связь
axes[0, 1].axline((0, 0), slope=1, color="grey", linewidth=0.8)
axes[0, 1].set_title("2025-й больше 2024-го в 94 точках из 120")
axes[0, 1].set_ylabel("тот же канал и месяц 2025, млн ₽")
axes[1, 1].hist(cm["2024"], bins=12)                         # гистограмма: распределение
axes[1, 1].set_title("Половина значений — меньше 2 млн ₽ в месяц")
axes[1, 1].set_xlabel("выручка канала за месяц 2024, млн ₽")

fig.suptitle("Магазин растёт за счёт приложения: четыре взгляда на одни данные")   # заголовок фигуры
fig.savefig("grid.png", dpi=150)

print(type(axes).__name__, axes.shape)
print("общая ось X слева:", axes[0, 0].get_xlim() == axes[1, 0].get_xlim())
print("общая ось X справа:", axes[0, 1].get_xlim() == axes[1, 1].get_xlim())
print("подписи делений у верхнего левого:", axes[0, 0].xaxis.get_tick_params()["labelbottom"])
print(f"выше диагонали: {(cm['2025'] > cm['2024']).sum()} из {len(cm)}, меньше 2 млн: {(cm['2024'] < 2).sum()}")
