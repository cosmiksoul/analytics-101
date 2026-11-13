"""Два мира анимации страницы 6.3: «мир без разницы» и «мир с эффектом».

Запуск из корня папки материалов:  python da-6-3-p-value/gen_scene.py
Нужен data/inference/gen_pilot.py: из него берутся учебный пилот и параметры чеков.
Скрипт считает всё NumPy и SciPy и печатает числа, которые стоят в тексте страницы.
С ключом --write (в исходниках учебника, запуск из корня: python3 pages/da-6-3/data/gen_scene.py --write)
результат ещё вписывается в page.js между метками /*data:start*/ и /*data:end*/.

Сцена: «мир без разницы» — обе кнопки дают чеки из одного распределения
(логнормальное, медиана 3 000 ₽, σ логарифма 0,6, как в gen_pilot.py), зерно 6300.
Из него 5 000 пар выборок по 40 + 40, у каждой пары — разница средних.
«Мир с эффектом» — новая кнопка прибавляет к чеку 1 000 ₽, зерно 6301, тоже 5 000 пар.
Интерактив: чеки учебного пилота (gen_pilot.py) — старая группа и новая до эффекта."""
import json, re, sys
from pathlib import Path
import numpy as np
from scipy import stats

HERE = Path(__file__).resolve().parent
sys.dont_write_bytecode = True                     # не оставлять __pycache__ рядом с данными
sys.path.insert(0, "data/inference")
from gen_pilot import pilot, N, MEDIAN, SIGMA, EFFECT

old, base, new = pilot()
obs = new.mean() - old.mean()
K = 5_000
LO, HI, BW = -2500, 2500, 100


def world(seed, effect):
    rng = np.random.default_rng(seed)
    a = np.round(rng.lognormal(np.log(MEDIAN), SIGMA, (K, N)), -1)
    b = np.round(rng.lognormal(np.log(MEDIAN), SIGMA, (K, N)), -1) + effect
    return a, b, b.mean(axis=1) - a.mean(axis=1)


a0, b0, d0 = world(6300, 0)
a1, b1, d1 = world(6301, EFFECT)
crit_lo, crit_hi = np.percentile(d0, [2.5, 97.5])
right, left = int(np.sum(d0 >= obs)), int(np.sum(d0 <= -obs))
p_scene = (right + left) / K
power = float(np.mean((d1 >= crit_hi) | (d1 <= crit_lo)))
alt_hist = np.histogram(np.clip(d1, LO, HI - 1e-9), bins=np.arange(LO, HI + BW, BW))[0]
welch = stats.ttest_ind(new, old, equal_var=False)
ci = welch.confidence_interval(0.95)

# округлённые до рубля разницы дают те же счётчики, что и точные
dr = np.round(d0).astype(int)
assert int(np.sum(np.abs(dr) >= obs)) == right + left, "округление поменяло хвост"

data = {
    "old": (old / 10).astype(int).tolist(), "base": (base / 10).astype(int).tolist(), "effect": EFFECT,
    "pairs": [[(a0[i] / 10).astype(int).tolist(), (b0[i] / 10).astype(int).tolist()] for i in range(10)],
    "d0": dr.tolist(), "alt": alt_hist.tolist(),
    "obs": round(float(obs), 2), "right": right, "left": left, "p": round(p_scene, 4),
    "crit": [round(float(crit_lo)), round(float(crit_hi))], "power": round(power, 4),
    "sd0": round(float(d0.std())), "sd1": round(float(d1.std())), "mean1": round(float(d1.mean())),
    "ci": [round(float(ci.low)), round(float(ci.high))], "pWelch": round(float(welch.pvalue), 4),
    "meanOld": round(float(old.mean()), 2), "meanNew": round(float(new.mean()), 2),
}
print(f"наблюдаемая разница {obs:+.2f} ₽; старая {old.mean():.2f}, новая {new.mean():.2f}")
print(f"мир без разницы: {K} пар, разброс разниц {d0.std():.1f}, среднее {d0.mean():+.1f}")
print(f"дальше флажка справа {right}, слева {left}, p = {p_scene:.4f}; Уэлч p = {welch.pvalue:.4f}")
print(f"порог 5%: {crit_lo:+.1f} … {crit_hi:+.1f}; доля за порогом в мире без разницы {np.mean((d0 >= crit_hi) | (d0 <= crit_lo)):.4f}")
print(f"мир с эффектом +{EFFECT}: среднее разниц {d1.mean():+.1f}, разброс {d1.std():.1f}, мощность {power:.4f}")
print(f"интервал Уэлча: {ci.low:+.1f} … {ci.high:+.1f}")
print("первые 10 разниц:", np.round(d0[:10]).astype(int).tolist())
print("за краем гистограммы альтернативы:", int(np.sum(d1 >= HI)), int(np.sum(d1 < LO)), "; нулевой:", int(np.sum(np.abs(d0) >= HI)))

if "--write" in sys.argv:
    js = HERE.parent / "page.js"
    s = js.read_text(encoding="utf-8")
    s2 = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "/*data:end*/", s, flags=re.S)
    if s2 != s:
        js.write_text(s2, encoding="utf-8")
    print("page.js:", "обновлён" if s2 != s else "без изменений", f"({len(json.dumps(data, separators=(',', ':'))) // 1024} КБ данных)")

# Вывод:
# наблюдаемая разница +1093.75 ₽; старая 3762.75, новая 4856.50
# мир без разницы: 5000 пар, разброс разниц 533.6, среднее -4.4
# дальше флажка справа 105, слева 94, p = 0.0398; Уэлч p = 0.0331
# порог 5%: -1022.9 … +1047.8; доля за порогом в мире без разницы 0.0500
# мир с эффектом +1000: среднее разниц +1006.5, разброс 542.9, мощность 0.4652
# интервал Уэлча: +90.0 … +2097.5
# первые 10 разниц: [-414, 214, -654, 785, 502, -128, -529, -195, -582, -28]
# за краем гистограммы альтернативы: 22 0 ; нулевой: 0
