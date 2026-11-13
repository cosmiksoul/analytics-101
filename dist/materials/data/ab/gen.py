"""Учебные данные для темы 11 «A/B-тестирование». seed 1111.
Тот же интернет-магазин, осень 2026: три эксперимента на одной базе пользователей.
- aa_check      — A/A-тест, 24 августа — 6 сентября: проверка системы, эффекта нет.
- checkout_v2   — основной тест, 7 сентября — 4 октября (4 полные недели): новое оформление заказа.
                  Истинный эффект на конверсию сессии +4% (относительно) навсегда и ещё +20%, которые
                  угасают с постоянной 5 дней у каждого пользователя (эффект новизны).
- reco_block    — 5–18 октября: блок рекомендаций. Истинного эффекта нет, но в группе B на старых
                  версиях Android показ не логируется, если человек ушёл, ничего не купив, —
                  отсюда дисбаланс групп (SRM) и ложный «выигрыш» B.
Группа = md5(соль:user_id) — первые 8 hex-символов как число, остаток от деления на 100 < 50 → A, иначе B.
Предпериод для CUPED — 4 недели до основного теста (10 августа — 6 сентября).
"""
import numpy as np, pandas as pd, pathlib, hashlib

rng = np.random.default_rng(1111)
P = pathlib.Path(__file__).parent
D0 = pd.Timestamp("2026-08-10")                   # начало данных
ND = 70                                           # до 18 октября включительно
days = pd.date_range(D0, periods=ND, freq="D")
EXPS = {
    "aa_check":    dict(start=pd.Timestamp("2026-08-24"), end=pd.Timestamp("2026-09-07"), salt="aa-0824-7"),
    "checkout_v2": dict(start=pd.Timestamp("2026-09-07"), end=pd.Timestamp("2026-10-05"), salt="chk-0907-3"),
    "reco_block":  dict(start=pd.Timestamp("2026-10-05"), end=pd.Timestamp("2026-10-19"), salt="reco-1005"),
}
PRE = (pd.Timestamp("2026-08-10"), pd.Timestamp("2026-09-07"))


def group_of(salt, uid):
    h = int(hashlib.md5(f"{salt}:{uid}".encode()).hexdigest()[:8], 16)
    return "A" if h % 100 < 50 else "B"


# ---------- пользователи ----------
N_OLD = 60000
N_NEW = int(rng.poisson(380 * ND))
N = N_OLD + N_NEW
signup_day = np.concatenate([-rng.integers(1, 700, N_OLD), np.sort(rng.integers(0, ND, N_NEW))])  # день относительно D0
order = np.argsort(signup_day, kind="stable")
signup_day = signup_day[order]
uid = np.array([f"u_{i + 1:06d}" for i in range(N)])
platform = rng.choice(["android", "ios", "web"], N, p=[0.45, 0.25, 0.30])
android_old = (platform == "android") & (rng.random(N) < 0.25)       # версия приложения до 3.2
country = rng.choice(["BY", "RU", "KZ", "UZ"], N, p=[0.40, 0.33, 0.17, 0.10])
lam = rng.gamma(0.5, 0.12 / 0.5, N)                                    # сессий в день, в среднем 0,12
p_conv = np.clip(rng.beta(0.7, 18, N), 0, 0.6)                          # конверсия сессии, в среднем ≈ 0,037
whole = rng.random(N) < 0.012                                          # оптовики
p_conv = np.where(whole, np.clip(p_conv * 2.5, 0, 0.6), p_conv)          # оптовики покупают регулярно
aov_mu = np.where(whole, np.log(25000), np.log(3000)) + rng.normal(0, 0.3, N)
signup_date = (D0 + pd.to_timedelta(signup_day, unit="D")).date

# ---------- сессии по дням ----------
wd = days.dayofweek.values
w_sess = np.where(wd >= 5, 1.20, 1.0)
w_conv = np.where(wd >= 5, 0.95, 1.0)
rows = []
sid = 0
HOURS = np.arange(24)
hw = np.array([.2, .1, .05, .05, .05, .1, .4, 1, 1.6, 1.4, 1, 1, 1.5, 1.5, 1.1, 1, 1, 1.2, 1.6, 2.2, 2.6, 2.6, 2, 1]); hw /= hw.sum()
for d in range(ND):
    alive = signup_day <= d
    age = d - signup_day
    rate = lam * w_sess[d] * (1 + 2.0 * np.exp(-np.clip(age, 0, None) / 7.0))
    k = np.where(alive, rng.poisson(rate), 0)
    k = np.where(signup_day == d, np.maximum(k, 1), k)                 # в день регистрации заходят всегда
    idx = np.repeat(np.arange(N), k)
    if len(idx) == 0:
        continue
    hours = rng.choice(HOURS, len(idx), p=hw)
    secs = rng.integers(0, 3600, len(idx))
    t = days[d] + pd.to_timedelta(hours - 3, unit="h") + pd.to_timedelta(secs, unit="s")   # Минск → UTC
    u = rng.random(len(idx))
    for j, i in enumerate(idx):
        sid += 1
        rows.append((i, d, t[j], u[j]))

S = pd.DataFrame(rows, columns=["u", "d", "t", "rnd"])
S["session_id"] = [f"s_{i:07d}" for i in range(1, len(S) + 1)]
print("сессий всего", len(S))

