# Устройство графика в Matplotlib

Аналитика 101 · блок «Дата аналитика», тема 08 «Визуализация в Python», страница 8.1.

График в Matplotlib — дерево объектов: фигура, на ней оси, в осях линии и подписи. После страницы вы будете знать, что такое fig и ax и куда рисует plt.plot, и соберёте график от таблицы до файла PNG или SVG без заклинаний из интернета.

## Анимация по шагам

1. **Десять строк — один график.** Код под графиком строит выручку магазина по месяцам: 2025 год против 2024-го. На картинке — две линии, а в памяти Python — дерево из 168 объектов. Разберём его по слоям, как луковицу, и для каждого слоя найдём строку, которая его создала.

2. **Пять слоёв.** Внизу лист — фигура. На нём оси с делениями и сеткой, выше — линии данных, подписи и легенда. Каждый слой — отдельные объекты Python со своими методами. Цветные метки у строк кода показывают, какой слой трогает строка.

3. **Figure — лист.** Первая строка возвращает две ссылки. fig — фигура: лист 8 × 4,5 дюйма с фоном. При dpi 100 это 800 × 450 пикселей. Сама фигура линий не рисует: они живут в осях.

4. **Axes — область данных.** Вторая ссылка, ax, — оси (Axes): прямоугольник, внутри которого числа становятся координатами. Рамка — четыре объекта Spine. Почти всё рисование дальше — методы ax.

5. **Axis — деления и сетка.** Внутри Axes две оси, XAxis и YAxis. Их настраивают три строки: месяцы на X, пределы 0–45 на Y и сетка. Здесь больше всего объектов: у каждого из 22 делений засечки, подписи и линия сетки, видимые или нет. Слои идут не по порядку строк: set_xticks стоит после plot, но меняет ось.

6. **Line2D — данные.** ax.plot кладёт в эти оси объект Line2D — ломаную из 12 точек. Цвет C0 взят из цикла цветов в настройках по умолчанию.

7. **Вторая линия.** Второй ax.plot — вторая Line2D в те же оси, цвет — следующий в цикле, C1. Подписи label="2024" и label="2025" пока не видны: их заберёт легенда.

8. **Заголовок — объект Text.** set_title не создаёт объект, а пишет строку в готовый. У Axes три места под заголовок — слева, по центру и справа, и все три Text появились вместе с осями, пустыми.

9. **Подпись оси принадлежит оси.** set_ylabel пишет в ax.yaxis.label — Text, который принадлежит оси Y, а не Axes. Подпись оси X тоже существует, только пустая.

10. **Legend собирает label=.** ax.legend() создаёт Legend: рамку, два образца линий и две подписи — 17 объектов вместе со служебными контейнерами. Подписи взяты из label= двух линий.

11. **savefig рисует всё дерево.** fig.savefig обходит дерево от фигуры к листьям и рисует каждый объект в файл. Строк — 10, объектов — 168, и у каждого есть адрес: fig, ax, ax.lines[0], ax.title.

## Идея: фигура, оси и дерево художников

График в Matplotlib — не картинка, а дерево объектов. Корень — фигура (Figure), лист с размером и фоном; на нём оси (Axes) — область с координатами, а в осях линии, деления, подписи и легенда, и каждый из них — объект-художник (Artist). Рисовать значит вызывать методы нужного объекта: ax.plot кладёт линию в эти оси, fig.savefig сохраняет весь лист. Модуль pyplot делает то же самое, но сам выбирает «текущие» оси, поэтому plt.plot иногда рисует не туда, куда вы ждали.

Figure, Axes, Axis: три слова, которые путают

Figure — вся картинка: размер в дюймах (figsize), плотность пикселей (dpi), фон и список осей. Одна фигура — один файл. Axes — прямоугольная область внутри фигуры, где данные превращаются в координаты, со своими пределами, заголовком и двумя осями. Рисовать умеет именно Axes: plot, bar и scatter — её методы[1].

Axis, без «e» на конце, — одна ось: XAxis или YAxis. Она хранит деления (Tick) и двух помощников: локатор решает, где поставить деления, форматтер — как их подписать[1]. По-английски axes — множественное число от axis, отсюда путаница; в русских текстах Axes называют осями или областью построения.

Всё нарисованное — художники: линия Line2D, текст Text, прямоугольник Patch, легенда Legend, даже сами фигура и оси. Схема всех частей с подписями есть в галерее Matplotlib[2]. В графике из анимации 168 художников, и 132 из них — деления с их частями: у каждого засечки, подписи и линия сетки, видимые или нет.

Объект | Что это | Как достать | Пример метода

Figure | лист целиком | fig, plt.gcf() | fig.savefig

Axes | область данных | ax, plt.gca() | ax.plot

