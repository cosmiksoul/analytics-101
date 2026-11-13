"""Общие функции сборки материалов страницы.

Сценарий сборки лежит рядом со страницей: pages/<id>/materials/build.py.
Он получает объект Mat и описывает, что положить в материалы и как проверить.
Запуск — через tools/build_materials.py <id>.

Правило: каждый файл с кодом запускается, а его вывод сверяется с выводом
на странице. Расхождение — ошибка сборки.
"""
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist" / "materials"


def _page(page_id, key):
    r = subprocess.run(["node", str(ROOT / "tools" / "extract_page.js"), page_id, key],
                       capture_output=True, text=True, cwd=ROOT)
    if r.returncode != 0:
        raise SystemExit(f"extract_page {page_id} {key}: {r.stderr}")
    return json.loads(r.stdout)


def norm(text):
    """Вывод для сравнения: без хвостовых пробелов, путей к файлам и строки с приглашением."""
    lines = []
    for line in text.replace("\r\n", "\n").split("\n"):
        line = re.sub(r"\x1b\[[0-9;]*m", "", line).rstrip()      # цветовые коды терминала
        if line.startswith("$ "):                      # приглашение терминала со страницы
            continue
        line = re.sub(r'File "[^"]*[/\\]([^"/\\]+)"', r'File "\1"', line)   # путь → имя файла
        lines.append(line)
    while lines and not lines[-1]:
        lines.pop()
    while lines and not lines[0]:
        lines.pop(0)
    return lines


def _subseq(small, big):
    it = iter(big)
    return all(any(x == y for y in it) for x in small)


def svg_norm(text):
    """SVG из matplotlib без того, что меняется от запуска к запуску: даты и случайных id."""
    text = re.sub(r"<dc:date>.*?</dc:date>", "", text, flags=re.S)
    ids = {}
    for x in re.findall(r'\bid="([^"]+)"', text):
        ids.setdefault(x, f"id{len(ids)}")
    return re.sub(r'(\bid="|url\(#|href="#)([^")]+)', lambda m: m.group(1) + ids.get(m.group(2), m.group(2)), text)


def note_md(note):
    """Примечание к блоку кода со страницы → Markdown."""
    s = re.sub(r"<code>(.*?)</code>", lambda m: "`" + m.group(1) + "`", note)
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).replace("\xa0", " ")


