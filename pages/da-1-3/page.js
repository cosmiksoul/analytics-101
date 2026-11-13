/* Страница 1.3 · Условия, циклы, функции, comprehensions */
(() => {
  const R = String.raw;
  // учебная выгрузка заказов: бренд записан как попало, сумма в рублях, статус
  const ROWS = [[' lumo', 1200, 'paid'], ['BRISA', 850, 'cancelled'], ['Lumo ', 2300, 'paid'], ['kedr', 640, 'paid'],
    ['brisa', 1750, 'paid'], ['KEDR ', 990, 'cancelled'], ['Lumo', 1430, 'paid'], ['Brisa ', 560, 'paid']];
  const OK = r => r[2] === 'paid';
  const PAID = ROWS.filter(OK).map(r => r[1]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ===================== Сцена: фильтр, цикл, comprehension ===================== */
  const CODE = {
    one: ['paid = []', 'if rows[0]["status"] == "paid":', '    paid.append(rows[0]["amount"])'],
    copy: ['paid = []'].concat(...ROWS.map((r, i) => [`if rows[${i}]["status"] == "paid":`, `    paid.append(rows[${i}]["amount"])`])),
    loop: ['paid = []', 'for row in rows:', '    if row["status"] == "paid":', '        paid.append(row["amount"])'],
    comp: ['paid = [row["amount"] for row in rows if row["status"] == "paid"]'],
    sum: ['paid = [row["amount"] for row in rows if row["status"] == "paid"]', 'total = sum(paid)']
  };
  const LABEL = { one: 'одно условие', copy: 'вариант 1 · копипаст', loop: 'вариант 2 · цикл for', comp: 'вариант 3 · comprehension', sum: 'comprehension и агрегат' };
  const SEG = { e: 'row["amount"]', f: 'for row in rows', c: 'if row["status"] == "paid"' };
  const NUM = { e: '①', f: '②', c: '③' };
  const lines = n => `${n} ${['строка', 'строки', 'строк'][n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2]}`;
  // прогон по строкам выгрузки внутри шага: какая строка сейчас и на какой фазе
  const run = (p, a, b, n) => { const q = clamp((p - a) / (b - a), 0, 1) * n; return q >= n ? { i: n, f: 0, end: true } : { i: Math.floor(q), f: q - Math.floor(q), end: false }; };
  const check = i => `rows[${i}]["status"] → '${ROWS[i][2]}' == 'paid' → ${OK(ROWS[i]) ? 'True' : 'False'}`;

  function sceneState(k, p) {
    const s = { k, v: null, mode: 'code', hl: -1, seg: null, lit: [], cur: -1, ptr: false, mark: ROWS.map(() => 0), res: [], now: '', calls: [], lines: '0', idx: false, total: false, bars: 0 };
    const mark = i => { s.mark[i] = OK(ROWS[i]) ? 1 : 2; if (OK(ROWS[i])) s.res.push(ROWS[i][1]); };
    const all = () => ROWS.forEach((r, i) => mark(i));
    if (k === 0) {
      s.now = 'задача: суммы оплаченных заказов → список paid';
      if (p >= 0.45) s.calls.push({ to: 'rows', t: '2 заказа из 8 отменены' });
    } else if (k === 1) {
      s.v = 'one'; s.lines = '3';
      if (p < 0.25) { s.hl = 0; s.now = 'paid = [] — пустой список для результата'; }
      else if (p < 0.62) { s.hl = 1; s.cur = 0; s.now = check(0); }
      else { s.hl = 2; s.cur = 0; mark(0); s.now = 'True → выполнена строка с отступом: paid.append(1200)'; }
      if (p >= 0.4) s.calls.push({ to: 'code', t: 'if: True → выполняем блок с отступом' });
    } else if (k === 2) {
      s.v = 'copy'; s.lines = '17';
      const r = run(p, 0.04, 0.92, 8);
      for (let j = 0; j < r.i; j++) mark(j);
      if (!r.end) {
        s.cur = r.i; s.now = check(r.i);
        if (r.f < 0.5) s.hl = 1 + 2 * r.i;
        else { mark(r.i); s.hl = OK(ROWS[r.i]) ? 2 + 2 * r.i : 1 + 2 * r.i; }
      } else { s.now = 'проверены все 8 строк: 16 строк кода на 8 строк данных'; s.calls.push({ to: 'res', t: '6 из 8 прошли фильтр' }); }
    } else if (k === 3) {
      s.v = 'copy'; s.lines = '17'; all(); s.idx = true;
      s.now = 'номер строки вписан руками: rows[0] … rows[7]';
      if (p >= 0.15) s.calls.push({ to: 'code', t: '16 номеров вписаны руками', warn: 1 });
      if (p >= 0.55) s.calls.push({ to: 'rows', t: '9-я строка → ещё 2 строки кода', warn: 1 });
    } else if (k === 4) {
      s.v = 'loop'; s.lines = '4';
      if (p < 0.2) { s.hl = 0; s.now = 'paid = [] — пустой список для результата'; }
      else {
        s.cur = 0; s.ptr = true;
        if (p < 0.45) { s.hl = 1; s.now = 'row = rows[0] · итерация 1'; }
        else if (p < 0.7) { s.hl = 2; s.now = check(0).replace('rows[0]', 'row'); }
        else { s.hl = 3; mark(0); s.now = 'paid.append(row["amount"]) → 1200'; }
      }
      if (p >= 0.3) s.calls.push({ to: 'row:0', t: 'row = строка 1 · итерация 1' });
    } else if (k === 5) {
      s.v = 'loop'; s.lines = '4'; mark(0); s.ptr = true;
      const r = run(p, 0.04, 0.9, 7);
      for (let j = 0; j < r.i; j++) mark(j + 1);
      if (!r.end) {
        const i = r.i + 1; s.cur = i;
        if (r.f < 0.3) { s.hl = 1; s.now = `row = rows[${i}] · итерация ${i + 1}`; }
        else if (r.f < 0.62) { s.hl = 2; s.now = check(i).replace(`rows[${i}]`, 'row'); }
        else { mark(i); s.hl = OK(ROWS[i]) ? 3 : 2; s.now = OK(ROWS[i]) ? `paid.append(row["amount"]) → ${ROWS[i][1]}` : 'False → append пропущен, следующая итерация'; }
      } else { s.cur = 7; s.now = '8 итераций, цикл закончен'; s.calls.push({ to: 'code', t: '4 строки на выгрузку любой длины' }); }
    } else if (k === 6) {
      s.v = 'comp'; s.lines = '1';
      const r = run(p, 0.05, 0.9, 8);
      for (let j = 0; j < r.i; j++) mark(j);
      if (!r.end) {
        s.cur = r.i; s.ptr = true;
        if (r.f < 0.33) { s.seg = 'f'; s.now = `for row in rows → row = rows[${r.i}]`; }
        else if (r.f < 0.66) { s.seg = 'c'; s.now = check(r.i).replace(`rows[${r.i}]`, 'row'); }
        else { mark(r.i); s.seg = OK(ROWS[r.i]) ? 'e' : 'c'; s.now = OK(ROWS[r.i]) ? `row["amount"] → ${ROWS[r.i][1]} в список` : 'False → строка в список не попадает'; }
      } else { s.now = 'тот же список paid, что у цикла'; s.calls.push({ to: 'code', t: '1 строка · тот же список' }); }
    } else if (k === 7) {
      s.mode = 'dis'; s.lines = '1'; all();
      ['f', 'c', 'e'].forEach((x, j) => { if (p >= 0.1 + j * 0.28) s.lit.push(x); });
    } else if (k === 8) {
      s.mode = 'cmp'; s.lines = '17/4/1'; all();
      s.bars = Math.round(clamp(p / 0.5, 0, 1) * 10) / 10;
      if (p >= 0.55) s.calls.push({ to: 'res', t: 'во всех трёх вариантах paid одинаковый' });
    } else {
      s.v = 'sum'; s.lines = '2'; all();
      s.hl = p < 0.35 ? 0 : 1; s.total = p >= 0.45;
      s.now = s.total ? 'sum(paid) → 7880' : 'paid = [1200, 2300, 640, 1750, 1430, 560]';
      if (p >= 0.6) s.calls.push({ to: 'res', t: 'агрегат: 6 сумм → одно число' });
    }
    return s;
  }

  const scene = {
    parts: [{ n: '01', name: 'Условие', s: [0, 1] }, { n: '02', name: 'Копипаст', s: [2, 3] }, { n: '03', name: 'Цикл', s: [4, 5] }, { n: '04', name: 'Comprehension', s: [6, 7] }, { n: '05', name: 'Итог', s: [8, 9] }],
    steps: [
      { title: 'Восемь строк выгрузки', dur: 3000, body: '<p>Учебная выгрузка заказов: у&nbsp;каждой строки бренд, сумма и&nbsp;статус. Два заказа отменены, у&nbsp;них статус <b>cancelled</b>.</p><p>Задача — собрать в&nbsp;список <b>paid</b> суммы только оплаченных заказов, а&nbsp;потом посчитать их итог.</p>' },
      { title: 'Одно условие', dur: 3400, body: '<p><b>if</b> проверяет первую строку: статус равен «paid»? Ответ — True, поэтому выполняется строка с&nbsp;отступом под if, и&nbsp;1200 попадает в&nbsp;paid.</p><p>Будь ответ False, Python пропустил бы строку с&nbsp;отступом.</p>' },
      { title: 'Копипаст на всю выгрузку', dur: 5200, body: '<p>Чтобы проверить все восемь строк, пару «if и&nbsp;append» копируют восемь раз, меняя номер строки. Выходит 17&nbsp;строк кода.</p><p>Результат верный: в&nbsp;paid шесть сумм из&nbsp;восьми.</p>' },
      { title: 'Код растёт вместе с данными', dur: 3600, body: '<p>Номер строки вписан руками в&nbsp;16 местах. Придёт девятая строка — код её не&nbsp;увидит, пока не&nbsp;допишете ещё две строки.</p><p>Опечатка в&nbsp;одном номере ошибки не&nbsp;даст: одна сумма посчитается дважды, а&nbsp;другая пропадёт.</p>' },
      { title: 'Цикл for', dur: 3600, body: '<p>Цикл <b>for row in rows</b> повторяет тело для каждой строки по&nbsp;очереди. На&nbsp;каждом проходе, или итерации, очередная строка лежит в&nbsp;переменной <b>row</b>.</p><p>Первая итерация: row — строка 1, условие истинно, 1200 уходит в&nbsp;paid.</p>' },
      { title: 'Итерация за итерацией', dur: 5600, body: '<p>Те же три строки тела выполняются для строк 2–8. Отменённые заказы условие не&nbsp;проходят, и&nbsp;append для них не&nbsp;выполняется.</p><p>Кода четыре строки, и&nbsp;столько же останется для девяти строк или миллиона.</p>' },
      { title: 'Comprehension в одну строку', dur: 5200, body: '<p>Comprehension записывает тот же цикл одним выражением в&nbsp;квадратных скобках: перебрать rows, оставить оплаченные, положить сумму.</p><p>Список paid получается тот же.</p>' },
      { title: 'Как читать comprehension', dur: 4200, body: '<p>Читайте в&nbsp;порядке выполнения: <b>for row in rows</b> — откуда брать, <b>if …</b> — какие оставить, и&nbsp;только потом <b>row["amount"]</b> в&nbsp;начале — что положить.</p><p>Цвета частей совпадают со&nbsp;строками цикла.</p>' },
      { title: 'Три варианта, один результат', dur: 3600, body: '<p>Копипаст, цикл и&nbsp;comprehension дали одинаковый список paid. Строк кода — 17, 4 и&nbsp;1.</p><p>Разница не&nbsp;в&nbsp;результате, а&nbsp;в&nbsp;том, сколько кода нужно прочитать и&nbsp;поправить.</p>' },
      { title: 'Агрегат', dur: 4000, next: 'Читать страницу', body: '<p><b>sum(paid)</b> сворачивает шесть сумм в&nbsp;одно число — 7&nbsp;880&nbsp;₽. Проверка, преобразование и&nbsp;итог получились без единой копии.</p><p>Дальше — как это устроено и&nbsp;где comprehension хуже цикла.</p>' }
    ],
    hud: [{ id: 'lines', label: 'Строк кода' }, { id: 'seen', label: 'Проверено' }, { id: 'kept', label: 'В paid' }],
    legend: '<span><i style="background:#36b8a6"></i>оплачен, прошёл фильтр</span><span><i style="background:#f2756a"></i>отменён</span><span><i class="sq" style="background:#24304a"></i>строка кода</span>',
    info: 'ВЫГРУЗКА',
    aiNote: 'В анимации учебная выгрузка из восьми заказов (бренд, сумма, статус; два заказа отменены). Список сумм оплаченных заказов собирают тремя способами: копипаст if для каждой строки (17 строк кода), цикл for (4 строки) и comprehension (1 строка). Результат один: [1200, 2300, 640, 1750, 1430, 560], сумма 7880 ₽.',
    mount(root, api) {
      const { esc, hl } = api;
      let sig = '';
      const callH = c => c ? `<span class="cf-call${c.warn ? ' warn' : ''}">${esc(c.t)}</span>` : '';
      const callTo = (s, to) => callH(s.calls.find(c => c.to === to));
      const compLine = (s, num) => `paid = [${['e', 'f', 'c'].map(x => `<span class="sg ${x}${s.seg === x || s.lit.includes(x) ? ' on' : ''}">${hl(SEG[x])}${num ? `<sup>${NUM[x]}</sup>` : ''}</span>`).join(' ')}]`;
      function codeBox(s) {
        if (!s.v) return `<div class="cf-box cf-code"><div class="cf-hd"><span>код</span><span class="cf-tag">0 строк</span></div><div class="cf-empty">код ещё не написан</div><div class="cf-now">${esc(s.now)}</div>${callTo(s, 'code')}</div>`;
        const L = CODE[s.v], focus = s.hl >= 0 ? s.hl : s.cur >= 0 ? 1 + 2 * s.cur : 1;
        let out = '', gap = false;
        L.forEach((t, j) => {
          const far = L.length > 6 && j !== 0 && Math.abs(j - focus) > 2;
          if (far && !gap) out += '<div class="cf-ln ell"><i></i><code>⋯</code></div>';
          gap = far;
          let h = j === 0 && (s.v === 'comp' || s.v === 'sum') ? compLine(s) : hl(t);
          if (s.idx) h = h.replace(/\[<span class="num">(\d)<\/span>\]/g, '[<span class="num idx">$1</span>]');
          out += `<div class="cf-ln${s.hl === j ? ' hl' : ''}${far ? ' far' : ''}"><i>${j + 1}</i><code>${h}</code>${callTo(s, 'ln:' + j)}</div>`;
        });
        return `<div class="cf-box cf-code"><div class="cf-hd"><span>${esc(LABEL[s.v])}</span><span class="cf-tag">${lines(L.length)}</span></div><div class="cf-lines">${out}</div><div class="cf-now">${esc(s.now)}</div>${callTo(s, 'code')}</div>`;
      }
      function disBox(s) {
        const on = x => s.lit.includes(x) ? ' on' : '';
        const loop = [['paid = []'], [`<span class="sg f${on('f')}">${hl(SEG.f)}</span>:`], [`    <span class="sg c${on('c')}">${hl(SEG.c)}</span>:`], [`        paid.append(<span class="sg e${on('e')}">${hl(SEG.e)}</span>)`]];
        return `<div class="cf-box cf-code"><div class="cf-hd"><span>одна строка ↔ четыре</span><span class="cf-tag">тот же порядок</span></div>
<div class="cf-lines"><div class="cf-ln"><i>1</i><code>${compLine(s, true)}</code></div></div><div class="cf-sep">то же самое циклом</div>
<div class="cf-lines">${loop.map((h, j) => `<div class="cf-ln"><i>${j + 1}</i><code>${h[0]}</code></div>`).join('')}</div>
<div class="cf-legend">${['f', 'c', 'e'].map(x => `<span class="cf-lg ${x}${on(x)}">${NUM[x]} ${{ f: 'откуда брать', c: 'какие оставить', e: 'что положить' }[x]}</span>`).join('<b>→</b>')}</div></div>`;
      }
      function cmpBox(s) {
        const V = [['копипаст', 17], ['цикл for', 4], ['comprehension', 1]];
        return `<div class="cf-box cf-code cf-cmp"><div class="cf-hd"><span>три варианта кода</span><span class="cf-tag">один результат</span></div>
${V.map(([n, c]) => `<div class="cf-cr"><span>${n}</span><span class="cf-bw"><span class="cf-bar" style="width:${(c / 17 * 100 * s.bars).toFixed(1)}%"></span></span><b>${lines(c)}</b></div>`).join('')}
<div class="cf-now">paid1 == paid2 == paid3 → True</div></div>`;
      }
      function resBox(s) {
        const chips = s.res.map(a => `<span class="cf-chip">${a}</span>`).join('');
        return `<div class="cf-box cf-res"><span class="lb">paid =</span><span class="cf-chips">[${chips || '&nbsp;'}]</span>${s.total ? '<span class="cf-total">total = 7880</span>' : ''}${callTo(s, 'res')}</div>`;
      }
      return {
        render(k, p) {
          const s = sceneState(k, p);
          const seen = s.mark.filter(Boolean).length;
          api.hud('lines', s.lines, k === 9 ? 'с sum' : '');
          api.hud('seen', `${seen}/8`);
          api.hud('kept', String(s.res.length), s.total ? '7 880 ₽' : '');
          const key = JSON.stringify(s);
          if (key === sig) return; sig = key;
          const rows = ROWS.map((r, i) => {
            const m = s.mark[i];
            return `<div class="cf-row${s.cur === i ? ' cur' : ''}${m === 1 ? ' ok' : m === 2 ? ' no' : ''}"><i>${i + 1}</i><b>'${esc(r[0])}'</b><span class="am">${r[1]}</span><em class="${OK(r) ? 'p' : 'c'}">${r[2]}</em><s>${m === 1 ? '✓' : m === 2 ? '✕' : ''}</s>${s.cur === i && s.ptr ? '<u>row</u>' : ''}${callTo(s, 'row:' + i)}</div>`;
          }).join('');
          const right = s.mode === 'dis' ? disBox(s) : s.mode === 'cmp' ? cmpBox(s) : codeBox(s);
          root.innerHTML = `<div class="cf"><div class="cf-box cf-rows"><div class="cf-hd"><span>rows</span><span class="cf-tag">8 строк</span></div><div class="cf-list">${rows}</div>${callTo(s, 'rows')}</div><div class="cf-right">${right}${resBox(s)}</div></div>`;
        }
      };
    }
  };

  /* ===================== Интерактив «Трассировка» ===================== */
  // Трасса записана настоящим Python 3.13.18 через sys.settrace (скрипт trace_paid_brands.py из «Материалов»):
  // по шагу на каждое событие call, line и return в файле с кодом ниже. Поля: e — событие, l — строка,
  // it — индекс строки выгрузки в row, b — длина brands, n — вызовов clean_brand, s — стек [функция, строка, переменные], t — пояснение, r — что вернул return.
  const TRACE = {"loop":[{"e":"l","l":1,"it":-1,"b":-1,"n":0,"s":[["<module>",1,[["rows","@R"]]]],"t":"def создаёт функцию clean_brand, но её тело пока не выполняется: Python только запоминает, что делать при вызове."},{"e":"l","l":4,"it":-1,"b":-1,"n":0,"s":[["<module>",4,[["rows","@R"],["clean_brand","@C"]]]],"t":"Второй def — функция paid_brands. В глобальной области теперь три имени: rows и две функции."},{"e":"l","l":11,"it":-1,"b":-1,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]]],"t":"Вызов paid_brands(rows): аргумент — выгрузка из пяти строк. Сейчас в стеке появится новый кадр."},{"e":"c","l":4,"it":-1,"b":-1,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",4,[["rows","@R"]]]],"t":"Вход в paid_brands. У функции свой кадр: параметр rows смотрит на ту же выгрузку, что и глобальное имя rows."},{"e":"l","l":5,"it":-1,"b":-1,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"]]]],"t":"Строка 5: заводим пустой список brands. Он будет расти на глазах: следите за таблицей переменных."},{"e":"l","l":6,"it":-1,"b":0,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","[]"]]]],"t":"Строка 6: for берёт первую строку выгрузки и кладёт её в переменную row. Начинается первая итерация."},{"e":"l","l":7,"it":0,"b":0,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 1: 'paid' == 'paid' → True. Условие истинно, выполняем строку с отступом."},{"e":"l","l":8,"it":0,"b":0,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Строка 8: сначала вызывается clean_brand(row[\"brand\"]) с аргументом ' lumo', потом append допишет ответ в brands."},{"e":"c","l":1,"it":0,"b":0,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",1,[["name","' lumo'"]]]],"t":"Вызов clean_brand: новый кадр поверх paid_brands. Параметр name получил значение аргумента ' lumo'. Переменных row и rows в этом кадре нет."},{"e":"l","l":2,"it":0,"b":0,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",2,[["name","' lumo'"]]]],"t":"Строка 2: убрать пробелы по краям и сделать первую букву заглавной: ' lumo' → 'Lumo'."},{"e":"r","l":2,"it":0,"b":0,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",2,[["name","' lumo'"]]]],"t":"clean_brand возвращает 'Lumo'. Её кадр уходит из стека, переменная name исчезает вместе с ним.","r":"'Lumo'"},{"e":"l","l":6,"it":0,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"append дописал 'Lumo' в brands. Строка 6: for берёт следующую строку, итерация 2."},{"e":"l","l":7,"it":1,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'BRISA', 'amount': 850, 'status': 'cancelled'}"]]]],"t":"Строка 7, итерация 2: 'cancelled' == 'paid' → False. Условие ложно: строка 8 пропускается."},{"e":"l","l":6,"it":1,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'BRISA', 'amount': 850, 'status': 'cancelled'}"]]]],"t":"brands не изменился. Строка 6: for берёт следующую строку, итерация 3."},{"e":"l","l":7,"it":2,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 3: 'paid' == 'paid' → True. Условие истинно, выполняем строку с отступом."},{"e":"l","l":8,"it":2,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Строка 8: сначала вызывается clean_brand(row[\"brand\"]) с аргументом 'Lumo ', потом append допишет ответ в brands."},{"e":"c","l":1,"it":2,"b":1,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",1,[["name","'Lumo '"]]]],"t":"Вызов clean_brand: новый кадр поверх paid_brands. Параметр name получил значение аргумента 'Lumo '. Переменных row и rows в этом кадре нет."},{"e":"l","l":2,"it":2,"b":1,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",2,[["name","'Lumo '"]]]],"t":"Строка 2: убрать пробелы по краям и сделать первую букву заглавной: 'Lumo ' → 'Lumo'."},{"e":"r","l":2,"it":2,"b":1,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",2,[["name","'Lumo '"]]]],"t":"clean_brand возвращает 'Lumo'. Её кадр уходит из стека, переменная name исчезает вместе с ним.","r":"'Lumo'"},{"e":"l","l":6,"it":2,"b":2,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"append дописал 'Lumo' в brands. Строка 6: for берёт следующую строку, итерация 4."},{"e":"l","l":7,"it":3,"b":2,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 4: 'paid' == 'paid' → True. Условие истинно, выполняем строку с отступом."},{"e":"l","l":8,"it":3,"b":2,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Строка 8: сначала вызывается clean_brand(row[\"brand\"]) с аргументом 'kedr', потом append допишет ответ в brands."},{"e":"c","l":1,"it":3,"b":2,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",1,[["name","'kedr'"]]]],"t":"Вызов clean_brand: новый кадр поверх paid_brands. Параметр name получил значение аргумента 'kedr'. Переменных row и rows в этом кадре нет."},{"e":"l","l":2,"it":3,"b":2,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",2,[["name","'kedr'"]]]],"t":"Строка 2: убрать пробелы по краям и сделать первую букву заглавной: 'kedr' → 'Kedr'."},{"e":"r","l":2,"it":3,"b":2,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",2,[["name","'kedr'"]]]],"t":"clean_brand возвращает 'Kedr'. Её кадр уходит из стека, переменная name исчезает вместе с ним.","r":"'Kedr'"},{"e":"l","l":6,"it":3,"b":3,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"append дописал 'Kedr' в brands. Строка 6: for берёт следующую строку, итерация 5."},{"e":"l","l":7,"it":4,"b":3,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 5: 'paid' == 'paid' → True. Условие истинно, выполняем строку с отступом."},{"e":"l","l":8,"it":4,"b":3,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 8: сначала вызывается clean_brand(row[\"brand\"]) с аргументом 'brisa', потом append допишет ответ в brands."},{"e":"c","l":1,"it":4,"b":3,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",1,[["name","'brisa'"]]]],"t":"Вызов clean_brand: новый кадр поверх paid_brands. Параметр name получил значение аргумента 'brisa'. Переменных row и rows в этом кадре нет."},{"e":"l","l":2,"it":4,"b":3,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",2,[["name","'brisa'"]]]],"t":"Строка 2: убрать пробелы по краям и сделать первую букву заглавной: 'brisa' → 'Brisa'."},{"e":"r","l":2,"it":4,"b":3,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",2,[["name","'brisa'"]]]],"t":"clean_brand возвращает 'Brisa'. Её кадр уходит из стека, переменная name исчезает вместе с ним.","r":"'Brisa'"},{"e":"l","l":6,"it":4,"b":4,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr', 'Brisa']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"append дописал 'Brisa' в brands. Строка 6: строк больше нет, цикл закончен. Переменная row по-прежнему хранит последнюю строку."},{"e":"l","l":9,"it":4,"b":4,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",9,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr', 'Brisa']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 9: return отдаёт список brands тому, кто вызвал функцию."},{"e":"r","l":9,"it":4,"b":4,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",9,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr', 'Brisa']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"paid_brands возвращает ['Lumo', 'Lumo', 'Kedr', 'Brisa']. Кадр функции уходит из стека вместе с её переменными.","r":"['Lumo', 'Lumo', 'Kedr', 'Brisa']"},{"e":"r","l":11,"it":-1,"b":-1,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"],["result","['Lumo', 'Lumo', 'Kedr', 'Brisa']"]]]],"t":"Программа закончилась: в глобальной области появилось имя result = ['Lumo', 'Lumo', 'Kedr', 'Brisa']. Кадров функций в стеке больше нет.","r":"None"}],"comp":[{"e":"l","l":1,"it":-1,"b":-1,"n":0,"s":[["<module>",1,[["rows","@R"]]]],"t":"def создаёт функцию clean_brand, но её тело пока не выполняется: Python только запоминает, что делать при вызове."},{"e":"l","l":4,"it":-1,"b":-1,"n":0,"s":[["<module>",4,[["rows","@R"],["clean_brand","@C"]]]],"t":"Второй def — функция paid_brands. В глобальной области теперь три имени: rows и две функции."},{"e":"l","l":9,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]]],"t":"Вызов paid_brands(rows): аргумент — выгрузка из пяти строк. Сейчас в стеке появится новый кадр."},{"e":"c","l":4,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",4,[["rows","@R"]]]],"t":"Вход в paid_brands. У функции свой кадр: параметр rows смотрит на ту же выгрузку, что и глобальное имя rows."},{"e":"l","l":6,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"]]]],"t":"Comprehension начинается не с первой строки, а с источника: Python берёт rows из строки 6."},{"e":"l","l":5,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"]]]],"t":"Строка 5: заводится пустой список для результата. Имени у него нет, поэтому в таблице переменных его не видно."},{"e":"l","l":6,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"]]]],"t":"Строка 6: for row in rows берёт первую строку выгрузки."},{"e":"l","l":7,"it":0,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 1: 'paid' == 'paid' → True. Условие истинно, дальше выражение из строки 5."},{"e":"l","l":5,"it":0,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Строка 5: выражение слева, clean_brand(row[\"brand\"]), с аргументом ' lumo'. Ответ уйдёт в скрытый список."},{"e":"c","l":1,"it":0,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",1,[["name","' lumo'"]]]],"t":"Вызов clean_brand: новый кадр поверх paid_brands. Параметр name получил значение аргумента ' lumo'. Переменных row и rows в этом кадре нет."},{"e":"l","l":2,"it":0,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",2,[["name","' lumo'"]]]],"t":"Строка 2: убрать пробелы по краям и сделать первую букву заглавной: ' lumo' → 'Lumo'."},{"e":"r","l":2,"it":0,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",2,[["name","' lumo'"]]]],"t":"clean_brand возвращает 'Lumo'. Её кадр уходит из стека, переменная name исчезает вместе с ним.","r":"'Lumo'"},{"e":"l","l":6,"it":0,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Ответ 'Lumo' дописан в скрытый список. Строка 6: for row in rows берёт следующую строку, итерация 2."},{"e":"l","l":7,"it":1,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': 'BRISA', 'amount': 850, 'status': 'cancelled'}"]]]],"t":"Строка 7, итерация 2: 'cancelled' == 'paid' → False. Условие ложно: выражение из строки 5 для этой строки не вычисляется."},{"e":"l","l":6,"it":1,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': 'BRISA', 'amount': 850, 'status': 'cancelled'}"]]]],"t":"Строка 6: for row in rows берёт следующую строку, итерация 3."},{"e":"l","l":7,"it":2,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 3: 'paid' == 'paid' → True. Условие истинно, дальше выражение из строки 5."},{"e":"l","l":5,"it":2,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Строка 5: выражение слева, clean_brand(row[\"brand\"]), с аргументом 'Lumo '. Ответ уйдёт в скрытый список."},{"e":"c","l":1,"it":2,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",1,[["name","'Lumo '"]]]],"t":"Вызов clean_brand: новый кадр поверх paid_brands. Параметр name получил значение аргумента 'Lumo '. Переменных row и rows в этом кадре нет."},{"e":"l","l":2,"it":2,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",2,[["name","'Lumo '"]]]],"t":"Строка 2: убрать пробелы по краям и сделать первую букву заглавной: 'Lumo ' → 'Lumo'."},{"e":"r","l":2,"it":2,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",2,[["name","'Lumo '"]]]],"t":"clean_brand возвращает 'Lumo'. Её кадр уходит из стека, переменная name исчезает вместе с ним.","r":"'Lumo'"},{"e":"l","l":6,"it":2,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Ответ 'Lumo' дописан в скрытый список. Строка 6: for row in rows берёт следующую строку, итерация 4."},{"e":"l","l":7,"it":3,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 4: 'paid' == 'paid' → True. Условие истинно, дальше выражение из строки 5."},{"e":"l","l":5,"it":3,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Строка 5: выражение слева, clean_brand(row[\"brand\"]), с аргументом 'kedr'. Ответ уйдёт в скрытый список."},{"e":"c","l":1,"it":3,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",1,[["name","'kedr'"]]]],"t":"Вызов clean_brand: новый кадр поверх paid_brands. Параметр name получил значение аргумента 'kedr'. Переменных row и rows в этом кадре нет."},{"e":"l","l":2,"it":3,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",2,[["name","'kedr'"]]]],"t":"Строка 2: убрать пробелы по краям и сделать первую букву заглавной: 'kedr' → 'Kedr'."},{"e":"r","l":2,"it":3,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",2,[["name","'kedr'"]]]],"t":"clean_brand возвращает 'Kedr'. Её кадр уходит из стека, переменная name исчезает вместе с ним.","r":"'Kedr'"},{"e":"l","l":6,"it":3,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Ответ 'Kedr' дописан в скрытый список. Строка 6: for row in rows берёт следующую строку, итерация 5."},{"e":"l","l":7,"it":4,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 5: 'paid' == 'paid' → True. Условие истинно, дальше выражение из строки 5."},{"e":"l","l":5,"it":4,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 5: выражение слева, clean_brand(row[\"brand\"]), с аргументом 'brisa'. Ответ уйдёт в скрытый список."},{"e":"c","l":1,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",1,[["name","'brisa'"]]]],"t":"Вызов clean_brand: новый кадр поверх paid_brands. Параметр name получил значение аргумента 'brisa'. Переменных row и rows в этом кадре нет."},{"e":"l","l":2,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",2,[["name","'brisa'"]]]],"t":"Строка 2: убрать пробелы по краям и сделать первую букву заглавной: 'brisa' → 'Brisa'."},{"e":"r","l":2,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",2,[["name","'brisa'"]]]],"t":"clean_brand возвращает 'Brisa'. Её кадр уходит из стека, переменная name исчезает вместе с ним.","r":"'Brisa'"},{"e":"l","l":6,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Ответ 'Brisa' дописан в скрытый список. Строка 6: строк больше нет, перебор закончен."},{"e":"l","l":5,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 5: comprehension отдаёт собранный список. Переменная row сейчас исчезнет: за пределы comprehension она не выходит."},{"e":"r","l":5,"it":-1,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"]]]],"t":"paid_brands возвращает ['Lumo', 'Lumo', 'Kedr', 'Brisa']. Кадр функции уходит из стека вместе с её переменными.","r":"['Lumo', 'Lumo', 'Kedr', 'Brisa']"},{"e":"r","l":9,"it":-1,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"],["result","['Lumo', 'Lumo', 'Kedr', 'Brisa']"]]]],"t":"Программа закончилась: в глобальной области появилось имя result = ['Lumo', 'Lumo', 'Kedr', 'Brisa']. Кадров функций в стеке больше нет.","r":"None"}]};
  const TSRC = {
    loop: R`def clean_brand(name):
    return name.strip().title()

def paid_brands(rows):
    brands = []
    for row in rows:
        if row["status"] == "paid":
            brands.append(clean_brand(row["brand"]))
    return brands

result = paid_brands(rows)`,
    comp: R`def clean_brand(name):
    return name.strip().title()

def paid_brands(rows):
    return [clean_brand(row["brand"])
            for row in rows
            if row["status"] == "paid"]

result = paid_brands(rows)`
  };
  const TX = { '@R': 'список из 5 строк выгрузки', '@C': 'функция clean_brand', '@P': 'функция paid_brands' };
  const T5 = ROWS.slice(0, 5);

  function buildTrace(box, api) {
    const { $, esc, hl } = api;
    const exp = v => TX[v] || v;
    const fname = f => f === '<module>' ? 'глобальная область' : f;
    const LINES = { loop: TSRC.loop.split('\n'), comp: TSRC.comp.split('\n') };
    const TASKS = ['Найдите шаг, где в стеке три кадра.', 'В версии с циклом найдите, когда в brands появляется второй бренд.', 'В версии с comprehension дойдите до return в paid_brands. Было ли у списка имя?'];
    box.innerHTML = `<div class="block-hd"><span class="t">У каждого вызова свой кадр и свои переменные <i>интерактив</i></span><div class="ctrls"><span class="seg" role="group" aria-label="Версия функции"><button type="button" data-m="loop" aria-pressed="true">Цикл</button><button type="button" data-m="comp" aria-pressed="false">Comprehension</button></span><button type="button" class="btn ghost small" id="tr-reset">Сбросить</button></div></div>
<p class="hint tr-do">Шагайте кнопками или стрелками ← →. Переключатель меняет версию функции на тех же данных.</p>
<div class="tr-stage"><div class="tr-main">
<div class="tr-code"><div class="tr-hd"><span id="tr-file"></span><span class="tr-tag">rows — 5 строк</span></div><div class="tr-lines" id="tr-lines"></div></div>
<div class="tr-nav"><button type="button" class="btn ghost small" id="tr-first" aria-label="В начало трассы">⏮</button><button type="button" class="btn ghost small" id="tr-prev">← Шаг</button><button type="button" class="btn small" id="tr-next">Шаг →</button><button type="button" class="btn ghost small" id="tr-play">▶ Авто</button><input type="range" id="tr-range" min="0" value="0" aria-label="Шаг трассы"></div>
<div class="tr-say" id="tr-say" aria-live="polite"></div>
<div class="tr-rows"><p class="cap">rows: учебная выгрузка</p><div id="tr-rows"></div></div>
</div><div class="narr tr-side"><p class="cap">Стек вызовов <small>сверху — текущий кадр</small></p><div class="tr-stack" id="tr-stack"></div><p class="cap">Задания</p><ol class="steps tr-tasks" id="tr-tasks"></ol></div></div>
<div class="status"><span><span class="dot live"></span><span id="tr-k"></span></span><span id="tr-l"></span><span id="tr-d"></span><span id="tr-c"></span><span class="grow"></span><span id="tr-m"></span></div>
<p class="tr-note">Трасса записана Python 3.13 через sys.settrace. В версии с comprehension служебный переход после ложного условия, который интерпретатор приписывает строке 5, склеен с шагом строки 7.</p>`;
    let mode = 'loop', i = 0, timer = 0, done = [false, false, false];
    const S = () => TRACE[mode];
    const stop = () => { clearInterval(timer); timer = 0; $('tr-play').textContent = '▶ Авто'; };
    function mapIndex(from, to, idx) {
      const a = TRACE[from][idx], B = TRACE[to];
      if (idx <= 3) return idx;
      if (a.it < 0) {
        if (idx < TRACE[from].length / 2) return B.findIndex(b => b.it === 0) - 1;
        return a.s.length === 1 ? B.length - 1 : B.length - 2;
      }
      let c = B.findIndex(b => b.it === a.it && b.l === a.l && b.e === a.e && b.s.length === a.s.length);
      if (c < 0) c = B.findIndex(b => b.it === a.it && b.s.length === a.s.length && b.e === a.e);
      if (c < 0) c = B.findIndex(b => b.it === a.it);
      return Math.max(0, c);
    }
    function draw() {
      const T = S(), st = T[i], prev = i ? T[i - 1] : null, top = st.s[st.s.length - 1];
      if (st.s.length === 3) done[0] = true;
      if (mode === 'loop' && st.b === 2) done[1] = true;
      if (mode === 'comp' && st.e === 'r' && top[0] === 'paid_brands') done[2] = true;
      $('tr-file').textContent = mode === 'loop' ? 'paid_brands.py · версия с циклом' : 'paid_brands.py · версия с comprehension';
      const callers = st.s.slice(1, -1).map(f => f[1]).concat(st.s.length > 1 ? [st.s[0][1]] : []);
      const ev = st.e === 'c' ? 'вызов' : st.e === 'r' ? 'return' : '';
      $('tr-lines').innerHTML = LINES[mode].map((t, j) => {
        const n = j + 1, cur = n === st.l, cal = !cur && callers.includes(n);
        return `<div class="tr-ln${cur ? ' cur' : ''}${cal ? ' cal' : ''}"><i>${n}</i><code>${hl(t) || ' '}</code>${cur && ev ? `<span class="tr-ev">${ev}</span>` : cal ? '<span class="tr-ev ghost">ждёт</span>' : ''}</div>`;
      }).join('');
      $('tr-stack').innerHTML = st.s.slice().reverse().map((f, j) => {
        const depth = st.s.length - 1 - j, pf = prev && prev.s[depth] && prev.s[depth][0] === f[0] ? prev.s[depth] : null, isTop = j === 0;
        const vars = f[2].length ? `<table>${f[2].map(([k, v]) => { const pv = pf && pf[2].find(x => x[0] === k); const chg = prev && (!pv || pv[1] !== v); return `<tr${chg ? ' class="chg"' : ''}><td>${esc(k)}</td><td>${esc(exp(v))}</td></tr>`; }).join('')}</table>` : '<p class="tr-none">переменных пока нет</p>';
        const ret = isTop && st.e === 'r' ? `<div class="tr-ret">return → ${esc(st.r)}</div>` : '';
        return `<div class="tr-fr${isTop ? ' top' : ''}"><div class="tr-fh"><b>${esc(fname(f[0]))}</b><span>строка ${f[1]}</span></div>${vars}${ret}</div>`;
      }).join('');
      $('tr-rows').innerHTML = `<table class="tr-tb"><thead><tr><th>индекс</th><th>brand</th><th>amount</th><th>status</th></tr></thead><tbody>${T5.map((r, j) => `<tr${st.it === j ? ' class="on"' : ''}><td>${st.it === j ? '<b>row →</b>' : `[${j}]`}</td><td>'${esc(r[0])}'</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>`;
      $('tr-say').textContent = st.t;
      $('tr-tasks').innerHTML = TASKS.map((t, j) => `<li class="${done[j] ? 'on' : ''}"><b>${done[j] ? '✓' : j + 1}</b>${esc(t)}</li>`).join('');
      $('tr-k').textContent = `Шаг ${i + 1} из ${T.length}`;
      $('tr-l').textContent = `строка ${st.l}`;
      $('tr-d').textContent = `кадров в стеке: ${st.s.length}`;
      $('tr-c').textContent = `вызовов clean_brand: ${st.n}`;
      $('tr-m').textContent = `шагов: цикл ${TRACE.loop.length}, comprehension ${TRACE.comp.length}`;
      $('tr-range').max = String(T.length - 1); $('tr-range').value = String(i);
      $('tr-prev').disabled = i === 0; $('tr-first').disabled = i === 0; $('tr-next').disabled = i === T.length - 1;
      box.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
    }
    const go = n => { i = clamp(n, 0, S().length - 1); if (i === S().length - 1) stop(); draw(); };
    $('tr-next').addEventListener('click', () => go(i + 1));
    $('tr-prev').addEventListener('click', () => { stop(); go(i - 1); });
    $('tr-first').addEventListener('click', () => { stop(); go(0); });
    $('tr-range').addEventListener('input', e => { stop(); go(+e.target.value); });
    $('tr-play').addEventListener('click', () => {
      if (timer) { stop(); return; }
      if (i >= S().length - 1) i = 0;
      $('tr-play').textContent = '❚❚ Пауза';
      timer = setInterval(() => go(i + 1), 900);
      draw();
    });
    box.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.m === mode) return;
      i = mapIndex(mode, b.dataset.m, i); mode = b.dataset.m; draw();
    }));
    $('tr-reset').addEventListener('click', () => { stop(); mode = 'loop'; i = 0; done = [false, false, false]; draw(); });
    box.addEventListener('keydown', e => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); go(i - 1); }
    });
    draw();
    return {
      describe() {
        const st = S()[i], top = st.s[st.s.length - 1];
        return `версия: ${mode === 'loop' ? 'цикл' : 'comprehension'}; шаг ${i + 1} из ${S().length}, строка ${st.l}; стек: ${st.s.map(f => fname(f[0])).join(' → ')}; переменные текущего кадра: ${top[2].map(([k, v]) => `${k} = ${exp(v)}`).join('; ') || 'нет'}; выполнено заданий: ${done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-1-3',
    short: 'DA-01',
    title: 'Условия, циклы, функции, comprehensions',
    where: 'блок «Дата аналитика», тема 01 «Python для анализа», страница 1.3',
    aiData: 'учебная выгрузка из восьми заказов интернет-магазина: бренд с разным написанием, сумма в рублях и статус paid или cancelled',
    scene,
    widgets: { trace: buildTrace },
    code: {
      basics: { title: 'Условие, for, enumerate, zip и while на суммах заказов', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`amounts = [1200, 850, 2300, 640, 1750]           # суммы заказов из страницы 1.1, ₽
brands = ["Lumo", "Brisa", "Lumo", "Kedr", "Brisa"]

# if / elif / else: срабатывает первая истинная ветка, остальные не проверяются
for a in amounts[:3]:
    if a >= 2000:
        print(a, "крупный")
    elif a >= 1000:
        print(a, "средний")
    else:
        print(a, "мелкий")

# enumerate: номер и элемент сразу; zip: два списка в ногу
for i, brand in enumerate(brands[:2], start=1):
    print(i, brand)
for brand, a in zip(brands[:2], amounts):
    print(brand, a)

# while: сколько первых заказов нужно, чтобы выручка дошла до 5000 ₽
total, n = 0, 0
while total < 5000 and n < len(amounts):   # второе условие — страховка от выхода за край
    total += amounts[n]
    n += 1
print(n, total)`,
        out: R`1200 средний
850 мелкий
2300 крупный
1 Lumo
2 Brisa
Lumo 1200
Brisa 850
5 6740` },
      recur: { title: 'Рекурсия: сколько товаров в каталоге', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`import sys

# Учебный каталог магазина: в разделе либо подразделы, либо число товаров
catalog = {"Одежда": {"Куртки": 12, "Футболки": 30},
           "Обувь": {"Кеды": 8, "Ботинки": {"Зимние": 5, "Демисезонные": 7}}}


def count_items(node):
    if isinstance(node, int):         # базовый случай: дальше спускаться некуда
        return node
    total = 0
    for child in node.values():
        total += count_items(child)   # функция вызывает сама себя
    return total


print(count_items(catalog))
print(count_items(catalog["Обувь"]))
print(sys.getrecursionlimit())        # предел глубины стека по умолчанию`,
        out: R`62
20
1000`,
        note: 'Глубже всего стек на «Зимних» ботинках: поверх глобальной области четыре кадра count_items — для каталога, «Обуви», «Ботинок» и самого числа 5.' },
      defaults: { title: 'Значение по умолчанию создаётся один раз', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`def f(x, acc=[]):        # список создаётся один раз — когда выполняется def
    acc.append(x)
    return acc

print(f(1))
print(f(2))              # тот же список, что и в первом вызове
print(f.__defaults__)    # он хранится в самой функции


def g(x, acc=None):      # исправление: None по умолчанию, новый список внутри
    if acc is None:
        acc = []
    acc.append(x)
    return acc

print(g(1))
print(g(2))`,
        out: R`[1]
[1, 2]
([1, 2],)
[1]
[2]` },
      leak: { title: 'Переменная цикла после цикла', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`rows = [{"brand": " lumo", "amount": 1200}, {"brand": "BRISA", "amount": 850}]

for row in rows:
    pass
print(row)               # переменная цикла пережила цикл: последняя строка

amounts = [r["amount"] for r in rows]
print("r" in globals())  # переменная comprehension наружу не выходит

for late in []:          # пустая выгрузка: ни одной итерации
    pass
print(late)`,
        outLabel: 'Вывод: путь к файлу в трассировке ошибки сокращён',
        out: R`{'brand': 'BRISA', 'amount': 850}
False
Traceback (most recent call last):
  File "leak.py", line 12, in <module>
    print(late)
          ^^^^
NameError: name 'late' is not defined` },
      guard: { title: 'Вложенные if и ранний return дают один ответ', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`def order_label(row):            # вложенные if: логика уходит вправо
    if row["status"] == "paid":
        if row["amount"] is not None:
            if row["amount"] >= 2000:
                return "крупный"
            else:
                return "обычный"
        else:
            return "нет суммы"
    else:
        return "не оплачен"


def order_label_flat(row):       # ранний return: сначала отсекаем особые случаи
    if row["status"] != "paid":
        return "не оплачен"
    if row["amount"] is None:
        return "нет суммы"
    if row["amount"] >= 2000:
        return "крупный"
    return "обычный"


test = [{"status": "paid", "amount": 2300}, {"status": "paid", "amount": 640},
        {"status": "paid", "amount": None}, {"status": "cancelled", "amount": 850}]
print([order_label(r) for r in test])
print([order_label_flat(r) for r in test])`,
        out: R`['крупный', 'обычный', 'нет суммы', 'не оплачен']
['крупный', 'обычный', 'нет суммы', 'не оплачен']` },
      brand: { title: 'Функция очистки бренда и выручка по брендам', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`# Учебная выгрузка заказов: бренд записан как попало
rows = [
    {"brand": " lumo",  "amount": 1200, "status": "paid"},
    {"brand": "BRISA",  "amount": 850,  "status": "cancelled"},
    {"brand": "Lumo ",  "amount": 2300, "status": "paid"},
    {"brand": "kedr",   "amount": 640,  "status": "paid"},
    {"brand": "brisa",  "amount": 1750, "status": "paid"},
    {"brand": "KEDR ",  "amount": 990,  "status": "cancelled"},
    {"brand": "Lumo",   "amount": 1430, "status": "paid"},
    {"brand": "Brisa ", "amount": 560,  "status": "paid"},
]

ALIASES = {"бриза": "Brisa", "кедр": "Kedr"}  # русские написания тех же брендов


def clean_brand(name, default="Без бренда"):
    """Приводит название бренда к одному написанию."""
    if not name:                           # None и пустая строка
        return default
    key = " ".join(name.split()).lower()   # лишние пробелы и регистр
    return ALIASES.get(key, key.title())


for raw in [" lumo", "KEDR ", "brisa  ", "Бриза", "", None]:
    print(f"{raw!r:>10} → {clean_brand(raw)}")

# Проверка, преобразование и агрегат — один цикл без копипаста
totals = {}
for row in rows:
    if row["status"] == "paid":
        brand = clean_brand(row["brand"])
        totals[brand] = totals.get(brand, 0) + row["amount"]
print(totals)

# Доли брендов в выручке — dict comprehension
total = sum(totals.values())
shares = {brand: round(s / total * 100) for brand, s in totals.items()}
print(total, shares)`,
        out: R`   ' lumo' → Lumo
   'KEDR ' → Kedr
 'brisa  ' → Brisa
   'Бриза' → Brisa
        '' → Без бренда
      None → Без бренда
{'Lumo': 4930, 'Kedr': 640, 'Brisa': 2310}
7880 {'Lumo': 63, 'Kedr': 8, 'Brisa': 29}`,
        note: '<code>name.split()</code> без аргументов режет строку по любым пробелам и выбрасывает пустые куски, а <code>" ".join(…)</code> склеивает их обратно через один пробел. Так « Lumo  Kids » и «lumo kids» станут одним брендом.' },
      files: { title: 'Comprehension для списка файлов', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`import os

files = sorted(os.listdir("exports"))
print(files)

# Только выгрузки заказов в CSV: без возвратов, файлов Excel и README
orders_files = [f for f in files
                if f.startswith("orders_") and f.endswith(".csv")]
print(orders_files)

# dict comprehension: дата из имени файла → имя файла
by_date = {f[7:17]: f for f in orders_files}
print(by_date)`,
        out: R`['README.txt', 'orders_2026-11-01.csv', 'orders_2026-11-02.csv', 'orders_2026-11-03.csv', 'orders_2026-11-03.xlsx', 'returns_2026-11-02.csv', '~$orders_2026-11-03.xlsx']
['orders_2026-11-01.csv', 'orders_2026-11-02.csv', 'orders_2026-11-03.csv']
{'2026-11-01': 'orders_2026-11-01.csv', '2026-11-02': 'orders_2026-11-02.csv', '2026-11-03': 'orders_2026-11-03.csv'}`,
        note: 'В учебной папке exports семь файлов, их список — первая строка вывода. Comprehension разбит на две строки по скобкам: так он читается как фраза «файлы, которые начинаются с orders_ и кончаются на .csv».' },
      gen: { title: 'Генератор для файла, который не влезает в память', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`import tracemalloc


def read_orders(path):
    """Отдаёт строки файла по одной: в памяти лежит одна строка, а не весь файл."""
    with open(path, encoding="utf-8") as f:
        header = next(f).rstrip("\n").split(",")
        for line in f:
            yield dict(zip(header, line.rstrip("\n").split(",")))


rows = read_orders("orders_big.csv")   # файл ещё не открыт: тело функции не началось
print(type(rows).__name__)
print(next(rows))                      # первая строка — по запросу

tracemalloc.start()
total = sum(int(r["amount"]) for r in read_orders("orders_big.csv")
            if r["status"] == "paid")
print(f"генератор: {total} ₽, пик памяти {tracemalloc.get_traced_memory()[1] / 2**20:.2f} МБ")
tracemalloc.stop()

tracemalloc.start()
all_rows = list(read_orders("orders_big.csv"))   # весь миллион строк в памяти
total = sum(int(r["amount"]) for r in all_rows if r["status"] == "paid")
print(f"список:    {total} ₽, пик памяти {tracemalloc.get_traced_memory()[1] / 2**20:.0f} МБ")
tracemalloc.stop()`,
        out: R`generator
{'order_id': '1', 'brand': ' lumo', 'amount': '1200', 'status': 'paid'}
генератор: 985000000 ₽, пик памяти 0.03 МБ
список:    985000000 ₽, пик памяти 359 МБ`,
        note: 'Учебный файл orders_big.csv — восемь строк выгрузки, повторённые 125 000 раз: миллион строк, около 23 МБ на диске. Пик памяти меряет tracemalloc из стандартной библиотеки, на другой машине числа будут немного другими. Конструкция with и чтение файлов подробно — на странице 1.4.' }
    },
    questions: {
    q1: { sec: 'trace', title: 'Сначала предскажите', q: 'paid_brands вызвала clean_brand для первой строки выгрузки. Какие переменные лежат в кадре clean_brand, пока она работает?', opts: [['name, row и rows: функция видит всё, что видит её вызывающий'], ['Только name', 1], ['name и brands'], ['Никаких: переменные функций хранятся в глобальной области']],
      why: 'В кадре лежат только параметры и локальные переменные этого вызова. У clean_brand один параметр, name, и он получил значение аргумента row["brand"]. row, rows и brands принадлежат кадру paid_brands, и clean_brand их не видит. Глобальные имена функция могла бы прочитать, но в её кадре их нет. Проверьте на шаге, где в стеке три кадра.' },
    q2: { sec: 'idea', q: 'В анимации копипаст из 17 строк и цикл из четырёх дали одинаковый список paid. Чем цикл лучше, кроме длины?', opts: [['Он быстрее: Python выполняет for за одну операцию'], ['Он не зависит от числа строк: девятая строка выгрузки обработается без правки кода', 1], ['Только цикл отсеивает отменённые заказы'], ['Ничем, это вопрос вкуса']],
      why: 'Копипаст привязан к восьми строкам: номера rows[0] … rows[7] вписаны руками, и девятая строка в результат не попадёт. Цикл берёт строки из самой коллекции, сколько бы их ни было. Быстрее он не становится: проверок столько же, сколько строк. Отменённые заказы отсеивают оба варианта, а вкус ни при чём: опечатка в одной из 16 копий ошибки не даёт.' },
    q3: { sec: 'nuances', q: 'Что напечатает этот код?', code: R`def f(x, acc=[]):
    acc.append(x)
    return acc

print(f(1))
print(f(2, []))
print(f(3))`, lang: 'python', opts: [['[1], [2], [3]'], ['[1], [2], [1, 3]', 1], ['[1], [1, 2], [1, 2, 3]'], ['[1], [2], [2, 3]']],
      why: 'Список по умолчанию создан один раз, когда выполнялся def. Первый вызов дописывает 1 в него. Второй получает свой новый список [] и в общий не пишет. Третий снова пишет в общий список, где уже лежит 1, отсюда [1, 3]. Вариант [1], [2], [3] был бы верен с acc=None и новым списком внутри.' },
    q4: { sec: 'idea', q: 'Нужно напечатать строки выгрузки с номерами. Чем for i, row in enumerate(rows, start=1) лучше for i in range(len(rows))?', opts: [['enumerate сортирует строки перед перебором'], ['Сразу даёт номер и строку, нумерует с единицы и работает с любой коллекцией, даже без len(), например с генератором', 1], ['range(len()) не работает со списком словарей'], ['Ничем, это синонимы']],
      why: 'range(len(rows)) даёт только номера, и строку приходится доставать по индексу: лишний шаг и место для ошибки вроде rows[i + 1]. enumerate отдаёт пары сразу, а start=1 избавляет от i + 1 в отчёте. У генератора нет len(), а enumerate с ним работает. Сортировать enumerate не умеет, а range(len()) со списком словарей работает, просто читается хуже.' },
    q5: { sec: 'comp', q: 'Какой из этих comprehension лучше развернуть в обычный цикл?', opts: [['[clean_brand(b) for b in brands]'], ['[f for f in files if f.endswith(".csv")]'], ['{b: round(s / total * 100) for b, s in totals.items()}'], ['[a if a > 0 else 0 for day in days for a in day if a is not None]', 1]],
      why: 'В последнем два for и два разных if: условное выражение слева и фильтр справа. Чтобы понять, что он делает, его приходится разворачивать в голове, значит, лучше развернуть в коде. Первые три пересказываются одной фразой: «очистить каждый бренд», «оставить файлы .csv», «доля каждого бренда».' },
    q6: { sec: 'code', q: 'Что происходит в момент этой строки из кода с генератором?', code: 'rows = read_orders("orders_big.csv")', lang: 'python', opts: [['Python читает весь файл в список rows'], ['Файл открывается, и читается первая строка'], ['Ничего не читается: rows — генератор, тело функции начнёт выполняться при первом next() или в цикле', 1], ['Ошибка: функцию с yield нельзя присвоить переменной']],
      why: 'Вызов функции с yield не выполняет её тело, а создаёт генератор. Файл откроется, только когда у генератора попросят первое значение: next(rows) или первая итерация for. Дальше он отдаёт по строке за раз, и весь файл в памяти не оказывается. Присвоить генератор переменной можно, так и сделано в коде.' },
    q7: { sec: 'idea', q: 'У подарочного заказа amount = 0, а у заказа с ошибкой загрузки amount = None. Какие из них отбросит фильтр [r for r in rows if r["amount"]]?', opts: [['Только с None'], ['Только с нулём'], ['Оба: и 0, и None для if — ложь', 1], ['Ни один: if проверяет, есть ли в словаре ключ amount']],
      why: 'if смотрит на истинность значения, а ноль и None — оба ложь. Подарочный заказ пропадёт вместе с ошибочным. Чтобы оставить нули и отсеять только пропуски, пишут явно: if r["amount"] is not None. Наличие ключа проверяют иначе: "amount" in r.' }
    },
    glossary: {
      aggregate: { t: 'Агрегат', en: 'aggregate', d: 'Одно значение, собранное из многих: сумма, среднее, количество.' },
      cond: { t: 'Условие', en: 'if statement', d: 'Конструкция if, elif, else: блок выполняется, только если выражение истинно.' },
      indent: { t: 'Отступ', en: 'indentation', d: 'Сдвиг строки вправо, обычно на четыре пробела. В Python он задаёт, какие строки входят в блок.' },
      truthy: { t: 'Истинность', en: 'truthiness', d: 'То, как if понимает любое значение: ноль, пустое и None — ложь, остальное — истина.' },
      loop: { t: 'Цикл for', en: 'for loop', d: 'Повторяет блок для каждого элемента коллекции, кладя элемент в переменную цикла.' },
      iteration: { t: 'Итерация', en: 'iteration', d: 'Один проход тела цикла для одного элемента.' },
      range: { t: 'range', en: 'range', d: 'Выдаёт числа подряд: range(5) — это 0, 1, 2, 3, 4.' },
      enumerate: { t: 'enumerate', en: 'enumerate', d: 'Отдаёт при переборе пары «номер, элемент»; start задаёт первый номер.' },
      zip: { t: 'zip', en: 'zip', d: 'Идёт по нескольким коллекциям в ногу и отдаёт кортежи из их элементов.' },
      while: { t: 'Цикл while', en: 'while loop', d: 'Повторяет блок, пока условие истинно; break выходит из цикла досрочно.' },
      function: { t: 'Функция', en: 'function', d: 'Именованный блок кода, объявленный через def; выполняется при вызове.' },
      argument: { t: 'Аргумент и параметр', en: 'argument, parameter', d: 'Параметр — имя в объявлении функции, аргумент — значение, переданное при вызове.' },
      default: { t: 'Значение по умолчанию', en: 'default argument value', d: 'Значение параметра на случай, если аргумент не передан. Вычисляется один раз, при выполнении def.' },
      ret: { t: 'Возвращаемое значение', en: 'return value', d: 'То, что функция отдаёт через return. Без return функция возвращает None.' },
      unpacking: { t: 'Распаковка', en: 'unpacking', d: 'Раскладка кортежа по переменным: n, total = paid_stats(rows).' },
      scope: { t: 'Область видимости', en: 'scope', d: 'Часть программы, где видно имя: локальная у функции, глобальная у верхнего уровня.' },
      comprehension: { t: 'Comprehension', en: 'list comprehension, dict comprehension', d: 'Выражение, которое строит список или словарь из коллекции: что положить, откуда брать, какие оставить.' },
      trace: { t: 'Трассировка', en: 'trace', d: 'Запись выполнения программы по шагам: строка, переменные, стек вызовов.' },
      stack: { t: 'Стек вызовов и кадр', en: 'call stack, stack frame', d: 'Стопка кадров — записей о незавершённых вызовах с их параметрами, локальными переменными и текущей строкой. Вызов кладёт кадр сверху, return снимает.' },
      recursion: { t: 'Рекурсия', en: 'recursion', d: 'Вызов функцией самой себя; вызовы прекращаются на базовом случае.' },
      guard: { t: 'Ранний return', en: 'early return, guard clause', d: 'Приём, при котором функция сначала отсекает особые случаи и сразу возвращает ответ.' },
      vectorization: { t: 'Векторизация', en: 'vectorization', d: 'Операция над целым столбцом или массивом вместо цикла по элементам.' },
      iterator: { t: 'Итератор', en: 'iterator', d: 'Объект, который отдаёт элементы по одному, по запросу next().' },
      generator: { t: 'Генератор', en: 'generator', d: 'Функция с yield или выражение в круглых скобках: итератор, который вычисляет значения по одному.' }
    },
    materials: [
      ['da-1-3-loops-functions.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['orders_sample.csv', 'Учебная выгрузка из восьми заказов: бренд, сумма, статус'],
      ['loops_functions.ipynb', 'Код страницы и пять упражнений'],
      ['loops_functions_solutions.ipynb', 'Решения упражнений'],
      ['exports/', 'Учебная папка из семи файлов для блока про список файлов'],
      ['trace_paid_brands.py', 'Скрипт, которым записана трасса интерактива'],
      ['make_orders_big.py', 'Сборка учебного файла на миллион строк']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне пять вопросов по источнику об условиях, циклах, функциях и comprehensions, по одному. После ответа объясни ошибку со ссылкой на источник.'],
      ['Убрать копипаст', 'Я вставлю свой код с повторами. Не переписывай его: вопросами помоги мне самому найти, что вынести в цикл или функцию.'],
      ['Comprehension вслух', 'Дай мне по очереди пять comprehension на данных о заказах. Я перескажу каждый одной фразой, а ты скажешь, верно ли и не лучше ли тут цикл.']
    ]
  };
})();
