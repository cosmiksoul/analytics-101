"""Сборка сайта «Аналитика 101» в папку site/: главная, оглавление курса, 404, страницы и материалы.

python3 build.py --all && python3 tools/build_site.py      полная сборка
python3 tools/build_site.py --no-materials                  без копирования материалов (быстрый просмотр)

Берёт engine/course.json (структура и тексты), pages/<id>/article.html (лид, заголовок «Идеи» и пилюли страницы),
dist/standalone/*.html (собранные страницы) и dist/materials/ (материалы, кроме служебного index.json).
Главная, оглавление и 404 кладутся ещё и в dist/standalone/, чтобы папку страниц можно было открыть локально.

Оглавление собрано на том же каркасе, что и страницы: боковина с блоками и темами, колонка чтения 700px.
У каждой страницы в оглавлении — её основная мысль (заголовок раздела «Идея») и превью (лид статьи).
"""
import html
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from build import FAVICON, FAVICON_TAG, FONTS, SHARE_IMAGE, esc, share_meta  # noqa: E402

SITE = ROOT / 'site'
DIST = ROOT / 'dist'
COURSE = json.loads((ROOT / 'engine' / 'course.json').read_text(encoding='utf-8'))
NB = ' '


def plural(n, forms):
    n = abs(n) % 100
    if 10 < n < 20:
        return forms[2]
    return forms[0] if n % 10 == 1 else forms[1] if 2 <= n % 10 <= 4 else forms[2]


def count(n, forms):
    return f'{n}{NB}{plural(n, forms)}'


TOPICS = ('тема', 'темы', 'тем')
PAGES = ('страница', 'страницы', 'страниц')


def duration(mins):
    m = int(5 * round(mins / 5))
    if m < 60:
        return f'≈{NB}{m}{NB}мин'
    h, r = divmod(m, 60)
    return f'≈{NB}{h}{NB}ч{NB}{r}{NB}мин' if r else f'≈{NB}{h}{NB}ч'


