# Учебная база «shop» для темы 03 «SQL для анализа»

Одна база на все пять страниц темы: интернет-магазин товаров для дома, январь–март 2026. Данные сгенерированы (`gen.py`, seed 303), на страницах их называем учебными. Не меняйте `gen.py` и саму базу: если странице нужны свои маленькие таблицы, создавайте их во временной схеме или в коде страницы.

## Таблицы

| таблица | строк | столбцы |
|---|---|---|
| `countries` | 5 | `country_code` (PK: BY, RU, KZ, UZ, AM), `country_name`, `currency`. Клиентов из AM нет |
| `customers` | 60 | `customer_id` (101–160), `name`, `country_code` (у 117 и 142 — NULL), `signup_date` DATE (дек 2025 – мар 2026), `channel` (органика / реклама / рассылка — канал привлечения), `referrer_id` (кто пригласил, 16 не NULL — для самосоединения) |
| `products` | 32 | `product_id`, `product_name` («Плед «Кедр»»), `category` (свет, текстиль, посуда, декор — по 8), `brand` (Сова, Кедр, Луч, Бриз), `price` ₽ |
| `orders` | 231 | `order_id` (1001…), `customer_id`, `created_at` TIMESTAMP, `order_date` DATE, `brand` (заказ из одного бренда), `channel` (канал заказа), `amount` INTEGER ₽ = Σ qty·price, `status` (paid 195 / cancelled 36), `promo_code` (NULL 190, пустая строка '' — 7, ЗИМА10 / ВЕСНА15), `rating` 1–5 (NULL 127: у отменённых и у части оплаченных) |
| `order_items` | 388 | `order_id`, `product_id`, `qty`, `price` (PK — пара order_id, product_id) |
| `order_status_log` | 483 | `order_id`, `status` (created / paid / cancelled), `changed_at` TIMESTAMP — история статусов, последняя запись совпадает с `orders.status` |

Особенности, заложенные специально: 8 клиентов без заказов; 2 клиента без страны; страна AM без клиентов; `rating` и `promo_code` с NULL, у промокода ещё и пустые строки; заказ с `created_at` ровно в 00:00:00; у части оплаченных заказов потом отмена (последняя версия в логе — cancelled).

## Как подключиться

PostgreSQL 16.15 — настоящий сервер в песочнице (сокет в `/tmp`, пользователь `postgres`, без пароля):

```bash
pg_isready -h /tmp || su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /home/claude/pg/data -l /home/claude/pg/log.txt -o '-k /tmp -p 5432' start"
psql -h /tmp -U postgres -d shop -P pager=off -P null=NULL -c "SELECT …"
```

```python
import psycopg                      # 3.3.8
con = psycopg.connect("host=/tmp dbname=shop user=postgres")
```

Та же база в SQLite 3.53.1 — `shop.sqlite` (модуль `sqlite3`, pandas `read_sql`), и в DuckDB 2.0.0 — `shop.duckdb` (`import duckdb`). Схема и данные одинаковые, загружены из `shop.sql`.

## Правила для страниц темы 03

- Основной диалект — PostgreSQL 16: код страниц запускается на нём, бейдж `проверено: PostgreSQL 16`. Где диалекты расходятся (NULL в сортировке, деление целых, LIKE и регистр, DATE_TRUNC, LIMIT/TOP), прогоните тот же запрос в SQLite и DuckDB и покажите настоящую разницу. MS SQL и BigQuery в песочнице нет — о них пишите по документации и не выдавайте их вывод за запущенный.
- Вывод запросов — как в psql (выровненная таблица, `(N rows)`), NULL печатаем словом `NULL` через `-P null=NULL` и один раз говорим об этом в примечании к коду.
- В браузере SQL не выполняется: интерактивы считают результат на JS по маленькой выборке из этой базы. Выборку берите настоящим запросом и укажите его в тексте или примечании; каждое состояние интерактива сверьте с PostgreSQL.
