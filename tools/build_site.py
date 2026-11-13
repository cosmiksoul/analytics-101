"""Сборка сайта «Аналитика 101» в папку site/: главная, оглавление курса, 404, страницы и материалы.

python3 build.py --all && python3 tools/build_site.py      полная сборка
python3 tools/build_site.py --no-materials                  без копирования материалов (быстрый просмотр)

Берёт engine/course.json (структура и тексты), pages/<id>/article.html (отрывок «Идеи» первой страницы темы),
dist/standalone/*.html (собранные страницы) и dist/materials/ (материалы, кроме служебного index.json).
Главная, оглавление и 404 кладутся ещё и в dist/standalone/, чтобы папку страниц можно было открыть локально.
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
NB = ' '


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
    s = re.sub(r'<sup\b.*?</sup>|<a class="ref".*?</a>|<span class="ref-sep">.*?</span>', '', s, flags=re.S)
    return re.sub(r'[ \t\r\n]+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()  # неразрывные пробелы страницы сохраняем


def typo(s):
    """Неразрывный пробел после слов из одной-двух букв (предлоги, союзы) и перед тире — как в тексте страниц."""
    s = re.sub(r'(?<![\w-])([А-ЯЁа-яё]{1,2}) ', '\\1' + NB, s)
    return s.replace(' — ', NB + '— ')


def snippet(pid):
    """Главный абзац «Идеи» страницы, обрезанный до двух предложений (трёх, если два короче 150 знаков)."""
    article = (ROOT / 'pages' / pid / 'article.html').read_text(encoding='utf-8')
    m = re.search(r'data-sec="idea".*?<p[^>]*>(.*?)</p>', article, re.S)
    if not m:
        raise SystemExit(f'{pid}: в разделе «Идея» нет абзаца для отрывка')
    sents = re.split(r'(?<=[.!?…])\s+(?=[А-ЯЁA-Z«(])', plain(m.group(1)))
    take = sents[:2] if len(' '.join(sents[:2])) >= 150 else sents[:3]
    return ' '.join(take)


def ready_pages(block):
    return [p for t in block['topics'] for p in t['pages'] if p.get('file')]


def page(title, desc, nav, main):
    css = (ROOT / 'engine' / 'base.css').read_text(encoding='utf-8')
    if css.count('/* каркас */') != 1:
        raise SystemExit('engine/base.css: не найден блок «/* каркас */» — до него идут токены, шапка и кнопки')
    css = css.split('/* каркас */')[0] + (ROOT / 'engine' / 'site.css').read_text(encoding='utf-8')
    js = (ROOT / 'engine' / 'site.js').read_text(encoding='utf-8')
    a101 = json.dumps({'storageKey': COURSE['storageKey']}, ensure_ascii=False)
    return ('<!doctype html>\n<html lang="ru" data-theme="dark">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f'<title>{esc(title)}</title>\n<meta name="description" content="{esc(desc)}">\n{FONTS}\n<style>\n{css}</style>\n'
            '</head>\n<body>\n'
            f'<header class="top"><div class="top-in"><a class="brand" href="index.html">{esc(COURSE["title"])}</a>'
            f'<span class="spacer"></span>{nav}</div></header>\n'
            f'<main class="wrap">\n{main}\n</main>\n'
            f'<script>window.A101 = {a101};</script>\n<script>\n{js}</script>\n</body>\n</html>\n')


NB_READY = ('к каждой теме — блокнот в NotebookLM, где тему можно обсудить с ИИ по тексту курса.',
            'к каждой теме готовится блокнот в NotebookLM, где тему можно будет обсудить с ИИ по тексту курса.')


def course_lead():
    """Лид главной: пока у готового модуля не все блокноты NotebookLM со ссылками, про блокноты сказано «готовится»."""
    notebooks = json.loads((ROOT / 'engine' / 'notebooks.json').read_text(encoding='utf-8'))
    keys = [f'{b["key"]}-{t["n"]}' for b in COURSE['blocks'] if b['ready'] for t in b['topics']]
    ready = all((notebooks.get(k) or {}).get('url', '').strip() for k in keys)
    lead = COURSE['lead']
    if NB_READY[0] not in lead:
        raise SystemExit('engine/course.json: в лиде нет фразы про блокноты — поправьте NB_READY в tools/build_site.py')
    return lead if ready else lead.replace(*NB_READY)


def index_html():
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
    main = (f'<section class="hero">\n  <h1>{esc(COURSE["title"])}</h1>\n  <p class="lead">{esc(typo(course_lead()))}</p>\n</section>\n'
            '<h2 class="eyebrow mods-label">Модули курса</h2>\n<div class="mods-grid">\n' + '\n'.join(btns) + '\n</div>')
    nav = '<a class="btn ghost small" href="course.html">Оглавление</a>'
    desc = COURSE['lead'].split('. ')[0] + '.'
    return page(f'{COURSE["title"]} — бесплатный курс о работе с данными', desc, nav, main)


def course_html():
    chips, mods = [], []
    for b in COURSE['blocks']:
        k = b['key']
        if b['ready']:
            pages = ready_pages(b)
            ids = ' '.join(p['id'] for p in pages)
            chips.append(f'<a href="#{k}">{esc(b["name"])} <small>{b["pagesReady"]}</small></a>')
            total = sum(p.get('minutes') or 0 for p in pages)
            cards = []
            for t in b['topics']:
                tp = [p for p in t['pages'] if p.get('file')]
                rows = '\n'.join(
                    f'        <li><input type="checkbox" data-page="{p["id"]}" aria-label="Пройдено: {p["num"]} {esc(p["title"])}">'
                    f'<span class="pn">{p["num"]}</span><a href="{p["file"]}.html">{esc(p["title"])}</a>'
                    f'<span class="pm">{duration(p["minutes"]) if p.get("minutes") else ""}</span></li>' for p in tp)
                tids = ' '.join(p['id'] for p in tp)
                tmin = sum(p.get('minutes') or 0 for p in tp)
                cards.append(
                    f'    <article class="topic" id="t-{k}-{t["n"]}">\n'
                    f'      <div class="topic-hd"><span class="tn">{t["n"]}</span><h3>{esc(t["name"])}</h3>'
                    f'<span class="tcnt" data-pages="{tids}">0 из {len(tp)}</span></div>\n'
                    f'      <p class="tmeta">{count(len(tp), PAGES)} · {duration(tmin)}</p>\n'
                    + (f'      <p class="tlead">{esc(typo(t["lead"]))}</p>\n' if t.get('lead') else '')
                    + f'      <blockquote class="snip"><p>{esc(typo(snippet(tp[0]["id"])))}</p><cite>— из страницы {tp[0]["num"]}</cite></blockquote>\n'
                    f'      <ol class="pages">\n{rows}\n      </ol>\n    </article>')
            mods.append(
                f'<section class="mod" id="m-{k}" aria-labelledby="h-{k}">\n  <div class="mod-hd">\n'
                f'    <h2 id="h-{k}">{esc(b["name"])}</h2>\n'
                f'    <p class="mod-meta">{count(len(b["topics"]), TOPICS)} · {count(len(pages), PAGES)} · ≈{NB}{round(total / 60)}{NB}ч чтения</p>\n'
                f'    <div class="prog"><div class="bar" data-pages="{ids}"><i></i></div>'
                f'<span class="cnt" data-pages="{ids}" data-fmt="Пройдено {{n}} из {{t}}">Пройдено 0 из {len(pages)}</span>'
                f'<span class="note">Отметки хранятся только в этом браузере.</span></div>\n  </div>\n'
                f'  <div class="topics">\n' + '\n'.join(cards) + '\n  </div>\n</section>')
        else:
            chips.append(f'<a href="#{k}">{esc(b["name"])} <small>в{NB}работе</small></a>')
            rows = '\n'.join(f'    <li><span class="tn">{t["n"]}</span><span>{esc(t["name"])}</span><span class="badge">в{NB}работе</span></li>'
                             for t in b['topics'])
            mods.append(
                f'<section class="mod" id="m-{k}" aria-labelledby="h-{k}">\n  <div class="mod-hd">\n'
                f'    <h2 id="h-{k}">{esc(b["name"])}</h2>\n'
                f'    <p class="mod-meta">{count(len(b["topics"]), TOPICS)} · модуль в работе: темы взяты из программы, страницы пишутся</p>\n'
                f'  </div>\n  <ol class="soon-list">\n{rows}\n  </ol>\n</section>')
    main = ('<div class="toc-hd"><p class="eyebrow">' + esc(COURSE['title']) + '</p><h1>Оглавление курса</h1></div>\n'
            '<nav class="chips" aria-label="Модули курса">' + ''.join(chips) + '</nav>\n' + '\n'.join(mods))
    return page(f'Оглавление · {COURSE["title"]}', f'Модули, темы и страницы курса «{COURSE["title"]}» с отметками о пройденном.',
                '', main)


def lost_html():
    main = ('<section class="lost"><p class="eyebrow">Ошибка 404</p><h1>Такой страницы нет</h1>'
            '<p>Возможно, ссылка устарела или в адресе опечатка. Все страницы курса собраны в оглавлении.</p>'
            '<div class="acts"><a class="btn accent" href="course.html">Оглавление курса</a>'
            '<a class="btn ghost" href="index.html">Главная</a></div></section>')
    return page(f'Страница не найдена · {COURSE["title"]}', 'Такой страницы в курсе нет.', '', main)


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
