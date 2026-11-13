# Подзапросы, CTE, NULL и типы

Аналитика 101 · блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.4.

Длинный запрос легче читать и проверять, если разложить его на шаги с именами. После страницы вы сможете писать подзапросы и CTE, находить строки, потерянные из-за NULL, и сравнивать даты, строки и числа без сюрпризов от типов.

## Анимация по шагам

1. **Отчёт не сходится.** Нужна выручка по каналам без заказов по зимней акции ЗИМА10. Запрос из вложенных подзапросов отработал без ошибок и насчитал 16 заказов. Оплаченных заказов в учебной базе 195, по акции из них 20. Где ещё 159?

2. **Читать приходится изнутри.** Подзапрос в FROM выполняется раньше внешнего запроса, поэтому читать приходится с середины: 1 — оплаченные, 2 — фильтр по промокоду, 3 — группировка, 4 — сортировка. Чтобы увидеть промежуточный результат, его придётся вырезать из середины текста.

3. **WITH: у каждого шага имя.** Тот же запрос через WITH: шаги paid, no_winter и by_channel стоят сверху вниз в порядке выполнения, и каждый берёт данные из предыдущего по имени. Результат прежний, 16 заказов. Зато каждый шаг теперь можно открыть как таблицу.

4. **paid: 195 строк.** Запускаем первый шаг отдельно: SELECT * FROM paid. В нём все 195 оплаченных заказов, здесь всё сходится. У большинства строк в promo_code стоит NULL: промокод не вводили.

5. **no_winter: 195 → 16.** Второй шаг оставил 16 строк, а ожидали 175: 195 минус 20 заказов по акции. Строки теряет условие promo_code <> 'ЗИМА10'. Заказ 1009 с ВЕСНА15 прошёл, 1001 и 1006 с ЗИМА10 отсеяны по делу, а заказы с NULL пропали вместе с ними.

6. **NULL <> 'ЗИМА10' — не TRUE.** Сравнение с NULL даёт не TRUE и не FALSE, а третье значение — UNKNOWN: неизвестно, отличается ли неизвестный промокод от ЗИМА10. WHERE пропускает только TRUE, поэтому 159 строк с NULL выпали так же, как 20 строк с FALSE.

7. **AND с UNKNOWN.** Логика SQL троичная. Для AND решает один FALSE: FALSE AND UNKNOWN — FALSE. А TRUE AND UNKNOWN — UNKNOWN: ответ зависит от того, что неизвестно.

8. **OR и NOT.** Для OR решает один TRUE: TRUE OR UNKNOWN — TRUE, а FALSE OR UNKNOWN — UNKNOWN. NOT UNKNOWN остаётся UNKNOWN. Строка с NULL не пройдёт ни WHERE p, ни WHERE NOT p.

9. **COALESCE подставляет значение.** COALESCE(promo_code, '') до сравнения заменяет NULL пустой строкой. Пустая строка — обычное значение, '' <> 'ЗИМА10' даёт TRUE. 159 строк вернулись: в no_winter теперь 175.

10. **Отчёт сошёлся.** by_channel по исправленному шагу: 175 заказов и 832 510 ₽. Проверка сходится: 195 − 20 = 175. В первом отчёте было 16 заказов и 94 940 ₽ — без единой ошибки при запуске.

## Идея: шаги с именами и третье значение UNKNOWN

Запрос из вложенных подзапросов выполняется изнутри наружу, и промежуточный результат в нём не увидеть. Конструкция WITH даёт каждому шагу имя и выстраивает шаги сверху вниз, а любой из них можно запустить отдельно, как таблицу, и найти, где пропали строки. Чаще всего строки теряются из-за NULL: сравнение с ним даёт не TRUE и не FALSE, а третье значение UNKNOWN. WHERE пропускает только TRUE, поэтому условие promo_code <> 'ЗИМА10' вместе с акционными заказами молча выбрасывает все заказы без промокода.

Подзапрос в WHERE, FROM и SELECT

Подзапрос — это SELECT в скобках внутри другого запроса. Что он должен вернуть, зависит от места, где он стоит[1].

Где | Что вернуть | Пример на учебной базе

WHERE | одно значение или список для IN | amount > (SELECT AVG(amount) FROM orders WHERE status = 'paid'): 75 из 195 оплаченных заказов дороже среднего чека 4 677 ₽

