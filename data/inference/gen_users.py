"""Учебная совокупность пользователей для страницы 6.1 «Выборка, оценка, стандартная ошибка». Зерно 601.

Запуск из корня папки материалов:  python data/inference/gen_users.py   → data/inference/users.csv (100 000 строк)

Те же пользователи интернет-магазина, что в темах 02–05, но за квартал январь–март 2026:
  user_id      1…100 000
  active_days  дней с заходами на сайт или в приложение за квартал, 0…90 (0 — пользователь ушёл)
  orders       заказов за квартал
  spend        траты за квартал, ₽ (сумма чеков; чек — как розница в data/probability/checks.csv:
               логнормальный, медиана 3 000 ₽, σ логарифма 0,6, шаг 10 ₽)
  p_answer     вероятность ответить на опрос в приложении. В жизни её никто не знает:
               здесь она задана генератором, чтобы симулировать опрос

Как устроено. У каждого пользователя есть скрытая вовлечённость e ~ N(0; 1), её нет в файле.
От неё зависят: уйдёт ли пользователь (тогда 0 дней), сколько дней он заходит, сколько заказывает
и захочет ли отвечать на опрос. Поэтому активность связана с тратами, и выборки «кто зашёл сегодня»
и «кто ответил на опрос» смещены вверх. Данные учебные, не настоящие.
"""
from pathlib import Path
import numpy as np, pandas as pd

HERE = Path(__file__).resolve().parent
N = 100_000
rng = np.random.default_rng(601)
sigmoid = lambda x: 1 / (1 + np.exp(-x))

e = rng.normal(0, 1, N)                                          # скрытая вовлечённость
churned = rng.random(N) < sigmoid(-2.9 - 1.0 * e)                # ушёл: за квартал ни одного захода
active = np.where(churned, 0, np.clip(rng.poisson(np.exp(np.log(10) + 0.6 * e)), 1, 90))
orders = rng.poisson(0.35 * active ** 0.5 * np.exp(0.25 * e))
checks = np.round(rng.lognormal(np.log(3_000), 0.6, orders.sum()), -1)
spend = np.bincount(np.repeat(np.arange(N), orders), weights=checks, minlength=N).round().astype(int)
# опрос видят только те, кто заходит (1 − 0,5^дней), отвечают охотнее вовлечённые
p_answer = (1 - 0.5 ** active) * sigmoid(-1.2 + 0.5 * e)

df = pd.DataFrame({"user_id": np.arange(1, N + 1), "active_days": active, "orders": orders,
                   "spend": spend, "p_answer": p_answer.round(4)})

if __name__ == "__main__":
    df.to_csv(HERE / "users.csv", index=False)
    s = df.spend
    print(f"пользователей {N:,}; ушли {(df.active_days == 0).mean():.1%}; дней с заходами: среднее {df.active_days.mean():.1f}, медиана {df.active_days.median():.0f}")
    print(f"траты: μ = {s.mean():.0f} ₽, σ = {s.std(ddof=0):.0f} ₽, медиана {s.median():.0f}, максимум {s.max():,}; доля покупателей {(s > 0).mean():.3f}")
    print(f"корреляция дней и трат {np.corrcoef(df.active_days, s)[0, 1]:.2f}; средняя вероятность ответа {df.p_answer.mean():.3f}")
