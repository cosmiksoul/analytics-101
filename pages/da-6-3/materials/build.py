"""Материалы страницы 6.3: четыре блока кода одним скриптом и скрипт с двумя мирами анимации.
Данные — общий набор data/inference (тема 06): pilot.csv и gen_pilot.py."""
import json
import re

import numpy as np
import pandas as pd


def build(m):
    m.use_data("inference")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0 и SciPy 1.18."

    m.glue("hypothesis_tests.py", "Перестановочный тест, t-тест Уэлча, частота ложных срабатываний и мощность — четыре блока кода страницы подряд.",
           "Сначала три блока раздела «Код»: перестановочный тест с нуля, t-тест Уэлча, доля ложных срабатываний без эффекта. "
           "Затем блок из «Нюансов»: мощность при разных эффектах и размерах выборки.",
           ["perm", "ttest", "false_alarms", "power"], need="\nНужен общий набор data/inference/ (pilot.csv).")

    # gen_scene.py — тот же файл, которым собраны данные страницы: pages/da-6-3/data/gen_scene.py
    m.take("gen_scene.py", src="../data/gen_scene.py")
    r = m.said("gen_scene.py")
    data = json.loads(re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", (m.pdir / "page.js").read_text("utf-8"), re.S).group(1))
    m.check("gen_scene.py: p сцены 0,0398, мощность 0,4652, разброс разниц 534 ₽ — те же числа в данных страницы",
            (data["p"], data["power"], data["sd0"]) == (0.0398, 0.4652, 534) and "p = 0.0398" in r.stdout
            and "мощность 0.4652" in r.stdout and "разброс разниц 533.6" in r.stdout, str((data["p"], data["power"], data["sd0"])))
    work = m.sync()
    m.check("gen_scene.py не оставляет __pycache__ рядом с данными", not (work / "data" / "inference" / "__pycache__").exists())
    x = pd.read_csv(work / "data" / "inference" / "pilot.csv").amount.to_numpy(float)
    sd_perm = float(np.sqrt(x.var(ddof=1) * (1 / 40 + 1 / 40)))        # разброс разницы средних при случайном делении 80 чеков пополам
    m.check("разброс разниц при перестановках самих 80 чеков: 511 ₽ в выводе блока «perm» (так и в тексте страницы), точное значение 516 ₽",
            "разброс 511 ₽" in m.page_out("perm") and round(sd_perm) == 516, f"{sd_perm:.1f}")
