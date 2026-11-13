"""Материалы страницы 9.4: запросы активности для PostgreSQL, скрипт декомпозиции и шаблон карточки метрики.
Данные — общий набор data/events (тема 09). Для active.sql нужен PostgreSQL с базой events."""
import os
import re


def build(m):
    m.use_data("events")
    m.versions = "Код проверен на PostgreSQL 16.15, Python 3.13, pandas 3.0, NumPy 2.5 и pyarrow 26."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="events")     # подключение песочницы

    # active.sql: два блока страницы подряд — второй пользуется временной таблицей первого
    head = ("-- Страница 9.4 «Метрики роста и дерево метрик» курса «Аналитика 101».\n"
            "-- DAU, MAU, липкость и баланс активных в PostgreSQL 16. Нужна база events: как её загрузить — в data/events/README.md.\n"
            f"-- Запуск из корня папки материалов: psql -d events -P null=NULL -f {m.stem}/active.sql\n\n")
    m.put("active.sql", head + m.page_code("dau") + "\n" + m.page_code("balance"))
    expect = m.page_out("dau").strip("\n") + "\n\n" + m.page_out("balance").strip("\n")
    r = m.run(["psql", "-P", "pager=off", "-P", "null=NULL", "-f", "active.sql"], expect=expect, what="psql -f active.sql")
    m.check("active.sql: баланс недели 1–7 июня сходится: 1 851 − 1 188 + 377 + 936 = 1 976",
            " 2026-06-01 |     1851 | 377 |      663 |      936 |    1188 | 1976" in r.stdout, r.stdout[-400:])
    m.extra = ("Файлу `active.sql` нужен PostgreSQL 16 с базой `events`. Как её загрузить, написано в `data/events/README.md`. "
               f"Запуск из корня материалов: `psql -d events -P null=NULL -f {m.stem}/active.sql`. "
               f"Скрипт запускается оттуда же: `python {m.stem}/decompose.py`.")

    # decompose.py: блок страницы как есть
    r = m.script("decompose.py", "decompose")
    m.check("decompose.py: три способа дают в сумме −262 660 ₽; логарифмический вклад доли платящих −303 526 ₽",
            "суммы вкладов: -262660 -262660 -262660" in r.stdout and "доля платящих           0.2453   0.2085   -15.0 -303526" in r.stdout, r.stdout[-300:])

    # шаблон карточки: поля блока страницы таблицей Markdown
    rows = [re.match(r"(\S[^:]*):\s+(.*)$", l) for l in m.page_code("card").strip("\n").split("\n")[1:]]
    m.check("в блоке страницы 11 полей карточки", len(rows) == 11 and all(rows), str(len(rows)))
    md = ("# Карточка метрики\n\n"
          "Шаблон со страницы 9.4 «Метрики роста и дерево метрик» курса «Аналитика 101». Скопируйте таблицу и замените "
          "подсказки во втором столбце своими ответами. Заполненный пример — карточка доли платящих на странице.\n\n"
          "| поле | что записать |\n|---|---|\n" + "".join(f"| {r.group(1)} | {r.group(2)} |\n" for r in rows if r))
    m.put("metric_card_template.md", md)
    m.check("metric_card_template.md: те же 11 полей и подсказки, что в блоке страницы",
            all(f"| {r.group(1)} | {r.group(2)} |" in md for r in rows if r) and "| Владелец |" in md and "| История |" in md)
