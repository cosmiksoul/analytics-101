import os
import time

import pandas as pd
import requests

from load_csv import COLS

URL = "http://127.0.0.1:8765/v1/orders"     # учебный сервер из материалов: api_server.py
LIMIT_PER_MIN = 30                           # лимит из документации API
PAUSE = 60 / LIMIT_PER_MIN                   # 2 секунды между запросами

session = requests.Session()
session.headers["Authorization"] = f"Bearer {os.environ['SHOP_API_TOKEN']}"   # учебный ключ из окружения


def get_page(page, tries=4):
    params = {"date_from": "2026-01-01", "date_to": "2026-03-31", "page": page, "per_page": 4}
    for attempt in range(tries):
        r = session.get(URL, params=params, timeout=10)
        if r.status_code == 429 or r.status_code >= 500:     # лимит или сбой: ждём и повторяем
            wait = float(r.headers.get("Retry-After", 2 ** attempt))
            print(f"  page={page}: {r.status_code}, жду {wait:g} с")
            time.sleep(wait)
            continue
        r.raise_for_status()                                  # 401, 404 — сразу ошибка
        return r.json()
    raise RuntimeError(f"page={page}: не удалось получить страницу за {tries} попытки")


def read_app(verbose=True):
    items, page = [], 1
    while page is not None:                  # next_page = None: страниц больше нет
        data = get_page(page)
        items += data["items"]
        if verbose:
            print(f"page={page}: {len(data['items'])} записи, next_page={data['next_page']}")
        page = data["next_page"]
        time.sleep(PAUSE)
    flat = pd.json_normalize(items)          # {"brand": {"name": …}} → столбец brand.name
    if verbose:
        print(list(flat.columns))
    flat = flat.rename(columns={"id": "order_id", "created": "date", "brand.name": "brand",
                                "customer.country": "country", "utm.channel": "channel",
                                "total.amount": "amount"})
    return flat[COLS].assign(date=lambda d: pd.to_datetime(d["date"], format="%Y-%m-%d"))


if __name__ == "__main__":
    app = read_app()
    print(app.head(3))
    print("без паузы:", [get_page(1)["page"] for _ in range(2)])   # второй запрос упрётся в лимит
