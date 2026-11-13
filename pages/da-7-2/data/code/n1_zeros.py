import numpy as np
import pandas as pd

df = pd.read_csv("data/eda/clients_export.csv")
s = df["spend_q1"]
zero = s == 0
print(f"нулей: {zero.sum()} из {len(s)} ({zero.mean():.1%})")
print("заказов у них:", df.loc[zero, "orders_q1"].value_counts().to_dict())
print("медиана: все", s.median(), "| купившие", s[~zero].median())

first = s.head(4).to_numpy()                  # 0, 0, 0 и 9 710 ₽
print(np.log10(first))
print(np.log1p(first).round(2))               # log(1 + x): ноль остаётся нулём
print(np.log1p(df["orders_q1"].to_numpy()).min())  # но −1 заказ из 7.1 даёт −inf
