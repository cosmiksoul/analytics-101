# SELECT и порядок выполнения запроса

Аналитика 101 · блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.1.

Как найти два бренда с наибольшей выручкой и исключить из расчёта отменённые заказы? На этом примере вы разберёте запрос на SQL по шагам. Увидите, когда отбираются строки, когда подсчитываются суммы и почему в PostgreSQL можно сортировать по псевдониму revenue, хотя в WHERE это имя недоступно.

## Анимация по шагам

1. **Запрос о выручке двух брендов.** Выберем два бренда с наибольшей выручкой среди тех, у кого не меньше 35 оплаченных заказов. Данные берём из таблицы orders. В записи запроса первым стоит SELECT. В нём перечислены столбцы, которые мы хотим увидеть в результате.

2. **Логический порядок обработки.** Чтобы понять смысл запроса, сначала определим источник строк. Затем отберём заказы, объединим их по брендам и проверим условие для каждой группы. В этом разборе SELECT будет пятым шагом. После него останется отсортировать строки и выбрать первые две.

3. **FROM задаёт источник строк.** FROM orders указывает, из какой таблицы запрос берёт заказы. В ней 231 строка и 10 столбцов. На схеме каждому заказу соответствует один квадрат.

4. **WHERE оставляет оплаченные заказы.** WHERE status = 'paid' проверяет статус каждого заказа. Из 231 заказа условию соответствуют 195. Остальные 36 заказов отменены. Количество заказов по брендам можно будет сравнить после группировки.

5. **GROUP BY объединяет заказы по брендам.** После GROUP BY brand каждый из 195 оплаченных заказов относится к одной из четырёх групп. В отдельной группе собраны все оплаченные заказы одного бренда.

6. **Сколько заказов и выручки у каждого бренда.** Для каждой группы COUNT(*) считает заказы, а SUM(amount) складывает их суммы. Например, у «Бриза» 55 оплаченных заказов на 266 300 ₽.

7. **HAVING отбирает бренды по числу заказов.** У «Луча» 30 оплаченных заказов. Условие HAVING COUNT(*) >= 35 исключает этот бренд из сравнения. В выборке остаются «Бриз», «Кедр» и «Сова».

8. **SELECT задаёт столбцы результата.** В результате будут три столбца. Первый содержит название бренда. Второй показывает число заказов, третий — выручку. Выражения AS orders и AS revenue задают имена двух столбцов с результатами расчёта.

9. **ORDER BY сортирует бренды по выручке.** ORDER BY revenue DESC ставит первой «Сову», затем «Бриз» и «Кедр». В ORDER BY можно использовать имя revenue, которое мы указали в SELECT.

10. **LIMIT оставляет два бренда.** После сортировки LIMIT 2 вернёт «Сову» с выручкой 276 150 ₽ и «Бриз» с выручкой 266 300 ₽. Без ORDER BY запрос не гарантирует, что в эти две строки попадут лидеры по выручке.

11. **Как отобрать бренды по суммарной выручке.** Если написать WHERE revenue > 250000, PostgreSQL сообщит, что столбца revenue нет. В исходной таблице этого имени нет, а WHERE не может ссылаться на псевдоним из SELECT. Чтобы проверить выручку группы, запишите HAVING SUM(amount) > 250000. Для сортировки по той же сумме подойдёт ORDER BY revenue DESC.

## В каком порядке разбирать запрос

Запрос на SQL описывает результат, который вы хотите получить. Как именно прочитать и обработать данные, решает СУБД — система управления базами данных. Запрос состоит из предложений. В записи первым идёт SELECT, но для разбора нашего запроса удобно начать с FROM. Затем идут WHERE, GROUP BY, HAVING, SELECT, ORDER BY и LIMIT. Это логический порядок обработки. Он помогает понять, к чему относится условие и какие столбцы доступны на каждом шаге.

Семь шагов одного запроса

