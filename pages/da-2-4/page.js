/* Страница 2.4 · Группировки, сводные таблицы, соединения */
(() => {
  /* ===================== Учебные данные =====================
     Учебная выгрузка orders.csv: 32 заказа интернет-магазина за январь–март 2026, из них 25 оплаченных.
     Сгенерирована data/gen.py с random.Random(186). Все числа ниже посчитаны pandas 3.0.5 по этому файлу. */
  const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const MON = ['янв', 'фев', 'мар'];
  const CO = ['BY', 'KZ', 'RU', 'UZ'];                 // порядок строк сводной: groupby сортирует ключи
  const COL = { BY: '#6fa2ea', KZ: '#f0a247', RU: '#a48af0', UZ: '#f06ba5', AM: '#e3c04d' };
  // 25 оплаченных заказов в порядке выгрузки: [order_id, страна, месяц 0–2, сумма ₽]
  const PAID = [[1002, 'UZ', 0, 3380], [1003, 'BY', 0, 3400], [1004, 'KZ', 0, 2720], [1005, 'BY', 0, 1980], [1007, 'RU', 0, 3200], [1008, 'RU', 0, 3010], [1012, 'RU', 1, 5570], [1014, 'UZ', 1, 6010], [1015, 'UZ', 1, 2510], [1016, 'RU', 1, 3050], [1017, 'BY', 1, 3510], [1018, 'UZ', 1, 1940], [1019, 'BY', 1, 3580], [1021, 'RU', 1, 1750], [1022, 'KZ', 1, 1820], [1023, 'KZ', 2, 3870], [1024, 'UZ', 2, 2500], [1025, 'RU', 2, 5300], [1026, 'KZ', 2, 2640], [1027, 'BY', 2, 2580], [1028, 'BY', 2, 3550], [1029, 'BY', 2, 3670], [1030, 'RU', 2, 4270], [1031, 'KZ', 2, 2130], [1032, 'RU', 2, 1490]];
  // paid.groupby(["country", "month"]).agg(revenue=("amount", "sum"), orders=("order_id", "size")) — вывод pandas
  const PIV = { BY: [[5380, 2], [7090, 2], [9800, 3]], KZ: [[2720, 1], [1820, 1], [8640, 3]], RU: [[6210, 2], [10370, 3], [11060, 3]], UZ: [[3380, 1], [10460, 3], [2500, 1]] };
  const TOTAL = 79430;
  // учебный справочник countries.csv: код, название, валюта; UZ в нём нет, AM нет в заказах
  const REF = [['BY', 'Беларусь', 'BYN'], ['RU', 'Россия', 'RUB'], ['KZ', 'Казахстан', 'KZT'], ['AM', 'Армения', 'AMD']];

  /* ===================== Сцена ===================== */
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  // место заказа внутри своей ячейки: порядок появления в выгрузке
  const SLOT = (() => { const n = {}; return PAID.map(o => { const k = o[1] + o[2]; n[k] = (n[k] || 0) + 1; return n[k] - 1; }); })();

  // Две раскладки мира сцены: широкая и для узкого экрана. Мир масштабируется под размер сцены.
  const GEO = {
    d: { ww: 592, wh: 340, lc: 4, lw: 136, lh: 22, lgx: 12, lgy: 8, kw: 46, mx: 50, mw: 100, mg: 4, hy: 20, y0: 48, rh: 54,
      mini: [44, 18, [[4, 6], [52, 6], [4, 28]]], rx: 392, ry: 48, rrh: 28, rcw: [38, 92, 50], nx: 366, nw: 90, ux: 460, uw: 58, gx: 522, gw: 68, jh: 26 },
    m: { ww: 300, wh: 410, lc: 3, lw: 96, lh: 20, lgx: 6, lgy: 6, kw: 30, mx: 32, mw: 66, mg: 2, hy: 18, y0: 44, rh: 46,
      mini: [31, 14, [[2, 4], [34, 4], [2, 24]]], rx: 0, ry: 312, rrh: 24, rcw: [34, 84, 44], nx: 238, nw: 62, ux: null, uw: 0, gx: null, gw: 0, jh: 22 }
  };

  const scene = {
    parts: [{ n: '01', name: 'Выгрузка', s: [0, 1] }, { n: '02', name: 'Разделить', s: [2] }, { n: '03', name: 'Применить', s: [3] }, { n: '04', name: 'Собрать', s: [4] }, { n: '05', name: 'Справочник', s: [5, 6] }, { n: '06', name: 'Соединение', s: [7, 8, 9] }],
    steps: [
      { title: '25 оплаченных заказов', dur: 3000, body: '<p>Учебная выгрузка интернет-магазина: 32 заказа за&nbsp;январь–март 2026, из&nbsp;них 25 оплачены. У&nbsp;каждой строки есть номер, страна, дата и&nbsp;сумма.</p><p>Нужны выручка и&nbsp;число заказов по&nbsp;каждой стране в&nbsp;каждом месяце.</p>' },
      { title: 'Ключ — страна и месяц', dur: 2800, body: '<p>Из&nbsp;каждой строки берём пару значений: <b>country</b> и&nbsp;<b>month</b>. Это ключ группы: строки с&nbsp;одинаковой парой попадут в&nbsp;одну группу.</p><p>Четыре страны и&nbsp;три месяца дают до&nbsp;12&nbsp;групп.</p>' },
      { title: 'Строки разбегаются', dur: 3600, body: '<p><b>Разделить</b>: каждая строка уходит в&nbsp;ячейку своей пары «страна, месяц». Здесь ничего не&nbsp;считается и&nbsp;не&nbsp;теряется: 25&nbsp;строк лежат в&nbsp;12&nbsp;группах.</p>' },
      { title: 'Группа сворачивается', dur: 3400, body: '<p><b>Применить</b>: в&nbsp;каждой группе считаем два числа — сумму <b>amount</b> и&nbsp;количество строк. Три февральских заказа России дают 10&nbsp;370&nbsp;₽.</p><p>Группа из&nbsp;нескольких строк стала одной строкой результата.</p>' },
      { title: 'Получилась сводная', dur: 3000, body: '<p><b>Собрать</b>: результаты групп складываются в&nbsp;одну таблицу. Страны — строки, месяцы — столбцы: это сводная таблица в&nbsp;широком формате.</p><p>Выручка та&nbsp;же, 79&nbsp;430&nbsp;₽: группировка ничего не&nbsp;потеряла.</p>' },
      { title: 'Подъезжает справочник', dur: 3000, body: '<p>Названия стран лежат в&nbsp;другой таблице — справочнике <b>countries.csv</b>. Набор стран в&nbsp;нём другой: Узбекистана нет, зато есть Армения, где заказов не&nbsp;было.</p>' },
      { title: 'Пары по ключу', dur: 3000, body: '<p>Общий столбец двух таблиц — <b>country</b>. По&nbsp;нему ищутся пары: BY, KZ и&nbsp;RU есть в&nbsp;обеих.</p><p>Строки в&nbsp;таблицах идут в&nbsp;разном порядке, и&nbsp;это не&nbsp;мешает: пару ищут по&nbsp;значению ключа, а&nbsp;не&nbsp;по&nbsp;номеру строки.</p>' },
      { title: 'Совпавшие сцепляются', dur: 3200, body: '<p>Соединение <b>how="left"</b> оставляет все строки сводной и&nbsp;пристыковывает к&nbsp;каждой столбцы её&nbsp;пары: <b>name</b> и&nbsp;<b>currency</b>. Ключ в&nbsp;результате один.</p>' },
      { title: 'Без пары — пустота', dur: 3400, body: '<p>У&nbsp;Узбекистана пары нет. Строка остаётся, а&nbsp;в&nbsp;столбцах справочника — <b>NaN</b>. Армения в&nbsp;left не&nbsp;попадает: она есть только справа.</p><p>Столбец <b>_merge</b> подписывает, откуда строка: both или left_only.</p>' },
      { title: 'outer: пустота с обеих сторон', dur: 3800, next: 'Читать страницу', body: '<p>Соединение <b>how="outer"</b> сохраняет строки обеих таблиц. Армения возвращается с&nbsp;NaN во&nbsp;всех месяцах, а&nbsp;ключи отсортированы, поэтому AM встала первой.</p><p>Строк пять, выручка прежняя.</p>' }
    ],
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'rev', label: 'Выручка' }, { id: 'nan', label: 'NaN' }],
    legend: '<span><i class="sq" style="background:#24304a"></i>группа</span><span><i style="background:#36b8a6"></i>пара по ключу</span><span><i style="background:#f2756a"></i>пары нет, NaN</span>',
    info: 'СВОДНАЯ И СПРАВОЧНИК',
    aiNote: 'В анимации учебная выгрузка: 25 оплаченных заказов за январь–март 2026 из BY, KZ, RU, UZ, выручка 79 430 ₽. groupby(["country", "month"]) раскладывает их по 12 группам, agg(revenue=("amount", "sum"), orders=("order_id", "size")) сворачивает каждую группу, результат разворачивается в сводную 4 × 3 (например, RU в феврале: 3 заказа, 10 370 ₽). Затем сводная соединяется со справочником countries.csv (BY, RU, KZ, AM) по столбцу country: how="left" даёт 4 строки, у UZ name и currency = NaN, _merge = left_only; how="outer" добавляет строку AM с NaN во всех месяцах и сортирует ключи, поэтому AM первая.',
    mount(root, api) {
      const { esc, plural } = api;
      root.innerHTML = '<div class="pv"><div class="pv-w"></div></div>';
      const pv = root.firstChild, w = pv.firstChild;
      w._c = {};
      const mk = (cls, html, cc) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; if (cc) d.style.setProperty('--cc', cc); w.appendChild(d); d._c = {}; return d; };
      // элементы мира
      const cellBox = [], cellVal = [];
      CO.forEach(c => [0, 1, 2].forEach(m => { cellBox.push(mk('pv-cell', '')); }));
      CO.forEach(c => [0, 1, 2].forEach(m => { const v = PIV[c][m]; cellVal.push(mk('pv-val', `<b>${fmtN(v[0])}</b><small>${v[1]} ${plural(v[1], ['заказ', 'заказа', 'заказов'])}</small>`)); }));
      const mhead = MON.map(m => mk('pv-hd', m));
      const corner = mk('pv-hd pv-corner', 'country');
      const labs = CO.map(c => mk('pv-lab', c, COL[c]));
      const chips = PAID.map(o => mk('pv-chip', `<i class="pv-id">${o[0]}</i><b>${o[1]}</b><span class="pv-mo">${MON[o[2]]}</span><span class="pv-am">${fmtN(o[3])}</span>`, COL[o[1]]));
      const refHd = mk('pv-hd pv-rhd', 'countries.csv');
      const ref = REF.map(r => ({ code: mk('pv-rc pv-code', r[0], COL[r[0]]), name: mk('pv-rc', esc(r[1])), cur: mk('pv-rc', r[2]) }));
      const uzNan = [mk('pv-rc pv-nan', 'NaN'), mk('pv-rc pv-nan', 'NaN')];
      const amNan = [0, 1, 2].map(() => mk('pv-val pv-nanv', '<b>NaN</b>'));
      const jhd = ['name', 'currency', '_merge'].map(t => mk('pv-hd pv-jhd', t));
      const MG = [['BY', 'both'], ['KZ', 'both'], ['RU', 'both'], ['UZ', 'left_only'], ['AM', 'right_only']];
      const mgs = MG.map(([c, t]) => mk(`pv-mg ${t}`, `<span>${t}</span>`));
      const mleg = mk('pv-mleg', '_merge: <i class="both"></i>both <i class="left_only"></i>left_only <i class="right_only"></i>right_only');
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('class', 'pv-lines'); svg.setAttribute('aria-hidden', 'true'); w.appendChild(svg);
      const lines = ['BY', 'KZ', 'RU'].map(() => { const l = document.createElementNS(svgNS, 'path'); svg.appendChild(l); return l; });
      const calls = [mk('pv-call', ''), mk('pv-call', '')];

      // размер мира и масштаб
      let G = GEO.d, scale = 1, sig = '', dirty = true;
      const fit = () => {
        const W = pv.clientWidth, H = pv.clientHeight; if (!W || !H) return;
        const g = W < 470 ? GEO.m : GEO.d;
        if (g !== G) { G = g; dirty = true; }
        scale = Math.min(W / G.ww, H / G.wh, 1.12);
        w.style.width = G.ww + 'px'; w.style.height = G.wh + 'px';
        w.style.transform = `translate(${((W - G.ww * scale) / 2).toFixed(1)}px, ${((H - G.wh * scale) / 2).toFixed(1)}px) scale(${scale.toFixed(4)})`;
        svg.setAttribute('width', G.ww); svg.setAttribute('height', G.wh);
        dirty = true;
      };
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(pv);
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
      const rowTop = (r, sh) => G.y0 + (r + sh) * G.rh;
      const cellX = m => G.mx + m * (G.mw + G.mg);
      const listXY = i => {
        const rows = Math.ceil(PAID.length / G.lc), lw = G.lc * G.lw + (G.lc - 1) * G.lgx, lh = rows * G.lh + (rows - 1) * G.lgy;
        return [(G.ww - lw) / 2 + (i % G.lc) * (G.lw + G.lgx), (G.wh - lh) / 2 + Math.floor(i / G.lc) * (G.lh + G.lgy)];
      };
      const refXY = (j, col) => [G.rx + G.rcw.slice(0, col).reduce((a, b) => a + b + 2, 0), G.ry + j * G.rrh];
      const joinY = (r, sh) => rowTop(r, sh) + (G.rh - G.jh) / 2;

      function callAt(k) {
        const mob = G === GEO.m, c = [];
        const ri = CO.indexOf('RU'), ui = CO.indexOf('UZ');
        if (k === 1) { const [x, y] = listXY(0); c.push([x, y - 28, 'ключ группы: country + month', 0]); }
        if (k === 2) c.push(mob ? [0, rowTop(4, 0) + 8, '25 строк → 12 групп', 0] : [cellX(2) + G.mw + 12, rowTop(1, 0) + G.rh / 2 - 13, '25 строк → 12 групп', 0]);
        if (k === 3) c.push(mob ? [0, rowTop(4, 0) + 8, 'RU, фев: 3 заказа → 10 370 ₽', 0] : [cellX(2) + G.mw + 12, rowTop(ri, 0) + G.rh / 2 - 13, '← 3 заказа → 10 370 ₽', 0]);
        if (k === 4) c.push(mob ? [0, rowTop(4, 0) + 8, 'строки — страны, столбцы — месяцы', 0] : [cellX(2) + G.mw, G.hy - 26, 'строки — страны, столбцы — месяцы', 1]);
        if (k === 5) c.push(mob ? [G.ww, G.ry - 28, 'UZ нет, зато есть AM', 1] : [G.rx + 186, G.ry + 4 * G.rrh + 6, 'UZ нет, зато есть AM', 1]);
        if (k === 6) c.push(mob ? [G.ww, G.ry - 28, 'пары по ключу country: 3', 1] : [G.rx + 186, G.ry + 4 * G.rrh + 6, 'пары по ключу country: 3', 1]);
        if (k === 7) c.push(mob ? [0, rowTop(4, 0) + 8, 'how="left": строки сводной на месте', 0] : [G.ww, G.hy - 26, 'how="left": строки сводной на месте', 1]);
        if (k === 8) { c.push([G.nx + (mob ? G.nw : G.nw + G.uw + 4), joinY(ui, 0) + G.jh + 6, 'пары нет → NaN', 1]); }
        if (k === 9) c.push(mob ? [0, rowTop(5, 0) + 8, 'outer: ключи по алфавиту, AM с NaN', 0] : [G.ww, G.hy - 26, 'outer: ключи по алфавиту, AM с NaN', 1]);
        return c;
      }

      return {
        render(k, p) {
          // счётчики
          const rows = k < 3 ? 25 : k === 3 ? (p < .6 ? 25 : 12) : k < 9 ? 4 : (p < .4 ? 4 : 5);
          api.hud('rows', String(rows), k === 3 && p >= .6 ? 'групп' : k >= 4 && k < 5 ? '× 3 месяца' : k === 9 && p >= .4 ? 'outer' : k >= 7 ? 'left' : '');
          api.hud('rev', fmtN(TOTAL), '₽');
          const nan = k < 8 ? 0 : k === 8 ? (p < .35 ? 0 : 2) : (p < .5 ? 2 : 7);
          api.hud('nan', String(nan), nan ? (k === 9 && p >= .5 ? 'UZ и AM' : 'у UZ') : '');

          const key = [k, Math.round(p * 400), G === GEO.m].join('|');
          if (key === sig && !dirty) return; sig = key; dirty = false;
          const sh9 = k === 9 ? ease(seg(p, 0, .35)) : 0;          // в outer строки съезжают вниз
          const table = k >= 4;
          cls(w, 'pv-tbl', table);

          // заголовки и рамки сводной
          const fo = k < 2 ? 0 : k === 2 ? seg(p, 0, .2) : 1;
          mhead.forEach((h, m) => set(h, cellX(m), G.hy, fo, G.mw, 22));
          set(corner, 0, G.hy, table && G !== GEO.m ? 1 : 0, G.kw - 4, 22);
          labs.forEach((l, r) => {
            set(l, 0, rowTop(r, sh9) + 2, fo, G.kw - 4, G.rh - 4);
            cls(l, 'match', k === 6 && r !== 3);
            cls(l, 'nomatch', (k === 6 || k === 7) && r === 3);
          });
          CO.forEach((c, r) => [0, 1, 2].forEach(m => {
            const i = r * 3 + m;
            set(cellBox[i], cellX(m), rowTop(r, sh9) + 2, fo, G.mw, G.rh - 4);
            const vo = k < 3 ? 0 : k === 3 ? seg(p, .45, .8) : 1;
            set(cellVal[i], cellX(m), rowTop(r, sh9) + 2, vo, G.mw, G.rh - 4);
            cls(cellVal[i], 'hot', k === 3 && c === 'RU' && m === 1);
          }));

          // заказы: список → ячейки → свёртка
          const [mw0, mh0, slots] = G.mini;
          PAID.forEach((o, i) => {
            const el = chips[i], r = CO.indexOf(o[1]), m = o[2];
            const [lx, ly] = listXY(i);
            const bx = cellX(m) + slots[SLOT[i]][0], by = rowTop(r, 0) + 2 + slots[SLOT[i]][1];
            const cx = cellX(m) + G.mw / 2 - mw0 / 2, cy = rowTop(r, 0) + G.rh / 2 - mh0 / 2;
            let x = lx, y = ly, op = 1, wd = G.lw, ht = G.lh, mini = false;
            if (k === 0) op = seg(p, i * .015, i * .015 + .25);
            else if (k === 2) {
              const t = ease(seg(p, .04 + i * .016, .44 + i * .016));
              x = lerp(lx, bx, t); y = lerp(ly, by, t); wd = Math.round(lerp(G.lw, mw0, t)); ht = Math.round(lerp(G.lh, mh0, t)); mini = t > .5;
            } else if (k === 3) {
              const t = ease(seg(p, .12, .55)); x = lerp(bx, cx, t); y = lerp(by, cy, t); wd = mw0; ht = mh0; mini = true; op = 1 - seg(p, .35, .6);
            } else if (k >= 4) { op = 0; x = cx; y = cy; wd = mw0; ht = mh0; mini = true; }
            set(el, x, y, op, wd, ht);
            cls(el, 'mini', mini); cls(el, 'key', k === 1);
          });

          // справочник
          const mob = G === GEO.m;
          const slideIn = k < 5 ? 0 : k === 5 ? ease(seg(p, 0, .55)) : 1;
          const rdx = (1 - slideIn) * (mob ? 0 : 200), rdy = (1 - slideIn) * (mob ? 60 : 0);
          set(refHd, G.rx + rdx, G.ry - 24 + rdy, k < 5 ? 0 : k === 5 ? seg(p, 0, .4) : k === 6 ? 1 : k === 7 ? 1 - seg(p, 0, .3) : 0, 160, 22);
          REF.forEach((rw, j) => {
            const R = ref[j], r = CO.indexOf(rw[0]), matched = r >= 0;
            const [cx0, cy0] = refXY(j, 0), [nx0] = refXY(j, 1), [ux0] = refXY(j, 2);
            let o = k < 5 ? 0 : k === 5 ? seg(p, 0, .4) : 1;
            let C = [cx0 + rdx, cy0 + rdy, o], N = [nx0 + rdx, cy0 + rdy, o], U = [ux0 + rdx, cy0 + rdy, o];
            let nw = G.rcw[1], uw = G.rcw[2];
            if (matched && k >= 7) {
              const order = ['BY', 'KZ', 'RU'].indexOf(rw[0]);
              const t = k === 7 ? ease(seg(p, .05 + order * .08, .6 + order * .08)) : 1;
              const ty = joinY(r, sh9);
              C = [lerp(cx0, 0, t), lerp(cy0, rowTop(r, sh9) + (G.rh - G.rrh + 4) / 2, t), 1 - seg(t, .1, .4)];
              N = [lerp(nx0, G.nx, t), lerp(cy0, ty, t), 1]; nw = Math.round(lerp(G.rcw[1], G.nw, t));
              U = mob ? [ux0, cy0, 1 - t] : [lerp(ux0, G.ux, t), lerp(cy0, ty, t), 1]; uw = mob ? G.rcw[2] : Math.round(lerp(G.rcw[2], G.uw, t));
            }
            if (!matched) {   // Армения: в left выпадает, в outer возвращается первой строкой
              const ay = rowTop(4, 0) + 10, ax = G.nx - G.rcw[0] - 2;
              if (!mob && (k === 7 || k === 8)) {
                const t = k === 7 ? ease(seg(p, 0, .3)) : 1;
                C = [lerp(cx0, ax, t), lerp(cy0, ay, t), 1]; N = [lerp(nx0, ax + G.rcw[0] + 2, t), lerp(cy0, ay, t), 1]; U = [lerp(ux0, ax + G.rcw[0] + G.rcw[1] + 4, t), lerp(cy0, ay, t), 1];
              }
              if (k === 8) { const t = seg(p, 0, .4); C[2] = N[2] = U[2] = 1 - t; C[1] += t * 14; N[1] += t * 14; U[1] += t * 14; }
              if (k === 9) {
                const t = seg(p, .3, .6), dx = (1 - ease(t)) * 24;
                C = [dx, rowTop(0, 0) + 2, t]; N = [G.nx + dx, joinY(0, 0), t]; U = [mob ? 0 : G.ux + dx, joinY(0, 0), mob ? 0 : t];
                nw = G.nw; uw = G.uw;
              }
            }
            const amLab = !matched && k === 9;
            set(R.code, C[0], C[1], C[2], amLab ? G.kw - 4 : G.rcw[0], amLab ? G.rh - 4 : G.rrh - 4);
            set(R.name, N[0], N[1], N[2], nw, matched && k >= 7 || (!matched && k === 9) ? G.jh : G.rrh - 4);
            set(R.cur, U[0], U[1], U[2], uw, matched && k >= 7 || (!matched && k === 9) ? G.jh : G.rrh - 4);
            cls(R.code, 'match', k === 6 && matched);
            cls(R.code, 'nomatch', k >= 6 && k <= 8 && !matched);
            cls(R.code, 'lab', !matched && k === 9);
          });
          // линии пар по ключу (широкая раскладка)
          const lo = mob ? 0 : k === 6 ? seg(p, .15, .5) : k === 7 ? 1 - seg(p, 0, .25) : 0;
          ['BY', 'KZ', 'RU'].forEach((c, n) => {
            const r = CO.indexOf(c), j = REF.findIndex(x => x[0] === c);
            const x1 = cellX(2) + G.mw + 2, y1 = rowTop(r, 0) + G.rh / 2, x2 = G.rx - 2, y2 = G.ry + j * G.rrh + (G.rrh - 4) / 2;
            lines[n].setAttribute('d', `M${x1} ${y1} C${x1 + 18} ${y1} ${x2 - 18} ${y2} ${x2} ${y2}`);
            lines[n].style.opacity = lo.toFixed(3);
          });
          // пустоты: у UZ нет пары; у AM в outer нет заказов
          const ui = CO.indexOf('UZ'), uo = k === 8 ? seg(p, .2, .55) : k === 9 ? 1 : 0;
          set(uzNan[0], G.nx, joinY(ui, sh9), uo, G.nw, G.jh);
          set(uzNan[1], mob ? G.nx : G.ux, joinY(ui, sh9), mob ? 0 : uo, G.uw || 10, G.jh);
          amNan.forEach((el, m) => set(el, cellX(m) + 24 * (1 - ease(seg(p, .4, .7))), rowTop(0, 0) + 2, k === 9 ? seg(p, .4, .7) : 0, G.mw, G.rh - 4));
          const jo = k < 7 ? 0 : k === 7 ? seg(p, .5, .9) : 1;
          set(jhd[0], G.nx, G.hy, jo, G.nw, 22);
          set(jhd[1], mob ? G.nx : G.ux, G.hy, mob ? 0 : jo, G.uw || 10, 22);
          set(jhd[2], mob ? 0 : G.gx, G.hy, mob ? 0 : (k === 8 ? seg(p, .5, .85) : k === 9 ? 1 : 0), G.gw || 10, 22);
          MG.forEach(([c, t], n) => {
            const r = c === 'AM' ? 0 : CO.indexOf(c), sh = c === 'AM' ? 0 : sh9;
            const o = c === 'AM' ? (k === 9 ? seg(p, .55, .85) : 0) : (k === 8 ? seg(p, .5, .85) : k === 9 ? 1 : 0);
            if (mob) set(mgs[n], G.kw - 11, rowTop(r, sh) + 6, o, 6, 6);
            else set(mgs[n], G.gx, joinY(r, sh), o, G.gw, G.jh);
          });
          cls(w, 'pv-mob', mob);
          set(mleg, 0, k === 9 ? rowTop(5, 0) + 38 : rowTop(4, 0) + 40, mob ? (k === 8 ? seg(p, .5, .85) : k === 9 ? 1 : 0) : 0);

          // выноски
          const cs = p > .4 ? callAt(k) : [];
          calls.forEach((el, n) => {
            const c = cs[n];
            if (!c) { set(el, el._c.x || 0, el._c.y || 0, 0); return; }
            if (el._c.txt !== c[2]) { el.textContent = c[2]; el._c.txt = c[2]; }
            el._c.x = c[0]; el._c.y = c[1];
            const al = c[3] === 1 ? 'r' : c[3] === 2 ? 'c' : 'l';
            if (el._c.al !== al) { el.dataset.al = al; el._c.al = al; }
            set(el, c[0], c[1], seg(p, .4, .55));
          });
        }
      };
    }
  };

  /* ===================== Интерактив «Соединение на глазах» ===================== */
  // Шесть оплаченных заказов из учебной выгрузки и учебная таблица менеджеров managers.csv:
  // за каждой парой «страна, канал» закреплён один человек. UZ у менеджеров нет, AM нет в заказах.
  const JL = [{ order_id: 1003, country: 'BY', channel: 'органика', amount: 3400 }, { order_id: 1004, country: 'KZ', channel: 'реклама', amount: 2720 }, { order_id: 1007, country: 'RU', channel: 'органика', amount: 3200 }, { order_id: 1008, country: 'RU', channel: 'реклама', amount: 3010 }, { order_id: 1012, country: 'RU', channel: 'рассылка', amount: 5570 }, { order_id: 1015, country: 'UZ', channel: 'органика', amount: 2510 }];
  const JR = [{ country: 'BY', channel: 'органика', manager: 'Анна' }, { country: 'RU', channel: 'реклама', manager: 'Борис' }, { country: 'RU', channel: 'рассылка', manager: 'Вера' }, { country: 'KZ', channel: 'реклама', manager: 'Глеб' }, { country: 'AM', channel: 'реклама', manager: 'Дина' }];
  const JKEYS = { country: ['country'], channel: ['channel'], both: ['country', 'channel'] };
  const JKEY_LBL = { country: 'country', channel: 'channel', both: 'country + channel' };

  /*merge:start*/
  // Повторяет pandas.merge (pandas 3.0.5), сверено запуском для всех 4 × 3 сочетаний:
  // inner и left — порядок левой таблицы, right — порядок правой, outer — ключи отсортированы,
  // внутри ключа — порядок левой, у каждой левой строки пары идут в порядке правой.
  const keyOf = (r, on) => on.map(c => r[c]);
  const kstr = (r, on) => keyOf(r, on).join('\u0001');
  const cmpKey = (a, b) => { for (let i = 0; i < a.length; i++) { if (a[i] < b[i]) return -1; if (a[i] > b[i]) return 1; } return 0; };
  function mergePairs(L, R, how, on) {
    const idx = rows => { const m = new Map(); rows.forEach((r, i) => { const k = kstr(r, on); if (!m.has(k)) m.set(k, []); m.get(k).push(i); }); return m; };
    const li = idx(L), ri = idx(R);
    let pairs = [];
    if (how === 'right') R.forEach((r, j) => { const m = li.get(kstr(r, on)); if (m) m.forEach(i => pairs.push([i, j])); else pairs.push([null, j]); });
    else {
      L.forEach((l, i) => { const m = ri.get(kstr(l, on)); if (m) m.forEach(j => pairs.push([i, j])); else if (how !== 'inner') pairs.push([i, null]); });
      if (how === 'outer') {
        R.forEach((r, j) => { if (!li.has(kstr(r, on))) pairs.push([null, j]); });
        const kv = q => keyOf(q[0] != null ? L[q[0]] : R[q[1]], on);
        pairs = pairs.map((q, n) => [q, n]).sort((a, b) => cmpKey(kv(a[0]), kv(b[0])) || a[1] - b[1]).map(x => x[0]);
      }
    }
    return pairs;
  }
  function mergeTable(L, R, how, on) {
    const lc = Object.keys(L[0]), rc = Object.keys(R[0]);
    const both = lc.filter(c => rc.includes(c) && !on.includes(c));
    const cols = lc.map(c => on.includes(c) ? { name: c, k: c } : { name: both.includes(c) ? c + '_x' : c, s: 'L', c })
      .concat(rc.filter(c => !on.includes(c)).map(c => ({ name: both.includes(c) ? c + '_y' : c, s: 'R', c })));
    const rows = mergePairs(L, R, how, on).map(([i, j]) => {
      const l = i == null ? null : L[i], r = j == null ? null : R[j];
      return { i, j, merge: l && r ? 'both' : l ? 'left_only' : 'right_only', v: cols.map(c => c.k ? (l || r)[c.k] : c.s === 'L' ? (l ? l[c.c] : null) : (r ? r[c.c] : null)) };
    });
    // целый столбец с пропуском pandas переводит в float: 1003 → 1003.0
    const float = cols.map((c, n) => typeof (c.s === 'R' ? R[0][c.c] : L[0][c.c] ?? R[0][c.k]) === 'number' && rows.some(r => r.v[n] == null));
    const dup = new Set(); const seen = new Set(); R.forEach(r => { const k = kstr(r, on); if (seen.has(k)) dup.add(k); seen.add(k); });
    const validate = dup.size ? 'Merge keys are not unique in right dataset; not a many-to-one merge' : 'ok';
    return { cols, rows, float, validate };
  }
  /*merge:end*/

  function buildJoin(box, api) {
    const { $, esc, hl, plural } = api;
    const HOWS = ['inner', 'left', 'right', 'outer'];
    const PAL = ['--c1', '--c2', '--c5', '--c3', '--c4', '--c7', '--c6'];
    const LSUM = JL.reduce((a, r) => a + r.amount, 0);
    box.innerHTML = `<div class="block-hd"><span class="t">Строк в результате столько, сколько пар нашёл ключ <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="jn-reset">Сбросить</button></div></div>
<p class="hint jn-do">Переключайте тип соединения и ключ. Один цвет — одно значение ключа в обеих таблицах, пунктир — пары нет. Наведите на строку разбора, чтобы подсветить её строки.</p>
<div class="jn-ctl"><span class="jn-grp"><span class="jn-lb">how</span><span class="seg" role="group" aria-label="Тип соединения" id="jn-how">${HOWS.map(h => `<button type="button" data-how="${h}">${h}</button>`).join('')}</span></span><span class="jn-grp"><span class="jn-lb">on</span><span class="seg" role="group" aria-label="Ключ соединения" id="jn-on">${Object.keys(JKEYS).map(k => `<button type="button" data-on="${k}">${JKEY_LBL[k]}</button>`).join('')}</span></span></div>
<pre class="jn-call" id="jn-call"></pre>
<div class="stage"><div class="jn-main"><div class="jn-src"><div class="jn-t" id="jn-l"></div><div class="jn-t" id="jn-r"></div></div><div class="jn-t jn-res" id="jn-res"></div></div>
<div class="narr"><p class="cap" id="jn-wcap"></p><ul class="jn-why" id="jn-why"></ul><div class="readout jn-ro"><div><span class="big" id="jn-n"></span><span class="lbl" id="jn-nl"></span></div><div><span class="big" id="jn-sum"></span><span class="lbl">Σ amount, ₽ · в заказах ${fmtN(LSUM)}</span></div></div><div class="narr-text" id="jn-msg"></div><p class="cap">Задания</p><ol class="steps jn-tasks" id="jn-tasks"></ol></div></div>
<div class="status"><span><span class="dot live"></span><span id="jn-s1"></span></span><span id="jn-s2"></span><span class="grow"></span><span id="jn-s3"></span></div>`;
    const TASKS = [
      { t: 'Найдите ключ, при котором заказ 1008 повторяется в результате трижды.', ok: R => R.rows.filter(r => r.i === 3).length === 3 },
      { t: 'Получите результат, где есть Армения, но нет заказа из Узбекистана.', ok: R => R.rows.some(r => r.j === 4) && !R.rows.some(r => r.i === 5) },
      { t: 'Соберите таблицу, где у каждого из шести заказов ровно одна строка и validate проходит.', ok: R => R.rows.length === 6 && new Set(R.rows.map(r => r.i)).size === 6 && R.rows.every(r => r.i != null) && R.validate === 'ok' }
    ];
    let s;
    const fresh = () => ({ how: 'inner', on: 'country', done: [false, false, false] });
    const cellTxt = (v, fl) => v == null ? 'NaN' : fl ? `${v}.0` : String(v);

    function draw() {
      const on = JKEYS[s.on], R = mergeTable(JL, JR, s.how, on);
      TASKS.forEach((t, n) => { if (t.ok(R)) s.done[n] = true; });
      // цвета ключей: совпавшие значения — цвет, без пары — пунктир
      const lk = JL.map(r => kstr(r, on)), rk = JR.map(r => kstr(r, on));
      const matched = [...new Set(lk.filter(k => rk.includes(k)))].sort();
      const color = k => { const i = matched.indexOf(k); return i < 0 ? null : PAL[i % PAL.length]; };
      const kcell = (v, k) => { const c = color(k); return `<td class="kc${c ? '' : ' nk'}"${c ? ` style="--kc: var(${c})"` : ''}>${esc(v)}</td>`; };
      const label = k => k.split('\u0001').join(' · ');
      const srcTable = (name, rows, cols, keys) => `<div class="jn-cap"><b>${name}</b><span>${rows.length} ${plural(rows.length, ['строка', 'строки', 'строк'])}</span></div><div class="jn-scroll"><table><thead><tr><th></th>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr data-k="${esc(keys[i])}"><td class="ix">${i}</td>${cols.map(c => on.includes(c) ? kcell(r[c], keys[i]) : `<td>${esc(r[c])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      $('jn-l').innerHTML = srcTable('orders', JL, Object.keys(JL[0]), lk);
      $('jn-r').innerHTML = srcTable('managers', JR, Object.keys(JR[0]), rk);
      const n = R.rows.length, cnt = t => R.rows.filter(r => r.merge === t).length;
      const rkeys = R.rows.map(r => kstr(r.i != null ? JL[r.i] : JR[r.j], on));
      $('jn-res').innerHTML = `<div class="jn-cap"><b>result</b><span>${n} ${plural(n, ['строка', 'строки', 'строк'])}</span></div><div class="jn-scroll"><table><thead><tr><th></th>${R.cols.map(c => `<th>${c.name}</th>`).join('')}<th>_merge</th></tr></thead><tbody>${R.rows.map((r, x) => `<tr data-k="${esc(rkeys[x])}"><td class="ix">${x}</td>${R.cols.map((c, m) => c.k ? kcell(r.v[m], rkeys[x]) : r.v[m] == null ? '<td class="na">NaN</td>' : `<td${R.float[m] ? ' class="fl"' : ''}>${esc(cellTxt(r.v[m], R.float[m]))}</td>`).join('')}<td><span class="jn-mg ${r.merge}">${r.merge}</span></td></tr>`).join('')}</tbody></table></div>`;
      // откуда столько строк: по каждому значению ключа
      const keys = [...new Set(rkeys.concat(lk, rk))];
      const keep = k => { const a = lk.filter(x => x === k).length, b = rk.filter(x => x === k).length; return a && b ? a * b : a ? (s.how === 'left' || s.how === 'outer' ? a : 0) : (s.how === 'right' || s.how === 'outer' ? b : 0); };
      $('jn-wcap').textContent = `Откуда ${n} ${plural(n, ['строка', 'строки', 'строк'])}`;
      $('jn-why').innerHTML = keys.map(k => {
        const a = lk.filter(x => x === k).length, b = rk.filter(x => x === k).length, c = color(k), got = keep(k);
        const how = a && b ? `${a} × ${b} = ${a * b}` : `${a} × ${b} → ${got ? `${got} с NaN` : '0'}`;
        return `<li data-k="${esc(k)}" tabindex="0" class="${c ? '' : 'nk'}${!got ? ' gone' : ''}"${c ? ` style="--kc: var(${c})"` : ''}><i></i><b>${esc(label(k))}</b><span>${how}</span></li>`;
      }).join('') + `<li class="sum"><i></i><b>итого</b><span>${n}</span></li>`;
      const sum = R.rows.reduce((a, r) => a + (r.i != null ? JL[r.i].amount : 0), 0);
      $('jn-n').textContent = n; $('jn-nl').textContent = `${plural(n, ['строка', 'строки', 'строк'])} · заказов ${JL.length}`;
      $('jn-sum').textContent = fmtN(sum);
      $('jn-call').innerHTML = hl(`orders.merge(managers, on=${on.length > 1 ? `["country", "channel"]` : `"${on[0]}"`}, how="${s.how}", indicator=True)`);
      // объяснение
      const dupK = [...new Set(rk.filter((k, i) => rk.indexOf(k) !== i))].filter(k => lk.includes(k));
      const other = on.length === 1 ? (on[0] === 'country' ? 'channel' : 'country') : null;
      const lost = JL.filter((r, i) => !R.rows.some(x => x.i === i)).map(r => r.order_id);
      const nanL = R.rows.filter(r => r.merge === 'left_only').map(r => JL[r.i].order_id);
      let msg = '';
      if (dupK.length) {
        const d = dupK.map(k => `${label(k)} — ${rk.filter(x => x === k).length} строки`).join(', ');
        msg = `Ключ ${JKEY_LBL[s.on]} неуникален в managers: ${d}. Каждый заказ с таким ключом повторился, и сумма amount выросла до ${fmtN(sum)} ₽ при ${fmtN(LSUM)} ₽ в заказах. `;
      } else msg = `Ключ country + channel уникален в managers: у заказа не больше одного менеджера, лишних строк нет. `;
      if (lost.length) msg += `Без пары ${lost.length === 1 ? 'выпал заказ' : 'выпали заказы'} ${lost.join(', ')}. `;
      if (nanL.length) msg += `${nanL.length === 1 ? 'Заказ' : 'Заказы'} ${[...new Set(nanL)].join(', ')} без пары ${nanL.length === 1 ? 'остался' : 'остались'} с NaN в manager. `;
      if (R.rows.some(r => r.merge === 'right_only')) msg += 'Армения пришла из managers с NaN в order_id и amount, поэтому эти столбцы стали float. ';
      if (other) msg += `Столбец ${other} не вошёл в ключ, поэтому раздвоился: ${other}_x и ${other}_y.`;
      $('jn-msg').textContent = msg.trim();
      $('jn-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t.t)}</li>`).join('');
      $('jn-s1').textContent = `orders ${JL.length} · managers ${JR.length} → ${n} ${plural(n, ['строка', 'строки', 'строк'])}`;
      $('jn-s2').textContent = `both ${cnt('both')} · left_only ${cnt('left_only')} · right_only ${cnt('right_only')}`;
      $('jn-s3').textContent = R.validate === 'ok' ? 'validate="many_to_one": ✓ ключ справа уникален' : 'validate="many_to_one": ✗ MergeError';
      $('jn-s3').title = R.validate === 'ok' ? '' : R.validate;
      box.querySelectorAll('#jn-how button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.how === s.how)));
      box.querySelectorAll('#jn-on button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.on === s.on)));
      s.R = R; s.sum = sum;
    }
    const hot = k => { box.classList.toggle('jn-hot', k != null); box.querySelectorAll('tr[data-k], .jn-why li[data-k]').forEach(el => el.classList.toggle('hl', k != null && el.dataset.k === k)); };
    box.addEventListener('click', e => {
      const h = e.target.closest('[data-how]'), o = e.target.closest('[data-on]');
      if (h) { s.how = h.dataset.how; draw(); } else if (o) { s.on = o.dataset.on; draw(); }
    });
    box.addEventListener('mouseover', e => { const li = e.target.closest('.jn-why li[data-k]'); if (li) hot(li.dataset.k); });
    box.addEventListener('mouseout', e => { if (e.target.closest('.jn-why li[data-k]')) hot(null); });
    box.addEventListener('focusin', e => { const li = e.target.closest('.jn-why li[data-k]'); if (li) hot(li.dataset.k); });
    box.addEventListener('focusout', e => { if (e.target.closest('.jn-why li[data-k]')) hot(null); });
    $('jn-reset').addEventListener('click', () => { s = fresh(); hot(null); draw(); });
    s = fresh(); draw();
    return {
      describe() {
        const R = s.R, c = t => R.rows.filter(r => r.merge === t).length;
        return `how="${s.how}", on=${JKEY_LBL[s.on]}; строк в результате ${R.rows.length} (заказов 6, менеджеров 5): both ${c('both')}, left_only ${c('left_only')}, right_only ${c('right_only')}; сумма amount ${fmtN(s.sum)} ₽ при ${fmtN(LSUM)} ₽ в заказах; validate="many_to_one": ${R.validate === 'ok' ? 'проходит' : 'MergeError'}; выполнено заданий: ${s.done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== График к блоку melt ===================== */
  // Данные — вывод melt из блока кода: выручка по каналам за три месяца
  const LONG = { органика: [6600, 10890, 16910], рассылка: [0, 5570, 6400], реклама: [11090, 13280, 8690] };
  const chart = (() => {
    const W = 520, H = 190, l = 46, r = 96, t = 14, b = 30, X = i => l + i * (W - l - r) / 2, Y = v => t + (1 - v / 18000) * (H - t - b);
    const grid = [0, 6000, 12000, 18000].map(v => `<line x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}" class="g"/><text x="${l - 8}" y="${Y(v) + 4}" text-anchor="end">${v ? fmtN(v) : '0'}</text>`).join('');
    const xs = MON.map((m, i) => `<text x="${X(i)}" y="${H - 8}" text-anchor="middle">2026-0${i + 1}</text>`).join('');
    const cols = ['--c1', '--c2', '--c3'];
    const ser = Object.entries(LONG).map(([k, v], n) => `<g style="stroke: var(${cols[n]}); fill: var(${cols[n]})"><polyline points="${v.map((y, i) => `${X(i)},${Y(y)}`).join(' ')}" fill="none" stroke-width="2.2"/>${v.map((y, i) => `<circle cx="${X(i)}" cy="${Y(y)}" r="3.5" stroke="none"/>`).join('')}<text x="${X(2) + 10}" y="${Y(v[2]) + 4}" stroke="none">${k}</text></g>`).join('');
    return `<div class="mt-ch"><p class="mt-t">В марте органика обогнала рекламу</p><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Выручка по каналам: органика 6 600, 10 890, 16 910 ₽; рассылка 0, 5 570, 6 400 ₽; реклама 11 090, 13 280, 8 690 ₽ в январе, феврале и марте">${grid}${xs}${ser}</svg><p class="mt-s">Та же картинка, что строит seaborn: по линии на канал, ось Y — revenue, ₽. Перерисовано по выводу melt.</p></div>`;
  })();

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-2-4',
    short: 'DA-02',
    title: 'Группировки, сводные таблицы, соединения',
    where: 'блок «Дата аналитика», тема 02 «Pandas и подготовка данных», страница 2.4',
    aiData: 'учебная выгрузка заказов интернет-магазина за январь–март 2026 (32 заказа, 25 оплаченных, страны BY, RU, KZ, UZ, каналы органика, реклама, рассылка), справочник стран countries.csv без UZ, но с AM, и таблица менеджеров managers.csv по стране и каналу',
    scene,
    widgets: { join: buildJoin },
    code: {
      cohorts: { title: "Когорты через groupby: transform ставит когорту, agg сворачивает", badge: "проверено: pandas 3.0.5", lang: "python", code: "import pandas as pd\n\norders = pd.read_csv(\"data/orders.csv\", parse_dates=[\"date\"])  # учебная выгрузка, 32 заказа\npaid = orders[orders[\"status\"] == \"paid\"].copy()                # 25 оплаченных\npaid[\"month\"] = paid[\"date\"].dt.to_period(\"M\")                  # 2026-01, 2026-02, 2026-03\n\n# transform: месяц первой оплаты клиента — в каждую строку этого клиента\npaid[\"cohort\"] = paid.groupby(\"customer_id\")[\"month\"].transform(\"min\")\n\n# agg с именованными агрегатами: одна строка на когорту\ncohorts = paid.groupby(\"cohort\").agg(\n    customers=(\"customer_id\", \"nunique\"),   # уникальные клиенты\n    orders=(\"order_id\", \"size\"),            # число заказов\n    revenue=(\"amount\", \"sum\"),              # выручка, ₽\n)\ncohorts[\"per_customer\"] = (cohorts[\"revenue\"] / cohorts[\"customers\"]).round()\nprint(cohorts)\nprint()\n\n# сколько клиентов каждой когорты платили в каждом месяце\nactive = paid.groupby([\"cohort\", \"month\"])[\"customer_id\"].nunique().unstack()\nprint(active)", out: "         customers  orders  revenue  per_customer\ncohort                                           \n2026-01          6      12    38370        6395.0\n2026-02          5       7    24680        4936.0\n2026-03          4       6    16380        4095.0\n\nmonth    2026-01  2026-02  2026-03\ncohort                            \n2026-01      6.0      3.0      3.0\n2026-02      NaN      5.0      1.0\n2026-03      NaN      NaN      4.0", note: "Январская когорта — 6 клиентов и почти половина выручки. В нижней таблице NaN под диагональю: клиент не может платить раньше месяца своей первой оплаты." },
      pivot: { title: "pivot_table месяц × канал с итогами, а pivot падает на повторах", badge: "проверено: pandas 3.0.5", lang: "python", code: "by_month = paid.pivot_table(\n    index=\"month\", columns=\"channel\", values=\"amount\",\n    aggfunc=\"sum\",          # по умолчанию было бы среднее\n    fill_value=0,           # пустую ячейку — нулём, а не NaN\n    margins=True, margins_name=\"Итого\",\n)\nprint(by_month)\nprint()\n\ntry:\n    paid.pivot(index=\"month\", columns=\"channel\", values=\"amount\")\nexcept ValueError as e:\n    print(\"pivot:\", e)", out: "channel  органика  рассылка  реклама  Итого\nmonth                                      \n2026-01      6600         0    11090  17690\n2026-02     10890      5570    13280  29740\n2026-03     16910      6400     8690  32000\nИтого       34400     11970    33060  79430\n\npivot: Index contains duplicate entries, cannot reshape", note: "Правый нижний угол — 79 430 ₽, как в сцене. Без fill_value ячейка «январь × рассылка» была бы NaN, а столбец рассылки — float." },
      merge: { title: "merge с индикатором и validate ловит дубль, который принёс concat", badge: "проверено: pandas 3.0.5", lang: "python", code: "countries = pd.read_csv(\"data/countries.csv\")   # справочник: country, name, currency\n\nfull = paid.merge(countries, on=\"country\", how=\"left\",\n                  indicator=True, validate=\"many_to_one\")\nprint(len(paid), \"->\", len(full))\nprint(full[\"_merge\"].value_counts())\nlost = full[full[\"_merge\"] == \"left_only\"]\nprint(\"без пары:\", lost[\"order_id\"].tolist(), \"страна:\", lost[\"country\"].unique().tolist())\nprint()\n\n# справочник дополнили новой выгрузкой, и Россия попала в него дважды\nextra = pd.DataFrame({\"country\": [\"UZ\", \"RU\"], \"name\": [\"Узбекистан\", \"Россия\"],\n                      \"currency\": [\"UZS\", \"RUB\"]})\ncountries2 = pd.concat([countries, extra], ignore_index=True)\nprint(\"строк без проверки:\", len(paid.merge(countries2, on=\"country\", how=\"left\")))\ntry:\n    paid.merge(countries2, on=\"country\", how=\"left\", validate=\"many_to_one\")\nexcept pd.errors.MergeError as e:\n    print(\"MergeError:\", e)\n\ncountries2 = countries2.drop_duplicates(\"country\", keep=\"last\")\nfixed = paid.merge(countries2, on=\"country\", how=\"left\", validate=\"many_to_one\")\nprint(\"после дедупликации:\", len(fixed), \"строк, NaN в name:\", fixed[\"name\"].isna().sum())", out: "25 -> 25\n_merge\nboth          20\nleft_only      5\nright_only     0\nName: count, dtype: int64\nбез пары: [1002, 1014, 1015, 1018, 1024] страна: ['UZ']\n\nстрок без проверки: 33\nMergeError: Merge keys are not unique in right dataset; not a many-to-one merge\n\nDuplicates in right:\n country\n     RU ...\nпосле дедупликации: 25 строк, NaN в name: 0", note: "Пять заказов из Узбекистана получили NaN: его нет в справочнике. MergeError печатает и сами дубли — здесь RU." },
      melt: { title: "melt: из широкой сводной — длинная таблица для графика", badge: "проверено: pandas 3.0.5, seaborn 0.13.2", lang: "python", code: "wide = paid.pivot_table(index=\"month\", columns=\"channel\",\n                        values=\"amount\", aggfunc=\"sum\", fill_value=0)\nlong = wide.reset_index().melt(id_vars=\"month\", var_name=\"channel\",\n                               value_name=\"revenue\")\nprint(wide.shape, \"->\", long.shape)\nprint(long)\n\nimport seaborn as sns                      # seaborn ждёт длинный формат\nlong[\"month\"] = long[\"month\"].astype(str)\nax = sns.lineplot(data=long, x=\"month\", y=\"revenue\", hue=\"channel\", marker=\"o\")\nax.figure.savefig(\"revenue_by_channel.png\", dpi=120)", out: "(3, 3) -> (9, 3)\n     month   channel  revenue\n0  2026-01  органика     6600\n1  2026-02  органика    10890\n2  2026-03  органика    16910\n3  2026-01  рассылка        0\n4  2026-02  рассылка     5570\n5  2026-03  рассылка     6400\n6  2026-01   реклама    11090\n7  2026-02   реклама    13280\n8  2026-03   реклама     8690", note: chart }
    },
    questions: {
    q1: { sec: 'join', title: 'Сначала предскажите', q: 'В orders шесть заказов, три из них — RU. В managers код RU встречается дважды, а UZ нет совсем. Сколько строк вернёт orders.merge(managers, on="country")?', opts: [['6 — столько же, сколько заказов'], ['5 — минус заказ из Узбекистана'], ['8 — каждый заказ RU встретится дважды, а UZ выпадет', 1], ['11 — все строки обеих таблиц']],
      why: 'По умолчанию how="inner": остаются только ключи, которые есть с обеих сторон. BY и KZ дают по одной строке, RU — 3 × 2 = 6, у UZ пары нет, и он выпадает: всего 8. Строк столько же, сколько заказов, было бы только при уникальном ключе справа. Проверьте в интерактиве ниже.' },
    q2: { sec: 'idea', q: 'В сцене сводную по странам соединили со справочником через how="left". Что стало со строкой UZ, которой нет в справочнике?', opts: [['Строка исчезла: её не с чем сцепить'], ['Строка осталась, в name и currency — NaN', 1], ['UZ получила название соседней строки справочника'], ['merge остановился с ошибкой MergeError']],
      why: 'left сохраняет все строки левой таблицы. Для UZ пары нет, поэтому столбцы справочника заполняются пропуском NaN, а _merge показывает left_only. Строка исчезла бы при how="inner". Соседние строки не подставляются: пару ищут по значению ключа. MergeError бросает только validate, и не из-за отсутствия пары, а из-за дублей.' },
    q3: { sec: 'idea', q: 'К каждому заказу нужно дописать долю его суммы в выручке страны. Что подходит?', opts: [['Разделить amount на paid.groupby("country")["amount"].agg("sum")'], ['Разделить amount на paid.groupby("country")["amount"].transform("sum")', 1], ['paid.pivot_table(index="country", values="amount")'], ['paid.groupby("country").size()']],
      why: 'transform возвращает сумму страны в каждой строке, длина результата равна длине таблицы, и деление идёт строка к строке. agg отдаёт четыре строки с индексом-страной: при делении индексы не совпадут, и получатся NaN. pivot_table по умолчанию считает среднее и тоже даёт строку на страну, а size — число заказов, а не выручку.' },
    q4: { sec: 'code', q: 'После paid.merge(countries2, on="country", how="left") строк стало 33 вместо 25, хотя заказов не прибавилось. В чём причина?', opts: [['how="left" всегда добавляет строки справочника'], ['В countries2 код RU встречается дважды, и каждый из восьми заказов RU соединился с обеими строками', 1], ['Строки с NaN в name посчитаны дважды'], ['merge дописал строки итогов']],
      why: 'Ключ RU справа повторяется: восемь заказов RU × две строки справочника дают 16 строк вместо 8, отсюда +8. left не добавляет строк, если ключ справа уникален. Пропуски строк не множат, а итогов merge не считает — это margins у pivot_table. validate="many_to_one" поймал бы дубль сразу.' },
    q5: { sec: 'shape', q: 'Чем pivot_table отличается от pivot?', opts: [['pivot_table работает только с числами, pivot — с любыми типами'], ['pivot_table сворачивает повторы функцией aggfunc, а pivot только переставляет значения и падает, если на ячейку приходится больше одной строки', 1], ['pivot делает длинную таблицу, pivot_table — широкую'], ['Ничем: pivot — короткое имя pivot_table']],
      why: 'Обе функции делают широкую таблицу. pivot — чистая перестановка: каждой паре «строка, столбец» должно соответствовать одно значение, иначе ValueError: Index contains duplicate entries. pivot_table сначала группирует и сворачивает повторы aggfunc (по умолчанию средним), поэтому на заказах работает. Типы тут ни при чём, а длинную таблицу делает melt.' },
    q6: { sec: 'code', q: 'Что окажется в столбце cohort после этой строки?', code: 'paid["cohort"] = paid.groupby("customer_id")["month"].transform("min")', lang: 'python', opts: [['Одна строка на клиента с месяцем его первой оплаты'], ['В каждой строке — месяц первой оплаты клиента, сделавшего этот заказ', 1], ['Минимальная сумма заказа клиента'], ['Номер группы клиента от 0 до 14']],
      why: 'transform считает min по month внутри каждого клиента и возвращает результат той же длины, что paid, выровненный по её индексу: у всех заказов клиента одна и та же когорта. Одна строка на клиента получилась бы с agg. Сумма тут ни при чём — min берётся по month, а номера групп даёт ngroup.' },
    q7: { sec: 'nuances', q: 'В заказах и в справочнике есть строки, где country — NaN. Что сделает merge(on="country")?', opts: [['Отбросит такие строки, как SQL'], ['Соединит пустой ключ слева с пустым ключом справа', 1], ['Упадёт с MergeError'], ['Заменит NaN на пустую строку и соединит']],
      why: 'pandas считает пустые ключи равными друг другу, и строки с NaN находят пару. В SQL NULL не равен NULL, поэтому там такие строки пару не находят, и документация pandas предупреждает об этом отличии. MergeError бросает только validate, а NaN сам по себе ни на что не заменяется. Пустые ключи находят и обрабатывают до соединения.' }
    },
    glossary: {
      segment: { t: 'Сегмент', en: 'segment', d: 'Часть данных, выделенная по значению признака: страна, месяц, канал привлечения.' },
      key: { t: 'Ключ', en: 'key', d: 'Столбец или набор столбцов, по значениям которых строки группируют или ищут им пару в другой таблице.' },
      groupby: { t: 'Группировка', en: 'groupby', d: 'Разбиение строк на группы по значению ключа и расчёт метрики в каждой группе.' },
      pivot: { t: 'Сводная таблица', en: 'pivot table', d: 'Таблица, где значения одного ключа стоят в строках, другого — в столбцах, а в ячейках — агрегат.' },
      lookup: { t: 'Справочник', en: 'lookup table', d: 'Таблица с описанием объектов по коду: код страны → название и валюта. Каждый код в ней должен встречаться один раз.' },
      merge: { t: 'Соединение', en: 'merge, join', d: 'Сборка таблицы из двух: строки ставятся рядом, если у них совпал ключ.' },
      nan: { t: 'NaN', en: 'not a number', d: 'Пропуск в pandas. После соединения стоит в столбцах, для которых у строки не нашлось пары.' },
      sac: { t: 'split-apply-combine', en: 'split-apply-combine', d: 'Схема «разделить, применить, собрать»: разбить данные на группы, посчитать в каждой и сложить ответы в одну таблицу.' },
      agg: { t: 'Агрегирующая функция', en: 'aggregation', d: 'Функция, которая сворачивает много значений в одно: sum, mean, size, nunique.' },
      index: { t: 'Индекс', en: 'index', d: 'Подписи строк таблицы pandas. После groupby в индекс уходят ключи групп.' },
      namedagg: { t: 'Именованный агрегат', en: 'named aggregation', d: 'Запись в agg вида имя=("столбец", "функция"): задаёт и расчёт, и название столбца результата.' },
      transform: { t: 'transform', en: 'transform', d: 'Метод groupby: считает метрику группы и возвращает её в каждую строку группы.' },
      cohort: { t: 'Когорта', en: 'cohort', d: 'Клиенты, которые впервые купили в один и тот же период, например в одном месяце.' },
      long: { t: 'Длинный формат', en: 'long format', d: 'Таблица, где строка — одно значение с подписями: «месяц, канал, выручка».' },
      wide: { t: 'Широкий формат', en: 'wide format', d: 'Таблица, где значения одной переменной разнесены по столбцам: каналы — столбцы, месяцы — строки.' },
      tidy: { t: 'Опрятные данные', en: 'tidy data', d: 'Форма таблицы по Уикему: переменная — столбец, наблюдение — строка, тип наблюдений — отдельная таблица.' },
      melt: { t: 'melt', en: 'melt', d: 'Метод, который превращает широкую таблицу в длинную: столбцы становятся парами «название, значение».' },
      jointype: { t: 'Тип соединения', en: 'join type, how', d: 'Какие строки остаются после merge: inner — с парой, left и right — все строки одной стороны, outer — обеих.' },
      cardinality: { t: 'Кардинальность ключа', en: 'cardinality', d: 'Сколько раз значение ключа встречается с каждой стороны соединения: один к одному, один ко многим, многие ко многим.' },
      indicator: { t: 'Индикатор', en: 'indicator, _merge', d: 'Столбец _merge, который merge добавляет при indicator=True: both, left_only или right_only.' },
      suffix: { t: 'Суффиксы', en: 'suffixes', d: 'Окончания _x и _y, которые merge добавляет одноимённым неключевым столбцам двух таблиц.' },
      validate: { t: 'validate', en: 'validate', d: 'Параметр merge: проверяет кардинальность ключа и бросает MergeError, если она не та, что обещана.' },
      concat: { t: 'concat', en: 'concatenate', d: 'Функция, которая ставит таблицы друг под другом или рядом, выравнивая столбцы по названиям. Пар по ключу не ищет.' },
      categorical: { t: 'Категориальный тип', en: 'category', d: 'Тип столбца с заранее заданным набором значений и их порядком.' },
      margins: { t: 'Итоги', en: 'margins', d: 'Строка и столбец итогов, которые pivot_table добавляет при margins=True.' }
    },
    materials: [
      ['da-2-4-groupby-pivot-merge.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/orders.csv', 'Учебная выгрузка: 32 заказа за январь–март 2026'],
      ['data/countries.csv', 'Учебный справочник стран: BY, RU, KZ, AM'],
      ['data/managers.csv', 'Учебная таблица менеджеров по стране и каналу из интерактива'],
      ['data/gen.py', 'Генератор учебных данных, seed 186'],
      ['report.ipynb', 'Четыре блока кода: когорты, сводная, соединение, melt']
    ],
    prompts: [
      ['Тренажёр по соединениям', 'Дай мне по источнику две маленькие таблицы и тип соединения. Я предскажу число строк и где будут NaN, а ты проверишь и объяснишь через кардинальность ключа. Пять задач, по одной за раз.'],
      ['agg или transform', 'Задай пять задач на метрики по сегментам для учебной выгрузки заказов из источника. Для каждой я выберу agg, transform или pivot_table, а ты объяснишь, прав ли я.'],
      ['Проверка моего merge', 'Я вставлю свой вызов merge и опишу таблицы. Найди, где строки могут потеряться или размножиться, и наводящими вопросами подведи меня к how, ключу, indicator и validate. Не переписывай код за меня.']
    ]
  };
})();
