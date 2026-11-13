import numpy as np, pandas as pd
from statsmodels.stats.weightstats import DescrStatsW

users = pd.read_csv("data/inference/users.csv")
spend = users["spend"].to_numpy()
rng = np.random.default_rng(64)
answered = rng.random(len(users)) < users["p_answer"].to_numpy()   # одна волна опроса

# активность известна по логам у всех: и у ответивших, и у молчавших
group = pd.cut(users["active_days"], [-1, 0, 3, 10, 30, 90], labels=["0", "1–3", "4–10", "11–30", "31+"])
share_all = group.value_counts(normalize=True, sort=False)
share_ans = group[answered].value_counts(normalize=True, sort=False)
print(pd.DataFrame({"в совокупности": share_all, "среди ответивших": share_ans}).rename_axis("дней с заходами").round(3).to_string())

w = (share_all / share_ans)[group[answered]].to_numpy()          # вес = доля в совокупности / доля в ответах
mu, raw = spend.mean(), spend[answered].mean()
weighted = DescrStatsW(spend[answered], weights=w).mean
print(f"\nответили {answered.sum()} из {len(users)}")
print(f"без весов           {raw:6.0f} ₽  ({raw / mu - 1:+.1%})")
print(f"с весами по группам {weighted:6.0f} ₽  ({weighted / mu - 1:+.1%})")
print(f"истинное μ          {mu:6.0f} ₽")
