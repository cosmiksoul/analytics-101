# %% [markdown]
# # 8.1 Устройство графика в Matplotlib — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 08 «Визуализация в Python» · страница 8.1.
#
# Сравните два способа построить график выручки, затем подготовьте рисунок для публикации. В следующих ячейках вы соберёте сетку из четырёх графиков, примените одно оформление к десяти каналам и сравните результаты pandas и seaborn. В конце можно проверить, как на рисунок влияют разрешение, выбор шрифта, формат дат и повторный вызов `plt.plot`.
#
# Выполняйте ячейки сверху вниз. Для примеров понадобятся таблицы `sales` и `t`, которые создаются в начале ноутбука.
#
# Вывод получен на Python 3.13, pandas 3.0, matplotlib 3.10 и seaborn 0.13.

# %% [markdown]
# ## Где лежат данные
#
# Скачайте общие данные тем 7 и 8. Папка `data` должна находиться рядом с папкой урока. Первая ячейка найдёт оба файла и выберет рабочую папку.
#
# В этой папке появятся изображения из примеров. Десять графиков по каналам будут сохранены в подпапке `charts`. Последняя ячейка выведет список новых файлов и папок.

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
# ## Два способа построить один график
#
# В первом примере команды обращаются к объектам `fig` и `ax`. Во втором функции pyplot используют текущую фигуру и текущую область построения. Сравните получившиеся изображения.

# %% page:anatomy_oo

# %% page:anatomy_pyplot

# %% [markdown]
# Сравним размеры изображений и посчитаем, сколько пикселей в них различаются.

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
# На странице примеры выполнялись по отдельности. Здесь они работают в одной сессии. Например, вызов `sns.set_theme` изменил настройки оформления, а пример с публикацией задал формат текста для SVG. Восстановим стандартные настройки перед следующим сравнением.

# %% code
differ = lambda: sorted(k for k, v in plt.rcParams.items()
                        if v != matplotlib.rcParamsDefault[k] and k != "interactive")   # interactive — режим Jupyter, не оформление
print("настроек оформления, отличных от умолчания:", len(differ()))
plt.rcdefaults()
print("после plt.rcdefaults():", len(differ()))

# %% [markdown]
# ## Разрешение, шрифты, даты и текущая фигура

# %% page:dpi

# %% page:fonts free

# %% [markdown]
# Встроенный вывод Jupyter может повторно отрисовать фигуру в конце ячейки. Поэтому сообщения об отсутствующем шрифте и неподдерживаемых символах иногда появляются несколько раз. В сообщении также может быть указан путь к временному файлу ячейки.

# %% page:dates

# %% page:twice

# %% [markdown]
# ### Тот же код двумя ячейками
#
# Выполним код для каждого года в отдельной ячейке. При стандартных настройках встроенного вывода inline Jupyter показывает и закрывает фигуры после ячейки. В следующей ячейке `plt.plot` создаст новую область построения.

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
