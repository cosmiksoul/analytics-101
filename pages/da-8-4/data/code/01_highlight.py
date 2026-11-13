import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams["svg.fonttype"] = "none"  # текст в SVG остаётся текстом, а не кривыми

GREY, ACCENT = "#BBBBBB", "#0072B2"  # фон и акцент: синий из палитры Окабе — Ито

def highlight(ax, wide, key):
    """Все столбцы wide — серым фоном, столбец key — цветом поверх них."""
    for name, s in wide.items():
        on = name == key
        ax.plot(s.index, s.values, color=ACCENT if on else GREY,
                lw=2.6 if on else 1.0, zorder=3 if on else 1)
    return ax

df = pd.read_csv("data/viz/sales_monthly.csv")
wide = df.pivot_table(index="month", columns="channel",
                      values="revenue", aggfunc="sum") / 1e6  # млн ₽
wide.index = pd.PeriodIndex(wide.index, freq="M").to_timestamp()
print(wide.shape, "— 24 месяца × 10 каналов")

fig, ax = plt.subplots(figsize=(7, 3.4))
highlight(ax, wide, "приложение")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("highlight.svg", bbox_inches="tight")
