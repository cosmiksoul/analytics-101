# %% [markdown]
# # 7.1 Первый взгляд: формы, типы, пропуски — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 07 «Разведочный анализ» · страница 7.1.
#
# В ноутбуке пять блоков кода со страницы: чек-лист первого взгляда, карта пропусков и три нюанса — скрытые пропуски, повторы ключа, часовые пояса. Данные учебные: выгрузка клиентов из общего набора темы `data/eda/`.
#
# Шестой блок страницы, черновик автоматического отчёта, лежит рядом отдельным скриптом `profile_report.py`: пакету нужен pandas ниже 3.0, и в одном окружении с этим ноутбуком он не работает. Как его запустить, написано в начале скрипта.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз. Блоки самостоятельны: каждый читает файл заново.
#
# Вывод получен на Python 3.13, pandas 3.0 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файл по пути от корня папки с материалами: `data/eda/clients_export.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей. Туда же блок с картой пропусков сохранит `missing_map.csv` и `missing_map.svg`.

# %% code
import os
import pathlib
import platform

import matplotlib
import pandas as pd

root = pathlib.Path.cwd()
while not (root / "data" / "eda").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/eda/
assert (root / "data" / "eda" / "clients_export.csv").exists(), \
    "Не найдена папка data/eda/. Скачайте общий набор темы 07 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| pandas", pd.__version__, "| matplotlib", matplotlib.__version__)

# %% [markdown]
# ## Чек-лист первого взгляда

# %% page:checklist

# %% [markdown]
# ## Карта пропусков
#
# Блок сохраняет таблицу долей `missing_map.csv` и рисунок `missing_map.svg`. Ячейка под ним показывает рисунок.

# %% page:missmap

# %% code
from IPython.display import SVG

SVG(filename="missing_map.svg")

# %% [markdown]
# ## Три нюанса

# %% page:na

# %% page:dups

# %% page:dates

# %% [markdown]
# ## Черновик автоматического отчёта
#
# Этот блок страницы — в файле `profile_report.py` рядом с ноутбуком. Ему нужно отдельное окружение с pandas ниже 3.0; команды для установки и запуска записаны в начале файла.
