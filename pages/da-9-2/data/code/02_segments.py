import pandas as pd

MSK = "Europe/Minsk"
ev = pd.read_parquet("data/events/events.parquet")
users = pd.read_csv("data/events/users.csv", parse_dates=["signup_time"])

# соглашения темы: без дублей, без ботов, человек = аккаунт, время по Минску
ev = ev.drop_duplicates("event_id")
ev["t"] = ev.event_time.dt.tz_convert(MSK)
cl = ev[ev.origin == "client"]
per_day = cl.groupby(["anonymous_id", cl.t.dt.date]).size()
bots = per_day[per_day > 100].index.get_level_values(0).unique()
ev = ev[~ev.anonymous_id.isin(bots)]
dev = ev.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id").user_id.first()
ev["person"] = ev.user_id.fillna(ev.anonymous_id.map(dev)).fillna(ev.anonymous_id)

STEPS = ["app_open", "product_view", "add_to_cart", "checkout_start", "order_paid"]

def funnel(ev, start, window="7D"):
    """Любой порядок: человек дошёл до шага k, если в окне есть все шаги 1…k."""
    e = ev[ev.event_name.isin(STEPS)].merge(start.rename("t0"), left_on="person", right_index=True)
    e = e[(e.t >= e.t0) & (e.t <= e.t0 + pd.Timedelta(window))]
    has = (e.pivot_table(index="person", columns="event_name", values="t", aggfunc="size")
             .reindex(index=start.index, columns=STEPS).notna())
    return has.cummin(axis=1)                 # шаг засчитан, только если засчитаны все до него

first = ev[ev.event_name == "app_open"].sort_values("t").groupby("person").first()
old = users.loc[users.signup_time < pd.Timestamp("2026-01-05", tz=MSK), "user_id"]
new = first[~first.index.isin(old) & (first.t < pd.Timestamp("2026-06-22", tz=MSK))]
reach = funnel(ev, new.t)                     # окно 7 суток успело закрыться у всех

seg = pd.DataFrame({
    "канал": new.traffic_source.replace({"search": "органика", "direct": "органика", "partner": "партнёры",
                                         "ad": "реклама", "push": "прочее", "email": "прочее"}),
    "платформа": new.platform.replace({"android": "приложение", "ios": "приложение", "web": "сайт"}),
    "оплатил": reach["order_paid"]})
kw = dict(index="канал", columns="платформа", values="оплатил", margins=True, margins_name="всего")
rate = seg.pivot_table(aggfunc="mean", **kw) * 100   # доля оплативших → проценты
size = seg.pivot_table(aggfunc="count", **kw)        # сколько людей в ячейке
order = ["органика", "партнёры", "реклама", "прочее", "всего"]
print(rate.reindex(order).round(1), size.reindex(order), sep="\n\n")