# боты-«парсеры» с аккаунтами: много сессий в основном тесте, без покупок
bots = rng.choice(np.where(signup_day < 0)[0], 3, replace=False)
bot_rows = []
for b in bots:
    for d in range(28, 56):
        for _ in range(int(rng.integers(8, 22))):
            bot_rows.append((b, d, days[d] + pd.Timedelta(seconds=int(rng.integers(0, 86400))), 1.0))
B = pd.DataFrame(bot_rows, columns=["u", "d", "t", "rnd"])
B["session_id"] = [f"s_{i:07d}" for i in range(len(S) + 1, len(S) + len(B) + 1)]
S = pd.concat([S, B], ignore_index=True).sort_values("t", kind="stable").reset_index(drop=True)
is_bot = np.isin(S.u.values, bots)

# ---------- эксперименты: показ, группа, эффект ----------
S["exp"] = None
for name, e in EXPS.items():
    m = (S.t >= e["start"] - pd.Timedelta(hours=3)) & (S.t < e["end"] - pd.Timedelta(hours=3))
    S.loc[m, "exp"] = name
grp = {name: np.array([group_of(e["salt"], x) for x in uid]) for name, e in EXPS.items()}
S["group"] = [grp[x][u] if x else None for x, u in zip(S.exp, S.u)]
first_exp = S[S.exp.notna()].groupby(["exp", "u"]).t.transform("min")
S.loc[S.exp.notna(), "exposed_at"] = first_exp
days_since = ((S.t - S.exposed_at).dt.total_seconds() / 86400).fillna(0).values

# конверсия сессии
p = p_conv[S.u.values] * w_conv[S.d.values]
in_b_chk = (S.exp.values == "checkout_v2") & (S.group.values == "B")
uplift = np.where(in_b_chk, 1.04 + 0.20 * np.exp(-days_since / 5.0), 1.0)
p = np.clip(p * uplift, 0, 0.95)
conv = (S.rnd.values < p) & ~is_bot
n_ord = np.where(conv, 1 + (rng.random(len(S)) < np.where(whole[S.u.values], 0.35, 0.05)), 0)
rev = np.zeros(len(S))
for kk in (1, 2):
    m = n_ord >= kk
    rev[m] += np.maximum(300, np.round(rng.lognormal(aov_mu[S.u.values[m]], 0.55), -1))
S["orders"] = n_ord
S["revenue"] = rev.astype(int)
S["converted"] = (n_ord > 0).astype(int)

# 1% пользователей основного теста видят обе версии: до входа устройство попало в другую группу
chk_users = S.loc[S.exp == "checkout_v2", "u"].unique()
mixed = rng.choice(chk_users, int(0.01 * len(chk_users)), replace=False)
mm = (S.exp == "checkout_v2") & S.u.isin(mixed) & (rng.random(len(S)) < 0.3)
S.loc[mm, "group"] = S.loc[mm, "group"].map({"A": "B", "B": "A"})

# баг логирования в reco_block: старый Android в группе B — показ теряется, если сессия без покупки
bug = (S.exp == "reco_block") & (S.group == "B") & android_old[S.u.values] & (S.converted == 0) & (rng.random(len(S)) < 0.55)
S.loc[bug, "exp"] = None

# ---------- выгрузки ----------
E = S[S.exp.notna()].copy()
E["user_id"] = uid[E.u.values]
E["exposed_at"] = E.groupby(["exp", "user_id"]).t.transform("min")
exposures = (E.sort_values("t").drop_duplicates(["exp", "user_id"])[["exp", "user_id", "group", "t"]]
             .rename(columns={"exp": "experiment", "t": "exposed_at"}))
exposures["group"] = [grp[x][int(u[2:]) - 1] for x, u in zip(exposures.experiment, exposures.user_id)]   # группа по хешу
sessions = E[["exp", "user_id", "group", "session_id", "t", "converted", "orders", "revenue"]].rename(
    columns={"exp": "experiment", "t": "session_start"})
pre = S[(S.t >= PRE[0] - pd.Timedelta(hours=3)) & (S.t < PRE[1] - pd.Timedelta(hours=3))]
pre_agg = pre.groupby("u").agg(sessions_pre=("session_id", "count"), orders_pre=("orders", "sum"), revenue_pre=("revenue", "sum")).reset_index()
pre_agg.insert(0, "user_id", uid[pre_agg.u.values]); pre_agg = pre_agg.drop(columns="u")
users = pd.DataFrame({"user_id": uid, "signup_date": signup_date, "platform": platform,
                      "app_version": np.where(platform == "web", "", np.where(android_old, "3.1.4", "3.3.0")), "country": country})

for df, c in [(exposures, "exposed_at"), (sessions, "session_start")]:
    df[c] = pd.to_datetime(df[c]).dt.floor("s").dt.tz_localize("UTC")
users.to_csv(P / "users.csv", index=False)
exposures.sort_values(["experiment", "exposed_at"]).to_csv(P / "exposures.csv", index=False)
sessions = sessions.sort_values(["experiment", "session_start", "session_id"])
sessions.to_parquet(P / "sessions.parquet", index=False)
sessions.assign(session_start=sessions.session_start.dt.strftime("%Y-%m-%dT%H:%M:%SZ")).to_csv(P / "sessions.csv.gz", index=False)
pre_agg.to_csv(P / "pre_period.csv", index=False)
print("пользователей", N, "показов", len(exposures), "сессий в тестах", len(sessions), "предпериод", len(pre_agg))
print(exposures.groupby(["experiment", "group"]).size().unstack())
print("боты:", list(uid[bots]))