FROM | таблицу — производную | запрос из сцены: (SELECT * FROM orders WHERE status = 'paid') AS paid

SELECT | одно значение на строку | 100.0 * amount / (SELECT SUM(amount) FROM orders WHERE status = 'paid'): заказ 1191 даёт 2,02% выручки

Подзапрос в SELECT и в сравнении внутри WHERE — скалярный: одна строка и один столбец. Если строк ноль, подставляется NULL, если больше одной, запрос падает с ошибкой «more than one row returned by a subquery used as an expression»[2]. Производной таблице по стандарту нужно имя после AS, хотя PostgreSQL 16 разрешает его опустить[1].

Коррелированный подзапрос и EXISTS

Подзапросы выше не зависят от внешнего запроса и считаются один раз. Коррелированный ссылается на столбец внешней строки и логически выполняется заново для каждой из них. Так находят заказы дороже среднего чека своего же клиента: WHERE o.amount > (SELECT AVG(o2.amount) FROM orders o2 WHERE o2.customer_id = o.customer_id AND o2.status = 'paid'). Среди оплаченных таких 81.

EXISTS (подзапрос) — предикат, то есть условие, которое отвечает TRUE, FALSE или UNKNOWN. EXISTS даёт TRUE, если подзапрос вернул хотя бы одну строку, и FALSE, если ни одной[3]. Что стоит в SELECT подзапроса, неважно, поэтому пишут SELECT 1. Обычно EXISTS коррелирован: EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id AND o.promo_code = 'ЗИМА10') находит 15 клиентов, которые хоть раз вводили код ЗИМА10. UNKNOWN у EXISTS не бывает, поэтому NOT EXISTS — надёжное анти-соединение из 3.2.

CTE: у каждого шага имя

Обобщённое табличное выражение (common table expression, CTE) записывается как WITH имя AS (запрос). Документация PostgreSQL описывает его как временную таблицу, которая существует только в одном запросе[4]. Шагов через запятую может быть сколько угодно, и каждый видит предыдущие по имени.

Результат тот же, что у вложенных подзапросов, меняется форма. Шаги идут сверху вниз в порядке выполнения, у каждого смысловое имя, на шаг можно сослаться дважды без копирования текста. Для отладки главное другое: финальный SELECT можно заменить на SELECT COUNT(*) FROM шаг и увидеть, где число строк разошлось с ожиданием. Маркус Винанд называет такой стиль грамотным SQL (literate SQL)[5].

## Задача: отчёт, который сходится с итогом

Аналитик собирает отчёт по учебной базе: выручка, число заказов и средняя оценка по каналам и по неделям квартала, отдельно — без зимней акции. В заказах есть всё, что ломает такие отчёты. Промокод бывает NULL, пустой строкой или кодом, у 91 оплаченного заказа нет оценки, время заказа хранится меткой времени, и один заказ сделан ровно в полночь.

Задача страницы — писать многошаговые запросы, которые можно читать и проверять по шагам, и не терять строки из-за NULL и типов. Проверка простая: сумма по сегментам совпадает с общим итогом, а число строк на каждом шаге — с ожиданием. Такие отчёты подробно разбирает Кэти Танимура[6].

## Троичная логика: TRUE, FALSE и UNKNOWN

NULL — отметка «значения нет или оно неизвестно», а не значение. Поэтому сравнение с NULL не бывает ни истинным, ни ложным, и SQL отвечает третьим значением UNKNOWN. Это касается и NULL = NULL: два неизвестных значения не обязаны совпадать[7]. Так устроена троичная логика (three-valued logic).

WHERE, ON и HAVING пропускают строку, только если условие дало TRUE: UNKNOWN отбрасывается так же, как FALSE[7]. Логические операторы считают по таблицам истинности[8]. AND даёт FALSE, если хоть одна часть FALSE, OR даёт TRUE, если хоть одна часть TRUE. В остальных случаях UNKNOWN в любой части даёт UNKNOWN, и NOT UNKNOWN — тоже UNKNOWN.

x IN (a, b) раскрывается в x = a OR x = b, а x NOT IN (a, b) — в x <> a AND x <> b. Если в списке есть NULL, одно из неравенств всегда UNKNOWN, и NOT IN не бывает TRUE[3]. Спросить про NULL можно только предикатами IS NULL и IS NOT NULL: они отвечают TRUE или FALSE[9].

