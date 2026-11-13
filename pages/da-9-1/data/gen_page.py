"""Данные страницы 9.1: события героя для сцены и интерактива, сверка интерактива, вывод блоков кода, числа текста.

Запуск из любой папки:  python3 pages/da-9-1/data/gen_page.py
Источник — общий учебный журнал data/events (не меняем): events.parquet и база PostgreSQL `events`
(psql -h /tmp -U postgres -d events). Окружение: Python 3.13, pandas 3.0.5, PostgreSQL 16, psycopg 3.

1. Очищенный слой по соглашениям темы 09: без дублей event_id, без ботов (больше 100 клиентских событий
   за минские сутки), день по Минску, человек = аккаунт после склейки anonymous_id → user_id.
2. Герой u_06883: его 21 строка за 12–15 мая по Минску (телефон d_f6f77955, ноутбук d_398d33df, два order_paid).
   Для каждого порога интерактива и обоих положений «склеить по аккаунту» считаем сессии, сессии с заказом,
   пользователей и покупателей — в pandas и тем же правилом в PostgreSQL; результаты должны совпасть.
3. Блоки кода code/sessions.sql, code/sessions.py, code/user_day.py запускаются как есть
   (SQL — psql -q -P null=NULL; Python — во временной папке рядом со ссылкой на events.parquet), вывод вставляется.
4. Всё это пишется в page.js между /*data:start*/ и /*data:end*/; числа текста печатаются для сверки.
5. Если в PATH есть node, check_widget.js сверяет JS-расчёт интерактива с таблицей из п. 2.
Повторный запуск даёт тот же page.js.
"""
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import pandas as pd
import psycopg

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
ROOT = PAGE.parents[1]
EVENTS = ROOT / "data" / "events"
CODE = HERE / "code"
PG = "host=/tmp user=postgres dbname=events"
PHONE, LAPTOP, HERO = "d_f6f77955", "d_398d33df", "u_06883"
STOPS = [1, 2, 5, 10, 15, 20, 30, 45, 60, 120, 240, 480, 720, 1440]   # пороги интерактива, минуты


# ---------------------------------------------------------------- 1. очищенный слой
raw = pd.read_parquet(EVENTS / "events.parquet")
ev = raw.drop_duplicates("event_id").copy()
ev["day"] = ev["event_time"].dt.tz_convert("Europe/Minsk").dt.date.astype(str)
cl = ev[ev["origin"] == "client"]
per_day = cl.groupby(["anonymous_id", "day"]).size()
BOTS = sorted(per_day[per_day > 100].index.get_level_values(0).unique())
ev = ev[~ev["anonymous_id"].isin(BOTS)].copy()
dev_user = ev.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id")["user_id"].first()
ev["person"] = ev["user_id"].fillna(ev["anonymous_id"].map(dev_user)).fillna(ev["anonymous_id"])


# ---------------------------------------------------------------- 2. герой и сверка интерактива
hero = ev[(ev["anonymous_id"].isin([PHONE, LAPTOP]) | (ev["user_id"] == HERO))
          & ev["day"].between("2026-05-12", "2026-05-15")].sort_values(["event_time", "event_id"])
assert len(hero) == 21, len(hero)


def hero_state(h, minutes, stitch):
    """Правило интерактива: сессия — по устройству, новая при паузе > порога; заказ (order_paid) относим к последней
    сессии того же человека, начатой не позже оплаты; без склейки человек = user_id строки, иначе anonymous_id."""
    d2u = h.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id")["user_id"].first()
    who = h["user_id"].fillna(h["anonymous_id"].map(d2u) if stitch else h["anonymous_id"]).fillna(h["anonymous_id"])
    h = h.assign(who=who)
    c = h[h["origin"] == "client"].sort_values(["anonymous_id", "event_time", "event_id"])
    gap = c.groupby("anonymous_id")["event_time"].diff()
    new = gap.isna() | (gap > pd.Timedelta(minutes=minutes))
    c = c.assign(sno=new.groupby(c["anonymous_id"]).cumsum())
    sess = c.groupby(["anonymous_id", "sno"]).agg(start=("event_time", "min"), ids=("who", lambda s: set(s)))
    with_order = set()
    for _, o in h[h["event_name"] == "order_paid"].iterrows():
        cand = sess[(sess["start"] <= o["event_time"]) & sess["ids"].map(lambda ids: o["who"] in ids)]
        with_order.add(cand["start"].idxmax())
    users = h["who"].nunique()
    buyers = h.loc[h["event_name"] == "order_paid", "who"].nunique()
    return [len(sess), len(with_order), users, buyers]


