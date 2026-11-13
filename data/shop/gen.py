"""Учебная база интернет-магазина для темы 03 «SQL для анализа».

Генерирует shop.sql (схема + данные, переносимый SQL) и собирает из него
shop.sqlite и shop.duckdb. Зерно зафиксировано: random.Random(303), файлы получаются одинаковыми.

Запуск: python gen.py              — три файла рядом со скриптом
        python gen.py --postgres   — ещё и база shop в PostgreSQL: её пересоздаёт psql
                                     с вашими настройками подключения (PGHOST, PGUSER и т. д.)
Нужен пакет duckdb.
"""
import random, datetime as dt, sqlite3, subprocess, pathlib, sys

R = random.Random(303)
HERE = pathlib.Path(__file__).parent

countries = [("BY", "Беларусь", "BYN"), ("RU", "Россия", "RUB"), ("KZ", "Казахстан", "KZT"),
             ("UZ", "Узбекистан", "UZS"), ("AM", "Армения", "AMD")]   # AM: клиентов нет

brands = ["Сова", "Кедр", "Луч", "Бриз"]
cats = {"свет": [("Лампа настольная", 2900), ("Гирлянда", 1400)],
        "текстиль": [("Плед", 3600), ("Наволочка", 900)],
        "посуда": [("Кружка", 650), ("Чайник", 2400)],
        "декор": [("Ваза", 1800), ("Свеча", 450)]}
products, pid = [], 1
for b in brands:
    for c, items in cats.items():
        for name, base in items:
            price = int(round(base * R.uniform(0.85, 1.25), -1))
            products.append((pid, f"{name} «{b}»", c, b, price)); pid += 1

first = ["Анна", "Борис", "Вера", "Глеб", "Дина", "Егор", "Жанна", "Захар", "Ирина", "Кирилл",
         "Лена", "Максим", "Нина", "Олег", "Полина", "Роман", "Света", "Тимур", "Ульяна", "Фёдор"]
last = ["А.", "Б.", "В.", "К.", "М.", "С."]
names = R.sample([f"{f} {l}" for f in first for l in last], 60)
channels = ["органика", "реклама", "рассылка"]
cw = [0.45, 0.35, 0.20]
ctry_w = [("BY", .34), ("RU", .30), ("KZ", .20), ("UZ", .16)]

def pick(pairs):
    x, acc = R.random(), 0
    for v, w in pairs:
        acc += w
        if x < acc: return v
    return pairs[-1][0]

customers = []
for i in range(60):
    cid = 101 + i
    signup = dt.date(2025, 12, 1) + dt.timedelta(days=int(i * 105 / 60 + R.randint(0, 2)))
    country = pick(ctry_w)
    if cid in (117, 142): country = None            # страна не указана
    ref = None
    if i > 5 and R.random() < 0.25: ref = R.choice([c[0] for c in customers])
    customers.append([cid, names[i], country, signup, R.choices(channels, cw)[0], ref])

no_orders = set(R.sample([c[0] for c in customers[10:]], 8))   # 8 клиентов без заказов
end = dt.date(2026, 3, 31)

orders, items, log, oid = [], [], [], 1001
for c in customers:
    cid, _, _, signup, chan, _ = c
    if cid in no_orders: continue
    start = max(signup, dt.date(2026, 1, 1))
    n = max(1, min(int(R.expovariate(1 / 5.0)) + 1, 14))
    days = sorted(R.randint(0, max(0, (end - start).days)) for _ in range(n))
    fav = R.choice(brands)
    for d in days:
        day = start + dt.timedelta(days=d)
        created = dt.datetime.combine(day, dt.time(R.randint(8, 23), R.randint(0, 59), R.randint(0, 59)))
        brand = fav if R.random() < 0.7 else R.choice(brands)
        bp = [p for p in products if p[3] == brand]
        k = R.choices([1, 2, 3], [0.55, 0.3, 0.15])[0]
        amount = 0
        for p in R.sample(bp, k):
            q = R.choices([1, 2, 3], [0.7, 0.2, 0.1])[0]
            items.append((oid, p[0], q, p[4])); amount += q * p[4]
        status = "cancelled" if R.random() < 0.14 else "paid"
        rating = None if status == "cancelled" or R.random() < 0.45 else R.choices([5, 4, 3, 2, 1], [.45, .3, .13, .07, .05])[0]
        promo = None
        x = R.random()
        if x < 0.18: promo = "ЗИМА10" if day.month < 3 else "ВЕСНА15"
        elif x < 0.21: promo = ""                      # пустая строка — не то же, что NULL
        och = chan if R.random() < 0.6 else R.choices(channels, cw)[0]
        orders.append([oid, cid, created, day, brand, och, amount, status, promo, rating])
        t = created
        log.append((oid, "created", t))
        if status == "paid" or R.random() < 0.5:
            t = t + dt.timedelta(minutes=R.randint(1, 40)); log.append((oid, "paid", t))
        if status == "cancelled":
            t = t + dt.timedelta(hours=R.randint(1, 72)); log.append((oid, "cancelled", t))
        oid += 1

