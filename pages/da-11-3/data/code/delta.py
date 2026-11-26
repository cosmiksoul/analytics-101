# продолжение: u — строка на пользователя, s — лог сессий, x — показы, bots — боты
def ratio_delta(X, Y):
    """Отношение сумм ΣX / ΣY и его дисперсия по дельта-методу; строка (X, Y) — независимая единица."""
    X, Y = np.asarray(X, float), np.asarray(Y, float)
    n, r = len(X), X.sum() / Y.sum()
    var = (X.var(ddof=1) - 2 * r * np.cov(X, Y)[0, 1] + r**2 * Y.var(ddof=1)) / (n * Y.mean()**2)
    return r, var


# та же формула для конверсии по сессиям: у каждой сессии знаменатель 1, и формула превращается в наивную p(1 − p)/n
sess = (s[~s.user_id.isin(bots)].drop(columns="group")
        .merge(x[["user_id", "group"]], on="user_id")
        .rename(columns={"converted": "conv"}).assign(sessions=1))

rows = []
for name, num, den in [("конверсия сессий", "conv", "sessions"), ("средний чек, ₽", "revenue", "orders")]:
    se = {}
    for unit, t in [("сессия", sess), ("человек", u)]:
        (ra, va), (rb, vb) = (ratio_delta(t.loc[t.group == g, num], t.loc[t.group == g, den]) for g in "AB")
        se[unit] = np.sqrt(va + vb)
    rows.append([name, ra, rb, rb - ra, se["сессия"], se["человек"], se["человек"] / se["сессия"]])
tab = pd.DataFrame(rows, columns=["метрика", "A", "B", "B − A", "ошибка: сессия", "ошибка: человек", "шире в"])
print(tab.set_index("метрика").T.round(5).to_string())

d, (sn, sh) = rows[0][3], rows[0][4:6]
print(f"\nконверсия сессий, 95% интервал разницы, п. п.:"
      f"\n  наивно   [{100 * (d - Z95 * sn):.3f}; {100 * (d + Z95 * sn):.3f}], z = {d / sn:.2f}"
      f"\n  по людям [{100 * (d - Z95 * sh):.3f}; {100 * (d + Z95 * sh):.3f}], z = {d / sh:.2f}")
