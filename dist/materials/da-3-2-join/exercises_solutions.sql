-- Решения упражнений к странице 3.2 «JOIN» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.
--
-- Запуск из корня папки материалов: psql -d shop -f da-3-2-join/exercises_solutions.sql
-- Все пять проверок отвечают «верно». Загляните сюда после своей попытки.


SET client_min_messages = warning;   -- не печатать служебные сообщения о представлениях

-- ---------- Упражнение 1. Предсказать число строк ----------
-- Все клиенты и их заказы. Сохраните клиентов без заказов. В столбце order_id у этих строк будет NULL.
-- Сначала предскажите, сколько строк получится, потом напишите запрос.
-- Столбцы результата: customer_id, order_id.
DROP VIEW IF EXISTS ex1;
CREATE TEMP VIEW ex1 AS
SELECT c.customer_id, o.order_id
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id;
-- Разбор. Пар «клиент — заказ» столько же, сколько заказов: 231, ключ customer_id в customers уникален.
-- LEFT JOIN добавляет восемь клиентов без заказов: 231 + 8 = 239. Клиентов по-прежнему 60.

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(*) FROM ex1) = 239 AND (SELECT count(DISTINCT customer_id) FROM ex1) = 60
            THEN 'Упражнение 1: верно'
            ELSE 'Упражнение 1: не сошлось. Нужно 239 строк и 60 клиентов, получено '
                 || (SELECT count(*) FROM ex1) || ' и ' || (SELECT count(DISTINCT customer_id) FROM ex1)
       END AS check_1;

-- ---------- Упражнение 2. ON или WHERE ----------
-- Все 60 клиентов и их оплаченные заказы за март 2026 года: с 1 марта включительно до 1 апреля исключительно.
-- Для клиента без оплаченных заказов за март в столбце order_id должен стоять NULL.
-- Столбцы результата: customer_id, order_id.
DROP VIEW IF EXISTS ex2;
CREATE TEMP VIEW ex2 AS
SELECT c.customer_id, o.order_id
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.customer_id
 AND o.status = 'paid'                 -- условия на правую таблицу — в ON
 AND o.order_date >= '2026-03-01' AND o.order_date < '2026-04-01';
-- Разбор. Условия на заказ стоят в ON: они решают, какой заказ считать парой, а клиент остаётся в любом случае.
-- В WHERE те же условия отбросили бы строки с NULL в столбцах orders, и LEFT JOIN сработал бы как INNER.

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(DISTINCT customer_id) FROM ex2) = 60
              AND (SELECT count(order_id) FROM ex2)
                  = (SELECT count(*) FROM orders WHERE status = 'paid' AND order_date >= '2026-03-01' AND order_date < '2026-04-01')
            THEN 'Упражнение 2: верно'
            ELSE 'Упражнение 2: не сошлось. Нужно 60 клиентов и 100 заказов, получено '
                 || (SELECT count(DISTINCT customer_id) FROM ex2) || ' и ' || (SELECT count(order_id) FROM ex2)
       END AS check_2;

-- ---------- Упражнение 3. Проверить сумму после соединения ----------
-- По каждому каналу заказа: выручка от оплаченных заказов и количество проданных единиц товара.
-- Количество единиц по каждой позиции хранится в order_items.qty. Выручка по трём каналам в сумме составляет 912 080 ₽.
-- Столбцы результата: channel, revenue, units.
DROP VIEW IF EXISTS ex3;
CREATE TEMP VIEW ex3 AS
SELECT o.channel,
       sum(i.qty * i.price) AS revenue,     -- сумма по позициям: каждая встречается один раз
       sum(i.qty)           AS units
FROM orders AS o
JOIN order_items AS i ON i.order_id = o.order_id
WHERE o.status = 'paid'
GROUP BY o.channel;
-- Разбор. После соединения строка заказа повторяется по разу на каждую позицию, поэтому sum(o.amount) повторно учёл бы суммы заказов с несколькими позициями.
-- Выручку берём из позиций. Второй путь — сначала свернуть order_items до одной строки на заказ и затем присоединить результат.

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(*) FROM ex3) = 3
              AND (SELECT sum(revenue) FROM ex3) = 912080
              AND (SELECT sum(units) FROM ex3) = 461
            THEN 'Упражнение 3: верно'
            ELSE 'Упражнение 3: не сошлось. Ожидаются 3 канала, выручка 912 080 ₽ и 461 единица товара. Получено: '
                 || (SELECT count(*) FROM ex3) || ', ' || coalesce((SELECT sum(revenue) FROM ex3)::text, 'пусто')
                 || ' и ' || coalesce((SELECT sum(units) FROM ex3)::text, 'пусто')
       END AS check_3;

-- ---------- Упражнение 4. Клиенты без оплаченных заказов ----------
-- Клиенты, у которых нет ни одного оплаченного заказа:
-- и те, кто не заказывал совсем, и те, у кого все заказы отменены.
-- Столбец результата: customer_id.
DROP VIEW IF EXISTS ex4;
CREATE TEMP VIEW ex4 AS
SELECT c.customer_id
FROM customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o
  WHERE o.customer_id = c.customer_id AND o.status = 'paid'
);
-- Разбор. Клиентов без заказов восемь, девятый — клиент, у которого все заказы отменены.
-- Условие на статус стоит внутри подзапроса. Через LEFT JOIN то же самое: o.status = 'paid' в ON и o.order_id IS NULL в WHERE.

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(*) FROM ex4) = 9
              AND NOT EXISTS (SELECT 1 FROM ex4 AS e JOIN orders AS o USING (customer_id) WHERE o.status = 'paid')
            THEN 'Упражнение 4: верно'
            ELSE 'Упражнение 4: не сошлось. Нужно 9 клиентов без оплаченных заказов, получено '
                 || (SELECT count(*) FROM ex4)
       END AS check_4;

-- ---------- Упражнение 5. Переписать NOT IN ----------
-- Запрос ниже должен найти клиентов, которые никого не пригласили, но в текущем виде возвращает ноль строк:
--     SELECT customer_id FROM customers
--     WHERE customer_id NOT IN (SELECT referrer_id FROM customers);
-- Перепишите его так, чтобы нашлись все такие клиенты.
-- Столбец результата: customer_id.
DROP VIEW IF EXISTS ex5;
CREATE TEMP VIEW ex5 AS
SELECT c.customer_id
FROM customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM customers AS r WHERE r.referrer_id = c.customer_id
);
-- Разбор. У 44 клиентов в столбце referrer_id стоит NULL. Поэтому NOT IN даёт FALSE или UNKNOWN и не выбирает ни одной строки.
-- NOT EXISTS отвечает только TRUE или FALSE. Второй путь — оставить NOT IN и дописать в подзапрос WHERE referrer_id IS NOT NULL.

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(*) FROM ex5) = 45
              AND NOT EXISTS (SELECT 1 FROM ex5 AS e JOIN customers AS r ON r.referrer_id = e.customer_id)
            THEN 'Упражнение 5: верно'
            ELSE 'Упражнение 5: не сошлось. Нужно 45 клиентов, получено ' || (SELECT count(*) FROM ex5)
       END AS check_5;
