"""Материалы страницы 2.1: выгрузка на 100 000 заказов, ноутбук с упражнениями, решения, тренажёр выборки."""
import contextlib
import io

import pandas as pd


def build(m):
    # orders_2026q1.csv — таблица orders из первого блока кода (зерно 9), как есть
    ns = {}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(m.page_code("info"), ns)
    orders = ns["orders"]
    path = m.out / "orders_2026q1.csv"
    orders.to_csv(path, index=False, lineterminator="\n")
    back = pd.read_csv(path, parse_dates=["date"])
    m.check("orders_2026q1.csv: 100 000 строк, после чтения с parse_dates таблица совпадает с выгрузкой из кода",
            len(back) == 100_000 and back.equals(orders), f"{len(back)} строк, типы {back.dtypes.astype(str).to_dict()}")

    # Ноутбуки: время в двух замерах скрыто маской, остальное сверяется дословно
    m.notebook("dataframe_inside.ipynb", "dataframe_inside.nb.py", "main")
    m.notebook("dataframe_inside_solutions.ipynb", "dataframe_inside.nb.py", "solutions")

    # Тренажёр: ответы записаны в хвосте скрипта
    m.take("loc_iloc_drill.py")
    m.said("loc_iloc_drill.py")
