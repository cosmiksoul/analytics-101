(() => {
  'use strict';
  /* Данные и вывод кода вписывает data/build_page.py: не правьте руками между метками. */
  /*data:start*/const DATA = {"P": {"p0": 0.04, "vis": 30000, "visWe": 34500, "trend": 0.003, "season": 0.1, "we": 0.92, "sMid": 27, "sW": 4, "dip": 0.09, "camp": 30, "campX": 0.4, "weakQ": 0.45, "track": 35, "seen": 0.8, "lift": 0.1}, "shock": [0.0622473, 0.028647, 0.0041713, 0.015737, 0.0080779, 0.0247783, -0.0078043, 0.0789465, 0.056032, 0.0602634, 0.0642472, 0.0739067, 0.0445228, 0.0766382, 0.0210131, -0.0102254, 0.0637569, 0.0333714, -0.0062195, -0.0153539, -6.33e-05, 0.0258207, 0.0179285, 0.0220035, -0.0225683, -0.0073015, 0.007135, 0.0053035, -0.0450723, -0.0081152, -0.0459823, -0.0287432, -0.0295233, -0.0052204, -0.0263696, 0.0040472, 0.0068379, 0.0585435, 0.0176069, 0.0137753, 0.0231366, 0.0168132], "z": [[-1.9998542, 1.2592267, -0.0095493, -0.3870514, -1.0033811, -0.3246078, -0.6226826, 0.5861068, -0.2090445, -0.3069873, 0.2991696, -1.2597932, -0.9953746, -1.2260775, -0.203892, 0.0457437, 0.677128, 0.1831161, -0.7376261, -0.1867845, 0.0950516, -0.8098368, -0.3964098, -0.6041833, -0.2133924, -0.3258682, -0.2460343, 0.402888, 0.441968, 0.6814138, -0.5712832, -1.0983864, 0.7137864, 0.5638575, -0.3013208, -1.2167041, 1.1922998, 0.9835425, 0.5546625, 0.5597066, -2.8927792, -0.4586515], [-0.0188886, -0.1712403, 0.2281695, -1.2589579, -0.5554019, -0.7926931, -1.1586984, -1.2323411, -0.3953039, -0.7588123, 0.0967663, -0.2844719, 0.4970079, -0.8782951, -0.5107821, 0.3793034, -1.4522676, -1.23726, -0.9210459, -0.8150136, 1.5600339, -0.0930809, -0.5169879, -1.0470987, -0.7649323, -0.6034313, -0.8190069, 0.2112759, -0.4013283, -0.233032, -0.8820528, 0.7682544, -1.1136856, -0.1345187, 1.7599799, 0.4499848, -0.6911143, -0.457237, 0.4873293, 0.3583525, 0.7696281, -0.6415326]], "check": {"00000": [9.8752, 10.3723], "10000": [14.5818, 10.362], "01000": [16.5759, 10.3153], "11000": [21.5647, 10.3077], "00100": [-0.3122, 10.3645], "10100": [3.9159, 10.3539], "01100": [5.748, 10.3105], "11100": [10.2294, 10.3025], "00010": [22.0836, 10.3723], "10010": [27.3132, 10.362], "01010": [29.5288, 10.3153], "11010": [35.0719, 10.3077], "00110": [9.8447, 10.3645], "10110": [14.5035, 10.3539], "01110": [16.5223, 10.3105], "11110": [21.4603, 10.3025], "00001": [15.0632, 10.3723], "10001": [20.0513, 10.362], "01001": [22.1501, 10.3153], "11001": [27.4404, 10.3077], "00101": [4.3947, 10.3645], "10101": [8.8762, 10.3539], "01101": [10.8044, 10.3105], "11101": [15.5572, 10.3025], "00011": [27.848, 10.3723], "10011": [33.3903, 10.362], "01011": [35.7223, 10.3153], "11011": [41.6004, 10.3077], "00111": [15.0312, 10.3645], "10111": [19.9693, 10.3539], "01111": [22.0939, 10.3105], "11111": [27.331, 10.3025]}, "rtm": 4.16, "ab": {"saltB": 49.4}};/*data:end*/
  /*code:start*/const CODE = {"sim": {"code": "import numpy as np\nimport pandas as pd\n\nDAYS = pd.date_range(\"2025-09-01\", periods=42)          # 6 недель: пн 1 сентября — вс 12 октября\nT = np.arange(42)\nRELEASE = 28                                            # релиз в понедельник 29 сентября\nBEFORE = (T >= RELEASE - 14) & (T < RELEASE)            # две недели до релиза\nAFTER = T >= RELEASE                                    # две недели после\nLIFT = 0.10                                             # истинный эффект релиза: +10% к конверсии\n\n\ndef simulate(seed, trend=0.0, season=0.0, campaign=None, tracking=None, dip=0.0):\n    \"\"\"Учебный магазин по дням. На каждую группу приходится половина визитов за день.\n    a и b — покупки в группах A и B, a_all — покупки в A при выпуске новой версии для всех.\"\"\"\n    rng = np.random.default_rng(seed)\n    shock = 0.02 * rng.standard_normal(42) + 0.03 * np.repeat(rng.standard_normal(6), 7)   # колебания дня и недели\n    z = rng.standard_normal((2, 42))                    # шум покупок в каждой половине\n    weekend = DAYS.dayofweek >= 5\n    visits = np.where(weekend, 34_500.0, 30_000.0)\n    p = 0.04 * np.exp(shock) * (1 + trend) ** T         # конверсия визита; тренд — рост за день\n    if season:                                          # сезон: выходные и осенний спрос вокруг релиза\n        p *= np.where(weekend, 0.92, 1) * (1 + season / (1 + np.exp(-(T - 27) / 4)))\n    p *= np.where((T >= 21) & (T < 28), 1 - dip, 1)     # провал за неделю до релиза\n    weak = np.zeros(42)                                 # кампания: +40% визитов, вероятность покупки составляет 45% от обычной\n    if campaign is not None:\n        weak[campaign:campaign + 7] = 0.4 * visits[campaign:campaign + 7]\n    seen = np.ones(42)                                  # трекинг: 20% визитов не доходят до журнала\n    if tracking is not None:\n        seen[tracking:tracking + 7] = 0.8\n\n    def buys(half, released):\n        mean = (visits + 0.45 * weak) / 2 * p * np.where(released & AFTER, 1 + LIFT, 1)\n        return mean + z[half] * np.sqrt(mean * (1 - p))  # шум как у биномиального распределения\n    return pd.DataFrame({\"visits\": (visits + weak) / 2 * seen,     # визиты одной половины в журнале\n                         \"a\": buys(0, False), \"b\": buys(1, True), \"a_all\": buys(0, True)}, index=DAYS)\n\n\ndef estimate(d):\n    \"\"\"Две оценки эффекта: «до и после» по всей аудитории и A/B по группам в одни и те же дни.\"\"\"\n    conv = lambda buys, days: buys[days].sum() / d.visits[days].sum()\n    everyone = (d.a_all + d.b) / 2                      # сценарий с выпуском новой версии для всех\n    return conv(everyone, AFTER) / conv(everyone, BEFORE) - 1, conv(d.b, AFTER) / conv(d.a, AFTER) - 1\n\n\nLAYERS = {\"тренд\": {\"trend\": 0.003}, \"сезон\": {\"season\": 0.10}, \"кампания\": {\"campaign\": 30},\n          \"трекинг\": {\"tracking\": 35}, \"провал\": {\"dip\": 0.09}}\nworld, rows = {}, []\nfor name in [\"без помех\", *LAYERS]:                     # включаем слои по одному; шум тот же, seed 481\n    world |= LAYERS.get(name, {})\n    d = simulate(481, **world)\n    everyone = (d.a_all + d.b) / 2\n    ba, ab = estimate(d)\n    rows.append({\"слои\": name if name == \"без помех\" else \"+ \" + name,\n                 \"до, %\": everyone[BEFORE].sum() / d.visits[BEFORE].sum() * 100,\n                 \"после, %\": everyone[AFTER].sum() / d.visits[AFTER].sum() * 100,\n                 \"до и после, %\": ba * 100, \"A/B, %\": ab * 100,\n                 \"ошибка д/п\": (ba - LIFT) * 100, \"ошибка A/B\": (ab - LIFT) * 100})\nprint(pd.DataFrame(rows).set_index(\"слои\").round(2).to_string())", "out": "            до, %  после, %  до и после, %  A/B, %  ошибка д/п  ошибка A/B\nслои                                                                      \nбез помех    3.99      4.38           9.88   10.37       -0.12        0.37\n+ тренд      4.24      4.86          14.58   10.36        4.58        0.36\n+ сезон      4.22      5.13          21.56   10.31       11.56        0.31\n+ кампания   4.22      4.66          10.23   10.30        0.23        0.30\n+ трекинг    4.22      5.13          21.46   10.30       11.46        0.30\n+ провал     4.03      5.13          27.33   10.30       17.33        0.30", "note": "Для анимации и калькулятора используются те же формулы и случайные числа (seed 481). Строки показывают, как меняется оценка после добавления очередной помехи. В двух последних столбцах указано отклонение от заданного прироста 10%, в процентных пунктах."}, "runs": {"code": "import matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\n\n# 1. Тысяча прогонов с разными помехами и датами их появления\nrng = np.random.default_rng(2025)\nres = []\nfor run in range(1000):\n    world = {\"trend\": rng.uniform(-0.003, 0.003),      # от −0,3 до +0,3% в день\n             \"season\": rng.uniform(-0.10, 0.10),        # осенний спрос растёт или падает\n             \"campaign\": int(rng.integers(28, 36)) if rng.random() < 0.5 else None,\n             \"tracking\": int(rng.integers(28, 36)) if rng.random() < 0.5 else None}\n    res.append(estimate(simulate(run, **world)))\nest = pd.DataFrame(res, columns=[\"до и после\", \"A/B\"]) * 100\nerr = est - LIFT * 100                                  # ошибка в процентных пунктах\nprint(pd.DataFrame({\"средняя ошибка\": err.mean(), \"разброс (SD)\": err.std(),\n                    \"|ошибка| > 5 п. п., %\": (err.abs() > 5).mean() * 100}).round(1).to_string())\n\n# 2. Регрессия к среднему: помех нет, но релиз выпускают после слабых недель\ncalm = []\nfor run in range(1000):\n    d = simulate(10_000 + run)\n    before = ((d.a_all + d.b) / 2)[BEFORE].sum() / d.visits[BEFORE].sum()\n    calm.append((before, *estimate(d)))\ncalm = pd.DataFrame(calm, columns=[\"до\", \"до и после\", \"A/B\"])\ncalm[[\"до и после\", \"A/B\"]] = (calm[[\"до и после\", \"A/B\"]] - LIFT) * 100\nbad = calm[\"до\"] < calm[\"до\"].quantile(0.1)             # 10% самых слабых периодов «до»\nprint(\"\\nсредняя ошибка, п. п.\")\nprint(pd.DataFrame({\"все прогоны\": calm[[\"до и после\", \"A/B\"]].mean(),\n                    \"после слабых недель\": calm.loc[bad, [\"до и после\", \"A/B\"]].mean()}).T.round(2).to_string())\n\n# 3. Рисунок: распределение двух оценок в тысяче прогонов\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 9, \"axes.spines.top\": False, \"axes.spines.right\": False})\nfig, ax = plt.subplots(figsize=(6.4, 3.3), layout=\"constrained\")\nbins = np.arange(-20, 46, 1)\nax.hist(est[\"до и после\"], bins=bins, color=\"#d27a12\", alpha=0.5)\nax.hist(est[\"A/B\"], bins=bins, color=\"#0d7468\")\nax.axvline(LIFT * 100, color=\"#141a24\", linewidth=1)\nax.set_ylim(0, 290)\nax.annotate(\"истинный эффект +10%\", (LIFT * 100, 288), xytext=(4, 0), textcoords=\"offset points\", va=\"top\")\nax.annotate(\"A/B\", (13, 150), color=\"#0d7468\", fontweight=\"bold\")\nax.annotate(\"«до и после»\", (27, 22), color=\"#b0650a\", fontweight=\"bold\")\nax.set(xlabel=\"оценка эффекта релиза, %\", ylabel=\"прогонов из 1000\", xlim=(-20, 45))\nfig.suptitle(\"Как меняются оценки эффекта за 1 000 прогонов\", x=0.02, ha=\"left\",\n             fontweight=\"bold\", fontsize=11)\nax.set_title(\"Тренд, сезонность, реклама и пропущенные визиты в учебном магазине\",\n             loc=\"left\", fontsize=7.5, color=\"#737c8f\")\nfig.savefig(\"runs.svg\")", "out": "            средняя ошибка  разброс (SD)  |ошибка| > 5 п. п., %\nдо и после             1.3          10.1                   66.4\nA/B                    0.0           1.6                    0.4\n\nсредняя ошибка, п. п.\n                     до и после   A/B\nвсе прогоны                0.00 -0.03\nпосле слабых недель        4.16  0.10", "note": "Ячейка продолжает предыдущую: simulate, estimate, LIFT и BEFORE уже в памяти. В каждом прогоне свой шум и свои помехи, истинный эффект всегда +10%. Во второй части помех нет вовсе: завышение даёт только выбор момента релиза."}, "hash": {"code": "-- 1. Группа по хешу: md5('соль:user_id'), первые 8 hex-символов как число, остаток от деления на 100\nWITH salts (experiment, salt) AS (\n  VALUES ('aa_check', 'aa-0824-7'), ('checkout_v2', 'chk-0907-3'), ('reco_block', 'reco-1005')\n), hashed AS (\n  SELECT e.experiment, e.\"group\" AS logged,\n         CASE WHEN ('x' || substr(md5(s.salt || ':' || e.user_id), 1, 8))::bit(32)::bigint % 100 < 50\n              THEN 'A' ELSE 'B' END AS by_hash\n  FROM exposures AS e\n  JOIN salts AS s USING (experiment)\n), counts AS (\n  SELECT experiment,\n         COUNT(*) FILTER (WHERE by_hash <> logged) AS mismatched,\n         COUNT(*) FILTER (WHERE by_hash = 'A') AS a,\n         COUNT(*) FILTER (WHERE by_hash = 'B') AS b\n  FROM hashed\n  GROUP BY experiment\n)\nSELECT experiment, mismatched, a, b,\n       ROUND(100.0 * b / (a + b), 2) AS b_pct,\n       -- хи-квадрат против 50/50 и его p-value: одна степень свободы, p = erfc(√(χ²/2))\n       ROUND(power(a - b, 2)::numeric / (a + b), 2) AS chi2,\n       ROUND(erfc(sqrt(power(a - b, 2) / (a + b) / 2))::numeric, 4) AS p_value\nFROM counts\nORDER BY experiment;\n\n-- 2. Баланс checkout_v2 по тому, что известно до теста\nSELECT x.\"group\",\n       COUNT(*) AS users,\n       ROUND(AVG((u.platform = 'android')::int) * 100, 1) AS android_pct,\n       ROUND(AVG((u.country = 'BY')::int) * 100, 1) AS by_pct,\n       ROUND(AVG((u.signup_date >= '2026-09-07')::int) * 100, 1) AS new_pct,\n       ROUND(AVG(COALESCE(p.sessions_pre, 0)), 2) AS sessions_pre,\n       ROUND(AVG(COALESCE(p.revenue_pre, 0)), 1) AS revenue_pre\nFROM exposures AS x\nJOIN users AS u USING (user_id)\nLEFT JOIN pre_period AS p USING (user_id)\nWHERE x.experiment = 'checkout_v2'\nGROUP BY x.\"group\"\nORDER BY x.\"group\";\n\n-- 3. Единица — пользователь, но до входа клиент делит устройство: сессии с чужой группой\nSELECT COUNT(DISTINCT s.user_id) AS users, COUNT(*) AS sessions\nFROM sessions AS s\nJOIN exposures AS x USING (experiment, user_id)\nWHERE s.experiment = 'checkout_v2' AND s.\"group\" <> x.\"group\";", "out": " experiment  | mismatched |   a   |   b   | b_pct | chi2  | p_value \n-------------+------------+-------+-------+-------+-------+---------\n aa_check    |          0 | 19988 | 20092 | 50.13 |  0.27 |  0.6034\n checkout_v2 |          0 | 28440 | 28360 | 49.93 |  0.11 |  0.7371\n reco_block  |          0 | 24440 | 23746 | 49.28 | 10.00 |  0.0016\n(3 rows)\n\n group | users | android_pct | by_pct | new_pct | sessions_pre | revenue_pre \n-------+-------+-------------+--------+---------+--------------+-------------\n A     | 28440 |        45.0 |   40.1 |    18.9 |         4.29 |       766.0\n B     | 28360 |        45.1 |   39.6 |    19.2 |         4.20 |       753.7\n(2 rows)\n\n users | sessions \n-------+----------\n   376 |      857\n(1 row)", "note": "Приведение ('x' || …)::bit(32)::bigint читает 8 шестнадцатеричных знаков как число, как int(…, 16) в Python. erfc — дополнительная функция ошибок: для хи-квадрата с одной степенью свободы p = erfc(√(χ²/2)). Расхождений с записанными группами нет: правило из README воспроизводит разбиение точно."}};/*code:end*/

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => (t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
  const lerp = (a, b, t) => a + (b - a) * t;
  const X = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const f1 = n => (Math.round(n * 10) / 10).toString();
  const NB = ' ', MINUS = '−';
  const nf = (v, d = 0) => Number(v).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/\s/g, NB).replace('-', MINUS);
  const sgn = (v, d = 1) => { const r = Number(v.toFixed(d)); return (r > 0 ? '+' : r < 0 ? MINUS : '') + nf(Math.abs(r), d); };
  const pct = (v, d = 1) => `${sgn(v, d)}%`;          // относительный прирост, %
  const pp = (v, d = 1) => `${sgn(v, d)}${NB}п.${NB}п.`;     // ошибка, процентные пункты

  /* ===================== Модель: те же формулы, что simulate() в data/code/simulate.py ===================== */
  const P = DATA.P || {}, N = 42, REL = 28, B0 = 14;
  const LAY = [
    { k: 'trend', name: 'Тренд', short: 'тренд' },
    { k: 'season', name: 'Сезон', short: 'сезон' },
    { k: 'campaign', name: 'Рекламная кампания', short: 'кампания' },
    { k: 'tracking', name: 'Пропущенные визиты', short: 'трекинг' },
    { k: 'dip', name: 'Провал перед релизом', short: 'провал' }
  ];
  const weekend = t => t % 7 >= 5;                       // день 0 — понедельник 1 сентября
  const inCamp = t => t >= P.camp && t < P.camp + 7, inTrack = t => t >= P.track && t < P.track + 7, inDip = t => t >= 21 && t < 28;
  function sim(on) {
    const r = { vis: [], a: [], b: [], aAll: [], bNo: [] };
    for (let t = 0; t < N; t++) {
      const we = weekend(t), visits = we ? P.visWe : P.vis;
      let p = P.p0 * Math.exp(DATA.shock[t]) * Math.pow(1 + (on.trend ? P.trend : 0), t);
      if (on.season) p *= (we ? P.we : 1) * (1 + P.season / (1 + Math.exp(-(t - P.sMid) / P.sW)));
      p *= on.dip && inDip(t) ? 1 - P.dip : 1;
      const weak = on.campaign && inCamp(t) ? P.campX * visits : 0;
      const seen = on.tracking && inTrack(t) ? P.seen : 1;
      const m0 = (visits + P.weakQ * weak) / 2 * p;
      const buy = (half, rel) => { const m = m0 * (rel && t >= REL ? 1 + P.lift : 1); return m + DATA.z[half][t] * Math.sqrt(m * (1 - p)); };
      r.vis.push((visits + weak) / 2 * seen); r.a.push(buy(0, false)); r.b.push(buy(1, true)); r.aAll.push(buy(0, true)); r.bNo.push(buy(1, false));
    }
    const sum = (f, a, b) => { let s = 0; for (let t = a; t < b; t++) s += f(t); return s; };
    const all = t => (r.aAll[t] + r.b[t]) / 2, vis = t => r.vis[t];
    r.before = sum(all, B0, REL) / sum(vis, B0, REL); r.after = sum(all, REL, N) / sum(vis, REL, N);
    r.convA = sum(t => r.a[t], REL, N) / sum(vis, REL, N); r.convB = sum(t => r.b[t], REL, N) / sum(vis, REL, N);
    r.ba = (r.after / r.before - 1) * 100; r.ab = (r.convB / r.convA - 1) * 100;
    r.dAll = r.vis.map((v, t) => all(t) / v * 100);                         // конверсия дня, %
    r.dCf = r.vis.map((v, t) => (r.a[t] + r.bNo[t]) / 2 / v * 100);          // то же без релиза: контрфакт
    r.dA = r.vis.map((v, t) => r.a[t] / v * 100); r.dB = r.vis.map((v, t) => r.b[t] / v * 100);
    return r;
  }
  const key = on => LAY.map(l => (on[l.k] ? 1 : 0)).join('');
  const CACHE = {};
  const state = on => CACHE[key(on)] || (CACHE[key(on)] = sim(on));
  // множитель каждого слоя по дням, % отклонения — для полосок сцены
  const FACT = {
    release: t => (t >= REL ? P.lift * 100 : 0),
    trend: t => (Math.pow(1 + P.trend, t) - 1) * 100,
    season: t => ((weekend(t) ? P.we : 1) * (1 + P.season / (1 + Math.exp(-(t - P.sMid) / P.sW))) - 1) * 100,
    campaign: t => (inCamp(t) ? ((1 + P.campX * P.weakQ) / (1 + P.campX) - 1) * 100 : 0),
    tracking: t => (inTrack(t) ? (1 / P.seen - 1) * 100 : 0),
    dip: t => (inDip(t) ? -P.dip * 100 : 0)
  };
  const DAYLBL = [[0, '1 сен'], [14, '15 сен'], [28, '29 сен'], [41, '12 окт']];

  // путь сцены: слои включаются по одному
  const PATH = [{}];
  LAY.forEach((l, i) => PATH.push(Object.assign({}, PATH[i], { [l.k]: true })));
  const PS = PATH.map(state), FULL = PS[5];
  const CONTRIB = PS.map((s, i) => (i ? s.ba - PS[i - 1].ba : s.ba));        // вклад слоя в оценку «до и после», п. п.

  /* ===================== Сцена: релиз под слоями помех ===================== */
  const C = { ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#7c87a0', line: '#2a3550', grid: '#1a2236', acc: '#36b8a6', accF: '#12302c', blue: '#8fb3ff', org: '#f0a247', red: '#f2756a', redF: 'rgba(242,117,106,.13)' };
  const STEPS_STATE = [[0, 0], [0, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 5], [5, 5], [5, 5], [5, 5]];
  const mixS = (s0, s1, t, f) => s0[f].map((v, i) => lerp(v, s1[f][i], t));
  function sceneState(k, p) {
    const [i0, i1] = STEPS_STATE[k], m = i0 === i1 ? 1 : ease(seg(p, .1, .75));
    const S0 = PS[i0], S1 = PS[i1];
    const on = (i) => (i1 >= i ? (i0 >= i ? 1 : m) : 0);                    // видимость слоя i (1…5)
    return {
      k, m, i0, i1, all: mixS(S0, S1, m, 'dAll'), cf: mixS(S0, S1, m, 'dCf'),
      before: lerp(S0.before, S1.before, m) * 100, after: lerp(S0.after, S1.after, m) * 100, ba: lerp(S0.ba, S1.ba, m),
      layers: [1, 1, 2, 3, 4, 5].map((v, j) => (j === 0 ? 1 : on(v))),
      cfOn: k >= 1 ? (k === 1 ? ease(seg(p, .05, .5)) : 1) : 0,
      groups: k >= 8 ? (k === 8 ? ease(seg(p, .05, .45)) : 1) : 0,
      gapOn: k >= 9 ? (k === 9 ? ease(seg(p, .2, .6)) : 1) : 0,
      aOver: k === 10 ? ease(seg(p, .1, .6)) : 0,
      sum: k === 7 ? ease(seg(p, .1, .5)) : 0,
      call: p >= .5 ? k : -1
    };
  }
  function lay(W, H) {
    const nar = W < 520, L = { W, H, nar };
    L.x0 = nar ? 30 : 40; L.x1 = W - (nar ? 4 : 10); L.dx = (L.x1 - L.x0) / N;
    L.X = t => L.x0 + (t + .5) * L.dx;
    L.t0 = 6; L.t1 = Math.round(H * (nar ? .5 : .53));
    L.b0 = L.t1 + (nar ? 36 : 36); L.b1 = H - 2;
    return L;
  }
  const rng = arrs => { let lo = Infinity, hi = -Infinity; arrs.forEach(a => a.forEach(v => { lo = Math.min(lo, v); hi = Math.max(hi, v); })); return [lo, hi]; };
  const YT = (() => { const [lo, hi] = rng(PS.flatMap(s => [s.dAll, s.dCf])); return [Math.floor(lo * 2) / 2 - .25, Math.ceil(hi * 2) / 2]; })();
  const YB = (() => { const [lo, hi] = rng([FULL.dA, FULL.dB]); return [Math.floor(lo * 2) / 2 - .25, Math.ceil(hi * 2) / 2]; })();
  const T = (x, y, s, o = {}) => `<text x="${f1(x)}" y="${f1(y)}"${o.a ? ` text-anchor="${o.a}"` : ''} style="font-size:${o.fs || 10.5}px;fill:${o.c || C.mut}${o.w ? ';font-weight:' + o.w : ''}${o.op != null ? ';opacity:' + o.op.toFixed(2) : ''}"${o.halo ? ' class="xp-halo"' : ''}>${X(s)}</text>`;
  const poly = (pts, col, o = {}) => `<polyline points="${pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ')}" style="fill:none;stroke:${col};stroke-width:${o.w || 1.8};stroke-linejoin:round${o.dash ? ';stroke-dasharray:' + o.dash : ''}${o.op != null ? ';opacity:' + o.op.toFixed(2) : ''}"/>`;
  const hl = (x0, x1, y, col, o = {}) => `<line x1="${f1(x0)}" x2="${f1(x1)}" y1="${f1(y)}" y2="${f1(y)}" style="stroke:${col};stroke-width:${o.w || 1}${o.dash ? ';stroke-dasharray:' + o.dash : ''}${o.op != null ? ';opacity:' + o.op.toFixed(2) : ''}"/>`;
  const BANDS = [['dip', 21, 28, 'провал', 5], ['campaign', 30, 37, 'кампания', 3], ['tracking', 35, 42, 'трекинг', 4]];

  function chart(L, y0, y1, dom, st, fs) {
    const Y = v => y1 - (v - dom[0]) / (dom[1] - dom[0]) * (y1 - y0);
    let h = '';
    for (let g = Math.ceil(dom[0]); g <= dom[1]; g++) h += hl(L.x0, L.x1, Y(g), C.grid) + T(L.x0 - 5, Y(g) + 3.5, `${g}%`, { a: 'end', fs: fs - 1 });
    BANDS.forEach(([lk, a, b, nm, li]) => {
      const v = st.layers[li];
      if (v <= 0) return;
      const xa = L.x0 + a * L.dx, xb = L.x0 + b * L.dx;
      h += `<rect x="${f1(xa)}" y="${f1(y0)}" width="${f1(xb - xa)}" height="${f1(y1 - y0)}" style="fill:${C.redF};opacity:${v.toFixed(2)}"/>`;
      h += T(lk === 'tracking' ? xb - 3 : xa + 3, y0 + (lk === 'tracking' ? 22 : 10), nm, { fs: fs - 1, c: C.red, op: v, a: lk === 'tracking' ? 'end' : null });
    });
    const xr = L.x0 + REL * L.dx;
    h += `<line x1="${f1(xr)}" x2="${f1(xr)}" y1="${f1(y0 - 2)}" y2="${f1(y1)}" style="stroke:${C.acc};stroke-width:1.4"/>`;
    return { h, Y, xr };
  }

  function drawScene(W, H, st) {
    const L = lay(W, H), fs = L.nar ? 9.5 : 10.5, calls = [];
    let h = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Конверсия по дням: релиз и слои помех; ниже — слои или две случайные группы">`;
    // ---- верх: все посетители
    const top = chart(L, L.t0 + 8, L.t1, YT, st, fs), Y = top.Y;
    h += top.h + T(top.xr + 4, L.t0 + 4, 'релиз', { c: C.acc, fs, w: 600 });
    DAYLBL.forEach(([t, s], i) => { h += T(L.X(t), L.t1 + 13, s, { fs: fs - 1, a: i === 0 ? 'start' : i === 3 ? 'end' : 'middle' }); });
    if (st.cfOn > 0) {   // разница с контрфактом — заливка, сам контрфакт — пунктир
      const up = [], dn = [];
      for (let t = REL; t < N; t++) { up.push([L.X(t), Y(st.all[t])]); dn.unshift([L.X(t), Y(st.cf[t])]); }
      h += `<polygon points="${up.concat(dn).map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ')}" style="fill:${C.accF};opacity:${(st.cfOn * .9).toFixed(2)}"/>`;
      h += poly(dn.slice().reverse(), C.mut, { dash: '4 3', w: 1.5, op: st.cfOn });
    }
    h += poly(st.all.map((v, t) => [L.X(t), Y(v)]), C.ink, { w: 1.8 });
    if (st.aOver > 0) h += poly(FULL.dA.slice(REL).map((v, i) => [L.X(REL + i), Y(v)]), C.blue, { w: 1.8, op: st.aOver });
    // средние «до» и «после»
    const xb0 = L.x0 + B0 * L.dx, xr = top.xr, xe = L.x1;
    h += hl(xb0, xr, Y(st.before), C.org, { w: 2, dash: '6 3' }) + hl(xr, xe, Y(st.after), C.org, { w: 2, dash: '6 3' });
    h += T(xb0 + 2, Y(st.before) + 13, `до ${nf(st.before, 1)}%`, { c: C.org, fs, w: 600, halo: 1 });
    h += T(xe - 2, Y(st.after) - 6, `после ${nf(st.after, 1)}%`, { c: C.org, fs, w: 600, a: 'end', halo: 1 });
    // ---- низ: слои (шаги 0–7) или две группы (8–10)
    const stripOp = 1 - st.groups;
    if (stripOp > 0) {
      const rows = [['релиз и случайный разброс', 'release', C.acc], ...LAY.map(l => [l.short, l.k, C.red])];
      const rh = (L.b1 - L.b0) / rows.length, sc = (rh - 13) / 2 / 26;
      h += `<g style="opacity:${stripOp.toFixed(2)}">`;
      h += T(L.nar ? 4 : L.x0, L.b0 - 10, L.nar ? 'слои по дням и их вклад в «до и после»' : 'когда действовали помехи и как менялась оценка', { fs: fs - 1 });
      rows.forEach(([nm, fk, col], j) => {
        const v = st.layers[j], ry = L.b0 + j * rh, mid = ry + 11 + (rh - 13) / 2;
        const act = v > 0, op = act ? .35 + .65 * v : .35;
        h += T(L.x0 - (L.nar ? 26 : 34), ry + 9, nm, { fs: fs - 1, c: act ? col : C.mut, op: act ? 1 : .6 });
        h += hl(L.x0, L.x1, mid, C.grid);
        if (act) {
          let bars = '';
          for (let t = 0; t < N; t++) {
            const d = FACT[fk](t) * sc * (fk === 'release' ? 1 : v), y = d >= 0 ? mid - d : mid, hh = Math.abs(d);
            if (hh > .3) bars += `<rect x="${f1(L.x0 + t * L.dx + .5)}" y="${f1(y)}" width="${f1(Math.max(.6, L.dx - 1))}" height="${f1(hh)}"/>`;
          }
          h += `<g style="fill:${col};opacity:${op.toFixed(2)}">${bars}</g>`;
          if (v >= .99 || j === 0) h += T(L.x1, ry + 9, pp(CONTRIB[j]), { fs, a: 'end', c: col, w: st.sum > 0 ? 700 : 600, halo: 1 });
        }
      });
      h += '</g>';
    }
    if (st.groups > 0) {
      const g = chart(L, L.b0 + 6, L.b1 - 14, YB, Object.assign({}, st, { layers: [1, 1, 1, 1, 1, 1] }), fs), Yb = g.Y;
      h += `<g style="opacity:${st.groups.toFixed(2)}">${g.h}`;
      h += T(L.nar ? 4 : L.x0, L.b0 - 10, L.nar ? 'две случайные группы: A — старый поиск, B — новый' : 'те же дни, две случайные группы: A — старый поиск, B — новый с 29 сентября', { fs: fs - 1 });
      h += poly(FULL.dA.map((v, t) => [L.X(t), Yb(v)]), C.blue, { w: 1.6 }) + poly(FULL.dB.map((v, t) => [L.X(t), Yb(v)]), C.acc, { w: 1.6 });
      h += T(L.X(N - 1) + 2, Yb(FULL.dA[N - 1]) + 12, 'A', { c: C.blue, fs: fs + 1, w: 700, a: 'end' }) + T(L.X(N - 1) + 2, Yb(FULL.dB[N - 1]) - 6, 'B', { c: C.acc, fs: fs + 1, w: 700, a: 'end' });
      if (st.gapOn > 0) {
        const ya = Yb(FULL.convA * 100), yb = Yb(FULL.convB * 100);
        h += `<g style="opacity:${st.gapOn.toFixed(2)}">` + hl(g.xr, L.x1, ya, C.blue, { w: 2, dash: '6 3' }) + hl(g.xr, L.x1, yb, C.acc, { w: 2, dash: '6 3' });
        h += T(L.x0 + 4, L.b0 + 20, `${L.nar ? '' : 'после релиза: '}A ${nf(FULL.convA * 100, 2)}%, B ${nf(FULL.convB * 100, 2)}%`, { fs, c: C.ink2, w: 600, halo: 1 }) + '</g>';
      }
      DAYLBL.forEach(([t, s], i) => { h += T(L.X(t), L.b1 - 2, s, { fs: fs - 1, a: i === 0 ? 'start' : i === 3 ? 'end' : 'middle' }); });
      h += '</g>';
    }
    h += '</svg>';
    // выноски
    const cfs = L.nar ? 11 : 12.5;
    const put = (x, y, place, text) => { const w = Math.min(L.nar ? 210 : 280, W - 12, text.length * cfs * .55 + 22); calls.push({ x: clamp(x - w / 2, 6, W - w - 6), y, w, place, text }); };
    const left = L.X(L.nar ? 8 : 7), yTop = L.t0 + 14;
    const last = PS[st.i1];
    switch (st.call) {
      case 0: put(L.X(35), Y(st.after) - 22, 'up', `до ${nf(st.before, 1)}% → после ${nf(st.after, 1)}%: ${pct(st.ba)}`); break;
      case 1: put(L.X(35), Y(Math.min(...st.cf.slice(REL))) + 12, 'down', 'Пунктир — без релиза. В журнале его нет'); break;
      case 2: put(left, yTop, 'down', `Тренд +0,3% в день: оценка ${pct(last.ba)}`); break;
      case 3: put(left, yTop, 'down', `Осенний подъём попал в «после»: ${pct(last.ba)}`); break;
      case 4: put(left, yTop, 'down', `Посетители из рекламы покупают реже: ${pct(last.ba)}`); break;
      case 5: put(left, yTop, 'down', `Визиты теряются, покупки — нет: ${pct(last.ba)}`); break;
      case 6: put(left, yTop, 'down', `«До» занижено провалом: ${pct(last.ba)}`); break;
      case 7: put(left, yTop, 'down', `Без помех ${pct(CONTRIB[0])}, со всеми ${pct(FULL.ba)}`); break;
      case 8: put(left, yTop, 'down', 'Внизу: до релиза группы A и B идут вместе, это A/A'); break;
      case 9: put(left, yTop, 'down', `Внизу: B / A − 1 = ${pct(FULL.ab)} при истинных +10%`); break;
      case 10: put(L.X(12), yTop, 'down', 'По группе A оцениваем конверсию без релиза'); break;
    }
    return { svg: h, calls };
  }

  const P0 = PS[0];
  const scene = {
    parts: [{ n: '01', name: 'Релиз', s: [0, 1] }, { n: '02', name: 'Время', s: [2, 3] }, { n: '03', name: 'События', s: [4, 5] }, { n: '04', name: 'Общая оценка', s: [6, 7] }, { n: '05', name: 'Две группы', s: [8, 9, 10] }],
    steps: [
      { title: "После релиза конверсия выросла", dur: 3600, body: `<p>29 сентября учебный магазин запустил новый поиск. За две недели до релиза конверсия составила ${nf(P0.before * 100, 1)}%, за две недели после — ${nf(P0.after * 100, 1)}%.</p><p>Теперь посмотрим, как меняется сравнение, когда на магазин действуют внешние факторы.</p>` },
      { title: "Что произошло бы со старым поиском", dur: 3800, body: `<p>Пунктир показывает конверсию в том же магазине, если бы поиск остался прежним. Мы можем построить такую линию, потому что сами задали модель.</p><p>В журнале работающего магазина есть только те события, которые действительно произошли.</p>` },
      { title: "Долгосрочный рост", dur: 3800, body: `<p>Конверсия растёт на 0,3% в день даже со старым поиском. Это относительный прирост.</p><p>Сравнение двух периодов теперь даёт <b>${pct(PS[1].ba)}</b>. В эту оценку попал и рост, который начался до релиза.</p>` },
      { title: "Выходные и осенний спрос", dur: 3800, body: `<p>В выходные вероятность покупки ниже. Каждый из двух периодов включает две полные недели, поэтому число выходных совпадает.</p><p>Осенний подъём спроса приходится на период после релиза. Оценка по двум периодам составляет <b>${pct(PS[2].ba)}</b>.</p>` },
      { title: "Новые посетители из рекламы", dur: 4000, body: `<p>На неделю число визитов увеличивается на 40%. Вероятность покупки у пришедших по рекламе составляет 45% от обычной.</p><p>Оценка по двум периодам снижается до <b>${pct(PS[3].ba)}</b>.</p>` },
      { title: "Пропущенные визиты", dur: 3800, body: `<p>В последнюю неделю счётчик пропустил 20% визитов. Сервер при этом записал все покупки, поэтому расчётная конверсия выросла.</p><p>Сравнение периодов даёт <b>${pct(PS[4].ba)}</b>.</p>` },
      { title: "Релиз после неудачной недели", dur: 4200, body: `<p>За неделю до релиза вероятность покупки в модели временно снизилась на 9%. Из-за этого база сравнения оказалась ниже.</p><p>Когда изменения запускают после случайного спада, последующее восстановление легко приписать релизу.</p>` },
      { title: "Суммарная оценка", dur: 3600, body: `<p>Сравнение периодов даёт <b>${pct(FULL.ba)}</b>. В модели поиск увеличивает вероятность покупки только на 10%.</p><p>Справа показано, как менялась оценка по мере добавления помех. При другом порядке вклад отдельной помехи может измениться.</p>` },
      { title: "Две группы в одни и те же дни", dur: 3600, body: `<p>Теперь модель делит посетителей на две равные группы. До релиза в обеих группах работает старый поиск.</p><p>Наблюдаемые конверсии немного различаются из-за случайных колебаний числа покупок.</p>` },
      { title: "Сравнение групп после релиза", dur: 4000, body: `<p>Новый поиск видит только группа B. Сезонный спрос меняется для обеих групп, а рекламный трафик и потери записей распределены между ними одинаково.</p><p>Относительный прирост конверсии B по сравнению с A составляет <b>${pct(FULL.ab)}</b>.</p>` },
      { title: "Что показывает контрольная группа", dur: 4000, next: 'Читать страницу', body: `<p>Линия группы A проходит рядом с пунктиром. По покупкам в A можно оценить, какой в среднем была бы конверсия в B со старым поиском.</p><p>В этом примере оценка A/B близка к заданному эффекту. Исход каждого отдельного посетителя с другим поиском остаётся неизвестен.</p>` }
    ],
    hud: [{ id: 'ba', label: 'До и после' }, { id: 'ab', label: 'A/B' }, { id: 'tr', label: 'Истина' }],
    legend: `<span><i class="sq" style="background:${C.ink}"></i>все посетители</span><span><i class="sq" style="background:${C.org}"></i>средние «до» и «после»</span><span><i class="sq" style="background:${C.red}"></i>помехи</span><span><i class="sq" style="background:${C.blue}"></i>группа A</span><span><i class="sq" style="background:${C.acc}"></i>релиз, группа B</span>`,
    info: 'ИСТИННЫЙ ЭФФЕКТ +10%',
    aiNote: `В анимации учебная симуляция магазина: 42 дня с 1 сентября по 12 октября, 30 000 визитов в будний день и 34 500 в выходной, конверсия около 4%, релиз нового поиска 29 сентября с истинным эффектом +10% к конверсии. Оценка «до и после» (две недели после против двух недель до) по мере того, как включаются слои: без помех ${pct(PS[0].ba)}, с трендом ${pct(PS[1].ba)}, с сезоном ${pct(PS[2].ba)}, с кампанией ${pct(PS[3].ba)}, со сломанным трекингом ${pct(PS[4].ba)}, с провалом перед релизом ${pct(PS[5].ba)}. Оценка A/B (группа B с новым поиском против A со старым в те же две недели после релиза) со всеми слоями — ${pct(FULL.ab)}.`,
    mount(root, api) {
      root.innerHTML = '<div class="xp-sc"><div class="xp-sc-in"></div><div class="xp-sc-calls"></div></div>';
      const bx = root.querySelector('.xp-sc'), inn = bx.querySelector('.xp-sc-in'), cl = bx.querySelector('.xp-sc-calls');
      let sig = '';
      return {
        render(k, p) {
          const st = sceneState(k, p);
          api.hud('ba', pct(st.ba));
          api.hud('ab', k >= 9 ? pct(FULL.ab) : '—');
          api.hud('tr', '+10%');
          const W = Math.round(bx.clientWidth), H = Math.round(bx.clientHeight);
          if (!W || !H) return;
          const s = JSON.stringify([W, H, k, Math.round(st.m * 60), Math.round(st.cfOn * 30), Math.round(st.groups * 30), Math.round(st.gapOn * 30), Math.round(st.aOver * 30), st.sum > 0, st.call]);
          if (s === sig) return; sig = s;
          const d = drawScene(W, H, st);
          inn.innerHTML = d.svg;
          cl.innerHTML = d.calls.map(c => `<div class="xp-call ${c.place}" style="left:${f1(c.x)}px;top:${f1(c.y)}px;width:${f1(c.w)}px">${X(c.text)}</div>`).join('');
        }
      };
    }
  };

  /* ===================== Интерактив «Слои помех» ===================== */
  const NARR = {
    none: "Без дополнительных помех обе оценки близки к заданному приросту в 10%. Остаются случайные колебания числа покупок.",
    trend: "Даже без релиза конверсия растёт на 0,3% в день. В сравнении периодов этот рост увеличивает оценку эффекта. В A/B обе группы наблюдаются в одно и то же время.",
    season: "В выходные вероятность покупки ниже. Одинаковое число выходных в двух периодах помогает учесть недельный цикл. Осенний подъём спроса приходится на период после релиза.",
    campaign: "Реклама на неделю увеличивает число визитов на 40%. Новые посетители покупают реже. Сравнение периодов занижает эффект поиска, а в A/B реклама одинаково меняет состав обеих групп.",
    tracking: "В последнюю неделю журнал теряет 20% визитов, а сервер записывает все покупки. Конверсия после релиза завышена. В этой модели потери в группах одинаковы, поэтому отношение B/A почти не меняется.",
    dip: "Конверсия перед релизом временно снизилась на 9%. Сравнение с необычно слабой неделей завышает эффект. В A/B сравнивают группы за одни и те же даты после релиза."
  };
  const ALLST = (() => { const out = []; for (let m = 0; m < 32; m++) { const on = {}; LAY.forEach((l, i) => { if (m >> i & 1) on[l.k] = true; }); out.push(state(on)); } return out; })();
  const W1 = (() => { const [lo, hi] = rng(ALLST.map(s => s.dAll.slice(B0))); return [Math.floor(lo * 2) / 2, Math.ceil(hi * 2) / 2]; })();
  const W2 = (() => { const [lo, hi] = rng(ALLST.flatMap(s => [s.dA.slice(B0), s.dB.slice(B0)])); return [Math.floor(lo * 2) / 2, Math.ceil(hi * 2) / 2]; })();
  const MET = (() => { const [lo, hi] = rng([ALLST.map(s => s.ba)]); return [Math.floor(lo / 5) * 5 - 5, Math.ceil(hi / 5) * 5 + 5]; })();

  function paneSVG(W, s, on, which) {
    const H = W < 420 ? 170 : 190, x0 = 34, x1 = W - 6, y0 = 16, y1 = H - 20, n = N - B0, dx = (x1 - x0) / n;
    const dom = which ? W2 : W1, Y = v => y1 - (v - dom[0]) / (dom[1] - dom[0]) * (y1 - y0), Xd = t => x0 + (t - B0 + .5) * dx;
    let h = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${which ? 'Конверсия групп A и B по дням' : 'Конверсия всех посетителей по дням'}">`;
    for (let g = Math.ceil(dom[0]); g <= dom[1]; g++) h += `<line class="xp-grid" x1="${x0}" x2="${f1(x1)}" y1="${f1(Y(g))}" y2="${f1(Y(g))}"/><text class="xp-tx" x="${x0 - 5}" y="${f1(Y(g) + 3.5)}" text-anchor="end">${g}%</text>`;
    BANDS.forEach(([lk, a, b, nm]) => {
      if (!on[lk]) return;
      const xa = x0 + (a - B0) * dx, xb = x0 + (Math.min(b, N) - B0) * dx;
      h += `<rect class="xp-band" x="${f1(xa)}" y="${y0}" width="${f1(xb - xa)}" height="${f1(y1 - y0)}"/><text class="xp-bandt" x="${f1(lk === 'tracking' ? xb - 3 : xa + 3)}" y="${lk === 'tracking' ? y0 + 22 : y0 + 10}"${lk === 'tracking' ? ' text-anchor="end"' : ''}>${nm}</text>`;
    });
    const xr = x0 + (REL - B0) * dx;
    h += `<line class="xp-rel" x1="${f1(xr)}" x2="${f1(xr)}" y1="${y0 - 6}" y2="${f1(y1)}"/><text class="xp-relt" x="${f1(xr + 4)}" y="${y0 - 6}">релиз</text>`;
    [[B0, '15 сен', 'start'], [REL, '29 сен', 'middle'], [N - 1, '12 окт', 'end']].forEach(([t, l, a]) => { h += `<text class="xp-tx" x="${f1(t === B0 ? x0 : t === REL ? xr : x1)}" y="${H - 5}" text-anchor="${a}">${l}</text>`; });
    const line = (arr, cls) => `<polyline class="${cls}" points="${arr.slice(B0).map((v, i) => `${f1(Xd(B0 + i))},${f1(Y(v))}`).join(' ')}"/>`;
    if (!which) {
      h += line(s.dAll, 'xp-ln');
      h += `<line class="xp-mean" x1="${x0}" x2="${f1(xr)}" y1="${f1(Y(s.before * 100))}" y2="${f1(Y(s.before * 100))}"/><line class="xp-mean" x1="${f1(xr)}" x2="${f1(x1)}" y1="${f1(Y(s.after * 100))}" y2="${f1(Y(s.after * 100))}"/>`;
      h += `<text class="xp-mt" x="${x0 + 3}" y="${f1(Y(s.before * 100) + 13)}">до ${nf(s.before * 100, 2)}%</text><text class="xp-mt" x="${f1(x1 - 2)}" y="${f1(Y(s.after * 100) - 6)}" text-anchor="end">после ${nf(s.after * 100, 2)}%</text>`;
    } else {
      h += line(s.dA, 'xp-ln-a') + line(s.dB, 'xp-ln-b');
      const ya = Y(s.convA * 100), yb = Y(s.convB * 100);
      h += `<line class="xp-mean-a" x1="${f1(xr)}" x2="${f1(x1)}" y1="${f1(ya)}" y2="${f1(ya)}"/><line class="xp-mean-b" x1="${f1(xr)}" x2="${f1(x1)}" y1="${f1(yb)}" y2="${f1(yb)}"/>`;
      h += `<text class="xp-mt-b" x="${f1(x1 - 2)}" y="${f1(yb - 6)}" text-anchor="end">B ${nf(s.convB * 100, 2)}%</text><text class="xp-mt-a" x="${f1(x1 - 2)}" y="${f1(ya + 13)}" text-anchor="end">A ${nf(s.convA * 100, 2)}%</text>`;
      h += `<text class="xp-tx" x="${x0 + 3}" y="${f1(Y(Math.max(...s.dB.slice(B0, REL))) - 6)}">до релиза: A/A</text>`;
    }
    return h + '</svg>';
  }

  function buildLayers(box) {
    box.innerHTML = `<div class="block-hd"><span class="t">Слои помех <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="xp-all">Все слои</button><button type="button" class="btn ghost small" id="xp-reset">Сбросить</button></div></div>
<p class="hint xp-do">Включайте помехи по&nbsp;одной: смотрите, как меняется оценка «до и&nbsp;после» и сравнивайте её с оценкой A/B.</p>
<div class="xp-tg" role="group" aria-label="Помехи">${LAY.map(l => `<button type="button" class="xp-chip" data-l="${l.k}" aria-pressed="false"><i aria-hidden="true"></i>${l.name}</button>`).join('')}</div>
<div class="xp-two"><div class="xp-pane"><p class="xp-cap">«До и&nbsp;после»: все посетители</p><div class="xp-ch" id="xp-c1"></div></div><div class="xp-pane"><p class="xp-cap">A/B: две группы в&nbsp;те&nbsp;же дни</p><div class="xp-ch" id="xp-c2"></div></div></div>
<div class="xp-meter"><span class="xp-mlab">Оценка эффекта релиза</span><div class="xp-track" id="xp-track"></div></div>
<p class="xp-narr" id="xp-narr"></p>
<div class="status"><span><span class="dot" id="xp-dot"></span><span id="xp-s1"></span></span><span id="xp-s2"></span><span class="grow"></span><span id="xp-s3"></span></div>`;
    const $ = id => box.querySelector('#' + id);
    let on = {}, last = null, prev = null;
    const xm = v => clamp((v - MET[0]) / (MET[1] - MET[0]) * 100, 0, 100);
    const lab = v => { const x = xm(v); return x < 14 ? 'left:0;transform:none' : x > 86 ? 'right:0;left:auto;transform:none' : `left:${x.toFixed(2)}%`; };
    function track() {
      let h = '';
      for (let v = MET[0]; v <= MET[1]; v += 10) if (v !== 10) h += `<span class="xp-tk" style="left:${xm(v).toFixed(2)}%"><i>${v > 0 ? '+' : v < 0 ? MINUS : ''}${Math.abs(v)}%</i></span>`;
      h += `<span class="xp-truth" style="left:${xm(10).toFixed(2)}%"></span><span class="xp-tl xp-tl-tr" style="left:${xm(10).toFixed(2)}%">истина +10%</span>`;
      h += '<span class="xp-dot xp-dot-ba" id="xp-dba"></span><span class="xp-tl xp-tl-ba" id="xp-lba"></span><span class="xp-dot xp-dot-ab" id="xp-dab"></span><span class="xp-tl xp-tl-ab" id="xp-lab"></span>';
      $('xp-track').innerHTML = h;
    }
    function draw() {
      const s = state(on), n = LAY.filter(l => on[l.k]).length;
      box.querySelectorAll('.xp-chip').forEach(b => b.setAttribute('aria-pressed', String(!!on[b.dataset.l])));
      const w1 = Math.max(260, Math.round($('xp-c1').clientWidth || 440)), w2 = Math.max(260, Math.round($('xp-c2').clientWidth || 440));
      $('xp-c1').innerHTML = paneSVG(w1, s, on, 0); $('xp-c2').innerHTML = paneSVG(w2, s, on, 1);
      $('xp-dba').style.left = `${xm(s.ba).toFixed(2)}%`; $('xp-dab').style.left = `${xm(s.ab).toFixed(2)}%`;
      $('xp-lba').setAttribute('style', lab(s.ba)); $('xp-lab').setAttribute('style', lab(s.ab));
      $('xp-lba').textContent = `«до и после» ${pct(s.ba)}`; $('xp-lab').textContent = `A/B ${pct(s.ab)}`;
      let t = NARR[last || 'none'];
      if (last) {
        const was = !on[last];
        t = (was ? `Помеха «${LAY.find(l => l.k === last).name}» выключена. ` : '') + (was ? '' : t);
        if (prev) t += ` Оценка «до и после» сдвинулась на ${pp(s.ba - prev.ba)}, A/B — на ${pp(s.ab - prev.ab, 2)}`;
      }
      $('xp-narr').textContent = t;
      $('xp-dot').className = `dot${Math.abs(s.ba - 10) < 2 ? ' live' : ''}`;
      $('xp-s1').textContent = `ошибка «до и после» ${pp(s.ba - 10)}`;
      $('xp-s2').textContent = `ошибка A/B ${pp(s.ab - 10)}`;
      $('xp-s3').textContent = `помех ${n} из 5`;
    }
    box.addEventListener('click', e => {
      const b = e.target.closest('.xp-chip'); if (!b) return;
      prev = state(on); const k = b.dataset.l; on = Object.assign({}, on, { [k]: !on[k] }); if (!on[k]) delete on[k]; last = k; draw();
    });
    $('xp-all').addEventListener('click', () => { prev = state(on); on = {}; LAY.forEach(l => { on[l.k] = true; }); last = null; draw(); $('xp-narr').textContent = `Все пять помех: «до и после» ${pct(FULL.ba)}, A/B ${pct(FULL.ab)}. Реклама снижает оценку по двум периодам, остальные помехи в этом примере её повышают.`; });
    $('xp-reset').addEventListener('click', () => { on = {}; last = null; prev = null; draw(); });
    track();
    let lastW = 0;
    if ('ResizeObserver' in window) new ResizeObserver(() => { const w = $('xp-c1').clientWidth; if (w && Math.abs(w - lastW) > 4) { lastW = w; draw(); } }).observe(box);
    draw();
    return {
      describe() { const s = state(on), names = LAY.filter(l => on[l.k]).map(l => l.short); return `включены помехи: ${names.length ? names.join(', ') : 'нет'}; оценка «до и после» ${pct(s.ba)} (до ${nf(s.before * 100, 2)}%, после ${nf(s.after * 100, 2)}%), оценка A/B ${pct(s.ab)}; истинный эффект +10%.`; },
      redraw: draw
    };
  }

  /* ===================== Страница ===================== */
  const AB = DATA.ab || {};
  window.PAGE = {
    id: 'da-11-1', short: 'DA-11',
    title: 'Как оценить эффект релиза с помощью A/B-теста',
    where: 'блок «Дата аналитика», тема 11 «A/B-тестирование», страница 11.1',
    aiData: `учебная симуляция магазина: 42 дня, релиз нового поиска 29 сентября с истинным эффектом +10% к конверсии, слои помех (тренд, сезон, рекламная кампания, сломанный трекинг, провал перед релизом); оценка «до и после» со всеми слоями ${pct(FULL.ba)}, A/B ${pct(FULL.ab)}; разбиение по хешу и баланс групп — на учебных экспериментах data/ab (aa_check, checkout_v2, reco_block)`,
    scene,
    widgets: { layers: buildLayers },
    code: {
      sim: Object.assign({ title: 'Симуляция магазина с трендом, сезоном и помехами', badge: 'проверено: Python 3.13, pandas 3.0.5', lang: 'python', outLabel: 'Вывод: помехи включаются по одной, шум тот же' }, CODE.sim),
      runs: Object.assign({ title: 'Тысяча прогонов: «до и после» против A/B', badge: 'проверено: Python 3.13', lang: 'python', outLabel: 'Вывод; рисунок — под блоком' }, CODE.runs),
      hash: Object.assign({ title: 'Разбиение по хешу и проверка баланса', badge: 'проверено: PostgreSQL 16', lang: 'sql', outLabel: 'Вывод psql: три запроса' }, CODE.hash)
    },
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'Включим одну помеху — рекламную кампанию: неделю после релиза на 40% больше визитов, и эти люди покупают в 2,2 раза реже. Что покажут две оценки при истинном эффекте +10%?', opts: [['Обе занизят эффект: кампания портит конверсию у всех'], ['«До и после» покажет эффект около нуля, A/B останется около +10%', 1], ['Обе останутся около +10%: кампания никак не связана с релизом'], ['«До и после» завысит эффект, A/B его занизит']],
      why: `«До и после» сравнивает неделю с кампанией и прошлые недели без неё: новые посетители реже покупают, и оценка падает до ${pct(state({ campaign: true }).ba)}. В модели посетители из рекламы распределены между группами поровну, конверсия падает у обеих, а отношение B / A не меняется: ${pct(state({ campaign: true }).ab)}. Связь кампании с релизом не нужна, чтобы сломать «до и после»: достаточно совпасть по времени. Завысить эффект кампания не может: она тянет «после» только вниз.` },
    q2: { sec: 'idea', q: '«Конверсия выросла после релиза на 27%». Почему это не доказывает, что релиз сработал?', opts: [['Потому что 27% — слишком большой рост, так не бывает'], ['Потому что рост считают от прошлых недель, а не от контрфакта: в него входит всё, что поменялось между неделями', 1], ['Потому что конверсию нужно считать по пользователям, а не по визитам'], ['Доказывает, если рост статистически значим']],
      why: `Эффект — разница с тем, что было бы без релиза в те же дни. «До и после» подставляет вместо этого прошлые недели, и тренд, сезон, кампания, трекинг и провал перед релизом попадают в оценку: в сцене ${pct(FULL.ba)} при истинных +10%. Значимость здесь не спасает: тест из темы 06 отличает разницу от шума, но не скажет, откуда разница взялась. Большой рост бывает, а единица анализа — отдельный вопрос (11.3).` },
    q3: { sec: 'idea', q: "В 20 городах с самой низкой конверсией за прошлый месяц запустили программу поддержки. Через месяц конверсия выросла. Как это интерпретировать?", opts: [["Программа доказала свою эффективность"], ["Часть роста может объясняться регрессией к среднему", 1], ["Каждый город должен был вернуться к средней конверсии"], ["Рост доказывает ошибку в журнале"]],
      why: "Города выбирали после необычно плохих результатов. Даже без программы следующий месяц в среднем может оказаться ближе к обычному уровню. Для оценки программы нужна подходящая группа сравнения." },
    q4: { sec: 'idea', q: 'Магазин хочет проверить, поднимет ли выручку доставка за 299 ₽ вместо 249 ₽. Какую единицу рандомизации выбрать?', opts: [['Сессию: единиц больше, тест закончится быстрее'], ['Пользователя: человек всё время видит одну цену', 1], ['Просмотр корзины: так точнее всего'], ['День: по чётным дням одна цена, по нечётным — другая']],
      why: 'Решение о покупке тянется через несколько визитов, и человек, увидевший две цены, перезагрузит страницу, будет ждать скидки или пожалуется: эффект смешается, а доверие пострадает. Поэтому для цен делят людей, а точнее аккаунты, чтобы цена не менялась между устройствами. Сессия и просмотр корзины дают больше единиц ценой того же смешения. Дни переключают, когда группы влияют друг на друга (курьеры, общий склад), но здесь один и тот же человек в разные дни увидит разные цены. Если цену видно публично или она влияет на офлайн, делят города.' },
    q5: { sec: 'code', q: "Зачем для каждого эксперимента выбирают свою соль при хешировании user_id?", code: "('x' || substr(md5(s.salt || ':' || e.user_id), 1, 8))::bit(32)::bigint % 100 < 50", lang: 'sql', opts: [["Чтобы скрыть идентификатор пользователя"], ["Чтобы в каждом эксперименте получалось своё разбиение", 1], ["Чтобы обе группы всегда были точно одного размера"]],
      why: "При одинаковом правиле и одной соли человек каждый раз попадал бы в ту же группу. Разные соли позволяют менять разбиение между экспериментами и сохранять назначенный вариант при повторных визитах внутри одного теста." },
    q6: { sec: 'nuances', q: "В reco_block 24 440 участников в A и 23 746 в B. Для проверки пропорции 50/50 получили p = 0,0016. Как читать результат при заранее заданном пороге 0,001?", opts: [["Общий тест выявил дисбаланс при заданном пороге"], ["Общий тест не достиг порога. Стоит проверить полноту записей по платформам и версиям", 1], ["Блок рекомендаций снизил вовлечённость"]],
      why: "Значение 0,0016 выше порога 0,001. Общий тест не исключает отдельных проблем. На Android 3.1.4 в B оказалось лишь 41,5% участников. В учебных данных это связано с потерей записей о показах." },
    q7: { sec: 'nuances', q: "Оценка относительного прироста конверсии в A/B-тесте равна 10%. К кому относится это число?", opts: [["К каждому участнику теста"], ["К отношению конверсий двух групп", 1], ["Только к людям, купившим с новым поиском"]],
      why: "При конверсии 4,0% в A и 4,4% в B относительный прирост равен 10%, а разность — 0,4 п. п. Это сравнение групп. Для одного человека мы наблюдаем результат только с одной версией." }
    },
    glossary: {
      ab: { t: 'A/B-тест', en: 'A/B test, online controlled experiment', d: 'Эксперимент, где пользователей случайно делят на группы и показывают им разные версии продукта.' },
      effect: { t: 'Причинный эффект', en: 'causal effect', d: 'Разница между тем, что случилось с изменением, и тем, что было бы без него.' },
      cf: { t: 'Контрфакт', en: 'counterfactual', d: 'Что было бы без изменения с теми же людьми в те же дни.' },
      rand: { t: 'Рандомизация', en: 'randomization', d: "Случайное назначение варианта каждому участнику или другой единице эксперимента." },
      ctrl: { t: 'Контрольная группа', en: 'control group', d: "Группа, с которой сравнивают вариант с изменением. В примере участники этой группы пользуются старым поиском." },
      treat: { t: 'Тестовая группа', en: 'treatment group', d: 'Группа, которая получает изменение.' },
      unit: { t: 'Единица рандомизации', en: 'randomization unit', d: 'То, что получает группу по жребию: пользователь, сессия, устройство, город, отрезок времени.' },
      trend: { t: 'Тренд', en: 'trend', d: 'Долгое движение метрики в одну сторону: рост аудитории, взросление продукта.' },
      season: { t: 'Сезонность', en: 'seasonality', d: 'Повторяющийся по календарю цикл метрики: дни недели, зарплата, времена года, праздники.' },
      parallel: { t: 'Параллельное событие', en: 'concurrent event', d: 'Всё, что случилось одновременно с изменением: реклама, акция конкурента, поломка.' },
      rtm: { t: 'Регрессия к среднему', en: 'regression to the mean', d: "Если наблюдение выбрали из-за необычно высокого или низкого результата, следующее наблюдение в среднем часто оказывается ближе к обычному уровню." },
      net: { t: 'Сетевой эффект', en: 'interference, network effect', d: 'Влияние групп друг на друга: курьеры, склад, цены и люди общие.' },
      hash: { t: 'Хеш-функция', en: 'hash function', d: 'Функция, которая превращает строку в число, похожее на случайное, но всегда одинаковое для той же строки.' },
      salt: { t: 'Соль', en: 'salt', d: 'Строка, которую добавляют к id перед хешированием, чтобы у каждого эксперимента было своё разбиение.' },
      balance: { t: 'Баланс групп', en: 'covariate balance', d: "Сходство групп по характеристикам, измеренным до назначения варианта." },
      srm: { t: 'Дисбаланс групп', en: 'sample ratio mismatch, SRM', d: "Статистически значимое отклонение численности групп от запланированной пропорции при выбранном уровне значимости. Причину отклонения проверяют отдельно." },
      novelty: { t: 'Эффект новизны', en: 'novelty effect', d: 'Временный всплеск интереса к новому, который угасает за дни или недели.' },
      ate: { t: 'Средний эффект воздействия', en: 'average treatment effect, ATE', d: "Среднее по участникам значение разности между двумя возможными исходами: с изменением и без него." },
      quasi: { t: 'Квазиэксперимент', en: 'quasi-experiment', d: 'Оценка эффекта без жребия: контрфакт строят из наблюдений и предположений.' },
      did: { t: 'Разность разностей', en: 'difference-in-differences', d: 'Изменение у затронутых минус изменение у похожих незатронутых за те же даты.' },
      synth: { t: 'Синтетический контроль', en: 'synthetic control', d: 'Контрфакт из взвешенной смеси незатронутых единиц, подобранной по периоду до изменения.' },
      switch: { t: 'Переключаемые периоды', en: 'switchback', d: 'Эксперимент, где жребий бросают отрезкам времени: версия включается и выключается по расписанию.' }
    },
    materials: [
      ['da-11-1-why-experiment.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/ab/', 'Учебные данные темы 11 — общий набор: пользователи, показы, сессии трёх экспериментов, предпериод; загрузка в PostgreSQL 16, генераторы'],
      ['simulate.py', 'Учебная симуляция магазина со слоями помех'],
      ['runs.py', 'Тысяча прогонов «до и после» против A/B; симуляция из simulate.py уже внутри'],
      ['hash_balance.sql', 'Разбиение по хешу и проверка баланса групп на учебных экспериментах data/ab в PostgreSQL']
    ],
    prompts: [
      ['Разбор своего «до и после»', 'Я опишу изменение в моём продукте и как мы оценили его «до и после». Помоги по источнику перечислить, какие тренды, сезонность, параллельные события и регрессия к среднему могли попасть в оценку. Задавай вопросы по одному.'],
      ['Проверка понимания', 'Задай мне пять вопросов по источнику: контрфакт, что ломает «до и после», рандомизация и баланс групп, единица рандомизации, квазиэксперименты. По одному за раз; после ответа объясни, где я ошибся, со ссылкой на текст.'],
      ['Выбор дизайна', 'Я опишу изменение, которое хочу проверить. Помоги решить, можно ли поставить A/B-тест, какую единицу рандомизации выбрать и что делать, если эксперимент невозможен. Не давай ответ сразу, веди вопросами.']
    ],
    calc: { state: on => { const s = state(on); return [s.ba, s.ab]; }, LAY: LAY.map(l => l.k), CHECK: DATA.check }
  };
})();
