import numpy as np
from scipy import stats
from statsmodels.stats.power import TTestIndPower

rng = np.random.default_rng(5)

def power(effect, n=40, pilots=5_000, alpha=0.05):
    old = rng.lognormal(np.log(3000), 0.6, (pilots, n))
    new = rng.lognormal(np.log(3000), 0.6, (pilots, n)) + effect   # истинный эффект в рублях
    p = stats.ttest_ind(new, old, axis=1, equal_var=False).pvalue  # 5 000 пилотов разом
    return np.mean(p < alpha)

full, half = power(1000), power(500)
print(f"эффект +1 000 ₽, по 40 оплат:  мощность {full:.3f}")
print(f"эффект   +500 ₽, по 40 оплат:  мощность {half:.3f} — в {full / half:.1f} раза ниже")
print(f"эффект   +500 ₽, по 160 оплат: мощность {power(500, n=160):.3f}")
print(f"эффекта нет,     по 40 оплат:  «значимых» {power(0):.3f}")

sigma = 3000 * np.exp(0.6**2 / 2) * np.sqrt(np.exp(0.6**2) - 1)   # σ чека, ≈ 2 364 ₽
d = TTestIndPower().power(effect_size=1000 / sigma, nobs1=40, alpha=0.05)
print(f"формула statsmodels для +1 000 ₽ (d Коэна = {1000 / sigma:.2f}): {d:.3f}")
