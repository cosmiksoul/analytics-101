-- Запросы страницы 3.3 «Агрегаты и группировка» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.
-- Запуск из корня папки материалов: psql -d shop -P null=NULL -f da-3-3-aggregates/queries.sql

-- ===== Заказы, покупатели и выручка по каналам =====
-- показатели по каналу для оплаченных заказов
SELECT channel,
       COUNT(*)                    AS orders,
       COUNT(DISTINCT customer_id) AS buyers,
       SUM(amount)                 AS revenue,
       ROUND(AVG(amount), 2)       AS avg_check,
       MIN(amount)                 AS min_check,
       MAX(amount)                 AS max_check
FROM orders
WHERE status = 'paid'
GROUP BY channel
ORDER BY revenue DESC;

-- два столбца в GROUP BY: группа — пара «канал, бренд», всего их 12
SELECT channel, brand, COUNT(*) AS orders, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY channel, brand
HAVING COUNT(*) >= 20          -- оставить пары, где не меньше 20 заказов
ORDER BY channel, revenue DESC;

-- ===== Число отмен и помесячная выручка =====
-- в каждой строке канала считаем отмены и помесячную выручку
SELECT channel,
       COUNT(*)                                              AS orders,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS canc_case,
       COUNT(*) FILTER (WHERE status = 'cancelled')          AS canc_filter,
       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled')
             / COUNT(*), 1)                                  AS canc_pct,
       SUM(amount) FILTER (WHERE status = 'paid'
                             AND order_date < '2026-02-01')  AS rev_jan,
       SUM(amount) FILTER (WHERE status = 'paid'
                             AND order_date >= '2026-02-01'
                             AND order_date <  '2026-03-01') AS rev_feb,
       SUM(amount) FILTER (WHERE status = 'paid'
                             AND order_date >= '2026-03-01') AS rev_mar
FROM orders
GROUP BY channel
ORDER BY channel;

-- ===== Итоги по каналам, брендам и магазину =====
-- ROLLUP (channel): строки по каналам и итоговая строка
SELECT CASE WHEN GROUPING(channel) = 1 THEN 'итого'
            ELSE channel END     AS channel,
       COUNT(*)                  AS orders,
       SUM(amount)               AS revenue,
       ROUND(AVG(amount), 2)     AS avg_check
FROM orders
WHERE status = 'paid'
GROUP BY ROLLUP (channel)
ORDER BY GROUPING(channel), revenue DESC;

-- показатели по каналам, по брендам и по всем заказам
SELECT channel, brand, COUNT(*) AS orders, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY GROUPING SETS ((channel), (brand), ())
ORDER BY channel, brand;

-- ===== Средняя оценка и баллы в пересчёте на заказ =====
-- оценка известна только для части заказов
SELECT status,
       COUNT(*)                                  AS orders,
       COUNT(rating)                             AS rated,
       SUM(rating)                               AS rating_sum,
       ROUND(AVG(rating), 2)                     AS avg_rating,
       ROUND(AVG(COALESCE(rating, 0)), 2)        AS per_order,
       MAX(rating)                               AS max_rating
FROM orders
GROUP BY status
ORDER BY status;
