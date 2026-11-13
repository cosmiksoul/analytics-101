/* Страница 4.3 · Производная и градиент */
(() => {
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  // число по-русски: десятичная запятая и настоящий минус
  const num = (v, d) => { const r = Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v; return (r < 0 ? '−' : '') + Math.abs(r).toFixed(d).replace('.', ','); };
  const etaS = e => String(e).replace('.', ',');
  const FONT = '"Onest", "Segoe UI", system-ui, sans-serif', MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

  /*gd:start*/
  // Учебная поверхность ошибки: две долины и перевал между ними. Те же формулы — в блоках кода deriv.py и surface.py.
  function loss(a, b) { const t = a * a - 1; return t * t / 4 + 0.15 * a + 4 * (b * b) + 0.2; }
  function grad(a, b) { return [a * (a * a - 1) + 0.15, 8 * b]; }
  function gdStep(w, eta) { const g = grad(w[0], w[1]); return [w[0] - eta * g[0], w[1] - eta * g[1]]; }
  // Остановка, как в surface.py: вес по модулю больше 10 — разошёлся, длина градиента меньше 0,001 — сошёлся
  function gdVerdict(w) {
    if (Math.max(Math.abs(w[0]), Math.abs(w[1])) > 10) return 'div';
    const g = grad(w[0], w[1]);
    return Math.sqrt(g[0] * g[0] + g[1] * g[1]) < 1e-3 ? 'conv' : null;
  }
  function descend(start, eta, steps = 300) {
    let w = start.slice(); const P = [w];
    for (let k = 1; k <= steps; k++) { w = gdStep(w, eta); P.push(w); const v = gdVerdict(w); if (v) return { P, k, v }; }
    return { P, k: steps, v: 'none' };
  }
  /*gd:end*/

  // Карта: w1 от −2 до 2, w2 от −1,2 до 1,2. Минимумы и перевал — корни w1³ − w1 + 0,15 = 0 при w2 = 0.
  const A0 = -2, A1 = 2, B0 = -1.2, B1 = 1.2;
  const MIN_L = [-1.06792, 0], MIN_R = [0.91430, 0], PASS = [0.15363, 0], L_MIN = [0.0447, 0.3439];
  const LEVELS = [0.07, 0.13, 0.21, 0.3, 0.4, 0.52, 0.68, 0.88, 1.12, 1.4, 1.75, 2.15, 2.6, 3.1, 3.7, 4.4, 5.2, 6.1];
  // Линии уровня: «марширующие квадраты» на сетке 160 × 96, отрезки в координатах весов
  const CONT = (() => {
    const nx = 160, ny = 96, dx = (A1 - A0) / nx, dy = (B1 - B0) / ny, v = new Float64Array((nx + 1) * (ny + 1));
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) v[j * (nx + 1) + i] = loss(A0 + i * dx, B0 + j * dy);
    const at = (i, j) => v[j * (nx + 1) + i];
    return LEVELS.map(lv => {
      const s = [];
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const c = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)];
        const x0 = A0 + i * dx, x1 = x0 + dx, y0 = B0 + j * dy, y1 = y0 + dy;
        const E = [[0, 1, x0, y0, x1, y0], [1, 2, x1, y0, x1, y1], [2, 3, x1, y1, x0, y1], [3, 0, x0, y1, x0, y0]], pts = [];
        E.forEach(([p, q, xa, ya, xb, yb]) => { const va = c[p], vb = c[q]; if ((va < lv) !== (vb < lv)) { const t = (lv - va) / (vb - va); pts.push(xa + (xb - xa) * t, ya + (yb - ya) * t); } });
        if (pts.length >= 4) s.push(...pts);
      }
      return s;
    });
  })();

  /* ---------- рисование на canvas: общее для сцены и интерактива ---------- */
  function paintMap(w, h, dpr, pal) {
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    const g = c.getContext('2d'), img = g.createImageData(c.width, c.height), d = img.data, lo = pal.lo, hi = pal.hi;
    for (let py = 0; py < c.height; py++) {
      const b = B1 - (py + 0.5) / c.height * (B1 - B0);
      for (let px = 0; px < c.width; px++) {
        const a = A0 + (px + 0.5) / c.width * (A1 - A0), t = Math.sqrt(clamp((loss(a, b) - 0.04) / 6.2, 0, 1)), o = (py * c.width + px) * 4;
        d[o] = lo[0] + (hi[0] - lo[0]) * t; d[o + 1] = lo[1] + (hi[1] - lo[1]) * t; d[o + 2] = lo[2] + (hi[2] - lo[2]) * t; d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const sx = a => (a - A0) / (A1 - A0) * c.width, sy = b => (B1 - b) / (B1 - B0) * c.height;
    g.lineWidth = Math.max(1, dpr * 0.75); g.strokeStyle = pal.line;
    CONT.forEach(s => { g.beginPath(); for (let j = 0; j < s.length; j += 4) { g.moveTo(sx(s[j]), sy(s[j + 1])); g.lineTo(sx(s[j + 2]), sy(s[j + 3])); } g.stroke(); });
    return c;
  }
  function arrow(g, x0, y0, x1, y1, col, lw, hs, dash) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 1) return;
    const ux = dx / len, uy = dy / len, h = Math.min(hs, len * 0.6);
    g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw; g.setLineDash(dash || []);
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - ux * h * 0.8, y1 - uy * h * 0.8); g.stroke(); g.setLineDash([]);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - ux * h - uy * h * 0.45, y1 - uy * h + ux * h * 0.45); g.lineTo(x1 - ux * h + uy * h * 0.45, y1 - uy * h - ux * h * 0.45); g.closePath(); g.fill();
  }
  function rrect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }
  const hexRgb = h => { h = h.trim(); if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; const n = parseInt(h.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

  /* ===================== Сцена: шарик на карте ошибки =====================
     Траектории посчитаны NumPy 2.5.3 по той же функции (gen_scene.py): [w1, w2, L] на каждой итерации.
     a — старт (−1,8; 1,0), η = 0,05; b — тот же старт, η = 0,24; c — тот же старт, η = 0,002, первые 52 итерации;
     d — старт (1,7; 0,9), η = 0,05. Остановка — длина градиента меньше 0,001. */
  const TR = {"a":[[-1.8,1.0,5.1844],[-1.6059,0.6,2.0224],[-1.48662,0.36,0.8615],[-1.40418,0.216,0.4121],[-1.34345,0.1296,0.2276],[-1.29689,0.07776,0.1459],[-1.26017,0.04666,0.1061],[-1.23062,0.02799,0.0847],[-1.20647,0.0168,0.072],[-1.18649,0.01008,0.064],[-1.1698,0.00605,0.0586],[-1.15575,0.00363,0.0549],[-1.14384,0.00218,0.0522],[-1.13371,0.00131,0.0503],[-1.12504,0.00078,0.0489],[-1.11759,0.00047,0.0479],[-1.11118,0.00028,0.0471],[-1.10563,0.00017,0.0465],[-1.10084,0.0001,0.0461],[-1.09668,6e-05,0.0458],[-1.09306,4e-05,0.0455],[-1.08992,2e-05,0.0453],[-1.08718,1e-05,0.0452],[-1.08479,1e-05,0.0451],[-1.0827,0.0,0.045],[-1.08087,0.0,0.0449],[-1.07928,0.0,0.0449],[-1.07788,0.0,0.0449],[-1.07666,0.0,0.0448],[-1.07559,0.0,0.0448],[-1.07465,0.0,0.0448],[-1.07383,0.0,0.0448],[-1.07311,0.0,0.0448],[-1.07248,0.0,0.0448],[-1.07192,0.0,0.0448],[-1.07144,0.0,0.0448],[-1.07101,0.0,0.0448],[-1.07063,0.0,0.0448],[-1.0703,0.0,0.0448],[-1.07002,0.0,0.0447],[-1.06976,0.0,0.0447],[-1.06954,0.0,0.0447],[-1.06934,0.0,0.0447],[-1.06917,0.0,0.0447],[-1.06902,0.0,0.0447],[-1.06889,0.0,0.0447],[-1.06877,0.0,0.0447],[-1.06867,0.0,0.0447],[-1.06858,0.0,0.0447],[-1.0685,0.0,0.0447],[-1.06843,0.0,0.0447],[-1.06837,0.0,0.0447],[-1.06831,0.0,0.0447]],"b":[[-1.8,1.0,5.1844],[-0.86832,-0.92,3.4705],[-0.95559,0.8464,2.9241],[-1.01151,-0.77869,2.4738],[-1.04189,0.71639,2.0984],[-1.0565,-0.65908,1.7825],[-1.06304,0.60636,1.5154],[-1.06586,-0.55785,1.2895],[-1.06706,0.51322,1.0983],[-1.06756,-0.47216,0.9365],[-1.06777,0.43439,0.7995],[-1.06786,-0.39964,0.6836],[-1.0679,0.36767,0.5855],[-1.06791,-0.33825,0.5024],[-1.06792,0.31119,0.4321],[-1.06792,-0.2863,0.3726],[-1.06792,0.26339,0.3222],[-1.06792,-0.24232,0.2796],[-1.06792,0.22294,0.2435],[-1.06792,-0.2051,0.213],[-1.06792,0.18869,0.1872],[-1.06792,-0.1736,0.1653],[-1.06792,0.15971,0.1468],[-1.06792,-0.14693,0.1311],[-1.06792,0.13518,0.1178],[-1.06792,-0.12436,0.1066],[-1.06792,0.11442,0.0971],[-1.06792,-0.10526,0.0891],[-1.06792,0.09684,0.0823],[-1.06792,-0.08909,0.0765],[-1.06792,0.08197,0.0716],[-1.06792,-0.07541,0.0675],[-1.06792,0.06938,0.064],[-1.06792,-0.06383,0.061],[-1.06792,0.05872,0.0585],[-1.06792,-0.05402,0.0564],[-1.06792,0.0497,0.0546],[-1.06792,-0.04572,0.0531],[-1.06792,0.04207,0.0518],[-1.06792,-0.0387,0.0507],[-1.06792,0.03561,0.0498],[-1.06792,-0.03276,0.049],[-1.06792,0.03014,0.0484],[-1.06792,-0.02773,0.0478],[-1.06792,0.02551,0.0473],[-1.06792,-0.02347,0.0469],[-1.06792,0.02159,0.0466],[-1.06792,-0.01986,0.0463],[-1.06792,0.01827,0.0461],[-1.06792,-0.01681,0.0459],[-1.06792,0.01547,0.0457],[-1.06792,-0.01423,0.0456],[-1.06792,0.01309,0.0454],[-1.06792,-0.01204,0.0453],[-1.06792,0.01108,0.0452],[-1.06792,-0.01019,0.0452],[-1.06792,0.00938,0.0451],[-1.06792,-0.00863,0.045],[-1.06792,0.00794,0.045],[-1.06792,-0.0073,0.045],[-1.06792,0.00672,0.0449],[-1.06792,-0.00618,0.0449],[-1.06792,0.00569,0.0449],[-1.06792,-0.00523,0.0449],[-1.06792,0.00481,0.0448],[-1.06792,-0.00443,0.0448],[-1.06792,0.00407,0.0448],[-1.06792,-0.00375,0.0448],[-1.06792,0.00345,0.0448],[-1.06792,-0.00317,0.0448],[-1.06792,0.00292,0.0448],[-1.06792,-0.00268,0.0448],[-1.06792,0.00247,0.0448],[-1.06792,-0.00227,0.0448],[-1.06792,0.00209,0.0448],[-1.06792,-0.00192,0.0448],[-1.06792,0.00177,0.0448],[-1.06792,-0.00163,0.0448],[-1.06792,0.0015,0.0448],[-1.06792,-0.00138,0.0448],[-1.06792,0.00127,0.0448],[-1.06792,-0.00117,0.0447],[-1.06792,0.00107,0.0447],[-1.06792,-0.00099,0.0447],[-1.06792,0.00091,0.0447],[-1.06792,-0.00084,0.0447],[-1.06792,0.00077,0.0447],[-1.06792,-0.00071,0.0447],[-1.06792,0.00065,0.0447],[-1.06792,-0.0006,0.0447],[-1.06792,0.00055,0.0447],[-1.06792,-0.00051,0.0447],[-1.06792,0.00047,0.0447],[-1.06792,-0.00043,0.0447],[-1.06792,0.00039,0.0447],[-1.06792,-0.00036,0.0447],[-1.06792,0.00033,0.0447],[-1.06792,-0.00031,0.0447],[-1.06792,0.00028,0.0447],[-1.06792,-0.00026,0.0447],[-1.06792,0.00024,0.0447],[-1.06792,-0.00022,0.0447],[-1.06792,0.0002,0.0447],[-1.06792,-0.00019,0.0447],[-1.06792,0.00017,0.0447],[-1.06792,-0.00016,0.0447],[-1.06792,0.00015,0.0447],[-1.06792,-0.00013,0.0447],[-1.06792,0.00012,0.0447]],"c":[[-1.8,1.0,5.1844],[-1.79224,0.984,5.0275],[-1.78461,0.96826,4.8757],[-1.77711,0.95276,4.7288],[-1.76974,0.93752,4.5866],[-1.76249,0.92252,4.449],[-1.75537,0.90776,4.3158],[-1.74836,0.89323,4.1868],[-1.74147,0.87894,4.0619],[-1.73469,0.86488,3.941],[-1.72802,0.85104,3.824],[-1.72145,0.83743,3.7106],[-1.71499,0.82403,3.6009],[-1.70864,0.81084,3.4946],[-1.70238,0.79787,3.3917],[-1.69621,0.7851,3.292],[-1.69015,0.77254,3.1955],[-1.68417,0.76018,3.102],[-1.67828,0.74802,3.0114],[-1.67249,0.73605,2.9237],[-1.66678,0.72427,2.8387],[-1.66115,0.71268,2.7564],[-1.6556,0.70128,2.6766],[-1.65014,0.69006,2.5994],[-1.64475,0.67902,2.5245],[-1.63944,0.66816,2.452],[-1.63421,0.65746,2.3817],[-1.62905,0.64695,2.3136],[-1.62396,0.63659,2.2476],[-1.61894,0.62641,2.1836],[-1.61399,0.61639,2.1216],[-1.60911,0.60652,2.0615],[-1.6043,0.59682,2.0033],[-1.59955,0.58727,1.9469],[-1.59486,0.57787,1.8922],[-1.59024,0.56863,1.8392],[-1.58568,0.55953,1.7878],[-1.58117,0.55058,1.738],[-1.57673,0.54177,1.6896],[-1.57234,0.5331,1.6428],[-1.56801,0.52457,1.5974],[-1.56374,0.51618,1.5534],[-1.55952,0.50792,1.5107],[-1.55535,0.49979,1.4693],[-1.55124,0.4918,1.4292],[-1.54717,0.48393,1.3903],[-1.54316,0.47618,1.3526],[-1.5392,0.46856,1.316],[-1.53528,0.46107,1.2805],[-1.53142,0.45369,1.246],[-1.5276,0.44643,1.2127],[-1.52382,0.43929,1.1803],[-1.52009,0.43226,1.1489]],"d":[[1.7,0.9,4.588],[1.53185,0.54,2.0495],[1.42121,0.324,1.0931],[1.34124,0.1944,0.7119],[1.28016,0.11664,0.5485],[1.23177,0.06998,0.4712],[1.19242,0.04199,0.4304],[1.15977,0.02519,0.4063],[1.13226,0.01512,0.3906],[1.10879,0.00907,0.3798],[1.08857,0.00544,0.372],[1.071,0.00327,0.3661],[1.05563,0.00196,0.3616],[1.04209,0.00118,0.3582],[1.03011,0.00071,0.3555],[1.01947,0.00042,0.3533],[1.00996,0.00025,0.3516],[1.00145,0.00015,0.3502],[0.99381,9e-05,0.3491],[0.98692,5e-05,0.3482],[0.9807,3e-05,0.3475],[0.97508,2e-05,0.3469],[0.96998,1e-05,0.3464],[0.96534,1e-05,0.346],[0.96113,0.0,0.3456],[0.9573,0.0,0.3453],[0.9538,0.0,0.3451],[0.9506,0.0,0.3449],[0.94768,0.0,0.3447],[0.94501,0.0,0.3446],[0.94256,0.0,0.3445],[0.94032,0.0,0.3444],[0.93827,0.0,0.3443],[0.93638,0.0,0.3443],[0.93465,0.0,0.3442],[0.93306,0.0,0.3441],[0.93159,0.0,0.3441],[0.93025,0.0,0.3441],[0.92901,0.0,0.344],[0.92787,0.0,0.344],[0.92682,0.0,0.344],[0.92586,0.0,0.344],[0.92497,0.0,0.344],[0.92415,0.0,0.3439],[0.92339,0.0,0.3439],[0.92269,0.0,0.3439],[0.92205,0.0,0.3439],[0.92146,0.0,0.3439],[0.92091,0.0,0.3439],[0.92041,0.0,0.3439],[0.91994,0.0,0.3439],[0.91951,0.0,0.3439],[0.91911,0.0,0.3439],[0.91875,0.0,0.3439],[0.91841,0.0,0.3439],[0.9181,0.0,0.3439],[0.91781,0.0,0.3439],[0.91754,0.0,0.3439],[0.9173,0.0,0.3439],[0.91707,0.0,0.3439],[0.91686,0.0,0.3439],[0.91666,0.0,0.3439],[0.91649,0.0,0.3439],[0.91632,0.0,0.3439],[0.91617,0.0,0.3439],[0.91603,0.0,0.3439],[0.91589,0.0,0.3439],[0.91577,0.0,0.3439],[0.91566,0.0,0.3439],[0.91556,0.0,0.3439],[0.91546,0.0,0.3439],[0.91538,0.0,0.3439],[0.91529,0.0,0.3439],[0.91522,0.0,0.3439],[0.91515,0.0,0.3439],[0.91509,0.0,0.3439],[0.91503,0.0,0.3439],[0.91497,0.0,0.3439],[0.91492,0.0,0.3439]]};
  const SC = { ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#8d95aa', acc: '#36b8a6', yel: '#e3c04d', box: '#141b2b', bad: '#f2756a' };
  const RUN = { a: '#36b8a6', b: '#f0a247', c: '#6fa2ea', d: '#f06ba5' };
  const S1 = [-1.8, 1.0], L1D = loss(-1.8, 0), G1 = grad(-1.8, 1.0);
  // точка для градиента в шагах 5–6: склон правой долины, вокруг есть место под стрелки
  const GP = [1.45, -0.35], GG = grad(1.45, -0.35), LG = loss(1.45, -0.35);

  function callout(g, x, y, text, dir, W, H, col, fs, alpha) {
    if (!(alpha > 0)) return;
    g.save(); g.globalAlpha = alpha; g.font = `500 ${fs}px ${FONT}`;
    const tw = g.measureText(text).width, bw = tw + 14, bh = fs + 11, off = fs + 7;
    let bx = dir === 'l' ? x - off - bw : dir === 'r' ? x + off : x - bw / 2;
    let by = dir === 'u' ? y - off - bh : dir === 'd' ? y + off : y - bh / 2;
    bx = clamp(bx, 3, W - bw - 3); by = clamp(by, 3, H - bh - 3);
    g.strokeStyle = col; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y); g.lineTo(clamp(x, bx, bx + bw), clamp(y, by, by + bh)); g.stroke();
    rrect(g, bx, by, bw, bh, 6); g.fillStyle = SC.box; g.fill(); g.stroke();
    g.fillStyle = SC.ink; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(text, bx + 7, by + bh / 2 + 0.5);
    g.restore();
  }

  const scene = {
    parts: [{ n: '01', name: 'Наклон', s: [0, 1, 2] }, { n: '02', name: 'Градиент', s: [3, 4, 5] }, { n: '03', name: 'Спуск', s: [6, 7] }, { n: '04', name: 'Размер шага', s: [8, 9] }, { n: '05', name: 'Две долины', s: [10, 11] }],
    steps: [
      { title: 'Ошибка зависит от веса', dur: 4200, body: '<p>Модель — формула с&nbsp;весами, а&nbsp;функция потерь говорит, насколько модель ошибается при&nbsp;заданных весах. Начнём с&nbsp;одного веса w<sub>1</sub>: на&nbsp;графике ошибка L при&nbsp;каждом его значении.</p><p>Чем ниже точка, тем лучше модель. Шарик стоит при&nbsp;w<sub>1</sub> = −1,8, ошибка 1,18.</p>' },
      { title: 'Производная — предел наклона', dur: 5800, body: '<p>Наклон в&nbsp;одной точке напрямую не&nbsp;измерить: нужны две. Проведём прямую через w<sub>1</sub> и&nbsp;w<sub>1</sub> + h и&nbsp;будем уменьшать h.</p><p>Наклон прямой подходит к&nbsp;−3,88. Это предел, а&nbsp;наклон в&nbsp;точке — производная L′. Сдвиг веса на&nbsp;+0,01 уменьшит ошибку примерно на&nbsp;0,039.</p>' },
      { title: 'Знак подсказывает, куда спускаться', dur: 5200, body: '<p>Слева производная отрицательна: ошибка падает, когда вес растёт, и&nbsp;вниз ведёт шаг вправо. Справа производная положительна, и&nbsp;вниз ведёт шаг влево.</p><p>Шагать надо против знака производной. Где касательная горизонтальна, L′ = 0: на&nbsp;дне долин и&nbsp;на&nbsp;вершине между ними.</p>' },
      { title: 'Два веса — карта высот', dur: 5400, body: '<p>Добавим второй вес w<sub>2</sub>. Ошибка становится поверхностью над&nbsp;плоскостью весов, и&nbsp;мы смотрим на&nbsp;неё сверху, как на&nbsp;карту: линия уровня соединяет точки с&nbsp;одинаковой ошибкой.</p><p>Слева долина глубже, справа мельче, между ними перевал. Шарик стоит в&nbsp;(−1,8; 1,0), ошибка 5,18.</p>' },
      { title: 'Градиент из двух производных', dur: 5600, body: '<p>Возьмём точку на&nbsp;склоне правой долины, (1,45; −0,35). Частная производная — производная по&nbsp;одному весу, пока второй заморожен: по&nbsp;w<sub>1</sub> здесь 1,75, по&nbsp;w<sub>2</sub> — −2,8.</p><p>Вместе они дают градиент ∇L = (1,75; −2,8) — стрелку туда, где ошибка растёт быстрее всего. Она пересекает линию уровня под&nbsp;прямым углом.</p>' },
      { title: 'Минус градиент смотрит вниз', dur: 4400, body: '<p>Развернём стрелки: −∇L в&nbsp;каждой точке указывает самый крутой спуск. Он идёт поперёк линий уровня, а&nbsp;не&nbsp;прямо на&nbsp;дно.</p><p>У&nbsp;дна стрелки короче: склон там пологий, градиент почти ноль.</p>' },
      { title: 'Шаг за шагом в долину', dur: 6600, body: '<p>Градиентный спуск повторяет одно правило: w ← w − η·∇L. Шаг обучения η = 0,05 — множитель, на&nbsp;который умножают градиент.</p><p>На&nbsp;крутом склоне шаги длинные, у&nbsp;дна короткие.</p>' },
      { title: 'На дне градиент равен нулю', dur: 3800, body: '<p>Через 52&nbsp;итерации длина градиента меньше 0,001, и&nbsp;спуск останавливается. Это минимум: склона больше нет, ошибка 0,045.</p><p>Когда остановиться, решаем сами: порог на&nbsp;длину градиента или лимит итераций.</p>' },
      { title: 'Большой шаг раскачивает', dur: 7600, body: '<p>Шаг 0,24 почти в&nbsp;пять раз больше. Поперёк долины стенки круче всего, и&nbsp;шарик перелетает дно, бьётся в&nbsp;противоположный склон и&nbsp;качается.</p><p>Размах затухает медленно: до&nbsp;остановки 108&nbsp;итераций, вдвое дольше, чем с&nbsp;шагом 0,05. При&nbsp;шаге чуть больше размах начнёт расти.</p>' },
      { title: 'Маленький шаг ползёт', dur: 6200, body: '<p>Шаг 0,002 в&nbsp;25&nbsp;раз меньше. За&nbsp;те&nbsp;же 52&nbsp;итерации шарик прошёл около половины пути, ошибка ещё 1,15 вместо 0,045.</p><p>До&nbsp;остановки ему нужно 1&nbsp;393&nbsp;итерации, а&nbsp;на&nbsp;больших данных каждая итерация стоит времени.</p>' },
      { title: 'Другой старт — другая долина', dur: 6400, body: '<p>Тот&nbsp;же шаг 0,05, но&nbsp;старт справа, в&nbsp;(1,7; 0,9). Шарик скатывается в&nbsp;правую долину и&nbsp;останавливается: вокруг всё выше, градиент ноль.</p><p>Это локальный минимум: ошибка 0,344, а&nbsp;в&nbsp;левой долине — 0,045. Спуск видит только склон под&nbsp;собой.</p>' },
      { title: 'Исход решают шаг и старт', dur: 4200, next: 'Читать страницу', body: '<p>Правило одно: w ← w − η·∇L. Но&nbsp;маленький шаг ползёт, большой раскачивается, а&nbsp;старт выбирает долину.</p><p>У&nbsp;выпуклой функции долина одна, и&nbsp;старт не&nbsp;важен. Такова функция потерь линейной регрессии.</p>' }
    ],
    hud: [{ id: 'it', label: 'Итерация' }, { id: 'loss', label: 'Ошибка' }, { id: 'eta', label: 'Шаг' }],
    legend: '<span><i style="background:#36b8a6"></i>η 0,05</span><span><i style="background:#f0a247"></i>η 0,24</span><span><i style="background:#6fa2ea"></i>η 0,002</span><span><i style="background:#f06ba5"></i>старт справа</span>',
    info: 'СПУСК ПО СКЛОНУ',
    aiNote: 'В анимации учебная поверхность ошибки L(w₁, w₂) = ¼(w₁² − 1)² + 0,15·w₁ + 4w₂² + 0,2 с двумя долинами: левая — глобальный минимум у w₁ ≈ −1,07 с ошибкой 0,045, правая — локальный минимум у w₁ ≈ 0,91 с ошибкой 0,344, между ними перевал у w₁ ≈ 0,15. Шаги 1–3: срез при w₂ = 0; производная при w₁ = −1,8 равна −3,88 (наклон секущей при уменьшении h), при w₁ = 1,6 равна 2,65. Шаги 4–6: в точке (1,45; −0,35) на склоне правой долины градиент равен (1,75; −2,8), стрелки −∇L смотрят вниз по самому крутому склону. Спуск w ← w − η·∇L посчитан NumPy: η = 0,05 — дно за 52 итерации; η = 0,24 — качается поперёк долины, 108 итераций; η = 0,002 — за 52 итерации ошибка 1,15, до остановки 1 393 итерации; старт (1,7; 0,9) с η = 0,05 — правая долина за 78 итераций.',
    mount(root, api) {
      root.innerHTML = '<div class="dg-sc"><canvas class="dg-cv" aria-hidden="true"></canvas></div>';
      const box = root.firstChild, cv = box.firstChild, g = cv.getContext('2d');
      let W = 0, H = 0, dpr = 1, M = null, P1 = null, bg = null, sig = '', lk = 0, lp = 0, fs = 12;
      const X = a => M.x + (a - A0) / (A1 - A0) * M.w;
      const Y = b => M.y + (B1 - b) / (B1 - B0) * M.h;
      const YL = v => P1.y + P1.h - v / 2.9 * P1.h;
      const C = (x, y, t, d, col, al) => callout(g, x, y, t, d, W, H, col || SC.acc, fs, al == null ? 1 : al);

      function fit() {
        W = box.clientWidth; H = box.clientHeight; if (!W || !H) return;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        fs = W < 420 ? 11 : 12.5;
        const R = (A1 - A0) / (B1 - B0), mw = Math.min(W - 8, (H - 8) * R), mh = mw / R;
        M = { x: (W - mw) / 2, y: (H - mh) / 2, w: mw, h: mh };
        P1 = { x: M.x, w: M.w, y: 8, h: H - 8 - fs - 14 };
        bg = paintMap(M.w, M.h, dpr, { lo: [28, 96, 90], hi: [13, 18, 30], line: 'rgba(200, 214, 236, .16)' });
        sig = ''; draw(lk, lp);
      }

      const ball = (x, y, col, al) => { g.save(); g.globalAlpha = al == null ? 1 : al; g.beginPath(); g.arc(x, y, 6.5, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = col; g.stroke(); g.restore(); };
      const dot = (x, y, col, r) => { g.beginPath(); g.arc(x, y, r || 3, 0, 7); g.fillStyle = col; g.fill(); };
      function curve(t, aMax) {
        g.beginPath();
        for (let i = 0; i <= 200; i++) { const a = A0 + (A1 - A0) * i / 200; if (a > aMax + 1e-9) break; const y = lerp(YL(loss(a, 0)), Y(0), t); i ? g.lineTo(X(a), y) : g.moveTo(X(a), y); }
      }
      function axes1(al) {
        if (al <= 0) return;
        g.save(); g.globalAlpha = al; g.strokeStyle = 'rgba(183, 192, 210, .35)'; g.lineWidth = 1;
        const y0 = YL(0); g.beginPath(); g.moveTo(P1.x, y0); g.lineTo(P1.x + P1.w, y0); g.moveTo(P1.x, y0); g.lineTo(P1.x, P1.y); g.stroke();
        g.fillStyle = SC.mut; g.font = `500 ${fs - 1}px ${MONO}`; g.textBaseline = 'top'; g.textAlign = 'center';
        [-2, -1, 0, 1, 2].forEach(a => g.fillText(num(a, 0), clamp(X(a), P1.x + 8, P1.x + P1.w - 8), y0 + 5));
        g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText('w₁', P1.x + P1.w, y0 - 4);
        g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('ошибка L', P1.x + 6, P1.y);
        g.restore();
      }
      // касательная в точке a с наклоном s: отрезок ±r по w1
      function tangent(a, s, r, col, al) { if (!(al > 0)) return; const v = loss(a, 0); g.save(); g.beginPath(); g.rect(P1.x - 2, P1.y, P1.w + 4, YL(0) - P1.y); g.clip(); g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(X(a - r), YL(v - s * r)); g.lineTo(X(a + r), YL(v + s * r)); g.stroke(); g.restore(); }

      function oneD(k, p) {
        if (k === 0) {
          axes1(1);
          g.strokeStyle = SC.ink2; g.lineWidth = 2; curve(0, A0 + (A1 - A0) * ease(seg(p, 0, .55))); g.stroke();
          const ba = seg(p, .52, .66);
          if (ba > 0) {
            const x = X(-1.8), y = YL(L1D);
            g.save(); g.globalAlpha = ba; g.setLineDash([3, 4]); g.strokeStyle = 'rgba(183, 192, 210, .5)'; g.lineWidth = 1;
            g.beginPath(); g.moveTo(x, y); g.lineTo(x, YL(0)); g.moveTo(x, y); g.lineTo(P1.x, y); g.stroke(); g.restore();
            ball(x, y, RUN.a, ba);
            C(x, y, 'w₁ = −1,8 → L = 1,18', 'r', null, seg(p, .64, .76));
          }
          return;
        }
        axes1(1);
        g.strokeStyle = SC.ink2; g.lineWidth = 2; curve(0, A1); g.stroke();
        const x = X(-1.8), y = YL(L1D);
        if (k === 1) {
          const h = Math.pow(0.02, ease(seg(p, .06, .76))), v2 = loss(-1.8 + h, 0), sl = (v2 - L1D) / h, tn = seg(p, .8, .92);
          g.save(); g.beginPath(); g.rect(P1.x, P1.y, P1.w, P1.h); g.clip();
          g.globalAlpha = 1 - tn * 0.7; g.strokeStyle = SC.yel; g.lineWidth = 1.6;
          g.beginPath(); g.moveTo(X(-2), YL(L1D + sl * -0.2)); g.lineTo(X(-0.4), YL(L1D + sl * 1.4)); g.stroke(); g.restore();
          tangent(-1.8, G1[0], 0.45, SC.acc, tn);
          dot(X(-1.8 + h), YL(v2), SC.yel, 4);
          ball(x, y, RUN.a);
          C(X(-1.8 + h), YL(v2), `h = ${num(h, 2)} → наклон ${num(sl, 2)}`, 'r', SC.yel, 1 - tn);
          C(x + 6, y + 18, 'L′(−1,8) = −3,88', 'r', SC.acc, tn);
          return;
        }
        // k = 2: знак производной и точки, где она равна нулю
        const a1 = seg(p, .05, .3), a2 = seg(p, .25, .5), z = seg(p, .55, .75), sR = grad(1.6, 0)[0];
        tangent(-1.8, G1[0], 0.3, SC.acc, a1); tangent(1.6, sR, 0.3, SC.acc, a2);
        if (a1 > 0) { g.save(); g.globalAlpha = a1; arrow(g, x + 8, y + 8, X(-1.45), YL(loss(-1.45, 0)) - 6, SC.acc, 2, 8); g.restore(); }
        const xr = X(1.6), yr = YL(loss(1.6, 0));
        if (a2 > 0) { g.save(); g.globalAlpha = a2; arrow(g, xr - 8, yr + 8, X(1.28), YL(loss(1.28, 0)) - 6, SC.acc, 2, 8); g.restore(); }
        ball(x, y, RUN.a); ball(xr, yr, RUN.a, a2 > 0 ? 1 : 0);
        C(x, y, 'L′ < 0 → шаг вправо', 'u', null, a1);
        C(xr, yr, 'L′ > 0 → шаг влево', 'u', null, a2);
        if (z > 0) {
          [MIN_L[0], PASS[0], MIN_R[0]].forEach(a => { const v = loss(a, 0); g.save(); g.globalAlpha = z; g.strokeStyle = SC.yel; g.lineWidth = 2; g.beginPath(); g.moveTo(X(a - 0.22), YL(v)); g.lineTo(X(a + 0.22), YL(v)); g.stroke(); dot(X(a), YL(v), SC.yel, 3.5); g.restore(); });
          C(X(PASS[0]), YL(loss(PASS[0], 0)), 'L′ = 0: дно или вершина', 'd', SC.yel, z);
        }
      }

      function mapBase(al) {
        g.save(); g.globalAlpha = al; g.drawImage(bg, M.x, M.y, M.w, M.h);
        g.strokeStyle = 'rgba(183, 192, 210, .28)'; g.lineWidth = 1; g.strokeRect(M.x + .5, M.y + .5, M.w - 1, M.h - 1);
        g.font = `500 ${fs - 1.5}px ${FONT}`; g.fillStyle = 'rgba(205, 213, 228, .78)'; g.textAlign = 'center'; g.textBaseline = 'top';
        g.fillText('левая долина', X(MIN_L[0]), Y(-0.2)); g.fillText('правая долина', X(MIN_R[0]), Y(-0.2));
        g.textBaseline = 'bottom'; g.fillText('перевал', X(PASS[0]), Y(0.12));
        g.font = `500 ${fs - 2}px ${MONO}`; g.fillStyle = SC.mut; g.textAlign = 'right'; g.fillText('w₁ →', M.x + M.w - 6, M.y + M.h - 4);
        g.textAlign = 'left'; g.fillText('w₂ ↑', M.x + 6, M.y + M.h - 4);
        g.restore();
      }
      // путь до дробной итерации f; возвращает положение шарика и номер итерации
      function path(run, f, col, al, dots) {
        const P = TR[run], i = Math.min(P.length - 1, Math.floor(f)), fr = Math.min(1, f - i);
        g.save(); g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = 1.6; g.lineJoin = 'round'; g.beginPath();
        for (let j = 0; j <= i; j++) { const px = X(P[j][0]), py = Y(P[j][1]); j ? g.lineTo(px, py) : g.moveTo(px, py); }
        let bx = X(P[i][0]), by = Y(P[i][1]);
        if (i < P.length - 1 && fr > 0) { bx = lerp(bx, X(P[i + 1][0]), fr); by = lerp(by, Y(P[i + 1][1]), fr); g.lineTo(bx, by); }
        g.stroke();
        if (dots) for (let j = 0; j <= i; j++) dot(X(P[j][0]), Y(P[j][1]), col, 2.1);
        g.restore();
        return { x: bx, y: by, i };
      }
      function field(al) {
        const nx = W < 420 ? 9 : 13, ny = W < 420 ? 6 : 8, mx = W < 420 ? 11 : 15;
        for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
          const a = A0 + (i + .5) * (A1 - A0) / nx, b = B0 + (j + .5) * (B1 - B0) / ny, gr = grad(a, b), m = Math.hypot(gr[0], gr[1]);
          if (m < 1e-9) continue;
          const len = clamp(3 + 3.2 * Math.sqrt(m), 3, mx), x = X(a), y = Y(b), ux = -gr[0] / m, uy = gr[1] / m;
          arrow(g, x - ux * len / 2, y - uy * len / 2, x + ux * len / 2, y + uy * len / 2, `rgba(190, 200, 218, ${(0.7 * al).toFixed(3)})`, 1.2, 5);
        }
      }

      function twoD(k, p) {
        const bx = X(S1[0]), by = Y(S1[1]);
        if (k === 3) {
          const t = ease(seg(p, 0, .45)), u = ease(seg(p, .5, .8));
          axes1(1 - t); mapBase(t);
          g.save(); g.strokeStyle = SC.ink2; g.lineWidth = 2; g.globalAlpha = 1 - t * 0.45; if (t > .98) g.setLineDash([5, 5]); curve(t, A1); g.stroke(); g.restore();
          const y = u > 0 ? lerp(Y(0), by, u) : lerp(YL(L1D), Y(0), t);
          ball(bx, y, RUN.a);
          C(X(0.62), Y(0), 'срез из шагов 1–3: w₂ = 0', 'd', SC.ink2, seg(p, .45, .6));
          C(bx, by, 'старт (−1,8; 1,0): L = 5,18', 'r', null, seg(p, .82, .94));
          return;
        }
        mapBase(1);
        const gx = X(GP[0]), gy = Y(GP[1]), s2 = Math.min(M.h * 0.13, 26);
        if (k === 4) {
          const a1 = seg(p, .05, .28), a2 = seg(p, .3, .53), a3 = seg(p, .56, .8);
          const hx = gx + GG[0] * s2 * ease(a1), vy = gy - GG[1] * s2 * ease(a2);
          ball(bx, by, RUN.a, .45);
          if (a1 > 0) arrow(g, gx, gy, hx, gy, SC.yel, 2, 8, a3 > 0 ? [4, 3] : null);
          if (a2 > 0) arrow(g, gx, gy, gx, vy, SC.yel, 2, 8, a3 > 0 ? [4, 3] : null);
          if (a3 > 0) { const e = ease(a3); arrow(g, gx, gy, gx + GG[0] * s2 * e, gy - GG[1] * s2 * e, SC.yel, 2.6, 10); }
          ball(gx, gy, SC.yel);
          C(gx, gy, 'точка (1,45; −0,35)', 'l', SC.yel, seg(p, 0, .08) * (1 - a3));
          C(hx, gy, '∂L/∂w₁ = 1,75', 'u', SC.yel, a1 * (1 - a3));
          C(gx, vy, '∂L/∂w₂ = −2,8', 'l', SC.yel, a2 * (1 - a3));
          C(gx + GG[0] * s2, gy - GG[1] * s2, '∇L = (1,75; −2,8): круче всего вверх', 'l', SC.yel, seg(p, .78, .9));
          return;
        }
        if (k === 5) {
          const f = seg(p, 0, .4), a = seg(p, .4, .65);
          field(f);
          ball(bx, by, RUN.a, .45);
          arrow(g, gx, gy, gx + GG[0] * s2, gy - GG[1] * s2, `rgba(227, 192, 77, ${(0.5 * (1 - a * 0.6)).toFixed(3)})`, 2, 9);
          if (a > 0) { const e = ease(a); arrow(g, gx, gy, gx - GG[0] * s2 * e, gy + GG[1] * s2 * e, SC.acc, 2.8, 10); }
          ball(gx, gy, SC.yel);
          C(gx - GG[0] * s2, gy + GG[1] * s2, '−∇L: самый крутой спуск', 'u', null, seg(p, .62, .75));
          return;
        }
        if (k === 6 || k === 7) {
          const f = k === 6 ? seg(p, .04, .92) * 52 : 52, b = path('a', f, RUN.a, 1, true);
          ball(b.x, b.y, RUN.a);
          if (k === 6) {
            const P = TR.a;
            C(X(P[1][0]), Y(P[1][1]), 'w ← w − 0,05·∇L', 'r', null, seg(p, .08, .14) * (1 - seg(p, .5, .56)));
            C(b.x, b.y, 'у дна шаги всё короче', 'u', null, seg(p, .66, .74));
          } else C(b.x, b.y, 'дно: ∇L ≈ 0, L = 0,045', 'u', null, seg(p, .1, .3));
          return;
        }
        if (k === 8 || k === 9 || k === 10) {
          const run = { 8: 'b', 9: 'c', 10: 'd' }[k], n = TR[run].length - 1, f = seg(p, .04, .92) * n;
          path('a', 52, RUN.a, k === 10 ? .55 : .3, false);
          const b = path(run, f, RUN[run], 1, true);
          ball(b.x, b.y, RUN[run]);
          if (k === 8) {
            const P = TR.b;
            C(X(P[1][0]), Y(P[1][1]), 'перелёт через дно', 'r', RUN.b, seg(p, .06, .12) * (1 - seg(p, .55, .62)));
            C(b.x, b.y, '108 итераций вместо 52', 'u', RUN.b, seg(p, .9, .97));
          } else if (k === 9) {
            C(b.x, b.y, '52 итерации: L = 1,15', 'r', RUN.c, seg(p, .88, .96));
            C(X(MIN_L[0]), Y(0), 'η = 0,05: уже на дне', 'd', RUN.a, seg(p, .88, .96));
          } else {
            const mob = W < 420;
            C(b.x, b.y, mob ? 'локальный: 0,344' : 'локальный минимум: L = 0,344', 'u', RUN.d, seg(p, .88, .96));
            C(X(MIN_L[0]), Y(0), mob ? 'глобальный: 0,045' : 'глобальный минимум: L = 0,045', 'd', RUN.a, seg(p, .88, .96));
          }
          return;
        }
        // k = 11: все четыре пути
        const al = seg(p, 0, .3);
        ['c', 'b', 'a', 'd'].forEach(r => { const b = path(r, TR[r].length - 1, RUN[r], al, false); ball(b.x, b.y, RUN[r], al); });
        const mob = W < 420;
        C(X(TR.b[2][0]), Y(TR.b[2][1]), mob ? 'η 0,24' : 'η = 0,24: качается', 'r', RUN.b, seg(p, .3, .45));
        C(X(TR.c[52][0]), Y(TR.c[52][1]), mob ? 'η 0,002' : 'η = 0,002: ползёт', 'r', RUN.c, seg(p, .38, .53));
        C(X(TR.d[0][0]), Y(TR.d[0][1]), mob ? 'справа' : 'старт справа', 'l', RUN.d, seg(p, .46, .61));
      }

      function draw(k, p) {
        lk = k; lp = p; if (!M) return;
        const key = `${k}|${Math.round(p * 600)}|${W}x${H}`; if (key === sig) return; sig = key;
        g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
        if (k <= 2) oneD(k, p); else twoD(k, p);
      }
      function hud(k, p) {
        let it = '—', ls = '—', lsS = '', et = '—', etS = '';
        if (k === 0) ls = p > .55 ? num(L1D, 3) : '—';
        else if (k <= 2) ls = num(L1D, 3);
        else if (k === 3) { const u = ease(seg(p, .5, .8)); ls = num(u > 0 ? loss(-1.8, u) : L1D, 3); }
        else if (k <= 5) ls = num(LG, 3);
        else if (k <= 10) {
          const run = { 6: 'a', 7: 'a', 8: 'b', 9: 'c', 10: 'd' }[k], P = TR[run], n = P.length - 1;
          const i = k === 7 ? n : Math.min(n, Math.floor(seg(p, .04, .92) * n));
          it = String(i); ls = num(P[i][2], 3); et = { a: '0,05', b: '0,24', c: '0,002', d: '0,05' }[run];
          etS = k === 8 ? 'большой' : k === 9 ? 'малый' : '';
        } else { ls = '0,045'; lsS = 'лучшая'; }
        api.hud('it', it); api.hud('loss', ls, lsS); api.hud('eta', et, etS);
      }
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box);
      fit();
      return { render(k, p) { hud(k, p); draw(k, p); } };
    }
  };

  /* ===================== Интерактив «Спуск по холму» ===================== */
  const ETA = [0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.22, 0.24, 0.25, 0.26, 0.28, 0.3];
  const ETA0 = 4, START0 = [-1.8, 1.0], MAXIT = 300;
  const PRESETS = [[-1.8, 1.0, 'слева'], [0, 1.0, 'у перевала'], [1.7, 0.9, 'справа']];
  const valley = w => (w[0] < PASS[0] ? 'left' : 'right');
  const r05 = v => Math.round(v * 20) / 20;
  const ptS = w => `(${num(w[0], 2)}; ${num(w[1], 2)})`;
  const itW = n => { const a = n % 100, b = n % 10; return a > 10 && a < 20 ? 'итераций' : b === 1 ? 'итерацию' : b > 1 && b < 5 ? 'итерации' : 'итераций'; };

  function buildHill(box, api) {
    const { css, reduced } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Шаг решает, скатится шарик на дно или улетит <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="dh-reset">Сбросить</button></div></div>
<p class="hint dh-do">Щёлкните по карте, чтобы поставить старт, или выберите готовый, задайте шаг η и нажмите «Пуск». Задание: найдите шаг, при котором спуск расходится.</p>
<div class="dh-ctl">
  <span class="dh-grp"><span class="dh-lb">старт</span><span class="seg" role="group" aria-label="Готовый старт" id="dh-pre">${PRESETS.map((s, i) => `<button type="button" data-i="${i}">${s[2]}</button>`).join('')}</span></span>
  <label class="dh-grp dh-eta"><span class="dh-lb">шаг η</span><input type="range" id="dh-eta" min="0" max="${ETA.length - 1}" step="1" value="${ETA0}" aria-label="Шаг обучения η"><b id="dh-etav"></b></label>
  <span class="wbtns"><button type="button" class="btn small" id="dh-run">Пуск</button><button type="button" class="btn ghost small" id="dh-one">+1 шаг</button></span>
</div>
<div class="dh-stage">
  <div class="dh-map"><canvas id="dh-cv" tabindex="0" aria-label="Карта ошибки с двумя долинами. Щелчок или стрелки ставят старт, Enter запускает спуск."></canvas></div>
  <div class="dh-side">
    <p class="dh-cap" id="dh-cap"></p>
    <div class="dh-chart"><canvas id="dh-ch" aria-hidden="true"></canvas></div>
    <ol class="dh-tasks"><li id="dh-t0">Найдите шаг, при котором спуск расходится.</li><li id="dh-t1">Найдите два старта не дальше 0,5 друг от друга по w₁, из которых шарик скатится в разные долины.</li></ol>
  </div>
</div>
<p class="dh-verdict" id="dh-vd" aria-live="polite"></p>
<div class="status"><span><span class="dot" id="dh-dot"></span><span id="dh-s1"></span></span><span class="grow"></span><span id="dh-s2"></span></div>`;
    const q = s => box.querySelector(s);
    const cv = q('#dh-cv'), ch = q('#dh-ch'), mapBox = cv.parentNode, chBox = ch.parentNode, inp = q('#dh-eta');
    let st, raf = 0, acc = 0, tPrev = 0, bg = null, bgKey = '';
    const fresh = () => ({ start: START0.slice(), ei: ETA0, P: [START0.slice()], v: null, running: false, done: [false, false], runs: [] });
    st = fresh();
    const eta = () => ETA[st.ei], last = () => st.P[st.P.length - 1], it = () => st.P.length - 1;
    const swinging = () => { const n = it(), w = last(); return n > 1 && Math.abs(w[1]) > 0.01 && Math.sign(w[1]) !== Math.sign(st.P[n - 1][1]); };

    function stop() { st.running = false; cancelAnimationFrame(raf); }
    function restart() { stop(); st.P = [st.start.slice()]; st.v = null; draw(); }
    function setStart(a, b) { st.start = [r05(clamp(a, -1.95, 1.95)), r05(clamp(b, -1.15, 1.15))]; restart(); }
    function finish() {
      stop();
      const me = { a: st.start[0], v: st.v, val: valley(last()) };
      st.runs.push(me);
      if (st.v === 'div') st.done[0] = true;
      if (st.v === 'conv' && st.runs.some(r => r.v === 'conv' && r.val !== me.val && Math.abs(r.a - me.a) <= 0.5 + 1e-9)) st.done[1] = true;
    }
    function stepOnce() {
      if (st.v) return;
      const w = gdStep(last(), eta()); st.P.push(w);
      const v = gdVerdict(w);
      if (v) st.v = v; else if (it() >= MAXIT) st.v = 'none';
      if (st.v) finish();
    }
    function loop(t) {
      if (!st.running) return;
      acc += Math.min(120, t - tPrev); tPrev = t;
      const per = it() < 25 ? 90 : 22;
      while (acc >= per && st.running) { acc -= per; stepOnce(); }
      draw();
      if (st.running) raf = requestAnimationFrame(loop);
    }
    function run() {
      if (st.v) { st.P = [st.start.slice()]; st.v = null; }
      if (reduced()) { while (!st.v) stepOnce(); draw(); return; }
      st.running = true; acc = 90; tPrev = performance.now(); raf = requestAnimationFrame(loop); draw();
    }

    function sizeCanvas(c, w, h) {
      const dpr = Math.min(2, window.devicePixelRatio || 1), cw = Math.round(w * dpr), chh = Math.round(h * dpr);
      if (c.width !== cw || c.height !== chh) { c.width = cw; c.height = chh; }
      return dpr;
    }
    function drawMap(C) {
      const w = mapBox.clientWidth, h = mapBox.clientHeight; if (!w || !h) return;
      const dpr = sizeCanvas(cv, w, h), g = cv.getContext('2d');
      const key = [w, h, dpr, C.accent, C.surface, C.ink].join('|');
      if (key !== bgKey) { const sf = hexRgb(C.surface); bg = paintMap(w, h, dpr, { lo: mix(sf, hexRgb(C.accent), .48), hi: sf, line: rgba(hexRgb(C.ink), .14) }); bgKey = key; }
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h); g.drawImage(bg, 0, 0, w, h);
      const X = a => (a - A0) / (A1 - A0) * w, Y = b => (B1 - b) / (B1 - B0) * h, fs = w < 420 ? 10.5 : 11.5;
      g.font = `500 ${fs}px ${FONT}`; g.fillStyle = C.ink2; g.textAlign = 'center'; g.textBaseline = 'top';
      g.fillText(`левое дно · ${num(L_MIN[0], 3)}`, X(MIN_L[0]), Y(-0.16)); g.fillText(`правое дно · ${num(L_MIN[1], 3)}`, X(MIN_R[0]), Y(-0.16));
      g.textBaseline = 'bottom'; g.fillText('перевал', X(PASS[0]), Y(0.1));
      g.font = `500 ${fs - 1}px ${MONO}`; g.fillStyle = C.muted; g.textAlign = 'right'; g.fillText('w₁ →', w - 6, h - 4); g.textAlign = 'left'; g.fillText('w₂ ↑', 6, h - 4);
      // путь
      const P = st.P, col = st.v === 'div' ? C.bad : C.ink;
      g.strokeStyle = col; g.lineWidth = 1.5; g.lineJoin = 'round'; g.beginPath();
      P.forEach((w0, i) => { const x = X(w0[0]), y = Y(w0[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      g.fillStyle = col; P.forEach(w0 => { const x = X(w0[0]), y = Y(w0[1]); if (x > -4 && x < w + 4 && y > -4 && y < h + 4) { g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); } });
      // старт
      const sx = X(st.start[0]), sy = Y(st.start[1]);
      g.strokeStyle = C.ink2; g.lineWidth = 1.5; g.beginPath(); g.arc(sx, sy, 8.5, 0, 7); g.stroke();
      // следующий шаг — пунктирная стрелка
      const wl = last(), lx = X(wl[0]), ly = Y(wl[1]), inside = lx >= 0 && lx <= w && ly >= 0 && ly <= h;
      if (!st.v && inside) { const nw = gdStep(wl, eta()); arrow(g, lx, ly, X(nw[0]), Y(nw[1]), C.c[1], 1.6, 7, [4, 3]); }
      if (inside) { g.beginPath(); g.arc(lx, ly, 6.5, 0, 7); g.fillStyle = C.c[1]; g.fill(); g.lineWidth = 2; g.strokeStyle = C.surface; g.stroke(); }
      else {
        const ex = clamp(lx, 10, w - 10), ey = clamp(ly, 10, h - 10), ux = lx - ex, uy = ly - ey, m = Math.hypot(ux, uy) || 1;
        arrow(g, ex - ux / m * 14, ey - uy / m * 14, ex + ux / m * 6, ey + uy / m * 6, C.bad, 2.4, 9);
        g.font = `600 ${fs}px ${FONT}`; g.fillStyle = C.bad; g.textAlign = ex > w / 2 ? 'right' : 'left'; g.textBaseline = ey > h / 2 ? 'bottom' : 'top';
        g.fillText('шарик за краем карты', ex + (ex > w / 2 ? -18 : 18), ey + (ey > h / 2 ? -6 : 6));
      }
    }
    function drawChart(C) {
      const w = chBox.clientWidth, h = chBox.clientHeight; if (!w || !h) return;
      const dpr = sizeCanvas(ch, w, h), g = ch.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const pl = 40, pr = 8, pt = 18, pb = 20, iw = w - pl - pr, ih = h - pt - pb;
      // шкала ошибки логарифмическая: от 0,03 до 1 000, деление — в 10 раз
      const n = Math.max(40, it()), LO = Math.log10(0.03), HI = 3;
      const xs = i => pl + i / n * iw, ys = v => pt + ih - (clamp(Math.log10(Math.max(v, 1e-9)), LO, HI) - LO) / (HI - LO) * ih;
      g.font = `500 10.5px ${MONO}`; g.textAlign = 'right'; g.textBaseline = 'middle';
      [[0.1, '0,1'], [1, '1'], [10, '10'], [100, '100'], [1000, '1000']].forEach(([v, t]) => {
        g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(pl, ys(v)); g.lineTo(pl + iw, ys(v)); g.stroke();
        g.fillStyle = C.muted; g.fillText(t, pl - 5, ys(v));
      });
      g.strokeStyle = C.line2; g.beginPath(); g.moveTo(pl, pt); g.lineTo(pl, pt + ih); g.lineTo(pl + iw, pt + ih); g.stroke();
      g.textAlign = 'left'; g.textBaseline = 'bottom'; g.font = `500 10px ${FONT}`; g.fillText('ошибка L, деления ×10', pl, pt - 5);
      g.font = `500 10.5px ${MONO}`; g.textBaseline = 'top'; g.fillText('0', pl, pt + ih + 4); g.textAlign = 'right'; g.fillText(String(n), pl + iw, pt + ih + 4);
      g.textAlign = 'center'; g.fillText('итерации', pl + iw / 2, pt + ih + 4);
      // уровни дна двух долин
      [[L_MIN[0], 'левое дно', 'top'], [L_MIN[1], 'правое дно', 'bottom']].forEach(([v, t, bl]) => {
        g.save(); g.setLineDash([4, 4]); g.strokeStyle = C.muted; g.globalAlpha = .75; g.beginPath(); g.moveTo(pl, ys(v)); g.lineTo(pl + iw, ys(v)); g.stroke(); g.restore();
        g.font = `500 10px ${FONT}`; g.fillStyle = C.muted; g.textAlign = 'right'; g.textBaseline = bl; g.fillText(t, pl + iw - 2, ys(v) + (bl === 'top' ? -14 : -2));
      });
      const Ls = st.P.map(w0 => loss(w0[0], w0[1]));
      g.strokeStyle = st.v === 'div' ? C.bad : C.accent; g.lineWidth = 2; g.lineJoin = 'round'; g.beginPath();
      Ls.forEach((v, i) => { i ? g.lineTo(xs(i), ys(v)) : g.moveTo(xs(i), ys(v)); }); g.stroke();
      const cut = Ls.findIndex(v => v > 1000);
      if (cut >= 0) { g.fillStyle = C.bad; g.font = `600 10.5px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'top'; arrow(g, xs(cut), pt + 10, xs(cut), pt - 1, C.bad, 2, 6); g.fillText('выше графика', Math.min(xs(cut) + 6, pl + iw - 74), pt + 2); }
      const lv = Ls[Ls.length - 1]; g.beginPath(); g.arc(xs(Ls.length - 1), ys(lv), 3.5, 0, 7); g.fillStyle = st.v === 'div' ? C.bad : C.accent; g.fill();
    }
    function caption() {
      const n = it();
      if (!n) return 'Спуск ещё не начался: ошибка на старте';
      if (st.v === 'div') return 'Ошибка растёт с каждым шагом: спуск разошёлся';
      if (st.v === 'conv') return valley(last()) === 'left' ? 'Ошибка спустилась на дно левой долины' : 'Ошибка застряла на дне правой долины, выше левой';
      if (st.v === 'none') return swinging() ? 'Ошибка застыла: шарик качается на месте' : 'Ошибка падает слишком медленно';
      const L = loss(last()[0], last()[1]), Lp = loss(st.P[n - 1][0], st.P[n - 1][1]);
      return L > Lp ? 'Ошибка растёт' : 'Ошибка падает';
    }
    function verdict() {
      const n = it(), w = last(), e = etaS(eta());
      if (!n) return `Старт ${ptS(st.start)}, ошибка ${num(loss(w[0], w[1]), 3)}. Нажмите «Пуск» или «+1 шаг».`;
      if (!st.v) return st.running ? `Спуск идёт: итерация ${n}.` : `Пауза на итерации ${n}. Пунктир — следующий шаг.`;
      if (st.v === 'div') return `Разошёлся за ${n} ${itW(n)}: каждый шаг перелетает дно дальше прежнего, размах растёт, и шарик улетел. Шаг ${e} слишком велик.`;
      if (st.v === 'conv') {
        const flat = Math.abs(st.start[1]) < 1e-9 && eta() > 0.25 ? ' Старт ровно на линии w₂ = 0: поперёк долины качаться нечему, поэтому большой шаг здесь не раскачивает. Сдвиньте старт с этой линии.' : '';
        return valley(w) === 'left'
          ? `Сошёлся за ${n} ${itW(n)}: левая долина, глобальный минимум, ошибка ${num(L_MIN[0], 3)}.${flat}`
          : `Сошёлся за ${n} ${itW(n)}: правая долина — локальный минимум. Ошибка ${num(L_MIN[1], 3)}, хотя в левой долине есть ${num(L_MIN[0], 3)}.${flat}`;
      }
      return swinging() ? `За ${MAXIT} итераций не сошёлся: шаг ${e} — ровно на границе, шарик качается между стенками с постоянным размахом.` : `За ${MAXIT} итераций не сошёлся: шаг ${e} слишком мал, шарик ещё ползёт.`;
    }
    function draw() {
      const C = css();
      drawMap(C); drawChart(C);
      const w = last(), gr = grad(w[0], w[1]), L = loss(w[0], w[1]);
      q('#dh-etav').textContent = etaS(eta());
      q('#dh-cap').textContent = caption();
      q('#dh-vd').textContent = verdict();
      const gn = Math.hypot(gr[0], gr[1]);
      q('#dh-s1').textContent = `итерация ${it()} · L = ${num(L, L >= 100 ? 1 : 3)} · |∇L| = ${num(gn, gn >= 10 ? 2 : 4)}`;
      q('#dh-s2').textContent = `старт ${ptS(st.start)} · η = ${etaS(eta())}`;
      q('#dh-dot').classList.toggle('live', st.running);
      q('#dh-run').textContent = st.running ? 'Пауза' : st.v ? 'Ещё раз' : 'Пуск';
      q('#dh-one').disabled = !!st.v;
      box.querySelectorAll('#dh-pre button').forEach((b, i) => b.setAttribute('aria-pressed', String(PRESETS[i][0] === st.start[0] && PRESETS[i][1] === st.start[1])));
      st.done.forEach((d, i) => q('#dh-t' + i).classList.toggle('dh-ok', d));
    }

    cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); setStart(A0 + (e.clientX - r.left) / r.width * (A1 - A0), B1 - (e.clientY - r.top) / r.height * (B1 - B0)); });
    cv.addEventListener('keydown', e => {
      const d = e.shiftKey ? 0.25 : 0.05, m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] }[e.key];
      if (m) { e.preventDefault(); e.stopPropagation(); setStart(st.start[0] + m[0], st.start[1] + m[1]); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (st.running) { stop(); draw(); } else run(); }
    });
    q('#dh-pre').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { const s = PRESETS[+b.dataset.i]; setStart(s[0], s[1]); } });
    inp.addEventListener('input', () => { st.ei = +inp.value; restart(); });
    q('#dh-run').addEventListener('click', () => { if (st.running) { stop(); draw(); } else run(); });
    q('#dh-one').addEventListener('click', () => { stop(); stepOnce(); draw(); });
    q('#dh-reset').addEventListener('click', () => { stop(); st = fresh(); inp.value = ETA0; draw(); });
    if ('ResizeObserver' in window) { const ro = new ResizeObserver(() => draw()); ro.observe(mapBox); ro.observe(chBox); }
    draw();

    const vText = () => (!st.v ? (it() ? 'спуск не закончен' : 'спуск не запускали') : st.v === 'div' ? 'разошёлся' : st.v === 'conv' ? `сошёлся в ${valley(last()) === 'left' ? 'левую долину (глобальный минимум)' : 'правую долину (локальный минимум)'}` : swinging() ? 'не сошёлся, качается с постоянным размахом' : 'не сошёлся, ползёт');
    return {
      describe() {
        const w = last();
        return `старт ${ptS(st.start)}, шаг η = ${etaS(eta())}, итерация ${it()}, ошибка ${num(loss(w[0], w[1]), 3)}, итог: ${vText()}; задание «найти шаг, при котором спуск расходится» — ${st.done[0] ? 'выполнено' : 'не выполнено'}; задание «два близких старта в разные долины» — ${st.done[1] ? 'выполнено' : 'не выполнено'}`;
      },
      redraw() { bgKey = ''; draw(); }
    };
  }

  const CODE = {"deriv": {"title": "Численная производная сходится к формуле, пока h не слишком мало", "badge": "проверено: Python 3.13, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\n\ndef L(w1, w2):                       # поверхность ошибки из сцены и интерактива\n    return (w1**2 - 1)**2 / 4 + 0.15 * w1 + 4 * w2**2 + 0.2\n\ndef grad(w1, w2):                    # частные производные, выведенные руками\n    return np.array([w1 * (w1**2 - 1) + 0.15, 8 * w2])\n\nw1, w2 = -1.8, 1.0                   # старт из сцены\nfor h in [0.1, 0.01, 0.001, 1e-6, 1e-12]:\n    d1 = (L(w1 + h, w2) - L(w1 - h, w2)) / (2 * h)   # центральная разность по w1\n    d2 = (L(w1, w2 + h) - L(w1, w2 - h)) / (2 * h)   # и по w2\n    print(f\"h = {h:<6g} численно:     [{d1:.8f}, {d2:.8f}]\")\ng = grad(w1, w2)\nprint(f\"{'формула:':<25}[{g[0]:.8f}, {g[1]:.8f}]\")", "out": "h = 0.1    численно:     [-3.90000000, 8.00000000]\nh = 0.01   численно:     [-3.88218000, 8.00000000]\nh = 0.001  численно:     [-3.88200180, 8.00000000]\nh = 1e-06  численно:     [-3.88200000, 8.00000000]\nh = 1e-12  численно:     [-3.88222787, 8.00026712]\nформула:                 [-3.88200000, 8.00000000]"}, "parab": {"title": "Спуск по параболе: ползёт, качается или разлетается", "badge": "проверено: Python 3.13", "lang": "python", "code": "def descend(eta, x=3.0, steps=20):\n    path = [x]\n    for _ in range(steps):\n        x = x - eta * 2 * x          # производная x² равна 2x\n        path.append(x)\n    return path\n\nfor eta in [0.01, 0.1, 0.5, 0.9, 1.1]:\n    p = descend(eta)\n    print(f\"η = {eta:<4}  x: {p[0]:.2f} → {p[1]:.2f} → {p[2]:.2f} → … → {p[-1]:.4g}\")", "out": "η = 0.01  x: 3.00 → 2.94 → 2.88 → … → 2.003\nη = 0.1   x: 3.00 → 2.40 → 1.92 → … → 0.03459\nη = 0.5   x: 3.00 → 0.00 → 0.00 → … → 0\nη = 0.9   x: 3.00 → -2.40 → 1.92 → … → 0.03459\nη = 1.1   x: 3.00 → -3.60 → 4.32 → … → 115"}, "surface": {"title": "На поверхности сцены исход решают шаг и старт", "badge": "проверено: Python 3.13, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\n\ndef L(w):    return (w[0]**2 - 1)**2 / 4 + 0.15 * w[0] + 4 * w[1]**2 + 0.2\ndef grad(w): return np.array([w[0] * (w[0]**2 - 1) + 0.15, 8 * w[1]])\n\ndef descend(start, eta, steps=300):\n    w = np.array(start, dtype=float)\n    for k in range(1, steps + 1):\n        w = w - eta * grad(w)                      # шаг против градиента\n        if np.abs(w).max() > 10:\n            return w, k, \"разошёлся\"\n        if np.linalg.norm(grad(w)) < 1e-3:\n            return w, k, \"сошёлся\"\n    return w, steps, \"не сошёлся\"\n\nruns = [((-1.8, 1.0), 0.005), ((-1.8, 1.0), 0.05), ((-1.8, 1.0), 0.24),\n        ((-1.8, 1.0), 0.25), ((-1.8, 1.0), 0.26), ((1.7, 0.9), 0.05)]\nfor start, eta in runs:\n    w, k, verdict = descend(start, eta)\n    print(f\"старт {start}, η = {eta:<5} {verdict:<10} шагов {k:>3}  \"\n          f\"w = ({w[0]:6.3f}, {w[1]:6.3f})  L = {L(w):.3f}\")", "out": "старт (-1.8, 1.0), η = 0.005 не сошёлся шагов 300  w = (-1.077,  0.000)  L = 0.045\nстарт (-1.8, 1.0), η = 0.05  сошёлся    шагов  52  w = (-1.068,  0.000)  L = 0.045\nстарт (-1.8, 1.0), η = 0.24  сошёлся    шагов 108  w = (-1.068,  0.000)  L = 0.045\nстарт (-1.8, 1.0), η = 0.25  не сошёлся шагов 300  w = (-1.068,  1.000)  L = 4.045\nстарт (-1.8, 1.0), η = 0.26  разошёлся  шагов  30  w = (-1.068, 10.063)  L = 405.073\nстарт (1.7, 0.9), η = 0.05  сошёлся    шагов  78  w = ( 0.915,  0.000)  L = 0.344"}, "regression": {"title": "Спуск приходит к тем же весам, что lstsq", "badge": "проверено: NumPy 2.5.3, pandas 3.0.5", "lang": "python", "code": "import numpy as np, pandas as pd\nnp.set_printoptions(precision=4, suppress=True)\n\ndf = pd.read_csv(\"data/clients/clients.csv\")\ny = df[\"spend\"].to_numpy(float)\nF = df[[\"income\", \"orders\"]].to_numpy(float)\nmu, sd = F.mean(axis=0), F.std(axis=0)\nX = np.c_[np.ones(len(y)), (F - mu) / sd]        # столбец единиц + стандартизованные признаки\n\nw, eta = np.zeros(3), 0.3\nfor k in range(1, 61):\n    grad = 2 / len(y) * X.T @ (X @ w - y)        # градиент MSE по трём весам\n    w = w - eta * grad\n    if k in (1, 5, 20, 60):\n        rmse = np.sqrt(np.mean((X @ w - y) ** 2))\n        print(f\"шаг {k:>2}: RMSE = {rmse:8.1f} ₽, |градиент| = {np.linalg.norm(grad):.3g}\")\n\nb = w[1:] / sd                                   # веса обратно в рубли и штуки\nw_gd = np.r_[w[0] - b @ mu, b]\nw_ls, *_ = np.linalg.lstsq(np.c_[np.ones(len(y)), F], y, rcond=None)\nprint(\"спуск:\", np.round(w_gd, 4))\nprint(\"lstsq:\", np.round(w_ls, 4))", "out": "шаг  1: RMSE =   6699.1 ₽, |градиент| = 2.98e+04\nшаг  5: RMSE =   3821.2 ₽, |градиент| = 915\nшаг 20: RMSE =   3809.6 ₽, |градиент| = 0.997\nшаг 60: RMSE =   3809.6 ₽, |градиент| = 3.5e-08\nспуск: [ 204.6891    0.0347 2549.5291]\nlstsq: [ 204.6891    0.0347 2549.5291]"}, "scale": {"title": "Без стандартизации спуск разлетается или ползёт", "badge": "проверено: NumPy 2.5.3, pandas 3.0.5", "lang": "python", "code": "import numpy as np, pandas as pd\nnp.set_printoptions(precision=4, suppress=True)\n\ndf = pd.read_csv(\"data/clients/clients.csv\")\ny = df[\"spend\"].to_numpy(float)\nF = df[[\"income\", \"orders\"]].to_numpy(float)\nraw = np.c_[np.ones(len(y)), F]                          # доход в рублях, заказы в штуках\nstd = np.c_[np.ones(len(y)), (F - F.mean(0)) / F.std(0)] # оба признака в стандартных отклонениях\n\ndef descend(X, eta, steps):\n    w = np.zeros(3)\n    for _ in range(steps):\n        w = w - eta * 2 / len(y) * X.T @ (X @ w - y)\n    return w, np.sqrt(np.mean((X @ w - y) ** 2))         # веса и RMSE, ₽\n\nprint(\"градиент в нуле, сырые:   \", 2 / len(y) * raw.T @ -y)\nprint(\"градиент в нуле, стандарт:\", 2 / len(y) * std.T @ -y)\nw, r = descend(raw, 3e-10, 30);     print(f\"сырые, η = 3e-10, 30 шагов:      RMSE = {r:.2e}\")\nw, r = descend(raw, 1e-10, 10_000); print(f\"сырые, η = 1e-10, 10 000 шагов:  RMSE = {r:.1f}, w = {w}\")\nw, r = descend(std, 0.3, 60);       print(f\"стандарт, η = 0.3, 60 шагов:    RMSE = {r:.1f}\")", "out": "градиент в нуле, сырые:    [-2.6190e+04 -2.3563e+09 -1.3060e+05]\nградиент в нуле, стандарт: [-26190.02    -7293.5309 -12192.4801]\nсырые, η = 3e-10, 30 шагов:      RMSE = 1.01e+21\nсырые, η = 1e-10, 10 000 шагов:  RMSE = 6752.4, w = [0.0021 0.1519 0.0242]\nстандарт, η = 0.3, 60 шагов:    RMSE = 3809.6"}, "integral": {"title": "Сумма прямоугольников подходит к площади, а площадь гистограммы — это доля", "badge": "проверено: NumPy 2.5.3, pandas 3.0.5", "lang": "python", "code": "import numpy as np, pandas as pd\n\ndef density(x):                              # плотность стандартного нормального распределения\n    return np.exp(-x**2 / 2) / np.sqrt(2 * np.pi)\n\nfor n in [4, 10, 100, 1000]:                 # площадь под кривой от -1 до 1\n    dx = 2 / n\n    mids = -1 + dx * (np.arange(n) + 0.5)    # середины n прямоугольников\n    print(f\"n = {n:>4}: сумма прямоугольников = {np.sum(density(mids) * dx):.6f}\")\n\nincome = pd.read_csv(\"data/clients/clients.csv\")[\"income\"]\nedges = np.arange(25_000, 325_001, 25_000)             # столбики по 25 тыс. ₽\nh, edges = np.histogram(income, bins=edges, density=True)\nwidths = np.diff(edges)\nprint(\"площадь всей гистограммы:\", round(np.sum(h * widths), 6))\nprint(\"площадь столбиков 50–100 тыс.:\", round(np.sum(h[1:3] * widths[1:3]), 3))\nprint(\"доля клиентов с доходом 50–100 тыс.:\", ((income >= 50_000) & (income < 100_000)).mean())", "out": "n =    4: сумма прямоугольников = 0.687806\nn =   10: сумма прямоугольников = 0.683498\nn =  100: сумма прямоугольников = 0.682698\nn = 1000: сумма прямоугольников = 0.682690\nплощадь всей гистограммы: 1.0\nплощадь столбиков 50–100 тыс.: 0.545\nдоля клиентов с доходом 50–100 тыс.: 0.545"}};

  window.PAGE = {
    id: 'da-4-3',
    short: 'DA-04',
    title: 'Производная и градиент',
    where: 'блок «Дата аналитика», тема 04 «Математика для данных», страница 4.3',
    aiData: 'учебная поверхность ошибки L(w₁, w₂) = ¼(w₁² − 1)² + 0,15·w₁ + 4w₂² + 0,2 с двумя долинами (в сцене и интерактиве) и 1 000 учебных клиентов clients.csv: доход income, число заказов orders, траты spend (регрессия spend ~ income + orders, lstsq даёт w ≈ [205; 0,0347; 2 550])',
    scene,
    widgets: { hill: buildHill },
    code: CODE,
    questions: {
    q1: { sec: 'descent', title: 'Сначала предскажите', q: 'Со старта (−1,8; 1,0) шаг 0,05 довёл шарик до дна за 52 итерации. Что будет, если взять шаг 0,3 — в шесть раз больше?', opts: [['Дойдёт примерно в шесть раз быстрее, за 9 итераций'], ['Раскачается поперёк долины с растущим размахом и улетит', 1], ['Перепрыгнет перевал и остановится в правой долине'], ['Дойдёт за те же 52 итерации: от шага зависит только точность']],
      why: 'Поперёк долины ошибка растёт как 4w₂², производная равна 8w₂, и каждый шаг умножает w₂ на 1 − 8η. При η = 0,3 это −1,4: знак меняется, а размах растёт на 40% за шаг, и через 7 итераций |w₂| больше 10. Длинный шаг не ускоряет спуск, а перелетает дно. Вдоль w₁ шаг 0,3 ещё устойчив, поэтому перевал шарик не перепрыгивает. И число итераций от шага зависит сильно: при 0,15 хватает 14. Проверьте в интерактиве.' },
    q2: { sec: 'idea', q: 'Почему шарик в сцене шагает против градиента, а не по нему?', opts: [['Градиент указывает, куда ошибка растёт быстрее всего, а нам нужно, чтобы она падала', 1], ['Градиент указывает прямо на минимум, но с перелётом, поэтому идём назад'], ['Против градиента путь до глобального минимума всегда короче'], ['Вдоль градиента ошибка не меняется, а против него падает']],
      why: 'Градиент — направление самого быстрого роста функции, а его длина — крутизна склона. Против него ошибка падает быстрее всего, поэтому w ← w − η·∇L. На минимум градиент не нацелен: в сцене стрелки перпендикулярны линиям уровня. Глобальный минимум спуск тоже не гарантирует: со старта справа шарик остановился в правой долине. А не меняется ошибка вдоль линии уровня, то есть поперёк градиента.' },
    q3: { sec: 'code', q: 'В блоке про параболу строка ниже выполняется с x = 3 и eta = 0.9. Чему равен x после двух выполнений?', code: 'x = x - eta * 2 * x', lang: 'python', opts: [['1,92', 1], ['−2,4'], ['4,32'], ['0']],
      why: 'Строка умножает x на 1 − 2η = 1 − 1,8 = −0,8. После первого шага x = −2,4, после второго 1,92: знак скачет, а размах уменьшается, и спуск сходится, как в выводе блока. −2,4 — ответ после одного шага. 4,32 получится после двух шагов при η = 1,1, когда множитель −1,2 и размах растёт. В ноль за один шаг приводит η = 0,5: тогда множитель равен нулю.' },
    q4: { sec: 'idea', q: 'Для параболы x² спуск сходится, только если η < 1. Почему при η = 1,1 он расходится, хотя каждый шаг направлен к минимуму?', opts: [['Каждый шаг перелетает минимум дальше, чем стоял шарик: x умножается на −1,2', 1], ['При η > 1 градиент меняет знак, и шаг идёт от минимума'], ['Копятся ошибки округления, и спуск теряет направление'], ['При больших x парабола перестаёт быть выпуклой']],
      why: 'Шаг x ← x − η·2x умножает x на 1 − 2η = −1,2. Направление верное, к нулю, но шаг длиннее расстояния до нуля, и после перелёта шарик на 20% дальше от минимума, чем был. Градиент 2x меняет знак только вместе с x. Округления ни при чём: размах растёт по точной формуле. А x² выпукла везде.' },
    q5: { sec: 'mse', q: 'Почему градиентный спуск по MSE линейной регрессии не застрянет в плохом минимуме?', opts: [['MSE выпуклая: у неё одна долина, и любой локальный минимум — глобальный', 1], ['У выпуклой функции градиент нигде не равен нулю'], ['На выпуклой функции спуск сходится при любом шаге'], ['Спуск по выпуклой функции идёт к минимуму по прямой']],
      why: 'Застрять можно только там, где градиент нулевой, а у выпуклой функции все такие точки — глобальный минимум. В самом минимуме градиент как раз равен нулю. Шаг по-прежнему важен: в нюансе про масштаб спуск по той же выпуклой MSE разошёлся при шаге 3·10⁻¹⁰. И путь не обязательно прямой: в вытянутой чаше спуск качается, как шарик с шагом 0,24.' },
    q6: { sec: 'nuances', q: 'Почему для spend ~ income + orders без стандартизации нельзя подобрать удобный шаг?', opts: [['Доход в рублях в десятки тысяч раз крупнее заказов, и шаг, безопасный для веса дохода, ничтожен для остальных весов', 1], ['Признаки коррелируют, поэтому градиент не определён'], ['Без стандартизации MSE перестаёт быть выпуклой'], ['lstsq уже нашёл веса, и спуску нечего уточнять']],
      why: 'Производная по весу дохода в нулевой точке равна −2,4·10⁹, по весу заказов −1,3·10⁵: чаша вытянута в узкий овраг. Шаг 3·10⁻¹⁰ раскачивает вес дохода, а при 10⁻¹⁰ остальные веса за 10 000 итераций почти не сдвигаются. Корреляция признаков не мешает посчитать градиент, MSE выпукла при любом масштабе, а про lstsq спуск ничего не знает и ищет минимум сам.' },
    q7: { sec: 'idea', q: 'Гистограмма дохода построена с density=True, и площадь столбиков от 50 до 100 тыс. ₽ равна 0,545. Что это значит?', opts: [['У 54,5% учебных клиентов доход от 50 до 100 тыс. ₽', 1], ['Высота столбиков в этом интервале равна 0,545'], ['Доход ровно 75 тыс. ₽ встречается с вероятностью 0,545'], ['Средний доход клиентов в этом интервале — 54,5 тыс. ₽']],
      why: 'С density=True высота столбика — плотность, а площадь всей гистограммы равна 1. Площадь над отрезком — доля клиентов в нём, и в коде она совпала с прямым подсчётом: 0,545. Высота столбика — плотность на рубль, около 0,00001, а не вероятность. У отдельного значения непрерывной величины площади нет, и его вероятность равна нулю. Со средним доходом площадь не связана.' }
    },
    glossary: {
      loss: { t: 'Функция потерь', en: 'loss function', d: 'Число, которое показывает, насколько модель ошибается при заданных весах.' },
      derivative: { t: 'Производная', en: 'derivative', d: 'Наклон графика функции в точке, то есть скорость её изменения.' },
      gradient: { t: 'Градиент', en: 'gradient, ∇', d: 'Вектор из частных производных по всем переменным; указывает направление самого быстрого роста функции.' },
      gd: { t: 'Градиентный спуск', en: 'gradient descent', d: 'Поиск минимума шагами против градиента: w ← w − η·∇L.' },
      lr: { t: 'Шаг обучения', en: 'learning rate, η', d: 'Множитель при градиенте в шаге спуска; его ещё называют скоростью обучения.' },
      tangent: { t: 'Касательная', en: 'tangent line', d: 'Прямая, которая касается графика в точке и идёт с ним в одном направлении.' },
      limit: { t: 'Предел', en: 'limit', d: 'Число, к которому сколь угодно близко подходит выражение, когда h стремится к нулю.' },
      partial: { t: 'Частная производная', en: 'partial derivative', d: 'Производная по одной переменной, когда остальные заморожены.' },
      contour: { t: 'Линия уровня', en: 'contour line', d: 'Линия на карте, вдоль которой функция принимает одно и то же значение.' },
      chain: { t: 'Цепное правило', en: 'chain rule', d: 'Производная функции от функции равна произведению производных звеньев цепочки.' },
      saddle: { t: 'Седловая точка', en: 'saddle point', d: 'Точка с нулевым градиентом, где в одну сторону функция растёт, а в другую убывает, как на перевале.' },
      iteration: { t: 'Итерация', en: 'iteration', d: 'Один повтор шага алгоритма.' },
      convex: { t: 'Выпуклая функция', en: 'convex function', d: 'Функция, у которой отрезок между двумя точками графика лежит не ниже графика; любой её локальный минимум — глобальный.' },
      local: { t: 'Локальный минимум', en: 'local minimum', d: 'Точка, где функция меньше, чем во всех соседних, но не обязательно меньше всего; самый низкий минимум называют глобальным.' },
      integral: { t: 'Интеграл', en: 'integral', d: 'Площадь под графиком функции на отрезке — предел суммы тонких прямоугольников.' },
      density: { t: 'Плотность вероятности', en: 'probability density', d: 'Функция, площадь под которой на отрезке равна вероятности попасть в этот отрезок.' },
      mse: { t: 'Среднеквадратичная ошибка', en: 'mean squared error, MSE', d: 'Средний квадрат разности прогноза и факта; корень из неё, RMSE, измеряется в единицах цели.' },
      standard: { t: 'Стандартизация', en: 'standardization', d: 'Вычесть из признака среднее и разделить на стандартное отклонение.' },
      numdiff: { t: 'Численная производная', en: 'finite difference', d: 'Приближение производной разностью значений функции в близких точках.' },
      sgd: { t: 'Стохастический градиентный спуск', en: 'stochastic gradient descent, SGD', d: 'Спуск, где градиент на каждом шаге считают по случайной пачке строк.' },
      momentum: { t: 'Момент', en: 'momentum', d: 'Добавка к шагу, которая копит направление прошлых шагов и гасит качели; в блоке ML его называют импульсом.' },
      adam: { t: 'Adam', en: 'adaptive moment estimation', d: 'Метод спуска, который подбирает свой шаг каждому весу по истории градиентов.' }
    },
    materials: [
      ['da-4-3-derivative-gradient.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/clients/', '1 000 учебных клиентов — общий набор темы 04'],
      ['surface.py', 'Поверхность сцены: градиент, численная производная, спуск; парабола'],
      ['regression_gd.py', 'Регрессия спуском, сравнение с lstsq, опыт с масштабом'],
      ['integral.py', 'Сумма прямоугольников и гистограмма с density=True']
    ],
    prompts: [
      ['Тренажёр по шагу', 'Дай функцию одной переменной, старт и шаг η. Я предскажу, сойдётся спуск, раскачается или разойдётся, а ты проверишь первыми тремя шагами. Пять задач по одной.'],
      ['Градиент руками', 'Задай три функции двух переменных. Я выпишу градиент в точке, а ты проверишь и покажешь, как свериться численной производной.'],
      ['От спуска к ML', 'На регрессии spend ~ income + orders из источника спроси меня, что изменится, если считать градиент по пачке из 32 клиентов вместо тысячи. Веди вопросами.']
    ]
  };
})();
