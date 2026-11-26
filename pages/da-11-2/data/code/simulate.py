from scipy.stats import ttest_ind

rng = np.random.default_rng(1102)
R = 2000                                    # тестов в каждой симуляции


def z_share(xa, xb, n):
    """Доля тестов с p < 0,05: z-тест для долей, xa и xb — числа покупателей в группах по n."""
    pa, pb, pp = xa / n, xb / n, (xa + xb) / (2 * n)
    zz = (pb - pa) / np.sqrt(pp * (1 - pp) * 2 / n)
    return np.mean(2 * norm.sf(np.abs(zz)) < 0.05)


# 1. Конверсия: R тестов по n_conv человек в группе
n = int(n_conv)
aa = z_share(rng.binomial(n, p0, R), rng.binomial(n, p0, R), n)          # эффекта нет
ab = z_share(rng.binomial(n, p0, R), rng.binomial(n, p0 + mde, R), n)    # эффект = MDE
print(f"конверсия, {n} в группе: A/A значимы {aa:.1%}, A/B с эффектом MDE — {ab:.1%}")


# 2. Выручка: людей берём из группы A с возвращением — хвост настоящий
rev = a.revenue.to_numpy()


def rev_share(n, lift, reps=R):
    hits = 0
    for _ in range(reps):
        x, y = rng.choice(rev, n), rng.choice(rev, n) * lift
        hits += ttest_ind(y, x, equal_var=False).pvalue < 0.05
    return hits / reps


b = c[c.group == "B"]
lift = b.revenue.mean() / mu                # +7,8%, как вышло в checkout_v2
need = int(np.ceil(z**2 * (1 + lift**2) * sd**2 / (mu * (lift - 1)) ** 2))   # σ_B = lift · σ_A
print(f"выручка, {nA} в группе: A/A значимы {rev_share(nA, 1):.1%}, "
      f"A/B с эффектом {lift - 1:+.1%} — {rev_share(nA, lift):.1%}")
print(f"выручка, {need} в группе: A/B с эффектом {lift - 1:+.1%} — {rev_share(need, lift):.1%}")
