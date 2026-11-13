# %% [markdown]
# # 8.1 Устройство графика в Matplotlib — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 08 «Визуализация в Python» · страница 8.1.
#
# В ноутбуке весь код страницы. Сначала оба кода из «Анатомии графика»: один и тот же рисунок в объектном стиле и в стиле pyplot. Затем четыре блока раздела «Код»: график для публикации, сетка 2 × 2, функция-шаблон со стилем, pandas и seaborn. В конце четыре нюанса: dpi, шрифты и кириллица, даты на оси, второй `plt.plot`. Данные учебные: выручка магазина из общего набора темы `data/viz/` и дневные метрики из набора темы 07 `data/eda/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: блоки раздела «Код» и нюансы пользуются таблицами `sales` и `t` из «Анатомии».
#
# Вывод получен на Python 3.13, pandas 3.0, matplotlib 3.10 и seaborn 0.13.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает файлы по пути от корня папки с материалами: `data/viz/sales_monthly.csv` и `data/eda/daily_metrics.csv`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей.
#
# Туда же код сохранит свои картинки: `anatomy.png`, `revenue_yoy.png` и `.svg`, `grid.png`, папку `charts/` с десятью графиками и ещё десяток файлов из нюансов. Последняя ячейка ноутбука показывает их список.

# %% code
import os
import pathlib
import platform

import matplotlib
import pandas as pd
import seaborn

root = pathlib.Path.cwd()
while not (root / "data" / "viz").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/viz/
assert (root / "data" / "viz" / "sales_monthly.csv").exists(), \
    "Не найдена папка data/viz/. Скачайте общий набор темы 08 и положите data/ рядом с папкой страницы"
assert (root / "data" / "eda" / "daily_metrics.csv").exists(), \
    "Не найдена папка data/eda/. Для дат на оси нужен ещё общий набор темы 07"
os.chdir(root)
before = {p.name for p in root.iterdir()}   # что лежало в папке до запуска кода

print("Python", platform.python_version(), "| pandas", pd.__version__, "| matplotlib", matplotlib.__version__,
      "| seaborn", seaborn.__version__)

# %% [markdown]
# ## Анатомия графика: один рисунок двумя стилями
#
# Первый код называет фигуру и оси явно и вызывает методы осей. Второй обращается к «текущим» фигуре и осям через `plt`. Рисунок получается один и тот же.

# %% page:anatomy_oo

# %% page:anatomy_pyplot

# %% [markdown]
# Проверка утверждения страницы: файлы двух кодов совпадают попиксельно.

# %% code
a, b = plt.imread("anatomy.png"), plt.imread("anatomy_pyplot.png")
print(f"anatomy.png: {a.shape[1]} × {a.shape[0]} px | anatomy_pyplot.png: {b.shape[1]} × {b.shape[0]} px")
print("различающихся пикселей:", int((a != b).any(axis=2).sum()) if a.shape == b.shape else "размеры разные")

# %% [markdown]
# ## Код: от данных до файла

# %% page:pub

# %% page:grid

# %% page:tmpl

# %% page:sns

# %% [markdown]
# ### Возвращаем настройки
#
# На странице каждый блок запускался отдельным скриптом. В ноутбуке сессия одна: `sns.set_theme` поменял `rcParams` до её конца, а блок «С нуля до публикации» оставил текст в SVG текстом. Чтобы нюансы ниже дали те же числа, что на странице, возвращаем настройки Matplotlib по умолчанию.

# %% code
differ = lambda: sorted(k for k, v in plt.rcParams.items()
                        if v != matplotlib.rcParamsDefault[k] and k != "interactive")   # interactive — режим Jupyter, не оформление
print("настроек оформления, отличных от умолчания:", len(differ()))
plt.rcdefaults()
print("после plt.rcdefaults():", len(differ()))

# %% [markdown]
# ## Четыре нюанса

# %% page:dpi

# %% page:fonts free

# %% [markdown]
# В ноутбуке предупреждений больше, чем на странице: в конце ячейки Jupyter рисует обе фигуры ещё раз, чтобы показать их, и Matplotlib снова не находит Arial и кириллицу в cmr10. Путь перед `UserWarning` тоже другой — временный файл ячейки вместо `fonts.py`.

# %% page:dates

# %% page:twice

# %% [markdown]
# ### Тот же код двумя ячейками
#
# Разнесём две половины последнего блока по разным ячейкам. В конце ячейки встроенный вывод Jupyter показывает фигуру и закрывает её, поэтому второй `plt.plot` создаёт новую фигуру и новые оси.

# %% code
plt.plot(t.index, t["2024"])
plt.title("2024")
plt.savefig("y2024.png")

# %% code
plt.plot(t.index, t["2025"])
plt.title("2025")
plt.savefig("y2025.png")

print("открытых фигур:", plt.get_fignums())
print("линий на текущих осях:", len(plt.gca().lines))
print("заголовок:", plt.gca().get_title())

# %% [markdown]
# ## Что сохранил код
#
# Файлы и папки, которых не было в корне материалов до запуска ноутбука. Их можно удалить: код создаст их заново.

# %% code
made = sorted(p.name + ("/" if p.is_dir() else "") for p in root.iterdir() if p.name not in before)
print(len(made), "новых:", ", ".join(made))
