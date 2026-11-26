"""Материалы страницы 8.1: ноутбук с обоими кодами «Анатомии», четырьмя блоками раздела «Код» и четырьмя нюансами.
Данные — общие наборы data/viz (тема 08) и data/eda (тема 07, для дат на оси)."""
import json
import re

MADE = ["anatomy.png", "anatomy_pyplot.png", "revenue_yoy.png", "revenue_yoy.svg", "grid.png", "charts",
        "pandas_vs_seaborn.png", "chart_72.png", "chart_100.png", "chart_200.png", "chart_tight.png", "chart.svg",
        "dates.png", "y2024.png", "y2025.png"]


def stream(cell, name=None):
    return "".join(o.get("text", "") for o in cell.get("outputs", [])
                   if o.get("output_type") == "stream" and (name is None or o.get("name") == name))


def build(m):
    m.use_data("viz")
    m.use_data("eda")
    m.versions = "Код проверен на Python 3.13, pandas 3.0, matplotlib 3.10 и seaborn 0.13."

    # оба кода «Анатомии» страница берёт из data/code/ и вставляет в интерактив; в ноутбук идут те же файлы
    code = m.pdir / "data" / "code"
    js = (m.pdir / "page.js").read_text("utf-8")
    for key, title in (("anatomy_oo", "Объектный интерфейс Matplotlib"),
                       ("anatomy_pyplot", "Работа с текущей фигурой через pyplot")):
        src = (code / f"{key}.py").read_text("utf-8").rstrip()
        m.code[key] = {"title": title, "code": src, "out": ""}
        m.check(f"код «{key}» в ноутбуке тот же, что в интерактиве страницы", json.dumps(src, ensure_ascii=False) in js)

    nb = m.notebook("matplotlib_anatomy.ipynb", "matplotlib_anatomy.nb.py", "main")
    m.from_reader_folder("matplotlib_anatomy.ipynb")
    m.check("ноутбук не оставил картинки в материалах страницы", not any((m.out / n).exists() for n in MADE))

    # на странице каждый блок — отдельный запуск с подготовкой данных из «Анатомии»; в ноутбуке сессия одна.
    # Картинки должны выйти теми же. y2025.png не сверяем: его перезаписывает пример «двумя ячейками».
    ref = m.alone([code / "anatomy_oo.py", code / "anatomy_pyplot.py", code / "pub.py"])
    ref2 = m.alone([code / f"{k}.py" for k in ("grid", "tmpl", "sns", "dpi", "dates", "twice")], prelude=code / "prelude.py")
    m.pictures("картинки «Анатомии» и блока публикации в ноутбуке те же, что при отдельном запуске", ref,
               ["anatomy.png", "anatomy_pyplot.png", "revenue_yoy.png", "revenue_yoy.svg"])
    m.pictures("картинки сетки, шаблона, seaborn и нюансов в ноутбуке те же, что при отдельном запуске", ref2,
               ["grid.png", *[f"charts/{i:02d}.png" for i in range(10)], "pandas_vs_seaborn.png",
                "chart_72.png", "chart_100.png", "chart_200.png", "chart_tight.png", "chart.svg", "dates.png", "y2024.png"])

    cells = [c for c in nb.cells if c.cell_type == "code"]
    find = lambda part: next(c for c in cells if part in c.source)

    out = stream(find('plt.imread("anatomy.png")'))
    m.check("PNG двух кодов «Анатомии» совпали попиксельно, 800 × 450, как на странице",
            "anatomy.png: 800 × 450 px | anatomy_pyplot.png: 800 × 450 px" in out and "различающихся пикселей: 0" in out, out)

    out = stream(find("plt.rcdefaults()"))
    m.check("после seaborn и блока публикации настройки отличались от умолчания, plt.rcdefaults() вернул их",
            re.search(r"отличных от умолчания: [1-9]\d*\n", out) and "после plt.rcdefaults(): 0" in out, out)

    # шрифты: на странице вывод и предупреждения слиты и свёрнуты; в ноутбуке сверяем вывод и суть предупреждений
    c = find('rc_context({"font.family": "cmr10"})')
    so, se = stream(c, "stdout"), stream(c, "stderr")
    page = [l for l in m.page_out("fonts").split("\n") if not re.match(r"findfont|fonts\.py|… та же", l)]
    m.same("matplotlib_anatomy.ipynb: блок «fonts», строки вывода без предупреждений", so, "\n".join(page))
    glyphs = set(re.findall(r"Glyph (\d+) ", se))
    page_glyphs = set(re.findall(r"Glyph (\d+) ", m.page_out("fonts")))
    m.check("блок «fonts»: Analytics101MissingFont не найден и заменён на DejaVu Sans; в cmr10 нет тех же 11 знаков, что на странице",
            "Font family 'Analytics101MissingFont' not found." in se and "Falling back to DejaVu Sans." in se
            and glyphs == page_glyphs and len(glyphs) == 11, f"{sorted(glyphs)} / {sorted(page_glyphs)}\n{se[:600]}")

    two = [c for c in cells if 'plt.savefig("y2025.png")' in c.source][-1]
    out = stream(two)
    m.check("тот же код двумя ячейками даёт отдельный график: одна фигура, одна линия, заголовок «2025»",
            "открытых фигур: [1]" in out and "линий на текущих осях: 1" in out and "заголовок: 2025" in out, out)

    out = stream(cells[-1])
    got = set(re.sub(r"^\d+ новых: ", "", out.strip()).replace("/", "").split(", "))
    m.check("последняя ячейка перечисляет 15 файлов и папок, которые сохранил код", got == set(MADE) and out.startswith("15 новых:"), out)