Такой разбор запроса приведён в документации PostgreSQL[1] и SQL Server[2]. В нашем примере нужны все семь предложений. Простому запросу достаточно одного SELECT, например SELECT 2 + 2. Когда вы добавляете предложения, соблюдайте порядок их записи. Похожие операции в pandas приведены в таблице.

Шаг | Что делает | В pandas

1 FROM | задаёт источник строк | df

2 WHERE | оставляет строки, где условие истинно | маска df[cond]

3 GROUP BY | группирует строки по указанным значениям | groupby

4 HAVING | оставляет группы, где условие истинно | фильтр после agg

5 SELECT | задаёт столбцы результата и их имена | agg(имя=…)

6 ORDER BY | сортирует | sort_values

7 LIMIT | берёт первые строки | head

Где можно использовать имя из SELECT

SUM(amount) — агрегатная функция. Она складывает суммы заказов в каждой группе. Запись AS revenue задаёт имя столбца с результатом. В PostgreSQL по этому имени можно сортировать в ORDER BY. В WHERE и HAVING псевдоним результата использовать нельзя. Чтобы отобрать бренды по суммарной выручке, в HAVING повторяют выражение SUM(amount). У GROUP BY есть отдельное правило PostgreSQL: здесь можно сослаться на имя выходного столбца, если само выражение допускает группировку[1].

СУБД может выполнить вычисления в другом порядке, если ответ останется верным. В разделе «Ограничения» разберём, как посмотреть выбранный ею план.

## Почему PostgreSQL не находит столбец revenue

В учебной базе shop собраны данные о работе магазина товаров для дома за январь–март 2026 года. В этом уроке понадобятся две таблицы. В orders 231 заказ. Для каждого указаны сумма, статус, бренд, канал, оценка и промокод. В products 32 товара.

Аналитик считает выручку каждого бренда и хочет оставить только бренды с выручкой больше 250 000 ₽. В SELECT он задаёт имя revenue, а ниже пишет WHERE revenue > 250000. PostgreSQL сообщает, что столбец revenue не существует. Почему то же имя можно использовать в ORDER BY revenue?

Чтобы ответить, сначала выберем отдельные строки, отсортируем их и ограничим размер результата. Затем проверим в интерактиве, какие условия можно перенести из WHERE в HAVING.

## Как отобрать и отсортировать строки

WHERE оставляет строки, для которых условие истинно. Такое условие называют предикатом. Например, при сравнении amount >= 5000 возможны три результата — TRUE, FALSE и UNKNOWN. Если сумма неизвестна, результат этого сравнения тоже неизвестен. В PostgreSQL текстовые значения заключают в одинарные кавычки, например 'paid'. Двойные кавычки служат для имён, например для имени столбца.

Запись | Что значит | В pandas

amount >= 5000 | сравнение: =, <>, <, <=, >, >= | df.amount >= 5000

a AND b, a OR b, NOT a | связки условий | &, |, ~

category IN ('свет', 'декор') | одно из значений списка | isin

price BETWEEN 1500 AND 2500 | диапазон вместе с границами | between

product_name LIKE 'Лампа%' | шаблон: % — любые символы, _ — ровно один | str.startswith

rating IS NULL | значения нет | isna

Где при сортировке окажутся заказы без оценки

ORDER BY задаёт порядок строк. Для сортировки по возрастанию используют ASC (по умолчанию), по убыванию — DESC. Если значения первого столбца равны, их порядок определяет следующий ключ сортировки. У 127 заказов из 231 оценка отсутствует, и в столбце rating стоит NULL. В PostgreSQL при DESC строки с NULL по умолчанию идут первыми, при ASC — последними[3]. Поэтому запрос к этим заказам с ORDER BY rating DESC LIMIT 3 вернёт три заказа без оценки. Чтобы первыми шли заказы с высокой оценкой, укажите DESC NULLS LAST. В запросе 4 сравните оба варианта для первой недели февраля.

DISTINCT

