"""Материалы страницы 1.4: генератор выгрузки, сама выгрузка и четыре скрипта из блоков кода."""
import hashlib
import shutil

# Файл, на котором проверены числа страницы: 1 199 заказов читаются, выручка 5 407 920 ₽
ORDERS_SHA = "cdf08144ddb9c4fbda0952c4f8b930b7fd76c89029b90ab9121875d2434fa98b"


def build(m):
    # Выгрузку делает генератор; в материалы кладём то, что он записал
    m.take("gen_orders.py")
    m.run(["python", "gen_orders.py"])
    made = m.work / "data" / "orders.csv"
    m.check("gen_orders.py: файл совпадает с выгрузкой, на которой проверена страница",
            hashlib.sha256(made.read_bytes()).hexdigest() == ORDERS_SHA)
    (m.out / "data").mkdir()
    shutil.copy2(made, m.out / "data" / "orders.csv")
    raw = made.read_bytes().split(b"\n")
    m.check("data/orders.csv: заголовок и 1 200 заказов, строка 1 000 не читается как UTF-8",
            len(raw) == 1202 and raw[-1] == b"" and _bad(raw) == [1000], str(_bad(raw)))

    # Блок 1: без try скрипт падает. На странице файл назван read_orders.py, в материалах он read_orders_v0.py
    m.put("read_orders_v0.py", m.page_code("crash"))
    r = m.run(["python", "read_orders_v0.py"], code=1)
    m.same("python read_orders_v0.py: трассировка как на странице",
           (r.stdout + r.stderr).replace("read_orders_v0.py", "read_orders.py"), m.page_out("crash"), "contains")

    # Блоки 2–4: вывод совпадает со страницей дословно
    m.script("read_orders.py", "count")
    m.script("report.py", "report")
    m.script("log_line.py", "logline")
    log = (m.work / "errors.log").read_text("utf-8")
    m.check("log_line.py: в errors.log одна строка с номером 1000", log.startswith("1000\tUnicodeDecodeError\t") and log.count("\n") == 1)


def _bad(raw):
    bad = []
    for n, line in enumerate(raw[:-1], start=1):
        try:
            line.decode("utf-8")
        except UnicodeDecodeError:
            bad.append(n)
    return bad
