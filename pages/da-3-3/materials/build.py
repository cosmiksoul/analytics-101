"""Материалы страницы 3.3: четыре блока запросов, сравнение трёх СУБД и выборка интерактива.
База — общий набор data/shop."""
import csv
import io
import os

TITLES = {"channels": "Метрики по каналам и группы из двух столбцов с HAVING", "conditional": "Условные агрегаты: CASE и FILTER",
          "rollup": "ROLLUP и GROUPING SETS", "nulls": "NULL внутри агрегатов"}


def build(m):
    m.use_data("shop")
    m.versions = "Код проверен на PostgreSQL 16.15, SQLite 3.53 и DuckDB 2.0; скрипты — на Python 3.13."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="shop")     # подключение песочницы

    keys = ["channels", "conditional", "rollup", "nulls"]
    text = ("-- Запросы страницы 3.3 «Агрегаты и группировка» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.\n"
            "-- Запуск из корня папки материалов: psql -d shop -P null=NULL -f da-3-3-aggregates/queries.sql\n")
    for k in keys:
        text += f"\n-- ===== {TITLES[k]} =====\n" + m.page_code(k)
    m.put("queries.sql", text)
    m.run(["psql", "-P", "null=NULL", "-f", "queries.sql"], expect="\n\n".join(m.page_out(k).strip("\n") for k in keys),
          code=None, merge=True, what="psql -f queries.sql")

    m.script("dialects.py", "dialects")

    # Выборка интерактива «Среднее от средних»: оплаченные заказы клиентов с известной страной
    import psycopg
    with psycopg.connect("host=/tmp dbname=shop user=postgres") as con:
        rows = con.execute("""
            SELECT c.country_code, o.order_id, o.amount, (NULLIF(o.promo_code, '') IS NOT NULL) AS has_promo
            FROM orders AS o JOIN customers AS c USING (customer_id)
            WHERE o.status = 'paid' AND c.country_code IS NOT NULL
            ORDER BY c.country_code, o.order_id""").fetchall()
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(["country_code", "order_id", "amount", "has_promo"])
    for cc, oid, amount, promo in rows:
        w.writerow([cc, oid, amount, "да" if promo else "нет"])
    m.put("avg_of_avgs.csv", buf.getvalue())
    by = {}
    for cc, _oid, amount, promo in rows:
        by.setdefault(cc, []).append((amount, promo))
    overall = sum(a for v in by.values() for a, _ in v) / len(rows)
    of_means = sum(sum(a for a, _ in v) / len(v) for v in by.values()) / len(by)
    m.check("avg_of_avgs.csv: 184 заказа четырёх стран; общее среднее 4 671,20 ₽, среднее средних 4 808,70 ₽",
            len(rows) == 184 and len(by) == 4 and round(overall, 2) == 4671.20 and round(of_means, 2) == 4808.70,
            f"{len(rows)} {overall:.2f} {of_means:.2f}")
    kz = by["KZ"]
    no, yes = [a for a, p in kz if not p], [a for a, p in kz if p]
    m.check("Казахстан в выборке: 18 заказов без промокода по 5 458,33 ₽ и 4 с промокодом по 7 312,50 ₽",
            (len(no), len(yes)) == (18, 4) and round(sum(no) / 18, 2) == 5458.33 and round(sum(yes) / 4, 2) == 7312.50)
