"""Данные сцены и интерактива страницы 8.4 из общего учебного файла data/viz/sales_monthly.csv.

Запуск:  python3 pages/da-8-4/data/gen_page.py
Считает ряды и проверки заголовков, симулирует дейтеранопию (матрица Machado и др., 2009, на линейном RGB)
и вписывает всё в page.js между /*data:start*/ и /*data:end*/. Повторный запуск даёт тот же файл.
"""
import json, re
from itertools import combinations
from pathlib import Path

import numpy as np
import pandas as pd
from matplotlib import cm, colors as mc

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
CSV = PAGE.parent.parent / "data" / "viz" / "sales_monthly.csv"

# ---------- цвет: дейтеранопия и ΔE в CIELAB (те же формулы, что в блоке кода «палитра») ----------
M = np.array([[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]])
XYZ = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])


def to_lin(c):
    c = np.asarray(c, float)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * c ** (1 / 2.4) - 0.055)


def lab(hex_, deut=False):
    c = to_lin(mc.to_rgb(hex_))
    if deut:
        c = np.clip(M @ c, 0, 1)
    t = XYZ @ c / np.array([0.95047, 1.0, 1.08883])
    f = np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])


def deut_hex(hex_):
    return mc.to_hex(to_srgb(np.clip(M @ to_lin(mc.to_rgb(hex_)), 0, 1)))


def merged(pal, thr=10):
    return int(sum(np.linalg.norm(lab(a, True) - lab(b, True)) < thr for a, b in combinations(pal, 2)))


def mix(a, b, t):
    return mc.to_hex((1 - t) * np.array(mc.to_rgb(a)) + t * np.array(mc.to_rgb(b)))


r1, r2 = lambda v: round(float(v), 1), lambda v: round(float(v), 2)

df = pd.read_csv(CSV)
w = df.pivot_table(index="month", columns="channel", values="revenue", aggfunc="sum") / 1e6
months, ch = list(w.index), list(w.columns)  # каналы по алфавиту — так их отдаёт pivot
app, cc, site = w["приложение"], w["колл-центр"], w["сайт"]
TAB10 = [mc.to_hex(c) for c in cm.tab10.colors]

# ---------- проверка заголовка сцены ----------
x25, x24 = app["2025-07"] / app["2025-05"], app["2024-07"] / app["2024-05"]
others = (w.loc["2025-07"] / w.loc["2025-05"]).drop("приложение")
assert 1.9 <= x25 < 2, "проверьте формулировку «почти удвоилась»"
check = {"may25": r2(app["2025-05"]), "jun25": r2(app["2025-06"]), "jul25": r2(app["2025-07"]), "x25": r2(x25),
         "may24": r2(app["2024-05"]), "jul24": r2(app["2024-07"]), "x24": r2(x24),
         "oth": [r2(others.min()), r2(others.max())], "yoy": r2(app["2025-07"] / app["2024-07"])}

