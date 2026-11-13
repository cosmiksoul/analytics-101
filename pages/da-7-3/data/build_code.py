"""Запускает блоки кода страницы 7.3 и вписывает код с настоящим выводом в page.js.

Запуск из любой папки:  python3 pages/da-7-3/data/build_code.py
Блоки выполняются по очереди в одной временной папке, как ячейки одного ноутбука: в ней ссылка data → data/ учебника
(пути в коде — data/eda/clients_export.csv и data/eda/daily_metrics.csv), первый блок сохраняет
очищенную таблицу clients_clean.parquet, следующие её читают. Рисунки, которые сохраняет код
(pairplot.svg, corr.svg), остаются во временной папке и удаляются: на странице рисунки — SVG по тем же числам.
template.py — шаблон структуры ноутбука, он не запускается (в нём нет загрузки данных).
Вывод попадает в PAGE.code между метками /*code:start*/ и /*code:end*/.
"""
import json, os, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
PD = "проверено: Python 3.13, pandas 3.0.5"
BLOCKS = {
    "pairplot": ("Сильнее всего связаны визиты и заказы, возраст — ни с чем", PD + ", seaborn 0.13.2, matplotlib 3.10",
                 "Файлы pairplot.svg и corr.svg код сохраняет рядом; в страницу они не вшиты. Карта под блоком нарисована по этим же числам."),
    "segments": ("У рассылки самый высокий чек, и порядок каналов держится на каждом уровне", PD, None),
    "series": ("В выгрузке нет четырёх дней, последний неполный, выходные на четверть выше будней", PD,
               "Рисунок под блоком — тот же ряд выручки по дням с разметкой разрыва и неполного дня."),
    "template": ("Каждый вопрос получает график, вывод и следующий вопрос", "шаблон: структура ноутбука, не запускался", None),
    "noise": ("Шум даёт 9 «значимых» пар из 190, и ни одна не повторяется на новых днях", "проверено: Python 3.13, NumPy 2.5.3, SciPy 1.18.1", None),
    "agg": ("По сумме февраль просел на 17%, в пересчёте на день вырос на 7%", PD, None),
    "tail": ("Неполный последний день — это «−56%» и вдвое большая корреляция изменений", PD, None),
}
code = {}
with tempfile.TemporaryDirectory() as tmp:
    os.symlink(PAGE.parents[1] / "data", Path(tmp) / "data")
    for key, (title, badge, note) in BLOCKS.items():
        src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
        code[key] = {"title": title, "badge": badge, "lang": "python", "code": src}
        if key == "template":
            code[key]["badgeKind"] = "info"
        else:
            run = subprocess.run([sys.executable, str(HERE / "code" / f"{key}.py")], cwd=tmp, capture_output=True, text=True, check=True)
            code[key]["out"] = run.stdout.rstrip()
            print(f"== {key}\n{run.stdout}")
        if note:
            code[key]["note"] = note

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/const CODE = " + json.dumps(code, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
