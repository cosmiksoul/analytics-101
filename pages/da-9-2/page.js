/* Страница 9.2 · Воронки и конверсии */
(() => {
  // данные из учебного журнала: генератор data/gen_page.py вписывает их между метками
  /*data:start*/const D = {"U":{"ua1":[1610,1481,513,237,227],"ua7":[1610,1525,654,344,329],"ua0":[1610,1550,853,519,490],"us1":[1610,1481,391,200,191],"us7":[1610,1525,547,305,290],"us0":[1610,1550,766,482,454],"sa":[6311,5308,1375,687,628],"ss":[6311,5308,1028,575,527]},"DOTS":[[1,1,1,1,37],[2,2,1,1,11],[2,2,2,1,8],[2,2,2,2,414],[3,2,2,1,1],[3,2,2,2,34],[3,3,1,1,2],[3,3,2,1,3],[3,3,2,2,53],[3,3,3,1,2],[3,3,3,2,22],[3,3,3,3,91],[4,2,2,2,1],[4,4,1,1,1],[4,4,2,2,6],[4,4,3,2,2],[4,4,3,3,2],[4,4,4,2,1],[4,4,4,3,1],[4,4,4,4,4],[5,2,2,1,1],[5,2,2,2,17],[5,3,2,1,1],[5,3,2,2,2],[5,3,3,2,1],[5,5,1,1,2],[5,5,2,1,3],[5,5,2,2,63],[5,5,3,1,1],[5,5,3,2,15],[5,5,3,3,15],[5,5,4,1,1],[5,5,4,2,1],[5,5,4,3,1],[5,5,5,1,6],[5,5,5,2,45],[5,5,5,3,9],[5,5,5,4,1],[5,5,5,5,119]],"SC":{"A":[1000,963,530,322,304],"B":[1000,963,476,299,282],"C":[1000,947,340,189,180],"D":[1000,920,243,124,119]},"SIMP":{"органика":{"приложение":[23.8,2624],"сайт":[16.7,1260]},"партнёры":{"приложение":[39.7,272],"сайт":[36.8,1374]},"прочее":{"приложение":[4.0,50],"сайт":[3.3,92]},"реклама":{"приложение":[12.2,2257],"сайт":[10.4,557]},"всего":{"приложение":[19.4,5203],"сайт":[23.7,3283]}},"NS":6311,"NP":1610};/*data:end*/
  // блоки кода и их настоящий вывод: data/build_code.py
  /*code:start*/const CODE = {"fun": {"title": "Воронка на SQL: окно 7 суток, порядок через MIN(event_time) по шагам", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- Воронка новичков мая: окно 7 суток, любой и строгий порядок шагов\nWITH e AS (                                   -- без дублей: одна строка на event_id\n  SELECT DISTINCT ON (event_id) *\n  FROM events\n  ORDER BY event_id\n), bots AS (                                  -- больше 100 клиентских событий за сутки\n  SELECT DISTINCT anonymous_id\n  FROM e\n  WHERE origin = 'client'\n  GROUP BY anonymous_id, (event_time AT TIME ZONE 'Europe/Minsk')::date\n  HAVING COUNT(*) > 100\n), dev AS (                                   -- склейка: устройство → аккаунт\n  SELECT anonymous_id, MIN(user_id) AS user_id\n  FROM e\n  WHERE anonymous_id IS NOT NULL AND user_id IS NOT NULL\n  GROUP BY anonymous_id\n), ev AS (                                    -- человек = аккаунт, иначе устройство\n  SELECT COALESCE(e.user_id, dev.user_id, e.anonymous_id) AS person,\n         e.event_name, e.event_time\n  FROM e LEFT JOIN dev USING (anonymous_id)\n  WHERE e.anonymous_id IS NULL\n     OR e.anonymous_id NOT IN (SELECT anonymous_id FROM bots)\n), cohort AS (                                -- первый app_open в мае по Минску\n  SELECT person, MIN(event_time) AS t1\n  FROM ev\n  WHERE event_name = 'app_open'\n  GROUP BY person\n  HAVING MIN(event_time) >= '2026-05-01 00:00+03'\n     AND MIN(event_time) <  '2026-06-01 00:00+03'\n     AND person NOT IN (SELECT user_id FROM users WHERE signup_time < '2026-01-05 00:00+03')\n), w AS (                                     -- события шагов в окне 7 суток от t1\n  SELECT c.person, c.t1, ev.event_name, ev.event_time\n  FROM cohort AS c JOIN ev USING (person)\n  WHERE ev.event_time BETWEEN c.t1 AND c.t1 + INTERVAL '7 days'\n), any_order AS (                             -- любой порядок: первое время каждого шага\n  SELECT person,\n         MIN(event_time) FILTER (WHERE event_name = 'product_view')   AS a2,\n         MIN(event_time) FILTER (WHERE event_name = 'add_to_cart')    AS a3,\n         MIN(event_time) FILTER (WHERE event_name = 'checkout_start') AS a4,\n         MIN(event_time) FILTER (WHERE event_name = 'order_paid')     AS a5\n  FROM w GROUP BY person\n), s2 AS (                                    -- строгий порядок: каждый шаг не раньше предыдущего\n  SELECT person, MIN(event_time) AS t2 FROM w\n  WHERE event_name = 'product_view' GROUP BY person\n), s3 AS (\n  SELECT w.person, MIN(w.event_time) AS t3 FROM w JOIN s2 USING (person)\n  WHERE w.event_name = 'add_to_cart' AND w.event_time >= s2.t2 GROUP BY w.person\n), s4 AS (\n  SELECT w.person, MIN(w.event_time) AS t4 FROM w JOIN s3 USING (person)\n  WHERE w.event_name = 'checkout_start' AND w.event_time >= s3.t3 GROUP BY w.person\n), s5 AS (\n  SELECT w.person, MIN(w.event_time) AS t5 FROM w JOIN s4 USING (person)\n  WHERE w.event_name = 'order_paid' AND w.event_time >= s4.t4 GROUP BY w.person\n), f AS (\n  SELECT c.person, a.a2, a.a3, a.a4, a.a5, s2.t2, s3.t3, s4.t4, s5.t5\n  FROM cohort AS c\n  LEFT JOIN any_order AS a USING (person)\n  LEFT JOIN s2 USING (person) LEFT JOIN s3 USING (person)\n  LEFT JOIN s4 USING (person) LEFT JOIN s5 USING (person)\n)\nSELECT step.n, step.name,\n       COUNT(*) FILTER (WHERE step.any_ok) AS any_order,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE step.any_ok) / COUNT(*), 1) AS any_pct,\n       COUNT(*) FILTER (WHERE step.strict_ok) AS strict,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE step.strict_ok) / COUNT(*), 1) AS strict_pct\nFROM f CROSS JOIN LATERAL (VALUES\n  (1, 'app_open',       true,                   true),\n  (2, 'product_view',   a2 IS NOT NULL,         t2 IS NOT NULL),\n  (3, 'add_to_cart',    a2 IS NOT NULL AND a3 IS NOT NULL, t3 IS NOT NULL),\n  (4, 'checkout_start', a2 IS NOT NULL AND a3 IS NOT NULL AND a4 IS NOT NULL, t4 IS NOT NULL),\n  (5, 'order_paid',     a2 IS NOT NULL AND a3 IS NOT NULL AND a4 IS NOT NULL AND a5 IS NOT NULL, t5 IS NOT NULL)\n) AS step(n, name, any_ok, strict_ok)\nGROUP BY step.n, step.name\nORDER BY step.n;", "out": " n |      name      | any_order | any_pct | strict | strict_pct \n---+----------------+-----------+---------+--------+------------\n 1 | app_open       |      1610 |   100.0 |   1610 |      100.0\n 2 | product_view   |      1525 |    94.7 |   1525 |       94.7\n 3 | add_to_cart    |       654 |    40.6 |    547 |       34.0\n 4 | checkout_start |       344 |    21.4 |    305 |       18.9\n 5 | order_paid     |       329 |    20.4 |    290 |       18.0\n(5 rows)", "outLabel": "Вывод psql", "note": "Запуск: <code>psql -h /tmp -U postgres -d events -P null=NULL -f funnel.sql</code>. Пустые значения psql печатал бы словом NULL, так настроен вывод; здесь их нет. Столбцы any_order и strict совпадают с интерактивом в состояниях «человек · 7 суток»: 18,0% — ответ аналитика Б."}, "seg": {"title": "Та же воронка по сегментам в pandas: в каждом канале приложение лучше, в сумме — хуже", "badge": "проверено: Python 3.13, pandas 3.0.5", "lang": "python", "code": "import pandas as pd\n\nMSK = \"Europe/Minsk\"\nev = pd.read_parquet(\"data/events/events.parquet\")\nusers = pd.read_csv(\"data/events/users.csv\", parse_dates=[\"signup_time\"])\n\n# соглашения темы: без дублей, без ботов, человек = аккаунт, время по Минску\nev = ev.drop_duplicates(\"event_id\")\nev[\"t\"] = ev.event_time.dt.tz_convert(MSK)\ncl = ev[ev.origin == \"client\"]\nper_day = cl.groupby([\"anonymous_id\", cl.t.dt.date]).size()\nbots = per_day[per_day > 100].index.get_level_values(0).unique()\nev = ev[~ev.anonymous_id.isin(bots)]\ndev = ev.dropna(subset=[\"anonymous_id\", \"user_id\"]).groupby(\"anonymous_id\").user_id.first()\nev[\"person\"] = ev.user_id.fillna(ev.anonymous_id.map(dev)).fillna(ev.anonymous_id)\n\nSTEPS = [\"app_open\", \"product_view\", \"add_to_cart\", \"checkout_start\", \"order_paid\"]\n\ndef funnel(ev, start, window=\"7D\"):\n    \"\"\"Любой порядок: человек дошёл до шага k, если в окне есть все шаги 1…k.\"\"\"\n    e = ev[ev.event_name.isin(STEPS)].merge(start.rename(\"t0\"), left_on=\"person\", right_index=True)\n    e = e[(e.t >= e.t0) & (e.t <= e.t0 + pd.Timedelta(window))]\n    has = (e.pivot_table(index=\"person\", columns=\"event_name\", values=\"t\", aggfunc=\"size\")\n             .reindex(index=start.index, columns=STEPS).notna())\n    return has.cummin(axis=1)                 # шаг засчитан, только если засчитаны все до него\n\nfirst = ev[ev.event_name == \"app_open\"].sort_values(\"t\").groupby(\"person\").first()\nold = users.loc[users.signup_time < pd.Timestamp(\"2026-01-05\", tz=MSK), \"user_id\"]\nnew = first[~first.index.isin(old) & (first.t < pd.Timestamp(\"2026-06-22\", tz=MSK))]\nreach = funnel(ev, new.t)                     # окно 7 суток успело закрыться у всех\n\nseg = pd.DataFrame({\n    \"канал\": new.traffic_source.replace({\"search\": \"органика\", \"direct\": \"органика\", \"partner\": \"партнёры\",\n                                         \"ad\": \"реклама\", \"push\": \"прочее\", \"email\": \"прочее\"}),\n    \"платформа\": new.platform.replace({\"android\": \"приложение\", \"ios\": \"приложение\", \"web\": \"сайт\"}),\n    \"оплатил\": reach[\"order_paid\"]})\nkw = dict(index=\"канал\", columns=\"платформа\", values=\"оплатил\", margins=True, margins_name=\"всего\")\nrate = seg.pivot_table(aggfunc=\"mean\", **kw) * 100   # доля оплативших → проценты\nsize = seg.pivot_table(aggfunc=\"count\", **kw)        # сколько людей в ячейке\norder = [\"органика\", \"партнёры\", \"реклама\", \"прочее\", \"всего\"]\nprint(rate.reindex(order).round(1), size.reindex(order), sep=\"\\n\\n\")", "out": "платформа  приложение  сайт  всего\nканал                             \nорганика         23.8  16.7   21.5\nпартнёры         39.7  36.8   37.3\nреклама          12.2  10.4   11.8\nпрочее            4.0   3.3    3.5\nвсего            19.4  23.7   21.1\n\nплатформа  приложение  сайт  всего\nканал                             \nорганика         2624  1260   3884\nпартнёры          272  1374   1646\nреклама          2257   557   2814\nпрочее             50    92    142\nвсего            5203  3283   8486", "outLabel": "Вывод: конверсия в оплату за 7 суток, %, и число людей", "note": "Журнал и аккаунты — общий набор data/events/. margins=True добавляет строку и столбец «всего»: в нём и прячется парадокс."}, "chart": {"title": "График воронки без «воронки»: столбцы, доля перехода и один акцент", "badge": "проверено: Python 3.13, pandas 3.0.5, Matplotlib 3.10.0", "lang": "python", "code": "import matplotlib.pyplot as plt\n\nplt.rcParams[\"svg.fonttype\"] = \"none\"         # подписи в SVG остаются текстом\n\nmay = first[~first.index.isin(old)\n            & (first.t >= pd.Timestamp(\"2026-05-01\", tz=MSK))\n            & (first.t < pd.Timestamp(\"2026-06-01\", tz=MSK))]\nn = funnel(ev, may.t).sum()                   # дошли до шага: окно 7 суток, любой порядок\nstep = n / n.shift()                          # доля перехода с прошлого шага\nworst = step.idxmin()                         # где теряем больше всего\nprint(n.to_dict())\nprint(\"переходы, %:\", (step.iloc[1:] * 100).round(1).to_dict())\nassert worst == \"add_to_cart\" and step[worst] < 0.5, \"заголовок данными не подтверждается\"\n\nGREY, ACCENT = \"#BBBBBB\", \"#0072B2\"\nnames = [\"открыл\", \"карточка\", \"корзина\", \"оформление\", \"оплата\"]\ncolors = [ACCENT if s == worst else GREY for s in STEPS]\nfig, ax = plt.subplots(figsize=(7, 3.6))\nbars = ax.bar(names, n, color=colors, width=0.6)\nax.bar_label(bars, labels=[f\"{v:,}\".replace(\",\", \" \") for v in n], padding=3, fontsize=10)\nfor i in range(1, 5):                         # доля перехода — над промежутком между столбцами\n    on = STEPS[i] == worst\n    ax.text(i - 0.5, n.max() * 1.13, f\"→ {step.iloc[i]:.0%}\", ha=\"center\",\n            fontsize=10, color=ACCENT if on else \"#555555\", fontweight=\"bold\" if on else \"normal\")\nax.set_ylim(0, n.max() * 1.22)\nax.set_yticks([])                              # подписи на столбцах заменяют ось\nax.spines[[\"top\", \"right\", \"left\"]].set_visible(False)\nax.set_title(\"Из карточки в корзину доходит меньше половины\", loc=\"left\", fontweight=\"bold\", pad=24)\nax.text(0, 1.04, \"Новички мая: сколько человек дошло до шага за 7 суток, любой порядок\",\n        transform=ax.transAxes, color=\"#555555\")\nfig.text(0.01, -0.02, \"Источник: учебный журнал событий, events.parquet\", fontsize=8, color=\"#777777\")\nfig.savefig(\"funnel_bars.svg\", bbox_inches=\"tight\")", "out": "{'app_open': 1610, 'product_view': 1525, 'add_to_cart': 654, 'checkout_start': 344, 'order_paid': 329}\nпереходы, %: {'product_view': 94.7, 'add_to_cart': 42.9, 'checkout_start': 52.6, 'order_paid': 95.6}", "outLabel": "Вывод: проверка заголовка перед рисованием", "note": "Продолжение блока выше: ev, first, old, funnel, STEPS и MSK — оттуда. Рисунок ниже — настоящий вывод этого кода, SVG с текстом вместо кривых."}};/*code:end*/

  const NAMES = ['открыл', 'карточка', 'корзина', 'оформление', 'оплата'];
  const SHORT = ['вход', 'карточка', 'корзина', 'оформл.', 'оплата'];
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const pc = (a, b, d = 1) => (a / b * 100).toFixed(d).replace('.', ',');
  const num = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /* ===================== Сцена: тысяча точек идут через пять шагов ===================== */
  // судьбы точек: до какого шага дошёл человек в четырёх определениях
  // A — любой порядок, без окна; B — строгий, без окна; C — строгий, 7 суток; D — строгий, 1 сутки
  const DOTS = [];
  D.DOTS.forEach(([a, b, c, d, n]) => { for (let j = 0; j < n; j++) DOTS.push({ A: a, B: b, C: c, D: d }); });
  DOTS.sort((x, y) => y.A - x.A || y.B - x.B || y.C - x.C || y.D - x.D);
  const N = DOTS.length;
  const SLOT = {}, CNT = {};
  // слот точки в столбце k: внизу те, кто пошёл дальше, наверху — кто остановился на этом шаге;
  // внутри групп порядок общий для всех определений, поэтому при смене определения двигаются только те, чья судьба изменилась
  [...'ABCD'].forEach(X => {
    SLOT[X] = []; CNT[X] = [];
    for (let k = 1; k <= 5; k++) {
      const s = new Int16Array(N).fill(-1); let c = 0;
      for (let i = 0; i < N; i++) if (DOTS[i][X] > k) s[i] = c++;
      for (let i = 0; i < N; i++) if (DOTS[i][X] === k) s[i] = c++;
      SLOT[X][k] = s; CNT[X][k] = c;
    }
  });
  const conv = X => CNT[X][5] / N;
  const DEFN = { A: ['∞', 'любой'], B: ['∞', 'строгий'], C: ['7 сут', 'строгий'], D: ['1 сут', 'строгий'] };
  // шаги сцены: определение, до какого столбца дошёл поток, переход между определениями
  const ST = [
    { X: 'A', F: 1 }, { X: 'A', F: 2 }, { X: 'A', F: 3 }, { X: 'A', F: 5, two: true },
    { X: 'A', F: 5, lab: true }, { X: 'B', P: 'A', kind: 'back', lab: true }, { X: 'B', lab: true },
    { X: 'C', P: 'B', kind: 'melt', lab: true }, { X: 'D', P: 'C', kind: 'melt', lab: true }, { X: 'D', lab: true, ghost: 'A' }
  ];
  const dA = k => CNT.A[k - 1] - CNT.A[k];
  const CALL = [
    [1, `${num(D.NP)} новичков мая → ${num(N)} точек`],
    [1, `${dA(2)} ушли, не открыв ни одной карточки`],
    [2, `−${dA(3)}: главная потеря — между карточкой и корзиной`],
    [5, `${CNT.A[5]} оплатили: ${pc(CNT.A[5], N)}%`],
    ['t3', `самый слабый переход: ${pc(CNT.A[3], CNT.A[2], 0)}%`],
    [3, `${CNT.A[3] - CNT.B[3]} точки: корзина раньше первой карточки`],
    [5, `−${CNT.A[5] - CNT.B[5]} оплат: ${pc(CNT.B[5], N)}%`],
    [5, `−${CNT.B[5] - CNT.C[5]}: оплатили позже 7 суток`],
    [5, `−${CNT.C[5] - CNT.D[5]}: оплатили позже первых суток`],
    [5, `было ${CNT.A[5]}, стало ${CNT.D[5]} — тот же журнал`]
  ];
  const COL = { go: [54, 184, 166], dim: [52, 63, 86], paid: [232, 197, 71], back: [240, 162, 71], melt: [242, 117, 106] };
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
  const GO = mix(COL.go, COL.go, 0), DIM = mix(COL.go, COL.dim, 1), PAID = mix(COL.go, COL.paid, 1);
  const FONT = 'Onest, system-ui, sans-serif', MONO = '"JetBrains Mono", ui-monospace, monospace';

  const scene = {
    parts: [{ n: '01', name: 'Новички', s: [0, 1] }, { n: '02', name: 'Отсев', s: [2, 3] }, { n: '03', name: 'Две конверсии', s: [4] }, { n: '04', name: 'Порядок', s: [5, 6] }, { n: '05', name: 'Окно', s: [7, 8, 9] }],
    steps: [
      { title: 'Тысяча новичков мая', dur: 2600, body: `<p>В мае в магазин впервые зашли ${num(D.NP)} человек. Каждая точка — 1,6 новичка, всего их ${num(N)}.</p><p>Первый шаг воронки — <b>открыл приложение или сайт</b>. Его прошли все: с него начинается отсчёт.</p>` },
      { title: 'Карточка товара', dur: 2600, body: `<p>Точки идут к следующему шагу. До карточки товара дошли ${CNT.A[2]} из ${num(N)}.</p><p>Кто остановился, гаснет в своём столбце: открыл магазин и ушёл.</p>` },
      { title: 'Корзина: главная потеря', dur: 2800, body: `<p>До корзины добираются ${CNT.A[3]}. Между карточкой и корзиной исчезают ${dA(3)} точки — больше, чем на любом другом шаге.</p>` },
      { title: 'Оформление и оплата', dur: 3200, body: `<p>Оформление начинают ${CNT.A[4]}, оплачивают ${CNT.A[5]}. Конверсия в оплату — <b>${pc(CNT.A[5], N)}%</b>, если ждать сколько угодно и не следить за порядком шагов.</p>` },
      { title: 'Пошаговая и сквозная', dur: 2600, body: `<p>Под столбцами — пошаговая конверсия, доля от предыдущего шага. Над столбцами — сквозная, доля от всех вошедших.</p><p>Сквозная равна произведению пошаговых: ${[2, 3, 4, 5].map(k => (CNT.A[k] / CNT.A[k - 1]).toFixed(2).replace('.', ',')).join(' × ')} ≈ ${conv('A').toFixed(2).replace('.', ',')}.</p>` },
      { title: 'Строгий порядок', dur: 3400, body: `<p>Теперь шаг засчитан, только если он случился не раньше предыдущего.</p><p>Оранжевые точки положили товар в корзину раньше, чем открыли первую карточку: это быстрое добавление из каталога. Они возвращаются к шагу «карточка».</p>` },
      { title: 'Что срезал порядок', dur: 2400, body: `<p>В корзине ${CNT.B[3]} вместо ${CNT.A[3]}, до оплаты доходят ${CNT.B[5]} — <b>${pc(CNT.B[5], N)}%</b>.</p><p>Строгий порядок отвечает на другой вопрос: сколько людей прошли путь именно так, как его нарисовала воронка.</p>` },
      { title: 'Окно 7 суток', dur: 3400, body: `<p>Ждём шаги не дольше 7 суток от первого входа. Красные точки дошли до шага позже — для этого окна они не дошли.</p><p>Последний столбик тает сильнее всех: ${CNT.B[5]} → ${CNT.C[5]}.</p>` },
      { title: 'Окно сутки', dur: 3400, body: `<p>Сужаем окно до 24 часов. Остаётся ${CNT.D[5]} оплат — <b>${pc(CNT.D[5], N)}%</b>.</p><p>Первые шаги почти не изменились, а оплат стало меньше в ${(CNT.B[5] / CNT.D[5]).toFixed(1).replace('.', ',')} раза, чем без окна.</p>` },
      { title: 'Один журнал, четыре числа', dur: 3000, next: 'Читать страницу', body: `<p>Пунктир — столбцы с начала сцены. Те же люди и журнал: ${['A', 'B', 'C', 'D'].map(X => pc(CNT[X][5], N) + '%').join(', ')}.</p><p>Какое число — «конверсия»? Все: каждое отвечает на свой вопрос. В интерактиве добавится ещё одно решение — люди или сессии.</p>` }
    ],
    hud: [{ id: 'paid', label: 'Оплатили' }, { id: 'conv', label: 'Конверсия' }, { id: 'win', label: 'Окно' }],
    legend: `<span><i class="sq" style="background:rgb(${COL.go})"></i>пошёл дальше</span><span><i class="sq" style="background:rgb(${COL.dim})"></i>остановился</span><span><i class="sq" style="background:rgb(${COL.paid})"></i>оплатил</span>`,
    info: 'ВОРОНКА',
    aiNote: `В анимации учебный журнал магазина: ${D.NP} новичков мая (первый app_open в мае по Минску), масштаб до 1 000 точек. Шаги: app_open → product_view → add_to_cart → checkout_start → order_paid. Любой порядок без окна: ${CNT.A.slice(1).join(' → ')} (${pc(CNT.A[5], N)}%). Строгий порядок без окна: ${CNT.B.slice(1).join(' → ')} (${pc(CNT.B[5], N)}%). Строгий, окно 7 суток: ${CNT.C.slice(1).join(' → ')} (${pc(CNT.C[5], N)}%). Строгий, окно 1 сутки: ${CNT.D.slice(1).join(' → ')} (${pc(CNT.D[5], N)}%).`,
    mount(root, api) {
      root.innerHTML = '<div class="fn-sc"><canvas class="fn-cv" aria-hidden="true"></canvas><div class="sc-call fn-call"></div></div>';
      const box = root.firstChild, cv = box.firstChild, call = box.lastChild, g = cv.getContext('2d');
      let W = 0, H = 0, fs = 12, top = 0, bot = 0, colW = 0, gap = 0, C = 10, pitch = 4, sz = 3, sig = '';
      function fit() {
        W = box.clientWidth; H = box.clientHeight; if (!W || !H) return false;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        fs = W < 480 ? 10.5 : 12;
        top = fs * 2 + 14; bot = H - (fs * 2 + 22);
        gap = W < 480 ? 8 : 20; colW = (W - gap * 4) / 5;
        let best = 0;
        for (let c = 4; c <= 40; c++) { const p = Math.min(colW / c, (bot - top) / Math.ceil(N / c)); if (p > best) { best = p; C = c; } }
        pitch = best; sz = Math.max(1.4, pitch * 0.74);
        return true;
      }
      const colL = k => (k - 1) * (colW + gap) + (colW - C * pitch) / 2;
      const colC = k => (k - 1) * (colW + gap) + colW / 2;
      const XY = (k, s) => [colL(k) + (s % C) * pitch, bot - (Math.floor(s / C) + 1) * pitch];
      const colTop = (k, n) => bot - Math.ceil(n / C) * pitch;
      const dot = (x, y, col, a, k = 1) => { const z = sz * k; g.globalAlpha = a; g.fillStyle = col; g.fillRect(x + (pitch - z) / 2, y + (pitch - z) / 2, z, z); };
      const text = (t, x, y, col, font, al, base) => { g.fillStyle = col; g.font = font; g.textAlign = al || 'center'; g.textBaseline = base || 'alphabetic'; g.globalAlpha = 1; g.fillText(t, x, y); };

      function draw(k, p) {
        g.clearRect(0, 0, W, H);
        const st = ST[k], X = st.X;
        // ---------- точки ----------
        if (!st.P) {
          // поток: столбцы 1…F0 уже заполнены, точки летят в столбец m с прогрессом q
          let F0 = 5, m = 0, q = 1;
          if (k === 0) { F0 = 0; m = 1; q = p; }
          else if (k === 1 || k === 2) { F0 = k; m = k + 1; q = p; }
          else if (k === 3) { if (p < 0.5) { F0 = 3; m = 4; q = p * 2; } else { F0 = 4; m = 5; q = p * 2 - 1; } }
          for (let c = 1; c <= Math.max(F0, m); c++) {
            const s = SLOT[X][c];
            for (let i = 0; i < N; i++) {
              if (s[i] < 0) continue;
              const v = DOTS[i][X], [x1, y1] = XY(c, s[i]);
              if (c === m) {
                const t = ease(clamp01((q - 0.45 * s[i] / CNT[X][c]) / 0.55));
                if (t <= 0) continue;
                if (c === 1) { dot(x1, y1, GO, t); continue; }
                const [x0, y0] = XY(c - 1, SLOT[X][c - 1][i]);
                dot(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, c === 5 ? mix(COL.go, COL.paid, t) : GO, 1);
              } else {
                const dimT = c < F0 ? 1 : m === F0 + 1 ? clamp01((q - 0.5) / 0.5) : 1;
                dot(x1, y1, c === 5 ? PAID : v > c ? GO : mix(COL.go, COL.dim, dimT), 1);
              }
            }
          }
        } else {
          // переход между определениями: подсветить уходящие копии, увести их (назад или «растаять»), потом сдвинуть остальных
          const P = st.P, back = st.kind === 'back';
          const ph1 = clamp01(p / 0.25), ph2 = ease(clamp01((p - 0.25) / (back ? 0.5 : 0.4))), ph3 = ease(clamp01((p - 0.6) / 0.35));
          const hot = back ? COL.back : COL.melt;
          for (let c = 1; c <= 5; c++) {
            const sp = SLOT[P][c], sx = SLOT[X][c];
            for (let i = 0; i < N; i++) {
              if (sp[i] < 0) continue;
              const d = DOTS[i], [x0, y0] = XY(c, sp[i]);
              if (sx[i] >= 0) {
                const [x1, y1] = XY(c, sx[i]);
                const col = c === 5 ? PAID : d[X] > c ? GO : d[P] === c ? DIM : mix(COL.go, COL.dim, ph3);
                dot(x0 + (x1 - x0) * ph3, y0 + (y1 - y0) * ph3, col, 1);
              } else {
                const col = mix(c === 5 ? COL.paid : d[P] > c ? COL.go : COL.dim, hot, ph1);
                if (ph2 >= 1) continue;
                if (back) {
                  const [x1, y1] = XY(d[X], SLOT[P][d[X]][i]);
                  dot(x0 + (x1 - x0) * ph2, y0 + (y1 - y0) * ph2, col, 1 - clamp01((ph2 - 0.75) / 0.25));
                } else dot(x0, y0 + ph2 * pitch * 3, col, 1 - ph2, 1 - 0.6 * ph2);
              }
            }
          }
        }
        g.globalAlpha = 1;
        // ---------- пунктир: столбцы с начала сцены ----------
        if (st.ghost) {
          g.save(); g.setLineDash([4, 4]); g.strokeStyle = 'rgba(232,236,244,.55)'; g.lineWidth = 1;
          for (let c = 2; c <= 5; c++) {
            const n0 = CNT[st.ghost][c]; if (Math.ceil(n0 / C) - Math.ceil(CNT[X][c] / C) < 6) continue;
            const y = colTop(c, n0); g.strokeRect(colL(c) - 2.5, y - 2.5, C * pitch + 5, bot - y + 5);
            if (c === 5) text(`было ${n0}`, colC(c), y - 8, '#8d95aa', `500 ${fs - 1}px ${MONO}`);
          }
          g.restore();
        }
        // ---------- подписи ----------
        let shown = 5, mq = 1;                    // до какого столбца подписывать числа
        if (k === 0) shown = 1;
        else if (k === 1 || k === 2) { shown = k + 1; mq = p; }
        else if (k === 3) { shown = p < 0.5 ? 4 : 5; mq = p < 0.5 ? p * 2 : p * 2 - 1; }
        const Xl = st.P && p < 0.6 ? st.P : X;
        for (let c = 1; c <= 5; c++) {
          text(NAMES[c - 1], colC(c), bot + fs + 6, c === 5 ? 'rgb(232,197,71)' : '#b7c0d2', `500 ${fs}px ${FONT}`);
          if (c > shown || (c === shown && k <= 3 && k > 0 && mq < 0.6)) continue;
          const n = CNT[Xl][c], y = colTop(c, n) - 6;
          text(num(n), colC(c), st.lab ? y - fs - 1 : y, '#e8ecf4', `600 ${fs + 1}px ${MONO}`);
          if (!st.lab) continue;
          text(`${pc(n, N, 0)}%`, colC(c), y, '#8d95aa', `500 ${fs - 1}px ${MONO}`);
          if (c > 1) {
            const worst = c === 3;
            text(`→ ${pc(n, CNT[Xl][c - 1], 0)}%`, (colC(c - 1) + colC(c)) / 2, bot + fs * 2 + 14, worst ? 'rgb(242,117,106)' : '#8d95aa', `${worst ? 600 : 500} ${fs - 1}px ${MONO}`);
          }
        }
        // ---------- выноска ----------
        const cl = CALL[k], show = p >= (st.P ? 0.75 : 0.5);
        call.textContent = cl[1]; call.style.opacity = show ? '1' : '0';
        call.style.maxWidth = `${Math.min(230, W * 0.46)}px`;
        const bw = call.offsetWidth, bh = call.offsetHeight;
        const bx = W - bw - 4, by = W < 480 ? 2 : 6;
        call.style.left = `${bx}px`; call.style.top = `${by}px`;
        if (show) {
          let tx, ty;
          if (cl[0] === 't3') { tx = (colC(2) + colC(3)) / 2; ty = bot + fs * 2 + 2; }
          else { const n = CNT[st.P && p < 0.75 ? st.P : X][cl[0]]; tx = colC(cl[0]); ty = colTop(cl[0], n) - (st.lab ? fs * 2 + 10 : fs + 10); }
          const ax = bx, ay = by + bh;
          g.strokeStyle = 'rgba(54,184,166,.9)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(ax + 10, ay); g.lineTo(tx, ty); g.stroke();
          g.fillStyle = 'rgb(54,184,166)'; g.beginPath(); g.arc(tx, ty, 2.8, 0, 7); g.fill();
        }
      }
      return {
        render(k, p) {
          const st = ST[k], X = st.P && p < 0.6 ? st.P : st.X;
          const early = k < 3 || (k === 3 && p < 0.75);  // до оплаты точки ещё не дошли
          const narrow = box.clientWidth < 480;
          api.hud('paid', early ? '—' : String(CNT[X][5]), early || narrow ? '' : `из ${num(N)}`);
          api.hud('conv', early ? '—' : `${pc(CNT[X][5], N)}%`);
          api.hud('win', DEFN[X][0], narrow && DEFN[X][1] === 'строгий' ? 'строг.' : DEFN[X][1]);
          const key = `${k}|${Math.round(p * 120)}|${box.clientWidth}x${box.clientHeight}`;
          if (key === sig) return; sig = key;
          if (fit()) draw(k, p);
        }
      };
    }
  };

  /* ===================== Интерактив «Одна воронка, четыре ответа» ===================== */
  const PRE = [
    { id: 'А', s: { u: 'u', o: 'a', w: '0' }, t: 'все, кто когда-либо оплатил' },
    { id: 'Б', s: { u: 'u', o: 's', w: '7' }, t: 'оплатил за неделю, по шагам' },
    { id: 'В', s: { u: 'u', o: 's', w: '1' }, t: 'оплатил в первые сутки' },
    { id: 'Г', s: { u: 's', o: 'a', w: '0' }, t: 'визиты с оплатой' }
  ];
  const OPT = {
    u: [['u', 'человек'], ['s', 'сессия']],
    o: [['a', 'любой'], ['s', 'строгий']],
    w: [['1', '1 сутки'], ['7', '7 суток'], ['0', 'без окна']]
  };
  const keyOf = s => s.u === 's' ? `s${s.o}` : `u${s.o}${s.w}`;
  const label = s => `${s.u === 's' ? 'сессия' : 'человек'} · ${s.o === 'a' ? 'любой' : 'строгий'} порядок · ${s.u === 's' ? 'окно — сессия' : { 1: 'окно 1 сутки', 7: 'окно 7 суток', 0: 'без окна' }[s.w]}`;
  const ALLV = Object.values(D.U).map(v => v[4] / v[0] * 100);
  const RANGE = `${Math.min(...ALLV).toFixed(1).replace('.', ',')}–${Math.max(...ALLV).toFixed(1).replace('.', ',')}%`;
  const U = D.U;
  const TASKS = [
    { p: 'o', t: 'Порядок: почему строгий срезает людей, и больше всего — на корзине?',
      a: `Без окна корзина теряет ${U.ua0[2] - U.us0[2]} человек: ${num(U.ua0[2])} → ${num(U.us0[2])}. У всех ${U.ua0[2] - U.us0[2]} каждое добавление в корзину случилось раньше первой карточки — это быстрое добавление из каталога. Нестрогий порядок их засчитывает, строгий — нет. До оплаты из них дошли ${U.ua0[4] - U.us0[4]}: ${U.ua0[4]} → ${U.us0[4]}. У сессий то же самое: ${num(U.sa[2])} → ${num(U.ss[2])} на корзине.` },
    { p: 'w', t: 'Окно: почему сутки и неделя дают меньше, чем без окна?',
      a: `Путь к покупке растянут во времени: медиана от первого входа до оплаты — 2 дня 22 часа, 58% покупателей платят позже первых суток, 36% — позже недели. Окно отрезает медленных: ${U.ua0[4]} → ${U.ua7[4]} → ${U.ua1[4]} оплат при любом порядке. «Правильного» окна нет: сутки меряют импульсную покупку, неделя даёт сравнимую меру для разных когорт.` },
    { p: 'u', t: 'Единица: почему по сессиям 10%, а не 30?',
      a: `Другой знаменатель: ${num(D.NP)} человек сделали ${num(D.NS)} сессий, по 3,9 на человека. Покупатели заходят чаще остальных — 6,7 сессии против 2,7 — и платят в одной-двух из них. Кроме того, 84 покупателя из ${U.ua0[4]} собрали путь из нескольких визитов: корзина в одном, оплата в другом. Сессий с оплатой 874, а со всеми пятью шагами — ${U.sa[4]}.` },
    { p: 'x', t: 'Какой из четырёх ответов верный?',
      a: 'Все четыре: каждый отвечает на свой вопрос. А — какая доля новичков вообще покупает. Б — сколько покупают за первую неделю, и это число можно сравнивать между когортами. В — сколько покупают сразу. Г — какая доля визитов кончается оплатой. Определение выбирают под вопрос до расчёта и пишут рядом с числом.' }
  ];

  function buildFunnel(box, api) {
    const { $, esc } = api;
    const segHTML = (k, nm) => `<div class="fw-ctl"><span class="fw-cl">${nm}</span><div class="seg" role="group" aria-label="${nm}">${OPT[k].map(([v, t]) => `<button type="button" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div></div>`;
    box.innerHTML = `<div class="block-hd"><span class="t">Одна воронка, четыре ответа <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="fw-reset">Сбросить</button></div></div>
<p class="hint fw-do">Переключайте единицу счёта, порядок и окно или выберите ответ одного из четырёх аналитиков.</p>
<div class="fw-pres" role="group" aria-label="Ответы четырёх аналитиков">${PRE.map((r, i) => `<button type="button" class="fw-pre" data-pre="${i}"><b>${r.id} · ${pc(U[keyOf(r.s)][4], U[keyOf(r.s)][0])}%</b><small>${r.t}</small></button>`).join('')}</div>
<div class="fw-ctrls">${segHTML('u', 'Единица')}${segHTML('o', 'Порядок')}${segHTML('w', 'Окно')}</div>
<div class="stage"><div class="fw-plot"><div class="fw-bars" id="fw-bars"></div><div class="fw-trans" id="fw-trans"></div><p class="fw-leg"><span class="fw-lg-bar"></span>дошли до шага <span class="fw-lg-gh"></span>прошлое состояние <span class="fw-lg-bad">→ %</span>главная потеря</p></div>
<div class="narr"><p class="cap">Что изменилось</p><div class="narr-text" id="fw-delta"></div></div></div>
<div class="fw-tb"><p class="cap">Задания: объясните каждую разницу сами, потом откройте разбор</p><ol class="steps fw-tasks" id="fw-tasks"></ol></div>
<div class="status"><span><span class="dot live"></span><span id="fw-def"></span></span><span id="fw-res"></span><span id="fw-worst"></span><span class="grow"></span><span id="fw-range"></span></div>`;
    let s, prev, touched, open;
    const fresh = () => { s = { u: 'u', o: 'a', w: '0' }; prev = null; touched = { u: false, o: false, w: false, x: false }; open = [false, false, false, false]; };
    $('fw-bars').innerHTML = NAMES.map((n, i) => `<div class="fw-col"><span class="fw-n" id="fw-n${i}"></span><span class="fw-p" id="fw-p${i}"></span><div class="fw-track"><div class="fw-gh" id="fw-g${i}"></div><div class="fw-bar${i === 4 ? ' last' : ''}" id="fw-b${i}"></div></div><span class="fw-name"><span class="fw-l">${n}</span><span class="fw-s">${SHORT[i]}</span></span></div>`).join('');
    $('fw-trans').innerHTML = [1, 2, 3, 4].map(i => `<span id="fw-t${i}" style="grid-column:${i + 1}"></span>`).join('');
    function draw() {
      const v = U[keyOf(s)], pv = prev ? U[keyOf(prev)] : null;
      let worst = 1, wv = 2;
      for (let i = 1; i < 5; i++) { const r = v[i] / v[i - 1]; if (r < wv) { wv = r; worst = i; } }
      v.forEach((n, i) => {
        $(`fw-n${i}`).textContent = num(n);
        $(`fw-p${i}`).textContent = `${pc(n, v[0])}%`;
        $(`fw-b${i}`).style.height = `${n / v[0] * 100}%`;
        const gh = $(`fw-g${i}`);
        if (pv && Math.abs(pv[i] / pv[0] - n / v[0]) > 0.002) { gh.style.height = `${pv[i] / pv[0] * 100}%`; gh.hidden = false; } else gh.hidden = true;
        if (i) { const t = $(`fw-t${i}`); t.innerHTML = `<i>→ </i>${pc(n, v[i - 1])}%`; t.classList.toggle('bad', i === worst); }
      });
      box.querySelectorAll('.seg button').forEach(b => {
        const on = s[b.dataset.k] === b.dataset.v;
        b.setAttribute('aria-pressed', String(on && !(b.dataset.k === 'w' && s.u === 's')));
        b.disabled = b.dataset.k === 'w' && s.u === 's';
      });
      box.querySelectorAll('.fw-pre').forEach(b => { const r = PRE[+b.dataset.pre].s; b.setAttribute('aria-pressed', String(keyOf(r) === keyOf(s))); });
      // что изменилось
      let msg;
      if (!pv) msg = `Начальное состояние: <b>${esc(label(s))}</b>. Оплатили ${num(v[4])} из ${num(v[0])} — ${pc(v[4], v[0])}%. Переключите любой параметр.`;
      else {
        const ch = ['u', 'o', 'w'].filter(k => prev[k] !== s[k] && !(k === 'w' && (prev.u === 's' || s.u === 's')));
        const nm = { u: 'Единица', o: 'Порядок', w: 'Окно' };
        const txt = k => ({ u: { u: 'человек', s: 'сессия' }, o: { a: 'любой', s: 'строгий' }, w: { 1: '1 сутки', 7: '7 суток', 0: 'без окна' } })[k];
        const r1 = x => Math.round(x * 1000) / 10, d = r1(v[4] / v[0]) - r1(pv[4] / pv[0]);   // разница уже округлённых процентов
        const head = ch.length ? ch.map(k => `${nm[k]}: ${txt(k)[prev[k]]} → ${txt(k)[s[k]]}`).join('; ') : 'Ничего не поменялось';
        msg = `<b>${esc(head)}.</b> Конверсия ${pc(pv[4], pv[0])} → ${pc(v[4], v[0])}% (${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(1).replace('.', ',')}\u00a0п.\u00a0п.), оплатили ${num(v[4])} из ${num(v[0])}${ch.length > 1 ? '. Сменилось сразу несколько решений — разберите их по одному' : ch.length ? '. Почему так — в заданиях ниже' : ''}.`;
      }
      $('fw-delta').innerHTML = msg;
      $('fw-tasks').innerHTML = TASKS.map((t, i) => `<li class="${touched[t.p] ? 'on' : ''}"><b>${touched[t.p] ? '✓' : i + 1}</b><span>${esc(t.t)} <button type="button" class="fw-ans" data-a="${i}" aria-expanded="${open[i]}">${open[i] ? 'Скрыть' : 'Разбор'}</button><span class="fw-why"${open[i] ? '' : ' hidden'}>${esc(t.a)}</span></span></li>`).join('');
      $('fw-def').textContent = label(s);
      $('fw-res').textContent = `Оплата: ${num(v[4])} из ${num(v[0])} = ${pc(v[4], v[0])}%`;
      $('fw-worst').textContent = `Главная потеря: ${NAMES[worst - 1]} → ${NAMES[worst]}`;
      $('fw-range').textContent = `Разброс ответов: ${RANGE}`;
    }
    box.addEventListener('click', e => {
      const b = e.target.closest('.seg button[data-k]'), pr = e.target.closest('[data-pre]'), an = e.target.closest('[data-a]');
      if (b && !b.disabled) { if (s[b.dataset.k] === b.dataset.v) return; prev = Object.assign({}, s); s[b.dataset.k] = b.dataset.v; touched[b.dataset.k] = true; if (b.dataset.k === 'u' || touched.u && touched.o && touched.w) touched.x = touched.u && touched.o && touched.w; draw(); }
      else if (pr) { const r = PRE[+pr.dataset.pre].s; if (keyOf(r) === keyOf(s)) return; prev = Object.assign({}, s); ['u', 'o', 'w'].forEach(k => { if (s[k] !== r[k]) touched[k] = true; }); s = Object.assign({}, r); touched.x = touched.u && touched.o && touched.w; draw(); }
      else if (an) { const i = +an.dataset.a; open[i] = !open[i]; draw(); }
    });
    $('fw-reset').addEventListener('click', () => { fresh(); draw(); });
    fresh(); draw();
    return {
      describe() {
        const v = U[keyOf(s)];
        return `${label(s)}; по шагам: ${v.join(' → ')}; конверсия ${pc(v[4], v[0])}%; открыты разборы: ${open.map((o, i) => o ? i + 1 : 0).filter(Boolean).join(', ') || 'нет'}.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-9-2',
    short: 'DA-09',
    title: 'Воронки и конверсии',
    where: 'блок «Дата аналитика», тема 09 «Продуктовые метрики и события», страница 9.2',
    aiData: `учебный журнал событий магазина: ${D.NP} новичков мая, воронка app_open → product_view → add_to_cart → checkout_start → order_paid, по людям и по сессиям`,
    scene,
    widgets: { funnel: buildFunnel },
    code: CODE,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'Аналитик А посчитал воронку новичков мая по людям, в любом порядке и без окна: 30,4%. Аналитик Г берёт те же шаги и тот же журнал, но считает сессии. Что он получит?',
      opts: [['Около 30%: шаги и журнал те же'], ['Больше 30%: сессий больше, чем людей'], ['Около 10%: в знаменателе тысячи визитов, а оплата — в немногих', 1], ['0%: оплата приходит с сервера, у неё нет сессии']],
      why: `Знаменатель сессионной воронки — визиты: ${num(D.NP)} человек сделали ${num(D.NS)} сессий. Покупатель заходит много раз, а платит в одном-двух визитах, поэтому выходит ${pc(U.sa[4], U.sa[0])}%. Серверную оплату привязали к сессии устройства, где она случилась, так что она не теряется. Больше 30% не получится: числитель и знаменатель растут не вместе.` },
    q2: { sec: 'idea', q: 'В анимации окно сузили до 7 суток. Почему последний столбик растаял сильнее остальных?',
      opts: [['Строгий порядок срезал быстрое добавление'], ['До оплаты идут дольше всего: первые шаги занимают минуты, а оплата у трети покупателей — позже недели', 1], ['В окне 7 суток меньше новичков'], ['Окно отбрасывает серверные события']],
      why: 'Окно считает только шаги, случившиеся за 7 суток от первого входа. Карточку открывают через секунды, а от входа до оплаты медиана — почти трое суток, и 36% покупателей платят позже недели. Новичков столько же, 1 610; порядок в этом шаге не менялся; серверные события окно не трогает.' },
    q3: { sec: 'method', q: 'Почему конверсия по сессиям ниже, чем по людям?',
      opts: [['В сессиях остаются боты'], ['У человека много визитов, а покупка — в одном; часть путей ещё и разорвана между визитами', 1], ['В сессионной воронке нет события оплаты'], ['Сессии всегда считают в строгом порядке']],
      why: 'Человек засчитан, если прошёл шаги хоть когда-нибудь в окне, а сессия — только если прошла их сама. Покупатели делают по 6–7 визитов и платят в одном-двух, а 84 из 490 вообще собрали путь из разных визитов. Боты убраны в обоих случаях, оплата к сессиям привязана, порядок выбирается отдельно.' },
    q4: { sec: 'nuances', q: 'На еженедельном графике 7-дневной конверсии новичков последняя неделя почти всегда ниже остальных. Почему?',
      opts: [['Новички последней недели хуже остальных'], ['Их окно ещё не закрылось: часть оплат случится после даты отчёта', 1], ['Окно 7 суток короче календарной недели'], ['В последнюю неделю больше ботов']],
      why: 'У новичков 22–28 июня к концу журнала прошло в среднем 3,5 суток из 7. Отчёт 22 июня показал бы для недели 15–21 июня 22,1%, а неделю спустя та же неделя дала 23,8%. Новички не хуже — им просто не дали времени. Незрелую когорту не показывают или помечают.' },
    q5: { sec: 'method', q: 'Менеджер предлагает: «Найдём шаг с самой низкой пошаговой конверсией и улучшим его». Что не так с этим планом?',
      opts: [['Ничего: самый слабый шаг всегда даёт самый большой рост'], ['Низкая доля бывает нормой шага, рост на нём может уйти в потери ниже, а причину воронка не показывает', 1], ['Пошаговые конверсии нельзя сравнивать между собой'], ['Самый слабый шаг всегда последний']],
      why: 'Карточка → корзина теряет больше всего во всех определениях, но выбирать из нескольких карточек — нормально. Если «протолкнуть» в корзину сомневающихся, они отвалятся на оформлении, и сквозная почти не сдвинется. Воронка показывает, где уходят люди, но не почему: что чинить, решают гипотезой и экспериментом. Сравнивать пошаговые можно, а слабым шаг бывает в любом месте.' },
    q6: { sec: 'code', q: 'Что изменится в выводе SQL-запроса, если в CTE s3 убрать условие w.event_time >= s2.t2?', code: "WHERE w.event_name = 'add_to_cart' AND w.event_time >= s2.t2", lang: 'sql',
      opts: [['Ничего: MIN и так берёт первое добавление'], ['Строгий столбец на корзине станет как любой порядок, 654 вместо 547: засчитаются корзины раньше карточки', 1], ['Запрос упадёт с ошибкой'], ['Из строгого столбца пропадут люди без карточки']],
      why: 'Условие и делает порядок строгим: корзина ищется не раньше первой карточки. Без него s3 возьмёт первое добавление в окне у всех, у кого была карточка, и корзина совпадёт с любым порядком. Ошибки не будет: синтаксис тот же. Люди без карточки и так не попадают в s3 — их отсекает JOIN с s2.' },
    q7: { sec: 'segments', q: 'В каждом канале приложение конвертирует лучше сайта, а в целом сайт выигрывает: 23,7% против 19,4%. Какой вывод верный?',
      opts: [['Сайт продаёт лучше — переводим рекламу на сайт'], ['Общие проценты врут, их нельзя показывать'], ['Платформы сравнивают внутри каналов: в целом сайт выигрывает, потому что на него ведут партнёры с высокой конверсией', 1], ['Это шум: разница меньше 5\u00a0п.\u00a0п.']],
      why: 'Это парадокс Симпсона: на сайт приходят 1 374 партнёрских новичка с конверсией около 37%, в приложение — 2 257 рекламных с 12%. Рекламный трафик на сайте конвертировал бы хуже, а не лучше. Общий процент верен как итог, но не годится для сравнения платформ. На тысячах людей разница в 4\u00a0п.\u00a0п. — не шум.' }
    },
    glossary: {
      funnel: { t: 'Воронка', en: 'funnel', d: 'Цепочка шагов к цели с долей людей или визитов, дошедших до каждого шага.' },
      step: { t: 'Шаг воронки', en: 'funnel step', d: 'Событие из плана событий, которое отмечает этап пути: карточка, корзина, оплата.' },
      conversion: { t: 'Конверсия', en: 'conversion rate', d: 'Доля дошедших до шага среди начавших.' },
      denom: { t: 'Знаменатель', en: 'denominator', d: 'Кого считают начавшими: людей или сессии, с какого момента и сколько ждать.' },
      stepconv: { t: 'Пошаговая конверсия', en: 'step conversion', d: 'Доля дошедших до шага среди дошедших до предыдущего.' },
      overall: { t: 'Сквозная конверсия', en: 'overall conversion', d: 'Доля дошедших до шага среди всех вошедших; равна произведению пошаговых.' },
      window: { t: 'Окно конверсии', en: 'conversion window', d: 'Сколько ждут остальные шаги после первого; всё, что позже, не засчитано.' },
      strict: { t: 'Строгий порядок', en: 'this order', d: 'Шаг засчитан, только если случился не раньше предыдущего.' },
      anyorder: { t: 'Нестрогий порядок', en: 'any order', d: 'Шаг засчитан, если в окне есть он и все шаги до него.' },
      quickadd: { t: 'Быстрое добавление', en: 'quick add', d: 'Кнопка «в корзину» прямо в каталоге, без карточки товара.' },
      pp: { t: 'Процентный пункт', en: 'percentage point', d: 'Разница двух процентов: с 30,4 до 28,2% — минус 2,2\u00a0п.\u00a0п.' },
      segment: { t: 'Сегментация', en: 'segmentation', d: 'Та же воронка отдельно по группам: каналам, платформам, странам.' },
      simpson: { t: 'Парадокс Симпсона', en: "Simpson's paradox", d: 'В каждой группе один вывод, а в сумме обратный: группы смешаны в разных пропорциях.' },
      cohort: { t: 'Когорта', en: 'cohort', d: 'Люди, пришедшие в один период; их сравнивают при равном сроке.' },
      attribution: { t: 'Атрибуция', en: 'attribution', d: 'Правило, какому каналу засчитать покупку, если человек касался нескольких.' },
      mfunnel: { t: 'Маркетинговая воронка', en: 'marketing funnel', d: 'Путь до продукта: показ рекламы, клик, установка; считается по данным рекламных систем.' }
    },
    materials: [
      ['da-9-2-funnels.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/events/', 'Учебные данные темы 09 — общий набор: журнал событий и аккаунты; база events в PostgreSQL — через load_pg.sql'],
      ['funnel.sql', 'Запрос воронки из раздела «Код»: окно и порядок через MIN(event_time)'],
      ['funnel_segments.ipynb', 'Ноутбук: та же воронка по сегментам, Симпсон и график']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне по источнику пять вопросов о знаменателе, окне, порядке шагов и единице счёта. По одному; после ответа объясни, где я ошибся.'],
      ['Определение воронки', 'Я опишу воронку своего продукта. Помоги записать её определение по шаблону из источника: когорта, шаги, единица, окно, порядок, чистка.'],
      ['Разбор сегментов', 'Я вставлю таблицу конверсий по платформам и каналам. Проверь по источнику, нет ли в ней парадокса Симпсона, и спроси, какой вывод можно делать.']
    ]
  };
})();
