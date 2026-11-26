import pandas as pd
from scipy import stats

pilot = pd.read_csv("data/inference/pilot.csv")
old = pilot.loc[pilot.button == "старая", "amount"]
new = pilot.loc[pilot.button == "новая", "amount"]

res = stats.ttest_ind(new, old, equal_var=False)      # t-тест Уэлча, H1: средние различаются
ci = res.confidence_interval(confidence_level=0.95)  # интервал для разницы средних
one = stats.ttest_ind(new, old, equal_var=False, alternative="greater")  # H1: новая больше

print(f"t = {res.statistic:.3f}, степеней свободы {res.df:.1f}")
print(f"двустороннее p = {res.pvalue:.4f}, одностороннее p = {one.pvalue:.4f}")
print(f"разница {new.mean() - old.mean():+.0f} ₽, 95%-й интервал от {ci.low:+.0f} до {ci.high:+.0f} ₽")
print(f"относительно среднего чека исходной группы: {(new.mean() / old.mean() - 1):+.1%}, "
      f"границы интервала в рублях, поделённые на это выборочное среднее: {ci.low / old.mean():+.1%} и {ci.high / old.mean():+.1%}")
