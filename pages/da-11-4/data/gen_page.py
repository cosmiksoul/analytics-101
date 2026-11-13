"""Данные страницы 11.4 и таблицы по учебным тестам магазина.

Запуск:  python3 pages/da-11-4/data/sim.py && python3 pages/da-11-4/data/gen_page.py
- из sim.json в page.js (между /*data:start*/ и /*data:end*/) — доли ложных побед на 20 000 прогонов и сто траекторий;
- по data/ab в article.html (между метками <!--tbl:…-->) — дашборд живого p-value checkout_v2 и модель рамп-апа;
- в конце — типографика статьи (typo.py) и числа для текста.
Соглашения README: боты исключены, группа — из exposures.csv, день — минский, конверсия — доля людей с покупкой.
"""
import json, re, sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
AB = PAGE.parents[1] / "data" / "ab"
sys.path.insert(0, str(HERE))
from typo import typo  # noqa: E402

BOTS = ["u_025389", "u_053191", "u_055948"]
START = pd.Timestamp("2026-09-07")
sp = lambda n: f"{n:,}".replace(",", " ")
dec = lambda v, d=1: f"{v:.{d}f}".replace(".", ",").replace("-", "−")
pc = lambda v, d=1: ("+" if v > 0 else "") + dec(v * 100, d) + "%"


def pfmt(p):
    if p < 0.0001:
        return "&lt; 0,0001"
    return dec(p, 2 if p >= 0.1 else 3 if p >= 0.001 else 4)


# ---------- 1. данные симуляции для сцены и интерактива ----------
S = json.loads((HERE / "sim.json").read_text(encoding="utf-8"))
DATA = {"days": S["days"], "metrics": S["metrics"], "runs": S["runs"], "rate": S["rate"], "alph": S["alph"],
        "z": "".join(S["z"]), "scene": S["scene"], "shown": S["shown"]}
js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s, k = re.subn(r"/\*data:start\*/.*?/\*data:end\*/",
               lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";/*data:end*/",
               s, flags=re.S)
assert k == 1
js.write_text(s, encoding="utf-8")

# ---------- 2. учебные тесты ----------
ex = pd.read_csv(AB / "exposures.csv", parse_dates=["exposed_at"])
ses = pd.read_parquet(AB / "sessions.parquet")
mday = lambda t: (t + pd.Timedelta(hours=3)).dt.floor("D").dt.tz_localize(None)

e = ex[(ex.experiment == "checkout_v2") & ~ex.user_id.isin(BOTS)].copy()
e["day"] = (mday(e.exposed_at) - START).dt.days + 1
sc = ses[(ses.experiment == "checkout_v2") & ~ses.user_id.isin(BOTS)].drop(columns="group").merge(e[["user_id", "group"]], on="user_id")
sc["day"] = (mday(sc.session_start) - START).dt.days + 1
e["buy_day"] = e.user_id.map(sc[sc.converted == 1].groupby("user_id").day.min())

# дашборд живого p-value: каждый вечер — все показанные к этому дню и их покупки к этому дню
live = []
for d in range(1, 29):
    x = e[e.day <= d]
    n = x.groupby("group").size()
    c = x[x.buy_day <= d].groupby("group").size()
    pa, pb = c.A / n.A, c.B / n.B
    pool = (c.A + c.B) / (n.A + n.B)
    z = (pb - pa) / np.sqrt(pool * (1 - pool) * (1 / n.A + 1 / n.B))
    live.append({"d": d, "pa": pa, "pb": pb, "rel": pb / pa - 1, "p": 2 * stats.norm.sf(abs(z))})
L = pd.DataFrame(live).set_index("d")
first_green = int(L.index[L.p < 0.05][0])
rows = []
for d in (1, 2, first_green, int(L.rel.idxmax()), 14, 28):
    r = L.loc[d]
    state = "зелёный: «B выигрывает»" if r.p < 0.05 else "серый: «ждём»"
    rows.append(f"<tr><td>{d}</td><td>{dec(r.pa * 100)} → {dec(r.pb * 100)}%</td><td>{pc(r.rel)}</td><td>{pfmt(r.p)}</td><td>{state}</td></tr>")
