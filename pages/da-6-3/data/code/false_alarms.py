import numpy as np
from scipy import stats

rng = np.random.default_rng(7)

def null_pilots(k):                                   # k пилотов в мире без разницы
    old = np.round(rng.lognormal(np.log(3000), 0.6, (k, 40)), -1)
    new = np.round(rng.lognormal(np.log(3000), 0.6, (k, 40)), -1)   # та же кнопка по сути
    return stats.ttest_ind(new, old, axis=1, equal_var=False).pvalue

p = null_pilots(100)
print("ложных срабатываний, p < 0,05:", np.sum(p < 0.05), "из 100")
print("самые маленькие p:", np.sort(p)[:6].round(3))
print("p по десятым долям от 0 до 1:", np.histogram(p, bins=10, range=(0, 1))[0])

p = null_pilots(10_000)
print(f"на 10 000 тестах: p < 0,05 у {np.mean(p < 0.05):.2%}, p < 0,01 у {np.mean(p < 0.01):.2%}")
print("p по десятым долям от 0 до 1:", np.histogram(p, bins=10, range=(0, 1))[0])
