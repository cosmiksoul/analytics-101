def label_ends(ax, wide, key, min_gap=0.8):
    """Подписывает линии и оставляет между надписями интервал в единицах шкалы Y."""
    last = wide.iloc[-1].sort_values()          # значения в последнем месяце
    ys = []
    for y in last.values:                       # снизу вверх: не ближе min_gap
        ys.append(max(y, ys[-1] + min_gap) if ys else y)
    x = wide.index[-1] + pd.Timedelta(days=24)  # чуть правее конца линий
    for (name, y0), y in zip(last.items(), ys):
        color = ACCENT if name == key else "#777777"
        connector = dict(arrowstyle="-", color=color, lw=0.6, relpos=(0, 0.5)) if y > y0 else None
        ax.annotate(name, xy=(wide.index[-1], y0), xytext=(x, y),
                    va="center", fontsize=8.5, color=color, arrowprops=connector,
                    fontweight="bold" if name == key else "normal")
    return pd.DataFrame({"дек 2025": last.round(2), "подпись на": [round(y, 2) for y in ys]})

fig, ax = plt.subplots(figsize=(7, 3.4))
highlight(ax, wide, "приложение")
print(label_ends(ax, wide, "приложение"))
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("labels.svg", bbox_inches="tight")
