"""Учебные данные для темы 10 «Юнит-экономика». seed 1010.
Тот же интернет-магазин товаров для дома, но не журнал событий, а «финансовая» выгрузка за 24 месяца
(июль 2024 — июнь 2026): клиенты с каналом привлечения, заказы с себестоимостью, скидками и возвратами,
расходы на маркетинг по каналам и месяцам, активность клиентов по месяцам.

Заложено:
- органика (бесплатно, почти половина новичков), поиск (контекстная реклама), соцсети (таргет — дорогой
  и слабый канал), партнёры (кешбэк-сервисы, оплата 1 400 ₽ за первый заказ);
- убывающая отдача: в поиске и соцсетях новые клиенты растут медленнее расходов (степень 0,7 и 0,6);
- удержание по месяцам — степенная кривая с разбросом между людьми; старые когорты чуть лучше новых;
- 1–2% оптовиков с чеком около 25 000 ₽ — тяжёлый хвост трат;
- часть заказов — маркетплейс: магазин получает только комиссию 15%;
- скидки и бонусы, 5–7% возвратов, доставка и эквайринг за счёт магазина.
"""
import numpy as np, pandas as pd, pathlib

rng = np.random.default_rng(1010)
P = pathlib.Path(__file__).parent
months = pd.period_range("2024-07", "2026-06", freq="M")
T = len(months)
t = np.arange(T)
moy = np.array([m.month for m in months])
season_signup = np.where(moy == 12, 1.20, np.where(np.isin(moy, [7, 8]), 0.90, 1.0))
season_buy = np.where(moy == 12, 1.25, np.where(moy == 11, 1.10, np.where(np.isin(moy, [7, 8]), 0.88, 1.0)))

CH = ["органика", "поиск", "соцсети", "партнёры"]
# ---------- расходы и привлечение ----------
spend_search = 0.75e6 * (1 + 0.025 * t) * rng.lognormal(0, 0.20, T)
spend_social = 0.85e6 * (1 + 0.020 * t) * rng.lognormal(0, 0.22, T)
spend_social[16] *= 2.2                                       # ноябрь 2025: большой тест таргета
new = {
    "поиск": 520 * (spend_search / 0.7e6) ** 0.7 * season_signup * rng.lognormal(0, 0.05, T),
    "соцсети": 380 * (spend_social / 1.2e6) ** 0.6 * season_signup * rng.lognormal(0, 0.05, T),
    "партнёры": 260 * (1 + 0.03 * t) * season_signup * rng.lognormal(0, 0.08, T),
}
new["органика"] = (780 * (1 + 0.03 * t) + 0.10 * (new["поиск"] + new["соцсети"])) * season_signup * rng.lognormal(0, 0.05, T)
new = {k: np.round(v).astype(int) for k, v in new.items()}

PAR = {   # удержание, первый заказ в месяц регистрации, заказ в активный месяц, множитель чека, доля оптовиков
    "органика": dict(ret=1.00, first=0.55, buy=0.38, aov=1.00, whole=0.020),
    "поиск":    dict(ret=0.90, first=0.50, buy=0.36, aov=1.00, whole=0.020),
    "соцсети":  dict(ret=0.50, first=0.28, buy=0.26, aov=0.85, whole=0.005),
    "партнёры": dict(ret=0.70, first=0.85, buy=0.34, aov=1.00, whole=0.015),
}
CPA_PARTNER = 1400                                               # ₽ за первый заказ клиента партнёра

# ---------- клиенты ----------
users = []
for ti, m in enumerate(months):
    for ch in CH:
        for _ in range(new[ch][ti]):
            day = int(rng.integers(1, m.days_in_month + 1))
            users.append((ti, ch, pd.Timestamp(m.year, m.month, day)))
users.sort(key=lambda x: x[2])
U = len(users)
u_t0 = np.array([u[0] for u in users]); u_ch = np.array([u[1] for u in users]); u_date = [u[2] for u in users]
u_id = np.array([f"c_{i + 1:06d}" for i in range(U)])
country = rng.choice(["BY", "RU", "KZ", "UZ"], U, p=[0.40, 0.33, 0.17, 0.10])
whole = np.array([rng.random() < PAR[c]["whole"] for c in u_ch])
drift = 1.12 - 0.012 * u_t0                                     # старые когорты удерживаются чуть лучше
a = rng.gamma(0.8, 1 / 0.8, U) * np.array([PAR[c]["ret"] for c in u_ch]) * drift * np.where(whole, 1.5, 1.0)

