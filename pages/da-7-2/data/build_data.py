"""Данные сцены и интерактива и два статичных рисунка страницы 7.2 «Распределения и выбросы».

Запуск из любой папки:  python3 pages/da-7-2/data/build_data.py
Читает учебную выгрузку data/eda/clients_export.csv (только чтение), считает всё pandas, NumPy и SciPy
и вписывает результат:
  • в page.js между метками /*data:start*/ и /*data:end*/ — суммы spend_q1 в сжатом виде и числа сцены;
  • в article.html между метками <!--fig:dens:start--> … <!--fig:dens:end--> (KDE и ECDF)
    и <!--fig:hall:start--> … <!--fig:hall:end--> (то, что рисует df.hist(bins=30)).
Повторный запуск даёт те же файлы. Случайности нет.

Сжатие сумм: все суммы кратны 10 ₽. Отсортированные суммы в десятках рублей записаны разностями:
разность 0–34 — одна цифра base36, больше — «z» + base36 + «.». Две группы: клиенты с 1–2 заказами (o12)
и остальные (rest), без пяти ошибок ×1000 (суммы больше 1 млн ₽). Ошибки — отдельным списком err.
Сверка JavaScript с numpy.histogram — data/check_js.py.
"""
import json
import re
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
CSV = PAGE.parents[1] / "data" / "eda" / "clients_export.csv"

df = pd.read_csv(CSV)
s = df["spend_q1"]
err = s > 1_000_000
d = df[~err]
o12 = d["orders_q1"].between(1, 2)
X = d["spend_q1"].to_numpy()


# ---------- сжатие ----------
def enc(vals):
    t = np.sort(np.round(np.asarray(vals) / 10).astype(np.int64))
    assert np.array_equal(t * 10, np.sort(vals)), "суммы не кратны 10 ₽"
    out, prev = [], 0
    for v in t:
        dl = int(v - prev)
        prev = v
        out.append(np.base_repr(dl, 36).lower() if dl < 35 else "z" + np.base_repr(dl, 36).lower() + ".")
    return "".join(out)


def r(v, k=1):
    return float(np.round(float(v), k))


# ---------- числа сцены ----------
q1, q3 = s.quantile([0.25, 0.75])
hi = q3 + 1.5 * (q3 - q1)
desc = s.describe()
rob = {}
for name, x in (("raw", s), ("clean", s[~err])):
    rob[name] = {"mean": r(x.mean()), "median": r(x.median()), "trim": r(stats.trim_mean(x, 0.1)),
                 "mad": r(stats.median_abs_deviation(x)), "std": r(x.std())}
S = {
    "n": int(len(s)), "nClean": int(len(d)), "nO12": int(o12.sum()), "nPos": int((X > 0).sum()),
    "desc": {k: r(desc[k]) for k in ["count", "mean", "std", "min", "25%", "50%", "75%", "max"]},
    "box": {"q1": r(q1), "med": r(s.median()), "q3": r(q3), "lo": r(s[s >= q1 - 1.5 * (q3 - q1)].min()),
            "hi": r(s[s <= hi].max()), "out": int((s > hi).sum()), "outClean": int((X > hi).sum())},
    "zeros": int((s == 0).sum()), "at5000": int((s == 5000).sum()), "rob": rob,
    "gap": [r(X.max(), 0), r(s[err].min(), 0)],
}
DATA = {"enc": {"o12": enc(d.loc[o12, "spend_q1"]), "rest": enc(d.loc[~o12, "spend_q1"])},
        "err": [int(v) for v in np.sort(s[err].to_numpy())], "S": S}

# ---------- рисунок 1: KDE и ECDF по тем же 12 035 суммам ----------
NB = " "


def num(v, dec=0):
    t = f"{abs(v):,.{dec}f}".replace(",", NB).replace(".", ",")
    return ("−" if v < 0 and float(v) != 0 else "") + t


kde = stats.gaussian_kde(X)                       # окно по правилу Скотта, как по умолчанию в SciPy
bw = float(np.sqrt(kde.covariance[0, 0]))
below0 = float(kde.integrate_box_1d(-np.inf, 0))
xs = np.sort(X)
F = lambda v: np.searchsorted(xs, v, side="right") / len(xs)  # noqa: E731
S["kde"] = {"bw": r(bw, 0), "below0": r(below0 * 100, 1), "peak": None}

