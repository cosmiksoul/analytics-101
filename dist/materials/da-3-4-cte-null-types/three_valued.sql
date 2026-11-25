-- Сверка интерактива «Трёхзначная логика» страницы 3.4 с PostgreSQL 16.
-- 14 условий на всех 24 сочетаниях значений rating и promo_code. В ответе t — TRUE, f — FALSE,
-- пусто или NULL — UNKNOWN: WHERE пропустил бы только строки с t.
-- Запуск: psql -P null=NULL -f da-3-4-cte-null-types/three_valued.sql   (таблицы базы не нужны)
--
-- Столбцы:
--   c01  rating >= 4
--   c02  promo_code <> 'ЗИМА10'
--   c03  rating >= 4 AND promo_code <> 'ЗИМА10'
--   c04  rating >= 4 OR promo_code <> 'ЗИМА10'
--   c05  rating >= 4 OR NOT (rating >= 4)
--   c06  NOT (rating >= 4)
--   c07  rating IN (4, 5)
--   c08  rating IN (4, 5, NULL)
--   c09  rating NOT IN (1, 2)
--   c10  rating NOT IN (1, 2, NULL)
--   c11  rating IS NULL
--   c12  NULLIF(promo_code, '') IS NULL
--   c13  COALESCE(rating, 0) < 4
--   c14  COALESCE(promo_code, '') <> 'ЗИМА10'

SELECT r.rating, p.promo_code,
       (rating >= 4) AS c01,
       (promo_code <> 'ЗИМА10') AS c02,
       (rating >= 4 AND promo_code <> 'ЗИМА10') AS c03,
       (rating >= 4 OR promo_code <> 'ЗИМА10') AS c04,
       (rating >= 4 OR NOT (rating >= 4)) AS c05,
       (NOT (rating >= 4)) AS c06,
       (rating IN (4, 5)) AS c07,
       (rating IN (4, 5, NULL)) AS c08,
       (rating NOT IN (1, 2)) AS c09,
       (rating NOT IN (1, 2, NULL)) AS c10,
       (rating IS NULL) AS c11,
       (NULLIF(promo_code, '') IS NULL) AS c12,
       (COALESCE(rating, 0) < 4) AS c13,
       (COALESCE(promo_code, '') <> 'ЗИМА10') AS c14
FROM unnest(ARRAY[5, 4, 3, 2, 1, NULL]::integer[]) WITH ORDINALITY AS r(rating, i)
CROSS JOIN unnest(ARRAY['ЗИМА10', 'ВЕСНА15', '', NULL]::text[]) WITH ORDINALITY AS p(promo_code, j)
ORDER BY r.i, p.j;
