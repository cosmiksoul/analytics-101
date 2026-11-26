import pandas as pd
from statsmodels.stats.proportion import proportion_confint

v = pd.read_csv("data/probability/visits.csv")
week = v.head(8000)                                       # неделя: 8 000 визитов
small = v[v["source"] == "органика"].head(100)            # маленький канал: 100 визитов
for name, d in [("неделя", week), ("малый канал", small)]:
    k, n = int(d["bought"].sum()), len(d)
    print(f"{name}: покупок {k}, визитов {n}, p̂ = {k / n:.2%}")
    for method in ("normal", "wilson"):
        lo, hi = proportion_confint(k, n, alpha=0.05, method=method)
        print(f"  {method:>6}: [{lo:.2%}; {hi:.2%}]")

p, n = 2 / 100, 100                                       # нормальный интервал вручную
half = 1.96 * (p * (1 - p) / n) ** 0.5
print(f"интервал Вальда до ограничения границ: [{p - half:.2%}; {p + half:.2%}]")
