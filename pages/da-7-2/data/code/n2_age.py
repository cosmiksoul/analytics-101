import pandas as pd

df = pd.read_csv("data/eda/clients_export.csv")
age = df["age"]
vc = age.value_counts().sort_index()
print(vc.iloc[[0, 1, 2, -3, -2, -1]].to_string())   # края: 18, 19, 20 … 74, 75, 99
print(f"среднее {age.mean():.1f}, без 99 — {age[age != 99].mean():.1f}")

df["age_missing"] = age == 99              # 99 — код «не указан», то есть пропуск
df["age"] = age.mask(df["age_missing"])    # 99 → NaN, строка и другие столбцы остаются
print("пропусков:", df["age"].isna().sum(), "| медиана:", df["age"].median())
