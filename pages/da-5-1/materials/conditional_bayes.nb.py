# %% [markdown]
# # 5.1 Вероятность, условная вероятность, Байес: код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 05 «Вероятность» · страница 5.1.
#
# В ноутбуке три блока кода со страницы: симуляция ста тысяч пользователей, таблица сопряжённости с теоремой Байеса и проверка независимости. Данные учебные: 100 000 визитов из общего набора темы `data/probability/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз. Блоки самостоятельны: каждый читает файл заново.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0 и SciPy 1.18.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файл по пути от корня папки с материалами: `data/probability/visits.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей.

# %% code
import os
import pathlib
import platform

import numpy as np
import pandas as pd
import scipy

root = pathlib.Path.cwd()
while not (root / "data" / "probability").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/probability/
assert (root / "data" / "probability" / "visits.csv").exists(), \
    "Не найдена папка data/probability/. Скачайте общий набор темы 05 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| numpy", np.__version__, "| pandas", pd.__version__, "| scipy", scipy.__version__)

# %% [markdown]
# ## Симуляция: вероятность как доля в большом числе испытаний

# %% page:sim

# %% [markdown]
# ## Таблица сопряжённости и теорема Байеса

# %% page:crosstab

# %% [markdown]
# ## Проверка независимости

# %% page:indep

# %% [markdown]
# ## Что дальше
#
# Рядом лежит `scene_points.py`: он показывает, как из 100 000 визитов собрана пропорциональная тысяча точек для анимации и интерактива, и насколько сильнее «врёт» обычная случайная тысяча.
