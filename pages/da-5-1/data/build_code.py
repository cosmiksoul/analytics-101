"""Запускает блоки кода страницы 5.1 и вписывает код с настоящим выводом в page.js.

Запуск из корня учебника:  python3 pages/da-5-1/data/build_code.py
Каждый файл data/code/<имя>.py выполняется из корня учебника (пути в коде — data/probability/…).
В строке «const CODE = {…};» меняются только поля code и out; заголовки, бейджи и примечания остаются.
"""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
m = re.search(r"const CODE = (\{.*\});\n", s)
code = json.loads(m.group(1))
for key in code:
    src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
    run = subprocess.run([sys.executable, str(HERE / "code" / f"{key}.py")], cwd=PAGE.parents[1], capture_output=True, text=True, check=True)
    changed = (code[key]["code"] != src, code[key]["out"] != run.stdout.rstrip())
    code[key]["code"], code[key]["out"] = src, run.stdout.rstrip()
    print(f"{key}: код {'обновлён' if changed[0] else 'тот же'}, вывод {'обновлён' if changed[1] else 'тот же'}")
s = s[:m.start(1)] + json.dumps(code, ensure_ascii=False) + s[m.end(1):]
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
