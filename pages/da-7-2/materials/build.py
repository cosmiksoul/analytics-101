"""Материалы страницы 7.2: ноутбук с семью блоками кода и скрипт с гистограммами интерактива.
Данные — общий набор data/eda (тема 07)."""


def build(m):
    m.use_data("eda")
    m.versions = "Код проверен на Python 3.13, NumPy 2.5, pandas 3.0, SciPy 1.18 и matplotlib 3.10."

    m.notebook("distributions_outliers.ipynb", "distributions_outliers.nb.py", "main")
    m.from_reader_folder("distributions_outliers.ipynb")

    # bin_width.py: вывод записан в хвосте скрипта; правило «что видно» — то же, что в интерактиве страницы
    m.take("bin_width.py")
    r = m.said("bin_width.py")
    m.check("bin_width.py: у всех клиентов первый интервал содержит только нули с 146 интервалов, пик около 5 000 ₽ впервые виден при 116",
            "обычная шкала: нули — впервые при 146; пик — впервые при 116; горб — ни при каком числе корзин" in r.stdout)
    m.check("bin_width.py: у клиентов с 1–2 заказами горб в логарифме виден с 8 корзин, как на странице",
            "логарифм: пик — впервые при 28; горб — впервые при 8" in r.stdout)
    r = m.run(["python", "bin_width.py", "166"], what="python bin_width.py 166")
    m.check("bin_width.py 166: корзина 631 ₽, в первой 1 717 нулей, видны нули и пик",
            "        0 –       631 ₽   1717 " in r.stdout and "видно: нули, пик" in r.stdout, r.stdout[:200])
