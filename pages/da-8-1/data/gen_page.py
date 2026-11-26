"""Данные страницы 8.1: график-анатомия для сцены и интерактива, вывод и рисунки всех блоков кода.

Запуск из любой папки:  python3 pages/da-8-1/data/gen_page.py
Источники — общие учебные данные (не меняем): data/viz/sales_monthly.csv и data/eda/daily_metrics.csv.

1. Анатомия. code/anatomy_oo.py и code/anatomy_pyplot.py выполняются как есть; их PNG сравниваются попиксельно.
   Затем объектный код выполняется ещё раз в этом процессе: художникам фигуры даются gid (они становятся id групп
   в SVG), считается число объектов-художников по слоям, SVG сохраняется с svg.fonttype='none'.
   Результат — в page.js между /*data:start*/ и /*data:end*/.
2. Блоки кода code/*.py выполняются через run_block.py во временной папке рядом с копиями данных; блоки, кроме
   pub, начинаются с prelude.py — той же подготовки данных, что в «Анатомии». Вывод вставляется как есть
   (в fonts.py свёрнуты одинаковые строки и убраны пути), рисунок — SVG той же фигуры, что сохранил блок.
   Код и вывод — в page.js между /*code:start*/ и /*code:end*/, рисунки — в article.html между <!--svg:KEY--> и <!--/svg:KEY-->.
Повторный запуск даёт те же файлы.
"""
import io
import json
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.image as mpimg  # noqa: E402
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.figure import Figure  # noqa: E402

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
ROOT = PAGE.parents[1]
CODE = HERE / "code"
RUN = HERE / "run_block.py"


# ---------------------------------------------------------------- чистка SVG от Matplotlib
def num(m):
    v = round(float(m.group(0)), 1)
    return str(int(v)) if v == int(v) else str(v)


def clean_svg(svg, prefix, mine=("mp-",), label=""):
    s = re.sub(r"<\?xml.*?\?>|<!DOCTYPE.*?>|<metadata>.*?</metadata>", "", svg, flags=re.S)
    s = re.sub(r'<style type="text/css">.*?</style>', "", s, flags=re.S)
    defs = "".join(re.findall(r"<defs>(.*?)</defs>", s, flags=re.S))
    s = re.sub(r"<defs>.*?</defs>", "", s, flags=re.S)
    s = re.sub(r"(<svg[^>]*>)", lambda m: m.group(1) + f"<defs>{defs}</defs>", s, count=1)
    refs = list(dict.fromkeys(re.findall(r'href="#([^"]+)"|url\(#([^)]+)\)', s)))
    short = {r: f"{prefix}{n}" for n, r in enumerate(dict.fromkeys(a or b for a, b in refs))}
    def fix_id(m):
        i = m.group(1)
        if i in short:
            return f' id="{short[i]}"'
        if i.startswith(mine):
            return f' id="{prefix}{i[3:]}"'
        return ""
    s = re.sub(r' id="([^"]+)"', fix_id, s)
    s = re.sub(r'xlink:href="#([^"]+)"', lambda m: f'href="#{short[m.group(1)]}"', s)
    s = re.sub(r"url\(#([^)]+)\)", lambda m: f"url(#{short[m.group(1)]})", s)
    s = re.sub(r' transform="rotate\(-0 [^)]*\)"', "", s)
    s = re.sub(r"font-family:[^;\"]*;?\s*", "", s)
    s = re.sub(r"<[^>]+>", lambda t: re.sub(r"-?\d+\.\d{2,}", num, t.group(0)), s)   # числа только в разметке, не в тексте
    s = re.sub(r">\s+<", "><", s)
    s = re.sub(r"\s*\n\s*", " ", s)
    s = s.replace("; \"", "\"").replace('style=""', "").replace(" \"", "\"")
    s = re.sub(r"<g>(<use[^>]*/>)</g>", r"\1", s)
    s = re.sub(r'<svg [^>]*viewBox="([^"]+)"[^>]*>',
               lambda m: f'<svg class="mpa-svg" viewBox="{m.group(1)}" role="img" aria-label="{label}">', s, count=1)
    return compact(s.strip())


def style_of(el):
    return dict(p.split(": ", 1) for p in el.get("style", "").split("; ") if ": " in p)


