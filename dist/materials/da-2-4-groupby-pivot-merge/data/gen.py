"""Учебная выгрузка заказов для страницы 2.4 (тема 02 «Pandas и подготовка данных»).

Данные учебные, сгенерированы random.Random(SEED). Столбцы темы 02:
order_id, date, brand, country, channel, amount, status — и customer_id для когорт.
Запуск: python3 gen.py  → orders.csv, countries.csv, managers.csv рядом со скриптом.
"""
import random
import sys
from pathlib import Path

import pandas as pd

BRANDS = ["Сова", "Кедр", "Луч", "Бриз"]
COUNTRIES = ["BY", "RU", "KZ", "UZ"]
CW = [0.25, 0.4, 0.2, 0.15]
CHANNELS = ["органика", "реклама", "рассылка"]
N_ORDERS = 32
PICK = [("BY", "органика"), ("RU", "реклама"), ("RU", "органика"), ("RU", "рассылка"), ("KZ", "реклама"), ("UZ", "органика")]


def make(seed):
    rng = random.Random(seed)
    days = sorted(rng.randrange(0, 90) for _ in range(N_ORDERS))   # 1 января — 31 марта 2026
    customers, rows = [], []
    for i, d in enumerate(days):
        p_new = 0.75 if d < 30 else 0.45 if d < 60 else 0.3
        if not customers or rng.random() < p_new:
            cid = f"c{len(customers) + 1:02d}"
            customers.append((cid, rng.choices(COUNTRIES, CW)[0]))
            cust = customers[-1]
            ch = rng.choices(CHANNELS, [0.5, 0.5, 0.0])[0]          # первый заказ не из рассылки
        else:
            cust = rng.choice(customers)
            ch = rng.choices(CHANNELS, [0.35, 0.35, 0.3])[0]
        amount = int(round(rng.lognormvariate(7.9, 0.45) / 10) * 10)
        status = "cancelled" if rng.random() < 0.15 else "paid"
        date = pd.Timestamp("2026-01-01") + pd.Timedelta(days=d)
        rows.append(dict(order_id=1001 + i, date=date.strftime("%Y-%m-%d"), customer_id=cust[0],
                         brand=rng.choice(BRANDS), country=cust[1], channel=ch, amount=amount, status=status))
    return pd.DataFrame(rows)


def ok(df):
    paid = df[df.status == "paid"]
    cells = paid.groupby([paid.country, paid.date.str[:7]]).size()
    combos = set(zip(paid.country, paid.channel))
    cohort_first = df.groupby("customer_id").date.min().str[:7]
    return (22 <= len(paid) <= 27 and len(cells) == 12 and all(p in combos for p in PICK)
            and cohort_first.nunique() == 3 and df.customer_id.nunique() <= 16
            and paid.amount.between(800, 9000).all())


if __name__ == "__main__":
    seed = next(s for s in range(1, 100000) if ok(make(s))) if "--search" in sys.argv else 186
    df = make(seed)
    assert ok(df), seed
    out = Path(__file__).parent
    df.to_csv(out / "orders.csv", index=False)
    pd.DataFrame({"country": ["BY", "RU", "KZ", "AM"],
                  "name": ["Беларусь", "Россия", "Казахстан", "Армения"],
                  "currency": ["BYN", "RUB", "KZT", "AMD"]}).to_csv(out / "countries.csv", index=False)
    pd.DataFrame({"country": ["BY", "RU", "RU", "KZ", "AM"],
                  "channel": ["органика", "реклама", "рассылка", "реклама", "реклама"],
                  "manager": ["Анна", "Борис", "Вера", "Глеб", "Дина"]}).to_csv(out / "managers.csv", index=False)
    print("seed", seed, "orders", len(df), "paid", (df.status == "paid").sum())
