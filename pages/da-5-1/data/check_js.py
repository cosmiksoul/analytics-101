"""Сверка расчётов интерактива «Камера на круге» (page.js, блок calc) с Python.

1. Счётчики кругов: countIn и condStats из page.js на 12 положениях кругов против подсчёта точек в NumPy.
2. Антифрод: fraudStats из page.js на 12 настройках ползунков против формулы Байеса;
   заодно проверяется, что раскладка точек fraudLayout даёт ровно столько сработок, сколько задано.
Запуск: python3 check_js.py (нужен node).
"""
import json, math, subprocess
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
JS = (HERE.parent / "page.js").read_text(encoding="utf-8")
raw = (HERE / "scene_points.txt").read_text().strip()
X = np.array([int(raw[i:i + 4]) for i in range(0, 7000, 7)]) / 1000
Y = np.array([int(raw[i + 4:i + 7]) for i in range(0, 7000, 7)]) / 1000

AX, cell = 4 / 3, 4 / 3 / 1000
RB, RA = math.sqrt(299 * cell / math.pi), math.sqrt(34 * cell / math.pi)
CB, CA = (0.56, 0.5), (0.56 + 0.3779373692033068, 0.5)
STATES = [  # (A: x, y, r), (B: x, y, r)
    ((CA[0], CA[1], RA), (CB[0], CB[1], RB)),
    ((CA[0] - .06, CA[1], RA), (CB[0], CB[1], RB)),
    ((CA[0] + .04, CA[1], RA), (CB[0], CB[1], RB)),
    ((CA[0] + .20, CA[1], RA), (CB[0], CB[1], RB)),          # несовместные
    ((CA[0], CA[1], RB), (CB[0], CB[1], RB)),                # круги одного размера
    ((CA[0], CA[1] - .1, RA * 1.12 ** 2), (CB[0], CB[1], RB)),
    ((0.7, 0.45, 0.2), (0.55, 0.55, 0.25)),
    ((0.3, 0.3, 0.1), (0.9, 0.7, 0.3)),
    ((0.66, 0.5, 0.05), (0.66, 0.5, 0.4)),                   # маленький круг внутри большого
    ((1.2, 0.9, 0.3), (0.1, 0.1, 0.3)),
    ((CA[0] - .02, CA[1] + .02, RA), (CB[0] - .03, CB[1], RB / 1.12)),
    ((0.5, 0.5, 0.6), (0.8, 0.5, 0.6)),
]
SETTINGS = [(99, 99), (95, 495), (90, 990), (100, 10), (50, 0), (99, 10), (80, 300), (100, 990), (60, 5), (99, 198), (75, 75), (100, 0)]

node = r"""
global.window = { matchMedia: () => ({ matches: false }) };
const src = require('fs').readFileSync(process.argv[1], 'utf8');
const head = src.slice(src.indexOf("const RAW"), src.indexOf('const fp = '));
const f = new Function(head + '; return { countIn, condStats, fraudStats, fraudLayout, PX, PY, NP };');
const L = f();
const states = JSON.parse(process.argv[2]), settings = JSON.parse(process.argv[3]);
const out = { circles: states.map(([a, b]) => L.condStats(L.countIn(L.PX, L.PY, L.NP, { x: a[0], y: a[1], r: a[2] }, { x: b[0], y: b[1], r: b[2] }))),
  counts: states.map(([a, b]) => L.countIn(L.PX, L.PY, L.NP, { x: a[0], y: a[1], r: a[2] }, { x: b[0], y: b[1], r: b[2] })),
  fraud: settings.map(([m, k]) => { const s = L.fraudStats(m, k), lay = L.fraudLayout(m, k); let a = 0, b = 0, ab = 0;
    for (let i = 0; i < lay.n; i++) { a += lay.inA[i]; b += lay.inB[i]; ab += lay.inA[i] && lay.inB[i] ? 1 : 0; }
    return Object.assign(s, { layA: a, layB: b, layAB: ab }); }) };
console.log(JSON.stringify(out));
"""
res = json.loads(subprocess.run(["node", "-e", node, str(HERE.parent / "page.js"), json.dumps(STATES), json.dumps(SETTINGS)],
                                capture_output=True, text=True, check=True).stdout)

worst = 0.0
for (a, b), c, s in zip(STATES, res["counts"], res["circles"]):
    inA = (X - a[0]) ** 2 + (Y - a[1]) ** 2 < a[2] ** 2
    inB = (X - b[0]) ** 2 + (Y - b[1]) ** 2 < b[2] ** 2
    nA, nB, nAB = int(inA.sum()), int(inB.sum()), int((inA & inB).sum())
    assert (c["nA"], c["nB"], c["nAB"]) == (nA, nB, nAB), (c, nA, nB, nAB)
    py = {"aGivenB": nAB / nB if nB else None, "bGivenA": nAB / nA if nA else None, "pA": nA / 1000, "expAB": nA * nB / 1000}
    for k, v in py.items():
        if v is not None: worst = max(worst, abs(v - s[k]))
        else: assert s[k] is None
    print(f"A={nA:4d} B={nB:4d} A∩B={nAB:3d}  P(A|B)={s['aGivenB'] if s['aGivenB'] is None else round(s['aGivenB'], 4)}  P(B|A)={s['bGivenA'] if s['bGivenA'] is None else round(s['bGivenA'], 4)}")
for (m, k), f in zip(SETTINGS, res["fraud"]):
    b, sens, spec = 0.01, m / 100, 1 - k / 9900
    den = sens * b + (1 - spec) * (1 - b)
    ppv = sens * b / den if den else None
    assert (f["layA"], f["layB"], f["layAB"]) == (100, m + k, m), f
    if ppv is not None: worst = max(worst, abs(ppv - f["ppv"]), abs(sens - f["sens"]), abs(spec - f["spec"]))
    print(f"ловит {m:3d}/100, ложно {k:3d}/9900: P(фрод|сработка) JS {f['ppv'] if f['ppv'] is None else round(f['ppv'], 4)}, Python {ppv if ppv is None else round(ppv, 4)}")
print(f"положений кругов {len(STATES)}, настроек антифрода {len(SETTINGS)}, наибольшее расхождение {worst:.1e}")
