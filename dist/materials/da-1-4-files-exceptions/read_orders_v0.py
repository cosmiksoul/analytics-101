from pathlib import Path

path = Path("data") / "orders.csv"      # учебная выгрузка: заголовок + 1 200 заказов

orders = []
with open(path, "rb") as f:             # "rb": читаем байты, расшифровываем сами
    for n, raw in enumerate(f, start=1):  # n — номер строки файла, с единицы
        line = raw.decode("utf-8")      # байты → текст по таблице UTF-8
        if n > 1:                       # строка 1 — заголовок
            orders.append(line.rstrip("\n").split(","))

print("заказов прочитано:", len(orders))
