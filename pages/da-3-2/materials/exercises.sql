-- Упражнения к странице 3.2 «JOIN» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.
--
-- Как работать. В каждом упражнении замените запрос-заглушку после AS своим запросом
-- и выполните файл целиком из корня папки материалов:
--     psql -d shop -f da-3-2-join/exercises.sql
-- Проверочный запрос под упражнением ответит «верно» или «не сошлось».
-- Заглушка возвращает ноль строк, поэтому нетронутое упражнение не сходится — так и задумано.
-- Решения с разбором — в exercises_solutions.sql.


SET client_min_messages = warning;   -- не печатать служебные сообщения о представлениях

-- ---------- Упражнение 1. Предсказать число строк ----------
-- Все клиенты и их заказы. Клиент без заказов остаётся в результате, order_id у него пуст.
-- Сначала предскажите, сколько строк получится, потом напишите запрос.
-- Столбцы результата: customer_id, order_id.
DROP VIEW IF EXISTS ex1;
CREATE TEMP VIEW ex1 AS
SELECT NULL::integer AS customer_id, NULL::integer AS order_id WHERE false;   -- заглушка: замените своим запросом

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(*) FROM ex1) = 239 AND (SELECT count(DISTINCT customer_id) FROM ex1) = 60
            THEN 'Упражнение 1: верно'
            ELSE 'Упражнение 1: не сошлось. Нужно 239 строк и 60 клиентов, получено '
                 || (SELECT count(*) FROM ex1) || ' и ' || (SELECT count(DISTINCT customer_id) FROM ex1)
       END AS check_1;

-- ---------- Упражнение 2. ON или WHERE ----------
-- Все 60 клиентов и их оплаченные заказы марта (order_date с 1 марта 2026 года).
-- Клиент без таких заказов остаётся в результате с пустым order_id.
-- Столбцы результата: customer_id, order_id.
DROP VIEW IF EXISTS ex2;
CREATE TEMP VIEW ex2 AS
SELECT NULL::integer AS customer_id, NULL::integer AS order_id WHERE false;   -- заглушка: замените своим запросом

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(DISTINCT customer_id) FROM ex2) = 60
              AND (SELECT count(order_id) FROM ex2)
                  = (SELECT count(*) FROM orders WHERE status = 'paid' AND order_date >= '2026-03-01')
            THEN 'Упражнение 2: верно'
            ELSE 'Упражнение 2: не сошлось. Нужно 60 клиентов и 100 заказов, получено '
                 || (SELECT count(DISTINCT customer_id) FROM ex2) || ' и ' || (SELECT count(order_id) FROM ex2)
       END AS check_2;

-- ---------- Упражнение 3. Найти размножение ----------
-- По каждому каналу заказа: выручка оплаченных заказов и число проданных штук.
-- Штуки лежат в order_items. Выручка трёх каналов вместе должна остаться 912 080 ₽.
-- Столбцы результата: channel, revenue, units.
DROP VIEW IF EXISTS ex3;
CREATE TEMP VIEW ex3 AS
SELECT NULL::text AS channel, NULL::bigint AS revenue, NULL::bigint AS units WHERE false;   -- заглушка: замените своим запросом

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(*) FROM ex3) = 3
              AND (SELECT sum(revenue) FROM ex3) = 912080
              AND (SELECT sum(units) FROM ex3) = 461
            THEN 'Упражнение 3: верно'
            ELSE 'Упражнение 3: не сошлось. Нужно 3 канала, 912080 ₽ и 461 штука, получено '
                 || (SELECT count(*) FROM ex3) || ', ' || coalesce((SELECT sum(revenue) FROM ex3)::text, 'пусто')
                 || ' и ' || coalesce((SELECT sum(units) FROM ex3)::text, 'пусто')
       END AS check_3;

-- ---------- Упражнение 4. Анти-соединение ----------
-- Клиенты, у которых нет ни одного оплаченного заказа:
-- и те, кто не заказывал совсем, и те, у кого все заказы отменены.
-- Столбец результата: customer_id.
DROP VIEW IF EXISTS ex4;
CREATE TEMP VIEW ex4 AS
SELECT NULL::integer AS customer_id WHERE false;   -- заглушка: замените своим запросом

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(*) FROM ex4) = 9
              AND NOT EXISTS (SELECT 1 FROM ex4 AS e JOIN orders AS o USING (customer_id) WHERE o.status = 'paid')
            THEN 'Упражнение 4: верно'
            ELSE 'Упражнение 4: не сошлось. Нужно 9 клиентов без оплаченных заказов, получено '
                 || (SELECT count(*) FROM ex4)
       END AS check_4;

-- ---------- Упражнение 5. Переписать NOT IN ----------
-- Запрос ниже должен найти клиентов, которые никого не пригласили, но возвращает ноль строк:
--     SELECT customer_id FROM customers
--     WHERE customer_id NOT IN (SELECT referrer_id FROM customers);
-- Перепишите его так, чтобы нашлись все такие клиенты.
-- Столбец результата: customer_id.
DROP VIEW IF EXISTS ex5;
CREATE TEMP VIEW ex5 AS
SELECT NULL::integer AS customer_id WHERE false;   -- заглушка: замените своим запросом

-- Проверка: не меняйте
SELECT CASE WHEN (SELECT count(*) FROM ex5) = 45
              AND NOT EXISTS (SELECT 1 FROM ex5 AS e JOIN customers AS r ON r.referrer_id = e.customer_id)
            THEN 'Упражнение 5: верно'
            ELSE 'Упражнение 5: не сошлось. Нужно 45 клиентов, получено ' || (SELECT count(*) FROM ex5)
       END AS check_5;
