# plt — из кода «Анатомии графика»
from pathlib import Path

import matplotlib as mpl
from matplotlib import font_manager

print("по умолчанию:", Path(font_manager.findfont("DejaVu Sans")).name)

with mpl.rc_context({"font.family": "Analytics101MissingFont"}):     # вымышленное имя для примера с подстановкой шрифта
    fig, ax = plt.subplots()
    ax.set_title("Выручка, млн ₽")
    fig.canvas.draw()
    print("вместо Analytics101MissingFont:", ax.title.get_fontname())

with mpl.rc_context({"font.family": "cmr10"}):     # шрифт есть, но без кириллицы
    fig, ax = plt.subplots()
    ax.set_title("Выручка, млн ₽")
    fig.canvas.draw()
    print("cmr10: в шрифте нет символов для русских букв и знака рубля")
