"""Данные сцены, интерактива и чисел текста страницы 11.3 «Анализ: тесты, интервалы, ratio-метрики».

Запуск:  python3 pages/da-11-3/data/gen_page.py        (≈ 2 минуты: симуляции A/A)
Данные — учебная выгрузка темы 11 data/ab (seed 1111, README там же). Соглашения страницы:
- единица анализа — пользователь; группа — из exposures.csv (по хешу), а не из столбца group сессии;
- боты — больше 200 сессий и ни одного заказа (u_025389, u_053191, u_055948), исключаются;
- «конверсия» — доля пользователей хотя бы с одной покупкой в тесте, «выручка» — сумма revenue на человека;
- «конверсия сессий» — сумма converted / число сессий в группе (ratio-метрика);
- интервалы — нормальное приближение, 95%; интервал относительного эффекта — дельта-метод.
Интерактив «Сессии против пользователей» — симуляция A/A-тестов: 28 400 человек в группе, у каждого ровно k сессий,
склонность к покупке p_i ~ Beta(a, b), подобранная по checkout_v2 методом максимального правдоподобия
(бета-биномиальная модель), или одна и та же у всех. 2 000 прогонов на каждое k, первые 100 — в страницу.
Пишет DATA в page.js между /*data:start*/ и /*data:end*/ и numbers.json с числами текста. Повторный запуск даёт тот же файл.
"""
import json, re
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import optimize, stats

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
D = PAGE.parents[1] / "data" / "ab"
Z = stats.norm.ppf(0.975)

S = pd.read_parquet(D / "sessions.parquet")
E = pd.read_csv(D / "exposures.csv")
U = pd.read_csv(D / "users.csv", dtype={"app_version": str}, keep_default_na=False).set_index("user_id")


def per_user(exp, drop_bots=True):
    s = S[S.experiment == exp]
    u = (s.groupby("user_id").agg(n=("session_id", "size"), conv=("converted", "sum"),
                                  orders=("orders", "sum"), rev=("revenue", "sum"))
         .join(E[E.experiment == exp].set_index("user_id").group))
    bots = u[(u.n > 200) & (u.orders == 0)]
    if drop_bots:
        u = u.drop(bots.index)
    u["buyer"] = (u.orders > 0).astype(int)
    return u, bots


def mean_eff(u, col):
    """Разница средних B − A, интервал, относительный эффект с интервалом по дельта-методу, p Уэлча."""
    a, b = u.loc[u.group == "A", col].astype(float), u.loc[u.group == "B", col].astype(float)
    ma, mb, va, vb = a.mean(), b.mean(), a.var() / len(a), b.var() / len(b)
    d, se = mb - ma, np.sqrt(va + vb)
    rel = mb / ma - 1
    se_rel = (mb / ma) * np.sqrt(va / ma ** 2 + vb / mb ** 2)
    return dict(na=len(a), nb=len(b), ma=ma, mb=mb, lo_a=ma - Z * np.sqrt(va), hi_a=ma + Z * np.sqrt(va),
                lo_b=mb - Z * np.sqrt(vb), hi_b=mb + Z * np.sqrt(vb), d=d, se=se, lo=d - Z * se, hi=d + Z * se,
                z=d / se, p=stats.ttest_ind(b, a, equal_var=False).pvalue, rel=rel,
                rlo=rel - Z * se_rel, rhi=rel + Z * se_rel)


def ratio_var(X, Y):
    """Отношение сумм ΣX/ΣY и его дисперсия по дельта-методу (единица — строка X, Y)."""
    X, Y = np.asarray(X, float), np.asarray(Y, float)
    n, r = len(X), X.sum() / Y.sum()
    v = (X.var(ddof=1) - 2 * r * np.cov(X, Y)[0, 1] + r ** 2 * Y.var(ddof=1)) / (n * Y.mean() ** 2)
    return r, v


def ratio_eff(u, num, den):
    (ra, va), (rb, vb) = (ratio_var(u.loc[u.group == g, num], u.loc[u.group == g, den]) for g in "AB")
    return ra, rb, rb - ra, np.sqrt(va + vb)


