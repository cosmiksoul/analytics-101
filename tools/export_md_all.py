"""Markdown-версии страниц: для материалов и для блокнотов NotebookLM.

python3 tools/export_md_all.py materials     dist/materials/<файл>/<файл>.md — то же, что кнопка «Скопировать страницу
                                             в Markdown»; потом python3 tools/build_materials.py --index (архивы и карта)
python3 tools/export_md_all.py notebooklm    dist/notebooklm/<NN Тема>/: страницы темы с ответами и разборами вопросов
                                             и файл «Данные и материалы темы» из README материалов

Берёт собранные страницы из dist/standalone/ (python3 build.py --all), нужны Node.js и Playwright.
"""
import json
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
COURSE = json.loads((ROOT / 'engine' / 'course.json').read_text(encoding='utf-8'))
NOTEBOOKS = json.loads((ROOT / 'engine' / 'notebooks.json').read_text(encoding='utf-8'))


def export(html, out, flag=None):
    cmd = ['node', str(ROOT / 'tools' / 'export_md.js'), str(html), str(out)] + ([flag] if flag else [])
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if r.returncode or not Path(out).exists():
        raise SystemExit(f'{html.name}: экспорт не удался\n{r.stderr[-800:]}')
    return out


def run_all(jobs):
    with ThreadPoolExecutor(max_workers=4) as ex:
        return list(ex.map(lambda j: export(*j), jobs))


def topics():
    for b in COURSE['blocks']:
        for t in b['topics']:
            pages = [p for p in t['pages'] if p.get('file')]
            if pages:
                yield b, t, pages


def safe(name):
    """Имя файла, которое примут Windows и NotebookLM: двоеточие → тире, без служебных символов."""
    name = re.sub(r'\s*:\s*', ' — ', name)
    return re.sub(r'[\\/*?"<>|]', '', name).strip().rstrip('.')


def demote(md, by=2):
    """Понижает заголовки вложенного README на `by` уровней, не трогая блоки кода."""
    out, fence = [], False
    for line in md.splitlines():
        if line.startswith('```'):
            fence = not fence
        if not fence and re.match(r'#{1,6} ', line):
            line = '#' * by + line
        out.append(line)
    return '\n'.join(out)


def materials():
    jobs = []
    for _, _, pages in topics():
        for p in pages:
            d = DIST / 'materials' / p['file']
            if not d.is_dir():
                raise SystemExit(f'{p["id"]}: нет dist/materials/{p["file"]}/ — сначала tools/build_materials.py')
            jobs.append((DIST / 'standalone' / f'{p["file"]}.html', d / f'{p["file"]}.md'))
    run_all(jobs)
    print(f'Markdown страниц в материалах: {len(jobs)}. Дальше: python3 tools/build_materials.py --index')


def notebooklm():
    out = DIST / 'notebooklm'
    if out.exists():
        shutil.rmtree(out)
    idx = json.loads((DIST / 'materials' / 'index.json').read_text(encoding='utf-8'))
    jobs, lines = [], []
    for b, t, pages in topics():
        key = f'{b["key"]}-{t["n"]}'
        d = out / safe(f'{t["n"]} {t["name"]}')
        d.mkdir(parents=True)
        for p in pages:
            jobs.append((DIST / 'standalone' / f'{p["file"]}.html', d / f'{safe(p["num"] + " " + p["title"])}.md', '--notebook'))
        # данные и материалы темы: README материалов каждой страницы и README общих наборов
        parts = [f'# Данные и материалы темы {t["n"]} «{t["name"]}»', '',
                 f'Аналитика 101 · блок «{b["name"]}», тема {t["n"]}. Здесь собрано, что читатель скачивает со страниц темы: '
                 'файлы, учебные данные и как их запускать. Тексты страниц — в отдельных источниках блокнота.']
        shared = []
        for p in pages:
            readme = DIST / 'materials' / p['file'] / 'README.md'
            if readme.exists():
                body = readme.read_text(encoding='utf-8').split('\n', 1)[1].strip()
                body = re.sub(r'^Аналитика 101 · [^\n]*\n+', '', body)     # строка-подпись README, здесь она лишняя
                parts += ['', f'## Материалы страницы {p["num"]}: {p["title"]}', '', demote(body)]
            shared += [s for s in idx['pages'].get(p['id'], {}).get('shared', []) if s not in shared]
        for s in shared:
            readme = DIST / 'materials' / 'data' / s / 'README.md'
            body = readme.read_text(encoding='utf-8')
            title, rest = body.split('\n', 1)
            parts += ['', f'## Общий набор данных data/{s}: {title.lstrip("# ").strip()}', '', demote(rest.strip())]
        (d / f'{t["n"]} Данные и материалы темы.md').write_text('\n'.join(parts) + '\n', encoding='utf-8')
        nb = NOTEBOOKS.get(key, {})
        lines.append((d.name, nb.get('title', ''), len(pages) + 1, shared))
    run_all(jobs)
    total = 0
    for name, title, n, shared in lines:
        size = sum(f.stat().st_size for f in (out / name).iterdir())
        total += size
        print(f'{name:40} {title:50} файлов {n}, {size / 1024:.0f} КБ{", данные: " + ", ".join(shared) if shared else ""}')
    print(f'dist/notebooklm/: тем {len(lines)}, файлов {len(jobs) + len(lines)}, {total / 1048576:.1f} МБ')


if __name__ == '__main__':
    mode = sys.argv[1:2]
    if mode == ['materials']:
        materials()
    elif mode == ['notebooklm']:
        notebooklm()
    else:
        raise SystemExit(__doc__)
