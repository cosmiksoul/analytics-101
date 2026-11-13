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
    0: { none: ['не ноль и не пустая строка'] },
    1: { set: ['пустое множество — set(), а {} — словарь'] },
    2: { tuple: ['по одному не пополняют'] },
    3: { dict: ['новый ключ — новый ярлык'] },
    4: { set: ['повтор выброшен', 'bad'], dict: ['ключ тот же: 1 → 2'] },
    5: { list: ['5 элементов в порядке прихода'], set: ['3 уникальных'] },
    6: { tuple: ['собран за один раз'] },
    7: { tuple: ['TypeError', 'bad'], list: ["brands[0] = 'Луч' — можно"] },
    8: { list: ['4 сравнения по очереди'], set: ['хэш → сразу в ячейку'] },
    9: { list: ["brands[3] → 'Луч'"], dict: ["counts['Сова'] → 3"], set: ['unique[0] → TypeError', 'bad'] }
  };
  const BADGES = {
    list: [['порядок', 1], ['повторы', 1], ['меняется', 1]],
    tuple: [['порядок', 1], ['повторы', 1], ['меняется', 0]],
    dict: [['по ключу', 1], ['меняется', 1], ['повторы', 0]],
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
      { n: '02', name: 'Поступление', s: [2, 3] },
      { n: '03', name: 'Повтор', s: [4, 5] },
      { n: '04', name: 'Изменяемость', s: [6, 7] },
      { n: '05', name: 'Поиск', s: [8, 9] },
      { n: '06', name: 'Итог', s: [10] }
    ],
    steps: [
      { title: 'Одиночные значения', dur: 3200, body: '<p>Сначала отдельные значения. Сумма заказа <b>1200</b> — целое число <b>int</b>, скидка <b>0.1</b> — дробное <b>float</b>, бренд <b>\'Сова\'</b> — строка <b>str</b>.</p><p><b>True</b> и&nbsp;<b>False</b> — тип <b>bool</b>, ответ «да или нет». <b>None</b> значит «значения нет».</p>' },
      { title: 'Четыре коробки', dur: 2800, body: '<p>Коллекция — объект, который хранит много значений. Возьмём четыре: список <b>brands</b>, кортеж <b>t</b>, словарь <b>counts</b> и&nbsp;множество <b>unique</b>.</p><p>В&nbsp;них по&nbsp;одному будут падать бренды пяти учебных заказов.</p>' },
      { title: 'Первый заказ: Сова', dur: 2800, body: '<p>Бренд <b>\'Сова\'</b> попадает в&nbsp;список под индексом 0, в&nbsp;словарь и&nbsp;в&nbsp;множество. Словарь вешает на&nbsp;значение ярлык-ключ: под ярлыком «Сова» лежит счётчик 1.</p><p>Кортеж пуст: его не&nbsp;пополняют по&nbsp;одному, а&nbsp;собирают целиком.</p>' },
      { title: 'Второй заказ: Кедр', dur: 2400, body: '<p><b>\'Кедр\'</b> встаёт в&nbsp;список следом, под индексом 1. В&nbsp;словаре появляется второй ярлык, в&nbsp;множестве — второй элемент.</p>' },
      { title: 'Повтор: снова Сова', dur: 3200, body: '<p>Список принимает повтор: <b>\'Сова\'</b> встаёт под индексом 2. Он&nbsp;хранит всё в&nbsp;порядке прихода.</p><p>Множество повтор выбрасывает, такой элемент уже есть. Словарь не&nbsp;заводит второй ярлык, а&nbsp;меняет значение под старым: 1 → 2.</p>' },
      { title: 'Ещё два заказа', dur: 3400, body: '<p>Приходят <b>\'Луч\'</b> и&nbsp;третья <b>\'Сова\'</b>. В&nbsp;списке пять элементов, в&nbsp;множестве и&nbsp;словаре — по&nbsp;три.</p><p>Словарь заодно посчитал частоты: Сова — 3, Кедр — 1, Луч — 1.</p>' },
      { title: 'Кортеж собран целиком', dur: 2800, body: '<p><b>t = tuple(brands)</b> собирает кортеж из&nbsp;списка за&nbsp;один раз. Порядок и&nbsp;повторы те&nbsp;же, что в&nbsp;списке.</p><p>Отличие одно, но&nbsp;главное: кортеж неизменяемый.</p>' },
      { title: 'Кортеж не меняется', dur: 3000, body: '<p>Попытка заменить элемент <b>t[0] = \'Луч\'</b> заканчивается ошибкой <b>TypeError</b>. Добавить или удалить элемент тоже нельзя.</p><p>Список, словарь и&nbsp;множество изменяемы: <b>brands[0] = \'Луч\'</b> сработал&nbsp;бы.</p>' },
      { title: 'Есть ли Луч?', dur: 3600, body: '<p>Проверка <b>\'Луч\' in brands</b> идёт по&nbsp;списку слева направо: Сова, Кедр, Сова, Луч — четыре сравнения. В&nbsp;списке из&nbsp;миллиона элементов их было&nbsp;бы до&nbsp;миллиона.</p><p>Множество и&nbsp;словарь считают <b>хэш</b> — число из&nbsp;самого значения — и&nbsp;сразу заглядывают в&nbsp;нужную ячейку.</p>' },
      { title: 'По номеру и по ярлыку', dur: 3200, body: '<p>Из&nbsp;списка и&nbsp;кортежа берут по&nbsp;индексу: <b>brands[3]</b> — это \'Луч\'. Из&nbsp;словаря — по&nbsp;ключу: <b>counts[\'Сова\']</b> — это 3.</p><p>У&nbsp;множества нет ни&nbsp;индексов, ни&nbsp;ключей, <b>unique[0]</b> — ошибка. Его спрашивают только «есть&nbsp;ли».</p>' },
      { title: 'Кто что умеет', dur: 4200, next: 'Читать страницу', body: '<p>Список — порядок и&nbsp;повторы. Кортеж — то&nbsp;же, но&nbsp;без права на&nbsp;изменения. Словарь — значение по&nbsp;ключу. Множество — только уникальные элементы и&nbsp;быстрая проверка «есть&nbsp;ли».</p><p>Дальше — как выбрать коробку под задачу и&nbsp;почему две переменные могут смотреть на&nbsp;один список.</p>' }
    ],
    hud: [{ id: 'in', label: 'Пришло' }, { id: 'list', label: 'В списке' }, { id: 'uniq', label: 'Уникальных' }],
    legend: '<span><i class="sq" style="background:#2a3550"></i>элемент</span><span><i style="background:#36b8a6"></i>новый, найден</span><span><i style="background:#f2756a"></i>выброшен, ошибка</span>',
    info: 'КОЛЛЕКЦИИ',
    aiNote: "В анимации бренды пяти учебных заказов (Сова, Кедр, Сова, Луч, Сова) по одному падают в список brands, словарь counts (бренд → число заказов) и множество unique; кортеж t собирается целиком: t = tuple(brands). Рядом одиночные значения: 1200 (int), 0.1 (float), 'Сова' (str), True (bool), None.",
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
          const tCells = (s.tuple ? E.map((b, i) => `<span class="tc-chip${!prev.tuple ? ' fresh' : ''}${s.access && i === 3 ? ' hit' : ''}${s.tErr && i === 0 ? ' err' : ''}"><i>${i}</i>${esc(b)}</span>`).join('') : `<span class="tc-wait">${k >= 1 ? 'собирают целиком: tuple(brands)' : ''}</span>`)
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
          if (s.pend !== null) lane = `<span class="lb">приходит</span><span class="tc-chip in">${esc(E[s.pend])}</span><span class="tc-ord">заказ ${IDS[s.pend]}</span>`;
          else if (s.last !== null) lane = `<span class="lb">готово</span><span class="tc-ord">заказ ${IDS[s.last]} · <b>'${esc(E[s.last])}'</b> → список, словарь, множество</span>`;
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
    box.innerHTML = `<div class="block-hd"><span class="t">Два имени, один объект <i>интерактив</i></span><div class="ctrls"><span class="seg" role="group" aria-label="Тип объекта"><button type="button" data-kind="list" aria-pressed="true">Список</button><button type="button" data-kind="tuple" aria-pressed="false">Кортеж</button></span><button type="button" class="btn ghost small" id="rc-reset">Сбросить</button></div></div>
<p class="hint rc-do">Выберите, как создать b, и меняйте данные через a или через b. Стрелки показывают, на какой объект смотрит каждое имя.</p>
<div class="stage rc-stage"><div class="rc-left">
<div class="rc-row"><span class="rc-lbl">Как создать b</span><span class="seg" role="group" aria-label="Как создать b"><button type="button" data-mode="same" aria-pressed="true">b = a</button><button type="button" data-mode="copy" aria-pressed="false">b = a.copy()</button></span></div>
<div class="rc-mem" id="rc-mem" aria-live="polite"></div>
<div class="rc-row"><span class="rc-lbl">Изменить</span><span class="rc-acts"><button type="button" class="btn small" id="rc-add"></button><button type="button" class="btn small" id="rc-set"></button></span></div>
<div class="rc-tk"><p class="cap">Задания</p><ol class="steps rc-tasks" id="rc-tasks"></ol></div>
</div>
<div class="narr"><p class="cap">Программа</p><pre class="rc-pre" id="rc-prog"></pre><p class="cap">Вывод</p><pre class="rc-pre" id="rc-out"></pre><div class="narr-text" id="rc-msg"></div></div></div>
<div class="status"><span><span class="dot live" id="rc-dot"></span><span id="rc-is"></span></span><span id="rc-objs"></span><span id="rc-len"></span><span class="grow"></span><span id="rc-n"></span></div>`;
    const TASKS = ['Список, b = a: измените данные и найдите изменение во второй переменной.', 'Список, b = a.copy(): убедитесь, что связь разорвана.', 'Кортеж: попробуйте дописать и исправить. Изменится ли b?'];
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
      msg = kind === 'tuple' ? 'Кортеж тоже можно назвать двумя именами. Попробуйте изменить его через a или через b. Метода copy() у кортежа нет: неизменяемый объект копировать незачем.'
        : mode === 'copy' ? 'a.copy() создал второй список с теми же числами. У каждого имени теперь свой объект: №1 у a, №2 у b.'
        : 'b = a не копирует список, а даёт ему второе имя. Обе стрелки ведут к одному объекту №1. Измените его через a или через b.';
    }
    function add() {
      const o = objs[refs.a];
      if (o.items.length >= 7) { msg = 'Хватит заказов: нажмите «Сбросить» или переключите режим.'; return; }
      if (kind === 'list') {
        o.items.push(990); hot = { id: o.id, i: o.items.length - 1 }; prog.push({ c: 'a.append(990)' });
        msg = refs.a === refs.b ? `a.append(990) дописал заказ в объект №${o.id}. На него же смотрит b, поэтому print(b) тоже показывает 990: имён два, объект один.`
          : `a.append(990) изменил объект №${o.id}. У b свой объект №${refs.b}, копия, поэтому в b ${objs[refs.b].items.length} ${plural(objs[refs.b].items.length, ['заказ', 'заказа', 'заказов'])}, как и было.`;
      } else {
        const n = mk(o.items.concat(990)); refs.a = n.id;
        const gone = Object.keys(objs).filter(id => +id !== refs.a && +id !== refs.b);
        gone.forEach(id => { delete objs[id]; });
        hot = { id: n.id, i: n.items.length - 1, fresh: true }; prog.push({ c: 'a += (990,)' }); tAdd = true;
        msg = `Кортеж изменить нельзя, поэтому a += (990,) собрал новый кортеж — объект №${n.id} — и переставил на него имя a. b по-прежнему смотрит на объект №${refs.b}, в нём ничего не поменялось.${gone.length ? ` На кортеж №${gone[0]} больше не смотрит ни одно имя, и Python его удаляет.` : ''}`;
      }
      ops++;
    }
    function setFirst() {
      prog.push({ c: 'b[0] = 1300' });
      if (kind === 'tuple') {
        prog.push({ c: "TypeError: 'tuple' object does not support item assignment", err: true }); tSet = true; hot = null;
        msg = 'Ошибка TypeError: кортеж нельзя изменить ни через b, ни через a. Поэтому делить один кортеж между двумя именами безопасно.';
      } else {
        const o = objs[refs.b], was = o.items[0]; o.items[0] = 1300; hot = { id: o.id, i: 0 };
        msg = was === 1300 ? 'Первый заказ уже равен 1300: присваивание того же значения ничего не меняет.'
          : refs.a === refs.b ? `b[0] = 1300 поменял первый элемент объекта №${o.id}. Это тот же объект, что у a, поэтому и print(a) начинается с 1300.`
          : `b[0] = 1300 поменял только копию — объект №${o.id}. В a первый заказ всё ещё ${objs[refs.a].items[0]}.`;
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
      $('rc-add').setAttribute('aria-label', 'Дописать заказ 990 через a');
      $('rc-set').innerHTML = '<code>b[0] = 1300</code>';
      $('rc-set').setAttribute('aria-label', 'Исправить первый заказ на 1300 через b');
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
      $('rc-objs').textContent = `${nObj} ${plural(nObj, ['объект', 'объекта', 'объектов'])} в памяти`;
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
    aiData: "пять учебных заказов интернет-магазина 1041–1045: бренды Сова, Кедр, Сова, Луч, Сова, суммы 1200, 850, 2300, 640, 1750 ₽, даты в марте и апреле 2026",
    scene,
    widgets: { refs: buildRefs },
    code: {
      json: { title: 'Разбор JSON-ответа API в словари и списки', badge: 'проверено: Python 3.13', lang: 'python',
        code: `import json

# Учебный ответ API интернет-магазина. В жизни он приходит по сети,
# здесь лежит строкой, чтобы пример работал без интернета
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
        note: 'true стало True, null — None, 1200 — int, 0.1 — float. Заказ 1043 не оплачен, поэтому в сумму не попал.' },
      freq: { title: 'Частоты брендов: dict, Counter и set', badge: 'проверено: Python 3.13', lang: 'python',
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
        note: 'Вывод одинаков от запуска к запуску: множество печатается через sorted, а словарь и Counter хранят порядок добавления ключей.' },
      dates: { title: 'Срезы строки с датой и выручка по месяцам', badge: 'проверено: Python 3.13', lang: 'python',
        code: `created = orders[0]["created"]
print(created)
print(created[:4], created[5:7], created[8:10])   # год, месяц, день
print(created[:10], created[-8:])                 # дата и время
print(created[:7])                                # год и месяц
print(created.split("T"))                         # метод строки: разрезать по T

by_month = {}                       # выручка по месяцам
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
        note: 'Здесь учтены все заказы, включая неоплаченный 1043. Срез работает, пока все даты записаны в одном формате с ведущими нулями.' }
    },
    questions: {
    q1: { sec: 'refs', title: 'Сначала предскажите', q: 'Что напечатает этот код?', code: 'a = [1200, 850, 2300]\nb = a\na.append(990)\nprint(b)', lang: 'python', opts: [['[1200, 850, 2300]'], ['[1200, 850, 2300, 990]', 1], ['[990, 1200, 850, 2300]'], ['AttributeError: у b нет метода append']],
      why: 'b = a не создаёт второй список: оба имени указывают на один объект. append меняет этот объект на месте и дописывает элемент в конец, поэтому print(b) показывает и новый заказ 990. Первый вариант был бы верен, если бы b создали через a.copy(). Ошибки нет: b — обычный список. Проверьте в интерактиве ниже.' },
    q2: { sec: 'idea', q: 'В анимации «Сова» пришла второй раз. Что сделали множество и словарь?', opts: [['Оба добавили второй элемент «Сова»'], ['Множество выбросило повтор, а словарь увеличил значение под ключом «Сова» до 2', 1], ['Множество заменило старую «Сову» новой, а словарь выбросил повтор'], ['Оба выдали ошибку: повторы в них запрещены']],
      why: 'Элементы множества уникальны, поэтому повтор просто не добавляется. Ключи словаря тоже уникальны: второй ярлык «Сова» не появляется, но значение под существующим ключом можно поменять, и счётчик вырос с 1 до 2. Ошибки нет ни там, ни там: повтор — обычная ситуация.' },
    q3: { sec: 'colls', q: 'Почему set(data) убирает повторы из 20 000 чисел в сотни раз быстрее, чем цикл с проверкой if x not in seen по списку seen?', opts: [['Множество сортирует элементы и выбрасывает одинаковых соседей'], ['Множество находит элемент по хэшу за одно обращение, а цикл на каждом шаге просматривает весь собранный список', 1], ['Множество хранит только количество элементов, а не сами элементы'], ['set() пропускает часть элементов, чтобы работать быстрее']],
      why: 'Проверка x not in seen для списка — перебор: чем больше собрано, тем дольше каждая проверка, и общее время растёт примерно как квадрат длины. Множество считает хэш и сразу заглядывает в нужную ячейку. Сортировки внутри множества нет, сами элементы оно хранит и ничего не пропускает.' },
    q4: { sec: 'colls', q: 'Чем кортеж отличается от списка, кроме круглых скобок?', opts: [['Кортеж не хранит порядок элементов'], ['В кортеже не бывает повторов'], ['Кортеж нельзя изменить после создания, поэтому он годится в ключи словаря', 1], ['В кортеже могут лежать только числа']],
      why: 'Порядок и повторы кортеж хранит так же, как список, и лежать в нём может что угодно. Отличие в изменяемости: заменить, добавить или удалить элемент нельзя. Поэтому хэш кортежа из чисел и строк не меняется, и его можно сделать ключом словаря, например (2026, 3).' },
    q5: { sec: 'slices', q: 'Что вернёт a[::-1]?', code: 'a = [1200, 850, 2300, 640, 1750]\na[::-1]', lang: 'python', opts: [['[1750]'], ['[1750, 640, 2300, 850, 1200]', 1], ['[1200, 850, 2300, 640]'], ['Ошибку: шаг не бывает отрицательным']],
      why: 'Срез без start и stop берёт всю последовательность, а шаг −1 проходит её с конца. Получается новый список задом наперёд, исходный a не меняется. [1750] дал бы срез a[-1:], а все элементы, кроме последнего, — a[:-1]. Отрицательный шаг разрешён.' },
    q6: { sec: 'code', q: 'Что вернёт выражение из третьего блока кода?', code: "created = '2026-03-14T10:22:05'\ncreated[:7]", lang: 'python', opts: [["'2026-03'", 1], ["'2026-03-'"], ["'2026-03-1'"], ['Ошибку: строку нельзя срезать']],
      why: 'Срез [:7] берёт символы с индексами 0–6: «2026» — это 0–3, дефис — 4, «03» — 5 и 6. Символ с индексом 7, второй дефис, не входит: stop не включается. Строки срезаются так же, как списки, и срез строки — тоже строка.' },
    q7: { sec: 'nuances', q: 'Что напечатает код?', code: "rows = [[1200, 'Сова'], [850, 'Кедр']]\nc = rows[:]\nc[0][0] = 0\nprint(rows[0][0])", lang: 'python', opts: [['1200'], ['0', 1], ['TypeError: срез нельзя менять'], ["[0, 'Сова']"]],
      why: 'rows[:] — поверхностная копия: внешний список новый, но в нём лежат ссылки на те же внутренние списки. c[0] и rows[0] — один объект, поэтому изменение через c видно в rows. 1200 осталось бы после copy.deepcopy(rows). Срез — обычный список, его можно менять, а rows[0][0] — число, а не список.' }
    },
    glossary: {
      type: { t: 'Тип', en: 'type', d: 'Вид значения, от которого зависит, что с ним можно делать. Узнаётся функцией type().' },
      object: { t: 'Объект', en: 'object', d: 'Любое значение в Python. У объекта есть тип, значение и место в памяти, а переменные на него указывают.' },
      collection: { t: 'Коллекция', en: 'collection, container', d: 'Объект, внутри которого лежат другие объекты: список, кортеж, словарь, множество.' },
      int: { t: 'Целое число', en: 'int', d: 'Тип целых чисел. Длина в Python не ограничена, точность не теряется.' },
      float: { t: 'Число с плавающей точкой', en: 'float', d: 'Тип дробных чисел в двоичном виде с конечной точностью, поэтому 0,1 хранится приближённо.' },
      str: { t: 'Строка', en: 'str, string', d: 'Неизменяемая последовательность символов в кавычках. Её методы возвращают новую строку.' },
      method: { t: 'Метод', en: 'method', d: 'Функция объекта, которую вызывают через точку: \'Сова\'.lower(), brands.append(\'Луч\').' },
      bool: { t: 'Логический тип', en: 'bool, Boolean', d: 'Тип с двумя значениями, True и False. Разновидность int: True равно 1.' },
      none: { t: 'None', en: 'NoneType', d: 'Значение «ничего нет». Не равно ни нулю, ни пустой строке, проверяется через is None.' },
      list: { t: 'Список', en: 'list', d: 'Изменяемая последовательность в квадратных скобках: порядок, повторы, доступ по индексу.' },
      tuple: { t: 'Кортеж', en: 'tuple', d: 'Неизменяемая последовательность в круглых скобках. Годится в ключи словаря.' },
      dict: { t: 'Словарь', en: 'dict, dictionary', d: 'Пары «ключ → значение» с уникальными ключами. Значение находится по ключу сразу.' },
      set: { t: 'Множество', en: 'set', d: 'Уникальные элементы без порядка. Проверка «есть ли» идёт по хэшу.' },
      mutable: { t: 'Изменяемость', en: 'mutability', d: 'Свойство объекта меняться на месте. Списки, словари и множества изменяемы, числа, строки и кортежи — нет.' },
      hash: { t: 'Хэш', en: 'hash, hashable', d: 'Число из значения объекта, по которому словарь и множество находят ячейку. Хэшируемы числа, строки и кортежи из них.' },
      index: { t: 'Индекс', en: 'index', d: 'Номер элемента последовательности, считается с нуля. Отрицательный считает с конца: −1 — последний.' },
      slice: { t: 'Срез', en: 'slice', d: 'Кусок последовательности a[start:stop:step], stop не входит. Возвращает новый объект.' },
      json: { t: 'JSON', en: 'JavaScript Object Notation', d: 'Текстовый формат обмена данными. Его объекты и массивы становятся в Python словарями и списками.' },
      api: { t: 'API', en: 'application programming interface', d: 'Правила, по которым одна программа запрашивает данные у другой и получает ответ, часто в JSON.' },
      reference: { t: 'Ссылка', en: 'reference', d: 'Связь имени с объектом. b = a не копирует объект, а даёт ему второе имя.' },
      copy: { t: 'Копия', en: 'copy', d: 'Новый объект с тем же содержимым: a.copy(), a[:], list(a).' },
      shallow: { t: 'Поверхностная копия', en: 'shallow copy', d: 'Копия внешней коллекции со ссылками на те же вложенные объекты. Полную копию делает copy.deepcopy.' },
      counter: { t: 'Counter', en: 'collections.Counter', d: 'Словарь из модуля collections, который считает повторы. most_common(n) даёт n самых частых.' },
      numpy: { t: 'NumPy', en: 'Numerical Python', d: 'Библиотека для массивов чисел одного типа: операции над всем массивом идут намного быстрее циклов.' }
    },
    materials: [
      ['da-1-2-types-collections.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['orders_api.json', 'Учебный ответ API: пять заказов из блоков кода'],
      ['types_collections.ipynb', 'Код страницы и пять упражнений'],
      ['types_collections_solutions.ipynb', 'Решения упражнений'],
      ['refs_demo.py', 'Опыт «ссылка или копия» скриптом'],
      ['speed.py', 'Замеры скорости со страницы']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне пять вопросов по источнику о том, чем различаются list, tuple, dict и set. По одному за раз; после моего ответа объясни, где я ошибся, со ссылкой на текст источника.'],
      ['Выбор структуры', 'Я опишу задачу с данными заказов. Не называй структуру сразу: спроси, что мне нужно — искать по ключу, перебирать по порядку или проверять принадлежность, — и помоги выбрать list, tuple, dict или set по правилам из источника.'],
      ['Ловушки ссылок', 'Дай мне три коротких фрагмента кода, где две переменные смотрят на один список или где копия сделана срезом вложенного списка. Я предскажу вывод каждого, а ты проверь и объясни по источнику.']
    ]
  };
})();
