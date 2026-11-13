/* Страница 8.1 · Устройство графика в Matplotlib */
(() => {
  // Данные между метками вписывает data/gen_page.py: SVG графика-примера от Matplotlib 3.10 с gid у художников,
  // число объектов по слоям, оба кода «Анатомии» и итог их попиксельного сравнения, код и вывод всех блоков.
  /*data:start*/const DATA = {"svg": "<svg class=\"mpa-svg\" viewBox=\"0 0 576 324\" role=\"img\" aria-label=\"График «2025-й выше 2024-го в каждом месяце»: две линии выручки по месяцам\" font-size=\"10px\" text-anchor=\"middle\"><defs><path id=\"ANA-0\" d=\"M 0 0 L 0 3.5\" style=\"stroke: #000000; stroke-width: 0.8\"/><path id=\"ANA-2\" d=\"M 0 0 L -3.5 0\" style=\"stroke: #000000; stroke-width: 0.8\"/><clipPath id=\"ANA-1\"><rect x=\"72\" y=\"39\" width=\"446\" height=\"250\"/></clipPath></defs><g id=\"ANA-fig\"><path d=\"M 0 324 L 576 324 L 576 0 L 0 0 z\" style=\"fill: #ffffff\"/></g><g id=\"ANA-axes\"><path d=\"M 72 288 L 518 288 L 518 39 L 72 39 z\" style=\"fill: #ffffff\"/></g><g id=\"ANA-xaxis\"><use href=\"#ANA-0\" x=\"92\" y=\"288\"/><text x=\"92\" y=\"303\">янв</text><use href=\"#ANA-0\" x=\"129\" y=\"288\"/><text x=\"129\" y=\"303\">фев</text><use href=\"#ANA-0\" x=\"166\" y=\"288\"/><text x=\"166\" y=\"303\">мар</text><use href=\"#ANA-0\" x=\"203\" y=\"288\"/><text x=\"203\" y=\"303\">апр</text><use href=\"#ANA-0\" x=\"240\" y=\"288\"/><text x=\"240\" y=\"303\">май</text><use href=\"#ANA-0\" x=\"277\" y=\"288\"/><text x=\"277\" y=\"303\">июн</text><use href=\"#ANA-0\" x=\"314\" y=\"288\"/><text x=\"314\" y=\"303\">июл</text><use href=\"#ANA-0\" x=\"350\" y=\"288\"/><text x=\"350\" y=\"303\">авг</text><use href=\"#ANA-0\" x=\"387\" y=\"288\"/><text x=\"387\" y=\"303\">сен</text><use href=\"#ANA-0\" x=\"424\" y=\"288\"/><text x=\"424\" y=\"303\">окт</text><use href=\"#ANA-0\" x=\"461\" y=\"288\"/><text x=\"461\" y=\"303\">ноя</text><use href=\"#ANA-0\" x=\"498\" y=\"288\"/><text x=\"498\" y=\"303\">дек</text></g><g id=\"ANA-yaxis\"><g id=\"ANA-grid-0\"><path d=\"M 72 288 L 518 288\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"288\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"292\">0</text><g id=\"ANA-grid-1\"><path d=\"M 72 261 L 518 261\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"261\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"264\">5</text><g id=\"ANA-grid-2\"><path d=\"M 72 233 L 518 233\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"233\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"237\">10</text><g id=\"ANA-grid-3\"><path d=\"M 72 205 L 518 205\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"205\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"209\">15</text><g id=\"ANA-grid-4\"><path d=\"M 72 178 L 518 178\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"178\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"181\">20</text><g id=\"ANA-grid-5\"><path d=\"M 72 150 L 518 150\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"150\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"154\">25</text><g id=\"ANA-grid-6\"><path d=\"M 72 122 L 518 122\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"122\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"126\">30</text><g id=\"ANA-grid-7\"><path d=\"M 72 94 L 518 94\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"94\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"98\">35</text><g id=\"ANA-grid-8\"><path d=\"M 72 67 L 518 67\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"67\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"70\">40</text><g id=\"ANA-grid-9\"><path d=\"M 72 39 L 518 39\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #b0b0b0; stroke-width: 0.8; stroke-linecap: square\"/></g><use href=\"#ANA-2\" x=\"72\" y=\"39\"/><text style=\"font-size: 10px; text-anchor: end\" x=\"65\" y=\"43\">45</text><g id=\"ANA-ylabel\"><text x=\"46\" y=\"164\" transform=\"rotate(-90 46 164)\">выручка, млн ₽</text></g></g><g id=\"ANA-l2024\"><path d=\"M 92 96 L 129 104 L 166 117 L 203 124 L 240 131 L 277 137 L 314 130 L 350 122 L 387 110 L 424 100 L 461 93 L 498 93\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #1f77b4; stroke-width: 1.5; stroke-linecap: square\"/></g><g id=\"ANA-l2025\"><path d=\"M 92 92 L 129 99 L 166 106 L 203 119 L 240 125 L 277 121 L 314 109 L 350 100 L 387 86 L 424 70 L 461 65 L 498 57\" clip-path=\"url(#ANA-1)\" style=\"fill: none; stroke: #ff7f0e; stroke-width: 1.5; stroke-linecap: square\"/></g><g id=\"ANA-sp-left\"><path d=\"M 72 288 L 72 39\" style=\"fill: none; stroke: #000000; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square\"/></g><g id=\"ANA-sp-right\"><path d=\"M 518 288 L 518 39\" style=\"fill: none; stroke: #000000; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square\"/></g><g id=\"ANA-sp-bottom\"><path d=\"M 72 288 L 518 288\" style=\"fill: none; stroke: #000000; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square\"/></g><g id=\"ANA-sp-top\"><path d=\"M 72 39 L 518 39\" style=\"fill: none; stroke: #000000; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square\"/></g><g id=\"ANA-title\"><text style=\"font-size: 12px; text-anchor: middle\" x=\"295\" y=\"33\">2025-й выше 2024-го в каждом месяце</text></g><g id=\"ANA-legend\"><path d=\"M 79 76 L 136 76 Q 138 76 138 74 L 138 46 Q 138 44 136 44 L 79 44 Q 77 44 77 46 L 77 74 Q 77 76 79 76 z\" style=\"fill: #ffffff; opacity: 0.8; stroke: #cccccc; stroke-linejoin: miter\"/><path d=\"M 81 52 L 91 52 L 101 52\" style=\"fill: none; stroke: #1f77b4; stroke-width: 1.5; stroke-linecap: square\"/><text style=\"font-size: 10px; text-anchor: start\" x=\"109\" y=\"56\">2024</text><path d=\"M 81 67 L 91 67 L 101 67\" style=\"fill: none; stroke: #ff7f0e; stroke-width: 1.5; stroke-linecap: square\"/><text style=\"font-size: 10px; text-anchor: start\" x=\"109\" y=\"70\">2025</text></g></svg>", "same": true, "diff": 0, "px": [800, 450], "oo": "import matplotlib.pyplot as plt\nimport pandas as pd\n\nsales = pd.read_csv(\"data/viz/sales_monthly.csv\")\nsales[\"year\"] = sales[\"month\"].str[:4]            # \"2024-03\" → \"2024\"\nsales[\"m\"] = sales[\"month\"].str[5:].astype(int)   # \"2024-03\" → 3\nt = sales.pivot_table(index=\"m\", columns=\"year\",\n                      values=\"revenue\", aggfunc=\"sum\") / 1e6   # млн ₽\nMONTHS = \"янв фев мар апр май июн июл авг сен окт ноя дек\".split()\n\nfig, ax = plt.subplots(figsize=(8, 4.5))\nax.plot(t.index, t[\"2024\"], label=\"2024\")\nax.plot(t.index, t[\"2025\"], label=\"2025\")\nax.set_xticks(t.index, MONTHS)\nax.set_ylim(0, 45)\nax.grid(axis=\"y\")\nax.set_title(\"2025-й выше 2024-го в каждом месяце\")\nax.set_ylabel(\"выручка, млн ₽\")\nax.legend()\nfig.savefig(\"anatomy.png\")", "py": "import matplotlib.pyplot as plt\nimport pandas as pd\n\nsales = pd.read_csv(\"data/viz/sales_monthly.csv\")\nsales[\"year\"] = sales[\"month\"].str[:4]            # \"2024-03\" → \"2024\"\nsales[\"m\"] = sales[\"month\"].str[5:].astype(int)   # \"2024-03\" → 3\nt = sales.pivot_table(index=\"m\", columns=\"year\",\n                      values=\"revenue\", aggfunc=\"sum\") / 1e6   # млн ₽\nMONTHS = \"янв фев мар апр май июн июл авг сен окт ноя дек\".split()\n\nplt.figure(figsize=(8, 4.5))\nplt.plot(t.index, t[\"2024\"], label=\"2024\")\nplt.plot(t.index, t[\"2025\"], label=\"2025\")\nplt.xticks(t.index, MONTHS)\nplt.ylim(0, 45)\nplt.grid(axis=\"y\")\nplt.title(\"2025-й выше 2024-го в каждом месяце\")\nplt.ylabel(\"выручка, млн ₽\")\nplt.legend()\nplt.savefig(\"anatomy_pyplot.png\")", "els": {"fig": {"cls": "Figure", "oo": [[10], []], "py": [[10], []]}, "axes": {"cls": "Axes", "oo": [[10], []], "py": [[11], []]}, "spines": {"cls": "Spine ×4", "oo": [[10], []], "py": [[11], []]}, "xaxis": {"cls": "XAxis", "oo": [[10], [13]], "py": [[11], [13]]}, "yaxis": {"cls": "YAxis", "oo": [[10], [14]], "py": [[11], [14]]}, "grid": {"cls": "Line2D (сетка)", "oo": [[15], []], "py": [[15], []]}, "l2024": {"cls": "Line2D", "oo": [[11], []], "py": [[11], []]}, "l2025": {"cls": "Line2D", "oo": [[12], []], "py": [[12], []]}, "title": {"cls": "Text", "oo": [[16], []], "py": [[16], []]}, "ylabel": {"cls": "Text", "oo": [[17], []], "py": [[17], []]}, "legend": {"cls": "Legend", "oo": [[18], [11, 12]], "py": [[18], [11, 12]]}}, "save": {"oo": 19, "py": 19}, "first": 10, "objects": 168, "counts": {"fig": 2, "lines": 2, "texts": 5, "legend": 17, "axes_core": 6, "axes_axis": 136}, "xticks": 12, "yticks": 10, "pngKB": 29};/*data:end*/
  /*code:start*/const CODE = {
 "pub": {
  "title": "С нуля до публикации: данные → фигура → оси → подписи → файл",
  "badge": "проверено: Python 3.13, matplotlib 3.10.0, pandas 3.0.5",
  "lang": "python",
  "code": "import os\n\nimport matplotlib.pyplot as plt\nimport pandas as pd\n\nplt.rcParams[\"svg.fonttype\"] = \"none\"   # в SVG текст остаётся текстом, а не кривыми\n\n# 1. Данные: 960 строк «месяц × канал × страна» → таблица «месяц × год», млн ₽\nsales = pd.read_csv(\"data/viz/sales_monthly.csv\")\nsales[\"year\"] = sales[\"month\"].str[:4]\nsales[\"m\"] = sales[\"month\"].str[5:].astype(int)\nt = sales.pivot_table(index=\"m\", columns=\"year\",\n                      values=\"revenue\", aggfunc=\"sum\") / 1e6\nMONTHS = \"янв фев мар апр май июн июл авг сен окт ноя дек\".split()\n\n# 2. Фигура и оси — явно, в одну строку\nfig, ax = plt.subplots(figsize=(8, 4.5), layout=\"constrained\")\n\n# 3. Данные: прошлый год серым, текущий — акцентом\nax.plot(t.index, t[\"2024\"], color=\"#9aa3b2\", linewidth=1.5, label=\"2024\")\nax.plot(t.index, t[\"2025\"], color=\"#0d7468\", linewidth=2.5, label=\"2025\")\n\n# 4. Оси: деления, пределы, формат подписей\nax.set_xticks(t.index, MONTHS)\nax.set_ylim(0, 50)\nax.yaxis.set_major_formatter(\"{x:.0f} млн ₽\")\nax.spines[[\"top\", \"right\"]].set_visible(False)\nax.grid(axis=\"y\", color=\"#dde1e8\")\n\n# 5. Подписи: заголовок-вывод, легенда без рамки, источник\nax.set_title(\"Выручка 2025 года выше 2024-го в каждом месяце, с июня — на 11–18%\",\n             loc=\"left\", fontweight=\"bold\")\nax.legend(frameon=False, loc=\"lower right\", ncols=2)\nfig.supxlabel(\"Учебные данные магазина: sales_monthly.csv, все каналы и страны\",\n              x=0.01, ha=\"left\", fontsize=8, color=\"#737c8f\")   # строка под всей фигурой\n\n# 6. Сохранение: PNG для слайда и письма, SVG для статьи\nfig.savefig(\"revenue_yoy.png\", dpi=200)\nfig.savefig(\"revenue_yoy.svg\")\n\ngrowth = t[\"2025\"] / t[\"2024\"] - 1\nprint(t.round(1).T[[1, 5, 6, 12]])\nprint(f\"рост с июня: {growth.loc[6:].min():.1%} … {growth.loc[6:].max():.1%}\")\nfor f in (\"revenue_yoy.png\", \"revenue_yoy.svg\"):\n    print(f, round(os.path.getsize(f) / 1024), \"КБ\")",
  "out": "m       1     5     6     12\nyear                        \n2024  34.7  28.3  27.3  35.2\n2025  35.5  29.5  30.2  41.7\nрост с июня: 10.7% … 18.4%\nrevenue_yoy.png 76 КБ\nrevenue_yoy.svg 16 КБ"
 },
 "grid": {
  "title": "Сетка 2 × 2: четыре типа графика и общая ось у каждого столбца",
  "badge": "проверено: Python 3.13, matplotlib 3.10.0",
  "lang": "python",
  "code": "# sales, pd, plt — из кода «Анатомии графика»\nimport matplotlib.dates as mdates\n\nym = sales.groupby(\"month\")[\"revenue\"].sum() / 1e6                     # 24 месяца\napp = sales[sales[\"channel\"] == \"приложение\"].groupby(\"month\")[\"revenue\"].sum() / 1e6\ndates = pd.to_datetime(ym.index)                                       # строки → даты\ncm = sales.pivot_table(index=[\"channel\", \"m\"], columns=\"year\",\n                       values=\"revenue\", aggfunc=\"sum\") / 1e6          # канал × месяц\n\nfig, axes = plt.subplots(2, 2, figsize=(10, 6), sharex=\"col\", layout=\"constrained\")\n\naxes[0, 0].plot(dates, ym)                                   # линия: динамика\naxes[0, 0].set_title(\"Выручка магазина растёт, пик — в декабре\")\naxes[1, 0].bar(dates, app, width=20)                         # столбцы: сравнение\naxes[1, 0].set_title(\"Приложение удвоилось с июня 2025\")\naxes[1, 0].xaxis.set_major_locator(mdates.MonthLocator(bymonth=[1, 7]))\naxes[1, 0].xaxis.set_major_formatter(mdates.DateFormatter(\"%m.%Y\"))     # 01.2025\n\naxes[0, 1].scatter(cm[\"2024\"], cm[\"2025\"], s=12)             # рассеяние: связь\naxes[0, 1].axline((0, 0), slope=1, color=\"grey\", linewidth=0.8)\naxes[0, 1].set_title(\"2025-й больше 2024-го в 94 точках из 120\")\naxes[0, 1].set_ylabel(\"тот же канал и месяц 2025, млн ₽\")\naxes[1, 1].hist(cm[\"2024\"], bins=12)                         # гистограмма: распределение\naxes[1, 1].set_title(\"Половина значений — меньше 2 млн ₽ в месяц\")\naxes[1, 1].set_xlabel(\"выручка канала за месяц 2024, млн ₽\")\n\nfig.suptitle(\"Магазин растёт за счёт приложения: четыре взгляда на одни данные\")   # заголовок фигуры\nfig.savefig(\"grid.png\", dpi=150)\n\nprint(type(axes).__name__, axes.shape)\nprint(\"общая ось X слева:\", axes[0, 0].get_xlim() == axes[1, 0].get_xlim())\nprint(\"общая ось X справа:\", axes[0, 1].get_xlim() == axes[1, 1].get_xlim())\nprint(\"подписи делений у верхнего левого:\", axes[0, 0].xaxis.get_tick_params()[\"labelbottom\"])\nprint(f\"выше диагонали: {(cm['2025'] > cm['2024']).sum()} из {len(cm)}, меньше 2 млн: {(cm['2024'] < 2).sum()}\")",
  "out": "ndarray (2, 2)\nобщая ось X слева: True\nобщая ось X справа: True\nподписи делений у верхнего левого: False\nвыше диагонали: 94 из 120, меньше 2 млн: 60"
 },
 "tmpl": {
  "title": "Функция-шаблон и стиль учебника: десять одинаковых графиков за один цикл",
  "badge": "проверено: Python 3.13, matplotlib 3.10.0",
  "lang": "python",
  "code": "# sales, MONTHS — из кода «Анатомии графика»\nfrom pathlib import Path\n\nfrom cycler import cycler\n\nTEXTBOOK = {                                   # стиль учебника: один словарь rcParams\n    \"figure.figsize\": (7, 3.4),\n    \"font.size\": 10,\n    \"axes.titlesize\": 12,\n    \"axes.titleweight\": \"bold\",\n    \"axes.titlelocation\": \"left\",\n    \"axes.spines.top\": False,\n    \"axes.spines.right\": False,\n    \"axes.edgecolor\": \"#737c8f\",\n    \"axes.grid\": True,\n    \"axes.grid.axis\": \"y\",\n    \"grid.color\": \"#dde1e8\",\n    \"axes.prop_cycle\": cycler(color=[\"#9aa3b2\", \"#0d7468\"]),\n    \"legend.frameon\": False,\n    \"savefig.dpi\": 200,\n    \"savefig.bbox\": \"tight\",\n}\n\n\ndef yoy_chart(ax, t, title, unit=\"млн ₽\"):\n    \"\"\"Год к году: линия на каждый год, месяцы по оси X, запятая в дробях.\"\"\"\n    for year in t.columns:\n        ax.plot(t.index, t[year], label=year, linewidth=2.5 if year == t.columns[-1] else 1.5)\n    ax.set_xticks(t.index, MONTHS)\n    ax.set_ylim(0, t.max().max() * 1.2)\n    ax.yaxis.set_major_formatter(lambda x, pos: f\"{x:g}\".replace(\".\", \",\"))\n    ax.set_ylabel(unit)\n    ax.set_title(title)\n    ax.legend(loc=\"lower right\", ncols=2)\n    return ax\n\n\nby_ch = sales.pivot_table(index=[\"channel\", \"m\"], columns=\"year\",\n                          values=\"revenue\", aggfunc=\"sum\") / 1e6\nPath(\"charts\").mkdir(exist_ok=True)\nwith plt.style.context(TEXTBOOK):              # стиль действует только внутри with\n    for i, ch in enumerate(by_ch.index.unique(\"channel\")):\n        tc = by_ch.loc[ch]\n        delta = round(tc[\"2025\"].sum() / tc[\"2024\"].sum() - 1, 2) + 0   # + 0 убирает «−0»\n        delta = f\"{delta:+.0%}\".replace(\"-\", \"−\")\n        fig, ax = plt.subplots()\n        yoy_chart(ax, tc, f\"{ch.capitalize()}: {delta} к 2024 году\")\n        fig.savefig(f\"charts/{i:02d}.png\")\n        plt.close(fig)                         # десятки фигур не копятся в памяти\n        print(f\"charts/{i:02d}.png  {ax.get_title(loc='left')}\")\nprint(\"открытых фигур:\", len(plt.get_fignums()))",
  "out": "charts/00.png  Кешбэк-сервисы: +3% к 2024 году\ncharts/01.png  Колл-центр: −20% к 2024 году\ncharts/02.png  Маркетплейс: +0% к 2024 году\ncharts/03.png  Офлайн-точки: +5% к 2024 году\ncharts/04.png  Партнёры: +8% к 2024 году\ncharts/05.png  Поиск: +6% к 2024 году\ncharts/06.png  Приложение: +66% к 2024 году\ncharts/07.png  Рассылка: +12% к 2024 году\ncharts/08.png  Сайт: +5% к 2024 году\ncharts/09.png  Соцсети: +2% к 2024 году\nоткрытых фигур: 0"
 },
 "sns": {
  "title": "Тот же график в pandas и seaborn: обе обёртки возвращают Axes",
  "badge": "проверено: Python 3.13, matplotlib 3.10.0, seaborn 0.13.2",
  "lang": "python",
  "code": "# sales, t, MONTHS — из кода «Анатомии графика»\nimport seaborn as sns\n\nsns.set_theme(style=\"whitegrid\")       # меняет rcParams: так теперь выглядят все графики\nsales[\"mln\"] = sales[\"revenue\"] / 1e6\n\nfig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 3.6), sharey=True, layout=\"constrained\")\nt.plot(ax=ax1, title=\"pandas: t.plot(ax=ax1)\")                    # таблица «месяц × год»\nsns.lineplot(data=sales, x=\"m\", y=\"mln\", hue=\"year\",               # длинная таблица, 960 строк\n             estimator=\"sum\", errorbar=None, ax=ax2)\nax2.set_title('seaborn: lineplot(estimator=\"sum\")')\nfor ax in (ax1, ax2):\n    ax.set_xticks(range(1, 13), MONTHS)\n    ax.set_xlabel(\"\")\n    ax.set_ylim(0, 45)\nfig.suptitle(\"pandas и seaborn нарисовали одно и то же и вернули обычные Axes\")\nfig.savefig(\"pandas_vs_seaborn.png\", dpi=150)\n\nprint(type(ax1).__name__, type(ax2).__name__)\nprint(\"seaborn, январь:\", ax2.lines[0].get_ydata()[0].round(2), \"| pandas:\", t.loc[1, \"2024\"].round(2))\nfig2, ax3 = plt.subplots()\nsns.lineplot(data=sales, x=\"m\", y=\"mln\", hue=\"year\", ax=ax3)       # без estimator\nprint(\"по умолчанию, январь:\", ax3.lines[0].get_ydata()[0].round(2),\n      \"— среднее 40 строк, полос интервала:\", len(ax3.collections))",
  "out": "Axes Axes\nseaborn, январь: 34.72 | pandas: 34.72\nпо умолчанию, январь: 0.87 — среднее 40 строк, полос интервала: 2"
 },
 "dpi": {
  "title": "Один figsize, разные dpi: сколько пикселей в PNG",
  "badge": "проверено: Python 3.13, matplotlib 3.10.0",
  "lang": "python",
  "code": "# t — из кода «Анатомии графика»\nimport os\n\nfig, ax = plt.subplots(figsize=(8, 4.5))      # размер в дюймах\nax.plot(t.index, t[\"2025\"])\nax.set_title(\"Выручка 2025 года, млн ₽\")\nprint(\"figsize:\", fig.get_size_inches(), \"дюйма, dpi фигуры:\", fig.dpi)\n\nfor dpi in (72, 100, 200):\n    fig.savefig(f\"chart_{dpi}.png\", dpi=dpi)\n    h, w, _ = plt.imread(f\"chart_{dpi}.png\").shape\n    print(f\"PNG, dpi={dpi:>3}: {w}×{h} px, {os.path.getsize(f'chart_{dpi}.png') / 1024:.0f} КБ\")\n\nfig.savefig(\"chart_tight.png\", bbox_inches=\"tight\")\nh, w, _ = plt.imread(\"chart_tight.png\").shape\nprint(f\"PNG, bbox_inches='tight': {w}×{h} px — пустые поля обрезаны\")\n\nfig.savefig(\"chart.svg\")\nprint(f\"SVG: {os.path.getsize('chart.svg') / 1024:.0f} КБ, 576×324 pt, чёткий при любом масштабе\")",
  "out": "figsize: [8.  4.5] дюйма, dpi фигуры: 100.0\nPNG, dpi= 72: 576×324 px, 14 КБ\nPNG, dpi=100: 800×450 px, 22 КБ\nPNG, dpi=200: 1600×900 px, 54 КБ\nPNG, bbox_inches='tight': 667×412 px — пустые поля обрезаны\nSVG: 19 КБ, 576×324 pt, чёткий при любом масштабе"
 },
 "fonts": {
  "title": "Кириллица: шрифта нет — подмена, глифа нет — квадратики",
  "badge": "проверено: Python 3.13, matplotlib 3.10.0",
  "lang": "python",
  "code": "# plt — из кода «Анатомии графика»\nfrom pathlib import Path\n\nimport matplotlib as mpl\nfrom matplotlib import font_manager\n\nprint(\"по умолчанию:\", Path(font_manager.findfont(\"DejaVu Sans\")).name)\n\nwith mpl.rc_context({\"font.family\": \"Arial\"}):     # такого шрифта в системе нет\n    fig, ax = plt.subplots()\n    ax.set_title(\"Выручка, млн ₽\")\n    fig.canvas.draw()\n    print(\"вместо Arial:\", ax.title.get_fontname())\n\nwith mpl.rc_context({\"font.family\": \"cmr10\"}):     # шрифт есть, но без кириллицы\n    fig, ax = plt.subplots()\n    ax.set_title(\"Выручка, млн ₽\")\n    fig.canvas.draw()\n    print(\"cmr10: заголовок нарисован, буквы — пустыми квадратами\")",
  "out": "по умолчанию: DejaVuSans.ttf\nfindfont: Font family 'Arial' not found.\n… та же строка ещё 21 раз\nfindfont: Font family ['Arial'] not found. Falling back to DejaVu Sans.\nвместо Arial: DejaVu Sans\nfonts.py:18: UserWarning: Glyph 1042 (\\N{CYRILLIC CAPITAL LETTER VE}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 1099 (\\N{CYRILLIC SMALL LETTER YERU}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 1088 (\\N{CYRILLIC SMALL LETTER ER}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 1091 (\\N{CYRILLIC SMALL LETTER U}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 1095 (\\N{CYRILLIC SMALL LETTER CHE}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 1082 (\\N{CYRILLIC SMALL LETTER KA}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 1072 (\\N{CYRILLIC SMALL LETTER A}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 1084 (\\N{CYRILLIC SMALL LETTER EM}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 1083 (\\N{CYRILLIC SMALL LETTER EL}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 1085 (\\N{CYRILLIC SMALL LETTER EN}) missing from font(s) cmr10.\nfonts.py:18: UserWarning: Glyph 8381 (\\N{RUBLE SIGN}) missing from font(s) cmr10.\ncmr10: заголовок нарисован, буквы — пустыми квадратами",
  "outLabel": "Вывод: stdout и предупреждения; повторы строки про Arial свёрнуты, пути к файлу убраны"
 },
 "dates": {
  "title": "Даты на оси: строки против дат",
  "badge": "проверено: Python 3.13, matplotlib 3.10.0, pandas 3.0.5",
  "lang": "python",
  "code": "# plt, pd — из кода «Анатомии графика»\nimport matplotlib.dates as mdates\n\nd = pd.read_csv(\"data/eda/daily_metrics.csv\")   # 86 дней, 10–13 февраля выгрузка потеряна\nprint(d[\"date\"].dtype, len(d))\n\nfig, (top, bottom) = plt.subplots(2, 1, figsize=(8, 4.6), layout=\"constrained\")\ntop.plot(d[\"date\"], d[\"revenue\"] / 1e3)            # строки: каждая дата — отдельная категория\ntop.set_title(\"Даты строками: 86 подписей слиплись, пропуск февраля исчез\")\n\nd[\"date\"] = pd.to_datetime(d[\"date\"])              # теперь это даты\nbottom.plot(d[\"date\"], d[\"revenue\"] / 1e3)\nbottom.xaxis.set_major_locator(mdates.MonthLocator(bymonthday=[1, 15]))\nbottom.xaxis.set_major_formatter(mdates.DateFormatter(\"%d.%m\"))\nbottom.set_title(\"Даты датами: деления 1-го и 15-го, пропуск виден прямым отрезком\")\nfor ax in (top, bottom):\n    ax.set_ylabel(\"тыс. ₽\")\nfig.savefig(\"dates.png\", dpi=150)\n\nprint(\"делений сверху:\", len(top.get_xticks()), \"| снизу:\", len(bottom.get_xticks()))",
  "out": "str 86\nделений сверху: 86 | снизу: 7"
 },
 "twice": {
  "title": "Второй plt.plot ложится на первый график",
  "badge": "проверено: Python 3.13, matplotlib 3.10.0",
  "lang": "python",
  "code": "# t — из кода «Анатомии графика»; всё ниже — одна ячейка или один скрипт\nplt.plot(t.index, t[\"2024\"])\nplt.title(\"2024\")\nplt.savefig(\"y2024.png\")\n\nplt.plot(t.index, t[\"2025\"])         # хотели второй, отдельный график\nplt.title(\"2025\")\nplt.savefig(\"y2025.png\")\n\nprint(\"открытых фигур:\", plt.get_fignums())\nprint(\"линий на текущих осях:\", len(plt.gca().lines))\nprint(\"заголовок:\", plt.gca().get_title())",
  "out": "открытых фигур: [1]\nлиний на текущих осях: 2\nзаголовок: 2025"
 }
};/*code:end*/

  const NS = 'http://www.w3.org/2000/svg';
  const ALL = ['fig', 'axes', 'spines', 'xaxis', 'yaxis', 'grid', 'l2024', 'l2025', 'title', 'ylabel', 'legend'];
  const OO = DATA.oo.split('\n'), PY = DATA.py.split('\n');
  const F = DATA.first, S = DATA.save.oo;
  const make = (k, m = 'oo') => DATA.els[k][m][0], tune = (k, m = 'oo') => DATA.els[k][m][1];
  const LN = k => make(k)[0];
  const C = DATA.counts;
  const smooth = (p, a, b) => { const x = Math.max(0, Math.min(1, (p - a) / (b - a))); return x * x * (3 - 2 * x); };
  const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // SVG графика → DOM; сетку и подпись оси Y выносим из группы оси, чтобы элементы не вкладывались друг в друга
  function build(host, pre, recolor) {
    let s = DATA.svg.replace(/ANA-/g, pre + '-');
    if (recolor) s = s.replace(/#000000/g, '#aab3c5').replace(/#ffffff/g, '#131a29').replace(/#b0b0b0/g, '#2c3750').replace(/#cccccc/g, '#3a4766').replace('<svg ', '<svg fill="#dde3ee" ');
    host.innerHTML = s;
    const svg = host.querySelector('svg'), q = id => svg.querySelector(`[id="${pre}-${id}"]`);
    const yax = q('yaxis'), par = yax.parentNode;
    const grid = [...yax.querySelectorAll(`[id^="${pre}-grid-"]`)];
    grid.forEach(g => par.insertBefore(g, yax));
    const yl = q('ylabel'); par.insertBefore(yl, yax.nextSibling);
    const N = { fig: [q('fig')], axes: [q('axes')], spines: ['left', 'right', 'bottom', 'top'].map(x => q('sp-' + x)), xaxis: [q('xaxis')], yaxis: [yax], grid,
      l2024: [q('l2024')], l2025: [q('l2025')], title: [q('title')], ylabel: [yl], legend: [q('legend')] };
    Object.entries(N).forEach(([k, ns]) => ns.forEach(n => n.setAttribute('data-el', k)));
    return { svg, N };
  }
  const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
  const union = rs => rs.reduce((a, r) => a ? { left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) } : { left: r.left, top: r.top, right: r.right, bottom: r.bottom }, null);
  const bboxOf = nodes => { const r = union(nodes.map(n => { const b = n.getBBox(); return { left: b.x, top: b.y, right: b.x + b.width, bottom: b.y + b.height }; })); return { x: r.left, y: r.top, w: r.right - r.left, h: r.bottom - r.top }; };

  /* ===================== Сцена: луковица из пяти слоёв ===================== */
  const LAYERS = [
    { name: 'Figure', col: '#9aa3b2', els: ['fig'] },
    { name: 'Axes', col: '#6fa2ea', els: ['axes', 'grid', 'xaxis', 'yaxis', 'spines'] },
    { name: 'Line2D', col: '#f0a247', els: ['l2024', 'l2025'] },
    { name: 'Text', col: '#45c48f', els: ['title', 'ylabel'] },
    { name: 'Legend', col: '#f06ba5', els: ['legend'] }
  ];
  const layerOf = k => LAYERS.findIndex(L => L.els.includes(k));
  // какие слои трогает каждая строка: создаёт или настраивает (label= для легенды не считаем)
  const lineLayers = i => [...new Set(ALL.filter(k => make(k).includes(i) || (k !== 'legend' && tune(k).includes(i))).map(layerOf))].sort();
  const LINES = []; for (let i = F; i <= S; i++) LINES.push(i);
  const AX = ['fig', 'axes', 'spines'], AXIS = AX.concat(['xaxis', 'yaxis', 'grid']);
  const tot = DATA.objects;
  const SC = [
    { vis: ALL, done: LINES, call: [['legend', 'r', `${tot} объектов, 10 строк`]], hud: ['все', tot, '', 10] },
    { vis: ALL, done: LINES, ex: [0, 1], call: [['L0', 'ibl', 'Figure — нижний слой'], ['L4', 'itr', 'Legend — верхний']], hud: ['все', tot, '', 10] },
    { vis: ['fig'], on: ['fig'], hl: [F], tok: 'fig', ex: [1, 0], call: [['fig', 'c', '8 × 4,5 дюйма → 800 × 450 px']], hud: ['1/5', C.fig, `+${C.fig}`, 1] },
    { vis: AX, on: ['axes', 'spines'], hl: [F], tok: 'ax', call: [['axes', 'c', 'Axes и рамка из 4 Spine']], hud: ['2/5', C.fig + C.axes_core, `+${C.axes_core}`, 1] },
    { vis: AXIS, on: ['xaxis', 'yaxis', 'grid'], hl: [LN('grid'), tune('xaxis')[0], tune('yaxis')[0]], done: [F], call: [['xaxis', 'a', `XAxis: ${DATA.xticks} делений`], ['yaxis', 'r', `YAxis: 0–45, ${DATA.yticks} делений`]], hud: ['2/5', C.fig + C.axes_core + C.axes_axis, `+${C.axes_axis}`, 4] },
    { vis: AXIS.concat('l2024'), on: ['l2024'], hl: [LN('l2024')], call: [['l2024', 'b', 'Line2D, цвет C0']], hud: ['3/5', tot - C.texts - C.legend - 1, '+1', 5] },
    { vis: AXIS.concat('l2024', 'l2025'), on: ['l2025'], hl: [LN('l2025')], call: [['l2025', 'a', 'Line2D, цвет C1']], hud: ['3/5', tot - C.texts - C.legend, '+1', 6] },
    { vis: AXIS.concat('l2024', 'l2025', 'title'), on: ['title'], hl: [LN('title')], call: [['title', 'b', 'ax.title — Text']], hud: ['4/5', tot - C.legend - 2, '+3', 7] },
    { vis: ALL.filter(k => k !== 'legend'), on: ['ylabel'], hl: [LN('ylabel')], call: [['ylabel', 'r', 'ax.yaxis.label']], hud: ['4/5', tot - C.legend, '+2', 8] },
    { vis: ALL, on: ['legend'], hl: [LN('legend')], tu: [LN('l2024'), LN('l2025')], call: [['legend', 'r', 'label= из двух линий']], hud: ['5/5', tot, `+${C.legend}`, 9] },
    { vis: ALL, on: ['fig'], hl: [S], done: LINES, call: [['axes', 'c', `anatomy.png · ${DATA.px[0]} × ${DATA.px[1]} · ${DATA.pngKB} КБ`]], hud: ['все', tot, '', 10] }
  ];
  // «выполненные» строки шага: всё, что подсвечивалось раньше на пути сборки
  SC.forEach((s, k) => { if (!s.done) s.done = k < 2 ? LINES : [...new Set(SC.slice(2, k).flatMap(x => (x.hl || []).concat(x.done || [])))]; });

  const scene = {
    parts: [{ n: '01', name: 'Луковица', s: [0, 1] }, { n: '02', name: 'Фигура', s: [2] }, { n: '03', name: 'Оси', s: [3, 4] }, { n: '04', name: 'Линии', s: [5, 6] }, { n: '05', name: 'Подписи', s: [7, 8] }, { n: '06', name: 'Легенда и файл', s: [9, 10] }],
    steps: [
      { title: 'Десять строк — один график', dur: 3000, body: `<p>Код под графиком строит выручку магазина по месяцам: 2025 год против 2024-го. На картинке — две линии, а в памяти Python — дерево из <b>${tot} объектов</b>.</p><p>Разберём его по слоям, как луковицу, и для каждого слоя найдём строку, которая его создала.</p>` },
      { title: 'Пять слоёв', dur: 3200, body: '<p>Внизу лист — фигура. На нём оси с делениями и сеткой, выше — линии данных, подписи и легенда. Каждый слой — отдельные объекты Python со своими методами.</p><p>Цветные метки у строк кода показывают, какой слой трогает строка.</p>' },
      { title: 'Figure — лист', dur: 2800, body: '<p>Первая строка возвращает две ссылки. <b>fig</b> — фигура: лист 8 × 4,5 дюйма с фоном. При dpi 100 это 800 × 450 пикселей.</p><p>Сама фигура линий не рисует: они живут в осях.</p>' },
      { title: 'Axes — область данных', dur: 2800, body: '<p>Вторая ссылка, <b>ax</b>, — оси (Axes): прямоугольник, внутри которого числа становятся координатами. Рамка — четыре объекта Spine.</p><p>Почти всё рисование дальше — методы ax.</p>' },
      { title: 'Axis — деления и сетка', dur: 3600, body: `<p>Внутри Axes две оси, XAxis и YAxis. Их настраивают три строки: месяцы на X, пределы 0–45 на Y и сетка.</p><p>Здесь больше всего объектов: у каждого из ${DATA.xticks + DATA.yticks} делений засечки, подписи и линия сетки, видимые или нет. Слои идут не по порядку строк: set_xticks стоит после plot, но меняет ось.</p>` },
      { title: 'Line2D — данные', dur: 2600, body: '<p><b>ax.plot</b> кладёт в эти оси объект Line2D — ломаную из 12 точек. Цвет C0 взят из цикла цветов в настройках по умолчанию.</p>' },
      { title: 'Вторая линия', dur: 2600, body: '<p>Второй ax.plot — вторая Line2D в те же оси, цвет — следующий в цикле, C1. Подписи label="2024" и label="2025" пока не видны: их заберёт легенда.</p>' },
      { title: 'Заголовок — объект Text', dur: 2800, body: '<p>set_title не создаёт объект, а пишет строку в готовый. У Axes три места под заголовок — слева, по центру и справа, и все три Text появились вместе с осями, пустыми.</p>' },
      { title: 'Подпись оси принадлежит оси', dur: 2800, body: '<p>set_ylabel пишет в <b>ax.yaxis.label</b> — Text, который принадлежит оси Y, а не Axes. Подпись оси X тоже существует, только пустая.</p>' },
      { title: 'Legend собирает label=', dur: 2800, body: `<p>ax.legend() создаёт Legend: рамку, два образца линий и две подписи — ${C.legend} объектов вместе со служебными контейнерами. Подписи взяты из label= двух линий.</p>` },
      { title: 'savefig рисует всё дерево', dur: 3600, next: 'Читать страницу', body: `<p>fig.savefig обходит дерево от фигуры к листьям и рисует каждый объект в файл.</p><p>Строк — 10, объектов — ${tot}, и у каждого есть адрес: fig, ax, ax.lines[0], ax.title.</p>` }
    ],
    hud: [{ id: 'layer', label: 'Слой' }, { id: 'obj', label: 'Объектов' }, { id: 'ln', label: 'Строк кода' }],
    legend: LAYERS.map(L => `<span><i class="sq" style="background:${L.col}"></i>${L.name}</span>`).join(''),
    info: 'АНАТОМИЯ',
    aiNote: `В анимации график из кода: fig, ax = plt.subplots(figsize=(8, 4.5)); ax.plot(...) для 2024 и 2025 года; ax.set_xticks; ax.set_ylim(0, 45); ax.grid(axis="y"); ax.set_title; ax.set_ylabel; ax.legend(); fig.savefig. На фигуре ${tot} объектов-художников: фигура ${C.fig}, оси и рамка ${C.axes_core}, деления и оси X/Y ${C.axes_axis}, линии ${C.lines}, тексты ${C.texts}, легенда ${C.legend}.`,
    mount(root, api) {
      const { hl } = api;
      root.innerHTML = '<div class="mpa-sc"><div class="mpa-sc-fig"></div><div class="mpa-sc-code"></div></div><div class="mpa-calls"></div>';
      const { svg, N } = build(root.querySelector('.mpa-sc-fig'), 'sc', true);
      const W = 576, H = 324;
      const wrap = el('g', {}), LG = LAYERS.map((L, i) => {
        const g = el('g', { class: 'mpa-L' });
        g.appendChild(el('rect', { class: 'mpa-sheet', x: 0, y: 0, width: W, height: H, rx: 3, stroke: L.col, fill: L.col }));
        wrap.appendChild(g); return g;
      });
      svg.appendChild(wrap);
      LAYERS.forEach((L, i) => L.els.forEach(k => N[k].forEach(n => LG[i].appendChild(n))));
      const code = root.querySelector('.mpa-sc-code'), calls = root.querySelector('.mpa-calls');
      code.innerHTML = `<div class="mpa-scl mpa-c"><span></span><span></span><span># sales, t, MONTHS — подготовка данных, строки 1–9</span></div>` + LINES.map(i => {
        let h = hl(OO[i]);
        if (i === F) h = h.replace(/^fig/, '<b class="mpa-tok" data-t="fig">fig</b>').replace(', ax ', ', <b class="mpa-tok" data-t="ax">ax</b> ');
        return `<div class="mpa-scl" data-i="${i}"><span class="mpa-chips">${lineLayers(i).map(l => `<i style="background:${LAYERS[l].col}"></i>`).join('')}</span><span class="mpa-no">${i + 1}</span><span>${h}</span></div>`;
      }).join('');
      const rows = [...code.querySelectorAll('[data-i]')];
      let sig = '', csig = '';
      return {
        render(k, p) {
          const s = SC[k], prev = SC[k - 1] || { vis: [] };
          const ex = s.ex ? s.ex[0] + (s.ex[1] - s.ex[0]) * smooth(p, 0.05, 0.55) : 0;
          const qx = Math.round(ex * 50) / 50, qp = Math.round(Math.min(p, 0.6) * 25);
          api.hud('layer', s.hud[0]); api.hud('obj', fmtN(s.hud[1]), s.hud[2]); api.hud('ln', String(s.hud[3]));
          const key = `${k}|${qx}|${qp}`;
          if (key !== sig) {
            sig = key;
            const sc = 1 - 0.27 * qx;
            wrap.setAttribute('transform', `translate(${10 * qx} ${88 * qx}) scale(${sc})`);
            LG.forEach((g, i) => { g.setAttribute('transform', `translate(${46 * i * qx} ${-30 * i * qx})`); g.firstChild.style.opacity = qx; });
            const focus = k >= 2 && k <= 9;
            ALL.forEach(e => {
              const vis = s.vis.includes(e), was = prev.vis.includes(e) && k > 0;
              let o = vis ? (was ? 1 : smooth(p, 0.1, 0.45)) : (was ? 1 - smooth(p, 0, 0.3) : 0);
              if (vis && focus && !(s.on || []).includes(e) && e !== 'fig' && e !== 'axes') o *= 0.45;
              N[e].forEach(n => { n.style.opacity = o.toFixed(2); n.classList.toggle('mpa-hot', (s.on || []).includes(e) && p > 0.2); });
            });
            rows.forEach(r => {
              const i = +r.dataset.i;
              r.className = 'mpa-scl ' + ((s.hl || []).includes(i) ? 'hl' : (s.tu || []).includes(i) ? 'tu' : s.done.includes(i) ? 'dn' : 'td');
            });
            code.querySelectorAll('.mpa-tok').forEach(t => t.classList.toggle('on', s.tok === t.dataset.t));
          }
          const ck = `${k}|${p >= 0.55}|${root.clientWidth}`;
          if (ck === csig) return; csig = ck;
          calls.innerHTML = '';
          if (p < 0.55) return;
          const R = root.getBoundingClientRect();
          s.call.forEach(([a, pos, text]) => {
            const nodes = a[0] === 'L' ? [LG[+a[1]].firstChild] : N[a];
            const r = union(nodes.map(n => n.getBoundingClientRect()));
            const d = document.createElement('div'); d.className = 'mpa-call'; d.textContent = text; calls.appendChild(d);
            const w = d.offsetWidth, h = d.offsetHeight, cx = (r.left + r.right) / 2 - R.left, cy = (r.top + r.bottom) / 2 - R.top;
            let x = cx - w / 2, y = cy - h / 2;
            if (pos === 'a') y = r.top - R.top - h - 8;
            if (pos === 'b') y = r.bottom - R.top + 8;
            if (pos === 'r') x = r.right - R.left + 8;
            if (pos === 'ibl') { x = r.left - R.left + 8; y = r.bottom - R.top - h - 8; }
            if (pos === 'itr') { x = r.right - R.left - w - 8; y = r.top - R.top + 8; }
            d.style.left = `${Math.max(6, Math.min(R.width - w - 6, x))}px`;
            d.style.top = `${Math.max(6, Math.min(R.height - h - 6, y))}px`;
          });
        }
      };
    }
  };

  /* ===================== Интерактив «Анатомия графика» ===================== */
  const ABOUT = {
    fig: ['fig', 'plt.gcf()', 'Лист, на котором лежит всё остальное: размер 8 × 4,5 дюйма, фон, сохранение в файл.'],
    axes: ['ax', 'plt.gca()', 'Область данных со своими координатами. На фигуре может быть несколько Axes, почти всё рисование — их методы.'],
    spines: ['ax.spines["top"]', 'plt.gca().spines["top"]', 'Четыре линии рамки. Это тоже объекты: любую можно спрятать отдельно.'],
    xaxis: ['ax.xaxis', 'plt.gca().xaxis', 'Ось X: деления, их подписи, локатор (где ставить деления) и форматтер (как их подписать).'],
    yaxis: ['ax.yaxis', 'plt.gca().yaxis', 'Ось Y: пределы 0–45 заданы явно, деления через 5 выбрал локатор.'],
    grid: ['ax.yaxis.get_gridlines()', 'plt.gca().yaxis.get_gridlines()', 'Линии сетки принадлежат делениям оси Y, grid делает их видимыми.'],
    l2024: ['ax.lines[0]', 'plt.gca().lines[0]', 'Ломаная из 12 точек. Цвет C0 — первый в цикле rcParams["axes.prop_cycle"].'],
    l2025: ['ax.lines[1]', 'plt.gca().lines[1]', 'Вторая линия, следующий цвет цикла — C1.'],
    title: ['ax.title', 'plt.gca().title', 'Заголовок. Text создан вместе с осями пустым, строка записала в него текст.'],
    ylabel: ['ax.yaxis.label', 'plt.gca().yaxis.label', 'Подпись принадлежит оси Y, а не Axes.'],
    legend: ['ax.get_legend()', 'plt.gca().get_legend()', 'Собирает подписи label= из линий. Своих данных у легенды нет.']
  };
  const LINE_OO = ['Создаёт фигуру и одни оси и возвращает обе ссылки. Вместе с Axes появляются рамка и обе оси с делениями по умолчанию.', 'Метод осей ax: линия попадает именно в эти оси.', 'Вторая линия в те же оси, цвет — следующий из цикла.', 'Ставит 12 делений оси X и подписи к ним.', 'Пределы оси Y; деления через 5 расставит локатор.', 'Включает линии сетки у делений оси Y.', 'Пишет строку в готовый Text заголовка.', 'Подпись оси Y — это ax.yaxis.label.', 'Создаёт Legend из линий с label=.', 'Рисует всё дерево объектов и пишет PNG.'];
  const LINE_PY = ['Создаёт фигуру и делает её текущей. Осей ещё нет.', 'plt.gca() ищет текущие оси, не находит и создаёт Axes. Только потом появляется линия.', 'Снова plt.gca(): оси уже есть, линия ложится в них.', 'То же, что plt.gca().set_xticks(…).', 'То же, что plt.gca().set_ylim(0, 45).', 'То же, что plt.gca().grid(axis="y").', 'То же, что plt.gca().set_title(…).', 'То же, что plt.gca().set_ylabel(…).', 'То же, что plt.gca().legend().', 'То же, что plt.gcf().savefig(…): сохраняет текущую фигуру.'];

  function buildAnatomy(box, api) {
    const { $, esc, hl, plural, copy } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Анатомия графика <i>интерактив</i></span><div class="ctrls"><span class="seg" role="group" aria-label="Стиль кода"><button type="button" data-m="oo" aria-pressed="true">объектный</button><button type="button" data-m="py" aria-pressed="false">pyplot</button></span><button type="button" class="btn ghost small" id="mpa-copy">Скопировать код</button><button type="button" class="btn ghost small" id="mpa-reset">Сбросить</button></div></div>
<p class="hint mpa-do">Наведите курсор на любую часть графика, даже на пустое поле, или на строку кода; на телефоне — коснитесь. Переключатель меняет код, картинка та же.</p>
<div class="mpa-w"><div class="mpa-w-fig" id="mpa-wfig"></div><div class="mpa-w-code" id="mpa-wcode" role="list" aria-label="Код графика"></div></div>
<div class="mpa-read" id="mpa-read" aria-live="polite"></div>
<div class="status"><span><span class="dot live"></span><span id="mpa-st1"></span></span><span id="mpa-st2"></span><span class="grow"></span><span id="mpa-st3"></span></div>`;
    const { svg, N } = build($('mpa-wfig'), 'w', false);
    svg.classList.add('mpa-wsvg');
    // невидимые зоны захвата: толстый прозрачный штрих у тонких линий, прямоугольник у подписей и делений
    ['l2024', 'l2025', 'grid', 'spines'].forEach(k => N[k].forEach(g => g.querySelectorAll('path').forEach(p0 => g.appendChild(el('path', { d: p0.getAttribute('d'), class: 'mpa-hit-l' })))));
    ['xaxis', 'yaxis', 'title', 'ylabel', 'legend'].forEach(k => N[k].forEach(g => { const b = bboxOf([g]); g.insertBefore(el('rect', { x: b.x - 3, y: b.y - 3, width: b.w + 6, height: b.h + 6, class: 'mpa-hit-b' }), g.firstChild); }));
    ALL.forEach(k => { const n = N[k][0]; n.setAttribute('tabindex', '0'); n.setAttribute('role', 'button'); n.setAttribute('aria-label', `${DATA.els[k].cls}: ${ABOUT[k][0]}`); });
    const ov = el('g', { class: 'mpa-ov' }); svg.appendChild(ov);
    const BB = {}; ALL.forEach(k => { BB[k] = bboxOf(N[k]); });
    let mode = 'oo', pin = null, hov = null, seen = new Set();
    const src = () => (mode === 'oo' ? OO : PY);
    function drawCode() {
      $('mpa-wcode').innerHTML = src().map((t, i) => i < F ? `<div class="mpa-ln prep" role="listitem"><span class="mpa-no">${i + 1}</span><span>${hl(t) || ' '}</span></div>`
        : `<button type="button" class="mpa-ln" data-i="${i}" role="listitem"><span class="mpa-no">${i + 1}</span><span>${hl(t)}</span></button>`).join('');
    }
    const lineEls = i => i === DATA.save[mode] ? ALL.slice() : ALL.filter(k => make(k, mode).includes(i) || (k !== 'legend' && tune(k, mode).includes(i)));
    function show() {
      const cur = hov || pin;
      let els = [], lines = [], soft = [];
      if (cur && cur.el) { els = [cur.el]; lines = make(cur.el, mode); soft = tune(cur.el, mode); }
      if (cur && cur.line != null) { els = lineEls(cur.line); lines = [cur.line]; }
      svg.classList.toggle('mpa-dim', els.length > 0 && els.length < ALL.length);
      ALL.forEach(k => N[k].forEach(n => n.classList.toggle('mpa-on', els.includes(k))));
      ov.innerHTML = els.length === ALL.length ? '' : els.map(k => { const b = BB[k], pad = k === 'fig' ? -2 : 3; return `<rect x="${b.x - pad}" y="${b.y - pad}" width="${b.w + 2 * pad}" height="${b.h + 2 * pad}" rx="3"/>`; }).join('');
      box.querySelectorAll('.mpa-ln[data-i]').forEach(b => { const i = +b.dataset.i; b.classList.toggle('on', lines.includes(i)); b.classList.toggle('tu', soft.includes(i)); });
      const R = $('mpa-read');
      if (!cur) R.innerHTML = '<p>Здесь появится, что это за объект, как до него добраться из кода и какая строка его создала.</p>';
      else if (cur.el) {
        const k = cur.el, a = ABOUT[k], m = make(k, mode);
        R.innerHTML = `<p><b class="mpa-cls">${esc(DATA.els[k].cls)}</b> <code>${esc(mode === 'oo' ? a[0] : a[1])}</code> · ${m.length ? `создаёт строка ${m.map(i => i + 1).join(', ')}` : ''}${tune(k, mode).length ? `, ${k === 'legend' ? 'подписи берёт из строк' : 'настраивает строка'} ${tune(k, mode).map(i => i + 1).join(', ')}` : ''}</p><p>${esc(a[2])}</p>`;
      } else {
        const i = cur.line, txt = (mode === 'oo' ? LINE_OO : LINE_PY)[i - F];
        R.innerHTML = `<p><b class="mpa-cls">Строка ${i + 1}</b> <code>${esc(src()[i].trim())}</code></p><p>${esc(txt)}${els.length && els.length < ALL.length ? ` На картинке: ${els.map(k => DATA.els[k].cls).filter((v, j, A) => A.indexOf(v) === j).join(', ')}.` : ''}</p>`;
      }
      $('mpa-st1').textContent = cur ? (cur.el ? `Объект: ${DATA.els[cur.el].cls} · строка ${make(cur.el, mode).map(i => i + 1).join(', ')}` : `Строка ${cur.line + 1}: ${els.length} ${plural(els.length, ['элемент', 'элемента', 'элементов'])}`) : 'Ничего не выбрано';
      $('mpa-st2').textContent = seen.size === ALL.length ? `Найдены все ${ALL.length} элементов` : `найдено на картинке: ${seen.size} из ${ALL.length}`;
      $('mpa-st3').textContent = DATA.same ? `PNG обоих кодов: ${DATA.px[0]}×${DATA.px[1]}, отличий 0 пикселей` : `PNG различаются в ${DATA.diff} пикселях`;
    }
    const pickEl = t => { const g = t.closest && t.closest('[data-el]'); return g ? g.dataset.el : null; };
    svg.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const k = pickEl(e.target); if (k) { hov = { el: k }; seen.add(k); show(); } });
    svg.addEventListener('pointerleave', () => { hov = null; show(); });
    svg.addEventListener('click', e => { const k = pickEl(e.target); if (!k) return; pin = pin && pin.el === k ? null : { el: k }; seen.add(k); hov = null; show(); });
    svg.addEventListener('focusin', e => { const k = pickEl(e.target); if (k) { hov = { el: k }; seen.add(k); show(); } });
    svg.addEventListener('focusout', () => { hov = null; show(); });
    svg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const k = pickEl(e.target); if (k) { e.preventDefault(); pin = pin && pin.el === k ? null : { el: k }; show(); } } });
    const codeBox = $('mpa-wcode');
    codeBox.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const b = e.target.closest('[data-i]'); if (b) { hov = { line: +b.dataset.i }; show(); } });
    codeBox.addEventListener('pointerleave', () => { hov = null; show(); });
    codeBox.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (!b) return; const i = +b.dataset.i; pin = pin && pin.line === i ? null : { line: i }; hov = null; show(); });
    codeBox.addEventListener('focusin', e => { const b = e.target.closest('[data-i]'); if (b) { hov = { line: +b.dataset.i }; show(); } });
    codeBox.addEventListener('focusout', () => { hov = null; show(); });
    box.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; box.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); drawCode(); show(); }));
    $('mpa-copy').addEventListener('click', () => copy(src().join('\n'), mode === 'oo' ? 'Объектный код скопирован' : 'Код на pyplot скопирован'));
    $('mpa-reset').addEventListener('click', () => { mode = 'oo'; pin = null; hov = null; seen = new Set(); box.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.m === 'oo'))); drawCode(); show(); });
    drawCode(); show();
    return {
      describe() {
        const cur = pin;
        return `стиль кода: ${mode === 'oo' ? 'объектный' : 'pyplot'}; ${cur ? (cur.el ? `выбран элемент ${DATA.els[cur.el].cls} (${mode === 'oo' ? ABOUT[cur.el][0] : ABOUT[cur.el][1]}), его создаёт строка ${make(cur.el, mode).map(i => `«${src()[i].trim()}»`).join(', ')}` : `выбрана строка «${src()[cur.line].trim()}»`) : 'ничего не выбрано'}; найдено элементов на картинке: ${seen.size} из ${ALL.length}.`;
      }
    };
  }

  CODE.twice.note = 'Тот же код, разнесённый по двум ячейкам Jupyter, даёт два отдельных графика: в конце ячейки встроенный вывод показывает фигуру и закрывает её.';
  CODE.sns.note = 'sns.set_theme меняет rcParams до конца сессии, поэтому и левый график, нарисованный pandas, получил сетку, светлую рамку и крупный шрифт seaborn.';

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-8-1',
    short: 'DA-08',
    title: 'Устройство графика в Matplotlib',
    where: 'блок «Дата аналитика», тема 08 «Визуализация в Python», страница 8.1',
    aiData: 'учебная выручка интернет-магазина по месяцам за 2024 и 2025 годы (sales_monthly.csv: месяц × 10 каналов × 4 страны) и график «2025-й выше 2024-го в каждом месяце»',
    scene,
    widgets: { anatomy: buildAnatomy },
    code: CODE,
    questions: {
    q1: { sec: 'anatomy', title: 'Сначала предскажите', q: 'В pyplot-коде нет строки, которая явно создаёт оси (Axes). Какая строка их создаёт?', opts: [['plt.figure(figsize=(8, 4.5))'], ['Первый plt.plot(...)', 1], ['plt.xticks(t.index, MONTHS)'], ['Никакая: pyplot рисует линии прямо на фигуре']],
      why: 'plt.figure создаёт только фигуру. Первый plt.plot вызывает plt.gca() — «дай текущие оси», — их нет, и gca создаёт Axes на текущей фигуре; только потом появляется линия. plt.xticks работает с уже готовыми осями, а без Axes линию положить некуда. Проверьте в интерактиве: режим pyplot, наведите на рамку графика.' },
    q2: { sec: 'idea', q: 'Строка fig, ax = plt.subplots() вернула два объекта. Чем fig отличается от ax?', opts: [['fig — лист со всеми осями, ax — одна область данных с координатами на этом листе', 1], ['fig — готовая PNG-картинка, ax — её оси X и Y'], ['Ничем: это две ссылки на один объект'], ['fig отвечает за данные, ax — за оформление']],
      why: 'Figure — корень дерева: размер, фон, все Axes и сохранение в файл. Axes — прямоугольник внутри фигуры с пределами, делениями, линиями и подписями; на одной фигуре их может быть несколько. Оси X и Y — это Axis внутри Axes, а не сам ax, а PNG появляется только после savefig.' },
    q3: { sec: 'nuances', q: 'Скрипт сохраняет два графика. Почему в y2025.png обе линии и заголовок «2025»?', code: 'plt.plot(t.index, t["2024"])\nplt.title("2024")\nplt.savefig("y2024.png")\n\nplt.plot(t.index, t["2025"])\nplt.title("2025")\nplt.savefig("y2025.png")', opts: [['savefig очищает фигуру, только если сохранять в SVG'], ['Фигура после savefig осталась открытой и текущей, и второй plt.plot добавил линию в те же оси', 1], ['plt.title("2025") создал новую фигуру, а линии остались в старой'], ['Matplotlib склеивает линии с одинаковыми значениями по оси X']],
      why: 'savefig сохраняет фигуру, но не закрывает её. Второй plt.plot спрашивает plt.gca(), получает те же оси и кладёт туда вторую линию, а plt.title переписывает заголовок. В Jupyter это незаметно, если графики в разных ячейках: встроенный вывод закрывает фигуру в конце ячейки. Лечится своим fig, ax = plt.subplots() на каждый график и plt.close(fig).' },
    q4: { sec: 'idea', q: 'График пойдёт в веб-статью: её откроют и на телефоне, и на мониторе 4K, а подпись на графике, возможно, придётся поправить. Какой формат выбрать?', opts: [['PNG с dpi=72: файл меньше'], ['SVG: линии и текст хранятся как описание фигур и остаются чёткими при любом масштабе', 1], ['PNG с dpi=600: хватит на любой экран'], ['Неважно: браузер всё равно превращает картинку в пиксели']],
      why: 'PNG — сетка пикселей фиксированного размера: при увеличении она расплывается, а dpi=600 даёт тяжёлый файл. SVG описывает линии и текст, и браузер рисует их под размер экрана; с svg.fonttype="none" подписи остаются текстом, их можно найти и поправить. PNG нужен там, где SVG не открывают, — в письмах, мессенджерах, части презентаций — и для графиков из десятков тысяч точек, где SVG разбухает.' },
    q5: { sec: 'code', q: 'Как обратиться к нижнему левому графику и что у него общего с верхним левым?', code: 'fig, axes = plt.subplots(2, 2, figsize=(10, 6), sharex="col")', opts: [['axes[1, 0]; у них одна ось X: общие пределы, подписи делений только внизу', 1], ['axes[0, 1]; у них одна ось Y'], ['axes[2]; общая у них только фигура'], ['axes.bottom_left; у них общий заголовок']],
      why: 'subplots(2, 2) возвращает массив NumPy 2 × 2: первый индекс — строка, второй — столбец, поэтому нижний левый — axes[1, 0]. sharex="col" связывает ось X внутри каждого столбца: пределы общие, а подписи делений Matplotlib оставляет у нижнего графика. axes[0, 1] — верхний правый, axes[2] выйдет за границы массива из двух строк, а атрибута bottom_left нет.' },
    q6: { sec: 'code', q: 'sns.lineplot(...) вернул ax. Как поставить над графиком заголовок-вывод?', opts: [['sns.title("…")'], ['ax.set_title("…")', 1], ['sns.set_theme(title="…")'], ['Никак: seaborn отдаёт картинку, а не объекты Matplotlib']],
      why: 'Функции seaborn уровня осей рисуют в Axes Matplotlib и возвращают их, поэтому дальше работают обычные методы: set_title, set_ylabel, set_major_formatter. Функции sns.title нет, а set_theme меняет стиль — значения rcParams, — а не подписи конкретного графика.' },
    q7: { sec: 'nuances', q: 'Фигура создана с figsize=(8, 4.5) и сохранена с dpi=200. Какого размера PNG?', opts: [['800 × 450 пикселей'], ['1600 × 900 пикселей', 1], ['8 × 4,5 — размер в дюймах не меняется'], ['Зависит от размера окна браузера']],
      why: 'Пиксели = дюймы × dpi: 8 × 200 = 1600 и 4,5 × 200 = 900. 800 × 450 получится при dpi 100 — значении фигуры по умолчанию. Окно не важно: savefig рисует фигуру заново по её размеру; итог меняет только bbox_inches="tight", который обрезает пустые поля.' }
    },
    glossary: {
      figure: { t: 'Фигура', en: 'Figure', d: 'Корневой объект графика: лист с размером в дюймах, фоном и всеми осями. Сохраняется в файл целиком через fig.savefig.' },
      axes: { t: 'Оси', en: 'Axes', d: 'Область данных внутри фигуры со своими пределами, делениями, линиями и подписями. Почти все методы рисования — методы Axes.' },
      artist: { t: 'Художник', en: 'Artist', d: 'Любой объект, который Matplotlib рисует: линия, текст, прямоугольник, легенда, сами оси и фигура.' },
      pyplot: { t: 'pyplot', en: 'matplotlib.pyplot', d: 'Модуль, работающий как машина состояний: помнит текущую фигуру и текущие оси и отправляет туда каждую команду plt.*.' },
      oo: { t: 'Объектный интерфейс', en: 'explicit, object-oriented interface', d: 'Стиль кода, где вы держите ссылки fig и ax и вызываете их методы: ax.plot, ax.set_title, fig.savefig.' },
      axis: { t: 'Ось', en: 'Axis', d: 'Одна ось внутри Axes, XAxis или YAxis: деления, их подписи, локатор и форматтер.' },
      tick: { t: 'Деление', en: 'tick', d: 'Засечка на оси с подписью и, если включена, линией сетки. Где ставить деления, решает локатор оси.' },
      formatter: { t: 'Форматтер', en: 'Formatter', d: 'Объект оси, который превращает число деления в подпись: «35», «35 млн ₽», «01.03».' },
      dpi: { t: 'dpi', en: 'dots per inch', d: 'Точек на дюйм: сколько пикселей приходится на дюйм фигуры. Размер PNG в пикселях равен figsize × dpi.' },
      subplots: { t: 'plt.subplots', en: 'subplots', d: 'Функция, которая создаёт фигуру и сетку осей и возвращает их: fig, ax для одного графика или fig, axes для сетки.' },
      sharex: { t: 'Общая ось', en: 'sharex, sharey', d: 'Связь осей соседних графиков: одинаковые пределы, подписи делений только у крайних.' },
      rcparams: { t: 'rcParams', en: 'runtime configuration', d: 'Словарь настроек Matplotlib по умолчанию: размер фигуры, шрифт, цвета, dpi. Всё, что не задано в вызове, берётся отсюда.' },
      style: { t: 'Стиль', en: 'style sheet', d: 'Набор значений rcParams под одним именем или в файле .mplstyle. Включается plt.style.use, временно — plt.style.context.' },
      raster: { t: 'Растровая графика', en: 'raster image, PNG', d: 'Картинка как сетка пикселей фиксированного размера. При увеличении теряет чёткость.' },
      vector: { t: 'Векторная графика', en: 'vector image, SVG', d: 'Картинка как описание линий, фигур и текста. Рисуется под любой размер без потери чёткости.' },
      backend: { t: 'Бэкенд', en: 'backend', d: 'Часть Matplotlib, которая выводит фигуру: в окно, в ноутбук (inline) или только в файл (Agg).' },
      glyph: { t: 'Глиф', en: 'glyph', d: 'Рисунок одного символа в шрифте. Нет глифа — вместо буквы появляется пустой квадрат.' }
    },
    materials: [
      ['da-8-1-matplotlib-anatomy.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/viz/', 'Учебные данные темы 08 — общий набор: выручка магазина sales_monthly.csv, месяц × канал × страна, 960 строк'],
      ['data/eda/', 'Учебные данные темы 07 — общий набор: здесь нужны дневные метрики daily_metrics.csv для дат на оси'],
      ['matplotlib_anatomy.ipynb', 'Ноутбук: оба кода «Анатомии», блоки раздела «Код» и нюансы по ячейкам']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне пять вопросов по источнику о Figure, Axes, Axis и Artist. По одному за раз; после моего ответа объясни, где я ошибся, со ссылкой на текст источника.'],
      ['Из pyplot в объектный стиль', 'Я вставлю свой код на pyplot. Не переписывай его сразу: сначала спроси, какие фигуры и оси в нём создаются неявно, потом помоги мне самому переписать код на fig, ax по таблице соответствий из источника.'],
      ['Разбор чужого графика', 'Я опишу график из отчёта. Помоги мне назвать каждый его элемент так, как его называет Matplotlib (Figure, Axes, Axis, Line2D, Text, Legend), и найти метод, который его настраивает. Опирайся на источник.']
    ]
  };
})();
