"""Данные сцены, интерактива и рисунков страницы 7.3 «Связи между переменными и вопросы к данным».

Запуск из папки страницы:  python3 data/gen.py
Читает общие учебные данные темы 07 (data/eda/clients_export.csv, data/eda/daily_metrics.csv; их не меняет),
чистит выгрузку клиентов так же, как первый блок кода страницы, считает всё pandas/SciPy
и вписывает результат в page.js между метками /*data:start*/ и /*data:end*/. Повторный запуск даёт тот же файл.
Случайность одна: выборка точек для рисования облаков (seed 703); все числа на странице посчитаны по всем строкам.
"""
import json, re
from pathlib import Path
import numpy as np, pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
EDA = PAGE.parents[1] / "data" / "eda"

# ---------- чистка: то же, что в блоке кода «pairplot» ----------
raw = pd.read_csv(EDA / "clients_export.csv")
df = (raw.dropna(subset=["client_id"])
         .drop_duplicates("client_id")
         .query("orders_q1 >= 0 and channel != '-' and spend_q1 < 1e6")
         .assign(age=lambda d: d["age"].where(d["age"] != 99),
                 check=lambda d: (d["spend_q1"] / d["orders_q1"]).where(d["orders_q1"] > 0)))
N = len(df)
CH = ["реклама", "органика", "рассылка"]          # по возрастанию среднего чека
TIERS = [1, 2, 3, 4, 5]
r2 = lambda v: round(float(v), 2)
r3 = lambda v: round(float(v), 3)


def box(s):
    s = s.dropna(); q1, md, q3 = s.quantile([.25, .5, .75]); iqr = q3 - q1
    lo = s[s >= q1 - 1.5 * iqr].min(); hi = s[s <= q3 + 1.5 * iqr].max()
    return {"n": int(len(s)), "q1": r2(q1), "md": r2(md), "q3": r3(q3), "lo": r2(lo), "hi": r2(hi), "mean": r2(s.mean())}


def groups(num, cat):
    keys = CH if cat == "channel" else TIERS
    g = {str(k): box(df.loc[df[cat] == k, num]) for k in keys}
    meds = [g[str(k)]["md"] for k in keys]
    allmed = df[num].median()
    kw = stats.kruskal(*[df.loc[df[cat] == k, num].dropna() for k in keys])
    return {"g": g, "spread": r3((max(meds) - min(meds)) / allmed), "p": float(f"{kw.pvalue:.2g}")}


def pair(x, y):
    d = df[[x, y]].dropna()
    return {"r": r3(d[x].corr(d[y])), "sp": r3(d[x].corr(d[y], method="spearman")), "n": int(len(d))}


# ---------- сцена: матрица парных графиков ----------
rng = np.random.default_rng(703)
idx = rng.choice(N, 300, replace=False)
smp = df.iloc[idx]
hist = lambda s, edges: np.histogram(s.dropna(), bins=edges)[0].tolist()
ct = pd.crosstab(df["tier"], df["channel"], normalize="columns")[CH]
scene = {
    "n": N,
    "pts": {"v": smp["visits_q1"].astype(int).tolist()[:150], "o": smp["orders_q1"].astype(int).tolist()[:150],
            "a": smp["age"].fillna(-1).astype(int).tolist()[:150]},
    "hist": {"v": hist(df["visits_q1"], np.arange(-.5, 25)), "o": hist(df["orders_q1"], np.arange(-.5, 13)),
             "a": hist(df["age"], np.arange(15, 80, 5))},
    "bars": {"channel": [int((df["channel"] == c).sum()) for c in CH], "tier": [int((df["tier"] == t).sum()) for t in TIERS]},
    "boxes": {f"{num}|{cat}": groups(num, cat)["g"] for num in ["visits_q1", "orders_q1", "age"] for cat in ["channel", "tier"]},
    "heat": [[r3(ct.loc[t, c]) for c in CH] for t in TIERS],
    "chi_p": r3(stats.chi2_contingency(pd.crosstab(df["tier"], df["channel"]))[1]),
    "r": {"vo": pair("visits_q1", "orders_q1"), "va": pair("visits_q1", "age"), "oa": pair("orders_q1", "age"),
          "vt": r3(df["visits_q1"].corr(df["tier"]))},
    "conv": r3(df["orders_q1"].sum() / df["visits_q1"].sum()),
}

# ---------- интерактив: клиенты ----------
NUM = ["visits_q1", "orders_q1", "age", "check"]
CAT = ["channel", "tier"]
pairs = {}
for i, x in enumerate(NUM):
    for y in NUM[i + 1:]:
        pairs[f"{x}|{y}"] = pair(x, y)
for num in NUM:
    for cat in CAT:
        pairs[f"{num}|{cat}"] = groups(num, cat)
pairs["channel|tier"] = {"heat": scene["heat"], "p": scene["chi_p"],
                         "dev": r3((ct.sub(df["tier"].value_counts(normalize=True).sort_index(), axis=0)).abs().max().max())}
