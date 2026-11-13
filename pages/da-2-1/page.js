/* Страница 2.1 · DataFrame изнутри: индекс, типы, выборка */
(() => {
  /* ===================== Данные: восемь учебных заказов ===================== */
  // df = orders.head(8).sort_values("amount", ascending=False) — та же таблица в сцене, интерактиве и коде
  const COLS = ['order_id', 'date', 'brand', 'country', 'channel', 'amount', 'status'];
  const DT = { order_id: 'int64', date: 'datetime64[us]', brand: 'str', country: 'str', channel: 'str', amount: 'int64', status: 'str' };
  const LAB = [0, 6, 5, 3, 4, 7, 2, 1];
  const ROWS = [
    [10001, '2026-02-07', 'Кедр', 'RU', 'реклама', 3430, 'paid'],
    [10007, '2026-03-02', 'Луч', 'UZ', 'реклама', 3000, 'paid'],
    [10006, '2026-02-24', 'Кедр', 'BY', 'реклама', 2640, 'paid'],
    [10004, '2026-01-26', 'Бриз', 'KZ', 'органика', 2490, 'paid'],
    [10005, '2026-01-11', 'Сова', 'UZ', 'рассылка', 1300, 'cancelled'],
    [10008, '2026-03-11', 'Кедр', 'UZ', 'органика', 1240, 'paid'],
    [10003, '2026-03-28', 'Кедр', 'RU', 'реклама', 910, 'paid'],
    [10002, '2026-03-20', 'Луч', 'UZ', 'рассылка', 400, 'paid']
  ];
  const N = ROWS.length, NC = COLS.length;

  /* ===================== Сцена: таблица распадается на столбцы ===================== */
  const SCOLS = ['date', 'brand', 'amount'];                    // в сцене три столбца из семи
  const KEDR = ROWS.map(r => r[2] === 'Кедр');                    // mask = df["brand"] == "Кедр"
  const MASK_ROWS = [0, 2, 5, 6];
  // шаг → что показать; sel: { rows, cols ('all' | список), kind }
  const SC = [
    { lane: 'df = orders.head(8).sort_values("amount", ascending=False)', rows: '8', kind: 'DataFrame', map: '—', idxOn: 1, call: [[-1, 'слева — индекс, а не номера строк']] },
    { lane: 'df.index  →  [0, 6, 5, 3, 4, 7, 2, 1]', rows: '8', kind: 'DataFrame', map: '2 · 6', idxOn: 1, mark: [6], call: [[6, 'метка 2 стоит на позиции 6']] },
    { lane: '{"date": Series, "brand": Series, "amount": Series}', lb: 'внутри', rows: '8', kind: 'DataFrame', map: '—', idxOn: 1, call: [[-1, 'один индекс на все столбцы']] },
    { lane: 'df.dtypes', rows: '8', kind: 'DataFrame', map: '—', call: [[-1, 'int64: 8 байт на каждое число', 'amount']] },
    { lane: 'df["amount"]', rows: '8', kind: 'Series', map: '—', sel: { rows: [0, 1, 2, 3, 4, 5, 6, 7], cols: ['amount'], kind: 'col' }, dimOther: 1, call: [[-1, 'Series: name amount, dtype int64', 'amount']] },
    { lane: 'df.loc[2]', rows: '1', kind: 'Series', map: '2 · 6', sel: { rows: [6], cols: 'all', kind: 'loc' }, call: [[6, 'метка 2 → позиция 6', 'loc']] },
    { lane: 'df.loc[[2, 5], ["brand", "amount"]]', rows: '2', kind: 'DataFrame', map: '—', sel: { rows: [6, 2], cols: ['brand', 'amount'], kind: 'loc' }, call: [[2, 'метка 5 → позиция 2', 'loc']] },
    { lane: 'df.iloc[2]', rows: '1', kind: 'Series', map: '5 · 2', sel: { rows: [2], cols: 'all', kind: 'iloc' }, call: [[2, 'позиция 2 → метка 5', 'iloc']] },
    { lane: 'df.iloc[0:3]', rows: '3', kind: 'DataFrame', map: '—', sel: { rows: [0, 1, 2], cols: 'all', kind: 'iloc' }, call: [[3, 'позиция 3 уже не входит', 'bad']] },
    { lane: 'mask = df["brand"] == "Кедр"', rows: '8', kind: 'bool', map: '—', mask: 1, call: [[-1, 'bool, тот же индекс', 'mask']] },
    { lane: 'df[mask]', rows: '4 из 8', kind: 'DataFrame', map: '—', mask: 1, dim: 1, sel: { rows: MASK_ROWS, cols: 'all', kind: 'mask' }, call: [[1, 'False: строка гаснет', 'bad']] },
    { lane: 'df.loc[2]    df.iloc[2]    df[mask]', rows: '8', kind: 'DataFrame', map: '—', mask: 1, final: 1, call: [[6, 'loc[2] — метка', 'loc'], [2, 'iloc[2] — позиция', 'iloc'], [5, 'маска — условие', 'mask']] }
  ];

  const scene = {
    parts: [
      { n: '01', name: 'Индекс', s: [0, 1] },
      { n: '02', name: 'Столбцы', s: [2, 3, 4] },
      { n: '03', name: 'loc', s: [5, 6] },
      { n: '04', name: 'iloc', s: [7, 8] },
      { n: '05', name: 'Маска', s: [9, 10] },
      { n: '06', name: 'Итог', s: [11] }
    ],
    steps: [
      { title: 'Восемь заказов после сортировки', dur: 3400, body: '<p>Первые восемь заказов учебной выгрузки отсортированы по&nbsp;сумме, от&nbsp;большей к&nbsp;меньшей. В&nbsp;сцене три столбца из&nbsp;семи: дата, бренд и&nbsp;сумма.</p><p>Слева pandas печатает <b>индекс</b>: 0, 6, 5, 3… Это не&nbsp;номера строк, а&nbsp;метки, которые уехали вместе со&nbsp;строками при сортировке.</p>' },
      { title: 'Метка и позиция', dur: 3600, body: '<p>У&nbsp;каждой строки два адреса. <b>Позиция</b> — порядковый номер сверху вниз, с&nbsp;нуля, и&nbsp;она меняется при любой сортировке. <b>Метка</b> — значение индекса, она едет вместе со&nbsp;строкой.</p><p>Строка с&nbsp;меткой 2 стоит на&nbsp;позиции 6, седьмой сверху.</p>' },
      { title: 'Таблица распадается на столбцы', dur: 3600, body: '<p>Внутри DataFrame не&nbsp;сетка ячеек, а&nbsp;набор столбцов. Каждый столбец — отдельный массив, и&nbsp;все они подписаны одним общим индексом.</p><p>Поэтому DataFrame ведёт себя как словарь: ключ — имя столбца, значение — столбец.</p>' },
      { title: 'Один столбец — один тип', dur: 3800, body: '<p>У&nbsp;каждого столбца свой тип данных, <b>dtype</b>: дата — <b>datetime64[us]</b>, бренд — <b>str</b>, сумма — <b>int64</b>.</p><p>Все значения столбца одного размера и&nbsp;лежат подряд, поэтому операция над столбцом идёт одним проходом, без цикла Python.</p>' },
      { title: 'Столбец — это Series', dur: 3400, body: '<p><b>df["amount"]</b> достаёт один столбец. Это объект Series: значения, тот&nbsp;же индекс и&nbsp;имя amount.</p><p>Series — массив с&nbsp;метками: к&nbsp;значению можно обратиться и&nbsp;по&nbsp;метке, и&nbsp;по&nbsp;позиции.</p>' },
      { title: 'loc ищет метку', dur: 3600, body: '<p><b>df.loc[2]</b> ищет строку, у&nbsp;которой метка равна 2, где&nbsp;бы она ни&nbsp;стояла. Сейчас это позиция 6.</p><p>Результат — Series: значения одной строки, подписанные именами столбцов.</p>' },
      { title: 'Метки строк, имена столбцов', dur: 3600, body: '<p>В&nbsp;loc через запятую пишут две части: какие строки и&nbsp;какие столбцы, обе по&nbsp;именам. Списки дают таблицу 2&nbsp;×&nbsp;2.</p><p>Строки результата идут в&nbsp;порядке списка: сначала метка 2, потом метка 5.</p>' },
      { title: 'iloc считает позиции', dur: 3600, body: '<p><b>df.iloc[2]</b> на&nbsp;метки не&nbsp;смотрит: отсчитывает позиции 0, 1, 2 и&nbsp;берёт третью строку сверху. Её&nbsp;метка — 5.</p><p>Те&nbsp;же скобки, то&nbsp;же число 2 — и&nbsp;другая строка.</p>' },
      { title: 'Срез iloc: конец не входит', dur: 3400, body: '<p>Срез iloc устроен как срез списка: начало входит, конец нет. <b>df.iloc[0:3]</b> — позиции 0, 1 и&nbsp;2.</p><p>Срез loc по&nbsp;меткам, наоборот, включает обе границы.</p>' },
      { title: 'Условие — столбец True и False', dur: 3600, body: '<p>Сравнение столбца со&nbsp;значением проверяет каждое значение и&nbsp;даёт новый столбец из&nbsp;True и&nbsp;False с&nbsp;тем&nbsp;же индексом. Это <b>булева маска</b>.</p><p>Цикла в&nbsp;коде нет: сравнение идёт по&nbsp;всему массиву сразу.</p>' },
      { title: 'Маска гасит строки', dur: 3600, body: '<p><b>df[mask]</b> оставляет строки, где в&nbsp;маске True, и&nbsp;гасит остальные. Из&nbsp;восьми заказов осталось четыре заказа «Кедра».</p><p>Маска сопоставляется со&nbsp;строками по&nbsp;меткам индекса. То&nbsp;же самое пишут как <b>df.loc[mask]</b>.</p>' },
      { title: 'Три способа указать строки', dur: 4400, next: 'Читать страницу', body: '<p>loc — по&nbsp;меткам, iloc — по&nbsp;позициям, маска — по&nbsp;условию. После сортировки или фильтра метки и&nbsp;позиции расходятся, и&nbsp;одна и&nbsp;та&nbsp;же двойка даёт разные строки.</p><p>Дальше — как это устроено подробно и&nbsp;как не&nbsp;путаться.</p>' }
    ],
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'kind', label: 'Тип' }, { id: 'map', label: 'Метка/поз.' }],
    legend: '<span><i style="background:#36b8a6"></i>loc — метка</span><span><i style="background:#f0a247"></i>iloc — позиция</span><span><i style="background:#a48af0"></i>маска</span>',
    info: 'DATAFRAME',
    aiNote: 'В анимации таблица df — первые восемь учебных заказов, отсортированные по сумме по убыванию: индекс сверху вниз 0, 6, 5, 3, 4, 7, 2, 1, показаны столбцы date, brand, amount. Таблица распадается на столбцы с общим индексом (dtype: datetime64[us], str, int64), df.loc[2] подсвечивает строку с меткой 2 на позиции 6, df.iloc[2] — строку на позиции 2 с меткой 5, df.iloc[0:3] — позиции 0–2, маска df["brand"] == "Кедр" оставляет четыре строки с метками 0, 5, 7, 2.',
    mount(root, api) {
      const { esc } = api;
      const head = (name, dt) => `<div class="dfs-h"><b>${esc(name)}</b><i>${esc(dt || '')}</i></div>`;
      const col = (key, name, dt, vals) => `<div class="dfs-col c-${key}" data-c="${key}">${head(name, dt)}${vals.map((v, r) => `<div class="dfs-c" data-r="${r}">${esc(v)}</div>`).join('')}</div>`;
      const vals = c => ROWS.map(r => String(r[COLS.indexOf(c)]));
      root.innerHTML = `<div class="dfs" id="dfs">
<div class="dfs-lane"><span class="lb" id="dfs-lb">код</span><code id="dfs-code"></code></div>
<div class="dfs-body"><div class="dfs-tbl">
${col('pos', 'поз.', '', ROWS.map((_, r) => String(r)))}${col('idx', 'метка', 'index', LAB.map(String))}
<div class="dfs-data">${SCOLS.map(c => col(c, c, DT[c], vals(c))).join('')}${col('mask', 'mask', 'bool', KEDR.map(b => (b ? 'True' : 'False')))}</div>
</div><div class="dfs-rail" id="dfs-rail"></div></div></div>`;
      const box = root.querySelector('#dfs');
      const cells = {};
      root.querySelectorAll('.dfs-col').forEach(c => { cells[c.dataset.c] = [...c.querySelectorAll('.dfs-c')]; });
      const heads = {};
      root.querySelectorAll('.dfs-col').forEach(c => { heads[c.dataset.c] = c.querySelector('.dfs-h'); });
      let sig = '';
      return {
        render(k, p) {
          const S = SC[k], late = p >= 0.5;
          const st = {
            split: k > 2 || (k === 2 && p >= 0.25),
            pos: k > 1 || (k === 1 && p >= 0.2),
            dt: k > 3 || (k === 3 && p >= 0.2),
            mask: !!S.mask && (k > 9 || p >= 0.3),
            dim: !!S.dim && p >= 0.3,
            sel: S.sel && (p >= 0.25 || k === 10 || k === 4) ? S.sel : null,
            call: late ? S.call : null
          };
          api.hud('rows', st.sel || k < 4 || k === 9 || k === 11 ? S.rows : '8');
          api.hud('kind', S.kind);
          api.hud('map', S.map);
          const key = JSON.stringify([k, st.split, st.pos, st.dt, st.mask, st.dim, !!st.sel, !!st.call]);
          if (key === sig) return; sig = key;
          box.className = `dfs k${k}${st.split ? ' split' : ''}${st.pos ? ' pos' : ''}${st.dt ? ' dt' : ''}${st.mask ? ' mask' : ''}`;
          root.querySelector('#dfs-code').innerHTML = api.hl(S.lane);
          root.querySelector('#dfs-lb').textContent = S.lb || 'код';
          const selCols = st.sel ? (st.sel.cols === 'all' ? SCOLS : st.sel.cols) : [];
          Object.keys(cells).forEach(c => {
            heads[c].className = `dfs-h${selCols.includes(c) ? ' on s-' + st.sel.kind : ''}${(S.call || []).some(x => x[0] === -1 && x[2] === c) && st.call ? ' hot' : ''}`;
            cells[c].forEach((el, r) => {
              let cl = 'dfs-c';
              const inSel = st.sel && st.sel.rows.includes(r);
              if (inSel && (selCols.includes(c) || ((c === 'idx' || c === 'pos') && st.sel.kind !== 'col'))) cl += ' on s-' + st.sel.kind;
              if (st.sel && st.sel.kind === 'col' && c === 'idx') cl += ' on s-col';
              if (S.dimOther && st.sel && !selCols.includes(c) && c !== 'idx' && c !== 'pos') cl += ' dim';
              if (st.dim && !KEDR[r]) cl += ' off';
              if (c === 'mask' && st.mask) cl += KEDR[r] ? ' t' : ' f';
              if (c === 'idx' && S.idxOn && late && (k === 0 || k === 2)) cl += ' glow';
              if (S.mark && S.mark.includes(r) && late && (c === 'idx' || c === 'pos')) cl += ' on s-loc';
              if (S.final) {
                if (MASK_ROWS.includes(r) && c !== 'pos' && c !== 'idx') cl += ' tint';
                if (r === 6 && c === 'idx') cl += ' ring-loc';
                if (r === 2 && c === 'pos') cl += ' ring-iloc';
              }
              el.className = cl;
            });
          });
          root.querySelector('#dfs-rail').innerHTML = (st.call || []).map(([r, t, kind]) => `<span class="dfs-call${kind ? ' k-' + kind : ''}" style="top:${r < 0 ? 'calc(var(--hh) / 2 + 1px)' : `calc(var(--hh) + ${r + 0.5} * var(--rh) + 2px)`}">${esc(t)}</span>`).join('');
        }
      };
    }
  };

  /* ===================== Разбор выражений выборки ===================== */
  // Поддержан ограниченный набор форм; результаты сверены с pandas 3.0.5 на той же таблице.
  class PyErr { constructor(type, msg, why) { this.type = type; this.msg = msg; this.why = why || ''; } }
  class Unsup { constructor(msg) { this.msg = msg; } }
  const pyStr = s => { const q = s.includes("'") && !s.includes('"') ? '"' : "'"; return q + s + q; };
  const rep = v => v.t === 'str' ? pyStr(v.v) : v.raw;
  const repList = a => `[${a.map(rep).join(', ')}]`;
  const keyErr = (v, why) => new PyErr('KeyError', v.t === 'str' ? pyStr(v.v) : v.raw, why);
  const keyErrMsg = (m, why) => new PyErr('KeyError', pyStr(m), why);
  const NONINT = 'Cannot index by location index with a non-integer key';
  const SUPPORTED = 'Разбор понимает df[…], df.loc[…], df.iloc[…], df.столбец, числа, строки, списки, срезы a:b:c, маски из сравнений с &, |, ~ и .isin([…]), а также цепочки вроде df.loc[2]["brand"].';

  function lex(src) {
    const out = [];
    const re = /\s*(?:(\d+\.\d*|\.\d+|\d+(?:_\d+)*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([A-Za-z_][A-Za-z0-9_]*)|(==|!=|>=|<=|[[\](),:.&|~<>\-]))/y;
    let i = 0;
    while (i < src.length) {
      if (/^\s*$/.test(src.slice(i))) break;
      re.lastIndex = i;
      const m = re.exec(src);
      if (!m) {
        const ch = src.slice(i).trim()[0];
        if ('«»“”„'.includes(ch)) throw new Unsup('Кавычки здесь нужны прямые: "…" или \'…\', а не «ёлочки» и не „лапки“ — Python других не понимает.');
        if (ch === '=') throw new Unsup('Одиночное = — это присваивание. Здесь только выборка; для сравнения пишут ==.');
        throw new Unsup(`Символ «${ch}» разбор не понимает. ${SUPPORTED}`);
      }
      i = re.lastIndex;
      if (m[1] !== undefined) { const raw = m[1].replace(/_/g, ''); out.push({ t: 'num', v: Number(raw), raw, int: !raw.includes('.') }); }
      else if (m[2] !== undefined) out.push({ t: 'str', v: m[2].slice(1, -1).replace(/\\(.)/g, '$1') });
      else if (m[3] !== undefined) {
        if (['and', 'or', 'not'].includes(m[3])) throw new Unsup('Слова and, or, not с масками не работают: pandas ответит ValueError «The truth value of a Series is ambiguous». Пишите &, | и ~, а каждое сравнение берите в скобки.');
        out.push({ t: 'id', v: m[3] });
      }
      else out.push({ t: 'op', v: m[4] });
    }
    out.push({ t: 'end', v: '' });
    return out;
  }

  function parse(src) {
    const T = lex(src); let i = 0;
    const is = v => T[i].t === 'op' && T[i].v === v;
    const syntax = () => new Unsup('Выражение не дописано или в нём лишний символ: проверьте скобки и кавычки.');
    const expect = v => { if (!is(v)) throw syntax(); i++; };
    const CMP = ['==', '!=', '<', '>', '<=', '>='];
    function comparison() {
      const a = bitor(), ops = [];
      while (T[i].t === 'op' && CMP.includes(T[i].v)) { const op = T[i++].v; ops.push([op, bitor()]); }
      if (!ops.length) return a;
      if (ops.length > 1 && [a, ...ops.map(o => o[1])].some(x => x.k === 'and' || x.k === 'or')) throw new Unsup(PRECEDENCE);
      if (ops.length > 1) throw new Unsup('Цепочка сравнений вида a < x < b с Series не работает: Python превращает её в and, а and с Series даёт ValueError. Запишите два условия в скобках через &.');
      return { k: 'cmp', op: ops[0][0], a, b: ops[0][1] };
    }
    function bitor() { let n = bitand(); while (is('|')) { i++; n = { k: 'or', a: n, b: bitand() }; } return n; }
    function bitand() { let n = unary(); while (is('&')) { i++; n = { k: 'and', a: n, b: unary() }; } return n; }
    function unary() {
      if (is('~')) { i++; return { k: 'not', a: unary() }; }
      if (is('-')) { i++; const a = unary(); if (a.k === 'num') return { k: 'num', v: -a.v, raw: '-' + a.raw, int: a.int }; return { k: 'neg', a }; }
      return primary();
    }
    function primary() {
      let n = atom();
      for (;;) {
        if (is('.')) {
          i++; const id = T[i++]; if (id.t !== 'id') throw syntax();
          if (is('(')) {
            i++; const args = [];
            if (!is(')')) { args.push(comparison()); while (is(',')) { i++; args.push(comparison()); } }
            expect(')'); n = { k: 'call', obj: n, name: id.v, args };
          } else n = { k: 'attr', obj: n, name: id.v };
        } else if (is('[')) { i++; const parts = [part()]; while (is(',')) { i++; parts.push(part()); } expect(']'); n = { k: 'sub', obj: n, parts }; }
        else break;
      }
      return n;
    }
    function atom() {
      const t = T[i++];
      if (t.t === 'num') return { k: 'num', v: t.v, raw: t.raw, int: t.int };
      if (t.t === 'str') return { k: 'str', v: t.v };
      if (t.t === 'id') {
        if (t.v === 'df') return { k: 'df' };
        if (['True', 'False', 'None'].includes(t.v)) throw new Unsup(`${t.v} в выборке разбор не поддерживает. ${SUPPORTED}`);
        throw new Unsup(`Имени ${t.v} разбор не знает: таблица здесь называется df.`);
      }
      if (t.t === 'op' && t.v === '(') { const e = comparison(); if (is(',')) throw new Unsup('Кортежи в выборке разбор не поддерживает.'); expect(')'); return e; }
      if (t.t === 'op' && t.v === '[') {
        const items = [];
        if (!is(']')) { items.push(comparison()); while (is(',')) { i++; if (is(']')) break; items.push(comparison()); } }
        expect(']'); return { k: 'list', items };
      }
      i--; throw syntax();
    }
    function part() {
      let a = null, b = null, c = null;
      if (!is(':')) { a = comparison(); if (!is(':')) return a; }
      i++;
      if (!is(':') && !is(']') && !is(',')) b = comparison();
      if (is(':')) { i++; if (!is(']') && !is(',')) c = comparison(); }
      return { k: 'slice', a, b, c };
    }
    const tree = comparison();
    if (T[i].t !== 'end') {
      if (T[i].t === 'op' && T[i].v === '=') throw new Unsup('Здесь только выборка, присваивание не выполняется.');
      throw syntax();
    }
    return tree;
  }

  // Значения: frame {rows, cols}; col {rows, c}; row {r, cols}; scalar {r, c}; mask {rows, vals, name}
  const FRAME = { t: 'frame', rows: [...Array(N).keys()], cols: [...Array(NC).keys()] };
  const labelsOf = o => o.t === 'row' ? o.cols.map(c => COLS[c]) : o.rows.map(r => LAB[r]);
  const sameLabel = (lab, key) => key.t === 'num' ? typeof lab === 'number' && lab === key.v : key.t === 'str' && lab === key.v;
  const PRECEDENCE = 'В Python & и | выполняются раньше, чем > и ==, поэтому без скобок получилось побитовое & числа и столбца. pandas вернёт не то, что задумано, а иногда TypeError. Возьмите каждое сравнение в скобки: (df["amount"] > 1000) & (df["status"] == "paid").';

  function evaluate(src) {
    const notes = [];
    const lit = n => {
      if (n === null) return null;
      if (n.k === 'num') return { t: 'num', v: n.v, raw: n.raw, int: n.int };
      if (n.k === 'str') return { t: 'str', v: n.v };
      if (n.k === 'list') return { t: 'list', items: n.items.map(x => { const v = lit(x); if (!v || v.t === 'list') throw new Unsup('Вложенные списки разбор не поддерживает.'); return v; }) };
      return ev(n);
    };
    function ev(n) {
      switch (n.k) {
        case 'df': return FRAME;
        case 'num': case 'str': case 'list': return lit(n);
        case 'neg': throw new Unsup('Минус перед таблицей или столбцом разбор не поддерживает.');
        case 'attr': {
          const o = ev(n.obj);
          if (['loc', 'iloc'].includes(n.name) && ['frame', 'col', 'row'].includes(o.t)) return { t: 'idx', kind: n.name, of: o };
          if (o.t === 'frame' && o.cols.some(c => COLS[c] === n.name)) { notes.push(`df.${n.name} — то&nbsp;же, что df["${n.name}"]: столбец как Series. Так можно писать, если имя столбца — правильное имя Python и&nbsp;не&nbsp;совпадает с&nbsp;методом таблицы.`); return { t: 'col', rows: o.rows.slice(), c: COLS.indexOf(n.name) }; }
          if (o.t === 'row' && o.cols.some(c => COLS[c] === n.name)) return { t: 'scalar', r: o.r, c: COLS.indexOf(n.name) };
          if (['at', 'iat', 'head', 'tail', 'query', 'filter', 'sample', 'index', 'columns', 'values', 'dtypes', 'shape', 'T'].includes(n.name)) throw new Unsup(`${n.name} — настоящий атрибут pandas, но этот разбор его не выполняет. ${SUPPORTED}`);
          throw new Unsup(`Атрибута ${n.name} у этого объекта разбор не знает. Столбцы таблицы: ${COLS.join(', ')}.`);
        }
        case 'call': {
          const mark = notes.length, o = ev(n.obj);
          notes.length = mark;
          if (o.t === 'col' && n.name === 'isin') {
            if (n.args.length !== 1 || n.args[0].k !== 'list') throw new Unsup('isin ждёт один список: df["country"].isin(["BY", "KZ"]).');
            const items = lit(n.args[0]).items, c = o.c;
            if (DT[COLS[c]].startsWith('datetime')) throw new Unsup('isin по датам разбор не поддерживает.');
            const vals = o.rows.map(r => items.some(it => (typeof ROWS[r][c] === 'number' ? it.t === 'num' && it.v === ROWS[r][c] : it.t === 'str' && it.v === ROWS[r][c])));
            notes.push(`isin проверяет каждое значение столбца ${COLS[c]} на&nbsp;вхождение в&nbsp;список и&nbsp;даёт маску.`);
            return { t: 'mask', rows: o.rows.slice(), vals, name: COLS[c] };
          }
          throw new Unsup(`Метод ${n.name}() разбор не выполняет. ${SUPPORTED}`);
        }
        case 'sub': {
          const o = ev(n.obj);
          const parts = n.parts.map(p => p.k === 'slice' ? { t: 'slice', a: lit(p.a), b: lit(p.b), c: lit(p.c) } : ev(p));
          if (o.t === 'idx') return o.kind === 'loc' ? loc(o.of, parts) : iloc(o.of, parts);
          return getitem(o, parts);
        }
        case 'cmp': { const mark = notes.length, A = ev(n.a), B = ev(n.b); notes.length = mark; return compare(A, B, n.op); }
        case 'and': case 'or': {
          const a = ev(n.a), b = ev(n.b);
          if ((a.t === 'num' || b.t === 'num') && (a.t === 'mask' || b.t === 'mask' || a.t === 'col' || b.t === 'col')) throw new Unsup(PRECEDENCE);
          if (a.t !== 'mask' || b.t !== 'mask') throw new Unsup('& и | соединяют маски — результаты сравнений в скобках.');
          if (a.rows.join() !== b.rows.join()) throw new Unsup('Маски построены по разным выборкам: такое выравнивание разбор не поддерживает.');
          notes.push(n.k === 'and' ? '&amp; оставляет True там, где оба условия выполнены.' : '| оставляет True там, где выполнено хотя&nbsp;бы одно условие.');
          return { t: 'mask', rows: a.rows, vals: a.vals.map((v, j) => (n.k === 'and' ? v && b.vals[j] : v || b.vals[j])), name: a.name === b.name ? a.name : null };
        }
        case 'not': {
          const a = ev(n.a);
          if (a.t !== 'mask') throw new Unsup('~ разбор применяет только к маске в скобках: ~(df["status"] == "paid").');
          notes.push('~ переворачивает маску: True становится False и&nbsp;наоборот.');
          return { t: 'mask', rows: a.rows, vals: a.vals.map(v => !v), name: a.name };
        }
      }
      throw new Unsup(SUPPORTED);
    }
    function compare(a, b, op) {
      const flip = { '<': '>', '>': '<', '<=': '>=', '>=': '<=', '==': '==', '!=': '!=' };
      if (a.t !== 'col' && b.t === 'col') { [a, b] = [b, a]; op = flip[op]; }
      if (a.t === 'mask' || b.t === 'mask') throw new Unsup(PRECEDENCE);
      if (a.t !== 'col') throw new Unsup('Сравнение должно начинаться со столбца: df["amount"] > 2000.');
      if (b.t !== 'num' && b.t !== 'str') throw new Unsup('Столбец разбор сравнивает только с числом или строкой.');
      const c = a.c, dt = DT[COLS[c]], eq = op === '==' || op === '!=';
      const cmp = (x, y) => (op === '==' ? x === y : op === '!=' ? x !== y : op === '<' ? x < y : op === '>' ? x > y : op === '<=' ? x <= y : x >= y);
      const allBool = v => ({ t: 'mask', rows: a.rows.slice(), vals: a.rows.map(() => v), name: COLS[c] });
      const otherT = b.t === 'str' ? 'str' : b.int ? 'int' : 'float';
      const bad = () => new PyErr('TypeError', `Invalid comparison between dtype=${dt} and ${otherT}`, `Столбец ${COLS[c]} имеет тип ${dt}, и&nbsp;сравнивать его на&nbsp;больше-меньше с&nbsp;${b.t === 'str' ? 'текстом' : 'числом'} pandas отказывается.`);
      let vals;
      if (dt === 'int64') {
        if (b.t === 'str') { if (eq) { notes.push('Число никогда не&nbsp;равно строке, поэтому маска целиком ' + (op === '==' ? 'False' : 'True') + '.'); return allBool(op !== '=='); } throw bad(); }
        vals = a.rows.map(r => cmp(ROWS[r][c], b.v));
      } else if (dt === 'str') {
        if (b.t === 'num') { if (eq) { notes.push('Строка никогда не&nbsp;равна числу, поэтому маска целиком ' + (op === '==' ? 'False' : 'True') + '.'); return allBool(op !== '=='); } throw bad(); }
        if (!eq) notes.push('Строки сравниваются по&nbsp;алфавиту, точнее — по&nbsp;кодам символов.');
        vals = a.rows.map(r => cmp(ROWS[r][c], b.v));
      } else {
        const m = b.t === 'str' && /^(\d{4})-(\d{2})(?:-(\d{2}))?(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(b.v);
        if (!m) { if (eq) { notes.push('Дата не&nbsp;равна ни&nbsp;числу, ни&nbsp;строке, которая не&nbsp;похожа на&nbsp;дату.'); return allBool(op !== '=='); } throw bad(); }
        const key = `${m[1]}-${m[2]}-${m[3] || '01'} ${m[4] || '00'}:${m[5] || '00'}:${m[6] || '00'}`;
        notes.push(`Строку «${esc0(b.v)}» pandas сначала разбирает как момент времени ${key}.`);
        vals = a.rows.map(r => cmp(`${ROWS[r][c]} 00:00:00`, key));
      }
      notes.push(`Сравнение ${COLS[c]} ${op.replace('<', '&lt;').replace('>', '&gt;')} ${esc0(rep(b))} идёт по&nbsp;всему столбцу сразу и&nbsp;даёт маску: True в&nbsp;${vals.filter(Boolean).length} из&nbsp;${vals.length} строк.`);
      return { t: 'mask', rows: a.rows.slice(), vals, name: COLS[c] };
    }
    // --- ключи по меткам и позициям ---
    function findLabel(labels, key, why) {
      if (key.t !== 'num' && key.t !== 'str') throw new Unsup('Такой ключ разбор не поддерживает.');
      const hits = []; labels.forEach((l, j) => { if (sameLabel(l, key)) hits.push(j); });
      if (!hits.length) throw keyErr(key, why);
      if (hits.length > 1) throw new Unsup('Метка повторяется: выборка по повторяющимся меткам в этом разборе не поддержана.');
      return hits[0];
    }
    function byLabel(labels, key, what) {
      const why = what === 'cols' ? `Столбца с&nbsp;таким именем нет. Столбцы: ${COLS.join(', ')}.` : `Такой метки нет в&nbsp;индексе. Метки сверху вниз: ${labels.join(', ')}.`;
      if (key.t === 'num' || key.t === 'str') return { one: true, idx: [findLabel(labels, key, why)] };
      if (key.t === 'list') {
        const miss = key.items.filter(it => !labels.some(l => sameLabel(l, it)));
        if (miss.length) throw keyErrMsg(`${repList(miss)} not in index`, why);
        return { one: false, idx: key.items.map(it => findLabel(labels, it, why)) };
      }
      if (key.t === 'slice') return { one: false, idx: labelSlice(labels, key, what) };
      if (key.t === 'mask') {
        if (what === 'cols') throw new Unsup('Маску для столбцов разбор не поддерживает.');
        return { one: false, idx: alignMask(labels, key) };
      }
      throw new Unsup('В loc на месте строк ставят метку, список меток, срез меток или маску.');
    }
    function alignMask(labels, m) {
      const map = new Map(m.rows.map((r, j) => [LAB[r], m.vals[j]]));
      if (!labels.every(l => map.has(l))) throw new Unsup('Маска построена по другой выборке, и не все метки находят пару.');
      if (labels.length !== m.rows.length) notes.push('Маска длиннее таблицы: pandas выровняет её по&nbsp;меткам и&nbsp;предупредит «Boolean Series key will be reindexed to match DataFrame index».');
      return labels.map((l, j) => (map.get(l) ? j : -1)).filter(j => j >= 0);
    }
    function labelSlice(labels, s, what) {
      const step = s.c === null ? 1 : s.c;
      if (step.t && (step.t !== 'num' || !step.int)) throw new Unsup('Шаг среза должен быть целым числом.');
      const st = step.t ? step.v : 1;
      if (st === 0) throw new Unsup('Шаг среза не может быть нулём: Python ответит ValueError.');
      const n = labels.length;
      for (const b of [s.a, s.b]) if (b && b.t !== 'num' && b.t !== 'str') throw new Unsup('Границы среза — метки: числа или строки.');
      const nums = labels.every(l => typeof l === 'number');
      const inc = nums && labels.every((l, j) => j === 0 || labels[j - 1] < l);
      if (what !== 'cols' && inc && n > 1) {
        if (st !== 1) throw new Unsup('Срез с шагом по отсортированному индексу разбор не поддерживает.');
        if ((s.a && s.a.t !== 'num') || (s.b && s.b.t !== 'num')) throw new Unsup('Строковые границы среза на числовом индексе разбор не поддерживает.');
        const out = [];
        labels.forEach((l, j) => { if ((!s.a || l >= s.a.v) && (!s.b || l <= s.b.v)) out.push(j); });
        notes.push('Индекс этой выборки отсортирован, поэтому срез loc берёт все метки в&nbsp;промежутке, даже если границ в&nbsp;индексе нет.');
        return out;
      }
      if (what !== 'cols' && ((s.a && s.a.t === 'str') || (s.b && s.b.t === 'str'))) throw new Unsup('Строковые границы среза на числовом индексе разбор не поддерживает.');
      const pos = (b, side) => {
        const j = labels.findIndex(l => sameLabel(l, b));
        if (j < 0) throw keyErrMsg(`Cannot get ${side} slice bound for non-monotonic index with a missing label ${rep(b)}. Either sort the index or specify an existing label.`, 'Метки в&nbsp;этом индексе идут не&nbsp;по&nbsp;порядку, поэтому обе границы среза loc должны быть настоящими метками.');
        return j;
      };
      const a = s.a ? pos(s.a, 'left') : (st > 0 ? 0 : n - 1);
      const b = s.b ? pos(s.b, 'right') : (st > 0 ? n - 1 : 0);
      const out = [];
      if (st > 0) for (let j = a; j <= b; j += st) out.push(j); else for (let j = a; j >= b; j += st) out.push(j);
      notes.push(`Срез loc идёт в&nbsp;порядке строк от&nbsp;${s.a ? `метки ${esc0(rep(s.a))}` : 'начала'} до&nbsp;${s.b ? `метки ${esc0(rep(s.b))}` : 'конца'} и&nbsp;включает обе границы: позиции ${a}…${b}${st !== 1 ? `, шаг ${st}` : ''}.`);
      return out;
    }
    function byPos(n, key, what) {
      if (key.t === 'num') {
        if (!key.int) throw new PyErr('TypeError', NONINT, 'iloc принимает только целые позиции.');
        const j = key.v < 0 ? n + key.v : key.v;
        if (j < 0 || j >= n) throw new PyErr('IndexError', 'single positional indexer is out-of-bounds', `Позиции здесь — от&nbsp;0 до&nbsp;${n - 1}, с&nbsp;конца — от&nbsp;−1 до&nbsp;−${n}.`);
        return { one: true, idx: [j], oob: false };
      }
      if (key.t === 'str') throw new PyErr('TypeError', NONINT, 'iloc считает позиции, а&nbsp;имена и&nbsp;метки ищет loc.');
      if (key.t === 'list') {
        if (key.items.some(it => it.t !== 'num' || !it.int)) throw new Unsup('В списке для iloc должны быть только целые позиции.');
        const idx = key.items.map(it => (it.v < 0 ? n + it.v : it.v));
        if (idx.some(j => j < 0 || j >= n)) throw new PyErr('IndexError', 'positional indexers are out-of-bounds', `Позиции здесь — от&nbsp;0 до&nbsp;${n - 1}.`);
        return { one: false, idx };
      }
      if (key.t === 'slice') return { one: false, idx: posSlice(n, key) };
      if (key.t === 'mask') {
        if (what === 'cols') throw new Unsup('Маску для столбцов разбор не поддерживает.');
        notes.push('Маска в&nbsp;iloc работает с&nbsp;pandas 3.0; в&nbsp;pandas 2 та&nbsp;же запись давала NotImplementedError.');
        return { one: false, idx: null, mask: key };
      }
      throw new Unsup('В iloc ставят позицию, список позиций, срез или маску.');
    }
    function posSlice(n, s) {
      for (const b of [s.a, s.b, s.c]) if (b && (b.t !== 'num' || !b.int)) throw new Unsup('Границы и шаг среза iloc — целые числа.');
      const st = s.c ? s.c.v : 1;
      if (st === 0) throw new Unsup('Шаг среза не может быть нулём: Python ответит ValueError.');
      const A = s.a ? s.a.v : null, B = s.b ? s.b.v : null, out = [];
      if (st > 0) {
        const a = A === null ? 0 : A < 0 ? Math.max(0, n + A) : Math.min(A, n);
        const b = B === null ? n : B < 0 ? Math.max(0, n + B) : Math.min(B, n);
        for (let j = a; j < b; j += st) out.push(j);
      } else {
        const a = A === null ? n - 1 : A < 0 ? Math.max(-1, n + A) : Math.min(A, n - 1);
        const b = B === null ? -1 : B < 0 ? Math.max(-1, n + B) : Math.min(B, n - 1);
        for (let j = a; j > b; j += st) out.push(j);
      }
      if (st === 1 && s.b) notes.push(`Срез по&nbsp;позициям, как у&nbsp;списка: начало входит, конец ${esc0(s.b.raw)} — нет.`);
      return out;
    }
    const ORD = ['первую', 'вторую', 'третью', 'четвёртую', 'пятую', 'шестую', 'седьмую', 'восьмую'];
    const ORDN = ['первая', 'вторая', 'третья', 'четвёртая', 'пятая', 'шестая', 'седьмая', 'восьмая'];
    // --- loc / iloc / [] ---
    function loc(o, parts) {
      if (o.t === 'frame') {
        if (parts.length > 2) throw new Unsup('В loc у таблицы не больше двух частей: строки и столбцы.');
        const R = byLabel(o.rows.map(r => LAB[r]), parts[0], 'rows');
        const C = parts.length > 1 ? byLabel(o.cols.map(c => COLS[c]), parts[1], 'cols') : { one: false, idx: o.cols.map((_, j) => j) };
        const rows = R.idx.map(j => o.rows[j]), cols = C.idx.map(j => o.cols[j]);
        if (R.one) notes.push(`loc нашёл метку ${esc0(rep(parts[0]))} на&nbsp;позиции ${rows[0]}: это ${ORDN[rows[0]]} строка сверху${LAB[rows[0]] === rows[0] ? '; здесь метка случайно совпала с&nbsp;позицией' : ''}.`);
        else if (parts[0].t === 'list') notes.push(`Список меток: строки идут в&nbsp;порядке списка — позиции ${rows.join(', ') || 'нет'}.`);
        else if (parts[0].t === 'mask') notes.push(`Маска в&nbsp;loc оставила строки, где True: ${rows.length} из&nbsp;${o.rows.length}.`);
        return shape(R.one, C.one, rows, cols);
      }
      if (parts.length > 1) throw new Unsup('У Series одно измерение: в loc одна часть. pandas ответит «Too many indexers».');
      if (o.t === 'col') { const R = byLabel(o.rows.map(r => LAB[r]), parts[0], 'rows'); const rows = R.idx.map(j => o.rows[j]); return R.one ? { t: 'scalar', r: rows[0], c: o.c } : { t: 'col', rows, c: o.c }; }
      const C = byLabel(o.cols.map(c => COLS[c]), parts[0], 'cols'); const cols = C.idx.map(j => o.cols[j]);
      return C.one ? { t: 'scalar', r: o.r, c: cols[0] } : { t: 'row', r: o.r, cols };
    }
    function iloc(o, parts) {
      if (o.t === 'frame') {
        if (parts.length > 2) throw new Unsup('В iloc у таблицы не больше двух частей: строки и столбцы.');
        const [p0, p1] = parts, nr = o.rows.length, nc = o.cols.length;
        if (p1 && p0.t === 'num' && p0.int && p1.t === 'num' && p1.int) {   // две целые позиции: pandas проверяет столбец первым
          if (p1.v < -nc || p1.v >= nc) throw new PyErr('IndexError', `index ${p1.raw} is out of bounds for axis 0 with size ${nc}`, `Позиции столбцов — от&nbsp;0 до&nbsp;${nc - 1}.`);
          if (p0.v < -nr || p0.v >= nr) throw new PyErr('IndexError', 'index out of bounds', `Позиции строк — от&nbsp;0 до&nbsp;${nr - 1}.`);
        }
        let R = byPos(nr, p0, 'rows');
        if (R.mask) { R = { one: false, idx: alignMask(o.rows.map(r => LAB[r]), R.mask) }; notes.push(`Маска оставила ${R.idx.length} из&nbsp;${nr} строк.`); }
        const C = p1 ? byPos(nc, p1, 'cols') : { one: false, idx: o.cols.map((_, j) => j) };
        const rows = R.idx.map(j => o.rows[j]), cols = C.idx.map(j => o.cols[j]);
        if (R.one) notes.push(`iloc взял позицию ${R.idx[0]}, то&nbsp;есть ${ORD[R.idx[0]]} строку сверху; у&nbsp;неё метка ${LAB[rows[0]]}.`);
        return shape(R.one, C.one, rows, cols);
      }
      if (parts.length > 1) throw new Unsup('У Series одно измерение: в iloc одна часть. pandas ответит «Too many indexers».');
      const n = o.t === 'col' ? o.rows.length : o.cols.length;
      let R = byPos(n, parts[0], 'rows');
      if (R.mask) { if (o.t !== 'col') throw new Unsup('Маску к строке таблицы разбор не применяет.'); R = { one: false, idx: alignMask(o.rows.map(r => LAB[r]), R.mask) }; }
      if (o.t === 'col') { const rows = R.idx.map(j => o.rows[j]); return R.one ? { t: 'scalar', r: rows[0], c: o.c } : { t: 'col', rows, c: o.c }; }
      const cols = R.idx.map(j => o.cols[j]);
      return R.one ? { t: 'scalar', r: o.r, c: cols[0] } : { t: 'row', r: o.r, cols };
    }
    function getitem(o, parts) {
      if (parts.length > 1) throw new Unsup('Две части через запятую в обычных скобках pandas понимает как кортеж-ключ. Для строк и столбцов сразу нужен loc или iloc.');
      const k = parts[0];
      if (o.t === 'frame') {
        if (k.t === 'str') {
          const c = o.cols.find(c => COLS[c] === k.v);
          if (c === undefined) throw keyErr(k, `Столбца с&nbsp;таким именем нет. Имена чувствительны к&nbsp;регистру: ${COLS.join(', ')}.`);
          notes.push(`df["${esc0(k.v)}"] достаёт столбец целиком — Series с&nbsp;тем&nbsp;же индексом, что у&nbsp;таблицы.`);
          return { t: 'col', rows: o.rows.slice(), c };
        }
        if (k.t === 'num') throw keyErr(k, 'Без loc и&nbsp;iloc число в&nbsp;квадратных скобках ищется среди имён столбцов, а&nbsp;столбца с&nbsp;таким именем нет. Строку по&nbsp;метке берут через df.loc, по&nbsp;позиции — через df.iloc.');
        if (k.t === 'list') {
          if (k.items.some(it => it.t !== 'str')) throw new Unsup('Список в df[…] — это имена столбцов; числа в нём разбор не поддерживает.');
          const miss = k.items.filter(it => !o.cols.some(c => COLS[c] === it.v));
          if (miss.length) throw keyErrMsg(`${repList(miss)} not in index`, `Таких столбцов нет. Столбцы: ${COLS.join(', ')}.`);
          notes.push('Список имён в&nbsp;df[…] даёт таблицу из&nbsp;этих столбцов, даже если имя одно.');
          return { t: 'frame', rows: o.rows.slice(), cols: k.items.map(it => COLS.indexOf(it.v)) };
        }
        if (k.t === 'slice') {
          if ([k.a, k.b, k.c].some(b => b && b.t !== 'num')) throw new Unsup('Срез со строками в df[…] разбор не поддерживает.');
          const idx = posSlice(o.rows.length, k);
          notes.push('Срез чисел в&nbsp;df[…] режет строки по&nbsp;позициям, как iloc.');
          return { t: 'frame', rows: idx.map(j => o.rows[j]), cols: o.cols.slice() };
        }
        if (k.t === 'mask') {
          const idx = alignMask(o.rows.map(r => LAB[r]), k);
          notes.push(`Маска в&nbsp;df[…] оставляет строки, где True: ${idx.length} из&nbsp;${o.rows.length}.`);
          return { t: 'frame', rows: idx.map(j => o.rows[j]), cols: o.cols.slice() };
        }
        throw new Unsup('В df[…] ставят имя столбца, список имён, срез или маску.');
      }
      if (o.t === 'col') {
        if (k.t === 'num' || k.t === 'list') {
          if (k.t === 'num') notes.push('В pandas 3 целое число в&nbsp;s[…] у&nbsp;Series — всегда метка, как s.loc[…].');
          return loc(o, [k]);
        }
        if (k.t === 'str') throw keyErr(k, 'Метки этой Series — числа, строки среди них нет.');
        if (k.t === 'slice') {
          if ([k.a, k.b, k.c].some(b => b && b.t !== 'num')) throw new Unsup('Срез со строками разбор не поддерживает.');
          const idx = posSlice(o.rows.length, k); notes.push('Срез чисел в&nbsp;s[…] режет по&nbsp;позициям, как iloc.');
          return { t: 'col', rows: idx.map(j => o.rows[j]), c: o.c };
        }
        if (k.t === 'mask') { const idx = alignMask(o.rows.map(r => LAB[r]), k); return { t: 'col', rows: idx.map(j => o.rows[j]), c: o.c }; }
        throw new Unsup(SUPPORTED);
      }
      if (o.t === 'row') {
        if (k.t === 'str' || k.t === 'list') return loc(o, [k]);
        if (k.t === 'num') throw keyErr(k, 'Метки строки-Series — имена столбцов. В&nbsp;pandas 3 число в&nbsp;s[…] всегда ищется среди меток, позицию берут через .iloc.');
        if (k.t === 'slice' && [k.a, k.b, k.c].every(b => !b || b.t === 'num')) { const idx = posSlice(o.cols.length, k); return { t: 'row', r: o.r, cols: idx.map(j => o.cols[j]) }; }
        throw new Unsup(SUPPORTED);
      }
      throw new Unsup('У одного значения (скаляра) выборки нет.');
    }
    function shape(r1, c1, rows, cols) {
      if (r1 && c1) return { t: 'scalar', r: rows[0], c: cols[0] };
      if (r1) return { t: 'row', r: rows[0], cols };
      if (c1) return { t: 'col', rows, c: cols[0] };
      return { t: 'frame', rows, cols };
    }
    const esc0 = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    try {
      const v = ev(parse(src));
      if (['frame', 'col', 'row', 'scalar', 'mask'].includes(v.t)) return { v, notes };
      if (v.t === 'idx') throw new Unsup(`После .${v.kind} нужны квадратные скобки: df.${v.kind}[…].`);
      throw new Unsup('Это не выборка из таблицы: выражение должно начинаться с df.');
    } catch (e) {
      if (e instanceof PyErr) return { err: e, notes };
      if (e instanceof Unsup) return { unsup: e.msg, notes: [] };
      return { unsup: 'Выражение не удалось разобрать.', notes: [] };
    }
  }

  /* ===================== Интерактив «loc или iloc» ===================== */
  const CHIPS = ['df.loc[0:2]', 'df.iloc[0:2]', 'df[2]', 'df["amount"] > 2000', 'df[df["amount"] > 2000]', 'df.loc[df["brand"] == "Кедр", ["brand", "amount"]]', 'df.iloc[-1]'];
  const TASKS = ['Выберите вторую строку таблицы.', 'Выберите строку с меткой 2.'];
  function buildSel(box, api) {
    const { $, esc, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Одна и та же двойка — две разные строки <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="ix-reset">Сбросить</button></div></div>
<p class="hint ix-do">Введите выражение и нажмите Enter или «Выполнить» — подсветятся выбранные ячейки. Затем выполните два задания из&nbsp;блока «Задания».</p>
<div class="stage ix-stage"><div class="ix-left">
<form class="ix-form" id="ix-form" autocomplete="off"><label class="vh" for="ix-in">Выражение pandas</label><input id="ix-in" class="ix-in" type="text" spellcheck="false" autocapitalize="off" autocorrect="off" placeholder='например, df.iloc[1]'><button type="submit" class="btn small">Выполнить</button></form>
<div class="ix-chips" role="group" aria-label="Готовые выражения">${CHIPS.map(c => `<button type="button" class="ix-chip" data-x="${esc(c)}">${esc(c)}</button>`).join('')}</div>
<div class="ix-tw" tabindex="0" aria-label="Таблица df"><table class="ix-t" id="ix-t"></table></div>
</div>
<div class="narr ix-narr"><p class="cap">Что вернёт pandas</p><div class="ix-res" id="ix-res" aria-live="polite"></div><div class="narr-text ix-msg" id="ix-msg"></div><p class="cap">Задания</p><ol class="steps ix-tasks" id="ix-tasks"></ol></div></div>
<div class="status"><span><span class="dot" id="ix-dot"></span><span id="ix-kind">ничего не выбрано</span></span><span id="ix-cells"></span><span class="grow"></span><span id="ix-tk"></span></div>`;
    const inp = $('ix-in');
    let last = null, src = '', done = [false, false], runs = 0;
    const cellTxt = (r, c) => String(ROWS[r][c]);
    const val = (r, c, inRow) => { const v = ROWS[r][c]; return COLS[c] === 'date' ? (inRow ? `${v} 00:00:00` : v) : String(v); };
    const pyVal = (r, c) => { const v = ROWS[r][c]; return COLS[c] === 'date' ? `Timestamp('${v} 00:00:00')` : typeof v === 'number' ? String(v) : `'${v}'`; };
    function sets(v) {
      const rows = new Set(), cols = new Set(), cells = new Set();
      if (!v) return { rows, cols, cells };
      const add = (r, c) => { rows.add(r); cols.add(c); cells.add(`${r}:${c}`); };
      if (v.t === 'frame') v.rows.forEach(r => v.cols.forEach(c => add(r, c)));
      else if (v.t === 'col') v.rows.forEach(r => add(r, v.c));
      else if (v.t === 'row') v.cols.forEach(c => add(v.r, c));
      else if (v.t === 'scalar') add(v.r, v.c);
      return { rows, cols, cells };
    }
    function table() {
      const v = last && last.v, S = sets(v), mask = v && v.t === 'mask' ? new Map(v.rows.map((r, j) => [r, v.vals[j]])) : null;
      const th = `<thead><tr><th class="ix-p" scope="col">поз.</th><th class="ix-l" scope="col">метка</th>${mask ? '<th scope="col" class="ix-mh">маска<small>bool</small></th>' : ''}${COLS.map((c, j) => `<th scope="col" class="${S.cols.has(j) ? 'on' : ''}">${c}<small>${DT[c]}</small></th>`).join('')}</tr></thead>`;
      const tb = ROWS.map((row, r) => {
        const on = S.rows.has(r);
        const mcell = mask ? `<td class="ix-m ${mask.has(r) ? (mask.get(r) ? 't' : 'f') : ''}">${mask.has(r) ? (mask.get(r) ? 'True' : 'False') : ''}</td>` : '';
        return `<tr class="${mask && mask.get(r) ? 'mt' : ''}"><th scope="row" class="ix-p${on ? ' on' : ''}">${r}</th><th scope="row" class="ix-l${on ? ' on' : ''}">${LAB[r]}</th>${mcell}${COLS.map((c, j) => `<td class="${S.cells.has(`${r}:${j}`) ? 'on' : ''}${typeof row[j] === 'number' ? ' n' : ''}">${esc(cellTxt(r, j))}</td>`).join('')}</tr>`;
      }).join('');
      $('ix-t').innerHTML = th + `<tbody>${tb}</tbody>`;
    }
    function dtypeOf(cols) { const d = [...new Set(cols.map(c => DT[COLS[c]]))]; return d.length === 1 ? d[0] : 'object'; }
    function describeRes(v) {
      if (v.t === 'frame') return `DataFrame · ${v.rows.length} × ${v.cols.length}`;
      if (v.t === 'col') return `Series · ${v.rows.length} ${plural(v.rows.length, ['значение', 'значения', 'значений'])}`;
      if (v.t === 'row') return `Series · ${v.cols.length} ${plural(v.cols.length, ['значение', 'значения', 'значений'])}`;
      if (v.t === 'scalar') return 'одно значение';
      return `маска · True: ${v.vals.filter(Boolean).length} из ${v.vals.length}`;
    }
    function preview(v) {
      const kv = pairs => `<table class="ix-kv">${pairs.map(([k, x, cl]) => `<tr><th>${esc(k)}</th><td${cl ? ` class="${cl}"` : ''}>${esc(x)}</td></tr>`).join('')}</table>`;
      if (v.t === 'scalar') return `<div class="ix-scal">${esc(pyVal(v.r, v.c))}</div><p class="ix-meta">скаляр из&nbsp;ячейки: метка ${LAB[v.r]}, столбец ${COLS[v.c]}</p>`;
      if (v.t === 'row') return kv(v.cols.map(c => [COLS[c], val(v.r, c, true)])) + `<p class="ix-meta">Name: ${LAB[v.r]}, dtype: ${dtypeOf(v.cols)}</p>`;
      if (v.t === 'col') return (v.rows.length ? kv(v.rows.map(r => [String(LAB[r]), val(r, v.c)])) : '<p class="ix-meta">Пустая Series</p>') + `<p class="ix-meta">Name: ${COLS[v.c]}, dtype: ${DT[COLS[v.c]]}</p>`;
      if (v.t === 'mask') return kv(v.rows.map((r, j) => [String(LAB[r]), v.vals[j] ? 'True' : 'False', v.vals[j] ? 't' : 'f'])) + `<p class="ix-meta">Name: ${v.name || 'None'}, dtype: bool</p>`;
      if (!v.rows.length) return `<p class="ix-meta">Пустая таблица: 0 строк × ${v.cols.length} ${plural(v.cols.length, ['столбец', 'столбца', 'столбцов'])}. Ошибки нет — это тоже результат.</p>`;
      return `<div class="ix-mini"><table><thead><tr><th></th>${v.cols.map(c => `<th>${COLS[c]}</th>`).join('')}</tr></thead><tbody>${v.rows.map(r => `<tr><th>${LAB[r]}</th>${v.cols.map(c => `<td>${esc(val(r, c))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="ix-meta">${v.rows.length} ${plural(v.rows.length, ['строка', 'строки', 'строк'])} × ${v.cols.length} ${plural(v.cols.length, ['столбец', 'столбца', 'столбцов'])}</p>`;
    }
    function checkTasks(v) {
      const extra = [];
      const one = v && (v.t === 'row' || (v.t === 'frame' && v.rows.length === 1)) ? (v.t === 'row' ? v.r : v.rows[0]) : null;
      const full = v && (v.t === 'row' ? v.cols.length === NC : v.t === 'frame' && v.cols.length === NC);
      if (one === 1 && full) { if (!done[0]) extra.push('<b>Задание 1 выполнено.</b>'); done[0] = true; if (!/iloc|\[\s*1\s*:\s*2\s*\]/.test(src)) extra.push('Верно, но&nbsp;через метку: после другой сортировки вторая строка будет другой, а&nbsp;df.iloc[1] останется второй.'); }
      if (one === 6 && full) { if (!done[1]) extra.push('<b>Задание 2 выполнено.</b>'); done[1] = true; if (/iloc/.test(src)) extra.push('Сработало, но&nbsp;через позицию 6: после другой сортировки там окажется другая строка, а&nbsp;df.loc[2] найдёт метку 2 где угодно.'); }
      if (one === 7 && full && !done[0]) extra.push('Если вы искали вторую строку: это метка 1, а&nbsp;после сортировки она последняя. «Вторая по&nbsp;счёту» — позиция 1.');
      if (one === 2 && full && !done[1]) extra.push('Если вы искали метку 2: iloc считает позиции, а&nbsp;на&nbsp;позиции 2 стоит метка 5.');
      return extra;
    }
    function draw() {
      table();
      const res = $('ix-res'), msg = $('ix-msg');
      if (!last) { res.innerHTML = '<p class="ix-meta">Здесь появится результат.</p>'; msg.innerHTML = 'Таблица df — восемь заказов после сортировки по&nbsp;сумме. Слева позиции и&nbsp;метки: их легко перепутать.'; $('ix-kind').textContent = 'ничего не выбрано'; $('ix-cells').textContent = ''; $('ix-dot').className = 'dot'; }
      else if (last.unsup) { res.innerHTML = '<p class="ix-unsup">Форма не поддерживается</p>'; msg.innerHTML = esc(last.unsup); $('ix-kind').textContent = 'разбор не поддерживает'; $('ix-cells').textContent = ''; $('ix-dot').className = 'dot'; }
      else if (last.err) { res.innerHTML = `<p class="ix-err">${esc(last.err.type)}: ${esc(last.err.msg)}</p>`; msg.innerHTML = [last.err.why, ...last.notes.slice(-1)].filter(Boolean).join(' '); $('ix-kind').textContent = last.err.type; $('ix-cells').textContent = 'ячеек: 0'; $('ix-dot').className = 'dot bad'; }
      else {
        const v = last.v, S = sets(v);
        res.innerHTML = preview(v);
        msg.innerHTML = [...last.notes.slice(-2), ...checkTasks(v)].join(' ');
        $('ix-kind').textContent = describeRes(v);
        $('ix-cells').textContent = v.t === 'mask' ? 'маска — столбец рядом с метками' : `ячеек: ${S.cells.size}`;
        $('ix-dot').className = 'dot live';
      }
      $('ix-tasks').innerHTML = TASKS.map((t, j) => `<li class="${done[j] ? 'on' : ''}"><b>${done[j] ? '✓' : j + 1}</b><span>${esc(t)}</span></li>`).join('');
      $('ix-tk').textContent = `Задания: ${done.filter(Boolean).length} из 2`;
      const v = last && last.v;
      box.dataset.res = JSON.stringify(!last ? { t: 'none' } : last.unsup ? { t: 'unsup' } : last.err ? { t: 'error', e: `${last.err.type}: ${last.err.msg}` }
        : v.t === 'frame' ? { t: 'DataFrame', index: v.rows.map(r => LAB[r]), cols: v.cols.map(c => COLS[c]) }
          : v.t === 'col' ? { t: 'Series', index: v.rows.map(r => LAB[r]), name: COLS[v.c] }
            : v.t === 'row' ? { t: 'Series', index: v.cols.map(c => COLS[c]), name: LAB[v.r] }
              : v.t === 'scalar' ? { t: 'scalar', v: val(v.r, v.c, true) }
                : { t: 'mask', index: v.rows.map(r => LAB[r]), vals: v.vals });
    }
    function run(s) { src = s.trim(); if (!src) return; runs++; last = evaluate(src); draw(); }
    $('ix-form').addEventListener('submit', e => { e.preventDefault(); run(inp.value); });
    box.querySelector('.ix-chips').addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b) { inp.value = b.dataset.x; run(b.dataset.x); } });
    $('ix-reset').addEventListener('click', () => { last = null; src = ''; done = [false, false]; runs = 0; inp.value = ''; draw(); });
    draw();
    return {
      describe() {
        const st = !last ? 'выражение ещё не вводил' : `выражение ${src} → ${last.unsup ? 'форма не поддерживается разбором' : last.err ? `${last.err.type}: ${last.err.msg}` : describeRes(last.v)}`;
        return `таблица df с индексом 0, 6, 5, 3, 4, 7, 2, 1 (восемь учебных заказов после сортировки по сумме); ${st}; выполнено выражений: ${runs}; заданий выполнено: ${done.filter(Boolean).length} из 2 («вторая строка» и «строка с меткой 2»).`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-2-1',
    short: 'DA-02',
    title: 'DataFrame изнутри: индекс, типы, выборка',
    where: 'блок «Дата аналитика», тема 02 «Pandas и подготовка данных», страница 2.1',
    aiData: 'учебная выгрузка заказов интернет-магазина за январь–март 2026 (order_id, date, brand — Сова, Кедр, Луч, Бриз, country — BY, RU, KZ, UZ, channel, amount в рублях, status — paid или cancelled); в примерах df — первые восемь заказов, отсортированные по сумме, с индексом 0, 6, 5, 3, 4, 7, 2, 1',
    scene,
    widgets: { sel: buildSel },
    code: {
      info: { title: 'Учебная выгрузка: info() и memory_usage()', badge: 'проверено: pandas 3.0.5', lang: 'python',
        code: `import numpy as np
import pandas as pd

# Учебная выгрузка заказов: 100 000 строк, январь–март 2026
rng = np.random.default_rng(9)            # зерно: при каждом запуске те же данные
n = 100_000
orders = pd.DataFrame({
    "order_id": np.arange(10001, 10001 + n),
    "date": pd.Timestamp("2026-01-01")
            + pd.to_timedelta(rng.integers(0, 90, n), unit="D"),
    "brand": rng.choice(["Сова", "Кедр", "Луч", "Бриз"], n),
    "country": rng.choice(["BY", "RU", "KZ", "UZ"], n),
    "channel": rng.choice(["органика", "реклама", "рассылка"], n),
    "amount": rng.integers(5, 400, n) * 10,             # от 50 до 3 990 ₽
    "status": rng.choice(["paid", "cancelled"], n, p=[0.85, 0.15]),
})

orders.info()                                           # типы, пропуски, память
print()
kb = orders.memory_usage(deep=True) / 1024              # байты → КБ
print(kb.round(1))`,
        out: `<class 'pandas.DataFrame'>
RangeIndex: 100000 entries, 0 to 99999
Data columns (total 7 columns):
 #   Column    Non-Null Count   Dtype
---  ------    --------------   -----
 0   order_id  100000 non-null  int64
 1   date      100000 non-null  datetime64[us]
 2   brand     100000 non-null  str
 3   country   100000 non-null  str
 4   channel   100000 non-null  str
 5   amount    100000 non-null  int64
 6   status    100000 non-null  str
dtypes: datetime64[us](1), int64(2), str(4)
memory usage: 8.2 MB

Index          0.1
order_id     781.2
date         781.2
brand       1513.8
country      976.6
channel     2278.5
amount       781.2
status      1245.5
dtype: float64`,
        note: 'Индекс по умолчанию — RangeIndex: он хранит только начало, конец и шаг, поэтому занимает 0,1 КБ. Числа и даты — ровно по 8 байт на значение, строки str — байты текста в UTF-8 плюс смещения.' },
      types: { title: 'Перевод типов: str, object, category и числа из строк', badge: 'проверено: pandas 3.0.5', lang: 'python',
        code: `from timeit import timeit

kb = lambda x: round(np.sum(x.memory_usage(deep=True)) / 1024)   # КБ

# Один и тот же столбец brand в трёх типах
variants = {
    "str": orders["brand"],                       # строки по умолчанию в pandas 3
    "object": orders["brand"].astype(object),     # так строки хранил pandas 2
    "category": orders["brand"].astype("category"),   # 4 бренда и коды 0–3
}
for name, s in variants.items():
    ms = timeit(lambda: s == "Сова", number=20) / 20 * 1000
    print(f"{name:9}{kb(s):6} КБ   s == 'Сова': {ms:.2f} мс")

# Все повторяющиеся строковые столбцы — в category
typed = orders.astype({c: "category" for c in ["brand", "country", "channel", "status"]})
print("вся таблица:", kb(orders), "КБ →", kb(typed), "КБ")
print(typed["brand"].cat.categories.tolist(), typed["brand"].cat.codes.dtype)

# Числа, пришедшие строками: одно «н/д» делает весь столбец текстом
raw = pd.Series(["3430", "400", "н/д", "1 300"])
print(raw.dtype, raw.sum())                       # sum() склеивает строки
fixed = pd.to_numeric(raw.str.replace(" ", ""), errors="coerce")
print(fixed.tolist(), fixed.dtype)
print(pd.Series([3430, 400, "н/д"]).dtype)         # числа вперемешку со строкой`,
        out: `str        1514 КБ   s == 'Сова': 1.99 мс
object     7178 КБ   s == 'Сова': 7.08 мс
category     98 КБ   s == 'Сова': 0.11 мс
вся таблица: 8358 КБ → 2735 КБ
['Бриз', 'Кедр', 'Луч', 'Сова'] int8
str 3430400н/д1 300
[3430.0, 400.0, nan, 1300.0] float64
object`,
        note: 'Время зависит от компьютера, а соотношения повторяются: object медленнее str в несколько раз, category быстрее на порядок. Перевод в число дал float64, потому что NaN — значение с плавающей точкой.' },
      four: { title: 'Одна выборка четырьмя способами', badge: 'проверено: pandas 3.0.5', lang: 'python',
        code: `# Оплаченные заказы из Беларуси дороже 3 000 ₽: номер и сумма
cols = ["order_id", "amount"]
mask = ((orders["status"] == "paid") & (orders["country"] == "BY")
        & (orders["amount"] > 3000))

a = orders.loc[mask, cols]                                # 1. loc: маска и имена
b = orders[mask][cols]                                    # 2. две пары скобок
c = orders.query("status == 'paid' and country == 'BY' "
                 "and amount > 3000")[cols]               # 3. query: условие строкой
rows = np.flatnonzero(mask.to_numpy())                    # позиции, где маска True
d = orders.iloc[rows, [orders.columns.get_loc(x) for x in cols]]   # 4. iloc

print(len(a), a.equals(b), a.equals(c), a.equals(d))
print(a.head(3))
print(rows[:3])`,
        out: `5292 True True True
     order_id  amount
70      10071    3870
103     10104    3180
110     10111    3450
[ 70 103 110]`,
        note: 'Индекс здесь RangeIndex, поэтому позиции 70, 103, 110 совпадают с метками. После сортировки способ 4 пришлось бы пересчитывать, а способы 1–3 работают с метками и условием и не зависят от порядка строк.' },
      speed: { title: 'Замер: цикл по строкам против векторного выражения', badge: 'проверено: pandas 3.0.5', lang: 'python',
        code: `import time

def best_ms(f, repeat=3):
    """Лучшее время из нескольких запусков, мс."""
    times = []
    for _ in range(repeat):
        t0 = time.perf_counter()
        result = f()
        times.append(time.perf_counter() - t0)
    return result, min(times) * 1000

def by_iterrows():                        # строка за строкой, каждая — новая Series
    total = 0
    for _, row in orders.iterrows():
        if row["status"] == "paid":
            total += row["amount"]
    return total

def by_zip():                             # цикл Python по двум столбцам
    total = 0
    for status, amount in zip(orders["status"], orders["amount"]):
        if status == "paid":
            total += amount
    return total

def vectorized():                         # маска и сумма над целыми столбцами
    return orders.loc[orders["status"] == "paid", "amount"].sum()

print(f"{'способ':10}{'выручка, ₽':>14}{'мс':>10}{'быстрее iterrows':>19}")
base = None
for name, f in [("iterrows", by_iterrows), ("zip", by_zip), ("векторно", vectorized)]:
    total, ms = best_ms(f)
    base = base or ms
    print(f"{name:10}{total:>14,}{ms:>10.1f}{base / ms:>18.0f}×".replace(",", " "))`,
        out: `способ        выручка, ₽        мс   быстрее iterrows
iterrows     171 247 920    1682.4                 1×
zip          171 247 920      56.2                30×
векторно     171 247 920       1.8               937×`,
        note: 'Ответ у всех трёх способов один, различается только время. Абсолютные миллисекунды зависят от компьютера, порядок разницы — нет.' },
      chain: { title: 'Цепочка присваивания в pandas 3 и pandas 2', badge: 'проверено: pandas 3.0.5 и 2.3.3', lang: 'python',
        code: `import warnings
warnings.simplefilter("always")                     # показывать каждое предупреждение
warnings.showwarning = lambda m, c, *a, **k: print(f"   {c.__name__}: {str(m).strip().splitlines()[0]}")

df = orders.head(8).sort_values("amount", ascending=False)
cancelled = df["status"] == "cancelled"             # одна строка: метка 4, 1 300 ₽

df[cancelled]["amount"] = 0                         # A: строки, потом столбец
print("A:", df.loc[4, "amount"])
df["amount"][cancelled] = 0                         # B: столбец, потом строки
print("B:", df.loc[4, "amount"])
paid = df[df["status"] == "paid"]                   # C: новая таблица из выборки
paid["amount"] = paid["amount"] * 2
print("C:", df.loc[0, "amount"], paid.loc[0, "amount"])
df.loc[cancelled, "amount"] = 0                     # D: один loc — строки и столбец
print("D:", df.loc[4, "amount"])`,
        outLabel: 'Вывод: сначала pandas 3.0.5, затем тот же код в pandas 2.3.3',
        out: `# pandas 3.0.5
   ChainedAssignmentError: A value is being set on a copy of a DataFrame or Series through chained assignment.
A: 1300
   ChainedAssignmentError: A value is being set on a copy of a DataFrame or Series through chained assignment.
B: 1300
C: 3430 6860
D: 0

# pandas 2.3.3
   SettingWithCopyWarning: A value is trying to be set on a copy of a slice from a DataFrame.
A: 1300
   FutureWarning: ChainedAssignmentError: behaviour will change in pandas 3.0!
   SettingWithCopyWarning: A value is trying to be set on a copy of a slice from a DataFrame
B: 0
   SettingWithCopyWarning: A value is trying to be set on a copy of a slice from a DataFrame.
C: 3430 6860
D: 0`,
        note: 'Третья строка кода печатает только первую строку каждого предупреждения, чтобы вывод поместился. В pandas 2 строка B изменила таблицу, а A — нет; в pandas 3 не работает ни одна цепочка, работает только D.' },
      tz: { title: 'Часовой пояс сдвигает дату заказа', badge: 'проверено: pandas 3.0.5', lang: 'python',
        code: `# Время заказов записано в UTC, а сутки отчёта — по местному времени
utc = pd.Series(pd.to_datetime(["2026-03-28 22:30", "2026-03-29 08:10"]))
print(utc.dtype)                                    # наивное время: пояс неизвестен
utc = utc.dt.tz_localize("UTC")                     # объявить: это UTC
print(utc.dtype)
for tz in ["UTC", "Europe/Minsk", "Asia/Tashkent"]:
    local = utc.dt.tz_convert(tz)                   # тот же момент, другие часы
    print(f"{tz:14}", local.dt.strftime("%d.%m %H:%M").tolist())
try:
    utc > pd.Timestamp("2026-03-29")                # сравнить с датой без пояса
except TypeError as e:
    print("TypeError:", e)`,
        out: `datetime64[us]
datetime64[us, UTC]
UTC            ['28.03 22:30', '29.03 08:10']
Europe/Minsk   ['29.03 01:30', '29.03 11:10']
Asia/Tashkent  ['29.03 03:30', '29.03 13:10']
TypeError: Invalid comparison between dtype=datetime64[us, UTC] and Timestamp`,
        note: 'Первый заказ в UTC сделан 28 марта, а по минскому и ташкентскому времени — 29-го. Дневная выручка зависит от того, в каком поясе считать сутки.' }
    },
    questions: {
    q1: { sec: 'select', title: 'Сначала предскажите', q: 'Индекс таблицы сверху вниз: 0, 6, 5, 3, 4, 7, 2, 1. Что вернёт df.loc[2]?', opts: [['Третью строку сверху — у неё метка 5'], ['Седьмую строку сверху — у неё метка 2', 1], ['KeyError: метки идут не по порядку'], ['Две первые строки, с метками 0 и 6']],
      why: 'loc ищет метку, а не позицию: строка с меткой 2 стоит седьмой сверху, на позиции 6, и loc найдёт её, где бы она ни стояла. Третью строку сверху вернул бы df.iloc[2]. Беспорядок в метках loc не мешает, KeyError бывает, только если метки нет совсем. Две первые строки дал бы срез df.iloc[0:2]. Проверьте в интерактиве ниже.' },
    q2: { sec: 'idea', q: 'В анимации таблица распалась на столбцы. Что общего у этих столбцов?', opts: [['Тип данных: pandas приводит все столбцы к одному dtype'], ['Индекс: все столбцы подписаны одними и теми же метками строк', 1], ['Память: все значения таблицы лежат в одном общем массиве'], ['Ничего: после разделения каждый столбец получает свой индекс 0, 1, 2…']],
      why: 'DataFrame — набор столбцов с общим индексом: по нему pandas собирает строку из значений разных столбцов и сопоставляет новые столбцы. Тип у каждого столбца свой — в сцене это datetime64[us], str и int64, поэтому одного общего массива на всю таблицу быть не может. Свой индекс 0, 1, 2… столбец тоже не получает: df["amount"] сохраняет метки таблицы.' },
    q3: { sec: 'select', q: 'У таблицы обычный индекс 0, 1, 2, …, 99 999. Сколько строк вернут df.loc[0:2] и df.iloc[0:2]?', opts: [['2 и 2'], ['3 и 2', 1], ['2 и 3'], ['3 и 3']],
      why: 'Срез loc включает обе границы: метки 0, 1 и 2 — три строки. Срез iloc устроен как срез списка: позиции 0 и 1, конец не входит. На индексе по умолчанию метки совпадают с позициями, поэтому разница только в правой границе. На перемешанном индексе из интерактива df.loc[0:2] возвращает уже семь строк.' },
    q4: { sec: 'idea', q: 'Выгрузку прочитали через read_csv в pandas 3, и столбец amount получил тип str, а не int64. Что вероятнее всего случилось?', opts: [['read_csv всегда читает числа как строки, их переводят вручную'], ['В столбце есть пустые ячейки'], ['Хотя бы одно значение не разбирается как число, например «н/д» или «1 300» с пробелом', 1], ['Суммы больше 2 147 483 647 не помещаются в int64']],
      why: 'Тип у столбца один на все значения. Если хотя бы одно не похоже на число, pandas оставляет весь столбец текстом: в pandas 3 это str, в pandas 2 был object. Пустые ячейки дали бы float64 с NaN, а не текст. Числа read_csv распознаёт сам, а 2 147 483 647 — предел int32; int64 вмещает числа до 9,2 · 10^18. Исправление — pd.to_numeric(…, errors="coerce").' },
    q5: { sec: 'nuances', q: 'Как в pandas 3 понять, копия перед вами или представление, если вы собираетесь менять результат выборки?', opts: [['Проверить, выдал ли pandas SettingWithCopyWarning'], ['Проверить np.shares_memory: если память общая, изменения попадут в исходную таблицу'], ['Гадать не нужно: любой результат выборки ведёт себя как копия, а исходную таблицу меняют через df.loc[строки, столбцы] = значение', 1], ['Посмотреть dtype: у представления он помечен как view']],
      why: 'С Copy-on-Write любой объект, полученный выборкой, ведёт себя как копия: запись в него сначала отделяет его данные и до исходной таблицы не доходит. SettingWithCopyWarning — сигнал pandas 2, в pandas 3 его убрали. Общая память до первой записи бывает, pandas копирует лениво, но изменения через неё не проходят. Пометки view в dtype нет.' },
    q6: { sec: 'assign', q: 'Что произойдёт после этой строки в pandas 3?', code: 'df[df["status"] == "cancelled"]["amount"] = 0', lang: 'python', opts: [['Суммы отменённых заказов в df станут нулями'], ['pandas предупредит ChainedAssignmentError, а df не изменится', 1], ['pandas предупредит SettingWithCopyWarning, но df изменится'], ['KeyError: в выборке нет столбца amount']],
      why: 'Первые скобки вернули новую таблицу из отменённых заказов, и вторые записали ноль в неё, а не в df. В pandas 3 так происходит всегда, и pandas предупреждает ChainedAssignmentError — строка A в блоке кода. SettingWithCopyWarning — предупреждение pandas 2, в pandas 3 его нет. KeyError не будет: после первых скобок осталась таблица со всеми столбцами. Правильно — df.loc[df["status"] == "cancelled", "amount"] = 0.' },
    q7: { sec: 'idea', q: 'Таблицу из интерактива сбросили: df2 = df.reset_index(drop=True). Что теперь вернут df2.loc[2] и df2.iloc[2]?', opts: [['Обе — заказ на 910 ₽, у которого была метка 2'], ['Обе — третью строку сверху, заказ на 2 640 ₽', 1], ['loc — заказ на 910 ₽, iloc — заказ на 2 640 ₽'], ['loc — KeyError: метки 2 больше нет']],
      why: 'reset_index(drop=True) выбрасывает старые метки и ставит новые 0, 1, 2… по порядку строк. Метки снова совпадают с позициями, и метка 2 теперь у третьей строки сверху — заказа на 2 640 ₽. Старую метку 2 не сохранили: drop=True не перенёс её в столбец. KeyError не будет: метка 2 есть, просто у другой строки.' }
    },
    glossary: {
      dataframe: { t: 'DataFrame', en: 'DataFrame', d: 'Таблица pandas: столбцы-Series с общим индексом.' },
      series: { t: 'Series', en: 'Series', d: 'Одномерный массив pandas с метками: значения, индекс и имя.' },
      index: { t: 'Индекс', en: 'index', d: 'Метки строк таблицы или Series.' },
      label: { t: 'Метка', en: 'label', d: 'Значение индекса у строки. Едет вместе со строкой; по ней ищет loc.' },
      position: { t: 'Позиция', en: 'position', d: 'Номер строки сверху, с нуля. Меняется при сортировке; по нему ищет iloc.' },
      dtype: { t: 'Тип данных столбца', en: 'dtype', d: 'Тип, общий для всех значений столбца: int64, datetime64, str, category, object.' },
      loc: { t: 'loc', en: 'label-based indexing', d: 'Выборка по меткам и именам. Срез включает обе границы.' },
      iloc: { t: 'iloc', en: 'integer-location indexing', d: 'Выборка по позициям с нуля. Правая граница среза не входит.' },
      mask: { t: 'Булева маска', en: 'boolean mask', d: 'Series из True и False; в df[mask] оставляет строки с True.' },
      vectorization: { t: 'Векторизация', en: 'vectorization', d: 'Операция над целым массивом вместо цикла Python по элементам.' },
      object: { t: 'object', en: 'object dtype', d: 'Тип «любой объект Python»: массив указателей. Медленный и тяжёлый.' },
      str: { t: 'str', en: 'string dtype', d: 'Тип строк по умолчанию в pandas 3.' },
      arrow: { t: 'Arrow', en: 'Apache Arrow', d: 'Формат столбцов в памяти: значения одного типа подряд в общих буферах.' },
      category: { t: 'Категориальный тип', en: 'category', d: 'Словарь немногих значений плюс маленькие целые коды в строках.' },
      rangeindex: { t: 'RangeIndex', en: 'RangeIndex', d: 'Индекс по умолчанию 0, 1, 2…: хранит только начало, конец и шаг.' },
      align: { t: 'Выравнивание по индексу', en: 'index alignment', d: 'Сопоставление значений двух объектов по меткам, а не по порядку.' },
      chained: { t: 'Цепочка присваивания', en: 'chained assignment', d: 'Запись df[…][…] = значение. В pandas 3 не меняет таблицу.' },
      view: { t: 'Представление', en: 'view', d: 'Объект, который смотрит в ту же память, что исходный.' },
      swc: { t: 'SettingWithCopyWarning', en: 'SettingWithCopyWarning', d: 'Предупреждение pandas 2 о записи в возможную копию. В pandas 3 удалено.' },
      cow: { t: 'Copy-on-Write', en: 'Copy-on-Write', d: 'Правило pandas 3: выборка ведёт себя как копия, данные копируются при первой записи.' },
      naive: { t: 'Наивное время', en: 'tz-naive datetime', d: 'Дата и время без часового пояса.' },
      polars: { t: 'Polars', en: 'Polars', d: 'Библиотека таблиц на Rust с ленивыми вычислениями.' },
      duckdb: { t: 'DuckDB', en: 'DuckDB', d: 'Встраиваемая аналитическая база с SQL по файлам и таблицам.' }
    },
    materials: [
      ['da-2-1-dataframe-inside.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['orders_2026q1.csv', 'Учебная выгрузка: 100 000 заказов января–марта 2026'],
      ['dataframe_inside.ipynb', 'Блоки кода страницы и упражнения на loc, iloc, маски и типы'],
      ['dataframe_inside_solutions.ipynb', 'Решения упражнений'],
      ['loc_iloc_drill.py', 'Тридцать выражений выборки к таблице из интерактива с ответами pandas 3']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне пять вопросов по источнику о разнице loc и iloc, метки и позиции. По одному; после ответа объясни ошибку со ссылкой на текст.'],
      ['Разбор выражений', 'Я пришлю выражения выборки к таблице с индексом 0, 6, 5, 3, 4, 7, 2, 1 из источника. Сначала спроси, какие строки я ожидаю, потом объясни, что вернёт pandas 3.'],
      ['Переезд на pandas 3', 'Я пришлю код на pandas 2 с цепочками присваивания и .copy(). Найди строки, которые в pandas 3 перестанут менять таблицу, и предложи замену через loc.']
    ]
  };
})();
