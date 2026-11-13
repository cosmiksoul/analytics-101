# SELECT и порядок выполнения запроса

Аналитика 101 · блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.1.

Запрос на SQL пишут, начиная с SELECT, а база выполняет его, начиная с FROM. После страницы вы сможете отбирать, сортировать и ограничивать строки учебной базы магазина, предсказывать, сколько строк останется после каждого шага, и объяснять, почему псевдоним из SELECT нельзя использовать в WHERE, но можно в ORDER BY.

## Анимация по шагам

1. **Запрос, как его пишут.** Запрос к учебной таблице orders интернет-магазина: два бренда с наибольшей выручкой среди тех, у кого не меньше 35 оплаченных заказов. Читаем его сверху вниз, и первым стоит SELECT.

2. **Порядок выполнения.** База выполняет предложения в другом порядке: источник, фильтр строк, группы, фильтр групп. SELECT идёт только пятым, за ним сортировка и LIMIT. Каждый шаг получает таблицу от предыдущего.

3. **FROM: вся таблица.** FROM orders берёт таблицу целиком: 231 строка, 10 столбцов. Каждая клетка на сцене — один заказ.

4. **WHERE: фильтр строк.** WHERE проверяет условие у каждой строки отдельно. 36 отменённых заказов не проходят, дальше идут 195. Групп ещё нет, поэтому спросить здесь про COUNT(*) нельзя.

5. **GROUP BY: стопки по бренду.** GROUP BY brand раскладывает 195 строк по четырём группам, по одной на бренд. Дальше запрос работает с группами, а не со строками.

6. **Агрегаты по группам.** Для каждой группы считаются агрегаты: COUNT(*) — число строк, SUM(amount) — сумма. Десятки строк группы сворачиваются в одно число на каждый агрегат.

7. **HAVING: фильтр групп.** HAVING проверяет условие у каждой группы. У Луча 30 оплаченных заказов, меньше порога 35, и группа выбывает. Осталось три группы.

8. **SELECT: столбцы и имена.** Только теперь SELECT собирает выходные столбцы: brand и два агрегата. AS даёт им имена orders и revenue — раньше этих имён не было.

9. **ORDER BY: сортировка.** ORDER BY revenue DESC сортирует строки по убыванию выручки. Имя revenue здесь уже есть: SELECT выполнен.

10. **LIMIT: первые две.** LIMIT 2 оставляет две первые строки отсортированной таблицы: Сову и Бриз. Без ORDER BY «первые две» были бы какими угодно.

11. **Почему WHERE не видит revenue.** Условие WHERE revenue > 250000 PostgreSQL отвергнет: WHERE — второй шаг, а имя revenue появится на пятом. Условие на выручку бренда пишут в HAVING выражением: HAVING SUM(amount) > 250000. В ORDER BY имя уже работает.

## Идея: пишут с SELECT, выполняют с FROM

SQL — язык, на котором у базы данных просят таблицу: в запросе описывают, какой нужен результат, а как его получить, решает СУБД. Запрос состоит из предложений SELECT, FROM, WHERE и других; пишут их в одном порядке, а выполняются они в другом, логическом: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Каждое предложение получает таблицу от предыдущего и передаёт следующему новую, обычно меньшую. Поэтому имя, которое столбец получил в SELECT, в WHERE и HAVING ещё не существует, а в ORDER BY уже есть.

Семь шагов по порядку

Этот порядок описан в документации PostgreSQL к команде SELECT[1], а у Microsoft он прямо называется логическим порядком обработки[2]. Обязательно в запросе только SELECT, а FROM есть почти всегда. Остальные предложения можно пропускать, но в записи они стоят строго в том порядке, что и в начале сцены.

Шаг | Что делает | В pandas

1 FROM | берёт таблицу-источник | df

2 WHERE | оставляет строки, где условие истинно | маска df[cond]

3 GROUP BY | раскладывает строки по группам | groupby

4 HAVING | оставляет группы, где условие истинно | фильтр после agg

5 SELECT | считает выходные столбцы и даёт им имена | agg(имя=…)

6 ORDER BY | сортирует | sort_values

7 LIMIT | берёт первые строки | head

Имя появляется в SELECT

