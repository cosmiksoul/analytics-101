import numpy as np, pandas as pd

def density(x):                              # плотность стандартного нормального распределения
    return np.exp(-x**2 / 2) / np.sqrt(2 * np.pi)

for n in [4, 10, 100, 1000]:                 # площадь под кривой от -1 до 1
    dx = 2 / n
    mids = -1 + dx * (np.arange(n) + 0.5)    # середины n прямоугольников
    print(f"n = {n:>4}: сумма прямоугольников = {np.sum(density(mids) * dx):.6f}")

income = pd.read_csv("data/clients/clients.csv")["income"]
edges = np.arange(25_000, 325_001, 25_000)             # границы интервалов с шагом 25 тыс. ₽
h, edges = np.histogram(income, bins=edges, density=True)
widths = np.diff(edges)
print("площадь всей гистограммы:", round(np.sum(h * widths), 6))
print("площадь столбиков 50–100 тыс.:", round(np.sum(h[1:3] * widths[1:3]), 3))
print("доля клиентов с доходом 50–100 тыс.:", ((income >= 50_000) & (income < 100_000)).mean())
