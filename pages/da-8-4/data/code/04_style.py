plt.style.use("textbook.mplstyle")  # путь к файлу; можно положить в stylelib и звать по имени
print("заголовок:", plt.rcParams["axes.titlelocation"],
      "| верхняя рамка:", plt.rcParams["axes.spines.top"],
      "| палитра:", plt.rcParams["axes.prop_cycle"].by_key()["color"][:3])

fig, ax = plt.subplots()             # рамки, сетка, шрифт и заголовок — уже из стиля
highlight(ax, wide, "приложение")
label_ends(ax, wide, "приложение")
ax.axvline(release, color="#777777", lw=0.8, ls="--", zorder=0)
ax.set_title("Выручка приложения удвоилась после релиза в июне")
fig.savefig("styled.svg")

with plt.style.context("default"):   # временно вернуть стандартный вид
    print("внутри style.context('default') верхняя рамка:", plt.rcParams["axes.spines.top"])
