q1, q3 = s.quantile([0.25, 0.75])
mad = stats.median_abs_deviation(s)
bounds = {"IQR": q3 + 1.5 * (q3 - q1),              # правило Тьюки
          "z > 3": s.mean() + 3 * s.std(),           # три стандартных отклонения
          "модиф. z > 3,5": s.median() + 3.5 * mad / 0.6745}  # модифицированная z-оценка
err = s > 1_000_000                                  # пять миллионных сумм, видимых на логарифмической шкале

rows = {rule: {"граница, ₽": round(b), "выше границы": (s > b).sum(),
               "из пяти миллионных сумм": (s[err] > b).sum()} for rule, b in bounds.items()}
print(pd.DataFrame(rows).T.to_string())

clean = s[~err]                                      # повторяем расчёт без пяти миллионных сумм
z_bound = clean.mean() + 3 * clean.std()
print(f"\nz > 3 без пяти миллионных сумм: граница {z_bound:,.0f} ₽, выше неё {(clean > z_bound).sum()} записей")
both = (s > bounds["IQR"]) & (s > bounds["модиф. z > 3,5"])
print("выше обеих границ, IQR и MAD:", both.sum(), "из", (s > bounds["IQR"]).sum())
