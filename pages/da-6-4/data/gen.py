"""Учебные данные страницы 6.4 «Какой тест когда». seed 604.

ab.csv      — учебный A/B-тест новой корзины: 40 000 пользователей, группа A/B, оплатил 0/1, сумма чека.
              Доля оплативших 3,4 % и 3,9 %, чеки — перевыборка из data/probability/checks.csv, в Б чек ×1,08.
scene.json  — числа и мини-гистограммы сцены: на каждом листе дерева данные, где критерий подходит и где нет;
              каждое «ложных срабатываний» — симуляция без эффекта, 10 000 повторов (у хи-квадрата при N = 3 000 — 4 000).
paired.csv  — 30 клиентов, средний чек до и после программы лояльности (рост 10 %): пример парного t-теста.
Запуск из папки страницы:  python3 data/gen.py, затем data/grid.py и data/inject.py
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
PROB = HERE.parents[2] / "data" / "probability"
CHECKS = pd.read_csv(PROB / "checks.csv").amount.to_numpy(float)
VIS = pd.read_csv(PROB / "visits.csv")
R = 10_000
rng = np.random.default_rng(604)
r4 = lambda x: round(float(x), 4)

# ---------- ab.csv ----------
n_users = 20_000
rows = []
for g, p, k in (("A", 0.034, 1.0), ("B", 0.039, 1.08)):
    paid = (rng.random(n_users) < p).astype(int)
    amount = np.where(paid == 1, np.round(rng.choice(CHECKS, n_users) * k, -1), np.nan)
    rows.append(pd.DataFrame({"group": g, "paid": paid, "amount": amount}))
ab = pd.concat(rows, ignore_index=True)
ab.insert(0, "user_id", np.arange(1, len(ab) + 1))
ab["amount"] = ab["amount"].astype("Int64")
ab.to_csv(HERE / "ab.csv", index=False)

S = {}

def hist(x, lo, hi, nb=24):
    e = np.linspace(lo, hi, nb + 1)
    return np.histogram(np.clip(x, lo, hi - 1e-9), e)[0].tolist()

# ---------- лист «t-тест Уэлча» ----------
# подходит: чеки, по 200 в группе
a = rng.choice(CHECKS, (R, 200)); b = rng.choice(CHECKS, (R, 200))
S["welch_fit"] = {"alpha": r4((stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue < .05).mean()),
                  "h": hist(a[0], 0, 16000), "n": 200}
# не подходит: те же 200 значений в группе, но это сессии 10 пользователей по 20 сессий
def sessions(reps, users, per):
    lv = rng.lognormal(np.log(3000), 0.6, (reps, users))
    return np.repeat(lv, per, axis=1) * rng.lognormal(-0.125, 0.5, (reps, users * per)), lv
a, _ = sessions(R, 10, 20); b, _ = sessions(R, 10, 20)
al_sess = (stats.ttest_ind(a, b, axis=1, equal_var=False).pvalue < .05).mean()
ua, ub = a.reshape(R, 10, 20).mean(2), b.reshape(R, 10, 20).mean(2)
al_user = (stats.ttest_ind(ua, ub, axis=1, equal_var=False).pvalue < .05).mean()
one, lv1 = sessions(1, 10, 20)
order = np.argsort(lv1[0])
S["welch_bad"] = {"alpha": r4(al_sess), "alpha_user": r4(al_user), "users": 10, "per": 20,
                  "hu": [hist(one[0].reshape(10, 20)[u], 0, 16000) for u in order]}

# ---------- лист «z-тест для долей» ----------
def ztest_alpha(n, p, reps=R):
    xa = rng.binomial(n, p, reps); xb = rng.binomial(n, p, reps)
    pp = (xa + xb) / (2 * n)
    se = np.sqrt(pp * (1 - pp) * 2 / n)
    with np.errstate(divide="ignore", invalid="ignore"):
        z = np.where(se > 0, (xb - xa) / n / se, 0.0)
    return (2 * stats.norm.sf(np.abs(z)) < .05).mean(), xa
al_big, xa_big = ztest_alpha(2000, 0.034)
al_small, xa_small = ztest_alpha(40, 0.034)
S["z_fit"] = {"alpha": r4(al_big), "n": 2000, "h": np.bincount(xa_big, minlength=110)[30:110].tolist(), "lo": 30}
S["z_bad"] = {"alpha": r4(al_small), "n": 40, "h": np.bincount(xa_small, minlength=7)[:7].tolist(),
              "zero": r4((xa_small == 0).mean())}

# ---------- лист «хи-квадрат» ----------
tab = pd.crosstab(VIS.source, VIS.bought)
chi = stats.chi2_contingency(tab)
order_src = ["органика", "реклама", "рассылка"]
S["chi_fit"] = {"obs": [int(tab.loc[s, 1]) for s in order_src], "tot": [int(tab.loc[s].sum()) for s in order_src],
                "exp": [round(float(chi.expected_freq[list(tab.index).index(s), 1]), 1) for s in order_src],
                "stat": round(float(chi.statistic), 1), "p": float(chi.pvalue), "minexp": round(float(chi.expected_freq.min()), 1)}
probs = VIS.source.value_counts(normalize=True)[order_src].to_numpy(); pbuy = VIS.bought.mean()

def chi_alpha(N, reps=R):
    hits = 0
    src = rng.choice(3, (reps, N), p=probs); buy = rng.random((reps, N)) < pbuy
    for i in range(reps):
        t = np.array([[np.sum((src[i] == j) & ~buy[i]), np.sum((src[i] == j) & buy[i])] for j in range(3)])
        if (t.sum(0) == 0).any() or (t.sum(1) == 0).any():
            continue                                      # тест не считается: пустая строка или столбец
        hits += stats.chi2_contingency(t).pvalue < .05
    return hits / reps
head = VIS.head(60)
th = pd.crosstab(head.source, head.bought).reindex(order_src)
eh = stats.chi2_contingency(th).expected_freq
S["chi_fit"]["alpha"] = r4(chi_alpha(3000, 4000))
S["chi_bad"] = {"obs": th[1].astype(int).tolist(), "tot": th.sum(axis=1).astype(int).tolist(), "exp": np.round(eh[:, 1], 2).tolist(),
                "p": round(float(stats.chi2_contingency(th).pvalue), 3), "alpha": r4(chi_alpha(60)), "N": 60}

# ---------- лист «Манн — Уитни» ----------
def upsell(x):
    """Вариант Б: заказам дороже медианы 3 080 ₽ предложили допродажу, они выросли на 30 %."""
    return np.where(x > 3080, x * 1.3, x)
a = rng.choice(CHECKS, (R, 200)); b = rng.choice(CHECKS, (R, 200))
S["mw_fit"] = {"power": r4((stats.mannwhitneyu(a, b * 1.1, axis=1).pvalue < .05).mean()),
               "power_welch": r4((stats.ttest_ind(a, b * 1.1, axis=1, equal_var=False).pvalue < .05).mean()),
               "ha": hist(a[0], 0, 16000), "hb": hist(b[0] * 1.1, 0, 16000)}
bb = upsell(b)
# P(Б > А) + ½·P(Б = А) точно: А и Б — независимые чеки из 20 000 значений checks.csv, Б после допродажи
srt, ub = np.sort(CHECKS), upsell(CHECKS)
p_sup = (np.searchsorted(srt, ub, "left").sum() + 0.5 * (np.searchsorted(srt, ub, "right") - np.searchsorted(srt, ub, "left")).sum()) / len(CHECKS) ** 2
S["mw_bad"] = {"rej": r4((stats.mannwhitneyu(a, bb, axis=1).pvalue < .05).mean()),
               "med_a": float(np.median(CHECKS)), "med_b": float(np.median(ub)), "p_sup": r4(p_sup),
               "mean_a": round(float(CHECKS.mean())), "mean_b": round(float(ub.mean())),
               "ha": hist(a[0], 0, 16000), "hb": hist(bb[0], 0, 16000)}

# ---------- парный t-тест: те же 30 клиентов, средний чек за месяц до и после, рост 10 % ----------
lv = rng.lognormal(np.log(3000), 0.6, 30)
before = np.round(lv * rng.lognormal(0, 0.12, 30), -1); after = np.round(lv * 1.10 * rng.lognormal(0, 0.12, 30), -1)
S["paired"] = {"p_welch": round(float(stats.ttest_ind(after, before, equal_var=False).pvalue), 3),
               "p_paired": round(float(stats.ttest_rel(after, before).pvalue), 4),
               "mean_b": round(float(before.mean())), "mean_a": round(float(after.mean())),
               "sd": round(float(before.std(ddof=1))), "sd_d": round(float((after - before).std(ddof=1)))}
lvR = rng.lognormal(np.log(3000), 0.6, (R, 30))
bR = lvR * rng.lognormal(0, 0.12, (R, 30)); aR = lvR * 1.10 * rng.lognormal(0, 0.12, (R, 30))
S["paired"]["pow_welch"] = r4((stats.ttest_ind(aR, bR, axis=1, equal_var=False).pvalue < .05).mean())
S["paired"]["pow_paired"] = r4((stats.ttest_rel(aR, bR, axis=1).pvalue < .05).mean())
pd.DataFrame({"client": np.arange(1, 31), "before": before.astype(int), "after": after.astype(int)}).to_csv(HERE / "paired.csv", index=False)

(HERE / "scene.json").write_text(json.dumps(S, ensure_ascii=False), encoding="utf-8")
for k, v in S.items():
    print(k, {kk: vv for kk, vv in v.items() if not isinstance(vv, list) or len(vv) < 5})
print(ab.groupby("group").agg(users=("paid", "size"), paid=("paid", "sum"), mean=("amount", "mean"), median=("amount", "median")))
