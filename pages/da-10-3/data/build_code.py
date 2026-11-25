"""Запускает код страницы 10.3 и вписывает настоящий вывод в страницу.

Запуск:  python3 pages/da-10-3/data/build_code.py
- code/payback.sql выполняется в PostgreSQL 16 (база unit, сокет /tmp, psql -P null=NULL);
- code/scenarios.py и code/plot.py — ячейки одного ноутбука: выполняются во временной папке, куда подложены
  CSV из data/unit; plot.py продолжает scenarios.py и сохраняет SVG.
Код и вывод попадают в PAGE.code между /*code:start*/ и /*code:end*/, рисунок (сжатый svgmin.py страницы 9.3) —
в article.html между <!--fig:limits--> и <!--/fig:limits--> как <img> с data URI.
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
ROOT = PAGE.parents[1]
UNIT = ROOT / "data" / "unit"
sys.path.insert(0, str(ROOT / "pages" / "da-9-3" / "data"))
from svgmin import data_uri  # noqa: E402

PY = "проверено: Python 3.13, pandas 3.0.5, NumPy 2.5.3"
ALT = "Партнёры. Привлечение клиента стоит 1 263 ₽, за год на клиента приходится 1 498 ₽ маржинального дохода. Поиск. Стоимость привлечения 1 506 ₽, доход за год 1 482 ₽. По модели, привлечение следующего клиента обойдётся примерно в 1 935 ₽. Соцсети. Стоимость привлечения 3 054 ₽, доход за год 449 ₽."

run = subprocess.run(["psql", "-h", "/tmp", "-U", "postgres", "-d", "unit", "-X", "-P", "pager=off", "-P", "null=NULL",
                      "-f", str(HERE / "code" / "payback.sql")], capture_output=True, text=True, check=True)
assert not run.stderr.strip(), run.stderr
sql_out = run.stdout.rstrip()

src1 = (HERE / "code" / "scenarios.py").read_text(encoding="utf-8").rstrip()
src2 = (HERE / "code" / "plot.py").read_text(encoding="utf-8").rstrip()
with tempfile.TemporaryDirectory() as tmp:
    (Path(tmp) / "data").symlink_to(UNIT.parent)      # путь в коде: data/unit/…
    out1 = subprocess.run([sys.executable, "-c", src1], cwd=tmp, capture_output=True, text=True, check=True)
    marker = "\nprint('<<<plot>>>')\n"
    out2 = subprocess.run([sys.executable, "-c", src1 + marker + src2], cwd=tmp, capture_output=True, text=True, check=True)
    for o in (out1, out2):
        assert not o.stderr.strip(), o.stderr
    fig = data_uri((Path(tmp) / "payback_limits.svg").read_text(encoding="utf-8"))
plot_out = out2.stdout.split("<<<plot>>>\n", 1)[1].rstrip()

CODE = {
    "sql": {"title": "Баланс и срок окупаемости по каналам и когортам", "badge": "проверено: PostgreSQL 16", "lang": "sql",
            "code": (HERE / "code" / "payback.sql").read_text(encoding="utf-8").rstrip(), "out": sql_out,
            "outLabel": "Результаты запроса по трём каналам и по когортам из поиска. Денежные суммы указаны в рублях на клиента",
            "note": "В столбце bal_n из накопленного к концу месяца n маржинального дохода вычтен CAC. "
                    "Столбец payback_n показывает первый месяц, когда баланс достиг нуля или стал положительным. "
                    "Значение NULL в столбце LTV означает, что полный срок наблюдения ещё не прошёл. "
                    "В столбце payback_n оно означает, что за время наблюдения расходы не окупились."},
    "pandas": {"title": "Что меняется при росте бюджета, удержания или среднего чека", "badge": PY, "lang": "python",
               "code": src1, "out": out1.stdout.rstrip(), "outLabel": "Стоимость дополнительного клиента, сценарии для поиска, эффект эксперимента и денежный поток",
               "note": "В модели рост удержания меняет доход с месяца 1. Месяц регистрации считается отдельно. "
                       "Для каждой когорты в расчёт денежного потока входят её первые 24 месяца. "
                       "Месяцы в последней таблице пронумерованы с нуля."},
    "plot": {"title": "Сравнение CAC с годовым доходом на клиента", "badge": PY + ", Matplotlib 3.10.0", "lang": "python",
             "code": src2, "out": plot_out, "outLabel": "Средний CAC и годовой доход на клиента по каналам",
             "note": "Перед запуском выполните предыдущую ячейку. Из неё понадобятся значения CAC, оценки эластичности и функция increments. График показан ниже."},
}

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s, k = re.subn(r"/\*code:start\*/.*?/\*code:end\*/",
               lambda _: "/*code:start*/const CODE = " + json.dumps(CODE, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
assert k == 1, "метка code не найдена"
js.write_text(s, encoding="utf-8")

art = PAGE / "article.html"
a = art.read_text(encoding="utf-8")
tag = f'<img src="{fig}" alt="{ALT}">'
a, n = re.subn(r"<!--fig:limits-->.*?<!--/fig:limits-->", lambda _: f"<!--fig:limits-->{tag}<!--/fig:limits-->", a, flags=re.S)
assert n == 1, f"метка рисунка найдена {n} раз"
art.write_text(a, encoding="utf-8")
print(sql_out[:900], "\n...\n", out1.stdout, "\n", plot_out)
print("рисунок:", round(len(fig.encode()) / 1024, 1), "КБ")
