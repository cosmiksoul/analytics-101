"""Сверка r на JS с NumPy для интерактива «Угадай корреляцию» и данных страницы.

Запуск из папки страницы:  python3 data/check_js.py
Генератор облаков и функция pearson берутся из page.js (метки /*gen:start*/ и /*gen:end*/)
и запускаются в node. Для облаков 1–30 сравниваются r на JS и np.corrcoef на тех же точках;
та же функция pearson проверяется на 120 заказах discounts.csv и на квартете Энскомба.
"""
import json, re, subprocess
from pathlib import Path
import numpy as np, pandas as pd

PAGE = Path(__file__).resolve().parent.parent
src = (PAGE / "page.js").read_text(encoding="utf-8")
gen = re.search(r"/\*gen:start\*/(.*?)/\*gen:end\*/", src, re.S).group(1)
data = re.search(r"/\*data:start\*/(.*?)/\*data:end\*/", src, re.S).group(1)
js = f"""{data}
{gen}
const out = {{ clouds: [] }};
for (let k = 1; k <= 30; k++) out.clouds.push(makeCloud(k));
const S = DATA.simpson.pts;
out.simAll = pearson(S.map(p => p[1]), S.map(p => p[2]));
out.simIn = [0, 1, 2].map(c => {{ const g = S.filter(p => p[0] === c); return pearson(g.map(p => p[1]), g.map(p => p[2])); }});
out.ans = DATA.anscombe.map(a => pearson(a.x, a.y));
console.log(JSON.stringify(out));"""
res = json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)

diffs = []
print(f"{'облако':>6} {'задумано':>9} {'r на JS':>10} {'NumPy':>10}")
for k, c in enumerate(res["clouds"], 1):
    r_np = np.corrcoef(c["xs"], c["ys"])[0, 1]
    diffs.append(abs(r_np - c["r"]))
    if k <= 10: print(f"{k:>6} {c['rho']:>9.2f} {c['r']:>10.6f} {r_np:>10.6f}")
print("облака 1–30: max |JS − NumPy| =", f"{max(diffs):.2e}", "; задуманные r от", min(c["rho"] for c in res["clouds"]), "до", max(c["rho"] for c in res["clouds"]))

df = pd.read_csv(PAGE.parents[1] / "data" / "inference" / "discounts.csv")
np_all = np.corrcoef(df.discount, df.check)[0, 1]
np_in = [float(np.corrcoef(g.discount, g.check)[0, 1]) for _, g in df.groupby("category", sort=False)]
print("discounts.csv: JS", round(res["simAll"], 6), [round(v, 6) for v in res["simIn"]], "| NumPy", round(np_all, 6), [round(v, 6) for v in np_in])
print("Энскомб: JS", [round(v, 6) for v in res["ans"]])
