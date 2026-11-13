"""Учебный журнал событий для темы 09 «Продуктовые метрики и события». seed 909.
Тот же интернет-магазин товаров для дома (каталог — 32 товара из data/shop), теперь с приложением (iOS, Android) и сайтом.
Период: 2026-01-05 … 2026-06-28 (25 полных недель, понедельник — воскресенье). Время событий — UTC.

Заложено:
- релиз 3.0 (новый онбординг и оформление заказа) 2026-03-16: у когорт приложения после релиза плато удержания выше;
- рекламная кампания 2026-04-06 … 2026-05-03: много новичков из рекламы, они почти не возвращаются;
- баг оплаты в Android 3.2 (2026-06-01, исправлен в 3.2.1 2026-06-08): выручка недели 1–7 июня падает;
- два устройства у части людей, анонимные события до входа, блокировщики на сайте, дубли клиентских событий, боты.
"""
import numpy as np, pandas as pd, pathlib, sqlite3

rng = np.random.default_rng(909)
P = pathlib.Path(__file__).parent
START = pd.Timestamp("2026-01-05")
END = pd.Timestamp("2026-06-29")                     # не включительно, UTC
N_WEEKS = 25
RELEASE_30 = pd.Timestamp("2026-03-16")
CAMPAIGN = (pd.Timestamp("2026-04-06"), pd.Timestamp("2026-05-04"))
BUG = (pd.Timestamp("2026-06-01"), pd.Timestamp("2026-06-08"))
TZ = {"BY": 3, "RU": 3, "KZ": 5, "UZ": 5}

con = sqlite3.connect(P.parent / "shop" / "shop.sqlite")
products = con.execute("select product_id, category, price from products").fetchall()
con.close()
prod_w = np.array([1.6 if c in ("текстиль", "посуда") else 1.0 for _, c, _ in products]); prod_w /= prod_w.sum()

# релизы приложения: (дата, версия); устройство обновляется с задержкой
APP_RELEASES = {
    "android": [(pd.Timestamp("2025-11-10"), "2.8"), (RELEASE_30, "3.0"), (pd.Timestamp("2026-06-01"), "3.2"), (pd.Timestamp("2026-06-08"), "3.2.1")],
    "ios":     [(pd.Timestamp("2025-11-10"), "2.8"), (RELEASE_30, "3.0"), (pd.Timestamp("2026-05-04"), "3.1")],
}

# локальный час начала сессии: утро, обед, вечер
HOURS = np.arange(24)
hw = np.array([0.2, 0.1, 0.05, 0.05, 0.05, 0.1, 0.4, 1.0, 1.6, 1.4, 1.0, 1.0, 1.5, 1.5, 1.1, 1.0, 1.0, 1.2, 1.6, 2.2, 2.6, 2.6, 2.0, 1.0])
hw /= hw.sum()

rows = []                                            # события
users = []                                           # аккаунты
counter = {"e": 0, "o": 0, "u": 0}


def new_id(kind):
    counter[kind] += 1
    return counter[kind]


def dev_id():
    return "d_" + "".join(rng.choice(list("0123456789abcdef"), 8))


def app_version(dev, t):
    if dev["platform"] == "web":
        return None
    v = "2.8"
    for d, ver in APP_RELEASES[dev["platform"]]:     # версии идут по возрастанию
        fresh_install = dev["installed"] is not None and dev["installed"] >= d
        if t >= d and (t >= d + pd.Timedelta(days=dev["lag"]) or fresh_install):
            v = ver
    return v


def emit(t, name, dev, person, origin="client", **props):
    if t >= END:
        return
    rows.append(dict(
        event_id=f"e{new_id('e'):07d}", event_time=t, event_name=name, origin=origin,
        anonymous_id=dev["id"] if origin == "client" else None,
        user_id=(person["user_id"] if (origin == "server" or dev["logged_in"]) else None),
        platform=dev["platform"], app_version=app_version(dev, t), country=person["country"],
        traffic_source=props.get("traffic_source"), product_id=props.get("product_id"),
        category=props.get("category"), price=props.get("price"), order_id=props.get("order_id"),
        revenue=props.get("revenue"), _adblock=dev["adblock"], _person=person["pid"]))


def gap(mean=35):
    return pd.Timedelta(seconds=float(rng.exponential(mean)) + 3)