W, H, L, R, T, B = 340, 214, 12, 12, 40, 30
XMIN, XMAX = -10_000, 60_000
fx = lambda v: L + (v - XMIN) / (XMAX - XMIN) * (W - L - R)  # noqa: E731
grid = np.arange(XMIN, XMAX + 1, 250)
dens = kde(grid)
S["kde"]["peak"] = int(grid[dens.argmax()])
YMAX = dens.max() * 1.18
fy = lambda v: T + (1 - v / YMAX) * (H - T - B)  # noqa: E731
base = fy(0)
pts = " ".join(f"{fx(g):.1f},{fy(v):.1f}" for g, v in zip(grid, dens))
neg = [(g, v) for g, v in zip(grid, dens) if g <= 0]
negpath = f"M{fx(neg[0][0]):.1f},{base:.1f} " + " ".join(f"L{fx(g):.1f},{fy(v):.1f}" for g, v in neg) + f" L{fx(0):.1f},{base:.1f}Z"
ticks = "".join(f'<line class="d72-fg" x1="{fx(t):.1f}" x2="{fx(t):.1f}" y1="{T - 4}" y2="{base:.1f}"/>'
                f'<text class="d72-fa" x="{fx(t):.1f}" y="{base + 15:.1f}" text-anchor="{"end" if t == 60000 else "middle"}">{num(t / 1000)}{" тыс." if t == 60000 else ""}</text>'
                for t in range(0, 60001, 20000))
k5 = float(kde(5000)[0])
svg_kde = (f'<svg class="d72-fsvg" viewBox="0 0 {W} {H}" role="img" aria-label="Ядерная оценка плотности трат: гладкая кривая с вершиной около {num(S["kde"]["peak"])} рублей, '
           f'пика на 5 000 рублей нет, а {num(below0 * 100, 1)} процента площади лежит левее нуля">'
           f'<text class="d72-ft" x="{L}" y="15">KDE, окно ≈ {num(bw)} ₽</text>'
           f'<text class="d72-fs" x="{L}" y="30">плотность по 12{NB}035 суммам</text>{ticks}'
           f'<line class="d72-fb" x1="{L}" x2="{W - R}" y1="{base:.1f}" y2="{base:.1f}"/>'
           f'<path class="d72-fneg" d="{negpath}"/><polyline class="d72-fk" points="{pts}"/>'
           f'<line class="d72-fm" x1="{fx(5000):.1f}" x2="{fx(5000):.1f}" y1="{fy(k5) - 26:.1f}" y2="{base:.1f}"/>'
           f'<text class="d72-fl" x="{fx(5000) + 5:.1f}" y="{fy(k5) - 18:.1f}">5{NB}000 ₽: пика нет</text>'
           f'<line class="d72-fm d72-fbadl" x1="{fx(-1500):.1f}" y1="{base - 4:.1f}" x2="{fx(15000) - 3:.1f}" y2="{T + 52:.1f}"/>'
           f'<text class="d72-fl d72-fbad" x="{fx(15000):.1f}" y="{T + 50:.1f}">{num(below0 * 100, 1)}% площади</text>'
           f'<text class="d72-fl d72-fbad" x="{fx(15000):.1f}" y="{T + 63:.1f}">слева от нуля</text></svg>')

# Ступенчатая ECDF меняется только в наблюдаемых точках.
egrid = np.unique(np.r_[X[X <= XMAX], XMAX])
Fv = F(egrid)
gx = lambda v: L + v / XMAX * (W - L - R)  # noqa: E731
gy = lambda v: T + (1 - v) * (H - T - B)  # noqa: E731
path = f"M{gx(0):.1f},{gy(0):.1f}" + "".join(f"H{gx(g):.1f}V{gy(v):.1f}" for g, v in zip(egrid, Fv))
F0, F49, F50 = float(F(0)), float(F(4990)), float(F(5000))
S["ecdf"] = {"f0": r(F0 * 100, 1), "jump": r((F50 - F49) * 100, 1), "f4990": r(F49 * 100, 1), "f5000": r(F50 * 100, 1),
             "fHi": r(F(S["box"]["hi"]) * 100, 1)}
eticks = "".join(f'<line class="d72-fg" x1="{gx(t):.1f}" x2="{gx(t):.1f}" y1="{T - 4}" y2="{gy(0):.1f}"/>'
                 f'<text class="d72-fa" x="{gx(t):.1f}" y="{gy(0) + 15:.1f}" text-anchor="{"end" if t == 60000 else "middle"}">{num(t / 1000)}{" тыс." if t == 60000 else ""}</text>'
                 for t in range(0, 60001, 20000))
eticks += "".join(f'<line class="d72-fg" x1="{L}" x2="{W - R}" y1="{gy(v):.1f}" y2="{gy(v):.1f}"/>' for v in (0.5, 1.0))
svg_ecdf = (f'<svg class="d72-fsvg" viewBox="0 0 {W} {H}" role="img" aria-label="Эмпирическая функция распределения трат: доля нулевых сумм {num(F0 * 100, 1)}%, '
            f'на 5 000 рублей накопленная доля увеличивается на {num((F50 - F49) * 100, 1)} процентного пункта, медиана 5 020 рублей">'
            f'<text class="d72-ft" x="{L}" y="15">ECDF</text>'
            f'<text class="d72-fs" x="{L}" y="30">доля сумм не выше x</text>{eticks}'
            f'<text class="d72-fa" x="{W - R}" y="{gy(0.5) - 4:.1f}" text-anchor="end">50%</text>'
            f'<text class="d72-fa" x="{W - R}" y="{gy(1.0) + 12:.1f}" text-anchor="end">100%</text>'
            f'<line class="d72-fb" x1="{L}" x2="{W - R}" y1="{gy(0):.1f}" y2="{gy(0):.1f}"/>'
            f'<path class="d72-fe" d="{path}"/>'
            f'<circle class="d72-fdot" cx="{gx(0):.1f}" cy="{gy(F0):.1f}" r="3"/>'
            f'<text class="d72-fl" x="{gx(0) + 7:.1f}" y="{gy(F0) + 4:.1f}">нули: {num(F0 * 100, 1)}%</text>'
            f'<circle class="d72-fdot" cx="{gx(5000):.1f}" cy="{gy(F50):.1f}" r="3"/>'
            f'<text class="d72-fl" x="{gx(5000) + 7:.1f}" y="{gy(F50) + 4:.1f}">5{NB}000 ₽: +{num((F50 - F49) * 100, 1)} п. п.</text></svg>')

