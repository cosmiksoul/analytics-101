q1, q3 = s.quantile([0.25, 0.75])
mad = stats.median_abs_deviation(s)
bounds = {"IQR": q3 + 1.5 * (q3 - q1),              # правило Тьюки
          "z > 3": s.mean() + 3 * s.std(),           # три стандартных отклонения
          "MAD > 3,5": s.median() + 3.5 * mad / 0.6745}  # модифицированная z-оценка
err = s > 1_000_000                                  # пять ошибок ×1000 с логарифмической шкалы

rows = {rule: {"граница, ₽": round(b), "флагов": (s > b).sum(),
               "из 5 ошибок": (s[err] > b).sum()} for rule, b in bounds.items()}
print(pd.DataFrame(rows).T.to_string())

clean = s[~err]                                      # без ошибок маскировка уходит
z_bound = clean.mean() + 3 * clean.std()
print(f"\nz > 3 без ошибок: граница {z_bound:,.0f} ₽, флагов {(clean > z_bound).sum()}")
both = (s > bounds["IQR"]) & (s > bounds["MAD > 3,5"])
print("общих флагов у IQR и MAD:", both.sum(), "из", (s > bounds["IQR"]).sum())
