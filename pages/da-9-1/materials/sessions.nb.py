# %% [markdown]
# # 9.1 Событийная модель: события, сессии, пользователи — код страницы
#
# Аналитика 101 · блок «Дата аналитика» · тема 09 «Продуктовые метрики и события» · страница 9.1.
#
# В ноутбуке два блока кода страницы на pandas: сессии через `diff` и `cumsum`, затем склейка устройств и витрина «пользователь — день». Третий блок страницы — тот же расчёт сессий на SQL — лежит рядом файлом `sessions.sql`, ему нужен PostgreSQL. В конце — лента героя из интерактива: 21 строка и все 28 состояний ползунка и переключателя. Данные учебные: журнал событий из общего набора темы `data/events/`.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз: второй блок продолжает первый.
#
# Вывод получен на Python 3.13, pandas 3.0 и pyarrow 26.

# %% [markdown]
# ## Где лежат данные
#
# Код страницы читает журнал по пути от корня папки с материалами: `data/events/events.parquet`. Ноутбук лежит в папке страницы, поэтому первая ячейка поднимается до папки, в которой есть `data/`, и делает её рабочей. Папку самого ноутбука запоминаем: рядом с ним лежит `hero_12_15_may.csv`.

# %% code
import os
import pathlib
import platform

import pandas as pd
import pyarrow

here = pathlib.Path.cwd()                   # папка ноутбука: здесь лежит hero_12_15_may.csv
root = here
while not (root / "data" / "events").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/events/
assert (root / "data" / "events" / "events.parquet").exists(), \
    "Не найдена папка data/events/. Скачайте общий набор темы 09 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| pandas", pd.__version__, "| pyarrow", pyarrow.__version__)

# %% [markdown]
# ## Код: сессии и витрина

# %% page:pandas

# %% page:userday

# %% [markdown]
# ## Лента героя: 28 состояний интерактива
#
# В интерактиве страницы — 21 строка героя за 12–15 мая, ползунок порога неактивности и переключатель склейки. Ниже тот же расчёт для всех 14 значений порога, без склейки и со склейкой. Правило страницы: сессия считается по устройству; серверный `order_paid` относим к последней сессии того же человека, начатой до оплаты; без склейки человек — `user_id` строки, а если его нет — `anonymous_id`.

# %% code
hero_rows = pd.read_csv(here / "hero_12_15_may.csv", parse_dates=["event_time"])
print(len(hero_rows), "строк:", hero_rows["origin"].value_counts().to_dict())


def hero_state(h, minutes, stitch):
    """Сессии, сессии с заказом, люди и покупатели на ленте героя."""
    account = h.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id")["user_id"].first()
    who = h["user_id"].fillna(h["anonymous_id"].map(account) if stitch else h["anonymous_id"]).fillna(h["anonymous_id"])
    h = h.assign(who=who)
    c = h[h["origin"] == "client"].sort_values(["anonymous_id", "event_time", "event_id"])
    gap = c.groupby("anonymous_id")["event_time"].diff()
    c = c.assign(session_no=(gap.isna() | (gap > pd.Timedelta(minutes=minutes))).groupby(c["anonymous_id"]).cumsum())
    sess = c.groupby(["anonymous_id", "session_no"]).agg(start=("event_time", "min"), people=("who", set))
    paid = h[h["event_name"] == "order_paid"]
    with_order = {sess[(sess["start"] <= o.event_time) & sess["people"].map(lambda p: o.who in p)]["start"].idxmax()
                  for o in paid.itertuples()}
    return len(sess), len(with_order), h["who"].nunique(), paid["who"].nunique()


print("порог, мин | без склейки: сессий, с заказом, людей, покупателей | со склейкой: то же")
for minutes in [1, 2, 5, 10, 15, 20, 30, 45, 60, 120, 240, 480, 720, 1440]:
    a, b = hero_state(hero_rows, minutes, False), hero_state(hero_rows, minutes, True)
    print(f"{minutes:>10} | {a[0]:>2} {a[1]} {a[2]} {a[3]} | {b[0]:>2} {b[1]} {b[2]} {b[3]}")

# %% [markdown]
# Порог меняет только число сессий: от 10 при одной минуте до 3 при 12 часах. Склейка меняет только число людей: без неё их двое, и конверсия людей в покупку — 50% вместо 100%.
