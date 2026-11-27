"""Сборка страниц курса «Аналитика 101»: standalone HTML и артефакт (без doctype/head/body).

python3 build.py da-1-1 [da-1-2 ...]      отдельные страницы
python3 build.py --all                     все страницы из pages/

Страница лежит в pages/<id>/: meta.json, article.html, page.js, page.css (необязательно).
Структура курса — engine/course.json (tools/make_course.py), ссылки на блокноты NotebookLM — engine/notebooks.json,
ссылки на материалы — dist/materials/index.json (tools/build_materials.py --index), если он есть.
Страницы, главная и оглавление лежат в одной папке сайта, материалы — в её подпапке materials/.
"""
import html
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
COURSE = json.loads((ROOT / 'engine' / 'course.json').read_text(encoding='utf-8'))
NOTEBOOKS = json.loads((ROOT / 'engine' / 'notebooks.json').read_text(encoding='utf-8'))
MAT_INDEX = ROOT / 'dist' / 'materials' / 'index.json'
SITE_URL = 'https://cosmiksoul.github.io/analytics-101/'
SHARE_IMAGE = ROOT / 'engine' / 'share-preview.png'
FAVICON = ROOT / 'engine' / 'favicon.ico'
FAVICON_TAG = f'<link rel="icon" href="{SITE_URL}{FAVICON.name}" sizes="16x16 32x32 48x48">\n'
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500'
         '&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=Onest:wght@400;500;600;700&display=swap">')


def esc(s):
    return html.escape(s, quote=True)


def share_meta(path, title, description, *, kind='website'):
    """Метаданные ссылки для соцсетей. Пустой путь означает главную."""
    url = SITE_URL + path
    image = SITE_URL + SHARE_IMAGE.name
    alt = 'Бесплатный курс «Аналитика 101» и скриншот анимации об условной вероятности'
    short_description = description
    if len(description) > 200:
        short_description = description[:199].rsplit(maxsplit=1)[0] + '…'
    og = {'title': title, 'description': description, 'type': kind, 'url': url,
          'site_name': COURSE['title'], 'locale': 'ru_RU', 'image': image,
          'image:type': 'image/png', 'image:width': '1200', 'image:height': '630', 'image:alt': alt}
    twitter = {'card': 'summary_large_image', 'title': title, 'description': short_description,
               'image': image, 'image:alt': alt}
    tags = [f'<link rel="canonical" href="{esc(url)}">']
    tags.extend(f'<meta property="og:{key}" content="{esc(value)}">' for key, value in og.items())
    tags.extend(f'<meta name="twitter:{key}" content="{esc(value)}">' for key, value in twitter.items())
    return '\n'.join(tags) + '\n'


def materials_map(pid):
    """Карта материалов страницы для движка: файлы по имени, архив страницы, архивы общих наборов."""
    if not MAT_INDEX.exists():
        return None
    idx = json.loads(MAT_INDEX.read_text(encoding='utf-8'))
    pg = idx['pages'].get(pid)
    if not pg:
        return None
    return {'zip': pg['zip'], 'zipBytes': pg['zipBytes'],
            'files': {f['name']: {'path': f['path'], 'bytes': f['bytes']} for f in pg['files']},
            'sets': {k: {'zip': v['zip'], 'bytes': v['zipBytes']} for k, v in idx['data'].items()}}


def nlm_parts(block, topic):
    """Пункт меню «NotebookLM» и тексты раздела «Материалы»: ссылка на блокнот темы или «скоро», готов ли блокнот."""
    nb = NOTEBOOKS.get(f'{block["key"]}-{topic["n"]}') or {}
    url, title = nb.get('url', '').strip(), nb.get('title') or f'Аналитика 101 · {topic["n"]} {topic["name"]}'
    if url:
        item = (f'<a class="mi mi-notebook" href="{esc(url)}" target="_blank" rel="noopener"><b>NotebookLM</b>'
                f'<small>Блокнот темы «{esc(topic["name"])}»: все страницы темы уже загружены</small></a>')
        inline = f'<a href="{esc(url)}" target="_blank" rel="noopener">«{esc(title)}»</a>'
    else:
        item = (f'<span class="mi off" aria-disabled="true"><b>NotebookLM<em>скоро</em></b>'
                f'<small>Блокнот темы «{esc(topic["name"])}» готовится</small></span>')
        inline = f'«{esc(title)}» — ссылка появится позже'
    state = ('блокнот уже собран: в&nbsp;нём все страницы темы и&nbsp;описание её&nbsp;данных.' if url else
             'блокнот готовится: в&nbsp;нём будут все страницы темы и&nbsp;описание её&nbsp;данных.')
    return item, inline, state


def find(pid):
    for block in COURSE['blocks']:
        for topic in block['topics']:
            for page in topic['pages']:
                if page.get('id') == pid:
                    return block, topic, page
    raise SystemExit(f'{pid}: страницы нет в engine/course.json — запустите tools/make_course.py')


