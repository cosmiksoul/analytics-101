/* Страница 3.3 · Агрегаты и группировка */
(() => {
  const NB = ' ';
  const sp = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB);   // 29380 → 29 380

  /* ===================== Сцена =====================
     Учебная база shop, таблица orders: 25 заказов недели 23 февраля — 1 марта 2026.
     Числа сверены с PostgreSQL 16:
       SELECT brand, COUNT(*) AS orders, SUM(amount) AS revenue, ROUND(AVG(amount)) AS avg_check
       FROM orders
       WHERE order_date BETWEEN '2026-02-23' AND '2026-03-01' AND status = 'paid'
       GROUP BY brand HAVING COUNT(*) >= 4 ORDER BY avg_check DESC;
       → Луч 4 | 24 230 | 6 058; Бриз 7 | 29 380 | 4 197; Сова 8 | 23 410 | 2 926.
       Без HAVING добавляется Кедр 3 | 25 740 | 8 580. */
  // [order_id, brand, amount, оплачен (1) или отменён (0)] в порядке order_id
  const WEEK = [[1014, 'Кедр', 1380, 0], [1048, 'Кедр', 3790, 1], [1053, 'Сова', 1120, 1], [1058, 'Бриз', 7820, 1], [1066, 'Луч', 3780, 1],
    [1080, 'Луч', 8780, 1], [1081, 'Бриз', 2830, 1], [1090, 'Сова', 5390, 1], [1091, 'Сова', 1900, 1], [1092, 'Луч', 4620, 1],
    [1108, 'Бриз', 1460, 1], [1132, 'Бриз', 3910, 1], [1133, 'Бриз', 2830, 1], [1146, 'Бриз', 2040, 1], [1150, 'Сова', 2700, 0],
    [1166, 'Сова', 1730, 1], [1167, 'Сова', 7230, 1], [1168, 'Сова', 450, 1], [1178, 'Сова', 3090, 1], [1186, 'Кедр', 4940, 0],
    [1187, 'Сова', 2500, 1], [1190, 'Кедр', 3560, 1], [1191, 'Кедр', 18390, 1], [1196, 'Луч', 7050, 1], [1200, 'Бриз', 8490, 1]];
  const BR = ['Бриз', 'Кедр', 'Луч', 'Сова'];
  const COL = { 'Бриз': '#6fa2ea', 'Кедр': '#45c48f', 'Луч': '#e3c04d', 'Сова': '#b49af5' };
  /*scene:start*/
  const AG = {};
  BR.forEach(b => { const r = WEEK.filter(o => o[1] === b && o[3]); const s = r.reduce((a, o) => a + o[2], 0); AG[b] = { n: r.length, sum: s, avg: s / r.length }; });
  const RES = BR.filter(b => AG[b].n >= 4).sort((a, b) => AG[b].avg - AG[a].avg);     // HAVING COUNT(*) >= 4 ORDER BY avg_check DESC
  const TOTAL = WEEK.reduce((a, o) => a + o[2], 0);
  const PAIDSUM = WEEK.filter(o => o[3]).reduce((a, o) => a + o[2], 0);
  const KEPT = RES.reduce((a, b) => a + AG[b].sum, 0);
  /*scene:end*/
  const SLOT = WEEK.map(o => WEEK.filter(x => x[1] === o[1] && x[3] && x[0] < o[0]).length);   // место в стопке снизу вверх
  const DROP = 'Кедр';

  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  // Две раскладки мира сцены: широкая и для узкого экрана. Мир масштабируется под размер сцены.
  const GEO = {
    d: { ww: 620, wh: 350, gc: 5, gw: 117, gh: 26, gx: 6, gy: 9, sw: 96, sg: 44, base: 316, uh: 20, ug: 3, sumH: 212, txt: 13, lh: 14, cy: 14, cw: 6.9,
      tx: 80, tw: 460, tc: [120, 100, 120, 120], ty: 34, trh: 34, dy: [198, 198], dx: [66, 314], dw: 240 },
    m: { ww: 300, wh: 420, gc: 3, gw: 96, gh: 22, gx: 6, gy: 6, sw: 62, sg: 17, base: 390, uh: 19, ug: 3, sumH: 212, txt: 12, lh: 13, cy: 92, cw: 6.3,
      tx: 0, tw: 300, tc: [78, 62, 80, 80], ty: 34, trh: 32, dy: [180, 250], dx: [0, 0], dw: 300 }
  };

  const scene = {
    parts: [{ n: '01', name: 'Строки', s: [0, 1] }, { n: '02', name: 'Стопки', s: [2, 3] }, { n: '03', name: 'Агрегаты', s: [4, 5] }, { n: '04', name: 'HAVING', s: [6, 7] }, { n: '05', name: 'Результат', s: [8, 9] }],
    steps: [
      { title: '25 заказов за неделю', dur: 3200, body: '<p>Учебная база shop, неделя с&nbsp;23&nbsp;февраля по&nbsp;1&nbsp;марта 2026: 25&nbsp;строк таблицы <b>orders</b>. У&nbsp;каждой — номер, бренд, сумма <b>amount</b> и&nbsp;статус.</p><p>Нужны число заказов, выручка и&nbsp;средний чек по&nbsp;брендам.</p>' },
      { title: 'WHERE отсекает строки', dur: 3200, body: '<p>Сначала <b>WHERE status = \'paid\'</b>. Три отменённых заказа выпадают ещё до&nbsp;группировки: WHERE смотрит на&nbsp;каждую строку по&nbsp;отдельности.</p><p>Осталось 22&nbsp;строки на&nbsp;102&nbsp;760&nbsp;₽.</p>' },
      { title: 'GROUP BY brand: стопки', dur: 3600, body: '<p><b>GROUP BY brand</b> раскладывает строки по&nbsp;стопкам: одна стопка — одно значение brand. Строки не&nbsp;теряются, их&nbsp;по-прежнему 22, но&nbsp;групп теперь четыре.</p>' },
      { title: 'COUNT(*) — высота стопки', dur: 3000, body: '<p>Пока каждая строка — одна клетка, высота стопки и&nbsp;есть <b>COUNT(*)</b>. Больше всего заказов у&nbsp;Совы — 8, меньше всего у&nbsp;Кедра — 3.</p>' },
      { title: 'SUM(amount) — стопка из денег', dur: 3600, body: '<p>Теперь высота строки — её&nbsp;сумма, а&nbsp;высота стопки — <b>SUM(amount)</b>. Стопки почти сравнялись: от&nbsp;23&nbsp;410&nbsp;₽ у&nbsp;Совы до&nbsp;29&nbsp;380&nbsp;₽ у&nbsp;Бриза.</p><p>Один заказ Кедра на&nbsp;18&nbsp;390&nbsp;₽ — больше двух третей его стопки.</p>' },
      { title: 'AVG = SUM / COUNT', dur: 3600, body: '<p>Средний чек — та&nbsp;же стопка, разрезанная на&nbsp;равные части. Высота не&nbsp;изменилась, а&nbsp;все строки группы стали одинаковыми: это <b>AVG(amount)</b>.</p><p>У&nbsp;Кедра 8&nbsp;580&nbsp;₽, у&nbsp;Совы 2&nbsp;926&nbsp;₽.</p>' },
      { title: 'HAVING COUNT(*) >= 4', dur: 3600, body: '<p>Вернёмся к&nbsp;клеткам: одна строка — одна клетка. <b>HAVING</b> проверяет условие для группы целиком, когда агрегаты уже посчитаны.</p><p>Порог — четыре заказа: средний чек по&nbsp;трём заказам слишком зависит от&nbsp;одного крупного.</p>' },
      { title: 'Кедр убран целиком', dur: 3400, body: '<p>Кедр не&nbsp;дотянул до&nbsp;порога, и&nbsp;HAVING убрал всю стопку — три строки разом. Групп осталось три.</p><p>Лидер по&nbsp;среднему чеку теперь Луч, а&nbsp;не&nbsp;Кедр.</p>' },
      { title: 'Стопка становится строкой', dur: 3400, body: '<p>SELECT отдаёт по&nbsp;строке на&nbsp;группу: бренд и&nbsp;три агрегата. <b>ORDER BY avg_check DESC</b> ставит наверх Луч.</p>' },
      { title: 'WHERE до, HAVING после', dur: 4000, next: 'Читать страницу', body: '<p>WHERE отбросил три строки до&nbsp;группировки, HAVING — одну группу после неё. Агрегат в&nbsp;WHERE не&nbsp;написать: когда WHERE работает, стопок ещё нет.</p>' }
    ],
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'grp', label: 'Групп' }, { id: 'sum', label: 'Σ amount' }],
    legend: '<span><i style="background:#6fa2ea"></i>Бриз</span><span><i style="background:#45c48f"></i>Кедр</span><span><i style="background:#e3c04d"></i>Луч</span><span><i style="background:#b49af5"></i>Сова</span><span><i style="background:#f2756a"></i>отброшено</span>',
    info: 'GROUP BY · HAVING',
    aiNote: 'В анимации учебная база shop: 25 строк orders за неделю 23 февраля — 1 марта 2026 (бренды Бриз, Кедр, Луч, Сова). WHERE status = \'paid\' убирает 3 отменённых заказа: остаётся 22 строки на 102 760 ₽. GROUP BY brand раскладывает их на 4 стопки: Бриз 7 заказов, 29 380 ₽, средний чек 4 197 ₽; Кедр 3, 25 740 ₽, 8 580 ₽ (из них один заказ на 18 390 ₽); Луч 4, 24 230 ₽, 6 058 ₽; Сова 8, 23 410 ₽, 2 926 ₽. Высота стопки показывает сначала COUNT(*), потом SUM(amount), потом AVG(amount) как ту же стопку из равных частей. HAVING COUNT(*) >= 4 убирает группу Кедр целиком, остаются 3 строки результата, ORDER BY avg_check DESC ставит первым Луч.',
    mount(root, api) {
      root.innerHTML = '<div class="ag"><div class="ag-w"></div></div>';
      const host = root.firstChild, w = host.firstChild;
      w._c = {};
      const mk = (cls, html, cc) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; if (cc) d.style.setProperty('--cc', cc); w.appendChild(d); d._c = {}; return d; };
      // элементы мира
      const chips = WEEK.map(o => mk('ag-chip' + (o[3] ? '' : ' cx0'), `<i>${o[0]}</i><b>${o[1]}</b><span>${sp(o[2])}</span><em>${o[3] ? sp(AG[o[1]].avg) : ''}</em>`, COL[o[1]]));
      const blab = BR.map(b => mk('ag-bl', b, COL[b]));
      const alab = BR.map(b => mk('ag-al', `<span class="ln ln-n">COUNT <b>${AG[b].n}</b></span><span class="ln ln-s">SUM <b>${sp(AG[b].sum)}</b></span><span class="ln ln-a">AVG <b>${sp(AG[b].avg)}</b></span>`, COL[b]));
      const line = mk('ag-line', '<span>≥ 4</span>');
      const thead = mk('ag-tr ag-th', '<span>brand</span><span>orders</span><span>revenue</span><span>avg_check</span>');
      const trows = RES.map(b => mk('ag-tr', `<span style="color:${COL[b]}">${b}</span><span>${AG[b].n}</span><span>${sp(AG[b].sum)}</span><span>${sp(AG[b].avg)}</span>`));
      const cancelled = WEEK.filter(o => !o[3]).map(o => o[0]).join(', ');
      const drops = [mk('ag-drop', `<b>WHERE</b> · до группировки<span>строки ${cancelled} — cancelled</span>`), mk('ag-drop', `<b>HAVING</b> · после агрегатов<span>группа ${DROP} — COUNT(*) = ${AG[DROP].n} &lt; 4</span>`)];
      const call = mk('ag-call', ''), pin = mk('ag-pin', '');

      let G = GEO.d, sig = '', dirty = true;
      const fit = () => {
        const W = host.clientWidth, H = host.clientHeight; if (!W || !H) return;
        const g = W < 470 ? GEO.m : GEO.d;
        if (g !== G) { G = g; dirty = true; }
        const sc = Math.min(W / G.ww, H / G.wh, 1.15);
        w.style.width = G.ww + 'px'; w.style.height = G.wh + 'px';
        w.style.transform = `translate(${((W - G.ww * sc) / 2).toFixed(1)}px, ${((H - G.wh * sc) / 2).toFixed(1)}px) scale(${sc.toFixed(4)})`;
        dirty = true;
      };
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(host);
      fit();

      // запись стиля только при изменении
      const set = (el, x, y, o, wd, ht) => {
        const c = el._c, t = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
        if (c.t !== t) { el.style.transform = t; c.t = t; }
        const op = o <= 0.001 ? '0' : o >= 0.999 ? '1' : o.toFixed(3);
        if (c.o !== op) { el.style.opacity = op; el.style.visibility = op === '0' ? 'hidden' : 'visible'; c.o = op; }
        if (wd != null && c.w !== wd) { el.style.width = wd + 'px'; c.w = wd; }
        if (ht != null && c.h !== ht) { el.style.height = ht + 'px'; c.h = ht; }
      };
      const cls = (el, name, on) => { const c = el._c; if (c[name] !== on) { el.classList.toggle(name, on); c[name] = on; } };

      // геометрия
      const gridXY = i => { const rows = Math.ceil(WEEK.length / G.gc), tw = G.gc * G.gw + (G.gc - 1) * G.gx, th = rows * G.gh + (rows - 1) * G.gy;
        return [(G.ww - tw) / 2 + (i % G.gc) * (G.gw + G.gx), (G.wh - th) / 2 + Math.floor(i / G.gc) * (G.gh + G.gy)]; };
      const gridTop = () => gridXY(0)[1];
      const sx0 = () => (G.ww - (4 * G.sw + 3 * G.sg)) / 2;
      const stackX = bi => sx0() + bi * (G.sw + G.sg);
      const ks = () => (G.sumH - 7) / AG['Бриз'].sum;               // самая высокая стопка в рублях — Бриз
      const hOf = (o, m) => m === 'u' ? G.uh : m === 's' ? o[2] * ks() : AG[o[1]].avg * ks();
      const gOf = m => m === 'u' ? G.ug : 1;
      // режим высоты строк: u — клетка, s — сумма, a — среднее
      const modeAt = (k, p) => k === 4 ? ['u', 's', ease(seg(p, .1, .6))] : k === 5 ? ['s', 'a', ease(seg(p, .1, .6))] : k === 6 ? ['a', 'u', ease(seg(p, 0, .4))] : ['u', 'u', 0];
      // верх каждой строки стопки и верх стопки при смешанном режиме
      function stackLayout(k, p) {
        const [m0, m1, t] = modeAt(k, p), pos = {}, top = {};
        BR.forEach(b => {
          let y = G.base;
          WEEK.forEach((o, i) => {
            if (o[1] !== b || !o[3]) return;
            const h = lerp(hOf(o, m0), hOf(o, m1), t), g = lerp(gOf(m0), gOf(m1), t);
            if (SLOT[i] > 0) y -= g;
            y -= h; pos[i] = [y, h];
          });
          top[b] = y;
        });
        return { pos, top, m: t > .5 ? m1 : m0 };
      }
      const lineY = () => G.base - 4 * G.uh - 3 * G.ug - G.ug / 2;
      const tableRowY = r => G.ty + (r + 1) * G.trh;

      function callAt(k, L) {
        const ci = BR.indexOf(DROP), cx = stackX(ci) + G.sw / 2, ltop = L.top[DROP] - 3 * G.lh - 6;
        switch (k) {
          case 0: return { x: G.ww / 2, y: gridTop() - 36, t: '25 строк orders: бренд, сумма, статус' };
          case 1: return { x: G.ww / 2, y: gridTop() - 36, t: 'WHERE status = \'paid\': −3 строки' };
          case 2: return { x: G.ww / 2, y: G.cy, t: '22 строки → 4 группы' };
          case 3: return { x: cx, y: G.cy, t: 'у Кедра всего 3 строки', ty: ltop };
          case 4: return { x: cx, y: G.cy, t: 'один заказ — 18 390 ₽', ty: ltop };
          case 5: return { x: cx, y: G.cy, t: 'чек 8 580 ₽ держится на одном заказе', ty: ltop };
          case 6: return { x: cx, y: G.cy, t: 'HAVING COUNT(*) >= 4: Кедр ниже', ty: ltop };
          case 7: return { x: cx, y: G.cy, t: '3 < 4 — группа уходит целиком', ty: ltop };
          case 8: return { x: G.ww / 2, y: tableRowY(RES.length) + 10, t: 'одна группа — одна строка результата' };
          default: return null;
        }
      }

      return {
        render(k, p) {
          // счётчики
          const late1 = k === 1 && p >= .5, cut = k > 7 || (k === 7 && p >= .5);
          api.hud('rows', k === 0 || (k === 1 && !late1) ? '25' : cut ? (k === 8 && p >= .6) || k === 9 ? '3' : '19' : '22', '');
          api.hud('grp', k < 2 || (k === 2 && p < .6) ? '—' : cut ? '3' : '4');
          api.hud('sum', sp(k === 0 || (k === 1 && !late1) ? TOTAL : cut ? KEPT : PAIDSUM), '₽');

          const key = [k, Math.round(p * 300), G === GEO.m].join('|');
          if (key === sig && !dirty) return; sig = key; dirty = false;
          const mob = G === GEO.m;
          cls(w, 'ag-mob', mob);
          const L = stackLayout(k, p);

          // строки заказов
          WEEK.forEach((o, i) => {
            const el = chips[i], bi = BR.indexOf(o[1]);
            const [gx, gy] = gridXY(i);
            let x = gx, y = gy, op = 1, wd = G.gw, ht = G.gh, st = false, av = false, out = false, below = false;
            if (k === 0) op = seg(p, i * .02, i * .02 + .25);
            else if (k === 1) { if (!o[3]) op = 1 - .7 * seg(p, .2, .55); }
            else if (!o[3]) { op = k === 2 ? .3 * (1 - seg(p, 0, .2)) : 0; }
            else if (k === 2) {
              const [sy, sh] = L.pos[i], t = ease(seg(p, .06 + i * .016, .5 + i * .016));
              x = lerp(gx, stackX(bi), t); y = lerp(gy, sy, t); wd = Math.round(lerp(G.gw, G.sw, t)); ht = Math.round(lerp(G.gh, sh, t)); st = t > .5;
            } else if (k <= 7) {
              const [sy, sh] = L.pos[i]; x = stackX(bi); y = sy; wd = G.sw; ht = Math.max(1, Math.round(sh * 10) / 10); st = true; av = L.m === 'a';
              if (o[1] === DROP) {
                below = (k === 6 && p > .75) || k === 7;
                if (k === 7) { const e = ease(seg(p, .25, .7)); out = p > .15; y += 26 * e; op = 1 - e; }
              }
            } else if (k === 8 && o[1] !== DROP) {
              const r = RES.indexOf(o[1]), [sy, sh] = L.pos[i], t = ease(seg(p, .05 + r * .08, .45 + r * .08));
              x = lerp(stackX(bi), G.tx + 6, t); y = lerp(sy, tableRowY(r) + 4, t); wd = Math.round(lerp(G.sw, G.tc[0] - 12, t)); ht = Math.round(lerp(sh, G.trh - 12, t));
              st = true; op = 1 - seg(p, .35 + r * .08, .6 + r * .08);
            } else op = 0;
            set(el, x, y, op, wd, ht);
            cls(el, 'st', st); cls(el, 'av', av); cls(el, 'cx', !o[3] && k >= 1); cls(el, 'ag-x', out); cls(el, 'below', below);
            cls(el, 'tiny', st && ht < G.txt);
          });

          // подписи брендов и агрегатов над стопками
          BR.forEach((b, bi) => {
            const drop = b === DROP, fade7 = drop && k === 7 ? 1 - ease(seg(p, .25, .7)) : 1;
            const bo = k < 2 ? 0 : k === 2 ? seg(p, .3, .6) : k <= 7 ? fade7 : k === 8 ? 1 - seg(p, 0, .3) : 0;
            set(blab[bi], stackX(bi), G.base + 5, bo, G.sw, 16);
            cls(blab[bi], 'ag-x', drop && k === 7 && p > .15);
            const ao = k < 3 ? 0 : k === 3 ? seg(p, .15, .45) : k <= 7 ? fade7 : k === 8 ? 1 - seg(p, 0, .3) : 0;
            set(alab[bi], stackX(bi) + G.sw / 2, L.top[b] - 4, ao);
            const el = alab[bi];
            cls(el, 'on-s', k === 4 || k === 5); cls(el, 'on-a', k === 5);      // на шагах HAVING над стопкой только COUNT
            cls(el, 'cur-n', k === 3 || k === 6 || k === 7); cls(el, 'cur-s', k === 4); cls(el, 'cur-a', k === 5);
            cls(el, 'ag-x', drop && (k === 7 || (k === 6 && p > .75)));
          });

          // порог HAVING
          const lw = 4 * G.sw + 3 * G.sg + 16;
          const lo = k === 6 ? seg(p, .4, .7) : k === 7 ? 1 : k === 8 ? 1 - seg(p, 0, .3) : 0;
          set(line, sx0() - 8, lineY(), lo, Math.round(lw * (k === 6 ? ease(seg(p, .4, .75)) : 1)), 2);
          cls(line, 'tag', !mob);

          // результат
          const tx = G.tx, to = k === 8 ? seg(p, .3, .6) : k === 9 ? 1 : 0;
          set(thead, tx, G.ty, to, G.tw, G.trh - 6);
          trows.forEach((el, r) => set(el, tx, tableRowY(r), k === 8 ? seg(p, .4 + r * .1, .7 + r * .1) : k === 9 ? 1 : 0, G.tw, G.trh - 6));
          [thead, ...trows].forEach(el => { if (el._c.gc !== G) { el.style.gridTemplateColumns = G.tc.map(c => c + 'px').join(' '); el._c.gc = G; } });
          drops.forEach((el, n) => set(el, G.dx[n], G.dy[n], k === 9 ? seg(p, .1 + n * .25, .4 + n * .25) : 0, G.dw));

          // выноска
          const c = p > .4 ? callAt(k, L) : null;
          if (!c) { set(call, call._c.x || 0, call._c.y || 0, 0); set(pin, 0, 0, 0); return; }
          if (call._c.txt !== c.t) { call.textContent = c.t; call._c.txt = c.t; }
          const half = c.t.length * G.cw / 2 + 10, cxp = Math.max(half + 2, Math.min(G.ww - half - 2, c.x));
          call._c.x = cxp; call._c.y = c.y;
          const co = seg(p, .4, .55);
          set(call, cxp, c.y, co);
          if (c.ty != null && c.ty > c.y + 30) set(pin, c.x, c.y + 26, co * .9, 1, Math.round(c.ty - c.y - 28));
          else set(pin, 0, 0, 0);
        }
      };
    }
  };

  /* ===================== Интерактив «Среднее от средних» =====================
     Оплаченные заказы клиентов с известной страной из учебной базы shop, в каждой стране две группы:
     0 — без промокода (promo_code NULL или пустая строка), 1 — с промокодом. Выборка взята запросом
       SELECT c.country_code, CASE WHEN NULLIF(o.promo_code, '') IS NULL THEN 0 ELSE 1 END AS promo,
              string_agg(o.amount::text, ',' ORDER BY o.order_id)
       FROM orders o JOIN customers c USING (customer_id)
       WHERE o.status = 'paid' AND c.country_code IS NOT NULL GROUP BY 1, 2 ORDER BY 1, 2;
     Все 12 состояний (4 страны × 3 способа) сверены с PostgreSQL 16:
       BY 4 587,47 | 4 560,83 | 4 587,47;  KZ 5 795,45 | 6 385,42 | 5 795,45;
       RU 4 525,34 | 4 262,39 | 4 525,34;  UZ 4 326,55 | 4 156,92 | 4 326,55. */
  const AM = {"BY":[[3790,2940,2530,5750,6380,4780,1960,2210,7360,5310,6190,2920,5580,5190,8100,7920,15450,3790,3340,6870,4250,2830,6950,14050,1120,7480,3990,7430,1050,3840,2550,11320,4870,2830,9140,2730,2920,4230,3090,2500,2560,1730,3800,3560,18390,1720,3510,1960,3260,3910,3690,450,730,2940,2940,4020,4260,1900,2500,1900,1600,7600,3340],[450,3800,9540,400,8460,1630,3790,1630,7920,800,10210,5630]],"KZ":[[2630,5850,4940,2400,800,3780,4460,16660,2310,2310,12030,6310,7170,3010,8490,4730,4650,5720],[6770,3810,12550,6120]],"RU":[[6180,2040,5400,5720,11730,2040,5110,10020,840,2490,5140,8650,7820,3800,1730,2500,1120,5390,4620,4400,1050,7020,9890,8100,2550,1460,5690,2230,3910,12400,6740,3910,2100,3910,2830,9280,6010,4340,4390,4250,1920,1730,7230,2120,4020,2240,4470,3460,1550],[3910,2190,1920,1900,500,8900,450,10020,5140]],"UZ":[[1120,730,2490,730,3320,8490,4810,2830,2040,5690,11730,2240,2860,10580,4390,6830,4930,2500,1730,7050,4390,9600,1120,3780],[2500,8780,2830,2040,3340]]};
  const CN = { BY: ['Беларусь', 'по Беларуси'], KZ: ['Казахстан', 'по Казахстану'], RU: ['Россия', 'по России'], UZ: ['Узбекистан', 'по Узбекистану'] };
  const GN = ['без промокода', 'с промокодом'];
  const MN = { rows: 'По всем заказам', aoa: 'Среднее от средних', wavg: 'Взвешенное' };
  /*avg:start*/
  function avgCalc(cc, m) {
    const g = AM[cc].map(a => { const s = a.reduce((x, y) => x + y, 0); return { n: a.length, s, a: s / a.length }; });
    const N = g[0].n + g[1].n;
    const rows = (g[0].s + g[1].s) / N;                           // SUM(amount) / COUNT(*) по всем заказам страны
    const aoa = (g[0].a + g[1].a) / 2;                            // среднее двух средних
    const wavg = (g[0].a * g[0].n + g[1].a * g[1].n) / N;         // средние, взвешенные числом заказов
    return { g, N, rows, aoa, wavg, res: m === 'rows' ? rows : m === 'aoa' ? aoa : wavg, gap: aoa - rows };
  }
  /*avg:end*/

  function buildAvg(box, api) {
    const { $, fmt, plural, esc } = api;
    const f2 = v => fmt(v, 2);
    box.innerHTML = `<div class="block-hd"><span class="t">Среднее от средних не замечает размер групп <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="am-reset">Сбросить</button></div></div>
<p class="hint am-do">Выберите страну и переключайте способ расчёта. Точки — оплаченные заказы, внизу — весы: средний чек там, где они уравновешены.</p>
<div class="am-ctl"><span class="am-grp"><span class="am-lb">страна</span><span class="seg" role="group" aria-label="Страна">${Object.keys(CN).map(c => `<button type="button" data-c="${c}" title="${CN[c][0]}">${c}</button>`).join('')}</span></span><span class="am-grp"><span class="am-lb">способ</span><span class="seg am-seg" role="group" aria-label="Способ расчёта">${Object.keys(MN).map(m => `<button type="button" data-m="${m}">${MN[m]}</button>`).join('')}</span></span></div>
<div class="stage"><div class="am-left"><div class="am-plot" id="am-plot"></div><div class="am-leg"><span><i class="g0"></i>без промокода</span><span><i class="g1"></i>с промокодом</span><span><i class="r"></i>средний чек по стране</span><span><i class="o"></i>другой способ</span></div></div>
<div class="narr"><p class="cap" id="am-cap"></p><div class="readout am-ro"><div><span class="big" id="am-v"></span><span class="lbl" id="am-vl"></span></div><div><span class="big" id="am-d"></span><span class="lbl">разница с расчётом по всем заказам</span></div></div><pre class="am-f" id="am-f"></pre><div class="narr-text" id="am-msg"></div><p class="cap">Задания</p><ol class="steps am-tasks" id="am-tasks"></ol></div></div>
<div class="status"><span><span class="dot live"></span><span id="am-s1"></span></span><span class="grow"></span><span id="am-s2"></span></div>`;
    const TASKS = [
      { t: 'Найдите страну, где среднее от средних ошибается сильнее всего.', ok: s => s.c === 'KZ' && s.m === 'aoa' },
      { t: 'Найдите страну, где группы различаются по размеру в пять раз, а способы почти совпадают. Почему так?', ok: s => s.c === 'BY' && s.m === 'aoa' },
      { t: 'Получите верный средний чек только из средних групп и числа заказов, не трогая отдельные заказы.', ok: s => s.m === 'wavg' }
    ];
    let s;
    const fresh = () => ({ c: 'RU', m: 'rows', done: [false, false, false] });
    const signed = v => `${v > 0.005 ? '+' : v < -0.005 ? '−' : ''}${f2(Math.abs(v))}`;

    function plot(R) {
      const host = $('am-plot'), W = Math.max(280, Math.round(host.clientWidth || 640)), nar = W < 520;
      const L = nar ? 10 : 18, Rr = nar ? 12 : 22, XM = 20000, X = v => L + (W - L - Rr) * v / XM;
      const B = [[30, nar ? 66 : 78]]; B.push([B[0][0] + B[0][1] + 34, 40]);
      const axY = B[1][0] + B[1][1] + 12, beamY = axY + (nar ? 72 : 74), H = beamY + 44;
      const other = s.m === 'aoa' ? R.rows : R.aoa, showOther = Math.abs(X(other) - X(R.res)) > 1.5;
      let g = '';
      // оси
      for (let v = 0; v <= XM; v += 5000) g += `<line class="am-grid" x1="${X(v)}" x2="${X(v)}" y1="${B[0][0] - 6}" y2="${axY}"/><text class="am-ax" x="${X(v)}" y="${axY + 14}" text-anchor="${v === 0 ? 'start' : v === XM ? 'end' : 'middle'}">${!v ? '0' : nar ? v / 1000 : sp(v) + (v === XM ? ' ₽' : '')}</text>`;
      if (nar) g += `<text class="am-ax" x="${W - Rr}" y="${axY + 28}" text-anchor="end">тыс. ₽</text>`;
      g += `<line class="am-axl" x1="${L}" x2="${W - Rr}" y1="${axY}" y2="${axY}"/>`;
      // заказы двух групп и их средние
      R.g.forEach((gr, gi) => {
        const [y0, h] = B[gi];
        g += `<text class="am-gl" x="${L}" y="${y0 - 9}">${GN[gi]} · ${gr.n} ${plural(gr.n, ['заказ', 'заказа', 'заказов'])}</text>`;
        AM[s.c][gi].forEach((v, i) => { const fr = ((i + 1) * 0.6180339887 + gi * 0.37) % 1; g += `<circle class="am-dot g${gi}${s.m === 'rows' ? ' on' : ''}" cx="${X(v).toFixed(1)}" cy="${(y0 + 6 + fr * (h - 12)).toFixed(1)}" r="${nar ? 3 : 3.6}"/>`; });
        const mx = X(gr.a), right = mx > W - 110;
        g += `<line class="am-mean g${gi}" x1="${mx}" x2="${mx}" y1="${y0 - 3}" y2="${y0 + h + 3}"/><text class="am-ml g${gi}" x="${mx + (right ? -5 : 5)}" y="${y0 + h - 3}" text-anchor="${right ? 'end' : 'start'}">${gi ? 'AVG₂' : 'AVG₁'} ${sp(gr.a)}</text>`;
      });
      // линии ответа и другого способа
      if (showOther) g += `<line class="am-oth" x1="${X(other)}" x2="${X(other)}" y1="${B[0][0] - 4}" y2="${beamY}"/>`;
      g += `<line class="am-res" x1="${X(R.res)}" x2="${X(R.res)}" y1="${B[0][0] - 4}" y2="${beamY}"/>`;
      // весы: балка, грузы, опора
      g += `<line class="am-beam" x1="${L}" x2="${W - Rr}" y1="${beamY}" y2="${beamY}"/>`;
      if (s.m === 'rows') {
        const bin = 6, cnt = {};
        R.g.forEach((gr, gi) => AM[s.c][gi].forEach(v => { const b = Math.round(X(v) / bin), n = cnt[b] = (cnt[b] || 0) + 1; g += `<rect class="am-u g${gi}" x="${(b * bin - 2.5).toFixed(1)}" y="${(beamY - 4 * n - 1).toFixed(1)}" width="5" height="3" rx="1"/>`; }));
      } else {
        const wts = R.g.map((gr, gi) => ({ gi, wt: s.m === 'aoa' ? 1 : gr.n, x: X(gr.a), r: s.m === 'aoa' ? (nar ? 10 : 13) : (nar ? 4 : 5) + (nar ? 1.8 : 2.1) * Math.sqrt(gr.n) }));
        wts.forEach(o => { o.y = beamY - o.r - 1; });
        if (Math.abs(wts[0].x - wts[1].x) < .6 * Math.max(wts[0].r, wts[1].r)) {     // грузы почти на одном месте: меньший стоит на большем
          const [lo, hi] = wts[0].r >= wts[1].r ? [wts[0], wts[1]] : [wts[1], wts[0]];
          hi.y = lo.y - lo.r - hi.r - 1; hi.x = lo.x;
        }
        wts.forEach(o => { g += `<circle class="am-wt g${o.gi}" cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="${o.r.toFixed(1)}"/><text class="am-wl" x="${o.x.toFixed(1)}" y="${(o.y + 4).toFixed(1)}" text-anchor="middle">×${o.wt}</text>`; });
      }
      const fx = X(R.res);
      if (showOther) g += `<polygon class="am-ful o" points="${X(other)},${beamY + 1} ${X(other) - 8},${beamY + 14} ${X(other) + 8},${beamY + 14}"/>`;
      g += `<polygon class="am-ful" points="${fx},${beamY + 1} ${fx - 9},${beamY + 15} ${fx + 9},${beamY + 15}"/>`;
      const lx = Math.max(L + 30, Math.min(W - Rr - 30, fx));
      g += `<text class="am-rl" x="${lx}" y="${beamY + 32}" text-anchor="middle">${sp(R.res)} ₽</text>`;
      if (showOther && Math.abs(X(other) - fx) > 70) g += `<text class="am-ol" x="${Math.max(L + 24, Math.min(W - Rr - 24, X(other)))}" y="${beamY + 32}" text-anchor="middle">${sp(other)}</text>`;
      host.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Заказы ${esc(CN[s.c][1])}: ${R.g[0].n} без промокода, средний чек ${sp(R.g[0].a)} ₽, и ${R.g[1].n} с промокодом, ${sp(R.g[1].a)} ₽. Способ «${MN[s.m]}» даёт ${sp(R.res)} ₽">${g}</svg>`;
    }

    function message(R) {
      const [a, b] = R.g, big = a.n >= b.n ? 0 : 1;
      if (s.m === 'rows') return `Каждый из ${R.N} заказов весит одинаково, поэтому равновесие ближе к группе, где заказов больше: <b>${f2(R.rows)} ₽</b> ближе к ${sp(R.g[big].a)} ₽, чем к ${sp(R.g[1 - big].a)} ₽.`;
      if (s.m === 'aoa') return `Обе группы весят одинаково, хотя в одной ${a.n} ${plural(a.n, ['заказ', 'заказа', 'заказов'])}, а в другой ${b.n}. Равновесие ушло на середину между средними. Разница с расчётом по всем заказам = (½ − ${a.n}/${R.N}) × (${f2(a.a)} − ${f2(b.a)}) = <b>${signed(R.gap)} ₽</b>.${Math.abs(R.gap) < 50 ? ' Средние групп почти равны, поэтому и ошибка мала, как бы ни различались размеры.' : ''}`;
      return `Каждое среднее умножено на число заказов своей группы: это та же выручка, делённая на те же ${R.N} заказов. Ответ совпал с расчётом по всем заказам: <b>${f2(R.wavg)} ₽</b>. Так собирают общий средний чек, когда на руках только таблица средних.`;
    }

    function draw() {
      const R = avgCalc(s.c, s.m), [a, b] = R.g;
      TASKS.forEach((t, n) => { if (t.ok(s)) s.done[n] = true; });
      plot(R);
      $('am-cap').textContent = `Средний чек ${CN[s.c][1]}`;
      $('am-v').textContent = `${sp(R.res)} ₽`;
      $('am-vl').textContent = s.m === 'rows' ? `по всем ${R.N} заказам` : s.m === 'aoa' ? 'среднее двух средних' : 'средние с весами по числу заказов';
      const d = R.res - R.rows;
      $('am-d').textContent = Math.abs(d) < 0.005 ? '0 ₽' : `${d > 0 ? '+' : '−'}${sp(Math.abs(d))} ₽`;
      $('am-d').className = 'big' + (Math.abs(d) >= 0.005 ? ' am-bad' : ' am-ok');
      $('am-f').textContent = s.m === 'rows' ? `SUM(amount) / COUNT(*)\n= ${sp(a.s + b.s)} / ${R.N}\n= ${f2(R.rows)} ₽`
        : s.m === 'aoa' ? `(AVG₁ + AVG₂) / 2\n= (${f2(a.a)} + ${f2(b.a)}) / 2\n= ${f2(R.aoa)} ₽`
          : `(AVG₁·n₁ + AVG₂·n₂)\n  / (n₁ + n₂)\n= (${f2(a.a)}·${a.n}\n   + ${f2(b.a)}·${b.n}) / ${R.N}\n= ${f2(R.wavg)} ₽`;
      $('am-msg').innerHTML = message(R);
      $('am-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t.t)}</li>`).join('');
      $('am-s1').textContent = `${s.c} · ${R.N} ${plural(R.N, ['оплаченный заказ', 'оплаченных заказа', 'оплаченных заказов'])}: ${a.n} ${GN[0]}, ${b.n} ${GN[1]}`;
      $('am-s2').textContent = `способы расходятся на ${sp(Math.abs(R.gap))} ₽ (${fmt(Math.abs(R.gap) / R.rows * 100, 1)}%)`;
      box.querySelectorAll('[data-c]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.c === s.c)));
      box.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.m === s.m)));
      s.R = R;
    }
    box.addEventListener('click', e => {
      const c = e.target.closest('[data-c]'), m = e.target.closest('[data-m]');
      if (c) { s.c = c.dataset.c; draw(); } else if (m) { s.m = m.dataset.m; draw(); }
    });
    $('am-reset').addEventListener('click', () => { s = fresh(); draw(); });
    s = fresh(); draw();
    if ('ResizeObserver' in window) { let lw = 0; new ResizeObserver(() => { const cw = $('am-plot').clientWidth; if (cw && cw !== lw) { lw = cw; plot(s.R); } }).observe($('am-plot')); }
    return {
      describe() {
        const R = s.R, [a, b] = R.g;
        return `страна ${s.c}, способ «${MN[s.m]}»: средний чек ${f2(R.res)} ₽; по всем заказам ${f2(R.rows)} ₽, среднее от средних ${f2(R.aoa)} ₽; группы: ${a.n} заказов без промокода по ${f2(a.a)} ₽ и ${b.n} с промокодом по ${f2(b.a)} ₽; заданий выполнено ${s.done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-3-3',
    short: 'DA-03',
    title: 'Агрегаты и группировка',
    where: 'блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.3',
    aiData: 'учебная база shop интернет-магазина товаров для дома за январь–март 2026 (PostgreSQL 16): таблица orders, 231 заказ, 195 оплаченных, каналы органика, реклама и рассылка, бренды Бриз, Кедр, Луч и Сова, оценка rating с NULL, промокоды; клиенты из BY, RU, KZ, UZ',
    scene,
    widgets: { avg: buildAvg },
    code: /*code:start*/{
      channels: {"title": "Метрики по каналам одним GROUP BY, а группы из двух столбцов — с HAVING", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- метрики оплаченных заказов по каналу заказа\nSELECT channel,\n       COUNT(*)                    AS orders,\n       COUNT(DISTINCT customer_id) AS buyers,\n       SUM(amount)                 AS revenue,\n       ROUND(AVG(amount), 2)       AS avg_check,\n       MIN(amount)                 AS min_check,\n       MAX(amount)                 AS max_check\nFROM orders\nWHERE status = 'paid'\nGROUP BY channel\nORDER BY revenue DESC;\n\n-- два столбца в GROUP BY: группа — пара «канал, бренд», всего их 12\nSELECT channel, brand, COUNT(*) AS orders, SUM(amount) AS revenue\nFROM orders\nWHERE status = 'paid'\nGROUP BY channel, brand\nHAVING COUNT(*) >= 20          -- оставить пары, где не меньше 20 заказов\nORDER BY channel, revenue DESC;", "out": " channel  | orders | buyers | revenue | avg_check | min_check | max_check \n----------+--------+--------+---------+-----------+-----------+-----------\n органика |     79 |     33 |  405540 |   5133.42 |       450 |     18390\n реклама  |     81 |     34 |  344220 |   4249.63 |       400 |     14050\n рассылка |     35 |     18 |  162320 |   4637.71 |       450 |     11730\n(3 rows)\n\n channel  | brand | orders | revenue \n----------+-------+--------+---------\n органика | Бриз  |     25 |  133820\n органика | Сова  |     26 |   88490\n реклама  | Сова  |     35 |  139660\n(3 rows)", "note": "Органика приносит больше всего денег при почти том же числе заказов, что и реклама: средний чек выше на 884 ₽. Покупателей меньше, чем заказов, потому что COUNT(DISTINCT) считает клиента один раз. HAVING оставил 3 пары «канал, бренд» из 12."},
      conditional: {"title": "Условные агрегаты: отмены и выручка по месяцам за один проход", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- одна таблица вместо пяти запросов: отмены и выручка по месяцам\nSELECT channel,\n       COUNT(*)                                              AS orders,\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS canc_case,\n       COUNT(*) FILTER (WHERE status = 'cancelled')          AS canc_filter,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled')\n             / COUNT(*), 1)                                  AS canc_pct,\n       SUM(amount) FILTER (WHERE status = 'paid'\n                             AND order_date < '2026-02-01')  AS rev_jan,\n       SUM(amount) FILTER (WHERE status = 'paid'\n                             AND order_date >= '2026-02-01'\n                             AND order_date <  '2026-03-01') AS rev_feb,\n       SUM(amount) FILTER (WHERE status = 'paid'\n                             AND order_date >= '2026-03-01') AS rev_mar\nFROM orders\nGROUP BY channel\nORDER BY channel;", "out": " channel  | orders | canc_case | canc_filter | canc_pct | rev_jan | rev_feb | rev_mar \n----------+--------+-----------+-------------+----------+---------+---------+---------\n органика |     94 |        15 |          15 |     16.0 |   69850 |  128320 |  207370\n рассылка |     45 |        10 |          10 |     22.2 |   39200 |   71510 |   51610\n реклама  |     92 |        11 |          11 |     12.0 |   64850 |   79120 |  200250\n(3 rows)", "note": "canc_case и canc_filter совпадают: это две записи одного условного агрегата. Три столбца rev_* — сводная «канал × месяц». 100.0 в доле отмен нужно, чтобы деление не было целочисленным."},
      rollup: {"title": "ROLLUP добавляет строку «итого», GROUPING SETS даёт три разреза сразу", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- ROLLUP (channel): строки по каналам и итоговая строка\nSELECT CASE WHEN GROUPING(channel) = 1 THEN 'итого'\n            ELSE channel END     AS channel,\n       COUNT(*)                  AS orders,\n       SUM(amount)               AS revenue,\n       ROUND(AVG(amount), 2)     AS avg_check\nFROM orders\nWHERE status = 'paid'\nGROUP BY ROLLUP (channel)\nORDER BY GROUPING(channel), revenue DESC;\n\n-- GROUPING SETS: разрез по каналу, разрез по бренду и общий итог за один проход\nSELECT channel, brand, COUNT(*) AS orders, SUM(amount) AS revenue\nFROM orders\nWHERE status = 'paid'\nGROUP BY GROUPING SETS ((channel), (brand), ())\nORDER BY channel, brand;", "out": " channel  | orders | revenue | avg_check \n----------+--------+---------+-----------\n органика |     79 |  405540 |   5133.42\n реклама  |     81 |  344220 |   4249.63\n рассылка |     35 |  162320 |   4637.71\n итого    |    195 |  912080 |   4677.33\n(4 rows)\n\n channel  | brand | orders | revenue \n----------+-------+--------+---------\n органика | NULL  |     79 |  405540\n рассылка | NULL  |     35 |  162320\n реклама  | NULL  |     81 |  344220\n NULL     | Бриз  |     55 |  266300\n NULL     | Кедр  |     39 |  218090\n NULL     | Луч   |     30 |  151540\n NULL     | Сова  |     71 |  276150\n NULL     | NULL  |    195 |  912080\n(8 rows)", "note": "Средний чек в строке «итого» — 4 677,33 ₽: он посчитан по 195 заказам, а не как среднее трёх каналов (4 673,59 ₽). NULL во втором выводе — столбец, который в этом наборе группировки не участвовал; psql запущен с параметром -P null=NULL, чтобы такие ячейки было видно."},
      nulls: {"title": "NULL в агрегатах: AVG(rating) делит на 104 оценки, а не на 195 заказов", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- NULL внутри агрегатов: оценку rating поставили не за каждый заказ\nSELECT status,\n       COUNT(*)                                  AS orders,\n       COUNT(rating)                             AS rated,\n       SUM(rating)                               AS rating_sum,\n       ROUND(AVG(rating), 2)                     AS avg_rating,\n       ROUND(SUM(rating)::numeric / COUNT(*), 2) AS per_order,\n       MAX(rating)                               AS max_rating\nFROM orders\nGROUP BY status\nORDER BY status;", "out": "  status   | orders | rated | rating_sum | avg_rating | per_order | max_rating \n-----------+--------+-------+------------+------------+-----------+------------\n cancelled |     36 |     0 |       NULL |       NULL |      NULL |       NULL\n paid      |    195 |   104 |        419 |       4.03 |      2.15 |          5\n(2 rows)", "note": "У отменённых заказов оценок нет: COUNT(rating) = 0, а SUM, AVG и MAX — NULL. per_order — другая метрика, «средний балл на заказ», где пустая оценка считается нулём; ::numeric спасает её от целочисленного деления."},
      dialects: {"title": "Один запрос — три движка: целочисленное деление и столбец вне GROUP BY", "badge": "проверено: Python 3.13, PostgreSQL 16, SQLite 3.53, DuckDB 2.0", "lang": "python", "code": "import sqlite3, duckdb, psycopg\n\nengines = {\n    \"PostgreSQL\": psycopg.connect(\"host=/tmp dbname=shop user=postgres\"),\n    \"SQLite\": sqlite3.connect(\"data/shop/shop.sqlite\"),\n    \"DuckDB\": duckdb.connect(\"data/shop/shop.duckdb\", read_only=True),\n}\n\ndef run(title, sql):\n    print(\"---\", title)\n    for name, con in engines.items():\n        try:\n            rows = con.execute(sql).fetchall()\n            if len(rows) == 1:\n                res = rows[0][0]\n            else:\n                res = \" · \".join(f\"{r[0]} {r[1]}\" for r in rows)\n        except Exception as e:\n            res = f\"{type(e).__name__}: {str(e).splitlines()[0]}\"\n            if name == \"PostgreSQL\":\n                con.rollback()      # после ошибки PostgreSQL ждёт отката\n        print(f\"{name:<11} {res}\")\n\nrun(\"SUM(amount) / COUNT(*)\",\n    \"SELECT SUM(amount) / COUNT(*) FROM orders WHERE status = 'paid'\")\nrun(\"channel вне GROUP BY\",\n    \"SELECT brand, channel, COUNT(*) FROM orders WHERE status = 'paid' \"\n    \"GROUP BY brand ORDER BY brand\")\nrun(\"то же, но в SELECT есть MAX(amount)\",\n    \"SELECT brand, channel, MAX(amount) FROM orders WHERE status = 'paid' \"\n    \"GROUP BY brand ORDER BY brand\")", "out": "--- SUM(amount) / COUNT(*)\nPostgreSQL  4677\nSQLite      4677\nDuckDB      4677.333333333333\n--- channel вне GROUP BY\nPostgreSQL  GroupingError: column \"orders.channel\" must appear in the GROUP BY clause or be used in an aggregate function\nSQLite      Бриз реклама · Кедр органика · Луч реклама · Сова органика\nDuckDB      BinderException: Binder Error: column \"channel\" must appear in the GROUP BY clause or must be part of an aggregate function.\n--- то же, но в SELECT есть MAX(amount)\nPostgreSQL  GroupingError: column \"orders.channel\" must appear in the GROUP BY clause or be used in an aggregate function\nSQLite      Бриз органика · Кедр органика · Луч реклама · Сова реклама\nDuckDB      BinderException: Binder Error: column \"channel\" must appear in the GROUP BY clause or must be part of an aggregate function.", "note": "SQLite показывает Бризу то рекламу, то органику — смотря есть ли в запросе MAX(amount). На деле чаще всего Бриз продаётся через органику: 25 оплаченных заказов против 15 у рекламы и рассылки."}
    }/*code:end*/,
    questions: {
    q1: { sec: 'avg', title: 'Сначала предскажите', q: 'В Казахстане 18 оплаченных заказов без промокода со средним чеком 5 458 ₽ и 4 заказа с промокодом со средним чеком 7 313 ₽. Каков средний чек по Казахстану?', opts: [['6 385 ₽ — ровно посередине между двумя средними'], ['Около 5 795 ₽ — ближе к группе, где больше заказов', 1], ['Около 6 900 ₽ — ближе к группе с большим чеком'], ['Без отдельных заказов его не посчитать']],
      why: 'Средний чек — выручка, делённая на число заказов. Выручку групп можно восстановить: 5 458,33 × 18 + 7 312,50 × 4 = 127 500 ₽ на 22 заказа, это 5 795,45 ₽. Восемнадцать заказов весят больше четырёх, поэтому ответ ближе к первой группе. Середина 6 385 ₽ — среднее от средних: оно дало бы четырём заказам тот же вес, что и восемнадцати. Отдельные заказы не нужны, хватает средних и числа заказов.' },
    q2: { sec: 'idea', q: 'В анимации WHERE оставил 22 строки из 25, GROUP BY brand собрал их в четыре стопки, а HAVING COUNT(*) >= 4 оставил три. Что убрал HAVING?', opts: [['Три отменённых заказа'], ['Всю группу Кедр — три её заказа сразу', 1], ['Заказы дешевле 4 000 ₽'], ['Строку с самым крупным заказом, 18 390 ₽']],
      why: 'HAVING проверяет условие для группы целиком, когда агрегаты уже посчитаны. У Кедра COUNT(*) = 3, это меньше порога, и группа ушла вместе со всеми своими строками. Отменённые заказы убрал раньше WHERE: он смотрит на каждую строку отдельно. Условие COUNT(*) >= 4 говорит о числе строк в группе, а не о суммах, и отдельные заказы HAVING не трогает.' },
    q3: { sec: 'avg', q: 'Средние чеки стран в учебной базе: BY 4 587, KZ 5 795, RU 4 525, UZ 4 327 ₽. Их среднее — 4 809 ₽, а средний чек по всем 184 заказам этих стран — 4 671 ₽. Почему числа разные?', opts: [['AVG округляет средние, и ошибка накопилась'], ['Среднее от средних даёт Казахстану с 22 заказами тот же вес, что Беларуси с 75', 1], ['В средние стран попали отменённые заказы'], ['Один из расчётов ошибочен: способы обязаны совпадать']],
      why: 'Общий средний чек взвешивает каждый заказ, а среднее четырёх чисел — каждую страну. У Казахстана самый высокий чек и всего 22 заказа из 184, но в среднем от средних он весит четверть. Отсюда завышение на 138 ₽. Округление дало бы копейки, а не сотни рублей, а отменённых заказов нет ни в одном расчёте. Совпали бы способы только при странах одного размера или при равных чеках.' },
    q4: { sec: 'idea', q: 'Что считает COUNT(DISTINCT customer_id) в группе «органика» оплаченных заказов?', opts: [['Число заказов в группе'], ['Число разных клиентов, у которых есть хотя бы один такой заказ', 1], ['Число клиентов, сделавших ровно один заказ'], ['Число строк, где customer_id не NULL']],
      why: 'DISTINCT убирает повторы перед подсчётом: клиент с пятью заказами учитывается один раз. В учебной базе у органики 79 заказов и 33 покупателя. Число заказов дал бы COUNT(*), непустые значения — COUNT(customer_id). Клиентов ровно с одним заказом DISTINCT не выделяет: для этого группируют по клиенту и пишут HAVING COUNT(*) = 1.' },
    q5: { sec: 'idea', q: 'Нужны каналы, где отменено больше 10 заказов. Какая запись верна?', opts: [['WHERE COUNT(*) FILTER (WHERE status = \'cancelled\') > 10 GROUP BY channel'], ['GROUP BY channel HAVING COUNT(*) FILTER (WHERE status = \'cancelled\') > 10', 1], ['WHERE status = \'cancelled\' AND COUNT(*) > 10 GROUP BY channel'], ['Любая: WHERE и HAVING взаимозаменяемы']],
      why: 'Число отмен — агрегат, оно известно только после группировки, поэтому условие пишут в HAVING. В учебной базе подходят органика (15 отмен) и реклама (11). WHERE работает до GROUP BY, когда групп ещё нет, и на агрегат в нём PostgreSQL отвечает ошибкой «aggregate functions are not allowed in WHERE». В третьем варианте агрегат тоже стоит в WHERE; рабочая версия — WHERE status = \'cancelled\' GROUP BY channel HAVING COUNT(*) > 10.' },
    q6: { sec: 'nuances', q: 'Выручка оплаченных заказов — 912 080 ₽, их 195. Что вернёт эта строка в PostgreSQL?', code: "SELECT SUM(amount) / COUNT(*) FROM orders WHERE status = 'paid';", lang: 'sql', opts: [['4677.33'], ['4677', 1], ['4678'], ['Ошибку: агрегат нельзя делить на агрегат']],
      why: 'amount — целый столбец, SUM и COUNT тоже целые, а целое, делённое на целое, в PostgreSQL — целое с отброшенной дробью: 4677. Округления до 4678 нет: дробная часть просто отбрасывается. Делить агрегаты друг на друга можно. Дробный ответ даст DuckDB, а в PostgreSQL — ROUND(AVG(amount), 2) или 1.0 * SUM(amount) / COUNT(*).' },
    q7: { sec: 'nuances', q: 'Из 195 оплаченных заказов оценку rating поставили в 104. По скольким значениям посчитан AVG(rating)?', opts: [['По 195: пустую оценку AVG считает нулём'], ['По 104: AVG пропускает NULL', 1], ['По 104, но сумму делит на 195'], ['Ни по скольким: из-за NULL результат тоже NULL']],
      why: 'Агрегаты, кроме COUNT(*), пропускают NULL: сумма 419 делится на 104, и AVG(rating) = 4,03. Считать пустую оценку нулём — отдельное решение, SUM(rating) / COUNT(*) даёт 2,15. NULL портит обычную арифметику вроде rating + 1, но не агрегаты. NULL получился бы, только если бы в группе не было ни одной оценки, как у отменённых заказов.' }
    },
    glossary: {
      segment: { t: 'Сегмент', en: 'segment', d: 'Часть данных с общим значением признака: канал, бренд, страна.' },
      aov: { t: 'Средний чек', en: 'average order value, AOV', d: 'Выручка, делённая на число заказов: AVG(amount) по оплаченным заказам.' },
      agg: { t: 'Агрегатная функция', en: 'aggregate function', d: 'Функция, которая сворачивает значения многих строк в одно: COUNT, SUM, AVG, MIN, MAX.' },
      groupby: { t: 'GROUP BY', en: 'GROUP BY', d: 'Часть запроса, которая раскладывает строки по группам с одинаковыми значениями перечисленных столбцов; агрегаты считаются в каждой группе.' },
      having: { t: 'HAVING', en: 'HAVING', d: 'Условие для групп: проверяется после группировки и может использовать агрегаты.' },
      null: { t: 'NULL', en: 'NULL', d: 'Отметка «значения нет». Агрегаты, кроме COUNT(*), такие ячейки пропускают.' },
      distinct: { t: 'COUNT(DISTINCT)', en: 'count distinct', d: 'Число разных непустых значений столбца в группе: повторы считаются один раз.' },
      condagg: { t: 'Условный агрегат', en: 'conditional aggregate', d: 'Агрегат, который учитывает только строки, подходящие под условие: SUM(CASE WHEN …) или FILTER.' },
      case: { t: 'CASE', en: 'CASE expression', d: 'Выражение, которое возвращает значение в зависимости от условия: CASE WHEN … THEN … ELSE … END.' },
      filter: { t: 'FILTER', en: 'FILTER clause', d: 'Условие после агрегата: COUNT(*) FILTER (WHERE …) считает только подходящие строки. Появилось в стандарте SQL:2003.' },
      aoa: { t: 'Среднее от средних', en: 'average of averages', d: 'Среднее, посчитанное по средним групп без учёта их размера. Совпадает с общим средним, только если группы равны по размеру или по среднему.' },
      wavg: { t: 'Взвешенное среднее', en: 'weighted mean', d: 'Среднее, где каждое значение умножено на свой вес. Средние групп с весами-размерами дают общее среднее.' },
      rollup: { t: 'ROLLUP', en: 'ROLLUP', d: 'Сокращение в GROUP BY: группировка по списку столбцов, по его началам и общий итог.' },
      gsets: { t: 'GROUPING SETS', en: 'grouping sets', d: 'Несколько наборов группировки в одном запросе; пустой набор () даёт общий итог.' },
      intdiv: { t: 'Целочисленное деление', en: 'integer division', d: 'Деление целого на целое с отбрасыванием дробной части: 5 / 2 = 2 в PostgreSQL и SQLite.' },
      dialect: { t: 'Диалект SQL', en: 'SQL dialect', d: 'Вариант языка в конкретной СУБД: основа общая, синтаксис и поведение различаются в мелочах.' },
      funnel: { t: 'Воронка', en: 'funnel', d: 'Доли пользователей, которые прошли шаги процесса по порядку: визит, корзина, оплата.' }
    },
    materials: [
      ['da-3-3-aggregates.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/shop/', 'Учебная база shop для PostgreSQL, SQLite и DuckDB — общий набор темы 03'],
      ['queries.sql', 'Четыре блока запросов из раздела «Код»'],
      ['dialects.py', 'Сравнение PostgreSQL, SQLite и DuckDB из пятого блока'],
      ['avg_of_avgs.csv', 'Выборка интерактива: оплаченные заказы четырёх стран с отметкой промокода']
    ],
    prompts: [
      ['Тренажёр по GROUP BY', 'Дай мне по учебной базе shop из источника пять задач на метрики по сегментам. Я напишу запрос, а ты проверишь: всё ли в SELECT есть в GROUP BY или в агрегате, где нужен WHERE, а где HAVING. По одной задаче за раз.'],
      ['Ловушки средних', 'Опиши четыре ситуации, где среднее считают по уже агрегированной таблице. Для каждой я скажу, совпадёт ли результат с общим средним и как его исправить. Не называй ответ, пока я не отвечу.'],
      ['Разбор моего отчёта', 'Я вставлю свой запрос с GROUP BY. Наводящими вопросами помоги найти в нём NULL внутри агрегатов, целочисленное деление и итоги, посчитанные как среднее от средних. Не переписывай запрос за меня.']
    ]
  };
})();
