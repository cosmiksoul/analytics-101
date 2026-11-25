"""Материалы страницы 10.1: CAC и ARPU для PostgreSQL и сводка юнит-экономики на pandas.
Данные — общий набор data/unit (тема 10). Для cac.sql и arpu.sql нужен PostgreSQL с базой unit."""
import os


def build(m):
    m.use_data("unit")
    m.versions = "Код проверен на PostgreSQL 16.15, Python 3.13, pandas 3.0 и NumPy 2.5."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="unit")     # подключение песочницы

    out = {}
    for name, key, about in (("cac.sql", "cac", "CAC по каналам и смешанный CAC"), ("arpu.sql", "arpu", "ARPU и ARPPU по месяцам")):
        head = ("-- Страница 10.1 «CAC, ARPU и маржа» курса «Аналитика 101».\n"
                f"-- {about} в PostgreSQL 16. Нужна база unit: как её загрузить — в data/unit/README.md.\n"
                f"-- Запуск из корня папки материалов: psql -d unit -P null=NULL -f {m.stem}/{name}\n\n")
        m.put(name, head + m.page_code(key))
        out[key] = m.run(["psql", "-X", "-P", "pager=off", "-P", "null=NULL", "-f", name], expect=m.page_out(key), what=f"psql -f {name}").stdout
    m.check("cac.sql: CAC поиска 1 506 ₽, вся реклама 1 844 ₽, с органикой в знаменателе 998 ₽; у органики NULL",
            all(x in out["cac"] for x in (" поиск                  |     23.62 |       15691 |  10952 | 1506 |", "| 1844 |", "|  998 |",
                                          " органика               |      NULL |       27742 |  20390 | NULL |")), out["cac"][-500:])
    m.check("arpu.sql: в июне 2026 ARPPU 4 112 ₽, ARPU на активного 1 689 ₽, на всю базу 309 ₽",
            " 2026-06 |    18690180 |   4545 |  11065 |      60504 |  4112 |        1689 |       309" in out["arpu"], out["arpu"][-300:])
    m.extra = ("Команды для двух запросов и сводной таблицы урока\n\n"
               f"```sh\npsql -d unit -P null=NULL -f {m.stem}/cac.sql\n"
               f"psql -d unit -P null=NULL -f {m.stem}/arpu.sql\n"
               f"python {m.stem}/unit_summary.py\n```")

    r = m.script("unit_summary.py", "unit")
    m.check("unit_summary.py: поиск в минусе на 128 ₽ за 24 месяца данных, но окупается в месяц n = 12; вся реклама: МД 1 147 ₽ при CAC 1 844 ₽",
            all(x in r.stdout for x in ("МД − CAC, ₽                   —    -128  -2 625      174        -697",
                                        "окупился в месяц n            —      12       —        6           —",
                                        "МД на клиента, ₽          1 533   1 378     429    1 437       1 147")), r.stdout[-500:])
