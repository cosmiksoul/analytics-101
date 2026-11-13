# %% [markdown]
# # 11.3 Анализ A/B-теста — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 11 «A/B-тестирование» · страница 11.3.
#
# В ноутбуке три блока кода страницы на pandas: от лога до отчёта — баланс, тесты, интервалы; дельта-метод для ratio-метрик; бутстрэп по пользователям и обрезка хвоста. Первый блок страницы — строка на пользователя на SQL — лежит рядом файлом `checkout_v2_users.sql`, ему нужен PostgreSQL. Шаблон отчёта — в `report_template.md`. Данные учебные: эксперимент checkout_v2 из общего набора темы `data/ab/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: каждый блок продолжает предыдущий. Последняя ячейка идёт около десяти секунд.
#
# Вывод получен на Python 3.13, pandas 3.0, NumPy 2.5, SciPy 1.18 и statsmodels 0.15.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/ab/sessions.parquet` и `data/ab/exposures.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей.

# %% code
import os
import pathlib
import platform

import numpy as np
import pandas as pd
import scipy
import statsmodels

root = pathlib.Path.cwd()
while not (root / "data" / "ab").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/ab/
assert (root / "data" / "ab" / "sessions.parquet").exists(), \
    "Не найдена папка data/ab/. Скачайте общий набор темы 11 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| pandas", pd.__version__, "| NumPy", np.__version__,
      "| SciPy", scipy.__version__, "| statsmodels", statsmodels.__version__)

# %% [markdown]
# ## Код: от лога до отчёта

# %% page:full

# %% [markdown]
# ## Код: дельта-метод для ratio-метрик

# %% page:delta

# %% [markdown]
# ## Код: бутстрэп по пользователям и обрезка хвоста
#
# Зерно генератора зафиксировано, 2 000 перевыборок на группу: повторный запуск даёт те же числа.

# %% page:boot
