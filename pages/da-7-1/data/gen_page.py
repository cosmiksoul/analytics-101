"""Данные страницы 7.1: сцена, встроенный пример паспорта, карта пропусков и вывод кода.

Запуск из любой папки:  python3 pages/da-7-1/data/gen_page.py
Источник — общая учебная выгрузка темы 07: ../../data/eda/clients_export.csv (её не меняем).

1. Числа сцены считает pandas по полной выгрузке и вписывает в page.js между /*data:start*/ и /*data:end*/.
2. Встроенный пример «Паспорта датасета» — 300 строк выгрузки как есть, текстом (data/passport_sample.csv):
   288 случайных строк без пустых и повторных client_id + 4 строки с пустым client_id + 4 пары дублей ключа,
   иначе в 300 строк не попадут редкие проблемы 1 и 7. Зерно — первое, начиная с 7071, при котором в выборку
   попали и остальные проблемы (N/A, «-», −1 и 99 хотя бы по 3 раза). Текст вписывается между /*sample:start*/ и /*sample:end*/.
3. Блоки кода из data/code/*.py выполняются во временной папке со ссылкой data → data/ учебника (пути в коде —
   data/eda/clients_export.csv), вывод вставляется как есть. ydata.py запускается в отдельном окружении
   /home/claude/venvs/fgdp (fg-data-profiling 4.20.0 на pandas 2.3.3), остальные — в основном (pandas 3.0.5). Карту пропусков для SVG код сохраняет в missing_map.csv.
"""
import json, os, re, subprocess, sys, tempfile
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
SRC = PAGE.parents[1] / "data" / "eda" / "clients_export.csv"
PROFILE_PY = "/home/claude/venvs/fgdp/bin/python"

df = pd.read_csv(SRC)
raw_lines = SRC.read_text(encoding="utf-8").splitlines()
n = len(df)

# ---------------------------------------------------------------- 1. сцена
def bins(counts):
    return [int(c) for c in counts]

def num_hist(s, lo, hi, width):
    edges = np.arange(lo, hi + width, width)
    c, _ = np.histogram(s.dropna(), bins=edges)
    return bins(c)

signup = pd.to_datetime(df["signup_date"], format="%Y-%m-%d", errors="coerce").fillna(
    pd.to_datetime(df["signup_date"], format="%d.%m.%Y", errors="coerce"))
last = pd.to_datetime(df["last_order_at"], utc=True).dt.tz_convert("Europe/Moscow")
tail = df["last_order_at"].str[19:]
idn = df["client_id"].dropna()

cols = []
def col(name, kind, hist, **kw):
    s = df[name]
    d = {"name": name, "dtype": str(s.dtype), "kind": kind, "na": int(s.isna().sum()),
         "uniq": int(s.nunique()), "nonnull": int(s.notna().sum()), "hist": hist}
    d.update(kw)
    cols.append(d)

col("client_id", "id", num_hist(df["client_id"], 100_000, 112_000, 1000), dup=int(idn.duplicated().sum()))
col("signup_date", "date", bins(signup.dt.to_period("M").value_counts().sort_index().values),
    fmt=[["ГГГГ-ММ-ДД", int(df["signup_date"].str.match(r"^\d{4}-").sum())],
         ["ДД.ММ.ГГГГ", int(df["signup_date"].str.match(r"^\d\d\.").sum())]],
    days=int(signup.nunique()), dmin=str(signup.min().date()), dmax=str(signup.max().date()))
col("last_order_at", "datetime", bins(last.dropna().dt.tz_localize(None).dt.to_period("W").value_counts().sort_index().values),
    fmt=[["+03:00", int((tail == "+03:00").sum())], ["Z", int((tail == "Z").sum())]],
    dmin=str(last.min().date()), dmax=str(last.max().date()))
col("country", "cat", [int(v) for v in df["country"].value_counts().values], top=df["country"].value_counts().index.tolist())
col("age", "num", num_hist(df["age"], 15, 100, 5), hid=int((df["age"] == 99).sum()), tok="99",
    mx2=float(df.loc[df["age"] < 99, "age"].max()))
vc = df["channel"].value_counts()
col("channel", "cat", [int(v) for v in vc.values], top=vc.index.tolist(), hid=int((df["channel"] == "-").sum()), tok="«-»")
col("tier", "ord", [int(v) for v in df["tier"].value_counts().sort_index().values])
col("visits_q1", "num", num_hist(df["visits_q1"], 0, 26, 2))
col("orders_q1", "num", [int((df["orders_q1"] == v).sum()) for v in range(-1, 11)], hid=int((df["orders_q1"] == -1).sum()), tok="−1")
col("spend_q1", "num", num_hist(df["spend_q1"], 0, 20_000_000, 1_000_000),
    mx=float(df["spend_q1"].max()), big=int((df["spend_q1"] > 1_000_000).sum()))

