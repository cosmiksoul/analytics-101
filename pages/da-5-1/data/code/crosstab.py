import pandas as pd

v = pd.read_csv("data/probability/visits.csv")   # 100 000 учебных визитов: source, bought
t = pd.crosstab(v["source"], v["bought"], margins=True, margins_name="всего")
print(t)

# доли по строкам: P(купил | источник) — конверсия каждого источника
print(pd.crosstab(v["source"], v["bought"], normalize="index").round(4))
# доли по столбцам: P(источник | купил) — откуда пришли покупатели
print(pd.crosstab(v["source"], v["bought"], normalize="columns").round(4))

# Байес из той же таблицы: P(реклама | купил) = P(купил | реклама) · P(реклама) / P(купил)
n = t.loc["всего", "всего"]
p_ad = t.loc["реклама", "всего"] / n
p_buy = t.loc["всего", 1] / n
p_buy_ad = t.loc["реклама", 1] / t.loc["реклама", "всего"]
print("Байес:", round(p_buy_ad * p_ad / p_buy, 4),
      "  прямо из столбца:", round(t.loc["реклама", 1] / t.loc["всего", 1], 4))

# полная вероятность: P(купил) = сумма P(купил | источник) · P(источник)
w = v["source"].value_counts(normalize=True)
conv = v.groupby("source")["bought"].mean()
print("полная вероятность:", round((conv * w).sum(), 5), " среднее bought:", v["bought"].mean())
