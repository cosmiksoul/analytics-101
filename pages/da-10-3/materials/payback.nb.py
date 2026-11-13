# %% [markdown]
# # 10.3 Когортная окупаемость — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 10 «Юнит-экономика» · страница 10.3.
#
# В ноутбуке два блока кода страницы на pandas: сценарный калькулятор — убывающая отдача, сценарии, эффект эксперимента в деньгах и денежный поток — и один график для маркетинга. Первый блок страницы — кривые окупаемости на SQL — лежит рядом файлом `payback.sql`, ему нужен PostgreSQL. Данные учебные: финансовая выгрузка магазина из общего набора темы `data/unit/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: блок графика продолжает калькулятор.
#
# Вывод получен на Python 3.13, pandas 3.0, NumPy 2.5 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/unit/clients.csv`, `orders.csv` и `marketing_spend.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей. Туда же второй блок сохранит рисунок `payback_limits.svg`.

# %% code
import os
import pathlib
import platform

import matplotlib
import numpy as np
import pandas as pd

root = pathlib.Path.cwd()
while not (root / "data" / "unit").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/unit/
assert (root / "data" / "unit" / "orders.csv").exists(), \
    "Не найдена папка data/unit/. Скачайте общий набор темы 10 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| pandas", pd.__version__, "| NumPy", np.__version__,
      "| matplotlib", matplotlib.__version__)

# %% [markdown]
# ## Код: сценарный калькулятор
#
# Четыре расчёта по порядку: предельный CAC из эластичности, сценарии «удержание» и «чек», эффект эксперимента в рублях и денежный поток при росте расходов.

# %% page:pandas

# %% [markdown]
# ## Код: один график для маркетинга

# %% page:plot

# %% [markdown]
# Блок графика переключает Matplotlib на вывод в файл, поэтому под ячейкой рисунка нет. Показываем сохранённый файл.

# %% code
from IPython.display import SVG, display

display(SVG("payback_limits.svg"))
