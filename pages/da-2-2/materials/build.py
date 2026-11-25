"""Материалы страницы 2.2: генератор, данные трёх источников, учебный сервер API и пять скриптов."""
import os
import shutil
import subprocess
import sys
import time

TOKEN = "uchebny-klyuch-2026"            # учебный ключ: настоящих секретов в материалах нет


def build(m):
    os.environ["SHOP_API_TOKEN"] = TOKEN

    # Данные делает генератор; в материалы кладём то, что он записал
    m.take("gen_data.py")
    m.run(["python", "gen_data.py"])
    (m.out / "data").mkdir()
    for name in ("orders_crm.csv", "crm_by_month.xlsx", "shop.db", "app_orders.json"):
        shutil.copy2(m.work / "data" / name, m.out / "data" / name)
    crm = (m.out / "data" / "orders_crm.csv").read_bytes()
    m.check("data/orders_crm.csv: 8 заказов в cp1251, как UTF-8 не читается",
            crm.count(b"\n") == 9 and _not_utf8(crm))

    # Три скрипта без сети: вывод дословно как на странице
    m.script("read_excel.py", "excel")
    m.script("load_csv.py", "csv")
    m.script("load_db.py", "db")

    # Два скрипта ходят в учебный API: поднимаем сервер из материалов
    m.take("api_server.py")
    m.put("load_api.py", m.page_code("api"))
    m.put("save_parquet.py", m.page_code("parquet"))
    m.sync()
    server = subprocess.Popen([sys.executable, "api_server.py"], cwd=m.work)
    try:
        time.sleep(1.5)
        m.run(["python", "load_api.py"], expect=m.page_out("api"))
        time.sleep(2.5)                      # лимит сервера: не чаще запроса в 2 секунды
        m.run(["python", "save_parquet.py"], expect=m.page_out("parquet"))
    finally:
        server.terminate()
        server.wait(timeout=10)

    # То же на PostgreSQL 16, если сервер доступен: примечание к блоку «Запрос с параметрами»
    _postgres(m)

    m.extra = (
        "Папка `data/` уже содержит учебные данные. Чтобы создать их заново, выполните "
        "`python gen_data.py`. Скрипты `read_excel.py`, `load_csv.py` и `load_db.py` можно запустить сразу.\n\n"
        "Для `load_api.py` и `save_parquet.py` нужны два терминала в папке с материалами. "
        "В обоих задайте один и тот же учебный ключ. В PowerShell выполните "
        "`$env:SHOP_API_TOKEN = \"uchebny-klyuch-2026\"`, в Bash — `export SHOP_API_TOKEN=uchebny-klyuch-2026`.\n\n"
        "В первом терминале запустите `python api_server.py` и оставьте его открытым. "
        "Во втором выполните `python load_api.py` или `python save_parquet.py`. "
        "Сервер по адресу 127.0.0.1:8765 принимает один запрос в две секунды. "
        "Если следующий запрос придёт раньше, клиент получит код 429 и повторит запрос после паузы.\n\n"
        "Скрипт `load_db.py` использует локальную базу SQLite. С начальной датой 1 декабря "
        "запрос вернёт 15 заказов, с 1 января — 12. Конечная дата в обоих случаях — 1 апреля.\n\n"
        "Для запуска примеров нужны pandas, openpyxl, SQLAlchemy, requests и pyarrow."
    )


def _not_utf8(data):
    try:
        data.decode("utf-8")
        return False
    except UnicodeDecodeError:
        return True


def _postgres(m):
    try:
        import pandas as pd
        from sqlalchemy import create_engine, text
        engine = create_engine("postgresql+psycopg://postgres@/postgres?host=/tmp")
        connection = engine.connect()
    except Exception as e:                                   # noqa: BLE001
        print(f"   ! PostgreSQL недоступен, проверка пропущена: {str(e).splitlines()[0][:80]}")
        return

    # Временная таблица существует только в этом соединении.
    with connection as conn:
        conn.execute(text("CREATE TEMP TABLE orders (order_date date) ON COMMIT DROP"))
        src = create_engine(f"sqlite:///{m.out / 'data' / 'shop.db'}")
        with src.connect() as db:
            dates = pd.read_sql(text("SELECT order_date FROM orders"), db)["order_date"]
        src.dispose()
        conn.execute(text("INSERT INTO pg_temp.orders (order_date) VALUES (CAST(:date AS date))"),
                     [{"date": date} for date in dates])
        query = text("SELECT order_date FROM pg_temp.orders WHERE order_date >= :start AND order_date < :end")
        for start, n in (("2025-12-01", 15), ("2026-01-01", 12)):
            rows = pd.read_sql(query, conn, params={"start": start, "end": "2026-04-01"})
            m.check(f"PostgreSQL: период с {start}, заказов: {n}", len(rows) == n, str(len(rows)))
    engine.dispose()
