"""Запускает блоки кода страницы 9.2 и вписывает их настоящий вывод в страницу.

Запуск из любой папки:  python3 pages/da-9-2/data/build_code.py
- 01_funnel.sql идёт в PostgreSQL 16 (база events уже загружена: data/events/load_pg.sql), вывод — как в psql;
- 02_segments.py и 03_chart.py выполняются подряд в одном пространстве имён, как ячейки одного ноутбука,
  во временной папке data/run/ со ссылками на events.parquet и users.csv; после сборки папка удаляется;
- вывод каждого блока попадает в PAGE.code между /*code:start*/ и /*code:end*/ в page.js;
- рисунок из 03_chart.py ужимается (метаданные, лишние id, округление) и вставляется в article.html
  между <!--fig:chart:start--> и <!--fig:chart:end-->.
"""
import contextlib, io, json, os, re, shutil, subprocess
from pathlib import Path

import matplotlib
matplotlib.use("svg")
matplotlib.rcParams["svg.hashsalt"] = "da-9-2"  # одинаковые id при каждом запуске

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
EVENTS = PAGE.parent.parent / "data" / "events"
RUN = HERE / "run"
PY = "проверено: Python 3.13, pandas 3.0.5"


def minify_svg(svg: str, label: str) -> str:
    svg = re.sub(r"<\?xml.*?\?>|<!DOCTYPE.*?>|<metadata>.*?</metadata>|<!--.*?-->|<style.*?</style>", "", svg, flags=re.S)
    svg = re.sub(r"<clipPath.*?</clipPath>", "", svg, flags=re.S)
    svg = re.sub(r'\s*clip-path="url\(#[^)]*\)"', "", svg)
    used = set(re.findall(r'(?:href="#|url\(#)([^")]+)', svg))
    svg = re.sub(r'\s+id="([^"]+)"', lambda m: f' id="fn-{m.group(1)}"' if m.group(1) in used else "", svg)
    svg = re.sub(r'(href="#|url\(#)([^")]+)', lambda m: f"{m.group(1)}fn-{m.group(2)}", svg)
    def path_d(m):
        d = re.sub(r"-?\d+(?:\.\d+)?", lambda n: str(round(float(n.group()))), m.group(1))
        return 'd="' + re.sub(r"\s*([MLZz])\s*", r"\1", d).strip() + '"'
    svg = re.sub(r'd="([^"]*)"', path_d, svg)
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


def run_sql():
    sql = (HERE / "code" / "01_funnel.sql").read_text(encoding="utf-8")
    r = subprocess.run(["psql", "-h", "/tmp", "-U", "postgres", "-d", "events", "-P", "pager=off", "-P", "null=NULL", "-f", "-"],
                       input=sql, capture_output=True, text=True, check=True)
    return r.stdout.rstrip()


def run_python():
    if RUN.exists():
        shutil.rmtree(RUN)
    RUN.mkdir()
    os.symlink(EVENTS.parent, RUN / "data")              # пути в коде: data/events/…
    cwd, ns, outs = os.getcwd(), {}, {}
    os.chdir(RUN)
    try:
        for key, fname in (("seg", "02_segments.py"), ("chart", "03_chart.py")):
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                exec(compile((HERE / "code" / fname).read_text(encoding="utf-8"), fname, "exec"), ns)
            outs[key] = buf.getvalue().rstrip()
        svg = (RUN / "funnel_bars.svg").read_text(encoding="utf-8")
    finally:
        os.chdir(cwd)
        shutil.rmtree(RUN)
    return outs, svg


def main():
    sql_out = run_sql()
    outs, svg = run_python()
    src = lambda f: (HERE / "code" / f).read_text(encoding="utf-8").rstrip()
    code = {
        "fun": {"title": "Воронка на SQL: окно 7 суток, порядок через MIN(event_time) по шагам", "badge": "проверено: PostgreSQL 16",
                "lang": "sql", "code": src("01_funnel.sql"), "out": sql_out, "outLabel": "Вывод psql",
                "note": "Запуск: <code>psql -h /tmp -U postgres -d events -P null=NULL -f funnel.sql</code>. Пустые значения psql печатал бы словом NULL, так настроен вывод; здесь их нет. "
                        "Столбцы any_order и strict совпадают с интерактивом в состояниях «человек · 7 суток»: 18,0% — ответ аналитика Б."},
        "seg": {"title": "Та же воронка по сегментам в pandas: в каждом канале приложение лучше, в сумме — хуже", "badge": PY,
                "lang": "python", "code": src("02_segments.py"), "out": outs["seg"], "outLabel": "Вывод: конверсия в оплату за 7 суток, %, и число людей",
                "note": "Журнал и аккаунты — общий набор data/events/. margins=True добавляет строку и столбец «всего»: в нём и прячется парадокс."},
        "chart": {"title": "График воронки без «воронки»: столбцы, доля перехода и один акцент", "badge": PY + ", Matplotlib 3.10.0",
                  "lang": "python", "code": src("03_chart.py"), "out": outs["chart"], "outLabel": "Вывод: проверка заголовка перед рисованием",
                  "note": "Продолжение блока выше: ev, first, old, funnel, STEPS и MSK — оттуда. Рисунок ниже — настоящий вывод этого кода, SVG с текстом вместо кривых."},
    }
    js = PAGE / "page.js"
    s = js.read_text(encoding="utf-8")
    s, n = re.subn(r"/\*code:start\*/.*?/\*code:end\*/",
                   lambda _: "/*code:start*/const CODE = " + json.dumps(code, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
    assert n == 1, "метка /*code:start*/ в page.js не найдена"
    js.write_text(s, encoding="utf-8")

    cap = "Вывод кода выше: новички мая, окно 7 суток, любой порядок"
    small = minify_svg(svg, "Столбцы воронки новичков мая: 1 610, 1 525, 654, 344 и 329 человек; из карточки в корзину переходит 43%")
    html = f'<figure class="fn-fig wide"><div class="fn-svg">{small}</div><figcaption>{cap}</figcaption></figure>'
    art = PAGE / "article.html"
    a = art.read_text(encoding="utf-8")
    a, n = re.subn(r"<!--fig:chart:start-->.*?<!--fig:chart:end-->", lambda _: f"<!--fig:chart:start-->{html}<!--fig:chart:end-->", a, flags=re.S)
    assert n == 1, "метка fig:chart в article.html не найдена"
    art.write_text(a, encoding="utf-8")
    print(sql_out, outs["seg"], outs["chart"], sep="\n\n")
    print(f"\nSVG: {len(svg) / 1024:.1f} КБ → {len(small) / 1024:.1f} КБ; page.js и article.html обновлены")


if __name__ == "__main__":
    main()