В интерактиве шесть оплаченных заказов учебной базы, выбранных запросом SELECT order_id, rating, promo_code FROM orders WHERE order_id IN (1001, 1004, 1008, 1011, 1016, 1083). Расчёт идёт на JavaScript, а каждое условие сверено с PostgreSQL на всех 24 сочетаниях значений rating и promo_code. Сначала предскажите.

COALESCE и NULLIF

COALESCE(x, y, …) возвращает первый аргумент, который не NULL[10]. Он подставляет значение до сравнения, и условие перестаёт давать UNKNOWN: так в сцене вернулись 159 заказов. NULLIF(a, b) делает обратное и возвращает NULL, если a = b, иначе a. Им превращают «пустышку» вроде пустой строки в настоящий NULL и защищают деление: revenue / NULLIF(n, 0) вернёт NULL вместо ошибки деления на ноль.

## Типы: даты, строки, числа

У каждого столбца есть тип: integer, numeric, text, date, timestamp (метка времени), boolean. Значение в кавычках вроде '2026-02-12' — литерал без заданного типа: PostgreSQL приводит его к типу столбца, с которым сравнивает[11]. Явное приведение типов записывают как CAST(x AS тип) или короче, как принято в PostgreSQL: x::тип[2].

Выражение | PostgreSQL 16 | Почему

'2026-02-12'::timestamp | 2026-02-12 00:00:00 | дата без времени — это полночь

created_at::date | 2026-01-02 для заказа 1004 | время отброшено

CAST('4,5' AS numeric) | ошибка invalid input syntax | десятичный разделитель — точка

'10' < '9' | true | строки сравниваются посимвольно

promo_code + 1 | ошибка operator does not exist: text + integer | текст сам в число не превращается

ROUND(4.567::float8, 2) | ошибка function round(double precision, integer) does not exist | округление до знаков есть у numeric, а не у float

'ЗИМА' || NULL | NULL | NULL делает NULL всё выражение, а CONCAT('ЗИМА', NULL) даёт ЗИМА

Для дат есть две главные функции[12]. DATE_TRUNC('week', ts) обрезает метку до начала недели — понедельника, 00:00:00. С 'month' получится первое число месяца, с 'day' — полночь. EXTRACT(поле FROM ts) достаёт число: hour — час, isodow — день недели от 1 (понедельник) до 7, week — номер недели по ISO 8601. Для заказа 1004 от 2 января 2026 года, 23:37, это 2025-12-29 00:00:00, 23, 5 и 1. EXTRACT в PostgreSQL возвращает numeric.

Строковые функции LOWER, TRIM, LENGTH, SUBSTRING пропускают NULL насквозь: LENGTH('') — 0, а LENGTH(NULL) — NULL. Пустая строка — значение, NULL — его отсутствие, и в учебной базе есть оба.

DATE_TRUNC есть в PostgreSQL и DuckDB, а в SQLite его нет. В SQLite нет и отдельного типа для дат: они хранятся строками[13]. Неделю там считают функцией date с модификаторами, а метку времени сравнивают с литералом как текст. Оба отличия показаны запуском в разделе «Код».

## Нюансы: NOT IN, полночь, материализация, пустые строки

NOT IN с NULL в подзапросе возвращает пусто. Ищем клиентов, которые никого не пригласили. NOT IN по referrer_id даёт 0: у 44 клиентов referrer_id — NULL, и неравенство с ним всегда UNKNOWN. NOT EXISTS находит 45[3]. Подзапрос в NOT IN фильтруют условием IS NOT NULL или заменяют на NOT EXISTS[14].

Дата против метки времени. created_at = '2026-02-12' сравнивает с 2026-02-12 00:00:00 и находит один заказ из пяти — 1008, сделанный ровно в полночь. Проверка на таком дне выглядит успешной, и ошибку легко пропустить. BETWEEN с '2026-02-28' по той же причине теряет три заказа 28 февраля после полуночи. Надёжная форма — полуинтервал: created_at >= '2026-02-01' AND created_at < '2026-03-01'.

