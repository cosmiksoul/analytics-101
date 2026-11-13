import matplotlib.pyplot as plt

plt.rcParams["svg.fonttype"] = "none"         # подписи в SVG остаются текстом

may = first[~first.index.isin(old)
            & (first.t >= pd.Timestamp("2026-05-01", tz=MSK))
            & (first.t < pd.Timestamp("2026-06-01", tz=MSK))]
n = funnel(ev, may.t).sum()                   # дошли до шага: окно 7 суток, любой порядок
step = n / n.shift()                          # доля перехода с прошлого шага
worst = step.idxmin()                         # где теряем больше всего
print(n.to_dict())
print("переходы, %:", (step.iloc[1:] * 100).round(1).to_dict())
assert worst == "add_to_cart" and step[worst] < 0.5, "заголовок данными не подтверждается"

GREY, ACCENT = "#BBBBBB", "#0072B2"
names = ["открыл", "карточка", "корзина", "оформление", "оплата"]
colors = [ACCENT if s == worst else GREY for s in STEPS]
fig, ax = plt.subplots(figsize=(7, 3.6))
bars = ax.bar(names, n, color=colors, width=0.6)
ax.bar_label(bars, labels=[f"{v:,}".replace(",", " ") for v in n], padding=3, fontsize=10)
for i in range(1, 5):                         # доля перехода — над промежутком между столбцами
    on = STEPS[i] == worst
    ax.text(i - 0.5, n.max() * 1.13, f"→ {step.iloc[i]:.0%}", ha="center",
            fontsize=10, color=ACCENT if on else "#555555", fontweight="bold" if on else "normal")
ax.set_ylim(0, n.max() * 1.22)
ax.set_yticks([])                              # подписи на столбцах заменяют ось
ax.spines[["top", "right", "left"]].set_visible(False)
ax.set_title("Из карточки в корзину доходит меньше половины", loc="left", fontweight="bold", pad=24)
ax.text(0, 1.04, "Новички мая: сколько человек дошло до шага за 7 суток, любой порядок",
        transform=ax.transAxes, color="#555555")
fig.text(0.01, -0.02, "Источник: учебный журнал событий, events.parquet", fontsize=8, color="#777777")
fig.savefig("funnel_bars.svg", bbox_inches="tight")
