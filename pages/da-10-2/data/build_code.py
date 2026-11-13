"""Запускает код страницы 10.2 и вписывает настоящий вывод в страницу.

Запуск:  python3 pages/da-10-2/data/build_code.py   (после gen_page.py)
- code/ltv_cohorts.sql выполняется в PostgreSQL 16 (база unit, сокет /tmp, psql -P null=NULL);
- code/tail_fit.py и code/bootstrap.py — ячейки одного ноутбука: выполняются во временной папке, куда подложены
  CSV из data/unit; bootstrap.py продолжает tail_fit.py; tail_fit.py сохраняет рисунок tails.svg.
Код и вывод попадают в PAGE.code между /*code:start*/ и /*code:end*/, рисунок (сжатый svgmin.py страницы 9.3) —
в article.html между <!--fig:tails--> и <!--/fig:tails--> как <img> с data URI.
Сверяет вывод кода с числами сцены из DATA: если gen_page.py и код разошлись, падает.
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
UNIT = PAGE.parents[1] / "data" / "unit"
sys.dont_write_bytecode = True                 # не трогаем __pycache__ чужой страницы
sys.path.insert(0, str(PAGE.parent / "da-9-3" / "data"))
from svgmin import data_uri  # noqa: E402

PY = "проверено: Python 3.13, pandas 3.0.5, SciPy 1.18.1"
ALT = ("Удержание 12 когорт в логарифмических осях: точки месяцев 1–12 лежат почти на прямой; синяя степенная прямая "
       "продолжается до месяца 36 к 7,5%, фиолетовое плато выходит на 12%, розовая экспонента загибается вниз до 0,7%; "
       "подписи LTV36: плато 2 799 ₽, степенная 2 484 ₽, экспонента 1 826 ₽")

run = subprocess.run(["psql", "-h", "/tmp", "-U", "postgres", "-d", "unit", "-X", "-P", "pager=off", "-P", "null=NULL",
                      "-f", str(HERE / "code" / "ltv_cohorts.sql")], capture_output=True, text=True, check=True)
assert not run.stderr.strip(), run.stderr
sql_out = run.stdout.rstrip()

src1 = (HERE / "code" / "tail_fit.py").read_text(encoding="utf-8").rstrip()
src2 = (HERE / "code" / "bootstrap.py").read_text(encoding="utf-8").rstrip()
with tempfile.TemporaryDirectory() as tmp:
    (Path(tmp) / "data").symlink_to(UNIT.parent)      # путь в коде: data/unit/…
    marker = "\nprint('<<<boot>>>')\n"
    out = subprocess.run([sys.executable, "-c", src1 + marker + src2], cwd=tmp, capture_output=True, text=True, check=True)
    assert not out.stderr.strip(), out.stderr
    fig = data_uri((Path(tmp) / "tails.svg").read_text(encoding="utf-8"))
out1, out2 = (x.rstrip() for x in out.stdout.split("<<<boot>>>\n", 1))

# сверка с DATA из gen_page.py
js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
DATA = json.loads(re.search(r"/\*data:start\*/const DATA = (.*?);/\*data:end\*/", s, re.S).group(1))
sc = DATA["sc"]
for k, nm in (("pow", "степенная"), ("exp", "экспонента"), ("plat", "плато")):
    row = re.search(rf"^{nm}\s+(\d+)\s+(\d+)", out1, re.M)
    assert row and [int(row.group(1)), int(row.group(2))] == [sc["ltv"][k]["24"], sc["ltv"][k]["36"]], (nm, row)
b = sc["boot"]
assert f"LTV12: 1413 ₽, 95% интервал {b['lo12']}–{b['hi12']} ₽" in out2, out2
assert f"95% интервал {b['lo24']}–{b['hi24']} ₽" in out2, out2

CODE = {
    "sql": {"title": "LTV когорт из таблицы заказов", "badge": "проверено: PostgreSQL 16", "lang": "sql",
            "code": (HERE / "code" / "ltv_cohorts.sql").read_text(encoding="utf-8").rstrip(), "out": sql_out,
            "outLabel": "Вывод psql: 12 когорт и вся группа, ₽ на зарегистрированного клиента",
            "note": "Строка «все 12» — сумма маржи, делённая на всех клиентов группы, а не среднее двенадцати чисел: "
                    "когорты разного размера. Те же числа дают pandas ниже, сцена и интерактив."},
    "fit": {"title": "Хвост через scipy.optimize.curve_fit", "badge": PY + ", Matplotlib 3.10.0", "lang": "python",
            "code": src1, "out": out1, "outLabel": "Вывод: проверка на месяцах 7–12, подгонка по 1–12, LTV по трём хвостам; рисунок — под блоком",
            "note": "curve_fit подбирает параметры методом наименьших квадратов, p0 — стартовая точка поиска. "
                    "Таблица LTV совпадает со сценой: те же 12 когорт, та же маржа на активного в хвосте."},
    "boot": {"title": "Бутстрэп интервала LTV по когортам", "badge": PY, "lang": "python",
             "code": src2, "out": out2, "outLabel": "Вывод: интервалы для группы и для каналов, ₽",
             "note": "Ячейка продолжает предыдущую. &lt;NA&gt; — у органики нет расходов, CAC не определён. "
                     "Зерно генератора зафиксировано: повторный запуск даёт те же границы."},
}
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/",
           lambda _: "/*code:start*/const CODE = " + json.dumps(CODE, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")

art = PAGE / "article.html"
a = art.read_text(encoding="utf-8")
tag = f'<img src="{fig}" alt="{ALT}">'
a, n = re.subn(r"<!--fig:tails-->.*?<!--/fig:tails-->", lambda _: f"<!--fig:tails-->{tag}<!--/fig:tails-->", a, flags=re.S)
if n != 1:
    print(f"!! метка рисунка найдена {n} раз")
art.write_text(a, encoding="utf-8")
print(sql_out[-120:], "\n", out1, "\n", out2)
print("рисунок:", round(len(fig.encode()) / 1024, 1), "КБ")
