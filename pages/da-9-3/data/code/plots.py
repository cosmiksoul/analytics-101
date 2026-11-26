import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

plt.rcParams.update({"svg.fonttype": "none", "font.size": 9, "axes.spines.top": False, "axes.spines.right": False})
ACCENT, CAMP, DARK, GREY = "#0d7468", "#c2417a", "#454f62", "#9aa3b2"
teal = LinearSegmentedColormap.from_list("teal", ["#f5f6f8", ACCENT])   # один тон: темнее — больше
m = types["классическое"].loc[:, 1:12]                                  # 25 когорт × недели 1–12
labels = [f"{START + pd.Timedelta(weeks=c):%d.%m}" for c in m.index]

# 1. Тепловая карта: строка — когорта, столбец — неделя жизни
fig, ax = plt.subplots(figsize=(6.4, 6), layout="constrained")
im = ax.imshow(m.to_numpy(), cmap=teal, vmin=0, vmax=40, aspect="auto", interpolation="nearest",
               extent=(0.5, 12.5, len(m) - 0.5, -0.5))                 # растр 25 × 12 весит в SVG мало
ax.hlines([y + 0.5 for y in range(len(m) - 1)], 0.5, 12.5, color="white", linewidth=0.6)
ax.vlines([x + 0.5 for x in range(1, 12)], -0.5, len(m) - 0.5, color="white", linewidth=0.6)
ax.set(xticks=list(m.columns), yticks=range(len(m)), yticklabels=labels, xlabel="неделя жизни когорты n")
ax.tick_params(length=0)
ax.spines[:].set_visible(False)
ax.axhline(9.5, color="#141a24", linewidth=1)                         # события — подписью на месте
ax.annotate("релиз 3.0", (12.5, 9.5), xytext=(6, 0), textcoords="offset points", va="center")
ax.plot([12.8, 12.8], [12.6, 16.4], color=CAMP, linewidth=2, clip_on=False)
ax.annotate("кампания", (12.8, 14.5), xytext=(6, 0), textcoords="offset points", va="center", color=CAMP,
            annotation_clip=False)
ax.set_xlim(0.5, 12.5)
fig.colorbar(im, ax=ax, shrink=0.45, location="bottom", label="% когорты, активной в неделю n")
fig.suptitle("Доля вернувшихся выше у мартовских когорт\nпосле релиза", x=0.02, ha="left",
             fontweight="bold", fontsize=11)
ax.set_title("Классическое удержание. В пустых ячейках неделя ещё не закончилась",
             loc="left", fontsize=8, color="#737c8f")
fig.savefig("heatmap.svg")

# 2. Кривые: каждая когорта — серая линия, три группы — взвешенное среднее с прямой подписью
cnt = classic.loc[:, 1:12]
groups = {"до релиза": (range(0, 10), DARK, (6, 0)), "16–30 марта": (range(10, 13), ACCENT, (6, 0)),
          "кампания": (range(13, 17), CAMP, (-10, -34))}
fig, ax = plt.subplots(figsize=(6.4, 3.8), layout="constrained")
for c in m.index:
    ax.plot(m.columns, m.loc[c], color=GREY, linewidth=0.6, alpha=0.6)
for name, (rows, color, offset) in groups.items():
    rows = list(rows)
    w = cnt.loc[rows].sum() / size[rows].sum() * 100                  # все вернувшиеся / все пришедшие
    w = w[m.loc[rows].notna().all()]                                 # только недели, прожитые всеми
    ax.plot(w.index, w, color=color, linewidth=2.2)
    ax.annotate(f"{name}: плато {w.loc[4:9].mean():.1f}%".replace(".", ","), (w.index[-1], w.iloc[-1]),
                xytext=offset, textcoords="offset points", va="center", color=color, fontweight="bold",
                arrowprops=None if offset[1] == 0 else {"arrowstyle": "-", "color": color, "linewidth": 0.8})
ax.axvspan(4, 9, color="#edf0f4", zorder=0)
ax.text(6.5, 35, "плато: недели 4–9", ha="center", color="#737c8f")
ax.set(xlim=(1, 12), ylim=(0, 40), xticks=range(1, 13), xlabel="неделя жизни когорты n", ylabel="% когорты")
fig.suptitle("После релиза плато выше: 19% у мартовских когорт", x=0.02, ha="left",
             fontweight="bold", fontsize=11)
ax.set_title("Тонкие линии — отдельные когорты. Источник: учебный журнал событий",
             loc="left", fontsize=7.5, color="#737c8f")
fig.savefig("curves.svg")
print({f: round(os.path.getsize(f) / 1024, 1) for f in ["heatmap.svg", "curves.svg"]}, "КБ")
