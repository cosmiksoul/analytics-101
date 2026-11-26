"""Данные для анимации и интерактива урока 6.1 о смещении и разбросе оценок.

Запуск из корня папки материалов:  python da-6-1-sampling-bias/gen_page.py
Читает учебную совокупность data/inference/users.csv (её делает data/inference/gen_users.py),
строит выборки с помощью NumPy при фиксированных начальных значениях генератора и выводит результаты для сверки с уроком.
В конце — таблица двадцати зёрен 6100–6119: по ней выбрано зерно сцены.
С ключом --write (в исходниках учебника, запуск из корня: python3 pages/da-6-1/data/gen_page.py --write)
результат ещё вписывается в page.js между метками /*data:start*/ и /*data:end*/.

Сцена (seed 6111). 1 000 точек, в каждой 100 пользователей, отсортированных по числу дней с заходами.
  · сто случайных выборок по 100 пользователей и сто по 400 (без возвращения);
  · сто выборок «кто зашёл сегодня»: пользователь заходит в день с вероятностью active_days / 90,
    из зашедших берутся 100 (и 400) случайных — это и есть «только активные».
  У первых десяти случайных выборок по 100 и у первой «из зашедших» сохраняется, в какие точки
  попали пользователи и сколько они потратили; у остальных — только средние.
Мишень. Для каждого способа отбора — распределение трат среди отобранных с весами отбора:
  случайно — вес 1, «кто ответил» — p_answer, «первые сто» — active_days / 90.
  В page.js оно лежит квантилями (доля нулей отдельно), генератор JavaScript выбирает из этого распределения с возвращением.
  Теория (среднее, σ, доля покупателей) — точные взвешенные значения по всем 100 000.
Перебор зёрен. Для каждого зерна — те же сто случайных выборок по 100, что и в сцене: сколько из первых
  десяти оценок выше μ, среднее и разброс всех ста. Зерно 6111 взято как типичное: пять оценок выше μ
  и пять ниже. Так же делятся оценки ещё у двух зёрен из двадцати, 6110 и 6119.
"""
import json, re, sys
from pathlib import Path
import numpy as np, pandas as pd

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent
df = pd.read_csv("data/inference/users.csv")
spend = df.spend.to_numpy(np.int64); act = df.active_days.to_numpy(np.int64); pans = df.p_answer.to_numpy(float)
N = len(df); mu = spend.mean(); sigma = spend.std(); p = (spend > 0).mean()

# ---------- сцена ----------
rng = np.random.default_rng(6111)
order = np.lexsort((rng.permutation(N), act))          # по дням с заходами, равные — в случайном порядке
dot = np.empty(N, np.int64); dot[order] = np.arange(N) // 100
dot_act = [int(round(v)) for v in act[order].reshape(1000, 100).mean(axis=1)]

def random_sample(n):
    return rng.choice(N, n, replace=False)
def today_sample(n):
    visited = np.flatnonzero(rng.random(N) < act / 90)     # кто зашёл сегодня
    return rng.choice(visited, n, replace=False)

def series(fn, n, k=100):
    S = [fn(n) for _ in range(k)]
    return S, [int(round(spend[s].mean())) for s in S]

R100, mR100 = series(random_sample, 100)
T100, mT100 = series(today_sample, 100)
R400, mR400 = series(random_sample, 400)
T400, mT400 = series(today_sample, 400)
scene = {
    "dotAct": dot_act,
    "rDots": [dot[s].tolist() for s in R100[:10]], "rSpend": [spend[s].tolist() for s in R100[:10]],
    "tDots": [dot[s].tolist() for s in T100[:1]], "tSpend": [spend[s].tolist() for s in T100[:1]],
    "r100": mR100, "t100": mT100, "r400": mR400, "t400": mT400,
    "churnDots": int(sum(1 for v in act[order].reshape(1000, 100).max(axis=1) if v == 0)),
}

# ---------- мишень ----------
LEVELS = np.r_[np.linspace(0, .9, 46), np.linspace(.9, .99, 19)[1:], np.linspace(.99, .999, 10)[1:], np.linspace(.999, 1, 6)[1:]]
WEIGHTS = {"random": np.ones(N), "survey": pans, "first": act / 90}
methods, theory = {}, {}
for k, w in WEIGHTS.items():
    w = w / w.sum()
    m = float((w * spend).sum()); sd = float(np.sqrt((w * (spend - m) ** 2).sum())); share = float(w[spend > 0].sum())
    pos = spend > 0; v = spend[pos].astype(float); ww = w[pos]; o = np.argsort(v, kind="stable")
    v, ww = v[o], ww[o] / ww[o].sum()
    q = np.round(np.interp(LEVELS, np.cumsum(ww) - ww / 2, v) / 10) * 10
    methods[k] = {"z": round(1 - share, 5), "q": q.astype(int).tolist()}
    theory[k] = {"mean": round(m, 1), "sd": round(sd, 1), "p": round(share, 5)}

data = {"N": N, "mu": round(float(mu), 1), "sigma": round(float(sigma), 1), "p": round(float(p), 5),
        "scene": scene, "levels": [round(float(x), 5) for x in LEVELS], "methods": methods, "theory": theory}



def seed_table(seeds=range(6100, 6120)):
    """Сто случайных выборок по 100 при каждом зерне — в том же порядке вызовов, что и в сцене."""
    print("зерно  выше μ из первых 10  среднее ста оценок  разброс")
    for seed in seeds:
        g = np.random.default_rng(seed)
        g.permutation(N)                                   # раскладка точек сцены: первый вызов генератора
        a = np.array([int(round(spend[g.choice(N, 100, replace=False)].mean())) for _ in range(100)])
        print(f"{seed}   {int((a[:10] > mu).sum()):>10}           {a.mean():>10.0f}       {a.std():>6.0f}{'   ← сцена' if seed == 6111 else ''}")