def ensure_account(t, dev, person, how):
    """Вход или регистрация на устройстве. Возвращает время после события."""
    if person["user_id"] is None:
        person["user_id"] = f"u_{new_id('u'):05d}"
        person["signup"] = t
        users.append(dict(user_id=person["user_id"], signup_time=t, country=person["country"],
                          acquisition_channel=person["channel"], signup_platform=dev["platform"]))
        dev["logged_in"] = True
        emit(t, "sign_up", dev, person, method=how)
    else:
        dev["logged_in"] = True
        emit(t, "login", dev, person)
    return t + gap(20)


def session(t, dev, person, first=False, story=None):
    """Одна сессия: открытие, просмотры, корзина, оформление, оплата."""
    plat = dev["platform"]
    if first:
        src = {"органика": rng.choice(["search", "direct"], p=[0.6, 0.4]), "реклама": "ad", "партнёры": "partner"}[person["channel"]]
    else:
        src = rng.choice(["direct", "push" if plat != "web" else "email", "ad"], p=[0.62, 0.28, 0.10])
    emit(t, "app_open", dev, person, traffic_source=str(src))
    t += gap(15)
    intent = person["intent"]
    app_boost = 1.0 if plat == "web" else 1.15                # в приложении оформлять заказ удобнее
    # регистрация в первой сессии
    if first and rng.random() < 0.30:
        t = ensure_account(t + gap(40), dev, person, "phone")
    elif not dev["logged_in"] and person["user_id"] is not None and rng.random() < 0.25:
        t = ensure_account(t, dev, person, None)
    # быстрое добавление из каталога — в корзину без карточки товара
    quick = (not dev["cart"]) and rng.random() < 0.10
    if quick:
        pid, cat, price = products[rng.choice(len(products), p=prod_w)]
        dev["cart"].append((pid, cat, price, 1))
        emit(t, "add_to_cart", dev, person, product_id=pid, category=cat, price=price)
        t += gap(30)
    # просмотры
    reorder = (not first) and person["orders"] > 0 and rng.random() < 0.15
    n_views = 0 if reorder or rng.random() < 0.12 else 1 + rng.geometric(0.33)
    viewed = []
    for i in range(n_views):
        pid, cat, price = products[rng.choice(len(products), p=prod_w)]
        emit(t, "product_view", dev, person, product_id=pid, category=cat, price=price)
        viewed.append((pid, cat, price))
        t += gap(45)
        if rng.random() < 0.06:                       # пауза внутри сессии: 6–25 минут
            t += pd.Timedelta(minutes=float(rng.uniform(6, 25)))
    # корзина
    p_cart = min(0.9, 0.20 * intent * (1.6 if reorder else 1.0))
    if (viewed or reorder) and rng.random() < p_cart:
        k = 1 + rng.poisson(0.5)
        for j in range(k):
            if viewed and not reorder:
                pid, cat, price = viewed[rng.integers(len(viewed))]
            else:
                pid, cat, price = products[rng.choice(len(products), p=prod_w)]
            qty = 1 + (rng.random() < 0.15)
            dev["cart"].append((pid, cat, price, qty))
            emit(t, "add_to_cart", dev, person, product_id=pid, category=cat, price=price)
            t += gap(40)
        new_checkout = plat != "web" and app_version(dev, t) >= "3.0"     # релиз 3.0: новое оформление заказа
        go_checkout = rng.random() < min(0.95, 0.45 * intent * app_boost * (1.20 if new_checkout else 1.0))
    elif quick:
        go_checkout = rng.random() < min(0.95, 0.40 * intent * app_boost)
    else:
        # корзина, собранная раньше (в прошлой сессии на этом устройстве)
        go_checkout = bool(dev["cart"]) and rng.random() < 0.18 * intent
    if go_checkout and dev["cart"]:
        if not dev["logged_in"]:
            if person["user_id"] is None and rng.random() > 0.80:
                return t                              # не стал регистрироваться
            if person["user_id"] is not None and rng.random() > 0.92:
                return t
            t = ensure_account(t + gap(30), dev, person, "email")
        value = int(sum(p * q for _, _, p, q in dev["cart"]))
        emit(t, "checkout_start", dev, person, revenue=value)
        t += gap(60)
        ver = app_version(dev, t)
        p_ok = 0.93 if not (plat == "android" and ver == "3.2") else 0.15     # баг оплаты в Android 3.2
        for attempt in range(2):
            if rng.random() < p_ok:
                oid = f"o_{100000 + new_id('o')}"
                emit(t, "order_paid", dev, person, origin="server", order_id=oid, revenue=value)
                emit(t + pd.Timedelta(seconds=float(rng.uniform(1, 4))), "purchase", dev, person, order_id=oid, revenue=value)
                person["orders"] += 1
                dev["cart"] = []
                t += gap(20)
                break
            emit(t, "payment_failed", dev, person, origin="server", revenue=value)
            t += pd.Timedelta(seconds=float(rng.uniform(30, 150)))
            if rng.random() > 0.30:
                break
    return t


