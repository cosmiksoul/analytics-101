"""Материалы страницы 11.4: ноутбук с четырьмя блоками кода и скрипт ста показанных тестов.
Данные — общий набор data/ab (тема 11): учебные эксперименты и общий набор A/A-тестов aa_sim.py."""
import json


def build(m):
    m.use_data("ab")
    m.versions = "Код проверен на Python 3.13, pandas 3.0, NumPy 2.5, SciPy 1.18, statsmodels 0.15, matplotlib 3.10 и pyarrow 26."
    code = m.pdir / "data" / "code"

    nb = m.notebook("pitfalls.ipynb", "pitfalls.nb.py", "main")
    # на странице каждый блок выполняется отдельным процессом; рисунок ноутбука должен выйти тем же
    ref = m.alone([code / "novelty.py"])
    m.pictures("рисунок новизны в ноутбуке тот же, что даёт блок страницы отдельным скриптом", ref, ["novelty.svg"])
    m.from_reader_folder("pitfalls.ipynb")
    m.check("ноутбук не оставил рисунок в материалах страницы", not (m.out / "novelty.svg").exists())
    show = nb.cells[-1]
    kinds = [sorted(o.get("data", {})) for o in show.get("outputs", []) if o.get("output_type") == "display_data"]
    m.check("последняя ячейка показывает сохранённый рисунок", len(kinds) == 1 and "image/svg+xml" in kinds[0], str(kinds))
    svg = (m.work / "novelty.svg").read_text("utf-8")
    m.check("на рисунке подписи без пробела перед процентом: +21,8%, +8,9%, +11,0%", all(x in svg for x in ("+21,8%", "+8,9%", "+11,0%")) and " %" not in svg)
    out = m.page_out("peek")
    m.check("в выводе симуляции подглядывания: 5,1% при одном взгляде и 28,0% при ежедневных — как в общем наборе data/ab/aa_sim.py",
            "5.1" in out and "28.0" in out, out[:300])
    out = m.page_out("novelty")
    m.check("в выводе новизны: +21,8% в сутки 0–2 и −0,3% в сутки 14–27, за 28 дней +10,4%", "21.8" in out and "-0.3" in out and "+10.4%" in out, out[:300])

    # sim.py: сто показанных тестов и доли ложных побед; пишет sim.json рядом с собой
    m.put("sim.py", (m.pdir / "data" / "sim.py").read_text("utf-8"))
    r = m.run(["python", "sim.py"], what="python sim.py")
    made = m.work / "sim.json"
    m.check("sim.py из материалов даёт тот же sim.json, что вшит в страницу",
            made.exists() and made.read_bytes() == (m.pdir / "data" / "sim.json").read_bytes())
    m.check("sim.py не оставил sim.json в материалах страницы", not (m.out / "sim.json").exists())
    s = json.loads((m.pdir / "data" / "sim.json").read_text("utf-8"))
    m.check("в sim.json: блок 173, тест сцены 17359, в ста показанных 4, 10 и 30 ложных побед при одном, четырёх и 28 взглядах",
            (s["block"], s["scene"]["run"], s["shown"]["1"][0], s["shown"]["4"][0], s["shown"]["28"][0]) == (173, 17359, 4, 10, 30), str(s["shown"]))
    m.extra = (f"Ноутбук можно открыть из этой папки. Скрипт запускается из корня материалов: `python {m.stem}/sim.py` — он берёт прогоны из "
               "`data/ab/aa_sim.py` и пишет `sim.json` рядом с собой: это данные интерактива страницы.")
