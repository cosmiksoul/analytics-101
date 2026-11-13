# Оконные функции

Аналитика 101 · блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.5.

После страницы вы посчитаете ранги, нарастающие итоги, паузы между покупками и скользящие средние одним запросом, не потеряв ни одной строки, и будете знать, какие строки видит оконная функция в каждой строке результата.

## Анимация по шагам

1. **12 заказов четырёх клиентов.** Учебная база магазина: оплаченные заказы клиентов 101, 143, 146 и 157 за январь–март 2026. Строки идут по дате, клиенты вперемешку. Рядом с заказом нужны его номер у клиента, сумма покупок клиента на этот день и дата прошлого заказа.

2. **GROUP BY схлопывает строки.** GROUP BY customer_id сворачивает заказы клиента в одну строку: из 12 строк остаётся 4, у каждой — сумма. Итог есть, но даты и суммы заказов пропали.

3. **PARTITION BY делит, но не схлопывает.** Окно с PARTITION BY customer_id раскладывает те же строки по четырём секциям, по одной на клиента. Все 12 строк остаются на месте. Функция будет считать по секции, а ответ запишет в каждую её строку.

4. **ORDER BY выстраивает секцию.** ORDER BY order_date задаёт порядок внутри секции: у клиента 101 сначала 29 января, потом 20 и 28 марта. Порядок нужен функциям, которые спрашивают «какая я по счёту» и «кто передо мной».

5. **ROW_NUMBER: номер в секции.** Окно едет по строкам. ROW_NUMBER() ставит каждой строке её номер в секции: 1, 2, 3. На границе секции счёт начинается заново: первый заказ клиента 143 снова получает 1.

6. **Нарастающий итог: рамка растёт.** SUM(amount) с ORDER BY складывает строки рамки: от начала секции до текущей строки. С каждым шагом рамка становится на строку длиннее. У второго заказа клиента 101: 6 770 + 2 630 = 9 400.

7. **Последняя строка — итог клиента.** В последней строке секции рамка накрыла её целиком, и нарастающий итог совпал с суммой из GROUP BY: 15 250, 14 790, 7 570, 9 480. Итог тот же, но стоит рядом с заказами, а не вместо них.

8. **LAG: дата прошлого заказа.** LAG(order_date) берёт дату из предыдущей строки той же секции. У первого заказа клиента предыдущей строки нет, и LAG возвращает NULL — пустое значение.

9. **Разность — дни между заказами.** Разность двух дат в PostgreSQL — число дней. order_date − LAG(order_date) даёт паузу между покупками: клиент 143 вернулся через день, а потом через 35 дней.

10. **12 строк вошло — 12 вышло.** Три оконных столбца встали рядом с исходными, и ни одна строка не пропала. GROUP BY дал бы 4 строки. Все три функции смотрят в одно окно, и его можно описать один раз в WINDOW.

## Идея: строки остаются, функция видит соседей

Оконная функция считает значение для каждой строки по связанным с ней строкам и, в отличие от GROUP BY, не схлопывает их: сколько строк вошло в запрос, столько и вышло. Какие строки связаны с текущей, описывает окно в скобках после OVER. PARTITION BY делит таблицу на секции, ORDER BY выстраивает строки внутри секции, а рамка выбирает из секции строки для текущей, например всё от начала секции до неё самой. Так рядом с каждым заказом в одном запросе появляются его номер у клиента, нарастающий итог и дата прошлой покупки.

Где в запросе живёт окно

Вызов состоит из функции, слова OVER и трёх необязательных частей в скобках[2]:

функция(…) OVER (PARTITION BY … ORDER BY … рамка)

секция · порядок внутри секции · какие строки секции брать для текущей

Пустые скобки OVER () делают всю таблицу одной секцией. Окна считаются после WHERE, GROUP BY и HAVING, но до финальных ORDER BY и LIMIT[1]. В порядке выполнения из 3.1 это значит, что окно видит только строки, пережившие фильтры, а сами оконные функции разрешены лишь в SELECT и ORDER BY. Если несколько функций смотрят в одно окно, его описывают один раз в предложении WINDOW и ссылаются по имени: OVER w[4].

Ранжирование: ROW_NUMBER, RANK, DENSE_RANK

