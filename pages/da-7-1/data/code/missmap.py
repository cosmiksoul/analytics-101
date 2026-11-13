import matplotlib
import numpy as np
import pandas as pd

matplotlib.use("Agg")                                     # рисуем в файл, без окна
import matplotlib.pyplot as plt

df = pd.read_csv("data/eda/clients_export.csv", na_values={"channel": ["-"]})  # «-» — тоже пропуск
df["age"] = df["age"].mask(df["age"] == 99)                              # 99 — «не указан»
df["orders_q1"] = df["orders_q1"].mask(df["orders_q1"] == -1)            # −1 — «неизвестно»
df = df.sort_values("orders_q1", na_position="first", kind="stable")     # сверху неизвестные заказы, за ними нули

miss = df.isna()
bands = miss.groupby(np.arange(len(df)) // 301).mean()   # 40 полос по 301 строке: доля пропусков в полосе
bands.to_csv("missing_map.csv", index=False)
print("пропусков по столбцам:", miss.sum()[miss.sum() > 0].to_dict())
print((bands * 100).round().astype(int).iloc[[0, 1, 5, 6, 20, 39]].to_string())

fig, ax = plt.subplots(figsize=(6, 4))
ax.imshow(bands, aspect="auto", cmap="Greys", vmin=0, vmax=1)
ax.set_xticks(range(len(df.columns)), df.columns, rotation=60, ha="right")
ax.set_ylabel("полосы по 301 строке, по возрастанию orders_q1")
fig.savefig("missing_map.svg", bbox_inches="tight")
