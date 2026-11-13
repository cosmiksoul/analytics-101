"""Материалы страницы 3.5: все запросы страницы, пример с QUALIFY и выборка интерактива.
База — общий набор data/shop."""
import csv
import io
import os

TITLES = {"ties": "Равные даты: рамка по умолчанию и ROWS", "where": "Окно в WHERE — ошибка, окно в CTE — работает",
          "retention": "Удержание через LAG", "moving": "Скользящее среднее за 7 дней: ROWS и RANGE",
          "top3": "Топ-3 по штукам и ничьи", "lastver": "Последняя версия записи из журнала"}


def build(m):
    m.use_data("shop")
    m.versions = "Код проверен на PostgreSQL 16.15, SQLite 3.53 и DuckDB 2.0; скрипты — на Python 3.13."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="shop")     # подключение песочницы

    keys = ["ties", "where", "retention", "moving", "top3", "lastver"]          # нюансы, потом четыре отчёта
    text = ("-- Запросы страницы 3.5 «Оконные функции» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.\n"
            "-- Запуск из корня папки материалов: psql -d shop -P null=NULL < da-3-5-window-functions/window_functions.sql\n"
            "-- Второй блок начинается с запроса, который нарочно падает: оконная функция в WHERE.\n")
    for k in keys:
        text += f"\n-- ===== {TITLES[k]} =====\n" + m.page_code(k)
    m.put("window_functions.sql", text)
    expected = "\n\n".join(m.page_out(k).strip("\n") for k in keys)
    # На странице ошибка блока «where» получена отдельным вызовом: комментарий над запросом вошёл в его текст,
    # поэтому там LINE 6, а после ошибки стоит пустая строка. В общем файле psql считает строки от SELECT.
    old = "LINE 6:   AND amount > AVG(amount) OVER (PARTITION BY channel);\n                       ^\n\n"
    m.check("в выводе страницы есть ошибка «window functions are not allowed in WHERE» с указанием строки", expected.count(old) == 1)
    expected = expected.replace(old, "LINE 5:   AND amount > AVG(amount) OVER (PARTITION BY channel);\n                       ^\n")
    m.run(["psql", "-P", "null=NULL"], stdin="window_functions.sql", expect=expected, code=None, merge=True,
          what="psql < window_functions.sql")

    m.script("qualify.py", "qualify")

    # Выборка интерактива: 11 оплаченных заказов «Сова» за 1–7 марта
    import psycopg
    with psycopg.connect("host=/tmp dbname=shop user=postgres") as con:
        rows = con.execute("""
            SELECT order_id, order_date, channel, amount
            FROM orders
            WHERE status = 'paid' AND brand = 'Сова' AND order_date BETWEEN '2026-03-01' AND '2026-03-07'
            ORDER BY order_date, order_id""").fetchall()
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(["order_id", "order_date", "channel", "amount"])
    w.writerows(rows)
    m.put("sova_week.csv", buf.getvalue())
    m.check("sova_week.csv: 11 заказов на 38 130 ₽, как в интерактиве и блоке про равные даты",
            len(rows) == 11 and sum(r[3] for r in rows) == 38130, f"{len(rows)} строк")
