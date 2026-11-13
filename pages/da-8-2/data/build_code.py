"""Запускает код страницы 8.2 и вписывает настоящий вывод в страницу.

Запуск из папки страницы:  python3 data/build_code.py
Скрипты из data/code/ выполняются по очереди во временной папке, куда скопирован общий учебный файл
data/viz/sales_monthly.csv. Каждый сохраняет рисунок SVG (Matplotlib, svg.fonttype='none').
- Три блока кода (q2chart, facets, pie2bars) попадают в PAGE.code между метками /*code:start*/ и /*code:end*/
  вместе с тем, что они напечатали.
- Все рисунки, включая четыре рисунка нюансов (nu_*), сжимаются (data/svgmin.py) и вставляются
  в article.html между метками <!--fig:имя--> и <!--/fig:имя--> как <img> с data URI.
Печать нюансов выводится в терминал для сверки чисел в подписях.
"""
import json, os, re, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
CSV = PAGE.parents[1] / "data" / "viz" / "sales_monthly.csv"
sys.path.insert(0, str(HERE))
from svgmin import data_uri  # noqa: E402

V = "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0"
BLOCKS = {
    "q2chart": ("Одна функция — четыре вопроса и четыре графика", V, "question_to_chart.svg"),
    "facets": ("Малые множители: приложение растёт, колл-центр угасает", V + ", seaborn 0.13.2", "facets.svg"),
    "pie2bars": ("Круг становится столбцами, и приложение видно третьим", V, "pie_to_bars.svg"),
}
NUANCES = {"nu_zero": "nu_zero.svg", "nu_sort": "nu_sort.svg", "nu_many": "nu_many.svg", "nu_dual": "nu_dual.svg"}
ALT = {
    "q2chart": "Сетка 2 на 2: столбцы выручки каналов за 2025 год по убыванию, линия общей выручки по месяцам с пиком в декабре 2025, гистограмма месячной выручки каналов с длинным хвостом вправо, рассеяние месяцев 2024 и 2025 годов вдоль диагонали",
    "facets": "Десять маленьких линейных графиков, по одному на канал: у приложения ступенька вверх в середине 2025 года, у колл-центра линия идёт вниз",
    "pie2bars": "Слева круговая диаграмма из десяти долей по алфавиту, справа те же доли столбцами по убыванию с подписями процентов",
    "nu_zero": "Две пары столбцов выручки по странам: при оси с нуля разница между Беларусью и Узбекистаном выглядит трёхкратной, при оси с 40 млн — многократно больше",
    "nu_sort": "Одни и те же столбцы выручки каналов: слева по алфавиту, справа по убыванию",
    "nu_many": "Слева десять цветных линий каналов с легендой, справа четыре линии: три крупнейших канала и сумма остальных с подписями у концов",
    "nu_dual": "Два графика с двумя осями Y: выручка магазина и случайный ряд; слева правая ось подогнана и линии идут вместе, справа ось сдвинута и случайный ряд выглядит плоским",
}

code, figs = {}, {}
with tempfile.TemporaryDirectory() as tmp:
    os.symlink(PAGE.parents[1] / "data", Path(tmp) / "data")     # путь в коде: data/viz/sales_monthly.csv
    for key in list(BLOCKS) + list(NUANCES):
        src = HERE / "code" / f"{key}.py"
        run = subprocess.run([sys.executable, str(src)], cwd=tmp, capture_output=True, text=True, check=True)
        if run.stderr.strip():
            print(f"!! {key} stderr:\n{run.stderr}")
        print(f"== {key}\n{run.stdout}")
        svg_name = BLOCKS[key][2] if key in BLOCKS else NUANCES[key]
        figs[key] = data_uri((Path(tmp) / svg_name).read_text(encoding="utf-8"))
        print(f"   рисунок: {len(figs[key].encode('utf-8')) / 1024:.1f} КБ")
        if key in BLOCKS:
            title, badge, _ = BLOCKS[key]
            code[key] = {"title": title, "badge": badge, "lang": "python",
                         "code": src.read_text(encoding="utf-8").rstrip(), "out": run.stdout.rstrip(),
                         "outLabel": "Вывод print; рисунок — под блоком"}

js = PAGE / "page.js"
s = js.read_text(encoding="utf-8")
s = re.sub(r"/\*code:start\*/.*?/\*code:end\*/",
           lambda _: "/*code:start*/const CODE = " + json.dumps(code, ensure_ascii=False) + ";/*code:end*/", s, flags=re.S)
js.write_text(s, encoding="utf-8")

art = PAGE / "article.html"
a = art.read_text(encoding="utf-8")
for key, uri in figs.items():
    tag = f'<img src="{uri}" alt="{ALT[key]}">'
    a, n = re.subn(rf"<!--fig:{key}-->.*?<!--/fig:{key}-->", lambda _: f"<!--fig:{key}-->{tag}<!--/fig:{key}-->", a, flags=re.S)
    if n != 1:
        print(f"!! метка рисунка {key} найдена {n} раз")
art.write_text(a, encoding="utf-8")
print("page.js и article.html обновлены; рисунки всего:", f"{sum(len(u.encode()) for u in figs.values()) / 1024:.0f} КБ")