Axis | одна ось с делениями | ax.xaxis, ax.yaxis | set_major_formatter

Artist | всё нарисованное | ax.lines[0], ax.title | set_color, set_visible

pyplot и объектный интерфейс

pyplot — модуль matplotlib.pyplot, который импортируют как plt. Он работает как машина состояний: помнит текущую фигуру и текущие оси и отправляет туда каждую команду[3]. plt.title("…") — это plt.gca().set_title("…"), где gca значит «get current axes»: взять текущие оси, а если их нет — создать.

Объектный интерфейс обходится без «текущего»: вы держите ссылки fig и ax и вызываете их методы. Документация Matplotlib советует объектный стиль для сложных графиков, функций и скриптов, а pyplot — для быстрой работы в интерактивном режиме[1]. Разница видна, как только графиков два: явный ax не перепутать, а текущие оси меняет любой вызов. Мостик между стилями — одна строка fig, ax = plt.subplots(): она создаёт фигуру с осями и возвращает обе ссылки.

Четыре основных типа

Все четыре — методы Axes, и каждый отвечает на свой вопрос. Все вместе на одной сетке — в разделе «Код», выбор типа под вопрос — тема страницы 8.2.

Метод | Что рисует | На какой вопрос | Что возвращает

ax.plot | линию по точкам | как менялось во времени | список Line2D

ax.bar | столбцы | у кого больше | BarContainer

ax.scatter | облако точек | связаны ли две величины | PathCollection

ax.hist | столбцы частот | как распределены значения | частоты, границы, столбцы

Сетка графиков

plt.subplots(2, 2) создаёт фигуру и сразу четыре Axes и возвращает их массивом NumPy: axes[0, 1] — верхний правый. Параметры sharex и sharey делают оси общими: у связанных графиков одинаковые пределы, а подписи делений остаются только у крайних; sharex="col" связывает оси внутри каждого столбца[4]. layout="constrained" раздвигает графики, чтобы подписи не налезали друг на друга.

Подписи, пределы, формат осей и дат

Заголовок, подписи осей и пределы — методы Axes с приставкой set_: set_title, set_xlabel, set_ylabel, set_xlim, set_ylim, set_xticks. Формат подписей задаёт форматтер оси: ax.yaxis.set_major_formatter("{x:.0f} млн ₽") допишет единицы к каждому делению. Для дат в модуле matplotlib.dates есть свои локаторы и форматтеры[5], о них — в нюансах.

Стиль и сохранение в PNG и SVG

Всё, что не указано в вызове, Matplotlib берёт из rcParams — словаря настроек по умолчанию: размер фигуры, шрифт, толщина линий, цикл цветов, dpi при сохранении. Стиль — набор таких настроек под одним именем: plt.style.use("ggplot") меняет вид всех следующих графиков, а with plt.style.context(…) — только внутри блока[6].

fig.savefig("chart.png", dpi=200) пишет растровую картинку — сетку пикселей фиксированного размера. fig.savefig("chart.svg") пишет векторную: линии и текст хранятся как описание фигур и остаются чёткими при любом увеличении[7]. PNG — для писем, мессенджеров и слайдов, SVG — для веба и вёрстки, где картинку масштабируют.

pandas и seaborn — надстройки над Matplotlib

Метод .plot у таблиц pandas — тонкая обёртка над Matplotlib[9]: t.plot() рисует каждую колонку линией и возвращает обычные Axes. seaborn строит статистические графики одной строкой: сам группирует длинную таблицу, считает среднее и рисует полосу доверительного интервала[10]. Его функции вроде sns.lineplot тоже рисуют в Axes и возвращают их, а без аргумента ax= берут текущие оси через plt.gca(). Заголовок и формат дальше настраивают как обычно.

## Задача: перестать копировать заклинания

Аналитик знает, что график строится тремя строками: plt.figure, plt.plot, plt.show. Где-то рядом живёт fig, ax = plt.subplots() из ответа на Stack Overflow. Пока график один, всё работает. Потом в ноутбуке появляется цикл по каналам продаж, линия второго канала ложится на график первого, а заголовок оказывается не над тем графиком.

Задача страницы — разобрать график на объекты, понять, что такое fig и ax, и писать код так, чтобы было видно, в какие оси он рисует. Данные учебные: выручка интернет-магазина за 2024–2025 годы, файл sales_monthly.csv на 960 строк «месяц × канал × страна».

## Анатомия: элемент графика ↔ строка кода

Ниже тот же график, что в анимации, и два кода, которые его строят: объектный и на pyplot. Наведите курсор на любую часть картинки — подсветится строка, которая её создала; наведите на строку — подсветится то, что она нарисовала. Сначала ответьте на вопрос.

