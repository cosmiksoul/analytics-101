import pandas as pd

df = pd.read_csv("data/eda/clients_export.csv")
d = df[df["spend_q1"] < 1_000_000]                   # пять ошибок ×1000 уже нашли


def iqr_out(x):                                      # флаг по одной переменной
    q1, q3 = x.quantile([0.25, 0.75])
    return (x < q1 - 1.5 * (q3 - q1)) | (x > q3 + 1.5 * (q3 - q1))


odd = d[(d["orders_q1"] == 0) & (d["spend_q1"] > 0)]  # траты без единого заказа
print(odd[["client_id", "visits_q1", "orders_q1", "spend_q1"]].to_string(index=False))
print("флаг по spend_q1:", iqr_out(d["spend_q1"])[odd.index].any(),
      "| по orders_q1:", iqr_out(d["orders_q1"])[odd.index].any())
print("заказы есть, трат нет:", ((d["orders_q1"] > 0) & (d["spend_q1"] == 0)).sum())

per = d["spend_q1"] / d["orders_q1"].where(d["orders_q1"] > 0)  # траты на один заказ
print(f"на заказ: медиана {per.median():,.0f} ₽, дороже 20 000 ₽ — {(per > 20_000).sum()} клиента")
