"""Материалы страницы 11.1: учебная симуляция магазина, тысяча прогонов и разбиение по хешу для PostgreSQL.
Данные — общий набор data/ab (тема 11). Для hash_balance.sql нужен PostgreSQL с базой ab."""
import os


def build(m):
    m.use_data("ab")
    m.versions = "Код проверен на PostgreSQL 16.15, Python 3.13, pandas 3.0, NumPy 2.5 и matplotlib 3.10."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="ab")     # подключение песочницы
    code = m.pdir / "data" / "code"

    r = m.script("simulate.py", "sim")
    m.check("simulate.py: без помех «до и после» даёт 9,88%, со всеми пятью слоями — 27,33% при истинных +10%; A/B остаётся у 10,3%",
            "без помех    3.99      4.38           9.88   10.37" in r.stdout and "+ провал     4.03      5.13          27.33   10.30" in r.stdout, r.stdout[-400:])
    # второй блок страницы продолжает первый: в файл они идут вместе
    r = m.glue("runs.py", "Тысяча прогонов: «до и после» против A/B",
               "Второй блок кода страницы вместе с первым: симуляция магазина из simulate.py и тысяча миров со случайными помехами. Сохраняет рисунок runs.svg.",
               ["sim", "runs"])
    m.check("runs.py: на тысяче прогонов разброс ошибки «до и после» — 10,1 п. п., A/B — 1,6; после слабых недель «до и после» завышает на 4,16 п. п.",
            "до и после             1.3          10.1                   66.4" in r.stdout and "после слабых недель        4.16  0.10" in r.stdout, r.stdout[-400:])
    ref = m.alone([code / "simulate.py", code / "runs.py"], together=True)
    m.pictures("рисунок из runs.py тот же, что дают блоки страницы одним скриптом", ref, ["runs.svg"])
    m.check("скрипты не оставили рисунок в материалах страницы", not (m.out / "runs.svg").exists())

    head = ("-- Страница 11.1 «Почему эксперимент, а не „до и после“» курса «Аналитика 101».\n"
            "-- Разбиение по хешу и проверка баланса групп в PostgreSQL 16. Нужна база ab: как её загрузить — в data/ab/README.md.\n"
            f"-- Запуск из корня папки материалов: psql -d ab -P null=NULL -f {m.stem}/hash_balance.sql\n\n")
    m.put("hash_balance.sql", head + m.page_code("hash"))
    r = m.run(["psql", "-X", "-P", "pager=off", "-P", "null=NULL", "-f", "hash_balance.sql"], expect=m.page_out("hash"), what="psql -f hash_balance.sql")
    m.check("hash_balance.sql: правило хеша воспроизводит все группы; в reco_block p = 0,0016; 376 человек и 857 сессий с чужой группой",
            all(x in r.stdout for x in (" aa_check    |          0 | 19988 | 20092 | 50.13 |  0.27 |  0.6034", " reco_block  |          0 | 24440 | 23746 | 49.28 | 10.00 |  0.0016",
                                        "   376 |      857")), r.stdout[:300])
    m.extra = ("Файлу `hash_balance.sql` нужен PostgreSQL 16 с базой `ab`. Как её загрузить, написано в `data/ab/README.md`. "
               f"Запуск из корня материалов: `psql -d ab -P null=NULL -f {m.stem}/hash_balance.sql`. "
               f"Скриптам данные не нужны: `python {m.stem}/simulate.py`, `python {m.stem}/runs.py`.")
