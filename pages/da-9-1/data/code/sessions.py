import pandas as pd

ev = pd.read_parquet("data/events/events.parquet")  # сырой журнал, время в UTC

# 1. Очищенный слой: без дублей event_id, без ботов, день по Минску
ev = ev.drop_duplicates("event_id")
ev["day"] = ev["event_time"].dt.tz_convert("Europe/Minsk").dt.date
client = ev[ev["origin"] == "client"]
per_day = client.groupby(["anonymous_id", "day"]).size()
bots = per_day[per_day > 100].index.get_level_values("anonymous_id").unique()
ev = ev[~ev["anonymous_id"].isin(bots)]
print("строк:", len(ev), "| ботов:", len(bots))

# 2. Сессии: пауза длиннее порога на том же устройстве начинает новую
def sessionize(ev, minutes):
    c = (ev[ev["origin"] == "client"]
         .sort_values(["anonymous_id", "event_time", "event_id"]))
    gap = c.groupby("anonymous_id")["event_time"].diff()          # как LAG
    is_new = gap.isna() | (gap > pd.Timedelta(minutes=minutes))
    session_no = is_new.groupby(c["anonymous_id"]).cumsum()      # как SUM() OVER
    return c.assign(gap=gap, is_new=is_new, session_no=session_no)

for m in (30, 5):
    s = sessionize(ev, m)
    print(f"порог {m:>2} мин: устройств {s['anonymous_id'].nunique()}, "
          f"сессий {s['is_new'].sum()}")

hero = sessionize(ev, 30).query("anonymous_id in ['d_f6f77955', 'd_398d33df']")
hero = hero[hero["event_time"] >= "2026-05-12 00:00+03:00"]
minsk = hero["event_time"].dt.tz_convert("Europe/Minsk").dt.strftime("%d.%m %H:%M")
print(hero.assign(minsk=minsk)
          .groupby(["anonymous_id", "session_no"])
          .agg(start=("minsk", "first"), events=("event_id", "size")))