# ---------- пять учебных графиков ----------
y25 = df[df.month >= "2025-01"]
share = (y25.groupby("channel").revenue.sum() / y25.revenue.sum() * 100)
rev25 = y25.groupby("channel").revenue.sum() / 1e6
df["q"] = df.month.str[:4] + "Q" + ((df.month.str[5:7].astype(int) - 1) // 3 + 1).astype(str)
q25 = (df[df.month >= "2025-01"].groupby("q").revenue.sum() / 1e6)
gy = df.assign(y=df.month.str[:4]).pivot_table(index="channel", columns=["y", "country"], values="revenue", aggfunc="sum")
cols = ["BY", "RU", "KZ", "UZ"]
growth = ((gy["2025"] / gy["2024"] - 1) * 100)[cols]

# тепловая карта: радуга (jet) и последовательная Blues по одной и той же норме
lo, hi = float(growth.values.min()), float(growth.values.max())
norm = lambda v: (v - lo) / (hi - lo)
jet = [[mc.to_hex(cm.jet(norm(v))) for v in row] for row in growth.values]
seq = [[mc.to_hex(cm.Blues(0.08 + 0.87 * norm(v))) for v in row] for row in growth.values]


def light(hex_, deut=False):
    return float(lab(hex_, deut)[0])


def discord(cmat, deut=False):
    """Доля пар ячеек (значения различаются хотя бы на 1 п. п.), где порядок по светлоте расходится с порядком
    значений. Направление «темнее — больше» или «светлее — больше» выбирается то, что даёт меньше расхождений."""
    v = growth.values.ravel(); L = np.array([light(c, deut) for row in cmat for c in row])
    bad = tot = 0
    for i, j in combinations(range(len(v)), 2):
        if abs(v[i] - v[j]) < 1 or abs(L[i] - L[j]) < 1e-9:
            continue
        tot += 1
        bad += bool((v[i] - v[j]) * (L[j] - L[i]) < 0)  # «больше — светлее»: расхождение с «темнее — больше»
    return int(round(100 * min(bad, tot - bad) / tot))


ink = lambda cmat: [[1 if light(c) < 55 else 0 for c in row] for row in cmat]  # 1 — белый текст
GREY_L, ACC_L = mix("#737c8f", "#ffffff", 0.45), "#2f6db5"  # серый и акцент интерактива в светлой теме
pal = {"tab10": merged(TAB10), "tab4": merged(TAB10[:4]), "tab2": merged(TAB10[:2]), "ga": merged([GREY_L, ACC_L]),
       "jet": merged([mc.to_hex(cm.jet(t)) for t in np.linspace(0, 1, 8)]),
       "seq": merged([mc.to_hex(cm.Blues(0.08 + 0.87 * t)) for t in np.linspace(0, 1, 8)])}

titles = {"top2": r1(share["сайт"] + share["маркетплейс"]), "q43": r1((q25["2025Q4"] / q25["2025Q3"] - 1) * 100),
          "ccBefore": r1((cc["2025-05"] / cc["2024-01"] - 1) * 100),
          "appGrowth": [r1(growth.loc["приложение"].min()), r1(growth.loc["приложение"].max())],
          "top4": r1(share.sort_values().iloc[-4:].sum())}

# ---------- «Найди обман» ----------
yt = df.groupby(df.month.str[:4]).revenue.sum() / 1e6
ct = y25.groupby("country").revenue.sum()[cols] / 1e6
bc = df[(df.channel == "приложение") & (df.month >= "2025-01")].pivot_table(index="month", columns="country", values="revenue", aggfunc="sum")[["BY", "UZ"]] / 1e6
find = {"years": [r1(yt["2024"]), r1(yt["2025"])], "appShare": [r1(v) for v in app / w.sum(axis=1) * 100],
        "countries": [r1(v) for v in ct], "site": [r2(v) for v in site], "by": [r2(v) for v in bc["BY"]], "uz": [r2(v) for v in bc["UZ"]],
        "win25": r1((site["2025-12"] / site["2025-08"] - 1) * 100), "win24": r1((site["2024-12"] / site["2024-08"] - 1) * 100),
        "yoyDec": r1((site["2025-12"] / site["2024-12"] - 1) * 100), "ratioBYUZ": r1(bc["BY"].sum() / bc["UZ"].sum())}

DATA = {
    "months": months, "ch": ch, "rev": {c: [r2(v) for v in w[c]] for c in ch},
    "tab10": TAB10, "tab10d": [deut_hex(c) for c in TAB10], "check": check,
    "share": [r1(share[c]) for c in ch], "rev25": [r1(rev25[c]) for c in ch],
    "q25": [r2(v) for v in q25.values], "cc": [r2(v) for v in cc],
    "heat": {"rows": ch, "cols": cols, "g": [[r1(v) for v in row] for row in growth.values], "jet": jet, "seq": seq,
             "jetInk": ink(jet), "seqInk": ink(seq),
             "jetBar": [mc.to_hex(cm.jet(t)) for t in np.linspace(0, 1, 9)], "seqBar": [mc.to_hex(cm.Blues(0.08 + 0.87 * t)) for t in np.linspace(0, 1, 9)], "disc": {"jet": discord(jet), "seq": discord(seq), "jetD": discord(jet, True), "seqD": discord(seq, True)}},
    "pal": pal, "titles": titles, "find": find,
}

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("check:", check)
print("titles:", titles)
print("pal:", pal, "disc:", DATA["heat"]["disc"])
print("find:", {k: v for k, v in find.items() if not isinstance(v, list)}, "years", find["years"], "countries", find["countries"])
print("q25:", DATA["q25"], "growth range:", round(lo, 1), round(hi, 1))
print("tab10 → deut:", list(zip(TAB10, DATA["tab10d"]))[6], list(zip(TAB10, DATA["tab10d"]))[9])
