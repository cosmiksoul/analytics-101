import matplotlib
import pandas as pd

matplotlib.use("Agg")                       # рисуем в файл, без окна
import matplotlib.pyplot as plt

df = pd.read_csv("data/clients/clients.csv").drop(columns="client_id")
corr = df.corr()                            # Пирсон для всех пар столбцов
print(corr.round(2), end="\n\n")

# одна пара с нуля: средний вклад (x − x̄)(y − ȳ), делённый на σx·σy
x, y = df["income"], df["spend"]
cov = ((x - x.mean()) * (y - y.mean())).sum() / (len(df) - 1)
print(f"ковариация = {cov:,.0f}".replace(",", " "))
print(f"r вручную = {cov / (x.std() * y.std()):.4f}, pandas = {x.corr(y):.4f}")

fig, ax = plt.subplots(figsize=(4.6, 4))
im = ax.imshow(corr, cmap="RdBu_r", vmin=-1, vmax=1)   # 0 — белый, ±1 — насыщенный
ax.set_xticks(range(4), corr.columns)
ax.set_yticks(range(4), corr.columns)
for i in range(4):
    for j in range(4):
        ax.text(j, i, f"{corr.iloc[i, j]:.2f}", ha="center", va="center")
fig.colorbar(im)
fig.savefig("corr_heatmap.svg", bbox_inches="tight")
print("тепловая карта сохранена: corr_heatmap.svg")