Три функции нумеруют строки секции по порядку ORDER BY и расходятся только на равных строках (peers) — тех, что ORDER BY не различает[3]. ROW_NUMBER даёт всем разные номера, и кому из равных достанется меньший, база не обещает. RANK ставит равным одно место и пропускает следующие, DENSE_RANK не пропускает. Вот семь самых крупных заказов из выборки интерактива:

amount | ROW_NUMBER | RANK | DENSE_RANK

10 020 | 1 | 1 | 1

8 030 | 2 | 2 | 2

7 480 | 3 | 3 | 3

3 340 | 4 | 4 | 4

2 500 | 5 | 5 | 5

2 500 | 6 | 5 | 5

1 120 | 7 | 7 | 6

Отсюда задача «топ-3 в каждой категории»: ранг считают с PARTITION BY category и оставляют строки с рангом не больше трёх. Выбор функции — это решение о ничьих: ROW_NUMBER режет ровно по три строки, DENSE_RANK может вернуть больше.

Соседи: LAG и LEAD

LAG(значение, N, запасное) берёт значение из строки на N позиций раньше в той же секции, LEAD — позже. По умолчанию N = 1, а запасное значение — NULL[3]. Так сравнивают с прошлым периодом. Выручка учебного магазина по месяцам — 173 900, 278 950 и 459 230 ₽, и LAG(revenue) OVER (ORDER BY month) ставит рядом с каждым месяцем прошлый: февраль вырос на 60,4%, март — на 64,6%. У января прошлого месяца нет, там NULL.

Агрегаты по окну: доля, итог, скользящее среднее

SUM, AVG и COUNT с OVER остаются агрегатами, но считают по рамке текущей строки и пишут ответ в каждую строку[3]. Без ORDER BY рамка — вся секция, и итог группы встаёт рядом с деталями. Так считают долю от суммы группы: amount / SUM(amount) OVER (PARTITION BY channel). В выборке интерактива заказ 1153 на 8 030 ₽ — это 83,6% выручки рассылки за неделю.

С ORDER BY та же сумма становится нарастающим итогом: рамка тянется от начала секции до текущей строки. А рамка постоянной длины, которая едет вместе со строкой, даёт скользящее среднее: AVG(revenue) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) — среднее текущей строки и шести предыдущих.

Последняя запись по ключу

Из журнала статусов часто нужна одна строка на заказ, самая свежая. Это дедупликация: ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY changed_at DESC) ставит единицу последней записи каждого заказа, и остаётся оставить строки с номером 1. Фильтруют уровнем выше, в CTE или подзапросе: в WHERE оконной функции ещё нет[1].

То же в pandas

В темах 01–02 те же операции делались в pandas, и соответствие почти прямое[10]:

SQL | pandas

SUM(amount) OVER (PARTITION BY channel) | groupby("channel")["amount"].transform("sum")

SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) | groupby("customer_id")["amount"].cumsum() после сортировки по дате

LAG(order_date) OVER (…) | groupby("customer_id")["order_date"].shift()

ROWS BETWEEN 6 PRECEDING AND CURRENT ROW | rolling(7)

RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW | rolling("7D") по индексу из дат

ROW_NUMBER, RANK, DENSE_RANK | rank(method=…): "first", "min", "dense"

pandas идёт по строкам в том порядке, в каком они лежат, а SQL — только по ORDER BY внутри OVER.

## Задача: четыре отчёта по учебной базе

Учебная база магазина товаров для дома за январь–март 2026 — та же, что на страницах 3.1–3.4: заказы, позиции заказов, товары и журнал статусов. Данные сгенерированы для учебника. По ним нужны четыре отчёта:

удержание: сколько клиентов купили второй раз и через сколько дней;

выручка по дням, сглаженная средним за семь дней, хотя в некоторые дни заказов не было;

три самых продаваемых товара в каждой категории;

текущий статус каждого заказа по журналу, где у заказа две или три записи.

Каждый отчёт сравнивает строку с её группой или соседями, а GROUP BY оставит по строке на группу. Без окон пришлось бы соединять таблицу саму с собой (3.2) или писать коррелированный подзапрос (3.4), а это длинно и медленно. Оконная функция решает каждую задачу одним проходом по отсортированной секции — так эти отчёты строят в книгах по аналитическому SQL[6],[7].

## Рамка: какие строки секции видит функция

