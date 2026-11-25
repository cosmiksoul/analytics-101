"""Свойства матриц из урока 4.2 курса «Аналитика 101».

Скрипт вычисляет определитель, ранг и собственные значения матрицы 2 × 2, описывает
её собственные направления и показывает ранг таблицы координат 30 клиентов после преобразования.

Запуск из корня папки материалов (нужен общий набор data/clients/):
    python da-4-2-matrix-transforms/deform.py              семь матриц страницы
    python da-4-2-matrix-transforms/deform.py 1 2 0.5 1    своя матрица: a b c d, по строкам
"""
import sys

import numpy as np
import pandas as pd

EPS = 1e-9


def unit(v):
    """Выбираем единичный вектор с положительной первой ненулевой координатой."""
    v = np.where(np.abs(v) < EPS, 0.0, v) / np.linalg.norm(v)
    return -v if v[np.flatnonzero(v)[0]] < 0 else v


def describe(M):
    """Вычисляем определитель, ранг и собственные значения матрицы, заданной по строкам."""
    A = np.array(M, dtype=float).reshape(2, 2)
    res = {"det": float(np.linalg.det(A)), "rank": int(np.linalg.matrix_rank(A, tol=EPS))}
    tr = A[0, 0] + A[1, 1]
    disc = tr ** 2 / 4 - (A[0, 0] * A[1, 1] - A[0, 1] * A[1, 0])     # по знаку дискриминанта различаем типы корней
    lam, V = np.linalg.eig(A)                                        # столбцы V — собственные векторы
    if disc < -EPS:                                                  # у матрицы нет вещественных собственных векторов
        res.update(kind="complex", re=float(lam[0].real), im=float(abs(lam[0].imag)))
    elif abs(disc) <= EPS:                                           # λ повторяется
        l = float(tr / 2)
        if np.allclose(A, l * np.eye(2), atol=EPS):                  # матрица l·I: любой ненулевой вектор собственный
            res.update(kind="scalar", lam=[l, l])
        else:                                                        # собственные векторы лежат на одной прямой
            v = np.linalg.svd(A - l * np.eye(2))[2][-1]              # направление, которое A − l·I сжимает в ноль
            res.update(kind="defective", lam=[l, l], vec=[unit(v).tolist()])
    else:
        order = np.argsort(-lam.real)                                # сначала большее λ
        res.update(kind="real", lam=[float(lam[i].real) for i in order],
                   vec=[unit(V[:, i].real).tolist() for i in order])
    return res


def cloud():
    """Выбираем 30 клиентов после стандартизации дохода и трат по всей таблице."""
    df = pd.read_csv("data/clients/clients.csv")
    X = df[["income", "spend"]].to_numpy(dtype=float)
    Z = (X - X.mean(axis=0)) / X.std(axis=0)
    return Z[np.random.default_rng(58).choice(len(Z), 30, replace=False)]


def line(name, M, P):
    r = describe(M)
    Q = P @ np.array(M, dtype=float).reshape(2, 2).T                  # каждая точка p переходит в A @ p
    head = f"{name:<12} [{M[0]:g} {M[1]:g}; {M[2]:g} {M[3]:g}]".ljust(34)
    head += f"det = {r['det'] + 0:5.2f}  ранг {r['rank']}  ранг облака {np.linalg.matrix_rank(Q, tol=1e-8)}  "
    num = lambda x: f"{round(x, 9) + 0:g}"                            # 2.2e-16 печатаем как 0, −0 как 0
    vec = lambda v: f"({v[0] + 0:.3f}, {v[1] + 0:.3f})"
    if r["kind"] == "complex":
        return head + f"λ = {num(r['re'])} ± {num(r['im'])}i — вещественных собственных векторов нет"
    if r["kind"] == "scalar":
        return head + f"λ = {num(r['lam'][0])} дважды — любой ненулевой вектор собственный"
    if r["kind"] == "defective":
        return head + f"λ = {num(r['lam'][0])} дважды, одно собственное направление вдоль {vec(r['vec'][0])}"
    return head + f"λ₁ = {num(r['lam'][0])}, v₁ = {vec(r['vec'][0])};  λ₂ = {num(r['lam'][1])}, v₂ = {vec(r['vec'][1])}"


if __name__ == "__main__":
    P = cloud()
    if len(sys.argv) == 5:
        print(line("ваша", [float(x) for x in sys.argv[1:]], P))
    else:
        for name, M in [("стартовая", [1.5, 1, 0.5, 1]), ("единичная", [1, 0, 0, 1]), ("растяжение", [2, 0, 0, 1]),
                        ("сдвиг", [1, 0.8, 0, 1]), ("поворот", [0.8, -0.6, 0.6, 0.8]), ("отражение", [-1, 0, 0, 1]),
                        ("вырожденная", [1, 2, 0.5, 1])]:
            print(line(name, M, P))

# Вывод:
# стартовая    [1.5 1; 0.5 1]       det =  1.00  ранг 2  ранг облака 2  λ₁ = 2, v₁ = (0.894, 0.447);  λ₂ = 0.5, v₂ = (0.707, -0.707)
# единичная    [1 0; 0 1]           det =  1.00  ранг 2  ранг облака 2  λ = 1 дважды — любой ненулевой вектор собственный
# растяжение   [2 0; 0 1]           det =  2.00  ранг 2  ранг облака 2  λ₁ = 2, v₁ = (1.000, 0.000);  λ₂ = 1, v₂ = (0.000, 1.000)
# сдвиг        [1 0.8; 0 1]         det =  1.00  ранг 2  ранг облака 2  λ = 1 дважды, одно собственное направление вдоль (1.000, 0.000)
# поворот      [0.8 -0.6; 0.6 0.8]  det =  1.00  ранг 2  ранг облака 2  λ = 0.8 ± 0.6i — вещественных собственных векторов нет
# отражение    [-1 0; 0 1]          det = -1.00  ранг 2  ранг облака 2  λ₁ = 1, v₁ = (0.000, 1.000);  λ₂ = -1, v₂ = (1.000, 0.000)
# вырожденная  [1 2; 0.5 1]         det =  0.00  ранг 1  ранг облака 1  λ₁ = 2, v₁ = (0.894, 0.447);  λ₂ = 0, v₂ = (0.894, -0.447)
