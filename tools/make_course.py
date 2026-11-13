#!/usr/bin/env python3
"""Структура курса «Аналитика 101» → engine/course.json.

Запускается редко: когда в программе блока появилась новая тема или страница. Читает программы блоков
(папка с документами проекта, на уровень выше textbook/) и meta.json готовых страниц. Сборке сайта
программы не нужны: build.py и tools/build_site.py читают только engine/course.json.

python3 tools/make_course.py [путь к папке с программами]
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KIT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent
BLOCKS = [("da", "Дата аналитика", "дата аналитики", "04 Программа — Дата аналитика.md"),
          ("bi", "BI", "BI", "06 Программа — BI.md"),
          ("de", "Дата инженерия", "дата инженерии", "07 Программа — Дата инженерия.md"),
          ("ml", "ML", "ML", "05 Программа — ML.md"),
          ("ai", "AI-инженерия", "AI-инженерии", "08 Программа — AI-инженерия.md")]


# Лид главной страницы.
COURSE_LEAD = ("Бесплатный интерактивный курс о работе с данными: от первых строк на Python и SQL "
               "до статистики, A/B-тестов и машинного обучения. Каждая страница разбирает одну идею: сцена показывает её "
               "по шагам, интерактив позволяет покрутить параметры, код приведён с настоящим выводом, а вопросы с разбором "
               "проверяют понимание. К страницам приложены ноутбуки и учебные данные, к каждой теме — блокнот в NotebookLM, "
               "где тему можно обсудить с ИИ по тексту курса.")

# Описание темы для оглавления: одно предложение для читателя. Абзац «Зачем» в программе написан для авторов
# (сравнивает тему с исходными курсами), поэтому для сайта описания свои.
LEADS = {
    "da-01": "Минимум Python для аналитика: ноутбук и состояние ядра, типы и коллекции, циклы и функции, файлы и исключения.",
    "da-02": "Как устроен DataFrame, как загрузить данные из файлов, баз и API, очистить их от пропусков и дублей и собрать сводную таблицу.",
    "da-03": "Аналитический SQL от SELECT до оконных функций — с упором на то, в каком порядке база выполняет запрос и почему ломаются JOIN и GROUP BY.",
    "da-04": "Векторы, матрицы и производная — ровно столько, чтобы читать формулы машинного обучения и уверенно работать с NumPy.",
    "da-05": "Язык, на котором описывают случайность в данных: условная вероятность и формула Байеса, распределения, закон больших чисел и центральная предельная теорема.",
    "da-06": "Как по выборке делать выводы о генеральной совокупности: смещения выборки, доверительные интервалы и бутстрэп, p-value, выбор теста, корреляция и причинность.",
    "da-07": "Первый взгляд на данные: формы и пропуски, распределения и выбросы, связи между переменными и вопросы к ним.",
    "da-08": "Как устроен график в Matplotlib, какой тип выбрать под вопрос, интерактивные графики в Plotly и как сделать из графика аргумент.",
    "da-09": "Журнал событий и что из него считают: сессии, воронки, удержание и когорты, дерево метрик роста.",
    "da-10": "Зарабатывает ли продукт на каждом клиенте: CAC, ARPU и маржа, LTV через удержание и окупаемость когорт.",
    "da-11": "Как проверить, что изменение сработало: дизайн теста и размер выборки, анализ с интервалами, ловушки, CUPED и последовательные тесты.",
}


def program(block_file):
    t = (KIT / block_file).read_text(encoding="utf-8")
    heads = list(re.finditer(r"^## (\d\d) · (.*?)(?: \((.*)\))?$", t, re.M))
    topics = []
    for i, m in enumerate(heads):
        body = t[m.end(): heads[i + 1].start() if i + 1 < len(heads) else len(t)]
        pages = []
        for p in re.finditer(r"^\*\*Страница (\d+)\.(\d+) · (.*?)\*\*", body, re.M):
            title = p.group(3).replace("★ ", "").replace("★", "").strip()
            light = "(лёгкая)" in title
            title = title.replace("(лёгкая)", "").strip()
            pages.append({"num": f"{int(p.group(1))}.{int(p.group(2))}", "plan": title, "light": light})
        topics.append({"n": m.group(1), "name": m.group(2).replace("★ ", "").replace("★", "").strip(), "pages": pages})
    return topics


def main():
    metas = {p.name: json.loads((p / "meta.json").read_text(encoding="utf-8")) for p in (ROOT / "pages").iterdir() if (p / "meta.json").exists()}
    course = {"title": "Аналитика 101", "lead": COURSE_LEAD, "storageKey": "a101-done", "blocks": []}
    for key, name, gen, prog in BLOCKS:
        topics = program(prog)
        ready = 0
        for tp in topics:
            if f"{key}-{tp['n']}" in LEADS:
                tp["lead"] = LEADS[f"{key}-{tp['n']}"]
            for pg in tp["pages"]:
                pid = f"{key}-{pg['num'].replace('.', '-')}"
                if pid in metas:
                    art = (ROOT / "pages" / pid / "article.html").read_text(encoding="utf-8")
                    h1 = html.unescape(re.sub(r"<[^>]+>", "", re.search(r"<h1[^>]*>(.*?)</h1>", art, re.S).group(1))).replace("\xa0", " ").strip()
                    # title — заголовок страницы (боковина, оглавление, хлебные крошки), short — короткое имя для вкладки браузера
                    pg.update(id=pid, file=metas[pid]["file"], title=h1, short=metas[pid]["title"])
                    m = re.search(r'<span class="pill">≈(?:&nbsp;| )(\d+)(?:&nbsp;| )минут', art)
                    pg["minutes"] = int(m.group(1)) if m else None
                    ready += 1
        course["blocks"].append({"key": key, "name": name, "gen": gen, "ready": ready > 0, "pagesReady": ready, "topics": topics})
    (ROOT / "engine" / "course.json").write_text(json.dumps(course, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    for b in course["blocks"]:
        n = sum(len(t["pages"]) for t in b["topics"])
        print(f"{b['key']}: тем {len(b['topics'])}, страниц в программе {n}, готово {b['pagesReady']}")


if __name__ == "__main__":
    main()
