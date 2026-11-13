"""Учебные данные для темы 05 «Вероятность». seed 505. Тот же интернет-магазин, что в темах 02–04.
visits.csv       — 100 000 визитов: источник и факт покупки (для условных вероятностей и Байеса)
checks.csv       — 20 000 оплаченных чеков: смесь розницы (логнормальная) и редких оптовых заказов (тяжёлый хвост)
order_gaps.csv   — 5 000 интервалов между заказами одного клиента, дни (экспоненциальное)
daily_orders.csv — число заказов по дням, январь–март 2026 (Пуассон)"""
import numpy as np, pandas as pd, pathlib
rng = np.random.default_rng(505); P = pathlib.Path(__file__).parent
n = 100_000
source = rng.choice(["органика", "реклама", "рассылка"], n, p=[0.55, 0.30, 0.15])
p_buy = np.select([source == "органика", source == "реклама", source == "рассылка"], [0.025, 0.040, 0.060])
bought = (rng.random(n) < p_buy).astype(int)
pd.DataFrame({"visit_id": np.arange(1, n + 1), "source": source, "bought": bought}).to_csv(P / "visits.csv", index=False)
m = 20_000
wholesale = rng.random(m) < 0.03
amount = np.where(wholesale, rng.lognormal(np.log(25_000), 0.5, m), rng.lognormal(np.log(3_000), 0.6, m))
pd.DataFrame({"order_id": np.arange(1, m + 1), "amount": np.round(amount, -1).astype(int)}).to_csv(P / "checks.csv", index=False)
pd.DataFrame({"gap_days": np.round(rng.exponential(12, 5_000), 2)}).to_csv(P / "order_gaps.csv", index=False)
days = pd.date_range("2026-01-01", "2026-03-31", freq="D")
pd.DataFrame({"date": days.date, "orders": rng.poisson(38, len(days))}).to_csv(P / "daily_orders.csv", index=False)
v = pd.read_csv(P / "visits.csv"); c = pd.read_csv(P / "checks.csv")
print(pd.crosstab(v.source, v.bought, margins=True))
print("P(купил)=%.4f  P(реклама|купил)=%.3f  P(купил|реклама)=%.4f" % (v.bought.mean(), (v[v.bought == 1].source == "реклама").mean(), v[v.source == "реклама"].bought.mean()))
print("чеки: mean=%.0f median=%.0f p95=%.0f max=%d" % (c.amount.mean(), c.amount.median(), c.amount.quantile(.95), c.amount.max()))
