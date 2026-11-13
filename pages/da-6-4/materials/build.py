"""Материалы страницы 6.4: семь блоков кода одним скриптом и скрипт сетки интерактива.
Данные — общие наборы data/inference (тема 06) и data/probability (тема 05)."""
import json
import re


def build(m):
    m.use_data("inference")
    m.use_data("probability")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0, SciPy 1.18 и statsmodels 0.15."

    m.glue("which_test.py", "Четыре критерия на одних данных, симуляции и три нюанса — семь блоков кода страницы подряд.",
           "Сначала четыре блока раздела «Код»: четыре критерия на чеках A/B-теста, ложные срабатывания и мощность на логнормальных данных, "
           "хи-квадрат и z-тест для долей, Манн — Уитни при равных медианах. Затем три блока «Нюансов»: предварительная проверка "
           "нормальности, Стьюдент против Уэлча при неравных разбросах, сессии одного пользователя.",
           ["four", "alpha_sim", "chi", "mw_median", "pretest", "welch_student", "clusters"],
           need="\nНужны общие наборы data/inference/ (ab.csv) и data/probability/ (checks.csv, visits.csv).")

    data = json.loads(re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", (m.pdir / "page.js").read_text("utf-8"), re.S).group(1))

    # grid.py — тот же файл, которым посчитана сетка интерактива: pages/da-6-4/data/grid.py. Полный прогон — около 10 минут,
    # поэтому здесь считаются первые десять клеток (форма «колокол», n = 10 и 30): генератор один, клетки идут подряд.
    m.take("grid.py", src="../data/grid.py")
    probe = ("import json, sys; sys.path.insert(0, '.'); import numpy as np, grid; rng = np.random.default_rng(grid.SEED); "
             "cells = [grid.cell('normal', n, e, rng) for n in (10, 30) for e in grid.EFFECTS]; "
             "print(json.dumps([[c[k] for k in grid.CRIT] for c in cells]))")
    r = m.run(["python", "-c", probe], what="grid.py: первые десять клеток сетки")
    try:
        got = json.loads(r.stdout)
    except ValueError:
        got = None
    want = [data["grid"]["normal"][i][j] for i in (0, 1) for j in range(5)]
    m.check("grid.py: первые десять клеток (40 чисел) совпадают с сеткой в коде страницы", got == want, str(got)[:300])
    m.check("grid.py: в сетке страницы 5 форм × 5 размеров × 5 эффектов × 4 критерия, зерно 6040, по 10 000 повторов",
            (len(data["grid"]), {len(v) for v in data["grid"].values()}, data["meta"]["seed"], data["meta"]["R"]) == (5, {5}, 6040, 10000))

    # числа сцены считает генератор набора: data/inference/gen_ab.py --scene
    r = m.run(["python", "data/inference/gen_ab.py", "--scene", "scene_check.json"], what="python data/inference/gen_ab.py --scene")
    made = json.loads((m.work / "scene_check.json").read_text("utf-8")) if (m.work / "scene_check.json").exists() else None
    m.check("gen_ab.py --scene: числа и гистограммы сцены совпадают с данными в коде страницы", made == data["scene"])
