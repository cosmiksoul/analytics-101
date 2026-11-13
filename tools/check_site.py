"""Проверка собранного сайта site/: внутренние ссылки, якоря, ссылки на материалы.

python3 tools/check_site.py [папка сайта]       по умолчанию site/

Проверяет href и src во всех .html (внешние http(s) и mailto пропускает), якоря #id на той же странице,
якоря оглавления course.html#da и #da-03 (их обрабатывает site.js: секции m-da, темы t-da-03)
и пути материалов из window.A101 в страницах. Код выхода 1, если что-то не нашлось.
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
SITE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / 'site'
ATTR = re.compile(r'\b(?:href|src)="([^"]+)"')
IDS = re.compile(r'\bid="([^"]+)"')


def main():
    if not (SITE / 'index.html').exists():
        raise SystemExit(f'{SITE}: нет index.html — сначала python3 tools/build_site.py')
    ids = {p: set(IDS.findall(p.read_text(encoding='utf-8'))) for p in SITE.glob('*.html')}
    bad, links, mats = [], 0, set()
    for page, own in sorted(ids.items()):
        text = page.read_text(encoding='utf-8')
        markup = re.sub(r'<script\b.*?</script>', '', text, flags=re.S)   # шаблоны ссылок в JS не проверяем
        for url in ATTR.findall(markup):
            if re.match(r'(?:https?:|mailto:|data:)', url) or url.startswith('//'):
                continue
            links += 1
            u = urlsplit(url)
            target = page if not u.path else (page.parent / unquote(u.path)).resolve()
            if not target.exists():
                bad.append(f'{page.name}: нет файла {url}')
                continue
            frag = unquote(u.fragment)
            if not frag or target.suffix != '.html':
                continue
            have = ids.get(target, set())
            if target.name == 'course.html':
                ok = f'm-{frag}' in have or f't-{frag}' in have
            else:
                ok = frag in have or frag == 'top'
            if not ok:
                bad.append(f'{page.name}: нет якоря {url}')
        m = re.search(r'window\.A101 = (\{.*?\});</script>', text)
        mat = json.loads(m.group(1)).get('materials') if m else None
        if mat:
            paths = [mat['zip']] + [f['path'] for f in mat['files'].values()] + [s['zip'] for s in mat['sets'].values()]
            for p in paths:
                if p not in mats and not (SITE / p).exists():
                    bad.append(f'{page.name}: нет материала {p}')
                mats.add(p)
    print(f'{SITE.name}/: страниц {len(ids)}, ссылок {links}, путей материалов {len(mats)}, ошибок {len(bad)}')
    for b in bad[:40]:
        print('  ✗', b)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
