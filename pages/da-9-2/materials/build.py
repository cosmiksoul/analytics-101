"""Материалы страницы 9.2: запрос воронки для PostgreSQL и ноутбук с сегментами и графиком.
Данные — общий набор data/events (тема 09). Для funnel.sql нужен PostgreSQL с базой events."""
import os


def build(m):
    m.use_data("events")
    m.versions = "Код проверен на PostgreSQL 16.15, Python 3.13, pandas 3.0, pyarrow 26 и matplotlib 3.10."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="events")     # подключение песочницы
    code = m.pdir / "data" / "code"

    head = ("-- Страница 9.2 «Воронки и конверсии» курса «Аналитика 101».\n"
            "-- Воронка новичков мая в PostgreSQL 16. Нужна база events: как её загрузить — в data/events/README.md.\n"
            f"-- Запуск из корня папки материалов: psql -d events -P null=NULL -f {m.stem}/funnel.sql\n\n")
    m.put("funnel.sql", head + m.page_code("fun"))
    r = m.run(["psql", "-P", "pager=off", "-P", "null=NULL", "-f", "funnel.sql"], expect=m.page_out("fun"), what="psql -f funnel.sql")
    m.check("funnel.sql: до оплаты за 7 суток дошли 329 человек в любом порядке (20,4%) и 290 в строгом (18,0%)",
            " 5 | order_paid     |       329 |    20.4 |    290 |       18.0" in r.stdout, r.stdout[-300:])
    m.extra = ("Файлу `funnel.sql` нужен PostgreSQL 16 с базой `events`. Как её загрузить, написано в `data/events/README.md`. "
               f"Запуск из корня материалов: `psql -d events -P null=NULL -f {m.stem}/funnel.sql`.")

    m.notebook("funnel_segments.ipynb", "funnel_segments.nb.py", "main")
    # на странице оба блока выполняются подряд в одном процессе; рисунок ноутбука должен выйти тем же
    ref = m.alone([code / "02_segments.py", code / "03_chart.py"], together=True)
    m.pictures("рисунок ноутбука тот же, что дают блоки страницы одним скриптом", ref, ["funnel_bars.svg"])
    m.from_reader_folder("funnel_segments.ipynb")
    m.check("ноутбук не оставил рисунок в материалах страницы", not (m.out / "funnel_bars.svg").exists())
    seg = m.page_out("seg")
    m.check("в выводе сегментов парадокс Симпсона: в каналах приложение выше сайта, а всего 19,4 против 23,7%",
            all(x in seg for x in ("органика         23.8  16.7", "партнёры         39.7  36.8", "реклама          12.2  10.4", "всего            19.4  23.7")))
