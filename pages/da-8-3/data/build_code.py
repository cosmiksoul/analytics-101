"""Запускает блоки кода страницы 8.3 и вписывает код с настоящим выводом в page.js и рисунок в article.html.

Запуск из папки страницы:  python3 data/build_code.py
Блоки выполняются как ячейки двух ноутбуков, каждый в своей временной папке с копией общих учебных данных
data/viz/sales_monthly.csv: «нюансы» (weight → title → a11y) и «код» (express → hover → anim → export).
Ячейки одного ноутбука делят пространство имён, как в Jupyter. Вывод попадает в PAGE.code между метками
/*code:start*/ и /*code:end*/, размеры файлов экспорта — между /*sizes:start*/ и /*sizes:end*/,
SVG из kaleido — в article.html между <!--fig:export:start--> и <!--fig:export:end--> как <img> с data URI.
После запуска проверяет настоящий plotly.js в Chromium (data/check_browser.js): текст подсказки из hovertemplate
и поведение свайпа на эмуляции телефона со стандартным dragmode и с dragmode=False.
Окружение: Python 3.13, pandas 3.0.5, NumPy 2.5.3, plotly 7.1.0, kaleido 1.5.0 (нужен Chrome), Node + Playwright.
"""
import base64, contextlib, io, json, os, re, shutil, subprocess, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
VIZ = PAGE.parents[1] / "data" / "viz"
PX = "проверено: Python 3.13, pandas 3.0.5, plotly 7.1.0"
NOTEBOOKS = {
    "nuances": ["weight", "title", "a11y"],
    "code": ["express", "hover", "anim", "export"],
}
META = {
    "weight": ("Миллион точек — 26 МБ данных даже без библиотеки", "проверено: Python 3.13, NumPy 2.5.3, plotly 7.1.0",
               "С <code>include_plotlyjs=True</code> к каждой строке прибавьте ещё {full_mb} МБ библиотеки. Числа хранятся "
               "в JSON как двоичные массивы в base64, поэтому байтов на точку почти не зависит от того, какие это числа."),
    "title": ("Из 120 чисел подсказок на картинку не попало ни одного", PX + ", kaleido 1.5.0",
              "Надписи ищутся в SVG из kaleido: всё, что plotly.js нарисовал текстом, лежит там в тегах &lt;text&gt;."),
    "a11y": ("Легенда под графиком, свайп без рамки и текст вместо наведения", PX,
             "{touch}"),
    "express": ("Пять каналов — пять трасс, а подсказку px собрал из подписей", PX, None),
    "hover": ("Подсказка говорит по-русски: месяц словами, запятая и доля месяца", PX,
              "{hover}"),
    "anim": ("24 кадра, кнопки ▶ и ◼ и ползунок по месяцам", PX,
             "<code>&amp;#9654;</code> и <code>&amp;#9724;</code> — коды символов ▶ и ◼ в HTML. {anim}"),
    "export": ("Файл с библиотекой весит {full_mb} МБ, сама фигура — {json_kb} КБ", PX + ", kaleido 1.5.0",
               "Рисунок ниже — <code>channels.svg</code> из этого блока, вставлен в страницу без правок."),
}


def run_notebook(keys):
    out = {}
    with tempfile.TemporaryDirectory() as tmp:
        os.symlink(PAGE.parents[1] / "data", Path(tmp) / "data")     # путь в коде: data/viz/sales_monthly.csv
        cwd = os.getcwd(); os.chdir(tmp)
        ns = {"__name__": "__main__"}
        try:
            for k in keys:
                src = (HERE / "code" / f"{k}.py").read_text(encoding="utf-8")
                buf = io.StringIO()
                with contextlib.redirect_stdout(buf):
                    exec(compile(src, f"{k}.py", "exec"), ns)
                out[k] = (src.rstrip(), buf.getvalue().rstrip())
                print(f"== {k}\n{buf.getvalue()}")
            extra = {}
            if "export" in keys:
                extra["svg"] = Path("channels.svg").read_bytes()
                extra["sizes"] = {f: os.path.getsize(f) for f in ["channels.html", "channels_cdn.html", "channels.json", "channels.png", "channels.svg"]}
                shutil.copy("channels.html", PAGE / "data" / "_hover_check.html")
                ns["px"].bar(ns["by_ch"], x="channel", y="mln", color="channel", animation_frame="month",
                             category_orders={"channel": ns["top5"]}).write_html(PAGE / "data" / "_anim_check.html")
            if "a11y" in keys:
                fig = ns["fig"]
                for name, dm in [("zoom", "zoom"), ("off", False)]:
                    fig.update_layout(dragmode=dm, height=480)
                    body = fig.to_html(include_plotlyjs=True, full_html=False, config={"displayModeBar": False})
                    (PAGE / "data" / f"_touch_{name}.html").write_text(
                        "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width'></head>"
                        f"<body><div style='height:300px'></div>{body}<div style='height:2000px'></div></body></html>", encoding="utf-8")
        finally:
            os.chdir(cwd)
    return out, extra


