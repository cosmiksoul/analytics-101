import numpy as np
import pandas as pd

# Один человек может использовать несколько устройств. Несвязанные устройства считаем по отдельности.
e = pd.read_parquet("data/events/events.parquet").drop_duplicates("event_id")
e["day"] = e.event_time.dt.tz_convert("Europe/Minsk").dt.tz_localize(None).dt.normalize()
per_day = e[e.origin == "client"].groupby(["anonymous_id", "day"]).size()
bots = per_day[per_day > 100].index.get_level_values(0).unique()
e = e[~e.anonymous_id.isin(bots) & e.day.between("2026-01-05", "2026-06-28")]
dev = e.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id").user_id.first()
e["person"] = e.user_id.fillna(e.anonymous_id.map(dev)).fillna(e.anonymous_id)
e["week"] = e.day.dt.to_period("W").dt.start_time            # неделя с понедельника


def factors(week, platform=None):
    """Выручка недели = активные × доля платящих × заказов на платящего × средний чек."""
    x = e[(e.week == week) & ((e.platform == platform) if platform else True)]
    paid = x[x.event_name == "order_paid"]                     # только серверная оплата
    active, payers = x.person.nunique(), paid.person.nunique()
    orders, revenue = paid.order_id.nunique(), paid.revenue.sum()
    return pd.Series({"активные": active, "доля платящих": payers / active,
                      "заказов на платящего": orders / payers, "средний чек": revenue / orders})


def log_split(x0, x1):
    """Вклад множителя = L · ln(x1 / x0), где L — логарифмическое среднее двух выручек."""
    if (x0 <= 0).any() or (x1 <= 0).any():
        raise ValueError("Для логарифмической декомпозиции все множители должны быть положительными.")
    r0, r1 = x0.prod(), x1.prod()
    if r0 == r1:
        return r0 * np.log(x1 / x0)  # предел логарифмического среднего при равной выручке
    return (r1 - r0) / np.log(r1 / r0) * np.log(x1 / x0)


def chain(x0, x1, order):
    """Последовательная подстановка: меняем множители по одному в заданном порядке."""
    cur, out = x0.copy(), {}
    for k in order:
        before = cur.prod()
        cur[k] = x1[k]
        out[k] = cur.prod() - before
    return pd.Series(out)[x0.index]


w0, w1 = pd.Timestamp("2026-05-25"), pd.Timestamp("2026-06-01")
x0, x1 = factors(w0), factors(w1)
c = pd.DataFrame({"лог": log_split(x0, x1),
                  "подст →": chain(x0, x1, x0.index),          # активные первыми
                  "подст ←": chain(x0, x1, x0.index[::-1])}    # средний чек первым
                 ).round().astype(int)
t = pd.DataFrame({"25–31 мая": x0.map("{:.4g}".format), "1–7 июня": x1.map("{:.4g}".format),
                  "изм, %": ((x1 / x0 - 1) * 100).round(1)}).join(c)
print(t)
print("выручка:", round(x0.prod()), "→", round(x1.prod()), "| суммы вкладов:", *c.sum())

share = pd.DataFrame({p: [factors(w, p)["доля платящих"] for w in (w0, w1)]
                      for p in ["android", "ios", "web"]}, index=["25–31 мая", "1–7 июня"]).T
print(share.round(3))
a0, a1 = factors(w0, "android"), factors(w1, "android")
back = a1.prod() * (a0["доля платящих"] / a1["доля платящих"] - 1)
print("если вернуть долю платящих в Android:", round(x1.prod() + back), "₽")
