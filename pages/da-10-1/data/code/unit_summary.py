import numpy as np
import pandas as pd

clients = pd.read_csv("data/unit/clients.csv", parse_dates=["signup_date"])
orders = pd.read_csv("data/unit/orders.csv", parse_dates=["order_date"])
spend = pd.read_csv("data/unit/marketing_spend.csv")

# маржинальный доход заказа по соглашению учебника
orders["cm"] = np.where(orders.refunded == 1,
                        -2 * orders.delivery_cost - orders.payment_fee,   # товар вернулся, доставка дважды
                        orders.revenue - orders.cogs - orders.delivery_cost - orders.payment_fee)
month = lambda d: d.dt.year * 12 + d.dt.month                            # номер месяца
clients["cohort"] = month(clients.signup_date)
orders = orders.merge(clients[["client_id", "channel", "cohort"]], on="client_id")
orders["n"] = month(orders.order_date) - orders.cohort                     # месяц жизни, 0 — месяц регистрации
LAST = 2026 * 12 + 6                                                        # июнь 2026


def avg_client(ch):
    """Накопленный маржинальный доход на одного клиента за месяцы 0–23.
    Для каждого месяца n берём когорты, по которым этот месяц уже попал в выгрузку.
    Доход за месяц делим на число всех клиентов этих когорт, включая тех, кто ничего не купил."""
    cl, od = clients[clients.channel == ch], orders[orders.channel == ch]
    return pd.Series([od.cm[od.n == n].sum() / (cl.cohort <= LAST - n).sum() for n in range(24)]).cumsum()


# сводная за 24 месяца данных: продукт + маркетинг + финансы
t = orders.groupby("channel").agg(payers=("client_id", "nunique"), orders=("order_id", "size"),
                                  paid=("paid", "sum"), cm=("cm", "sum"))
t["new"] = clients.channel.value_counts()
t["spend"] = spend.groupby("channel").spend.sum()                          # у органики NaN
t.loc["вся реклама"] = t.drop("органика").sum()

u = pd.DataFrame({
    "привлечено": t.new,
    "доля платящих": t.payers / t.new,
    "заказов на платящего": t.orders / t.payers,
    "средний чек, ₽": t.paid / t.orders,
    "маржа с чека, %": t.cm / t.paid * 100,
    "CAC, ₽": t.spend / t.new,
    "МД на клиента, ₽": t.cm / t.new,                                       # МД — маржинальный доход
})
u["МД − CAC, ₽"] = u["МД на клиента, ₽"] - u["CAC, ₽"]
for ch in ["органика", "поиск", "соцсети", "партнёры"]:
    cum = avg_client(ch)
    u.loc[ch, "МД за 12 мес. жизни, ₽"] = cum[11]
    paid_back = cum[cum >= u.loc[ch, "CAC, ₽"]]
    u.loc[ch, "окупился в месяц n"] = paid_back.index[0] if len(paid_back) else np.nan

u = u.reindex(["органика", "поиск", "соцсети", "партнёры", "вся реклама"])
two = {"доля платящих", "заказов на платящего"}
show = u.T.apply(lambda r: r.map(("{:.2f}" if r.name in two else "{:.1f}" if "%" in r.name else "{:,.0f}").format), axis=1)
print(show.replace({"nan": "—"}).replace(",", " ", regex=True).to_string())
