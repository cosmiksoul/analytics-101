"""Запускает код страницы 11.2 и вписывает настоящий вывод в страницу.

Запуск:  python3 pages/da-11-2/data/build_code.py
code/design.py, code/power_sm.py и code/simulate.py — ячейки одного ноутбука: выполняются подряд одним процессом
во временной папке, куда подложены exposures.csv и sessions.parquet из data/ab. Вывод каждой ячейки отделяется
меткой. code/design_doc.txt — шаблон документа дизайна, он не запускается.
Код и вывод попадают в PAGE.code между /*code:start*/ и /*code:end*/.
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
AB = PAGE.parents[1] / "data" / "ab"
C = HERE / "code"

cells = [(C / f).read_text(encoding="utf-8").rstrip() for f in ("design.py", "power_sm.py", "simulate.py")]
src = "\n".join(f"print('<<<cell{i}>>>')\n{c}" for i, c in enumerate(cells))
with tempfile.TemporaryDirectory() as tmp:
    (Path(tmp) / "data").symlink_to(AB.parent)                  # путь в коде: data/ab/…
    run = subprocess.run([sys.executable, "-c", src], cwd=tmp, capture_output=True, text=True, check=True)
assert not run.stderr.strip(), run.stderr
outs = [o.strip("\n") for o in re.split(r"<<<cell\d>>>\n", run.stdout)[1:]]
assert len(outs) == 3

CODE = {
    "manual": {"title": "Параметры из данных, MDE из денег и размер выборки вручную",
               "badge": "проверено: Python 3.13", "lang": "python", "code": cells[0], "out": outs[0],
               "note": "Базой служит группа A самого checkout_v2: это и есть «4 недели без изменения». В жизни её берут "
                       "из прошлого периода той же длины. 783 ₽ — маржинальный доход обычного заказа своего товара "
                       "из учебной выгрузки темы 10, 5 млн ₽ — условная цена изменения."},
    "sm": {"title": "То же в statsmodels: размер выборки, MDE по выборке, мощность по факту",
           "badge": "проверено: statsmodels 0.15.0", "lang": "python", "code": cells[1], "out": outs[1],
           "note": "Ячейка продолжает предыдущую: p0, p1, mde, d_rev, sd, users уже в памяти. solve_power возвращает "
                   "nobs1 — людей в первой группе; вторая — nobs1 · ratio."},
    "sim": {"title": "Проверка мощности симуляцией: тысячи тестов с известным эффектом",
            "badge": "проверено: NumPy 2.5.3, SciPy 1.18", "lang": "python", "code": cells[2], "out": outs[2],
            "outLabel": "Вывод: доля тестов с p < 0,05",
            "note": "Ячейка продолжает две предыдущие. Погрешность доли по 2 000 тестов — около 1 п. п. "
                    "Зерно генератора фиксировано, повторный запуск даёт тот же вывод."},
    "doc": {"title": "Шаблон документа дизайна, заполненный для checkout_v2", "badge": "шаблон, не код",
            "badgeKind": "info", "lang": "text", "code": (C / "design_doc.txt").read_text(encoding="utf-8").rstrip()},
}

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s, k = re.subn(r"/\*code:start\*/.*?/\*code:end\*/",
               lambda _: "/*code:start*/const CODE = " + json.dumps(CODE, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
assert k == 1, "метка code не найдена"
js.write_text(s, encoding="utf-8")
for o in outs:
    print(o, "\n---")
