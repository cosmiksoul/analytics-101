"""Материалы страницы 6.2: шесть блоков кода одним скриптом и скрипт с выборками сцены и перебором зёрен.
Данные — общий набор data/probability (тема 05)."""
import json
import re


def build(m):
    m.use_data("probability")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0, SciPy 1.18 и statsmodels 0.15."

    m.glue("intervals_bootstrap.py", "Интервалы для среднего и доли, бутстрэп, покрытие и два нюанса — шесть блоков кода страницы подряд.",
           "Сначала четыре блока раздела «Код»: интервал для среднего чека, интервалы для доли, бутстрэп медианы, покрытие интервалов. "
           "Затем два блока «Нюансов»: пересечение отрезков и интервал разницы, бутстрэп на малой и на смещённой выборке.",
           ["mean_ci", "prop_ci", "boot_median", "coverage", "overlap", "boot_small"], need="\nНужен общий набор data/probability/.")

    # gen_scene.py — тот же файл, которым собраны данные страницы: pages/da-6-2/data/gen_scene.py
    m.take("gen_scene.py", src="../data/gen_scene.py")
    r = m.said("gen_scene.py")
    data = json.loads(re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", (m.pdir / "page.js").read_text("utf-8"), re.S).group(1))
    sc = data["scene"]
    m.check("gen_scene.py: t-интервал первой выборки сцены совпадает с данными в коде страницы (9,221–16,352)",
            sc["r40"][0][1:3] == [9.221, 16.352] and "t-интервал [9.221, 16.352]" in r.stdout, str(sc["r40"][0]))
    m.check("gen_scene.py: покрытие по 10 000 выборок 0,9273 — то же число в данных страницы", sc["cov"] == 0.9273 and "покрытие 0.9273" in r.stdout, str(sc["cov"]))
    rows = {k: [int(x) for x in v.split("|")] for k, v in re.findall(r"зерно (\d{4}): ([\d |]+?)(?:\s+←|\s*$)", r.stdout, re.M)}
    m.check("gen_scene.py: перебор зёрен — у 6202 промахов 5, 1 и 5; у 6201 — 5, 2, 5; у соседних 6203 — 9, у 6199 и 6204 — 12",
            rows.get("6202") == [5, 1, 5] and rows.get("6201") == [5, 2, 5] and rows.get("6200") == [5, 0, 3]
            and rows.get("6203", [0])[0] == 9 and rows.get("6199", [0])[0] == 12 and rows.get("6204", [0])[0] == 12, str(rows))