out, num = {}, {}
# ---------------------------------------------------------------- checkout_v2
s = S[S.experiment == "checkout_v2"]
x = E[E.experiment == "checkout_v2"]
u_all, bots = per_user("checkout_v2", drop_bots=False)
u, _ = per_user("checkout_v2")
nexp = x.group.value_counts().sort_index()
srm = stats.chisquare(nexp.to_numpy())
labels = s.groupby("user_id").group.nunique()
mixed = labels[labels > 1].index
num["log"] = dict(sessions=len(s), users=int(s.user_id.nunique()), bots=len(bots),
                  bot_sessions=[int(bots.n.min()), int(bots.n.max())], bot_total=int(bots.n.sum()),
                  bot_groups=bots.group.value_counts().to_dict(), mixed=len(mixed),
                  mixed_groups=u.loc[mixed].group.value_counts().to_dict(),
                  users_clean=len(u), clean_groups=u.group.value_counts().to_dict(),
                  mean_sess=round(u.n.mean(), 2), max_sess=int(u.n.max()))
num["srm_chk"] = dict(A=int(nexp.A), B=int(nexp.B), shareB=nexp.B / nexp.sum(), chi2=srm.statistic, p=srm.pvalue)
conv = mean_eff(u, "buyer")
rev = mean_eff(u, "rev")
num["conv"], num["rev"] = conv, rev
ra, rb, dr, se_d = ratio_eff(u, "conv", "n")
sa, sb = u[u.group == "A"].n.sum(), u[u.group == "B"].n.sum()
se_n = np.sqrt(ra * (1 - ra) / sa + rb * (1 - rb) / sb)
num["sess"] = dict(ra=ra, rb=rb, d=dr, se_naive=se_n, se_delta=se_d, ratio=se_d / se_n, sa=int(sa), sb=int(sb),
                   z_naive=dr / se_n, z_delta=dr / se_d, rel=rb / ra - 1)

# неоднородность людей: бета-биномиальная модель по всем пользователям теста
k_all, x_all = u.n.to_numpy(), u.conv.to_numpy()
nll = lambda th: -stats.betabinom.logpmf(x_all, k_all, np.exp(th[0]), np.exp(th[1])).sum()
th = optimize.minimize(nll, [np.log(0.7), np.log(18)], method="Nelder-Mead", options=dict(xatol=1e-8, fatol=1e-8)).x
A_, B_ = np.exp(th)
rho, pbar = 1 / (A_ + B_ + 1), A_ / (A_ + B_)
kstar = (k_all ** 2).sum() / k_all.sum()
num["icc"] = dict(a=A_, b=B_, rho=rho, p=pbar, kstar=kstar, ratio_formula=np.sqrt(1 + rho * (kstar - 1)),
                  share_one=(k_all == 1).mean(), median_k=float(np.median(k_all)),
                  k_double=1 + 3 / rho, ratio_at50=np.sqrt(1 + rho * 49))

# A/A на настоящих людях группы A: делим их пополам 2 000 раз
a_users = u[u.group == "A"]
X, K = a_users.conv.to_numpy(float), a_users.n.to_numpy(float)
rng = np.random.default_rng(1103)
zn, zd = [], []
for _ in range(2000):
    m = rng.random(len(X)) < 0.5
    (r1, v1), (r2, v2) = ratio_var(X[m], K[m]), ratio_var(X[~m], K[~m])
    nv = r1 * (1 - r1) / K[m].sum() + r2 * (1 - r2) / K[~m].sum()
    zn.append((r2 - r1) / np.sqrt(nv)); zd.append((r2 - r1) / np.sqrt(v1 + v2))
num["aa_real"] = dict(runs=2000, users=len(X), fpr_naive=float(np.mean(np.abs(zn) > Z)),
                      fpr_delta=float(np.mean(np.abs(zd) > Z)))

# средний чек: выручка / заказы, наивно по сессиям и честно по пользователям
sc = s[~s.user_id.isin(bots.index)].drop(columns="group").merge(x[["user_id", "group"]], on="user_id")
aov_s = [ratio_var(sc.loc[sc.group == g, "revenue"], sc.loc[sc.group == g, "orders"]) for g in "AB"]
aa, ab, dd, se_u = ratio_eff(u, "rev", "orders")
num["aov"] = dict(a=aa, b=ab, d=dd, se_users=se_u, se_sessions=np.sqrt(aov_s[0][1] + aov_s[1][1]),
                  ratio=se_u / np.sqrt(aov_s[0][1] + aov_s[1][1]), orders_a=int(u[u.group == "A"].orders.sum()),
                  orders_b=int(u[u.group == "B"].orders.sum()))