class Mat:
    def __init__(self, page_id):
        self.id = page_id
        self.pdir = ROOT / "pages" / page_id
        self.src = self.pdir / "materials"
        self.stem = json.loads((self.pdir / "meta.json").read_text("utf-8"))["file"]
        self.code = _page(page_id, "code")
        self.listed = _page(page_id, "materials")
        self.out = DIST / self.stem
        if self.out.exists():
            shutil.rmtree(self.out)
        self.out.mkdir(parents=True)
        self.work = Path(tempfile.mkdtemp(prefix=f"mat-{page_id}-"))
        self.checks = []          # (ok, что проверяли, подробности)
        self.extra = ""           # абзацы, которые сценарий страницы добавляет в README
        self.shared = []          # общие наборы данных: лежат один раз в dist/materials/data/<набор>/
        self.versions = "Код проверен на Python 3.13, NumPy 2.5 и pandas 3.0."   # строка README; сценарий может заменить

    # ---------- страница ----------
    def page_code(self, key):
        return self.code[key]["code"].rstrip("\n") + "\n"

    def page_out(self, key):
        return self.code[key].get("out", "")

    # ---------- файлы ----------
    def put(self, name, data):
        p = self.out / name
        p.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(data, bytes):
            p.write_bytes(data)
        else:
            p.write_text(data, encoding="utf-8", newline="\n")
        return p

    def take(self, name, src=None):
        """Скопировать файл или папку из pages/<id>/materials/ в материалы."""
        s = self.src / (src or name)
        d = self.out / name
        d.parent.mkdir(parents=True, exist_ok=True)
        if s.is_dir():
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy2(s, d)
        return d

    def use_data(self, name):
        """Общий набор данных (tools/build_shared_data.py): в папку страницы не копируется,
        в рабочей копии лежит как data/<набор>/ — так же, как у читателя в корне материалов."""
        src = DIST / "data" / name
        if not src.is_dir():
            raise SystemExit(f"нет общего набора {name}: сначала python3 tools/build_shared_data.py {name}")
        self.shared.append(name)

    def sync(self):
        """Рабочая папка для запусков: копия материалов, чтобы побочные файлы не попали в выдачу."""
        shutil.copytree(self.out, self.work, dirs_exist_ok=True)
        for name in self.shared:
            shutil.copytree(DIST / "data" / name, self.work / "data" / name, dirs_exist_ok=True)
        return self.work

    # ---------- проверки ----------
    def check(self, what, ok, detail=""):
        self.checks.append((bool(ok), what, detail))
        return bool(ok)

    def same(self, what, actual, expected, mode="exact", mask=None):
        """mode: exact — совпадает; contains — строки страницы есть в выводе по порядку
        (вывод на странице сокращён); within — строки вывода есть на странице по порядку;
        bag — те же строки в любом порядке (вывод и предупреждения в ноутбуке идут раздельно).
        mask — регулярное выражение для того, что меняется от запуска к запуску (время):
        совпадения заменяются на «#», пробелы подряд схлопываются."""
        a, e = norm(actual), norm(expected)
        if mask:
            a = [re.sub(r" +", " ", re.sub(mask, "#", x)) for x in a]
            e = [re.sub(r" +", " ", re.sub(mask, "#", x)) for x in e]
            what += " (время скрыто маской)"
        if mode == "exact":
            ok = a == e
        elif mode == "contains":
            ok = _subseq(e, a)
        elif mode == "within":
            ok = _subseq(a, e)
        elif mode == "bag":                 # те же строки в любом порядке: в Jupyter предупреждения идут после вывода
            ok = sorted(a) == sorted(e)
        else:
            raise ValueError(mode)
        detail = ""
        if not ok:
            detail = "\n      ожидалось:\n" + "\n".join("        " + x for x in e) + \
                     "\n      получено:\n" + "\n".join("        " + x for x in a)
        return self.check(f"{what} [{mode}]", ok, detail)

    def run(self, cmd, expect=None, mode="exact", what=None, code=0, timeout=900, sub=None, stdin=None, mask=None, merge=False):
        """Запустить команду в рабочей папке. cmd — список; 'python' заменяется текущим интерпретатором.
        sub — подпапка рабочей копии, из которой запускать; stdin — файл (от рабочей папки) на вход команде;
        merge — писать ошибки в общий поток с выводом, как в терминале (нужно для psql)."""
        self.sync()
        argv = [sys.executable if c == "python" else c for c in cmd]
        env = dict(os.environ, PYTHONIOENCODING="utf-8", PYTHONDONTWRITEBYTECODE="1", NO_COLOR="1")
        feed = (self.work / stdin).read_text("utf-8") if stdin else None
        r = subprocess.run(argv, cwd=self.work / sub if sub else self.work, text=True, encoding="utf-8",
                           timeout=timeout, env=env, input=feed, stdout=subprocess.PIPE,
                           stderr=subprocess.STDOUT if merge else subprocess.PIPE)
        if merge:
            r.stderr = ""
        label = what or " ".join(cmd)
        if code is not None:
            self.check(f"{label}: код возврата {code}", r.returncode == code,
                       f"\n      код {r.returncode}\n{r.stderr[-1500:]}" if r.returncode != code else "")
        if expect is not None:
            self.same(f"{label}: вывод как на странице", r.stdout + r.stderr, expect, mode, mask)
        return r

    def alone(self, sources, prelude=None, together=False, files=()):
        """Запустить блоки кода так, как их запускает страница: по отдельности, каждый своим процессом,
        или (together) подряд в одном процессе. files — что ещё положить в рабочую папку запуска.
        Возвращает папку, где остались картинки: с ними сверяются картинки ноутбука или склеенного скрипта."""
        ref = Path(tempfile.mkdtemp(prefix="alone-"))
        for name in self.shared:
            shutil.copytree(DIST / "data" / name, ref / "data" / name)
        for f in files:
            shutil.copy2(f, ref / Path(f).name)
        head = Path(prelude).read_text("utf-8") + "\n" if prelude else ""
        texts = [(Path(src).name, Path(src).read_text("utf-8")) for src in sources]
        if together:
            texts = [(" + ".join(n for n, _ in texts), "\n".join(t for _, t in texts))]
        for name, text in texts:
            r = subprocess.run([sys.executable, "-c", head + text], cwd=ref, capture_output=True,
                               text=True, env={**os.environ, "MPLBACKEND": "Agg"})
            if r.returncode:
                self.check(f"{name}: запуск блока вне ноутбука", False, "\n" + r.stderr[-1200:])
        return ref

    def pictures(self, what, ref, names):
        """Картинки в рабочей папке те же, что в папке ref: PNG сверяются по пикселям,
        SVG — по тексту без даты и случайных id."""
        bad = []
        for n in names:
            a, b = self.work / n, Path(ref) / n
            if not a.exists() or not b.exists():
                bad.append(f"{n}: нет файла")
            elif n.endswith(".svg"):
                if svg_norm(a.read_text("utf-8")) != svg_norm(b.read_text("utf-8")):
                    bad.append(n)
            else:
                import matplotlib.image as mpimg
                x, y = mpimg.imread(a), mpimg.imread(b)
                if x.shape != y.shape or not bool((x == y).all()):
                    bad.append(n)
        return self.check(f"{what} (файлов: {len(names)})", not bad, "\n      отличаются: " + ", ".join(bad))

    def script(self, name, key, mode="exact", code=0, args=()):
        """Блок кода страницы → файл .py; запуск и сверка вывода со страницей."""
        self.put(name, self.page_code(key))
        return self.run(["python", name, *args], expect=self.page_out(key), mode=mode, code=code)

    def glue(self, name, title, about, keys, need=""):
        """Несколько блоков кода страницы подряд одним скриптом; ожидаемый вывод — выводы блоков подряд."""
        num = self.id.split("-", 1)[1].replace("-", ".")
        page = json.loads((self.pdir / "meta.json").read_text("utf-8"))["title"]
        text = (f'"""{title}\n\nСтраница {num} «{page}» курса «Аналитика 101». {about}\n'
                f'Запуск из корня папки материалов: python {self.stem}/{name}{need}\n"""\n')
        for k in keys:
            text += f"\n# ===== {self.code[k]['title']} =====\n" + self.page_code(k)
        self.put(name, text)
        return self.run(["python", name], expect="\n".join(self.page_out(k).strip("\n") for k in keys), what=f"python {name}")

    def said(self, name):
        """Самопроверяемый скрипт: вывод записан в хвосте файла после строки «# Вывод:»."""
        text = (self.out / name).read_text("utf-8")
        tail = text.split("# Вывод:\n", 1)
        if len(tail) != 2:
            return self.check(f"{name}: есть блок «# Вывод:»", False)
        expected = "\n".join(l[2:] if l.startswith("# ") else l.lstrip("#") for l in tail[1].splitlines())
        return self.run(["python", name], expect=expected, what=f"python {name}")

    # ---------- ноутбуки ----------
    def parse_nb(self, src_name):
        """Исходник ноутбука в «процентном» формате (# %% …) → список ячеек.

        Виды ячеек:
          # %% [markdown] [main|solutions]   текст; строки начинаются с «# »
          # %% page:<ключ> [within|bag|free] [~ <regex>]   блок кода страницы: заголовок, код, примечание;
                                             within — на странице вывод длиннее; bag — строки те же, порядок любой;
                                             free — вывод сверяет сценарий страницы (build.py), а не эта функция;
                                             ~ — маска для того, что меняется от запуска к запуску
          # %% code [within:<ключ>]          своя ячейка кода; within — вывод сверяется со страницей
          # %% exercise                      заготовка для читателя (только в основном ноутбуке)
          # %% solution                      решение (только в ноутбуке с решениями)
          # %% check                         проверка упражнения (в обоих)
        """
        cells, cur = [], None
        for line in (self.src / src_name).read_text("utf-8").split("\n"):
            m = re.match(r"# %%\s*(.*)$", line)
            if m:
                if cur:
                    cells.append(cur)
                head = m.group(1).strip()
                cur = {"head": head, "lines": []}
            elif cur is not None:
                cur["lines"].append(line)
        if cur:
            cells.append(cur)
        out = []
        for c in cells:
            head, body = c["head"], "\n".join(c["lines"]).strip("\n")
            if head.startswith("[markdown]"):
                only = head[len("[markdown]"):].strip() or None
                text = "\n".join(l[2:] if l.startswith("# ") else l.lstrip("#") for l in body.split("\n"))
                out.append({"kind": "md", "text": text, "only": only})
            elif head.startswith("page:"):
                head, _, mask = head.partition(" ~ ")
                parts = head[5:].split()
                key, mode = parts[0], (parts[1] if len(parts) > 1 else "exact")
                blk = self.code[key]
                out.append({"kind": "md", "text": "### " + blk["title"], "only": None})
                out.append({"kind": "code", "text": self.page_code(key).rstrip("\n"), "expect": (key, mode, mask.strip() or None), "only": None})
                if blk.get("note"):
                    out.append({"kind": "md", "text": note_md(blk["note"]), "only": None})
            elif head.startswith("code"):
                exp = None
                m = re.search(r"(within|contains|exact):(\S+)", head)
                if m:
                    exp = (m.group(2), m.group(1), None)
                out.append({"kind": "code", "text": body, "expect": exp, "only": None})
            elif head == "exercise":
                out.append({"kind": "code", "text": body, "expect": None, "only": "main", "role": "exercise"})
            elif head == "solution":
                out.append({"kind": "code", "text": body, "expect": None, "only": "solutions", "role": "solution"})
            elif head == "check":
                out.append({"kind": "code", "text": body, "expect": None, "only": None, "role": "check"})
            else:
                raise SystemExit(f"{src_name}: неизвестная ячейка «{head}»")
        return out

    def notebook(self, name, src_name, variant="main", timeout=900, without=()):
        """Собрать ноутбук, выполнить и сверить ячейки со страницей.

        main      — выполняются ячейки до первого упражнения, у остальных вывода нет;
        solutions — выполняется весь ноутбук, ошибок быть не должно.
        """
        import nbformat
        from nbclient import NotebookClient
        from nbformat.v4 import new_code_cell, new_markdown_cell, new_notebook

        spec = [c for c in self.parse_nb(src_name) if c["only"] in (None, variant)]
        nb = new_notebook()
        nb.metadata["kernelspec"] = {"display_name": "Python 3", "language": "python", "name": "python3"}
        nb.metadata["language_info"] = {"name": "python"}
        for i, c in enumerate(spec, start=1):
            cell = new_markdown_cell(c["text"]) if c["kind"] == "md" else new_code_cell(c["text"])
            cell["id"] = f"c{i:02d}"
            nb.cells.append(cell)

        stop = len(spec)
        if variant == "main":
            for i, c in enumerate(spec):
                if c.get("role") == "exercise":
                    stop = i
                    break
        part = nbformat.from_dict(json.loads(json.dumps(nb)))
        part.cells = part.cells[:stop]
        self.sync()
        for w in without:                       # убрать из рабочей папки: ноутбук должен создать это сам
            p = self.work / w
            if p.is_dir():
                shutil.rmtree(p)
            elif p.exists():
                p.unlink()
        client = NotebookClient(part, timeout=timeout, kernel_name="python3", record_timing=False,
                                resources={"metadata": {"path": str(self.work)}})
        try:
            client.execute()
            self.check(f"{name}: выполнен без ошибок ({sum(c['kind'] == 'code' for c in spec[:stop])} ячеек кода)", True)
        except Exception as e:                                   # noqa: BLE001
            self.check(f"{name}: выполнен без ошибок", False, "\n" + str(e)[-2500:])
        for i in range(stop):
            if spec[i]["kind"] != "code":
                continue
            nb.cells[i]["outputs"] = part.cells[i].get("outputs", [])
            nb.cells[i]["execution_count"] = part.cells[i].get("execution_count")
            if spec[i].get("expect"):
                key, mode, mask = spec[i]["expect"]
                if mode == "free":
                    continue
                got = "".join(o.get("text", "") for o in nb.cells[i]["outputs"] if o.get("output_type") == "stream")
                self.same(f"{name}: блок «{key}»", got, self.page_out(key), mode, mask)
        if variant == "main" and stop < len(spec):
            # Нетронутые заготовки: ячейка-заготовка выполняется без ошибки,
            # а проверка под ней падает на assert с понятным сообщением, а не на NameError
            raw = nbformat.from_dict(json.loads(json.dumps(nb)))
            self.sync()
            try:
                NotebookClient(raw, timeout=timeout, kernel_name="python3", record_timing=False, allow_errors=True,
                               resources={"metadata": {"path": str(self.work)}}).execute()
            except Exception as e:                               # noqa: BLE001
                self.check(f"{name}: прогон с нетронутыми заготовками", False, "\n" + str(e)[-1500:])
            wrong = []
            for c, cell in zip(spec, raw.cells):
                err = [o.get("ename") for o in cell.get("outputs", []) if o.get("output_type") == "error"]
                if c.get("role") == "exercise" and err:
                    wrong.append(f"заготовка падает: {err[0]}")
                if c.get("role") == "check" and err != ["AssertionError"]:
                    wrong.append(f"проверка даёт {err or 'нет ошибки'} вместо AssertionError")
            n = sum(c.get("role") == "check" for c in spec)
            self.check(f"{name}: {n} проверок на нетронутых заготовках дают AssertionError", not wrong, "\n      " + "; ".join(wrong))
        nbformat.validate(nb)
        p = self.out / name
        nbformat.write(nb, p)
        return nb

    # ---------- итог ----------
    def readme(self):
        """README.md папки материалов: что лежит и как запускать."""
        num = self.id.split("-", 1)[1].replace("-", ".")
        title = json.loads((self.pdir / "meta.json").read_text("utf-8"))["title"]
        rows = []
        for name, desc in self.listed:
            if self._shared(name):
                rows.append(f"| `{name}` | {desc}. Лежит один раз в корне материалов, а не в этой папке |")
            elif name.endswith("/"):
                if (self.out / name).is_dir():
                    rows.append(f"| `{name}` | {desc} |")
            elif (self.out / name).exists():
                rows.append(f"| `{name}` | {desc} |")
        text = (f"# Материалы страницы {num} «{title}»\n\n"
                "Аналитика 101 · блок «Дата аналитика».\n\n"
                "| файл | что это |\n|---|---|\n" + "\n".join(rows) + "\n\n"
                + (self._how_shared() if self.shared else
                   "Как запускать: скрипты — командой `python имя_файла.py` из этой папки, "
                   "ноутбуки — по порядку сверху вниз. Пути к данным в коде относительные, "
                   "поэтому файлы должны лежать так же, как в этой папке.\n\n") +
                f"{self.versions} На других версиях вывод "
                "может отличаться в мелочах. Данные учебные.\n" + (("\n" + self.extra.strip() + "\n") if self.extra else ""))
        self.put("README.md", text)

    def _how_shared(self):
        """Абзац «как запускать» для страницы с общими наборами данных."""
        has_sql = any(p.suffix == ".sql" for p in self.out.rglob("*"))
        has_nb = any(p.suffix == ".ipynb" for p in self.out.rglob("*"))
        how = ("Как запускать: из корня папки материалов, где лежит `data/`: пути к общему набору в коде "
               f"заданы от него. Например, `python {self.stem}/имя_файла.py`"
               + (f" или `psql -d {self.shared[0]} -f {self.stem}/имя_файла.sql`" if has_sql else "") + ". ")
        if has_nb:
            how += ("Ноутбук можно открыть прямо из этой папки: его первая ячейка сама находит корень "
                    "с `data/` и переходит в него. ")
        if has_sql:
            how += f"Как загрузить базу — в `data/{self.shared[0]}/README.md`."
        else:
            readmes = " и ".join(f"`data/{s}/README.md`" for s in self.shared)
            how += f"Описание {'наборов' if len(self.shared) > 1 else 'набора'} — в {readmes}."
        return how + "\n\n"

    def from_reader_folder(self, name, timeout=900):
        """У читателя ноутбук лежит в папке страницы, а data/ — уровнем выше. Выполняем ноутбук
        из такой раскладки: первая ячейка должна сама найти корень материалов."""
        import nbformat
        from nbclient import NotebookClient
        root = Path(tempfile.mkdtemp(prefix="reader-"))
        page = root / self.stem
        shutil.copytree(self.out, page)
        for s in self.shared:
            shutil.copytree(DIST / "data" / s, root / "data" / s)
        nb = nbformat.read(page / name, as_version=4)
        for c in nb.cells:
            if c.cell_type == "code":
                c.outputs, c.execution_count = [], None
        what = f"{name}: выполняется из папки страницы, когда data/ лежит уровнем выше"
        try:
            NotebookClient(nb, timeout=timeout, kernel_name="python3", record_timing=False,
                           resources={"metadata": {"path": str(page)}}).execute()
            self.check(what, True)
        except Exception as e:                                   # noqa: BLE001
            self.check(what, False, "\n" + str(e)[-1500:])
        shutil.rmtree(root, ignore_errors=True)

    def _shared(self, name):
        """Строка списка материалов указывает на общий набор: data/<набор>/…"""
        parts = name.split("/")
        return len(parts) >= 2 and parts[0] == "data" and parts[1] in self.shared

    def finish(self):
        self.readme()
        have = {str(p.relative_to(self.out)).replace(os.sep, "/") for p in self.out.rglob("*") if p.is_file()}
        waiting = []
        for name, _desc in self.listed:
            if name.endswith(".md") and name.startswith(self.stem):
                waiting.append(name)                  # Markdown-версия страницы — после прохода по движку
                continue
            if self._shared(name):
                self.check(f"общий набор {name} собран в dist/materials/data/", (DIST / name.rstrip("/")).exists())
                continue
            if name.endswith("/"):
                self.check(f"в материалах есть папка {name}", any(h.startswith(name) for h in have))
            else:
                self.check(f"в материалах есть {name}", name in have)
        listed = {n for n, _ in self.listed}
        extra = sorted(h for h in have if h not in listed and h != "README.md" and not any(h.startswith(n) for n in listed if n.endswith("/")))
        bad = [c for c in self.checks if not c[0]]
        print(f"\n== {self.id} → dist/materials/{self.stem}/")
        for p in sorted(self.out.rglob("*")):
            if p.is_file():
                print(f"   {str(p.relative_to(self.out)):42} {p.stat().st_size:>9,} байт".replace(",", " "))
        print(f"   проверок: {len(self.checks)}, не прошло: {len(bad)}")
        for ok, what, detail in self.checks:
            print(f"   {'✓' if ok else '✗'} {what}{'' if ok else detail}")
        if extra:
            print("   ! файлы, которых нет в списке материалов страницы:", ", ".join(extra))
        if waiting:
            print("   · ждёт прохода по движку:", ", ".join(waiting))
        shutil.rmtree(self.work, ignore_errors=True)
        return not bad and not extra
