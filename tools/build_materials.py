#!/usr/bin/env python3
"""Сборка материалов страниц: python3 tools/build_materials.py <id> [<id> …] | --index

Для каждой страницы выполняет pages/<id>/materials/build.py (функция build(m)),
кладёт результат в dist/materials/<файл-страницы>/ и печатает отчёт о проверках.
--index пересобирает dist/materials/index.json и архивы страниц по тому, что уже собрано.
"""
import importlib.util
import json
import sys
import zipfile
from pathlib import Path

sys.dont_write_bytecode = True          # сценарии страниц импортируются: не оставлять __pycache__ в исходниках
sys.path.insert(0, str(Path(__file__).resolve().parent))
import matlib  # noqa: E402

ROOT = matlib.ROOT
DIST = matlib.DIST


def build(page_id):
    script = ROOT / "pages" / page_id / "materials" / "build.py"
    if not script.exists():
        print(f"{page_id}: нет {script.relative_to(ROOT)}")
        return False
    spec = importlib.util.spec_from_file_location(f"mat_{page_id.replace('-', '_')}", script)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    m = matlib.Mat(page_id)
    mod.build(m)
    return m.finish()


def index():
    """index.json для вёрстки: страница → файлы с описанием и размером; рядом архив страницы."""
    pages = {}
    for pdir in sorted((ROOT / "pages").iterdir()):
        meta = pdir / "meta.json"
        if not meta.exists():
            continue
        stem = json.loads(meta.read_text("utf-8"))["file"]
        out = DIST / stem
        if not out.is_dir():
            continue
        listed = dict(matlib._page(pdir.name, "materials"))
        files = []
        for p in sorted(out.rglob("*")):
            if not p.is_file():
                continue
            rel = p.relative_to(out).as_posix()
            desc = listed.get(rel) or next((d for n, d in listed.items() if n.endswith("/") and rel.startswith(n)), "")
            files.append({"path": f"materials/{stem}/{rel}", "name": rel, "bytes": p.stat().st_size, "about": desc})
        z = DIST / f"{stem}.zip"
        with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
            for p in sorted(out.rglob("*")):
                if p.is_file():
                    zf.write(p, f"{stem}/{p.relative_to(out).as_posix()}")
        uses = sorted({n.split("/")[1] for n in listed
                       if n.startswith("data/") and len(n.split("/")) > 1 and (DIST / "data" / n.split("/")[1]).is_dir()
                       and not (out / "data").exists()})
        pages[pdir.name] = {"file": stem, "zip": f"materials/{stem}.zip", "zipBytes": z.stat().st_size,
                            "files": files, "shared": uses}
    # общие наборы данных: по одному разу, страницы ссылаются на них строкой «data/<набор>/»
    shared = {}
    for d in sorted((DIST / "data").iterdir()) if (DIST / "data").is_dir() else []:
        z = DIST / f"data-{d.name}.zip"
        shared[d.name] = {"zip": f"materials/data-{d.name}.zip", "zipBytes": z.stat().st_size if z.exists() else 0,
                          "files": [{"path": f"materials/data/{d.name}/{p.relative_to(d).as_posix()}", "bytes": p.stat().st_size}
                                    for p in sorted(d.rglob("*")) if p.is_file()]}
    out = {"pages": pages, "data": shared}
    (DIST / "index.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"index.json: страниц {len(pages)}, файлов {sum(len(p['files']) for p in pages.values())}, общих наборов {len(shared)}")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        raise SystemExit(__doc__)
    ok = True
    for a in args:
        if a == "--index":
            index()
        else:
            ok = build(a) and ok
    sys.exit(0 if ok else 1)
