# %% [markdown]
# # 11.2 Как спланировать A/B-тест
#
# Аналитика 101 · блок «Дата аналитика» · тема 11 «A/B-тестирование» · страница 11.2.
#
# Рассчитайте размер выборки для эффекта на уровне порога окупаемости, повторите расчёт в statsmodels и проверьте мощность моделированием. Заполненный план и шаблон лежат рядом в файле `test_design_template.md`. Данные учебные: показы и сессии экспериментов из общего набора темы `data/ab/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: каждый блок продолжает предыдущий.
#
# Вывод получен на Python 3.13, pandas 3.0, NumPy 2.5, SciPy 1.18 и statsmodels 0.15.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/ab/exposures.csv` и `data/ab/sessions.parquet`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей.

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
assert (root / "data" / "ab" / "exposures.csv").exists(), \
    "Не найдена папка data/ab/. Скачайте общий набор темы 11 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| pandas", pd.__version__, "| NumPy", np.__version__,
      "| SciPy", scipy.__version__, "| statsmodels", statsmodels.__version__)

# %% [markdown]
# ## Параметры расчёта и выборка
#
# Из таблиц исключены три аккаунта ботов. Правило отбора приведено в уроке 11.3.

# %% page:manual

# %% [markdown]
# ## Расчёт в statsmodels

# %% page:sm

# %% [markdown]
# ## Проверка мощности моделированием
#
# Зерно генератора зафиксировано: повторный запуск даёт тот же вывод.

# %% page:sim
