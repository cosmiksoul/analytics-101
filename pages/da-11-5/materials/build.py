"""Материалы страницы 11.5: три скрипта с кодом страницы и симуляция последовательных тестов.
Данные — общий набор data/ab (тема 11): учебные эксперименты и общий набор A/A-тестов aa_sim.py."""


def build(m):
    m.use_data("ab")
    m.versions = "Код проверен на Python 3.13, pandas 3.0, NumPy 2.5, SciPy 1.18, statsmodels 0.15 и pyarrow 26."

    r = m.script("cuped.py", "cuped")
    m.check("cuped.py: θ = 0,665, корреляция 0,463, дисперсия −21,4%; с CUPED +86,0 ₽ [−15,8; 187,9]; регрессия даёт те же +86,0 ₽",
            all(x in r.stdout for x in ("θ = 0.665, корреляция ρ = 0.463, дисперсия -21.4%", "с CUPED:   +86.0 ₽ [-15.8; 187.9], z = 1.66", "регрессия: +86.0 ₽, SE 52.0")), r.stdout[-300:])
    r = m.script("sequential.py", "seq")
    m.check("sequential.py: к седьмому дню пришли 55% участников, эффект +1,51 п. п. и z = 4,89 выше границы 2,64; на 28-й день +1,17 п. п.",
            "    7  31360           1.51 4.89 0.55         2.64" in r.stdout and "   28  56797           1.17 3.95 1.00" in r.stdout, r.stdout[-300:])
    r = m.script("bayes.py", "bayes")
    m.check("bayes.py: в checkout_v2 P(B > A) = 0,99995, в A/A-тесте aa_check — 0,098; байесовский интервал [0,59; 1,75] п. п.",
            all(x in r.stdout for x in ("P(B > A) = 0.99995", "P(B > A) = 0.09755", "[0.59; 1.75] п. п.")), r.stdout[-400:])

    # симуляция последовательных тестов — тот же файл, что считает числа страницы; вывод записан в его конце
    m.put("sequential_sim.py", (m.pdir / "data" / "sequential_sim.py").read_text("utf-8"))
    r = m.said("sequential_sim.py")
    text = (m.out / "sequential_sim.py").read_text("utf-8")
    m.check("sequential_sim.py: без поправки 28,0% ложных побед и 30 из ста показанных — как на 11.4; Pocock — 4, O'Brien — Fleming — 4, always-valid — 2",
            all(x in text for x in ("без поправки, взглядов 28:  28.0 |  87.3 |  12.0 |  30  91", "Pocock, взглядов 28:   5.3 |  63.1 |  19.5 |   4  70",
                                    "O'Brien — Fleming, взглядов 28:   5.3 |  77.2 |  21.2 |   4  80", "always-valid, взглядов 28:   1.3 |  48.9 |  22.8 |   2  52")))
    # числа текста страницы — те же, что печатает скрипт
    art = (m.pdir / "article.html").read_text("utf-8").replace("&nbsp;", " ")
    m.check("в тексте страницы те же числа: 30, 4, 4 и 2 из ста; мощность 79,3, 78,4, 70,7 и 43,5%; 23,0 и 20,3 дня; байесовское правило 24,3%",
            all(x in art for x in ("без поправки 30 ложных побед, у Pocock — 4, у O’Brien — Fleming — 4, у always-valid — 2", "находит в 79,3% случаев",
                                   "в 78,4%, Pocock — в 70,7%, always-valid — в 43,5%", "за 23,0 и 20,3 дня", "в 24,3%")))
    m.extra = (f"Запуск из корня материалов: `python {m.stem}/cuped.py`, `python {m.stem}/sequential.py`, `python {m.stem}/bayes.py`. "
               f"`python {m.stem}/sequential_sim.py` идёт около 20 секунд: берёт A/A-тесты из `data/ab/aa_sim.py` и печатает границы, "
               "доли ложных побед и мощность; ожидаемый вывод записан в конце файла.")
