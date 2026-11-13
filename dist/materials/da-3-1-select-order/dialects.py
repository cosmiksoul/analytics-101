import sqlite3
import duckdb      # 2.0.0
import psycopg     # 3.3.8

engines = {
    "PostgreSQL": psycopg.connect("host=/tmp dbname=shop user=postgres", autocommit=True),
    "SQLite": sqlite3.connect("data/shop/shop.sqlite"),
    "DuckDB": duckdb.connect("data/shop/shop.duckdb", read_only=True),
}
week = "order_date BETWEEN '2026-02-01' AND '2026-02-07'"
tests = {
    "NULL при DESC": f"SELECT order_id, rating FROM orders WHERE {week} "
                     "ORDER BY rating DESC, order_id LIMIT 3",
    "LIKE 'PAID'": "SELECT COUNT(*) FROM orders WHERE status LIKE 'PAID'",
    "LIKE 'лампа%'": "SELECT COUNT(*) FROM products WHERE product_name LIKE 'лампа%'",
    "lower() и кириллица": "SELECT COUNT(*) FROM products WHERE lower(product_name) LIKE 'лампа%'",
    "псевдоним в WHERE": "SELECT order_id, amount * 2 AS twice FROM orders WHERE twice > 36000",
    "FETCH FIRST": "SELECT order_id FROM orders ORDER BY order_id FETCH FIRST 2 ROWS ONLY",
    "TOP": "SELECT TOP 2 order_id FROM orders ORDER BY order_id",
    "псевдоним в HAVING": "SELECT brand, SUM(amount) AS revenue FROM orders "
                          "GROUP BY brand HAVING revenue > 300000 ORDER BY brand",
    "status в HAVING": "SELECT brand, COUNT(*) FROM orders "
                       "GROUP BY brand HAVING status = 'paid' ORDER BY brand",
}
for title, sql in tests.items():
    print(title)
    for name, con in engines.items():
        try:
            res = con.execute(sql).fetchall()
        except Exception as e:
            res = "ошибка: " + str(e).splitlines()[0][:58].rstrip()
        print(f"  {name:<11}{res}")
