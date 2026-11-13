"""Гистограммы интерактива «Ширина корзины» на NumPy при любом числе корзин.

Страница 7.2 «Распределения и выбросы» курса «Аналитика 101».
Запуск из корня папки материалов:
  python da-7-2-distributions-outliers/bin_width.py                 сводка: с какого числа корзин что видно
  python da-7-2-distributions-outliers/bin_width.py 166             гистограмма трат всех клиентов, 166 корзин
  python da-7-2-distributions-outliers/bin_width.py 8 log o12       8 корзин, логарифм, клиенты с 1–2 заказами
Нужен общий набор data/eda/ (clients_export.csv).

Данные те же, что в интерактиве: траты spend_q1 без пяти ошибок ввода (суммы от миллиона). Набор all — все клиенты,
o12 — клиенты с одним-двумя заказами. Корзины считает numpy.histogram. Что видно на гистограмме, решает то же
формальное правило, что и на странице (функция feats): нули стоят отдельным столбиком, пик на 5 000 ₽ поднимается
над соседями, между розницей и оптовиками есть впадина.
"""
import sys

import numpy as np
import pandas as pd

df = pd.read_csv("data/eda/clients_export.csv")
df = df[df["spend_q1"] < 1_000_000]                       # пять ошибок ввода откладываем, как в анимации
SETS = {"all": df["spend_q1"].to_numpy(),
        "o12": df.loc[df["orders_q1"].between(1, 2), "spend_q1"].to_numpy()}
NAMES = {"all": "все клиенты", "o12": "клиенты с 1–2 заказами"}


def histogram(x, k, log):
    """Корзины и счётчики; в логарифме нули в гистограмму не входят."""
    v = np.log10(x[x > 0]) if log else x
    return np.histogram(v, bins=k)


def feats(c, e, log, zeros):
    """Что видно на гистограмме: нули отдельно, пик на 5 000 ₽, второй горб. Правило то же, что на странице."""
    k, w = len(c), e[1] - e[0]
    cen = lambda i: 10 ** ((e[i] + e[i + 1]) / 2) if log else (e[i] + e[i + 1]) / 2
    # нули: в логарифме они всегда отдельно; в обычной шкале — если корзина уже 1 500 ₽ и первая в полтора раза выше второй
    zero = None if not zeros else True if log else bool(w <= 1500 and c[0] >= 1.5 * c[1])
    # пик: корзина с 5 000 ₽ узкая, на 30% выше соседей, и разница больше трёх корней из счётчика
    b = int(np.searchsorted(e[:-1], np.log10(5000) if log else 5000.0, side="right") - 1)
    peak = False
    if w <= (0.08 if log else 1500) and 0 < b < k - 1:
        nb = max(c[b - 1], c[b + 1])
        peak = bool(c[b] >= 1.3 * nb and c[b] - nb >= 3 * np.sqrt(c[b]))
    # горб: сглаживаем окном около 7 000 ₽ (0,12 порядка в логарифме), ищем вершину между 25 и 70 тыс. ₽
    # и впадину между ней и главным горбом розницы
    h = int((0.12 if log else 7000) / w / 2)
    n = 2 * h + 1
    sm = [c[max(0, i - h):min(k, i + h + 1)].sum() / n for i in range(k)]
    main = [i for i in range(k) if 1000 <= cen(i) <= 20000]
    m = max(main, key=lambda i: sm[i]) if main else 0
    hump = False
    for i in range(m + 1, k - 1):
        if hump or not (25000 <= cen(i) <= 70000):
            continue
        if sm[i] > sm[i - 1] and sm[i] >= sm[i + 1]:
            v = min(sm[m:i])
            if sm[i] >= 1.2 * v and (sm[i] - v) * np.sqrt(n) >= 3 * np.sqrt(sm[i]):
                hump = True
    return {"нули": zero, "пик": peak, "горб": hump}


