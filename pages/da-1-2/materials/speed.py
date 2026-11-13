"""Замеры скорости со страницы 1.2: поиск, удаление повторов, цикл против NumPy.

Запуск: python speed.py
Нужен NumPy. Данные случайные, зерно зафиксировано: random.seed(42).
Время зависит от машины, поэтому ваши числа будут другими. Разрыв между
способами останется: он задан устройством коллекций, а не скоростью процессора.
"""
import platform
import random
import timeit

import numpy as np

random.seed(42)
amounts = [random.randint(300, 5000) for _ in range(1_000_000)]   # миллион сумм заказов, ₽
data = [random.randint(0, 20_000) for _ in range(20_000)]         # 20 000 чисел с повторами

print("Python", platform.python_version(), "| numpy", np.__version__)


def best(fn, number=1, repeat=5):
    """Лучшее из repeat замеров: время одного вызова в секундах."""
    return min(timeit.repeat(fn, number=number, repeat=repeat)) / number


def times(ratio):
    """Разрыв «во сколько раз» с пробелом между разрядами."""
    return f"×{ratio:,.0f}".replace(",", " ")


# 1. Поиск числа, которое стоит в самом конце: список проверяет элементы по очереди,
#    множество находит место по хэшу
lst = list(range(1_000_000))
st = set(lst)
t_list = best(lambda: 999_999 in lst, number=10)
t_set = best(lambda: 999_999 in st, number=100_000)
print(f"поиск: в списке {t_list * 1e3:.1f} мс, во множестве {t_set * 1e6:.2f} мкс, разрыв {times(t_list / t_set)}")


# 2. Удаление повторов: цикл с проверкой по списку seen против set(data)
def dedupe_loop():
    seen = []
    for x in data:
        if x not in seen:        # каждый раз просматривает весь seen
            seen.append(x)
    return seen


t_loop = best(dedupe_loop, repeat=3)
t_setd = best(lambda: set(data), repeat=3)
print(f"повторы: циклом {t_loop:.2f} с, set(data) {t_setd * 1e3:.2f} мс, разрыв {times(t_loop / t_setd)}")


# 3. Умножить миллион сумм на 0,9: цикл по списку против одного выражения NumPy
def discount_loop():
    out = []
    for x in amounts:
        out.append(x * 0.9)
    return out


arr = np.array(amounts)
t_py = best(discount_loop)
t_np = best(lambda: arr * 0.9)
print(f"скидка: циклом {t_py * 1e3:.0f} мс, NumPy {t_np * 1e3:.1f} мс, разрыв {times(t_py / t_np)}")
