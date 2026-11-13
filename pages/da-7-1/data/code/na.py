import pandas as pd

df = pd.read_csv("data/eda/clients_export.csv")
raw = pd.read_csv("data/eda/clients_export.csv", dtype=str, keep_default_na=False)  # файл как текст, без списка пропусков
print("country: «N/A» в файле", (raw["country"] == "N/A").sum(), "→ NaN в pandas", df["country"].isna().sum())
print("channel: «-» в файле", (raw["channel"] == "-").sum(), "→ NaN в pandas", df["channel"].isna().sum())
print("orders_q1 = -1:", (df["orders_q1"] == -1).sum(), "  age = 99:", (df["age"] == 99).sum())

print(f"среднее orders_q1 {df['orders_q1'].mean():.3f}, без -1 {df['orders_q1'].replace(-1, None).mean():.3f}")
print(f"средний возраст {df['age'].mean():.1f}, без 99 {df['age'].replace(99, None).mean():.1f}")

fixed = pd.read_csv("data/eda/clients_export.csv", na_values={"channel": ["-"], "orders_q1": [-1], "age": [99]})
print(fixed[["channel", "orders_q1", "age"]].isna().sum().to_dict())
