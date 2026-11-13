"""Четыре критерия на одних данных, симуляции и три нюанса — семь блоков кода страницы подряд.

Страница 6.4 «Какой тест когда» курса «Аналитика 101». Сначала четыре блока раздела «Код»: четыре критерия на чеках A/B-теста, ложные срабатывания и мощность на логнормальных данных, хи-квадрат и z-тест для долей, Манн — Уитни при равных медианах. Затем три блока «Нюансов»: предварительная проверка нормальности, Стьюдент против Уэлча при неравных разбросах, сессии одного пользователя.
Запуск из корня папки материалов: python da-6-4-which-test/which_test.py
Нужны общие наборы data/inference/ (ab.csv) и data/probability/ (checks.csv, visits.csv).
"""

# ===== Четыре критерия на одних чеках: три про средние согласны, Манн — Уитни отвечает на свой вопрос =====
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

# ===== На логнормальных данных Уэлч не даёт лишних ложных срабатываний, но теряет мощность =====
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

# ===== Источник визита связан с покупкой, а z-тест для долей — это хи-квадрат 2 × 2 =====
import pandas as pd
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest

# 1. Источник визита × покупка: 100 000 учебных визитов
v = pd.read_csv("data/probability/visits.csv")
table = pd.crosstab(v.source, v.bought)
res = stats.chi2_contingency(table)
print(table)
print(f"хи-квадрат = {res.statistic:.1f}, степеней свободы {res.dof}, p = {res.pvalue:.1e}")
print("ожидаемые покупки без связи:", res.expected_freq[:, 1].round(1))
print("доля покупок:", (table[1] / table.sum(axis=1)).round(3).to_dict())

# 2. Доля оплативших в A/B-тесте: z-тест и хи-квадрат 2 × 2 — один и тот же тест
ab = pd.read_csv("data/inference/ab.csv")
paid = ab.groupby("group").paid.agg(["sum", "count"])
z, p = proportions_ztest(paid["sum"], paid["count"])
chi2 = stats.chi2_contingency(pd.crosstab(ab.group, ab.paid), correction=False)
print(paid.assign(share=paid["sum"] / paid["count"]).round(4))
print(f"z = {z:.3f}, z² = {z ** 2:.2f}, p = {p:.4f}")
print(f"хи-квадрат = {chi2.statistic:.2f}, p = {chi2.pvalue:.4f}")

# ===== Медианы равны, а Манн — Уитни значим: он сравнивает не медианы =====
import numpy as np
import pandas as pd
from scipy import stats

checks = pd.read_csv("data/probability/checks.csv").amount.to_numpy(float)
med = np.median(checks)                       # 3 080 ₽


def upsell(x):
    # вариант Б: заказам дороже медианы предложили допродажу, они выросли на 30%
    return np.where(x > med, x * 1.3, x)


print("медианы совокупностей:", med, np.median(upsell(checks)))

rng = np.random.default_rng(604)
a = rng.choice(checks, 1000)
b = upsell(rng.choice(checks, 1000))
res = stats.mannwhitneyu(b, a)
print(f"медиана выборок: А {np.median(a):.0f}, Б {np.median(b):.0f} ₽")
print(f"Манн — Уитни: p = {res.pvalue:.1e}, P(Б > А) = {res.statistic / (len(a) * len(b)):.3f}")

# 10 000 пар групп по 200 чеков: как часто тест значим
pv = stats.mannwhitneyu(upsell(rng.choice(checks, (10_000, 200))), rng.choice(checks, (10_000, 200)), axis=1).pvalue
print(f"значим в {(pv < 0.05).mean():.1%} пар групп, хотя медианы равны")

# ===== Шапиро — Уилк бьёт тревогу там, где t-тест работает =====
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

# ===== Стьюдент ошибается в пять раз чаще обещанного, если малая группа шумнее =====
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

# ===== Сессии одного человека раздувают ложные срабатывания впятеро =====
import numpy as np
from scipy import stats

rng = np.random.default_rng(604)
R, users, per = 10_000, 60, 5                 # в группе 60 пользователей по 5 сессий


def group():
    level = rng.lognormal(np.log(3000), 0.6, (R, users))         # у каждого свой уровень чека
    return np.repeat(level, per, axis=1) * rng.lognormal(-0.125, 0.5, (R, users * per))


a, b = group(), group()                       # эффекта нет
welch = (stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue < 0.05).mean()
mw = (stats.mannwhitneyu(a, b, axis=1).pvalue < 0.05).mean()
ua = a.reshape(R, users, per).mean(axis=2)    # одна строка на пользователя
ub = b.reshape(R, users, per).mean(axis=2)
user = (stats.ttest_ind(ua, ub, axis=1, equal_var=False).pvalue < 0.05).mean()
print(f"300 сессий как независимые, Уэлч:        {welch:.1%}")
print(f"300 сессий как независимые, Манн — Уитни: {mw:.1%}")
print(f"60 средних по пользователям, Уэлч:       {user:.1%}")
