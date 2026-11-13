import numpy as np
import pandas as pd
from scipy import stats

checks = pd.read_csv("data/probability/checks.csv").amount.to_numpy(float)
rng = np.random.default_rng(604)
R = 2_000                                     # пар групп на каждый размер
print("    n   Шапиро — Уилк отверг нормальность   ложных у Уэлча")
for n in (10, 30, 300, 3000):
    a = rng.choice(checks, (R, n))
    b = rng.choice(checks, (R, n))            # эффекта нет
    sw = (stats.shapiro(a, axis=1).pvalue < 0.05).mean()
    welch = (stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue < 0.05).mean()
    print(f"{n:5d}   {sw:20.1%}   {welch:28.1%}")
