"""Материалы страницы 4.2: ноутбук с шестью блоками кода и расчёт интерактива на NumPy.
Данные — общий набор data/clients (тема 04)."""
import importlib.util
import json
import re
import os
import subprocess
import sys
import tempfile

import numpy as np

# 24 матрицы для сверки формул интерактива с NumPy: готовые кнопки, матрицы сцены и разные случаи
MATS = [[1.5, 1, 0.5, 1], [1, 0, 0, 1], [2, 0, 0, 1], [1, 0.8, 0, 1], [0.8, -0.6, 0.6, 0.8], [-1, 0, 0, 1],
        [1, 2, 0.5, 1], [0, 0, 0, 0], [0.3, -1.7, 1.2, 0.4], [2, -2, 2, -2], [-1.5, 0.7, 0.2, 1.9], [0, 1, 1, 0],
        [0, -1, 1, 0], [1.2, 0.4, 0.4, 1.2], [0.5, 0, 1.3, -0.8], [-2, 1.1, -0.3, 0.6], [1, 1, 1, 1],
        [0.1, 0.2, 0.3, 0.4], [1.9, -0.4, 0.7, 0.2], [-0.6, -1.4, 1.0, -0.6], [2, 0, 0, 2], [0, 1.5, 0, 0],
        [1.1, -1.3, 0.9, -1.0], [0.7, 1.6, -0.2, 1.8]]


def build(m):
    m.use_data("clients")

    # Ноутбук: шесть блоков страницы сверяются с её выводом дословно; упражнений на странице нет
    m.notebook("matrix_transforms.ipynb", "matrix_transforms.nb.py", "main")
    m.from_reader_folder("matrix_transforms.ipynb")

    # deform.py: вывод записан в хвосте скрипта
    m.take("deform.py")
    m.said("deform.py")

    # Сверка deform.py с формулами интерактива страницы на 24 матрицах
    sys.dont_write_bytecode = True                       # иначе рядом с deform.py появится __pycache__
    spec = importlib.util.spec_from_file_location("deform", m.out / "deform.py")
    deform = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(deform)
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(MATS, f)
    js = json.loads(subprocess.run(["node", str(m.src / "_eig_dump.js"), str(m.pdir / "page.js"), f.name],
                                   capture_output=True, text=True, check=True).stdout)
    bad = []
    for M, j in zip(MATS, js):
        r = deform.describe(M)
        ok = r["kind"] == j["kind"] and abs(r["det"] - j["det"]) < 1e-9 and r["rank"] == j["rank"]
        if ok and r["kind"] == "complex":
            ok = abs(r["re"] - j["re"]) < 1e-9 and abs(r["im"] - j["im"]) < 1e-9
        elif ok:
            ok = abs(r["lam"][0] - j["l1"]) < 1e-7 and abs(r["lam"][1] - j["l2"]) < 1e-7
            for v, key in zip(r.get("vec", []), ("v1", "v2")):                 # векторы параллельны
                ok = ok and abs(v[0] * j[key][1] - v[1] * j[key][0]) < 1e-7
        if not ok:
            bad.append(f"{M}: NumPy {r} / страница {j}")
    m.check(f"deform.py совпадает с формулами интерактива на {len(MATS)} матрицах: вид, определитель, ранг, λ, направления векторов",
            not bad, "\n      " + "\n      ".join(bad))

    # 30 точек сцены на странице — тот же выбор default_rng(58), что в deform.py и в блоке кода
    pts = json.loads(re.search(r"const PTS = (\[\[.*?\]\]);", (m.pdir / "page.js").read_text("utf-8")).group(1))
    cwd = os.getcwd()
    os.chdir(m.sync())
    try:
        P = deform.cloud()
    finally:
        os.chdir(cwd)
    m.check("30 точек сцены на странице совпадают с выбором default_rng(58) до третьего знака",
            len(pts) == 30 and np.allclose(P, np.array(pts), atol=5.1e-4), f"наибольшее расхождение {np.abs(P - np.array(pts)).max():.5f}")
    m.check("зерно 58: все 30 точек в пределах двух стандартных отклонений (как сказано на странице)",
            float(np.abs(P).max()) <= 2, f"наибольшее |z| = {np.abs(P).max():.3f}")
