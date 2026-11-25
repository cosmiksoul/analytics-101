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
    { lane: 'df = orders.head(8).sort_values("amount", ascending=False)', rows: '8', kind: 'DataFrame', map: '—', idxOn: 1, call: [[-1, 'слева метки строк']] },
    { lane: 'df.index  →  [0, 6, 5, 3, 4, 7, 2, 1]', rows: '8', kind: 'DataFrame', map: '2 · 6', idxOn: 1, mark: [6], call: [[6, 'метка 2 стоит на позиции 6']] },
    { lane: '{"date": Series, "brand": Series, "amount": Series}', lb: 'внутри', rows: '8', kind: 'DataFrame', map: '—', idxOn: 1, call: [[-1, 'общий индекс всех столбцов']] },
    { lane: 'df.dtypes', rows: '8', kind: 'DataFrame', map: '—', call: [[-1, 'int64: 8 байт на каждое число', 'amount']] },
    { lane: 'df["amount"]', rows: '8', kind: 'Series', map: '—', sel: { rows: [0, 1, 2, 3, 4, 5, 6, 7], cols: ['amount'], kind: 'col' }, dimOther: 1, call: [[-1, 'имя amount, тип int64', 'amount']] },
    { lane: 'df.loc[2]', rows: '1', kind: 'Series', map: '2 · 6', sel: { rows: [6], cols: 'all', kind: 'loc' }, call: [[6, 'метка 2 → позиция 6', 'loc']] },
    { lane: 'df.loc[[2, 5], ["brand", "amount"]]', rows: '2', kind: 'DataFrame', map: '—', sel: { rows: [6, 2], cols: ['brand', 'amount'], kind: 'loc' }, call: [[2, 'метка 5 → позиция 2', 'loc']] },
    { lane: 'df.iloc[2]', rows: '1', kind: 'Series', map: '5 · 2', sel: { rows: [2], cols: 'all', kind: 'iloc' }, call: [[2, 'позиция 2 → метка 5', 'iloc']] },
    { lane: 'df.iloc[0:3]', rows: '3', kind: 'DataFrame', map: '—', sel: { rows: [0, 1, 2], cols: 'all', kind: 'iloc' }, call: [[3, 'позиция 3 за границей среза', 'bad']] },
    { lane: 'mask = df["brand"] == "Кедр"', rows: '8', kind: 'bool', map: '—', mask: 1, call: [[-1, 'тип bool, индекс таблицы', 'mask']] },
    { lane: 'df[mask]', rows: '4 из 8', kind: 'DataFrame', map: '—', mask: 1, dim: 1, sel: { rows: MASK_ROWS, cols: 'all', kind: 'mask' }, call: [[1, 'False: строка не входит в результат', 'bad']] },
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
      { title: 'Восемь заказов после сортировки', dur: 3400, body: '<p>Возьмём первые восемь заказов из выгрузки и отсортируем их по убыванию суммы. На экране показаны три столбца из семи — дата, бренд и сумма заказа.</p><p>В левом столбце видны метки индекса. Метки остались у тех же заказов. Теперь они идут в порядке 0, 6, 5, 3, 4, 7, 2, 1.</p>' },
      { title: 'Где находится строка с меткой 2', dur: 3600, body: '<p><b>Позиция</b> показывает место строки в текущем порядке, начиная с нуля. <b>Метка</b> хранится в индексе. При сортировке позиция заказа может измениться, а метка сохранится.</p><p>После сортировки строка с меткой 2 стоит седьмой сверху. Её позиция — 6.</p>' },
      { title: 'Один индекс для трёх столбцов', dur: 3600, body: '<p>У столбцов с датами, брендами и суммами один и тот же индекс. Благодаря этому видно, какие значения относятся к одному заказу.</p><p>По имени столбца можно получить весь столбец как объект Series.</p>' },
      { title: 'Как узнать тип столбца', dur: 3800, body: '<p>Свойство <b>df.dtypes</b> показывает тип каждого столбца. Даты здесь имеют тип datetime64[us], названия брендов — str, а суммы — int64.</p><p>Для каждой суммы типа int64 нужно восемь байт. У названий брендов разная длина, поэтому расход памяти на текст зависит от самих строк.</p>' },
      { title: 'Столбец сумм как Series', dur: 3400, body: '<p>Выражение <b>df["amount"]</b> возвращает Series с именем amount и индексом исходной таблицы.</p><p>Сумму одного заказа можно получить по метке строки или по её позиции.</p>' },
      { title: 'Поиск по метке', dur: 3600, body: '<p>Выражение <b>df.loc[2]</b> находит заказ с меткой 2. Он находится на позиции 6. Сумма заказа — 910 ₽.</p><p>Результат — Series со значениями одной строки. Значения подписаны именами столбцов.</p>' },
      { title: 'Выбор нескольких строк и столбцов', dur: 3600, body: '<p>В скобках после loc через запятую указывают, какие строки и столбцы нужны. В этом примере первый список содержит метки 2 и 5, второй — имена brand и amount.</p><p>Результат — таблица из двух строк и двух столбцов. Строки идут в порядке, который мы задали в списке меток.</p>' },
      { title: 'Поиск по позиции', dur: 3600, body: '<p>Выражение <b>df.iloc[2]</b> возвращает третью строку сверху, потому что отсчёт позиций начинается с нуля.</p><p>У этого заказа метка 5, а сумма — 2 640 ₽. По метке 2 мы нашли другой заказ.</p>' },
      { title: 'Первые три строки', dur: 3400, body: '<p>В срезе <b>df.iloc[0:3]</b> начальная позиция 0 входит в выборку, а конечная позиция 3 остаётся за её пределами. Получим строки на позициях 0, 1 и 2.</p><p>В срезе по меткам через loc обе указанные границы входят в выборку.</p>' },
      { title: 'Какие заказы относятся к «Кедру»', dur: 3600, body: '<p>Выражение <b>df["brand"] == "Кедр"</b> сравнивает каждое название бренда со строкой «Кедр». Совпадениям соответствует True, остальным значениям — False.</p><p>Результат — <b>булева маска</b>. У этой Series те же метки строк, что и у таблицы заказов.</p>' },
      { title: 'Четыре заказа «Кедра»', dur: 3600, body: '<p>Выражение <b>df[mask]</b> оставит четыре строки, где значение маски равно True. Это заказы «Кедра» с метками 0, 5, 7 и 2.</p><p>В анимации остальные строки затемнены. В таблицу результата они не входят. Ту же выборку можно записать как <b>df.loc[mask]</b>.</p>' },
      { title: 'Когда выбирать loc, iloc или маску', dur: 4400, next: 'Читать страницу', body: '<p>Для поиска по метке используйте <b>loc</b>, по месту строки в текущей таблице — <b>iloc</b>, по условию — <b>маску</b>.</p><p>Проверьте себя на этих заказах. По метке 2 мы получили сумму 910 ₽, по позиции 2 — 2 640 ₽, а по названию бренда «Кедр» нашли сразу четыре заказа.</p>' }
    ],
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'kind', label: 'Тип' }, { id: 'map', label: 'Метка / позиция' }],
    legend: '<span><i style="background:#36b8a6"></i>loc — метка</span><span><i style="background:#f0a247"></i>iloc — позиция</span><span><i style="background:#a48af0"></i>маска</span>',
    info: 'DATAFRAME',
    aiNote: 'Для таблицы df взяли первые восемь заказов и отсортировали их по убыванию суммы. Метки строк сверху вниз: 0, 6, 5, 3, 4, 7, 2, 1, показаны столбцы date, brand, amount. У показанных столбцов общий индекс (dtype: datetime64[us], str, int64), df.loc[2] подсвечивает строку с меткой 2 на позиции 6, df.iloc[2] — строку на позиции 2 с меткой 5, df.iloc[0:3] — позиции 0–2, маска df["brand"] == "Кедр" оставляет четыре строки с метками 0, 5, 7, 2.',
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
          if (o.t === 'frame' && o.cols.some(c => COLS[c] === n.name)) { notes.push(`df.${n.name} — то&nbsp;же, что df["${n.name}"]: столбец как Series. Такая запись работает, если имя столбца подходит для переменной Python и не совпадает с существующим атрибутом таблицы.`); return { t: 'col', rows: o.rows.slice(), c: COLS.indexOf(n.name) }; }
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
          if (a.rows.join() !== b.rows.join()) throw new Unsup('Маски построены по разным выборкам. Для этого упражнения возьмите маски, рассчитанные по одним и тем же строкам.');
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
      const bad = () => new PyErr('TypeError', `Invalid comparison between dtype=${dt} and ${otherT}`, `Для столбца ${COLS[c]} с типом ${dt} такое сравнение с ${b.t === 'str' ? 'текстом' : 'числом'} не определено.`);
      let vals;
      if (dt === 'int64') {
        if (b.t === 'str') { if (eq) { notes.push('Число никогда не&nbsp;равно строке, поэтому маска целиком ' + (op === '==' ? 'False' : 'True') + '.'); return allBool(op !== '=='); } throw bad(); }
        vals = a.rows.map(r => cmp(ROWS[r][c], b.v));
      } else if (dt === 'str') {
        if (b.t === 'num') { if (eq) { notes.push('Строка никогда не&nbsp;равна числу, поэтому маска целиком ' + (op === '==' ? 'False' : 'True') + '.'); return allBool(op !== '=='); } throw bad(); }
        if (!eq) notes.push('Порядок строк при сравнении зависит от кодов символов Unicode.');
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
      if (hits.length > 1) throw new Unsup('В полученной таблице эта метка встречается несколько раз. Упражнение рассчитано на выборку по уникальным меткам.');
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
    function alignMask(labels, m, warnOnReindex = false) {
      const map = new Map(m.rows.map((r, j) => [LAB[r], m.vals[j]]));
      if (!labels.every(l => map.has(l))) throw new PyErr('IndexingError', 'Unalignable boolean Series provided as indexer (index of the boolean Series and of the indexed object do not match).', 'В маске нет значения для одной или нескольких меток выбранных строк.');
      if (warnOnReindex && (labels.length !== m.rows.length || labels.some((l, j) => l !== LAB[m.rows[j]]))) notes.push('Метки маски и таблицы идут в разном порядке или различаются по составу. pandas сопоставит значения маски по меткам. Предупреждение: «Boolean Series key will be reindexed to match DataFrame index».');
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
          notes.push(`df["${esc0(k.v)}"] возвращает столбец целиком — Series с&nbsp;тем&nbsp;же индексом, что у&nbsp;таблицы.`);
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
          notes.push('В df[…] срез с целочисленными границами выбирает строки по позициям, как iloc.');
          return { t: 'frame', rows: idx.map(j => o.rows[j]), cols: o.cols.slice() };
        }
        if (k.t === 'mask') {
          const idx = alignMask(o.rows.map(r => LAB[r]), k, true);
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
          const idx = posSlice(o.rows.length, k); notes.push('В s[…] срез с целочисленными границами выбирает значения по позициям, как iloc.');
          return { t: 'col', rows: idx.map(j => o.rows[j]), c: o.c };
        }
        if (k.t === 'mask') { const idx = alignMask(o.rows.map(r => LAB[r]), k); return { t: 'col', rows: idx.map(j => o.rows[j]), c: o.c }; }
        throw new Unsup(SUPPORTED);
      }
      if (o.t === 'row') {
        if (k.t === 'str' || k.t === 'list') return loc(o, [k]);
        if (k.t === 'num') throw keyErr(k, 'Индекс выбранной строки состоит из имён столбцов. В&nbsp;pandas 3 число в&nbsp;s[…] всегда ищется среди меток, позицию берут через .iloc.');
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
    box.innerHTML = `<div class="block-hd"><span class="t">Какой заказ вернёт выражение? <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="ix-reset">Сбросить</button></div></div>
<p class="hint ix-do">Введите выражение и нажмите Enter или «Выполнить». Можно также нажать на один из готовых примеров. Найдите в таблице ячейки, которые соответствуют результату выборки, и выполните два задания.</p>
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
      if (v.t === 'scalar') return `<div class="ix-scal">${esc(pyVal(v.r, v.c))}</div><p class="ix-meta">значение ячейки: метка ${LAB[v.r]}, столбец ${COLS[v.c]}</p>`;
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
      if (one === 1 && full) { if (!done[0]) extra.push('<b>Задание 1 выполнено.</b>'); done[0] = true; if (!/iloc|\[\s*1\s*:\s*2\s*\]/.test(src)) extra.push('Верно, но&nbsp;через метку: при другой сортировке второй может оказаться другая строка. Выражение df.iloc[1] всегда выбирает строку на этой позиции.'); }
      if (one === 6 && full) { if (!done[1]) extra.push('<b>Задание 2 выполнено.</b>'); done[1] = true; if (/iloc/.test(src)) extra.push('Сработало, но&nbsp;через позицию 6: при другой сортировке на этой позиции может оказаться другая строка. Выражение df.loc[2] выбирает нужную метку при любом порядке строк.'); }
      if (one === 7 && full && !done[0]) extra.push('Если вы искали вторую строку: это метка 1, а&nbsp;после сортировки она последняя. «Вторая по&nbsp;счёту» — позиция 1.');
      if (one === 2 && full && !done[1]) extra.push('Если вы искали метку 2: iloc считает позиции, а&nbsp;на&nbsp;позиции 2 стоит метка 5.');
      return extra;
    }
    function draw() {
      table();
      const res = $('ix-res'), msg = $('ix-msg');
      if (!last) { res.innerHTML = '<p class="ix-meta">Здесь появится результат.</p>'; msg.innerHTML = 'В таблице df восемь заказов. Слева указаны позиции и метки строк. Попробуйте найти заказ на 3 000 ₽.'; $('ix-kind').textContent = 'ничего не выбрано'; $('ix-cells').textContent = ''; $('ix-dot').className = 'dot'; }
      else if (last.unsup) { res.innerHTML = '<p class="ix-unsup">Такое выражение здесь выполнить нельзя</p>'; msg.innerHTML = esc(last.unsup); $('ix-kind').textContent = 'разбор не поддерживает'; $('ix-cells').textContent = ''; $('ix-dot').className = 'dot'; }
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
        const st = !last ? 'выражений пока нет' : `выражение ${src} → ${last.unsup ? 'это выражение выходит за пределы упражнения' : last.err ? `${last.err.type}: ${last.err.msg}` : describeRes(last.v)}`;
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
    aiData: 'Заказы учебного интернет-магазина за январь–март 2026 года (order_id, date, brand — Сова, Кедр, Луч, Бриз, country — BY, RU, KZ, UZ, channel, amount в рублях, status — paid или cancelled); в примерах df — первые восемь заказов, отсортированные по убыванию суммы. Метки строк по порядку: 0, 6, 5, 3, 4, 7, 2, 1.',
    scene,
    widgets: { sel: buildSel },
    code: {
      info: { title: 'Учебная выгрузка: info() и memory_usage()', badge: 'проверено: pandas 3.0.5', lang: 'python',
        code: `import numpy as np
import pandas as pd

# Учебная выгрузка заказов: 100 000 строк, январь–март 2026
rng = np.random.default_rng(9)            # фиксируем начальное состояние генератора
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
        note: "У RangeIndex шаг равен единице, поэтому не требуется хранить отдельную метку для каждой строки. В этом примере индекс занимает около 0,1 КБ. Каждое значение int64 и datetime64[us] занимает восемь байт. Для строк с pyarrow расход зависит от длины текста." },
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
        note: 'В этом замере сравнение со строкой быстрее всего выполнилось для category. Точное соотношение зависит от данных и среды. После удаления пробелов три суммы удалось превратить в числа. Для «н/д» получился пропуск NaN, поэтому результат имеет тип float64.' },
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
        note: 'Первые три подходящих заказа сейчас стоят на позициях 70, 103 и 110. Если вы переставите строки, вычислите позиции заново перед вызовом iloc. Сохранённые ранее позиции могут указать на другие заказы.' },
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
        note: 'Все три способа дали 171 247 920 ₽. Соотношение времени выполнения зависит от среды, числа строк и типов столбцов.' },
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
        note: 'В выводе показана первая строка каждого предупреждения. Сравните сумму отменённого заказа до и после каждого присваивания. В pandas 3.0.5 только вариант D изменяет её в таблице df. В 2.3.3 на df повлиял также вариант B.' },
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
        note: "Первый заказ сделан 28 марта по UTC. В Минске и Ташкенте в этот момент уже 29 марта. Выбор часового пояса определяет, за какой день заказ попадёт в отчёт." }
    },
    questions: {
    q1: { sec: 'select', title: 'Сначала предскажите', q: "Метки строк идут в таком порядке: 0, 6, 5, 3, 4, 7, 2, 1. Что вернёт df.loc[2]?", opts: [["Третью строку сверху с меткой 5"], ["Седьмую строку сверху с меткой 2", 1], ["Ошибку KeyError, потому что метки не отсортированы"], ["Первые две строки с метками 0 и 6"]],
      why: "loc найдёт строку с меткой 2 независимо от порядка строк. В этой таблице её позиция — 6. Третью строку сверху вернёт df.iloc[2], а две первые строки — df.iloc[0:2]." },
    q2: { sec: 'idea', q: "В таблице есть столбцы с датами, брендами и суммами. Что останется общим у трёх Series, если выбрать каждый столбец отдельно?", opts: [["Тип данных у всех трёх столбцов"], ["Индекс с метками исходных строк", 1], ["Один массив, в котором хранятся все даты, бренды и суммы"], ["Только количество строк. Каждый столбец получит новые метки 0, 1, 2…"]],
      why: "Все три Series сохранят метки строк исходной таблицы в том же порядке. Тип данных у каждого столбца свой. Например, у brand он строковый, а у amount — целочисленный." },
    q3: { sec: 'select', q: "У таблицы индекс по умолчанию — от 0 до 99 999. Сколько строк вернут df.loc[0:2] и df.iloc[0:2] соответственно?", opts: [["2 и 2"], ["3 и 2", 1], ["2 и 3"], ["3 и 3"]],
      why: "В срез loc входят метки 0, 1 и 2. В срез iloc входят только позиции 0 и 1. Если метки расположены в другом порядке, число строк в срезе loc может измениться. В таблице из интерактива от метки 0 до метки 2 семь строк, включая обе граничные." },
    q4: { sec: 'idea', q: "В pandas 3 прочитали CSV с помощью read_csv с настройками по умолчанию. Почему у сумм заказов мог оказаться тип str?", opts: [["read_csv всегда читает числа как текст"], ["Среди целых чисел встретилось пустое поле"], ["В столбце есть запись «н/д» или число с пробелом между разрядами, например «1 300»", 1], ["Одна из сумм превышает 2 147 483 647 и поэтому не помещается в int64"]],
      why: "Записи «н/д» и «1 300» при обычных настройках не распознаются как числа. Пустое поле среди целых чисел обычно даёт float64 с пропуском. Предел 2 147 483 647 относится к int32. Чтобы восстановить суммы из текста, удалите пробелы между разрядами и примените pd.to_numeric с errors=\"coerce\"." },
    q5: { sec: 'nuances', q: "В pandas 3 вы сохранили часть таблицы в новую переменную. Что произойдёт, если изменить суммы в этой выборке?", opts: [["Если предупреждения нет, суммы также изменятся в исходной таблице"], ["Если объекты используют одну память, суммы обязательно изменятся и в исходной таблице"], ["Изменятся только суммы в выборке. Для изменения исходной таблицы можно присвоить значения через её loc", 1], ["Это зависит от того, есть ли в dtype пометка view"]],
      why: "Правило Copy-on-Write позволяет менять результат выборки независимо от исходной таблицы. До присваивания они могут использовать общую память. При записи pandas при необходимости скопирует затронутые данные." },
    q6: { sec: 'assign', q: "Как изменятся суммы в исходной таблице df после этого присваивания в pandas 3?", code: 'df[df["status"] == "cancelled"]["amount"] = 0', lang: 'python', opts: [["Суммы отменённых заказов станут нулями"], ["Суммы останутся прежними. pandas выдаст предупреждение ChainedAssignmentError", 1], ["Суммы изменятся, но появится предупреждение SettingWithCopyWarning"], ["Возникнет KeyError, потому что в выборке нет столбца amount"]],
      why: "Первые скобки выбирают отменённые заказы. Следующее присваивание относится к этому промежуточному объекту. Чтобы изменить суммы в df, выполните df.loc[df[\"status\"] == \"cancelled\", \"amount\"] = 0." },
    q7: { sec: 'idea', q: "Из таблицы в интерактиве получили df2 = df.reset_index(drop=True). Какие заказы вернут df2.loc[2] и df2.iloc[2]?", opts: [["Оба выражения вернут заказ на 910 ₽, у которого раньше была метка 2"], ["Оба выражения вернут третий заказ сверху на 2 640 ₽", 1], ["loc вернёт заказ на 910 ₽, iloc — на 2 640 ₽"], ["loc вызовет KeyError, потому что метки 2 больше нет"]],
      why: "reset_index(drop=True) присваивает метки 0, 1, 2… в текущем порядке строк. У третьей строки теперь и метка, и позиция равны 2. Сумма в ней осталась прежней — 2 640 ₽." }
    },
    glossary: {
      dataframe: { t: 'DataFrame', en: 'DataFrame', d: "Двумерная таблица pandas. У всех столбцов общий индекс строк, а у каждого столбца свой тип данных." },
      series: { t: 'Series', en: 'Series', d: "Одномерная последовательность значений с индексом. У Series также может быть имя." },
      index: { t: 'Индекс', en: 'index', d: "Последовательность меток, которыми обозначены строки таблицы или значения Series." },
      label: { t: 'Метка', en: 'label', d: "Значение индекса, например номер заказа. При сортировке метка остаётся у той же строки." },
      position: { t: 'Позиция', en: 'position', d: "Место строки или столбца в текущем порядке. Отсчёт начинается с нуля." },
      dtype: { t: 'Тип данных столбца', en: 'dtype', d: "Свойство, которое показывает тип данных столбца. Например, int64 обозначает целые числа, а str — строки." },
      loc: { t: 'loc', en: 'label-based indexing', d: "Способ выбрать строки и столбцы по меткам. Обе указанные граничные метки входят в срез." },
      iloc: { t: 'iloc', en: 'integer-location indexing', d: "Способ выбрать строки и столбцы по позициям. В срезе правая граница не входит в результат." },
      mask: { t: 'Булева маска', en: 'boolean mask', d: "Набор логических значений. В этом уроке маска — Series с индексом таблицы. При выборе строк df[mask] сохраняет те строки, которым соответствует True." },
      vectorization: { t: 'Векторизация', en: 'vectorization', d: "Способ задать операцию сразу для массива или столбца целиком, без явного цикла по отдельным значениям." },
      object: { t: 'object', en: 'object dtype', d: "Тип столбца, в котором хранятся ссылки на объекты Python. Значения могут быть разных типов." },
      str: { t: 'str', en: 'string dtype', d: "Тип, который pandas 3 по умолчанию присваивает столбцам со строками текста." },
      arrow: { t: 'Arrow', en: 'Apache Arrow', d: "Формат хранения данных по столбцам. Например, для текста Arrow хранит байты строк и их границы в буферах памяти." },
      category: { t: 'Категориальный тип', en: 'category', d: "Тип данных, который хранит перечень категорий и целочисленный код категории для каждого значения в столбце." },
      rangeindex: { t: 'RangeIndex', en: 'RangeIndex', d: "Индекс с равным шагом между целочисленными метками. Для его хранения достаточно начала, конца и шага. По умолчанию метки идут от нуля с шагом один." },
      align: { t: 'Выравнивание по индексу', en: 'index alignment', d: "Сопоставление значений по меткам. Например, при добавлении Series в таблицу pandas ищет для каждой строки значение с той же меткой." },
      chained: { t: 'Цепочка присваивания', en: 'chained assignment', d: "Присваивание через промежуточную выборку, например df[…][…] = значение. В pandas 3 исходная таблица при этом сохраняет прежние значения." },
      view: { t: 'Представление', en: 'view', d: "Объект, который использует ту же область памяти, что и исходный объект." },
      swc: { t: 'SettingWithCopyWarning', en: 'SettingWithCopyWarning', d: "Предупреждение pandas 2 о том, что запись в результат выборки может затронуть только копию. В pandas 3 это предупреждение убрали." },
      cow: { t: 'Copy-on-Write', en: 'Copy-on-Write', d: "В pandas 3 результат выборки можно изменять независимо от исходной таблицы. Данные, которые объекты пока используют совместно, pandas копирует при необходимости." },
      naive: { t: 'Наивное время', en: 'tz-naive datetime', d: "Дата и время без сведений о часовом поясе. Чтобы однозначно определить момент события, нужно знать исходный пояс." },
      polars: { t: 'Polars', en: 'Polars', d: "Библиотека для работы с таблицами. Позволяет сначала построить план запроса, а затем выполнить вычисления." },
      duckdb: { t: 'DuckDB', en: 'DuckDB', d: "Аналитическая база данных, которая выполняет SQL-запросы к таблицам и файлам, в том числе CSV и Parquet." }
    },
    materials: [
      ['da-2-1-dataframe-inside.md', 'Текст урока, примеры кода, вопросы и глоссарий в Markdown'],
      ['orders_2026q1.csv', '100 000 учебных заказов за январь–март 2026 года'],
      ['dataframe_inside.ipynb', 'Блоки кода страницы и упражнения на loc, iloc, маски и типы'],
      ['dataframe_inside_solutions.ipynb', 'Решения пяти упражнений с пояснениями'],
      ['loc_iloc_drill.py', '30 примеров выбора строк и столбцов из учебной таблицы с результатами для pandas 3']
    ],
    prompts: [
      ['Проверка понимания', 'Задай по одному пять вопросов о выборе по меткам и позициям. Используй таблицу заказов из урока. После каждого ответа проверь моё объяснение. Если я ошибусь, покажи на примере одной строки, в чём ошибка, и укажи источник.'],
      ['Разбор выражений', 'Я пришлю выражение для таблицы из урока. Метки строк сверху вниз: 0, 6, 5, 3, 4, 7, 2, 1. Предложи мне назвать метки и суммы заказов, которые попадут в результат. Затем разбери выражение в pandas 3.'],
      ['Переход на pandas 3', 'Я пришлю код, написанный для pandas 2. Разбери каждое присваивание. Какой объект изменится в pandas 3? Если нужно обновить исходную таблицу, покажи, как записать условие и имя столбца через loc.']
    ]
  };
})();