# варианты: с ботами, по группе из сессии, без «двойников»
ub = u_all.copy(); ub["buyer"] = (ub.orders > 0).astype(int)
r_b = ratio_eff(ub, "conv", "n")
sb_ = ub[ub.group == "B"].n.sum(); sa_ = ub[ub.group == "A"].n.sum()
num["with_bots"] = dict(conv_d=mean_eff(ub, "buyer")["d"], sess_rb=r_b[1], sess_d=r_b[2], se_delta=r_b[3],
                        ratio=r_b[3] / np.sqrt(r_b[0] * (1 - r_b[0]) / sa_ + r_b[1] * (1 - r_b[1]) / sb_),
                        bot_share_sess=int(bots.n.sum()) / len(s))
lab = (s[~s.user_id.isin(bots.index)].groupby(["user_id", "group"])
       .agg(orders=("orders", "sum")).reset_index())
lab["buyer"] = (lab.orders > 0).astype(int)
lab_e = mean_eff(lab, "buyer")
um = u.drop(index=mixed)
mm = s[s.user_id.isin(mixed)].merge(x[["user_id", "group"]].rename(columns={"group": "g0"}), on="user_id")
num["mixed"] = dict(rows=len(lab), label_d=lab_e["d"], label_lo=lab_e["lo"], label_hi=lab_e["hi"],
                    drop_d=mean_eff(um, "buyer")["d"], drop_n=len(um),
                    buyer_mixed=u.loc[mixed].buyer.mean(), buyer_all=u.buyer.mean(),
                    sess_mixed=u.loc[mixed].n.mean(), wrong_share=float((mm.group != mm.g0).mean()))

# тяжёлый хвост и обрезка по 99-му процентилю (бутстрэп выручки — в коде страницы, data/code/boot.py)
cap = u.rev.quantile(0.99)
w = mean_eff(u.assign(rev=u.rev.clip(upper=cap)), "rev")
top = u.rev.sort_values(ascending=False)
num["tail"] = dict(cv=u[u.group == "A"].rev.std() / u[u.group == "A"].rev.mean(), zero=(u.rev == 0).mean(),
                   top1=top.head(int(len(u) * 0.01)).sum() / u.rev.sum(), cap=cap, w=w)

# сегменты после факта: платформы и страны
seg = []
for col in ("platform", "country"):
    for v, g in u.join(U).groupby(col):
        e_ = mean_eff(g, "buyer")
        seg.append(dict(col=col, v=v, n=len(g), d=e_["d"], lo=e_["lo"], hi=e_["hi"], p=e_["p"]))
num["segments"] = seg
uu = u.join(U)
r_ = pd.DataFrame([(p, mean_eff(g, "buyer")["d"], mean_eff(g, "buyer")["se"]) for p, g in uu.groupby("platform")],
                  columns=["p", "d", "se"])
wq = 1 / r_.se ** 2
Q = (wq * (r_.d - (wq * r_.d).sum() / wq.sum()) ** 2).sum()
num["seg_q"] = dict(Q=Q, p=stats.chi2.sf(Q, len(r_) - 1))

# ограничения: регрессия покупки в сессии на признак группы — обычная и кластеризованная по пользователю ошибка
import statsmodels.formula.api as smf
sc["b"] = (sc.group == "B").astype(int)
ols = smf.ols("converted ~ b", data=sc)
num["ols"] = dict(coef=ols.fit().params["b"], se_plain=ols.fit().bse["b"],
                  se_cluster=ols.fit(cov_type="cluster", cov_kwds={"groups": pd.factorize(sc.user_id)[0]}).bse["b"])

# новизна (для оговорки в отчёте): прирост конверсии сессий B к A по дням с показа
sn = sc.merge(x[["user_id", "exposed_at"]], on="user_id")
sn["days"] = (sn.session_start - pd.to_datetime(sn.exposed_at)).dt.total_seconds() / 86400
sn["bin"] = pd.cut(sn.days, [0, 3, 7, 14, 28.5], labels=["0-2", "3-6", "7-13", "14-27"], right=False)
t = sn.groupby(["bin", "group"], observed=True).converted.mean().unstack()
num["novelty"] = (t.B / t.A - 1).round(4).to_dict()

