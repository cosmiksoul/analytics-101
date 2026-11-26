# Нюанс 3: как сравнить выручку десяти каналов
import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5,
                     "axes.spines.top": False, "axes.spines.right": False})
df = pd.read_csv("data/viz/sales_monthly.csv")
wide = df.pivot_table(index="month", columns="channel", values="revenue", aggfunc="sum") / 1e6
top3 = wide.loc["2025-01":].sum().nlargest(3).index
grouped = wide[top3].assign(**{"остальные 7": wide.drop(columns=top3).sum(axis=1)})

fig, (a, b) = plt.subplots(1, 2, figsize=(6.4, 2.5), layout="constrained")
wide.plot(ax=a, legend=False, linewidth=1)            # десять цветов из палитры tab10
a.legend(fontsize=5.5, ncol=2, frameon=False, loc="upper left", bbox_to_anchor=(0, 1.02))
a.set_title("Десять каналов с общей легендой", loc="left", fontsize=8.5)
colors = ["#0d7468", "#2f6db5", "#d27a12", "#9aa3b2"]
for (name, col), c in zip(grouped.items(), colors):
    b.plot(range(24), col.values, color=c, linewidth=1.4)
    b.text(23.6, col.iloc[-1], name, color=c, va="center", fontsize=7)   # подпись у конца линии
b.set_xlim(0, 30)
b.set_title("Три крупнейших канала и остальные", loc="left", fontsize=8.5)
for ax in (a, b):
    ax.set_xticks([0, 12], ["2024-01", "2025-01"])
    ax.set_xlabel("")
    ax.set_ylim(0, None)
fig.savefig("nu_many.svg")
print("три крупнейших в 2025:", list(top3))
print("остальные 7 каналов в декабре 2025, млн ₽:", round(grouped["остальные 7"].iloc[-1], 1))
