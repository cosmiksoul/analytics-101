"""Последовательные тесты страницы 11.5: границы и симуляция на 20 000 A/A- и A/B-тестах.

A/A-тесты — общий набор темы data/ab/aa_sim.py (зерно 1104, первая метрика): те же прогоны и та же сотня
показанных тестов, что на странице 11.4. A/B-тесты — свои 20 000 прогонов с эффектом +0,82 п. п. (зерно 1105).
Модель одна: 28 дней, по 1 000 человек в группу в день, конверсия 14%, z-тест по накопленным данным.

Правила: «без поправки» — граница 1,96 на каждом взгляде; Pocock и O'Brien — Fleming — границы, при которых
вероятность хоть раз пересечь их в A/A-тесте равна 5% (рекурсивное интегрирование Армитиджа — Макферсона — Роу);
always-valid — граница смешанного последовательного теста mSPRT, настроенного на эффект +0,82 п. п.;
байесовское правило — «стоп, когда P(B > A) больше 95%».

Запуск из корня папки материалов: python da-11-5-cuped-sequential/sequential_sim.py   (около 20 секунд)
"""
import sys
from pathlib import Path

import numpy as np
from scipy import optimize, stats

root = Path(__file__).resolve().parent
while not (root / "data" / "ab" / "aa_sim.py").exists() and root != root.parent:
    root = root.parent                                          # поднимаемся до папки, где лежит data/ab/
sys.path.insert(0, str(root / "data" / "ab"))
import aa_sim  # noqa: E402

KS = [1, 2, 4, 7, 14, 28]                                       # число взглядов за 28 дней
ALPHA, DAYS, N, P, RUNS = 0.05, aa_sim.DAYS, aa_sim.N, aa_sim.P, aa_sim.RUNS
METHODS = ["naive", "pocock", "obf", "av"]
NAMES = {"naive": "без поправки", "pocock": "Pocock", "obf": "O'Brien — Fleming", "av": "always-valid"}


def cross_probs(b, t, drift=0.0, h=0.004):
    """P(первое пересечение |Z| ≥ b_k на взгляде k) для броуновского движения со сносом drift·t.
    Рекурсивное численное интегрирование по сетке (Armitage — McPherson — Rowe)."""
    b, t = np.asarray(b, float), np.asarray(t, float)
    L = max(b * np.sqrt(t)) + 6 * np.sqrt(t[0])
    n = int(np.ceil(L / h))
    grid = np.arange(-n, n + 1) * h
    f, out = None, []
    for k in range(len(t)):
        lim = b[k] * np.sqrt(t[k])
        if k == 0:
            sd, mu = np.sqrt(t[0]), drift * t[0]
            out.append(stats.norm.sf((lim - mu) / sd) + stats.norm.cdf((-lim - mu) / sd))
            f = stats.norm.pdf(grid, mu, sd) * (np.abs(grid) < lim)
        else:
            sd, mu = np.sqrt(t[k] - t[k - 1]), drift * (t[k] - t[k - 1])
            pc = stats.norm.sf((lim - grid - mu) / sd) + stats.norm.cdf((-lim - grid - mu) / sd)
            out.append(np.sum(f * pc) * h)
            m = int(np.ceil((8 * sd + abs(mu)) / h))
            ker = stats.norm.pdf((np.arange(-m, m + 1) * h - mu) / sd) / sd * h     # плотность приращения
            f = np.convolve(f, ker)[m:m + len(grid)] * (np.abs(grid) < lim)
    return np.array(out)