Оба кода запущены в Matplotlib 3.10.0, и их PNG совпали попиксельно: 800 × 450, ни одного различия. Разница в том, кто знает про оси. В объектном коде ax создан явно в первой строке. В коде на pyplot оси не создаёт никто: их создаёт первый plt.plot, когда спрашивает plt.gca() и не находит текущих.

pyplot | Объектный стиль

plt.figure(figsize=…) | fig, ax = plt.subplots(figsize=…)

plt.plot, plt.bar | ax.plot, ax.bar

plt.title, plt.ylabel | ax.set_title, ax.set_ylabel

plt.ylim, plt.xticks | ax.set_ylim, ax.set_xticks

plt.legend, plt.grid | ax.legend, ax.grid

plt.savefig | fig.savefig

Правило перевода: у функций pyplot нет приставки set_, у методов Axes она есть. Не смешивайте стили в одном графике: plt.title после ax.plot попадёт в текущие оси, а это не обязательно ваш ax.

## Нюансы: размер, шрифты, даты, ячейки

Код нюансов продолжает код «Анатомии»: sales, t и MONTHS берутся оттуда.

Размер фигуры и dpi. figsize задаёт размер в дюймах, dpi — сколько пикселей приходится на дюйм. Размер PNG — их произведение: 8 × 4,5 дюйма при dpi 100 дают 800 × 450 пикселей, при dpi 200 — 1600 × 900. Шрифт задан в пунктах (1/72 дюйма), поэтому с ростом dpi текст растёт вместе с картинкой, а с ростом figsize мельчает относительно неё. savefig по умолчанию берёт dpi фигуры, а bbox_inches="tight" обрезает пустые поля и меняет итоговый размер[7].

Кириллица и шрифты. Шрифт по умолчанию — DejaVu Sans, кириллица в нём есть[8], и русские подписи работают сразу. Проблемы начинаются, когда в rcParams просят шрифт, которого нет в системе: Matplotlib пишет findfont: … not found и подставляет DejaVu Sans. Хуже, если шрифт есть, но без кириллицы: вместо букв выйдут пустые квадраты, а в выводе — предупреждения о пропавших глифах. Ставьте в font.family шрифт, который точно установлен; в Colab и на сервере надёжнее всего DejaVu Sans.

Даты на оси. Если дата осталась строкой (в pandas 3 это тип str), Matplotlib считает каждую строку отдельной категорией: 86 дней — 86 делений через равные промежутки. Подписи слипаются, а потерянные дни исчезают без следа: 9 и 14 февраля стоят рядом. После pd.to_datetime ось становится временной: пропуск занимает своё место, а деления расставляют MonthLocator и DateFormatter[5]. ConciseDateFormatter подбирает краткие подписи сам, но названия месяцев по умолчанию пишет по-английски.

Один график — одна ячейка ноутбука. В Jupyter встроенный бэкенд показывает фигуру в конце ячейки и закрывает её, поэтому следующая ячейка начинает с чистого листа. В скрипте и внутри одной ячейки фигура остаётся открытой: второй plt.plot ложится на первый график, а plt.title переписывает заголовок. Правило: один график — одна ячейка, а в цикле — свой fig, ax = plt.subplots() на каждом шаге и plt.close(fig) после сохранения.

**Один figsize, разные dpi: сколько пикселей в PNG**

```python
# t — из кода «Анатомии графика»
import os

fig, ax = plt.subplots(figsize=(8, 4.5))      # размер в дюймах
ax.plot(t.index, t["2025"])
ax.set_title("Выручка 2025 года, млн ₽")
print("figsize:", fig.get_size_inches(), "дюйма, dpi фигуры:", fig.dpi)

for dpi in (72, 100, 200):
    fig.savefig(f"chart_{dpi}.png", dpi=dpi)
    h, w, _ = plt.imread(f"chart_{dpi}.png").shape
    print(f"PNG, dpi={dpi:>3}: {w}×{h} px, {os.path.getsize(f'chart_{dpi}.png') / 1024:.0f} КБ")

fig.savefig("chart_tight.png", bbox_inches="tight")
h, w, _ = plt.imread("chart_tight.png").shape
print(f"PNG, bbox_inches='tight': {w}×{h} px — пустые поля обрезаны")

fig.savefig("chart.svg")
print(f"SVG: {os.path.getsize('chart.svg') / 1024:.0f} КБ, 576×324 pt, чёткий при любом масштабе")
```

Вывод:

```
figsize: [8.  4.5] дюйма, dpi фигуры: 100.0
PNG, dpi= 72: 576×324 px, 14 КБ
PNG, dpi=100: 800×450 px, 22 КБ
PNG, dpi=200: 1600×900 px, 54 КБ
PNG, bbox_inches='tight': 667×412 px — пустые поля обрезаны
SVG: 19 КБ, 576×324 pt, чёткий при любом масштабе
```