# ровно в полночь — для примера «дата против метки времени»
orders[7][2] = dt.datetime.combine(orders[7][3], dt.time(0, 0, 0))

def lit(v):
    if v is None: return "NULL"
    if isinstance(v, (int,)): return str(v)
    if isinstance(v, dt.datetime): return f"'{v:%Y-%m-%d %H:%M:%S}'"
    if isinstance(v, dt.date): return f"'{v:%Y-%m-%d}'"
    return "'" + str(v).replace("'", "''") + "'"

def ins(table, rows):
    out = []
    for i in range(0, len(rows), 50):
        chunk = rows[i:i + 50]
        out.append(f"INSERT INTO {table} VALUES\n" + ",\n".join("(" + ", ".join(lit(v) for v in r) + ")" for r in chunk) + ";")
    return "\n".join(out)

schema = """-- Учебная база интернет-магазина (тема 03). Данные сгенерированы, seed 303.
DROP TABLE IF EXISTS order_status_log;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS countries;
CREATE TABLE countries (country_code TEXT PRIMARY KEY, country_name TEXT NOT NULL, currency TEXT NOT NULL);
CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL, country_code TEXT,
  signup_date DATE NOT NULL, channel TEXT NOT NULL, referrer_id INTEGER);
CREATE TABLE products (product_id INTEGER PRIMARY KEY, product_name TEXT NOT NULL, category TEXT NOT NULL,
  brand TEXT NOT NULL, price INTEGER NOT NULL);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, created_at TIMESTAMP NOT NULL,
  order_date DATE NOT NULL, brand TEXT NOT NULL, channel TEXT NOT NULL, amount INTEGER NOT NULL,
  status TEXT NOT NULL, promo_code TEXT, rating INTEGER);
CREATE TABLE order_items (order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, qty INTEGER NOT NULL,
  price INTEGER NOT NULL, PRIMARY KEY (order_id, product_id));
CREATE TABLE order_status_log (order_id INTEGER NOT NULL, status TEXT NOT NULL, changed_at TIMESTAMP NOT NULL);
"""
sql = "\n".join([schema, ins("countries", countries), ins("customers", customers), ins("products", products),
                 ins("orders", orders), ins("order_items", items), ins("order_status_log", log)]) + "\n"
(HERE / "shop.sql").write_text(sql, encoding="utf-8")

# PostgreSQL — только по ключу --postgres
if "--postgres" in sys.argv:
    subprocess.run(["psql", "-d", "postgres", "-q", "-c", "DROP DATABASE IF EXISTS shop", "-c", "CREATE DATABASE shop"], check=True)
    subprocess.run(["psql", "-d", "shop", "-q", "-v", "ON_ERROR_STOP=1", "-f", str(HERE / "shop.sql")], check=True)
# SQLite
db = HERE / "shop.sqlite"; db.unlink(missing_ok=True)
con = sqlite3.connect(db); con.executescript(sql); con.commit(); con.close()
# DuckDB
import duckdb
ddb = HERE / "shop.duckdb"; ddb.unlink(missing_ok=True)
d = duckdb.connect(str(ddb)); d.execute(sql); d.close()

print(f"countries {len(countries)}, customers {len(customers)} (без заказов {len(no_orders)}), "
      f"products {len(products)}, orders {len(orders)}, order_items {len(items)}, status_log {len(log)}")
