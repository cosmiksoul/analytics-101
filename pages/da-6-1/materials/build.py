"""Материалы страницы 6.1: четыре блока кода одним скриптом и скрипт с выборками сцены и перебором зёрен.
Данные — общий набор data/inference (тема 06)."""
import json
import re


def build(m):
    m.use_data("inference")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0, SciPy 1.18 и statsmodels 0.15."

    m.glue("sampling.py", "Четыре примера расчёта по данным пользователей магазина.",
           "Сначала сравним способы отбора при разных размерах выборки, оценим стандартную ошибку и проверим, как влияет "
           "деление на n или на n − 1. Затем учтём активность участников опроса с помощью весов.",
           ["selection", "se", "ddof", "weights"], need="\nНужен общий набор data/inference/ (users.csv).")

    # gen_page.py — тот же файл, которым собраны данные страницы: pages/da-6-1/data/gen_page.py
    m.take("gen_page.py", src="../data/gen_page.py")
    r = m.said("gen_page.py")
    data = json.loads(re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", (m.pdir / "page.js").read_text("utf-8"), re.S).group(1))
    first = re.search(r"случайные по 100\s+первые (\[[^\]]+\])", r.stdout)
    first = json.loads(first.group(1)) if first else []
    m.check("gen_page.py: первые десять оценок сцены совпадают с данными в коде страницы, от 3 025 до 5 486 ₽ — как в тексте",
            first == data["scene"]["r100"][:10] and (min(first), max(first)) == (3025, 5486), str(first))
    rows = dict(re.findall(r"^(61\d\d)\s+(\d+)\s", r.stdout, re.M))
    fives = sorted(k for k, v in rows.items() if v == "5")
    m.check("gen_page.py: в таблице двадцать зёрен, 5 из 10 выше μ у 6110, 6111 и 6119, крайние — 0 (6114) и 9 (6118)",
            len(rows) == 20 and fives == ["6110", "6111", "6119"] and rows.get("6114") == "0" and rows.get("6118") == "9"
            and min(map(int, rows.values())) == 0 and max(map(int, rows.values())) == 9, str(rows))
    m.check("gen_page.py: строка зерна 6111 помечена как сцена", bool(re.search(r"^6111 .*← сцена$", r.stdout, re.M)))
