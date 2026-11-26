"""Запускает код страницы 11.4 и вписывает настоящий вывод в страницу.

Запуск:  python3 pages/da-11-4/data/build_code.py
Каждый файл из code/ выполняется отдельно во временной папке, куда подложены exposures.csv, users.csv и sessions.parquet
из data/ab. Код и вывод попадают в PAGE.code между /*code:start*/ и /*code:end*/; рисунок novelty.svg (сжатый svgmin.py
страницы 9.3) — в article.html между <!--fig:novelty--> и <!--/fig:novelty--> как <img> с data URI.
"""
import json, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
ROOT = PAGE.parents[1]
AB = ROOT / "data" / "ab"
sys.path.insert(0, str(ROOT / "pages" / "da-9-3" / "data"))
from svgmin import data_uri  # noqa: E402

ALT = ("Относительная разница в конверсии сессий между B и A с 95%-ми интервалами. "
       "дни 0–2 +21,8%, дни 3–6 +8,9%, дни 7–13 +11,0%, дни 14–27 −0,3%. Пунктир показывает заданную в модели "
       "постоянную прибавку 4% и временный эффект новизны. Горизонтальная линия соответствует оценке за 28 дней (+10,4%).")


def run(name, tmp):
    o = subprocess.run([sys.executable, str(HERE / "code" / f"{name}.py")], cwd=tmp, capture_output=True, encoding="utf-8", env={**os.environ, "PYTHONIOENCODING": "utf-8"}, check=True)
    assert not o.stderr.strip(), o.stderr
    return o.stdout.rstrip()


with tempfile.TemporaryDirectory() as tmp:
    target = Path(tmp) / "data" / "ab"
    target.mkdir(parents=True)
    for name in ("exposures.csv", "sessions.parquet", "users.csv"):
        shutil.copyfile(AB / name, target / name)
    out = {n: run(n, tmp) for n in ("peek", "multi", "srm", "novelty")}
    fig = data_uri((Path(tmp) / "novelty.svg").read_text(encoding="utf-8"))

src = lambda n: (HERE / "code" / f"{n}.py").read_text(encoding="utf-8").rstrip()
PY = "проверено: Python 3.13"
CODE = {
    "peek": {"title": "Как часто в 20 000 A/A-тестов возникает ложный сигнал", "badge": PY + ", NumPy 2.5.3", "lang": "python",
             "code": src("peek"), "out": out["peek"], "outLabel": "Доля тестов со значимым различием",
             "note": "Для тренажёра и кода использованы одинаковые последовательности случайных чисел. "
                     "В этой симуляции метрики независимы. Для связанных метрик частота ложных сигналов может отличаться."},
    "multi": {"title": "Поправки на множественность в statsmodels", "badge": "проверено: statsmodels 0.15.0", "lang": "python",
              "code": src("multi"), "out": out["multi"], "outLabel": "Скорректированные p-значения и число отклонённых гипотез",
              "note": "multipletests возвращает четыре объекта, [1] — скорректированные p: их сравнивают с 0,05. "
                      "holm — метод Холма: та же гарантия FWER, что у Бонферрони, но чуть мягче. В таблице checkout_v2 "
                      "показаны 6 гипотез из 16 с самыми маленькими p."},
    "srm": {"title": "Распределение по группам в трёх экспериментах", "badge": PY + ", SciPy 1.18.1", "lang": "python",
            "code": src("srm"), "out": out["srm"], "outLabel": "Вывод: три теста, затем сегменты reco_block",
            "note": "Учитываются и записи ботов. Проверка показывает, согласуется ли число записанных участников с планом. "
                    "У сайта версии приложения нет, поэтому сегмент называется просто web."},
    "novelty": {"title": "Разница в конверсии сессий после первого показа", "badge": PY + ", pandas 3.0.5, Matplotlib 3.10.0",
                "lang": "python", "code": src("novelty"), "out": out["novelty"],
                "outLabel": "Относительный прирост и 95%-й интервал, %",
                "note": "Интервал относительного эффекта — дельта-метод для логарифма отношения конверсий сессий по пользователям, "
                        "как в 11.3. Пунктир показывает эффект, заданный в генераторе учебных данных."},
}

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s, k = re.subn(r"/\*code:start\*/.*?/\*code:end\*/",
               lambda _: "/*code:start*/const CODE = " + json.dumps(CODE, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
assert k == 1, "метка code не найдена"
js.write_text(s, encoding="utf-8")

art = PAGE / "article.html"
a = art.read_text(encoding="utf-8")
a, n = re.subn(r"<!--fig:novelty-->.*?<!--/fig:novelty-->",
               lambda _: f'<!--fig:novelty--><img src="{fig}" alt="{ALT}"><!--/fig:novelty-->', a, flags=re.S)
assert n == 1, f"метка рисунка найдена {n} раз"
art.write_text(a, encoding="utf-8")
for name, o in out.items():
    print(f"=== {name}\n{o}\n")
print("рисунок:", round(len(fig.encode()) / 1024, 1), "КБ")
