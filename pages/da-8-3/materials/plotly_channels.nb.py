# %% [markdown]
# # 8.3 Интерактив в Plotly — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 08 «Визуализация в Python» · страница 8.3.
#
# В ноутбуке семь блоков кода со страницы. Сначала четыре ячейки раздела «Код», они идут подряд и пользуются общими переменными: выручка каналов одной функцией `px`, своя подсказка, анимация по месяцам, экспорт в HTML, JSON, PNG и SVG. Затем три нюанса, тоже подряд: вес файла с миллионом точек, вывод в заголовке вместо подсказки, график для телефона и текстовая альтернатива. Данные учебные: выручка магазина из общего набора темы `data/viz/`.
#
# После блоков с подсказкой, анимацией и графиком для телефона добавлены ячейки `fig.show()`: на странице их нет, а в ноутбуке без них фигуру не увидеть.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз. Картинки PNG и SVG сохраняет пакет kaleido, ему нужен Chrome или Chromium. Если браузера на компьютере нет, его ставит команда `plotly_get_chrome`.
#
# Вывод получен на Python 3.13, NumPy 2.5, pandas 3.0, plotly 7.1 и kaleido 1.5.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файл по пути от корня папки с материалами: `data/viz/sales_monthly.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей.
#
# Туда же код сохранит свои файлы: `channels.html` (с библиотекой, почти 5 МБ), `channels_cdn.html`, `channels.json`, `channels.png`, `channels.svg`, `points.html` (миллион точек, 26 МБ), `plain.svg`, `titled.svg` и `mobile.html`. После работы их можно удалить.

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
# ## Код: от таблицы до файла

# %% page:express

# %% page:hover

# %% [markdown]
# Фигура с новой подсказкой. Наведите курсор на линию приложения в июле 2025 года.

# %% code
fig.show()

# %% page:anim

# %% [markdown]
# Анимация: кнопка ▶ под графиком проигрывает 24 месяца, ползунок выбирает месяц.

# %% code
fig_a.show()

# %% page:export

# %% [markdown]
# ## Три нюанса
#
# На странице нюансы — отдельный ноутбук. Здесь они идут следом в той же сессии: блок про заголовок заново читает данные и строит свою фигуру `fig`.

# %% page:weight

# %% page:title

# %% page:a11y

# %% [markdown]
# График для телефона: легенда снизу, панель инструментов скрыта, протяжка по графику не рисует рамку.

# %% code
fig.show(config={"displayModeBar": False})