CTE не всегда материализуется. Материализация — расчёт шага отдельно, с сохранением результата на время запроса. До PostgreSQL 12 так считалась любая CTE[15]. Теперь шаг без побочных эффектов, на который ссылаются один раз, встраивается в основной запрос, а шаг с двумя ссылками считается один раз и сохраняется[4]. Слова MATERIALIZED и NOT MATERIALIZED меняют это решение. В плане запроса ниже встроенная CTE исчезла: остался один проход по orders с обоими фильтрами. С MATERIALIZED появились отдельный шаг «CTE paid» и чтение из него — CTE Scan.

NULLIF для пустой строки. COUNT(promo_code) по оплаченным заказам даёт 36: пять пустых строк — тоже значения. COUNT(NULLIF(promo_code, '')) даёт 31 — столько раз ввели настоящий код.

**NOT IN с NULL в подзапросе против NOT EXISTS**

```sql
-- Клиенты, которые никого не пригласили. referrer_id у 44 клиентов — NULL
SELECT COUNT(*) AS not_in
FROM customers
WHERE customer_id NOT IN (SELECT referrer_id FROM customers);

SELECT COUNT(*) AS not_exists
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM customers r
                  WHERE r.referrer_id = c.customer_id);
```

Вывод:

```
 not_in 
--------
      0
(1 row)

 not_exists 
------------
         45
(1 row)
```

**Дата против метки времени**

```sql
-- 12 февраля: 5 заказов, один из них (1008) ровно в 00:00:00
SELECT COUNT(*) AS eq_literal FROM orders WHERE created_at = '2026-02-12';
SELECT COUNT(*) AS eq_date    FROM orders WHERE created_at::date = '2026-02-12';

-- Февраль: BETWEEN по метке времени обрезает 28-е число на полуночи
SELECT COUNT(*) AS between_ts FROM orders
WHERE created_at BETWEEN '2026-02-01' AND '2026-02-28';
SELECT COUNT(*) AS half_open  FROM orders
WHERE created_at >= '2026-02-01' AND created_at < '2026-03-01';
```

Вывод:

```
 eq_literal 
------------
          1
(1 row)

 eq_date 
---------
       5
(1 row)

 between_ts 
------------
         64
(1 row)

 half_open 
-----------
        67
(1 row)
```

**EXPLAIN: встроенная CTE и MATERIALIZED**

```sql
-- PostgreSQL 12+: CTE, на которую ссылаются один раз, встраивается в запрос
EXPLAIN (COSTS OFF)
WITH paid AS (SELECT * FROM orders WHERE status = 'paid')
SELECT COUNT(*) FROM paid WHERE channel = 'рассылка';

-- MATERIALIZED заставляет посчитать шаг отдельно и сохранить результат
EXPLAIN (COSTS OFF)
WITH paid AS MATERIALIZED (SELECT * FROM orders WHERE status = 'paid')
SELECT COUNT(*) FROM paid WHERE channel = 'рассылка';
```

Вывод:

```
                                 QUERY PLAN                                 
----------------------------------------------------------------------------
 Aggregate
   ->  Seq Scan on orders
         Filter: ((status = 'paid'::text) AND (channel = 'рассылка'::text))
(3 rows)

                  QUERY PLAN                  
----------------------------------------------
 Aggregate
   CTE paid
     ->  Seq Scan on orders
           Filter: (status = 'paid'::text)
   ->  CTE Scan on paid
         Filter: (channel = 'рассылка'::text)
(6 rows)
```

## Ограничения: рекурсия, процедуры, скорость

Страница не касается рекурсивных CTE (WITH RECURSIVE), которыми обходят иерархии вроде цепочки приглашений по referrer_id, и процедурного SQL — функций, циклов и переменных внутри базы. Это тема ДЕ 04. Как база выбирает план и когда помогают индексы, разобрано в ДЕ 03, здесь EXPLAIN нужен только для того, чтобы увидеть, встроилась ли CTE.

Интерактив моделирует правила на шести строках, а не исполняет SQL. Примеры проверены в PostgreSQL 16, SQLite и DuckDB, а MS SQL и BigQuery здесь не показаны.

## Код: отчёт из CTE, потерянные строки, недели

Блоки идут по задаче на той же учебной базе. Первый — отчёт из сцены, уже исправленный, и приём отладки: тот же WITH, но в конце размер каждого шага.

