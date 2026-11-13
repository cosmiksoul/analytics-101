-- Загрузка учебных данных темы 11 в PostgreSQL 16.
-- Запуск из корня папки материалов — оттуда, где лежит data/:
--   python -m gzip -d data/ab/sessions.csv.gz     (распаковать сессии: появится data/ab/sessions.csv, 35 МБ)
--   createdb ab
--   psql -d ab -f data/ab/load_pg.sql
-- В Linux и macOS вместо python пишите python3. Параметры подключения (-h, -U) — как у вашего сервера.
DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS exposures; DROP TABLE IF EXISTS pre_period; DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id     text PRIMARY KEY,
    signup_date date NOT NULL,
    platform    text NOT NULL,
    app_version text,                      -- 3.1.4 — старый Android; у сайта NULL
    country     text NOT NULL
);
CREATE TABLE exposures (
    experiment text NOT NULL,
    user_id    text NOT NULL REFERENCES users,
    "group"    text NOT NULL,              -- по хешу соли и user_id
    exposed_at timestamptz NOT NULL,
    PRIMARY KEY (experiment, user_id)
);
CREATE TABLE sessions (
    experiment    text NOT NULL,
    user_id       text NOT NULL REFERENCES users,
    "group"       text NOT NULL,           -- как записал клиент; у 331 человека бывает чужая
    session_id    text PRIMARY KEY,
    session_start timestamptz NOT NULL,
    converted     smallint NOT NULL,
    orders        smallint NOT NULL,
    revenue       integer NOT NULL
);
CREATE TABLE pre_period (
    user_id      text PRIMARY KEY REFERENCES users,
    sessions_pre integer NOT NULL,
    orders_pre   integer NOT NULL,
    revenue_pre  integer NOT NULL
);
\copy users FROM 'data/ab/users.csv' WITH (FORMAT csv, HEADER true)
\copy exposures FROM 'data/ab/exposures.csv' WITH (FORMAT csv, HEADER true)
\copy sessions FROM 'data/ab/sessions.csv' WITH (FORMAT csv, HEADER true)
\copy pre_period FROM 'data/ab/pre_period.csv' WITH (FORMAT csv, HEADER true)
CREATE INDEX ON sessions (experiment, user_id);
ANALYZE;
SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM exposures) AS exposures,
       (SELECT count(*) FROM sessions) AS sessions, (SELECT count(*) FROM pre_period) AS pre_period;
