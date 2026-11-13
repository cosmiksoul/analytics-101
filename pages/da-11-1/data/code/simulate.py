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
