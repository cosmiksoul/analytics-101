"""Интервалы для среднего и доли, бутстрэп, покрытие и два нюанса — шесть блоков кода страницы подряд.

Страница 6.2 «Доверительные интервалы и бутстрэп» курса «Аналитика 101». Сначала четыре блока раздела «Код»: интервал для среднего чека, интервалы для доли, бутстрэп медианы, покрытие интервалов. Затем два блока «Нюансов»: пересечение отрезков и интервал разницы, бутстрэп на малой и на смещённой выборке.
Запуск из корня папки материалов: python da-6-2-intervals-bootstrap/intervals_bootstrap.py
Нужен общий набор data/probability/.
"""

# ===== Средний чек недели — 4 485 ₽, а честно — от 3 818 до 5 152 ₽ =====
import numpy as np, pandas as pd
from scipy import stats
from statsmodels.stats.weightstats import DescrStatsW

checks = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
week = checks[:270]                     # неделя продаж — 270 чеков
n, mean, s = week.size, week.mean(), week.std(ddof=1)   # s — по выборке, с n − 1
se = s / np.sqrt(n)                     # стандартная ошибка среднего
t = stats.t.ppf(0.975, df=n - 1)        # множитель t для 95%
print(f"n = {n}, среднее {mean:.0f} ₽, s = {s:.0f} ₽, SE = {se:.0f} ₽")
print(f"t = {t:.3f}, z = {stats.norm.ppf(0.975):.3f}")
print(f"по формуле:  [{mean - t * se:.0f}; {mean + t * se:.0f}]")

ds = DescrStatsW(week)                  # statsmodels: тот же t-интервал
for level in (0.80, 0.95, 0.99):
    lo, hi = ds.tconfint_mean(alpha=1 - level)
    print(f"statsmodels {level:.0%}: [{lo:.0f}; {hi:.0f}], ширина {hi - lo:.0f} ₽")
print(f"μ всех 20 000 чеков = {checks.mean():.0f} ₽")

# ===== На 8 000 визитов способы совпали, на 100 нормальный упёрся в ноль =====
import pandas as pd
from statsmodels.stats.proportion import proportion_confint

v = pd.read_csv("data/probability/visits.csv")
week = v.head(8000)                                       # неделя: 8 000 визитов
small = v[v["source"] == "органика"].head(100)            # маленький канал: 100 визитов
for name, d in [("неделя", week), ("малый канал", small)]:
    k, n = int(d["bought"].sum()), len(d)
    print(f"{name}: {k} покупок из {n}, p̂ = {k / n:.2%}")
    for method in ("normal", "wilson"):
        lo, hi = proportion_confint(k, n, alpha=0.05, method=method)
        print(f"  {method:>6}: [{lo:.2%}; {hi:.2%}]")

p, n = 2 / 100, 100                                       # нормальный интервал вручную
half = 1.96 * (p * (1 - p) / n) ** 0.5
print(f"нормальный без обрезки нулём: [{p - half:.2%}; {p + half:.2%}]")

# ===== Медиана чека недели — от 3 000 до 3 450 ₽, и SciPy согласен =====
import numpy as np, pandas as pd
from scipy import stats

checks = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
x = checks[:270]                                    # та же неделя, 270 чеков
rng = np.random.default_rng(62)
B = 10_000
idx = rng.integers(0, x.size, size=(B, x.size))     # B перевыборок с возвращением: номера чеков
boot = np.median(x[idx], axis=1)                    # медиана каждой перевыборки
lo, hi = np.quantile(boot, [0.025, 0.975])          # процентильный интервал
print(f"медиана недели {np.median(x):.0f} ₽, бутстрэп 95%: [{lo:.0f}; {hi:.0f}]")
print(f"разброс бутстрэп-медиан: {boot.std(ddof=1):.0f} ₽")

for method in ("percentile", "BCa"):                # то же в SciPy
    r = stats.bootstrap((x,), np.median, n_resamples=B, method=method, rng=63)
    ci = r.confidence_interval
    print(f"scipy {method:>10}: [{ci.low:.0f}; {ci.high:.0f}]")
print(f"медиана всех 20 000 чеков = {np.median(checks):.0f} ₽")

# ===== Чекам не хватает и 270 наблюдений, а при малом p выручает Вилсон =====
import numpy as np, pandas as pd
from scipy import stats
from statsmodels.stats.proportion import proportion_confint

