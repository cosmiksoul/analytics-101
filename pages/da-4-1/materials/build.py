"""Материалы страницы 4.1: ноутбук с упражнениями на формы массивов, решения, расчёт таблицы «Ограничений».
Данные — общие наборы data/clients (тема 04) и data/shop (тема 03)."""
import re


def build(m):
    m.use_data("clients")
    m.use_data("shop")

    # Ноутбуки из одного исходника: шесть блоков страницы сверяются с её выводом дословно
    m.notebook("vectors_numpy.ipynb", "vectors_numpy.nb.py", "main")
    m.notebook("vectors_numpy_solutions.ipynb", "vectors_numpy.nb.py", "solutions")
    m.from_reader_folder("vectors_numpy_solutions.ipynb")

    # curse.py: вывод записан в хвосте скрипта и совпадает с таблицей раздела «Ограничения»
    m.take("curse.py")
    m.said("curse.py")
    r = m.run(["python", "curse.py"], what="python curse.py (сверка с таблицей страницы)")
    got = [tuple(line.split()) for line in r.stdout.strip().split("\n")[1:]]
    rows = re.findall(r"<tr><td>(\d+)</td><td>([\d,]+)</td><td>([\d,]+)</td><td>([\d,]+)</td><td>(\d+)%</td></tr>",
                      (m.pdir / "article.html").read_text("utf-8"))
    page = [(a, b.replace(",", "."), c.replace(",", "."), d.replace(",", "."), e + "%") for a, b, c, d, e in rows]
    m.check("curse.py: пять строк совпадают с таблицей «Ограничений» на странице", len(page) == 5 and got == page,
            f"\n      страница: {page}\n      скрипт:   {got}")
