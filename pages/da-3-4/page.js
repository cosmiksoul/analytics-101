/* Страница 3.4 · Подзапросы, CTE, NULL и типы */
(() => {
  /* ===================== Учебные данные =====================
     Учебная база shop (data/shop, seed 303): интернет-магазин товаров для дома, январь–март 2026.
     Все числа ниже — вывод PostgreSQL 16.15 по этой базе. */
  const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  // Запрос из сцены: выручка по каналам без заказов по акции ЗИМА10. [строка, уровень вложенности 1–4]
  const NESTED = [
    ['SELECT channel, n, revenue', 4],
    ['FROM (', 4],
    ['  SELECT channel, COUNT(*) AS n,', 3],
    ['         SUM(amount) AS revenue', 3],
    ['  FROM (', 3],
    ['    SELECT * FROM (', 2],
    ['      SELECT * FROM orders', 1],
    ["      WHERE status = 'paid'", 1],
    ['    ) AS paid', 1],
    ["    WHERE promo_code <> 'ЗИМА10'", 2],
    ['  ) AS no_winter', 2],
    ['  GROUP BY channel', 3],
    [') AS by_channel', 3],
    ['ORDER BY revenue DESC;', 4]
  ];
  // Тот же запрос через WITH. [строка, номер шага 0–3]
  const CTE = [
    ['WITH paid AS (', 0],
    ['  SELECT * FROM orders', 0],
    ["  WHERE status = 'paid'", 0],
    ['),', 0],
    ['no_winter AS (', 1],
    ['  SELECT * FROM paid', 1],
    ["  WHERE promo_code <> 'ЗИМА10'", 1],
    ['),', 1],
    ['by_channel AS (', 2],
    ['  SELECT channel, COUNT(*) AS n,', 2],
    ['         SUM(amount) AS revenue', 2],
    ['  FROM no_winter', 2],
    ['  GROUP BY channel', 2],
    [')', 2],
    ['SELECT * FROM by_channel', 3],
    ['ORDER BY revenue DESC;', 3]
  ];
  const BUG = 6, FIX = "  WHERE COALESCE(promo_code, '') <> 'ЗИМА10'";
  const LV_FIRST = { 1: 6, 2: 5, 3: 2, 4: 0 };          // первая строка уровня во вложенном запросе
  const BLK_FIRST = [0, 4, 8, 14];                       // первая строка шага в WITH
  // Результат запроса с ошибкой: ORDER BY revenue DESC
  const BAD = [['органика', 7, 49030], ['реклама', 6, 36510], ['рассылка', 3, 9400]];
  // Результат после починки и было ли до неё
  const GOOD = [['органика', 74, 399140, 7], ['реклама', 69, 284970, 6], ['рассылка', 32, 148400, 3]];
  // SELECT order_id, channel, amount, promo_code FROM paid ORDER BY order_id LIMIT 9
  const PREV = [[1001, 'реклама', 6770, 'ЗИМА10'], [1002, 'реклама', 2630, null], [1003, 'органика', 5850, null], [1004, 'органика', 3790, null], [1005, 'органика', 2940, null], [1006, 'органика', 450, 'ЗИМА10'], [1007, 'органика', 2530, null], [1008, 'реклама', 5750, null], [1009, 'органика', 3800, 'ВЕСНА15']];
  // SELECT promo_code, promo_code <> 'ЗИМА10', COUNT(*) FROM paid GROUP BY 1, 2
  const SUMM = [["'ВЕСНА15'", 't', 11], ["''", 't', 5], ["'ЗИМА10'", 'f', 20], ['NULL', 'u', 159]];
  const TV = { t: 'TRUE', f: 'FALSE', u: 'UNKNOWN' };
  const AND3 = { t: { t: 't', f: 'f', u: 'u' }, f: { t: 'f', f: 'f', u: 'f' }, u: { t: 'u', f: 'f', u: 'u' } };
  const OR3 = { t: { t: 't', f: 't', u: 't' }, f: { t: 't', f: 'f', u: 'u' }, u: { t: 't', f: 'u', u: 'u' } };

  /* ===================== Сцена ===================== */
  const GEO = {
    d: { ww: 620, wh: 440, lh: 18, cp: 10, cx: 10, cw: 312, vx: 324, vw: 296, rh: 22, cap: 22, sh: 30, sg: 14, chips: [118, 150, 150], ag: 22, bd: 16 },
    m: { ww: 320, wh: 430, lh: 14, cp: 8, cx: 8, cw: 320, vx: 0, vw: 320, rh: 20, cap: 18, sh: 26, sg: 10, chips: [88, 110, 106], ag: 8, bd: 14 }
  };
  const cell = (t, cls) => `<span${cls ? ` class="${cls}"` : ''}>${t}</span>`;
  const tvb = v => `<b class="tv ${v}">${TV[v]}</b>`;
  const lit = v => v === null ? '<i class="nl">NULL</i>' : `'${v}'`;

  function cardResult() {
    return `<div class="cq-cap">результат запроса</div><div class="cq-g cq-g-res">${cell('channel', 'h')}${cell('n', 'h r')}${cell('revenue', 'h r')}${BAD.map(r => cell(r[0]) + cell(r[1], 'r') + cell(fmtN(r[2]), 'r')).join('')}${cell('итого', 'tot')}${cell('16', 'tot r hot')}${cell(fmtN(94940), 'tot r')}</div>`;
  }
  function cardPreview() {
    const row = (r, i) => `<span class="pid">${r[0]}</span><span class="pch">${r[1]}</span><span class="r">${fmtN(r[2])}</span><span class="pp">${lit(r[3])}</span><span class="pc" data-i="${i}">${tvb(r[3] === null ? 'u' : r[3] === 'ЗИМА10' ? 'f' : 't')}</span>`;
    return `<div class="cq-cap"><span class="c3">SELECT * FROM paid</span><span class="c4">paid → условие шага no_winter</span></div><div class="cq-g cq-g-prev"><span class="h">order_id</span><span class="h pch">channel</span><span class="h r">amount</span><span class="h">promo_code</span><span class="h pc">&lt;&gt; 'ЗИМА10'</span>${PREV.map(row).join('')}<span class="foot"><span class="c3">… ещё 186 строк · (195 rows)</span><span class="c4">осталось 16 из 195 строк</span></span></div>`;
  }
  function cardSummary() {
    const rows = SUMM.map((r, i) => `<span class="sv${r[0] === 'NULL' ? ' snull' : ''}">${r[0] === 'NULL' ? '<i class="nl">NULL</i><em class="fx">\u00a0→ \'\'</em>' : r[0]}</span><span class="scond">${r[0] === 'NULL' ? `<span class="b4">${tvb('u')}</span><span class="b8">${tvb('t')}</span>` : tvb(r[1])}</span><span class="r">${r[2]}</span><span class="spass">${r[1] === 't' ? '<b class="ok">✓</b>' : r[0] === 'NULL' ? '<b class="no b4">✗</b><b class="ok b8">✓</b>' : '<b class="no">✗</b>'}</span>`).join('');
    return `<div class="cq-cap"><span class="b4">WHERE promo_code &lt;&gt; 'ЗИМА10'</span><span class="b8">WHERE COALESCE(promo_code, '') &lt;&gt; 'ЗИМА10'</span></div><div class="cq-g cq-g-sum"><span class="h">promo_code</span><span class="h">условие</span><span class="h r">строк</span><span class="h">WHERE</span>${rows}<span class="foot"><span class="b4">прошло 16 из 195</span><span class="b8">прошло 175 из 195</span></span></div>`;
  }
  const grid3 = (op, T) => `<div class="cq-cap">${op}</div><div class="cq-g cq-g-tt"><span class="h op">${op}</span>${['t', 'f', 'u'].map(b => `<span class="h">${TV[b]}</span>`).join('')}${['t', 'f', 'u'].map(a => `<span class="h lh">${TV[a]}</span>${['t', 'f', 'u'].map(b => `<span class="tc" data-c="${op}${a}${b}">${tvb(T[a][b])}</span>`).join('')}`).join('')}</div>`;
  const cardNot = () => `<div class="cq-cap">NOT</div><div class="cq-g cq-g-tt"><span class="h op">p</span>${['t', 'f', 'u'].map(a => `<span class="h">${TV[a]}</span>`).join('')}<span class="h lh">NOT p</span>${['t', 'f', 'u'].map(a => `<span class="tc" data-c="NOT${a}">${tvb(a === 'u' ? 'u' : a === 't' ? 'f' : 't')}</span>`).join('')}</div>`;
  function cardFinal() {
    return `<div class="cq-cap">by_channel после починки</div><div class="cq-g cq-g-fin">${cell('channel', 'h')}${cell('n', 'h r')}${cell('revenue', 'h r')}${cell('было n', 'h r')}${GOOD.map(r => cell(r[0]) + cell(r[1], 'r') + cell(fmtN(r[2]), 'r') + cell(r[3], 'r was')).join('')}${cell('итого', 'tot')}${cell('175', 'tot r hot')}${cell(fmtN(832510), 'tot r')}${cell('16', 'tot r was')}</div>`;
  }

  const scene = {
    parts: [{ n: '01', name: 'Матрёшка', s: [0, 1] }, { n: '02', name: 'Шаги WITH', s: [2, 3] }, { n: '03', name: 'Где пропали', s: [4, 5] }, { n: '04', name: 'Троичная логика', s: [6, 7] }, { n: '05', name: 'Починка', s: [8, 9] }],
    steps: [
      { title: 'Отчёт не сходится', dur: 3200, body: '<p>Нужна выручка по&nbsp;каналам без&nbsp;заказов по&nbsp;зимней акции ЗИМА10. Запрос из&nbsp;вложенных подзапросов отработал без&nbsp;ошибок и&nbsp;насчитал 16&nbsp;заказов.</p><p>Оплаченных заказов в&nbsp;учебной базе 195, по&nbsp;акции из&nbsp;них&nbsp;20. Где ещё 159?</p>' },
      { title: 'Читать приходится изнутри', dur: 4200, body: '<p>Подзапрос в&nbsp;FROM выполняется раньше внешнего запроса, поэтому читать приходится с&nbsp;середины: <b>1</b>&nbsp;— оплаченные, <b>2</b>&nbsp;— фильтр по&nbsp;промокоду, <b>3</b>&nbsp;— группировка, <b>4</b>&nbsp;— сортировка.</p><p>Чтобы увидеть промежуточный результат, его придётся вырезать из&nbsp;середины текста.</p>' },
      { title: 'WITH: у каждого шага имя', dur: 3800, body: '<p>Тот&nbsp;же запрос через <b>WITH</b>: шаги paid, no_winter и&nbsp;by_channel стоят сверху вниз в&nbsp;порядке выполнения, и&nbsp;каждый берёт данные из&nbsp;предыдущего по&nbsp;имени.</p><p>Результат прежний, 16&nbsp;заказов. Зато каждый шаг теперь можно открыть как таблицу.</p>' },
      { title: 'paid: 195 строк', dur: 3200, body: '<p>Запускаем первый шаг отдельно: <b>SELECT * FROM paid</b>. В&nbsp;нём все 195&nbsp;оплаченных заказов, здесь всё сходится.</p><p>У&nbsp;большинства строк в&nbsp;promo_code стоит NULL: промокод не&nbsp;вводили.</p>' },
      { title: 'no_winter: 195 → 16', dur: 4200, body: '<p>Второй шаг оставил 16&nbsp;строк, а&nbsp;ожидали 175: 195&nbsp;минус 20&nbsp;заказов по&nbsp;акции. Строки теряет условие <b>promo_code <> \'ЗИМА10\'</b>.</p><p>Заказ 1009 с&nbsp;ВЕСНА15 прошёл, 1001 и&nbsp;1006 с&nbsp;ЗИМА10 отсеяны по&nbsp;делу, а&nbsp;заказы с&nbsp;NULL пропали вместе с&nbsp;ними.</p>' },
      { title: 'NULL <> \'ЗИМА10\'\u00a0— не\u00a0TRUE', dur: 4000, body: '<p>Сравнение с&nbsp;NULL даёт не&nbsp;TRUE и&nbsp;не&nbsp;FALSE, а&nbsp;третье значение — <b>UNKNOWN</b>: неизвестно, отличается&nbsp;ли неизвестный промокод от&nbsp;ЗИМА10.</p><p>WHERE пропускает только TRUE, поэтому 159&nbsp;строк с&nbsp;NULL выпали так&nbsp;же, как 20&nbsp;строк с&nbsp;FALSE.</p>' },
      { title: 'AND с UNKNOWN', dur: 3600, body: '<p>Логика SQL троичная. Для&nbsp;AND решает один FALSE: FALSE AND UNKNOWN&nbsp;— FALSE.</p><p>А&nbsp;TRUE AND UNKNOWN&nbsp;— UNKNOWN: ответ зависит от&nbsp;того, что неизвестно.</p>' },
      { title: 'OR и NOT', dur: 4000, body: '<p>Для&nbsp;OR решает один TRUE: TRUE OR UNKNOWN&nbsp;— TRUE, а&nbsp;FALSE OR UNKNOWN&nbsp;— UNKNOWN.</p><p>NOT UNKNOWN остаётся UNKNOWN. Строка с&nbsp;NULL не&nbsp;пройдёт ни&nbsp;<b>WHERE p</b>, ни&nbsp;<b>WHERE NOT p</b>.</p>' },
      { title: 'COALESCE подставляет значение', dur: 3800, body: '<p><b>COALESCE(promo_code, \'\')</b> до&nbsp;сравнения заменяет NULL пустой строкой. Пустая строка&nbsp;— обычное значение, \'\' <> \'ЗИМА10\' даёт TRUE.</p><p>159&nbsp;строк вернулись: в&nbsp;no_winter теперь 175.</p>' },
      { title: 'Отчёт сошёлся', dur: 3800, next: 'Читать страницу', body: '<p>by_channel по&nbsp;исправленному шагу: 175&nbsp;заказов и&nbsp;832&nbsp;510&nbsp;₽. Проверка сходится: 195&nbsp;−&nbsp;20&nbsp;=&nbsp;175.</p><p>В&nbsp;первом отчёте было 16&nbsp;заказов и&nbsp;94&nbsp;940&nbsp;₽ — без&nbsp;единой ошибки при&nbsp;запуске.</p>' }
    ],
    hud: [{ id: 'step', label: 'Шаг' }, { id: 'rows', label: 'Заказов' }, { id: 'unk', label: 'UNKNOWN' }],
    legend: '<span><i style="background:#36b8a6"></i>TRUE</span><span><i style="background:#f2756a"></i>FALSE</span><span><i style="background:#e3c04d"></i>UNKNOWN</span>',
    info: 'WITH И NULL',
    aiNote: 'В анимации учебная база магазина (PostgreSQL 16): 195 оплаченных заказов, у 159 из них promo_code = NULL, у 20 — ЗИМА10, у 11 — ВЕСНА15, у 5 — пустая строка. Запрос «выручка по каналам без ЗИМА10» из трёх вложенных подзапросов переписан в WITH paid AS (…), no_winter AS (…), by_channel AS (…). Шаг paid даёт 195 строк, no_winter с условием promo_code <> \'ЗИМА10\' — 16 строк, потому что NULL <> \'ЗИМА10\' даёт UNKNOWN, а WHERE пропускает только TRUE. Показаны таблицы истинности AND, OR, NOT с UNKNOWN. Починка — COALESCE(promo_code, \'\') <> \'ЗИМА10\': 175 строк, по каналам органика 74 заказа и 399 140 ₽, реклама 69 и 284 970 ₽, рассылка 32 и 148 400 ₽, всего 832 510 ₽ вместо 94 940 ₽.',
    mount(root, api) {
      root.innerHTML = '<div class="cq"><div class="cq-w"></div></div>';
      const box = root.firstChild, w = box.firstChild;
      const mk = (cls, html) => { const d = document.createElement('div'); d.className = 'cq-el ' + cls; d.innerHTML = html; w.appendChild(d); d._c = {}; return d; };
      const codeBg = mk('cq-code', '');
      const nl = NESTED.map(([t]) => mk('cq-ln', api.hl(t, 'sql')));
      const cl = CTE.map(([t]) => mk('cq-ln', api.hl(t, 'sql')));
      const fixLn = mk('cq-ln fix', api.hl(FIX, 'sql'));
      const badges = [1, 2, 3, 4].map(n => mk('cq-bd', String(n)));
      const chips = ['paid', 'no_winter', 'by_channel'].map(n => mk('cq-chip', `<b>${n}</b><span></span>`));
      const arrows = [0, 1].map(() => mk('cq-arr', '→'));
      const cards = { A: mk('cq-card', cardResult()), C: mk('cq-card', cardPreview()), D: mk('cq-card', cardSummary()), E1: mk('cq-card', grid3('AND', AND3)), E2: mk('cq-card cq-e2', `<div>${grid3('OR', OR3)}</div><div class="cq-not">${cardNot()}</div>`), F: mk('cq-card', cardFinal()) };
      const call = mk('cq-call', '');
      const prevCells = [...cards.C.querySelectorAll('.cq-g-prev > *')];
      const prevRows = PREV.map((r, i) => prevCells.slice(5 + i * 5, 10 + i * 5));

      let G = GEO.d, scale = 1, sig = '';
      const fit = () => {
        const W = box.clientWidth, H = box.clientHeight; if (!W || !H) return;
        const g = W < 470 ? GEO.m : GEO.d;
        if (g !== G) { G = g; sig = ''; }
        scale = Math.min(W / G.ww, H / G.wh, 1.12);
        w.style.width = G.ww + 'px'; w.style.height = G.wh + 'px';
        w.style.transform = `translate(${((W - G.ww * scale) / 2).toFixed(1)}px, ${((H - G.wh * scale) / 2).toFixed(1)}px) scale(${scale.toFixed(4)})`;
        w.classList.toggle('cq-mob', G === GEO.m);
        sig = '';
      };
      if ('ResizeObserver' in window) new ResizeObserver(() => { fit(); if (last) render(last[0], last[1]); }).observe(box);
      fit();
      requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('cq-ready')));

      const set = (el, x, y, o, wd, ht) => {
        const c = el._c, t = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
        if (c.t !== t) { el.style.transform = t; c.t = t; }
        const op = o <= 0 ? '0' : o >= 1 ? '1' : String(o);
        if (c.o !== op) { el.style.opacity = op; el.style.visibility = op === '0' ? 'hidden' : 'visible'; c.o = op; }
        if (wd != null && c.w !== wd) { el.style.width = wd + 'px'; c.w = wd; }
        if (ht != null && c.h !== ht) { el.style.height = ht + 'px'; c.h = ht; }
      };
      const cls = (el, name, on) => { const c = el._c || (el._c = {}); if (c[name] !== on) { el.classList.toggle(name, on); c[name] = on; } };

      // Состояние сцены на шаге k при прогрессе p — только дискретные фазы, анимацию дают переходы CSS
      function state(k, p) {
        const s = { code: k < 2 ? 'n' : 'c', lv: k === 1 ? Math.min(4, 1 + Math.floor(p * 4.4)) : 0, blk: k === 2 ? Math.min(4, 1 + Math.floor(p * 4.4)) : 4,
          focus: [-1, -1, -1, 0, 1, 1, 1, 1, 1, 2][k], fixed: k >= 8 ? (k > 8 || p > .25) : false, strip: k >= 2,
          cnt: ['?', '?', '?'], on: [-1, -1, -1, 0, 1, 1, 1, 1, 1, 2][k], card: ['A', 'A', null, 'C', 'C', 'D', 'E1', 'E2', 'D', 'F'][k], ph: 0, call: null };
        if (k >= 3) s.cnt[0] = '195';
        if (k > 4 || (k === 4 && p > .7)) s.cnt[1] = k > 8 || (k === 8 && p > .5) ? '175' : '16';
        if (k === 9) s.cnt[2] = '3';
        if (k === 4) s.ph = p < .1 ? 0 : p < .7 ? Math.min(9, Math.ceil((p - .1) / .5 * 9)) : 10;
        if (k === 5) s.ph = p < .55 ? 0 : 1;
        if (k === 6 || k === 7) s.ph = p < .3 ? 0 : p < .6 ? 1 : 2;
        if (k === 8) s.ph = p < .5 ? 0 : 1;
        const C = [['16 заказов из 195 оплаченных', 0], ['выполняется изнутри наружу: 1 → 4', 0], ['каждое имя — таблица: SELECT * FROM paid', 0], ['все 195 оплаченных на месте', 0], ['195 → 16: строки пропали здесь', 0], ["NULL <> 'ЗИМА10' → UNKNOWN → отброшена", 0], ['TRUE AND UNKNOWN = UNKNOWN', 0], ['NOT UNKNOWN = UNKNOWN', 0], ["COALESCE: NULL → '' до сравнения", 0], ['195 − 20 = 175 ✓', 0]];
        if (p > .35 && !(k === 4 && p < .7)) s.call = C[k][0];
        if (k === 1 && p <= .35) s.call = null;
        return s;
      }

      let last = null;
      function render(k, p) {
        last = [k, p];
        const mob = G === GEO.m, S = state(k, p);
        // счётчики
        api.hud('step', ['запрос', 'запрос', 'WITH', 'paid', 'no_winter', 'no_winter', 'no_winter', 'no_winter', 'no_winter', 'by_channel'][k]);
        const rows = k === 3 ? '195' : k === 4 ? (p > .7 ? '16' : '195') : k === 8 ? (p > .5 ? '175' : '16') : k === 9 ? '175' : '16';
        api.hud('rows', rows);
        api.hud('unk', k < 4 || (k === 4 && p <= .7) ? '—' : k === 9 || (k === 8 && p > .5) ? '0' : '159');

        const key = JSON.stringify(S) + mob;
        if (key === sig) return; sig = key;

        // код: видимые строки
        const lines = S.code === 'n' ? NESTED : CTE;
        let vis = lines.map((_, i) => i);
        if (mob && S.code === 'c' && k >= 3) vis = k === 9 ? vis.filter(i => CTE[i][1] >= 2) : k === 6 || k === 7 ? [BUG] : vis.filter(i => CTE[i][1] === S.focus);
        const first = vis[0], codeH = vis.length * G.lh + 2 * G.cp;
        // на широкой сцене цепочка шагов идёт строкой сверху, на узкой — между кодом и таблицей
        const top = !mob && S.strip ? G.sh + G.sg : 0;
        set(codeBg, 0, top, 1, G.cw, codeH);
        const place = (els, src, on) => els.forEach((el, i) => {
          const shown = on && vis.includes(i);
          set(el, G.cx, top + G.cp + (i - first) * G.lh, shown ? 1 : 0, G.cw - G.cx - 4, G.lh);
        });
        place(nl, NESTED, S.code === 'n');
        place(cl, CTE, S.code === 'c');
        // подсветка уровней вложенного запроса и шагов WITH
        nl.forEach((el, i) => { const lv = NESTED[i][1]; cls(el, 'lit', S.lv > 0 && lv === S.lv); cls(el, 'dim', S.lv > 0 && lv > S.lv); cls(el, 'bug', false); });
        cl.forEach((el, i) => {
          const b = CTE[i][1];
          cls(el, 'dim', (k === 2 && b >= S.blk) || (S.focus >= 0 && !mob && b !== S.focus && !(k === 9 && b === 3)));
          cls(el, 'lit', k >= 3 && b === S.focus);
          cls(el, 'bug', i === BUG && k >= 4 && !S.fixed);
        });
        const fixOn = S.code === 'c' && S.fixed && vis.includes(BUG);
        set(fixLn, G.cx, top + G.cp + (BUG - first) * G.lh, fixOn ? 1 : 0, G.cw - G.cx - 4, G.lh);
        if (fixOn) set(cl[BUG], G.cx, top + G.cp + (BUG - first) * G.lh, 0);
        // номера шагов: во вложенном — у уровня, в WITH — у шага; на телефоне в WITH прячем
        badges.forEach((el, n) => {
          const ln = S.code === 'n' ? LV_FIRST[n + 1] : BLK_FIRST[n];
          const show = S.code === 'n' ? k === 1 && S.lv >= n + 1 : (!mob || k === 2) && vis.includes(ln) && (k !== 2 || S.blk > n);
          set(el, G.cw - G.bd - 8, top + G.cp + (ln - first) * G.lh + (G.lh - G.bd) / 2, show ? 1 : 0, G.bd, G.bd);
          cls(el, 'on', (S.code === 'n' && S.lv === n + 1) || (S.code === 'c' && (S.focus === n || (k === 9 && n === 3))));
        });

        // справа (на телефоне — ниже): цепочка шагов и карточки
        const vy = mob ? codeH + 12 : 0;
        let cx = mob ? G.vx : 0;
        chips.forEach((el, n) => {
          el.lastChild.textContent = `\u00a0· ${S.cnt[n]}`;
          set(el, cx, vy, S.strip && (k > 2 || S.blk > n) ? 1 : 0, G.chips[n], G.sh);
          cls(el, 'on', S.on === n);
          cls(el, 'bad', n === 1 && S.cnt[1] === '16');
          cls(el, 'good', n === 1 && S.cnt[1] === '175');
          cx += G.chips[n] + G.ag;
          if (n < 2) set(arrows[n], cx - G.ag, vy, S.strip && (k > 2 || S.blk > n + 1) ? 1 : 0, G.ag, G.sh);
        });
        const cy = mob ? vy + (S.strip ? G.sh + G.sg : 0) : top;
        const H = { A: G.cap + 5 * G.rh, C: G.cap + 11 * G.rh, D: G.cap + 6 * G.rh, E1: G.cap + 4 * G.rh, E2: 2 * G.cap + 6 * G.rh + 10, F: G.cap + 5 * G.rh };
        Object.entries(cards).forEach(([id, el]) => {
          const on = S.card === id && !(mob && k === 1);
          set(el, G.vx, cy + (on ? 0 : 10), on ? 1 : 0, G.vw, H[id]);
        });
        cls(cards.A, 'dim', k === 1);
        // предпросмотр paid и условие no_winter
        cls(cards.C, 'k4', k === 4);
        prevRows.forEach((cs, i) => {
          const r = PREV[i], v = r[3] === null ? 'u' : r[3] === 'ЗИМА10' ? 'f' : 't';
          const rev = k === 4 && S.ph > i, out = k === 4 && S.ph === 10 && v !== 't';
          cs.forEach(c => { cls(c, 'out', out); cls(c, 'keep', k === 4 && S.ph === 10 && v === 't'); });
          cls(cs[4], 'rev', rev);
        });
        cls(cards.C, 'done', k === 4 && S.ph === 10);
        // сводка по значениям promo_code
        cls(cards.D, 'fix8', k === 8 && S.ph === 1);
        cls(cards.D, 'hlnull', k === 5 && S.ph === 1);
        // таблицы истинности: подсветка клеток
        const hl = { 6: [['ANDtu'], ['ANDtu', 'ANDfu']], 7: [['ORtu'], ['ORtu', 'ORfu', 'NOTu']] };
        w.querySelectorAll('.tc').forEach(c => cls(c, 'hl', !!(hl[k] && S.ph > 0 && hl[k][Math.min(S.ph, 2) - 1].includes(c.dataset.c))));
        w.querySelectorAll('.tc').forEach(c => cls(c, 'last', !!(hl[k] && S.ph === 2 && c.dataset.c === hl[k][1][hl[k][1].length - 1])));

        // выноска под объектом
        let ny, nx = G.vx;
        if (k === 1) { ny = top + codeH + 10; nx = 0; }
        else if (k === 2) ny = mob ? vy + G.sh + G.sg : top;
        else ny = cy + H[S.card] + 10;
        if (S.call) { if (call._c.txt !== S.call) { call.textContent = S.call; call._c.txt = S.call; } }
        set(call, nx, ny, S.call ? 1 : 0);
        cls(call, 'warn', k === 4 || k === 5);
      }
      return { render };
    }
  };

  /* ===================== Интерактив «Троичная логика» ===================== */
  // Шесть оплаченных заказов учебной базы:
  // SELECT order_id, rating, promo_code FROM orders WHERE order_id IN (1001, 1004, 1008, 1011, 1016, 1083) ORDER BY order_id
  const SAMPLE = [[1001, 5, 'ЗИМА10'], [1004, 1, null], [1008, 4, null], [1011, null, 'ЗИМА10'], [1016, null, 'ВЕСНА15'], [1083, 5, '']];
  const R_CYCLE = [5, 4, 3, 2, 1, null], P_CYCLE = ['ЗИМА10', 'ВЕСНА15', '', null];

  /*tvl:start*/
  // Троичная логика SQL: true, false и null (= UNKNOWN), как в PostgreSQL.
  // Каждое условие сверено с PostgreSQL 16 для всех 6 × 4 сочетаний rating и promo_code — и итог, и каждая часть.
  const U = null;
  const cmp = (a, op, b) => a === null || b === null ? U : op === '=' ? a === b : op === '<>' ? a !== b : op === '>=' ? a >= b : a < b;
  const and = (...xs) => xs.includes(false) ? false : xs.includes(U) ? U : true;
  const or = (...xs) => xs.includes(true) ? true : xs.includes(U) ? U : false;
  const not = x => x === U ? U : !x;
  const coalesce = (...xs) => { for (const x of xs) if (x !== null) return x; return null; };
  const nullif = (a, b) => a !== null && b !== null && a === b ? null : a;
  const L = v => v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${v}'`;
  // part: { t: текст, v: значение, val: true — это значение, а не логический результат, q: то же на SQL для сверки }
  const CONDS = [
    { id: 'ge', tab: 'Сравнение', sql: 'rating >= 4', kind: 'cmp',
      ev: r => { const a = cmp(r.rating, '>=', 4); return { parts: [{ t: `${L(r.rating)} >= 4`, v: a, q: 'rating >= 4' }], res: a }; } },
    { id: 'ne', tab: 'Сравнение', sql: "promo_code <> 'ЗИМА10'", kind: 'cmp',
      ev: r => { const a = cmp(r.promo, '<>', 'ЗИМА10'); return { parts: [{ t: `${L(r.promo)} <> 'ЗИМА10'`, v: a, q: "promo_code <> 'ЗИМА10'" }], res: a }; } },
    { id: 'and', tab: 'AND', sql: "rating >= 4 AND promo_code <> 'ЗИМА10'", kind: 'and2',
      ev: r => { const a = cmp(r.rating, '>=', 4), b = cmp(r.promo, '<>', 'ЗИМА10'); return { parts: [{ t: `${L(r.rating)} >= 4`, v: a, q: 'rating >= 4' }, { t: `${L(r.promo)} <> 'ЗИМА10'`, v: b, q: "promo_code <> 'ЗИМА10'" }], res: and(a, b) }; } },
    { id: 'or', tab: 'OR', sql: "rating >= 4 OR promo_code <> 'ЗИМА10'", kind: 'or2',
      ev: r => { const a = cmp(r.rating, '>=', 4), b = cmp(r.promo, '<>', 'ЗИМА10'); return { parts: [{ t: `${L(r.rating)} >= 4`, v: a, q: 'rating >= 4' }, { t: `${L(r.promo)} <> 'ЗИМА10'`, v: b, q: "promo_code <> 'ЗИМА10'" }], res: or(a, b) }; } },
    { id: 'taut', tab: 'OR', sql: 'rating >= 4 OR NOT (rating >= 4)', kind: 'or2',
      ev: r => { const a = cmp(r.rating, '>=', 4); return { parts: [{ t: `${L(r.rating)} >= 4`, v: a, q: 'rating >= 4' }, { t: `NOT (${L(r.rating)} >= 4)`, v: not(a), q: 'NOT (rating >= 4)' }], res: or(a, not(a)) }; } },
    { id: 'not', tab: 'NOT', sql: 'NOT (rating >= 4)', kind: 'not',
      ev: r => { const a = cmp(r.rating, '>=', 4); return { parts: [{ t: `${L(r.rating)} >= 4`, v: a, q: 'rating >= 4' }], res: not(a) }; } },
    { id: 'in', tab: 'IN', sql: 'rating IN (4, 5)', kind: 'orn',
      ev: r => { const xs = [4, 5].map(x => cmp(r.rating, '=', x)); return { parts: [4, 5].map((x, i) => ({ t: `${L(r.rating)} = ${x}`, v: xs[i], q: `rating = ${x}` })), res: or(...xs) }; } },
    { id: 'innull', tab: 'IN', sql: 'rating IN (4, 5, NULL)', kind: 'orn',
      ev: r => { const xs = [4, 5, null].map(x => cmp(r.rating, '=', x)); return { parts: [4, 5, null].map((x, i) => ({ t: `${L(r.rating)} = ${L(x)}`, v: xs[i], q: `rating = ${L(x)}` })), res: or(...xs) }; } },
    { id: 'notin', tab: 'NOT IN', sql: 'rating NOT IN (1, 2)', kind: 'andn',
      ev: r => { const xs = [1, 2].map(x => cmp(r.rating, '<>', x)); return { parts: [1, 2].map((x, i) => ({ t: `${L(r.rating)} <> ${x}`, v: xs[i], q: `rating <> ${x}` })), res: and(...xs) }; } },
    { id: 'notinnull', tab: 'NOT IN', sql: 'rating NOT IN (1, 2, NULL)', kind: 'andn',
      ev: r => { const xs = [1, 2, null].map(x => cmp(r.rating, '<>', x)); return { parts: [1, 2, null].map((x, i) => ({ t: `${L(r.rating)} <> ${L(x)}`, v: xs[i], q: `rating <> ${L(x)}` })), res: and(...xs) }; } },
    { id: 'isnull', tab: 'IS NULL', sql: 'rating IS NULL', kind: 'isnull',
      ev: r => { const a = r.rating === null; return { parts: [{ t: `${L(r.rating)} IS NULL`, v: a, q: 'rating IS NULL' }], res: a }; } },
    { id: 'nullif', tab: 'IS NULL', sql: "NULLIF(promo_code, '') IS NULL", kind: 'isnull',
      ev: r => { const x = nullif(r.promo, ''); return { parts: [{ t: `NULLIF(${L(r.promo)}, '')`, v: x, val: true, q: "NULLIF(promo_code, '')" }, { t: `${L(x)} IS NULL`, v: x === null, q: "NULLIF(promo_code, '') IS NULL" }], res: x === null }; } },
    { id: 'coalr', tab: 'COALESCE', sql: 'COALESCE(rating, 0) < 4', kind: 'coal',
      ev: r => { const x = coalesce(r.rating, 0), a = cmp(x, '<', 4); return { parts: [{ t: `COALESCE(${L(r.rating)}, 0)`, v: x, val: true, q: 'COALESCE(rating, 0)' }, { t: `${L(x)} < 4`, v: a, q: 'COALESCE(rating, 0) < 4' }], res: a }; } },
    { id: 'coalp', tab: 'COALESCE', sql: "COALESCE(promo_code, '') <> 'ЗИМА10'", kind: 'coal',
      ev: r => { const x = coalesce(r.promo, ''), a = cmp(x, '<>', 'ЗИМА10'); return { parts: [{ t: `COALESCE(${L(r.promo)}, '')`, v: x, val: true, q: "COALESCE(promo_code, '')" }, { t: `${L(x)} <> 'ЗИМА10'`, v: a, q: "COALESCE(promo_code, '') <> 'ЗИМА10'" }], res: a }; } }
  ];
  /*tvl:end*/

  const MSG = {
    ge: 'Строки с NULL в rating дают UNKNOWN: они не проходят, хотя и FALSE у них нет. Сравнение с NULL никогда не бывает TRUE.',
    ne: "Так строки терялись в сцене. Пустая строка '' — обычное значение и даёт TRUE, а NULL — UNKNOWN.",
    and: 'Строке нужны две TRUE. Один FALSE отсекает её сразу, а UNKNOWN без FALSE в другой части даёт UNKNOWN.',
    or: 'Хватает одной TRUE: неизвестная оценка не мешает, если промокод не ЗИМА10. UNKNOWN рядом с FALSE даёт UNKNOWN.',
    taut: 'Кажется, условие истинно всегда. Но при NULL обе части — UNKNOWN, и OR тоже UNKNOWN: строки без оценки не проходят. Про NULL спрашивают только через IS NULL.',
    not: 'NOT меняет TRUE и FALSE местами, а UNKNOWN оставляет UNKNOWN: строка с NULL не проходит ни это условие, ни rating >= 4.',
    in: 'IN — это цепочка OR из равенств: rating = 4 OR rating = 5. Если rating — NULL, все равенства дают UNKNOWN.',
    innull: 'NULL в списке не находит NULL: rating = NULL — UNKNOWN. Совпавшие значения проходят, а несовпавшие получают UNKNOWN вместо FALSE.',
    notin: 'NOT IN — это цепочка AND из неравенств: rating <> 1 AND rating <> 2. Строки с NULL в rating отсеиваются.',
    notinnull: 'rating <> NULL всегда UNKNOWN, поэтому AND не может стать TRUE. Если в списке NOT IN есть NULL, запрос не вернёт ни одной строки.',
    isnull: 'IS NULL отвечает только TRUE или FALSE и находит именно пропуски. Сравнение rating = NULL дало бы UNKNOWN во всех строках.',
    nullif: "NULLIF превращает пустую строку в NULL, и IS NULL находит заказы без промокода в обоих видах: NULL и ''.",
    coalr: 'COALESCE подставляет 0 вместо NULL, и сравнение даёт только TRUE или FALSE. Строки без оценки попадут в «низкие оценки» — решите, нужно ли это отчёту.',
    coalp: "Починка из сцены: NULL превращается в '' до сравнения, и заказы без промокода проходят, а ЗИМА10 — нет."
  };
  const RULES = {
    cmp: [['оба значения известны', r => r.res !== U, 'TRUE или FALSE'], ['хотя бы одно — NULL', r => r.res === U, 'UNKNOWN']],
    orn: [['есть TRUE', r => r.res === true, 'TRUE'], ['нет TRUE, есть UNKNOWN', r => r.res === U, 'UNKNOWN'], ['все FALSE', r => r.res === false, 'FALSE']],
    andn: [['есть FALSE', r => r.res === false, 'FALSE'], ['нет FALSE, есть UNKNOWN', r => r.res === U, 'UNKNOWN'], ['все TRUE', r => r.res === true, 'TRUE']],
    isnull: [['значение NULL', r => r.res === true, 'TRUE'], ['любое другое', r => r.res === false, 'FALSE'], ['UNKNOWN не бывает', () => false, '—']],
    coal: [['значение не NULL', r => r.raw !== null, 'берётся оно'], ['значение NULL', r => r.raw === null, 'запасное'], ['сравнение после замены', r => r.res !== U, 'TRUE или FALSE']]
  };
  const EXPAND = {
    in: 'rating = 4 OR rating = 5', innull: 'rating = 4 OR rating = 5 OR rating = NULL', notin: 'rating <> 1 AND rating <> 2', notinnull: 'rating <> 1 AND rating <> 2 AND rating <> NULL',
    coalr: 'CASE WHEN rating IS NOT NULL THEN rating ELSE 0 END < 4', coalp: "CASE WHEN promo_code IS NOT NULL THEN promo_code ELSE '' END <> 'ЗИМА10'", nullif: "CASE WHEN promo_code = '' THEN NULL ELSE promo_code END IS NULL"
  };
  const TABS = [...new Set(CONDS.map(c => c.tab))];
  const k3 = v => v === true ? 't' : v === false ? 'f' : 'u';

  function buildTvl(box, api) {
    const { $, esc, hl, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">WHERE пропускает только TRUE <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="tv-reset">Сбросить</button></div></div>
<p class="hint tv-do">Выберите оператор и условие. Щёлкайте по значениям rating и promo_code: они перебирают варианты, включая NULL. Таблица справа показывает, по какому правилу получился итог каждой строки.</p>
<div class="tabs tv-ops" id="tv-ops" role="group" aria-label="Оператор">${TABS.map(t => `<button type="button" data-tab="${t}">${t}</button>`).join('')}</div>
<div class="tv-vars" id="tv-vars" role="group" aria-label="Условие"></div>
<pre class="tv-sql" id="tv-sql"></pre>
<div class="stage"><div class="tv-main"><div class="tv-rows" id="tv-rows"></div></div>
<div class="narr"><p class="cap" id="tv-cap"></p><div class="tv-tt" id="tv-tt"></div><div class="readout"><div><span class="big" id="tv-n"></span><span class="lbl" id="tv-nl"></span></div><div><span class="big tv-ub" id="tv-u"></span><span class="lbl">UNKNOWN — отброшены</span></div></div><div class="narr-text" id="tv-msg"></div></div></div>
<div class="status"><span><span class="dot live"></span><span id="tv-s1"></span></span><span class="grow"></span><span id="tv-s2"></span></div>`;
    let s;
    const fresh = () => ({ tab: 'Сравнение', id: 'ne', rows: SAMPLE.map(r => ({ id: r[0], rating: r[1], promo: r[2] })) });
    const chip = (v, val) => val ? `<b class="tv-b v">${esc(L(v))}</b>` : `<b class="tv-b ${k3(v)}">${TV[k3(v)]}</b>`;
    function evalAll() { const C = CONDS.find(c => c.id === s.id); return { C, out: s.rows.map(r => Object.assign(C.ev(r), { raw: C.kind === 'coal' ? (C.id === 'coalr' ? r.rating : r.promo) : null })) }; }
    function truth(C, out) {
      if (C.kind === 'and2' || C.kind === 'or2') {
        const T = C.kind === 'and2' ? AND3 : OR3, op = C.kind === 'and2' ? 'AND' : 'OR';
        const cnt = {}; out.forEach(o => { const key = k3(o.parts[0].v) + k3(o.parts[1].v); cnt[key] = (cnt[key] || 0) + 1; });
        return `<div class="tv-grid"><span class="h op">${op}</span>${['t', 'f', 'u'].map(b => `<span class="h">${TV[b]}</span>`).join('')}${['t', 'f', 'u'].map(a => `<span class="h lh">${TV[a]}</span>${['t', 'f', 'u'].map(b => `<span class="c ${T[a][b]}${cnt[a + b] ? ' hit' : ''}">${TV[T[a][b]]}${cnt[a + b] ? `<i>${cnt[a + b]}</i>` : ''}</span>`).join('')}`).join('')}</div><p class="tv-gl">Строки — левая часть, столбцы — правая; число — сколько строк попало в клетку.</p>`;
      }
      if (C.kind === 'not') {
        const cnt = {}; out.forEach(o => { const key = k3(o.parts[0].v); cnt[key] = (cnt[key] || 0) + 1; });
        return `<div class="tv-grid tv-g2"><span class="h op">p</span><span class="h op">NOT p</span>${['t', 'f', 'u'].map(a => `<span class="c ${a}">${TV[a]}</span><span class="c ${a === 'u' ? 'u' : a === 't' ? 'f' : 't'}${cnt[a] ? ' hit' : ''}">${TV[a === 'u' ? 'u' : a === 't' ? 'f' : 't']}${cnt[a] ? `<i>${cnt[a]}</i>` : ''}</span>`).join('')}</div>`;
      }
      const R = RULES[C.kind];
      return `${EXPAND[C.id] ? `<p class="tv-exp">≡ <code>${esc(EXPAND[C.id])}</code></p>` : ''}<ul class="tv-rules">${R.map(([t, f, res]) => { const n = out.filter(f).length; return `<li class="${n ? 'hit' : ''}"><span>${esc(t)}</span><b>${esc(res)}</b><i>${n}</i></li>`; }).join('')}</ul>`;
    }
    function draw() {
      const { C, out } = evalAll();
      box.querySelectorAll('#tv-ops button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === s.tab)));
      const vars = CONDS.filter(c => c.tab === s.tab);
      $('tv-vars').innerHTML = vars.map(c => `<button type="button" data-id="${c.id}" aria-pressed="${c.id === s.id}">${esc(c.sql)}</button>`).join('');
      $('tv-sql').innerHTML = hl(`SELECT order_id FROM sample WHERE ${C.sql};`, 'sql');
      const ratingUsed = !['ne', 'nullif', 'coalp'].includes(C.id), promoUsed = ['ne', 'and', 'or', 'nullif', 'coalp'].includes(C.id);
      $('tv-rows').innerHTML = `<div class="tv-r tv-h"><span>order_id</span><span>rating</span><span>promo_code</span><span class="tv-pt">разбор</span><span>итог и WHERE</span></div>` + s.rows.map((r, i) => {
        const o = out[i], v = k3(o.res);
        return `<div class="tv-r ${v}"><span class="tv-id">${r.id}</span><span><button type="button" class="tv-v${r.rating === null ? ' nl' : ''}${ratingUsed ? '' : ' off'}" data-i="${i}" data-c="rating" aria-label="rating заказа ${r.id}: ${esc(L(r.rating))}, сменить">${esc(L(r.rating))}</button></span><span><button type="button" class="tv-v${r.promo === null ? ' nl' : ''}${promoUsed ? '' : ' off'}" data-i="${i}" data-c="promo" aria-label="promo_code заказа ${r.id}: ${esc(L(r.promo))}, сменить">${esc(L(r.promo))}</button></span><span class="tv-pt">${o.parts.map(pt => `<span class="tv-p"><code>${esc(pt.t)}</code>${chip(pt.v, pt.val)}</span>`).join('')}</span><span class="tv-res">${chip(o.res)}${o.res === true ? '<b class="ok">✓ проходит</b>' : '<b class="no">✗ отброшена</b>'}</span></div>`;
      }).join('');
      const n = out.filter(o => o.res === true).length, u = out.filter(o => o.res === U).length, f = out.length - n - u;
      $('tv-cap').textContent = { cmp: 'Сравнение с NULL', and2: 'Таблица истинности AND', or2: 'Таблица истинности OR', not: 'Таблица истинности NOT', orn: 'IN — цепочка OR', andn: 'NOT IN — цепочка AND', isnull: 'IS NULL: только TRUE или FALSE', coal: 'COALESCE: замена до сравнения' }[C.kind];
      $('tv-tt').innerHTML = truth(C, out);
      $('tv-n').textContent = n; $('tv-nl').textContent = `${plural(n, ['строка', 'строки', 'строк'])} из 6 ${n % 10 === 1 && n !== 11 ? 'прошла' : 'прошли'} WHERE · FALSE ${f}`;
      $('tv-u').textContent = u;
      $('tv-msg').textContent = MSG[C.id];
      const changed = s.rows.some((r, i) => r.rating !== SAMPLE[i][1] || r.promo !== SAMPLE[i][2]);
      const ids = s.rows.filter((r, i) => out[i].res === true).map(r => r.id);
      $('tv-s1').textContent = `→ (${ids.length} ${plural(ids.length, ['row', 'rows', 'rows'])})${ids.length ? ': ' + ids.join(', ') : ''}`;
      $('tv-s2').textContent = changed ? 'значения изменены вами · правила сверены с PostgreSQL 16' : 'как в учебной базе · сверено с PostgreSQL 16';
      s.out = out; s.n = n; s.u = u;
    }
    box.addEventListener('click', e => {
      const t = e.target.closest('[data-tab]'), v = e.target.closest('[data-id]'), c = e.target.closest('.tv-v');
      if (t) { s.tab = t.dataset.tab; s.id = CONDS.find(x => x.tab === s.tab).id; draw(); }
      else if (v) { s.id = v.dataset.id; draw(); }
      else if (c) {
        const r = s.rows[+c.dataset.i], cyc = c.dataset.c === 'rating' ? R_CYCLE : P_CYCLE, key = c.dataset.c;
        r[key] = cyc[(cyc.indexOf(r[key]) + 1) % cyc.length]; draw();
        const nb = box.querySelector(`.tv-v[data-i="${c.dataset.i}"][data-c="${key}"]`); if (nb) nb.focus();
      }
    });
    $('tv-reset').addEventListener('click', () => { s = fresh(); draw(); });
    s = fresh(); draw();
    return {
      describe() {
        const C = CONDS.find(c => c.id === s.id);
        return `условие WHERE ${C.sql}; строки (order_id: rating, promo_code → итог): ${s.rows.map((r, i) => `${r.id}: ${L(r.rating)}, ${L(r.promo)} → ${TV[k3(s.out[i].res)]}`).join('; ')}; прошли WHERE ${s.n} из 6, UNKNOWN ${s.u}.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-3-4',
    short: 'DA-03',
    title: 'Подзапросы, CTE, NULL и типы',
    where: 'блок «Дата аналитика», тема 03 «SQL для анализа», страница 3.4',
    aiData: 'учебная база интернет-магазина shop в PostgreSQL 16 за январь–март 2026: orders (231 заказ, 195 оплаченных, promo_code с NULL, пустыми строками, ЗИМА10 и ВЕСНА15, rating 1–5 с NULL, created_at — метка времени, один заказ ровно в 00:00:00), customers с referrer_id',
    scene,
    widgets: { tvl: buildTvl },
    code: {
      report: { title: 'Отчёт из трёх CTE и проверка размера каждого шага', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: "-- Выручка по каналам без заказов по зимней акции\nWITH paid AS (                         -- шаг 1: только оплаченные\n  SELECT * FROM orders\n  WHERE status = 'paid'\n),\nno_winter AS (                         -- шаг 2: без ЗИМА10, NULL не теряем\n  SELECT * FROM paid\n  WHERE COALESCE(promo_code, '') <> 'ЗИМА10'\n),\nby_channel AS (                        -- шаг 3: метрики канала\n  SELECT channel,\n         COUNT(*)              AS n,\n         SUM(amount)           AS revenue,\n         COUNT(rating)         AS rated,\n         ROUND(AVG(rating), 2) AS avg_rating\n  FROM no_winter\n  GROUP BY channel\n)\nSELECT * FROM by_channel\nORDER BY revenue DESC;\n\n-- Отладка: тот же WITH, но в конце — размер каждого шага\nWITH paid AS (SELECT * FROM orders WHERE status = 'paid'),\nno_winter AS (SELECT * FROM paid\n              WHERE COALESCE(promo_code, '') <> 'ЗИМА10'),\nby_channel AS (SELECT channel, COUNT(*) AS n FROM no_winter GROUP BY channel)\nSELECT 'paid' AS step, COUNT(*) AS rows FROM paid\nUNION ALL SELECT 'no_winter', COUNT(*) FROM no_winter\nUNION ALL SELECT 'by_channel', COUNT(*) FROM by_channel;", out: " channel  | n  | revenue | rated | avg_rating \n----------+----+---------+-------+------------\n органика | 74 |  399140 |    41 |       3.88\n реклама  | 69 |  284970 |    32 |       4.03\n рассылка | 32 |  148400 |    19 |       4.58\n(3 rows)\n\n    step    | rows \n------------+------\n paid       |  195\n no_winter  |  175\n by_channel |    3\n(3 rows)", note: 'Тот же запрос, что в сцене, после починки. Средняя оценка считается только по заказам с оценкой: rated меньше n, потому что AVG пропускает NULL.' },
      lost: { title: 'Поиск строк, пропавших из-за NULL', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: "-- 1. Каким вышло условие для каждого промокода: t, f или NULL (это UNKNOWN)\nSELECT promo_code, promo_code <> 'ЗИМА10' AS cond, COUNT(*) AS n\nFROM orders\nWHERE status = 'paid'\nGROUP BY 1, 2\nORDER BY n;\n\n-- 2. Какие строки выпали из шага: анти-соединение через NOT EXISTS\nWITH paid AS (SELECT * FROM orders WHERE status = 'paid'),\nno_winter AS (SELECT * FROM paid WHERE promo_code <> 'ЗИМА10')\nSELECT p.promo_code, COUNT(*) AS lost\nFROM paid p\nWHERE NOT EXISTS (SELECT 1 FROM no_winter w\n                  WHERE w.order_id = p.order_id)\nGROUP BY p.promo_code\nORDER BY lost DESC;\n\n-- 3. rating: у 91 оплаченного заказа оценки нет\nSELECT COUNT(*)                          AS paid,\n       COUNT(rating)                     AS rated,\n       COUNT(*) FILTER (WHERE rating < 4) AS low,\n       COUNT(*) FILTER (WHERE COALESCE(rating, 0) < 4) AS low_or_none,\n       ROUND(AVG(rating), 2)             AS avg_rated,\n       ROUND(AVG(COALESCE(rating, 0)), 2) AS avg_zero\nFROM orders\nWHERE status = 'paid';", out: " promo_code | cond |  n  \n------------+------+-----\n            | t    |   5\n ВЕСНА15    | t    |  11\n ЗИМА10     | f    |  20\n NULL       | NULL | 159\n(4 rows)\n\n promo_code | lost \n------------+------\n NULL       |  159\n ЗИМА10     |   20\n(2 rows)\n\n paid | rated | low | low_or_none | avg_rated | avg_zero \n------+-------+-----+-------------+-----------+----------\n  195 |   104 |  18 |         109 |      4.03 |     2.15\n(1 row)", note: 'NULL в выводе напечатан словом: psql запущен с <code>-P null=NULL</code>. Пустая ячейка в первой строке — это пустая строка \'\': для неё условие TRUE, и пять таких заказов проходят. Группировка по самому условию показывает все три значения сразу. <code>COUNT(*) FILTER (WHERE …)</code> — условный агрегат PostgreSQL, то же, что <code>SUM(CASE WHEN … THEN 1 ELSE 0 END)</code> из 3.3.' },
      weeks: { title: 'Группировка по неделям через DATE_TRUNC', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: "-- Оплаченные заказы по неделям: неделя в PostgreSQL начинается с понедельника\nSELECT DATE_TRUNC('week', created_at)::date      AS week,\n       EXTRACT(week FROM created_at)             AS iso_week,\n       COUNT(*)                                  AS n,\n       SUM(amount)                               AS revenue,\n       COUNT(NULLIF(promo_code, ''))             AS with_promo,\n       ROUND(AVG(rating), 2)                     AS avg_rating\nFROM orders\nWHERE status = 'paid'\n  AND created_at >= '2026-01-01'\n  AND created_at <  '2026-04-01'               -- полуинтервал: весь март, без BETWEEN\nGROUP BY 1, 2\nORDER BY 1;", out: "    week    | iso_week | n  | revenue | with_promo | avg_rating \n------------+----------+----+---------+------------+------------\n 2025-12-29 |        1 |  9 |   34940 |          0 |       3.67\n 2026-01-05 |        2 |  7 |   22040 |          0 |       4.40\n 2026-01-12 |        3 |  8 |   62130 |          3 |       3.33\n 2026-01-19 |        4 |  9 |   26880 |          4 |       3.33\n 2026-01-26 |        5 |  6 |   30440 |          2 |       3.50\n 2026-02-02 |        6 |  9 |   39760 |          0 |       4.57\n 2026-02-09 |        7 | 11 |   63600 |          1 |       3.90\n 2026-02-16 |        8 | 20 |   91260 |          6 |       4.00\n 2026-02-23 |        9 | 22 |  102760 |          5 |       4.00\n 2026-03-02 |       10 | 20 |   94040 |          4 |       4.00\n 2026-03-09 |       11 | 18 |   85990 |          2 |       4.42\n 2026-03-16 |       12 | 27 |  120110 |          4 |       4.55\n 2026-03-23 |       13 | 22 |  104910 |          0 |       3.70\n 2026-03-30 |       14 |  7 |   33220 |          0 |       4.00\n(14 rows)", note: 'Первая неделя подписана 29 декабря 2025 года: 1–4 января 2026-го лежат в неделе, начатой в старом году. Последняя неделя неполная — только 30 и 31 марта. Сумма столбца n — 195, все оплаченные заказы.' },
      dialects: { title: 'Та же неделя в DuckDB и SQLite', badge: 'проверено: Python 3.13, SQLite 3.53.1, DuckDB 2.0.0', lang: 'python', code: "import sqlite3, duckdb\n\nlite = sqlite3.connect(\"data/shop/shop.sqlite\")                  # SQLite 3.53.1: даты — строки\nduck = duckdb.connect(\"data/shop/shop.duckdb\", read_only=True)   # DuckDB 2.0.0: TIMESTAMP\n\ntry:\n    lite.execute(\"SELECT DATE_TRUNC('week', created_at) FROM orders\")\nexcept sqlite3.OperationalError as e:\n    print(\"SQLite:\", e)\n\n# Замена в SQLite: отступить на 6 дней и дойти до ближайшего понедельника\nlite_week = \"\"\"\nSELECT date(created_at, '-6 days', 'weekday 1') AS week,\n       strftime('%W', created_at) AS w, COUNT(*) AS n\nFROM orders WHERE status = 'paid'\nGROUP BY 1 ORDER BY 1 LIMIT 3\"\"\"\nduck_week = \"\"\"\nSELECT DATE_TRUNC('week', created_at)::DATE AS week, COUNT(*) AS n\nFROM orders WHERE status = 'paid'\nGROUP BY 1 ORDER BY 1 LIMIT 3\"\"\"\nprint(\"SQLite:\", lite.execute(lite_week).fetchall())\nprint(\"DuckDB:\", duck.sql(duck_week).fetchall())\n\n# Строка против метки времени: заказ 1008 создан 2026-02-12 00:00:00\nq = \"SELECT COUNT(*) FROM orders WHERE created_at = '2026-02-12'\"\nprint(\"created_at = '2026-02-12':\",\n      \"SQLite\", lite.execute(q).fetchall()[0][0],     # сравнение строк\n      \"| DuckDB\", duck.sql(q).fetchall()[0][0])       # строка → TIMESTAMP", out: "SQLite: no such function: DATE_TRUNC\nSQLite: [('2025-12-29', '00', 9), ('2026-01-05', '01', 7), ('2026-01-12', '02', 8)]\nDuckDB: [(datetime.date(2025, 12, 29), 9), (datetime.date(2026, 1, 5), 7), (datetime.date(2026, 1, 12), 8)]\ncreated_at = '2026-02-12': SQLite 0 | DuckDB 1", note: 'Недели совпали с PostgreSQL: 9, 7 и 8 заказов. Но номер недели <code>%W</code> в SQLite считает от первого понедельника года, и 1–4 января получают неделю 00, а не ISO-неделю 1. Сравнение с <code>\'2026-02-12\'</code> в SQLite идёт по строкам и не находит даже заказ в полночь.' },
      notin: { title: 'NOT IN с NULL в подзапросе против NOT EXISTS', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: "-- Клиенты, которые никого не пригласили. referrer_id у 44 клиентов — NULL\nSELECT COUNT(*) AS not_in\nFROM customers\nWHERE customer_id NOT IN (SELECT referrer_id FROM customers);\n\nSELECT COUNT(*) AS not_exists\nFROM customers c\nWHERE NOT EXISTS (SELECT 1 FROM customers r\n                  WHERE r.referrer_id = c.customer_id);", out: " not_in \n--------\n      0\n(1 row)\n\n not_exists \n------------\n         45\n(1 row)" },
      dates: { title: 'Дата против метки времени', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: "-- 12 февраля: 5 заказов, один из них (1008) ровно в 00:00:00\nSELECT COUNT(*) AS eq_literal FROM orders WHERE created_at = '2026-02-12';\nSELECT COUNT(*) AS eq_date    FROM orders WHERE created_at::date = '2026-02-12';\n\n-- Февраль: BETWEEN по метке времени обрезает 28-е число на полуночи\nSELECT COUNT(*) AS between_ts FROM orders\nWHERE created_at BETWEEN '2026-02-01' AND '2026-02-28';\nSELECT COUNT(*) AS half_open  FROM orders\nWHERE created_at >= '2026-02-01' AND created_at < '2026-03-01';", out: " eq_literal \n------------\n          1\n(1 row)\n\n eq_date \n---------\n       5\n(1 row)\n\n between_ts \n------------\n         64\n(1 row)\n\n half_open \n-----------\n        67\n(1 row)" },
      explain: { title: 'EXPLAIN: встроенная CTE и MATERIALIZED', badge: 'проверено: PostgreSQL 16', lang: 'sql', code: "-- PostgreSQL 12+: CTE, на которую ссылаются один раз, встраивается в запрос\nEXPLAIN (COSTS OFF)\nWITH paid AS (SELECT * FROM orders WHERE status = 'paid')\nSELECT COUNT(*) FROM paid WHERE channel = 'рассылка';\n\n-- MATERIALIZED заставляет посчитать шаг отдельно и сохранить результат\nEXPLAIN (COSTS OFF)\nWITH paid AS MATERIALIZED (SELECT * FROM orders WHERE status = 'paid')\nSELECT COUNT(*) FROM paid WHERE channel = 'рассылка';", out: "                                 QUERY PLAN                                 \n----------------------------------------------------------------------------\n Aggregate\n   ->  Seq Scan on orders\n         Filter: ((status = 'paid'::text) AND (channel = 'рассылка'::text))\n(3 rows)\n\n                  QUERY PLAN                  \n----------------------------------------------\n Aggregate\n   CTE paid\n     ->  Seq Scan on orders\n           Filter: (status = 'paid'::text)\n   ->  CTE Scan on paid\n         Filter: (channel = 'рассылка'::text)\n(6 rows)" }
    },
    questions: {
    q1: { sec: 'logic', title: 'Сначала предскажите', q: 'У заказа 1011 rating = NULL. Пройдёт ли он условие WHERE rating >= 4 OR NOT (rating >= 4)?', opts: [['Да: одна из двух частей всегда истинна'], ['Нет: обе части дают UNKNOWN, и OR тоже даёт UNKNOWN', 1], ['Да: NOT превращает UNKNOWN в TRUE'], ['Запрос упадёт с ошибкой сравнения с NULL']],
      why: 'NULL >= 4 — UNKNOWN, NOT UNKNOWN — тоже UNKNOWN, а UNKNOWN OR UNKNOWN остаётся UNKNOWN. WHERE пропускает только TRUE, поэтому строка выпадает. Для известных оценок одна из частей действительно TRUE, отсюда ложное ощущение «всегда истинно». NOT не меняет UNKNOWN, а ошибки нет: сравнение с NULL в SQL допустимо, оно просто не даёт TRUE. Проверьте во вкладке OR ниже.' },
    q2: { sec: 'idea', q: 'В сцене шаг no_winter оставил 16 строк из 195. Почему пропали 159 заказов без промокода?', opts: [['Условие promo_code <> \'ЗИМА10\' дало для них FALSE'], ['Условие дало UNKNOWN, а WHERE пропускает только TRUE', 1], ['WITH не передаёт NULL из шага в шаг'], ['GROUP BY в by_channel выбросил группу NULL']],
      why: 'Для NULL сравнение даёт третье значение UNKNOWN, и WHERE отбрасывает такие строки так же, как FALSE. FALSE получили только 20 заказов с ЗИМА10. WITH передаёт строки без изменений: шаг paid показал все 195. Строки пропали до группировки, и группировали по channel, а не по promo_code.' },
    q3: { sec: 'nuances', q: 'SELECT COUNT(*) FROM customers WHERE customer_id NOT IN (SELECT referrer_id FROM customers) вернул 0, хотя многие клиенты никого не приглашали. Почему?', opts: [['NOT IN не работает с подзапросами'], ['Подзапрос вернул и NULL: customer_id <> NULL — UNKNOWN, и цепочка AND ни для одной строки не стала TRUE', 1], ['Подзапрос вернул пустой список'], ['customer_id и referrer_id разных типов']],
      why: 'NOT IN раскрывается в x <> a AND x <> b AND … Если среди значений есть NULL, одно из неравенств всегда UNKNOWN, и итог бывает только FALSE или UNKNOWN. NOT EXISTS отвечает только TRUE или FALSE и находит 45 клиентов. С подзапросами NOT IN работает, список не пуст (в нём 60 значений, 44 из них NULL), а типы обоих столбцов — integer.' },
    q4: { sec: 'idea', q: 'Чем CTE лучше того же запроса с вложенными подзапросами в FROM?', opts: [['CTE всегда быстрее: результат шага сохраняется'], ['Шаги стоят сверху вниз в порядке выполнения, у каждого имя, любой можно запустить отдельно и сослаться на него дважды', 1], ['CTE сохраняется в базе и доступна другим запросам'], ['Только в CTE можно использовать GROUP BY']],
      why: 'CTE меняет форму записи: шаги получают имена и читаются в порядке выполнения, поэтому их легко проверять по одному. Быстрее она не становится: PostgreSQL 12+ встраивает CTE с одной ссылкой в основной запрос, и план тот же. Живёт CTE только внутри своего запроса, а GROUP BY работает и во вложенном подзапросе.' },
    q5: { sec: 'types', q: 'В PostgreSQL created_at — метка времени. Допустим, в таблице есть 12 заказов за 4 ноября 2026 года, и ни одного ровно в полночь. Что вернёт SELECT COUNT(*) FROM orders WHERE created_at = \'2026-11-04\'?', opts: [['12 — все заказы за этот день'], ['0 — строка стала меткой 2026-11-04 00:00:00, и равенство ищет только полночь', 1], ['Ошибку: строку нельзя сравнить с меткой времени'], ['Заказы до полудня']],
      why: 'PostgreSQL приводит литерал к типу столбца: \'2026-11-04\' превращается в 2026-11-04 00:00:00. Равенство совпадает только с заказами ровно в полночь, а их нет. В учебной базе так нашёлся один заказ из пяти за 12 февраля — 1008. Ошибки нет, приведение неявное. Весь день берут полуинтервалом: created_at >= \'2026-11-04\' AND created_at < \'2026-11-05\'.' },
    q6: { sec: 'code', q: 'Заказ 1004 сделан в пятницу, 2 января 2026 года, в 23:37. В какую строку отчёта по неделям он попадёт?', code: "SELECT DATE_TRUNC('week', created_at)::date AS week, COUNT(*) AS n\nFROM orders WHERE status = 'paid'\nGROUP BY 1 ORDER BY 1;", lang: 'sql', opts: [['2026-01-01 — неделя года начинается с 1 января'], ['2025-12-29 — понедельник той недели, где лежит 2 января', 1], ['2026-01-05 — первый понедельник 2026 года'], ['2026-01-02 — DATE_TRUNC отрезает только время']],
      why: 'DATE_TRUNC(\'week\', …) отбрасывает всё мельче недели и возвращает её понедельник, 00:00:00. Понедельник недели со 2 января 2026 года — 29 декабря 2025-го, поэтому неделя подписана старым годом. 1 января — четверг, а не начало недели, а 5 января начинается уже следующая неделя. Время отрезает DATE_TRUNC(\'day\', …) или приведение ::date.' },
    q7: { sec: 'logic', q: 'COUNT(promo_code) по оплаченным заказам дал 36, хотя настоящий промокод ввели 31 раз. Как посчитать правильно?', opts: [['COUNT(COALESCE(promo_code, \'\'))'], ['COUNT(NULLIF(promo_code, \'\'))', 1], ['COUNT(DISTINCT promo_code)'], ['COUNT(*) с условием WHERE promo_code IS NOT NULL']],
      why: 'COUNT по столбцу пропускает NULL, но пустая строка \'\' — значение, и 5 таких заказов попали в счёт. NULLIF(promo_code, \'\') превращает \'\' в NULL, и остаётся 31. COALESCE делает обратное: NULL станет \'\', и счёт вырастет до 195. COUNT(DISTINCT) посчитает разные коды, а их три вместе с пустой строкой. IS NOT NULL тоже пропустит пустые строки: те же 36.' }
    },
    glossary: {
      subquery: { t: 'Подзапрос', en: 'subquery', d: 'Запрос SELECT в скобках внутри другого запроса: в WHERE, FROM или SELECT.' },
      cte: { t: 'Обобщённое табличное выражение', en: 'common table expression, CTE', d: 'Именованный шаг запроса WITH имя AS (…): временная таблица, которая живёт только внутри одного запроса.' },
      null: { t: 'NULL', en: 'null', d: 'Отметка «значения нет или оно неизвестно». Это не ноль и не пустая строка, а отсутствие значения.' },
      unknown: { t: 'UNKNOWN', en: 'unknown', d: 'Третье логическое значение SQL, которое дают сравнения с NULL. WHERE отбрасывает его так же, как FALSE.' },
      scalar: { t: 'Скалярный подзапрос', en: 'scalar subquery', d: 'Подзапрос, который возвращает одно значение: одну строку и один столбец.' },
      derived: { t: 'Производная таблица', en: 'derived table', d: 'Подзапрос в FROM: его результат используется как обычная таблица.' },
      correlated: { t: 'Коррелированный подзапрос', en: 'correlated subquery', d: 'Подзапрос, который ссылается на столбцы внешнего запроса и логически выполняется заново для каждой его строки.' },
      exists: { t: 'EXISTS', en: 'exists', d: 'Предикат: TRUE, если подзапрос вернул хотя бы одну строку, иначе FALSE. UNKNOWN не бывает.' },
      predicate: { t: 'Предикат', en: 'predicate', d: 'Выражение, которое отвечает TRUE, FALSE или UNKNOWN: условие в WHERE, ON, HAVING.' },
      antijoin: { t: 'Анти-соединение', en: 'anti-join', d: 'Выбор строк одной таблицы, для которых в другой нет пары: NOT EXISTS или LEFT JOIN … IS NULL.' },
      tvl: { t: 'Троичная логика', en: 'three-valued logic', d: 'Логика с тремя значениями TRUE, FALSE и UNKNOWN, по которой SQL вычисляет AND, OR и NOT.' },
      coalesce: { t: 'COALESCE', en: 'coalesce', d: 'Функция, которая возвращает первый аргумент, не равный NULL: COALESCE(promo_code, \'\').' },
      nullif: { t: 'NULLIF', en: 'nullif', d: 'Функция NULLIF(a, b): NULL, если a = b, иначе a. Превращает «пустышку» вроде \'\' в настоящий NULL.' },
      cast: { t: 'Приведение типов', en: 'type cast, CAST', d: 'Перевод значения в другой тип: CAST(x AS integer) или в PostgreSQL x::integer.' },
      literal: { t: 'Литерал', en: 'literal', d: 'Значение, записанное прямо в тексте запроса: 4, \'ЗИМА10\', \'2026-02-12\'.' },
      timestamp: { t: 'Метка времени', en: 'timestamp', d: 'Тип с датой и временем до долей секунды: 2026-02-12 00:00:00.' },
      datetrunc: { t: 'DATE_TRUNC', en: 'date_trunc', d: 'Функция, которая обрезает метку времени до начала периода: недели, месяца, дня.' },
      extract: { t: 'EXTRACT', en: 'extract', d: 'Функция, которая достаёт из даты число: час, день недели, номер недели.' },
      halfopen: { t: 'Полуинтервал', en: 'half-open interval', d: 'Условие «от включительно, до исключительно»: created_at >= начало AND created_at < следующий день.' },
      materialize: { t: 'Материализация', en: 'materialization', d: 'Расчёт шага CTE отдельно, с сохранением результата на время запроса.' },
      explain: { t: 'План запроса', en: 'query plan, EXPLAIN', d: 'Описание того, как база выполнит запрос: что и в каком порядке читает. Его печатает EXPLAIN.' }
    },
    materials: [
      ['da-3-4-cte-null-types.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/shop/', 'Учебная база shop для PostgreSQL, SQLite и DuckDB — общий набор темы 03'],
      ['queries.sql', 'Все запросы страницы в порядке разделов'],
      ['dialects.py', 'Неделя и сравнение дат в SQLite и DuckDB из Python'],
      ['three_valued.sql', 'Сверка интерактива: 14 условий на всех 24 сочетаниях значений']
    ],
    prompts: [
      ['Тренажёр по троичной логике', 'Дай мне по одному условию WHERE с NULL в данных: сравнения, AND, OR, NOT, IN, NOT IN, COALESCE. Я скажу, будет итог TRUE, FALSE или UNKNOWN и пройдёт ли строка, а ты проверишь по таблице истинности из источника. Шесть задач, по одной за раз.'],
      ['Разбери мой запрос на шаги', 'Я вставлю длинный запрос с вложенными подзапросами. Не переписывай его: вопросами помоги мне самому разложить его на шаги WITH. В конце проверь, где в условиях могут потеряться строки из-за NULL.'],
      ['Ловушки с датами', 'Задай мне пять вопросов о сравнении дат и меток времени, DATE_TRUNC и EXTRACT на учебной базе из источника. После каждого моего ответа объясни, что вернул бы PostgreSQL, и чем отличается SQLite.']
    ]
  };
})();
