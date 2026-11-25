"""Учебный сервер выдаёт заказы приложения по страницам. Для доступа нужен учебный ключ.
Запуск: SHOP_API_TOKEN=<учебный ключ> python api_server.py"""
import json
import math
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ORDERS = json.load(open("data/app_orders.json", encoding="utf-8"))   # 10 учебных заказов
TOKEN = os.environ["SHOP_API_TOKEN"]
INTERVAL = 60 / 30            # минимальный интервал между запросами — две секунды
last = {"t": -math.inf}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(url.query).items()}
        if url.path != "/v1/orders":
            return self.reply(404, {"error": "not found"})
        if self.headers.get("Authorization") != f"Bearer {TOKEN}":
            return self.reply(401, {"error": "bad token"})
        wait = last["t"] + INTERVAL - time.monotonic()
        if wait > 0:                                   # слишком часто — 429 и сколько ждать
            return self.reply(429, {"error": "too many requests"}, {"Retry-After": str(math.ceil(wait))})
        last["t"] = time.monotonic()
        page, per = int(q.get("page", 1)), int(q.get("per_page", 4))
        rows = [o for o in ORDERS if q.get("date_from", "") <= o["created"] <= q.get("date_to", "9999")]
        items = rows[(page - 1) * per: page * per]
        self.reply(200, {"page": page, "per_page": per, "total": len(rows),
                         "next_page": page + 1 if page * per < len(rows) else None, "items": items})

    def reply(self, code, body, headers=None):
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):                      # без журнала в консоли
        pass


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