def hero_state_sql(cur, minutes, stitch):
    person = "COALESCE(h.user_id, d.uid, h.anonymous_id)" if stitch else "COALESCE(h.user_id, h.anonymous_id)"
    q = f"""
    WITH dedup AS (SELECT DISTINCT ON (event_id) * FROM events ORDER BY event_id),
    h AS (SELECT * FROM dedup
          WHERE (anonymous_id IN ('{PHONE}', '{LAPTOP}') OR user_id = '{HERO}')
            AND (event_time AT TIME ZONE 'Europe/Minsk')::date BETWEEN '2026-05-12' AND '2026-05-15'),
    d AS (SELECT anonymous_id, MIN(user_id) AS uid FROM h
          WHERE anonymous_id IS NOT NULL AND user_id IS NOT NULL GROUP BY anonymous_id),
    p AS (SELECT h.*, {person} AS who FROM h LEFT JOIN d USING (anonymous_id)),
    g AS (SELECT *, event_time - LAG(event_time) OVER w AS gap FROM p WHERE origin = 'client'
          WINDOW w AS (PARTITION BY anonymous_id ORDER BY event_time, event_id)),
    s AS (SELECT *, SUM(CASE WHEN gap IS NULL OR gap > make_interval(mins => {minutes}) THEN 1 ELSE 0 END)
                    OVER (PARTITION BY anonymous_id ORDER BY event_time, event_id) AS sno FROM g),
    sess AS (SELECT anonymous_id, sno, MIN(event_time) AS st, array_agg(DISTINCT who) AS ids
             FROM s GROUP BY anonymous_id, sno),
    o AS (SELECT (SELECT x.anonymous_id || '#' || x.sno FROM sess x
                  WHERE x.st <= p.event_time AND p.who = ANY (x.ids)
                  ORDER BY x.st DESC LIMIT 1) AS sk
          FROM p WHERE event_name = 'order_paid')
    SELECT (SELECT COUNT(*) FROM sess), (SELECT COUNT(DISTINCT sk) FROM o),
           (SELECT COUNT(DISTINCT who) FROM p), (SELECT COUNT(DISTINCT who) FROM p WHERE event_name = 'order_paid')"""
    return list(cur.execute(q).fetchone())


CHECK = {}
with psycopg.connect(PG) as con, con.cursor() as cur:
    for m in STOPS:
        for st in (0, 1):
            a, b = hero_state(hero, m, bool(st)), hero_state_sql(cur, m, bool(st))
            assert a == b, (m, st, a, b)
            CHECK[f"{m}_{st}"] = a
print("интерактив: все", len(CHECK), "состояний совпали в pandas и PostgreSQL")
for m in STOPS:
    print(f"  порог {m:>4} мин: без склейки {CHECK[f'{m}_0']}, со склейкой {CHECK[f'{m}_1']}  [сессии, с заказом, люди, покупатели]")

# строки героя для JS: время UTC в секундах от 2026-05-12 00:00 по Минску, имя, origin, устройство, аккаунт, свойства
T0 = pd.Timestamp("2026-05-12 00:00", tz="Europe/Minsk")
props = {"product_view": ["product_id", "category", "price"], "add_to_cart": ["product_id", "category", "price"],
         "app_open": ["traffic_source"], "checkout_start": ["revenue"], "order_paid": ["order_id", "revenue"],
         "purchase": ["order_id", "revenue"]}
HERO_ROWS = []
for _, r in hero.iterrows():
    pr = {k: (int(r[k]) if k in ("product_id", "price", "revenue") else r[k]) for k in props.get(r["event_name"], [])}
    HERO_ROWS.append([int((r["event_time"] - T0).total_seconds()), r["event_id"], r["event_name"], r["origin"],
                      None if pd.isna(r["anonymous_id"]) else r["anonymous_id"],
                      None if pd.isna(r["user_id"]) else r["user_id"], r["platform"], pr])


# ---------------------------------------------------------------- 3. блоки кода
def run_sql(path):
    out = subprocess.run(["psql", "-q", "-h", "/tmp", "-U", "postgres", "-d", "events", "-P", "null=NULL", "-f", str(path)],
                         capture_output=True, text=True, check=True, cwd=EVENTS).stdout
    return out.rstrip("\n")


def run_py(*paths):
    with tempfile.TemporaryDirectory() as tmp:
        (Path(tmp) / "data").symlink_to(ROOT / "data")      # путь в коде: data/events/events.parquet
        src = "\n".join(p.read_text(encoding="utf-8") for p in paths)
        (Path(tmp) / "nb.py").write_text(src, encoding="utf-8")
        res = subprocess.run(["python3", "-I", "nb.py"], capture_output=True, text=True, check=True, cwd=tmp)
        return res.stdout.rstrip("\n")


