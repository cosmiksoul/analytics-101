/* Страница 10.2 · LTV через удержание */
(() => {
  /* Данные — из data/gen_page.py по учебной выгрузке data/unit: удержание r(n) и маржа на активного m(n) 12 когорт
     июля 2024 — июня 2025, подгонки хвостов (scipy.optimize.curve_fit) и контрольные LTV, посчитанные в Python. */
  /*data:start*/const DATA = {"sc":{"size":25990,"r":[1.0,0.35429,0.27522,0.23109,0.20104,0.17776,0.1631,0.15391,0.14336,0.13509,0.1319,0.12709,0.11824],"m":[542.51,384.0,397.86,381.41,402.59,428.59,446.74,434.72,427.99,427.26,470.83,461.28,493.31],"mtail":474.66,"fit":{"pow":[0.361219,0.436112],"exp":[0.347209,0.109128],"plat":[0.121118,0.325132,0.352281]},"ltv":{"pow":{"24":2011,"36":2484},"exp":{"24":1741,"36":1826},"plat":{"24":2109,"36":2799}},"boot":{"lo12":1353,"hi12":1473,"lo24":1900,"hi24":2111},"disc24":1809,"disc12":1348,"d":0.01531},"w":[{"key":"all","name":"12 когорт","size":25990,"r":[1.0,0.35429,0.27522,0.23109,0.20104,0.17776,0.1631,0.15391,0.14336,0.13509,0.1319,0.12709,0.11824],"m":[542.51,384.0,397.86,381.41,402.59,428.59,446.74,434.72,427.99,427.26,470.83,461.28,493.31],"mbar":424.41,"fit":{"pow":[0.358816,0.421459],"exp":[0.400662,0.165769],"plat":[0.139632,0.328137,0.429833]},"real12":1412.89,"mae":{"pow":0.0054,"exp":0.0486,"plat":0.0118},"chk":{"pow":{"6":1033.32,"12":1410.09,"24":1963.74,"36":2404.47},"exp":{"6":1033.32,"12":1302.73,"24":1434.18,"36":1452.16},"plat":{"6":1033.32,"12":1419.87,"24":2133.28,"36":2844.42}}},{"key":"h2","name":"июль–дек. 2024","size":12254,"r":[1.0,0.36486,0.2848,0.23829,0.21283,0.18622,0.16558,0.15946,0.15138,0.13979,0.13889,0.12918,0.12535],"m":[526.15,379.69,409.5,369.63,390.64,402.96,394.31,430.01,400.88,365.98,464.49,475.88,496.98],"mbar":395.78,"fit":{"pow":[0.369887,0.416333],"exp":[0.412696,0.163871],"plat":[0.139235,0.333568,0.399682]},"real12":1399.27,"mae":{"pow":0.0056,"exp":0.0502,"plat":0.0079},"chk":{"pow":{"6":1027.58,"12":1388.29,"24":1928.29,"36":2359.36},"exp":{"6":1027.58,"12":1284.79,"24":1414.86,"36":1433.07},"plat":{"6":1027.58,"12":1389.51,"24":2054.07,"36":2715.37}}},{"key":"h1","name":"янв.–июнь 2025","size":13736,"r":[1.0,0.34486,0.26667,0.22467,0.19052,0.17021,0.16089,0.14895,0.13621,0.1309,0.12566,0.12522,0.1119],"m":[557.1,388.07,386.78,392.55,414.5,453.6,494.88,439.22,454.87,485.65,477.08,447.83,489.64],"mbar":452.05,"fit":{"pow":[0.348946,0.426366],"exp":[0.389956,0.167602],"plat":[0.138966,0.324219,0.456635]},"real12":1425.04,"mae":{"pow":0.0052,"exp":0.0472,"plat":0.0148},"chk":{"pow":{"6":1038.45,"12":1429.53,"24":1995.13,"36":2444.17},"exp":{"6":1038.45,"12":1318.61,"24":1451.03,"36":1468.75},"plat":{"6":1038.45,"12":1446.85,"24":2202.35,"36":2956.19}}},{"key":"jul","name":"июль 2024","size":1650,"r":[1.0,0.35576,0.26424,0.22667,0.20909,0.19879,0.1703,0.16909,0.15697,0.14182,0.13939,0.13212,0.12182],"m":[506.55,307.65,316.6,324.9,261.06,444.43,279.21,320.86,341.91,266.15,517.67,240.1,479.28],"mbar":329.45,"fit":{"pow":[0.353124,0.388363],"exp":[0.384088,0.146744],"plat":[0.173531,0.330819,0.609792]},"real12":1213.33,"mae":{"pow":0.0062,"exp":0.0452,"plat":0.0316},"chk":{"pow":{"6":916.23,"12":1213.28,"24":1677.7,"36":2054.15},"exp":{"6":916.23,"12":1136.34,"24":1268.31,"36":1290.99},"plat":{"6":916.23,"12":1252.82,"24":1939.02,"36":2625.07}}}]};/*data:end*/
  /*code:start*/const CODE = {"sql": {"title": "LTV когорт из таблицы заказов", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- LTV когорт июля 2024 — июня 2025 из таблицы заказов, ₽ на зарегистрированного клиента\nWITH cohorts AS (\n  SELECT client_id, date_trunc('month', signup_date)::date AS cohort\n  FROM clients\n),\norder_margin AS (                -- маржинальный доход и чистая выручка заказа, месяц жизни n\n  SELECT o.client_id,\n         CASE WHEN o.refunded = 1 THEN -2 * o.delivery_cost - o.payment_fee\n              ELSE o.revenue - o.cogs - o.delivery_cost - o.payment_fee END AS margin,\n         CASE WHEN o.refunded = 1 THEN 0 ELSE o.revenue END AS net,\n         (EXTRACT(YEAR FROM o.order_date) - EXTRACT(YEAR FROM c.cohort)) * 12\n           + EXTRACT(MONTH FROM o.order_date) - EXTRACT(MONTH FROM c.cohort) AS n\n  FROM orders o\n  JOIN cohorts c USING (client_id)\n),\nper_cohort AS (                  -- клиенты без заказов остаются в знаменателе: LEFT JOIN\n  SELECT c.cohort,\n         count(DISTINCT c.client_id)            AS clients,\n         sum(m.margin) FILTER (WHERE m.n < 6)  AS margin6,\n         sum(m.margin) FILTER (WHERE m.n < 12) AS margin12,\n         sum(m.net)    FILTER (WHERE m.n < 12) AS net12\n  FROM cohorts c\n  LEFT JOIN order_margin m USING (client_id)\n  WHERE c.cohort BETWEEN '2024-07-01' AND '2025-06-01'\n  GROUP BY c.cohort\n)\nSELECT to_char(cohort, 'YYYY-MM') AS cohort, clients,\n       round(margin6::numeric / clients)  AS ltv6,    -- без ::numeric bigint / bigint делится нацело\n       round(margin12::numeric / clients) AS ltv12,\n       round(net12::numeric / clients)    AS ltv12_net\nFROM per_cohort\nUNION ALL                        -- вся группа: сумма маржи / сумма клиентов, а не среднее 12 чисел\nSELECT 'все 12', sum(clients), round(sum(margin6) / sum(clients)),\n       round(sum(margin12) / sum(clients)), round(sum(net12) / sum(clients))\nFROM per_cohort\nORDER BY cohort;", "out": " cohort  | clients | ltv6 | ltv12 | ltv12_net \n---------+---------+------+-------+-----------\n 2024-07 |    1650 |  916 |  1213 |      4467\n 2024-08 |    1789 |  977 |  1328 |      4849\n 2024-09 |    2015 | 1076 |  1500 |      5414\n 2024-10 |    2047 | 1070 |  1408 |      5158\n 2024-11 |    2227 | 1081 |  1469 |      5311\n 2024-12 |    2526 | 1017 |  1422 |      5143\n 2025-01 |    2231 | 1160 |  1639 |      5781\n 2025-02 |    2319 | 1031 |  1426 |      5111\n 2025-03 |    2181 |  998 |  1382 |      4993\n 2025-04 |    2455 | 1027 |  1341 |      4877\n 2025-05 |    2320 |  929 |  1271 |      4581\n 2025-06 |    2230 | 1090 |  1505 |      5412\n все 12  |   25990 | 1033 |  1413 |      5104\n(13 rows)", "outLabel": "Вывод psql: 12 когорт и вся группа, ₽ на зарегистрированного клиента", "note": "Строка «все 12» — сумма маржи, делённая на всех клиентов группы, а не среднее двенадцати чисел: когорты разного размера. Те же числа дают pandas ниже, сцена и интерактив."}, "fit": {"title": "Хвост через scipy.optimize.curve_fit", "badge": "проверено: Python 3.13, pandas 3.0.5, SciPy 1.18.1, Matplotlib 3.10.0", "lang": "python", "code": "import numpy as np\nimport pandas as pd\nfrom scipy.optimize import curve_fit\n\nclients = pd.read_csv(\"data/unit/clients.csv\", parse_dates=[\"signup_date\"])\norders = pd.read_csv(\"data/unit/orders.csv\", parse_dates=[\"order_date\"])\nactivity = pd.read_csv(\"data/unit/activity.csv\")\n\n# маржинальный доход заказа по соглашению темы 10\norders[\"margin\"] = np.where(orders.refunded == 1,\n                            -2 * orders.delivery_cost - orders.payment_fee,\n                            orders.revenue - orders.cogs - orders.delivery_cost - orders.payment_fee)\n# месяц жизни n: 0 — месяц регистрации\nclients[\"cohort\"] = clients.signup_date.dt.strftime(\"%Y-%m\")\nc = clients.set_index(\"client_id\")\nstart = c.signup_date.dt.year * 12 + c.signup_date.dt.month\nactivity[\"n\"] = (activity.month.str[:4].astype(int) * 12 + activity.month.str[5:].astype(int)\n                 - activity.client_id.map(start))\norders[\"n\"] = orders.order_date.dt.year * 12 + orders.order_date.dt.month - orders.client_id.map(start)\n\n# 12 когорт июля 2024 — июня 2025: месяцы жизни 0–12 есть у всех\ngrp = clients[clients.cohort.between(\"2024-07\", \"2025-06\")]\nsize = grp.groupby(\"cohort\").size()\npick = lambda t: t[t.client_id.isin(grp.client_id) & (t.n <= 12)].assign(cohort=lambda d: d.client_id.map(c.cohort))\nact = pick(activity).pivot_table(index=\"cohort\", columns=\"n\", values=\"client_id\", aggfunc=\"count\")\nmarg = pick(orders).pivot_table(index=\"cohort\", columns=\"n\", values=\"margin\", aggfunc=\"sum\", fill_value=0)\nr = act.sum() / size.sum()            # удержание группы: доля новичков, активных в месяц n\nm = marg.sum() / act.sum()            # маржа на активного клиента в месяц n\n\n\ndef power(n, a, b):                   # степенная: отток со временем замедляется\n    return a * n ** -b\n\n\ndef expo(n, a, k):                    # экспонента: каждый месяц уходит одна и та же доля\n    return a * np.exp(-k * n)\n\n\ndef plateau(n, p, q, k):              # кривая выходит на уровень p\n    return p + q * np.exp(-k * n)\n\n\nmodels = {\"степенная\": (power, (0.4, 0.5)), \"экспонента\": (expo, (0.4, 0.1)), \"плато\": (plateau, (0.15, 0.3, 0.5))}\n\n# 1) подгоняем по месяцам 1–6 и сверяем с месяцами 7–12\nn6, n7 = np.arange(1, 7), np.arange(7, 13)\nfit6 = {k: curve_fit(f, n6, r.loc[n6], p0=p0)[0] for k, (f, p0) in models.items()}\ncheck = pd.DataFrame({\"факт\": r.loc[n7]} | {k: models[k][0](n7, *p) for k, p in fit6.items()}) * 100\nprint(check.round(1))\nprint(\"средняя ошибка, п. п.:\", check.drop(columns=\"факт\").sub(check[\"факт\"], axis=0).abs().mean().round(2).to_dict())\n\n# 2) подгоняем по всем месяцам 1–12 и дорисовываем хвост до 24 и 36 месяцев\nfit12 = {k: curve_fit(f, np.arange(1, 13), r.loc[1:], p0=p0)[0] for k, (f, p0) in models.items()}\nprint(\"степенная по 1–12: a = %.4f, b = %.4f\" % tuple(fit12[\"степенная\"]))\nm_tail = marg[[10, 11, 12]].sum().sum() / act[[10, 11, 12]].sum().sum()   # свежая маржа на активного\nknown = (r * m).sum()                 # месяцы 0–12 — данные\nltv = {k: {H: known + (models[k][0](np.arange(13, H), *p) * m_tail).sum() for H in (24, 36)} for k, p in fit12.items()}\nprint(f\"LTV12 по данным: {(r * m).loc[:11].sum():.0f} ₽; маржа на активного в хвосте: {m_tail:.0f} ₽\")\nprint(pd.DataFrame(ltv).T.round(0).astype(int).rename(columns=lambda H: f\"LTV{H}\"))\n\n# 3) рисунок: в логарифмических осях степенная кривая — прямая\nimport matplotlib.pyplot as plt\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 9})\nfig, ax = plt.subplots(figsize=(6.4, 3.7))\nnn = np.arange(1, 37)\nax.axvspan(12.5, 36, color=\"#edf0f4\")\nfor k, col, dy in [(\"степенная\", \"#2f6db5\", 0.85), (\"экспонента\", \"#c2417a\", 1), (\"плато\", \"#7b5bd6\", 1.2)]:\n    y = models[k][0](nn, *fit12[k]) * 100\n    ax.plot(nn, y, color=col, lw=1.8, ls=\"-\" if k == \"степенная\" else \"--\")\n    ax.text(38, y[-1] * dy, f\"{k}\\nLTV36 {ltv[k][36]:,.0f} ₽\".replace(\",\", \" \"), color=col, va=\"center\", fontweight=\"bold\")\nax.plot(r.index[1:], r.loc[1:] * 100, \"o\", color=\"#141a24\", ms=4)\nax.set(xscale=\"log\", yscale=\"log\", xlim=(0.9, 36), ylim=(0.6, 50),\n       xlabel=\"месяц жизни n, логарифмическая шкала\", ylabel=\"% когорты, активной в месяц n\")\nax.set_xticks([1, 2, 3, 6, 12, 24, 36], labels=[\"1\", \"2\", \"3\", \"6\", \"12\", \"24\", \"36\"])\nax.set_yticks([1, 2, 5, 10, 20, 40], labels=[\"1\", \"2\", \"5\", \"10\", \"20\", \"40\"])\nax.minorticks_off()\nax.spines[[\"top\", \"right\"]].set_visible(False)\nax.text(13.5, 30, \"данных нет:\\nхвост дорисован\", color=\"#737c8f\")\nax.text(1.05, 1.1, \"точки — 12 когорт июля 2024 — июня 2025,\\nучебные данные; линии — подгонки по месяцам 1–12\", color=\"#737c8f\")\nfig.suptitle(\"В логарифмических осях удержание ложится на прямую:\\nэто степенная кривая, и её хвост — посередине\",\n             x=0.01, ha=\"left\", fontweight=\"bold\", fontsize=10.5)\nfig.tight_layout()\nfig.subplots_adjust(right=0.78)\nfig.savefig(\"tails.svg\")", "out": "    факт  степенная  экспонента  плато\nn                                     \n7   15.4       15.8        12.6   15.6\n8   14.3       14.9        10.6   15.0\n9   13.5       14.2         9.0   14.6\n10  13.2       13.6         7.6   14.4\n11  12.7       13.1         6.5   14.3\n12  11.8       12.6         5.5   14.2\nсредняя ошибка, п. п.: {'степенная': 0.54, 'экспонента': 4.86, 'плато': 1.18}\nстепенная по 1–12: a = 0.3612, b = 0.4361\nLTV12 по данным: 1413 ₽; маржа на активного в хвосте: 475 ₽\n            LTV24  LTV36\nстепенная    2011   2484\nэкспонента   1741   1826\nплато        2109   2799", "outLabel": "Вывод: проверка на месяцах 7–12, подгонка по 1–12, LTV по трём хвостам; рисунок — под блоком", "note": "curve_fit подбирает параметры методом наименьших квадратов, p0 — стартовая точка поиска. Таблица LTV совпадает со сценой: те же 12 когорт, та же маржа на активного в хвосте."}, "boot": {"title": "Бутстрэп интервала LTV по когортам", "badge": "проверено: Python 3.13, pandas 3.0.5, SciPy 1.18.1", "lang": "python", "code": "# продолжение предыдущей ячейки: size, act, marg, power, pick, grp, orders уже в памяти\nS, A, M = size.to_numpy(), act.to_numpy(), marg.to_numpy()   # 12 когорт × месяцы 0–12\n\n\ndef ltv12_24(i):\n    \"\"\"LTV12 по данным и LTV24 со степенным хвостом для набора когорт i.\"\"\"\n    s = S[i].sum()\n    (a, b), _ = curve_fit(power, np.arange(1, 13), A[i, 1:].sum(0) / s, p0=(0.4, 0.5))\n    m_tail = M[i, 10:].sum() / A[i, 10:].sum()\n    return M[i, :12].sum() / s, M[i].sum() / s + (power(np.arange(13, 24), a, b) * m_tail).sum()\n\n\nrng = np.random.default_rng(10)\nboot = np.array([ltv12_24(rng.integers(0, 12, size=12)) for _ in range(2000)])   # 12 когорт с возвращением\npoint = ltv12_24(np.arange(12))\nfor j, name in enumerate([\"LTV12\", \"LTV24, степенной хвост\"]):\n    lo, hi = np.percentile(boot[:, j], [2.5, 97.5])\n    print(f\"{name}: {point[j]:.0f} ₽, 95% интервал {lo:.0f}–{hi:.0f} ₽\")\n\n# LTV12 по каналам с тем же бутстрэпом по когортам; CAC — расходы тех же 12 месяцев на новичка канала\nspend = pd.read_csv(\"data/unit/marketing_spend.csv\").query(\"'2024-07' <= month <= '2025-06'\").groupby(\"channel\").spend.sum()\no12 = pick(orders).query(\"n < 12\").merge(clients[[\"client_id\", \"channel\"]], on=\"client_id\")\nmar_ch = o12.pivot_table(index=\"cohort\", columns=\"channel\", values=\"margin\", aggfunc=\"sum\")\ncnt_ch = grp.pivot_table(index=\"cohort\", columns=\"channel\", values=\"client_id\", aggfunc=\"count\")\nidx = rng.integers(0, 12, size=(2000, 12))\nrows = {}\nfor ch in cnt_ch.columns:\n    b = mar_ch[ch].to_numpy()[idx].sum(1) / cnt_ch[ch].to_numpy()[idx].sum(1)\n    rows[ch] = [cnt_ch[ch].sum(), mar_ch[ch].sum() / cnt_ch[ch].sum(), *np.percentile(b, [2.5, 97.5]),\n                spend.get(ch, np.nan) / cnt_ch[ch].sum()]\nprint(pd.DataFrame(rows, index=[\"клиентов\", \"LTV12\", \"от\", \"до\", \"CAC\"]).T.round(0).astype(\"Int64\"))", "out": "LTV12: 1413 ₽, 95% интервал 1353–1473 ₽\nLTV24, степенной хвост: 2011 ₽, 95% интервал 1900–2111 ₽\n          клиентов  LTV12    от    до   CAC\nорганика     11707   1636  1538  1725  <NA>\nпартнёры      3727   1484  1371  1604  1254\nпоиск         6668   1540  1433  1660  1454\nсоцсети       3888    455   420   495  2816", "outLabel": "Вывод: интервалы для группы и для каналов, ₽", "note": "Ячейка продолжает предыдущую. &lt;NA&gt; — у органики нет расходов, CAC не определён. Зерно генератора зафиксировано: повторный запуск даёт те же границы."}};/*code:end*/

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const pct = (v, d = 1) => (100 * v).toFixed(d).replace('.', ',');
  const sp = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const sum = a => a.reduce((s, x) => s + x, 0);
  /* три способа дорисовать хвост: те же формулы, что в Python; параметры подобраны там */
  const FN = {
    pow: (n, p) => p[0] * Math.pow(n, -p[1]),
    exp: (n, p) => p[0] * Math.exp(-p[1] * n),
    plat: (n, p) => p[0] + p[1] * Math.exp(-p[2] * n)
  };
  const TNAME = { pow: 'степенная', plat: 'плато', exp: 'экспонента' };
  const DM = Math.pow(1.2, 1 / 12) - 1;               // 20% годовых → ставка за месяц

  /* ===================== Сцена: площадь под кривой и три хвоста ===================== */
  const SD = DATA.sc, NK = SD.r.length;                // месяцы 0–12 — данные
  const V = SD.r.map((x, i) => x * SD.m[i]);           // ₽ на одного новичка в месяц n
  const CUM = []; V.forEach((x, i) => CUM.push((i ? CUM[i - 1] : 0) + x));
  const TAIL = {};
  ['plat', 'pow', 'exp'].forEach(k => { TAIL[k] = []; for (let n = NK; n < 36; n++) TAIL[k].push(FN[k](n, SD.fit[k]) * SD.mtail); });
  const ltvTail = (k, H) => CUM[NK - 1] + sum(TAIL[k].slice(0, H - NK));
  const V24 = V.concat(TAIL.pow.slice(0, 24 - NK));
  const DISC24 = sum(V24.map((v, n) => v / Math.pow(1 + DM, n)));
  const SC = { teal: '#36b8a6', pow: '#6fa2ea', plat: '#a48af0', exp: '#f06ba5', ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#6f7a91', grid: '#182033', yel: '#e3c04d', bg: '#0b0f19' };
  const tx = (x, y, s, o = {}) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.fs || 11}" fill="${o.c || SC.mut}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.w ? ` font-weight="${o.w}"` : ''}${o.halo ? ` stroke="${SC.bg}" stroke-width="4" paint-order="stroke"` : ''}${o.op != null ? ` opacity="${o.op.toFixed(2)}"` : ''}>${s}</text>`;
  function call(x, y, s, o = {}) {                     // выноска: подпись на тёмной плашке
    const fs = o.fs || 11.5, w = s.length * fs * 0.55 + 14, h = fs + 10;
    let X = o.a === 'end' ? x - w : o.a === 'middle' ? x - w / 2 : x;
    if (o.W) X = clamp(X, 4, o.W - w - 4);
    return `<g opacity="${(o.op == null ? 1 : o.op).toFixed(2)}"><rect x="${X.toFixed(1)}" y="${(y - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="6" fill="#141b2b" stroke="${o.c || SC.teal}"/>${tx(X + 7, y + fs * 0.36, s, { fs, c: SC.ink })}</g>`;
  }
  /* состояние шага: сколько месяцев на оси, режим оси Y и её максимум */
  function state(k, p) {
    const st = { xmax: 13, mode: 'rub', ymax: 160 };
    if (k <= 1) { st.mode = 'r'; st.ymax = 0.4; }
    else if (k <= 3) st.ymax = 600;
    else if (k === 4) st.ymax = lerp(600, 160, ease(clamp(p / 0.3, 0, 1)));
    if (k === 6) st.xmax = lerp(13, 36, ease(clamp(p / 0.6, 0, 1)));
    else if (k > 6) st.xmax = 36;
    return st;
  }
  function lay(W, H, st) {
    const nar = W < 560, x0 = nar ? 40 : 58, x1 = W - (nar ? 14 : 136), y0 = nar ? 40 : 46, y1 = H - (nar ? 22 : 26);
    return { nar, W, x0, x1, y0, y1, cw: (x1 - x0) / st.xmax, X: n => x0 + n / st.xmax * (x1 - x0), Y: v => y1 - Math.min(v, st.ymax * 1.06) / st.ymax * (y1 - y0) };
  }
  function axes(L, st, op) {
    let s = '';
    const ticks = st.mode === 'r' ? [0, 0.1, 0.2, 0.3, 0.4] : st.ymax > 300 ? [0, 200, 400, 600] : [0, 50, 100, 150];
    ticks.forEach((v, i) => {
      if (v > st.ymax * 1.02) return;
      const y = L.Y(v), lb = st.mode === 'r' ? `${Math.round(v * 100)}${i === ticks.length - 1 ? '%' : ''}` : `${v}${i === ticks.length - 1 ? ' ₽' : ''}`;
      s += `<line x1="${L.x0}" x2="${L.x1}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${SC.grid}"/>` + tx(L.x0 - 6, y + 3.5, lb, { a: 'end', fs: 10, op });
    });
    const xt = st.xmax < 20 ? [0, 3, 6, 9, 12] : L.nar ? [0, 12, 24, 35] : [0, 6, 12, 18, 24, 30, 35];
    xt.filter(n => n + 1 <= st.xmax).forEach(n => { s += tx(L.X(n + 0.5), L.y1 + 15, n, { a: 'middle', fs: 10 }); });
    if (!L.nar) s += tx(L.x1 + 8, L.y1 + 15, 'месяц n', { fs: 10 });
    const yl = st.mode === 'r' ? '% когорты, активной в месяц n' : st.ymax > 300 ? '₽ на активного клиента' : '₽ на одного новичка';
    s += tx(L.x0 - 34, L.y0 - 26, yl, { fs: 10.5, c: SC.ink2, op });
    return s;
  }
  /* столбец месяца n высотой v; если выше оси — обрезаем с разрывом и подписываем */
  function col(L, st, n, v, fill, op, extra = '') {
    const w = L.cw * 0.74, xl = L.X(n) + (L.cw - w) / 2, top = Math.max(L.Y(v), L.y0 - 8);
    let s = `<rect x="${xl.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${(L.y1 - top).toFixed(1)}" fill="${fill}" opacity="${op.toFixed(2)}"${extra}/>`;
    if (v > st.ymax * 1.06) {                            // разрыв: столбец выше оси
      const yb = L.y0 + 6;
      s += `<path d="M${(xl - 2).toFixed(1)} ${(yb + 3).toFixed(1)} L${(xl + w + 2).toFixed(1)} ${(yb - 3).toFixed(1)}" stroke="${SC.bg}" stroke-width="4"/>`;
    }
    return s;
  }
  function retCurve(L, nmax, op) {                      // кривая удержания: точки и линия
    let s = '', pts = [];
    for (let n = 1; n <= Math.min(12, nmax); n++) pts.push([L.X(n + 0.5), L.Y(SD.r[n])]);
    if (pts.length > 1) s += `<polyline points="${pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${SC.teal}" stroke-width="2.2" opacity="${op.toFixed(2)}"/>`;
    pts.forEach(([x, y]) => { s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="${SC.teal}" opacity="${op.toFixed(2)}"/>`; });
    const x0 = L.X(0.5);
    s += `<line x1="${x0.toFixed(1)}" x2="${x0.toFixed(1)}" y1="${L.y1}" y2="${(L.y0 - 6).toFixed(1)}" stroke="${SC.teal}" stroke-width="2" stroke-dasharray="3 3" opacity="${(op * 0.6).toFixed(2)}"/>`;
    s += `<circle cx="${x0.toFixed(1)}" cy="${(L.y0 - 6).toFixed(1)}" r="4" fill="${SC.teal}" opacity="${op.toFixed(2)}"/>` + tx(x0 + 8, L.y0 - 2, '100%', { fs: 11, c: SC.ink, op });
    return s;
  }
  function tails(L, st, g, k, p) {                      // g — до какого месяца нарисован хвост
    let s = '';
    ['plat', 'pow', 'exp'].forEach(key => {
      const T = TAIL[key], fade = k === 10 && key !== 'pow' ? 0.25 : 1, fillOp = k === 7 ? 0.1 : key === 'plat' ? 0.24 : key === 'pow' ? 0.3 : 0.42;
      const pts = [[L.X(NK - 0.5), L.Y(V[NK - 1])]];
      for (let n = NK; n < Math.min(36, g); n++) {
        const v = T[n - NK], beyond = k >= 9 && n >= 24 ? 0.22 : 1;
        if (k >= 8 || k === 7) s += col(L, st, n, v, SC[key], fillOp * fade * beyond);
        pts.push([L.X(n + 0.5), L.Y(v)]);
      }
      if (pts.length > 1) s += `<polyline points="${pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="${SC[key]}" stroke-width="${key === 'pow' && k === 10 ? 2.6 : 2}" stroke-dasharray="6 4" opacity="${(0.95 * fade).toFixed(2)}"/>`;
    });
    return s;
  }
  function tailLabels(L, H, op) {                      // подписи LTV у хвостов: справа от оси или внутри на телефоне
    let s = '';
    const ys = ['plat', 'pow', 'exp'].map(k => [k, L.Y(TAIL[k][35 - NK])]);   // у концов пунктиров, справа
    ys.sort((a, b) => a[1] - b[1]);
    const gap = L.nar ? 28 : 26;
    for (let i = 1; i < ys.length; i++) if (ys[i][1] - ys[i - 1][1] < gap) ys[i][1] = ys[i - 1][1] + gap;
    const x = L.nar ? L.x1 - 2 : L.x1 + 8, a = L.nar ? 'end' : 'start';
    s += tx(x, ys[0][1] - (L.nar ? 34 : 22), `LTV за ${H} мес.`, { a, fs: L.nar ? 10 : 11, c: SC.ink2, halo: 1, op });
    ys.forEach(([k, y]) => {
      const v = sp(ltvTail(k, H)) + ' ₽';
      if (L.nar) s += tx(x, y - 20, TNAME[k], { a, fs: 10, c: SC[k], w: 600, halo: 1, op }) + tx(x, y - 8, v, { a, fs: 11, c: SC[k], w: 700, halo: 1, op });
      else s += tx(x, y - 4, TNAME[k], { fs: 11, c: SC[k], w: 600, halo: 1, op }) + tx(x, y + 10, v, { fs: 12, c: SC[k], w: 700, halo: 1, op });
    });
    return s;
  }
  const scene = {
    parts: [{ n: '01', name: 'Удержание', s: [0, 1] }, { n: '02', name: 'Деньги', s: [2, 3] }, { n: '03', name: 'Площадь', s: [4, 5] }, { n: '04', name: 'Хвост', s: [6, 7, 8] }, { n: '05', name: 'Честное число', s: [9, 10] }],
    steps: [
      { title: '25 990 новичков, месяц 0', dur: 2800, body: '<p>С&nbsp;июля 2024 по&nbsp;июнь 2025 в&nbsp;учебном магазине зарегистрировались 25&nbsp;990 человек&nbsp;— 12 месячных когорт. Месяц регистрации&nbsp;— месяц&nbsp;0: в&nbsp;нём активны все.</p><p>Какая доля из&nbsp;них зайдёт в&nbsp;магазин через месяц, два, три?</p>' },
      { title: 'Кривая удержания по месяцам', dur: 3800, body: '<p>В&nbsp;месяц 1 заходит 35,4% новичков, в&nbsp;месяц 6&nbsp;— 16,3%, в&nbsp;месяц 12&nbsp;— 11,8%. Это кривая удержания из&nbsp;9.3, только по&nbsp;месяцам и&nbsp;на&nbsp;финансовой выгрузке.</p><p>Она падает всё медленнее: после месяца 0 исчезают почти две трети активных, во&nbsp;втором полугодии&nbsp;— по&nbsp;2–7% за&nbsp;месяц.</p>' },
      { title: 'Сколько приносит активный клиент', dur: 3800, body: '<p>Теперь деньги. Делим маржинальный доход месяца на&nbsp;активных в&nbsp;этом месяце: в&nbsp;месяц 0 выходит 543&nbsp;₽, дальше от&nbsp;381 до&nbsp;493&nbsp;₽.</p><p>Месяц 0 дороже: в&nbsp;нём покупают 55% новичков, а&nbsp;потом&nbsp;— около 37% заходивших.</p>' },
      { title: 'Умножаем на удержание', dur: 4000, body: '<p>Маржу активного умножаем на&nbsp;долю активных. Месяц 1: 384&nbsp;₽ × 35,4% = 136&nbsp;₽ на&nbsp;каждого из&nbsp;25&nbsp;990 новичков. Месяц 12: 58&nbsp;₽.</p><p>Столбец показывает, сколько в&nbsp;среднем приносит один зарегистрированный клиент в&nbsp;этот месяц своей жизни.</p>' },
      { title: 'Площадь под кривой — это LTV', dur: 4600, body: '<p>Складываем столбцы слева направо. Сумма за&nbsp;месяцы 0–11&nbsp;— <b>LTV за&nbsp;12 месяцев</b>: 1&nbsp;413&nbsp;₽ маржинального дохода на&nbsp;одного новичка.</p><p>Это не&nbsp;выручка и&nbsp;не&nbsp;чек: из&nbsp;каждого заказа уже вычтены себестоимость, доставка, эквайринг и&nbsp;возвраты.</p>' },
      { title: 'Полгода дают три четверти', dur: 3600, body: '<p>Месяц 0&nbsp;— 38% годового LTV, месяцы 0–5&nbsp;— 73%: LTV за&nbsp;полгода&nbsp;— 1&nbsp;033&nbsp;₽. Самые ценные месяцы&nbsp;— первые, и&nbsp;они уже в&nbsp;данных.</p><p>Но&nbsp;о&nbsp;том, что будет после месяца 12, данные молчат.</p>' },
      { title: 'Данные кончились', dur: 3800, body: '<p>Месяцы 0–12 есть у&nbsp;всех 12 когорт. Дальше история есть только у&nbsp;старых, а&nbsp;у&nbsp;июньской её нет совсем.</p><p>Растянем ось до&nbsp;трёх лет: две трети графика&nbsp;— будущее, которого в&nbsp;данных нет. Его придётся дорисовать, то&nbsp;есть <b>экстраполировать</b>.</p>' },
      { title: 'Три способа дорисовать хвост', dur: 4600, body: '<p>Три кривые подобраны по&nbsp;месяцам 1–12 и&nbsp;одинаково хорошо проходят через данные:</p><ul><li><b>экспонента</b>&nbsp;— каждый месяц уходит одна и&nbsp;та&nbsp;же доля;</li><li><b>степенная кривая</b>&nbsp;— отток замедляется;</li><li><b>плато</b>&nbsp;— кривая выходит на&nbsp;постоянный уровень.</li></ul>' },
      { title: 'Три пунктира — три LTV', dur: 4200, body: '<p>Площадь за&nbsp;три года: 1&nbsp;826&nbsp;₽ у&nbsp;экспоненты, 2&nbsp;484&nbsp;₽ у&nbsp;степенной кривой, 2&nbsp;799&nbsp;₽ у&nbsp;плато. Разница почти в&nbsp;тысячу рублей&nbsp;— две трети годового LTV.</p><p>Данные одни и&nbsp;те&nbsp;же. Отличается только допущение о&nbsp;том, чего мы не&nbsp;видели.</p>' },
      { title: 'Горизонт вместо бесконечности', dur: 3800, body: '<p>Режем на&nbsp;24 месяцах: что дальше, не&nbsp;считаем. Разброс сужается до&nbsp;1&nbsp;741–2&nbsp;109&nbsp;₽.</p><p>У&nbsp;этой степенной кривой площадь до&nbsp;бесконечности бесконечна, поэтому без <b>горизонта</b> LTV вообще не&nbsp;определён.</p>' },
      { title: 'Честное число', dur: 4800, next: 'Читать страницу', body: '<p>LTV за&nbsp;24 месяца со&nbsp;степенным хвостом&nbsp;— 2&nbsp;011&nbsp;₽. Бутстрэп по&nbsp;когортам даёт 95-процентный интервал 1&nbsp;900–2&nbsp;111&nbsp;₽, а&nbsp;дисконт 20% годовых снижает LTV до&nbsp;1&nbsp;809&nbsp;₽.</p><p>Честный ответ&nbsp;— горизонт, способ дорисовать хвост и&nbsp;интервал, а&nbsp;не&nbsp;одно красивое число.</p>' }
    ],
    hud: [{ id: 'mo', label: 'Месяц' }, { id: 'act', label: 'Активны' }, { id: 'ltv', label: 'LTV, ₽' }],
    legend: '<span><i style="background:#36b8a6"></i>данные</span><span><i style="background:#f06ba5"></i>экспонента</span><span><i style="background:#6fa2ea"></i>степенная</span><span><i style="background:#a48af0"></i>плато</span>',
    info: 'LTV',
    aiNote: 'В анимации 12 месячных когорт учебного магазина (июль 2024 — июнь 2025, 25 990 новичков). Удержание: месяц 1 — 35,4%, месяц 6 — 16,3%, месяц 12 — 11,8%. Маржа на активного: 543 ₽ в месяц 0, дальше 380–490 ₽. LTV за 6 месяцев — 1 033 ₽, за 12 — 1 413 ₽. Хвосты, подобранные по месяцам 1–12: LTV за 36 месяцев — 1 826 ₽ (экспонента), 2 484 ₽ (степенная), 2 799 ₽ (плато); за 24 месяца — 1 741, 2 011 и 2 109 ₽. Бутстрэп по когортам для LTV за 24 месяца со степенным хвостом: 1 900–2 111 ₽; с дисконтом 20% годовых — 1 809 ₽.',
    mount(root, api) {
      root.innerHTML = '<svg class="lt-sv" role="img" aria-label="Кривая удержания умножается на маржу, площадь под ней складывается в LTV, а хвост за горизонтом данных дорисован тремя способами"></svg>';
      const svg = root.firstChild;
      let sig = '';
      return {
        render(k, p) {
          const W = Math.round(svg.clientWidth || 600), H = Math.round(svg.clientHeight || 420);
          /* счётчики */
          const nP = Math.min(12, Math.floor(p * 12.999));
          let mo = '0', act = '100%', ltv = '—', ls = '';
          if (k === 1) { mo = String(nP); act = pct(SD.r[nP]) + '%'; }
          if (k === 2) { const n = clamp(Math.floor((p - 0.25) / 0.045), 0, 12); mo = String(n); act = pct(SD.r[n]) + '%'; }
          if (k === 3) { mo = '1'; act = pct(SD.r[1]) + '%'; }
          if (k === 4) { const f = clamp((p - 0.3) / 0.65, 0, 1) * 12, n = Math.min(11, Math.floor(f)); mo = String(n); act = pct(SD.r[n]) + '%'; ltv = sp((n ? CUM[n - 1] : 0) + V[n] * Math.min(1, f - n)); ls = 'месяцы 0–' + n; }
          if (k === 5) { mo = '11'; act = pct(SD.r[11]) + '%'; ltv = sp(CUM[11]); ls = '12 мес.'; }
          if (k === 6) { mo = '12'; act = pct(SD.r[12]) + '%'; ltv = sp(CUM[12]); ls = '13 мес.'; }
          if (k === 7) { mo = String(NK + Math.floor(p * 22.999)); act = '?'; ltv = '?'; }
          if (k === 8) { mo = '35'; act = '?'; ltv = '1,8–2,8'; ls = 'тыс.'; }
          if (k === 9) { mo = '23'; act = '?'; ltv = '1,7–2,1'; ls = 'тыс.'; }
          if (k === 10) { mo = '23'; act = pct(FN.pow(23, SD.fit.pow)) + '%'; ltv = sp(ltvTail('pow', 24)); }
          api.hud('mo', mo); api.hud('act', act); api.hud('ltv', ltv, ls);
          const key = [k, Math.round(p * 90), W, H].join();
          if (key === sig) return; sig = key;
          const st = state(k, p), L = lay(W, H, st);
          const fadeR = k === 2 ? 1 - clamp(p / 0.3, 0, 1) : 1;
          let s = axes(L, st, k === 2 ? (p < 0.3 ? fadeR : clamp((p - 0.3) / 0.3, 0, 1)) : 1);
          if (k <= 1) s += retCurve(L, k === 0 ? 0 : Math.floor(p * 13.5), 1);
          if (k === 2 && fadeR > 0) s += retCurve({ ...L, Y: v => L.y1 - Math.min(v, 0.42) / 0.4 * (L.y1 - L.y0) }, 12, fadeR);
          /* столбцы данных */
          if (k >= 2) {
            for (let n = 0; n < NK; n++) {
              if (k === 2) {
                const a = clamp((p - 0.25 - n * 0.045) * 6, 0, 1);
                if (a > 0) s += col(L, st, n, SD.m[n], SC.teal, 0.22 * a, ` stroke="${SC.teal}" stroke-opacity="${(0.8 * a).toFixed(2)}"`);
              } else if (k === 3) {
                const t = ease(clamp((p - 0.1) / 0.6, 0, 1));
                s += `<rect x="${(L.X(n) + L.cw * 0.13).toFixed(1)}" y="${L.Y(SD.m[n]).toFixed(1)}" width="${(L.cw * 0.74).toFixed(1)}" height="${(L.y1 - L.Y(SD.m[n])).toFixed(1)}" fill="none" stroke="${SC.mut}" stroke-dasharray="3 3"/>`;
                s += col(L, st, n, lerp(SD.m[n], V[n], t), SC.teal, lerp(0.22, 0.75, t));
              } else {
                let op = 0.85;
                if (k === 4) { const f = clamp((p - 0.3) / 0.65, 0, 1) * 12; op = n < f ? 0.92 : 0.3; }
                if (k === 5) op = n <= 5 ? 0.95 : n <= 11 ? 0.6 : 0.3;
                s += col(L, st, n, V[n], SC.teal, op);
              }
            }
            if (k >= 4) {
              const c0 = L.X(0.5);
              if (V[0] > st.ymax * 1.06) s += tx(c0, L.y0 - 14, '543 ₽', { a: 'middle', fs: 11, c: SC.ink, w: 600 });
            }
          }
          /* граница данных и хвосты */
          if (k >= 6) {
            const xb = L.X(NK), a = k === 6 ? clamp((p - 0.4) * 3, 0, 1) : 1;
            s += `<line x1="${xb.toFixed(1)}" x2="${xb.toFixed(1)}" y1="${(L.y0 - 4).toFixed(1)}" y2="${L.y1}" stroke="${SC.ink2}" stroke-dasharray="2 4" opacity="${a.toFixed(2)}"/>`;
            if (k === 6) s += call(xb + 8, L.y0 + 30, 'дальше данных нет', { c: SC.ink2, op: a, W });
          }
          if (k >= 7) s += tails(L, st, k === 7 ? NK + p * 23.5 : 36, k, p);
          if (k === 8) s += tailLabels(L, 36, clamp(p * 3, 0, 1));
          if (k >= 9) {
            const xh = L.X(24), a = k === 9 ? clamp(p * 3, 0, 1) : 1;
            s += `<line x1="${xh.toFixed(1)}" x2="${xh.toFixed(1)}" y1="${(L.y0 - 4).toFixed(1)}" y2="${L.y1}" stroke="${SC.yel}" stroke-width="1.5" opacity="${a.toFixed(2)}"/>` + tx(xh - 6, L.y0 + 2, 'горизонт 24 мес.', { a: 'end', fs: 11, c: SC.yel, w: 600, halo: 1, op: a });
            if (k === 9) s += tailLabels(L, 24, clamp((p - 0.2) * 3, 0, 1));
          }
          if (k === 10) {
            const a = clamp(p * 3, 0, 1), pts = [];
            for (let n = 1; n < 24; n++) pts.push(`${L.X(n + 0.5).toFixed(1)},${L.Y(V24[n] / Math.pow(1 + DM, n)).toFixed(1)}`);
            s += `<polyline points="${pts.join(' ')}" fill="none" stroke="${SC.yel}" stroke-width="1.6" stroke-dasharray="1 3" stroke-linecap="round" opacity="${a.toFixed(2)}"/>`;
            const xa = L.nar ? L.x0 + 6 : L.X(9);
            s += call(xa, L.y0 + 46, 'LTV за 24 мес.: 2 011 ₽', { c: SC.pow, op: a, W, fs: L.nar ? 11 : 12 });
            s += call(xa, L.y0 + 74, '95%: 1 900–2 111 ₽', { c: SC.pow, op: clamp((p - 0.25) * 3, 0, 1), W, fs: L.nar ? 11 : 12 });
            s += call(xa, L.y0 + 102, 'с дисконтом 20%: 1 809 ₽', { c: SC.yel, op: clamp((p - 0.5) * 3, 0, 1), W, fs: L.nar ? 11 : 12 });
          }
          /* выноски */
          const C1 = L.X(1.5);
          if (k === 0 && p > 0.3) s += call(L.X(1.2), L.y0 + 18, 'месяц 0: активны все 25 990', { op: clamp((p - 0.3) * 4, 0, 1), W });
          if (k === 1 && p > 0.2) s += call(C1 + 10, L.Y(SD.r[1]), 'месяц 1: 35,4%', { op: clamp((p - 0.2) * 4, 0, 1), W });
          if (k === 1 && p > 0.85) s += call(L.X(12.5), L.Y(SD.r[12]) + 30, 'месяц 12: 11,8%', { a: 'end', op: clamp((p - 0.85) * 6, 0, 1), W });
          if (k === 2 && p > 0.45) s += call(L.X(1.2), L.Y(585), 'месяц 0: 543 ₽ — первая покупка', { op: clamp((p - 0.45) * 4, 0, 1), W });
          if (k === 2 && p > 0.75) s += call(L.X(8), L.Y(515), 'дальше 381–493 ₽', { a: 'middle', op: clamp((p - 0.75) * 5, 0, 1), W });
          if (k === 3 && p > 0.55) s += call(C1 - 4, L.Y(250), '384 ₽ × 35,4% = 136 ₽', { op: clamp((p - 0.55) * 4, 0, 1), W });
          if (k === 4 && p > 0.9) s += call(L.X(12), L.Y(V[11]) - 34, 'LTV за 12 мес. = 1 413 ₽', { a: 'end', op: clamp((p - 0.9) * 8, 0, 1), W });
          if (k === 5) {
            s += call(L.X(1.2), L.y0 + 18, 'месяц 0: 38% годового LTV', { op: clamp(p * 4, 0, 1), W });
            s += call(L.X(L.nar ? 1.2 : 3.2), L.Y(118), 'месяцы 0–5: 1 033 ₽, 73%', { op: clamp((p - 0.25) * 4, 0, 1), W });
            s += call(L.X(12.5), L.Y(92), 'месяцы 0–11: 1 413 ₽', { a: 'end', op: clamp((p - 0.5) * 4, 0, 1), W });
          }
          svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
          svg.innerHTML = s;
        }
      };
    }
  };

  /* ===================== Интерактив «Дорисуй хвост» ===================== */
  const W = DATA.w, MK = ['pow', 'plat', 'exp'], HS = [6, 12, 24, 36];
  const COLK = { pow: 0, plat: 4, exp: 3 };            // индекс цвета --c1…--c8
  const rhat = (g, k, n) => FN[k](n, g.fit[k]);
  function ltvW(g, k, H) {                             // месяцы 0–6 — данные, дальше — хвост × свежая маржа
    let s = 0;
    for (let n = 0; n < Math.min(H, 7); n++) s += g.r[n] * g.m[n];
    for (let n = 7; n < H; n++) s += rhat(g, k, n) * g.mbar;
    return s;
  }
  /* сверка формул браузера с Python: расхождение больше полрубля — ошибка в консоли */
  (() => {
    const bad = [];
    W.forEach(g => MK.forEach(k => HS.forEach(H => { const d = ltvW(g, k, H) - g.chk[k][H]; if (Math.abs(d) > 0.5) bad.push(`${g.key}/${k}/${H}: ${d.toFixed(2)}`); })));
    ['pow', 'exp', 'plat'].forEach(k => [24, 36].forEach(H => { const d = ltvTail(k, H) - SD.ltv[k][H]; if (Math.abs(d) > 1) bad.push(`сцена ${k}/${H}: ${d.toFixed(2)}`); }));
    if (Math.abs(DISC24 - SD.disc24) > 1 || Math.abs(CUM[11] - DATA.w[0].real12) > 0.5) bad.push('дисконт или LTV12 сцены');
    if (bad.length) console.error('LTV в браузере расходится с Python: ' + bad.join('; '));
  })();

  function buildTail(box, api) {
    const { $, esc } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Дорисуй хвост <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn small" id="dh-open" aria-pressed="false">Открыть месяцы 7–12</button><button type="button" class="btn ghost small" id="dh-reset">Сбросить</button></div></div>
<p class="hint dh-do">Выберите способ дорисовать хвост и&nbsp;горизонт&nbsp;— LTV пересчитается. Потом откройте месяцы 7–12 и&nbsp;сравните прогноз с&nbsp;фактом.</p>
<div class="dh-ctl">
<div class="dh-f"><span class="dh-lb" id="dh-lg">Когорты</span><div class="seg" role="group" aria-labelledby="dh-lg">${W.map((g, i) => `<button type="button" data-g="${i}" aria-pressed="${i === 0}">${esc(g.name)}</button>`).join('')}</div></div>
<div class="dh-f"><span class="dh-lb" id="dh-lk">Хвост</span><div class="seg" role="group" aria-labelledby="dh-lk">${MK.map(k => `<button type="button" data-k="${k}" aria-pressed="${k === 'pow'}"><i class="dh-sw" style="background:var(--c${COLK[k] + 1})"></i>${TNAME[k]}</button>`).join('')}</div></div>
<div class="dh-f"><span class="dh-lb" id="dh-lh">Горизонт</span><div class="seg" role="group" aria-labelledby="dh-lh">${HS.map(h => `<button type="button" data-h="${h}" aria-pressed="${h === 24}">${h} мес.</button>`).join('')}</div></div>
</div>
<div class="stage dh-stage"><div class="dh-main"><p class="cap" id="dh-c1"></p><div id="dh-ret"></div><p class="cap" id="dh-c2"></p><div id="dh-rub"></div></div>
<div class="narr dh-narr"><div class="readout"><div><span class="big" id="dh-big"></span><span class="lbl" id="dh-bigl"></span></div></div><div class="dh-rows" id="dh-rows"></div><div class="dh-fact" id="dh-fact"></div><div class="narr-text" id="dh-txt"></div></div></div>
<div class="status"><span><span class="dot live"></span><span id="dh-s1"></span></span><span id="dh-s2"></span><span id="dh-s3"></span></div>`;
    let gi = 0, K = 'pow', H = 24, open = false;
    const colr = (C, k) => C.c[COLK[k]];
    function axisX(s, X, D, y, C) {
      const xt = D <= 12 ? [0, 3, 6, 9, 12] : D <= 23 ? [0, 6, 12, 18, 23] : [0, 6, 12, 18, 24, 30, 35];
      xt.forEach(n => { s.push(`<text x="${X(n).toFixed(1)}" y="${y}" text-anchor="middle" class="dh-ax">${n}</text>`); });
    }
    function retChart() {
      const el = $('dh-ret'), Wd = Math.max(270, el.clientWidth), C = api.css(), g = W[gi], nar = Wd < 520;
      const D = Math.max(12, H - 1), Hh = nar ? 210 : 250, pl = 34, pr = nar ? 10 : 82, pt = 16, pb = 22;
      const X = n => pl + n / D * (Wd - pl - pr), Y = v => pt + (1 - Math.min(v, 0.42) / 0.4) * (Hh - pt - pb);
      const s = [];
      [0, 0.1, 0.2, 0.3, 0.4].forEach(v => s.push(`<line x1="${pl}" x2="${Wd - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${C.line}"/><text x="${pl - 5}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end" class="dh-ax">${Math.round(v * 100)}${v === 0.4 ? '%' : ''}</text>`));
      axisX(s, X, D, Hh - 6, C);
      if (!open) s.push(`<rect x="${X(6.5).toFixed(1)}" y="${pt}" width="${(X(12.5) - X(6.5)).toFixed(1)}" height="${Hh - pt - pb}" fill="${C.sunk}"/><text x="${X(9.5).toFixed(1)}" y="${pt + 14}" text-anchor="middle" class="dh-ax">месяцы 7–12 скрыты</text>`);
      const xh = X(H - 0.5);
      s.push(`<line x1="${xh.toFixed(1)}" x2="${xh.toFixed(1)}" y1="${pt}" y2="${Hh - pb}" stroke="${C.warn}" stroke-width="1.4" stroke-dasharray="4 3"/><text x="${(xh - 4).toFixed(1)}" y="${pt + (open ? 14 : 30)}" text-anchor="end" class="dh-ax" style="fill:${C.warn}">горизонт ${H}</text>`);
      MK.filter(k => k !== K).concat([K]).forEach(k => {
        const on = k === K, pts = [`${X(6).toFixed(1)},${Y(g.r[6]).toFixed(1)}`];
        for (let n = 7; n <= D; n++) pts.push(`${X(n).toFixed(1)},${Y(rhat(g, k, n)).toFixed(1)}`);
        s.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${colr(C, k)}" stroke-width="${on ? 2.6 : 1.3}" stroke-dasharray="${on ? '7 4' : '4 4'}" opacity="${on ? 1 : 0.5}"/>`);
        if (!nar) s.push(`<text x="${(X(D) + 5).toFixed(1)}" y="${(Y(rhat(g, k, D)) + 4 + (k === 'plat' && rhat(g, 'plat', D) - rhat(g, 'pow', D) < 0.012 ? -6 : 0) + (k === 'pow' && rhat(g, 'plat', D) - rhat(g, 'pow', D) < 0.012 ? 6 : 0)).toFixed(1)}" class="dh-lab" fill="${colr(C, k)}" opacity="${on ? 1 : 0.7}">${TNAME[k]}</text>`);
      });
      if (open) {
        const pts = []; for (let n = 6; n <= 12; n++) pts.push(`${X(n).toFixed(1)},${Y(g.r[n]).toFixed(1)}`);
        s.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${C.ink}" stroke-width="1.6"/>`);
        for (let n = 7; n <= 12; n++) s.push(`<circle cx="${X(n).toFixed(1)}" cy="${Y(g.r[n]).toFixed(1)}" r="3.6" fill="${C.surface}" stroke="${C.ink}" stroke-width="1.6"/>`);
      }
      const kp = []; for (let n = 1; n <= 6; n++) kp.push(`${X(n).toFixed(1)},${Y(g.r[n]).toFixed(1)}`);
      s.push(`<polyline points="${kp.join(' ')}" fill="none" stroke="${C.accent}" stroke-width="2.4"/>`);
      for (let n = 1; n <= 6; n++) s.push(`<circle cx="${X(n).toFixed(1)}" cy="${Y(g.r[n]).toFixed(1)}" r="3.8" fill="${C.accent}"/>`);
      s.push(`<text x="${(X(0.15)).toFixed(1)}" y="${pt - 4}" class="dh-ax" style="fill:${C.ink}">месяц 0: 100%, выше оси</text>`);
      el.innerHTML = `<svg width="${Wd}" height="${Hh}" viewBox="0 0 ${Wd} ${Hh}" role="img" aria-label="Удержание: месяцы 1–6 — данные, дальше — хвост способом «${TNAME[K]}»${open ? ', месяцы 7–12 открыты' : ''}">${s.join('')}</svg>`;
    }
    function rubChart() {
      const el = $('dh-rub'), Wd = Math.max(270, el.clientWidth), C = api.css(), g = W[gi], nar = Wd < 520;
      const D = Math.max(12, H - 1), Hh = nar ? 140 : 160, pl = 34, pr = nar ? 10 : 82, pt = 18, pb = 22, YM = 160;
      const cw = (Wd - pl - pr) / (D + 1), X = n => pl + (n + 0.5) * cw, Y = v => pt + (1 - Math.min(v, YM * 1.05) / YM) * (Hh - pt - pb);
      const s = [];
      [0, 50, 100, 150].forEach(v => s.push(`<line x1="${pl}" x2="${Wd - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${C.line}"/><text x="${pl - 5}" y="${(Y(v) + 3.5).toFixed(1)}" text-anchor="end" class="dh-ax">${v}${v === 150 ? ' ₽' : ''}</text>`));
      axisX(s, X, D, Hh - 6, C);
      const w = Math.max(1.5, cw * 0.72);
      for (let n = 0; n < H; n++) {
        const v = n <= 6 ? g.r[n] * g.m[n] : rhat(g, K, n) * g.mbar, y = Y(v);
        s.push(`<rect x="${(X(n) - w / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${(Hh - pb - y).toFixed(1)}" fill="${n <= 6 ? C.accent : colr(C, K)}" opacity="${n <= 6 ? 0.9 : 0.5}"/>`);
        if (open && n >= 7 && n <= 12) { const yr = Y(g.r[n] * g.m[n]); s.push(`<rect x="${(X(n) - w / 2).toFixed(1)}" y="${yr.toFixed(1)}" width="${w.toFixed(1)}" height="${(Hh - pb - yr).toFixed(1)}" fill="none" stroke="${C.ink}" stroke-width="1.2"/>`); }
      }
      s.push(`<text x="${(X(0) + w / 2 + 3).toFixed(1)}" y="${pt + 4}" class="dh-ax" style="fill:${C.ink}">${sp(g.r[0] * g.m[0])} ₽</text>`);
      el.innerHTML = `<svg width="${Wd}" height="${Hh}" viewBox="0 0 ${Wd} ${Hh}" role="img" aria-label="Маржа на одного новичка по месяцам до горизонта ${H}: сумма столбцов — LTV">${s.join('')}</svg>`;
    }
    function side() {
      const g = W[gi], C = api.css(), L = {}; MK.forEach(k => { L[k] = ltvW(g, k, H); });
      const mx = Math.max(...MK.map(k => L[k]));
      $('dh-big').textContent = `${sp(L[K])} ₽`; $('dh-big').style.color = H <= 7 ? C.accent : colr(C, K);
      $('dh-bigl').textContent = `LTV за ${H} мес., хвост: ${TNAME[K]}`;
      $('dh-rows').innerHTML = MK.map(k => `<button type="button" class="dh-row" data-k="${k}" aria-pressed="${k === K}"><span>${TNAME[k]}</span><b>${sp(L[k])} ₽</b><span class="dh-bar"><i style="width:${(L[k] / mx * 100).toFixed(1)}%;background:${colr(C, k)}"></i></span>${open ? `<small>месяцы 7–12: ошибка ${pct(g.mae[k], 1)} п. п.</small>` : ''}</button>`).join('');
      $('dh-fact').innerHTML = open ? `Факт: LTV за 12 мес. — <b>${sp(g.real12)} ₽</b>${H === 12 ? '' : ' (на других горизонтах факта нет)'}; удержание месяца 12 — ${pct(g.r[12])}%.` : 'Факт спрятан: откройте месяцы 7–12.';
      const p = g.fit[K], r12 = pct(rhat(g, K, 12)), r36 = pct(rhat(g, K, 36));
      const why = {
        pow: `r(n) = ${String(p[0].toFixed(3)).replace('.', ',')} · n<sup>−${String(p[1].toFixed(3)).replace('.', ',')}</sup>: отток замедляется, кривая падает всё медленнее. Прогноз на месяц 12 — ${r12}%, на месяц 36 — ${r36}%.`,
        exp: `Каждый месяц уходит одна и та же доля активных — ${pct(1 - Math.exp(-p[1]))}%. Это допущение формулы ARPU/churn. Прогноз на месяц 12 — ${r12}%, на месяц 36 — ${r36}%.`,
        plat: `Кривая выходит на уровень ${pct(p[0])}% и дальше почти не падает. Прогноз на месяц 12 — ${r12}%, на месяц 36 — ${r36}%.`
      }[K];
      $('dh-txt').innerHTML = (H === 6 ? '<b>Горизонт 6 месяцев целиком внутри данных:</b> хвост не участвует, у всех способов LTV одинаковый. ' : '') + why + ` Маржа на активного в хвосте — ${sp(g.mbar)} ₽, средняя за месяцы 4–6.`;
      box.querySelectorAll('.dh-row').forEach(b => b.addEventListener('click', () => { K = b.dataset.k; draw(); }));
      const best = MK.reduce((a, k) => g.mae[k] < g.mae[a] ? k : a, 'pow');
      $('dh-c1').textContent = open ? `Ближе всех к месяцам 7–12 — ${TNAME[best]}: ошибка ${pct(g.mae[best])} п. п.` : 'Шесть месяцев данных — и три разных хвоста';
      $('dh-c2').textContent = `Сумма столбцов — LTV за ${H} мес.: ${sp(L[K])} ₽ на новичка`;
      $('dh-s1').textContent = `${g.name} · хвост: ${TNAME[K]}`;
      $('dh-s2').textContent = `LTV за ${H} мес.: ${sp(L[K])} ₽`;
      $('dh-s3').textContent = open ? `месяцы 7–12: ошибка ${pct(g.mae[K])} п. п., факт LTV12 ${sp(g.real12)} ₽` : 'месяцы 7–12 скрыты';
    }
    function sync() {
      box.querySelectorAll('[data-g]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.g === gi)));
      box.querySelectorAll('.seg [data-k]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === K)));
      box.querySelectorAll('[data-h]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.h === H)));
      $('dh-open').setAttribute('aria-pressed', String(open)); $('dh-open').textContent = open ? 'Спрятать месяцы 7–12' : 'Открыть месяцы 7–12';
    }
    function draw() { sync(); retChart(); rubChart(); side(); }
    box.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => { gi = +b.dataset.g; draw(); }));
    box.querySelectorAll('.seg [data-k]').forEach(b => b.addEventListener('click', () => { K = b.dataset.k; draw(); }));
    box.querySelectorAll('[data-h]').forEach(b => b.addEventListener('click', () => { H = +b.dataset.h; draw(); }));
    $('dh-open').addEventListener('click', () => { open = !open; draw(); });
    $('dh-reset').addEventListener('click', () => { gi = 0; K = 'pow'; H = 24; open = false; draw(); });
    draw();
    if ('ResizeObserver' in window) { let lw = 0; new ResizeObserver(() => { const w = box.clientWidth; if (Math.abs(w - lw) > 4) { lw = w; draw(); } }).observe(box); }
    return {
      redraw: draw,
      describe() {
        const g = W[gi];
        return `когорты: ${g.name} (${g.size} новичков); хвост: ${TNAME[K]}; горизонт ${H} мес.; LTV ${Math.round(ltvW(g, K, H))} ₽ (степенная ${Math.round(ltvW(g, 'pow', H))}, плато ${Math.round(ltvW(g, 'plat', H))}, экспонента ${Math.round(ltvW(g, 'exp', H))}); ` +
          (open ? `месяцы 7–12 открыты: средняя ошибка удержания — степенная ${pct(g.mae.pow, 2)}, плато ${pct(g.mae.plat, 2)}, экспонента ${pct(g.mae.exp, 2)} п. п.; факт LTV за 12 мес. ${Math.round(g.real12)} ₽.` : 'месяцы 7–12 ещё скрыты.');
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-10-2',
    short: 'DA-10',
    title: 'LTV через удержание',
    where: 'блок «Дата аналитика», тема 10 «Юнит-экономика», страница 10.2',
    aiData: 'учебная финансовая выгрузка интернет-магазина: 12 месячных когорт июля 2024 — июня 2025, 25 990 новичков, удержание по месячной активности, LTV по маржинальному доходу на зарегистрированного клиента (LTV за 12 месяцев — 1 413 ₽)',
    scene,
    widgets: { tail: buildTail },
    code: CODE,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'Хвосты подобраны по шести месяцам удержания 12 когорт. Какой ближе всего попадёт в реальные месяцы 7–12?', opts: [['Экспонента: каждый месяц уходит одна и та же доля'], ['Степенная кривая: отток замедляется', 1], ['Плато: кривая скоро перестанет падать'], ['Все три почти совпадут']],
      why: 'Средняя ошибка в месяцах 7–12: у степенной кривой 0,54 п. п., у плато 1,18, у экспоненты 4,86 — к месяцу 12 она обещает 5,5% активных вместо 11,8%. Плато почти угадывает месяц 7, но потом застывает на 14%, а реальная кривая продолжает медленно падать. Совпасть хвосты не могут: внутри данных они близки, а за их пределами расходятся тем сильнее, чем дальше горизонт. Учебные данные сгенерированы со степенным удержанием, на ваших победитель может быть другим.' },
    q2: { sec: 'idea', q: 'В сцене три пунктира выходят из одной точки, а LTV за 36 месяцев у них 1 826, 2 484 и 2 799 ₽. Откуда разница?', opts: [['Из разной маржи на активного в хвосте'], ['Из допущения о форме кривой там, где данных нет', 1], ['Из шума: при другом зерне бутстрэпа числа сойдутся'], ['Одна из кривых плохо проходит через данные']],
      why: 'Маржа в хвосте у всех трёх одинаковая — 475 ₽ на активного, и все три кривые хорошо проходят через месяцы 1–12. Разница рождается за горизонтом данных: экспонента считает отток постоянным, степенная — замедляющимся, плато — прекратившимся. Бутстрэп здесь ни при чём: он оценивает разброс по когортам при одном способе, а не выбор способа.' },
    q3: { sec: 'idea', q: 'Отток в когортах падает: 64,6% после месяца 0, около 5% к концу года. Аналитик подставил в ARPU/churn отток клиентов старше полугода и получил 8 749 ₽. Почему это завышение?', opts: [['При падающем оттоке ARPU/churn завышает LTV всегда, какой отток ни подставь'], ['Новичку с первого месяца приписан низкий отток переживших первые месяцы, а две трети новичков уходят сразу', 1], ['Формула не учитывает дисконтирование'], ['Отток надо считать по людям — 66%, тогда формула верна']],
      why: 'ARPU/churn предполагает постоянный отток. Если взять отток старожилов, новичку приписывают их верность, хотя после месяца 0 исчезает 64,6% активных: 8 749 ₽ против 2 484 ₽ даже с длинным степенным хвостом. Но «всегда завышает» — неверно: отток первого месяца в той же формуле даёт 707 ₽, вдвое меньше факта за год, — направление ошибки зависит от того, чей отток подставить. Дисконт меняет LTV на проценты, а не в разы. Отток по людям (66%) здесь вообще не отток: больше половины «ушедших» возвращаются в следующие полгода.' },
    q4: { sec: 'idea', q: 'Какой горизонт LTV взять, чтобы решить, сколько платить за установку мобильной игры?', opts: [['Бесконечный: игрок может играть годами'], ['Короткий: срок, за который закупка должна окупиться и на который хватает данных, — месяцы, а не годы', 1], ['Как у интернет-магазина: 36 месяцев'], ['Один день: всё, что дальше, — прогноз']],
      why: 'Горизонт выбирают под решение. Закупка трафика должна вернуть деньги в обозримый срок, а кривая удержания игры известна на коротком отрезке: всё, что дальше, — хвост, нарисованный моделью, и при высокой ставке дисконта он ещё и обесценен. Бесконечный горизонт для степенной кривой вообще не определён. Чужой горизонт не подходит: у магазина и игры разные кривые и экономика. Один день отбрасывает почти все деньги, которые игрок приносит в первые недели.' },
    q5: { sec: 'idea', q: 'Онбординг поднял удержание месяца 1 с 35,4 до 40,4%, а дальше кривая падает как раньше: каждый месяц — та же доля от предыдущего. Что станет с LTV за 12 месяцев (было 1 413 ₽)?', opts: [['+19 ₽: прибавились 5% активных в месяц 1, по 384 ₽'], ['+123 ₽: месяцы 1–11 выросли на 14%, месяц 0 — нет', 1], ['+14%, до 1 612 ₽'], ['+5%: удержание выросло на 5 пунктов']],
      why: 'Если доли «следующий месяц от предыдущего» прежние, вся кривая начиная с месяца 1 умножается на 40,4 / 35,4 = 1,141. Месяцы 1–11 давали 1 413 − 543 = 870 ₽, станут 993 ₽: LTV12 = 1 536 ₽, +8,7%. «+19 ₽» верно, только если вырос один месяц 1, а улучшение первого опыта обычно поднимает всю кривую. «+14% ко всему» забывает, что месяц 0 (543 ₽, 38% LTV) не меняется. Пункты удержания и проценты LTV — разные величины. Для LTV за 24 месяца со степенным хвостом прирост больше: 2 011 → 2 219 ₽.' },
    q6: { sec: 'code', q: 'Что делает эта строка из блока бутстрэпа?', code: 'boot = np.array([ltv12_24(rng.integers(0, 12, size=12)) for _ in range(2000)])', lang: 'python', opts: [['Перемешивает клиентов внутри когорт'], ['2 000 раз выбирает 12 когорт с возвращением и пересчитывает LTV', 1], ['Делит когорты на обучающие и проверочные'], ['Берёт 2 000 случайных клиентов из каждой когорты']],
      why: 'rng.integers(0, 12, size=12) — 12 случайных номеров когорт от 0 до 11 с повторами: это выборка с возвращением, единица выборки — когорта. ltv12_24 считает по ней LTV за 12 месяцев и LTV за 24 со степенным хвостом, подобранным заново. Разброс 2 000 пересчётов даёт интервал. Клиентов код не перемешивает и не выбирает, и деления на обучение и проверку здесь нет.' },
    q7: { sec: 'nuances', q: 'Средняя кривая по всем когортам на месяце 1 опирается на 23 когорты, на месяце 18 — на шесть самых старых. Что будет, если продлить по ней хвост для новичков 2026 года?', opts: [['Ничего: средняя кривая учитывает все когорты'], ['Хвост будет завышен: старые когорты удерживаются лучше новых', 1], ['Хвост будет занижен: в старых когортах меньше клиентов'], ['Хвост будет точнее: по старым когортам больше данных']],
      why: 'Дальние точки средней кривой собраны только из когорт второй половины 2024 года, а они лучше новых: в месяц 1 — 36,5% против 30,8% у когорт первой половины 2026-го, в месяц 3 — 23,8% против 20,4%. Продлевая хвост по ним, новичкам приписывают чужое удержание. Это ошибка выжившего: дальние месяцы видны только у тех, кто пришёл давно. Размер когорт на долю не влияет, а «больше данных» о других людях не делает прогноз точнее для этих.' }
    },
    glossary: {
      ltv: { t: 'LTV', en: 'lifetime value, LTV; customer lifetime value, CLV', d: 'Маржинальный доход, который в среднем приносит один клиент за выбранный горизонт.' },
      cohort: { t: 'Когорта', en: 'cohort', d: 'Клиенты, зарегистрированные в один месяц.' },
      horizon: { t: 'Горизонт LTV', en: 'LTV horizon', d: 'Срок, за который складывают доход клиента: 6, 12, 24 месяца вместо бесконечности.' },
      interval: { t: 'Интервал для LTV', en: 'confidence interval', d: 'Диапазон, в который LTV попадает при пересчёте на других когортах в 95% случаев.' },
      margin: { t: 'Маржинальный доход', en: 'contribution margin', d: 'Выручка минус себестоимость, доставка и эквайринг.' },
      retention: { t: 'Удержание', en: 'retention', d: 'Доля когорты, активной в месяц n после регистрации.' },
      extrap: { t: 'Экстраполяция', en: 'extrapolation', d: 'Продление закономерности за пределы данных, по которым её подобрали.' },
      churn: { t: 'Отток за период', en: 'churn rate', d: 'Доля активной части когорты, которой не стало к следующему периоду: 1 − r(n + 1) / r(n).' },
      arpu: { t: 'ARPU', en: 'average revenue per user', d: 'Средний доход на пользователя за период; здесь — маржа на активного клиента в месяц.' },
      cac: { t: 'CAC', en: 'customer acquisition cost', d: 'Стоимость привлечения клиента: расходы канала, делённые на привлечённых.' },
      power: { t: 'Степенная кривая', en: 'power law', d: 'r(n) = a · n в степени −b: падает всё медленнее; в логарифмических осях — прямая.' },
      expcurve: { t: 'Экспонента', en: 'exponential decay', d: 'Кривая, у которой каждый период уходит одна и та же доля: отток постоянен.' },
      plateau: { t: 'Плато', en: 'plateau', d: 'Уровень, на котором кривая удержания перестаёт падать.' },
      lsq: { t: 'Метод наименьших квадратов', en: 'least squares', d: 'Подбор параметров кривой, при котором сумма квадратов отклонений от данных минимальна.' },
      discount: { t: 'Дисконтирование', en: 'discounting', d: 'Приведение будущих денег к сегодняшним: доход месяца n делят на (1 + d) в степени n.' },
      rate: { t: 'Ставка дисконтирования', en: 'discount rate', d: 'Цена ожидания денег для компании, в процентах за период; её задают финансисты.' },
      bootstrap: { t: 'Бутстрэп', en: 'bootstrap', d: 'Пересчёт метрики на многих выборках с возвращением из своих данных; разброс даёт интервал.' },
      survivor: { t: 'Ошибка выжившего', en: 'survivorship bias', d: 'Вывод по тем, кто дожил до конца наблюдения: здесь — дальние месяцы старых когорт.' },
      heavytail: { t: 'Тяжёлый хвост', en: 'heavy tail', d: 'Распределение, где немногие крупные значения дают большую долю суммы.' },
      bgnbd: { t: 'BG/NBD', en: 'beta-geometric / negative binomial distribution', d: 'Вероятностная модель покупок клиента, который может незаметно уйти.' },
      gbm: { t: 'Градиентный бустинг', en: 'gradient boosting', d: 'Ансамбль деревьев решений, где каждое следующее исправляет ошибки предыдущих.' }
    },
    materials: [
      ['da-10-2-ltv-retention.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/unit/', 'Учебные данные темы 10 — общий набор: клиенты, заказы, активность по месяцам, расходы на маркетинг; загрузка в PostgreSQL 16, генератор'],
      ['ltv_cohorts.sql', 'LTV когорт из таблицы заказов для PostgreSQL 16'],
      ['ltv_tail.ipynb', 'Удержание, три хвоста через curve_fit, рисунок и бутстрэп по когортам']
    ],
    prompts: [
      ['Мой хвост', 'Я опишу удержание своего продукта по месяцам. Помоги вопросами выбрать способ дорисовать хвост и горизонт LTV, опираясь на источник. Готового ответа не давай.'],
      ['ARPU/churn на проверке', 'Дай мне кривую удержания с падающим оттоком. Я посчитаю LTV суммой по месяцам и по ARPU/churn, а ты проверишь и спросишь, откуда расхождение.'],
      ['Интервал по когортам', 'Спроси меня, почему бутстрэп для LTV делают по когортам, а не по клиентам, и какой неопределённости такой интервал не учитывает. Веди вопросами, по одному.']
    ]
  };
})();
