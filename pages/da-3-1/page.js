/* Страница 3.1 · SELECT и порядок выполнения запроса */
(() => {
  /* ===================== Учебные данные =====================
     Учебная база shop (data/shop, сгенерирована gen.py с seed 303): интернет-магазин товаров для дома, январь–март 2026.
     Все числа ниже получены запросами к PostgreSQL 16.15 на этой базе. */
  const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  // неразрывный пробел после коротких предлогов и союзов в текстах сцены
  const nb = s => s.replace(/(^|[\s(«>])(в|во|и|с|со|к|о|об|у|на|по|за|из|от|до|не|ни|а|но|для|без|при|что|или)\s/gi, '$1$2\u00a0');

  // Сцена: все 231 заказ orders в порядке order_id. Бренд: b — Бриз, k — Кедр, l — Луч, s — Сова; статус: 1 — paid, 0 — cancelled.
  // SELECT string_agg(<буква бренда>, '' ORDER BY order_id), string_agg(<1|0 по status>, '' ORDER BY order_id) FROM orders
  const SB = 'bllkkssssskkkkkkblkssslsbbkbbbbbbkskkbkkkkkskkbkkkkkslkbsbsbssksslsssssbkbsbbbblbbbbbsssssslsbskkllbbbkkbbbbbbbbslkllllsbsbklblbbbbbbbbblkkblbbbbbkbsssssssslssslllssssssslsslsssskssbssskssskkkkkkllllbblbkbbbbsbllbsllkssksbsssssssss';
  const SP = '111111111111101101101111111111101110011111111111100111111110110111011011111101111111111111111100111111110111111111011011101110111111111111111101111010011111111111111111111110111110111110111111111100110111011110110111111110111101011';
  const BR = ['Бриз', 'Кедр', 'Луч', 'Сова'];
  const BC = ['#5fb3e8', '#f0a247', '#e3c04d', '#a48af0'];
  // SELECT brand, COUNT(*), SUM(amount) FROM orders WHERE status = 'paid' GROUP BY brand ORDER BY brand
  const NP = [55, 39, 30, 71], SUMP = [266300, 218090, 151540, 276150];
  const TL = [...SB].map((c, i) => ({ i, b: 'bkls'.indexOf(c), paid: SP[i] === '1' }));
  (() => { let pi = 0; const bi = [0, 0, 0, 0]; TL.forEach(t => { if (t.paid) { t.pi = pi++; t.bi = bi[t.b]++; } }); })();

  /* ===================== Сцена ===================== */
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], t))).join(',')})`; };
  const NEU = '#4d5b7c', RED = '#f2756a';

  // предложения в порядке выполнения; w — место в записи запроса
  const CL = [
    { kw: 'FROM', full: 'FROM orders', short: 'FROM orders', w: 1 },
    { kw: 'WHERE', full: "WHERE status = 'paid'", short: "WHERE status = 'paid'", w: 2 },
    { kw: 'GROUP', full: 'GROUP BY brand', short: 'GROUP BY brand', w: 3 },
    { kw: 'HAVING', full: 'HAVING COUNT(*) >= 35', short: 'HAVING COUNT(*) >= 35', w: 4 },
    { kw: 'SELECT', full: 'SELECT brand, COUNT(*) AS orders, SUM(amount) AS revenue', short: 'SELECT … AS revenue', mob: 'SELECT brand, … AS orders, … AS revenue', w: 0 },
    { kw: 'ORDER', full: 'ORDER BY revenue DESC', short: 'ORDER BY revenue DESC', w: 5 },
    { kw: 'LIMIT', full: 'LIMIT 2', short: 'LIMIT 2', w: 6 }
  ];
  const WRITTEN = [4, 0, 1, 2, 3, 5, 6];
  const ACT = [-1, -1, 0, 1, 2, 2, 3, 4, 5, 6, -2];   // активное предложение на шаге
  const PRE = { 0: 0, 1: 1, 3: 2 }, POST = { 3: 0, 0: 1, 1: 2 };   // строки результата до и после ORDER BY

  const GEO = {
    d: { ww: 600, wh: 420, mob: false, fx: 65, fw: 470, fh: 32, fg: 8, sw: 178, sh: 30, sg: 8,
      ax: 198, aw: 402, tp: 15, ts: 12, ty0: 128, pc: 6, pg: 18, pb: 330, ry: 158, rh: 34, rcw: [130, 100, 130] },
    m: { ww: 300, wh: 400, mob: true, fx: 0, fw: 300, fh: 26, fhs: 42, fg: 6, chw: 40, chg: 3.33, chh: 24,
      ax: 0, aw: 300, tp: 13, ts: 10, ty0: 142, pc: 5, pg: 12, pb: 332, ry: 158, rh: 32, rcw: [110, 80, 100] }
  };

  const scene = {
    parts: [{ n: '01', name: 'Запись', s: [0, 1] }, { n: '02', name: 'FROM, WHERE', s: [2, 3] }, { n: '03', name: 'GROUP BY', s: [4, 5] }, { n: '04', name: 'HAVING', s: [6] }, { n: '05', name: 'SELECT', s: [7] }, { n: '06', name: 'ORDER, LIMIT', s: [8, 9, 10] }],
    steps: [
      { title: 'Запрос, как его пишут', dur: 3400, body: '<p>Запрос к учебной таблице <b>orders</b> интернет-магазина: два бренда с наибольшей выручкой среди тех, у кого не меньше 35 оплаченных заказов.</p><p>Читаем его сверху вниз, и первым стоит <b>SELECT</b>.</p>' },
      { title: 'Порядок выполнения', dur: 3800, body: '<p>База выполняет предложения в другом порядке: источник, фильтр строк, группы, фильтр групп. <b>SELECT</b> идёт только пятым, за ним сортировка и <b>LIMIT</b>.</p><p>Каждый шаг получает таблицу от предыдущего.</p>' },
      { title: 'FROM: вся таблица', dur: 3200, body: '<p><b>FROM orders</b> берёт таблицу целиком: 231 строка, 10 столбцов. Каждая клетка на сцене — один заказ.</p>' },
      { title: 'WHERE: фильтр строк', dur: 3800, body: '<p><b>WHERE</b> проверяет условие у каждой строки отдельно. 36 отменённых заказов не проходят, дальше идут 195.</p><p>Групп ещё нет, поэтому спросить здесь про COUNT(*) нельзя.</p>' },
      { title: 'GROUP BY: стопки по бренду', dur: 3800, body: '<p><b>GROUP BY brand</b> раскладывает 195 строк по четырём группам, по одной на бренд. Дальше запрос работает с группами, а не со строками.</p>' },
      { title: 'Агрегаты по группам', dur: 3200, body: '<p>Для каждой группы считаются агрегаты: <b>COUNT(*)</b> — число строк, <b>SUM(amount)</b> — сумма. Десятки строк группы сворачиваются в одно число на каждый агрегат.</p>' },
      { title: 'HAVING: фильтр групп', dur: 3600, body: '<p><b>HAVING</b> проверяет условие у каждой группы. У Луча 30 оплаченных заказов, меньше порога 35, и группа выбывает.</p><p>Осталось три группы.</p>' },
      { title: 'SELECT: столбцы и имена', dur: 3400, body: '<p>Только теперь <b>SELECT</b> собирает выходные столбцы: brand и два агрегата. <b>AS</b> даёт им имена <b>orders</b> и <b>revenue</b> — раньше этих имён не было.</p>' },
      { title: 'ORDER BY: сортировка', dur: 3200, body: '<p><b>ORDER BY revenue DESC</b> сортирует строки по убыванию выручки. Имя revenue здесь уже есть: SELECT выполнен.</p>' },
      { title: 'LIMIT: первые две', dur: 3000, body: '<p><b>LIMIT 2</b> оставляет две первые строки отсортированной таблицы: Сову и Бриз. Без ORDER BY «первые две» были бы какими угодно.</p>' },
      { title: 'Почему WHERE не видит revenue', dur: 3800, next: 'Читать страницу', body: '<p>Условие <b>WHERE revenue &gt; 250000</b> PostgreSQL отвергнет: WHERE — второй шаг, а имя revenue появится на пятом.</p><p>Условие на выручку бренда пишут в HAVING выражением: <b>HAVING SUM(amount) &gt; 250000</b>. В ORDER BY имя уже работает.</p>' }
    ].map(s => Object.assign(s, { body: nb(s.body) })),
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'cols', label: 'Столбцов' }, { id: 'st', label: 'Этап' }],
    legend: '<span><i class="sq" style="background:#4d5b7c"></i>строка orders</span><span><i class="sq" style="background:#f2756a"></i>отброшено</span><span><i class="sq" style="background:#a48af0"></i>группа бренда</span>',
    info: 'ПОРЯДОК ВЫПОЛНЕНИЯ',
    aiNote: 'В анимации запрос к учебной таблице orders (231 заказ интернет-магазина за январь–март 2026): SELECT brand, COUNT(*) AS orders, SUM(amount) AS revenue FROM orders WHERE status = \'paid\' GROUP BY brand HAVING COUNT(*) >= 35 ORDER BY revenue DESC LIMIT 2. Карточки предложений перестраиваются из порядка записи в порядок выполнения FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. FROM: 231 строка, 10 столбцов; WHERE убирает 36 отменённых, остаётся 195; GROUP BY даёт 4 группы: Бриз 55 заказов и 266 300 ₽, Кедр 39 и 218 090 ₽, Луч 30 и 151 540 ₽, Сова 71 и 276 150 ₽; HAVING убирает Луч (30 < 35); SELECT даёт 3 строки и 3 столбца с именами orders и revenue; ORDER BY revenue DESC: Сова, Бриз, Кедр; LIMIT 2 оставляет Сову и Бриз. Последний шаг: WHERE revenue > 250000 даёт ошибку column "revenue" does not exist, потому что имя появляется только в SELECT.',
    mount(root, api) {
      const { hl } = api;
      root.innerHTML = '<div class="qo"><canvas class="qo-cv" aria-hidden="true"></canvas><div class="qo-w"></div></div>';
      const qo = root.firstChild, cv = qo.firstChild, w = qo.lastChild, ctx = cv.getContext('2d');
      w._c = {};
      const mk = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; d._c = {}; w.appendChild(d); return d; };
      const cards = CL.map((c, i) => mk('qo-card', `<span class="qo-n">${i + 1}</span><span class="qo-f">${hl(c.full, 'sql')}</span><span class="qo-s">${hl(c.short, 'sql')}</span><span class="qo-k">${c.kw}</span>`));
      const cur = mk('qo-cur', '');
      const plab = BR.map((b, i) => mk('qo-plab', `<b style="color:${BC[i]}">${b}</b><span>${NP[i]}</span><small>${fmtN(SUMP[i])}</small>`));
      const thr = mk('qo-thr', '<span>порог 35</span>');
      const head = mk('qo-row qo-head', '<span>brand</span><span class="qo-al">orders</span><span class="qo-al qo-rv">revenue<i>↓</i></span>');
      const rows = [0, 1, 3].map(b => ({ b, el: mk('qo-row', `<span style="color:${BC[b]}">${BR[b]}</span><span>${NP[b]}</span><span>${fmtN(SUMP[b])}</span>`) }));
      const cut = mk('qo-cut', '<span>LIMIT 2</span>');
      const call = mk('qo-call', '');
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'qo-svg'); svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = '<defs><marker id="qo-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#f2756a"/></marker></defs><path class="qo-arc" marker-end="url(#qo-ah)"/>';
      w.appendChild(svg);
      const arc = svg.lastChild;

      let G = GEO.d, scale = 1, ox = 0, oy = 0, sig = '', dirty = true, W = 0, H = 0;
      const dpr = () => Math.min(2, window.devicePixelRatio || 1);
      const fit = () => {
        W = qo.clientWidth; H = qo.clientHeight; if (!W || !H) return;
        const g = W < 470 ? GEO.m : GEO.d;
        if (g !== G) G = g;
        scale = Math.min(W / G.ww, H / G.wh, 1.15);
        ox = (W - G.ww * scale) / 2; oy = (H - G.wh * scale) / 2;
        w.style.width = G.ww + 'px'; w.style.height = G.wh + 'px';
        w.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px) scale(${scale.toFixed(4)})`;
        svg.setAttribute('width', G.ww); svg.setAttribute('height', G.wh);
        const r = dpr(); cv.width = Math.round(W * r); cv.height = Math.round(H * r); cv.style.width = W + 'px'; cv.style.height = H + 'px';
        dirty = true;
      };
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(qo);
      fit();

      const set = (el, x, y, o, wd, ht) => {
        const c = el._c, t = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
        if (c.t !== t) { el.style.transform = t; c.t = t; }
        const op = o <= 0.001 ? '0' : o >= 0.999 ? '1' : o.toFixed(3);
        if (c.o !== op) { el.style.opacity = op; el.style.visibility = op === '0' ? 'hidden' : 'visible'; c.o = op; }
        if (wd != null && c.w !== wd) { el.style.width = wd + 'px'; c.w = wd; }
        if (ht != null && c.h !== ht) { el.style.height = ht + 'px'; c.h = ht; }
      };
      const cls = (el, name, on) => { const c = el._c; if (c[name] !== on) { el.classList.toggle(name, on); c[name] = on; } };

      // геометрия мира
      const fullH = id => G.mob && id === 4 ? G.fhs : G.fh;
      const fullY = (order, id) => {
        const tot = order.reduce((a, j) => a + fullH(j), 0) + G.fg * (order.length - 1);
        let y = (G.wh - tot) / 2 + (G.mob ? 8 : 0);
        for (const j of order) { if (j === id) return y; y += fullH(j) + G.fg; }
        return y;
      };
      const stripXY = i => G.mob ? [i * (G.chw + G.chg), 0, G.chw, G.chh] : [0, (G.wh - (7 * G.sh + 6 * G.sg)) / 2 + i * (G.sh + G.sg), G.sw, G.sh];
      const gw = 21 * G.tp - (G.tp - G.ts);
      const gridXY = n => [G.ax + (G.aw - gw) / 2 + (n % 21) * G.tp, G.ty0 + Math.floor(n / 21) * G.tp];
      const pw = () => G.pc * G.tp - (G.tp - G.ts);
      const pileX = b => G.ax + (G.aw - (4 * pw() + 3 * G.pg)) / 2 + b * (pw() + G.pg);
      const pileXY = (b, n) => [pileX(b) + (n % G.pc) * G.tp, G.pb - (Math.floor(n / G.pc) + 1) * G.tp + (G.tp - G.ts)];
      const tw = () => G.rcw[0] + G.rcw[1] + G.rcw[2];
      const rowX = () => G.ax + (G.aw - tw()) / 2;
      const rowY = s => G.ry + s * G.rh;
      const thrY = () => G.pb - 35 / G.pc * G.tp;
      const cx = G => G.ax + G.aw / 2;

      function tile(t, k, p) {
        if (k < 2 || k > 7) return null;
        const from = gridXY(t.i);
        if (k === 2) { const d = (t.i % 21) * .012 + Math.floor(t.i / 21) * .022; return [from[0], from[1], NEU, seg(p, d, d + .25)]; }
        if (k === 3) {
          if (!t.paid) { const r = seg(p, .05, .3); return [from[0], from[1] + seg(p, .3, .5) * 8, mix(NEU, RED, r), 1 - seg(p, .32, .5)]; }
          const c = gridXY(t.pi), d = t.pi * .0008, m = ease(seg(p, .5 + d, .82 + d));
          return [lerp(from[0], c[0], m), lerp(from[1], c[1], m), NEU, 1];
        }
        if (!t.paid) return null;
        const c = gridXY(t.pi), pl = pileXY(t.b, t.bi);
        if (k === 4) { const d = t.pi / 195 * .4, m = ease(seg(p, d, d + .45)); return [lerp(c[0], pl[0], m), lerp(c[1], pl[1], m), mix(NEU, BC[t.b], m), 1]; }
        if (k === 5) return [pl[0], pl[1], BC[t.b], 1];
        if (k === 6) {
          if (t.b !== 2) return [pl[0], pl[1], BC[t.b], 1];
          return [pl[0], pl[1] + seg(p, .55, .85) * 10, mix(BC[2], RED, seg(p, .35, .55)), 1 - seg(p, .55, .85)];
        }
        if (t.b === 2) return null;
        const m = ease(seg(p, .02, .5)), tx = rowX() + 24 + (t.bi % 8) * 3, ty = rowY(PRE[t.b]) + G.rh / 2 - G.ts / 2;
        return [lerp(pl[0], tx, m), lerp(pl[1], ty, m), BC[t.b], 1 - seg(p, .3, .55)];
      }
      function drawTiles(k, p) {
        const r = dpr();
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
        if (k < 2 || k > 7) return;
        ctx.setTransform(r * scale, 0, 0, r * scale, r * ox, r * oy);
        const s = G.ts, rr = G.mob ? 1.5 : 2;
        for (const t of TL) {
          const q = tile(t, k, p); if (!q || q[3] <= 0.01) continue;
          ctx.globalAlpha = q[3]; ctx.fillStyle = q[2];
          ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(q[0], q[1], s, s, rr); else ctx.rect(q[0], q[1], s, s); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      function callAt(k) {
        const m = G.mob, c = cx(G);
        const top = m ? 62 : 100;
        switch (k) {
          case 0: return [m ? 0 : G.fx, fullY(WRITTEN, 4) - 30, 'так запрос пишут: SELECT первым', 0];
          case 1: return [m ? 0 : G.fx, fullY(WRITTEN, 4) - 30, 'а выполняется SELECT пятым', 0];
          case 2: return [gridXY(0)[0], G.ty0 - 34, 'orders: 231 строка × 10 столбцов', 0];
          case 3: return [gridXY(0)[0], G.ty0 - 34, "status = 'paid': −36 строк, осталось 195", 0];
          case 4: return [c, top, '195 строк → 4 группы по brand', 2];
          case 5: return [c, top, 'COUNT(*) и SUM(amount) по каждой группе', 2];
          case 6: return [c, top, 'Луч: COUNT(*) = 30 < 35, группа выбывает', 2];
          case 7: return [c, m ? 86 : 96, 'имена orders и revenue появились здесь', 2];
          case 8: return [c, m ? 86 : 96, 'ORDER BY уже видит revenue', 2];
          case 9: return [c, m ? 86 : 96, 'LIMIT 2: третья строка отброшена', 2];
          case 10: return [c, m ? 64 : 76, 'WHERE revenue > 250000\nERROR: column "revenue" does not exist', 2];
        }
        return null;
      }

      return {
        render(k, p) {
          // счётчики
          const rv = k < 2 ? '—' : k === 2 ? '231' : k === 3 ? (p < .5 ? '231' : '195') : k === 4 ? (p < .55 ? '195' : '4') : k === 5 ? '4' : k === 6 ? (p < .6 ? '4' : '3') : k < 9 ? '3' : k === 9 ? (p < .5 ? '3' : '2') : '2';
          api.hud('rows', rv, (k === 4 && p >= .55) || k === 5 || k === 6 ? 'группы' : '');
          api.hud('cols', k < 2 ? '—' : k < 7 ? '10' : k === 7 ? (p < .55 ? '10' : '3') : '3');
          const a = ACT[k];
          api.hud('st', a === -1 ? '—' : a === -2 ? '7/7' : `${a + 1}/7`, a === -1 ? '' : a === -2 ? 'итог' : CL[a].kw === 'GROUP' ? 'GROUP BY' : CL[a].kw === 'ORDER' ? 'ORDER BY' : CL[a].kw);

          const key = [k, Math.round(p * 500), G.mob].join('|');
          if (key === sig && !dirty) return; sig = key; dirty = false;
          drawTiles(k, p);
          cls(w, 'qo-mob', G.mob);

          // карточки предложений
          CL.forEach((c, i) => {
            const el = cards[i];
            let x, y, wd, ht, o = 1, mode = 'f', badge = 0;
            const fH = fullH(i);
            if (k === 0) { x = G.fx; y = fullY(WRITTEN, i); wd = G.fw; ht = fH; o = seg(p, c.w * .06, c.w * .06 + .3); }
            else if (k === 1) {
              const t = ease(seg(p, .12, .7)), y0 = fullY(WRITTEN, i), y1 = fullY([0, 1, 2, 3, 4, 5, 6], i);
              x = G.fx + (i === 4 && !G.mob ? Math.sin(Math.PI * t) * 46 : 0); y = lerp(y0, y1, t); wd = G.fw; ht = fH; badge = seg(p, .7, .95);
            } else {
              const [sx, sy, sw, sh] = stripXY(i), t = k === 2 ? ease(seg(p, 0, .4)) : 1;
              x = lerp(G.fx, sx, t); y = lerp(fullY([0, 1, 2, 3, 4, 5, 6], i), sy, t); wd = Math.round(lerp(G.fw, sw, t)); ht = Math.round(lerp(fH, sh, t));
              mode = t < .5 ? 'f' : G.mob ? 'k' : 's'; badge = G.mob ? (t < .5 ? 1 : 0) : 1;
            }
            set(el, x, y, o, wd, ht);
            if (el._c.mode !== mode) { el.dataset.m = mode; el._c.mode = mode; }
            const n = el.firstChild, bo = badge.toFixed(2); if (n._o !== bo) { n.style.opacity = bo; n._o = bo; }
            cls(el, 'wrap', G.mob && mode === 'f' && i === 4);
            cls(el, 'on', a >= 0 && a === i);
            cls(el, 'done', a >= 0 && i < a);
            cls(el, 'sel', k === 1 && i === 4 || k === 10 && i === 4);
            cls(el, 'bad', k === 10 && i === 1);
          });
          // текущее предложение на узком экране
          if (G.mob) {
            const txt = a >= 0 ? (CL[a].mob || CL[a].short) : '';
            if (cur._c.txt !== txt) { cur.innerHTML = hl(txt, 'sql'); cur._c.txt = txt; }
            set(cur, 0, 32, k >= 2 && k < 10 ? (k === 2 ? seg(p, .35, .6) : 1) : 0, 300, 18);
          } else set(cur, 0, 0, 0);

          // подписи стопок
          plab.forEach((el, b) => {
            const o = k === 4 ? seg(p, .6, .9) : k === 5 ? 1 : k === 6 ? (b === 2 ? 1 - seg(p, .55, .85) : 1) : k === 7 ? (b === 2 ? 0 : 1 - seg(p, 0, .3)) : 0;
            set(el, pileX(b), G.pb + 6, o, pw(), null);
            cls(el, 'sum', k >= 5);
            cls(el, 'out', k === 6 && b === 2 && p > .35);
          });
          set(thr, G.ax, thrY(), k === 6 ? seg(p, 0, .3) : k === 7 ? 1 - seg(p, 0, .3) : 0, G.aw, null);
          const tl = (pileX(2) - G.ax + 2) + 'px'; if (thr.firstChild._l !== tl) { thr.firstChild.style.left = tl; thr.firstChild._l = tl; }

          // таблица результата
          const hx = rowX(), ho = k < 7 ? 0 : k === 7 ? seg(p, .35, .7) : 1;
          set(head, hx, G.ry - 28, ho, tw(), 24);
          cls(head, 'new', k === 7);
          cls(head, 'sort', k >= 8);
          rows.forEach(({ b, el }) => {
            const s = k < 8 ? PRE[b] : k === 8 ? lerp(PRE[b], POST[b], ease(seg(p, .1, .7))) : POST[b];
            let o = k < 7 ? 0 : k === 7 ? seg(p, .35, .7) : 1;
            if (b === 1 && k >= 9) o = k === 9 ? 1 - .82 * seg(p, .3, .6) : .18;
            set(el, hx, rowY(s), o, tw(), G.rh - 4);
            cls(el, 'cutr', b === 1 && (k === 9 && p > .3 || k === 10));
          });
          set(cut, hx - 8, rowY(2) - 3, k === 9 ? seg(p, .1, .4) : k === 10 ? 1 : 0, tw() + 16, null);

          // стрелка «имя рождается в SELECT, а WHERE раньше»
          const ao = k === 10 ? seg(p, .1, .4) : 0;
          if (ao > 0) {
            let d;
            if (G.mob) { const x4 = stripXY(4)[0] + G.chw / 2, x1 = stripXY(1)[0] + G.chw / 2; d = `M${x4} ${G.chh + 2} C${x4} ${G.chh + 30} ${x1} ${G.chh + 30} ${x1} ${G.chh + 4}`; }
            else { const y4 = stripXY(4)[1] + G.sh / 2, y1 = stripXY(1)[1] + G.sh / 2, xr = G.sw + 2; d = `M${xr} ${y4} C${xr + 22} ${y4} ${xr + 22} ${y1} ${xr + 3} ${y1}`; }
            arc.setAttribute('d', d);
          }
          arc.style.opacity = ao.toFixed(3);

          // выноска
          const c = p > .35 ? callAt(k) : null;
          if (!c) set(call, call._c.x || 0, call._c.y || 0, 0);
          else {
            if (call._c.txt !== c[2]) { call.innerHTML = c[2].split('\n').map(s => `<span>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`).join(''); call._c.txt = c[2]; }
            const al = c[3] === 1 ? 'r' : c[3] === 2 ? 'c' : 'l';
            if (call._c.al !== al) { call.dataset.al = al; call._c.al = al; }
            call._c.x = c[0]; call._c.y = c[1];
            cls(call, 'err', k === 10);
            set(call, c[0], c[1], seg(p, .35, .5));
          }
        }
      };
    }
  };

  /* ===================== Интерактив «Запрос по шагам» ===================== */
  // Учебная выборка: SELECT order_id, customer_id, amount, status FROM orders WHERE customer_id IN (101, 104, 106, 143) ORDER BY order_id
  const SMP = [[1001, 101, 6770, 'paid'], [1002, 101, 2630, 'paid'], [1003, 101, 5850, 'paid'], [1020, 104, 8200, 'cancelled'], [1021, 104, 5310, 'paid'], [1022, 104, 6190, 'paid'], [1023, 104, 2920, 'paid'], [1024, 104, 5580, 'paid'], [1034, 106, 5110, 'paid'], [1035, 106, 10020, 'paid'], [1036, 106, 4140, 'cancelled'], [1037, 106, 690, 'cancelled'], [1161, 143, 9140, 'paid'], [1162, 143, 2730, 'paid'], [1163, 143, 2920, 'paid']];

  /*qx:start*/
  // Логический порядок на JS. Сверено с PostgreSQL 16.15 для всех 27 расстановок и всех 7 этапов (tools в отчёте страницы).
  // Ошибки — в том порядке, в каком их находит PostgreSQL: условия WHERE слева направо, затем псевдоним в HAVING,
  // затем столбец вне GROUP BY в HAVING.
  const COND = [
    { id: 'st', sql: "status = 'paid'", kind: 'row' },
    { id: 'cnt', sql: 'COUNT(*) >= 3', kind: 'agg' },
    { id: 'rev', sql: 'revenue >= 15000', kind: 'alias' }
  ];
  const ERR = {
    agg: 'aggregate functions are not allowed in WHERE',
    alias: 'column "revenue" does not exist',
    group: 'column "sample.status" must appear in the GROUP BY clause or be used in an aggregate function'
  };
  function runQuery(pos) {
    const W = COND.filter(c => pos[c.id] === 'where'), H = COND.filter(c => pos[c.id] === 'having');
    let err = null;
    for (const c of W) if (c.kind !== 'row') { err = { at: 1, c: c.id, kind: c.kind === 'agg' ? 'agg' : 'alias', msg: c.kind === 'agg' ? ERR.agg : ERR.alias }; break; }
    if (!err) { const c = H.find(x => x.kind === 'alias'); if (c) err = { at: 3, c: c.id, kind: 'alias', msg: ERR.alias }; }
    if (!err) { const c = H.find(x => x.kind === 'row'); if (c) err = { at: 3, c: c.id, kind: 'group', msg: ERR.group }; }
    const rows = SMP.map(([order_id, customer_id, amount, status]) => ({ order_id, customer_id, amount, status }));
    const where = rows.map(r => ({ r, ok: W.every(c => c.kind !== 'row' || r.status === 'paid') }));
    const kept = where.filter(x => x.ok).map(x => x.r);
    const ids = [...new Set(kept.map(r => r.customer_id))].sort((a, b) => a - b);
    const groups = ids.map(id => { const rs = kept.filter(r => r.customer_id === id); return { customer_id: id, rows: rs, count: rs.length, sum: rs.reduce((s, r) => s + r.amount, 0) }; });
    const having = groups.map(g => ({ g, ok: H.every(c => c.kind !== 'agg' || g.count >= 3) }));
    const sel = having.filter(x => x.ok).map(x => ({ customer_id: x.g.customer_id, orders: x.g.count, revenue: x.g.sum }));
    const ord = sel.slice().sort((a, b) => b.revenue - a.revenue);
    return { W, H, err, rows, where, kept, groups, having, sel, ord, lim: ord.slice(0, 2) };
  }
  /*qx:end*/

  const STG = ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY', 'LIMIT'];
  const KIND = { row: 'условие на строку', agg: 'условие на группу', alias: 'псевдоним из SELECT' };
  const PLACES = [['where', 'WHERE'], ['having', 'HAVING'], ['off', 'нет']];

  function buildSteps(box, api) {
    const { $, esc, hl, plural } = api;
    const S0 = () => ({ pos: { st: 'where', cnt: 'having', rev: 'off' }, k: 0 });
    let s = S0(), R = null;
    box.innerHTML = `<div class="block-hd"><span class="t">WHERE отбирает строки, HAVING — группы <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="qs-reset">Сбросить</button></div></div>
<p class="hint qs-do">Переставляйте условия между WHERE и HAVING и шагайте по этапам. Таблица под запросом — то, что этап передаёт следующему.</p>
<div class="qs-conds" id="qs-conds">${COND.map(c => `<div class="qs-cond" data-c="${c.id}"><code>${hl(c.sql, 'sql')}</code><small>${KIND[c.kind]}</small><span class="seg" role="group" aria-label="Куда поставить ${esc(c.sql)}">${PLACES.map(([v, t]) => `<button type="button" data-c="${c.id}" data-p="${v}">${t}</button>`).join('')}</span></div>`).join('')}</div>
<div class="stage"><div class="qs-main"><pre class="qs-sql" id="qs-sql"></pre><p class="qs-cap" id="qs-cap"></p><div class="qs-tw" id="qs-tbl"></div></div>
<div class="narr"><p class="cap">Порядок выполнения</p><ol class="qs-steps" id="qs-steps">${STG.map((t, i) => `<li><button type="button" data-k="${i}"><b>${i + 1}</b>${t}</button></li>`).join('')}</ol>
<div class="qs-nav"><button type="button" class="btn ghost small" id="qs-prev">← Назад</button><button type="button" class="btn small" id="qs-next">Следующий этап →</button></div>
<div class="narr-text" id="qs-msg"></div><div class="readout"><div><span class="big" id="qs-n"></span><span class="lbl" id="qs-nl"></span></div></div></div></div>
<div class="status"><span><span class="dot live" id="qs-dot"></span><span id="qs-s1"></span></span><span class="grow"></span><span id="qs-s2"></span></div>`;

    const th = cols => `<thead><tr>${cols.map(c => `<th${c[1] ? ` class="${c[1]}"` : ''}>${c[0]}</th>`).join('')}</tr></thead>`;
    const tbl = (cols, body) => `<table>${th(cols)}<tbody>${body}</tbody></table>`;
    const rowTr = (r, extra, cl) => `<tr${cl ? ` class="${cl}"` : ''}><td>${r.order_id}</td><td>${r.customer_id}</td><td>${r.amount}</td><td class="${r.status === 'paid' ? '' : 'qs-cn'}">${r.status}</td>${extra != null ? `<td class="qs-mk">${extra}</td>` : ''}</tr>`;
    const BASE = [['order_id'], ['customer_id'], ['amount'], ['status']];
    const ids = a => a.join(', ');
    const sumRu = n => `${fmtN(n)}\u00a0₽`;

    function errBox(e) {
      const why = {
        agg: 'На этапе WHERE групп ещё нет, и COUNT(*) нечего считать. Условие с агрегатом ставят в HAVING.',
        alias: e.at === 1 ? 'Имя revenue создаст SELECT на пятом шаге. На втором его ещё нет, а столбца с таким именем в sample нет вовсе.' : 'HAVING — четвёртый шаг, а имя revenue появится на пятом. В HAVING повторяют выражение: SUM(amount) >= 15000. SQLite и DuckDB такой псевдоним разрешают, PostgreSQL — нет.',
        group: 'HAVING видит группы, а в группе у status может быть несколько значений: какое сравнивать? Столбец должен стоять в GROUP BY или внутри агрегата. PostgreSQL проверяет это до выполнения, а не по данным.'
      }[e.kind];
      return `<div class="qs-err"><p><b>ERROR:</b> ${esc(e.msg)}</p><p>${esc(why)}</p></div>`;
    }
    function table(k) {
      const e = R.err;
      if (e && k === e.at) {
        let extra = '';
        if (e.kind === 'group') extra = tbl([['customer_id'], ['status в группе', 'qs-bad']], R.groups.map(g => `<tr><td>${g.customer_id}</td><td class="qs-bad">${ids(g.rows.map(r => r.status))}</td></tr>`).join(''));
        if (e.kind === 'alias' && k === 3) extra = tbl([['customer_id'], ['COUNT(*)'], ['SUM(amount)'], ['revenue', 'qs-bad']], R.groups.map(g => `<tr><td>${g.customer_id}</td><td>${g.count}</td><td>${g.sum}</td><td class="qs-bad">?</td></tr>`).join(''));
        if (e.at === 1) extra = tbl(BASE.concat([[e.kind === 'agg' ? 'COUNT(*)' : 'revenue', 'qs-bad']]), R.rows.slice(0, 4).map(r => rowTr(r, '?')).join('') + '<tr class="qs-more"><td colspan="5">… ещё 11 строк</td></tr>');
        return errBox(e) + extra;
      }
      if (k === 0) return tbl(BASE, R.rows.map(r => rowTr(r)).join(''));
      if (k === 1) {
        if (!R.W.length) return tbl(BASE, R.rows.map(r => rowTr(r)).join(''));
        return tbl(BASE.concat([['']]), R.where.map(x => rowTr(x.r, x.ok ? '✓' : '✗', x.ok ? '' : 'qs-out')).join(''));
      }
      if (k === 2) return tbl(BASE, R.groups.map((g, n) => `<tr class="qs-gh${n % 2 ? ' odd' : ''}"><td colspan="4">customer_id = ${g.customer_id} · ${g.count} ${plural(g.count, ['строка', 'строки', 'строк'])}</td></tr>` + g.rows.map(r => rowTr(r, null, n % 2 ? 'odd' : '')).join('')).join(''));
      if (k === 3) {
        const hasH = R.H.length > 0;
        return tbl([['customer_id'], ['COUNT(*)', hasH ? 'qs-hot' : ''], ['SUM(amount)']].concat(hasH ? [['']] : []), R.having.map(x => `<tr${x.ok ? '' : ' class="qs-out"'}><td>${x.g.customer_id}</td><td${hasH ? ' class="qs-hot"' : ''}>${x.g.count}</td><td>${x.g.sum}</td>${hasH ? `<td class="qs-mk">${x.ok ? '✓' : '✗'}</td>` : ''}</tr>`).join(''));
      }
      const cols = [['customer_id'], ['orders', k === 4 ? 'qs-new' : ''], ['revenue', k === 4 ? 'qs-new' : k >= 5 ? 'qs-hot' : '']];
      if (k >= 5) cols[2][0] = 'revenue ↓';
      if (k === 4) return tbl(cols, R.sel.map(r => `<tr><td>${r.customer_id}</td><td>${r.orders}</td><td>${r.revenue}</td></tr>`).join(''));
      return tbl(cols, R.ord.map((r, i) => `<tr${k === 6 && i >= 2 ? ' class="qs-out"' : ''}><td>${r.customer_id}</td><td>${r.orders}</td><td${k >= 5 ? ' class="qs-hot"' : ''}>${r.revenue}</td></tr>`).join(''));
    }
    function outCount(k) {
      if (R.err && k >= R.err.at) return null;
      return [R.rows.length, R.kept.length, R.groups.length, R.sel.length, R.sel.length, R.ord.length, R.lim.length][k];
    }
    function message(k) {
      const e = R.err;
      if (e && k === e.at) return 'Здесь условие теряет смысл. На деле PostgreSQL находит ошибку ещё при разборе запроса и не возвращает ни одной строки.';
      const sc = R.W.find(c => c.id === 'st'), hc = R.H.find(c => c.id === 'cnt');
      switch (k) {
        case 0: return `<b>FROM sample</b> берёт все ${R.rows.length} строк выборки. Столбцов orders и revenue ещё нет.`;
        case 1: {
          if (!R.W.length) return '<b>WHERE</b> нет: все 15 строк идут дальше, отменённые заказы тоже.';
          const out = R.where.filter(x => !x.ok).map(x => x.r.order_id);
          return `<b>WHERE</b> проверяет каждую строку отдельно. Отменённые заказы ${ids(out)} выбывают, остаётся ${R.kept.length}.`;
        }
        case 2: return `<b>GROUP BY customer_id</b> раскладывает ${R.kept.length} строк по ${R.groups.length} группам. Здесь они идут по customer_id, но без ORDER BY база порядок не обещает.`;
        case 3: {
          if (!hc) return '<b>HAVING</b> нет: все группы идут дальше.';
          const out = R.having.filter(x => !x.ok).map(x => x.g.customer_id);
          let t = `<b>HAVING</b> проверяет каждую группу целиком: COUNT(*) >= 3. ${out.length ? `${out.length === 1 ? 'Выбывает клиент' : 'Выбывают клиенты'} ${R.having.filter(x => !x.ok).map(x => `${x.g.customer_id}: COUNT(*) = ${x.g.count}`).join(', ')}.` : 'Проходят все.'}`;
          if (!sc) t += ' Без WHERE в COUNT(*) попали и отменённые заказы: у клиента 106 их два, и он прошёл порог.';
          return t;
        }
        case 4: return `<b>SELECT</b> собирает выходные столбцы и даёт им имена orders и revenue — по строке на группу, всего ${R.sel.length}.`;
        case 5: return '<b>ORDER BY revenue DESC</b> сортирует по убыванию выручки. Имя revenue здесь уже есть: его создал SELECT.';
        case 6: {
          const top = R.lim.map(r => `${r.customer_id} (${sumRu(r.revenue)})`).join(' и ');
          let t = `<b>LIMIT 2</b> оставляет первые две строки: ${top}.`;
          if (R.lim[1] && R.lim[1].customer_id === 106) t += ' Второе место занял клиент 106 — за счёт двух отменённых заказов.';
          return t;
        }
      }
      return '';
    }
    function sqlText() {
      const e = R.err;
      const cond = c => `<span class="qs-c${e && e.c === c.id ? ' bad' : ''}">${hl(c.sql, 'sql')}</span>`;
      const and = ' <span class="kw">AND</span> ';
      const L = [
        [4, hl('SELECT customer_id, COUNT(*) AS orders, SUM(amount) AS revenue', 'sql')],
        [0, hl('FROM sample', 'sql')],
        [1, R.W.length ? `<span class="kw">WHERE</span> ${R.W.map(cond).join(and)}` : '<span class="com">-- WHERE нет</span>'],
        [2, hl('GROUP BY customer_id', 'sql')],
        [3, R.H.length ? `<span class="kw">HAVING</span> ${R.H.map(cond).join(and)}` : '<span class="com">-- HAVING нет</span>'],
        [5, hl('ORDER BY revenue DESC', 'sql')],
        [6, hl('LIMIT 2;', 'sql')]
      ];
      return L.map(([st, h]) => `<span class="qs-ln${st === s.k ? ' on' : ''}">${h}</span>`).join('');
    }
    function draw() {
      R = runQuery(s.pos);
      if (R.err && s.k > R.err.at) s.k = R.err.at;
      const k = s.k, e = R.err;
      box.querySelectorAll('.qs-cond').forEach(el => {
        const id = el.dataset.c;
        el.classList.toggle('bad', !!(e && e.c === id));
        el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.p === s.pos[id])));
      });
      $('qs-sql').innerHTML = sqlText();
      const n = outCount(k);
      $('qs-cap').textContent = e && k === e.at ? `Этап ${k + 1} · ${STG[k]}: ошибка` : `После этапа ${k + 1} · ${STG[k]}: ${n} ${k === 2 || k === 3 ? plural(n, ['группа', 'группы', 'групп']) : plural(n, ['строка', 'строки', 'строк'])}`;
      $('qs-tbl').innerHTML = table(k);
      box.querySelectorAll('#qs-steps button').forEach(b => {
        const i = +b.dataset.k, dead = !!(e && i > e.at);
        b.disabled = dead; b.classList.toggle('on', i === k); b.classList.toggle('x', dead); b.classList.toggle('err', !!(e && i === e.at));
        b.setAttribute('aria-current', i === k ? 'step' : 'false');
      });
      $('qs-prev').disabled = k === 0;
      $('qs-next').disabled = k === 6 || !!(e && k >= e.at);
      $('qs-msg').innerHTML = message(k);
      $('qs-n').textContent = n == null ? '—' : n;
      $('qs-nl').textContent = n == null ? 'запрос не выполнится' : `${k === 2 || k === 3 ? plural(n, ['группа', 'группы', 'групп']) : plural(n, ['строка', 'строки', 'строк'])} на выходе этапа`;
      $('qs-dot').classList.toggle('live', !e);
      $('qs-dot').classList.toggle('qs-dead', !!e);
      $('qs-s1').textContent = e ? `PostgreSQL 16 → ERROR: ${e.msg}` : `PostgreSQL 16 → ${R.lim.length} ${plural(R.lim.length, ['строка', 'строки', 'строк'])}: ${R.lim.map(r => `${r.customer_id} · ${r.revenue}`).join(', ')}`;
      $('qs-s2').textContent = `WHERE: ${R.W.length} · HAVING: ${R.H.length}`;
    }
    box.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.p) { s.pos[b.dataset.c] = b.dataset.p; draw(); }
      else if (b.dataset.k) { s.k = +b.dataset.k; draw(); }
    });
    $('qs-prev').addEventListener('click', () => { if (s.k > 0) { s.k--; draw(); } });
    $('qs-next').addEventListener('click', () => { if (s.k < 6) { s.k++; draw(); } });
    $('qs-reset').addEventListener('click', () => { s = S0(); draw(); });
    draw();
    return {
      describe() {
        const where = c => ({ where: 'в WHERE', having: 'в HAVING', off: 'убрано' })[s.pos[c.id]];
        return `условия: ${COND.map(c => `${c.sql} ${where(c)}`).join('; ')}; этап ${s.k + 1} из 7 (${STG[s.k]}); ${R.err ? `PostgreSQL вернёт ошибку: ${R.err.msg}` : `итог: ${R.lim.map(r => `клиент ${r.customer_id} — ${r.revenue} ₽`).join(', ')}`}.`;
      }
    };
  }

  /* ===================== Код ===================== */
  const PSQL = 'проверено: PostgreSQL 16.15';
  const code = {
    s1: { title: 'Запрос 1. Пять самых дорогих оплаченных заказов', badge: PSQL, lang: 'sql', outLabel: 'Вывод psql -f q1.sql',
      code: "-- SELECT: какие столбцы, FROM: из какой таблицы\nSELECT order_id, order_date, brand, amount\nFROM orders\nWHERE status = 'paid'          -- только оплаченные\nORDER BY amount DESC, order_id -- при равной сумме — по номеру\nLIMIT 5;",
      out: ' order_id | order_date | brand | amount \n----------+------------+-------+--------\n     1191 | 2026-02-27 | Кедр  |  18390\n     1112 | 2026-03-19 | Бриз  |  16660\n     1041 | 2026-01-12 | Кедр  |  15450\n     1052 | 2026-03-28 | Кедр  |  14050\n     1114 | 2026-01-14 | Луч   |  12550\n(5 rows)' },
    s2: { title: 'Запрос 2. Фильтры IN, BETWEEN и LIKE', badge: PSQL, lang: 'sql', outLabel: 'Вывод psql -f q2.sql',
      code: "SELECT product_name, category, price\nFROM products\nWHERE category IN ('свет', 'декор')   -- одно из значений списка\n  AND price BETWEEN 1500 AND 2500     -- обе границы включены\n  AND product_name LIKE '%«Сова»'     -- % — любые символы\nORDER BY price;",
      out: '      product_name       | category | price \n-------------------------+----------+-------\n Гирлянда «Сова»         | свет     |  1730\n Ваза «Сова»             | декор    |  1900\n Лампа настольная «Сова» | свет     |  2500\n(3 rows)',
      note: 'Лампа за 2 500 ₽ попала в выборку: BETWEEN включает обе границы.' },
    s3: { title: 'Запрос 3. DISTINCT и три вида COUNT', badge: PSQL, lang: 'sql', outLabel: 'Вывод psql -f q3.sql',
      code: "SELECT DISTINCT channel\nFROM orders\nORDER BY channel;\n\nSELECT COUNT(*)                    AS all_orders,\n       COUNT(rating)               AS rated,\n       COUNT(DISTINCT customer_id) AS customers\nFROM orders;",
      out: ' channel  \n----------\n органика\n рассылка\n реклама\n(3 rows)\n\n all_orders | rated | customers \n------------+-------+-----------\n        231 |   104 |        52\n(1 row)',
      note: 'COUNT(*) считает строки, COUNT(rating) — только непустые оценки, COUNT(DISTINCT customer_id) — разных клиентов.' },
    s4: { title: 'Запрос 4. NULL в сравнении, в сортировке и вторая страница', badge: PSQL, lang: 'sql', outLabel: 'Вывод psql -P null=NULL -f q4.sql',
      code: "-- сравнение с NULL даёт UNKNOWN, и строка выпадает\nSELECT COUNT(*) AS not_zima\nFROM orders\nWHERE promo_code <> 'ЗИМА10';\n\n-- «три лучших по оценке» за первую неделю февраля\nSELECT order_id, amount, rating\nFROM orders\nWHERE order_date BETWEEN '2026-02-01' AND '2026-02-07'\nORDER BY rating DESC, order_id\nLIMIT 3;\n\n-- NULL в конец, вторая страница по три строки\nSELECT order_id, amount, rating\nFROM orders\nWHERE order_date BETWEEN '2026-02-01' AND '2026-02-07'\nORDER BY rating DESC NULLS LAST, order_id\nLIMIT 3 OFFSET 3;",
      out: ' not_zima \n----------\n       19\n(1 row)\n\n order_id | amount | rating \n----------+--------+--------\n     1076 |   3320 |   NULL\n     1077 |   2190 |   NULL\n     1126 |   2190 |   NULL\n(3 rows)\n\n order_id | amount | rating \n----------+--------+--------\n     1128 |  12400 |      4\n     1129 |   6740 |      4\n     1140 |   2550 |      4\n(3 rows)',
      note: 'Без промокода ЗИМА10 — 209 заказов, а запрос нашёл 19: 190 строк с NULL выпали. «Лучшие по оценке» оказались заказами без оценки. Слово NULL psql печатает из-за параметра -P null=NULL, по умолчанию там пусто.' },
    s5: { title: 'Запрос 5. Запрос из сцены и псевдоним в WHERE', badge: PSQL, lang: 'sql', outLabel: 'Вывод psql -f q5.sql',
      code: "SELECT brand,\n       COUNT(*)    AS orders,\n       SUM(amount) AS revenue\nFROM orders\nWHERE status = 'paid'\nGROUP BY brand\nHAVING COUNT(*) >= 35\nORDER BY revenue DESC   -- псевдоним здесь уже есть\nLIMIT 2;\n\n-- в WHERE псевдонима ещё нет\nSELECT brand, SUM(amount) AS revenue\nFROM orders\nWHERE revenue > 250000\nGROUP BY brand;\n\n-- условие на выручку бренда пишут в HAVING выражением\nSELECT brand, SUM(amount) AS revenue\nFROM orders\nWHERE status = 'paid'\nGROUP BY brand\nHAVING SUM(amount) > 250000\nORDER BY revenue DESC;",
      out: ' brand | orders | revenue \n-------+--------+---------\n Сова  |     71 |  276150\n Бриз  |     55 |  266300\n(2 rows)\n\npsql:q5.sql:15: ERROR:  column "revenue" does not exist\nLINE 3: WHERE revenue > 250000\n              ^\n brand | revenue \n-------+---------\n Сова  |  276150\n Бриз  |  266300\n(2 rows)' },
    pandas: { title: 'Тот же запрос к SQLite из pandas', badge: 'проверено: pandas 3.0.5, SQLite 3.53.1', lang: 'python',
      code: "import sqlite3\nimport pandas as pd\n\ncon = sqlite3.connect(\"data/shop/shop.sqlite\")   # та же база одним файлом\n\nquery = \"\"\"\nSELECT brand, COUNT(*) AS orders, SUM(amount) AS revenue\nFROM orders\nWHERE status = 'paid'\nGROUP BY brand\nHAVING COUNT(*) >= 35\nORDER BY revenue DESC\nLIMIT 2\n\"\"\"\ntop = pd.read_sql(query, con)        # считает база, в pandas приходят 2 строки\nprint(top)\nprint()\n\n# то же силами pandas: загрузить все строки и считать в памяти\norders = pd.read_sql(\"SELECT * FROM orders\", con)\npaid = orders[orders[\"status\"] == \"paid\"]                   # WHERE\nby_brand = paid.groupby(\"brand\").agg(orders=(\"order_id\", \"size\"),\n                                     revenue=(\"amount\", \"sum\"))  # GROUP BY и агрегаты\nby_brand = by_brand[by_brand[\"orders\"] >= 35]               # HAVING\nprint(by_brand.sort_values(\"revenue\", ascending=False).head(2))  # ORDER BY и LIMIT\nprint(\"загружено строк:\", len(orders), \"| в ответе базы:\", len(top))",
      out: '  brand  orders  revenue\n0  Сова      71   276150\n1  Бриз      55   266300\n\n       orders  revenue\nbrand                 \nСова       71   276150\nБриз       55   266300\nзагружено строк: 231 | в ответе базы: 2',
      note: 'Ответ тот же, но в первом случае считала база и прислала две строки, во втором pandas получил все 231 строку и считал сам.' },
    dialects: { title: 'Одни и те же запросы в трёх СУБД', badge: 'проверено: PostgreSQL 16.15, SQLite 3.53.1, DuckDB 2.0.0', lang: 'python',
      code: "import sqlite3\nimport duckdb      # 2.0.0\nimport psycopg     # 3.3.8\n\nengines = {\n    \"PostgreSQL\": psycopg.connect(\"host=/tmp dbname=shop user=postgres\", autocommit=True),\n    \"SQLite\": sqlite3.connect(\"data/shop/shop.sqlite\"),\n    \"DuckDB\": duckdb.connect(\"data/shop/shop.duckdb\", read_only=True),\n}\nweek = \"order_date BETWEEN '2026-02-01' AND '2026-02-07'\"\ntests = {\n    \"NULL при DESC\": f\"SELECT order_id, rating FROM orders WHERE {week} \"\n                     \"ORDER BY rating DESC, order_id LIMIT 3\",\n    \"LIKE 'PAID'\": \"SELECT COUNT(*) FROM orders WHERE status LIKE 'PAID'\",\n    \"LIKE 'лампа%'\": \"SELECT COUNT(*) FROM products WHERE product_name LIKE 'лампа%'\",\n    \"lower() и кириллица\": \"SELECT COUNT(*) FROM products WHERE lower(product_name) LIKE 'лампа%'\",\n    \"псевдоним в WHERE\": \"SELECT order_id, amount * 2 AS twice FROM orders WHERE twice > 36000\",\n    \"FETCH FIRST\": \"SELECT order_id FROM orders ORDER BY order_id FETCH FIRST 2 ROWS ONLY\",\n    \"TOP\": \"SELECT TOP 2 order_id FROM orders ORDER BY order_id\",\n    \"псевдоним в HAVING\": \"SELECT brand, SUM(amount) AS revenue FROM orders \"\n                          \"GROUP BY brand HAVING revenue > 300000 ORDER BY brand\",\n    \"status в HAVING\": \"SELECT brand, COUNT(*) FROM orders \"\n                       \"GROUP BY brand HAVING status = 'paid' ORDER BY brand\",\n}\nfor title, sql in tests.items():\n    print(title)\n    for name, con in engines.items():\n        try:\n            res = con.execute(sql).fetchall()\n        except Exception as e:\n            res = \"ошибка: \" + str(e).splitlines()[0][:58].rstrip()\n        print(f\"  {name:<11}{res}\")",
      out: "NULL при DESC\n  PostgreSQL [(1076, None), (1077, None), (1126, None)]\n  SQLite     [(1065, 5), (1069, 5), (1142, 5)]\n  DuckDB     [(1065, 5), (1069, 5), (1142, 5)]\nLIKE 'PAID'\n  PostgreSQL [(0,)]\n  SQLite     [(195,)]\n  DuckDB     [(0,)]\nLIKE 'лампа%'\n  PostgreSQL [(0,)]\n  SQLite     [(0,)]\n  DuckDB     [(0,)]\nlower() и кириллица\n  PostgreSQL [(4,)]\n  SQLite     [(0,)]\n  DuckDB     [(4,)]\nпсевдоним в WHERE\n  PostgreSQL ошибка: column \"twice\" does not exist\n  SQLite     [(1191, 36780)]\n  DuckDB     [(1191, 36780)]\nFETCH FIRST\n  PostgreSQL [(1001,), (1002,)]\n  SQLite     ошибка: near \"FETCH\": syntax error\n  DuckDB     [(1001,), (1002,)]\nTOP\n  PostgreSQL ошибка: syntax error at or near \"2\"\n  SQLite     ошибка: near \"2\": syntax error\n  DuckDB     ошибка: Parser Error: syntax error at or near \"2\"\nпсевдоним в HAVING\n  PostgreSQL ошибка: column \"revenue\" does not exist\n  SQLite     [('Бриз', 312510), ('Сова', 328440)]\n  DuckDB     [('Бриз', 312510), ('Сова', 328440)]\nstatus в HAVING\n  PostgreSQL ошибка: column \"orders.status\" must appear in the GROUP BY clause\n  SQLite     [('Бриз', 68), ('Кедр', 48), ('Луч', 34), ('Сова', 81)]\n  DuckDB     ошибка: Binder Error: column \"status\" must appear in the GROUP BY",
      note: 'Последний тест — ловушка SQLite: запрос с status в HAVING выполнился и посчитал отменённые заказы (у Бриза 68 вместо 55 оплаченных). PostgreSQL и DuckDB такой запрос не пропускают. MS SQL и BigQuery здесь не запускались, их поведение — в таблице раздела «Диалекты» по документации.' }
  };

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-3-1',
    short: 'DA-03',
    title: 'SELECT и порядок выполнения запроса',
    where: 'блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.1',
    aiData: 'учебная база shop интернет-магазина товаров для дома за январь–март 2026: таблица orders (231 заказ; brand, channel, amount, status paid или cancelled, promo_code и rating с NULL) и products (32 товара); диалект — PostgreSQL 16',
    scene,
    widgets: { steps: buildSteps },
    code,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'В запросе из интерактива ниже условие status = \'paid\' перенесли из WHERE в HAVING, рядом с COUNT(*) >= 3. Что ответит PostgreSQL?', opts: [['То же, что раньше: условие просто проверяется позже'], ['Ошибку: status не входит в GROUP BY и не стоит внутри агрегата', 1], ['Оставит только группы, где все заказы оплачены'], ['Вернёт группы вместе с отменёнными заказами']],
      why: 'HAVING видит группы, а у группы клиента может быть несколько значений status, и сравнивать нечего. PostgreSQL отвергает такой запрос ещё до выполнения. Вариант «все заказы оплачены» описывает другое условие, его пишут через агрегат. Группы с отменёнными заказами вернула бы SQLite: она такое пропускает. Проверьте в интерактиве.' },
    q2: { sec: 'idea', q: 'В сцене в таблице orders 231 строка, из них 36 отменённых. Сколько строк получает на вход GROUP BY?', opts: [['231 — группировка видит всю таблицу'], ['195 — WHERE уже убрал отменённые', 1], ['4 — по числу брендов'], ['3 — после HAVING']],
      why: 'GROUP BY — третий шаг: ему достаются строки, которые пропустил WHERE, то есть 231 − 36 = 195. Вся таблица была на входе WHERE. Четыре — это число групп на выходе GROUP BY, а три осталось после HAVING, который выполняется позже.' },
    q3: { sec: 'task', q: 'Почему SELECT brand, SUM(amount) AS revenue FROM orders WHERE revenue > 250000 GROUP BY brand падает с ошибкой column "revenue" does not exist?', opts: [['revenue — зарезервированное слово, его нельзя использовать как имя'], ['WHERE выполняется до SELECT, и имени revenue в этот момент ещё нет', 1], ['Псевдонимы работают только в одинарных кавычках'], ['Нужно написать AS после WHERE']],
      why: 'Псевдоним создаёт SELECT на пятом шаге, а WHERE — второй. Слово revenue не зарезервировано: в ORDER BY того же запроса оно работает. Одинарные кавычки задают строку, а не имя. Чинят запрос не через AS: условие на сумму группы переносят в HAVING и пишут выражением SUM(amount) > 250000.' },
    q4: { sec: 'filters', q: 'В PostgreSQL запрос SELECT order_id, rating FROM orders ORDER BY rating DESC LIMIT 3 выполнили на заказах, где у части нет оценки. Что окажется в результате?', opts: [['Три заказа с оценкой 5'], ['Три заказа без оценки: NULL при DESC идёт первым', 1], ['Ошибка: нельзя сортировать столбец с NULL'], ['Заказы с NULL будут отброшены сортировкой']],
      why: 'PostgreSQL считает NULL больше любого значения, поэтому при DESC такие строки идут первыми. Три пятёрки дали бы SQLite и DuckDB, у них NULL при DESC в конце. Сортировать столбец с пропусками можно, и строки не теряются. Нужное место задают явно: NULLS LAST.' },
    q5: { sec: 'method', q: 'SELECT COUNT(*), COUNT(rating) FROM orders вернул 231 и 104. Почему числа разные?', opts: [['COUNT(rating) считает разные значения оценки'], ['COUNT(*) считает строки, а COUNT(rating) — только строки, где rating не NULL', 1], ['COUNT(rating) считает только оплаченные заказы'], ['COUNT(*) считает и строки-дубликаты дважды']],
      why: 'Звёздочка значит «строку целиком», и NULL ей не мешает. COUNT(столбец) пропускает NULL: у 127 заказов оценки нет, 231 − 127 = 104. Разные значения считает COUNT(DISTINCT rating), статус тут ни при чём, а дубликаты COUNT(*) считает по одному разу, как любые строки.' },
    q6: { sec: 'code', q: 'В базе 231 заказ, промокод ЗИМА10 у 22, а у 190 промокода нет (NULL). Сколько строк насчитает эта строка?', code: "SELECT COUNT(*) FROM orders WHERE promo_code <> 'ЗИМА10';", lang: 'sql', opts: [['209'], ['19', 1], ['0'], ['231']],
      why: 'Для 190 строк сравнение NULL <> \'ЗИМА10\' даёт не TRUE, а UNKNOWN, и WHERE их отбрасывает. Остаются 7 пустых строк \'\' и 12 заказов с ВЕСНА15: 19. 209 получится, если дописать OR promo_code IS NULL. Ноль и 231 не учитывают ни NULL, ни сам фильтр.' },
    q7: { sec: 'nuances', q: 'Список заказов показывают по 20 на страницу запросом ORDER BY order_date LIMIT 20 OFFSET … В один день бывает несколько заказов. Что может пойти не так?', opts: [['Ничего: ORDER BY делает порядок однозначным'], ['Заказы одного дня могут меняться местами между запросами, и на соседних страницах одни повторятся, а другие пропадут', 1], ['OFFSET без ORDER BY не работает'], ['LIMIT 20 вернёт меньше строк, если в дне больше 20 заказов']],
      why: 'Порядок строк с равным ключом сортировки не определён, и при каждом запросе он может быть другим. Тогда граница страницы режет группу равных дат по-разному. Лечится уникальным последним ключом: ORDER BY order_date, order_id. OFFSET без ORDER BY синтаксически работает, просто страницы непредсказуемы, а LIMIT не зависит от того, сколько заказов в одном дне.' }
    },
    glossary: {
      sql: { t: 'SQL', en: 'Structured Query Language', d: 'Язык запросов к реляционным базам данных: описывает, какой результат нужен.' },
      dbms: { t: 'СУБД', en: 'database management system', d: 'Программа, которая хранит данные и выполняет запросы к ним: PostgreSQL, SQLite, DuckDB.' },
      clause: { t: 'Предложение запроса', en: 'clause', d: 'Часть запроса, которая начинается с ключевого слова: SELECT, FROM, WHERE, ORDER BY.' },
      logorder: { t: 'Логический порядок выполнения', en: 'logical query processing order', d: 'Порядок, в котором предложения передают друг другу таблицы: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.' },
      aggregate: { t: 'Агрегатная функция', en: 'aggregate function', d: 'Функция, которая сворачивает строки группы в одно значение: COUNT, SUM, AVG, MIN, MAX.' },
      alias: { t: 'Псевдоним', en: 'alias', d: 'Имя, которое выходной столбец получает в SELECT через AS.' },
      predicate: { t: 'Предикат', en: 'predicate', d: 'Условие, которое для строки истинно, ложно или неизвестно.' },
      like: { t: 'Шаблон LIKE', en: 'pattern matching', d: 'Сравнение строки с образцом: % — любое число символов, _ — ровно один.' },
      null: { t: 'NULL', en: 'NULL', d: 'Отметка «значения нет». Это не ноль и не пустая строка.' },
      distinct: { t: 'DISTINCT', en: 'DISTINCT', d: 'Слово после SELECT, которое убирает из результата повторяющиеся строки.' },
      pagination: { t: 'Пагинация', en: 'pagination', d: 'Выдача результата по страницам через LIMIT и OFFSET.' },
      dialect: { t: 'Диалект SQL', en: 'SQL dialect', d: 'Вариант SQL конкретной СУБД: стандарт плюс свои расширения и отличия.' },
      collation: { t: 'Правило сравнения строк', en: 'collation', d: 'Настройка, которая решает, равны ли строки с разным регистром и как они сортируются.' },
      tvl: { t: 'Троичная логика', en: 'three-valued logic', d: 'Логика с тремя значениями: TRUE, FALSE и UNKNOWN, которое даёт сравнение с NULL.' },
      planner: { t: 'Планировщик', en: 'query planner', d: 'Часть СУБД, которая выбирает, как физически выполнить запрос.' },
      plan: { t: 'План выполнения', en: 'execution plan', d: 'Последовательность операций, которой СУБД получает результат. Показывается командой EXPLAIN.' },
      index: { t: 'Индекс', en: 'index', d: 'Отдельная структура, по которой база находит строки, не читая таблицу целиком.' }
    },
    materials: [
      ['da-3-1-select-order.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/shop/', 'Учебная база shop для PostgreSQL, SQLite и DuckDB — общий набор темы 03'],
      ['queries/', 'Пять запросов из раздела «Код»: q1.sql–q5.sql'],
      ['dialects.py', 'Сравнение PostgreSQL, SQLite и DuckDB']
    ],
    prompts: [
      ['Порядок выполнения', 'Дай мне по одному запросу к учебной базе из источника. Я распишу, что получает и отдаёт каждое предложение в порядке FROM → … → LIMIT и сколько строк останется. Ты проверишь и укажешь, где я ошибся. Пять запросов, по одному за раз.'],
      ['WHERE или HAVING', 'Задавай мне задачи на отбор: «заказы дороже 5 000 ₽», «бренды, где больше 40 заказов» и подобные. Я скажу, куда ставить условие — в WHERE или в HAVING, и почему. Не давай готовый запрос, пока я не отвечу.'],
      ['Разбор моего запроса', 'Я вставлю свой SELECT. Наводящими вопросами помоги найти, где он может молча ошибиться: NULL в сравнении, регистр в LIKE, сортировка без уникального ключа, псевдоним не на своём месте. Не переписывай запрос за меня.']
    ]
  };
})();