Рамку пишут после ORDER BY: режим и две границы, ROWS BETWEEN начало AND конец. Граница — это UNBOUNDED PRECEDING (начало секции), N PRECEDING (N назад), CURRENT ROW, N FOLLOWING (N вперёд) или UNBOUNDED FOLLOWING (конец секции)[2].

Два режима по-разному считают «назад» и «вперёд». ROWS отсчитывает строки: 2 PRECEDING — две строки выше, какие бы там ни были даты. RANGE отсчитывает значения ORDER BY: RANGE BETWEEN INTERVAL '2 days' PRECEDING AND CURRENT ROW берёт все строки с датой не раньше, чем за два дня до текущей. Поэтому для RANGE со смещением ORDER BY должен состоять ровно из одного столбца, а смещение по дате пишут интервалом. На RANGE BETWEEN 1 PRECEDING по дате PostgreSQL отвечает ошибкой «not supported for column type date and offset type integer».

Главное различие — в CURRENT ROW. В ROWS это сама строка, в RANGE — все равные ей по ORDER BY[2]. Если рамку не написать, при ORDER BY она равна RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW и захватывает строки с той же датой, а без ORDER BY рамка — вся секция. ROW_NUMBER, RANK, DENSE_RANK, LAG и LEAD рамку не читают: они смотрят на всю секцию в порядке ORDER BY[3].

Ниже — 11 оплаченных заказов бренда «Сова» за 1–7 марта: WHERE status = 'paid' AND brand = 'Сова' AND order_date BETWEEN '2026-03-01' AND '2026-03-07'. 1 и 6 марта было по три заказа, 4 и 7 марта — по два, а 2 и 3 марта заказов не было. Сначала предскажите.

Строки в интерактиве стоят так, как их видит окно: по секциям и в порядке ORDER BY. Равные строки PostgreSQL ставит как вышло при сортировке, и документация предупреждает, что ROWS на неуникальном порядке непредсказуем[4]. Звёздочка отмечает строки, где от этого зависит ответ. Все сочетания настроек сверены с PostgreSQL 16 на этой выборке, включая ошибки.

## Нюансы: равные даты, WHERE и ничьи в рангах

Рамка по умолчанию захватывает равные строки. SUM(amount) OVER (ORDER BY order_date) — это RANGE до текущей строки, и у трёх заказов 1 марта итог одинаковый: 4 070 ₽. Замена на ROWS не лечит, а прячет ошибку: равные даты база расставляет как удобно. В блоке ниже нарастающий итог 4 и 6 марта сначала убывает, а после добавления соседнего столбца растёт ровно, хотя данные те же. Надёжно одно — дописать в ORDER BY уникальный столбец: ORDER BY order_date, order_id.

Оконную функцию нельзя в WHERE. WHERE выполняется раньше окон, и PostgreSQL отвечает «window functions are not allowed in WHERE»[1]. То же в HAVING и GROUP BY. Окно считают в CTE, а фильтруют снаружи: так ниже найдены заказы дороже среднего по своему каналу.

Ничьи в RANK. Равные строки получают у RANK и DENSE_RANK одно место[3], и фильтр «ранг не больше 3» может вернуть больше трёх строк. В учебной базе два товара посуды продали по 21 штуке и делят второе место, поэтому DENSE_RANK оставляет в топе четыре товара. ROW_NUMBER вернёт ровно три, но кого из равных выбросить, решит порядок сортировки, если не добавить в ORDER BY второй ключ. Разбор — в разделе «Код».

**Равные даты: рамка по умолчанию и ROWS дают разные итоги**

```sql
-- 1. Рамка по умолчанию и ROWS на равных датах
SELECT order_id, order_date, amount,
       SUM(amount) OVER (ORDER BY order_date) AS by_default,   -- рамка по умолчанию: RANGE
       SUM(amount) OVER (ORDER BY order_date
                         ROWS UNBOUNDED PRECEDING) AS by_rows   -- рамка ROWS, порядок не уникален
FROM orders
WHERE status = 'paid' AND brand = 'Сова'
  AND order_date BETWEEN '2026-03-01' AND '2026-03-07'
ORDER BY order_date, order_id;

-- 2. Тот же by_rows рядом с окном, где есть order_id
SELECT order_id, order_date, amount,
       SUM(amount) OVER (ORDER BY order_date
                         ROWS UNBOUNDED PRECEDING) AS by_rows,
       SUM(amount) OVER (ORDER BY order_date, order_id) AS by_date_id  -- order_id разводит равные даты
FROM orders
WHERE status = 'paid' AND brand = 'Сова'
  AND order_date BETWEEN '2026-03-01' AND '2026-03-07'
ORDER BY order_date, order_id;
```

