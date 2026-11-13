"""Материалы страницы 1.3: выгрузка из восьми заказов, папка exports, ноутбук с упражнениями,
решения, скрипт трассы интерактива и сборка файла на миллион строк."""
import contextlib
import hashlib
import io


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build(m):
    # orders_sample.csv — восемь строк из блока «Функция очистки бренда», как есть
    ns = {}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(m.page_code("brand"), ns)
    rows = ns["rows"]
    m.put("orders_sample.csv", "brand,amount,status\n" + "".join(f"{r['brand']},{r['amount']},{r['status']}\n" for r in rows))
    m.check("orders_sample.csv: восемь заказов, оплачено на 7 880 ₽, как на странице",
            len(rows) == 8 and sum(r["amount"] for r in rows if r["status"] == "paid") == 7880)

    # Папка exports: семь файлов, собрана один раз скриптом _make_exports.py
    m.take("exports")
    m.check("exports: семь файлов", len(list((m.out / "exports").iterdir())) == 7)

    # Файл на миллион строк: в материалы идёт скрипт, а не 23 МБ данных
    m.take("make_orders_big.py")
    m.run(["python", "make_orders_big.py"])
    big = m.work / "orders_big.csv"
    size = big.stat().st_size
    with open(big, encoding="utf-8") as f:
        lines = sum(1 for _ in f)
    # 23,5 млн байт: «около 23 МБ» и в десятичных мегабайтах (23,5), и в двоичных (22,4)
    m.check("make_orders_big.py: миллион строк и заголовок, 23 513 925 байт («около 23 МБ» в примечании к блоку)",
            lines == 1_000_001 and size == 23_513_925, f"{lines} строк, {size} байт")
    made = sha(big)

    # Ноутбук с упражнениями: файлов рядом нет, ячейка подготовки создаёт их сама
    m.notebook("loops_functions.ipynb", "loops_functions.nb.py", "main", without=("exports", "orders_big.csv"))
    m.check("ноутбук собрал тот же orders_big.csv, что и make_orders_big.py", sha(m.work / "orders_big.csv") == made)
    # Ноутбук с решениями: файлы из материалов лежат рядом
    m.notebook("loops_functions_solutions.ipynb", "loops_functions.nb.py", "solutions")

    # Скрипт трассы: его trace.json должен совпасть с данными, встроенными в страницу
    m.take("trace_paid_brands.py")
    m.run(["python", "trace_paid_brands.py"])
    trace = (m.work / "trace.json").read_text("utf-8")
    m.check("trace_paid_brands.py: trace.json совпадает с трассой в page.js",
            trace in (m.pdir / "page.js").read_text("utf-8"), f"{len(trace)} символов")