def local_start(day, person, hour=None, minute=None):
    h = rng.choice(HOURS, p=hw) if hour is None else hour
    m = rng.uniform(0, 60) if minute is None else minute
    return day + pd.Timedelta(hours=float(h) - TZ[person["country"]], minutes=float(m))


def make_person(cohort_day, channel, platform, campaign=False, old=False):
    pid = len(people)
    country = rng.choice(list(TZ), p=[0.40, 0.33, 0.17, 0.10])
    intent = {"органика": 1.0, "партнёры": 1.5, "реклама": 0.65}[channel] * (0.8 if campaign else 1.0) * rng.lognormal(0, 0.25)
    p = dict(pid=pid, country=str(country), channel=channel, intent=intent, user_id=None, signup=None, orders=0,
             cohort_start=cohort_day, campaign=campaign, old=old)
    p["devices"] = [new_device(platform, cohort_day)]
    people.append(p)
    return p


def new_device(platform, installed):
    return dict(id=dev_id(), platform=platform, logged_in=False, cart=[], lag=float(rng.exponential(3)),
                adblock=(platform == "web" and rng.random() < 0.12), installed=installed)


people = []

# канал привлечения и платформа связаны: реклама — установки приложения, партнёры (кешбэк-сервисы) ведут на сайт
PLATFORM_BY_CHANNEL = {"органика": [0.42, 0.25, 0.33], "реклама": [0.50, 0.30, 0.20], "партнёры": [0.09, 0.06, 0.85]}  # android, ios, web

# ---------- старые пользователи: пришли до начала журнала (октябрь — декабрь 2025) ----------
OLD_FROM = pd.Timestamp("2025-10-01")
old_days = sorted(OLD_FROM + pd.Timedelta(days=int(x)) for x in rng.integers(0, (START - OLD_FROM).days, 1800))
for day0 in old_days:
    channel = str(rng.choice(["органика", "реклама", "партнёры"], p=[0.50, 0.25, 0.25]))
    platform = str(rng.choice(["android", "ios", "web"], p=PLATFORM_BY_CHANNEL[channel]))
    person = make_person(day0, channel, platform, old=True)
    person["user_id"] = f"u_{new_id('u'):05d}"
    signup = day0 + pd.Timedelta(hours=float(rng.uniform(8, 23)) - TZ[person["country"]])
    users.append(dict(user_id=person["user_id"], signup_time=signup, country=person["country"],
                      acquisition_channel=channel, signup_platform=platform))
    person["devices"][0]["logged_in"] = True

# ---------- новые люди: приходят каждую неделю журнала ----------
for w in range(N_WEEKS):
    week0 = START + pd.Timedelta(weeks=w)
    n = int(rng.poisson(270 * (1 + 0.012 * w)))
    n_camp = int(rng.poisson(230)) if CAMPAIGN[0] <= week0 < CAMPAIGN[1] else 0
    for k in range(n + n_camp):
        campaign = k >= n
        if campaign:
            channel, platform = "реклама", rng.choice(["android", "ios", "web"], p=[0.55, 0.25, 0.20])
        else:
            channel = rng.choice(["органика", "реклама", "партнёры"], p=[0.50, 0.25, 0.25])
            platform = rng.choice(["android", "ios", "web"], p=PLATFORM_BY_CHANNEL[str(channel)])
        day0 = week0 + pd.Timedelta(days=int(rng.choice(7, p=[0.16, 0.15, 0.15, 0.14, 0.13, 0.13, 0.14])))
        make_person(day0, str(channel), str(platform), campaign)

