"""Запуск одного блока кода страницы 8.1 так, как его выполнил бы ноутбук.

python3 run_block.py <block.py> <папка для SVG> [prelude.py]

Сначала выполняется prelude (подготовка данных из «Анатомии графика»), потом блок, в одном пространстве имён.
Бэкенд — Agg (без окна). Каждый вызов savefig дополнительно сохраняет SVG той же фигуры для страницы:
svg.fonttype='none' (текст остаётся текстом), постоянная соль хешей и без даты — чтобы файл не менялся от запуска к запуску.
Вывод блока (stdout и предупреждения) не трогаем.
"""
import sys

import matplotlib

matplotlib.use("Agg")
from matplotlib.figure import Figure  # noqa: E402

block, out_dir = sys.argv[1], sys.argv[2]
prelude = sys.argv[3] if len(sys.argv) > 3 else None
_orig = Figure.savefig
_n = [0]


def _savefig(self, fname, *args, **kwargs):
    res = _orig(self, fname, *args, **kwargs)
    _n[0] += 1
    extra = {k: v for k, v in kwargs.items() if k not in ("dpi", "format", "metadata")}
    with matplotlib.rc_context({"svg.fonttype": "none", "svg.hashsalt": "da-8-1"}):
        _orig(self, f"{out_dir}/{_n[0]:02d}.svg", format="svg", metadata={"Date": None}, **extra)
    return res


Figure.savefig = _savefig
g = {"__name__": "__main__"}
for path in ([prelude] if prelude else []) + [block]:
    with open(path, encoding="utf-8") as f:
        exec(compile(f.read(), path, "exec"), g)
