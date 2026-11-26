import numpy as np, pandas as pd

pilot = pd.read_csv("data/inference/pilot.csv")       # учебный пилот: 40 + 40 оплат
old = pilot.loc[pilot.button == "старая", "amount"].to_numpy(float)
new = pilot.loc[pilot.button == "новая", "amount"].to_numpy(float)
obs = new.mean() - old.mean()                         # статистика критерия: разница средних

rng = np.random.default_rng(63)
pooled = np.concatenate([old, new])
diffs = np.empty(10_000)
for i in range(diffs.size):
    shuffled = rng.permutation(pooled)                # метки «старая/новая» раздаём заново
    diffs[i] = shuffled[40:].mean() - shuffled[:40].mean()

p_two = np.mean(np.abs(diffs) >= abs(obs))            # разница не меньше исходной по модулю
p_one = np.mean(diffs >= obs)                         # правый хвост
lo, hi = np.percentile(diffs, [2.5, 97.5])

print(f"исходная разница: {obs:+.0f} ₽")
print(f"после перестановок: среднее {diffs.mean():+.1f} ₽, разброс {diffs.std():.0f} ₽")
print(f"границы центральных 95% разниц: {lo:+.0f} и {hi:+.0f} ₽")
print(f"разница не меньше исходной по модулю: {np.sum(np.abs(diffs) >= abs(obs))} из {diffs.size}")
print(f"двустороннее p = {p_two:.4f}, одностороннее p = {p_one:.4f}")
