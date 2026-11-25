/* Страница 10.1 · CAC, ARPU, маржа */
(() => {
  // Данные и настоящий вывод кода вписывает data/gen_page.py — руками не править
  /*data:start*/const DATA = {"wf":{"gmv":382.34,"discount":18.66,"paid":363.69,"seller":59.24,"revenue":304.44,"refund_loss":14.95,"net":289.49,"cogs_k":182.2,"deliv":19.18,"payment_fee":8.0,"cm":80.11,"gp":107.29},"mix":{"mpOrders":24.1,"mpGmv":19.2,"mpRev":3.4,"refunds":4663,"refShare":5.5,"refMp":7.1,"refOwn":4.9,"discOrders":40.6,"discGmv":4.9,"checkMean":4269,"checkMed":2900,"cmShare":27.7,"gm":37.1,"buyers":42804,"buyShare":70.7},"order":{"n":57307,"paid":3186,"cogs":2081,"deliv":251,"fee":70,"cm":783,"cm9":472,"drop":40,"more":66},"orderMp":{"paid":3404,"rev":511,"cm":436},"chan":{"органика":{"spend":0,"new":27742,"payers":20390,"orders":43849,"paid":192662380,"cm":42525261,"net":154157800},"поиск":{"spend":23624000,"new":15691,"payers":10952,"orders":22193,"paid":98263660,"cm":21621169,"net":78933580},"соцсети":{"spend":25973000,"new":8505,"payers":3735,"orders":5637,"paid":18531950,"cm":3650918,"net":14412920},"партнёры":{"spend":10816000,"new":8566,"payers":7727,"orders":13513,"paid":54227630,"cm":12308148,"net":41984700}},"cac":{"поиск":1506,"соцсети":3054,"партнёры":1263},"cacB":{"поиск":2157,"соцсети":6954,"партнёры":1400},"blend":{"ads":1844,"all":998,"x":1.85,"adsBuyer":2695,"spend":60.41},"nosoc":{"cac":1420,"cm":1399,"ret":98.5},"soc":{"spendShare":43,"newShare":26,"ret":14,"adsRet":62},"welcome":{"search":208,"searchCac":1714,"org":211,"orgMln":5.84},"scene":{"cac":1506,"spend":23.62,"new":15691,"inc":{"paid":[2550.4,639.4,527.8,453.9,348.0,418.9,351.4,276.8,300.1,274.3,312.5,272.2,275.0,226.5,184.0,287.3,213.7,259.1,156.3,162.0,187.1,227.6,143.7,101.2],"seller":[417.5,102.8,89.5,64.5,57.3,53.1,48.4,48.9,38.4,45.3,41.1,48.1,33.3,30.2,32.5,40.7,25.8,24.0,29.2,29.9,45.1,20.2,32.4,10.3],"refund_loss":[98.8,28.5,20.7,29.3,10.8,16.0,18.6,13.6,7.4,7.9,14.5,12.6,4.9,10.1,9.1,10.4,6.3,2.3,4.9,6.7,3.3,13.4,0.0,0.0],"cogs_k":[1320.9,319.6,259.5,225.6,174.0,219.0,177.0,131.7,160.0,137.9,158.4,130.5,149.9,116.0,87.5,145.7,113.9,145.3,75.0,78.7,84.1,120.9,66.4,57.0],"deliv":[134.5,34.5,27.1,24.2,18.1,20.3,17.8,14.1,14.6,13.4,15.6,14.5,13.9,11.3,10.3,13.3,11.0,12.6,7.6,10.5,8.8,11.1,8.5,6.6],"payment_fee":[56.1,14.1,11.6,10.0,7.7,9.2,7.7,6.1,6.6,6.0,6.9,6.0,6.0,5.0,4.0,6.3,4.7,5.7,3.4,3.6,4.1,5.0,3.2,2.2],"cm":[522.6,140.0,119.4,100.2,80.3,101.3,81.8,62.5,73.2,63.8,76.0,60.5,67.0,53.9,40.6,70.9,52.0,69.1,36.1,32.7,41.7,57.0,33.2,25.1],"net":[2034.1,508.1,417.6,360.0,279.9,349.9,284.3,214.3,254.4,221.1,256.9,211.5,236.8,186.2,142.4,236.2,181.5,232.8,122.1,125.4,138.8,194.0,111.2,90.9]},"chips":[1321,516,134,56],"socCac":3054,"soc":[204.8,41.8,36.2,21.8,15.9,24.5,27.4,15.9,17.3,12.5,12.3,18.8,10.4,8.5,16.8,19.8,9.8,14.1,9.4,13.5,11.9,9.0,1.4,2.1],"pay":12,"observed1":14920,"act1":36,"buy1":13,"socRev24":2242},"arpu":{"rev":18.69,"payers":4545,"active":11065,"base":60504,"arppu":4112,"arpuA":1689,"arpuB":309,"xA":2.4,"xB":13,"payShare":41,"kept":4322,"arppuKept":4324,"orders":5311,"freq":1.17,"check":4400,"revOrder":3519},"lag":{"earlier":68,"searchYoung":58,"m0":35}};
  const OUT = {"cac_sql": "-- CAC по каналам: расходы канала (маркетинг) / новые клиенты канала (продукт)\nWITH spend AS (\n  SELECT channel, SUM(spend) AS spend\n  FROM marketing_spend\n  GROUP BY channel\n), newbies AS (\n  SELECT c.channel,\n         COUNT(*) AS new_clients,\n         COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM orders AS o\n                                        WHERE o.client_id = c.client_id)) AS buyers\n  FROM clients AS c\n  GROUP BY c.channel\n), by_channel AS (\n  SELECT n.channel, s.spend, n.new_clients, n.buyers\n  FROM newbies AS n\n  LEFT JOIN spend AS s USING (channel)      -- в выгрузке нет расходов по органическому каналу\n), blended AS (\n  SELECT 'вся реклама' AS channel, SUM(spend) AS spend,\n         SUM(new_clients) FILTER (WHERE spend IS NOT NULL) AS new_clients,\n         SUM(buyers) FILTER (WHERE spend IS NOT NULL) AS buyers\n  FROM by_channel\n  UNION ALL\n  SELECT 'вся реклама + органика', SUM(spend), SUM(new_clients), SUM(buyers)\n  FROM by_channel\n)\nSELECT channel,\n       ROUND(spend / 1e6, 2) AS spend_mln,\n       new_clients, buyers,\n       ROUND(spend::numeric / new_clients) AS cac,\n       ROUND(spend::numeric / buyers) AS cac_buyer\nFROM (SELECT * FROM by_channel UNION ALL SELECT * FROM blended) AS t\nORDER BY spend IS NOT NULL, new_clients;", "cac": "        channel         | spend_mln | new_clients | buyers | cac  | cac_buyer \n------------------------+-----------+-------------+--------+------+-----------\n органика               |      NULL |       27742 |  20390 | NULL |      NULL\n соцсети                |     25.97 |        8505 |   3735 | 3054 |      6954\n партнёры               |     10.82 |        8566 |   7727 | 1263 |      1400\n поиск                  |     23.62 |       15691 |  10952 | 1506 |      2157\n вся реклама            |     60.41 |       32762 |  22414 | 1844 |      2695\n вся реклама + органика |     60.41 |       60504 |  42804 |  998 |      1411\n(6 rows)", "arpu_sql": "-- ARPU и ARPPU по месяцам: одна выручка, три знаменателя\nWITH rev AS (                              -- чистая выручка: без возвращённых заказов\n  SELECT to_char(order_date, 'YYYY-MM') AS month,\n         SUM(revenue) FILTER (WHERE refunded = 0) AS net_revenue,\n         COUNT(DISTINCT client_id) AS payers   -- оплатил хотя бы один заказ\n  FROM orders\n  GROUP BY 1\n), act AS (                                -- заходил в месяце, даже без покупки\n  SELECT month, COUNT(*) AS active\n  FROM activity\n  GROUP BY month\n), base AS (                               -- зарегистрированы к концу месяца\n  SELECT month, SUM(COUNT(*)) OVER (ORDER BY month) AS registered\n  FROM (SELECT to_char(signup_date, 'YYYY-MM') AS month FROM clients) AS s\n  GROUP BY month\n)\nSELECT month, net_revenue, payers, active, registered,\n       ROUND(net_revenue::numeric / payers) AS arppu,\n       ROUND(net_revenue::numeric / active) AS arpu_active,\n       ROUND(net_revenue::numeric / registered) AS arpu_base\nFROM rev\nJOIN act USING (month)\nJOIN base USING (month)\nWHERE month >= '2025-07'\nORDER BY month;", "arpu": "  month  | net_revenue | payers | active | registered | arppu | arpu_active | arpu_base \n---------+-------------+--------+--------+------------+-------+-------------+-----------\n 2025-07 |    11894230 |   2924 |   7221 |      28432 |  4068 |        1647 |       418\n 2025-08 |    11332390 |   2773 |   7151 |      30486 |  4087 |        1585 |       372\n 2025-09 |    13813420 |   3344 |   7877 |      33062 |  4131 |        1754 |       418\n 2025-10 |    14354220 |   3545 |   8224 |      35837 |  4049 |        1745 |       401\n 2025-11 |    16813340 |   3967 |   8996 |      38912 |  4238 |        1869 |       432\n 2025-12 |    19511350 |   4867 |  10116 |      42443 |  4009 |        1929 |       460\n 2026-01 |    16122840 |   4155 |   9727 |      45410 |  3880 |        1658 |       355\n 2026-02 |    16336980 |   4131 |   9996 |      48227 |  3955 |        1634 |       339\n 2026-03 |    17744530 |   4354 |  10379 |      51495 |  4075 |        1710 |       345\n 2026-04 |    18609270 |   4551 |  10795 |      54680 |  4089 |        1724 |       340\n 2026-05 |    17193960 |   4373 |  10470 |      57437 |  3932 |        1642 |       299\n 2026-06 |    18690180 |   4545 |  11065 |      60504 |  4112 |        1689 |       309\n(12 rows)", "unit_py": "import numpy as np\nimport pandas as pd\n\nclients = pd.read_csv(\"data/unit/clients.csv\", parse_dates=[\"signup_date\"])\norders = pd.read_csv(\"data/unit/orders.csv\", parse_dates=[\"order_date\"])\nspend = pd.read_csv(\"data/unit/marketing_spend.csv\")\n\n# маржинальный доход заказа по соглашению учебника\norders[\"cm\"] = np.where(orders.refunded == 1,\n                        -2 * orders.delivery_cost - orders.payment_fee,   # товар вернулся, доставка дважды\n                        orders.revenue - orders.cogs - orders.delivery_cost - orders.payment_fee)\nmonth = lambda d: d.dt.year * 12 + d.dt.month                            # номер месяца\nclients[\"cohort\"] = month(clients.signup_date)\norders = orders.merge(clients[[\"client_id\", \"channel\", \"cohort\"]], on=\"client_id\")\norders[\"n\"] = month(orders.order_date) - orders.cohort                     # месяц жизни, 0 — месяц регистрации\nLAST = 2026 * 12 + 6                                                        # июнь 2026\n\n\ndef avg_client(ch):\n    \"\"\"Накопленный маржинальный доход на одного клиента за месяцы 0–23.\n    Для каждого месяца n берём когорты, по которым этот месяц уже попал в выгрузку.\n    Доход за месяц делим на число всех клиентов этих когорт, включая тех, кто ничего не купил.\"\"\"\n    cl, od = clients[clients.channel == ch], orders[orders.channel == ch]\n    return pd.Series([od.cm[od.n == n].sum() / (cl.cohort <= LAST - n).sum() for n in range(24)]).cumsum()\n\n\n# сводная за 24 месяца данных: продукт + маркетинг + финансы\nt = orders.groupby(\"channel\").agg(payers=(\"client_id\", \"nunique\"), orders=(\"order_id\", \"size\"),\n                                  paid=(\"paid\", \"sum\"), cm=(\"cm\", \"sum\"))\nt[\"new\"] = clients.channel.value_counts()\nt[\"spend\"] = spend.groupby(\"channel\").spend.sum()                          # у органики NaN\nt.loc[\"вся реклама\"] = t.drop(\"органика\").sum()\n\nu = pd.DataFrame({\n    \"привлечено\": t.new,\n    \"доля платящих\": t.payers / t.new,\n    \"заказов на платящего\": t.orders / t.payers,\n    \"средний чек, ₽\": t.paid / t.orders,\n    \"маржа с чека, %\": t.cm / t.paid * 100,\n    \"CAC, ₽\": t.spend / t.new,\n    \"МД на клиента, ₽\": t.cm / t.new,                                       # МД — маржинальный доход\n})\nu[\"МД − CAC, ₽\"] = u[\"МД на клиента, ₽\"] - u[\"CAC, ₽\"]\nfor ch in [\"органика\", \"поиск\", \"соцсети\", \"партнёры\"]:\n    cum = avg_client(ch)\n    u.loc[ch, \"МД за 12 мес. жизни, ₽\"] = cum[11]\n    paid_back = cum[cum >= u.loc[ch, \"CAC, ₽\"]]\n    u.loc[ch, \"окупился в месяц n\"] = paid_back.index[0] if len(paid_back) else np.nan\n\nu = u.reindex([\"органика\", \"поиск\", \"соцсети\", \"партнёры\", \"вся реклама\"])\ntwo = {\"доля платящих\", \"заказов на платящего\"}\nshow = u.T.apply(lambda r: r.map((\"{:.2f}\" if r.name in two else \"{:.1f}\" if \"%\" in r.name else \"{:,.0f}\").format), axis=1)\nprint(show.replace({\"nan\": \"—\"}).replace(\",\", \" \", regex=True).to_string())", "unit": "channel                органика   поиск соцсети партнёры вся реклама\nпривлечено               27 742  15 691   8 505    8 566      32 762\nдоля платящих              0.73    0.70    0.44     0.90        0.68\nзаказов на платящего       2.15    2.03    1.51     1.75        1.84\nсредний чек, ₽            4 394   4 428   3 288    4 013       4 137\nмаржа с чека, %            22.1    22.0    19.7     22.7        22.0\nCAC, ₽                        —   1 506   3 054    1 263       1 844\nМД на клиента, ₽          1 533   1 378     429    1 437       1 147\nМД − CAC, ₽                   —    -128  -2 625      174        -697\nМД за 12 мес. жизни, ₽    1 670   1 482     449    1 498           —\nокупился в месяц n            —      12       —        6           —"};/*data:end*/

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => (t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
  const lerp = (a, b, t) => a + (b - a) * t;
  const X = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const NB = '\u00A0', MINUS = '−';
  const nf = (v, d = 0) => Number(v).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/\s/g, NB);
  const sg = v => (v > 0 ? '+' : v < 0 ? MINUS : '');
  const rub = v => `${nf(v)}${NB}₽`;
  const srub = v => `${sg(Math.round(v))}${nf(Math.abs(Math.round(v)))}${NB}₽`;
  const mln = (v, d = 2) => `${nf(v / 1e6, d)}${NB}млн${NB}₽`;
  const f1 = n => (Math.round(n * 10) / 10).toString();
  // согласование с числом: 1 клиент, 2 клиента, 5 клиентов; формы — для управления «на N …», «получил N …»
  const pl = (n, one, few, many) => { const a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many; };

  const SC = DATA.scene, CH = DATA.chan, AR = DATA.arpu, BL = DATA.blend;
  const cumOf = arr => arr.reduce((o, v) => (o.push((o.length ? o[o.length - 1] : 0) + v), o), []);
  const CUM = cumOf(SC.inc.cm), CUMR = cumOf(SC.inc.net), CUMS = cumOf(SC.soc);
  const at = (cum, m) => (m < 0 ? 0 : m >= cum.length - 1 ? cum[cum.length - 1] : lerp(cum[Math.floor(m)], cum[Math.floor(m) + 1], m - Math.floor(m)));
  const CHIPS = ['себестоимость', 'доля продавцов и возвраты', 'доставка', 'эквайринг'].map((nm, i) => [nm, SC.chips[i]]);

  /* ===================== Сцена: клиент на весах ===================== */
  const C = { ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#7c87a0', line: '#2a3550', node: '#121a2b', amb: '#e5a63c', ambF: '#3a2c14', acc: '#36b8a6', accF: '#12302c', cost: '#5d6880', rev: '#8fb3ff', red: '#f2756a' };

  // состояние сцены по шагу k и прогрессу p: всё детерминировано
  function sceneState(k, p) {
    const e = (a, b) => ease(seg(p, a, b));
    const st = { k, soc: k === 9, mode: k === 8 ? 'rev' : 'cm', client: k === 0 ? e(0, .15) : 1, coins: k === 0 ? p : -1,
      cac: k === 0 ? SC.cac * e(.1, .85) : k === 9 ? SC.socCac : SC.cac, wFly: k === 1 ? e(.05, .55) : k > 1 ? 1 : 0,
      pay: -1, chips: k === 3 ? e(.05, .6) : 0, drop: k === 3 ? e(.6, .85) : 0, m: -1, stream: 0, call: p >= .45 ? k : -1 };
    if (k === 0) st.wFly = -1;
    if (k === 2) { st.pay = e(.05, .6); st.m = 0; }
    if (k === 3) { st.pay = 1; st.m = 0; }
    const cmAt = m => at(CUM, m);
    if (k <= 2) st.val = 0;
    else if (k === 3) st.val = CUM[0] * st.drop;
    else if (k === 4) { st.m = lerp(0, 5, e(.05, .9)); st.val = cmAt(st.m); st.stream = p < .92 ? 1 : 0; }
    else if (k === 5) { st.m = lerp(5, 11, e(.05, .9)); st.val = cmAt(st.m); st.stream = p < .92 ? 1 : 0; }
    else if (k === 6) { st.m = lerp(11, 12, e(.1, .6)); st.val = cmAt(st.m); st.stream = p < .62 ? 1 : 0; }
    else if (k === 7) { st.m = lerp(12, 23, e(.05, .85)); st.val = cmAt(st.m); st.stream = p < .88 ? 1 : 0; }
    else if (k === 8) { st.m = 0; st.val = CUMR[0] * e(.05, .5); st.cmIn = CUM[0] * e(.3, .7); }
    else if (k === 9) { st.m = lerp(0, 23, e(.08, .85)); st.val = at(CUMS, st.m); st.stream = p < .88 ? 1 : 0; }
    st.onPans = st.wFly >= 1 || k >= 2;
    return st;
  }
  const T = (x, y, s, o = {}) => `<text x="${f1(x)}" y="${f1(y)}"${o.a ? ` text-anchor="${o.a}"` : ''} style="font-size:${o.fs || 11}px;fill:${o.c || C.ink}${o.w ? ';font-weight:' + o.w : ''}${o.op != null ? ';opacity:' + o.op.toFixed(2) : ''}${o.ls ? ';letter-spacing:' + o.ls : ''}"${o.halo ? ' class="ue-halo"' : ''}>${X(s)}</text>`;
  const coin = (x, y, r, fill, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" style="fill:${fill};stroke:#0b0f19;stroke-width:1.5;opacity:${op.toFixed(2)}"/>`;
  const rect = (x, y, w, h, fill, stroke, op = 1, rx = 6) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0, w))}" height="${f1(Math.max(0, h))}" rx="${rx}" style="fill:${fill};stroke:${stroke || 'none'};opacity:${op.toFixed(2)}"/>`;

  function layout(W, H) {
    const nar = W < 520;
    const L = { nar, W, H };
    L.ax = 2; L.ay = 2; L.aw = nar ? 96 : 132; L.ah = nar ? 42 : 48;
    L.cx = nar ? Math.max(W * .44, L.aw + 40) : Math.max(W * .33, L.aw + 70); L.cy = 30;
    L.bx = W / 2; L.half = Math.min(W * .3, 210); L.by = H - (nar ? 112 : 142); L.panDY = nar ? 74 : 82;
    L.lpx = L.bx - L.half; L.rpx = L.bx + L.half;
    L.payY = L.cy + 2;
    L.chipY = L.cy + (nar ? 48 : 46);
    L.chipX0 = nar ? 4 : L.cx + 24; L.chipW = ((W - 4) - L.chipX0 - 8) / 2; L.chipH = 30;
    L.sy0 = L.chipY + 2 * L.chipH + (nar ? 26 : 34); L.sh = Math.max(36, Math.min(70, L.by - 110 - L.sy0));
    L.sx0 = nar ? 6 : 30; L.sx1 = W - 6; L.slot = (L.sx1 - L.sx0) / 24;
    return L;
  }
  const PMAX = SC.inc.paid[1];                     // шкала полосок: платёж месяца 1, месяц 0 обрезан
  const ang = (r, l) => 9 * Math.tanh((r - l) / 220) * Math.PI / 180;
  let NAR = false;
  const stackH = v => (NAR ? Math.min(50, 36 * v / SC.cac) : Math.min(66, 50 * v / SC.cac));

  function drawScene(W, H, st) {
    const L = layout(W, H), soc = st.soc, calls = [];
    NAR = L.nar;
    const fs = L.nar ? 9.5 : 10.5;
    let h = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Весы показывают, покрывает ли накопленный маржинальный доход расходы на привлечение клиента">`;
    // реклама
    h += rect(L.ax, L.ay, L.aw, L.ah, C.ambF, C.amb, 1, 9);
    h += T(L.ax + 10, L.ay + 16, 'РЕКЛАМА', { fs: fs - .5, c: C.amb, ls: '.08em' });
    h += T(L.ax + 10, L.ay + (L.nar ? 33 : 36), soc ? (L.nar ? 'соцсети' : `соцсети · ${nf(CH['соцсети'].spend / 1e6, 2)} млн ₽`) : (L.nar ? 'поиск' : `поиск · ${nf(SC.spend, 2)} млн ₽`), { fs: fs + 1, c: C.ink });
    // монеты рекламы летят в клиента
    if (st.coins >= 0) for (let i = 0; i < 6; i++) {
      const t = seg(st.coins, .08 + i * .1, .3 + i * .1);
      if (t > 0 && t < 1) {
        const x0 = L.ax + L.aw - 6, y0 = L.ay + L.ah / 2, x = lerp(x0, L.cx - 8, t), y = lerp(y0, L.cy, t) - Math.sin(t * Math.PI) * 18;
        h += coin(x, y, 6, C.amb);
      }
    }
    // клиент
    const cop = st.client;
    h += `<g style="opacity:${cop.toFixed(2)}"><circle cx="${f1(L.cx)}" cy="${f1(L.cy - 13)}" r="10" style="fill:${C.node};stroke:${C.ink2};stroke-width:1.6"/>`;
    h += `<path d="M${f1(L.cx - 17)},${f1(L.cy + 18)} Q${f1(L.cx - 17)},${f1(L.cy)} ${f1(L.cx)},${f1(L.cy)} Q${f1(L.cx + 17)},${f1(L.cy)} ${f1(L.cx + 17)},${f1(L.cy + 18)} Z" style="fill:${C.node};stroke:${C.ink2};stroke-width:1.6"/>`;
    h += T(L.cx, L.cy + 31, soc ? 'клиент из соцсетей' : 'клиент из поиска', { fs, a: 'middle', c: C.ink2 }) + '</g>';
    // ярлык CAC на клиенте (шаг 0) и груз, который летит на левую чашу
    const ang0 = st.onPans ? ang(st.val, st.cac) : 0;
    const lyEnd = L.by - L.half * Math.sin(ang0), ryEnd = L.by + L.half * Math.sin(ang0);
    const panDY = L.panDY, lPanY = lyEnd + panDY, rPanY = ryEnd + panDY;
    const wh = stackH(st.cac), ww = L.nar ? 58 : 66;
    if (st.wFly < 0 && st.cac > 1) h += rect(L.cx + 22, L.cy - 6, L.nar ? 54 : 62, 18, C.ambF, C.amb, 1, 5) + T(L.cx + 22 + (L.nar ? 27 : 31), L.cy + 7, nf(Math.round(st.cac)), { fs: fs + .5, a: 'middle', c: C.amb, w: 600 });
    // весы: стойка, коромысло, чаши
    h += `<path d="M${f1(L.bx)},${f1(L.by + 4)} L${f1(L.bx - 22)},${f1(H - 2)} L${f1(L.bx + 22)},${f1(H - 2)} Z" style="fill:${C.node};stroke:${C.line};stroke-width:1.4"/>`;
    h += `<line x1="${f1(L.lpx)}" y1="${f1(lyEnd)}" x2="${f1(L.rpx)}" y2="${f1(ryEnd)}" style="stroke:${C.ink2};stroke-width:3;stroke-linecap:round"/>`;
    h += `<circle cx="${f1(L.bx)}" cy="${f1(L.by)}" r="4" style="fill:${C.ink2}"/>`;
    const pw = L.nar ? 82 : 104;
    [[L.lpx, lyEnd, lPanY], [L.rpx, ryEnd, rPanY]].forEach(([x, y0, y1]) => {
      h += `<line x1="${f1(x)}" y1="${f1(y0)}" x2="${f1(x - pw / 2 + 6)}" y2="${f1(y1)}" style="stroke:${C.line};stroke-width:1.2"/><line x1="${f1(x)}" y1="${f1(y0)}" x2="${f1(x + pw / 2 - 6)}" y2="${f1(y1)}" style="stroke:${C.line};stroke-width:1.2"/>`;
      h += `<path d="M${f1(x - pw / 2)},${f1(y1)} Q${f1(x)},${f1(y1 + 12)} ${f1(x + pw / 2)},${f1(y1)} Z" style="fill:${C.node};stroke:${C.ink2};stroke-width:1.4"/>`;
    });
    h += T(L.lpx, lPanY + 26, 'CAC', { fs, a: 'middle', c: C.mut, ls: '.08em' });
    h += T(L.rpx, rPanY + 26, st.mode === 'rev' ? 'ЧИСТАЯ ВЫРУЧКА' : 'МАРЖИНАЛЬНЫЙ ДОХОД', { fs, a: 'middle', c: C.mut, ls: '.06em' });
    // груз CAC
    if (st.wFly >= 0 && st.cac > 1) {
      const t = st.wFly, x = lerp(L.cx + 22 + ww / 2, L.lpx, t), yb = lerp(L.cy + 12, lPanY, t);
      h += rect(x - ww / 2, yb - wh, ww, wh, C.ambF, C.amb, 1, 5);
      h += T(x, yb - wh / 2 + 4, nf(Math.round(st.cac)), { fs: fs + 1.5, a: 'middle', c: C.amb, w: 600 });
    }
    // стопка справа: маржинальный доход (или выручка на шаге 8)
    if (st.val > 0) {
      const sh = stackH(st.val), win = st.val >= st.cac;
      const col = st.mode === 'rev' ? C.rev : C.acc;
      h += rect(L.rpx - ww / 2, rPanY - sh, ww, sh, st.mode === 'rev' ? '#1b2640' : C.accF, col, 1, 5);
      if (st.mode === 'rev' && st.cmIn > 0) { const ch = stackH(st.cmIn); h += rect(L.rpx - ww / 2 + 4, rPanY - ch - 2, ww - 8, ch - 2, C.accF, C.acc, 1, 3); }
      h += T(L.rpx, rPanY - sh - 7, nf(Math.round(st.val)), { fs: fs + 2, a: 'middle', c: win ? (st.mode === 'rev' ? C.rev : C.acc) : C.ink, w: 600, halo: 1 });
    }
    // платёж месяца 0: монета от клиента вправо, сколы, остаток падает на правую чашу
    const pxEnd = L.nar ? W - 26 : Math.min(W - 40, L.rpx + 40);
    if (st.pay >= 0) {
      const x = lerp(L.cx + 22, pxEnd, st.pay), y = L.payY;
      if (st.drop < 1) {
        const left = SC.inc.paid[0] - (st.chips >= 1 ? SC.inc.paid[0] - SC.inc.cm[0] : 0);
        h += coin(x, y, 13 - 6 * st.chips, C.ink, 1 - st.drop * .3);
        h += T(x, y - (L.nar ? 19 : 20), nf(Math.round(st.chips >= 1 ? SC.inc.cm[0] : left)), { fs: fs + 1, a: 'middle', c: C.ink, w: 600, halo: 1 });
      }
      if (st.drop > 0) {
        const yy = lerp(y, rPanY - stackH(SC.inc.cm[0]) - 8, st.drop), xx = lerp(pxEnd, L.rpx, st.drop);
        if (st.drop < 1) h += coin(xx, yy, 7, C.acc);
      }
    }
    if (st.chips > 0) CHIPS.forEach(([nm, v], i) => {
      const t = seg(st.chips, i * .2, i * .2 + .4);
      if (t <= 0) return;
      const col = i % 2, row = Math.floor(i / 2);
      const x = L.chipX0 + col * (L.chipW + 8), y = L.chipY + row * (L.chipH + 4);
      const y0 = L.payY - 8;
      const yy = lerp(y0, y, t);
      h += `<g style="opacity:${(.2 + .8 * t).toFixed(2)}">${rect(x, yy, L.chipW, L.chipH, '#161d2c', C.cost, 1, 6)}`;
      h += T(x + 8, yy + 12, nm, { fs: fs - .5, c: C.mut }) + T(x + 8, yy + 25, `${MINUS}${nf(v)} ₽`, { fs: fs + 1, c: C.ink2, w: 600 }) + '</g>';
    });
    // поток мелких платежей в месяцах 1…23
    if (st.stream) for (let i = 0; i < 3; i++) {
      const t = ((st.m * 1.7 + i / 3) % 1);
      const x = lerp(L.cx + 22, pxEnd, Math.min(1, t * 1.6)), y = t < .62 ? L.payY : lerp(L.payY, rPanY - 20, (t - .62) / .38);
      const xx = t < .62 ? x : lerp(pxEnd, L.rpx, (t - .62) / .38);
      h += coin(xx, y, 4.5, soc ? C.acc : C.acc, .9);
    }
    // полоски по месяцам: оплачено (контур) и маржинальный доход (заливка)
    const showStrip = st.m >= 0 && st.k >= 2;
    if (showStrip) {
      const paid = soc ? null : SC.inc.paid, cm = soc ? SC.soc : SC.inc.cm, rev = SC.inc.net;
      const base = L.sy0 + L.sh, bw = L.slot * .62;
      h += `<line x1="${f1(L.sx0)}" x2="${f1(L.sx1)}" y1="${f1(base)}" y2="${f1(base)}" style="stroke:${C.line};stroke-width:1"/>`;
      h += T(L.sx0, base + 13, 'месяц 0', { fs: fs - 1, c: C.mut }) + T(L.sx1, base + 13, '23', { fs: fs - 1, c: C.mut, a: 'end' });
      if (!L.nar) h += T(L.sx1, L.sy0 - 4, soc ? 'маржинальный доход по месяцам' : st.mode === 'rev' ? 'чистая выручка и маржинальный доход' : 'платежи и маржинальный доход по месяцам', { fs: fs - 1, c: C.mut, a: 'end' });
      const last = Math.floor(st.m + 1e-9);
      for (let n = 0; n <= last && n < 24; n++) {
        const x = L.sx0 + n * L.slot + (L.slot - bw) / 2;
        const hp = paid ? Math.min(1, paid[n] / PMAX) * L.sh : 0;
        if (paid && st.mode !== 'rev') h += rect(x, base - hp, bw, hp, 'none', C.cost, 1, 2);
        if (st.mode === 'rev') { const hr = Math.min(1, rev[n] / PMAX) * L.sh; h += rect(x, base - hr, bw, hr, '#1b2640', C.rev, 1, 2); }
        const show = n === 0 && st.k === 3 ? st.drop : n === 0 && st.k === 2 ? 0 : 1;
        const hc = Math.min(1, cm[n] / PMAX) * L.sh * show;
        h += rect(x, base - hc, bw, hc, C.acc, 'none', 1, 2);
        if (n === 0 && paid && paid[0] > PMAX && st.mode !== 'rev') h += T(x + bw / 2, base - L.sh - 4, '↑', { fs: fs - 1, a: 'middle', c: C.mut });
      }
    }
    h += '</svg>';
    // выноски
    const cfs = L.nar ? 11 : 12.5;
    const put = (x, y, place, text) => { const w = Math.min(L.nar ? 220 : 290, W - 12, text.length * cfs * .56 + 22); calls.push({ x: clamp(x - w / 2, 6, W - w - 6), y, w, place, text }); };
    const cac = Math.round(st.cac), v = Math.round(st.val);
    const midScale = L.sy0 + L.sh + (L.nar ? 24 : 28);
    switch (st.call) {
      case 0: put(L.cx, L.cy + 40, 'down', `${nf(SC.spend, 2)} млн ₽ / ${nf(SC.new)} ≈ ${nf(SC.cac)} ₽ на клиента`); break;
      case 1: put(L.lpx + (L.nar ? 30 : 0), lPanY - wh - 14, 'up', 'Расходы на привлечение одного клиента'); break;
      case 2: put(pxEnd - 40, L.payY + 22, 'down', `В месяц регистрации заплатили в среднем ${nf(SC.inc.paid[0])} ₽`); break;
      case 3: put(L.rpx - (L.nar ? 30 : 60), midScale, 'down', `Из ${nf(SC.inc.paid[0])} ₽ магазину остаётся ${nf(SC.inc.cm[0])} ₽`); break;
      case 4: put(W / 2, midScale, 'down', `В следующем месяце вернулись ${SC.act1}%, сделали заказ ${SC.buy1}%`); break;
      case 5: put(L.bx, midScale, 'down', `Доход на клиента ${nf(v)} ₽, расходы на привлечение ${nf(cac)} ₽`); break;
      case 6: put(L.rpx - (L.nar ? 30 : 60), midScale, 'down', `Маржинальный доход ${nf(v)} ₽ при CAC ${nf(cac)} ₽`); break;
      case 7: put(L.bx, midScale, 'down', `На ${nf(v - cac)} ₽ больше, чем потратили на привлечение`); break;
      case 8: put(L.rpx - (L.nar ? 30 : 60), midScale, 'down', `Чистая выручка ${nf(v)} ₽, маржинальный доход ${nf(SC.inc.cm[0])} ₽`); break;
      case 9: put(L.bx, midScale, 'down', `Доход на клиента ${nf(v)} ₽ при CAC ${nf(cac)} ₽`); break;
    }
    return { svg: h, calls };
  }

  const S0 = SC.inc, m0 = k => nf(Math.round(S0[k][0]));
  const scene = {
    parts: [{ n: '01', name: 'Привлечение', s: [0, 1] }, { n: '02', name: 'Месяц регистрации', s: [2, 3] }, { n: '03', name: 'После регистрации', s: [4, 5] }, { n: '04', name: 'Окупаемость', s: [6, 7] }, { n: '05', name: 'Ошибки в расчёте', s: [8, 9] }],
    steps: [
      { title: 'Сколько стоит привлечь клиента', dur: 3400, body: `<p>За&nbsp;два года магазин потратил на&nbsp;поисковую рекламу ${nf(SC.spend, 2)}&nbsp;млн&nbsp;₽ и&nbsp;привлёк ${nf(SC.new)} ${pl(SC.new, 'нового клиента', 'новых клиентов', 'новых клиентов')}. В&nbsp;среднем одна регистрация обошлась в&nbsp;<b>${nf(SC.cac)}&nbsp;₽</b>. Это стоимость привлечения клиента (CAC).</p><p>Посмотрим, за&nbsp;сколько месяцев окупится реклама.</p>` },
      { title: 'Что сравниваем на весах', dur: 3000, body: `<p>На&nbsp;левой чаше весов&nbsp;— стоимость привлечения одного клиента, ${nf(SC.cac)}&nbsp;₽. На&nbsp;правую каждый месяц будем добавлять маржинальный доход в&nbsp;расчёте на&nbsp;одного клиента.</p><p>Реклама окупится, когда накопленный доход покроет расходы на&nbsp;привлечение.</p>` },
      { title: 'Покупки в месяц регистрации', dur: 3200, body: `<p>В&nbsp;месяц регистрации (месяц 0 на&nbsp;шкале) клиенты заплатили магазину в&nbsp;среднем <b>${m0('paid')}&nbsp;₽</b> на&nbsp;человека. В&nbsp;расчёт входят все, кто зарегистрировался, включая тех, кто ничего не&nbsp;купил.</p><p>Прежде чем сравнивать эту сумму с&nbsp;CAC, посчитаем, сколько денег осталось магазину.</p>` },
      { title: 'Сколько остаётся магазину', dur: 4000, body: `<p>Из&nbsp;платежей вычитаем себестоимость товаров (${nf(CHIPS[0][1])}&nbsp;₽), долю продавцов маркетплейса и&nbsp;возвраты (${nf(CHIPS[1][1])}&nbsp;₽), доставку (${nf(CHIPS[2][1])}&nbsp;₽) и&nbsp;комиссию за&nbsp;приём оплаты (${nf(CHIPS[3][1])}&nbsp;₽).</p><p>Маржинальный доход за&nbsp;месяц регистрации составил <b>${nf(Math.round(CUM[0]))}&nbsp;₽</b> на&nbsp;клиента. Эту сумму кладём на&nbsp;правую чашу.</p>` },
      { title: 'Кто вернулся в магазин', dur: 4200, body: `<p>Для ${nf(SC.observed1)} клиентов из&nbsp;поиска есть данные и&nbsp;за&nbsp;следующий месяц после регистрации. За&nbsp;этот месяц ${SC.act1}% из&nbsp;них вернулись в&nbsp;магазин, а&nbsp;${SC.buy1}% сделали хотя&nbsp;бы один заказ.</p><p>За&nbsp;первые шесть месяцев на&nbsp;одного клиента пришлось <b>${nf(Math.round(CUM[5]))}&nbsp;₽</b> маржинального дохода.</p>` },
      { title: 'Доход на клиента за год', dur: 4200, body: `<p>Сгруппируем клиентов по&nbsp;месяцу регистрации. Чтобы посчитать доход, например, за&nbsp;двенадцатый месяц, берём группы, для которых этот месяц уже прошёл. Маржинальный доход магазина от&nbsp;их&nbsp;заказов за&nbsp;месяц делим на&nbsp;число всех клиентов в&nbsp;этих группах, включая тех, кто ничего не&nbsp;купил.</p><p>Складываем результаты за&nbsp;12&nbsp;месяцев и&nbsp;получаем <b>${nf(Math.round(CUM[11]))}&nbsp;₽</b> на&nbsp;клиента. При CAC ${nf(SC.cac)}&nbsp;₽ до&nbsp;окупаемости не&nbsp;хватило ${nf(SC.cac - Math.round(CUM[11]))}&nbsp;₽.</p>` },
      { title: 'Когда окупится реклама', dur: 3400, body: `<p>На&nbsp;тринадцатом месяце накопленный маржинальный доход достиг <b>${nf(Math.round(CUM[12]))}&nbsp;₽</b> на&nbsp;клиента. Теперь он покрывает ${nf(SC.cac)}&nbsp;₽, потраченные на&nbsp;привлечение.</p><p>На&nbsp;шкале это месяц 12, поскольку отсчёт начинается с&nbsp;нуля.</p>` },
      { title: 'Доход за два года', dur: 3800, body: `<p>За&nbsp;первые два года на&nbsp;одного клиента из&nbsp;поиска пришлось <b>${nf(Math.round(CUM[23]))}&nbsp;₽</b> маржинального дохода.</p><p>После вычета ${nf(SC.cac)}&nbsp;₽ на&nbsp;привлечение остаётся ${nf(Math.round(CUM[23]) - SC.cac)}&nbsp;₽ на&nbsp;клиента. Из&nbsp;этих денег магазин ещё оплачивает постоянные расходы, например аренду склада.</p>` },
      { title: 'Если считать по выручке', dur: 3800, body: `<p>Если положить на&nbsp;правую чашу чистую выручку, она перевесит уже в&nbsp;месяц регистрации. На&nbsp;клиента приходится <b>${nf(Math.round(CUMR[0]))}&nbsp;₽</b> выручки при CAC ${nf(SC.cac)}&nbsp;₽.</p><p>Вычтем себестоимость, доставку и&nbsp;эквайринг. Останется ${nf(Math.round(CUM[0]))}&nbsp;₽ маржинального дохода, в&nbsp;${nf(CUMR[0] / CUM[0], 1)} раза меньше выручки. За&nbsp;два года чистая выручка превышает маржинальный доход в&nbsp;${nf(CUMR[23] / CUM[23], 1)} раза.</p>` },
      { title: 'Что скрывает средний CAC', dur: 4400, next: 'Читать страницу', body: `<p>На&nbsp;привлечение одного клиента через соцсети магазин потратил в&nbsp;среднем <b>${nf(SC.socCac)}&nbsp;₽</b>. Маржинальный доход за&nbsp;два года составил ${nf(Math.round(CUMS[23]))}&nbsp;₽ на&nbsp;клиента. За&nbsp;это время реклама в&nbsp;соцсетях не&nbsp;окупилась.</p><p>Средний CAC по&nbsp;всем рекламным каналам составляет ${nf(BL.ads)}&nbsp;₽. По&nbsp;этой цифре трудно заметить, насколько дороже привлечение через соцсети.</p>` }
    ],
    hud: [{ id: 'm', label: 'Месяц' }, { id: 'cac', label: 'CAC, ₽' }, { id: 'cum', label: 'Накоплено, ₽' }],
    legend: `<span><i class="sq" style="background:${C.amb}"></i>расходы на привлечение</span><span><i class="sq" style="background:${C.acc}"></i>маржинальный доход</span><span><i class="sq" style="background:${C.cost}"></i>что вычитаем из платежей</span>`,
    info: 'ЮНИТ — КЛИЕНТ',
    aiNote: `За 24 месяца магазин потратил на рекламу в поиске ${nf(SC.spend, 2)} млн ₽ и привлёк ${nf(SC.new)} ${pl(SC.new, 'нового клиента', 'новых клиентов', 'новых клиентов')}. CAC составил ${nf(SC.cac)} ₽ на регистрацию. В месяц регистрации на клиента пришлось ${m0('paid')} ₽ платежей. Из этой суммы вычитаем себестоимость (${nf(CHIPS[0][1])} ₽), долю продавцов маркетплейса и возвраты (${nf(CHIPS[1][1])} ₽), доставку (${nf(CHIPS[2][1])} ₽) и эквайринг (${nf(CHIPS[3][1])} ₽). Остаётся ${nf(Math.round(CUM[0]))} ₽ маржинального дохода при чистой выручке ${nf(Math.round(CUMR[0]))} ₽. В следующем месяце ${SC.act1}% клиентов из поиска вернулись в магазин, а ${SC.buy1}% сделали заказ. Обе доли рассчитаны по ${nf(SC.observed1)} клиентам из поиска, для которых в выгрузке есть данные за следующий месяц после регистрации. Для каждого месяца после регистрации делим маржинальный доход наблюдаемых когорт на исходное число клиентов в них и складываем результаты по месяцам. За 6 месяцев на клиента пришлось ${nf(Math.round(CUM[5]))} ₽ маржинального дохода, за 12 месяцев — ${nf(Math.round(CUM[11]))} ₽, за 13 месяцев — ${nf(Math.round(CUM[12]))} ₽, за 24 месяца — ${nf(Math.round(CUM[23]))} ₽. Поиск окупился на тринадцатом месяце (n = 12). Реклама в соцсетях за два года не окупилась. При CAC ${nf(SC.socCac)} ₽ магазин получил ${nf(Math.round(CUMS[23]))} ₽ маржинального дохода на клиента.`,
    mount(root, api) {
      root.innerHTML = '<div class="ue-sc"><div class="ue-sc-in"></div><div class="ue-sc-calls"></div></div>';
      const bx = root.querySelector('.ue-sc'), inn = bx.querySelector('.ue-sc-in'), cl = bx.querySelector('.ue-sc-calls');
      let sig = '';
      return {
        render(k, p) {
          const st = sceneState(k, p);
          api.hud('m', st.m >= 0 ? String(Math.floor(st.m + 1e-9)) : '—');
          api.hud('cac', nf(Math.round(st.cac)), st.soc ? 'соцсети' : 'поиск');
          api.hud('cum', nf(Math.round(st.val)), st.mode === 'rev' ? 'выручка' : '');
          const W = Math.round(bx.clientWidth), H = Math.round(bx.clientHeight);
          if (!W || !H) return;
          const key = JSON.stringify([W, H, k, Object.values(st).map(v => (typeof v === 'number' ? Math.round(v * 60) : v))]);
          if (key === sig) return; sig = key;
          const d = drawScene(W, H, st);
          inn.innerHTML = d.svg;
          cl.innerHTML = d.calls.map(c => `<div class="ue-call ${c.place}" style="left:${f1(c.x)}px;top:${f1(c.y)}px;width:${f1(c.w)}px">${X(c.text)}</div>`).join('');
        }
      };
    }
  };

  /* ===================== Интерактив «Собери юнит» ===================== */
  const ORG = CH['органика'];
  const PRESETS = {
    ads: { name: 'Вся реклама', src: ['поиск', 'соцсети', 'партнёры'] },
    search: { name: 'Поиск', src: ['поиск'] },
    social: { name: 'Соцсети', src: ['соцсети'] },
    partners: { name: 'Партнёры', src: ['партнёры'] }
  };
  function presetVals(key) {
    const t = { spend: 0, new: 0, payers: 0, orders: 0, paid: 0, cm: 0 };
    PRESETS[key].src.forEach(ch => Object.keys(t).forEach(f => { t[f] += CH[ch][f]; }));
    return { spend: t.spend, new: t.new, payers: t.payers, freq: t.orders / t.payers, check: t.paid / t.orders, margin: t.cm / t.paid * 100 };
  }
  const FIELDS = [
    ['spend', 'Расходы на привлечение', 'млн ₽', v => nf(v / 1e6, 2), v => v * 1e6],
    ['new', 'Новых клиентов', '', v => nf(v), v => v],
    ['payers', 'Из них сделали покупку', '', v => nf(v), v => v],
    ['freq', 'Заказов на покупателя', '', v => nf(v, 2), v => v],
    ['check', 'Средний чек', '₽', v => nf(v), v => v],
    ['margin', 'Маржинальный доход', '% от суммы оплат', v => nf(v, 1), v => v]
  ];
  const parseNum = s => { const t = String(s).replace(/[\s ]/g, '').replace(',', '.'); return /^\d*\.?\d+$|^\d+\.$/.test(t) ? parseFloat(t) : NaN; };

  function compute(v, org) {
    const P = Math.min(v.payers, v.new);
    const r = { N: v.new, P, O: P * v.freq, paid: P * v.freq * v.check };
    r.CM = r.paid * v.margin / 100;
    r.spend = v.spend;
    if (org) { r.N += ORG.new; r.P += ORG.payers; r.O += ORG.orders; r.paid += ORG.paid; r.CM += ORG.cm; }
    r.cac = r.N ? r.spend / r.N : 0; r.cacB = r.P ? r.spend / r.P : 0; r.per = r.N ? r.CM / r.N : 0;
    r.diff = r.per - r.cac; r.dr = Math.round(r.per) - Math.round(r.cac); r.ret = r.spend ? r.CM / r.spend : null;
    r.even = v.new && v.payers && v.freq && v.check ? r.cac / ((P / v.new) * v.freq * v.check) * 100 : null;
    r.bad = v.payers > v.new;
    return r;
  }

  const band = (x0, y0a, y0b, x1, y1a, y1b, cls) => {
    const mx = (x0 + x1) / 2;
    return `<path class="${cls}" d="M${f1(x0)},${f1(y0a)} C${f1(mx)},${f1(y0a)} ${f1(mx)},${f1(y1a)} ${f1(x1)},${f1(y1a)} L${f1(x1)},${f1(y1b)} C${f1(mx)},${f1(y1b)} ${f1(mx)},${f1(y0b)} ${f1(x0)},${f1(y0b)} Z"/>`;
  };
  const vband = (y0, x0a, x0b, y1, x1a, x1b, cls) => {
    const my = (y0 + y1) / 2;
    return `<path class="${cls}" d="M${f1(x0a)},${f1(y0)} C${f1(x0a)},${f1(my)} ${f1(x1a)},${f1(my)} ${f1(x1a)},${f1(y1)} L${f1(x1b)},${f1(y1)} C${f1(x1b)},${f1(my)} ${f1(x0b)},${f1(my)} ${f1(x0b)},${f1(y0)} Z"/>`;
  };
  const tx = (x, y, s, cls, a) => `<text x="${f1(x)}" y="${f1(y)}" class="${cls}"${a ? ` text-anchor="${a}"` : ''}>${X(s)}</text>`;
  const node = (x, y, w, h, cls, lines) => {
    const top = y + Math.max(0, (h - (8 + lines.length * 16)) / 2) + 17;
    return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="8" class="ue-n ${cls}"/>` + lines.map((l, i) => tx(x + 10, top + i * 16, l[0], l[1] || 'ue-t2')).join('');
  };
  const textH = lines => 10 + lines.length * 16;

  function flowSVG(W, r, org) {
    const big = Math.max(r.spend, r.paid, 1);
    const sharePay = r.N ? r.P / r.N : 0;
    const pctCm = `${nf(r.paid ? r.CM / r.paid * 100 : 0, 1)}%`;
    const L1 = [['Реклама', 'ue-t0'], [mln(r.spend), 'ue-tb']];
    const L2 = [['Клиенты', 'ue-t0'], [`всего ${nf(r.N)}`], [`покупателей ${nf(r.P)} · ${nf(sharePay * 100)}%`], [`заказов ${nf(Math.round(r.O))}`]];
    if (org) L2.push([`органика · ${nf(ORG.new)}`, 'ue-tor']);
    const L3 = [['Сумма оплат', 'ue-t0'], [mln(r.paid, 1), 'ue-tb'], [`средний чек ${rub(Math.round(r.O ? r.paid / r.O : 0))}`]];
    const aria = `role="img" aria-label="Расходы на рекламу составили ${mln(r.spend)}. Клиенты заплатили ${mln(r.paid, 1)}. Маржинальный доход магазина составил ${mln(r.CM)}."`;
    if (W >= 700) {
      const L4 = [['Маржинальный доход', 'ue-t0'], [mln(r.CM, 2), 'ue-tb'], [`${pctCm} от суммы оплат`]];
      const L5 = [['Себестоимость, доля продавцов,', 'ue-t0'], ['возвраты, доставка, эквайринг', 'ue-t0'], [mln(r.paid - r.CM, 1), 'ue-tb']];
      const k = 110 / big, tS = Math.max(2, r.spend * k), tP = Math.max(2, r.paid * k), tM = Math.max(1, r.CM * k), tC = Math.max(1, (r.paid - r.CM) * k);
      const h1 = Math.max(textH(L1), tS + 10), h2 = Math.max(textH(L2), tP + 10, tS + 10), h3 = Math.max(textH(L3), tP + 10);
      const hM = Math.max(textH(L4), tM + 10), hC = Math.max(textH(L5), tC + 10), gap = 18;
      const H = Math.ceil(Math.max(220, hM + gap + hC + 8, h2 + 16)), mid = H / 2;
      const w1 = 132, w2 = 164, w3 = 132, w4 = 214, x1 = 0, x2 = W * .27, x3 = W * .53, x4 = W - w4;
      const yM = (H - (hM + gap + hC)) / 2, yC = yM + hM + gap;
      let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${aria}>`;
      s += band(x1 + w1, mid - tS / 2, mid + tS / 2, x2, mid - tS / 2, mid + tS / 2, 'ue-b-sp');
      s += band(x2 + w2, mid - tP / 2, mid + tP / 2, x3, mid - tP / 2, mid + tP / 2, 'ue-b-pd');
      s += band(x3 + w3, mid - tP / 2, mid - tP / 2 + tM, x4, yM + hM / 2 - tM / 2, yM + hM / 2 + tM / 2, 'ue-b-cm');
      s += band(x3 + w3, mid - tP / 2 + tM, mid + tP / 2, x4, yC + hC / 2 - tC / 2, yC + hC / 2 + tC / 2, 'ue-b-co');
      s += node(x1, mid - h1 / 2, w1, h1, 'ue-n-sp', L1) + node(x2, mid - h2 / 2, w2, h2, '', L2) + node(x3, mid - h3 / 2, w3, h3, '', L3);
      s += node(x4, yM, w4, hM, 'ue-n-cm', L4) + node(x4, yC, w4, hC, 'ue-n-co', L5);
      return s + '</svg>';
    }
    // узкий экран: потоки сверху вниз
    const hw = (W - 10) / 2, k = Math.min(hw - 16, 150) / big;
    const tS = Math.max(2, r.spend * k), tP = Math.max(2, r.paid * k), tM = Math.max(1, r.CM * k), tC = Math.max(1, (r.paid - r.CM) * k);
    const L4 = [['Маржинальный', 'ue-t0'], ['доход', 'ue-t0'], [mln(r.CM, 2), 'ue-tb'], [pctCm]];
    const L5 = [['Выплаты продавцам,', 'ue-t0'], ['возвраты и затраты', 'ue-t0'], [mln(r.paid - r.CM, 1), 'ue-tb']];
    const cx = W / 2, w1 = Math.min(W, Math.max(170, tS + 20)), w2 = Math.min(W, Math.max(214, tP + 20)), w3 = Math.min(W, Math.max(170, tP + 20));
    const y1 = 0, h1 = textH(L1), y2 = h1 + 44, h2 = textH(L2), y3 = y2 + h2 + 44, h3 = textH(L3), y4 = y3 + h3 + 56, h4 = Math.max(textH(L4), textH(L5));
    const H = y4 + h4 + 4, c4a = hw / 2, c4b = W - hw / 2;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${aria}>`;
    s += vband(y1 + h1, cx - tS / 2, cx + tS / 2, y2, cx - tS / 2, cx + tS / 2, 'ue-b-sp');
    s += vband(y2 + h2, cx - tP / 2, cx + tP / 2, y3, cx - tP / 2, cx + tP / 2, 'ue-b-pd');
    s += vband(y3 + h3, cx - tP / 2, cx - tP / 2 + tM, y4, c4a - tM / 2, c4a + tM / 2, 'ue-b-cm');
    s += vband(y3 + h3, cx - tP / 2 + tM, cx + tP / 2, y4, c4b - tC / 2, c4b + tC / 2, 'ue-b-co');
    s += node(cx - w1 / 2, y1, w1, h1, 'ue-n-sp', L1) + node(cx - w2 / 2, y2, w2, h2, '', L2) + node(cx - w3 / 2, y3, w3, h3, '', L3);
    s += node(0, y4, hw, h4, 'ue-n-cm', L4) + node(W - hw, y4, hw, h4, 'ue-n-co', L5);
    return s + '</svg>';
  }

  function buildUnit(box, api) {
    const { $ } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Окупается ли привлечение клиентов? <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="ue-reset">Сбросить</button></div></div>
<p class="hint ue-do">Выберите канал или введите свои числа. Сравните средние расходы на&nbsp;привлечение клиента с&nbsp;маржинальным доходом на&nbsp;клиента. В&nbsp;расчёт входят заказы с&nbsp;июля 2024 года по&nbsp;июнь 2026 года.</p>
<div class="ue-top"><span class="seg" role="group" aria-label="Канал">${Object.entries(PRESETS).map(([k, p]) => `<button type="button" data-p="${k}">${p.name}</button>`).join('')}</span>
<label class="ue-org"><input type="checkbox" id="ue-org"> <span>Включить органический канал</span></label></div>
<div class="ue-fields">${FIELDS.map(([k, lab, u]) => `<label class="ue-f"><span>${lab}${u ? `, ${u}` : ''}</span><input type="text" inputmode="decimal" id="ue-${k}" autocomplete="off" spellcheck="false"></label>`).join('')}</div>
<p class="ue-orgline" id="ue-orgline"></p>
<div class="ue-flow" id="ue-flow"></div>
<div class="ue-unit" id="ue-unit"></div>
<div class="ue-narr" id="ue-narr"></div>
<div class="status"><span><span class="dot" id="ue-dot"></span><span id="ue-st1"></span></span><span id="ue-st2"></span><span class="grow"></span><span id="ue-st3"></span></div>`;
    let preset, vals, org, edited;
    const fresh = () => { preset = 'ads'; vals = presetVals('ads'); org = false; edited = false; fill(); };
    function fill() { FIELDS.forEach(([k, , , show]) => { $('ue-' + k).value = show(k === 'spend' ? vals.spend : vals[k]); $('ue-' + k).classList.remove('ue-bad'); }); }
    function unitBars(r) {
      const mx = Math.max(r.cac, r.per, 1), w = v => `${(v / mx * 100).toFixed(1)}%`;
      return `<div class="ue-ut">В среднем на одного привлечённого клиента${org ? ' (включая органический канал)' : ''}</div>
<div class="ue-row"><span class="ue-rl">CAC</span><span class="ue-bar"><i class="ue-bc" style="width:${w(r.cac)}"></i></span><b>${rub(Math.round(r.cac))}</b></div>
<div class="ue-row"><span class="ue-rl">Маржинальный доход</span><span class="ue-bar"><i class="ue-bm" style="width:${w(Math.max(0, r.per))}"></i></span><b>${rub(Math.round(r.per))}</b></div>
<div class="ue-res ${r.diff >= 0 ? 'ue-pos' : 'ue-neg'}">Маржинальный доход за вычетом расходов на привлечение: ${srub(r.dr)} на клиента</div>`;
    }
    function narrate(r) {
      if (r.bad) return '<p>Число покупателей превышает число новых клиентов. Проверьте эти два поля. Пока в расчёте предполагается, что каждый новый клиент сделал покупку.</p>';
      const ret = r.ret == null ? '' : `${nf(r.ret * 100)}%`;
      const even = r.diff >= 0 || r.even == null || org ? '' : r.even <= 100 ? ` Чтобы канал окупился при тех же расходах, маржинальный доход должен составить не менее ${nf(r.even, 1)}% от суммы оплат. Другой вариант при текущем доходе — снизить CAC до ${rub(Math.round(r.per))} или ниже.` : ` Даже вся сумма оплат не покрывает расходов на рекламу. При текущем маржинальном доходе предельный CAC составляет около ${rub(Math.round(r.per))}.`;
      if (edited) return `<p>По вашим данным на одного нового клиента приходится ${rub(Math.round(r.cac))} расходов на привлечение и ${rub(Math.round(r.per))} маржинального дохода.${ret ? ` Общий маржинальный доход составляет ${ret} от расходов на рекламу.` : ''}${even}</p>`;
      if (preset === 'ads' && org) return `<p>После добавления органического канала CAC снизился до <b>${rub(Math.round(r.cac))}</b>. В знаменатель попали ещё ${nf(ORG.new)} ${pl(ORG.new, 'регистрация', 'регистрации', 'регистраций')}, а расходы на рекламу остались прежними. Покупки этих клиентов тоже вошли в расчёт. Теперь на одного клиента приходится ${rub(Math.round(r.per))} маржинального дохода. Общий маржинальный доход составил ${ret} от расходов на рекламу. Часть этого дохода принесли заказы клиентов из органического канала.</p>`;
      if (preset === 'ads') return `<p>За два года привлечение одного клиента через платные каналы обошлось в среднем в <b>${rub(Math.round(r.cac))}</b>. За тот же период на клиента пришлось ${rub(Math.round(r.per))} маржинального дохода. Его хватило, чтобы покрыть ${ret} расходов на рекламу. Выберите отдельный канал и сравните результаты.</p>`;
      if (preset === 'search') return `<p>За период наблюдения маржинальный доход от клиентов из поиска покрыл ${ret} расходов на этот канал. До окупаемости не хватило ${rub(Math.abs(r.dr))} на человека. К концу июня 2026 года ${DATA.lag.searchYoung}% этих клиентов были зарегистрированы меньше года. В анимации мы сравнили клиентов по времени с момента регистрации и увидели, что поиск окупается на тринадцатом месяце.${even}</p>`;
      if (preset === 'social') return `<p>Среди клиентов, пришедших из соцсетей, хотя бы одну покупку сделали ${nf(r.P / r.N * 100)}%. За два года на каждого привлечённого клиента пришлось ${rub(Math.round(r.per))} маржинального дохода при CAC ${rub(Math.round(r.cac))}. Это ${ret} расходов на канал.${even}</p>`;
      return `<p>Магазин платит партнёру ${rub(Math.round(r.cacB))} за первую покупку клиента. Покупку сделали ${nf(r.P / r.N * 100)}% тех, кто пришёл через партнёров. На одного зарегистрировавшегося пришлось ${rub(Math.round(r.per))} маржинального дохода при CAC ${rub(Math.round(r.cac))}. За период наблюдения канал окупился.</p>`;
    }
    function draw() {
      const r = compute(vals, org);
      box.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', String(!edited && b.dataset.p === preset)));
      $('ue-org').checked = org; $('ue-org').disabled = preset !== 'ads';
      box.querySelector('.ue-org').classList.toggle('off', preset !== 'ads');
      $('ue-orgline').textContent = org ? `К органическому каналу магазин отнёс ${nf(ORG.new)} клиентов. Из них ${nf(ORG.payers)} сделали покупки. Они оплатили ${nf(ORG.orders)} заказов на ${mln(ORG.paid, 1)} и принесли магазину ${mln(ORG.cm, 2)} маржинального дохода. В выгрузке нет рекламных расходов по этому каналу.` : preset !== 'ads' ? 'Чтобы добавить органический канал, выберите «Вся реклама».' : '';
      const W = Math.max(280, Math.round($('ue-flow').clientWidth || 900));
      $('ue-flow').innerHTML = flowSVG(W, r, org);
      $('ue-unit').innerHTML = unitBars(r);
      $('ue-narr').innerHTML = narrate(r);
      $('ue-dot').className = `dot${r.diff >= 0 ? ' live' : ''}`;
      $('ue-st1').textContent = `CAC на регистрацию ${rub(Math.round(r.cac))} · на покупателя ${rub(Math.round(r.cacB))}`;
      $('ue-st2').textContent = `маржинальный доход на клиента ${rub(Math.round(r.per))} · за вычетом CAC ${srub(r.dr)}`;
      $('ue-st3').textContent = r.ret == null ? 'нет расходов на рекламу' : `отношение дохода к расходам на рекламу ${nf(r.ret * 100)}%`;
    }
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-p]');
      if (!b) return;
      preset = b.dataset.p; vals = presetVals(preset); edited = false; if (preset !== 'ads') org = false; fill(); draw();
    });
    $('ue-org').addEventListener('change', e => { org = e.target.checked && preset === 'ads'; draw(); });
    FIELDS.forEach(([k, , , show]) => {
      const inp = $('ue-' + k);
      inp.addEventListener('input', () => {
        const v = parseNum(inp.value);
        const ok = Number.isFinite(v) && v >= 0 && (k !== 'margin' || v <= 100) && (k === 'spend' || k === 'margin' || v > 0);
        inp.classList.toggle('ue-bad', !ok);
        if (!ok) return;
        vals[k] = k === 'spend' ? v * 1e6 : v; edited = true; draw();
      });
      inp.addEventListener('change', () => { if (!inp.classList.contains('ue-bad')) inp.value = show(vals[k]); });
    });
    $('ue-reset').addEventListener('click', () => { fresh(); draw(); });
    let lastW = 0;
    if ('ResizeObserver' in window) new ResizeObserver(() => { const w = $('ue-flow').clientWidth; if (w && Math.abs(w - lastW) > 4) { lastW = w; draw(); } }).observe($('ue-flow'));
    fresh(); draw();
    return {
      describe() {
        const r = compute(vals, org);
        return `${edited ? 'Свои данные' : PRESETS[preset].name}${org ? ', включая органический канал' : ''}. Расходы на привлечение — ${mln(vals.spend)}, новых клиентов — ${nf(r.N)}, покупателей — ${nf(r.P)}. На покупателя приходится ${nf(r.P ? r.O / r.P : 0, 2)} заказа. Средний чек — ${rub(Math.round(r.O ? r.paid / r.O : 0))}. Маржинальный доход составляет ${nf(r.paid ? r.CM / r.paid * 100 : 0, 1)}% от суммы оплат. На одного клиента приходится ${rub(Math.round(r.cac))} расходов на привлечение и ${rub(Math.round(r.per))} маржинального дохода. Разница — ${srub(r.dr)} на клиента.`;
      }
    };
  }

  /* ===================== Страница ===================== */
  const ORD = DATA.order, MX = DATA.mix;
  window.PAGE = {
    id: 'da-10-1', short: 'DA-10',
    title: 'CAC, ARPU и маржа',
    where: 'блок «Дата аналитика», тема 10 «Юнит-экономика», страница 10.1',
    aiData: `Данные учебного интернет-магазина с июля 2024 по июнь 2026 года. Для каждого клиента известен канал привлечения. В заказах указаны себестоимость, расходы на доставку и эквайринг, а также возвраты. Расходы на рекламу разбиты по каналам. CAC в поисковой рекламе составляет ${nf(DATA.cac['поиск'])} ₽, в среднем по всем рекламным каналам — ${nf(BL.ads)} ₽. Если разделить рекламные расходы на число всех новых клиентов, включая клиентов из органического канала, получится ${nf(BL.all)} ₽`,
    scene,
    widgets: { unit: buildUnit },
    code: {
      cac: { title: 'CAC по каналам и смешанный CAC', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: OUT.cac_sql, out: OUT.cac, outLabel: 'Вывод psql',
        note: `Для органического канала в таблице расходов нет строки, поэтому запрос возвращает NULL. Параметр -P null=NULL показывает это значение в выводе psql. Выражение spend::numeric явно задаёт тип числителя, а ROUND округляет результат деления до рубля. В двух последних строках сумма расходов одна. Если учитывать только клиентов из рекламы, получится ${nf(BL.ads)} ₽ на человека, а если добавить клиентов из органического канала, — ${nf(BL.all)} ₽.` },
      arpu: { title: 'ARPU и ARPPU по месяцам', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: OUT.arpu_sql, out: OUT.arpu, outLabel: 'Вывод psql: последние 12 месяцев',
        note: `Покупатель входит в число платящих, если за месяц оплатил хотя бы один заказ. Даже если он потом вернул покупку, он остаётся в знаменателе ARPPU. Стоимость возвращённых заказов исключаем из выручки. С июля 2025 по июнь 2026 года выручка на одного активного и на одного платящего изменилась мало. А вот выручка на одного зарегистрированного снизилась с 418 до ${nf(AR.arpuB)} ₽. В базу по-прежнему входят люди, которые давно не заходили в магазин.` },
      unit: { title: 'Юнит-экономика по каналам привлечения', badge: 'проверено: pandas 3.0.5, NumPy 2.5.3', lang: 'python', code: OUT.unit_py, out: OUT.unit, outLabel: 'Вывод',
        note: `МД означает «маржинальный доход». До строки «МД − CAC» включительно приведены итоги за 24 календарных месяца, как в интерактиве. В последних двух строках точка отсчёта другая — месяц регистрации. Там показаны маржинальный доход на клиента за первый год и месяц, когда он покрыл расходы на привлечение, если это произошло за время наблюдения. Поисковая реклама окупается на тринадцатом месяце (n = 12). В соцсетях за два года расходы на привлечение так и не окупились. Для строки «вся реклама» эти два показателя в примере не рассчитывали.` }
    },
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: `За 24 месяца магазин потратил ${nf(BL.spend, 2)} млн ₽ на рекламу. К рекламным каналам магазин отнёс ${nf(CH['поиск'].new + CH['соцсети'].new + CH['партнёры'].new)} ${pl(CH['поиск'].new + CH['соцсети'].new + CH['партнёры'].new, 'человек', 'человека', 'человек')}, к органическому каналу — ещё ${nf(ORG.new)}. Привлечение клиента через рекламу обошлось в среднем в ${nf(BL.ads)} ₽. Сколько получится на клиента, если разделить те же расходы на число всех новых клиентов?`, opts: [[`${nf(BL.ads)} ₽, поскольку расходы на рекламу остались прежними`], [`${nf(BL.all)} ₽, почти вдвое меньше`, 1], ['Около 1 500 ₽, поскольку клиентов из органического канала было немного'], ['Рассчитать нельзя, пока неизвестен CAC органического канала']],
      why: `Расходы остались прежними, а число клиентов в знаменателе выросло с ${nf(CH['поиск'].new + CH['соцсети'].new + CH['партнёры'].new)} до ${nf(DATA.arpu.base)}. Если разделить ${nf(BL.spend, 2)} млн ₽ на ${nf(DATA.arpu.base)}, получится ${nf(BL.all)} ₽ на клиента. Показатель уменьшился в ${nf(BL.x, 2)} раза, хотя реклама стоила столько же. Это произошло потому, что почти половину новых клиентов магазин отнёс к органическому каналу.` },
    q2: { sec: 'idea', q: `Привлечение клиента из поиска обходится в среднем в ${nf(SC.cac)} ₽. Уже в месяц регистрации на одного клиента приходится ${m0('paid')} ₽ платежей. Почему расходы на привлечение пока не окупились?`, opts: [['Потому что среднюю сумму платежей посчитали только по покупателям'], [`После всех вычетов у магазина остаётся ${nf(Math.round(CUM[0]))} ₽ маржинального дохода на клиента`, 1], ['Потому что оплаты в последний день месяца учитывают только в следующем месяце'], ['Потому что расходы на рекламу нужно вычесть из каждого платежа целиком']],
      why: `Из платежей вычитаем себестоимость, долю продавцов и возвраты, доставку и эквайринг. На одного зарегистрированного клиента приходится ${m0('paid')} − ${CHIPS.map(c => nf(c[1])).join(' − ')} = ${nf(Math.round(CUM[0]))} ₽ маржинального дохода. Этого пока меньше, чем магазин потратил на привлечение. В средних суммах уже учтены все клиенты, включая тех, кто в этом месяце ничего не купил.` },
    q3: { sec: 'nuances', q: `В среднем по рекламным каналам привлечение клиента обошлось в ${nf(BL.ads)} ₽. За 24 месяца маржинальный доход от этих клиентов покрыл ${DATA.soc.adsRet}% расходов на рекламу. Почему этих двух показателей недостаточно, чтобы выбрать канал для увеличения бюджета?`, opts: [['Средний CAC по рекламе всегда завышен из-за клиентов из органического канала'], [`У каналов разная окупаемость. Например, привлечение через соцсети стоило ${nf(DATA.cac['соцсети'])} ₽ на клиента, а маржинальный доход покрыл лишь ${DATA.soc.ret}% расходов`, 1], ['Результаты за два года подходят только для планирования бюджета сразу на два года'], ['Стоимость привлечения нельзя сравнивать с маржинальным доходом на клиента']],
      why: `Если взять только поиск и партнёров, на одного привлечённого клиента приходится ${nf(DATA.nosoc.cac)} ₽ рекламных расходов и ${nf(DATA.nosoc.cm)} ₽ маржинального дохода. За период наблюдения доход покрыл ${nf(DATA.nosoc.ret, 1)}% расходов в этих двух каналах. Добавим соцсети, и показатель снизится до ${DATA.soc.adsRet}%. Чтобы решить, где увеличить бюджет, сначала нужно сравнить каналы по отдельности.` },
    q4: { sec: 'idea', q: `В июне 2026 года ARPU в расчёте на активного пользователя составил ${nf(AR.arpuA)} ₽, а средний чек — ${nf(AR.check)} ₽. Чем отличаются эти показатели?`, opts: [['Они измеряют одно и то же, разница возникла при округлении'], ['ARPU показывает выручку на одного пользователя за период, а средний чек — среднюю сумму, которую клиент платит за заказ', 1], ['В ARPU входит вся оплата клиента, а в средний чек — только выручка магазина'], ['ARPU всегда выше среднего чека, потому что клиент может сделать несколько заказов']],
      why: `При расчёте ARPU делим чистую выручку на число активных пользователей. В июне ${100 - AR.payShare}% из них ничего не купили, а часть покупателей сделала несколько заказов. Тот же результат получим, если умножим долю платящих на число заказов на одного платящего и на выручку с заказа. Для июня расчёт даёт ${nf(AR.payShare / 100, 2)} × ${nf(AR.freq, 2)} × ${nf(AR.revOrder)} ₽ ≈ ${nf(AR.arpuA)} ₽. Для среднего чека делим сумму платежей клиентов на число заказов.` },
    q5: { sec: 'idea', q: `Рассмотрим обычные заказы, в которых магазин продаёт собственный товар. В среднем покупатель платит ${nf(ORD.paid)} ₽ за заказ без возврата, а магазину остаётся ${nf(ORD.cm)} ₽ маржинального дохода. Как изменится маржинальный доход с такого заказа при скидке 10%, если себестоимость и доставка останутся прежними?`, opts: [[`Снизится на 10%, до ${nf(Math.round(ORD.cm * .9))} ₽`], [`Снизится примерно на ${ORD.drop}%, до ${nf(ORD.cm9)} ₽`, 1], ['Останется прежним, если учесть скидку в рекламном бюджете'], ['Снизится на 62%, поскольку себестоимость составляет около 62% цены']],
      why: `Покупатель заплатит примерно на 320 ₽ меньше. Себестоимость и доставка останутся прежними, а комиссия банка немного снизится, поскольку зависит от суммы платежа. Маржинальный доход сократится с ${nf(ORD.cm)} до ${nf(ORD.cm9)} ₽, то есть примерно на ${ORD.drop}%. Чтобы получить прежний маржинальный доход при такой скидке, магазину понадобится на ${ORD.more}% больше таких заказов.` },
    q6: { sec: 'code', q: 'В unit_summary.py вклад возвращённого заказа считают по формуле ниже. Почему в ней остались только доставка и эквайринг?', code: '-2 * orders.delivery_cost - orders.payment_fee,   # товар вернулся, доставка дважды', lang: 'python', opts: [['Перевозчик берёт штраф в размере двух доставок'], ['Товар вернулся на склад. Магазин оплатил доставку в обе стороны и комиссию банка', 1], ['Магазин дважды вычитает себестоимость товара'], ['Программа учитывает один и тот же платёж дважды']],
      why: 'В учебном магазине покупателю вернули деньги, а товар снова числится на складе. Поэтому выручка и себестоимость проданного товара по этому заказу равны нулю. Магазин оплатил доставку покупателю и обратно, а банк удержал комиссию за приём платежа. Эти расходы и дают отрицательный маржинальный доход.' },
    q7: { sec: 'nuances', q: 'Букмекер сообщает, что общая сумма ставок выросла на 30%. Как проверить, вырос ли его валовой игровой доход?', opts: [['Сравнить число зарегистрированных игроков за два периода'], ['Для каждого периода вычесть из суммы ставок сумму выигрышей и сравнить результаты', 1], ['Узнать, насколько изменилась средняя ставка'], ['Умножить прошлый доход на 1,3']],
      why: `Разность между суммой ставок и выплатами игрокам называют валовым игровым доходом (GGR). Если оборот вырос на 30 млн ₽, а выплаты игрокам увеличились на 35 млн ₽, GGR снизился на 5 млн ₽. Аналогично на маркетплейсе часть оплаты за товар причитается продавцу. В учебном магазине на товары сторонних продавцов пришлось ${nf(MX.mpGmv, 1)}% оборота и лишь ${nf(MX.mpRev, 1)}% выручки.` }
    },
    glossary: {
      ue: { t: 'Юнит-экономика', en: 'unit economics', d: 'Способ оценить, сколько денег бизнес получает и сколько тратит в расчёте на одного клиента, один заказ или одну подписку.' },
      unit: { t: 'Юнит', en: 'unit', d: 'Единица, для которой считают доходы и расходы. В интернет-магазине это может быть клиент или заказ.' },
      cac: { t: 'Стоимость привлечения клиента', en: 'customer acquisition cost, CAC', d: 'Средние расходы на привлечение одного нового клиента. Расходы за выбранный период делят на число клиентов, привлечённых за это время.' },
      cm: { t: 'Маржинальный доход', en: 'contribution margin', d: 'Сумма, которая остаётся магазину из чистой выручки после вычета себестоимости проданных товаров и других переменных расходов. Из неё ещё предстоит покрыть постоянные расходы.' },
      cogs: { t: 'Себестоимость', en: 'cost of goods sold, COGS', d: 'Сколько магазину стоил проданный товар.' },
      varcost: { t: 'Переменные издержки', en: 'variable costs', d: 'Расходы, сумма которых зависит от числа заказов или объёма продаж. В магазине к ним относятся доставка, упаковка и комиссия за приём платежей.' },
      fixed: { t: 'Постоянные издержки', en: 'fixed costs', d: 'Расходы, которые в пределах рассматриваемого периода не меняются вслед за числом заказов. Например, арендная плата за помещение.' },
      cpa: { t: 'Оплата за действие', en: 'cost per action, CPA', d: 'Условие оплаты рекламы, при котором магазин платит за конкретное действие клиента, например за первый заказ.' },
      blended: { t: 'Смешанный CAC', en: 'blended CAC', d: 'Средняя стоимость привлечения клиента по нескольким каналам. Суммарные расходы делят на число новых клиентов выбранных каналов. Важно указать, включена ли органика.' },
      chcac: { t: 'CAC по каналу', en: 'channel CAC, paid CAC', d: 'Средние расходы на привлечение клиента через конкретный канал. Расходы на канал делят на число пришедших через него новых клиентов за тот же период.' },
      organic: { t: 'Органика', en: 'organic traffic', d: 'Канал привлечения, к которому в этом магазине относят регистрации без установленной связи с платной рекламой.' },
      arpu: { t: 'ARPU', en: 'average revenue per user', d: 'Выручка за период в расчёте на одного пользователя. При сравнении указывают, кого учитывают в знаменателе, например всех активных или всех зарегистрированных.' },
      arppu: { t: 'ARPPU', en: 'average revenue per paying user', d: 'Выручка за период на одного платящего пользователя.' },
      netrev: { t: 'Чистая выручка', en: 'net revenue', d: 'Выручка магазина с учётом возвратов. В этом уроке при полном возврате заказа его вклад в чистую выручку равен нулю.' },
      freq: { t: 'Частота покупок', en: 'purchase frequency', d: 'Сколько заказов за период приходится на одного платящего клиента.' },
      aov: { t: 'Средний чек', en: 'average order value, AOV', d: 'Сколько клиент в среднем платит за один заказ.' },
      gmv: { t: 'Оборот', en: 'gross merchandise value, GMV', d: 'В учебном магазине это общая стоимость заказанных товаров по ценам до скидок. В расчёт входят и товары сторонних продавцов.' },
      revenue: { t: 'Выручка', en: 'revenue', d: 'При продаже собственного товара в выручку магазина входит вся сумма, которую заплатил покупатель. При продаже товара стороннего продавца магазин учитывает только свою комиссию.' },
      gm: { t: 'Валовая маржа', en: 'gross margin', d: 'Отношение валовой прибыли к выручке. В уроке валовую прибыль делят на чистую выручку и выражают результат в процентах.' },
      acq: { t: 'Эквайринг', en: 'acquiring', d: 'Банковская услуга по приёму платежей картой. За каждый платёж магазин платит банку комиссию.' },
      mkt: { t: 'Маркетплейс', en: 'marketplace', d: 'Торговая площадка, на которой сторонние продавцы размещают свои товары. В учебном магазине площадка получает комиссию с таких продаж.' },
      payback: { t: 'Срок окупаемости', en: 'payback period', d: 'Время от привлечения клиента до момента, когда накопленный маржинальный доход на клиента впервые достигает расходов на его привлечение или превышает их.' },
      ggr: { t: 'GGR', en: 'gross gaming revenue', d: 'Валовой игровой доход букмекера или казино. Из общей суммы ставок вычитают сумму выигрышей игроков.' },
      pnl: { t: 'Отчёт о прибылях и убытках', en: 'profit and loss, P&L', d: 'Финансовый отчёт, в котором за период сопоставляют доходы и расходы и показывают итоговую прибыль или убыток.' },
      ltv: { t: 'LTV', en: 'lifetime value', d: 'В этой главе LTV показывает, сколько маржинального дохода приносит магазину один привлечённый клиент за выбранный срок или за всё время. Расчёт разобран в уроке 10.2.' }
    },
    materials: [
      ['da-10-1-cac-arpu-margin.md', 'Текст урока в Markdown с примерами кода, вопросами и глоссарием'],
      ['data/unit/', 'Данные главы 10 о клиентах, заказах, активности по месяцам и расходах на маркетинг. В архиве есть генератор данных и файлы для загрузки в PostgreSQL 16'],
      ['cac.sql', 'Запрос для PostgreSQL 16. Рассчитывает CAC по каждому каналу и общий CAC'],
      ['arpu.sql', 'Запрос для PostgreSQL 16. Рассчитывает ARPU и ARPPU по месяцам'],
      ['unit_summary.py', 'Расчёт показателей по каналам и маржинального дохода на клиента по месяцам с регистрации']
    ],
    prompts: [
      ['Как выбрать юнит для своего продукта', 'Я расскажу о своём продукте и о том, как он приносит доход. Помоги выбрать юнит и определить, какие расходы включить в CAC, а какие вычесть из выручки при расчёте маржинального дохода. Опирайся на примеры из урока. Задавай по одному вопросу.'],
      ['Проверка понимания', 'Задай мне пять вопросов по уроку. Спроси, как органика влияет на CAC, чем отличаются ARPU и ARPPU, чем оборот отличается от выручки, как учесть возврат и почему расходы на рекламу могут окупиться через несколько месяцев. Задавай вопросы по одному. После каждого моего ответа дай короткий разбор со ссылкой на нужный фрагмент урока.'],
      ['Разбор отчёта о рекламе', 'Я пришлю отчёт об эффективности рекламы. Проверь, по каким клиентам рассчитаны CAC и ARPU, и покажи, где это трудно понять. С какой суммой автор сравнивает расходы на привлечение? В каких выводах стоило бы рассмотреть каналы по отдельности? Приведи примеры из отчёта.']
    ]
  };
})();
