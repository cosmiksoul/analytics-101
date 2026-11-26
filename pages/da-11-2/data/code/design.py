import numpy as np
import pandas as pd
from scipy.stats import norm

# 1. Участники тестов: группа — из журнала показов, боты исключены
bots = ["u_025389", "u_053191", "u_055948"]
exp = pd.read_csv("data/ab/exposures.csv", parse_dates=["exposed_at"])
exp = exp[~exp.user_id.isin(bots)]
ses = pd.read_parquet("data/ab/sessions.parquet")
users = (ses.groupby(["experiment", "user_id"])
            .agg(conv=("converted", "max"), revenue=("revenue", "sum"))
            .reset_index()
            .merge(exp, on=["experiment", "user_id"], how="right", validate="one_to_one")
            .fillna({"conv": 0, "revenue": 0}))

# 2. Параметры завершённого checkout_v2 для учебного расчёта. До запуска берут исторические данные.
a = users[(users.experiment == "checkout_v2") & (users.group == "A")]
p0, mu, sd = a.conv.mean(), a.revenue.mean(), a.revenue.std()
print(f"конверсия A: {p0:.4f}   выручка на человека: {mu:.1f} ₽, σ = {sd:.0f} ₽, σ/среднее = {sd / mu:.2f}")

# 3. Выбираем целевой MDE на уровне оценённого порога окупаемости
people = (users.experiment == "checkout_v2").sum()   # участников за 4 недели
margin = 783                         # маржинальный доход обычного заказа, ₽ (страница 10.1)
point = people * 0.01 * margin * 13  # +1 п. п. за год: 13 окон по 4 недели
cost = 5_000_000                     # разработка и поддержка за год, ₽ — условная цифра
mde = round(cost / point / 100, 4)   # в долях, до сотых пункта: 0,0086 = 0,86 п. п.
print(f"пункт конверсии: {point / 1e6:.2f} млн ₽ в год → MDE = {mde * 100:.2f} п. п. = {mde / p0:+.1%}")

# 4. Формула: n = (z₁₋α/₂ + z₁₋β)² · (σ²_A + σ²_B) / MDE² — людей в КАЖДОЙ группе
alpha, power = 0.05, 0.80
z = norm.ppf(1 - alpha / 2) + norm.ppf(power)        # 1,960 + 0,842
p1 = p0 + mde
n_conv = np.ceil(z**2 * (p0 * (1 - p0) + p1 * (1 - p1)) / mde**2)
d_rev = round(mu * mde / p0)                         # тот же относительный эффект для выручки, ₽
n_rev = np.ceil(z**2 * 2 * sd**2 / d_rev**2)
print(f"конверсия: {n_conv:.0f} в группе")
print(f"выручка (+{d_rev:.0f} ₽): {n_rev:.0f} в группе — в {n_rev / n_conv:.1f} раза больше")

# 5. Срок: поток новых участников и целые недели
day = (exp.exposed_at.dt.tz_convert("Europe/Minsk").dt.date)[exp.experiment == "checkout_v2"]
flow = day.value_counts().sort_index()
print("новых участников в день, первая неделя:", flow.iloc[:7].tolist())
print("                         последняя неделя:", flow.iloc[-7:].tolist())
for n in (n_conv, n_rev):
    days = np.ceil(2 * n / flow.mean())
    print(f"{2 * n:.0f} человек при {flow.mean():.0f} в день → {days:.0f} дней → {np.ceil(days / 7):.0f} нед.")