# ---------- активность и заказы ----------
act_rows, ord_rows = [], []
oid = 0
for i in range(U):
    ch, t0 = u_ch[i], u_t0[i]
    p = PAR[ch]
    had = False
    for ti in range(t0, T):
        n = ti - t0
        if n == 0:
            active = True
            buys = rng.random() < (0.95 if whole[i] else p["first"])
        else:
            pa = min(0.95, a[i] * 0.45 * n ** -0.5 * (1.05 if season_buy[ti] > 1.1 else 1.0))
            active = rng.random() < pa
            buys = active and rng.random() < min(0.97, p["buy"] * season_buy[ti] * (1.3 if whole[i] else 1.0))
        if not active:
            continue
        k = (1 + rng.poisson(0.4 if whole[i] else 0.15)) if buys else 0
        act_rows.append((u_id[i], str(months[ti]), k))
        m = months[ti]
        for _ in range(k):
            oid += 1
            if n == 0:
                day = int(rng.integers(u_date[i].day, m.days_in_month + 1))
            else:
                day = int(rng.integers(1, m.days_in_month + 1))
            if whole[i]:
                gmv = float(rng.lognormal(np.log(25000), 0.5)); model = "свой товар"
            else:
                gmv = float(rng.lognormal(np.log(3000), 0.6)) * p["aov"]
                model = "маркетплейс" if rng.random() < 0.25 else "свой товар"
            gmv = max(300, round(gmv, -1))
            first = not had
            had = True
            if first and ch != "партнёры" and rng.random() < 0.5:
                disc = round(0.15 * gmv, -1)                    # приветственная скидка
            elif rng.random() < 0.25:
                disc = round(0.10 * gmv, -1)                    # промокод или бонусы
            else:
                disc = 0.0
            paid = gmv - disc
            refunded = rng.random() < (0.07 if model == "маркетплейс" else 0.05)
            revenue = paid if model == "свой товар" else round(0.15 * paid, -1)
            cogs = round(0.62 * gmv, -1) if model == "свой товар" else 0.0
            delivery = (900 if whole[i] else 250) if model == "свой товар" else 0
            fee = round(0.022 * paid)
            ord_rows.append((f"o_{oid:06d}", u_id[i], pd.Timestamp(m.year, m.month, day), model, int(gmv), int(disc), int(paid),
                             int(refunded), int(revenue), int(cogs), int(delivery), int(fee)))

orders = pd.DataFrame(ord_rows, columns=["order_id", "client_id", "order_date", "model", "gmv", "discount", "paid",
                                         "refunded", "revenue", "cogs", "delivery_cost", "payment_fee"])
orders = orders.sort_values(["order_date", "order_id"], kind="stable").reset_index(drop=True)
clients = pd.DataFrame({"client_id": u_id, "signup_date": [d.date() for d in u_date], "channel": u_ch, "country": country})
activity = pd.DataFrame(act_rows, columns=["client_id", "month", "orders"]).sort_values(["month", "client_id"]).reset_index(drop=True)

# партнёрам платим за первый заказ клиента
first_orders = orders.merge(clients[["client_id", "channel"]], on="client_id").sort_values("order_date").drop_duplicates("client_id")
fp = first_orders[first_orders.channel == "партнёры"].groupby(first_orders.order_date.dt.to_period("M")).size()
spend_partner = np.array([fp.get(m, 0) * CPA_PARTNER for m in months], dtype=float)
spend = pd.DataFrame([(str(m), ch, int(round(v, -3))) for ch, arr in [("поиск", spend_search), ("соцсети", spend_social), ("партнёры", spend_partner)]
                      for m, v in zip(months, arr)], columns=["month", "channel", "spend"]).sort_values(["month", "channel"])

clients.to_csv(P / "clients.csv", index=False)
orders.assign(order_date=orders.order_date.dt.date).to_csv(P / "orders.csv", index=False)
activity.to_csv(P / "activity.csv", index=False)
spend.to_csv(P / "marketing_spend.csv", index=False)
print("клиентов", U, "заказов", len(orders), "строк активности", len(activity))
print("новые по каналам:", clients.channel.value_counts().to_dict())
