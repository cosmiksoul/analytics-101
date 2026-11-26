import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

raw = pd.read_csv("data/eda/clients_export.csv")
df = (raw.dropna(subset=["client_id"])                 # чистка из 7.1
         .drop_duplicates("client_id")                 # оставляем первую запись о каждом клиенте, как в уроке 7.1
         .query("orders_q1 >= 0 and channel != '-' and spend_q1 < 1e6")
         .assign(age=lambda d: d["age"].where(d["age"] != 99),
                 check=lambda d: (d["spend_q1"] / d["orders_q1"]).where(d["orders_q1"] > 0)))
df.to_parquet("clients_clean.parquet")                  # следующие блоки читают отсюда
print("Строк после очистки:", len(df))

# нижний треугольник матрицы парных графиков, цвет — канал
g = sns.pairplot(df.sample(2_000, random_state=703), vars=["visits_q1", "orders_q1", "age"],
                 hue="channel", corner=True, plot_kws={"s": 8, "alpha": 0.4})
g.savefig("pairplot.svg")

cols = ["visits_q1", "orders_q1", "age", "check", "tier"]
print(df[cols].count().to_dict())                       # число непустых значений в каждом столбце
pear = df[cols].corr().round(2)                         # tier здесь просто число 1–5
spear = df[cols].corr(method="spearman").round(2)
print(pear, spear, sep="\n")

plt.figure(figsize=(5, 4))
sns.heatmap(pear, annot=True, fmt=".2f", vmin=-1, vmax=1, cmap="vlag").figure.savefig("corr.svg")
