import pandas as pd

df = pd.read_parquet("clients_clean.parquet")            # таблица из первого примера
seg = df.groupby("channel")["check"]
print(seg.describe().round(0).sort_values("50%"))
print((seg.median() / df["check"].median() - 1).mul(100).round(1))   # отклонение медианы сегмента от общей медианы, %

# порядок каналов внутри каждого уровня лояльности
tab = df.pivot_table(index="tier", columns="channel", values="check", aggfunc="median")
print(tab[["реклама", "органика", "рассылка"]].round(0))
