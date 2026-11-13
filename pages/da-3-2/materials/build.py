"""Материалы страницы 3.2: четыре блока кода одним файлом, упражнения с самопроверкой и решения.
База — общий набор data/shop."""
import os

TITLES = {"types": "Пять типов JOIN на одной паре таблиц", "anti": "Анти-соединение четырьмя способами",
          "self": "Самосоединение и NULL в ключе", "count": "COUNT до и после соединения, составной ключ"}


def build(m):
    m.use_data("shop")
    m.versions = "Код проверен на PostgreSQL 16.15, SQLite 3.53 и DuckDB 2.0; скрипты — на Python 3.13."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="shop")     # подключение песочницы

    # joins.sql — четыре блока кода страницы подряд, как они идут в разделе «Код»
    keys = ["types", "anti", "self", "count"]
    text = ("-- Запросы страницы 3.2 «JOIN» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.\n"
            "-- Запуск из корня папки материалов: psql -d shop -P null=NULL -f da-3-2-join/joins.sql\n"
            "-- Первый блок кладёт выборку из сцены во временные таблицы, остальные работают со всей базой.\n")
    for k in keys:
        text += f"\n-- ===== {TITLES[k]} =====\n" + m.page_code(k)
    m.put("joins.sql", text)
    expected = "\n\n".join(m.page_out(k).strip("\n") for k in keys)
    m.run(["psql", "-P", "null=NULL", "-f", "joins.sql"], expect=expected, code=None, merge=True, what="psql -f joins.sql")

    # Упражнения: нетронутые заглушки не сходятся, решения сходятся
    m.take("exercises.sql")
    r = m.run(["psql", "-At", "-f", "exercises.sql"], code=None, merge=True, what="psql -f exercises.sql")
    m.check("exercises.sql: пять проверок на заглушках отвечают «не сошлось», ошибок нет",
            r.stdout.count("не сошлось") == 5 and "верно" not in r.stdout and "ERROR" not in r.stdout, "\n" + r.stdout[-800:])
    m.take("exercises_solutions.sql")
    r = m.run(["psql", "-At", "-f", "exercises_solutions.sql"], code=None, merge=True, what="psql -f exercises_solutions.sql")
    m.check("exercises_solutions.sql: все пять проверок отвечают «верно», ошибок нет",
            r.stdout.count(": верно") == 5 and "не сошлось" not in r.stdout and "ERROR" not in r.stdout, "\n" + r.stdout[-800:])
