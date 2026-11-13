SELECT brand,
       COUNT(*)    AS orders,
       SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY brand
HAVING COUNT(*) >= 35
ORDER BY revenue DESC   -- псевдоним здесь уже есть
LIMIT 2;

-- в WHERE псевдонима ещё нет
SELECT brand, SUM(amount) AS revenue
FROM orders
WHERE revenue > 250000
GROUP BY brand;

-- условие на выручку бренда пишут в HAVING выражением
SELECT brand, SUM(amount) AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY brand
HAVING SUM(amount) > 250000
ORDER BY revenue DESC;
