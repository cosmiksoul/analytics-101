# %% [markdown]
# # 9.2 Воронки и конверсии — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 09 «Продуктовые метрики и события» · страница 9.2.
#
# Сравним долю покупателей сайта и приложения внутри каждого канала и по всем каналам вместе. Затем построим диаграмму воронки майских новичков. Для самостоятельной проверки в PostgreSQL используйте файл `funnel.sql`.
#
# Выполняйте ячейки по порядку. Ячейка с графиком использует данные и функцию из предыдущей.
#
# Вывод получен на Python 3.13, pandas 3.0, pyarrow 26 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Распакуйте общий набор темы рядом с папкой урока. Первая ячейка найдёт `data/events/events.parquet` и `data/events/users.csv` и установит рабочую папку. В ней появится график `funnel_bars.svg`.

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
# ## Конверсия по каналам и шагам воронки

# %% page:seg

# %% page:chart
