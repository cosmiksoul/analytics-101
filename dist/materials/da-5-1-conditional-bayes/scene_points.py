"""Как отобрать и разместить точки для диаграммы в уроке 5.1 «Условная вероятность и теорема Байеса».

Данные учебные: data/probability/visits.csv (100 000 визитов, seed 505 в генераторе темы).
1. Пропорциональная выборка 1 000 визитов: из каждой клетки «источник × покупка» берётся столько визитов,
   сколько приходится на тысячу (округление методом наибольших остатков), внутри клетки — случайно, seed 505.
2. Сравнение долей в выборке и полной таблице. Оценка разброса на случайных выборках по 1 000 визитов.
3. Раскладка точек: прямоугольник 4 : 3, круг «реклама» и круг «купил» с площадями по числу точек,
   точки ставятся «лучшим кандидатом» внутри своей области, с зазором у границ кругов. Seed 505.
Запуск из корня папки материалов:  python da-5-1-conditional-bayes/scene_points.py
Скрипт печатает квоты, сверку долей и проверку раскладки. С ключом --write он ещё сохраняет рядом с собой
scene_points.txt — строку из 7 000 цифр, которой точки записаны в коде страницы.
"""
import math
import sys
from pathlib import Path

import numpy as np
import pandas as pd

v = pd.read_csv("data/probability/visits.csv")
N = len(v)

# ---------- 1. пропорциональная выборка ----------
cells = v.groupby(["source", "bought"]).size()
quota = cells / N * 1000
base = np.floor(quota).astype(int)
rest = 1000 - base.sum()
base[(quota - base).sort_values(ascending=False).index[:rest]] += 1
parts = [v[(v.source == s) & (v.bought == b)].sample(int(k), random_state=505) for (s, b), k in base.items()]
smp = pd.concat(parts)
print("квоты на тысячу:\n", base.to_string(), sep="")


def shares(d):
    ad, b = d.source == "реклама", d.bought == 1
    return pd.Series({"P(купил)": b.mean(), "P(реклама)": ad.mean(), "P(реклама∩купил)": (ad & b).mean(),
                      "P(купил|реклама)": b[ad].mean(), "P(реклама|купил)": ad[b].mean()})


print("\nсверка долей:\n", pd.DataFrame({"100 000": shares(v), "выборка 1 000": shares(smp)}).round(4).to_string(), sep="")

# Посмотрим, как меняется доля рекламы среди визитов с покупкой в 200 случайных выборках.
sim = pd.DataFrame([shares(v.sample(1000, random_state=s)) for s in range(1, 201)])
q = sim["P(реклама|купил)"].quantile([.05, .95])
print("\n200 простых случайных тысяч: покупок от %d до %d; P(реклама|купил) от %.3f до %.3f, 90%% между %.3f и %.3f"
      % ((sim["P(купил)"] * 1000).min(), (sim["P(купил)"] * 1000).max(), sim["P(реклама|купил)"].min(),
         sim["P(реклама|купил)"].max(), q.iloc[0], q.iloc[1]))

# ---------- 2. геометрия ----------
ad, b = smp.source == "реклама", smp.bought == 1
nAB, nA, nB = int((ad & b).sum()), int(b.sum()), int(ad.sum())
cnt = {"AB": nAB, "A": nA - nAB, "B": nB - nAB, "O": 1000 - nA - nB + nAB}
print("\nточки по областям:", cnt)
AX, AY = 4 / 3, 1.0
cell = AX * AY / 1000
rB, rA = math.sqrt(nB * cell / math.pi), math.sqrt(nA * cell / math.pi)


def lens(d, r1, r2):
    if d >= r1 + r2: return 0.0
    if d <= abs(r1 - r2): return math.pi * min(r1, r2) ** 2
    a1 = r1 * r1 * math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1))
    a2 = r2 * r2 * math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2))
    return a1 + a2 - 0.5 * math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2))


lo, hi = abs(rB - rA), rB + rA
for _ in range(80):
    mid = (lo + hi) / 2
    if lens(mid, rB, rA) > nAB * cell: lo = mid
    else: hi = mid
