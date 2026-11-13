import numpy as np
from scipy import stats

rng = np.random.default_rng(604)
R = 10_000                                    # повторов на строку таблицы
print("σ      n   ложных:  Уэлч   М — У    мощность при +20%:   Уэлч   М — У")
for sigma in (0.6, 1.5):                      # 0,6 — как розничные чеки, 1,5 — очень тяжёлый хвост
    for n in (10, 30, 100, 1000):
        a = rng.lognormal(0, sigma, (R, n))
        b = rng.lognormal(0, sigma, (R, n))   # та же форма: нулевая гипотеза верна
        row = []
        for k in (1.0, 1.2):                  # без эффекта и с ростом на 20%
            row.append((stats.ttest_ind(a, b * k, axis=1, equal_var=False).pvalue < 0.05).mean())
            row.append((stats.mannwhitneyu(a, b * k, axis=1).pvalue < 0.05).mean())
        print(f"{sigma:.1f} {n:6d}   {row[0]:13.1%} {row[1]:7.1%} {row[2]:26.1%} {row[3]:7.1%}")
