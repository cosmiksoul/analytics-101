"""Материалы страницы 9.1: запрос сессий для PostgreSQL, ноутбук с двумя блоками pandas и лентой героя, 21 строка героя.
Данные — общий набор data/events (тема 09). Для sessions.sql нужен PostgreSQL с базой events."""
import json
import os
import re

PHONE, LAPTOP, HERO = "d_f6f77955", "d_398d33df", "u_06883"
PG_NOTE = ("Файлу `{0}` нужен PostgreSQL 16 с базой `events`. Как её загрузить, написано в `data/events/README.md`. "
           "Запуск из корня материалов: `psql -d events {1} -f {2}/{0}`.")


def build(m):
    import pandas as pd
    m.use_data("events")
    m.versions = "Код проверен на PostgreSQL 16.15, Python 3.13, pandas 3.0 и pyarrow 26."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="events")     # подключение песочницы

    head = ("-- Страница 9.1 «Событийная модель: события, сессии, пользователи» курса «Аналитика 101».\n"
            "-- Очищенный слой и сессии в PostgreSQL 16. Нужна база events: как её загрузить — в data/events/README.md.\n"
            f"-- Запуск из корня папки материалов: psql -d events -q -P null=NULL -f {m.stem}/sessions.sql\n\n")
    m.put("sessions.sql", head + m.page_code("sql"))
    m.run(["psql", "-q", "-P", "null=NULL", "-f", "sessions.sql"], expect=m.page_out("sql"), what="psql -q -f sessions.sql")
    m.extra = PG_NOTE.format("sessions.sql", "-q -P null=NULL", m.stem)

    # 21 строка героя — из журнала общего набора, без дублей
    m.sync()
    ev = pd.read_parquet(m.work / "data" / "events" / "events.parquet").drop_duplicates("event_id")
    day = ev["event_time"].dt.tz_convert("Europe/Minsk").dt.strftime("%Y-%m-%d")
    h = ev[(ev["anonymous_id"].isin([PHONE, LAPTOP]) | (ev["user_id"] == HERO)) & day.between("2026-05-12", "2026-05-15")]
    h = h.sort_values(["event_time", "event_id"])
    m.put("hero_12_15_may.csv", h.to_csv(index=False, date_format="%Y-%m-%dT%H:%M:%SZ", lineterminator="\n"))
    js = (m.pdir / "page.js").read_text("utf-8")
    page_rows = json.loads(re.search(r"const HERO = (\[.*?\]);\n", js, flags=re.S).group(1))
    m.check("hero_12_15_may.csv: 21 строка — 19 клиентских и 2 серверных, как в сцене",
            len(h) == 21 and h["origin"].value_counts().to_dict() == {"client": 19, "server": 2}, str(h["origin"].value_counts().to_dict()))
    m.check("hero_12_15_may.csv: те же события в том же порядке, что вшиты в интерактив страницы",
            [r[1] for r in page_rows] == h["event_id"].tolist() and [r[2] for r in page_rows] == h["event_name"].tolist())
    paid = h[h["event_name"] == "order_paid"]
    m.check("hero_12_15_may.csv: два заказа на 4 600 и 1 900 ₽", paid["revenue"].tolist() == [4600, 1900], str(paid["revenue"].tolist()))

    nb = m.notebook("sessions.ipynb", "sessions.nb.py", "main")
    m.from_reader_folder("sessions.ipynb")

    # 28 состояний: таблица из ноутбука против данных, вшитых в интерактив (их сверяет check_widget.js и PostgreSQL)
    check = json.loads(re.search(r"const CHECK = (\{.*?\});\n", js, flags=re.S).group(1))
    cell = next(c for c in nb.cells if c.cell_type == "code" and "def hero_state" in c.source)
    out = "".join(o.get("text", "") for o in cell.outputs if o.get("output_type") == "stream")
    got = {}
    for line in out.split("\n"):
        mm = re.match(r"\s*(\d+) \|\s*(\d+) (\d+) (\d+) (\d+) \|\s*(\d+) (\d+) (\d+) (\d+)$", line)
        if mm:
            v = list(map(int, mm.groups()))
            got[f"{v[0]}_0"], got[f"{v[0]}_1"] = v[1:5], v[5:9]
    m.check("sessions.ipynb: все 28 состояний ленты героя совпали с данными интерактива страницы", got == check and len(got) == 28,
            f"{len(got)} состояний; расхождения: {[k for k in check if got.get(k) != check[k]][:6]}")
    m.check("sessions.ipynb: сессий 10 при пороге 1 минута, 5 при 5, 4 при 30 и 3 при 12 часах; людей 2 без склейки и 1 со склейкой",
            [got.get(k, [None])[0] for k in ("1_0", "5_0", "30_0", "720_0")] == [10, 5, 4, 3] and got.get("30_0", [0] * 3)[2] == 2 and got.get("30_1", [0] * 3)[2] == 1)
