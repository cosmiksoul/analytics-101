/* Страница 9.4 · Метрики роста и дерево метрик */
(() => {
  // Данные и настоящий вывод кода вписывает data/gen_page.py — руками не править
  /*data:start*/const DATA = {"months":[{"m":"январь","dau":134.3,"mau":1807,"st":0.074},{"m":"февраль","dau":172.2,"mau":2377,"st":0.072},{"m":"март","dau":206.5,"mau":3057,"st":0.068},{"m":"апрель","dau":302.0,"mau":4592,"st":0.066},{"m":"май","dau":339.3,"mau":4919,"st":0.069},{"m":"июнь","dau":386.5,"mau":5239,"st":0.074}],"dauAcc":0.7,"bal":[{"w":"04.05","prev":1837,"new":351,"kept":649,"back":767,"gone":1188,"wau":1767},{"w":"11.05","prev":1767,"new":352,"kept":604,"back":810,"gone":1163,"wau":1766},{"w":"18.05","prev":1766,"new":359,"kept":639,"back":873,"gone":1127,"wau":1871},{"w":"25.05","prev":1871,"new":354,"kept":681,"back":816,"gone":1190,"wau":1851},{"w":"01.06","prev":1851,"new":377,"kept":663,"back":936,"gone":1188,"wau":1976},{"w":"08.06","prev":1976,"new":368,"kept":690,"back":962,"gone":1286,"wau":2020},{"w":"15.06","prev":2020,"new":365,"kept":744,"back":971,"gone":1276,"wau":2080},{"w":"22.06","prev":2080,"new":413,"kept":722,"back":1053,"gone":1358,"wau":2188}],"root":{"id":"R","label":"Выручка, ₽","kind":"rub","v0":2003150.0,"v1":1740490.0,"ch":-13.1,"lo":-20.5,"hi":31.1,"mn":-14.3,"mx":25.7,"out":false,"d":-262660},"mult":[{"id":"A","label":"Активные (WAU)","kind":"int","v0":1851.0,"v1":1976.0,"ch":6.8,"lo":-9.5,"hi":19.8,"mn":-3.8,"mx":23.3,"out":false,"c":[122120,135275,110102],"cmin":107059,"cmax":139120,"kids":[{"id":"new","label":"новые","kind":"int","v0":354.0,"v1":377.0,"ch":6.5,"lo":-54.3,"hi":62.5,"mn":-40.1,"mx":84.8,"out":false,"gain":-20259},{"id":"back","label":"вернувшиеся","kind":"int","v0":816.0,"v1":936.0,"ch":14.7,"lo":-11.3,"hi":23.9,"mn":-6.5,"mx":25.6,"out":false,"gain":-105698},{"id":"kept","label":"удержанные","kind":"int","v0":681.0,"v1":663.0,"ch":-2.6,"lo":-6.6,"hi":20.0,"mn":-6.9,"mx":21.2,"out":false,"gain":15855}],"gone":[1190,1188]},{"id":"C","label":"Доля платящих","kind":"sh","v0":0.2453,"v1":0.2085,"ch":-15.0,"lo":-15.0,"hi":14.9,"mn":-13.6,"mx":12.0,"out":false,"c":[-303526,-320588,-287530],"cmin":-329702,"cmax":-279583,"kids":[{"id":"C_android","label":"Android","kind":"sh","v0":0.223,"v1":0.1219,"ch":-45.4,"lo":-24.9,"hi":26.9,"mn":-16.8,"mx":19.2,"out":true,"gain":351010},{"id":"C_ios","label":"iOS","kind":"sh","v0":0.2322,"v1":0.2484,"ch":7.0,"lo":-30.9,"hi":32.4,"mn":-35.3,"mx":18.8,"out":false,"gain":-29960},{"id":"C_web","label":"сайт","kind":"sh","v0":0.2763,"v1":0.2582,"ch":-6.6,"lo":-12.2,"hi":12.2,"mn":-7.5,"mx":13.0,"out":false,"gain":60389}]},{"id":"F","label":"Заказов на платящего","kind":"r3","v0":1.1784,"v1":1.0971,"ch":-6.9,"lo":-7.7,"hi":8.4,"mn":-5.5,"mx":9.5,"out":false,"c":[-133635,-125456,-142175],"cmin":-151776,"cmax":-117519,"kids":[{"id":"F_android","label":"Android","kind":"r3","v0":1.1043,"v1":1.0761,"ch":-2.6,"lo":-8.7,"hi":8.8,"mn":-6.8,"mx":8.2,"out":false,"gain":11087},{"id":"F_ios","label":"iOS","kind":"r3","v0":1.1089,"v1":1.0932,"ch":-1.4,"lo":-6.1,"hi":6.9,"mn":-3.3,"mx":7.8,"out":false,"gain":6579},{"id":"F_web","label":"сайт","kind":"r3","v0":1.203,"v1":1.0927,"ch":-9.2,"lo":-15.9,"hi":17.1,"mn":-15.1,"mx":17.7,"out":false,"gain":86718}]},{"id":"S","label":"Средний чек, ₽","kind":"rub","v0":3744.2056,"v1":3850.6416,"ch":2.8,"lo":-15.6,"hi":15.7,"mn":-12.2,"mx":10.6,"out":false,"c":[52381,48109,56943],"cmin":45066,"cmax":60789,"kids":[{"id":"S_android","label":"Android","kind":"rub","v0":3988.1111,"v1":4272.2222,"ch":7.1,"lo":-22.3,"hi":26.1,"mn":-20.6,"mx":26.7,"out":false,"gain":-28127},{"id":"S_ios","label":"iOS","kind":"rub","v0":3649.4643,"v1":3553.2558,"ch":-2.6,"lo":-32.6,"hi":32.5,"mn":-26.6,"mx":28.0,"out":false,"gain":12411},{"id":"S_web","label":"сайт","kind":"rub","v0":3607.2016,"v1":3835.5804,"ch":6.3,"lo":-23.0,"hi":22.9,"mn":-14.6,"mx":19.0,"out":false,"gain":-51157}]}],"plat":[{"id":"R_android","label":"Android","kind":"rub","v0":717860.0,"v1":422950.0,"ch":-41.1,"lo":-35.4,"hi":54.3,"mn":-28.5,"mx":42.4,"out":true,"gain":294910},{"id":"R_ios","label":"iOS","kind":"rub","v0":408740.0,"v1":458370.0,"ch":12.1,"lo":-41.2,"hi":51.5,"mn":-28.3,"mx":55.0,"out":false,"gain":-49630},{"id":"R_web","label":"сайт","kind":"rub","v0":876550.0,"v1":859170.0,"ch":-2.0,"lo":-24.0,"hi":33.2,"mn":-12.5,"mx":29.4,"out":false,"gain":17380}],"found":"C_android","pay":{"P":[454,412],"O":[535,452]},"fails":{"android":[[10,180],[142,99]],"ios":[[5,112],[13,129]],"web":[[12,243],[13,224]]},"failJun2":52,"pv":{"raw":[10527,11153],"clean":[10368,10345]},"orders":[535,452],"acc":[5883,6114],"mm":{"w0":{"check_mean":3744,"check_med":2920.0,"opp_mean":1.178,"opp_med":1.0},"w1":{"check_mean":3851,"check_med":2885.0,"opp_mean":1.097,"opp_med":1.0}}};
  const OUT = {"decompose": "                     25–31 мая 1–7 июня  изм, %     лог  подст →  подст ←\nактивные                  1851     1976     6.8  122120   135275   110102\nдоля платящих           0.2453   0.2085   -15.0 -303526  -320588  -287530\nзаказов на платящего     1.178    1.097    -6.9 -133635  -125456  -142175\nсредний чек               3744     3851     2.8   52381    48109    56943\nвыручка: 2003150 → 1740490 | суммы вкладов: -262660 -262660 -262660\n         25–31 мая  1–7 июня\nandroid      0.223     0.122\nios          0.232     0.248\nweb          0.276     0.258\nесли вернуть долю платящих в Android: 2091500 ₽", "dau": "SELECT 45250\n   month    |  dau  | mau  | stickiness \n------------+-------+------+------------\n 2026-01-01 | 134.3 | 1807 |      0.074\n 2026-02-01 | 172.3 | 2377 |      0.072\n 2026-03-01 | 206.5 | 3057 |      0.068\n 2026-04-01 | 302.0 | 4592 |      0.066\n 2026-05-01 | 339.3 | 4919 |      0.069\n 2026-06-01 | 386.5 | 5239 |      0.074\n(6 rows)", "balance": "    week    | prev_wau | new | retained | returned | churned | wau  \n------------+----------+-----+----------+----------+---------+------\n 2026-05-04 |     1837 | 351 |      649 |      767 |    1188 | 1767\n 2026-05-11 |     1767 | 352 |      604 |      810 |    1163 | 1766\n 2026-05-18 |     1766 | 359 |      639 |      873 |    1127 | 1871\n 2026-05-25 |     1871 | 354 |      681 |      816 |    1190 | 1851\n 2026-06-01 |     1851 | 377 |      663 |      936 |    1188 | 1976\n 2026-06-08 |     1976 | 368 |      690 |      962 |    1286 | 2020\n 2026-06-15 |     2020 | 365 |      744 |      971 |    1276 | 2080\n 2026-06-22 |     2080 | 413 |      722 |     1053 |    1358 | 2188\n(8 rows)", "decompose_src": "import numpy as np\nimport pandas as pd\n\n# Один человек может использовать несколько устройств. Несвязанные устройства считаем по отдельности.\ne = pd.read_parquet(\"data/events/events.parquet\").drop_duplicates(\"event_id\")\ne[\"day\"] = e.event_time.dt.tz_convert(\"Europe/Minsk\").dt.tz_localize(None).dt.normalize()\nper_day = e[e.origin == \"client\"].groupby([\"anonymous_id\", \"day\"]).size()\nbots = per_day[per_day > 100].index.get_level_values(0).unique()\ne = e[~e.anonymous_id.isin(bots) & e.day.between(\"2026-01-05\", \"2026-06-28\")]\ndev = e.dropna(subset=[\"anonymous_id\", \"user_id\"]).groupby(\"anonymous_id\").user_id.first()\ne[\"person\"] = e.user_id.fillna(e.anonymous_id.map(dev)).fillna(e.anonymous_id)\ne[\"week\"] = e.day.dt.to_period(\"W\").dt.start_time            # неделя с понедельника\n\n\ndef factors(week, platform=None):\n    \"\"\"Выручка недели = активные × доля платящих × заказов на платящего × средний чек.\"\"\"\n    x = e[(e.week == week) & ((e.platform == platform) if platform else True)]\n    paid = x[x.event_name == \"order_paid\"]                     # только серверная оплата\n    active, payers = x.person.nunique(), paid.person.nunique()\n    orders, revenue = paid.order_id.nunique(), paid.revenue.sum()\n    return pd.Series({\"активные\": active, \"доля платящих\": payers / active,\n                      \"заказов на платящего\": orders / payers, \"средний чек\": revenue / orders})\n\n\ndef log_split(x0, x1):\n    \"\"\"Вклад множителя = L · ln(x1 / x0), где L — логарифмическое среднее двух выручек.\"\"\"\n    if (x0 <= 0).any() or (x1 <= 0).any():\n        raise ValueError(\"Для логарифмической декомпозиции все множители должны быть положительными.\")\n    r0, r1 = x0.prod(), x1.prod()\n    if r0 == r1:\n        return r0 * np.log(x1 / x0)  # предел логарифмического среднего при равной выручке\n    return (r1 - r0) / np.log(r1 / r0) * np.log(x1 / x0)\n\n\ndef chain(x0, x1, order):\n    \"\"\"Последовательная подстановка: меняем множители по одному в заданном порядке.\"\"\"\n    cur, out = x0.copy(), {}\n    for k in order:\n        before = cur.prod()\n        cur[k] = x1[k]\n        out[k] = cur.prod() - before\n    return pd.Series(out)[x0.index]\n\n\nw0, w1 = pd.Timestamp(\"2026-05-25\"), pd.Timestamp(\"2026-06-01\")\nx0, x1 = factors(w0), factors(w1)\nc = pd.DataFrame({\"лог\": log_split(x0, x1),\n                  \"подст →\": chain(x0, x1, x0.index),          # активные первыми\n                  \"подст ←\": chain(x0, x1, x0.index[::-1])}    # средний чек первым\n                 ).round().astype(int)\nt = pd.DataFrame({\"25–31 мая\": x0.map(\"{:.4g}\".format), \"1–7 июня\": x1.map(\"{:.4g}\".format),\n                  \"изм, %\": ((x1 / x0 - 1) * 100).round(1)}).join(c)\nprint(t)\nprint(\"выручка:\", round(x0.prod()), \"→\", round(x1.prod()), \"| суммы вкладов:\", *c.sum())\n\nshare = pd.DataFrame({p: [factors(w, p)[\"доля платящих\"] for w in (w0, w1)]\n                      for p in [\"android\", \"ios\", \"web\"]}, index=[\"25–31 мая\", \"1–7 июня\"]).T\nprint(share.round(3))\na0, a1 = factors(w0, \"android\"), factors(w1, \"android\")\nback = a1.prod() * (a0[\"доля платящих\"] / a1[\"доля платящих\"] - 1)\nprint(\"если вернуть долю платящих в Android:\", round(x1.prod() + back), \"₽\")", "sql_dau": "-- 1. Таблица «человек — день» по соглашениям темы\nCREATE TEMP TABLE person_day AS\nWITH dedup AS (                            -- без дублей event_id\n  SELECT DISTINCT ON (event_id) *\n  FROM events\n  ORDER BY event_id\n), local AS (                              -- день — минский\n  SELECT *, (event_time AT TIME ZONE 'Europe/Minsk')::date AS day\n  FROM dedup\n), bots AS (                               -- больше 100 клиентских событий за сутки\n  SELECT DISTINCT anonymous_id\n  FROM local\n  WHERE origin = 'client'\n  GROUP BY anonymous_id, day\n  HAVING COUNT(*) > 100\n), device_user AS (                        -- склейка: устройство → аккаунт\n  SELECT anonymous_id, MIN(user_id) AS user_id\n  FROM local\n  WHERE anonymous_id IS NOT NULL AND user_id IS NOT NULL\n  GROUP BY anonymous_id\n)\nSELECT DISTINCT COALESCE(l.user_id, d.user_id, l.anonymous_id) AS person, l.day\nFROM local AS l\nLEFT JOIN device_user AS d ON d.anonymous_id = l.anonymous_id\nWHERE l.day BETWEEN '2026-01-05' AND '2026-06-28'      -- 29 июня по Минску неполный\n  AND NOT EXISTS (SELECT 1 FROM bots AS b WHERE b.anonymous_id = l.anonymous_id);\n\n-- 2. DAU в среднем за месяц, MAU и липкость DAU/MAU\nWITH dau AS (\n  SELECT day, COUNT(*) AS dau\n  FROM person_day\n  GROUP BY day\n), monthly AS (\n  SELECT DATE_TRUNC('month', day)::date AS month, AVG(dau) AS avg_dau\n  FROM dau\n  GROUP BY 1\n), mau AS (\n  SELECT DATE_TRUNC('month', day)::date AS month, COUNT(DISTINCT person) AS mau\n  FROM person_day\n  GROUP BY 1\n)\nSELECT month, ROUND(avg_dau, 1) AS dau, mau,\n       ROUND(avg_dau / mau, 3) AS stickiness\nFROM monthly JOIN mau USING (month)\nORDER BY month;", "sql_bal": "-- 3. WAU и баланс активных: новые, удержанные, вернувшиеся, ушедшие\nWITH pw AS (                               -- человек — неделя (с понедельника)\n  SELECT DISTINCT person, DATE_TRUNC('week', day)::date AS week\n  FROM person_day\n), flags AS (\n  SELECT person, week,\n         week = MIN(week) OVER (PARTITION BY person)\n           AND person NOT IN (SELECT user_id FROM users     -- старые аккаунты не новички\n                              WHERE signup_time < '2026-01-05 00:00+03') AS is_new,\n         LAG(week) OVER (PARTITION BY person ORDER BY week) = week - 7 AS active_last_week\n  FROM pw\n), weekly AS (\n  SELECT week, COUNT(*) AS wau,\n         COUNT(*) FILTER (WHERE is_new) AS new,\n         COUNT(*) FILTER (WHERE active_last_week) AS retained,\n         COUNT(*) FILTER (WHERE NOT is_new AND active_last_week IS NOT TRUE) AS returned\n  FROM flags\n  GROUP BY week\n), balance AS (\n  SELECT week, LAG(wau) OVER (ORDER BY week) AS prev_wau,\n         new, retained, returned,\n         LAG(wau) OVER (ORDER BY week) - retained AS churned, wau\n  FROM weekly\n)\nSELECT * FROM balance\nWHERE week >= '2026-05-04'                 -- окно уже посчитано по всем неделям\nORDER BY week;"};/*data:end*/

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => (t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
  const lerp = (a, b, t) => a + (b - a) * t;
  const X = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const NB = ' ', MINUS = '−';
  const nf = (v, d = 0) => Number(v).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/ /g, NB);
  const sg = v => (v > 0 ? '+' : v < 0 ? MINUS : '');
  const pc = (v, d = 1) => `${sg(v)}${nf(Math.abs(v), d)}%`;
  const rub = v => `${sg(v)}${nf(Math.abs(Math.round(v)))}`;
  const fv = (kind, v) => (kind === 'sh' || kind === 'r3' ? nf(v, 3) : nf(v));
  const f1 = n => (Math.round(n * 10) / 10).toString();
  const W0 = '25–31 мая', W1 = '1–7 июня';

  const ROOT = DATA.root, M = DATA.mult, [mA, mC, mF, mS] = M;
  const byId = {};
  [ROOT, ...M, ...DATA.plat].forEach(n => { byId[n.id] = n; (n.kids || []).forEach(k => { byId[k.id] = k; k.parent = n.id; }); });
  const AND = byId.C_android, IOSR = byId.R_ios;
  const B1 = DATA.bal.find(b => b.w === '01.06');
  const failA = DATA.fails.android;

  /* ===================== Сцена: дерево выручки ===================== */
  const SC = { node: '#121a2b', line: '#2a3550', ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#7c87a0', acc: '#36b8a6', red: '#f2756a', redF: '#3a1d22', amb: '#e5a63c', ambF: '#33281a', grn: '#45c48f' };
  const L1 = [[mA, ['АКТИВНЫЕ', 'WAU']], [mC, ['ДОЛЯ', 'ПЛАТЯЩИХ']], [mF, ['ЗАКАЗОВ НА', 'ПЛАТЯЩЕГО']], [mS, ['СРЕДНИЙ', 'ЧЕК, ₽']]];
  const AKL = ['НОВЫЕ', 'ВЕРНУВШИЕСЯ', 'УДЕРЖАННЫЕ'], CKL = ['ANDROID', 'iOS', 'САЙТ'];

  function sceneState(k, p) {
    const e = (a, b) => ease(seg(p, a, b));
    const s = { rootV: k === 0 ? ROOT.v0 : k === 1 ? lerp(ROOT.v0, ROOT.v1, e(.1, .55)) : ROOT.v1, rootCh: k === 0 ? 0 : k === 1 ? e(.5, .7) : 1,
      l1: k < 2 ? 0 : k === 2 ? e(.05, .5) : 1, l1ch: k < 3 ? 0 : k === 3 ? e(.1, .45) : 1, focusC: k === 3 && p > .5,
      ak: k === 4 ? e(.05, .5) : k === 5 ? 1 : k === 6 ? 1 - e(0, .3) : 0, akd: k === 5 ? e(.05, .35) : 0,
      strip: k === 5 ? e(.3, .65) : 0, ck: k === 6 ? e(.3, .75) : k > 6 ? 1 : 0,
      rLeaf: k === 7 ? e(.1, .4) : k > 7 ? 1 : 0, rE1: k === 8 ? e(.05, .3) : k > 8 ? 1 : 0, rConv: k === 8 ? e(.28, .4) : k > 8 ? 1 : 0,
      rE2: k === 8 ? e(.4, .65) : k > 8 ? 1 : 0, rRoot: k === 8 ? e(.62, .75) : k > 8 ? 1 : 0,
      contrib: k === 9 ? e(.1, .55) : k > 9 ? 1 : 0, noise: k === 10 ? e(.1, .4) : 0, call: p >= .5 ? k : -1 };
    return s;
  }
  const T = (x, y, s, o = {}) => `<text x="${f1(x)}" y="${f1(y)}"${o.a ? ` text-anchor="${o.a}"` : ''} style="font-size:${o.fs || 11}px;fill:${o.c || SC.ink}${o.w ? ';font-weight:' + o.w : ''}${o.op != null ? ';opacity:' + o.op.toFixed(2) : ''}${o.ls ? ';letter-spacing:' + o.ls : ''}"${o.halo ? ' class="mt-halo"' : ''}>${X(s)}</text>`;
  const curve = (x1, y1, x2, y2) => { const dy = (y2 - y1) * .5; return `M${f1(x1)},${f1(y1)} C${f1(x1)},${f1(y1 + dy)} ${f1(x2)},${f1(y2 - dy)} ${f1(x2)},${f1(y2)}`; };
  const edge = (d, c, w, op, t) => `<path d="${d}" pathLength="1" style="fill:none;stroke:${c};stroke-width:${w};opacity:${op.toFixed(2)}${t != null ? `;stroke-dasharray:1 1;stroke-dashoffset:${(1 - t).toFixed(3)}` : ''}"/>`;
  function box(x, y, w, h, st, op) {
    const fill = st === 'red' ? SC.redF : st === 'amb' ? SC.ambF : SC.node;
    const stroke = st === 'red' ? SC.red : st === 'amb' ? SC.amb : st === 'acc' ? SC.acc : SC.line;
    return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="9" style="fill:${fill};stroke:${stroke};stroke-width:${st ? 1.8 : 1.2};opacity:${op.toFixed(2)}"/>`;
  }
  function drawScene(W, H, st) {
    const nar = W < 520, calls = [];
    const rw = nar ? 190 : 236, rh = nar ? 56 : 62, rx = W / 2 - rw / 2, ry = 2;
    const gap = nar ? 12 : 18, w1 = (W - 3 * gap) / 4, h1 = nar ? 70 : 74, y1 = Math.round(H * .3);
    const cx1 = i => w1 / 2 + i * (w1 + gap);
    const w2 = nar ? (W - 2 * 10) / 3 : Math.min(170, (W - 60) / 3), h2 = nar ? 56 : 60, y2 = Math.round(H * .63);
    const cx2 = i => (nar ? w2 / 2 + i * (w2 + 10) : W / 2 + (i - 1) * (w2 + 30));
    const lfs = nar ? 9 : 10, vfs = nar ? 14 : 17, cfs = nar ? 10.5 : 11.5;
    let h = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Дерево метрик выручки">`;
    // рёбра от корня к множителям
    L1.forEach((n, i) => {
      if (!st.l1) return;
      const d = curve(W / 2, ry + rh, cx1(i), y1);
      h += edge(d, SC.line, 1.4, st.l1);
      if (i === 1 && st.rE2) h += edge(d, SC.red, 2.6, 1, st.rE2);
    });
    // рёбра к детям
    const kidsEdges = (pi, op, red) => [0, 1, 2].map(j => { const d = curve(cx1(pi), y1 + h1, cx2(j), y2); return edge(d, SC.line, 1.3, op) + (red && j === 0 && st.rE1 ? edge(d, SC.red, 2.6, 1, st.rE1) : ''); }).join('');
    if (st.ak) h += kidsEdges(0, st.ak, false);
    if (st.ck) h += kidsEdges(1, st.ck, true);
    // корень
    const rootSt = st.rRoot > .5 ? 'red' : '';
    h += box(rx, ry, rw, rh, rootSt, 1);
    h += T(W / 2, ry + (nar ? 13 : 16), 'ВЫРУЧКА ЗА НЕДЕЛЮ, ₽', { fs: lfs, a: 'middle', c: SC.mut, ls: '.08em' });
    h += T(W / 2, ry + (nar ? 34 : 40), nf(Math.round(st.rootV)), { fs: nar ? 17 : 21, a: 'middle', w: 600, c: st.rRoot > .5 ? SC.red : SC.ink });
    h += T(W / 2, ry + rh - (nar ? 4 : 7), st.rootCh ? `${W1} · ${pc(ROOT.ch)}` : W0, { fs: cfs, a: 'middle', c: SC.ink2 });
    // множители
    if (st.l1) L1.forEach(([n, lab], i) => {
      const x = cx1(i) - w1 / 2, isC = i === 1;
      const s = isC && st.rConv > .5 ? 'red' : isC && st.focusC && !st.ak && !st.ck ? 'acc' : '';
      h += `<g style="opacity:${st.l1.toFixed(2)}">${box(x, y1, w1, h1, s, 1)}`;
      h += T(cx1(i), y1 + 14, lab[0], { fs: lfs, a: 'middle', c: SC.mut }) + T(cx1(i), y1 + 25, lab[1], { fs: lfs, a: 'middle', c: SC.mut });
      h += T(cx1(i), y1 + 46, fv(n.kind, n.v1), { fs: vfs, a: 'middle', w: 600, c: s === 'red' ? SC.red : SC.ink });
      if (st.l1ch) h += T(cx1(i), y1 + 62, pc(n.ch), { fs: cfs, a: 'middle', c: n.ch < 0 ? '#f0a49c' : '#8fd8b9', op: st.l1ch });
      h += '</g>';
      if (i < 3) h += T(x + w1 + gap / 2, y1 + h1 / 2 + 4, '×', { fs: nar ? 12 : 15, a: 'middle', c: SC.mut, op: st.l1 });
      // вклад множителя
      if (st.contrib) {
        const c = n.c[0], half = w1 / 2 - 4, len = half * Math.abs(c) / 310000 * st.contrib, yb = y1 + h1 + 8;
        h += `<rect x="${f1(c < 0 ? cx1(i) - len : cx1(i))}" y="${yb}" width="${f1(len)}" height="7" rx="2" style="fill:${c < 0 ? SC.red : SC.grn}"/>`;
        h += `<line x1="${f1(cx1(i))}" x2="${f1(cx1(i))}" y1="${yb - 3}" y2="${yb + 10}" style="stroke:${SC.mut};stroke-width:1"/>`;
        h += T(cx1(i), yb + 22, `${sg(c)}${nf(Math.round(Math.abs(c) / 1000))}${NB}тыс.${nar ? '' : NB + '₽'}`, { fs: cfs, a: 'middle', c: c < 0 ? '#f0a49c' : '#8fd8b9', op: st.contrib, halo: 1 });
      }
    });
    // дети активных и доли платящих
    const kid = (j, lab, val, sub, s, op) => {
      const x = cx2(j) - w2 / 2;
      return `<g style="opacity:${op.toFixed(2)}">${box(x, y2, w2, h2, s, 1)}${T(cx2(j), y2 + 14, lab, { fs: lfs, a: 'middle', c: SC.mut })}${T(cx2(j), y2 + 34, val, { fs: nar ? 14 : 16, a: 'middle', w: 600, c: s === 'red' ? SC.red : SC.ink })}${sub ? T(cx2(j), y2 + h2 - 8, sub, { fs: cfs, a: 'middle', c: SC.ink2 }) : ''}</g>`;
    };
    if (st.ak) mA.kids.forEach((n, j) => {
      h += kid(j, AKL[j], nf(n.v1), st.akd ? `${sg(n.v1 - n.v0)}${nf(Math.abs(n.v1 - n.v0))}${nar ? '' : ' к прошлой'}` : '', '', st.ak);
      if (j < 2) h += T((cx2(j) + cx2(j + 1)) / 2, y2 + h2 / 2 + 4, '+', { fs: 14, a: 'middle', c: SC.mut, op: st.ak });
    });
    if (st.ck) mC.kids.forEach((n, j) => {
      const s = j === 0 && st.rLeaf > .5 ? 'red' : j === 1 && st.noise > .5 ? 'amb' : '';
      h += kid(j, CKL[j], nf(n.v1, 3), nar ? pc(n.ch, 0) : `было ${nf(n.v0, 3)} · ${pc(n.ch, 0)}`, s, st.ck);
    });
    // баланс активных
    if (st.strip) {
      const ch = [['было', nf(B1.prev)], ['ушли', `${MINUS}${nf(B1.gone)}`], ['новые', `+${nf(B1.new)}`], ['вернулись', `+${nf(B1.back)}`], ['стало', `=${NB}${nf(B1.wau)}`]];
      const cw = nar ? (W - 4 * 5) / 5 : 92, g2 = nar ? 5 : 10, tot = 5 * cw + 4 * g2, x0 = W / 2 - tot / 2, ys = y2 + h2 + 18;
      h += `<g style="opacity:${st.strip.toFixed(2)}">`;
      ch.forEach((c, i) => {
        const x = x0 + i * (cw + g2);
        h += `<rect x="${f1(x)}" y="${ys}" width="${f1(cw)}" height="38" rx="7" style="fill:${i === 4 ? '#12302c' : '#0e1422'};stroke:${i === 4 ? SC.acc : SC.line}"/>`;
        h += T(x + cw / 2, ys + 14, c[0], { fs: nar ? 8.5 : 9.5, a: 'middle', c: SC.mut }) + T(x + cw / 2, ys + 30, c[1], { fs: nar ? 11.5 : 13, a: 'middle', w: 600, c: i === 1 ? '#f0a49c' : SC.ink });
      });
      h += '</g>';
    }
    h += '</svg>';
    // выноски: [x, y, над или под точкой, текст, короткий текст]
    const rootB = nar ? [W / 2, ry + rh + 8, 'down'] : [0, ry + 6, 'side'];
    const CALL = {
      0: [...rootB, 'Одно число: так выручку видит дашборд', 'Одно число на дашборде'],
      1: [...rootB, `${rub(ROOT.d)}${NB}₽ за неделю. Почему?`, `${rub(ROOT.d)}${NB}₽. Почему?`],
      2: [W / 2, ry + rh + 6, 'down', `${nf(mA.v1)} × ${nf(mC.v1, 3)} × ${nf(mF.v1, 3)} × ${nf(mS.v1)}${NB}₽ ≈ ${nf(ROOT.v1)}${NB}₽`, 'Произведение = выручка'],
      3: [cx1(1), y1 + h1 + 8, 'down', `Сильнее всего снизилась доля платящих: ${pc(mC.ch)}`, `Доля платящих: ${pc(mC.ch)}`],
      4: [cx2(1), y2 + h2 + 8, 'down', `${nf(mA.kids[0].v1)} + ${nf(mA.kids[1].v1)} + ${nf(mA.kids[2].v1)} = ${nf(mA.v1)} активных`, `${nf(mA.kids[0].v1)} + ${nf(mA.kids[1].v1)} + ${nf(mA.kids[2].v1)} = ${nf(mA.v1)}`],
      5: [W / 2, y2 + h2 + 64, 'down', 'Баланс сходится: было − ушли + новые + вернулись = стало', 'Баланс сходится'],
      6: [cx2(1), y2 + h2 + 8, 'down', 'Доля покупателей среди активных на каждой платформе', 'Доля по платформам'],
      7: [cx2(0), y2 + h2 + 8, 'down', `${pc(AND.ch, 0)} за неделю; payment_failed: ${failA[0][0]} → ${failA[1][0]}`, `payment_failed: ${failA[0][0]} → ${failA[1][0]}`],
      8: [...rootB, 'Сбой дошёл до выручки: лист → доля → корень', 'Лист → доля → выручка'],
      9: [...rootB, `Сумма вкладов: ${rub(ROOT.d)}${NB}₽ — ровно падение`, `Сумма: ${rub(ROOT.d)}${NB}₽`],
      10: [cx2(1), y2 + h2 + 8, 'down', `iOS: выручка ${pc(IOSR.ch, 0)} — в пределах коридора`, 'iOS — в коридоре']
    }[st.call];
    if (CALL) {
      const text = nar ? CALL[4] : CALL[3], fs = nar ? 11.5 : 12.5;
      const w = Math.min(nar ? 230 : 300, W - 12, text.length * fs * .56 + 24);
      if (CALL[2] === 'side') { const x = rx + rw + 12; calls.push({ x, y: CALL[1], w: Math.min(w, W - x - 6), place: 'down', text }); }
      else calls.push({ x: clamp(CALL[0] - w / 2, 6, W - w - 6), y: CALL[1], w, place: CALL[2], text });
    }
    return { svg: h, calls };
  }

  const scene = {
    parts: [{ n: '01', name: 'Выручка', s: [0, 1] }, { n: '02', name: 'Множители', s: [2, 3] }, { n: '03', name: 'Активные', s: [4, 5] }, { n: '04', name: 'Лист', s: [6, 7, 8] }, { n: '05', name: 'Вклады', s: [9, 10] }],
    steps: [
      { title: "Выручка за неделю", dur: 2800, body: `<p>За неделю с 25 по 31 мая покупатели оплатили в учебном магазине заказов на <b>2 003 150 ₽</b>. Включаем покупки на сайте и в приложении, подтверждённые сервером.</p>` },
      { title: "Что изменилось в июне", dur: 3200, body: `<p>С 1 по 7 июня выручка составила <b>1 740 490 ₽</b>. Это на 262 660 ₽, или 13,1%, меньше, чем неделей раньше.</p><p>Проверим, стало ли меньше посетителей, покупателей или заказов и как изменился средний чек.</p>` },
      { title: "Четыре множителя", dur: 3800, body: `<p>Выручка равна произведению четырёх величин: числа активных, доли платящих среди них, числа заказов на покупателя и среднего чека.</p><p>За 1–7 июня активны 1 976 человек. Купили 412, вместе они оплатили 452 заказа. Средний чек составил около 3 851 ₽.</p>` },
      { title: "Сравниваем недели", dur: 3200, body: `<p>Активных пользователей стало на 6,8% больше, средний чек вырос на 2,8%. В то же время доля платящих снизилась на 15,0% относительно прежней доли, а число заказов на покупателя — на 6,9%.</p>` },
      { title: "Три группы пользователей", dur: 3200, body: `<p>Среди 1 976 активных за 1–7 июня было 377 новичков. Ещё 936 человек вернулись после перерыва как минимум в одну календарную неделю. Остальные 663 были активны и на предыдущей неделе.</p>` },
      { title: "Проверяем баланс", dur: 3600, body: `<p>На прошлой неделе в журнале были 1 851 человек. Из них 1 188 пропустили текущую неделю. Прибавим 377 новичков и 936 вернувшихся. Получим 1 976 активных — столько же, сколько при прямом подсчёте.</p>` },
      { title: "Доля платящих по платформам", dur: 3000, body: `<p>Для каждой платформы разделим число покупателей на число её активных пользователей за неделю. Человек, который зашёл с двух платформ, может попасть в обе группы. Поэтому общую долю считаем по всему журналу, с учётом каждого человека один раз.</p>` },
      { title: "Что произошло на Android", dur: 3400, body: `<p>На Android купили 12,2% активных пользователей против 22,3% неделей раньше. За предыдущие 12 недель показатель ни разу не снижался больше чем на 17% относительно прошлой недели.</p><p>Одновременно число неудачных оплат на Android выросло с 10 до 142.</p>` },
      { title: "От ошибки оплаты к выручке", dur: 3600, body: `<p>Участники заходили в магазин, но часть попыток оплаты на Android завершалась ошибкой. Проверка версии приложения и серверных событий указывает на сбой в версии 3.2.</p><p>В дереве выделены показатели, на которых отразился этот сбой.</p>` },
      { title: "Сколько рублей приходится на каждый фактор", dur: 3800, body: `<p>Логарифмическое разложение даёт четыре вклада. Рост аудитории прибавил 122 120 ₽, рост среднего чека — ещё 52 381 ₽. Снижение доли платящих соответствует потере 303 526 ₽, снижение частоты заказов — 133 635 ₽.</p><p>В сумме получаем −262 660 ₽.</p>` },
      { title: "Как проверить другую платформу", dur: 4200, next: 'Читать страницу', body: `<p>Выручка на iOS за те же недели выросла на 12%. За 12 предыдущих недель она менялась от −28% до +55%. Рост на 12% укладывается в этот диапазон.</p><p>История помогает выбрать, что проверить в первую очередь. Причину изменения ищут в данных о работе приложения.</p>` }
    ],
    hud: [{ id: 'rev', label: 'Выручка, ₽' }, { id: 'chg', label: 'Изменение' }, { id: 'red', label: 'Красных узлов' }],
    legend: '<span><i class="sq" style="background:#2a3550"></i>узел</span><span><i style="background:#f2756a"></i>сбой и путь к выручке</span><span><i style="background:#e5a63c"></i>колебание в коридоре</span>',
    info: 'ДЕРЕВО МЕТРИК',
    aiNote: `В анимации дерево метрик учебного магазина. Выручка ${W0} — ${nf(ROOT.v0)} ₽, ${W1} — ${nf(ROOT.v1)} ₽ (${pc(ROOT.ch)}). Выручка = активные × доля платящих × заказов на платящего × средний чек; ${W1}: ${nf(mA.v1)} × ${nf(mC.v1, 3)} × ${nf(mF.v1, 3)} × ${nf(mS.v1)} ₽. Активные = новые ${B1.new} + вернувшиеся ${B1.back} + удержанные ${B1.kept}; ушедших ${B1.gone}. Доля платящих по платформам: Android ${nf(AND.v0, 3)} → ${nf(AND.v1, 3)}, iOS ${nf(mC.kids[1].v0, 3)} → ${nf(mC.kids[1].v1, 3)}, сайт ${nf(mC.kids[2].v0, 3)} → ${nf(mC.kids[2].v1, 3)}. Вклады множителей (логарифмическое разложение): ${M.map(m => rub(m.c[0])).join(', ')} ₽.`,
    mount(root, api) {
      root.innerHTML = '<div class="mt-sc"><div class="mt-sc-in"></div><div class="mt-sc-calls"></div></div>';
      const bx = root.querySelector('.mt-sc'), inn = bx.querySelector('.mt-sc-in'), cl = bx.querySelector('.mt-sc-calls');
      let sig = '';
      return {
        render(k, p) {
          const st = sceneState(k, p);
          api.hud('rev', nf(Math.round(st.rootV)), k === 0 || (k === 1 && p < .55) ? W0 : W1);
          api.hud('chg', st.rootCh > .5 ? pc(ROOT.ch) : '—');
          api.hud('red', String((st.rLeaf > .5) + (st.rConv > .5) + (st.rRoot > .5)));
          const W = Math.round(bx.clientWidth), H = Math.round(bx.clientHeight);
          if (!W || !H) return;
          const key = JSON.stringify([W, H, k, Object.values(st).map(v => (typeof v === 'number' ? Math.round(v * 40) : v))]);
          if (key === sig) return; sig = key;
          const d = drawScene(W, H, st);
          inn.innerHTML = d.svg;
          cl.innerHTML = d.calls.map(c => `<div class="mt-call ${c.place}" style="left:${f1(c.x)}px;top:${f1(c.y)}px;width:${f1(c.w)}px">${X(c.text)}</div>`).join('');
        }
      };
    }
  };

  /* ===================== Интерактив «Почему упала выручка» ===================== */
  const METHODS = ['логарифмы', 'подстановка →', 'подстановка ←'];
  const METHOD_FULL = ['логарифмический', 'подстановка, активные первыми', 'подстановка, средний чек первым'];
  const GROUP = { id: 'P', label: 'Та же выручка по платформам', group: true, kids: DATA.plat };
  DATA.plat.forEach(k => { k.parent = 'P'; });
  const TREE = Object.assign({}, ROOT, { kids: [...M, GROUP] });
  byId.P = GROUP; byId.R = TREE;
  const BR = ['R', 'A', 'C', 'F', 'S', 'P'];
  const drop = -ROOT.d;

  function gauge(n) {
    const W = 128, H = 20, x = v => 4 + (clamp(v, -60, 60) + 60) / 120 * (W - 8);
    const far = Math.abs(n.ch) > 60;
    return `<svg class="mt-g" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><rect x="${f1(x(n.lo))}" y="5" width="${f1(x(n.hi) - x(n.lo))}" height="10" rx="3" class="mt-gb"/><line x1="${f1(x(0))}" x2="${f1(x(0))}" y1="2" y2="18" class="mt-g0"/><circle cx="${f1(x(n.ch))}" cy="10" r="${far ? 3.5 : 4.5}" class="${n.out ? 'mt-gout' : 'mt-gin'}"/></svg>`;
  }
  const kindOf = id => (M.some(m => m.id === id) ? 'mult' : id === 'R' ? 'root' : id === 'P' ? 'group' : byId[id].parent === 'A' ? 'akid' : byId[id].parent === 'P' ? 'plat' : 'slice');
  const share = v => `${nf(Math.abs(v) / drop * 100, 0)}% падения`;
  const bandTxt = n => `Коридор: от ${pc(n.lo)} до ${pc(n.hi)}.`;

  function narrate(id, method) {
    const n = byId[id], kind = kindOf(id);
    const head = n.group ? '' : `<p><b>${X(n.label.replace(', ₽', ''))}</b>${kind === 'slice' ? ` · ${X(byId[n.parent].label.replace(', ₽', '').toLowerCase())}` : ''}: ${fv(n.kind, n.v0)} → ${fv(n.kind, n.v1)}, ${pc(n.ch)}.</p>`;
    if (kind === 'root') return `${head}<p>${bandTxt(n)} За предыдущие 12 недель выручка менялась от ${pc(n.mn)} до ${pc(n.mx)} в неделю. Раскройте множители и сравните их вклады.</p>`;
    if (kind === 'group') return '<p>Каждый заказ оплачен на одной платформе. Поэтому изменения выручки Android, iOS и сайта можно сложить. Выберите платформу, чтобы проверить, насколько её текущий результат отличается от предыдущих недель.</p>';
    if (kind === 'mult') {
      const c = n.c[method];
      let t = `${head}<p>Вклад в изменение выручки: <b>${rub(c)}${NB}₽</b>${c < 0 ? `, ${share(c)}` : ''}. `;
      t += method === 0 ? 'Логарифмический способ: от порядка множителей не зависит.' : `Подстановка: вклад зависит от порядка. По всем 24 порядкам у этого множителя — от ${rub(n.cmin)} до ${rub(n.cmax)}${NB}₽.`;
      const edge = Math.min(Math.abs(n.ch - n.lo), Math.abs(n.ch - n.hi)) < .5;
      t += `</p><p>${bandTxt(n)} ${n.out ? 'Узел вышел за коридор.' : edge ? 'Узел на самой границе коридора: по нему одному не решить, сбой это или колебание.' : 'Узел в коридоре: сам по себе он мог сдвинуться и случайно.'} Раскройте его.</p>`;
      if (n.id === 'C') t += `<p>Покупателей стало меньше: ${DATA.pay.P[0]} → ${DATA.pay.P[1]}. Число активных в знаменателе выросло на ${pc(mA.ch).slice(1)}.</p>`;
      return t;
    }
    if (kind === 'plat') {
      let t = `${head}<p>Изменение выручки платформы: ${rub(n.v1 - n.v0)}${NB}₽. ${bandTxt(n)}</p>`;
      if (n.id === 'R_android') t += '<p>Изменение выручки выходит за пределы коридора. Проверьте, как на Android изменились доля платящих, частота заказов и средний чек.</p>';
      else t += `<p>Изменение укладывается в коридор. За предыдущие 12 недель выручка платформы менялась от ${pc(n.mn)} до ${pc(n.mx)} в неделю.</p>`;
      return t;
    }
    const back = ROOT.v1 + n.gain;
    let t = `${head}<p>${bandTxt(n)}</p><p>Если вернуть только этот лист к ${W0}, выручка ${W1} была бы ${nf(back)}${NB}₽ (${rub(n.gain)}${NB}₽${n.gain > 0 ? `, ${share(n.gain)}` : ''}).</p>`;
    if (kind === 'akid') return t + '<p>Сложив новичков, вернувшихся и удержанных пользователей, получим число активных. При неизменных остальных множителях рост аудитории увеличивает расчётную выручку.</p>';
    if (id === DATA.found) return t + `<p><b>Лист найден.</b> Доля платящих вышла за пределы коридора. Расчётная потеря больше общего снижения выручки, потому что рост аудитории и среднего чека частично её компенсировал. Ошибок оплаты на Android было ${failA[0][0]}, стало ${failA[1][0]}. В учебных данных это сбой версии 3.2.</p>`;
    if (n.out) return t + '<p>Изменение выходит за границы коридора. При возврате к прежнему значению расчётная выручка меняется мало.</p>';
    if (n.gain > .2 * drop) return t + `<p>Расчётная выручка заметно изменилась. Однако за предыдущие недели показатель менялся от ${pc(n.mn)} до ${pc(n.mx)}. Для вывода о новом сбое нужны дополнительные данные.</p>`;
    return t + '<p>Изменение укладывается в коридор и мало влияет на расчётную выручку.</p>';
  }

  function buildTree(box, api) {
    const { $ } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Почему упала выручка <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="mt-all">Раскрыть всё</button><button type="button" class="btn ghost small" id="mt-reset">Сбросить</button></div></div>
<p class="hint mt-do">Раскрывайте ветви и выбирайте показатели. Найдите платформу, где резко снизилась доля платящих, и проверьте, как изменилось число ошибок оплаты.</p>
<div class="mt-meth"><span>Вклад множителя:</span><span class="seg" role="group" aria-label="Способ разложения">${METHODS.map((m, i) => `<button type="button" data-m="${i}" aria-pressed="${i === 0}">${m}</button>`).join('')}</span></div>
<div class="stage"><div class="mt-tree"><div class="mt-head" aria-hidden="true"><span></span><span>узел</span><span>${W0} → ${W1}</span><span>изменение и коридор</span><span>вклад, ₽</span></div><div id="mt-rows" role="tree" aria-label="Дерево метрик выручки"></div></div>
<div class="narr mt-narr"><p class="cap" id="mt-cap">Выбранный узел</p><div class="narr-text" id="mt-msg"></div></div></div>
<div class="status"><span><span class="dot" id="mt-dot"></span><span id="mt-found"></span></span><span id="mt-open"></span><span id="mt-mth"></span><span class="grow"></span><span id="mt-sum"></span></div>`;
    let open, sel, method, found;
    const mqS = window.matchMedia('(max-width: 1180px)');
    const fresh = () => { open = new Set(['R']); sel = 'R'; method = 0; found = false; };
    function row(n, depth, rel) {
      const kids = n.kids && n.kids.length, isOpen = open.has(n.id), kind = kindOf(n.id);
      const car = kids ? (isOpen ? '▾' : '▸') : '';
      const right = kind === 'root' ? rub(n.d) : kind === 'mult' ? rub(n.c[method]) : kind === 'plat' ? rub(n.v1 - n.v0) : '';
      const bar = kind === 'mult' ? `<i class="mt-bar ${n.c[method] < 0 ? 'neg' : 'pos'}" style="width:${f1(Math.abs(n.c[method]) / 340000 * 100)}%"></i>` : '';
      const lab = `<span class="mt-lab">${rel ? `<b class="mt-op">${rel}</b>` : ''}${X(n.label)}</span>`;
      if (n.group) return `<button type="button" class="mt-row mt-grp${sel === n.id ? ' sel' : ''}" style="--d:${depth}" data-id="${n.id}" role="treeitem" aria-level="${depth + 1}" aria-expanded="${isOpen}"><span class="mt-car">${car}</span>${lab}<span class="mt-sub">сумма трёх платформ</span></button>`;
      return `<button type="button" class="mt-row${right ? ' has-c' : ''}${sel === n.id ? ' sel' : ''}${n.out && !kids ? ' out' : ''}${found && n.id === DATA.found ? ' hit' : ''}" style="--d:${depth}" data-id="${n.id}" role="treeitem" aria-level="${depth + 1}"${kids ? ` aria-expanded="${isOpen}"` : ''}><span class="mt-car">${car}</span>${lab}<span class="mt-val">${fv(n.kind, n.v0)} → ${fv(n.kind, n.v1)}</span><span class="mt-ch${n.out ? ' bad' : ''}">${pc(n.ch)}</span>${gauge(n)}<span class="mt-c">${right ? `<span class="mt-cn${kind === 'mult' ? (n.c[method] < 0 ? ' neg' : ' pos') : ''}">${right}</span>${bar}` : ''}</span></button>`;
    }
    function rows(n, depth, rel) {
      let h = row(n, depth, rel);
      if (n.id === sel && mqS.matches) h += `<div class="mt-inl" style="--d:${depth}">${narrate(sel, method)}</div>`;
      if (n.kids && open.has(n.id)) n.kids.forEach(k => { h += rows(k, depth + 1, n.id === 'R' ? (k.group ? '' : '×') : n.id === 'A' || n.id === 'P' ? '+' : ''); });
      return h;
    }
    function draw() {
      $('mt-rows').innerHTML = rows(TREE, 0, '');
      const n = byId[sel];
      $('mt-cap').textContent = n.group ? 'Разрез по платформам' : kindOf(sel) === 'mult' ? 'Множитель' : kindOf(sel) === 'root' ? 'Корень дерева' : n.kids ? 'Узел' : 'Лист';
      $('mt-msg').innerHTML = narrate(sel, method);
      $('mt-dot').className = `dot${found ? ' live' : ''}`;
      $('mt-found').textContent = found ? 'Лист найден: доля платящих · Android' : 'Лист ещё не найден';
      $('mt-open').textContent = `Раскрыто ветвей: ${BR.filter(b => open.has(b)).length} из ${BR.length}`;
      $('mt-mth').textContent = `Способ: ${METHOD_FULL[method]}`;
      $('mt-sum').textContent = `Сумма вкладов: ${rub(M.reduce((s, m) => s + m.c[method], 0))} ₽ = изменение выручки`;
      box.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.m === method)));
    }
    box.addEventListener('click', e => {
      const r = e.target.closest('.mt-row'), m = e.target.closest('[data-m]');
      if (r) {
        const id = r.dataset.id, n = byId[id];
        if (n.kids) { if (open.has(id) && sel === id) open.delete(id); else open.add(id); }
        sel = id; if (id === DATA.found) found = true;
        draw();
        const again = box.querySelector(`.mt-row[data-id="${id}"]`); if (again) again.focus({ preventScroll: true });
      } else if (m) { method = +m.dataset.m; draw(); }
    });
    $('mt-all').addEventListener('click', () => { BR.forEach(b => open.add(b)); draw(); });
    $('mt-reset').addEventListener('click', () => { fresh(); draw(); });
    if (mqS.addEventListener) mqS.addEventListener('change', draw);
    fresh(); draw();
    return {
      describe() {
        return `способ разложения: ${METHOD_FULL[method]}; раскрыты ветви: ${BR.filter(b => open.has(b)).map(b => byId[b].label).join(', ')}; выбран узел: ${byId[sel].label}${byId[sel].parent && kindOf(sel) === 'slice' ? ` (${byId[byId[sel].parent].label})` : ''}; лист найден: ${found ? 'да' : 'нет'}.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  const CARD = `КАРТОЧКА МЕТРИКИ
Название:      как метрику называют на дашбордах и встречах
Вопрос:        на какой вопрос о продукте она отвечает
Определение:   одно предложение без жаргона
Формула:       числитель / знаменатель или сумма, с именами событий
Единица:       укажите единицу наблюдения (человек, аккаунт, устройство или заказ) и единицу результата (₽, доля, заказы на человека)
Период:        за какой срок считаем, в каком часовом поясе, когда начинается и заканчивается период
Источник:      укажите таблицы, названия событий и источник денежных сумм
Исключения:    дубли, боты, тестовые аккаунты, возвраты
Владелец:      кто отвечает за определение и меняет его
Связи:         перечислите связанные показатели в дереве и защитные метрики
История:       когда менялось определение и что именно`;

  window.PAGE = {
    id: 'da-9-4', short: 'DA-09',
    title: 'Метрики роста и дерево метрик',
    where: 'блок «Дата аналитика», тема 09 «Продуктовые метрики и события», страница 9.4',
    aiData: `учебный журнал событий магазина (приложение и сайт, январь — июнь 2026): выручка недели ${W0} — ${nf(ROOT.v0)} ₽, ${W1} — ${nf(ROOT.v1)} ₽, причина — баг оплаты в Android 3.2`,
    scene,
    widgets: { tree: buildTree },
    code: {
      dau: { title: 'DAU, WAU, MAU и липкость в PostgreSQL', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: OUT.sql_dau, out: OUT.dau, outLabel: 'Вывод psql',
        note: 'Первая команда создаёт временную таблицу с 45 250 парами «человек, день». Поэтому для каждого дня достаточно COUNT(*). Точный средний DAU февраля равен 172,25. При округлении до десятых PostgreSQL даёт 172,3, pandas — 172,2.' },
      balance: { title: 'WAU и баланс активных по неделям', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: OUT.sql_bal, out: OUT.balance, outLabel: 'Вывод psql',
        note: `Запускайте запрос в той же сессии, чтобы была доступна временная таблица person_day. Проверим неделю ${W1}: ${nf(B1.prev)} − ${nf(B1.gone)} + ${B1.new} + ${B1.back} = ${nf(B1.wau)}. Фильтр по датам применяется после LAG, иначе потеряем предыдущую неделю для первой строки отчёта.` },
      decompose: { title: 'Вклад множителей в изменение выручки', badge: 'проверено: pandas 3.0.5, NumPy 2.5.3', lang: 'python', code: OUT.decompose_src, out: OUT.decompose, outLabel: 'Вывод',
        note: `Все три способа дают в сумме ${rub(ROOT.d)} ₽. Если менять множители слева направо, вклад доли платящих составляет ${rub(mC.c[1])} ₽, справа налево — ${rub(mC.c[2])} ₽. При логарифмической декомпозиции порядок не влияет на результат. В конце скрипт отдельно пересчитывает выручку при прежней доле платящих на Android.` },
      card: { title: 'Шаблон карточки метрики', badge: 'шаблон', badgeKind: 'info', lang: 'text', code: CARD,
        note: 'Заполненная карточка доли платящих — в разделе «Идея». Файл шаблона для своих метрик — в «Материалах».' }
    },
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: "За 1–7 июня выручка снизилась на 13,1%, хотя активных пользователей стало на 6,8% больше. У какого фактора самый большой отрицательный вклад?", opts: [['Активные'], ['Доля платящих', 1], ['Заказов на платящего'], ['Средний чек']],
      why: "По логарифмической декомпозиции на долю платящих приходится −303 526 ₽. У числа заказов на покупателя вклад тоже отрицательный (−133 635 ₽). Рост аудитории и среднего чека компенсировал часть потерь." },
    q2: { sec: 'idea', q: "На прошлой неделе были активны 1 851 человек. Из них 1 188 пропустили следующую неделю, пришли 377 новичков и вернулись ещё 936 человек. Каким будет WAU?", opts: [[nf(B1.prev + B1.new + B1.back)], [nf(B1.wau), 1], [nf(B1.new + B1.back)], [nf(B1.prev - B1.gone)]],
      why: "Остались 1 851 − 1 188 = 663 человека. К ним прибавляем 377 новичков и 936 вернувшихся. Всего получаем 1 976 активных пользователей." },
    q3: { sec: 'idea', q: "С марта по апрель MAU вырос с 3 057 до 4 592. Средний DAU тоже вырос, а отношение DAU/MAU снизилось до 0,066. Какой вывод следует из этих чисел?", opts: [['Продукт стал полезнее: людей больше'], ['Месячная аудитория выросла быстрее средней дневной. В апреле в среднем за день были активны 6,6% месячной аудитории', 1], ['При росте MAU липкость падает всегда, это арифметика'], ['Упал DAU, значит, ушли постоянные покупатели']],
      why: "Месячная аудитория росла быстрее средней дневной. В апреле в среднем за день заходили 6,6% людей, активных за этот месяц. По одному отношению нельзя определить, как часто возвращались именно рекламные новички или как изменилась полезность магазина." },
    q4: { sec: 'idea', q: "Маркетплейс получает только комиссию с продаж. Как выразить его выручку через показатели за один период?", opts: [['Покупатели × заказов на покупателя × средний чек × эффективная доля комиссии', 1], ['Продавцы + покупатели + товары в каталоге'], ['DAU × MAU × средний чек'], ['Оборот + комиссия']],
      why: "Число покупателей, умноженное на число заказов на покупателя и средний чек, даёт оборот продавцов. Умножив оборот на эффективную долю комиссии (вся комиссия / весь оборот), получим выручку площадки. При разных ставках у продавцов потребуется именно эта взвешенная доля." },
    q5: { sec: 'idea', q: "Какой показатель проще всего увеличить техническим изменением интерфейса, даже если покупателям от него нет пользы?", opts: [['Оплаченные заказы по серверному order_paid'], ['Просмотры карточек товаров', 1], ['Доля людей, купивших повторно за 30 дней'], ['Выручка за вычетом возвратов']],
      why: "Если одна карточка начинает отправлять событие просмотра при каждом переключении вкладки, число просмотров вырастет и без новых покупателей. В учебном магазине число просмотров до очистки данных выросло на 6%, а оплаченных заказов стало на 16% меньше." },
    q6: { sec: 'code', q: "Чему равна сумма вкладов в примере с двумя разными положительными значениями выручки?", code: 'return (r1 - r0) / np.log(r1 / r0) * np.log(x1 / x0)', lang: 'python', opts: [['Ровно r1 − r0', 1], ['Примерно r1 − r0, остаток — совместный эффект множителей'], ['Зависит от порядка множителей в x0'], ['Единице: вклады — это доли']],
      why: "Сумма логарифмов отношений множителей равна логарифму отношения выручки двух недель. После умножения на логарифмическое среднее остаётся r1 − r0. В машинном расчёте возможна погрешность округления." },
    q7: { sec: 'nuances', q: "Покупателей стало на 9,3% меньше, а их доля среди активных снизилась на 15,0% относительно предыдущей недели. Что объясняет разницу?", opts: [['Из округления'], ['Из знаменателя: активных стало на 6,8% больше', 1], ['Из среднего чека'], ['Из дублей событий']],
      why: "В числителе 412 покупателей вместо 454, в знаменателе 1 976 активных вместо 1 851. Первую неделю купили 24,5% активных, вторую — 20,9%. Доля сократилась примерно на 15% относительно прежнего уровня, или на 3,7 процентного пункта по неокруглённым долям." }
    },
    glossary: {
      tree: { t: 'Дерево метрик', en: 'metric tree', d: 'Схема, где каждая метрика выражена через метрики ниже: произведением, суммой или разрезом по сегментам.' },
      dau: { t: 'DAU', en: 'daily active users', d: 'Число активных людей за день.' },
      wau: { t: 'WAU', en: 'weekly active users', d: 'Число активных людей за неделю; человек считается один раз, сколько бы дней ни заходил.' },
      mau: { t: 'MAU', en: 'monthly active users', d: 'Число активных людей за месяц.' },
      active: { t: 'Активный пользователь', en: 'active user', d: 'Человек, у которого за период было хотя бы одно событие.' },
      sticky: { t: 'Липкость', en: 'stickiness, DAU/MAU', d: 'Средний DAU за месяц, делённый на MAU: какую долю дней месяца средний активный человек заходит в продукт.' },
      balance: { t: 'Баланс активных', en: 'growth accounting', d: 'Учёт потоков активных: прошлый период − ушедшие + новые + вернувшиеся = текущий период.' },
      newu: { t: 'Новые', en: 'new users', d: "Участники, впервые замеченные за период. В учебном магазине исключаем аккаунты, зарегистрированные до начала журнала." },
      kept: { t: 'Удержанные', en: 'retained, current users', d: 'Активные в этот период, которые были активны и в предыдущий.' },
      back: { t: 'Вернувшиеся', en: 'resurrected users', d: 'Активные в этот период, которые были раньше, но не в предыдущий период.' },
      gone: { t: 'Ушедшие', en: 'churned users', d: 'Активные в предыдущий период, которых нет в этом.' },
      nsm: { t: 'Северная звезда', en: 'North Star Metric', d: "Основной показатель, который отражает пользу продукта для пользователей. Для магазина один из вариантов — оплаченные заказы за неделю." },
      input: { t: 'Входная метрика', en: 'input metric', d: "Показатель, на который может повлиять команда и который связан с основным показателем продукта." },
      decomp: { t: 'Декомпозиция изменения', en: 'change decomposition', d: "Расчёт вклада отдельных факторов в общее изменение показателя." },
      payshare: { t: 'Доля платящих', en: 'paying share, payer conversion', d: 'Доля активных за период, у которых была хотя бы одна успешная оплата.' },
      aov: { t: 'Средний чек', en: 'average order value, AOV', d: 'Выручка, делённая на число заказов.' },
      lmdi: { t: 'Логарифмическая декомпозиция', en: 'log-mean Divisia index, LMDI', d: 'Разложение изменения произведения на вклады множителей через логарифмы: без остатка и без зависимости от порядка.' },
      chain: { t: 'Последовательная подстановка', en: 'chain substitution', d: 'Разложение, при котором множители по одному заменяют новыми значениями; вклады зависят от порядка.' },
      corridor: { t: 'Коридор', en: 'noise band', d: 'Диапазон обычных недельных изменений узла: здесь среднее ± два стандартных отклонения за 12 недель.' },
      guard: { t: 'Защитная метрика', en: 'guardrail metric', d: "Показатель, по которому отслеживают нежелательные последствия изменения продукта." },
      vanity: { t: 'Тщеславная метрика', en: 'vanity metric', d: "Показатель, рост которого сам по себе мало помогает принять решение." },
      goodhart: { t: 'Закон Гудхарта', en: "Goodhart's law", d: 'Когда метрику делают целью, она перестаёт отражать то, ради чего её считали.' },
      card: { t: 'Карточка метрики', en: 'metric definition', d: 'Описание метрики в одном месте: определение, формула, источник, владелец, исключения.' },
      ratio: { t: 'Метрика-отношение', en: 'ratio metric', d: "Отношение двух величин. Для интерпретации важны единицы измерения, период и состав знаменателя." }
    },
    materials: [
      ['da-9-4-metric-tree.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/events/', 'Учебные данные темы 09 — общий набор: журнал событий и аккаунты; база events в PostgreSQL — через load_pg.sql'],
      ['active.sql', 'DAU, WAU, MAU, липкость и баланс активных в PostgreSQL'],
      ['decompose.py', 'Вклад множителей в изменение выручки: логарифмы и подстановка'],
      ['metric_card_template.md', 'Шаблон карточки метрики для своих метрик']
    ],
    prompts: [
      ['Дерево своего продукта', 'Я опишу свой продукт и как он зарабатывает. Помоги по образцу из источника разложить выручку на множители, чтобы произведение было равно выручке точно. Задавай вопросы по одному.'],
      ['Проверка понимания', 'Задай мне пять вопросов по источнику: баланс активных, липкость, логарифмическая декомпозиция, защитные и тщеславные метрики. По одному за раз; после ответа объясни, где я ошибся, со ссылкой на текст.'],
      ['Карточка метрики', 'Я опишу метрику, которую считаю на работе. Заполни по ней карточку по шаблону из источника и найди поля, где определение двусмысленно: единица счёта, часовой пояс, исключения, источник выручки.']
    ]
  };
})();
