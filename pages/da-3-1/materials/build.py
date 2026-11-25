"""Материалы страницы 3.1: пять запросов и сравнение трёх СУБД. База — общий набор data/shop."""
import os


def build(m):
    m.use_data("shop")
    m.versions = "Код проверен на PostgreSQL 16.15, SQLite 3.53 и DuckDB 2.0; скрипты — на Python 3.13."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="shop")     # подключение песочницы

    # Пять запросов: каждый — файл в queries/, запуск через psql -f, вывод дословно как на странице
    for n in range(1, 6):
        key = f"s{n}"
        m.put(f"queries/q{n}.sql", m.page_code(key))
        cmd = ["psql", "-P", "null=NULL", "-f", f"q{n}.sql"] if n == 4 else ["psql", "-f", f"q{n}.sql"]
        m.run(cmd, expect=m.page_out(key), sub="queries", code=None, merge=True, what=f"psql -f q{n}.sql")

    # Сравнение PostgreSQL, SQLite и DuckDB
    m.script("dialects.py", "dialects")

    # Блок «Тот же запрос к SQLite из pandas» в материалы не входит, но его вывод тоже сверяем
    (m.work / "_pandas_block.py").write_text(m.page_code("pandas"), encoding="utf-8")
    m.run(["python", "_pandas_block.py"], expect=m.page_out("pandas"), what="блок «pandas» (не в материалах)")

    m.extra = ("Файлы из `queries/` можно выполнить с помощью psql. Например, первый запрос запускается командой `psql -d shop -f da-3-1-select-order/queries/q1.sql`; "
               "для q4 добавьте `-P null=NULL`, чтобы psql явно показывал NULL в выводе.")
