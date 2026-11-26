/* Страница 8.2 · Как выбрать график для задачи */
(() => {
  // Числа — pandas по data/viz/sales_monthly.csv (data/build_data.py); код и его вывод — data/build_code.py
  /*data:start*/const DATA = {"ch":["сайт","приложение","маркетплейс","поиск","рассылка","соцсети","партнёры","кешбэк-сервисы","колл-центр","офлайн-точки"],"months":["2024-01","2024-02","2024-03","2024-04","2024-05","2024-06","2024-07","2024-08","2024-09","2024-10","2024-11","2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12"],"M":[[10.268,9.762,8.804,8.581,8.136,7.679,8.081,8.578,9.323,9.793,10.117,10.102,10.448,9.848,9.527,8.971,8.772,8.069,8.466,8.851,9.681,10.248,10.586,10.735],[3.363,3.159,2.943,2.987,2.838,2.834,2.897,3.007,3.29,3.482,3.542,3.646,3.679,3.462,3.229,3.089,2.983,4.486,5.906,6.144,6.721,7.689,7.604,8.026],[7.471,6.774,6.421,6.142,5.863,5.473,5.97,6.237,6.341,7.028,7.318,6.872,7.088,6.659,6.693,6.094,6.025,5.731,5.715,6.197,6.428,6.909,7.034,7.169],[4.374,4.286,4.12,3.852,3.687,3.792,3.773,4.09,4.497,4.236,4.583,4.912,4.526,4.481,4.59,3.969,3.721,3.955,4.169,4.223,4.624,4.929,4.913,5.348],[2.393,2.358,2.365,2.2,2.096,2.01,2.054,2.11,2.37,2.593,2.682,2.558,2.75,2.713,2.57,2.366,2.245,2.292,2.301,2.429,2.544,2.74,2.968,3.109],[1.949,1.969,1.801,1.734,1.593,1.54,1.581,1.676,1.741,1.842,1.94,1.993,1.988,2.007,1.796,1.717,1.567,1.551,1.627,1.721,1.834,1.899,1.991,2.13],[1.624,1.614,1.489,1.453,1.425,1.327,1.443,1.498,1.566,1.731,1.756,1.755,1.763,1.772,1.546,1.55,1.491,1.537,1.505,1.561,1.751,1.846,1.965,1.92],[1.111,1.102,0.992,0.932,0.881,0.872,0.921,0.942,1.076,1.112,1.125,1.216,1.177,1.091,1.06,0.997,0.902,0.889,0.909,1.021,1.058,1.059,1.197,1.257],[0.864,0.819,0.752,0.719,0.697,0.66,0.646,0.645,0.691,0.736,0.742,0.755,0.728,0.653,0.618,0.594,0.541,0.55,0.509,0.518,0.563,0.552,0.573,0.579],[1.299,1.336,1.236,1.127,1.124,1.077,1.143,1.201,1.268,1.396,1.398,1.43,1.362,1.395,1.268,1.243,1.234,1.134,1.198,1.23,1.293,1.417,1.474,1.465]],"y24":[109.224,37.988,77.91,50.202,27.789,21.359,18.681,12.282,8.726,15.035],"y25":[114.202,63.018,77.742,53.448,31.027,21.828,20.207,12.617,6.978,15.713],"share25":[27.401,15.12,18.653,12.824,7.444,5.237,4.848,3.027,1.674,3.77],"chg":[4.6,65.9,-0.2,6.5,11.7,2.2,8.2,2.7,-20.0,4.5],"total":[34.716,33.179,30.923,29.727,28.34,27.264,28.509,29.984,32.163,33.949,35.203,35.239,35.509,34.081,32.897,30.59,29.481,30.194,32.305,33.895,36.497,39.288,40.305,41.738],"hist":{"w":0.5,"max":45,"nb":22,"pos":[[[20,3],[19,2],[17,3],[17,1],[16,3],[15,1],[16,2],[17,0],[18,0],[19,3],[20,1],[20,0],[20,4],[19,4],[19,0],[17,5],[17,2],[16,1],[16,4],[17,4],[19,1],[20,2],[21,0],[21,1]],[[6,6],[6,3],[5,11],[5,14],[5,9],[5,8],[5,10],[6,0],[6,5],[6,8],[7,0],[7,1],[7,2],[6,7],[6,4],[6,1],[5,13],[8,8],[11,3],[12,3],[13,2],[15,2],[15,0],[16,0]],[[14,5],[13,3],[12,7],[12,2],[11,2],[10,1],[11,4],[12,5],[12,6],[14,0],[14,4],[13,4],[14,2],[13,0],[13,1],[12,1],[12,0],[11,1],[11,0],[12,4],[12,8],[13,5],[14,1],[14,3]],[[8,6],[8,5],[8,1],[7,7],[7,3],[7,6],[7,5],[8,0],[8,9],[8,4],[9,1],[9,4],[9,0],[8,7],[9,2],[7,9],[7,4],[7,8],[8,2],[8,3],[9,3],[9,6],[9,5],[10,0]],[[4,14],[4,10],[4,11],[4,6],[4,3],[4,1],[4,2],[4,4],[4,13],[5,3],[5,4],[5,1],[5,7],[5,5],[5,2],[4,12],[4,7],[4,8],[4,9],[4,15],[5,0],[5,6],[5,12],[6,2]],[[3,33],[3,35],[3,26],[3,18],[3,10],[3,2],[3,9],[3,14],[3,19],[3,28],[3,32],[3,38],[3,36],[4,0],[3,25],[3,15],[3,8],[3,5],[3,13],[3,16],[3,27],[3,30],[3,37],[4,5]],[[3,12],[3,11],[2,42],[2,39],[2,36],[2,29],[2,38],[2,44],[3,7],[3,17],[3,22],[3,21],[3,23],[3,24],[3,3],[3,4],[2,43],[3,1],[3,0],[3,6],[3,20],[3,29],[3,34],[3,31]],[[2,8],[2,7],[1,32],[1,30],[1,25],[1,24],[1,29],[1,31],[2,4],[2,9],[2,11],[2,19],[2,15],[2,6],[2,3],[1,33],[1,27],[1,26],[1,28],[2,0],[2,1],[2,2],[2,16],[2,24]],[[1,23],[1,22],[1,20],[1,16],[1,15],[1,13],[1,11],[1,10],[1,14],[1,18],[1,19],[1,21],[1,17],[1,12],[1,9],[1,8],[1,2],[1,3],[1,0],[1,1],[1,5],[1,4],[1,6],[1,7]],[[2,28],[2,30],[2,22],[2,12],[2,10],[2,5],[2,14],[2,18],[2,25],[2,33],[2,34],[2,37],[2,31],[2,32],[2,26],[2,23],[2,21],[2,13],[2,17],[2,20],[2,27],[2,35],[2,41],[2,40]]]},"r":0.958,"under25":55.8,"ans":{"third":"приложение","losers":["колл-центр"],"top2":46.1}};/*data:end*/
  /*code:start*/const CODE = {"q2chart": {"title": "Четыре графика выручки для разных задач", "badge": "проверено: Python 3.13, pandas 3.0, Matplotlib 3.10", "lang": "python", "code": "import matplotlib.pyplot as plt\nimport numpy as np\nimport pandas as pd\n\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 8,\n                     \"axes.spines.top\": False, \"axes.spines.right\": False})\nACC, GREY = \"#0d7468\", \"#9aa3b2\"\n\ndf = pd.read_csv(\"data/viz/sales_monthly.csv\")            # длинный формат, 960 строк\nwide = df.pivot_table(index=\"month\", columns=\"channel\",\n                      values=\"revenue\", aggfunc=\"sum\") / 1e6  # 24 месяца × 10 каналов, млн ₽\ny24, y25 = wide.loc[\"2024-01\":\"2024-12\"], wide.loc[\"2025-01\":\"2025-12\"]\n\n\ndef chart_for(question, ax):\n    \"\"\"Вопрос → тип графика. Данные одни и те же, меняется форма.\"\"\"\n    if question == \"сравнение\":        # кто больше → столбцы по убыванию\n        s = y25.sum().sort_values()\n        ax.barh(s.index, s.values, color=ACC)\n        ax.set_xlabel(\"выручка за 2025 год, млн ₽\")\n    elif question == \"динамика\":       # как менялось → линия по времени\n        total = wide.sum(axis=1)\n        ax.plot(total.index, total.values, color=ACC)  # месяцы-строки идут по порядку\n        ax.set_xticks([\"2024-01\", \"2024-07\", \"2025-01\", \"2025-07\"])\n        ax.set_ylabel(\"выручка за месяц, млн ₽\")\n    elif question == \"распределение\":  # какие значения обычны → гистограмма\n        ax.hist(wide.to_numpy().ravel(), bins=np.arange(0, 11.5, 0.5),\n                color=ACC, edgecolor=\"white\", linewidth=0.5)\n        ax.set_xlabel(\"выручка канала за месяц, млн ₽\")\n        ax.set_ylabel(\"число наблюдений\")\n    elif question == \"связь\":          # меняется ли одно вместе с другим → рассеяние\n        ax.scatter(y24.to_numpy().ravel(), y25.to_numpy().ravel(), s=7, color=ACC)\n        ax.axline((0, 0), slope=1, color=GREY, linewidth=0.8)  # линия «2025 = 2024»\n        ax.set_xlabel(\"выручка за месяц в 2024 году, млн ₽\")\n        ax.set_ylabel(\"тот же месяц в 2025 году, млн ₽\")\n    else:\n        raise ValueError(f\"нет графика для вопроса «{question}»\")\n    return ax\n\n\nTITLES = {  # заголовки панелей\n    \"сравнение\": \"По годовой выручке лидирует сайт\",\n    \"динамика\": \"Максимум в декабре 2025 года\",\n    \"распределение\": \"Чаще встречаются суммы до 2,5 млн ₽\",\n    \"связь\": \"Выручка в том же месяце год спустя\",\n}\nfig, axes = plt.subplots(2, 2, figsize=(6.4, 4.6), layout=\"constrained\")\nfor (q, title), ax in zip(TITLES.items(), axes.flat):\n    chart_for(q, ax).set_title(title, loc=\"left\", fontsize=8.5)\nfig.savefig(\"question_to_chart.svg\")\n\ntotal = wide.sum(axis=1)\nvalues = wide.to_numpy().ravel()\nprint(\"сравнение:\", y25.sum().nlargest(3).round(1).to_dict())\nprint(\"максимум выручки, млн ₽:\", total.idxmax(), round(total.max(), 1),\n      \"| минимум:\", total.idxmin(), round(total.min(), 1))\nprint(\"распределение: меньше 2,5 млн —\", f\"{(values < 2.5).mean():.0%}\", \"наблюдений по каналам и месяцам\")\nprint(\"связь: r =\", np.corrcoef(y24.to_numpy().ravel(), y25.to_numpy().ravel())[0, 1].round(3))", "out": "сравнение: {'сайт': 114.2, 'маркетплейс': 77.7, 'приложение': 63.0}\nмаксимум выручки, млн ₽: 2025-12 41.7 | минимум: 2024-06 27.3\nраспределение: меньше 2,5 млн — 56% наблюдений по каналам и месяцам\nсвязь: r = 0.958", "outLabel": "Вывод программы. График приведён ниже"}, "facets": {"title": "Изменение выручки по каналам на отдельных графиках", "badge": "проверено: Python 3.13, pandas 3.0, Matplotlib 3.10, seaborn 0.13.2", "lang": "python", "code": "import matplotlib.pyplot as plt\nimport pandas as pd\nimport seaborn as sns\n\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 7.5})\n\ndf = pd.read_csv(\"data/viz/sales_monthly.csv\")\nm = df.groupby([\"month\", \"channel\"], as_index=False)[\"revenue\"].sum()\nm[\"млн ₽\"] = m[\"revenue\"] / 1e6\norder = m.groupby(\"channel\")[\"revenue\"].sum().sort_values(ascending=False).index\n\ng = sns.FacetGrid(m, col=\"channel\", col_order=order, col_wrap=5,\n                  height=1.2, aspect=1.15, sharey=False)  # у каждой клетки своя шкала Y\ng.map_dataframe(sns.lineplot, x=\"month\", y=\"млн ₽\", color=\"#0d7468\")\ng.set_titles(\"{col_name}\")\ng.set_axis_labels(\"\", \"\")\ng.set(xticks=[\"2024-01\", \"2025-01\"], xticklabels=[\"2024\", \"2025\"], ylim=(0, None))\ng.figure.suptitle(\"Годовая выручка приложения выросла, а колл-центра снизилась \"\n                  \"(у каждой панели своя шкала в млн ₽)\", x=0.02, ha=\"left\", fontsize=8.5)\ng.figure.subplots_adjust(top=0.84)\ng.savefig(\"facets.svg\")\n\ny = m.assign(year=m[\"month\"].str[:4]).pivot_table(\n    index=\"channel\", columns=\"year\", values=\"млн ₽\", aggfunc=\"sum\")\nprint((y[\"2025\"] / y[\"2024\"] - 1).mul(100).round(1).sort_values().to_string())", "out": "channel\nколл-центр       -20.0\nмаркетплейс       -0.2\nсоцсети            2.2\nкешбэк-сервисы     2.7\nофлайн-точки       4.5\nсайт               4.6\nпоиск              6.5\nпартнёры           8.2\nрассылка          11.7\nприложение        65.9", "outLabel": "Вывод программы. График приведён ниже"}, "pie2bars": {"title": "Сравнение годовых долей на круговой и столбчатой диаграммах", "badge": "проверено: Python 3.13, pandas 3.0, Matplotlib 3.10", "lang": "python", "code": "import matplotlib.pyplot as plt\nimport pandas as pd\n\nplt.rcParams.update({\"svg.fonttype\": \"none\", \"font.size\": 7.5})\n\ndf = pd.read_csv(\"data/viz/sales_monthly.csv\")\ny25 = df[df[\"month\"].str.startswith(\"2025\")]\ns = y25.groupby(\"channel\")[\"revenue\"].sum() / 1e6     # млн ₽, каналы по алфавиту\nshare = s / s.sum() * 100\n\nfig, (left, right) = plt.subplots(1, 2, figsize=(6.4, 2.7), layout=\"constrained\",\n                                  width_ratios=[1, 1.15])\nleft.pie(s, labels=s.index, startangle=-40, textprops={\"fontsize\": 6.5})  # доли в порядке groupby\nleft.set_title(\"Доли каналов на круговой диаграмме\", loc=\"left\", fontsize=8.5)\n\ntop = share.sort_values()                              # по возрастанию: крупный канал окажется наверху\nbars = right.barh(top.index, top.values, color=\"#0d7468\")\nright.bar_label(bars, labels=[f\"{v:.1f}%\".replace(\".\", \",\") for v in top], padding=3)\nright.set_xticks([])                                   # подписи на столбцах заменяют ось\nright.spines[[\"top\", \"right\", \"bottom\"]].set_visible(False)\nright.set_title(\"Доли каналов по убыванию\", loc=\"left\", fontsize=8.5)\nfig.savefig(\"pie_to_bars.svg\")\n\nprint(share.sort_values(ascending=False).round(1).to_string())", "out": "channel\nсайт              27.4\nмаркетплейс       18.7\nприложение        15.1\nпоиск             12.8\nрассылка           7.4\nсоцсети            5.2\nпартнёры           4.8\nофлайн-точки       3.8\nкешбэк-сервисы     3.0\nколл-центр         1.7", "outLabel": "Вывод программы. График приведён ниже"}};/*code:end*/

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
    ['Сайт даёт больше четверти выручки?', 'У приложения выручка выше, чем у поиска?'],
    ['Какой канал лидирует по выручке?', 'На сколько выручка приложения выше, чем у поиска?'],
    ['У приложения выручка выше, чем у поиска?', 'Как выручка менялась по месяцам?'],
    ['Какой канал третий по выручке?', 'Два первых канала дают больше половины?'],
    ['В каком месяце выручка была самой высокой?', 'За счёт каких каналов выросла выручка?'],
    ['Какой канал крупнейший каждый месяц?', 'Как менялась выручка колл-центра?'],
    ['У какого канала резко выросла выручка и когда?', 'Снизилась ли выручка колл-центра?'],
    ['Где годовая выручка выросла, а где снизилась?', 'У какого канала выше выручка?'],
    ['Какие месячные суммы обычны?', 'Какой это канал и месяц?'],
    ['Как соотносится выручка за те же месяцы двух лет?', 'В каком месяце был пик?']
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
        calls.push([x1, y1, `приложение ${f1(D.share25[APP])}%`, 'u'], [x2, y2, `поиск ${f1(D.share25[SRCH])}%`, 'd']);
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
        calls.push([a[2], (a[1] + a[3]) / 2, `${f1(D.y25[APP])} млн ₽`, 'r'], [b[2], (b[1] + b[3]) / 2, `${f1(D.y25[SRCH])} млн ₽`, 'r']);
      }
      if (showC && k === 3) {
        const a = barBox(g, 2, D.y25[APP]), b = barBox(g, 1, D.y25[MP]);
        calls.push([a[2], (a[1] + a[3]) / 2, 'третье место — приложение', 'r']);
        if (!g.nar) calls.push([b[2], b[1], 'Для общей доли сложите доли двух каналов', 'r']);
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
        calls.push([tx(g, peakI), ty(g, D.total[peakI], 45), `пик: ${monthRu(peakI)}, ${f1(D.total[peakI])} млн`, 'l'], [tx(g, dipI), ty(g, D.total[dipI], 45), `минимум: ${monthRu(dipI)}, ${f1(D.total[dipI])} млн`, 'd']);
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
      if (showC) calls.push([tx(g, 19), ty(g, D.M[APP][19], 11), 'с июня выручка приложения выше, чем у поиска', 'l'], [tx(g, 7), ty(g, 1.4, 11), 'линии небольших каналов близки друг к другу', 'u']);
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
        if (k === 6) calls.push([pa[0], pa[1], 'рост в июне 2025 года', 'u'], [pb[0], pb[1], 'выручка колл-центра меньше 1 млн ₽ в месяц', 'u']);
        else calls.push([pa[0], pa[1], `+${Math.round(D.chg[APP])}% к 2024 году`, 'u'], [pb[0], pb[1], `${String(Math.round(D.chg[CC])).replace('-', '−')}% к 2024 году`, 'u']);
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
      if (p >= 0.8) calls.push([hx(g, 1.25), hy(g, 45), `${Math.round(D.under25)}% месячных значений ниже 2,5 млн`, 'r'], [hx(g, 9.2), hy(g, 4), `сайт: ${f1(siteMin)}–${f1(siteMax)} млн в месяц`, 'u']);
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
      if (p >= 0.75) calls.push([q.x(D.M[APP][11]), q.y(D.M[APP][23]), 'приложение с июня 2025 — выше диагонали', 'u'], [q.x(8.5), q.y(8.5), `r = ${String(D.r.toFixed(2)).replace('.', ',')} по 120 парам`, 'd']);
    }
    return { s, calls };
  }

  const scene = {
    parts: [{ n: '01', name: 'Круг', s: [0, 1] }, { n: '02', name: 'Столбцы', s: [2, 3] }, { n: '03', name: 'Линия', s: [4, 5] }, { n: '04', name: 'Панели', s: [6, 7] }, { n: '05', name: 'Другие вопросы', s: [8, 9] }],
    steps: [
      { title: 'Доли выручки за год', dur: 2800, body: `<p>За 2025 год десять каналов принесли магазину ${f1(SUM25)} млн ₽. Каждый сектор круговой диаграммы показывает долю одного канала в этой сумме. Сектора идут в порядке строк исходного файла.</p><p>Доля сайта немного больше четверти. Это видно по сектору, угол которого чуть больше прямого.</p>` },
      { title: 'Две близкие доли', dur: 2800, body: `<p>На приложение приходится ${f1(D.share25[APP])}% годовой выручки, на поиск — ${f1(D.share25[SRCH])}%. Размеры этих секторов близки.</p><p>Чтобы узнать разницу в процентных пунктах, прочитайте подписи и вычтите меньшую долю из большей.</p>` },
      { title: 'Сравнение выручки по каналам', dur: 3000, body: `<p>На столбчатой диаграмме все суммы отсчитываются от общего нуля. Выручка приложения составила ${f1(D.y25[APP])} млн ₽, а поиска — ${f1(D.y25[SRCH])} млн ₽.</p><p>Теперь разницу видно по длине столбцов. Каждый из них показывает итог за год.</p>` },
      { title: 'Каналы по убыванию выручки', dur: 3000, body: `<p>Сверху вниз идут сайт, маркетплейс и приложение. Чтобы найти третий канал, достаточно прочитать подпись к третьему столбцу.</p><p>Если нужна общая доля сайта и маркетплейса, сложите их доли в годовой выручке.</p>` },
      { title: 'Как менялась выручка магазина', dur: 3200, body: `<p>Каждая точка показывает общую выручку за один месяц. Среди 24 месяцев максимум пришёлся на декабрь 2025 года, минимум — на июнь 2024-го.</p><p>Чтобы узнать, какой канал внёс вклад в рост, понадобится разбивка по каналам.</p>` },
      { title: 'Динамика десяти каналов', dur: 3200, body: `<p>На протяжении всего периода наибольшую месячную выручку приносил сайт. С июня 2025 года выручка приложения превышала выручку поиска. В июле приложение впервые опередило и маркетплейс.</p><p>Ниже 2,2 млн ₽ линии идут близко друг к другу. По общей шкале трудно рассмотреть, как менялись продажи колл-центра.</p>` },
      { title: 'По одному графику на канал', dur: 3200, body: `<p>У всех панелей одинаковые оси. В июне 2025 года выручка приложения резко выросла.</p><p>У колл-центра выручка во все месяцы была ниже 1 млн ₽. На шкале до 11 млн ₽ её колебания едва заметны.</p>` },
      { title: 'Отдельный масштаб для каждого канала', dur: 3000, body: `<p>Все шкалы начинаются с нуля, но верхний предел у каждой панели свой. Среди небольших каналов теперь заметно снижение у колл-центра.</p><p>По сравнению с 2024 годом выручка колл-центра за 2025 год снизилась на ${Math.abs(Math.round(D.chg[CC]))}%, а выручка приложения выросла на ${Math.round(D.chg[APP])}%. Для сравнения каналов в рублях учитывайте пределы их шкал.</p>` },
      { title: 'Какая месячная выручка встречается чаще', dur: 3400, body: `<p>Для каждого из десяти каналов у нас 24 месячные суммы. Разобьём эти 240 значений на интервалы шириной 0,5 млн ₽. В каждом столбце одна точка соответствует одному наблюдению.</p><p>Около ${Math.round(D.under25)}% значений меньше 2,5 млн ₽. Правее расположены редкие крупные суммы.</p>` },
      { title: 'Выручка в тот же месяц год спустя', dur: 3600, next: 'Читать страницу', body: `<p>Для каждого канала сопоставим выручку за один календарный месяц в 2024 и 2025 годах. Получится 120 пар. На диагонали выручка за оба года равна. Выше диагонали лежат месяцы, когда она выросла.</p><p>Корреляция по всем парам равна ${String(D.r.toFixed(2)).replace('.', ',')}. В неё вносят вклад различия между крупными и небольшими каналами. Точки приложения с июня 2025 года заметно выше диагонали.</p>` }
    ],
    hud: [{ id: 'n', label: 'Значений' }, { id: 'col', label: 'Цветов' }, { id: 'enc', label: 'Кодирование' }],
    legend: '<span><i style="background:#36b8a6"></i>хорошо отвечает</span><span><i style="background:#f2756a"></i>плохо отвечает</span><span><i style="background:#f0a247"></i>акцент</span>',
    info: 'ТИП ГРАФИКА',
    aiNote: `В анимации показана выручка десяти каналов за 2024 и 2025 годы. Годовые доли, суммы по месяцам и 120 пар значений двух лет отвечают на разные вопросы. На каждой панели указано, что по графику выяснить легко и для чего понадобятся другие данные или другие шкалы.`,
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
  const TYPES = [['pie', 'Круг'], ['abc', 'Столбцы А–Я'], ['sorted', 'Столбцы по убыванию'], ['full', 'Полоса 100%'], ['lines', '10 линий'], ['mult', 'Сетка графиков'], ['log', 'Логарифмическая шкала'], ['heat', 'Тепловая карта']];
  const TN = Object.fromEntries(TYPES);
  const QQ = {
    A: { tab: 'Сравнение', short: 'кто третий', q: 'Какой канал третий по выручке за 2025 год?', opts: [['маркетплейс', 'маркетплейс'], ['приложение', 'приложение'], ['поиск', 'поиск'], ['рассылка', 'рассылка'], ['none', 'по графику не ответить']], truth: D.ans.third, hl: ['приложение', 'поиск'] },
    B: { tab: 'Динамика', short: 'снижение выручки', q: 'У какого из этих каналов суммарная выручка за 2025 год ниже, чем за 2024-й?', opts: [['партнёры', 'партнёры'], ['офлайн-точки', 'офлайн-точки'], ['кешбэк-сервисы', 'кешбэк-сервисы'], ['колл-центр', 'колл-центр'], ['none', 'по графику не ответить']], truth: D.ans.losers[0], hl: ['колл-центр'] },
    C: { tab: 'Доля', short: 'больше половины', q: 'Сайт и маркетплейс вместе дали больше половины выручки 2025 года?', opts: [['yes', 'да, больше половины'], ['no', 'нет, меньше половины'], ['none', 'по графику не ответить']], truth: D.ans.top2 > 50 ? 'yes' : 'no', hl: ['сайт', 'маркетплейс'] }
  };
  const NOTIME = { pie: 1, abc: 1, sorted: 1, full: 1 };
  const correctOf = (q, t) => (q === 'B' && NOTIME[t] ? 'none' : QQ[q].truth);
  const half = SUM25 / 2, two = D.y25[SITE] + D.y25[MP];
  const noTime = 'Здесь показаны годовые итоги только за 2025 год. Для сравнения с 2024 годом нужны данные за оба года.';
  const NOTE = {
    A: {
      pie: `Доли близки: приложение принесло ${f1(D.share25[APP])}% выручки, поиск — ${f1(D.share25[SRCH])}%. Сектора круга трудно сопоставить с такой точностью.`,
      abc: `Горизонтальные столбцы начинаются от нуля. Чтобы найти третий по длине, придётся просмотреть весь список в алфавитном порядке.`,
      sorted: `Упорядоченные столбцы сразу показывают первую тройку. После сайта и маркетплейса идёт приложение.`,
      full: `Сегменты расположены по убыванию доли. Третий слева соответствует приложению. Если порядок неизвестен, сравнивать сегменты с разным началом сложнее.`,
      lines: `Линии показывают месячную выручку. Чтобы точно определить третье место за 2025 год, нужны суммы по двенадцати месяцам для каждого канала.`,
      mult: `У каждой панели своя шкала. Для ранжирования каналов по выручке за 2025 год удобнее сравнить годовые итоги.`,
      log: `По линиям видно, что с июня 2025 года выручка приложения выше, чем у поиска. Для годового рейтинга нужно сложить месячные значения.`,
      heat: `Цвет ячейки показывает месячную выручку. По интенсивности цвета трудно оценить итог за весь год.`
    },
    B: {
      pie: noTime, abc: noTime, sorted: noTime, full: noTime,
      lines: `На общей шкале до 11 млн ₽ линии небольших каналов проходят близко друг к другу. У колл-центра месячная выручка изменилась с ${f1(D.M[CC][0])} млн ₽ в начале периода до ${f1(D.M[CC][NM - 1])} млн ₽ в конце.`,
      mult: `Отдельные шкалы позволяют рассмотреть динамику небольших каналов. По таблице годовая выручка колл-центра снизилась на ${Math.abs(Math.round(D.chg[CC]))}%. У остальных трёх каналов из списка она выросла.`,
      log: `На логарифмической шкале относительное снижение выручки колл-центра заметнее. Найти его линию можно по легенде.`,
      heat: `У небольших каналов ячейки слабо окрашены. На общей шкале цвета изменение выручки колл-центра трудно рассмотреть.`
    },
    C: {
      pie: `Сектора сайта и маркетплейса расположены рядом, начиная с верхней точки круга. Вместе они занимают чуть меньше полукруга. Их общая доля — ${f1(D.ans.top2)}%.`,
      abc: `Сложите выручку сайта и маркетплейса, ${f1(D.y25[SITE])} и ${f1(D.y25[MP])} млн ₽, и сравните результат с половиной выручки магазина — ${f1(half)} млн ₽.`,
      sorted: `Сумма двух верхних столбцов составляет ${f1(two)} млн ₽. Половина всей годовой выручки — ${f1(half)} млн ₽.`,
      full: `Правая граница второго сегмента находится левее отметки 50%. Вместе сайт и маркетплейс дали ${f1(D.ans.top2)}% выручки.`,
      lines: `Линии показывают месячные суммы в рублях. Для общей годовой доли понадобятся два итога за 2025 год — выручка двух каналов и выручка всего магазина.`,
      mult: `По колебаниям линий на отдельных панелях трудно оценить долю в общей годовой выручке. Проще сначала рассчитать её по таблице.`,
      log: `Логарифмическая шкала удобна для относительных изменений. Годовую долю можно вычислить по исходным суммам.`,
      heat: `Каждая ячейка показывает выручку одного канала за месяц. Для годовой доли двух каналов пришлось бы сложить множество значений, которые здесь переданы цветом.`
    }
  };

  function buildSwitch(box, api) {
    const { $, esc, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Найдите ответ за пять секунд <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="ct-reset">Сбросить</button></div></div>
<p class="hint ct-do">Выберите вопрос и тип графика, нажмите «Старт» и выберите ответ. Сравните время ответа для разных графиков.</p>
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
        leg = '<span class="ct-grad">Чем насыщеннее цвет, тем выше месячная выручка. От 0 до 11 млн ₽</span>';
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
      $('ct-msg').textContent = 'Выберите ответ по графику.';
      ui(); paint();
    }
    function finish(v) {
      cancelAnimationFrame(raf); st = 'done'; chosen = v;
      const ok = correctOf(q, t), sec = n1(el);
      const o = v === null ? 'late' : v === ok ? 'ok' : v === 'none' ? 'pass' : 'bad';
      RES[t + q] = { o, s: sec };
      const head = o === 'ok' ? `Верно за ${f1(sec)} с${sec <= 5 ? ' — уложились в пять секунд' : ' — дольше пяти секунд'}.` : o === 'pass' ? `Вы пропустили вопрос. Ответ по данным — «${label(q, ok)}».` : o === 'late' ? 'Минута прошла без ответа.' : `Неверно: правильный ответ — «${label(q, ok)}».`;
      $('ct-msg').innerHTML = `<b>${esc(head)}</b> ${esc(NOTE[q][t])}`;
      last = `${TN[t]}, ${QQ[q].tab.toLowerCase()}: ${f1(sec)} с ${o === 'ok' ? '✓' : o === 'pass' ? '—' : '✗'}`;
      ui(); paint(); grid();
    }
    function reset(to) {
      cancelAnimationFrame(raf); st = 'idle'; chosen = null; el = 0;
      $('ct-sec').textContent = '0,0 с'; $('ct-bar').style.width = '0%'; $('ct-bar').classList.remove('over');
      $('ct-msg').textContent = to || 'После нажатия «Старт» откроется график и запустится таймер.';
      ui(); paint();
    }
    function ui() {
      box.querySelectorAll('#ct-qt [data-qq]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.qq === q)));
      box.querySelectorAll('#ct-ty [data-t]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
      $('ct-qtext').textContent = QQ[q].q;
      $('ct-cover').hidden = st !== 'idle';
      $('ct-ctext').innerHTML = `Вопрос: <b>${esc(QQ[q].q)}</b><br>График: <b>${esc(TN[t])}</b>. Нажмите «Старт» — график откроется, и пойдёт время.`;
      const ok = correctOf(q, t);
      $('ct-ans').innerHTML = QQ[q].opts.map(([v, n]) => `<button type="button" class="ct-a${st === 'done' && v === ok ? ' right' : ''}${st === 'done' && v === chosen && v !== ok ? ' wrong' : ''}" data-a="${v}"${st !== 'run' ? ' disabled' : ''}>${esc(n)}</button>`).join('') + (st === 'done' ? '<button type="button" class="btn ghost small ct-again" id="ct-again">Повторить попытку</button>' : '');
      $('ct-dot').classList.toggle('live', st === 'run');
      const all = Object.values(RES), okN = all.filter(r => r.o === 'ok').length, fast = all.filter(r => r.o === 'ok' && r.s <= 5).length;
      $('ct-n').textContent = `Пар проверено: ${all.length} из 24`;
      $('ct-ok').textContent = `Верно: ${okN}`;
      $('ct-fast').textContent = `Верно за 5 с: ${fast}`;
      $('ct-last').textContent = last ? 'Последняя: ' + last : 'Попыток ещё не было';
    }
    function grid() {
      const qs = Object.keys(QQ);
      $('ct-res').innerHTML = `<table><thead><tr><th>График</th>${qs.map(k => `<th>${QQ[k].tab}</th>`).join('')}</tr></thead><tbody>${TYPES.map(([k, n]) => `<tr><td>${n}</td>${qs.map(x => { const r = RES[k + x]; return r ? `<td class="ct-r-${r.o}${r.o === 'ok' && r.s > 5 ? ' slow' : ''}">${f1(r.s)} с ${r.o === 'ok' ? '✓' : r.o === 'pass' ? '—' : '✗'}</td>` : '<td class="ct-r-no">·</td>'; }).join('')}</tr>`).join('')}</tbody></table><p class="hint">Зелёный — верно за 5 с, жёлтый — верно, но дольше, «—» — пропуск, «✗» — ошибка.</p>`;
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
        const done = Object.entries(RES).map(([k, r]) => `${TN[k.slice(0, -1)]} / ${QQ[k.slice(-1)].tab.toLowerCase()}: ${f1(r.s)} с, ${{ ok: 'верно', pass: 'пропуск', bad: 'ошибка', late: 'без ответа' }[r.o]}`);
        return `вопрос: «${QQ[q].q}»; график: ${TN[t]}; ${st === 'idle' ? 'ждёт старта' : st === 'run' ? 'идёт время' : `ответ «${chosen ? label(q, chosen) : 'нет'}», верный «${label(q, correctOf(q, t))}»`}; проверено пар: ${done.length} из 24${done.length ? ' — ' + done.join('; ') : ''}.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-8-2',
    short: 'DA-08',
    title: 'Как выбрать график для задачи',
    where: 'блок «Дата аналитика», тема 08 «Визуализация в Python», страница 8.2',
    aiData: 'учебные продажи интернет-магазина sales_monthly.csv: 10 каналов, 4 страны, 24 месяца (2024–2025), выручка в рублях',
    scene,
    widgets: { switch: buildSwitch },
    code: CODE,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'Какая из диаграмм позволяет сразу увидеть, превысила ли суммарная доля сайта и маркетплейса 50% выручки за 2025 год?', opts: [['Столбцы годовой выручки в рублях'], ['Круг с соседними секторами двух каналов или полоса долей с отметкой 50%', 1], ['Десять линий месячной выручки'], ['Тепловая карта выручки']],
      why: "В интерактиве два крупнейших канала занимают соседние сектора, которые вместе составляют чуть меньше полукруга. На полосе их общая граница находится перед отметкой 50%. По таблице доля равна 46,1%." },
    q2: { sec: 'idea', q: 'Почему изменения выручки колл-центра лучше видны на отдельном графике со своей шкалой?', opts: [['На отдельном графике показан другой период'], ['Диапазон шкалы ближе к значениям самого колл-центра', 1], ['Данные сглажены при построении сетки'], ['На отдельной панели приведена выручка всех каналов']],
      why: "Месячная выручка колл-центра находится примерно между 0,5 и 0,9 млн ₽. На общей шкале до 11 млн ₽ разница мала. Собственная шкала позволяет рассмотреть колебания, но для сравнения сумм в рублях между панелями нужно сверяться с делениями." },
    q3: { sec: 'idea', q: 'Как показать, как менялась доля каждого канала в выручке магазина по месяцам?', opts: [['Один круг за весь период'], ['Столбцы с накоплением до 100% по месяцам или линии месячных долей', 1], ['Линии месячной выручки в рублях'], ['Диаграмма рассеяния возрастов покупателей']],
      why: "Сначала разделите выручку каждого канала за месяц на выручку всего магазина за тот же месяц. Столбцы до 100% покажут состав выручки, а по линиям удобно проследить долю отдельных каналов." },
    q4: { sec: 'idea', q: 'В каком случае соединять соседние точки линией было бы ошибкой?', opts: [['По горизонтальной оси отложены месяцы'], ['По горизонтальной оси каналы продаж в произвольном порядке', 1], ['Показатель принимает отрицательные значения'], ['На графике больше двенадцати наблюдений']],
      why: "Для линейного графика нужен осмысленный порядок значений. У месяцев он есть. Каналы продаж можно произвольно переставить, и наклоны отрезков между ними изменятся. Их выручку удобнее сравнивать по столбцам." },
    q5: { sec: 'nuances', q: 'Что изменится, если расширить пределы правой оси с сохранением данных и направления шкалы?', opts: [['Корреляция рядов станет ближе к нулю'], ['Колебания ряда на правой шкале будут выглядеть меньше', 1], ['Пик ряда переместится на другой месяц'], ['Оба ряда будут измеряться в одних единицах']],
      why: "Расширение оси уменьшает видимый размах оранжевой линии. Месяцы пиков, значения рядов и их корреляция остаются прежними. В учебном примере корреляция уровней равна 0,52 при обеих настройках осей." },
    q6: { sec: 'code', q: 'Что изменится, если убрать из вызова FacetGrid аргумент sharey=False?', code: 'g = sns.FacetGrid(m, col="channel", col_order=order, col_wrap=5,\n                  height=1.2, aspect=1.15, sharey=False)', lang: 'python', opts: [['Все каналы окажутся на одной панели'], ['У панелей будет общий диапазон по оси Y', 1], ['Названия каналов исчезнут'], ['seaborn потребует явно указать sharey']],
      why: "По умолчанию FacetGrid использует sharey=True. При общей шкале можно сравнивать месячную выручку по высоте линий на разных панелях. Колебания небольших каналов при этом будут менее заметны." },
    q7: { sec: 'idea', q: 'На одной логарифмической шкале две линии поднялись на одинаковое расстояние. Что можно сказать о выручке?', opts: [['Она выросла на одинаковую сумму в рублях'], ['Она выросла в одинаковое число раз', 1], ['Конечные значения равны'], ['Нужно сложить значения двух рядов']],
      why: "Одинаковым расстояниям соответствует одинаковое отношение конечного значения к начальному. Подъём с 1 до 2 млн ₽ и подъём с 5 до 10 млн ₽ выглядят одинаково. В обоих случаях рост составил 100%." }
    },
    glossary: {
      multiples: { t: 'Сетка однотипных графиков', en: 'small multiples', d: 'Графики одинакового вида для разных групп наблюдений. Например, на каждой панели показана выручка одного канала за одни и те же месяцы. Шкалы могут быть общими или отдельными.' },
      qtypes: { t: 'Задачи визуализации', en: 'comparison, trend, distribution, relationship', d: 'В этом уроке рассматриваются сравнение величин, динамика, распределение и связь между показателями.' },
      perception: { t: 'Графическое восприятие', en: 'graphical perception', d: 'То, как человек воспринимает и сопоставляет величины на графике.' },
      encoding: { t: 'Визуальное кодирование', en: 'visual encoding', d: 'Представление данных с помощью положения, длины, угла, площади, цвета и других зрительных признаков.' },
      bar: { t: 'Столбчатая диаграмма', en: 'bar chart', d: 'График для сравнения категорий. Длина каждого столбца от нулевой отметки пропорциональна значению.' },
      line: { t: 'Линейный график', en: 'line chart', d: 'Линия соединяет точки по порядку значений горизонтальной оси. Подходит, например, для показа динамики по месяцам.' },
      hist: { t: 'Гистограмма', en: 'histogram', d: 'График распределения числовых значений по интервалам. В примере интервалы равны по ширине, высота столбца показывает число наблюдений.' },
      scatter: { t: 'Диаграмма рассеяния', en: 'scatter plot', d: 'Для каждого наблюдения на график наносят точку, координаты которой задают два числовых показателя.' },
      heatmap: { t: 'Тепловая карта', en: 'heatmap', d: 'Таблица или сетка, в которой цвет каждой ячейки соответствует значению показателя.' },
      stacked: { t: 'Столбец с накоплением', en: 'stacked bar', d: 'Столбец из нескольких сегментов, каждый из которых соответствует части общей величины. В нормированном варианте суммарная длина соответствует 100%.' },
      pie: { t: 'Круговая диаграмма', en: 'pie chart', d: 'Круг, разделённый на секторы. Угол и площадь каждого сектора пропорциональны его доле в общей сумме.' },
      legend: { t: 'Легенда', en: 'legend', d: 'Пояснение к цветам, линиям и другим обозначениям на графике.' },
      log: { t: 'Логарифмическая ось', en: 'logarithmic scale', d: 'Шкала для положительных значений, на которой одинаковое расстояние соответствует одинаковому отношению величин.' },
      dual: { t: 'Две вертикальные оси', en: 'dual y-axis', d: 'Две оси Y на одном графике. Каждая задаёт масштаб своего ряда данных.' },
      index100: { t: 'Индекс к базовому периоду', en: 'index, base = 100', d: 'Значение показателя в текущем периоде, делённое на ненулевое значение в базовом периоде и умноженное на 100.' },
      truncated: { t: 'Шкала с обрезанным началом', en: 'truncated axis', d: 'Шкала, на которой начальная часть диапазона опущена. Если столбцы начинаются выше нуля, отношение их видимых длин может искажать отношение значений.' },
      palette: { t: 'Категориальная палитра', en: 'qualitative color scale', d: 'Набор различимых цветов для категорий без естественного порядка.' },
      facetgrid: { t: 'FacetGrid', en: 'seaborn.FacetGrid', d: 'Класс seaborn, который создаёт сетку графиков по группам наблюдений.' },
      long: { t: 'Длинный формат', en: 'long format', d: 'Способ организации таблицы, при котором каждая строка содержит отдельное наблюдение. В примере это выручка за месяц для одной страны и одного канала.' }
    },
    materials: [
      ['da-8-2-chart-types.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/viz/', 'Таблица sales_monthly.csv с месячной выручкой десяти каналов в четырёх странах'],
      ['chart_types.ipynb', 'Ноутбук с тремя примерами и рисунками выручки по каналам'],
      ['nuances.py', 'Скрипт для четырёх рисунков о шкалах, порядке и числе категорий']
    ],
    prompts: [
      ['Подбери график к вопросу', 'Я буду по одному называть вопросы к таблице продаж (канал, страна, месяц, выручка). Помоги мне определить задачу и выбрать график. Попроси обосновать выбор, а затем разбери мой ответ.'],
      ['Разбор моего графика', 'Я опишу график из своего отчёта. Помоги проверить, легко ли по нему ответить на мой вопрос. По очереди спроси про шкалы, порядок категорий и подписи.'],
      ['Проверка понимания', 'Задай по одному вопросу о долях, сетке графиков, логарифмической шкале, двух осях Y и графическом восприятии. После каждого ответа объясни его и сошлись на урок.']
    ]
  };
})();
