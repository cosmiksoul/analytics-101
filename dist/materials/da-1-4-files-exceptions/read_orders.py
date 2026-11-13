from pathlib import Path

path = Path("data") / "orders.csv"

orders, bad = [], []                    # заказы и номера битых строк
with open(path, "rb") as f:
    for n, raw in enumerate(f, start=1):
        try:
            line = raw.decode("utf-8")
        except UnicodeDecodeError as e:  # ловим только эту ошибку
            bad.append(n)
            print(f"строка {n}: {e}")
            continue                    # сразу к следующей строке
        if n > 1:
            orders.append(line.rstrip("\n").split(","))

print("заказов прочитано:", len(orders))
print("битых строк:", len(bad), bad)
print("файл закрыт:", f.closed)
