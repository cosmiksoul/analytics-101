import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams.update({"svg.fonttype": "none", "font.size": 7.5})

df = pd.read_csv("data/viz/sales_monthly.csv")
y25 = df[df["month"].str.startswith("2025")]
s = y25.groupby("channel")["revenue"].sum() / 1e6     # млн ₽, каналы по алфавиту
share = s / s.sum() * 100

fig, (left, right) = plt.subplots(1, 2, figsize=(6.4, 2.7), layout="constrained",
                                  width_ratios=[1, 1.15])
left.pie(s, labels=s.index, startangle=-40, textprops={"fontsize": 6.5})  # доли в порядке groupby
left.set_title("Доли каналов на круговой диаграмме", loc="left", fontsize=8.5)

top = share.sort_values()                              # по возрастанию: крупный канал окажется наверху
bars = right.barh(top.index, top.values, color="#0d7468")
right.bar_label(bars, labels=[f"{v:.1f}%".replace(".", ",") for v in top], padding=3)
right.set_xticks([])                                   # подписи на столбцах заменяют ось
right.spines[["top", "right", "bottom"]].set_visible(False)
right.set_title("Доли каналов по убыванию", loc="left", fontsize=8.5)
fig.savefig("pie_to_bars.svg")

print(share.sort_values(ascending=False).round(1).to_string())
