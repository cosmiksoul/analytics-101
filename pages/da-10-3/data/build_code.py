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
ALT = ("Три канала строками. Партнёры: платим 1 263 ₽, предел для окупаемости за год 1 498 ₽ — запас есть. "
       "Поиск: платим 1 506 ₽, предел 1 482 ₽ — точки почти совпадают, следующий клиент стоит 1 935 ₽. "
       "Соцсети, выделены цветом: платим 3 054 ₽, предел 449 ₽ — длинная линия разрыва.")

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
    "sql": {"title": "Кривые окупаемости по каналам и когортам", "badge": "проверено: PostgreSQL 16", "lang": "sql",
            "code": (HERE / "code" / "payback.sql").read_text(encoding="utf-8").rstrip(), "out": sql_out,
            "outLabel": "Вывод psql: создание таблицы, каналы, когорты поиска; суммы в ₽ на клиента",
            "note": "bal_n — накопленный маржинальный доход минус CAC к концу месяца жизни n, payback_n — первый месяц, "
                    "где он не меньше нуля. NULL — месяц ещё не наступил или когорта не окупилась: так настроен psql "
                    "(-P null=NULL). Кривые каналов те же, что в сцене и в интерактиве."},
    "pandas": {"title": "Сценарный калькулятор: отдача, сценарии, эксперимент, денежный поток", "badge": PY, "lang": "python",
               "code": src1, "out": out1.stdout.rstrip(), "outLabel": "Вывод: четыре расчёта по порядку",
               "note": "Удержание в сценариях множит приросты месяцев 1–23: в месяц регистрации активны все. "
                       "Денежный поток считает только 24 месяца жизни когорты — хвост после них не добавлен."},
    "plot": {"title": "Один график для маркетинга по правилам 8.4", "badge": PY + ", Matplotlib 3.10.0", "lang": "python",
             "code": src2, "out": plot_out, "outLabel": "Вывод print; рисунок — под блоком",
             "note": "Ячейка продолжает предыдущую: CAC, increments и beta уже в памяти. В страницу рисунок вставлен сжатым."},
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