# след хвоста в паре «заказы × чек»: без клиентов с чеком выше 12 000 ₽ (оптовики и сертификаты из 7.2)
body = df[df["check"] <= 12_000]
facts = {
    "oc_body": r3(body["orders_q1"].corr(body["check"])),
    "check_tail": int((df["check"] > 12_000).sum()),
    "n_check": int(df["check"].notna().sum()),
    "n_age": int(df["age"].notna().sum()),
    "orders_mean": {k: v["mean"] for k, v in groups("orders_q1", "channel")["g"].items()},
}
cli = {"v": smp["visits_q1"].astype(int).tolist(), "o": smp["orders_q1"].astype(int).tolist(),
       "a": smp["age"].fillna(-1).astype(int).tolist(), "c": smp["check"].fillna(-1).round(0).astype(int).tolist()}

# ---------- интерактив и рисунки: дни ----------
dm = pd.read_csv(EDA / "daily_metrics.csv", parse_dates=["date"])
cal = dm.set_index("date").asfreq("D")                     # календарь: разрыв становится NaN
cols = ["app_installs", "support_tickets", "revenue"]
lvl = dm[cols].corr()
row_diff = dm[cols].diff().corr()                           # «как есть»: разность соседних строк, через разрыв и с последним днём
cal_diff = cal[cols].iloc[:-1].diff().corr()                # по календарю и без неполного 31 марта
t = (dm["date"] - dm["date"].min()).dt.days
fits = {c: np.polyfit(t.iloc[:-1], dm[c].iloc[:-1], 1) for c in cols}       # тренд по полным дням
trend = {c: {"r": r3(dm[c].iloc[:-1].corr(t.iloc[:-1])), "slope": r3(fits[c][0]), "icpt": r2(fits[c][1])} for c in cols}
wd = dm["date"].dt.dayofweek.iloc[:-1]
prof = (dm["revenue"].iloc[:-1].groupby(wd).mean() / dm["revenue"].iloc[:-1].mean()).round(3).tolist()
last = dm.iloc[-1]
same_wd = dm.loc[dm["date"].dt.dayofweek == last["date"].dayofweek, "revenue"].iloc[-5:-1].median()
mon = dm.groupby(dm["date"].dt.month)["revenue"].agg(["sum", "size", "mean"])
days = {
    "d": dm["date"].dt.strftime("%m-%d").tolist(),
    "i": dm["app_installs"].astype(int).tolist(), "s": dm["support_tickets"].astype(int).tolist(),
    "rv": (dm["revenue"] / 1000).round(1).tolist(),
    "gap": cal.index[cal["revenue"].isna()].strftime("%m-%d").tolist(),
    "lvl": {"is": r3(lvl.loc["app_installs", "support_tickets"]), "ir": r3(lvl.loc["app_installs", "revenue"]), "sr": r3(lvl.loc["support_tickets", "revenue"])},
    "rowd": {"is": r3(row_diff.loc["app_installs", "support_tickets"]), "ir": r3(row_diff.loc["app_installs", "revenue"]), "sr": r3(row_diff.loc["support_tickets", "revenue"])},
    "cald": {"is": r3(cal_diff.loc["app_installs", "support_tickets"]), "ir": r3(cal_diff.loc["app_installs", "revenue"]), "sr": r3(cal_diff.loc["support_tickets", "revenue"])},
    "trend": trend, "prof": prof,
    "last": {"rv": r2(last["revenue"] / 1000), "ratio": r3(last["revenue"] / same_wd), "dod": r3(last["revenue"] / dm["revenue"].iloc[-2] - 1)},
    "mon": {"sum": [r2(v / 1e6) for v in mon["sum"]], "n": mon["size"].astype(int).tolist(), "mean": [r2(v / 1000) for v in mon["mean"]]},
}

# ---------- рисунок под первым блоком кода: Пирсон и Спирмен ----------
M = ["visits_q1", "orders_q1", "age", "check", "tier"]
heat = {"cols": M, "p": df[M].corr().round(2).values.tolist(), "s": df[M].corr(method="spearman").round(2).values.tolist()}

# ---------- проверка здравого смысла ----------
sanity = {"days_cal": int(len(cal)), "days_file": int(len(dm)), "orders_gt_visits": int((df["orders_q1"] > df["visits_q1"]).sum()),
          "spend_no_orders": int(((df["spend_q1"] > 0) & (df["orders_q1"] == 0)).sum()),
          "spend_sum": r2(df["spend_q1"].sum() / 1e6), "rev_sum": r2(dm["revenue"].sum() / 1e6)}

DATA = {"scene": scene, "cli": cli, "pairs": pairs, "facts": facts, "days": days, "heat": heat, "sanity": sanity, "ch": CH}

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
blob = "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/"
s2 = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: blob, s, flags=re.S)
js.write_text(s2, encoding="utf-8")
print("клиентов после чистки:", N, "| с чеком:", facts["n_check"])
print("scene r:", scene["r"], "conv", scene["conv"], "chi p", scene["chi_p"])
for k, v in pairs.items():
    if "r" in v: print(f"{k:24s} r={v['r']:+.3f} sp={v['sp']:+.3f} n={v['n']}")
    elif "g" in v: print(f"{k:24s} медианы={[g['md'] for g in v['g'].values()]} разброс={v['spread']} p={v['p']}")
    else: print(k, "макс. отклонение доли", v["dev"], "p", v["p"])
print("facts", facts)
print("days lvl", days["lvl"], "rowd", days["rowd"], "cald", days["cald"])
print("trend", trend, "prof", prof)
print("last", days["last"], "mon", days["mon"], "gap", days["gap"])
print("heat", heat)
print("sanity", sanity)
print("page.js обновлён" if s2 != s or blob in s else "метки не найдены")
