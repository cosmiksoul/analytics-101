-- сравнение с NULL даёт UNKNOWN, и строка выпадает
SELECT COUNT(*) AS not_zima
FROM orders
WHERE promo_code <> 'ЗИМА10';

-- «три лучших по оценке» за первую неделю февраля
SELECT order_id, amount, rating
FROM orders
WHERE order_date BETWEEN '2026-02-01' AND '2026-02-07'
ORDER BY rating DESC, order_id
LIMIT 3;

-- NULL в конец, вторая страница по три строки
SELECT order_id, amount, rating
FROM orders
WHERE order_date BETWEEN '2026-02-01' AND '2026-02-07'
ORDER BY rating DESC NULLS LAST, order_id
LIMIT 3 OFFSET 3;
