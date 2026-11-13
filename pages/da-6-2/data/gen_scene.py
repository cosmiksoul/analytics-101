"""Данные сцены и интерактива «Сто интервалов» для страницы 6.2 и перебор зёрен сцены.

Запуск из корня папки материалов:  python da-6-2-intervals-bootstrap/gen_scene.py
Читает общий набор data/probability/ (order_gaps.csv, checks.csv), считает всё NumPy и SciPy
с фиксированными зёрнами и печатает числа, которые стоят в тексте страницы. Учебные данные только читаются.
С ключом --write (в исходниках учебника, запуск из корня: python3 pages/da-6-2/data/gen_scene.py --write)
результат ещё вписывается в page.js между метками /*data:start*/ и /*data:end*/.

Сцена (seed 6202, 6203, 6204):
  100 выборок по 40 интервалов между заказами и 100 выборок по 160 — с возвращением;
  t-интервалы 95% и 99% (SciPy stats.t.ppf); первая выборка целиком;
  1 000 перевыборок первой выборки: средние и медианы, процентильные интервалы;
  покрытие t-интервала по 10 000 выборок по 40.
  Зерно 6202 — третье из перебранных (6200, 6201, 6202): с ним промахов ровно пять из ста и при n = 40,
  и при n = 160, а при 99% — один. Таблица в конце вывода показывает и соседние зёрна: там бывает 9 и 12.
  В длинном прогоне (зерно 6204) промахов 7,3%, и это число стоит на шаге 4 сцены.
Интерактив:
  обе совокупности в сжатом виде (отсортированные значения: разности и число повторов),
  множители t для всех n и уровней, границы оси.
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
DATA = Path("data/probability")
gaps = pd.read_csv(DATA / "order_gaps.csv")["gap_days"].to_numpy(float)
checks = pd.read_csv(DATA / "checks.csv")["amount"].to_numpy(np.int64)
MU = gaps.mean()


def r(v, d=3):
    return float(np.round(v, d))


# ---------- сцена: сто интервалов ----------
rng = np.random.default_rng(6202)
S40 = rng.choice(gaps, size=(100, 40))
S160 = rng.choice(gaps, size=(100, 160))


def intervals(S, levels):
    n = S.shape[1]
    m, se = S.mean(axis=1), S.std(axis=1, ddof=1) / np.sqrt(n)
    rows = []
    for i in range(len(S)):
        row = [r(m[i])]
        for lvl in levels:
            t = stats.t.ppf(0.5 + lvl / 2, df=n - 1)
            row += [r(m[i] - t * se[i]), r(m[i] + t * se[i])]
        rows.append(row)
    return rows, m, se


rows40, m40, se40 = intervals(S40, (0.95, 0.99))
rows160, m160, se160 = intervals(S160, (0.95,))
t40 = {lvl: float(stats.t.ppf(0.5 + lvl / 2, 39)) for lvl in (0.95, 0.99)}
t160 = float(stats.t.ppf(0.975, 159))

x1 = S40[0]
rb = np.random.default_rng(6203)
idx = rb.integers(0, 40, size=(1000, 40))           # 1 000 перевыборок первой выборки: номера значений
boot_m = x1[idx].mean(axis=1)
boot_med = np.median(x1[idx], axis=1)
rc = np.random.default_rng(6204)
S = rc.choice(gaps, size=(10_000, 40))
m, se = S.mean(axis=1), S.std(axis=1, ddof=1) / np.sqrt(40)
cov = float(np.mean(np.abs(m - MU) <= t40[0.95] * se))
below = float(np.mean(m + t40[0.95] * se < MU))

pop_edges = np.arange(0, 60.01, 2)
scene = {
    "mu": r(MU, 4), "med": r(np.median(gaps), 2),
    "pop": np.histogram(gaps, bins=pop_edges)[0].tolist(), "popOver": int((gaps >= 60).sum()),
    "r40": rows40, "r160": rows160,
    "t40": [r(t40[0.95]), r(t40[0.99])], "t160": r(t160),
    "x1": np.round(x1, 2).tolist(),
    "x1s": {"m": r(x1.mean()), "s": r(x1.std(ddof=1)), "se": r(se40[0]), "med": r(np.median(x1), 3)},
    "res": idx[:3].tolist(),                          # три первые перевыборки — для анимации
    "bm": np.round(boot_m, 3).tolist(),
    "bmed": np.round(boot_med, 3).tolist(),
    "bci": [r(v) for v in np.quantile(boot_m, [0.025, 0.975])], "bsd": r(boot_m.std(ddof=1)),
    "mci": [r(v) for v in np.quantile(boot_med, [0.025, 0.975])],
    "cov": r(cov, 4), "below": r(below, 4),
}

# ---------- интерактив ----------
def pack(a):
    v, cnt = np.unique(a, return_counts=True)
    return np.c_[np.diff(np.r_[0, v]), cnt].ravel().tolist()


gi = np.round(gaps * 100).astype(np.int64)
assert np.allclose(gi / 100, gaps), "интервалы между заказами — с точностью до сотых"
assert (checks % 10 == 0).all(), "чеки кратны 10 ₽"
NS = [10, 20, 40, 100, 400]
LV = [0.80, 0.90, 0.95, 0.99]
inter = {
    "gaps": pack(gi), "checks": pack(checks // 10),           # gaps × 100, checks / 10
    "mu": {"gaps": float(MU), "checks": float(checks.mean())},
    "ns": NS, "lv": LV,
    "tq": [[float(np.round(stats.t.ppf(0.5 + l / 2, n - 1), 6)) for l in LV] for n in NS],
    "zq": [float(np.round(stats.norm.ppf(0.5 + l / 2), 6)) for l in LV],
    "axis": {"gaps": [0, 30], "checks": [0, 12000]},
}

data = {"scene": scene, "inter": inter}

# ---------- сводка для текста ----------
def misses(rows, a, b):
    return [i for i, row in enumerate(rows) if row[a] > MU or row[b] < MU]


print(f"совокупность: {len(gaps)} интервалов, μ = {MU:.4f}, медиана {np.median(gaps):.2f}, σ = {gaps.std():.3f}")
print(f"n = 40: t95 = {t40[0.95]:.3f}, t99 = {t40[0.99]:.3f}; n = 160: t95 = {t160:.3f}")
m95, m99, m160 = misses(rows40, 1, 2), misses(rows40, 3, 4), misses(rows160, 1, 2)
print(f"промахи 95%, n = 40: {len(m95)} {m95}; 99%: {len(m99)} {m99}; 95%, n = 160: {len(m160)} {m160}")
for i in m95:
    print(f"  выборка {i + 1}: x̄ = {rows40[i][0]}, [{rows40[i][1]}; {rows40[i][2]}]")
w95 = np.mean([row[2] - row[1] for row in rows40]); w99 = np.mean([row[4] - row[3] for row in rows40])
w160 = np.mean([row[2] - row[1] for row in rows160])
print(f"средняя длина: 95% n = 40 — {w95:.2f}, 99% — {w99:.2f} (×{w99 / w95:.2f}), 95% n = 160 — {w160:.2f} (×{w160 / w95:.2f})")
print(f"выборка 1: x̄ = {x1.mean():.3f}, s = {x1.std(ddof=1):.3f}, SE = {se40[0]:.3f}, t-интервал {rows40[0][1:3]}, медиана {np.median(x1):.3f}")
c0 = np.bincount(idx[0], minlength=40)
print(f"перевыборка 1: среднее {boot_m[0]:.3f}, максимум повторов {c0.max()}, не попали {int((c0 == 0).sum())}, повторов ×2: {int((c0 == 2).sum())}, ×3: {int((c0 == 3).sum())}")
print(f"1 000 перевыборок: разброс средних {boot_m.std(ddof=1):.3f}, процентильный 95% {scene['bci']}, медианы {scene['mci']}")
print(f"10 000 выборок по 40: покрытие {cov:.4f}, промахов {1 - cov:.4f}, из них ниже μ {below:.4f}")
print("t-множители:", inter["tq"], "z:", inter["zq"])

print("перебор зёрен, промахов из ста: 95% при n = 40 | 99% при n = 40 | 95% при n = 160")
for seed in range(6199, 6205):
    g = np.random.default_rng(seed)
    ra = intervals(g.choice(gaps, size=(100, 40)), (0.95, 0.99))[0]
    rb = intervals(g.choice(gaps, size=(100, 160)), (0.95,))[0]
    print(f"  зерно {seed}: {len(misses(ra, 1, 2)):>2} | {len(misses(ra, 3, 4)):>2} | {len(misses(rb, 1, 2)):>2}" + ("   ← сцена" if seed == 6202 else ""))

if "--write" in sys.argv:
    js = PAGE / "page.js"
    src = js.read_text(encoding="utf-8")
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    new = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/" + blob + "/*data:end*/", src, flags=re.S)
    if new != src:
        js.write_text(new, encoding="utf-8")
        print("page.js обновлён")

# Вывод:
# совокупность: 5000 интервалов, μ = 11.9189, медиана 8.29, σ = 11.761
# n = 40: t95 = 2.023, t99 = 2.708; n = 160: t95 = 1.975
# промахи 95%, n = 40: 5 [21, 35, 69, 92, 99]; 99%: 1 [69]; 95%, n = 160: 5 [8, 19, 69, 73, 84]
#   выборка 22: x̄ = 9.292, [7.028; 11.557]
#   выборка 36: x̄ = 17.362, [12.465; 22.259]
#   выборка 70: x̄ = 8.459, [6.209; 10.709]
#   выборка 93: x̄ = 16.484, [12.061; 20.906]
#   выборка 100: x̄ = 8.249, [5.498; 11.0]
# средняя длина: 95% n = 40 — 7.42, 99% — 9.93 (×1.34), 95% n = 160 — 3.67 (×0.49)
# выборка 1: x̄ = 12.787, s = 11.150, SE = 1.763, t-интервал [9.221, 16.352], медиана 8.015
# перевыборка 1: среднее 12.882, максимум повторов 3, не попали 7, повторов ×2: 5, ×3: 1
# 1 000 перевыборок: разброс средних 1.712, процентильный 95% [9.574, 16.255], медианы [5.585, 13.185]
# 10 000 выборок по 40: покрытие 0.9273, промахов 0.0727, из них ниже μ 0.0633
# t-множители: [[1.383029, 1.833113, 2.262157, 3.249836], [1.327728, 1.729133, 2.093024, 2.860935], [1.303639, 1.684875, 2.022691, 2.707913], [1.290161, 1.660391, 1.984217, 2.626405], [1.283677, 1.648682, 1.965927, 2.588207]] z: [1.281552, 1.644854, 1.959964, 2.575829]
# перебор зёрен, промахов из ста: 95% при n = 40 | 99% при n = 40 | 95% при n = 160
#   зерно 6199: 12 |  5 |  6
#   зерно 6200:  5 |  0 |  3
#   зерно 6201:  5 |  2 |  5
#   зерно 6202:  5 |  1 |  5   ← сцена
#   зерно 6203:  9 |  2 |  9
#   зерно 6204: 12 |  3 |  4
