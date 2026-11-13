"""Разовая сборка учебной папки exports/ (в материалы идёт сама папка, не этот скрипт).

Запуск из pages/da-1-3/materials: python3 _make_exports.py
Нужен openpyxl — только здесь, читателю он не понадобится.
"""
from pathlib import Path

from openpyxl import Workbook

rows = [(1, " lumo", 1200, "paid"), (2, "BRISA", 850, "cancelled"), (3, "Lumo ", 2300, "paid"),
        (4, "kedr", 640, "paid"), (5, "brisa", 1750, "paid"), (6, "KEDR ", 990, "cancelled"),
        (7, "Lumo", 1430, "paid"), (8, "Brisa ", 560, "paid")]
days = {"2026-11-01": rows[:3], "2026-11-02": rows[3:6], "2026-11-03": rows[6:]}
out = Path("exports")
out.mkdir(exist_ok=True)
head = "order_id,brand,amount,status\n"
for day, part in days.items():
    text = head + "".join(f"{i},{b},{a},{s}\n" for i, b, a, s in part)
    (out / f"orders_{day}.csv").write_text(text, encoding="utf-8", newline="\n")
(out / "returns_2026-11-02.csv").write_text("order_id,brand,amount,reason\n1, lumo,1200,не подошёл размер\n",
                                             encoding="utf-8", newline="\n")
wb = Workbook()
ws = wb.active
ws.title = "orders"
ws.append(["order_id", "brand", "amount", "status"])
for r in days["2026-11-03"]:
    ws.append(list(r))
wb.save(out / "orders_2026-11-03.xlsx")
# Файл-замок, который Excel кладёт рядом с открытой книгой: 165 байт с именем пользователя
name = "Аналитик"
lock = bytes([len(name)]) + name.encode("cp1251").ljust(54, b" ") + bytes([len(name), 0]) + name.encode("utf-16-le").ljust(108, b" ")
(out / "~$orders_2026-11-03.xlsx").write_bytes(lock)
(out / "README.txt").write_text(
    "Учебная папка для страницы 1.3 курса «Аналитика 101».\n\n"
    "orders_2026-11-01.csv, orders_2026-11-02.csv, orders_2026-11-03.csv — выгрузки заказов по дням:\n"
    "восемь учебных заказов со страницы, по два-три на день.\n"
    "returns_2026-11-02.csv — возвраты: файл с другим именем, в отбор попасть не должен.\n"
    "orders_2026-11-03.xlsx — та же выгрузка за 3 ноября, сохранённая в Excel.\n"
    "~$orders_2026-11-03.xlsx — заглушка: такой временный файл Excel создаёт рядом с открытой книгой.\n\n"
    "Блоку кода «Comprehension для списка файлов» нужны только имена этих файлов.\n",
    encoding="utf-8", newline="\n")
print(sorted(p.name for p in out.iterdir()))