SELECT DISTINCT удаляет повторы после выбора столбцов. При сравнении учитываются все выбранные значения. Например, SELECT DISTINCT channel вернёт три канала, а SELECT DISTINCT channel, brand — все пары канала и бренда, которые встречаются в заказах. Для подсчёта разных клиентов подходит COUNT(DISTINCT customer_id). В нашей таблице заказы сделали 52 клиента.

Как разбить результат на страницы

LIMIT n возвращает не больше n строк. Если указать OFFSET m, запрос сначала пропустит m строк. Так можно организовать пагинацию — показывать результат по страницам. Например, LIMIT 20 OFFSET 40 вернёт третью страницу, если на каждой помещается 20 строк. Чтобы однозначно определить состав страницы, нужен ORDER BY с ключами, которые задают порядок всех строк. Без сортировки состав первых 20 строк не гарантирован[3].

## Когда использовать WHERE, а когда HAVING

WHERE проверяет отдельные строки до группировки. HAVING проверяет уже сформированные группы. Например, WHERE status = 'paid' оставляет только оплаченные заказы, а HAVING COUNT(*) >= 3 оставляет клиентов, у которых после отбора набралось хотя бы три заказа. Если группировать по customer_id, у одного клиента могут быть заказы с разными статусами. Его группу нельзя проверить по условию HAVING status = 'paid' в PostgreSQL.

COUNT(*) считает все строки, а COUNT(rating) — строки с указанной оценкой. Если применить обе функции ко всей таблице orders, получится 231 заказ, из них 104 с оценкой.

В интерактиве используется выборка sample. В ней 15 заказов четырёх клиентов с номерами 101, 104, 106 и 143. Начальная версия запроса выбирает двух клиентов, у которых больше всего выручки от оплаченных заказов. В сравнении участвуют клиенты с тремя или более такими заказами. Сначала попробуйте предсказать результат.

Уберите status = 'paid'. Теперь в количестве и сумме заказов учтены также отменённые. У клиента 106 два таких заказа. Сумма всех четырёх его заказов составит 19 960 ₽, и он окажется на втором месте. Если поместить условие по статусу в HAVING, PostgreSQL выдаст ошибку. Условие с COUNT(*) недопустимо в WHERE, а псевдоним revenue в этом запросе недоступен ни в WHERE, ни в HAVING.

Выборку можно получить запросом SELECT order_id, customer_id, amount, status FROM orders WHERE customer_id IN (101, 104, 106, 143) ORDER BY order_id. В интерактиве результат рассчитывает JavaScript. Для всех 27 сочетаний настроек результаты и ошибки сверены с PostgreSQL 16.

## Чем различаются диалекты SQL

Конкретная СУБД поддерживает свой диалект SQL. Например, один и тот же запрос с сортировкой по оценке может по-разному расположить строки без оценки. Ниже сравниваются PostgreSQL, встраиваемые СУБД SQLite и DuckDB, Microsoft SQL Server и облачная платформа BigQuery. Примеры для первых трёх систем проверены на учебной базе. Правила SQLite[4] и DuckDB[5], а также сведения о SQL Server[2] и BigQuery[6] приведены в документации. В PostgreSQL стандартная запись FETCH FIRST n ROWS ONLY ограничивает число строк так же, как LIMIT n[1].

 | PostgreSQL | SQLite | DuckDB | MS SQL | BigQuery

Первые n строк | LIMIT n, FETCH FIRST | LIMIT n | LIMIT n, FETCH FIRST | TOP (n), OFFSET … FETCH | LIMIT n

NULL при DESC | первыми | последними | последними | последними | последними

LIKE и регистр | различает, есть ILIKE | не различает, но только для букв ASCII | различает, есть ILIKE | зависит от collation | различает

Псевдоним из SELECT | в ORDER BY и GROUP BY | в том числе в WHERE для выражений без агрегатов | в том числе в WHERE для выражений без агрегатов | только в ORDER BY | в GROUP BY, HAVING и ORDER BY

В SQL Server чувствительность LIKE к регистру зависит от правила сравнения строк (collation). Обозначение CI означает, что регистр не учитывается, CS — что учитывается[2]. При переносе запроса проверяйте и допустимость псевдонимов. Например, ссылка на имя revenue из HAVING в DuckDB допустима, а в PostgreSQL нужно написать SUM(amount).

