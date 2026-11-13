"""Запускает блоки кода страницы 6.5 и вписывает код с настоящим выводом в page.js.

Запуск из корня учебника:  python3 pages/da-6-5/data/build_code.py
Каждый data/code/<имя>.py выполняется во временной папке со ссылкой data → data/ учебника: пути в коде —
data/clients/clients.csv (общий набор темы 04) и data/inference/discounts.csv (набор темы 06).
Файлы, которые пишет код (corr_heatmap.svg), остаются во временной папке и удаляются.
Вывод попадает в PAGE.code между метками /*code:start*/ и /*code:end*/.
"""
import json, os, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
B = "проверено: Python 3.13, pandas 3.0.5"
BLOCKS = {
    "matrix": ("Траты сильнее всего связаны с заказами, возраст — почти ни с чем", B + ", matplotlib 3.10.0",
               "Карта под блоком нарисована SVG по этим же числам; файл corr_heatmap.svg, который сохраняет код, в страницу не вшит."),
    "spearman": ("Один выброс переворачивает знак Пирсона, а Спирмен почти не меняется", B, None),
    "simpson": ("По всем заказам скидка «поднимает» чек, внутри каждой категории — снижает", B + ", NumPy 2.5.3", None),
    "nonlinear": ("Связь сильная, а r = 0: дугу Пирсон не видит", B + ", NumPy 2.5.3", None),
    "aggregate": ("Те же клиенты, усреднённые по возрасту, дают r в шесть раз больше", B, None),
    "trend": ("Два независимых ряда с трендом дают r = 0,9, а их изменения — ноль", "проверено: Python 3.13, NumPy 2.5.3", None),
}
code = {}
with tempfile.TemporaryDirectory() as tmp:
    os.symlink(PAGE.parents[1] / "data", Path(tmp) / "data")
    for key, (title, badge, note) in BLOCKS.items():
        src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
        run = subprocess.run([sys.executable, str(HERE / "code" / f"{key}.py")], cwd=tmp, capture_output=True, text=True, check=True)
        code[key] = {"title": title, "badge": badge, "lang": "python", "code": src, "out": run.stdout.rstrip()}
        if note: code[key]["note"] = note
        print(f"== {key}\n{run.stdout}")

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/const CODE = " + json.dumps(code, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
