-- Загрузка учебного журнала событий в PostgreSQL 16.
-- Запуск из корня папки материалов — оттуда, где лежит data/:
--   python -m gzip -d data/events/events.csv.gz     (распаковать журнал: появится data/events/events.csv, 31 МБ)
--   createdb events
--   psql -d events -f data/events/load_pg.sql
-- В Linux и macOS вместо python пишите python3. Параметры подключения (-h, -U) — как у вашего сервера.
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
CREATE TABLE events (
    event_id        text        NOT NULL,      -- не ключ: у 1,5% клиентских событий есть дубли с тем же event_id
    event_time      timestamptz NOT NULL,      -- UTC
    event_name      text        NOT NULL,
    origin          text        NOT NULL,      -- client / server
    anonymous_id    text,                      -- устройство; у серверных событий NULL
    user_id         text,                      -- аккаунт; NULL до входа
    platform        text        NOT NULL,      -- android / ios / web
    app_version     text,
    country         text        NOT NULL,
    traffic_source  text,
    product_id      integer,
    category        text,
    price           integer,
    order_id        text,
    revenue         integer
);
CREATE TABLE users (
    user_id             text PRIMARY KEY,
    signup_time         timestamptz NOT NULL,
    country             text NOT NULL,
    acquisition_channel text NOT NULL,
    signup_platform     text NOT NULL
);
\copy events FROM 'data/events/events.csv' WITH (FORMAT csv, HEADER true)
\copy users FROM 'data/events/users.csv' WITH (FORMAT csv, HEADER true)
CREATE INDEX ON events (anonymous_id, event_time);
CREATE INDEX ON events (user_id, event_time);
CREATE INDEX ON events (event_name, event_time);
ANALYZE events; ANALYZE users;
SELECT (SELECT count(*) FROM events) AS events, (SELECT count(*) FROM users) AS users;
