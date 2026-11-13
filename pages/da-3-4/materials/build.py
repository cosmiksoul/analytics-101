"""Материалы страницы 3.4: все запросы страницы, сравнение SQLite и DuckDB, сверка интерактива
«Троичная логика» с PostgreSQL. База — общий набор data/shop."""
import json
import os
import subprocess

TITLES = {"notin": "NOT IN с NULL в подзапросе против NOT EXISTS", "dates": "Дата против метки времени",
          "explain": "EXPLAIN: встроенная CTE и MATERIALIZED", "report": "Отчёт из трёх CTE и размер каждого шага",
          "lost": "Поиск строк, пропавших из-за NULL", "weeks": "Группировка по неделям через DATE_TRUNC"}


def build(m):
    m.use_data("shop")
    m.versions = "Код проверен на PostgreSQL 16.15, SQLite 3.53 и DuckDB 2.0; скрипты — на Python 3.13."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="shop")     # подключение песочницы

    keys = ["notin", "dates", "explain", "report", "lost", "weeks"]             # порядок разделов страницы
    text = ("-- Запросы страницы 3.4 «Подзапросы, CTE, NULL и типы» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.\n"
            "-- Запуск из корня папки материалов: psql -d shop -P null=NULL -f da-3-4-cte-null-types/queries.sql\n")
    for k in keys:
        text += f"\n-- ===== {TITLES[k]} =====\n" + m.page_code(k)
    m.put("queries.sql", text)
    m.run(["psql", "-P", "null=NULL", "-f", "queries.sql"], expect="\n\n".join(m.page_out(k).strip("\n") for k in keys),
          code=None, merge=True, what="psql -f queries.sql")

    m.script("dialects.py", "dialects")

    # three_valued.sql: 14 условий интерактива на всех 24 сочетаниях rating и promo_code
    dump = subprocess.run(["node", str(m.src / "_tvl_dump.js"), str(m.pdir / "page.js")], capture_output=True, text=True)
    rows = json.loads(dump.stdout)
    conds = list(dict.fromkeys((r["id"], r["sql"]) for r in rows))
    cols = ",\n".join(f"       ({sql}) AS c{i:02d}" for i, (_id, sql) in enumerate(conds, start=1))
    legend = "\n".join(f"--   c{i:02d}  {sql}" for i, (_id, sql) in enumerate(conds, start=1))
    m.put("three_valued.sql", f"""-- Сверка интерактива «Троичная логика» страницы 3.4 с PostgreSQL 16.
-- {len(conds)} условий на всех 24 сочетаниях значений rating и promo_code. В ответе t — TRUE, f — FALSE,
-- пусто или NULL — UNKNOWN: WHERE пропустил бы только строки с t.
-- Запуск: psql -P null=NULL -f da-3-4-cte-null-types/three_valued.sql   (таблицы базы не нужны)
--
-- Столбцы:
{legend}

SELECT r.rating, p.promo_code,
{cols}
FROM unnest(ARRAY[5, 4, 3, 2, 1, NULL]::integer[]) WITH ORDINALITY AS r(rating, i)
CROSS JOIN unnest(ARRAY['ЗИМА10', 'ВЕСНА15', '', NULL]::text[]) WITH ORDINALITY AS p(promo_code, j)
ORDER BY r.i, p.j;
""")
    r = m.run(["psql", "-At", "-F", "|", "-P", "null=NULL", "-f", "three_valued.sql"], code=None, merge=True,
              what="psql -f three_valued.sql")
    got = [line.split("|") for line in r.stdout.strip().split("\n")]
    val = {"t": True, "f": False, "NULL": None}
    want = {}
    for x in rows:
        want.setdefault((x["rating"], x["promo"]), {})[x["id"]] = x["res"]
    ok, n = len(got) == 24, 0
    for g in got:
        rating = None if g[0] == "NULL" else int(g[0])
        promo = None if g[1] == "NULL" else g[1]
        for (cid, _sql), cell in zip(conds, g[2:]):
            n += 1
            ok = ok and val[cell] == want[(rating, promo)][cid]
    m.check(f"three_valued.sql: {n} значений PostgreSQL совпали с расчётом интерактива ({len(conds)} условий × 24 сочетания)",
            ok and n == 336, f"{len(got)} строк, {n} значений")
