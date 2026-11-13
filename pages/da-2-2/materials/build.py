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
        "Порядок запуска. `python gen_data.py` пересоздаёт папку `data/` — она уже лежит готовой. "
        "`read_excel.py`, `load_csv.py` и `load_db.py` запускаются сразу.\n\n"
        "`load_api.py` и `save_parquet.py` обращаются к учебному серверу. Откройте второй терминал, задайте "
        "в обоих один и тот же учебный ключ и запустите сервер:\n\n"
        "```\n"
        "export SHOP_API_TOKEN=uchebny-klyuch-2026      # Windows PowerShell: $env:SHOP_API_TOKEN = \"uchebny-klyuch-2026\"\n"
        "python api_server.py\n"
        "```\n\n"
        "Сервер слушает адрес 127.0.0.1:8765 и принимает не больше запроса в две секунды. "
        "Между запусками скриптов подождите пару секунд, иначе первый же запрос получит ответ 429.\n\n"
        "База в примере — SQLite, чтобы не поднимать сервер. Тот же запрос проверен на PostgreSQL 16: "
        "меняется только строка подключения в `load_db.py`. Последняя строка вывода там другая: "
        "вместо «параметры: 12 строк» PostgreSQL отвечает ошибкой `invalid input syntax for type date`.\n\n"
        "Нужны pandas, openpyxl, SQLAlchemy, requests и pyarrow."
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
        from sqlalchemy import create_engine, text, types
        adm = create_engine("postgresql+psycopg://postgres@/postgres?host=/tmp", isolation_level="AUTOCOMMIT")
        with adm.connect() as c:
            c.execute(text("DROP DATABASE IF EXISTS mat22"))
            c.execute(text("CREATE DATABASE mat22"))
    except Exception as e:                                   # noqa: BLE001
        print(f"   ! PostgreSQL недоступен, проверка примечания пропущена: {str(e).splitlines()[0][:80]}")
        return
    engine = create_engine("postgresql+psycopg://postgres@/mat22?host=/tmp")
    src = pd.read_sql("SELECT * FROM orders", create_engine(f"sqlite:///{m.out / 'data' / 'shop.db'}"),
                      parse_dates=["order_date"])
    src["order_date"] = src["order_date"].dt.date
    src.to_sql("orders", engine, index=False, dtype={"order_date": types.Date()})
    query = text("SELECT order_id FROM orders WHERE order_date >= :start AND order_date < :end ORDER BY order_id")
    ok = pd.read_sql(query, engine, params={"start": "2026-01-01", "end": "2026-04-01"})
    m.check("PostgreSQL 16: тот же запрос с параметрами даёт 12 строк", len(ok) == 12, str(len(ok)))
    bad = "2026-04-01' OR '1'='1"
    n = pd.read_sql(text(f"SELECT count(*) AS n FROM orders WHERE order_date >= '2026-01-01' AND order_date < '{bad}'"),
                    engine)["n"].iloc[0]
    m.check("PostgreSQL 16: f-строка с инъекцией возвращает все 15 строк", n == 15, str(n))
    try:
        pd.read_sql(query, engine, params={"start": "2026-01-01", "end": bad})
        err = ""
    except Exception as e:                                   # noqa: BLE001
        err = str(e)
    m.check("PostgreSQL 16: то же значение в параметре — ошибка invalid input syntax for type date",
            "invalid input syntax for type date" in err, err[:120])
    engine.dispose()
    with adm.connect() as c:
        c.execute(text("DROP DATABASE mat22"))
