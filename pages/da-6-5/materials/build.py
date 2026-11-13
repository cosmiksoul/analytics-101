"""Материалы страницы 6.5: ноутбук с шестью блоками кода и квартет Энскомба.
Данные — общие наборы data/clients (тема 04) и data/inference (тема 06)."""
import json
import re

import numpy as np


def build(m):
    m.use_data("clients")
    m.use_data("inference")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0 и matplotlib 3.10."

    # квартет Энскомба — значения из статьи 1973 года, те же, что в анимации страницы
    data = json.loads(re.search(r"/\*data:start\*/const DATA = (.*?);/\*data:end\*/", (m.pdir / "page.js").read_text("utf-8"), re.S).group(1))
    quartet = data["anscombe"]
    rows = ["set,x,y"]
    for q in quartet:
        rows += [f"{q['k']},{x:g},{y:g}" for x, y in zip(q["x"], q["y"])]
    m.put("anscombe.csv", "\n".join(rows) + "\n")
    rs = [float(np.corrcoef(q["x"], q["y"])[0, 1]) for q in quartet]
    m.check("anscombe.csv: четыре набора по 11 точек, r от 0,816 до 0,817 — на странице 0,82",
            len(rows) == 45 and all(0.816 <= r < 0.817 for r in rs) and {round(r, 2) for r in rs} == {0.82}, str([round(r, 4) for r in rs]))

    m.notebook("correlation.ipynb", "correlation.nb.py", "main")
    m.from_reader_folder("correlation.ipynb")
    m.check("ноутбук не оставил corr_heatmap.svg в материалах страницы", not (m.out / "corr_heatmap.svg").exists())
