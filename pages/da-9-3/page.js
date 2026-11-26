/* Страница 9.3 · Удержание и когорты */
(() => {
  /* Данные — из data/gen_page.py по учебному журналу data/events: размеры 25 недельных когорт, счётчики трёх видов
     удержания [когорта][n−1], кривые рекламных новичков кампании для модели ползунка, DAU по дням. */
  /*data:start*/const DATA = {"weeks":["5 янв","12 янв","19 янв","26 янв","2 фев","9 фев","16 фев","23 фев","2 мар","9 мар","16 мар","23 мар","30 мар","6 апр","13 апр","20 апр","27 апр","4 мая","11 мая","18 мая","25 мая","1 июн","8 июн","15 июн","22 июн"],"size":[284,297,287,283,307,287,289,290,314,298,308,305,316,581,502,612,583,351,352,356,353,376,367,365,410],"C":[[99,55,55,52,44,54,37,38,55,37,37,46,50,44,44,48,47,45,45,42,36,54,46,46],[100,61,58,40,52,45,51,48,38,51,49,50,48,60,36,61,47,49,46,42,46,41,43],[96,70,52,45,34,46,45,37,36,42,46,39,37,38,41,51,49,39,41,42,40,45],[88,64,52,38,47,40,37,40,49,40,35,47,36,39,35,54,42,48,50,36,46],[107,70,51,49,40,42,51,49,47,40,41,46,57,40,34,44,51,40,51,45],[100,69,54,45,47,54,48,41,52,49,43,48,42,41,40,37,41,48,32],[105,62,57,49,44,47,40,46,45,45,55,50,52,41,47,39,39,40],[96,57,43,45,36,33,47,44,46,38,49,43,49,37,31,44,40],[103,75,65,49,51,56,57,55,43,44,44,55,54,44,48,52],[115,74,58,48,39,50,49,47,44,41,49,45,46,42,38],[107,78,70,66,66,61,51,59,56,50,63,60,55,58],[104,78,60,60,60,64,57,47,48,54,52,57,49],[105,76,51,57,65,54,70,65,57,65,63,54],[165,119,85,94,74,93,87,86,82,89,80],[141,111,73,87,84,71,86,82,75,65],[179,143,121,101,88,105,86,92,84],[178,139,114,95,96,87,81,94],[96,74,51,60,54,60,60],[113,79,60,69,62,54],[139,82,74,73,75],[124,89,63,66],[131,99,84],[125,105],[114],[]],"R":[[221,210,210,206,202,200,196,193,193,188,186,181,178,173,164,162,155,146,134,121,112,102,74,46],[231,229,226,217,216,216,212,208,203,201,194,185,180,169,162,160,146,136,124,113,102,77,43],[213,210,204,202,200,198,196,189,187,183,177,172,167,160,156,150,139,126,111,99,75,45],[214,208,203,200,197,195,191,188,184,181,173,169,161,157,152,143,129,112,96,67,46],[221,212,204,201,197,194,193,186,179,175,170,163,159,146,137,129,119,97,79,45],[204,193,190,188,186,182,177,172,168,162,154,149,140,128,116,100,89,68,32],[217,210,207,202,200,192,188,186,178,171,164,154,145,125,114,92,70,40],[210,197,195,189,183,180,174,168,160,152,145,131,126,107,92,76,40],[220,214,204,197,192,184,175,159,152,146,140,133,118,99,79,52],[212,202,198,185,176,173,168,161,154,146,132,118,94,73,38],[220,208,203,196,186,182,172,163,155,143,134,115,90,58],[209,199,194,188,175,168,153,145,138,129,110,86,49],[217,211,202,196,189,181,174,157,140,126,92,54],[355,327,308,294,272,260,235,209,182,144,80],[309,294,272,261,235,213,191,159,113,65],[372,340,307,279,253,229,184,146,84],[350,306,274,243,215,180,141,94],[189,170,152,137,121,95,60],[200,169,147,132,94,54],[211,171,144,120,75],[184,143,103,66],[188,143,84],[171,105],[114],[]],"B":[[99,120,140,156,161,171,179,182,189,193,197,197,200,206,206,208,212,213,214,216,217,219,221,221],[100,121,140,143,152,165,170,178,180,189,195,202,205,208,210,216,218,220,220,223,225,225,231],[96,116,131,141,149,157,164,168,172,178,185,188,191,192,196,199,201,204,207,211,211,213],[88,115,131,136,147,153,160,169,175,181,184,189,194,194,197,201,204,207,210,213,214],[107,138,153,163,168,174,184,186,191,194,199,204,208,209,211,213,215,217,221,221],[100,120,132,141,150,158,166,172,175,180,184,186,190,191,194,196,198,200,204],[105,127,136,146,156,164,170,177,185,190,194,197,200,202,208,210,211,217],[96,118,129,142,154,160,166,174,182,188,191,194,200,202,204,207,210],[103,135,154,162,168,176,187,192,193,199,202,206,211,213,219,220],[115,142,157,165,171,180,183,188,194,196,202,206,208,210,212],[107,137,155,166,180,189,195,200,203,209,212,214,214,220],[104,137,151,165,178,186,191,194,198,201,206,207,209],[105,137,152,169,183,187,196,201,203,210,215,217],[165,211,240,267,280,304,314,326,336,348,355],[141,191,210,235,253,264,286,295,303,309],[179,235,274,301,318,339,352,363,372],[178,237,272,292,313,329,338,350],[96,126,135,152,165,178,189],[113,146,167,181,190,200],[139,170,190,200,211],[124,156,170,184],[131,163,188],[125,171],[114],[]],"add":{"n":1283,"from":17,"C":[0.2518,0.1824,0.1395,0.1294,0.113,0.1216,0.1115],"B":[0.2518,0.339,0.3944,0.4302,0.4567,0.4817,0.5074],"R":[[0.2518],[0.339,0.1824],[0.3944,0.2681,0.1395],[0.4302,0.3235,0.2245,0.1294],[0.4567,0.3617,0.279,0.1995,0.113],[0.4817,0.4014,0.3313,0.2681,0.1995,0.1216],[0.5074,0.4349,0.3733,0.3196,0.2627,0.2019,0.1115]],"d":[1.0,0.1005,0.0857,0.0772,0.0818,0.0647,0.0647,0.0592,0.0429,0.0374,0.0335,0.046,0.0398,0.0421,0.0265,0.0242,0.0335,0.0226,0.0265,0.0265,0.0226,0.0273,0.0249,0.0203,0.0218,0.0242,0.0171,0.0249,0.0226,0.0265,0.0218,0.0226,0.021,0.014,0.0195,0.0171,0.0226,0.0164,0.0249,0.0273,0.0218,0.014,0.0242,0.0164,0.0187,0.021,0.0195,0.0203,0.0195,0.0179,0.0234,0.0164,0.0195,0.0195,0.0265,0.0187]},"dau":[100,116,119,118,110,129,128,139,118,146,108,136,133,120,162,137,138,135,115,157,156,159,147,167,147,149,137,151,185,155,160,153,157,184,164,181,189,159,183,175,165,169,193,171,182,162,160,188,172,178,181,175,175,183,173,163,188,174,187,191,190,219,213,210,221,190,191,169,164,222,225,206,220,200,190,196,212,244,236,225,206,223,236,225,222,245,252,237,234,228,236,258,275,266,292,283,313,315,294,290,306,298,295,310,296,348,344,349,332,355,351,332,356,359,337,318,339,342,354,328,330,311,330,344,346,309,320,321,342,319,322,349,346,327,348,331,366,343,362,353,366,369,357,336,305,361,342,398,347,335,329,375,356,396,390,347,378,405,394,337,416,379,416,395,387,415,389,369,390,420,402,432,394,420,410],"hero":{"id":"u_03753","w":[0,2,3,7]}};/*data:end*/
  /*code:start*/const CODE = {"sql": {"title": "Таблица когорт из таблицы «пользователь — день»", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- 1. Таблица «пользователь — день», как в 9.1: временная, общую базу не трогаем\nCREATE TEMP TABLE user_day AS\nWITH bots AS (                            -- больше 100 клиентских событий за сутки\n  SELECT DISTINCT anonymous_id\n  FROM (SELECT DISTINCT event_id, anonymous_id, event_time FROM events WHERE origin = 'client') e\n  GROUP BY anonymous_id, (event_time AT TIME ZONE 'Europe/Minsk')::date\n  HAVING COUNT(*) > 100\n), clean AS (                             -- без дублей event_id и без ботов\n  SELECT DISTINCT ON (event_id) *\n  FROM events\n  WHERE anonymous_id IS NULL OR anonymous_id NOT IN (SELECT anonymous_id FROM bots)\n  ORDER BY event_id\n), device AS (                            -- склейка: устройство → аккаунт\n  SELECT anonymous_id, MIN(user_id) AS user_id\n  FROM clean\n  WHERE anonymous_id IS NOT NULL AND user_id IS NOT NULL\n  GROUP BY anonymous_id\n)\nSELECT COALESCE(c.user_id, d.user_id, c.anonymous_id) AS person,\n       (c.event_time AT TIME ZONE 'Europe/Minsk')::date AS day,     -- день — минский\n       COUNT(*) AS events,\n       COUNT(*) FILTER (WHERE c.event_name = 'app_open')   AS app_opens,\n       COUNT(*) FILTER (WHERE c.event_name = 'order_paid') AS orders\nFROM clean c\nLEFT JOIN device d USING (anonymous_id)\nWHERE (c.event_time AT TIME ZONE 'Europe/Minsk')::date\n      BETWEEN DATE '2026-01-05' AND DATE '2026-06-28'              -- неполные дни по краям отброшены\nGROUP BY 1, 2;\n\n-- 2. Таблица когорт: строка — неделя прихода, столбец — неделя жизни n\nWITH arrival AS (                         -- приход: первый день или регистрация, что раньше\n  SELECT ud.person,\n         LEAST(MIN(ud.day), MIN((u.signup_time AT TIME ZONE 'Europe/Minsk')::date)) AS arrived\n  FROM user_day ud\n  LEFT JOIN users u ON u.user_id = ud.person\n  GROUP BY ud.person\n), cohort AS (\n  SELECT person, DATE_TRUNC('week', arrived)::date AS cohort_week\n  FROM arrival\n  WHERE arrived >= DATE '2026-01-05'      -- старые аккаунты — не новички января\n), sizes AS (\n  SELECT cohort_week, COUNT(*) AS size FROM cohort GROUP BY cohort_week\n), activity AS (                          -- сколько людей когорты активны в неделю n\n  SELECT c.cohort_week,\n         (DATE_TRUNC('week', ud.day)::date - c.cohort_week) / 7 AS n,\n         COUNT(DISTINCT ud.person) AS active\n  FROM user_day ud\n  JOIN cohort c USING (person)\n  GROUP BY 1, 2\n), grid AS (                              -- только прожитые клетки: неделя n уже закончилась\n  SELECT s.cohort_week, s.size, g.n\n  FROM sizes s\n  CROSS JOIN generate_series(1, 8) AS g(n)\n  WHERE s.cohort_week + 7 * g.n <= (SELECT DATE_TRUNC('week', MAX(day))::date FROM user_day)\n), cells AS (\n  SELECT g.cohort_week, g.n,\n         ROUND(100.0 * COALESCE(a.active, 0) / g.size, 1) AS pct  -- ноль активных — тоже число\n  FROM grid g\n  LEFT JOIN activity a USING (cohort_week, n)\n)\nSELECT s.cohort_week, s.size,\n       MAX(pct) FILTER (WHERE n = 1) AS w1, MAX(pct) FILTER (WHERE n = 2) AS w2,\n       MAX(pct) FILTER (WHERE n = 3) AS w3, MAX(pct) FILTER (WHERE n = 4) AS w4,\n       MAX(pct) FILTER (WHERE n = 5) AS w5, MAX(pct) FILTER (WHERE n = 6) AS w6,\n       MAX(pct) FILTER (WHERE n = 7) AS w7, MAX(pct) FILTER (WHERE n = 8) AS w8\nFROM sizes s\nLEFT JOIN cells USING (cohort_week)\nGROUP BY s.cohort_week, s.size\nORDER BY s.cohort_week;", "out": "SELECT 45250\n cohort_week | size |  w1  |  w2  |  w3  |  w4  |  w5  |  w6  |  w7  |  w8  \n-------------+------+------+------+------+------+------+------+------+------\n 2026-01-05  |  284 | 34.9 | 19.4 | 19.4 | 18.3 | 15.5 | 19.0 | 13.0 | 13.4\n 2026-01-12  |  297 | 33.7 | 20.5 | 19.5 | 13.5 | 17.5 | 15.2 | 17.2 | 16.2\n 2026-01-19  |  287 | 33.4 | 24.4 | 18.1 | 15.7 | 11.8 | 16.0 | 15.7 | 12.9\n 2026-01-26  |  283 | 31.1 | 22.6 | 18.4 | 13.4 | 16.6 | 14.1 | 13.1 | 14.1\n 2026-02-02  |  307 | 34.9 | 22.8 | 16.6 | 16.0 | 13.0 | 13.7 | 16.6 | 16.0\n 2026-02-09  |  287 | 34.8 | 24.0 | 18.8 | 15.7 | 16.4 | 18.8 | 16.7 | 14.3\n 2026-02-16  |  289 | 36.3 | 21.5 | 19.7 | 17.0 | 15.2 | 16.3 | 13.8 | 15.9\n 2026-02-23  |  290 | 33.1 | 19.7 | 14.8 | 15.5 | 12.4 | 11.4 | 16.2 | 15.2\n 2026-03-02  |  314 | 32.8 | 23.9 | 20.7 | 15.6 | 16.2 | 17.8 | 18.2 | 17.5\n 2026-03-09  |  298 | 38.6 | 24.8 | 19.5 | 16.1 | 13.1 | 16.8 | 16.4 | 15.8\n 2026-03-16  |  308 | 34.7 | 25.3 | 22.7 | 21.4 | 21.4 | 19.8 | 16.6 | 19.2\n 2026-03-23  |  305 | 34.1 | 25.6 | 19.7 | 19.7 | 19.7 | 21.0 | 18.7 | 15.4\n 2026-03-30  |  316 | 33.2 | 24.1 | 16.1 | 18.0 | 20.6 | 17.1 | 22.2 | 20.6\n 2026-04-06  |  581 | 28.4 | 20.5 | 14.6 | 16.2 | 12.7 | 16.0 | 15.0 | 14.8\n 2026-04-13  |  502 | 28.1 | 22.1 | 14.5 | 17.3 | 16.7 | 14.1 | 17.1 | 16.3\n 2026-04-20  |  612 | 29.2 | 23.4 | 19.8 | 16.5 | 14.4 | 17.2 | 14.1 | 15.0\n 2026-04-27  |  583 | 30.5 | 23.8 | 19.6 | 16.3 | 16.5 | 14.9 | 13.9 | 16.1\n 2026-05-04  |  351 | 27.4 | 21.1 | 14.5 | 17.1 | 15.4 | 17.1 | 17.1 | NULL\n 2026-05-11  |  352 | 32.1 | 22.4 | 17.0 | 19.6 | 17.6 | 15.3 | NULL | NULL\n 2026-05-18  |  356 | 39.0 | 23.0 | 20.8 | 20.5 | 21.1 | NULL | NULL | NULL\n 2026-05-25  |  353 | 35.1 | 25.2 | 17.8 | 18.7 | NULL | NULL | NULL | NULL\n 2026-06-01  |  376 | 34.8 | 26.3 | 22.3 | NULL | NULL | NULL | NULL | NULL\n 2026-06-08  |  367 | 34.1 | 28.6 | NULL | NULL | NULL | NULL | NULL | NULL\n 2026-06-15  |  365 | 31.2 | NULL | NULL | NULL | NULL | NULL | NULL | NULL\n 2026-06-22  |  410 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL\n(25 rows)", "outLabel": "Вывод psql: создание таблицы, затем таблица когорт, % когорты", "note": "NULL в выводе — клетка, неделя которой ещё не закончилась: так настроен psql (-P null=NULL). Числа совпадают с pandas ниже и с интерактивом: это одна и та же таблица когорт."}, "pandas": {"title": "Три вида удержания из одной таблицы", "badge": "проверено: Python 3.13, pandas 3.0.5", "lang": "python", "code": "import pandas as pd\n\nSTART, LAST = pd.Timestamp(\"2026-01-05\"), pd.Timestamp(\"2026-06-28\")\nminsk_day = lambda s: s.dt.tz_convert(\"Europe/Minsk\").dt.tz_localize(None).dt.normalize()\n\n# таблица «пользователь — день», как в 9.1: без дублей, без ботов, склейка, минский день\nev = pd.read_parquet(\"data/events/events.parquet\").drop_duplicates(\"event_id\")\nev[\"day\"] = minsk_day(ev[\"event_time\"])\nper_day = ev[ev[\"origin\"] == \"client\"].groupby([\"anonymous_id\", \"day\"]).size()\nbots = per_day[per_day > 100].index.get_level_values(\"anonymous_id\").unique()\nev = ev[~ev[\"anonymous_id\"].isin(bots)]\naccount = ev.dropna(subset=[\"anonymous_id\", \"user_id\"]).groupby(\"anonymous_id\")[\"user_id\"].first()\nev[\"person\"] = ev[\"user_id\"].fillna(ev[\"anonymous_id\"].map(account)).fillna(ev[\"anonymous_id\"])\nud = ev.loc[ev[\"day\"].between(START, LAST), [\"person\", \"day\"]].drop_duplicates()\n\n# когорта — неделя прихода (первый день или регистрация, что раньше); старые аккаунты — не новички\nusers = pd.read_csv(\"data/events/users.csv\", parse_dates=[\"signup_time\"]).set_index(\"user_id\")\nfirst = ud.groupby(\"person\")[\"day\"].min()\narrived = pd.concat([first, minsk_day(users[\"signup_time\"]).reindex(first.index)], axis=1).min(axis=1)\nweek = lambda d: (d - START).dt.days // 7               # 0 = неделя 5 января\ncohort = week(arrived[arrived >= START])\nsize = cohort.value_counts().sort_index()\n\nact = ud[ud[\"person\"].isin(cohort.index)].assign(c=lambda d: d[\"person\"].map(cohort))\nact[\"n\"] = week(act[\"day\"]) - act[\"c\"]\nact = act[act[\"n\"] >= 1].drop_duplicates([\"person\", \"n\"])  # неделя 0 — сам приход\n\nN = range(1, 25)\nclassic = act.groupby([\"c\", \"n\"])[\"person\"].nunique().unstack(fill_value=0).reindex(columns=N, fill_value=0)\nper_person = act.groupby(\"person\")[\"n\"].agg([\"min\", \"max\"]).join(cohort.rename(\"c\"))\nby_last = pd.crosstab(per_person[\"c\"], per_person[\"max\"]).reindex(columns=N, fill_value=0)\nby_first = pd.crosstab(per_person[\"c\"], per_person[\"min\"]).reindex(columns=N, fill_value=0)\nrolling = by_last.loc[:, ::-1].cumsum(axis=1).loc[:, ::-1]   # активен в неделю n или позже\nreturned = by_first.cumsum(axis=1)                            # хотя бы раз за недели 1…n\n\nlived = pd.DataFrame({n: size.index + n <= 24 for n in N}, index=size.index)  # неделя n уже прошла\nshare = lambda m: (100 * m.div(size, axis=0)).where(lived).round(1).rename_axis(columns=\"n\")\ntypes = {\"классическое\": share(classic), \"скользящее\": share(rolling), \"возвратное\": share(returned)}\n\nrows = [10, 13, 21]                                       # 16 марта, 6 апреля, 1 июня\nfor name, m in types.items():\n    print(f\"{name}, % когорты:\")\n    print(m.loc[rows, 1:7].set_axis([f\"{START + pd.Timedelta(weeks=c):%d.%m}\" for c in rows]).to_string(), \"\\n\")\n\nhero = act.loc[act[\"person\"] == \"u_03753\", \"n\"].tolist()\nprint(\"u_03753 возвращался в недели\", hero)\nprint(\"n:          \", *range(1, 9))\nprint(\"классическое\", *[int(n in hero) for n in range(1, 9)])\nprint(\"скользящее  \", *[int(max(hero) >= n) for n in range(1, 9)])\nprint(\"возвратное  \", *[int(min(hero) <= n) for n in range(1, 9)])", "out": "классическое, % когорты:\nn         1     2     3     4     5     6     7\n16.03  34.7  25.3  22.7  21.4  21.4  19.8  16.6\n06.04  28.4  20.5  14.6  16.2  12.7  16.0  15.0\n01.06  34.8  26.3  22.3   NaN   NaN   NaN   NaN \n\nскользящее, % когорты:\nn         1     2     3     4     5     6     7\n16.03  71.4  67.5  65.9  63.6  60.4  59.1  55.8\n06.04  61.1  56.3  53.0  50.6  46.8  44.8  40.4\n01.06  50.0  38.0  22.3   NaN   NaN   NaN   NaN \n\nвозвратное, % когорты:\nn         1     2     3     4     5     6     7\n16.03  34.7  44.5  50.3  53.9  58.4  61.4  63.3\n06.04  28.4  36.3  41.3  46.0  48.2  52.3  54.0\n01.06  34.8  43.4  50.0   NaN   NaN   NaN   NaN \n\nu_03753 возвращался в недели [2, 3, 7]\nn:           1 2 3 4 5 6 7 8\nклассическое 0 1 1 0 0 0 1 0\nскользящее   1 1 1 1 1 1 1 0\nвозвратное   0 1 1 1 1 1 1 1", "outLabel": "Вывод: три строки каждой матрицы и проверка на одном человеке", "note": "Для когорты 1 июня последняя доступная неделя — третья. Поэтому на этой неделе классическое и скользящее удержание совпадают."}, "plots": {"title": "Удержание по неделям и группам когорт", "badge": "проверено: Python 3.13, pandas 3.0.5, Matplotlib 3.10.0", "lang": "python", "code": "import os\n\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nfrom matplotlib.colors import LinearSegmentedColormap\n\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 9, \"axes.spines.top\": False, \"axes.spines.right\": False})\nACCENT, CAMP, DARK, GREY = \"#0d7468\", \"#c2417a\", \"#454f62\", \"#9aa3b2\"\nteal = LinearSegmentedColormap.from_list(\"teal\", [\"#f5f6f8\", ACCENT])   # один тон: темнее — больше\nm = types[\"классическое\"].loc[:, 1:12]                                  # 25 когорт × недели 1–12\nlabels = [f\"{START + pd.Timedelta(weeks=c):%d.%m}\" for c in m.index]\n\n# 1. Тепловая карта: строка — когорта, столбец — неделя жизни\nfig, ax = plt.subplots(figsize=(6.4, 6), layout=\"constrained\")\nim = ax.imshow(m.to_numpy(), cmap=teal, vmin=0, vmax=40, aspect=\"auto\", interpolation=\"nearest\",\n               extent=(0.5, 12.5, len(m) - 0.5, -0.5))                 # растр 25 × 12 весит в SVG мало\nax.hlines([y + 0.5 for y in range(len(m) - 1)], 0.5, 12.5, color=\"white\", linewidth=0.6)\nax.vlines([x + 0.5 for x in range(1, 12)], -0.5, len(m) - 0.5, color=\"white\", linewidth=0.6)\nax.set(xticks=list(m.columns), yticks=range(len(m)), yticklabels=labels, xlabel=\"неделя жизни когорты n\")\nax.tick_params(length=0)\nax.spines[:].set_visible(False)\nax.axhline(9.5, color=\"#141a24\", linewidth=1)                         # события — подписью на месте\nax.annotate(\"релиз 3.0\", (12.5, 9.5), xytext=(6, 0), textcoords=\"offset points\", va=\"center\")\nax.plot([12.8, 12.8], [12.6, 16.4], color=CAMP, linewidth=2, clip_on=False)\nax.annotate(\"кампания\", (12.8, 14.5), xytext=(6, 0), textcoords=\"offset points\", va=\"center\", color=CAMP,\n            annotation_clip=False)\nax.set_xlim(0.5, 12.5)\nfig.colorbar(im, ax=ax, shrink=0.45, location=\"bottom\", label=\"% когорты, активной в неделю n\")\nfig.suptitle(\"Доля вернувшихся выше у мартовских когорт\\nпосле релиза\", x=0.02, ha=\"left\",\n             fontweight=\"bold\", fontsize=11)\nax.set_title(\"Классическое удержание. В пустых ячейках неделя ещё не закончилась\",\n             loc=\"left\", fontsize=8, color=\"#737c8f\")\nfig.savefig(\"heatmap.svg\")\n\n# 2. Кривые: каждая когорта — серая линия, три группы — взвешенное среднее с прямой подписью\ncnt = classic.loc[:, 1:12]\ngroups = {\"до релиза\": (range(0, 10), DARK, (6, 0)), \"16–30 марта\": (range(10, 13), ACCENT, (6, 0)),\n          \"кампания\": (range(13, 17), CAMP, (-10, -34))}\nfig, ax = plt.subplots(figsize=(6.4, 3.8), layout=\"constrained\")\nfor c in m.index:\n    ax.plot(m.columns, m.loc[c], color=GREY, linewidth=0.6, alpha=0.6)\nfor name, (rows, color, offset) in groups.items():\n    rows = list(rows)\n    w = cnt.loc[rows].sum() / size[rows].sum() * 100                  # все вернувшиеся / все пришедшие\n    w = w[m.loc[rows].notna().all()]                                 # только недели, прожитые всеми\n    ax.plot(w.index, w, color=color, linewidth=2.2)\n    ax.annotate(f\"{name}: плато {w.loc[4:9].mean():.1f}%\".replace(\".\", \",\"), (w.index[-1], w.iloc[-1]),\n                xytext=offset, textcoords=\"offset points\", va=\"center\", color=color, fontweight=\"bold\",\n                arrowprops=None if offset[1] == 0 else {\"arrowstyle\": \"-\", \"color\": color, \"linewidth\": 0.8})\nax.axvspan(4, 9, color=\"#edf0f4\", zorder=0)\nax.text(6.5, 35, \"плато: недели 4–9\", ha=\"center\", color=\"#737c8f\")\nax.set(xlim=(1, 12), ylim=(0, 40), xticks=range(1, 13), xlabel=\"неделя жизни когорты n\", ylabel=\"% когорты\")\nfig.suptitle(\"После релиза плато выше: 19% у мартовских когорт\", x=0.02, ha=\"left\",\n             fontweight=\"bold\", fontsize=11)\nax.set_title(\"Тонкие линии — отдельные когорты. Источник: учебный журнал событий\",\n             loc=\"left\", fontsize=7.5, color=\"#737c8f\")\nfig.savefig(\"curves.svg\")\nprint({f: round(os.path.getsize(f) / 1024, 1) for f in [\"heatmap.svg\", \"curves.svg\"]}, \"КБ\")", "out": "{'heatmap.svg': 32.6, 'curves.svg': 28.2} КБ", "outLabel": "Размер файлов с графиками", "note": "Выполните предыдущую ячейку, чтобы получить types, classic, size и START. Код сохранит тепловую карту и кривые в двух файлах SVG."}};/*code:end*/

  const NW = 25, S = DATA.size, A = DATA.add;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const pct = (v, d = 1) => (100 * v).toFixed(d).replace('.', ',');
  const sp = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const isCamp = c => c >= 13 && c <= 16;
  const GROUPS = [[0, 9, 'до релиза'], [10, 12, '16–30 марта'], [13, 16, 'кампания']];
  /* классическое удержание когорты c в неделю n (доля), n = 0 — неделя прихода */
  const rc = (c, n) => n === 0 ? 1 : n <= 24 - c ? DATA.C[c][n - 1] / S[c] : null;
  const active = (c, n) => n === 0 ? S[c] : DATA.C[c][n - 1];
  /* взвешенная кривая группы: все вернувшиеся / все пришедшие, только недели, прожитые всеми */
  const groupCurve = (a, b, nmax) => {
    const out = [];
    for (let n = 1; n <= nmax && n <= 24 - b; n++) { let x = 0, s = 0; for (let c = a; c <= b; c++) { x += DATA.C[c][n - 1]; s += S[c]; } out.push(x / s); }
    return out;
  };
  const plateau = cur => { const v = cur.slice(3, 9); return v.reduce((s, x) => s + x, 0) / v.length; };
  const GC = GROUPS.map(([a, b]) => groupCurve(a, b, 12));
  const PL = GC.map(plateau);

  /* ===================== Сцена ===================== */
  const DOTS = S.map(s => Math.round(s / 20));
  const SC = { teal: '#36b8a6', pink: '#f06ba5', dim: '#1d2638', mut: '#6f7a91', ink: '#e8ecf4', ink2: '#b7c0d2', yel: '#e3c04d', bg: '#0e1422' };
  const heatS = v => { const t = clamp((v - 0.1) / 0.3, 0, 1); const a = [20, 27, 43], b = [54, 184, 166]; return `rgb(${a.map((x, i) => Math.round(lerp(x, b[i], t))).join(',')})`; };
  /* время сцены в неделях журнала для шагов с точками */
  const TL = { 0: [0, 0], 1: [0, 1], 2: [1, 9.99], 3: [10, 12.99], 4: [13, 16.99], 5: [17, 24.5] };
  function scT(k, p) { const r = TL[k]; return r ? lerp(r[0], r[1], k === 0 ? 0 : p) : 24; }
  function lay(W, H) {
    const nar = W < 480, top = 22, bot = H - 6, rh = (bot - top) / NW, labW = nar ? 34 : 48, x0 = labW + 6;
    const ds = Math.min(13, (W - x0 - (nar ? 8 : 96)) / 31), cw = (W - x0 - (nar ? 6 : 96)) / NW;
    const cx0 = nar ? 30 : 46, cx1 = W - (nar ? 58 : 150), cy0 = 30, cy1 = H - 26;
    return { nar, top, rh, labW, x0, ds, cw, rad: Math.min(rh * 0.36, ds * 0.42), cx0, cx1, cy0, cy1, X: n => cx0 + (n - 1) / 11 * (cx1 - cx0), Y: v => cy1 - clamp(v, 0, 0.42) / 0.4 * (cy1 - cy0) };
  }
  const tx = (x, y, s, o = {}) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.fs || 11}" fill="${o.c || SC.mut}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.w ? ` font-weight="${o.w}"` : ''}${o.op != null ? ` opacity="${o.op.toFixed(2)}"` : ''}>${s}</text>`;
  function call(x, y, s, o = {}) {           // выноска: подпись на тёмной плашке
    const fs = o.fs || 11.5, w = s.length * fs * 0.56 + 14, h = fs + 10, X = o.a === 'end' ? x - w : o.a === 'middle' ? x - w / 2 : x;
    return `<g opacity="${(o.op == null ? 1 : o.op).toFixed(2)}"><rect x="${X.toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="6" fill="#141b2b" stroke="${o.c || SC.teal}"/>${tx(X + 7, y + fs * 0.36, s, { fs, c: SC.ink })}</g>`;
  }
  function drawDots(L, t, alpha, first) {
    const T = Math.floor(t), fr = t - T; let s = '';
    for (let c = 0; c <= Math.min(T, 24); c++) {
      const y = L.top + (c + 0.5) * L.rh, n = T - c, a = (first == null ? clamp((t - c) * 3 + 1, 0, 1) : first) * alpha;
      const r0 = rc(c, n), r1 = rc(c, n + 1), v = r1 == null || n + 1 > 24 - c ? r0 : lerp(r0, r1, fr);
      const lit = DOTS[c] * v, col = isCamp(c) ? SC.pink : SC.teal;
      if (!L.nar || c % 4 === 0 || c === T) s += tx(L.labW, y + 3.5, DATA.weeks[c], { a: 'end', fs: L.nar ? 9 : 10, op: a });
      for (let i = 0; i < DOTS[c]; i++) {
        const o = i < Math.floor(lit) ? 1 : i === Math.floor(lit) ? lit - Math.floor(lit) : 0;
        s += `<circle cx="${(L.x0 + (i + 0.5) * L.ds).toFixed(1)}" cy="${y.toFixed(1)}" r="${L.rad.toFixed(1)}" fill="${o > 0.02 ? col : SC.dim}" opacity="${(a * (o > 0.02 ? 0.25 + 0.75 * o : 1)).toFixed(2)}"/>`;
      }
    }
    return s;
  }
  function relLine(L, a, x1) {
    const y = L.top + 10 * L.rh;
    return `<line x1="${L.x0 - 4}" x2="${x1}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${SC.yel}" stroke-dasharray="4 3" opacity="${a.toFixed(2)}"/>`;
  }
  function drawTable(L, k, p) {
    let s = '';
    const fade = k === 6 ? p : 1;
    for (let c = 0; c < NW; c++) {
      const a = k === 6 ? clamp((fade - c / NW * 0.6) / 0.3, 0, 1) : 1;
      if (a <= 0) continue;
      const y = L.top + c * L.rh;
      if (!L.nar || c % 4 === 0) s += tx(L.labW, y + L.rh / 2 + 3.5, DATA.weeks[c], { a: 'end', fs: L.nar ? 9 : 10, op: a });
      for (let n = 0; n <= 24 - c; n++) {
        const diag = k === 7 && c + n === 24;
        s += `<rect x="${(L.x0 + n * L.cw).toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1, L.cw - 1).toFixed(1)}" height="${Math.max(1, L.rh - 1).toFixed(1)}" fill="${heatS(rc(c, n))}" opacity="${a.toFixed(2)}"${diag ? ` stroke="${SC.yel}" stroke-width="1.5"` : ''}/>`;
      }
    }
    for (const n of [0, 4, 8, 12, 16, 20, 24]) s += tx(L.x0 + (n + 0.5) * L.cw, L.top - 6, n, { a: 'middle', fs: 10, op: fade });
    return s;
  }
  function drawCurves(L, k, p) {
    let s = '';
    const m = k === 8 ? ease(clamp(p / 0.75, 0, 1)) : 1, la = k === 8 ? clamp((p - 0.6) / 0.3, 0, 1) : 1;
    // оси
    s += `<g opacity="${(k === 8 ? clamp((p - 0.3) / 0.4, 0, 1) : 1).toFixed(2)}">`;
    for (const v of [0, 0.1, 0.2, 0.3, 0.4]) s += `<line x1="${L.cx0}" x2="${L.cx1}" y1="${L.Y(v).toFixed(1)}" y2="${L.Y(v).toFixed(1)}" stroke="#1c2436"/>` + tx(L.cx0 - 6, L.Y(v) + 3.5, `${v * 100}${v ? '' : '%'}`, { a: 'end', fs: 10 });
    for (const n of [1, 4, 8, 12]) s += tx(L.X(n), L.cy1 + 16, n, { a: 'middle', fs: 10 });
    s += tx(L.cx1 + 14, L.cy1 + 16, L.nar ? '' : 'неделя n', { a: 'start', fs: 10 }) + '</g>';
    if (k >= 9) {
      const a = k === 9 ? clamp(p / 0.3, 0, 1) : 1;
      s += `<rect x="${L.X(4).toFixed(1)}" y="${L.cy0}" width="${(L.X(9) - L.X(4)).toFixed(1)}" height="${(L.cy1 - L.cy0).toFixed(1)}" fill="rgba(54,184,166,.08)" opacity="${a.toFixed(2)}"/>` + tx((L.X(4) + L.X(9)) / 2, L.cy0 + 14, 'плато: недели 4–9', { a: 'middle', fs: 10.5, op: a });
    }
    const gcol = c => k < 10 ? SC.mut : c >= 10 && c <= 12 ? SC.teal : isCamp(c) ? SC.pink : SC.mut;
    for (let c = 0; c < NW; c++) {
      const pts = [];
      for (let n = 1; n <= Math.min(12, 24 - c); n++) {
        const tx0 = L.x0 + n * L.cw + L.cw / 2, ty0 = L.top + c * L.rh + L.rh / 2;
        const x = lerp(tx0, L.X(n), m), y = lerp(ty0, L.Y(rc(c, n)), m);
        pts.push([x, y]);
        if (k === 8 && p < 0.85) s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${lerp(2.6, 1.8, m).toFixed(1)}" fill="${heatS(rc(c, n))}" opacity="${(1 - clamp((p - 0.7) / 0.15, 0, 1)).toFixed(2)}"/>`;
      }
      if (pts.length > 1 && la > 0) {
        const hi = k === 10 && (c <= 16 && c >= 10);
        s += `<polyline points="${pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${gcol(c)}" stroke-width="${hi ? 1.2 : 1}" opacity="${(la * (k === 10 ? (hi ? 0.55 : 0.25) : 0.45)).toFixed(2)}"/>`;
      }
    }
    if (k === 10) {
      const a = clamp(p / 0.4, 0, 1), cols = [SC.ink2, SC.teal, SC.pink];
      GC.forEach((cur, g) => {
        const pts = cur.map((v, i) => `${L.X(i + 1).toFixed(1)},${L.Y(v).toFixed(1)}`).join(' ');
        s += `<polyline points="${pts}" fill="none" stroke="${cols[g]}" stroke-width="3" opacity="${a.toFixed(2)}"/>`;
        const n = cur.length, x = L.X(n), y = L.Y(cur[n - 1]);
        const lbl = (L.nar ? '' : GROUPS[g][2] + ' · ') + pct(PL[g]) + '%';
        if (g === 2) s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(L.Y(0.085) - 8).toFixed(1)}" stroke="${cols[g]}" opacity="${a.toFixed(2)}"/>` + tx(x, L.Y(0.085), lbl, { a: 'middle', c: cols[g], w: 600, fs: L.nar ? 10.5 : 11.5, op: a });
        else s += tx(x + 6, y + (g === 0 ? 10 : -2), lbl, { c: cols[g], w: 600, fs: L.nar ? 10.5 : 11.5, op: a });
      });
    }
    return s;
  }
  const scene = {
    parts: [{ n: '01', name: 'Одна когорта', s: [0, 1] }, { n: '02', name: 'Ряд за рядом', s: [2, 3, 4, 5] }, { n: '03', name: 'Треугольник', s: [6, 7] }, { n: '04', name: 'Кривые', s: [8, 9, 10] }],
    steps: [
      { title: "Кто входит в когорту", dur: 2600, body: `<p>С 5 по 11 января в магазин впервые пришли 284 человека. Объединим их в первую недельную когорту. Одна точка на рисунке соответствует примерно 20 людям.</p><p>Неделю прихода обозначим нулём.</p>` },
      { title: "Кто вернулся через неделю", dur: 3000, body: `<p>С 12 по 18 января в журнале снова появились 99 из 284 новичков. Классическое удержание первой недели — 34,9%. Люди, которые пропустили эту неделю, могут вернуться позже.</p><p>За ту же неделю в магазин впервые пришли ещё 297 человек. Они образуют следующую когорту.</p>` },
      { title: "Новая неделя — новая когорта", dur: 5200, body: `<p>В каждой строке остаются выделенными те, кто был активен на выбранной неделе. В ранних когортах на первой неделе возвращается примерно треть новичков, к четвёртой — около 15%.</p><p>Счётчик «Активны» складывает участников всех показанных когорт с активностью на этой неделе.</p>` },
      { title: "Обновление приложения", dur: 3600, body: `<p>16 марта в приложении обновили знакомство с магазином и оформление заказа. У новичков трёх мартовских когорт, пришедших после обновления, через месяц доля активных выше, чем у январских.</p>` },
      { title: "Новички рекламной кампании", dur: 4200, body: `<p>С 6 апреля по 3 мая в магазин приходили по 500–600 новичков в неделю вместо примерно 300. Общее число активных тоже выросло.</p><p>В следующую неделю возвращались около 29% новичков кампании. До неё возвращались около 34%.</p>` },
      { title: "Все 25 недель", dur: 4600, body: `<p>За 25 недель в когорты вошли 9 073 новичка. Людей с регистрацией до начала журнала исключили, даже если первое видимое событие пришлось на январь.</p><p>Для сравнения нужно совместить строки по неделе прихода.</p>` },
      { title: "От точек к таблице", dur: 3600, body: `<p>Каждая ячейка показывает долю одной когорты, которая была активна в определённую неделю после прихода. Сравните ячейки в одном столбце: срок после прихода одинаков, меняется только когорта.</p>` },
      { title: "Почему часть ячеек пуста", dur: 3400, body: `<p>Для когорты 5 января в журнале есть ещё 24 календарные недели после недели прихода. Для когорты 22 июня мы видим только неделю прихода.</p><p>Выделенная диагональ соответствует одним датам, 22–28 июня. Для каждой когорты это разный срок после первого визита.</p>` },
      { title: "От таблицы к кривым", dur: 3800, body: `<p>Соединим значения каждой строки линией. По горизонтали — номер недели после прихода, по вертикали — доля когорты с активностью в эту неделю. Неделя прихода с исходными 100% находится за пределами шкалы.</p>` },
      { title: "Где начинается плато", dur: 3200, body: `<p>Начиная примерно с четвёртой недели доля активных меняется мало. У десяти когорт до релиза она составляет в среднем 15,5% за недели 4–9. Это оценка уровня плато для этой группы.</p>` },
      { title: "Что изменилось после релиза", dur: 4600, next: 'Читать страницу', body: `<p>У трёх мартовских когорт после релиза плато составляет 19,1%, у четырёх когорт рекламной кампании — 15,5%. Для последних доступны недели 4–8.</p><p>Средний DAU вырос с 207 в марте до 302 в апреле. Чтобы понять изменение, стоит изучить и число пришедших, и долю вернувшихся. Влияние самого релиза требует отдельной проверки.</p>` }
    ],
    hud: [{ id: 'wk', label: 'Неделя' }, { id: 'nw', label: 'Новичков' }, { id: 'ac', label: 'Активны' }],
    legend: '<span><i style="background:#36b8a6"></i>20 новичков</span><span><i style="background:#f06ba5"></i>кампания</span><span><i style="background:#e3c04d"></i>релиз 3.0</span>',
    info: 'КОГОРТЫ',
    aiNote: 'В анимации 25 недельных когорт учебного журнала магазина (5 января — 22 июня 2026, 9 073 новичка, одна точка — 20 человек). Классическое удержание недели 1 — около трети, плато недель 4–9 у когорт до релиза 15,5%, у когорт 16–30 марта после релиза 3.0 — 19,1%, у когорт рекламной кампании 6 апреля — 3 мая — 15,5%. DAU: март 207, апрель 302.',
    mount(root, api) {
      root.innerHTML = '<svg class="rc-sv" role="img" aria-label="Число активных участников каждой когорты по неделям и соответствующие им кривые удержания"></svg>';
      const svg = root.firstChild;
      let sig = '';
      return {
        render(k, p) {
          const W = Math.round(svg.clientWidth || 600), H = Math.round(svg.clientHeight || 400);
          const t = scT(k, p), T = Math.min(24, Math.floor(t));
          if (k <= 5) {
            let act = 0; for (let c = 0; c <= T; c++) act += active(c, T - c);
            api.hud('wk', DATA.weeks[T]); api.hud('nw', sp(S[T]), isCamp(T) ? 'реклама' : T >= 10 && T <= 12 ? 'релиз' : '');
            api.hud('ac', sp(act));
          } else {
            let act = 0; for (let c = 0; c < NW; c++) act += active(c, 24 - c);
            api.hud('wk', DATA.weeks[24]); api.hud('nw', sp(S.reduce((a, b) => a + b, 0)), 'всего');
            api.hud('ac', sp(act));
          }
          const key = [k, Math.round(p * 90), W, H].join();
          if (key === sig) return; sig = key;
          const L = lay(W, H);
          let s = '';
          if (k <= 5) {
            s += drawDots(L, t, 1, k === 0 ? clamp(p * 3, 0, 1) : null);
            if (T >= 10) s += relLine(L, clamp((t - 10) * 2, 0, 1), L.x0 + 31 * L.ds + 4);
            if (k === 0 && p > 0.4) s += call(L.nar ? L.x0 : L.x0 + DOTS[0] * L.ds + 8, L.top + (L.nar ? 2.6 : 0.5) * L.rh + 2, 'неделя 0: активны все 284', { op: clamp((p - 0.4) * 4, 0, 1) });
            if (k === 1 && p > 0.5) s += call(L.x0 + DOTS[0] * L.ds + 8, L.top + 0.5 * L.rh + 2, 'неделя 1: 34,9%', { op: clamp((p - 0.5) * 4, 0, 1) });
            if (k === 3 && p > 0.3) s += call(L.nar ? W - 4 : L.x0 + 17 * L.ds + 8, L.top + 10 * L.rh, 'релиз 3.0 · 16 марта', { a: L.nar ? 'end' : 'start', c: SC.yel, op: clamp((p - 0.3) * 4, 0, 1) });
            if (k === 4 && p > 0.45) s += call(L.x0 + 2 * L.ds, L.top + 18.2 * L.rh, 'кампания: 500–600 новичков в неделю', { c: SC.pink, op: clamp((p - 0.45) * 4, 0, 1) });
          } else if (k <= 7) {
            if (k === 6 && p < 0.5) s += drawDots(L, 24.5, 1 - clamp(p * 2.2, 0, 1));
            s += drawTable(L, k, p);
            if (k === 7) {
              const a = clamp(p * 3, 0, 1);
              s += call(L.x0 + 18 * L.cw, L.top + 20.5 * L.rh, 'ещё не наступило', { a: 'middle', c: SC.mut, op: a });
              s += call(L.nar ? W - 4 : L.x0 + 13 * L.cw, L.top + 7.5 * L.rh, 'диагональ: 22–28 июня', { a: L.nar ? 'end' : 'start', c: SC.yel, op: clamp((p - 0.35) * 3, 0, 1) });
            }
          } else {
            s += drawCurves(L, k, p);
            if (k === 9 && p > 0.35) s += call(L.X(9) + 6, L.Y(PL[0]) - 22, 'плато ≈ ' + pct(PL[0]) + '%', { op: clamp((p - 0.35) * 3, 0, 1) });
          }
          svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
          svg.innerHTML = s;
        }
      };
    }
  };

  /* ===================== Интерактив «Треугольник когорт» ===================== */
  const TYPES = { C: 'классическое', R: 'скользящее', B: 'возвратное' };
  const YMAX = { C: 0.45, R: 0.9, B: 0.9 };
  const hexRGB = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const mix = (a, b, t) => { const x = hexRGB(a), y = hexRGB(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], t))).join(',')})`; };
  function model(T, k) {
    /* счётчики [c][n−1] и размеры когорт с k добавленными рекламными новичками в когортах с A.from */
    const cnt = [], sz = [];
    for (let c = 0; c < NW; c++) {
      const add = c >= A.from ? k : 0, h = 24 - c;
      sz.push(S[c] + add);
      cnt.push(DATA[T][c].map((x, i) => x + (add ? add * (T === 'C' ? A.C[i] : T === 'B' ? A.B[i] : A.R[h - 1][i]) : 0)));
    }
    return { cnt, sz };
  }
  function dauModel(k) {
    const d = DATA.dau.slice();
    if (k) for (let c = A.from; c < NW; c++) for (let j = 0; j < 7; j++) for (let t = 0; t < A.d.length; t++) { const x = 7 * c + j + t; if (x < d.length) d[x] += k / 7 * A.d[t]; }
    return d;
  }
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const juneDau = d => mean(d.slice(147, 175));
  function buildTri(box, api) {
    const { $, esc } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Треугольник когорт <i>интерактив</i></span><div class="ctrls"><div class="seg" role="group" aria-label="Вид удержания">${Object.entries(TYPES).map(([k, v]) => `<button type="button" data-t="${k}" aria-pressed="${k === 'C'}">${v}</button>`).join('')}</div><button type="button" class="btn ghost small" id="rc-reset">Сбросить</button></div></div>
<p class="hint rc-do">Выберите способ расчёта и строку таблицы, чтобы увидеть кривую одной когорты. Ползунок меняет число условных новичков, пришедших из рекламы.</p>
<div class="rc-wrap"><div class="rc-main"><div class="rc-heat" id="rc-heat" tabindex="0" aria-label="Тепловая карта когорт: стрелки вверх и вниз выбирают когорту"></div><div class="rc-read" id="rc-read"></div></div>
<div class="rc-side"><p class="cap">Кривая выбранной когорты</p><p class="rc-sub" id="rc-csub"></p><div id="rc-curve"></div><p class="cap">DAU: журнал и модель</p><p class="rc-sub">среднее число активных за день по каждой неделе. Розовым отмечена кампания, зелёным — недели, для которых работает модель</p><div id="rc-dau"></div></div></div>
<div class="rc-bud"><label for="rc-k">Модель привлечения: <b id="rc-kv">+0</b> рекламных новичков в&nbsp;каждую когорту с&nbsp;4 мая</label><input type="range" id="rc-k" min="0" max="1000" step="50" value="0"></div>
<div class="status"><span><span class="dot live"></span><span id="rc-s1"></span></span><span id="rc-s2"></span><span id="rc-s3"></span></div>`;
    let T = 'C', sel = 10, k = 0, hov = null, m = model(T, 0), dau = DATA.dau;
    const val = (c, n) => n === 0 ? 1 : n <= 24 - c ? m.cnt[c][n - 1] / m.sz[c] : null;
    const colAvg = n => { const cs = []; for (let c = 0; c + n <= 24; c++) cs.push(c); const u = mean(cs.map(c => val(c, n))); const w = cs.reduce((s, c) => s + m.cnt[c][n - 1], 0) / cs.reduce((s, c) => s + m.sz[c], 0); return [u, w]; };
    function heat() {
      const el = $('rc-heat'), W = Math.max(280, el.clientWidth), C = api.css();
      const nar = W < 520, labW = 46, szW = nar ? 0 : 36, x0 = labW + szW + 6, cw = (W - x0 - 2) / 24, rh = nar ? 13 : 15, top = 16;
      const ys = c => top + c * rh + (c >= NW ? 8 : 0), H = top + (NW + 2) * rh + 12;
      const vmax = YMAX[T] * 0.85, col = v => v == null ? 'none' : mix(C.surface, C.accent, Math.pow(clamp(v / vmax, 0, 1), 0.85));
      let s = '';
      for (const n of [1, 4, 8, 12, 16, 20, 24]) s += `<text x="${(x0 + (n - 0.5) * cw).toFixed(1)}" y="11" text-anchor="middle" class="rc-ax">${n}</text>`;
      if (!nar) s += `<text x="${labW + szW}" y="11" text-anchor="end" class="rc-ax">чел.</text>`;
      for (let c = 0; c < NW; c++) {
        const y = ys(c), on = c === sel;
        s += `<g data-c="${c}" class="rc-row${on ? ' on' : ''}"><rect x="0" y="${y}" width="${W}" height="${rh}" fill="transparent"/>`;
        s += `<text x="${labW - 4}" y="${y + rh - 3.5}" text-anchor="end" class="rc-lb${on ? ' on' : ''}">${DATA.weeks[c]}</text>`;
        if (!nar) s += `<text x="${labW + szW}" y="${y + rh - 3.5}" text-anchor="end" class="rc-sz${c >= A.from && k ? ' add' : isCamp(c) ? ' camp' : ''}">${m.sz[c]}</text>`;
        for (let n = 1; n <= 24 - c; n++) s += `<rect x="${(x0 + (n - 1) * cw).toFixed(1)}" y="${y + 0.5}" width="${(cw - 1).toFixed(1)}" height="${rh - 1}" fill="${col(val(c, n))}" data-n="${n}"/>`;
        if (on) s += `<rect x="${x0 - 2}" y="${y - 0.5}" width="${((24 - c) * cw + 3).toFixed(1)}" height="${rh + 1}" fill="none" class="rc-selbox"/>`;
        s += '</g>';
      }
      [['среднее', 0], ['взвешенное', 1]].forEach(([nm, j], i) => {
        const y = ys(NW + i);
        s += `<text x="${labW + szW}" y="${y + rh - 3.5}" text-anchor="end" class="rc-lb">${nar ? ['ср.', 'взвеш.'][j] : nm}</text>`;
        for (let n = 1; n <= 24; n++) { const v = colAvg(n)[j]; s += `<rect x="${(x0 + (n - 1) * cw).toFixed(1)}" y="${y + 0.5}" width="${(cw - 1).toFixed(1)}" height="${rh - 1}" fill="${col(v)}" data-avg="${j}" data-n="${n}"/>`; }
      });
      const yr = ys(10);
      s += `<line x1="${x0 - 4}" x2="${W}" y1="${yr}" y2="${yr}" class="rc-rel"/>`;
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Тепловая карта: 25 когорт, недели 1–24">${s}</svg>`;
    }
    function lineChart(el, W, H, series, o) {
      const C = api.css(), pad = { l: 34, r: o.r || 46, t: 8, b: 18 }, xw = W - pad.l - pad.r, yh = H - pad.t - pad.b;
      const X = i => pad.l + i / (o.nx - 1) * xw, Y = v => pad.t + yh - clamp(v / o.ymax, 0, 1.05) * yh;
      let s = '';
      (o.bands || []).forEach(([a, b, c]) => { s += `<rect x="${X(a).toFixed(1)}" y="${pad.t}" width="${(X(b) - X(a)).toFixed(1)}" height="${yh}" fill="${c}"/>`; });
      o.yt.forEach(v => { s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${C.line}"/><text x="${pad.l - 5}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end" class="rc-ax">${o.yf(v)}</text>`; });
      o.xt.forEach(([i, lb]) => { s += `<text x="${X(i).toFixed(1)}" y="${H - 4}" text-anchor="middle" class="rc-ax">${lb}</text>`; });
      const labels = [];
      series.forEach(se => {
        const pts = se.v.map((v, i) => v == null ? null : `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).filter(Boolean);
        if (!pts.length) return;
        if (pts.length > 1) {
          s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${se.c}" stroke-width="${se.w || 1}" opacity="${se.o || 1}"${se.dash ? ' stroke-dasharray="4 3"' : ''}/>`;
        } else {
          const [x, y] = pts[0].split(',');
          s += `<circle cx="${x}" cy="${y}" r="${se.w || 1.5}" fill="${se.c}" opacity="${se.o || 1}"/>`;
        }
        if (se.lb) {
          const i = se.v.findLastIndex(v => v != null);
          labels.push({ x: X(i) + 5, y: clamp(Y(se.v[i]) + 3.5 + (se.dy || 0), 12, H - pad.b), series: se });
        }
      });
      // У графика до двух прямых подписей. Разводим их, если концы кривых оказались рядом.
      if (labels.length === 2 && Math.abs(labels[0].x - labels[1].x) < 48 && Math.abs(labels[0].y - labels[1].y) < 15) {
        labels.sort((a, b) => a.y - b.y);
        const middle = clamp((labels[0].y + labels[1].y) / 2, 20, H - pad.b - 8);
        labels[0].y = middle - 8;
        labels[1].y = middle + 8;
      }
      for (const label of labels) {
        s += `<text x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" class="rc-dl" fill="${label.series.c}">${esc(label.series.lb)}</text>`;
      }
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria)}">${s}</svg>`;
    }
    function curve() {
      const el = $('rc-curve'), W = Math.max(240, el.clientWidth), C = api.css(), ser = [];
      for (let c = 0; c < NW; c++) if (c !== sel) ser.push({ v: [null].concat(Array.from({ length: 24 }, (_, i) => val(c, i + 1))), c: C.muted, o: 0.28 });
      ser.push({ v: [null].concat(Array.from({ length: 24 }, (_, i) => colAvg(i + 1)[1])), c: C.ink2, w: 1.4, dash: 1, lb: 'взвеш.', dy: 9 });
      ser.push({ v: [null].concat(Array.from({ length: 24 }, (_, i) => val(sel, i + 1))), c: C.accent, w: 2.4, lb: DATA.weeks[sel], dy: -4 });
      lineChart(el, W, 170, ser, { nx: 25, ymax: YMAX[T], yt: T === 'C' ? [0, 0.2, 0.4] : [0, 0.4, 0.8], yf: v => `${Math.round(v * 100)}${v ? '' : '%'}`, xt: [[1, 1], [4, 4], [8, 8], [12, 12], [16, 16], [20, 20], [24, 'n 24']], aria: `Кривая удержания когорты ${DATA.weeks[sel]}`, r: 52 });
      const v1 = val(sel, 1), v4 = val(sel, 4);
      $('rc-csub').textContent = `${DATA.weeks[sel]}: ${sp(m.sz[sel])} чел.; неделя 1 — ${v1 == null ? 'ещё нет' : pct(v1) + '%'}, неделя 4 — ${v4 == null ? 'ещё нет' : pct(v4) + '%'}`;
    }
    function dauChart() {
      const el = $('rc-dau'), W = Math.max(240, el.clientWidth), C = api.css();
      const wk = d => Array.from({ length: NW }, (_, w) => mean(d.slice(7 * w, 7 * w + 7)));
      const real = wk(DATA.dau), mod = wk(dau), top = Math.max(500, Math.ceil(Math.max(...mod) / 250) * 250);
      lineChart(el, W, 130, [{ v: real, c: C.muted, w: 1.6, lb: k ? 'журнал' : '', dy: 10 }, { v: k ? mod : real.map(() => null), c: C.accent, w: 2.2, lb: 'модель', dy: -4 }],
        { nx: NW, ymax: top, yt: [0, top / 2, top], yf: v => sp(v), xt: [[0, 'янв'], [8.4, 'мар'], [17, 'май'], [24, 'июн']], aria: 'DAU по неделям: журнал и модель с рекламным бюджетом', r: 52,
          bands: [[13, 16.9, mix(C.surface, C.c[3], 0.16)], [A.from, 24, mix(C.surface, C.accent, 0.12)]] });
    }
    function status() {
      const base = model('C', 0), cur = T === 'C' ? m : model('C', k);
      const w1 = mm => { let x = 0, s = 0; for (let c = A.from; c < NW - 1; c++) { x += mm.cnt[c][0]; s += mm.sz[c]; } return x / s; };
      $('rc-s1').textContent = `Удержание: ${TYPES[T]}`;
      $('rc-s2').textContent = `DAU июня: ${sp(juneDau(DATA.dau))} → ${sp(juneDau(dau))}`;
      $('rc-s3').textContent = `Неделя 1 когорт мая–июня: ${pct(w1(base))}% → ${pct(w1(cur))}%`;
      $('rc-kv').textContent = `+${sp(k)}`;
    }
    function read() {
      const r = $('rc-read');
      if (!hov) { r.innerHTML = `Наведите на клетку или выберите строку: <b>${DATA.weeks[sel]}</b>.`; return; }
      const [c, n, avg] = hov;
      if (avg != null) { const [u, w] = colAvg(n); r.innerHTML = `Неделя ${n}, все когорты с этой неделей: невзвешенное среднее <b>${pct(u)}%</b>, взвешенное <b>${pct(w)}%</b>.`; return; }
      const v = val(c, n);
      r.innerHTML = `Когорта <b>${DATA.weeks[c]}</b> (${sp(m.sz[c])} чел.), неделя ${n}: <b>${pct(v)}%</b> — ${k && c >= A.from ? 'около ' : ''}${sp(m.cnt[c][n - 1])} чел. ${T === 'C' ? 'активны в эту неделю' : T === 'R' ? 'активны в эту неделю или позже' : n === 1 ? 'вернулись в первую неделю' : 'вернулись хотя бы раз с первой недели по ' + n + '-ю'}.`;
    }
    function draw() { m = model(T, k); dau = dauModel(k); heat(); curve(); dauChart(); status(); read(); }
    box.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { T = b.dataset.t; box.querySelectorAll('[data-t]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(); }));
    const heatEl = $('rc-heat');
    heatEl.addEventListener('click', e => { const g = e.target.closest('[data-c]'); if (g) { sel = +g.dataset.c; draw(); } });
    heatEl.addEventListener('pointermove', e => { const r = e.target.closest('rect[data-n]'); const g = e.target.closest('[data-c]'); const nh = r ? (r.dataset.avg != null ? [null, +r.dataset.n, +r.dataset.avg] : g ? [+g.dataset.c, +r.dataset.n, null] : null) : null; if (JSON.stringify(nh) !== JSON.stringify(hov)) { hov = nh; read(); } });
    heatEl.addEventListener('pointerleave', () => { hov = null; read(); });
    heatEl.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = clamp(sel + (e.key === 'ArrowDown' ? 1 : -1), 0, NW - 1); draw(); } });
    $('rc-k').addEventListener('input', e => { k = +e.target.value; draw(); });
    $('rc-reset').addEventListener('click', () => { T = 'C'; sel = 10; k = 0; hov = null; $('rc-k').value = 0; box.querySelectorAll('[data-t]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.t === 'C'))); draw(); });
    draw();
    if ('ResizeObserver' in window) { let lw = 0; new ResizeObserver(() => { const w = box.clientWidth; if (Math.abs(w - lw) > 4) { lw = w; draw(); } }).observe(box); }
    return {
      redraw: draw,
      describe() {
        const v = n => { const x = val(sel, n); return x == null ? 'ещё нет' : pct(x) + '%'; };
        return `вид удержания: ${TYPES[T]}; выбрана когорта ${DATA.weeks[sel]} (${m.sz[sel]} чел.): неделя 1 — ${v(1)}, неделя 4 — ${v(4)}, неделя 8 — ${v(8)}; рекламный бюджет: +${k} новичков в каждую когорту с 4 мая; DAU июня ${Math.round(juneDau(DATA.dau))} → ${Math.round(juneDau(dau))}.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-9-3',
    short: 'DA-09',
    title: 'Удержание и когорты',
    where: 'блок «Дата аналитика», тема 09 «Продуктовые метрики и события», страница 9.3',
    aiData: 'учебный журнал событий интернет-магазина за январь — июнь 2026: 25 недельных когорт, 9 073 новичка, релиз 3.0 16 марта, рекламная кампания 6 апреля — 3 мая',
    scene,
    widgets: { tri: buildTri },
    code: CODE,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: "Модель добавит по 1 000 рекламных новичков в каждую когорту с 4 мая. Что изменится, если считать классическое удержание?", opts: [['Вырастет и то и другое: людей больше — и вернувшихся больше'], ['DAU почти удвоится, а удержание недели 1 упадёт примерно с 33 до 27%', 1], ['DAU не изменится: новички активны только в неделю прихода'], ['DAU вырастет, удержание не изменится: доля не зависит от размера когорты']],
      why: "Средний DAU июня в модели растёт с 386 до 732. Новички рекламной кампании возвращались на первой неделе реже, поэтому их добавление снижает долю вернувшихся в когортах мая и июня с 33,4% до 27,4%. Число вернувшихся при этом может вырасти." },
    q2: { sec: 'idea', q: "Почему у апрельских когорт плато ниже, чем у трёх мартовских когорт после релиза?", opts: [['В апреле релиз перестал работать'], ['Больше половины новичков пришли из рекламы, а в этой группе доля вернувшихся ниже', 1], ['Большая когорта всегда удерживается хуже: знаменатель больше'], ['Апрельские когорты незрелые, их плато ещё не наступило']],
      why: "В апрельских когортах от 54% до 58% новичков пришли из рекламы. У этих новичков плато около 12%, у остальных — около 20%. Общая доля зависит от состава когорт. Для всей группы кампании успели закончиться недели 4–8." },
    q3: { sec: 'idea', q: "Почему возвратное удержание к неделе n не может быть ниже классического удержания за неделю n?", opts: [['Его считают по 24-часовым окнам, а классическое — по календарю'], ['Каждый, кто был активен в неделю n, хотя бы раз проявил активность за недели с первой по n', 1], ['Возвратное считают по покупкам'], ['Бывает ниже — у незрелых когорт']],
      why: "Каждый, кто был активен в неделю n, вернулся хотя бы один раз за недели с первой по n. В возвратный показатель входят также те, кто вернулся раньше и пропустил саму неделю n. Знаменатель у этих долей общий." },
    q4: { sec: 'method', q: "Какое наблюдение в таблице когорт даёт повод проверить эффект релиза 16 марта?", opts: [['В марте вырос DAU'], ['Стала насыщеннее диагональ — календарная неделя 16 марта'], ['Строки когорт с 16 марта на неделях 4–9 насыщеннее строк до релиза, а состав когорт сопоставим', 1], ['Нижние строки таблицы короче верхних']],
      why: "Сравните одинаковые недели после прихода у когорт сходного состава. Более высокая доля вернувшихся у нескольких когорт после релиза заслуживает проверки. Таблица не позволяет приписать эту разницу самому обновлению." },
    q5: { sec: 'task', q: "Как дневная аудитория может расти, если в новых когортах доля вернувшихся снижается?", opts: [['DAU считает ботов'], ['Приток новичков может компенсировать снижение доли вернувшихся', 1], ['DAU — недельная метрика, а люди уходят за день'], ['DAU не учитывает покупки']],
      why: "В DAU входят все, кто был активен в этот день. Если поток новичков достаточно велик, он может компенсировать сокращение доли вернувшихся. Чтобы различить эти изменения, сравните размеры когорт и удержание на одинаковом сроке." },
    q6: { sec: 'code', q: "Какой показатель вычисляет эта строка pandas?", code: 'rolling = by_last.loc[:, ::-1].cumsum(axis=1).loc[:, ::-1]', lang: 'python', opts: [['Сколько людей когорты активны ровно в неделю n'], ['Сколько людей когорты активны в неделю n или позже: их последняя активная неделя не раньше n', 1], ['Сколько людей вернулись хотя бы раз за недели 1…n'], ['Сколько людей ушли в неделю n']],
      why: "В by_last люди сгруппированы по последней неделе активности. Если сложить столбцы справа налево, для каждой недели n получим число людей с активностью в эту неделю или позже. Этим числителем пользуются при расчёте скользящего удержания." },
    q7: { sec: 'idea', q: "Если считать датой прихода первое событие в журнале, январская когорта вырастет с 284 до 594 человек. Откуда взялись лишние участники?", opts: [['В начале января сработал маркетинг'], ['Часть участников зарегистрировалась раньше и вернулась в январе', 1], ['Дубли событий удвоили когорту'], ['Минский день перенёс часть людей в январь']],
      why: "Журнал начинается 5 января. Для клиента, зарегистрированного осенью, первое январское событие может быть очередным визитом. Такие вернувшиеся клиенты попадут в январскую когорту, если не проверить дату регистрации." }
    },
    glossary: {
      cohort: { t: 'Когорта', en: 'cohort', d: 'Группа людей, которых объединяет общее событие во времени, чаще всего неделя или день прихода.' },
      retention: { t: 'Удержание', en: 'retention', d: 'Доля когорты, которая снова активна через n периодов после прихода.' },
      classic: { t: 'Классическое удержание', en: 'N-day retention, Return On', d: 'Доля когорты, активной именно в период n.' },
      rolling: { t: 'Скользящее удержание', en: 'unbounded (rolling) retention, Return On or After', d: "Доля когорты с активностью в период n или позже, вплоть до конца наблюдения." },
      returnret: { t: 'Возвратное удержание', en: 'bracket retention 1…n', d: "Доля когорты, вернувшейся хотя бы раз с периода 1 по период n включительно." },
      churn: { t: 'Отток', en: 'churn', d: "Прекращение использования продукта. Если уход нельзя наблюдать напрямую, применяют правило, например отсутствие активности в течение заданного срока." },
      plateau: { t: 'Плато', en: 'plateau, flattening', d: "Участок кривой, где доля вернувшихся почти не меняется от периода к периоду." },
      curve: { t: 'Кривая удержания', en: 'retention curve', d: 'Удержание одной когорты по периодам: по горизонтали n, по вертикали доля.' },
      heatmap: { t: 'Тепловая карта когорт', en: 'cohort heatmap', d: 'Таблица когорт, где цвет клетки — удержание: строки — когорты, столбцы — периоды жизни.' },
      calcohort: { t: 'Календарная когорта', en: 'acquisition cohort', d: 'Когорта по дате прихода: дню, неделе, месяцу.' },
      behcohort: { t: 'Поведенческая когорта', en: 'behavioral cohort', d: 'Когорта по действию, например «купил в неделю прихода».' },
      immature: { t: 'Незрелая когорта', en: 'immature cohort', d: 'Когорта, у которой нужные периоды ещё не прошли: её клетки пусты или неполны.' },
      window: { t: 'Окно 24 часа', en: '24-hour window', d: 'День n, отсчитанный сутками от первого события: день 1 — с 24-го по 48-й час после прихода.' },
      critical: { t: 'Критическое событие', en: 'critical event', d: "Действие, по которому оценивают, использовал ли человек продукт по назначению. Для магазина это может быть оплата заказа." },
      interval: { t: 'Интервал использования', en: 'usage interval', d: "Характерный срок между повторениями выбранного действия. В примере за этот срок успели повторить действие 80% тех, кто сделал это за 60 дней." },
      weighted: { t: 'Взвешенное среднее', en: 'weighted average', d: 'Среднее, где вклад когорты пропорционален её размеру: все вернувшиеся, делённые на всех пришедших.' },
      dau: { t: 'DAU и WAU', en: 'daily, weekly active users', d: 'Число разных людей, активных за день или за неделю.' },
      vanity: { t: 'Тщеславная метрика', en: 'vanity metric', d: "Показатель, рост которого сам по себе мало помогает принять решение, например накопительное число регистраций." },
      survival: { t: 'Анализ выживаемости', en: 'survival analysis', d: 'Статистика времени до события с учётом тех, у кого событие ещё не наступило.' }
    },
    materials: [
      ['da-9-3-retention-cohorts.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/events/', 'Учебные данные темы 09 — общий набор: журнал событий и таблица аккаунтов; база events в PostgreSQL — через load_pg.sql'],
      ['cohorts.sql', 'Таблица «пользователь — день» и таблица когорт для PostgreSQL 16'],
      ['retention.ipynb', 'Три вида удержания, тепловая карта и кривые на pandas и Matplotlib']
    ],
    prompts: [
      ['Три вида удержания', 'Дай мне по источнику недели, в которые был активен один человек, например 0, 3, 4 и 9. Я посчитаю его классическое, скользящее и возвратное удержание для n = 1…10, а ты проверишь и объяснишь ошибки. Три задачи по одной.'],
      ['Где искать в треугольнике', 'Опиши словами изменение в продукте или маркетинге: релиз, кампанию, сбой, распродажу. Я скажу, где его искать в таблице когорт — в строках, столбцах или на диагонали, — и как оно сдвинет кривые. Пять задач, ответ не подсказывай.'],
      ['Мой порог оттока', 'Я опишу свой продукт без подписки. Помоги вопросами выбрать событие «вернулся» и порог оттока, опираясь на критическое событие и интервал использования из источника. Готового ответа не давай.']
    ]
  };
})();
