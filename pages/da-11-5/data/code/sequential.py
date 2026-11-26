import numpy as np
import pandas as pd
from scipy import optimize, stats

ALPHA = 0.05
Z = stats.norm.ppf(1 - ALPHA / 2)
SPEND = {                                                    # функции расходования α (Lan — DeMets)
    "OBF": lambda t: 2 - 2 * stats.norm.cdf(Z / np.sqrt(t)),       # в духе O'Brien — Fleming: почти всё в конце
    "Pocock": lambda t: ALPHA * np.log(1 + (np.e - 1) * t),        # в духе Pocock: ровнее по взглядам
}

def bounds(t, spent):
    """Границы |z| для долей информации t: накопленная вероятность пересечь одну из первых k границ равна spent(t_k) в канонической нормальной модели."""
    corr = np.sqrt(np.minimum.outer(t, t) / np.maximum.outer(t, t))   # corr(Z_i, Z_j) = √(t_i / t_j)
    b = []
    for k in range(len(t)):
        mvn = stats.multivariate_normal(np.zeros(k + 1), corr[:k + 1, :k + 1])
        crossed = lambda c: 1 - mvn.cdf(np.r_[b, c], lower_limit=-np.r_[b, c], rng=1)
        b.append(optimize.brentq(lambda c: crossed(c) - spent(t[k]), 1, 10))
    return np.array(b)

# Учебная реконструкция еженедельных оценок по состоянию журнала на эту дату.
# Доля набранных участников здесь лишь приближает статистическую информацию.
# У уже вошедших людей конверсия может обновиться позже: для принятия решения
# о реальной остановке нужны проверенная модель информации и окно наблюдения.
BOTS = ["u_025389", "u_053191", "u_055948"]
exp = pd.read_csv("data/ab/exposures.csv", parse_dates=["exposed_at"]).query(
    "experiment == 'checkout_v2' and user_id not in @BOTS")
ses = pd.read_parquet("data/ab/sessions.parquet").query("experiment == 'checkout_v2'")
start = pd.Timestamp("2026-09-07", tz="Europe/Minsk")
exp["day"] = (exp.exposed_at.dt.tz_convert("Europe/Minsk") - start).dt.days
ses["day"] = (ses.session_start.dt.tz_convert("Europe/Minsk") - start).dt.days

rows = []
for end in [7, 14, 21, 28]:
    who = exp[exp.day < end]
    buyers = ses.loc[(ses.day < end) & (ses.converted == 1), "user_id"]
    conv = who.user_id.isin(buyers).astype(float)
    a, b = conv[who.group == "A"], conv[who.group == "B"]
    diff = b.mean() - a.mean()
    rows.append({"день": end, "людей": len(who), "эффект, п. п.": diff * 100,
                 "z": diff / np.sqrt(a.var() / len(a) + b.var() / len(b))})
res = pd.DataFrame(rows)
res["t"] = res["людей"] / res["людей"].iloc[-1]             # ретроспективная доля набора от конечной выборки
for name, spent in SPEND.items():
    res[f"граница {name}"] = bounds(res.t.to_numpy(), spent)
res["граница OBF пересечена"] = (res.z.abs() >= res["граница OBF"]).cummax()
print(res.round(2).to_string(index=False))