code, sizes, svg = {}, {}, b""
for nb, keys in NOTEBOOKS.items():
    res, extra = run_notebook(keys)
    for k, (src, out) in res.items():
        code[k] = {"src": src, "out": out}
    sizes.update(extra.get("sizes", {}))
    svg = extra.get("svg", svg)

# проверка в браузере настоящим plotly.js
chk = json.loads(subprocess.run(["node", str(HERE / "check_browser.js"), str(HERE)], capture_output=True, text=True, check=True).stdout)
for f in ["_hover_check.html", "_touch_zoom.html", "_touch_off.html", "_anim_check.html"]:
    (HERE / f).unlink()
print("браузер:", chk)
fmt = {
    "full_mb": f"{sizes['channels.html'] / 1024 / 1024:.1f}".replace(".", ","),
    "json_kb": f"{sizes['channels.json'] / 1024:.0f}",
    "hover": "Проверено в Chromium настоящим plotly.js из <code>channels.html</code>: подсказка у приложения в июле 2025 — "
             f"«{chk['hover'][0]}» и строкой ниже «{chk['hover'][1]}». "
             "У маркетплейса за июль 2025 в подсказке 5,71, а в таблице pandas из нюанса про телефон — 5,72: выручка 5 715 000 ₽ стоит ровно посередине, "
             "и JavaScript с pandas округляют её в разные стороны.",
    "anim": "Без <code>range_y</code> диапазон оси в фигуре не записан, и plotly.js подбирает его сам: при проигрывании кнопкой ▶ "
            f"в Chromium верх оси сдвинулся с {chk['anim'][0]} до {chk['anim'][1]} млн ₽, и одна высота столбика в разных кадрах значила бы разные деньги.",
    "touch": "Проверено в Chromium на эмуляции Pixel 5: со стандартным <code>dragmode</code> вертикальный свайп по графику "
             f"приблизил {chk['zoom']['range']} и не прокрутил страницу, "
             f"с <code>dragmode=False</code> страница прокрутилась{'' if chk['off']['scroll'] > 100 else ' (не прокрутилась!)'}, а оси остались прежними.",
}
CODE = {}
for k, (title, badge, note) in META.items():
    CODE[k] = {"title": title.format(**fmt), "badge": badge, "lang": "python", "code": code[k]["src"], "out": code[k]["out"]}
    if note:
        CODE[k]["note"] = note.format(**fmt)
SIZES = {"full_mb": round(sizes["channels.html"] / 1024 / 1024, 1), "cdn_kb": round(sizes["channels_cdn.html"] / 1024, 1),
         "json_kb": round(sizes["channels.json"] / 1024, 1), "png_kb": round(sizes["channels.png"] / 1024),
         "svg_kb": round(sizes["channels.svg"] / 1024, 1), "hover": chk["hover"], "anim": chk["anim"]}

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/const CODE = " + json.dumps(CODE, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
s = re.sub(r"/\*sizes:start\*/.*?/\*sizes:end\*/", lambda _: "/*sizes:start*/const SIZES = " + json.dumps(SIZES, ensure_ascii=False) + ";/*sizes:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")

art = PAGE / "article.html"
a = art.read_text(encoding="utf-8")
m = re.search(rb'id="defs-([0-9a-f]+)"', svg)   # plotly.js даёт SVG случайный id: заменяем на постоянный, чтобы сборка повторялась
if m:
    svg = svg.replace(m.group(1), b"d83")
for i, uid in enumerate(dict.fromkeys(re.findall(rb"trace([0-9a-f]{6})", svg))):   # и случайные классы трасс
    svg = svg.replace(b"trace" + uid, b"trace" + b"d83t%d" % i)
uri = "data:image/svg+xml;base64," + base64.b64encode(svg).decode()
fig_html = ('<!--fig:export:start--><figure class="d83-fig wide"><img src="' + uri + '" width="900" height="480" '
            'alt="Линейный график Plotly: выручка пяти каналов по месяцам 2024–2025, линия приложения после июня 2025 '
            'поднимается с 3 до 6 млн ₽ и обгоняет маркетплейс; заголовок «Приложение удвоило выручку после релиза в июне 2025»">'
            '<figcaption><b>Вывод кода выше: статичный экспорт через kaleido.</b> Тот же график, что в интерактивной версии, '
            'но подсказки, легенда и рамка здесь больше не работают. SVG, ' + f'{SIZES["svg_kb"]:.1f}'.replace(".", ",") + '&nbsp;КБ.'
            '</figcaption></figure><!--fig:export:end-->')
a = re.sub(r"<!--fig:export:start-->.*?<!--fig:export:end-->", lambda _: fig_html, a, flags=re.S)
art.write_text(a, encoding="utf-8")
print("page.js и article.html обновлены; размеры:", SIZES)
