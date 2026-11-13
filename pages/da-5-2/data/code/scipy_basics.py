from scipy import stats

buys = stats.binom(n=100, p=0.034)          # покупок из 100 визитов
print("P(K = 3)  =", buys.pmf(3).round(4))
print("P(K <= 5) =", buys.cdf(5).round(4))
print("среднее", buys.mean().round(2), "дисперсия", buys.var().round(3))

gap = stats.expon(scale=12)                  # дней между заказами, среднее 12
print("плотность в нуле:", gap.pdf(0).round(4), "на день")
print("P(интервал <= 7 дней) =", gap.cdf(7).round(4))
print("медиана", gap.median().round(2), "95-й перцентиль", gap.ppf(0.95).round(2))

check = stats.lognorm(s=0.6, scale=3000)     # чек: медиана 3 000 ₽, сигма 0,6
print("квантили 5, 50 и 95%:", check.ppf([0.05, 0.5, 0.95]).round())
print("среднее", check.mean().round())

sample = check.rvs(size=5, random_state=505) # генерация с зерном
print("пять чеков:", sample.round(-1))
