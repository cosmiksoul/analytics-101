"""Сжатие SVG из Matplotlib для вставки в страницу: текст остаётся текстом (svg.fonttype='none'),
координаты фигур округляются до целых pt, прочие числа — до 0,1, служебные метаданные и лишние id убираются.
Результат — строка для <img src="data:image/svg+xml,…">: у каждого рисунка свои id и нет конфликтов на странице."""
import re
from collections import Counter

FONT = "DejaVu Sans, Arial, Helvetica, sans-serif"   # без кавычек: в data URI кавычки заняты


def _num(m):
    s = f"{round(float(m.group(0)), 1):.1f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def _drop_bare_groups(svg: str) -> str:
    """Убирает <g> без атрибутов вместе с парным </g>: Matplotlib оборачивает в них почти каждый элемент."""
    out, stack, last = [], [], 0
    for m in re.finditer(r"<g>|<g\s[^>]*>|</g>", svg):
        out.append(svg[last:m.start()]); last = m.end()
        tag = m.group(0)
        if tag == "</g>":
            if stack.pop():
                out.append(tag)
        else:
            keep = tag != "<g>"
            stack.append(keep)
            if keep:
                out.append(tag)
    out.append(svg[last:])
    return "".join(out)


def minify(svg: str) -> str:
    svg = re.sub(r"<\?xml.*?\?>|<!DOCTYPE.*?>|<metadata>.*?</metadata>|<!--.*?-->", "", svg, flags=re.S)
    used = set(re.findall(r"url\(#([\w-]+)\)", svg)) | set(re.findall(r'xlink:href="#([\w-]+)"', svg))
    svg = re.sub(r'\sid="([\w.-]+)"', lambda m: m.group(0) if m.group(1) in used else "", svg)
    # координаты фигур — до целых pt (на экране это меньше пикселя), остальные числа — до 0,1
    svg = re.sub(r'\s(d|x|y|transform|points)="([^"]*)"',
                 lambda m: f' {m.group(1)}="' + re.sub(r"-?\d+\.\d+", lambda n: str(round(float(n.group(0)))), m.group(2)) + '"', svg)
    svg = re.sub(r"-?\d+\.\d+", _num, svg)
    svg = re.sub(r"\s*\n\s*", " ", svg)
    svg = re.sub(r">\s+<", "><", svg)
    svg = _drop_bare_groups(svg)
    svg = re.sub(r"font-family:[^;\"]*;?\s*", "", svg)
    order = list(dict.fromkeys(m.group(1) for m in re.finditer(r'id="([\w.-]+)"', svg) if m.group(1) in used))
    ids = {old: f"i{k}" for k, old in enumerate(order)}   # по порядку появления: id Matplotlib случайны, а файл должен повторяться
    svg = re.sub(r'(id="|url\(#|xlink:href="#)([\w-]+)', lambda m: m.group(1) + ids.get(m.group(2), m.group(2)), svg)
    svg = svg.replace('xlink:href="#', 'href="#').replace(' xmlns:xlink="http://www.w3.org/1999/xlink"', "").replace(' version="1.1"', "")
    svg = svg.replace("*{stroke-linejoin: round; stroke-linecap: butt}",
                      "*{stroke-linejoin:round;stroke-linecap:butt}text{font-family:" + FONT + "}")
    svg = re.sub(r'\stransform="rotate\(-?0 [\d.\-]+ [\d.\-]+\)"', "", svg)
    # повторяющиеся style="…" → классы в одном <style>
    styles = Counter(re.findall(r'style="([^"]*)"', svg))
    names, rules = {}, []
    for i, (st, n) in enumerate(st_n for st_n in styles.most_common() if st_n[1] >= 2):
        names[st] = f"s{i}"
        rules.append(f".s{i}{{{st.replace(': ', ':').replace('; ', ';')}}}")
    svg = re.sub(r'style="([^"]*)"', lambda m: f'class="{names[m.group(1)]}"' if m.group(1) in names else m.group(0), svg)
    svg = svg.replace("}</style>", "}" + "".join(rules) + "</style>", 1)
    # <use> наследует оформление от образца в <defs>: одинаковый класс на каждом <use> лишний
    uses = {}
    for h, c in re.findall(r'<use href="#(i\d+)"[^>]*?class="(s\d+)"', svg):
        uses.setdefault(h, set()).add(c)
    for h, cs in uses.items():   # образец без класса, а все его <use> одного класса → класс переезжает на образец
        if len(cs) == 1 and re.search(rf'<path id="{h}"(?![^>]*class=)[^>]*?/>', svg):
            svg = re.sub(rf'<path id="{h}"([^>]*?)/>', lambda m: f'<path id="{h}"{m.group(1)} class="{next(iter(cs))}"/>', svg, count=1)
    own = dict(re.findall(r'<path id="(i\d+)"[^>]*class="(s\d+)"', svg))
    svg = re.sub(r'(<use href="#(i\d+)"[^>]*?) class="(s\d+)"', lambda m: m.group(1) if own.get(m.group(2)) == m.group(3) else m.group(0), svg)
    return svg.strip()


def data_uri(svg: str) -> str:
    s = minify(svg)
    assert "'" not in s, "в SVG остались одинарные кавычки"
    s = s.replace('"', "'")
    # кодируем только % и # (# обрезал бы URI); < > и кириллица в атрибуте в кавычках допустимы, страница в UTF-8
    return "data:image/svg+xml," + s.replace("%", "%25").replace("#", "%23")
