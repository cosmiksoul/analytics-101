SELECT product_name, category, price
FROM products
WHERE category IN ('свет', 'декор')   -- одно из значений списка
  AND price BETWEEN 1500 AND 2500     -- обе границы включены
  AND product_name LIKE '%«Сова»'     -- % — любые символы
ORDER BY price;
