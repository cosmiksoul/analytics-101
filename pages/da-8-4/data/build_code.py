"""Запускает блоки кода страницы 8.4 подряд, как ячейки одного ноутбука, и вписывает результат в страницу.

Запуск из любой папки:  python3 pages/da-8-4/data/build_code.py
- блоки data/code/0N_*.py выполняются по порядку в одном пространстве имён (второй блок пользуется
  функцией из первого — как в ноутбуке); временная рабочая папка — data/run/, туда кладётся ссылка data
  на данные учебника (путь в коде — data/viz/sales_monthly.csv) и копия стиля textbook.mplstyle, после сборки она удаляется;
- вывод print каждого блока попадает в PAGE.code между /*code:start*/ и /*code:end*/ в page.js;
- картинки, которые блоки сохраняют в SVG, ужимаются (метаданные, лишние id, округление до 0,1)
  и вставляются в article.html между <!--fig:имя:start--> и <!--fig:имя:end-->.
"""
import contextlib, io, json, os, re, shutil
from pathlib import Path

import matplotlib
matplotlib.use("svg")
matplotlib.rcParams["svg.hashsalt"] = "da-8-4"  # одинаковые id при каждом запуске

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
ROOT = PAGE.parent.parent
RUN = HERE / "run"
BASE = "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0"
BLOCKS = [
    # ключ, файл, заголовок, бейдж, svg, подпись к рисунку
    ("highlight", "01_highlight.py", "Как выделить выручку приложения", BASE,
     "highlight.svg", "Синим выделена месячная выручка приложения, серым — остальных девяти каналов"),
    ("labels", "02_labels.py", "Как разместить подписи у правых концов линий", BASE,
     "labels.svg", "Названия у правого края показывают, какому каналу принадлежит каждая линия"),
    ("annotate", "03_annotate.py", "Как проверить заголовок и отметить месяц обновления", BASE,
     "annotated.svg", "С мая по июль 2025 года выручка приложения выросла с 2,98 до 5,91 млн ₽"),
    ("style_file", "textbook.mplstyle", "Файл стиля textbook.mplstyle: всё оформление в одном месте", "проверено: matplotlib 3.10.0, подключается в блоке ниже",
     None, None),
    ("style", "04_style.py", "Стиль подключается одной строкой и действует на все графики", BASE,
     "styled.svg", "Параметры оформления графика загружены из textbook.mplstyle"),
    ("palette", "05_palette.py", "В модели дейтеранопии четыре пары оттенков tab10 близки по цвету", BASE + ", NumPy 2.5.3",
     None, None),
]

NOTES = {  # откуда блок берёт имена, определённые выше (блоки идут как ячейки одного ноутбука)
    "labels": "Выполните первый блок, чтобы определить highlight, wide, ACCENT, plt и pd.",
    "annotate": "Функции highlight и label_ends и таблица wide определены в предыдущих блоках.",
    "style": "Продолжение: highlight, label_ends, wide и release — из блоков выше; файл textbook.mplstyle должен лежать в рабочей папке.",
    "palette": "Продолжение: plt, GREY и ACCENT — из первого блока, палитра стиля — из подключённого textbook.mplstyle.",
}