Вывод:

```
 order_id | order_date | amount | by_default | by_rows 
----------+------------+--------+------------+---------
     1053 | 2026-03-01 |   1120 |       4070 |    1120
     1168 | 2026-03-01 |    450 |       4070 |    1570
     1187 | 2026-03-01 |   2500 |       4070 |    4070
     1152 | 2026-03-04 |   1120 |      15210 |   15210
     1169 | 2026-03-04 |  10020 |      15210 |   14090
     1209 | 2026-03-05 |   1120 |      16330 |   16330
     1071 | 2026-03-06 |   7480 |      34340 |   34340
     1153 | 2026-03-06 |   8030 |      34340 |   26860
     1181 | 2026-03-06 |   2500 |      34340 |   18830
     1154 | 2026-03-07 |    450 |      38130 |   34790
     1188 | 2026-03-07 |   3340 |      38130 |   38130
(11 rows)

 order_id | order_date | amount | by_rows | by_date_id 
----------+------------+--------+---------+------------
     1053 | 2026-03-01 |   1120 |    1120 |       1120
     1168 | 2026-03-01 |    450 |    1570 |       1570
     1187 | 2026-03-01 |   2500 |    4070 |       4070
     1152 | 2026-03-04 |   1120 |    5190 |       5190
     1169 | 2026-03-04 |  10020 |   15210 |      15210
     1209 | 2026-03-05 |   1120 |   16330 |      16330
     1071 | 2026-03-06 |   7480 |   23810 |      23810
     1153 | 2026-03-06 |   8030 |   31840 |      31840
     1181 | 2026-03-06 |   2500 |   34340 |      34340
     1154 | 2026-03-07 |    450 |   34790 |      34790
     1188 | 2026-03-07 |   3340 |   38130 |      38130
(11 rows)
```

**Окно в WHERE — ошибка, окно в CTE — работает**

```sql
-- 1. Окно прямо в WHERE
SELECT order_id, channel, amount
FROM orders
WHERE status = 'paid' AND brand = 'Сова'
  AND order_date BETWEEN '2026-03-01' AND '2026-03-07'
  AND amount > AVG(amount) OVER (PARTITION BY channel);

-- 2. Окно в CTE, фильтр снаружи
WITH s AS (
  SELECT order_id, channel, amount,
         ROUND(AVG(amount) OVER (PARTITION BY channel)) AS channel_avg,
         ROUND(100.0 * amount / SUM(amount) OVER (PARTITION BY channel), 1) AS share_pct
  FROM orders
  WHERE status = 'paid' AND brand = 'Сова'
    AND order_date BETWEEN '2026-03-01' AND '2026-03-07'
)
SELECT * FROM s
WHERE amount > channel_avg              -- здесь окно уже посчитано
ORDER BY channel, amount DESC;
```

Вывод:

```
ERROR:  window functions are not allowed in WHERE
LINE 6:   AND amount > AVG(amount) OVER (PARTITION BY channel);
                       ^

 order_id | channel  | amount | channel_avg | share_pct 
----------+----------+--------+-------------+-----------
     1188 | органика |   3340 |        1637 |      68.0
     1153 | рассылка |   8030 |        3200 |      83.6
     1169 | реклама  |  10020 |        4724 |      42.4
     1071 | реклама  |   7480 |        4724 |      31.7
(4 rows)
```

## Ограничения: окно сортирует секцию целиком

Чтобы посчитать окно, база сортирует строки по PARTITION BY и ORDER BY и проходит по отсортированному. Каждое новое окно — новая сортировка. В учебной базе план запроса с тремя функциями на двух разных окнах показывает два узла Sort и два WindowAgg. На двух сотнях строк это незаметно, на сотнях миллионов сортировка займёт минуты и память.

Функции с одинаковым окном считаются за одну сортировку: описывайте его один раз в WINDOW.

WHERE до окна уменьшает сортировку. Исключение — фильтр по датам у скользящего среднего: он стоит снаружи, иначе окно потеряет предыдущие дни.

