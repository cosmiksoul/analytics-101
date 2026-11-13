import os

import numpy as np
import plotly.express as px

rng = np.random.default_rng(83)  # учебные случайные точки: важен только их счёт
for n in [1_000, 10_000, 100_000, 1_000_000]:
    fig = px.scatter(x=rng.normal(size=n), y=rng.normal(size=n))
    fig.write_html("points.html", include_plotlyjs="cdn")  # без библиотеки: в файле только данные
    kb = os.path.getsize("points.html") / 1024
    print(f"{n:>9,} точек  {fig.data[0].type:<10} {kb:>8,.0f} КБ  {kb * 1024 / n:4.1f} байта на точку")
