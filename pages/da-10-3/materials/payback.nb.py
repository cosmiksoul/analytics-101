# %% [markdown]
# # 10.3. Когортная окупаемость
#
# Аналитика 101 · блок «Дата аналитика» · тема 10 «Юнит-экономика» · страница 10.3.
#
# По данным учебного магазина проверим, как изменения удержания, среднего чека и расходов на рекламу сказываются на окупаемости. Затем сравним стоимость привлечения с годовым доходом на клиента для трёх каналов. В соседнем файле `payback.sql` окупаемость каналов и когорт рассчитана в PostgreSQL.
#
# Выполняйте ячейки сверху вниз. Для построения графика понадобятся результаты предыдущих расчётов.
#
# Вывод получен на Python 3.13, pandas 3.0, NumPy 2.5 и matplotlib 3.10.

# %% [markdown]
# ## Где лежат данные
#
# Распакуйте архив главы так, чтобы папка `data/` находилась рядом с папкой урока. В `data/unit/` должны лежать `clients.csv`, `orders.csv` и `marketing_spend.csv`. Первая ячейка найдёт папку с материалами и сделает её рабочей. В ней появится график `payback_limits.svg`.

# %% code
import os
import pathlib
import platform

import matplotlib
import numpy as np
import pandas as pd

root = pathlib.Path.cwd()
while not (root / "data" / "unit").is_dir() and root != root.parent:
    root = root.parent                      # поднимаемся, пока рядом не окажется data/unit/
assert (root / "data" / "unit" / "orders.csv").exists(), \
    "Не найдена папка data/unit/. Скачайте общий набор темы 10 и положите data/ рядом с папкой страницы"
os.chdir(root)

print("Python", platform.python_version(), "| pandas", pd.__version__, "| NumPy", np.__version__,
      "| matplotlib", matplotlib.__version__)

# %% [markdown]
# ## Сценарии расходов и окупаемости
#
# Сначала оценим стоимость привлечения дополнительного клиента по эластичности, затем изменим удержание и средний чек. После этого пересчитаем результат эксперимента в рубли и построим денежный поток при росте расходов на привлечение.

# %% page:pandas

# %% [markdown]
# ## Сравнение каналов привлечения

# %% page:plot

# %% [markdown]
# Предыдущая ячейка сохранила график в `payback_limits.svg`. Выполните следующую ячейку, чтобы увидеть его здесь.

# %% code
from IPython.display import SVG, display

display(SVG("payback_limits.svg"))