# ---------------------------------------------------------------- reco_block: SRM и поиск сегмента
ur, _ = per_user("reco_block")
nr = E[E.experiment == "reco_block"].group.value_counts().sort_index()
ur = ur.join(U)
ur["seg"] = np.where(ur.app_version == "3.1.4", "Android 3.1.4", np.where(ur.platform == "android", "Android 3.3.0", ur.platform))
segs = []
for v in ["Android 3.1.4", "Android 3.3.0", "ios", "web"]:
    g = ur[ur.seg == v]; c = g.group.value_counts().reindex(["A", "B"])
    segs.append(dict(v=v, A=int(c.A), B=int(c.B), shareB=c.B / c.sum(), p=stats.chisquare(c.to_numpy()).pvalue,
                     ca=g[g.group == "A"].buyer.mean(), cb=g[g.group == "B"].buyer.mean()))
rest = ur[ur.seg != "Android 3.1.4"]
cr = rest.group.value_counts().sort_index()
num["reco"] = dict(A=int(nr.A), B=int(nr.B), shareA=nr.A / nr.sum(), shareB=nr.B / nr.sum(),
                   p=stats.chisquare(nr.to_numpy()).pvalue, conv=mean_eff(ur, "buyer"), segs=segs,
                   rest=mean_eff(rest, "buyer"), rest_A=int(cr.A), rest_B=int(cr.B),
                   rest_p=stats.chisquare(cr.to_numpy()).pvalue,
                   android=dict(zip(["A", "B"], ur[ur.platform == "android"].group.value_counts().sort_index().tolist())))
n508 = 48186
num["q508"] = dict(n=n508, z=(0.508 - 0.5) / np.sqrt(0.25 / n508), p=2 * stats.norm.sf((0.508 - 0.5) / np.sqrt(0.25 / n508)))

# ---------------------------------------------------------------- сцена: несколько строк лога
first = s.groupby("user_id").session_start.min()
day1 = first[first < pd.Timestamp("2026-09-07 21:00", tz="UTC")].index
pick = []
for want in [("A", 3, 1), ("B", 4, 0), ("B", 2, 1), ("A", 1, 0)]:
    cand = u.loc[u.index.isin(day1) & (u.group == want[0]) & (u.n == want[1]) & (u.buyer == want[2]) & ~u.index.isin(mixed)]
    cand = cand[(cand.orders <= 1) & ((cand.rev == 0) | cand.rev.between(1500, 6000))]
    pick.append(sorted(cand.index)[0])
lg = s[s.user_id.isin(pick)].sort_values("session_start")
log = [[r.user_id, r.group, (r.session_start.tz_convert("Europe/Minsk")).strftime("%d.%m %H:%M"), int(r.converted), int(r.revenue)]
       for r in lg.itertuples()]
users_tbl = [[p, u.loc[p, "group"], int(u.loc[p, "n"]), int(u.loc[p, "buyer"]), int(u.loc[p, "rev"])] for p in pick]
mx = sorted(mixed)[0]
mrow = s[s.user_id == mx].group.value_counts().sort_index()
scene = dict(log=log, utab=users_tbl,
             bots=[[b, bots.loc[b, "group"], int(bots.loc[b, "n"])] for b in sorted(bots.index, key=lambda b: -bots.loc[b, "n"])],
             mixed=[mx, x.set_index("user_id").group[mx], int(mrow.get("A", 0)), int(mrow.get("B", 0))])

