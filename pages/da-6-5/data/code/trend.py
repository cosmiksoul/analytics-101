import numpy as np

rng = np.random.default_rng(6522)
t = np.arange(365)
orders = 200 + 0.3 * t + rng.normal(0, 12, 365)       # заказы учебного магазина в день
subs = 9_000 + 15 * t + rng.normal(0, 400, 365)       # подписчики другого канала, отдельный тренд и независимый шум
print(f"уровни:    r = {np.corrcoef(orders, subs)[0, 1]:.2f}")
print(f"изменения: r = {np.corrcoef(np.diff(orders), np.diff(subs))[0, 1]:+.2f}")

# 1 000 пар независимых случайных блужданий по 365 дней
walks = rng.normal(size=(1000, 2, 365)).cumsum(axis=2)
r = np.array([np.corrcoef(a, b)[0, 1] for a, b in walks])
rd = np.array([np.corrcoef(np.diff(a), np.diff(b))[0, 1] for a, b in walks])
print(f"блуждания: |r| > 0,5 у {np.mean(np.abs(r) > 0.5):.0%} пар, медиана |r| = {np.median(np.abs(r)):.2f}")
print(f"их изменения: |r| > 0,5 у {np.mean(np.abs(rd) > 0.5):.0%} пар, медиана |r| = {np.median(np.abs(rd)):.2f}")
