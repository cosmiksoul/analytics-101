import pandas as pd

d = pd.read_csv("data/eda/daily_metrics.csv", parse_dates=["date"]).set_index("date")
print(d.tail(3))
print(f"31.03 к 30.03: {d['revenue'].pct_change().iloc[-1]:+.0%}")
tue = d.loc[d.index.dayofweek == 1, "revenue"]
print(f"31.03 к медиане четырёх прошлых вторников: {tue.iloc[-1] / tue.iloc[-5:-1].median():.0%}")

cols = ["app_installs", "support_tickets"]
r = lambda x: x.diff().corr().iloc[0, 1].round(2)
cal = d[cols].asfreq("D")                       # разрыв — NaN, через него разность не считается
print("r изменений за день, строки подряд:", r(d[cols]))
print("по календарю:                      ", r(cal))
print("по календарю, без 31 марта:        ", r(cal.iloc[:-1]))
