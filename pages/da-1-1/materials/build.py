"""Материалы страницы 1.1: два ноутбука из анимации и тот же расчёт скриптом."""
import json


def build(m):
    # Ноутбуки лежат готовыми файлами: от их точного содержимого зависит размер checked.ipynb на странице
    m.take("orders_report.ipynb")
    m.take("orders_report_fixed.ipynb")
    for name in ("orders_report.ipynb", "orders_report_fixed.ipynb"):
        nb = json.loads((m.out / name).read_text("utf-8"))
        cells = nb["cells"]
        m.check(f"{name}: пять ячеек кода без вывода",
                len(cells) == 5 and all(c["cell_type"] == "code" and not c["outputs"] for c in cells))

    # Блок «Проверка с чистого листа»: первая команда падает, вторая пишет checked.ipynb
    r1 = m.run(["jupyter", "nbconvert", "--to", "notebook", "--execute", "orders_report.ipynb"], code=1,
               what="nbconvert orders_report.ipynb")
    r2 = m.run(["jupyter", "nbconvert", "--to", "notebook", "--execute", "orders_report_fixed.ipynb",
                "--output", "checked.ipynb"], what="nbconvert orders_report_fixed.ipynb")
    m.same("nbconvert: вывод двух команд как на странице", r1.stdout + r1.stderr + r2.stdout + r2.stderr,
           m.page_out("check"), "contains")
    done = json.loads((m.work / "checked.ipynb").read_text("utf-8"))["cells"]
    m.check("checked.ipynb: номера In [1]–In [5] подряд", [c["execution_count"] for c in done] == [1, 2, 3, 4, 5])
    last = "".join(done[-1]["outputs"][0]["text"]).strip()
    m.check("checked.ipynb: последняя ячейка печатает итог со страницы",
            last == "Выручка: 6066 ₽, средний чек: 1213 ₽", last)

    # Блок «Тот же расчёт как скрипт»
    m.script("report.py", "script")
