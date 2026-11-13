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
