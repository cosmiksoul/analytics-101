import pandas as pd

d = pd.read_csv("data/eda/daily_metrics.csv", parse_dates=["date"])
m = d.groupby(d["date"].dt.month)["revenue"].agg(total="sum", days="size", per_day="mean")
m["total_vs_jan_%"] = (m["total"] / m["total"].iloc[0] - 1) * 100
m["per_day_vs_jan_%"] = (m["per_day"] / m["per_day"].iloc[0] - 1) * 100
print(m.assign(total=m["total"] / 1e6, per_day=m["per_day"] / 1e3).round(1))   # млн ₽ и тыс. ₽

w = d.set_index("date")["revenue"].resample("W").agg(["sum", "size"])
print(w.loc["2026-02-02":"2026-02-22"])         # неделя с разрывом
