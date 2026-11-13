"""Запускает код страницы 11.3 и вписывает настоящий вывод в страницу.

Запуск:  python3 pages/da-11-3/data/build_code.py   (после gen_page.py)
- code/users.sql выполняется в PostgreSQL 16 (база ab, сокет /tmp, psql -P null=NULL);
- code/analysis.py, delta.py, boot.py — ячейки одного ноутбука: выполняются подряд во временной папке,
  куда подложены sessions.parquet, exposures.csv и users.csv из data/ab.
Код и вывод попадают в PAGE.code между /*code:start*/ и /*code:end*/.
Сверяет вывод кода с DATA из gen_page.py: если генератор и код разошлись, падает.
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
AB = PAGE.parents[1] / "data" / "ab"
C = HERE / "code"

run = subprocess.run(["psql", "-h", "/tmp", "-U", "postgres", "-d", "ab", "-X", "-P", "pager=off", "-P", "null=NULL",
                      "-f", str(C / "users.sql")], capture_output=True, text=True, check=True)
assert not run.stderr.strip(), run.stderr
sql_out = run.stdout.rstrip()

cells = [(C / f).read_text(encoding="utf-8").rstrip() for f in ("analysis.py", "delta.py", "boot.py")]
with tempfile.TemporaryDirectory() as tmp:
    (Path(tmp) / "data").symlink_to(AB.parent)                  # путь в коде: data/ab/…
    src = "\nprint('<<<cell>>>')\n".join(cells)
    out = subprocess.run([sys.executable, "-c", src], cwd=tmp, capture_output=True, text=True, check=True)
    assert not out.stderr.strip(), out.stderr
o1, o2, o3 = (x.strip("\n").rstrip() for x in out.stdout.split("<<<cell>>>\n"))

# сверка с DATA из gen_page.py
s = (PAGE / "page.js").read_text(encoding="utf-8")
DATA = json.loads(re.search(r"/\*data:start\*/const DATA = (.*?);/\*data:end\*/", s, re.S).group(1))
cv, ss = DATA["sc"]["conv"], DATA["sc"]["sess"]
c = lambda v, d: f"{v:.{d}f}".replace(".", ",")
assert f"A     | {cv['na']} |      {100 * cv['ma']:.2f}" in sql_out, sql_out
want = (f"+{c(100 * cv['d'], 2)} п. п. [{c(100 * cv['lo'], 2)}; {c(100 * cv['hi'], 2)}], +{c(100 * cv['rel'], 1)}% "
        f"[{c(100 * cv['rlo'], 1)}; {c(100 * cv['rhi'], 1)}]")
assert want in o1, (want, o1)
assert f"{ss['ratio']:.3f}" in o2 and f"{ss['se_naive']:.5f}" in o2 and f"{ss['se_delta']:.5f}" in o2, o2
assert f"по сессиям {ss['se_naive']:.5f}" in o3, o3

PY = "проверено: Python 3.13"
CODE = {
    "sql": {"title": "Строка на пользователя в PostgreSQL", "badge": "проверено: PostgreSQL 16", "lang": "sql",
            "code": (C / "users.sql").read_text(encoding="utf-8").rstrip(), "out": sql_out,
            "outLabel": "Вывод psql: сводка по группам checkout_v2",
            "note": "Запуск — psql с <code>-P null=NULL</code>, NULL в этой сводке нет. Числа совпадают с pandas ниже, "
                    "сценой и отчётом: те же правила свёртки, та же группа из показа, те же три бота."},
    "full": {"title": "От лога до отчёта: баланс, тесты, интервалы", "badge": PY + " · statsmodels 0.15", "lang": "python",
             "code": cells[0], "out": o1, "outLabel": "Вывод: проверки качества и отчёт",
             "note": "pandas 3.0.5, SciPy 1.18.1, statsmodels 0.15.0; файлы — из data/ab. <code>confint_proportions_2indep</code> "
                     "с <code>method=\"wald\"</code> — тот же нормальный интервал, что в формуле страницы; z-тест считает "
                     "ошибку по общей доле, интервал — по долям групп."},
    "delta": {"title": "Дельта-метод для ratio-метрик", "badge": PY + " · NumPy 2.5", "lang": "python",
              "code": cells[1], "out": o2, "outLabel": "Вывод: ошибки разницы, если строка — сессия и если строка — человек",
              "note": "Ячейка продолжает предыдущую. Для строки-сессии знаменатель равен 1, ковариация и дисперсия знаменателя "
                      "обнуляются, и формула даёт наивную ошибку z-теста."},
    "boot": {"title": "Бутстрэп по пользователям и обрезка хвоста", "badge": PY + " · NumPy 2.5", "lang": "python",
             "code": cells[2], "out": o3, "outLabel": "Вывод: бутстрэп по людям и по сессиям, выручка, обрезка",
             "note": "Ячейка продолжает предыдущие. Зерно генератора зафиксировано, 2 000 перевыборок на группу; "
                     "повторный запуск даёт те же числа. Ячейка идёт около 10 секунд."},
}
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/",
           lambda _: "/*code:start*/const CODE = " + json.dumps(CODE, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
(PAGE / "page.js").write_text(s, encoding="utf-8")
print(sql_out, "\n\n", o1, "\n\n", o2, "\n\n", o3)
