import numpy as np
import pandas as pd
from scipy import stats

rng = np.random.default_rng(505)
retail = rng.lognormal(mean=np.log(3000), sigma=0.6, size=20_000)
amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy()

for name, x in [("логнормальная выборка", retail), ("чеки checks.csv", amount)]:
    print(f"{name}: асимметрия {stats.skew(x):.2f}, "
          f"у логарифма {stats.skew(np.log(x)):.2f}")
logs = np.log(retail)
print("логарифм выборки: среднее", logs.mean().round(3), "ст. откл.", logs.std().round(3))
print("ln 3000 =", np.log(3000).round(3))
