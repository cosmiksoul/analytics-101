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
  const LABEL = { one: 'одно условие', copy: 'отдельные проверки', loop: 'вариант 2 · цикл for', comp: 'списковое включение', sum: 'список и его сумма' };
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
      } else { s.now = 'проверены все 8 заказов'; s.calls.push({ to: 'res', t: 'отобраны 6 заказов из 8' }); }
    } else if (k === 3) {
      s.v = 'copy'; s.lines = '17'; all(); s.idx = true;
      s.now = 'индексы указаны в коде: rows[0] … rows[7]';
      if (p >= 0.15) s.calls.push({ to: 'code', t: '8 индексов по 2 раза', warn: 1 });
      if (p >= 0.55) s.calls.push({ to: 'rows', t: '9-я строка → ещё 2 строки кода', warn: 1 });
    } else if (k === 4) {
      s.v = 'loop'; s.lines = '4';
      if (p < 0.2) { s.hl = 0; s.now = 'paid = [] — пустой список для результата'; }
      else {
        s.cur = 0; s.ptr = true;
        if (p < 0.45) { s.hl = 1; s.now = 'row = rows[0] · итерация 1'; }
        else if (p < 0.7) { s.hl = 2; s.now = check(0).replace('rows[0]', 'row'); }
        else { s.hl = 3; mark(0); s.now = 'append добавил 1200 в список paid'; }
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
        else { mark(i); s.hl = OK(ROWS[i]) ? 3 : 2; s.now = OK(ROWS[i]) ? `append добавил ${ROWS[i][1]} в список paid` : 'Статус не подходит. Переходим к следующему заказу.'; }
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
      } else { s.now = 'содержимое paid совпадает с результатом цикла'; s.calls.push({ to: 'code', t: '1 строка · тот же список' }); }
    } else if (k === 7) {
      s.mode = 'dis'; s.lines = '1'; all();
      ['f', 'c', 'e'].forEach((x, j) => { if (p >= 0.1 + j * 0.28) s.lit.push(x); });
    } else if (k === 8) {
      s.mode = 'cmp'; s.lines = '17/4/1'; all();
      s.bars = Math.round(clamp(p / 0.5, 0, 1) * 10) / 10;
      if (p >= 0.55) s.calls.push({ to: 'res', t: 'все три списка совпадают' });
    } else {
      s.v = 'sum'; s.lines = '2'; all();
      s.hl = p < 0.35 ? 0 : 1; s.total = p >= 0.45;
      s.now = s.total ? 'sum(paid) → 7880' : 'paid = [1200, 2300, 640, 1750, 1430, 560]';
      if (p >= 0.6) s.calls.push({ to: 'res', t: 'выручка по 6 заказам' });
    }
    return s;
  }

  const scene = {
    parts: [{ n: '01', name: 'Условие', s: [0, 1] }, { n: '02', name: 'Повторение кода', s: [2, 3] }, { n: '03', name: 'Цикл', s: [4, 5] }, { n: '04', name: 'Включение', s: [6, 7] }, { n: '05', name: 'Итог', s: [8, 9] }],
    steps: [
      { title: 'Какие заказы попадут в отчёт', dur: 3000, body: '<p>В&nbsp;выгрузке восемь заказов. У&nbsp;каждого указаны бренд, сумма и&nbsp;статус. Шесть заказов оплачены (<b>paid</b>), два отменены (<b>cancelled</b>).</p><p>Соберём суммы оплаченных заказов в&nbsp;список <b>paid</b> и&nbsp;посчитаем выручку.</p>' },
      { title: 'Проверка первого заказа', dur: 3400, body: '<p>Сравним статус первого заказа со строкой «paid». Условие истинно, поэтому Python выполняет <b>paid.append(1200)</b>. В&nbsp;списке появляется сумма 1&nbsp;200&nbsp;₽.</p><p>Если бы заказ был отменён, Python пропустил бы команду с&nbsp;отступом.</p>' },
      { title: 'По одной проверке на заказ', dur: 5200, body: '<p>Для каждого заказа запишем отдельную проверку статуса. Скопируем две строки с&nbsp;<b>if</b> и&nbsp;<b>append</b> и&nbsp;каждый раз изменим индекс заказа.</p><p>Получится 17 строк кода, считая строку создания списка. В&nbsp;список войдут шесть сумм.</p>' },
      { title: 'Что будет с девятым заказом', dur: 3600, body: '<p>В&nbsp;коде указаны индексы от&nbsp;0 до&nbsp;7. Если выгрузить ещё один заказ, программа его пропустит. Для нового индекса придётся дописать проверку и&nbsp;вызов <b>append</b>.</p><p>Если случайно повторить уже использованный индекс, Python может дважды учесть один заказ и&nbsp;пропустить другой.</p>' },
      { title: 'Цикл по заказам', dur: 3600, body: '<p>На&nbsp;каждой итерации <b>for row in rows</b> переменная <b>row</b> указывает на&nbsp;очередной заказ. Код внутри цикла проверяет его статус.</p><p>Первый заказ оплачен. Команда <b>append</b> добавляет 1&nbsp;200 в&nbsp;список сумм.</p>' },
      { title: 'Что происходит с отменённым заказом', dur: 5600, body: '<p>Цикл переходит ко второму заказу. Его статус — <b>cancelled</b>, поэтому Python пропускает вызов <b>append</b>. Перебор продолжается со следующего заказа.</p><p>В&nbsp;конце восьмой итерации в&nbsp;списке шесть сумм. Эти же четыре строки кода обработают и&nbsp;более длинную выгрузку.</p>' },
      { title: 'Список из одного выражения', dur: 5200, body: '<p>Списковое включение объединяет в&nbsp;одном выражении перебор заказов, проверку статуса и&nbsp;выбор суммы. Квадратные скобки обозначают новый список.</p><p>В&nbsp;<b>paid</b> попадут те же суммы и&nbsp;в&nbsp;том же порядке, что и&nbsp;в&nbsp;цикле.</p>' },
      { title: 'В каком порядке читать включение', dur: 4200, body: '<p>Начните с&nbsp;<b>for row in rows</b>. Для каждого заказа Python проверяет условие после <b>if</b>. Если оно истинно, в&nbsp;список добавляется значение <b>row["amount"]</b> из&nbsp;начала выражения.</p><p>Цвета показывают, каким строкам обычного цикла соответствуют эти три части.</p>' },
      { title: 'Как варианты различаются по длине', dur: 3600, body: '<p>При отдельных проверках потребовалось 17 строк кода, в&nbsp;цикле — четыре, а&nbsp;для спискового включения хватило одной. Все три варианта дали одинаковый список.</p><p>Если в&nbsp;выгрузке появится девятый заказ, цикл и&nbsp;списковое включение обработают его без изменений в&nbsp;коде.</p>' },
      { title: 'Выручка по шести заказам', dur: 4000, next: 'Читать страницу', body: '<p>Вызов <b>sum(paid)</b> складывает шесть сумм. Выручка по&nbsp;оплаченным заказам составляет <b>7&nbsp;880&nbsp;₽</b>.</p><p>В&nbsp;уроке по&nbsp;тем же заказам вы посчитаете выручку отдельно для каждого бренда.</p>' }
    ],
    hud: [{ id: 'lines', label: 'Строк кода' }, { id: 'seen', label: 'Проверено' }, { id: 'kept', label: 'В paid' }],
    legend: '<span><i style="background:#36b8a6"></i>оплачен, прошёл фильтр</span><span><i style="background:#f2756a"></i>отменён</span><span><i class="sq" style="background:#24304a"></i>строка кода</span>',
    info: 'ВЫГРУЗКА',
    aiNote: 'Шесть из восьми учебных заказов оплачены. В анимации сравниваются отдельные проверки по индексам (17 строк кода), цикл for (4 строки) и списковое включение (1 строка). Каждый вариант даёт список [1200, 2300, 640, 1750, 1430, 560]. Выручка по этим заказам составляет 7 880 ₽.',
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
<div class="cf-lines"><div class="cf-ln"><i>1</i><code>${compLine(s, true)}</code></div></div><div class="cf-sep">та же операция в цикле</div>
<div class="cf-lines">${loop.map((h, j) => `<div class="cf-ln"><i>${j + 1}</i><code>${h[0]}</code></div>`).join('')}</div>
<div class="cf-legend">${['f', 'c', 'e'].map(x => `<span class="cf-lg ${x}${on(x)}">${NUM[x]} ${{ f: 'перебираем заказы', c: 'проверяем статус', e: 'берём сумму' }[x]}</span>`).join('<b>→</b>')}</div></div>`;
      }
      function cmpBox(s) {
        const V = [['отдельные проверки', 17], ['цикл for', 4], ['включение', 1]];
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
  const TRACE = {"loop":[{"e":"l","l":1,"it":-1,"b":-1,"n":0,"s":[["<module>",1,[["rows","@R"]]]],"t":"Сейчас Python определит функцию clean_brand. Код в её теле начнёт выполняться при вызове."},{"e":"l","l":4,"it":-1,"b":-1,"n":0,"s":[["<module>",4,[["rows","@R"],["clean_brand","@C"]]]],"t":"Функция clean_brand уже определена. После выполнения строки 4 в глобальной области появится и имя paid_brands."},{"e":"l","l":11,"it":-1,"b":-1,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]]],"t":"В paid_brands передаётся список из пяти заказов. При вызове функции в стеке появится её кадр."},{"e":"c","l":4,"it":-1,"b":-1,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",4,[["rows","@R"]]]],"t":"В кадре paid_brands параметр rows указывает на тот же список заказов, что и глобальная переменная rows."},{"e":"l","l":5,"it":-1,"b":-1,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"]]]],"t":"Строка 5. После присваивания в таблице локальных переменных появится имя brands со значением []."},{"e":"l","l":6,"it":-1,"b":0,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","[]"]]]],"t":"Строка 6. Сейчас цикл присвоит переменной row первый заказ."},{"e":"l","l":7,"it":0,"b":0,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 1: 'paid' == 'paid' → True. Условие истинно. Следующей выполнится строка 8."},{"e":"l","l":8,"it":0,"b":0,"n":0,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Строка 8. Сначала Python вызовет clean_brand(row[\"brand\"]) с аргументом ' lumo', затем append добавит полученное название в список brands."},{"e":"c","l":1,"it":0,"b":0,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",1,[["name","' lumo'"]]]],"t":"Над кадром paid_brands появился кадр clean_brand. Параметру name передали ' lumo'. Имена row и rows доступны в кадре paid_brands."},{"e":"l","l":2,"it":0,"b":0,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",2,[["name","' lumo'"]]]],"t":"Строка 2. Метод strip убирает пробелы по краям, а title начинает каждое слово с заглавной буквы. Результат для этого названия: ' lumo' → 'Lumo'."},{"e":"r","l":2,"it":0,"b":0,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","[]"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",2,[["name","' lumo'"]]]],"t":"clean_brand возвращает 'Lumo'. После возврата кадр clean_brand будет снят со стека. Выполнение продолжится в paid_brands.","r":"'Lumo'"},{"e":"l","l":6,"it":0,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"append дописал 'Lumo' в brands. Строка 6. Цикл переходит к следующему заказу. Начинается итерация 2."},{"e":"l","l":7,"it":1,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'BRISA', 'amount': 850, 'status': 'cancelled'}"]]]],"t":"Строка 7, итерация 2: 'cancelled' == 'paid' → False. Условие ложно. Python пропустит строку 8."},{"e":"l","l":6,"it":1,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'BRISA', 'amount': 850, 'status': 'cancelled'}"]]]],"t":"brands не изменился. Строка 6. Цикл переходит к следующему заказу. Начинается итерация 3."},{"e":"l","l":7,"it":2,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 3: 'paid' == 'paid' → True. Условие истинно. Следующей выполнится строка 8."},{"e":"l","l":8,"it":2,"b":1,"n":1,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Строка 8. Сначала Python вызовет clean_brand(row[\"brand\"]) с аргументом 'Lumo ', затем append добавит полученное название в список brands."},{"e":"c","l":1,"it":2,"b":1,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",1,[["name","'Lumo '"]]]],"t":"Над кадром paid_brands появился кадр clean_brand. Параметру name передали 'Lumo '. Имена row и rows доступны в кадре paid_brands."},{"e":"l","l":2,"it":2,"b":1,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",2,[["name","'Lumo '"]]]],"t":"Строка 2. Метод strip убирает пробелы по краям, а title начинает каждое слово с заглавной буквы. Результат для этого названия: 'Lumo ' → 'Lumo'."},{"e":"r","l":2,"it":2,"b":1,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",2,[["name","'Lumo '"]]]],"t":"clean_brand возвращает 'Lumo'. После возврата кадр clean_brand будет снят со стека. Выполнение продолжится в paid_brands.","r":"'Lumo'"},{"e":"l","l":6,"it":2,"b":2,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"append дописал 'Lumo' в brands. Строка 6. Цикл переходит к следующему заказу. Начинается итерация 4."},{"e":"l","l":7,"it":3,"b":2,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 4: 'paid' == 'paid' → True. Условие истинно. Следующей выполнится строка 8."},{"e":"l","l":8,"it":3,"b":2,"n":2,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Строка 8. Сначала Python вызовет clean_brand(row[\"brand\"]) с аргументом 'kedr', затем append добавит полученное название в список brands."},{"e":"c","l":1,"it":3,"b":2,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",1,[["name","'kedr'"]]]],"t":"Над кадром paid_brands появился кадр clean_brand. Параметру name передали 'kedr'. Имена row и rows доступны в кадре paid_brands."},{"e":"l","l":2,"it":3,"b":2,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",2,[["name","'kedr'"]]]],"t":"Строка 2. Метод strip убирает пробелы по краям, а title начинает каждое слово с заглавной буквы. Результат для этого названия: 'kedr' → 'Kedr'."},{"e":"r","l":2,"it":3,"b":2,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",2,[["name","'kedr'"]]]],"t":"clean_brand возвращает 'Kedr'. После возврата кадр clean_brand будет снят со стека. Выполнение продолжится в paid_brands.","r":"'Kedr'"},{"e":"l","l":6,"it":3,"b":3,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"append дописал 'Kedr' в brands. Строка 6. Цикл переходит к следующему заказу. Начинается итерация 5."},{"e":"l","l":7,"it":4,"b":3,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 5: 'paid' == 'paid' → True. Условие истинно. Следующей выполнится строка 8."},{"e":"l","l":8,"it":4,"b":3,"n":3,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 8. Сначала Python вызовет clean_brand(row[\"brand\"]) с аргументом 'brisa', затем append добавит полученное название в список brands."},{"e":"c","l":1,"it":4,"b":3,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",1,[["name","'brisa'"]]]],"t":"Над кадром paid_brands появился кадр clean_brand. Параметру name передали 'brisa'. Имена row и rows доступны в кадре paid_brands."},{"e":"l","l":2,"it":4,"b":3,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",2,[["name","'brisa'"]]]],"t":"Строка 2. Метод strip убирает пробелы по краям, а title начинает каждое слово с заглавной буквы. Результат для этого названия: 'brisa' → 'Brisa'."},{"e":"r","l":2,"it":4,"b":3,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",8,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",2,[["name","'brisa'"]]]],"t":"clean_brand возвращает 'Brisa'. После возврата кадр clean_brand будет снят со стека. Выполнение продолжится в paid_brands.","r":"'Brisa'"},{"e":"l","l":6,"it":4,"b":4,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr', 'Brisa']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"append дописал 'Brisa' в brands. Строка 6. Цикл проверяет, есть ли ещё заказы. Заказы закончились, а row по-прежнему указывает на последний из них."},{"e":"l","l":9,"it":4,"b":4,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",9,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr', 'Brisa']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 9. Инструкция return возвращает список brands."},{"e":"r","l":9,"it":4,"b":4,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",9,[["rows","@R"],["brands","['Lumo', 'Lumo', 'Kedr', 'Brisa']"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"paid_brands возвращает ['Lumo', 'Lumo', 'Kedr', 'Brisa']. После возврата в стеке останется кадр модуля.","r":"['Lumo', 'Lumo', 'Kedr', 'Brisa']"},{"e":"r","l":11,"it":-1,"b":-1,"n":4,"s":[["<module>",11,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"],["result","['Lumo', 'Lumo', 'Kedr', 'Brisa']"]]]],"t":"Программа закончила работу. Результат сохранён в глобальной переменной result = ['Lumo', 'Lumo', 'Kedr', 'Brisa']. Кадров функций в стеке больше нет.","r":"None"}],"comp":[{"e":"l","l":1,"it":-1,"b":-1,"n":0,"s":[["<module>",1,[["rows","@R"]]]],"t":"Сейчас Python определит функцию clean_brand. Код в её теле начнёт выполняться при вызове."},{"e":"l","l":4,"it":-1,"b":-1,"n":0,"s":[["<module>",4,[["rows","@R"],["clean_brand","@C"]]]],"t":"Функция clean_brand уже определена. После выполнения строки 4 в глобальной области появится и имя paid_brands."},{"e":"l","l":9,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]]],"t":"В paid_brands передаётся список из пяти заказов. При вызове функции в стеке появится её кадр."},{"e":"c","l":4,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",4,[["rows","@R"]]]],"t":"В кадре paid_brands параметр rows указывает на тот же список заказов, что и глобальная переменная rows."},{"e":"l","l":6,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"]]]],"t":"Первым Python вычисляет выражение после in в строке 6. Здесь это список заказов rows."},{"e":"l","l":5,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"]]]],"t":"Строка 5. Python создаёт список для результатов включения. Список не присвоен локальной переменной и поэтому не виден в таблице."},{"e":"l","l":6,"it":-1,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"]]]],"t":"Строка 6. Начинается перебор. Сейчас переменная row получит первый заказ."},{"e":"l","l":7,"it":0,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 1: 'paid' == 'paid' → True. Заказ оплачен. Теперь Python вычислит выражение в строке 5."},{"e":"l","l":5,"it":0,"b":-1,"n":0,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Строка 5. В clean_brand передаётся название бренда ' lumo'. Результат добавится в список названий."},{"e":"c","l":1,"it":0,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",1,[["name","' lumo'"]]]],"t":"Над кадром paid_brands появился кадр clean_brand. Параметру name передали ' lumo'. Имена row и rows доступны в кадре paid_brands."},{"e":"l","l":2,"it":0,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",2,[["name","' lumo'"]]]],"t":"Строка 2. Метод strip убирает пробелы по краям, а title начинает каждое слово с заглавной буквы. Результат для этого названия: ' lumo' → 'Lumo'."},{"e":"r","l":2,"it":0,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]],["clean_brand",2,[["name","' lumo'"]]]],"t":"clean_brand возвращает 'Lumo'. После возврата кадр clean_brand будет снят со стека. Выполнение продолжится в paid_brands.","r":"'Lumo'"},{"e":"l","l":6,"it":0,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': ' lumo', 'amount': 1200, 'status': 'paid'}"]]]],"t":"Ответ 'Lumo' добавлен в список названий. Строка 6. Начинается обработка следующего заказа. Номер итерации — 2."},{"e":"l","l":7,"it":1,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': 'BRISA', 'amount': 850, 'status': 'cancelled'}"]]]],"t":"Строка 7, итерация 2: 'cancelled' == 'paid' → False. Заказ отменён. Python пропустит вызов clean_brand и перейдёт к следующему заказу."},{"e":"l","l":6,"it":1,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': 'BRISA', 'amount': 850, 'status': 'cancelled'}"]]]],"t":"Строка 6. Начинается обработка следующего заказа. Номер итерации — 3."},{"e":"l","l":7,"it":2,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 3: 'paid' == 'paid' → True. Заказ оплачен. Теперь Python вычислит выражение в строке 5."},{"e":"l","l":5,"it":2,"b":-1,"n":1,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Строка 5. В clean_brand передаётся название бренда 'Lumo '. Результат добавится в список названий."},{"e":"c","l":1,"it":2,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",1,[["name","'Lumo '"]]]],"t":"Над кадром paid_brands появился кадр clean_brand. Параметру name передали 'Lumo '. Имена row и rows доступны в кадре paid_brands."},{"e":"l","l":2,"it":2,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",2,[["name","'Lumo '"]]]],"t":"Строка 2. Метод strip убирает пробелы по краям, а title начинает каждое слово с заглавной буквы. Результат для этого названия: 'Lumo ' → 'Lumo'."},{"e":"r","l":2,"it":2,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]],["clean_brand",2,[["name","'Lumo '"]]]],"t":"clean_brand возвращает 'Lumo'. После возврата кадр clean_brand будет снят со стека. Выполнение продолжится в paid_brands.","r":"'Lumo'"},{"e":"l","l":6,"it":2,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': 'Lumo ', 'amount': 2300, 'status': 'paid'}"]]]],"t":"Ответ 'Lumo' добавлен в список названий. Строка 6. Начинается обработка следующего заказа. Номер итерации — 4."},{"e":"l","l":7,"it":3,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 4: 'paid' == 'paid' → True. Заказ оплачен. Теперь Python вычислит выражение в строке 5."},{"e":"l","l":5,"it":3,"b":-1,"n":2,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Строка 5. В clean_brand передаётся название бренда 'kedr'. Результат добавится в список названий."},{"e":"c","l":1,"it":3,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",1,[["name","'kedr'"]]]],"t":"Над кадром paid_brands появился кадр clean_brand. Параметру name передали 'kedr'. Имена row и rows доступны в кадре paid_brands."},{"e":"l","l":2,"it":3,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",2,[["name","'kedr'"]]]],"t":"Строка 2. Метод strip убирает пробелы по краям, а title начинает каждое слово с заглавной буквы. Результат для этого названия: 'kedr' → 'Kedr'."},{"e":"r","l":2,"it":3,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]],["clean_brand",2,[["name","'kedr'"]]]],"t":"clean_brand возвращает 'Kedr'. После возврата кадр clean_brand будет снят со стека. Выполнение продолжится в paid_brands.","r":"'Kedr'"},{"e":"l","l":6,"it":3,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': 'kedr', 'amount': 640, 'status': 'paid'}"]]]],"t":"Ответ 'Kedr' добавлен в список названий. Строка 6. Начинается обработка следующего заказа. Номер итерации — 5."},{"e":"l","l":7,"it":4,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",7,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 7, итерация 5: 'paid' == 'paid' → True. Заказ оплачен. Теперь Python вычислит выражение в строке 5."},{"e":"l","l":5,"it":4,"b":-1,"n":3,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 5. В clean_brand передаётся название бренда 'brisa'. Результат добавится в список названий."},{"e":"c","l":1,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",1,[["name","'brisa'"]]]],"t":"Над кадром paid_brands появился кадр clean_brand. Параметру name передали 'brisa'. Имена row и rows доступны в кадре paid_brands."},{"e":"l","l":2,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",2,[["name","'brisa'"]]]],"t":"Строка 2. Метод strip убирает пробелы по краям, а title начинает каждое слово с заглавной буквы. Результат для этого названия: 'brisa' → 'Brisa'."},{"e":"r","l":2,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]],["clean_brand",2,[["name","'brisa'"]]]],"t":"clean_brand возвращает 'Brisa'. После возврата кадр clean_brand будет снят со стека. Выполнение продолжится в paid_brands.","r":"'Brisa'"},{"e":"l","l":6,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",6,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Ответ 'Brisa' добавлен в список названий. Строка 6. Перебор заканчивается, потому что в списке больше нет заказов."},{"e":"l","l":5,"it":4,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"],["row","{'brand': 'brisa', 'amount': 1750, 'status': 'paid'}"]]]],"t":"Строка 5. Все названия собраны. Функция вернёт готовый список. В версии с включением локальной переменной row за его пределами нет."},{"e":"r","l":5,"it":-1,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"]]],["paid_brands",5,[["rows","@R"]]]],"t":"paid_brands возвращает ['Lumo', 'Lumo', 'Kedr', 'Brisa']. После возврата в стеке останется кадр модуля.","r":"['Lumo', 'Lumo', 'Kedr', 'Brisa']"},{"e":"r","l":9,"it":-1,"b":-1,"n":4,"s":[["<module>",9,[["rows","@R"],["clean_brand","@C"],["paid_brands","@P"],["result","['Lumo', 'Lumo', 'Kedr', 'Brisa']"]]]],"t":"Программа закончила работу. Результат сохранён в глобальной переменной result = ['Lumo', 'Lumo', 'Kedr', 'Brisa']. Кадров функций в стеке больше нет.","r":"None"}]};
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
    const TASKS = ['Найдите шаг с тремя кадрами в стеке.', 'В версии с циклом найдите шаг, на котором в список brands добавляется второй элемент.', 'В версии с включением дойдите до возврата из paid_brands. Посмотрите, доступен ли готовый список по имени в этом кадре.'];
    box.innerHTML = `<div class="block-hd"><span class="t">У каждого вызова свой кадр и свои переменные <i>интерактив</i></span><div class="ctrls"><span class="seg" role="group" aria-label="Версия функции"><button type="button" data-m="loop" aria-pressed="true">Цикл</button><button type="button" data-m="comp" aria-pressed="false">Включение</button></span><button type="button" class="btn ghost small" id="tr-reset">Сбросить</button></div></div>
<p class="hint tr-do">Переключайте шаги кнопками или стрелками ← и →. Обе версии функции обрабатывают одни и те же пять заказов.</p>
<div class="tr-stage"><div class="tr-main">
<div class="tr-code"><div class="tr-hd"><span id="tr-file"></span><span class="tr-tag">rows — 5 строк</span></div><div class="tr-lines" id="tr-lines"></div></div>
<div class="tr-nav"><button type="button" class="btn ghost small" id="tr-first" aria-label="В начало трассы">⏮</button><button type="button" class="btn ghost small" id="tr-prev">← Шаг</button><button type="button" class="btn small" id="tr-next">Шаг →</button><button type="button" class="btn ghost small" id="tr-play">▶ Авто</button><input type="range" id="tr-range" min="0" value="0" aria-label="Шаг трассы"></div>
<div class="tr-say" id="tr-say" aria-live="polite"></div>
<div class="tr-rows"><p class="cap">rows: учебная выгрузка</p><div id="tr-rows"></div></div>
</div><div class="narr tr-side"><p class="cap">Стек вызовов <small>сверху — текущий кадр</small></p><div class="tr-stack" id="tr-stack"></div><p class="cap">Задания</p><ol class="steps tr-tasks" id="tr-tasks"></ol></div></div>
<div class="status"><span><span class="dot live"></span><span id="tr-k"></span></span><span id="tr-l"></span><span id="tr-d"></span><span id="tr-c"></span><span class="grow"></span><span id="tr-m"></span></div>
<p class="tr-note">Шаги записаны в CPython 3.13 с помощью sys.settrace. Для спискового включения проверка с ложным результатом и следующий за ней служебный переход показаны как один шаг.</p>`;
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
      $('tr-file').textContent = mode === 'loop' ? 'paid_brands.py · версия с циклом' : 'paid_brands.py · списковое включение';
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
      $('tr-m').textContent = `шагов с циклом — ${TRACE.loop.length}, с включением — ${TRACE.comp.length}`;
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
        return `версия: ${mode === 'loop' ? 'цикл' : 'списковое включение'}; шаг ${i + 1} из ${S().length}, строка ${st.l}; стек: ${st.s.map(f => fname(f[0])).join(' → ')}; переменные текущего кадра: ${top[2].map(([k, v]) => `${k} = ${exp(v)}`).join('; ') || 'нет'}; выполнено заданий: ${done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-1-3',
    short: 'DA-01',
    title: 'Условия, циклы и функции',
    where: 'блок «Дата аналитика», тема 01 «Python для анализа», страница 1.3',
    aiData: 'В учебной выгрузке восемь заказов интернет-магазина. Для каждого указаны название бренда, сумма в рублях и статус paid или cancelled. Названия одних и тех же брендов записаны по-разному.',
    scene,
    widgets: { trace: buildTrace },
    code: {
      basics: { title: 'Условие, for, enumerate, zip и while на суммах заказов', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`amounts = [1200, 850, 2300, 640, 1750]           # суммы заказов из урока 1.1, ₽
brands = ["Lumo", "Brisa", "Lumo", "Kedr", "Brisa"]

# if / elif / else: срабатывает первая истинная ветка, остальные не проверяются
for a in amounts[:3]:
    if a >= 2000:
        print(a, "крупный")
    elif a >= 1000:
        print(a, "средний")
    else:
        print(a, "мелкий")

# enumerate: номер и элемент сразу; zip: пары элементов из двух списков
for i, brand in enumerate(brands[:2], start=1):
    print(i, brand)
for brand, a in zip(brands[:2], amounts):
    print(brand, a)

# while: сколько первых заказов нужно, чтобы выручка дошла до 5000 ₽
total, n = 0, 0
while total < 5000 and n < len(amounts):   # второе условие — проверяет, остались ли заказы
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
print(sys.getrecursionlimit())        # текущий предел рекурсии`,
        out: R`62
20
1000`,
        note: 'При подсчёте зимних ботинок в стеке одновременно находятся четыре вызова count_items. Их аргументы — весь каталог, раздел «Обувь», подраздел «Ботинки» и число 5.' },
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
        code: R`# Учебные заказы с разным написанием названий брендов
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

# Доли брендов в выручке — словарное включение
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
        note: 'Метод <code>name.split()</code> делит строку по пробельным символам, а <code>" ".join(…)</code> соединяет получившиеся слова одним пробелом. После приведения к одному регистру « Lumo  Kids » и «lumo kids» получат одно написание — «Lumo Kids».' },
      files: { title: 'Как отобрать файлы заказов', badge: 'проверено: Python 3.13', lang: 'python',
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
        note: 'В первой строке вывода перечислены все семь файлов папки exports. Условие выбирает имена с началом orders_ и расширением .csv. Внутри квадратных скобок выражение можно перенести на следующую строку, чтобы условие было легче прочитать.' },
      gen: { title: 'Как обработать большой файл построчно', badge: 'проверено: Python 3.13', lang: 'python',
        code: R`import tracemalloc


def read_orders(path):
    """Возвращает записи учебного CSV-файла по одной."""
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
        note: 'Файл orders_big.csv содержит восемь учебных заказов, повторённых 125 000 раз. Размер файла — около 23 МБ. Модуль tracemalloc измеряет пиковый объём выделенной памяти Python. В другой среде цифры могут отличаться. Для этого учебного файла достаточно разделить строку по запятым. Для CSV с запятыми внутри полей используйте модуль csv. Подробнее о чтении файлов и конструкции with — в уроке 1.4.' }
    },
    questions: {
    q1: { sec: 'trace', title: 'Сначала предскажите', q: 'Функция paid_brands вызвала clean_brand для первого заказа. Какие локальные имена появятся в кадре clean_brand?', opts: [['name, row и rows'], ['Только name', 1], ['name и brands'], ['Ни одного, поскольку все переменные хранятся в глобальной области']],
      why: 'При вызове clean_brand(row["brand"]) параметр name получает название бренда. Других локальных переменных в функции нет. В кадре paid_brands остаются переменные row и rows, а в версии с обычным циклом ещё и brands. Когда в стеке три кадра, проверьте таблицу переменных в каждом из них.' },
    q2: { sec: 'idea', q: 'Восемь отдельных проверок и цикл создали одинаковый список paid. Что произойдёт, если в конце выгрузки появится девятый оплаченный заказ?', opts: [['Обе версии автоматически проверят девятый заказ'], ['Цикл обработает заказ, а для версии с отдельными проверками понадобится ещё один блок if', 1], ['Заказ обработают только отдельные проверки'], ['Цикл завершится с ошибкой, поскольку в нём указано восемь итераций']],
      why: 'Цикл for перебирает все элементы rows. Поэтому в список попадёт и сумма нового заказа. В другом варианте явно указаны индексы от 0 до 7. Чтобы учесть девятый заказ, придётся добавить проверку для индекса 8.' },
    q3: { sec: 'nuances', q: 'Что напечатает каждый из трёх вызовов print?', code: R`def f(x, acc=[]):
    acc.append(x)
    return acc

print(f(1))
print(f(2, []))
print(f(3))`, lang: 'python', opts: [['[1], [2], [3]'], ['[1], [2], [1, 3]', 1], ['[1], [1, 2], [1, 2, 3]'], ['[1], [2], [2, 3]']],
      why: 'При выполнении def Python создаёт один пустой список для вызовов без аргумента acc. Первый вызов добавляет в него 1. Во втором вызове явно передан другой пустой список, и в него попадает 2. Третий вызов снова использует список по умолчанию. После добавления 3 в нём оказываются [1, 3].' },
    q4: { sec: 'idea', q: 'Нужно пронумеровать строки отчёта начиная с единицы. Чем здесь удобен enumerate(rows, start=1)?', opts: [['Перед нумерацией строки автоматически сортируются'], ['При каждом шаге сразу доступны номер и строка. Можно перебирать и генератор, у которого нет длины', 1], ['В отличие от range(len(rows)), enumerate работает только со списком словарей'], ['Нумерация сохраняется в исходной выгрузке']],
      why: 'enumerate(rows, start=1) даёт пары (1, первая строка), (2, вторая строка) и так далее. В цикле по range(len(rows)) каждую строку пришлось бы получать по индексу и отдельно прибавлять единицу к номеру для отчёта. enumerate сохраняет порядок перебора и не изменяет исходные данные.' },
    q5: { sec: 'comp', q: 'Какое выражение объединяет два вложенных цикла, фильтр и условный выбор значения?', opts: [['[clean_brand(b) for b in brands]'], ['[f for f in files if f.endswith(".csv")]'], ['{b: round(s / total * 100) for b, s in totals.items()}'], ['[a if a > 0 else 0 for day in days for a in day if a is not None]', 1]],
      why: 'В последнем выражении первый for перебирает дни, второй — значения за день. Условие справа отбрасывает None. Выражение слева оставляет положительные числа и заменяет остальные нулём. Если такой порядок трудно проследить, удобно развернуть запись в обычные циклы.' },
    q6: { sec: 'code', q: 'Что произойдёт при выполнении этой строки?', code: 'rows = read_orders("orders_big.csv")', lang: 'python', opts: [['Python прочитает весь файл в список rows'], ['Python откроет файл и прочитает первую строку'], ['Python создаст генератор. Его тело начнёт выполняться, когда программа запросит первое значение', 1], ['Python выдаст ошибку, поскольку результат функции с yield нельзя присвоить переменной']],
      why: 'Вызов read_orders создаёт генератор и связывает с ним имя rows. Когда программа впервые выполнит next(rows) или начнёт перебирать rows в цикле, генератор откроет файл, прочитает заголовок и вернёт первый заказ. Следующий запрос продолжит выполнение после yield.' },
    q7: { sec: 'idea', q: 'У подарочного заказа amount равен 0, а при пропуске суммы в поле стоит None. Какие заказы исключит фильтр [r for r in rows if r["amount"]]?', opts: [['Только заказы с None'], ['Только заказы с нулевой суммой'], ['И заказы с 0, и заказы с None', 1], ['Ни те ни другие, пока поле amount есть в словаре']],
      why: 'Условие проверяет значение поля amount. И 0, и None считаются ложными. Чтобы сохранить подарочные заказы и исключить лишь пропуски, укажите условие if r["amount"] is not None. Наличие самого ключа проверяется выражением "amount" in r.' }
    },
    glossary: {
      aggregate: { t: 'Агрегат', en: 'aggregate', d: 'Итоговое значение для группы наблюдений, например число заказов, сумма оплат или средний чек.' },
      cond: { t: 'Условие', en: 'condition', d: 'Выражение, по истинности которого Python решает, выполнять ли блок if. Последующие условия можно задать через elif.' },
      indent: { t: 'Отступ', en: 'indentation', d: 'Пробелы в начале строки. В Python отступы определяют границы блоков. Блок обычно сдвигают на четыре пробела.' },
      truthy: { t: 'Истинность', en: 'truthiness', d: 'Свойство значения, которое Python проверяет в условии. Например, пустой список считается ложным, а список с одним нулём — истинным.' },
      loop: { t: 'Цикл for', en: 'for loop', d: 'Конструкция for по очереди присваивает переменной цикла элементы итерируемого объекта и выполняет тело цикла.' },
      iteration: { t: 'Итерация', en: 'iteration', d: 'Один шаг цикла. Для for это обработка очередного элемента.' },
      range: { t: 'range', en: 'range', d: 'Последовательность целых чисел с заданным шагом. Например, при переборе range(5) получатся 0, 1, 2, 3 и 4.' },
      enumerate: { t: 'enumerate', en: 'enumerate', d: 'Функция, которая при переборе даёт пары из номера и элемента. Аргумент start задаёт первый номер.' },
      zip: { t: 'zip', en: 'zip', d: 'Функция, которая при переборе объединяет соответствующие элементы нескольких источников в кортежи. По умолчанию останавливается, когда один из источников исчерпан.' },
      while: { t: 'Цикл while', en: 'while loop', d: 'Цикл, который перед каждой итерацией проверяет условие и выполняет тело, пока условие истинно.' },
      function: { t: 'Функция', en: 'function', d: 'Функция принимает аргументы и выполняет заданные действия при вызове. В уроке функции определяют с помощью def.' },
      argument: { t: 'Аргумент и параметр', en: 'argument, parameter', d: 'Параметр — имя в определении функции. Аргумент — значение, которое передают этому параметру при вызове.' },
      default: { t: 'Значение по умолчанию', en: 'default argument value', d: 'Значение, которое получит параметр, если аргумент для него не указан. Python вычисляет его при выполнении определения функции.' },
      ret: { t: 'Возвращаемое значение', en: 'return value', d: 'Значение, которое получает вызывающий код после завершения функции. Если обычная функция доходит до конца без return, она возвращает None.' },
      unpacking: { t: 'Распаковка', en: 'unpacking', d: 'Присваивание элементов итерируемого объекта нескольким переменным. Например, n, total = paid_stats(rows) распакует кортеж из двух элементов.' },
      scope: { t: 'Область видимости', en: 'scope', d: 'Часть программы, в которой доступно имя. Например, имя параметра функции локально для неё.' },
      comprehension: { t: 'Списковое и словарное включения', en: 'list comprehension, dict comprehension', d: 'Выражение, которое строит коллекцию из элементов другого итерируемого объекта. Списковое включение записывают в квадратных скобках, словарное — в фигурных с парой «ключ: значение».' },
      trace: { t: 'Трассировка', en: 'trace', d: 'Запись выполнения программы по шагам. По ней можно проследить порядок вызовов и изменения значений переменных.' },
      stack: { t: 'Стек вызовов и кадр', en: 'call stack, stack frame', d: 'Стек содержит кадры незавершённых вызовов. Кадр хранит состояние конкретного вызова, в том числе параметры, локальные переменные и место выполнения. Текущий кадр находится на вершине стека.' },
      recursion: { t: 'Рекурсия', en: 'recursion', d: 'Вызов функцией самой себя. Чтобы вычисление завершилось, цепочка вызовов должна дойти до базового случая.' },
      guard: { t: 'Ранний выход из функции', en: 'early return, guard clause', d: 'Приём, при котором функция проверяет особый случай и сразу завершает вызов с помощью return. Основной расчёт записывают после проверки.' },
      vectorization: { t: 'Векторизация', en: 'vectorization', d: 'Применение операции сразу к массиву или столбцу. Например, сравнение столбца статусов со строкой "paid" проверяет все строки таблицы.' },
      iterator: { t: 'Итератор', en: 'iterator', d: 'Объект, который по запросу next() выдаёт следующий элемент, а когда элементы заканчиваются, возбуждает исключение StopIteration.' },
      generator: { t: 'Генератор', en: 'generator', d: 'Итератор, который можно создать вызовом функции с yield или генераторным выражением. Он вычисляет значения по мере запросов и сохраняет состояние между ними.' }
    },
    materials: [
      ['da-1-3-loops-functions.md', 'Текст урока в Markdown с примерами кода, вопросами и глоссарием'],
      ['orders_sample.csv', 'Восемь учебных заказов. Для каждого указаны бренд, сумма и статус'],
      ['loops_functions.ipynb', 'Ноутбук с примерами из урока и пятью упражнениями'],
      ['loops_functions_solutions.ipynb', 'Решения пяти упражнений с пояснениями'],
      ['exports/', 'Семь файлов для упражнения по отбору выгрузок'],
      ['trace_paid_brands.py', 'Скрипт, который записывает шаги выполнения двух версий функции paid_brands в CPython 3.13'],
      ['make_orders_big.py', 'Скрипт для создания учебного CSV-файла с миллионом заказов']
    ],
    prompts: [
      ['Проверка понимания', 'Проверь, как я понимаю условия, циклы, функции и списковые включения. Задай пять вопросов по уроку, по одному за раз. После каждого моего ответа объясни решение на примере из источника.'],
      ['Как убрать повторы в коде', 'Я пришлю код с повторяющимися проверками. Помоги мне увидеть, какие действия можно выполнить в цикле или вынести в функцию. Задавай вопросы по одному и дай мне самостоятельно написать решение.'],
      ['Как прочитать включение', 'Дай мне по очереди пять примеров списковых и словарных включений на данных о заказах. Я объясню, какие элементы перебираются и что попадёт в результат. Проверь мои объяснения и предложи сравнить самый сложный пример с обычным циклом.']
    ]
  };
})();
