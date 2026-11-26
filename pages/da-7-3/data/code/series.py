import pandas as pd

d = pd.read_csv("data/eda/daily_metrics.csv", parse_dates=["date"]).set_index("date")
cal = pd.date_range("2026-01-01", "2026-03-31", freq="D")    # какие дни должны быть
print("строк:", len(d), "| дней в квартале:", len(cal))
print("нет в выгрузке:", cal.difference(d.index).strftime("%d.%m").tolist())

d = d.reindex(cal)                    # добавляем строки с NaN за 10–13 февраля
d["flag"] = "ok"
d.loc[d["revenue"].isna(), "flag"] = "разрыв"
d.loc[d.index[-1], "flag"] = "неполный день"            # выгрузка снята днём 31.03
print(d["flag"].value_counts().to_dict())

ok = d[d["flag"] == "ok"]
week = ok["revenue"].groupby(ok.index.dayofweek).mean() / ok["revenue"].mean()
print(week.round(2).set_axis("пн вт ср чт пт сб вс".split()).to_dict())
