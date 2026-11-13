-- 1. Очищенный слой: без дублей event_id и без ботов
CREATE TEMP VIEW clean AS
WITH dedup AS (
    SELECT DISTINCT ON (event_id) *          -- дубль — та же строка с тем же event_id
    FROM events
    ORDER BY event_id
), bots AS (
    SELECT anonymous_id                      -- больше 100 клиентских событий за минские сутки
    FROM dedup
    WHERE origin = 'client'
    GROUP BY anonymous_id, (event_time AT TIME ZONE 'Europe/Minsk')::date
    HAVING COUNT(*) > 100
)
SELECT * FROM dedup
WHERE anonymous_id IS NULL                   -- серверные события: устройства у них нет
   OR anonymous_id NOT IN (SELECT anonymous_id FROM bots);

-- 2. Пауза до предыдущего события того же устройства
CREATE TEMP VIEW gaps AS
SELECT anonymous_id, event_id, event_name, event_time,
       event_time - LAG(event_time) OVER w AS gap
FROM clean
WHERE origin = 'client'
WINDOW w AS (PARTITION BY anonymous_id ORDER BY event_time, event_id);

-- 3. Номер сессии: накопительная сумма меток «здесь началась новая сессия»
WITH s AS (
    SELECT *,
           SUM(CASE WHEN gap IS NULL OR gap > INTERVAL '30 minutes' THEN 1 ELSE 0 END)
               OVER (PARTITION BY anonymous_id ORDER BY event_time, event_id) AS session_no
    FROM gaps
)
SELECT anonymous_id AS device,
       to_char(event_time AT TIME ZONE 'Europe/Minsk', 'DD.MM HH24:MI:SS') AS minsk,
       event_name, gap, session_no
FROM s
WHERE anonymous_id IN ('d_f6f77955', 'd_398d33df')       -- телефон и ноутбук героя
  AND event_time >= TIMESTAMPTZ '2026-05-12 00:00+03'
ORDER BY event_time, event_id;

-- 4. Весь журнал: сессий при пороге 30 и 5 минут
SELECT COUNT(DISTINCT anonymous_id) AS devices,
       COUNT(*) FILTER (WHERE gap IS NULL OR gap > INTERVAL '30 minutes') AS sessions_30,
       COUNT(*) FILTER (WHERE gap IS NULL OR gap > INTERVAL '5 minutes')  AS sessions_5
FROM gaps;
