"""Быстрая проверка русского текста страницы по редакционной норме учебника.
python3 tools/lint_ru.py <файл.md> [...]   — принимает Markdown из tools/export_md.js
Ищет: пробел перед %, слова без ё, дефис вместо тире, канцелярит и шаблоны из стоп-листа, прямые кавычки в прозе.
Блоки кода (``` … ```) пропускает."""
import re, sys
YO = r"\b(еще|идет|дает|берет|ведет|несет|зовет|найдет|придет|пойдет|уйдет|начнет|вернет|вернется|живет|ждет|растет|упадет|учет\w*|счет\w*|расчет\w*|отчет\w*|объем\w*|причем|прием\w*|подъем\w*|вперед|своем|моем|твоем|четк\w*|желт\w*|зелен(ый|ая|ое|ые|ого|ой|ым|ых)|темн\w*|черн\w*|шел|пришел|нашел|ушел|привел|перевел|трех|четырех|актер\w*|партнер\w*|надежн\w*|серьезн\w*|подсчет\w*|пересчет\w*|все-таки|все равно)\b"
STOP = [r"осуществля", r"\bявля[ею]тся\b", r"\bв рамках\b", r"\bданн(ый|ая|ое|ого|ому|ой|ом|ую)\b", r"на сегодняшний день", r"\bв целях\b", r"в связи с тем", r"не просто", r"давайте", r"важно отметить", r"стоит (отметить|подчеркнуть)", r"в мире, где"]
for path in sys.argv[1:]:
    txt = open(path, encoding='utf-8').read()
    out = []; code = False
    for i, line in enumerate(txt.split('\n'), 1):
        if line.startswith('```'): code = not code; continue
        if code: continue
        prose = re.sub(r"`[^`]*`", '', line)
        for m in re.finditer(r"\d[  ]%", prose): out.append((i, 'пробел перед %', prose[max(0, m.start()-25):m.end()+10]))
        for m in re.finditer(YO, prose, re.I):
            out.append((i, 'ё?', prose[max(0, m.start()-25):m.end()+15]))
        for m in re.finditer(r"\s-\s", prose): out.append((i, 'дефис вместо тире', prose[max(0, m.start()-25):m.end()+15]))
        for p in STOP:
            for m in re.finditer(p, prose, re.I): out.append((i, 'стоп-лист', prose[max(0, m.start()-30):m.end()+25]))
        for m in re.finditer(r'(?<![=\w(\[{:,] )"[А-Яа-яЁё][^"]{0,40}"', prose): out.append((i, 'прямые кавычки?', m.group(0)))
    print(f'== {path.split("/")[-1]}: {len(out)}')
    for i, k, s in out: print(f'  {i:>4} {k}: …{s.strip()}…')
