app = wide["приложение"]
x = app["2025-07-01"] / app["2025-05-01"]     # проверяем вывод раньше, чем пишем его
base = app["2024-07-01"] / app["2024-05-01"]  # тот же период годом раньше для сравнения
print(f"май → июль 2025: ×{x:.2f}; май → июль 2024: ×{base:.2f}")
assert 1.9 <= x < 2, "проверьте формулировку «почти удвоилась»"

release = pd.Timestamp("2025-06-01")
fig, ax = plt.subplots(figsize=(7, 3.8))
highlight(ax, wide, "приложение")
label_ends(ax, wide, "приложение")
ax.axvline(release, color="#777777", lw=0.8, ls="--", zorder=0)
ax.annotate("релиз приложения", xy=(release, 1), xycoords=("data", "axes fraction"),
            xytext=(4, -2), textcoords="offset points", va="top", fontsize=9)
ax.set_title("С мая по июль 2025 года выручка приложения почти удвоилась",
             loc="left", fontweight="bold", pad=22)
ax.text(0, 1.03, "Выручка по каналам продаж, млн ₽ в месяц",
        transform=ax.transAxes, color="#555555")
fig.text(0.01, 0.01, "Источник: учебные данные магазина, sales_monthly.csv",
         fontsize=8, color="#777777")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("annotated.svg", bbox_inches="tight")
