"""Перестановочный тест, t-тест Уэлча, частота ложных срабатываний и мощность — четыре блока кода страницы подряд.

Страница 6.3 «Проверка гипотез и p-значение» курса «Аналитика 101». Сначала три блока раздела «Код»: перестановочный тест с нуля, t-тест Уэлча, доля ложных срабатываний без эффекта. Затем блок из «Нюансов»: мощность при разных эффектах и размерах выборки.
Запуск из корня папки материалов: python da-6-3-p-value/hypothesis_tests.py
Нужен общий набор data/inference/ (pilot.csv).
"""

# ===== В 293 из 10 000 перестановок разница не меньше исходной по модулю =====
import numpy as np, pandas as pd

pilot = pd.read_csv("data/inference/pilot.csv")       # учебный пилот: 40 + 40 оплат
old = pilot.loc[pilot.button == "старая", "amount"].to_numpy(float)
new = pilot.loc[pilot.button == "новая", "amount"].to_numpy(float)
obs = new.mean() - old.mean()                         # статистика критерия: разница средних

rng = np.random.default_rng(63)
pooled = np.concatenate([old, new])
diffs = np.empty(10_000)
for i in range(diffs.size):
    shuffled = rng.permutation(pooled)                # метки «старая/новая» раздаём заново
    diffs[i] = shuffled[40:].mean() - shuffled[:40].mean()

p_two = np.mean(np.abs(diffs) >= abs(obs))            # разница не меньше исходной по модулю
p_one = np.mean(diffs >= obs)                         # правый хвост
lo, hi = np.percentile(diffs, [2.5, 97.5])

print(f"исходная разница: {obs:+.0f} ₽")
print(f"после перестановок: среднее {diffs.mean():+.1f} ₽, разброс {diffs.std():.0f} ₽")
print(f"границы центральных 95% разниц: {lo:+.0f} и {hi:+.0f} ₽")
print(f"разница не меньше исходной по модулю: {np.sum(np.abs(diffs) >= abs(obs))} из {diffs.size}")
print(f"двустороннее p = {p_two:.4f}, одностороннее p = {p_one:.4f}")

# ===== Тест Уэлча даёт p = 0,033 и интервал для разницы средних =====
import pandas as pd
from scipy import stats

pilot = pd.read_csv("data/inference/pilot.csv")
old = pilot.loc[pilot.button == "старая", "amount"]
new = pilot.loc[pilot.button == "новая", "amount"]

res = stats.ttest_ind(new, old, equal_var=False)      # t-тест Уэлча, H1: средние различаются
ci = res.confidence_interval(confidence_level=0.95)  # интервал для разницы средних
one = stats.ttest_ind(new, old, equal_var=False, alternative="greater")  # H1: новая больше

print(f"t = {res.statistic:.3f}, степеней свободы {res.df:.1f}")
print(f"двустороннее p = {res.pvalue:.4f}, одностороннее p = {one.pvalue:.4f}")
print(f"разница {new.mean() - old.mean():+.0f} ₽, 95%-й интервал от {ci.low:+.0f} до {ci.high:+.0f} ₽")
print(f"относительно среднего чека исходной группы: {(new.mean() / old.mean() - 1):+.1%}, "
      f"границы интервала в рублях, поделённые на это выборочное среднее: {ci.low / old.mean():+.1%} и {ci.high / old.mean():+.1%}")

# ===== При одинаковых кнопках около 5% пилотов дают p < 0,05 =====
import numpy as np
from scipy import stats

rng = np.random.default_rng(7)

def null_pilots(k):                                   # k пилотов без эффекта
    old = np.round(rng.lognormal(np.log(3000), 0.6, (k, 40)), -1)
    new = np.round(rng.lognormal(np.log(3000), 0.6, (k, 40)), -1)   # то же распределение сумм
    return stats.ttest_ind(new, old, axis=1, equal_var=False).pvalue

p = null_pilots(100)
print("ложных срабатываний, p < 0,05:", np.sum(p < 0.05), "из 100")
print("шесть наименьших p:", np.sort(p)[:6].round(3))
print("число p в десяти интервалах от 0 до 1:", np.histogram(p, bins=10, range=(0, 1))[0])

p = null_pilots(10_000)
print(f"на 10 000 тестах: p < 0,05 у {np.mean(p < 0.05):.2%}, p < 0,01 у {np.mean(p < 0.01):.2%}")
print("число p в десяти интервалах от 0 до 1:", np.histogram(p, bins=10, range=(0, 1))[0])

# ===== Тест обнаруживает прибавку в 500 ₽ реже, чем в 1 000 ₽ =====
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
