# sales, MONTHS — из кода «Анатомии графика»
from pathlib import Path

from cycler import cycler

TEXTBOOK = {                                   # стиль учебника: один словарь rcParams
    "figure.figsize": (7, 3.4),
    "font.size": 10,
    "axes.titlesize": 12,
    "axes.titleweight": "bold",
    "axes.titlelocation": "left",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.edgecolor": "#737c8f",
    "axes.grid": True,
    "axes.grid.axis": "y",
    "grid.color": "#dde1e8",
    "axes.prop_cycle": cycler(color=["#9aa3b2", "#0d7468"]),
    "legend.frameon": False,
    "savefig.dpi": 200,
    "savefig.bbox": "tight",
}


def yoy_chart(ax, t, title, unit="млн ₽"):
    """Сравнивает выручку по месяцам. Каждая линия соответствует одному году."""
    for year in t.columns:
        ax.plot(t.index, t[year], label=year, linewidth=2.5 if year == t.columns[-1] else 1.5)
    ax.set_xticks(t.index, MONTHS)
    ax.set_ylim(0, t.max().max() * 1.2)
    ax.yaxis.set_major_formatter(lambda x, pos: f"{x:g}".replace(".", ","))
    ax.set_ylabel(unit)
    ax.set_title(title)
    ax.legend(loc="lower right", ncols=2)
    return ax


by_ch = sales.pivot_table(index=["channel", "m"], columns="year",
                          values="revenue", aggfunc="sum") / 1e6
Path("charts").mkdir(exist_ok=True)
with plt.style.context(TEXTBOOK):              # стиль действует только внутри with
    for i, ch in enumerate(by_ch.index.unique("channel")):
        tc = by_ch.loc[ch]
        delta = round(tc["2025"].sum() / tc["2024"].sum() - 1, 2) + 0   # + 0 убирает «−0»
        delta = f"{delta:+.0%}".replace("-", "−")
        fig, ax = plt.subplots()
        yoy_chart(ax, tc, f"{ch.capitalize()}: {delta} к 2024 году")
        fig.savefig(f"charts/{i:02d}.png")
        plt.close(fig)                         # освобождаем память после сохранения
        print(f"charts/{i:02d}.png  {ax.get_title(loc='left')}")
print("открытых фигур:", len(plt.get_fignums()))
