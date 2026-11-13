import pandas as pd
from scipy.stats import chisquare

ex = pd.read_csv("data/ab/exposures.csv")
users = pd.read_csv("data/ab/users.csv", dtype={"app_version": str}, keep_default_na=False)

# план — 50/50, поэтому ожидание по умолчанию: поровну
for exp, g in ex.groupby("experiment"):
    n = g.group.value_counts().sort_index()
    print(f"{exp:<12} A {n['A']:>6}  B {n['B']:>6}  доля B {n['B'] / n.sum():.2%}  p = {chisquare(n).pvalue:.2g}")

# где сидит перекос в reco_block: та же проверка по платформе и версии приложения
reco = ex[ex.experiment == "reco_block"].merge(users, on="user_id")
print()
for seg, g in reco.groupby(reco.platform + " " + reco.app_version):
    n = g.group.value_counts().sort_index()
    print(f"{seg:<14} A {n['A']:>5}  B {n['B']:>5}  доля B {n['B'] / n.sum():.1%}  p = {chisquare(n).pvalue:.2g}")