CODE_OUT = {}
CODE_OUT["sql"] = {"code": (CODE / "sessions.sql").read_text(encoding="utf-8").rstrip("\n"), "out": run_sql(CODE / "sessions.sql")}
out_s = run_py(CODE / "sessions.py")
out_both = run_py(CODE / "sessions.py", CODE / "user_day.py")
assert out_both.startswith(out_s)
CODE_OUT["pandas"] = {"code": (CODE / "sessions.py").read_text(encoding="utf-8").rstrip("\n"), "out": out_s}
CODE_OUT["userday"] = {"code": (CODE / "user_day.py").read_text(encoding="utf-8").rstrip("\n"), "out": out_both[len(out_s):].lstrip("\n")}
# счётчики SQL и pandas должны совпасть
n30 = re.search(r"\|\s+(\d+)\s+\|\s+(\d+)\s*$", CODE_OUT["sql"]["out"], re.M)
assert f"сессий {n30.group(1)}" in out_s and f"сессий {n30.group(2)}" in out_s, "SQL и pandas разошлись"


# ---------------------------------------------------------------- 4. числа текста (для сверки)
def P(*a):
    print("  ", *a)


print("числа текста:")
dup = raw.duplicated("event_id")
P("строк сырого журнала", len(raw), "| дублей", int(dup.sum()), f"({dup.sum() / (raw.origin == 'client').sum():.2%} клиентских)")
d0 = raw.drop_duplicates("event_id")
P("ботов", len(BOTS), BOTS, "| их событий без дублей", int(d0.anonymous_id.isin(BOTS).sum()), "| с дублями", int(raw.anonymous_id.isin(BOTS).sum()))
pv = d0[d0.event_name == "product_view"]
P("product_view ботов", int(pv.anonymous_id.isin(BOTS).sum()), "из", len(pv), f"{pv.anonymous_id.isin(BOTS).mean():.1%}")
hum = per_day[~per_day.index.get_level_values(0).isin(BOTS)]
P("максимум клиентских событий человека за сутки", int(hum.max()), "| минимум бота", int(per_day[per_day.index.get_level_values(0).isin(BOTS)].min()))
P("очищенный слой", len(ev))
P("людей", ev.person.nunique(), "| аккаунтов", ev.person[ev.person.str.startswith("u_")].nunique(),
  "| анонимных устройств", ev.person[ev.person.str.startswith("d_")].nunique())
cdev = ev[ev.origin == "client"]
P("устройств", cdev.anonymous_id.nunique(), cdev.groupby("platform").anonymous_id.nunique().to_dict())
pd_ = cdev.groupby("person").anonymous_id.nunique()
acc = ev.person[ev.person.str.startswith("u_")].nunique()
P("людей с 2+ устройствами", int((pd_ >= 2).sum()), f"{(pd_ >= 2).sum() / ev.person.nunique():.1%} людей, {(pd_ >= 2).sum() / acc:.1%} аккаунтов")
P("устройств с двумя аккаунтами", int((ev.dropna(subset=['anonymous_id', 'user_id']).groupby('anonymous_id').user_id.nunique() > 1).sum()))
pre = cdev.user_id.isna() & cdev.anonymous_id.isin(dev_user.index)
P("клиентских строк до входа, которые склейка отдаёт аккаунту", int(pre.sum()), f"{pre.mean():.1%}")
op = ev[ev.event_name == "order_paid"]; pu = ev[ev.event_name == "purchase"]
t = pd.DataFrame({"order_paid": op.groupby("platform").size(), "purchase": pu.groupby("platform").size()})
t["ratio"] = (t.purchase / t.order_paid).round(3)
P("purchase / order_paid:", t.to_dict("index"), "| всего", len(pu), len(op), round(len(pu) / len(op), 3))
P("выручка order_paid", int(op.revenue.sum()), "| purchase", int(pu.revenue.sum()), f"{pu.revenue.sum() / op.revenue.sum() - 1:.1%}",
  "| purchase с дублями", int((raw.event_name == "purchase").sum()), int(raw.loc[raw.event_name == "purchase", "revenue"].sum()))
buyers = set(op.user_id); cl_people = set(ev.loc[ev.origin == "client", "person"])
P("покупателей (order_paid)", len(buyers), "| без единого клиентского события", len(buyers - cl_people),
  "| по purchase", pu.person.nunique(), "| аккаунтов только с серверными событиями", len(set(ev.person) - cl_people))
