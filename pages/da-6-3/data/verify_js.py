"""Сверка генератора и перестановочного теста интерактива «Перемешай метки» с NumPy и SciPy.

Запуск из любой папки:  python3 pages/da-6-3/data/verify_js.py   (нужен node)
Код генератора берётся из page.js между метками /*gen:start*/ и /*gen:end*/ и запускается в node."""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
from scipy import stats

HERE = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(HERE.parents[2] / "data" / "inference"))
from gen_pilot import pilot

gen_js = re.search(r"/\*gen:start\*/(.*?)/\*gen:end\*/", (HERE.parent / "page.js").read_text(encoding="utf-8"), re.S).group(1)
old1, base1, _ = pilot()
harness = gen_js + """
const P1 = { old: Int32Array.from(%s), base: Int32Array.from(%s) };
const get = k => (k === 1 ? P1 : pilotBase(k));
const pilots = []; for (let k = 1; k <= 400; k++) { const p = get(k); pilots.push([Array.from(p.old), Array.from(p.base)]); }
const out = { p1: permP(P1.old, P1.base.map(v => v + 1000), 10000, mulberry32(seedOf('perm|1|1000'))), pilots, pow: {}, pk: {} };
for (const e of [0, 500, 1000, 2000]) { const ps = []; for (let k = 1; k <= 400; k++) ps.push(pilotP(get(k), e, k, 200)); out.pk[e] = ps; out.pow[e] = ps.filter(p => p < 0.05).length / 400; }
console.log(JSON.stringify(out));
""" % (json.dumps(old1.astype(int).tolist()), json.dumps(base1.astype(int).tolist()))
res = json.loads(subprocess.run(["node", "-e", harness], capture_output=True, text=True, check=True).stdout)

pil = np.array(res["pilots"], dtype=float)            # 400 × 2 × 40
vals = pil[1:].reshape(-1)                             # без пилота №1 из NumPy
mu = 3000 * np.exp(0.18); sd = mu * np.sqrt(np.exp(0.36) - 1)
print(f"генератор пилотов JS: {vals.size} чеков, среднее {vals.mean():.0f} (теория {mu:.0f}), медиана {np.median(vals):.0f} (3000), "
      f"σ {vals.std():.0f} ({sd:.0f}), σ логарифма {np.log(vals).std():.3f} (0,600)")

old = old1; new = base1 + 1000
rng = np.random.default_rng(63); pooled = np.r_[old, new]; obs = new.mean() - old.mean()
d = np.array([(lambda s: s[40:].mean() - s[:40].mean())(rng.permutation(pooled)) for _ in range(10_000)])
print(f"пилот №1, эффект +1 000: p JS (10 000 перемешиваний) {res['p1']:.4f} · NumPy {np.mean(np.abs(d) >= abs(obs)):.4f} · Уэлч {stats.ttest_ind(new, old, equal_var=False).pvalue:.4f}")

rng = np.random.default_rng(1)
print("эффект   мощность JS   Уэлч на тех же 400   NumPy-перестановки на тех же 400   Уэлч на 5 000 пилотов NumPy   решения JS и NumPy совпали")
for e in ["0", "500", "1000", "2000"]:
    eff = float(e)
    pw = []; pn = []
    for k in range(400):
        a, b = pil[k, 0], pil[k, 1] + eff
        pw.append(stats.ttest_ind(b, a, equal_var=False).pvalue)
        pool = np.r_[a, b]; S = pool.sum(); o = abs(S - 2 * a.sum())
        idx = rng.permuted(np.tile(np.arange(80), (2000, 1)), axis=1)[:, :40]
        pn.append(np.mean(np.abs(S - 2 * pool[idx].sum(axis=1)) >= o))
    pw, pn, pj = np.array(pw), np.array(pn), np.array(res["pk"][e])
    r2 = np.random.default_rng(int(e) + 5)
    a5 = r2.lognormal(np.log(3000), 0.6, (5000, 40)); b5 = r2.lognormal(np.log(3000), 0.6, (5000, 40)) + eff
    big = np.mean(stats.ttest_ind(b5, a5, axis=1, equal_var=False).pvalue < 0.05)
    print(f"{e:>6}   {res['pow'][e]:.3f}         {np.mean(pw < .05):.3f}                {np.mean(pn < .05):.3f}                          {big:.3f}                      {np.mean((pj < .05) == (pn < .05)):.1%}")
