"""Сверка JavaScript страницы 7.2 с NumPy: гистограммы, правила числа корзин, квартили, признаки формы.

Запуск из любой папки:  python3 pages/da-7-2/data/check_js.py
Берёт из page.js данные (/*data:start*/ … /*data:end*/) и функции (/*fn:start*/ … /*fn:end*/), запускает их в Node
и сравнивает с numpy.histogram, numpy.histogram_bin_edges (fd, sturges), numpy.quantile и тем же правилом
«что видно» (нули, пик на 5 000 ₽, второй горб), записанным на NumPy ниже. Учебные данные только читаются.
Печатает расхождения; в конце — «всё совпало» или число расхождений.
"""
import json
import re
import subprocess
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
src = (HERE.parent / "page.js").read_text(encoding="utf-8")
data_js = re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", src, re.S).group(1)
fn_js = re.search(r"/\*fn:start\*/(.*?)/\*fn:end\*/", src, re.S).group(1)

df = pd.read_csv(HERE.parents[2] / "data" / "eda" / "clients_export.csv")
s = df["spend_q1"]
err = s > 1_000_000
d = df[~err]
SETS = {"all": d["spend_q1"].to_numpy(), "o12": d.loc[d["orders_q1"].between(1, 2), "spend_q1"].to_numpy()}
RAW = s.to_numpy()
KS = [3, 5, 8, 10, 15, 20, 30, 50, 80, 100, 122, 150, 166, 200]


def feats(c, e, log, zeros):
    """То же правило, что feats() в page.js."""
    k, w = len(c), e[1] - e[0]
    cen = lambda i: 10 ** ((e[i] + e[i + 1]) / 2) if log else (e[i] + e[i + 1]) / 2  # noqa: E731
    zero = None if not zeros else True if log else bool(w <= 1500 and c[0] >= 1.5 * c[1])
    t = np.log10(5000) if log else 5000.0
    b = int(np.searchsorted(e[:-1], t, side="right") - 1)
    peak = False
    if w <= (0.08 if log else 1500) and 0 < b < k - 1:
        nb = max(c[b - 1], c[b + 1])
        peak = bool(c[b] >= 1.3 * nb and c[b] - nb >= 3 * np.sqrt(c[b]))
    h = int((0.12 if log else 7000) / w / 2)
    n = 2 * h + 1
    sm = [c[max(0, i - h):min(k, i + h + 1)].sum() / n for i in range(k)]
    main = [i for i in range(k) if 1000 <= cen(i) <= 20000]
    m = max(main, key=lambda i: sm[i]) if main else 0
    hump = False
    for i in range(m + 1, k - 1):
        if hump or not (25000 <= cen(i) <= 70000):
            continue
        if sm[i] > sm[i - 1] and sm[i] >= sm[i + 1]:
            v = min(sm[m:i])
            if sm[i] >= 1.2 * v and (sm[i] - v) * np.sqrt(n) >= 3 * np.sqrt(sm[i]):
                hump = True
    return {"zero": zero, "peak": peak, "hump": hump}


node = f"""{data_js}
{fn_js}
const O12 = decode(DATA.enc.o12), REST = decode(DATA.enc.rest), ALL = merge(O12, REST), RAW = merge(ALL, DATA.err);
const SETS = {{ all: ALL, o12: O12 }}, out = {{ sets: {{}}, raw15: hist(RAW, 15).c, rawFD: binsFD(RAW), rawSt: binsSturges(RAW) }};
for (const [name, x] of Object.entries(SETS)) {{
  const lg = x.filter(v => v > 0).map(v => Math.log10(v)), zeros = x.length - lg.length, r = {{ n: x.length, sum: x.reduce((a, b) => a + b, 0) }};
  r.box = boxStats(x); r.fd = binsFD(x); r.st = binsSturges(x); r.fdLog = binsFD(lg); r.stLog = binsSturges(lg);
  r.h = {{}}; r.f = {{}};
  for (const k of {json.dumps(KS)}) {{ r.h['lin' + k] = hist(x, k).c; r.h['log' + k] = hist(lg, k).c; }}
  for (let k = 3; k <= 200; k++) for (const sc of ['lin', 'log']) {{ const h = hist(sc === 'log' ? lg : x, k), f = feats(h.c, h.e, sc === 'log', zeros > 0); r.f[sc + k] = [f.zero, f.peak, f.hump]; }}
  out.sets[name] = r;
}}
const lgAll = ALL.filter(v => v > 0).map(v => Math.log10(v)), lgO = O12.filter(v => v > 0).map(v => Math.log10(v));
const H = hist(lgAll, binsFD(lgAll)); out.logH = H.c; out.logO = histEdges(lgO, H.e).c;
console.log(JSON.stringify(out));
"""
res = json.loads(subprocess.run(["node", "-e", node], capture_output=True, text=True, check=True).stdout)

