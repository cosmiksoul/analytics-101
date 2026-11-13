import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.rcParams.update({"svg.fonttype": "none", "font.size": 10, "axes.spines.top": False,
                     "axes.spines.right": False, "axes.spines.left": False})
ACCENT, DARK, GREY = "#c2417a", "#454f62", "#9aa3b2"
rows = ["соцсети", "поиск", "партнёры"]                         # снизу вверх: главный ряд — внизу, ближе к оси
limit = {ch: increments(ch)[:12].sum() for ch in rows}           # LTV 12 = предел CAC при окупаемости за год
rub = lambda v: f"{v:,.0f}".replace(",", " ") + " ₽"

fig, ax = plt.subplots(figsize=(7, 3.3), layout="constrained")
for y, ch in enumerate(rows):
    col = ACCENT if ch == "соцсети" else DARK                    # один акцент: канал, который переплачивает
    lo, hi = sorted([limit[ch], CAC[ch]])
    ax.plot([lo, hi], [y, y], color=col, linewidth=2.5, alpha=0.35 if col == DARK else 0.6, solid_capstyle="butt")
    ax.scatter(limit[ch], y, s=70, facecolor="white", edgecolor=col, linewidth=2, zorder=3)
    ax.scatter(CAC[ch], y, s=70, color=col, zorder=3)
    for x, text in [(limit[ch], f"предел {rub(limit[ch])}"), (CAC[ch], f"платим {rub(CAC[ch])}")]:
        left = x == lo
        ax.annotate(text, (x, y), xytext=(-9 if left else 9, 0), textcoords="offset points",
                    ha="right" if left else "left", va="center", color=col, fontweight="bold" if col == ACCENT else None)
m = CAC["поиск"] / beta["поиск"]                                # предельный CAC: следующий клиент поиска
ax.plot([m, m], [0.78, 0.92], color=GREY, linewidth=1.5)
ax.annotate(f"следующий клиент поиска — {rub(m)}", (m, 0.78), xytext=(0, -3), textcoords="offset points",
            ha="left", va="top", color="#737c8f", fontsize=8.5)
ax.set(yticks=range(len(rows)), yticklabels=rows, xlim=(-650, 4300), ylim=(-0.55, 2.5))
ax.set_xticks([0, 1000, 2000, 3000, 4000], labels=[rub(v) for v in [0, 1000, 2000, 3000, 4000]])
ax.tick_params(axis="y", length=0, labelsize=11)
ax.grid(axis="x", color="#e8e8e8", linewidth=0.8)
ax.set_axisbelow(True)
fig.suptitle("За клиента из соцсетей платим 3 054 ₽, а за год он приносит 449 ₽", x=0.02, ha="left",
             fontweight="bold", fontsize=11.5)
ax.set_title("● — средний CAC, ○ — предел для окупаемости за год: маржинальный доход клиента за 12 месяцев",
             loc="left", fontsize=8, color="#737c8f")
ax.set_xlabel("Учебные данные магазина, июль 2024 — июнь 2026", loc="left", fontsize=7.5, color="#9aa3b2")
fig.savefig("payback_limits.svg")
print({ch: (round(CAC[ch]), round(limit[ch])) for ch in rows}, round(os.path.getsize("payback_limits.svg") / 1024, 1), "КБ")
