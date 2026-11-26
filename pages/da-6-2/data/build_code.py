"""Запускает блоки кода страницы 6.2 и вписывает код с настоящим выводом в page.js.

Запуск из любой папки:  python3 pages/da-6-2/data/build_code.py
Каждый файл data/code/<имя>.py выполняется из корня учебника (пути в коде — data/probability/…),
вывод попадает в PAGE.code между метками /*code:start*/ и /*code:end*/.
"""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
SM, SP, NP = "statsmodels 0.15.0", "SciPy 1.18.1", "NumPy 2.5.3"
BLOCKS = {
    "mean_ci": ("95-процентный интервал для среднего чека — от 3 818 до 5 152 ₽", f"проверено: Python 3.13, {SP}, {SM}"),
    "prop_ci": ("Для двух покупок за сто визитов методы дают разные границы", f"проверено: Python 3.13, {SM}"),
    "boot_median": ("Бутстрэп-интервал для медианы чека — от 3 000 до 3 450 ₽", f"проверено: Python 3.13, {NP}, {SP}"),
    "coverage": ("При 270 чеках t-интервал содержит среднее в 91,7% выборок", f"проверено: Python 3.13, {NP}, {SP}, {SM}"),
    "overlap": ("Интервал разности конверсий лежит целиком выше нуля", f"проверено: Python 3.13, {SM}"),
    "boot_small": ("На малых выборках бутстрэп-интервал часто оказывается слишком узким", f"проверено: Python 3.13, {NP}, {SP}"),
}
NOTES = {
    "prop_ci": "Метод normal в statsmodels ограничивает значения диапазоном от 0 до 1. Поэтому в примере со ста визитами нижняя граница равна нулю. В последней строке показан результат формулы до этого ограничения.",
    "boot_median": "Суммы чеков кратны 10 ₽. В этом примере границы всех трёх интервалов совпали. Функция scipy.stats.bootstrap по умолчанию использует метод BCa.",
    "coverage": "Покрытие оценено по 10 000 или 20 000 выборкам. Даже при неизменном методе и размере выборки доля попаданий немного меняется от серии к серии.",
}
code = {}
for key, (title, badge) in BLOCKS.items():
    src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
    run = subprocess.run([sys.executable, "-I", "-X", "utf8", str(HERE / "code" / f"{key}.py")], cwd=PAGE.parents[1], capture_output=True, encoding="utf-8", check=True)
    code[key] = {"title": title, "badge": badge, "lang": "python", "code": src, "out": run.stdout.rstrip()}
    if key in NOTES:
        code[key]["note"] = NOTES[key]
    print(f"== {key}\n{run.stdout}")

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/" + json.dumps(code, ensure_ascii=False) + "/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