**Кириллица: шрифта нет — подмена, глифа нет — квадратики**

```python
# plt — из кода «Анатомии графика»
from pathlib import Path

import matplotlib as mpl
from matplotlib import font_manager

print("по умолчанию:", Path(font_manager.findfont("DejaVu Sans")).name)

with mpl.rc_context({"font.family": "Arial"}):     # такого шрифта в системе нет
    fig, ax = plt.subplots()
    ax.set_title("Выручка, млн ₽")
    fig.canvas.draw()
    print("вместо Arial:", ax.title.get_fontname())

with mpl.rc_context({"font.family": "cmr10"}):     # шрифт есть, но без кириллицы
    fig, ax = plt.subplots()
    ax.set_title("Выручка, млн ₽")
    fig.canvas.draw()
    print("cmr10: заголовок нарисован, буквы — пустыми квадратами")
```

Вывод:

```
по умолчанию: DejaVuSans.ttf
findfont: Font family 'Arial' not found.
… та же строка ещё 21 раз
findfont: Font family ['Arial'] not found. Falling back to DejaVu Sans.
вместо Arial: DejaVu Sans
fonts.py:18: UserWarning: Glyph 1042 (\N{CYRILLIC CAPITAL LETTER VE}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 1099 (\N{CYRILLIC SMALL LETTER YERU}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 1088 (\N{CYRILLIC SMALL LETTER ER}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 1091 (\N{CYRILLIC SMALL LETTER U}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 1095 (\N{CYRILLIC SMALL LETTER CHE}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 1082 (\N{CYRILLIC SMALL LETTER KA}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 1072 (\N{CYRILLIC SMALL LETTER A}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 1084 (\N{CYRILLIC SMALL LETTER EM}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 1083 (\N{CYRILLIC SMALL LETTER EL}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 1085 (\N{CYRILLIC SMALL LETTER EN}) missing from font(s) cmr10.
fonts.py:18: UserWarning: Glyph 8381 (\N{RUBLE SIGN}) missing from font(s) cmr10.
cmr10: заголовок нарисован, буквы — пустыми квадратами
```

**Даты на оси: строки против дат**

```python
# plt, pd — из кода «Анатомии графика»
import matplotlib.dates as mdates

d = pd.read_csv("data/eda/daily_metrics.csv")   # 86 дней, 10–13 февраля выгрузка потеряна
print(d["date"].dtype, len(d))

fig, (top, bottom) = plt.subplots(2, 1, figsize=(8, 4.6), layout="constrained")
top.plot(d["date"], d["revenue"] / 1e3)            # строки: каждая дата — отдельная категория
top.set_title("Даты строками: 86 подписей слиплись, пропуск февраля исчез")

d["date"] = pd.to_datetime(d["date"])              # теперь это даты
bottom.plot(d["date"], d["revenue"] / 1e3)
bottom.xaxis.set_major_locator(mdates.MonthLocator(bymonthday=[1, 15]))
bottom.xaxis.set_major_formatter(mdates.DateFormatter("%d.%m"))
bottom.set_title("Даты датами: деления 1-го и 15-го, пропуск виден прямым отрезком")
for ax in (top, bottom):
    ax.set_ylabel("тыс. ₽")
fig.savefig("dates.png", dpi=150)

print("делений сверху:", len(top.get_xticks()), "| снизу:", len(bottom.get_xticks()))
```

Вывод:

```
str 86
делений сверху: 86 | снизу: 7
```

**Второй plt.plot ложится на первый график**

```python
# t — из кода «Анатомии графика»; всё ниже — одна ячейка или один скрипт
plt.plot(t.index, t["2024"])
plt.title("2024")
plt.savefig("y2024.png")

plt.plot(t.index, t["2025"])         # хотели второй, отдельный график
plt.title("2025")
plt.savefig("y2025.png")

print("открытых фигур:", plt.get_fignums())
print("линий на текущих осях:", len(plt.gca().lines))
print("заголовок:", plt.gca().get_title())
```

Вывод:

```
открытых фигур: [1]
линий на текущих осях: 2
заголовок: 2025
```

## Ограничения: десятки графиков без шаблона расползаются

Код одного графика — 10–15 строк. Десять графиков по каналам, скопированные десять раз, — 150 строк, где через неделю разъедутся цвета, пределы и подписи: в одном месте заголовок поправили, в другом забыли. Matplotlib от этого не защищает: каждая настройка — отдельный вызов.

Выход — функция-шаблон. Она принимает ax и данные, рисует и возвращает ax, а стиль живёт отдельно, в словаре rcParams, который включают через plt.style.context. Фигуру функция не создаёт, поэтому одна и та же функция рисует и отдельный график, и ячейку сетки 2 × 2. Пример — в разделе «Код», файл стиля .mplstyle — на странице 8.4.