def plain(s):
    s = re.sub(r'<sup\b.*?</sup>|<a class="ref".*?</a>|<span class="ref-sep">.*?</span>|<span class="sn">.*?</span>', '', s, flags=re.S)
    return re.sub(r'[ \t\r\n]+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()  # неразрывные пробелы страницы сохраняем


def typo(s):
    """Неразрывный пробел после слов из одной-двух букв (предлоги, союзы) и перед тире — как в тексте страниц."""
    s = re.sub(r'(?<![\w-])([А-ЯЁа-яё]{1,2}) ', '\\1' + NB, s)
    return s.replace(' — ', NB + '— ')


_ART = {}


def article(pid):
    if pid not in _ART:
        _ART[pid] = (ROOT / 'pages' / pid / 'article.html').read_text(encoding='utf-8')
    return _ART[pid]


def lead_of(pid):
    """Лид страницы: о чём она и что читатель сможет после неё."""
    m = re.search(r'<p class="lead">(.*?)</p>', article(pid), re.S)
    if not m:
        raise SystemExit(f'{pid}: в статье нет лида <p class="lead">')
    return plain(m.group(1))


def idea_of(pid):
    """Основная мысль страницы — заголовок раздела «Идея» без слова «Идея:»."""
    m = re.search(r'<h2 id="idea"[^>]*>(.*?)</h2>', article(pid), re.S)
    if not m:
        raise SystemExit(f'{pid}: в статье нет заголовка раздела «Идея»')
    t = plain(m.group(1))
    return re.sub(r'^Идея:\s*', '', t)


def pills_of(pid):
    return [plain(p) for p in re.findall(r'<span class="pill">(.*?)</span>', article(pid), re.S)]


def ready_pages(block):
    return [p for t in block['topics'] for p in t['pages'] if p.get('file')]


def topic_pages(topic):
    return [p for p in topic['pages'] if p.get('file')]


def page(title, desc, main, nav='', crumbs='', side=None, cls='', *, share_path=None):
    """Обёртка страницы. С side — каркас страниц курса (боковина + колонка чтения), без — простая колонка .wrap."""
    css = (ROOT / 'engine' / 'base.css').read_text(encoding='utf-8') + '\n' + (ROOT / 'engine' / 'site.css').read_text(encoding='utf-8')
    js = (ROOT / 'engine' / 'site.js').read_text(encoding='utf-8')
    a101 = json.dumps({'storageKey': COURSE['storageKey']}, ensure_ascii=False)
    menu = ('<button type="button" class="btn ghost small menu-btn" id="menuBtn" aria-controls="side" aria-expanded="false">Содержание</button>'
            if side is not None else '')
    top = (f'<header class="top"><div class="top-in">{menu}<a class="brand" href="index.html">{esc(COURSE["title"])}</a>'
           f'<span class="crumbs" id="crumbs">{esc(crumbs)}</span><span class="spacer"></span>{nav}</div></header>\n')
    if side is not None:
        body = (top + f'<div class="shell {cls}">\n<nav class="side" id="side" aria-label="Оглавление">\n{side}\n</nav>\n'
                f'<main class="main" id="top">\n<article class="article">\n{main}\n</article>\n</main>\n</div>\n'
                '<div class="scrim" id="scrim" hidden></div>\n')
    else:
        body = top + f'<main class="wrap {cls}">\n{main}\n</main>\n'
    social = share_meta(share_path, title, desc) if share_path is not None else ''
    return ('<!doctype html>\n<html lang="ru" prefix="og: https://ogp.me/ns#" data-theme="dark">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f'{FAVICON_TAG}'
            f'<title>{esc(title)}</title>\n<meta name="description" content="{esc(desc)}">\n{social}{FONTS}\n<style>\n{css}</style>\n'
            '</head>\n<body>\n' + body +
            f'<script>window.A101 = {a101};</script>\n<script>\n{js}</script>\n</body>\n</html>\n')


NB_READY = ('к каждой теме — блокнот в NotebookLM.', 'к каждой теме готовится блокнот в NotebookLM.')


def notebooks_ready():
    notebooks = json.loads((ROOT / 'engine' / 'notebooks.json').read_text(encoding='utf-8'))
    keys = [f'{b["key"]}-{t["n"]}' for b in COURSE['blocks'] if b['ready'] for t in b['topics']]
    return all((notebooks.get(k) or {}).get('url', '').strip() for k in keys)


def course_lead():
    """Лид главной: пока у готового модуля не все блокноты NotebookLM со ссылками, про блокноты сказано «готовится»."""
    lead = COURSE['lead']
    if NB_READY[0] not in lead:
        raise SystemExit('engine/course.json: в лиде нет фразы про блокноты — поправьте NB_READY в tools/build_site.py')
    return lead if notebooks_ready() else lead.replace(*NB_READY)


def block_stats(b):
    pages = ready_pages(b)
    total = sum(p.get('minutes') or 0 for p in pages)
    return pages, total


# ---------- главная ----------

# Методика страницы: четыре шага читателя и разделы страницы (порядок разделов — ENGINE.md), для схемы на главной.
STEPS = [
    ('Увидеть', 'Страница начинается с идеи в трёх-четырёх предложениях и сцены: анимация по шагам показывает, '
                'что происходит с данными. Шаги листаются кнопками или стрелками на клавиатуре.',
     ['01 Идея', 'Сцена']),
    ('Потрогать', 'Задача из практики аналитика и вопрос на предсказание перед интерактивом: что получится? Потом параметры '
                  'можно менять руками и сверять догадку с результатом. Дальше — нюансы и ограничения метода.',
     ['02 Задача', '03 Метод', 'Интерактив', 'Нюансы', 'Ограничения']),
    ('Повторить в коде', 'Python и SQL с настоящим выводом, как в ноутбуке: таблицы, числа и графики. Тот же код, ноутбуки '
                         'и данные приложены к странице, у тем 03–11 есть общий учебный набор.',
     ['Код', 'Материалы']),
    ('Проверить и обсудить', 'Пять-семь вопросов, у каждого ответа есть разбор; ответы сохраняются в браузере. Что осталось '
                             'непонятным — глоссарий, кнопка «Обсудить с ИИ» с готовым промптом по разделу и блокнот NotebookLM по теме.',
     ['Проверь себя', 'Глоссарий', 'Обсудить с ИИ']),
]
SAMPLE_PAGE = 'da-3-2'


def principles(n_pages):
    """Карточки «Что отличает курс»: бесплатно, BYOM, сделано вместе с ИИ, единая методика."""
    boosty = (COURSE.get('boosty') or '').strip()
    support = (f'<a class="btn ghost small" href="{esc(boosty)}" target="_blank" rel="noopener">Поддержать на Boosty</a>' if boosty
               else '<span class="badge">Boosty · ссылка появится позже</span>')
    nb = ('к каждой теме есть блокнот NotebookLM, где ИИ отвечает по тексту курса' if notebooks_ready()
          else 'к каждой теме готовится блокнот NotebookLM, где ИИ будет отвечать по тексту курса')
    cards = [
        ('Бесплатно и без пейвола',
         'Весь курс открыт: автор не продаёт к нему доступ и не собирается закрывать страницы за подписку. '
         'Исходники лежат на GitHub. Если курс помог, автора можно поддержать на Boosty.',
         support),
        ('BYOM: принесите свою модель',
         'У курса нет ментора и куратора, их место занимает ИИ, которым вы уже пользуетесь (BYOM, bring your own model). '
         f'Кнопка «Обсудить с ИИ» копирует промпт с текстом раздела для Claude, ChatGPT или Gemini, а {nb}.',
         ''),
        ('Написан вместе с ИИ',
         'Большую часть текста, сцен и кода сгенерировал ИИ по методике автора, автор вычитал и проверил результат. '
         'Ошибки всё же возможны: выделите фрагмент на странице и нажмите «Предложить исправление» — заявка с цитатой '
         'уйдёт в репозиторий курса.',
         f'<a class="btn ghost small" href="{esc(COURSE["repo"])}" target="_blank" rel="noopener">Репозиторий на GitHub</a>'),
        ('Одна страница — одна идея',
         f'Все {count(n_pages, PAGES)} собраны по одному плану: идею показывают сценой, дают потрогать в интерактиве, '
         'повторяют в коде и проверяют вопросами. Из чего состоит этот план — в схеме ниже.',
         '<a class="btn ghost small" href="#method">К схеме методики</a>'),
    ]
    out = []
    for t, d, act in cards:
        out.append(f'  <div class="why"><b>{esc(t)}</b><p>{esc(typo(d))}</p>' + (f'<div class="act">{act}</div>' if act else '') + '</div>')
    return '\n'.join(out)


def join_demo(sp):
    """Превью к примеру страницы: два круга ключей из главной сцены страницы 3.2, по очереди INNER, LEFT, RIGHT и FULL JOIN.
    Шаги переключает site.js, вид шага задаёт CSS по data-k."""
    svg = '''<svg class="vn-svg" viewBox="0 0 320 200" aria-hidden="true" focusable="false"><circle class="cl" cx="112" cy="100" r="78"/><circle class="cr" cx="208" cy="100" r="78"/><path class="lens" d="M160 38.5A78 78 0 0 1 160 161.5A78 78 0 0 1 160 38.5Z"/><text class="lab lab-c" x="34" y="18">customers <tspan>c</tspan></text><text class="lab lab-o" x="286" y="18" text-anchor="end">orders <tspan>o</tspan></text><g class="ch l" transform="translate(60 73)"><rect width="44" height="22" rx="6"/><text x="22" y="15">110</text></g><g class="ch l" transform="translate(60 107)"><rect width="44" height="22" rx="6"/><text x="22" y="15">116</text></g><g class="ch x" transform="translate(138 55)"><rect width="44" height="22" rx="6"/><text x="22" y="15">105</text></g><g class="ch x" transform="translate(138 89)"><rect width="44" height="22" rx="6"/><text x="22" y="15">106</text></g><g class="ch x" transform="translate(138 123)"><rect width="44" height="22" rx="6"/><text x="22" y="15">114</text></g><g class="ch r" transform="translate(216 73)"><rect width="44" height="22" rx="6"/><text x="22" y="15">108</text></g><g class="ch r" transform="translate(216 107)"><rect width="44" height="22" rx="6"/><text x="22" y="15">111</text></g><g class="badge" transform="translate(171 80)"><rect width="24" height="16" rx="8"/><text x="12" y="12">×3</text></g></svg>'''
    return (f'<div class="vn" id="vennDemo" data-k="0" role="img" aria-label="Анимация со страницы {sp["num"]}: ключи customer_id двух таблиц '
            f'разложены по двум кругам, по очереди подсвечены INNER, LEFT, RIGHT и FULL JOIN">\n'
            f'    <div class="vn-hd"><span class="eyebrow">Сцена со страницы {sp["num"]} · <b id="vnKind">ключ customer_id</b></span>'
            f'<b class="vn-t" id="vnTitle">Ключи раскладываются по кругам</b></div>\n'
            f'    {svg}\n'
            f'    <p class="vn-note" id="vnNote">Общих ключей три: 105, 106 и 114. У клиента 106 три заказа, а ключ в круге один</p>\n'
            f'    <div class="vn-hud"><span><b id="vnRows">—</b>строк</span><span><b>3</b>общих ключа</span><span><b id="vnNull">—</b>с NULL</span></div>\n'
            f'  </div>')


def method_flow():
    """Схема методики: четыре шага читателя со стрелками, в каждом — разделы страницы."""
    cells = []
    for i, (t, d, tags) in enumerate(STEPS, 1):
        if i > 1:
            cells.append('  <span class="arr" aria-hidden="true"></span>')
        chips = ''.join(f'<span>{esc(x)}</span>' for x in tags)
        cells.append(f'  <div class="step"><span class="sno">Шаг {i:02d}</span><b>{esc(t)}</b><p>{esc(typo(d))}</p>'
                     f'<div class="tags">{chips}</div></div>')
    return '\n'.join(cells)


def mod_cards():
    btns = []
    for b in COURSE['blocks']:
        n_t = len(b['topics'])
        if b['ready']:
            ids = ' '.join(p['id'] for p in ready_pages(b))
            btns.append(f'  <a class="mod-btn ready" href="course.html#{b["key"]}"><b>{esc(b["name"])}</b>'
                        f'<span class="meta"><span>{count(n_t, TOPICS)} · {count(b["pagesReady"], PAGES)}</span>'
                        f'<span data-pages="{ids}" data-fmt="пройдено {{n}} из {{t}}" data-hide-zero hidden></span>'
                        f'<span class="go">Оглавление</span></span></a>')
        else:
            btns.append(f'  <a class="mod-btn" href="course.html#{b["key"]}"><b>{esc(b["name"])}</b>'
                        f'<span class="badge">в{NB}работе</span><span class="meta"><span>{count(n_t, TOPICS)}</span>'
                        f'<span class="go">Темы</span></span></a>')
    return '\n'.join(btns)


def index_html():
    da = next(b for b in COURSE['blocks'] if b['ready'])
    pages, total = block_stats(da)
    first = pages[0]
    ids = ' '.join(p['id'] for p in pages)
    mins = [p['minutes'] for p in pages if p.get('minutes')]
    hours = round(total / 60)
    hero = ('<section class="hero">\n'
            f'  <h1>{esc(COURSE["title"])}</h1>\n  <p class="lead">{esc(typo(course_lead()))}</p>\n'
            f'  <div class="acts"><a class="btn accent" href="{first["file"]}.html">Начать с первой страницы</a>'
            f'<a class="btn ghost" id="resume" hidden></a>'
            f'<a class="btn ghost" href="course.html#{da["key"]}">Оглавление модуля</a></div>\n'
            f'  <div class="facts"><span class="pill">{count(len(pages), PAGES)}</span><span class="pill">{count(len(da["topics"]), TOPICS)}</span>'
            f'<span class="pill">≈{NB}{hours}{NB}ч чтения</span><span class="pill">без регистрации</span>'
            f'<span class="pill prog" data-pages="{ids}" data-fmt="пройдено {{n}} из {{t}}" data-hide-zero hidden></span></div>\n</section>')

    why = (f'<section class="why-sec">\n  <p class="eyebrow">Что отличает курс</p>\n'
           f'  <h2 class="sec-h">Открытый курс, который читают вместе с ИИ и правят вместе с читателями</h2>\n'
           f'  <div class="why-grid">\n{principles(len(pages))}\n  </div>\n</section>')

    features = (f'<section class="method" id="method">\n  <p class="eyebrow">Методика</p>\n'
                f'  <h2 class="sec-h">Одна страница — одна идея, разобранная до конца</h2>\n'
                f'  <p class="sec-p">{esc(typo("На каждой странице читатель проходит одни и те же четыре шага: увидеть идею, потрогать её руками, повторить в коде и проверить себя. Разделы страницы идут в этом порядке, поэтому её можно читать подряд, а можно вернуться к нужному шагу из боковины."))}</p>\n'
                f'  <div class="flow">\n{method_flow()}\n  </div>\n</section>')

    sp = next(p for p in pages if p['id'] == SAMPLE_PAGE)
    st = next(t for t in da['topics'] if sp in t['pages'])
    pills = ''.join(f'<span class="pill">{esc(p)}</span>' for p in pills_of(sp['id']))
    sample = (f'<section class="sample-sec">\n  <p class="eyebrow">Пример страницы</p>\n'
              f'  <h2 class="sec-h">Так выглядит одна страница курса</h2>\n'
              f'  <div class="sample-row">\n'
              f'  <div class="sample">\n    <p class="eyebrow">{esc(da["name"])} · Тема {st["n"]} · <b>{esc(st["name"])}</b></p>\n'
              f'    <h3><a href="{sp["file"]}.html">{sp["num"]} {esc(sp["title"])}</a></h3>\n'
              f'    <p class="li"><span>Идея:</span> {esc(typo(idea_of(sp["id"])))}</p>\n'
              f'    <p class="lp">{esc(typo(lead_of(sp["id"])))}</p>\n'
              f'    <div class="meta-row">{pills}</div>\n'
              f'    <a class="btn ghost small" href="{sp["file"]}.html">Открыть страницу →</a>\n  </div>\n'
              f'  {join_demo(sp)}\n  </div>\n</section>')

    modules = (f'<section class="mods">\n  <p class="eyebrow">Модули курса</p>\n'
               f'  <h2 class="sec-h">Пять модулей, первый готов целиком</h2>\n'
               f'  <div class="mods-grid">\n{mod_cards()}\n  </div>\n</section>')

    rows = []
    for t in da['topics']:
        tp = topic_pages(t)
        tids = ' '.join(p['id'] for p in tp)
        tmin = sum(p.get('minutes') or 0 for p in tp)
        rows.append(f'    <li><span class="tn">{t["n"]}</span><div><a href="course.html#{da["key"]}-{t["n"]}">{esc(t["name"])}</a>'
                    f'<p>{esc(typo(t.get("lead", "")))}</p>'
                    f'<span class="meta">{count(len(tp), PAGES)} · {duration(tmin)}'
                    f'<span data-pages="{tids}" data-fmt=" · пройдено {{n}} из {{t}}" data-hide-zero hidden></span></span></div>'
                    f'<a class="go" href="{tp[0]["file"]}.html" aria-label="Первая страница темы {t["n"]}">→</a></li>')
    topics = (f'<section class="topics-sec">\n  <p class="eyebrow">Темы модуля «{esc(da["name"])}»</p>\n'
              f'  <h2 class="sec-h">{count(len(da["topics"]), TOPICS)}: от первых строк кода до A/B-тестов</h2>\n'
              + (f'  <p class="sec-p">{esc(typo(da["lead"]))}</p>\n' if da.get('lead') else '')
              + f'  <ol class="topic-list">\n' + '\n'.join(rows) + '\n  </ol>\n</section>')

    how = ('<section class="how">\n  <p class="eyebrow">Как читать курс</p>\n  <div class="how-grid">\n'
           f'    <div><b>По порядку или с нужной темы</b><p>{esc(typo("Темы идут от инструментов к статистике, графикам, метрикам и экспериментам. Если Python, pandas и SQL уже знакомы, начинайте с темы 04."))}</p></div>\n'
           f'    <div><b>{min(mins)}–{max(mins)} минут на страницу</b><p>{esc(typo(f"Каждая страница рассчитана на одну сессию чтения, весь модуль — около {hours} часов. Время указано у каждой страницы в оглавлении."))}</p></div>\n'
           f'    <div><b>Прогресс в браузере</b><p>{esc(typo("Отметки «пройдено» и ответы на вопросы хранятся в этом браузере. Регистрации нет, поэтому и переноса на другое устройство тоже нет."))}</p></div>\n'
           f'  </div>\n  <div class="acts"><a class="btn accent" href="course.html#{da["key"]}">В оглавление</a></div>\n</section>')

    foot = (f'<footer class="foot"><span>{esc(COURSE["title"])}</span><a href="course.html">Оглавление курса</a></footer>')
    main = '\n'.join([hero, why, features, how, sample, modules, topics, foot])
    nav = f'<a class="btn ghost small" href="course.html">Оглавление</a><a class="btn accent small" href="{first["file"]}.html">Начать</a>'
    desc = ('Бесплатный интерактивный курс по анализу данных. От Python и SQL до статистики, продуктовых метрик '
            'и A/B-тестов. Уроки с анимациями, кодом и вопросами с разбором.')
    return page(f'{COURSE["title"]} — бесплатный курс о работе с данными', desc, main, nav=nav, cls='home', share_path='')


# ---------- оглавление ----------

def course_html():
    chips = ''.join(f'<a href="course.html#{b["key"]}" data-mod="{b["key"]}">{esc(b["name"])}</a>' for b in COURSE['blocks'])
    sides, mods = [], []
    for b in COURSE['blocks']:
        k = b['key']
        if b['ready']:
            pages, total = block_stats(b)
            ids = ' '.join(p['id'] for p in pages)
            toc, cards = [], []
            for t in b['topics']:
                tp = topic_pages(t)
                tids = ' '.join(p['id'] for p in tp)
                tmin = sum(p.get('minutes') or 0 for p in tp)
                toc.append(f'      <li><a href="#{k}-{t["n"]}"><b class="n">{t["n"]}</b><span>{esc(t["name"])}</span>'
                           f'<small class="tc" data-pages="{tids}" data-fmt="{{n}}/{{t}}"></small></a></li>')
                rows = []
                for p in tp:
                    rows.append(
                        f'        <li class="lesson"><input type="checkbox" data-page="{p["id"]}" aria-label="Пройдено: {p["num"]} {esc(p["title"])}">'
                        f'<span class="pn">{p["num"]}</span><div class="lb"><a class="lt" href="{p["file"]}.html">{esc(p["title"])}</a>'
                        f'<p class="li"><span>Идея:</span> {esc(typo(idea_of(p["id"])))}</p>'
                        f'<p class="lp">{esc(typo(lead_of(p["id"])))}</p></div>'
                        f'<span class="pm">{duration(p["minutes"]) if p.get("minutes") else ""}</span>'
                        f'<button type="button" class="mk" data-mark="{p["id"]}" aria-label="В закладки">☆</button></li>')
                cards.append(
                    f'    <section class="topic" id="t-{k}-{t["n"]}">\n'
                    f'      <h2><span class="sn">{t["n"]}</span><a class="th" href="{tp[0]["file"]}.html">{esc(t["name"])}</a></h2>\n'
                    f'      <p class="tmeta">{count(len(tp), PAGES)} · {duration(tmin)} · <span class="tcnt" data-pages="{tids}">0 из {len(tp)}</span></p>\n'
                    + (f'      <p class="tlead">{esc(typo(t["lead"]))}</p>\n' if t.get('lead') else '')
                    + f'      <ol class="lessons">\n' + '\n'.join(rows) + '\n      </ol>\n    </section>')
            sides.append(
                f'<div class="side-mod" data-mod="{k}" hidden>\n  <h4>Темы блока {esc(b["gen"])}</h4>\n  <ul class="toc">\n' + '\n'.join(toc) + '\n  </ul>\n'
                f'  <div class="side-prog"><div class="bar" data-pages="{ids}"><i></i></div>'
                f'<span class="cnt" data-pages="{ids}" data-fmt="Пройдено {{n}} из {{t}}">Пройдено 0 из {len(pages)}</span></div>\n'
                f'  <div class="side-marks" hidden><h4>Закладки</h4><ul class="toc marks"></ul></div>\n</div>')
            mods.append(
                f'<section class="mod" id="m-{k}" data-mod="{k}" data-name="{esc(b["name"])}" hidden>\n'
                f'  <p class="eyebrow">{esc(COURSE["title"])} · <b>Оглавление модуля</b></p>\n  <h1>{esc(b["name"])}</h1>\n'
                + (f'  <p class="lead">{esc(typo(b["lead"]))}</p>\n' if b.get('lead') else '')
                + f'  <div class="meta-row"><span class="pill">{count(len(b["topics"]), TOPICS)}</span><span class="pill">{count(len(pages), PAGES)}</span>'
                f'<span class="pill">≈{NB}{round(total / 60)}{NB}ч чтения</span>'
                f'<span class="pill prog" data-pages="{ids}" data-fmt="пройдено {{n}} из {{t}}">пройдено 0 из {len(pages)}</span></div>\n'
                f'  <p class="note">Заголовок темы ведёт на её первую страницу. Отметки «пройдено» хранятся только в этом браузере.</p>\n'
                + '\n'.join(cards) + '\n</section>')
        else:
            toc = '\n'.join(f'      <li><span><b class="n">{t["n"]}</b>{esc(t["name"])}</span></li>' for t in b['topics'])
            sides.append(f'<div class="side-mod" data-mod="{k}" hidden>\n  <h4>Темы блока {esc(b["gen"])}</h4>\n  <ul class="toc">\n{toc}\n  </ul>\n</div>')
            rows = '\n'.join(f'    <li><span class="tn">{t["n"]}</span><span>{esc(t["name"])}</span><span class="badge">в{NB}работе</span></li>'
                             for t in b['topics'])
            mods.append(
                f'<section class="mod" id="m-{k}" data-mod="{k}" data-name="{esc(b["name"])}" hidden>\n'
                f'  <p class="eyebrow">{esc(COURSE["title"])} · <b>Оглавление модуля</b></p>\n  <h1>{esc(b["name"])}</h1>\n'
                f'  <p class="lead">Модуль в{NB}работе: темы взяты из{NB}программы, страницы пишутся.</p>\n'
                f'  <div class="meta-row"><span class="pill">{count(len(b["topics"]), TOPICS)}</span><span class="pill">в{NB}работе</span></div>\n'
                f'  <ol class="soon-list">\n{rows}\n  </ol>\n</section>')
    side = f'<h4>Блоки</h4>\n<div class="blocks">{chips}</div>\n' + '\n'.join(sides)
    return page(f'Оглавление · {COURSE["title"]}', f'Модули, темы и страницы курса «{COURSE["title"]}» с отметками о пройденном.',
                '\n'.join(mods), crumbs='Оглавление', side=side, cls='course', share_path='course.html')


def lost_html():
    main = ('<section class="lost"><p class="eyebrow">Ошибка 404</p><h1>Такой страницы нет</h1>'
            '<p>Возможно, ссылка устарела или в адресе опечатка. Все страницы курса собраны в оглавлении.</p>'
            '<div class="acts"><a class="btn accent" href="course.html">Оглавление курса</a>'
            '<a class="btn ghost" href="index.html">Главная</a></div></section>')
    return page(f'Страница не найдена · {COURSE["title"]}', 'Такой страницы в курсе нет.', main)


def main():
    with_materials = '--no-materials' not in sys.argv[1:]
    built = {'index.html': index_html(), 'course.html': course_html(), '404.html': lost_html()}
    files = [p['file'] for b in COURSE['blocks'] for p in ready_pages(b)]
    missing = [f for f in files if not (DIST / 'standalone' / f'{f}.html').exists()]
    if missing:
        raise SystemExit(f'Нет собранных страниц ({len(missing)}): {", ".join(missing[:5])}… — сначала python3 build.py --all')
    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir()
    for name, text in built.items():
        (SITE / name).write_text(text, encoding='utf-8')
        (DIST / 'standalone' / name).write_text(text, encoding='utf-8')
    (SITE / '.nojekyll').write_text('', encoding='utf-8')
    for image in (FAVICON, SHARE_IMAGE):
        shutil.copyfile(image, SITE / image.name)
    for f in files:
        shutil.copy2(DIST / 'standalone' / f'{f}.html', SITE / f'{f}.html')
    if with_materials:
        if not (DIST / 'materials').exists():
            raise SystemExit('Нет dist/materials/ — материалы собираются tools/build_materials.py')
        shutil.copytree(DIST / 'materials', SITE / 'materials', ignore=shutil.ignore_patterns('index.json'))
    size = sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())
    print(f'site/: главная, оглавление, 404, страниц {len(files)}{", материалы" if with_materials else ", без материалов"}; '
          f'{size / 1048576:.1f} МБ')


if __name__ == '__main__':
    main()
