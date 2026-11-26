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
    "weight": ("HTML с миллионом точек занимает около 26 МБ без библиотеки", "проверено: Python 3.13, NumPy 2.5.3, plotly 7.1.0",
               "При <code>include_plotlyjs=True</code> в каждый файл добавится около {full_mb} МБ. В этом примере "
               "у точки две числовые координаты. Дополнительные подписи и столбцы увеличат размер файла."),
    "title": ("На графике по умолчанию не подписано ни одно из 120 значений выручки", PX + ", kaleido 1.5.0",
              "Код ищет округлённые значения выручки в текстовых элементах SVG, а затем проверяет заголовок и подпись к июньской точке."),
    "a11y": ("Выручку по месяцам можно прочитать в таблице под графиком", PX,
             "{touch}"),
    "express": ("Каждому из пяти каналов соответствует отдельная линия", PX, None),
    "hover": ("В подсказке видны выручка канала и его доля в продажах магазина", PX,
              "{hover}"),
    "anim": ("В анимации можно выбрать любой из 24 месяцев", PX,
             "<code>&amp;#9654;</code> и <code>&amp;#9724;</code> — коды символов ▶ и ◼ в HTML. {anim}"),
    "export": ("HTML с библиотекой занимает {full_mb} МБ, а описание графика в JSON — около {json_kb} КБ", PX + ", kaleido 1.5.0",
               "Ниже показан график из файла <code>channels.svg</code>, который создаёт этот пример."),
}


def run_notebook(keys, checks):
    out = {}
    with tempfile.TemporaryDirectory() as tmp:
        target = Path(tmp) / "data" / "viz"
        target.mkdir(parents=True)
        shutil.copy(VIZ / "sales_monthly.csv", target)
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
                shutil.copy("channels.html", checks / "_hover_check.html")
                ns["px"].bar(ns["by_ch"], x="channel", y="mln", color="channel", animation_frame="month",
                             category_orders={"channel": ns["top5"]}).write_html(checks / "_anim_check.html")
            if "a11y" in keys:
                fig = ns["fig"]
                for name, dm in [("zoom", "zoom"), ("off", False)]:
                    fig.update_layout(dragmode=dm, height=480)
                    body = fig.to_html(include_plotlyjs=True, full_html=False, config={"displayModeBar": False})
                    (checks / f"_touch_{name}.html").write_text(
                        "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width'></head>"
                        f"<body><div style='height:300px'></div>{body}<div style='height:2000px'></div></body></html>", encoding="utf-8")
        finally:
            os.chdir(cwd)
    return out, extra


code, sizes, svg = {}, {}, b""
with tempfile.TemporaryDirectory() as work:
    for keys in NOTEBOOKS.values():
        res, extra = run_notebook(keys, Path(work))
        for k, (src, out) in res.items():
            code[k] = {"src": src, "out": out}
        sizes.update(extra.get("sizes", {}))
        svg = extra.get("svg", svg)
    chk = json.loads(subprocess.check_output(["node", str(HERE / "check_browser.js"), work], encoding="utf-8"))
print("браузер:", chk)
fmt = {
    "full_mb": f"{sizes['channels.html'] / 1024 / 1024:.1f}".replace(".", ","),
    "json_kb": f"{sizes['channels.json'] / 1024:.0f}",
    "hover": "В Chromium подсказка для приложения за июль 2025 года содержит две строки — "
             f"«{chk['hover'][0]}» и строкой ниже «{chk['hover'][1]}». "
             "Выручка маркетплейса за тот же месяц составила 5 715 000 ₽. При округлении до сотых миллиона "
             "в подсказке Plotly получилось 5,71, а в таблице pandas — 5,72.",
    "anim": "В проверке без <code>range_y</code> верхняя граница шкалы за время показа изменилась "
            f"с {chk['anim'][0]} до {chk['anim'][1]} млн ₽. В основном примере шкала фиксирована.",
    "touch": "В Chromium в режиме эмуляции Pixel 5 вертикальный жест по графику менял масштаб. "
             "После отключения перетаскивания тот же жест прокручивал страницу. В файле <code>mobile.html</code> "
             "есть описание графика и таблица за все 24 месяца. Их можно прочитать, даже если библиотека не загрузилась.",
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
            'alt="Выручка пяти каналов в 2024–2025 годах. С мая по июль 2025 года выручка приложения выросла '
            'с 2,98 до 5,91 млн ₽ и в июле впервые превысила выручку маркетплейса.">'
            '<figcaption>С мая по июль 2025 года выручка приложения почти удвоилась. Заголовок сохраняется и в '
            'статическом файле SVG размером ' + f'{SIZES["svg_kb"]:.1f}'.replace(".", ",") + '&nbsp;КБ.'
            '</figcaption></figure><!--fig:export:end-->')
a = re.sub(r"<!--fig:export:start-->.*?<!--fig:export:end-->", lambda _: fig_html, a, flags=re.S)
art.write_text(a, encoding="utf-8")
print("page.js и article.html обновлены; размеры:", SIZES)
