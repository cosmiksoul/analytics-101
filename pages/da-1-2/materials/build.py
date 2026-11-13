"""Материалы страницы 1.2: ответ API файлом, ноутбук с упражнениями, решения, два скрипта."""
import contextlib
import io
import json
import re


def build(m):
    # orders_api.json — строка raw из первого блока кода, без изменений
    ns = {}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(m.page_code("json"), ns)
    m.put("orders_api.json", ns["raw"].strip("\n") + "\n")
    m.check("orders_api.json разбирается в тот же словарь, что в блоке кода",
            json.loads((m.out / "orders_api.json").read_text("utf-8")) == ns["data"])

    # Ноутбук с упражнениями и ноутбук с решениями — из одного исходника
    m.notebook("types_collections.ipynb", "types_collections.nb.py", "main")
    m.notebook("types_collections_solutions.ipynb", "types_collections.nb.py", "solutions")

    # Опыт «ссылка или копия»: ожидаемый вывод записан в хвосте скрипта
    m.take("refs_demo.py")
    m.said("refs_demo.py")

    # Замеры: время зависит от машины, проверяем порядок разрыва, о котором говорит страница
    m.take("speed.py")
    r = m.run(["python", "speed.py"])
    print("   speed.py:\n" + "\n".join("     " + l for l in r.stdout.strip().split("\n")))
    gaps = [int(x.replace(" ", "")) for x in re.findall(r"разрыв ×([\d ]+)", r.stdout)]
    m.check("speed.py: три замера", len(gaps) == 3, r.stdout)
    if len(gaps) == 3:
        m.check("speed.py: множество быстрее списка на порядки (страница: 5 мс против долей микросекунды)", gaps[0] > 10_000, str(gaps))
        m.check("speed.py: set(data) быстрее цикла в сотни раз (страница: «в сотни раз»)", gaps[1] > 100, str(gaps))
        m.check("speed.py: NumPy быстрее цикла в десятки раз (страница: 40 мс против 1 мс)", gaps[2] > 10, str(gaps))