# ---------------------------------------------------------------- интерактив: A/A с k сессиями на человека
N = 28400
KS = [1, 2, 3, 5, 8, 12, 20, 30, 50]
LEVELS = {"data": (A_, B_), "same": None}
sim = {}
rng = np.random.default_rng(1133)
for lev, ab in LEVELS.items():
    for k in KS:
        R = 2000
        d_all, sn_all, sh_all = np.empty(R), np.empty(R), np.empty(R)
        for c0 in range(0, R, 50):
            c1 = min(R, c0 + 50); m = c1 - c0
            p = rng.beta(*ab, size=(m, 2, N)) if ab else np.full((m, 2, N), pbar)
            Xs = rng.binomial(k, p)                               # покупок у каждого человека
            r = Xs.sum(2) / (N * k)                               # конверсия сессий в группе
            vn = r * (1 - r) / (N * k)                            # наивно: сессии независимы
            vh = Xs.var(2, ddof=1) / (N * k * k)                  # честно: единица — человек (дельта-метод при равных k)
            d_all[c0:c1] = r[:, 1] - r[:, 0]
            sn_all[c0:c1] = np.sqrt(vn.sum(1)); sh_all[c0:c1] = np.sqrt(vh.sum(1))
        sen, seh = float(sn_all.mean()), float(sh_all.mean())
        show = np.round(d_all[:100] * 1e6).astype(int)            # первые 100 прогонов, единица — 1e-6
        sim[f"{lev}{k}"] = dict(se_n=round(sen * 1e6, 2), se_h=round(seh * 1e6, 2),
                                fpr_n=float(np.mean(np.abs(d_all / sn_all) > Z)), fpr_h=float(np.mean(np.abs(d_all / sh_all) > Z)),
                                d=show.tolist(),
                                cnt_n=int(np.sum(np.abs(show / 1e6) > Z * sen)), cnt_h=int(np.sum(np.abs(show / 1e6) > Z * seh)))
        print(lev, k, sim[f"{lev}{k}"]["se_n"], sim[f"{lev}{k}"]["se_h"], sim[f"{lev}{k}"]["fpr_n"], sim[f"{lev}{k}"]["fpr_h"],
              sim[f"{lev}{k}"]["cnt_n"], sim[f"{lev}{k}"]["cnt_h"])
# сверка формул для браузера: наивная ошибка √(2p(1−p)/(Nk)), честная — та же × √(1 + (k − 1)ρ)
for lev in LEVELS:
    for k in KS:
        f_n = np.sqrt(2 * pbar * (1 - pbar) / (N * k))
        f_h = f_n * np.sqrt(1 + (k - 1) * (rho if lev == "data" else 0))
        c = sim[f"{lev}{k}"]
        assert abs(c["se_n"] / 1e6 / f_n - 1) < 0.03 and abs(c["se_h"] / 1e6 / f_h - 1) < 0.03, (lev, k, c["se_n"], f_n, c["se_h"], f_h)

R4 = lambda v: round(float(v), 6)
DATA = dict(
    sc=dict(scene, sessions=num["log"]["sessions"], users=num["log"]["users"], clean=num["log"]["users_clean"],
            nA=num["srm_chk"]["A"], nB=num["srm_chk"]["B"], shareB=R4(num["srm_chk"]["shareB"]), srm_p=R4(num["srm_chk"]["p"]),
            conv=dict({k: R4(conv[k]) for k in ("ma", "mb", "lo_a", "hi_a", "lo_b", "hi_b", "d", "lo", "hi", "rel", "rlo", "rhi", "z")},
                      na=int(conv["na"]), nb=int(conv["nb"])),
            sess={k: (int(v) if k in ("sa", "sb") else R4(v)) for k, v in num["sess"].items()}, rho=R4(rho), kstar=round(float(kstar), 2),
            aa=num["aa_real"], rev={k: round(float(rev[k]), 1) for k in ("ma", "mb", "d", "lo", "hi")}),
    w=dict(N=N, p=R4(pbar), rho=R4(rho), kstar=round(float(kstar), 2), ks=KS, sim=sim))

js = PAGE / "page.js"
src = js.read_text(encoding="utf-8")
src, n = re.subn(r"/\*data:start\*/.*?/\*data:end\*/",
                 lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/",
                 src, flags=re.S)
assert n == 1, "нет меток data в page.js"
js.write_text(src, encoding="utf-8")


def clean(o):
    if isinstance(o, dict):
        return {str(k): clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [clean(v) for v in o]
    if isinstance(o, (np.floating, float)):
        return round(float(o), 6)
    if isinstance(o, np.integer):
        return int(o)
    return o


(HERE / "numbers.json").write_text(json.dumps(clean(num), ensure_ascii=False, indent=1), encoding="utf-8")
print(json.dumps(clean(num), ensure_ascii=False, indent=1))