## Код: от одного графика до шаблона

Блоки запущены в Python 3.13 с Matplotlib 3.10.0; рисунок под блоком — SVG той же фигуры, что сохранил код, с текстом в виде текста. Первый блок самостоятельный, остальные — ячейки того же ноутбука: sales, t и MONTHS — из кода «Анатомии».

Шесть шагов — шесть абзацев кода: данные, фигура и оси, линии, оси, подписи, файл. svg.fonttype = "none" оставляет в SVG текст текстом: его можно найти поиском и поправить в редакторе, но на чужом компьютере он нарисуется установленным там шрифтом[8].

Слева общая ось — даты: столбцы приложения стоят ровно под точками линии. Справа общая ось — выручка канала за месяц: гистограмма под облаком показывает, где точки гуще. Подписи делений у верхних графиков Matplotlib спрятал сам, а fig.suptitle подписал всю фигуру, а не одни оси.

Стиль — словарь, функция — рисование на переданных осях, цикл — данные. Чтобы поменять цвет у всех десяти графиков, хватит одной правки в TEXTBOOK.

pandas нарисовал таблицу t, где каждая колонка — линия. seaborn взял длинную таблицу из 960 строк и сам сложил 40 строк каждого месяца: 10 каналов × 4 страны. Без estimator="sum" он бы их усреднил и добавил полосу 95-процентного доверительного интервала из темы 06 — а это уже график про средний канал в средней стране.

**С нуля до публикации: данные → фигура → оси → подписи → файл**

```python
import os

import matplotlib.pyplot as plt
import pandas as pd

plt.rcParams["svg.fonttype"] = "none"   # в SVG текст остаётся текстом, а не кривыми

# 1. Данные: 960 строк «месяц × канал × страна» → таблица «месяц × год», млн ₽
sales = pd.read_csv("data/viz/sales_monthly.csv")
sales["year"] = sales["month"].str[:4]
sales["m"] = sales["month"].str[5:].astype(int)
t = sales.pivot_table(index="m", columns="year",
                      values="revenue", aggfunc="sum") / 1e6
MONTHS = "янв фев мар апр май июн июл авг сен окт ноя дек".split()

# 2. Фигура и оси — явно, в одну строку
fig, ax = plt.subplots(figsize=(8, 4.5), layout="constrained")

# 3. Данные: прошлый год серым, текущий — акцентом
ax.plot(t.index, t["2024"], color="#9aa3b2", linewidth=1.5, label="2024")
ax.plot(t.index, t["2025"], color="#0d7468", linewidth=2.5, label="2025")

# 4. Оси: деления, пределы, формат подписей
ax.set_xticks(t.index, MONTHS)
ax.set_ylim(0, 50)
ax.yaxis.set_major_formatter("{x:.0f} млн ₽")
ax.spines[["top", "right"]].set_visible(False)
ax.grid(axis="y", color="#dde1e8")

# 5. Подписи: заголовок-вывод, легенда без рамки, источник
ax.set_title("Выручка 2025 года выше 2024-го в каждом месяце, с июня — на 11–18%",
             loc="left", fontweight="bold")
ax.legend(frameon=False, loc="lower right", ncols=2)
fig.supxlabel("Учебные данные магазина: sales_monthly.csv, все каналы и страны",
              x=0.01, ha="left", fontsize=8, color="#737c8f")   # строка под всей фигурой

# 6. Сохранение: PNG для слайда и письма, SVG для статьи
fig.savefig("revenue_yoy.png", dpi=200)
fig.savefig("revenue_yoy.svg")

growth = t["2025"] / t["2024"] - 1
print(t.round(1).T[[1, 5, 6, 12]])
print(f"рост с июня: {growth.loc[6:].min():.1%} … {growth.loc[6:].max():.1%}")
for f in ("revenue_yoy.png", "revenue_yoy.svg"):
    print(f, round(os.path.getsize(f) / 1024), "КБ")
```

Вывод:

```
m       1     5     6     12
year                        
2024  34.7  28.3  27.3  35.2
2025  35.5  29.5  30.2  41.7
рост с июня: 10.7% … 18.4%
revenue_yoy.png 76 КБ
revenue_yoy.svg 16 КБ
```

**Сетка 2 × 2: четыре типа графика и общая ось у каждого столбца**

