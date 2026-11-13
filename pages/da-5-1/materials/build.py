"""Материалы страницы 5.1: ноутбук с тремя блоками кода и скрипт, собирающий тысячу точек сцены.
Данные — общий набор data/probability (тема 05)."""
import re


def build(m):
    m.use_data("probability")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0 и SciPy 1.18."

    m.notebook("conditional_bayes.ipynb", "conditional_bayes.nb.py", "main")
    m.from_reader_folder("conditional_bayes.ipynb")

    # scene_points.py — тот же файл, которым собраны точки страницы: pages/da-5-1/data/scene_points.py
    m.take("scene_points.py", src="../data/scene_points.py")
    r = m.said("scene_points.py")
    r = m.run(["python", "scene_points.py", "--write"], what="python scene_points.py --write")
    raw_page = re.search(r"const RAW = '(\d+)'", (m.pdir / "page.js").read_text("utf-8")).group(1)
    made = (m.work / "scene_points.txt").read_text("utf-8")
    m.check("scene_points.py: строка из 7 000 цифр совпадает с точками в коде страницы", made == raw_page and len(made) == 7000)
    m.check("scene_points.py: в 200 случайных тысячах P(реклама | купил) от 0,138 до 0,633 — «от 14 до 63%» на странице",
            "от 0.138 до 0.633" in r.stdout)
    m.check("scene_points.py: в пропорциональной тысяче 299, 34 и 12 точек, как в анимации", "A=34 B=299 AB=12" in r.stdout)
