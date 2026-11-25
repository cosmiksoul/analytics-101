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
    parts: [{ n: '01', name: 'Строки', s: [0, 1] }, { n: '02', name: 'Группы', s: [2, 3] }, { n: '03', name: 'Агрегаты', s: [4, 5] }, { n: '04', name: 'HAVING', s: [6, 7] }, { n: '05', name: 'Результат', s: [8, 9] }],
    steps: [
      { title: '25 заказов за неделю', dur: 3200, body: '<p>В&nbsp;таблице <b>orders</b> выбраны заказы с&nbsp;23&nbsp;февраля по&nbsp;1&nbsp;марта 2026&nbsp;года. На&nbsp;карточке каждого заказа видны его номер, бренд и&nbsp;сумма.</p><p>Посчитаем число оплаченных заказов, выручку и&nbsp;средний чек для каждого бренда.</p>' },
      { title: 'WHERE оставляет оплаченные заказы', dur: 3200, body: '<p>Условие <b>WHERE status = &#39;paid&#39;</b> проверяется для каждой строки. Три отменённых заказа в&nbsp;расчёт не&nbsp;войдут.</p><p>Остаются 22 оплаченных заказа на&nbsp;102&nbsp;760&nbsp;₽.</p>' },
      { title: 'Четыре группы по брендам', dur: 3600, body: '<p><b>GROUP BY brand</b> объединяет заказы с&nbsp;одинаковым брендом. Каждый столбик показывает заказы одного бренда. В&nbsp;четырёх столбиках те&nbsp;же 22 заказа.</p>' },
      { title: 'Каждая карточка — один заказ', dur: 3000, body: '<p>Пока карточки одинаковой высоты, число карточек в&nbsp;столбике соответствует <b>COUNT(*)</b>. У&nbsp;«Совы» восемь оплаченных заказов, у&nbsp;«Кедра» три.</p>' },
      { title: 'Высота столбика показывает выручку', dur: 3600, body: '<p>Теперь высота карточки пропорциональна сумме заказа, а&nbsp;высота всего столбика — <b>SUM(amount)</b>. Выручка составляет от&nbsp;23&nbsp;410&nbsp;₽ у&nbsp;«Совы» до&nbsp;29&nbsp;380&nbsp;₽ у&nbsp;«Бриза».</p><p>На&nbsp;один заказ стоимостью 18&nbsp;390&nbsp;₽ пришлось больше двух третей выручки «Кедра».</p>' },
      { title: 'Средний чек внутри группы', dur: 3600, body: '<p>Разделим столбик каждого бренда на&nbsp;равные части по&nbsp;числу его заказов. Высота целого столбика по-прежнему показывает выручку, а&nbsp;высота одной части теперь соответствует <b>AVG(amount)</b>.</p><p>У&nbsp;«Кедра» средний чек равен 8&nbsp;580&nbsp;₽. У&nbsp;«Совы» он&nbsp;составляет примерно 2&nbsp;926&nbsp;₽.</p>' },
      { title: 'Не меньше четырёх заказов', dur: 3600, body: '<p>Вернёмся к&nbsp;одинаковым карточкам, по&nbsp;одной на&nbsp;заказ. Нам нужны бренды, у&nbsp;которых оплачено хотя&nbsp;бы четыре заказа за&nbsp;неделю.</p><p>Условие <b>HAVING COUNT(*) &gt;= 4</b> применяется к&nbsp;каждой группе после подсчёта заказов.</p>' },
      { title: 'Почему «Кедр» исключён из отчёта', dur: 3400, body: '<p>У&nbsp;«Кедра» три заказа, поэтому группа не&nbsp;проходит условие HAVING. В&nbsp;отчёт войдут «Луч», «Бриз» и&nbsp;«Сова».</p><p>Из&nbsp;трёх оставшихся брендов самый высокий средний чек у&nbsp;«Луча».</p>' },
      { title: 'По одной строке на бренд', dur: 3400, body: '<p>В&nbsp;каждой строке результата — бренд, число оплаченных заказов, выручка и&nbsp;средний чек. <b>ORDER BY avg_check DESC</b> сортирует строки по&nbsp;убыванию среднего чека. Первым идёт «Луч».</p>' },
      { title: 'Какие строки и группы попали в результат', dur: 4000, next: 'Читать страницу', body: '<p>WHERE исключил три отменённых заказа до&nbsp;группировки. Когда число заказов по&nbsp;брендам уже было известно, HAVING исключил одну группу. Поэтому в&nbsp;итоговой таблице три строки.</p>' }
    ],
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'grp', label: 'Групп' }, { id: 'sum', label: 'Сумма заказов' }],
    legend: '<span><i style="background:#6fa2ea"></i>Бриз</span><span><i style="background:#45c48f"></i>Кедр</span><span><i style="background:#e3c04d"></i>Луч</span><span><i style="background:#b49af5"></i>Сова</span><span><i style="background:#f2756a"></i>отброшено</span>',
    info: 'GROUP BY · HAVING',
    aiNote: 'В таблице orders 25 заказов за неделю с 23 февраля по 1 марта 2026 года. После фильтра по статусу paid остаются 22 заказа на 102 760 ₽. У «Бриза» 7 заказов на 29 380 ₽, у «Кедра» 3 на 25 740 ₽, у «Луча» 4 на 24 230 ₽, у «Совы» 8 на 23 410 ₽. Сначала каждый заказ обозначен одинаковой карточкой, затем её высота пропорциональна сумме заказа. Чтобы показать средний чек, карточки внутри каждой группы делают одинаковыми при прежней суммарной высоте. Условие HAVING COUNT(*) >= 4 исключает «Кедр». В результате три строки, отсортированные по убыванию среднего чека: «Луч» (6 058 ₽), «Бриз» (4 197 ₽) и «Сова» (2 926 ₽).',
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
      const drops = [mk('ag-drop', `<b>WHERE</b> · до группировки<span>отменённые заказы: ${cancelled}</span>`), mk('ag-drop', `<b>HAVING</b> · после группировки<span>бренд «${DROP}» — COUNT(*) = ${AG[DROP].n} &lt; 4</span>`)];
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
          case 3: return { x: cx, y: G.cy, t: 'у «Кедра» 3 заказа', ty: ltop };
          case 4: return { x: cx, y: G.cy, t: 'один заказ — 18 390 ₽', ty: ltop };
          case 5: return { x: cx, y: G.cy, t: 'среднее по трём заказам — 8 580 ₽', ty: ltop };
          case 6: return { x: cx, y: G.cy, t: 'у «Кедра» меньше четырёх заказов', ty: ltop };
          case 7: return { x: cx, y: G.cy, t: '3 < 4: бренд не войдёт в отчёт', ty: ltop };
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
    box.innerHTML = `<div class="block-hd"><span class="t">Как размер групп влияет на средний чек <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="am-reset">Сбросить</button></div></div>
<p class="hint am-do">Выберите страну и способ расчёта. Каждая точка показывает сумму одного оплаченного заказа. Точка опоры весов отмечает результат выбранного расчёта.</p>
<div class="am-ctl"><span class="am-grp"><span class="am-lb">страна</span><span class="seg" role="group" aria-label="Страна">${Object.keys(CN).map(c => `<button type="button" data-c="${c}" title="${CN[c][0]}">${c}</button>`).join('')}</span></span><span class="am-grp"><span class="am-lb">способ</span><span class="seg am-seg" role="group" aria-label="Способ расчёта">${Object.keys(MN).map(m => `<button type="button" data-m="${m}">${MN[m]}</button>`).join('')}</span></span></div>
<div class="stage"><div class="am-left"><div class="am-plot" id="am-plot"></div><div class="am-leg"><span><i class="g0"></i>без промокода</span><span><i class="g1"></i>с промокодом</span><span><i class="r"></i>выбранный способ</span><span><i class="o"></i>результат для сравнения</span></div></div>
<div class="narr"><p class="cap" id="am-cap"></p><div class="readout am-ro"><div><span class="big" id="am-v"></span><span class="lbl" id="am-vl"></span></div><div><span class="big" id="am-d"></span><span class="lbl">разница с расчётом по всем заказам</span></div></div><pre class="am-f" id="am-f"></pre><div class="narr-text" id="am-msg"></div><p class="cap">Задания</p><ol class="steps am-tasks" id="am-tasks"></ol></div></div>
<div class="status"><span><span class="dot live"></span><span id="am-s1"></span></span><span class="grow"></span><span id="am-s2"></span></div>`;
    const TASKS = [
      { t: 'В какой стране простое среднее двух средних чеков сильнее всего отличается от среднего по заказам?', ok: s => s.c === 'KZ' && s.m === 'aoa' },
      { t: 'Найдите страну, где в одной группе примерно в пять раз больше заказов, чем в другой, но средние чеки групп близки.', ok: s => s.c === 'BY' && s.m === 'aoa' },
      { t: 'Получите общий средний чек по средним значениям и числу заказов в каждой группе.', ok: s => s.m === 'wavg' }
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
      if (s.m === 'rows') return `Все ${R.N} заказов имеют одинаковый вес. Средний чек по стране равен <b>${f2(R.rows)} ₽</b>. Он ближе к среднему в большей группе (${sp(R.g[big].a)} ₽), чем в меньшей (${sp(R.g[1 - big].a)} ₽).`;
      if (s.m === 'aoa') return `Средние чеки двух групп получили одинаковый вес. В первой группе ${a.n} ${plural(a.n, ['заказ', 'заказа', 'заказов'])}, во второй — ${b.n}. Если из среднего двух групп вычесть среднее по всем заказам, разница составит <b>${signed(R.gap)} ₽</b>.${Math.abs(R.gap) < 50 ? ' Средние чеки групп близки, поэтому и разница невелика.' : ''}`;
      return `Средний чек каждой группы умножаем на число заказов в ней. Складываем полученные суммы и делим на общее число заказов (${R.N}). Получаем <b>${f2(R.wavg)} ₽</b> — столько же, сколько при расчёте по отдельным заказам.`;
    }

    function draw() {
      const R = avgCalc(s.c, s.m), [a, b] = R.g;
      TASKS.forEach((t, n) => { if (t.ok(s)) s.done[n] = true; });
      plot(R);
      $('am-cap').textContent = `Средний чек ${CN[s.c][1]}`;
      $('am-v').textContent = `${sp(R.res)} ₽`;
      $('am-vl').textContent = s.m === 'rows' ? `по всем заказам (${R.N})` : s.m === 'aoa' ? 'среднее двух средних' : 'с учётом числа заказов в каждой группе';
      const d = R.res - R.rows;
      $('am-d').textContent = Math.abs(d) < 0.005 ? '0 ₽' : `${d > 0 ? '+' : '−'}${sp(Math.abs(d))} ₽`;
      $('am-d').className = 'big' + (Math.abs(d) >= 0.005 ? ' am-bad' : ' am-ok');
      $('am-f').textContent = s.m === 'rows' ? `AVG(amount)\n= ${sp(a.s + b.s)} / ${R.N}\n= ${f2(R.rows)} ₽`
        : s.m === 'aoa' ? `(AVG₁ + AVG₂) / 2\n= (${f2(a.a)} + ${f2(b.a)}) / 2\n= ${f2(R.aoa)} ₽`
          : `(AVG₁·n₁ + AVG₂·n₂)\n  / (n₁ + n₂)\n= (${f2(a.a)}·${a.n}\n   + ${f2(b.a)}·${b.n}) / ${R.N}\n= ${f2(R.wavg)} ₽`;
      $('am-msg').innerHTML = message(R);
      $('am-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t.t)}</li>`).join('');
      $('am-s1').textContent = `${s.c} · ${R.N} ${plural(R.N, ['оплаченный заказ', 'оплаченных заказа', 'оплаченных заказов'])}: ${a.n} ${GN[0]}, ${b.n} ${GN[1]}`;
      $('am-s2').textContent = `разница между средним по заказам и средним двух групп — ${sp(Math.abs(R.gap))} ₽ (${fmt(Math.abs(R.gap) / R.rows * 100, 1)}%)`;
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
        return `${CN[s.c][0]}. Способ расчёта — «${MN[s.m]}», результат ${f2(R.res)} ₽. Среднее по заказам ${f2(R.rows)} ₽, среднее двух групп ${f2(R.aoa)} ₽. Без промокода: ${a.n} ${plural(a.n, ['заказ', 'заказа', 'заказов'])}, средний чек ${f2(a.a)} ₽. С промокодом: ${b.n} ${plural(b.n, ['заказ', 'заказа', 'заказов'])}, средний чек ${f2(b.a)} ₽. Выполнено заданий: ${s.done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-3-3',
    short: 'DA-03',
    title: 'Агрегаты и группировка',
    where: 'блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.3',
    aiData: 'Учебная база shop содержит заказы за январь–март 2026 года. В таблице orders 231 заказ, из них 195 оплачены. Для анализа доступны канал заказа, бренд, сумма, статус, оценка и промокод. Страна клиента хранится в таблице customers. У части заказов отсутствуют оценка или промокод, у двух клиентов неизвестна страна.',
    scene,
    widgets: { avg: buildAvg },
    code: /*code:start*/{
      channels: {"title": "Заказы, покупатели и выручка по каналам", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- показатели по каналу для оплаченных заказов\nSELECT channel,\n       COUNT(*)                    AS orders,\n       COUNT(DISTINCT customer_id) AS buyers,\n       SUM(amount)                 AS revenue,\n       ROUND(AVG(amount), 2)       AS avg_check,\n       MIN(amount)                 AS min_check,\n       MAX(amount)                 AS max_check\nFROM orders\nWHERE status = 'paid'\nGROUP BY channel\nORDER BY revenue DESC;\n\n-- два столбца в GROUP BY: группа — пара «канал, бренд», всего их 12\nSELECT channel, brand, COUNT(*) AS orders, SUM(amount) AS revenue\nFROM orders\nWHERE status = 'paid'\nGROUP BY channel, brand\nHAVING COUNT(*) >= 20          -- оставить пары, где не меньше 20 заказов\nORDER BY channel, revenue DESC;", "out": " channel  | orders | buyers | revenue | avg_check | min_check | max_check \n----------+--------+--------+---------+-----------+-----------+-----------\n органика |     79 |     33 |  405540 |   5133.42 |       450 |     18390\n реклама  |     81 |     34 |  344220 |   4249.63 |       400 |     14050\n рассылка |     35 |     18 |  162320 |   4637.71 |       450 |     11730\n(3 rows)\n\n channel  | brand | orders | revenue \n----------+-------+--------+---------\n органика | Бриз  |     25 |  133820\n органика | Сова  |     26 |   88490\n реклама  | Сова  |     35 |  139660\n(3 rows)", "note": "В канале «органика» 79 оплаченных заказов у 33 покупателей. В канале «реклама» почти столько же заказов, но средний чек ниже примерно на 884 ₽. Во втором запросе условие HAVING оставило 3 пары «канал, бренд» из 12."},
      conditional: {"title": "Число отмен и помесячная выручка по каналам", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- в каждой строке канала считаем отмены и помесячную выручку\nSELECT channel,\n       COUNT(*)                                              AS orders,\n       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS canc_case,\n       COUNT(*) FILTER (WHERE status = 'cancelled')          AS canc_filter,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled')\n             / COUNT(*), 1)                                  AS canc_pct,\n       SUM(amount) FILTER (WHERE status = 'paid'\n                             AND order_date < '2026-02-01')  AS rev_jan,\n       SUM(amount) FILTER (WHERE status = 'paid'\n                             AND order_date >= '2026-02-01'\n                             AND order_date <  '2026-03-01') AS rev_feb,\n       SUM(amount) FILTER (WHERE status = 'paid'\n                             AND order_date >= '2026-03-01') AS rev_mar\nFROM orders\nGROUP BY channel\nORDER BY channel;", "out": " channel  | orders | canc_case | canc_filter | canc_pct | rev_jan | rev_feb | rev_mar \n----------+--------+-----------+-------------+----------+---------+---------+---------\n органика |     94 |        15 |          15 |     16.0 |   69850 |  128320 |  207370\n рассылка |     45 |        10 |          10 |     22.2 |   39200 |   71510 |   51610\n реклама  |     92 |        11 |          11 |     12.0 |   64850 |   79120 |  200250\n(3 rows)", "note": "В canc_case и canc_filter число отмен совпадает. Три столбца rev_* содержат выручку за январь, февраль и март. Множитель 100.0 в формуле доли отмен позволяет получить процент с дробной частью."},
      rollup: {"title": "Итоги по каналам, брендам и магазину", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- ROLLUP (channel): строки по каналам и итоговая строка\nSELECT CASE WHEN GROUPING(channel) = 1 THEN 'итого'\n            ELSE channel END     AS channel,\n       COUNT(*)                  AS orders,\n       SUM(amount)               AS revenue,\n       ROUND(AVG(amount), 2)     AS avg_check\nFROM orders\nWHERE status = 'paid'\nGROUP BY ROLLUP (channel)\nORDER BY GROUPING(channel), revenue DESC;\n\n-- показатели по каналам, по брендам и по всем заказам\nSELECT channel, brand, COUNT(*) AS orders, SUM(amount) AS revenue\nFROM orders\nWHERE status = 'paid'\nGROUP BY GROUPING SETS ((channel), (brand), ())\nORDER BY channel, brand;", "out": " channel  | orders | revenue | avg_check \n----------+--------+---------+-----------\n органика |     79 |  405540 |   5133.42\n реклама  |     81 |  344220 |   4249.63\n рассылка |     35 |  162320 |   4637.71\n итого    |    195 |  912080 |   4677.33\n(4 rows)\n\n channel  | brand | orders | revenue \n----------+-------+--------+---------\n органика | NULL  |     79 |  405540\n рассылка | NULL  |     35 |  162320\n реклама  | NULL  |     81 |  344220\n NULL     | Бриз  |     55 |  266300\n NULL     | Кедр  |     39 |  218090\n NULL     | Луч   |     30 |  151540\n NULL     | Сова  |     71 |  276150\n NULL     | NULL  |    195 |  912080\n(8 rows)", "note": "Средний чек в строке «итого» равен 4 677,33 ₽ по всем 195 оплаченным заказам. Простое среднее трёх средних чеков каналов равно 4 673,59 ₽. Во второй таблице NULL обозначает, что столбец отсутствовал в соответствующем наборе группировки. Ключ psql -P null=NULL делает эти ячейки видимыми."},
      nulls: {"title": "Средняя оценка и баллы в пересчёте на заказ", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- оценка известна только для части заказов\nSELECT status,\n       COUNT(*)                                  AS orders,\n       COUNT(rating)                             AS rated,\n       SUM(rating)                               AS rating_sum,\n       ROUND(AVG(rating), 2)                     AS avg_rating,\n       ROUND(AVG(COALESCE(rating, 0)), 2)        AS per_order,\n       MAX(rating)                               AS max_rating\nFROM orders\nGROUP BY status\nORDER BY status;", "out": "  status   | orders | rated | rating_sum | avg_rating | per_order | max_rating \n-----------+--------+-------+------------+------------+-----------+------------\n cancelled |     36 |     0 |       NULL |       NULL |      0.00 |       NULL\n paid      |    195 |   104 |        419 |       4.03 |      2.15 |          5\n(2 rows)", "note": "Из 195 оплаченных заказов оценены 104. На один оценённый заказ приходится в среднем 4,03 балла, а на каждый оплаченный заказ — 2,15, если приравнять пропуски к нулю. У отменённых заказов нет ни одной оценки. В этой группе avg_rating равен NULL, а per_order по принятому правилу равен 0."},
      dialects: {"title": "Деление и группировка в трёх СУБД", "badge": "проверено: Python 3.13, PostgreSQL 16, SQLite 3.53, DuckDB 2.0", "lang": "python", "code": "import sqlite3, duckdb, psycopg\n\nengines = {\n    \"PostgreSQL\": psycopg.connect(\"host=/tmp dbname=shop user=postgres\"),\n    \"SQLite\": sqlite3.connect(\"data/shop/shop.sqlite\"),\n    \"DuckDB\": duckdb.connect(\"data/shop/shop.duckdb\", read_only=True),\n}\n\ndef run(title, sql):\n    print(\"---\", title)\n    for name, con in engines.items():\n        try:\n            rows = con.execute(sql).fetchall()\n            if len(rows) == 1:\n                res = rows[0][0]\n            else:\n                res = \" · \".join(f\"{r[0]} {r[1]}\" for r in rows)\n        except Exception as e:\n            res = f\"{type(e).__name__}: {str(e).splitlines()[0]}\"\n            if name == \"PostgreSQL\":\n                con.rollback()      # после ошибки PostgreSQL ждёт отката\n        print(f\"{name:<11} {res}\")\n\nrun(\"SUM(amount) / COUNT(*)\",\n    \"SELECT SUM(amount) / COUNT(*) FROM orders WHERE status = 'paid'\")\nrun(\"channel вне GROUP BY\",\n    \"SELECT brand, channel, COUNT(*) FROM orders WHERE status = 'paid' \"\n    \"GROUP BY brand ORDER BY brand\")\nrun(\"то же, но в SELECT есть MAX(amount)\",\n    \"SELECT brand, channel, MAX(amount) FROM orders WHERE status = 'paid' \"\n    \"GROUP BY brand ORDER BY brand\")", "out": "--- SUM(amount) / COUNT(*)\nPostgreSQL  4677\nSQLite      4677\nDuckDB      4677.333333333333\n--- channel вне GROUP BY\nPostgreSQL  GroupingError: column \"orders.channel\" must appear in the GROUP BY clause or be used in an aggregate function\nSQLite      Бриз реклама · Кедр органика · Луч реклама · Сова органика\nDuckDB      BinderException: Binder Error: column \"channel\" must appear in the GROUP BY clause or must be part of an aggregate function.\n--- то же, но в SELECT есть MAX(amount)\nPostgreSQL  GroupingError: column \"orders.channel\" must appear in the GROUP BY clause or be used in an aggregate function\nSQLite      Бриз органика · Кедр органика · Луч реклама · Сова реклама\nDuckDB      BinderException: Binder Error: column \"channel\" must appear in the GROUP BY clause or must be part of an aggregate function.", "note": "SQLite может вернуть для «Бриза» разные каналы в зависимости от списка агрегатов. Добавление MAX(amount) выбирает канал строки с максимальной суммой. Чтобы узнать самый частый канал, нужен отдельный подсчёт: у «Бриза» 25 оплаченных заказов в канале «органика» и по 15 в двух других каналах."}
    }/*code:end*/,
    questions: {
    q1: { sec: 'avg', title: 'Сначала предскажите', q: 'В Казахстане 18 оплаченных заказов без промокода. Их средний чек — около 5 458 ₽. У четырёх заказов с промокодом он составляет примерно 7 313 ₽. Какой результат ближе всего к общему среднему чеку?', opts: [['6 385 ₽, среднее двух групповых значений'], ['5 795 ₽, ближе к среднему чеку большей группы', 1], ['6 900 ₽, ближе к более высокому среднему чеку'], ['По этим данным нельзя даже приблизительно оценить общий чек']],
      why: 'В исходной выборке на заказы без промокода пришлось 98 250 ₽, с промокодом — 29 250 ₽. Общий чек равен 127 500 / 22 ≈ 5 795,45 ₽. Тот же результат получается, если до округления умножить каждое среднее на число заказов в группе, сложить и разделить на 22. Простое среднее двух групп было бы около 6 385 ₽.' },
    q2: { sec: 'idea', q: 'После WHERE осталось 22 заказа четырёх брендов. Какие данные исключило условие HAVING COUNT(*) >= 4?', opts: [['Три отменённых заказа'], ['Группу из трёх оплаченных заказов бренда «Кедр»', 1], ['Все заказы дешевле 4 000 ₽'], ['Заказ с самой большой суммой, 18 390 ₽']],
      why: 'HAVING проверяет число заказов в каждой группе после применения WHERE. У «Кедра» их три, а в отчёте должно быть хотя бы четыре. До этого WHERE исключил отменённые заказы независимо от бренда.' },
    q3: { sec: 'avg', q: 'Средние чеки четырёх стран округлены до рублей: Беларусь — 4 587, Казахстан — 5 795, Россия — 4 525, Узбекистан — 4 327. Почему среднее этих четырёх чисел (около 4 809 ₽) отличается от среднего по 184 заказам (около 4 671 ₽)?', opts: [['Разницу объясняет только округление'], ['При простом усреднении Казахстан с 22 заказами получает такой же вес, как Беларусь с 75 заказами', 1], ['В расчёт по странам попали отменённые заказы'], ['Оба способа по определению должны дать одинаковый средний чек']],
      why: 'При расчёте по заказам вес Казахстана составляет 22/184, а при простом усреднении по странам — 1/4. Средний чек в Казахстане самый высокий. В этих данных итог по четырём средним примерно на 138 ₽ выше общего среднего. Чтобы восстановить общий чек, понадобятся суммы и число заказов каждой страны.' },
    q4: { sec: 'idea', q: 'Что вернёт COUNT(DISTINCT customer_id) для оплаченных заказов в канале «органика»?', opts: [['Число оплаченных заказов канала'], ['Число покупателей хотя бы с одним таким заказом', 1], ['Число покупателей ровно с одним таким заказом'], ['Число строк, в которых известен customer_id']],
      why: 'В канале «органика» 79 оплаченных заказов у 33 покупателей. COUNT(DISTINCT customer_id) учитывает каждого из них один раз. Чтобы найти тех, кто сделал ровно один заказ, сгруппируйте строки по customer_id и добавьте HAVING COUNT(*) = 1.' },
    q5: { sec: 'idea', q: 'Как оставить в отчёте только каналы, в которых отменили больше десяти заказов?', opts: [['WHERE COUNT(*) FILTER (WHERE status = \'cancelled\') > 10 GROUP BY channel'], ['GROUP BY channel HAVING COUNT(*) FILTER (WHERE status = \'cancelled\') > 10', 1], ['WHERE status = \'cancelled\' AND COUNT(*) > 10 GROUP BY channel'], ['Любая: WHERE и HAVING взаимозаменяемы']],
      why: 'Количество отмен становится известно после группировки, поэтому условие по агрегату указывают в HAVING. Пройдут «органика» (15 отмен) и «реклама» (11). Если для отчёта нужны исключительно отмены, можно сначала отобрать их по статусу в WHERE, затем применить GROUP BY channel и HAVING COUNT(*) > 10.' },
    q6: { sec: 'nuances', q: 'В PostgreSQL столбец amount имеет тип INTEGER. У 195 оплаченных заказов общая сумма 912 080 ₽. Что вернёт запрос?', code: "SELECT SUM(amount) / COUNT(*) FROM orders WHERE status = 'paid';", lang: 'sql', opts: [['4677.33'], ['4677', 1], ['4678'], ['Ошибку: агрегат нельзя делить на агрегат']],
      why: 'Оба операнда деления здесь имеют целые типы. В PostgreSQL дробная часть отбрасывается, поэтому получится 4677. Чтобы получить 4677.33, используйте ROUND(AVG(amount), 2).' },
    q7: { sec: 'nuances', q: 'У 104 из 195 оплаченных заказов есть оценка rating. Сколько оценок войдёт в AVG(rating)?', opts: [['195, включая нули на месте пропусков'], ['104, все известные оценки', 1], ['104, но их сумму AVG разделит на 195'], ['Ни одной: пропуск делает результат всего расчёта неизвестным']],
      why: 'Сумма известных оценок равна 419, поэтому AVG(rating) даёт 419 / 104 ≈ 4,03. Если по правилам отчёта заказу без оценки присваивается ноль, AVG(COALESCE(rating, 0)) даст 419 / 195 ≈ 2,15. У отменённых заказов все оценки пропущены, поэтому первая формула вернёт NULL, а вторая — 0.' }
    },
    glossary: {
      segment: { t: 'Сегмент', en: 'segment', d: 'Группа наблюдений с общим признаком, например заказы одного бренда или покупки из одной страны.' },
      aov: { t: 'Средний чек', en: 'average order value, AOV', d: 'Средняя сумма заказа. В уроке рассчитывается по всем оплаченным заказам как AVG(amount).' },
      agg: { t: 'Агрегатная функция', en: 'aggregate function', d: 'Функция, которая по набору строк вычисляет одно значение. Например, SUM(amount) возвращает сумму, COUNT(*) — число строк.' },
      groupby: { t: 'GROUP BY', en: 'GROUP BY', d: 'Предложение SQL, которое объединяет строки с одинаковыми значениями ключа. Агрегатные функции вычисляются отдельно для каждой группы.' },
      having: { t: 'HAVING', en: 'HAVING', d: 'Условие отбора групп после GROUP BY. Может использовать результат агрегатной функции.' },
      null: { t: 'NULL', en: 'NULL', d: 'Обозначение отсутствующего или неизвестного значения. COUNT(столбец), SUM и AVG пропускают NULL, а COUNT(*) считает все строки.' },
      distinct: { t: 'COUNT(DISTINCT)', en: 'count distinct', d: 'Число различных значений выражения без учёта NULL. Повторяющиеся значения учитываются один раз.' },
      condagg: { t: 'Условный агрегат', en: 'conditional aggregate', d: 'Агрегат, при вычислении которого учитывают заданное условие. Например, COUNT(*) FILTER (WHERE …) считает подходящие строки.' },
      case: { t: 'CASE', en: 'CASE expression', d: 'Выражение, которое выбирает результат в зависимости от условия. Без ELSE результатом будет NULL, если ни одно условие не выполнено.' },
      filter: { t: 'FILTER', en: 'FILTER clause', d: 'Условие, которое ограничивает набор строк для одного агрегата. Например, COUNT(*) FILTER (WHERE …) считает подходящие строки.' },
      aoa: { t: 'Среднее от средних', en: 'average of averages', d: 'Простое среднее групповых средних. Вес каждой группы одинаков независимо от числа наблюдений в ней.' },
      wavg: { t: 'Взвешенное среднее', en: 'weighted mean', d: 'Сумма произведений значений на их веса, делённая на сумму весов. Чтобы восстановить общее среднее, весом группы берут число значений, учтённых при расчёте её среднего.' },
      rollup: { t: 'ROLLUP', en: 'ROLLUP', d: 'Способ получить итоги на последовательных уровнях группировки. Например, ROLLUP(channel, brand) даёт результат для пар «канал, бренд», для каналов и для всей таблицы.' },
      gsets: { t: 'GROUPING SETS', en: 'grouping sets', d: 'Перечень наборов столбцов для группировки в одном запросе. Пустой набор () задаёт общий итог.' },
      intdiv: { t: 'Целочисленное деление', en: 'integer division', d: 'Деление с отбрасыванием дробной части. Например, в PostgreSQL и SQLite выражение 5 / 2 равно 2.' },
      dialect: { t: 'Диалект SQL', en: 'SQL dialect', d: 'Вариант SQL, поддерживаемый конкретной СУБД. Даже для одинакового текста запроса результат может зависеть от СУБД и типов данных.' },
      funnel: { t: 'Воронка', en: 'funnel', d: 'Отчёт по последовательным этапам процесса. Например, для интернет-магазина считают, сколько посетителей добавили товар в корзину и сколько затем оплатили заказ.' }
    },
    materials: [
      ['da-3-3-aggregates.md', 'Текст урока, код запросов, вопросы и глоссарий в формате Markdown'],
      ['data/shop/', 'Общая учебная база главы для PostgreSQL, SQLite и DuckDB'],
      ['queries.sql', 'Запросы по каналам, отменам, итоговым строкам и оценкам'],
      ['dialects.py', 'Пример для сравнения деления и группировки в трёх СУБД'],
      ['avg_of_avgs.csv', '184 оплаченных заказа из четырёх стран с отметкой о применении промокода']
    ],
    prompts: [
      ['Практика с GROUP BY', 'Предложи мне пять задач по учебной базе shop. Давай их по одной. Для каждого моего решения проверь, что означает строка результата, какие заказы участвуют в расчёте и правильно ли выбраны WHERE и HAVING.'],
      ['Расчёт общего среднего', 'Предложи четыре отчёта с групповыми средними. Для каждого спроси, можно ли узнать общее среднее и какие данные нужны для точного расчёта. Дождись моего ответа и разбери один пример с числами.'],
      ['Разбор моего отчёта', 'Я пришлю запрос с GROUP BY. Помоги проверить знаменатели средних, обработку NULL и типы при делении. Сначала задай вопросы о том, что должна показывать каждая строка, затем проверь мою версию.']
    ]
  };
})();
