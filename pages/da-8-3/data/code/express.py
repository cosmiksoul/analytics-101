import pandas as pd
import plotly.express as px

sales = pd.read_csv("data/viz/sales_monthly.csv")  # длинный формат: строка = месяц × канал × страна
top5 = ["сайт", "маркетплейс", "приложение", "поиск", "рассылка"]
by_ch = (sales[sales["channel"].isin(top5)]
         .groupby(["month", "channel"], as_index=False)["revenue"].sum()
         .assign(mln=lambda d: d["revenue"] / 1e6))
print(by_ch.shape)
print(by_ch.head(3).to_string(index=False))

fig = px.line(by_ch, x="month", y="mln", color="channel",   # столбец → роль на графике
              category_orders={"channel": top5},             # порядок в легенде
              labels={"month": "месяц", "mln": "млн ₽", "channel": "канал"},
              title="С мая по июль 2025 года выручка приложения почти удвоилась")
fig.update_xaxes(tickformat="%m.%Y")  # 01.2025 вместо Jan 2025

app = fig.data[2]
print(f"{type(fig).__name__}: трасс — {len(fig.data)}; у трассы «{app.name}» тип {app.type}, точек — {len(app.x)}")
print("Разделы описания графика:", list(fig.to_dict()))
print(app.hovertemplate)
