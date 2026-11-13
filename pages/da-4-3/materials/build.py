"""Материалы страницы 4.3: три скрипта из шести блоков кода страницы.
Данные — общий набор data/clients (тема 04)."""

HEAD = '''"""{title}

Страница 4.3 «Производная и градиент» курса «Аналитика 101». {about}
Запуск из корня папки материалов: python da-4-3-derivative-gradient/{name}{need}
"""
'''


def glue(m, name, title, about, keys, need=""):
    """Несколько блоков кода страницы подряд в одном файле; вывод — блоки вывода страницы подряд."""
    text = HEAD.format(title=title, about=about, name=name, need=need)
    for k in keys:
        text += f"\n# ===== {m.code[k]['title']} =====\n" + m.page_code(k)
    m.put(name, text)
    m.run(["python", name], expect="\n".join(m.page_out(k).strip("\n") for k in keys), what=f"python {name}")


def build(m):
    m.use_data("clients")

    glue(m, "surface.py", "Поверхность ошибки из сцены и интерактива: градиент, численная производная, спуск.",
         "Три блока кода страницы подряд: проверка градиента численной производной, спуск по параболе, "
         "спуск по поверхности с двумя долинами. Файлы данных не нужны.",
         ["deriv", "parab", "surface"])

    glue(m, "regression_gd.py", "Регрессия spend ~ income + orders градиентным спуском.",
         "Два блока кода страницы подряд: спуск по стандартизованным признакам приходит к весам lstsq, "
         "а без стандартизации разлетается или ползёт.",
         ["regression", "scale"], need="\nНужен общий набор data/clients/.")

    m.script("integral.py", "integral")

    # Числа сцены и интерактива, которых нет в выводе блоков: считаем функцией descend из блока страницы
    ns = {}
    exec(m.page_code("surface").split("runs = [")[0], ns)        # L, grad и descend из блока страницы
    descend, L = ns["descend"], ns["L"]
    facts = [((-1.8, 1.0), 0.15, 300, "сошёлся", 14), ((-1.8, 1.0), 0.01, 300, "сошёлся", 276),
             ((-1.8, 1.0), 0.002, 5000, "сошёлся", 1393), ((-1.8, 1.0), 0.3, 300, "разошёлся", 7)]
    got = [(descend(s, eta, n)[2], descend(s, eta, n)[1]) for s, eta, n, _v, _k in facts]
    m.check("числа страницы вне вывода блоков: 14 итераций при шаге 0,15, 276 при 0,01, 1 393 при 0,002, расхождение за 7 при 0,3",
            got == [(v, k) for _s, _e, _n, v, k in facts], str(got))
    left, right = descend((0, 1), 0.05)[0], descend((0.3, 1), 0.05)[0]
    m.check("старты (0; 1) и (0,3; 1) приходят в разные долины: 0,045 и 0,344",
            (round(L(left), 3), round(L(right), 3)) == (0.045, 0.344), f"{L(left):.3f} {L(right):.3f}")
