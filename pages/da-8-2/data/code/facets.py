import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5})

df = pd.read_csv("data/viz/sales_monthly.csv")
m = df.groupby(["month", "channel"], as_index=False)["revenue"].sum()
m["млн ₽"] = m["revenue"] / 1e6
order = m.groupby("channel")["revenue"].sum().sort_values(ascending=False).index

g = sns.FacetGrid(m, col="channel", col_order=order, col_wrap=5,
                  height=1.2, aspect=1.15, sharey=False)  # у каждой клетки своя шкала Y
g.map_dataframe(sns.lineplot, x="month", y="млн ₽", color="#0d7468")
g.set_titles("{col_name}")
g.set_axis_labels("", "")
g.set(xticks=["2024-01", "2025-01"], xticklabels=["2024", "2025"], ylim=(0, None))
g.figure.suptitle("Годовая выручка приложения выросла, а колл-центра снизилась "
                  "(у каждой панели своя шкала в млн ₽)", x=0.02, ha="left", fontsize=8.5)
g.figure.subplots_adjust(top=0.84)
g.savefig("facets.svg")

y = m.assign(year=m["month"].str[:4]).pivot_table(
    index="channel", columns="year", values="млн ₽", aggfunc="sum")
print((y["2025"] / y["2024"] - 1).mul(100).round(1).sort_values().to_string())
