import numpy as np
import pandas as pd
from scipy import stats

amount = pd.read_csv("data/probability/checks.csv")["amount"]
s, loc, scale = stats.lognorm.fit(amount, floc=0)   # loc = 0: чек не бывает меньше нуля
print(f"сигма {s:.3f}, медиана модели {scale:.0f} ₽")
model = stats.lognorm(s, scale=scale)

p = [0.5, 0.9, 0.95, 0.99, 0.999]
table = pd.DataFrame({"чеки": amount.quantile(p).values, "модель": model.ppf(p)}, index=p)
print(table.round(-1).astype(int))
print("дороже 15 000 ₽: чеки", round((amount > 15_000).mean(), 4),
      "модель", model.sf(15_000).round(4))

# точки Q–Q-графика: те же уровни у данных и у модели
probs = (np.arange(1, 400) - 0.5) / 399
qq = pd.DataFrame({"модель": model.ppf(probs), "чеки": np.quantile(amount, probs)})
print(len(qq), "точек; последние три:")
print(qq.tail(3).round(-1).astype(int).to_string(index=False))
