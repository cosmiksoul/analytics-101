import numpy as np
from scipy import stats

rng = np.random.default_rng(733)
n, k = 86, 20                         # 86 дней, 20 метрик из чистого шума
X = rng.normal(size=(n, k))
pairs = [(i, j) for i in range(k) for j in range(i + 1, k)]
res = [stats.pearsonr(X[:, i], X[:, j]) for i, j in pairs]
hits = [pr for pr, rr in zip(pairs, res) if rr.pvalue < 0.05]
print(f"Из {len(pairs)} пар значение p < 0,05 получили для {len(hits)}")
print("максимум |r| =", round(max(abs(rr.statistic) for rr in res), 2))

Y = rng.normal(size=(n, k))           # те же 20 метрик, следующие 86 дней
again = sum(stats.pearsonr(Y[:, i], Y[:, j]).pvalue < 0.05 for i, j in hits)
print("снова дали p < 0,05 на новых данных:", again, "из", len(hits))

def finds(X):                         # число «находок» в одной матрице
    r = np.corrcoef(X, rowvar=False)[np.triu_indices(k, 1)]
    t = r * np.sqrt((n - 2) / (1 - r ** 2))
    return (2 * stats.t.sf(abs(t), n - 2) < 0.05).sum()
print("в среднем за 1 000 повторов:", np.mean([finds(rng.normal(size=(n, k))) for _ in range(1000)]))