Второй ищет строки, потерянные из-за NULL: группирует по промокоду и значению условия, находит выпавшие строки анти-соединением и сравнивает расчёты по rating с NULL и без них.

COALESCE — не всегда лекарство. AVG(COALESCE(rating, 0)) считает отсутствие оценки нулём, и средняя падает с 4,03 до 2,15. Третий блок — недельный отчёт через DATE_TRUNC с полуинтервалом по датам.

Четвёртый запускает ту же неделю в DuckDB и SQLite из Python.

**Отчёт из трёх CTE и проверка размера каждого шага**

```sql
-- Выручка по каналам без заказов по зимней акции
WITH paid AS (                         -- шаг 1: только оплаченные
  SELECT * FROM orders
  WHERE status = 'paid'
),
no_winter AS (                         -- шаг 2: без ЗИМА10, NULL не теряем
  SELECT * FROM paid
  WHERE COALESCE(promo_code, '') <> 'ЗИМА10'
),
by_channel AS (                        -- шаг 3: метрики канала
  SELECT channel,
         COUNT(*)              AS n,
         SUM(amount)           AS revenue,
         COUNT(rating)         AS rated,
         ROUND(AVG(rating), 2) AS avg_rating
  FROM no_winter
  GROUP BY channel
)
SELECT * FROM by_channel
ORDER BY revenue DESC;

-- Отладка: тот же WITH, но в конце — размер каждого шага
WITH paid AS (SELECT * FROM orders WHERE status = 'paid'),
no_winter AS (SELECT * FROM paid
              WHERE COALESCE(promo_code, '') <> 'ЗИМА10'),
by_channel AS (SELECT channel, COUNT(*) AS n FROM no_winter GROUP BY channel)
SELECT 'paid' AS step, COUNT(*) AS rows FROM paid
UNION ALL SELECT 'no_winter', COUNT(*) FROM no_winter
UNION ALL SELECT 'by_channel', COUNT(*) FROM by_channel;
```

Вывод:

```
 channel  | n  | revenue | rated | avg_rating 
----------+----+---------+-------+------------
 органика | 74 |  399140 |    41 |       3.88
 реклама  | 69 |  284970 |    32 |       4.03
 рассылка | 32 |  148400 |    19 |       4.58
(3 rows)

    step    | rows 
------------+------
 paid       |  195
 no_winter  |  175
 by_channel |    3
(3 rows)
```

**Поиск строк, пропавших из-за NULL**

```sql
-- 1. Каким вышло условие для каждого промокода: t, f или NULL (это UNKNOWN)
SELECT promo_code, promo_code <> 'ЗИМА10' AS cond, COUNT(*) AS n
FROM orders
WHERE status = 'paid'
GROUP BY 1, 2
ORDER BY n;

-- 2. Какие строки выпали из шага: анти-соединение через NOT EXISTS
WITH paid AS (SELECT * FROM orders WHERE status = 'paid'),
no_winter AS (SELECT * FROM paid WHERE promo_code <> 'ЗИМА10')
SELECT p.promo_code, COUNT(*) AS lost
FROM paid p
WHERE NOT EXISTS (SELECT 1 FROM no_winter w
                  WHERE w.order_id = p.order_id)
GROUP BY p.promo_code
ORDER BY lost DESC;

-- 3. rating: у 91 оплаченного заказа оценки нет
SELECT COUNT(*)                          AS paid,
       COUNT(rating)                     AS rated,
       COUNT(*) FILTER (WHERE rating < 4) AS low,
       COUNT(*) FILTER (WHERE COALESCE(rating, 0) < 4) AS low_or_none,
       ROUND(AVG(rating), 2)             AS avg_rated,
       ROUND(AVG(COALESCE(rating, 0)), 2) AS avg_zero
FROM orders
WHERE status = 'paid';
```

Вывод:

```
 promo_code | cond |  n  
------------+------+-----
            | t    |   5
 ВЕСНА15    | t    |  11
 ЗИМА10     | f    |  20
 NULL       | NULL | 159
(4 rows)

 promo_code | lost 
------------+------
 NULL       |  159
 ЗИМА10     |   20
(2 rows)

 paid | rated | low | low_or_none | avg_rated | avg_zero 
------+-------+-----+-------------+-----------+----------
  195 |   104 |  18 |         109 |      4.03 |     2.15
(1 row)
```

**Группировка по неделям через DATE_TRUNC**

