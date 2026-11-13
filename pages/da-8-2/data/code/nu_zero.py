# Нюанс 1: столбец кодирует значение длиной, поэтому ось столбцов начинается с нуля
import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5,
                     "axes.spines.top": False, "axes.spines.right": False})
df = pd.read_csv("data/viz/sales_monthly.csv")
c = df[df["month"].str.startswith("2025")].groupby("country")["revenue"].sum().div(1e6).sort_values()

fig, (a, b) = plt.subplots(1, 2, figsize=(6.4, 1.9), layout="constrained")
a.barh(c.index, c.values, color="#0d7468")
a.set_title(f"С нуля: BY больше UZ в {c['BY'] / c['UZ']:.1f} раза".replace(".", ","), loc="left", fontsize=8.5)
b.barh(c.index, c.values, color="#bf3a2e")
b.set_xlim(40, None)                                   # ось с 40 млн ₽
b.set_title(f"С 40 млн: кажется, что в {(c['BY'] - 40) / (c['UZ'] - 40):.0f} раз", loc="left", fontsize=8.5)
for ax in (a, b):
    ax.set_xlabel("выручка за 2025 год, млн ₽")
fig.savefig("nu_zero.svg")
print(c.round(1).to_dict(), "| отношение BY/UZ:", round(c["BY"] / c["UZ"], 2),
      "| отношение длин при оси с 40:", round((c["BY"] - 40) / (c["UZ"] - 40), 1))