def minify_svg(svg: str, key: str, label: str) -> str:
    svg = re.sub(r"<\?xml.*?\?>|<!DOCTYPE.*?>|<metadata>.*?</metadata>|<!--.*?-->", "", svg, flags=re.S)
    # обрезка по осям не нужна: данные лежат внутри осей
    svg = re.sub(r"<clipPath.*?</clipPath>", "", svg, flags=re.S)
    svg = re.sub(r'\s*clip-path="url\(#[^)]*\)"', "", svg)
    used = set(re.findall(r'(?:href="#|url\(#)([^")]+)', svg))
    svg = re.sub(r'\s+id="([^"]+)"', lambda m: f' id="{key}-{m.group(1)}"' if m.group(1) in used else "", svg)
    svg = re.sub(r'(href="#|url\(#)([^")]+)', lambda m: f"{m.group(1)}{key}-{m.group(2)}", svg)
    def path_d(m):  # координаты линий — до целых: на экране это доли пикселя
        d = re.sub(r"-?\d+(?:\.\d+)?", lambda n: str(round(float(n.group()))), m.group(1))
        return 'd="' + re.sub(r"\s*([MLZz])\s*", r"\1", d).strip() + '"'
    svg = re.sub(r'(?<=\s)d="([^"]*)"', path_d, svg)
    svg = re.sub(r"-?\d+\.\d+", lambda m: f"{float(m.group()):.1f}".rstrip("0").rstrip("."), svg)
    svg = re.sub(r";\s*stroke-linecap: square|stroke-linecap: square;?\s*", "", svg)
    svg = re.sub(r"font-family: [^;\"]*;?\s*", "", svg)
    svg = re.sub(r'\s*transform="rotate\(-?0 [^)]*\)"', "", svg)
    svg = re.sub(r"\s*\n\s*", " ", svg)
    svg = re.sub(r">\s+<", "><", svg)
    for _ in range(3):
        svg = re.sub(r"<g>(<path [^>]*/>|<use [^>]*/>|<text [^>]*>[^<]*</text>)</g>", r"\1", svg)
    svg = re.sub(r"<g></g>|<defs></defs>", "", svg)
    svg = re.sub(r'<svg [^>]*viewBox="([^"]+)"[^>]*>',
                 lambda m: f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="{m.group(1)}" role="img" aria-label="{label}">',
                 svg, count=1)
    return svg.strip()


def run_blocks():
    if RUN.exists():
        shutil.rmtree(RUN)
    RUN.mkdir()
    os.symlink(ROOT / "data", RUN / "data")
    shutil.copy(HERE / "code" / "textbook.mplstyle", RUN / "textbook.mplstyle")
    cwd = os.getcwd()
    os.chdir(RUN)
    ns, outs = {}, {}
    try:
        for key, fname, *_ in BLOCKS:
            if fname.endswith(".mplstyle"):
                continue
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                exec(compile((HERE / "code" / fname).read_text(encoding="utf-8"), fname, "exec"), ns)
            outs[key] = buf.getvalue().rstrip()
    finally:
        os.chdir(cwd)
    return outs


def main():
    outs = run_blocks()
    code, figs = {}, {}
    for key, fname, title, badge, svg, cap in BLOCKS:
        src = (HERE / "code" / fname).read_text(encoding="utf-8").rstrip()
        entry = {"title": title, "badge": badge, "lang": "text" if fname.endswith(".mplstyle") else "python", "code": src}
        if key in outs and outs[key]:
            entry["out"] = outs[key]
        if key in NOTES:
            entry["note"] = NOTES[key]
        code[key] = entry
        print(f"== {key}\n{outs.get(key, '')}")
        if svg:
            raw = (RUN / svg).read_text(encoding="utf-8")
            figs[key] = (minify_svg(raw, key, cap), cap)
            print(f"   {svg}: {len(raw) / 1024:.1f} КБ → {len(figs[key][0]) / 1024:.1f} КБ")
    code["highlight"]["note"] = "Блоки этого раздела идут подряд, как ячейки одного ноутбука: каждый следующий пользуется тем, что определено выше. Данные — общий набор data/viz/."

    js = PAGE / "page.js"
    s = js.read_text(encoding="utf-8")
    s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/",
               lambda _: "/*code:start*/" + json.dumps(code, ensure_ascii=False) + "/*code:end*/", s, flags=re.S)
    js.write_text(s, encoding="utf-8")

    art = PAGE / "article.html"
    a = art.read_text(encoding="utf-8")
    for key, (svg, cap) in figs.items():
        html = f'<figure class="ca-fig wide"><div class="ca-svg">{svg}</div><figcaption>{cap}</figcaption></figure>'
        a, n = re.subn(rf"<!--fig:{key}:start-->.*?<!--fig:{key}:end-->",
                       lambda _: f"<!--fig:{key}:start-->{html}<!--fig:{key}:end-->", a, flags=re.S)
        if not n:
            print(f"   метка fig:{key} в article.html не найдена")
    art.write_text(a, encoding="utf-8")
    shutil.rmtree(RUN)  # рабочая папка больше не нужна: всё уже вписано в страницу
    print("page.js и article.html обновлены")


if __name__ == "__main__":
    main()
