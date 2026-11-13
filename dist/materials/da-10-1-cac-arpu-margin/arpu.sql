-- Страница 10.1 «CAC, ARPU и маржа» курса «Аналитика 101».
-- ARPU и ARPPU по месяцам в PostgreSQL 16. Нужна база unit: как её загрузить — в data/unit/README.md.
-- Запуск из корня папки материалов: psql -d unit -P null=NULL -f da-10-1-cac-arpu-margin/arpu.sql

-- ARPU и ARPPU по месяцам: одна выручка, три знаменателя
WITH rev AS (                              -- чистая выручка: без возвращённых заказов
  SELECT to_char(order_date, 'YYYY-MM') AS month,
         SUM(revenue) FILTER (WHERE refunded = 0) AS net_revenue,
         COUNT(DISTINCT client_id) AS payers   -- оплатил хотя бы один заказ
  FROM orders
  GROUP BY 1
), act AS (                                -- заходил в месяце, даже без покупки
  SELECT month, COUNT(*) AS active
  FROM activity
  GROUP BY month
), base AS (                               -- зарегистрированы к концу месяца
  SELECT month, SUM(COUNT(*)) OVER (ORDER BY month) AS registered
  FROM (SELECT to_char(signup_date, 'YYYY-MM') AS month FROM clients) AS s
  GROUP BY month
)
SELECT month, net_revenue, payers, active, registered,
       ROUND(net_revenue::numeric / payers) AS arppu,
       ROUND(net_revenue::numeric / active) AS arpu_active,
       ROUND(net_revenue::numeric / registered) AS arpu_base
FROM rev
JOIN act USING (month)
JOIN base USING (month)
WHERE month >= '2025-07'
ORDER BY month;
