from scipy import stats, integrate

days = stats.expon(scale=12)          # интервал между заказами в днях
years = stats.expon(scale=12 / 365)   # тот же интервал в годах
print("плотность в нуле:", days.pdf(0).round(3), "на день,",
      years.pdf(0).round(1), "на год")
print("P(до 7 дней):", days.cdf(7).round(4), "и", years.cdf(7 / 365).round(4))
area, err = integrate.quad(years.pdf, 0, 1)
print("площадь под плотностью в годах:", round(area, 6))
