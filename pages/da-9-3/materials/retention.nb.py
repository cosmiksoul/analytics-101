# %% [markdown]
# # 9.3 Удержание и когорты — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 09 «Продуктовые метрики и события» · страница 9.3.
#
# В ноутбуке два блока кода страницы на pandas: три вида удержания из одной таблицы и рисунки — тепловая карта когорт и кривые удержания. Первый блок страницы — таблица когорт на SQL — лежит рядом файлом `cohorts.sql`, ему нужен PostgreSQL. Данные учебные: журнал событий и аккаунты из общего набора темы `data/events/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: блок рисунков продолжает блок удержания.
#
# Вывод получен на Python 3.13, pandas 3.0, pyarrow 26 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/events/events.parquet` и `data/events/users.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей. Туда же второй блок сохранит рисунки `heatmap.svg` и `curves.svg`.

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
# ## Код: три вида удержания и рисунки

# %% page:pandas

# %% page:plots

# %% [markdown]
# Блок рисунков переключает Matplotlib на вывод в файл, поэтому под ячейкой рисунков нет. Показываем сохранённые файлы.

# %% code
from IPython.display import SVG, display

display(SVG("heatmap.svg"), SVG("curves.svg"))
