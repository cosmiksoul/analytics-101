"""Собирает учебный файл orders_big.csv для страницы 1.3: миллион строк, около 23 МБ.

Запуск: python make_orders_big.py
Файл — восемь строк учебной выгрузки, повторённые 125 000 раз. Случайности нет,
поэтому файл получается одинаковым на любой машине.
"""
pattern = [(" lumo", 1200, "paid"), ("BRISA", 850, "cancelled"), ("Lumo ", 2300, "paid"), ("kedr", 640, "paid"),
           ("brisa", 1750, "paid"), ("KEDR ", 990, "cancelled"), ("Lumo", 1430, "paid"), ("Brisa ", 560, "paid")]

with open("orders_big.csv", "w", encoding="utf-8", newline="\n") as f:   # newline="\n": одинаковый файл в Windows и Linux
    f.write("order_id,brand,amount,status\n")
    n = 0
    for _ in range(125_000):
        for brand, amount, status in pattern:
            n += 1
            f.write(f"{n},{brand},{amount},{status}\n")

print("строк с заказами:", n)
