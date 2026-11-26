import pandas as pd

df = pd.read_csv("data/eda/clients_export.csv")
d = df[df["spend_q1"] < 1_000_000]                   # исключаем пять миллионных сумм


def iqr_out(x):                                      # выход за границу по одному столбцу
    q1, q3 = x.quantile([0.25, 0.75])
    return (x < q1 - 1.5 * (q3 - q1)) | (x > q3 + 1.5 * (q3 - q1))


odd = d[(d["orders_q1"] == 0) & (d["spend_q1"] > 0)]  # траты без единого заказа
print(odd[["client_id", "visits_q1", "orders_q1", "spend_q1"]].to_string(index=False))
print("за границами IQR по spend_q1:", iqr_out(d["spend_q1"])[odd.index].any(),
      "| по orders_q1:", iqr_out(d["orders_q1"])[odd.index].any())
print("заказы есть, трат нет:", ((d["orders_q1"] > 0) & (d["spend_q1"] == 0)).sum())

per = d["spend_q1"] / d["orders_q1"].where(d["orders_q1"] > 0)  # траты на один заказ
print(f"Медиана трат на заказ: {per.median():,.0f} ₽. Число строк с тратами выше 20 000 ₽ на заказ: {(per > 20_000).sum()}")
