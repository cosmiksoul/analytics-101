# Учебная база shop

Общий набор данных темы 03 «SQL для анализа» курса «Аналитика 101». Интернет-магазин товаров для дома, январь–март 2026. Данные учебные: их сделал `gen.py` с зерном 303.

## Файлы

| файл | что это |
|---|---|
| `shop.sql` | Схема и данные для PostgreSQL: шесть таблиц, переносимый SQL |
| `shop.sqlite` | Та же база для SQLite и `pd.read_sql` |
| `shop.duckdb` | Та же база для DuckDB |
| `gen.py` | Генератор: пересобирает все три файла |

## Таблицы

| таблица | строк | столбцы |
|---|---|---|
| `countries` | 5 | `country_code` (BY, RU, KZ, UZ, AM), `country_name`, `currency`. Клиентов из AM нет |
| `customers` | 60 | `customer_id` (101–160), `name`, `country_code` (у 117 и 142 пусто), `signup_date`, `channel` — канал привлечения, `referrer_id` — кто пригласил, заполнен у 16 |
| `products` | 32 | `product_id`, `product_name`, `category` (свет, текстиль, посуда, декор), `brand` (Сова, Кедр, Луч, Бриз), `price` ₽ |
| `orders` | 231 | `order_id`, `customer_id`, `created_at` — метка времени, `order_date`, `brand`, `channel` — канал заказа, `amount` ₽, `status` (paid 195, cancelled 36), `promo_code` (пусто у 190, пустая строка у 7, ЗИМА10, ВЕСНА15), `rating` 1–5 (пусто у 127) |
| `order_items` | 388 | `order_id`, `product_id`, `qty`, `price`; ключ — пара (order_id, product_id) |
| `order_status_log` | 483 | `order_id`, `status` (created, paid, cancelled), `changed_at` — история статусов |

В данные нарочно заложено то, на чём учат страницы: 8 клиентов без заказов, 2 клиента без страны, страна без клиентов, пропуски в оценках и промокодах, пустые строки рядом с NULL, заказ ровно в полночь, оплаченные заказы, которые потом отменили.

## Как подключиться

PostgreSQL 16:

```
createdb shop
psql -d shop -f data/shop/shop.sql
```

Страницы темы запускают запросы командой `psql -d shop -f файл.sql`. Чтобы пустые значения печатались словом NULL, как в выводе на страницах, добавьте `-P null=NULL`.

SQLite и DuckDB из Python:

```python
import sqlite3, duckdb
lite = sqlite3.connect("data/shop/shop.sqlite")
duck = duckdb.connect("data/shop/shop.duckdb", read_only=True)
```

Пути в коде страниц заданы от корня папки материалов, поэтому запускайте скрипты оттуда: `python da-3-1-select-order/dialects.py`.

Скрипты, которые сравнивают три СУБД, подключаются к PostgreSQL строкой `host=/tmp dbname=shop user=postgres`. Замените её на свои настройки.

Код проверен на PostgreSQL 16.15, SQLite 3.53 и DuckDB 2.0.
