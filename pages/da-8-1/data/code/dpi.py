# t — из кода «Анатомии графика»
import os

fig, ax = plt.subplots(figsize=(8, 4.5))      # размер в дюймах
ax.plot(t.index, t["2025"])
ax.set_title("Выручка 2025 года, млн ₽")
print("figsize:", fig.get_size_inches(), "дюйма, dpi фигуры:", fig.dpi)

for dpi in (72, 100, 200):
    fig.savefig(f"chart_{dpi}.png", dpi=dpi)
    h, w, _ = plt.imread(f"chart_{dpi}.png").shape
    print(f"PNG, dpi={dpi:>3}: {w}×{h} px, {os.path.getsize(f'chart_{dpi}.png') / 1024:.0f} КБ")

fig.savefig("chart_tight.png", bbox_inches="tight")
h, w, _ = plt.imread("chart_tight.png").shape
print(f"PNG, bbox_inches='tight': {w}×{h} px — пустые поля обрезаны")

fig.savefig("chart.svg")
print(f"SVG: {os.path.getsize('chart.svg') / 1024:.0f} КБ, 576×324 pt, чёткий при любом масштабе")