def build(pid):
    d = ROOT / 'pages' / pid
    meta = json.loads((d / 'meta.json').read_text(encoding='utf-8'))
    block, topic, page = find(pid)
    num = page['num']
    toc = []
    for tp in block['topics']:
        ready = [p for p in tp['pages'] if p.get('file')]
        if tp is topic:
            sub = []
            for p in tp['pages']:
                t = esc(p.get('title') or p['plan'])
                if p is page:
                    sub.append(f'          <li class="here" data-page="{p["id"]}">{t}</li>')
                elif p.get('file'):
                    sub.append(f'          <li data-page="{p["id"]}"><a href="{p["file"]}.html">{t}</a></li>')
                else:
                    sub.append(f'          <li>{t}<small>скоро</small></li>')
            toc.append(f'      <li class="open"><span><b class="n">{tp["n"]}</b>{esc(tp["name"])}</span>\n        <ul>\n'
                       + '\n'.join(sub) + '\n        </ul>\n      </li>')
        elif ready:
            toc.append(f'      <li><a href="{ready[0]["file"]}.html"><b class="n">{tp["n"]}</b>{esc(tp["name"])}</a></li>')
        else:
            toc.append(f'      <li><span><b class="n">{tp["n"]}</b>{esc(tp["name"])}</span></li>')
    blocks = ''.join(f'<span class="on">{esc(b["name"])}</span>' if b is block else f'<a href="course.html#{b["key"]}">{esc(b["name"])}</a>'
                     for b in COURSE['blocks'])
    nlm_item, nlm_inline, nlm_state = nlm_parts(block, topic)
    article = (d / 'article.html').read_text(encoding='utf-8')
    # соседние сноски без текста между ними разделяем запятой (CSS не видит текстовые узлы, поэтому делаем это при сборке)
    article = re.sub(r'(<a class="ref"[^>]*>[^<]*</a>)\s*(?=<a class="ref")', r'\1<span class="ref-sep">,</span>', article)
    article = (article.replace('<span class="nlm-open"></span>', f'<span class="nlm-open">{nlm_inline}</span>')
                      .replace('<span class="nlm-state"></span>', nlm_state))
    page_js = (d / 'page.js').read_text(encoding='utf-8')
    qn = len(re.findall(r'^\s{4}q\d+\s*:', page_js, re.M))
    shell = (ROOT / 'engine' / 'shell.html').read_text(encoding='utf-8')
    body = (shell.replace('{{CRUMBS}}', esc(f'{block["name"]} · {topic["name"]} · {num} {page["title"]}'))
                 .replace('{{QN}}', str(qn)).replace('{{BLOCKS}}', blocks).replace('{{BLOCK_GEN}}', block['gen'])
                 .replace('{{TOC_ANCHOR}}', f'{block["key"]}-{topic["n"]}').replace('{{NLM_ITEM}}', nlm_item)
                 .replace('{{TOC}}', '\n'.join(toc)).replace('{{ARTICLE}}', article))
    css = '\n'.join((ROOT / 'engine' / f).read_text(encoding='utf-8') for f in ('base.css', 'extra.css'))
    if (d / 'page.css').exists():
        css += '\n/* ===== Стили страницы ===== */\n' + (d / 'page.css').read_text(encoding='utf-8')
    engine = (ROOT / 'engine' / 'engine.js').read_text(encoding='utf-8')
    # структура модуля для панели прогресса (только готовые страницы), соседние страницы для навигации внизу
    ready = [p for tp in block['topics'] for p in tp['pages'] if p.get('file')]
    brief = lambda p: {'id': p['id'], 'num': p['num'], 'title': p['title'], 'file': p['file'], 'minutes': p.get('minutes') or 0}
    pos = next(i for i, p in enumerate(ready) if p['id'] == pid)
    course = {'key': block['key'], 'name': block['name'],
              'topics': [{'n': tp['n'], 'name': tp['name'], 'pages': [brief(p) for p in tp['pages'] if p.get('file')]}
                         for tp in block['topics'] if any(p.get('file') for p in tp['pages'])]}
    a101 = {'storageKey': COURSE['storageKey'], 'materials': materials_map(pid), 'page': brief(page), 'course': course,
            'prev': brief(ready[pos - 1]) if pos > 0 else None, 'next': brief(ready[pos + 1]) if pos + 1 < len(ready) else None,
            # «Предложить исправление»: репозиторий для issue и версия сборки (хеш коммита в CI, local — у себя)
            'repo': COURSE.get('repo', ''), 'build': (os.environ.get('GITHUB_SHA') or '')[:7] or 'local'}
    name = meta['file']
    title = f'{meta["title"]} · {COURSE["title"]}'
    desc = meta['description']
    head = (f'<title>{esc(title)}</title>\n'
            f'<meta name="description" content="{esc(desc)}">\n{FONTS}\n<style>\n{css}</style>')
    tail = (f'<script>window.A101 = {json.dumps(a101, ensure_ascii=False, separators=(",", ":"))};</script>\n'
            f'<script>\n{page_js}\n</script>\n<script>\n{engine}</script>')
    artifact = f'{head}\n{body}\n{tail}\n'
    standalone = ('<!doctype html>\n<html lang="ru" prefix="og: https://ogp.me/ns#" data-theme="dark">\n<head>\n<meta charset="utf-8">\n'
                  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                  f'{FAVICON_TAG}'
                  f'{share_meta(name + ".html", title, desc, kind="article")}{head}\n'
                  f'</head>\n<body>\n{body}\n{tail}\n</body>\n</html>\n')
    for sub in ('artifact', 'standalone'):
        (ROOT / 'dist' / sub).mkdir(parents=True, exist_ok=True)
    (ROOT / 'dist' / 'artifact' / f'{name}.html').write_text(artifact, encoding='utf-8')
    (ROOT / 'dist' / 'standalone' / f'{name}.html').write_text(standalone, encoding='utf-8')
    kb = len(standalone.encode('utf-8')) / 1024
    print(f'{pid}: {name}.html  {kb:.0f} КБ, вопросов {qn}{"" if a101["materials"] else ", без карты материалов"}')


def all_pages():
    key = lambda p: [int(x) if x.isdigit() else x for x in p.name.split('-')]
    return [p.name for p in sorted((ROOT / 'pages').iterdir(), key=key) if (p / 'meta.json').exists()]


if __name__ == '__main__':
    ids = all_pages() if sys.argv[1:] == ['--all'] else sys.argv[1:]
    if not ids:
        raise SystemExit(__doc__)
    for p in ids:
        build(p)
