"""Материалы страницы 2.3: генератор, две выгрузки, ноутбук с кодом страницы и расчёт интерактива."""
import hashlib
import json
import shutil

# Выгрузка, на которой проверены числа страницы
RAW_SHA = "d12f512c5b1f19fa294108ad80b90ae8996af1062f17ba052500fc99a0c1e889"


def build(m):
    # Обе выгрузки делает генератор; в материалы кладём то, что он записал
    m.take("gen_data.py")
    m.run(["python", "gen_data.py"])
    (m.out / "data").mkdir()
    for name in ("orders_raw.csv", "orders_true.csv"):
        shutil.copy2(m.work / "data" / name, m.out / "data" / name)
    m.check("gen_data.py: orders_raw.csv побайтно совпадает с выгрузкой, на которой написана страница",
            hashlib.sha256((m.out / "data" / "orders_raw.csv").read_bytes()).hexdigest() == RAW_SHA)

    # Ноутбук: четыре ячейки раздела «Код», вывод дословно как на странице
    m.notebook("clean_orders.ipynb", "clean_orders.nb.py", "main")

    # Расчёт интерактива: порядки пропусков и числа, которые называет страница
    m.take("cost_of_missing.py")
    m.run(["python", "cost_of_missing.py"])
    probe = ("import json, cost_of_missing as c; t = c.calc('mcar', 'flag', 0); "
             "mn = {s: c.calc('mnar', s, 40) for s in c.STRATS}; "
             "print(json.dumps({'truth': t['corr'], 'mcar_median': c.calc('mcar', 'median', 40)['corr'], "
             "'mcar_group': c.calc('mcar', 'group', 40)['corr'], "
             "'shift': [(mn[s]['mean'] / t['mean'] - 1) * 100 for s in c.STRATS], "
             "'items': [mn['flag']['items_missing'], mn['flag']['items_known']], "
             "'mcar': [int(i) for i in c.ORD['mcar']], 'mnar': [int(i) for i in c.ORD['mnar']]}))")
    r = m.run(["python", "-c", probe], what="числа интерактива")
    d = json.loads(r.stdout)
    page = (m.pdir / "page.js").read_text("utf-8")
    compact = lambda x: json.dumps(x, separators=(",", ":"))
    m.check("порядки пропусков mcar и mnar те же, что встроены в страницу",
            compact(d["mcar"]) in page and compact(d["mnar"]) in page)
    m.check("корреляция суммы и числа товаров 0,76; после заполнения медианой при 40% случайных пропусков — 0,62",
            round(d["truth"], 2) == 0.76 and round(d["mcar_median"], 2) == 0.62, f"{d['truth']:.3f}, {d['mcar_median']:.3f}")
    m.check("медиана группы при случайных пропусках преувеличивает связь", d["mcar_group"] > d["truth"], f"{d['mcar_group']:.3f}")
    lo, hi = round(-max(d["shift"])), round(-min(d["shift"]))
    m.check("«чаще крупные», 40%: среднее ниже правды на 21–36%", (lo, hi) == (21, 36), f"{lo}–{hi}")
    m.check("«чаще крупные», 40%: 2,9 товара у заказов без суммы против 1,6 у остальных",
            [round(x, 1) for x in d["items"]] == [2.9, 1.6], str(d["items"]))
