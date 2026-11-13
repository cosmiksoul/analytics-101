"""Тридцать выражений выборки к таблице из интерактива страницы 2.1 — с ответами pandas 3.

Запуск: python loc_iloc_drill.py
Как пользоваться: прикройте вывод, предскажите результат каждого выражения и сверьтесь.
Таблица — первые восемь заказов учебной выгрузки (зерно 9), отсортированные по сумме.
Ответы записаны в конце файла и получены на pandas 3.0. В pandas 2 выражение 29
с маской-Series в iloc закончится ошибкой.
"""
import numpy as np
import pandas as pd

rng = np.random.default_rng(9)            # то же зерно, что в первом блоке кода страницы
n = 100_000
orders = pd.DataFrame({
    "order_id": np.arange(10001, 10001 + n),
    "date": pd.Timestamp("2026-01-01")
            + pd.to_timedelta(rng.integers(0, 90, n), unit="D"),
    "brand": rng.choice(["Сова", "Кедр", "Луч", "Бриз"], n),
    "country": rng.choice(["BY", "RU", "KZ", "UZ"], n),
    "channel": rng.choice(["органика", "реклама", "рассылка"], n),
    "amount": rng.integers(5, 400, n) * 10,
    "status": rng.choice(["paid", "cancelled"], n, p=[0.85, 0.15]),
})
df = orders.head(8).sort_values("amount", ascending=False)
print(df[["date", "brand", "amount", "status"]])
print()

EXPRS = [
    'df.loc[2]',
    'df.iloc[2]',
    'df.loc[[2]]',
    'df.iloc[1]',
    'df.loc[1]',
    'df.loc[0:2]',
    'df.iloc[0:2]',
    'df.loc[6:3]',
    'df.loc[3:6]',
    'df.iloc[-3:]',
    'df[:3]',
    'df[2]',
    'df["amount"]',
    'df[["brand", "amount"]]',
    'df.loc[10]',
    'df.iloc[10]',
    'df.loc[2, "amount"]',
    'df.iloc[2, 5]',
    'df.loc[[2, 5], ["brand", "amount"]]',
    'df.iloc[[0, 1], [2, 5]]',
    'df.loc[:, "amount"]',
    'df[df["amount"] > 2000]',
    'df.loc[df["brand"] == "Кедр"]',
    'df[(df["amount"] > 1000) & (df["status"] == "paid")]',
    'df[df["amount"] > 1000 & (df["status"] == "paid")]',
    'df[(df["amount"] > 1000) and (df["status"] == "paid")]',
    'df[~(df["brand"] == "Кедр")]',
    'df.loc[df["amount"] > 2000, "brand"]',
    'df.iloc[df["amount"] > 2000]',
    'df.reset_index(drop=True).loc[2]',
]


def describe(r):
    """Короткое описание результата: что выбрано."""
    if isinstance(r, pd.DataFrame):
        cols = "" if list(r.columns) == list(df.columns) else f", столбцы {list(r.columns)}"
        return f"таблица: строки с метками {list(r.index)}{cols}"
    if isinstance(r, pd.Series):
        if list(r.index) == list(df.columns):          # одна строка таблицы
            return f"Series: одна строка, метка {r.name}, сумма {r['amount']}"
        return f"Series: столбец {r.name}, метки {list(r.index)}"
    return f"одно значение: {r}"


for i, expr in enumerate(EXPRS, start=1):
    try:
        answer = describe(eval(expr))
    except Exception as e:                              # ошибка — тоже ответ
        answer = f"{type(e).__name__}: {str(e).splitlines()[0].split('. ')[0]}"
    print(f"{i:2}. {expr}")
    print(f"    → {answer}")

# Вывод:
#         date brand  amount     status
# 0 2026-02-07  Кедр    3430       paid
# 6 2026-03-02   Луч    3000       paid
# 5 2026-02-24  Кедр    2640       paid
# 3 2026-01-26  Бриз    2490       paid
# 4 2026-01-11  Сова    1300  cancelled
# 7 2026-03-11  Кедр    1240       paid
# 2 2026-03-28  Кедр     910       paid
# 1 2026-03-20   Луч     400       paid
#
#  1. df.loc[2]
#     → Series: одна строка, метка 2, сумма 910
#  2. df.iloc[2]
#     → Series: одна строка, метка 5, сумма 2640
#  3. df.loc[[2]]
#     → таблица: строки с метками [2]
#  4. df.iloc[1]
#     → Series: одна строка, метка 6, сумма 3000
#  5. df.loc[1]
#     → Series: одна строка, метка 1, сумма 400
#  6. df.loc[0:2]
#     → таблица: строки с метками [0, 6, 5, 3, 4, 7, 2]
#  7. df.iloc[0:2]
#     → таблица: строки с метками [0, 6]
#  8. df.loc[6:3]
#     → таблица: строки с метками [6, 5, 3]
#  9. df.loc[3:6]
#     → таблица: строки с метками []
# 10. df.iloc[-3:]
#     → таблица: строки с метками [7, 2, 1]
# 11. df[:3]
#     → таблица: строки с метками [0, 6, 5]
# 12. df[2]
#     → KeyError: 2
# 13. df["amount"]
#     → Series: столбец amount, метки [0, 6, 5, 3, 4, 7, 2, 1]
# 14. df[["brand", "amount"]]
#     → таблица: строки с метками [0, 6, 5, 3, 4, 7, 2, 1], столбцы ['brand', 'amount']
# 15. df.loc[10]
#     → KeyError: 10
# 16. df.iloc[10]
#     → IndexError: single positional indexer is out-of-bounds
# 17. df.loc[2, "amount"]
#     → одно значение: 910
# 18. df.iloc[2, 5]
#     → одно значение: 2640
# 19. df.loc[[2, 5], ["brand", "amount"]]
#     → таблица: строки с метками [2, 5], столбцы ['brand', 'amount']
# 20. df.iloc[[0, 1], [2, 5]]
#     → таблица: строки с метками [0, 6], столбцы ['brand', 'amount']
# 21. df.loc[:, "amount"]
#     → Series: столбец amount, метки [0, 6, 5, 3, 4, 7, 2, 1]
# 22. df[df["amount"] > 2000]
#     → таблица: строки с метками [0, 6, 5, 3]
# 23. df.loc[df["brand"] == "Кедр"]
#     → таблица: строки с метками [0, 5, 7, 2]
# 24. df[(df["amount"] > 1000) & (df["status"] == "paid")]
#     → таблица: строки с метками [0, 6, 5, 3, 7]
# 25. df[df["amount"] > 1000 & (df["status"] == "paid")]
#     → таблица: строки с метками [0, 6, 5, 3, 4, 7, 2, 1]
# 26. df[(df["amount"] > 1000) and (df["status"] == "paid")]
#     → ValueError: The truth value of a Series is ambiguous
# 27. df[~(df["brand"] == "Кедр")]
#     → таблица: строки с метками [6, 3, 4, 1]
# 28. df.loc[df["amount"] > 2000, "brand"]
#     → Series: столбец brand, метки [0, 6, 5, 3]
# 29. df.iloc[df["amount"] > 2000]
#     → таблица: строки с метками [0, 6, 5, 3]
# 30. df.reset_index(drop=True).loc[2]
#     → Series: одна строка, метка 2, сумма 2640
