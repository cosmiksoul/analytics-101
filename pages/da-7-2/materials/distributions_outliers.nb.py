# %% [markdown]
# # 7.2 Распределения и выбросы — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 07 «Разведочный анализ» · страница 7.2.
#
# В этом ноутбуке вы сравните гистограммы трат и проверите необычные записи. Четыре ячейки из раздела «Код» используют общую таблицу. Затем идут три самостоятельных примера о нулевых суммах, коде пропуска в возрасте и тратах при отсутствии заказов. Все частоты рассчитаны по строкам исходной выгрузки, включая повторы.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0, SciPy 1.18 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Распакуйте общий набор так, чтобы файл лежал по пути `data/eda/clients_export.csv`. Поместите папку урока рядом с папкой `data` и откройте ноутбук. Первая ячейка найдёт данные.

# %% code
import os
import pathlib
import platform

import matplotlib
import numpy as np
import pandas as pd
import scipy

root = pathlib.Path.cwd()
while not (root / "data" / "eda").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/eda/
assert (root / "data" / "eda" / "clients_export.csv").exists(), \
    "Не найдена папка data/eda/. Скачайте общий набор темы 07 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| numpy", np.__version__, "| pandas", pd.__version__,
      "| scipy", scipy.__version__, "| matplotlib", matplotlib.__version__)

# %% [markdown]
# ## Сводные показатели и поиск необычных сумм
#
# Первая ячейка читает выгрузку в таблицу `df`. Выполняйте следующие три ячейки по порядку.

# %% page:c1_describe

# %% page:c2_hist_all

# %% page:c3_round_peaks

# %% page:c4_rules

# %% [markdown]
# ## Нюансы
#
# В первой ячейке NumPy покажет два предупреждения при вычислении log10(0) и log1p(−1). Оба вызова вернут −inf.

# %% page:n1_zeros bag ~ ^.*(?=:\d+: RuntimeWarning)

# %% page:n2_age

# %% page:n3_combo