SUM(amount) — агрегатная функция: она сворачивает значения группы в одно число. AS revenue даёт результату имя, псевдоним. Он возникает на пятом шаге, поэтому WHERE и HAVING о нём не знают, а ORDER BY знает. Документация PostgreSQL говорит прямо: имя выходного столбца можно использовать в ORDER BY и GROUP BY, но не в WHERE и HAVING, там выражение пишут целиком[1].

Порядок логический: он задаёт смысл запроса, а не то, в какой последовательности база на самом деле читает данные. Об этом — в разделе «Ограничения».

## Задача: почему revenue не находится

Учебная база shop — интернет-магазин товаров для дома за январь–март 2026: клиенты, товары, заказы и их позиции. Данные сгенерированы для учебника. На этой странице нужны две таблицы: orders, 231 заказ с суммой, статусом, брендом, каналом, оценкой и промокодом, и products, 32 товара.

Задача — читать и писать запросы к ним и понимать, почему похожий запрос то работает, то падает. Аналитик считает выручку брендов, называет её revenue и пишет WHERE revenue > 250000. PostgreSQL отвечает ошибкой column "revenue" does not exist, хотя имя объявлено строкой выше. А ORDER BY revenue в том же запросе работает.

Ниже сначала разобраны отдельные предложения: фильтры, сортировка, DISTINCT и LIMIT. Затем в интерактиве условие переезжает между WHERE и HAVING, и видно, что меняется.

## Фильтр, сортировка, первые строки

WHERE оставляет строки, для которых условие истинно. Условие — предикат: выражение, которое для каждой строки даёт «да», «нет» или, если в нём участвует пустое значение, «неизвестно». Это та же маска, что в pandas, только записанная словами. Строковые значения в SQL берут в одинарные кавычки: 'paid'. Двойные кавычки — для имён столбцов и таблиц.

Запись | Что значит | В pandas

amount >= 5000 | сравнение: =, <>, <, <=, >, >= | df.amount >= 5000

a AND b, a OR b, NOT a | связки условий | &, |, ~

category IN ('свет', 'декор') | одно из значений списка | isin

price BETWEEN 1500 AND 2500 | диапазон вместе с границами | between

product_name LIKE 'Лампа%' | шаблон: % — любые символы, _ — ровно один | str.startswith

rating IS NULL | значения нет | isna

Сортировка и место NULL

ORDER BY сортирует по одному или нескольким столбцам: ASC — по возрастанию, это вариант по умолчанию, DESC — по убыванию. Второй столбец решает, когда в первом значения равны. NULL — отметка «значения нет», и у сортировки для него своё правило. PostgreSQL считает NULL больше любого значения: при DESC такие строки идут первыми, при ASC — последними[3]. Место задают явно: NULLS FIRST или NULLS LAST. У 127 заказов из 231 нет оценки, и «три лучших по оценке» без NULLS LAST окажутся тремя заказами без оценки, это запрос 4 в разделе «Код».

DISTINCT

SELECT DISTINCT убирает из результата повторяющиеся строки. Он выполняется сразу после SELECT и сравнивает строку целиком: SELECT DISTINCT channel даёт три канала, а SELECT DISTINCT channel, brand — все встретившиеся пары канала и бренда. Внутри агрегата DISTINCT считает разные значения: по COUNT(DISTINCT customer_id) видно, что заказы сделали 52 клиента.

LIMIT и OFFSET

LIMIT n оставляет первые n строк, OFFSET m перед этим пропускает m строк. Вместе они дают пагинацию, выдачу по страницам: LIMIT 20 OFFSET 40 — третья страница по 20 строк. LIMIT выполняется последним, и «первые» значит первые после ORDER BY. Без ORDER BY база вернёт непредсказуемое подмножество строк, о чём документация PostgreSQL предупреждает отдельно[3].

## WHERE и HAVING: запрос по шагам

Главное различие двух фильтров — что они видят. WHERE работает до группировки и проверяет каждую строку. HAVING работает после и проверяет каждую группу целиком, поэтому в нём пишут агрегаты. Столбец, которого нет в GROUP BY, в HAVING можно упомянуть только внутри агрегата: в группе клиента пять заказов, и спросить «какой у группы status» нельзя.

С пустыми значениями агрегаты обходятся по-разному. COUNT(*) считает строки группы, а COUNT(rating) — только строки, где в rating не NULL: в orders 231 строка, а заказов с оценкой 104.

