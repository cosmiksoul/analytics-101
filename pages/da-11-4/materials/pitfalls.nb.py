# %% [markdown]
# # 11.4 Ловушки A/B-тестов — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 11 «A/B-тестирование» · страница 11.4.
#
# В ноутбуке четыре блока кода страницы: симуляция подглядывания на 20 000 A/A-тестов, поправки на множественность в statsmodels, проверка SRM хи-квадратом и эффект по суткам с первого показа с графиком новизны. Данные учебные: эксперименты из общего набора темы `data/ab/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз. Блоки независимы: каждый сам читает данные. Первый блок держит в памяти около 100 МБ.
#
# Вывод получен на Python 3.13, pandas 3.0, NumPy 2.5, SciPy 1.18, statsmodels 0.15 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/ab/exposures.csv`, `users.csv` и `sessions.parquet`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей. Туда же последний блок сохранит рисунок `novelty.svg`.

# %% code
import os
import pathlib
import platform

import matplotlib
import numpy as np
import pandas as pd
import scipy
import statsmodels

root = pathlib.Path.cwd()
while not (root / "data" / "ab").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/ab/
assert (root / "data" / "ab" / "sessions.parquet").exists(), \
    "Не найдена папка data/ab/. Скачайте общий набор темы 11 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| pandas", pd.__version__, "| NumPy", np.__version__, "| SciPy", scipy.__version__,
      "| statsmodels", statsmodels.__version__, "| matplotlib", matplotlib.__version__)

# %% [markdown]
# ## Код: симуляция подглядывания
#
# Те же зерно и порядок вызовов, что в общем генераторе `data/ab/aa_sim.py`: это те же 20 000 A/A-тестов, что за интерактивами страниц 11.4 и 11.5.

# %% page:peek

# %% [markdown]
# ## Код: поправки на множественность

# %% page:multi

# %% [markdown]
# ## Код: проверка SRM
#
# Здесь считаются все показы, вместе с ботами: проверка ищет поломку разбиения и логирования, а не эффект.

# %% page:srm

# %% [markdown]
# ## Код: эффект по суткам с первого показа и график новизны

# %% page:novelty

# %% [markdown]
# Блок графика переключает Matplotlib на вывод в файл, поэтому под ячейкой рисунка нет. Показываем сохранённый файл.

# %% code
from IPython.display import SVG, display

display(SVG("novelty.svg"))
