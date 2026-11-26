"""Запускает код страницы 9.3 и вписывает настоящий вывод в страницу.

Запуск:  python3 pages/da-9-3/data/build_code.py
- code/cohorts.sql выполняется в PostgreSQL 16 (база events, сокет /tmp, psql -P null=NULL);
- code/three_types.py и code/plots.py — ячейки одного ноутбука: выполняются во временной папке, куда
  подложены data/events/events.parquet и users.csv; plots.py продолжает three_types.py и сохраняет два SVG.
Код и вывод попадают в PAGE.code между /*code:start*/ и /*code:end*/, рисунки (сжатые data/svgmin.py) —
в article.html между <!--fig:имя--> и <!--/fig:имя--> как <img> с data URI.
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
EV = PAGE.parents[1] / "data" / "events"
sys.dont_write_bytecode = True                           # не оставлять __pycache__ рядом с исходниками
sys.path.insert(0, str(HERE))
from svgmin import data_uri  # noqa: E402

PY = "проверено: Python 3.13, pandas 3.0.5"
ALT = {
    "heatmap": "Тепловая карта 25 недельных когорт на 12 недель: левый столбец тёмный (неделя 1, около трети), дальше светлее; "
               "строки 16–30 марта под чертой релиза темнее соседних, четыре строки кампании в апреле светлее; правый нижний угол пуст",
    "curves": "Кривые классического удержания: серые линии когорт падают с 30–39% в неделю 1 и выравниваются к неделе 4; "
              "зелёная линия когорт 16–30 марта держится около 19%, тёмная линия до релиза и розовая линия кампании — около 15%",
}

sql = (HERE / "code" / "cohorts.sql").read_text(encoding="utf-8").rstrip()
run = subprocess.run(["psql", "-h", "/tmp", "-U", "postgres", "-d", "events", "-X", "-P", "pager=off", "-P", "null=NULL",
                      "-f", str(HERE / "code" / "cohorts.sql")], capture_output=True, text=True, check=True)
assert not run.stderr.strip(), run.stderr
sql_out = run.stdout.rstrip()

src1 = (HERE / "code" / "three_types.py").read_text(encoding="utf-8").rstrip()
src2 = (HERE / "code" / "plots.py").read_text(encoding="utf-8").rstrip()
with tempfile.TemporaryDirectory() as tmp:
    (Path(tmp) / "data").symlink_to(EV.parent)           # пути в коде: data/events/…
    out1 = subprocess.run([sys.executable, "-c", src1], cwd=tmp, capture_output=True, text=True, check=True)
    marker = "\nprint('<<<plots>>>')\n"
    out2 = subprocess.run([sys.executable, "-c", src1 + marker + src2], cwd=tmp, capture_output=True, text=True, check=True)
    for o in (out1, out2):
        assert not o.stderr.strip(), o.stderr
    figs = {k: data_uri((Path(tmp) / f"{k}.svg").read_text(encoding="utf-8")) for k in ALT}
plots_out = out2.stdout.split("<<<plots>>>\n", 1)[1].rstrip()

CODE = {
    "sql": {"title": "Таблица когорт из таблицы «пользователь — день»", "badge": "проверено: PostgreSQL 16", "lang": "sql",
            "code": sql, "out": sql_out, "outLabel": "Вывод psql: создание таблицы, затем таблица когорт, % когорты",
            "note": "NULL в выводе — клетка, неделя которой ещё не закончилась: так настроен psql (-P null=NULL). "
                    "Числа совпадают с pandas ниже и с интерактивом: это одна и та же таблица когорт."},
    "pandas": {"title": "Три вида удержания из одной таблицы", "badge": PY, "lang": "python",
               "code": src1, "out": out1.stdout.rstrip(), "outLabel": "Вывод: три строки каждой матрицы и проверка на одном человеке",
               "note": "Для когорты 1 июня последняя доступная неделя — третья. Поэтому на этой неделе классическое и скользящее удержание совпадают."},
    "plots": {"title": "Удержание по неделям и группам когорт", "badge": PY + ", Matplotlib 3.10.0", "lang": "python",
              "code": src2, "out": plots_out, "outLabel": "Размер файлов с графиками",
              "note": "Выполните предыдущую ячейку, чтобы получить types, classic, size и START. Код сохранит тепловую карту и кривые в двух файлах SVG."},
}

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/",
           lambda _: "/*code:start*/const CODE = " + json.dumps(CODE, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")

art = PAGE / "article.html"
a = art.read_text(encoding="utf-8")
for key, uri in figs.items():
    tag = f'<img src="{uri}" alt="{ALT[key]}">'
    a, n = re.subn(rf"<!--fig:{key}-->.*?<!--/fig:{key}-->", lambda _: f"<!--fig:{key}-->{tag}<!--/fig:{key}-->", a, flags=re.S)
    if n != 1:
        print(f"!! метка рисунка {key} найдена {n} раз")
art.write_text(a, encoding="utf-8")
print(sql_out[-200:], "\n", out1.stdout[-300:], "\n", plots_out)
print("рисунки:", {k: round(len(u.encode()) / 1024, 1) for k, u in figs.items()}, "КБ")