В интерактиве — учебная выборка из orders: 15 заказов четырёх клиентов, 101, 104, 106 и 143. В запросе она называется sample. Запрос ищет двух клиентов с наибольшей выручкой среди тех, у кого не меньше трёх оплаченных заказов. Сначала предскажите результат.

Три вывода. Уберите status = 'paid' совсем, и HAVING посчитает отменённые заказы: у клиента 106 их два, и он поднимется на второе место с 19 960 ₽. Перенесите это условие в HAVING, и PostgreSQL откажется выполнять запрос. COUNT(*) в WHERE и псевдоним revenue в WHERE или HAVING тоже дают ошибку: агрегатов на втором шаге ещё нет, а имени revenue нет до пятого.

Выборка взята запросом SELECT order_id, customer_id, amount, status FROM orders WHERE customer_id IN (101, 104, 106, 143). Интерактив считает на JavaScript; все 27 расстановок условий сверены с PostgreSQL 16 на каждом из семи этапов.

## Диалекты: различия в мелочах

Ядро SQL задано стандартом, но у каждой СУБД свой диалект — набор расширений и отличий. SELECT, WHERE, GROUP BY и ORDER BY везде пишутся одинаково, расходятся мелочи, и как раз они ломают перенесённые запросы. SQLite и DuckDB — встраиваемые СУБД: база лежит в одном файле и работает внутри вашей программы. MS SQL — сервер Microsoft, BigQuery — облачное хранилище Google. Столбцы PostgreSQL, SQLite и DuckDB проверены запуском в разделе «Код» и сверены с документацией SQLite[4] и DuckDB[5]. MS SQL[2] и BigQuery[6] описаны только по документации. FETCH FIRST n ROWS ONLY — запись из стандарта SQL:2008, она делает то же, что LIMIT[1].

 | PostgreSQL | SQLite | DuckDB | MS SQL | BigQuery

Первые n строк | LIMIT n, FETCH FIRST | LIMIT n | LIMIT n, FETCH FIRST | TOP (n), OFFSET … FETCH | LIMIT n

NULL при DESC | первыми | последними | последними | последними | последними

LIKE и регистр | различает, есть ILIKE | не различает, но только у латиницы | различает, есть ILIKE | зависит от collation | различает

Псевдоним из SELECT | в ORDER BY и GROUP BY | везде, даже в WHERE | везде, даже в WHERE | только в ORDER BY | везде, кроме WHERE

LIKE в MS SQL подчиняется правилу сравнения строк (collation): с пометкой CI регистр не важен, с CS — важен[2]. Разрешённый псевдоним в HAVING удобен, но запрос с ним не перенести в PostgreSQL без правки.

## Нюансы: NULL, регистр, порядок страниц

Сравнение с NULL. Любое сравнение с NULL даёт не TRUE и не FALSE, а UNKNOWN — третье значение троичной логики[7]. WHERE пропускает только TRUE, поэтому promo_code <> 'ЗИМА10' находит 19 заказов, а не 209: 190 строк без промокода выпали. Условие = NULL не находит ничего, пустоту ищут через IS NULL. Пустая строка '' — не NULL, таких промокодов в базе 7. Подробнее о троичной логике — на странице 3.4.

LIKE и регистр. В PostgreSQL LIKE различает регистр: 'лампа%' не найдёт «Лампа настольная», для поиска без учёта регистра есть ILIKE[8]. SQLite не различает регистр только у латиницы: status LIKE 'PAID' находит 195 строк, а 'лампа%' — ноль, и lower() кириллицу там тоже не меняет[4]. В PostgreSQL и DuckDB работает lower(product_name) LIKE 'лампа%'.

Порядок и страницы. Без ORDER BY порядок строк не гарантирован даже после GROUP BY: в интерактиве группы идут по customer_id только для удобства. Если сортировать по неуникальному столбцу, строки с равными значениями могут меняться местами от запроса к запросу, и страницы через LIMIT и OFFSET начнут повторять одни строки и терять другие[3]. Последним ключом ставят уникальный столбец: ORDER BY rating DESC NULLS LAST, order_id.

## Ограничения: логический порядок — не план

Логический порядок объясняет, что запрос значит, но не то, как база его выполняет. Планировщик PostgreSQL выбирает план выполнения: может найти нужные строки по индексу, не читая таблицу целиком, или остановиться, как только набрал строки для LIMIT. Результат при этом тот же, что дал бы логический порядок. План показывает команда EXPLAIN[9]; планы и индексы разобраны в блоке «Дата инженерия», тема 03.

