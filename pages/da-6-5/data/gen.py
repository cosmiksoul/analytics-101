"""Учебные данные и данные сцены для страницы 6.5 «Корреляция и причинность».

Запуск из любой папки:  python3 pages/da-6-5/data/gen.py
Повторный запуск даёт тот же результат: все случайные числа — NumPy с фиксированными seed.

1. Заказы со скидкой — 120 учебных заказов (seed 6505), пример парадокса Симпсона. Их делает
   data/inference/gen_discounts.py (он же пишет data/inference/discounts.csv); здесь они только
   пересчитываются для интерактива.
2. Данные сцены, вписываются в page.js между метками /*data:start*/ и /*data:end*/:
   - circ: 30 точек (seed 6501), x и e центрированы, ортогональны и стандартизованы (ddof = 1),
     поэтому у облака y = r·x + √(1 − r²)·e корреляция ровно r; circR — NumPy-корреляция
     для r = 0,00 … 1,00 с шагом 0,01 на тех самых округлённых точках, что рисует сцена;
   - anscombe: квартет Энскомба (Anscombe, 1973), значения из статьи, и его статистики;
   - conf: 30 учебных клиентов (seed 6510): стаж, заходы в приложение, траты — стаж влияет
     на оба показателя, прямой связи между ними нет;
   - simpson: точки и статистики discounts.csv для интерактива;
   - heat: матрица корреляций Пирсона учебных клиентов data/clients/clients.csv.
"""
import json, re, sys
from pathlib import Path
import numpy as np, pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
CLIENTS = PAGE.parents[1] / "data" / "clients" / "clients.csv"
r_ = lambda a, b: float(np.corrcoef(a, b)[0, 1])
sp_ = lambda a, b: float(pd.Series(a).corr(pd.Series(b), method="spearman"))
R4 = lambda v: round(float(v), 4)

# ---------- 1. парадокс Симпсона: скидка и чек по категориям ----------
sys.dont_write_bytecode = True
sys.path.insert(0, str(PAGE.parents[1] / "data" / "inference"))
from gen_discounts import CATS, discounts

df = discounts()

simpson = {
    "cats": list(CATS),
    "pts": [[list(CATS).index(c), int(d), int(k)] for c, d, k in df[["category", "discount", "check"]].itertuples(index=False)],
    "r": R4(r_(df.discount, df.check)),
    "fit": [R4(v) for v in np.polyfit(df.discount, df.check, 1)],
    "within": [R4(r_(g.discount, g.check)) for _, g in df.groupby("category", sort=False)],
    "fits": [[R4(v) for v in np.polyfit(g.discount, g.check, 1)] for _, g in df.groupby("category", sort=False)],
    "ranges": [[int(g.discount.min()), int(g.discount.max())] for _, g in df.groupby("category", sort=False)],
}

# ---------- 2a. сцена: облако из круга в линию ----------
rng = np.random.default_rng(6501)
x, e = rng.normal(size=30), rng.normal(size=30)
x = x - x.mean(); x /= x.std(ddof=1)
e = e - e.mean(); e -= (e @ x) / (x @ x) * x; e /= e.std(ddof=1)
x, e = np.round(x, 4), np.round(e, 4)
grid = np.round(np.arange(0, 101) / 100, 2)
circR = [R4(r_(x, rr * x + np.sqrt(1 - rr * rr) * e)) if rr < 1 else R4(r_(x, x)) for rr in grid]
SX, SY = 2.0, 1.5                      # стандартные отклонения в шагах 3–4: ковариация = r · 2 · 1,5
y06 = 0.6 * x + 0.8 * e
cov06 = float(np.cov(SX * x, SY * y06)[0, 1])
cov06k = float(np.cov(1000 * SX * x, SY * y06)[0, 1])
ys = [rr * x + np.sqrt(max(0.0, 1 - rr * rr)) * e for rr in grid]
circCov = [R4(np.cov(SX * x, SY * v)[0, 1]) for v in ys]           # ковариация в единицах сцены
circSp = [R4(sp_(x, v)) for v in ys]                                # Спирмен на тех же точках
circ = {"x": x.tolist(), "e": e.tolist(), "circR": circR, "circCov": circCov, "circSp": circSp, "sx": SX, "sy": SY,
        "cov": R4(cov06), "covK": round(cov06k, 1), "r06": R4(r_(SX * x, SY * y06)), "r06k": R4(r_(1000 * SX * x, SY * y06)),
        "sp06": R4(sp_(x, y06)),
        "pos": int(((x > 0) & (y06 > 0)).sum() + ((x < 0) & (y06 < 0)).sum())}

