# %% [markdown] main
# # 1.3 Условия, циклы, функции: код страницы и упражнения
#
# Аналитика 101 · блок «Дата аналитика» · тема 01 «Python для анализа» · страница 1.3.
#
# В ноутбуке восемь блоков кода со страницы и пять упражнений: копипаст → цикл → comprehension и обратно. Данные учебные.
#
# **Как работать.** Выполняйте ячейки по порядку сверху вниз. В упражнении замените `...` своим кодом и запустите ячейку проверки под ним. Она напечатает «верно» или покажет, что не сошлось. Решения с разбором — в `loops_functions_solutions.ipynb`.
#
# **Файлы.** Двум блокам нужны файлы рядом с ноутбуком: папка `exports` и `orders_big.csv` на миллион строк. Если их нет, ячейка подготовки создаст их сама — так ноутбук работает и в Colab. Файл на миллион строк занимает около 23 МБ, а блок про генератор на несколько секунд берёт около 360 МБ памяти.
#
# Вывод под блоками кода получен на Python 3.13. На другой версии он может отличаться в мелочах.

# %% [markdown] solutions
# # 1.3 Условия, циклы, функции: решения упражнений
#
# Аналитика 101 · блок «Дата аналитика» · тема 01 «Python для анализа» · страница 1.3.
#
# Сначала идут восемь блоков кода со страницы: упражнения берут из них функцию `clean_brand`. Решения с разбором — во второй половине. Ноутбук выполнен целиком сверху вниз, все проверки прошли.
#
# Загляните сюда после своей попытки: чужое решение понятнее, когда уже есть своё.

# %% code
import platform

print("Python", platform.python_version())   # версия, на которой запущен ноутбук

# %% [markdown]
# ## Подготовка файлов

# %% code
# Если учебных файлов нет рядом с ноутбуком, ячейка создаст их сама
import os

if not os.path.isdir("exports"):            # блоку про список файлов нужны только имена, поэтому файлы пустые
    os.makedirs("exports")
    for name in ["README.txt", "orders_2026-11-01.csv", "orders_2026-11-02.csv", "orders_2026-11-03.csv",
                 "orders_2026-11-03.xlsx", "returns_2026-11-02.csv", "~$orders_2026-11-03.xlsx"]:
        open(os.path.join("exports", name), "w").close()

if not os.path.exists("orders_big.csv"):    # то же, что делает make_orders_big.py
    pattern = [(" lumo", 1200, "paid"), ("BRISA", 850, "cancelled"), ("Lumo ", 2300, "paid"), ("kedr", 640, "paid"),
               ("brisa", 1750, "paid"), ("KEDR ", 990, "cancelled"), ("Lumo", 1430, "paid"), ("Brisa ", 560, "paid")]
    with open("orders_big.csv", "w", encoding="utf-8", newline="\n") as f:
        f.write("order_id,brand,amount,status\n")
        n = 0
        for _ in range(125_000):
            for brand, amount, status in pattern:
                n += 1
                f.write(f"{n},{brand},{amount},{status}\n")

print("файлов в exports:", len(os.listdir("exports")), "| orders_big.csv:", os.path.getsize("orders_big.csv"), "байт")

# %% [markdown]
# ## Код страницы

# %% page:basics

# %% page:recur

# %% page:defaults

# %% [markdown]
# ### Переменная цикла после цикла
#
# На странице этот блок заканчивается ошибкой `NameError`: переменной `late` нет, потому что цикл не сделал ни одной итерации. Здесь последняя строка обёрнута в `try`/`except`, чтобы ноутбук выполнялся до конца. Сама конструкция — тема страницы 1.4.

# %% code within:leak
rows = [{"brand": " lumo", "amount": 1200}, {"brand": "BRISA", "amount": 850}]

for row in rows:
    pass
print(row)               # переменная цикла пережила цикл: последняя строка

amounts = [r["amount"] for r in rows]
print("r" in globals())  # переменная comprehension наружу не выходит

