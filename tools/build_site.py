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
from build import FONTS, esc  # noqa: E402

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


def page(title, desc, main, nav='', crumbs='', side=None, cls=''):
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
    return ('<!doctype html>\n<html lang="ru" data-theme="dark">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f'<title>{esc(title)}</title>\n<meta name="description" content="{esc(desc)}">\n{FONTS}\n<style>\n{css}</style>\n'
            '</head>\n<body>\n' + body +
            f'<script>window.A101 = {a101};</script>\n<script>\n{js}</script>\n</body>\n</html>\n')


NB_READY = ('к каждой теме — блокнот в NotebookLM, где тему можно обсудить с ИИ по тексту курса.',
            'к каждой теме готовится блокнот в NotebookLM, где тему можно будет обсудить с ИИ по тексту курса.')


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

FEATURES = [
    ('Сцена', 'Идея страницы показана анимацией по шагам. Шаги листаются кнопками или стрелками на клавиатуре.'),
    ('Интерактив', 'Параметры можно менять руками и сразу видеть, как меняется результат.'),
    ('Код с выводом', 'Python и SQL приведены вместе с настоящим выводом, как в ноутбуке: таблицы, числа и графики.'),
    ('Вопросы с разбором', 'В конце страницы — вопросы, у каждого ответа есть объяснение. Ответы сохраняются в браузере.'),
    ('Материалы', 'К странице приложены ноутбуки, код и данные, у тем 03–11 есть общий учебный набор. Всё скачивается с самой страницы.'),
    ('Обсудить с ИИ', 'Кнопка копирует промпт с текстом раздела или всей страницы — вставьте его в Claude, ChatGPT или Gemini.'),
]
SAMPLE_PAGE = 'da-3-2'


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
    nb_line = (' К каждой теме есть блокнот NotebookLM.' if notebooks_ready() else ' К каждой теме готовится блокнот NotebookLM.')
    feats = FEATURES[:-1] + [(FEATURES[-1][0], FEATURES[-1][1] + nb_line)]

    hero = (f'<section class="hero">\n  <p class="eyebrow">Курс о работе с данными · модуль «{esc(da["name"])}» готов</p>\n'
            f'  <h1>{esc(COURSE["title"])}</h1>\n  <p class="lead">{esc(typo(course_lead()))}</p>\n'
            f'  <div class="acts"><a class="btn accent" href="{first["file"]}.html">Начать с первой страницы</a>'
            f'<a class="btn ghost" id="resume" hidden></a>'
            f'<a class="btn ghost" href="course.html#{da["key"]}">Оглавление модуля</a></div>\n'
            f'  <div class="facts"><span class="pill">{count(len(pages), PAGES)}</span><span class="pill">{count(len(da["topics"]), TOPICS)}</span>'
            f'<span class="pill">≈{NB}{hours}{NB}ч чтения</span><span class="pill">без регистрации</span>'
            f'<span class="pill prog" data-pages="{ids}" data-fmt="пройдено {{n}} из {{t}}" data-hide-zero hidden></span></div>\n</section>')

    feat_cards = '\n'.join(f'  <div class="feat"><b>{esc(t)}</b><p>{esc(typo(d))}</p></div>' for t, d in feats)
    features = (f'<section class="feats">\n  <p class="eyebrow">Как устроена страница</p>\n'
                f'  <h2 class="sec-h">Одна страница — одна идея, разобранная до конца</h2>\n'
                f'  <div class="feat-grid">\n{feat_cards}\n  </div>\n</section>')

    sp = next(p for p in pages if p['id'] == SAMPLE_PAGE)
    st = next(t for t in da['topics'] if sp in t['pages'])
    pills = ''.join(f'<span class="pill">{esc(p)}</span>' for p in pills_of(sp['id']))
    sample = (f'<section class="sample-sec">\n  <p class="eyebrow">Пример страницы</p>\n'
              f'  <div class="sample">\n    <p class="eyebrow">{esc(da["name"])} · Тема {st["n"]} · <b>{esc(st["name"])}</b></p>\n'
              f'    <h3><a href="{sp["file"]}.html">{sp["num"]} {esc(sp["title"])}</a></h3>\n'
              f'    <p class="li"><span>Идея:</span> {esc(typo(idea_of(sp["id"])))}</p>\n'
              f'    <p class="lp">{esc(typo(lead_of(sp["id"])))}</p>\n'
              f'    <div class="meta-row">{pills}</div>\n'
              f'    <a class="btn ghost small" href="{sp["file"]}.html">Открыть страницу →</a>\n  </div>\n</section>')

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
           '  </div>\n</section>')

    foot = (f'<footer class="foot"><span>{esc(COURSE["title"])}</span><a href="course.html">Оглавление курса</a></footer>')
    main = '\n'.join([hero, features, sample, modules, topics, how, foot])
    nav = f'<a class="btn ghost small" href="course.html">Оглавление</a><a class="btn accent small" href="{first["file"]}.html">Начать</a>'
    desc = COURSE['lead'].split('. ')[0] + '.'
    return page(f'{COURSE["title"]} — бесплатный курс о работе с данными', desc, main, nav=nav, cls='home')


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
                '\n'.join(mods), crumbs='Оглавление', side=side, cls='course')


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
