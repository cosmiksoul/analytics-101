# %% [markdown]
# # 8.2 Тип графика под вопрос — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 08 «Визуализация в Python» · страница 8.2.
#
# В ноутбуке три блока кода раздела «Код» с рисунками: четыре вопроса и четыре графика на одних данных, малые множители через `FacetGrid`, круговая диаграмма против столбцов. Данные учебные: продажи магазина из общего набора темы `data/viz/`.
#
# Четыре рисунка из раздела «Нюансы» строит скрипт `nuances.py`, он лежит рядом.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз. Каждый блок читает данные сам, так что после первой ячейки их можно запускать и по отдельности.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0, matplotlib 3.10 и seaborn 0.13.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файл по пути от корня папки с материалами: `data/viz/sales_monthly.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей. Туда же блоки сохранят рисунки `question_to_chart.svg`, `facets.svg` и `pie_to_bars.svg`.

# %% code
import os
import pathlib
import platform

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn

root = pathlib.Path.cwd()
while not (root / "data" / "viz").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/viz/
assert (root / "data" / "viz" / "sales_monthly.csv").exists(), \
    "Не найдена папка data/viz/. Скачайте общий набор темы 08 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| numpy", np.__version__, "| pandas", pd.__version__,
      "| matplotlib", matplotlib.__version__, "| seaborn", seaborn.__version__)

# %% [markdown]
# ## Код: вопрос выбирает график

# %% page:q2chart

# %% [markdown]
# На странице каждый блок — отдельный скрипт, а в ноутбуке сессия одна: первый блок убрал верхнюю и правую рамки через `rcParams`, и эта настройка действует до конца сессии. Перед следующим блоком возвращаем настройки Matplotlib по умолчанию, чтобы рисунок вышел таким же, как на странице.

# %% code
plt.rcdefaults()

# %% page:facets

# %% code
plt.rcdefaults()

# %% page:pie2bars
