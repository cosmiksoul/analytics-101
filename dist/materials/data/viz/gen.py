"""Учебные данные для темы 08 «Визуализация в Python». seed 808. Тот же интернет-магазин.
sales_monthly.csv — выручка по месяцам (2024-01…2025-12) × 10 каналов продаж × 4 страны, длинный формат.
Сюжет для 8.4: в июне 2025 года магазин обновил приложение. С мая по июль выручка этого канала выросла в 1,98 раза."""
import numpy as np, pandas as pd, pathlib
rng = np.random.default_rng(808); P = pathlib.Path(__file__).parent
months = pd.period_range("2024-01", "2025-12", freq="M")
channels = {"сайт": 9.0, "приложение": 3.0, "маркетплейс": 6.5, "поиск": 4.0, "рассылка": 2.2,
            "соцсети": 1.8, "партнёры": 1.5, "кешбэк-сервисы": 1.0, "колл-центр": 0.8, "офлайн-точки": 1.2}  # млн ₽ в месяц на старте
countries = {"BY": 0.36, "RU": 0.34, "KZ": 0.19, "UZ": 0.11}
rows = []
t = np.arange(len(months)); season = 1 + 0.12 * np.cos(2 * np.pi * (t - 11) / 12)          # пик в декабре
for ch, base in channels.items():
    trend = 1 + rng.uniform(-0.004, 0.012) * t
    level = base * trend * season
    if ch == "приложение":
        level = level * np.where(t >= 17, 2.0, 1.0) * np.where(t == 17, 0.75, 1.0)          # релиз в июне 2025 (t=17), в первом месяце учтена часть прироста
    if ch == "колл-центр":
        level = level * (1 - 0.02 * t)                                                     # постепенное снижение выручки
    for c, share in countries.items():
        noise = rng.lognormal(0, 0.05, len(t))
        for m, v in zip(months, level * share * noise):
            rows.append((str(m), ch, c, round(v * 1e6, -3)))
df = pd.DataFrame(rows, columns=["month", "channel", "country", "revenue"])
df.to_csv(P / "sales_monthly.csv", index=False, lineterminator="\n")
w = df.groupby(["month", "channel"]).revenue.sum().unstack()
print(df.shape); print((w[["приложение", "сайт"]] / 1e6).round(2).iloc[[0, 15, 16, 17, 18, 23]])
print("доли каналов 2025:", (df[df.month >= "2025-01"].groupby("channel").revenue.sum() / df[df.month >= "2025-01"].revenue.sum()).round(3).sort_values(ascending=False).to_dict())
