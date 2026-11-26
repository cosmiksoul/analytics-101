import numpy as np
import pandas as pd

rng = np.random.default_rng(6521)
push = rng.integers(0, 7, 300)                     # уведомлений в неделю у 300 пользователей
days = 20 - 1.5 * (push - 3) ** 2 + rng.normal(0, 2, 300)   # активных дней за месяц
df = pd.DataFrame({"push": push, "days": days.clip(0, 30).round()})

print(f"Пирсон {df['push'].corr(df['days']):+.3f}   Спирмен {df['push'].corr(df['days'], method='spearman'):+.3f}")
print(df.groupby("push")["days"].mean().round(1).to_string())
print(f"Пирсон для (push − 3)² и дней: {((df['push'] - 3) ** 2).corr(df['days']):+.3f}")
