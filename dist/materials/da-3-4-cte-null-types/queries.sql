-- Запросы страницы 3.4 «Подзапросы, CTE, NULL и типы» курса «Аналитика 101». Учебная база shop, PostgreSQL 16.
-- Запуск из корня папки материалов: psql -d shop -P null=NULL -f da-3-4-cte-null-types/queries.sql

-- ===== Почему NOT IN и NOT EXISTS дали разные результаты =====
-- Клиенты, которые никого не пригласили. referrer_id у 44 клиентов — NULL
SELECT COUNT(*) AS not_in
FROM customers
WHERE customer_id NOT IN (SELECT referrer_id FROM customers);

SELECT COUNT(*) AS not_exists
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM customers r
                  WHERE r.referrer_id = c.customer_id);

-- ===== Заказы за день и за месяц =====
-- 12 февраля: 5 заказов, один из них (1008) ровно в 00:00:00
SELECT COUNT(*) AS eq_literal FROM orders WHERE created_at = '2026-02-12';
SELECT COUNT(*) AS eq_date    FROM orders WHERE created_at::date = '2026-02-12';

-- Февраль: BETWEEN по метке времени обрезает 28-е число на полуночи
SELECT COUNT(*) AS between_ts FROM orders
WHERE created_at BETWEEN '2026-02-01' AND '2026-02-28';
SELECT COUNT(*) AS half_open  FROM orders
WHERE created_at >= '2026-02-01' AND created_at < '2026-03-01';

-- ===== EXPLAIN: встроенная CTE и MATERIALIZED =====
-- PostgreSQL 12+: CTE, на которую ссылаются один раз, встраивается в запрос
EXPLAIN (COSTS OFF)
WITH paid AS (SELECT * FROM orders WHERE status = 'paid')
SELECT COUNT(*) FROM paid WHERE channel = 'рассылка';

-- MATERIALIZED заставляет посчитать шаг отдельно и сохранить результат
EXPLAIN (COSTS OFF)
WITH paid AS MATERIALIZED (SELECT * FROM orders WHERE status = 'paid')
SELECT COUNT(*) FROM paid WHERE channel = 'рассылка';

-- ===== Отчёт из трёх CTE и размер каждого шага =====
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

-- ===== Поиск строк, пропавших из-за NULL =====
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

-- ===== Группировка по неделям через DATE_TRUNC =====
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
