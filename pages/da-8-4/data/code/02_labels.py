def label_ends(ax, wide, key, min_gap=0.45):
    """Подписи у последней точки каждой линии; близкие раздвигаем на min_gap."""
    last = wide.iloc[-1].sort_values()          # значения в последнем месяце
    ys = []
    for y in last.values:                       # снизу вверх: не ближе min_gap
        ys.append(max(y, ys[-1] + min_gap) if ys else y)
    x = wide.index[-1] + pd.Timedelta(days=12)  # чуть правее конца линий
    for (name, y0), y in zip(last.items(), ys):
        ax.text(x, y, name, va="center", fontsize=8.5,
                color=ACCENT if name == key else "#777777",
                fontweight="bold" if name == key else "normal")
    return pd.DataFrame({"дек 2025": last.round(2), "подпись на": [round(y, 2) for y in ys]})

fig, ax = plt.subplots(figsize=(7, 3.4))
highlight(ax, wide, "приложение")
print(label_ends(ax, wide, "приложение"))
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("labels.svg", bbox_inches="tight")
