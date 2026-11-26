"""Запускает блоки кода страницы 6.3 и вписывает код с настоящим выводом в page.js.

Запуск из корня учебника:  python3 pages/da-6-3/data/build_code.py
Каждый файл data/code/<имя>.py выполняется из корня учебника (пути в коде — data/inference/pilot.csv),
вывод попадает в PAGE.code между метками /*code:start*/ и /*code:end*/."""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
BLOCKS = {
    "perm": ("В 293 из 10 000 перестановок разница не меньше исходной по модулю",
             "проверено: Python 3.13, NumPy 2.5.3, pandas 3.0.5"),
    "ttest": ("Тест Уэлча даёт p = 0,033 и интервал для разницы средних",
              "проверено: Python 3.13, SciPy 1.18.1, pandas 3.0.5"),
    "false_alarms": ("При одинаковых кнопках около 5% пилотов дают p < 0,05",
                     "проверено: Python 3.13, NumPy 2.5.3, SciPy 1.18.1"),
    "power": ("Тест обнаруживает прибавку в 500 ₽ реже, чем в 1 000 ₽",
              "проверено: Python 3.13, SciPy 1.18.1, statsmodels 0.15.0"),
}
code = {}
for key, (title, badge) in BLOCKS.items():
    src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
    run = subprocess.run([sys.executable, str(HERE / "code" / f"{key}.py")], cwd=PAGE.parents[1], capture_output=True, text=True, check=True)
    code[key] = {"title": title, "badge": badge, "lang": "python", "code": src, "out": run.stdout.rstrip()}
    print(f"== {key}\n{run.stdout}")

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s2 = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/" + json.dumps(code, ensure_ascii=False) + "/*code:end*/", s, flags=re.S)
if s2 != s:
    js.write_text(s2, encoding="utf-8")
print("page.js:", "обновлён" if s2 != s else "без изменений")