miss = int(df.isna().sum().sum())
hidden = int((df["channel"] == "-").sum() + (df["orders_q1"] == -1).sum() + (df["age"] == 99).sum())
DATA = {"n": n, "m": df.shape[1], "bytes": SRC.stat().st_size, "lines": len(raw_lines),
        "mem": int(df.memory_usage(deep=True).sum()), "miss": miss, "hidden": hidden,
        "dtypes": df.dtypes.astype(str).value_counts().to_dict(),
        "raw": raw_lines[:7], "cols": cols}

# ---------------------------------------------------------------- 2. встроенный пример
nan_id = np.where(df["client_id"].isna())[0]
dupmask = (df["client_id"].duplicated(keep=False) & df["client_id"].notna()).values
dup_ids = df.loc[dupmask, "client_id"].unique()
pool = np.where(df["client_id"].notna().values & ~dupmask)[0]
for seed in range(7071, 7200):
    rng = np.random.default_rng(seed)
    base = rng.choice(pool, 288, replace=False)
    ids = rng.choice(dup_ids, 4, replace=False)
    idx = np.sort(np.concatenate([base, np.where(df["client_id"].isin(ids).values)[0], rng.choice(nan_id, 4, replace=False)]))
    s = df.iloc[idx]
    if min(s["country"].isna().sum(), (s["channel"] == "-").sum(), (s["orders_q1"] == -1).sum(), (s["age"] == 99).sum()) >= 3:
        break
sample_text = "\n".join([raw_lines[0]] + [raw_lines[i + 1] for i in idx]) + "\n"
(HERE / "passport_sample.csv").write_text(sample_text, encoding="utf-8")
smp = pd.read_csv(HERE / "passport_sample.csv")
print(f"пример: seed {seed}, {len(smp)} строк, {len(sample_text.encode('utf-8'))} байт")
DATA["sample"] = {"seed": seed, "n": len(smp)}

# ---------------------------------------------------------------- 3. код
B = "проверено: Python 3.13, pandas 3.0.5"
BLOCKS = {
    "na": ("«N/A» стал NaN сам, «-», −1 и 99 остались данными", B, None, None),
    "dups": ("40 повторов ключа, а duplicated() насчитал 64", B, None, None),
    "dates": ("Смесь поясов pandas не разберёт сам, а «угадай формат» портит даты", B, None, None),
    "checklist": ("Десять проверок первого взгляда: семь подозрений до первого графика", B, None, None),
    "missmap": ("Пропуски last_order_at стоят там, где заказов ноль", B + ", matplotlib 3.10",
                "Тепловая карта ниже нарисована SVG по missing_map.csv, который сохраняет этот код; файл missing_map.svg от matplotlib в страницу не вшит.", None),
    "ydata": ("Девять предупреждений отчёта, и только одно задевает подложенную проблему", "проверено: fg-data-profiling 4.20.0, pandas 2.3.3 (отдельное окружение)",
              "Запущено в отдельном окружении: пакет требует pandas ниже 3.0. Прежняя версия, ydata-profiling 4.18.4 с импортом <code>from ydata_profiling import ProfileReport</code>, выдаёт те же девять предупреждений. Но в чистом окружении Python 3.13 она не импортируется, пока не поставить setuptools ниже 81: ей нужен модуль pkg_resources.", PROFILE_PY),
}
code, heat = {}, None
with tempfile.TemporaryDirectory() as tmp:
    os.symlink(PAGE.parents[1] / "data", Path(tmp) / "data")
    for key, (title, badge, note, py) in BLOCKS.items():
        path = HERE / "code" / f"{key}.py"
        src = path.read_text(encoding="utf-8").rstrip()
        run = subprocess.run([py or sys.executable, "-W", "ignore", str(path)], cwd=tmp, capture_output=True, text=True, check=True)
        code[key] = {"title": title, "badge": badge, "lang": "python", "code": src, "out": run.stdout.rstrip()}
        if note:
            code[key]["note"] = note
        print(f"== {key}\n{run.stdout}")
    hm = pd.read_csv(Path(tmp) / "missing_map.csv")
    heat = {"cols": hm.columns.tolist(), "m": (hm * 100).round().astype(int).values.tolist()}
DATA["heat"] = heat
code["ydata"]["outLabel"] = "Вывод (stdout)"

# ---------------------------------------------------------------- запись в page.js
js = PAGE / "page.js"
t = js.read_text(encoding="utf-8")
t = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/const DATA = " + json.dumps(DATA, ensure_ascii=False) + ";/*data:end*/", t, flags=re.S)
t = re.sub(r"/\*sample:start\*/.*?/\*sample:end\*/", lambda _: "/*sample:start*/const SAMPLE = " + json.dumps(sample_text, ensure_ascii=False) + ";/*sample:end*/", t, flags=re.S)
t = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/const CODE = " + json.dumps(code, ensure_ascii=False) + ";/*code:end*/", t, flags=re.S)
js.write_text(t, encoding="utf-8")
print("page.js обновлён")
