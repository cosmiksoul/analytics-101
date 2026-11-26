"""Материалы страницы 11.3: строка на пользователя для PostgreSQL, ноутбук с анализом и шаблон отчёта.
Данные — общий набор data/ab (тема 11). Для checkout_v2_users.sql нужен PostgreSQL с базой ab."""
import html
import os
import re


def build(m):
    m.use_data("ab")
    m.versions = "Код проверен на PostgreSQL 16.15, Python 3.13, pandas 3.0, NumPy 2.5, SciPy 1.18, statsmodels 0.15 и pyarrow 26."
    os.environ.update(PGHOST="/tmp", PGUSER="postgres", PGDATABASE="ab")     # подключение песочницы

    head = ("-- Страница 11.3 «Как проанализировать результаты A/B-теста» курса «Аналитика 101».\n"
            "-- Строка на пользователя и сводка по группам checkout_v2 в PostgreSQL 16. Нужна база ab: как её загрузить — в data/ab/README.md.\n"
            f"-- Запуск из корня папки материалов: psql -d ab -P null=NULL -f {m.stem}/checkout_v2_users.sql\n\n")
    m.put("checkout_v2_users.sql", head + m.page_code("sql"))
    r = m.run(["psql", "-X", "-P", "pager=off", "-P", "null=NULL", "-f", "checkout_v2_users.sql"], expect=m.page_out("sql"), what="psql -f checkout_v2_users.sql")
    m.check("checkout_v2_users.sql: в сводке 28 439 и 28 358 человек — без трёх ботов", "28439" in r.stdout and "28358" in r.stdout, r.stdout[-300:])
    m.extra = ("Файлу `checkout_v2_users.sql` нужен PostgreSQL 16 с базой `ab`. Как её загрузить, написано в `data/ab/README.md`. "
               f"Запуск из корня материалов: `psql -d ab -P null=NULL -f {m.stem}/checkout_v2_users.sql`.")

    m.notebook("ab_analysis.ipynb", "ab_analysis.nb.py", "main")
    m.from_reader_folder("ab_analysis.ipynb")
    out = m.page_out("full") + "\n" + m.page_out("delta") + "\n" + m.page_out("boot")
    m.check("в выводе: доля покупателей +1,17 п. п. [0,59; 1,75], ошибка конверсии сессий по людям в 1,27 раза больше наивной, обрезка даёт +69,1 ₽",
            all(x in out for x in ("1,17", "0,59", "1,75", "1.27", "69.1")) or all(x in out for x in ("1.17", "0.59", "1.75", "1.27", "69.1")), out[:300])

    # шаблон отчёта: поля блока «Отчёт об эксперименте» со страницы
    art = (m.pdir / "article.html").read_text("utf-8")
    rep = re.search(r'<div class="an-rep[^"]*"><p class="an-rep-hd">(.*?)</p><dl>(.*?)</dl></div>', art, re.S)
    txt = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s))).replace("\xa0", " ").strip()
    rows = [(txt(a), txt(b)) for a, b in re.findall(r"<dt>(.*?)</dt><dd>(.*?)</dd>", rep.group(2), re.S)] if rep else []
    want = ["Что меняли", "Единица и метрики", "Качество данных", "Результат", "Рекомендация", "Оговорки"]
    m.check("в блоке страницы шесть полей отчёта", [a for a, _ in rows] == want, str([a for a, _ in rows]))
    hints = {
        "Что меняли": "изменение и даты теста",
        "Единица и метрики": "кому назначали вариант, какие метрики выбрали целевыми, защитными и вторичными",
        "Качество данных": "численность групп и результат проверки, правило исключения записей, расхождения между источниками",
        "Результат": "база и значение в группе B, эффект в единицах метрики с 95-процентным интервалом, он же в процентах; по каждой метрике",
        "Рекомендация": "что предлагается сделать и что проверить до решения",
        "Оговорки": "как эффект менялся со временем, какие ограничения данных влияют на вывод",
    }
    md = ("# Отчёт об эксперименте на одну страницу\n\n"
          "Шаблон со страницы 11.3 «Анализ» курса «Аналитика 101». Опишите проверку данных, размер эффекта "
          "и основание для решения. Скопируйте таблицу и замените подсказки своими ответами.\n\n"
          "## Пустой шаблон\n\n| поле | что записать |\n|---|---|\n" + "".join(f"| {n} | {hints[n]} |\n" for n in want) +
          f"\n## Заполненный пример: {txt(rep.group(1)).split('·')[-1].strip() if rep else ''}\n\n| поле | отчёт |\n|---|---|\n" + "".join(f"| {a} | {b} |\n" for a, b in rows))
    m.put("report_template.md", md)
    m.check("report_template.md: пустая таблица из шести полей и заполненный отчёт checkout_v2 со страницы",
            all(f"| {n} |" in md for n in want) and "+1,17 п. п." in md and "от 0,59 до 1,75 п. п." in md and "checkout_v2" in md, md[-400:])
