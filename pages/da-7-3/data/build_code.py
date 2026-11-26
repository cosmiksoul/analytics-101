"""Запускает блоки кода страницы 7.3 и вписывает код с настоящим выводом в page.js.

Запуск из любой папки:  python3 pages/da-7-3/data/build_code.py
Блоки выполняются по очереди в одной временной папке, как ячейки одного ноутбука. В неё копируется учебный набор
(пути в коде — data/eda/clients_export.csv и data/eda/daily_metrics.csv), первый блок сохраняет
очищенную таблицу clients_clean.parquet, следующие её читают. Рисунки, которые сохраняет код
(pairplot.svg, corr.svg), остаются во временной папке и удаляются: на странице рисунки — SVG по тем же числам.
template.py — пример структуры ноутбука. На странице он выводится как шаблон.
Вывод попадает в PAGE.code между метками /*code:start*/ и /*code:end*/.
"""
import json, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
PD = "проверено: Python 3.13, pandas 3.0.5"
BLOCKS = {
    "pairplot": ("Из пяти признаков самая высокая корреляция у визитов и заказов", PD + ", seaborn 0.13.2, matplotlib 3.10",
                 "Код сохранит рисунки в файлы pairplot.svg и corr.svg. Под примером показана матрица с коэффициентами Пирсона и Спирмена."),
    "segments": ("У покупателей из рассылки медиана среднего чека выше на каждом уровне лояльности", PD, None),
    "series": ("В дневных данных пропущены четыре даты, а 31 марта учтено частично", PD,
               "На графике отмечены полные выходные, пропуск в феврале и неполный последний день."),
    "template": ("Как записать наблюдения и выбрать следующую проверку", "шаблон ноутбука", None),
    "noise": ("Девять случайных корреляций из 190 оказались значимыми в первой выборке", "проверено: Python 3.13, NumPy 2.5.3, SciPy 1.18.1", None),
    "agg": ("В феврале сумма выручки в файле ниже на 17%, а средняя за день с данными выше на 7%", PD, None),
    "tail": ("Из-за неполного дня корреляция суточных изменений меняется с 0,17 до 0,37", PD, None),
}
code = {}
with tempfile.TemporaryDirectory() as tmp:
    shutil.copytree(PAGE.parents[1] / "data" / "eda", Path(tmp) / "data" / "eda")
    for key, (title, badge, note) in BLOCKS.items():
        src = (HERE / "code" / f"{key}.py").read_text(encoding="utf-8").rstrip()
        code[key] = {"title": title, "badge": badge, "lang": "python", "code": src}
        if key == "template":
            code[key]["badgeKind"] = "info"
        else:
            run = subprocess.run([sys.executable, str(HERE / "code" / f"{key}.py")], cwd=tmp, capture_output=True,
                                 encoding="utf-8", env=dict(os.environ, PYTHONIOENCODING="utf-8"), check=True)
            code[key]["out"] = run.stdout.rstrip()
            print(f"== {key}\n{run.stdout}")
        if note:
            code[key]["note"] = note

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/", lambda _: "/*code:start*/const CODE = " + json.dumps(code, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")
print("page.js обновлён")
