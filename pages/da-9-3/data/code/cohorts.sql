-- 1. Таблица «пользователь — день», как в 9.1: временная, общую базу не трогаем
CREATE TEMP TABLE user_day AS
WITH bots AS (                            -- больше 100 клиентских событий за сутки
  SELECT DISTINCT anonymous_id
  FROM (SELECT DISTINCT event_id, anonymous_id, event_time FROM events WHERE origin = 'client') e
  GROUP BY anonymous_id, (event_time AT TIME ZONE 'Europe/Minsk')::date
  HAVING COUNT(*) > 100
), clean AS (                             -- без дублей event_id и без ботов
  SELECT DISTINCT ON (event_id) *
  FROM events
  WHERE anonymous_id IS NULL OR anonymous_id NOT IN (SELECT anonymous_id FROM bots)
  ORDER BY event_id
), device AS (                            -- склейка: устройство → аккаунт
  SELECT anonymous_id, MIN(user_id) AS user_id
  FROM clean
  WHERE anonymous_id IS NOT NULL AND user_id IS NOT NULL
  GROUP BY anonymous_id
)
SELECT COALESCE(c.user_id, d.user_id, c.anonymous_id) AS person,
       (c.event_time AT TIME ZONE 'Europe/Minsk')::date AS day,     -- день — минский
       COUNT(*) AS events,
       COUNT(*) FILTER (WHERE c.event_name = 'app_open')   AS app_opens,
       COUNT(*) FILTER (WHERE c.event_name = 'order_paid') AS orders
FROM clean c
LEFT JOIN device d USING (anonymous_id)
WHERE (c.event_time AT TIME ZONE 'Europe/Minsk')::date
      BETWEEN DATE '2026-01-05' AND DATE '2026-06-28'              -- неполные дни по краям отброшены
GROUP BY 1, 2;

-- 2. Таблица когорт: строка — неделя прихода, столбец — неделя жизни n
WITH arrival AS (                         -- приход: первый день или регистрация, что раньше
  SELECT ud.person,
         LEAST(MIN(ud.day), MIN((u.signup_time AT TIME ZONE 'Europe/Minsk')::date)) AS arrived
  FROM user_day ud
  LEFT JOIN users u ON u.user_id = ud.person
  GROUP BY ud.person
), cohort AS (
  SELECT person, DATE_TRUNC('week', arrived)::date AS cohort_week
  FROM arrival
  WHERE arrived >= DATE '2026-01-05'      -- старые аккаунты — не новички января
), sizes AS (
  SELECT cohort_week, COUNT(*) AS size FROM cohort GROUP BY cohort_week
), activity AS (                          -- сколько людей когорты активны в неделю n
  SELECT c.cohort_week,
         (DATE_TRUNC('week', ud.day)::date - c.cohort_week) / 7 AS n,
         COUNT(DISTINCT ud.person) AS active
  FROM user_day ud
  JOIN cohort c USING (person)
  GROUP BY 1, 2
), grid AS (                              -- только прожитые клетки: неделя n уже закончилась
  SELECT s.cohort_week, s.size, g.n
  FROM sizes s
  CROSS JOIN generate_series(1, 8) AS g(n)
  WHERE s.cohort_week + 7 * g.n <= (SELECT DATE_TRUNC('week', MAX(day))::date FROM user_day)
), cells AS (
  SELECT g.cohort_week, g.n,
         ROUND(100.0 * COALESCE(a.active, 0) / g.size, 1) AS pct  -- ноль активных — тоже число
  FROM grid g
  LEFT JOIN activity a USING (cohort_week, n)
)
SELECT s.cohort_week, s.size,
       MAX(pct) FILTER (WHERE n = 1) AS w1, MAX(pct) FILTER (WHERE n = 2) AS w2,
       MAX(pct) FILTER (WHERE n = 3) AS w3, MAX(pct) FILTER (WHERE n = 4) AS w4,
       MAX(pct) FILTER (WHERE n = 5) AS w5, MAX(pct) FILTER (WHERE n = 6) AS w6,
       MAX(pct) FILTER (WHERE n = 7) AS w7, MAX(pct) FILTER (WHERE n = 8) AS w8
FROM sizes s
LEFT JOIN cells USING (cohort_week)
GROUP BY s.cohort_week, s.size
ORDER BY s.cohort_week;
