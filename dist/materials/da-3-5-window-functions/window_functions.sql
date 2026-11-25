-- Запросы страницы 3.5 «Оконные функции» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.
-- Запуск из корня папки материалов: psql -d shop -P null=NULL < da-3-5-window-functions/window_functions.sql
-- Второй блок начинается с запроса, который намеренно вызывает ошибку: оконная функция в WHERE.

-- ===== Равные даты: рамка по умолчанию и ROWS =====
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

-- ===== Как отобрать строки по результату оконной функции =====
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

-- ===== Удержание через LAG =====
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

-- ===== Скользящее среднее за 7 дней: ROWS и RANGE =====
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

-- ===== Три лидера продаж в каждой категории =====
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

-- ===== Последняя версия записи из журнала =====
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
