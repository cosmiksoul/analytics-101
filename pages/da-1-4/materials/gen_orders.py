"""Генератор учебной выгрузки data/orders.csv для страницы 1.4.

Запуск: python gen_orders.py
В файле заголовок и 1 200 заказов за первый квартал 2026 года. Строка файла 1 000
(заказ 999) записана в кодировке cp1251, остальные — в UTF-8: на ней и падает чтение.
Зерно генератора случайных чисел зафиксировано: random.Random(14), поэтому файл
получается одинаковым на любой машине.
"""
import datetime as dt
import random
from pathlib import Path

rnd = random.Random(14)
cats = ["Электроника", "Дом и сад", "Книги", "Одежда", "Игрушки"]
start = dt.date(2026, 1, 1)

lines = ["order_id,date,category,amount"]
for i in range(1, 1201):
    d = start + dt.timedelta(days=(i - 1) * 90 // 1200)   # заказы идут по порядку, 90 дней
    c = rnd.choice(cats)
    a = rnd.randrange(300, 9001, 10)                      # сумма от 300 до 9 000 ₽ с шагом 10
    lines.append(f"{i},{d.isoformat()},{c},{a}")

Path("data").mkdir(exist_ok=True)
with open(Path("data") / "orders.csv", "wb") as f:        # "wb": пишем байты, кодировку выбираем сами
    for n, line in enumerate(lines, start=1):
        enc = "cp1251" if n == 1000 else "utf-8"          # одна строка в другой кодировке
        f.write((line + "\n").encode(enc))

print("строк в файле:", len(lines))
print("строка 1000:", lines[999])
