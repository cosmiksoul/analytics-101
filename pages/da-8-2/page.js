/* Страница 8.2 · Тип графика под вопрос */
(() => {
  // Числа — pandas по data/viz/sales_monthly.csv (data/build_data.py); код и его вывод — data/build_code.py
  /*data:start*/const DATA = {"ch":["сайт","приложение","маркетплейс","поиск","рассылка","соцсети","партнёры","кешбэк-сервисы","колл-центр","офлайн-точки"],"months":["2024-01","2024-02","2024-03","2024-04","2024-05","2024-06","2024-07","2024-08","2024-09","2024-10","2024-11","2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12"],"M":[[10.268,9.762,8.804,8.581,8.136,7.679,8.081,8.578,9.323,9.793,10.117,10.102,10.448,9.848,9.527,8.971,8.772,8.069,8.466,8.851,9.681,10.248,10.586,10.735],[3.363,3.159,2.943,2.987,2.838,2.834,2.897,3.007,3.29,3.482,3.542,3.646,3.679,3.462,3.229,3.089,2.983,4.486,5.906,6.144,6.721,7.689,7.604,8.026],[7.471,6.774,6.421,6.142,5.863,5.473,5.97,6.237,6.341,7.028,7.318,6.872,7.088,6.659,6.693,6.094,6.025,5.731,5.715,6.197,6.428,6.909,7.034,7.169],[4.374,4.286,4.12,3.852,3.687,3.792,3.773,4.09,4.497,4.236,4.583,4.912,4.526,4.481,4.59,3.969,3.721,3.955,4.169,4.223,4.624,4.929,4.913,5.348],[2.393,2.358,2.365,2.2,2.096,2.01,2.054,2.11,2.37,2.593,2.682,2.558,2.75,2.713,2.57,2.366,2.245,2.292,2.301,2.429,2.544,2.74,2.968,3.109],[1.949,1.969,1.801,1.734,1.593,1.54,1.581,1.676,1.741,1.842,1.94,1.993,1.988,2.007,1.796,1.717,1.567,1.551,1.627,1.721,1.834,1.899,1.991,2.13],[1.624,1.614,1.489,1.453,1.425,1.327,1.443,1.498,1.566,1.731,1.756,1.755,1.763,1.772,1.546,1.55,1.491,1.537,1.505,1.561,1.751,1.846,1.965,1.92],[1.111,1.102,0.992,0.932,0.881,0.872,0.921,0.942,1.076,1.112,1.125,1.216,1.177,1.091,1.06,0.997,0.902,0.889,0.909,1.021,1.058,1.059,1.197,1.257],[0.864,0.819,0.752,0.719,0.697,0.66,0.646,0.645,0.691,0.736,0.742,0.755,0.728,0.653,0.618,0.594,0.541,0.55,0.509,0.518,0.563,0.552,0.573,0.579],[1.299,1.336,1.236,1.127,1.124,1.077,1.143,1.201,1.268,1.396,1.398,1.43,1.362,1.395,1.268,1.243,1.234,1.134,1.198,1.23,1.293,1.417,1.474,1.465]],"y24":[109.224,37.988,77.91,50.202,27.789,21.359,18.681,12.282,8.726,15.035],"y25":[114.202,63.018,77.742,53.448,31.027,21.828,20.207,12.617,6.978,15.713],"share25":[27.401,15.12,18.653,12.824,7.444,5.237,4.848,3.027,1.674,3.77],"chg":[4.6,65.9,-0.2,6.5,11.7,2.2,8.2,2.7,-20.0,4.5],"total":[34.716,33.179,30.923,29.727,28.34,27.264,28.509,29.984,32.163,33.949,35.203,35.239,35.509,34.081,32.897,30.59,29.481,30.194,32.305,33.895,36.497,39.288,40.305,41.738],"hist":{"w":0.5,"max":45,"nb":22,"pos":[[[20,3],[19,2],[17,3],[17,1],[16,3],[15,1],[16,2],[17,0],[18,0],[19,3],[20,1],[20,0],[20,4],[19,4],[19,0],[17,5],[17,2],[16,1],[16,4],[17,4],[19,1],[20,2],[21,0],[21,1]],[[6,6],[6,3],[5,11],[5,14],[5,9],[5,8],[5,10],[6,0],[6,5],[6,8],[7,0],[7,1],[7,2],[6,7],[6,4],[6,1],[5,13],[8,8],[11,3],[12,3],[13,2],[15,2],[15,0],[16,0]],[[14,5],[13,3],[12,7],[12,2],[11,2],[10,1],[11,4],[12,5],[12,6],[14,0],[14,4],[13,4],[14,2],[13,0],[13,1],[12,1],[12,0],[11,1],[11,0],[12,4],[12,8],[13,5],[14,1],[14,3]],[[8,6],[8,5],[8,1],[7,7],[7,3],[7,6],[7,5],[8,0],[8,9],[8,4],[9,1],[9,4],[9,0],[8,7],[9,2],[7,9],[7,4],[7,8],[8,2],[8,3],[9,3],[9,6],[9,5],[10,0]],[[4,14],[4,10],[4,11],[4,6],[4,3],[4,1],[4,2],[4,4],[4,13],[5,3],[5,4],[5,1],[5,7],[5,5],[5,2],[4,12],[4,7],[4,8],[4,9],[4,15],[5,0],[5,6],[5,12],[6,2]],[[3,33],[3,35],[3,26],[3,18],[3,10],[3,2],[3,9],[3,14],[3,19],[3,28],[3,32],[3,38],[3,36],[4,0],[3,25],[3,15],[3,8],[3,5],[3,13],[3,16],[3,27],[3,30],[3,37],[4,5]],[[3,12],[3,11],[2,42],[2,39],[2,36],[2,29],[2,38],[2,44],[3,7],[3,17],[3,22],[3,21],[3,23],[3,24],[3,3],[3,4],[2,43],[3,1],[3,0],[3,6],[3,20],[3,29],[3,34],[3,31]],[[2,8],[2,7],[1,32],[1,30],[1,25],[1,24],[1,29],[1,31],[2,4],[2,9],[2,11],[2,19],[2,15],[2,6],[2,3],[1,33],[1,27],[1,26],[1,28],[2,0],[2,1],[2,2],[2,16],[2,24]],[[1,23],[1,22],[1,20],[1,16],[1,15],[1,13],[1,11],[1,10],[1,14],[1,18],[1,19],[1,21],[1,17],[1,12],[1,9],[1,8],[1,2],[1,3],[1,0],[1,1],[1,5],[1,4],[1,6],[1,7]],[[2,28],[2,30],[2,22],[2,12],[2,10],[2,5],[2,14],[2,18],[2,25],[2,33],[2,34],[2,37],[2,31],[2,32],[2,26],[2,23],[2,21],[2,13],[2,17],[2,20],[2,27],[2,35],[2,41],[2,40]]]},"r":0.958,"under25":55.8,"ans":{"third":"приложение","losers":["колл-центр"],"top2":46.1}};/*data:end*/
  /*code:start*/const CODE = {"q2chart": {"title": "Одна функция — четыре вопроса и четыре графика", "badge": "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0", "lang": "python", "code": "import matplotlib.pyplot as plt\nimport numpy as np\nimport pandas as pd\n\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 8,\n                     \"axes.spines.top\": False, \"axes.spines.right\": False})\nACC, GREY = \"#0d7468\", \"#9aa3b2\"\n\ndf = pd.read_csv(\"data/viz/sales_monthly.csv\")            # длинный формат, 960 строк\nwide = df.pivot_table(index=\"month\", columns=\"channel\",\n                      values=\"revenue\", aggfunc=\"sum\") / 1e6  # 24 месяца × 10 каналов, млн ₽\ny24, y25 = wide.loc[\"2024-01\":\"2024-12\"], wide.loc[\"2025-01\":\"2025-12\"]\n\n\ndef chart_for(question, ax):\n    \"\"\"Вопрос → тип графика. Данные одни и те же, меняется форма.\"\"\"\n    if question == \"сравнение\":        # кто больше → столбцы по убыванию\n        s = y25.sum().sort_values()\n        ax.barh(s.index, s.values, color=ACC)\n        ax.set_xlabel(\"выручка за 2025 год, млн ₽\")\n    elif question == \"динамика\":       # как менялось → линия по времени\n        total = wide.sum(axis=1)\n        ax.plot(total.index, total.values, color=ACC)  # месяцы-строки идут по порядку\n        ax.set_xticks([\"2024-01\", \"2024-07\", \"2025-01\", \"2025-07\"])\n        ax.set_ylabel(\"выручка за месяц, млн ₽\")\n    elif question == \"распределение\":  # какие значения обычны → гистограмма\n        ax.hist(wide.to_numpy().ravel(), bins=np.arange(0, 11.5, 0.5),\n                color=ACC, edgecolor=\"white\", linewidth=0.5)\n        ax.set_xlabel(\"выручка канала за месяц, млн ₽\")\n        ax.set_ylabel(\"месяцев\")\n    elif question == \"связь\":          # меняется ли одно вместе с другим → рассеяние\n        ax.scatter(y24.to_numpy().ravel(), y25.to_numpy().ravel(), s=7, color=ACC)\n        ax.axline((0, 0), slope=1, color=GREY, linewidth=0.8)  # линия «2025 = 2024»\n        ax.set_xlabel(\"месяц 2024 года, млн ₽\")\n        ax.set_ylabel(\"тот же месяц 2025-го, млн ₽\")\n    else:\n        raise ValueError(f\"нет графика для вопроса «{question}»\")\n    return ax\n\n\nTITLES = {  # заголовок — вывод, а не название осей\n    \"сравнение\": \"Сравнение: сайт — первый\",\n    \"динамика\": \"Динамика: пик в декабре\",\n    \"распределение\": \"Распределение: чаще до 2,5 млн\",\n    \"связь\": \"Связь: 2025-й повторяет 2024-й\",\n}\nfig, axes = plt.subplots(2, 2, figsize=(6.4, 4.6), layout=\"constrained\")\nfor (q, title), ax in zip(TITLES.items(), axes.flat):\n    chart_for(q, ax).set_title(title, loc=\"left\", fontsize=8.5)\nfig.savefig(\"question_to_chart.svg\")\n\ntotal = wide.sum(axis=1)\nvalues = wide.to_numpy().ravel()\nprint(\"сравнение:\", y25.sum().nlargest(3).round(1).to_dict())\nprint(\"динамика: пик\", total.idxmax(), round(total.max(), 1),\n      \"| провал\", total.idxmin(), round(total.min(), 1))\nprint(\"распределение: меньше 2,5 млн —\", f\"{(values < 2.5).mean():.0%}\", \"месяцев канала\")\nprint(\"связь: r =\", np.corrcoef(y24.to_numpy().ravel(), y25.to_numpy().ravel())[0, 1].round(3))", "out": "сравнение: {'сайт': 114.2, 'маркетплейс': 77.7, 'приложение': 63.0}\nдинамика: пик 2025-12 41.7 | провал 2024-06 27.3\nраспределение: меньше 2,5 млн — 56% месяцев канала\nсвязь: r = 0.958", "outLabel": "Вывод print; рисунок — под блоком"}, "facets": {"title": "Малые множители: приложение растёт, колл-центр угасает", "badge": "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0, seaborn 0.13.2", "lang": "python", "code": "import matplotlib.pyplot as plt\nimport pandas as pd\nimport seaborn as sns\n\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 7.5})\n\ndf = pd.read_csv(\"data/viz/sales_monthly.csv\")\nm = df.groupby([\"month\", \"channel\"], as_index=False)[\"revenue\"].sum()\nm[\"млн ₽\"] = m[\"revenue\"] / 1e6\norder = m.groupby(\"channel\")[\"revenue\"].sum().sort_values(ascending=False).index\n\ng = sns.FacetGrid(m, col=\"channel\", col_order=order, col_wrap=5,\n                  height=1.2, aspect=1.15, sharey=False)  # у каждой клетки своя шкала Y\ng.map_dataframe(sns.lineplot, x=\"month\", y=\"млн ₽\", color=\"#0d7468\")\ng.set_titles(\"{col_name}\")\ng.set_axis_labels(\"\", \"\")\ng.set(xticks=[\"2024-01\", \"2025-01\"], xticklabels=[\"2024\", \"2025\"], ylim=(0, None))\ng.figure.suptitle(\"Приложение выросло на две трети, колл-центр потерял пятую часть \"\n                  \"(шкалы Y у клеток разные)\", x=0.02, ha=\"left\", fontsize=8.5)\ng.figure.subplots_adjust(top=0.84)\ng.savefig(\"facets.svg\")\n\ny = m.assign(year=m[\"month\"].str[:4]).pivot_table(\n    index=\"channel\", columns=\"year\", values=\"млн ₽\", aggfunc=\"sum\")\nprint((y[\"2025\"] / y[\"2024\"] - 1).mul(100).round(1).sort_values().to_string())", "out": "channel\nколл-центр       -20.0\nмаркетплейс       -0.2\nсоцсети            2.2\nкешбэк-сервисы     2.7\nофлайн-точки       4.5\nсайт               4.6\nпоиск              6.5\nпартнёры           8.2\nрассылка          11.7\nприложение        65.9", "outLabel": "Вывод print; рисунок — под блоком"}, "pie2bars": {"title": "Круг становится столбцами, и приложение видно третьим", "badge": "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0", "lang": "python", "code": "import matplotlib.pyplot as plt\nimport pandas as pd\n\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 7.5})\n\ndf = pd.read_csv(\"data/viz/sales_monthly.csv\")\ny25 = df[df[\"month\"].str.startswith(\"2025\")]\ns = y25.groupby(\"channel\")[\"revenue\"].sum() / 1e6     # млн ₽, каналы по алфавиту\nshare = s / s.sum() * 100\n\nfig, (left, right) = plt.subplots(1, 2, figsize=(6.4, 2.7), layout=\"constrained\",\n                                  width_ratios=[1, 1.15])\nleft.pie(s, labels=s.index, startangle=-40, textprops={\"fontsize\": 6.5})  # доли в порядке groupby\nleft.set_title(\"Было: десять углов по алфавиту\", loc=\"left\", fontsize=8.5)\n\ntop = share.sort_values()                              # по возрастанию: крупный канал окажется наверху\nbars = right.barh(top.index, top.values, color=\"#0d7468\")\nright.bar_label(bars, labels=[f\"{v:.1f}%\".replace(\".\", \",\") for v in top], padding=3)\nright.set_xticks([])                                   # подписи на столбцах заменяют ось\nright.spines[[\"top\", \"right\", \"bottom\"]].set_visible(False)\nright.set_title(\"Стало: приложение — третье\", loc=\"left\", fontsize=8.5)\nfig.savefig(\"pie_to_bars.svg\")\n\nprint(share.sort_values(ascending=False).round(1).to_string())", "out": "channel\nсайт              27.4\nмаркетплейс       18.7\nприложение        15.1\nпоиск             12.8\nрассылка           7.4\nсоцсети            5.2\nпартнёры           4.8\nофлайн-точки       3.8\nкешбэк-сервисы     3.0\nколл-центр         1.7", "outLabel": "Вывод print; рисунок — под блоком"}};/*code:end*/

  const D = DATA, CH = D.ch, NC = CH.length, NM = D.months.length;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const f1 = v => v.toFixed(1).replace('.', ',');
  const n1 = v => Math.round(v * 10) / 10;
  const IX = Object.fromEntries(CH.map((c, i) => [c, i]));
  const APP = IX['приложение'], CC = IX['колл-центр'], SITE = IX['сайт'], MP = IX['маркетплейс'], SRCH = IX['поиск'];
  const SORTED = CH.map((c, i) => i).sort((a, b) => D.y25[b] - D.y25[a]);
  const RANK = []; SORTED.forEach((c, r) => { RANK[c] = r; });
  const MAXC = D.M.map(r => Math.max(...r));
  const SUM25 = D.y25.reduce((s, v) => s + v, 0);

  /* ===================== Сцена: одни продажи в шести формах ===================== */
  const SC = ['#6fa2ea', '#f0a247', '#45c48f', '#f06ba5', '#a48af0', '#e3c04d', '#4fc9dc', '#9aa3b2', '#f2756a', '#b6d36b'];
  const ACC = '#36b8a6', WARM = '#f0a247';
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };
  const P2 = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const poly = pts => 'M' + pts.map(([x, y]) => P2(x, y)).join('L') + 'Z';
  const line = pts => 'M' + pts.map(([x, y]) => P2(x, y)).join('L');
  const txt = (x, y, s, cls = 'ct-t', anchor = 'start', op = 1) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="${cls}" text-anchor="${anchor}"${op < 1 ? ` opacity="${op.toFixed(2)}"` : ''}>${s}</text>`;

  function geo(W, H) {
    const nar = W < 520;
    return {
      W, H, nar,
      pie: { cx: W / 2, cy: H / 2, R: Math.min(W * (nar ? 0.3 : 0.24), H * 0.42) },
      bars: { L: nar ? 94 : 120, R: nar ? 52 : 90, T: 4, B: 22 },
      time: { L: 30, R: nar ? 10 : 92, T: 8, B: 22 },
      hist: { L: 30, R: 10, T: 8, B: 22 },
      cols: nar ? 2 : 5
    };
  }
  // круг: сектор как многоугольник из 23 точек (центр + дуга) — так он плавно превращается в столбец
  const PN = 23;
  function piePts(g, i, sweep) {
    const { cx, cy, R } = g.pie;
    let a0 = 0; for (let j = 0; j < i; j++) a0 += D.share25[j];
    const A0 = a0 / 100 * 2 * Math.PI * sweep, A1 = (a0 + D.share25[i]) / 100 * 2 * Math.PI * sweep;
    const pts = [[cx, cy]];
    for (let s = 0; s < PN - 1; s++) { const a = lerp(A0, A1, s / (PN - 2)); pts.push([cx + R * Math.sin(a), cy - R * Math.cos(a)]); }
    return pts;
  }
  const pieMid = (g, i, k = 1.08) => {
    const { cx, cy, R } = g.pie; let a0 = 0; for (let j = 0; j < i; j++) a0 += D.share25[j];
    const a = (a0 + D.share25[i] / 2) / 100 * 2 * Math.PI; return [cx + R * k * Math.sin(a), cy - R * k * Math.cos(a), a];
  };
  function rectPts(x0, y0, x1, y1) {
    const pts = [[x0, (y0 + y1) / 2]], w = x1 - x0, h = y1 - y0, P = 2 * w + h;
    for (let s = 0; s < PN - 1; s++) {
      const d = s / (PN - 2) * P;
      pts.push(d <= w ? [x0 + d, y0] : d <= w + h ? [x1, y0 + d - w] : [x1 - (d - w - h), y1]);
    }
    return pts;
  }
  function barBox(g, row, v, xmax = 120) {
    const b = g.bars, rh = (g.H - b.T - b.B) / NC;
    const y0 = b.T + row * rh + rh * 0.17;
    return [b.L, y0, b.L + v / xmax * (g.W - b.L - b.R), y0 + rh * 0.66];
  }
  const barAxis = (g, op) => {
    const b = g.bars, y = g.H - b.B; let s = `<path class="ct-ax" d="M${b.L},${b.T}V${y}" opacity="${op}"/>`;
    for (const v of [0, 25, 50, 75, 100]) { const x = b.L + v / 120 * (g.W - b.L - b.R); s += txt(x, y + 15, v + (v === 100 ? ' млн' : ''), 'ct-tm', 'middle', op); }
    return s;
  };
  const tx = (g, i) => g.time.L + i / (NM - 1) * (g.W - g.time.L - g.time.R);
  const ty = (g, v, max) => g.H - g.time.B - v / max * (g.H - g.time.T - g.time.B);
  function timeAxis(g, max, op, ticks) {
    const t = g.time, y0 = g.H - t.B;
    let s = `<path class="ct-ax" d="M${t.L},${y0}H${g.W - t.R}" opacity="${op}"/>`;
    for (const v of ticks) s += txt(t.L - 5, ty(g, v, max) + 4, String(v), 'ct-tm', 'end', op) + `<path class="ct-gr" d="M${t.L},${ty(g, v, max).toFixed(1)}H${g.W - t.R}" opacity="${op}"/>`;
    s += txt(tx(g, 0), y0 + 15, 'янв 2024', 'ct-tm', 'start', op) + txt(tx(g, 12), y0 + 15, 'янв 2025', 'ct-tm', 'middle', op) + txt(tx(g, 23), y0 + 15, 'дек', 'ct-tm', 'end', op);
    return s;
  }
  function cellBox(g, c) {
    const pos = RANK[c], cols = g.cols, rows = Math.ceil(NC / cols), gap = g.nar ? 6 : 10;
    const cw = (g.W - gap * (cols - 1)) / cols, chh = (g.H - gap * (rows - 1)) / rows;
    const x0 = (pos % cols) * (cw + gap), y0 = Math.floor(pos / cols) * (chh + gap);
    const two = (CH[c].length + 6) * (g.nar ? 6 : 6.8) + 16 > cw;   // имя и шкала не помещаются в строку
    return { x0, y0, x1: x0 + cw, y1: y0 + chh, two, px0: x0 + 4, px1: x0 + cw - 4, py0: y0 + (two ? 30 : 18), py1: y0 + chh - 4 };
  }
  const cellPt = (b, i, v, max) => [lerp(b.px0, b.px1, i / (NM - 1)), b.py1 - v / max * (b.py1 - b.py0)];
  const hx = (g, v) => g.hist.L + v / 11 * (g.W - g.hist.L - g.hist.R);
  const hy = (g, k) => g.H - g.hist.B - (k + 0.5) / 46 * (g.H - g.hist.T - g.hist.B);
  function sqGeo(g) {
    const h = g.H - 8 - 24, w = Math.min(g.W - 40, h * 1.5), L = (g.W - w) / 2 + 14;
    return { L, w, h, x: v => L + v / 11.5 * w, y: v => 8 + h - v / 11.5 * h };
  }
  const dotPos = (g, c, i) => { const [b, k] = D.hist.pos[c][i]; return [hx(g, (b + 0.5) * D.hist.w), hy(g, k)]; };
  const ownMax = c => MAXC[c] * 1.12;

  const QS = [
    ['Сайт даёт больше четверти выручки?', 'Приложение больше поиска?'],
    ['Какой канал крупнейший?', 'Насколько приложение больше поиска?'],
    ['Приложение больше поиска?', 'Как выручка менялась по месяцам?'],
    ['Какой канал третий по выручке?', 'Два первых канала дают больше половины?'],
    ['Когда продажи на пике?', 'Какой канал дал рост?'],
    ['Какой канал крупнейший каждый месяц?', 'Что происходит с колл-центром?'],
    ['У какого канала скачок и когда?', 'Теряет ли колл-центр выручку?'],
    ['Какой канал угасает, а какой растёт?', 'Какой канал крупнее?'],
    ['Какие месячные суммы обычны?', 'Какой это канал и месяц?'],
    ['Повторяет ли 2025-й год 2024-й?', 'В каком месяце был пик?']
  ];
  const HUD = [[10, 10, 'угол'], [10, 10, 'угол'], [10, 10, 'длина'], [10, 2, 'длина'], [24, 1, 'положение'], [240, 10, 'положение'], [240, 1, 'положение'], [240, 1, 'положение'], [240, 1, 'длина'], [120, 2, 'положение']];
  const peakI = D.total.indexOf(Math.max(...D.total)), dipI = D.total.indexOf(Math.min(...D.total));
  const monthRu = i => ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'][i % 12] + ' ' + (2024 + Math.floor(i / 12));
  const siteMin = Math.min(...D.M[SITE]), siteMax = Math.max(...D.M[SITE]);

  // один кадр сцены: SVG, выноски [x, y, текст, где], подписи над графиком — всё из (k, p)
  function frame(g, k, p) {
    let s = '';
    const calls = [], showC = p >= 0.6;
    const e = ease(seg(p, 0, 0.7));
    if (k <= 1) {
      const sw = k === 0 ? ease(seg(p, 0, 0.6)) : 1;
      const dim = k === 1 ? ease(seg(p, 0, 0.4)) : 0;
      CH.forEach((c, i) => {
        const op = k === 1 && i !== APP && i !== SRCH ? 1 - 0.75 * dim : 1;
        s += `<path d="${poly(piePts(g, i, sw))}" fill="${SC[i]}" stroke="#0b0f19" stroke-width="1.2" opacity="${op.toFixed(2)}"/>`;
      });
      const lop = seg(p, k === 0 ? 0.55 : 0, k === 0 ? 0.8 : 0.01);
      CH.forEach((c, i) => {
        if (D.share25[i] < (g.nar ? 12 : 4.5)) return;
        const [x, y, a] = pieMid(g, i, 1.1);
        s += txt(x, y + 4, c, 'ct-t', Math.sin(a) >= 0 ? 'start' : 'end', lop * (k === 1 && i !== APP && i !== SRCH ? 1 - 0.7 * dim : 1));
      });
      if (showC && k === 0) { const [x, y] = pieMid(g, SITE, 0.62); calls.push([x, y, `сайт — ${f1(D.share25[SITE])}%, чуть больше четверти`, 'u']); }
      if (showC && k === 1) {
        const [x1, y1] = pieMid(g, APP, 0.62), [x2, y2] = pieMid(g, SRCH, 0.62);
        calls.push([x1, y1, `приложение ${f1(D.share25[APP])}%`, 'u'], [x2, y2, `поиск ${f1(D.share25[SRCH])}%: на глаз так же`, 'd']);
      }
    } else if (k <= 3) {
      const m = k === 2 ? e : 1, so = k === 3 ? e : 0;
      CH.forEach((c, i) => {
        const row = lerp(i, RANK[i], so), [x0, y0, x1, y1] = barBox(g, row, D.y25[i]);
        const pts = k === 2 ? piePts(g, i, 1).map((q, j) => [lerp(q[0], rectPts(x0, y0, x1, y1)[j][0], m), lerp(q[1], rectPts(x0, y0, x1, y1)[j][1], m)]) : rectPts(x0, y0, x1, y1);
        const col = k === 3 && i !== APP ? mix(SC[i], ACC, so) : SC[i];
        s += `<path d="${poly(pts)}" fill="${col}"/>`;
        const lop = k === 2 ? seg(p, 0.55, 0.85) : 1;
        s += txt(g.bars.L - 6, (y0 + y1) / 2 + 4, c, i === APP && k === 3 ? 'ct-t ct-hi' : 'ct-t', 'end', lop);
        if (k === 3 && !g.nar) s += txt(x1 + 5, (y0 + y1) / 2 + 4, f1(D.share25[i]) + ' %', 'ct-tm', 'start', seg(p, 0.6, 0.9));
      });
      s += barAxis(g, k === 2 ? seg(p, 0.6, 0.9) : 1);
      if (showC && k === 2) {
        const a = barBox(g, APP, D.y25[APP]), b = barBox(g, SRCH, D.y25[SRCH]);
        calls.push([a[2], (a[1] + a[3]) / 2, `${f1(D.y25[APP])} млн ₽`, 'r'], [b[2], (b[1] + b[3]) / 2, `${f1(D.y25[SRCH])} млн: разница видна`, 'r']);
      }
      if (showC && k === 3) {
        const a = barBox(g, 2, D.y25[APP]), b = barBox(g, 1, D.y25[MP]);
        calls.push([a[2], (a[1] + a[3]) / 2, 'третье место — приложение', 'r']);
        if (!g.nar) calls.push([b[2], b[1], 'сайт + маркетплейс — больше половины? Складывайте в уме', 'r']);
      }
    } else if (k === 4) {
      const sh = ease(seg(p, 0, 0.35));
      if (sh < 1) SORTED.forEach((i, r) => { const [x0, y0, x1, y1] = barBox(g, r, D.y25[i]); s += `<path d="${poly(rectPts(x0, y0, lerp(x1, x0, sh), y1))}" fill="${i === APP ? SC[APP] : ACC}" opacity="${(1 - sh).toFixed(2)}"/>`; });
      const aop = seg(p, 0.3, 0.45);
      s += timeAxis(g, 45, aop, [0, 10, 20, 30, 40]);
      const lp = seg(p, 0.35, 0.85) * (NM - 1), pts = [];
      for (let i = 0; i <= Math.floor(lp); i++) pts.push([tx(g, i), ty(g, D.total[i], 45)]);
      if (lp < NM - 1 && lp > 0) { const i = Math.floor(lp), f = lp - i; pts.push([lerp(tx(g, i), tx(g, i + 1), f), ty(g, lerp(D.total[i], D.total[i + 1], f), 45)]); }
      if (pts.length > 1) s += `<path class="ct-line" d="${line(pts)}" stroke="${ACC}" stroke-width="2.6"/>`;
      if (p >= 0.85) {
        calls.push([tx(g, peakI), ty(g, D.total[peakI], 45), `пик: ${monthRu(peakI)}, ${f1(D.total[peakI])} млн`, 'l'], [tx(g, dipI), ty(g, D.total[dipI], 45), `провал: ${monthRu(dipI)}, ${f1(D.total[dipI])} млн`, 'd']);
      }
    } else if (k === 5) {
      const max = lerp(45, 11, e);
      s += timeAxis(g, max, 1, e < 0.5 ? [0, 10, 20, 30, 40] : [0, 2, 4, 6, 8, 10]);
      s += `<clipPath id="ct-clip"><rect x="0" y="0" width="${g.W}" height="${g.H - g.time.B + 2}"/></clipPath><g clip-path="url(#ct-clip)">`;
      for (let c = NC - 1; c >= 0; c--) {
        const pts = D.M[c].map((v, i) => [tx(g, i), ty(g, lerp(D.total[i], v, e), max)]);
        s += `<path class="ct-line" d="${line(pts)}" stroke="${mix(ACC, SC[c], e)}" stroke-width="${c === APP ? 2.4 : 1.6}"/>`;
      }
      s += '</g>';
      if (!g.nar && e > 0.9) [SITE, MP, APP, SRCH].forEach(c => { s += txt(tx(g, NM - 1) + 6, ty(g, D.M[c][NM - 1], max) + 4 + (c === MP ? 4 : c === APP ? -4 : 0), CH[c], 'ct-t', 'start', seg(e, 0.9, 1)); });
      if (showC) calls.push([tx(g, 19), ty(g, D.M[APP][19], 11), 'приложение обгоняет поиск, а осенью — маркетплейс', 'l'], [tx(g, 7), ty(g, 1.4, 11), 'пять мелких каналов слиплись у нуля', 'u']);
    } else if (k <= 7) {
      const mv = k === 6 ? e : 1, sc = k === 7 ? e : 0;
      if (mv < 1) s += timeAxis(g, 11, 1 - mv, [0, 2, 4, 6, 8, 10]);
      for (let c = 0; c < NC; c++) {
        const b = cellBox(g, c), max = lerp(11, ownMax(c), sc);
        const pts = D.M[c].map((v, i) => { const [cx, cy] = cellPt(b, i, v, max); return [lerp(tx(g, i), cx, mv), lerp(ty(g, v, 11), cy, mv)]; });
        const top = seg(p, k === 6 ? 0.5 : 0, k === 6 ? 0.8 : 0.01);
        if (top > 0) {
          s += `<path class="ct-ax" d="M${b.px0},${b.py1.toFixed(1)}H${b.px1}" opacity="${top}"/>`;
          s += txt(b.x0 + 4, b.y0 + 12, CH[c], c === APP || c === CC ? 'ct-t ct-hi' : 'ct-t', 'start', top);
          s += txt(b.x1 - 4, b.y0 + (b.two ? 26 : 12), 'до ' + (max >= 2 ? Math.round(max) : f1(max)), 'ct-tm', 'end', k === 7 ? seg(p, 0.5, 0.8) : top);
        }
        const col = k === 6 ? mix(SC[c], c === APP || c === CC ? WARM : ACC, mv) : (c === APP || c === CC ? WARM : ACC);
        s += `<path class="ct-line" d="${line(pts)}" stroke="${col}" stroke-width="${g.nar ? 1.5 : 1.8}"/>`;
      }
      if (showC) {
        const a = cellBox(g, APP), b = cellBox(g, CC), ma = lerp(11, ownMax(APP), sc), mb = lerp(11, ownMax(CC), sc);
        const pa = cellPt(a, 17, D.M[APP][17], ma), pb = cellPt(b, 20, D.M[CC][20], mb);
        if (k === 6) calls.push([pa[0], pa[1], 'ступенька: июнь 2025', 'u'], [pb[0], pb[1], 'колл-центр у самого дна', 'u']);
        else calls.push([pa[0], pa[1], `+${Math.round(D.chg[APP])}% за год`, 'u'], [pb[0], pb[1], `${String(Math.round(D.chg[CC])).replace('-', '−')}% за год`, 'u']);
      }
    } else if (k === 8) {
      const fade = 1 - seg(p, 0, 0.2), mv = ease(seg(p, 0.1, 0.75)), r = Math.max(1.6, Math.min((g.W - 40) / 22 * 0.4, (g.H - 30) / 46 * 0.5));
      for (let c = 0; c < NC; c++) {
        const b = cellBox(g, c), max = ownMax(c);
        if (fade > 0) {
          s += `<path class="ct-line" d="${line(D.M[c].map((v, i) => cellPt(b, i, v, max)))}" stroke="${c === APP || c === CC ? WARM : ACC}" stroke-width="1.6" opacity="${fade.toFixed(2)}"/>`;
          s += txt(b.x0 + 4, b.y0 + 12, CH[c], 'ct-t', 'start', fade);
        }
        D.M[c].forEach((v, i) => {
          const [x0, y0] = cellPt(b, i, v, max), [x1, y1] = dotPos(g, c, i);
          s += `<circle cx="${lerp(x0, x1, mv).toFixed(1)}" cy="${lerp(y0, y1, mv).toFixed(1)}" r="${lerp(1.4, r, mv).toFixed(1)}" fill="${ACC}"/>`;
        });
      }
      const aop = seg(p, 0.5, 0.8), y0 = g.H - g.hist.B;
      s += `<path class="ct-ax" d="M${g.hist.L},${y0}H${g.W - g.hist.R}" opacity="${aop}"/>`;
      for (const v of [0, 2, 4, 6, 8, 10]) s += txt(hx(g, v), y0 + 15, v + (v === 10 ? ' млн' : ''), 'ct-tm', 'middle', aop);
      for (const n of [0, 20, 40]) s += txt(g.hist.L - 5, hy(g, n - 0.5) + 4, String(n), 'ct-tm', 'end', aop);
      if (p >= 0.8) calls.push([hx(g, 1.25), hy(g, 45), `${Math.round(D.under25)}% месяцев канала — меньше 2,5 млн`, 'r'], [hx(g, 9.2), hy(g, 4), `сайт: ${f1(siteMin)}–${f1(siteMax)} млн в месяц`, 'u']);
    } else {
      const q = sqGeo(g), mv = ease(seg(p, 0, 0.7)), r = Math.max(1.8, Math.min(4, g.W / 160));
      const dop = seg(p, 0.45, 0.75), y0 = 8 + q.h;
      s += `<path class="ct-ax" d="M${q.L},8V${y0}H${q.L + q.w}" opacity="${dop}"/><path d="M${q.x(0)},${q.y(0)}L${q.x(11.5)},${q.y(11.5)}" stroke="#6f7a91" stroke-dasharray="4 4" opacity="${dop}"/>`;
      for (const v of [0, 5, 10]) s += txt(q.x(v), y0 + 15, String(v), 'ct-tm', 'middle', dop) + txt(q.L - 5, q.y(v) + 4, String(v), 'ct-tm', 'end', dop);
      s += txt(q.L + 8, 20, g.nar ? 'X — 2024, Y — 2025, млн ₽' : 'X — месяц 2024, Y — тот же месяц 2025, млн ₽', 'ct-tm', 'start', dop);
      for (let c = 0; c < NC; c++) D.M[c].forEach((v, i) => {
        const [x0, yy0] = dotPos(g, c, i), late = i >= 12;
        const x1 = late ? q.x(D.M[c][i - 12]) : q.x(v), y1 = late ? q.y(v) : y0;
        const hot = c === APP && i >= 17;
        s += `<circle cx="${lerp(x0, x1, mv).toFixed(1)}" cy="${lerp(yy0, y1, mv).toFixed(1)}" r="${r.toFixed(1)}" fill="${hot ? mix(ACC, WARM, mv) : ACC}" opacity="${late ? 1 : (1 - mv).toFixed(2)}"/>`;
      });
      if (p >= 0.75) calls.push([q.x(D.M[APP][11]), q.y(D.M[APP][23]), 'приложение с июня 2025 — выше диагонали', 'u'], [q.x(8.5), q.y(8.5), `r = ${String(D.r.toFixed(2)).replace('.', ',')}: год повторяет год`, 'd']);
    }
    return { s, calls };
  }

  const scene = {
    parts: [{ n: '01', name: 'Круг', s: [0, 1] }, { n: '02', name: 'Столбцы', s: [2, 3] }, { n: '03', name: 'Линия', s: [4, 5] }, { n: '04', name: 'Множители', s: [6, 7] }, { n: '05', name: 'Другие вопросы', s: [8, 9] }],
    steps: [
      { title: 'Доли каналов: круг', dur: 2800, body: `<p>Учебные продажи интернет-магазина за&nbsp;2025&nbsp;год: десять каналов, ${f1(SUM25)}&nbsp;млн&nbsp;₽. Круговая диаграмма в&nbsp;порядке строк файла — то, что библиотека нарисует по&nbsp;умолчанию.</p><p>Над графиком два вопроса: на&nbsp;первый он&nbsp;отвечает хорошо, на&nbsp;второй — плохо.</p>` },
      { title: 'Углы почти не различаются', dur: 2800, body: `<p>Приложение даёт ${f1(D.share25[APP])}% выручки, поиск — ${f1(D.share25[SRCH])}%. Разница больше двух процентных пунктов, но&nbsp;углы и&nbsp;площади глаз сравнивает грубо, и&nbsp;сектора выглядят одинаковыми.</p><p>Зато видно, что сайт — чуть больше четверти целого: прямой угол — простая дробь.</p>` },
      { title: 'Круг разворачивается в столбцы', dur: 3000, body: `<p>Те&nbsp;же десять чисел, но&nbsp;теперь каждое — длина столбца от&nbsp;общей оси. Приложение (${f1(D.y25[APP])}&nbsp;млн&nbsp;₽) и&nbsp;поиск (${f1(D.y25[SRCH])}&nbsp;млн) различаются сразу.</p><p>О&nbsp;времени этот график ничего не&nbsp;знает: на&nbsp;канал приходится одна сумма за&nbsp;год.</p>` },
      { title: 'Сортировка по значению', dur: 3000, body: `<p>Столбцы встают по&nbsp;убыванию, и&nbsp;место канала читается сверху вниз: приложение третье. Десять цветов больше не&nbsp;нужны, хватает одного акцента.</p><p>А&nbsp;вопрос о&nbsp;доле столбцы решают хуже круга: чтобы понять, держат&nbsp;ли сайт и&nbsp;маркетплейс половину, их&nbsp;надо сложить в&nbsp;уме.</p>` },
      { title: 'Сумма по месяцам — линия', dur: 3200, body: `<p>Новый вопрос — «когда?». Выручка магазина за&nbsp;каждый из&nbsp;24&nbsp;месяцев ложится линией, и&nbsp;видна сезонность: пик в&nbsp;декабре 2025&nbsp;года, провал в&nbsp;июне 2024-го.</p><p>Каналов на&nbsp;этой линии уже не&nbsp;видно.</p>` },
      { title: 'Десять линий сразу', dur: 3200, body: `<p>Линия распадается на&nbsp;десять каналов. Сайт крупнее всех, а&nbsp;приложение с&nbsp;июня 2025&nbsp;года выше поиска и&nbsp;к&nbsp;осени догоняет маркетплейс.</p><p>Внизу пять мелких каналов теснятся у&nbsp;дна, ниже 2,2&nbsp;млн: что происходит с&nbsp;колл-центром, не&nbsp;разобрать.</p>` },
      { title: 'Каждому каналу — своя клетка', dur: 3200, body: `<p>Малые множители: десять маленьких графиков с&nbsp;одинаковыми осями. Легенда не&nbsp;нужна — подпись стоит над клеткой.</p><p>На&nbsp;общей шкале до&nbsp;11&nbsp;млн видна ступенька приложения в&nbsp;июне 2025&nbsp;года, а&nbsp;колл-центр по-прежнему лежит у&nbsp;дна.</p>` },
      { title: 'Своя шкала у каждой клетки', dur: 3000, body: `<p>Каждая клетка теперь от&nbsp;нуля до&nbsp;своего максимума. Форма мелких рядов видна целиком: колл-центр за&nbsp;год потерял ${Math.abs(Math.round(D.chg[CC]))}% выручки, приложение выросло на&nbsp;${Math.round(D.chg[APP])}%.</p><p>Цена — уровни больше не&nbsp;сравнить на&nbsp;глаз. Разные шкалы оговаривают в&nbsp;подписи.</p>` },
      { title: 'Распределение: какие суммы обычны', dur: 3400, body: `<p>Все 240 точек «канал&nbsp;× месяц» ссыпаются в&nbsp;корзины по&nbsp;0,5&nbsp;млн&nbsp;₽ — получается гистограмма. ${Math.round(D.under25)}% месячных сумм меньше 2,5&nbsp;млн, справа тянется хвост крупных каналов.</p><p>Какой канал и&nbsp;какой месяц стоят за&nbsp;точкой, здесь уже не&nbsp;видно.</p>` },
      { title: 'Связь: 2025-й против 2024-го', dur: 3600, next: 'Читать подробнее', body: `<p>Каждая точка — месяц 2025&nbsp;года против того&nbsp;же месяца 2024-го у&nbsp;того&nbsp;же канала, 120&nbsp;пар. Точки лежат у&nbsp;диагонали, корреляция ${String(D.r.toFixed(2)).replace('.', ',')}.</p><p>Вверх отрываются только точки приложения с&nbsp;июня 2025-го. Четыре вопроса — четыре формы графика.</p>` }
    ],
    hud: [{ id: 'n', label: 'Значений' }, { id: 'col', label: 'Цветов' }, { id: 'enc', label: 'Кодирование' }],
    legend: '<span><i style="background:#36b8a6"></i>хорошо отвечает</span><span><i style="background:#f2756a"></i>плохо отвечает</span><span><i style="background:#f0a247"></i>акцент</span>',
    info: 'ТИП ГРАФИКА',
    aiNote: `В анимации одни и те же учебные продажи (10 каналов, 24 месяца, 2024–2025) перетекают: круговая диаграмма долей 2025 года → столбцы → столбцы по убыванию → линия выручки по месяцам → десять линий каналов → малые множители (общая шкала, затем своя) → гистограмма 240 месячных сумм → рассеяние «месяц 2024 против месяца 2025». На каждом шаге над графиком вопрос, на который он отвечает хорошо, и вопрос, на который плохо.`,
    mount(root, api) {
      root.innerHTML = '<div class="ct-sc"><div class="ct-qs"><p class="ct-q ct-good"><b>✓ хорошо</b><span id="ct-q1"></span></p><p class="ct-q ct-bad"><b>✗ плохо</b><span id="ct-q2"></span></p></div><div class="ct-plot" id="ct-plot"><svg class="ct-svg" id="ct-svg" aria-hidden="true"></svg><div class="ct-calls" id="ct-calls"></div></div></div>';
      const plot = root.querySelector('#ct-plot'), svg = root.querySelector('#ct-svg'), cl = root.querySelector('#ct-calls');
      let sig = '', lastK = -1;
      return {
        render(k, p) {
          const W = Math.max(260, plot.clientWidth || 600), H = Math.max(180, plot.clientHeight || 340);
          const key = [k, Math.round(p * 160), W, H].join('|');
          const h = HUD[k];
          api.hud('n', String(h[0])); api.hud('col', String(h[1])); api.hud('enc', h[2]);
          if (k !== lastK) { root.querySelector('#ct-q1').textContent = QS[k][0]; root.querySelector('#ct-q2').textContent = QS[k][1]; lastK = k; }
          if (key === sig) return; sig = key;
          const g = geo(W, H), f = frame(g, k, p);
          svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
          let dots = '';
          const mw = g.nar ? 150 : 210;
          const place = ([x, y, , w]) => {
            if (w === 'u' && y < 52) w = 'd';
            const left = w === 'u' || w === 'd' ? clamp(x, mw / 2 + 4, W - mw / 2 - 4) : w === 'r' ? Math.min(x + 10, W - mw - 4) : Math.max(x - 10, mw + 4);
            return [left, y, w];
          };
          const html = f.calls.map(c => {
            dots += `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="3.5" class="ct-anc"/>`;
            const [l, y, w] = place(c);
            return `<div class="ct-call ct-${w}" style="left:${l.toFixed(0)}px;top:${y.toFixed(0)}px">${c[2]}</div>`;
          }).join('');
          svg.innerHTML = f.s + dots;
          const ck = f.calls.map(c => c[2]).join('|') + W;
          if (cl.dataset.k !== ck) { cl.innerHTML = html; cl.dataset.k = ck; }
          else cl.querySelectorAll('.ct-call').forEach((el, i) => { const [l, y, w] = place(f.calls[i]); el.style.left = l.toFixed(0) + 'px'; el.style.top = y.toFixed(0) + 'px'; el.className = 'ct-call ct-' + w; });
        }
      };
    }
  };

  /* ===================== Интерактив «Переключи тип» ===================== */
  const TYPES = [['pie', 'Круг'], ['abc', 'Столбцы А–Я'], ['sorted', 'Столбцы по убыванию'], ['full', 'Полоса 100%'], ['lines', '10 линий'], ['mult', 'Малые множители'], ['log', 'Лог-ось'], ['heat', 'Тепловая карта']];
  const TN = Object.fromEntries(TYPES);
  const QQ = {
    A: { tab: 'Сравнение', short: 'кто третий', q: 'Какой канал третий по выручке за 2025 год?', opts: [['маркетплейс', 'маркетплейс'], ['приложение', 'приложение'], ['поиск', 'поиск'], ['рассылка', 'рассылка'], ['none', 'по графику не ответить']], truth: D.ans.third, hl: ['приложение', 'поиск'] },
    B: { tab: 'Динамика', short: 'кто теряет', q: 'Какой из мелких каналов за два года потерял выручку?', opts: [['партнёры', 'партнёры'], ['офлайн-точки', 'офлайн-точки'], ['кешбэк-сервисы', 'кешбэк-сервисы'], ['колл-центр', 'колл-центр'], ['none', 'по графику не ответить']], truth: D.ans.losers[0], hl: ['колл-центр'] },
    C: { tab: 'Доля', short: 'больше половины', q: 'Сайт и маркетплейс вместе дали больше половины выручки 2025 года?', opts: [['yes', 'да, больше половины'], ['no', 'нет, меньше половины'], ['none', 'по графику не ответить']], truth: D.ans.top2 > 50 ? 'yes' : 'no', hl: ['сайт', 'маркетплейс'] }
  };
  const NOTIME = { pie: 1, abc: 1, sorted: 1, full: 1 };
  const correctOf = (q, t) => (q === 'B' && NOTIME[t] ? 'none' : QQ[q].truth);
  const half = SUM25 / 2, two = D.y25[SITE] + D.y25[MP];
  const noTime = 'На этом графике только итоги 2025 года: времени на нём нет, и потерю выручки увидеть нельзя. Честный ответ — «по графику не ответить».';
  const NOTE = {
    A: {
      pie: `Приложение (${f1(D.share25[APP])}%) и поиск (${f1(D.share25[SRCH])}%) отличаются на ${f1(D.share25[APP] - D.share25[SRCH])} п. п., а углы глаз сравнивает грубо. Без подписей процентов ответ почти угадывается.`,
      abc: 'Длины на общей оси сравниваются точно, но третий по величине столбец приходится искать среди десяти: порядок задаёт алфавит.',
      sorted: 'Третий столбец сверху и есть ответ. Положение на общей шкале и порядок по значению превращают вопрос в задачу на секунду.',
      full: 'Сегменты идут по убыванию, третий слева — приложение. Но длины сегментов сравнивать труднее, чем столбцы от общей оси: у них разные начала.',
      lines: 'Ответ спрятан в сумме за год: до июня 2025 года линия приложения ниже поиска, после — выше. Складывать по линиям двенадцать месяцев глаз не умеет.',
      mult: 'Шкалы у клеток разные, поэтому уровни каналов сравнивают по подписям осей, а не на глаз. Малые множители — про форму рядов, а не про уровни.',
      log: 'На логарифмической оси расстояния — это отношения, сумму за год по ним не прочитать. Видно лишь, что во второй половине года приложение выше поиска.',
      heat: 'Уровень закодирован оттенком — последним пунктом в порядке Кливленда и Макгилла. Строки приложения и поиска на глаз почти одинаковые.'
    },
    B: {
      pie: noTime, abc: noTime, sorted: noTime, full: noTime,
      lines: `Мелкие каналы сжаты у нуля общей шкалы до 11 млн, их линии слиплись. Падение колл-центра с ${f1(D.M[CC][0])} до ${f1(D.M[CC][NM - 1])} млн занимает пару пикселей.`,
      mult: `У каждой клетки своя шкала от нуля, и форма ряда видна целиком: колл-центр за год потерял ${Math.abs(Math.round(D.chg[CC]))}% выручки, остальные три канала растут.`,
      log: 'Логарифмическая ось растягивает мелкие значения, и наклон вниз у колл-центра заметен. Мешают десять цветов и сверка с легендой.',
      heat: 'Строки мелких каналов на общей шкале цвета почти белые: посветление строки колл-центра к концу периода едва различимо.'
    },
    C: {
      pie: `Сектора сайта и маркетплейса идут первыми от 12 часов и не доходят до 6 часов: ${f1(D.ans.top2)}% — меньше половины. Круг хорош для сравнения с простой дробью.`,
      abc: `Нужно сложить два столбца (${f1(D.y25[SITE])} и ${f1(D.y25[MP])} млн) и сравнить с половиной суммы всех десяти (${f1(half)} млн). Такую арифметику на столбцах делают в уме.`,
      sorted: `Два верхних столбца рядом, но их сумму всё равно надо сравнить с половиной суммы всех столбцов: ${f1(two)} млн против ${f1(half)}.`,
      full: `Два первых сегмента кончаются до отметки 50%: вместе ${f1(D.ans.top2)}%. Полоса 100% отвечает на вопрос о доле так же быстро, как круг, и точнее его.`,
      lines: 'Доли по линиям не считают: надо сложить по 12 месяцев для каждого канала. Ответ в данных есть, но график для него не годится.',
      mult: 'Каждая клетка в своей шкале, суммы и доли по ним не сложить. Это график для формы рядов, а не для долей.',
      log: 'На логарифмической оси сложение не работает совсем: расстояния на ней — это отношения.',
      heat: 'Доля спрятана в сумме оттенков 12 клеток двух строк против всех остальных. Такую сумму глаз не делает.'
    }
  };

  function buildSwitch(box, api) {
    const { $, esc, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Найдите ответ за пять секунд <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="ct-reset">Сбросить</button></div></div>
<p class="hint ct-do">Выберите вопрос и тип графика, нажмите «Старт» и выберите ответ. Время идёт по-настоящему, ответ сверяется с таблицей pandas.</p>
<div class="tabs" id="ct-qt" role="group" aria-label="Вопрос">${Object.entries(QQ).map(([k, q]) => `<button type="button" data-qq="${k}">${q.tab}: ${q.short}</button>`).join('')}</div>
<div class="ct-types" id="ct-ty" role="group" aria-label="Тип графика">${TYPES.map(([k, n]) => `<button type="button" data-t="${k}">${n}</button>`).join('')}</div>
<div class="stage"><div class="ct-wbox"><div class="ct-clock"><i id="ct-bar"></i></div><div class="ct-wplot" id="ct-wplot"><svg id="ct-wsvg" aria-hidden="true"></svg><div class="ct-cover" id="ct-cover"><p id="ct-ctext"></p><button type="button" class="btn accent" id="ct-start">Старт</button></div></div><div class="ct-chips" id="ct-chips"></div></div>
<div class="narr"><p class="cap" id="ct-qtext"></p><div class="ct-sec"><b id="ct-sec">0,0 с</b><span id="ct-lim">из 5 секунд</span></div><div class="ct-ans" id="ct-ans"></div><div class="narr-text" id="ct-msg"></div></div></div>
<div class="ct-res" id="ct-res"></div>
<div class="status"><span><span class="dot" id="ct-dot"></span><span id="ct-n"></span></span><span id="ct-ok"></span><span id="ct-fast"></span><span class="grow"></span><span id="ct-last"></span></div>`;
    let q = 'A', t = 'pie', st = 'idle', t0 = 0, raf = 0, chosen = null, el = 0, RES = {}, last = '';
    const plot = $('ct-wplot'), svgEl = $('ct-wsvg');
    const label = (qq, v) => QQ[qq].opts.find(o => o[0] === v)[1];
    function chips(order) { return order.map(i => `<span><i class="ct-k${i}"></i>${esc(CH[i])}</span>`).join(''); }

    // восемь графиков по тем же числам; hl — подсветка после ответа
    function draw(type, W, H, hl) {
      const on = i => !hl || hl.includes(CH[i]), dim = i => (on(i) ? '' : ' ct-dim');
      const T = (x, y, s, cls = 'ct-wt', a = 'start') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="${cls}" text-anchor="${a}">${s}</text>`;
      let s = '', leg = '';
      const nar = W < 480;
      if (type === 'pie') {
        const cx = W / 2, cy = H / 2, R = Math.min(H * 0.42, W * (nar ? 0.3 : 0.22));
        let a0 = 0;
        SORTED.forEach(i => {
          const a1 = a0 + D.share25[i] / 100 * 2 * Math.PI, big = a1 - a0 > Math.PI ? 1 : 0;
          s += `<path class="ct-fill ct-k${i}${dim(i)}" d="M${cx},${cy}L${(cx + R * Math.sin(a0)).toFixed(1)},${(cy - R * Math.cos(a0)).toFixed(1)}A${R.toFixed(1)},${R.toFixed(1)} 0 ${big} 1 ${(cx + R * Math.sin(a1)).toFixed(1)},${(cy - R * Math.cos(a1)).toFixed(1)}Z"/>`;
          const am = (a0 + a1) / 2;
          if (!nar && D.share25[i] >= 4.5) s += T(cx + R * 1.08 * Math.sin(am), cy - R * 1.08 * Math.cos(am) + 4, CH[i], 'ct-wt', Math.sin(am) >= 0 ? 'start' : 'end');
          a0 = a1;
        });
        leg = chips(SORTED);
      } else if (type === 'abc' || type === 'sorted') {
        const order = type === 'abc' ? CH.map((c, i) => i).sort((a, b) => CH[a].localeCompare(CH[b], 'ru')) : SORTED;
        const L = nar ? 96 : 118, R = 14, B = 22, rh = (H - B - 4) / NC, x = v => L + v / 120 * (W - L - R);
        for (const v of nar ? [0, 50, 100] : [0, 25, 50, 75, 100]) s += `<path class="ct-wg" d="M${x(v).toFixed(1)},4V${H - B}"/>` + T(x(v), H - 6, v + (v === 100 ? ' млн ₽' : ''), 'ct-wm', 'middle');
        order.forEach((i, r) => {
          const y = 4 + r * rh;
          s += `<rect class="ct-bar${dim(i)}" x="${L}" y="${(y + rh * 0.16).toFixed(1)}" width="${(x(D.y25[i]) - L).toFixed(1)}" height="${(rh * 0.68).toFixed(1)}"/>` + T(L - 6, y + rh / 2 + 4, CH[i], 'ct-wt', 'end');
        });
      } else if (type === 'full') {
        const L = 10, R = 14, x = v => L + v / 100 * (W - L - R), y0 = H / 2 - 30, h = 60;
        let acc = 0;
        for (const v of [0, 25, 50, 75, 100]) s += `<path class="ct-wg" d="M${x(v).toFixed(1)},${y0 - 8}V${y0 + h + 8}"/>` + T(x(v), y0 + h + 24, v + ' %', 'ct-wm', 'middle');
        SORTED.forEach(i => {
          const w = x(acc + D.share25[i]) - x(acc);
          s += `<rect class="ct-fill ct-k${i}${dim(i)}" x="${x(acc).toFixed(1)}" y="${y0}" width="${w.toFixed(1)}" height="${h}" style="stroke:var(--surface);stroke-width:1"/>`;
          if (w > CH[i].length * 7 + 8) s += T(x(acc) + 5, y0 + h / 2 + 4, CH[i], 'ct-wt ct-on');
          acc += D.share25[i];
        });
        leg = chips(SORTED);
      } else if (type === 'lines' || type === 'log') {
        const L = 36, R = 10, T0 = 8, B = 22, X = i => L + i / (NM - 1) * (W - L - R);
        const lg = type === 'log', lo = Math.log10(0.4), hi = Math.log10(12);
        const Y = v => (lg ? H - B - (Math.log10(v) - lo) / (hi - lo) * (H - T0 - B) : H - B - v / 11.5 * (H - T0 - B));
        for (const v of lg ? [0.5, 1, 2, 5, 10] : [0, 2, 4, 6, 8, 10]) s += `<path class="ct-wg" d="M${L},${Y(v).toFixed(1)}H${W - R}"/>` + T(L - 5, Y(v) + 4, String(v).replace('.', ','), 'ct-wm', 'end');
        s += T(X(0), H - 6, 'янв 2024', 'ct-wm') + T(X(12), H - 6, 'янв 2025', 'ct-wm', 'middle') + T(L + 2, T0 + 10, lg ? 'млн ₽, логарифмическая шкала' : 'млн ₽', 'ct-wm');
        for (let c = NC - 1; c >= 0; c--) s += `<path class="ct-ln ct-k${c}${dim(c)}" d="${line(D.M[c].map((v, i) => [X(i), Y(v)]))}"/>`;
        leg = chips(CH.map((c, i) => i));
      } else if (type === 'mult') {
        const cols = nar ? 2 : 5, rows = NC / cols, gap = 10, cw = (W - gap * (cols - 1)) / cols, chh = (H - gap * (rows - 1)) / rows;
        SORTED.forEach((c, pos) => {
          const x0 = (pos % cols) * (cw + gap), y0 = Math.floor(pos / cols) * (chh + gap), px0 = x0 + 4, px1 = x0 + cw - 4, py0 = y0 + 30, py1 = y0 + chh - 6, max = ownMax(c);
          s += `<rect class="ct-cell" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${cw.toFixed(1)}" height="${chh.toFixed(1)}" rx="6"/>`;
          const lab = 'до ' + (max >= 2 ? Math.round(max) : f1(max)), two = (CH[c].length + lab.length) * 6.6 + 20 > cw;
          s += T(x0 + 6, y0 + 14, CH[c], 'ct-wt') + T(x0 + cw - 6, y0 + (two ? 27 : 14), lab, 'ct-wm', 'end');
          s += `<path class="ct-ln ct-acc${dim(c)}" d="${line(D.M[c].map((v, i) => [lerp(px0, px1, i / (NM - 1)), py1 - v / max * (py1 - py0)]))}"/>`;
        });
      } else if (type === 'heat') {
        const L = nar ? 96 : 118, R = 8, B = 22, rh = (H - B - 4) / NC, cw = (W - L - R) / NM;
        SORTED.forEach((c, r) => {
          s += T(L - 6, 4 + r * rh + rh / 2 + 4, CH[c], 'ct-wt', 'end');
          D.M[c].forEach((v, i) => { s += `<rect class="ct-heat${dim(c)}" x="${(L + i * cw).toFixed(1)}" y="${(4 + r * rh).toFixed(1)}" width="${(cw - 1).toFixed(1)}" height="${(rh - 1).toFixed(1)}" fill-opacity="${(0.05 + 0.95 * v / 11).toFixed(2)}"/>`; });
        });
        s += T(L, H - 6, 'янв 2024', 'ct-wm') + T(L + 12 * cw, H - 6, 'янв 2025', 'ct-wm');
        leg = '<span class="ct-grad">светлее — меньше, темнее — больше: 0 … 11 млн ₽ в месяц</span>';
      }
      return { s, leg };
    }
    const dims = () => { const W = Math.max(280, plot.clientWidth || 600); return [W, W < 480 ? (t === 'mult' ? 400 : 290) : 300]; };
    function paint() {
      const [W, H] = dims();
      plot.style.height = H + 'px';
      if (st === 'idle') { svgEl.innerHTML = ''; $('ct-chips').innerHTML = ''; return; }
      const d = draw(t, W, H, st === 'done' ? QQ[q].hl : null);
      svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`); svgEl.setAttribute('width', W); svgEl.setAttribute('height', H);
      svgEl.innerHTML = d.s; $('ct-chips').innerHTML = d.leg;
    }
    function tick() {
      el = (performance.now() - t0) / 1000;
      $('ct-bar').style.width = Math.min(100, el / 5 * 100) + '%';
      $('ct-bar').classList.toggle('over', el > 5);
      $('ct-sec').textContent = f1(el) + ' с';
      if (el >= 60) { finish(null); return; }
      raf = requestAnimationFrame(tick);
    }
    function start() {
      st = 'run'; chosen = null; t0 = performance.now(); el = 0;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
      $('ct-msg').textContent = 'Ищите ответ на графике и выберите его кнопкой.';
      ui(); paint();
    }
    function finish(v) {
      cancelAnimationFrame(raf); st = 'done'; chosen = v;
      const ok = correctOf(q, t), sec = n1(el);
      const o = v === null ? 'late' : v === ok ? 'ok' : v === 'none' ? 'pass' : 'bad';
      RES[t + q] = { o, s: sec };
      const head = o === 'ok' ? `Верно за ${f1(sec)} с${sec <= 5 ? ' — уложились в пять секунд' : ' — дольше пяти секунд'}.` : o === 'pass' ? `Честный пас за ${f1(sec)} с: ответ на графике есть («${label(q, ok)}»), но достать его трудно.` : o === 'late' ? 'Минута прошла без ответа.' : `Неверно: правильный ответ — «${label(q, ok)}».`;
      $('ct-msg').innerHTML = `<b>${esc(head)}</b> ${esc(NOTE[q][t])}`;
      last = `${TN[t]}, ${QQ[q].tab.toLowerCase()}: ${f1(sec)} с ${o === 'ok' ? '✓' : o === 'pass' ? '—' : '✗'}`;
      ui(); paint(); grid();
    }
    function reset(to) {
      cancelAnimationFrame(raf); st = 'idle'; chosen = null; el = 0;
      $('ct-sec').textContent = '0,0 с'; $('ct-bar').style.width = '0%'; $('ct-bar').classList.remove('over');
      $('ct-msg').textContent = to || 'График закрыт, пока вы не нажмёте «Старт»: так время честное.';
      ui(); paint();
    }
    function ui() {
      box.querySelectorAll('#ct-qt [data-qq]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.qq === q)));
      box.querySelectorAll('#ct-ty [data-t]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
      $('ct-qtext').textContent = QQ[q].q;
      $('ct-cover').hidden = st !== 'idle';
      $('ct-ctext').innerHTML = `Вопрос: <b>${esc(QQ[q].q)}</b><br>График: <b>${esc(TN[t])}</b>. Нажмите «Старт» — график откроется, и пойдёт время.`;
      const ok = correctOf(q, t);
      $('ct-ans').innerHTML = QQ[q].opts.map(([v, n]) => `<button type="button" class="ct-a${st === 'done' && v === ok ? ' right' : ''}${st === 'done' && v === chosen && v !== ok ? ' wrong' : ''}" data-a="${v}"${st !== 'run' ? ' disabled' : ''}>${esc(n)}</button>`).join('') + (st === 'done' ? '<button type="button" class="btn ghost small ct-again" id="ct-again">Ещё раз на этой паре</button>' : '');
      $('ct-dot').classList.toggle('live', st === 'run');
      const all = Object.values(RES), okN = all.filter(r => r.o === 'ok').length, fast = all.filter(r => r.o === 'ok' && r.s <= 5).length;
      $('ct-n').textContent = `Пар проверено: ${all.length} из 24`;
      $('ct-ok').textContent = `Верно: ${okN}`;
      $('ct-fast').textContent = `Верно за 5 с: ${fast}`;
      $('ct-last').textContent = last ? 'Последняя: ' + last : 'Попыток ещё не было';
    }
    function grid() {
      const qs = Object.keys(QQ);
      $('ct-res').innerHTML = `<table><thead><tr><th>График</th>${qs.map(k => `<th>${QQ[k].tab}</th>`).join('')}</tr></thead><tbody>${TYPES.map(([k, n]) => `<tr><td>${n}</td>${qs.map(x => { const r = RES[k + x]; return r ? `<td class="ct-r-${r.o}${r.o === 'ok' && r.s > 5 ? ' slow' : ''}">${f1(r.s)} с ${r.o === 'ok' ? '✓' : r.o === 'pass' ? '—' : '✗'}</td>` : '<td class="ct-r-no">·</td>'; }).join('')}</tr>`).join('')}</tbody></table><p class="hint">Зелёный — верно за 5 с, жёлтый — верно, но дольше, «—» — пас, «✗» — ошибка.</p>`;
    }
    box.addEventListener('click', e => {
      const bq = e.target.closest('#ct-qt [data-qq]'), bt = e.target.closest('#ct-ty [data-t]'), ba = e.target.closest('[data-a]');
      if (bq) { q = bq.dataset.qq; reset(); }
      else if (bt) { t = bt.dataset.t; reset(); }
      else if (ba && st === 'run') finish(ba.dataset.a);
      else if (e.target.closest('#ct-start, #ct-again')) start();
    });
    $('ct-reset').addEventListener('click', () => { RES = {}; last = ''; q = 'A'; t = 'pie'; reset(); grid(); });
    if ('ResizeObserver' in window) { let w0 = 0; new ResizeObserver(() => { const w = plot.clientWidth; if (w !== w0) { w0 = w; paint(); } }).observe(plot); }
    reset(); grid();
    return {
      redraw: paint,
      describe() {
        const done = Object.entries(RES).map(([k, r]) => `${TN[k.slice(0, -1)]} / ${QQ[k.slice(-1)].tab.toLowerCase()}: ${f1(r.s)} с, ${{ ok: 'верно', pass: 'пас', bad: 'ошибка', late: 'без ответа' }[r.o]}`);
        return `вопрос: «${QQ[q].q}»; график: ${TN[t]}; ${st === 'idle' ? 'ждёт старта' : st === 'run' ? 'идёт время' : `ответ «${chosen ? label(q, chosen) : 'нет'}», верный «${label(q, correctOf(q, t))}»`}; проверено пар: ${done.length} из 24${done.length ? ' — ' + done.join('; ') : ''}.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-8-2',
    short: 'DA-08',
    title: 'Тип графика под вопрос',
    where: 'блок «Дата аналитика», тема 08 «Визуализация в Python», страница 8.2',
    aiData: 'учебные продажи интернет-магазина sales_monthly.csv: 10 каналов, 4 страны, 24 месяца (2024–2025), выручка в рублях',
    scene,
    widgets: { switch: buildSwitch },
    code: CODE,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'Какой график быстрее всех ответит на вопрос «дают ли сайт и маркетплейс вместе больше половины выручки 2025 года?»', opts: [['Столбцы по убыванию: длину глаз читает точнее угла'], ['Круг или полоса 100%: обе показывают часть целого, и половину на них видно сразу', 1], ['Десять линий по месяцам'], ['Тепловая карта каналов по месяцам']],
      why: `Вопрос не о сравнении двух каналов, а о части целого. На круге сектора сайта и маркетплейса идут от 12 часов и не доходят до 6, на полосе 100% кончаются до отметки 50%: вместе ${f1(D.ans.top2)}%. На столбцах длины точнее, но их надо сложить (${f1(two)} млн) и сравнить с половиной всех (${f1(half)} млн). Линиям и тепловой карте пришлось бы складывать 24 месяца.` },
    q2: { sec: 'idea', q: 'В сцене на шаге с десятью линиями не видно, что колл-центр теряет выручку, а в малых множителях со своей шкалой видно. Почему?', opts: [['На шаге с линиями показаны другие данные'], ['На общей шкале до 11 млн ряд колл-центра занимает пару пикселей у нуля, а своя шкала растягивает его на всю клетку', 1], ['Малые множители сглаживают ряды'], ['Колл-центр начинает терять выручку только в последней клетке']],
      why: 'Данные одни и те же. Колл-центр колеблется между 0,5 и 0,9 млн, а шкала десяти линий идёт до 11 млн, поэтому его падение сжато у нуля вместе с другими мелкими каналами. В клетке со своей шкалой от нуля до максимума тот же ряд занимает всю высоту. Сглаживания нет, а падение идёт все два года.' },
    q3: { sec: 'idea', q: 'Нужно показать, как менялась доля каждого канала по месяцам. Какой график выбрать?', opts: [['24 круговые диаграммы, по одной на месяц'], ['Столбцы 100% по месяцам или линии долей', 1], ['Десять линий выручки в рублях'], ['Одну круговую диаграмму за два года']],
      why: 'Вопрос — динамика долей. Столбцы 100% по месяцам кладут доли на одну шкалу и рядом во времени, линии долей показывают тренд каждого канала. Двадцать четыре круга заставят сравнивать углы между картинками, линии в рублях показывают не доли, а уровни, а один круг за два года теряет время целиком.' },
    q4: { sec: 'idea', q: 'Когда линию рисовать нельзя?', opts: [['Когда по оси X месяцы, а не дни'], ['Когда по оси X категории без естественного порядка, например каналы продаж', 1], ['Когда значения бывают отрицательными'], ['Когда точек больше двенадцати']],
      why: 'Линия соединяет соседние точки и обещает переход между ними: так читают время или другую упорядоченную величину. Между «сайтом» и «поиском» перехода нет, а порядок каналов выбран произвольно, поэтому для них нужны столбцы. Месяцы, отрицательные значения и много точек линии не мешают.' },
    q5: { sec: 'nuances', q: 'Почему две оси Y позволяют показать любую связь?', opts: [['Потому что второй ряд всегда пересчитывается в те же единицы'], ['Потому что масштаб и начало второй оси выбирает автор: подбирая их, любой ряд можно наложить на первый или развести с ним', 1], ['Потому что Matplotlib сглаживает второй ряд'], ['Не позволяют: связь на графике видна, только если она есть в данных']],
      why: 'У каждой оси свои пределы, и общего масштаба нет. В нюансах случайный ряд, не связанный с продажами, то «растёт вместе» с выручкой, то лежит плоско — менялись только два числа в set_ylim. Пересчёта в общие единицы нет, сглаживания тоже, поэтому вид графика говорит о выборе осей, а не о данных.' },
    q6: { sec: 'code', q: 'Что изменится на рисунке, если в этой строке убрать sharey=False?', code: 'g = sns.FacetGrid(m, col="channel", col_order=order, col_wrap=5,\n                  height=1.2, aspect=1.15, sharey=False)', lang: 'python', opts: [['Клетки сольются в один график'], ['Все клетки получат общую шкалу Y: уровни каналов станут сравнимы, а падение колл-центра сожмётся у нуля', 1], ['Пропадут подписи каналов над клетками'], ['seaborn выдаст ошибку: без sharey сетку не построить']],
      why: 'По умолчанию у FacetGrid sharey=True: одна шкала на все клетки. Тогда клетку сайта и клетку колл-центра можно сравнить по высоте, но мелкие ряды прижмутся к нулю, как на шаге сцены с общей шкалой. Сетка и подписи останутся, ошибки не будет.' },
    q7: { sec: 'idea', q: 'На логарифмической оси линия приложения поднялась на столько же, на сколько линия другого канала. Что это значит?', opts: [['Оба канала выросли на одно и то же число рублей'], ['Оба канала выросли в одно и то же число раз', 1], ['Каналы сравнялись по выручке'], ['Ничего: на логарифмической оси расстояния не читают']],
      why: 'На логарифмической оси равные расстояния — это равные отношения: подъём от 1 до 2 млн и от 5 до 10 млн занимает одно и то же место, оба раза значение удвоилось. Рубли на такой оси сравнивать нельзя, а уровни каналов остаются разными.' }
    },
    glossary: {
      multiples: { t: 'Малые множители', en: 'small multiples', d: 'Сетка одинаковых маленьких графиков, по одному на группу, с общими осями и оформлением.' },
      qtypes: { t: 'Четыре вопроса к графику', en: 'comparison, trend, distribution, relationship', d: 'Сравнение, динамика, распределение и связь: от типа вопроса зависит форма графика.' },
      perception: { t: 'Графическое восприятие', en: 'graphical perception', d: 'Точность, с которой человек считывает числа с графика при разных способах их показать.' },
      encoding: { t: 'Визуальная кодировка', en: 'visual encoding', d: 'Способ показать число: положением, длиной, углом, площадью или цветом.' },
      bar: { t: 'Столбчатая диаграмма', en: 'bar chart', d: 'Значение категории — длина столбца от общей нулевой оси. Главный график для сравнения.' },
      line: { t: 'Линейный график', en: 'line chart', d: 'Точки, соединённые в порядке оси X. Нужен, когда по X время или другая упорядоченная величина.' },
      hist: { t: 'Гистограмма', en: 'histogram', d: 'Столбцы с числом наблюдений в каждом интервале значений; показывает форму распределения.' },
      scatter: { t: 'Диаграмма рассеяния', en: 'scatter plot', d: 'Точки в координатах двух числовых переменных; показывает, меняются ли они вместе.' },
      heatmap: { t: 'Тепловая карта', en: 'heatmap', d: 'Таблица, где значение в клетке передано цветом. Годится для обзора, не для точных сравнений.' },
      stacked: { t: 'Столбец с накоплением', en: 'stacked bar', d: 'Столбец, разделённый на сегменты по категориям; приведённый к 100% — полоса долей.' },
      pie: { t: 'Круговая диаграмма', en: 'pie chart', d: 'Круг, разделённый на сектора по долям: доля передана углом и площадью.' },
      legend: { t: 'Легенда', en: 'legend', d: 'Таблица соответствия цветов и категорий рядом с графиком.' },
      log: { t: 'Логарифмическая ось', en: 'log scale', d: 'Ось, где равные отрезки — равные отношения: от 1 до 10 столько же, сколько от 10 до 100. Нуля на ней нет.' },
      dual: { t: 'Двойная ось Y', en: 'dual axis, secondary y-axis', d: 'Две вертикальные оси с разными шкалами на одном графике; пределы каждой выбирает автор.' },
      index100: { t: 'Индекс к базе', en: 'index, base = 100', d: 'Ряд, делённый на своё значение в базовом периоде и умноженный на 100.' },
      truncated: { t: 'Обрезанная ось', en: 'truncated axis', d: 'Ось, которая начинается не с нуля: для столбцов искажает отношения, для линий допустима.' },
      palette: { t: 'Категориальная палитра', en: 'qualitative color scale', d: 'Набор различимых цветов для категорий без порядка; хорошо работает на трёх–пяти категориях.' },
      facetgrid: { t: 'FacetGrid', en: 'seaborn.FacetGrid', d: 'Класс seaborn, который строит сетку графиков по значениям колонки.' },
      long: { t: 'Длинный формат', en: 'long format, tidy data', d: 'Таблица, где строка — одно наблюдение, а категория лежит в своей колонке.' }
    },
    materials: [
      ['da-8-2-chart-types.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/viz/', 'Учебные данные темы 08 — общий набор: продажи sales_monthly.csv, 10 каналов × 4 страны × 24 месяца, длинный формат'],
      ['chart_types.ipynb', 'Три блока кода страницы с рисунками: вопрос → график, FacetGrid, круг в столбцы'],
      ['nuances.py', 'Четыре рисунка нюансов: ось с нуля, сортировка, число категорий, две оси Y']
    ],
    prompts: [
      ['Подбери график к вопросу', 'Я буду по одному называть вопросы к таблице продаж (канал, страна, месяц, выручка). Сначала спроси, к какому из четырёх типов вопросов он относится по источнику, и только после моего ответа обсуди форму графика.'],
      ['Разбор моего графика', 'Я опишу график из своего отчёта. Задай мне вопросы по источнику: на какой вопрос он отвечает, с нуля ли ось столбцов, сколько категорий различает цвет, нет ли второй оси Y. Ответ не выдавай.'],
      ['Проверка понимания', 'Задай мне по источнику пять вопросов: круг и доли, малые множители, логарифмическая ось, две оси Y, порядок Кливленда и Макгилла. По одному; после ответа объясни ошибку со ссылкой на текст.']
    ]
  };
})();
