"""Материалы страницы 9.3: таблица когорт для PostgreSQL и ноутбук с тремя видами удержания и рисунками.
Данные — общий набор data/events (тема 09). Для cohorts.sql нужен PostgreSQL с базой events."""
import os


def build(m):
    m.use_data("events")
    m.versions = "Код проверен на PostgreSQL 16.15, Python 3.13, pandas 3.0, pyarrow 26 и matplotlib 3.10."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="events")     # подключение песочницы
    code = m.pdir / "data" / "code"

    head = ("-- Страница 9.3 «Удержание и когорты» курса «Аналитика 101».\n"
            "-- Таблица «пользователь — день» и таблица когорт в PostgreSQL 16. Нужна база events: как её загрузить — в data/events/README.md.\n"
            f"-- Запуск из корня папки материалов: psql -d events -P null=NULL -f {m.stem}/cohorts.sql\n\n")
    m.put("cohorts.sql", head + m.page_code("sql"))
    r = m.run(["psql", "-X", "-P", "pager=off", "-P", "null=NULL", "-f", "cohorts.sql"], expect=m.page_out("sql"), what="psql -f cohorts.sql")
    m.check("cohorts.sql: в таблице «пользователь — день» 45 250 строк, в когорте 5 января 284 человека и 34,9% в неделю 1",
            "SELECT 45250" in r.stdout and " 2026-01-05  |  284 | 34.9 |" in r.stdout, r.stdout[:300])
    m.extra = ("Файлу `cohorts.sql` нужен PostgreSQL 16 с базой `events`. Как её загрузить, написано в `data/events/README.md`. "
               f"Запуск из корня материалов: `psql -d events -P null=NULL -f {m.stem}/cohorts.sql`.")

    nb = m.notebook("retention.ipynb", "retention.nb.py", "main")
    # на странице оба блока выполняются подряд в одном процессе; рисунки ноутбука должны выйти теми же
    ref = m.alone([code / "three_types.py", code / "plots.py"], together=True)
    m.pictures("рисунки ноутбука те же, что дают блоки страницы одним скриптом", ref, ["heatmap.svg", "curves.svg"])
    m.from_reader_folder("retention.ipynb")
    m.check("ноутбук не оставил рисунки в материалах страницы", not any((m.out / n).exists() for n in ("heatmap.svg", "curves.svg")))
    show = nb.cells[-1]
    kinds = [sorted(o.get("data", {})) for o in show.get("outputs", []) if o.get("output_type") == "display_data"]
    m.check("последняя ячейка показывает оба сохранённых рисунка", len(kinds) == 2 and all("image/svg+xml" in k for k in kinds), str(kinds))
    svg = (m.work / "curves.svg").read_text("utf-8")
    m.check("на рисунке кривых подписи плато: до релиза 15,5%, 16–30 марта 19,1%, кампания 15,5%",
            all(x in svg for x in ("до релиза: плато 15,5%", "16–30 марта: плато 19,1%", "кампания: плато 15,5%")))
    out = m.page_out("pandas")
    m.check("в выводе трёх видов удержания скользящее и возвратное не ниже классического, пример u_03753 — недели 2, 3 и 7",
            "u_03753 возвращался в недели [2, 3, 7]" in out and "16.03  71.4" in out and "16.03  34.7  44.5" in out)