## Код: пять запросов, pandas и три СУБД

Запросы идут к учебной базе shop в PostgreSQL 16, сложность растёт от первого к пятому. Вывод — из psql, клиента PostgreSQL для терминала.

Запрос из сцены можно отправить в SQLite прямо из pandas: pd.read_sql выполняет его и возвращает DataFrame[10]. Для сравнения ниже — то же самое силами pandas, как в теме 02.

Последний блок прогоняет одни и те же запросы через PostgreSQL, SQLite и DuckDB и печатает, где ответы расходятся.

Больше задач на SELECT — в браузерном тренажёре SQLBolt[11], аналитические приёмы на SQL собраны у Танимуры[12].

**Запрос 1. Пять самых дорогих оплаченных заказов**

```sql
-- SELECT: какие столбцы, FROM: из какой таблицы
SELECT order_id, order_date, brand, amount
FROM orders
WHERE status = 'paid'          -- только оплаченные
ORDER BY amount DESC, order_id -- при равной сумме — по номеру
LIMIT 5;
```

Вывод:

```
 order_id | order_date | brand | amount 
----------+------------+-------+--------
     1191 | 2026-02-27 | Кедр  |  18390
     1112 | 2026-03-19 | Бриз  |  16660
     1041 | 2026-01-12 | Кедр  |  15450
     1052 | 2026-03-28 | Кедр  |  14050
     1114 | 2026-01-14 | Луч   |  12550
(5 rows)
```

**Запрос 2. Фильтры IN, BETWEEN и LIKE**

```sql
SELECT product_name, category, price
FROM products
WHERE category IN ('свет', 'декор')   -- одно из значений списка
  AND price BETWEEN 1500 AND 2500     -- обе границы включены
  AND product_name LIKE '%«Сова»'     -- % — любые символы
ORDER BY price;
```

Вывод:

```
      product_name       | category | price 
-------------------------+----------+-------
 Гирлянда «Сова»         | свет     |  1730
 Ваза «Сова»             | декор    |  1900
 Лампа настольная «Сова» | свет     |  2500
(3 rows)
```

**Запрос 3. DISTINCT и три вида COUNT**

```sql
SELECT DISTINCT channel
FROM orders
ORDER BY channel;

SELECT COUNT(*)                    AS all_orders,
       COUNT(rating)               AS rated,
       COUNT(DISTINCT customer_id) AS customers
FROM orders;
```

Вывод:

```
 channel  
----------
 органика
 рассылка
 реклама
(3 rows)

 all_orders | rated | customers 
------------+-------+-----------
        231 |   104 |        52
(1 row)
```

**Запрос 4. NULL в сравнении, в сортировке и вторая страница**

```sql
-- сравнение с NULL даёт UNKNOWN, и строка выпадает
SELECT COUNT(*) AS not_zima
FROM orders
WHERE promo_code <> 'ЗИМА10';

-- «три лучших по оценке» за первую неделю февраля
SELECT order_id, amount, rating
FROM orders
WHERE order_date BETWEEN '2026-02-01' AND '2026-02-07'
ORDER BY rating DESC, order_id
LIMIT 3;

-- NULL в конец, вторая страница по три строки
SELECT order_id, amount, rating
FROM orders
WHERE order_date BETWEEN '2026-02-01' AND '2026-02-07'
ORDER BY rating DESC NULLS LAST, order_id
LIMIT 3 OFFSET 3;
```

Вывод:

```
 not_zima 
----------
       19
(1 row)

 order_id | amount | rating 
----------+--------+--------
     1076 |   3320 |   NULL
     1077 |   2190 |   NULL
     1126 |   2190 |   NULL
(3 rows)

 order_id | amount | rating 
----------+--------+--------
     1128 |  12400 |      4
     1129 |   6740 |      4
     1140 |   2550 |      4
(3 rows)
```

**Запрос 5. Запрос из сцены и псевдоним в WHERE**

