# %% [markdown]
# # 7.3 Связи между переменными и вопросы к данным — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 07 «Разведочный анализ» · страница 7.3.
#
# В ноутбуке шесть блоков кода со страницы. Три блока раздела «Код» идут подряд, как на странице: матрица пар и корреляций, сравнение сегментов, разметка ряда по дням. Затем три нюанса: перебор пар в шуме, агрегация по месяцам и неполный последний день. Данные учебные: выгрузка клиентов и дневные метрики из общего набора темы `data/eda/`.
#
# Шаблон ноутбука из четвёртого блока страницы лежит рядом готовым файлом `eda_template.ipynb`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: первый блок чистит выгрузку и сохраняет её для второго.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0, SciPy 1.18, seaborn 0.13 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/eda/clients_export.csv` и `data/eda/daily_metrics.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей. Туда же первый блок сохранит очищенную таблицу `clients_clean.parquet` и рисунки `pairplot.svg` и `corr.svg`.

# %% code
import os
import pathlib
import platform

import matplotlib
import numpy as np
import pandas as pd
import scipy
import seaborn

root = pathlib.Path.cwd()
while not (root / "data" / "eda").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/eda/
assert (root / "data" / "eda" / "daily_metrics.csv").exists(), \
    "Не найдена папка data/eda/. Скачайте общий набор темы 07 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| numpy", np.__version__, "| pandas", pd.__version__, "| scipy", scipy.__version__,
      "| seaborn", seaborn.__version__, "| matplotlib", matplotlib.__version__)

# %% [markdown]
# ## Код: пары, сегменты, ряд

# %% page:pairplot

# %% page:segments

# %% page:series

# %% [markdown]
# ## Три нюанса

# %% page:noise

# %% page:agg

# %% page:tail
