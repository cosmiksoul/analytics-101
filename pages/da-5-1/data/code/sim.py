import numpy as np

rng = np.random.default_rng(51)
n = 100_000
# учебный мир: доли источников и конверсия каждого — как в генераторе visits.csv
source = rng.choice(["органика", "реклама", "рассылка"], n, p=[0.55, 0.30, 0.15])
p_buy = np.select([source == "органика", source == "реклама", source == "рассылка"],
                  [0.025, 0.040, 0.060])
bought = rng.random(n) < p_buy          # у каждого своя монетка с весом p_buy

ad = source == "реклама"
print("P(купил)           ", bought.mean().round(4))
print("P(купил | реклама) ", bought[ad].mean().round(4))   # доля внутри круга «реклама»
print("P(реклама | купил) ", ad[bought].mean().round(4))   # доля внутри круга «купил»

# те же числа по формулам: полная вероятность и Байес
p_b = 0.55 * 0.025 + 0.30 * 0.040 + 0.15 * 0.060
print("по формулам:        ", round(p_b, 4), 0.04, round(0.04 * 0.30 / p_b, 4))

# антифрод: фрод 1%, тест ловит 99% фрода и срабатывает на 1% честных
fraud = rng.random(n) < 0.01
alarm = np.where(fraud, rng.random(n) < 0.99, rng.random(n) < 0.01)
print("сработок", alarm.sum(), "из них фрод", (fraud & alarm).sum())
print("P(фрод | сработка) ", fraud[alarm].mean().round(3))
