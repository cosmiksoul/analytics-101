"""Запускает блоки кода страницы 6.1 и вписывает код с настоящим выводом в page.js.

Запуск из корня учебника:  python3 pages/da-6-1/data/build_code.py
Каждый файл data/code/<имя>.py выполняется из корня учебника (пути в коде — data/inference/users.csv;
совокупность делает data/inference/gen_users.py). Вывод попадает в PAGE.code между метками /*code:start*/ и /*code:end*/.
"""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
BASE = "проверено: Python 3.13, NumPy 2.5.3, pandas 3.0.5"
BLOCKS = {
    "selection": ("Смещённый отбор: в 16 раз больше выборка — вчетверо меньше разброс, а смещение то же", BASE),
    "se": ("Стандартная ошибка по одной выборке: s/√n для среднего, √(p̂(1 − p̂)/n) для доли", BASE + ", SciPy 1.18.1, statsmodels 0.15.0"),
    "ddof": ("Деление на n занижает дисперсию в (n − 1)/n раз, деление на n − 1 — нет", BASE),
    "weights": ("Веса по активности срезают смещение опроса вдвое, но не до нуля", BASE + ", statsmodels 0.15.0"),
}
code = {}
for key, (title, badge) in BLOCKS.items():
    src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
    run = subprocess.run([sys.executable, str(HERE / "code" / f"{key}.py")], cwd=PAGE.parents[1], capture_output=True, text=True, check=True)
    code[key] = {"title": title, "badge": badge, "lang": "python", "code": src, "out": run.stdout.rstrip()}
    print(f"== {key}\n{run.stdout}")

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/" + json.dumps(code, ensure_ascii=False) + "/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
