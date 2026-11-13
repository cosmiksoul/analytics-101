-- SELECT: какие столбцы, FROM: из какой таблицы
SELECT order_id, order_date, brand, amount
FROM orders
WHERE status = 'paid'          -- только оплаченные
ORDER BY amount DESC, order_id -- при равной сумме — по номеру
LIMIT 5;
