import numpy as np
import pandas as pd
from scipy.optimize import curve_fit

clients = pd.read_csv("data/unit/clients.csv", parse_dates=["signup_date"])
orders = pd.read_csv("data/unit/orders.csv", parse_dates=["order_date"])
activity = pd.read_csv("data/unit/activity.csv")

# маржинальный доход заказа по соглашению темы 10
orders["margin"] = np.where(orders.refunded == 1,
                            -2 * orders.delivery_cost - orders.payment_fee,
                            orders.revenue - orders.cogs - orders.delivery_cost - orders.payment_fee)
# месяц жизни n: 0 — месяц регистрации
clients["cohort"] = clients.signup_date.dt.strftime("%Y-%m")
c = clients.set_index("client_id")
start = c.signup_date.dt.year * 12 + c.signup_date.dt.month
activity["n"] = (activity.month.str[:4].astype(int) * 12 + activity.month.str[5:].astype(int)
                 - activity.client_id.map(start))
orders["n"] = orders.order_date.dt.year * 12 + orders.order_date.dt.month - orders.client_id.map(start)

# 12 когорт июля 2024 — июня 2025: месяцы жизни 0–12 есть у всех
grp = clients[clients.cohort.between("2024-07", "2025-06")]
size = grp.groupby("cohort").size()
pick = lambda t: t[t.client_id.isin(grp.client_id) & (t.n <= 12)].assign(cohort=lambda d: d.client_id.map(c.cohort))
act = pick(activity).pivot_table(index="cohort", columns="n", values="client_id", aggfunc="count")
marg = pick(orders).pivot_table(index="cohort", columns="n", values="margin", aggfunc="sum", fill_value=0)
r = act.sum() / size.sum()            # удержание группы: доля новичков, активных в месяц n
m = marg.sum() / act.sum()            # маржа на активного клиента в месяц n


def power(n, a, b):                   # степенная: отток со временем замедляется
    return a * n ** -b


def expo(n, a, k):                    # экспонента: каждый месяц уходит одна и та же доля
    return a * np.exp(-k * n)


def plateau(n, p, q, k):              # кривая выходит на уровень p
    return p + q * np.exp(-k * n)


models = {"степенная": (power, (0.4, 0.5)), "экспонента": (expo, (0.4, 0.1)), "плато": (plateau, (0.15, 0.3, 0.5))}

# 1) подгоняем по месяцам 1–6 и сверяем с месяцами 7–12
n6, n7 = np.arange(1, 7), np.arange(7, 13)
fit6 = {k: curve_fit(f, n6, r.loc[n6], p0=p0)[0] for k, (f, p0) in models.items()}
check = pd.DataFrame({"факт": r.loc[n7]} | {k: models[k][0](n7, *p) for k, p in fit6.items()}) * 100
print(check.round(1))
print("средняя ошибка, п. п.:", check.drop(columns="факт").sub(check["факт"], axis=0).abs().mean().round(2).to_dict())

# 2) подгоняем по всем месяцам 1–12 и дорисовываем хвост до 24 и 36 месяцев
fit12 = {k: curve_fit(f, np.arange(1, 13), r.loc[1:], p0=p0)[0] for k, (f, p0) in models.items()}
print("степенная по 1–12: a = %.4f, b = %.4f" % tuple(fit12["степенная"]))
m_tail = marg[[10, 11, 12]].sum().sum() / act[[10, 11, 12]].sum().sum()   # свежая маржа на активного
known = (r * m).sum()                 # месяцы 0–12 — данные
ltv = {k: {H: known + (models[k][0](np.arange(13, H), *p) * m_tail).sum() for H in (24, 36)} for k, p in fit12.items()}
print(f"LTV12 по данным: {(r * m).loc[:11].sum():.0f} ₽; маржа на активного в хвосте: {m_tail:.0f} ₽")
print(pd.DataFrame(ltv).T.round(0).astype(int).rename(columns=lambda H: f"LTV{H}"))

# 3) рисунок: в логарифмических осях степенная кривая — прямая
import matplotlib.pyplot as plt
plt.rcParams.update({"svg.fonttype": "none", "font.size": 9})
fig, ax = plt.subplots(figsize=(6.4, 3.7))
nn = np.arange(1, 37)
ax.axvspan(12.5, 36, color="#edf0f4")
for k, col, dy in [("степенная", "#2f6db5", 0.85), ("экспонента", "#c2417a", 1), ("плато", "#7b5bd6", 1.2)]:
    y = models[k][0](nn, *fit12[k]) * 100
    ax.plot(nn, y, color=col, lw=1.8, ls="-" if k == "степенная" else "--")
    ax.text(38, y[-1] * dy, f"{k}\nLTV36 {ltv[k][36]:,.0f} ₽".replace(",", " "), color=col, va="center", fontweight="bold")
ax.plot(r.index[1:], r.loc[1:] * 100, "o", color="#141a24", ms=4)
ax.set(xscale="log", yscale="log", xlim=(0.9, 36), ylim=(0.6, 50),
       xlabel="месяц жизни n, логарифмическая шкала", ylabel="% когорты, активной в месяц n")
ax.set_xticks([1, 2, 3, 6, 12, 24, 36], labels=["1", "2", "3", "6", "12", "24", "36"])
ax.set_yticks([1, 2, 5, 10, 20, 40], labels=["1", "2", "5", "10", "20", "40"])
ax.minorticks_off()
ax.spines[["top", "right"]].set_visible(False)
ax.text(13.5, 30, "данных нет:\nхвост дорисован", color="#737c8f")
ax.text(1.05, 1.1, "точки — 12 когорт июля 2024 — июня 2025,\nучебные данные; линии — подгонки по месяцам 1–12", color="#737c8f")
fig.suptitle("В логарифмических осях удержание ложится на прямую:\nэто степенная кривая, и её хвост — посередине",
             x=0.01, ha="left", fontweight="bold", fontsize=10.5)
fig.tight_layout()
fig.subplots_adjust(right=0.78)
fig.savefig("tails.svg")