gaps = pd.read_csv("data/probability/order_gaps.csv")["gap_days"].to_numpy(float)
checks = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
rng = np.random.default_rng(64)

def t_coverage(pop, n, k=10_000, level=0.95):
    S = rng.choice(pop, size=(k, n))                       # k выборок по n значений
    m, se = S.mean(axis=1), S.std(axis=1, ddof=1) / np.sqrt(n)
    t = stats.t.ppf(0.5 + level / 2, df=n - 1)
    return np.mean(np.abs(m - pop.mean()) <= t * se)        # доля интервалов, накрывших μ

print("покрытие t-интервала 95%")
for n in (10, 40, 270, 1000):
    print(f"  n = {n:>4}: дни между заказами {t_coverage(gaps, n):.1%}, чеки {t_coverage(checks, n):.1%}")

p = pd.read_csv("data/probability/visits.csv")["bought"].mean()   # истинная конверсия
print(f"покрытие интервала для доли 95%, p = {p:.2%}")
for n in (50, 100, 300, 1000, 3000):
    k = rng.binomial(n, p, size=20_000)                    # 20 000 выборок по n визитов
    cov = {}
    for method in ("normal", "wilson"):
        lo, hi = proportion_confint(k, n, method=method)
        cov[method] = np.mean((lo <= p) & (p <= hi))
    print(f"  n = {n:>4}: нормальный {cov['normal']:.1%}, Вилсон {cov['wilson']:.1%}")

# ===== Отрезки каналов пересекаются, а интервал разницы нуля не накрывает =====
import pandas as pd
from statsmodels.stats.proportion import proportion_confint, confint_proportions_2indep

v = pd.read_csv("data/probability/visits.csv")
a = v[v["source"] == "рассылка"].head(1500)["bought"]    # по 1 500 визитов из двух каналов
b = v[v["source"] == "реклама"].head(1500)["bought"]
half = {}
for name, g in [("рассылка", a), ("реклама", b)]:
    lo, hi = proportion_confint(g.sum(), g.size, method="wilson")
    half[name] = (hi - lo) / 2
    print(f"{name:>8}: {g.mean():.2%}  [{lo:.2%}; {hi:.2%}]")
lo, hi = confint_proportions_2indep(a.sum(), a.size, b.sum(), b.size,
                                    method="newcomb", compare="diff")
print(f" разница: {a.mean() - b.mean():.2%}  [{lo:.2%}; {hi:.2%}]")
print(f"сумма полуширин {sum(half.values()):.2%}, корень из суммы квадратов "
      f"{(half['рассылка'] ** 2 + half['реклама'] ** 2) ** 0.5:.2%}")

# ===== При n = 10 бутстрэп уже формулы, а смещённую выборку он не лечит =====
import numpy as np, pandas as pd
from scipy import stats

gaps = pd.read_csv("data/probability/order_gaps.csv")["gap_days"].to_numpy(float)
checks = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
rng = np.random.default_rng(65)

def boot_ci(x, B=2000):
    boot = x[rng.integers(0, x.size, size=(B, x.size))].mean(axis=1)
    return np.quantile(boot, [0.025, 0.975])          # процентильный 95%

mu = gaps.mean()
print("2 000 выборок дней между заказами: покрытие и средняя ширина 95%")
for n in (10, 40):
    t = stats.t.ppf(0.975, n - 1)
    hit_b = hit_t = w_b = w_t = 0
    for _ in range(2000):
        x = rng.choice(gaps, n)
        lo, hi = boot_ci(x)
        se = x.std(ddof=1) / np.sqrt(n)
        hit_b += lo <= mu <= hi; w_b += hi - lo
        hit_t += abs(x.mean() - mu) <= t * se; w_t += 2 * t * se
    print(f"  n = {n}: бутстрэп {hit_b / 2000:.1%}, ширина {w_b / 2000:.1f} дн. · "
          f"t {hit_t / 2000:.1%}, ширина {w_t / 2000:.1f} дн.")

x = rng.choice(checks[checks < 15_000], 270)          # выгрузка потеряла чеки дороже 15 000 ₽
lo, hi = boot_ci(x)
print(f"без опта: бутстрэп 95% [{lo:.0f}; {hi:.0f}] ₽, а μ = {checks.mean():.0f} ₽")
