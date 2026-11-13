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

p_two = np.mean(np.abs(diffs) >= abs(obs))            # не ближе к нулю, чем наша, с любой стороны
p_one = np.mean(diffs >= obs)                         # только «новая больше»
lo, hi = np.percentile(diffs, [2.5, 97.5])

print(f"наша разница: {obs:+.0f} ₽")
print(f"перемешанные: среднее {diffs.mean():+.1f} ₽, разброс {diffs.std():.0f} ₽")
print(f"5% самых далёких от нуля: дальше {lo:+.0f} и {hi:+.0f} ₽")
print(f"дальше нашей с любой стороны: {np.sum(np.abs(diffs) >= abs(obs))} из {diffs.size}")
print(f"p-value двусторонний = {p_two:.4f}, односторонний = {p_one:.4f}")
