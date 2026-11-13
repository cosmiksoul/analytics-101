# %% [markdown]
# # 9.2 Воронки и конверсии — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 09 «Продуктовые метрики и события» · страница 9.2.
#
# В ноутбуке два блока кода страницы на pandas: воронка по сегментам, где виден парадокс Симпсона, и график воронки столбцами. Первый блок страницы — воронка на SQL с окном и строгим порядком — лежит рядом файлом `funnel.sql`, ему нужен PostgreSQL. Данные учебные: журнал событий и аккаунты из общего набора темы `data/events/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: график продолжает блок сегментов.
#
# Вывод получен на Python 3.13, pandas 3.0, pyarrow 26 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/events/events.parquet` и `data/events/users.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей. Туда же второй блок сохранит рисунок `funnel_bars.svg`.

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
# ## Код: сегменты и график

# %% page:seg

# %% page:chart
