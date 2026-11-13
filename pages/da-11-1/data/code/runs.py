import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# 1. Тысяча миров: в каждом свои помехи, их размер и дни заранее неизвестны
rng = np.random.default_rng(2025)
res = []
for run in range(1000):
    world = {"trend": rng.uniform(-0.003, 0.003),      # от −0,3 до +0,3% в день
             "season": rng.uniform(-0.10, 0.10),        # осенний спрос растёт или падает
             "campaign": int(rng.integers(28, 36)) if rng.random() < 0.5 else None,
             "tracking": int(rng.integers(28, 36)) if rng.random() < 0.5 else None}
    res.append(estimate(simulate(run, **world)))
est = pd.DataFrame(res, columns=["до и после", "A/B"]) * 100
err = est - LIFT * 100                                  # ошибка в процентных пунктах
print(pd.DataFrame({"средняя ошибка": err.mean(), "разброс (SD)": err.std(),
                    "|ошибка| > 5 п. п., %": (err.abs() > 5).mean() * 100}).round(1).to_string())

# 2. Регрессия к среднему: помех нет, но релиз выпускают после слабых недель
calm = []
for run in range(1000):
    d = simulate(10_000 + run)
    before = ((d.a_all + d.b) / 2)[BEFORE].sum() / d.visits[BEFORE].sum()
    calm.append((before, *estimate(d)))
calm = pd.DataFrame(calm, columns=["до", "до и после", "A/B"])
calm[["до и после", "A/B"]] = (calm[["до и после", "A/B"]] - LIFT) * 100
bad = calm["до"] < calm["до"].quantile(0.1)             # 10% самых слабых периодов «до»
print("\nсредняя ошибка, п. п.")
print(pd.DataFrame({"все прогоны": calm[["до и после", "A/B"]].mean(),
                    "после слабых недель": calm.loc[bad, ["до и после", "A/B"]].mean()}).T.round(2).to_string())

# 3. Рисунок: распределение двух оценок в тысяче миров
plt.rcParams.update({"svg.fonttype": "none", "font.size": 9, "axes.spines.top": False, "axes.spines.right": False})
fig, ax = plt.subplots(figsize=(6.4, 3.3), layout="constrained")
bins = np.arange(-20, 46, 1)
ax.hist(est["до и после"], bins=bins, color="#d27a12", alpha=0.5)
ax.hist(est["A/B"], bins=bins, color="#0d7468")
ax.axvline(LIFT * 100, color="#141a24", linewidth=1)
ax.set_ylim(0, 290)
ax.annotate("истинный эффект +10%", (LIFT * 100, 288), xytext=(4, 0), textcoords="offset points", va="top")
ax.annotate("A/B", (13, 150), color="#0d7468", fontweight="bold")
ax.annotate("«до и после»", (27, 22), color="#b0650a", fontweight="bold")
ax.set(xlabel="оценка эффекта релиза, %", ylabel="прогонов из 1000", xlim=(-20, 45))
fig.suptitle("«До и после» промахивается в обе стороны, A/B ложится у истины", x=0.02, ha="left",
             fontweight="bold", fontsize=11)
ax.set_title("Учебная симуляция: 1000 миров со случайным трендом, сезоном, кампанией и поломкой трекинга",
             loc="left", fontsize=7.5, color="#737c8f")
fig.savefig("runs.svg")
