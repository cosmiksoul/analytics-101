# %% [markdown]
# # 8.4 График как аргумент — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 08 «Визуализация в Python» · страница 8.4.
#
# В ноутбуке пять блоков кода со страницы и файл стиля. Блоки идут подряд и пользуются общими переменными: выделение одной серии, прямые подписи у концов линий, аннотация события с заголовком-выводом, стиль из файла `textbook.mplstyle`, проверка палитр на дейтеранопию. Данные учебные: выручка магазина из общего набора темы `data/viz/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: каждый блок продолжает предыдущий.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные и файл стиля
#
# Код страницы читает данные по пути от корня папки с материалами: `data/viz/sales_monthly.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей.
#
# Файл стиля `textbook.mplstyle` лежит рядом с ноутбуком, а код страницы ищет его в рабочей папке. Первая ячейка кладёт туда копию. Туда же блоки сохранят рисунки `highlight.svg`, `labels.svg`, `annotated.svg` и `styled.svg`.

# %% code
import os
import pathlib
import platform
import shutil

import matplotlib
import numpy as np
import pandas as pd

here = pathlib.Path.cwd()                   # папка ноутбука: здесь лежит textbook.mplstyle
root = here
while not (root / "data" / "viz").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/viz/
assert (root / "data" / "viz" / "sales_monthly.csv").exists(), \
    "Не найдена папка data/viz/. Скачайте общий набор темы 08 и положите data/ рядом с папкой страницы"
os.chdir(root)
if not pathlib.Path("textbook.mplstyle").exists():
    shutil.copy(here / "textbook.mplstyle", "textbook.mplstyle")   # копия стиля в рабочую папку

print("Python", platform.python_version(), "| numpy", np.__version__, "| pandas", pd.__version__,
      "| matplotlib", matplotlib.__version__)

# %% [markdown]
# ## Код: от десяти линий к графику с выводом

# %% page:highlight

# %% page:labels

# %% page:annotate

# %% [markdown]
# ### Файл стиля textbook.mplstyle: всё оформление в одном месте
#
# Обычный текстовый файл: по строке на настройку `rcParams`. Следующий блок подключает его одной строкой.

# %% code
print(pathlib.Path("textbook.mplstyle").read_text(encoding="utf-8"))

# %% page:style

# %% page:palette
