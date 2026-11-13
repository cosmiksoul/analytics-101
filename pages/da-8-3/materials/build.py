"""Материалы страницы 8.3: ноутбук с семью блоками кода (четыре блока раздела «Код» и три нюанса).
Данные — общий набор data/viz (тема 08). Для PNG и SVG нужен kaleido и Chrome."""
import pandas as pd

MADE = ["channels.html", "channels_cdn.html", "channels.json", "channels.png", "channels.svg",
        "points.html", "plain.svg", "titled.svg", "mobile.html"]


def build(m):
    m.use_data("viz")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0, plotly 7.1 и kaleido 1.5; для PNG и SVG нужен Chrome."

    nb = m.notebook("plotly_channels.ipynb", "plotly_channels.nb.py", "main")
    made = [n for n in MADE if (m.work / n).exists()]
    m.check("ноутбук сохранил в рабочую папку девять файлов, которые называет его первая ячейка", made == MADE, str(made))
    mb = lambda n: (m.work / n).stat().st_size / 1024 / 1024 if (m.work / n).exists() else 0
    m.check("channels.html с библиотекой весит почти 5 МБ, points.html с миллионом точек — 26 МБ, как сказано в ноутбуке",
            4.4 < mb("channels.html") < 5 and 25.5 < mb("points.html") < 26.5, f"{mb('channels.html'):.2f} и {mb('points.html'):.2f} МБ")
    m.from_reader_folder("plotly_channels.ipynb")
    m.check("ноутбук не оставил файлы экспорта в материалах страницы", not any((m.out / n).exists() for n in MADE))

    shows = [c for c in nb.cells if c.cell_type == "code" and c.source.startswith(("fig.show(", "fig_a.show("))]
    kinds = [sorted(o["data"]) for c in shows for o in c.outputs if o.output_type == "display_data"]
    m.check("три ячейки fig.show() сохранили в ноутбуке фигуры plotly (JSON без библиотеки)",
            kinds == [["application/vnd.plotly.v1+json"]] * 3, str(kinds))
    frames = [len(o["data"]["application/vnd.plotly.v1+json"].get("frames", [])) for c in shows for o in c.outputs
              if o.output_type == "display_data"]
    m.check("у показанной анимации 24 кадра, у линейных графиков кадров нет", frames == [0, 24, 0], str(frames))

    # примечание к блоку подсказки: 5,71 в подсказке plotly.js против 5,72 в таблице pandas
    df = pd.read_csv(m.work / "data" / "viz" / "sales_monthly.csv")
    rev = df[(df.month == "2025-07") & (df.channel == "маркетплейс")].revenue.sum()
    row = [l for l in m.page_out("a11y").split("\n") if l.startswith("2025-07")]
    m.check("маркетплейс, июль 2025: выручка ровно 5 715 000 ₽, в таблице pandas — 5.72 (в подсказке plotly.js — 5,71, см. примечание)",
            rev == 5_715_000 and row and row[0].split()[2] == "5.72", f"{rev} | {row}")
