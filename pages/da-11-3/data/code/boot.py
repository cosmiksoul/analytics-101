# продолжение: бутстрэп — перевыбираем строки с возвращением внутри каждой группы
rng = np.random.default_rng(113)


def boot_diff(t, num, den, B=2000):
    """B пересчётов ΣX/ΣY в B минус то же в A; строка t — единица перевыборки."""
    out = []
    for g in "AB":
        X, Y = t.loc[t.group == g, num].to_numpy(), t.loc[t.group == g, den].to_numpy()
        idx = (rng.integers(0, len(X), len(X)) for _ in range(B))
        out.append(np.array([X[i].sum() / Y[i].sum() for i in idx]))
    return out[1] - out[0]


d_user = boot_diff(u, "conv", "sessions")        # человек со всеми его сессиями
d_sess = boot_diff(sess, "conv", "sessions")     # сессии по одной: повторяет наивную ошибку
lo, hi = np.percentile(d_user, [2.5, 97.5])
print(f"конверсия сессий, ошибка разницы: по людям {d_user.std(ddof=1):.5f}, по сессиям {d_sess.std(ddof=1):.5f}")
print(f"  95% интервал по людям, п. п.: [{100 * lo:.3f}; {100 * hi:.3f}]")

# выручка на человека: среднее = сумма выручки / число людей
d_rev = boot_diff(u.assign(one=1), "revenue", "one")
lo, hi = np.percentile(d_rev, [2.5, 97.5])
print(f"выручка на человека, бутстрэп: разница {u.groupby('group').revenue.mean().diff().iloc[-1]:.1f} ₽, "
      f"95% интервал [{lo:.1f}; {hi:.1f}] ₽")

# обрезка хвоста: порог — 99-й процентиль обеих групп вместе, выше него — сам порог
cap = u.revenue.quantile(0.99)
w = u.assign(revenue=u.revenue.clip(upper=cap))
a, b = w.loc[w.group == "A", "revenue"], w.loc[w.group == "B", "revenue"]
d, se = b.mean() - a.mean(), np.sqrt(a.var() / len(a) + b.var() / len(b))
print(f"обрезка по {cap:.0f} ₽: {a.mean():.1f} → {b.mean():.1f} ₽, разница {d:.1f} ₽ "
      f"[{d - Z95 * se:.1f}; {d + Z95 * se:.1f}]; p = {stats.ttest_ind(b, a, equal_var=False).pvalue:.4f}")
print(f"обрезано людей: {(u.revenue > cap).sum()}, у них {u.revenue[u.revenue > cap].sum() / u.revenue.sum():.0%} выручки")
