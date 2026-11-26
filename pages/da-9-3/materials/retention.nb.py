# %% [markdown]
# # 9.3 Удержание и когорты — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 09 «Продуктовые метрики и события» · страница 9.3.
#
# Посчитаем три вида недельного удержания в pandas, затем построим тепловую карту и кривые когорт. Отдельный файл `cohorts.sql` содержит запрос к той же выборке для PostgreSQL.
#
# Выполняйте ячейки по порядку. Для построения графиков понадобятся таблицы, которые мы рассчитаем в первой части.
#
# Вывод получен на Python 3.13, pandas 3.0, pyarrow 26 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Распакуйте общий набор рядом с папкой урока. Первая ячейка найдёт `data/events/events.parquet` и `data/events/users.csv` и установит рабочую папку. Туда же будут сохранены `heatmap.svg` и `curves.svg`.

# %% code
import os
import pathlib
import platform

import matplotlib
import pandas as pd
import pyarrow

root = pathlib.Path.cwd()
while not (root / "data" / "events").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/events/
assert (root / "data" / "events" / "events.parquet").exists(), \
    "Не найдена папка data/events/. Скачайте общий набор темы 09 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| pandas", pd.__version__, "| pyarrow", pyarrow.__version__,
      "| matplotlib", matplotlib.__version__)

# %% [markdown]
# ## Три вида удержания и графики когорт

# %% page:pandas

# %% page:plots

# %% [markdown]
# Matplotlib сохранил графики в рабочей папке. Следующая ячейка покажет оба файла прямо в ноутбуке.

# %% code
from IPython.display import SVG, display

display(SVG("heatmap.svg"), SVG("curves.svg"))
