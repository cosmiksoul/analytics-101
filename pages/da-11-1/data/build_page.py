"""Данные, вывод кода и рисунок страницы 11.1 «Как оценить эффект релиза с помощью A/B-теста».

Запуск из любой папки:  python3 pages/da-11-1/data/build_page.py
Окружение: Python 3.13, pandas 3.0.5, NumPy 2.5.3, Matplotlib 3.10.0, PostgreSQL 16 (база ab, параметры подключения libpq).

1. Модель сцены и интерактива — функции simulate() и estimate() из code/simulate.py (читаются из файла, без копий).
   Для seed 481 сюда выписываются шум дня/недели и шум покупок, которыми JS повторяет simulate(); для всех 32 наборов
   помех считаются две оценки — таблица CHECK, по ней check_widget.js сверяет JS с Python.
2. Блоки кода запускаются как есть: code/simulate.py и code/runs.py — ячейки одного ноутбука (runs.py продолжает
   simulate.py и сохраняет runs.svg), code/hash_balance.sql — в psql -P null=NULL. Вывод — в PAGE.code, рисунок
   (сжатый svgmin.py, копия из страницы 9.3) — в article.html между <!--fig:runs--> и <!--/fig:runs-->.
3. Числа текста из data/ab и data/events пересчитываются и сверяются с article.html.
Повторный запуск даёт те же файлы.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
ROOT = PAGE.parents[1]
AB, EV = ROOT / "data" / "ab", ROOT / "data" / "events"
sys.dont_write_bytecode = True
sys.path.insert(0, str(HERE))
from svgmin import data_uri  # noqa: E402

# ---------------------------------------------------------------- 1. модель и сверка
src_sim = (HERE / "code" / "simulate.py").read_text(encoding="utf-8").rstrip()
ns = {}
exec(src_sim.split("\nLAYERS = ")[0], ns)                 # только определения, без печати таблицы
simulate, estimate = ns["simulate"], ns["estimate"]
SEED = 481
rng = np.random.default_rng(SEED)                          # тот же порядок вызовов, что в simulate()
shock = 0.02 * rng.standard_normal(42) + 0.03 * np.repeat(rng.standard_normal(6), 7)
z = rng.standard_normal((2, 42))
P = dict(p0=0.04, vis=30000, visWe=34500, trend=0.003, season=0.10, we=0.92, sMid=27, sW=4, dip=0.09,
         camp=30, campX=0.4, weakQ=0.45, track=35, seen=0.8, lift=0.10)
LAY = {"trend": {"trend": 0.003}, "season": {"season": 0.10}, "campaign": {"campaign": 30},
       "tracking": {"tracking": 35}, "dip": {"dip": 0.09}}
check = {}
for m in range(32):
    world, key = {}, ""
    for i, k in enumerate(LAY):
        key += "1" if m >> i & 1 else "0"
        if m >> i & 1:
            world |= LAY[k]
    ba, ab = estimate(simulate(SEED, **world))
    check[key] = [round(ba * 100, 4), round(ab * 100, 4)]
path = ["00000", "10000", "11000", "11100", "11110", "11111"]
print("сцена, «до и после»:", [check[k][0] for k in path], " A/B:", check["11111"][1])
contrib = [check[path[0]][0]] + [check[path[i]][0] - check[path[i - 1]][0] for i in range(1, 6)]
print("вклады слоёв, п. п.:", [round(c, 1) for c in contrib])

# ---------------------------------------------------------------- 2. блоки кода
src_runs = (HERE / "code" / "runs.py").read_text(encoding="utf-8").rstrip()
with tempfile.TemporaryDirectory() as tmp:
    o1 = subprocess.run([sys.executable, "-c", src_sim], cwd=tmp, capture_output=True, text=True, check=True)
    marker = "\nprint('<<<runs>>>')\n"
    o2 = subprocess.run([sys.executable, "-c", src_sim + marker + src_runs], cwd=tmp, capture_output=True, text=True, check=True)
    for o in (o1, o2):
        assert not o.stderr.strip(), o.stderr
    fig = data_uri((Path(tmp) / "runs.svg").read_text(encoding="utf-8"))
out_sim = o1.stdout.rstrip()
out_runs = o2.stdout.split("<<<runs>>>\n", 1)[1].rstrip()
assert o2.stdout.split("<<<runs>>>\n", 1)[0].rstrip() == out_sim
sql = (HERE / "code" / "hash_balance.sql").read_text(encoding="utf-8").rstrip()
run = subprocess.run(["psql", "-U", "postgres", "-d", "ab", "-X", "-P", "pager=off", "-P", "null=NULL",
                      "-f", str(HERE / "code" / "hash_balance.sql")], capture_output=True, text=True, check=True)
assert not run.stderr.strip(), run.stderr
out_sql = run.stdout.rstrip()
print(out_sim, "\n", out_runs, "\n", out_sql)

# вывод кода совпадает с JS-сценой: строки таблицы simulate.py = путь сцены
for k, line in zip(path, out_sim.splitlines()[2:]):
    nums = [float(x) for x in line.split()[-6:]]
    assert abs(nums[2] - check[k][0]) < 0.006 and abs(nums[3] - check[k][1]) < 0.006, (line, check[k])
rtm = float(re.search(r"^после слабых недель\s+(-?[\d.]+)", out_runs, re.M).group(1))

# ---------------------------------------------------------------- 3. числа текста
e = pd.read_csv(AB / "exposures.csv")
g = e.pivot(index="user_id", columns="experiment", values="group").dropna(subset=["aa_check", "checkout_v2"])
salt_b = ((g.aa_check == "B") & (g.checkout_v2 == "B")).sum() / (g.aa_check == "B").sum() * 100
print(f"соль: из попавших в B aa_check в B checkout_v2 — {salt_b:.1f}% (участников обоих тестов {len(g)})")

# журнал темы 09: «до и после» релиза 3.0 по соглашениям темы (без дублей и ботов, склейка по аккаунту, день по Минску)
ev = pd.read_parquet(EV / "events.parquet").drop_duplicates("event_id")
BOTS = ["d_1491e7f2", "d_5f53d378", "d_16b1367f", "d_4715e4ee", "d_a9034d05", "d_0f6dfd9a"]
ev = ev[~ev.anonymous_id.isin(BOTS)]
glue = ev.dropna(subset=["anonymous_id", "user_id"]).groupby("anonymous_id").user_id.first()
ev["person"] = ev.user_id.fillna(ev.anonymous_id.map(glue)).fillna(ev.anonymous_id)
ev["day"] = (ev.event_time.dt.tz_convert("UTC") + pd.Timedelta(hours=3)).dt.tz_localize(None).dt.floor("D")
ev["app"] = np.where(ev.platform == "web", "сайт", "приложение")
act = ev[ev.origin == "client"].groupby(["day", "app"]).person.nunique()
paid = ev[ev.event_name == "order_paid"].groupby(["day", "app"]).person.nunique()
d = pd.DataFrame({"act": act, "paid": paid}).fillna(0).reset_index()


def win(a, b):
    w = d[(d.day >= a) & (d.day <= b)].groupby("app")[["act", "paid"]].sum()
    return (w.paid / w.act * 100).to_dict()


J = {"до": win("2026-03-02", "2026-03-15"), "после": win("2026-03-16", "2026-03-29"), "кампания": win("2026-04-06", "2026-04-19")}
print("журнал 09, конверсия активного дня, %:", {k: {a: round(v, 2) for a, v in x.items()} for k, x in J.items()})
app_up = J["после"]["приложение"] / J["до"]["приложение"] - 1
web_up = J["после"]["сайт"] / J["до"]["сайт"] - 1
print(f"приложение {app_up:+.1%}, сайт {web_up:+.1%}, отношение относительных изменений {(1 + app_up) / (1 + web_up) - 1:+.1%}")

art = PAGE / "article.html"
a = art.read_text(encoding="utf-8")
NB = "&nbsp;"
ru = lambda v: f"{v:.1f}".replace(".", ",")
did = (J["после"]["приложение"] - J["до"]["приложение"]) - (J["после"]["сайт"] - J["до"]["сайт"])
rate_labels = [f"{J[period][platform]:.2f}".replace(".", ",") for period in ("до", "после") for platform in ("приложение", "сайт")]
for s in [*rate_labels, ru(J["кампания"]["приложение"]), ru(check["11111"][0]), ru(did)]:
    assert s in a, f"в article.html нет числа {s}"

# ---------------------------------------------------------------- 4. запись в page.js и article.html
DATA = {"P": P, "shock": [round(float(v), 7) for v in shock], "z": [[round(float(v), 7) for v in row] for row in z],
        "check": check, "rtm": rtm, "ab": {"saltB": round(float(salt_b), 1)}}
CODE = {
    "sim": {"code": src_sim, "out": out_sim,
            "note": 'Для анимации и калькулятора используются те же формулы и случайные числа (seed 481). Строки показывают, как меняется оценка после добавления очередной помехи. В двух последних столбцах указано отклонение от заданного прироста 10%, в процентных пунктах.'},
    "runs": {"code": src_runs, "out": out_runs,
             "note": "Ячейка продолжает предыдущую: simulate, estimate, LIFT и BEFORE уже в памяти. В каждом прогоне свой шум и свои "
                     "помехи, истинный эффект всегда +10%. Во второй части помех нет вовсе: завышение даёт только выбор момента релиза."},
    "hash": {"code": sql, "out": out_sql,
             "note": "Приведение ('x' || …)::bit(32)::bigint читает 8 шестнадцатеричных знаков как число, как int(…, 16) в Python. "
                     "erfc — дополнительная функция ошибок: для хи-квадрата с одной степенью свободы p = erfc(√(χ²/2)). "
                     "Расхождений с записанными группами нет: правило из README воспроизводит разбиение точно."},
}
js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False) + ";/*data:end*/", s, flags=re.S)
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/const CODE = " + json.dumps(CODE, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")

ALT = 'Распределение оценок в 1 000 прогонах. Оценки A/B сосредоточены около заданного прироста в 10%. У оценок по двум периодам разброс больше.'
tag = f'<img src="{fig}" alt="{ALT}">'
a, n = re.subn(r"<!--fig:runs-->.*?<!--/fig:runs-->", lambda _: f"<!--fig:runs-->{tag}<!--/fig:runs-->", a, flags=re.S)
assert n == 1, "нет метки рисунка runs"
art.write_text(a, encoding="utf-8")
print("рисунок:", round(len(fig.encode()) / 1024, 1), "КБ; RTM:", rtm)

r = subprocess.run(["node", str(HERE / "check_widget.js")], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip())