```python
# sales, pd, plt — из кода «Анатомии графика»
import matplotlib.dates as mdates

ym = sales.groupby("month")["revenue"].sum() / 1e6                     # 24 месяца
app = sales[sales["channel"] == "приложение"].groupby("month")["revenue"].sum() / 1e6
dates = pd.to_datetime(ym.index)                                       # строки → даты
cm = sales.pivot_table(index=["channel", "m"], columns="year",
                       values="revenue", aggfunc="sum") / 1e6          # канал × месяц

fig, axes = plt.subplots(2, 2, figsize=(10, 6), sharex="col", layout="constrained")

axes[0, 0].plot(dates, ym)                                   # линия: динамика
axes[0, 0].set_title("Выручка магазина растёт, пик — в декабре")
axes[1, 0].bar(dates, app, width=20)                         # столбцы: сравнение
axes[1, 0].set_title("Приложение удвоилось с июня 2025")
axes[1, 0].xaxis.set_major_locator(mdates.MonthLocator(bymonth=[1, 7]))
axes[1, 0].xaxis.set_major_formatter(mdates.DateFormatter("%m.%Y"))     # 01.2025

axes[0, 1].scatter(cm["2024"], cm["2025"], s=12)             # рассеяние: связь
axes[0, 1].axline((0, 0), slope=1, color="grey", linewidth=0.8)
axes[0, 1].set_title("2025-й больше 2024-го в 94 точках из 120")
axes[0, 1].set_ylabel("тот же канал и месяц 2025, млн ₽")
axes[1, 1].hist(cm["2024"], bins=12)                         # гистограмма: распределение
axes[1, 1].set_title("Половина значений — меньше 2 млн ₽ в месяц")
axes[1, 1].set_xlabel("выручка канала за месяц 2024, млн ₽")

fig.suptitle("Магазин растёт за счёт приложения: четыре взгляда на одни данные")   # заголовок фигуры
fig.savefig("grid.png", dpi=150)

print(type(axes).__name__, axes.shape)
print("общая ось X слева:", axes[0, 0].get_xlim() == axes[1, 0].get_xlim())
print("общая ось X справа:", axes[0, 1].get_xlim() == axes[1, 1].get_xlim())
print("подписи делений у верхнего левого:", axes[0, 0].xaxis.get_tick_params()["labelbottom"])
print(f"выше диагонали: {(cm['2025'] > cm['2024']).sum()} из {len(cm)}, меньше 2 млн: {(cm['2024'] < 2).sum()}")
```

Вывод:

```
ndarray (2, 2)
общая ось X слева: True
общая ось X справа: True
подписи делений у верхнего левого: False
выше диагонали: 94 из 120, меньше 2 млн: 60
```

**Функция-шаблон и стиль учебника: десять одинаковых графиков за один цикл**

```python
# sales, MONTHS — из кода «Анатомии графика»
from pathlib import Path

from cycler import cycler

TEXTBOOK = {                                   # стиль учебника: один словарь rcParams
    "figure.figsize": (7, 3.4),
    "font.size": 10,
    "axes.titlesize": 12,
    "axes.titleweight": "bold",
    "axes.titlelocation": "left",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.edgecolor": "#737c8f",
    "axes.grid": True,
    "axes.grid.axis": "y",
    "grid.color": "#dde1e8",
    "axes.prop_cycle": cycler(color=["#9aa3b2", "#0d7468"]),
    "legend.frameon": False,
    "savefig.dpi": 200,
    "savefig.bbox": "tight",
}


def yoy_chart(ax, t, title, unit="млн ₽"):
    """Год к году: линия на каждый год, месяцы по оси X, запятая в дробях."""
    for year in t.columns:
        ax.plot(t.index, t[year], label=year, linewidth=2.5 if year == t.columns[-1] else 1.5)
    ax.set_xticks(t.index, MONTHS)
    ax.set_ylim(0, t.max().max() * 1.2)
    ax.yaxis.set_major_formatter(lambda x, pos: f"{x:g}".replace(".", ","))
    ax.set_ylabel(unit)
    ax.set_title(title)
    ax.legend(loc="lower right", ncols=2)
    return ax


by_ch = sales.pivot_table(index=["channel", "m"], columns="year",
                          values="revenue", aggfunc="sum") / 1e6
Path("charts").mkdir(exist_ok=True)
with plt.style.context(TEXTBOOK):              # стиль действует только внутри with
    for i, ch in enumerate(by_ch.index.unique("channel")):
        tc = by_ch.loc[ch]
        delta = round(tc["2025"].sum() / tc["2024"].sum() - 1, 2) + 0   # + 0 убирает «−0»
        delta = f"{delta:+.0%}".replace("-", "−")
        fig, ax = plt.subplots()
        yoy_chart(ax, tc, f"{ch.capitalize()}: {delta} к 2024 году")
        fig.savefig(f"charts/{i:02d}.png")
        plt.close(fig)                         # десятки фигур не копятся в памяти
        print(f"charts/{i:02d}.png  {ax.get_title(loc='left')}")
print("открытых фигур:", len(plt.get_fignums()))
```

Вывод:

