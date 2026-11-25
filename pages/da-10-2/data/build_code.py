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
ALT = ("Удержание на двух логарифмических шкалах. Точки за месяцы 1–12 близки к прямой. "
       "К месяцу 36 степенная модель даёт 7,5% активных клиентов, модель с плато — около 12%, экспоненциальная — 0,7%. "
       "Оценки LTV за 36 месяцев составляют 2 484, 2 799 и 1 826 ₽ соответственно.")

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
    "sql": {"title": "LTV по заказам клиентов каждой когорты", "badge": "проверено: PostgreSQL 16", "lang": "sql",
            "code": (HERE / "code" / "ltv_cohorts.sql").read_text(encoding="utf-8").rstrip(), "out": sql_out,
            "outLabel": "LTV за 6 и 12 месяцев по когортам. Суммы приведены в рублях на зарегистрированного клиента",
            "note": "В строке «все 12» запрос делит общий маржинальный доход на число клиентов во всей группе. "
                    "Так каждая когорта входит в итоговый показатель с учётом своей численности. Последний столбец показывает для сравнения чистую выручку на клиента за год."},
    "fit": {"title": "Три модели удержания в SciPy", "badge": PY + ", Matplotlib 3.10.0", "lang": "python",
            "code": src1, "out": out1, "outLabel": "Проверка моделей на месяцах 7–12 и прогноз LTV на два и три года",
            "note": "Функция curve_fit подбирает параметры методом наименьших квадратов. В p0 передают их начальные значения. "
                    "Для проверки модели обучают на месяцах 1–6, а для итогового прогноза используют месяцы 1–12. Поэтому таблица прогнозов совпадает с результатами анимации."},
    "boot": {"title": "Как оценить неопределённость LTV по когортам", "badge": PY, "lang": "python",
             "code": src2, "out": out2, "outLabel": "Оценки и границы интервалов для LTV всех 12 когорт и для отдельных каналов, ₽ на клиента",
             "note": "Перед запуском выполните предыдущую ячейку. В строке органического канала &lt;NA&gt; означает, что в выгрузке нет рекламных расходов по этому каналу и CAC не рассчитан. "
                     "У генератора случайных чисел задано начальное значение, поэтому при повторном запуске границы интервалов совпадут."},
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
