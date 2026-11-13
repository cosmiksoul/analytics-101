import os

import pandas as pd

from load_api import read_app
from load_csv import read_crm
from load_db import read_site

parts = {"crm": read_crm(), "site": read_site(), "app": read_app(verbose=False)}
orders = pd.concat([df.assign(source=name) for name, df in parts.items()], ignore_index=True)
print(orders.shape, orders["source"].value_counts(sort=False).to_dict())
print(orders.dtypes.to_string())

orders.to_parquet("data/orders_q1.parquet", index=False)   # движок pyarrow
orders.to_csv("data/orders_q1.csv", index=False)

pq = pd.read_parquet("data/orders_q1.parquet")
csv = pd.read_csv("data/orders_q1.csv")
print("parquet:", pq["date"].dtype, "| совпадает с исходной:", pq.equals(orders))
print("csv:    ", csv["date"].dtype, "| совпадает с исходной:", csv.equals(orders))
print("байт: parquet", os.path.getsize("data/orders_q1.parquet"), "| csv", os.path.getsize("data/orders_q1.csv"))
