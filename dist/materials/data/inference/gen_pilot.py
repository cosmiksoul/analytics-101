"""Учебный пилот новой кнопки оплаты для страницы 6.3 «Проверка гипотез и p-value». Зерно 769.

Тот же учебный интернет-магазин, что в темах 02–05. 40 оплат со старой кнопкой «Оплатить»
и 40 — с новой «Оплатить частями». Чеки устроены как розничные чеки темы 05
(data/probability: логнормальное распределение, медиана 3 000 ₽, σ логарифма 0,6),
округлены до 10 ₽. Новая кнопка в учебном мире прибавляет к чеку ровно 1 000 ₽ (истинный эффект).

pilot.csv — button (старая / новая), amount ₽.

Запуск из корня папки материалов:
  python data/inference/gen_pilot.py            → data/inference/pilot.csv
  python data/inference/gen_pilot.py --search   → перебор зёрен 600–999: как выбрано зерно 769

Как выбрано зерно. Пилот по 40 чеков ловит эффект в 1 000 ₽ примерно в половине случаев, поэтому
«первое попавшееся» зерно могло дать и незначимый результат, и разницу вдвое больше истинной.
Для страницы взят пилот, у которого разница средних отличается от истинного эффекта меньше чем
на 100 ₽, а p-value t-теста Уэлча лежит между 0,02 и 0,05. Таких зёрен 20 из 400, 769 — одно из них.
"""
import pathlib
import sys

import numpy as np
import pandas as pd

SEED, N, MEDIAN, SIGMA, EFFECT = 769, 40, 3000, 0.6, 1000
P = pathlib.Path(__file__).resolve().parent


def pilot(seed=SEED, effect=EFFECT):
    rng = np.random.default_rng(seed)
    old = np.round(rng.lognormal(np.log(MEDIAN), SIGMA, N), -1)
    base = np.round(rng.lognormal(np.log(MEDIAN), SIGMA, N), -1)   # чеки новой группы до эффекта
    return old, base, base + effect


def search(seeds=range(600, 1000)):
    """Перебор зёрен: разница средних и p-value t-теста Уэлча у каждого пилота."""
    from scipy import stats
    rows = []
    for seed in seeds:
        old, _, new = pilot(seed)
        rows.append((seed, new.mean() - old.mean(), stats.ttest_ind(new, old, equal_var=False).pvalue))
    t = pd.DataFrame(rows, columns=["seed", "diff", "p"])
    sig = t.p < 0.05
    typical = t[(abs(t["diff"] - EFFECT) < 100) & (t.p > 0.02) & sig]
    print(f"зёрен {len(t)}: значимый результат (p < 0,05) у {sig.sum()} — {sig.mean():.1%}")
    print(f"разница средних: от {t['diff'].min():+.0f} до {t['diff'].max():+.0f} ₽, медиана {t['diff'].median():+.0f} ₽")
    print(f"типичных значимых (разница 900–1 100 ₽, p от 0,02 до 0,05): {len(typical)}")
    for seed, diff, p in typical.itertuples(index=False):
        print(f"  зерно {seed}: разница {diff:+8.2f} ₽, p = {p:.4f}{'  ← пилот страницы' if seed == SEED else ''}")


if __name__ == "__main__":
    if "--search" in sys.argv:
        search()
    else:
        old, base, new = pilot()
        df = pd.DataFrame({"button": ["старая"] * N + ["новая"] * N, "amount": np.r_[old, new].astype(int)})
        df.to_csv(P / "pilot.csv", index=False)
        print(df.groupby("button", sort=False)["amount"].agg(["count", "mean", "median", "std", "min", "max"]).round(1))
        print("разница средних (новая − старая): %.2f ₽" % (new.mean() - old.mean()))
