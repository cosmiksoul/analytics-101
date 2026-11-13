"""Симуляции страницы 11.4: подглядывание и множественные метрики на A/A-тестах, проклятие победителя.

Прогоны A/A-тестов даёт общий генератор темы data/ab/aa_sim.py (зерно 1104): те же 20 000 тестов
использует страница 11.5. Здесь из них выбираются сто показанных тестов и тест сцены, считаются доли
ложных побед для всех сочетаний «взглядов × метрик» и проклятие победителя.

Запуск из корня папки материалов: python da-11-4-pitfalls/sim.py   → sim.json рядом со скриптом
(повторный запуск даёт тот же файл). «Взглядов k» — дни ceil(28·j/k), j = 1…k; ложная победа — хотя бы одна
из первых m метрик хотя бы в один из взглядов дала p < 0,05.
"""
import json
import sys
from pathlib import Path

import numpy as np
from scipy import stats

HERE = Path(__file__).resolve().parent
root = HERE
while not (root / "data" / "ab" / "aa_sim.py").exists() and root != root.parent:
    root = root.parent                                          # поднимаемся до папки, где лежит data/ab/
sys.path.insert(0, str(root / "data" / "ab"))
import aa_sim  # noqa: E402

SEED, RUNS, DAYS, N, P, M, Z = aa_sim.SEED, aa_sim.RUNS, aa_sim.DAYS, aa_sim.N, aa_sim.P, aa_sim.M, aa_sim.Z
zpath, looks = aa_sim.zpath, aa_sim.looks


CA, CB = aa_sim.counts()                                        # покупки за день: (RUNS, M, DAYS)
z = zpath(CA, CB)
sig = np.abs(z) >= Z

# доля ложных побед: rate[k-1][m-1]
rate = np.zeros((DAYS, M))
for k in range(1, DAYS + 1):
    hit = sig[:, :, [d - 1 for d in looks(k)]].any(-1)             # (RUNS, M): метрика «победила» хотя бы в один взгляд
    rate[k - 1] = np.logical_or.accumulate(hit, axis=1).mean(0)     # хотя бы одна из первых m метрик

# сцена: тест, где p главной метрики полнедели гуляет выше 0,4, впервые падает ниже 0,05 на 8-й день в пользу B,
# а к 28-му дню снова выше 0,3
p0 = 2 * stats.norm.sf(np.abs(z[:, 0]))
first = np.where(sig[:, 0].any(-1), sig[:, 0].argmax(-1) + 1, 0)
good = (first == 8) & (z[:, 0, 7] > 0) & (p0[:, :7].max(-1) > 0.4) & (p0[:, -1] > 0.3)

# сто показанных тестов — блок из 100 прогонов подряд (их 200), где есть тест для сцены и где доли ложных побед
# ближе всего к долям по всем 20 000 прогонам: на сотне доля гуляет на ±4–5 п. п., и типичный блок честнее случайного
KEY = [(1, 1), (4, 1), (28, 1), (1, 5), (1, 10)]


def block_counts(idx):
    out = {}
    for k, m in KEY:
        hit = sig[idx][:, :m][:, :, [d - 1 for d in looks(k)]].any(-1).any(-1)
        out[(k, m)] = hit.sum()
    return out


