"""Генератор учебных данных страницы 2.3: 200 заказов интернет-магазина, январь–март 2026.

Запуск: python gen_data.py
Пишет в папку data/ рядом с собой:
  orders_true.csv — «правда»: 200 заказов без порчи, по ним считает интерактив «Цена пропуска»;
  orders_raw.csv  — выгрузка на 207 строк с пропусками, дубликатами, ошибкой ввода и грязными
                    названиями брендов: с ней работает раздел «Код».
Зёрна зафиксированы: 23 — для самих заказов, 230 — для порчи. Файлы получаются одинаковыми.
Грязь подобрана под страницу: заказы 1041–1051 — фрагмент из анимации, сумма заказа 1046
умножена на тысячу, у 1047 есть полная копия.
"""
from pathlib import Path

import numpy as np
import pandas as pd

Path("data").mkdir(exist_ok=True)

# ---------- 1. «Правда»: 200 чистых заказов ----------
rng = np.random.default_rng(23)
N = 200
ids = np.arange(1001, 1001 + N)
days = np.sort(rng.integers(0, 90, N))
date = pd.Timestamp("2026-01-01") + pd.to_timedelta(days, unit="D")
brand = rng.choice(["Сова", "Кедр", "Луч", "Бриз"], N, p=[.3, .27, .23, .2])
country = rng.choice(["BY", "RU", "KZ", "UZ"], N, p=[.36, .34, .2, .1])
channel = rng.choice(["органика", "реклама", "рассылка"], N, p=[.45, .35, .2])
items = rng.choice([1, 2, 3, 4, 5], N, p=[.36, .27, .18, .12, .07])
price = np.exp(rng.normal(np.log(1500), .42, N))
amount = (np.round(items * price / 10) * 10).astype(int)
status = rng.choice(["paid", "cancelled"], N, p=[.88, .12])
mins = rng.integers(8 * 60, 23 * 60, N)
updated = date + pd.to_timedelta(mins, unit="m")
clean = pd.DataFrame({"order_id": ids, "date": date, "brand": brand, "country": country, "channel": channel,
                      "items": items, "amount": amount, "status": status, "updated_at": updated})

true = clean.copy()
true["date"] = true["date"].dt.strftime("%Y-%m-%d")
true["updated_at"] = true["updated_at"].dt.strftime("%Y-%m-%d %H:%M")
true.to_csv("data/orders_true.csv", index=False, lineterminator="\n")

# ---------- 2. Выгрузка: портим копию по фиксированному зерну ----------
rng = np.random.default_rng(230)
raw = clean.copy()
raw["amount"] = raw["amount"].astype("float64")
raw["date"] = raw["date"].dt.strftime("%Y-%m-%d")
raw["updated_at"] = raw["updated_at"].dt.strftime("%Y-%m-%d %H:%M")
idx = lambda oid: raw.index[raw.order_id == oid][0]
scene = set(range(1041, 1052))
pool = [i for i in raw.index if raw.at[i, "order_id"] not in scene]

# пропуски в сумме: два в сцене + 10 по выгрузке
for oid in (1042, 1048): raw.at[idx(oid), "amount"] = np.nan
for i in rng.choice(pool, 10, replace=False): raw.at[i, "amount"] = np.nan
# бренд: один пропуск в сцене + 4 по выгрузке
raw.at[idx(1045), "brand"] = np.nan
for i in rng.choice(pool, 4, replace=False): raw.at[i, "brand"] = np.nan
# дата: одна пустая в сцене + 2 по выгрузке
raw.at[idx(1044), "date"] = np.nan
for i in rng.choice(pool, 2, replace=False): raw.at[i, "date"] = np.nan
# канал не дошёл из трекинга у 26 заказов
for i in rng.choice(pool, 26, replace=False): raw.at[i, "channel"] = np.nan
# сумма в тысячу раз больше: ошибка ввода
raw.at[idx(1046), "amount"] = raw.at[idx(1046), "amount"] * 1000
# грязное написание брендов у 40% строк вне сцены
VAR = [lambda b: b.lower(), lambda b: b.upper(), lambda b: " " + b, lambda b: b + " ",
       lambda b: b + ".", lambda b: f"«{b}»", lambda b: b.lower() + "  ", lambda b: b + "!"]
for i in rng.choice(pool, int(len(pool) * .4), replace=False):
    if isinstance(raw.at[i, "brand"], str):
        raw.at[i, "brand"] = VAR[rng.integers(len(VAR))](raw.at[i, "brand"])
# полные дубликаты: повторная загрузка тех же строк
rows = []
full = [1047, 1113, 1178]
upd = {1022: 2, 1089: 1, 1135: 3, 1160: 1}     # заказ → через сколько дней отменён
for i, r in raw.iterrows():
    rows.append(r)
    if r.order_id in full: rows.append(r.copy())
out = pd.DataFrame(rows).reset_index(drop=True)
# ключевые дубликаты: обновления статуса дописаны в конец второй выгрузкой
tail = []
for oid, dd in upd.items():
    r = out[out.order_id == oid].iloc[0].copy()
    out.loc[out.order_id == oid, "status"] = "paid"
    r["status"] = "cancelled"
    r["updated_at"] = (pd.Timestamp(r["updated_at"]) + pd.Timedelta(days=dd, hours=2, minutes=17)).strftime("%Y-%m-%d %H:%M")
    tail.append(r)
out = pd.concat([out, pd.DataFrame(tail)], ignore_index=True)
out["amount"] = out["amount"].map(lambda v: "" if pd.isna(v) else str(int(v)))
out.to_csv("data/orders_raw.csv", index=False, lineterminator="\n")

print("orders_true.csv:", len(true), "строк | orders_raw.csv:", len(out), "строк")