```sql
SELECT brand,
       COUNT(*)    AS orders,
       SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY brand
HAVING COUNT(*) >= 35
ORDER BY revenue DESC   -- псевдоним здесь уже есть
LIMIT 2;

-- в WHERE псевдонима ещё нет
SELECT brand, SUM(amount) AS revenue
FROM orders
WHERE revenue > 250000
GROUP BY brand;

-- условие на выручку бренда пишут в HAVING выражением
SELECT brand, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY brand
HAVING SUM(amount) > 250000
ORDER BY revenue DESC;
```

Вывод:

```
 brand | orders | revenue 
-------+--------+---------
 Сова  |     71 |  276150
 Бриз  |     55 |  266300
(2 rows)

psql:q5.sql:15: ERROR:  column "revenue" does not exist
LINE 3: WHERE revenue > 250000
              ^
 brand | revenue 
-------+---------
 Сова  |  276150
 Бриз  |  266300
(2 rows)
```

**Тот же запрос к SQLite из pandas**

```python
import sqlite3
import pandas as pd

con = sqlite3.connect("data/shop/shop.sqlite")   # та же база одним файлом

query = """
SELECT brand, COUNT(*) AS orders, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY brand
HAVING COUNT(*) >= 35
ORDER BY revenue DESC
LIMIT 2
"""
top = pd.read_sql(query, con)        # считает база, в pandas приходят 2 строки
print(top)
print()

# то же силами pandas: загрузить все строки и считать в памяти
orders = pd.read_sql("SELECT * FROM orders", con)
paid = orders[orders["status"] == "paid"]                   # WHERE
by_brand = paid.groupby("brand").agg(orders=("order_id", "size"),
                                     revenue=("amount", "sum"))  # GROUP BY и агрегаты
by_brand = by_brand[by_brand["orders"] >= 35]               # HAVING
print(by_brand.sort_values("revenue", ascending=False).head(2))  # ORDER BY и LIMIT
print("загружено строк:", len(orders), "| в ответе базы:", len(top))
```

Вывод:

```
  brand  orders  revenue
0  Сова      71   276150
1  Бриз      55   266300

       orders  revenue
brand                 
Сова       71   276150
Бриз       55   266300
загружено строк: 231 | в ответе базы: 2
```

**Одни и те же запросы в трёх СУБД**

```python
import sqlite3
import duckdb      # 2.0.0
import psycopg     # 3.3.8

engines = {
    "PostgreSQL": psycopg.connect("host=/tmp dbname=shop user=postgres", autocommit=True),
    "SQLite": sqlite3.connect("data/shop/shop.sqlite"),
    "DuckDB": duckdb.connect("data/shop/shop.duckdb", read_only=True),
}
week = "order_date BETWEEN '2026-02-01' AND '2026-02-07'"
tests = {
    "NULL при DESC": f"SELECT order_id, rating FROM orders WHERE {week} "
                     "ORDER BY rating DESC, order_id LIMIT 3",
    "LIKE 'PAID'": "SELECT COUNT(*) FROM orders WHERE status LIKE 'PAID'",
    "LIKE 'лампа%'": "SELECT COUNT(*) FROM products WHERE product_name LIKE 'лампа%'",
    "lower() и кириллица": "SELECT COUNT(*) FROM products WHERE lower(product_name) LIKE 'лампа%'",
    "псевдоним в WHERE": "SELECT order_id, amount * 2 AS twice FROM orders WHERE twice > 36000",
    "FETCH FIRST": "SELECT order_id FROM orders ORDER BY order_id FETCH FIRST 2 ROWS ONLY",
    "TOP": "SELECT TOP 2 order_id FROM orders ORDER BY order_id",
    "псевдоним в HAVING": "SELECT brand, SUM(amount) AS revenue FROM orders "
                          "GROUP BY brand HAVING revenue > 300000 ORDER BY brand",
    "status в HAVING": "SELECT brand, COUNT(*) FROM orders "
                       "GROUP BY brand HAVING status = 'paid' ORDER BY brand",
}
for title, sql in tests.items():
    print(title)
    for name, con in engines.items():
        try:
            res = con.execute(sql).fetchall()
        except Exception as e:
            res = "ошибка: " + str(e).splitlines()[0][:58].rstrip()
        print(f"  {name:<11}{res}")
```

Вывод:

