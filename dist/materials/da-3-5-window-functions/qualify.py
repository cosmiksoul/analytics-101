import duckdb, psycopg

q = """
SELECT order_id, status, changed_at
FROM order_status_log
QUALIFY ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY changed_at DESC) = 1
ORDER BY order_id
LIMIT 4
"""
print(duckdb.connect("data/shop/shop.duckdb", read_only=True).sql(q))   # DuckDB: QUALIFY есть

with psycopg.connect("host=/tmp dbname=shop user=postgres") as con:
    try:
        con.execute(q)
    except psycopg.errors.SyntaxError as e:                    # PostgreSQL: такого слова нет
        print("PostgreSQL:", e)
