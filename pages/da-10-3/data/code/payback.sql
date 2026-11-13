-- 1. Клетка «канал × когорта × месяц жизни n»: размер когорты и её маржинальный доход
CREATE TEMP TABLE cell AS
WITH ord AS (                                 -- маржинальный доход заказа по соглашению учебника
  SELECT client_id,
         EXTRACT(YEAR FROM order_date) * 12 + EXTRACT(MONTH FROM order_date) AS om,
         CASE WHEN refunded = 1 THEN -2 * delivery_cost - payment_fee
              ELSE revenue - cogs - delivery_cost - payment_fee END AS margin
  FROM orders
), cohort AS (                                -- когорта = канал + месяц регистрации
  SELECT client_id, channel, DATE_TRUNC('month', signup_date)::date AS cm,
         EXTRACT(YEAR FROM signup_date) * 12 + EXTRACT(MONTH FROM signup_date) AS sm
  FROM clients
), sizes AS (
  SELECT channel, cm, sm, COUNT(*) AS size FROM cohort GROUP BY 1, 2, 3
), by_n AS (
  SELECT c.channel, c.cm, (o.om - c.sm)::int AS n, SUM(o.margin) AS margin
  FROM ord o JOIN cohort c USING (client_id)
  GROUP BY 1, 2, 3
)
SELECT s.channel, s.cm, g.n, s.size, COALESCE(b.margin, 0) AS margin
FROM sizes s
CROSS JOIN generate_series(0, 23) AS g(n)
LEFT JOIN by_n b ON b.channel = s.channel AND b.cm = s.cm AND b.n = g.n
WHERE s.sm + g.n <= 2026 * 12 + 6;            -- только прожитые месяцы: данные кончаются в июне 2026

-- 2. Кривые окупаемости каналов: прирост на клиента — по когортам, дожившим до n
WITH cac AS (
  SELECT channel, SUM(spend) / (SELECT COUNT(*) FROM clients c WHERE c.channel = m.channel)::numeric AS cac
  FROM marketing_spend m GROUP BY channel
), curve AS (
  SELECT channel, n, SUM(SUM(margin)::numeric / SUM(size)) OVER (PARTITION BY channel ORDER BY n) AS ltv
  FROM cell GROUP BY channel, n
)
SELECT channel, ROUND(cac) AS cac,
       ROUND(MAX(ltv - cac) FILTER (WHERE n = 0))  AS bal_0,
       ROUND(MAX(ltv - cac) FILTER (WHERE n = 5))  AS bal_5,
       ROUND(MAX(ltv - cac) FILTER (WHERE n = 11)) AS bal_11,
       ROUND(MAX(ltv - cac) FILTER (WHERE n = 23)) AS bal_23,
       ROUND(MAX(ltv) FILTER (WHERE n = 11)) AS ltv_12,
       MIN(n) FILTER (WHERE ltv >= cac) AS payback_n          -- первый месяц, где кривая ≥ 0
FROM curve JOIN cac USING (channel)
GROUP BY channel, cac
ORDER BY payback_n NULLS LAST;

-- 3. Те же кривые по когортам поиска: у каждой когорты свой CAC — расходы её месяца
WITH coh AS (
  SELECT c.cm, MAX(c.size) AS size, MAX(m.spend)::numeric / MAX(c.size) AS cac,
         CASE WHEN MAX(c.n) >= 5 THEN SUM(c.margin) FILTER (WHERE c.n <= 5)::numeric / MAX(c.size) END AS ltv_6,
         CASE WHEN MAX(c.n) >= 11 THEN SUM(c.margin) FILTER (WHERE c.n <= 11)::numeric / MAX(c.size) END AS ltv_12
  FROM cell c
  JOIN marketing_spend m ON m.channel = c.channel AND m.month = TO_CHAR(c.cm, 'YYYY-MM')
  WHERE c.channel = 'поиск'
  GROUP BY c.cm
), pay AS (                                   -- первый месяц, где накопленная маржа догнала CAC когорты
  SELECT c.cm, MIN(c.n) AS payback_n
  FROM (SELECT cm, n, SUM(margin) OVER (PARTITION BY cm ORDER BY n) AS cum, size FROM cell
        WHERE channel = 'поиск') c
  JOIN coh USING (cm)
  WHERE c.cum >= coh.cac * c.size
  GROUP BY c.cm
)
SELECT TO_CHAR(cm, 'YYYY-MM') AS cohort, size, ROUND(cac) AS cac, ROUND(ltv_6) AS ltv_6,
       ROUND(ltv_12) AS ltv_12, payback_n
FROM coh LEFT JOIN pay USING (cm)
ORDER BY cm;
