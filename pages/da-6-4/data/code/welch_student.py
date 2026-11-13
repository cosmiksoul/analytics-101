import numpy as np
from scipy import stats

rng = np.random.default_rng(604)
R = 10_000
cases = {                                     # (n, σ) группы А и (n, σ) группы Б; средние равны
    "разбросы равны": ((30, 20), (120, 20)),
    "малая группа шумнее": ((30, 30), (120, 10)),
    "большая группа шумнее": ((30, 10), (120, 30)),
}
print(f"{'':22s}  ложных: Стьюдент   Уэлч")
for name, ((na, sa), (nb, sb)) in cases.items():
    a = rng.normal(100, sa, (R, na))
    b = rng.normal(100, sb, (R, nb))
    st = (stats.ttest_ind(a, b, axis=1).pvalue < 0.05).mean()
    we = (stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue < 0.05).mean()
    print(f"{name:22s}  {st:15.1%} {we:6.1%}")
