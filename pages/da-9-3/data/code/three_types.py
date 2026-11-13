import pandas as pd

START, LAST = pd.Timestamp("2026-01-05"), pd.Timestamp("2026-06-28")
minsk_day = lambda s: s.dt.tz_convert("Europe/Minsk").dt.tz_localize(None).dt.normalize()

# таблица «пользователь — день», как в 9.1: без дублей, без ботов, склейка, минский день
ev = pd.read_parquet("data/events/events.parquet").drop_duplicates("event_id")
ev["day"] = minsk_day(ev["event_time"])
per_day = ev[ev["origin"] == "client"].groupby(["anonymous_id", "day"]).size()
bots = per_day[per_day > 100].index.get_level_values("anonymous_id").unique()
ev = ev[~ev["anonymous_id"].isin(bots)]
account = ev.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id")["user_id"].first()
ev["person"] = ev["user_id"].fillna(ev["anonymous_id"].map(account)).fillna(ev["anonymous_id"])
ud = ev.loc[ev["day"].between(START, LAST), ["person", "day"]].drop_duplicates()

# когорта — неделя прихода (первый день или регистрация, что раньше); старые аккаунты — не новички
users = pd.read_csv("data/events/users.csv", parse_dates=["signup_time"]).set_index("user_id")
first = ud.groupby("person")["day"].min()
arrived = pd.concat([first, minsk_day(users["signup_time"]).reindex(first.index)], axis=1).min(axis=1)
week = lambda d: (d - START).dt.days // 7               # 0 = неделя 5 января
cohort = week(arrived[arrived >= START])
size = cohort.value_counts().sort_index()

act = ud[ud["person"].isin(cohort.index)].assign(c=lambda d: d["person"].map(cohort))
act["n"] = week(act["day"]) - act["c"]
act = act[act["n"] >= 1].drop_duplicates(["person", "n"])  # неделя 0 — сам приход

N = range(1, 25)
classic = act.groupby(["c", "n"])["person"].nunique().unstack(fill_value=0).reindex(columns=N, fill_value=0)
per_person = act.groupby("person")["n"].agg(["min", "max"]).join(cohort.rename("c"))
by_last = pd.crosstab(per_person["c"], per_person["max"]).reindex(columns=N, fill_value=0)
by_first = pd.crosstab(per_person["c"], per_person["min"]).reindex(columns=N, fill_value=0)
rolling = by_last.loc[:, ::-1].cumsum(axis=1).loc[:, ::-1]   # активен в неделю n или позже
returned = by_first.cumsum(axis=1)                            # хотя бы раз за недели 1…n

lived = pd.DataFrame({n: size.index + n <= 24 for n in N}, index=size.index)  # неделя n уже прошла
share = lambda m: (100 * m.div(size, axis=0)).where(lived).round(1).rename_axis(columns="n")
types = {"классическое": share(classic), "скользящее": share(rolling), "возвратное": share(returned)}

rows = [10, 13, 21]                                       # 16 марта, 6 апреля, 1 июня
for name, m in types.items():
    print(f"{name}, % когорты:")
    print(m.loc[rows, 1:7].set_axis([f"{START + pd.Timedelta(weeks=c):%d.%m}" for c in rows]).to_string(), "\n")

hero = act.loc[act["person"] == "u_03753", "n"].tolist()
print("u_03753 возвращался в недели", hero)
print("n:          ", *range(1, 9))
print("классическое", *[int(n in hero) for n in range(1, 9)])
print("скользящее  ", *[int(max(hero) >= n) for n in range(1, 9)])
print("возвратное  ", *[int(min(hero) <= n) for n in range(1, 9)])