def first_seen(name, log):
    """С какого числа корзин (от 3 до 200) каждая деталь видна впервые."""
    x, out = SETS[name], {}
    for k in range(3, 201):
        c, e = histogram(x, k, log)
        for key, on in feats(c, e, log, (x == 0).any()).items():
            if on and key not in out:
                out[key] = k
    return out


def show(name, k, log):
    x = SETS[name]
    c, e = histogram(x, k, log)
    f = feats(c, e, log, (x == 0).any())
    rub = (lambda v: 10 ** v) if log else (lambda v: v)
    print(f"{NAMES[name]}: сумм {len(x)}, корзин {k}, шкала {'логарифмическая' if log else 'обычная'}")
    if log:
        print(f"нулей вне гистограммы: {(x == 0).sum()}")
    top = c.max()
    for i in range(k):
        print(f"{rub(e[i]):>9.0f} – {rub(e[i + 1]):>9.0f} ₽ {c[i]:>6} {'█' * int(round(50 * c[i] / top))}")
    print("видно:", ", ".join(key for key, on in f.items() if on) or "ничего из трёх")


def box(name):
    x = SETS[name]
    q1, med, q3 = np.quantile(x, [0.25, 0.5, 0.75])
    top = q3 + 1.5 * (q3 - q1)
    return f"квартили {q1:.0f} / {med:.0f} / {q3:.0f} ₽, ус до {x[x <= top].max():.0f} ₽, точек за усом {(x > top).sum()}"


if __name__ == "__main__":
    if len(sys.argv) > 1:
        scale = sys.argv[2] if len(sys.argv) > 2 else "lin"
        show(sys.argv[3] if len(sys.argv) > 3 else "all", int(sys.argv[1]), scale == "log")
    else:
        for name in SETS:
            x = SETS[name]
            print(f"{NAMES[name]}: сумм {len(x)}, нулей {(x == 0).sum()}, ровно 5 000 ₽ — {(x == 5000).sum()}")
            print("  ящик с усами от числа корзин не зависит:", box(name))
            for log in (False, True):
                seen = first_seen(name, log)
                parts = [f"{key} — впервые при {seen[key]}" if key in seen else f"{key} — ни при каком числе корзин"
                         for key in ("нули", "пик", "горб") if not (key == "нули" and (x == 0).sum() == 0)]
                print(f"  {'логарифм' if log else 'обычная шкала'}: " + "; ".join(parts))
        print()
        show("all", 15, False)

# Вывод:
# все клиенты: сумм 12035, нулей 1717, ровно 5 000 ₽ — 381
#   ящик с усами от числа корзин не зависит: квартили 2560 / 5020 / 9800 ₽, ус до 20660 ₽, точек за усом 839
#   обычная шкала: нули — впервые при 81; пик — впервые при 116; горб — ни при каком числе корзин
#   логарифм: нули — впервые при 3; пик — впервые при 28; горб — ни при каком числе корзин
# клиенты с 1–2 заказами: сумм 6194, нулей 0, ровно 5 000 ₽ — 226
#   ящик с усами от числа корзин не зависит: квартили 2830 / 4320 / 6460 ₽, ус до 11900 ₽, точек за усом 427
#   обычная шкала: пик — впервые при 171; горб — впервые при 12
#   логарифм: пик — впервые при 28; горб — впервые при 8
#
# все клиенты: сумм 12035, корзин 15, шкала обычная
#         0 –      6988 ₽   7501 ██████████████████████████████████████████████████
#      6988 –     13976 ₽   2831 ███████████████████
#     13976 –     20964 ₽    882 ██████
#     20964 –     27952 ₽    311 ██
#     27952 –     34940 ₽    169 █
#     34940 –     41928 ₽    114 █
#     41928 –     48916 ₽     82 █
#     48916 –     55904 ₽     54 
#     55904 –     62892 ₽     43 
#     62892 –     69880 ₽     18 
#     69880 –     76868 ₽     14 
#     76868 –     83856 ₽      3 
#     83856 –     90844 ₽      5 
#     90844 –     97832 ₽      4 
#     97832 –    104820 ₽      4 
# видно: ничего из трёх
