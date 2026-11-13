import pandas as pd

df = pd.read_csv("data/clients/clients.csv")   # 1 000 учебных клиентов

by_age = df.groupby("age", as_index=False)["income"].mean()           # 53 точки: средний доход по возрасту
by_dec = df.groupby(df["age"] // 10 * 10)[["age", "income"]].mean()   # 7 точек: по десятилетиям

print(f"по клиентам:       r = {df['age'].corr(df['income']):.2f}  ({len(df)} точек)")
print(f"по годам возраста: r = {by_age['age'].corr(by_age['income']):.2f}  ({len(by_age)} точки)")
print(f"по десятилетиям:   r = {by_dec['age'].corr(by_dec['income']):.2f}  ({len(by_dec)} точек)")
