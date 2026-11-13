import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ex = pd.read_csv("data/ab/exposures.csv", parse_dates=["exposed_at"])
ses = pd.read_parquet("data/ab/sessions.parquet")
BOTS = ["u_025389", "u_053191", "u_055948"]
s = (ses[(ses.experiment == "checkout_v2") & ~ses.user_id.isin(BOTS)].drop(columns="group")   # группа — из exposures
     .merge(ex[ex.experiment == "checkout_v2"][["user_id", "group", "exposed_at"]], on="user_id"))
s["day"] = (s.session_start - s.exposed_at) // pd.Timedelta(days=1)        # полных суток с первого показа
s["week"] = ((s.session_start + pd.Timedelta(hours=3)).dt.floor("D").dt.tz_localize(None)
             - pd.Timestamp("2026-09-07")).dt.days // 7 + 1                 # календарная неделя теста, день минский


def uplift(g):
    """Эффект конверсии сессии B к A и 95-% интервал: дельта-метод по пользователям, как в 11.3."""
    r = {}
    for grp, x in g.groupby("group"):
        u = x.groupby("user_id").converted.agg(["sum", "size"])
        R = u["sum"].sum() / u["size"].sum()
        r[grp] = R, (u["sum"] - R * u["size"]).var() / len(u) / u["size"].mean() ** 2
    (ra, va), (rb, vb) = r["A"], r["B"]
    lr, se = np.log(rb / ra), np.sqrt(va / ra ** 2 + vb / rb ** 2)
    return pd.Series({"A": ra, "B": rb, "эффект": np.expm1(lr), "от": np.expm1(lr - 1.96 * se), "до": np.expm1(lr + 1.96 * se)})


BINS = [(0, 2), (3, 6), (7, 13), (14, 27)]
by_day = pd.DataFrame({f"{a}–{b}": uplift(s[s.day.between(a, b)]) for a, b in BINS}).T
by_week = pd.DataFrame({f"неделя {w}": uplift(g) for w, g in s.groupby("week")}).T
total = uplift(s)
print("по дням с показа:\n", (by_day * 100).round(1).to_string(), sep="")
print("по календарным неделям:\n", (by_week * 100).round(1).to_string(), sep="")
print(f"за 28 дней: {total['эффект']:+.1%} [{total['от']:+.1%}; {total['до']:+.1%}]")

# график по правилам 8.4: заголовок-вывод, один акцент, подписи на месте
plt.rcParams.update({"svg.fonttype": "none", "font.size": 10, "axes.spines.top": False, "axes.spines.right": False})
ACC, GREY, MUT = "#0d7468", "#9aa3b2", "#737c8f"
pct = lambda v: f"{v * 100:+.1f}%".replace(".", ",").replace("-", "−")
fig, ax = plt.subplots(figsize=(7, 3.6), layout="constrained")
for (a, b), (_, r) in zip(BINS, by_day.iterrows()):
    ax.fill_between([a, b + 1], r["от"] * 100, r["до"] * 100, color=ACC, alpha=0.13, linewidth=0)
    ax.plot([a, b + 1], [r["эффект"] * 100] * 2, color=ACC, linewidth=2.6)
    ax.annotate(pct(r["эффект"]), ((a + b + 1) / 2, r["эффект"] * 100), xytext=(0, 6),
                textcoords="offset points", ha="center", color=ACC, fontweight="bold")
t = np.linspace(0, 28, 200)
ax.plot(t, (0.04 + 0.20 * np.exp(-t / 5)) * 100, color=GREY, linestyle="--", linewidth=1.4)
ax.annotate("так данные сгенерированы:\n+4% навсегда плюс новизна", (2.4, 16.4), xytext=(7.6, 27), color=MUT,
            fontsize=8.5, arrowprops={"arrowstyle": "-", "color": GREY, "linewidth": 0.8})
ax.axhline(total["эффект"] * 100, color=MUT, linewidth=1, linestyle=":")
ax.annotate(f"оценка за 28 дней {pct(total['эффект'])}", (27.8, total["эффект"] * 100 + 1),
            ha="right", color=MUT, fontsize=8.5)
ax.axhline(0, color="#454f62", linewidth=0.8)
ax.set(xlim=(0, 28), ylim=(-12, 36), xticks=[0, 3, 7, 14, 21, 28])
ax.set_yticks([-10, 0, 10, 20, 30], labels=["−10%", "0", "+10%", "+20%", "+30%"])
ax.set_xlabel("дней с первого показа · учебные данные checkout_v2, 7 сентября — 4 октября 2026", loc="left",
              fontsize=8, color=GREY)
fig.suptitle("Прирост конверсии от нового оформления тает за неделю после показа", x=0.01, ha="left",
             fontweight="bold", fontsize=11.5)
ax.set_title("Конверсия сессии B к A по дням с первого показа, 95-% интервалы", loc="left", fontsize=8.5, color=MUT)
fig.savefig("novelty.svg")
