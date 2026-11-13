import pandas as pd

df = pd.read_csv("data/eda/clients_export.csv")
print("полных дублей строк:", df.duplicated().sum())
print("duplicated() по client_id:", df["client_id"].duplicated().sum())        # NaN тоже «совпадают» друг с другом
key = df.dropna(subset=["client_id"])
print("повторов среди непустых id:", key["client_id"].duplicated().sum())

pairs = key[key["client_id"].duplicated(keep=False)].sort_values("client_id")
differ = pairs.groupby("client_id").nunique().gt(1).sum()
print("в скольких парах различается столбец:", differ[differ > 0].to_dict())
print(pairs[["client_id", "tier", "visits_q1", "orders_q1"]].head(4).to_string(index=False))
