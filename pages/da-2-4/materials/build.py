"""Материалы страницы 2.4: три учебные таблицы, генератор с перебором зерна и ноутбук с кодом страницы."""
import hashlib


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def build(m):
    # Данные лежат рядом со страницей: pages/da-2-4/data/
    src = m.pdir / "data"
    for name in ("orders.csv", "countries.csv", "managers.csv", "gen.py"):
        m.put(f"data/{name}", (src / name).read_bytes())

    # Генератор воспроизводит все три файла; пишет он рядом с собой, поэтому сверяем в рабочей копии
    before = {n: sha(m.out / "data" / n) for n in ("orders.csv", "countries.csv", "managers.csv")}
    m.run(["python", "data/gen.py"], what="python data/gen.py")
    after = {n: sha(m.work / "data" / n) for n in before}
    m.check("data/gen.py с зерном 186 побайтно воспроизводит orders.csv, countries.csv и managers.csv", before == after)
    code = (src / "gen.py").read_text("utf-8")
    m.check("в генераторе есть перебор зерна (--search) и условия отбора ok()", "--search" in code and "def ok(" in code)

    # Ноутбук: четыре блока раздела «Код», вывод дословно как на странице
    m.notebook("report.ipynb", "report.nb.py", "main")
    m.check("ноутбук сохранил график revenue_by_channel.png", (m.work / "revenue_by_channel.png").stat().st_size > 5000)