```
charts/00.png  Кешбэк-сервисы: +3% к 2024 году
charts/01.png  Колл-центр: −20% к 2024 году
charts/02.png  Маркетплейс: +0% к 2024 году
charts/03.png  Офлайн-точки: +5% к 2024 году
charts/04.png  Партнёры: +8% к 2024 году
charts/05.png  Поиск: +6% к 2024 году
charts/06.png  Приложение: +66% к 2024 году
charts/07.png  Рассылка: +12% к 2024 году
charts/08.png  Сайт: +5% к 2024 году
charts/09.png  Соцсети: +2% к 2024 году
открытых фигур: 0
```

**Тот же график в pandas и seaborn: обе обёртки возвращают Axes**

```python
# sales, t, MONTHS — из кода «Анатомии графика»
import seaborn as sns

sns.set_theme(style="whitegrid")       # меняет rcParams: так теперь выглядят все графики
sales["mln"] = sales["revenue"] / 1e6

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 3.6), sharey=True, layout="constrained")
t.plot(ax=ax1, title="pandas: t.plot(ax=ax1)")                    # таблица «месяц × год»
sns.lineplot(data=sales, x="m", y="mln", hue="year",               # длинная таблица, 960 строк
             estimator="sum", errorbar=None, ax=ax2)
ax2.set_title('seaborn: lineplot(estimator="sum")')
for ax in (ax1, ax2):
    ax.set_xticks(range(1, 13), MONTHS)
    ax.set_xlabel("")
    ax.set_ylim(0, 45)
fig.suptitle("pandas и seaborn нарисовали одно и то же и вернули обычные Axes")
fig.savefig("pandas_vs_seaborn.png", dpi=150)

print(type(ax1).__name__, type(ax2).__name__)
print("seaborn, январь:", ax2.lines[0].get_ydata()[0].round(2), "| pandas:", t.loc[1, "2024"].round(2))
fig2, ax3 = plt.subplots()
sns.lineplot(data=sales, x="m", y="mln", hue="year", ax=ax3)       # без estimator
print("по умолчанию, январь:", ax3.lines[0].get_ydata()[0].round(2),
      "— среднее 40 строк, полос интервала:", len(ax3.collections))
```

Вывод:

```
Axes Axes
seaborn, январь: 34.72 | pandas: 34.72
по умолчанию, январь: 0.87 — среднее 40 строк, полос интервала: 2
```

## Вопросы для самопроверки

1. В pyplot-коде нет строки, которая явно создаёт оси (Axes). Какая строка их создаёт?
   А) plt.figure(figsize=(8, 4.5))
   Б) Первый plt.plot(...)
   В) plt.xticks(t.index, MONTHS)
   Г) Никакая: pyplot рисует линии прямо на фигуре

2. Строка fig, ax = plt.subplots() вернула два объекта. Чем fig отличается от ax?
   А) fig — лист со всеми осями, ax — одна область данных с координатами на этом листе
   Б) fig — готовая PNG-картинка, ax — её оси X и Y
   В) Ничем: это две ссылки на один объект
   Г) fig отвечает за данные, ax — за оформление

3. Скрипт сохраняет два графика. Почему в y2025.png обе линии и заголовок «2025»?

```
plt.plot(t.index, t["2024"])
plt.title("2024")
plt.savefig("y2024.png")

plt.plot(t.index, t["2025"])
plt.title("2025")
plt.savefig("y2025.png")
```
   А) savefig очищает фигуру, только если сохранять в SVG
   Б) Фигура после savefig осталась открытой и текущей, и второй plt.plot добавил линию в те же оси
   В) plt.title("2025") создал новую фигуру, а линии остались в старой
   Г) Matplotlib склеивает линии с одинаковыми значениями по оси X

4. График пойдёт в веб-статью: её откроют и на телефоне, и на мониторе 4K, а подпись на графике, возможно, придётся поправить. Какой формат выбрать?
   А) PNG с dpi=72: файл меньше
   Б) SVG: линии и текст хранятся как описание фигур и остаются чёткими при любом масштабе
   В) PNG с dpi=600: хватит на любой экран
   Г) Неважно: браузер всё равно превращает картинку в пиксели

5. Как обратиться к нижнему левому графику и что у него общего с верхним левым?

```
fig, axes = plt.subplots(2, 2, figsize=(10, 6), sharex="col")
```
   А) axes[1, 0]; у них одна ось X: общие пределы, подписи делений только внизу
   Б) axes[0, 1]; у них одна ось Y
   В) axes[2]; общая у них только фигура
   Г) axes.bottom_left; у них общий заголовок

6. sns.lineplot(...) вернул ax. Как поставить над графиком заголовок-вывод?
   А) sns.title("…")
   Б) ax.set_title("…")
   В) sns.set_theme(title="…")
   Г) Никак: seaborn отдаёт картинку, а не объекты Matplotlib

