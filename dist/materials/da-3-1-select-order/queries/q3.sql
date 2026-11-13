SELECT DISTINCT channel
FROM orders
ORDER BY channel;

SELECT COUNT(*)                    AS all_orders,
       COUNT(rating)               AS rated,
       COUNT(DISTINCT customer_id) AS customers
FROM orders;