## NULL, регистр букв и порядок строк

Как найти заказы без промокода. При обычном сравнении с NULL, например promo_code <> 'ЗИМА10', результат неизвестен. В трёхзначной логике его обозначают UNKNOWN[7]. WHERE оставляет только строки с результатом TRUE. Из 231 заказа у 190 промокод равен NULL, у 22 указан «ЗИМА10», у 12 — «ВЕСНА15», у семи записана пустая строка. Поэтому условию promo_code <> 'ЗИМА10' соответствуют 19 заказов. Заказы без значения ищут с помощью IS NULL. Пустая строка '' под это условие не подходит. Подробнее о NULL — в уроке 3.4.

Как учесть регистр букв. В нашем примере PostgreSQL различает регистр в LIKE, поэтому шаблон 'лампа%' не подходит для названия «Лампа настольная». Для поиска без учёта регистра можно использовать ILIKE[8]. В стандартной сборке SQLite LIKE по умолчанию не различает регистр букв ASCII, а для кириллицы регистр важен. Выражение status LIKE 'PAID' находит 195 строк, а product_name LIKE 'лампа%' — ни одной. Встроенная в SQLite функция lower() также не меняет регистр кириллицы[4]. В PostgreSQL функция lower() учитывает языковые настройки базы. Если они поддерживают смену регистра кириллицы, как в учебной базе, выражение lower(product_name) LIKE 'лампа%' находит четыре товара. В DuckDB результат тот же. В PostgreSQL с настройкой C заглавная «Л» останется заглавной, и запрос вернёт ноль строк.

Как избежать повторов на соседних страницах. В интерактиве группы расположены по номерам клиентов, чтобы их было легче сравнить. SQL гарантирует порядок только при ORDER BY. Даже с сортировкой по оценке у разных заказов могут оказаться одинаковые оценки. Тогда на соседних страницах один заказ может появиться дважды, а другой не попасть ни на одну из них[3]. Для неизменившегося набора заказов порядок станет однозначным, если последним ключом добавить уникальный номер заказа: ORDER BY rating DESC NULLS LAST, order_id.

## Как СУБД выбирает план выполнения

Планировщик PostgreSQL выбирает план выполнения запроса. Например, если есть подходящий индекс, СУБД может найти заказы по индексу, а с LIMIT иногда может завершить поиск, когда нужные строки уже найдены. Логический разбор помогает проверить смысл запроса. Выбранный план можно посмотреть с помощью EXPLAIN[9]. Планы и индексы подробнее разбираются в теме 03 блока «Дата инженерия».

## Пять запросов к базе магазина

Выполните запросы к базе shop в PostgreSQL 16. Под каждым примером показан вывод psql — клиента PostgreSQL для командной строки.

Запрос о двух брендах можно выполнить из pandas. Функция pd.read_sql передаст его SQLite и вернёт результат в виде DataFrame[10]. Во второй части примера тот же расчёт выполняется средствами pandas после загрузки таблицы заказов.

Последний пример показывает, какие результаты и ошибки дают одни и те же запросы в PostgreSQL, SQLite и DuckDB.

В браузерном тренажёре SQLBolt есть упражнения на SELECT[11]. Дополнительные примеры аналитических запросов можно найти в книге Кэти Танимуры[12].

**Запрос 1. Пять оплаченных заказов с наибольшей суммой**

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

**Запрос 2. Выбор товаров по категории, цене и названию**

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

**Запрос 3. Как посчитать заказы, оценки и разных клиентов**

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

**Запрос 4. Как NULL влияет на фильтр и сортировку**