for late in []:          # пустая выгрузка: ни одной итерации
    pass
try:
    print(late)
except NameError as e:   # на странице здесь скрипт падает
    print("NameError:", e)

# %% page:guard

# %% page:brand

# %% page:files

# %% page:gen

# %% [markdown]
# ## Упражнения
#
# Сначала заведём данные заново: после блока про генератор имя `rows` указывает уже не на список.

# %% code
amounts = [1200, 850, 2300, 640, 1750]   # суммы заказов, ₽
rows = [                                 # та же выгрузка из восьми заказов, что в блоке про бренды
    {"brand": " lumo",  "amount": 1200, "status": "paid"},
    {"brand": "BRISA",  "amount": 850,  "status": "cancelled"},
    {"brand": "Lumo ",  "amount": 2300, "status": "paid"},
    {"brand": "kedr",   "amount": 640,  "status": "paid"},
    {"brand": "brisa",  "amount": 1750, "status": "paid"},
    {"brand": "KEDR ",  "amount": 990,  "status": "cancelled"},
    {"brand": "Lumo",   "amount": 1430, "status": "paid"},
    {"brand": "Brisa ", "amount": 560,  "status": "paid"},
]
print(len(amounts), "сумм,", len(rows), "строк выгрузки")

# %% [markdown]
# ### Упражнение 1. Копипаст → цикл
#
# Цены со скидкой 10% посчитаны копипастом, и только для трёх заказов из пяти:
#
# ```python
# price_1 = round(1200 * 0.9)
# price_2 = round(850 * 0.9)
# price_3 = round(2300 * 0.9)
# ```
#
# Перепишите расчёт циклом по списку `amounts`. Результат — список `discounted` из пяти целых чисел.

# %% exercise
discounted = ...   # ваш код: пустой список, цикл for и append

# %% solution
discounted = []
for a in amounts:
    discounted.append(round(a * 0.9))
print(discounted)

# %% check
assert discounted == [1080, 765, 2070, 576, 1575], f"Ожидался список [1080, 765, 2070, 576, 1575], получено {discounted!r}"
print("Упражнение 1: верно")

# %% [markdown] solutions
# **Разбор.** Три строки отличались одним числом. Это признак цикла: число стало переменной `a`, а повтор взял на себя `for`. Заодно расчёт перестал зависеть от того, сколько заказов в списке.

# %% [markdown]
# ### Упражнение 2. Условие → функция
#
# Первый блок кода печатает метку заказа через `if`/`elif`/`else`. Сделайте из этого условия функцию `size_label(amount)`, которая метку возвращает: от 2000 ₽ — `"крупный"`, от 1000 ₽ — `"средний"`, меньше — `"мелкий"`. Если суммы нет (`None`), функция возвращает `"нет суммы"`. Используйте ранний `return`.

# %% exercise
def size_label(amount):
    ...   # ваш код

# %% solution
def size_label(amount):
    if amount is None:       # особый случай — первым, как в order_label_flat на странице
        return "нет суммы"
    if amount >= 2000:
        return "крупный"
    if amount >= 1000:
        return "средний"
    return "мелкий"


print([size_label(a) for a in amounts], size_label(None))

# %% check
got = [size_label(a) for a in [2300, 2000, 1999, 1000, 999, None]]
assert got == ["крупный", "крупный", "средний", "средний", "мелкий", "нет суммы"], f"Получено {got!r}"
print("Упражнение 2: верно")

# %% [markdown] solutions
# **Разбор.** Проверка на `None` стоит первой: сравнение `None >= 2000` закончилось бы ошибкой `TypeError`. После каждого `return` функция уже вышла, поэтому `elif` и `else` не нужны, а код остаётся плоским.

# %% [markdown]
# ### Упражнение 3. Цикл → comprehension
#
# Цикл собирает суммы оплаченных заказов от 1000 ₽:
#
# ```python
# paid_big = []
# for row in rows:
#     if row["status"] == "paid" and row["amount"] >= 1000:
#         paid_big.append(row["amount"])
# ```
#
# Запишите то же одним list comprehension.

