# %% [markdown]
# # 11.2 Дизайн теста — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 11 «A/B-тестирование» · страница 11.2.
#
# В ноутбуке три блока кода страницы: параметры из данных, MDE из денег и размер выборки вручную; то же в statsmodels с мощностью по факту; проверка мощности симуляцией. Четвёртый блок страницы — шаблон документа дизайна — лежит рядом файлом `test_design_template.md`. Данные учебные: показы и сессии экспериментов из общего набора темы `data/ab/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: каждый блок продолжает предыдущий.
#
# Вывод получен на Python 3.13, pandas 3.0, NumPy 2.5, SciPy 1.18 и statsmodels 0.15.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/ab/exposures.csv` и `data/ab/sessions.parquet`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей.

# %% code
import os
import pathlib
import platform

import numpy as np
import pandas as pd
import scipy
import statsmodels

root = pathlib.Path.cwd()
while not (root / "data" / "ab").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/ab/
assert (root / "data" / "ab" / "exposures.csv").exists(), \
    "Не найдена папка data/ab/. Скачайте общий набор темы 11 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| pandas", pd.__version__, "| NumPy", np.__version__,
      "| SciPy", scipy.__version__, "| statsmodels", statsmodels.__version__)

# %% [markdown]
# ## Код: параметры из данных, MDE из денег и выборка вручную
#
# Трое ботов исключены списком: как их находят, показывает страница 11.3.

# %% page:manual

# %% [markdown]
# ## Код: то же в statsmodels

# %% page:sm

# %% [markdown]
# ## Код: проверка мощности симуляцией
#
# Зерно генератора зафиксировано: повторный запуск даёт тот же вывод.

# %% page:sim
