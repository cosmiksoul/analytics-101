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

  /* ===================== Сцена: три трубы в одну таблицу ===================== */
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
        S.gate.sql = ['bad', 'params', 'f-строка ✗']; S.extra = got > 0 ? 'bad' : '';
        S.cmd = [['i', '>>> end = "2026-04-01\' OR \'1\'=\'1"'], ['i', '>>> pd.read_sql(text(f"… WHERE order_date < \'{end}\'"), engine)']];
        if (p > .8) S.cmd.push(['e', '# 15 строк: декабрь 2025 тоже здесь']);
        if (p > .45) S.call = ['sql', "OR '1'='1' — условие верно всегда", 1];
        break;
      }
      case 5: {
        S.act = 'sql'; S.mob = ['sql', 'cmd', 'df']; S.bars = p > .35 ? 'cut' : 'all';
        S.dots.sql = flow(p, N.site + N.dec, .05, .8, { cls: i => (i < N.dec ? 'bad' : ''), stop: i => i < N.dec });
        S.fill.site = passed(S.dots.sql); S.gate.sql = ['ok', 'params', ':start :end ✓']; S.src = S.fill.site === N.site ? 2 : 1;
        S.cmd = [['i', '>>> pd.read_sql(text("… WHERE order_date >= :start AND order_date < :end"),'], ['i', '...     engine, params={"start": "2026-01-01", "end": "2026-04-01"})']];
        if (p > .8) S.cmd.push(['c', '# 12 строк, все из I квартала']);
        if (p > .5) S.call = ['sql', 'декабрь отсеяла база'];
        break;
      }
      case 6: {
        S.act = 'api'; S.mob = ['api', 'cmd', 'df']; S.req = p > .1 ? 1 : 0; S.pages = [p > .3 ? 'ok' : 'go', '', ''];
        S.dots.api = flow(p, 4, .3, .85); S.fill.app = passed(S.dots.api);
        S.gate.api = p > .25 ? ['ok', '30 запр./мин', '200 OK'] : ['idle', '30 запр./мин', 'запрос…'];
        S.cmd = [['i', '>>> session.get(URL, params={"page": 1, "per_page": 4}, timeout=10)']];
        if (p > .25) S.cmd.push(['o', '<Response [200]>   items: 4, next_page: 2']);
        if (p > .55) S.call = ['api', 'next_page: 2 — есть ещё'];
        break;
      }
      case 7: {
        S.act = 'api'; S.mob = ['api', 'cmd', 'df']; S.fill.app = 4; S.req = p > .1 ? 2 : 1; S.pages = ['ok', p > .7 ? 'ok' : 'err', ''];
        S.cmd = [['i', '>>> session.get(URL, params={"page": 2, …})   # сразу, без паузы'], ['e', '<Response [429]>   Retry-After: 2']];
        if (p < .3) { S.gate.api = ['bad', '30 запр./мин', '429']; S.call = ['api', 'слишком часто: 429', 1]; }
        else if (p < .7) { S.gate.api = ['warn', '30 запр./мин', `ждём ${p < .5 ? 2 : 1} с`]; S.call = ['api', 'Retry-After: 2 — ждём', 1]; S.cmd.push(['c', '# ждём 2 с и повторяем тот же запрос']); }
        else { S.req = 3; S.gate.api = ['ok', '30 запр./мин', '200 OK']; S.cmd.push(['c', '# ждём 2 с и повторяем тот же запрос'], ['o', '<Response [200]>   items: 4, next_page: 3']); S.call = ['api', 'повтор прошёл'];
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
        S.cmd = [['i', '>>> orders.to_parquet("orders_q1.parquet"); orders.to_csv("orders_q1.csv")']];
        if (p > .3) S.cmd.push(['i', '>>> print(pd.read_parquet("orders_q1.parquet")["date"].dtype)'], ['o', 'datetime64[us]']);
        if (p > .6) { S.cmd.push(['i', '>>> print(pd.read_csv("orders_q1.csv")["date"].dtype)'], ['e', 'str']); S.call = ['df', 'CSV снова сделал дату строкой', 1]; }
        break;
    }
    S.rows = S.fill.crm + S.fill.site + S.fill.dec + S.fill.app;
    return S;
  }

  const scene = {
    parts: [{ n: '01', name: 'Цель', s: [0] }, { n: '02', name: 'CSV', s: [1, 2, 3] }, { n: '03', name: 'База', s: [4, 5] }, { n: '04', name: 'API', s: [6, 7, 8] }, { n: '05', name: 'Таблица', s: [9, 10] }],
    steps: [
      { title: 'Три трубы, одна таблица', dur: 4200, body: '<p>Заказы I&nbsp;квартала лежат в&nbsp;трёх местах: файл старой <b>CRM</b>, база сайта в&nbsp;<b>PostgreSQL</b> и&nbsp;<b>API</b> мобильного приложения. Нужна одна таблица: 30&nbsp;заказов, 7&nbsp;общих столбцов.</p><p>На&nbsp;каждой трубе свой фильтр: кодировка, параметры запроса, лимит запросов в&nbsp;минуту.</p>' },
      { title: 'Файл в чужой кодировке', dur: 3600, body: '<p><b>read_csv</b> по&nbsp;умолчанию читает байты как UTF-8. А&nbsp;CRM сохранила файл в&nbsp;<b>cp1251</b>: слово «Кедр» в&nbsp;ней — байты CA E5 E4 F0.</p><p>Байт CA в&nbsp;UTF-8 начинает двухбайтовый символ, E5 не&nbsp;может быть его второй половиной. Чтение падает с&nbsp;<b>UnicodeDecodeError</b>.</p>' },
      { title: 'Прочиталось, но строками', dur: 3800, body: '<p>С&nbsp;<b>encoding="cp1251"</b>, разделителем «;» и&nbsp;кавычками «\'» все 8&nbsp;строк проходят фильтр. Ошибок нет.</p><p>Но&nbsp;сумма 1569,80 с&nbsp;запятой для pandas не&nbsp;число, а&nbsp;04.01.2026 — не&nbsp;дата. Оба столбца пришли с&nbsp;типом <b>str</b>: тихая поломка.</p>' },
      { title: 'Типы заданы явно', dur: 3600, body: '<p><b>decimal=","</b> читает 1569,80 как 1569.8. <b>dtype</b> закрепляет типы остальных столбцов. <b>parse_dates</b> с&nbsp;<b>date_format="%d.%m.%Y"</b> превращает 04.01.2026 в&nbsp;4&nbsp;января.</p><p>Без формата pandas угадал&nbsp;бы «месяц.день» и&nbsp;сделал&nbsp;бы 1&nbsp;апреля.</p>' },
      { title: 'f-строка ломает фильтр', dur: 4000, body: '<p>Границу периода вклеили в&nbsp;текст запроса f-строкой, а&nbsp;в&nbsp;поле пришло <b>2026-04-01\' OR \'1\'=\'1</b>. Кавычка закрылась, и&nbsp;к&nbsp;условию добавилось «или 1&nbsp;=&nbsp;1», которое верно всегда.</p><p>База вернула все 15&nbsp;заказов, вместе с&nbsp;тремя декабрьскими. Это SQL-инъекция.</p>' },
      { title: 'Параметры отдельно от текста', dur: 3800, body: '<p>В&nbsp;тексте запроса — метки <b>:start</b> и&nbsp;<b>:end</b>, значения едут отдельно, в&nbsp;<b>params</b>. База сравнивает дату со&nbsp;значением и&nbsp;никогда не&nbsp;исполняет его как код.</p><p>Декабрь отсеян, в&nbsp;таблицу пришли 12&nbsp;заказов квартала.</p>' },
      { title: 'Страница 1: есть продолжение', dur: 3600, body: '<p>API отдаёт заказы страницами по&nbsp;4. Клиент просит <b>page=1</b>, ключ передаёт в&nbsp;заголовке <b>Authorization</b> из&nbsp;переменной окружения.</p><p>Ответ 200: четыре записи и&nbsp;<b>next_page: 2</b> — значит, есть следующая страница.</p>' },
      { title: 'Слишком быстро: 429', dur: 4200, body: '<p>Вторую страницу попросили сразу, без паузы. Лимит — 30&nbsp;запросов в&nbsp;минуту, не&nbsp;чаще раза в&nbsp;2&nbsp;секунды, и&nbsp;сервер ответил <b>429 Too Many Requests</b> с&nbsp;заголовком <b>Retry-After: 2</b>.</p><p>Клиент ждёт 2&nbsp;секунды и&nbsp;повторяет тот&nbsp;же запрос. Ответ 200, ещё 4&nbsp;записи.</p>' },
      { title: 'next_page: null — конец', dur: 3800, body: '<p>Перед третьим запросом клиент сам выжидает 2&nbsp;секунды: 60&nbsp;с делить на&nbsp;30&nbsp;запросов. Страница 3 отдаёт последние 2&nbsp;записи и&nbsp;<b>next_page: null</b>.</p><p>Это признак конца: цикл останавливается, ни&nbsp;одна страница не&nbsp;потеряна.</p>' },
      { title: 'Плоская таблица и склейка', dur: 4000, body: '<p>Записи API вложенные: бренд лежит в&nbsp;<b>brand.name</b>, сумма — в&nbsp;<b>total.amount</b>. <b>json_normalize</b> раскладывает их в&nbsp;столбцы, а&nbsp;<b>rename</b> даёт общие имена.</p><p>У&nbsp;трёх кусков одинаковые столбцы и&nbsp;типы, и&nbsp;<b>pd.concat</b> собирает 30&nbsp;строк.</p>' },
      { title: 'parquet хранит типы', dur: 4200, next: 'Читать страницу', body: '<p>Таблицу сохраняют, чтобы не&nbsp;загружать всё заново. <b>parquet</b> записывает в&nbsp;файл и&nbsp;значения, и&nbsp;схему: после чтения date остаётся <b>datetime64</b>.</p><p>CSV схемы не&nbsp;хранит: прочитанная обратно дата снова стала <b>str</b>.</p>' }
    ],
    hud: [{ id: 'rows', label: 'Строк в df' }, { id: 'src', label: 'Источников' }, { id: 'req', label: 'Запросов API' }],
    legend: `<span><i class="sq" style="background:${C.crm}"></i>CRM</span><span><i class="sq" style="background:${C.site}"></i>база</span><span><i class="sq" style="background:${C.app}"></i>API</span><span><i class="sq" style="background:${C.bad}"></i>лишнее</span>`,
    info: 'ЗАКАЗЫ I КВАРТАЛА',
    aiNote: 'В анимации три учебных источника заказов I квартала 2026 собираются в одну таблицу из 30 строк и 7 столбцов. CRM: файл orders_crm.csv в cp1251, разделитель «;», суммы 1569,80, даты 04.01.2026; read_csv без encoding падает с UnicodeDecodeError (байт 0xCA), с encoding="cp1251" читает 8 строк, но amount и date остаются str, пока не заданы decimal=",", dtype, parse_dates и date_format. База сайта (PostgreSQL): 15 заказов, 3 за декабрь 2025; запрос f-строкой со значением 2026-04-01\' OR \'1\'=\'1 возвращает все 15, параметризованный запрос с :start и :end — 12. API: 10 заказов по 4 на странице, лимит 30 запросов в минуту; запрос второй страницы без паузы получает 429 и Retry-After: 2, клиент ждёт и повторяет; на третьей странице next_page: null — конец. json_normalize и concat дают 30 строк; parquet сохраняет тип даты, CSV — нет.',
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
            const pg = (n, c, st) => `<span class="pp-pg ${st}">стр.${n}<b>${c}</b></span>`;
            const apiS = `<div class="pp-src"><div class="pp-hd"><span>GET /v1/orders</span><span class="pp-tag">JSON</span></div><div class="pp-pgs">${pg(1, 4, S.pages[0])}${pg(2, 4, S.pages[1])}${pg(3, 2, S.pages[2])}</div><div class="pp-raw"><div>{"id": 9001, "brand": {"name": …}}</div></div></div>`;
            const cmd = `<div class="pp-cmd${mh('cmd')}">${S.cmd.map(([t, s]) => `<div class="${t}">${esc(s)}</div>`).join('')}</div>`;
            const types = COLS.map((c, i) => { const t = S.types ? S.types[i] : '—'; const ok = !S.types || t === TYPES[i]; return `<div class="pp-col"><b>${c}</b><span class="${S.types ? (ok ? 'ok' : 'bad') : ''}">${t}</span></div>`; }).join('');
            // квадрат — строка таблицы, цвет — источник; красные — лишние декабрьские строки из шага с инъекцией
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
    { k: 'dtype', o: [[0, 'угадать'], [1, 'amount: float64']] },
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
    box.innerHTML = `<div class="block-hd"><span class="t">Таблица станет правильной, когда аргументы совпадут с файлом <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="rc-edit" aria-pressed="false">Изменить текст</button><button type="button" class="btn ghost small" id="rc-reset">Сбросить</button></div></div>
<p class="hint rc-do">Меняйте аргументы <code>read_csv</code>, пока таблица не совпадёт с целью: 8 заказов, 7 столбцов, сумма — число, дата — дата.</p>
<div class="rc-top"><div class="rc-file"><p class="cap">orders_crm.csv · поля раскрашены так, как их режет pandas</p><pre class="rc-raw" id="rc-raw" aria-label="Текст файла"></pre><textarea class="rc-ta" id="rc-ta" spellcheck="false" aria-label="Текст файла для правки" hidden></textarea></div>
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
        if (/^ParserError: Error tokenizing/.test(e)) return 'В строке полей больше, чем в заголовке. Точка с запятой внутри комментария <b>\'позвонить; после 18:00\'</b> режет его надвое: pandas ждёт кавычки <b>"</b>, а CRM ставит <b>\'</b>. Нужен <code>quotechar="\'"</code> — или <code>usecols</code>, который просто не возьмёт лишнее поле.';
        if (/Number of passed names/.test(e)) return 'Разделитель не тот. Заголовок без запятых стал одним столбцом, а в строках данных по два поля: запятая есть только в сумме. Имена из <code>usecols</code> искать негде.';
        if (/Usecols do not match/.test(e)) return 'Разделитель не тот: весь заголовок стал одним именем столбца, и столбцов из <code>usecols</code> в нём нет.';
        if (/parse_dates/.test(e)) return 'Столбца <b>date</b> нет: при этом разделителе заголовок — одно длинное имя «order_id;date;…». Сначала нужен верный <code>sep</code>.';
        if (/could not convert string to float/.test(e)) return '<code>dtype={"amount": "float64"}</code> требует числа, а «1569,80» с запятой — не число, пока <code>decimal</code> равен точке. Ошибка громкая, и это хорошо: без <code>dtype</code> столбец тихо остался бы строками.';
        if (/EOF inside string/.test(e)) return 'Кавычка открылась и не закрылась до конца файла: всё, что после неё, pandas считает одним полем.';
        return 'pandas не смог прочитать текст с такими аргументами.';
      }
      if (!T) return 'Свой текст: смотрите на раскраску полей и типы под заголовками. Цель и сверка с pandas относятся к исходному фрагменту — кнопка «Сбросить» вернёт его.';
      if (r.cols.length === 1 && r.index) return 'Разделитель не тот: <code>sep=","</code> режет строку по десятичной запятой в сумме. Полей в строках на одно больше, чем в заголовке, и pandas молча сделал первую половину строки индексом.';
      if (r.cols.length === 1) return 'В файле нет табуляций: каждая строка целиком стала одним значением.';
      const at = name => r.cols.indexOf(name), am = at('amount'), dt = at('date');
      if (am >= 0 && a.thousands && r.dtypes[am] !== 'str' && r.rows[0][am] !== TARGET.rows[0][tcol('amount')]) return '<code>thousands=","</code> выбросил запятую как разделитель тысяч: 1569,80 стало 156980, в сто раз больше. Ошибки нет, и именно это опасно: так «1,5» превращается в 15.';
      if (am >= 0 && r.dtypes[am] === 'str') return 'Столбец <b>amount</b> — <b>str</b>: «1569,80» с запятой для pandas не число, и он тихо оставил строки. Нужен <code>decimal=","</code>.';
      if (dt >= 0 && r.dtypes[dt] === 'str') return a.dates ? 'Даты не разобрались, и столбец остался строками.' : 'Столбец <b>date</b> — <b>str</b>: без <code>parse_dates</code> даты остаются строками.';
      if (dt >= 0 && r.rows.some((row, i) => row[dt] !== TARGET.rows[i][tcol('date')])) return 'Даты разобраны, но перепутаны. pandas угадал формат по первой строке 04.01.2026 как «месяц.день.год», и 4 января стало 1 апреля — без предупреждения. Нужен <code>dayfirst=True</code> или, надёжнее, <code>date_format="%d.%m.%Y"</code>.';
      if (r.cols.includes('comment')) return 'Типы верны, но в таблице лишний столбец <b>comment</b>: общий вид темы — 7 столбцов. Его отбросит <code>usecols</code>.';
      if (a.quotechar === '"') return 'Таблица верна, но кавычки не разобраны: лишнее поле из комментария в строке 3 не мешает только потому, что <code>usecols</code> не берёт comment. Понадобится comment — нужен <code>quotechar="\'"</code>.';
      return `Таблица правильная. «;» и «'» режут строки верно, <code>decimal=","</code> делает 1569,80 числом, формат даты задан${a.dates === 2 ? ' через dayfirst' : ''}, а лишний comment отброшен.${a.dtype ? '' : ' Для надёжности добавьте <code>dtype</code>: тогда следующая кривая выгрузка упадёт с ошибкой, а не испортится тихо.'}`;
    }
    function goals() {
      if (r.error) return [false, false, false, false, false];
      const at = n => r.cols.indexOf(n);
      const same = n => at(n) >= 0 && r.dtypes[at(n)] === TARGET.dtypes[tcol(n)] && r.rows.length === TARGET.rows.length && r.rows.every((row, i) => row[at(n)] === TARGET.rows[i][tcol(n)]);
      return [true, r.cols.join() === COLS.join(), r.rows.length === 8 && r.index === null, same('amount'), same('date')];
    }
    const GOALS = ['Файл прочитан без ошибки', '7 общих столбцов, без comment', '8 строк, индекс 0–7', 'amount — float64, суммы как в файле', 'date — datetime64, январь остался январём'];
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
      $('rc-goals').innerHTML = g ? GOALS.map((t, i) => `<li class="${g[i] ? 'on' : ''}"><b>${g[i] ? '✓' : i + 1}</b>${esc(t)}</li>`).join('') : '<li><b>—</b>Свой текст: цели заданы для исходного фрагмента</li>';
      $('rc-dot').className = `dot${!g ? '' : n === 5 ? ' live' : ''}`;
      $('rc-s1').textContent = g ? `цель: ${n} из 5` : 'свой текст';
      $('rc-s2').textContent = r.error ? `ошибка ${r.error.split(':')[0]}` : `${r.rows.length} ${plural(r.rows.length, ['строка', 'строки', 'строк'])} × ${r.cols.length} ${plural(r.cols.length, ['столбец', 'столбца', 'столбцов'])}`;
      $('rc-s3').textContent = n === 5 ? 'таблица правильная' : g ? 'меняйте аргументы' : 'сверка с pandas — на исходном тексте';
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
    excel: { title: "sheet_name=None читает все листы книги в словарь", badge: "проверено: pandas 3.0.5, openpyxl 3.1.5", lang: 'python', outLabel: 'Терминал',
      code: "import pandas as pd\n\nPATH = \"data/crm_by_month.xlsx\"          # те же заказы CRM, по листу на месяц\n\nsheets = pd.read_excel(PATH, sheet_name=None)            # None — все листы сразу\nprint({name: len(df) for name, df in sheets.items()})    # словарь «имя листа → таблица»\n\nmarch = pd.read_excel(PATH, sheet_name=\"Март\")           # один лист по имени\nprint(march[[\"order_id\", \"date\", \"amount\"]])\n\ncrm = pd.concat(sheets.values(), ignore_index=True)\nprint(crm.shape, crm[\"date\"].dtype, crm[\"amount\"].dtype)",
      out: "$ python read_excel.py\n{'Январь': 4, 'Февраль': 2, 'Март': 2}\n   order_id       date  amount\n0      5007 2026-03-02  5145.9\n1      5008 2026-03-11   960.6\n(8, 7) datetime64[us] float64",
      note: "Книга crm_by_month.xlsx есть в материалах: те же 8 заказов CRM, по листу на месяц. Даты в ней — ячейки типа «дата», поэтому read_excel сразу даёт datetime64." },
    csv: { title: "CSV с явными типами: каждая договорённость файла — аргумент", badge: "проверено: pandas 3.0.5", lang: 'python', outLabel: 'Терминал',
      code: "import pandas as pd\n\nPATH = \"data/orders_crm.csv\"     # учебная выгрузка старой CRM: 8 заказов\nCOLS = [\"order_id\", \"date\", \"brand\", \"country\", \"channel\", \"amount\", \"status\"]\n\n\ndef read_crm(path=PATH):\n    return pd.read_csv(\n        path,\n        encoding=\"cp1251\",       # CRM сохраняет файл не в UTF-8\n        sep=\";\",\n        quotechar=\"'\",           # текст CRM берёт в одинарные кавычки\n        decimal=\",\",             # 1569,80 → 1569.8\n        usecols=COLS,            # comment не нужен\n        dtype={\"order_id\": \"int64\", \"brand\": \"str\", \"country\": \"str\",\n               \"channel\": \"str\", \"amount\": \"float64\", \"status\": \"str\"},\n        parse_dates=[\"date\"],\n        date_format=\"%d.%m.%Y\",  # день.месяц.год — без догадок\n    )\n\n\nif __name__ == \"__main__\":\n    crm = read_crm()\n    print(crm.head(3))\n    print(crm.dtypes)\n\n    # две тихие ошибки на том же файле\n    base = dict(encoding=\"cp1251\", sep=\";\", quotechar=\"'\", usecols=COLS)\n    a = pd.read_csv(PATH, **base, thousands=\",\")                        # запятая — «тысячи»\n    b = pd.read_csv(PATH, **base, decimal=\",\", parse_dates=[\"date\"])    # формат даты угадан\n    print(\"thousands=',':\", a[\"amount\"].head(3).tolist(), a[\"amount\"].dtype)\n    print(\"без date_format:\", b[\"date\"].dt.strftime(\"%Y-%m-%d\").head(3).tolist())",
      out: "$ python load_csv.py\n   order_id       date brand country   channel   amount status\n0      5001 2026-01-04  Кедр      UZ  рассылка   1569.8   paid\n1      5002 2026-01-05  Сова      KZ   реклама  11349.8   paid\n2      5003 2026-01-06  Сова      BY  рассылка   8857.2   paid\norder_id             int64\ndate        datetime64[us]\nbrand                  str\ncountry                str\nchannel                str\namount             float64\nstatus                 str\ndtype: object\nthousands=',': [156980, 1134980, 885720] int64\nбез date_format: ['2026-04-01', '2026-05-01', '2026-06-01']",
      note: "Последние две строки вывода — тихие ошибки на том же файле: thousands=\",\" сделал из 1569,80 число 156980, а без date_format 4 января стало 1 апреля." },
    db: { title: "Запрос с параметрами: значения едут отдельно от текста SQL", badge: "проверено: SQLAlchemy 2.1.8, SQLite и PostgreSQL 16", lang: 'python', outLabel: 'Терминал',
      code: "import pandas as pd\nfrom sqlalchemy import create_engine, text\n\n# В работе здесь PostgreSQL, а адрес с паролем лежат в переменной окружения:\n# engine = create_engine(os.environ[\"SHOP_DB_URL\"])   # postgresql+psycopg://…/shop\nengine = create_engine(\"sqlite:///data/shop.db\")       # учебная замена: SQLite\n\nQUERY = text(\"\"\"\n    SELECT order_id, order_date AS date, brand, country, channel, amount, status\n    FROM orders\n    WHERE order_date >= :start AND order_date < :end\n    ORDER BY order_id\n\"\"\")\n\n\ndef read_site(start=\"2026-01-01\", end=\"2026-04-01\"):\n    return pd.read_sql(QUERY, engine, params={\"start\": start, \"end\": end},\n                       parse_dates={\"date\": \"%Y-%m-%d\"}, dtype={\"amount\": \"float64\"})\n\n\nif __name__ == \"__main__\":\n    site = read_site()\n    print(len(site), \"строк:\", site[\"date\"].min().date(), \"—\", site[\"date\"].max().date())\n    print(site.dtypes.to_string())\n\n    end = \"2026-04-01' OR '1'='1\"             # такое значение пришло из формы\n    sql = f\"SELECT count(*) AS n FROM orders WHERE order_date >= '2026-01-01' AND order_date < '{end}'\"\n    print(\"f-строка:\", pd.read_sql(text(sql), engine)[\"n\"].iloc[0], \"строк\")\n    print(\"параметры:\", len(read_site(end=end)), \"строк\")",
      out: "$ python load_db.py\n12 строк: 2026-01-12 — 2026-03-28\norder_id             int64\ndate        datetime64[us]\nbrand                  str\ncountry                str\nchannel                str\namount             float64\nstatus                 str\nf-строка: 15 строк\nпараметры: 12 строк",
      note: "SQLite здесь — учебная замена: ему не нужен сервер. Тот же запрос проверен на PostgreSQL 16 с драйвером psycopg: меняется только строка подключения, результат — те же 12 строк. Отличие — в последней строке вывода: столбец order_date в PostgreSQL имеет тип date, и вместо 12 строк база отвечает ошибкой invalid input syntax for type date. Инъекции нет в обоих случаях." },
    api: { title: "Обход API: страницы до next_page = None, пауза по лимиту, повтор после 429", badge: "проверено: requests 2.34.2 на учебном сервере", badgeKind: "warn", lang: 'python', outLabel: 'Терминал',
      code: "import os\nimport time\n\nimport pandas as pd\nimport requests\n\nfrom load_csv import COLS\n\nURL = \"http://127.0.0.1:8765/v1/orders\"     # учебный сервер из материалов: api_server.py\nLIMIT_PER_MIN = 30                           # лимит из документации API\nPAUSE = 60 / LIMIT_PER_MIN                   # 2 секунды между запросами\n\nsession = requests.Session()\nsession.headers[\"Authorization\"] = f\"Bearer {os.environ['SHOP_API_TOKEN']}\"   # ключ — не в коде\n\n\ndef get_page(page, tries=4):\n    params = {\"date_from\": \"2026-01-01\", \"date_to\": \"2026-03-31\", \"page\": page, \"per_page\": 4}\n    for attempt in range(tries):\n        r = session.get(URL, params=params, timeout=10)\n        if r.status_code == 429 or r.status_code >= 500:     # лимит или сбой: ждём и повторяем\n            wait = float(r.headers.get(\"Retry-After\", 2 ** attempt))\n            print(f\"  page={page}: {r.status_code}, жду {wait:g} с\")\n            time.sleep(wait)\n            continue\n        r.raise_for_status()                                  # 401, 404 — сразу ошибка\n        return r.json()\n    raise RuntimeError(f\"page={page}: нет ответа за {tries} попытки\")\n\n\ndef read_app(verbose=True):\n    items, page = [], 1\n    while page is not None:                  # next_page = None: страниц больше нет\n        data = get_page(page)\n        items += data[\"items\"]\n        if verbose:\n            print(f\"page={page}: {len(data['items'])} записи, next_page={data['next_page']}\")\n        page = data[\"next_page\"]\n        time.sleep(PAUSE)\n    flat = pd.json_normalize(items)          # {\"brand\": {\"name\": …}} → столбец brand.name\n    if verbose:\n        print(list(flat.columns))\n    flat = flat.rename(columns={\"id\": \"order_id\", \"created\": \"date\", \"brand.name\": \"brand\",\n                                \"customer.country\": \"country\", \"utm.channel\": \"channel\",\n                                \"total.amount\": \"amount\"})\n    return flat[COLS].assign(date=lambda d: pd.to_datetime(d[\"date\"], format=\"%Y-%m-%d\"))\n\n\nif __name__ == \"__main__\":\n    app = read_app()\n    print(app.head(3))\n    print(\"без паузы:\", [get_page(1)[\"page\"] for _ in range(2)])   # второй запрос упрётся в лимит",
      out: "$ python load_api.py\npage=1: 4 записи, next_page=2\npage=2: 4 записи, next_page=3\npage=3: 2 записи, next_page=None\n['id', 'created', 'status', 'brand.id', 'brand.name', 'customer.country', 'utm.channel', 'total.amount', 'total.currency']\n   order_id       date brand country   channel  amount status\n0      9001 2026-01-05  Бриз      KZ  органика  6348.6   paid\n1      9002 2026-01-07  Сова      RU  органика  8658.1   paid\n2      9003 2026-01-27  Бриз      RU  рассылка  7640.4   paid\n  page=1: 429, жду 2 с\nбез паузы: [1, 1]",
      note: "Внешней сети в песочнице нет: клиент работал с учебным сервером api_server.py из материалов, запущенным там же на 127.0.0.1:8765, с учебным ключом в SHOP_API_TOKEN. Строка «page=1: 429, жду 2 с» — ответ сервера на второй запрос без паузы." },
    parquet: { title: "Склейка трёх источников и parquet, который помнит типы", badge: "проверено: pandas 3.0.5, pyarrow 26.0.1", lang: 'python', outLabel: 'Терминал',
      code: "import os\n\nimport pandas as pd\n\nfrom load_api import read_app\nfrom load_csv import read_crm\nfrom load_db import read_site\n\nparts = {\"crm\": read_crm(), \"site\": read_site(), \"app\": read_app(verbose=False)}\norders = pd.concat([df.assign(source=name) for name, df in parts.items()], ignore_index=True)\nprint(orders.shape, orders[\"source\"].value_counts(sort=False).to_dict())\nprint(orders.dtypes.to_string())\n\norders.to_parquet(\"data/orders_q1.parquet\", index=False)   # движок pyarrow\norders.to_csv(\"data/orders_q1.csv\", index=False)\n\npq = pd.read_parquet(\"data/orders_q1.parquet\")\ncsv = pd.read_csv(\"data/orders_q1.csv\")\nprint(\"parquet:\", pq[\"date\"].dtype, \"| совпадает с исходной:\", pq.equals(orders))\nprint(\"csv:    \", csv[\"date\"].dtype, \"| совпадает с исходной:\", csv.equals(orders))\nprint(\"байт: parquet\", os.path.getsize(\"data/orders_q1.parquet\"), \"| csv\", os.path.getsize(\"data/orders_q1.csv\"))",
      out: "$ python save_parquet.py\n(30, 8) {'crm': 8, 'site': 12, 'app': 10}\norder_id             int64\ndate        datetime64[us]\nbrand                  str\ncountry                str\nchannel                str\namount             float64\nstatus                 str\nsource                 str\nparquet: datetime64[us] | совпадает с исходной: True\ncsv:     str | совпадает с исходной: False\nбайт: parquet 5541 | csv 1884",
      note: "save_parquet.py импортирует функции трёх модулей выше, поэтому учебный сервер тоже был запущен. На 30 строках parquet больше CSV: место занимают схема и служебные данные." }
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
    q1: { sec: 'parse', title: 'Сначала предскажите', q: 'Файл CRM читают с sep=";" и quotechar="\'", остальные аргументы по умолчанию. Какой тип получит столбец amount со значениями вида 1569,80?', opts: [['float64: pandas поймёт запятую и прочитает 1569.8'], ['int64: запятую выбросит, получится 156980'], ['str: значения останутся строками «1569,80»', 1], ['read_csv упадёт с ValueError']],
      why: 'По умолчанию decimal — точка, и «1569,80» не похоже ни на целое, ни на дробное число. pandas не падает и не выбрасывает запятую, а оставляет столбец текстом; в pandas 3 это тип str. 156980 получится, только если явно указать thousands=",". Ошибка ValueError будет, если задать dtype={"amount": "float64"} без decimal=",". Проверьте все варианты в интерактиве.' },
    q2: { sec: 'idea', q: 'В анимации API ответил на запрос второй страницы кодом 429. Что сделал клиент?', opts: [['Остановил загрузку: страница 2 потеряна'], ['Подождал столько секунд, сколько сказал заголовок Retry-After, и повторил тот же запрос', 1], ['Перешёл сразу к странице 3'], ['Запросил новый ключ: 429 значит, что старый не подходит']],
      why: '429 Too Many Requests значит «слишком часто», а не «нельзя». Сервер подсказал в Retry-After, что ждать нужно 2 секунды; клиент выждал и повторил запрос той же страницы, и она пришла. Перейти к третьей странице значило бы потерять четыре заказа. За неверный ключ отвечает код 401.' },
    q3: { sec: 'parse', q: 'Коллега прочитал выгрузку с thousands=",", и число 1,5 в таблице стало 15. Почему?', opts: [['pandas округлил число до целого'], ['Запятую приняли за разделитель тысяч и выбросили, осталось 15', 1], ['Файл был в cp1251, и запятая испортилась при расшифровке'], ['decimal="," стоит по умолчанию и съел запятую']],
      why: 'thousands="," говорит pandas: «запятая разделяет разряды, её нужно пропустить». Из 1,5 остаются цифры 1 и 5, то есть 15; так же 1569,80 становится 156980. Ошибки при этом нет. pandas ничего не округляет, кодировка запятую не трогает, а decimal по умолчанию — точка. Для русской записи нужен decimal=",", а thousands — пробел или ничего.' },
    q4: { sec: 'idea', q: 'Чем запрос text("… WHERE order_date < :end") с params={"end": …} лучше f-строки с тем же значением?', opts: [['Он быстрее: база кэширует текст запроса'], ['Значение передаётся отдельно от текста запроса, и драйвер не даст ему стать частью кода SQL', 1], ['f-строки не работают с SQLAlchemy'], ['Параметры сами превращают строки в даты']],
      why: 'В f-строке значение вклеивается в текст, и строка 2026-04-01\' OR \'1\'=\'1 дописывает условие, которое верно всегда: в анимации так пришли 15 строк вместо 12. Параметр драйвер передаёт отдельно или экранирует сам, и база видит в нём только значение. f-строку SQLAlchemy выполнит, просто это небезопасно. Типы параметры сами не меняют, а про скорость вопрос не о том.' },
    q5: { sec: 'idea', q: 'Клиент обходит API постранично. Как понять, что страницы закончились?', opts: [['Когда сервер ответит 429'], ['По признаку из документации API: next_page пришёл пустым (null) или список записей пуст', 1], ['После десятой страницы: больше не бывает'], ['Когда ответ пришёл медленнее обычного']],
      why: 'Конец пагинации объявляет сам API: в учебном сервере это next_page: null, у других — пустой список или отсутствие ссылки на следующую страницу. 429 — сигнал «подождите», после него нужно повторить запрос, а не заканчивать. Фиксированное число страниц и скорость ответа ничего не говорят о том, остались ли данные.' },
    q6: { sec: 'code', q: 'Что изменится, если из функции read_crm убрать строку date_format="%d.%m.%Y"?', code: 'parse_dates=["date"],\ndate_format="%d.%m.%Y",  # день.месяц.год — без догадок', lang: 'python', opts: [['Ничего: pandas сам поймёт, где день, а где месяц'], ['read_csv упадёт с ошибкой формата'], ['Формат угадается по первой строке как «месяц.день.год», и 4 января станет 1 апреля без ошибки', 1], ['Столбец date останется строками']],
      why: 'Без date_format pandas угадывает формат по первому значению 04.01.2026 и по умолчанию считает первым месяц. Все дни в файле CRM не больше 12, поэтому все даты разбираются, но неверно: в выводе кода это 2026-04-01, 2026-05-01, 2026-06-01. Строками столбец остался бы, если бы ниже встретилось число вроде 14.01.2026, а ошибки не будет в обоих случаях.' },
    q7: { sec: 'code', q: 'Почему собранную таблицу сохранили в parquet, а не в CSV?', opts: [['parquet всегда меньше CSV'], ['parquet хранит схему, и после чтения date остаётся datetime64, а не строкой', 1], ['CSV не умеет хранить кириллицу'], ['read_csv не прочитает файл, записанный pandas']],
      why: 'В выводе кода таблица из parquet совпала с исходной, а из CSV — нет: date вернулась строкой, потому что CSV хранит только текст. На 30 строках parquet даже больше CSV, 5 541 байт против 1 884: схема и служебные данные занимают место, выигрыш в размере появляется на больших таблицах. Кириллицу CSV хранит, а свой CSV pandas читает, просто без типов.' }
    },
    glossary: {
      csv: { t: 'CSV', en: 'comma-separated values', d: 'Текстовый формат таблицы: строка — запись, значения разделены особым символом, первая строка — имена столбцов.' },
      api: { t: 'API', en: 'application programming interface', d: 'Способ, которым программа запрашивает данные у другой программы; у веб-сервисов — адреса для HTTP-запросов.' },
      encoding: { t: 'Кодировка', en: 'encoding', d: 'Таблица перевода байтов в буквы. Одни и те же байты в разных кодировках дают разный текст.' },
      ratelimit: { t: 'Лимит запросов', en: 'rate limit', d: 'Сколько запросов сервер принимает от клиента за единицу времени; сверх лимита отвечает кодом 429.' },
      sep: { t: 'Разделитель', en: 'separator, delimiter', d: 'Символ между значениями в строке CSV: запятая, точка с запятой, табуляция.' },
      quotechar: { t: 'Символ кавычек', en: 'quote character', d: 'Символ, которым в CSV обрамляют значение; разделитель внутри кавычек — часть текста.' },
      decimal: { t: 'Десятичный разделитель', en: 'decimal separator', d: 'Знак между целой и дробной частью числа: точка в английской записи, запятая в русской.' },
      thousands: { t: 'Разделитель тысяч', en: 'thousands separator', d: 'Знак между разрядами длинного числа, например пробел в 12 400. При чтении его выбрасывают.' },
      dtype: { t: 'Тип данных', en: 'dtype', d: 'Тип значений столбца pandas: int64, float64, str, datetime64 и другие.' },
      strtype: { t: 'Тип str', en: 'string dtype', d: 'Строковый тип pandas 3 по умолчанию; пропуски в нём — NaN. Раньше текст хранился в object.' },
      implicitidx: { t: 'Неявный индекс', en: 'implicit index column', d: 'Если в первой строке данных на одно поле больше, чем в заголовке, read_csv делает первое поле индексом.' },
      sqlalchemy: { t: 'SQLAlchemy', en: 'SQLAlchemy', d: 'Библиотека Python для работы с базами: подключение, запросы, параметры. Через неё работает pandas.read_sql.' },
      connstr: { t: 'Строка подключения', en: 'connection string, database URL', d: 'Адрес базы одной строкой: тип, драйвер, учётная запись, хост, порт и имя базы.' },
      paramquery: { t: 'Параметризованный запрос', en: 'parameterized query', d: 'Запрос с метками вместо значений; значения передаются отдельно и не становятся кодом SQL.' },
      injection: { t: 'SQL-инъекция', en: 'SQL injection', d: 'Подмена смысла запроса через значение, вклеенное в текст SQL.' },
      status: { t: 'Код ответа', en: 'HTTP status code', d: 'Трёхзначное число в ответе сервера: 200 — успех, 429 — слишком часто, 5xx — сбой.' },
      envvar: { t: 'Переменная окружения', en: 'environment variable', d: 'Именованное значение в окружении процесса, в Python — os.environ. Место для паролей и ключей.' },
      pagination: { t: 'Пагинация', en: 'pagination', d: 'Выдача данных страницами: клиент берёт их по очереди, пока API не сообщит, что страниц больше нет.' },
      retryafter: { t: 'Retry-After', en: 'Retry-After', d: 'Заголовок ответа: через сколько секунд можно повторить запрос.' },
      backoff: { t: 'Экспоненциальная задержка', en: 'exponential backoff', d: 'Повтор с паузой, которая растёт вдвое после каждой неудачи: 1, 2, 4 секунды.' },
      normalize: { t: 'json_normalize', en: 'pandas.json_normalize', d: 'Функция pandas, которая раскладывает вложенные словари в столбцы вида brand.name.' },
      parquet: { t: 'Parquet', en: 'Apache Parquet', d: 'Колоночный формат файлов: значения по столбцам, сжатие и схема с типами внутри файла.' },
      chunks: { t: 'Итератор кусков', en: 'chunked reading, chunksize', d: 'Чтение по частям: read_csv с chunksize отдаёт таблицы по N строк, по одной за шаг цикла.' }
    },
    materials: [
      ['da-2-2-loading.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/orders_crm.csv', 'Учебная выгрузка CRM: 8 заказов, cp1251, «;»'],
      ['data/crm_by_month.xlsx', 'Те же заказы CRM по листам «Январь», «Февраль», «Март»'],
      ['data/shop.db', 'SQLite с таблицей orders: 15 заказов сайта'],
      ['data/app_orders.json', '10 заказов приложения для учебного сервера'],
      ['api_server.py', 'Учебный API: страницы, ключ, лимит'],
      ['load_csv.py', 'Чтение файла CRM с явными типами'],
      ['load_db.py', 'Запрос к базе с параметрами'],
      ['load_api.py', 'Обход API по страницам'],
      ['save_parquet.py', 'Склейка и сохранение в parquet'],
      ['read_excel.py', 'Чтение книги Excel'],
      ['gen_data.py', 'Генератор учебных данных с зерном 22']
    ],
    prompts: [
      ['Тренажёр read_csv', 'Покажи кривой фрагмент CSV в 3–4 строки и попроси подобрать аргументы read_csv. Ответ не называй: после моего варианта объясни по источнику, что прочитается не так.'],
      ['Разбор моей загрузки', 'Я вставлю свой код загрузки. Найди угаданные типы, секреты в коде, запросы из f-строк и места, где обход страниц теряет данные. Предложи правки по источнику.'],
      ['Обход своего API', 'Я опишу свой API. Вопросами помоги спроектировать цикл загрузки: признак конца, пауза, повторы, таймаут. Проверяй, понимаю ли я каждую строку.']
    ]
  };
})();
