"""Материалы страницы 10.3: кривые окупаемости для PostgreSQL и ноутбук со сценариями, денежным потоком и графиком.
Данные — общий набор data/unit (тема 10). Для payback.sql нужен PostgreSQL с базой unit."""
import os


def build(m):
    m.use_data("unit")
    m.versions = "Код проверен на PostgreSQL 16.15, Python 3.13, pandas 3.0, NumPy 2.5 и matplotlib 3.10."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="unit")     # подключение песочницы
    code = m.pdir / "data" / "code"

    head = ("-- Страница 10.3 «Когортная окупаемость» курса «Аналитика 101».\n"
            "-- Кривые окупаемости по каналам и по когортам поиска в PostgreSQL 16. Нужна база unit: как её загрузить — в data/unit/README.md.\n"
            f"-- Запуск из корня папки материалов: psql -d unit -P null=NULL -f {m.stem}/payback.sql\n\n")
    m.put("payback.sql", head + m.page_code("sql"))
    r = m.run(["psql", "-X", "-P", "pager=off", "-P", "null=NULL", "-f", "payback.sql"], expect=m.page_out("sql"), what="psql -f payback.sql")
    m.check("payback.sql: партнёры окупаются на n = 6, поиск на n = 12, соцсети — NULL; когорта декабря 2024 — на n = 4, августа 2024 — на n = 19",
            all(x in r.stdout for x in (" партнёры | 1263 |  -364 |   -18 |    236 |    569 |   1498 |         6",
                                        " поиск    | 1506 |  -983 |  -442 |    -24 |    555 |   1482 |        12",
                                        " соцсети  | 3054 | -2849 | -2709 |  -2605 |  -2478 |    449 |      NULL",
                                        " 2024-12 |  576 | 1085 |  1219 |   1606 |         4", " 2024-08 |  496 | 1726 |  1010 |   1352 |        19")), r.stdout[:400])
    cohorts = [l.split("|") for l in r.stdout.split("\n") if l.startswith(" 20")]
    year = [c for c in cohorts if c[4].strip() != "NULL"]
    m.check("payback.sql: год прошёл у 13 когорт поиска, три из них — апрель, май и июль 2025 — не окупились",
            len(year) == 13 and [c[0].strip() for c in year if c[5].strip() == "NULL"] == ["2025-04", "2025-05", "2025-07"], str(len(year)))
    m.extra = ("Файлу `payback.sql` нужен PostgreSQL 16 с базой `unit`. Как её загрузить, написано в `data/unit/README.md`. "
               f"Запуск из корня материалов: `psql -d unit -P null=NULL -f {m.stem}/payback.sql`.")

    nb = m.notebook("payback.ipynb", "payback.nb.py", "main")
    # на странице оба блока выполняются подряд в одном процессе; рисунок ноутбука должен выйти тем же
    ref = m.alone([code / "scenarios.py", code / "plot.py"], together=True)
    m.pictures("рисунок ноутбука тот же, что дают блоки страницы одним скриптом", ref, ["payback_limits.svg"])
    m.from_reader_folder("payback.ipynb")
    m.check("ноутбук не оставил рисунок в материалах страницы", not (m.out / "payback_limits.svg").exists())
    show = nb.cells[-1]
    kinds = [sorted(o.get("data", {})) for o in show.get("outputs", []) if o.get("output_type") == "display_data"]
    m.check("последняя ячейка показывает сохранённый рисунок", len(kinds) == 1 and "image/svg+xml" in kinds[0], str(kinds))
    out = m.page_out("pandas")
    m.check("в выводе сценариев: база 1 482 и 2 061 ₽, окупаемость на n = 12; удержание +10% сдвигает её на n = 10, чек −10% — на n = 16",
            all(x in out for x in ("база                        1482    2061        1.37              12",
                                   "удержание +10%              1578    2215        1.47              10",
                                   "чек −10%                    1300    1808        1.20              16")))
    m.check("в выводе денежного потока: дно −4,2 млн ₽ без роста, −11,7 при росте на 10% в месяц, −19,7 с убывающей отдачей",
            all(x in out for x in ("1506        -4.2         11               26", "1506       -11.7         16               31", "1941       -19.7         25              нет")))
