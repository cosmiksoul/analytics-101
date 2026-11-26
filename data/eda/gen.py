"""Учебные данные интернет-магазина для главы «Разведочный анализ».
clients_export.csv — выгрузка из CRM за I квартал 2026 года с пропусками и повторными записями.
daily_metrics.csv — дневные показатели за тот же квартал. В ряду есть пропущенные даты и неполный день.
Начальное значение генератора случайных чисел — 707.
"""
import numpy as np, pandas as pd, pathlib
rng = np.random.default_rng(707); P = pathlib.Path(__file__).parent
n = 12_000
cid = np.arange(100_001, 100_001 + n)
channel = rng.choice(["органика", "реклама", "рассылка"], n, p=[0.5, 0.33, 0.17])
country = rng.choice(["BY", "RU", "KZ", "UZ"], n, p=[0.35, 0.33, 0.2, 0.12])
age = np.clip(rng.normal(36, 11, n).round(), 18, 75).astype(int)
tier = rng.choice([1, 2, 3, 4, 5], n, p=[0.4, 0.25, 0.18, 0.12, 0.05])          # уровень лояльности: числа, но это категория
visits = rng.poisson(np.where(channel == "рассылка", 9, np.where(channel == "реклама", 6, 7)) * (1 + 0.15 * (tier - 1)))
orders = rng.binomial(visits, 0.25)                                              # связь 1: заказы почти линейно растут с визитами
check = np.where(channel == "рассылка", 3400, np.where(channel == "реклама", 2600, 3000))  # связь 2: средний чек зависит от канала
spend = np.round(orders * rng.lognormal(np.log(check), 0.45, n), -1)
wholesale = (rng.random(n) < 0.04) & (orders > 0)                                 # второй горб: оптовики
spend = np.where(wholesale, np.round(rng.lognormal(np.log(42_000), 0.35, n), -1), spend)
gift = (rng.random(n) < 0.035) & (orders > 0)                                     # пик на круглой сумме: подарочные сертификаты
spend = np.where(gift, 5000.0, spend)
err = rng.choice(n, 6, replace=False); spend[err] = spend[err] * 1000 + 1000      # ошибки ввода: суммы ×1000
signup = pd.Timestamp("2025-06-01") + pd.to_timedelta(rng.integers(0, 300, n), unit="D")
last = pd.Timestamp("2026-01-01") + pd.to_timedelta(rng.integers(0, 90 * 24 * 3600, n), unit="s")
df = pd.DataFrame({"client_id": cid.astype(float), "signup_date": signup.strftime("%Y-%m-%d"),
                   "last_order_at": last.strftime("%Y-%m-%dT%H:%M:%S+03:00"), "country": country, "age": age.astype(float),
                   "channel": channel, "tier": tier, "visits_q1": visits, "orders_q1": orders.astype(float), "spend_q1": spend})
df.loc[orders == 0, "last_order_at"] = ""
# --- подложенные проблемы ---
i = rng.choice(n, 25, replace=False); df.loc[i, "client_id"] = np.nan                       # 1. id — число с пропусками
i = rng.choice(n, 2_400, replace=False); df.loc[i, "signup_date"] = pd.to_datetime(df.loc[i, "signup_date"]).dt.strftime("%d.%m.%Y")  # 2. даты в двух форматах (столбец — строка)
i = rng.choice(np.where(df.last_order_at != "")[0], 1_500, replace=False)
df.loc[i, "last_order_at"] = (pd.to_datetime(df.loc[i, "last_order_at"].str[:19]) - pd.Timedelta(hours=3)).dt.strftime("%Y-%m-%dT%H:%M:%SZ")  # 3. часовые пояса: часть в UTC
i = rng.choice(n, 360, replace=False); df.loc[i, "age"] = 99                                 # 4. 99 = «не указан»
i = rng.choice(n, 180, replace=False); df.loc[i, "country"] = "N/A"                          # 5а. пропуск строкой «N/A» (pandas сам превращает в NaN)
i = rng.choice(n, 120, replace=False); df.loc[i, "channel"] = "-"                            # 5б. пропуск прочерком (pandas его не узнаёт)
i = rng.choice(n, 150, replace=False); df.loc[i, "orders_q1"] = -1                           # 6. пропуск, закодированный −1
dup = df.sample(40, random_state=7).copy(); dup["visits_q1"] += 1                            # 7. дубли ключа «которых не может быть»
df = pd.concat([df, dup]).sample(frac=1, random_state=8).reset_index(drop=True)
df.to_csv(P / "clients_export.csv", index=False, lineterminator="\n")
# --- дневные метрики ---
days = pd.date_range("2026-01-01", "2026-03-31", freq="D"); t = np.arange(len(days))
installs = np.round(300 + 2.2 * t + rng.normal(0, 25, len(t))).astype(int)                 # тренд вверх
tickets = np.round(40 + 0.35 * t + rng.normal(0, 6, len(t))).astype(int)                     # тоже тренд вверх — ложная связь через время
weekday = days.dayofweek.values
revenue = np.round((380_000 + 900 * t) * np.where(weekday >= 5, 1.25, 1.0) * rng.lognormal(0, 0.06, len(t)), -2)
d = pd.DataFrame({"date": days.date, "app_installs": installs, "support_tickets": tickets, "revenue": revenue})
d = d[~d.date.astype(str).between("2026-02-10", "2026-02-13")]                               # разрыв: 4 дня выгрузки потеряны
d.loc[d.index[-1], ["app_installs", "support_tickets", "revenue"]] = [int(installs[-1] * 0.4), int(tickets[-1] * 0.4), round(revenue[-1] * 0.4, -2)]  # последний день неполный
d.to_csv(P / "daily_metrics.csv", index=False, lineterminator="\n")
r = pd.read_csv(P / "clients_export.csv")
print(r.dtypes.to_string())
print(r.shape, "повторных строк среди заполненных client_id:", r.client_id.dropna().duplicated().sum())
print(r.spend_q1.describe().round(0).to_string()); print("нулей:", (r.spend_q1 == 0).sum(), "ровно 5000:", (r.spend_q1 == 5000).sum())
print(r.groupby("channel").apply(lambda g: (g.spend_q1 / g.orders_q1.where(g.orders_q1 > 0)).median()).round(0).to_string())
print("corr visits-orders:", r[r.orders_q1 >= 0][["visits_q1", "orders_q1"]].corr().iloc[0, 1].round(3))
dm = pd.read_csv(P / "daily_metrics.csv", parse_dates=["date"]).set_index("date")
changes = dm.asfreq("D").iloc[:-1].diff()  # после восстановления календаря пропускаем неполное 31 марта
print("Корреляция числа установок и обращений:", dm.app_installs.corr(dm.support_tickets).round(3))
print("Корреляция изменений за соседние полные дни:", changes.app_installs.corr(changes.support_tickets).round(3))