# %% exercise
paid_big = ...   # ваш код: [выражение for … in … if …]

# %% solution
paid_big = [row["amount"] for row in rows
            if row["status"] == "paid" and row["amount"] >= 1000]
print(paid_big)

# %% check
assert paid_big == [1200, 2300, 1750, 1430], f"Ожидался список [1200, 2300, 1750, 1430], получено {paid_big!r}"
print("Упражнение 3: верно")

# %% [markdown] solutions
# **Разбор.** Три части цикла переехали в одну запись: что кладём — слева, откуда берём — в середине, какие строки пропускаем — справа. Перенос строки внутри скобок разрешён, и условие на отдельной строке читается легче.

# %% [markdown]
# ### Упражнение 4. Comprehension → цикл
#
# Однострочник ниже собирает по каждому бренду список сумм оплаченных заказов. Считает он верно, но читать его трудно, и для каждой оплаченной строки он заново перебирает всю выгрузку.
#
# Разверните его в обычный цикл с одним проходом по `rows`. Результат — словарь `by_brand`: бренд → список сумм.

# %% code
dense = {clean_brand(r["brand"]): [x["amount"] for x in rows
                                   if x["status"] == "paid" and clean_brand(x["brand"]) == clean_brand(r["brand"])]
         for r in rows if r["status"] == "paid"}
print(dense)

# %% exercise
by_brand = ...   # ваш код: пустой словарь и один цикл for по rows

# %% solution
by_brand = {}
for row in rows:
    if row["status"] == "paid":
        brand = clean_brand(row["brand"])
        if brand not in by_brand:
            by_brand[brand] = []             # первый заказ бренда: заводим пустой список
        by_brand[brand].append(row["amount"])
print(by_brand)

# %% check
assert by_brand == {"Lumo": [1200, 2300, 1430], "Kedr": [640], "Brisa": [1750, 560]}, f"Получено {by_brand!r}"
print("Упражнение 4: верно")

# %% [markdown] solutions
# **Разбор.** Comprehension хорош, пока читается как одна фраза. Здесь внутри одного сидит второй, и на шесть оплаченных строк приходится шесть полных проходов по выгрузке. Цикл длиннее, зато проходит выгрузку один раз, а `clean_brand` вызывает один раз на строку.

# %% [markdown]
# ### Упражнение 5. Список → генератор
#
# Функция `paid_amounts` собирает суммы оплаченных заказов в список. Напишите генератор `iter_paid_amounts(rows)`, который отдаёт те же суммы по одной через `yield`.

# %% code
def paid_amounts(rows):
    result = []
    for row in rows:
        if row["status"] == "paid":
            result.append(row["amount"])
    return result


print(paid_amounts(rows))

# %% exercise
def iter_paid_amounts(rows):
    ...   # ваш код: тот же цикл, но вместо append — yield

# %% solution
def iter_paid_amounts(rows):
    for row in rows:
        if row["status"] == "paid":
            yield row["amount"]      # отдать сумму и замереть до следующего запроса


it = iter_paid_amounts(rows)
print(type(it).__name__, next(it), next(it), sum(iter_paid_amounts(rows)))

# %% check
import inspect

g = iter_paid_amounts(rows)
assert inspect.isgenerator(g), "iter_paid_amounts должна быть генератором: в теле функции нужен yield"
assert next(g) == 1200, "Первое значение генератора — 1200"
assert sum(iter_paid_amounts(rows)) == 7880, "Сумма оплаченных заказов — 7880 ₽"
print("Упражнение 5: верно")

# %% [markdown] solutions
# **Разбор.** Список `result` и `return` исчезли: генератор ничего не накапливает. На восьми строках разницы нет, на миллионе она такая же, как в блоке про `orders_big.csv`: сотни мегабайт против сотых долей.
