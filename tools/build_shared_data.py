#!/usr/bin/env python3
"""Общие наборы данных в материалы: python3 tools/build_shared_data.py <набор> [<набор> …]

Набор лежит в data/<набор>/ и нужен нескольким страницам. В материалы он кладётся один раз:
dist/materials/data/<набор>/ и архив dist/materials/data-<набор>.zip. Страницы на него ссылаются
строкой списка материалов «data/<набор>/», код страниц запускается из корня материалов.
README для читателя — data/<набор>/README.reader.md; README.md в data/ — для авторов страниц.
"""
import hashlib
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist" / "materials"

SETS = {
    "shop": {"files": ["shop.sql", "shop.sqlite", "shop.duckdb", "gen.py"]},
    "clients": {"files": ["clients.csv", "gen.py"]},
    "probability": {"files": ["visits.csv", "checks.csv", "order_gaps.csv", "daily_orders.csv", "gen.py"]},
    "eda": {"files": ["clients_export.csv", "daily_metrics.csv", "gen.py"]},
    "viz": {"files": ["sales_monthly.csv", "gen.py"]},
    "events": {"files": ["events.parquet", "events.csv.gz", "users.csv", "load_pg.sql", "gen.py"]},
    "unit": {"files": ["clients.csv", "orders.csv", "activity.csv", "marketing_spend.csv", "load_pg.sql", "gen.py"]},
    "ab": {"files": ["users.csv", "exposures.csv", "sessions.parquet", "sessions.csv.gz", "pre_period.csv", "load_pg.sql", "gen.py", "aa_sim.py"]},
    "inference": {"files": ["users.csv", "gen_users.py", "pilot.csv", "gen_pilot.py", "ab.csv", "paired.csv", "gen_ab.py",
                            "discounts.csv", "gen_discounts.py"]},
}


