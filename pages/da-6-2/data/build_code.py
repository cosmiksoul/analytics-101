"""Запускает блоки кода страницы 6.2 и вписывает код с настоящим выводом в page.js.

Запуск из любой папки:  python3 pages/da-6-2/data/build_code.py
Каждый файл data/code/<имя>.py выполняется из корня учебника (пути в коде — data/probability/…),
вывод попадает в PAGE.code между метками /*code:start*/ и /*code:end*/.
"""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
SM, SP, NP = "statsmodels 0.15.0", "SciPy 1.18.1", "NumPy 2.5.3"
BLOCKS = {
    "mean_ci": ("Средний чек недели — 4 485 ₽, а честно — от 3 818 до 5 152 ₽", f"проверено: Python 3.13, {SP}, {SM}"),
    "prop_ci": ("На 8 000 визитов способы совпали, на 100 нормальный упёрся в ноль", f"проверено: Python 3.13, {SM}"),
    "boot_median": ("Медиана чека недели — от 3 000 до 3 450 ₽, и SciPy согласен", f"проверено: Python 3.13, {NP}, {SP}"),
    "coverage": ("Чекам не хватает и 270 наблюдений, а при малом p выручает Вилсон", f"проверено: Python 3.13, {NP}, {SP}, {SM}"),
    "overlap": ("Отрезки каналов пересекаются, а интервал разницы нуля не накрывает", f"проверено: Python 3.13, {SM}"),
    "boot_small": ("При n = 10 бутстрэп уже формулы, а смещённую выборку он не лечит", f"проверено: Python 3.13, {NP}, {SP}"),
}
NOTES = {
    "prop_ci": "Метод normal в statsmodels обрезает границы отрезком [0; 1], поэтому нижняя граница малого канала — ровно 0. Последняя строка считает тот же интервал без обрезки.",
    "boot_median": "Чеки кратны 10 ₽, и медиана 270 чеков принимает немного разных значений, поэтому три интервала совпали. BCa — метод scipy.stats.bootstrap по умолчанию.",
    "coverage": "Покрытие — доля интервалов, накрывших истину, среди 10 000 или 20 000 симулированных выборок; точность самой оценки около ±0,3 п. п.",
}
code = {}
for key, (title, badge) in BLOCKS.items():
    src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
    run = subprocess.run([sys.executable, "-I", str(HERE / "code" / f"{key}.py")], cwd=PAGE.parents[1], capture_output=True, text=True, check=True)
    code[key] = {"title": title, "badge": badge, "lang": "python", "code": src, "out": run.stdout.rstrip()}
    if key in NOTES:
        code[key]["note"] = NOTES[key]
    print(f"== {key}\n{run.stdout}")

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/" + json.dumps(code, ensure_ascii=False) + "/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
