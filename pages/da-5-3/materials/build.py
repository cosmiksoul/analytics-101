"""Материалы страницы 5.3: шесть блоков кода одним скриптом и скрипт с выборками сцены.
Данные — общий набор data/probability (тема 05)."""
import json
import os
import re

import numpy as np
import pandas as pd


def build(m):
    m.use_data("probability")

    m.glue("clt_simulations.py", "Средние по выборкам, σ/√n, конверсия и три нюанса — шесть блоков кода страницы подряд.",
           "Сначала три блока раздела «Код»: средние по выборкам разного размера, сравнение разброса с σ/√n, "
           "то же для доли конверсии. Затем три блока «Нюансов»: миф о тридцати наблюдениях, среднее и сами данные, "
           "средний чек против конверсии.",
           ["simulate", "se", "conversion", "myth30", "notdata", "weekly_cv"], need="\nНужен общий набор data/probability/.")

    # gen_scene.py: вывод записан в хвосте скрипта; те же выборки вписаны в код страницы
    m.take("gen_scene.py")
    m.said("gen_scene.py")
    data = json.loads(re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", (m.pdir / "page.js").read_text("utf-8"), re.S).group(1))
    amount = pd.read_csv(m.sync() / "data" / "probability" / "checks.csv")["amount"].to_numpy(np.int64)
    rng = np.random.default_rng(5300)
    ok = True
    for n in (30, 120, 480):
        s = rng.choice(amount, size=(1000, n))
        ok = ok and np.round(s.mean(axis=1)).astype(int).tolist() == data["scene"][f"m{n}"]
        if n == 30:
            ok = ok and s[:10].tolist() == data["scene"]["first"]
    m.check("gen_scene.py: три тысячи средних (зерно 5300) и первые десять выборок совпадают с данными в коде страницы", ok)
