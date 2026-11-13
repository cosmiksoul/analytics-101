from statsmodels.stats.power import NormalIndPower, TTestIndPower
from statsmodels.stats.proportion import proportion_effectsize

pw = NormalIndPower()
# Доля: statsmodels меряет эффект в арксинусах — это h Коэна
h = proportion_effectsize(p1, p0)
print(f"конверсия, h = {h:.4f}:  {pw.solve_power(h, alpha=0.05, power=0.8):.0f} в группе")
# Та же формула, что вручную: эффект в долях σ̄ = √((σ²_A + σ²_B) / 2)
d_conv = mde / np.sqrt((p0 * (1 - p0) + p1 * (1 - p1)) / 2)
print(f"конверсия, Δ/σ̄ = {d_conv:.4f}: {pw.solve_power(d_conv, alpha=0.05, power=0.8):.0f} в группе")
# Среднее: d = Δ / σ; t-тест вместо z почти ничего не меняет
d = d_rev / sd
print(f"выручка, d = {d:.4f}: z {pw.solve_power(d, alpha=0.05, power=0.8):.0f}, "
      f"t {TTestIndPower().solve_power(d, alpha=0.05, power=0.8):.0f} в группе")

# Обратная задача: какой эффект видит выборка, которая набралась в checkout_v2
c = users[users.experiment == "checkout_v2"]
nA, nB = (c.group == "A").sum(), (c.group == "B").sum()
es = pw.solve_power(nobs1=nA, ratio=nB / nA, alpha=0.05, power=0.8)    # в стандартных единицах
p_min = np.sin(np.arcsin(np.sqrt(p0)) + es / 2) ** 2                   # из арксинусов обратно в долю
print(f"\nвыборка {nA} + {nB}: MDE конверсии {(p_min - p0) * 100:.2f} п. п., "
      f"выручки {es * sd:.0f} ₽ ({es * sd / mu:+.1%})")

# Что получили и какая мощность была у дизайна для эффекта такого размера
b = c[c.group == "B"]
for name, eff, es_obs in [
        ("конверсия", f"{(b.conv.mean() - p0) * 100:+.2f} п. п.", proportion_effectsize(b.conv.mean(), p0)),
        ("выручка", f"{b.revenue.mean() / mu - 1:+.1%}", (b.revenue.mean() - mu) / sd)]:
    print(f"{name}: {eff}, мощность для такого эффекта {pw.power(es_obs, nobs1=nA, alpha=0.05, ratio=nB / nA):.2f}")