def compact(s):
    """Сжатие без изменения картинки: пустые <g> раскрываются, стиль <use> уходит в их общий образец,
    самый частый размер и выравнивание текста задаются один раз на корне, координаты округляются."""
    root = ET.fromstring(s)
    def unwrap(el):
        out = []
        for ch in list(el):
            unwrap(ch)
            if ch.tag == "g" and not ch.attrib:
                out.extend(list(ch))
            else:
                out.append(ch)
        el[:] = out
    unwrap(root)
    defs = {d.get("id"): d for d in root.iter() if d.get("id")}
    uses = {}
    for u in root.iter("use"):
        uses.setdefault(u.get("href")[1:], []).append(u)
    for ref, us in uses.items():
        styles = {u.get("style", "") for u in us}
        if len(styles) == 1 and ref in defs:
            ds, us0 = style_of(defs[ref]), style_of(us[0])
            ds.update({k: v for k, v in us0.items() if k not in ds})
            defs[ref].set("style", "; ".join(f"{k}: {v}" for k, v in ds.items()))
            for u in us:
                u.attrib.pop("style", None)
    texts = list(root.iter("text"))
    if texts:
        common = Counter((style_of(t).get("font-size"), style_of(t).get("text-anchor")) for t in texts).most_common(1)[0][0]
        root.set("font-size", common[0])
        root.set("text-anchor", common[1])
        for t in texts:
            st = style_of(t)
            # У строк многострочного заголовка Matplotlib задаёт координаты левого края.
            if "text-anchor" not in st and common[1] != "start":
                t.set("text-anchor", "start")
            if (st.get("font-size"), st.get("text-anchor")) == common:
                st.pop("font-size"); st.pop("text-anchor")
                if st:
                    t.set("style", "; ".join(f"{k}: {v}" for k, v in st.items()))
                else:
                    t.attrib.pop("style")
    s = ET.tostring(root, encoding="unicode")
    rnd = lambda m: str(round(float(m.group(0)))) if abs(float(m.group(0))) >= 10 else m.group(0)
    s = re.sub(r"<[^>]+>", lambda t: re.sub(r"-?\d+\.\d+", rnd, t.group(0)), s)
    return s.replace(" />", "/>")


# ---------------------------------------------------------------- 1. анатомия
tmp = Path(tempfile.mkdtemp())
for relative in ("viz/sales_monthly.csv", "eda/daily_metrics.csv"):
    target = tmp / "data" / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / "data" / relative, target)


def run(block, prelude=False, merge=False):
    out = tmp / f"svg_{block}"
    if out.exists():
        shutil.rmtree(out)
    out.mkdir()
    cmd = [sys.executable, "-u", str(RUN), str(CODE / f"{block}.py"), str(out)] + ([str(CODE / "prelude.py")] if prelude else [])
    r = subprocess.run(cmd, cwd=tmp, stdout=subprocess.PIPE, stderr=subprocess.STDOUT if merge else subprocess.PIPE, text=True)
    if r.returncode:
        sys.exit(f"{block}: ошибка\n{r.stdout}\n{r.stderr}")
    if not merge and r.stderr.strip():
        sys.exit(f"{block}: неожиданный stderr\n{r.stderr}")
    return r.stdout.rstrip(), sorted(out.glob("*.svg"))


run("anatomy_oo")
run("anatomy_pyplot")
a, b = mpimg.imread(tmp / "anatomy.png"), mpimg.imread(tmp / "anatomy_pyplot.png")
same = bool(a.shape == b.shape and np.array_equal(a, b))
diff = int((np.abs(a - b).sum(axis=2) > 0).sum()) if a.shape == b.shape else -1
print(f"анатомия: объектный и pyplot дают одинаковые PNG: {same}, {a.shape[1]}×{a.shape[0]} px, различных пикселей {diff}")

oo_src = (CODE / "anatomy_oo.py").read_text(encoding="utf-8").rstrip()
py_src = (CODE / "anatomy_pyplot.py").read_text(encoding="utf-8").rstrip()

# тот же объектный код ещё раз, в этом процессе: savefig перехватываем, чтобы достать фигуру
_saved = Figure.savefig
Figure.savefig = lambda self, *a, **k: None
ns = {"__name__": "__main__"}
cwd = Path.cwd()
import os  # noqa: E402
os.chdir(tmp)
exec(compile(oo_src, "anatomy_oo.py", "exec"), ns)
os.chdir(cwd)
Figure.savefig = _saved
fig, ax = ns["fig"], ns["ax"]

