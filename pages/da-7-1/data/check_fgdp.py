"""Сверка блока ydata.py с прежним пакетом ydata-profiling.

Запуск из любой папки:  python3 pages/da-7-1/data/check_fgdp.py
Код из data/code/ydata.py (импорт `from data_profiling import ProfileReport`) выполняется в отдельном
окружении /home/claude/venvs/fgdp (fg-data-profiling 4.20.0 на pandas 2.3.3; ставилось командой
`python3 -m venv /home/claude/venvs/fgdp && /home/claude/venvs/fgdp/bin/pip install fg-data-profiling==4.20.0`),
а тот же код с импортом `from ydata_profiling import ProfileReport` — в /home/claude/venvs/ydata (ydata-profiling 4.18.4).
Выводы сравниваются построчно.
Основное окружение (pandas 3.0.5) не затрагивается.
"""
import os, subprocess, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
code = (HERE / "code" / "ydata.py").read_text(encoding="utf-8")
outs = {}
with tempfile.TemporaryDirectory() as tmp:
    os.symlink(HERE.parents[2] / "data", Path(tmp) / "data")
    for env, src in (("fgdp", code), ("ydata", code.replace("from data_profiling import", "from ydata_profiling import"))):
        script = Path(tmp) / f"run_{env}.py"
        script.write_text(src, encoding="utf-8")
        run = subprocess.run([f"/home/claude/venvs/{env}/bin/python", "-W", "ignore", str(script)], cwd=tmp, capture_output=True, text=True, check=True)
        outs[env] = run.stdout.rstrip()
print(outs["fgdp"])
print("\nвывод совпадает с ydata-profiling 4.18.4:", outs["fgdp"] == outs["ydata"])
