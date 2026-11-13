"""Тысяча прогонов: «до и после» против A/B

Страница 11.1 «Эксперимент вместо «до и после»» курса «Аналитика 101». Второй блок кода страницы вместе с первым: симуляция магазина из simulate.py и тысяча миров со случайными помехами. Сохраняет рисунок runs.svg.
Запуск из корня папки материалов: python da-11-1-why-experiment/runs.py
"""

# ===== Симуляция магазина с трендом, сезоном и помехами =====
import numpy as np
import pandas as pd

DAYS = pd.date_range("2025-09-01", periods=42)          # 6 недель: пн 1 сентября — вс 12 октября
T = np.arange(42)
RELEASE = 28                                            # релиз в понедельник 29 сентября
BEFORE = (T >= RELEASE - 14) & (T < RELEASE)            # две недели до релиза
AFTER = T >= RELEASE                                    # две недели после
LIFT = 0.10                                             # истинный эффект релиза: +10% к конверсии


def simulate(seed, trend=0.0, season=0.0, campaign=None, tracking=None, dip=0.0):
    """Учебный магазин по дням. Аудитория поделена пополам по хешу: группы A и B.
    a — покупки A без релиза, b — покупки B с релизом, a_all — те же люди A, если релиз выкатили всем."""
    rng = np.random.default_rng(seed)
    shock = 0.02 * rng.standard_normal(42) + 0.03 * np.repeat(rng.standard_normal(6), 7)   # колебания дня и недели
    z = rng.standard_normal((2, 42))                    # шум покупок в каждой половине
    weekend = DAYS.dayofweek >= 5
    visits = np.where(weekend, 34_500.0, 30_000.0)
    p = 0.04 * np.exp(shock) * (1 + trend) ** T         # конверсия визита; тренд — рост за день
    if season:                                          # сезон: выходные и осенний спрос вокруг релиза
        p *= np.where(weekend, 0.92, 1) * (1 + season / (1 + np.exp(-(T - 27) / 4)))
    p *= np.where((T >= 21) & (T < 28), 1 - dip, 1)     # провал за неделю до релиза
    weak = np.zeros(42)                                 # кампания: +40% визитов, покупают в 0,45 раза реже
    if campaign is not None:
        weak[campaign:campaign + 7] = 0.4 * visits[campaign:campaign + 7]
    seen = np.ones(42)                                  # трекинг: 20% визитов не доходят до журнала
    if tracking is not None:
        seen[tracking:tracking + 7] = 0.8

    def buys(half, released):
        mean = (visits + 0.45 * weak) / 2 * p * np.where(released & AFTER, 1 + LIFT, 1)
        return mean + z[half] * np.sqrt(mean * (1 - p))  # шум как у биномиального распределения
    return pd.DataFrame({"visits": (visits + weak) / 2 * seen,     # визиты одной половины в журнале
                         "a": buys(0, False), "b": buys(1, True), "a_all": buys(0, True)}, index=DAYS)


def estimate(d):
    """Две оценки эффекта: «до и после» по всей аудитории и A/B по группам в одни и те же дни."""
    conv = lambda buys, days: buys[days].sum() / d.visits[days].sum()
    everyone = (d.a_all + d.b) / 2                      # мир без эксперимента: релиз получили все
    return conv(everyone, AFTER) / conv(everyone, BEFORE) - 1, conv(d.b, AFTER) / conv(d.a, AFTER) - 1


LAYERS = {"тренд": {"trend": 0.003}, "сезон": {"season": 0.10}, "кампания": {"campaign": 30},
          "трекинг": {"tracking": 35}, "провал": {"dip": 0.09}}
world, rows = {}, []
for name in ["без помех", *LAYERS]:                     # включаем слои по одному; шум тот же, seed 481
    world |= LAYERS.get(name, {})
    d = simulate(481, **world)
    everyone = (d.a_all + d.b) / 2
    ba, ab = estimate(d)
    rows.append({"слои": name if name == "без помех" else "+ " + name,
                 "до, %": everyone[BEFORE].sum() / d.visits[BEFORE].sum() * 100,
                 "после, %": everyone[AFTER].sum() / d.visits[AFTER].sum() * 100,
                 "до и после, %": ba * 100, "A/B, %": ab * 100,
                 "ошибка д/п": (ba - LIFT) * 100, "ошибка A/B": (ab - LIFT) * 100})
print(pd.DataFrame(rows).set_index("слои").round(2).to_string())

# ===== Тысяча прогонов: «до и после» против A/B =====
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
