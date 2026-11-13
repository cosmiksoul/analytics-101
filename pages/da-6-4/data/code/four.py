import numpy as np
import pandas as pd
from scipy import stats

ab = pd.read_csv("data/inference/ab.csv")     # учебный A/B-тест новой корзины, строка — пользователь
a = ab.query("group == 'A' and paid == 1").amount.to_numpy(float)
b = ab.query("group == 'B' and paid == 1").amount.to_numpy(float)
print(f"чеков:   А {len(a)}, Б {len(b)}")
print(f"среднее: А {a.mean():.0f}, Б {b.mean():.0f} ₽")
print(f"медиана: А {np.median(a):.0f}, Б {np.median(b):.0f} ₽")


def diff_means(x, y, axis):                   # статистика перестановочного теста
    return x.mean(axis=axis) - y.mean(axis=axis)


p = {
    "t Стьюдента": stats.ttest_ind(b, a).pvalue,                  # общая дисперсия
    "t Уэлча": stats.ttest_ind(b, a, equal_var=False).pvalue,
    "Манн — Уитни": stats.mannwhitneyu(b, a).pvalue,
    "перестановки": stats.permutation_test(
        (b, a), diff_means, vectorized=True, n_resamples=9_999, rng=604).pvalue,
}
for name, pv in p.items():
    print(f"{name:13s} p = {pv:.3f}")

u = stats.mannwhitneyu(b, a).statistic
print(f"P(чек Б > чек А) = {u / (len(a) * len(b)):.3f}")
print(f"чеков дороже 15 000 ₽: А {(a > 15_000).mean():.1%}, Б {(b > 15_000).mean():.1%}")
