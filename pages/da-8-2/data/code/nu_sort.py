# Нюанс 2: столбцы сортируют по значению, а не по алфавиту
import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5,
                     "axes.spines.top": False, "axes.spines.right": False})
df = pd.read_csv("data/viz/sales_monthly.csv")
s = df[df["month"].str.startswith("2025")].groupby("channel")["revenue"].sum().div(1e6)

fig, (a, b) = plt.subplots(1, 2, figsize=(6.4, 2.3), layout="constrained")
abc = s.sort_index(ascending=False)                    # barh располагает категории снизу вверх
a.barh(abc.index, abc.values, color="#9aa3b2")
a.set_title("Каналы по алфавиту", loc="left", fontsize=8.5)
val = s.sort_values()
b.barh(val.index, val.values, color="#0d7468")
b.set_title("Каналы по убыванию выручки", loc="left", fontsize=8.5)
for ax in (a, b):
    ax.set_xlabel("выручка за 2025 год, млн ₽")
fig.savefig("nu_sort.svg")
print("по алфавиту:", list(abc.index[::-1]))
print("по убыванию:", list(val.index[::-1]))
