# Переменные plt и pd заданы в примере с месячной выручкой
import matplotlib.dates as mdates

d = pd.read_csv("data/eda/daily_metrics.csv")   # в выгрузке 86 дней, записей за 10–13 февраля нет
print(d["date"].dtype, len(d))

fig, (top, bottom) = plt.subplots(2, 1, figsize=(8, 4.6), layout="constrained")
top.plot(d["date"], d["revenue"] / 1e3)            # строки: каждая дата — отдельная категория
top.set_title("Строковая ось ставит 9 и 14 февраля рядом")

d["date"] = pd.to_datetime(d["date"])              # теперь это даты
daily = d.set_index("date")["revenue"].asfreq("D")  # в пропущенные дни будет NaN
bottom.plot(daily.index, daily / 1e3)
bottom.xaxis.set_major_locator(mdates.MonthLocator(bymonthday=[1, 15]))
bottom.xaxis.set_major_formatter(mdates.DateFormatter("%d.%m"))
bottom.set_title("На календарной шкале виден перерыв с 10 по 13 февраля")
for ax in (top, bottom):
    ax.set_ylabel("Выручка, тыс. ₽")
fig.savefig("dates.png", dpi=150)

print("делений сверху:", len(top.get_xticks()), "| снизу:", len(bottom.get_xticks()))
