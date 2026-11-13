"""Расчёт интерактива «Цена пропуска» со страницы 2.3 на pandas.

Запуск: python cost_of_missing.py
Берёт «правду» — 200 чистых заказов из data/orders_true.csv, — прячет часть сумм и считает,
что покажет каждое решение: удалить, заполнить средним, медианой, медианой группы или пометить.

Какие суммы прятать, задано заранее и не меняется от запуска к запуску: зерно 2303.
  mcar — случайный порядок: сумма пропадает независимо ни от чего;
  mnar — чем крупнее сумма, тем раньше она пропадает (вес exp(3 · ранг суммы)).
Те же два порядка встроены в страницу, поэтому числа скрипта и интерактива совпадают.
"""
import numpy as np
import pandas as pd

clean = pd.read_csv("data/orders_true.csv")
amt = clean["amount"].to_numpy()
N = len(amt)

rng = np.random.default_rng(2303)
u = rng.random(N)


def order(w):
    """Взвешенная выборка без возвращения: ключ u^(1/w), по убыванию."""
    return list(np.argsort(-(u ** (1 / w)), kind="stable"))


rank = pd.Series(amt).rank(method="first").to_numpy() / N
ORD = {"mcar": order(np.ones(N)), "mnar": order(np.exp(3.0 * rank))}
NAMES = {"mcar": "случайные заказы", "mnar": "чаще крупные"}
STRATS = {"drop": "удалить", "mean": "среднее", "median": "медиана", "group": "по группе", "flag": "пометить"}


def calc(mech, strat, pct):
    """Что покажет решение strat, если спрятать pct процентов сумм по порядку mech."""
    k = round(N * pct / 100)
    hide = ORD[mech][:k]
    df = clean[["items", "amount"]].astype({"amount": "float64"}).copy()
    df.loc[df.index[hide], "amount"] = np.nan
    a = df["amount"]
    if strat == "drop":
        df = df.dropna(subset=["amount"])
    elif strat == "mean":
        df["amount"] = a.fillna(a.mean())
    elif strat == "median":
        df["amount"] = a.fillna(a.median())
    elif strat == "group":                       # медиана заказов с тем же числом товаров
        g = df.groupby("items")["amount"].transform("median")
        df["amount"] = a.fillna(g).fillna(a.median())
    elif strat == "flag":
        df["amount_missing"] = a.isna()
    return {
        "rows": len(df),
        "mean": df["amount"].mean(),
        "median": df["amount"].median(),
        "corr": df["amount"].corr(df["items"]),
        "items_missing": clean["items"].iloc[hide].mean() if k else float("nan"),
        "items_known": clean["items"].drop(clean.index[hide]).mean(),
    }


if __name__ == "__main__":
    truth = calc("mcar", "flag", 0)
    print(f"правда: {truth['rows']} заказов, среднее {truth['mean']:.0f} ₽, медиана {truth['median']:.0f} ₽, "
          f"корреляция суммы и числа товаров {truth['corr']:.2f}")
    for mech in ORD:
        for pct in (20, 40, 60):
            r0 = calc(mech, "flag", pct)
            print(f"\n{NAMES[mech]}, пропусков {pct}%: у заказов без суммы в среднем {r0['items_missing']:.1f} товара, "
                  f"у остальных {r0['items_known']:.1f}")
            print(f"  {'решение':10}{'строк':>6}{'среднее':>9}{'к правде':>10}{'медиана':>9}{'корреляция':>12}")
            for strat, name in STRATS.items():
                r = calc(mech, strat, pct)
                shift = (r["mean"] / truth["mean"] - 1) * 100
                print(f"  {name:10}{r['rows']:>6}{r['mean']:>9.0f}{shift:>+9.0f}%{r['median']:>9.0f}{r['corr']:>12.2f}")
