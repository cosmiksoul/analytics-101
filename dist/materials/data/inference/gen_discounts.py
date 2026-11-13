"""Учебные заказы со скидкой для страницы 6.5 «Корреляция и причинность». Зерно 6505.

discounts.csv — 120 заказов: order_id, category, discount (скидка, %), check (сумма к оплате, ₽).
Пример парадокса Симпсона. Три категории по 40 заказов. Чем дороже категория, тем глубже в ней скидки:
посуда 0–12%, текстиль 8–22%, свет 16–30%. Сумма к оплате = корзина × (1 − скидка)
× (1 − 0,012 × (скидка − середина диапазона)) × шум: глубокая скидка уменьшает сумму,
и под неё берут модели подешевле. Поэтому внутри категории связь скидки и чека
отрицательная, а по всем заказам вместе — положительная.

Запуск из корня папки материалов:  python data/inference/gen_discounts.py
"""
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
CATS = {"посуда": (0, 12, 2400), "текстиль": (8, 22, 5200), "свет": (16, 30, 9000)}


def discounts():
    rng = np.random.default_rng(6505)
    rows = []
    for cat, (lo, hi, basket) in CATS.items():
        d = np.round(rng.uniform(lo, hi, 40)).astype(int)
        b = basket * np.exp(rng.normal(0, 0.10, 40))
        check = np.round(b * (1 - d / 100) * (1 - 0.012 * (d - (lo + hi) / 2)), -1).astype(int)
        rows += [(cat, int(x), int(c)) for x, c in zip(d, check)]
    df = pd.DataFrame(rows, columns=["category", "discount", "check"])
    df.insert(0, "order_id", np.arange(1, len(df) + 1))
    return df


if __name__ == "__main__":
    df = discounts()
    df.to_csv(HERE / "discounts.csv", index=False)
    r = lambda g: float(np.corrcoef(g.discount, g.check)[0, 1])
    print(f"заказов {len(df)}; корреляция скидки и чека по всем заказам {r(df):+.2f}")
    for cat, g in df.groupby("category", sort=False):
        print(f"  {cat:<9} скидки {g.discount.min()}–{g.discount.max()}%, средний чек {round(g.check.mean())} ₽, корреляция {r(g):+.2f}")
