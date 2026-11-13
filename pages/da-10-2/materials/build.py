"""Материалы страницы 10.2: LTV когорт для PostgreSQL и ноутбук с хвостами кривой удержания и бутстрэпом.
Данные — общий набор data/unit (тема 10). Для ltv_cohorts.sql нужен PostgreSQL с базой unit."""
import os


def build(m):
    m.use_data("unit")
    m.versions = "Код проверен на PostgreSQL 16.15, Python 3.13, pandas 3.0, SciPy 1.18 и matplotlib 3.10."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="unit")     # подключение песочницы
    code = m.pdir / "data" / "code"

    head = ("-- Страница 10.2 «LTV через удержание» курса «Аналитика 101».\n"
            "-- LTV когорт из таблицы заказов в PostgreSQL 16. Нужна база unit: как её загрузить — в data/unit/README.md.\n"
            f"-- Запуск из корня папки материалов: psql -d unit -P null=NULL -f {m.stem}/ltv_cohorts.sql\n\n")
    m.put("ltv_cohorts.sql", head + m.page_code("sql"))
    r = m.run(["psql", "-X", "-P", "pager=off", "-P", "null=NULL", "-f", "ltv_cohorts.sql"], expect=m.page_out("sql"), what="psql -f ltv_cohorts.sql")
    m.check("ltv_cohorts.sql: у 25 990 клиентов двенадцати когорт LTV за 6 месяцев 1 033 ₽, за 12 — 1 413 ₽, по выручке 5 104 ₽",
            " все 12  |   25990 | 1033 |  1413 |      5104" in r.stdout, r.stdout[-300:])
    m.extra = ("Файлу `ltv_cohorts.sql` нужен PostgreSQL 16 с базой `unit`. Как её загрузить, написано в `data/unit/README.md`. "
               f"Запуск из корня материалов: `psql -d unit -P null=NULL -f {m.stem}/ltv_cohorts.sql`.")

    nb = m.notebook("ltv_tail.ipynb", "ltv_tail.nb.py", "main")
    # на странице оба блока выполняются подряд в одном процессе; рисунок ноутбука должен выйти тем же
    ref = m.alone([code / "tail_fit.py", code / "bootstrap.py"], together=True)
    m.pictures("рисунок ноутбука тот же, что дают блоки страницы одним скриптом", ref, ["tails.svg"])
    m.from_reader_folder("ltv_tail.ipynb")
    m.check("ноутбук не оставил рисунок в материалах страницы", not (m.out / "tails.svg").exists())
    fit = next(c for c in nb.cells if c.cell_type == "code" and "curve_fit(" in c.source and "savefig" in c.source)
    kinds = [sorted(o.get("data", {})) for o in fit.get("outputs", []) if o.get("output_type") == "display_data"]
    m.check("под ячейкой с хвостами показан рисунок", len(kinds) == 1 and "image/png" in kinds[0], str(kinds))
    svg = (m.work / "tails.svg").read_text("utf-8")
    m.check("на рисунке подписи LTV за 36 месяцев: плато 2 799 ₽, степенная 2 484 ₽, экспонента 1 826 ₽",
            all(x in svg for x in ("2 799", "2 484", "1 826")))
    out = m.page_out("fit") + "\n" + m.page_out("boot")
    m.check("в выводе: степенная ошибается на 0,54 п. п., экспонента на 4,86; интервал LTV12 поиска 1 433–1 660 ₽ накрывает CAC 1 454 ₽",
            "'степенная': 0.54, 'экспонента': 4.86" in out and "поиск         6668   1540  1433  1660  1454" in out)
