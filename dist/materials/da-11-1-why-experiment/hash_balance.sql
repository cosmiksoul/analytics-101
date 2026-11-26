-- Страница 11.1 «Как оценить эффект релиза с помощью A/B-теста» курса «Аналитика 101».
-- Разбиение по хешу и проверка баланса групп в PostgreSQL 16. Нужна база ab: как её загрузить — в data/ab/README.md.
-- Запуск из корня папки материалов: psql -d ab -P null=NULL -f da-11-1-why-experiment/hash_balance.sql

-- 1. Группа по хешу: md5('соль:user_id'), первые 8 hex-символов как число, остаток от деления на 100
WITH salts (experiment, salt) AS (
  VALUES ('aa_check', 'aa-0824-7'), ('checkout_v2', 'chk-0907-3'), ('reco_block', 'reco-1005')
), hashed AS (
  SELECT e.experiment, e."group" AS logged,
         CASE WHEN ('x' || substr(md5(s.salt || ':' || e.user_id), 1, 8))::bit(32)::bigint % 100 < 50
              THEN 'A' ELSE 'B' END AS by_hash
  FROM exposures AS e
  JOIN salts AS s USING (experiment)
), counts AS (
  SELECT experiment,
         COUNT(*) FILTER (WHERE by_hash <> logged) AS mismatched,
         COUNT(*) FILTER (WHERE by_hash = 'A') AS a,
         COUNT(*) FILTER (WHERE by_hash = 'B') AS b
  FROM hashed
  GROUP BY experiment
)
SELECT experiment, mismatched, a, b,
       ROUND(100.0 * b / (a + b), 2) AS b_pct,
       -- хи-квадрат против 50/50 и его p-value: одна степень свободы, p = erfc(√(χ²/2))
       ROUND(power(a - b, 2)::numeric / (a + b), 2) AS chi2,
       ROUND(erfc(sqrt(power(a - b, 2) / (a + b) / 2))::numeric, 4) AS p_value
FROM counts
ORDER BY experiment;

-- 2. Баланс checkout_v2 по тому, что известно до теста
SELECT x."group",
       COUNT(*) AS users,
       ROUND(AVG((u.platform = 'android')::int) * 100, 1) AS android_pct,
       ROUND(AVG((u.country = 'BY')::int) * 100, 1) AS by_pct,
       ROUND(AVG((u.signup_date >= '2026-09-07')::int) * 100, 1) AS new_pct,
       ROUND(AVG(COALESCE(p.sessions_pre, 0)), 2) AS sessions_pre,
       ROUND(AVG(COALESCE(p.revenue_pre, 0)), 1) AS revenue_pre
FROM exposures AS x
JOIN users AS u USING (user_id)
LEFT JOIN pre_period AS p USING (user_id)
WHERE x.experiment = 'checkout_v2'
GROUP BY x."group"
ORDER BY x."group";

-- 3. Единица — пользователь, но до входа клиент делит устройство: сессии с чужой группой
SELECT COUNT(DISTINCT s.user_id) AS users, COUNT(*) AS sessions
FROM sessions AS s
JOIN exposures AS x USING (experiment, user_id)
WHERE s.experiment = 'checkout_v2' AND s."group" <> x."group";
