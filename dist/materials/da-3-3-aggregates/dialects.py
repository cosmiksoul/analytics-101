import sqlite3, duckdb, psycopg

engines = {
    "PostgreSQL": psycopg.connect("host=/tmp dbname=shop user=postgres"),
    "SQLite": sqlite3.connect("data/shop/shop.sqlite"),
    "DuckDB": duckdb.connect("data/shop/shop.duckdb", read_only=True),
}

def run(title, sql):
    print("---", title)
    for name, con in engines.items():
        try:
            rows = con.execute(sql).fetchall()
            if len(rows) == 1:
                res = rows[0][0]
            else:
                res = " · ".join(f"{r[0]} {r[1]}" for r in rows)
        except Exception as e:
            res = f"{type(e).__name__}: {str(e).splitlines()[0]}"
            if name == "PostgreSQL":
                con.rollback()      # после ошибки PostgreSQL ждёт отката
        print(f"{name:<11} {res}")

run("SUM(amount) / COUNT(*)",
    "SELECT SUM(amount) / COUNT(*) FROM orders WHERE status = 'paid'")
run("channel вне GROUP BY",
    "SELECT brand, channel, COUNT(*) FROM orders WHERE status = 'paid' "
    "GROUP BY brand ORDER BY brand")
run("то же, но в SELECT есть MAX(amount)",
    "SELECT brand, channel, MAX(amount) FROM orders WHERE status = 'paid' "
    "GROUP BY brand ORDER BY brand")
