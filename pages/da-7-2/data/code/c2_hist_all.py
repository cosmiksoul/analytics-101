axes = num.hist(bins=30, figsize=(12, 6), layout=(2, 3))  # пять гистограмм одним вызовом

for ax in axes.flat[:num.shape[1]]:               # что нарисовано: высоты столбиков
    h = np.array([bar.get_height() for bar in ax.patches])
    lo = round(ax.patches[0].get_x(), 6) + 0.0   # + 0.0 убирает «−0»
    hi = ax.patches[-1].get_x() + ax.patches[-1].get_width()
    print(f"{ax.get_title():10} {lo:>4,.0f} … {hi:<11,.0f} пустых интервалов: {(h == 0).sum():>2}"
          f"   доля записей в самом высоком столбце: {h.max() / h.sum():>6.2%}")