def compute():
    """Границы, доли и сто показанных тестов. Возвращает словарь; z-пути округлены до сотых, как в интерактиве."""
    poc, obf = {}, {}
    for K in KS:
        t = np.arange(1, K + 1) / K
        poc[K] = round(optimize.brentq(lambda c: cross_probs([c] * K, t).sum() - ALPHA, 1.5, 4, xtol=1e-6), 3)
        obf[K] = round(optimize.brentq(lambda c: cross_probs(c / np.sqrt(t), t).sum() - ALPHA, 1.5, 4, xtol=1e-6), 3)
    # проверка по таблицам: Pocock K = 5 → 2,413; O'Brien — Fleming K = 5 → 2,040
    t5 = np.arange(1, 6) / 5
    assert abs(optimize.brentq(lambda c: cross_probs([c] * 5, t5).sum() - ALPHA, 1.5, 4) - 2.413) < 0.002
    assert abs(optimize.brentq(lambda c: cross_probs(c / np.sqrt(t5), t5).sum() - ALPHA, 1.5, 4) - 2.040) < 0.002
    # на сколько процентов больше людей нужно для мощности 80% при четырёх взглядах (тот же эффект)
    t4 = np.arange(1, 5) / 4
    dr0 = stats.norm.ppf(1 - ALPHA / 2) + stats.norm.ppf(.8)
    infl = {}
    for nm, b in (("pocock", [poc[4]] * 4), ("obf", obf[4] / np.sqrt(t4))):
        dr = optimize.brentq(lambda m: cross_probs(b, t4, drift=m).sum() - .8, dr0, dr0 * 1.6, xtol=1e-6)
        infl[nm] = int(round((dr / dr0) ** 2 * 100 - 100))

    se28 = np.sqrt(2 * P * (1 - P) / (N * DAYS))
    delta = round((stats.norm.ppf(1 - ALPHA / 2) + stats.norm.ppf(.8)) * se28, 4)   # эффект, который один взгляд находит в 80%
    tau = delta
    v = 2 * P * (1 - P) / (N * np.arange(1, DAYS + 1))
    av = np.round(np.sqrt(2 * (v + tau ** 2) / tau ** 2 * (np.log(1 / ALPHA) + .5 * np.log((v + tau ** 2) / v))), 3)   # граница mSPRT в единицах z

    def rounded(z):
        """z до сотых — так его хранит интерактив; округление не переносит точку через порог 1,96."""
        r = np.round(z, 2)
        return np.where((np.abs(z) < aa_sim.Z) & (np.abs(r) >= 1.96), np.sign(z) * 1.95, r)

    ca, cb = aa_sim.counts()
    ca, cb = ca[:, 0], cb[:, 0]                                  # первая метрика общего набора
    z_aa = rounded(aa_sim.zpath(ca, cb))
    n = N * np.arange(1, DAYS + 1)
    ma, mb = (1 + ca.cumsum(1)) / (2 + n), (1 + cb.cumsum(1)) / (2 + n)      # Beta(1, 1) → апостериорные, нормальное приближение
    prob_aa = stats.norm.cdf((mb - ma) / np.sqrt(ma * (1 - ma) / (3 + n) + mb * (1 - mb) / (3 + n)))
    rng = np.random.default_rng(1105)
    z_ab = rounded(aa_sim.zpath(rng.binomial(N, P, (RUNS, DAYS)), rng.binomial(N, P + delta, (RUNS, DAYS))))

    def bounds(method, K):
        """Дни взглядов и границы — тем же счётом, что в интерактиве страницы."""
        j = np.arange(1, K + 1)
        days = j * DAYS // K
        b = {"naive": np.full(K, 1.96), "pocock": np.full(K, poc[K]), "obf": obf[K] * np.sqrt(K / j), "av": av[days - 1]}[method]
        return days, np.round(b, 3)

    def run(z, method, K):
        """Кто пересёк границу, кто пересёк её вверх и в какой день тест остановился."""
        days, b = bounds(method, K)
        hit = np.abs(z[:, days - 1]) >= b
        anyh = hit.any(1)
        first = np.where(anyh, hit.argmax(1), K - 1)
        return anyh, anyh & (z[np.arange(len(z)), days[first] - 1] > 0), days[first]

    rates, shown = {}, {}
    idx = aa_sim.shown()
    for m in METHODS:
        rates[m], shown[m] = {}, {}
        for K in KS:
            _, power, stop = run(z_ab, m, K)
            rates[m][K] = [round(float(run(z_aa, m, K)[0].mean() * 100), 1), round(float(power.mean() * 100), 1), round(float(stop.mean()), 1)]
            shown[m][K] = [int(run(z_aa[idx], m, K)[0].sum()), int(run(z_ab[:100], m, K)[1].sum())]
    bayes = {K: round(float((prob_aa[:, np.arange(1, K + 1) * DAYS // K - 1] > .95).any(1).mean() * 100), 1) for K in KS}
    return {"poc": poc, "obf": obf, "av": av, "infl": infl, "delta": delta, "tau": tau, "rates": rates, "shown": shown,
            "bayes": bayes, "z_aa": z_aa[idx], "z_ab": z_ab[:100]}


def other_sets(poc, obf, sets=20):
    """Те же границы на двадцати других наборах по 20 000 A/A-тестов: держат ли они 5% в среднем."""
    j = np.arange(1, DAYS + 1)
    out = {"pocock": [], "obf": []}
    for seed in range(sets):
        rng = np.random.default_rng(5000 + seed)
        z = np.abs(aa_sim.zpath(rng.binomial(N, P, (RUNS, DAYS)), rng.binomial(N, P, (RUNS, DAYS))))
        out["pocock"].append(float((z >= poc[DAYS]).any(1).mean() * 100))
        out["obf"].append(float((z >= obf[DAYS] * np.sqrt(DAYS / j)).any(1).mean() * 100))
    return {m: (round(float(np.mean(v)), 1), round(min(v), 1), round(max(v), 1)) for m, v in out.items()}


if __name__ == "__main__":
    r = compute()
    print(f"эффект в A/B-тестах: +{r['delta'] * 100:.2f} п. п.; границы: Pocock {r['poc']}, O'Brien — Fleming {r['obf']}")
    print(f"always-valid: день 1 — {r['av'][0]}, день 7 — {r['av'][6]}, день 28 — {r['av'][27]}")
    print(f"для мощности 80% при четырёх взглядах людей нужно больше: Pocock на {r['infl']['pocock']}%, O'Brien — Fleming на {r['infl']['obf']}%\n")
    print("ложных побед в A/A, % | мощность в A/B, % | средний день остановки в A/B | в ста показанных: ложных побед, найдено эффектов")
    for m in METHODS:
        for K in KS:
            a, p, d = r["rates"][m][K]
            print(f"{NAMES[m]:>18}, взглядов {K:>2}: {a:>5.1f} | {p:>5.1f} | {d:>5.1f} | {r['shown'][m][K][0]:>3} {r['shown'][m][K][1]:>3}")
    print("\nбайесовское правило «стоп при P(B > A) > 95%», ложных побед в A/A, %:", r["bayes"])
    o = other_sets(r["poc"], r["obf"])
    print("границы при 28 взглядах на двадцати других наборах A/A, ложных побед, % (среднее, от, до):",
          f"Pocock {o['pocock']}, O'Brien — Fleming {o['obf']}")

# Вывод:
# эффект в A/B-тестах: +0.82 п. п.; границы: Pocock {1: 1.96, 2: 2.179, 4: 2.362, 7: 2.485, 14: 2.615, 28: 2.721}, O'Brien — Fleming {1: 1.96, 2: 1.977, 4: 2.024, 7: 2.063, 14: 2.106, 28: 2.142}
# always-valid: день 1 — 5.346, день 7 — 3.27, день 28 — 3.035
# для мощности 80% при четырёх взглядах людей нужно больше: Pocock на 20%, O'Brien — Fleming на 3%
#
# ложных побед в A/A, % | мощность в A/B, % | средний день остановки в A/B | в ста показанных: ложных побед, найдено эффектов
#       без поправки, взглядов  1:   5.1 |  79.3 |  28.0 |   4  85
#       без поправки, взглядов  2:   8.8 |  81.3 |  21.1 |   6  87
#       без поправки, взглядов  4:  13.0 |  83.6 |  17.2 |  10  90
#       без поправки, взглядов  7:  17.1 |  84.9 |  15.2 |  17  91
#       без поправки, взглядов 14:  22.6 |  86.4 |  13.4 |  24  91
#       без поправки, взглядов 28:  28.0 |  87.3 |  12.0 |  30  91
#             Pocock, взглядов  1:   5.1 |  79.3 |  28.0 |   4  85
#             Pocock, взглядов  2:   5.4 |  74.8 |  22.2 |   3  76
#             Pocock, взглядов  4:   5.3 |  70.7 |  20.3 |   5  72
#             Pocock, взглядов  7:   5.5 |  68.1 |  19.7 |   5  72
#             Pocock, взглядов 14:   5.5 |  65.6 |  19.4 |   4  69
#             Pocock, взглядов 28:   5.3 |  63.1 |  19.5 |   4  70
#  O'Brien — Fleming, взглядов  1:   5.1 |  79.3 |  28.0 |   4  85
#  O'Brien — Fleming, взглядов  2:   5.1 |  79.2 |  25.2 |   5  84
#  O'Brien — Fleming, взглядов  4:   5.1 |  78.4 |  23.0 |   6  84
#  O'Brien — Fleming, взглядов  7:   5.2 |  78.0 |  22.1 |   5  80
#  O'Brien — Fleming, взглядов 14:   5.3 |  77.5 |  21.5 |   4  80
#  O'Brien — Fleming, взглядов 28:   5.3 |  77.2 |  21.2 |   4  80
#       always-valid, взглядов  1:   0.2 |  39.5 |  28.0 |   0  43
#       always-valid, взглядов  2:   0.4 |  41.2 |  26.2 |   1  45
#       always-valid, взглядов  4:   0.6 |  43.5 |  24.9 |   2  45
#       always-valid, взглядов  7:   0.9 |  45.3 |  24.1 |   2  47
#       always-valid, взглядов 14:   1.1 |  47.2 |  23.3 |   2  50
#       always-valid, взглядов 28:   1.3 |  48.9 |  22.8 |   2  52
#
# байесовское правило «стоп при P(B > A) > 95%», ложных побед в A/A, %: {1: 5.0, 2: 8.3, 4: 11.9, 7: 15.2, 14: 19.8, 28: 24.3}
# границы при 28 взглядах на двадцати других наборах A/A, ложных побед, % (среднее, от, до): Pocock (5.0, 4.7, 5.5), O'Brien — Fleming (5.0, 4.7, 5.6)
