"""Запускает блоки кода страницы 5.3 и вписывает код с настоящим выводом в page.js.

Запуск из папки страницы:  python3 data/build_code.py
Каждый файл data/code/<имя>.py выполняется из корня учебника (пути в коде — data/probability/…),
вывод попадает в PAGE.code между метками /*code:start*/ и /*code:end*/.
"""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
DATA = PAGE.parents[1] / "data" / "probability"
BADGE = "проверено: Python 3.13, NumPy 2.5.3, pandas 3.0.5"
BLOCKS = {
    "simulate": "Средние сжимаются к μ, а при n = 30 их гистограмма — колокол с хвостом вправо",
    "se": "Разброс средних совпадает с σ/√n: вчетверо больше чеков — вдвое уже",
    "conversion": "Доля конверсии подчиняется тому же σ/√n, но при n = 30 это ещё лесенка",
    "myth30": "При n = 30 средние чеков ещё перекошены: правый хвост вдвое тяжелее нормального",
    "notdata": "Нормальным становится среднее, а чеки остаются кривыми при любом n",
    "weekly_cv": "Недельный средний чек скачет сильнее конверсии, потому что CV чека больше единицы",
}
code = {}
for key, title in BLOCKS.items():
    src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
    run = subprocess.run([sys.executable, str(HERE / "code" / f"{key}.py")], cwd=PAGE.parents[1], capture_output=True, text=True, check=True)
    code[key] = {"title": title, "badge": BADGE, "lang": "python", "code": src, "out": run.stdout.rstrip()}
    print(f"== {key}\n{run.stdout}")

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/" + json.dumps(code, ensure_ascii=False) + "/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