def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def counts_sqlite(path):
    con = sqlite3.connect(path)
    names = [r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
    return {n: con.execute(f"SELECT count(*) FROM {n}").fetchone()[0] for n in names}


def check_shop(out, report):
    """Генератор воспроизводит shop.sql побайтно; в трёх СУБД одни и те же строки."""
    tmp = Path(tempfile.mkdtemp(prefix="shop-"))
    shutil.copy2(out / "gen.py", tmp / "gen.py")
    r = subprocess.run([sys.executable, "gen.py"], cwd=tmp, capture_output=True, text=True)
    report("gen.py выполняется без PostgreSQL", r.returncode == 0, r.stderr[-400:])
    report("gen.py побайтно воспроизводит shop.sql", r.returncode == 0 and sha(tmp / "shop.sql") == sha(out / "shop.sql"))
    lite = counts_sqlite(out / "shop.sqlite")
    report("shop.sqlite: шесть таблиц, 231 заказ", len(lite) == 6 and lite.get("orders") == 231, str(lite))
    report("пересобранный shop.sqlite совпадает по числу строк", r.returncode == 0 and counts_sqlite(tmp / "shop.sqlite") == lite)
    import duckdb
    d = duckdb.connect(str(out / "shop.duckdb"), read_only=True)
    duck = {n: d.execute(f"SELECT count(*) FROM {n}").fetchone()[0] for n in lite}
    d.close()
    report("shop.duckdb: те же таблицы и число строк", duck == lite, str(duck))
    try:
        import psycopg
        with psycopg.connect("host=/tmp dbname=shop user=postgres") as con:
            pg = {n: con.execute(f"SELECT count(*) FROM {n}").fetchone()[0] for n in lite}
            total = con.execute("SELECT sum(amount) FROM orders WHERE status = 'paid'").fetchone()[0]
        report("база shop в PostgreSQL: те же таблицы и число строк, выручка 912 080 ₽", pg == lite and total == 912080, f"{pg} {total}")
    except Exception as e:                                   # noqa: BLE001
        print(f"   ! PostgreSQL недоступен, сверка с базой shop пропущена: {str(e).splitlines()[0][:80]}")
    shutil.rmtree(tmp, ignore_errors=True)


def check_clients(out, report):
    """Генератор воспроизводит clients.csv побайтно; веса регрессии — те, что на страницах темы 04."""
    import numpy as np
    import pandas as pd
    tmp = Path(tempfile.mkdtemp(prefix="clients-"))
    shutil.copy2(out / "gen.py", tmp / "gen.py")
    r = subprocess.run([sys.executable, "gen.py"], cwd=tmp, capture_output=True, text=True)
    report("gen.py выполняется", r.returncode == 0, r.stderr[-400:])
    report("gen.py побайтно воспроизводит clients.csv", r.returncode == 0 and sha(tmp / "clients.csv") == sha(out / "clients.csv"))
    df = pd.read_csv(out / "clients.csv")
    report("clients.csv: 1 000 строк, пять столбцов", df.shape == (1000, 5) and list(df.columns) == ["client_id", "age", "income", "orders", "spend"], str(df.shape))
    report("границы из README: возраст 18–70, доход 25 000–314 000, заказы 0–15",
           (df.age.min(), df.age.max(), df.income.min(), df.income.max(), df.orders.min(), df.orders.max()) == (18, 70, 25000, 314000, 0, 15),
           str((df.age.min(), df.age.max(), df.income.min(), df.income.max(), df.orders.min(), df.orders.max())))
    w, *_ = np.linalg.lstsq(np.c_[np.ones(len(df)), df.income, df.orders], df.spend, rcond=None)
    report("lstsq даёт веса 204,6891; 0,0347; 2 549,5291", list(np.round(w, 4)) == [204.6891, 0.0347, 2549.5291], str(np.round(w, 4)))
    shop = DIST / "data" / "shop" / "shop.sqlite"
    if shop.exists():
        con = sqlite3.connect(shop)
        n_all, n_paid = con.execute("SELECT count(DISTINCT customer_id), count(DISTINCT CASE WHEN status = 'paid' THEN customer_id END) FROM orders").fetchone()
        report("в базе shop заказы у 52 клиентов, оплаченные у 51 (как в README)", (n_all, n_paid) == (52, 51), f"{n_all} {n_paid}")
    shutil.rmtree(tmp, ignore_errors=True)


def check_probability(out, report):
    """Генератор воспроизводит четыре файла побайтно; числа README совпадают с файлами."""
    import pandas as pd
    tmp = Path(tempfile.mkdtemp(prefix="probability-"))
    shutil.copy2(out / "gen.py", tmp / "gen.py")
    r = subprocess.run([sys.executable, "gen.py"], cwd=tmp, capture_output=True, text=True)
    report("gen.py выполняется", r.returncode == 0, r.stderr[-400:])
    names = ["visits.csv", "checks.csv", "order_gaps.csv", "daily_orders.csv"]
    same = r.returncode == 0 and all(sha(tmp / n) == sha(out / n) for n in names)
    report("gen.py побайтно воспроизводит четыре файла", same)
    v, c = pd.read_csv(out / "visits.csv"), pd.read_csv(out / "checks.csv")
    g, d = pd.read_csv(out / "order_gaps.csv"), pd.read_csv(out / "daily_orders.csv")
    report("число строк: 100 000, 20 000, 5 000 и 90", (len(v), len(c), len(g), len(d)) == (100_000, 20_000, 5_000, 90), str((len(v), len(c), len(g), len(d))))
    ad, b = v.source == "реклама", v.bought == 1
    got = (int(b.sum()), round(b.mean(), 3), round(b[ad].mean(), 3), round(ad[b].mean(), 3))
    report("визиты: 3 376 покупок, P(купил) 0,034, P(купил | реклама) 0,039, P(реклама | купил) 0,347", got == (3376, 0.034, 0.039, 0.347), str(got))
    got = (round(c.amount.mean()), int(c.amount.median()), int(c.amount.max()))
    report("чеки: среднее 4 334 ₽, медиана 3 080 ₽, максимум 109 280 ₽", got == (4334, 3080, 109280), str(got))
    got = (round(g.gap_days.mean(), 1), round(g.gap_days.median(), 1), round(d.orders.mean(), 1), round(d.orders.var(), 1))
    report("интервалы: среднее 11,9 и медиана 8,3 дня; заказы за день: среднее 38,7, дисперсия 42,3", got == (11.9, 8.3, 38.7, 42.3), str(got))
    shutil.rmtree(tmp, ignore_errors=True)


def check_inference(out, report):
    """Четыре генератора воспроизводят пять файлов побайтно; числа README совпадают с файлами."""
    import numpy as np
    import pandas as pd
    from scipy import stats
    tmp = Path(tempfile.mkdtemp(prefix="inference-"))
    (tmp / "data" / "inference").mkdir(parents=True)
    shutil.copytree(ROOT / "data" / "probability", tmp / "data" / "probability")          # gen_ab.py читает набор темы 05
    gens = {"gen_users.py": ["users.csv"], "gen_pilot.py": ["pilot.csv"], "gen_ab.py": ["ab.csv", "paired.csv"], "gen_discounts.py": ["discounts.csv"]}
    for g, files in gens.items():
        shutil.copy2(out / g, tmp / "data" / "inference" / g)
        r = subprocess.run([sys.executable, f"data/inference/{g}"], cwd=tmp, capture_output=True, text=True)
        same = r.returncode == 0 and all(sha(tmp / "data" / "inference" / f) == sha(out / f) for f in files)
        report(f"{g} из корня материалов побайтно воспроизводит {' и '.join(files)}", same, r.stderr[-400:])
    r = subprocess.run([sys.executable, "data/inference/gen_pilot.py", "--search"], cwd=tmp, capture_output=True, text=True)
    report("gen_pilot.py --search: значимых 187 из 400 (46,8%), типичных значимых 20, среди них зерно 769",
           "у 187 — 46.8%" in r.stdout and "0,05): 20" in r.stdout and "зерно 769: разница +1093.75 ₽, p = 0.0331  ← пилот страницы" in r.stdout, r.stdout[-300:] + r.stderr[-300:])
    report("генераторы не оставляют лишних файлов", sorted(p.name for p in (tmp / "data" / "inference").iterdir()) == sorted(sum(gens.values(), []) + list(gens)),
           str(sorted(p.name for p in (tmp / "data" / "inference").iterdir())))
    u = pd.read_csv(out / "users.csv")
    got = (len(u), round(u.spend.mean()), round(u.spend.std(ddof=0)), round((u.spend > 0).mean(), 3), int((u.active_days == 0).sum()))
    report("пользователи: 100 000 строк, μ = 4 378 ₽, σ = 5 632 ₽, покупали 61,6%, ушли 7 500", got == (100_000, 4378, 5632, 0.616, 7500), str(got))
    pl = pd.read_csv(out / "pilot.csv")
    m = pl.groupby("button", sort=False).amount.mean()
    got = (len(pl), float(m["старая"]), float(m["новая"]), float(m["новая"] - m["старая"]))
    report("пилот: 80 чеков, средние 3 762,75 и 4 856,50 ₽, разница 1 093,75 ₽", got == (80, 3762.75, 4856.5, 1093.75), str(got))
    ab = pd.read_csv(out / "ab.csv")
    got = (len(ab), ab.groupby("group").paid.sum().tolist(), int(ab.amount.isna().sum()))
    report("A/B-тест: 40 000 строк, 649 и 767 оплат, чек пуст у не оплативших", got == (40_000, [649, 767], 40_000 - 649 - 767), str(got))
    pr = pd.read_csv(out / "paired.csv")
    got = (len(pr), round(pr.before.std(ddof=1)), round((pr.after - pr.before).std(ddof=1)),
           round(float(stats.ttest_rel(pr.after, pr.before).pvalue), 3), round(float(stats.ttest_ind(pr.after, pr.before, equal_var=False).pvalue), 3))
    report("до и после: 30 клиентов, σ чеков 2 188 ₽, σ разностей 833 ₽, p парного 0,164, p Уэлча 0,712", got == (30, 2188, 833, 0.164, 0.712), str(got))
    d = pd.read_csv(out / "discounts.csv")
    r_ = lambda g: round(float(np.corrcoef(g.discount, g.check)[0, 1]), 2)
    got = (len(d), r_(d), [r_(g) for _, g in d.groupby("category", sort=False)])
    report("скидки: 120 заказов, корреляция +0,73 по всем и −0,65, −0,70, −0,56 внутри категорий", got == (120, 0.73, [-0.65, -0.70, -0.56]), str(got))
    shutil.rmtree(tmp, ignore_errors=True)


def check_eda(out, report):
    """Генератор воспроизводит оба файла побайтно; числа README совпадают с файлами."""
    import pandas as pd
    tmp = Path(tempfile.mkdtemp(prefix="eda-"))
    (tmp / "data" / "eda").mkdir(parents=True)
    shutil.copy2(out / "gen.py", tmp / "data" / "eda" / "gen.py")
    r = subprocess.run([sys.executable, "data/eda/gen.py"], cwd=tmp, capture_output=True, text=True)
    names = ["clients_export.csv", "daily_metrics.csv"]
    report("gen.py из корня материалов побайтно воспроизводит оба файла",
           r.returncode == 0 and all(sha(tmp / "data" / "eda" / n) == sha(out / n) for n in names), r.stderr[-400:])
    df = pd.read_csv(out / "clients_export.csv")
    lo = df.last_order_at.dropna()
    got = (df.shape, int(df.client_id.isna().sum()), int(df.signup_date.str.match(r"\d\d\.\d\d\.\d{4}").sum()),
           int(lo.str.endswith("+03:00").sum()), int(lo.str.endswith("Z").sum()), int(df.last_order_at.isna().sum()))
    report("выгрузка: 12 040 строк и 10 столбцов; 25 пустых ключей; 2 407 дат ДД.ММ.ГГГГ; пояса 8 816 и 1 506, пустых 1 718",
           got == ((12040, 10), 25, 2407, 8816, 1506, 1718), str(got))
    ids = df.client_id.dropna()
    got = (int((df.age == 99).sum()), int(df.country.isna().sum()), int((df.channel == "-").sum()), int((df.orders_q1 == -1).sum()), int(ids.duplicated().sum()))
    report("коды и повторы: 360 раз возраст 99, 181 «N/A», 120 прочерков, 150 раз −1, 40 повторов ключа", got == (360, 181, 120, 150, 40), str(got))
    x = df.spend_q1
    got = (int((x == 0).sum()), int((x == 5000).sum()), int((x >= 1e6).sum()), float(x[x >= 1e6].min()), float(x.max()),
           df.loc[(df.orders_q1 == 0) & (x > 0), "spend_q1"].tolist())
    report("траты: 1 717 нулей, 381 сумма ровно 5 000 ₽, пять ошибок от 2,5 до 19,9 млн ₽ и 1 000 ₽ без заказов",
           got == (1717, 381, 5, 2491000.0, 19931000.0, [1000.0]), str(got))
    d = pd.read_csv(out / "daily_metrics.csv", parse_dates=["date"])
    miss = sorted(set(pd.date_range("2026-01-01", "2026-03-31").strftime("%d.%m")) - set(d.date.dt.strftime("%d.%m")))
    got = (len(d), miss, round(float(d.app_installs.corr(d.support_tickets)), 2))
    report("дневные метрики: 86 строк, нет 10–13 февраля, r установок и обращений 0,82", got == (86, ["10.02", "11.02", "12.02", "13.02"], 0.82), str(got))
    shutil.rmtree(tmp, ignore_errors=True)


def check_viz(out, report):
    """Генератор воспроизводит файл побайтно; числа README совпадают с файлом."""
    import pandas as pd
    tmp = Path(tempfile.mkdtemp(prefix="viz-"))
    (tmp / "data" / "viz").mkdir(parents=True)
    shutil.copy2(out / "gen.py", tmp / "data" / "viz" / "gen.py")
    r = subprocess.run([sys.executable, "data/viz/gen.py"], cwd=tmp, capture_output=True, text=True)
    report("gen.py из корня материалов побайтно воспроизводит sales_monthly.csv",
           r.returncode == 0 and sha(tmp / "data" / "viz" / "sales_monthly.csv") == sha(out / "sales_monthly.csv"), r.stderr[-400:])
    df = pd.read_csv(out / "sales_monthly.csv")
    got = (df.shape, df.month.nunique(), df.channel.nunique(), df.country.nunique(), df.month.min(), df.month.max())
    report("960 строк: 24 месяца × 10 каналов × 4 страны, с 2024-01 по 2025-12", got == ((960, 4), 24, 10, 4, "2024-01", "2025-12"), str(got))
    y25 = df[df.month >= "2025-01"]
    ch = y25.groupby("channel").revenue.sum().sort_values(ascending=False)
    got = (round(ch.sum() / 1e6, 1), (ch / ch.sum() * 100).round(1).head(4).tolist(), (ch / ch.sum() * 100).round(1).iloc[[4, -1]].tolist())
    report("2025 год: 416,8 млн ₽; доли 27,4, 18,7, 15,1 и 12,8%; остальные от 7,4 до 1,7%", got == (416.8, [27.4, 18.7, 15.1, 12.8], [7.4, 1.7]), str(got))
    w = df.pivot_table(index="month", columns="channel", values="revenue", aggfunc="sum")
    app = w["приложение"]
    got = (round(app["2025-05"] / 1e6, 2), round(app["2025-07"] / 1e6, 2), round(app["2025-07"] / app["2025-05"], 2), round(app["2024-07"] / app["2024-05"], 2))
    report("приложение: 2,98 → 5,91 млн ₽ с мая по июль 2025, в 1,98 раза; год назад — в 1,02", got == (2.98, 5.91, 1.98, 1.02), str(got))
    tot = w.sum(axis=1)
    cc = w["колл-центр"]
    c = y25.groupby("country").revenue.sum() / 1e6
    got = (tot.idxmax(), tot.idxmin(), round(cc["2025-01":].sum() / cc[:"2024-12"].sum() - 1, 2), round(c["BY"], 1), round(c["UZ"], 1))
    report("пик в декабре 2025, провал в июне 2024; колл-центр −20%; Беларусь 150,8 и Узбекистан 46,0 млн ₽",
           got == ("2025-12", "2024-06", -0.20, 150.8, 46.0), str(got))
    shutil.rmtree(tmp, ignore_errors=True)


def check_events(out, report):
    """Генератор воспроизводит данные; загрузка в PostgreSQL работает из корня материалов; числа README совпадают с журналом."""
    import gzip
    import pandas as pd
    MSK = "Europe/Minsk"
    # 1. генератор: из корня материалов, рядом набор shop
    tmp = Path(tempfile.mkdtemp(prefix="events-"))
    (tmp / "data" / "events").mkdir(parents=True)
    (tmp / "data" / "shop").mkdir()
    shutil.copy2(out / "gen.py", tmp / "data" / "events" / "gen.py")
    shutil.copy2(ROOT / "data" / "shop" / "shop.sqlite", tmp / "data" / "shop" / "shop.sqlite")
    r = subprocess.run([sys.executable, "data/events/gen.py"], cwd=tmp, capture_output=True, text=True)
    new = tmp / "data" / "events"
    report("gen.py из корня материалов побайтно воспроизводит events.parquet и users.csv",
           r.returncode == 0 and all(sha(new / f) == sha(out / f) for f in ("events.parquet", "users.csv")), r.stderr[-400:])
    report("в пересобранном events.csv.gz те же строки, что в файле набора",
           r.returncode == 0 and gzip.open(new / "events.csv.gz").read() == gzip.open(out / "events.csv.gz").read())
    # 2. загрузка в PostgreSQL по инструкции README: распаковать журнал, выполнить load_pg.sql из корня
    load = Path(tempfile.mkdtemp(prefix="events-pg-"))
    shutil.copytree(out, load / "data" / "events")
    pg = ["-h", "/tmp", "-U", "postgres"]
    steps = [[sys.executable, "-m", "gzip", "-d", "data/events/events.csv.gz"], ["dropdb", "--if-exists", *pg, "events_check"],
             ["createdb", *pg, "events_check"], ["psql", *pg, "-d", "events_check", "-X", "-q", "-At", "-v", "ON_ERROR_STOP=1", "-f", "data/events/load_pg.sql"]]
    res = None
    for cmd in steps:
        res = subprocess.run(cmd, cwd=load, capture_output=True, text=True)
        if res.returncode:
            break
    report("load_pg.sql из корня материалов загружает в PostgreSQL 316 518 событий и 6 883 аккаунта",
           res.returncode == 0 and res.stdout.strip().split("\n")[-1] == "316518|6883", (res.stdout[-200:] + res.stderr[-300:]))
    report("после распаковки сжатый журнал остаётся на месте", (load / "data" / "events" / "events.csv.gz").exists() and (load / "data" / "events" / "events.csv").exists())
    subprocess.run(["dropdb", "--if-exists", *pg, "events_check"], capture_output=True)
    import duckdb
    n = duckdb.connect().execute(f"SELECT count(*) FROM '{out / 'events.parquet'}'").fetchone()[0]
    report("DuckDB читает events.parquet прямо из файла: 316 518 строк", n == 316518, str(n))
    # 3. числа README
    raw = pd.read_parquet(out / "events.parquet")
    users = pd.read_csv(out / "users.csv", parse_dates=["signup_time"])
    report("журнал 316 518 × 15, аккаунтов 6 883, дублей 4 540", (raw.shape, len(users), int(raw.duplicated("event_id").sum())) == ((316518, 15), 6883, 4540),
           f"{raw.shape} {len(users)} {raw.duplicated('event_id').sum()}")
    ev = raw.drop_duplicates("event_id").copy()
    ev["t"] = ev.event_time.dt.tz_convert(MSK)
    ev["day"] = ev.t.dt.tz_localize(None).dt.normalize()
    per = ev[ev.origin == "client"].groupby(["anonymous_id", "day"]).size()
    bots = per[per > 100].index.get_level_values(0).unique()
    got = (len(bots), int(ev.anonymous_id.isin(bots).sum()))
    ev = ev[~ev.anonymous_id.isin(bots)].copy()
    report("ботов шесть, их строк 8 816; очищенный слой 303 162 строки", got == (6, 8816) and len(ev) == 303162, f"{got} {len(ev)}")
    dev = ev.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id").user_id.first()
    ev["person"] = ev.user_id.fillna(ev.anonymous_id.map(dev)).fillna(ev.anonymous_id)
    acc = ev.person[ev.person.str.startswith("u_")].nunique()
    two = int((ev.dropna(subset=["anonymous_id"]).groupby("person").anonymous_id.nunique() >= 2).sum())
    got = (ev.anonymous_id.nunique(), ev.person.nunique(), acc, ev.person.nunique() - acc, two)
    report("10 619 устройств → 10 413 человек: 6 357 аккаунтов и 4 056 устройств без входа; 430 человек с двумя устройствами",
           got == (10619, 10413, 6357, 4056, 430), str(got))
    paid = ev[ev.event_name == "order_paid"]
    seen = set(ev.person[ev.origin == "client"])
    got = (paid.person.nunique(), len(set(paid.person) - seen), len(paid), int((ev.event_name == "purchase").sum()))
    report("покупателей 4 245, из них 220 видны только серверу; purchase пришёл на 8 940 заказов из 9 717", got == (4245, 220, 9717, 8940), str(got))
    c = ev[ev.origin == "client"].sort_values(["anonymous_id", "event_time", "event_id"])
    gap = c.groupby("anonymous_id").event_time.diff()
    got = tuple(int((gap.isna() | (gap > pd.Timedelta(minutes=m))).sum()) for m in (30, 5))
    report("сессий 57 267 при пороге 30 минут и 66 895 при пяти", got == (57267, 66895), str(got))
    full = ev[ev.day.between("2026-01-05", "2026-06-28")]
    dau = full.groupby("day").person.nunique().resample("MS").mean()
    mau = full.groupby(full.day.dt.to_period("M")).person.nunique().tolist()
    got = ([round(float(x), 1) for x in dau], mau)
    report("DAU по месяцам 134,3; 172,2; 206,5; 302,0; 339,3; 386,5 (точное февральское 172,25); MAU 1 807 … 5 239",
           got == ([134.3, 172.2, 206.5, 302.0, 339.3, 386.5], [1807, 2377, 3057, 4592, 4919, 5239]) and abs(dau.iloc[1] - 172.25) < 1e-9, str(got))
    # воронка новичков мая
    STEPS = ["app_open", "product_view", "add_to_cart", "checkout_start", "order_paid"]
    old = set(users.loc[users.signup_time < pd.Timestamp("2026-01-05", tz=MSK), "user_id"])
    first = ev[ev.event_name == "app_open"].sort_values("t").groupby("person").first()
    newc = first[~first.index.isin(old)]
    may = newc[(newc.t >= pd.Timestamp("2026-05-01", tz=MSK)) & (newc.t < pd.Timestamp("2026-06-01", tz=MSK))]
    E = ev[ev.person.isin(may.index) & ev.event_name.isin(STEPS)].merge(may.t.rename("t0"), left_on="person", right_index=True)
    E = E[E.t >= E.t0]

    def reach(window, strict):
        e = E if window is None else E[E.t <= E.t0 + pd.Timedelta(window)]
        cur, alive = may.t.rename("tp"), set(may.index)
        for s in STEPS[1:]:
            x = e[(e.event_name == s) & e.person.isin(alive)].merge(cur, left_on="person", right_index=True)
            tmin = (x[x.t >= x.tp] if strict else x).groupby("person").t.min()
            alive, cur = set(tmin.index), (tmin.rename("tp") if strict else cur)
        return round(len(alive) / len(may) * 100, 1)
    got = (len(may), [(reach(w, False), reach(w, True)) for w in ("1D", "7D", None)])
    report("новичков мая 1 610; воронка: сутки 14,1 и 11,9%, 7 суток 20,4 и 18,0%, без окна 30,4 и 28,2%",
           got == (1610, [(14.1, 11.9), (20.4, 18.0), (30.4, 28.2)]), str(got))
    # Симпсон: все пять шагов за 7 суток в любом порядке
    seg = newc[newc.t < pd.Timestamp("2026-06-22", tz=MSK)]
    e = ev[ev.person.isin(seg.index) & ev.event_name.isin(STEPS)].merge(seg.t.rename("t0"), left_on="person", right_index=True)
    e = e[(e.t >= e.t0) & (e.t <= e.t0 + pd.Timedelta("7D"))]
    has = e.pivot_table(index="person", columns="event_name", values="t", aggfunc="size").reindex(index=seg.index, columns=STEPS).notna().all(axis=1)
    ch = seg.traffic_source.replace({"search": "органика", "direct": "органика", "partner": "партнёры", "ad": "реклама", "push": "прочее", "email": "прочее"})
    pl = seg.platform.replace({"android": "app", "ios": "app"})
    rate = (has.groupby([ch, pl]).mean() * 100).round(1)
    size = has.groupby([ch, pl]).size()
    tot = (has.groupby(pl).mean() * 100).round(1)
    got = ([(rate[k, "app"], int(size[k, "app"]), rate[k, "web"], int(size[k, "web"])) for k in ("органика", "партнёры", "реклама")], tot["app"], int((pl == "app").sum()), tot["web"], int((pl == "web").sum()))
    report("парадокс Симпсона: в каждом канале приложение выше сайта, а всего 19,4% из 5 203 против 23,7% из 3 283",
           got == ([(23.8, 2624, 16.7, 1260), (39.7, 272, 36.8, 1374), (12.2, 2257, 10.4, 557)], 19.4, 5203, 23.7, 3283), str(got))
    # когорты, выручка недель
    fday = full.groupby("person").day.min()
    sday = users.set_index("user_id").signup_time.dt.tz_convert(MSK).dt.tz_localize(None).dt.normalize()
    arr = pd.concat([fday, sday.reindex(fday.index)], axis=1).min(axis=1)
    newp = arr[arr >= "2026-01-05"]
    cw = (newp - pd.Timestamp("2026-01-05")).dt.days // 7
    got = (cw.nunique(), len(newp), int((sday < "2026-01-05").sum()), int((arr < "2026-01-05").sum()))
    report("25 недельных когорт и 9 073 новичка; старых аккаунтов 1 801, из них в журнале 1 340", got == (25, 9073, 1801, 1340), str(got))
    wk = full.day - pd.to_timedelta(full.day.dt.dayofweek, unit="D")
    rev = full[full.event_name == "order_paid"].groupby(wk).revenue.sum()
    fail = full[(full.event_name == "payment_failed") & (full.platform == "android")].groupby(wk).size()
    got = (int(rev["2026-05-25"]), int(rev["2026-06-01"]), int(fail["2026-05-25"]), int(fail["2026-06-01"]))
    report("выручка недель 25–31 мая и 1–7 июня — 2 003 150 и 1 740 490 ₽; неудачных оплат в Android 10 и 142", got == (2003150, 1740490, 10, 142), str(got))
    shutil.rmtree(tmp, ignore_errors=True)
    shutil.rmtree(load, ignore_errors=True)


def check_unit(out, report):
    """Генератор воспроизводит данные; загрузка в PostgreSQL работает из корня материалов; числа README совпадают с выгрузкой."""
    import numpy as np
    import pandas as pd
    files = ("clients.csv", "orders.csv", "activity.csv", "marketing_spend.csv")
    # 1. генератор из корня материалов
    tmp = Path(tempfile.mkdtemp(prefix="unit-"))
    (tmp / "data" / "unit").mkdir(parents=True)
    shutil.copy2(out / "gen.py", tmp / "data" / "unit" / "gen.py")
    r = subprocess.run([sys.executable, "data/unit/gen.py"], cwd=tmp, capture_output=True, text=True)
    report("gen.py из корня материалов побайтно воспроизводит четыре файла данных",
           r.returncode == 0 and all(sha(tmp / "data" / "unit" / f) == sha(out / f) for f in files), r.stderr[-400:])
    # 2. загрузка в PostgreSQL по инструкции README
    load = Path(tempfile.mkdtemp(prefix="unit-pg-"))
    shutil.copytree(out, load / "data" / "unit")
    pg = ["-h", "/tmp", "-U", "postgres"]
    res = None
    for cmd in (["dropdb", "--if-exists", *pg, "unit_check"], ["createdb", *pg, "unit_check"],
                ["psql", *pg, "-d", "unit_check", "-X", "-q", "-At", "-v", "ON_ERROR_STOP=1", "-f", "data/unit/load_pg.sql"]):
        res = subprocess.run(cmd, cwd=load, capture_output=True, text=True)
        if res.returncode:
            break
    report("load_pg.sql из корня материалов загружает в PostgreSQL 60 504 клиента, 85 192 заказа, 169 419 строк активности и 72 строки расходов",
           res.returncode == 0 and res.stdout.strip().split("\n")[-1] == "60504|85192|169419|72", (res.stdout[-200:] + res.stderr[-300:]))
    subprocess.run(["dropdb", "--if-exists", *pg, "unit_check"], capture_output=True)
    # 3. числа README — своим кодом
    cl = pd.read_csv(out / "clients.csv", parse_dates=["signup_date"])
    o = pd.read_csv(out / "orders.csv", parse_dates=["order_date"])
    act = pd.read_csv(out / "activity.csv")
    sp = pd.read_csv(out / "marketing_spend.csv")
    report("строк в файлах: 60 504, 85 192, 169 419 и 72", (len(cl), len(o), len(act), len(sp)) == (60504, 85192, 169419, 72), str((len(cl), len(o), len(act), len(sp))))
    ok = o.refunded == 0
    o["md"] = np.where(ok, o.revenue - o.cogs - o.delivery_cost - o.payment_fee, -2 * o.delivery_cost - o.payment_fee)
    o["net"] = np.where(ok, o.revenue, 0)
    m = lambda x: round(float(x) / 1e6, 2)
    got = (m(o.gmv.sum()), m(o.discount.sum()), m(o.paid.sum()), m(o.revenue.sum()), m(o.net.sum()), m(o.md.sum()), round(o.md.sum() / o.net.sum() * 100, 1))
    report("итоги за 24 месяца: 382,34 / 18,66 / 363,69 / 304,44 / 289,49 / 80,11 млн ₽, маржинальный доход 27,7% чистой выручки",
           got == (382.34, 18.66, 363.69, 304.44, 289.49, 80.11, 27.7), str(got))
    mp = o.model == "маркетплейс"
    got = (round(mp.mean() * 100, 1), round(o.gmv[mp].sum() / o.gmv.sum() * 100, 1), round(o.revenue[mp].sum() / o.revenue.sum() * 100, 1),
           int((~ok).sum()), round((~ok).mean() * 100, 1), o.client_id.nunique(), round(o.client_id.nunique() / len(cl) * 100, 1))
    report("маркетплейс 24,1% заказов, 19,2% GMV и 3,4% выручки; возвратов 4 663 (5,5%); покупали 42 804 клиента (70,7%)",
           got == (24.1, 19.2, 3.4, 4663, 5.5, 42804, 70.7), str(got))
    new = cl.groupby("channel").size()
    spend = sp.groupby("channel").spend.sum()
    got = tuple((m(spend[c]), int(new[c]), round(spend[c] / new[c])) for c in ("поиск", "соцсети", "партнёры"))
    report("CAC: поиск 23,62 млн ₽ / 15 691 / 1 506 ₽, соцсети 25,97 / 8 505 / 3 054, партнёры 10,82 / 8 566 / 1 263; органика 27 742",
           got == ((23.62, 15691, 1506), (25.97, 8505, 3054), (10.82, 8566, 1263)) and new["органика"] == 27742, f"{got} {new['органика']}")
    got = (m(spend.sum()), round(spend.sum() / len(cl)), round(spend.sum() / (len(cl) - new["органика"])))
    report("смешанный CAC 998 ₽ при 60,41 млн ₽ расходов, без органики 1 844 ₽", got == (60.41, 998, 1844), str(got))
    june = o[o.order_date.dt.strftime("%Y-%m") == "2026-06"]
    active = int((act.month == "2026-06").sum())
    got = (m(june.net.sum()), june.client_id.nunique(), active, round(june.net.sum() / june.client_id.nunique()), round(june.net.sum() / active), round(june.net.sum() / len(cl)))
    report("июнь 2026: 18,69 млн ₽, 4 545 платящих, 11 065 активных; ARPPU 4 112, ARPU 1 689 и 309 ₽", got == (18.69, 4545, 11065, 4112, 1689, 309), str(got))
    ym = lambda d: d.dt.year * 12 + d.dt.month
    cl["c"] = ym(cl.signup_date)
    last = 2026 * 12 + 6
    o = o.merge(cl[["client_id", "channel", "c"]], on="client_id")
    o["n"] = ym(o.order_date) - o.c
    curve, pay = {}, {}
    for ch in ("органика", "поиск", "соцсети", "партнёры"):
        c = cl[cl.channel == ch]
        alive = pd.Series({n: int((c.c + n <= last).sum()) for n in range(24)})
        cum = (o[o.channel == ch].groupby("n").md.sum().reindex(range(24)).fillna(0) / alive).cumsum()
        curve[ch] = tuple(round(cum[n]) for n in (0, 5, 11, 23))
        cac = spend.get(ch, 0) / len(c)
        pay[ch] = next((n for n in range(24) if cum[n] >= cac), None)
    want = {"органика": (554, 1186, 1670, 2337), "поиск": (523, 1064, 1482, 2061), "соцсети": (205, 345, 449, 576), "партнёры": (898, 1245, 1498, 1832)}
    report("накопленный маржинальный доход на клиента по месяцам 0, 5, 11 и 23 — как в таблице README", curve == want, str(curve))
    report("окупаемость: партнёры на n = 6, поиск на n = 12, соцсети за 24 месяца — нет", (pay["партнёры"], pay["поиск"], pay["соцсети"]) == (6, 12, None), str(pay))
    act["m"] = act.month.str[:4].astype(int) * 12 + act.month.str[5:].astype(int)
    act = act.merge(cl[["client_id", "c"]], on="client_id")
    old = (cl.c >= 2024 * 12 + 7) & (cl.c <= 2024 * 12 + 12)
    a = act[act.client_id.isin(cl.client_id[old])]
    got = tuple(round(a[a.m - a.c == n].client_id.nunique() / int((old & (cl.c + n <= last)).sum()) * 100, 1) for n in (1, 3, 6, 12, 18))
    report("удержание когорт второй половины 2024 года: 36,5 / 23,8 / 16,6 / 12,5 / 10,5%", got == (36.5, 23.8, 16.6, 12.5, 10.5), str(got))
    tot = o.groupby("client_id").net.sum().reindex(cl.client_id).fillna(0).sort_values(ascending=False)
    got = tuple(round(tot.head(int(round(len(cl) * q))).sum() / tot.sum() * 100, 1) for q in (0.01, 0.05))
    report("на 1% клиентов приходится 25,5% чистой выручки, на 5% — 43,1%", got == (25.5, 43.1), str(got))
    month = cl.signup_date.dt.strftime("%Y-%m")
    x = sp.merge(cl.assign(month=month).groupby(["month", "channel"]).size().rename("new").reset_index(), on=["month", "channel"])
    beta = tuple(round(float(np.polyfit(np.log(x.spend[x.channel == c]), np.log(x.new[x.channel == c]), 1)[0]), 2) for c in ("поиск", "соцсети"))
    t = x[(x.channel == "соцсети") & x.month.isin(["2025-10", "2025-11"])].sort_values("month")
    got = (beta, t.spend.tolist(), t.new.tolist())
    report("эластичности 0,78 и 0,61; тест таргета в ноябре 2025: расходы 0,95 → 2,19 млн ₽, новичков 324 → 570",
           got == ((0.78, 0.61), [953000, 2187000], [324, 570]), str(got))


def check_ab(out, report):
    """Генератор воспроизводит данные; загрузка в PostgreSQL работает из корня материалов; числа README совпадают с данными;
    общий набор A/A-тестов печатает записанный в нём вывод."""
    import gzip
    import hashlib as hl
    import numpy as np
    import pandas as pd
    from scipy import stats
    MSK = "Europe/Minsk"
    # 1. генератор из корня материалов
    tmp = Path(tempfile.mkdtemp(prefix="ab-"))
    (tmp / "data" / "ab").mkdir(parents=True)
    shutil.copy2(out / "gen.py", tmp / "data" / "ab" / "gen.py")
    r = subprocess.run([sys.executable, "data/ab/gen.py"], cwd=tmp, capture_output=True, text=True)
    new = tmp / "data" / "ab"
    report("gen.py из корня материалов побайтно воспроизводит users.csv, exposures.csv, sessions.parquet и pre_period.csv",
           r.returncode == 0 and all(sha(new / f) == sha(out / f) for f in ("users.csv", "exposures.csv", "sessions.parquet", "pre_period.csv")), r.stderr[-400:])
    report("в пересобранном sessions.csv.gz те же строки, что в файле набора",
           r.returncode == 0 and gzip.open(new / "sessions.csv.gz").read() == gzip.open(out / "sessions.csv.gz").read())
    # 2. загрузка в PostgreSQL по инструкции README
    load = Path(tempfile.mkdtemp(prefix="ab-pg-"))
    shutil.copytree(out, load / "data" / "ab")
    pg = ["-h", "/tmp", "-U", "postgres"]
    res = None
    for cmd in ([sys.executable, "-m", "gzip", "-d", "data/ab/sessions.csv.gz"], ["dropdb", "--if-exists", *pg, "ab_check"], ["createdb", *pg, "ab_check"],
                ["psql", *pg, "-d", "ab_check", "-X", "-q", "-At", "-v", "ON_ERROR_STOP=1", "-f", "data/ab/load_pg.sql"]):
        res = subprocess.run(cmd, cwd=load, capture_output=True, text=True)
        if res.returncode:
            break
    report("load_pg.sql из корня материалов загружает в PostgreSQL 86 801 пользователя, 145 066 показов, 592 789 сессий и 49 409 строк предпериода",
           res.returncode == 0 and res.stdout.strip().split("\n")[-1] == "86801|145066|592789|49409", (res.stdout[-200:] + res.stderr[-300:]))
    report("после распаковки сжатый файл сессий остаётся на месте",
           (load / "data" / "ab" / "sessions.csv.gz").exists() and (load / "data" / "ab" / "sessions.csv").exists())
    subprocess.run(["dropdb", "--if-exists", *pg, "ab_check"], capture_output=True)
    # 3. общий набор A/A-тестов: вывод скрипта совпадает с записанным в его конце
    src = (out / "aa_sim.py").read_text("utf-8")
    want = "".join(l[2:] + "\n" for l in src.split("# Вывод:\n")[1].rstrip("\n").split("\n"))
    r = subprocess.run([sys.executable, "data/ab/aa_sim.py"], cwd=load, capture_output=True, text=True)
    report("aa_sim.py из корня материалов печатает записанный в нём вывод: 5,1% при одном взгляде, 28,0% при ежедневных, 30 из ста показанных",
           r.returncode == 0 and r.stdout == want and "28.0%" in want and want.rstrip().endswith("30"), r.stdout[-300:] + r.stderr[-300:])
    # 4. числа README — своим кодом
    us = pd.read_csv(out / "users.csv", dtype={"app_version": str})
    ex = pd.read_csv(out / "exposures.csv", parse_dates=["exposed_at"])
    ses = pd.read_parquet(out / "sessions.parquet")
    pre = pd.read_csv(out / "pre_period.csv")
    report("строк в файлах: 86 801, 145 066, 592 789 и 49 409", (len(us), len(ex), len(ses), len(pre)) == (86801, 145066, 592789, 49409), str((len(us), len(ex), len(ses), len(pre))))
    salt = {"aa_check": "aa-0824-7", "checkout_v2": "chk-0907-3", "reco_block": "reco-1005"}
    h = np.array(["A" if int(hl.md5(f"{salt[e]}:{u}".encode()).hexdigest()[:8], 16) % 100 < 50 else "B" for e, u in zip(ex.experiment, ex.user_id)])
    report("правило хеша воспроизводит группу во всех 145 066 показах", bool((h == ex.group.values).all()), str(int((h != ex.group.values).sum())))
    got = {e: ((g.group == "A").sum(), (g.group == "B").sum(), round(float(stats.chisquare([(g.group == "A").sum(), (g.group == "B").sum()]).pvalue), 4)) for e, g in ex.groupby("experiment")}
    report("баланс: aa_check 19 988 / 20 092 (p = 0,60), checkout_v2 28 440 / 28 360 (0,74), reco_block 24 440 / 23 746 (0,0016)",
           got == {"aa_check": (19988, 20092, 0.6034), "checkout_v2": (28440, 28360, 0.7371), "reco_block": (24440, 23746, 0.0016)}, str(got))
    old = ex[ex.experiment == "reco_block"].merge(us, on="user_id").query("platform == 'android' and app_version == '3.1.4'").group.value_counts()
    report("reco_block: на Android 3.1.4 в A 2 782 человека, в B 1 971", (int(old["A"]), int(old["B"])) == (2782, 1971), str(old.to_dict()))
    n = ses[ses.experiment == "checkout_v2"].groupby("user_id").agg(k=("session_id", "size"), o=("orders", "sum"))
    bots = sorted(n[(n.k > 200) & (n.o == 0)].index)
    report("боты — u_025389, u_053191, u_055948: в checkout_v2 по 405–428 сессий без заказа; у остальных максимум 85, в среднем 5,3",
           bots == ["u_025389", "u_053191", "u_055948"] and (int(n.loc[bots].k.min()), int(n.loc[bots].k.max()), int(n.drop(bots).k.max()), round(float(n.drop(bots).k.mean()), 1)) == (405, 428, 85, 5.3),
           f"{bots} {n.loc[bots].k.tolist()} {n.drop(bots).k.max()} {n.drop(bots).k.mean():.2f}")
    s = ses[~ses.user_id.isin(bots)].merge(ex[["experiment", "user_id", "group", "exposed_at"]].rename(columns={"group": "g"}), on=["experiment", "user_id"])
    c = s[s.experiment == "checkout_v2"]
    wrong = c[c.group != c.g]
    both = int((c[c.user_id.isin(wrong.user_id)].groupby("user_id").group.nunique() == 2).sum())
    report("чужая группа в сессиях checkout_v2: 376 человек и 857 сессий, у 331 встречаются обе группы, у 45 — только чужая",
           (wrong.user_id.nunique(), len(wrong), both, wrong.user_id.nunique() - both) == (376, 857, 331, 45), str((wrong.user_id.nunique(), len(wrong), both)))

    def users(e):
        return s[s.experiment == e].groupby("user_id").agg(g=("g", "first"), k=("session_id", "size"), x=("converted", "sum"), conv=("converted", "max"), rev=("revenue", "sum")).reset_index()

    ua = users("aa_check")
    A, B = ua[ua.g == "A"], ua[ua.g == "B"]
    got = (round(A.conv.mean() * 100, 2), round(B.conv.mean() * 100, 2), round(A.rev.mean(), 1), round(B.rev.mean(), 1))
    report("aa_check: конверсия 10,51 и 10,12%, выручка на человека 595,6 и 611,9 ₽", got == (10.51, 10.12, 595.6, 611.9), str(got))
    u = users("checkout_v2")
    A, B = u[u.g == "A"], u[u.g == "B"]
    pa, pb = A.conv.mean(), B.conv.mean()
    se = np.sqrt(pa * (1 - pa) / len(A) + pb * (1 - pb) / len(B))
    pp = u.conv.mean()
    z = (pb - pa) / np.sqrt(pp * (1 - pp) * (1 / len(A) + 1 / len(B)))
    got = (len(A), len(B), round(pa * 100, 2), round(pb * 100, 2), round((pb - pa) * 100, 2), round((pb - pa - 1.96 * se) * 100, 2), round((pb - pa + 1.96 * se) * 100, 2), round((pb / pa - 1) * 100, 1), round(z, 2))
    report("checkout_v2 без ботов: 28 439 и 28 358 человек; конверсия 14,08 → 15,25%, +1,17 п. п. [0,59; 1,75], +8,3%, z = 3,95",
           got == (28439, 28358, 14.08, 15.25, 1.17, 0.59, 1.75, 8.3, 3.95), str(got))
    d = B.rev.mean() - A.rev.mean()
    sd = np.sqrt(A.rev.var() / len(A) + B.rev.var() / len(B))
    got = (round(A.rev.mean(), 1), round(B.rev.mean(), 1), round(d, 1), round(d - 1.96 * sd, 1), round(d + 1.96 * sd, 1), round(float(stats.ttest_ind(B.rev, A.rev, equal_var=False).pvalue), 2))
    report("выручка на человека 998,9 → 1 076,8 ₽: +77,9 ₽ [−37,1; 192,8], p = 0,18", got == (998.9, 1076.8, 77.9, -37.1, 192.8, 0.18), str(got))
    u = u.merge(pre, on="user_id", how="left")
    X, Y = u.revenue_pre.fillna(0), u.rev
    th = np.cov(X, Y)[0, 1] / X.var()
    Yc = Y - th * (X - X.mean())
    e1 = Yc[u.g == "B"].mean() - Yc[u.g == "A"].mean()
    s1 = np.sqrt(Yc[u.g == "A"].var() / (u.g == "A").sum() + Yc[u.g == "B"].var() / (u.g == "B").sum())
    got = (round(th, 3), round(float(np.corrcoef(X, Y)[0, 1]), 3), round((1 - Yc.var() / Y.var()) * 100, 1), round(e1, 1), round(e1 - 1.96 * s1, 1), round(e1 + 1.96 * s1, 1))
    report("CUPED: θ = 0,665, корреляция 0,463, дисперсия −21,4%, эффект +86,0 ₽ [−15,8; 187,9]", got == (0.665, 0.463, 21.4, 86.0, -15.8, 187.9), str(got))

    def ratio(g):
        r_ = g.x.sum() / g.k.sum()
        return r_, (g.x.var() - 2 * r_ * np.cov(g.x, g.k)[0, 1] + r_ * r_ * g.k.var()) / (len(g) * g.k.mean() ** 2), r_ * (1 - r_) / g.k.sum()

    (ra, va, na), (rb, vb, nb) = ratio(A), ratio(B)
    got = (round(ra * 100, 2), round(rb * 100, 2), round(float(np.sqrt(na + nb)), 5), round(float(np.sqrt(va + vb)), 5), round(float(np.sqrt((va + vb) / (na + nb))), 2))
    report("конверсия сессий 3,73 → 4,12%; ошибка разницы по сессиям 0,00071, по людям 0,00090 — в 1,27 раза больше", got == (3.73, 4.12, 0.00071, 0.0009, 1.27), str(got))
    rel = lambda q: q[q.g == "B"].converted.mean() / q[q.g == "A"].converted.mean() - 1
    c = c.assign(since=(c.session_start - c.exposed_at) // pd.Timedelta(days=1), wk=(c.session_start.dt.tz_convert(MSK).dt.tz_localize(None).dt.normalize() - pd.Timestamp("2026-09-07")).dt.days // 7)
    got = ([round(rel(c[(c.since >= lo) & (c.since <= hi)]) * 100, 1) for lo, hi in ((0, 2), (3, 6), (7, 13), (14, 27))], [round(rel(c[c.wk == w]) * 100, 1) for w in range(4)])
    report("новизна: по полным суткам с показа +21,8 / +8,9 / +11,0 / −0,3%, по календарным неделям +21,1 / +6,7 / +6,7 / +8,0%",
           got == ([21.8, 8.9, 11.0, -0.3], [21.1, 6.7, 6.7, 8.0]), str(got))
    ur = users("reco_block")
    got = (round(ur[ur.g == "A"].conv.mean() * 100, 2), round(ur[ur.g == "B"].conv.mean() * 100, 2))
    report("reco_block: конверсия 10,20 и 10,60%", got == (10.2, 10.6), str(got))
    newbies = (pd.to_datetime(u.merge(us, on="user_id").signup_date) >= pd.Timestamp("2026-09-07")).mean()
    report("19% участников checkout_v2 зарегистрировались во время теста", round(float(newbies) * 100) == 19, f"{newbies:.3f}")


CHECKS = {"shop": check_shop, "clients": check_clients, "probability": check_probability, "inference": check_inference, "eda": check_eda, "viz": check_viz, "events": check_events, "unit": check_unit, "ab": check_ab}


def build(name):
    cfg = SETS[name]
    src = ROOT / "data" / name
    out = DIST / "data" / name
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    for f in cfg["files"]:
        shutil.copy2(src / f, out / f)
    shutil.copy2(src / "README.reader.md", out / "README.md")
    checks = []
    CHECKS[name](out, lambda what, ok, detail="": checks.append((bool(ok), what, detail)))
    z = DIST / f"data-{name}.zip"
    with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(out.rglob("*")):
            if p.is_file():
                zf.write(p, f"data/{name}/{p.relative_to(out).as_posix()}")
    print(f"\n== общий набор {name} → dist/materials/data/{name}/ (архив {z.stat().st_size:,} байт)".replace(",", " "))
    for p in sorted(out.rglob("*")):
        print(f"   {p.name:42} {p.stat().st_size:>9,} байт".replace(",", " "))
    bad = [c for c in checks if not c[0]]
    print(f"   проверок: {len(checks)}, не прошло: {len(bad)}")
    for ok, what, detail in checks:
        print(f"   {'✓' if ok else '✗'} {what}{'' if ok else ' ' + detail}")
    return not bad


if __name__ == "__main__":
    names = sys.argv[1:] or list(SETS)
    sys.exit(0 if all([build(n) for n in names]) else 1)
