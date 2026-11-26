# %% [markdown]
# # 8.3 Интерактив в Plotly — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 08 «Визуализация в Python» · страница 8.3.
#
# В первых четырёх примерах вы построите график выручки пяти каналов, настроите подсказку, создадите анимацию по месяцам и сохраните график в нескольких форматах. Ещё три примера показывают, как меняется размер HTML с числом точек, как подписать суммы на изображении и как добавить к графику таблицу для чтения на телефоне.
#
# Ячейки с методом `show()` показывают готовые графики в ноутбуке. В первой из них попробуйте найти выручку приложения за июль 2025 года.
#
# **Как работать.** Выполняйте ячейки сверху вниз. Для сохранения PNG и SVG пакету Kaleido понадобится Chrome или Chromium. Установить совместимый Chrome можно командой `plotly_get_chrome`.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0, plotly 7.1 и kaleido 1.5.

# %% [markdown]
# ## Где лежат данные
#
# Распакуйте общий набор данных темы так, чтобы каталог `data/viz/` находился рядом с папкой урока. Первая ячейка найдёт каталог с файлом `sales_monthly.csv` и выберет рабочую папку.
#
# В рабочей папке появятся девять файлов — `channels.html` (с библиотекой, почти 5 МБ), `channels_cdn.html`, `channels.json`, `channels.png`, `channels.svg`, `points.html` (миллион точек, 26 МБ), `plain.svg`, `titled.svg` и `mobile.html`. После работы их можно удалить.

# %% code
import os
import pathlib
import platform
from importlib.metadata import version

import numpy as np
import pandas as pd
import plotly

root = pathlib.Path.cwd()
while not (root / "data" / "viz").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/viz/
assert (root / "data" / "viz" / "sales_monthly.csv").exists(), \
    "Не найдена папка data/viz/. Скачайте общий набор темы 08 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| numpy", np.__version__, "| pandas", pd.__version__,
      "| plotly", plotly.__version__, "| kaleido", version("kaleido"))

# %% [markdown]
# ## От таблицы до готового графика

# %% page:express

# %% page:hover

# %% [markdown]
# Наведите курсор на июльскую точку 2025 года на линии приложения. В подсказке появятся сумма и доля приложения в выручке магазина за месяц.

# %% code
fig.show()

# %% page:anim

# %% [markdown]
# Нажмите ▶, чтобы просмотреть 24 месяца по порядку, или выберите нужный месяц ползунком.

# %% code
fig_a.show()

# %% page:export

# %% [markdown]
# ## Размер файла, подписи и просмотр на телефоне
#
# Следующие три примера выполняются в том же сеансе Python. В примере про заголовок мы заново прочитаем данные и построим линейный график.

# %% page:weight

# %% page:title

# %% page:a11y

# %% [markdown]
# На графике для телефона легенда расположена снизу. Вертикальным жестом можно прокрутить страницу. Откройте файл `mobile.html`, чтобы прочитать описание графика и полную таблицу с выручкой за 24 месяца.

# %% code
fig.show(config={"displayModeBar": False})
