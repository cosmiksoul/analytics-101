-- Загрузка учебных данных темы 10 в PostgreSQL 16.
-- Запуск из корня папки материалов — оттуда, где лежит data/:
--   createdb unit
--   psql -d unit -f data/unit/load_pg.sql
-- Параметры подключения (-h, -U) — как у вашего сервера.
DROP TABLE IF EXISTS orders; DROP TABLE IF EXISTS activity; DROP TABLE IF EXISTS marketing_spend; DROP TABLE IF EXISTS clients;
CREATE TABLE clients (
    client_id   text PRIMARY KEY,
    signup_date date NOT NULL,
    channel     text NOT NULL,          -- органика / поиск / соцсети / партнёры
    country     text NOT NULL
);
CREATE TABLE orders (
    order_id      text PRIMARY KEY,
    client_id     text NOT NULL REFERENCES clients,
    order_date    date NOT NULL,
    model         text NOT NULL,        -- свой товар / маркетплейс
    gmv           integer NOT NULL,     -- оборот по ценам до скидки
    discount      integer NOT NULL,
    paid          integer NOT NULL,     -- gmv - discount
    refunded      smallint NOT NULL,    -- 1 = полный возврат
    revenue       integer NOT NULL,     -- выручка магазина до возвратов
    cogs          integer NOT NULL,
    delivery_cost integer NOT NULL,
    payment_fee   integer NOT NULL
);
CREATE TABLE activity (
    client_id text NOT NULL REFERENCES clients,
    month     text NOT NULL,            -- '2025-03'
    orders    integer NOT NULL,
    PRIMARY KEY (client_id, month)
);
CREATE TABLE marketing_spend (
    month   text NOT NULL,
    channel text NOT NULL,
    spend   integer NOT NULL,
    PRIMARY KEY (month, channel)
);
\copy clients FROM 'data/unit/clients.csv' WITH (FORMAT csv, HEADER true)
\copy orders FROM 'data/unit/orders.csv' WITH (FORMAT csv, HEADER true)
\copy activity FROM 'data/unit/activity.csv' WITH (FORMAT csv, HEADER true)
\copy marketing_spend FROM 'data/unit/marketing_spend.csv' WITH (FORMAT csv, HEADER true)
CREATE INDEX ON orders (client_id, order_date);
ANALYZE;
SELECT (SELECT count(*) FROM clients) AS clients, (SELECT count(*) FROM orders) AS orders,
       (SELECT count(*) FROM activity) AS activity, (SELECT count(*) FROM marketing_spend) AS spend_rows;
