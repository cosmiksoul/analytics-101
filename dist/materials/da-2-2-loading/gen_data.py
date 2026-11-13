"""Генератор учебных данных страницы 2.2: заказы интернет-магазина за I квартал 2026 в трёх источниках.

Запуск: python gen_data.py
Пишет в папку data/ рядом с собой:
  orders_crm.csv     — CRM: 8 заказов, cp1251, «;», десятичная запятая, даты дд.мм.гггг;
  crm_by_month.xlsx  — те же заказы CRM, по листу на месяц;
  shop.db            — база сайта: SQLite вместо PostgreSQL, 15 заказов, из них 3 — за декабрь 2025;
  app_orders.json    — заказы приложения для учебного сервера api_server.py: 10 штук.
Зерно генератора случайных чисел зафиксировано: random.Random(22), файлы получаются одинаковыми.
Данные подобраны под поломки, которые разбирает страница: в датах CRM день не больше 12,
иначе подмену дня и месяца было бы не видно.
Для книги Excel нужны pandas и openpyxl, для остального хватает стандартной библиотеки.
"""
import json, random, sqlite3, sys
from datetime import date, timedelta
from pathlib import Path

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else ".")   # куда положить папку data/
rng = random.Random(22)
BRANDS = ["Сова", "Кедр", "Луч", "Бриз"]
COUNTRIES = ["BY", "RU", "KZ", "UZ"]
CHANNELS = ["органика", "реклама", "рассылка"]

def order(d):
    return {"date": d, "brand": rng.choice(BRANDS), "country": rng.choice(COUNTRIES),
            "channel": rng.choice(CHANNELS), "amount": rng.randrange(30000, 1500000, 10) / 100,
            "status": "paid" if rng.random() < 0.85 else "cancelled"}

# CRM: 8 телефонных заказов, день месяца не больше 12 (так видна путаница день/месяц)
crm_days = sorted(date(2026, rng.randint(1, 3), rng.randint(1, 12)) for _ in range(8))
crm = [dict(order_id=5001 + i, **order(d)) for i, d in enumerate(crm_days)]
comments = {1: "позвонить; после 18:00", 5: "оставить у двери"}
lines = ["order_id;date;brand;country;channel;amount;status;comment"]
for i, o in enumerate(crm):
    amt = f"{o['amount']:.2f}".replace(".", ",")
    com = f"'{comments[i]}'" if i in comments else ""
    lines.append(f"{o['order_id']};{o['date']:%d.%m.%Y};{o['brand']};{o['country']};{o['channel']};{amt};{o['status']};{com}")
(OUT / "data").mkdir(parents=True, exist_ok=True)
(OUT / "data" / "orders_crm.csv").write_bytes(("\n".join(lines) + "\n").encode("cp1251"))

# База сайта: 3 заказа декабря 2025 и 12 заказов I квартала 2026
q1 = date(2026, 1, 1)
site_days = sorted([date(2025, 12, rng.randint(1, 31)) for _ in range(3)] + [q1 + timedelta(days=rng.randrange(90)) for _ in range(12)])
site = [dict(order_id=1001 + i, **order(d)) for i, d in enumerate(site_days)]
db = OUT / "data" / "shop.db"
db.unlink(missing_ok=True)
con = sqlite3.connect(db)
con.execute("CREATE TABLE orders (order_id INTEGER PRIMARY KEY, order_date TEXT, brand TEXT, country TEXT, channel TEXT, amount REAL, status TEXT)")
con.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)", [(o["order_id"], o["date"].isoformat(), o["brand"], o["country"], o["channel"], o["amount"], o["status"]) for o in site])
con.commit(); con.close()

# API приложения: 10 заказов I квартала, вложенный JSON
app_days = sorted(q1 + timedelta(days=rng.randrange(90)) for _ in range(10))
app = []
for i, d in enumerate(app_days):
    o = order(d)
    app.append({"id": 9001 + i, "created": d.isoformat(), "status": o["status"],
                "brand": {"id": BRANDS.index(o["brand"]) + 1, "name": o["brand"]},
                "customer": {"country": o["country"]}, "utm": {"channel": o["channel"]},
                "total": {"amount": o["amount"], "currency": "RUB"}})
(OUT / "data" / "app_orders.json").write_text(json.dumps(app, ensure_ascii=False, indent=1), encoding="utf-8")

# Книга Excel: читаем только что записанный файл CRM и раскладываем по листам
import pandas as pd

crm_df = pd.read_csv(OUT / "data" / "orders_crm.csv", encoding="cp1251", sep=";", quotechar="'", decimal=",",
                     usecols=["order_id", "date", "brand", "country", "channel", "amount", "status"],
                     parse_dates=["date"], date_format="%d.%m.%Y")
with pd.ExcelWriter(OUT / "data" / "crm_by_month.xlsx") as xw:
    for name, month in [("Январь", 1), ("Февраль", 2), ("Март", 3)]:
        crm_df[crm_df["date"].dt.month == month].to_excel(xw, sheet_name=name, index=False)

print("crm", len(crm), "site", len(site), "app", len(app))
