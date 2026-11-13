# %% [markdown]
# # 6.5 Корреляция и причинность: код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 06 «Статистический вывод» · страница 6.5.
#
# В ноутбуке шесть блоков кода со страницы: матрица корреляций, Пирсон против Спирмена, парадокс Симпсона и три нюанса. Между ними — квартет Энскомба из файла `anscombe.csv`. Данные учебные: клиенты из общего набора `data/clients/` и заказы со скидкой из `data/inference/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз. Блоки самостоятельны: каждый читает файлы заново.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/clients/clients.csv` и `data/inference/discounts.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка запоминает эту папку (в ней `anscombe.csv`), поднимается до папки, в которой есть `data/`, и делает её рабочей.

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
# Блок печатает матрицу и сохраняет тепловую карту в файл `corr_heatmap.svg` в корне папки с материалами. Ячейка под ним показывает этот файл.

# %% page:matrix

# %% code
from IPython.display import SVG

SVG(filename="corr_heatmap.svg")

# %% [markdown]
# ## Пирсон и Спирмен

# %% page:spearman

# %% [markdown]
# ## Парадокс Симпсона

# %% page:simpson

# %% [markdown]
# ## Квартет Энскомба
#
# Четыре набора по 11 точек из статьи Энскомба 1973 года. Средние, дисперсии и корреляция у них почти одинаковые, а графики разные: прямая с шумом, дуга, прямая с одним выбросом и столбик точек с одной далёкой. Этой ячейки на странице нет: там квартет показан в анимации.

# %% code
q = pd.read_csv(here / "anscombe.csv")
for name, g in q.groupby("set"):
    print(f"набор {name}: среднее x = {g.x.mean():.2f}, y = {g.y.mean():.2f}; дисперсия x = {g.x.var():.2f}, y = {g.y.var():.2f}; "
          f"r = {g.x.corr(g.y):.3f}, Спирмен = {g.x.corr(g.y, method='spearman'):.3f}")

# %% [markdown]
# ## Три нюанса

# %% page:nonlinear

# %% page:aggregate

# %% page:trend
