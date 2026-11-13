-- Воронка новичков мая: окно 7 суток, любой и строгий порядок шагов
WITH e AS (                                   -- без дублей: одна строка на event_id
  SELECT DISTINCT ON (event_id) *
  FROM events
  ORDER BY event_id
), bots AS (                                  -- больше 100 клиентских событий за сутки
  SELECT DISTINCT anonymous_id
  FROM e
  WHERE origin = 'client'
  GROUP BY anonymous_id, (event_time AT TIME ZONE 'Europe/Minsk')::date
  HAVING COUNT(*) > 100
), dev AS (                                   -- склейка: устройство → аккаунт
  SELECT anonymous_id, MIN(user_id) AS user_id
  FROM e
  WHERE anonymous_id IS NOT NULL AND user_id IS NOT NULL
  GROUP BY anonymous_id
), ev AS (                                    -- человек = аккаунт, иначе устройство
  SELECT COALESCE(e.user_id, dev.user_id, e.anonymous_id) AS person,
         e.event_name, e.event_time
  FROM e LEFT JOIN dev USING (anonymous_id)
  WHERE e.anonymous_id IS NULL
     OR e.anonymous_id NOT IN (SELECT anonymous_id FROM bots)
), cohort AS (                                -- первый app_open в мае по Минску
  SELECT person, MIN(event_time) AS t1
  FROM ev
  WHERE event_name = 'app_open'
  GROUP BY person
  HAVING MIN(event_time) >= '2026-05-01 00:00+03'
     AND MIN(event_time) <  '2026-06-01 00:00+03'
     AND person NOT IN (SELECT user_id FROM users WHERE signup_time < '2026-01-05 00:00+03')
), w AS (                                     -- события шагов в окне 7 суток от t1
  SELECT c.person, c.t1, ev.event_name, ev.event_time
  FROM cohort AS c JOIN ev USING (person)
  WHERE ev.event_time BETWEEN c.t1 AND c.t1 + INTERVAL '7 days'
), any_order AS (                             -- любой порядок: первое время каждого шага
  SELECT person,
         MIN(event_time) FILTER (WHERE event_name = 'product_view')   AS a2,
         MIN(event_time) FILTER (WHERE event_name = 'add_to_cart')    AS a3,
         MIN(event_time) FILTER (WHERE event_name = 'checkout_start') AS a4,
         MIN(event_time) FILTER (WHERE event_name = 'order_paid')     AS a5
  FROM w GROUP BY person
), s2 AS (                                    -- строгий порядок: каждый шаг не раньше предыдущего
  SELECT person, MIN(event_time) AS t2 FROM w
  WHERE event_name = 'product_view' GROUP BY person
), s3 AS (
  SELECT w.person, MIN(w.event_time) AS t3 FROM w JOIN s2 USING (person)
  WHERE w.event_name = 'add_to_cart' AND w.event_time >= s2.t2 GROUP BY w.person
), s4 AS (
  SELECT w.person, MIN(w.event_time) AS t4 FROM w JOIN s3 USING (person)
  WHERE w.event_name = 'checkout_start' AND w.event_time >= s3.t3 GROUP BY w.person
), s5 AS (
  SELECT w.person, MIN(w.event_time) AS t5 FROM w JOIN s4 USING (person)
  WHERE w.event_name = 'order_paid' AND w.event_time >= s4.t4 GROUP BY w.person
), f AS (
  SELECT c.person, a.a2, a.a3, a.a4, a.a5, s2.t2, s3.t3, s4.t4, s5.t5
  FROM cohort AS c
  LEFT JOIN any_order AS a USING (person)
  LEFT JOIN s2 USING (person) LEFT JOIN s3 USING (person)
  LEFT JOIN s4 USING (person) LEFT JOIN s5 USING (person)
)
SELECT step.n, step.name,
       COUNT(*) FILTER (WHERE step.any_ok) AS any_order,
       ROUND(100.0 * COUNT(*) FILTER (WHERE step.any_ok) / COUNT(*), 1) AS any_pct,
       COUNT(*) FILTER (WHERE step.strict_ok) AS strict,
       ROUND(100.0 * COUNT(*) FILTER (WHERE step.strict_ok) / COUNT(*), 1) AS strict_pct
FROM f CROSS JOIN LATERAL (VALUES
  (1, 'app_open',       true,                   true),
  (2, 'product_view',   a2 IS NOT NULL,         t2 IS NOT NULL),
  (3, 'add_to_cart',    a2 IS NOT NULL AND a3 IS NOT NULL, t3 IS NOT NULL),
  (4, 'checkout_start', a2 IS NOT NULL AND a3 IS NOT NULL AND a4 IS NOT NULL, t4 IS NOT NULL),
  (5, 'order_paid',     a2 IS NOT NULL AND a3 IS NOT NULL AND a4 IS NOT NULL AND a5 IS NOT NULL, t5 IS NOT NULL)
) AS step(n, name, any_ok, strict_ok)
GROUP BY step.n, step.name
ORDER BY step.n;
