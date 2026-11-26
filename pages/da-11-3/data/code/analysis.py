import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.stats.proportion import confint_proportions_2indep, proportions_ztest

s = pd.read_parquet("data/ab/sessions.parquet").query("experiment == 'checkout_v2'")
x = pd.read_csv("data/ab/exposures.csv").query("experiment == 'checkout_v2'")
Z95 = stats.norm.ppf(0.975)
fmt = lambda v, d=2, sign="": f"{v:{sign}.{d}f}".replace(".", ",").replace("-", "−")   # 0,59 вместо 0.59

# 1) баланс до метрик: сколько людей получила каждая группа против задуманных 50/50
n = x.group.value_counts().sort_index()
p_srm = stats.chisquare(n).pvalue
print(f"показов: A {n.A}, B {n.B}; доля B {n.B / n.sum():.2%}; χ² против 50/50: p = {p_srm:.2f}")

# 2) лог → строка на пользователя; группа — из показа (хеш), а не из столбца group сессии
u = (s.groupby("user_id")
      .agg(sessions=("session_id", "size"), conv=("converted", "sum"),
           orders=("orders", "sum"), revenue=("revenue", "sum"))
      .join(x.set_index("user_id").group, how="right", validate="one_to_one")
      .fillna({"sessions": 0, "conv": 0, "orders": 0, "revenue": 0}).sort_index())
both = (s.groupby("user_id").group.nunique() > 1).sum()   # сессии записаны в обеих группах
bots = u.query("sessions > 200 and orders == 0").index     # сотни сессий без единого заказа
u = u.drop(bots)
u["buyer"] = (u.orders > 0).astype(int)
print(f"сессий {len(s)} → пользователей {len(u)}; ботов убрано {len(bots)}; в обеих группах {both}")


def mean_ci(col):
    """Средние A и B, разница с интервалом и относительный эффект с интервалом (дельта-метод)."""
    a, b = u.loc[u.group == "A", col], u.loc[u.group == "B", col]
    va, vb = a.var() / len(a), b.var() / len(b)
    d, se = b.mean() - a.mean(), np.sqrt(va + vb)
    r = b.mean() / a.mean()
    se_r = r * np.sqrt(va / a.mean()**2 + vb / b.mean()**2)
    p = stats.ttest_ind(b, a, equal_var=False).pvalue        # Уэлч
    return a.mean(), b.mean(), d, d - Z95 * se, d + Z95 * se, r - 1, r - 1 - Z95 * se_r, r - 1 + Z95 * se_r, p


# 3) доля покупателей: z-тест и интервал разницы (statsmodels), относительный эффект
k, m = u.groupby("group").buyer.sum(), u.groupby("group").size()
z, p_conv = proportions_ztest([k.B, k.A], [m.B, m.A])
lo, hi = confint_proportions_2indep(k.B, m.B, k.A, m.A, method="wald")
ca, cb, dc, _, _, rc, rlo, rhi, _ = mean_ci("buyer")
# 4) выручка на человека: t-тест Уэлча, при таких n интервал — нормальное приближение
ra, rb, dr, dlo, dhi, rr, rrlo, rrhi, p_rev = mean_ci("revenue")

print(f"""
ОТЧЁТ · checkout_v2 · новое оформление заказа · 7 сен — 4 окт 2026
Единица — пользователь ({len(u)}), рандомизация по хешу user_id
Качество: B {fmt(100 * n.B / n.sum())}% показов (p = {fmt(p_srm)}), ботов {len(bots)}, в обеих группах {both} — по группе показа
Доля покупателей: {fmt(100 * ca)} → {fmt(100 * cb)}%
  {fmt(100 * dc, 2, "+")} п. п. [{fmt(100 * lo)}; {fmt(100 * hi)}], {fmt(100 * rc, 1, "+")}% [{fmt(100 * rlo, 1)}; {fmt(100 * rhi, 1)}]; z = {fmt(z)}, p = {fmt(p_conv, 5)}
Выручка на человека: {fmt(ra, 1)} → {fmt(rb, 1)} ₽
  {fmt(dr, 1, "+")} ₽ [{fmt(dlo, 1)}; {fmt(dhi, 1)}], {fmt(100 * rr, 1, "+")}% [{fmt(100 * rrlo, 1)}; {fmt(100 * rrhi, 1)}]; p = {fmt(p_rev)}
Интервалы — 95%, относительные — дельта-методом""")