Как индекс избавляет от сортировки и как читать план — в блоке «Дата инженерия», тема 03.

## Код: удержание, скользящее среднее, топ-3, последняя версия

Запросы запущены в PostgreSQL 16 на учебной базе, вывод — как в psql. Первый блок ставит рядом с заказом паузу с прошлой покупки, а потом по когортам месяца первой покупки считает, сколько клиентов вернулись. FILTER — короткая запись условного агрегата из 3.3: COUNT(*) FILTER (WHERE n = 2) равно COUNT(CASE WHEN n = 2 THEN 1 END)[5].

Второй сглаживает выручку по дням. 24 и 26–28 января заказов не было, поэтому «семь строк» и «семь дней» — разные окна.

Третий выбирает топ-3 товаров по штукам в каждой категории и показывает, как три функции ранжирования расходятся на ничьей.

Четвёртый берёт последнюю версию каждого заказа из журнала и сверяет её с orders.status. Рядом окно без ORDER BY: BOOL_OR(status = 'paid') OVER (PARTITION BY order_id) смотрит на всю историю заказа и отвечает, был ли он когда-нибудь оплачен.

В DuckDB тот же фильтр пишут без CTE: предложение QUALIFY фильтрует по оконной функции, как HAVING по агрегату[9]. В PostgreSQL QUALIFY нет — это различие диалектов, и код ниже отправляет один запрос в обе базы.

Последовательный разбор аналитических функций — у Болье[8].

**Удержание через LAG: кто вернулся и через сколько дней**

```sql
-- 1. Пауза между заказами у клиентов из сцены
SELECT customer_id, order_date,
       ROW_NUMBER() OVER w AS n,                         -- какой по счёту заказ клиента
       order_date - LAG(order_date) OVER w AS gap_days   -- дней с прошлого заказа
FROM orders
WHERE status = 'paid' AND customer_id IN (101, 143, 146, 157)
WINDOW w AS (PARTITION BY customer_id ORDER BY order_date, order_id)
ORDER BY customer_id, n;

-- 2. Повторная покупка по когортам первого заказа
WITH seq AS (
  SELECT customer_id, order_date,
         ROW_NUMBER() OVER w AS n,
         order_date - LAG(order_date) OVER w AS gap_days,
         MIN(order_date) OVER (PARTITION BY customer_id) AS first_date
  FROM orders
  WHERE status = 'paid'
  WINDOW w AS (PARTITION BY customer_id ORDER BY order_date, order_id)
)
SELECT DATE_TRUNC('month', first_date)::date AS cohort,
       COUNT(*) FILTER (WHERE n = 1) AS customers,
       COUNT(*) FILTER (WHERE n = 2) AS repeat_any,
       COUNT(*) FILTER (WHERE n = 2 AND gap_days <= 30) AS repeat_30d,
       ROUND(AVG(gap_days) FILTER (WHERE n = 2), 1) AS days_to_2nd
FROM seq
GROUP BY cohort
ORDER BY cohort;
```

Вывод:

```
 customer_id | order_date | n | gap_days 
-------------+------------+---+----------
         101 | 2026-01-29 | 1 |     NULL
         101 | 2026-03-20 | 2 |       50
         101 | 2026-03-28 | 3 |        8
         143 | 2026-02-15 | 1 |     NULL
         143 | 2026-02-16 | 2 |        1
         143 | 2026-03-23 | 3 |       35
         146 | 2026-03-01 | 1 |     NULL
         146 | 2026-03-07 | 2 |        6
         146 | 2026-03-20 | 3 |       13
         157 | 2026-03-11 | 1 |     NULL
         157 | 2026-03-24 | 2 |       13
         157 | 2026-03-27 | 3 |        3
(12 rows)

   cohort   | customers | repeat_any | repeat_30d | days_to_2nd 
------------+-----------+------------+------------+-------------
 2026-01-01 |        15 |         13 |         11 |        10.8
 2026-02-01 |        19 |         14 |         10 |        14.9
 2026-03-01 |        17 |          8 |          8 |         7.4
(3 rows)
```

**Скользящее среднее за 7 дней: ROWS считает строки, RANGE — дни**