```
NULL при DESC
  PostgreSQL [(1076, None), (1077, None), (1126, None)]
  SQLite     [(1065, 5), (1069, 5), (1142, 5)]
  DuckDB     [(1065, 5), (1069, 5), (1142, 5)]
LIKE 'PAID'
  PostgreSQL [(0,)]
  SQLite     [(195,)]
  DuckDB     [(0,)]
LIKE 'лампа%'
  PostgreSQL [(0,)]
  SQLite     [(0,)]
  DuckDB     [(0,)]
lower() и кириллица
  PostgreSQL [(4,)]
  SQLite     [(0,)]
  DuckDB     [(4,)]
псевдоним в WHERE
  PostgreSQL ошибка: column "twice" does not exist
  SQLite     [(1191, 36780)]
  DuckDB     [(1191, 36780)]
FETCH FIRST
  PostgreSQL [(1001,), (1002,)]
  SQLite     ошибка: near "FETCH": syntax error
  DuckDB     [(1001,), (1002,)]
TOP
  PostgreSQL ошибка: syntax error at or near "2"
  SQLite     ошибка: near "2": syntax error
  DuckDB     ошибка: Parser Error: syntax error at or near "2"
псевдоним в HAVING
  PostgreSQL ошибка: column "revenue" does not exist
  SQLite     [('Бриз', 312510), ('Сова', 328440)]
  DuckDB     [('Бриз', 312510), ('Сова', 328440)]
status в HAVING
  PostgreSQL ошибка: column "orders.status" must appear in the GROUP BY clause
  SQLite     [('Бриз', 68), ('Кедр', 48), ('Луч', 34), ('Сова', 81)]
  DuckDB     ошибка: Binder Error: column "status" must appear in the GROUP BY
```

## Вопросы для самопроверки

1. В запросе из интерактива ниже условие status = 'paid' перенесли из WHERE в HAVING, рядом с COUNT(*) >= 3. Что ответит PostgreSQL?
   А) То же, что раньше: условие просто проверяется позже
   Б) Ошибку: status не входит в GROUP BY и не стоит внутри агрегата
   В) Оставит только группы, где все заказы оплачены
   Г) Вернёт группы вместе с отменёнными заказами

2. В сцене в таблице orders 231 строка, из них 36 отменённых. Сколько строк получает на вход GROUP BY?
   А) 231 — группировка видит всю таблицу
   Б) 195 — WHERE уже убрал отменённые
   В) 4 — по числу брендов
   Г) 3 — после HAVING

3. Почему SELECT brand, SUM(amount) AS revenue FROM orders WHERE revenue > 250000 GROUP BY brand падает с ошибкой column "revenue" does not exist?
   А) revenue — зарезервированное слово, его нельзя использовать как имя
   Б) WHERE выполняется до SELECT, и имени revenue в этот момент ещё нет
   В) Псевдонимы работают только в одинарных кавычках
   Г) Нужно написать AS после WHERE

4. В PostgreSQL запрос SELECT order_id, rating FROM orders ORDER BY rating DESC LIMIT 3 выполнили на заказах, где у части нет оценки. Что окажется в результате?
   А) Три заказа с оценкой 5
   Б) Три заказа без оценки: NULL при DESC идёт первым
   В) Ошибка: нельзя сортировать столбец с NULL
   Г) Заказы с NULL будут отброшены сортировкой

5. SELECT COUNT(*), COUNT(rating) FROM orders вернул 231 и 104. Почему числа разные?
   А) COUNT(rating) считает разные значения оценки
   Б) COUNT(*) считает строки, а COUNT(rating) — только строки, где rating не NULL
   В) COUNT(rating) считает только оплаченные заказы
   Г) COUNT(*) считает и строки-дубликаты дважды

6. В базе 231 заказ, промокод ЗИМА10 у 22, а у 190 промокода нет (NULL). Сколько строк насчитает эта строка?

```
SELECT COUNT(*) FROM orders WHERE promo_code <> 'ЗИМА10';
```
   А) 209
   Б) 19
   В) 0
   Г) 231

7. Список заказов показывают по 20 на страницу запросом ORDER BY order_date LIMIT 20 OFFSET … В один день бывает несколько заказов. Что может пойти не так?
   А) Ничего: ORDER BY делает порядок однозначным
   Б) Заказы одного дня могут меняться местами между запросами, и на соседних страницах одни повторятся, а другие пропадут
   В) OFFSET без ORDER BY не работает
   Г) LIMIT 20 вернёт меньше строк, если в дне больше 20 заказов