cs = cdev.sort_values(["anonymous_id", "event_time", "event_id"])
gap = cs.groupby("anonymous_id").event_time.diff()
for m in STOPS:
    P(f"сессий при пороге {m} мин:", int((gap.isna() | (gap > pd.Timedelta(minutes=m))).sum()))
P(f"пауз между событиями устройства короче минуты: {(gap.dropna() < pd.Timedelta(minutes=1)).mean():.1%}")
may = cs["day"].str[:7] == "2026-05"
P("май: сессий при 30 и 5 мин", int((may & (gap.isna() | (gap > pd.Timedelta(minutes=30)))).sum()),
  int((may & (gap.isna() | (gap > pd.Timedelta(minutes=5)))).sum()))
local = (ev.event_time + pd.to_timedelta(ev.country.map({"BY": 3, "RU": 3, "KZ": 5, "UZ": 5}), unit="h")).dt.date.astype(str)
P("строк, у которых местный день не равен минскому", int((local != ev.day).sum()))
sid = (gap.isna() | (gap > pd.Timedelta(minutes=30))).cumsum()
mid = (gap > pd.Timedelta(minutes=5)) & (gap <= pd.Timedelta(minutes=30))
P("сессий (30 мин) с паузой 5–30 мин", int(mid.groupby(sid).any().sum()), f"{mid.groupby(sid).any().mean():.1%}")
full = ev[ev.day.between("2026-01-05", "2026-06-28")]
P("строк в неполные дни: 4 января", int((ev.day == "2026-01-04").sum()), "| 29 июня", int((ev.day == "2026-06-29").sum()))
P("первое и последнее событие по Минску", ev.event_time.min().tz_convert("Europe/Minsk"), ev.event_time.max().tz_convert("Europe/Minsk"))


def dau(df, col, day="day"):
    x = df.dropna(subset=[col]).groupby(day)[col].nunique()
    return x[(x.index >= "2026-01-05") & (x.index <= "2026-06-28")]


ev["coal"] = ev.user_id.fillna(ev.anonymous_id)
ev["day_utc"] = ev.event_time.dt.date.astype(str)
with_bots = d0.assign(day=d0.event_time.dt.tz_convert("Europe/Minsk").dt.date.astype(str),
                      person=d0.user_id.fillna(d0.anonymous_id.map(dev_user)).fillna(d0.anonymous_id))
ref = dau(ev, "person")
mon = lambda s: s.groupby(s.index.str[:7]).mean()
P("DAU по месяцам", mon(ref).round(1).to_dict())
for name, s in [("id в строке (без склейки)", dau(ev, "coal")), ("только user_id", dau(ev, "user_id")),
                ("устройства", dau(ev[ev.origin == "client"], "anonymous_id")),
                ("только клиентские события", dau(ev[ev.origin == "client"], "person")),
                ("с ботами", dau(with_bots, "person")),
                ("день по UTC", dau(ev, "person", "day_utc"))]:
    P(f"DAU {name}: по месяцам", mon(s).round(1).to_dict(), "| к эталону", (mon(s) / mon(ref)).round(3).to_dict(),
      "| за весь период", round(s.mean() / ref.mean(), 3))
r = (dau(ev, "person", "day_utc") / ref).dropna()
P("UTC / Минск по дням: min", r.idxmin(), round(r.min(), 3), int(ref[r.idxmin()]), int(dau(ev, "person", "day_utc")[r.idxmin()]),
  "| max", r.idxmax(), round(r.max(), 3), int(ref[r.idxmax()]), int(dau(ev, "person", "day_utc")[r.idxmax()]))
mau = lambda df, col: df.dropna(subset=[col]).groupby(df.day.str[:7])[col].nunique()
P("MAU устройства / люди", (mau(full[full.origin == "client"], "anonymous_id") / mau(full, "person")).round(3).to_dict())


# ---------------------------------------------------------------- 5. запись в page.js
data = ("/*data:start*/\n"
        f"  const HERO = {json.dumps(HERO_ROWS, ensure_ascii=False, separators=(',', ':'))};\n"
        f"  const STOPS = {json.dumps(STOPS)};\n"
        f"  const CHECK = {json.dumps(CHECK, separators=(',', ':'))};\n"
        f"  const CODE_SRC = {json.dumps(CODE_OUT, ensure_ascii=False)};\n"
        "  /*data:end*/")
js = PAGE / "page.js"
src = js.read_text(encoding="utf-8")
new = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda m: data, src, flags=re.S)
assert new != src or data in src
js.write_text(new, encoding="utf-8")
print("page.js обновлён")
if shutil.which("node"):
    print(subprocess.run(["node", str(HERE / "check_widget.js")], capture_output=True, text=True, check=True).stdout.strip())