```sql
WITH daily AS (                          -- выручка только за дни, когда были заказы
  SELECT order_date AS day, SUM(amount) AS revenue
  FROM orders
  WHERE status = 'paid'
  GROUP BY order_date
), moving AS (
  SELECT day, revenue,
         MIN(day) OVER last7rows AS rows_from,       -- где на деле начались «7 строк»
         ROUND(AVG(revenue) OVER last7rows) AS avg_7rows,
         COUNT(*) OVER last7days AS days_with_orders,
         ROUND(SUM(revenue) OVER last7days / 7.0) AS avg_7days
  FROM daily
  WINDOW last7rows AS (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW),
         last7days AS (ORDER BY day RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW)
)
SELECT * FROM moving
WHERE day BETWEEN '2026-01-25' AND '2026-02-01'   -- фильтр снаружи: окно видело все дни
ORDER BY day;
```

Вывод:

```
    day     | revenue | rows_from  | avg_7rows | days_with_orders | avg_7days 
------------+---------+------------+-----------+------------------+-----------
 2026-01-25 |   22990 | 2026-01-14 |      7730 |                4 |      3840
 2026-01-29 |   17700 | 2026-01-17 |      8466 |                3 |      6143
 2026-01-30 |    3340 | 2026-01-18 |      7580 |                3 |      6290
 2026-01-31 |    6870 | 2026-01-20 |      7827 |                4 |      7271
 2026-02-01 |    2530 | 2026-01-22 |      8020 |                4 |      4349
(5 rows)
```

**Топ-3 по штукам: на ничьей три функции дают разный топ**

```sql
WITH sales AS (                          -- штуки и выручка по товару, только оплаченные заказы
  SELECT p.category, p.product_name,
         SUM(oi.qty) AS units, SUM(oi.qty * oi.price) AS revenue
  FROM order_items AS oi
  JOIN orders   AS o ON o.order_id = oi.order_id
  JOIN products AS p ON p.product_id = oi.product_id
  WHERE o.status = 'paid'
  GROUP BY p.category, p.product_name
), ranked AS (
  SELECT category, product_name, units,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY units DESC, revenue DESC) AS rn,
         RANK()       OVER w AS rnk,
         DENSE_RANK() OVER w AS drnk
  FROM sales
  WINDOW w AS (PARTITION BY category ORDER BY units DESC)
)
SELECT * FROM ranked
WHERE drnk <= 3                          -- самый широкий из трёх фильтров
ORDER BY category, rn;
```

Вывод:

```
 category |      product_name       | units | rn | rnk | drnk 
----------+-------------------------+-------+----+-----+------
 декор    | Ваза «Сова»             |    18 |  1 |   1 |    1
 декор    | Ваза «Бриз»             |    16 |  2 |   2 |    2
 декор    | Свеча «Сова»            |    15 |  3 |   3 |    3
 посуда   | Чайник «Бриз»           |    23 |  1 |   1 |    1
 посуда   | Чайник «Сова»           |    21 |  2 |   2 |    2
 посуда   | Кружка «Сова»           |    21 |  3 |   2 |    2
 посуда   | Чайник «Кедр»           |    20 |  4 |   4 |    3
 свет     | Гирлянда «Сова»         |    21 |  1 |   1 |    1
 свет     | Лампа настольная «Бриз» |    19 |  2 |   2 |    2
 свет     | Гирлянда «Кедр»         |    15 |  3 |   3 |    3
 текстиль | Плед «Сова»             |    26 |  1 |   1 |    1
 текстиль | Наволочка «Сова»        |    22 |  2 |   2 |    2
 текстиль | Наволочка «Бриз»        |    20 |  3 |   3 |    3
(13 rows)
```

**Последняя версия записи: ROW_NUMBER по журналу, фильтр снаружи**

```sql
WITH ranked AS (
  SELECT order_id, status, changed_at,
         ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY changed_at DESC) AS rn,  -- 1 = самая свежая запись
         BOOL_OR(status = 'paid') OVER (PARTITION BY order_id) AS ever_paid         -- вся история заказа
  FROM order_status_log
), last_version AS (
  SELECT * FROM ranked WHERE rn = 1
)
SELECT l.status AS last_status,
       COUNT(*) AS orders,
       COUNT(*) FILTER (WHERE l.ever_paid) AS ever_paid,
       COUNT(*) FILTER (WHERE l.status <> o.status) AS mismatch   -- сверка с orders.status
FROM last_version AS l
JOIN orders AS o USING (order_id)
GROUP BY l.status
ORDER BY l.status;
```

