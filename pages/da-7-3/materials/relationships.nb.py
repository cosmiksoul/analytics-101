# %% [markdown]
# # 7.3 Связи между переменными и вопросы к данным — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 07 «Разведочный анализ» · страница 7.3.
#
# Первые три примера показывают, как сравнить пары признаков, сопоставить каналы привлечения и заметить пропуски в дневных данных. Затем вы проверите, сколько случайных корреляций возникает при переборе пар, и выясните, как пропуски и неполный день меняют выводы о выручке. Для расчётов нужны файлы из общего набора `data/eda/`.
#
# Отдельный шаблон для собственного анализа лежит рядом в файле `eda_template.ipynb`.
#
# **Как работать.** Выполняйте ячейки по порядку. Первая часть подготавливает выгрузку, которую вы будете использовать для сравнения групп. Для записи Parquet установите пакет pyarrow.
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
# ## Клиенты по каналам и показатели по дням

# %% page:pairplot

# %% page:segments

# %% page:series

# %% [markdown]
# ## Случайные корреляции, пропуски и неполные дни

# %% page:noise

# %% page:agg

# %% page:tail
