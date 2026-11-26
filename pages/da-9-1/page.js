/* Страница 9.1 · Событийная модель: события, сессии, пользователи */
(() => {
  // Данные — из data/gen_page.py: 21 строка героя u_06883 за 12–15 мая (время — секунды от 12 мая 00:00 по Минску),
  // пороги интерактива, сверка всех состояний в pandas и PostgreSQL, код и вывод блоков кода.
  /*data:start*/
  const HERO = [[29112,"e0318904","app_open","client","d_f6f77955","u_06883","android",{"traffic_source":"push"}],[29150,"e0318905","product_view","client","d_f6f77955","u_06883","android",{"product_id":11,"category":"текстиль","price":4250}],[29200,"e0318906","product_view","client","d_f6f77955","u_06883","android",{"product_id":19,"category":"текстиль","price":4390}],[29295,"e0318907","product_view","client","d_f6f77955","u_06883","android",{"product_id":27,"category":"текстиль","price":3910}],[29342,"e0318908","add_to_cart","client","d_f6f77955","u_06883","android",{"product_id":27,"category":"текстиль","price":3910}],[29430,"e0318909","product_view","client","d_f6f77955","u_06883","android",{"product_id":29,"category":"посуда","price":730}],[30221,"e0318910","product_view","client","d_f6f77955","u_06883","android",{"product_id":13,"category":"посуда","price":690}],[30260,"e0318911","add_to_cart","client","d_f6f77955","u_06883","android",{"product_id":13,"category":"посуда","price":690}],[70805,"e0318912","app_open","client","d_f6f77955","u_06883","android",{"traffic_source":"push"}],[70840,"e0318913","product_view","client","d_f6f77955","u_06883","android",{"product_id":27,"category":"текстиль","price":3910}],[70890,"e0318914","checkout_start","client","d_f6f77955","u_06883","android",{"revenue":4600}],[70965,"e0318915","order_paid","server",null,"u_06883","android",{"order_id":"o_109808","revenue":4600}],[70967,"e0318916","purchase","client","d_f6f77955","u_06883","android",{"order_id":"o_109808","revenue":4600}],[131470,"e0318917","app_open","client","d_398d33df",null,"web",{"traffic_source":"search"}],[131520,"e0318918","product_view","client","d_398d33df",null,"web",{"product_id":7,"category":"декор","price":1900}],[131600,"e0318919","add_to_cart","client","d_398d33df",null,"web",{"product_id":7,"category":"декор","price":1900}],[331805,"e0318920","app_open","client","d_398d33df",null,"web",{"traffic_source":"direct"}],[331840,"e0318921","login","client","d_398d33df","u_06883","web",{}],[331875,"e0318922","checkout_start","client","d_398d33df","u_06883","web",{"revenue":1900}],[331950,"e0318923","order_paid","server",null,"u_06883","web",{"order_id":"o_109809","revenue":1900}],[331952,"e0318924","purchase","client","d_398d33df","u_06883","web",{"order_id":"o_109809","revenue":1900}]];
  const STOPS = [1, 2, 5, 10, 15, 20, 30, 45, 60, 120, 240, 480, 720, 1440];
  const CHECK = {"1_0":[10,2,2,1],"1_1":[10,2,1,1],"2_0":[5,2,2,1],"2_1":[5,2,1,1],"5_0":[5,2,2,1],"5_1":[5,2,1,1],"10_0":[5,2,2,1],"10_1":[5,2,1,1],"15_0":[4,2,2,1],"15_1":[4,2,1,1],"20_0":[4,2,2,1],"20_1":[4,2,1,1],"30_0":[4,2,2,1],"30_1":[4,2,1,1],"45_0":[4,2,2,1],"45_1":[4,2,1,1],"60_0":[4,2,2,1],"60_1":[4,2,1,1],"120_0":[4,2,2,1],"120_1":[4,2,1,1],"240_0":[4,2,2,1],"240_1":[4,2,1,1],"480_0":[4,2,2,1],"480_1":[4,2,1,1],"720_0":[3,2,2,1],"720_1":[3,2,1,1],"1440_0":[3,2,2,1],"1440_1":[3,2,1,1]};
  const CODE_SRC = {"sql": {"code": "-- 1. Очищенный слой: без дублей event_id и без ботов\nCREATE TEMP VIEW clean AS\nWITH dedup AS (\n    SELECT DISTINCT ON (event_id) *          -- дубль — та же строка с тем же event_id\n    FROM events\n    ORDER BY event_id\n), bots AS (\n    SELECT anonymous_id                      -- больше 100 клиентских событий за минские сутки\n    FROM dedup\n    WHERE origin = 'client'\n    GROUP BY anonymous_id, (event_time AT TIME ZONE 'Europe/Minsk')::date\n    HAVING COUNT(*) > 100\n)\nSELECT * FROM dedup\nWHERE anonymous_id IS NULL                   -- серверные события: устройства у них нет\n   OR anonymous_id NOT IN (SELECT anonymous_id FROM bots);\n\n-- 2. Время, прошедшее с предыдущего события на этом устройстве\nCREATE TEMP VIEW gaps AS\nSELECT anonymous_id, event_id, event_name, event_time,\n       event_time - LAG(event_time) OVER w AS gap\nFROM clean\nWHERE origin = 'client'\nWINDOW w AS (PARTITION BY anonymous_id ORDER BY event_time, event_id);\n\n-- 3. Номер сессии: накопительная сумма меток «здесь началась новая сессия»\nWITH s AS (\n    SELECT *,\n           SUM(CASE WHEN gap IS NULL OR gap > INTERVAL '30 minutes' THEN 1 ELSE 0 END)\n               OVER (PARTITION BY anonymous_id ORDER BY event_time, event_id) AS session_no\n    FROM gaps\n)\nSELECT anonymous_id AS device,\n       to_char(event_time AT TIME ZONE 'Europe/Minsk', 'DD.MM HH24:MI:SS') AS minsk,\n       event_name, gap, session_no\nFROM s\nWHERE anonymous_id IN ('d_f6f77955', 'd_398d33df')       -- телефон и ноутбук героя\n  AND event_time >= TIMESTAMPTZ '2026-05-12 00:00+03'\nORDER BY event_time, event_id;\n\n-- 4. Весь журнал: сессий при пороге 30 и 5 минут\nSELECT COUNT(DISTINCT anonymous_id) AS devices,\n       COUNT(*) FILTER (WHERE gap IS NULL OR gap > INTERVAL '30 minutes') AS sessions_30,\n       COUNT(*) FILTER (WHERE gap IS NULL OR gap > INTERVAL '5 minutes')  AS sessions_5\nFROM gaps;", "out": "   device   |     minsk      |   event_name   |       gap       | session_no \n------------+----------------+----------------+-----------------+------------\n d_f6f77955 | 12.05 08:05:12 | app_open       | 8 days 19:24:07 |          3\n d_f6f77955 | 12.05 08:05:50 | product_view   | 00:00:38        |          3\n d_f6f77955 | 12.05 08:06:40 | product_view   | 00:00:50        |          3\n d_f6f77955 | 12.05 08:08:15 | product_view   | 00:01:35        |          3\n d_f6f77955 | 12.05 08:09:02 | add_to_cart    | 00:00:47        |          3\n d_f6f77955 | 12.05 08:10:30 | product_view   | 00:01:28        |          3\n d_f6f77955 | 12.05 08:23:41 | product_view   | 00:13:11        |          3\n d_f6f77955 | 12.05 08:24:20 | add_to_cart    | 00:00:39        |          3\n d_f6f77955 | 12.05 19:40:05 | app_open       | 11:15:45        |          4\n d_f6f77955 | 12.05 19:40:40 | product_view   | 00:00:35        |          4\n d_f6f77955 | 12.05 19:41:30 | checkout_start | 00:00:50        |          4\n d_f6f77955 | 12.05 19:42:47 | purchase       | 00:01:17        |          4\n d_398d33df | 13.05 12:31:10 | app_open       | NULL            |          1\n d_398d33df | 13.05 12:32:00 | product_view   | 00:00:50        |          1\n d_398d33df | 13.05 12:33:20 | add_to_cart    | 00:01:20        |          1\n d_398d33df | 15.05 20:10:05 | app_open       | 2 days 07:36:45 |          2\n d_398d33df | 15.05 20:10:40 | login          | 00:00:35        |          2\n d_398d33df | 15.05 20:11:15 | checkout_start | 00:00:35        |          2\n d_398d33df | 15.05 20:12:32 | purchase       | 00:01:17        |          2\n(19 rows)\n\n devices | sessions_30 | sessions_5 \n---------+-------------+------------\n   10619 |       57267 |      66895\n(1 row)"}, "pandas": {"code": "import pandas as pd\n\nev = pd.read_parquet(\"data/events/events.parquet\")  # сырой журнал, время в UTC\n\n# 1. Одна строка на event_id. Исключаем устройства ботов по числу событий за минские сутки.\nev = ev.drop_duplicates(\"event_id\")\nev[\"day\"] = ev[\"event_time\"].dt.tz_convert(\"Europe/Minsk\").dt.date\nclient = ev[ev[\"origin\"] == \"client\"]\nper_day = client.groupby([\"anonymous_id\", \"day\"]).size()\nbots = per_day[per_day > 100].index.get_level_values(\"anonymous_id\").unique()\nev = ev[~ev[\"anonymous_id\"].isin(bots)]\nprint(\"строк:\", len(ev), \"| ботов:\", len(bots))\n\n# 2. Сессии: пауза длиннее порога на том же устройстве начинает новую\ndef sessionize(ev, minutes):\n    c = (ev[ev[\"origin\"] == \"client\"]\n         .sort_values([\"anonymous_id\", \"event_time\", \"event_id\"]))\n    gap = c.groupby(\"anonymous_id\")[\"event_time\"].diff()          # как LAG\n    is_new = gap.isna() | (gap > pd.Timedelta(minutes=minutes))\n    session_no = is_new.groupby(c[\"anonymous_id\"]).cumsum()      # как SUM() OVER\n    return c.assign(gap=gap, is_new=is_new, session_no=session_no)\n\nfor m in (30, 5):\n    s = sessionize(ev, m)\n    print(f\"порог {m:>2} мин: устройств {s['anonymous_id'].nunique()}, \"\n          f\"сессий {s['is_new'].sum()}\")\n\nhero = sessionize(ev, 30).query(\"anonymous_id in ['d_f6f77955', 'd_398d33df']\")\nhero = hero[hero[\"event_time\"] >= \"2026-05-12 00:00+03:00\"]\nminsk = hero[\"event_time\"].dt.tz_convert(\"Europe/Minsk\").dt.strftime(\"%d.%m %H:%M\")\nprint(hero.assign(minsk=minsk)\n          .groupby([\"anonymous_id\", \"session_no\"])\n          .agg(start=(\"minsk\", \"first\"), events=(\"event_id\", \"size\")))", "out": "строк: 303162 | ботов: 6\nпорог 30 мин: устройств 10619, сессий 57267\nпорог  5 мин: устройств 10619, сессий 66895\n                               start  events\nanonymous_id session_no                     \nd_398d33df   1           13.05 12:31       3\n             2           15.05 20:10       4\nd_f6f77955   3           12.05 08:05       8\n             4           12.05 19:40       4"}, "userday": {"code": "# продолжение: ev — очищенный слой, sessionize — из блока выше\n# 3. Склейка: каждому устройству — аккаунт, который на нём входил\ndev_user = (ev.dropna(subset=[\"anonymous_id\", \"user_id\"])\n              .groupby(\"anonymous_id\")[\"user_id\"].first())\nev[\"person\"] = (ev[\"user_id\"]\n                .fillna(ev[\"anonymous_id\"].map(dev_user))\n                .fillna(ev[\"anonymous_id\"]))           # без входа используем идентификатор устройства\nprint(\"людей:\", ev[\"person\"].nunique())\n\n# 4. Витрина «пользователь — день»: одна строка на человека и минский день\ns = sessionize(ev, 30)\npaid = ev[ev[\"event_name\"] == \"order_paid\"]                # заказы — только с сервера\nuser_day = (\n    ev.groupby([\"person\", \"day\"]).size().rename(\"events\").to_frame()\n      .join(s[s[\"is_new\"]].groupby([\"person\", \"day\"]).size().rename(\"sessions\"))\n      .join(paid.groupby([\"person\", \"day\"])\n                .agg(orders=(\"order_id\", \"size\"), revenue=(\"revenue\", \"sum\")))\n      .fillna(0).astype(int)\n      .reset_index()\n)\ndays = user_day[\"day\"].astype(str)\nuser_day = user_day[(days >= \"2026-01-05\") & (days <= \"2026-06-28\")]  # полные дни\nprint(user_day.shape)\nprint(user_day.head(3))\nprint(user_day[user_day[\"person\"] == \"u_06883\"])\n\n# В дневной витрине у каждого активного пользователя одна строка\ndau = user_day.groupby(\"day\").size()\nprint(\"DAU в мае:\", round(dau[dau.index.astype(str).str[:7] == \"2026-05\"].mean(), 1))", "out": "людей: 10413\n(45250, 6)\n       person         day  events  sessions  orders  revenue\n0  d_00044e27  2026-04-27       5         1       0        0\n1  d_00044e27  2026-05-07       8         2       0        0\n2  d_00044e27  2026-05-08       6         1       0        0\n        person         day  events  sessions  orders  revenue\n45252  u_06883  2026-04-20       4         1       0        0\n45253  u_06883  2026-05-03       2         1       0        0\n45254  u_06883  2026-05-12      13         2       1     4600\n45255  u_06883  2026-05-13       3         1       0        0\n45256  u_06883  2026-05-15       5         1       1     1900\nDAU в мае: 339.3"}};
  /*data:end*/

  const PHONE = 'd_f6f77955', LAPTOP = 'd_398d33df';
  const H = HERO.map((r, i) => ({ i, t: r[0], id: r[1], name: r[2], origin: r[3], anon: r[4], uid: r[5], plat: r[6], pr: r[7] }));
  const two = n => String(n).padStart(2, '0');
  const hms = t => { const s = ((t % 86400) + 86400) % 86400; return `${two(Math.floor(s / 3600))}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}`; };
  const hm = t => hms(t).slice(0, 5);
  const dayOf = t => Math.floor(t / 86400);
  const DAYS = { 0: 'вт, 12 мая', 1: 'ср, 13 мая', 2: 'чт, 14 мая', 3: 'пт, 15 мая' };
  const rub = v => `${Number(v).toLocaleString('ru-RU')} ₽`;
  // пауза как в psql: м:сс, ч:мм:сс, больше суток — дни и часы
  const gapTxt = s => s < 3600 ? `${Math.floor(s / 60)}:${two(s % 60)}` : s < 86400 ? `${Math.floor(s / 3600)}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}` : `${Math.floor(s / 86400)} д ${Math.floor(s / 3600) % 24} ч`;
  const thTxt = m => m < 60 ? `${m} мин` : `${m / 60} ч`;
  const pct = (a, b) => `${Math.round(100 * a / b)}%`;
  const propTxt = e => {
    const p = e.pr || {};
    if (e.name === 'product_view' || e.name === 'add_to_cart') return `${p.product_id} · ${p.category} · ${rub(p.price)}`;
    if (e.name === 'app_open') return `источник: ${p.traffic_source}`;
    if (e.name === 'checkout_start') return `корзина ${rub(p.revenue)}`;
    if (e.name === 'order_paid' || e.name === 'purchase') return `${p.order_id} · ${rub(p.revenue)}`;
    if (e.name === 'login') return 'вход в аккаунт';
    return '';
  };
  // пауза от предыдущего клиентского события того же устройства (в окне 12–15 мая)
  const PREV = {};
  { const last = {}; H.forEach(e => { if (e.origin !== 'client') return; PREV[e.i] = last[e.anon] == null ? null : e.t - last[e.anon]; last[e.anon] = e.t; }); }

  /* Правило интерактива и сверки (то же в gen_page.py на pandas и SQL):
     сессия — по устройству, новая при паузе больше порога; order_paid (сервер, без устройства) относим к последней сессии
     того же человека, начатой не позже оплаты; без склейки человек = user_id строки, а если он пуст — anonymous_id. */
  function calc(th, stitch) {
    const d2u = {};
    H.forEach(e => { if (e.anon && e.uid && !d2u[e.anon]) d2u[e.anon] = e.uid; });
    const who = e => e.uid || (stitch && d2u[e.anon]) || e.anon;
    const sessions = [], rowSess = {}, last = {}, cur = {};
    H.forEach(e => {
      if (e.origin !== 'client') return;
      const g = last[e.anon] == null ? null : e.t - last[e.anon];
      if (g === null || g > th * 60) { cur[e.anon] = { dev: e.anon, start: e.t, end: e.t, rows: [], ids: new Set(), order: null }; sessions.push(cur[e.anon]); }
      const s = cur[e.anon]; s.rows.push(e.i); s.ids.add(who(e)); s.end = e.t; rowSess[e.i] = s; last[e.anon] = e.t;
    });
    let withOrder = 0;
    H.forEach(e => {
      if (e.name !== 'order_paid') return;
      let best = null;
      sessions.forEach(s => { if (s.start <= e.t && s.ids.has(who(e)) && (!best || s.start > best.start)) best = s; });
      if (!best) return;
      if (!best.order) withOrder++;
      best.order = best.order || e; best.rows.push(e.i); rowSess[e.i] = best;
    });
    sessions.forEach((s, n) => { s.n = n + 1; s.rows.sort((a, b) => H[a].t - H[b].t || a - b); });
    const users = new Set(H.map(who)), buyers = new Set(H.filter(e => e.name === 'order_paid').map(who));
    return { sessions, rowSess, withOrder, users, buyers, who, d2u };
  }

  /* ===================== Сцена: строки падают в журнал ===================== */
  const STEP_ROWS = [[0], [1, 2, 3, 4, 5], [6, 7], [8, 9, 10], [11, 12], [], [13, 14, 15], [], [16, 17], [], [18, 19, 20], []];
  const SKEY = i => i <= 7 ? 'A' : i <= 12 ? 'B' : i <= 15 ? 'C' : 'D';
  const FOLDS = { 3: [['A', 0.1]], 6: [['B', 0.1]], 7: [['C', 0.15]], 11: [['D', 0.12]] };
  const GAPS = { 2: [6, 'пауза 13 мин 11 с — меньше 30 мин: сессия та же'], 3: [8, 'пауза 11 ч 15 мин — больше 30 мин: новая сессия'], 5: ['A2', 'пауза 13 мин 11 с — больше 5 мин: сессия рвётся'] };
  const CALLS = {
    0: [0, 'кто, что, когда: 05:05 UTC = 08:05 по Минску'], 1: [4, 'свойства: товар, категория, цена'],
    4: [11, 'сервер: деньги пришли, устройства нет'], 6: [13, 'новое устройство, user_id пуст'],
    7: ['C', 'второй «пользователь»: корзина без покупки'], 8: [17, 'login: с этой строки есть user_id'],
    9: ['C', 'склеено: визит 13 мая — u_06883'], 10: [19, 'второй заказ — снова с сервера'], 11: ['D', '21 строка → 4 сессии → 1 человек']
  };
  const BAR = {
    A: { r: [0, 7], extra: '2 корзины' }, A1: { r: [0, 5], extra: '1 корзина' }, A2: { r: [6, 7], extra: '1 корзина' },
    B: { r: [8, 12], extra: `заказ ${rub(4600)}` }, C: { r: [13, 15], extra: '1 корзина' }, D: { r: [16, 20], extra: `вход, заказ ${rub(1900)}` }
  };
  const DEVN = { [PHONE]: ['телефон', 'тел', 'ph'], [LAPTOP]: ['ноутбук', 'ноут', 'lp'] };

  function sceneState(k, p) {
    const vis = new Set(), folded = new Set();
    for (let s = 0; s <= k; s++) {
      const R = STEP_ROWS[s], n = R.length;
      R.forEach((i, j) => { if (s < k || p >= 0.06 + 0.72 * j / n) vis.add(i); });
      (FOLDS[s] || []).forEach(([key, at]) => { if (s < k || p >= at) folded.add(key); });
    }
    const split = k === 5 && p >= 0.3;
    const stitched = k > 9 || (k === 9 && p >= 0.35);
    const latest = STEP_ROWS[k].filter(i => vis.has(i)).slice(-1)[0];
    const key = i => (split && i <= 7) ? (i <= 5 ? 'A1' : 'A2') : SKEY(i);
    const who = e => e.uid || (stitched && e.anon === LAPTOP ? 'u_06883' : e.anon);
    const rows = [...vis].sort((a, b) => a - b);
    const sess = new Set(rows.filter(i => H[i].origin === 'client').map(key));
    const people = new Set(rows.map(i => who(H[i])));
    return { k, p, vis, rows, folded, split, stitched, latest, key, who, nSess: sess.size, nPeople: people.size,
      call: CALLS[k] && p >= 0.5 ? CALLS[k] : null, gap: GAPS[k] && p >= 0.3 ? GAPS[k] : null };
  }

  const scene = {
    parts: [{ n: '01', name: 'Событие', s: [0, 1] }, { n: '02', name: 'Сессия', s: [2, 3] }, { n: '03', name: 'Оплата', s: [4, 5] },
      { n: '04', name: 'Второе устройство', s: [6, 7] }, { n: '05', name: 'Склейка', s: [8, 9] }, { n: '06', name: 'Итог', s: [10, 11] }],
    steps: [
      { title: "Первое событие", dur: 3000, body: `<p>12 мая в 08:05 по Минску покупатель открыл приложение по уведомлению. В журнале появилось событие <b>app_open</b>. Оно содержит идентификаторы телефона d_f6f77955 и аккаунта u_06883.</p><p>В исходной записи время указано в UTC, 05:05. В анимации часы показывают минское время.</p>` },
      { title: "Четыре просмотра и добавление в корзину", dur: 3400, body: `<p>За пять минут покупатель открыл четыре карточки и добавил товар в корзину. Каждому действию соответствует отдельная запись. В свойствах указаны товар, категория и цена.</p><p>Паузы между действиями короче двух минут. Все они входят в одну сессию.</p>` },
      { title: "Пауза в 13 минут", dur: 3000, body: `<p>После 08:10 покупатель сделал перерыв, затем открыл ещё одну карточку и добавил товар в корзину.</p><p>Пауза в 13 минут короче выбранного порога в 30 минут. В утренней сессии теперь восемь записей.</p>` },
      { title: "Вечерний визит", dur: 3200, body: `<p>Утром оплаты не было. В 19:40 покупатель снова открыл приложение по уведомлению. После последнего утреннего действия прошло больше 11 часов.</p><p>При пороге в 30 минут вечернее посещение начинает вторую сессию.</p>` },
      { title: "Две записи об одном заказе", dur: 3400, body: `<p>Покупатель оплатил заказ на 4 600 ₽. Магазин зарегистрировал <b>order_paid</b>. Через две секунды телефон отправил <b>purchase</b> при показе экрана благодарности.</p><p>У обеих записей один заказ. У серверной записи есть идентификатор аккаунта, а идентификатор устройства отсутствует.</p>` },
      { title: "Что изменится при пороге в пять минут", dur: 3200, body: `<p>Вернёмся к паузе в 13 минут. При новом пороге следующее утреннее действие начинает ещё одну сессию.</p><p>За 12 мая получаются две сессии утром и одна вечером. Набор событий остался прежним.</p>` },
      { title: "Посещение с нового устройства", dur: 3200, body: `<p>13 мая покупатель открыл сайт на ноутбуке, посмотрел карточку и добавил товар в корзину.</p><p>На ноутбуке он пока не входил в аккаунт. В записях указан новый anonymous_id, связать его с телефоном пока нельзя.</p>` },
      { title: "Почему в отчёте два пользователя", dur: 3000, body: `<p>За 12–13 мая отчёт различает аккаунт с телефона и анонимный браузер на ноутбуке. Заказ есть у одного из двух, поэтому доля покупателей составляет 50%.</p><p>Мы знаем по условию примера, что это один человек. В журнале свидетельство связи появится позже.</p>` },
      { title: "Вход в аккаунт на ноутбуке", dur: 3000, body: `<p>Вечером 15 мая покупатель снова открыл сайт и вошёл в аккаунт. Начиная с события <b>login</b>, в строках ноутбука указан user_id.</p><p>У событий 13 мая и у открытия сайта перед входом это поле по-прежнему пусто.</p>` },
      { title: "Связь с более ранними событиями", dur: 3200, body: `<p>После входа известно, что с этого ноутбука использовали аккаунт u_06883. По правилу урока к нему относятся и более ранние записи устройства, в том числе визит 13 мая.</p><p>Теперь в отчёте за весь период один пользователь.</p>` },
      { title: "Второй оплаченный заказ", dur: 3200, body: `<p>Покупатель оплатил 1 900 ₽ за товар, который добавил в корзину 13 мая. Сервер подтвердил оплату событием order_paid. Когда на ноутбуке открылся экран благодарности, сайт отправил purchase.</p>` },
      { title: "Итог за четыре дня", dur: 4200, next: 'Читать страницу', body: `<p>В журнале 21 запись: 19 клиентских событий и две серверные оплаты. При пороге в 30 минут на двух устройствах получились четыре сессии.</p><p>После склейки обе покупки относятся к одному пользователю. Сумма двух заказов равна 6 500 ₽.</p>` }
    ],
    hud: [{ id: 'rows', label: 'Строки' }, { id: 'sess', label: 'Сессии' }, { id: 'ppl', label: 'Пользователи' }],
    legend: '<span><i class="sq" style="background:#6fa2ea"></i>телефон</span><span><i class="sq" style="background:#f0a247"></i>ноутбук</span><span><i class="sq" style="background:#a48af0"></i>сервер</span><span><i class="sq" style="background:#e3c04d"></i>связано с аккаунтом</span>',
    info: 'ЖУРНАЛ СОБЫТИЙ',
    aiNote: 'В анимации — 21 строка журнала одного человека (u_06883) за 12–15 мая по Минску. Телефон d_f6f77955 (Android): утром 12 мая пять карточек и две корзины с паузой 13 минут, вечером оплата 4 600 ₽ (order_paid с сервера, purchase с клиента). Ноутбук d_398d33df (сайт): 13 мая анонимно карточка и корзина, 15 мая вход, склейка задним числом и заказ на 1 900 ₽. По порогу 30 минут — 4 сессии, после склейки — 1 человек.',
    mount(root, api) {
      const { esc } = api;
      let sig = '';
      const devCell = e => e.origin === 'server' ? '<i class="evs-w">NULL · сервер</i><i class="evs-n">сервер</i>' : `<i class="evs-w">${e.anon}</i><i class="evs-n">${DEVN[e.anon][1]}</i>`;
      const rowHtml = (e, S) => {
        const u = S.who(e), st = !e.uid && u !== e.anon;
        const cls = e.origin === 'server' ? 'sv' : DEVN[e.anon][2];
        return `<div class="evs-row ${cls}${e.i === S.latest ? ' fresh' : ''}"><span class="c-t">${hms(e.t)}</span><span class="c-e">${e.name}</span><span class="c-d">${devCell(e)}</span><span class="c-u${e.uid ? '' : st ? ' st' : ' nul'}">${e.uid || (st ? u : 'NULL')}</span><span class="c-p">${esc(propTxt(e))}</span></div>`;
      };
      return {
        render(k, p) {
          const S = sceneState(k, p);
          api.hud('rows', String(S.rows.length));
          api.hud('sess', String(S.nSess), S.split ? 'при 5 мин' : '');
          api.hud('ppl', String(S.nPeople), k === 9 && S.stitched ? 'склейка' : '');
          const key = JSON.stringify([S.rows, [...S.folded], S.split, S.stitched, S.latest, S.call, S.gap]);
          if (key === sig) return; sig = key;
          // элементы журнала по порядку: строки или свёрнутые сессии
          const items = [], seen = new Set();
          S.rows.forEach(i => {
            const sk = S.key(i), base = SKEY(i);
            if (S.folded.has(base)) { if (!seen.has(sk)) { seen.add(sk); items.push({ bar: sk, t: H[BAR[sk].r[0]].t }); } }
            else items.push({ row: i, t: H[i].t });
          });
          const order = [...new Set(S.rows.filter(i => H[i].origin === 'client').map(S.key))];
          const lines = []; let lastDay = null;
          items.forEach(it => {
            const d = dayOf(it.t);
            if (d !== lastDay) { lines.push(`<div class="evs-day">${DAYS[d]}</div>`); lastDay = d; }
            const tgt = it.bar || it.row;
            if (S.gap && S.gap[0] === tgt) lines.push(`<div class="evs-gap">⋯ ${S.gap[1]}</div>`);
            if (it.bar) {
              const b = BAR[it.bar], e0 = H[b.r[0]], e1 = H[b.r[1]], n = b.r[1] - b.r[0] + 1;
              const dn = DEVN[e0.anon], st = it.bar === 'C' && S.stitched;
              lines.push(`<div class="evs-bar ${dn[2]}${st ? ' st' : ''}"><b>Сессия ${order.indexOf(it.bar) + 1}</b><span>${dn[0]} · ${hm(e0.t)}–${hm(e1.t)}</span><span>${n} ${api.plural(n, ['строка', 'строки', 'строк'])}</span><span class="x">${st ? 'u_06883' : it.bar === 'C' ? 'аноним' : ''}${it.bar === 'C' ? ' · ' : ''}${b.extra}</span></div>`);
            } else lines.push(rowHtml(H[it.row], S));
            if (S.call && S.call[0] === tgt) lines.push(`<div class="evs-call">↑ ${esc(S.call[1])}</div>`);
          });
          // люди: кто есть в видимых строках
          const P = new Map();
          S.rows.forEach(i => { const e = H[i], u = S.who(e); if (!P.has(u)) P.set(u, new Set()); if (e.anon) P.get(u).add(DEVN[e.anon][0]); });
          let chips = [...P].map(([u, devs]) => `<span class="evs-chip${u.startsWith('d_') ? ' an' : ''}"><b>${u}</b>${[...devs].join(' + ') || 'сервер'}${u.startsWith('d_') ? ' · аноним' : ''}</span>`).join('');
          if (k === 9 && S.stitched) chips += '<span class="evs-chip gone"><b>d_398d33df</b>→ u_06883</span>';
          root.innerHTML = `<div class="evs"><div class="evs-people"><span class="lb">Пользователи</span>${chips}</div>
<div class="evs-log"><div class="evs-row evs-hd"><span class="c-t">Минск</span><span class="c-e">event_name</span><span class="c-d"><i class="evs-w">anonymous_id</i><i class="evs-n">устр.</i></span><span class="c-u">user_id</span><span class="c-p">свойства</span></div>${lines.join('')}</div></div>`;
        }
      };
    }
  };

  /* ===================== Интерактив «Как меняются границы сессий» ===================== */
  function buildSessions(box, api) {
    const { $, plural } = api;
    const DEF = STOPS.indexOf(30);
    box.innerHTML = `<div class="block-hd"><span class="t">Как меняются границы сессий <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="ss-reset">Сбросить</button></div></div>
<p class="hint ss-do">Измените порог и посмотрите, после какой паузы начинается новая сессия. Длительность паузы указана слева от времени. Затем включите склейку и проверьте, к какому пользователю теперь относятся посещения с ноутбука.</p>
<div class="ss-ctl"><label class="ss-th" for="ss-range"><span>Порог неактивности</span><input type="range" id="ss-range" min="0" max="${STOPS.length - 1}" step="1" value="${DEF}"><b id="ss-thv"></b></label>
<label class="chk ss-chk"><input type="checkbox" id="ss-stitch"> Склеить по&nbsp;аккаунту</label></div>
<div class="ss-read"><div><b id="ss-s"></b><span id="ss-sl"></span></div><div><b id="ss-u"></b><span id="ss-ul"></span></div><div><b id="ss-cs"></b><span id="ss-csl"></span></div><div><b id="ss-cu"></b><span id="ss-cul"></span></div></div>
<div class="ss-feed"><div class="ss-lane" id="ss-ph"></div><div class="ss-lane" id="ss-lp"></div></div>
<div class="status"><span><span class="dot live"></span><span id="ss-st"></span></span><span class="grow"></span><span id="ss-ok"></span></div>`;
    const rng = $('ss-range'), chk = $('ss-stitch');
    let idx = DEF, stitch = false;
    const timers = {};
    const setVal = (id, v) => { const el = $(id); if (el.textContent !== v) { if (el.textContent) { el.classList.remove('ss-chg'); void el.offsetWidth; el.classList.add('ss-chg'); clearTimeout(timers[id]); timers[id] = setTimeout(() => el.classList.remove('ss-chg'), 700); } el.textContent = v; } };
    function lane(dev, r) {
      const sess = r.sessions.filter(s => s.dev === dev), dn = dev === PHONE ? ['Телефон · Android', 'ph'] : ['Ноутбук · сайт', 'lp'];
      let lastDay = null;
      const body = sess.map(s => {
        const d = dayOf(s.start), day = d !== lastDay ? `<div class="ss-day">${DAYS[d]}</div>` : ''; lastDay = d;
        const n = s.rows.length;
        const rows = s.rows.map(i => {
          const e = H[i], u = r.who(e), st = !e.uid && u !== e.anon, an = !e.uid && !st;
          const g = e.origin === 'server' ? 'сервер' : PREV[i] == null ? '—' : `+${gapTxt(PREV[i])}`;
          const cut = e.origin === 'client' && i === s.rows.find(j => H[j].origin === 'client') && PREV[i] != null;
          return `<div class="ss-row${e.origin === 'server' ? ' srv' : ''}${cut ? ' cut' : ''}"><span class="g">${g}${cut ? '<i class="ss-cut"> ✂</i>' : ''}</span><span class="tm">${hms(e.t)}</span><span class="ev">${e.name}</span><span class="who${st ? ' st' : an ? ' an' : ''}">${u}</span></div>`;
        }).join('');
        return `${day}<div class="ss-sess${s.order ? ' buy' : ''}"><div class="ss-sh"><b>Сессия ${s.n}</b><span>${hm(s.start)}–${hm(H[s.rows[s.rows.length - 1]].t)} · ${n} ${plural(n, ['событие', 'события', 'событий'])}</span>${s.order ? `<em>заказ ${rub(s.order.pr.revenue)}</em>` : ''}</div>${rows}</div>`;
      }).join('');
      return `<div class="ss-lh ${dn[1]}"><b>${dn[0]}</b><span>anonymous_id ${dev}</span></div>${body}`;
    }
    function draw() {
      const th = STOPS[idx], r = calc(th, stitch), n = r.sessions.length, u = r.users.size, b = r.buyers.size;
      $('ss-thv').textContent = thTxt(th); rng.setAttribute('aria-valuetext', thTxt(th).replace(' ', ' '));
      setVal('ss-s', String(n)); $('ss-sl').textContent = plural(n, ['сессия', 'сессии', 'сессий']);
      setVal('ss-u', String(u)); $('ss-ul').textContent = `${plural(u, ['пользователь', 'пользователя', 'пользователей'])}: ${[...r.users].join(', ')}`;
      setVal('ss-cs', pct(r.withOrder, n)); $('ss-csl').textContent = `сессий с заказом: ${r.withOrder} из ${n}`;
      setVal('ss-cu', pct(b, u)); $('ss-cul').textContent = `пользователей с заказом: ${b} из ${u}`;
      $('ss-ph').innerHTML = lane(PHONE, r); $('ss-lp').innerHTML = lane(LAPTOP, r);
      $('ss-st').textContent = `Порог ${thTxt(th)} · склейка ${stitch ? 'включена' : 'выключена'} · заказы — 2 строки order_paid`;
      const want = CHECK[`${th}_${stitch ? 1 : 0}`], ok = want && JSON.stringify(want) === JSON.stringify([n, r.withOrder, u, b]);
      $('ss-ok').textContent = ok ? '✓ то же дают pandas и PostgreSQL' : '';
    }
    rng.addEventListener('input', () => { idx = +rng.value; draw(); });
    chk.addEventListener('change', () => { stitch = chk.checked; draw(); });
    $('ss-reset').addEventListener('click', () => { idx = DEF; stitch = false; rng.value = DEF; chk.checked = false; draw(); });
    draw();
    return {
      describe() {
        const th = STOPS[idx], r = calc(th, stitch), n = r.sessions.length;
        return `порог неактивности ${thTxt(th).replace(' ', ' ')}, склейка ${stitch ? 'включена' : 'выключена'}: сессий ${n}, из них с заказом ${r.withOrder} (${pct(r.withOrder, n)}); пользователей ${r.users.size} (${[...r.users].join(', ')}), с заказом ${r.buyers.size}.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-9-1',
    short: 'DA-09',
    title: 'Событийная модель: события, сессии, пользователи',
    where: 'блок «Дата аналитика», тема 09 «Продуктовые метрики и события», страница 9.1',
    aiData: 'учебный журнал событий магазина товаров для дома (316 518 строк, 5 января — 28 июня 2026, приложение и сайт) и 21 строка одного человека u_06883 за 12–15 мая: телефон, ноутбук, два заказа',
    scene,
    widgets: { sessions: buildSessions },
    calc: { run: calc, STOPS, CHECK },
    code: {
      sql: { title: 'Очищенный слой и сессии в PostgreSQL: LAG и накопительная сумма', badge: 'проверено: PostgreSQL 16', lang: 'sql',
        code: CODE_SRC.sql.code, out: CODE_SRC.sql.out, outLabel: 'Вывод psql: строки героя за 12–15 мая и счётчики журнала',
        note: 'Запуск: psql -q -P null=NULL -f sessions.sql. Ключ -q убирает служебные сообщения, -P null=NULL печатает пустое значение словом NULL. У первой строки ноутбука паузы нет: раньше это устройство событий не присылало. Номера сессий телефона начинаются с 3: две сессии были 20 апреля и 3 мая.' },
      pandas: { title: 'То же в pandas: diff внутри groupby и cumsum', badge: 'проверено: pandas 3.0.5', lang: 'python',
        code: CODE_SRC.pandas.code, out: CODE_SRC.pandas.out,
        note: 'Счётчики совпадают с SQL: 10&nbsp;619 устройств, 57&nbsp;267 сессий при 30 минутах и 66&nbsp;895 при&nbsp;5.' },
      userday: { title: 'Склейка и витрина «пользователь — день»', badge: 'проверено: pandas 3.0.5', lang: 'python',
        code: CODE_SRC.userday.code, out: CODE_SRC.userday.out, outLabel: 'Вывод: размер, начало витрины и пять строк героя',
        note: 'Сессия засчитывается дню, в который началась. В первых строках витрины — анонимное устройство: аккаунта у него нет, и человек = устройство.' }
    },
    questions: {
    q1: { sec: 'sessions', title: 'Сначала предскажите', q: "При пороге 30 минут покупатель сделал заказы в двух из четырёх сессий. Какой будет доля сессий с заказом при пороге 5 минут?",
      opts: [['Останется 50%: заказов столько же, а порог влияет только на длину сессий'], ['40%: утренняя пауза в 13 минут разрежет сессию, сессий станет 5', 1], ['67%: при коротком пороге сессий станет меньше, а заказов столько же'], ['25%: каждая из четырёх сессий разделится надвое, сессий станет 8']],
      why: "Утром 12 мая между действиями прошло 13 минут 11 секунд. При пороге в пять минут утренний визит разделится надвое. Сессий станет пять, а число сессий с заказом останется равным двум. Поэтому конверсия составит 2 / 5 = 40%." },
    q2: { sec: 'idea', q: "Почему отчёт за 12–13 мая сначала показывает двух пользователей, а после входа 15 мая за те же даты можно насчитать одного?",
      opts: [['Вход 15 мая связывает anonymous_id ноутбука с аккаунтом u_06883 и позволяет отнести к нему ранние посещения', 1], ['Сайт и приложение пишут в разные журналы, а 15 мая после входа их объединили в один'], ['13 мая ноутбук не дал ни одного заказа, а пользователей без заказа отчёт считает отдельно'], ['Заказ 15 мая сделал ноутбук покупателем, а всех покупателей склеивают по номеру заказа']],
      why: "После входа в журнале появляются и идентификатор ноутбука, и аккаунт u_06883. По правилу склейки ранние события ноутбука можно связать с тем же аккаунтом, который уже был известен по телефону." },
    q3: { sec: 'rules', q: "Два отчёта по одному магазину расходятся в оценке DAU на 15%. Какие определения нужно сравнить в первую очередь?",
      opts: [['Дубли событий: каждый повторно пришедший event_id добавляет в DAU лишнего пользователя'], ['Как каждая система выделяет пользователей, учитывает анонимные события и ботов и определяет начало дня', 1], ['Ничего: 15% — обычный статистический шум, две системы никогда не сходятся точно'], ['Какая из систем новее: старая система обычно теряет часть событий по дороге']],
      why: "Сверьте единицу подсчёта, список событий, обработку анонимных устройств, часовой пояс и фильтры. В этом журнале январское среднее равно 134 после склейки и 154 при использовании идентификатора из строки. Повтор той же записи не добавит ещё одного пользователя в тот же день." },
    q4: { sec: 'nuances', q: "Как изменится число сессий в журнале, если уменьшить порог неактивности с 30 до 5 минут?",
      opts: [['Уменьшится: короткий порог объединяет события'], ['Вырастет на 17%: паузы от 5 до 30 минут внутри захода начнут резать сессии', 1], ['Вырастет в 6 раз: порог стал в 6 раз меньше'], ['Не изменится: число заходов задают люди, а не порог']],
      why: "Паузы длиннее пяти минут и не длиннее тридцати станут новыми границами. Вместо 57 267 сессий получится 66 895, примерно на 17% больше. Для сравнения периодов нужно применить одно правило ко всем датам." },
    q5: { sec: 'idea', q: "Какие свойства позволят узнать, какой товар и по какой цене покупатель добавил в корзину?",
      opts: [['Только user_id и время в UTC: товар и платформу можно найти в базе заказов'], ['Сумма заказа и order_id: по ним потом считают выручку'], ['id устройства и аккаунта, время в UTC, товар (product_id, категория, цена), платформа и версия', 1], ['Номер товара прямо в имени события: add_to_cart_27, add_to_cart_28 и так далее']],
      why: "В плане учебного магазина для add_to_cart указаны product_id, category и price. Они описывают товар в момент события. Идентификатор события нужен отдельно, например для поиска повторной отправки." },
    q6: { sec: 'code', q: "Какое значение запрос запишет в столбец session_no для каждого события?", lang: 'sql',
      code: "SUM(CASE WHEN gap IS NULL OR gap > INTERVAL '30 minutes' THEN 1 ELSE 0 END)\n    OVER (PARTITION BY anonymous_id ORDER BY event_time, event_id) AS session_no",
      opts: [['Число событий в сессии: каждая строка добавляет к сумме единицу'], ['Номер сессии на устройстве: он растёт на единицу в каждой строке, с которой начинается новая сессия', 1], ['Общее число сессий устройства, одинаковое во всех его строках'], ['Номер сессии во всём журнале, общий для всех устройств сразу']],
      why: "Запрос суммирует метки начала сессии от первой записи устройства до текущей. Пока сессия продолжается, номер сохраняется. После паузы длиннее порога он увеличивается на единицу. На другом устройстве нумерация начинается заново." },
    q7: { sec: 'nuances', q: "Отчёт о выручке построен по событию purchase в учебном журнале. Как проверить полноту суммы?",
      opts: [['Ничего: purchase и order_paid описывают один и тот же заказ и всегда приходят парой'], ['Он занижает выручку: клиент теряет события на блокировщиках и в закрытых приложениях, а деньги считают по серверному order_paid', 1], ['Он завышает выручку: на каждый заказ purchase приходит дважды, с телефона и с сервера'], ['Он верен для сайта, где нет приложения, и ошибается только для Android и iOS']],
      why: "Сопоставьте заказы с серверными событиями order_paid. После удаления дублей purchase есть у 8 940 заказов из 9 717. Клиентские записи дают 33,8 млн ₽, а серверные — 36,9 млн ₽. Этот разрыв возможен, даже если у дошедших событий суммы верны." }
    },
    glossary: {
      eventlog: { t: 'Журнал событий', en: 'event log', d: "Таблица с записями о зарегистрированных событиях и временем их наступления." },
      event: { t: 'Событие', en: 'event', d: 'Строка журнала об одном действии: кто, что, когда и с какими подробностями.' },
      property: { t: 'Свойство события', en: 'event property', d: 'Подробность события в отдельном столбце: товар, цена, платформа.' },
      dau: { t: 'DAU', en: 'daily active users', d: 'Число разных людей, которые были активны в продукте за день.' },
      conversion: { t: 'Конверсия', en: 'conversion rate', d: 'Доля дошедших до целевого действия, например до оплаты: среди сессий или среди людей.' },
      session: { t: 'Сессия', en: 'session', d: 'Один заход в продукт: события одного устройства подряд без пауз длиннее порога.' },
      timeout: { t: 'Порог неактивности', en: 'session timeout', d: 'Пауза, после которой следующее событие начинает новую сессию; часто 30 минут.' },
      anonid: { t: 'Анонимный id', en: 'anonymous ID', d: 'Id устройства или браузера; есть и до входа, у каждого устройства свой.' },
      userid: { t: 'Id аккаунта', en: 'user ID', d: "Идентификатор учётной записи. Один аккаунт можно использовать на нескольких устройствах." },
      stitching: { t: 'Склейка', en: 'identity resolution, stitching', d: "Связывание разных идентификаторов по известному признаку. В этом уроке им служит вход с устройства в аккаунт." },
      trackingplan: { t: 'План событий', en: 'tracking plan', d: 'Таблица всех событий продукта: имя, когда и откуда приходит, какие свойства несёт.' },
      clientev: { t: 'Клиентское событие', en: 'client-side event', d: 'Событие, которое отправляет приложение или сайт с устройства; может потеряться.' },
      serverev: { t: 'Серверное событие', en: 'server-side event', d: "Запись о действии, которое зарегистрировал сервер, например об успешной оплате." },
      adblock: { t: 'Блокировщик', en: 'ad blocker', d: 'Расширение браузера, которое не пропускает запросы рекламы и аналитики.' },
      bot: { t: 'Бот', en: 'bot', d: "Программа, автоматически выполняющая действия на сайте или в приложении. Частота событий может помочь её обнаружить." },
      dup: { t: 'Дубль', en: 'duplicate event', d: 'Повторно пришедшая строка с тем же event_id: клиент отправил событие ещё раз.' },
      layers: { t: 'Слои данных', en: 'data layers', d: 'Ступени обработки: сырой журнал, очищенный слой, витрина; каждый строится запросом из предыдущего.' },
      mart: { t: 'Витрина', en: 'data mart', d: "Таблица, подготовленная для определённого набора отчётов, например с показателями пользователя за день." },
      utc: { t: 'UTC', en: 'Coordinated Universal Time', d: 'Всемирное координированное время; минское время — UTC+3.' },
      sessionization: { t: 'Сессионизация', en: 'sessionization', d: "Объединение отдельных событий устройства в сессии по выбранному правилу." }
    },
    materials: [
      ['da-9-1-event-model.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/events/', 'Учебные данные темы 09 — общий набор: журнал событий в parquet и csv.gz (316 518 строк), 6 883 аккаунта, загрузка в PostgreSQL 16, генератор'],
      ['sessions.sql', 'Очищенный слой и сессионизация из раздела «Код»'],
      ['sessions.ipynb', 'Сессии, склейка и витрина «пользователь — день» в pandas; пересчёт состояний интерактива'],
      ['hero_12_15_may.csv', 'События покупателя за 12–15 мая, использованные в интерактиве']
    ],
    prompts: [
      ['Тренажёр сессий', 'Предложи 8–10 событий одного устройства с отметками времени. Я отмечу границы сессий при пороге 30 и 5 минут, ты проверишь по правилу из источника. Пять лент по одной.'],
      ['Кто здесь пользователь', 'Дай по одной ситуации: второе устройство без входа, общий планшет семьи, очищенные cookie. Я скажу, сколько людей увидит журнал со склейкой и без, ты проверишь по источнику.'],
      ['Аудит моей метрики', 'Я опишу, как в моей компании считают DAU. Задавай вопросы по шести соглашениям из источника, пока не станет ясно, где определения расходятся. Готовый ответ не предлагай.']
    ]
  };
})();
