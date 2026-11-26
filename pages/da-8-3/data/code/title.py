import re

import pandas as pd
import plotly.express as px

sales = pd.read_csv("data/viz/sales_monthly.csv")
top5 = ["сайт", "маркетплейс", "приложение", "поиск", "рассылка"]
by_ch = (sales[sales["channel"].isin(top5)]
         .groupby(["month", "channel"], as_index=False)["revenue"].sum()
         .assign(mln=lambda d: d["revenue"] / 1e6))
ru = lambda v, d=1: f"{v:.{d}f}".replace(".", ",")
words = lambda path: re.findall(r">([^<>]+)</text>", open(path, encoding="utf-8").read())

fig = px.line(by_ch, x="month", y="mln", color="channel", title="Выручка по каналам, млн ₽")
fig.update_layout(separators=", ")
fig.write_image("plain.svg")  # то, что уйдёт в письмо или на слайд
hover = [ru(v, 2) for v in by_ch["mln"]]  # числа, которые видны только при наведении
print("Значений выручки в подсказках:", len(hover), "| подписано на картинке:", sum(h in words("plain.svg") for h in hover))

app = by_ch[by_ch["channel"] == "приложение"].set_index("month")["mln"]
fig.update_layout(title=f"С мая по июль 2025 года выручка приложения выросла "
                        f"с {ru(app['2025-05'])} до {ru(app['2025-07'])} млн ₽")
fig.add_annotation(x="2025-06", y=app["2025-06"], text="релиз", ay=-40)
fig.write_image("titled.svg")
print("Заголовок и отметка на графике:", [w for w in words("titled.svg") if "выручка приложения" in w or w == "релиз"])
