"""Материалы страницы 8.4: ноутбук с пятью блоками кода и файл стиля textbook.mplstyle.
Данные — общий набор data/viz (тема 08)."""

SVGS = ["highlight.svg", "labels.svg", "annotated.svg", "styled.svg"]


def build(m):
    m.use_data("viz")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0 и matplotlib 3.10."
    code = m.pdir / "data" / "code"

    m.take("textbook.mplstyle", "../data/code/textbook.mplstyle")
    style = (m.out / "textbook.mplstyle").read_text("utf-8")
    m.check("textbook.mplstyle — тот же файл, что показан блоком на странице", style.rstrip("\n") == m.page_code("style_file").rstrip("\n"))

    nb = m.notebook("chart_argument.ipynb", "chart_argument.nb.py", "main")
    # на странице блоки выполняются подряд в одном процессе; рисунки ноутбука должны выйти теми же
    ref = m.alone([code / f for f in ("01_highlight.py", "02_labels.py", "03_annotate.py", "04_style.py", "05_palette.py")],
                  together=True, files=[code / "textbook.mplstyle"])
    m.pictures("рисунки ноутбука те же, что дают блоки страницы, выполненные подряд одним скриптом", ref, SVGS)
    m.from_reader_folder("chart_argument.ipynb")
    m.check("ноутбук не оставил рисунки в материалах страницы", not any((m.out / n).exists() for n in SVGS))

    cell = next(c for c in nb.cells if c.cell_type == "code" and c.source.startswith("print(pathlib.Path(\"textbook.mplstyle\")"))
    shown = "".join(o.get("text", "") for o in cell.outputs if o.get("output_type") == "stream")
    m.check("ноутбук печатает файл стиля целиком, как блок страницы", shown.strip("\n") == style.strip("\n"))
    m.check("в стиле семь цветов палитры Окабе — Ито, записанных без «#»",
            'cycler("color", ["0072B2", "D55E00", "009E73", "CC79A7", "E69F00", "56B4E9", "000000"])' in style)
