import pandas as pd
from statsmodels.stats.proportion import proportion_confint, confint_proportions_2indep

v = pd.read_csv("data/probability/visits.csv")
a = v[v["source"] == "рассылка"].head(1500)["bought"]    # по 1 500 визитов из двух каналов
b = v[v["source"] == "реклама"].head(1500)["bought"]
half = {}
for name, g in [("рассылка", a), ("реклама", b)]:
    lo, hi = proportion_confint(g.sum(), g.size, method="wilson")
    half[name] = (hi - lo) / 2
    print(f"{name:>8}: {g.mean():.2%}  [{lo:.2%}; {hi:.2%}]")
lo, hi = confint_proportions_2indep(a.sum(), a.size, b.sum(), b.size,
                                    method="newcomb", compare="diff")
print(f" разница: {100 * (a.mean() - b.mean()):.2f} п. п.  [{100 * lo:.2f}; {100 * hi:.2f}] п. п.")
print(f"сумма полуширин {100 * sum(half.values()):.2f} п. п., корень из суммы квадратов "
      f"{100 * (half['рассылка'] ** 2 + half['реклама'] ** 2) ** 0.5:.2f} п. п.")
