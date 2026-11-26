"""Предрасчёт для интерактива «Тест под данные», страница 6.4.

Сетка: форма данных (5) × размер выборки n (5) × эффект (5) × критерий (4).
В каждой клетке 10 000 повторов: две группы генерируются заново, к каждой паре применяются
t-тест Стьюдента, t-тест Уэлча, Манн — Уитни и перестановочный тест по разнице средних
(999 перестановок). В ячейке хранится доля повторов с p < 0,05. Нулевая прибавка означает равенство средних.
В модели с разными дисперсиями это не означает одинакового распределения групп, поэтому частоту
срабатываний рангового теста в такой ячейке нельзя считать его ошибкой первого рода.

Запуск из корня папки материалов:  python da-6-4-which-test/grid.py   (около 10 минут) → grid.json рядом со скриптом
Нужен общий набор data/probability/ (checks.csv). Зерно 6040, генератор один на всю сетку: клетки считаются подряд,
поэтому посчитать отдельную клетку с тем же результатом нельзя. Пока идёт расчёт, скрипт печатает
долю значимых результатов при равных средних по строке на сочетание «форма × n».
В исходниках учебника: python3 pages/da-6-4/data/grid.py из корня, затем data/inject.py.
"""
import json, time
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
CHECKS = pd.read_csv("data/probability/checks.csv").amount.to_numpy(float)

SHAPES = ["normal", "checks", "heavy", "unequal", "sessions"]
NS = [10, 30, 100, 300, 1000]
EFFECTS = [0.0, 0.05, 0.10, 0.20, 0.40]          # прибавка к среднему группы Б, доля от среднего
CRIT = ["student", "welch", "mw", "perm"]
R, B, ALPHA, SEED = 10_000, 999, 0.05, 6040
SPU = 5                                          # сессий на пользователя в форме «сессии»


def sizes(shape, n):
    return (n, 4 * n) if shape == "unequal" else (n, n)


def draw(shape, n, eff, reps, rng):
    """Возвращает группы А и Б: массивы reps × nA и reps × nB."""
    na, nb = sizes(shape, n)
    k = 1 + eff
    if shape == "normal":                        # колокол: среднее 3 000, σ = 1 800
        a = rng.normal(3000, 1800, (reps, na)); b = rng.normal(3000 * k, 1800, (reps, nb))
    elif shape == "checks":                      # чеки из checks.csv: логнормальная розница и 3% опта
        a = rng.choice(CHECKS, (reps, na)); b = rng.choice(CHECKS, (reps, nb)) * k
    elif shape == "heavy":                       # очень тяжёлый хвост: логнормальное с σ = 1,5
        a = rng.lognormal(np.log(1000), 1.5, (reps, na)); b = rng.lognormal(np.log(1000), 1.5, (reps, nb)) * k
    elif shape == "unequal":                     # стандартное отклонение малой группы втрое больше, при eff=0 средние равны
        a = rng.normal(100, 30, (reps, na)); b = rng.normal(100 * k, 10, (reps, nb))
    elif shape == "sessions":                    # n сессий = n/5 пользователей по 5 сессий
        def grp(m):
            users = rng.lognormal(np.log(3000), 0.6, (reps, m // SPU))
            return np.repeat(users, SPU, axis=1) * rng.lognormal(-0.125, 0.5, (reps, m))
        a = grp(na); b = grp(nb) * k
    return a, b


def perm_p(a, b, rng):
    """Перестановочный тест по разнице средних: 999 случайных переразбиений пула на группы."""
    na, nb = a.shape[1], b.shape[1]
    x = np.hstack([a, b]); N = na + nb
    M = np.zeros((N, B))                         # столбец — одна перестановка: 1 у тех, кто попал в Б
    idx = np.argsort(rng.random((B, N)), axis=1)[:, :nb]
    M[idx, np.arange(B)[:, None]] = 1.0
    tot = x.sum(1, keepdims=True)
    sb = x @ M
    d = sb / nb - (tot - sb) / na
    obs = b.mean(1) - a.mean(1)
    return (1 + (np.abs(d) >= np.abs(obs)[:, None] - 1e-9).sum(1)) / (B + 1)


def cell(shape, n, eff, rng):
    rej = {c: 0 for c in CRIT}
    chunk = max(50, min(1000, 400_000 // (sum(sizes(shape, n)))))
    done = 0
    while done < R:
        m = min(chunk, R - done)
        a, b = draw(shape, n, eff, m, rng)
        rej["student"] += int((stats.ttest_ind(a, b, axis=1).pvalue < ALPHA).sum())
        rej["welch"] += int((stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue < ALPHA).sum())
        rej["mw"] += int((stats.mannwhitneyu(a, b, axis=1).pvalue < ALPHA).sum())
        rej["perm"] += int((perm_p(a, b, rng) < ALPHA).sum())
        done += m
    return {c: rej[c] / R for c in CRIT}


def hists(rng):
    """Форма данных для мини-гистограммы интерактива: доли по 40 корзинам, эффект 0."""
    out = {}
    rng_h = {"normal": (-2000, 8000), "checks": (0, 16000), "heavy": (0, 8000), "unequal": (0, 200), "sessions": (0, 12000)}
    for s in SHAPES:
        lo, hi = rng_h[s]
        a, b = draw(s, 2000, 0.0, 1, rng)
        e = np.linspace(lo, hi, 41)
        ha = np.histogram(np.clip(a[0], lo, hi - 1e-9), e)[0] / a.shape[1]
        hb = np.histogram(np.clip(b[0], lo, hi - 1e-9), e)[0] / b.shape[1]
        out[s] = {"lo": lo, "hi": hi, "a": np.round(ha, 4).tolist(), "b": np.round(hb, 4).tolist(),
                  "tailA": round(float((a[0] > hi).mean()), 4), "tailB": round(float((b[0] > hi).mean()), 4)}
    # сессии шести пользователей: видно, что сессии одного человека держатся кучкой
    users = rng.lognormal(np.log(3000), 0.6, 6)
    lo, hi = rng_h["sessions"]; e = np.linspace(lo, hi, 41)
    out["sessions"]["users"] = [np.histogram(np.clip(u * rng.lognormal(-0.125, 0.5, 40), lo, hi - 1e-9), e)[0].tolist() for u in sorted(users)]
    return out


if __name__ == "__main__":
    rng = np.random.default_rng(SEED)
    t0 = time.time()
    res = {}
    for s in SHAPES:
        for n in NS:
            for e in EFFECTS:
                res[f"{s}|{n}|{e}"] = cell(s, n, e, rng)
            print(f"{s:9s} n={n:5d}  α: " + "  ".join(f"{c} {res[f'{s}|{n}|0.0'][c]:.3f}" for c in CRIT) + f"   {time.time() - t0:.0f} с", flush=True)
    out = {"meta": {"R": R, "B": B, "alpha": ALPHA, "seed": SEED, "shapes": SHAPES, "ns": NS, "effects": EFFECTS, "crit": CRIT},
           "res": res, "hist": hists(rng)}
    (HERE / "grid.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print("grid.json записан")
