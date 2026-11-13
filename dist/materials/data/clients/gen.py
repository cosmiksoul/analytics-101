"""Учебные клиенты для темы 04 «Математика для данных». seed 404.
clients.csv: 1000 клиентов интернет-магазина из темы 03 (shop): возраст, доход, число заказов, траты за квартал."""
import numpy as np, pandas as pd, pathlib
rng = np.random.default_rng(404)
n = 1000
age = rng.integers(18, 71, n)
income = np.round(np.clip(rng.lognormal(np.log(70_000), 0.45, n) * (1 + (age - 40) * 0.006), 25_000, 400_000), -3).astype(int)
orders = np.clip(rng.poisson(2 + income / 40_000), 0, 30)
spend = np.round(np.clip(0.035 * income + 2_600 * orders + rng.normal(0, 4_000, n), 0, None), -1).astype(int)
df = pd.DataFrame({"client_id": np.arange(1, n + 1), "age": age, "income": income, "orders": orders, "spend": spend})
p = pathlib.Path(__file__).parent / "clients.csv"; df.to_csv(p, index=False)
print(df.describe().round(1).to_string())
X = np.c_[np.ones(n), df.income, df.orders]; w, *_ = np.linalg.lstsq(X, df.spend, rcond=None); print("lstsq w:", w.round(4))