7. Фигура создана с figsize=(8, 4.5) и сохранена с dpi=200. Какого размера PNG?
   А) 800 × 450 пикселей
   Б) 1600 × 900 пикселей
   В) 8 × 4,5 — размер в дюймах не меняется
   Г) Зависит от размера окна браузера

## Глоссарий

- **Бэкенд** (backend) — часть Matplotlib, которая выводит фигуру: в окно, в ноутбук (inline) или только в файл (Agg).
- **Векторная графика** (vector image, SVG) — картинка как описание линий, фигур и текста. Рисуется под любой размер без потери чёткости.
- **Глиф** (glyph) — рисунок одного символа в шрифте. Нет глифа — вместо буквы появляется пустой квадрат.
- **Деление** (tick) — засечка на оси с подписью и, если включена, линией сетки. Где ставить деления, решает локатор оси.
- **Общая ось** (sharex, sharey) — связь осей соседних графиков: одинаковые пределы, подписи делений только у крайних.
- **Объектный интерфейс** (explicit, object-oriented interface) — стиль кода, где вы держите ссылки fig и ax и вызываете их методы: ax.plot, ax.set_title, fig.savefig.
- **Оси** (Axes) — область данных внутри фигуры со своими пределами, делениями, линиями и подписями. Почти все методы рисования — методы Axes.
- **Ось** (Axis) — одна ось внутри Axes, XAxis или YAxis: деления, их подписи, локатор и форматтер.
- **Растровая графика** (raster image, PNG) — картинка как сетка пикселей фиксированного размера. При увеличении теряет чёткость.
- **Стиль** (style sheet) — набор значений rcParams под одним именем или в файле .mplstyle. Включается plt.style.use, временно — plt.style.context.
- **Фигура** (Figure) — корневой объект графика: лист с размером в дюймах, фоном и всеми осями. Сохраняется в файл целиком через fig.savefig.
- **Форматтер** (Formatter) — объект оси, который превращает число деления в подпись: «35», «35 млн ₽», «01.03».
- **Художник** (Artist) — любой объект, который Matplotlib рисует: линия, текст, прямоугольник, легенда, сами оси и фигура.
- **dpi** (dots per inch) — точек на дюйм: сколько пикселей приходится на дюйм фигуры. Размер PNG в пикселях равен figsize × dpi.
- **plt.subplots** (subplots) — функция, которая создаёт фигуру и сетку осей и возвращает их: fig, ax для одного графика или fig, axes для сетки.
- **pyplot** (matplotlib.pyplot) — модуль, работающий как машина состояний: помнит текущую фигуру и текущие оси и отправляет туда каждую команду plt.*.
- **rcParams** (runtime configuration) — словарь настроек Matplotlib по умолчанию: размер фигуры, шрифт, цвета, dpi. Всё, что не задано в вызове, берётся отсюда.

## Источники

1. Matplotlib. Quick start guide. Фигура, оси, ось и художники; два стиля кода и совет, какой когда выбирать. https://matplotlib.org/stable/users/explain/quick_start.html
2. Matplotlib. Anatomy of a figure. Схема графика с подписью каждой части. https://matplotlib.org/stable/gallery/showcase/anatomy.html
3. Matplotlib. Matplotlib Application Interfaces (APIs). Явный и неявный интерфейсы, текущие фигура и оси, gcf и gca. https://matplotlib.org/stable/users/explain/figure/api_interfaces.html
4. Matplotlib. matplotlib.pyplot.subplots. Сетка осей и значения sharex, sharey. https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html
5. Matplotlib. matplotlib.dates. Локаторы и форматтеры дат: MonthLocator, DateFormatter, ConciseDateFormatter. https://matplotlib.org/stable/api/dates_api.html
6. Matplotlib. Customizing Matplotlib with style sheets and rcParams. Что такое rcParams, стили и временные настройки. https://matplotlib.org/stable/users/explain/customizing.html
7. Matplotlib. Figure.savefig. Форматы файла, dpi по умолчанию и bbox_inches. https://matplotlib.org/stable/api/_as_gen/matplotlib.figure.Figure.savefig.html
8. Matplotlib. Fonts in Matplotlib. Шрифт по умолчанию, поиск шрифтов и два режима текста в SVG. https://matplotlib.org/stable/users/explain/text/fonts.html
9. pandas. Chart visualization. Метод .plot как обёртка над Matplotlib. https://pandas.pydata.org/docs/user_guide/visualization.html
10. seaborn. seaborn.lineplot. Среднее и 95-процентный интервал по умолчанию, аргумент ax и возвращаемые Axes. https://seaborn.pydata.org/generated/seaborn.lineplot.html