## Глоссарий

- **Агрегатная функция** (aggregate function) — функция, которая сворачивает строки группы в одно значение: COUNT, SUM, AVG, MIN, MAX.
- **Диалект SQL** (SQL dialect) — вариант SQL конкретной СУБД: стандарт плюс свои расширения и отличия.
- **Индекс** (index) — отдельная структура, по которой база находит строки, не читая таблицу целиком.
- **Логический порядок выполнения** (logical query processing order) — порядок, в котором предложения передают друг другу таблицы: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.
- **Пагинация** (pagination) — выдача результата по страницам через LIMIT и OFFSET.
- **План выполнения** (execution plan) — последовательность операций, которой СУБД получает результат. Показывается командой EXPLAIN.
- **Планировщик** (query planner) — часть СУБД, которая выбирает, как физически выполнить запрос.
- **Правило сравнения строк** (collation) — настройка, которая решает, равны ли строки с разным регистром и как они сортируются.
- **Предикат** (predicate) — условие, которое для строки истинно, ложно или неизвестно.
- **Предложение запроса** (clause) — часть запроса, которая начинается с ключевого слова: SELECT, FROM, WHERE, ORDER BY.
- **Псевдоним** (alias) — имя, которое выходной столбец получает в SELECT через AS.
- **СУБД** (database management system) — программа, которая хранит данные и выполняет запросы к ним: PostgreSQL, SQLite, DuckDB.
- **Троичная логика** (three-valued logic) — логика с тремя значениями: TRUE, FALSE и UNKNOWN, которое даёт сравнение с NULL.
- **Шаблон LIKE** (pattern matching) — сравнение строки с образцом: % — любое число символов, _ — ровно один.
- **DISTINCT** — слово после SELECT, которое убирает из результата повторяющиеся строки.
- **NULL** — отметка «значения нет». Это не ноль и не пустая строка.
- **SQL** (Structured Query Language) — язык запросов к реляционным базам данных: описывает, какой результат нужен.

## Источники

1. PostgreSQL Documentation. SELECT. Порядок обработки запроса и где видны имена выходных столбцов. https://www.postgresql.org/docs/current/sql-select.html
2. Microsoft Learn. SELECT (Transact-SQL), TOP, ORDER BY, LIKE. Логический порядок обработки, TOP, NULL при сортировке и LIKE в MS SQL. https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql
3. PostgreSQL Documentation: Queries. Sorting Rows и LIMIT and OFFSET. NULLS FIRST по умолчанию при DESC и почему LIMIT без ORDER BY непредсказуем. https://www.postgresql.org/docs/current/queries-order.html https://www.postgresql.org/docs/current/queries-limit.html
4. SQLite. SELECT и SQL Language Expressions, lower(). NULL меньше любого значения при сортировке, LIKE и lower() без учёта регистра только для ASCII. https://www.sqlite.org/lang_select.html https://www.sqlite.org/lang_expr.html#like https://www.sqlite.org/lang_corefunc.html#lower
5. DuckDB. ORDER BY Clause. NULLS LAST по умолчанию в обе стороны и отличие от PostgreSQL. https://duckdb.org/docs/stable/sql/query_syntax/orderby
6. Google Cloud. BigQuery: Query syntax и Operators. Порядок вычисления, псевдонимы, NULL при сортировке, LIMIT и LIKE. https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax https://cloud.google.com/bigquery/docs/reference/standard-sql/operators
7. Winand M. Modern SQL: Three-Valued Logic. Как сравнение с NULL даёт UNKNOWN по стандарту SQL. https://modern-sql.com/concept/three-valued-logic
8. PostgreSQL Documentation. Pattern Matching. LIKE, ILIKE и знаки % и _. https://www.postgresql.org/docs/current/functions-matching.html
9. PostgreSQL Documentation. Using EXPLAIN. Как посмотреть план выполнения запроса. https://www.postgresql.org/docs/current/using-explain.html
10. pandas. pandas.read_sql. Запрос к базе с результатом в DataFrame. https://pandas.pydata.org/docs/reference/api/pandas.read_sql.html
11. SQLBolt. Упражнения на SELECT в браузере. https://sqlbolt.com/
12. Tanimura C. SQL for Data Analysis. O’Reilly, 2021. Аналитические запросы от SELECT до когорт и временных рядов.