for person in people:
    day0 = person["cohort_start"]
    dev0 = person["devices"][0]
    a = rng.gamma(0.7, 1 / 0.7)
    q = 0.030
    if dev0["platform"] != "web" and day0 >= RELEASE_30:
        q = 0.050                                    # новый онбординг: выше плато
    if person["channel"] == "реклама":
        q *= 0.8
    if person["campaign"]:
        q *= 0.45
    h = 0.17 * (0.6 if person["campaign"] else 1.0)
    second = rng.random() < 0.22
    days = [] if person["old"] else [0]
    for d in range(max(1, (START - day0).days), (END - day0).days + 1):
        pd_ = min(0.85, a * (q + (h - q) * np.exp(-(d - 1) / 6)))
        if rng.random() < pd_:
            days.append(d)
    for i, d in enumerate(days):
        day = day0 + pd.Timedelta(days=d)
        n_s = 1 + rng.poisson(0.3)
        starts = sorted(local_start(day, person) for _ in range(n_s))
        last_end = None
        for j, s in enumerate(starts):
            if last_end is not None and s < last_end + pd.Timedelta(minutes=35):
                s = last_end + pd.Timedelta(minutes=float(rng.uniform(32, 70)))
            dev = dev0
            if second and i > 0 and rng.random() < 0.35:
                if len(person["devices"]) == 1:
                    plat2 = "web" if dev0["platform"] != "web" else str(rng.choice(["android", "ios"], p=[0.65, 0.35]))
                    person["devices"].append(new_device(plat2, day))
                dev = person["devices"][1]
            last_end = session(s, dev, person, first=(i == 0 and j == 0 and not person["old"]))

# ---------- герой страницы 9.1: один человек, телефон и ноутбук ----------
hero = make_person(pd.Timestamp("2026-04-20"), "органика", "android")
hero["country"] = "BY"; hero["intent"] = 1.0
phone = hero["devices"][0]; phone["lag"] = 0.5
laptop = new_device("web", pd.Timestamp("2026-05-13")); laptop["adblock"] = False
hero["devices"].append(laptop)


def at(day, hh, mm, ss=0):
    return pd.Timestamp(day) + pd.Timedelta(hours=hh - 3, minutes=mm, seconds=ss)  # Минск, UTC+3


# регистрация на телефоне 20 апреля, два коротких визита до истории
emit(at("2026-04-20", 21, 14), "app_open", phone, hero, traffic_source="search")
emit(at("2026-04-20", 21, 15, 10), "product_view", phone, hero, product_id=11, category="текстиль", price=4250)
ensure_account(at("2026-04-20", 21, 16, 2), phone, hero, "phone")
emit(at("2026-04-20", 21, 17, 30), "product_view", phone, hero, product_id=3, category="текстиль", price=3340)
emit(at("2026-05-03", 12, 40), "app_open", phone, hero, traffic_source="push")
emit(at("2026-05-03", 12, 41, 5), "product_view", phone, hero, product_id=14, category="посуда", price=2700)
# 12 мая: утро на телефоне (корзина), вечер на том же телефоне (оплата);
# 13 мая: ноутбук на работе — анонимно; 15 мая: ноутбук, вход и второй заказ
D = "2026-05-12"
script = [
    (D, phone, 8, 5, 12, "app_open", dict(traffic_source="push")),
    (D, phone, 8, 5, 50, "product_view", dict(product_id=11, category="текстиль", price=4250)),
    (D, phone, 8, 6, 40, "product_view", dict(product_id=19, category="текстиль", price=4390)),
    (D, phone, 8, 8, 15, "product_view", dict(product_id=27, category="текстиль", price=3910)),
    (D, phone, 8, 9, 2, "add_to_cart", dict(product_id=27, category="текстиль", price=3910)),
    (D, phone, 8, 10, 30, "product_view", dict(product_id=29, category="посуда", price=730)),
    (D, phone, 8, 23, 41, "product_view", dict(product_id=13, category="посуда", price=690)),     # пауза 13 минут
    (D, phone, 8, 24, 20, "add_to_cart", dict(product_id=13, category="посуда", price=690)),
    (D, phone, 19, 40, 5, "app_open", dict(traffic_source="push")),
    (D, phone, 19, 40, 40, "product_view", dict(product_id=27, category="текстиль", price=3910)),
    (D, phone, 19, 41, 30, "checkout_start", dict(revenue=4600)),
    ("2026-05-13", laptop, 12, 31, 10, "app_open", dict(traffic_source="search")),
    ("2026-05-13", laptop, 12, 32, 0, "product_view", dict(product_id=7, category="декор", price=1900)),
    ("2026-05-13", laptop, 12, 33, 20, "add_to_cart", dict(product_id=7, category="декор", price=1900)),
    ("2026-05-15", laptop, 20, 10, 5, "app_open", dict(traffic_source="direct")),
]
for day, dev, hh, mm, ss, name, props in script:
    emit(at(day, hh, mm, ss), name, dev, hero, **props)
    if (day, hh, mm, ss) == (D, 19, 41, 30):                   # оплата вечером на телефоне
        oid = f"o_{100000 + new_id('o')}"
        emit(at(D, 19, 42, 45), "order_paid", phone, hero, origin="server", order_id=oid, revenue=4600)
        emit(at(D, 19, 42, 47), "purchase", phone, hero, order_id=oid, revenue=4600)