tbl_live = ("<thead><tr><th>день</th><th>конверсия A → B</th><th>эффект</th><th>p-value</th><th>дашборд</th></tr></thead>"
            "<tbody>" + "".join(rows) + "</tbody>")

# модель рамп-апа: первые три дня B получает 10% участников — из назначенных в B оставляем каждого девятого (seed 1104)
rng = np.random.default_rng(1104)
e["conv"] = e.buy_day.notna().astype(int)
drop = (e.group == "B") & (e.day <= 3) & (rng.random(len(e)) > 1 / 9)
r = e[~drop].copy()
r["period"] = np.where(r.day <= 3, "ramp", "rest")
T = r.groupby(["period", "group"]).conv.agg(["size", "mean"])
tot = r.groupby("group").conv.agg(["size", "mean"])
w = r.groupby("period").size() / len(r)                                   # веса периодов — их доля в тесте
strat = sum(w[p] * (T.loc[(p, "B"), "mean"] - T.loc[(p, "A"), "mean"]) for p in ("ramp", "rest"))
shareB = T.loc[("ramp", "B"), "size"] / (T.loc[("ramp", "A"), "size"] + T.loc[("ramp", "B"), "size"])


def rrow(name, a, b):
    return (f"<tr><td>{name}</td><td>{dec(a['mean'] * 100)}% · {sp(int(a['size']))}</td>"
            f"<td>{dec(b['mean'] * 100)}% · {sp(int(b['size']))}</td><td>{pc(b['mean'] / a['mean'] - 1)}</td></tr>")


tbl_ramp = ("<thead><tr><th>период</th><th>A: конверсия · людей</th><th>B: конверсия · людей</th><th>B к A</th></tr></thead><tbody>"
            + rrow(f"дни 1–3, доля B {dec(shareB * 100, 0)}%", T.loc["ramp"].loc["A"], T.loc["ramp"].loc["B"])
            + rrow("дни 4–28, 50/50", T.loc["rest"].loc["A"], T.loc["rest"].loc["B"])
            + rrow("весь тест вместе", tot.loc["A"], tot.loc["B"]) + "</tbody>")

art = PAGE / "article.html"
a = art.read_text(encoding="utf-8")
for name, html in (("live", tbl_live), ("ramp", tbl_ramp)):
    a, k = re.subn(rf"<!--tbl:{name}-->.*?<!--/tbl:{name}-->", lambda _: f"<!--tbl:{name}--><table>{html}</table><!--/tbl:{name}-->", a, flags=re.S)
    assert k == 1, name
art.write_text(typo(a), encoding="utf-8")

# ---------- 3. числа для текста ----------
reco = ses[ses.experiment == "reco_block"].groupby("user_id").converted.max()
rx = ex[(ex.experiment == "reco_block") & ~ex.user_id.isin(BOTS)].copy()
rx["conv"] = rx.user_id.map(reco).fillna(0)
rc = rx.groupby("group").conv.mean()
print("живой p: зелёный с дня", first_green, "эффект", pc(L.loc[first_green].rel), "p", pfmt(L.loc[first_green].p),
      "| максимум", int(L.rel.idxmax()), pc(L.rel.max()), "| день 28", pc(L.loc[28].rel), pfmt(L.loc[28].p))
print("рамп-ап:", T.round(4).to_dict(), "\nвместе", tot.round(4).to_dict(), "\nвзвешенная разница", round(strat * 100, 2), "п. п.")
print("reco_block конверсия", rc.round(4).to_dict(), "разница", round((rc.B - rc.A) * 100, 2), "п. п.")
print("сцена: p", S["scene"]["p"][:14], "эффект дня 8", S["scene"]["eff"][7], "дня 28", S["scene"]["eff"][27])
print("ежедневно 0,01:", S["extra"]["daily_001"], "продление:", S["extra"]["extend_14_21"])