best = None
for b in range(RUNS // 100):
    idx = np.arange(b * 100, b * 100 + 100)
    if not good[idx].any():
        continue
    c = block_counts(idx)
    dist = sum((c[km] - 100 * rate[km[0] - 1, km[1] - 1]) ** 2 for km in KEY)
    if best is None or dist < best[0]:
        best = (dist, b)
blk = best[1]
idx = np.arange(blk * 100, blk * 100 + 100)
sc = int(idx[good[idx]][0])
show = [sc] + [int(i) for i in idx if i != sc]                   # тест сцены — первым

def quant(v):
    """z → целое z·10 так, чтобы |q| ≥ 20 ровно тогда, когда |z| ≥ 1,96: округление не переносит точку через порог."""
    q = np.clip(np.round(v * 10), -42, 42).astype(int)
    s = np.where(v >= 0, 1, -1)
    q = np.where((np.abs(v) >= Z) & (np.abs(q) < 20), 20 * s, q)
    q = np.where((np.abs(v) < Z) & (np.abs(q) >= 20), 19 * s, q)
    return q


ALPH = "".join(chr(c) for c in range(40, 127) if chr(c) not in "\\<")   # 85 знаков на значения −42…42, без \ и <
assert len(ALPH) == 85
zs = z[show]
enc = ["".join(ALPH[q + 42] for q in quant(zs[t, m])) for t in range(100) for m in range(M)]
sig_s = sig[show]
shown = {}
for k in (1, 4, 7, 14, 28):
    hit = sig_s[:, :, [d - 1 for d in looks(k)]].any(-1)
    shown[k] = [int(np.logical_or.accumulate(hit, axis=1)[:, m].sum()) for m in range(M)]

# тест сцены: точные p и эффект по дням (главная метрика)
p_sc = 2 * stats.norm.sf(np.abs(z[sc, 0]))
# относительный эффект B к A для сцены — по счёту покупок этого прогона
ca, cb = CA[sc, 0], CB[sc, 0]
assert (blk, sc) == (aa_sim.BLOCK, aa_sim.SCENE), (blk, sc)        # те же блок и тест записаны в общем генераторе
eff_sc = cb.cumsum() / ca.cumsum() - 1

# проклятие победителя: 20 000 тестов на каждый истинный эффект, 28 000 человек в группе, один взгляд в конце
wrng = np.random.default_rng(SEED + 1)
NW, RW = 28_000, 20_000
curse = []
for lift in (0.02, 0.04, 0.08):
    a = wrng.binomial(NW, P, RW) / NW
    b = wrng.binomial(NW, P * (1 + lift), RW) / NW
    pool = (a + b) / 2
    zz = (b - a) / np.sqrt(pool * (1 - pool) * 2 / NW)
    win = zz >= Z                                                # значимая победа B
    est = b / a - 1
    curse.append({"lift": lift, "power": round(float(win.mean()), 4), "mean_win": round(float(est[win].mean()), 4),
                  "mean_all": round(float(est.mean()), 4), "ratio": round(float(est[win].mean() / lift), 2)})

# два правила из вопросов: ежедневный взгляд со строгим порогом 0,01 и «продлим и посмотрим ещё раз»
p_all = 2 * stats.norm.sf(np.abs(z[:, 0]))
strict = float((p_all < 0.01).any(-1).mean())
d14, d21 = p_all[:, 13], p_all[:, 20]
extend = float(((d14 < 0.05) | ((d14 >= 0.05) & (d14 < 0.2) & (d21 < 0.05))).mean())   # день 14; при 0,05 ≤ p < 0,2 — ещё неделя

out = {
    "seed": SEED, "runs": RUNS, "days": DAYS, "n_day": N, "p": P, "metrics": M,
    "rate": [[round(float(v), 4) for v in row] for row in rate],
    "alph": ALPH, "z": enc,
    "shown": shown,
    "block": int(blk),
    "scene": {"run": sc, "p": [round(float(v), 4) for v in p_sc], "z": [round(float(abs(v)), 4) for v in z[sc, 0]], "eff": [round(float(v), 4) for v in eff_sc],
              "first": int(first[sc])},
    "curse": curse,
    "extra": {"daily_001": round(strict, 4), "extend_14_21": round(extend, 4)},
    "check": {"theory_m": [round(1 - 0.95 ** m, 4) for m in range(1, M + 1)]},
}
(HERE / "sim.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
print("тест сцены:", sc, "первый p<0,05 на дне", first[sc], "p:", np.round(p_sc, 3).tolist())
print("эффект сцены:", np.round(eff_sc * 100, 1).tolist())
print("доля ложных побед, m = 1, k = 1…28:", np.round(rate[:, 0] * 100, 1).tolist())
print("k = 1, m = 1…10:", np.round(rate[0] * 100, 1).tolist())
print("k = 28, m = 1…10:", np.round(rate[27] * 100, 1).tolist())
print("показанные сто: ", shown)
print("проклятие победителя:", curse)
print("ежедневно при пороге 0,01:", round(strict * 100, 1), "%; «продлим на неделю»:", round(extend * 100, 1), "%")
