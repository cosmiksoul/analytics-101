"""Сверка «Паспорта датасета» (JS) с pandas на встроенном примере и на полной выгрузке.

Запуск из папки страницы:  python3 data/check_passport.py [page.js]
Код паспорта берётся из page.js между метками /*passport:start*/ и /*passport:end*/ и запускается в node
на data/passport_sample.csv (300 строк, встроенный пример) и на ../../data/eda/clients_export.csv (12 040 строк).
С pandas 3.0.5 сравниваются: dtype, число пропусков, число уникальных, min и max чисел, память
memory_usage(deep=True), а также то, на чём стоят эвристики: пропуски в ключе, повторы ключа без NaN,
форматы дат, часовые пояса, коды −1 и 99, строки «N/A» и «-», мало уникальных у чисел.
"""
import json, re, subprocess, sys
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
js_path = Path(sys.argv[1]) if len(sys.argv) > 1 else PAGE / "page.js"
core = re.search(r"/\*passport:start\*/(.*?)/\*passport:end\*/", js_path.read_text(encoding="utf-8"), re.S).group(1)
FILES = {"пример": HERE / "passport_sample.csv", "полная выгрузка": PAGE.parents[1] / "data" / "eda" / "clients_export.csv"}

ok_all = True
for label, path in FILES.items():
    prog = core + "\nconst fs = require('fs'); const P = profile(fs.readFileSync(process.argv[1], 'utf8'));\n" \
                  "console.log(JSON.stringify(P, (k, v) => (k === 'hist' ? undefined : v)));"
    P = json.loads(subprocess.run(["node", "-e", prog, str(path)], capture_output=True, text=True, check=True).stdout)
    df = pd.read_csv(path)
    raw = pd.read_csv(path, dtype=str, keep_default_na=False)
    rows, bad = [], []
    for c in P["cols"]:
        s = df[c["name"]]
        num = pd.api.types.is_numeric_dtype(s)
        exp = {"dtype": str(s.dtype), "na": int(s.isna().sum()), "uniq": int(s.nunique()),
               "min": float(s.min()) if num else None, "max": float(s.max()) if num else None,
               "mem": int(s.memory_usage(deep=True, index=False))}
        got = {k: c.get(k) for k in exp}
        for k in exp:
            if exp[k] != got[k] and not (k in ("min", "max") and exp[k] is None):
                bad.append(f"{c['name']}.{k}: JS {got[k]} ≠ pandas {exp[k]}")
        rows.append([c["name"], got["dtype"], got["na"], got["uniq"], c["kind"], "; ".join(f["c"] for f in c["flags"]) or "—"])
    mem = int(df.memory_usage(deep=True).sum())
    if P["mem"] != mem:
        bad.append(f"память: JS {P['mem']} ≠ pandas {mem}")
    # то, на чём стоят эвристики, — отдельно через pandas
    F = {c["name"]: c for c in P["cols"]}
    flags = lambda n: {f["c"] for f in F[n]["flags"]}
    idn = df["client_id"].dropna()
    tail = raw["last_order_at"].str[19:]
    checks = {
        "1 ключ — число с пропусками": (df["client_id"].dtype == "float64" and df["client_id"].isna().sum() > 0, "id-na" in flags("client_id")),
        "2 даты строкой, два формата": (df["signup_date"].dtype == "str" and pd.to_datetime(df["signup_date"], format="%Y-%m-%d", errors="coerce").isna().sum() > 0, {"date-str", "date-fmt"} <= flags("signup_date")),
        "3 разные часовые пояса": ((tail == "Z").sum() > 0 and (tail == "+03:00").sum() > 0, "date-tz" in flags("last_order_at")),
        "4 age = 99": ((df["age"] == 99).sum() >= 3, [99, int((df["age"] == 99).sum())] in F["age"]["sent"]),
        "5 «N/A» и «-»": ((raw["country"] == "N/A").sum() > 0 and (df["channel"] == "-").sum() > 0,
                          ["N/A", int((raw["country"] == "N/A").sum())] in F["country"]["naTok"] and ["-", int((df["channel"] == "-").sum())] in F["channel"]["fake"]),
        "6 orders_q1 = −1": ((df["orders_q1"] == -1).sum() >= 3, [-1, int((df["orders_q1"] == -1).sum())] in F["orders_q1"]["sent"]),
        "7 повторы ключа": (idn.duplicated().sum() > 0, F["client_id"].get("dup") == int(idn.duplicated().sum())),
        "мало уникальных у чисел": (sorted(c for c in df.select_dtypes("number") if 2 <= df[c].nunique() <= 10),
                                     sorted(n for n in F if "few" in flags(n))),
    }
    print(f"\n=== {label}: {path.name}, {P['n']} строк × {P['m']} столбцов, разделитель {P['delim']!r}, память JS {P['mem']} / pandas {mem}")
    print(pd.DataFrame(rows, columns=["столбец", "dtype", "пропусков", "уникальных", "смысл", "флаги"]).to_string(index=False))
    print("\nэвристика                       pandas   паспорт")
    for k, (a, b) in checks.items():
        same = (a == b) if isinstance(a, list) else (bool(a) and bool(b))
        print(f"{k:<30}  {str(a):<7}  {str(b):<7}  {'OK' if same else 'РАСХОЖДЕНИЕ'}")
        if not same:
            bad.append(k)
    print("\nрасхождений с pandas:", len(bad), *bad, sep="\n  " if bad else " ")
    ok_all &= not bad
sys.exit(0 if ok_all else 1)
