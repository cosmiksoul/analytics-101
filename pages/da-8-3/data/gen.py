"""Данные сцены и интерактива страницы 8.3 «Интерактив в Plotly».

Запуск из папки страницы:  python3 data/gen.py
Читает общие учебные данные темы 08 (data/viz/sales_monthly.csv; не меняет), считает pandas выручку пяти
крупнейших каналов по месяцам (сумма по четырём странам) и долю канала в выручке месяца по всем десяти каналам —
те же числа, что в блоках кода express и hover. Результат вписывает в page.js между /*data:start*/ и /*data:end*/.
Случайности нет, повторный запуск даёт тот же файл.
"""
import json, re
from pathlib import Path
import pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
sales = pd.read_csv(PAGE.parents[1] / "data" / "viz" / "sales_monthly.csv")

TOP5 = ["сайт", "маркетплейс", "приложение", "поиск", "рассылка"]
total = sales.groupby("month")["revenue"].sum()
wide = sales[sales["channel"].isin(TOP5)].pivot_table(index="month", columns="channel", values="revenue", aggfunc="sum")[TOP5]
share25 = (sales[sales["month"] >= "2025-01"].groupby("channel")["revenue"].sum()
           / sales.loc[sales["month"] >= "2025-01", "revenue"].sum())

DATA = {
    "months": wide.index.tolist(),
    "ch": TOP5,
    "y": [(wide[c] / 1e6).tolist() for c in TOP5],                             # округляем при показе
    "share": [(wide[c] / total).tolist() for c in TOP5],                       # доля в выручке всех десяти каналов
    "top5_2025": round(float(share25[TOP5].sum()), 3),                        # доля пяти каналов в выручке 2025
    "rows": int(len(sales)),
}
app = dict(zip(DATA["months"], DATA["y"][2]))
print("строк:", DATA["rows"], "| пять каналов в 2025:", DATA["top5_2025"])
print("приложение: май", app["2025-05"], "июнь", app["2025-06"], "июль", app["2025-07"], "декабрь", app["2025-12"],
      "| ×", round(app["2025-07"] / app["2025-05"], 2))
print("максимум сайта:", max(DATA["y"][0]), "| максимум без сайта:", max(max(r) for r in DATA["y"][1:]))

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False) + ";/*data:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
