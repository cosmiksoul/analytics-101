# %% [markdown]
# # 7.2 Распределения и выбросы — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 07 «Разведочный анализ» · страница 7.2.
#
# В ноутбуке семь блоков кода со страницы. Четыре ячейки раздела «Код» идут подряд и пользуются общими переменными: describe с квантилями, гистограммы всех числовых столбцов, пики на круглых суммах, три правила выбросов. Три проверки из «Нюансов» самостоятельны: нули и логарифм, возраст 99, выброс по комбинации. Данные учебные: выгрузка клиентов из общего набора темы `data/eda/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0, SciPy 1.18 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файл по пути от корня папки с материалами: `data/eda/clients_export.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей.

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
# ## Код: от describe до трёх правил
#
# Четыре ячейки выполняются по порядку: следующие пользуются таблицей `df` из первой.

# %% page:c1_describe

# %% page:c2_hist_all

# %% page:c3_round_peaks

# %% page:c4_rules

# %% [markdown]
# ## Нюансы
#
# В первой ячейке NumPy дважды предупреждает о делении на ноль внутри логарифма — так и задумано. В ноутбуке предупреждения стоят под выводом ячейки, а на странице — между его строками, там, где они возникли.

# %% page:n1_zeros bag ~ ^.*(?=:\d+: RuntimeWarning)

# %% page:n2_age

# %% page:n3_combo
