import numpy as np

rng = np.random.default_rng(51)
n = 100_000
# Доли источников и вероятность покупки задаём так же, как в генераторе visits.csv.
source = rng.choice(["органика", "реклама", "рассылка"], n, p=[0.55, 0.30, 0.15])
p_buy = np.select([source == "органика", source == "реклама", source == "рассылка"],
                  [0.025, 0.040, 0.060])
bought = rng.random(n) < p_buy          # Вероятность покупки зависит от источника визита.

ad = source == "реклама"
print("P(купил)           ", bought.mean().round(4))
print("P(купил | реклама) ", bought[ad].mean().round(4))   # доля внутри круга «реклама»
print("P(реклама | купил) ", ad[bought].mean().round(4))   # доля внутри круга «купил»

# Вычислим теоретические вероятности по формулам полной вероятности и Байеса.
p_b = 0.55 * 0.025 + 0.30 * 0.040 + 0.15 * 0.060
print("по формулам:        ", round(p_b, 4), 0.04, round(0.04 * 0.30 / p_b, 4))

# Теперь моделируем платежи. Правило отмечает 99% мошеннических операций и 1% обычных.
fraud = rng.random(n) < 0.01
alarm = np.where(fraud, rng.random(n) < 0.99, rng.random(n) < 0.01)
print("операций с предупреждением:", alarm.sum(), "из них мошеннических:", (fraud & alarm).sum())
print("P(фрод | сигнал)   ", fraud[alarm].mean().round(3))
