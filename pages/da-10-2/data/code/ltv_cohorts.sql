-- LTV когорт июля 2024 — июня 2025 из таблицы заказов, ₽ на зарегистрированного клиента
WITH cohorts AS (
  SELECT client_id, date_trunc('month', signup_date)::date AS cohort
  FROM clients
),
order_margin AS (                -- маржинальный доход и чистая выручка заказа, месяц жизни n
  SELECT o.client_id,
         CASE WHEN o.refunded = 1 THEN -2 * o.delivery_cost - o.payment_fee
              ELSE o.revenue - o.cogs - o.delivery_cost - o.payment_fee END AS margin,
         CASE WHEN o.refunded = 1 THEN 0 ELSE o.revenue END AS net,
         (EXTRACT(YEAR FROM o.order_date) - EXTRACT(YEAR FROM c.cohort)) * 12
           + EXTRACT(MONTH FROM o.order_date) - EXTRACT(MONTH FROM c.cohort) AS n
  FROM orders o
  JOIN cohorts c USING (client_id)
),
per_cohort AS (                  -- клиенты без заказов остаются в знаменателе: LEFT JOIN
  SELECT c.cohort,
         count(DISTINCT c.client_id)            AS clients,
         sum(m.margin) FILTER (WHERE m.n < 6)  AS margin6,
         sum(m.margin) FILTER (WHERE m.n < 12) AS margin12,
         sum(m.net)    FILTER (WHERE m.n < 12) AS net12
  FROM cohorts c
  LEFT JOIN order_margin m USING (client_id)
  WHERE c.cohort BETWEEN '2024-07-01' AND '2025-06-01'
  GROUP BY c.cohort
)
SELECT to_char(cohort, 'YYYY-MM') AS cohort, clients,
       round(margin6::numeric / clients)  AS ltv6,    -- без ::numeric bigint / bigint делится нацело
       round(margin12::numeric / clients) AS ltv12,
       round(net12::numeric / clients)    AS ltv12_net
FROM per_cohort
UNION ALL                        -- вся группа: сумма маржи / сумма клиентов, а не среднее 12 чисел
SELECT 'все 12', sum(clients), round(sum(margin6) / sum(clients)),
       round(sum(margin12) / sum(clients)), round(sum(net12) / sum(clients))
FROM per_cohort
ORDER BY cohort;
