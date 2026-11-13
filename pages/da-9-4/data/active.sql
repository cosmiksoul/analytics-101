-- Страница 9.4: DAU, WAU, MAU, липкость и баланс активных. PostgreSQL 16, база events.
-- Запуск: psql -h /tmp -U postgres -d events -P pager=off -P null=NULL -f active.sql
-- 1. Таблица «человек — день» по соглашениям темы
CREATE TEMP TABLE person_day AS
WITH dedup AS (                            -- без дублей event_id
  SELECT DISTINCT ON (event_id) *
  FROM events
  ORDER BY event_id
), local AS (                              -- день — минский
  SELECT *, (event_time AT TIME ZONE 'Europe/Minsk')::date AS day
  FROM dedup
), bots AS (                               -- больше 100 клиентских событий за сутки
  SELECT DISTINCT anonymous_id
  FROM local
  WHERE origin = 'client'
  GROUP BY anonymous_id, day
  HAVING COUNT(*) > 100
), device_user AS (                        -- склейка: устройство → аккаунт
  SELECT anonymous_id, MIN(user_id) AS user_id
  FROM local
  WHERE anonymous_id IS NOT NULL AND user_id IS NOT NULL
  GROUP BY anonymous_id
)
SELECT DISTINCT COALESCE(l.user_id, d.user_id, l.anonymous_id) AS person, l.day
FROM local AS l
LEFT JOIN device_user AS d ON d.anonymous_id = l.anonymous_id
WHERE l.day BETWEEN '2026-01-05' AND '2026-06-28'      -- 29 июня по Минску неполный
  AND NOT EXISTS (SELECT 1 FROM bots AS b WHERE b.anonymous_id = l.anonymous_id);

-- 2. DAU в среднем за месяц, MAU и липкость DAU/MAU
WITH dau AS (
  SELECT day, COUNT(*) AS dau
  FROM person_day
  GROUP BY day
), monthly AS (
  SELECT DATE_TRUNC('month', day)::date AS month, AVG(dau) AS avg_dau
  FROM dau
  GROUP BY 1
), mau AS (
  SELECT DATE_TRUNC('month', day)::date AS month, COUNT(DISTINCT person) AS mau
  FROM person_day
  GROUP BY 1
)
SELECT month, ROUND(avg_dau, 1) AS dau, mau,
       ROUND(avg_dau / mau, 3) AS stickiness
FROM monthly JOIN mau USING (month)
ORDER BY month;

-- 3. WAU и баланс активных: новые, удержанные, вернувшиеся, ушедшие
WITH pw AS (                               -- человек — неделя (с понедельника)
  SELECT DISTINCT person, DATE_TRUNC('week', day)::date AS week
  FROM person_day
), flags AS (
  SELECT person, week,
         week = MIN(week) OVER (PARTITION BY person)
           AND person NOT IN (SELECT user_id FROM users     -- старые аккаунты не новички
                              WHERE signup_time < '2026-01-05 00:00+03') AS is_new,
         LAG(week) OVER (PARTITION BY person ORDER BY week) = week - 7 AS active_last_week
  FROM pw
), weekly AS (
  SELECT week, COUNT(*) AS wau,
         COUNT(*) FILTER (WHERE is_new) AS new,
         COUNT(*) FILTER (WHERE active_last_week) AS retained,
         COUNT(*) FILTER (WHERE NOT is_new AND active_last_week IS NOT TRUE) AS returned
  FROM flags
  GROUP BY week
), balance AS (
  SELECT week, LAG(wau) OVER (ORDER BY week) AS prev_wau,
         new, retained, returned,
         LAG(wau) OVER (ORDER BY week) - retained AS churned, wau
  FROM weekly
)
SELECT * FROM balance
WHERE week >= '2026-05-04'                 -- окно уже посчитано по всем неделям
ORDER BY week;
