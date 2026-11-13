import numpy as np
import pandas as pd

df = pd.read_csv("data/inference/discounts.csv")   # 120 учебных заказов со скидкой
print(df.head(3), end="\n\n")

def stats(g):
    slope = np.polyfit(g["discount"], g["check"], 1)[0]   # ₽ чека на 1 п. п. скидки
    return pd.Series({"заказов": len(g), "скидка": g["discount"].mean(), "чек": g["check"].mean(),
                      "r": g["discount"].corr(g["check"]), "наклон": slope})

table = df.groupby("category", sort=False).apply(stats, include_groups=False)
table.loc["все заказы"] = stats(df)
table = table.round({"скидка": 1, "чек": 0, "r": 2, "наклон": 0}).astype({"заказов": int, "чек": int, "наклон": int})
print(table)