bad = 0


def check(label, a, b):
    global bad
    a, b = np.asarray(a), np.asarray(b)
    ok = a.shape == b.shape and np.allclose(a, b, rtol=0, atol=1e-9)
    if not ok:
        bad += 1
        print("РАСХОЖДЕНИЕ", label, a[:12], b[:12])
    return ok


check("сырые данные, 15 корзин", res["raw15"], np.histogram(RAW, bins=15)[0])
check("сырые данные, fd", res["rawFD"], len(np.histogram_bin_edges(RAW, "fd")) - 1)
check("сырые данные, sturges", res["rawSt"], len(np.histogram_bin_edges(RAW, "sturges")) - 1)
flags_lines = []
for name, x in SETS.items():
    r = res["sets"][name]
    check(f"{name}: n", r["n"], len(x))
    check(f"{name}: сумма", r["sum"], x.sum())
    lg = np.log10(x[x > 0])
    check(f"{name}: fd", r["fd"], len(np.histogram_bin_edges(x, "fd")) - 1)
    check(f"{name}: sturges", r["st"], len(np.histogram_bin_edges(x, "sturges")) - 1)
    check(f"{name}: fd log", r["fdLog"], len(np.histogram_bin_edges(lg, "fd")) - 1)
    check(f"{name}: sturges log", r["stLog"], len(np.histogram_bin_edges(lg, "sturges")) - 1)
    q1, med, q3 = np.quantile(x, [0.25, 0.5, 0.75])
    top, bot = q3 + 1.5 * (q3 - q1), q1 - 1.5 * (q3 - q1)
    check(f"{name}: квартили", [r["box"][k] for k in ("q1", "med", "q3")], [q1, med, q3])
    check(f"{name}: усы и точки", [r["box"]["lo"], r["box"]["hi"], r["box"]["out"]],
          [x[x >= bot].min(), x[x <= top].max(), ((x > top) | (x < bot)).sum()])
    for k in KS:
        check(f"{name}: lin {k}", r["h"][f"lin{k}"], np.histogram(x, bins=k)[0])
        check(f"{name}: log {k}", r["h"][f"log{k}"], np.histogram(lg, bins=k)[0])
    nf = 0
    first = {}
    for k in range(3, 201):
        for sc in ("lin", "log"):
            c, e = np.histogram(lg if sc == "log" else x, bins=k)
            f = feats(c, e, sc == "log", (x == 0).any())
            js = r["f"][f"{sc}{k}"]
            if [f["zero"], f["peak"], f["hump"]] != js:
                nf += 1
                bad += 1
                print("РАСХОЖДЕНИЕ признаков", name, sc, k, f, js)
            for key in ("zero", "peak", "hump"):
                if f[key] and (sc, key) not in first:
                    first[(sc, key)] = k
    flags_lines.append(f"{name}: признаки совпали в {2 * 198 - nf} из {2 * 198}; впервые видно: "
                       + ", ".join(f"{sc} {key} при {k}" for (sc, key), k in sorted(first.items())))
lgA = np.log10(SETS["all"][SETS["all"] > 0])
cA, eA = np.histogram(lgA, bins="fd")
check("сцена: логарифм, все клиенты", res["logH"], cA)
check("сцена: логарифм, 1–2 заказа", res["logO"], np.histogram(np.log10(SETS["o12"][SETS["o12"] > 0]), bins=eA)[0])
print("\n".join(flags_lines))
print(f"гистограмм сверено: {2 * 2 * len(KS) + 3}, корзин в логарифме сцены: {len(cA)}")
print("всё совпало" if not bad else f"расхождений: {bad}")
