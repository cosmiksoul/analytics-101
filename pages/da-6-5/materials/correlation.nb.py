# %% [markdown]
# # 6.5 Корреляция и причинность: код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 06 «Статистический вывод» · страница 6.5.
#
# Вы построите матрицу корреляций, сравните коэффициенты Пирсона и Спирмена и разберёте парадокс Симпсона на примере заказов со скидкой. Для квартета Энскомба пересчитаете коэффициенты из анимации. В конце проверите, как на корреляцию влияют форма зависимости, группировка и общий тренд.
#
# **Как работать.** Выполняйте ячейки по порядку. Для расчёта коэффициента Спирмена понадобится SciPy.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Распакуйте общие наборы так, чтобы оба файла были в одной папке с материалами по путям `data/clients/clients.csv` и `data/inference/discounts.csv`. Рядом с папкой `data` поместите папку урока с ноутбуком и файлом `anscombe.csv`. Откройте ноутбук из папки урока. Первая ячейка найдёт общие данные.

# %% code
import os
import pathlib
import platform

import matplotlib
import numpy as np
import pandas as pd

here = pathlib.Path.cwd()                   # папка ноутбука: рядом лежит anscombe.csv
root = here
while not (root / "data" / "clients").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/clients/
assert (root / "data" / "clients" / "clients.csv").exists(), \
    "Не найдена папка data/clients/. Скачайте общий набор темы 04 и положите data/ рядом с папкой страницы"
assert (root / "data" / "inference" / "discounts.csv").exists(), \
    "Не найдена папка data/inference/. Скачайте общий набор темы 06 и положите его в ту же папку data/"
os.chdir(root)

print("Python", platform.python_version(), "| numpy", np.__version__, "| pandas", pd.__version__, "| matplotlib", matplotlib.__version__)

# %% [markdown]
# ## Матрица корреляций
#
# Первая ячейка выводит матрицу и сохраняет её как тепловую карту в файле `corr_heatmap.svg` в корне папки с материалами. Вторая показывает карту.

# %% page:matrix

# %% code
from IPython.display import SVG

SVG(filename="corr_heatmap.svg")

# %% [markdown]
# ## Как выброс влияет на коэффициенты Пирсона и Спирмена

# %% page:spearman

# %% [markdown]
# ## Парадокс Симпсона

# %% page:simpson

# %% [markdown]
# ## Квартет Энскомба
#
# В статье 1973 года Энскомб сравнил четыре набора по 11 точек. У них почти одинаковые средние, дисперсии и коэффициенты Пирсона. В первом наборе точки лежат вдоль прямой с разбросом, во втором образуют дугу. В третьем одна точка отклоняется от прямой. В четвёртом только у одной точки значение x отличается от остальных. Рассчитайте коэффициенты и сопоставьте их с графиками в анимации урока.

# %% code
q = pd.read_csv(here / "anscombe.csv")
for name, g in q.groupby("set"):
    print(f"набор {name}: среднее x = {g.x.mean():.2f}, y = {g.y.mean():.2f}; дисперсия x = {g.x.var():.2f}, y = {g.y.var():.2f}; "
          f"r = {g.x.corr(g.y):.3f}, Спирмен = {g.x.corr(g.y, method='spearman'):.3f}")

# %% [markdown]
# ## Нелинейная зависимость, усреднение и тренд

# %% page:nonlinear

# %% page:aggregate

# %% page:trend