Вывод:

```
 last_status | orders | ever_paid | mismatch 
-------------+--------+-----------+----------
 cancelled   |     36 |        21 |        0
 paid        |    195 |       195 |        0
(2 rows)
```

**QUALIFY: DuckDB фильтрует по окну, PostgreSQL читает слово как псевдоним**

```python
import duckdb, psycopg

q = """
SELECT order_id, status, changed_at
FROM order_status_log
QUALIFY ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY changed_at DESC) = 1
ORDER BY order_id
LIMIT 4
"""
print(duckdb.connect("data/shop/shop.duckdb", read_only=True).sql(q))   # DuckDB: QUALIFY есть

with psycopg.connect("host=/tmp dbname=shop user=postgres") as con:
    try:
        con.execute(q)
    except psycopg.errors.SyntaxError as e:                    # PostgreSQL: такого слова нет
        print("PostgreSQL:", e)
```

Вывод:

```
┌──────────┬─────────┬─────────────────────┐
│ order_id │ status  │     changed_at      │
│  int32   │ varchar │      timestamp      │
├──────────┼─────────┼─────────────────────┤
│     1001 │ paid    │ 2026-01-29 20:03:01 │
│     1002 │ paid    │ 2026-03-20 19:07:56 │
│     1003 │ paid    │ 2026-03-28 19:57:42 │
│     1004 │ paid    │ 2026-01-03 00:07:18 │
└──────────┴─────────┴─────────────────────┘

PostgreSQL: syntax error at or near "ROW_NUMBER"
LINE 4: QUALIFY ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY ch...
                ^
```

## Вопросы для самопроверки

1. В выборке три заказа от 1 марта: 1053 на 1 120 ₽, 1168 на 450 ₽ и 1187 на 2 500 ₽. Какой нарастающий итог получит заказ 1053 в запросе SUM(amount) OVER (ORDER BY order_date)?
   А) 1 120 — только сам заказ: он первый
   Б) 4 070 — все три заказа 1 марта
   В) 1 570 — заказ и следующий за ним
   Г) 38 130 — вся выборка

2. В сцене 12 заказов четырёх клиентов. Сколько строк вернёт SELECT customer_id, SUM(amount) OVER (PARTITION BY customer_id) по этим заказам?
   А) 4 — по строке на клиента
   Б) 12 — по строке на заказ, у каждой сумма её клиента
   В) 3 — столько заказов у каждого клиента
   Г) 16 — 12 заказов и 4 итоговые строки

3. Суммы заказов по убыванию: 10 020, 8 030, 7 480, 3 340, 2 500, 2 500, 1 120. Какое место получит 1 120 ₽ у RANK и у DENSE_RANK?
   А) RANK — 7, DENSE_RANK — 6
   Б) RANK — 6, DENSE_RANK — 6
   В) RANK — 7, DENSE_RANK — 7
   Г) RANK — 6, DENSE_RANK — 7

4. В отчёте нарастающий итог SUM(amount) OVER (ORDER BY order_date) у трёх заказов 1 марта одинаковый — 4 070 ₽, а не 1 120, 1 570 и 4 070. Почему?
   А) Рамка по умолчанию — RANGE, и в неё входят все строки с той же датой
   Б) SUM пропускает повторяющиеся даты
   В) PostgreSQL округляет нарастающий итог до дня
   Г) Не хватает PARTITION BY order_date

5. Нужна последняя запись журнала по каждому заказу. Как отфильтровать по ROW_NUMBER в PostgreSQL?
   А) WHERE ROW_NUMBER() OVER (…) = 1
   Б) HAVING ROW_NUMBER() OVER (…) = 1
   В) Посчитать ROW_NUMBER в CTE или подзапросе и написать снаружи WHERE rn = 1
   Г) QUALIFY ROW_NUMBER() OVER (…) = 1

6. Что окажется в gap_days у первого заказа клиента?

```
order_date - LAG(order_date) OVER w AS gap_days
```
   А) 0
   Б) NULL
   В) Число дней от 1 января
   Г) Ошибка: у первой строки нет соседа