```sql
-- Оплаченные заказы по неделям: неделя в PostgreSQL начинается с понедельника
SELECT DATE_TRUNC('week', created_at)::date      AS week,
       EXTRACT(week FROM created_at)             AS iso_week,
       COUNT(*)                                  AS n,
       SUM(amount)                               AS revenue,
       COUNT(NULLIF(promo_code, ''))             AS with_promo,
       ROUND(AVG(rating), 2)                     AS avg_rating
FROM orders
WHERE status = 'paid'
  AND created_at >= '2026-01-01'
  AND created_at <  '2026-04-01'               -- полуинтервал: весь март, без BETWEEN
GROUP BY 1, 2
ORDER BY 1;
```

Вывод:

```
    week    | iso_week | n  | revenue | with_promo | avg_rating 
------------+----------+----+---------+------------+------------
 2025-12-29 |        1 |  9 |   34940 |          0 |       3.67
 2026-01-05 |        2 |  7 |   22040 |          0 |       4.40
 2026-01-12 |        3 |  8 |   62130 |          3 |       3.33
 2026-01-19 |        4 |  9 |   26880 |          4 |       3.33
 2026-01-26 |        5 |  6 |   30440 |          2 |       3.50
 2026-02-02 |        6 |  9 |   39760 |          0 |       4.57
 2026-02-09 |        7 | 11 |   63600 |          1 |       3.90
 2026-02-16 |        8 | 20 |   91260 |          6 |       4.00
 2026-02-23 |        9 | 22 |  102760 |          5 |       4.00
 2026-03-02 |       10 | 20 |   94040 |          4 |       4.00
 2026-03-09 |       11 | 18 |   85990 |          2 |       4.42
 2026-03-16 |       12 | 27 |  120110 |          4 |       4.55
 2026-03-23 |       13 | 22 |  104910 |          0 |       3.70
 2026-03-30 |       14 |  7 |   33220 |          0 |       4.00
(14 rows)
```

**Та же неделя в DuckDB и SQLite**

```python
import sqlite3, duckdb

lite = sqlite3.connect("data/shop/shop.sqlite")                  # SQLite 3.53.1: даты — строки
duck = duckdb.connect("data/shop/shop.duckdb", read_only=True)   # DuckDB 2.0.0: TIMESTAMP

try:
    lite.execute("SELECT DATE_TRUNC('week', created_at) FROM orders")
except sqlite3.OperationalError as e:
    print("SQLite:", e)

# Замена в SQLite: отступить на 6 дней и дойти до ближайшего понедельника
lite_week = """
SELECT date(created_at, '-6 days', 'weekday 1') AS week,
       strftime('%W', created_at) AS w, COUNT(*) AS n
FROM orders WHERE status = 'paid'
GROUP BY 1 ORDER BY 1 LIMIT 3"""
duck_week = """
SELECT DATE_TRUNC('week', created_at)::DATE AS week, COUNT(*) AS n
FROM orders WHERE status = 'paid'
GROUP BY 1 ORDER BY 1 LIMIT 3"""
print("SQLite:", lite.execute(lite_week).fetchall())
print("DuckDB:", duck.sql(duck_week).fetchall())

# Строка против метки времени: заказ 1008 создан 2026-02-12 00:00:00
q = "SELECT COUNT(*) FROM orders WHERE created_at = '2026-02-12'"
print("created_at = '2026-02-12':",
      "SQLite", lite.execute(q).fetchall()[0][0],     # сравнение строк
      "| DuckDB", duck.sql(q).fetchall()[0][0])       # строка → TIMESTAMP
```

Вывод:

```
SQLite: no such function: DATE_TRUNC
SQLite: [('2025-12-29', '00', 9), ('2026-01-05', '01', 7), ('2026-01-12', '02', 8)]
DuckDB: [(datetime.date(2025, 12, 29), 9), (datetime.date(2026, 1, 5), 7), (datetime.date(2026, 1, 12), 8)]
created_at = '2026-02-12': SQLite 0 | DuckDB 1
```

## Вопросы для самопроверки

1. У заказа 1011 rating = NULL. Пройдёт ли он условие WHERE rating >= 4 OR NOT (rating >= 4)?
   А) Да: одна из двух частей всегда истинна
   Б) Нет: обе части дают UNKNOWN, и OR тоже даёт UNKNOWN
   В) Да: NOT превращает UNKNOWN в TRUE
   Г) Запрос упадёт с ошибкой сравнения с NULL

