-- Страница 10.1 «CAC, ARPU и маржа» курса «Аналитика 101».
-- CAC по каналам и смешанный CAC в PostgreSQL 16. Нужна база unit: как её загрузить — в data/unit/README.md.
-- Запуск из корня папки материалов: psql -d unit -P null=NULL -f da-10-1-cac-arpu-margin/cac.sql

-- CAC по каналам: расходы канала (маркетинг) / новые клиенты канала (продукт)
WITH spend AS (
  SELECT channel, SUM(spend) AS spend
  FROM marketing_spend
  GROUP BY channel
), newbies AS (
  SELECT c.channel,
         COUNT(*) AS new_clients,
         COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM orders AS o
                                        WHERE o.client_id = c.client_id)) AS buyers
  FROM clients AS c
  GROUP BY c.channel
), by_channel AS (
  SELECT n.channel, s.spend, n.new_clients, n.buyers
  FROM newbies AS n
  LEFT JOIN spend AS s USING (channel)      -- у органики расходов нет: spend = NULL
), blended AS (
  SELECT 'вся реклама' AS channel, SUM(spend) AS spend,
         SUM(new_clients) FILTER (WHERE spend IS NOT NULL) AS new_clients,
         SUM(buyers) FILTER (WHERE spend IS NOT NULL) AS buyers
  FROM by_channel
  UNION ALL
  SELECT 'вся реклама + органика', SUM(spend), SUM(new_clients), SUM(buyers)
  FROM by_channel
)
SELECT channel,
       ROUND(spend / 1e6, 2) AS spend_mln,
       new_clients, buyers,
       ROUND(spend::numeric / new_clients) AS cac,
       ROUND(spend::numeric / buyers) AS cac_buyer
FROM (SELECT * FROM by_channel UNION ALL SELECT * FROM blended) AS t
ORDER BY spend IS NOT NULL, new_clients;
