/* Страница 8.3 · Интерактив в Plotly */
(() => {
  // Данные посчитаны pandas в data/gen.py по data/viz/sales_monthly.csv: выручка пяти каналов по месяцам, млн ₽, и доля в выручке месяца
  /*data:start*/const DATA = {"months": ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"], "ch": ["сайт", "маркетплейс", "приложение", "поиск", "рассылка"], "y": [[10.27, 9.76, 8.8, 8.58, 8.14, 7.68, 8.08, 8.58, 9.32, 9.79, 10.12, 10.1, 10.45, 9.85, 9.53, 8.97, 8.77, 8.07, 8.47, 8.85, 9.68, 10.25, 10.59, 10.73], [7.47, 6.77, 6.42, 6.14, 5.86, 5.47, 5.97, 6.24, 6.34, 7.03, 7.32, 6.87, 7.09, 6.66, 6.69, 6.09, 6.03, 5.73, 5.71, 6.2, 6.43, 6.91, 7.03, 7.17], [3.36, 3.16, 2.94, 2.99, 2.84, 2.83, 2.9, 3.01, 3.29, 3.48, 3.54, 3.65, 3.68, 3.46, 3.23, 3.09, 2.98, 4.49, 5.91, 6.14, 6.72, 7.69, 7.6, 8.03], [4.37, 4.29, 4.12, 3.85, 3.69, 3.79, 3.77, 4.09, 4.5, 4.24, 4.58, 4.91, 4.53, 4.48, 4.59, 3.97, 3.72, 3.96, 4.17, 4.22, 4.62, 4.93, 4.91, 5.35], [2.39, 2.36, 2.37, 2.2, 2.1, 2.01, 2.05, 2.11, 2.37, 2.59, 2.68, 2.56, 2.75, 2.71, 2.57, 2.37, 2.25, 2.29, 2.3, 2.43, 2.54, 2.74, 2.97, 3.11]], "share": [[0.296, 0.294, 0.285, 0.289, 0.287, 0.282, 0.283, 0.286, 0.29, 0.288, 0.287, 0.287, 0.294, 0.289, 0.29, 0.293, 0.298, 0.267, 0.262, 0.261, 0.265, 0.261, 0.263, 0.257], [0.215, 0.204, 0.208, 0.207, 0.207, 0.201, 0.209, 0.208, 0.197, 0.207, 0.208, 0.195, 0.2, 0.195, 0.203, 0.199, 0.204, 0.19, 0.177, 0.183, 0.176, 0.176, 0.175, 0.172], [0.097, 0.095, 0.095, 0.1, 0.1, 0.104, 0.102, 0.1, 0.102, 0.103, 0.101, 0.103, 0.104, 0.102, 0.098, 0.101, 0.101, 0.149, 0.183, 0.181, 0.184, 0.196, 0.189, 0.192], [0.126, 0.129, 0.133, 0.13, 0.13, 0.139, 0.132, 0.136, 0.14, 0.125, 0.13, 0.139, 0.127, 0.131, 0.14, 0.13, 0.126, 0.131, 0.129, 0.125, 0.127, 0.125, 0.122, 0.128], [0.069, 0.071, 0.076, 0.074, 0.074, 0.074, 0.072, 0.07, 0.074, 0.076, 0.076, 0.073, 0.077, 0.08, 0.078, 0.077, 0.076, 0.076, 0.071, 0.072, 0.07, 0.07, 0.074, 0.074]], "top5_2025": 0.814, "rows": 960};/*data:end*/
  // Размеры файлов экспорта и проверки в браузере — из data/build_code.py
  /*sizes:start*/const SIZES = {"full_mb": 4.6, "cdn_kb": 20.9, "json_kb": 19.9, "png_kb": 75, "svg_kb": 15.3, "hover": ["приложение · июль 2025", "5,91 млн ₽ · 18% выручки месяца"], "anim": ["10,8", "11,1"]};/*sizes:end*/
  // Код и настоящий вывод вписывает data/build_code.py после запуска каждого блока
  /*code:start*/const CODE = {"weight": {"title": "Миллион точек — 26 МБ данных даже без библиотеки", "badge": "проверено: Python 3.13, NumPy 2.5.3, plotly 7.1.0", "lang": "python", "code": "import os\n\nimport numpy as np\nimport plotly.express as px\n\nrng = np.random.default_rng(83)  # учебные случайные точки: важен только их счёт\nfor n in [1_000, 10_000, 100_000, 1_000_000]:\n    fig = px.scatter(x=rng.normal(size=n), y=rng.normal(size=n))\n    fig.write_html(\"points.html\", include_plotlyjs=\"cdn\")  # без библиотеки: в файле только данные\n    kb = os.path.getsize(\"points.html\") / 1024\n    print(f\"{n:>9,} точек  {fig.data[0].type:<10} {kb:>8,.0f} КБ  {kb * 1024 / n:4.1f} байта на точку\")", "out": "    1,000 точек  scatter          35 КБ  35.6 байта на точку\n   10,000 точек  scattergl       274 КБ  28.0 байта на точку\n  100,000 точек  scattergl     2,669 КБ  27.3 байта на точку\n1,000,000 точек  scattergl    26,577 КБ  27.2 байта на точку", "note": "С <code>include_plotlyjs=True</code> к каждой строке прибавьте ещё 4,6 МБ библиотеки. Числа хранятся в JSON как двоичные массивы в base64, поэтому байтов на точку почти не зависит от того, какие это числа."}, "title": {"title": "Из 120 чисел подсказок на картинку не попало ни одного", "badge": "проверено: Python 3.13, pandas 3.0.5, plotly 7.1.0, kaleido 1.5.0", "lang": "python", "code": "import re\n\nimport pandas as pd\nimport plotly.express as px\n\nsales = pd.read_csv(\"data/viz/sales_monthly.csv\")\ntop5 = [\"сайт\", \"маркетплейс\", \"приложение\", \"поиск\", \"рассылка\"]\nby_ch = (sales[sales[\"channel\"].isin(top5)]\n         .groupby([\"month\", \"channel\"], as_index=False)[\"revenue\"].sum()\n         .assign(mln=lambda d: d[\"revenue\"] / 1e6))\nru = lambda v, d=1: f\"{v:.{d}f}\".replace(\".\", \",\")\nwords = lambda path: re.findall(r\">([^<>]+)</text>\", open(path, encoding=\"utf-8\").read())\n\nfig = px.line(by_ch, x=\"month\", y=\"mln\", color=\"channel\", title=\"Выручка по каналам, млн ₽\")\nfig.update_layout(separators=\", \")\nfig.write_image(\"plain.svg\")  # то, что уйдёт в письмо или на слайд\nhover = [ru(v, 2) for v in by_ch[\"mln\"]]  # числа, которые видны только при наведении\nprint(\"чисел в подсказках:\", len(hover), \"| из них на картинке:\", sum(h in words(\"plain.svg\") for h in hover))\n\napp = by_ch[by_ch[\"channel\"] == \"приложение\"].set_index(\"month\")[\"mln\"]\nfig.update_layout(title=f\"Приложение: {ru(app['2025-05'])} → {ru(app['2025-07'])} млн ₽ в месяц \"\n                        \"после релиза в июне 2025\")\nfig.add_annotation(x=\"2025-06\", y=app[\"2025-06\"], text=\"релиз\", ay=-40)\nfig.write_image(\"titled.svg\")\nprint(\"надписи с числами:\", [w for w in words(\"titled.svg\") if \"→\" in w or w == \"релиз\"])", "out": "чисел в подсказках: 120 | из них на картинке: 0\nнадписи с числами: ['Приложение: 3,0 → 5,9 млн ₽ в месяц после релиза в июне 2025', 'релиз']", "note": "Надписи ищутся в SVG из kaleido: всё, что plotly.js нарисовал текстом, лежит там в тегах &lt;text&gt;."}, "a11y": {"title": "Легенда под графиком, свайп без рамки и текст вместо наведения", "badge": "проверено: Python 3.13, pandas 3.0.5, plotly 7.1.0", "lang": "python", "code": "fig.update_layout(legend=dict(orientation=\"h\", y=-0.15),  # легенда под графиком: на узком экране сбоку ей тесно\n                  dragmode=False)                           # свайп прокручивает страницу, а не рисует рамку\nfig.write_html(\"mobile.html\", include_plotlyjs=\"cdn\", config={\"displayModeBar\": False})\n\n# текстовая альтернатива из тех же данных: для экранного диктора и для тех, кто не наводит\nalt = (f\"Линейный график выручки пяти крупнейших каналов, январь 2024 — декабрь 2025. \"\n       f\"Приложение выросло с {ru(app['2025-05'])} млн ₽ в мае до {ru(app['2025-07'])} млн ₽ \"\n       f\"в июле 2025 после релиза и к декабрю дошло до {ru(app['2025-12'])} млн ₽.\")\nprint(alt)\ntable = by_ch.pivot(index=\"month\", columns=\"channel\", values=\"mln\")[top5]\nprint(table.loc[\"2025-04\":\"2025-08\"].round(2).to_string())", "out": "Линейный график выручки пяти крупнейших каналов, январь 2024 — декабрь 2025. Приложение выросло с 3,0 млн ₽ в мае до 5,9 млн ₽ в июле 2025 после релиза и к декабрю дошло до 8,0 млн ₽.\nchannel  сайт  маркетплейс  приложение  поиск  рассылка\nmonth                                                  \n2025-04  8.97         6.09        3.09   3.97      2.37\n2025-05  8.77         6.02        2.98   3.72      2.24\n2025-06  8.07         5.73        4.49   3.96      2.29\n2025-07  8.47         5.72        5.91   4.17      2.30\n2025-08  8.85         6.20        6.14   4.22      2.43", "note": "Проверено в Chromium на эмуляции Pixel 5: со стандартным <code>dragmode</code> вертикальный свайп по графику приблизил октябрь–декабрь 2024 и не прокрутил страницу, с <code>dragmode=False</code> страница прокрутилась, а оси остались прежними."}, "express": {"title": "Пять каналов — пять трасс, а подсказку px собрал из подписей", "badge": "проверено: Python 3.13, pandas 3.0.5, plotly 7.1.0", "lang": "python", "code": "import pandas as pd\nimport plotly.express as px\n\nsales = pd.read_csv(\"data/viz/sales_monthly.csv\")  # длинный формат: строка = месяц × канал × страна\ntop5 = [\"сайт\", \"маркетплейс\", \"приложение\", \"поиск\", \"рассылка\"]\nby_ch = (sales[sales[\"channel\"].isin(top5)]\n         .groupby([\"month\", \"channel\"], as_index=False)[\"revenue\"].sum()\n         .assign(mln=lambda d: d[\"revenue\"] / 1e6))\nprint(by_ch.shape)\nprint(by_ch.head(3).to_string(index=False))\n\nfig = px.line(by_ch, x=\"month\", y=\"mln\", color=\"channel\",   # столбец → роль на графике\n              category_orders={\"channel\": top5},             # порядок в легенде\n              labels={\"month\": \"месяц\", \"mln\": \"млн ₽\", \"channel\": \"канал\"},\n              title=\"Приложение удвоило выручку после релиза в июне 2025\")\nfig.update_xaxes(tickformat=\"%m.%Y\")  # 01.2025 вместо Jan 2025\n\napp = fig.data[2]\nprint(type(fig).__name__, \"из\", len(fig.data), \"трасс;\", app.type, app.name, len(app.x), \"точки\")\nprint(list(fig.to_dict()), \"— в браузер уходит этот словарь в виде JSON\")\nprint(app.hovertemplate)", "out": "(120, 4)\n  month     channel   revenue   mln\n2024-01 маркетплейс 7471000.0 7.471\n2024-01       поиск 4374000.0 4.374\n2024-01  приложение 3363000.0 3.363\nFigure из 5 трасс; scatter приложение 24 точки\n['data', 'layout'] — в браузер уходит этот словарь в виде JSON\nканал=приложение<br>месяц=%{x}<br>млн ₽=%{y}<extra></extra>"}, "hover": {"title": "Подсказка говорит по-русски: месяц словами, запятая и доля месяца", "badge": "проверено: Python 3.13, pandas 3.0.5, plotly 7.1.0", "lang": "python", "code": "MONTHS = \"январь февраль март апрель май июнь июль август сентябрь октябрь ноябрь декабрь\".split()\ntotal = sales.groupby(\"month\")[\"revenue\"].sum()  # выручка месяца по всем 10 каналам\nby_ch[\"month_ru\"] = [f\"{MONTHS[int(m[5:]) - 1]} {m[:4]}\" for m in by_ch[\"month\"]]\nby_ch[\"share\"] = by_ch[\"revenue\"] / by_ch[\"month\"].map(total)\n\nfig = px.line(by_ch, x=\"month\", y=\"mln\", color=\"channel\", category_orders={\"channel\": top5},\n              custom_data=[\"month_ru\", \"share\"],  # столбцы, которые нужны только подсказке\n              labels={\"month\": \"месяц\", \"mln\": \"млн ₽\", \"channel\": \"канал\"},\n              title=\"Приложение удвоило выручку после релиза в июне 2025\")\nfig.update_traces(hovertemplate=\"<b>%{fullData.name}</b> · %{customdata[0]}<br>\"\n                                \"%{y:.2f} млн ₽ · %{customdata[1]:.0%} выручки месяца\"\n                                \"<extra></extra>\")  # пустой extra убирает второй ярлык с именем\nfig.update_layout(separators=\", \")  # десятичная запятая и пробел между разрядами\nfig.update_xaxes(tickformat=\"%m.%Y\")\n\nprint(fig.data[2].hovertemplate)\nprint(fig.data[2].customdata[18])  # приложение, июль 2025", "out": "<b>%{fullData.name}</b> · %{customdata[0]}<br>%{y:.2f} млн ₽ · %{customdata[1]:.0%} выручки месяца<extra></extra>\n['июль 2025' 0.18281999690450396]", "note": "Проверено в Chromium настоящим plotly.js из <code>channels.html</code>: подсказка у приложения в июле 2025 — «приложение · июль 2025» и строкой ниже «5,91 млн ₽ · 18% выручки месяца». У маркетплейса за июль 2025 в подсказке 5,71, а в таблице pandas из нюанса про телефон — 5,72: выручка 5 715 000 ₽ стоит ровно посередине, и JavaScript с pandas округляют её в разные стороны."}, "anim": {"title": "24 кадра, кнопки ▶ и ◼ и ползунок по месяцам", "badge": "проверено: Python 3.13, pandas 3.0.5, plotly 7.1.0", "lang": "python", "code": "fig_a = px.bar(by_ch, x=\"channel\", y=\"mln\", color=\"channel\",\n               animation_frame=\"month\",           # один кадр на месяц\n               category_orders={\"channel\": top5},\n               range_y=[0, 11],                   # одна шкала на все кадры\n               labels={\"channel\": \"\", \"mln\": \"млн ₽\", \"month\": \"месяц\"},\n               title=\"Выручка каналов по месяцам\")\nfig_a.update_layout(showlegend=False, separators=\", \")\n\nprint(len(fig_a.frames), \"кадра:\", fig_a.frames[0].name, \"…\", fig_a.frames[-1].name)\nprint(\"кнопки:\", [b.label for b in fig_a.layout.updatemenus[0].buttons])\nprint(\"ползунок, шаг 18:\", fig_a.layout.sliders[0].steps[17].label)\nprint(\"стартовый вид = первый кадр:\", list(fig_a.data[2].y) == list(fig_a.frames[0].data[2].y))\nprint(\"ось Y без range_y:\", px.bar(by_ch, x=\"channel\", y=\"mln\", animation_frame=\"month\").layout.yaxis.range)", "out": "24 кадра: 2024-01 … 2025-12\nкнопки: ['&#9654;', '&#9724;']\nползунок, шаг 18: 2025-06\nстартовый вид = первый кадр: True\nось Y без range_y: None", "note": "<code>&amp;#9654;</code> и <code>&amp;#9724;</code> — коды символов ▶ и ◼ в HTML. Без <code>range_y</code> диапазон оси в фигуре не записан, и plotly.js подбирает его сам: при проигрывании кнопкой ▶ в Chromium верх оси сдвинулся с 10,8 до 11,1 млн ₽, и одна высота столбика в разных кадрах значила бы разные деньги."}, "export": {"title": "Файл с библиотекой весит 4,6 МБ, сама фигура — 20 КБ", "badge": "проверено: Python 3.13, pandas 3.0.5, plotly 7.1.0, kaleido 1.5.0", "lang": "python", "code": "import os\nimport re\n\nfig.write_html(\"channels.html\")                              # include_plotlyjs=True — по умолчанию\nfig.write_html(\"channels_cdn.html\", include_plotlyjs=\"cdn\")  # библиотеку браузер возьмёт из интернета\nwith open(\"channels.json\", \"w\", encoding=\"utf-8\") as f:\n    f.write(fig.to_json())                                   # только фигура: данные и оформление\nfig.write_image(\"channels.png\", width=900, height=480)       # kaleido рисует через Chrome\nfig.write_image(\"channels.svg\", width=900, height=480)\n\nfor name in [\"channels.html\", \"channels_cdn.html\", \"channels.json\", \"channels.png\", \"channels.svg\"]:\n    print(f\"{name:<18} {os.path.getsize(name) / 1024:>8.1f} КБ\")\nprint(re.search(r'src=\"(https://cdn[^\"]+)\"', open(\"channels_cdn.html\", encoding=\"utf-8\").read()).group(1))", "out": "channels.html        4723.7 КБ\nchannels_cdn.html      20.9 КБ\nchannels.json          19.9 КБ\nchannels.png           75.1 КБ\nchannels.svg           15.3 КБ\nhttps://cdn.plot.ly/plotly-4.1.1.min.js", "note": "Рисунок ниже — <code>channels.svg</code> из этого блока, вставлен в страницу без правок."}};/*code:end*/

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const L2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  // число по-русски: десятичная запятая, пробел между разрядами
  const num = (v, d = 2) => { const s = Math.abs(v).toFixed(d).split('.'); return (v < 0 ? '−' : '') + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (s[1] ? ',' + s[1] : ''); };
  const escX = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const f1 = v => v.toFixed(1);

  const M = DATA.months, CH = DATA.ch, Y = DATA.y, SH = DATA.share, N = M.length;
  const MONF = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
  const mName = i => `${MONF[+M[i].slice(5) - 1]} ${M[i].slice(0, 4)}`;
  const mTick = (i, short) => `${M[i].slice(5)}.${short ? M[i].slice(2, 4) : M[i].slice(0, 4)}`;
  const I = m => M.indexOf(m);
  const I_APR = I('2025-04'), I_MAY = I('2025-05'), I_JUN = I('2025-06'), I_JUL = I('2025-07'), I_AUG = I('2025-08');
  const pct = v => `${Math.round(v * 100)}%`;
  const FULL = num(SIZES.full_mb, 1);

  // автодиапазон оси Y по видимым сериям и видимым месяцам, с полями 6% — как autorange
  function yRange(vis, x0, x1) {
    let lo = Infinity, hi = -Infinity;
    const a = Math.max(0, Math.floor(x0 + 1e-9)), b = Math.min(N - 1, Math.ceil(x1 - 1e-9));
    vis.forEach((on, s) => { if (on < .5) return; for (let i = a; i <= b; i++) { lo = Math.min(lo, Y[s][i]); hi = Math.max(hi, Y[s][i]); } });
    if (!isFinite(lo)) return null;
    const pad = (hi - lo) * .06 || .5;
    return [lo - pad, hi + pad];
  }
  function yTicks(lo, hi, n) {
    const raw = (hi - lo) / n, p = Math.pow(10, Math.floor(Math.log10(raw)));
    const st = [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw) || 10 * p;
    const out = []; for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) out.push(+v.toFixed(6));
    return { st, out };
  }
  const xStep = (span, maxN) => [1, 2, 3, 6, 12].find(c => span / c <= maxN) || 12;
  const tickLabel = v => { const r = Math.round(v * 100) / 100; return num(r, Number.isInteger(r) ? 0 : Number.isInteger(r * 10) ? 1 : 2); };

  /* ===================== Сцена: график оживает, потом уходит в письмо картинкой ===================== */
  // Поведение Plotly здесь нарисовано своим JS: настоящий plotly.js весит мегабайты и в страницу не встраивается.
  const PC = ['#636efa', '#ef553b', '#00cc96', '#ab63fa', '#ffa15a'];      // цвета трасс Plotly по умолчанию
  const PI = ['#fff', '#fff', '#13222b', '#fff', '#13222b'];               // текст на ярлыке подсказки
  const PT = '#2a3f5f', PBG = '#e5ecf6';
  const SC = { ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#8d95aa', acc: '#36b8a6', bad: '#f2756a', frame: '#121a2b', line: '#24304a' };
  const T0 = 'Выручка пяти каналов, млн ₽';
  const T1 = `Приложение: ${num(Y[2][I_MAY], 1)} → ${num(Y[2][I_JUL], 1)} млн ₽ в месяц после релиза в июне 2025`;
  const ALL = [1, 1, 1, 1, 1], NOS = [0, 1, 1, 1, 1], ONE = [0, 0, 1, 0, 0];
  const R_ALL = yRange(ALL, 0, N - 1), R_NOS = yRange(NOS, 0, N - 1), R_ONE = yRange(ONE, 0, N - 1), R_ZOOM = yRange(ONE, I_APR, I_AUG);
  const vmix = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

  // состояние сцены на шаге k при прогрессе p — только из k и p
  function sst(k, p) {
    const s = { vis: ALL.slice(), xr: [0, N - 1], yr: R_ALL, mb: 0, json: 0, email: 0, concl: 0, annot: 0, labs: 0, cap: 0,
      cur: null, clicks: [], tip: null, uni: 0, band: null, dead: [], hov: 0, ser: 5, mon: 24, img: false };
    if (k >= 1) s.mb = k === 1 ? seg(p, .15, .45) : 1;
    if (k === 1) s.json = seg(p, .05, .35);
    if (k === 2) {
      const fi = lerp(12, I_JUL, ease(seg(p, .08, .75))), i = Math.round(fi);
      s.cur = { a: { pt: [2, fi] } };
      if (p > .06) { s.tip = { s: 2, i, a: seg(p, .06, .12) }; s.hov = i - 11; }
    }
    if (k >= 3) s.hov = 8;
    if (k === 3) { s.uni = seg(p, .08, .22); s.cur = { a: { pt: [2, I_JUL] }, b: { px: [I_JUL, .2] }, t: ease(seg(p, 0, .2)) }; }
    if (k === 4) {
      s.cur = { a: { px: [I_JUL, .2] }, b: { lg: 0 }, t: ease(seg(p, 0, .35)) };
      s.clicks = [{ at: { lg: 0 }, t: seg(p, .38, .62) }];
      s.vis[0] = 1 - seg(p, .42, .55); s.yr = L2(R_ALL, R_NOS, ease(seg(p, .45, .8))); s.ser = p < .42 ? 5 : 4;
    }
    if (k === 5) {
      s.vis = NOS.slice(); s.yr = R_NOS;
      s.cur = { a: { lg: 0 }, b: { lg: 2 }, t: ease(seg(p, 0, .3)) };
      s.clicks = [{ at: { lg: 2 }, t: seg(p, .32, .5) }, { at: { lg: 2 }, t: seg(p, .42, .6) }];
      const f = seg(p, .48, .6); [1, 3, 4].forEach(j => { s.vis[j] = 1 - f; });
      s.yr = L2(R_NOS, R_ONE, ease(seg(p, .5, .85))); s.ser = p < .48 ? 4 : 1;
    }
    if (k === 6) {
      s.vis = ONE.slice(); s.yr = R_ONE; s.ser = 1;
      s.cur = p < .2 ? { a: { lg: 2 }, b: { px: [I_APR, .55] }, t: ease(seg(p, 0, .2)) } : { a: { px: [I_APR, .55] }, b: { px: [I_AUG, .62] }, t: ease(seg(p, .22, .55)) };
      if (p >= .22 && p < .62) s.band = [I_APR, lerp(I_APR, I_AUG, ease(seg(p, .22, .55)))];
      const z = ease(seg(p, .62, .9));
      s.xr = L2([0, N - 1], [I_APR, I_AUG], z); s.yr = L2(R_ONE, R_ZOOM, z); s.mon = p < .62 ? 24 : 5;
    }
    if (k === 7) {
      s.vis = ONE.slice(); s.xr = [I_APR, I_AUG]; s.yr = R_ZOOM; s.ser = 1; s.mon = 5;
      s.cur = { a: { px: [I_AUG, .62] }, b: { pt: [2, I_JUN] }, t: ease(seg(p, 0, .35)) };
      if (p > .33) { s.tip = { s: 2, i: I_JUN, a: seg(p, .33, .42) }; s.hov = 9; }
    }
    if (k >= 8) { s.hov = 9; s.img = true; s.mb = 0; }
    if (k === 8) {
      const e1 = ease(seg(p, .04, .3));
      s.vis = vmix(ONE, ALL, e1); s.xr = L2([I_APR, I_AUG], [0, N - 1], e1); s.yr = L2(R_ZOOM, R_ALL, e1); s.mb = 1 - e1;
      s.email = ease(seg(p, .1, .6)); s.cap = seg(p, .55, .7);
    }
    if (k >= 9) { s.email = 1; s.cap = 1; }
    if (k === 9) {
      if (p < .33) s.cur = { a: { px: [N - 1, .95] }, b: { pt: [2, I_JUL] }, t: ease(seg(p, .03, .25)) };
      else if (p < .62) s.cur = { a: { pt: [2, I_JUL] }, b: { lg: 2 }, t: ease(seg(p, .35, .5)) };
      else s.cur = p < .72 ? { a: { lg: 2 }, b: { px: [3, .45] }, t: ease(seg(p, .62, .72)) } : { a: { px: [3, .45] }, b: { px: [9, .5] }, t: ease(seg(p, .72, .88)) };
      if (p > .5) s.clicks = [{ at: { lg: 2 }, t: seg(p, .52, .7) }];
      if (p > .27) s.dead.push({ at: { pt: [2, I_JUL] }, a: seg(p, .27, .33) });
      if (p > .55) s.dead.push({ at: { lg: 2 }, a: seg(p, .55, .61) });
      if (p > .89) s.dead.push({ at: { px: [9, .5] }, a: seg(p, .89, .95) });
    }
    if (k === 10) { s.concl = seg(p, .08, .38); s.annot = seg(p, .35, .6); s.labs = seg(p, .5, .75); }
    return s;
  }

  // перенос заголовка по ширине (примерная ширина знака шрифта Plotly)
  function wrap(t, w, fs) {
    const max = Math.max(8, Math.floor(w / (fs * .56))), out = []; let line = '';
    t.split(' ').forEach(word => { if ((line + ' ' + word).trim().length > max && line) { out.push(line); line = word; } else line = (line + ' ' + word).trim(); });
    if (line) out.push(line);
    return out;
  }
  function cardGeo(cw, ch, mob) {
    const fsT = mob ? 12 : 15, fs = mob ? 9.5 : 11.5;
    const tl = wrap(T1, cw - 24 - (mob ? 0 : 120), fsT);
    const tH = 12 + tl.length * fsT * 1.3;
    const g = { cw, ch, mob, fsT, fs, tH, lg: [] };
    if (!mob) {
      g.lgW = 112; g.l = 46; g.r = cw - g.lgW - 14; g.t = tH + 8; g.b = ch - 28;
      CH.forEach((c, i) => g.lg.push({ x: g.r + 18, y: g.t + 26 + i * 20, w: 90 }));
    } else {
      let x = 6, y = tH + 6; const rowH = 15;
      CH.forEach(c => { const w = 22 + c.length * fs * .58 + 8; if (x + w > cw - 4) { x = 6; y += rowH; } g.lg.push({ x, y: y + 8, w }); x += w; });
      g.l = 30; g.r = cw - 8; g.t = y + rowH + 6; g.b = ch - 18;
    }
    return g;
  }

  const scene = {
    parts: [{ n: '01', name: 'Картинка', s: [0, 1] }, { n: '02', name: 'Наведение', s: [2, 3] }, { n: '03', name: 'Легенда', s: [4, 5] }, { n: '04', name: 'Рамка', s: [6, 7] }, { n: '05', name: 'Письмо', s: [8, 9] }, { n: '06', name: 'Вывод', s: [10] }],
    steps: [
      { title: 'Пять линий и ни одного точного числа', dur: 3400, body: `<p>Учебная выручка пяти крупнейших каналов за&nbsp;24&nbsp;месяца. Пока это просто картинка: видно, что зелёная линия приложения летом 2025 года пошла вверх.</p><p>Но&nbsp;сколько было в&nbsp;июле? На&nbsp;глаз — «около шести».</p>` },
      { title: 'Фигура — это описание графика', dur: 3800, body: '<p>В&nbsp;Plotly график хранится не&nbsp;пикселями, а&nbsp;описанием: пять <b>трасс</b> по&nbsp;24&nbsp;точки плюс оформление. Python отдаёт его в&nbsp;браузер как&nbsp;JSON.</p><p>Рисует <b>plotly.js</b>, и&nbsp;у&nbsp;графика появляется панель инструментов: значит, им можно управлять.</p>' },
      { title: 'Наведение: точное число', dur: 3800, body: `<p>Курсор идёт по&nbsp;линии приложения, и&nbsp;у&nbsp;каждой точки всплывает <b>подсказка</b>: канал, месяц, выручка и&nbsp;доля месяца.</p><p>Июль 2025 — <b>${num(Y[2][I_JUL])}&nbsp;млн&nbsp;₽</b>, а&nbsp;не&nbsp;«около шести».</p>` },
      { title: 'Все каналы за один месяц', dur: 3200, body: `<p>Режим <b>x unified</b> собирает в&nbsp;одну подсказку все серии за&nbsp;месяц под курсором. В&nbsp;июле 2025 приложение (${num(Y[2][I_JUL])}) уже обогнало маркетплейс (${num(Y[1][I_JUL])}).</p>` },
      { title: 'Клик по легенде прячет серию', dur: 3600, body: '<p>Щелчок по&nbsp;«сайт» в&nbsp;легенде прячет самую высокую линию. Ось Y сразу пересчитывается под&nbsp;то, что осталось, и&nbsp;остальные линии растягиваются по&nbsp;высоте.</p>' },
      { title: 'Двойной клик оставляет одну', dur: 3600, body: '<p>Двойной щелчок по&nbsp;«приложение» оставляет только эту серию. Повторный двойной щелчок вернул&nbsp;бы все.</p><p>Читатель сам убрал всё лишнее для своего вопроса.</p>' },
      { title: 'Рамка приближает месяцы', dur: 3800, body: '<p>Мышью обводим апрель — август 2025. График приближает выделенное, ось X теперь показывает пять месяцев, ось Y подстраивается.</p><p>Двойной щелчок по&nbsp;полю графика вернул&nbsp;бы исходный вид.</p>' },
      { title: 'Месяц разгона', dur: 3200, body: `<p>В&nbsp;приближении видно, что скачок не&nbsp;мгновенный: июнь — <b>${num(Y[2][I_JUN])}</b>, между маем (${num(Y[2][I_MAY])}) и&nbsp;июлем (${num(Y[2][I_JUL])}).</p><p>Всё это читатель нашёл сам, без&nbsp;автора.</p>` },
      { title: 'График уходит в письмо', dur: 3800, body: `<p>Автор сохраняет график через <b>write_image</b> и&nbsp;вставляет PNG в&nbsp;письмо директору. На&nbsp;картинке снова все пять каналов за&nbsp;два года.</p><p>Скрытия и&nbsp;рамка жили только в&nbsp;браузере, а&nbsp;картинку рисует фигура из&nbsp;Python.</p>` },
      { title: 'Картинка не отвечает', dur: 4200, body: '<p>Директор наводит курсор на&nbsp;июль — подсказки нет. Щёлкает по&nbsp;легенде — это просто надпись. Пробует обвести лето — рамка не&nbsp;тянется.</p><p>Почтовые программы не&nbsp;выполняют JavaScript, и&nbsp;всё, что лежало в&nbsp;подсказках, для&nbsp;него не&nbsp;существует.</p>' },
      { title: 'Вывод переезжает в заголовок', dur: 4200, next: 'Читать страницу', body: `<p>Работу подсказок теперь делает автор. Заголовок говорит вывод: <b>${num(Y[2][I_MAY], 1)} → ${num(Y[2][I_JUL], 1)}&nbsp;млн&nbsp;₽</b> в&nbsp;месяц после релиза, аннотация отмечает июнь, у&nbsp;точек — числа.</p><p>Интерактив выбирают под&nbsp;место, где график будут читать.</p>` }
    ],
    hud: [{ id: 'hov', label: 'Подсказок' }, { id: 'ser', label: 'Серий видно' }, { id: 'mon', label: 'Месяцев' }],
    legend: '<span><i style="background:#00cc96"></i>приложение</span><span><i class="sq" style="background:#e5ecf6"></i>поле графика Plotly</span><span><i style="background:#36b8a6"></i>выноска</span>',
    info: 'PLOTLY',
    aiNote: `В анимации: линейный график Plotly с учебной выручкой пяти каналов (сайт, маркетплейс, приложение, поиск, рассылка) за 2024–2025, млн ₽. Подсказка: приложение, июль 2025 — ${num(Y[2][I_JUL])} млн ₽, ${pct(SH[2][I_JUL])} выручки месяца. Клик по легенде прячет сайт, двойной клик оставляет приложение, рамка приближает апрель–август 2025 (июнь — ${num(Y[2][I_JUN])}). Потом график сохраняют через write_image и вставляют в письмо картинкой: подсказки, легенда и рамка не работают, вывод переносят в заголовок. Поведение Plotly в анимации нарисовано своим JS.`,
    mount(root, api) {
      root.innerHTML = '<div class="d83-sc"><svg class="d83-svg" aria-hidden="true"></svg><div class="d83-calls"></div></div>';
      const box = root.firstChild, svg = box.firstChild, layer = box.lastChild;
      let W = 0, H = 0, sig = '';
      const T = (x, y, t, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" font-size="${o.fs}" fill="${o.c || PT}"${o.a ? ` text-anchor="${o.a}"` : ''}${o.w ? ` font-weight="${o.w}"` : ''}${o.op != null ? ` opacity="${o.op.toFixed(3)}"` : ''}${o.cl ? ` class="${o.cl}"` : ''}${o.tr ? ` transform="${o.tr}"` : ''}>${t}</text>`;
      const R = (x, y, w, h, f, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0, w))}" height="${f1(Math.max(0, h))}" fill="${f}"${extra}/>`;
      const Ln = (x1, y1, x2, y2, c, w, extra = '') => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="${w}"${extra}/>`;

      function draw(k, p) {
        if (box.clientWidth !== W || box.clientHeight !== H) { W = box.clientWidth; H = box.clientHeight; sig = ''; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H); }
        if (!W || !H) return;
        const s = sst(k, p);
        const hud = api.hud;
        const mob = W < 480, SH0 = mob ? 46 : 0;   // на телефоне снизу полоса под выноски
        hud('hov', String(s.hov)); hud('ser', mob ? `${s.ser}/5` : `${s.ser} из 5`); hud('mon', String(s.mon));
        const key = `${k}|${Math.round(p * 300)}|${W}x${H}`; if (key === sig) return; sig = key;
        const cw = Math.min(W, 720), ch = Math.round(Math.min(H - SH0, mob ? H : Math.max(300, cw * .66)));
        const g = cardGeo(cw, ch, mob);
        // письмо: рамка окна и место картинки
        const fw = mob ? W : Math.min(W, 640), fh = mob ? H - SH0 : Math.min(H, ch + 110), fx = (W - fw) / 2, fy = mob ? 0 : (H - fh) / 2;
        const hh = mob ? 44 : 56, iy = fy + hh + 30, ih = fh - hh - 30 - 22, iw = fw - 24;
        const sc1 = Math.min(iw / cw, ih / ch, 1);
        const e = s.email, Tx = lerp((W - cw) / 2, fx + (fw - cw * sc1) / 2, e), Ty = lerp(mob ? 0 : (H - ch) / 2, iy, e), Ts = lerp(1, sc1, e);
        const X = fi => g.l + (fi - s.xr[0]) / (s.xr[1] - s.xr[0]) * (g.r - g.l);
        const Yv = v => g.b - (v - s.yr[0]) / (s.yr[1] - s.yr[0]) * (g.b - g.t);
        const yAt = (si, fi) => { const a = Math.floor(fi), b = Math.min(N - 1, a + 1), t = fi - a; return lerp(Y[si][a], Y[si][b], t); };
        const local = sp => sp.pt ? [X(sp.pt[1]), Yv(yAt(sp.pt[0], sp.pt[1]))] : sp.px ? [X(sp.px[0]), lerp(g.t, g.b, sp.px[1])] : [g.lg[sp.lg].x + 9, g.lg[sp.lg].y - 3];
        const stage = sp => { const [x, y] = local(sp); return [Tx + x * Ts, Ty + y * Ts]; };
        let o = '';
        // окно письма
        if (e > 0) {
          o += `<g opacity="${e.toFixed(3)}">` + R(fx, fy, fw, fh, SC.frame, ` rx="10" stroke="${SC.line}"`) + R(fx + 1, fy + hh, fw - 2, fh - hh - 1, '#f7f8fb', ' rx="0"');
          o += `<circle cx="${fx + 14}" cy="${fy + 13}" r="4" fill="#f2756a"/><circle cx="${fx + 27}" cy="${fy + 13}" r="4" fill="#e3c04d"/><circle cx="${fx + 40}" cy="${fy + 13}" r="4" fill="#45c48f"/>`;
          const fsE = mob ? 10 : 12;
          o += T(fx + 54, fy + 17, 'Кому: директору по продажам', { fs: fsE, c: SC.ink2 });
          o += T(fx + 14, fy + hh - 10, 'Тема: выручка по каналам за 2024–2025', { fs: fsE, c: SC.ink, w: 600 });
          o += T(fx + 12, fy + hh + 20, 'Коллеги, итоги по каналам — на графике:', { fs: fsE, c: '#2b3445' });
          if (s.cap > 0) o += T(fx + fw / 2, Math.min(fy + fh - 7, iy + ch * sc1 + 15), `channels.png · 900 × 480 · ${SIZES.png_kb} КБ`, { fs: mob ? 9 : 10.5, c: '#5d6880', a: 'middle', op: s.cap, cl: 'd83-mono' });
          o += '</g>';
        }
        // карточка фигуры Plotly
        o += `<g transform="translate(${f1(Tx)},${f1(Ty)}) scale(${Ts.toFixed(4)})">`;
        o += R(0, 0, cw, ch, '#ffffff', ` rx="${lerp(8, 2, e).toFixed(1)}"${e > 0 ? ` stroke="#c9d0dc" stroke-opacity="${e.toFixed(3)}"` : ''}`);
        // заголовок
        const tl0 = wrap(T0, cw - 24 - (mob ? 0 : 120), g.fsT), tl1 = wrap(T1, cw - 24 - (mob ? 0 : 120), g.fsT);
        const tline = (lines, op) => lines.map((ln, i) => T(12, 10 + g.fsT + i * g.fsT * 1.3, escX(ln), { fs: g.fsT, op, w: op > 0 && lines === tl1 ? 600 : null })).join('');
        if (s.concl < 1) o += tline(tl0, 1 - s.concl);
        if (s.concl > 0) o += tline(tl1, s.concl);
        // панель инструментов
        if (s.mb > 0) {
          const ic = mob ? 16 : 20, x0 = cw - 8 - ic * 5, y0 = 6, c = '#8a95a8';
          let m = `<g opacity="${s.mb.toFixed(3)}" stroke="${c}" fill="none" stroke-width="1.3">`;
          m += `<rect x="${x0 + 2}" y="${y0 + 4}" width="${ic - 8}" height="${ic - 10}" rx="1.5"/><circle cx="${x0 + ic / 2 - 2}" cy="${y0 + ic / 2 - 1}" r="${ic / 7}"/>`;
          m += `<circle cx="${x0 + ic + ic / 2 - 2}" cy="${y0 + ic / 2 - 2}" r="${ic / 5}"/><line x1="${x0 + ic + ic / 2 + 1}" y1="${y0 + ic / 2 + 1}" x2="${x0 + 2 * ic - 4}" y2="${y0 + ic - 4}"/>`;
          m += `<path d="M${x0 + 2.5 * ic} ${y0 + 3}v${ic - 6}M${x0 + 2 * ic + 3} ${y0 + ic / 2}h${ic - 6}"/>`;
          m += `<rect x="${x0 + 3 * ic + 3}" y="${y0 + 4}" width="${ic - 7}" height="${ic - 8}" stroke-dasharray="2 2"/>`;
          m += `<path d="M${x0 + 4 * ic + 3} ${y0 + ic / 2}l${ic / 2 - 3} ${-ic / 2 + 4}l${ic / 2 - 3} ${ic / 2 - 4}M${x0 + 4 * ic + 5} ${y0 + ic / 2 - 1}v${ic / 2 - 2}h${ic - 10}v${-ic / 2 + 2}"/>`;
          o += m + '</g>';
          g.mbAt = [x0 + ic * 2.5, y0 + ic / 2];
        }
        // поле, сетка, оси
        o += R(g.l, g.t, g.r - g.l, g.b - g.t, PBG);
        const yt = yTicks(s.yr[0], s.yr[1], mob ? 4 : 6);
        yt.out.forEach(v => { const y = Yv(v); if (y < g.t - .5 || y > g.b + .5) return; o += Ln(g.l, y, g.r, y, '#fff', 1) + T(g.l - 5, y + 3.5, tickLabel(v, yt.st), { fs: g.fs, a: 'end' }); });
        const span = s.xr[1] - s.xr[0], st = xStep(span, Math.max(2, Math.floor((g.r - g.l) / (mob ? 46 : 66))));
        for (let i = Math.ceil(s.xr[0] - 1e-9); i <= Math.floor(s.xr[1] + 1e-9); i++) {
          if (i % st) continue; const x = X(i);
          o += Ln(x, g.t, x, g.b, '#fff', 1) + T(x > cw - 24 ? Math.min(x + 4, cw - 3) : x, g.b + (mob ? 12 : 16), mTick(i, mob), { fs: g.fs, a: x > cw - 24 ? 'end' : 'middle' });
        }
        if (!mob) o += T(14, (g.t + g.b) / 2, 'млн ₽', { fs: g.fs, a: 'middle', tr: `rotate(-90 14 ${f1((g.t + g.b) / 2)})` });
        // линии
        o += `<clipPath id="d83clip"><rect x="${f1(g.l)}" y="${f1(g.t)}" width="${f1(g.r - g.l)}" height="${f1(g.b - g.t)}"/></clipPath><g clip-path="url(#d83clip)">`;
        s.vis.forEach((v, si) => { if (v <= .01) return; o += `<polyline points="${Y[si].map((y, i) => `${f1(X(i))},${f1(Yv(y))}`).join(' ')}" fill="none" stroke="${PC[si]}" stroke-width="2" stroke-linejoin="round" opacity="${v.toFixed(3)}"/>`; });
        // рамка приближения
        if (s.band) { const a = X(s.band[0]), b = X(s.band[1]); o += R(g.l, g.t, a - g.l, g.b - g.t, 'rgba(0,0,0,.18)') + R(b, g.t, g.r - b, g.b - g.t, 'rgba(0,0,0,.18)') + R(a, g.t, b - a, g.b - g.t, 'none', ' stroke="#333" stroke-width="1" stroke-dasharray="3 3"'); }
        o += '</g>';
        // легенда
        if (!mob) o += T(g.r + 18, g.t + 8, 'канал', { fs: g.fs + 1 });
        CH.forEach((c, i) => { const it = g.lg[i], op = .5 + .5 * s.vis[i]; o += `<g opacity="${op.toFixed(3)}">` + Ln(it.x, it.y - 4, it.x + 18, it.y - 4, PC[i], 2) + T(it.x + 22, it.y, c, { fs: g.fs }) + '</g>'; });
        // заголовок-вывод: аннотация и подписи
        if (s.annot > 0) {
          const [ax, ay] = [X(I_JUN), Yv(Y[2][I_JUN])];
          o += `<g opacity="${s.annot.toFixed(3)}">` + Ln(ax, ay - 6, ax, ay - 34, '#444', 1) + `<path d="M${f1(ax - 3.5)} ${f1(ay - 12)}l3.5 6l3.5 -6z" fill="#444"/>` + T(ax + 2, ay - 38, 'релиз', { fs: g.fs + 1, a: 'end', c: '#222' }) + '</g>';
        }
        if (s.labs > 0) [[I_MAY, 'end', -6], [I_JUL, 'start', 6]].forEach(([i, a, dx]) => { o += T(X(i) + dx, Yv(Y[2][i]) + (i === I_MAY ? 14 : -6), num(Y[2][i], 1), { fs: g.fs + 1, a, w: 700, c: '#0a8a63', op: s.labs }); });
        // JSON фигуры
        if (s.json > 0) {
          const jx = mob ? 6 : g.l + 12, jy = mob ? g.t + 4 : g.t + 12, jw = mob ? cw - 12 : Math.min(340, g.r - g.l - 24), fsJ = mob ? 9 : 11, lh = fsJ * 1.45;
          const J = [['{"data": [', SC.ink], ['  {"type": "scatter", "name": "сайт",', '#9fd3a6'], ['   "x": ["2024-01", … всего 24],', SC.ink2], ['   "y": [10.27, 9.76, … всего 24]},', SC.ink2], ['  … ещё 4 трассы],', SC.mut], [' "layout": {"title": …, "legend": …}}', SC.ink]];
          o += `<g opacity="${s.json.toFixed(3)}">` + R(jx, jy, jw, J.length * lh + 22, '#0e1422', ' rx="8" opacity=".95"') + T(jx + 10, jy + 13, 'fig.to_json() — что уходит в браузер', { fs: fsJ - 1, c: SC.acc, cl: 'd83-mono' });
          J.forEach(([t, c], i) => { o += T(jx + 10, jy + 26 + i * lh + fsJ * .7, escX(t), { fs: fsJ, c, cl: 'd83-mono d83-pre' }); });
          o += '</g>'; g.jsonAt = [jx + jw, jy + J.length * lh + 18];
        }
        // единая подсказка x unified
        if (s.uni > 0) {
          const x = X(I_JUL), rows = CH.map((c, i) => [i, Y[i][I_JUL]]), fsU = g.fs, lh = fsU * 1.5, bw = mob ? 118 : 150, bh = 20 + rows.length * lh;
          const bx = x - bw - 10 > g.l ? x - bw - 10 : x + 10, by = g.t + 6;
          o += `<g opacity="${s.uni.toFixed(3)}">` + Ln(x, g.t, x, g.b, '#666', 1, ' stroke-dasharray="3 3"') + R(bx, by, bw, bh, '#fff', ' rx="3" stroke="#c8cfd9"') + T(bx + 8, by + 14, mName(I_JUL), { fs: fsU, w: 700 });
          rows.forEach(([i, v], j) => { const yy = by + 18 + (j + .75) * lh; o += Ln(bx + 8, yy - 4, bx + 20, yy - 4, PC[i], 2) + T(bx + 25, yy, CH[i], { fs: fsU - .5 }) + T(bx + bw - 7, yy, num(v), { fs: fsU - .5, a: 'end', w: 600 }); });
          o += '</g>'; g.uniAt = [bx, by + bh / 2];
        }
        // подсказка closest
        if (s.tip) {
          const { s: si, i, a } = s.tip, [x, y] = [X(i), Yv(Y[si][i])], fsH = g.fs + .5;
          const l1 = `${CH[si]} · ${mName(i)}`, l2 = `${num(Y[si][i])} млн ₽ · ${pct(SH[si][i])} выручки месяца`;
          const bw = Math.max(l1.length, l2.length) * fsH * .56 + 14, bh = fsH * 2.9;
          const bx = clamp(x + 12 + bw > g.r + (mob ? 6 : 60) ? x - 12 - bw : x + 12, 2, cw - bw - 2), by = clamp(y - bh / 2, g.t - 4, g.b - bh);
          o += `<g opacity="${a.toFixed(3)}"><circle cx="${f1(x)}" cy="${f1(y)}" r="4.5" fill="${PC[si]}" stroke="#fff" stroke-width="1.5"/>` + R(bx, by, bw, bh, PC[si], ' rx="2" stroke="#fff" stroke-opacity=".6"');
          o += `<text x="${f1(bx + 7)}" y="${f1(by + fsH * 1.2)}" font-size="${fsH}" fill="${PI[si]}"><tspan font-weight="700">${CH[si]}</tspan> · ${mName(i)}</text>` + T(bx + 7, by + fsH * 2.45, l2, { fs: fsH, c: PI[si] }) + '</g>';
          g.tipAt = [bx + bw / 2, by]; g.tipBox = [bx, by, bw, bh];
        }
        o += '</g>';
        // попытки потрогать картинку, щелчки и курсор — поверх, в координатах сцены
        s.dead.forEach(d => { const [x, y] = stage(d.at); o += `<g opacity="${d.a.toFixed(3)}" stroke="${SC.bad}" stroke-width="2.4" stroke-linecap="round"><circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="rgba(242,117,106,.18)"/><path d="M${f1(x - 4)} ${f1(y - 4)}l8 8M${f1(x + 4)} ${f1(y - 4)}l-8 8"/></g>`; });
        s.clicks.forEach(c => { if (c.t <= 0 || c.t >= 1) return; const [x, y] = stage(c.at); o += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(4 + 16 * c.t)}" fill="none" stroke="${SC.acc}" stroke-width="2" opacity="${(1 - c.t).toFixed(3)}"/>`; });
        if (s.cur) {
          const a = stage(s.cur.a), b = s.cur.b ? stage(s.cur.b) : a, [x, y] = L2(a, b, s.cur.t || 0);
          o += `<path d="M${f1(x)} ${f1(y)}l0 16l4.2 -3.9l3 6.6l2.6 -1.1l-3 -6.4l5.8 0z" fill="#fff" stroke="#111" stroke-width="1.1" stroke-linejoin="round"/>`;
        }
        svg.innerHTML = o;
        // выноски
        const toSt = ([x, y]) => [Tx + x * Ts, Ty + y * Ts];
        const calls = [];
        const C = (show, to, html, dir, mobPos, bad) => { if (show > 0) calls.push({ a: show, to, html, dir, mob: mobPos, bad }); };
        if (k === 0) C(seg(p, .4, .52), stage({ pt: [2, I_JUL] }), 'Сколько в&nbsp;июле? На&nbsp;глаз — «около шести»', 'ul', 'top');
        if (k === 1) {
          if (g.mbAt) C(seg(p, .45, .52) * (1 - seg(p, .7, .75)), toSt(g.mbAt), 'Панель инструментов: рамка, сдвиг, сброс, снимок в&nbsp;PNG', 'dl');
          if (g.jsonAt) C(seg(p, .75, .82), toSt(g.jsonAt), '5 трасс × 24 точки: данные едут вместе с&nbsp;графиком', 'dr');
        }
        if (k === 2 && g.tipAt) C(seg(p, .8, .9), toSt(g.tipAt), 'Текст подсказки задаёт <b>hovertemplate</b>', 'ul', 'top');
        if (k === 3 && g.uniAt) C(seg(p, .4, .52), toSt(g.uniAt), '<b>hovermode="x unified"</b>: все каналы за&nbsp;один месяц', 'l', 'bottom');
        if (k === 4) C(seg(p, .72, .84), toSt([g.l, g.t + 4]), `Ось Y сжалась: теперь выше всех приложение, ${num(Math.max(...Y[2]))}`, 'dr', 'bottom');
        if (k === 5) C(seg(p, .68, .8), stage({ lg: 2 }), 'Двойной клик: осталось только приложение', mob ? 'd' : 'l', 'bottom');
        if (k === 6) C(seg(p, .86, .96), toSt([(g.l + g.r) / 2, g.b]), 'Рамка: апрель — август 2025', 'u', 'top');
        if (k === 7 && g.tipAt) C(seg(p, .55, .67), toSt(g.tipAt), `Июнь — разгон: ${num(Y[2][I_JUN])} между ${num(Y[2][I_MAY])} и&nbsp;${num(Y[2][I_JUL])}`, 'ul', 'top');
        if (k === 8) C(seg(p, .66, .78), [Tx + cw * Ts * .5, Ty + ch * Ts * .15], '<b>write_image</b> рисует фигуру из&nbsp;Python: скрытия и&nbsp;рамка жили только в&nbsp;браузере', 'ur', 'top');
        if (k === 9) {
          const dd = [['Наведение — ничего', { pt: [2, I_JUL] }, .3], ['Легенда — просто надпись', { lg: 2 }, .58], ['Рамка не&nbsp;тянется', { px: [9, .5] }, .92]];
          dd.forEach(([t, at, p0], j) => { if (mob && dd[j + 1] && p >= dd[j + 1][2]) return; C(seg(p, p0, p0 + .06), stage(at), `✕ ${t}`, ['ul', 'l', 'dl'][j], 'top', true); });
        }
        if (k === 10) C(seg(p, .72, .84), [Tx + 12 * Ts + 40, Ty + (g.fsT + 10) * Ts], 'То, что искали наведением, автор написал на&nbsp;картинке сам', 'dr', 'bottom');
        layer.innerHTML = calls.map(c => `<div class="d83-call${c.bad ? ' bad' : ''}" style="opacity:${c.a.toFixed(3)}">${c.html}</div>`).join('');
        let lines = '';
        [...layer.children].forEach((el, i) => {
          const c = calls[i];
          el.style.maxWidth = `${mob ? W - 8 : 230}px`;
          const bw = el.offsetWidth, bh = el.offsetHeight;
          let x, y;
          if (mob) { x = 4; y = H - bh - 2; }
          else {
            const d = { ul: [-bw - 34, -bh - 30], ur: [34, -bh - 30], dl: [-bw - 34, 30], dr: [34, 30], l: [-bw - 40, -bh / 2], r: [40, -bh / 2], u: [-bw / 2, -bh - 40], d: [-bw / 2, 40] }[c.dir || 'ur'];
            x = clamp(c.to[0] + d[0], 4, W - bw - 4); y = clamp(c.to[1] + d[1], 4, H - bh - 4);
          }
          el.style.left = `${f1(x)}px`; el.style.top = `${f1(y)}px`;
          const nx = clamp(c.to[0], x, x + bw), ny = clamp(c.to[1], y, y + bh);
          if (Math.hypot(nx - c.to[0], ny - c.to[1]) > 10) lines += `<g opacity="${(c.a * .85).toFixed(3)}">${Ln(nx, ny, c.to[0], c.to[1], c.bad ? SC.bad : SC.acc, 1.2, ' stroke-dasharray="4 3"')}<circle cx="${f1(c.to[0])}" cy="${f1(c.to[1])}" r="3" fill="${c.bad ? SC.bad : SC.acc}"/></g>`;
        });
        if (lines) svg.insertAdjacentHTML('beforeend', lines);
      }
      return { render: draw };
    }
  };

  /* ===================== Интерактив «Статика или интерактив» ===================== */
  const SCEN = [
    { id: 'mail', name: 'Письмо директору', sit: 'Директор читает почту с&nbsp;телефона между встречами. Ему нужен один ответ: что случилось с&nbsp;приложением.', rec: 'still',
      v: { live: ['bad', `Почтовые программы не&nbsp;выполняют JavaScript: в&nbsp;теле письма интерактив не&nbsp;заработает, а&nbsp;HTML-вложение на&nbsp;${FULL}&nbsp;МБ надо скачать и&nbsp;открыть в&nbsp;браузере. Директор этого не&nbsp;сделает, и&nbsp;вывод останется в&nbsp;подсказках.`],
        still: ['good', 'Картинка видна сразу, без вложений и&nbsp;кликов. Но&nbsp;работу подсказок теперь делаете вы: вывод — в&nbsp;заголовке, релиз — подписью на&nbsp;графике.'],
        both: ['ok', 'Картинка с&nbsp;выводом в&nbsp;теле письма и&nbsp;ссылка на&nbsp;интерактив для&nbsp;тех, кто захочет найти свою цифру. Проверьте одно: письмо понятно и&nbsp;без&nbsp;ссылки.'] },
      badge: { live: ['bad', 'в письме: скрипт не выполнится'], still: ['good', 'в письме: видна сразу'] } },
    { id: 'dash', name: 'Дашборд', sit: 'Менеджеры каналов открывают страницу каждый понедельник, и&nbsp;каждый ищет свой канал и&nbsp;свой месяц.', rec: 'live',
      v: { live: ['good', 'У&nbsp;каждого читателя свой вопрос, и&nbsp;интерактив отвечает всем сразу: навёл — увидел число, спрятал лишние линии — ось подстроилась. Заголовок-вывод всё равно нужен: кто зашёл на&nbsp;минуту, поймёт главное без&nbsp;наведения.'],
        still: ['bad', 'Картинка — снимок на&nbsp;день выгрузки. Каждую неделю её&nbsp;придётся перерисовывать, а&nbsp;менеджер маркетплейса не&nbsp;узнает свою цифру за&nbsp;март без&nbsp;вашей помощи.'],
        both: ['ok', 'Лишний шаг: интерактив в&nbsp;дашборде уже есть, а&nbsp;картинка рядом быстро устареет. Лучше один интерактивный график с&nbsp;заголовком, который пересчитывается вместе с&nbsp;данными.'] },
      badge: { live: ['good', 'в дашборде: каждый ищет своё'], still: ['bad', 'в дашборде: снимок устареет'] } },
    { id: 'article', name: 'Статья', sit: 'Пост в&nbsp;корпоративной вики о&nbsp;том, как релиз приложения изменил выручку. Читают с&nbsp;ноутбуков и&nbsp;телефонов.', rec: 'both',
      v: { live: ['ok', 'Если платформа пропускает чужой JavaScript — многие не&nbsp;пропускают. И&nbsp;большинство прокрутит график, не&nbsp;наводя курсор: вывод должен стоять в&nbsp;заголовке и&nbsp;в&nbsp;тексте.'],
        still: ['ok', 'Картинка работает везде, в&nbsp;том числе в&nbsp;рассылке и&nbsp;при печати статьи. Но&nbsp;читатель, которому важен свой канал или месяц, не&nbsp;проверит цифру сам.'],
        both: ['good', 'Картинка с&nbsp;выводом в&nbsp;тексте и&nbsp;интерактивная версия ниже или по&nbsp;ссылке. Статья читается целиком без&nbsp;кликов, а&nbsp;любопытный читатель проверит свой месяц.'] },
      badge: { live: ['ok', 'в статье: если платформа пустит скрипт'], still: ['ok', 'в статье: работает везде'] } },
    { id: 'nb', name: 'Ноутбук', sit: 'Вы&nbsp;сами разбираетесь, что случилось с&nbsp;каналами, и&nbsp;вывода ещё нет.', rec: 'live',
      v: { live: ['good', 'Пока вывода нет, интерактив быстрее перестройки графика: навели — увидели число, спрятали сайт — ось пересчиталась, обвели лето — приблизили. Это разговор с&nbsp;данными.'],
        still: ['ok', 'Картинка нужна, если ноутбук будут смотреть без&nbsp;запущенного ядра и&nbsp;JavaScript: в&nbsp;PDF или в&nbsp;просмотрщике файлов. Для&nbsp;своей разведки она медленнее: каждое «а&nbsp;что в&nbsp;июне?» — новый график.'],
        both: ['ok', 'Разумно, если ноутбук уйдёт коллегам: интерактив для&nbsp;разведки, статичная копия для&nbsp;тех, у&nbsp;кого он&nbsp;не&nbsp;откроется. Для&nbsp;себя хватит интерактива.'] },
      badge: { live: ['good', 'в ноутбуке: разведка'], still: ['ok', 'в ноутбуке: для чтения без ядра'] } },
    { id: 'print', name: 'Печать', sit: 'Квартальный отчёт печатают к&nbsp;совету директоров и&nbsp;раздают на&nbsp;бумаге.', rec: 'still',
      v: { live: ['bad', 'На&nbsp;бумаге нет курсора. Печать HTML-страницы даёт снимок текущего вида, и&nbsp;всё, что лежало в&nbsp;подсказках, пропадает.'],
        still: ['good', 'Лучше векторный SVG или PDF: линии и&nbsp;текст чёткие при любом масштабе. Подписи ставьте прямо у&nbsp;линий: на&nbsp;чёрно-белом принтере цвета легенды могут слиться.'],
        both: ['ok', 'Картинка в&nbsp;отчёте и&nbsp;короткая ссылка или QR-код на&nbsp;интерактив для&nbsp;тех, кто потом откроет отчёт на&nbsp;экране. Отчёт при этом читается без&nbsp;ссылки.'] },
      badge: { live: ['bad', 'на бумаге: курсора нет'], still: ['good', 'на бумаге: SVG или PDF'] } }
  ];
  const OPTS = [['live', 'Интерактивную'], ['still', 'Статичную'], ['both', 'Обе: картинку и ссылку']];
  const VERD = { good: 'Верно', ok: 'Можно, но', bad: 'Поспорим' };
  const BEST = { live: 'интерактивная версия', still: 'статичная картинка', both: 'обе версии: картинка и ссылка на интерактив' };
  const TTL = 'Приложение удвоило выручку после релиза в июне 2025';

  function buildVersus(box, api) {
    const { $, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Статика или интерактив <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="vs-reset">Сбросить</button></div></div>
<p class="hint vs-do">Выберите сценарий и&nbsp;решите, какую версию туда отправить. Левую можно трогать: наведение, щелчок и&nbsp;двойной щелчок по&nbsp;легенде, рамка мышью.</p>
<div class="tabs vs-tabs" id="vs-tabs" role="group" aria-label="Сценарий">${SCEN.map((c, i) => `<button type="button" data-sc="${i}" aria-pressed="false"><span class="vs-mk"></span>${c.name}</button>`).join('')}</div>
<p class="vs-sit" id="vs-sit"></p>
<div class="vs-duo">
 <div class="vs-pane" id="vs-live"><div class="vs-ph"><b>Интерактивная</b><span>HTML + plotly.js · ${FULL}&nbsp;МБ</span><em class="vs-badge" id="vs-b-live" hidden></em></div>
  <p class="vs-ttl">${TTL}</p>
  <div class="vs-lgd" id="vs-lgd" role="group" aria-label="Легенда: щелчок прячет канал, двойной щелчок оставляет только его">${CH.map((c, i) => `<button type="button" class="vs-li" data-li="${i}" aria-pressed="true"><i class="vs-sw vs-s${i}"></i>${c}</button>`).join('')}</div>
  <div class="vs-plot" id="vs-lplot"><svg class="vs-svg" id="vs-lsvg" tabindex="0" role="img" aria-label="Интерактивный график выручки пяти каналов. Стрелки влево и вправо двигают подсказку по месяцам, вверх и вниз — по каналам"></svg><div class="vs-tip" id="vs-tip" hidden></div></div>
  <div class="vs-zoom"><span class="seg" role="group" aria-label="Приближение"><button type="button" data-z="all" aria-pressed="true">24 мес.</button><button type="button" data-z="y25" aria-pressed="false">2025</button><button type="button" data-z="rel" aria-pressed="false">апр–авг 2025</button></span><span class="vs-zh">или обведите мышью · двойной щелчок — сброс</span></div>
 </div>
 <div class="vs-pane vs-still" id="vs-still"><div class="vs-ph"><b>Статичная</b><span>channels.png · ${SIZES.png_kb}&nbsp;КБ</span><em class="vs-badge" id="vs-b-still" hidden></em></div>
  <p class="vs-ttl">${TTL}</p>
  <div class="vs-plot" id="vs-splot"><svg class="vs-svg" id="vs-ssvg" role="img" aria-label="Статичный график: пять каналов с подписями на концах линий, отмечен релиз приложения в июне 2025"></svg><div class="vs-nope" id="vs-nope" hidden>Это картинка: подсказок, легенды и&nbsp;рамки нет</div></div>
  <p class="vs-cap">Подписи у&nbsp;линий вместо легенды, релиз отмечен на&nbsp;графике</p>
 </div>
</div>
<div class="vs-pick"><span class="vs-q" id="vs-q"></span><div class="wbtns" id="vs-opts">${OPTS.map(([k, t]) => `<button type="button" class="btn ghost small" data-op="${k}" aria-pressed="false">${t}</button>`).join('')}</div></div>
<div class="vs-verd" id="vs-verd" aria-live="polite"></div>
<div class="status"><span><span class="dot live"></span><span id="vs-st1"></span></span><span id="vs-st2"></span><span id="vs-st3"></span><span class="grow"></span><span id="vs-st4"></span></div>`;

    let st;
    const fresh = () => ({ sc: 0, pick: {}, vis: [true, true, true, true, true], xr: [0, N - 1], yr: R_ALL, hov: null, hovN: 0, tries: 0, drag: null, zoom: 'all' });
    const lsvg = $('vs-lsvg'), ssvg = $('vs-ssvg'), tip = $('vs-tip'), lplot = $('vs-lplot'), nope = $('vs-nope');
    let geoL = null;

    function frame(svgEl, W, H, xr, yr, opt) {
      const mob = W < 420, g = { l: mob ? 30 : 36, r: W - (opt.labels ? (mob ? 76 : 84) : 10), t: 8, b: H - 22, mob };
      const X = fi => g.l + (fi - xr[0]) / (xr[1] - xr[0]) * (g.r - g.l), Yv = v => g.b - (v - yr[0]) / (yr[1] - yr[0]) * (g.b - g.t);
      g.X = X; g.Y = Yv; g.xr = xr; g.yr = yr;
      let o = `<rect class="vs-bg" x="${g.l}" y="${g.t}" width="${f1(g.r - g.l)}" height="${f1(g.b - g.t)}"/>`;
      const yt = yTicks(yr[0], yr[1], 4);
      yt.out.forEach(v => { const y = Yv(v); if (y < g.t - .5 || y > g.b + .5) return; o += `<line class="vs-grid" x1="${g.l}" x2="${f1(g.r)}" y1="${f1(y)}" y2="${f1(y)}"/><text class="vs-tk" x="${g.l - 5}" y="${f1(y + 3.5)}" text-anchor="end">${tickLabel(v, yt.st)}</text>`; });
      const stp = xStep(xr[1] - xr[0], Math.max(2, Math.floor((g.r - g.l) / (mob ? 44 : 58))));
      for (let i = Math.ceil(xr[0] - 1e-9); i <= Math.floor(xr[1] + 1e-9); i++) { if (i % stp) continue; const x = X(i), edge = x > W - 20; o += `<line class="vs-grid" x1="${f1(x)}" x2="${f1(x)}" y1="${g.t}" y2="${f1(g.b)}"/><text class="vs-tk" x="${f1(edge ? W - 1 : x)}" y="${f1(g.b + 15)}" text-anchor="${edge ? 'end' : 'middle'}">${mTick(i, true)}</text>`; }
      const cid = svgEl.id + '-c';
      o += `<clipPath id="${cid}"><rect x="${g.l}" y="${g.t}" width="${f1(g.r - g.l)}" height="${f1(g.b - g.t)}"/></clipPath><g clip-path="url(#${cid})">`;
      opt.vis.forEach((on, si) => { if (on) o += `<polyline class="vs-ln vs-s${si}" points="${Y[si].map((y, i) => `${f1(X(i))},${f1(Yv(y))}`).join(' ')}"/>`; });
      o += '</g>';
      return { g, o };
    }

    function drawLive() {
      const W = lplot.clientWidth || 440, H = W < 420 ? 200 : 236;
      lsvg.setAttribute('viewBox', `0 0 ${W} ${H}`); lsvg.setAttribute('width', W); lsvg.setAttribute('height', H);
      const { g, o } = frame(lsvg, W, H, st.xr, st.yr, { vis: st.vis });
      geoL = g;
      let x = o;
      if (st.drag && Math.abs(st.drag.x1 - st.drag.x0) > 3) { const a = Math.min(st.drag.x0, st.drag.x1), b = Math.max(st.drag.x0, st.drag.x1); x += `<rect class="vs-shade" x="${g.l}" y="${g.t}" width="${f1(a - g.l)}" height="${f1(g.b - g.t)}"/><rect class="vs-shade" x="${f1(b)}" y="${g.t}" width="${f1(g.r - b)}" height="${f1(g.b - g.t)}"/><rect class="vs-box" x="${f1(a)}" y="${g.t}" width="${f1(b - a)}" height="${f1(g.b - g.t)}"/>`; }
      if (st.hov) { const { s: si, i } = st.hov; x += `<circle class="vs-dot vs-f${si}" cx="${f1(g.X(i))}" cy="${f1(g.Y(Y[si][i]))}" r="4.5"/>`; }
      lsvg.innerHTML = x;
      if (st.hov) {
        const { s: si, i } = st.hov;
        tip.innerHTML = `<b>${CH[si]}</b> · ${mName(i)}<br>${num(Y[si][i])} млн ₽ · ${pct(SH[si][i])} выручки месяца`;
        tip.className = `vs-tip vs-t${si}`; tip.hidden = false;
        const px = g.X(i), py = g.Y(Y[si][i]), tw = tip.offsetWidth, th = tip.offsetHeight;
        tip.style.left = `${f1(px + 12 + tw > W ? px - 12 - tw : px + 12)}px`; tip.style.top = `${f1(clamp(py - th / 2, 0, H - th))}px`;
      } else tip.hidden = true;
    }
    function drawStill() {
      const W = $('vs-splot').clientWidth || 440, H = W < 420 ? 200 : 236;
      ssvg.setAttribute('viewBox', `0 0 ${W} ${H}`); ssvg.setAttribute('width', W); ssvg.setAttribute('height', H);
      const { g, o } = frame(ssvg, W, H, [0, N - 1], R_ALL, { vis: ALL, labels: true });
      let x = o;
      // подписи на концах линий с разведением по высоте
      const ends = CH.map((c, si) => ({ si, y: g.Y(Y[si][N - 1]) })).sort((a, b) => a.y - b.y);
      for (let j = 1; j < ends.length; j++) if (ends[j].y - ends[j - 1].y < 12) ends[j].y = ends[j - 1].y + 12;
      ends.forEach(e => { x += `<text class="vs-dl vs-f${e.si}" x="${f1(g.r + 5)}" y="${f1(e.y + 3.5)}">${CH[e.si]}</text>`; });
      const ax = g.X(I_JUN), ay = g.Y(Y[2][I_JUN]);
      x += `<line class="vs-ann" x1="${f1(ax)}" y1="${f1(ay + 8)}" x2="${f1(ax)}" y2="${f1(g.b - 2)}"/><text class="vs-annt" x="${f1(ax - 4)}" y="${f1(g.b - 6)}" text-anchor="end">релиз</text>`;
      [[I_MAY, 'end', -5, 13], [I_JUL, 'end', -5, -6]].forEach(([i, a, dx, dy]) => { x += `<text class="vs-vl" x="${f1(g.X(i) + dx)}" y="${f1(g.Y(Y[2][i]) + dy)}" text-anchor="${a}">${num(Y[2][i], 1)}</text>`; });
      ssvg.innerHTML = x;
    }
    const recalcY = () => { const r = yRange(st.vis.map(v => (v ? 1 : 0)), st.xr[0], st.xr[1]); if (r) st.yr = r; };
    function setZoom(z) {
      st.zoom = z; st.xr = z === 'y25' ? [12, N - 1] : z === 'rel' ? [I_APR, I_AUG] : z === 'all' ? [0, N - 1] : st.xr;
      box.querySelectorAll('[data-z]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.z === z)));
      recalcY();
    }
    function hoverAt(i, si) {
      if (si == null || !st.vis[si]) return;
      const key = `${si}-${i}`; if (!st.hov || st.hov.key !== key) st.hovN++;
      st.hov = { s: si, i, key };
    }
    function nearest(ev) {
      const r = lsvg.getBoundingClientRect(), sx = (ev.clientX - r.left) * (lsvg.viewBox.baseVal.width / r.width), sy = (ev.clientY - r.top) * (lsvg.viewBox.baseVal.height / r.height);
      const g = geoL; if (!g || sx < g.l - 4 || sx > g.r + 4 || sy < g.t - 4 || sy > g.b + 4) return null;
      const fi = st.xr[0] + (sx - g.l) / (g.r - g.l) * (st.xr[1] - st.xr[0]), i = clamp(Math.round(fi), Math.ceil(st.xr[0] - 1e-9), Math.floor(st.xr[1] + 1e-9));
      let best = null, bd = Infinity; st.vis.forEach((on, si) => { if (!on) return; const d = Math.abs(g.Y(Y[si][i]) - sy); if (d < bd) { bd = d; best = si; } });
      return { i, si: best, sx };
    }
    function status() {
      const done = Object.keys(st.pick).length, best = Object.entries(st.pick).filter(([i, o]) => SCEN[i].v[o][0] === 'good').length;
      $('vs-st1').textContent = `Решено: ${done} из 5 · лучших: ${best}`;
      $('vs-st2').textContent = `Подсказок: ${st.hovN}`;
      $('vs-st3').textContent = `Серий: ${st.vis.filter(Boolean).length} из 5 · месяцев: ${Math.round(st.xr[1] - st.xr[0]) + 1}`;
      $('vs-st4').textContent = `Картинку трогали: ${st.tries} ${plural(st.tries, ['раз', 'раза', 'раз'])}`;
    }
    function scenario() {
      const c = SCEN[st.sc], pk = st.pick[st.sc];
      box.querySelectorAll('[data-sc]').forEach((b, i) => { b.setAttribute('aria-pressed', String(i === st.sc)); b.querySelector('.vs-mk').textContent = st.pick[i] ? (SCEN[i].v[st.pick[i]][0] === 'good' ? '✓' : '•') : ''; });
      $('vs-sit').innerHTML = `<b>${c.name}.</b> ${c.sit}`;
      $('vs-q').textContent = `Что отправить: «${c.name}»?`;
      box.querySelectorAll('[data-op]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.op === pk)));
      const vd = $('vs-verd');
      if (!pk) { vd.className = 'vs-verd'; vd.innerHTML = '<p>Выберите версию — страница ответит, а&nbsp;если не&nbsp;согласна, поспорит.</p>'; }
      else {
        const [kind, text] = c.v[pk], best = BEST[c.rec];
        vd.className = `vs-verd vs-${kind}`;
        vd.innerHTML = `<p><b>${VERD[kind]}.</b> ${text}${kind !== 'good' ? ` <span class="vs-best">Лучший выбор здесь — ${best}.</span>` : ''}</p>`;
      }
      ['live', 'still'].forEach(k => { const el = $(`vs-b-${k}`), b = c.badge[k]; el.hidden = !pk; if (pk) { el.textContent = b[1]; el.className = `vs-badge vs-${b[0]}`; } });
      status();
    }
    function redraw() { drawLive(); drawStill(); status(); }

    // легенда: щелчок прячет, двойной щелчок оставляет одну (два щелчка перед dblclick гасят друг друга)
    const lgd = $('vs-lgd');
    lgd.addEventListener('click', e => { const b = e.target.closest('[data-li]'); if (!b) return; const i = +b.dataset.li; st.vis[i] = !st.vis[i]; if (st.hov && !st.vis[st.hov.s]) st.hov = null; syncLg(); recalcY(); redraw(); });
    lgd.addEventListener('dblclick', e => { const b = e.target.closest('[data-li]'); if (!b) return; const i = +b.dataset.li; const only = st.vis.every((v, j) => v === (j === i)); st.vis = st.vis.map((v, j) => only || j === i); if (st.hov && !st.vis[st.hov.s]) st.hov = null; syncLg(); recalcY(); redraw(); });
    const syncLg = () => lgd.querySelectorAll('[data-li]').forEach((b, i) => b.setAttribute('aria-pressed', String(st.vis[i])));
    // наведение и рамка
    lsvg.addEventListener('pointermove', e => {
      if (st.drag) { const r = lsvg.getBoundingClientRect(); st.drag.x1 = clamp((e.clientX - r.left) * (lsvg.viewBox.baseVal.width / r.width), geoL.l, geoL.r); drawLive(); return; }
      const n = nearest(e); if (!n) { if (st.hov) { st.hov = null; drawLive(); } return; }
      hoverAt(n.i, n.si); drawLive(); status();
    });
    lsvg.addEventListener('pointerleave', () => { if (!st.drag && st.hov) { st.hov = null; drawLive(); } });
    lsvg.addEventListener('pointerdown', e => {
      const n = nearest(e); if (!n) return;
      if (e.pointerType === 'mouse') { st.drag = { x0: n.sx, x1: n.sx }; lsvg.setPointerCapture(e.pointerId); st.hov = null; }
      else { hoverAt(n.i, n.si); drawLive(); status(); }
    });
    // двойной щелчок по полю — сброс масштаба; ловим его сами по двум отпусканиям, потому что SVG перерисовывается
    let lastUp = 0;
    lsvg.addEventListener('pointerup', e => {
      if (!st.drag) return;
      const g = geoL, d = st.drag; st.drag = null;
      if (Math.abs(d.x1 - d.x0) > 8) {
        const toI = sx => st.xr[0] + (sx - g.l) / (g.r - g.l) * (st.xr[1] - st.xr[0]);
        let a = Math.floor(toI(Math.min(d.x0, d.x1)) + .5), b = Math.ceil(toI(Math.max(d.x0, d.x1)) - .5);
        if (b - a < 1) b = a + 1;
        st.xr = [clamp(a, 0, N - 2), clamp(b, 1, N - 1)]; setZoom('box'); lastUp = 0; redraw();
      } else if (e.timeStamp - lastUp < 400) { lastUp = 0; setZoom('all'); redraw(); }
      else { lastUp = e.timeStamp; const n = nearest(e); if (n) { hoverAt(n.i, n.si); drawLive(); status(); } }
    });
    lsvg.addEventListener('keydown', e => {
      const visI = st.vis.map((v, i) => (v ? i : -1)).filter(i => i >= 0); if (!visI.length) return;
      let { s: si, i } = st.hov || { s: visI.includes(2) ? 2 : visI[0], i: Math.round(st.xr[1]) };
      const lo = Math.ceil(st.xr[0] - 1e-9), hi = Math.floor(st.xr[1] + 1e-9);
      if (e.key === 'ArrowLeft') i = clamp(i - 1, lo, hi); else if (e.key === 'ArrowRight') i = clamp(i + 1, lo, hi);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { const order = visI.slice().sort((a, b) => Y[b][i] - Y[a][i]); const k = order.indexOf(si); si = order[clamp(k + (e.key === 'ArrowUp' ? -1 : 1), 0, order.length - 1)]; }
      else if (e.key === 'Escape') { st.hov = null; drawLive(); return; } else return;
      e.preventDefault(); hoverAt(i, si); drawLive(); status();
    });
    lsvg.addEventListener('blur', () => { if (st.hov) { st.hov = null; drawLive(); } });
    box.querySelectorAll('[data-z]').forEach(b => b.addEventListener('click', () => { setZoom(b.dataset.z); redraw(); }));
    // картинка не отвечает
    const sp = $('vs-splot'); let nopeT = 0;
    const poke = count => { nope.hidden = false; clearTimeout(nopeT); nopeT = setTimeout(() => { nope.hidden = true; }, 1600); if (count) { st.tries++; status(); } };
    sp.addEventListener('pointerdown', () => poke(true));
    sp.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') poke(false); });
    // сценарии и выбор
    box.querySelectorAll('[data-sc]').forEach(b => b.addEventListener('click', () => { st.sc = +b.dataset.sc; scenario(); }));
    box.querySelectorAll('[data-op]').forEach(b => b.addEventListener('click', () => { st.pick[st.sc] = b.dataset.op; scenario(); }));
    $('vs-reset').addEventListener('click', () => { st = fresh(); syncLg(); setZoom('all'); scenario(); redraw(); });
    if ('ResizeObserver' in window) { let rw = 0; new ResizeObserver(() => { const w = lplot.clientWidth; if (w !== rw) { rw = w; redraw(); } }).observe(lplot); }
    st = fresh(); scenario(); redraw();
    return {
      redraw,
      describe() {
        const picks = Object.entries(st.pick).map(([i, o]) => `${SCEN[i].name} — ${OPTS.find(x => x[0] === o)[1].toLowerCase()} (${VERD[SCEN[i].v[o][0]].toLowerCase()})`).join('; ');
        return `сценарий на экране: «${SCEN[st.sc].name}»; выборы: ${picks || 'пока нет'}; на интерактивном графике видно серий ${st.vis.filter(Boolean).length} из 5 (${CH.filter((c, i) => st.vis[i]).join(', ')}), месяцы ${M[Math.round(st.xr[0])]} — ${M[Math.round(st.xr[1])]}; подсказок открыто ${st.hovN}; статичную картинку пытались трогать ${st.tries} раз.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-8-3',
    short: 'DA-08',
    title: 'Интерактив в Plotly',
    where: 'блок «Дата аналитика», тема 08 «Визуализация в Python», страница 8.3',
    aiData: 'учебная выручка интернет-магазина по месяцам 2024–2025 и пяти крупнейшим каналам (sales_monthly.csv, длинный формат); у приложения после релиза в июне 2025 выручка выросла с 2,98 до 5,91 млн ₽ в месяц',
    scene,
    widgets: { versus: buildVersus },
    code: CODE,
    questions: {
    q1: { sec: 'versus', title: 'Сначала предскажите', q: 'Из пяти сценариев — письмо директору, дашборд, статья, ноутбук, печать — где интерактивная версия графика однозначно лучше картинки?', opts: [['В письме директору: он сможет сам найти нужную цифру'], ['В дашборде, куда менеджеры возвращаются со своими вопросами', 1], ['В печатном отчёте: подсказки сохранятся в PDF'], ['Везде: интерактив никогда не хуже картинки']],
      why: 'Интерактив окупается, когда у читателя свой вопрос и браузер выполняет JavaScript, — так в дашборде. Почта JavaScript не выполняет, в PDF и на бумаге подсказок нет, а «никогда не хуже» опровергает любое совещание: там никто не наводит курсор. Остальные сценарии разберите в интерактиве.' },
    q2: { sec: 'idea', q: 'В сцене у графика спрятали сайт и приблизили лето 2025, потом сохранили его через write_image и вставили в письмо. Что увидит директор?', opts: [['Приближённое лето и одно приложение — как было на экране'], ['Исходный график: пять линий за два года и никаких подсказок', 1], ['Тот же интерактивный график, если открыть письмо в браузере'], ['Пустую рамку: картинке нужен plotly.js']],
      why: 'write_image рисует фигуру из Python, а скрытия и рамка жили только в браузере: Python о них не знает. Картинка — готовые пиксели или SVG, код в ней не выполняется, поэтому подсказок нет ни в одном почтовом клиенте, а plotly.js ей не нужен.' },
    q3: { sec: 'idea', q: 'Когда интерактив скорее вредит, чем помогает?', opts: [['В ноутбуке, где вы ищете, что случилось с каналами'], ['На слайде для совещания: вывод спрятан в подсказках, а курсор никто не наводит', 1], ['В дашборде, куда каждый приходит за своим каналом'], ['В статье в вики с интерактивом и выводом в заголовке']],
      why: 'На совещании график листает докладчик, и всё, что лежит в подсказках, для зала не существует. В ноутбуке и дашборде интерактив отвечает на вопросы читателя, а статья с выводом в заголовке не теряет главного, даже если никто не наведёт курсор.' },
    q4: { sec: 'idea', q: 'Чем plotly.express отличается от graph_objects?', opts: [['px рисует картинку, а go — интерактивный график'], ['px одной функцией собирает go.Figure из таблицы, а go — те же части фигуры вручную; фигуру px можно дальше править методами go', 1], ['px работает только в Jupyter, а go — везде'], ['go быстрее рисует большие данные, поэтому для них px не годится']],
      why: 'По документации Plotly функции px построены поверх graph_objects и возвращают go.Figure. Поэтому начинают с px, а дошлифовывают через update_traces и update_layout; с нуля в go собирают то, что px неудобно: разные типы трасс, две оси, подграфики разных видов. Интерактивны обе, работают везде, а переход на WebGL для больших данных px делает сам.' },
    q5: { sec: 'idea', q: 'Почему plotly.express удобнее всего давать длинную таблицу?', opts: [['Широкую таблицу Plotly прочитать не может'], ['Аргументы px — имена столбцов: чтобы раскрасить по каналу или анимировать по месяцу, канал и месяц должны быть столбцами', 1], ['Длинная таблица занимает меньше памяти'], ['plotly.js в браузере принимает только длинный формат']],
      why: 'color, facet_col и animation_frame получают имя столбца. Широкую таблицу px принимает, но сам переводит её в длинную через melt и называет столбцы variable и value. Памяти длинная таблица обычно занимает больше, а в браузер уходят уже трассы, а не таблица.' },
    q6: { sec: 'code', q: 'Коллега открыл этот файл в самолёте без интернета. Что он увидит?', code: 'fig.write_html("report.html", include_plotlyjs="cdn")', lang: 'python', opts: [['Интерактивный график: всё нужное лежит в файле'], ['Пустое место: данные в файле есть, а библиотеку скачать неоткуда', 1], ['Статичную картинку вместо интерактива'], ['Таблицу с данными вместо графика']],
      why: 'С "cdn" в файле лежат только данные фигуры и ссылка на plotly.js на сервере CDN. Без сети библиотека не загрузится, и рисовать график нечем, а запасной картинки или таблицы write_html не добавляет. Работает без интернета include_plotlyjs=True — ценой нескольких мегабайт.' },
    q7: { sec: 'code', q: 'В анимации по месяцам не задали range_y. Что не так?', code: 'px.bar(by_ch, x="channel", y="mln", animation_frame="month")', lang: 'python', opts: [['Ничего: plotly.js держит одну шкалу на все кадры'], ['Шкала может меняться от кадра к кадру, и одна и та же высота столбика будет значить разные деньги', 1], ['px откажется строить анимацию'], ['Анимация не попадёт в HTML-файл']],
      why: `Без range_y диапазон оси в фигуре не записан, и plotly.js подбирает его сам: в проверке страницы при проигрывании верх оси сдвинулся с ${(SIZES.anim || ['?', '?'])[0]} до ${(SIZES.anim || ['?', '?'])[1]} млн ₽. Сравнивать кадры по высоте тогда нельзя. Анимацию px строит и без range_y, и в HTML она попадает; документация просто советует всегда фиксировать диапазоны.` }
    },
    glossary: {
      figure: { t: 'Фигура Plotly', en: 'figure, go.Figure', d: 'Описание графика: словарь с ключами data (трассы), layout (оформление) и frames (кадры анимации). В браузер уходит как JSON.' },
      json: { t: 'JSON', en: 'JavaScript Object Notation', d: 'Текстовый формат обмена данными: словари, списки, строки и числа. Словарь Python переводится в него одной функцией.' },
      trace: { t: 'Трасса', en: 'trace', d: 'Одна серия фигуры Plotly: тип (scatter, bar…), имя для легенды и массивы данных. Пять каналов на линейном графике — пять трасс.' },
      plotlyjs: { t: 'plotly.js', en: 'plotly.js', d: 'Библиотека на JavaScript, которая рисует фигуры Plotly в браузере и отвечает за подсказки, легенду и масштаб.' },
      js: { t: 'JavaScript', en: 'JavaScript', d: 'Язык программирования, который выполняют браузеры. Почтовые программы, PDF и бумага его не выполняют.' },
      px: { t: 'plotly.express', en: 'Plotly Express, px', d: 'Модуль, который одной функцией строит фигуру из таблицы: аргументы — имена столбцов. Возвращает go.Figure.' },
      go: { t: 'graph_objects', en: 'plotly.graph_objects, go', d: 'Классы частей фигуры: Figure, Scatter, Bar и другие. На них построен px; через них правят любые атрибуты.' },
      longfmt: { t: 'Длинный формат', en: 'long format, tidy data', d: 'Таблица, где строка — одно наблюдение, а столбец — одна переменная. Из широкой её получают методом melt (2.4).' },
      tooltip: { t: 'Подсказка', en: 'tooltip, hover label', d: 'Окно со значениями у точки под курсором или пальцем. Видна только тому, кто навёл.' },
      hovertemplate: { t: 'hovertemplate', en: 'hover template', d: 'Шаблон текста подсказки: %{x}, %{y}, %{customdata[0]} и форматы чисел, например %{y:.2f}.' },
      customdata: { t: 'custom_data', en: 'custom_data, customdata', d: 'Дополнительные столбцы, которые трасса несёт только для подсказки: месяц словами, доля и т. п.' },
      modebar: { t: 'Панель инструментов', en: 'modebar', d: 'Строка значков над графиком Plotly: рамка, сдвиг, сброс масштаба, снимок в PNG.' },
      frame: { t: 'Кадр анимации', en: 'animation frame', d: 'Состояние фигуры для одного значения столбца animation_frame. Кадры переключают кнопки ▶ и ◼ и ползунок.' },
      standalone: { t: 'Самодостаточный HTML', en: 'self-contained HTML', d: 'Один файл, который открывается в браузере без Python, сервера и интернета: данные и библиотека внутри.' },
      includejs: { t: 'include_plotlyjs', en: 'include_plotlyjs', d: 'Параметр write_html: True кладёт plotly.js в файл, "cdn" — ссылку на сервер с библиотекой, False — ничего.' },
      cdn: { t: 'CDN', en: 'content delivery network', d: 'Сеть серверов, откуда браузер скачивает общие библиотеки. Без интернета ссылка на CDN не работает.' },
      kaleido: { t: 'Kaleido', en: 'Kaleido', d: 'Пакет для статичного экспорта фигур Plotly в PNG, SVG и PDF. С версии 1.0 рисует через установленный Chrome.' },
      webgl: { t: 'WebGL', en: 'WebGL', d: 'Способ рисовать в браузере через видеокарту. px включает его для больших наборов точек: трасса scattergl.' },
      actiontitle: { t: 'Заголовок-вывод', en: 'action title', d: 'Заголовок графика, который говорит вывод, а не называет оси: «Приложение удвоило выручку после релиза».' },
      alttext: { t: 'Текстовая альтернатива', en: 'text alternative, alt text', d: 'Описание графика словами или таблицей для тех, кто не видит картинку или не может навести курсор.' },
      dash: { t: 'Dash', en: 'Dash', d: 'Фреймворк от авторов Plotly для веб-приложений на Python: графики Plotly плюс фильтры и кнопки.' },
      streamlit: { t: 'Streamlit', en: 'Streamlit', d: 'Фреймворк, в котором страница с графиками и виджетами пишется как обычный скрипт Python.' }
    },
    materials: [
      ['da-8-3-plotly.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/viz/', 'Учебные данные темы 08 — общий набор: выручка sales_monthly.csv по месяцам, каналам и странам'],
      ['plotly_channels.ipynb', 'Ноутбук с блоками кода страницы: px, подсказка, анимация, экспорт и нюансы']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне пять вопросов по источнику о том, чем фигура Plotly отличается от картинки, как устроены plotly.express и graph_objects и когда интерактив мешает. По одному за раз; после ответа объясни ошибку со ссылкой на текст.'],
      ['Разбор моего графика', 'Я опишу график и где его будут смотреть: письмо, дашборд, слайд, печать или ноутбук. Помоги по правилам из источника решить, нужен ли интерактив, что вынести в заголовок и как экспортировать. Не решай за меня: задавай уточняющие вопросы.'],
      ['Подсказка по-русски', 'Помоги написать hovertemplate для моего графика. Сначала спроси, какие столбцы у таблицы и что читатель должен увидеть при наведении, потом предложи шаблон и объясни каждый %{…} по источнику.']
    ]
  };
})();
