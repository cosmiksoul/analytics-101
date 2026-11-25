/* Страница 1.2 · Типы и коллекции */
(() => {
  /* ===================== Сцена: четыре коробки ===================== */
  // Бренды пяти учебных заказов 1041–1045 — те же, что в JSON из блока кода
  const E = ['Сова', 'Кедр', 'Сова', 'Луч', 'Сова'];
  const IDS = [1041, 1042, 1043, 1044, 1045];
  // на каком прогрессе шага бренд падает в коробки
  const DROPS = { 2: [0.35], 3: [0.35], 4: [0.35], 5: [0.22, 0.62] };
  const SCAL = [['1200', 'int'], ['0.1', 'float'], ["'Сова'", 'str'], ['True', 'bool'], ['None', 'NoneType']];
  const LANE = {
    0: "type('Сова')  →  str",
    1: 'brands = []   t = ()   counts = {}   unique = set()',
    6: 't = tuple(brands)',
    7: "t[0] = 'Луч'",
    8: "'Луч' in brands     'Луч' in unique",
    9: "brands[3]    counts['Сова']    unique[0]",
    10: 'list   tuple   dict   set'
  };
  // выноски к коробкам: шаг → { коробка: [текст, вид] }; появляются во второй половине шага
  const CALLS = {
    0: { none: ['промокод отсутствует'] },
    1: { set: ['set() создаёт пустое множество'] },
    2: { tuple: ['пока пуст'] },
    3: { dict: ['новый ключ «Кедр»'] },
    4: { set: ['состав не изменился', 'bad'], dict: ['счётчик «Совы» вырос до 2'] },
    5: { list: ['5 записей по порядку'], set: ['3 разных бренда'] },
    6: { tuple: ['создан из списка brands'] },
    7: { tuple: ['TypeError', 'bad'], list: ["brands[0] = 'Луч' — можно"] },
    8: { list: ['проверены 4 позиции'], set: ['поиск по хэшу'] },
    9: { list: ["brands[3] → 'Луч'"], dict: ["counts['Сова'] → 3"], set: ['unique[0] → TypeError', 'bad'] }
  };
  const BADGES = {
    list: [['порядок', 1], ['повторы', 1], ['меняется', 1]],
    tuple: [['порядок', 1], ['повторы', 1], ['меняется', 0]],
    dict: [['по ключу', 1], ['меняется', 1], ['повтор ключа', 0]],
    set: [['порядок', 0], ['повторы', 0], ['быстрый in', 1]]
  };

  function stateAt(k, p) {
    let n = 0;
    for (let i = 2; i < k; i++) n += (DROPS[i] || []).length;
    const base = n; let pend = null, last = null;
    (DROPS[k] || []).forEach((at, j) => { if (p >= at) { n = base + j + 1; last = base + j; } else if (pend === null) pend = base + j; });
    const items = E.slice(0, n);
    const counts = {}; items.forEach(b => { counts[b] = (counts[b] || 0) + 1; });
    return {
      k, n, items, counts, uniq: Object.keys(counts), pend, last,
      dup: last !== null && E.slice(0, last).includes(E[last]),
      boxes: k >= 1,
      tuple: k > 6 || (k === 6 && p >= 0.35),
      tErr: k === 7 && p >= 0.4,
      checks: k === 8 ? Math.max(0, Math.min(4, Math.floor((p - 0.1) / 0.15) + 1)) : 0,
      setHit: k === 8 && p >= 0.3,
      access: k === 9 && p >= 0.3,
      badges: k === 10,
      call: p >= 0.6 ? CALLS[k] || null : null
    };
  }

  const LOCK = '<svg class="tc-lock" width="12" height="13" viewBox="0 0 12 13" aria-hidden="true"><rect x="1.5" y="5.5" width="9" height="7" rx="1.5" fill="currentColor"/><path d="M3.5 5.5V4a2.5 2.5 0 015 0v1.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

  const scene = {
    parts: [
      { n: '01', name: 'Значения', s: [0, 1] },
      { n: '02', name: 'Новые заказы', s: [2, 3] },
      { n: '03', name: 'Повтор', s: [4, 5] },
      { n: '04', name: 'Изменяемость', s: [6, 7] },
      { n: '05', name: 'Поиск', s: [8, 9] },
      { n: '06', name: 'Итог', s: [10] }
    ],
    steps: [
      { title: 'Из каких полей состоит заказ', dur: 3200, body: "<p>У&nbsp;каждого поля заказа свой тип. Сумма <b>1200</b> записана как целое число (<b>int</b>), скидка <b>0.1</b> — как число с&nbsp;плавающей точкой (<b>float</b>), название бренда <b>«Сова»</b> — как строка (<b>str</b>).</p><p>Признак оплаты принимает одно из двух значений типа <b>bool</b> — True или False. Если промокод не указан, в&nbsp;этом поле будет <b>None</b>.</p>" },
      { title: 'Четыре коллекции для названий брендов', dur: 2800, body: "<p>Создадим пустые коллекции. В&nbsp;списке <b>brands</b> сохраним бренд каждого заказа. В&nbsp;словаре <b>counts</b> будем считать, сколько раз встретился каждый бренд. Во множество <b>unique</b> соберём уникальные названия.</p><p>Кортеж <b>t</b> создадим из списка позже, когда прочитаем все пять заказов.</p>" },
      { title: 'Первый заказ у бренда «Сова»', dur: 2800, body: "<p>Добавим строку <b>«Сова»</b> в&nbsp;список. Её индекс равен нулю. В&nbsp;словаре запишем под ключом «Сова» число 1, поскольку пока у&nbsp;этого бренда один заказ.</p><p>Во множество тоже добавим «Сову». Кортеж пока остаётся пустым.</p>" },
      { title: 'Второй заказ у бренда «Кедр»', dur: 2400, body: "<p>Следующим запишем <b>«Кедр»</b>. В&nbsp;списке он получит индекс 1. В&nbsp;словаре появится ещё один ключ со счётчиком 1.</p><p>Теперь во множестве два названия — «Сова» и&nbsp;«Кедр».</p>" },
      { title: 'Третий заказ снова у «Совы»', dur: 3200, body: "<p>В&nbsp;списке появилась ещё одна запись <b>«Сова»</b>, теперь с&nbsp;индексом 2. В&nbsp;словаре увеличим счётчик для ключа «Сова» с&nbsp;1 до 2.</p><p>Во множестве «Сова» уже есть. Повторное добавление оставит его состав прежним.</p>" },
      { title: 'Пять заказов у трёх брендов', dur: 3400, body: "<p>В&nbsp;четвёртом заказе указан <b>«Луч»</b>, в&nbsp;пятом — снова <b>«Сова»</b>. В&nbsp;списке теперь пять записей в&nbsp;порядке поступления. Во множестве три названия.</p><p>По счётчикам в&nbsp;словаре видно, сколько заказов у&nbsp;каждого бренда. У&nbsp;«Совы» их три, у&nbsp;«Кедра» и&nbsp;«Луча» — по&nbsp;одному.</p>" },
      { title: 'Кортеж из готового списка', dur: 2800, body: "<p>Выражение <b>tuple(brands)</b> создаёт кортеж из элементов списка. Присвоим его переменной <b>t</b>.</p><p>В&nbsp;кортеже те же пять названий в&nbsp;том же порядке. И&nbsp;в&nbsp;списке, и&nbsp;в&nbsp;кортеже «Сова» встречается три раза.</p>" },
      { title: 'Можно ли заменить элемент кортежа?', dur: 3000, body: "<p>Если выполнить присваивание <b>t[0] = 'Луч'</b>, Python выдаст ошибку <b>TypeError</b>. После создания кортежа его элементы нельзя заменить, добавить или удалить.</p><p>В&nbsp;списке такая операция разрешена. Команда <b>brands[0] = 'Луч'</b> заменила бы первое название.</p>" },
      { title: 'Как найти «Луч»', dur: 3600, body: "<p>При проверке <b>'Луч' in brands</b> Python перебирает список с&nbsp;начала. До первого совпадения он проверит четыре позиции — «Сова», «Кедр», «Сова», «Луч».</p><p>В&nbsp;множестве поиск начинается с&nbsp;<b>хэша</b> названия. Обычно достаточно нескольких проверок независимо от числа элементов. Так же словарь ищет по&nbsp;ключу.</p>" },
      { title: 'Индекс списка и ключ словаря', dur: 3200, body: "<p>В&nbsp;списке и&nbsp;кортеже позицию задаёт индекс. Например, <b>brands[3]</b> вернёт «Луч». Словарь по&nbsp;ключу <b>counts['Сова']</b> вернёт 3 — число заказов этого бренда.</p><p>У&nbsp;множества нет индексов. Выражение <b>unique[0]</b> вызовет ошибку. Проверить, есть ли в&nbsp;нём название, можно с&nbsp;помощью <b>in</b>.</p>" },
      { title: 'Какую коллекцию выбрать', dur: 4200, next: 'Читать страницу', body: "<p>Список подойдёт, чтобы сохранить все заказы по&nbsp;порядку и&nbsp;позже добавить новые. Кортеж удобен, когда набор элементов должен оставаться прежним.</p><p>Словарь поможет найти число заказов по&nbsp;названию бренда. Множество подойдёт, если достаточно узнать, у&nbsp;каких брендов были заказы.</p>" }
    ],
    hud: [{ id: 'in', label: 'Заказов' }, { id: 'list', label: 'В списке' }, { id: 'uniq', label: 'Уникальных' }],
    legend: '<span><i class="sq" style="background:#2a3550"></i>элемент</span><span><i style="background:#36b8a6"></i>добавлен или найден</span><span><i style="background:#f2756a"></i>повтор или ошибка</span>',
    info: 'КОЛЛЕКЦИИ',
    aiNote: "В анимации обрабатывают пять заказов. В список brands записывают названия брендов в порядке поступления, в словаре counts увеличивают счётчик для каждого бренда, а во множестве unique сохраняют уникальные названия. После пятого заказа из списка создают кортеж командой t = tuple(brands). У бренда «Сова» три заказа, у «Кедра» и «Луча» — по одному.",
    mount(root, api) {
      const { esc, hl } = api;
      let sig = '', prev = { n: 0, counts: {}, tuple: false };
      const call = (s, box) => s.call && s.call[box] ? `<span class="tc-call${s.call[box][1] === 'bad' ? ' bad' : ''}">${esc(s.call[box][0])}</span>` : '';
      const badges = (s, box) => s.badges ? `<div class="tc-badges">${BADGES[box].map(([t, ok]) => `<span class="tc-b${ok ? '' : ' no'}">${ok ? '✓' : '✗'} ${esc(t)}</span>`).join('')}</div>` : '';
      return {
        render(k, p) {
          const s = stateAt(k, p);
          api.hud('in', `${s.n}/5`);
          api.hud('list', String(s.items.length));
          api.hud('uniq', String(s.uniq.length), s.dup ? 'повтор' : '');
          const key = JSON.stringify([k, s.n, s.pend, s.tuple, s.tErr, s.checks, s.setHit, s.access, !!s.call]);
          if (key === sig) return; sig = key;
          const back = s.n < prev.n;
          // список
          const listCells = s.items.map((b, i) => {
            let c = '';
            if (!back && i >= prev.n) c += ' fresh';
            if (s.checks && i < s.checks) c += i === 3 ? ' hit' : ' chk';
            if (s.access && i === 3) c += ' hit';
            return `<span class="tc-chip${c}"><i>${i}</i>${esc(b)}</span>`;
          }).join('');
          // кортеж
          const tCells = (s.tuple ? E.map((b, i) => `<span class="tc-chip${!prev.tuple ? ' fresh' : ''}${s.access && i === 3 ? ' hit' : ''}${s.tErr && i === 0 ? ' err' : ''}"><i>${i}</i>${esc(b)}</span>`).join('') : `<span class="tc-wait">${k >= 1 ? 'ожидаем заполнения списка' : ''}</span>`)
            + (s.tErr ? '<span class="tc-err">TypeError: \'tuple\' object does not support item assignment</span>' : '');
          // словарь
          const dCells = s.uniq.map(b => {
            let c = '';
            if (!back && !(b in prev.counts)) c += ' fresh';
            else if (!back && prev.counts[b] !== s.counts[b]) c += ' bump';
            if ((s.setHit && b === 'Луч') || (s.access && b === 'Сова')) c += ' hit';
            return `<span class="tc-kv${c}"><span class="k">${esc(b)}</span><span class="v">${s.counts[b]}</span></span>`;
          }).join('');
          // множество
          const sCells = s.uniq.map((b, i) => `<span class="tc-chip r${i % 3}${!back && !(b in prev.counts) ? ' fresh' : ''}${s.setHit && b === 'Луч' ? ' hit' : ''}">${esc(b)}</span>`).join('') + (s.dup && s.last !== null && (k === 4 || k === 5) ? `<span class="tc-chip ghost">${esc(E[s.last])}</span>` : '');
          // дорожка: что приходит сейчас или какая строка выполняется
          let lane;
          if (s.pend !== null) lane = `<span class="lb">новый заказ</span><span class="tc-chip in">${esc(E[s.pend])}</span><span class="tc-ord">заказ ${IDS[s.pend]}</span>`;
          else if (s.last !== null) lane = `<span class="lb">обработан</span><span class="tc-ord">заказ ${IDS[s.last]} · <b>'${esc(E[s.last])}'</b> → список, словарь, множество</span>`;
          else lane = `<span class="lb">код</span><code>${hl(LANE[k] || '')}</code>`;
          const scal = SCAL.map(([v, t], i) => `<span class="tc-sv"><b>${hl(v)}</b><small>${t}</small>${i === 4 ? call(s, 'none') : ''}</span>`).join('');
          const box = (cls, ty, nm, lit, body) => `<div class="tc-box ${cls}${s.boxes ? '' : ' off'}"><div class="tc-hd"><span><b class="ty">${ty}</b> <span class="nm">${nm}</span></span><span class="lit">${lit}</span></div><div class="tc-body">${body}</div>${call(s, cls)}${badges(s, cls)}</div>`;
          root.innerHTML = `<div class="tcs k${k}">
<div class="tc-scal${k <= 1 ? '' : ' dim'}">${scal}</div>
<div class="tc-lane">${lane}</div>
<div class="tc-boxes">
${box('list', 'list', 'brands', '[ ]', listCells)}
${box('tuple', 'tuple', 't', s.tuple ? `${LOCK}( )` : '( )', tCells)}
${box('dict', 'dict', 'counts', '{ : }', dCells)}
${box('set', 'set', 'unique', '{ }', sCells)}
</div></div>`;
          prev = { n: s.n, counts: Object.assign({}, s.counts), tuple: s.tuple };
        }
      };
    }
  };

  /* ===================== Интерактив «Ссылка или копия» ===================== */
  const START = [1200, 850, 2300];
  function buildRefs(box, api) {
    const { $, esc, plural, hl } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">На какие объекты ссылаются a и b? <i>интерактив</i></span><div class="ctrls"><span class="seg" role="group" aria-label="Тип объекта"><button type="button" data-kind="list" aria-pressed="true">Список</button><button type="button" data-kind="tuple" aria-pressed="false">Кортеж</button></span><button type="button" class="btn ghost small" id="rc-reset">Сбросить</button></div></div>
<p class="hint rc-do">Выберите тип коллекции и способ присваивания b. Выполните команду и сравните вывод для a и b. Стрелки показывают, на какой объект ссылается каждое имя.</p>
<div class="stage rc-stage"><div class="rc-left">
<div class="rc-row"><span class="rc-lbl">Как создать b</span><span class="seg" role="group" aria-label="Как создать b"><button type="button" data-mode="same" aria-pressed="true">b = a</button><button type="button" data-mode="copy" aria-pressed="false">b = a.copy()</button></span></div>
<div class="rc-mem" id="rc-mem" aria-live="polite"></div>
<div class="rc-row"><span class="rc-lbl">Изменить</span><span class="rc-acts"><button type="button" class="btn small" id="rc-add"></button><button type="button" class="btn small" id="rc-set"></button></span></div>
<div class="rc-tk"><p class="cap">Задания</p><ol class="steps rc-tasks" id="rc-tasks"></ol></div>
</div>
<div class="narr"><p class="cap">Программа</p><pre class="rc-pre" id="rc-prog"></pre><p class="cap">Вывод</p><pre class="rc-pre" id="rc-out"></pre><div class="narr-text" id="rc-msg"></div></div></div>
<div class="status"><span><span class="dot live" id="rc-dot"></span><span id="rc-is"></span></span><span id="rc-objs"></span><span id="rc-len"></span><span class="grow"></span><span id="rc-n"></span></div>`;
    const TASKS = ['Задайте b = a для списка. Измените один элемент и сравните a и b.', 'Скопируйте список с помощью b = a.copy(). Проверьте, в каком списке видно изменение.', 'Выберите кортеж. По очереди выполните обе команды. Что покажет print(b)?'];
    let kind = 'list', mode = 'same', done = [false, false, false], tAdd = false, tSet = false;
    let objs, refs, nextId, prog, ops, hot, msg;
    const repr = o => o.kind === 'list' ? `[${o.items.join(', ')}]` : `(${o.items.join(', ')}${o.items.length === 1 ? ',' : ''})`;
    const mk = items => { const o = { id: nextId++, kind, items }; objs[o.id] = o; return o; };
    function start() {
      objs = {}; nextId = 1; ops = 0; hot = null;
      const o1 = mk(START.slice());
      prog = [{ c: `a = ${repr(o1)}` }];
      if (mode === 'copy') { const o2 = mk(START.slice()); refs = { a: o1.id, b: o2.id }; prog.push({ c: 'b = a.copy()' }); }
      else { refs = { a: o1.id, b: o1.id }; prog.push({ c: 'b = a' }); }
      msg = kind === 'tuple' ? 'Имена a и b ссылаются на один кортеж чисел. Проверьте, что произойдёт при сложении кортежей и при попытке заменить первый элемент. У кортежа нет метода copy().'
        : mode === 'copy' ? 'Метод a.copy() вернул второй список с теми же числами. Имя a ссылается на список №1, имя b — на список №2.'
        : 'После b = a обе стрелки ведут к списку №1. Измените его через a или через b и сравните результат.';
    }
    function add() {
      const o = objs[refs.a];
      if (o.items.length >= 7) { msg = 'На схеме помещается семь сумм. Чтобы начать с трёх исходных, нажмите «Сбросить» или смените режим.'; return; }
      if (kind === 'list') {
        o.items.push(990); hot = { id: o.id, i: o.items.length - 1 }; prog.push({ c: 'a.append(990)' });
        msg = refs.a === refs.b ? `После a.append(990) в список №${o.id} добавилась сумма 990. Имя b ссылается на тот же список, поэтому новое значение видно и в print(b).`
          : `Команда a.append(990) добавила сумму в список №${o.id}. Имя b ссылается на список №${refs.b}. В нём по-прежнему ${objs[refs.b].items.length} ${plural(objs[refs.b].items.length, ['заказ', 'заказа', 'заказов'])}.`;
      } else {
        const n = mk(o.items.concat(990)); refs.a = n.id;
        const gone = Object.keys(objs).filter(id => +id !== refs.a && +id !== refs.b);
        gone.forEach(id => { delete objs[id]; });
        hot = { id: n.id, i: n.items.length - 1, fresh: true }; prog.push({ c: 'a += (990,)' }); tAdd = true;
        msg = `После a += (990,) имя a ссылается на новый кортеж №${n.id}. Имя b по-прежнему ссылается на исходный кортеж №${refs.b}.${gone.length ? ` Кортеж №${gone[0]} больше не нужен ни a, ни b, поэтому на схеме его больше нет.` : ''}`;
      }
      ops++;
    }
    function setFirst() {
      prog.push({ c: 'b[0] = 1300' });
      if (kind === 'tuple') {
        prog.push({ c: "TypeError: 'tuple' object does not support item assignment", err: true }); tSet = true; hot = null;
        msg = 'Python выдаёт TypeError при попытке присвоить значение элементу кортежа. И a, и b по-прежнему ссылаются на те же объекты, что и до этой команды.';
      } else {
        const o = objs[refs.b], was = o.items[0]; o.items[0] = 1300; hot = { id: o.id, i: 0 };
        msg = was === 1300 ? 'Сумма первого заказа уже равна 1 300. Повторное присваивание оставляет содержимое списка прежним.'
          : refs.a === refs.b ? `Команда b[0] = 1300 заменила первый элемент списка №${o.id}. Имя a ссылается на тот же список, поэтому его первый элемент тоже равен 1300.`
          : `Команда b[0] = 1300 изменила копию — список №${o.id}. В списке a сумма первого заказа по-прежнему равна ${objs[refs.a].items[0]}.`;
      }
      ops++;
    }
    function check() {
      if (!ops) return;
      if (kind === 'list' && mode === 'same') done[0] = true;
      if (kind === 'list' && mode === 'copy') done[1] = true;
      if (kind === 'tuple' && tAdd && tSet) done[2] = true;
    }
    const objHtml = (o, row) => `<div class="rc-obj${hot && hot.fresh && hot.id === o.id ? ' new' : ''}" style="grid-row:${row}"><div class="rc-oh"><span>${o.kind} · объект №${o.id}</span><span>len ${o.items.length}</span></div><div class="rc-cells">${o.items.map((v, i) => `<span class="rc-cell${hot && hot.id === o.id && hot.i === i ? ' hot' : ''}"><i>${i}</i><b>${v}</b></span>`).join('')}</div></div>`;
    function draw() {
      const shared = refs.a === refs.b;
      $('rc-mem').innerHTML = `<div class="rc-grid"><span class="rc-name a" style="grid-row:1">a</span><span class="rc-arrow a" style="grid-row:1"></span><span class="rc-name b" style="grid-row:2">b</span><span class="rc-arrow b" style="grid-row:2"></span>${shared ? objHtml(objs[refs.a], '1 / span 2') : objHtml(objs[refs.a], '1') + objHtml(objs[refs.b], '2')}</div>`;
      $('rc-add').innerHTML = `<code>${kind === 'list' ? 'a.append(990)' : 'a += (990,)'}</code>`;
      $('rc-add').setAttribute('aria-label', 'Добавить сумму 990 через a');
      $('rc-set').innerHTML = '<code>b[0] = 1300</code>';
      $('rc-set').setAttribute('aria-label', 'Заменить сумму первого заказа на 1300 через b');
      $('rc-prog').innerHTML = prog.map(l => l.err ? `<span class="err">${esc(l.c)}</span>` : hl(l.c)).join('\n');
      const A = objs[refs.a], B = objs[refs.b];
      $('rc-out').innerHTML = [['print(a)', repr(A)], ['print(b)', repr(B)], ['print(a is b)', String(shared ? 'True' : 'False')]].map(([c, v]) => `<span class="rc-o">${hl(c)}</span>${esc(v)}`).join('\n');
      $('rc-msg').textContent = msg;
      $('rc-tasks').innerHTML = TASKS.map((t, i) => `<li class="${done[i] ? 'on' : ''}"><b>${done[i] ? '✓' : i + 1}</b>${esc(t)}</li>`).join('');
      box.querySelectorAll('[data-kind]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === kind)));
      box.querySelectorAll('[data-mode]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); b.disabled = kind === 'tuple' && b.dataset.mode === 'copy'; });
      $('rc-is').textContent = `a is b: ${shared ? 'True' : 'False'}`;
      $('rc-dot').classList.toggle('live', shared);
      const nObj = Object.keys(objs).length;
      $('rc-objs').textContent = `${nObj} ${plural(nObj, ['объект', 'объекта', 'объектов'])} на схеме`;
      $('rc-len').textContent = `len(a) = ${A.items.length}, len(b) = ${B.items.length}`;
      $('rc-n').textContent = `Действий: ${ops}`;
    }
    box.addEventListener('click', e => {
      const kb = e.target.closest('[data-kind]'), mb = e.target.closest('[data-mode]');
      if (kb && kb.dataset.kind !== kind) { kind = kb.dataset.kind; if (kind === 'tuple') mode = 'same'; start(); draw(); }
      else if (mb && !mb.disabled && mb.dataset.mode !== mode) { mode = mb.dataset.mode; start(); draw(); }
    });
    $('rc-add').addEventListener('click', () => { add(); check(); draw(); });
    $('rc-set').addEventListener('click', () => { setFirst(); check(); draw(); });
    $('rc-reset').addEventListener('click', () => { kind = 'list'; mode = 'same'; done = [false, false, false]; tAdd = tSet = false; start(); draw(); });
    start(); draw();
    return {
      describe() {
        return `тип: ${kind === 'list' ? 'список' : 'кортеж'}; программа: ${prog.map(l => l.c).join('; ')}; a = ${repr(objs[refs.a])}, b = ${repr(objs[refs.b])}; a is b: ${refs.a === refs.b ? 'True' : 'False'}; выполнено заданий: ${done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-1-2',
    short: 'DA-01',
    title: 'Типы и коллекции',
    where: 'блок «Дата аналитика», тема 01 «Python для анализа», страница 1.2',
    aiData: "Пять заказов магазина за март и апрель 2026 года имеют номера с 1041 по 1045. Бренды в порядке заказов — «Сова», «Кедр», «Сова», «Луч», «Сова». Суммы — 1 200, 850, 2 300, 640 и 1 750 ₽. Заказ 1043 не оплачен.",
    scene,
    widgets: { refs: buildRefs },
    code: {
      json: { title: 'Как прочитать ответ API в формате JSON', badge: 'проверено: Python 3.13', lang: 'python',
        code: `import json

# Учебный ответ API интернет-магазина. Обычно такой ответ приходит по сети.
# Здесь он записан строкой, чтобы пример работал без интернета.
raw = """
{
  "shop": "учебный магазин",
  "orders": [
    {"id": 1041, "created": "2026-03-14T10:22:05", "brand": "Сова",
     "amount": 1200, "discount": 0.1, "paid": true, "promo": null},
    {"id": 1042, "created": "2026-03-14T18:03:41", "brand": "Кедр",
     "amount": 850, "discount": 0.0, "paid": true, "promo": "ВЕСНА"},
    {"id": 1043, "created": "2026-03-15T09:47:12", "brand": "Сова",
     "amount": 2300, "discount": 0.0, "paid": false, "promo": null},
    {"id": 1044, "created": "2026-03-28T21:15:00", "brand": "Луч",
     "amount": 640, "discount": 0.0, "paid": true, "promo": null},
    {"id": 1045, "created": "2026-04-02T08:30:59", "brand": "Сова",
     "amount": 1750, "discount": 0.1, "paid": true, "promo": "ВЕСНА"}
  ]
}
"""

data = json.loads(raw)              # строка JSON → словари и списки Python
print(type(data).__name__, list(data))

orders = data["orders"]             # по ключу "orders" лежит список
print(type(orders).__name__, len(orders))

first = orders[0]                   # каждый заказ — снова словарь
for key, value in first.items():
    print(f"{key:9}{type(value).__name__:9}{value!r}")

print(data["orders"][2]["brand"])   # путь вглубь: ключ → индекс → ключ

paid_total = 0                      # сумма оплаченных заказов
for o in orders:
    if o["paid"]:
        paid_total += o["amount"]
print("Оплачено:", paid_total, "₽")`,
        out: `dict ['shop', 'orders']
list 5
id       int      1041
created  str      '2026-03-14T10:22:05'
brand    str      'Сова'
amount   int      1200
discount float    0.1
paid     bool     True
promo    NoneType None
Сова
Оплачено: 4440 ₽`,
        note: 'При разборе JSON значение true превращается в True, null — в None. Число 1200 имеет тип int, а 0.1 — float. В итог 4 440 ₽ вошли только оплаченные заказы. Заказ 1043 пропущен.' },
      freq: { title: 'Сколько заказов у каждого бренда', badge: 'проверено: Python 3.13', lang: 'python',
        code: `from collections import Counter

brands = []                         # бренды по порядку заказов, с повторами
for o in orders:
    brands.append(o["brand"])
print(brands)

counts = {}                         # частоты вручную: бренд → число заказов
for b in brands:
    counts[b] = counts.get(b, 0) + 1
print(counts)

c = Counter(brands)                 # то же самое одной строкой
print(c)
print(c.most_common(1))

unique = set(brands)                # уникальные бренды
print(len(brands), len(unique), sorted(unique))
print("Луч" in unique, "Лис" in unique)`,
        out: `['Сова', 'Кедр', 'Сова', 'Луч', 'Сова']
{'Сова': 3, 'Кедр': 1, 'Луч': 1}
Counter({'Сова': 3, 'Кедр': 1, 'Луч': 1})
[('Сова', 3)]
5 3 ['Кедр', 'Луч', 'Сова']
True False`,
        note: 'У магазина пять заказов и три бренда. sorted(unique) возвращает названия по алфавиту. Такой вывод воспроизводится независимо от порядка обхода множества.' },
      dates: { title: 'Как посчитать сумму заказов за каждый месяц', badge: 'проверено: Python 3.13', lang: 'python',
        code: `created = orders[0]["created"]
print(created)
print(created[:4], created[5:7], created[8:10])   # год, месяц, день
print(created[:10], created[-8:])                 # дата и время
print(created[:7])                                # год и месяц
print(created.split("T"))                         # метод строки: разделить дату и время по T

by_month = {}                       # суммы всех заказов по месяцам
for o in orders:
    month = o["created"][:7]
    by_month[month] = by_month.get(month, 0) + o["amount"]
print(by_month)`,
        out: `2026-03-14T10:22:05
2026 03 14
2026-03-14 10:22:05
2026-03
['2026-03-14', '10:22:05']
{'2026-03': 4990, '2026-04': 1750}`,
        note: 'Мартовская сумма 4 990 ₽ включает неоплаченный заказ 1043. Срез [:7] подходит для группировки, пока год и месяц записаны в одном формате с ведущими нулями.' }
    },
    questions: {
    q1: { sec: 'refs', title: 'Сначала предскажите', q: 'Что напечатает этот код?', code: 'a = [1200, 850, 2300]\nb = a\na.append(990)\nprint(b)', lang: 'python', opts: [['[1200, 850, 2300]'], ['[1200, 850, 2300, 990]', 1], ['[990, 1200, 850, 2300]'], ['AttributeError: у b нет метода append']],
      why: "После b = a оба имени ссылаются на один список. Метод append добавляет 990 в его конец. Поэтому новый элемент виден и через b. Если бы перед добавлением суммы выполнили b = a.copy(), в b осталось бы три прежних числа." },
    q2: { sec: 'idea', q: "В третьем заказе снова встретилась «Сова». Что изменилось во множестве брендов и в словаре со счётчиками?", opts: [['Оба добавили второй элемент «Сова»'], ['Состав множества остался прежним. В словаре программа увеличила счётчик по ключу «Сова» до 2', 1], ['Множество заменило старую «Сову» новой, а словарь выбросил повтор'], ['Оба выдали ошибку: повторы в них запрещены']],
      why: "Строка «Сова» уже есть во множестве. Повторное добавление оставляет его состав прежним. В словаре код находит существующий ключ и прибавляет единицу к его значению. Счётчик увеличивает программа при обработке очередного заказа." },
    q3: { sec: 'colls', q: "Почему в замере на 20 000 чисел set(data) удалил повторы гораздо быстрее, чем цикл с проверкой if x not in seen по списку?", opts: [['Множество сортирует элементы и выбрасывает одинаковых соседей'], ['Множество использует хэш, а в списке проверка принадлежности может потребовать перебора всех накопленных элементов', 1], ['Множество хранит только количество элементов, а не сами элементы'], ['set() пропускает часть элементов, чтобы работать быстрее']],
      why: "Для каждого числа цикл ищет совпадение в списке уже встреченных значений. Поиск заканчивается на первом совпадении либо в конце списка. Если почти все значения различны, при увеличении объёма данных вдвое число сравнений растёт примерно вчетверо. В множестве поиск идёт по хэшу. В среднем проверка требует примерно постоянного числа обращений." },
    q4: { sec: 'colls', q: "Какое свойство кортежа отличает его от списка?", opts: [['Кортеж не хранит порядок элементов'], ['В кортеже не бывает повторов'], ['В уже созданном кортеже нельзя заменить элемент или изменить число элементов', 1], ['В кортеже могут лежать только числа']],
      why: "Списки и кортежи сохраняют порядок элементов и допускают повторы. В кортеже нельзя заменить, добавить или удалить элемент. Кортеж из хэшируемых элементов, например (2026, 3), может быть ключом словаря. Если хотя бы один элемент — список, использовать такой кортеж как ключ нельзя." },
    q5: { sec: 'slices', q: 'Что вернёт a[::-1]?', code: 'a = [1200, 850, 2300, 640, 1750]\na[::-1]', lang: 'python', opts: [['[1750]'], ['[1750, 640, 2300, 850, 1200]', 1], ['[1200, 850, 2300, 640]'], ['Ошибку: шаг не бывает отрицательным']],
      why: "При шаге −1 и пропущенных границах срез начинается с последнего элемента и доходит до первого. Получается новый список в обратном порядке. Исходный a сохраняет прежнее содержимое. Для списка только с последним элементом подошёл бы a[-1:], а для списка без него — a[:-1]." },
    q6: { sec: 'code', q: "Что получится, если взять первые семь символов из этой строки с датой?", code: "created = '2026-03-14T10:22:05'\ncreated[:7]", lang: 'python', opts: [["'2026-03'", 1], ["'2026-03-'"], ["'2026-03-1'"], ['Ошибку, поскольку у строк якобы нет срезов']],
      why: "Правая граница среза в результат не входит. Выражение created[:7] выбирает символы с индексами от 0 до 6 — четыре цифры года, дефис и две цифры месяца. Следующий дефис находится на позиции 7." },
    q7: { sec: 'nuances', q: 'Что напечатает код?', code: "rows = [[1200, 'Сова'], [850, 'Кедр']]\nc = rows[:]\nc[0][0] = 0\nprint(rows[0][0])", lang: 'python', opts: [['1200'], ['0', 1], ['TypeError: срез нельзя менять'], ["[0, 'Сова']"]],
      why: "Срез rows[:] создал новый внешний список, но оба списка ссылаются на те же вложенные записи. Поэтому c[0] и rows[0] — один список. Присваивание c[0][0] = 0 меняет первый элемент этой записи и через rows мы увидим 0. Если бы c создали с помощью copy.deepcopy(rows), в исходной записи сохранилось бы 1200." }
    },
    glossary: {
      type: { t: 'Тип', en: 'type', d: "Характеристика объекта, от которой зависят допустимые значения и операции. Функция type(x) возвращает тип объекта x." },
      object: { t: 'Объект', en: 'object', d: "Представление данных в Python. У каждого объекта есть тип, значение и идентичность. Два имени могут ссылаться на один объект." },
      collection: { t: 'Коллекция', en: 'collection, container', d: "Объект, который объединяет несколько элементов и позволяет с ними работать. Примеры из урока — список, кортеж, словарь и множество. Коллекция может быть пустой." },
      int: { t: 'Целое число', en: 'int', d: "Тип для целых чисел, например 1200 или -7. Размер целого числа ограничен доступной памятью." },
      float: { t: 'Число с плавающей точкой', en: 'float', d: "Число с плавающей точкой. Его двоичная запись имеет конечную точность, поэтому некоторые десятичные дроби, например 0,1, хранятся приближённо." },
      str: { t: 'Строка', en: 'str, string', d: "Неизменяемая последовательность символов. При разбиении строки метод split() возвращает список частей, а метод upper() возвращает строку в верхнем регистре." },
      method: { t: 'Метод', en: 'method', d: "Операция, доступная для объекта. Например, names.append(value) добавляет значение в список names, а name.lower() возвращает строку в нижнем регистре." },
      bool: { t: 'Логический тип', en: 'bool, Boolean', d: "Тип с двумя значениями, True и False. При сложении они учитываются как 1 и 0 соответственно." },
      none: { t: 'None', en: 'NoneType', d: "Объект, которым в Python часто обозначают отсутствие значения. Для проверки используют выражение x is None." },
      list: { t: 'Список', en: 'list', d: "Изменяемая последовательность. Список сохраняет порядок элементов, допускает повторы и позволяет обратиться к элементу по индексу." },
      tuple: { t: 'Кортеж', en: 'tuple', d: "Неизменяемая последовательность. В кортеже нельзя заменить или удалить элемент. Кортеж подходит для ключа словаря, если все его элементы хэшируемы." },
      dict: { t: 'Словарь', en: 'dict, dictionary', d: "Коллекция пар «ключ — значение». Каждый ключ уникален, значения разных ключей могут совпадать." },
      set: { t: 'Множество', en: 'set', d: "Коллекция различных хэшируемых элементов. Принадлежность проверяют с помощью in. На порядок обхода множества полагаться нельзя." },
      mutable: { t: 'Изменяемость', en: 'mutability', d: "Свойство объекта изменяться после создания. Например, append добавляет элемент в существующий список. Состав кортежа после создания менять нельзя." },
      hash: { t: 'Хэш', en: 'hash, hashable', d: "Целое число, которое используют при поиске ключей в словаре и элементов во множестве. У хэшируемого объекта хэш остаётся постоянным. У равных объектов хэши совпадают, у разных они тоже могут совпасть." },
      index: { t: 'Индекс', en: 'index', d: "Номер позиции в последовательности. Первый элемент имеет индекс 0, а индекс −1 указывает на последний элемент." },
      slice: { t: 'Срез', en: 'slice', d: "Выбор элементов последовательности по записи a[start:stop:step]. Правая граница stop исключается. Для списка результатом будет новый список." },
      json: { t: 'JSON', en: 'JavaScript Object Notation', d: "Текстовый формат обмена данными. При разборе функцией json.loads объекты JSON обычно становятся словарями, а массивы — списками Python." },
      api: { t: 'API', en: 'application programming interface', d: "Интерфейс, через который одна программа обращается к другой. API магазина, например, принимает запрос на список заказов и возвращает данные в формате JSON." },
      reference: { t: 'Ссылка', en: 'reference', d: "Связь с объектом. После присваивания b = a переменные a и b ссылаются на один объект." },
      copy: { t: 'Копия', en: 'copy', d: "В примере со списком новый внешний список с теми же элементами можно получить с помощью a.copy(), a[:] или list(a)." },
      shallow: { t: 'Поверхностная копия', en: 'shallow copy', d: "Копия внешней коллекции, содержащая ссылки на те же элементы. Например, если скопировать список словарей, изменение поля одного словаря будет видно и через исходный список." },
      counter: { t: 'Counter', en: 'collections.Counter', d: "Класс из модуля collections для подсчёта повторов. Метод most_common(n) возвращает до n самых частых элементов вместе с числом их появлений." },
      numpy: { t: 'NumPy', en: 'Numerical Python', d: "Библиотека Python для работы с массивами. Арифметические операции над всем числовым массивом обычно выполняются быстрее, чем поэлементный цикл на Python." }
    },
    materials: [
      ['da-1-2-types-collections.md', 'Текст урока в Markdown с примерами кода, вопросами и глоссарием'],
      ['orders_api.json', 'Учебный ответ API: пять заказов из блоков кода'],
      ['types_collections.ipynb', 'Код страницы и пять упражнений'],
      ['types_collections_solutions.ipynb', 'Решения упражнений'],
      ['refs_demo.py', 'Примеры присваивания, поверхностной и глубокой копии, которые можно запустить как скрипт'],
      ['speed.py', 'Сравнение поиска в списке и множестве, удаления повторов и вычислений в NumPy']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне пять вопросов о различиях между list, tuple, dict и set. Задавай их по одному. После каждого ответа приведи короткое объяснение и покажи, где это разобрано в уроке.'],
      ['Выбор структуры', 'Я опишу задачу с данными заказов. Помоги мне самому выбрать коллекцию. Уточни, нужен ли порядок, допустимы ли повторы и как я буду искать нужную запись. Объясни выбор на примере из урока.'],
      ['Ссылки и вложенные списки', 'Дай мне три коротких фрагмента кода, где два имени ссылаются на один список или где копия сделана срезом вложенного списка. Я предскажу вывод каждого, а ты проверь и объясни по источнику.']
    ]
  };
})();
