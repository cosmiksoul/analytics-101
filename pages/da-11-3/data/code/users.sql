-- checkout_v2: лог сессий → строка на пользователя → сводка по группам
WITH per_user AS (                         -- группа — из показа (по хешу), а не из столбца group сессии
  SELECT x."group", x.user_id,
         count(s.session_id)           AS sessions,
         coalesce(sum(s.converted), 0) AS conv_sessions,
         coalesce(sum(s.orders), 0)    AS orders,
         coalesce(sum(s.revenue), 0)   AS revenue
  FROM exposures x
  LEFT JOIN sessions s ON s.experiment = x.experiment AND s.user_id = x.user_id
  WHERE x.experiment = 'checkout_v2'
  GROUP BY x."group", x.user_id
)
SELECT "group",
       count(*)                                             AS users,
       round(100.0 * avg((orders > 0)::int), 2)             AS buyers_pct,
       round(avg(revenue), 1)                               AS revenue_per_user,
       round(stddev_samp(revenue) / avg(revenue), 1)        AS revenue_cv,
       sum(sessions)                                        AS sessions,
       round(100.0 * sum(conv_sessions) / sum(sessions), 2) AS session_conv_pct
FROM per_user
WHERE NOT (sessions > 200 AND orders = 0)                  -- боты: сотни сессий и ни одного заказа
GROUP BY "group"
ORDER BY "group";
