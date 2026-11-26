# Таблица t подготовлена в примере с месячной выручкой. Выполните этот блок целиком.
plt.plot(t.index, t["2024"])
plt.title("2024")
plt.savefig("y2024.png")

plt.plot(t.index, t["2025"])         # вторая линия появится на уже открытом графике
plt.title("2025")
plt.savefig("y2025.png")

print("открытых фигур:", plt.get_fignums())
print("линий на текущих осях:", len(plt.gca().lines))
print("заголовок:", plt.gca().get_title())
