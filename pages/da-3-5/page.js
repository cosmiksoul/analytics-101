/* Страница 3.5 · Оконные функции */
(() => {
  const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ===================== Данные сцены =====================
     Учебная база shop (PostgreSQL 16): оплаченные заказы четырёх клиентов.
     SELECT order_id, customer_id, order_date, amount FROM orders
     WHERE status = 'paid' AND customer_id IN (101, 143, 146, 157) ORDER BY order_date, order_id; */
  const SC = [[1001, 101, '2026-01-29', 6770], [1161, 143, '2026-02-15', 9140], [1162, 143, '2026-02-16', 2730], [1187, 146, '2026-03-01', 2500], [1188, 146, '2026-03-07', 3340], [1218, 157, '2026-03-11', 4470], [1002, 101, '2026-03-20', 2630], [1189, 146, '2026-03-20', 1730], [1163, 143, '2026-03-23', 2920], [1219, 157, '2026-03-24', 3460], [1220, 157, '2026-03-27', 1550], [1003, 101, '2026-03-28', 5850]];
  const CUST = [101, 143, 146, 157];
  const CC = { 101: '#6fa2ea', 143: '#f0a247', 146: '#a48af0', 157: '#f06ba5' };
  // Вывод PostgreSQL 16: ROW_NUMBER() OVER w, SUM(amount) OVER w, LAG(order_date) OVER w, order_date - LAG(order_date) OVER w,
  // WINDOW w AS (PARTITION BY customer_id ORDER BY order_date)
  const WIN = { 1001: [1, 6770, null, null], 1002: [2, 9400, '2026-01-29', 50], 1003: [3, 15250, '2026-03-20', 8], 1161: [1, 9140, null, null], 1162: [2, 11870, '2026-02-15', 1], 1163: [3, 14790, '2026-02-16', 35], 1187: [1, 2500, null, null], 1188: [2, 5840, '2026-03-01', 6], 1189: [3, 7570, '2026-03-07', 13], 1218: [1, 4470, null, null], 1219: [2, 7930, '2026-03-11', 13], 1220: [3, 9480, '2026-03-24', 3] };
  // SELECT customer_id, SUM(amount) FROM orders WHERE … GROUP BY customer_id
  const GSUM = { 101: 15250, 143: 14790, 146: 7570, 157: 9480 };
  // порядок строк в окне: по секциям, внутри — по дате
  const PO = SC.map((r, i) => ({ r, i })).sort((a, b) => a.r[1] - b.r[1] || (a.r[2] < b.r[2] ? -1 : 1)).map(x => x.i);
  const GJ = SC.map((r, i) => [CUST.indexOf(r[1]), PO.filter(j => SC[j][1] === r[1]).indexOf(i)]);

  const GEO = {
    d: { ww: 540, wh: 430, mob: false, sqlH: 34, hy: 44, y0: 70, rh: 24, pg: 8,
      col: { cust: [0, 58], date: [64, 92], amt: [160, 62], rn: [238, 40], run: [282, 76], prev: [366, 92], gap: [462, 66] },
      head: { cust: 'customer_id', date: 'order_date', amt: 'amount', rn: 'rn', run: 'running', prev: 'prev_date', gap: 'gap_days' } },
    m: { ww: 280, wh: 438, mob: true, sqlH: 40, hy: 48, y0: 72, rh: 25, pg: 7,
      col: { cust: [0, 30], date: [33, 40], amt: [76, 46], rn: [126, 22], run: [152, 48], prev: [204, 40], gap: [248, 32] },
      head: { cust: 'cust', date: 'date', amt: 'amount', rn: 'rn', run: 'running', prev: 'prev', gap: 'gap' } }
  };
  const COLS = ['cust', 'date', 'amt', 'rn', 'run', 'prev', 'gap'];
  const SQL = [
    'SELECT customer_id, order_date, amount FROM orders',
    'SELECT customer_id, SUM(amount) FROM orders GROUP BY customer_id',
    '… OVER (PARTITION BY customer_id)',
    '… OVER (PARTITION BY customer_id ORDER BY order_date)',
    'ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS rn',
    'SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running',
    'SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running',
    'LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date',
    'order_date - LAG(order_date) OVER (…) AS gap_days',
    '… OVER w … WINDOW w AS (PARTITION BY customer_id ORDER BY order_date)'
  ];
  const CALL = ['заказы всех клиентов по дате', '12 заказов → 4 итога по клиентам', '4 секции, все 12 строк на месте', 'даты по возрастанию', 'новая секция — счёт с 1', 'рамка: от начала секции до текущей строки', 'последний итог секции = GROUP BY', 'первый заказ клиента: прошлого нет → NULL', '143: через 1 день, потом через 35', '12 строк вошло — 12 вышло'];

  const scene = {
    parts: [{ n: '01', name: 'Таблица', s: [0] }, { n: '02', name: 'GROUP BY', s: [1] }, { n: '03', name: 'Секции', s: [2, 3] }, { n: '04', name: 'Номер и итог', s: [4, 5, 6] }, { n: '05', name: 'Соседи', s: [7, 8] }, { n: '06', name: 'Итог', s: [9] }],
    steps: [
      { title: "Двенадцать заказов четырёх клиентов", dur: 3000, body: "<p>В выборке оплаченные заказы четырёх клиентов за январь–март 2026 года. Пока заказы всех клиентов показаны в одном списке по дате.</p><p>Для каждого заказа найдём его порядковый номер у клиента, сумму покупок клиента к этому моменту и дату предыдущей покупки.</p>" },
      { title: "После GROUP BY одна строка на клиента", dur: 3400, body: "<p>Сгруппируем заказы по <b>customer_id</b> и сложим суммы. Вместо 12 строк получим четыре, по одной на клиента.</p><p>Такой отчёт показывает общий итог, но в нём уже не видно дату и сумму отдельного заказа.</p>" },
      { title: "PARTITION BY сохраняет отдельные заказы", dur: 3200, body: "<p>Теперь укажем <b>PARTITION BY customer_id</b> внутри OVER. Расчёт будет выполняться отдельно для каждого из четырёх клиентов.</p><p>В результате по-прежнему 12 строк, и у каждого заказа остаются своя дата и сумма.</p>" },
      { title: "Порядок покупок внутри секции", dur: 2800, body: "<p>Отсортируем покупки каждого клиента по дате. У клиента № 101 первой будет покупка 29 января, затем идут заказы от 20 и 28 марта.</p><p>В этой выборке даты покупок каждого клиента различаются. Если бы даты совпадали, для однозначного порядка понадобился бы ещё один ключ, например номер заказа.</p>" },
      { title: "ROW_NUMBER нумерует покупки клиента", dur: 4200, body: "<p>Для заказов клиента № 101 функция <b>ROW_NUMBER()</b> возвращает 1, 2 и 3 в порядке покупки.</p><p>В секции клиента № 143 нумерация начинается заново: его первый заказ тоже получает номер 1.</p>" },
      { title: "Сколько клиент потратил к каждой покупке", dur: 4600, body: "<p>В рамку для <b>SUM(amount)</b> входят покупки клиента от первой до текущей. В нашей выборке у каждого клиента не больше одной покупки в день.</p><p>У клиента № 101 первая покупка стоила 6 770 ₽, вторая — 2 630 ₽. К моменту второй покупки накопленная сумма равна 9 400 ₽.</p>" },
      { title: "Итог после последнего заказа", dur: 3200, body: "<p>В последней строке каждого клиента учтены все его покупки. Накопленные суммы совпадают с итогами GROUP BY: 15 250, 14 790, 7 570 и 9 480 ₽.</p><p>При этом в отчёте остаются и предыдущие заказы. Можно увидеть, из каких покупок сложился каждый итог.</p>" },
      { title: "LAG возвращает дату предыдущей покупки", dur: 4200, body: "<p><b>LAG(order_date)</b> берёт дату из предыдущей строки клиента в порядке, заданном в окне.</p><p>У первой покупки в выборке предыдущей строки нет. Для неё LAG по умолчанию вернёт NULL.</p>" },
      { title: "Сколько дней прошло между покупками", dur: 4000, body: "<p>В PostgreSQL при вычитании одной даты из другой получается число дней. Вычтем из даты заказа дату предыдущей покупки.</p><p>Клиент № 143 сделал вторую покупку через день после первой, а третью — через 35 дней после второй.</p>" },
      { title: "У каждого из 12 заказов теперь три показателя", dur: 3600, next: 'Читать страницу', body: "<p>У каждого заказа видны его номер у клиента, накопленная сумма покупок и дата предыдущего заказа. В отчёте осталось 12 строк.</p><p>Все три функции используют одинаковые секции и порядок. Их можно описать один раз в WINDOW.</p>" }
    ],
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'parts', label: 'Секций' }, { id: 'frame', label: 'В рамке' }],
    legend: '<span><i class="sq" style="background:#1b2a44"></i>секция</span><span><i style="background:#36b8a6"></i>строка и рамка</span><span><i style="background:#e3c04d"></i>источник LAG</span>',
    info: 'ОКНО ПО КЛИЕНТАМ',
    aiNote: 'В анимации учебная база shop: 12 оплаченных заказов клиентов 101, 143, 146, 157 за январь–март 2026. При группировке по customer_id получается 4 строки с суммами 15 250, 14 790, 7 570, 9 480 ₽. Окно PARTITION BY customer_id ORDER BY order_date оставляет все 12 строк: ROW_NUMBER даёт 1, 2, 3 в каждой секции, SUM(amount) — нарастающий итог (у клиента 101: 6 770, 9 400, 15 250), LAG(order_date) — дату прошлого заказа (у первого заказа NULL), order_date − LAG(order_date) — дни между заказами (у 143: 1 и 35).',
    mount(root, api) {
      root.innerHTML = '<div class="wx"><div class="wx-w"></div></div>';
      const box = root.firstChild, w = box.firstChild;
      const mk = (cls, html, cc) => { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; if (cc) d.style.setProperty('--cc', cc); w.appendChild(d); d._c = {}; return d; };
      const cellsHtml = vals => COLS.map((c, n) => `<span class="wx-c wx-${c}">${vals[n]}</span>`).join('');
      const bands = CUST.map(c => mk('wx-band', '', CC[c]));
      const frameEl = mk('wx-frame');
      const sqlEl = mk('wx-sql');
      const hd = mk('wx-row wx-hd', cellsHtml(COLS.map(() => '')));
      const rows = SC.map(r => mk('wx-row', cellsHtml([r[1], '', fmtN(r[3]), WIN[r[0]][0], fmtN(WIN[r[0]][1]), '', WIN[r[0]][3] == null ? 'NULL' : WIN[r[0]][3]]), CC[r[1]]));
      const grp = CUST.map(c => mk('wx-row wx-grp', cellsHtml([c, '3 заказа', fmtN(GSUM[c]), '', '', '', '']), CC[c]));
      const tags = CUST.map(c => mk('wx-tag', `= ${fmtN(GSUM[c])}`));
      const call = mk('wx-call');
      const fly = mk('wx-fly');
      const rowCells = el => COLS.reduce((o, c) => { o[c] = el.querySelector('.wx-' + c); return o; }, {});
      const RC = rows.map(rowCells), HC = rowCells(hd);

      let G = GEO.d, scale = 1, sig = '', dirty = true, sqlK = -1;
      const layout = () => {
        // ширина столбцов и тексты, зависящие от раскладки
        [HC].concat(RC, grp.map(rowCells)).forEach(cs => COLS.forEach(c => { const [x, wd] = G.col[c]; cs[c].style.left = x + 'px'; cs[c].style.width = wd + 'px'; }));
        COLS.forEach(c => { HC[c].textContent = G.head[c]; });
        const dt = d => d == null ? 'NULL' : G.mob ? d.slice(5) : d;
        SC.forEach((r, i) => { RC[i].date.textContent = dt(r[2]); RC[i].prev.textContent = dt(WIN[r[0]][2]); });
        grp.forEach(el => { el.querySelector('.wx-date').textContent = G.mob ? '× 3' : '3 заказа'; });
        w.classList.toggle('wx-mob', G.mob);
      };
      const fit = () => {
        const W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
        const g = W < 460 ? GEO.m : GEO.d;
        if (g !== G) { G = g; layout(); sqlK = -1; }
        scale = Math.min(W / G.ww, H / G.wh, 1.12);
        w.style.width = G.ww + 'px'; w.style.height = G.wh + 'px';
        w.style.transform = `translate(${((W - G.ww * scale) / 2).toFixed(1)}px, ${((H - G.wh * scale) / 2).toFixed(1)}px) scale(${scale.toFixed(4)})`;
        dirty = true;
      };
      layout();
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box);
      fit();

      const set = (el, x, y, o, wd, ht) => {
        const c = el._c, t = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
        if (c.t !== t) { el.style.transform = t; c.t = t; }
        const op = o <= 0.001 ? '0' : o >= 0.999 ? '1' : o.toFixed(3);
        if (c.o !== op) { el.style.opacity = op; el.style.visibility = op === '0' ? 'hidden' : 'visible'; c.o = op; }
        if (wd != null && c.w !== wd) { el.style.width = wd + 'px'; c.w = wd; }
        if (ht != null && c.h !== ht) { el.style.height = ht + 'px'; c.h = ht; }
      };
      const cls = (el, name, on) => { const c = el._c || (el._c = {}); if (c[name] !== on) { el.classList.toggle(name, on); c[name] = on; } };
      const vis = (el, on) => { const c = el._c || (el._c = {}); if (c.v !== on) { el.style.opacity = on ? '1' : '0'; c.v = on; } };

      const yCH = i => G.y0 + i * G.rh;
      const yG = g => G.y0 + g * G.rh;
      const yP = (g, j) => G.y0 + g * (3 * G.rh + G.pg) + j * G.rh;
      const bottom = () => yP(3, 3) + 12;
      const rowW = () => G.col.gap[0] + G.col.gap[1];

      return {
        render(k, p) {
          const trav = k === 4 || k === 5 || k === 7 || k === 8;
          const q = seg(p, .04, .94) * 12;
          const cur = trav ? Math.min(11, Math.floor(q)) : -1, sub = trav ? (q >= 12 ? 1 : q - cur) : 1;
          const curRow = cur >= 0 ? PO[cur] : -1;
          // счётчики
          const grouped = k === 1 && p >= .55;
          api.hud('rows', grouped ? '4' : '12', grouped ? 'GROUP BY' : k >= 2 ? 'OVER' : '');
          api.hud('parts', k === 0 || (k === 1 && !grouped) ? '—' : '4', k === 1 ? 'группы' : k >= 2 ? 'секции' : '');
          const fr = k === 5 ? GJ[curRow][1] + 1 : k === 6 ? 3 : 0;
          api.hud('frame', fr ? String(fr) : '—', fr ? api.plural(fr, ['строка', 'строки', 'строк']) : k === 4 || k === 7 || k === 8 ? 'не нужна' : '');

          const key = [k, Math.round(p * 300), G.mob].join('|');
          if (key === sig && !dirty) return; sig = key; dirty = false;
          if (sqlK !== k) { sqlEl.innerHTML = api.hl(SQL[k], 'sql'); sqlK = k; }
          set(sqlEl, 0, 0, 1, G.ww, G.sqlH);
          set(hd, 0, G.hy, 1, rowW(), 22);
          COLS.forEach((c, n) => vis(HC[c], n < 3 || (c === 'rn' && k >= 4) || (c === 'run' && k >= 5) || (c === 'prev' && k >= 7) || (c === 'gap' && k >= 8)));
          cls(HC.date, 'on', k === 3);

          // полосы секций
          const bo = k < 2 ? 0 : k === 2 ? seg(p, .45, .75) : 1;
          bands.forEach((b, g) => set(b, -6, yP(g, 0) - 2, bo, rowW() + 12, 3 * G.rh + 4));

          // строки
          SC.forEach((r, i) => {
            const el = rows[i], cs = RC[i], [g, j] = GJ[i], idx = PO.indexOf(i);
            let y = yP(g, j), op = 1;
            if (k === 0) { y = yCH(i); op = seg(p, i * .03, i * .03 + .25); }
            else if (k === 1) { const t = ease(seg(p, .05, .45)); y = lerp(yCH(i), yG(g), t); op = 1 - seg(p, .38, .52); }
            else if (k === 2) { const t = ease(seg(p, .1, .6)); y = lerp(yG(g), yP(g, j), t); op = seg(p, .12, .3); }
            set(el, 0, y, op, rowW(), G.rh - 2);
            vis(cs.rn, k > 4 || (k === 4 && idx <= cur));
            vis(cs.run, k > 5 || (k === 5 && idx <= cur));
            vis(cs.prev, k > 7 || (k === 7 && (idx < cur || (idx === cur && sub > (j ? .78 : .3)))));
            vis(cs.gap, k > 8 || (k === 8 && idx <= cur));
            cls(el, 'cur', i === curRow);
            cls(cs.rn, 'hot', k === 4 && i === curRow);
            cls(cs.run, 'hot', k === 5 && i === curRow);
            cls(cs.prev, 'hot', k === 7 && i === curRow);
            cls(cs.gap, 'hot', k === 8 && i === curRow);
            cls(cs.run, 'tot', k === 6 && j === 2);
            cls(cs.date, 'on', k === 3 || (k === 8 && i === curRow));
            cls(cs.prev, 'on', k === 8 && i === curRow);
            // источник LAG: строка перед текущей в той же секции
            const src = (k === 7) && curRow >= 0 && GJ[curRow][1] > 0 && PO[cur - 1] === i;
            cls(cs.date, 'src', src);
            cls(cs.prev, 'nul', WIN[r[0]][2] == null);
            cls(cs.gap, 'nul', WIN[r[0]][3] == null);
          });
          // свёрнутые группы
          grp.forEach((el, g) => set(el, 0, yG(g), k === 1 ? seg(p, .52, .68) : k === 2 ? 1 - seg(p, 0, .12) : 0, rowW(), G.rh - 2));

          // рамка нарастающего итога
          if (k === 5 && curRow >= 0) {
            const [g, j] = GJ[curRow];
            set(frameEl, -4, yP(g, 0) - 1, 1, G.col.run[0] + G.col.run[1] + 8, (j + 1) * G.rh);
          } else set(frameEl, frameEl._c.x || 0, 0, 0);
          // теги итогов
          tags.forEach((t, g) => set(t, G.col.prev[0], yP(g, 2) + 2, k === 6 ? seg(p, .25 + g * .08, .45 + g * .08) : 0));

          // LAG: дата предыдущей строки перелетает в prev_date текущей
          let fo = 0, fx = 0, fy = 0;
          if (k === 7 && curRow >= 0 && GJ[curRow][1] > 0) {
            const [g, j] = GJ[curRow], t = ease(seg(sub, .12, .78));
            fx = lerp(G.col.date[0], G.col.prev[0], t); fy = lerp(yP(g, j - 1), yP(g, j), t);
            fo = sub < .78 ? 1 : 0;
            const txt = G.mob ? WIN[SC[curRow][0]][2].slice(5) : WIN[SC[curRow][0]][2];
            if (fly._c.txt !== txt) { fly.textContent = txt; fly._c.txt = txt; }
          }
          set(fly, fx, fy, fo, G.col.date[1], G.rh - 2);
          // выноска
          const txt = CALL[k];
          if (call._c.txt !== txt) { call.textContent = txt; call._c.txt = txt; }
          let cx = 0, cy = bottom();
          if (k === 0) cy = yCH(12) + 10;
          else if (k === 1) { cx = G.col.rn[0]; cy = yG(1) + 2; }
          else if (k === 2 || k === 3) { cx = G.col.rn[0]; cy = yP(0, 1) + 2; }
          if (G.mob && k >= 1 && k <= 3) { cx = 0; cy = k === 1 ? yG(4) + 10 : bottom(); }
          set(call, cx, cy, seg(p, .35, .5));
        }
      };
    }
  };

  /*win:start*/
  // Учебная выборка интерактива: оплаченные заказы бренда «Сова» за 1–7 марта 2026, 11 строк.
  // SELECT order_id, order_date, channel, amount FROM orders
  // WHERE status = 'paid' AND brand = 'Сова' AND order_date BETWEEN '2026-03-01' AND '2026-03-07';
  // Строки лежат в порядке order_id: в этом порядке их читает PostgreSQL.
  const WR = [[1053, '2026-03-01', 'рассылка', 1120], [1071, '2026-03-06', 'реклама', 7480], [1152, '2026-03-04', 'органика', 1120], [1153, '2026-03-06', 'рассылка', 8030], [1154, '2026-03-07', 'органика', 450], [1168, '2026-03-01', 'рассылка', 450], [1169, '2026-03-04', 'реклама', 10020], [1181, '2026-03-06', 'реклама', 2500], [1187, '2026-03-01', 'реклама', 2500], [1188, '2026-03-07', 'органика', 3340], [1209, '2026-03-05', 'реклама', 1120]]
    .map(([id, d, ch, a]) => ({ id, d, ch, a, day: Math.round(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5) }));
  const ORD = { none: [], date: [r => r.day], date_id: [r => r.day, r => r.id], amount: [r => -r.a] };   // amount DESC — ключ с минусом
  // Порядок, в котором PostgreSQL 16 расставил строки на этой выборке (по ROW_NUMBER для каждой пары PARTITION BY и ORDER BY).
  // Равные по ORDER BY строки он ставит как получится при сортировке: это и есть «порядок не гарантирован».
  const PG_ORDER = {
    'none|none': [1053, 1071, 1152, 1153, 1154, 1168, 1169, 1181, 1187, 1188, 1209],
    'none|date': [1053, 1168, 1187, 1169, 1152, 1209, 1181, 1153, 1071, 1154, 1188],
    'none|date_id': [1053, 1168, 1187, 1152, 1169, 1209, 1071, 1153, 1181, 1154, 1188],
    'none|amount': [1169, 1153, 1071, 1188, 1181, 1187, 1053, 1152, 1209, 1154, 1168],
    'channel|none': [1188, 1154, 1152, 1053, 1153, 1168, 1169, 1181, 1187, 1071, 1209],
    'channel|date': [1152, 1154, 1188, 1053, 1168, 1153, 1187, 1169, 1209, 1181, 1071],
    'channel|date_id': [1152, 1154, 1188, 1053, 1168, 1153, 1187, 1169, 1209, 1071, 1181],
    'channel|amount': [1188, 1152, 1154, 1153, 1053, 1168, 1169, 1071, 1181, 1187, 1209]
  };
  const pgTie = st => { const o = {}; PG_ORDER[st.part + '|' + st.ord].forEach((id, i) => { o[id] = i; }); return o; };
  const OFF_UNIT = { date: 1, amount: 1000 };          // N дней для даты, N × 1000 ₽ для суммы
  const ORDER_DEP = { rn: 1, lag: 1, lead: 1 };        // ответ зависит от порядка строк, рамка не влияет
  const cmpK = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1; return 0; };

  // Текст оконного выражения, как его пишут в SELECT: по нему же интерактив сверялся с PostgreSQL
  const FN_SQL = { rn: 'ROW_NUMBER()', rank: 'RANK()', dense: 'DENSE_RANK()', sum: 'SUM(amount)', avg: 'AVG(amount)', lag: 'LAG(amount)', lead: 'LEAD(amount)' };
  const ORD_SQL = { none: '', date: 'order_date', date_id: 'order_date, order_id', amount: 'amount DESC' };
  function winOff(st) {
    if (st.mode === 'rows') return String(st.n);
    if (st.ord === 'amount') return String(st.n * 1000);
    return `INTERVAL '${st.n} ${st.n === 1 ? 'day' : 'days'}'`;
  }
  function winFrameSql(st) {
    if (st.mode === 'def') return '';
    const s = st.start === 'up' ? 'UNBOUNDED PRECEDING' : st.start === 'np' ? `${winOff(st)} PRECEDING` : 'CURRENT ROW';
    const e = st.end === 'uf' ? 'UNBOUNDED FOLLOWING' : st.end === 'nf' ? `${winOff(st)} FOLLOWING` : 'CURRENT ROW';
    return `${st.mode.toUpperCase()} BETWEEN ${s} AND ${e}`;
  }
  function winSql(st, sep = ' ') {
    const parts = [st.part === 'channel' ? 'PARTITION BY channel' : '', st.ord !== 'none' ? `ORDER BY ${ORD_SQL[st.ord]}` : '', winFrameSql(st)].filter(Boolean);
    return `${FN_SQL[st.fn]} OVER (${parts.join(sep)})`;
  }

  // Ошибки PostgreSQL 16 для неверной рамки (сверено запуском)
  function winError(st) {
    if (st.mode === 'range' && (st.start === 'np' || st.end === 'nf') && ORD[st.ord].length !== 1)
      return 'RANGE with offset PRECEDING/FOLLOWING requires exactly one ORDER BY column';
    return null;
  }

  // Одно вычисление окна при заданном порядке равных строк (perm: id → место среди равных)
  function winRun(st, perm) {
    const keys = ORD[st.ord];
    const kv = r => keys.map(f => f(r));
    const groups = new Map();
    WR.forEach(r => { const p = st.part === 'channel' ? r.ch : ''; if (!groups.has(p)) groups.set(p, []); groups.get(p).push(r); });
    const parts = [...groups.keys()].sort().map(p => groups.get(p).slice().sort((x, y) => cmpK(kv(x), kv(y)) || (perm[x.id] - perm[y.id])));
    const res = {}, frame = {}, pos = {}, target = {};
    parts.forEach((P, pi) => {
      const K = P.map(kv);
      const peerLo = i => { let j = i; while (j > 0 && cmpK(K[j - 1], K[i]) === 0) j--; return j; };
      const peerHi = i => { let j = i; while (j < P.length - 1 && cmpK(K[j + 1], K[i]) === 0) j++; return j; };
      P.forEach((r, i) => {
        pos[r.id] = [pi, i];
        if (st.fn === 'rn') res[r.id] = i + 1;
        else if (st.fn === 'rank') res[r.id] = peerLo(i) + 1;
        else if (st.fn === 'dense') { let n = 1; for (let j = 1; j <= i; j++) if (cmpK(K[j], K[j - 1]) !== 0) n++; res[r.id] = n; }
        else if (st.fn === 'lag') { res[r.id] = i > 0 ? P[i - 1].a : null; target[r.id] = i > 0 ? P[i - 1].id : null; }
        else if (st.fn === 'lead') { res[r.id] = i < P.length - 1 ? P[i + 1].a : null; target[r.id] = i < P.length - 1 ? P[i + 1].id : null; }
        // рамка: для агрегатов — по настройке, для ранжирования и LAG/LEAD не используется
        let lo, hi;
        const mode = st.mode === 'def' ? 'range' : st.mode, s = st.mode === 'def' ? 'up' : st.start, e = st.mode === 'def' ? 'cr' : st.end;
        if (mode === 'rows') {
          lo = s === 'up' ? 0 : s === 'np' ? Math.max(0, i - st.n) : i;
          hi = e === 'uf' ? P.length - 1 : e === 'nf' ? Math.min(P.length - 1, i + st.n) : i;
        } else {
          const off = st.n * (OFF_UNIT[st.ord] || 1), v = K[i][0];
          lo = s === 'up' ? 0 : s === 'cr' ? peerLo(i) : P.findIndex((x, j) => K[j][0] >= v - off);
          if (e === 'uf') hi = P.length - 1;
          else if (e === 'cr') hi = peerHi(i);
          else { hi = i; while (hi < P.length - 1 && K[hi + 1][0] <= v + off) hi++; }
        }
        frame[r.id] = P.slice(lo, hi + 1).map(x => x.id);
        if (st.fn === 'sum' || st.fn === 'avg') {
          const vals = P.slice(lo, hi + 1).map(x => x.a), s0 = vals.reduce((a, b) => a + b, 0);
          res[r.id] = st.fn === 'sum' ? s0 : s0 / vals.length;
        }
      });
    });
    return { parts, res, frame, pos, target };
  }

  // Полный расчёт: результат при порядке PostgreSQL и пометки, где ответ зависит от порядка равных строк
  function winCalc(st) {
    const err = winError(st);
    if (err) return { err };
    const base = winRun(st, pgTie(st));
    const unstable = {};
    const keys = ORD[st.ord];
    const orderDep = ORDER_DEP[st.fn] || ((st.fn === 'sum' || st.fn === 'avg') && st.mode === 'rows' && !(st.start === 'up' && st.end === 'uf'));
    if (orderDep) {
      if (!keys.length) WR.forEach(r => { const P = base.parts[base.pos[r.id][0]]; if (P.length > 1) unstable[r.id] = true; });
      else {
        // перебираем все перестановки равных строк внутри каждой секции
        const kv = r => keys.map(f => f(r)).join('|');
        const tieGroups = [];
        base.parts.forEach(P => { const m = new Map(); P.forEach(r => { const k = kv(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r.id); }); m.forEach(g => { if (g.length > 1) tieGroups.push(g); }); });
        const perms = a => a.length <= 1 ? [a] : a.flatMap((x, i) => perms(a.slice(0, i).concat(a.slice(i + 1))).map(p => [x].concat(p)));
        let combos = [{}];
        tieGroups.forEach(g => { const ps = perms(g); combos = combos.flatMap(c => ps.map(p => { const o = Object.assign({}, c); p.forEach((id, j) => { o[id] = j; }); return o; })); });
        combos.forEach(c => { const R = winRun(st, c); WR.forEach(r => { if (R.res[r.id] !== base.res[r.id]) unstable[r.id] = true; }); });
      }
    }
    return Object.assign(base, { unstable });
  }
  /*win:end*/


  /* ===================== Интерактив «Окно на таблице» ===================== */
  const FN_LBL = { rn: 'ROW_NUMBER', rank: 'RANK', dense: 'DENSE_RANK', sum: 'SUM', avg: 'AVG', lag: 'LAG', lead: 'LEAD' };
  const FN_COL = { rn: 'row_number', rank: 'rank', dense: 'dense_rank', sum: 'sum', avg: 'avg', lag: 'lag', lead: 'lead' };
  const ORD_LBL = { none: 'нет', date: 'order_date', date_id: 'order_date, order_id', amount: 'amount DESC' };
  const MODE_LBL = { def: 'по умолчанию', rows: 'ROWS', range: 'RANGE' };
  const START_LBL = { up: 'UNBOUNDED PRECEDING', np: 'N PRECEDING', cr: 'CURRENT ROW' };
  const END_LBL = { cr: 'CURRENT ROW', nf: 'N FOLLOWING', uf: 'UNBOUNDED FOLLOWING' };
  const isAgg = fn => fn === 'sum' || fn === 'avg';
  const OKC = { none: [], date: ['date'], date_id: ['date', 'id'], amount: ['am'] };   // столбцы ORDER BY в таблице

  function buildWin(box, api) {
    const { $, esc, hl, plural, fmt, reduced } = api;
    const vf = (fn, v) => v == null ? 'NULL' : fn === 'avg' ? fmt(v, 2) : fmt(v);
    const rowsW = n => `${n}&nbsp;${plural(n, ['строка', 'строки', 'строк'])}`;
    const seg = (id, label, opts) => `<span class="ow-grp"><span class="ow-lb">${label}</span><span class="seg" role="group" aria-label="${esc(label)}" id="${id}">${Object.entries(opts).map(([k, t]) => `<button type="button" data-k="${k}">${esc(t)}</button>`).join('')}</span></span>`;
    box.innerHTML = `<div class="block-hd"><span class="t">Окно решает, какие строки видит функция <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="ow-reset">Сбросить</button></div></div>
<p class="hint ow-do">Соберите окно и&nbsp;выберите строку щелчком или клавишами ↑ ↓: подсветка покажет её секцию и&nbsp;рамку, справа — расчёт.</p>
<div class="ow-ctl">${seg('ow-fn', 'функция', FN_LBL)}${seg('ow-part', 'PARTITION BY', { none: 'нет', channel: 'channel' })}${seg('ow-ord', 'ORDER BY', ORD_LBL)}${seg('ow-mode', 'рамка', MODE_LBL)}${seg('ow-start', 'от', START_LBL)}${seg('ow-end', 'до', END_LBL)}<span class="ow-grp"><span class="ow-lb">N</span><span class="seg" role="group" aria-label="N" id="ow-n"><button type="button" data-k="1">1</button><button type="button" data-k="2">2</button><button type="button" data-k="3">3</button></span><span class="ow-unit" id="ow-unit"></span></span></div>
<pre class="ow-sql" id="ow-sql"></pre>
<div class="stage"><div class="ow-main"><div class="ow-scroll"><table class="ow-t"><thead><tr><th id="ow-h-id">order_id</th><th id="ow-h-date">order_date</th><th id="ow-h-ch">channel</th><th id="ow-h-am">amount</th><th id="ow-h-res"></th></tr></thead><tbody id="ow-body"></tbody></table></div>
<p class="ow-leg"><span><i class="ow-li"></i>рамка выбранной строки</span><span><i class="ow-lp"></i>равные ей по&nbsp;ORDER BY</span><span><i class="ow-lt"></i>откуда берёт LAG или LEAD</span><span><b>*</b> ответ зависит от&nbsp;порядка равных строк</span></p></div>
<div class="narr"><p class="cap" id="ow-cap"></p><div class="readout ow-ro"><div><span class="big" id="ow-v"></span><span class="lbl" id="ow-vl"></span></div><div><span class="big" id="ow-f"></span><span class="lbl" id="ow-fl"></span></div></div><div class="narr-text" id="ow-msg"></div><p class="cap">Задания</p><ol class="ow-tasks" id="ow-tasks"></ol></div></div>
<div class="status"><span><span class="dot live" id="ow-dot"></span><span id="ow-s1"></span></span><span id="ow-s2"></span><span class="grow"></span><span id="ow-s3"></span></div>`;

    const TASKS = [
      { t: 'Получите у заказа 1053 нарастающий итог 1 120 ₽ без звёздочки.', ok: (st, R) => st.fn === 'sum' && st.ord !== 'none' && (st.mode === 'def' || (st.start === 'up' && st.end === 'cr')) && R.res[1053] === 1120 && !R.unstable[1053] },
      { t: 'Выберите для заказа № 1169 все каналы и период со 2 по 4 марта включительно. Выручка за эти три дня должна составить 11 140 ₽.', ok: (st, R) => st.fn === 'sum' && st.part === 'none' && st.ord === 'date' && st.mode === 'range' && st.start === 'np' && st.end === 'cr' && st.n === 2 && R.res[1169] === 11140 },
      { t: 'Присвойте заказу № 1209 шестое место среди различных сумм заказов. Сортируйте суммы по убыванию.', ok: (st, R) => st.fn === 'dense' && st.ord === 'amount' && st.part === 'none' && R.res[1209] === 6 }
    ];
    let s;
    const fresh = () => ({ fn: 'sum', part: 'none', ord: 'date', mode: 'def', start: 'up', end: 'cr', n: 2, sel: 1053, done: [false, false, false] });
    const byId = id => WR.find(r => r.id === id);

    function explain(st, R) {
      const sel = st.sel, r = byId(sel);
      if (R.err) return `<b class="ow-err">ERROR: ${esc(R.err)}</b><br>Границу RANGE со&nbsp;смещением считают по&nbsp;значению столбца сортировки, поэтому он должен быть ровно один, ${st.ord === 'none' ? 'а&nbsp;ORDER BY здесь нет' : 'а&nbsp;здесь их два'}. Выберите order_date или amount DESC либо режим ROWS.`;
      const [pi, i] = R.pos[sel], P = R.parts[pi];
      const kv = x => ORD[st.ord].map(f => f(x)).join('|');
      const peers = st.ord === 'none' ? P.length : P.filter(x => kv(x) === kv(r)).length;
      const v = vf(st.fn, R.res[sel]);
      const noFrame = st.mode !== 'def' ? ' Результат этой функции не зависит от границ рамки.' : '';
      let t = '';
      if (st.fn === 'rn') t = `ROW_NUMBER нумерует строки секции по&nbsp;порядку ORDER BY: у&nbsp;${sel} номер ${v}.${noFrame}`;
      else if (st.fn === 'rank') { const lo = P.findIndex(x => kv(x) === kv(r)); t = `RANK — номер первой строки в&nbsp;группе с одинаковым ключом сортировки. Перед этой группой ${rowsW(lo)}, значит ${v}.${peers > 1 ? ` Тот&nbsp;же ранг у&nbsp;всех ${peers} равных строк, а&nbsp;следующие места пропускаются.` : ''}${noFrame}`; }
      else if (st.fn === 'dense') t = `DENSE_RANK считает группы равных по&nbsp;порядку: группа заказа ${sel} — ${v}-я, места идут без пропусков.${noFrame}`;
      else if (st.fn === 'lag' || st.fn === 'lead') {
        const tg = R.target[sel], w = st.fn === 'lag' ? 'предыдущей' : 'следующей';
        t = tg != null ? `${FN_LBL[st.fn]}(amount) берёт amount ${w} строки секции — заказа ${tg}: ${v}.` : `У&nbsp;${st.fn === 'lag' ? 'первой' : 'последней'} строки секции ${w} нет, и&nbsp;${FN_LBL[st.fn]} возвращает NULL.`;
        t += noFrame;
      } else {
        const fr = R.frame[sel], vals = fr.map(id => byId(id).a), sum = vals.reduce((a, b) => a + b, 0);
        let d;
        if (st.mode === 'def') d = st.ord === 'none' ? 'Без ORDER BY все строки секции равны друг другу, и&nbsp;рамка по&nbsp;умолчанию — вся секция.' : `Рамка по&nbsp;умолчанию — RANGE от&nbsp;начала секции до&nbsp;последней строки, равной текущей по&nbsp;${ORD_SQL[st.ord]}.`;
        else if (st.mode === 'rows') d = 'ROWS отсчитывает границы в&nbsp;строках.';
        else d = st.ord === 'none' ? 'RANGE без ORDER BY: все строки равны, и&nbsp;CURRENT ROW — это вся секция.' : `RANGE отсчитывает границы по&nbsp;значению ${ORD_SQL[st.ord]}${st.ord === 'amount' && (st.start === 'np' || st.end === 'nf') ? ': при DESC «назад» значит «дороже»' : ''}.`;
        if (st.ord !== 'none' && peers > 1) d += ` С тем же ключом сортировки, что у заказа ${sel} строк — ${peers}${st.mode === 'rows' ? ', при ROWS границы отсчитываются по отдельным строкам' : ', и&nbsp;в&nbsp;рамку они входят вместе'}.`;
        const terms = vals.length <= 6 ? vals.map(x => fmt(x)).join(' + ') : `${vals.length} сумм`;
        t = `${d}<br>${st.fn === 'sum' ? `${terms} = ${fmt(sum)}` : `(${terms}) / ${vals.length} = ${v}`}`;
      }
      if (R.unstable[sel]) t += '<br><b>*</b> Ответ зависит от&nbsp;того, в каком порядке база обработала строки с одинаковым ключом. Для однозначного результата уточните ORDER BY.';
      return t;
    }

    function draw(flip) {
      const st = s, R = winCalc(st);
      const L = R.err ? winRun(Object.assign({}, st, { mode: 'def' }), pgTie(st)) : R;
      if (!R.err) TASKS.forEach((t, n) => { if (t.ok(st, R)) s.done[n] = true; });
      ['fn', 'part', 'ord', 'mode', 'start', 'end', 'n'].forEach(k => box.querySelectorAll(`#ow-${k} button`).forEach(b => b.setAttribute('aria-pressed', String(String(st[k]) === b.dataset.k))));
      const frameOn = st.mode !== 'def', usesN = frameOn && (st.start === 'np' || st.end === 'nf');
      box.querySelectorAll('#ow-start button, #ow-end button').forEach(b => { b.disabled = !frameOn; });
      box.querySelectorAll('#ow-n button').forEach(b => { b.disabled = !usesN; });
      $('ow-unit').textContent = !usesN ? '' : st.mode === 'rows' ? plural(st.n, ['строка', 'строки', 'строк']) : st.ord === 'date' ? plural(st.n, ['день', 'дня', 'дней']) : st.ord === 'amount' ? '× 1 000 ₽' : '';
      $('ow-sql').innerHTML = hl(winSql(st), 'sql');
      $('ow-h-res').textContent = FN_COL[st.fn];
      $('ow-h-ch').classList.toggle('pk', st.part === 'channel');
      $('ow-h-date').classList.toggle('ok', st.ord === 'date' || st.ord === 'date_id');
      $('ow-h-id').classList.toggle('ok', st.ord === 'date_id');
      $('ow-h-am').classList.toggle('ok', st.ord === 'amount');

      // таблица в том порядке, в каком строки видит окно
      const [spi, si] = L.pos[st.sel], SP = L.parts[spi];
      const kv = x => ORD[st.ord].map(f => f(x)).join('|'), selK = kv(byId(st.sel));
      const peerLo = SP.findIndex(x => kv(x) === selK);
      const frameSet = !R.err && isAgg(st.fn) ? new Set(R.frame[st.sel]) : new Set();
      const body = $('ow-body');
      const old = {};
      if (flip && !reduced()) body.querySelectorAll('tr[data-id]').forEach(tr => { old[tr.dataset.id] = tr.getBoundingClientRect().top; });
      body.innerHTML = L.parts.map((P, pi) => {
        const head = st.part === 'channel' ? `<tr class="ow-ph${pi !== spi ? ' ow-out' : ''}"><td colspan="5">channel = ${esc(P[0].ch)} · ${rowsW(P.length)}</td></tr>` : '';
        return head + P.map((r, i) => {
          const c = [];
          if (pi !== spi) c.push('ow-out');
          if (r.id === st.sel) c.push('ow-cur');
          if (!R.err && pi === spi) {
            if (frameSet.has(r.id)) c.push('ow-in');
            if (st.fn === 'rn' && i < si) c.push('ow-in');
            if ((st.fn === 'rank' || st.fn === 'dense') && i < peerLo) c.push('ow-in');
            if ((st.fn === 'lag' || st.fn === 'lead') && R.target[st.sel] === r.id) c.push('ow-tgt');
          }
          const peer = st.ord !== 'none' && pi === spi && kv(r) === selK && SP.filter(x => kv(x) === selK).length > 1;
          if (peer) c.push('ow-peer');
          const res = R.err ? '—' : `${vf(st.fn, R.res[r.id])}${R.unstable[r.id] ? '<sup>*</sup>' : ''}`;
          const ok = c2 => OKC[st.ord].includes(c2) ? ' ow-ok' : '';
          return `<tr data-id="${r.id}" tabindex="0" class="${c.join(' ')}" aria-label="Заказ ${r.id}"><td class="${ok('id')}">${r.id}</td><td class="dt${ok('date')}"><span class="ow-y">2026-</span>${r.d.slice(5)}</td><td class="${st.part === 'channel' ? 'ow-pc' : ''}">${esc(r.ch)}</td><td class="ow-n${ok('am')}">${fmt(r.a)}</td><td class="ow-n ow-r${R.res && R.res[r.id] == null && !R.err ? ' ow-null' : ''}">${res}</td></tr>`;
        }).join('');
      }).join('');
      if (flip && !reduced()) body.querySelectorAll('tr[data-id]').forEach(tr => {
        const o = old[tr.dataset.id]; if (o == null) return;
        const dy = o - tr.getBoundingClientRect().top; if (Math.abs(dy) < 1) return;
        tr.style.transition = 'none'; tr.style.transform = `translateY(${dy}px)`;
        requestAnimationFrame(() => { tr.style.transition = 'transform .35s ease'; tr.style.transform = ''; });
      });

      // разбор справа
      const r = byId(st.sel);
      $('ow-cap').textContent = `Заказ ${r.id} · ${r.d.slice(8).replace(/^0/, '')} марта · ${r.ch} · ${fmt(r.a)} ₽`;
      $('ow-v').textContent = R.err ? 'ERROR' : vf(st.fn, R.res[st.sel]) + (R.unstable[st.sel] ? '*' : '');
      $('ow-vl').textContent = `${FN_SQL[st.fn]} у ${st.sel}`;
      if (R.err) { $('ow-f').textContent = '—'; $('ow-fl').textContent = 'запрос не выполнится'; }
      else if (isAgg(st.fn)) { const n = R.frame[st.sel].length; $('ow-f').textContent = n; $('ow-fl').textContent = `${plural(n, ['строка', 'строки', 'строк'])} в рамке из ${SP.length}`; }
      else if (st.fn === 'lag' || st.fn === 'lead') { const tg = R.target[st.sel]; $('ow-f').textContent = tg == null ? '—' : tg; $('ow-fl').textContent = 'откуда взято значение'; }
      else { $('ow-f').textContent = `${si + 1}-я`; $('ow-fl').textContent = `строка из ${SP.length} в секции`; }
      $('ow-msg').innerHTML = explain(st, R);
      $('ow-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t.t)}</li>`).join('');
      const nUn = R.err ? 0 : Object.keys(R.unstable).length;
      $('ow-s1').textContent = R.err ? 'PostgreSQL вернёт ошибку' : `${L.parts.length} ${plural(L.parts.length, ['секция', 'секции', 'секций'])} · ${WR.length} строк на входе и на выходе`;
      $('ow-s2').textContent = st.mode === 'def' ? (st.ord === 'none' ? 'рамка: вся секция' : 'рамка: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW') : `рамка: ${winFrameSql(st)}`;
      $('ow-s3').textContent = R.err ? '✗ ERROR' : nUn ? `* у ${nUn} ${plural(nUn, ['строки', 'строк', 'строк'])} ответ зависит от порядка равных` : '✓ ответ не зависит от порядка равных строк';
      $('ow-dot').classList.toggle('live', !R.err);
      s.R = R;
    }

    box.addEventListener('click', e => {
      const b = e.target.closest('.seg [data-k]');
      if (b && !b.disabled) {
        const k = b.parentElement.id.slice(3), v = b.dataset.k;
        s[k] = k === 'n' ? +v : v;
        draw(k === 'part' || k === 'ord'); return;
      }
      const tr = e.target.closest('tr[data-id]');
      if (tr) { s.sel = +tr.dataset.id; draw(false); const t = box.querySelector(`tr[data-id="${s.sel}"]`); if (t) t.focus({ preventScroll: true }); }
    });
    box.addEventListener('keydown', e => {
      const tr = e.target.closest && e.target.closest('tr[data-id]'); if (!tr) return;
      const ids = [...box.querySelectorAll('tr[data-id]')].map(x => +x.dataset.id), i = ids.indexOf(+tr.dataset.id);
      let n = null;
      if (e.key === 'ArrowDown') n = ids[Math.min(ids.length - 1, i + 1)];
      else if (e.key === 'ArrowUp') n = ids[Math.max(0, i - 1)];
      else if (e.key === 'Enter' || e.key === ' ') n = ids[i];
      if (n == null) return;
      e.preventDefault(); s.sel = n; draw(false);
      const t = box.querySelector(`tr[data-id="${n}"]`); if (t) t.focus({ preventScroll: true });
    });
    $('ow-reset').addEventListener('click', () => { s = fresh(); draw(true); });
    s = fresh(); draw(false);
    return {
      describe() {
        const R = s.R, v = R.err ? `ошибка «${R.err}»` : `${vf(s.fn, R.res[s.sel])}${R.unstable[s.sel] ? ' (зависит от порядка равных строк)' : ''}`;
        const fr = !R.err && isAgg(s.fn) ? `; в рамке ${R.frame[s.sel].length} строк: ${R.frame[s.sel].join(', ')}` : '';
        return `${winSql(s)}; выбрана строка ${s.sel}; ответ ${v}${fr}; строк со звёздочкой ${R.err ? 0 : Object.keys(R.unstable).length}; выполнено заданий: ${s.done.filter(Boolean).length} из 3.`;
      }
    };
  }

  // Блоки кода: SQL запущен в PostgreSQL 16.15 на учебной базе shop, Python — в Python 3.13; вывод вставлен как есть
  const CODE = {"ties": {"title": "Равные даты: рамка по умолчанию и ROWS дают разные итоги", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- 1. Рамка по умолчанию и ROWS на равных датах\nSELECT order_id, order_date, amount,\n       SUM(amount) OVER (ORDER BY order_date) AS by_default,   -- рамка по умолчанию: RANGE\n       SUM(amount) OVER (ORDER BY order_date\n                         ROWS UNBOUNDED PRECEDING) AS by_rows   -- рамка ROWS, порядок не уникален\nFROM orders\nWHERE status = 'paid' AND brand = 'Сова'\n  AND order_date BETWEEN '2026-03-01' AND '2026-03-07'\nORDER BY order_date, order_id;\n\n-- 2. Тот же by_rows рядом с окном, где есть order_id\nSELECT order_id, order_date, amount,\n       SUM(amount) OVER (ORDER BY order_date\n                         ROWS UNBOUNDED PRECEDING) AS by_rows,\n       SUM(amount) OVER (ORDER BY order_date, order_id) AS by_date_id  -- order_id разводит равные даты\nFROM orders\nWHERE status = 'paid' AND brand = 'Сова'\n  AND order_date BETWEEN '2026-03-01' AND '2026-03-07'\nORDER BY order_date, order_id;", "out": " order_id | order_date | amount | by_default | by_rows \n----------+------------+--------+------------+---------\n     1053 | 2026-03-01 |   1120 |       4070 |    1120\n     1168 | 2026-03-01 |    450 |       4070 |    1570\n     1187 | 2026-03-01 |   2500 |       4070 |    4070\n     1152 | 2026-03-04 |   1120 |      15210 |   15210\n     1169 | 2026-03-04 |  10020 |      15210 |   14090\n     1209 | 2026-03-05 |   1120 |      16330 |   16330\n     1071 | 2026-03-06 |   7480 |      34340 |   34340\n     1153 | 2026-03-06 |   8030 |      34340 |   26860\n     1181 | 2026-03-06 |   2500 |      34340 |   18830\n     1154 | 2026-03-07 |    450 |      38130 |   34790\n     1188 | 2026-03-07 |   3340 |      38130 |   38130\n(11 rows)\n\n order_id | order_date | amount | by_rows | by_date_id \n----------+------------+--------+---------+------------\n     1053 | 2026-03-01 |   1120 |    1120 |       1120\n     1168 | 2026-03-01 |    450 |    1570 |       1570\n     1187 | 2026-03-01 |   2500 |    4070 |       4070\n     1152 | 2026-03-04 |   1120 |    5190 |       5190\n     1169 | 2026-03-04 |  10020 |   15210 |      15210\n     1209 | 2026-03-05 |   1120 |   16330 |      16330\n     1071 | 2026-03-06 |   7480 |   23810 |      23810\n     1153 | 2026-03-06 |   8030 |   31840 |      31840\n     1181 | 2026-03-06 |   2500 |   34340 |      34340\n     1154 | 2026-03-07 |    450 |   34790 |      34790\n     1188 | 2026-03-07 |   3340 |   38130 |      38130\n(11 rows)", "outLabel": "Вывод psql: два запроса подряд", "note": "by_default одинаков у равных дат. by_rows в первом запросе у 4 и 6 марта убывает: PostgreSQL отсортировал строки только по order_date и расставил равные как получилось. Во втором запросе тот же by_rows идёт ровно: оба окна посчитаны по одной сортировке order_date, order_id. Надёжен только by_date_id."}, "where": {"title": "Окно в WHERE — ошибка, окно в CTE — работает", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- 1. Окно прямо в WHERE\nSELECT order_id, channel, amount\nFROM orders\nWHERE status = 'paid' AND brand = 'Сова'\n  AND order_date BETWEEN '2026-03-01' AND '2026-03-07'\n  AND amount > AVG(amount) OVER (PARTITION BY channel);\n\n-- 2. Окно в CTE, фильтр снаружи\nWITH s AS (\n  SELECT order_id, channel, amount,\n         ROUND(AVG(amount) OVER (PARTITION BY channel)) AS channel_avg,\n         ROUND(100.0 * amount / SUM(amount) OVER (PARTITION BY channel), 1) AS share_pct\n  FROM orders\n  WHERE status = 'paid' AND brand = 'Сова'\n    AND order_date BETWEEN '2026-03-01' AND '2026-03-07'\n)\nSELECT * FROM s\nWHERE amount > channel_avg              -- здесь окно уже посчитано\nORDER BY channel, amount DESC;", "out": "ERROR:  window functions are not allowed in WHERE\nLINE 6:   AND amount > AVG(amount) OVER (PARTITION BY channel);\n                       ^\n\n order_id | channel  | amount | channel_avg | share_pct \n----------+----------+--------+-------------+-----------\n     1188 | органика |   3340 |        1637 |      68.0\n     1153 | рассылка |   8030 |        3200 |      83.6\n     1169 | реклама  |  10020 |        4724 |      42.4\n     1071 | реклама  |   7480 |        4724 |      31.7\n(4 rows)", "outLabel": "Вывод psql: ошибка, затем результат", "note": "В CTE окно посчитано по всем 11 строкам выборки, а внешний WHERE оставил четыре заказа дороже среднего по своему каналу. share_pct — доля заказа в выручке канала за неделю."}, "retention": {"title": "Удержание через LAG: кто вернулся и через сколько дней", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- 1. Пауза между заказами у клиентов из сцены\nSELECT customer_id, order_date,\n       ROW_NUMBER() OVER w AS n,                         -- какой по счёту заказ клиента\n       order_date - LAG(order_date) OVER w AS gap_days   -- дней с прошлого заказа\nFROM orders\nWHERE status = 'paid' AND customer_id IN (101, 143, 146, 157)\nWINDOW w AS (PARTITION BY customer_id ORDER BY order_date, order_id)\nORDER BY customer_id, n;\n\n-- 2. Повторная покупка по когортам первого заказа\nWITH seq AS (\n  SELECT customer_id, order_date,\n         ROW_NUMBER() OVER w AS n,\n         order_date - LAG(order_date) OVER w AS gap_days,\n         MIN(order_date) OVER (PARTITION BY customer_id) AS first_date\n  FROM orders\n  WHERE status = 'paid'\n  WINDOW w AS (PARTITION BY customer_id ORDER BY order_date, order_id)\n)\nSELECT DATE_TRUNC('month', first_date)::date AS cohort,\n       COUNT(*) FILTER (WHERE n = 1) AS customers,\n       COUNT(*) FILTER (WHERE n = 2) AS repeat_any,\n       COUNT(*) FILTER (WHERE n = 2 AND gap_days <= 30) AS repeat_30d,\n       ROUND(AVG(gap_days) FILTER (WHERE n = 2), 1) AS days_to_2nd\nFROM seq\nGROUP BY cohort\nORDER BY cohort;", "out": " customer_id | order_date | n | gap_days \n-------------+------------+---+----------\n         101 | 2026-01-29 | 1 |     NULL\n         101 | 2026-03-20 | 2 |       50\n         101 | 2026-03-28 | 3 |        8\n         143 | 2026-02-15 | 1 |     NULL\n         143 | 2026-02-16 | 2 |        1\n         143 | 2026-03-23 | 3 |       35\n         146 | 2026-03-01 | 1 |     NULL\n         146 | 2026-03-07 | 2 |        6\n         146 | 2026-03-20 | 3 |       13\n         157 | 2026-03-11 | 1 |     NULL\n         157 | 2026-03-24 | 2 |       13\n         157 | 2026-03-27 | 3 |        3\n(12 rows)\n\n   cohort   | customers | repeat_any | repeat_30d | days_to_2nd \n------------+-----------+------------+------------+-------------\n 2026-01-01 |        15 |         13 |         11 |        10.8\n 2026-02-01 |        19 |         14 |         10 |        14.9\n 2026-03-01 |        17 |          8 |          8 |         7.4\n(3 rows)", "outLabel": "Вывод psql: два запроса подряд", "note": "Первый запрос повторяет сцену. У первых заказов gap_days пустой, и psql печатает его словом NULL: так настроен вывод (-P null=NULL). Из 15 январских клиентов 13 купили снова, 11 — в течение 30 дней. У мартовской когорты 30 дней к концу данных ещё не прошли, её цифры неполные."}, "moving": {"title": "Скользящее среднее за 7 дней: ROWS считает строки, RANGE — дни", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "WITH daily AS (                          -- выручка только за дни, когда были заказы\n  SELECT order_date AS day, SUM(amount) AS revenue\n  FROM orders\n  WHERE status = 'paid'\n  GROUP BY order_date\n), moving AS (\n  SELECT day, revenue,\n         MIN(day) OVER last7rows AS rows_from,       -- где на деле начались «7 строк»\n         ROUND(AVG(revenue) OVER last7rows) AS avg_7rows,\n         COUNT(*) OVER last7days AS days_with_orders,\n         ROUND(SUM(revenue) OVER last7days / 7.0) AS avg_7days\n  FROM daily\n  WINDOW last7rows AS (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW),\n         last7days AS (ORDER BY day RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW)\n)\nSELECT * FROM moving\nWHERE day BETWEEN '2026-01-25' AND '2026-02-01'   -- фильтр снаружи: окно видело все дни\nORDER BY day;", "out": "    day     | revenue | rows_from  | avg_7rows | days_with_orders | avg_7days \n------------+---------+------------+-----------+------------------+-----------\n 2026-01-25 |   22990 | 2026-01-14 |      7730 |                4 |      3840\n 2026-01-29 |   17700 | 2026-01-17 |      8466 |                3 |      6143\n 2026-01-30 |    3340 | 2026-01-18 |      7580 |                3 |      6290\n 2026-01-31 |    6870 | 2026-01-20 |      7827 |                4 |      7271\n 2026-02-01 |    2530 | 2026-01-22 |      8020 |                4 |      4349\n(5 rows)", "note": "Для 29 января «семь строк» начались 17 января и захватили 13 дней, а RANGE взял ровно 23–29 января, где заказы были в три дня. Сумму делим на 7.0: AVG по RANGE разделил бы на число дней с заказами. Календарь из generate_series с нулями даёт через ROWS те же 3 840, 6 143, 6 290, 7 271 и 4 349. Фильтр по датам стоит снаружи: в том же SELECT он отрезал бы окну дни до 25 января."}, "top3": {"title": "Три лидера продаж в каждой категории", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "WITH sales AS (                          -- штуки и выручка по товару, только оплаченные заказы\n  SELECT p.category, p.product_name,\n         SUM(oi.qty) AS units, SUM(oi.qty * oi.price) AS revenue\n  FROM order_items AS oi\n  JOIN orders   AS o ON o.order_id = oi.order_id\n  JOIN products AS p ON p.product_id = oi.product_id\n  WHERE o.status = 'paid'\n  GROUP BY p.category, p.product_name\n), ranked AS (\n  SELECT category, product_name, units,\n         ROW_NUMBER() OVER (PARTITION BY category ORDER BY units DESC, revenue DESC) AS rn,\n         RANK()       OVER w AS rnk,\n         DENSE_RANK() OVER w AS drnk\n  FROM sales\n  WINDOW w AS (PARTITION BY category ORDER BY units DESC)\n)\nSELECT * FROM ranked\nWHERE drnk <= 3                          -- самый широкий из трёх фильтров\nORDER BY category, rn;", "out": " category |      product_name       | units | rn | rnk | drnk \n----------+-------------------------+-------+----+-----+------\n декор    | Ваза «Сова»             |    18 |  1 |   1 |    1\n декор    | Ваза «Бриз»             |    16 |  2 |   2 |    2\n декор    | Свеча «Сова»            |    15 |  3 |   3 |    3\n посуда   | Чайник «Бриз»           |    23 |  1 |   1 |    1\n посуда   | Чайник «Сова»           |    21 |  2 |   2 |    2\n посуда   | Кружка «Сова»           |    21 |  3 |   2 |    2\n посуда   | Чайник «Кедр»           |    20 |  4 |   4 |    3\n свет     | Гирлянда «Сова»         |    21 |  1 |   1 |    1\n свет     | Лампа настольная «Бриз» |    19 |  2 |   2 |    2\n свет     | Гирлянда «Кедр»         |    15 |  3 |   3 |    3\n текстиль | Плед «Сова»             |    26 |  1 |   1 |    1\n текстиль | Наволочка «Сова»        |    22 |  2 |   2 |    2\n текстиль | Наволочка «Бриз»        |    20 |  3 |   3 |    3\n(13 rows)", "note": "Магазин продал 21 чайник «Сова» и столько же кружек «Сова». RANK даёт обоим 2 и пропускает 3, DENSE_RANK тоже даёт 2, но ставит Чайник «Кедр» третьим. Фильтры rn <= 3 и rnk <= 3 оставят в посуде три товара, drnk <= 3 — четыре. Кто из равных получит ROW_NUMBER 2, решает второй ключ revenue DESC."}, "lastver": {"title": "Последняя версия записи: ROW_NUMBER по журналу, фильтр снаружи", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "WITH ranked AS (\n  SELECT order_id, status, changed_at,\n         ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY changed_at DESC) AS rn,  -- 1 = самая свежая запись\n         BOOL_OR(status = 'paid') OVER (PARTITION BY order_id) AS ever_paid         -- вся история заказа\n  FROM order_status_log\n), last_version AS (\n  SELECT * FROM ranked WHERE rn = 1\n)\nSELECT l.status AS last_status,\n       COUNT(*) AS orders,\n       COUNT(*) FILTER (WHERE l.ever_paid) AS ever_paid,\n       COUNT(*) FILTER (WHERE l.status <> o.status) AS mismatch   -- сверка с orders.status\nFROM last_version AS l\nJOIN orders AS o USING (order_id)\nGROUP BY l.status\nORDER BY l.status;", "out": " last_status | orders | ever_paid | mismatch \n-------------+--------+-----------+----------\n cancelled   |     36 |        21 |        0\n paid        |    195 |       195 |        0\n(2 rows)", "note": "В журнале 483 записи о 231 заказе. Последняя запись совпала с orders.status у всех заказов, а у 21 из 36 отменённых в истории есть оплата: их сначала оплатили, потом отменили."}, "qualify": {"title": "QUALIFY: DuckDB фильтрует по окну, PostgreSQL читает слово как псевдоним", "badge": "проверено: DuckDB 2.0.0, psycopg 3.3.8, PostgreSQL 16", "lang": "python", "code": "import duckdb, psycopg\n\nq = \"\"\"\nSELECT order_id, status, changed_at\nFROM order_status_log\nQUALIFY ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY changed_at DESC) = 1\nORDER BY order_id\nLIMIT 4\n\"\"\"\nprint(duckdb.connect(\"data/shop/shop.duckdb\", read_only=True).sql(q))   # DuckDB: QUALIFY есть\n\nwith psycopg.connect(\"host=/tmp dbname=shop user=postgres\") as con:\n    try:\n        con.execute(q)\n    except psycopg.errors.SyntaxError as e:                    # PostgreSQL: такого слова нет\n        print(\"PostgreSQL:\", e)", "out": "┌──────────┬─────────┬─────────────────────┐\n│ order_id │ status  │     changed_at      │\n│  int32   │ varchar │      timestamp      │\n├──────────┼─────────┼─────────────────────┤\n│     1001 │ paid    │ 2026-01-29 20:03:01 │\n│     1002 │ paid    │ 2026-03-20 19:07:56 │\n│     1003 │ paid    │ 2026-03-28 19:57:42 │\n│     1004 │ paid    │ 2026-01-03 00:07:18 │\n└──────────┴─────────┴─────────────────────┘\n\nPostgreSQL: syntax error at or near \"ROW_NUMBER\"\nLINE 4: QUALIFY ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY ch...\n                ^", "note": "В PostgreSQL 16 разбор запроса допускает QUALIFY на месте псевдонима таблицы. Следующее слово, ROW_NUMBER, уже не соответствует синтаксису. Поэтому ошибка указывает на ROW_NUMBER, а не на QUALIFY."}};


  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-3-5',
    short: 'DA-03',
    title: 'Оконные функции',
    where: 'блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.5',
    aiData: 'учебная база интернет-магазина shop в PostgreSQL 16 (январь–март 2026): orders, order_items, products, order_status_log; в анимации 12 оплаченных заказов клиентов 101, 143, 146, 157, в интерактиве 11 оплаченных заказов бренда «Сова» за 1–7 марта',
    scene,
    widgets: { win: buildWin },
    code: CODE,
    questions: {
    q1: { sec: 'frame', title: 'Сначала предскажите', q: 'В выборке три заказа от 1 марта: 1053 на 1 120 ₽, 1168 на 450 ₽ и 1187 на 2 500 ₽. Какой нарастающий итог получит заказ 1053 в запросе SUM(amount) OVER (ORDER BY order_date)?', opts: [['1 120 — только сам заказ: он первый'], ['4 070 — все три заказа 1 марта', 1], ['1 570 — заказ и следующий за ним'], ['38 130 — вся выборка']],
      why: "При сортировке только по дате рамка по умолчанию включает все заказы с той же датой. Поэтому у каждого из трёх заказов 1 марта накопленная сумма равна 1 120 + 450 + 2 500 = 4 070 ₽. Для итога после каждой покупки задайте порядок по двум полям: order_date, order_id." },
    q2: { sec: 'idea', q: "Как изменится число строк, если для 12 заказов четырёх клиентов добавить в SELECT выражение SUM(amount) OVER (PARTITION BY customer_id)?", opts: [['4 — по строке на клиента'], ['12 — по строке на заказ, у каждой сумма её клиента', 1], ['3 — столько заказов у каждого клиента'], ['16 — 12 заказов и 4 итоговые строки']],
      why: "В результате останется 12 строк. В каждой из трёх строк клиента № 101 появится одно и то же значение — 15 250 ₽, сумма всех его заказов в выборке. Обычная группировка по customer_id с SUM дала бы четыре строки, по одной на клиента." },
    q3: { sec: 'idea', q: "Заказы упорядочены по убыванию суммы: 10 020, 8 030, 7 480, 3 340, 2 500, 2 500 и 1 120 ₽. Какое место получит последний заказ по RANK и по DENSE_RANK?", opts: [['RANK — 7, DENSE_RANK — 6', 1], ['RANK — 6, DENSE_RANK — 6'], ['RANK — 7, DENSE_RANK — 7'], ['RANK — 6, DENSE_RANK — 7']],
      why: "Два заказа по 2 500 ₽ делят пятое место. RANK отсчитывает позиции строк, поэтому следующая сумма занимает седьмое место. DENSE_RANK нумерует различные суммы подряд. Сумма 1 120 ₽ занимает шестое место." },
    q4: { sec: 'nuances', q: 'В отчёте нарастающий итог SUM(amount) OVER (ORDER BY order_date) у трёх заказов 1 марта одинаковый — 4 070 ₽, а не 1 120, 1 570 и 4 070. Почему?', opts: [['Рамка по умолчанию — RANGE, и в неё входят все строки с той же датой', 1], ['SUM пропускает повторяющиеся даты'], ['PostgreSQL округляет нарастающий итог до дня'], ['Не хватает PARTITION BY order_date']],
      why: "При ORDER BY order_date рамка по умолчанию включает все строки до конца текущей группы дат. Поэтому итог отражает выручку к концу дня. Если нужен итог после каждого отдельного заказа, добавьте в ORDER BY номер заказа. При PARTITION BY order_date итог начинался бы заново в каждый новый день." },
    q5: { sec: 'nuances', q: "Как в PostgreSQL 16 выбрать для каждого заказа последнюю запись журнала после нумерации строк с помощью ROW_NUMBER?", opts: [['WHERE ROW_NUMBER() OVER (…) = 1'], ['HAVING ROW_NUMBER() OVER (…) = 1'], ['Посчитать ROW_NUMBER в CTE или подзапросе и написать снаружи WHERE rn = 1', 1], ['QUALIFY ROW_NUMBER() OVER (…) = 1']],
      why: "В PostgreSQL 16 WHERE и HAVING применяются до оконного расчёта. Сначала пронумеруйте записи внутри каждого заказа в CTE или подзапросе, начиная с последней по времени. Во внешнем SELECT оставьте строки с rn = 1. В DuckDB для этого также есть QUALIFY." },
    q6: { sec: 'code', q: "Клиенту присвоили отдельную секцию и отсортировали его заказы по дате. Что окажется в gap_days у первого заказа?", code: 'order_date - LAG(order_date) OVER w AS gap_days', lang: 'sql', opts: [['0'], ['NULL', 1], ['Число дней от 1 января'], ['Ошибка: у первой строки нет соседа']],
      why: "До первого заказа в секции нет предыдущей строки, поэтому LAG без явно заданной замены возвращает NULL. Вычитание такой даты тоже даст NULL. Ноль означал бы, что предыдущая покупка была в тот же день." },
    q7: { sec: 'code', q: 'В выручке по дням нет строк за 24 и 26–28 января. Что посчитает AVG(revenue) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) для 29 января?', opts: [['Среднее за 23–29 января'], ['Среднее семи последних дней с заказами — с 17 по 29 января', 1], ['Ошибку: в окне есть пропуски'], ['NULL, потому что дней не хватает']],
      why: "За 29 января в рамку попадают семь строк с продажами, начиная с 17 января. Чтобы ограничить расчёт датами 23–29 января, используйте RANGE с INTERVAL '6 days' PRECEDING. AVG по этой рамке усреднит только дни, представленные строками. Для средней выручки за все семь дней можно сложить выручку за период и разделить на 7, если данные известны за весь период." }
    },
    glossary: {
      window: { t: 'Оконная функция', en: 'window function', d: "Функция, которая для каждой строки вычисляет результат с учётом других строк её секции. Например, можно добавить к каждому заказу общую сумму покупок его клиента." },
      over: { t: 'OVER', en: 'OVER clause', d: "Часть вызова, которая задаёт окно функции: OVER (описание окна) или OVER имя_окна." },
      partition: { t: 'Секция окна', en: 'partition, PARTITION BY', d: "Набор строк с одной комбинацией значений полей в PARTITION BY. Например, при PARTITION BY customer_id каждый клиент образует отдельную секцию." },
      frame: { t: 'Рамка окна', en: 'window frame', d: "Часть секции, которую оконный агрегат учитывает для текущей строки. Границы можно задать в строках или относительно значения ключа сортировки." },
      running: { t: 'Нарастающий итог', en: 'running total', d: 'Сумма от первой строки до текущей в заданном порядке.' },
      windowclause: { t: 'WINDOW', en: 'WINDOW clause', d: "Предложение SQL, в котором окну дают имя. Несколько функций в одном запросе могут ссылаться на это имя через OVER." },
      peers: { t: 'Равные строки', en: 'peers', d: "Строки одной секции с одинаковыми значениями всех выражений из ORDER BY окна. Например, при сортировке только по дате это все заказы за один день." },
      rownumber: { t: 'ROW_NUMBER', en: 'row number', d: 'Номер строки в секции по порядку ORDER BY, без повторов.' },
      rank: { t: 'RANK', en: 'rank', d: "Ранг с учётом числа строк на предыдущих местах. Если два заказа делят первое место, следующий получит третье." },
      dense: { t: 'DENSE_RANK', en: 'dense rank', d: "Ранг среди различных значений ключа сортировки. За двумя заказами на первом месте следует заказ со вторым рангом." },
      lag: { t: 'LAG и LEAD', en: 'lag, lead', d: 'Значение из строки на N позиций раньше или позже в той же секции.' },
      share: { t: 'Доля от суммы группы', en: 'share of total', d: 'Значение строки, делённое на сумму её секции.' },
      moving: { t: 'Скользящее среднее', en: 'moving average', d: "Среднее для каждой строки по выбранному окну. Например, можно усреднить выручку за текущий день и шесть предыдущих календарных дней." },
      dedup: { t: 'Дедупликация', en: 'deduplication', d: 'Отбор одной строки на ключ, например последней версии записи.' },
      retention: { t: 'Удержание', en: 'retention', d: "Доля клиентов исходной группы, которые вернулись в заданный период. В примере отдельно считают клиентов со второй покупкой в течение 30 дней после первой." },
      bounds: { t: 'Границы рамки', en: 'frame bounds', d: 'Где рамка начинается и кончается: UNBOUNDED, N PRECEDING, CURRENT ROW, N FOLLOWING.' },
      rows: { t: 'ROWS', en: 'ROWS mode', d: 'Режим рамки, который отсчитывает границы в строках.' },
      range: { t: 'RANGE', en: 'RANGE mode', d: "Режим рамки, в котором границы определяются значениями ключа сортировки. Строки с одинаковыми значениями ключа входят в рамку вместе." },
      interval: { t: 'INTERVAL', en: 'interval', d: "Тип для промежутка времени. Например, INTERVAL '6 days' задаёт смещение на шесть дней для рамки RANGE по дате." },
      plan: { t: 'План запроса', en: 'query plan, EXPLAIN', d: 'Шаги, которыми база выполняет запрос; его показывает EXPLAIN.' },
      filter: { t: 'FILTER', en: 'FILTER clause', d: 'Условие внутри агрегата: COUNT(*) FILTER (WHERE …) считает только подходящие строки.' },
      qualify: { t: 'QUALIFY', en: 'QUALIFY clause', d: "Условие отбора по результату оконного расчёта. Поддерживается в DuckDB; в PostgreSQL 16 такой конструкции нет." }
    },
    materials: [
      ['da-3-5-window-functions.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/shop/', 'Учебная база shop для PostgreSQL, SQLite и DuckDB — общий набор темы 03'],
      ['sova_week.csv', 'Выборка интерактива: 11 оплаченных заказов «Сова» за 1–7 марта'],
      ['window_functions.sql', 'Запросы к базе shop для разбора рамок, рангов и четырёх отчётов'],
      ['qualify.py', 'QUALIFY в DuckDB и ответ PostgreSQL на тот же запрос']
    ],
    prompts: [
      ['Тренажёр по рамкам', 'Дай по источнику оконную функцию с рамкой и строку из выборки «Сова» за 1–7 марта. Я назову строки рамки и ответ, а ты проверишь и объяснишь через ROWS, RANGE и равные строки. Пять задач по одной.'],
      ['RANK, DENSE_RANK или ROW_NUMBER', 'Задай четыре задачи «топ-N в группе» с ничьими на учебной базе из источника. Я выберу функцию и скажу, сколько строк вернёт фильтр, а ты укажешь на ошибки.'],
      ['Проверка моего окна', 'Я вставлю свой запрос с оконной функцией. Найди, где ответ зависит от порядка равных строк, рамки по умолчанию или фильтра в WHERE, и подведи меня к исправлению вопросами, не переписывая запрос.']
    ]
  };
})();
