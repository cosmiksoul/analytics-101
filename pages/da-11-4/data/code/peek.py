import numpy as np
from scipy import stats

rng = np.random.default_rng(1104)
RUNS, DAYS, N, P, M = 20_000, 28, 1_000, 0.14, 10    # 20 000 A/A-тестов по 28 дней, 10 метрик в каждом
# покупки за день: тест × метрика × день; обе группы из одного распределения — эффекта нет
a = rng.binomial(N, P, (RUNS, M, DAYS)).cumsum(-1)
b = rng.binomial(N, P, (RUNS, M, DAYS)).cumsum(-1)
n = N * np.arange(1, DAYS + 1)                       # людей в группе к концу дня
pool = (a + b) / (2 * n)
z = (b - a) / n / np.sqrt(pool * (1 - pool) * 2 / n)  # z-тест для двух долей по накопленным данным
sig = 2 * stats.norm.sf(np.abs(z)) < 0.05            # где p < 0,05


def false_wins(k, m=1):
    """Доля тестов, в которых хотя бы одна из m метрик дала двустороннее p < 0,05 при одной из k проверок."""
    look = [-(-DAYS * j // k) for j in range(1, k + 1)]   # дни проверок: ceil(28·j/k), при k = 4 — 7, 14, 21, 28
    return sig[:, :m][:, :, [d - 1 for d in look]].any(axis=(1, 2)).mean()


for k in (1, 2, 4, 7, 14, 28):
    print(f"Проверок {k:>2}, одна метрика: ложных сигналов {false_wins(k):.1%}")
for m in (3, 5, 10):
    print(f"Метрик {m:>2}: одна проверка в конце {false_wins(1, m):.1%}, каждый день {false_wins(28, m):.1%}")
