import matplotlib.pyplot as plt
import pandas as pd

sales = pd.read_csv("data/viz/sales_monthly.csv")
sales["year"] = sales["month"].str[:4]            # "2024-03" → "2024"
sales["m"] = sales["month"].str[5:].astype(int)   # "2024-03" → 3
t = sales.pivot_table(index="m", columns="year",
                      values="revenue", aggfunc="sum") / 1e6   # млн ₽
MONTHS = "янв фев мар апр май июн июл авг сен окт ноя дек".split()

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.plot(t.index, t["2024"], label="2024")
ax.plot(t.index, t["2025"], label="2025")
ax.set_xticks(t.index, MONTHS)
ax.set_ylim(0, 45)
ax.grid(axis="y")
ax.set_title("В 2025 году выручка каждый месяц выше, чем годом ранее")
ax.set_ylabel("Выручка, млн ₽")
ax.legend()
fig.savefig("anatomy.png")
