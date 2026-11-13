-- Запросы страницы 3.2 «JOIN» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.
-- Запуск из корня папки материалов: psql -d shop -P null=NULL -f da-3-2-join/joins.sql
-- Первый блок кладёт выборку из сцены во временные таблицы, остальные работают со всей базой.

-- ===== Пять типов JOIN на одной паре таблиц =====
-- Выборка из сцены и интерактива — во временных таблицах
CREATE TEMP TABLE sample_customers AS
SELECT customer_id, name, channel
FROM customers
WHERE country_code = 'RU' AND signup_date < '2026-01-01';

CREATE TEMP TABLE sample_orders AS
SELECT order_id, customer_id, channel, status
FROM orders
WHERE order_date BETWEEN '2026-01-11' AND '2026-01-13';

-- FULL JOIN: пары, клиенты без заказов и заказы без клиента
SELECT c.customer_id, c.name, o.order_id, o.customer_id
FROM sample_customers AS c
FULL JOIN sample_orders AS o ON o.customer_id = c.customer_id
ORDER BY c.customer_id, o.order_id;

-- Сколько строк даёт каждый тип соединения
SELECT 'INNER' AS join_type, count(*) AS n_rows
FROM sample_customers AS c
INNER JOIN sample_orders AS o ON o.customer_id = c.customer_id
UNION ALL
SELECT 'LEFT', count(*)
FROM sample_customers AS c
LEFT JOIN sample_orders AS o ON o.customer_id = c.customer_id
UNION ALL
SELECT 'RIGHT', count(*)
FROM sample_customers AS c
RIGHT JOIN sample_orders AS o ON o.customer_id = c.customer_id
UNION ALL
SELECT 'FULL', count(*)
FROM sample_customers AS c
FULL JOIN sample_orders AS o ON o.customer_id = c.customer_id
UNION ALL
SELECT 'CROSS', count(*)
FROM sample_customers AS c
CROSS JOIN sample_orders AS o;

-- ===== Анти-соединение четырьмя способами =====
-- Клиенты без заказов: 1) LEFT JOIN … IS NULL
SELECT c.customer_id, c.name
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL
ORDER BY c.customer_id;

-- 2) NOT EXISTS: нет ни одного заказа с ключом этого клиента
SELECT count(*) AS not_exists
FROM customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o WHERE o.customer_id = c.customer_id
);

-- 3) NOT IN и 4) EXCEPT
SELECT count(*) AS not_in
FROM customers AS c
WHERE c.customer_id NOT IN (SELECT o.customer_id FROM orders AS o);

SELECT count(*) AS except_rows
FROM (
  SELECT customer_id FROM customers
  EXCEPT
  SELECT customer_id FROM orders
) AS t;

-- NOT IN ломается, когда в подзапросе есть NULL:
-- кто из клиентов никого не пригласил?
SELECT count(*) AS not_in
FROM customers AS c
WHERE c.customer_id NOT IN (SELECT referrer_id FROM customers);

SELECT count(*) AS not_exists
FROM customers AS c
WHERE NOT EXISTS (
  SELECT 1 FROM customers AS r WHERE r.referrer_id = c.customer_id
);

-- ===== Самосоединение и NULL в ключе =====
-- Самосоединение: кто кого пригласил
SELECT c.customer_id, c.name, r.customer_id AS referrer_id, r.name AS referrer
FROM customers AS c
JOIN customers AS r ON r.customer_id = c.referrer_id
ORDER BY r.customer_id, c.customer_id;

-- NULL не находит пару даже среди NULL: добавим в справочник строку с пустым кодом
CREATE TEMP TABLE countries_x AS
SELECT country_code, country_name FROM countries
UNION ALL
SELECT NULL, 'страна не указана';

SELECT c.customer_id, c.country_code, k.country_name
FROM customers AS c
LEFT JOIN countries_x AS k ON k.country_code = c.country_code
WHERE c.country_code IS NULL
ORDER BY c.customer_id;

-- IS NOT DISTINCT FROM считает два NULL равными
SELECT c.customer_id, c.country_code, k.country_name
FROM customers AS c
LEFT JOIN countries_x AS k
  ON k.country_code IS NOT DISTINCT FROM c.country_code
WHERE c.country_code IS NULL
ORDER BY c.customer_id;

-- ===== COUNT до и после соединения, составной ключ =====
-- До соединения: ключ order_id уникален в orders, но не в order_items
SELECT count(*) AS n_rows, count(DISTINCT order_id) AS n_orders, sum(amount) AS revenue
FROM orders;

SELECT count(*) AS n_rows, count(DISTINCT order_id) AS n_orders,
       count(DISTINCT (order_id, product_id)) AS n_pairs
FROM order_items;

-- После соединения: строки заказов размножились, выручка выросла
SELECT count(*) AS n_rows, count(DISTINCT o.order_id) AS n_orders,
       sum(o.amount) AS revenue_wrong, sum(i.qty * i.price) AS revenue_items
FROM orders AS o
JOIN order_items AS i ON i.order_id = o.order_id;

-- Составной ключ: история статусов однозначна только по паре (order_id, status)
SELECT count(*) AS by_order_id
FROM orders AS o
JOIN order_status_log AS l ON l.order_id = o.order_id;

SELECT count(*) AS by_order_and_status
FROM orders AS o
JOIN order_status_log AS l ON l.order_id = o.order_id AND l.status = o.status;