```sql
-- если промокод равен NULL, сравнение даёт UNKNOWN
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

**Запрос 5. Как отобрать бренды по выручке**

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

-- проверяем сумму оплаченных заказов каждого бренда
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

1. В учебном запросе группируют заказы по customer_id. Условие status = 'paid' перенесли из WHERE в HAVING и оставили рядом с COUNT(*) >= 3. Что произойдёт в PostgreSQL?
   А) Результат останется прежним, хотя проверка статуса произойдёт позже
   Б) Возникнет ошибка: status не входит в GROUP BY и используется без агрегатной функции
   В) Останутся только клиенты, у которых оплачены все заказы
   Г) В результат попадут все клиенты с отменёнными заказами

2. В таблице orders 231 заказ, из них 36 отменены. Сколько строк поступит на группировку в запросе из анимации?
   А) 231 строка — все заказы
   Б) 195 строк — только оплаченные заказы
   В) 4 строки — по числу брендов
   Г) 3 строки — по числу брендов, прошедших HAVING

3. Почему PostgreSQL сообщает, что столбец revenue не существует, если написать SELECT brand, SUM(amount) AS revenue FROM orders WHERE revenue > 250000 GROUP BY brand?
   А) revenue — зарезервированное слово, которым нельзя назвать столбец
   Б) В orders нет столбца revenue, а в WHERE нельзя сослаться на псевдоним из SELECT
   В) Псевдоним нужно заключить в одинарные кавычки
   Г) После WHERE пропущено слово AS

4. У 127 заказов из учебной таблицы отсутствует оценка. Какие строки вернёт в PostgreSQL запрос SELECT order_id, rating FROM orders ORDER BY rating DESC LIMIT 3?
   А) Три заказа с оценкой 5
   Б) Три заказа без оценки
   В) Возникнет ошибка, потому что в столбце rating есть NULL
   Г) Три заказа с оценкой ниже 5

5. Почему SELECT COUNT(*), COUNT(rating) FROM orders вернул два разных числа — 231 и 104?
   А) COUNT(rating) учитывает каждое значение оценки только один раз
   Б) COUNT(*) считает все строки, а COUNT(rating) — только заказы с указанной оценкой
   В) COUNT(rating) проверяет, был ли заказ оплачен
   Г) COUNT(*) считает только те заказы, у которых нет оценки

6. В таблице 231 заказ. У 22 записан промокод «ЗИМА10», у 190 значение promo_code равно NULL. Сколько заказов посчитает запрос?

```
SELECT COUNT(*) FROM orders WHERE promo_code <> 'ЗИМА10';
```
   А) 209
   Б) 19
   В) 0
   Г) 231

7. Заказы показывают по 20 на страницу. В запросе указано ORDER BY order_date LIMIT 20 OFFSET …, причём на одну дату приходится несколько заказов. Что может произойти даже при неизменных данных?
   А) ORDER BY гарантирует однозначный порядок всех заказов
   Б) На соседних страницах заказ может повториться, а другой остаться за пределами обеих страниц
   В) Запрос с OFFSET нельзя выполнить без второго столбца сортировки
   Г) Если в один день было больше 20 заказов, LIMIT 20 обязательно вернёт меньше 20 строк

## Глоссарий

- **Агрегатная функция** (aggregate function) — функция, которая по значениям группы вычисляет один результат. Например, COUNT(*) считает строки, SUM(amount) складывает суммы заказов.
- **Диалект SQL** (SQL dialect) — вариант языка SQL, который поддерживает конкретная СУБД. Диалекты могут различаться синтаксисом и правилами обработки данных.
- **Индекс** (index) — структура данных, с помощью которой СУБД может найти нужные строки без полного просмотра таблицы.
- **Логический порядок выполнения** (logical query processing order) — порядок, в котором разбирают смысл запроса. Например, WHERE применяется к строкам до группировки, а HAVING — к группам.
- **Пагинация** (pagination) — вывод результата по страницам. LIMIT и OFFSET задают размер страницы и число строк, которые нужно пропустить.
- **План выполнения** (execution plan) — набор операций, которые СУБД выбрала для выполнения запроса. В PostgreSQL его показывает команда EXPLAIN.
- **Планировщик** (query planner) — компонент СУБД, который выбирает способ выполнения запроса.
- **Правило сравнения строк** (collation) — набор правил сортировки и сравнения текста. От него может зависеть, считаются ли одинаковыми строки, различающиеся регистром.
- **Предикат** (predicate) — условие, которое может быть истинным, ложным или иметь неизвестный результат.
- **Предложение запроса** (clause) — часть SQL-запроса со своим назначением. Например, FROM задаёт источник строк, а WHERE — условие их отбора.
- **Псевдоним** (alias) — имя, присвоенное столбцу или источнику данных в запросе. Например, AS revenue задаёт имя столбца с суммарной выручкой.
- **СУБД** (database management system) — система управления базами данных. Хранит данные и выполняет запросы к ним. Примеры — PostgreSQL, SQLite и DuckDB.
- **Трёхзначная логика** (three-valued logic) — логика с тремя возможными результатами: TRUE, FALSE и UNKNOWN. Например, обычное сравнение числа с NULL даёт UNKNOWN.
- **Шаблон LIKE** (pattern matching) — способ проверить, соответствует ли строка образцу. В образце знак процента обозначает любое число символов, включая ноль, а знак подчёркивания — ровно один символ.
- **DISTINCT** — ключевое слово. В SELECT DISTINCT оставляет по одной строке для каждой комбинации выбранных значений.
- **NULL** — обозначение отсутствующего значения. Число 0 и пустая строка — отдельные значения.
- **SQL** (Structured Query Language) — язык для работы с реляционными базами данных. В запросе SELECT описывают, какие данные нужно получить.

## Источники

1. PostgreSQL Documentation. SELECT. Порядок обработки запроса и где видны имена выходных столбцов. https://www.postgresql.org/docs/current/sql-select.html
2. Microsoft Learn. SELECT (Transact-SQL), TOP, ORDER BY, LIKE. Логический порядок обработки, TOP, NULL при сортировке и LIKE в MS SQL. https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql
3. PostgreSQL Documentation: Queries. Sorting Rows и LIMIT and OFFSET. NULLS FIRST по умолчанию при DESC и почему LIMIT без ORDER BY непредсказуем. https://www.postgresql.org/docs/current/queries-order.html https://www.postgresql.org/docs/current/queries-limit.html
4. SQLite. SELECT и SQL Language Expressions, lower(). NULL меньше любого значения при сортировке, LIKE и lower() без учёта регистра только для ASCII. https://www.sqlite.org/lang_select.html https://www.sqlite.org/lang_expr.html#like https://www.sqlite.org/lang_corefunc.html#lower
5. DuckDB. ORDER BY Clause. NULLS LAST по умолчанию в обе стороны и отличие от PostgreSQL. https://duckdb.org/docs/stable/sql/query_syntax/orderby
6. Google Cloud. BigQuery: Query syntax и Operators. Порядок вычисления, псевдонимы, NULL при сортировке, LIMIT и LIKE. https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax https://cloud.google.com/bigquery/docs/reference/standard-sql/operators
7. Winand M. Modern SQL: Three-Valued Logic. Как сравнение с NULL даёт UNKNOWN по стандарту SQL. https://modern-sql.com/concept/three-valued-logic
8. PostgreSQL Documentation. Pattern Matching. LIKE, ILIKE и знаки % и _. Правила преобразования регистра описаны в разделе String Functions and Operators. https://www.postgresql.org/docs/current/functions-matching.html https://www.postgresql.org/docs/16/functions-string.html
9. PostgreSQL Documentation. Using EXPLAIN. Как посмотреть план выполнения запроса. https://www.postgresql.org/docs/current/using-explain.html
10. pandas. pandas.read_sql. Запрос к базе с результатом в DataFrame. https://pandas.pydata.org/docs/reference/api/pandas.read_sql.html
11. SQLBolt. Упражнения на SELECT в браузере. https://sqlbolt.com/
12. Tanimura C. SQL for Data Analysis. O’Reilly, 2021. Аналитические запросы от SELECT до когорт и временных рядов.