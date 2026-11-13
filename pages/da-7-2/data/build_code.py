"""Запускает блоки кода страницы 7.2 и вписывает код с настоящим выводом в page.js.

Запуск из любой папки:  python3 pages/da-7-2/data/build_code.py
Ячейки раздела «Код» (c1…c4) — один ноутбук: выполняются по порядку в общем пространстве имён.
Блоки нюансов (n1…n3) самостоятельны: каждый в своём пространстве имён.
Рабочая папка — корень учебника: пути в коде — data/eda/clients_export.csv (файлы только читаются). Вывод и предупреждения
собираются в один поток в том порядке, в каком появились. Результат — между метками
/*code:start*/ и /*code:end*/ в page.js. Окружение: Python 3.13, pandas 3.0.5, NumPy 2.5.3,
SciPy 1.18.1, matplotlib 3.10.0.
"""
import contextlib
import io
import json
import linecache
import os
import re
import sys
import warnings
from pathlib import Path

os.environ["MPLBACKEND"] = "Agg"
HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
ROOT = PAGE.parents[1]

PD, NP, SP, MPL = "pandas 3.0.5", "NumPy 2.5.3", "SciPy 1.18.1", "matplotlib 3.10.0"
BLOCKS = {
    "c1_describe": ("describe: траты от 0 до 19,9 млн, медиана в 2,5 раза ниже среднего", f"проверено: Python 3.13, {PD}, {SP}"),
    "c2_hist_all": ("Одна строка — пять гистограмм, и у трат вышел один столбик", f"проверено: Python 3.13, {PD}, {MPL}"),
    "c3_round_peaks": ("На 5 000 ₽ клиентов в 44 раза больше, чем на соседних суммах", f"проверено: Python 3.13, {PD}, {NP}"),
    "c4_rules": ("Три правила — от 5 до 844 флагов на одном столбце", f"проверено: Python 3.13, {PD}, {SP}"),
    "n1_zeros": ("Нули — клиенты без заказов, и логарифм их не берёт", f"проверено: Python 3.13, {PD}, {NP}"),
    "n2_age": ("99 — не возраст, а код «не указан»: в пропуск, строку оставить", f"проверено: Python 3.13, {PD}"),
    "n3_combo": ("1 000 ₽ без единого заказа: по отдельности всё нормально", f"проверено: Python 3.13, {PD}"),
}
NOTES = {"n1_zeros": "Строки RuntimeWarning — предупреждения NumPy о делении на ноль внутри логарифма. В Jupyter они такие же, только с другим именем файла."}
SEQUENTIAL = ["c1_describe", "c2_hist_all", "c3_round_peaks", "c4_rules"]


def run(key, ns):
    src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip() + "\n"
    name = f"{key}.py"
    linecache.cache[name] = (len(src), None, src.splitlines(True), name)
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf), warnings.catch_warnings():
        warnings.simplefilter("default")
        exec(compile(src, name, "exec"), ns)
    return src.rstrip(), buf.getvalue().rstrip()


def main():
    os.chdir(ROOT)
    import matplotlib.pyplot  # noqa: F401 — служебные предупреждения matplotlib при импорте не идут в вывод ячеек
    code, shared = {}, {"__name__": "__main__"}
    for key, (title, badge) in BLOCKS.items():
        ns = shared if key in SEQUENTIAL else {"__name__": "__main__"}
        src, out = run(key, ns)
        code[key] = {"title": title, "badge": badge, "lang": "python", "code": src, "out": out}
        if key in NOTES:
            code[key]["note"] = NOTES[key]
        print(f"== {key}\n{out}\n")
    js = PAGE / "page.js"
    if js.exists() and "/*code:start*/" in js.read_text(encoding="utf-8"):
        s = js.read_text(encoding="utf-8")
        s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/",
                   lambda _: "/*code:start*/" + json.dumps(code, ensure_ascii=False) + "/*code:end*/", s, flags=re.S)
        js.write_text(s, encoding="utf-8")
        print("page.js обновлён")


if __name__ == "__main__":
    main()
