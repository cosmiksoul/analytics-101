"""Учебный пилот новой кнопки оплаты для страницы 6.3. seed 769.

Тот же учебный интернет-магазин, что в темах 02–05. 40 оплат со старой кнопкой «Оплатить»
и 40 — с новой «Оплатить частями». Чеки устроены как розничные чеки темы 05
(data/probability: логнормальное распределение, медиана 3 000 ₽, σ логарифма 0,6),
округлены до 10 ₽. Новая кнопка в учебном мире прибавляет к чеку ровно 1 000 ₽ (истинный эффект).

pilot.csv — button (старая / новая), amount ₽.
Зерно выбрано из 600–999 так, чтобы пилот был типичным: разница средних близка к истинному
эффекту, а p-value перестановочного теста, t-теста Уэлча и «мира без разницы» из сцены близки.
Запуск: python3 gen.py (из этой папки)."""
import numpy as np, pandas as pd, pathlib

SEED, N, MEDIAN, SIGMA, EFFECT = 769, 40, 3000, 0.6, 1000
P = pathlib.Path(__file__).parent


def pilot(seed=SEED, effect=EFFECT):
    rng = np.random.default_rng(seed)
    old = np.round(rng.lognormal(np.log(MEDIAN), SIGMA, N), -1)
    base = np.round(rng.lognormal(np.log(MEDIAN), SIGMA, N), -1)   # чеки новой группы до эффекта
    return old, base, base + effect


if __name__ == "__main__":
    old, base, new = pilot()
    df = pd.DataFrame({"button": ["старая"] * N + ["новая"] * N, "amount": np.r_[old, new].astype(int)})
    df.to_csv(P / "pilot.csv", index=False)
    print(df.groupby("button", sort=False)["amount"].agg(["count", "mean", "median", "std", "min", "max"]).round(1))
    print("разница средних (новая − старая): %.2f ₽" % (new.mean() - old.mean()))
