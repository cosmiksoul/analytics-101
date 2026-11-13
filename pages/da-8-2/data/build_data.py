"""Числа для сцены и интерактива страницы 8.2: pandas по общему учебному файлу data/viz/sales_monthly.csv.

Запуск из папки страницы:  python3 data/build_data.py
Пишет объект DATA в page.js между метками /*data:start*/ и /*data:end*/ и печатает сводку для сверки.
Повторный запуск даёт тот же файл: случайностей здесь нет.
"""
import json, re
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
CSV = PAGE.parents[1] / "data" / "viz" / "sales_monthly.csv"

df = pd.read_csv(CSV)
ch = list(dict.fromkeys(df["channel"]))                 # порядок каналов, как в файле
months = sorted(df["month"].unique())
wide = (df.pivot_table(index="month", columns="channel", values="revenue", aggfunc="sum")
          .reindex(columns=ch) / 1e6)                    # 24 × 10, млн ₽
y24 = wide.loc["2024-01":"2024-12"].sum()
y25 = wide.loc["2025-01":"2025-12"].sum()
share25 = y25 / y25.sum() * 100
total = wide.sum(axis=1)
chg = (y25 / y24 - 1) * 100

# гистограмма для сцены: 240 значений «канал × месяц», корзины по 0,5 млн ₽
long = wide.stack().rename("v").reset_index()            # month, channel, v
long["ci"] = long["channel"].map(ch.index)
long["mi"] = long["month"].map(months.index)
long["bin"] = (long["v"] // 0.5).astype(int)
long = long.sort_values(["bin", "v"]).reset_index(drop=True)
long["k"] = long.groupby("bin").cumcount()               # место точки в стопке своей корзины
hist_pos = {f"{r.ci}-{r.mi}": [int(r.bin), int(r.k)] for r in long.itertuples()}
hist_bins = long.groupby("bin").size()

# рассеяние: тот же месяц 2024 и 2025 по каждому каналу, 120 пар
a = wide.loc["2024-01":"2024-12"].to_numpy().ravel()
b = wide.loc["2025-01":"2025-12"].to_numpy().ravel()
r = float(np.corrcoef(a, b)[0, 1])

# ответы интерактива — проверка по таблице, а не по картинке
order25 = y25.sort_values(ascending=False)
third = order25.index[2]
small = ["партнёры", "офлайн-точки", "кешбэк-сервисы", "колл-центр"]
losers = [c for c in small if y25[c] < y24[c]]
top2 = float(share25[order25.index[:2]].sum())

D = {
    "ch": ch,
    "months": months,
    "M": [[round(float(x), 3) for x in wide[c]] for c in ch],
    "y24": [round(float(y24[c]), 3) for c in ch],
    "y25": [round(float(y25[c]), 3) for c in ch],        # три знака: 53,448 млн должны показаться как 53,4, а не 53,5
    "share25": [round(float(share25[c]), 3) for c in ch],
    "chg": [round(float(chg[c]), 1) for c in ch],
    "total": [round(float(x), 3) for x in total],
    "hist": {"w": 0.5, "max": int(hist_bins.max()), "nb": int(hist_bins.index.max()) + 1,
             "pos": [[hist_pos[f"{ci}-{mi}"] for mi in range(len(months))] for ci in range(len(ch))]},
    "r": round(r, 3),
    "under25": round(float((long["v"] < 2.5).mean() * 100), 1),
    "ans": {"third": third, "losers": losers, "top2": round(top2, 1)},
}

print("каналы:", ch)
print("доли 2025, %:", share25.round(2).sort_values(ascending=False).to_dict())
print("изменение 2025 к 2024, %:", chg.round(1).sort_values().to_dict())
print("пик:", total.idxmax(), round(total.max(), 2), "| дно:", total.idxmin(), round(total.min(), 2))
print("корзины по 0,5 млн:", hist_bins.to_dict(), "| меньше 2,5 млн:", D["under25"], "%")
print("r(2024, 2025) по 120 парам:", round(r, 3))
print("ответы:", D["ans"])

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*data:start\*/.*?/\*data:end\*/",
           lambda _: "/*data:start*/const DATA = " + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/",
           s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
