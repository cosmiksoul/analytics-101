/* Страница 2.2 · Загрузка из файлов, баз и API */
(() => {
  /* ===================== Учебные данные =====================
     Заказы интернет-магазина за I квартал 2026, сгенерированы в песочнице с random.Random(22) (gen_data.py):
     CRM — 8 заказов в orders_crm.csv (cp1251, «;», десятичная запятая, даты дд.мм.гггг, текст в одинарных кавычках);
     база сайта — 15 заказов, 3 из них за декабрь 2025; API приложения — 10 заказов, по 4 на странице. */
  /* <frag> */
  const FRAG = "order_id;date;brand;country;channel;amount;status;comment\n5001;04.01.2026;Кедр;UZ;рассылка;1569,80;paid;\n5002;05.01.2026;Сова;KZ;реклама;11349,80;paid;'позвонить; после 18:00'\n5003;06.01.2026;Сова;BY;рассылка;8857,20;paid;\n5004;10.01.2026;Луч;RU;реклама;8491,20;cancelled;\n5005;02.02.2026;Кедр;KZ;реклама;5150,40;paid;\n5006;03.02.2026;Луч;BY;реклама;6895,10;paid;'оставить у двери'\n5007;02.03.2026;Бриз;UZ;рассылка;5145,90;paid;\n5008;11.03.2026;Луч;UZ;рассылка;960,60;paid;\n";   // orders_crm.csv, расшифрованный из cp1251
  /* </frag> */
  const COLS = ['order_id', 'date', 'brand', 'country', 'channel', 'amount', 'status'];

  /* <csvsim> */
  /* Учебная модель pandas.read_csv (движок C, pandas 3.0.5): токенизация, неявный индекс, выбор столбцов,
     вывод типов, dtype, parse_dates. Сверена с настоящим read_csv во всех сочетаниях аргументов интерактива. */
  const NA = new Set(['', '#N/A', '#N/A N/A', '#NA', '-1.#IND', '-1.#QNAN', '-NaN', '-nan', '1.#IND', '1.#QNAN', '<NA>', 'N/A', 'NA', 'NULL', 'NaN', 'None', 'n/a', 'nan', 'null']);
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function tokenize(text, sep, q) {
    const rows = []; let row = [], f = '', st = 0, line = 1, start = 1, any = false;
    const endField = () => { row.push(f); f = ''; };
    const endLine = () => { if (any || row.length) { endField(); rows.push({ f: row, line: start }); } row = []; f = ''; any = false; st = 0; };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '\r' && st !== 2) { if (text[i + 1] === '\n') continue; }
      if (st === 2) { // внутри кавычек
        if (c === q) st = 3; else { f += c; if (c === '\n') line++; }
        continue;
      }
      if (c === '\n' || c === '\r') { endLine(); line++; start = line; continue; }
      if (st === 0) { any = true; if (c === q) st = 2; else if (c === sep) endField(); else { f += c; st = 1; } }
      else if (st === 1) { if (c === sep) { endField(); st = 0; } else f += c; }
      else if (st === 3) { if (c === q) { f += q; st = 2; } else if (c === sep) { endField(); st = 0; } else { f += c; st = 1; } }
    }
    if (st === 2) rows.eof = rows.length; // кавычка не закрылась до конца файла
    endLine();
    return rows;
  }
  // целое: пробелы по краям, знак, цифры; разделитель тысяч допускается после первой цифры
  function toInt(s, th) {
    const t = s.trim(); const re = th ? new RegExp(`^[+-]?\\d(?:\\d|${reEsc(th)})*$`) : /^[+-]?\d+$/;
    if (!re.test(t)) return null;
    const n = Number(th ? t.split(th).join('') : t); return Number.isSafeInteger(n) ? n : null;
  }
  function toFloat(s, dec, th) {
    let t = s.trim(); const low = t.toLowerCase();
    if (/^[+-]?(inf|infinity)$/.test(low)) return low[0] === '-' ? -Infinity : Infinity;
    if (th) t = t.replace(new RegExp(`(\\d)${reEsc(th)}+`, 'g'), '$1');
    const d = reEsc(dec);
    if (!new RegExp(`^[+-]?(?:\\d+(?:${d}\\d*)?|${d}\\d+)(?:[eE][+-]?\\d+)?$`).test(t)) return null;
    return Number(t.replace(dec, '.'));
  }
  const pyFloat = x => Number.isNaN(x) ? 'NaN' : x === Infinity ? 'inf' : x === -Infinity ? '-inf' : Number.isInteger(x) && Math.abs(x) < 1e16 ? x.toFixed(1) : String(x).replace(/e\+?/, 'e+').replace('e+-', 'e-');
  const pyParse = v => { const t = v.trim().toLowerCase(); if (/^[+-]?(inf|infinity|nan)$/.test(t)) return t.includes('nan') ? NaN : t[0] === '-' ? -Infinity : Infinity; return /^[+-]?(?:\d(?:_?\d)*(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:e[+-]?\d(?:_?\d)*)?$/.test(t) ? Number(t.replace(/_/g, '')) : null; };
  const pyRepr = v => (v.includes("'") && !v.includes('"') ? `"${v}"` : `'${v.replace(/'/g, "\\'")}'`);
  // догадка о формате даты по первому значению — как guess_datetime_format с dateutil
  function guessFmt(v, dayfirst) {
    let m = /^(\d{1,2})([./-])(\d{1,2})\2(\d{4})$/.exec(v);
    if (m) { const a = +m[1], b = +m[3]; const df = dayfirst ? !(a <= 12 && b > 12) : (a > 12 && b <= 12); return { re: new RegExp(`^(\\d{1,2})${reEsc(m[2])}(\\d{1,2})${reEsc(m[2])}(\\d{4})$`), d: df ? 1 : 2, mo: df ? 2 : 1, y: 3, fmt: df ? `%d${m[2]}%m${m[2]}%Y` : `%m${m[2]}%d${m[2]}%Y` }; }
    m = /^(\d{4})([./-])(\d{1,2})\2(\d{1,2})$/.exec(v);
    if (m) { const a = +m[3], b = +m[4]; const df = dayfirst ? b <= 12 : a > 12; return { re: new RegExp(`^(\\d{4})${reEsc(m[2])}(\\d{1,2})${reEsc(m[2])}(\\d{1,2})$`), y: 1, mo: df ? 3 : 2, d: df ? 2 : 3 }; }
    return null;
  }
  function fmtRule(fmt) {
    if (fmt === '%d.%m.%Y') return { re: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, d: 1, mo: 2, y: 3 };
    return null;
  }
  function parseDates(vals, rule) {
    if (!rule) return null;
    const out = [];
    for (const v of vals) {
      if (v === null) { out.push('NaT'); continue; }
      const m = rule.re.exec(v.trim()); if (!m) return null;
      const y = +m[rule.y], mo = +m[rule.mo], d = +m[rule.d];
      const dt = new Date(Date.UTC(y, mo - 1, d));
      if (mo < 1 || mo > 12 || dt.getUTCDate() !== d || dt.getUTCMonth() !== mo - 1) return null;
      out.push(`${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return out;
  }
  // вывод типа столбца: int64 → float64 → bool → str (строки в pandas 3 — dtype str)
  function infer(raw, o) {
    const vals = raw.map(v => (v === undefined || NA.has(v) ? null : v));
    const nn = vals.filter(v => v !== null);
    if (nn.length && nn.length === vals.length) { const ints = nn.map(v => toInt(v, o.thousands)); if (ints.every(x => x !== null)) return { dtype: 'int64', vals: ints.map(String) }; }
    const fl = vals.map(v => (v === null ? NaN : toFloat(v, o.decimal, o.thousands)));
    if (fl.every(x => x !== null)) return { dtype: 'float64', vals: fl.map(pyFloat) };
    const B = { True: 'True', TRUE: 'True', true: 'True', False: 'False', FALSE: 'False', false: 'False' };
    if (nn.length === vals.length && nn.every(v => B[v])) return { dtype: 'bool', vals: nn.map(v => B[v]) };
    return { dtype: 'str', vals: vals.map(v => (v === null ? 'NaN' : v)) };
  }
  function readCsv(text, o) {
    const E = (t, m) => ({ error: `${t}: ${m}` });
    const rows = tokenize(text, o.sep, o.quotechar);
    if (rows.eof !== undefined) return E('ParserError', `Error tokenizing data. C error: EOF inside string starting at row ${rows.eof}`);
    if (!rows.length) return E('EmptyDataError', 'No columns to parse from file');
    const head = rows[0].f, data = rows.slice(1), H = head.length;
    const seen = {}; const names = head.map((h, i) => { let n = h === '' ? `Unnamed: ${i}` : h; if (seen[n] !== undefined) { seen[n]++; n = `${n}.${seen[n]}`; } else seen[n] = 0; return n; });
    const F1 = data.length ? data[0].f.length : H;
    let lead = Math.max(0, F1 - H);
    const U = o.usecols;
    if (U && lead > 0 && U.length > H) return E('ValueError', 'Number of passed names did not match number of header fields in the file');
    if (U && lead > 0 && U.length === H) lead = 0;
    let pick = names.map((n, i) => i);
    if (U) { const miss = U.filter(n => !names.includes(n)); if (miss.length) return E('ValueError', `Usecols do not match columns, columns expected but not found: [${miss.map(n => `'${n}'`).join(', ')}]`); pick = pick.filter(i => U.includes(names[i])); }
    const cols = pick.map(i => names[i]);
    if (o.parse_dates) for (const c of o.parse_dates) if (!cols.includes(c)) return E('ValueError', `Missing column provided to 'parse_dates': '${c}'`);
    if (!U) { const ex = H + lead; for (const r of data) if (r.f.length > ex) return E('ParserError', `Error tokenizing data. C error: Expected ${ex} fields in line ${r.line}, saw ${r.f.length}`); }
    const out = { cols, dtypes: [], index: null, cells: [] };
    if (lead > 0) {
      const lv = []; for (let j = 0; j < lead; j++) lv.push(infer(data.map(r => r.f[j]), o));
      out.index = lead === 1 ? lv[0].vals : data.map((r, k) => `(${lv.map(l => (l.vals[k] === 'NaN' ? 'nan' : l.dtype === 'str' ? pyRepr(l.vals[k]) : l.vals[k])).join(', ')})`);
    }
    for (const i of pick) {
      const raw = data.map(r => r.f[i + lead]), name = names[i];
      let col;
      if (o.parse_dates && o.parse_dates.includes(name)) {
        const s = raw.map(v => (v === undefined || NA.has(v) ? null : v)), first = s.find(v => v !== null);
        const rule = o.date_format ? fmtRule(o.date_format) : first !== undefined ? guessFmt(first.trim(), !!o.dayfirst) : null;
        const d = parseDates(s, rule);
        col = d ? { dtype: 'datetime64[us]', vals: d, fmt: rule.fmt } : { dtype: 'str', vals: s.map(v => (v === null ? 'NaN' : v)), failed: true };
      } else if (o.dtype && o.dtype[name] === 'float64') {
        const s = raw.map(v => (v === undefined || NA.has(v) ? null : v));
        let xs = s.map(v => (v === null ? NaN : toFloat(v, o.decimal, o.thousands)));
        if (xs.some(x => x === null)) { // движок C не справился — pandas повторяет через float() Питона и падает на первом неподходящем значении
          xs = s.map(v => (v === null ? NaN : pyParse(v)));
          const k = xs.findIndex(x => x === null); if (k >= 0) return E('ValueError', `could not convert string to float: ${pyRepr(s[k])}`);
        }
        col = { dtype: 'float64', vals: xs.map(pyFloat) };
      } else col = infer(raw, o);
      out.dtypes.push(col.dtype); out.cells.push(col);
    }
    out.rows = data.map((r, k) => out.cells.map(c => c.vals[k]));
    return out;
  }
  /* </csvsim> */

  /* ===================== Сцена: заказы из трёх источников ===================== */
  const C = { crm: '#36b8a6', site: '#6fa2ea', app: '#f0a247', bad: '#f2756a' };
  const N = { crm: 8, site: 12, dec: 3, app: 10 };
  const TYPES = ['int64', 'datetime64[us]', 'str', 'str', 'str', 'float64', 'str'];
  const RAW2 = ['int64', 'str', 'str', 'str', 'str', 'str', 'str']; // после чтения без decimal и parse_dates
  const ERR_UTF = "UnicodeDecodeError: 'utf-8' codec can't decode byte 0xca in position 74: invalid continuation byte"; // настоящее сообщение из песочницы
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const ease = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  // поток из n точек: точка i выходит в момент a + i·step и идёт до конца трубы за travel; stopAt — точка останавливается у фильтра
  const flow = (p, n, a, b, opts = {}) => {
    const out = [], span = b - a, travel = opts.travel || Math.min(.45, span * .6), step = n > 1 ? (span - travel) / (n - 1) : 0;
    let si = 0;   // остановленные точки встают в очередь перед фильтром
    for (let i = 0; i < n; i++) {
      let x = clamp01((p - a - i * step) / travel), stopped = false;
      if (opts.stop && opts.stop(i)) { const cap = .24 - si * .03; si++; x = Math.min(x, cap); stopped = x >= cap; }
      out.push({ x, c: opts.cls ? opts.cls(i) : '', stop: stopped });
    }
    return out;
  };
  const passed = dots => dots.filter(d => !d.stop && d.x >= 1).length;

  function stateAt(k, p) {
    const S = { k, act: null, gate: { csv: ['idle', 'encoding', '?'], sql: ['idle', 'params', '?'], api: ['idle', '30 запр./мин', '?'] },
      dots: { csv: [], sql: [], api: [] }, fill: { crm: 0, site: 0, dec: 0, app: 0 }, types: null, cmd: [], call: null,
      src: 0, req: 0, bytes: false, bars: 'idle', pages: ['', '', ''], files: false, mob: ['csv', 'sql', 'api', 'df'], extra: '' };
    const done = { crm: () => { S.fill.crm = N.crm; S.gate.csv = ['ok', 'encoding', 'cp1251 ✓']; S.src = 1; },
      site: () => { S.fill.site = N.site; S.gate.sql = ['ok', 'params', ':start :end ✓']; S.src = 2; S.bars = 'cut'; },
      app: () => { S.fill.app = N.app; S.gate.api = ['ok', '30 запр./мин', '4 запроса ✓']; S.src = 3; S.pages = ['ok', 'ok', 'ok']; S.req = 4; } };
    if (k >= 3) { done.crm(); S.types = TYPES; }
    if (k >= 6) done.site();
    if (k >= 9) done.app();
    switch (k) {
      case 0:
        S.cmd = [['c', '# цель: заказы I квартала из трёх источников → одна таблица'], ['c', '# столбцы: order_id, date, brand, country, channel, amount, status']];
        if (p > .4) S.call = ['df', 'цель: 30 заказов, 7 столбцов']; break;
      case 1: {
        S.act = 'csv'; S.mob = ['csv', 'cmd', 'df']; S.bytes = true;
        S.dots.csv = flow(p, N.crm, .05, .6, { stop: () => true });
        S.cmd = [['i', '>>> pd.read_csv("orders_crm.csv", sep=";")']];
        if (p > .55) { S.gate.csv = ['bad', 'encoding', 'utf-8 ✗']; S.cmd.push(['e', ERR_UTF]); S.call = ['csv', 'байт 0xCA — «К» в cp1251', 1]; }
        else S.gate.csv = ['idle', 'encoding', 'utf-8 ?'];
        break;
      }
      case 2:
        S.act = 'csv'; S.mob = ['csv', 'cmd', 'df']; S.gate.csv = ['ok', 'encoding', 'cp1251 ✓'];
        S.dots.csv = flow(p, N.crm, .05, .8); S.fill.crm = passed(S.dots.csv); S.types = RAW2; S.src = S.fill.crm === N.crm ? 1 : 0;
        S.cmd = [['i', '>>> crm = pd.read_csv(path, encoding="cp1251", sep=";",'], ['i', '...                   quotechar="\'", usecols=COLS)']];
        if (p > .75) { S.cmd.push(['c', '# amount: str ("1569,80"), date: str ("04.01.2026")']); S.call = ['df', 'amount и date — строки', 1]; }
        break;
      case 3:
        S.act = 'csv'; S.mob = ['csv', 'cmd', 'df']; S.types = p > .45 ? TYPES : RAW2;
        S.cmd = [['i', '>>> crm = pd.read_csv(path, …, decimal=",", dtype=TYPES,'], ['i', '...     parse_dates=["date"], date_format="%d.%m.%Y")']];
        if (p > .45) { S.cmd.push(['c', '# amount: float64 (1569.8), date: datetime64[us] (2026-01-04)']); S.call = ['df', '1569,80 → 1569.8; 04.01 → 4 января']; }
        break;
      case 4: {
        S.act = 'sql'; S.mob = ['sql', 'cmd', 'df']; S.bars = 'all';
        S.dots.sql = flow(p, N.site + N.dec, .05, .8, { cls: i => (i < N.dec ? 'bad' : '') });
        const got = passed(S.dots.sql); S.fill.dec = Math.min(N.dec, got); S.fill.site = Math.max(0, got - N.dec);
        S.gate.sql = ['bad', 'params', 'с декабря ✗']; S.extra = got > 0 ? 'bad' : '';
        S.cmd = [['i', '>>> pd.read_sql(query, engine,'], ['i', '...     params={"start": "2025-12-01", "end": "2026-04-01"})']];
        if (p > .8) S.cmd.push(['e', '# 15 строк: декабрь 2025 тоже здесь']);
        if (p > .45) S.call = ['sql', 'начальная дата на месяц раньше', 1];
        break;
      }
      case 5: {
        S.act = 'sql'; S.mob = ['sql', 'cmd', 'df']; S.bars = p > .35 ? 'cut' : 'all';
        S.dots.sql = flow(p, N.site + N.dec, .05, .8, { cls: i => (i < N.dec ? 'bad' : ''), stop: i => i < N.dec });
        S.fill.site = passed(S.dots.sql); S.gate.sql = ['ok', 'params', ':start :end ✓']; S.src = S.fill.site === N.site ? 2 : 1;
        S.cmd = [['i', '>>> pd.read_sql(text("… WHERE order_date >= :start AND order_date < :end"),'], ['i', '...     engine, params={"start": "2026-01-01", "end": "2026-04-01"})']];
        if (p > .8) S.cmd.push(['c', '# 12 строк, все из I квартала']);
        if (p > .5) S.call = ['sql', 'только I квартал'];
        break;
      }
      case 6: {
        S.act = 'api'; S.mob = ['api', 'cmd', 'df']; S.req = p > .1 ? 1 : 0; S.pages = [p > .3 ? 'ok' : 'go', '', ''];
        S.dots.api = flow(p, 4, .3, .85); S.fill.app = passed(S.dots.api);
        S.gate.api = p > .25 ? ['ok', '30 запр./мин', '200 OK'] : ['idle', '30 запр./мин', 'запрос…'];
        S.cmd = [['i', '>>> session.get(URL, params={"page": 1, "per_page": 4}, timeout=10)']];
        if (p > .25) S.cmd.push(['o', '<Response [200]>   items: 4, next_page: 2']);
        if (p > .55) S.call = ['api', 'дальше страница 2'];
        break;
      }
      case 7: {
        S.act = 'api'; S.mob = ['api', 'cmd', 'df']; S.fill.app = 4; S.req = p > .1 ? 2 : 1; S.pages = ['ok', p > .7 ? 'ok' : 'err', ''];
        S.cmd = [['i', '>>> session.get(URL, params={"page": 2, …})   # сразу, без паузы'], ['e', '<Response [429]>   Retry-After: 2']];
        if (p < .3) { S.gate.api = ['bad', '30 запр./мин', '429']; S.call = ['api', 'слишком часто: 429', 1]; }
        else if (p < .7) { S.gate.api = ['warn', '30 запр./мин', `ждём ${p < .5 ? 2 : 1} с`]; S.call = ['api', 'Retry-After: 2 — ждём', 1]; S.cmd.push(['c', '# ждём 2 с и повторяем тот же запрос']); }
        else { S.req = 3; S.gate.api = ['ok', '30 запр./мин', '200 OK']; S.cmd.push(['c', '# ждём 2 с и повторяем тот же запрос'], ['o', '<Response [200]>   items: 4, next_page: 3']); S.call = ['api', 'страница 2 получена'];
          S.dots.api = flow(p, 4, .7, 1, { travel: .2 }); S.fill.app = 4 + passed(S.dots.api); }
        break;
      }
      case 8: {
        S.act = 'api'; S.mob = ['api', 'cmd', 'df']; S.fill.app = 8; S.req = p > .3 ? 4 : 3; S.pages = ['ok', 'ok', p > .4 ? 'ok' : (p > .3 ? 'go' : '')];
        S.gate.api = p > .35 ? ['ok', '30 запр./мин', '200 OK'] : ['warn', '30 запр./мин', 'пауза 2 с'];
        S.dots.api = flow(p, 2, .4, .85); S.fill.app = 8 + passed(S.dots.api); if (S.fill.app === N.app) S.src = 3;
        S.cmd = [['i', '>>> time.sleep(PAUSE)   # 60 / 30 = 2 с'], ['i', '>>> session.get(URL, params={"page": 3, "per_page": 4}, timeout=10)']];
        if (p > .35) S.cmd.push(['o', '<Response [200]>   items: 2, next_page: None']);
        if (p > .7) { S.cmd.push(['c', '# next_page = None → цикл while закончился']); S.call = ['api', 'next_page: null — конец']; }
        break;
      }
      case 9:
        S.mob = ['cmd', 'df'];
        S.cmd = [['i', '>>> app = pd.json_normalize(items).rename(columns={"brand.name": "brand", …})'], ['i', '>>> orders = pd.concat([crm, site, app], ignore_index=True)']];
        if (p > .45) { S.cmd.push(['c', '# 30 строк × 7 столбцов, у одноимённых столбцов один тип']); S.call = ['df', 'brand.name → brand, типы совпали']; }
        break;
      case 10:
        S.mob = ['cmd', 'df']; S.files = p > .3;
        S.cmd = [['i', '>>> orders.to_parquet("orders_q1.parquet", index=False)'], ['i', '>>> orders.to_csv("orders_q1.csv", index=False, lineterminator="\\n")']];
        if (p > .3) S.cmd.push(['i', '>>> print(pd.read_parquet("orders_q1.parquet")["date"].dtype)'], ['o', 'datetime64[us]']);
        if (p > .6) { S.cmd.push(['i', '>>> print(pd.read_csv("orders_q1.csv")["date"].dtype)'], ['e', 'str']); S.call = ['df', 'после read_csv дата имеет тип str', 1]; }
        break;
    }
    S.rows = S.fill.crm + S.fill.site + S.fill.dec + S.fill.app;
    return S;
  }

  const scene = {
    parts: [{ n: '01', name: 'Цель', s: [0] }, { n: '02', name: 'CSV', s: [1, 2, 3] }, { n: '03', name: 'База', s: [4, 5] }, { n: '04', name: 'API', s: [6, 7, 8] }, { n: '05', name: 'Таблица', s: [9, 10] }],
    steps: [
      { title: "Заказы из трёх источников", dur: 4200, body: "<p>Заказы за&nbsp;I&nbsp;квартал хранятся в&nbsp;выгрузке <b>CRM</b>, в&nbsp;базе сайта <b>PostgreSQL</b> и&nbsp;в&nbsp;мобильном приложении. Приложение выдаёт их через <b>API</b>.</p><p>Соберём все 30&nbsp;заказов в&nbsp;одну таблицу. У&nbsp;каждого заказа должно быть семь полей от&nbsp;номера до&nbsp;статуса.</p>" },
      { title: "Файл CRM записан в cp1251", dur: 3600, body: "<p>По&nbsp;умолчанию <b>read_csv</b> читает файл в&nbsp;кодировке UTF-8. Но&nbsp;CRM записала его в&nbsp;<b>cp1251</b>. В&nbsp;этой кодировке слову «Кедр» соответствует последовательность байтов CA E5 E4 F0.</p><p>В&nbsp;UTF-8 после начального байта CA должен идти байт продолжения. E5 для этого не&nbsp;подходит, поэтому чтение прерывается с&nbsp;ошибкой <b>UnicodeDecodeError</b>.</p>" },
      { title: "Суммы и даты пока записаны текстом", dur: 3800, body: "<p>Укажем кодировку <b>cp1251</b>, точку с&nbsp;запятой как разделитель и&nbsp;одинарные кавычки. Теперь все восемь записей прочитаны.</p><p>При стандартных настройках pandas оставляет «1569,80» и&nbsp;«04.01.2026» строками типа <b>str</b>. Чтобы сложить суммы и&nbsp;отсортировать заказы по&nbsp;дате, нужны другие типы.</p>" },
      { title: "Указываем формат суммы и даты", dur: 3600, body: "<p>Аргумент <b>decimal=\",\"</b> указывает на&nbsp;десятичную запятую. Сумма «1569,80» становится числом 1569.8. Нужные типы столбцов заданы в&nbsp;<b>dtype</b>.</p><p>Для <b>date</b> используем <b>parse_dates</b> с&nbsp;форматом <b>%d.%m.%Y</b>. Теперь 04.01.2026 читается как 4&nbsp;января. Без заданного формата получалось 1&nbsp;апреля.</p>" },
      { title: "В выборку попал декабрь", dur: 4000, body: "<p>Запрос к&nbsp;базе отбирает заказы между двумя датами. Но&nbsp;начальную дату указали как <b>1&nbsp;декабря 2025&nbsp;года</b>.</p><p>База вернула 15&nbsp;заказов. Три декабрьских заказа оказались в&nbsp;выборке вместе с&nbsp;двенадцатью заказами за&nbsp;I&nbsp;квартал.</p>" },
      { title: "Выбираем только первый квартал", dur: 3800, body: "<p>В&nbsp;тексте запроса стоят метки <b>:start</b> и&nbsp;<b>:end</b>. Даты передаём отдельно в&nbsp;словаре <b>params</b>. Начальная дата входит в&nbsp;период, конечная&nbsp;— уже нет.</p><p>Укажем 1&nbsp;января и&nbsp;1&nbsp;апреля 2026&nbsp;года. Теперь в&nbsp;результате только 12&nbsp;заказов за&nbsp;первый квартал.</p>" },
      { title: "На первой странице четыре заказа", dur: 3600, body: "<p>Клиент запрашивает <b>page=1</b>. Ключ доступа он читает из&nbsp;переменной окружения и&nbsp;передаёт в&nbsp;заголовке <b>Authorization</b>.</p><p>Сервер возвращает код&nbsp;200, четыре записи и&nbsp;номер следующей страницы в&nbsp;поле <b>next_page</b>. Следующий запрос будет к&nbsp;странице&nbsp;2.</p>" },
      { title: "Повторный запрос после ответа 429", dur: 4200, body: "<p>Клиент сразу запросил вторую страницу, хотя учебный сервер принимает один запрос в&nbsp;две секунды. В&nbsp;ответ пришёл код <b>429 Too Many Requests</b> и&nbsp;заголовок <b>Retry-After: 2</b>.</p><p>Клиент ждёт две секунды и&nbsp;повторяет запрос второй страницы. На&nbsp;этот раз сервер возвращает код&nbsp;200 и&nbsp;ещё четыре записи.</p>" },
      { title: "Третья страница оказалась последней", dur: 3800, body: "<p>Теперь клиент выдерживает паузу в&nbsp;две секунды перед запросом третьей страницы. Сервер возвращает последние два заказа.</p><p>В&nbsp;поле <b>next_page</b> теперь стоит <b>null</b>. В&nbsp;Python это <b>None</b>, поэтому цикл завершается.</p>" },
      { title: "Объединяем три таблицы", dur: 4000, body: "<p>В&nbsp;ответе API название бренда хранится в&nbsp;поле <b>name</b> объекта <b>brand</b>, а&nbsp;сумма&nbsp;— в&nbsp;поле <b>amount</b> объекта <b>total</b>. Функция <b>json_normalize</b> создаёт столбцы <b>brand.name</b> и&nbsp;<b>total.amount</b>.</p><p>Переименуем столбцы и&nbsp;сверим их типы. Функция <b>pd.concat</b> объединит 8&nbsp;заказов CRM, 12&nbsp;заказов сайта и&nbsp;10&nbsp;заказов приложения.</p>" },
      { title: "Parquet сохраняет тип даты", dur: 4200, next: 'Читать страницу', body: "<p>Запишем таблицу в&nbsp;двух форматах и&nbsp;снова прочитаем. <b>Parquet</b> сохраняет схему вместе с&nbsp;данными. Столбец <b>date</b> по-прежнему имеет тип <b>datetime64</b>.</p><p>В&nbsp;<b>CSV</b> даты записаны текстом. При чтении со&nbsp;стандартными настройками pandas возвращает столбец типа <b>str</b>.</p>" }
    ],
    hud: [{ id: 'rows', label: 'Строк в таблице' }, { id: 'src', label: 'Источников' }, { id: 'req', label: 'Запросов к API' }],
    legend: `<span><i class="sq" style="background:${C.crm}"></i>CRM</span><span><i class="sq" style="background:${C.site}"></i>база сайта</span><span><i class="sq" style="background:${C.app}"></i>API</span><span><i class="sq" style="background:${C.bad}"></i>заказы за декабрь</span>`,
    info: 'ЗАКАЗЫ I КВАРТАЛА',
    aiNote: "В таблицу за I квартал 2026 года входят 8 заказов из CRM, 12 из базы сайта и 10 из приложения. CRM записывает CSV в cp1251 с точкой с запятой между полями. Суммы содержат десятичную запятую, даты записаны в формате %d.%m.%Y. В SQL-запросе начало и конец периода передаются через params. Если начать отсчёт с декабря, в результат попадут 15 заказов сайта вместо 12. API возвращает заказы тремя страницами по 4, 4 и 2 записи. При ответе 429 клиент ждёт время из Retry-After и повторяет запрос той же страницы. На последней странице next_page имеет значение null. После объединения таблиц Parquet сохраняет тип дат. При чтении CSV без parse_dates даты остаются текстом.",
    mount(root, api) {
      const { esc } = api;
      let sig = '';
      const SQUARES = 30;
      return {
        render(k, p) {
          const S = stateAt(k, p);
          api.hud('rows', String(S.rows), S.fill.dec ? `${S.fill.dec} лишних` : 'из 30');
          api.hud('src', String(S.src), 'из 3');
          api.hud('req', String(S.req), 'лимит 30/мин');
          const shape = Object.fromEntries(Object.entries(S.dots).map(([key, a]) => [key, a.map(d => d.c + (d.stop ? 's' : ''))]));
          const key = JSON.stringify([k, S.gate, S.fill, S.types, S.cmd, S.call, S.src, S.bars, S.pages, S.files, S.mob, S.extra, S.bytes, shape]);
          if (key !== sig) {
            sig = key;
            const call = id => S.call && S.call[0] === id ? `<span class="pp-call${S.call[2] ? ' warn' : ''}">${esc(S.call[1])}</span>` : '';
            const mh = id => S.mob.includes(id) ? '' : ' mh';
            const row = (id, src, gate) => `<div class="pp-row r-${id}${S.act === id ? ' on' : S.act ? ' dim' : ''}${mh(id)}">${src}<div class="pp-pipe"><i class="pp-line"></i><div class="pp-gate ${gate[0]}"><small>${esc(gate[1])}</small><b>${esc(gate[2])}</b></div><div class="pp-dots">${S.dots[id].map(d => `<i class="pp-dot ${d.c}${d.stop ? ' stop' : ''}"></i>`).join('')}</div>${call(id)}</div></div>`;
            const csvLine = S.bytes ? '5001;04.01.2026;<em>CA E5 E4 F0</em>;UZ;…;1569,80' : '5001;04.01.2026;Кедр;UZ;…;1569,80';
            const csv = `<div class="pp-src"><div class="pp-hd"><span>orders_crm.csv</span><span class="pp-tag">CRM</span></div><div class="pp-raw"><div>order_id;date;brand;…;amount</div><div>${csvLine}</div><div>5002;…;'позвонить; после 18:00'</div></div></div>`;
            const bar = (m, n, dec) => `<span class="pp-bar${dec ? ` dec ${S.bars}` : ''}"><i style="height:${n * 5 + 4}px"></i><small>${m}</small></span>`;
            const sql = `<div class="pp-src"><div class="pp-hd"><span>shop.orders</span><span class="pp-tag">PostgreSQL</span></div><div class="pp-bars">${bar('дек', 3, 1)}${bar('янв', 3)}${bar('фев', 6)}${bar('мар', 3)}<span class="pp-per">I квартал</span></div></div>`;
            const pg = (n, c, st) => `<span class="pp-pg ${st}">стр. ${n}<b>${c}</b></span>`;
            const apiS = `<div class="pp-src"><div class="pp-hd"><span>GET /v1/orders</span><span class="pp-tag">JSON</span></div><div class="pp-pgs">${pg(1, 4, S.pages[0])}${pg(2, 4, S.pages[1])}${pg(3, 2, S.pages[2])}</div><div class="pp-raw"><div>{"id": 9001, "brand": {"name": …}}</div></div></div>`;
            const cmd = `<div class="pp-cmd${mh('cmd')}">${S.cmd.map(([t, s]) => `<div class="${t}">${esc(s)}</div>`).join('')}</div>`;
            const types = COLS.map((c, i) => { const t = S.types ? S.types[i] : '—'; const ok = !S.types || t === TYPES[i]; return `<div class="pp-col"><b>${c}</b><span class="${S.types ? (ok ? 'ok' : 'bad') : ''}">${t}</span></div>`; }).join('');
            // Квадрат обозначает заказ, цвет указывает на источник. Красным выделены декабрьские заказы.
            const seq = [].concat(Array(S.fill.crm).fill('crm'), Array(S.fill.dec).fill('bad'), Array(S.fill.site).fill('site'), Array(S.fill.app).fill('app'));
            const cells = Array.from({ length: SQUARES }, (_, i) => `<i class="${seq[i] || ''}"></i>`);
            const files = S.files ? `<div class="pp-files"><span class="ok">orders_q1.parquet<b>date: datetime64</b></span><span class="bad">orders_q1.csv<b>date: str</b></span></div>` : '';
            const df = `<div class="pp-df${mh('df')}"><div class="pp-hd"><span>df</span><span class="pp-tag">${S.rows} ${api.plural(S.rows, ['строка', 'строки', 'строк'])}</span></div><div class="pp-cols">${types}</div><div class="pp-grid${S.extra ? ' over' : ''}">${cells.join('')}</div>${files}${call('df')}</div>`;
            root.innerHTML = `<div class="pp">${'<div class="pp-l">' + row('csv', csv, S.gate.csv) + row('sql', sql, S.gate.sql) + row('api', apiS, S.gate.api) + cmd + '</div>'}${df}</div>`;
          }
          // точки двигаются каждый кадр без перерисовки разметки
          for (const id of ['csv', 'sql', 'api']) {
            const els = root.querySelectorAll(`.r-${id} .pp-dot`);
            S.dots[id].forEach((d, i) => { const el = els[i]; if (!el) return; el.style.left = `${(d.x * 100).toFixed(2)}%`; el.style.opacity = d.x <= 0 || (d.x >= 1 && !d.stop) ? '0' : d.stop ? '.8' : '1'; });
          }
        }
      };
    }
  };

  /* ===================== Интерактив «Разбери CSV» ===================== */
  const ARGS = [
    { k: 'sep', o: [[',', '","'], [';', '";"'], ['\t', '"\\t"']] },
    { k: 'quotechar', o: [['"', '\'"\''], ["'", '"\'"']] },
    { k: 'decimal', o: [['.', '"."'], [',', '","']] },
    { k: 'thousands', o: [[null, 'None'], [',', '","']] },
    { k: 'dates', name: 'даты', o: [[0, 'нет'], [1, 'parse_dates'], [2, '+ dayfirst'], [3, '+ date_format']] },
    { k: 'dtype', o: [[0, 'авто'], [1, 'amount: float64']] },
    { k: 'usecols', o: [[0, 'все'], [1, '7 общих']] }
  ];
  const DEF = { sep: ',', quotechar: '"', decimal: '.', thousands: null, dates: 0, dtype: 0, usecols: 0 };
  const GOOD = { sep: ';', quotechar: "'", decimal: ',', thousands: null, dates: 3, dtype: 1, usecols: 1 };
  const toOpts = a => {
    const o = { sep: a.sep, quotechar: a.quotechar, decimal: a.decimal, thousands: a.thousands };
    if (a.dates) o.parse_dates = ['date'];
    if (a.dates === 2) o.dayfirst = true;
    if (a.dates === 3) o.date_format = '%d.%m.%Y';
    if (a.dtype) o.dtype = { amount: 'float64' };
    if (a.usecols) o.usecols = COLS;
    return o;
  };
  const pyStr = s => (s.includes('"') && !s.includes("'") ? `'${s}'` : `"${s.replace(/\t/g, '\\t')}"`);
  function callText(a) {
    const parts = ['"orders_crm.csv"', 'encoding="cp1251"'];
    if (a.sep !== DEF.sep) parts.push(`sep=${pyStr(a.sep)}`);
    if (a.quotechar !== DEF.quotechar) parts.push(`quotechar=${pyStr(a.quotechar)}`);
    if (a.decimal !== DEF.decimal) parts.push(`decimal=${pyStr(a.decimal)}`);
    if (a.thousands) parts.push(`thousands=${pyStr(a.thousands)}`);
    if (a.dates) parts.push('parse_dates=["date"]');
    if (a.dates === 2) parts.push('dayfirst=True');
    if (a.dates === 3) parts.push('date_format="%d.%m.%Y"');
    if (a.dtype) parts.push('dtype={"amount": "float64"}');
    if (a.usecols) parts.push('usecols=COLS');
    return `df = pd.read_csv(${parts.join(', ')})`;
  }
  // раскраска строки файла по полям — тем же автоматом, что у токенизатора
  // состояния: 0 — начало поля, 1 — поле без кавычек, 2 — внутри кавычек, 3 — кавычка внутри кавычек
  function lineSpans(line, sep, q) {
    const out = []; let st = 0, f = 0, buf = '';
    const push = (t, k) => { if (t) out.push([t, k]); };
    const flush = () => { push(buf, `f${f % 2}`); buf = ''; };
    for (const c of line) {
      if (st === 2) { if (c === q) { flush(); push(c, 'q'); st = 3; } else buf += c; continue; }
      if (c === sep) { flush(); push(c === '\t' ? '→' : c, 'sep'); f++; st = 0; continue; }
      if (st === 0 && c === q) { push(c, 'q'); st = 2; continue; }
      if (st === 3 && c === q) { buf += c; st = 2; continue; }
      buf += c; st = 1;
    }
    flush();
    return out;
  }

  function buildCsv(box, api) {
    const { $, esc, plural, hl } = api;
    const TARGET = readCsv(FRAG, toOpts(GOOD));
    const tcol = name => TARGET.cols.indexOf(name);
    box.innerHTML = `<div class="block-hd"><span class="t">Как прочитать выгрузку CRM <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="rc-edit" aria-pressed="false">Изменить текст</button><button type="button" class="btn ghost small" id="rc-reset">Сбросить</button></div></div>
<p class="hint rc-do">Подберите аргументы <code>read_csv</code>, чтобы получить восемь заказов и семь нужных столбцов. Проверьте, что можно сложить суммы и отсортировать заказы по дате.</p>
<div class="rc-top"><div class="rc-file"><p class="cap">orders_crm.csv · цвет показывает границы полей при выбранных настройках</p><pre class="rc-raw" id="rc-raw" aria-label="Текст файла"></pre><textarea class="rc-ta" id="rc-ta" spellcheck="false" aria-label="Текст файла для правки" hidden></textarea></div>
<div class="rc-args" id="rc-args" role="group" aria-label="Аргументы read_csv"></div></div>
<pre class="rc-call" id="rc-call"></pre>
<div class="rc-res" id="rc-res"></div>
<div class="rc-bottom"><div class="rc-msg narr-text" id="rc-msg"></div><ol class="steps rc-goals" id="rc-goals"></ol></div>
<div class="status"><span><span class="dot" id="rc-dot"></span><span id="rc-s1"></span></span><span id="rc-s2"></span><span class="grow"></span><span id="rc-s3"></span></div>`;
    $('rc-args').innerHTML = ARGS.map(A => `<div class="rc-arg"><code>${A.name || A.k}</code><span class="seg" data-k="${A.k}">${A.o.map((o, i) => `<button type="button" data-i="${i}">${esc(o[1])}</button>`).join('')}</span></div>`).join('');
    let a, text, editing = false, r;
    const custom = () => text !== FRAG;
    function diagnose() {
      const T = custom() ? null : TARGET;
      if (r.error) {
        const e = r.error;
        if (/EOF inside string/.test(e)) return 'В файле есть незакрытая кавычка. Проверьте последнее поле в кавычках и значение quotechar.';
        if (!T) return 'Не удалось прочитать ваш текст с этими настройками. Сверьте заголовок, число полей, кавычки и формат значений с сообщением об ошибке.';
        if (/^ParserError: Error tokenizing/.test(e)) return "В исходном файле комментарий <b>«позвонить; после 18:00»</b> заключён в одинарные кавычки. Укажите их в <code>quotechar</code>, иначе точка с запятой разделит комментарий на два поля.";
        if (/Number of passed names/.test(e)) return "Заголовок прочитан как одно поле, а в строках с суммой запятая дала два поля. Укажите точку с запятой в <code>sep</code>, чтобы выбрать нужные столбцы через <code>usecols</code>.";
        if (/Usecols do not match/.test(e)) return "С выбранным разделителем заголовок стал одним полем. Укажите точку с запятой в <code>sep</code>, чтобы прочитать имена столбцов из <code>usecols</code>.";
        if (/parse_dates/.test(e)) return "Среди прочитанных заголовков нет <b>date</b>. Выберите разделитель, который выделит имена столбцов в первой строке.";
        if (/could not convert string to float/.test(e)) return "Для <b>amount</b> задан тип <b>float64</b>, но по умолчанию pandas ожидает десятичную точку. Укажите <code>decimal=\",\"</code>, чтобы прочитать «1569,80» как число.";

        return 'pandas не смог прочитать текст с такими аргументами.';
      }
      if (!T) return "Проверьте, где проходят границы полей и какие типы указаны под заголовками. Кнопка «Сбросить» вернёт исходный файл CRM и условия задания.";
      if (r.cols.length === 1 && r.index) return "Запятая встречается только в суммах. Поэтому при <code>sep=\",\"</code> заголовок стал одним полем, а каждая запись разделилась на два. Всё, что стояло до десятичной запятой, попало в индекс.";
      if (r.cols.length === 1) return "В файле нет символов табуляции. Каждая строка целиком попала в один столбец.";
      const at = name => r.cols.indexOf(name), am = at('amount'), dt = at('date');
      if (am >= 0 && a.thousands && r.dtypes[am] !== 'str' && r.rows[0][am] !== TARGET.rows[0][tcol('amount')]) return "При <code>thousands=\",\"</code> pandas пропускает запятую как разделитель разрядов. Сумма 1 569,80 превращается в 156 980, в сто раз больше исходной. Сравните результат с первой строкой файла.";
      if (am >= 0 && r.dtypes[am] === 'str') return "В столбце <b>amount</b> остались строки. Чтобы pandas распознал дробную часть в «1569,80», задайте <code>decimal=\",\"</code>.";
      if (dt >= 0 && r.dtypes[dt] === 'str') return a.dates ? 'Часть значений не соответствует формату, поэтому весь столбец остался текстовым.' : 'Столбец <b>date</b> — <b>str</b>: без <code>parse_dates</code> даты остаются строками.';
      if (dt >= 0 && r.rows.some((row, i) => row[dt] !== TARGET.rows[i][tcol('date')])) return "В первой строке указано 04.01.2026. При стандартном порядке месяца и дня pandas прочитал её как 1 апреля. Для этого файла подходит <code>dayfirst=True</code>. Чтобы задать формат явно, выберите <code>date_format=\"%d.%m.%Y\"</code>.";
      if (r.cols.includes('comment')) return "Суммы и даты прочитаны верно. В таблице остался восьмой столбец <b>comment</b>. Выберите семь нужных столбцов через <code>usecols</code>.";
      if (a.quotechar === '"') return "Семь нужных столбцов прочитаны верно. Но комментарий во второй записи содержит точку с запятой. Если захотите читать и <b>comment</b>, выберите одинарные кавычки в <code>quotechar</code>.";
      return `Все восемь заказов прочитаны. Сумма «1569,80» стала числом, даты совпали с исходными, а столбец comment исключён.${a.dtype ? '' : ' Сейчас pandas сам определил тип суммы. Если задать его через <code>dtype</code>, неожиданный текст в этом столбце вызовет ошибку чтения.'}`;
    }
    function goals() {
      if (r.error) return [false, false, false, false, false];
      const at = n => r.cols.indexOf(n);
      const same = n => at(n) >= 0 && r.dtypes[at(n)] === TARGET.dtypes[tcol(n)] && r.rows.length === TARGET.rows.length && r.rows.every((row, i) => row[at(n)] === TARGET.rows[i][tcol(n)]);
      return [true, r.cols.join() === COLS.join(), r.rows.length === 8 && r.index === null, same('amount'), same('date')];
    }
    const GOALS = ['Файл прочитан без ошибки', '7 нужных столбцов без comment', '8 строк с индексом от 0 до 7', 'amount — float64, суммы как в файле', 'date — datetime64, все даты совпадают с исходными'];
    function drawRaw() {
      if (editing) return;
      $('rc-raw').innerHTML = text.replace(/\n$/, '').split('\n').map((l, i) => { return `<span class="ln">${i + 1}</span>${lineSpans(l, a.sep, a.quotechar).map(([t, k]) => `<span class="${k}">${esc(t)}</span>`).join('')}`; }).join('\n');
    }
    function drawRes() {
      const box2 = $('rc-res');
      if (r.error) { const [t, ...m] = r.error.split(': '); box2.innerHTML = `<div class="rc-err"><b>${esc(t)}</b>: ${esc(m.join(': '))}</div>`; return; }
      const T = custom() ? null : TARGET;
      const head = `<tr><th class="ix"></th>${r.cols.map((c, j) => `<th class="${T && !COLS.includes(c) ? 'x' : ''}">${esc(c)}</th>`).join('')}</tr>`;
      const tps = `<tr class="tp"><th class="ix"></th>${r.cols.map((c, j) => { const t = T ? tcol(c) : -1; const cls = t < 0 ? (T ? 'bad' : '') : r.dtypes[j] === TARGET.dtypes[t] ? 'ok' : 'bad'; return `<th><span class="${cls}">${esc(r.dtypes[j])}</span></th>`; }).join('')}</tr>`;
      const body = r.rows.map((row, i) => `<tr><th class="ix">${esc(r.index ? r.index[i] : String(i))}</th>${row.map((v, j) => { const t = T ? tcol(r.cols[j]) : -1; const bad = t >= 0 && TARGET.rows[i] && TARGET.rows[i][t] !== v; return `<td class="${v === 'NaN' || v === 'NaT' ? 'na' : ''}${bad ? ' bad' : ''}">${esc(v)}</td>`; }).join('')}</tr>`).join('');
      box2.innerHTML = `<div class="rc-tw"><table class="rc-t"><thead>${head}${tps}</thead><tbody>${body}</tbody></table></div>`;
    }
    function run() {
      r = readCsv(text, toOpts(a));
      box.querySelectorAll('.rc-args .seg').forEach(s => { const A = ARGS.find(x => x.k === s.dataset.k); s.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(A.o[i][0] === a[A.k]))); });
      $('rc-call').innerHTML = hl(callText(a));
      drawRaw(); drawRes();
      $('rc-msg').innerHTML = diagnose();
      const g = custom() ? null : goals(), n = g ? g.filter(Boolean).length : 0;
      $('rc-goals').innerHTML = g ? GOALS.map((t, i) => `<li class="${g[i] ? 'on' : ''}"><b>${g[i] ? '✓' : i + 1}</b>${esc(t)}</li>`).join('') : '<li><b>—</b>Проверка доступна для исходного файла</li>';
      $('rc-dot').className = `dot${!g ? '' : n === 5 ? ' live' : ''}`;
      $('rc-s1').textContent = g ? `выполнено: ${n} из 5` : 'свой текст';
      $('rc-s2').textContent = r.error ? `ошибка ${r.error.split(':')[0]}` : `${r.rows.length} ${plural(r.rows.length, ['строка', 'строки', 'строк'])} × ${r.cols.length} ${plural(r.cols.length, ['столбец', 'столбца', 'столбцов'])}`;
      $('rc-s3').textContent = n === 5 ? 'все условия выполнены' : g ? 'меняйте аргументы' : 'проверка доступна для исходного файла';
    }
    box.querySelector('.rc-args').addEventListener('click', e => {
      const b = e.target.closest('button[data-i]'); if (!b) return;
      const A = ARGS.find(x => x.k === b.parentElement.dataset.k); a[A.k] = A.o[+b.dataset.i][0]; run();
    });
    const ta = $('rc-ta'); let tmr = 0;
    ta.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => { text = ta.value.endsWith('\n') ? ta.value : ta.value + '\n'; run(); }, 180); });
    $('rc-edit').addEventListener('click', () => {
      editing = !editing; ta.hidden = !editing; $('rc-raw').hidden = editing;
      $('rc-edit').textContent = editing ? 'Готово' : 'Изменить текст'; $('rc-edit').setAttribute('aria-pressed', String(editing));
      if (editing) { ta.value = text; ta.focus(); } else run();
    });
    $('rc-reset').addEventListener('click', () => { a = Object.assign({}, DEF); text = FRAG; if (editing) $('rc-edit').click(); else run(); });
    a = Object.assign({}, DEF); text = FRAG; run();
    return {
      describe() {
        const g = custom() ? null : goals();
        return `аргументы: ${callText(a)}; текст: ${custom() ? 'свой' : 'исходный фрагмент CRM'}; результат: ${r.error ? r.error : `${r.rows.length} строк, столбцы ${r.cols.map((c, i) => `${c}:${r.dtypes[i]}`).join(', ')}`}${g ? `; целей выполнено ${g.filter(Boolean).length} из 5` : ''}.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  /* <code-blocks> */
  const CODE = {
    excel: { title: "Листы книги Excel и число заказов по месяцам", badge: "проверено: pandas 3.0.5, openpyxl 3.1.5", lang: 'python', outLabel: 'Терминал',
      code: "import pandas as pd\n\nPATH = \"data/crm_by_month.xlsx\"          # те же заказы CRM, по листу на месяц\n\nsheets = pd.read_excel(PATH, sheet_name=None)            # None — все листы сразу\nprint({name: len(df) for name, df in sheets.items()})    # число строк на каждом листе\n\nmarch = pd.read_excel(PATH, sheet_name=\"Март\")           # один лист по имени\nprint(march[[\"order_id\", \"date\", \"amount\"]])\n\ncrm = pd.concat(sheets.values(), ignore_index=True)\nprint(crm.shape, crm[\"date\"].dtype, crm[\"amount\"].dtype)",
      out: "$ python read_excel.py\n{'Январь': 4, 'Февраль': 2, 'Март': 2}\n   order_id       date  amount\n0      5007 2026-03-02  5145.9\n1      5008 2026-03-11   960.6\n(8, 7) datetime64[us] float64",
      note: "В книге crm_by_month.xlsx те же восемь заказов из CRM, по одному листу на каждый месяц. Даты хранятся как даты Excel, поэтому read_excel распознаёт их без parse_dates." },
    csv: { title: "Настройки для чтения заказов из CSV", badge: "проверено: pandas 3.0.5", lang: 'python', outLabel: 'Терминал',
      code: "import pandas as pd\n\nPATH = \"data/orders_crm.csv\"     # учебная выгрузка старой CRM: 8 заказов\nCOLS = [\"order_id\", \"date\", \"brand\", \"country\", \"channel\", \"amount\", \"status\"]\n\n\ndef read_crm(path=PATH):\n    return pd.read_csv(\n        path,\n        encoding=\"cp1251\",       # CRM сохраняет файл не в UTF-8\n        sep=\";\",\n        quotechar=\"'\",           # в CRM комментарии заключены в одинарные кавычки\n        decimal=\",\",             # 1569,80 → 1569.8\n        usecols=COLS,            # comment не нужен\n        dtype={\"order_id\": \"int64\", \"brand\": \"str\", \"country\": \"str\",\n               \"channel\": \"str\", \"amount\": \"float64\", \"status\": \"str\"},\n        parse_dates=[\"date\"],\n        date_format=\"%d.%m.%Y\",  # день, месяц, год\n    )\n\n\nif __name__ == \"__main__\":\n    crm = read_crm()\n    print(crm.head(3))\n    print(crm.dtypes)\n\n    # два примера неверных настроек для того же файла\n    base = dict(encoding=\"cp1251\", sep=\";\", quotechar=\"'\", usecols=COLS)\n    a = pd.read_csv(PATH, **base, thousands=\",\")                        # запятая как разделитель тысяч\n    b = pd.read_csv(PATH, **base, decimal=\",\", parse_dates=[\"date\"])    # автоматический выбор формата даты\n    print(\"thousands=',':\", a[\"amount\"].head(3).tolist(), a[\"amount\"].dtype)\n    print(\"без date_format:\", b[\"date\"].dt.strftime(\"%Y-%m-%d\").head(3).tolist())",
      out: "$ python load_csv.py\n   order_id       date brand country   channel   amount status\n0      5001 2026-01-04  Кедр      UZ  рассылка   1569.8   paid\n1      5002 2026-01-05  Сова      KZ   реклама  11349.8   paid\n2      5003 2026-01-06  Сова      BY  рассылка   8857.2   paid\norder_id             int64\ndate        datetime64[us]\nbrand                  str\ncountry                str\nchannel                str\namount             float64\nstatus                 str\ndtype: object\nthousands=',': [156980, 1134980, 885720] int64\nбез date_format: ['2026-04-01', '2026-05-01', '2026-06-01']",
      note: "Посмотрите на две последние строки вывода. С параметром thousands=\",\" сумма 1 569,80 увеличилась до 156 980. Без date_format дата 4 января превратилась в 1 апреля." },
    db: { title: "Как передать границы периода через params", badge: "проверено: SQLAlchemy 2.1.8, SQLite и PostgreSQL 16", lang: 'python', outLabel: 'Терминал',
      code: "import pandas as pd\nfrom sqlalchemy import create_engine, text\n\n# Для подключения к PostgreSQL импортируйте os и прочитайте адрес из переменной окружения:\n# engine = create_engine(os.environ[\"SHOP_DB_URL\"])   # postgresql+psycopg://…/shop\nengine = create_engine(\"sqlite:///data/shop.db\")       # учебная замена: SQLite\n\nQUERY = text(\"\"\"\n    SELECT order_id, order_date AS date, brand, country, channel, amount, status\n    FROM orders\n    WHERE order_date >= :start AND order_date < :end\n    ORDER BY order_id\n\"\"\")\n\n\ndef read_site(start=\"2026-01-01\", end=\"2026-04-01\"):\n    return pd.read_sql(QUERY, engine, params={\"start\": start, \"end\": end},\n                       parse_dates={\"date\": \"%Y-%m-%d\"}, dtype={\"amount\": \"float64\"})\n\n\nif __name__ == \"__main__\":\n    site = read_site()\n    print(len(site), \"строк:\", site[\"date\"].min().date(), \"—\", site[\"date\"].max().date())\n    print(site.dtypes.to_string())\n\n    print(\"С декабря:\", len(read_site(start=\"2025-12-01\")))\n    print(\"С января:\", len(site))",
      out: "$ python load_db.py\n12 строк: 2026-01-12 — 2026-03-28\norder_id             int64\ndate        datetime64[us]\nbrand                  str\ncountry                str\nchannel                str\namount             float64\nstatus                 str\nС декабря: 15\nС января: 12",
      note: "В учебной базе SQLite даты записаны текстом в формате год-месяц-день. В запросе начальная граница включена, а конечная исключена. Оба вызова используют один запрос, меняется только значение начальной даты." },
    api: { title: "Загрузка страниц и повтор запроса после ответа 429", badge: "проверено: requests 2.34.2 на учебном сервере", badgeKind: "warn", lang: 'python', outLabel: 'Терминал',
      code: "import os\nimport time\n\nimport pandas as pd\nimport requests\n\nfrom load_csv import COLS\n\nURL = \"http://127.0.0.1:8765/v1/orders\"     # учебный сервер из материалов: api_server.py\nLIMIT_PER_MIN = 30                           # лимит из документации API\nPAUSE = 60 / LIMIT_PER_MIN                   # 2 секунды между запросами\n\nsession = requests.Session()\nsession.headers[\"Authorization\"] = f\"Bearer {os.environ['SHOP_API_TOKEN']}\"   # учебный ключ из окружения\n\n\ndef get_page(page, tries=4):\n    params = {\"date_from\": \"2026-01-01\", \"date_to\": \"2026-03-31\", \"page\": page, \"per_page\": 4}\n    for attempt in range(tries):\n        r = session.get(URL, params=params, timeout=10)\n        if r.status_code == 429 or r.status_code >= 500:     # лимит или сбой: ждём и повторяем\n            wait = float(r.headers.get(\"Retry-After\", 2 ** attempt))\n            print(f\"  page={page}: {r.status_code}, жду {wait:g} с\")\n            time.sleep(wait)\n            continue\n        r.raise_for_status()                                  # 401, 404 — сразу ошибка\n        return r.json()\n    raise RuntimeError(f\"page={page}: не удалось получить страницу за {tries} попытки\")\n\n\ndef read_app(verbose=True):\n    items, page = [], 1\n    while page is not None:                  # next_page = None: страниц больше нет\n        data = get_page(page)\n        items += data[\"items\"]\n        if verbose:\n            print(f\"page={page}: {len(data['items'])} записи, next_page={data['next_page']}\")\n        page = data[\"next_page\"]\n        time.sleep(PAUSE)\n    flat = pd.json_normalize(items)          # {\"brand\": {\"name\": …}} → столбец brand.name\n    if verbose:\n        print(list(flat.columns))\n    flat = flat.rename(columns={\"id\": \"order_id\", \"created\": \"date\", \"brand.name\": \"brand\",\n                                \"customer.country\": \"country\", \"utm.channel\": \"channel\",\n                                \"total.amount\": \"amount\"})\n    return flat[COLS].assign(date=lambda d: pd.to_datetime(d[\"date\"], format=\"%Y-%m-%d\"))\n\n\nif __name__ == \"__main__\":\n    app = read_app()\n    print(app.head(3))\n    print(\"без паузы:\", [get_page(1)[\"page\"] for _ in range(2)])   # второй запрос упрётся в лимит",
      out: "$ python load_api.py\npage=1: 4 записи, next_page=2\npage=2: 4 записи, next_page=3\npage=3: 2 записи, next_page=None\n['id', 'created', 'status', 'brand.id', 'brand.name', 'customer.country', 'utm.channel', 'total.amount', 'total.currency']\n   order_id       date brand country   channel  amount status\n0      9001 2026-01-05  Бриз      KZ  органика  6348.6   paid\n1      9002 2026-01-07  Сова      RU  органика  8658.1   paid\n2      9003 2026-01-27  Бриз      RU  рассылка  7640.4   paid\n  page=1: 429, жду 2 с\nбез паузы: [1, 1]",
      note: "Перед запуском клиента запустите api_server.py по инструкции из архива. Строка «page=1: 429, жду 2 с» появляется при втором подряд запросе первой страницы. Пауза позволяет повторить его и получить ответ." },
    parquet: { title: "Объединение заказов и сравнение Parquet с CSV", badge: "проверено: pandas 3.0.5, pyarrow 26.0.1", lang: 'python', outLabel: 'Терминал',
      code: "import os\n\nimport pandas as pd\n\nfrom load_api import read_app\nfrom load_csv import read_crm\nfrom load_db import read_site\n\nparts = {\"crm\": read_crm(), \"site\": read_site(), \"app\": read_app(verbose=False)}\norders = pd.concat([df.assign(source=name) for name, df in parts.items()], ignore_index=True)\nprint(orders.shape, orders[\"source\"].value_counts(sort=False).to_dict())\nprint(orders.dtypes.to_string())\n\norders.to_parquet(\"data/orders_q1.parquet\", index=False)   # движок pyarrow\norders.to_csv(\"data/orders_q1.csv\", index=False, lineterminator=\"\\n\")  # перенос строки LF на всех системах\n\npq = pd.read_parquet(\"data/orders_q1.parquet\")\ncsv = pd.read_csv(\"data/orders_q1.csv\")\nprint(\"parquet:\", pq[\"date\"].dtype, \"| совпадает с исходной:\", pq.equals(orders))\nprint(\"csv:    \", csv[\"date\"].dtype, \"| совпадает с исходной:\", csv.equals(orders))\nprint(\"байт: parquet\", os.path.getsize(\"data/orders_q1.parquet\"), \"| csv\", os.path.getsize(\"data/orders_q1.csv\"))",
      out: "$ python save_parquet.py\n(30, 8) {'crm': 8, 'site': 12, 'app': 10}\norder_id             int64\ndate        datetime64[us]\nbrand                  str\ncountry                str\nchannel                str\namount             float64\nstatus                 str\nsource                 str\nparquet: datetime64[us] | совпадает с исходной: True\ncsv:     str | совпадает с исходной: False\nбайт: parquet 5541 | csv 1884",
      note: "Скрипт вызывает функции всех трёх модулей. Оставьте учебный сервер включённым. Для этих 30 строк файл Parquet занимает больше места, чем CSV. В размер файла входит и его схема." }
  };
  /* </code-blocks> */

  window.PAGE = {
    id: 'da-2-2',
    short: 'DA-02',
    title: 'Загрузка из файлов, баз и API',
    where: 'блок «Дата аналитика», тема 02 «Pandas и подготовка данных», страница 2.2',
    aiData: 'учебные заказы интернет-магазина за I квартал 2026 из трёх источников: файл старой CRM orders_crm.csv (cp1251, «;», суммы 1569,80, даты 04.01.2026), база сайта (15 заказов, 3 из них за декабрь) и API приложения (10 заказов по 4 на странице, лимит 30 запросов в минуту)',
    scene,
    widgets: { csv: buildCsv },
    code: CODE,
    questions: {
    q1: { sec: 'parse', title: 'Сначала предскажите', q: "Файл CRM читают в кодировке cp1251 с разделителем «;» и одинарными кавычками. Остальные настройки стандартные для pandas 3. Какой тип получит столбец amount со значениями вида «1569,80»?", opts: [["float64, потому что pandas распознает десятичную запятую"], ["int64, потому что pandas пропустит запятую"], ["str, потому что значения останутся текстом", 1], ["Чтение остановится с ошибкой ValueError"]],
      why: "По умолчанию pandas ожидает десятичную точку. Значение «1569,80» не соответствует такому формату, поэтому столбец останется текстовым. Если задать thousands=\",\", получится 156980. Если потребовать тип float64 и не указать decimal=\",\", чтение остановится с ValueError. Все три случая можно проверить в тренажёре." },
    q2: { sec: 'idea', q: "В анимации сервер вернул код 429 в ответ на запрос второй страницы. Что сделал клиент?", opts: [["Завершил загрузку после первой страницы"], ["Выдержал паузу из заголовка Retry-After и снова запросил вторую страницу", 1], ["Перешёл к третьей странице"], ["Запросил новый ключ доступа"]],
      why: "Учебный сервер вернул Retry-After: 2. Через две секунды клиент снова запросил вторую страницу и получил четыре заказа. Если бы он перешёл сразу к третьей странице, эти заказы не попали бы в отчёт. При неверном ключе сервер вернул бы 401." },
    q3: { sec: 'parse', q: "В исходном файле записано «1,5». После чтения с thousands=\",\" в таблице оказалось число 15. Что произошло?", opts: [["pandas округлил число до целого"], ["pandas пропустил запятую как разделитель тысяч", 1], ["При чтении в кодировке cp1251 изменился символ запятой"], ["pandas использовал десятичную запятую по умолчанию"]],
      why: "Аргумент thousands=\",\" указывает пропускать запятую между цифрами. Из «1,5» получается 15, а из «1569,80» — 156 980. Для этой выгрузки запятая отделяет дробную часть, поэтому нужны decimal=\",\" и стандартное значение thousands=None." },
    q4: { sec: 'idea', q: "Зачем передавать конечную дату через params={\"end\": …}, если в тексте запроса уже есть условие order_date < :end?", opts: [["Так база гарантированно выполнит запрос быстрее"], ["Так дата передаётся отдельно, а структура SQL-запроса сохраняется", 1], ["SQLAlchemy не поддерживает f-строки"], ["Так любая строка автоматически преобразуется в дату"]],
      why: "Метка :end задаёт место для значения. Драйвер получает дату через params, поэтому содержимое значения не может изменить условие отбора. Для другого квартала достаточно передать новые даты. Проверять их формат и порядок всё равно нужно." },
    q5: { sec: 'idea', q: "По какому признаку клиент понимает, что дошёл до последней страницы?", opts: [["Сервер вернул код 429"], ["В ответе есть признак, описанный в документации API. В нашем примере это next_page: null", 1], ["Получено десять страниц"], ["Сервер дольше обычного отвечал на запрос"]],
      why: "У учебного API на последней странице next_page равно null. У другого сервиса признаком конца может быть пустой список или отсутствие ссылки на следующую страницу. Код 429 в нашем примере означает, что нужно подождать и повторить запрос этой же страницы." },
    q6: { sec: 'code', q: "Что изменится, если из функции read_crm убрать строку date_format=\"%d.%m.%Y\"?", code: "parse_dates=[\"date\"],\ndate_format=\"%d.%m.%Y\",  # день, месяц, год", lang: 'python', opts: [["Ничего, pandas распознает исходный порядок дня и месяца"], ["Чтение остановится с ошибкой формата"], ["pandas примет первое число за месяц и прочитает 4 января как 1 апреля", 1], ["Столбец date останется текстовым"]],
      why: "По первому значению «04.01.2026» pandas выберет порядок «месяц, день, год». В этом файле ни один день месяца не больше 12, поэтому чтение завершится. Первые три даты станут 1 апреля, 1 мая и 1 июня. Если бы дальше встретилось «14.01.2026», месяц 14 не подошёл бы под выбранный формат и весь столбец остался бы текстовым." },
    q7: { sec: 'code', q: "Зачем в примере сохранять таблицу в Parquet, если она уже записана в CSV?", opts: [["Файл Parquet всегда меньше файла CSV"], ["После чтения Parquet столбец date сохранит тип datetime64", 1], ["В CSV нельзя записать кириллицу"], ["pandas не умеет читать собственные файлы CSV"]],
      why: "Parquet хранит схему таблицы. После чтения и данные, и типы совпали с исходными. CSV содержит текст, поэтому без parse_dates столбец date получит тип str. В примере с 30 заказами файл Parquet занимает даже больше места, чем CSV: 5 541 и 1 884 байта соответственно." }
    },
    glossary: {
      csv: { t: 'CSV', en: 'comma-separated values', d: "Текстовый формат табличных данных. Значения в записи разделены, например, запятой или точкой с запятой. Файл может содержать заголовок с именами столбцов." },
      api: { t: 'API', en: 'application programming interface', d: "Интерфейс, через который одна программа обращается к другой. В этом уроке клиент получает данные по HTTP." },
      encoding: { t: 'Кодировка', en: 'encoding', d: "Правила, по которым символы представляются байтами. Если при чтении указать другую кодировку, можно получить другой текст или ошибку." },
      ratelimit: { t: 'Лимит запросов', en: 'rate limit', d: "Ограничение на число запросов за определённое время. Учебный сервер разрешает один запрос в две секунды и при превышении лимита возвращает код 429." },
      sep: { t: 'Разделитель', en: 'separator, delimiter', d: "Символ между полями записи, например запятая, точка с запятой или табуляция." },
      quotechar: { t: 'Символ кавычек', en: 'quote character', d: "Символ, которым ограничивают поле в CSV. Разделитель внутри кавычек входит в текст поля." },
      decimal: { t: 'Десятичный разделитель', en: 'decimal separator', d: "Знак между целой и дробной частями числа. В русской записи это запятая." },
      thousands: { t: 'Разделитель тысяч', en: 'thousands separator', d: "Символ между группами из трёх цифр, например пробел в числе 12 400. При чтении числа этот символ пропускают." },
      dtype: { t: 'Тип данных', en: 'dtype', d: 'Тип значений столбца pandas: int64, float64, str, datetime64 и другие.' },
      strtype: { t: 'Тип str', en: 'string dtype', d: "Строковый тип, который pandas использует по умолчанию начиная с версии 3.0. Пропуски в нём обозначаются NaN. В более ранних версиях по умолчанию использовался object." },
      implicitidx: { t: 'Неявный индекс', en: 'implicit index column', d: "Индекс, который read_csv определяет по структуре файла. Например, если в первой записи на одно поле больше, чем в заголовке, первое поле может стать индексом." },
      sqlalchemy: { t: 'SQLAlchemy', en: 'SQLAlchemy', d: "Библиотека Python для работы с реляционными базами данных. В примере она открывает соединение и помогает передать параметры SQL-запроса." },
      connstr: { t: 'Строка подключения', en: 'connection string, database URL', d: "Описание подключения к базе данных. Для PostgreSQL обычно включает тип базы, драйвер, учётные данные, адрес сервера, порт и имя базы." },
      paramquery: { t: 'Параметризованный запрос', en: 'parameterized query', d: "SQL-запрос с метками для значений. Драйвер получает значения отдельно от текста запроса." },
      injection: { t: 'SQL-инъекция', en: 'SQL injection', d: "Уязвимость, при которой данные пользователя могут изменить структуру SQL-запроса. Для передачи значений используют параметры." },
      status: { t: 'Код ответа', en: 'HTTP status code', d: "Трёхзначный номер, который описывает результат HTTP-запроса. Например, 200 означает успех, а 429 указывает на слишком частые запросы." },
      envvar: { t: 'Переменная окружения', en: 'environment variable', d: "Именованное значение, доступное процессу в его окружении. В Python его можно получить через os.environ." },
      pagination: { t: 'Пагинация', en: 'pagination', d: "Выдача данных по страницам. Клиент запрашивает их, пока не получит от API признак последней страницы." },
      retryafter: { t: 'Retry-After', en: 'Retry-After', d: "Заголовок HTTP-ответа, в котором сервер указывает время следующей попытки. Это может быть дата или число секунд. Учебный сервер передаёт число секунд." },
      backoff: { t: 'Экспоненциальная задержка', en: 'exponential backoff', d: "Повтор запросов с возрастающей паузой. В примере после каждой неудачи интервал удваивается: одна, две, четыре секунды." },
      normalize: { t: 'json_normalize', en: 'pandas.json_normalize', d: "Функция pandas, которая преобразует вложенные поля в отдельные столбцы, например brand.name." },
      parquet: { t: 'Parquet', en: 'Apache Parquet', d: "Формат файлов, который хранит данные по столбцам и сохраняет их имена и типы." },
      chunks: { t: 'Итератор при чтении по частям', en: 'chunked reading, chunksize', d: "Объект, который выдаёт данные порциями. При чтении CSV с аргументом chunksize на каждом шаге цикла получается таблица не больше заданного числа строк." }
    },
    materials: [
      ['da-2-2-loading.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/orders_crm.csv', 'Учебная выгрузка CRM: 8 заказов, cp1251, «;»'],
      ['data/crm_by_month.xlsx', 'Заказы CRM на листах «Январь», «Февраль» и «Март»'],
      ['data/shop.db', 'SQLite с таблицей orders: 15 заказов сайта'],
      ['data/app_orders.json', '10 заказов приложения для учебного сервера'],
      ['api_server.py', 'Учебный сервер с постраничной выдачей заказов'],
      ['load_csv.py', 'Чтение файла CRM с явными типами'],
      ['load_db.py', 'Запрос к базе с параметрами'],
      ['load_api.py', 'Обход API по страницам'],
      ['save_parquet.py', 'Объединение заказов и запись в Parquet'],
      ['read_excel.py', 'Чтение книги Excel'],
      ['gen_data.py', 'Генератор данных с начальным значением 22']
    ],
    prompts: [
      ['Тренажёр read_csv', 'Покажи фрагмент CSV из трёх или четырёх строк с неоднозначной датой или десятичной запятой. Попроси меня выбрать аргументы read_csv. Дождись моего ответа и объясни по материалам урока, как будут прочитаны данные.'],
      ['Разбор моей загрузки', 'Я покажу свой код загрузки с учебными значениями вместо ключей и паролей. Проверь типы столбцов, передачу параметров и условие выхода из цикла по страницам. Объясни предложенные изменения на примерах из урока.'],
      ['Обход своего API', 'Я опишу свой API. Помоги мне выбрать условие завершения загрузки, интервал между запросами, число попыток и таймаут. Сначала спроси, что известно об этом из документации.']
    ]
  };
})();