# ---------- 2b. квартет Энскомба ----------
AX = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
ANS = {
    "I": (AX, [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]),
    "II": (AX, [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]),
    "III": (AX, [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]),
    "IV": ([8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]),
}
anscombe = []
for k, (a, b) in ANS.items():
    a, b = np.array(a, float), np.array(b, float)
    w = np.polyfit(a, b, 1)
    anscombe.append({"k": k, "x": a.tolist(), "y": b.tolist(), "r": R4(r_(a, b)), "sp": R4(sp_(a, b)),
                     "mx": R4(a.mean()), "vx": R4(a.var(ddof=1)), "my": R4(b.mean()), "vy": R4(b.var(ddof=1)),
                     "w": [R4(w[0]), R4(w[1])], "cov": R4(np.cov(a, b)[0, 1])})

# ---------- 2c. сцена: третья переменная ----------
rng = np.random.default_rng(6510)
z = np.round(rng.uniform(0.3, 6, 30), 1)                                  # стаж, лет
s = np.clip(np.round(4 + 3.2 * z + rng.normal(0, 2.6, 30)), 1, None)       # заходов в приложение за месяц
y = np.round(2.5 + 1.3 * z + rng.normal(0, 1.3, 30), 1)                    # траты за месяц, тыс. ₽
res = lambda v: v - np.polyval(np.polyfit(z, v, 1), z)
grp = np.digitize(z, [2, 4])                                              # до 2 лет, 2–4 года, от 4 лет
conf = {"z": z.tolist(), "s": s.tolist(), "y": y.tolist(), "g": grp.tolist(),
        "r": R4(r_(s, y)), "partial": R4(r_(res(s), res(y))),
        "within": [R4(r_(s[grp == g], y[grp == g])) for g in range(3)], "ng": np.bincount(grp).tolist(),
        "rz": [R4(r_(z, s)), R4(r_(z, y))], "sp": R4(sp_(s, y)), "cov": R4(np.cov(s, y)[0, 1]),
        "fit": [R4(v) for v in np.polyfit(s, y, 1)],
        "fits": [[R4(v) for v in np.polyfit(s[grp == g], y[grp == g], 1)] for g in range(3)],
        "sr": [[float(s[grp == g].min()), float(s[grp == g].max())] for g in range(3)]}

# ---------- 2d. тепловая карта: учебные клиенты ----------
cl = pd.read_csv(CLIENTS).drop(columns="client_id")
heat = {"cols": list(cl.columns), "m": [[round(float(v), 2) for v in row] for row in cl.corr().to_numpy()]}

DATA = {"circ": circ, "anscombe": anscombe, "conf": conf, "simpson": simpson, "heat": heat}

# ---------- сводка для текста ----------
print("discounts.csv:", len(df), "заказов; общая r =", simpson["r"], "; внутри:", dict(zip(simpson["cats"], simpson["within"])))
print("  наклоны внутри, ₽ на п. п.:", [f[0] for f in simpson["fits"]], "; общий:", simpson["fit"][0])
print(df.groupby("category", sort=False)[["discount", "check"]].mean().round(1).to_string())
print("circ: max |circR - r| =", max(abs(a - b) for a, b in zip(circR, grid)), "; cov(r=0.6) =", circ["cov"], "; ×1000 →", circ["covK"],
      "; r =", circ["r06"], circ["r06k"], "; Спирмен", circ["sp06"], "; точек в I и III четвертях:", circ["pos"])
for a in anscombe:
    print(f"Энскомб {a['k']:>3}: x̄={a['mx']} s²x={a['vx']} ȳ={a['my']} s²y={a['vy']} r={a['r']} Спирмен={a['sp']} y={a['w'][1]}+{a['w'][0]}x")
print("circ Спирмен при r = 0; 0,5; 1:", circSp[0], circSp[50], circSp[100], "; ковариация:", circCov[0], circCov[50], circCov[100])
print("Энскомб, ковариации:", [a["cov"] for a in anscombe])
print("conf: Спирмен", conf["sp"], "ковариация", conf["cov"], "линии в группах", conf["fits"])
print("conf: r =", conf["r"], "; частная при равном стаже =", conf["partial"], "; внутри групп", conf["within"], conf["ng"], "; r со стажем", conf["rz"])
print("heat:", heat)

js = PAGE / "page.js"
if js.exists():
    src = js.read_text(encoding="utf-8")
    new = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/", src, flags=re.S)
    js.write_text(new, encoding="utf-8")
    print("page.js обновлён")
