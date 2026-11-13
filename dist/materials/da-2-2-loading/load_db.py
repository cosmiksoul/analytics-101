import pandas as pd
from sqlalchemy import create_engine, text

# В работе здесь PostgreSQL, а адрес с паролем лежат в переменной окружения:
# engine = create_engine(os.environ["SHOP_DB_URL"])   # postgresql+psycopg://…/shop
engine = create_engine("sqlite:///data/shop.db")       # учебная замена: SQLite

QUERY = text("""
    SELECT order_id, order_date AS date, brand, country, channel, amount, status
    FROM orders
    WHERE order_date >= :start AND order_date < :end
    ORDER BY order_id
""")


def read_site(start="2026-01-01", end="2026-04-01"):
    return pd.read_sql(QUERY, engine, params={"start": start, "end": end},
                       parse_dates={"date": "%Y-%m-%d"}, dtype={"amount": "float64"})


if __name__ == "__main__":
    site = read_site()
    print(len(site), "строк:", site["date"].min().date(), "—", site["date"].max().date())
    print(site.dtypes.to_string())

    end = "2026-04-01' OR '1'='1"             # такое значение пришло из формы
    sql = f"SELECT count(*) AS n FROM orders WHERE order_date >= '2026-01-01' AND order_date < '{end}'"
    print("f-строка:", pd.read_sql(text(sql), engine)["n"].iloc[0], "строк")
    print("параметры:", len(read_site(end=end)), "строк")