2. В сцене шаг no_winter оставил 16 строк из 195. Почему пропали 159 заказов без промокода?
   А) Условие promo_code <> 'ЗИМА10' дало для них FALSE
   Б) Условие дало UNKNOWN, а WHERE пропускает только TRUE
   В) WITH не передаёт NULL из шага в шаг
   Г) GROUP BY в by_channel выбросил группу NULL

3. SELECT COUNT(*) FROM customers WHERE customer_id NOT IN (SELECT referrer_id FROM customers) вернул 0, хотя многие клиенты никого не приглашали. Почему?
   А) NOT IN не работает с подзапросами
   Б) Подзапрос вернул и NULL: customer_id <> NULL — UNKNOWN, и цепочка AND ни для одной строки не стала TRUE
   В) Подзапрос вернул пустой список
   Г) customer_id и referrer_id разных типов

4. Чем CTE лучше того же запроса с вложенными подзапросами в FROM?
   А) CTE всегда быстрее: результат шага сохраняется
   Б) Шаги стоят сверху вниз в порядке выполнения, у каждого имя, любой можно запустить отдельно и сослаться на него дважды
   В) CTE сохраняется в базе и доступна другим запросам
   Г) Только в CTE можно использовать GROUP BY

5. В PostgreSQL created_at — метка времени. Допустим, в таблице есть 12 заказов за 4 ноября 2026 года, и ни одного ровно в полночь. Что вернёт SELECT COUNT(*) FROM orders WHERE created_at = '2026-11-04'?
   А) 12 — все заказы за этот день
   Б) 0 — строка стала меткой 2026-11-04 00:00:00, и равенство ищет только полночь
   В) Ошибку: строку нельзя сравнить с меткой времени
   Г) Заказы до полудня

6. Заказ 1004 сделан в пятницу, 2 января 2026 года, в 23:37. В какую строку отчёта по неделям он попадёт?

```
SELECT DATE_TRUNC('week', created_at)::date AS week, COUNT(*) AS n
FROM orders WHERE status = 'paid'
GROUP BY 1 ORDER BY 1;
```
   А) 2026-01-01 — неделя года начинается с 1 января
   Б) 2025-12-29 — понедельник той недели, где лежит 2 января
   В) 2026-01-05 — первый понедельник 2026 года
   Г) 2026-01-02 — DATE_TRUNC отрезает только время

7. COUNT(promo_code) по оплаченным заказам дал 36, хотя настоящий промокод ввели 31 раз. Как посчитать правильно?
   А) COUNT(COALESCE(promo_code, ''))
   Б) COUNT(NULLIF(promo_code, ''))
   В) COUNT(DISTINCT promo_code)
   Г) COUNT(*) с условием WHERE promo_code IS NOT NULL

## Глоссарий