d = (lo + hi) / 2
CB = (0.56, 0.50)
CA = (CB[0] + d, 0.50)
print("rB=%.4f rA=%.4f d=%.4f  B=(%.3f, %.3f) A=(%.4f, %.3f)" % (rB, rA, d, *CB, *CA))

# ---------- 3. точки ----------
rng = np.random.default_rng(505)
M = 0.011      # зазор у границ кругов и краёв прямоугольника


def region(name, x, y):
    dA, dB = np.hypot(x - CA[0], y - CA[1]), np.hypot(x - CB[0], y - CB[1])
    inA, outA = dA < rA - M, dA > rA + M
    inB, outB = dB < rB - M, dB > rB + M
    edge = (x > M) & (x < AX - M) & (y > M) & (y < AY - M)
    return {"AB": inA & inB, "A": inA & outB, "B": inB & outA, "O": outA & outB & edge}[name] & edge


order = np.array(sum(([k] * n for k, n in cnt.items()), []))
order = order[rng.permutation(len(order))]
P = np.empty((0, 2))
lab = []
for name in order:
    cand = np.empty((0, 2))
    while len(cand) < 14:
        c = rng.random((200, 2)) * [AX, AY]
        cand = np.vstack([cand, c[region(name, c[:, 0], c[:, 1])]])
    cand = cand[:14]
    if len(P):
        dmin = np.sqrt(((cand[:, None, :] - P[None, :, :]) ** 2).sum(-1)).min(1)
        best = cand[dmin.argmax()]
    else:
        best = cand[0]
    P = np.vstack([P, best]); lab.append(name)
lab = np.array(lab)

# строка для кода страницы: сначала AB, потом A, B, O; x в тысячных долях высоты (4 цифры), y (3 цифры)
raw = ""
for name in ["AB", "A", "B", "O"]:
    for x, y in P[lab == name]:
        raw += "%04d%03d" % (round(x * 1000), min(999, round(y * 1000)))

# проверка: после округления координат точки остаются в своих областях
X = np.array([int(raw[i:i + 4]) for i in range(0, len(raw), 7)]) / 1000
Y = np.array([int(raw[i + 4:i + 7]) for i in range(0, len(raw), 7)]) / 1000
inA = np.hypot(X - CA[0], Y - CA[1]) < rA
inB = np.hypot(X - CB[0], Y - CB[1]) < rB
print("по геометрии после округления: A=%d B=%d AB=%d" % (inA.sum(), inB.sum(), (inA & inB).sum()))
gaps = np.sqrt(((P[:, None, :] - P[None, :, :]) ** 2).sum(-1)) + np.eye(1000) * 9
print("минимальное расстояние между точками %.4f, среднее до ближайшей %.4f" % (gaps.min(), gaps.min(1).mean()))
print("строка точек: %d цифр, первые 14 — %s" % (len(raw), raw[:14]))
if "--write" in sys.argv:
    out = Path(__file__).parent / "scene_points.txt"
    out.write_text(raw)
    print("сохранено:", out.name)

# Вывод:
# квоты на тысячу:
# source    bought
# органика  0         538
#           1          13
# рассылка  0         141
#           1           9
# реклама   0         287
#           1          12
#
# сверка долей:
#                   100 000  выборка 1 000
# P(купил)           0.0338         0.0340
# P(реклама)         0.2985         0.2990
# P(реклама∩купил)   0.0117         0.0120
# P(купил|реклама)   0.0393         0.0401
# P(реклама|купил)   0.3472         0.3529
#
# 200 простых случайных тысяч: покупок от 20 до 50; P(реклама|купил) от 0.138 до 0.633, 90% между 0.212 и 0.488
#
# точки по областям: {'AB': 12, 'A': 22, 'B': 287, 'O': 679}
# rB=0.3562 rA=0.1201 d=0.3779  B=(0.560, 0.500) A=(0.9379, 0.500)
# по геометрии после округления: A=34 B=299 AB=12
# минимальное расстояние между точками 0.0200, среднее до ближайшей 0.0288
# строка точек: 7000 цифр, первые 14 — 08684210880505
