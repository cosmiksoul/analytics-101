# plt, pd — из кода «Анатомии графика»
import matplotlib.dates as mdates

d = pd.read_csv("data/eda/daily_metrics.csv")   # 86 дней, 10–13 февраля выгрузка потеряна
print(d["date"].dtype, len(d))

fig, (top, bottom) = plt.subplots(2, 1, figsize=(8, 4.6), layout="constrained")
top.plot(d["date"], d["revenue"] / 1e3)            # строки: каждая дата — отдельная категория
top.set_title("Даты строками: 86 подписей слиплись, пропуск февраля исчез")

d["date"] = pd.to_datetime(d["date"])              # теперь это даты
bottom.plot(d["date"], d["revenue"] / 1e3)
bottom.xaxis.set_major_locator(mdates.MonthLocator(bymonthday=[1, 15]))
bottom.xaxis.set_major_formatter(mdates.DateFormatter("%d.%m"))
bottom.set_title("Даты датами: деления 1-го и 15-го, пропуск виден прямым отрезком")
for ax in (top, bottom):
    ax.set_ylabel("тыс. ₽")
fig.savefig("dates.png", dpi=150)

print("делений сверху:", len(top.get_xticks()), "| снизу:", len(bottom.get_xticks()))