fig_dens = (f'<figure class="d72-fig wide"><div class="d72-fgrid"><div>{svg_kde}</div><div>{svg_ecdf}</div></div>'
            f'<figcaption><b>У сглаженной модели {num(below0 * 100, 1)}% площади лежит левее нуля. В самой выгрузке отрицательных трат нет.</b> '
            f'На графике ECDF видны скачки на нуле и на 5{NB}000{NB}₽. Оба графика построены по 12{NB}035 строкам без пяти миллионных сумм. KDE — <code>scipy.stats.gaussian_kde</code>, окно по правилу Скотта.</figcaption></figure>')

# ---------- рисунок 2: что рисует num.hist(bins=30) ----------
num_cols = df.select_dtypes("number").drop(columns="client_id")
NOTE = {"age": "99 — код пропуска", "tier": "пять уровней лояльности", "visits_q1": "чаще всего 8 визитов",
        "orders_q1": "−1 — код пропуска", "spend_q1": "12 035 строк в первом интервале"}
panels = []
PW, PH, PT, PB, PL, PR = 220, 120, 34, 20, 8, 8
S["hall"] = {}
for col in num_cols.columns:
    c, e = np.histogram(num_cols[col].dropna(), bins=30)
    S["hall"][col] = {"max": int(c.max()), "empty": int((c == 0).sum())}
    bw_ = (PW - PL - PR) / 30
    ys = lambda v: PT + (1 - v / c.max()) * (PH - PT - PB)  # noqa: E731
    bars = "".join(f"M{PL + i * bw_:.1f},{PH - PB}V{ys(v):.1f}h{bw_ - 0.6:.1f}V{PH - PB}Z" for i, v in enumerate(c) if v > 0)
    lo, hi_ = e[0], e[-1]
    lab = lambda v: num(v) if abs(v) < 1e6 else f"{num(v / 1e6, 1)} млн"  # noqa: E731
    panels.append(f'<svg class="d72-hsvg" viewBox="0 0 {PW} {PH}" role="img" aria-label="Гистограмма {col}, 30 интервалов: {NOTE[col]}">'
                  f'<text class="d72-ft" x="{PL}" y="14">{col}</text><text class="d72-fs" x="{PL}" y="27">{NOTE[col]}</text>'
                  f'<path class="d72-hb" d="{bars}"/><line class="d72-fb" x1="{PL}" x2="{PW - PR}" y1="{PH - PB}" y2="{PH - PB}"/>'
                  f'<text class="d72-fa" x="{PL}" y="{PH - 7}">{lab(lo)}</text><text class="d72-fa" x="{PW - PR}" y="{PH - 7}" text-anchor="end">{lab(hi_)}</text></svg>')
fig_hall = (f'<figure class="d72-fig d72-hall wide"><div class="d72-hgrid">{"".join(panels)}</div>'
            f'<figcaption><b>В возрасте и числе заказов видны коды пропусков. Для трат почти все записи попали в один интервал.</b> '
            f'Для каждого столбца выбран свой диапазон из 30 интервалов. Частоты рассчитаны с помощью <code>numpy.histogram</code> и совпадают с графиками <code>num.hist</code>.</figcaption></figure>')


def put(text, tag, html):
    pat = re.compile(rf"<!--fig:{tag}:start-->.*?<!--fig:{tag}:end-->", re.S)
    assert pat.search(text), f"нет меток fig:{tag}"
    return pat.sub(lambda _: f"<!--fig:{tag}:start-->{html}<!--fig:{tag}:end-->", text)


art = PAGE / "article.html"
t = art.read_text(encoding="utf-8")
t = put(put(t, "dens", fig_dens), "hall", fig_hall)
art.write_text(t, encoding="utf-8")

js = PAGE / "page.js"
t = js.read_text(encoding="utf-8")
t = re.sub(r"/\*data:start\*/.*?/\*data:end\*/",
           lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/", t, flags=re.S)
js.write_text(t, encoding="utf-8")

print(json.dumps(S, ensure_ascii=False, indent=1))
print("сжатые суммы:", len(DATA["enc"]["o12"]), "+", len(DATA["enc"]["rest"]), "символов")