# объекты-художники по слоям; считаем, что все объекты фигуры разложены без остатка
everything = fig.findobj()
legend = ax.get_legend()
texts = [ax.title, ax._left_title, ax._right_title, ax.xaxis.label, ax.yaxis.label]
L = {"fig": [fig, fig.patch], "lines": list(ax.lines), "texts": texts, "legend": legend.findobj()}
L["axes_core"] = [ax, ax.patch] + list(ax.spines.values())
taken = {id(o) for k in L for o in L[k]}
L["axes_axis"] = [o for o in everything if id(o) not in taken]
assert sum(len(v) for v in L.values()) == len(everything), "слои не покрывают фигуру"
counts = {k: len(v) for k, v in L.items()}
xt, yt = ax.xaxis.get_major_ticks(), ax.yaxis.get_major_ticks()
print("объектов на фигуре:", len(everything), counts, "делений X/Y:", len(xt), len(yt))

# gid → id группы в SVG
fig.patch.set_gid("mp-fig")
ax.patch.set_gid("mp-axes")
for side, sp in ax.spines.items():
    sp.set_gid(f"mp-sp-{side}")
ax.xaxis.set_gid("mp-xaxis")
ax.yaxis.set_gid("mp-yaxis")
for i, tk in enumerate(ax.yaxis.get_major_ticks()):
    tk.gridline.set_gid(f"mp-grid-{i}")
ax.lines[0].set_gid("mp-l2024")
ax.lines[1].set_gid("mp-l2025")
ax.title.set_gid("mp-title")
ax.yaxis.label.set_gid("mp-ylabel")
legend.set_gid("mp-legend")
buf = io.StringIO()
with matplotlib.rc_context({"svg.fonttype": "none", "svg.hashsalt": "da-8-1"}):
    fig.savefig(buf, format="svg", metadata={"Date": None})
ana_svg = clean_svg(buf.getvalue(), "ANA-", label="Месячная выручка в 2024 и 2025 годах. В каждом месяце выручка за 2025 год выше.")
for gid in ["fig", "axes", "xaxis", "yaxis", "l2024", "l2025", "title", "ylabel", "legend", "grid-0", "sp-left"]:
    assert f'id="ANA-{gid}"' in ana_svg, gid

# строки кода, которые создают (make) и настраивают (tune) каждый элемент
oo_lines, py_lines = oo_src.split("\n"), py_src.split("\n")
def ln(lines, needle, nth=0):
    hits = [i for i, l in enumerate(lines) if needle in l]
    assert len(hits) > nth, needle
    return hits[nth]
EL = {  # ключ: (класс, [make oo], [tune oo], [make py], [tune py])
    "fig": ("Figure", ["plt.subplots("], [], ["plt.figure("], []),
    "axes": ("Axes", ["plt.subplots("], [], [("plt.plot(", 0)], []),
    "spines": ("Spine ×4", ["plt.subplots("], [], [("plt.plot(", 0)], []),
    "xaxis": ("XAxis", ["plt.subplots("], ["set_xticks("], [("plt.plot(", 0)], ["plt.xticks("]),
    "yaxis": ("YAxis", ["plt.subplots("], ["set_ylim("], [("plt.plot(", 0)], ["plt.ylim("]),
    "grid": ("Line2D (сетка)", ["ax.grid("], [], ["plt.grid("], []),
    "l2024": ("Line2D", ['label="2024"'], [], ['label="2024"'], []),
    "l2025": ("Line2D", ['label="2025"'], [], ['label="2025"'], []),
    "title": ("Text", ["set_title("], [], ["plt.title("], []),
    "ylabel": ("Text", ["set_ylabel("], [], ["plt.ylabel("], []),
    "legend": ("Legend", ["ax.legend("], ['label="2024"', 'label="2025"'], ["plt.legend("], ['label="2024"', 'label="2025"']),
}
def idx(lines, items):
    return [ln(lines, *(it if isinstance(it, tuple) else (it,))) for it in items]
els = {k: {"cls": v[0], "oo": [idx(oo_lines, v[1]), idx(oo_lines, v[2])], "py": [idx(py_lines, v[3]), idx(py_lines, v[4])]}
       for k, v in EL.items()}
