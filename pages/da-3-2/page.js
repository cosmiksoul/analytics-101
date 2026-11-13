/* Страница 3.2 · JOIN */
(() => {
  /* ===================== Учебные данные и расчёт запросов =====================
     Выборка из учебной базы shop (data/shop, PostgreSQL 16). Код между метками sql:start и sql:end
     повторяет PostgreSQL: каждое состояние интерактива сверено запуском того же текста запроса. */
  /*sql:start*/
  // sample_customers: SELECT customer_id, name, channel FROM customers WHERE country_code = 'RU' AND signup_date < '2026-01-01'
  // sample_orders:    SELECT order_id, customer_id, channel, status FROM orders WHERE order_date BETWEEN '2026-01-11' AND '2026-01-13'
  const SC = [
    { customer_id: 105, name: 'Роман К.', channel: 'рассылка' },
    { customer_id: 106, name: 'Ульяна М.', channel: 'реклама' },
    { customer_id: 110, name: 'Егор С.', channel: 'рассылка' },
    { customer_id: 114, name: 'Вера М.', channel: 'органика' },
    { customer_id: 116, name: 'Фёдор Б.', channel: 'органика' }
  ];
  const SO = [
    { order_id: 1027, customer_id: 105, channel: 'рассылка', status: 'paid' },
    { order_id: 1034, customer_id: 106, channel: 'реклама', status: 'paid' },
    { order_id: 1035, customer_id: 106, channel: 'органика', status: 'paid' },
    { order_id: 1036, customer_id: 106, channel: 'реклама', status: 'cancelled' },
    { order_id: 1041, customer_id: 108, channel: 'органика', status: 'paid' },
    { order_id: 1062, customer_id: 111, channel: 'реклама', status: 'paid' },
    { order_id: 1088, customer_id: 114, channel: 'органика', status: 'paid' }
  ];
  // Условный гостевой заказ без клиента: в учебной базе customer_id обязателен, строка добавляется только в интерактиве
  const GUEST = { order_id: 9001, customer_id: null, channel: 'органика', status: 'paid' };

  // Троичная логика SQL: сравнение с NULL даёт UNKNOWN (null), строка проходит только при TRUE
  const eq = (a, b) => a == null || b == null ? null : a === b;
  const and3 = (a, b) => a === false || b === false ? false : a == null || b == null ? null : true;
  const not3 = a => a == null ? null : !a;
  const byNull = (a, b) => a === b ? 0 : a == null ? 1 : b == null ? -1 : a < b ? -1 : 1;   // ORDER BY … ASC: NULL в конце

  const JTYPES = ['INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS'];
  const JKEYS = { id: 'o.customer_id = c.customer_id', ch: 'o.channel = c.channel', both: 'o.customer_id = c.customer_id AND o.channel = c.channel' };
  const keyCond = (key, c, o) => key === 'id' ? eq(o.customer_id, c.customer_id) : key === 'ch' ? eq(o.channel, c.channel) : and3(eq(o.customer_id, c.customer_id), eq(o.channel, c.channel));
  const PAID = "o.status = 'paid'", CH_EQ = 'o.channel = c.channel';

  // Соединение: пары, где ON = TRUE; внешние типы добавляют строки без пары; WHERE — после соединения; ORDER BY c.customer_id, o.order_id
  function joinRows(type, key, filt, C = SC, O = SO) {
    const on = (c, o) => type === 'CROSS' ? true : and3(keyCond(key, c, o), filt === 'on' ? eq(o.status, 'paid') : true);
    const rows = [], lm = new Set(), rm = new Set();
    C.forEach((c, i) => O.forEach((o, j) => { if (on(c, o) === true) { rows.push({ c: i, o: j }); lm.add(i); rm.add(j); } }));
    if (type === 'LEFT' || type === 'FULL') C.forEach((c, i) => { if (!lm.has(i)) rows.push({ c: i, o: null }); });
    if (type === 'RIGHT' || type === 'FULL') O.forEach((o, j) => { if (!rm.has(j)) rows.push({ c: null, o: j }); });
    const out = filt === 'where' ? rows.filter(r => eq(r.o == null ? null : O[r.o].status, 'paid') === true) : rows;
    const cid = r => r.c == null ? null : C[r.c].customer_id, oid = r => r.o == null ? null : O[r.o].order_id;
    return out.sort((a, b) => byNull(cid(a), cid(b)) || byNull(oid(a), oid(b)));
  }
  const joinCols = key => key === 'id' ? [['c', 'customer_id'], ['c', 'name'], ['o', 'order_id'], ['o', 'customer_id'], ['o', 'status']]
    : [['c', 'customer_id'], ['c', 'name'], ['c', 'channel'], ['o', 'order_id'], ['o', 'customer_id'], ['o', 'channel'], ['o', 'status']];
  // Текст запроса: неактивное место условия остаётся закомментированным, поэтому запрос запускается как есть
  function joinSQL(type, key, filt) {
    const cols = joinCols(key).map(([t, c]) => `${t}.${c}`).join(', ');
    const L = [`SELECT ${cols}`, 'FROM sample_customers AS c'];
    if (type === 'CROSS') L.push('CROSS JOIN sample_orders AS o');
    else {
      L.push(`${type} JOIN sample_orders AS o`, `  ON ${key === 'ch' ? JKEYS.ch : JKEYS.id}`);
      if (key !== 'ch') L.push(`${key === 'both' ? '' : '-- '}  AND ${CH_EQ}`);
      L.push(`${filt === 'on' ? '' : '-- '}  AND ${PAID}`);
    }
    L.push(`${filt === 'where' ? '' : '-- '}WHERE ${PAID}`, 'ORDER BY c.customer_id, o.order_id;');
    return L.join('\n');
  }

  // Анти-соединение: три способа найти клиентов без заказов
  const ANTI = {
    left: { opts: { isnull: 'o.order_id IS NULL', eqnull: 'o.order_id = NULL', notnull: 'o.order_id IS NOT NULL' } },
    exists: { opts: { corr: 'o.customer_id = c.customer_id', paid: "o.status = 'paid'", canc: "o.customer_id = c.customer_id AND o.status = 'cancelled'" } },
    notin: { opts: { all: 'SELECT o.customer_id FROM sample_orders AS o', nn: 'SELECT o.customer_id FROM sample_orders AS o WHERE o.customer_id IS NOT NULL', oid: 'SELECT o.order_id FROM sample_orders AS o' } }
  };
  function antiSQL(m, opt) {
    const head = 'SELECT c.customer_id, c.name\nFROM sample_customers AS c\n', tail = '\nORDER BY c.customer_id;';
    if (m === 'left') return `${head}LEFT JOIN sample_orders AS o\n  ON o.customer_id = c.customer_id\nWHERE ${ANTI.left.opts[opt]}${tail}`;
    if (m === 'exists') return `${head}WHERE NOT EXISTS (\n  SELECT 1 FROM sample_orders AS o\n  WHERE ${ANTI.exists.opts[opt]}\n)${tail}`;
    if (m === 'notin') return `${head}WHERE c.customer_id NOT IN (\n  ${ANTI.notin.opts[opt]}\n)${tail}`;
    return 'SELECT customer_id FROM sample_customers\nEXCEPT\nSELECT customer_id FROM sample_orders\nORDER BY customer_id;';
  }
  // Результат: список индексов клиентов (для EXCEPT — только customer_id, без имён)
  function antiRows(m, opt, guest) {
    const O = guest ? SO.concat([GUEST]) : SO;
    if (m === 'left') {
      const J = joinRows('LEFT', 'id', 'none', SC, O);
      const test = r => { const v = r.o == null ? null : O[r.o].order_id; return opt === 'isnull' ? v == null : opt === 'notnull' ? v != null : eq(v, null); };
      return J.filter(r => test(r) === true).map(r => r.c);
    }
    if (m === 'exists') return SC.map((c, i) => i).filter(i => {
      const c = SC[i];
      const hit = O.some(o => (opt === 'corr' ? eq(o.customer_id, c.customer_id) : opt === 'paid' ? eq(o.status, 'paid') : and3(eq(o.customer_id, c.customer_id), eq(o.status, 'cancelled'))) === true);
      return !hit;
    });
    if (m === 'notin') return SC.map((c, i) => i).filter(i => {
      const vals = opt === 'oid' ? O.map(o => o.order_id) : opt === 'nn' ? O.map(o => o.customer_id).filter(v => v != null) : O.map(o => o.customer_id);
      // x NOT IN (…) = NOT (x = v1 OR x = v2 OR …): с NULL в списке «не нашёл» превращается в UNKNOWN
      let any = false;
      vals.forEach(v => { const e = eq(SC[i].customer_id, v); any = any === true || e === true ? true : any === null || e === null ? null : false; });
      return not3(any) === true;
    });
    const ids = new Set(O.map(o => o.customer_id));     // EXCEPT сравнивает строки как множества: NULL совпадает с NULL
    return [...new Set(SC.map((c, i) => i).filter(i => !ids.has(SC[i].customer_id)))].sort((a, b) => SC[a].customer_id - SC[b].customer_id);
  }
  /*sql:end*/

  // Неразрывный пробел после коротких предлогов и союзов и после чисел — для текстов, которые движок выводит как есть
  const NB = /(^|[\s(«—>])(в|во|и|с|со|к|ко|о|об|у|а|не|ни|на|по|из|от|до|за|без|для|при|про|под|над|что|как|но|или|же|ли|их|его|её|это|то|В|И|С|К|О|У|А|Не|На|По|Из|От|До|За|Без|Для|При|Что|Как|Но|Или|Это|То) /g;
  const nb = s => String(s).replace(NB, '$1$2\u00A0').replace(NB, '$1$2\u00A0').replace(/(\d) (?=[а-яёА-ЯЁ₽×%]|\d{3}\b)/g, '$1\u00A0');

  /* ===================== Сцена: два круга, пары и все пары ===================== */
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  // Пары результата: [индекс клиента, индекс заказа]; 0–4 — пары по ключу, 5–6 — клиенты без заказов, 7–8 — заказы без клиента
  const PAIRS = [[0, 0], [1, 1], [1, 2], [1, 3], [3, 6], [2, null], [4, null], [null, 4], [null, 5]];
  const ORDERS_OF = { INNER: [0, 1, 2, 3, 4], LEFT: [0, 1, 2, 3, 5, 4, 6], RIGHT: [0, 1, 2, 3, 4, 7, 8], FULL: [0, 1, 2, 3, 5, 4, 6, 7, 8] };
  const STEP_TYPE = [null, null, null, 'INNER', 'LEFT', 'LEFT', 'RIGHT', 'FULL', 'INNER', null, null];
  // куда встаёт фишка клиента в кругах: 'x0', 'x1', 'x2' — пересечение, 'l0', 'l1' — только слева
  const CU_SLOT = ['x0', 'x1', 'l0', 'x2', 'l1'];
  const OD_SLOT = ['x0', 'x1', 'x1', 'x1', 'r0', 'r1', 'x2'];
  const MATCH = (i, j) => SC[i].customer_id === SO[j].customer_id;

  const GEO = {
    d: { ww: 600, wh: 400, th: 26, tstep: 30,
      tL: { x: 62, y: 120, cw: [84, 96] }, tR: { x: 360, y: 120, cw: [74, 92] }, tTitle: 62, tHead: 92,
      cl: [106, 214], cr: [216, 214], r: 100, chip: [56, 28],
      slot: { x0: [161, 150], x1: [161, 214], x2: [161, 278], l0: [58, 184], l1: [58, 246], r0: [264, 184], r1: [264, 246] },
      labL: [24, 96], labR: [298, 96],
      rx: 326, rBand: 70, rHead: 90, ry: 116, rstep: 29, rh: 25, rcw: [72, 70, 52, 72],
      gx: 52, gy: 80, glw: 108, gcw: 50, gstep: 55, ghh: 42, grh: 38, grstep: 43 },
    m: { ww: 320, wh: 450, th: 24, tstep: 28,
      tL: { x: 4, y: 84, cw: [74, 76] }, tR: { x: 168, y: 84, cw: [62, 86] }, tTitle: 30, tHead: 58,
      cl: [114, 96], cr: [206, 96], r: 80, chip: [52, 26],
      slot: { x0: [160, 52], x1: [160, 96], x2: [160, 140], l0: [76, 78], l1: [76, 122], r0: [244, 78], r1: [244, 122] },
      labL: [10, 0], labR: [310, 0],
      rx: 28, rBand: 212, rHead: 228, ry: 250, rstep: 22, rh: 20, rcw: [62, 78, 56, 62],
      gx: 4, gy: 96, glw: 50, gcw: 34, gstep: 37, ghh: 42, grh: 32, grstep: 37 }
  };

  const scene = {
    parts: [{ n: '01', name: 'Две таблицы', s: [0, 1] }, { n: '02', name: 'INNER', s: [2, 3] }, { n: '03', name: 'LEFT', s: [4, 5] }, { n: '04', name: 'RIGHT и FULL', s: [6, 7] }, { n: '05', name: 'Где круги врут', s: [8] }, { n: '06', name: 'Все пары', s: [9, 10] }],
    steps: [
      { title: 'Клиенты и заказы', dur: 2800, body: '<p>Учебная выборка из базы магазина: пять клиентов из России, пришедших в декабре, и семь заказов за 11–13 января. Общий столбец у таблиц — <b>customer_id</b>.</p><p>Нужно поставить рядом каждого клиента и его заказы.</p>' },
      { title: 'Ключи раскладываются по кругам', dur: 3600, body: '<p>Левый круг — значения customer_id в customers, правый — в orders. Значения, которые есть в обеих таблицах, уходят в пересечение: 105, 106 и 114.</p><p>У клиента 106 три заказа, а в круге ключ один. О повторах напоминает только метка <b>×3</b>.</p>' },
      { title: 'INNER JOIN — пересечение', dur: 2600, body: '<p>Внутреннее соединение оставляет только пары — строки, ключ которых нашёлся с обеих сторон.</p><p>Клиенты 110 и 116 без заказов и заказы клиентов 108 и 111 в результат не попадут.</p>' },
      { title: 'Дубликат размножает строку', dur: 3800, body: '<p>Каждая строка слева сцепляется с каждой парной строкой справа. Ульяна М. (106) встречается в orders трижды, поэтому её строка размножилась на три.</p><p>Три общих ключа дали пять строк.</p>' },
      { title: 'LEFT JOIN — весь левый круг', dur: 3200, body: '<p>Левое соединение сохраняет все строки левой таблицы. Клиенты 110 и 116 возвращаются в результат, хотя пары у них нет.</p>' },
      { title: 'Пустоты справа — NULL', dur: 2800, body: '<p>В столбцах orders у них стоит <b>NULL</b> — пустое значение: заказа нет. Строк семь: пять пар и два клиента без пары.</p><p>По этим NULL потом находят клиентов без заказов.</p>' },
      { title: 'RIGHT JOIN — весь правый круг', dur: 3400, body: '<p>Правое соединение — зеркало левого: сохраняются все строки orders. Заказы 1041 и 1062 сделали клиенты 108 и 111, которых нет в выборке, и столбцы customers у этих строк пустые.</p>' },
      { title: 'FULL JOIN — оба круга', dur: 3200, body: '<p>Полное соединение сохраняет строки обеих таблиц: пять пар, два клиента без заказов и два заказа без клиента.</p><p>Девять строк, NULL с обеих сторон.</p>' },
      { title: 'Где круги врут', dur: 3400, body: '<p>Круги показывают наборы ключей, а JOIN возвращает пары строк. В пересечении три ключа, а строк пять, и по площади круга это не видно.</p><p>Если бы клиент 106 встречался и слева дважды, один ключ дал бы 2 × 3 = 6 строк.</p>' },
      { title: 'CROSS JOIN — все пары', dur: 3600, body: '<p>Честная модель начинается с перекрёстного соединения: каждая строка customers ставится рядом с каждой строкой orders. 5 × 7 = 35 пар.</p>' },
      { title: 'ON оставляет совпавшие', dur: 3800, next: 'Читать страницу', body: '<p>Условие ON проверяется для каждой пары, и остаются те, где ключи совпали. Пять клеток — это и есть INNER JOIN.</p><p>Строки без единой пары LEFT, RIGHT и FULL добавляют обратно, заполнив чужие столбцы NULL.</p>' }
    ],
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'keys', label: 'Общих ключей' }, { id: 'nul', label: 'С NULL' }],
    legend: '<span><i style="background:#36b8a6"></i>пара</span><span><i style="background:#f2756a"></i>нет пары, NULL</span><span><i style="background:#e3c04d"></i>повтор ключа</span>',
    info: 'КЛЮЧ customer_id',
    aiNote: 'В анимации учебная выборка из базы магазина: sample_customers — 5 клиентов из России, пришедших в декабре 2025 (105 Роман К., 106 Ульяна М., 110 Егор С., 114 Вера М., 116 Фёдор Б.), и sample_orders — 7 заказов за 11–13 января 2026 (1027 клиента 105; 1034, 1035, 1036 клиента 106; 1041 клиента 108; 1062 клиента 111; 1088 клиента 114). Ключ customer_id. Общих ключей три: 105, 106, 114. INNER JOIN — 5 строк (106 повторяется трижды), LEFT — 7 (110 и 116 с NULL), RIGHT — 7 (1041 и 1062 с NULL слева), FULL — 9, CROSS — 35. Круги показывают наборы ключей и не показывают повторы; честная модель — все пары строк, из которых ON оставляет совпавшие.',
    mount(root, api) {
      root.innerHTML = '<div class="jv"><div class="jv-w"></div></div>';
      const pv = root.firstChild, w = pv.firstChild;
      w._c = {};
      const mk = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; w.appendChild(d); d._c = {}; return d; };
      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'jv-svg'); svg.setAttribute('aria-hidden', 'true'); w.appendChild(svg);
      const sv = (tag, cls) => { const e = document.createElementNS(NS, tag); e.setAttribute('class', cls); svg.appendChild(e); return e; };
      const cL = sv('circle', 'jv-cl'), cR = sv('circle', 'jv-cr'), lens = sv('path', 'jv-lens');
      // элементы мира
      const tTitle = [mk('jv-tt', 'customers'), mk('jv-tt', 'orders')];
      const tHead = [mk('jv-th', '<span class="k">customer_id</span><span>name</span>'), mk('jv-th', '<span>order_id</span><span class="k">customer_id</span>')];
      const lab = [mk('jv-lab jv-lab-c', 'customers <i>c</i>'), mk('jv-lab jv-lab-o', 'orders <i>o</i>')];
      const cu = SC.map(c => mk('jv-row jv-cu', `<span class="k">${c.customer_id}</span><span class="n">${api.esc(c.name)}</span>`));
      const od = SO.map(o => mk('jv-row jv-od', `<span class="oi">${o.order_id}</span><span class="k">${o.customer_id}</span>`));
      const badge = mk('jv-badge', '×3');
      const band = mk('jv-band', '<span>customers c</span><span>orders o</span>');
      const rHead = mk('jv-rh', '<span>customer_id</span><span>name</span><span>order_id</span><span>customer_id</span>');
      const cell = v => v == null ? '<span class="nul">NULL</span>' : `<span>${v}</span>`;
      const pr = PAIRS.map(([i, j]) => mk('jv-pr', cell(i == null ? null : SC[i].customer_id) + cell(i == null ? null : api.esc(SC[i].name)) + cell(j == null ? null : SO[j].order_id) + cell(j == null ? null : SO[j].customer_id)));
      const cells = [];
      SC.forEach((c, i) => SO.forEach((o, j) => cells.push(mk('jv-gc' + (MATCH(i, j) ? ' m' : ''), MATCH(i, j) ? '✓' : ''))));
      const calls = [mk('jv-call', ''), mk('jv-call', '')];

      let G = GEO.d, scale = 1, sig = '', dirty = true;
      const fit = () => {
        const W = pv.clientWidth, H = pv.clientHeight; if (!W || !H) return;
        const g = W < 470 ? GEO.m : GEO.d;
        if (g !== G) { G = g; }
        scale = Math.min(W / G.ww, H / G.wh, 1.12);
        w.style.width = G.ww + 'px'; w.style.height = G.wh + 'px';
        w.style.transform = `translate(${((W - G.ww * scale) / 2).toFixed(1)}px, ${((H - G.wh * scale) / 2).toFixed(1)}px) scale(${scale.toFixed(4)})`;
        svg.setAttribute('width', G.ww); svg.setAttribute('height', G.wh); svg.setAttribute('viewBox', `0 0 ${G.ww} ${G.wh}`);
        const [x1, y1] = G.cl, [x2] = G.cr, r = G.r, dx = (x2 - x1) / 2, hh = Math.sqrt(r * r - dx * dx);
        cL.setAttribute('cx', x1); cL.setAttribute('cy', y1); cL.setAttribute('r', r);
        cR.setAttribute('cx', x2); cR.setAttribute('cy', y1); cR.setAttribute('r', r);
        lens.setAttribute('d', `M${x1 + dx} ${y1 - hh} A${r} ${r} 0 0 1 ${x1 + dx} ${y1 + hh} A${r} ${r} 0 0 1 ${x1 + dx} ${y1 - hh}Z`);
        w.classList.toggle('jv-mob', G === GEO.m);
        const vars = (el, ws, p) => ws.forEach((v, n) => el.style.setProperty(`--${p}${n}`, v + 'px'));
        cu.concat([tHead[0]]).forEach(el => vars(el, G.tL.cw, 'w'));
        od.concat([tHead[1]]).forEach(el => vars(el, G.tR.cw, 'w'));
        [band, rHead].concat(pr).forEach(el => vars(el, G.rcw, 'c'));
        dirty = true;
      };
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(pv);
      fit();

      // запись стиля только при изменении
      const set = (el, s) => {
        const c = el._c, t = `translate(${s[0].toFixed(1)}px,${s[1].toFixed(1)}px)`;
        if (c.t !== t) { el.style.transform = t; c.t = t; }
        const op = s[4] <= 0.001 ? '0' : s[4] >= 0.999 ? '1' : s[4].toFixed(3);
        if (c.o !== op) { el.style.opacity = op; el.style.visibility = op === '0' ? 'hidden' : 'visible'; c.o = op; }
        const wd = Math.round(s[2]), ht = Math.round(s[3]);
        if (c.w !== wd) { el.style.width = wd + 'px'; c.w = wd; }
        if (c.h !== ht) { el.style.height = ht + 'px'; c.h = ht; }
      };
      const cls = (el, name, on) => { const c = el._c; if (c[name] !== on) { el.classList.toggle(name, on); c[name] = on; } };

      // ===== раскладка каждого шага: [x, y, ширина, высота, прозрачность] и режим фишки =====
      const chipAt = (slot, o) => { const [cx, cy] = G.slot[slot]; return [cx - G.chip[0] / 2, cy - G.chip[1] / 2, G.chip[0], G.chip[1], o]; };
      const rowW = () => G.rcw.reduce((a, b) => a + b, 0) + 6;
      const rowAt = (type, q) => [G.rx, G.ry + ORDERS_OF[type].indexOf(q) * G.rstep, rowW(), G.rh];
      function layout(k) {
        const L = { cu: [], od: [], pr: [], cells: [], mode: { cu: [], od: [] }, dim: { cu: [], od: [] } };
        const inCircles = k >= 1 && k <= 8, grid = k >= 9;
        const tl = G.tL, tr = G.tR, wL = tl.cw[0] + tl.cw[1], wR = tr.cw[0] + tr.cw[1];
        // клиенты
        SC.forEach((c, i) => {
          let s, m = 'tab';
          if (k <= 0) s = [tl.x, tl.y + i * G.tstep, wL, G.th, 1];
          else if (inCircles) { s = chipAt(CU_SLOT[i], 1); m = 'chip'; }
          else { s = [G.gx, G.gy + G.ghh + 6 + i * G.grstep, G.glw, G.grh, 1]; m = 'gl'; }
          L.cu.push(s); L.mode.cu.push(m);
          L.dim.cu.push(inCircles && CU_SLOT[i][0] === 'l' && [2, 3, 6, 8].includes(k));
        });
        // заказы
        SO.forEach((o, j) => {
          let s, m = 'tab';
          const slot = OD_SLOT[j], merged = slot[0] === 'x';
          if (k <= 0) s = [tr.x, tr.y + j * G.tstep, wR, G.th, 1];
          else if (inCircles) { s = chipAt(slot, merged ? 0 : 1); if (merged) { s[0] += 8; s[1] += 3; } m = 'chip'; }
          else { s = [G.gx + G.glw + 6 + j * G.gstep, G.gy, G.gcw, G.ghh, 1]; m = 'gh'; }
          L.od.push(s); L.mode.od.push(m);
          L.dim.od.push(inCircles && !merged && [2, 3, 4, 5, 8].includes(k));
        });
        // строки результата
        const type = STEP_TYPE[k], order = type ? ORDERS_OF[type] : [];
        // видимая строка стоит на своём месте в результате; скрытая ждёт у фишки, из которой появится,
        // а после шага 7 гаснет там, где стояла в FULL или INNER
        PAIRS.forEach(([i, j], q) => {
          const [sx, sy] = G.slot[i != null ? CU_SLOT[i] : OD_SLOT[j]];
          if (order.includes(q)) L.pr.push(rowAt(type, q).concat(1));
          else if (k === 8) L.pr.push(rowAt('FULL', q).concat(0));
          else if (grid) L.pr.push(rowAt(q < 5 ? 'INNER' : 'FULL', q).concat(0));
          else L.pr.push([sx - 18, sy - G.rh / 2, rowW(), G.rh, 0]);
        });
        // клетки «все пары»
        SC.forEach((c, i) => SO.forEach((o, j) => {
          const x = G.gx + G.glw + 6 + j * G.gstep, y = G.gy + G.ghh + 6 + i * G.grstep;
          L.cells.push([x, y, G.gcw, G.grh, grid ? 1 : 0]);
        }));
        L.circ = inCircles ? 1 : 0;
        L.fill = [[0, 0, 0], [.04, .04, .1], [.02, .02, .34], [.02, .02, .34], [.2, .02, .34], [.2, .02, .34], [.02, .2, .34], [.2, .2, .34], [.02, .02, .34], [0, 0, 0], [0, 0, 0]][k < 0 ? 0 : k];
        L.tbl = k <= 0 ? 1 : 0;
        L.badge = inCircles ? 1 : 0;
        L.res = type ? 1 : 0;
        return L;
      }
      // откуда стартует каждый шаг: шаг 0 появляется из прозрачности
      const pre = (() => { const L = layout(0); ['cu', 'od'].forEach(n => L[n] = L[n].map(s => [s[0], s[1] + 10, s[2], s[3], 0])); L.tbl = 0; return L; })();
      const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t), lerp(a[4], b[4], t)];

      // выноски: [x, y, текст, выравнивание l | r | c]
      function callAt(k) {
        const mob = G === GEO.m, S = G.slot, c = [];
        const rowY = n => G.ry + n * G.rstep;
        if (k === 0) c.push(mob ? [160, 292, 'общий столбец — customer_id', 'c'] : [300, 22, 'общий столбец — customer_id', 'c']);
        if (k === 1) c.push(mob ? [160, G.cl[1] + G.r + 4, '106: три заказа, ключ один', 'c'] : [S.x1[0], G.cl[1] + G.r + 10, '106: три заказа, а ключ один', 'c']);
        if (k === 2) c.push(mob ? [160, G.cl[1] + G.r + 4, 'в пересечении: 105, 106, 114', 'c'] : [167, G.cl[1] + G.r + 10, 'в пересечении: 105, 106, 114', 'c']);
        if (k === 3) c.push(mob ? [160, G.cl[1] + G.r + 4, '1 клиент × 3 заказа = 3 строки', 'c'] : [G.rx, rowY(5) + 6, '1 клиент × 3 заказа = 3 строки', 'l']);
        if (k === 4) c.push(mob ? [160, G.cl[1] + G.r + 4, '110 и 116 — без пары, но в итоге', 'c'] : [64, G.cl[1] + G.r + 10, '110 и 116 — без пары, но в итоге', 'l']);
        if (k === 5) c.push(mob ? [160, G.cl[1] + G.r + 4, 'заказа нет → NULL', 'c'] : [G.rx + G.rcw[0] + G.rcw[1] + 4, rowY(7) + 6, 'заказа нет → NULL', 'l']);
        if (k === 6) c.push(mob ? [160, G.cl[1] + G.r + 4, '108 и 111 нет среди клиентов', 'c'] : [G.cr[0] + G.r, G.cl[1] + G.r + 10, '108 и 111 нет среди клиентов', 'r']);
        if (k === 7) c.push(mob ? [160, G.cl[1] + G.r + 4, '9 строк = 5 пар + 2 + 2', 'c'] : [G.rx, rowY(9) + 4, '9 строк = 5 пар + 2 + 2', 'l']);
        if (k === 8) { c.push(mob ? [160, G.cl[1] + G.r + 4, 'ключей 3, а строк 5', 'c'] : [167, G.cl[1] + G.r + 10, 'в круге 3 ключа', 'c']); if (!mob) c.push([G.rx, rowY(5) + 6, 'в результате 5 строк', 'l']); }
        if (k === 9) c.push([G.ww / 2, G.gy + G.ghh + 6 + 5 * G.grstep + 6, '5 × 7 = 35 пар', 'c']);
        if (k === 10) c.push(mob ? [G.ww / 2, G.gy + G.ghh + 6 + 5 * G.grstep + 6, 'ON оставил 5 пар из 35', 'c'] : [G.ww / 2, G.gy + G.ghh + 6 + 5 * G.grstep + 6, 'ON оставил 5 пар из 35; строки 110 и 116 без пары', 'c']);
        return c;
      }

      return {
        render(k, p) {
          // счётчики
          const type = STEP_TYPE[k];
          let rows = '—', small = '';
          if (k === 3) { const n = [0, 1, 2, 3, 4].filter(q => ease(seg(p, .08 + q * .1, .4 + q * .1)) > .5).length; rows = String(n); small = 'INNER'; }
          else if (type) { rows = String(ORDERS_OF[type].length); small = type; }
          else if (k === 9) { rows = String(Math.min(35, Math.floor(seg(p, .1, .75) * 35 + (p >= .75 ? 1 : 0)))); small = 'CROSS'; }
          else if (k === 10) { rows = p < .3 ? '35' : '5'; small = p < .3 ? 'CROSS' : 'ON'; }
          if (k === 4 && p < .5) rows = '5';
          api.hud('rows', rows, small);
          api.hud('keys', k === 0 || (k === 1 && p < .6) ? '—' : '3', k >= 9 ? '' : k >= 1 ? 'из 5 и 5' : '');
          const nul = k === 4 ? (p < .5 ? 0 : 2) : k === 5 || k === 6 ? 2 : k === 7 ? 4 : 0;
          api.hud('nul', k >= 3 && k <= 8 ? String(nul) : '—', nul ? 'строки' : '');

          const key = [k, Math.round(p * 300), G === GEO.m].join('|');
          if (key === sig && !dirty) return; sig = key; dirty = false;
          const A = k === 0 ? pre : layout(k - 1), B = layout(k);
          const T = (d, sp) => ease(seg(p, d, d + (sp || .55)));

          // таблицы шага 0
          const tt = lerp(A.tbl, B.tbl, T(0, .4));
          const tl = G.tL, tr = G.tR;
          set(tTitle[0], [tl.x, G.tTitle, 160, 22, tt]); set(tTitle[1], [tr.x, G.tTitle, 160, 22, tt]);
          set(tHead[0], [tl.x, G.tHead, tl.cw[0] + tl.cw[1], 22, tt]); set(tHead[1], [tr.x, G.tHead, tr.cw[0] + tr.cw[1], 22, tt]);
          cls(w, 'jv-hot', k === 0 && p > .35);
          // круги
          const co = lerp(A.circ, B.circ, T(0, .35));
          const f = [0, 1, 2].map(n => lerp(A.fill[n], B.fill[n], T(.05, .5)));
          cL.style.opacity = co.toFixed(3); cR.style.opacity = co.toFixed(3); lens.style.opacity = co.toFixed(3);
          cL.style.fillOpacity = f[0].toFixed(3); cR.style.fillOpacity = f[1].toFixed(3); lens.style.fillOpacity = f[2].toFixed(3);
          set(lab[0], [G.labL[0], G.labL[1], 120, 20, co]); set(lab[1], [G.labR[0] - 120, G.labR[1], 120, 20, co]);
          // фишки клиентов и заказов
          const mob = G === GEO.m;
          SC.forEach((c, i) => {
            const t = T(k === 1 ? .04 + i * .05 : k === 9 ? .05 + i * .04 : 0, .5);
            set(cu[i], mix(A.cu[i], B.cu[i], t));
            const m = t > .5 ? B.mode.cu[i] : A.mode.cu[i];
            ['tab', 'chip', 'gl'].forEach(n => cls(cu[i], 'm-' + n, m === n));
            cls(cu[i], 'dim', t > .5 ? B.dim.cu[i] : A.dim.cu[i]);
            cls(cu[i], 'x', CU_SLOT[i][0] === 'x' && k >= 2 && k <= 8);
            cls(cu[i], 'lo', CU_SLOT[i][0] === 'l' && (k === 4 || k === 5 || k === 7));
            cls(cu[i], 'nomatch', k === 10 && p > .45 && !SO.some((o, j) => MATCH(i, j)));
          });
          SO.forEach((o, j) => {
            const t = T(k === 1 ? .3 + j * .04 : k === 9 ? .12 + j * .04 : 0, .45);
            set(od[j], mix(A.od[j], B.od[j], t));
            const m = t > .5 ? B.mode.od[j] : A.mode.od[j];
            ['tab', 'chip', 'gh'].forEach(n => cls(od[j], 'm-' + n, m === n));
            cls(od[j], 'dim', t > .5 ? B.dim.od[j] : A.dim.od[j]);
            cls(od[j], 'ro', OD_SLOT[j][0] === 'r' && (k === 6 || k === 7));
            cls(od[j], 'nomatch', k === 10 && p > .45 && !SC.some((c, i) => MATCH(i, j)));
            cls(od[j], 'dup', SO[j].customer_id === 106 && (k === 0 ? p > .35 : k >= 9));
          });
          // метка ×3
          const bo = k === 1 ? seg(p, .6, .8) : lerp(A.badge, B.badge, T(0, .3));
          const [bx, by] = G.slot.x1;
          set(badge, [bx + G.chip[0] / 2 - 10, by - G.chip[1] / 2 - 10, 26, 18, bo]);
          cls(badge, 'pulse', (k === 3 || k === 8) && p > .2);
          // строки результата
          const ro = lerp(A.res, B.res, T(0, .3));
          set(band, [G.rx, G.rBand, rowW(), 18, ro]); set(rHead, [G.rx, G.rHead, rowW(), 20, ro]);
          PAIRS.forEach(([i, j], q) => {
            const d = k === 3 ? (q < 5 ? .08 + q * .1 : 0) : k === 4 || k === 7 ? (q === 5 || q === 6 ? .1 + (q - 5) * .12 : 0) : k === 6 ? (q >= 7 ? .15 + (q - 7) * .12 : 0) : 0;
            const t = T(d, .45);
            set(pr[q], mix(A.pr[q], B.pr[q], t));
            cls(pr[q], 'dup', i === 1 && (k === 3 || k === 8));
            cls(pr[q], 'lo', j == null && (k === 5 || k === 7 || (k === 4 && p > .6)));
            cls(pr[q], 'ro', i == null && (k === 6 || k === 7));
          });
          // все пары
          cells.forEach((el, n) => {
            const i = Math.floor(n / SO.length), j = n % SO.length;
            const d = k === 9 ? .1 + n * .018 : 0;
            const t = k === 9 ? ease(seg(p, d, d + .12)) : T(0, .4);
            set(el, mix(A.cells[n], B.cells[n], t));
            cls(el, 'on', k === 9 || (k === 10 && p < .3));
            cls(el, 'hit', k === 10 && p >= .3 && MATCH(i, j));
            cls(el, 'miss', k === 10 && p >= .3 && !MATCH(i, j));
          });
          // выноски
          const cs = p > .45 ? callAt(k) : [];
          // выноски: только положение и прозрачность, размер по тексту
          calls.forEach((el, n) => {
            const c = cs[n], C = el._c;
            const op = c ? (seg(p, .45, .6) >= .999 ? '1' : seg(p, .45, .6).toFixed(3)) : '0';
            if (c) {
              if (C.txt !== c[2]) { el.textContent = c[2]; C.txt = c[2]; }
              if (C.al !== c[3]) { el.dataset.al = c[3]; C.al = c[3]; }
              const t = `translate(${c[0].toFixed(1)}px,${c[1].toFixed(1)}px)`;
              if (C.t !== t) { el.style.transform = t; C.t = t; }
            }
            if (C.o !== op) { el.style.opacity = op; el.style.visibility = op === '0' ? 'hidden' : 'visible'; C.o = op; }
          });
        }
      };
    }
  };

  scene.steps.forEach(st => { st.body = nb(st.body); });

  /* ===================== Интерактив «Соедини и посчитай» ===================== */
  function buildJoin(box, api) {
    const { $, esc, hl, plural } = api;
    const rowsW = n => `${n} ${plural(n, ['строка', 'строки', 'строк'])}`;
    const KEY_LBL = { id: 'customer_id', ch: 'channel', both: 'customer_id + channel' };
    box.innerHTML = `<div class="block-hd"><span class="t">Строк столько, сколько пар нашло условие ON <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="jq-reset">Сбросить</button></div></div>
<div class="tabs jq-tabs" role="group" aria-label="Режим интерактива"><button type="button" data-tab="a" aria-pressed="true">Соединить и посчитать</button><button type="button" data-tab="b" aria-pressed="false">Клиенты без заказов</button></div>
<div class="jq-pane" id="jq-a">
<p class="hint jq-do">Меняйте тип соединения и ключ прямо в запросе. Строка с <code>--</code> — комментарий: нажмите на неё, чтобы включить условие. Фильтр <code>o.status = 'paid'</code> стоит либо в ON, либо в WHERE.</p>
<div class="jq-top"><pre class="jq-sql" id="jq-sql"><span id="jq-sel"></span>
${hl('FROM sample_customers AS c', 'sql')}
<select id="jq-type" aria-label="Тип соединения">${JTYPES.map(t => `<option value="${t}">${t}</option>`).join('')}</select>${hl(' JOIN sample_orders AS o', 'sql')}<span id="jq-on">
  ${hl('ON', 'sql')} <select id="jq-key" aria-label="Условие соединения">${['id', 'ch'].map(k => `<option value="${k}">${esc(JKEYS[k])}</option>`).join('')}</select><span id="jq-cmp">
<button type="button" class="jq-cond" id="jq-fch" data-c="1"></button></span>
<button type="button" class="jq-cond" id="jq-fon" data-f="on"></button></span>
<button type="button" class="jq-cond" id="jq-fwh" data-f="where"></button>
${hl('ORDER BY c.customer_id, o.order_id;', 'sql')}</pre>
<div class="readout jq-ro"><div><span class="big" id="jq-n"></span><span class="lbl">строк в результате</span></div><div><span class="big" id="jq-dc"></span><span class="lbl">клиентов из 5 · COUNT(DISTINCT)</span></div><div><span class="big" id="jq-nu"></span><span class="lbl">строк с NULL</span></div></div></div>
<div class="jq-tables"><div class="jq-src"><div class="jq-t" id="jq-tc"></div><div class="jq-t" id="jq-to"></div></div><div class="jq-t jq-res" id="jq-res"></div></div>
<div class="jq-foot"><div class="narr-text jq-msg" id="jq-msg"></div><div><p class="jq-cap">Задания</p><ol class="steps jq-tasks" id="jq-ta"></ol></div></div>
</div>
<div class="jq-pane" id="jq-b" hidden>
<p class="hint jq-do">Три запроса ищут клиентов без заказов. В каждом не хватает одной части: выберите её и сравните ответы. Потом добавьте гостевой заказ без клиента.</p>
<label class="chk jq-guest"><input type="checkbox" id="jq-guest"> в sample_orders есть гостевой заказ 9001 с customer_id = NULL</label>
<div class="jq-cards" id="jq-cards"></div>
<div class="jq-foot jq-foot-b"><p class="jq-cap">Задания</p><ol class="steps jq-tasks" id="jq-tb"></ol></div>
</div>
<div class="status"><span><span class="dot live"></span><span id="jq-s1"></span></span><span class="grow"></span><span id="jq-s2"></span></div>`;

    const TASKS_A = [
      ['Ульяна М. встречается трижды, а клиентов без заказов в результате нет.', R => R.rows.filter(r => r.c === 1).length === 3 && !R.rows.some(r => r.o == null)],
      ['В результате все пятеро клиентов, но только оплаченные заказы.', R => new Set(R.rows.filter(r => r.c != null).map(r => r.c)).size === 5 && R.rows.every(r => r.c != null && (r.o == null || SO[r.o].status === 'paid'))],
      ['Условие о статусе стоит в WHERE при LEFT JOIN: кто пропал?', R => R.type === 'LEFT' && R.filt === 'where' && R.key === 'id'],
      ['Ключ, при котором Фёдору Б. достаются чужие заказы.', R => R.rows.some(r => r.c === 4 && r.o != null)]
    ];
    const RIGHT_SET = '2,4';
    const correct = (m, opt, guest) => opt != null && antiRows(m, opt, guest).join(',') === RIGHT_SET;
    const TASKS_B = [
      ['LEFT JOIN … IS NULL находит клиентов без заказов.', s => correct('left', s.b.left, s.b.guest)],
      ['NOT EXISTS находит тех же.', s => correct('exists', s.b.exists, s.b.guest)],
      ['NOT IN или EXCEPT находит тех же.', s => s.b.third === 'except' || correct('notin', s.b.notin, s.b.guest)],
      ['С гостевым заказом один способ ломается — почините его.', s => s.b.guest && s.b.third === 'notin' && s.b.notin === 'nn']
    ];
    let s;
    const fresh = () => ({ tab: 'a', type: 'LEFT', key: 'id', comp: false, filt: 'none', doneA: [0, 0, 0, 0], b: { left: null, exists: null, notin: null, third: 'notin', guest: false }, doneB: [0, 0, 0, 0] });

    // ===== вкладка A =====
    const srcTable = (name, rows, cols, keyCols, used) => `<div class="jq-cap"><b>${name}</b><span>${rowsW(rows.length)}</span></div><div class="jq-scroll"><table><thead><tr>${cols.map(c => `<th${keyCols.includes(c) ? ' class="kc"' : ''}>${c}</th>`).join('')}<th class="jq-x" title="Сколько строк результата дала эта строка">в итоге</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${used[i] ? '' : 'gone'}">${cols.map(c => `<td${keyCols.includes(c) ? ' class="kc"' : ''}>${r[c] == null ? '<i class="nul">NULL</i>' : esc(r[c])}</td>`).join('')}<td class="jq-x${used[i] > 1 ? ' many' : ''}">×${used[i]}</td></tr>`).join('')}</tbody></table></div>`;
    function drawA() {
      const kk = s.type === 'CROSS' ? 'id' : s.key === 'id' && s.comp ? 'both' : s.key;
      const rows = joinRows(s.type, kk, s.filt);
      const R = { rows, type: s.type, key: kk, filt: s.filt };
      TASKS_A.forEach((t, n) => { if (t[1](R)) s.doneA[n] = 1; });
      // запрос
      $('jq-sel').innerHTML = hl(`SELECT ${joinCols(kk).map(([t, c]) => `${t}.${c}`).join(', ')}`, 'sql');
      $('jq-type').value = s.type; $('jq-key').value = s.key;
      $('jq-on').hidden = s.type === 'CROSS'; $('jq-cmp').hidden = s.key !== 'id';
      const fch = $('jq-fch'); fch.textContent = (s.comp ? '' : '-- ') + `  AND ${CH_EQ}`; fch.classList.toggle('on', s.comp); fch.setAttribute('aria-pressed', String(s.comp));
      fch.setAttribute('aria-label', s.comp ? 'Убрать вторую часть ключа: channel' : 'Добавить вторую часть ключа: channel');
      const cond = (el, f, txt) => { const on = s.filt === f; el.textContent = (on ? '' : '-- ') + txt; el.classList.toggle('on', on); el.setAttribute('aria-pressed', String(on)); el.setAttribute('aria-label', on ? `Убрать условие ${PAID} из ${f === 'on' ? 'ON' : 'WHERE'}` : `Поставить условие ${PAID} в ${f === 'on' ? 'ON' : 'WHERE'}`); };
      cond($('jq-fon'), 'on', `  AND ${PAID}`); cond($('jq-fwh'), 'where', `WHERE ${PAID}`);
      // исходные таблицы: ключевые столбцы и сколько раз строка попала в результат
      const keyCols = s.type === 'CROSS' ? [] : kk === 'id' ? ['customer_id'] : kk === 'ch' ? ['channel'] : ['customer_id', 'channel'];
      const uc = SC.map((c, i) => rows.filter(r => r.c === i).length), uo = SO.map((o, j) => rows.filter(r => r.o === j).length);
      $('jq-tc').innerHTML = srcTable('sample_customers', SC, ['customer_id', 'name', 'channel'], keyCols, uc);
      $('jq-to').innerHTML = srcTable('sample_orders', SO, ['order_id', 'customer_id', 'channel', 'status'], keyCols, uo);
      // результат
      const cols = joinCols(kk);
      const rep = new Set(SC.map((c, i) => i).filter(i => uc[i] > 1));
      $('jq-res').innerHTML = `<div class="jq-cap"><b>результат</b><span>${rowsW(rows.length)}</span></div><div class="jq-scroll jq-rs"><table><thead><tr>${cols.map(([t, c]) => `<th${t === 'o' ? ' class="o"' : ''}>${t}.${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r => {
        const cRow = r.c == null ? null : SC[r.c], oRow = r.o == null ? null : SO[r.o];
        const kind = cRow && oRow ? '' : cRow ? 'lo' : 'ro';
        return `<tr class="${kind}${r.c != null && rep.has(r.c) ? ' rep' : ''}">${cols.map(([t, c]) => { const x = t === 'c' ? cRow : oRow; return x ? `<td${t === 'o' ? ' class="o"' : ''}>${esc(x[c])}</td>` : '<td class="nul">NULL</td>'; }).join('')}</tr>`;
      }).join('')}</tbody></table></div>`;
      // числа
      const dc = new Set(rows.filter(r => r.c != null).map(r => r.c)).size, nu = rows.filter(r => r.c == null || r.o == null).length;
      $('jq-n').textContent = rows.length; $('jq-dc').textContent = dc; $('jq-nu').textContent = nu;
      // объяснение
      const names = ix => ix.map(i => SC[i].name).join(', ');
      const lost = SC.map((c, i) => i).filter(i => !uc[i]);
      const lonely = rows.filter(r => r.o == null).map(r => r.c);
      let m = '';
      if (s.type === 'CROSS') m = `CROSS JOIN не сравнивает ключи: каждый из 5 клиентов встал рядом с каждым из 7 заказов, 5 × 7 = 35 пар${s.filt === 'where' ? `. WHERE оставил ${rows.length}: отменённый заказ 1036 выпал у всех пятерых` : ''}. `;
      else {
        const mult = [...rep].map(i => `${SC[i].name} — ${uc[i]} ${plural(uc[i], ['строка', 'строки', 'строк'])}`).join('; ');
        if (kk === 'ch') m += `channel — не ключ: канал привлечения клиента и канал заказа совпадают случайно, а значения повторяются с обеих сторон. Каждый клиент сцепился со всеми заказами своего канала: ${mult}. `;
        else if (mult) m += `Строки размножились по числу пар: ${mult}. `;
        if (kk === 'both') m += 'Составное условие требует совпадения обоих столбцов: заказ 1035 Ульяна М. сделала через органику, а пришла из рекламы, и пары он не нашёл. ';
        if (lonely.length) m += `Без пары остались ${names(lonely)} — в столбцах orders у них NULL. `;
        if (rows.some(r => r.c == null)) m += `Заказы ${rows.filter(r => r.c == null).map(r => SO[r.o].order_id).join(', ')} без пары слева: в столбцах customers NULL. `;
        if (s.filt === 'on') m += s.type === 'LEFT' ? 'Условие в ON решает, какой заказ считать парой: отменённый 1036 пары не нашёл, но все клиенты на месте. ' : s.type === 'INNER' ? 'Для INNER JOIN всё равно, где стоит условие: в WHERE результат тот же. ' : '';
        if (s.filt === 'where') m += s.type === 'LEFT' || s.type === 'FULL' ? `WHERE выполняется после соединения: у строк без пары o.status = NULL, сравнение даёт UNKNOWN, и такие строки выпали${lost.length ? `, а с ними клиенты ${lost.map(i => SC[i].customer_id).join(' и ')}` : ''}. ${s.type === 'LEFT' ? 'LEFT JOIN стал INNER.' : ''} ` : s.type === 'INNER' ? 'Для INNER JOIN всё равно, где стоит условие: в ON результат тот же. ' : '';
      }
      $('jq-msg').textContent = m.trim();
      $('jq-ta').innerHTML = TASKS_A.map((t, i) => `<li class="${s.doneA[i] ? 'on' : ''}"><b>${s.doneA[i] ? '✓' : i + 1}</b>${esc(t[0])}</li>`).join('');
      s.R = R; s.dc = dc; s.nu = nu;
    }

    // ===== вкладка B =====
    const CARD = [
      { m: 'left', title: '1 · LEFT JOIN … IS NULL', slot: 'условие в WHERE' },
      { m: 'exists', title: '2 · NOT EXISTS', slot: 'условие подзапроса' },
      { m: 'third', title: '3 · на выбор', slot: 'подзапрос' }
    ];
    const WHY = {
      'left:eqnull': 'Ноль строк: сравнение = NULL всегда даёт UNKNOWN, и WHERE не пропускает ни одной строки.',
      'left:notnull': 'Это клиенты с заказами, и Ульяна М. повторилась трижды — по числу заказов.',
      'exists:paid': 'Ноль строк: подзапрос не связан с c и находит оплаченный заказ для любого клиента.',
      'exists:canc': 'Это клиенты без отменённых заказов — ответ на другой вопрос.',
      'notin:oid': 'customer_id сравнили с номерами заказов: совпадений нет, вернулись все пятеро.',
      'notin:all:guest': 'Ноль строк: в списке подзапроса есть NULL, и c.customer_id NOT IN (…) для каждого клиента — UNKNOWN.'
    };
    function cardSQL(m, opt) {
      if (m === 'except') return hl(antiSQL('except'), 'sql');
      const k0 = Object.keys(ANTI[m].opts)[0], ph = '__SLOT__';
      const slot = opt == null ? '<span class="jq-slot empty">…</span>' : `<span class="jq-slot">${hl(ANTI[m].opts[opt], 'sql')}</span>`;
      return hl(antiSQL(m, k0).replace(ANTI[m].opts[k0], ph), 'sql').replace(ph, slot);
    }
    function buildCards() {
      $('jq-cards').innerHTML = CARD.map(c => `<div class="jq-card" data-card="${c.m}"><div class="jq-ch"><b>${c.title}</b>${c.m === 'third' ? '<span class="seg" role="group" aria-label="Третий способ"><button type="button" data-third="notin">NOT IN</button><button type="button" data-third="except">EXCEPT</button></span>' : ''}</div><div class="jq-opts" role="group" aria-label="Недостающая часть: ${c.slot}"></div><pre class="jq-sql jq-csql"></pre><div class="jq-cres"></div></div>`).join('');
    }
    function drawB() {
      const b = s.b;
      CARD.forEach(c => {
        const el = box.querySelector(`[data-card="${c.m}"]`);
        const m = c.m === 'third' ? b.third : c.m, opt = m === 'except' ? 'x' : b[m];
        const pre = el.querySelector('pre'), opts = el.querySelector('.jq-opts');
        const sig = `${m}|${opt}`;
        if (pre.dataset.sig !== sig) {
          pre.innerHTML = cardSQL(m, m === 'except' ? null : opt); pre.dataset.sig = sig;
          opts.hidden = m === 'except';
          opts.innerHTML = m === 'except' ? '' : Object.entries(ANTI[m].opts).map(([k, v]) => `<button type="button" class="jq-opt" data-m="${m}" data-opt="${k}" aria-pressed="${opt === k}">${esc(v)}</button>`).join('');
        }
        el.querySelectorAll('[data-third]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.third === b.third)));
        const res = el.querySelector('.jq-cres');
        if (opt == null) { res.innerHTML = '<p class="jq-wait">Выберите недостающую часть.</p>'; el.classList.remove('ok', 'no'); return; }
        const ids = antiRows(m, opt, b.guest), ok = ids.join(',') === RIGHT_SET;
        const why = WHY[`${m}:${opt}:${b.guest ? 'guest' : ''}`] || WHY[`${m}:${opt}`];
        const chips = ids.length ? ids.map(i => `<span class="jq-chip">${SC[i].customer_id}${m === 'except' ? '' : ` ${esc(SC[i].name)}`}</span>`).join('') : '<span class="jq-empty">(0 rows)</span>';
        let note = ok ? (m === 'except' ? 'Верно, но EXCEPT вернул только customer_id: имена пришлось бы подтягивать отдельно.' : m === 'notin' && opt === 'all' ? 'Верно — пока в подзапросе нет NULL.' : 'Верно: у этих клиентов нет ни одного заказа в выборке.') : why || '';
        res.innerHTML = `<div class="jq-chips">${chips}</div><p class="jq-verd ${ok ? 'ok' : 'no'}"><b>${ok ? '✓' : '✗'} ${rowsW(ids.length)}.</b> ${esc(note)}</p>`;
        el.classList.toggle('ok', ok); el.classList.toggle('no', !ok);
      });
      $('jq-guest').checked = b.guest;
      TASKS_B.forEach((t, n) => { if (t[1](s)) s.doneB[n] = 1; });
      $('jq-tb').innerHTML = TASKS_B.map((t, i) => `<li class="${s.doneB[i] ? 'on' : ''}"><b>${s.doneB[i] ? '✓' : i + 1}</b>${esc(t[0])}</li>`).join('');
    }
    const okCount = () => [correct('left', s.b.left, s.b.guest), correct('exists', s.b.exists, s.b.guest), s.b.third === 'except' || correct('notin', s.b.notin, s.b.guest)].filter(Boolean).length;

    function draw() {
      box.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === s.tab)));
      $('jq-a').hidden = s.tab !== 'a'; $('jq-b').hidden = s.tab !== 'b';
      drawA(); drawB();
      if (s.tab === 'a') {
        $('jq-s1').textContent = `customers 5 · orders 7 → ${rowsW(s.R.rows.length)}`;
        $('jq-s2').textContent = `COUNT(*) = ${s.R.rows.length} · COUNT(DISTINCT c.customer_id) = ${s.dc}`;
      } else {
        $('jq-s1').textContent = `Верных способов: ${okCount()} из 3`;
        $('jq-s2').textContent = `sample_orders: 7 строк${s.b.guest ? ' + гостевой заказ с NULL' : ''}`;
      }
    }
    box.addEventListener('click', e => {
      const tb = e.target.closest('[data-tab]'), f = e.target.closest('.jq-cond'), th = e.target.closest('[data-third]'), op = e.target.closest('[data-opt]');
      if (tb) { s.tab = tb.dataset.tab; draw(); }
      else if (f && f.dataset.c) { s.comp = !s.comp; draw(); }
      else if (f) { s.filt = s.filt === f.dataset.f ? 'none' : f.dataset.f; draw(); }
      else if (th) { s.b.third = th.dataset.third; draw(); }
      else if (op) { s.b[op.dataset.m] = op.dataset.opt; draw(); }
    });
    box.addEventListener('change', e => {
      const t = e.target;
      if (t.id === 'jq-type') { s.type = t.value; if (s.type === 'CROSS' && s.filt === 'on') s.filt = 'where'; draw(); }
      else if (t.id === 'jq-key') { s.key = t.value; draw(); }
      else if (t.id === 'jq-guest') { s.b.guest = t.checked; draw(); }
    });
    $('jq-reset').addEventListener('click', () => { const tab = s.tab; s = fresh(); s.tab = tab; buildCards(); draw(); });
    s = fresh(); buildCards(); draw();
    return {
      describe() {
        const b = s.b, st = (m, opt) => opt == null ? 'не выбрано' : `${ANTI[m].opts[opt]} → ${antiRows(m, opt, b.guest).length} строк`;
        return `вкладка «${s.tab === 'a' ? 'Соединить и посчитать' : 'Клиенты без заказов'}». Соединение: ${s.type} JOIN${s.type === 'CROSS' ? '' : ` ON ${JKEYS[s.R.key]}`}, условие o.status = 'paid' ${s.filt === 'none' ? 'не используется' : s.filt === 'on' ? 'в ON' : 'в WHERE'}; строк ${s.R.rows.length}, клиентов ${s.dc} из 5, строк с NULL ${s.nu}; заданий выполнено ${s.doneA.filter(Boolean).length} из 4. Клиенты без заказов: LEFT JOIN — ${st('left', b.left)}; NOT EXISTS — ${st('exists', b.exists)}; третий способ — ${b.third === 'except' ? 'EXCEPT' : `NOT IN, ${st('notin', b.notin)}`}; гостевой заказ с NULL ${b.guest ? 'добавлен' : 'не добавлен'}.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  const Q = {
    q1: { sec: 'method', title: 'Сначала предскажите', q: "В запросе ниже LEFT JOIN по customer_id и условие o.status = 'paid' в ON: все пять клиентов на месте, Егор С. и Фёдор Б. — с NULL в столбцах orders. Что с ними станет, если перенести условие в WHERE?", opts: [['Останутся с NULL: LEFT JOIN сохраняет все строки слева'], ['Пропадут: WHERE проверяет строки уже после соединения, а NULL = \'paid\' не даёт TRUE', 1], ['Получат заказы других клиентов'], ['Запрос упадёт: в WHERE нельзя ссылаться на правую таблицу']],
      why: 'Порядок выполнения из 3.1: сначала FROM с JOIN собирает таблицу, потом WHERE её фильтрует. У клиентов без пары o.status — NULL, сравнение с NULL даёт UNKNOWN, а WHERE пропускает только TRUE. Поэтому они выпадают, и LEFT JOIN работает как INNER. Чужие заказы появляются от неверного ключа, а не от места фильтра, и ссылаться в WHERE на правую таблицу можно. Проверьте в интерактиве.' },
    q2: { sec: 'idea', q: 'В сцене в пересечении кругов три ключа: 105, 106 и 114. У клиента 106 три заказа, у 105 и 114 — по одному. Сколько строк вернёт INNER JOIN?', opts: [['3 — по одной на общий ключ'], ['5 — каждый заказ встаёт рядом со своим клиентом', 1], ['7 — столько, сколько заказов'], ['15 — 5 клиентов × 3 ключа']],
      why: 'Соединение возвращает пары строк, а не ключи: 105 даёт одну пару, 106 — три (одна строка клиента × три заказа), 114 — одну, всего 5. Три — это число ключей в пересечении, круги считают именно их. Семь было бы при RIGHT JOIN: к пяти парам добавятся два заказа без клиента. 15 не следует ни из одного правила соединения.' },
    q3: { sec: 'nuances', q: "Отчёт должен показать всех клиентов и их мартовские заказы. Аналитик написал customers LEFT JOIN orders ON o.customer_id = c.customer_id WHERE o.order_date >= '2026-03-01', и клиентов в отчёте стало меньше. Почему?", opts: [['LEFT JOIN не работает с датами'], ['WHERE отбросил строки, где o.order_date = NULL, — клиентов без мартовских заказов; условие на дату нужно перенести в ON', 1], ['База переставила таблицы местами, и левой стала orders'], ['В orders есть дубли customer_id']],
      why: 'У клиентов без мартовских заказов после соединения o.order_date либо относится к другому месяцу, либо равна NULL, и WHERE их выбрасывает: фильтр по правой таблице в WHERE превращает LEFT в INNER. В ON условие решает только, какой заказ считать парой, и клиенты без пары остаются с NULL. Типы данных и порядок таблиц тут ни при чём, а дубли customer_id добавили бы строки, а не убрали.' },
    q4: { sec: 'idea', q: 'В подзапросе SELECT referrer_id FROM customers есть NULL. Чем NOT EXISTS отличается от NOT IN в такой ситуации?', opts: [['Ничем: оба вернут клиентов, которые никого не пригласили'], ['NOT IN вернёт 0 строк, а NOT EXISTS — верный список', 1], ['NOT EXISTS упадёт с ошибкой из-за NULL'], ['NOT IN пропустит только клиентов с NULL в referrer_id']],
      why: 'x NOT IN (a, b, NULL) раскрывается в x <> a AND x <> b AND x <> NULL, а последнее сравнение — UNKNOWN, поэтому условие ни для кого не становится TRUE. В учебной базе это 0 строк вместо 45. NOT EXISTS проверяет, нашлась ли хоть одна строка подзапроса с совпавшим ключом, и NULL ему не мешает. Ошибки нет ни в одном случае, а NOT IN ломается целиком, а не для отдельных строк.' },
    q5: { sec: 'idea', q: 'Когда CROSS JOIN нужен на самом деле?', opts: [['Когда нужны все сочетания двух списков, например каждый день × каждый канал, чтобы потом подставить нули там, где заказов не было', 1], ['Когда ключ неуникален и INNER JOIN размножает строки'], ['Чтобы ускорить INNER JOIN на больших таблицах'], ['Вместо LEFT JOIN, если в правой таблице есть NULL']],
      why: 'CROSS JOIN даёт все пары без условия — декартово произведение. Это полезно, когда сочетания нужны все: календарь × каналы, товары × склады. От дублей ключа CROSS не спасает, он перемножает всё. Он не быстрее INNER: строк у него больше. NULL в правой таблице решают условием и типом соединения, а не отказом от условия.' },
    q6: { sec: 'code', q: 'После соединения orders с order_items сумма amount почти удвоилась: 2 069 300 вместо 1 051 380 ₽. Что произошло?', code: 'SELECT count(*), count(DISTINCT o.order_id), sum(o.amount)\nFROM orders AS o\nJOIN order_items AS i ON i.order_id = o.order_id;', lang: 'sql', opts: [['Строка заказа повторилась столько раз, сколько в нём товаров, и amount каждого заказа сложился несколько раз', 1], ['JOIN потерял часть заказов, и сумма пересчиталась'], ['В order_items попали отменённые заказы'], ['SUM считает NULL как единицу']],
      why: 'order_id в order_items неуникален: 388 строк на 231 заказ. Соединение «один ко многим» размножило строки orders, и sum(o.amount) сложил сумму заказа столько раз, сколько в нём позиций. count(DISTINCT o.order_id) = 231 показывает, что ни один заказ не потерялся. Отменённые заказы есть и в orders, они сумму не удваивают, а NULL функция SUM пропускает.' },
    q7: { sec: 'code', q: 'В customers 60 клиентов, referrer_id заполнен у 16. Сколько строк вернёт customers AS c JOIN customers AS r ON r.customer_id = c.referrer_id?', opts: [['60 — по строке на клиента'], ['16 — у остальных 44 в ключе NULL, и пары нет', 1], ['44 — те, кого никто не приглашал'], ['3 600 — каждый с каждым']],
      why: 'Самосоединение — обычный JOIN двух копий таблицы. Строки с NULL в referrer_id пару не находят: NULL не равен ничему, даже другому NULL. Остаются 16 пар «приглашённый — пригласивший». 60 строк дал бы LEFT JOIN, 44 — это как раз выпавшие, а 3 600 — CROSS JOIN без условия.' }
  };
  Object.values(Q).forEach(q => { q.q = nb(q.q); q.why = nb(q.why); q.opts = q.opts.map(o => [nb(o[0])].concat(o.slice(1))); if (q.title) q.title = nb(q.title); });

  const GL = {
    join: { t: 'Соединение', en: 'JOIN', d: 'Операция, которая ставит рядом строки двух таблиц, если для пары выполнено условие.' },
    key: { t: 'Ключ соединения', en: 'join key', d: 'Столбец или набор столбцов, по равенству которых строке ищут пару в другой таблице.' },
    null: { t: 'NULL', en: 'NULL', d: 'Отметка «значения нет». Любое сравнение с NULL даёт UNKNOWN, даже NULL = NULL.' },
    venn: { t: 'Диаграмма Венна', en: 'Venn diagram', d: 'Круги, изображающие множества и их пересечения. Для JOIN верна, пока ключи уникальны.' },
    inner: { t: 'Внутреннее соединение', en: 'INNER JOIN', d: 'Соединение, которое оставляет только пары строк, для которых выполнено условие ON.' },
    outer: { t: 'Внешнее соединение', en: 'LEFT, RIGHT, FULL OUTER JOIN', d: 'Соединение, которое добавляет к парам строки без пары из левой, правой или обеих таблиц, а чужие столбцы заполняет NULL.' },
    cross: { t: 'Перекрёстное соединение', en: 'CROSS JOIN', d: 'Соединение без условия: каждая строка одной таблицы с каждой строкой другой.' },
    alias: { t: 'Псевдоним таблицы', en: 'table alias', d: 'Короткое имя таблицы после AS: customers AS c, дальше пишут c.customer_id.' },
    on: { t: 'Условие соединения', en: 'join condition, ON', d: 'Логическое выражение после ON, которое проверяется для каждой пары строк.' },
    tvl: { t: 'Троичная логика', en: 'three-valued logic', d: 'Логика SQL с тремя значениями: TRUE, FALSE и UNKNOWN. WHERE и ON пропускают только TRUE.' },
    cardinality: { t: 'Кардинальность связи', en: 'cardinality', d: 'Сколько строк одной таблицы может соответствовать строке другой: один к одному, один ко многим, многие ко многим.' },
    fanout: { t: 'Размножение строк', en: 'fan-out', d: 'Рост числа строк после соединения по неуникальному ключу: строка повторяется по разу на каждую пару.' },
    selfjoin: { t: 'Самосоединение', en: 'self join', d: 'Соединение таблицы с самой собой под двумя псевдонимами.' },
    pk: { t: 'Первичный ключ', en: 'primary key', d: 'Столбец или набор столбцов с уникальными значениями без NULL: по нему строку находят однозначно.' },
    composite: { t: 'Составной ключ', en: 'composite key', d: 'Ключ из нескольких столбцов: строку определяет только сочетание их значений.' },
    antijoin: { t: 'Анти-соединение', en: 'anti-join', d: 'Запрос, который оставляет строки одной таблицы, для которых в другой не нашлось пары.' },
    subquery: { t: 'Подзапрос', en: 'subquery', d: 'Запрос в скобках внутри другого запроса. Подробно — на странице 3.4.' },
    correlated: { t: 'Коррелированный подзапрос', en: 'correlated subquery', d: 'Подзапрос, который ссылается на строку внешнего запроса и проверяется для каждой из них.' },
    except: { t: 'EXCEPT', en: 'EXCEPT', d: 'Разность множеств: строки первого запроса, которых нет во втором, без повторов.' },
    temp: { t: 'Временная таблица', en: 'temporary table', d: 'Таблица, которая живёт до конца сеанса подключения.' },
    planner: { t: 'Планировщик', en: 'query planner', d: 'Часть СУБД, которая выбирает порядок соединений и способ выполнения запроса.' }
  };
  Object.values(GL).forEach(g => { g.d = nb(g.d); });

  window.PAGE = {
    id: 'da-3-2',
    short: 'DA-03',
    title: 'JOIN',
    where: 'блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.2',
    aiData: 'учебная база интернет-магазина shop в PostgreSQL 16 (customers — 60 клиентов, orders — 231 заказ, order_items, order_status_log, countries) и выборка из неё: 5 клиентов из России, пришедших в декабре 2025, и 7 заказов за 11–13 января 2026',
    scene,
    widgets: { join: buildJoin },
    code: {
      types: {"title": "Пять типов JOIN на одной паре таблиц: 5, 7, 7, 9 и 35 строк", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- Выборка из сцены и интерактива — во временных таблицах\nCREATE TEMP TABLE sample_customers AS\nSELECT customer_id, name, channel\nFROM customers\nWHERE country_code = 'RU' AND signup_date < '2026-01-01';\n\nCREATE TEMP TABLE sample_orders AS\nSELECT order_id, customer_id, channel, status\nFROM orders\nWHERE order_date BETWEEN '2026-01-11' AND '2026-01-13';\n\n-- FULL JOIN: пары, клиенты без заказов и заказы без клиента\nSELECT c.customer_id, c.name, o.order_id, o.customer_id\nFROM sample_customers AS c\nFULL JOIN sample_orders AS o ON o.customer_id = c.customer_id\nORDER BY c.customer_id, o.order_id;\n\n-- Сколько строк даёт каждый тип соединения\nSELECT 'INNER' AS join_type, count(*) AS n_rows\nFROM sample_customers AS c\nINNER JOIN sample_orders AS o ON o.customer_id = c.customer_id\nUNION ALL\nSELECT 'LEFT', count(*)\nFROM sample_customers AS c\nLEFT JOIN sample_orders AS o ON o.customer_id = c.customer_id\nUNION ALL\nSELECT 'RIGHT', count(*)\nFROM sample_customers AS c\nRIGHT JOIN sample_orders AS o ON o.customer_id = c.customer_id\nUNION ALL\nSELECT 'FULL', count(*)\nFROM sample_customers AS c\nFULL JOIN sample_orders AS o ON o.customer_id = c.customer_id\nUNION ALL\nSELECT 'CROSS', count(*)\nFROM sample_customers AS c\nCROSS JOIN sample_orders AS o;", "out": "SELECT 5\nSELECT 7\n customer_id |   name    | order_id | customer_id \n-------------+-----------+----------+-------------\n         105 | Роман К.  |     1027 |         105\n         106 | Ульяна М. |     1034 |         106\n         106 | Ульяна М. |     1035 |         106\n         106 | Ульяна М. |     1036 |         106\n         110 | Егор С.   |     NULL |        NULL\n         114 | Вера М.   |     1088 |         114\n         116 | Фёдор Б.  |     NULL |        NULL\n        NULL | NULL      |     1041 |         108\n        NULL | NULL      |     1062 |         111\n(9 rows)\n\n join_type | n_rows \n-----------+--------\n INNER     |      5\n LEFT      |      7\n RIGHT     |      7\n FULL      |      9\n CROSS     |     35\n(5 rows)", "outLabel": "Вывод psql", "note": "Пустое значение psql печатает словом NULL, потому что вывод запущен с <code>-P null=NULL</code>; без этой настройки там была бы пустая ячейка. «SELECT 5» и «SELECT 7» — столько строк легло во временные таблицы. Внутри строк одного типа порядок задаёт ORDER BY, а NULL при сортировке по возрастанию в PostgreSQL идут последними."},
      anti: {"title": "Анти-соединение: четыре способа находят 8 клиентов, пока в подзапросе нет NULL", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- Клиенты без заказов: 1) LEFT JOIN … IS NULL\nSELECT c.customer_id, c.name\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL\nORDER BY c.customer_id;\n\n-- 2) NOT EXISTS: нет ни одного заказа с ключом этого клиента\nSELECT count(*) AS not_exists\nFROM customers AS c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders AS o WHERE o.customer_id = c.customer_id\n);\n\n-- 3) NOT IN и 4) EXCEPT\nSELECT count(*) AS not_in\nFROM customers AS c\nWHERE c.customer_id NOT IN (SELECT o.customer_id FROM orders AS o);\n\nSELECT count(*) AS except_rows\nFROM (\n  SELECT customer_id FROM customers\n  EXCEPT\n  SELECT customer_id FROM orders\n) AS t;\n\n-- NOT IN ломается, когда в подзапросе есть NULL:\n-- кто из клиентов никого не пригласил?\nSELECT count(*) AS not_in\nFROM customers AS c\nWHERE c.customer_id NOT IN (SELECT referrer_id FROM customers);\n\nSELECT count(*) AS not_exists\nFROM customers AS c\nWHERE NOT EXISTS (\n  SELECT 1 FROM customers AS r WHERE r.referrer_id = c.customer_id\n);", "out": " customer_id |   name    \n-------------+-----------\n         124 | Вера С.\n         126 | Полина Б.\n         127 | Тимур В.\n         132 | Глеб С.\n         133 | Ирина А.\n         150 | Анна К.\n         151 | Лена С.\n         160 | Кирилл А.\n(8 rows)\n\n not_exists \n------------\n          8\n(1 row)\n\n not_in \n--------\n      8\n(1 row)\n\n except_rows \n-------------\n           8\n(1 row)\n\n not_in \n--------\n      0\n(1 row)\n\n not_exists \n------------\n         45\n(1 row)", "outLabel": "Вывод psql", "note": "В учебной базе у 8 клиентов нет ни одного заказа. referrer_id пуст у 44 клиентов, поэтому NOT IN по этому столбцу вернул 0 строк, а NOT EXISTS — 45 клиентов, которые никого не пригласили."},
      self: {"title": "Самосоединение даёт 16 пар из 60 клиентов, а NULL не находит пары даже среди NULL", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- Самосоединение: кто кого пригласил\nSELECT c.customer_id, c.name, r.customer_id AS referrer_id, r.name AS referrer\nFROM customers AS c\nJOIN customers AS r ON r.customer_id = c.referrer_id\nORDER BY r.customer_id, c.customer_id;\n\n-- NULL не находит пару даже среди NULL: добавим в справочник строку с пустым кодом\nCREATE TEMP TABLE countries_x AS\nSELECT country_code, country_name FROM countries\nUNION ALL\nSELECT NULL, 'страна не указана';\n\nSELECT c.customer_id, c.country_code, k.country_name\nFROM customers AS c\nLEFT JOIN countries_x AS k ON k.country_code = c.country_code\nWHERE c.country_code IS NULL\nORDER BY c.customer_id;\n\n-- IS NOT DISTINCT FROM считает два NULL равными\nSELECT c.customer_id, c.country_code, k.country_name\nFROM customers AS c\nLEFT JOIN countries_x AS k\n  ON k.country_code IS NOT DISTINCT FROM c.country_code\nWHERE c.country_code IS NULL\nORDER BY c.customer_id;", "out": " customer_id |   name    | referrer_id | referrer  \n-------------+-----------+-------------+-----------\n         157 | Максим С. |         101 | Егор В.\n         123 | Максим М. |         102 | Максим Б.\n         125 | Вера К.   |         103 | Егор Б.\n         134 | Анна М.   |         108 | Егор М.\n         117 | Захар К.  |         109 | Света А.\n         119 | Олег М.   |         109 | Света А.\n         115 | Света М.  |         111 | Тимур Б.\n         135 | Жанна С.  |         114 | Вера М.\n         131 | Борис С.  |         115 | Света М.\n         120 | Лена К.   |         116 | Фёдор Б.\n         148 | Фёдор С.  |         120 | Лена К.\n         159 | Захар В.  |         128 | Света С.\n         133 | Ирина А.  |         132 | Глеб С.\n         141 | Фёдор В.  |         133 | Ирина А.\n         154 | Света Б.  |         142 | Кирилл Б.\n         149 | Дина А.   |         144 | Вера Б.\n(16 rows)\n\nSELECT 6\n customer_id | country_code | country_name \n-------------+--------------+--------------\n         117 | NULL         | NULL\n         142 | NULL         | NULL\n(2 rows)\n\n customer_id | country_code |   country_name    \n-------------+--------------+-------------------\n         117 | NULL         | страна не указана\n         142 | NULL         | страна не указана\n(2 rows)", "outLabel": "Вывод psql", "note": "Строки с пустым referrer_id в самосоединение не попали: у них нет пары. Обычное равенство не сцепило NULL из customers с NULL из справочника, а IS NOT DISTINCT FROM сравнивает так, будто NULL — обычное значение."},
      count: {"title": "COUNT до и после соединения ловит размножение: 231 заказ превратился в 388 строк", "badge": "проверено: PostgreSQL 16", "lang": "sql", "code": "-- До соединения: ключ order_id уникален в orders, но не в order_items\nSELECT count(*) AS n_rows, count(DISTINCT order_id) AS n_orders, sum(amount) AS revenue\nFROM orders;\n\nSELECT count(*) AS n_rows, count(DISTINCT order_id) AS n_orders,\n       count(DISTINCT (order_id, product_id)) AS n_pairs\nFROM order_items;\n\n-- После соединения: строки заказов размножились, выручка выросла\nSELECT count(*) AS n_rows, count(DISTINCT o.order_id) AS n_orders,\n       sum(o.amount) AS revenue_wrong, sum(i.qty * i.price) AS revenue_items\nFROM orders AS o\nJOIN order_items AS i ON i.order_id = o.order_id;\n\n-- Составной ключ: история статусов однозначна только по паре (order_id, status)\nSELECT count(*) AS by_order_id\nFROM orders AS o\nJOIN order_status_log AS l ON l.order_id = o.order_id;\n\nSELECT count(*) AS by_order_and_status\nFROM orders AS o\nJOIN order_status_log AS l ON l.order_id = o.order_id AND l.status = o.status;", "out": " n_rows | n_orders | revenue \n--------+----------+---------\n    231 |      231 | 1051380\n(1 row)\n\n n_rows | n_orders | n_pairs \n--------+----------+---------\n    388 |      231 |     388\n(1 row)\n\n n_rows | n_orders | revenue_wrong | revenue_items \n--------+----------+---------------+---------------\n    388 |      231 |       2069300 |       1051380\n(1 row)\n\n by_order_id \n-------------\n         483\n(1 row)\n\n by_order_and_status \n---------------------\n                 231\n(1 row)", "outLabel": "Вывод psql", "note": "После соединения верна сумма по order_items: каждая позиция встречается один раз. Неверна сумма amount из orders — она повторилась в каждой позиции заказа. Пара (order_id, product_id) уникальна, это составной первичный ключ order_items."}
    },
    questions: Q,
    glossary: GL,
    materials: [
      ['da-3-2-join.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/shop/', 'Учебная база shop для PostgreSQL, SQLite и DuckDB — общий набор темы 03'],
      ['joins.sql', 'Четыре блока кода страницы одним файлом, начиная с выборки во временных таблицах'],
      ['exercises.sql', 'Упражнения: предсказать число строк, найти размножение, переписать NOT IN'],
      ['exercises_solutions.sql', 'Решения упражнений']
    ],
    prompts: [
      ['Тренажёр «сколько строк»', 'Дай мне две маленькие таблицы с повторами ключа, тип JOIN и условие. Я предскажу число строк и где будут NULL, а ты проверишь и объяснишь через пары строк. Пять задач по одной.'],
      ['ON или WHERE', 'Задай пять запросов с LEFT JOIN и фильтром по правой таблице на учебной базе магазина. Я скажу, куда поставить фильтр и почему, а ты вопросами проверишь, понимаю ли я порядок выполнения.'],
      ['Проверка моего JOIN', 'Я вставлю свой запрос с соединениями и опишу таблицы. Найди, где строки могут потеряться или размножиться, и вопросами подведи меня к проверке через COUNT до и после. Не переписывай запрос.']
    ]
  };
})();
