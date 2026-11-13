import sqlite3, duckdb

lite = sqlite3.connect("data/shop/shop.sqlite")                  # SQLite 3.53.1: даты — строки
duck = duckdb.connect("data/shop/shop.duckdb", read_only=True)   # DuckDB 2.0.0: TIMESTAMP

try:
    lite.execute("SELECT DATE_TRUNC('week', created_at) FROM orders")
except sqlite3.OperationalError as e:
    print("SQLite:", e)

# Замена в SQLite: отступить на 6 дней и дойти до ближайшего понедельника
lite_week = """
SELECT date(created_at, '-6 days', 'weekday 1') AS week,
       strftime('%W', created_at) AS w, COUNT(*) AS n
FROM orders WHERE status = 'paid'
GROUP BY 1 ORDER BY 1 LIMIT 3"""
duck_week = """
SELECT DATE_TRUNC('week', created_at)::DATE AS week, COUNT(*) AS n
FROM orders WHERE status = 'paid'
GROUP BY 1 ORDER BY 1 LIMIT 3"""
print("SQLite:", lite.execute(lite_week).fetchall())
print("DuckDB:", duck.sql(duck_week).fetchall())

# Строка против метки времени: заказ 1008 создан 2026-02-12 00:00:00
q = "SELECT COUNT(*) FROM orders WHERE created_at = '2026-02-12'"
print("created_at = '2026-02-12':",
      "SQLite", lite.execute(q).fetchall()[0][0],     # сравнение строк
      "| DuckDB", duck.sql(q).fetchall()[0][0])       # строка → TIMESTAMP
