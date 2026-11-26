"""Запускает блоки кода страницы 7.2 и вписывает код с настоящим выводом в page.js.

Запуск из любой папки:  python3 pages/da-7-2/data/build_code.py
Ячейки раздела «Код» (c1…c4) — один ноутбук: выполняются по порядку в общем пространстве имён.
Блоки нюансов (n1…n3) самостоятельны: каждый в своём пространстве имён.
Рабочая папка — корень учебника: пути в коде — data/eda/clients_export.csv (файлы только читаются). Вывод и предупреждения
собираются в один поток в том порядке, в каком появились. Результат — между метками
/*code:start*/ и /*code:end*/ в page.js. Окружение: Python 3.13, pandas 3.0.5, NumPy 2.5.3,
SciPy 1.18.1, matplotlib 3.10.
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

PD, NP, SP, MPL = "pandas 3.0.5", "NumPy 2.5.3", "SciPy 1.18.1", "matplotlib 3.10"
BLOCKS = {
    "c1_describe": ("Среднее по выгрузке в 2,5 раза больше медианы", f"проверено: Python 3.13, {PD}, {SP}"),
    "c2_hist_all": ("В первом интервале гистограммы трат оказались почти все суммы", f"проверено: Python 3.13, {PD}, {MPL}"),
    "c3_round_peaks": ("Сумма 5 000 ₽ встречается в 44 раза чаще, чем в среднем соседние суммы", f"проверено: Python 3.13, {PD}, {NP}"),
    "c4_rules": ("Число сумм выше порога зависит от правила", f"проверено: Python 3.13, {PD}, {SP}"),
    "n1_zeros": ("В 27 строках с нулевыми тратами число заказов неизвестно", f"проверено: Python 3.13, {PD}, {NP}"),
    "n2_age": ("После замены кода 99 на пропуск средний возраст снижается", f"проверено: Python 3.13, {PD}"),
    "n3_combo": ("В одной строке указаны траты при нуле заказов", f"проверено: Python 3.13, {PD}"),
}
NOTES = {"n1_zeros": "При вычислении log10(0) и log1p(−1) NumPy возвращает −inf и выводит предупреждение. Имя файла в тексте предупреждения зависит от среды запуска."}
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