save = {"oo": ln(oo_lines, "fig.savefig("), "py": ln(py_lines, "plt.savefig(")}
first = ln(oo_lines, "plt.subplots(")
assert first == ln(py_lines, "plt.figure(")

DATA = {
    "svg": ana_svg, "same": same, "diff": diff, "px": [a.shape[1], a.shape[0]],
    "oo": oo_src, "py": py_src, "els": els, "save": save, "first": first,
    "objects": len(everything), "counts": counts, "xticks": len(xt), "yticks": len(yt),
    "pngKB": round((tmp / "anatomy.png").stat().st_size / 1024),
}

# ---------------------------------------------------------------- 2. блоки кода
B = "проверено: Python 3.13, matplotlib 3.10.0"
BLOCKS = {
    # ключ: (заголовок, бейдж, prelude, номер SVG для рисунка или None, подпись вывода)
    "pub": ("Как подготовить график выручки для публикации", B + ", pandas 3.0.5", False, 2, None),
    "grid": ("Как разместить четыре графика на одной фигуре", B, True, 1, None),
    "tmpl": ("Как построить десять графиков в одном стиле", B, True, 7, None),
    "sns": ("Как построить один и тот же график с помощью pandas и seaborn", "проверено: Python 3.13, matplotlib 3.10.0, seaborn 0.13.2", True, 1, None),
    "dpi": ("Как разрешение влияет на размер PNG", B, True, None, None),
    "fonts": ("Что происходит, если нет шрифта или нужного символа", B, True, None,
              "Вывод программы и предупреждения Matplotlib. Повторяющиеся сообщения показаны один раз."),
    "dates": ("Как показать пропущенные дни на оси времени", B + ", pandas 3.0.5", True, 1, None),
    "twice": ("Почему в файле за 2025 год оказались обе линии", B, True, 2, None),
}
CODE_OUT, FIGS = {}, {}
for key, (title, badge, prelude, svg_n, olabel) in BLOCKS.items():
    out, svgs = run(key, prelude=prelude, merge=(key == "fonts"))
    if key == "fonts":
        lines, res = out.split("\n"), []
        for l in lines:
            if l.strip() in ("fig.canvas.draw()", "fig, ax = plt.subplots()"):
                continue
            l = re.sub(r"^.*[\\/](fonts\.py:\d+:)", r"\1", l)
            if res and res[-1][0] == l:
                res[-1][1] += 1
            else:
                res.append([l, 1])
        out = "\n".join(l if n == 1 else f"{l}\n… та же строка ещё {n - 1} раз" for l, n in res)
    src = (CODE / f"{key}.py").read_text(encoding="utf-8").rstrip()
    CODE_OUT[key] = {"title": title, "badge": badge, "lang": "python", "code": src, "out": out}
    if olabel:
        CODE_OUT[key]["outLabel"] = olabel
    if svg_n:
        raw = svgs[svg_n - 1].read_text(encoding="utf-8")
        FIGS[key] = clean_svg(raw, f"{key}-", label=f"Вывод кода «{title}»")
    print(f"== {key}: SVG {len(svgs)}, рисунок {len(FIGS.get(key, '')) / 1024:.1f} КБ\n{out}\n")

# ---------------------------------------------------------------- запись
js = PAGE / "page.js"
t = js.read_text(encoding="utf-8")
t = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False) + ";/*data:end*/", t, flags=re.S)
t = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/const CODE = " + json.dumps(CODE_OUT, ensure_ascii=False, indent=1) + ";/*code:end*/", t, flags=re.S)
js.write_text(t, encoding="utf-8")
art = PAGE / "article.html"
h = art.read_text(encoding="utf-8")
for key, svg in FIGS.items():
    h, n = re.subn(rf"<!--svg:{key}-->.*?<!--/svg:{key}-->", lambda _: f"<!--svg:{key}-->{svg}<!--/svg:{key}-->", h, flags=re.S)
    assert n == 1, f"в article.html нет метки svg:{key}"
art.write_text(h, encoding="utf-8")
shutil.rmtree(tmp)
print(f"page.js и article.html обновлены; анатомия {len(ana_svg) / 1024:.1f} КБ, рисунки {sum(map(len, FIGS.values())) / 1024:.1f} КБ")
