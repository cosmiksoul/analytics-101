import numpy as np
import pandas as pd
from scipy import stats

df = pd.read_csv("data/eda/clients_export.csv")
num = df.select_dtypes("number").drop(columns="client_id")  # id — ярлык, а не величина
pct = [0.01, 0.05, 0.25, 0.5, 0.75, 0.95, 0.99]
print(num.describe(percentiles=pct).round(1).to_string())

s = df["spend_q1"]
print("\nусечённое среднее, по 10% с краёв:", round(stats.trim_mean(s, 0.1)))
print("MAD — медиана |x − медиана|:", stats.median_abs_deviation(s))
