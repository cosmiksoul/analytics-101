"""Собирает данные и код страницы 6.4 в page.js.

1. Берёт grid.json (интерактив) и scene.json (сцена) и вписывает их в page.js между /*data:start*/ и /*data:end*/.
2. Запускает каждый блок data/code/<имя>.py из корня учебника (пути в коде — data/probability/… и
   data/inference/ab.csv) и вписывает код с настоящим выводом между /*code:start*/ и /*code:end*/.

Порядок, всё из корня учебника:
  python3 data/inference/gen_ab.py --scene pages/da-6-4/data/scene.json   (данные и числа сцены)
  python3 pages/da-6-4/data/grid.py                                       (сетка интерактива, около 10 минут)
  python3 pages/da-6-4/data/inject.py
"""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
B1 = "проверено: Python 3.13, SciPy 1.18.1"
B2 = "проверено: Python 3.13, SciPy 1.18.1, statsmodels 0.15.0"
BLOCKS = {
    "four": ("Четыре способа сравнить суммы покупок в одном эксперименте", B1),
    "alpha_sim": ("На малых выборках чеков с длинным хвостом тест реже замечает рост на 20%", B1),
    "chi": ("Связь источника визита с покупкой и сравнение двух долей оплативших", B2),
    "mw_median": ("Критерий Манна — Уитни обнаруживает различие распределений при равных медианах", B1),
    "pretest": ("Отклонение чеков от нормальности ещё не исключает тест Уэлча", B1),
    "welch_student": ("При большем разбросе в малой группе тест Стьюдента даёт 25,5% ложных срабатываний", B1),
    "clusters": ("Если анализировать сессии как независимые наблюдения, ложные срабатывания учащаются", B1),
}

# ---------- данные интерактива и сцены ----------
g = json.loads((HERE / "grid.json").read_text(encoding="utf-8"))
m = g["meta"]
grid = {s: [[[round(g["res"][f"{s}|{n}|{e}"][c], 4) for c in m["crit"]] for e in m["effects"]] for n in m["ns"]] for s in m["shapes"]}
data = {"meta": m, "grid": grid, "hist": g["hist"], "scene": json.loads((HERE / "scene.json").read_text(encoding="utf-8"))}

# ---------- код ----------
code = {}
for key, (title, badge) in BLOCKS.items():
    src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
    run = subprocess.run([sys.executable, str(HERE / "code" / f"{key}.py")], cwd=PAGE.parents[1], capture_output=True, text=True, check=True)
    code[key] = {"title": title, "badge": badge, "lang": "python", "code": src, "out": run.stdout.rstrip()}
    print(f"== {key}\n{run.stdout}")

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "/*data:end*/", s, flags=re.S)
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/" + json.dumps(code, ensure_ascii=False) + "/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
