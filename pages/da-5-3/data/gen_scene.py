"""Данные сцены и «Машины выборок» для страницы 5.3 (тема 05 «Вероятность»).

Запуск из папки страницы:  python3 data/gen_scene.py
Читает учебные чеки data/probability/checks.csv, считает всё NumPy с фиксированными seed
и вписывает результат в page.js между метками /*data:start*/ и /*data:end*/.

Сцена: 1 000 выборок по 30 чеков, по 120 и по 480 (с возвращением, seed 5300);
у первых десяти выборок по 30 сохраняются сами чеки, у остальных — только средние.
Машина: чеки в сжатом виде (шаг 10 ₽, разности значений и число повторов),
гистограмма чеков для верхней панели и границы осей гистограммы средних
для каждой пары «распределение × n» (квантили 20 000 средних, seed 5301).
"""
import json, re
from pathlib import Path
import numpy as np, pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
amount = pd.read_csv(PAGE.parents[1] / "data" / "probability" / "checks.csv")["amount"].to_numpy(np.int64)
p_buy = pd.read_csv(PAGE.parents[1] / "data" / "probability" / "visits.csv")["bought"].mean()
mu, sigma = amount.mean(), amount.std()

# ---------- сцена ----------
rng = np.random.default_rng(5300)
S30 = rng.choice(amount, size=(1000, 30))
S120 = rng.choice(amount, size=(1000, 120))
S480 = rng.choice(amount, size=(1000, 480))
means = {n: S.mean(axis=1) for n, S in ((30, S30), (120, S120), (480, S480))}
edges = np.arange(0, 16_001, 250)
top, _ = np.histogram(amount, bins=edges)
scene = {
    "first": S30[:10].tolist(),                                   # чеки первых десяти выборок
    "m30": np.round(means[30]).astype(int).tolist(),
    "m120": np.round(means[120]).astype(int).tolist(),
    "m480": np.round(means[480]).astype(int).tolist(),
    "within500": {str(n): int((np.abs(m - mu) <= 500).sum()) for n, m in means.items()},
    "top": top.tolist(), "topOver": int((amount >= 16_000).sum()),
}

# ---------- машина: чеки в сжатом виде ----------
vals, cnt = np.unique(amount // 10, return_counts=True)
assert (vals * 10 == np.unique(amount)).all(), "чеки должны быть кратны 10 ₽"
deltas = np.diff(np.r_[0, vals])
packed = np.c_[deltas, cnt].ravel().tolist()

# ---------- машина: границы осей ----------
NS = [1, 2, 5, 10, 30, 100, 300, 1000]
rng2 = np.random.default_rng(5301)
def draws(dist, size):
    if dist == "checks": return rng2.choice(amount, size=size).astype(float)
    if dist == "conv": return (rng2.random(size) < p_buy).astype(float)
    if dist == "expo": return rng2.exponential(12, size)
    if dist == "pareto": return 1000 * (1 + rng2.pareto(1.5, size))     # NumPy даёт Ломакса: +1 и ×xm
def bounds(dist, n, k=20_000):
    m = np.concatenate([draws(dist, (k // 4, n)).mean(axis=1) for _ in range(4)])
    hi_q = 0.98 if dist == "pareto" else 0.995
    return [float(np.quantile(m, 0.001)), float(np.quantile(m, hi_q))]
ranges = {d: [bounds(d, n) for n in NS] for d in ("checks", "conv", "expo", "pareto")}

data = {"scene": scene, "packed": packed, "pBuy": float(p_buy), "ns": NS,
        "ranges": {d: [[round(a, 5), round(b, 5)] for a, b in r] for d, r in ranges.items()},
        "mu": float(mu), "sigma": float(sigma)}

# ---------- сводка для текста ----------
def skew(x): return float(((x - x.mean()) ** 3).mean() / x.std() ** 3)
print(f"чеки: μ = {mu:.2f}, σ = {sigma:.2f}, асимметрия {skew(amount.astype(float)):.2f}, за 16 000: {scene['topOver']}")
for n, m in means.items():
    mr = np.round(m)
    print(f"n = {n}: среднее средних {mr.mean():.1f}, разброс {mr.std():.1f}, σ/√n {sigma / np.sqrt(n):.1f}, "
          f"асимметрия {skew(mr):.2f}, в μ ± 500: {np.mean(np.abs(m - mu) <= 500):.3f}, в μ ± 2σ/√n: {np.mean(np.abs(mr - mu) < 2 * sigma / np.sqrt(n)):.3f}")
print("первые 10 средних по 30:", np.round(S30[:10].mean(axis=1)).astype(int).tolist())
for k in (10, 100):
    mr = np.round(means[30][:k]); print(f"k = {k}: среднее {mr.mean():.0f}, разброс {mr.std():.0f}")
for d, r in ranges.items(): print(d, [[round(a, 3), round(b, 3)] for a, b in r])

js = PAGE / "page.js"
if js.exists():
    src = js.read_text(encoding="utf-8")
    new = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "/*data:end*/", src, flags=re.S)
    if new != src: js.write_text(new, encoding="utf-8"); print("page.js обновлён")