7. В выручке по дням нет строк за 24 и 26–28 января. Что посчитает AVG(revenue) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) для 29 января?
   А) Среднее за 23–29 января
   Б) Среднее семи последних дней с заказами — с 17 по 29 января
   В) Ошибку: в окне есть пропуски
   Г) NULL, потому что дней не хватает

## Глоссарий

- **Границы рамки** (frame bounds) — где рамка начинается и кончается: UNBOUNDED, N PRECEDING, CURRENT ROW, N FOLLOWING.
- **Дедупликация** (deduplication) — отбор одной строки на ключ, например последней версии записи.
- **Доля от суммы группы** (share of total) — значение строки, делённое на сумму её секции.
- **Нарастающий итог** (running total) — сумма от первой строки до текущей в заданном порядке.
- **Оконная функция** (window function) — функция, которая считает значение для каждой строки по связанным с ней строкам и не схлопывает их.
- **План запроса** (query plan, EXPLAIN) — шаги, которыми база выполняет запрос; его показывает EXPLAIN.
- **Равные строки** (peers) — строки секции с одинаковым значением ORDER BY окна.
- **Рамка окна** (window frame) — строки секции, которые агрегат берёт для текущей строки.
- **Секция окна** (partition, PARTITION BY) — строки с одинаковым значением PARTITION BY; на границе секции окно считает заново.
- **Скользящее среднее** (moving average) — среднее за окно постоянной длины, которое едет вместе с текущей строкой.
- **Удержание** (retention) — доля клиентов, которые вернулись и купили снова.
- **DENSE_RANK** (dense rank) — ранг без пропусков: у равных строк одно место, следующее идёт подряд.
- **FILTER** (FILTER clause) — условие внутри агрегата: COUNT(*) FILTER (WHERE …) считает только подходящие строки.
- **INTERVAL** — промежуток времени, например INTERVAL '6 days'; им пишут смещение RANGE по дате.
- **LAG и LEAD** (lag, lead) — значение из строки на N позиций раньше или позже в той же секции.
- **OVER** (OVER clause) — слово после функции; в скобках за ним описывают окно.
- **QUALIFY** (QUALIFY clause) — фильтр по результату оконной функции в DuckDB; в PostgreSQL его нет.
- **RANGE** (RANGE mode) — режим рамки, который отсчитывает границы по значению ORDER BY; равные строки входят вместе.
- **RANK** — ранг с пропусками: у равных строк одно место, следующие пропускаются.
- **ROW_NUMBER** (row number) — номер строки в секции по порядку ORDER BY, без повторов.
- **ROWS** (ROWS mode) — режим рамки, который отсчитывает границы в строках.
- **WINDOW** (WINDOW clause) — предложение, где окно описывают один раз и называют, чтобы писать OVER w.

## Источники

1. PostgreSQL Documentation. Tutorial: Window Functions. Где разрешены оконные функции, почему их нет в WHERE и как фильтровать через подзапрос. https://www.postgresql.org/docs/current/tutorial-window.html
2. PostgreSQL Documentation. Window Function Calls. Синтаксис окна, режимы рамки, равные строки и рамка по умолчанию. https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS
3. PostgreSQL Documentation. Window Functions. Определения ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD и агрегатов по рамке. https://www.postgresql.org/docs/current/functions-window.html
4. PostgreSQL Documentation. SELECT: WINDOW Clause. Именованные окна и предупреждение о ROWS на неуникальном порядке. https://www.postgresql.org/docs/current/sql-select.html#SQL-WINDOW
5. Winand M. Modern SQL: The FILTER clause. FILTER и его замена через CASE внутри агрегата. https://modern-sql.com/feature/filter
6. Tanimura C. SQL for Data Analysis. O’Reilly, 2021. Когорты, удержание и временные ряды на оконных функциях.
7. Molinaro A., de Graaf R. SQL Cookbook, 2nd ed. O’Reilly, 2020. Рецепты ранжирования, нарастающих итогов и скользящих окон.
8. Beaulieu A. Learning SQL, 3rd ed. O’Reilly, 2020. Глава об аналитических функциях для последовательного чтения.
9. DuckDB Documentation. QUALIFY Clause. Фильтр по оконной функции без подзапроса и CTE. https://duckdb.org/docs/stable/sql/query_syntax/qualify
10. pandas. pandas.DataFrame.rolling. Окно по числу строк и по времени, например «7D». https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.rolling.html