- **Анти-соединение** (anti-join) — выбор строк одной таблицы, для которых в другой нет пары: NOT EXISTS или LEFT JOIN … IS NULL.
- **Коррелированный подзапрос** (correlated subquery) — подзапрос, который ссылается на столбцы внешнего запроса и логически выполняется заново для каждой его строки.
- **Литерал** (literal) — значение, записанное прямо в тексте запроса: 4, 'ЗИМА10', '2026-02-12'.
- **Материализация** (materialization) — расчёт шага CTE отдельно, с сохранением результата на время запроса.
- **Метка времени** (timestamp) — тип с датой и временем до долей секунды: 2026-02-12 00:00:00.
- **Обобщённое табличное выражение** (common table expression, CTE) — именованный шаг запроса WITH имя AS (…): временная таблица, которая живёт только внутри одного запроса.
- **План запроса** (query plan, EXPLAIN) — описание того, как база выполнит запрос: что и в каком порядке читает. Его печатает EXPLAIN.
- **Подзапрос** (subquery) — запрос SELECT в скобках внутри другого запроса: в WHERE, FROM или SELECT.
- **Полуинтервал** (half-open interval) — условие «от включительно, до исключительно»: created_at >= начало AND created_at < следующий день.
- **Предикат** (predicate) — выражение, которое отвечает TRUE, FALSE или UNKNOWN: условие в WHERE, ON, HAVING.
- **Приведение типов** (type cast, CAST) — перевод значения в другой тип: CAST(x AS integer) или в PostgreSQL x::integer.
- **Производная таблица** (derived table) — подзапрос в FROM: его результат используется как обычная таблица.
- **Скалярный подзапрос** (scalar subquery) — подзапрос, который возвращает одно значение: одну строку и один столбец.
- **Троичная логика** (three-valued logic) — логика с тремя значениями TRUE, FALSE и UNKNOWN, по которой SQL вычисляет AND, OR и NOT.
- **COALESCE** — функция, которая возвращает первый аргумент, не равный NULL: COALESCE(promo_code, '').
- **DATE_TRUNC** — функция, которая обрезает метку времени до начала периода: недели, месяца, дня.
- **EXISTS** — предикат: TRUE, если подзапрос вернул хотя бы одну строку, иначе FALSE. UNKNOWN не бывает.
- **EXTRACT** — функция, которая достаёт из даты число: час, день недели, номер недели.
- **NULL** — отметка «значения нет или оно неизвестно». Это не ноль и не пустая строка, а отсутствие значения.
- **NULLIF** — функция NULLIF(a, b): NULL, если a = b, иначе a. Превращает «пустышку» вроде '' в настоящий NULL.
- **UNKNOWN** — третье логическое значение SQL, которое дают сравнения с NULL. WHERE отбрасывает его так же, как FALSE.

## Источники

1. PostgreSQL Documentation. Table Expressions, раздел 7.2.1.3 Subqueries. Подзапрос в FROM и необязательное в PostgreSQL имя производной таблицы. https://www.postgresql.org/docs/current/queries-table-expressions.html
2. PostgreSQL Documentation. Value Expressions. Скалярные подзапросы и запись приведения типов CAST и ::. https://www.postgresql.org/docs/current/sql-expressions.html
3. PostgreSQL Documentation. Subquery Expressions. EXISTS, IN и NOT IN, в том числе что они возвращают при NULL. https://www.postgresql.org/docs/current/functions-subquery.html
4. PostgreSQL Documentation. WITH Queries (Common Table Expressions). CTE как временные таблицы одного запроса, MATERIALIZED и NOT MATERIALIZED. https://www.postgresql.org/docs/current/queries-with.html
5. Winand M. Modern SQL: Literate SQL и WITH Clause. Почему цепочка именованных шагов читается легче вложенных подзапросов. https://modern-sql.com/use-case/literate-sql https://modern-sql.com/feature/with
6. Tanimura C. SQL for Data Analysis. O’Reilly, 2021. Подготовка данных с NULL и приведением типов, временные ряды по неделям и месяцам.
7. Winand M. Modern SQL: The Three-Valued Logic of SQL. UNKNOWN, правило «WHERE пропускает только TRUE» и ловушка NOT IN. https://modern-sql.com/concept/three-valued-logic
8. PostgreSQL Documentation. Logical Operators. Таблицы истинности AND, OR и NOT с NULL. https://www.postgresql.org/docs/current/functions-logical.html
9. PostgreSQL Documentation. Comparison Functions and Operators. IS NULL и IS NOT NULL, сравнения с NULL. https://www.postgresql.org/docs/current/functions-comparison.html
10. PostgreSQL Documentation. Conditional Expressions. COALESCE и NULLIF. https://www.postgresql.org/docs/current/functions-conditional.html
11. PostgreSQL Documentation. Type Conversion. Как литерал без типа приводится к типу столбца. https://www.postgresql.org/docs/current/typeconv.html
12. PostgreSQL Documentation. Date/Time Functions and Operators. DATE_TRUNC, EXTRACT и недели по ISO 8601. https://www.postgresql.org/docs/current/functions-datetime.html
13. SQLite. Date And Time Functions. Даты как строки, модификатор weekday и формат %W. https://www.sqlite.org/lang_datefunc.html
14. Molinaro A., de Graaf R. SQL Cookbook, 2nd ed. O’Reilly, 2020. Рецепты поиска строк одной таблицы, которых нет в другой, и разбор NOT IN при NULL.
15. PostgreSQL. Release 12. С этой версии CTE встраиваются в запрос, раньше они всегда считались отдельно. https://www.postgresql.org/docs/12/release-12.html