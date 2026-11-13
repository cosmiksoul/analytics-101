/* Страница 8.4 · График как аргумент: заголовок-вывод, аннотации, антипаттерны */
(() => {
  // Ряды и проверки посчитаны pandas 3.0.5 по data/viz/sales_monthly.csv в data/gen_page.py (млн ₽, %)
  /*data:start*/const DATA = {"months":["2024-01","2024-02","2024-03","2024-04","2024-05","2024-06","2024-07","2024-08","2024-09","2024-10","2024-11","2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10","2025-11","2025-12"],"ch":["кешбэк-сервисы","колл-центр","маркетплейс","офлайн-точки","партнёры","поиск","приложение","рассылка","сайт","соцсети"],"rev":{"кешбэк-сервисы":[1.11,1.1,0.99,0.93,0.88,0.87,0.92,0.94,1.08,1.11,1.12,1.22,1.18,1.09,1.06,1.0,0.9,0.89,0.91,1.02,1.06,1.06,1.2,1.26],"колл-центр":[0.86,0.82,0.75,0.72,0.7,0.66,0.65,0.65,0.69,0.74,0.74,0.76,0.73,0.65,0.62,0.59,0.54,0.55,0.51,0.52,0.56,0.55,0.57,0.58],"маркетплейс":[7.47,6.77,6.42,6.14,5.86,5.47,5.97,6.24,6.34,7.03,7.32,6.87,7.09,6.66,6.69,6.09,6.03,5.73,5.71,6.2,6.43,6.91,7.03,7.17],"офлайн-точки":[1.3,1.34,1.24,1.13,1.12,1.08,1.14,1.2,1.27,1.4,1.4,1.43,1.36,1.4,1.27,1.24,1.23,1.13,1.2,1.23,1.29,1.42,1.47,1.47],"партнёры":[1.62,1.61,1.49,1.45,1.43,1.33,1.44,1.5,1.57,1.73,1.76,1.75,1.76,1.77,1.55,1.55,1.49,1.54,1.5,1.56,1.75,1.85,1.97,1.92],"поиск":[4.37,4.29,4.12,3.85,3.69,3.79,3.77,4.09,4.5,4.24,4.58,4.91,4.53,4.48,4.59,3.97,3.72,3.96,4.17,4.22,4.62,4.93,4.91,5.35],"приложение":[3.36,3.16,2.94,2.99,2.84,2.83,2.9,3.01,3.29,3.48,3.54,3.65,3.68,3.46,3.23,3.09,2.98,4.49,5.91,6.14,6.72,7.69,7.6,8.03],"рассылка":[2.39,2.36,2.37,2.2,2.1,2.01,2.05,2.11,2.37,2.59,2.68,2.56,2.75,2.71,2.57,2.37,2.25,2.29,2.3,2.43,2.54,2.74,2.97,3.11],"сайт":[10.27,9.76,8.8,8.58,8.14,7.68,8.08,8.58,9.32,9.79,10.12,10.1,10.45,9.85,9.53,8.97,8.77,8.07,8.47,8.85,9.68,10.25,10.59,10.73],"соцсети":[1.95,1.97,1.8,1.73,1.59,1.54,1.58,1.68,1.74,1.84,1.94,1.99,1.99,2.01,1.8,1.72,1.57,1.55,1.63,1.72,1.83,1.9,1.99,2.13]},"tab10":["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"],"tab10d":["#456cb3","#c4ae05","#968838","#8b7c1f","#5d7bbb","#6f684a","#99a3bf","#7f7f7f","#ceb932","#96a5cf"],"check":{"may25":2.98,"jun25":4.49,"jul25":5.91,"x25":1.98,"may24":2.84,"jul24":2.9,"x24":1.02,"oth":[0.94,1.12],"yoy":2.04},"share":[3.0,1.7,18.7,3.8,4.8,12.8,15.1,7.4,27.4,5.2],"rev25":[12.6,7.0,77.7,15.7,20.2,53.4,63.0,31.0,114.2,21.8],"q25":[102.49,90.27,102.7,121.33],"cc":[0.86,0.82,0.75,0.72,0.7,0.66,0.65,0.65,0.69,0.74,0.74,0.76,0.73,0.65,0.62,0.59,0.54,0.55,0.51,0.52,0.56,0.55,0.57,0.58],"heat":{"rows":["кешбэк-сервисы","колл-центр","маркетплейс","офлайн-точки","партнёры","поиск","приложение","рассылка","сайт","соцсети"],"cols":["BY","RU","KZ","UZ"],"g":[[4.9,0.6,1.0,5.3],[-20.5,-19.8,-19.5,-20.2],[-0.6,0.1,0.5,-1.1],[4.7,3.9,7.0,1.6],[7.8,7.6,11.6,5.1],[4.4,6.7,8.8,8.7],[70.1,62.3,63.9,67.0],[13.7,9.8,10.9,12.2],[6.1,3.1,3.8,5.2],[2.5,3.3,1.0,-0.2]],"jet":[["#009cff","#006cff","#0070ff","#00a0ff"],["#000080","#000084","#000089","#000080"],["#0060ff","#0068ff","#006cff","#0058ff"],["#009cff","#0094ff","#00b4ff","#0078ff"],["#00bcff","#00bcff","#02e8f4","#00a0ff"],["#0098ff","#00b0ff","#00c8ff","#00c8ff"],["#800000","#e40000","#cd0000","#a40000"],["#16ffe1","#00d4ff","#00e0fb","#09f0ee"],["#00acff","#0088ff","#0090ff","#00a0ff"],["#0084ff","#008cff","#0070ff","#0064ff"]],"seq":[["#aed1e7","#bcd7eb","#bad6eb","#aed1e7"],["#e7f1fa","#e6f0f9","#e5eff9","#e7f0fa"],["#bfd8ed","#bdd7ec","#bcd7eb","#c1d9ed"],["#afd1e7","#b2d2e8","#a8cee4","#b9d6ea"],["#a5cde3","#a6cee4","#99c7e0","#aed1e7"],["#b0d2e7","#a9cfe5","#a3cce3","#a3cce3"],["#083c7d","#08519c","#084d96","#08458a"],["#91c3de","#a0cbe2","#9cc9e1","#97c6df"],["#abd0e6","#b4d3e9","#b2d2e8","#aed1e7"],["#b5d4e9","#b4d3e9","#bad6eb","#bed8ec"]],"jetInk":[[0,1,1,0],[1,1,1,1],[1,1,1,1],[0,0,0,1],[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,1,1]],"seqInk":[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]],"jetBar":["#000080","#0000ff","#0080ff","#16ffe1","#7dff7a","#e4ff13","#ff9400","#ff1e00","#800000"],"seqBar":["#e7f1fa","#d2e3f3","#b7d4ea","#91c3de","#66abd4","#4292c6","#2575b7","#0e59a2","#083c7d"],"disc":{"jet":18,"seq":0,"jetD":17,"seqD":0}},"pal":{"tab10":4,"tab4":1,"tab2":0,"ga":0,"jet":0,"seq":2},"titles":{"top2":46.1,"q43":18.1,"ccBefore":-37.4,"appGrowth":[62.3,70.1],"top4":74.0},"find":{"years":[379.2,416.8],"appShare":[9.7,9.5,9.5,10.0,10.0,10.4,10.2,10.0,10.2,10.3,10.1,10.3,10.4,10.2,9.8,10.1,10.1,14.9,18.3,18.1,18.4,19.6,18.9,19.2],"countries":[150.8,140.7,79.3,46.0],"site":[10.27,9.76,8.8,8.58,8.14,7.68,8.08,8.58,9.32,9.79,10.12,10.1,10.45,9.85,9.53,8.97,8.77,8.07,8.47,8.85,9.68,10.25,10.59,10.73],"by":[1.32,1.24,1.16,1.2,1.1,1.68,2.23,2.21,2.38,2.78,2.76,2.96],"uz":[0.38,0.38,0.38,0.33,0.33,0.45,0.65,0.71,0.79,0.86,0.77,0.86],"win25":21.3,"win24":17.8,"yoyDec":6.3,"ratioBYUZ":3.3}};/*data:end*/
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => (t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
  const lerp = (a, b, t) => a + (b - a) * t;
  const X = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const nf = (v, d = 1) => Number(v).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });
  const f1 = n => (Math.round(n * 10) / 10).toString();
  const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mixC = (a, b, t) => { const A = hex2(a), B = hex2(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join(''); };
  const tw = (s, fs, k = .56) => s.length * fs * k;
  const wrap = (s, maxW, fs, k) => { const out = []; let cur = ''; s.split(' ').forEach(w => { const t = cur ? cur + ' ' + w : w; if (cur && tw(t, fs, k) > maxW) { out.push(cur); cur = w; } else cur = t; }); if (cur) out.push(cur); return out; };
  const niceStep = x => { const e = 10 ** Math.floor(Math.log10(x)), f = x / e; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * e; };
  const ticks = (lo, hi, n = 5) => { const s = niceStep((hi - lo) / n), t = []; for (let v = Math.ceil(lo / s - 1e-9) * s; v <= hi + 1e-9; v += s) t.push(Math.round(v * 1e6) / 1e6 + 0); return t; };
  const lieF = (a, b, base) => ((b - base) / (a - base) - 1) / (b / a - 1); // фактор лжи Тафти для пары значений a → b

  /* ---------- SVG-кирпичики ---------- */
  const T = (x, y, s, o = {}) => `<text x="${f1(x)}" y="${f1(y)}"${o.a ? ` text-anchor="${o.a}"` : ''} style="font-size:${o.fs || 11}px;fill:${o.c || 'var(--ink)'}${o.w ? ';font-weight:' + o.w : ''}${o.op != null ? ';opacity:' + o.op.toFixed(2) : ''}">${X(s)}</text>`;
  const Ln = (x1, y1, x2, y2, c, w = 1, ex = '') => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" style="stroke:${c};stroke-width:${w}${ex}"/>`;
  const Pl = (pts, c, w = 1.5, ex = '') => `<polyline points="${pts.map(q => f1(q[0]) + ',' + f1(q[1])).join(' ')}" style="fill:none;stroke:${c};stroke-width:${w};stroke-linejoin:round;stroke-linecap:round${ex}"/>`;
  const Rc = (x, y, w, h, fill, ex = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0, w))}" height="${f1(Math.max(0, h))}" style="fill:${fill}${ex}"/>`;
  const Ci = (x, y, r, fill, ex = '') => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" style="fill:${fill}${ex}"/>`;
  const svgOpen = (W, H, label) => `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${X(label)}">`;

  const N = DATA.months.length, CH = DATA.ch, APP = CH.indexOf('приложение'), MI = m => DATA.months.indexOf(m);
  const TITLE = 'Выручка приложения удвоилась после релиза в июне';
  const C = DATA.check;

  /* ===================== Сцена: десять линий за пять правок ===================== */
  const SC = { paper: '#fbfaf7', ink: '#1d2433', ink2: '#4a5263', mut: '#8a92a3', grid0: '#cdd2db', grid1: '#eceef2', frame: '#5b6272', grey: '#c3c8d1', acc: '#0072B2', badge: '#e69f00' };
  function sceneState(k, p) {
    const e = (a, b) => ease(seg(p, a, b));
    const s = { sim: 0, grey: 0, acc: 0, leg: 1, lab: 0, ann: 0, chk1: 0, chk2: 0, oldT: 1, title: 0, sub: 0, badges: 0, call: p >= .55 ? k : -1 };
    if (k === 1) s.sim = e(.12, .5);
    if (k >= 2) s.grey = k === 2 ? e(.1, .55) : 1;
    if (k >= 3) s.acc = k === 3 ? e(.1, .5) : 1;
    if (k >= 4) { s.leg = k === 4 ? 1 - e(.05, .4) : 0; s.lab = k === 4 ? e(.4, .8) : 1; }
    if (k >= 5) s.ann = k === 5 ? e(.1, .45) : 1;
    if (k === 6) s.chk1 = e(.1, .45);
    if (k === 7) { s.chk1 = 1; s.chk2 = e(.1, .45); }
    if (k === 8) { s.chk1 = s.chk2 = 1 - e(0, .2); s.oldT = 1 - seg(p, .05, .15); s.title = seg(p, .15, .6); s.sub = e(.6, .85); }
    if (k === 9) { s.oldT = 0; s.title = 1; s.sub = 1; s.badges = e(.15, .5); }
    return s;
  }
  function drawScene(W, H, st) {
    const nar = W < 520, fs = nar ? 10 : 11, t = 1 - st.leg;
    const tfs = nar ? 14 : 16, tl = wrap(TITLE, W - 28, tfs, .6);
    const top = nar ? 34 + tl.length * 17 : 60, left = nar ? 34 : 44;
    const right = nar ? lerp(14, 82, t) : lerp(132, 118, t), bottom = 36 + (nar ? lerp(78, 0, t) : 0);
    const x0 = left, x1 = W - right, y0 = top, y1 = H - bottom, YM = 11.5;
    const xs = i => x0 + (x1 - x0) * i / (N - 1), ys = v => y1 - (y1 - y0) * v / YM;
    const g = st.grey, calls = [];
    let h = svgOpen(W, H, 'График выручки по каналам') + Rc(0, 0, W, H, SC.paper);
    // сетка и рамка: в начале тяжёлые, после первой правки — бледные
    const gc = mixC(SC.grid0, SC.grid1, g);
    [0, 2, 4, 6, 8, 10].forEach(v => {
      h += Ln(x0, ys(v), x1, ys(v), gc, 1);
      h += T(x0 - 6, ys(v) + 3.5, st.sub > .5 ? String(v) : (v / 10).toFixed(1), { fs, a: 'end', c: SC.ink2 });
    });
    if (st.sub <= .5) h += T(x0, y0 - 6, '1e7', { fs, c: SC.ink2 });
    [0, 6, 12, 18].forEach(i => {
      if (g < 1) h += Ln(xs(i), y0, xs(i), y1, SC.grid0, 1, `;opacity:${(1 - g).toFixed(2)}`);
      h += Ln(xs(i), y1, xs(i), y1 + 4, SC.ink2, 1) + T(xs(i), y1 + 16, DATA.months[i], { fs, a: 'middle', c: SC.ink2 });
    });
    const fc = mixC(SC.frame, '#9aa1ae', g);
    h += Ln(x0, y0, x0, y1, fc) + Ln(x0, y1, x1, y1, fc);
    if (g < 1) h += `<g style="opacity:${(1 - g).toFixed(2)}">${Ln(x0, y0, x1, y0, SC.frame)}${Ln(x1, y0, x1, y1, SC.frame)}</g>`;
    // линии каналов: акцентная рисуется последней
    const col = i => {
      let c = st.sim ? mixC(DATA.tab10[i], DATA.tab10d[i], st.sim) : DATA.tab10[i];
      c = mixC(c, SC.grey, g);
      return i === APP ? mixC(c, SC.acc, st.acc) : c;
    };
    const pts = i => DATA.rev[CH[i]].map((v, j) => [xs(j), ys(v)]);
    CH.forEach((c, i) => { if (i !== APP) h += Pl(pts(i), col(i), lerp(1.6, 1.15, g)); });
    h += Pl(pts(APP), col(APP), lerp(lerp(1.6, 1.15, g), 2.8, st.acc));
    // аннотация события
    const xr = xs(MI('2025-06'));
    if (st.ann) h += `<g style="opacity:${st.ann.toFixed(2)}">${Ln(xr, y0, xr, y1, SC.mut, 1, ';stroke-dasharray:4 3')}${T(xr - 5, y0 + 11, 'релиз приложения', { fs, a: 'end', c: SC.ink2 })}</g>`;
    // проверка числами: май и июль 2025, тот же отрезок 2024
    const mark = (a, b, c, op) => { const A = [xs(MI(a)), ys(DATA.rev['приложение'][MI(a)])], B = [xs(MI(b)), ys(DATA.rev['приложение'][MI(b)])]; return `<g style="opacity:${op.toFixed(2)}">${Ln(A[0], A[1], B[0], B[1], c, 1.2, ';stroke-dasharray:3 3')}${Ci(A[0], A[1], 4.5, '#fff', `;stroke:${c};stroke-width:2`)}${Ci(B[0], B[1], 4.5, '#fff', `;stroke:${c};stroke-width:2`)}</g>`; };
    if (st.chk1) h += mark('2025-05', '2025-07', SC.badge, st.chk1);
    if (st.chk2) h += mark('2024-05', '2024-07', SC.badge, st.chk2);
    // легенда (до правки 3) и прямые подписи (после)
    const legR = nar ? 14 : 17;
    if (st.leg > 0) {
      let lg = '';
      if (nar) CH.forEach((c, i) => { const cx = x0 + (i % 2) * (W - x0 - 10) / 2, cy = y1 + 32 + Math.floor(i / 2) * legR; lg += Ln(cx, cy - 3.5, cx + 14, cy - 3.5, col(i), 2.4) + T(cx + 19, cy, c, { fs: 9.5, c: SC.ink2 }); });
      else {
        lg += Rc(W - 126, y0, 118, CH.length * legR + 10, '#fff', ';stroke:#d6dae1;stroke-width:1');
        CH.forEach((c, i) => { const cy = y0 + 17 + i * legR; lg += Ln(W - 118, cy - 3.5, W - 100, cy - 3.5, col(i), 2.4) + T(W - 94, cy, c, { fs: 10.5, c: SC.ink2 }); });
      }
      h += `<g style="opacity:${st.leg.toFixed(2)}">${lg}</g>`;
    }
    const last = n => DATA.rev[n][N - 1];
    const labs = [['сайт', last('сайт')], ['приложение', last('приложение')], ['маркетплейс', last('маркетплейс')], ['поиск', last('поиск')], [nar ? 'ещё 6' : 'ещё 6 каналов', 1.75]]
      .map(([n, v]) => ({ n, y: ys(v) + 3.5 })).sort((a, b) => b.y - a.y);
    for (let i = 1; i < labs.length; i++) labs[i].y = Math.min(labs[i].y, labs[i - 1].y - fs - 3);
    if (st.lab > 0) h += `<g style="opacity:${st.lab.toFixed(2)}">${labs.map(l => T(x1 + 6, l.y, l.n, { fs, c: l.n === 'приложение' ? SC.acc : SC.mut, w: l.n === 'приложение' ? 700 : 400 })).join('')}</g>`;
    // заголовок: название → вывод, подзаголовок и источник
    if (st.oldT > 0) h += T(W / 2, 28, 'Динамика выручки', { fs: 15, a: 'middle', c: SC.ink, op: st.oldT });
    if (st.title > 0) {
      let left2 = Math.round(TITLE.length * st.title);
      tl.forEach((ln, i) => { const part = ln.slice(0, Math.max(0, left2)); left2 -= ln.length + 1; if (part) h += T(14, 24 + i * 18, part, { fs: tfs, w: 700, c: SC.ink }); });
      h += T(14, 24 + tl.length * 18, 'Выручка по каналам продаж, млн ₽ в месяц', { fs: nar ? 10.5 : 11.5, c: SC.ink2, op: st.sub });
      h += T(14, H - 7, 'Источник: учебные данные магазина, 2024–2025', { fs: 9.5, c: SC.mut, op: st.sub });
    }
    // пять номеров правок на итоговом графике
    if (st.badges) {
      const appL = labs.find(l => l.n === 'приложение');
      const B = [[xs(3), ys(DATA.rev['сайт'][3]) - 12], [xs(9), ys(DATA.rev['приложение'][9]) - 13], [x1 + 6 + tw('приложение', fs, .62) / 2, appL.y - fs - 10], [xr - 5 - tw('релиз приложения', fs) - 11, y0 + 7], [nar ? W - 12 : Math.min(14 + tw(tl[0], tfs, .6) + 14, W - 12), 19]];
      h += `<g style="opacity:${st.badges.toFixed(2)}">${B.map((b, i) => Ci(b[0], b[1], 8, SC.badge) + T(b[0], b[1] + 3.8, String(i + 1), { fs: 10.5, a: 'middle', w: 700, c: '#1d2433' })).join('')}</g>`;
    }
    h += '</svg>';
    // выноски шагов
    const big = !nar;
    // выноски: [x, y, над/под точкой, выравнивание: l — влево от точки, c — по центру, r — вправо, текст, короткий текст]
    const CALL = {
      0: [x0 + (x1 - x0) * .5, y0 + 6, 'down', 'c', 'Десять цветов и легенда на десять строк. Где здесь новость?', 'Где здесь новость?'],
      1: [x0 + (x1 - x0) * .45, ys(10.9), 'down', 'c', 'Розовое «приложение» и голубые «соцсети» при дейтеранопии почти одного цвета', 'Розовая и голубая слились'],
      2: [xs(6), ys(10.2), 'down', 'c', 'Всё в фон: серые линии, бледная сетка, нет верхней и правой рамки', 'Всё — в фон'],
      3: [xs(MI('2025-07')) - 6, ys(C.jul25) - 8, 'up', 'l', 'Один цвет — для одного главного ряда', 'Один цвет — один ряд'],
      4: [x1 + 4, appL0(labs) - 14, 'up', 'c', 'Имя у конца линии: глазу не надо ходить к легенде', 'Имя у конца линии'],
      5: [xr - 8, y0 + 20, 'down', 'l', 'Причина перелома подписана прямо на графике', 'Причина — на графике'],
      6: [xs(MI('2025-07')) - 8, ys(C.jul25) - 8, 'up', 'l', `Май ${nf(C.may25, 2)} → июль ${nf(C.jul25, 2)} млн ₽: ×${nf(C.x25, 2)}`, `×${nf(C.x25, 2)} за два месяца`],
      7: [xs(MI('2024-07')) + 8, ys(C.jul24) - 12, 'up', 'r', `Год назад тот же отрезок: ×${nf(C.x24, 2)}, остальные каналы в 2025: ×${nf(C.oth[0], 2)}–${nf(C.oth[1], 2)}. Это не сезон`, `Год назад: ×${nf(C.x24, 2)}`],
      8: [x0 + 8, y0 + 26, 'down', 'r', 'Вывод в заголовке, единицы в подзаголовке, источник внизу', null]
    }[st.call];
    if (CALL && (big || CALL[5])) {
      const text = big ? CALL[4] : CALL[5], w = Math.min(nar ? 200 : 236, W * .66, tw(text, nar ? 11.5 : 12.5, .53) + 22);
      const l = CALL[3] === 'l' ? CALL[0] - w : CALL[3] === 'r' ? CALL[0] : CALL[0] - w / 2;
      calls.push({ x: clamp(l, 6, W - w - 6), y: CALL[1], w, place: CALL[2], text });
    }
    return { svg: h, calls };
  }
  function appL0(labs) { return labs.find(l => l.n === 'приложение').y; }

  const scene = {
    parts: [{ n: '01', name: 'Спагетти', s: [0, 1] }, { n: '02', name: 'Фон и акцент', s: [2, 3] }, { n: '03', name: 'Подписи', s: [4, 5] }, { n: '04', name: 'Проверка', s: [6, 7] }, { n: '05', name: 'Вывод', s: [8, 9] }],
    steps: [
      { title: 'Десять линий и легенда', dur: 3200, body: '<p>Так выглядит график, если отдать таблицу «месяц × канал» в Matplotlib как есть: десять каналов, десять цветов палитры по умолчанию, легенда сбоку, заголовок-название и множитель <b>1e7</b> над осью.</p><p>Что на нём, понятно. Зачем его показали — нет. Где-то здесь важная новость о канале «приложение».</p>' },
      { title: 'Цвет, который видят не все', dur: 3200, body: '<p>Чтобы найти приложение, глаз сверяет цвет линии с легендой. Теперь те же цвета так, как их видит человек с <b>дейтеранопией</b> — частым нарушением цветового зрения.</p><p>Розовая линия приложения и голубая линия соцсетей сливаются. В палитре по умолчанию таких пар четыре.</p>' },
      { title: 'Правка 1: серые линии фона', dur: 2800, body: '<p>Всё, что не главная мысль, уходит в фон: девять каналов — серые, сетка — бледная, верхней и правой рамки больше нет.</p><p>Данные на месте, но глазу не за что зацепиться. Так и задумано: следующей правкой покажем, куда смотреть.</p>' },
      { title: 'Правка 2: одна цветная линия', dur: 2800, body: '<p>Приложение получает единственный цвет на графике и толстую линию поверх остальных. Это <b>акцент</b>: цвет замечают раньше, чем читают подписи.</p><p>Синий на сером различим и при дейтеранопии — это проверено кодом в разделе 06.</p>' },
      { title: 'Правка 3: подпись на конце линии', dur: 3000, body: '<p>Легенда исчезает, имя ряда встаёт у конца его линии. Читателю больше не надо водить взглядом от линии к легенде и обратно.</p><p>Подписаны четыре крупных канала, шесть мелких собраны в одну подпись: называть каждую серую линию незачем.</p>' },
      { title: 'Правка 4: аннотация у перелома', dur: 2800, body: '<p>Пунктир в июне 2025 и подпись «релиз приложения»: причина перелома видна там же, где сам перелом.</p><p><b>Аннотация</b> объясняет событие, которого нет в данных, а не повторяет ось.</p>' },
      { title: 'Проверка: удвоилась ли?', dur: 3000, body: `<p>Прежде чем писать вывод, сверим его с числами. Май 2025 — ${nf(C.may25, 2)} млн ₽, июль — ${nf(C.jul25, 2)} млн ₽: рост в <b>${nf(C.x25, 2)}</b> раза. Июнь — месяц разгона, ${nf(C.jun25, 2)} млн.</p><p>«Удвоилась» — честное слово. Осталось убедиться, что это не сезон.</p>` },
      { title: 'Проверка: это не сезон', dur: 3200, body: `<p>Тот же отрезок год назад: май 2024 — ${nf(C.may24, 2)} млн, июль — ${nf(C.jul24, 2)}, рост в ${nf(C.x24, 2)} раза. Остальные каналы с мая по июль 2025 изменились в ${nf(C.oth[0], 2)}–${nf(C.oth[1], 2)} раза.</p><p>Скачок есть только у приложения и только после релиза. Пишем «после», а не «из-за»: причину доказал бы только эксперимент.</p>` },
      { title: 'Правка 5: заголовок-вывод', dur: 3600, body: '<p>«Динамика выручки» сменяется выводом. Подзаголовок говорит, что на осях и в каких единицах, строка внизу — откуда данные. Множитель 1e7 больше не нужен.</p><p>Теперь график читается без автора.</p>' },
      { title: 'Пять правок вместе', dur: 3600, next: 'Читать страницу', body: '<p>1 — серый фон, 2 — один акцент, 3 — подпись у линии, 4 — аннотация события, 5 — проверенный заголовок-вывод.</p><p>Данные те же, что на первом шаге. График просто перестал прятать мысль, которая в них была.</p>' }
    ],
    hud: [{ id: 'edits', label: 'Правки' }, { id: 'colors', label: 'Цветов' }, { id: 'growth', label: 'Рост' }],
    legend: `<span><i style="background:${SC.acc}"></i>приложение</span><span><i style="background:${SC.grey}"></i>остальные каналы</span><span><i style="background:${SC.badge}"></i>проверка и номера правок</span>`,
    info: 'ГРАФИК',
    aiNote: `В анимации — учебная выручка магазина по 10 каналам продаж, 2024–2025, млн ₽ в месяц. Приложение: май 2025 — ${C.may25}, июнь — ${C.jun25}, июль — ${C.jul25} (×${C.x25}); май → июль 2024 — ×${C.x24}; остальные каналы май → июль 2025 — ×${C.oth[0]}–${C.oth[1]}. Пять правок: серый фон, один акцент, подпись у линии, аннотация релиза, заголовок «${TITLE}».`,
    mount(root, api) {
      root.innerHTML = '<div class="ca-sc"><div class="ca-sc-in"></div><div class="ca-sc-calls"></div></div>';
      const box = root.querySelector('.ca-sc'), inn = box.querySelector('.ca-sc-in'), cl = box.querySelector('.ca-sc-calls');
      let sig = '';
      return {
        render(k, p) {
          const edits = [0, 0, p > .3 ? 1 : 0, 2, 3, 4, 4, 4, p > .3 ? 5 : 4, 5][k];
          api.hud('edits', `${edits}/5`);
          api.hud('colors', k < 2 || (k === 2 && p < .3) ? '10' : k === 2 ? '0' : '1', k === 1 && p > .3 ? '4 пары ≈' : '');
          api.hud('growth', k < 6 || (k === 6 && p < .4) ? '—' : `×${nf(C.x25, 2)}`);
          const W = Math.round(box.clientWidth), H = Math.round(box.clientHeight);
          if (!W || !H) return;
          const st = sceneState(k, p);
          const key = JSON.stringify([W, H, k, Object.values(st).map(v => typeof v === 'number' ? Math.round(v * 40) : v)]);
          if (key === sig) return; sig = key;
          const d = drawScene(W, H, st);
          inn.innerHTML = d.svg;
          cl.innerHTML = d.calls.map(c => `<div class="ca-call ${c.place}" style="left:${f1(c.x)}px;top:${f1(c.y)}px;width:${f1(c.w)}px">${X(c.text)}</div>`).join('');
        }
      };
    }
  };

  /* ===================== Интерактив «До и после» ===================== */
  const ITEMS = [['title', 'Заголовок — вывод', 1], ['dist', 'Шкала не искажает', 3], ['acc', 'Один акцент', 1], ['leg', 'Без расшифровки легенды', 1], ['cvd', 'Различимо при дейтеранопии', 1], ['junk', 'Без лишних чернил', 1], ['units', 'Единицы и источник', 1], ['order', 'Порядок по смыслу', 1]];
  const MAXP = ITEMS.reduce((a, b) => a + b[2], 0);
  const SRC = 'Источник: учебные данные магазина, sales_monthly.csv';
  const GREY = 'var(--ca-grey)', ACC = 'var(--c1)';
  // шапка графика: название по центру или вывод слева, подзаголовок с единицами
  function head(W, concl, bad, good, sub) {
    const nar = W < 460, fs = nar ? 13.5 : 15;
    let h = '', y;
    if (concl) {
      const ls = wrap(good, W - 24, fs, .6);
      ls.forEach((l, i) => { h += T(12, 22 + i * 19, l, { fs, w: 650 }); });
      y = 22 + ls.length * 19;
    } else { h += T(W / 2, 24, bad, { fs: 14, a: 'middle' }); y = 24 + 18; }
    if (sub) { h += concl ? T(12, y, sub, { fs: 11.5, c: 'var(--ink-2)' }) : T(W / 2, y - 1, sub, { fs: 11.5, a: 'middle', c: 'var(--ink-2)' }); y += 16; }
    return { h, top: y + 2 };
  }
  const srcL = (H, on) => (on ? T(12, H - 8, SRC, { fs: 10, c: 'var(--muted)' }) : '');
  const legBox = (x, y, rows, fs = 10.5) => {
    const w = Math.max(...rows.map(r => tw(r[0], fs))) + 34;
    return Rc(x, y, w, rows.length * 16 + 8, 'var(--surface)', ';stroke:var(--line-2)') + rows.map((r, i) => Rc(x + 8, y + 8 + i * 16, 14, 9, r[1]) + T(x + 27, y + 16 + i * 16, r[0], { fs, c: 'var(--ink-2)' })).join('');
  };

  // 1. Круговая в 3D: доли каналов 2025
  const PIE = { tilt: .45, depth: .2 };
  const pieLF = (() => {
    let a0 = -Math.PI / 2; const vis = DATA.share.map(sh => {
      const a1 = a0 + 2 * Math.PI * sh / 100, top = sh / 100 * Math.PI * PIE.tilt; let side = 0;
      for (const k of [-1, 0, 1]) { const lo = Math.max(a0, 2 * Math.PI * k), hi = Math.min(a1, 2 * Math.PI * k + Math.PI); if (hi > lo) side += PIE.depth * (Math.cos(lo) - Math.cos(hi)); }
      a0 = a1; return top + side;
    });
    const tot = vis.reduce((a, b) => a + b, 0), lf = vis.map((v, i) => v / tot / (DATA.share[i] / 100));
    const i = lf.indexOf(Math.max(...lf)); return { max: lf[i], who: CH[i], lf };
  })();
  const TOP2 = ['сайт', 'маркетплейс'];
  const chPie = {
    tab: '3D-круговая', what: 'доли каналов в выручке 2025 года',
    fixes: [['bars', 'Столбцы вместо круга', 'Длина от общего нуля читается точнее угла и площади, легенда больше не нужна: имена стоят у столбцов, а порядок — по убыванию.'], ['flat', 'Убрать 3D', `В 3D приложение выглядело в ${nf(pieLF.max, 2)} раза крупнее своей доли и обгоняло маркетплейс. Плоская доля честна, но легенда и десять цветов остались.`], ['acc', 'Серый и один акцент', 'Два главных канала — одним цветом, остальное серое. Сливающихся пар больше нет.'], ['text', 'Заголовок-вывод, единицы, источник', `Сайт и маркетплейс вместе — ${nf(DATA.titles.top2)}%: «почти половина» проверена.`]],
    draw(s, W, H) {
      const nar = W < 460, hd = head(W, s.text, 'Структура выручки 2025', 'Сайт и маркетплейс дают почти половину выручки', s.text ? 'Доля канала в выручке 2025 года, %' : '');
      const col = i => (s.acc ? (TOP2.includes(CH[i]) ? ACC : GREY) : DATA.tab10[i]);
      let h = hd.h; const bot = s.text ? 24 : 10;
      if (s.bars) {
        const ord = CH.map((c, i) => i).sort((a, b) => DATA.share[b] - DATA.share[a]);
        const lw = nar ? 96 : 112, x0 = 12 + lw, x1 = W - 52, rh = (H - hd.top - bot) / 10;
        ord.forEach((i, r) => {
          const y = hd.top + r * rh, w = (x1 - x0) * DATA.share[i] / 30;
          h += T(x0 - 6, y + rh * .5 + 4, CH[i], { fs: 11, a: 'end', c: 'var(--ink-2)' }) + Rc(x0, y + rh * .15, w, rh * .7, col(i)) + T(x0 + w + 5, y + rh * .5 + 4, nf(DATA.share[i]) + (s.text ? ' %' : ''), { fs: 11, c: 'var(--ink-2)' });
        });
      } else {
        const legW = nar ? 0 : 150, legH = nar ? 5 * 15 + 10 : 0;
        const aw = W - 24 - legW, ah = H - hd.top - bot - legH;
        const flat = s.flat, rx = Math.min(aw / 2 - 8, (flat ? ah / 2 : ah / (2 * PIE.tilt + 2 * PIE.depth)) - 8), ry = flat ? rx : rx * PIE.tilt, d = flat ? 0 : rx * PIE.depth;
        const cx = 12 + aw / 2, cy = hd.top + (ah - d) / 2;
        const P = (a, dy = 0) => `${f1(cx + rx * Math.cos(a))},${f1(cy + dy + ry * Math.sin(a))}`;
        let a0 = -Math.PI / 2, sides = '', tops = '';
        DATA.share.forEach((sh, i) => {
          const a1 = a0 + 2 * Math.PI * sh / 100, big = a1 - a0 > Math.PI ? 1 : 0;
          tops += `<path d="M${f1(cx)},${f1(cy)} L${P(a0)} A${f1(rx)},${f1(ry)} 0 ${big} 1 ${P(a1)} Z" style="fill:${col(i)};stroke:var(--surface);stroke-width:1"/>`;
          if (d) for (const k of [-1, 0, 1]) { const lo = Math.max(a0, 2 * Math.PI * k), hi = Math.min(a1, 2 * Math.PI * k + Math.PI); if (hi > lo) { const sd = `M${P(lo)} A${f1(rx)},${f1(ry)} 0 0 1 ${P(hi)} L${P(hi, d)} A${f1(rx)},${f1(ry)} 0 0 0 ${P(lo, d)} Z`; sides += `<path d="${sd}" style="fill:${col(i)}"/><path d="${sd}" style="fill:#000;opacity:.28;stroke:var(--surface);stroke-width:.6"/>`; } }
          a0 = a1;
        });
        if (d) h += `<ellipse cx="${f1(cx + 8)}" cy="${f1(cy + d + 10)}" rx="${f1(rx)}" ry="${f1(ry)}" style="fill:#000;opacity:.16"/>`;
        h += sides + tops;
        const rows = CH.map((c, i) => [c, col(i)]);
        if (nar) { h += Rc(8, H - bot - legH, W - 16, legH - 4, 'var(--surface)', ';stroke:var(--line-2)'); rows.forEach((r, i) => { const x = 16 + (i % 2) * (W - 24) / 2, y = H - bot - legH + 13 + Math.floor(i / 2) * 15; h += Rc(x, y - 8, 12, 8, r[1]) + T(x + 17, y, r[0], { fs: 10, c: 'var(--ink-2)' }); }); }
        else h += legBox(W - legW + 4, hd.top + 6, rows);
      }
      return h + srcL(H, s.text);
    },
    m(s) {
      const lf = s.bars || s.flat ? 1 : pieLF.max, junk = (!s.bars && !s.flat ? 2 : 0) + (s.bars ? 0 : 1);
      return {
        title: [s.text, s.text ? 'вывод проверен' : '«Структура выручки 2025»'],
        dist: [lf < 1.05, s.bars ? 'длина от нуля' : s.flat ? 'площадь = доля' : `${pieLF.who}: ×${nf(lf, 2)}`],
        acc: [s.acc, s.acc ? 'серый + 1 цвет' : '10 цветов'],
        leg: [s.bars, s.bars ? 'имена у столбцов' : '10 строк легенды'],
        cvd: [s.acc, s.acc ? 'пар нет' : `${DATA.pal.tab10} пары сливаются`],
        junk: [!junk, junk ? [!s.bars && !s.flat ? 'стенка, тень' : '', !s.bars ? 'рамка легенды' : ''].filter(Boolean).join(', ') : 'нет'],
        units: [s.text, s.text ? '%, источник' : 'нет'],
        order: [s.bars, s.bars ? 'по убыванию' : 'по алфавиту']
      };
    }
  };

  // 2. Обрезанная ось: выручка по кварталам
  const QL = ['I кв.', 'II кв.', 'III кв.', 'IV кв.'], QB = 80, QMIN = Math.min(...DATA.q25), QMAX = Math.max(...DATA.q25);
  const chQ = {
    tab: 'Обрезанная ось', what: 'выручка 2025 года по кварталам',
    fixes: [['zero', 'Ось с нуля', `Столбец IV квартала больше не выглядит вчетверо выше II: разница ${nf((QMAX / QMIN - 1) * 100, 0)}%, и видно ровно её. Фактор лжи — 1.`], ['clean', 'Числа вместо сетки и рамки', 'Сетка и рамка ушли, точные значения стоят на столбцах. Без оси с нуля подписи не спасают: длины всё ещё врут.'], ['units', 'Единицы и источник', 'Вместо «120 000 000» — «млн ₽» в подзаголовке и строка об источнике.'], ['text', 'Заголовок-вывод', `IV квартал — ${nf(DATA.q25[3], 1)} млн ₽, III — ${nf(DATA.q25[2], 1)}: +${nf(DATA.titles.q43)}%.`]],
    draw(s, W, H) {
      const hd = head(W, s.text, 'Выручка по кварталам', 'Четвёртый квартал принёс на 18% больше третьего', s.units ? 'Выручка за квартал 2025 года, млн ₽' : '');
      const lo = s.zero ? 0 : QB, hi = 125, raw = !s.units;
      const x0 = raw ? 92 : 44, x1 = W - 14, y0 = hd.top + 10, y1 = H - (s.units ? 40 : 26);
      const ys = v => y1 - (y1 - y0) * (v - lo) / (hi - lo), bw = (x1 - x0) / 4;
      let h = hd.h;
      if (!s.clean) {
        ticks(lo, hi, s.zero ? 5 : 4).forEach(v => { h += Ln(x0, ys(v), x1, ys(v), 'var(--line-2)') + T(x0 - 6, ys(v) + 4, raw ? nf(v * 1e6, 0) : nf(v, 0), { fs: 10.5, a: 'end', c: 'var(--ink-2)' }); });
        h += Rc(x0, y0, x1 - x0, y1 - y0, 'none', ';stroke:var(--ink-2);stroke-width:1');
      } else h += Ln(x0, y1, x1, y1, 'var(--muted)');
      DATA.q25.forEach((v, i) => {
        const x = x0 + i * bw + bw * .18;
        h += Rc(x, ys(v), bw * .64, y1 - ys(v), s.text && i === 3 ? ACC : s.text ? GREY : '#1f77b4') + T(x + bw * .32, y1 + 15, QL[i], { fs: 11, a: 'middle', c: 'var(--ink-2)' });
        if (s.clean) h += T(x + bw * .32, ys(v) - 5, raw ? nf(v * 1e6, 0) : nf(v, 1), { fs: raw && W < 460 ? 8.5 : 11, a: 'middle', c: 'var(--ink-2)' });
      });
      return h + srcL(H, s.units);
    },
    m(s) {
      const lf = s.zero ? 1 : lieF(QMIN, QMAX, QB);
      return {
        title: [s.text, s.text ? 'вывод проверен' : '«Выручка по кварталам»'],
        dist: [lf < 1.05, s.zero ? 'ось с нуля' : `фактор лжи ${nf(lf, 1)}`],
        acc: [true, s.text ? 'серый + 1 цвет' : '1 цвет'], leg: [true, 'легенды нет'], cvd: [true, 'пар нет'],
        junk: [s.clean, s.clean ? 'нет' : 'сетка, рамка'],
        units: [s.units, s.units ? 'млн ₽, источник' : '120 000 000'],
        order: [true, 'по времени']
      };
    }
  };

  // 3. Две оси Y: приложение и колл-центр
  const AP = DATA.rev['приложение'], CC = DATA.cc, DL = { a: [2.5, 8.5], c: [.45, .9] };
  const dualLF = Math.max(lieF(AP[0], AP[N - 1], DL.a[0]), lieF(CC[0], CC[N - 1], DL.c[0]));
  const chDual = {
    tab: 'Две оси Y', what: 'приложение и колл-центр по месяцам',
    fixes: [['index', 'Одна ось: индекс, январь 2024 = 100', `Обе линии на одной шкале от нуля: приложение выросло до ${nf(AP[N - 1] / AP[0] * 100, 0)}, колл-центр упал до ${nf(CC[N - 1] / CC[0] * 100, 0)}. Пересечение, которое намекало на «перетекание» клиентов, исчезло.`], ['labels', 'Прямые подписи', 'Легенда ушла, но баллов не прибавилось: пока осей две, читатель всё равно выясняет, какая шкала чья.'], ['clean', 'Стереть рамку и сетку', 'Рамка и тяжёлая сетка ушли.'], ['text', 'Заголовок-вывод, единицы, источник', `Колл-центр с января 2024 по май 2025 потерял ${nf(-DATA.titles.ccBefore, 0)}% выручки — ещё до релиза.`]],
    draw(s, W, H) {
      const nar = W < 460, hd = head(W, s.text, 'Приложение и колл-центр', 'Колл-центр терял выручку ещё до релиза приложения', s.text ? (s.index ? 'Индекс выручки, январь 2024 = 100' : 'Млн ₽: приложение — левая ось, колл-центр — правая') : '');
      const x0 = 40, x1 = W - (s.labels ? (nar ? 78 : 92) : 40), y0 = hd.top + 10, y1 = H - (s.text ? 40 : 26);
      const xs = i => x0 + (x1 - x0) * i / (N - 1), sc = (v, r) => y1 - (y1 - y0) * (v - r[0]) / (r[1] - r[0]);
      const ser = s.index ? [[AP.map(v => v / AP[0] * 100), [0, 250]], [CC.map(v => v / CC[0] * 100), [0, 250]]] : [[AP, DL.a], [CC, DL.c]];
      let h = hd.h;
      const gl = s.clean ? 'var(--line)' : 'var(--line-2)';
      ticks(ser[0][1][0], ser[0][1][1], 5).forEach(v => { h += Ln(x0, sc(v, ser[0][1]), x1, sc(v, ser[0][1]), gl) + T(x0 - 5, sc(v, ser[0][1]) + 4, nf(v, s.index ? 0 : 1), { fs: 10, a: 'end', c: 'var(--ink-2)' }); });
      if (!s.index) ticks(DL.c[0], DL.c[1], 4).forEach(v => { h += T(x1 + 5, sc(v, DL.c) + 4, nf(v, 2), { fs: 10, c: '#ff7f0e' }); });
      if (!s.clean) h += Rc(x0, y0, x1 - x0, y1 - y0, 'none', ';stroke:var(--ink-2)');
      else h += Ln(x0, y1, x1, y1, 'var(--muted)');
      [0, 12, 23].forEach(i => { h += T(xs(i), y1 + 15, DATA.months[i], { fs: 10, a: i ? (i === 23 ? 'end' : 'middle') : 'start', c: 'var(--ink-2)' }); });
      const cols = ['#1f77b4', '#ff7f0e'], names = ['приложение', 'колл-центр'];
      ser.forEach(([v, r], j) => { h += Pl(v.map((y, i) => [xs(i), sc(y, r)]), cols[j], 2); });
      if (s.labels) ser.forEach(([v, r], j) => { h += T(x1 + 5, sc(v[N - 1], r) + 4, names[j], { fs: 11, c: cols[j], w: 600 }); });
      else h += legBox(x0 + 8, y0 + 6, names.map((n, j) => [n, cols[j]]));
      return h + srcL(H, s.text);
    },
    m(s) {
      const nleg = (s.labels ? 0 : 2) + (s.index ? 0 : 2);
      return {
        title: [s.text, s.text ? 'вывод проверен' : '«Приложение и колл-центр»'],
        dist: [s.index, s.index ? 'одна шкала от нуля' : `фактор лжи ${nf(dualLF, 1)}`],
        acc: [true, '2 ряда — 2 цвета'],
        leg: [!nleg, nleg ? `${nleg} ${nleg > 2 ? 'сверки: легенда и оси' : s.labels ? 'сверки: какая ось чья' : 'строки легенды'}` : 'имена у линий'],
        cvd: [true, 'пар нет'], junk: [s.clean, s.clean ? 'нет' : 'рамка, сетка'],
        units: [s.text, s.text ? 'единицы, источник' : 'нет'], order: [true, 'по времени']
      };
    }
  };

  // 4. Радуга: рост 2025 к 2024 по каналам и странам
  const HM = DATA.heat, HROWS = HM.rows.map((r, i) => i), HSORT = HROWS.slice().sort((a, b) => HM.g[b].reduce((x, y) => x + y) - HM.g[a].reduce((x, y) => x + y));
  const HLO = Math.min(...HM.g.flat()), HHI = Math.max(...HM.g.flat());
  const chHeat = {
    tab: 'Радуга', what: 'рост выручки 2025 к 2024 году по каналам и странам',
    fixes: [['seq', 'Последовательная палитра', `Светлее — меньше, темнее — больше, и так для любой пары ячеек. У радуги порядок по светлоте нарушен в ${HM.disc.jet}% пар.`], ['values', 'Числа в ячейках', 'Шкала цвета не нужна: число стоит прямо в ячейке, цвет только помогает увидеть картину.'], ['sort', 'Сортировка по росту', 'Строки идут от самого быстрого роста к падению: приложение сверху, колл-центр внизу.'], ['text', 'Заголовок-вывод, единицы, источник', `Приложение выросло на ${nf(DATA.titles.appGrowth[0])}–${nf(DATA.titles.appGrowth[1])}% в каждой из четырёх стран.`]],
    draw(s, W, H) {
      const nar = W < 460, hd = head(W, s.text, 'Рост по каналам и странам', 'Приложение выросло на 62–70% во всех четырёх странах', s.text ? 'Рост выручки 2025 года к 2024, %' : '');
      const lw = nar ? 100 : 118, cbw = s.values ? 0 : 54, x0 = 12 + lw, x1 = W - 12 - cbw, y0 = hd.top + 18, y1 = H - (s.text ? 26 : 8);
      const cw = (x1 - x0) / 4, rh = (y1 - y0) / 10, rows = s.sort ? HSORT : HROWS;
      let h = hd.h;
      HM.cols.forEach((c, j) => { h += T(x0 + cw * (j + .5), y0 - 6, c, { fs: 11, a: 'middle', c: 'var(--ink-2)', w: 600 }); });
      rows.forEach((i, r) => {
        const y = y0 + r * rh;
        h += T(x0 - 6, y + rh / 2 + 4, HM.rows[i], { fs: 11, a: 'end', c: 'var(--ink-2)' });
        HM.g[i].forEach((v, j) => {
          const fill = (s.seq ? HM.seq : HM.jet)[i][j], ink = (s.seq ? HM.seqInk : HM.jetInk)[i][j];
          h += Rc(x0 + j * cw + 1, y + 1, cw - 2, rh - 2, fill);
          const r = Math.round(v); if (s.values) h += T(x0 + (j + .5) * cw, y + rh / 2 + 4, (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r), { fs: nar ? 10 : 11, a: 'middle', c: ink ? '#fff' : '#1d2433' });
        });
      });
      if (!s.values) {
        const cx = x1 + 14, gid = 'ca-cb-' + (s.seq ? 's' : 'j'), stops = s.seq ? HM.seqBar : HM.jetBar;
        h += `<defs><linearGradient id="${gid}" x1="0" y1="1" x2="0" y2="0">${stops.map((c, i) => `<stop offset="${f1(i / (stops.length - 1) * 100)}%" stop-color="${c}"/>`).join('')}</linearGradient></defs>`;
        h += Rc(cx, y0, 12, y1 - y0, `url(#${gid})`);
        [-20, 0, 20, 40, 60].forEach(v => { const y = y1 - (y1 - y0) * (v - HLO) / (HHI - HLO); h += T(cx + 16, y + 4, String(v), { fs: 10, c: 'var(--ink-2)' }); });
      }
      return h + srcL(H, s.text);
    },
    m(s) {
      return {
        title: [s.text, s.text ? 'вывод проверен' : '«Рост по каналам и странам»'],
        dist: [s.seq, s.seq ? 'темнее — больше' : `${HM.disc.jet}% пар не по порядку`],
        acc: [s.seq, s.seq ? 'один тон' : 'радуга'],
        leg: [s.values, s.values ? 'числа в ячейках' : 'шкала цвета'],
        cvd: [s.seq, s.seq ? 'порядок сохраняется' : `${HM.disc.jetD}% пар не по порядку`],
        junk: [true, 'нет'], units: [s.text, s.text ? '%, источник' : 'нет'],
        order: [s.sort, s.sort ? 'по росту' : 'по алфавиту']
      };
    }
  };

  // 5. Лишние чернила: выручка 2025 по каналам
  const TOP4 = CH.map((c, i) => i).sort((a, b) => DATA.rev25[b] - DATA.rev25[a]).slice(0, 4);
  const chJunk = {
    tab: 'Лишние чернила', what: 'выручка 2025 года по каналам',
    fixes: [['clean', 'Стереть лишние чернила', 'Градиент, тень, фон, рамка, частая сетка и легенда из одной строки ушли. Данные на месте: стёрто только то, что их не изображало.'], ['sort', 'Сортировка по значению', 'По алфавиту сайт стоит предпоследним, по убыванию — первым: порядок сам показывает, кто главный.'], ['units', 'Короткие числа и единицы', 'Вместо «120 000 000» — «120» и «млн ₽» в подзаголовке, внизу источник.'], ['text', 'Заголовок-вывод', `Сайт, маркетплейс, приложение и поиск — ${nf(DATA.titles.top4)}% выручки; четыре столбца выделены.`]],
    draw(s, W, H) {
      const nar = W < 460, hd = head(W, s.text, 'Выручка по каналам', 'Четыре канала из десяти приносят почти три четверти выручки', s.units ? 'Выручка 2025 года, млн ₽' : '');
      const raw = !s.units, lw = nar ? 96 : 112, x0 = 12 + lw, x1 = W - (raw ? 30 : 20), y0 = hd.top + 6, y1 = H - (s.units ? 40 : 24);
      const ord = s.sort ? CH.map((c, i) => i).sort((a, b) => DATA.rev25[b] - DATA.rev25[a]) : CH.map((c, i) => i);
      const rh = (y1 - y0) / 10, xs = v => x0 + (x1 - x0) * v / 120;
      let h = hd.h + '<defs><linearGradient id="ca-gr5" x1="0" x2="1"><stop offset="0" stop-color="#9ecae1"/><stop offset="1" stop-color="#08519c"/></linearGradient></defs>';
      if (!s.clean) {
        h += Rc(x0, y0, x1 - x0, y1 - y0, 'var(--sunk)', ';stroke:var(--ink-2);stroke-width:1.5');
        for (let v = 0; v <= 120; v += 10) h += Ln(xs(v), y0, xs(v), y1, 'var(--line-2)');
      }
      (s.clean ? [0, 40, 80, 120] : nar ? [0, 60, 120] : [0, 40, 80, 120]).forEach(v => { h += T(xs(v), y1 + 14, raw ? nf(v * 1e6, 0) : String(v), { fs: raw ? 9 : 10.5, a: 'middle', c: 'var(--ink-2)' }); });
      ord.forEach((i, r) => {
        const y = y0 + r * rh + rh * .17, w = xs(DATA.rev25[i]) - x0, bh = rh * .66;
        const hi = s.text && TOP4.includes(i);
        if (!s.clean) h += Rc(x0 + 3, y + 3, w, bh, 'rgba(0,0,0,.28)');
        h += Rc(x0, y, w, bh, s.text ? (hi ? ACC : GREY) : s.clean ? ACC : 'url(#ca-gr5)');
        h += T(x0 - 6, y + bh / 2 + 4, CH[i], { fs: 11, a: 'end', c: 'var(--ink-2)' });
      });
      if (!s.clean) h += legBox(x1 - (nar ? 84 : 96), y0 + 6, [['выручка', '#3182bd']]);
      return h + srcL(H, s.units);
    },
    m(s) {
      return {
        title: [s.text, s.text ? 'вывод проверен' : '«Выручка по каналам»'],
        dist: [true, 'длина от нуля'], acc: [true, s.text ? 'серый + 1 цвет' : '1 цвет'],
        leg: [s.clean, s.clean ? 'легенды нет' : '1 строка легенды'], cvd: [true, 'пар нет'],
        junk: [s.clean, s.clean ? 'нет' : '5 украшений'],
        units: [s.units, s.units ? 'млн ₽, источник' : '120 000 000'],
        order: [s.sort, s.sort ? 'по убыванию' : 'по алфавиту']
      };
    }
  };
  const CHARTS = [chPie, chQ, chDual, chHeat, chJunk];
  const score = m => ITEMS.reduce((a, [k, , w]) => a + (m[k][0] ? w : 0), 0);
  const blank = c => Object.fromEntries(c.fixes.map(f => [f[0], false]));
  const gains = c => { const b = score(c.m(blank(c))); return c.fixes.map(f => score(c.m(Object.assign(blank(c), { [f[0]]: true }))) - b); };

  /* ---------- «Найди обман»: шесть мини-графиков ---------- */
  const F = DATA.find, SITE = F.site;
  const siteMin = Math.min(...SITE), siteMax = Math.max(...SITE);
  const FIND = [
    { t: 'Выручка за год, млн ₽', lie: 1, why: `Столбцы от 360 млн: рост на ${nf((F.years[1] / F.years[0] - 1) * 100)}% нарисован почти тройным. Фактор лжи ≈ ${nf(lieF(F.years[0], F.years[1], 360), 0)}.`,
      draw(W, H) { const lo = 360, hi = 420, x0 = 40, y0 = 8, y1 = H - 20, ys = v => y1 - (y1 - y0) * (v - lo) / (hi - lo); let h = ''; [360, 380, 400, 420].forEach(v => { h += Ln(x0, ys(v), W - 8, ys(v), 'var(--line)') + T(x0 - 5, ys(v) + 4, String(v), { fs: 10, a: 'end', c: 'var(--muted)' }); }); F.years.forEach((v, i) => { const x = x0 + 20 + i * (W - x0 - 40) / 2; h += Rc(x, ys(v), (W - x0 - 60) / 2.4, y1 - ys(v), ACC) + T(x + (W - x0 - 60) / 4.8, y1 + 14, String(2024 + i), { fs: 10, a: 'middle', c: 'var(--ink-2)' }); }); return h; } },
    { t: 'Доля приложения в выручке, %', lie: 0, why: 'Линия кодирует положение, а не длину: ось с 8% подписана и честно показывает скачок с 10 до 18–20%. С нулём ряд только сплющился бы.',
      draw(W, H) { const lo = 8, hi = 21, x0 = 30, y0 = 8, y1 = H - 20, xs = i => x0 + (W - x0 - 8) * i / (N - 1), ys = v => y1 - (y1 - y0) * (v - lo) / (hi - lo); let h = ''; [8, 12, 16, 20].forEach(v => { h += Ln(x0, ys(v), W - 8, ys(v), 'var(--line)') + T(x0 - 5, ys(v) + 4, String(v), { fs: 10, a: 'end', c: 'var(--muted)' }); }); h += Pl(F.appShare.map((v, i) => [xs(i), ys(v)]), ACC, 2) + T(x0, y1 + 14, '2024-01', { fs: 10, c: 'var(--ink-2)' }) + T(W - 8, y1 + 14, '2025-12', { fs: 10, a: 'end', c: 'var(--ink-2)' }); return h; } },
    { t: 'Выручка по странам, 2025, млн ₽', lie: 0, why: 'Точка — положение на шкале, длины у неё нет, поэтому ось с 40 млн ничего не преувеличивает. Столбцы с такой осью были бы обманом.',
      draw(W, H) { const lo = 40, hi = 160, x0 = 34, x1 = W - 10, y0 = 8, y1 = H - 20, xs = v => x0 + (x1 - x0) * (v - lo) / (hi - lo), rh = (y1 - y0) / 4; let h = ''; [40, 80, 120, 160].forEach(v => { h += Ln(xs(v), y0, xs(v), y1, 'var(--line)') + T(xs(v), y1 + 14, String(v), { fs: 10, a: 'middle', c: 'var(--muted)' }); }); F.countries.forEach((v, i) => { const y = y0 + rh * (i + .5); h += Ln(x0, y, xs(v), y, 'var(--line)', 1, ';stroke-dasharray:2 3') + Ci(xs(v), y, 5, ACC) + T(x0 - 5, y + 4, HM.cols[i], { fs: 10, a: 'end', c: 'var(--ink-2)' }); }); return h; } },
    { t: 'Выручка сайта, млн ₽', lie: 1, why: `Площадь под линией читается как величина. От базы 7 млн рост на ${nf((siteMax / siteMin - 1) * 100, 0)}% выглядит как пятикратный: фактор лжи ≈ ${nf(lieF(siteMin, siteMax, 7), 0)}.`,
      draw(W, H) { const lo = 7, hi = 11, x0 = 30, y0 = 8, y1 = H - 20, xs = i => x0 + (W - x0 - 8) * i / (N - 1), ys = v => y1 - (y1 - y0) * (v - lo) / (hi - lo); let h = `<path d="M${f1(xs(0))},${f1(y1)} ${SITE.map((v, i) => `L${f1(xs(i))},${f1(ys(v))}`).join(' ')} L${f1(xs(N - 1))},${f1(y1)} Z" style="fill:var(--c1);opacity:.35"/>`; h += Pl(SITE.map((v, i) => [xs(i), ys(v)]), ACC, 1.6); [7, 9, 11].forEach(v => { h += T(x0 - 5, ys(v) + 4, String(v), { fs: 10, a: 'end', c: 'var(--muted)' }); }); h += Ln(x0, y1, W - 8, y1, 'var(--muted)') + T(x0, y1 + 14, '2024-01', { fs: 10, c: 'var(--ink-2)' }) + T(W - 8, y1 + 14, '2025-12', { fs: 10, a: 'end', c: 'var(--ink-2)' }); return h; } },
    { t: 'Приложение: Беларусь и Узбекистан, 2025', lie: 1, why: `У каждой панели своя ось: Узбекистан выглядит не меньше Беларуси, хотя приложение там продаёт в ${nf(F.ratioBYUZ)} раза меньше. Соседним панелям нужна общая ось.`,
      draw(W, H) { let h = ''; [['Беларусь', F.by], ['Узбекистан', F.uz]].forEach(([n, v], j) => { const pw = (W - 16) / 2, px = 8 + j * pw, lo = Math.min(...v) * .9, hi = Math.max(...v) * 1.05, x0 = px + 28, x1 = px + pw - 8, y0 = 22, y1 = H - 10, xs = i => x0 + (x1 - x0) * i / 11, ys = y => y1 - (y1 - y0) * (y - lo) / (hi - lo); h += T(px + 4, 12, n, { fs: 10.5, c: 'var(--ink-2)', w: 600 }); [lo, hi].forEach(t => { h += T(x0 - 4, ys(t) + 4, nf(t, 1), { fs: 9.5, a: 'end', c: 'var(--muted)' }); }); h += Ln(x0, y1, x1, y1, 'var(--line)') + Pl(v.map((y, i) => [xs(i), ys(y)]), ACC, 2); }); return h; } },
    { t: `Сайт: +${nf(F.win25, 0)}% за четыре месяца`, lie: 1, why: `Ось времени обрезана на летнем провале. Тот же отрезок 2024 года дал +${nf(F.win24, 0)}%, декабрь к декабрю — +${nf(F.yoyDec, 0)}%: это сезон, а не рост.`,
      draw(W, H) { const v = SITE.slice(MI('2025-08')), lo = 8.5, hi = 11, x0 = 30, y0 = 8, y1 = H - 20, xs = i => x0 + (W - x0 - 12) * i / (v.length - 1), ys = y => y1 - (y1 - y0) * (y - lo) / (hi - lo); let h = ''; [9, 10, 11].forEach(t => { h += Ln(x0, ys(t), W - 8, ys(t), 'var(--line)') + T(x0 - 5, ys(t) + 4, String(t), { fs: 10, a: 'end', c: 'var(--muted)' }); }); h += Pl(v.map((y, i) => [xs(i), ys(y)]), ACC, 2.2) + ['авг', 'сен', 'окт', 'ноя', 'дек'].map((m, i) => T(xs(i), y1 + 14, m, { fs: 10, a: 'middle', c: 'var(--ink-2)' })).join(''); return h; } }
  ];

  function buildBA(box, api) {
    box.innerHTML = `<div class="block-hd"><span class="t">До и после: пять учебных графиков <i>интерактив</i></span><div class="seg" role="group" aria-label="Режим"><button type="button" data-mode="fix" aria-pressed="true">Правки</button><button type="button" data-mode="find" aria-pressed="false">Найди обман</button></div><button type="button" class="btn ghost small" id="ba-reset">Сбросить</button></div>
<p class="hint ca-do" id="ba-hint"></p>
<div id="ba-fix"><div class="tabs" role="group" aria-label="График">${CHARTS.map((c, i) => `<button type="button" data-c="${i}" aria-pressed="${i ? 'false' : 'true'}">${i + 1}. ${c.tab}</button>`).join('')}</div>
<div class="stage"><div class="ca-plotw"><div class="ca-plot" id="ba-plot"></div><p class="ca-note" id="ba-note"></p></div>
<div class="narr"><p class="cap">Правки — по одной</p><div class="ca-fixes" id="ba-fixes"></div><p class="cap">Чек-лист</p><ul class="ca-chk" id="ba-chk"></ul><div class="narr-text" id="ba-msg"></div></div></div>
<div class="status"><span><span class="dot live"></span><span id="ba-score"></span></span><span id="ba-on"></span><span class="grow"></span><span id="ba-best"></span></div></div>
<div id="ba-find" hidden><div class="ca-find" id="ba-cards"></div><div class="status"><span><span class="dot live"></span><span id="bf-n"></span></span><span id="bf-hit"></span><span id="bf-fa"></span></div></div>`;
    const $ = id => box.querySelector('#' + id);
    let mode, cur, st, msg, ans;
    const reset = () => { mode = 'fix'; cur = 0; st = CHARTS.map(blank); msg = ''; ans = FIND.map(() => null); };
    function drawFix() {
      const c = CHARTS[cur], s = st[cur], m = c.m(s), g = gains(c), on = c.fixes.filter(f => s[f[0]]).length;
      const pw = $('ba-plot').clientWidth || 600, W = Math.max(280, Math.round(pw)), H = W < 460 ? 330 : 400;
      $('ba-plot').innerHTML = svgOpen(W, H, `Учебный график: ${c.what}`) + c.draw(s, W, H) + '</svg>';
      $('ba-note').textContent = `Учебный график по мотивам типичной ошибки: ${c.what}. Данные — учебный магазин.`;
      $('ba-fixes').innerHTML = c.fixes.map((f, i) => `<button type="button" class="ca-fix" data-f="${f[0]}" aria-pressed="${s[f[0]]}"><span class="ca-fx-b">${s[f[0]] ? '✓' : '+'}</span><span class="ca-fx-n">${X(f[1])}</span><span class="ca-fx-g${g[i] === Math.max(...g) ? ' top' : ''}">+${g[i]}</span></button>`).join('');
      $('ba-chk').innerHTML = ITEMS.map(([k, name, w]) => `<li class="${m[k][0] ? 'ca-ok' : 'ca-no'}"><b>${m[k][0] ? '✓' : '×'}</b><span>${X(name)}${w > 1 ? ' <i>×3</i>' : ''}</span><small>${X(m[k][1])}</small></li>`).join('');
      $('ba-msg').textContent = msg || 'Включите любую правку. Число справа от неё — сколько баллов чек-листа она даёт сама, на исходном графике.';
      const bi = g.indexOf(Math.max(...g));
      $('ba-score').textContent = `Баллы: ${score(m)} из ${MAXP}`;
      $('ba-on').textContent = `Правок: ${on} из ${c.fixes.length}`;
      $('ba-best').textContent = `Больше всего даёт «${c.fixes[bi][1]}»: +${g[bi]}`;
      box.querySelectorAll('[data-c]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.c === cur)));
    }
    function drawFind() {
      const wrapW = $('ba-cards').clientWidth || 900, cols = wrapW > 820 ? 3 : wrapW > 520 ? 2 : 1, W = Math.floor((wrapW - 28 - (cols - 1) * 12) / cols - 26), H = 150;
      $('ba-cards').style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      $('ba-cards').innerHTML = FIND.map((f, i) => { const a = ans[i], ok = a !== null && a === f.lie; return `<div class="ca-card${a === null ? '' : ok ? ' ca-right' : ' ca-wrong'}"><p class="ca-ct">${i + 1}. ${X(f.t)}</p>${svgOpen(W, H, f.t)}${f.draw(W, H)}</svg><div class="wbtns"><button type="button" class="btn small ghost" data-i="${i}" data-a="1"${a !== null ? ' disabled' : ''}${a === 1 ? ' aria-pressed="true"' : ''}>Обман</button><button type="button" class="btn small ghost" data-i="${i}" data-a="0"${a !== null ? ' disabled' : ''}${a === 0 ? ' aria-pressed="true"' : ''}>Честно</button></div>${a === null ? '' : `<p class="ca-verd"><b>${f.lie ? 'Обман.' : 'Честно.'}</b> ${X(f.why)}</p>`}</div>`; }).join('');
      const n = ans.filter(a => a !== null).length, hit = FIND.filter((f, i) => f.lie && ans[i] === 1).length, fa = FIND.filter((f, i) => !f.lie && ans[i] === 1).length;
      $('bf-n').textContent = `Ответов: ${n} из ${FIND.length}`;
      $('bf-hit').textContent = `Обманов найдено: ${hit} из ${FIND.filter(f => f.lie).length}`;
      $('bf-fa').textContent = `Ложных тревог: ${fa}`;
    }
    function draw() {
      $('ba-fix').hidden = mode !== 'fix'; $('ba-find').hidden = mode !== 'find';
      box.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
      $('ba-hint').textContent = mode === 'fix' ? 'Выберите график и включайте правки по одной: чек-лист справа пересчитывается, а лучшая правка подсвечена.' : 'Для каждого графика решите: шкала обманывает или честная? После ответа — разбор и фактор лжи.';
      if (mode === 'fix') drawFix(); else drawFind();
    }
    box.addEventListener('click', e => {
      const md = e.target.closest('[data-mode]'), cb = e.target.closest('[data-c]'), fx = e.target.closest('[data-f]'), an = e.target.closest('[data-a]');
      if (md) { mode = md.dataset.mode; }
      else if (cb) { cur = +cb.dataset.c; msg = ''; }
      else if (fx) { const c = CHARTS[cur], k = fx.dataset.f, s = st[cur]; s[k] = !s[k]; const f = c.fixes.find(q => q[0] === k); msg = s[k] ? `«${f[1]}». ${f[2]}` : `Правка «${f[1]}» выключена.`; }
      else if (an) { const i = +an.dataset.i; if (ans[i] === null) ans[i] = +an.dataset.a; }
      else return;
      draw();
    });
    $('ba-reset').addEventListener('click', () => { reset(); draw(); });
    let rw = 0; const ro = new ResizeObserver(() => { const w = box.clientWidth; if (w !== rw) { rw = w; draw(); } });
    reset(); draw(); ro.observe(box);
    return {
      describe() {
        if (mode === 'find') return `режим «Найди обман»: ${FIND.map((f, i) => `${i + 1}) «${f.t}» — ${ans[i] === null ? 'без ответа' : (ans[i] ? 'ответ «обман»' : 'ответ «честно»') + (ans[i] === f.lie ? ', верно' : ', неверно')}`).join('; ')}`;
        const c = CHARTS[cur], s = st[cur], m = c.m(s);
        return `режим «Правки», график «${c.tab}» (${c.what}); включены правки: ${c.fixes.filter(f => s[f[0]]).map(f => f[1]).join(', ') || 'нет'}; чек-лист: ${score(m)} из ${MAXP} баллов; не выполнено: ${ITEMS.filter(([k]) => !m[k][0]).map(([, n]) => n).join(', ') || 'всё выполнено'}`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-8-4',
    short: 'DA-08',
    title: 'График как аргумент: заголовок-вывод, аннотации, антипаттерны',
    where: 'блок «Дата аналитика», тема 08 «Визуализация в Python», страница 8.4',
    aiData: 'учебная выручка магазина по месяцам 2024–2025 и 10 каналам продаж (sales_monthly.csv); в июне 2025 вышел релиз приложения, и выручка канала «приложение» удвоилась',
    scene,
    widgets: { ba: buildBA },
    code: /*code:start*/{"highlight": {"title": "Выделить одну серию: девять линий уходят в фон, одна — в цвет", "badge": "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0", "lang": "python", "code": "import matplotlib.pyplot as plt\nimport pandas as pd\n\nplt.rcParams[\"svg.fonttype\"] = \"none\"  # текст в SVG остаётся текстом, а не кривыми\n\nGREY, ACCENT = \"#BBBBBB\", \"#0072B2\"  # фон и акцент: синий из палитры Окабе — Ито\n\ndef highlight(ax, wide, key):\n    \"\"\"Все столбцы wide — серым фоном, столбец key — цветом поверх них.\"\"\"\n    for name, s in wide.items():\n        on = name == key\n        ax.plot(s.index, s.values, color=ACCENT if on else GREY,\n                lw=2.6 if on else 1.0, zorder=3 if on else 1)\n    return ax\n\ndf = pd.read_csv(\"data/viz/sales_monthly.csv\")\nwide = df.pivot_table(index=\"month\", columns=\"channel\",\n                      values=\"revenue\", aggfunc=\"sum\") / 1e6  # млн ₽\nwide.index = pd.PeriodIndex(wide.index, freq=\"M\").to_timestamp()\nprint(wide.shape, \"— 24 месяца × 10 каналов\")\n\nfig, ax = plt.subplots(figsize=(7, 3.4))\nhighlight(ax, wide, \"приложение\")\nax.spines[[\"top\", \"right\"]].set_visible(False)\nfig.savefig(\"highlight.svg\", bbox_inches=\"tight\")", "out": "(24, 10) — 24 месяца × 10 каналов", "note": "Блоки этого раздела идут подряд, как ячейки одного ноутбука: каждый следующий пользуется тем, что определено выше. Данные — общий набор data/viz/."}, "labels": {"title": "Прямые подписи: имя у конца линии, близкие подписи раздвинуты", "badge": "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0", "lang": "python", "code": "def label_ends(ax, wide, key, min_gap=0.45):\n    \"\"\"Подписи у последней точки каждой линии; близкие раздвигаем на min_gap.\"\"\"\n    last = wide.iloc[-1].sort_values()          # значения в последнем месяце\n    ys = []\n    for y in last.values:                       # снизу вверх: не ближе min_gap\n        ys.append(max(y, ys[-1] + min_gap) if ys else y)\n    x = wide.index[-1] + pd.Timedelta(days=12)  # чуть правее конца линий\n    for (name, y0), y in zip(last.items(), ys):\n        ax.text(x, y, name, va=\"center\", fontsize=8.5,\n                color=ACCENT if name == key else \"#777777\",\n                fontweight=\"bold\" if name == key else \"normal\")\n    return pd.DataFrame({\"дек 2025\": last.round(2), \"подпись на\": [round(y, 2) for y in ys]})\n\nfig, ax = plt.subplots(figsize=(7, 3.4))\nhighlight(ax, wide, \"приложение\")\nprint(label_ends(ax, wide, \"приложение\"))\nax.spines[[\"top\", \"right\"]].set_visible(False)\nfig.savefig(\"labels.svg\", bbox_inches=\"tight\")", "out": "                дек 2025  подпись на\nchannel                             \nколл-центр          0.58        0.58\nкешбэк-сервисы      1.26        1.26\nофлайн-точки        1.46        1.71\nпартнёры            1.92        2.16\nсоцсети             2.13        2.61\nрассылка            3.11        3.11\nпоиск               5.35        5.35\nмаркетплейс         7.17        7.17\nприложение          8.03        8.03\nсайт               10.74       10.74", "note": "Продолжение первого блока: highlight, wide, ACCENT, plt и pd — оттуда."}, "annotate": {"title": "Аннотация события и заголовок, который сначала проверен числами", "badge": "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0", "lang": "python", "code": "app = wide[\"приложение\"]\nx = app[\"2025-07-01\"] / app[\"2025-05-01\"]     # проверяем вывод раньше, чем пишем его\nbase = app[\"2024-07-01\"] / app[\"2024-05-01\"]  # тот же отрезок год назад: не сезон ли это?\nprint(f\"май → июль 2025: ×{x:.2f}; май → июль 2024: ×{base:.2f}\")\nassert x > 1.9 and base < 1.1, \"заголовок «удвоилась» данными не подтверждается\"\n\nrelease = pd.Timestamp(\"2025-06-01\")\nfig, ax = plt.subplots(figsize=(7, 3.8))\nhighlight(ax, wide, \"приложение\")\nlabel_ends(ax, wide, \"приложение\")\nax.axvline(release, color=\"#777777\", lw=0.8, ls=\"--\", zorder=0)\nax.annotate(\"релиз приложения\", xy=(release, 1), xycoords=(\"data\", \"axes fraction\"),\n            xytext=(4, -2), textcoords=\"offset points\", va=\"top\", fontsize=9)\nax.set_title(\"Выручка приложения удвоилась после релиза в июне\",\n             loc=\"left\", fontweight=\"bold\", pad=22)\nax.text(0, 1.03, \"Выручка по каналам продаж, млн ₽ в месяц\",\n        transform=ax.transAxes, color=\"#555555\")\nfig.text(0.01, 0.01, \"Источник: учебные данные магазина, sales_monthly.csv\",\n         fontsize=8, color=\"#777777\")\nax.spines[[\"top\", \"right\"]].set_visible(False)\nfig.savefig(\"annotated.svg\", bbox_inches=\"tight\")", "out": "май → июль 2025: ×1.98; май → июль 2024: ×1.02", "note": "Продолжение: highlight, label_ends и wide — из блоков выше."}, "style_file": {"title": "Файл стиля textbook.mplstyle: всё оформление в одном месте", "badge": "проверено: matplotlib 3.10.0, подключается в блоке ниже", "lang": "text", "code": "# textbook.mplstyle — стиль курса «Аналитика 101»\n# Цвета пишутся без «#»: в этом формате «#» начинает комментарий\nfigure.figsize      : 7, 3.8\nsavefig.bbox        : tight\nsvg.fonttype        : none\nfont.family         : sans-serif\nfont.sans-serif     : Onest, DejaVu Sans, Arial\nfont.size           : 10\naxes.titlesize      : 13\naxes.titleweight    : bold\naxes.titlelocation  : left\naxes.titlepad       : 22\naxes.spines.top     : False\naxes.spines.right   : False\naxes.edgecolor      : 888888\naxes.grid           : True\naxes.grid.axis      : y\ngrid.color          : E8E8E8\ngrid.linewidth      : 0.8\nxtick.color         : 555555\nytick.color         : 555555\nlines.linewidth     : 1.6\nlegend.frameon      : False\naxes.prop_cycle     : cycler(\"color\", [\"0072B2\", \"D55E00\", \"009E73\", \"CC79A7\", \"E69F00\", \"56B4E9\", \"000000\"])"}, "style": {"title": "Стиль подключается одной строкой и действует на все графики", "badge": "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0", "lang": "python", "code": "plt.style.use(\"textbook.mplstyle\")  # путь к файлу; можно положить в stylelib и звать по имени\nprint(\"заголовок:\", plt.rcParams[\"axes.titlelocation\"],\n      \"| верхняя рамка:\", plt.rcParams[\"axes.spines.top\"],\n      \"| палитра:\", plt.rcParams[\"axes.prop_cycle\"].by_key()[\"color\"][:3])\n\nfig, ax = plt.subplots()             # рамки, сетка, шрифт и заголовок — уже из стиля\nhighlight(ax, wide, \"приложение\")\nlabel_ends(ax, wide, \"приложение\")\nax.axvline(release, color=\"#777777\", lw=0.8, ls=\"--\", zorder=0)\nax.set_title(\"Выручка приложения удвоилась после релиза в июне\")\nfig.savefig(\"styled.svg\")\n\nwith plt.style.context(\"default\"):   # временно вернуть стандартный вид\n    print(\"внутри style.context('default') верхняя рамка:\", plt.rcParams[\"axes.spines.top\"])", "out": "заголовок: left | верхняя рамка: False | палитра: ['#0072B2', '#D55E00', '#009E73']\nвнутри style.context('default') верхняя рамка: True", "note": "Продолжение: highlight, label_ends, wide и release — из блоков выше; файл textbook.mplstyle должен лежать в рабочей папке."}, "palette": {"title": "Палитра под дейтеранопией: у tab10 сливаются четыре пары, у стиля учебника — ни одной", "badge": "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\nfrom itertools import combinations\nfrom matplotlib.colors import to_rgb\n\n# Матрица Machado и др. (2009) для дейтеранопии, применяется к линейному RGB\nM = np.array([[0.367322, 0.860646, -0.227968],\n              [0.280085, 0.672501, 0.047413],\n              [-0.011820, 0.042940, 0.968881]])\nXYZ = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])\n\ndef lab(hex_, deut=False):\n    c = np.array(to_rgb(hex_))\n    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)  # sRGB → линейный\n    if deut:\n        c = np.clip(M @ c, 0, 1)\n    t = XYZ @ c / np.array([0.95047, 1.0, 1.08883])\n    f = np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)\n    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])\n\ndef merged(pal, thr=10):\n    \"\"\"Пары цветов, которые при дейтеранопии ближе thr по ΔE (CIELAB).\"\"\"\n    return [f\"{a}~{b}\" for a, b in combinations(pal, 2)\n            if np.linalg.norm(lab(a, True) - lab(b, True)) < thr]\n\npalettes = {\n    \"tab10 (по умолчанию)\": [\"#1f77b4\", \"#ff7f0e\", \"#2ca02c\", \"#d62728\", \"#9467bd\",\n                             \"#8c564b\", \"#e377c2\", \"#7f7f7f\", \"#bcbd22\", \"#17becf\"],\n    \"токены учебника\": [\"#2f6db5\", \"#d27a12\", \"#17895f\", \"#c2417a\",\n                        \"#7b5bd6\", \"#a8860f\", \"#23919f\"],\n    \"стиль учебника\": plt.rcParams[\"axes.prop_cycle\"].by_key()[\"color\"],\n    \"серый + акцент\": [GREY, ACCENT],\n}\nfor name, pal in palettes.items():\n    pairs = merged(pal)\n    print(f\"{name:21} {len(pal):2} цв., сливаются {len(pairs)}: {' '.join(pairs) or '—'}\")", "out": "tab10 (по умолчанию)  10 цв., сливаются 4: #1f77b4~#9467bd #ff7f0e~#bcbd22 #2ca02c~#d62728 #e377c2~#17becf\nтокены учебника        7 цв., сливаются 2: #d27a12~#a8860f #17895f~#c2417a\nстиль учебника         7 цв., сливаются 0: —\nсерый + акцент         2 цв., сливаются 0: —", "note": "Продолжение: plt, GREY и ACCENT — из первого блока, палитра стиля — из подключённого textbook.mplstyle."}}/*code:end*/,
    questions: {
    q1: { sec: 'argue', title: 'Сначала предскажите', q: 'Выручка IV квартала 2025 года на 34% больше, чем во II квартале. Ось Y столбчатого графика начинается с 80 млн ₽. Во сколько раз столбец IV квартала выглядит выше столбца II квартала?', opts: [['В 1,34 раза: ось не меняет пропорций'], ['Примерно в 2 раза'], ['Примерно в 4 раза', 1], ['В 34 раза']],
      why: 'Над осью видна только часть столбца выше 80 млн: у IV квартала 121,3 − 80 = 41,3 млн, у II — 90,3 − 80 = 10,3 млн. Отношение 41,3 / 10,3 ≈ 4. Рост на 34% нарисован как рост на 302%: фактор лжи ≈ 8,8. Это график № 2 в интерактиве — включите «Ось с нуля».' },
    q2: { sec: 'idea', q: 'В сцене перед заголовком «удвоилась» сравнили май → июль 2024 года. Зачем?', opts: [['Чтобы убедиться, что скачок не сезонный: год назад тот же отрезок дал ×1,02', 1], ['Чтобы посчитать годовой рост приложения'], ['Чтобы найти пропуски в данных за 2024 год'], ['Чтобы подобрать цвет акцента под прошлый год']],
      why: 'Рост с мая по июль мог оказаться летней сезонностью. Год назад тот же отрезок дал ×1,02, а остальные каналы в 2025 изменились в 0,94–1,12 раза, значит, скачок ×1,98 связан с релизом по времени, а не с сезоном. Годовой рост и пропуски — другие вопросы, а цвет от данных прошлого года не зависит.' },
    q3: { sec: 'idea', q: 'Как превратить заголовок «Продажи по регионам» в вывод для графика выручки 2025 года по четырём странам?', opts: [['«Продажи по регионам, 2025, млн ₽»'], ['«Беларусь и Россия дают 70% выручки»', 1], ['«Как распределены продажи по регионам?»'], ['«Регионы: динамика и структура продаж»']],
      why: 'Вывод — утверждение, которое можно проверить: в учебных данных Беларусь — 36,2%, Россия — 33,8%, вместе 70%. Вариант с годом и единицами — хороший подзаголовок, но по-прежнему название. Вопрос перекладывает вывод на читателя, а «динамика и структура» — снова название осей.' },
    q4: { sec: 'argue', q: 'Когда ось Y можно начинать не с нуля?', opts: [['На столбчатом графике, если столбцы почти одинаковые'], ['На линии или точках, если ось подписана: они кодируют положение, а не длину', 1], ['Никогда: любая обрезанная ось — обман'], ['Когда так выбрала библиотека по умолчанию']],
      why: 'У столбца и закрашенной площади значение — это длина или площадь от нуля, и обрезка меняет пропорции. У линии и точки значение — положение на шкале, поэтому ось с 8% или с 40 млн допустима и иногда нужна, чтобы увидеть изменение. Значение по умолчанию в библиотеке ничего не гарантирует: Matplotlib сам подбирает пределы оси по данным.' },
    q5: { sec: 'idea', q: 'Что убрать с графика первым?', opts: [['Подписи осей и единицы'], ['Украшения без данных: 3D, тени, градиенты, фон, тяжёлую рамку', 1], ['Заголовок: он повторяет то, что видно'], ['Самый маленький ряд']],
      why: 'Первыми уходят чернила, которые не изображают данные и не помогают их читать: это графический мусор по Тафти. Оси, единицы и подписи тоже не данные, но без них график не прочитать — отсюда оговорка «в разумных пределах». Заголовок не убирают, а переписывают в вывод; удалять ряды ради простоты — значит менять данные.' },
    q6: { sec: 'code', q: 'Зачем в функции highlight у выделенной линии zorder=3?', code: 'ax.plot(s.index, s.values, color=ACCENT if on else GREY,\n        lw=2.6 if on else 1.0, zorder=3 if on else 1)', lang: 'python', opts: [['Чтобы её не перекрыли серые линии, нарисованные позже', 1], ['Чтобы она первой попала в легенду'], ['Чтобы Matplotlib нарисовал её толще'], ['Чтобы она взяла третий цвет из цикла']],
      why: 'Линии рисуются в порядке вызовов, и «приложение» в алфавитном порядке — седьмое: три серые линии легли бы поверх него. zorder задаёт порядок слоёв: элемент с бо́льшим значением рисуется выше. Толщину задаёт lw, цвет — color, а легенды здесь нет вовсе.' },
    q7: { sec: 'idea', q: 'В таблице рост покрашен зелёным, падение — красным. Как сделать её читаемой при дейтеранопии?', opts: [['Взять зелёный и красный поярче'], ['Продублировать смысл знаком «+» и «−», а цвета взять сине-оранжевые', 1], ['Добавить легенду «зелёный — рост, красный — падение»'], ['Ничего: дейтеранопия встречается редко']],
      why: 'При дейтеранопии красный и зелёный сливаются, и яркость этого не исправляет. Знак в числе передаёт смысл без цвета — это избыточное кодирование, а синий с оранжевым различимы при всех частых нарушениях. Легенда не поможет: читатель не отличит цвета, к которым она отсылает. И это не редкость: около 8% мужчин.' }
    },
    glossary: {
      actiontitle: { t: 'Заголовок-вывод', en: 'action title, assertive title', d: 'Заголовок, который формулирует главную мысль графика законченной фразой. Что на осях и в каких единицах — в подзаголовке.' },
      annotation: { t: 'Аннотация', en: 'annotation', d: 'Подпись и метка прямо на графике, которые объясняют точку или событие: релиз, сбой, смену цены.' },
      antipattern: { t: 'Антипаттерн', en: 'anti-pattern', d: 'Привычный приём, который выглядит решением, но мешает читать или искажает данные: обрезанная ось столбцов, 3D, радуга.' },
      accent: { t: 'Акцент', en: 'highlight, emphasis', d: 'Единственный заметный цвет или толщина на графике, которые показывают главный ряд; всё остальное — приглушённый фон.' },
      directlabel: { t: 'Прямая подпись', en: 'direct labeling', d: 'Имя ряда или значение рядом с данными, например у конца линии. Заменяет легенду.' },
      legend: { t: 'Легенда', en: 'legend', d: 'Отдельный ключ «цвет — ряд». Каждая её строка — сверка, которую делает читатель.' },
      spaghetti: { t: 'График-спагетти', en: 'spaghetti chart', d: 'Линейный график с таким числом пересекающихся линий, что отдельный ряд не проследить.' },
      dataink: { t: 'Соотношение чернил и данных', en: 'data-ink ratio', d: 'Доля чернил графика, которая изображает данные. Тафти советует её увеличивать — в разумных пределах.' },
      chartjunk: { t: 'Графический мусор', en: 'chartjunk', d: 'Украшения без данных: 3D, тени, градиенты, фоновые картинки, тяжёлые рамки и сетки.' },
      semantic: { t: 'Семантика цвета', en: 'semantic color', d: 'Смысл, который читатель приписывает цвету: красный — плохо, зелёный — хорошо, один канал — один цвет.' },
      deut: { t: 'Дейтеранопия', en: 'deuteranopia', d: 'Нарушение цветового зрения, при котором не работают колбочки средних длин волн и красный с зелёным сливаются.' },
      access: { t: 'Доступная палитра', en: 'colorblind-safe palette', d: 'Цвета, различимые и при нарушениях цветового зрения. Самая известная — палитра Окабе — Ито из восьми цветов.' },
      redundant: { t: 'Избыточное кодирование', en: 'redundant coding', d: 'Передача одного признака двумя способами: цветом и формой, цветом и знаком. Цвет становится помощью, а не единственным ключом.' },
      truncated: { t: 'Обрезанная ось', en: 'truncated axis', d: 'Ось значений, которая начинается не с нуля. Искажает столбцы и площади, для линий и точек допустима.' },
      rainbow: { t: 'Радужная шкала', en: 'rainbow colormap, jet', d: 'Цветовая шкала через весь спектр. Её светлота то растёт, то падает, и «темнее» перестаёт значить «больше».' },
      sequential: { t: 'Последовательная палитра', en: 'sequential colormap', d: 'Шкала одного тона от светлого к тёмному: светлота меняется вместе со значением.' },
      liefactor: { t: 'Фактор лжи', en: 'lie factor', d: 'Изменение, нарисованное на графике, делённое на изменение в данных. Честно — около 1, вне 0,95–1,05 — заметное искажение.' },
      mplstyle: { t: 'Файл стиля', en: 'Matplotlib style sheet, .mplstyle', d: 'Текстовый файл с настройками оформления Matplotlib. Подключается командой plt.style.use.' },
      rcparams: { t: 'rcParams', en: 'runtime configuration parameters', d: 'Словарь текущих настроек Matplotlib: шрифты, рамки, сетка, палитра. Файл стиля меняет именно его.' },
      deltae: { t: 'Цветовое расстояние ΔE', en: 'color difference, ΔE', d: 'Расстояние между цветами в пространстве CIELAB, где равные шаги примерно одинаково заметны глазу.' }
    },
    materials: [
      ['da-8-4-chart-argument.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/viz/', 'Учебные данные темы 08 — общий набор: выручка магазина sales_monthly.csv по месяцам, каналам и странам'],
      ['chart_argument.ipynb', 'Блоки кода страницы одним ноутбуком: выделение серии, подписи, аннотация, стиль, проверка палитры'],
      ['textbook.mplstyle', 'Стиль учебника: шрифт, рамки, сетка и палитра Окабе — Ито']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне пять вопросов по источнику: заголовок-вывод, акцент, прямые подписи, обрезанная ось, палитра для дальтоников. По одному за раз; после ответа объясни, где я ошибся, со ссылкой на текст источника.'],
      ['Разбор моего графика', 'Я опишу свой график: тип, ряды, цвета, заголовок, оси, подписи. Пройди со мной по чек-листу из источника и по каждому пункту задай вопрос, который поможет мне самому найти проблему. Готовых исправлений не предлагай, пока я не отвечу.'],
      ['Заголовок-вывод', 'Я пришлю название своего графика и несколько чисел из него. Помоги переписать название в вывод: сначала спроси, что я хочу сказать, потом проверь вместе со мной, подтверждают ли числа мой вариант и не нужна ли оговорка.']
    ]
  };
})();
