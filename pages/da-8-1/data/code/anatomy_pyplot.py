import matplotlib.pyplot as plt
import pandas as pd

sales = pd.read_csv("data/viz/sales_monthly.csv")
sales["year"] = sales["month"].str[:4]            # "2024-03" → "2024"
sales["m"] = sales["month"].str[5:].astype(int)   # "2024-03" → 3
t = sales.pivot_table(index="m", columns="year",
                      values="revenue", aggfunc="sum") / 1e6   # млн ₽
MONTHS = "янв фев мар апр май июн июл авг сен окт ноя дек".split()

plt.figure(figsize=(8, 4.5))
plt.plot(t.index, t["2024"], label="2024")
plt.plot(t.index, t["2025"], label="2025")
plt.xticks(t.index, MONTHS)
plt.ylim(0, 45)
plt.grid(axis="y")
plt.title("2025-й выше 2024-го в каждом месяце")
plt.ylabel("выручка, млн ₽")
plt.legend()
plt.savefig("anatomy_pyplot.png")
