import numpy as np, pandas as pd

bought = pd.read_csv("data/probability/visits.csv")["bought"].to_numpy(np.int8)
amount = pd.read_csv("data/probability/checks.csv")["amount"].to_numpy(float)
per_day = pd.read_csv("data/probability/daily_orders.csv")["orders"].mean()   # заказов в день
p = bought.mean()
visits = round(per_day * 7 / p)          # визитов в неделю при такой конверсии
rng = np.random.default_rng(58)
cv = lambda x: x.std() / x.mean()        # коэффициент вариации

conv, check = [], []
for week in range(2_000):                # 2 000 учебных недель
    v = rng.choice(bought, size=visits)                    # визиты недели
    conv.append(v.mean())                                  # конверсия недели
    check.append(rng.choice(amount, size=v.sum()).mean())  # средний чек по её покупкам
conv, check = np.array(conv), np.array(check)

print(f"неделя: {visits} визитов, ≈ {visits * p:.0f} покупок")
print(f"CV одного визита {np.sqrt((1 - p) / p):.2f}, CV одного чека {cv(amount):.2f}")
print(f"CV недельной конверсии   {cv(conv):.3f}, формула √(1 − p)/√покупок = {np.sqrt((1 - p) / (visits * p)):.3f}")
print(f"CV недельного среднего чека {cv(check):.3f}, формула CV чека/√покупок = {cv(amount) / np.sqrt(visits * p):.3f}")
print(f"средний чек скачет сильнее в {cv(check) / cv(conv):.2f} раза")