ensure_account(at("2026-05-15", 20, 10, 40), laptop, hero, None)   # вход: с этого события у ноутбука есть user_id
emit(at("2026-05-15", 20, 11, 15), "checkout_start", laptop, hero, revenue=1900)
oid2 = f"o_{100000 + new_id('o')}"
emit(at("2026-05-15", 20, 12, 30), "order_paid", laptop, hero, origin="server", order_id=oid2, revenue=1900)
emit(at("2026-05-15", 20, 12, 32), "purchase", laptop, hero, order_id=oid2, revenue=1900)
hero_ids = dict(user_id=hero["user_id"], phone=phone["id"], laptop=laptop["id"], orders=(oid, oid2))

# ---------- боты на сайте ----------
bots = []
for b in range(6):
    bot_p = dict(pid=-1 - b, country="RU", user_id=None)
    bdev = new_device("web", None); bdev["adblock"] = False; bots.append(bdev["id"])
    for d in sorted(rng.choice((END - START).days, size=int(rng.integers(3, 12)), replace=False)):
        t = START + pd.Timedelta(days=int(d), hours=float(rng.uniform(0, 23)))
        for i in range(int(rng.integers(150, 500))):
            if i % 25 == 0:
                emit(t, "app_open", bdev, bot_p, traffic_source="direct")
            pid, cat, price = products[rng.integers(len(products))]
            emit(t, "product_view", bdev, bot_p, product_id=pid, category=cat, price=price)
            t += pd.Timedelta(seconds=float(rng.uniform(1.5, 4)))

# ---------- сборка журнала: блокировщики, потери, дубли ----------
ev = pd.DataFrame(rows)
client = ev.origin == "client"
lost = client & ev._adblock                                                 # блокировщик режет все клиентские события устройства
lost |= client & (ev.event_name == "purchase") & (ev.platform != "web") & (rng.random(len(ev)) < 0.04)  # приложение закрыли раньше отправки
ev = ev[~lost]
dup = (ev.origin == "client") & (rng.random(len(ev)) < 0.015)               # повторная отправка: тот же event_id
ev = pd.concat([ev, ev[dup]]).sort_values(["event_time", "event_id"], kind="stable").reset_index(drop=True)
ev = ev.drop(columns=["_adblock", "_person"])
for c in ["product_id", "price", "revenue"]:
    ev[c] = ev[c].astype("Int64")
ev["event_time"] = pd.to_datetime(ev["event_time"]).dt.floor("s").dt.tz_localize("UTC")

ev.to_parquet(P / "events.parquet", index=False)
out = ev.copy()
out["event_time"] = out["event_time"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
out.to_csv(P / "events.csv.gz", index=False)
us = pd.DataFrame(users).sort_values("user_id")
us["signup_time"] = pd.to_datetime(us["signup_time"]).dt.floor("s").dt.tz_localize("UTC").dt.strftime("%Y-%m-%dT%H:%M:%SZ")
us.to_csv(P / "users.csv", index=False)

print(ev.shape, "событий;", us.shape[0], "аккаунтов;", len(people), "человек (с героем)")
print("герой:", hero_ids)
print("боты:", bots)
print(ev.event_name.value_counts().to_dict())
