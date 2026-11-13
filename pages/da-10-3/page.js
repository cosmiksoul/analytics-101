/* Страница 10.3 · Когортная окупаемость */
(() => {
  /* Данные — из data/gen_page.py по учебной выгрузке data/unit: для каждого платного канала CAC, 24 месячных прироста
     маржинального дохода на клиента (месяц n — по когортам, дожившим до n), средний чек, маржа в % чека, удержание
     месяцев 1 и 12; эластичность новых клиентов по расходам. */
  /*data:start*/const DATA = {"ch": {"search": {"name": "поиск", "cac": 1505.58, "inc": [522.6341, 140.0095, 119.4107, 100.2349, 80.2531, 101.347, 81.8436, 62.4743, 73.174, 63.791, 75.9755, 60.5037, 66.96, 53.8885, 40.6378, 70.8958, 52.0018, 69.1337, 36.0926, 32.6538, 41.711, 56.964, 33.2166, 25.0909], "aov": 4428, "mr": 22.0, "r1": 35.6, "r12": 12.4}, "social": {"name": "соцсети", "cac": 3053.85, "inc": [204.7603, 41.7941, 36.2182, 21.8026, 15.8902, 24.5454, 27.3796, 15.9279, 17.3012, 12.546, 12.2695, 18.7602, 10.3578, 8.4712, 16.7679, 19.8002, 9.8041, 14.1198, 9.3732, 13.459, 11.9181, 8.957, 1.359, 2.1484], "aov": 3288, "mr": 19.7, "r1": 21.5, "r12": 6.9}, "partners": {"name": "партнёры", "cac": 1262.67, "inc": [898.4774, 99.4424, 82.3957, 67.1313, 48.4425, 49.1567, 50.8355, 50.9255, 38.53, 44.5281, 33.0271, 35.3426, 50.8269, 33.2435, 31.5167, 31.9581, 38.7096, 20.4491, 24.7203, 23.7069, 24.0739, 25.1268, 16.3433, 12.9602], "aov": 4013, "mr": 22.7, "r1": 28.4, "r12": 8.8}}, "beta": {"search": 0.778, "social": 0.609}};/*data:end*/
  /*code:start*/const CODE = {"sql": {"title": "Кривые окупаемости по каналам и когортам", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- 1. Клетка «канал × когорта × месяц жизни n»: размер когорты и её маржинальный доход\nCREATE TEMP TABLE cell AS\nWITH ord AS (                                 -- маржинальный доход заказа по соглашению учебника\n  SELECT client_id,\n         EXTRACT(YEAR FROM order_date) * 12 + EXTRACT(MONTH FROM order_date) AS om,\n         CASE WHEN refunded = 1 THEN -2 * delivery_cost - payment_fee\n              ELSE revenue - cogs - delivery_cost - payment_fee END AS margin\n  FROM orders\n), cohort AS (                                -- когорта = канал + месяц регистрации\n  SELECT client_id, channel, DATE_TRUNC('month', signup_date)::date AS cm,\n         EXTRACT(YEAR FROM signup_date) * 12 + EXTRACT(MONTH FROM signup_date) AS sm\n  FROM clients\n), sizes AS (\n  SELECT channel, cm, sm, COUNT(*) AS size FROM cohort GROUP BY 1, 2, 3\n), by_n AS (\n  SELECT c.channel, c.cm, (o.om - c.sm)::int AS n, SUM(o.margin) AS margin\n  FROM ord o JOIN cohort c USING (client_id)\n  GROUP BY 1, 2, 3\n)\nSELECT s.channel, s.cm, g.n, s.size, COALESCE(b.margin, 0) AS margin\nFROM sizes s\nCROSS JOIN generate_series(0, 23) AS g(n)\nLEFT JOIN by_n b ON b.channel = s.channel AND b.cm = s.cm AND b.n = g.n\nWHERE s.sm + g.n <= 2026 * 12 + 6;            -- только прожитые месяцы: данные кончаются в июне 2026\n\n-- 2. Кривые окупаемости каналов: прирост на клиента — по когортам, дожившим до n\nWITH cac AS (\n  SELECT channel, SUM(spend) / (SELECT COUNT(*) FROM clients c WHERE c.channel = m.channel)::numeric AS cac\n  FROM marketing_spend m GROUP BY channel\n), curve AS (\n  SELECT channel, n, SUM(SUM(margin)::numeric / SUM(size)) OVER (PARTITION BY channel ORDER BY n) AS ltv\n  FROM cell GROUP BY channel, n\n)\nSELECT channel, ROUND(cac) AS cac,\n       ROUND(MAX(ltv - cac) FILTER (WHERE n = 0))  AS bal_0,\n       ROUND(MAX(ltv - cac) FILTER (WHERE n = 5))  AS bal_5,\n       ROUND(MAX(ltv - cac) FILTER (WHERE n = 11)) AS bal_11,\n       ROUND(MAX(ltv - cac) FILTER (WHERE n = 23)) AS bal_23,\n       ROUND(MAX(ltv) FILTER (WHERE n = 11)) AS ltv_12,\n       MIN(n) FILTER (WHERE ltv >= cac) AS payback_n          -- первый месяц, где кривая ≥ 0\nFROM curve JOIN cac USING (channel)\nGROUP BY channel, cac\nORDER BY payback_n NULLS LAST;\n\n-- 3. Те же кривые по когортам поиска: у каждой когорты свой CAC — расходы её месяца\nWITH coh AS (\n  SELECT c.cm, MAX(c.size) AS size, MAX(m.spend)::numeric / MAX(c.size) AS cac,\n         CASE WHEN MAX(c.n) >= 5 THEN SUM(c.margin) FILTER (WHERE c.n <= 5)::numeric / MAX(c.size) END AS ltv_6,\n         CASE WHEN MAX(c.n) >= 11 THEN SUM(c.margin) FILTER (WHERE c.n <= 11)::numeric / MAX(c.size) END AS ltv_12\n  FROM cell c\n  JOIN marketing_spend m ON m.channel = c.channel AND m.month = TO_CHAR(c.cm, 'YYYY-MM')\n  WHERE c.channel = 'поиск'\n  GROUP BY c.cm\n), pay AS (                                   -- первый месяц, где накопленная маржа догнала CAC когорты\n  SELECT c.cm, MIN(c.n) AS payback_n\n  FROM (SELECT cm, n, SUM(margin) OVER (PARTITION BY cm ORDER BY n) AS cum, size FROM cell\n        WHERE channel = 'поиск') c\n  JOIN coh USING (cm)\n  WHERE c.cum >= coh.cac * c.size\n  GROUP BY c.cm\n)\nSELECT TO_CHAR(cm, 'YYYY-MM') AS cohort, size, ROUND(cac) AS cac, ROUND(ltv_6) AS ltv_6,\n       ROUND(ltv_12) AS ltv_12, payback_n\nFROM coh LEFT JOIN pay USING (cm)\nORDER BY cm;", "out": "SELECT 1200\n channel  | cac  | bal_0 | bal_5 | bal_11 | bal_23 | ltv_12 | payback_n \n----------+------+-------+-------+--------+--------+--------+-----------\n партнёры | 1263 |  -364 |   -18 |    236 |    569 |   1498 |         6\n поиск    | 1506 |  -983 |  -442 |    -24 |    555 |   1482 |        12\n соцсети  | 3054 | -2849 | -2709 |  -2605 |  -2478 |    449 |      NULL\n(3 rows)\n\n cohort  | size | cac  | ltv_6 | ltv_12 | payback_n \n---------+------+------+-------+--------+-----------\n 2024-07 |  418 | 1278 |   955 |   1252 |        12\n 2024-08 |  496 | 1726 |  1010 |   1352 |        19\n 2024-09 |  532 | 1415 |  1190 |   1820 |         7\n 2024-10 |  485 | 1336 |  1136 |   1542 |         9\n 2024-11 |  634 | 1454 |  1133 |   1494 |        11\n 2024-12 |  576 | 1085 |  1219 |   1606 |         4\n 2025-01 |  607 | 1554 |  1213 |   1859 |         9\n 2025-02 |  739 | 1560 |   994 |   1418 |        13\n 2025-03 |  494 | 1455 |   955 |   1398 |        12\n 2025-04 |  626 | 1532 |  1004 |   1315 |      NULL\n 2025-05 |  565 | 1577 |  1001 |   1478 |      NULL\n 2025-06 |  496 | 1401 |  1440 |   1932 |         5\n 2025-07 |  594 | 1704 |   983 |   1237 |      NULL\n 2025-08 |  465 | 1520 |   937 |   NULL |      NULL\n 2025-09 |  698 | 1511 |  1020 |   NULL |      NULL\n 2025-10 |  861 | 1672 |  1147 |   NULL |      NULL\n 2025-11 |  730 | 1677 |  1041 |   NULL |      NULL\n 2025-12 | 1004 | 1278 |  1010 |   NULL |      NULL\n 2026-01 |  910 | 1677 |   907 |   NULL |      NULL\n 2026-02 |  703 | 1461 |  NULL |   NULL |      NULL\n 2026-03 |  975 | 1623 |  NULL |   NULL |      NULL\n 2026-04 |  798 | 1564 |  NULL |   NULL |      NULL\n 2026-05 |  514 | 1393 |  NULL |   NULL |      NULL\n 2026-06 |  771 | 1435 |  NULL |   NULL |      NULL\n(24 rows)", "outLabel": "Вывод psql: создание таблицы, каналы, когорты поиска; суммы в ₽ на клиента", "note": "bal_n — накопленный маржинальный доход минус CAC к концу месяца жизни n, payback_n — первый месяц, где он не меньше нуля. NULL — месяц ещё не наступил или когорта не окупилась: так настроен psql (-P null=NULL). Кривые каналов те же, что в сцене и в интерактиве."}, "pandas": {"title": "Сценарный калькулятор: отдача, сценарии, эксперимент, денежный поток", "badge": "проверено: Python 3.13, pandas 3.0.5, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\nimport pandas as pd\n\ncl = pd.read_csv(\"data/unit/clients.csv\", parse_dates=[\"signup_date\"])\nod = pd.read_csv(\"data/unit/orders.csv\", parse_dates=[\"order_date\"])\nsp = pd.read_csv(\"data/unit/marketing_spend.csv\")\nod[\"margin\"] = np.where(od[\"refunded\"] == 1, -2 * od[\"delivery_cost\"] - od[\"payment_fee\"],\n                        od[\"revenue\"] - od[\"cogs\"] - od[\"delivery_cost\"] - od[\"payment_fee\"])\nmonth = lambda d: d.dt.year * 12 + d.dt.month          # сквозной номер месяца\nLAST = 2026 * 12 + 6                                    # июнь 2026 — последний месяц данных\ncl[\"m\"] = month(cl[\"signup_date\"])\nod = od.merge(cl[[\"client_id\", \"channel\", \"m\"]], on=\"client_id\")\nod[\"n\"] = month(od[\"order_date\"]) - od[\"m\"]             # месяц жизни клиента, 0 — месяц регистрации\n\nS = sp.pivot(index=\"month\", columns=\"channel\", values=\"spend\")\nN = pd.crosstab(cl[\"signup_date\"].dt.strftime(\"%Y-%m\"), cl[\"channel\"])\nCAC = S.sum() / N[S.columns].sum()\n\n\ndef increments(ch):\n    \"\"\"Маржинальный доход на клиента в месяц n: только когорты, дожившие до n (как в SQL выше).\"\"\"\n    size = cl[cl[\"channel\"] == ch].groupby(\"m\").size()\n    margin = od[od[\"channel\"] == ch].groupby(\"n\")[\"margin\"].sum()\n    return np.array([margin.get(n, 0) / size[size.index + n <= LAST].sum() for n in range(24)])\n\n\n# 1. Убывающая отдача: новые клиенты ∝ расходы^β, предельный CAC ≈ средний / β\nbeta = {ch: np.polyfit(np.log(S[ch]), np.log(N[ch]), 1)[0] for ch in [\"поиск\", \"соцсети\"]}\nfor ch, b in beta.items():\n    print(f\"{ch}: эластичность {b:.2f}, средний CAC {CAC[ch]:.0f} ₽, предельный ≈ {CAC[ch] / b:.0f} ₽\")\ndS, dN = S[\"соцсети\"].diff()[\"2025-11\"], N[\"соцсети\"].diff()[\"2025-11\"]\nprint(f\"тест таргета, ноябрь 2025 к октябрю: +{dS / 1e6:.2f} млн ₽ и +{dN:.0f} клиентов, по {dS / dN:.0f} ₽ за каждого\\n\")\n\n# 2. Сценарии для поиска: удержание множит месяцы 1–23, чек — все месяцы\ninc = increments(\"поиск\")\no = od[od[\"channel\"] == \"поиск\"]\nM, DLV = o[\"margin\"].mean(), o[\"delivery_cost\"].mean()  # маржа и доставка на заказ\n\n\ndef scenario(ret=1.0, check=1.0, cac=CAC[\"поиск\"]):\n    k_check = (check * (M + DLV) - DLV) / M              # доставка не дешевеет вместе с чеком\n    cum = (inc * np.r_[1.0, np.full(23, ret)] * k_check).cumsum()\n    hit = np.flatnonzero(cum >= cac)\n    return {\"LTV 12\": round(cum[11]), \"LTV 24\": round(cum[23]), \"LTV 24/CAC\": round(cum[23] / cac, 2),\n            \"окупаемость, n\": hit[0] if len(hit) else \"нет\"}\n\n\ntable = pd.DataFrame.from_dict({\"база\": scenario(), \"удержание +10%\": scenario(ret=1.1), \"чек −10%\": scenario(check=0.9),\n                                \"удержание +10%, чек −10%\": scenario(ret=1.1, check=0.9)}, orient=\"index\")\nprint(table.to_string(), \"\\n\")\n\n# 3. Эффект эксперимента в деньгах: +2% к удержанию месяцев 1–11 у новичков года, горизонт 12 месяцев\nyear = cl[cl[\"signup_date\"] >= \"2025-07-01\"][\"channel\"].value_counts()\ngain = pd.Series({ch: year[ch] * 0.02 * increments(ch)[1:12].sum() for ch in year.index})\nprint(f\"+2% к удержанию: поиск +{0.02 * inc[1:12].sum():.1f} ₽ на клиента, \"\n      f\"все {year.sum()} новичков года +{gain.sum() / 1e6:.2f} млн ₽ маржи за 12 месяцев\\n\")\n\n\n# 4. Кассовый разрыв: расходы на поиск растут 12 месяцев, потом держатся; хвост после n = 23 не считаем\ndef cash(growth, b, s0=1.2e6, months=36):\n    s = s0 * (1 + growth) ** np.minimum(np.arange(months), 12)\n    new = s0 / CAC[\"поиск\"] * (s / s0) ** b                 # b = 1 — CAC не растёт с бюджетом\n    cum = (np.convolve(new, inc)[:months] - s).cumsum()     # маржа всех когорт минус расходы, накопленно\n    up = [t for t in range(cum.argmin(), months) if cum[t] >= 0]\n    return {\"расходы с месяца 12, млн ₽\": round(s[12] / 1e6, 2), \"CAC новичков, ₽\": round(s[12] / new[12]),\n            \"дно, млн ₽\": round(cum.min() / 1e6, 1), \"месяц дна\": cum.argmin(), \"в плюсе с месяца\": up[0] if up else \"нет\"}\n\n\nprint(pd.DataFrame.from_dict({\"без роста\": cash(0, 1), \"+10% в месяц, CAC постоянный\": cash(0.10, 1),\n                              \"+10% в месяц, β = 0,78\": cash(0.10, beta[\"поиск\"])}, orient=\"index\").to_string())", "out": "поиск: эластичность 0.78, средний CAC 1506 ₽, предельный ≈ 1935 ₽\nсоцсети: эластичность 0.61, средний CAC 3054 ₽, предельный ≈ 5015 ₽\nтест таргета, ноябрь 2025 к октябрю: +1.23 млн ₽ и +246 клиентов, по 5016 ₽ за каждого\n\n                          LTV 12  LTV 24  LTV 24/CAC  окупаемость, n\nбаза                        1482    2061        1.37              12\nудержание +10%              1578    2215        1.47              10\nчек −10%                    1300    1808        1.20              16\nудержание +10%, чек −10%    1384    1943        1.29              14 \n\n+2% к удержанию: поиск +19.2 ₽ на клиента, все 34514 новичков года +0.61 млн ₽ маржи за 12 месяцев\n\n                              расходы с месяца 12, млн ₽  CAC новичков, ₽  дно, млн ₽  месяц дна в плюсе с месяца\nбез роста                                           1.20             1506        -4.2         11               26\n+10% в месяц, CAC постоянный                        3.77             1506       -11.7         16               31\n+10% в месяц, β = 0,78                              3.77             1941       -19.7         25              нет", "outLabel": "Вывод: четыре расчёта по порядку", "note": "Удержание в сценариях множит приросты месяцев 1–23: в месяц регистрации активны все. Денежный поток считает только 24 месяца жизни когорты — хвост после них не добавлен."}, "plot": {"title": "Один график для маркетинга по правилам 8.4", "badge": "проверено: Python 3.13, pandas 3.0.5, NumPy 2.5.3, Matplotlib 3.10.0", "lang": "python", "code": "import os\n\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\n\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 10, \"axes.spines.top\": False,\n                     \"axes.spines.right\": False, \"axes.spines.left\": False})\nACCENT, DARK, GREY = \"#c2417a\", \"#454f62\", \"#9aa3b2\"\nrows = [\"соцсети\", \"поиск\", \"партнёры\"]                         # снизу вверх: главный ряд — внизу, ближе к оси\nlimit = {ch: increments(ch)[:12].sum() for ch in rows}           # LTV 12 = предел CAC при окупаемости за год\nrub = lambda v: f\"{v:,.0f}\".replace(\",\", \" \") + \" ₽\"\n\nfig, ax = plt.subplots(figsize=(7, 3.3), layout=\"constrained\")\nfor y, ch in enumerate(rows):\n    col = ACCENT if ch == \"соцсети\" else DARK                    # один акцент: канал, который переплачивает\n    lo, hi = sorted([limit[ch], CAC[ch]])\n    ax.plot([lo, hi], [y, y], color=col, linewidth=2.5, alpha=0.35 if col == DARK else 0.6, solid_capstyle=\"butt\")\n    ax.scatter(limit[ch], y, s=70, facecolor=\"white\", edgecolor=col, linewidth=2, zorder=3)\n    ax.scatter(CAC[ch], y, s=70, color=col, zorder=3)\n    for x, text in [(limit[ch], f\"предел {rub(limit[ch])}\"), (CAC[ch], f\"платим {rub(CAC[ch])}\")]:\n        left = x == lo\n        ax.annotate(text, (x, y), xytext=(-9 if left else 9, 0), textcoords=\"offset points\",\n                    ha=\"right\" if left else \"left\", va=\"center\", color=col, fontweight=\"bold\" if col == ACCENT else None)\nm = CAC[\"поиск\"] / beta[\"поиск\"]                                # предельный CAC: следующий клиент поиска\nax.plot([m, m], [0.78, 0.92], color=GREY, linewidth=1.5)\nax.annotate(f\"следующий клиент поиска — {rub(m)}\", (m, 0.78), xytext=(0, -3), textcoords=\"offset points\",\n            ha=\"left\", va=\"top\", color=\"#737c8f\", fontsize=8.5)\nax.set(yticks=range(len(rows)), yticklabels=rows, xlim=(-650, 4300), ylim=(-0.55, 2.5))\nax.set_xticks([0, 1000, 2000, 3000, 4000], labels=[rub(v) for v in [0, 1000, 2000, 3000, 4000]])\nax.tick_params(axis=\"y\", length=0, labelsize=11)\nax.grid(axis=\"x\", color=\"#e8e8e8\", linewidth=0.8)\nax.set_axisbelow(True)\nfig.suptitle(\"За клиента из соцсетей платим 3 054 ₽, а за год он приносит 449 ₽\", x=0.02, ha=\"left\",\n             fontweight=\"bold\", fontsize=11.5)\nax.set_title(\"● — средний CAC, ○ — предел для окупаемости за год: маржинальный доход клиента за 12 месяцев\",\n             loc=\"left\", fontsize=8, color=\"#737c8f\")\nax.set_xlabel(\"Учебные данные магазина, июль 2024 — июнь 2026\", loc=\"left\", fontsize=7.5, color=\"#9aa3b2\")\nfig.savefig(\"payback_limits.svg\")\nprint({ch: (round(CAC[ch]), round(limit[ch])) for ch in rows}, round(os.path.getsize(\"payback_limits.svg\") / 1024, 1), \"КБ\")", "out": "{'соцсети': (3054, 449), 'поиск': (1506, 1482), 'партнёры': (1263, 1498)} 14.7 КБ", "outLabel": "Вывод print; рисунок — под блоком", "note": "Ячейка продолжает предыдущую: CAC, increments и beta уже в памяти. В страницу рисунок вставлен сжатым."}};/*code:end*/

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const sp = n => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const rub = n => (n < -0.5 ? '−' : n > 0.5 ? '+' : '') + sp(n);          // со знаком: −983, +43
  const num = n => (n < -0.5 ? '−' : '') + sp(n);                          // без плюса
  const dec = (v, d = 1) => v.toFixed(d).replace('.', ',');
  const ord = n => `${n + 1}-й`;                                               // n = 12 → «13-й» месяц
  const CH = DATA.ch, KEYS = ['search', 'social', 'partners'];
  const CUM = {};
  KEYS.forEach(k => { let s = 0; CUM[k] = CH[k].inc.map(v => (s += v)); });
  /* баланс когорты к концу месяца n: накопленный маржинальный доход минус CAC; n = −1 — старт, сразу после расхода */
  const bal = (k, n, cac = CH[k].cac) => n < 0 ? -cac : CUM[k][Math.min(23, n)] - cac;
  const payN = (k, cac = CH[k].cac) => { const i = CUM[k].findIndex(v => v >= cac); return i < 0 ? null : i; };

  /* ===================== Сцена ===================== */
  const SC = { teal: '#36b8a6', pink: '#f06ba5', yel: '#e3c04d', red: '#ef6f5e', ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#6f7a91', grid: '#1a2236', zero: '#8d95aa' };
  const COL = { search: SC.teal, social: SC.pink, partners: SC.yel };
  const DOM_A = [-1750, 750], DOM_B = [-3300, 820];
  /* состояние канала на шаге: q — сколько месяцев нарисовано (−1…0 — падение на CAC, 0…24 — месяцы), bars/line — прозрачность */
  function states(k, p) {
    const S = {};
    const on = (key, q, bars, line) => { S[key] = { q, bars, line }; };
    if (k <= 5) {
      const q = [-1 + p, p, 1 + 5 * p, 6 + 6 * p, 12 + p, 13 + 11 * p][k];
      on('search', q, 1, k === 5 ? clamp((p - 0.55) / 0.3, 0, 1) : 0);
    } else on('search', 24, k === 6 ? 1 - clamp(p / 0.3, 0, 1) : 0, 1);
    if (k === 6) on('social', -1 + 2 * clamp((p - 0.3) / 0.7, 0, 1), 1, 0);
    if (k === 7) on('social', 1 + 23 * p, 1, clamp((p - 0.7) / 0.3, 0, 1));
    if (k >= 8) on('social', 24, k === 8 ? 1 - clamp(p / 0.25, 0, 1) : 0, 1);
    if (k === 8) on('partners', -1 + 25 * clamp(p / 0.85, 0, 1), 0, 1);
    if (k >= 9) on('partners', 24, 0, 1);
    return S;
  }
  function lay(W, H, k, p) {
    const nar = W < 480, pl = nar ? 40 : 54, pr = nar ? 8 : 74, pt = 4, pb = 22;
    const t = k < 6 ? 0 : k === 6 ? ease(clamp(p / 0.3, 0, 1)) : 1;
    const lo = lerp(DOM_A[0], DOM_B[0], t), hi = lerp(DOM_A[1], DOM_B[1], t);
    const X = n => pl + (n + 1.6) / 25.2 * (W - pl - pr), Y = v => pt + (hi - v) / (hi - lo) * (H - pt - pb);
    return { nar, W, H, pl, pr, pt, pb, lo, hi, X, Y, t, bw: Math.max(2, (X(1) - X(0)) * 0.62) };
  }
  const tx = (x, y, s, o = {}) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.fs || 11}" fill="${o.c || SC.mut}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.w ? ` font-weight="${o.w}"` : ''}${o.op != null ? ` opacity="${o.op.toFixed(2)}"` : ''}>${s}</text>`;
  function call(L, x, y, s, o = {}) {        // выноска: подпись на тёмной плашке, не выходит за края
    const fs = o.fs || (L.nar ? 10.5 : 11.5), w = s.length * fs * 0.56 + 14, h = fs + 10;
    let X0 = o.a === 'end' ? x - w : o.a === 'middle' ? x - w / 2 : x;
    X0 = clamp(X0, 2, L.W - w - 2);
    const Y0 = clamp(y - h / 2, 2, L.H - h - 2);
    return `<g opacity="${(o.op == null ? 1 : o.op).toFixed(2)}"><rect x="${X0.toFixed(1)}" y="${Y0.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="6" fill="#141b2b" stroke="${o.c || SC.teal}"/>${tx(X0 + 7, Y0 + h / 2 + fs * 0.36, s, { fs, c: SC.ink })}</g>`;
  }
  function axes(L, k, p) {
    let s = '';
    const ticksA = [-1500, -1000, -500, 0, 500], ticksB = [-3000, -2000, -1000, 0];
    [[ticksA, 1 - L.t], [ticksB, L.t]].forEach(([ts, a]) => {
      if (a < 0.02) return;
      ts.forEach(v => { if (v === 0) return; const y = L.Y(v); s += `<line x1="${L.pl}" x2="${L.W - L.pr}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${SC.grid}" opacity="${a.toFixed(2)}"/>` + tx(L.pl - 6, y + 3.5, num(v), { a: 'end', fs: 10, op: a }); });
    });
    const y0 = L.Y(0);
    s += `<line x1="${L.pl}" x2="${L.W - L.pr}" y1="${y0.toFixed(1)}" y2="${y0.toFixed(1)}" stroke="${SC.zero}" stroke-width="1.2"/>` + tx(L.pl - 6, y0 + 3.5, '0 ₽', { a: 'end', fs: 10, c: SC.ink2 });
    if (!L.nar) s += tx(L.W - L.pr + 6, y0 + 3.5, 'окупился', { fs: 10, c: SC.ink2 });
    const yb = L.H - L.pb + 15;
    [0, 6, 12, 18, 23].forEach(n => { s += tx(L.X(n), yb, n ? n : 'n = 0', { a: 'middle', fs: 10 }); });
    return s;
  }
  function bars(L, key, st) {
    if (st.bars <= 0.01) return '';
    let s = '';
    const c = CH[key].cac, q = st.q, a = st.bars;
    const drop = clamp(q + 1, 0, 1), xc = L.X(-1) - L.bw / 2;          // расход на привлечение
    s += `<rect x="${xc.toFixed(1)}" y="${L.Y(0).toFixed(1)}" width="${L.bw.toFixed(1)}" height="${(L.Y(-c * drop) - L.Y(0)).toFixed(1)}" fill="${SC.red}" opacity="${(0.85 * a).toFixed(2)}"/>`;
    for (let n = 0; n < Math.min(24, Math.ceil(q)); n++) {
      const f = clamp(q - n, 0, 1), b0 = bal(key, n - 1), b1 = lerp(b0, bal(key, n), f);
      s += `<rect x="${(L.X(n) - L.bw / 2).toFixed(1)}" y="${L.Y(b1).toFixed(1)}" width="${L.bw.toFixed(1)}" height="${Math.max(0.6, L.Y(b0) - L.Y(b1)).toFixed(1)}" fill="${COL[key]}" opacity="${(0.9 * a).toFixed(2)}"/>`;
      if (n > 0 || f > 0) s += `<line x1="${(L.X(n - 1) + L.bw / 2).toFixed(1)}" x2="${(L.X(n) - L.bw / 2).toFixed(1)}" y1="${L.Y(b0).toFixed(1)}" y2="${L.Y(b0).toFixed(1)}" stroke="${COL[key]}" stroke-width="0.8" opacity="${(0.45 * a).toFixed(2)}"/>`;
    }
    return s;
  }
  function line(L, key, st, o = {}) {
    if (st.line <= 0.01 || st.q < -1) return '';
    const c = o.cac || CH[key].cac, pts = [[L.X(-1), L.Y(-c)]];
    for (let n = 0; n < 24 && n <= st.q; n++) {
      const f = clamp(st.q - n, 0, 1);
      pts.push([L.X(lerp(n - 1, n, f)), L.Y(lerp(bal(key, n - 1, c), bal(key, n, c), f))]);
    }
    if (st.q < 0) pts.push([L.X(-1), L.Y(0)]);
    const d = pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ');
    return `<polyline points="${d}" fill="none" stroke="${COL[key]}" stroke-width="${o.w || 2.6}" stroke-linejoin="round" opacity="${(st.line * (o.op || 1)).toFixed(2)}"${o.dash ? ' stroke-dasharray="5 4"' : ''}/>`;
  }
  const headOf = (key, q) => { const n = clamp(Math.floor(q - 1e-9), -1, 23); return { n, b: bal(key, n) }; };
  const scene = {
    parts: [{ n: '01', name: 'Минус на старте', s: [0, 1] }, { n: '02', name: 'Выползает к нулю', s: [2, 3, 4] }, { n: '03', name: 'Дальше прибыль', s: [5] }, { n: '04', name: 'Дорогой канал', s: [6, 7] }, { n: '05', name: 'Сколько платить', s: [8, 9, 10] }],
    steps: [
      { title: 'Сначала — расход', dur: 2600, body: '<p>За два года поиск обошёлся в&nbsp;23,62&nbsp;млн&nbsp;₽ и&nbsp;привёл 15&nbsp;691 нового клиента: <b>CAC</b> — 1&nbsp;506&nbsp;₽. Деньги потрачены раньше, чем клиент что-то купил.</p><p>Поэтому когорта поиска стартует не&nbsp;с&nbsp;нуля, а&nbsp;с&nbsp;минуса: −1&nbsp;506&nbsp;₽ на&nbsp;каждого клиента.</p>' },
      { title: 'Месяц 0: первая покупка', dur: 2800, body: '<p>В&nbsp;месяц регистрации клиент поиска приносит в&nbsp;среднем 523&nbsp;₽ <b>маржинального дохода</b>: выручка 2&nbsp;034&nbsp;₽ минус себестоимость, доставка и&nbsp;эквайринг.</p><p>Баланс когорты — −983&nbsp;₽ на&nbsp;клиента. Месяц регистрации — нулевой, <i>n</i>&nbsp;=&nbsp;0.</p>' },
      { title: 'Месяцы 1–5: подъём', dur: 3600, body: '<p>Каждый месяц часть клиентов возвращается, и&nbsp;их заказы поднимают кривую: +140, +119, +100, +80, +101&nbsp;₽. К&nbsp;концу месяца 5 баланс — −442&nbsp;₽.</p><p>Ступеньки короче первой: возвращаются не&nbsp;все, и&nbsp;с&nbsp;каждым месяцем всё меньше.</p>' },
      { title: 'Месяцы 6–11: всё медленнее', dur: 3600, body: '<p>За&nbsp;следующие полгода — ещё 418&nbsp;₽, по&nbsp;61–82&nbsp;₽ в&nbsp;месяц. За&nbsp;12 месяцев клиент принёс 1&nbsp;482&nbsp;₽ из&nbsp;потраченных на&nbsp;него 1&nbsp;506.</p><p>Не&nbsp;хватило 24&nbsp;₽: за&nbsp;год поиск не&nbsp;окупился.</p>' },
      { title: 'Месяц 12: ноль пройден', dur: 2800, body: '<p>На&nbsp;тринадцатом месяце баланс становится +43&nbsp;₽: кривая пересекла ноль. Это <b>срок окупаемости</b> когорты — 13 месяцев.</p><p>Всё это время деньги на&nbsp;привлечение заморожены в&nbsp;клиентах.</p>' },
      { title: 'Дальше — прибыль', dur: 4200, body: '<p>За&nbsp;два года клиент поиска приносит 2&nbsp;061&nbsp;₽ — это LTV 24 месяцев, баланс +555&nbsp;₽, LTV/CAC&nbsp;=&nbsp;1,37.</p><p>Линия по&nbsp;вершинам ступенек — <b>кривая окупаемости</b> канала.</p>' },
      { title: 'Соцсети: яма вдвое глубже', dur: 3400, body: '<p>Клиент из&nbsp;соцсетей стоит 3&nbsp;054&nbsp;₽ — вдвое дороже. Покупает реже и&nbsp;дешевле: в&nbsp;месяц регистрации всего 205&nbsp;₽ маржи.</p><p>Когорта стартует с&nbsp;−3&nbsp;054&nbsp;₽, после первого месяца — −2&nbsp;849&nbsp;₽.</p>' },
      { title: 'Два года — и всё ещё −2 478', dur: 4400, body: '<p>В&nbsp;месяц 1 возвращаются 21,5% клиентов соцсетей против 35,6% у&nbsp;поиска, и&nbsp;кривая почти не&nbsp;растёт: за&nbsp;24 месяца — 576&nbsp;₽ из&nbsp;3&nbsp;054.</p><p>Нуля эта когорта не&nbsp;достигнет. Чтобы окупиться хотя&nbsp;бы за&nbsp;два года, CAC пришлось&nbsp;бы снизить в&nbsp;5,3 раза.</p>' },
      { title: 'Партнёры: на седьмом месяце', dur: 3600, body: '<p>Кешбэк-сервисам магазин платит 1&nbsp;400&nbsp;₽ за&nbsp;первый заказ клиента, на&nbsp;каждого зарегистрированного выходит 1&nbsp;263&nbsp;₽. Почти все покупают сразу: месяц 0 даёт 898&nbsp;₽.</p><p>Кривая пересекает ноль на&nbsp;седьмом месяце, <i>n</i>&nbsp;=&nbsp;6.</p>' },
      { title: 'Предел ставки — доход за год', dur: 3600, body: '<p>Чтобы клиент окупился за&nbsp;год, CAC не&nbsp;должен превышать его маржинальный доход за&nbsp;12 месяцев: у&nbsp;поиска это 1&nbsp;482&nbsp;₽, у&nbsp;партнёров — 1&nbsp;498, у&nbsp;соцсетей — 449&nbsp;₽.</p><p>Пунктир — кривая соцсетей при CAC 449&nbsp;₽: она касается нуля в&nbsp;месяце 11.</p>' },
      { title: 'Окупаемость — это месяц', dur: 3800, next: 'Читать страницу', body: '<p>Три канала — три ответа: партнёры окупаются на&nbsp;7-м месяце, поиск — на&nbsp;13-м, соцсети не&nbsp;окупаются. LTV/CAC за&nbsp;два года у&nbsp;партнёров и&nbsp;поиска почти равны, 1,45 и&nbsp;1,37, а&nbsp;деньги возвращаются с&nbsp;разницей в&nbsp;полгода.</p>' }
    ],
    hud: [{ id: 'mo', label: 'Месяц n' }, { id: 'se', label: 'Поиск, ₽' }, { id: 'so', label: 'Соцсети, ₽' }],
    legend: `<span><i class="sq" style="background:${SC.red}"></i>расход на привлечение</span><span><i style="background:${SC.teal}"></i>поиск</span><span><i style="background:${SC.pink}"></i>соцсети</span><span><i style="background:${SC.yel}"></i>партнёры</span>`,
    info: 'ОКУПАЕМОСТЬ',
    aiNote: 'В анимации кривые окупаемости трёх платных каналов учебного магазина (июль 2024 — июнь 2026): баланс когорты на клиента = накопленный маржинальный доход минус CAC. Поиск: CAC 1 506 ₽, месяц 0 даёт 523 ₽, за 12 месяцев 1 482 ₽, окупается на 13-м месяце (n = 12), за 24 месяца 2 061 ₽. Соцсети: CAC 3 054 ₽, за 24 месяца 576 ₽, не окупаются. Партнёры: CAC 1 263 ₽, месяц 0 даёт 898 ₽, окупаются на 7-м месяце. Предел CAC для окупаемости за год: поиск 1 482 ₽, партнёры 1 498 ₽, соцсети 449 ₽.',
    mount(root, api) {
      root.innerHTML = '<svg class="cp-sv" role="img" aria-label="Кривые окупаемости: когорта поиска стартует с минуса в размере CAC и выползает к нулю на 13-м месяце, когорта соцсетей нуля не достигает, партнёры окупаются на 7-м месяце"></svg>';
      const svg = root.firstChild;
      let sig = '';
      return {
        render(k, p) {
          const W = Math.round(svg.clientWidth || 600), H = Math.round(svg.clientHeight || 400);
          const S = states(k, p);
          /* счётчики: месяц того канала, который сейчас рисуется */
          const live = k <= 5 ? 'search' : k <= 7 ? 'social' : 'partners';
          const lq = S[live].q;
          api.hud('mo', k >= 9 ? '23' : k === 0 || lq < 0 ? 'старт' : String(Math.min(23, Math.floor(lq - 1e-9))), k >= 6 && k <= 7 ? 'соцсети' : k === 8 ? 'партнёры' : '');
          const hs = headOf('search', S.search.q);
          api.hud('se', rub(S.search.q < 0 ? -CH.search.cac * clamp(S.search.q + 1, 0, 1) : hs.b), hs.b >= 0 && S.search.q >= 0 ? 'окупился' : '');
          if (S.social && S.social.q > -1 + 1e-6) { const h = headOf('social', S.social.q); api.hud('so', rub(S.social.q < 0 ? -CH.social.cac * clamp(S.social.q + 1, 0, 1) : h.b)); }
          else api.hud('so', '—');
          const key = [k, Math.round(p * 120), W, H].join();
          if (key === sig) return; sig = key;
          const L = lay(W, H, k, p);
          let s = axes(L, k, p);
          if (k >= 9) {                                                    // первый год
            const x = L.X(11.5), a = k === 9 ? clamp(p / 0.3, 0, 1) : 1;
            s += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${L.pt}" y2="${(L.H - L.pb).toFixed(1)}" stroke="${SC.ink2}" stroke-dasharray="3 4" opacity="${(0.7 * a).toFixed(2)}"/>` + tx(x - 5, L.pt + 12, '12 месяцев', { a: 'end', fs: 10.5, c: SC.ink2, op: a });
          }
          ['partners', 'social', 'search'].forEach(ch => { if (S[ch]) s += bars(L, ch, S[ch]); });
          ['partners', 'social', 'search'].forEach(ch => { if (S[ch]) s += line(L, ch, S[ch]); });
          if (k === 9) {                                                   // пунктир: соцсети при CAC = доходу за год
            const a = clamp(p / 0.4, 0, 1);
            s += line(L, 'social', { q: 24, line: a }, { cac: CUM.social[11], dash: 1, w: 2, op: 0.9 });
            s += `<circle cx="${L.X(11).toFixed(1)}" cy="${L.Y(0).toFixed(1)}" r="5" fill="none" stroke="${SC.teal}" stroke-width="2" opacity="${a.toFixed(2)}"/>`;
            if (p > 0.45) {
              const o = clamp((p - 0.45) * 4, 0, 1);
              s += call(L, L.X(11) - 8, L.Y(0) - 22, L.nar ? 'поиск: предел 1 482 ₽' : 'поиск: предел 1 482 ₽, на 24 ₽ ниже CAC', { a: 'end', op: o });
              s += call(L, L.X(4), L.Y(-449) + 22, 'соцсети при CAC 449 ₽', { c: SC.pink, op: o });
            }
          }
          const cl = (cond, from, f) => { if (cond && p > from) s += f(clamp((p - from) * 4, 0, 1)); };
          const Lc = L;
          cl(k === 0, 0.5, o => call(Lc, L.X(-1) + L.bw, L.Y(-CH.search.cac) + 2, 'CAC: −1 506 ₽ на клиента', { c: SC.red, op: o }));
          cl(k === 1, 0.5, o => call(Lc, L.X(0) + L.bw, L.Y(bal('search', 0)) - 16, '+523 ₽ маржи, баланс −983 ₽', { op: o }));
          cl(k === 2, 0.6, o => call(Lc, L.X(5) + L.bw, L.Y(bal('search', 5)) - 18, 'после полугода −442 ₽', { op: o }));
          cl(k === 3, 0.6, o => call(Lc, L.X(11) + L.bw, L.Y(bal('search', 11)) + 22, L.nar ? 'за год 1 482 из 1 506 ₽' : 'за год: 1 482 ₽ из 1 506', { a: L.nar ? 'end' : 'start', op: o }));
          cl(k === 4, 0.45, o => call(Lc, L.X(12) + L.bw, L.Y(0) - 24, 'ноль: 13-й месяц', { a: L.nar ? 'end' : 'start', op: o }));
          cl(k === 5, 0.7, o => call(Lc, L.X(23), L.Y(bal('search', 23)) - 24, 'LTV 24 = 2 061 ₽, +555 ₽', { a: 'end', op: o }));
          cl(k === 6, 0.75, o => call(Lc, L.X(-1) + L.bw, L.Y(-CH.social.cac) + 4, 'соцсети: CAC −3 054 ₽', { c: SC.pink, op: o }));
          cl(k === 7, 0.7, o => call(Lc, L.X(23), L.Y(bal('social', 23)) + 24, 'за 24 месяца 576 из 3 054 ₽', { a: 'end', c: SC.pink, op: o }));
          cl(k === 8, 0.8, o => call(Lc, L.X(6) - 6, L.Y(0) - 22, 'партнёры: 7-й месяц', { a: 'end', c: SC.yel, op: o }));
          if (k === 10) {
            const a = clamp(p / 0.3, 0, 1);
            [['partners', SC.yel], ['search', SC.teal]].forEach(([ch, c]) => { const n = payN(ch); s += `<circle cx="${L.X(n).toFixed(1)}" cy="${L.Y(bal(ch, n)).toFixed(1)}" r="4.5" fill="${c}" opacity="${a.toFixed(2)}"/>`; });
            s += call(L, L.X(6) - 6, L.Y(0) - 22, 'партнёры: 7-й мес.', { a: 'end', c: SC.yel, op: a });
            s += call(L, L.X(12) + 8, L.Y(0) + 24, 'поиск: 13-й мес.', { op: a });
            s += call(L, L.X(23), L.Y(bal('social', 23)) + 24, 'соцсети: −2 478 ₽', { a: 'end', c: SC.pink, op: a });
          }
          svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
          svg.innerHTML = s;
        }
      };
    }
  };

  /* ===================== Интерактив «Ставка за пользователя» ===================== */
  const NAMES = { search: 'поиск', social: 'соцсети', partners: 'партнёры' };
  /* модель: приросты канала × (удержание / удержание в данных, с месяца 1) × (чек / чек в данных) × (маржа / маржа в данных) */
  function modelCum(c, s) {
    const k = (s.aov / c.aov) * (s.mr / c.mr);
    let cum = 0;
    return c.inc.map((v, n) => (cum += v * k * (n ? s.r1 / c.r1 : 1)));
  }
  function buildBid(box, api) {
    const { $, esc } = api;
    const SL = [
      { id: 'cac', label: 'CAC, ₽ за клиента', min: 100, max: 4000, step: 1, f: v => sp(v) + ' ₽', base: c => Math.round(c.cac) },
      { id: 'r1', label: 'Удержание месяца 1', min: 5, max: 60, step: 0.1, f: v => dec(v) + '%', base: c => c.r1 },
      { id: 'aov', label: 'Средний чек', min: 1500, max: 8000, step: 1, f: v => sp(v) + ' ₽', base: c => c.aov },
      { id: 'mr', label: 'Маржа, % чека', min: 5, max: 40, step: 0.1, f: v => dec(v) + '%', base: c => c.mr }
    ];
    box.innerHTML = `<div class="block-hd"><span class="t">Ставка за пользователя <i>интерактив</i></span><div class="ctrls"><div class="seg" role="group" aria-label="Канал">${Object.entries(NAMES).map(([k, v]) => `<button type="button" data-ch="${k}" aria-pressed="${k === 'search'}">${v}</button>`).join('')}</div><button type="button" class="btn ghost small" id="cp-reset">Сбросить</button></div></div>
<p class="hint cp-do">Двигайте ползунки — кривая окупаемости и&nbsp;срок пересчитываются. Задание: найдите максимальный CAC поиска, при котором клиент окупается за&nbsp;12 месяцев. Точно подвести ползунок помогают стрелки ← →.</p>
<div class="cp-wrap"><div class="cp-main"><div class="cp-chart" id="cp-chart"></div>
<div class="readout cp-ro"><div><span class="big" id="cp-pb"></span><span class="lbl" id="cp-pbl"></span></div><div><span class="big" id="cp-y1"></span><span class="lbl">баланс через 12&nbsp;месяцев</span></div><div><span class="big" id="cp-ratio"></span><span class="lbl">LTV 24 / CAC</span></div></div>
<p class="cp-task" id="cp-task" aria-live="polite"></p></div>
<div class="cp-side">${SL.map(o => `<div class="cp-sl"><label for="cp-${o.id}">${o.label}<b id="cp-${o.id}-v"></b></label><input type="range" id="cp-${o.id}" min="${o.min}" max="${o.max}" step="${o.step}"><small id="cp-${o.id}-d"></small></div>`).join('')}</div></div>
<div class="status"><span><span class="dot live"></span><span id="cp-s1"></span></span><span id="cp-s2"></span><span id="cp-s3"></span></div>`;
    let ch = 'search', st = {};
    const setBase = () => { const c = CH[ch]; SL.forEach(o => { st[o.id] = o.base(c); $('cp-' + o.id).value = st[o.id]; }); };
    function chart(cum, real) {
      const el = $('cp-chart'), W = Math.max(260, el.clientWidth), H = W < 520 ? 230 : 270, cac = st.cac;
      const nar = W < 520, pl = nar ? 46 : 56, pr = 12, pt = 18, pb = 24;
      const bs = cum.map(v => v - cac), br = real.map(v => v - CH[ch].cac);
      let lo = Math.min(-cac, ...bs, ...br), hi = Math.max(0, ...bs, ...br);
      const span = hi - lo, stp = [250, 500, 1000, 2000, 5000].find(x => span / x <= 6) || 10000;
      lo = Math.floor((lo - span * 0.04) / stp) * stp; hi = Math.ceil((hi + span * 0.06) / stp) * stp;
      const X = n => pl + (n + 1.4) / 24.8 * (W - pl - pr), Y = v => pt + (hi - v) / (hi - lo) * (H - pt - pb);
      const pts = b => [[X(-1), Y(-cac)]].concat(b.map((v, n) => [X(n), Y(v)]));
      const path = P => P.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ');
      let s = `<rect x="${X(-1.4).toFixed(1)}" y="${pt}" width="${(X(11.5) - X(-1.4)).toFixed(1)}" height="${H - pt - pb}" class="cp-year"/>`;
      s += `<text x="${(X(11.5) - 6).toFixed(1)}" y="${pt + 12}" text-anchor="end" class="cp-ax">первые 12 месяцев</text>`;
      for (let v = lo; v <= hi + 1e-6; v += stp) s += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="${v === 0 ? 'cp-zero' : 'cp-grid'}"/><text x="${pl - 6}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end" class="cp-ax${v === 0 ? ' cp-ax0' : ''}">${num(v)}</text>`;
      [0, 6, 12, 18, 23].forEach(n => { s += `<text x="${X(n).toFixed(1)}" y="${H - 6}" text-anchor="middle" class="cp-ax">${n ? n : 'n = 0'}</text>`; });
      const P = pts(bs);
      const debt = [[X(-1), Y(0)]].concat(P.map(([x, y]) => [x, Math.min(y, 1e9) > Y(0) ? y : Y(0)])).concat([[X(23), Y(0)]]);
      s += `<polygon points="${path(debt)}" class="cp-debt"/>`;
      const same = br.every((v, i) => Math.abs(v - bs[i]) < 0.5);
      if (!same) s += `<polyline points="${path(pts(br).map((q, i) => i ? q : [X(-1), Y(-CH[ch].cac)]))}" class="cp-real"/>` + `<text x="${(X(23) - 2).toFixed(1)}" y="${(Y(br[23]) + (br[23] > bs[23] ? -7 : 13)).toFixed(1)}" text-anchor="end" class="cp-ax">данные</text>`;
      s += `<polyline points="${path(P)}" class="cp-model"/>`;
      const n = bs.findIndex(v => v >= 0);
      if (n >= 0) {
        const x = X(n), y = Y(bs[n]), lb = `окупился: ${ord(n)} месяц`, w = lb.length * 6.6 + 8;
        s += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${Y(0).toFixed(1)}" y2="${(H - pb).toFixed(1)}" class="cp-pbline"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" class="cp-dot"/>`;
        const tx0 = clamp(x + 8, pl + 2, W - pr - w);
        s += `<text x="${tx0.toFixed(1)}" y="${(Y(0) + 16).toFixed(1)}" class="cp-lbl">${lb}</text>`;
      } else s += `<text x="${(X(23) - 2).toFixed(1)}" y="${(Y(bs[23]) - 8).toFixed(1)}" text-anchor="end" class="cp-lbl cp-neg">через 24 месяца ${num(bs[23])} ₽</text>`;
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`Кривая окупаемости канала ${NAMES[ch]} при CAC ${sp(cac)} ₽`)}">${s}</svg>`;
      return n;
    }
    let last = {};
    function draw() {
      const c = CH[ch], cum = modelCum(c, st), real = CUM[ch], cac = st.cac;
      const n = chart(cum, real);
      SL.forEach(o => {
        $('cp-' + o.id + '-v').textContent = o.f(st[o.id]);
        const b = o.base(c);
        $('cp-' + o.id + '-d').textContent = o.id === 'r1' ? `в данных ${o.f(b)}; месяц 12 в модели — ${dec(c.r12 * st.r1 / c.r1)}%` : `в данных ${o.f(b)}`;
      });
      $('cp-pb').textContent = n >= 0 ? `${ord(n)} мес.` : 'нет';
      $('cp-pbl').textContent = n >= 0 ? `окупаемость, n = ${n}` : 'не за 24 месяца';
      const y1 = cum[11] - cac;                                         // у нуля — с десятыми, чтобы «0 ₽» не спорил со «не окупается»
      $('cp-y1').textContent = (Math.abs(y1) < 10 ? (y1 < 0 ? '\u2212' : '+') + api.fmt(Math.abs(y1), 1) : rub(y1)) + ' ₽';
      $('cp-y1').classList.toggle('neg', y1 < 0);
      $('cp-ratio').textContent = dec(cum[23] / cac, 2);
      const t = $('cp-task');
      if (cac > cum[11]) { t.className = 'cp-task'; t.textContent = `За 12 месяцев не окупается: клиент приносит ${api.fmt(cum[11], cac - cum[11] < 10 ? 1 : 0)} ₽ — меньше, чем стоит. Снижайте CAC.`; }
      else if (cac + 1 > cum[11]) { t.className = 'cp-task ok'; t.textContent = `Это максимум: ${sp(cac)} ₽. Ещё рубль — и окупаемость уйдёт за год. Максимальный CAC равен маржинальному доходу клиента за 12 месяцев (${api.fmt(cum[11], 1)} ₽).`; }
      else { t.className = 'cp-task'; t.textContent = 'За 12 месяцев окупается, но платить можно больше — поднимайте CAC.'; }
      $('cp-s1').textContent = `Модель: кривая канала «${NAMES[ch]}» × ползунки`;
      $('cp-s2').textContent = `CAC ${sp(cac)} ₽`;
      $('cp-s3').textContent = n >= 0 ? `окупаемость: ${ord(n)} месяц` : 'не окупается за 24 месяца';
      last = { n, l12: cum[11], l24: cum[23] };
    }
    SL.forEach(o => $('cp-' + o.id).addEventListener('input', e => { st[o.id] = +e.target.value; draw(); }));
    box.querySelectorAll('[data-ch]').forEach(b => b.addEventListener('click', () => { ch = b.dataset.ch; box.querySelectorAll('[data-ch]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); setBase(); draw(); }));
    $('cp-reset').addEventListener('click', () => { ch = 'search'; box.querySelectorAll('[data-ch]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.ch === 'search'))); setBase(); draw(); });
    setBase(); draw();
    if ('ResizeObserver' in window) { let lw = 0; new ResizeObserver(() => { const w = box.clientWidth; if (Math.abs(w - lw) > 4) { lw = w; draw(); } }).observe(box); }
    return {
      redraw: draw,
      describe() {
        const c = CH[ch];
        return `канал: ${NAMES[ch]}; CAC ${Math.round(st.cac)} ₽ (в данных ${Math.round(c.cac)}); удержание месяца 1 ${dec(st.r1)}% (в данных ${dec(c.r1)}); средний чек ${st.aov} ₽ (в данных ${c.aov}); маржа ${dec(st.mr)}% чека (в данных ${dec(c.mr)}); срок окупаемости: ${last.n >= 0 ? ord(last.n) + ' месяц, n = ' + last.n : 'не окупается за 24 месяца'}; LTV 12 = ${Math.round(last.l12)} ₽, LTV 24 = ${Math.round(last.l24)} ₽.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-10-3',
    short: 'DA-10',
    title: 'Когортная окупаемость',
    where: 'блок «Дата аналитика», тема 10 «Юнит-экономика», страница 10.3',
    aiData: 'учебная «финансовая» выгрузка интернет-магазина за июль 2024 — июнь 2026: 60 504 клиента с каналом привлечения, заказы с маржинальным доходом, расходы на поиск, соцсети и партнёров по месяцам',
    scene,
    widgets: { bid: buildBid },
    code: CODE,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'Поиск окупается на 13-м месяце, а финансы хотят окупаемость за год. Насколько надо снизить CAC поиска, если удержание, чек и маржа не изменятся?', opts: [['Примерно на четверть, до 1 130 ₽'], ['Меньше чем на 2%, примерно до 1 480 ₽', 1], ['Вдвое: срок окупаемости пропорционален CAC'], ['Никак: срок окупаемости зависит только от удержания']],
      why: 'За 12 месяцев клиент поиска приносит 1 481,7 ₽ маржинального дохода — на 24 ₽ меньше нынешнего CAC. Значит, достаточно CAC 1 481 ₽, на 1,6% ниже. Срок не пропорционален CAC: к концу года кривая пологая, и маленький сдвиг CAC переносит пересечение нуля на месяц и больше. В обратную сторону так же: CAC +10% (1 657 ₽) отодвигает окупаемость с 13-го месяца на 16-й. Удержание — не единственный рычаг. Проверьте в интерактиве.' },
    q2: { sec: 'idea', q: 'В сцене клиент поиска за 12 месяцев принёс 1 482 ₽ маржинального дохода при CAC 1 506 ₽. Что это значит?', opts: [['Поиск убыточен, канал надо отключать'], ['Поиск окупается на 13-м месяце: за год деньги не вернулись, а на втором году клиент приносит прибыль', 1], ['Поиск окупился: 1 482 и 1 506 — почти одно и то же'], ['Надо смотреть выручку: 5 392 ₽ за год, в 3,6 раза больше CAC']],
      why: 'Кривая поиска пересекает ноль на 13-м месяце (n = 12), а за два года даёт +555 ₽ на клиента: канал прибыльный, но медленный. «Почти одно и то же» — не окупился: 24 ₽ на клиента при 15 691 клиенте — это 0,38 млн ₽, которые ещё не вернулись к концу года. Выручка не годится: из неё ещё надо оплатить себестоимость, доставку и эквайринг, поэтому выручка за год больше CAC в 3,6 раза, а маржа — нет.' },
    q3: { sec: 'idea', q: 'Агентство пишет: «LTV/CAC = 3, канал прибыльный». Почему канал может быть убыточным?', opts: [['LTV посчитан по выручке: маржинальный доход в учебном магазине в 3,6 раза меньше, и по марже это 0,83', 1], ['При LTV/CAC = 3 убытка не бывает: это правило Скока'], ['LTV/CAC = 3 убыточен только у подписок'], ['Отношение надо считать наоборот, CAC/LTV']],
      why: 'Отношение зависит от того, что в числителе. По выручке LTV в 3,4–3,9 раза больше, чем по марже, поэтому 3 по выручке — это около 0,83 по марже: рубль привлечения возвращает 83 копейки. Скок называет «больше трёх» ориентиром для SaaS с высокой маржой, а не законом. Есть и другие причины: горизонт LTV (за 12 и за 24 месяца — разные числа) и срок, за который деньги вернутся. Перевернуть дробь ничего не меняет.' },
    q4: { sec: 'idea', q: 'Маркетинг год подряд поднимает расходы на поиск на 10% в месяц. Каждая когорта поиска окупается. Почему компании может не хватить денег?', opts: [['Не может: если когорты окупаются, деньги прибывают'], ['Расход платят сразу, а маржа возвращается больше года: расходы растущего месяца больше, чем приносят прошлые, меньшие когорты', 1], ['Растёт эквайринг'], ['LTV/CAC при росте падает до нуля']],
      why: 'Это кассовый разрыв. В модели страницы при постоянном бюджете накопленный денежный поток уходит до −4,2 млн ₽ и возвращается в плюс на 26-м месяце. При росте на 10% в месяц даже с прежним CAC дно — −11,7 млн ₽, а с убывающей отдачей −19,7 млн ₽, и за три года плюса нет. Когорты окупаются, но позже, чем приходят счета. Эквайринг — доля оплаты, он ни при чём. LTV/CAC при росте снижается из-за дорожающих клиентов, но остаётся выше единицы.' },
    q5: { sec: 'idea', q: 'A/B-тест показал «+2% к удержанию». Как перевести это в деньги?', opts: [['Умножить годовую выручку магазина на 2%'], ['Умножить маржинальный доход клиента за месяцы 1–11 на 0,02 и на число новичков за год — и уточнить, проценты это или пункты', 1], ['Прибавить 0,02 к LTV/CAC'], ['Умножить CAC на 1,02']],
      why: 'Удержание множит доход месяцев после регистрации, поэтому эффект — 2% от маржи месяцев 1–11: у поиска это +19,2 ₽ на клиента, на 34 514 новичков года — +0,61 млн ₽ за 12 месяцев, если эффект держится весь год. Если «+2» — пункты удержания месяца 1 (35,6 → 37,6%), это +5,6% в относительных единицах и 1,74 млн ₽. Выручка — не маржа, а к CAC удержание отношения не имеет.' },
    q6: { sec: 'code', q: 'Что означает число 0,61 из этой строки блока pandas для соцсетей?', code: 'beta = {ch: np.polyfit(np.log(S[ch]), np.log(N[ch]), 1)[0] for ch in ["поиск", "соцсети"]}', lang: 'python', opts: [['Расходы +1% дают около +0,61% новых клиентов: каждый следующий клиент дороже, предельный CAC ≈ средний / 0,61', 1], ['Каждый рубль расходов приносит 0,61 клиента'], ['61% клиентов соцсетей уходят в первый месяц'], ['Корреляция расходов и новых клиентов равна 0,61']],
      why: 'polyfit в логарифмах оценивает наклон прямой log(новые) = a + β · log(расходы): это эластичность. β < 1 — убывающая отдача, и предельный CAC выше среднего в 1/β раза: у соцсетей 3 054 / 0,61 ≈ 5 015 ₽, ноябрьский тест дал 5 016 ₽. Клиентов на рубль — это 1 / CAC, а не β. Отток и корреляция — другие величины: наклон в логарифмах не равен коэффициенту корреляции.' },
    q7: { sec: 'nuances', q: 'Когорта поиска декабря 2024 года окупилась на 5-м месяце, на 8 месяцев раньше средней. Что из этого следует?', opts: [['Окупаемость поиска улучшилась, можно поднимать бюджет весь год'], ['В декабре на тот же рубль приходит больше людей; это сезон, и сравнивать надо с прошлым декабрём, а не переносить срок на весь год', 1], ['Декабрьские клиенты удерживаются лучше, их надо искать весь год'], ['Это ошибка в данных, когорту надо выбросить']],
      why: 'Декабрьские когорты поиска дешевле: 1 085 ₽ в 2024 году и 1 278 ₽ в 2025-м против 1 506 ₽ в среднем — перед праздниками реклама приводит больше новичков на рубль. Удерживаются они примерно как остальные, быстрая окупаемость — заслуга дешёвого прихода. Летом наоборот: августовская когорта стоила 1 726 ₽ и окупилась на 20-м месяце. Выбрасывать когорту незачем, её сравнивают с той же частью прошлого года.' }
    },
    glossary: {
      cac: { t: 'CAC', en: 'customer acquisition cost', d: 'Стоимость привлечения: расходы канала на одного привлечённого клиента.' },
      cohortpay: { t: 'Когортная окупаемость', en: 'cohort payback', d: 'Когда маржа когорты догоняет деньги, потраченные на её привлечение.' },
      cohort: { t: 'Когорта привлечения', en: 'acquisition cohort', d: 'Клиенты одного канала, пришедшие в один месяц.' },
      margin: { t: 'Маржинальный доход', en: 'contribution margin', d: 'Выручка без переменных затрат заказа: себестоимости, доставки, эквайринга.' },
      paycurve: { t: 'Кривая окупаемости', en: 'payback curve', d: 'Накопленный маржинальный доход на клиента минус CAC по месяцам жизни когорты.' },
      payback: { t: 'Срок окупаемости', en: 'payback period', d: 'Месяц, в котором кривая окупаемости впервые не ниже нуля.' },
      ltv: { t: 'LTV с горизонтом', en: 'lifetime value, 12/24-month LTV', d: 'Маржинальный доход клиента за выбранный срок, например 12 или 24 месяца.' },
      ltvcac: { t: 'LTV/CAC', en: 'LTV to CAC ratio', d: 'Во сколько раз доход клиента за горизонт больше цены его привлечения.' },
      cashgap: { t: 'Кассовый разрыв', en: 'cash gap, cash flow trough', d: 'Нехватка денег на текущие платежи, когда расходы приходят раньше доходов.' },
      marginal: { t: 'Предельный CAC', en: 'marginal CAC', d: 'Цена следующего клиента: прирост расходов, делённый на прирост клиентов.' },
      blended: { t: 'Смешанный CAC', en: 'blended CAC', d: 'Все расходы на маркетинг, делённые на всех новичков, включая органику.' },
      diminishing: { t: 'Убывающая отдача канала', en: 'diminishing returns', d: 'Каждый следующий рубль в канале приводит меньше клиентов, чем предыдущий.' },
      elasticity: { t: 'Эластичность', en: 'elasticity', d: 'На сколько процентов меняется одна величина, когда другая меняется на 1%.' },
      scenario: { t: 'Сценарный анализ', en: 'scenario analysis', d: 'Пересчёт показателей при заданных изменениях входов: «что, если».' },
      attribution: { t: 'Атрибуция', en: 'attribution', d: 'Правило, по которому приход клиента записывают на канал или делят между каналами.' },
      incrementality: { t: 'Тест на приращение', en: 'incrementality test, lift test', d: 'Эксперимент, где рекламу выключают для части аудитории, чтобы измерить её вклад.' },
      mmm: { t: 'Маркетинг-микс моделирование', en: 'marketing mix modeling, MMM', d: 'Модель продаж от расходов по всем каналам сразу, с насыщением и запаздыванием.' }
    },
    materials: [
      ['da-10-3-cohort-payback.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/unit/', 'Учебные данные темы 10 — общий набор: клиенты, заказы, активность по месяцам, расходы на маркетинг; загрузка в PostgreSQL 16, генератор'],
      ['payback.sql', 'Кривые окупаемости по каналам и когортам для PostgreSQL 16'],
      ['payback.ipynb', 'Сценарный калькулятор, денежный поток и график для маркетинга на pandas и Matplotlib']
    ],
    prompts: [
      ['Предел ставки', 'Я опишу канал: CAC, удержание, чек и маржу. Вопросами помоги мне найти максимальный CAC при окупаемости за год. Ответ не называй.'],
      ['Кассовый разрыв', 'Дай три плана роста рекламного бюджета. Я прикину, как глубоко уйдёт накопленный денежный поток, а ты проверишь логику вопросами.'],
      ['Эффект в деньгах', 'Дай три результата A/B-тестов, в процентах и в пунктах. Я переведу каждый в маржинальный доход за год, а ты найдёшь мои ошибки.']
    ]
  };
})();