if __name__ == "__main__":
    print(f"μ = {mu:.1f}, σ = {sigma:.1f}, p = {p:.4f}; точек только с ушедшими: {scene['churnDots']}")
    for name, a in (("случайные по 100", mR100), ("зашедшие сегодня по 100", mT100), ("случайные по 400", mR400), ("зашедшие сегодня по 400", mT400)):
        a = np.array(a)
        print(f"{name:<24} первые {a[:10].tolist()}  среднее {a.mean():.0f}  разброс {a.std():.0f}  мин {a.min()} макс {a.max()}")
    print("по 100: σ/√n =", round(sigma / 10), "; σ зашедших/√n =", round(theory['first']['sd'] / 10))
    for k, t in theory.items():
        print(f"{k:<7} среднее {t['mean']:.0f} ({t['mean'] / mu - 1:+.1%}), σ {t['sd']:.0f}, доля покупателей {t['p']:.4f} ({t['p'] / p - 1:+.1%})")
    s0 = spend[R100[0]]; t0 = spend[T100[0]]
    print("первая случайная выборка: мин", s0.min(), "макс", s0.max(), "нулей", (s0 == 0).sum(), "> 20 000:", (s0 > 20000).sum(), "дни", act[R100[0]].mean())
    print("первая «зашедшие»: мин", t0.min(), "макс", t0.max(), "нулей", (t0 == 0).sum(), "> 20 000:", (t0 > 20000).sum(), "дни", act[T100[0]].mean())
    print("dotAct: первые", dot_act[:3], "медиана", dot_act[500], "последние", dot_act[-5:])
    print("точки первой «зашедшие»: доля в верхней половине", np.mean(np.array(scene['tDots'][0]) >= 500), "; случайной", np.mean(np.array(scene['rDots'][0]) >= 500))
    a = np.array(mR100); se = sigma / 10
    print("первые 10 случайных: выше μ", int((a[:10] > mu).sum()), "ближайшая", int(np.abs(a[:10] - mu).min()), "среднее 10", round(a[:10].mean()))
    print("доля 100 случайных оценок в μ ± σ/√n:", np.mean(np.abs(a - mu) < se), "; ушедших", int((act == 0).sum()))
    print("верхний ряд точек: дней", dot_act[950], "…", dot_act[999], "; нижний ряд после ушедших", dot_act[75:80])
    seed_table()
    if "--write" in sys.argv:
        js = PAGE / "page.js"
        src = js.read_text(encoding="utf-8")
        src = re.sub(r"/\*data:start\*/.*?/\*data:end\*/", lambda _: "/*data:start*/" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "/*data:end*/", src, flags=re.S)
        js.write_text(src, encoding="utf-8")
        print("page.js обновлён")

# Вывод:
# μ = 4378.3, σ = 5632.2, p = 0.6156; точек только с ушедшими: 75
# случайные по 100         первые [4797, 5444, 5486, 3582, 3454, 4583, 3025, 4049, 4165, 4649]  среднее 4360  разброс 574  мин 2949 макс 5633
# зашедшие сегодня по 100  первые [6826, 6492, 6462, 6232, 6878, 6034, 6613, 7223, 5622, 6194]  среднее 6704  разброс 667  мин 5507 макс 8672
# случайные по 400         первые [4759, 4259, 4264, 4158, 4448, 5101, 4667, 4207, 4412, 4486]  среднее 4405  разброс 259  мин 3749 макс 5101
# зашедшие сегодня по 400  первые [6812, 6395, 7027, 6563, 6625, 6927, 7065, 6973, 6134, 6149]  среднее 6729  разброс 331  мин 6025 макс 7480
# по 100: σ/√n = 563 ; σ зашедших/√n = 704
# random  среднее 4378 (+0.0%), σ 5632, доля покупателей 0.6156 (+0.0%)
# survey  среднее 5749 (+31.3%), σ 6384, доля покупателей 0.7304 (+18.6%)
# first   среднее 6705 (+53.1%), σ 7044, доля покупателей 0.7755 (+26.0%)
# первая случайная выборка: мин 0 макс 33750 нулей 38 > 20 000: 3 дни 11.36
# первая «зашедшие»: мин 0 макс 44710 нулей 29 > 20 000: 8 дни 20.64
# dotAct: первые [0, 0, 0] медиана 10 последние [50, 52, 56, 61, 77]
# точки первой «зашедшие»: доля в верхней половине 0.78 ; случайной 0.5
# первые 10 случайных: выше μ 5 ближайшая 204 среднее 10 4323
# доля 100 случайных оценок в μ ± σ/√n: 0.68 ; ушедших 7500
# верхний ряд точек: дней 28 … 77 ; нижний ряд после ушедших [1, 1, 1, 1, 1]
# зерно  выше μ из первых 10  среднее ста оценок  разброс
# 6100            3                 4280          534
# 6101            7                 4422          559
# 6102            6                 4474          596
# 6103            6                 4317          476
# 6104            2                 4295          473
# 6105            3                 4344          572
# 6106            6                 4421          538
# 6107            3                 4286          583
# 6108            4                 4300          532
# 6109            6                 4385          473
# 6110            5                 4445          593
# 6111            5                 4360          574   ← сцена
# 6112            6                 4412          507
# 6113            4                 4441          524
# 6114            0                 4359          571
# 6115            4                 4343          518
# 6116            4                 4446          505
# 6117            3                 4305          426
# 6118            9                 4279          505
# 6119            5                 4246          525
