"""Материалы страницы 7.1: ноутбук с пятью блоками кода, скрипт отчёта для отдельного окружения и встроенный пример паспорта.
Данные — общий набор data/eda (тема 07)."""
import json
import re
import subprocess
from pathlib import Path

FGDP = "/home/claude/venvs/fgdp/bin/python"      # fg-data-profiling 4.20.0, pandas 2.3.3
YDATA = "/home/claude/venvs/ydata/bin/python"    # ydata-profiling 4.18.4, pandas 2.3.3

HEAD = '''"""Черновик автоматического отчёта по учебной выгрузке: пакет fg-data-profiling (прежнее имя — ydata-profiling).

Страница 7.1 «Как познакомиться с таблицей» курса «Аналитика 101».
Скрипту нужно отдельное окружение: в примере используется pandas 2.3.3, а остальной код урока рассчитан на pandas 3.

  python -m venv profile-env
  profile-env/bin/pip install "fg-data-profiling==4.20.0"         (в Windows: profile-env\\\\Scripts\\\\pip)
  profile-env/bin/python da-7-1-first-look/profile_report.py      (из корня папки материалов)

Нужен общий набор data/eda/ (clients_export.csv). Скрипт сохраняет отчёт clients_profile.html в папку,
из которой запущен, и печатает предупреждения отчёта и значения из сводок по столбцам.
С прежним пакетом ydata-profiling 4.18.4 замените импорт на «from ydata_profiling import ProfileReport»:
вывод тот же, но в чистом окружении Python 3.13 пакету нужен ещё setuptools ниже 81.
"""
'''


def build(m):
    m.use_data("eda")
    m.versions = ("Код проверен на Python 3.13, pandas 3.0 и matplotlib 3.10; profile_report.py — на fg-data-profiling 4.20.0 "
                  "с pandas 2.3 в отдельном окружении. Для расчёта объёма памяти в ноутбуке использовался PyArrow.")

    m.notebook("first_look.ipynb", "first_look.nb.py", "main")
    m.from_reader_folder("first_look.ipynb")
    m.check("ноутбук не оставил missing_map.csv и missing_map.svg в материалах страницы",
            not (m.out / "missing_map.csv").exists() and not (m.out / "missing_map.svg").exists())

    # блок с автоматическим отчётом — отдельным скриптом: ему нужен pandas ниже 3.0
    m.put("profile_report.py", HEAD + m.page_code("ydata"))
    if Path(FGDP).exists():
        # сверяем только stdout: индикатор хода пакет пишет в поток ошибок, на странице блок помечен «Вывод (stdout)»
        r = subprocess.run([FGDP, "-W", "ignore", "profile_report.py"], cwd=m.sync(), capture_output=True, text=True)
        m.check("profile_report.py в окружении с fg-data-profiling 4.20.0: код возврата 0", r.returncode == 0, r.stderr[-600:])
        m.same("profile_report.py в окружении с fg-data-profiling 4.20.0: вывод как на странице", r.stdout, m.page_out("ydata"))
        html = m.work / "clients_profile.html"
        m.check("profile_report.py сохранил отчёт clients_profile.html", html.exists() and html.stat().st_size > 1_000_000)
    else:
        print("   ! окружение с fg-data-profiling не найдено, сверка profile_report.py пропущена")
    if Path(YDATA).exists():
        old = (m.out / "profile_report.py").read_text("utf-8").replace("from data_profiling import ProfileReport", "from ydata_profiling import ProfileReport")
        (m.sync() / "_profile_old.py").write_text(old, "utf-8")
        r = subprocess.run([YDATA, "-W", "ignore", "_profile_old.py"], cwd=m.work, capture_output=True, text=True)
        m.same("тот же скрипт с импортом ydata_profiling в окружении с ydata-profiling 4.18.4: вывод тот же", r.stdout, m.page_out("ydata"))
    else:
        print("   ! окружение с ydata-profiling не найдено, сверка со старым пакетом пропущена")

    # встроенный пример паспорта — те же 300 строк, что вшиты в страницу
    m.take("passport_sample.csv", src="../data/passport_sample.csv")
    sample = json.loads(re.search(r"/\*sample:start\*/const SAMPLE = (.*?);/\*sample:end\*/", (m.pdir / "page.js").read_text("utf-8"), re.S).group(1))
    text = (m.out / "passport_sample.csv").read_text("utf-8")
    m.check("passport_sample.csv: 300 строк, побайтно совпадает с примером, вшитым в страницу", text == sample and text.count("\n") == 301, str(text.count("\n")))
