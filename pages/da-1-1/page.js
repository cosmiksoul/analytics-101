/* Страница 1.1 · Среда: Jupyter, Colab, состояние ядра */
(() => {
  // ---------- маленький «Python» для пяти ячеек: только то, что нужно сцене и интерактиву ----------
  class PyNameError extends Error { constructor(n) { super(`NameError: name '${n}' is not defined`); this.pyName = n; } }
  const need = (env, ...names) => names.forEach(n => { if (!(n in env)) throw new PyNameError(n); });
  const pyRepr = v => Array.isArray(v) ? `[${v.join(', ')}]` : typeof v === 'number' ? (Number.isInteger(v) ? `${v}.0` : String(v)) : String(v);
  const sum = a => a.reduce((s, x) => s + x, 0);
  const f0 = v => String(Math.round(v));

  /* ===================== Сцена ===================== */
  const SC = {
    a: { code: 'orders = [1200, 850, 2300, 640, 1750]', run: e => { e.orders = [1200, 850, 2300, 640, 1750]; } },
    b: { code: 'total = sum(orders) * (1 - discount)', run: e => { need(e, 'orders', 'discount'); e.total = sum(e.orders) * (1 - e.discount); } },
    c: { code: 'discount = 0.1', run: e => { e.discount = 0.1; } },
    d: { code: 'avg = total / len(orders)', run: e => { need(e, 'total', 'orders'); e.avg = e.total / e.orders.length; } },
    e: { code: 'print(f"Выручка: {total:.0f} ₽, средний чек: {avg:.0f} ₽")', run: e => { need(e, 'total', 'avg'); return `Выручка: ${f0(e.total)} ₽, средний чек: ${f0(e.avg)} ₽`; } }
  };
  const ACTS = [
    [], [['run', 'a']], [['run', 'c']], [['run', 'b']], [['run', 'd'], ['run', 'e']],
    [['restart']], [['run', 'a']], [['run', 'b']], [['move', 'c', 1]],
    [['restart'], ['run', 'a'], ['run', 'c'], ['run', 'b'], ['run', 'd'], ['run', 'e']]
  ];
  // выноски к ячейкам: шаг → [ячейка, текст]; появляются во второй половине шага
  const CALLS = { 1: ['a', 'In [1] — первый запуск'], 2: ['c', 'запущена второй'], 3: ['b', 'In [3], хотя ячейка вторая'], 7: ['b', 'discount ещё не создан'], 8: ['c', 'теперь выше расчёта'], 9: ['e', 'In [1]–[5] подряд'] };
  const blank = () => ({ order: ['a', 'b', 'c', 'd', 'e'], cnt: {}, out: {}, err: {}, env: {}, n: 0, errors: 0, hist: [], moved: null, stopped: false });
  function apply(s, a) {
    if (a[0] === 'run') {
      const id = a[1]; s.n++; s.cnt[id] = s.n; s.hist.push(id);
      try { const o = SC[id].run(s.env); s.out[id] = o || ''; delete s.err[id]; }
      catch (e) { s.out[id] = e.message; s.err[id] = true; s.errors++; s.stopped = true; }
    } else if (a[0] === 'restart') { Object.assign(s, { cnt: {}, out: {}, err: {}, env: {}, n: 0, hist: [], stopped: false }); s.restarted = true; }
    else if (a[0] === 'move') { s.order = s.order.filter(x => x !== a[1]); s.order.splice(a[2], 0, a[1]); s.moved = a[1]; }
  }
  const stateAt = (k, p) => {
    const s = blank(); let active = null;
    for (let i = 0; i < k; i++) ACTS[i].forEach(a => apply(s, a));
    s.moved = null; s.restarted = false;
    const A = ACTS[k], n = A.length;
    A.forEach((a, j) => { if (p >= (j + 0.55) / n) apply(s, a); else if (p >= j / n && active === null) active = a; });
    s.active = active;
    return s;
  };

  const scene = {
    parts: [{ n: '01', name: 'Ноутбук', s: [0, 1] }, { n: '02', name: 'Порядок автора', s: [2, 3, 4] }, { n: '03', name: 'Перезапуск', s: [5] }, { n: '04', name: 'Чистый лист', s: [6, 7] }, { n: '05', name: 'Исправление', s: [8, 9] }],
    steps: [
      { title: 'Пять ячеек и пустое ядро', dur: 2600, body: '<p>Ноутбук <b>orders_report.ipynb</b> считает выручку по&nbsp;пяти заказам. Слева — ячейки с&nbsp;кодом, справа — память <b>ядра</b>: отдельного процесса Python, который выполняет код и&nbsp;хранит переменные.</p><p>Ни&nbsp;одна ячейка ещё не&nbsp;запускалась: счётчики In&nbsp;[ ] пустые, память пуста.</p>' },
      { title: 'Первая ячейка', dur: 2400, body: '<p>Запускаем ячейку 1. Ядро выполняет код, и&nbsp;в&nbsp;памяти появляется список <b>orders</b>.</p><p>Ячейка получает номер In&nbsp;[1]. Это номер запуска, а&nbsp;не&nbsp;номер ячейки.</p>' },
      { title: 'Автор забегает вперёд', dur: 2400, body: '<p>Автор сначала решил задать скидку и&nbsp;запустил ячейку 3. Она получает In&nbsp;[2], в&nbsp;памяти появляется <b>discount = 0.1</b>.</p>' },
      { title: 'Выручка считается', dur: 2600, body: '<p>Теперь ячейка 2: <b>total = sum(orders) * (1 − discount)</b>. Скидка уже лежит в&nbsp;памяти, поэтому всё работает.</p><p>У&nbsp;ячейки 2 номер In&nbsp;[3]: номера идут не&nbsp;по&nbsp;порядку ячеек.</p>' },
      { title: 'Отчёт готов', dur: 3200, body: '<p>Ячейки 4 и&nbsp;5 считают средний чек и&nbsp;печатают отчёт. Ноутбук выглядит законченным.</p><p>Но&nbsp;порядок, в&nbsp;котором его надо запускать — 1, 3, 2, 4, 5, — знает только автор. В&nbsp;файле он&nbsp;виден лишь по&nbsp;номерам In.</p>' },
      { title: 'Перезапуск ядра', dur: 2600, body: '<p>Перезапуск ядра стирает память: все переменные исчезают. Мы&nbsp;ещё и&nbsp;очистили выводы, поэтому номера In пропали.</p><p>В&nbsp;файле остался только код. Порядок, в&nbsp;котором его запускали, нигде не&nbsp;записан.</p>' },
      { title: 'Запустить всё', dur: 2400, body: '<p>Коллега открывает ноутбук и&nbsp;нажимает «Запустить всё». Ячейки идут сверху вниз. Первая создаёт <b>orders</b>.</p>' },
      { title: 'NameError', dur: 2800, body: '<p>Вторая ячейка ищет <b>discount</b>, а&nbsp;его нет: ячейка 3 ещё не&nbsp;запускалась.</p><p>Python останавливается с&nbsp;ошибкой <b>NameError</b>. Ячейки ниже уже не&nbsp;выполняются.</p>' },
      { title: 'Переставляем ячейку', dur: 2200, body: '<p>Исправление простое: порядок ячеек должен совпадать с&nbsp;порядком выполнения. Переносим ячейку со&nbsp;скидкой выше расчёта выручки.</p>' },
      { title: 'Проверка с чистого листа', dur: 4200, next: 'Читать страницу', body: '<p>Перезапускаем ядро и&nbsp;запускаем всё. Номера In идут подряд от&nbsp;1 до&nbsp;5, отчёт печатается.</p><p>Только после такой проверки ноутбук можно отдавать коллегам.</p>' }
    ],
    hud: [{ id: 'cnt', label: 'Счётчик In' }, { id: 'vars', label: 'Переменных' }, { id: 'err', label: 'Ошибок' }],
    legend: '<span><i class="sq" style="background:#24304a"></i>ячейка</span><span><i style="background:#36b8a6"></i>переменная в ядре</span><span><i style="background:#f2756a"></i>ошибка</span>',
    info: 'НОУТБУК',
    aiNote: 'В анимации ноутбук из пяти ячеек: orders = [1200, 850, 2300, 640, 1750]; total = sum(orders) * (1 - discount); discount = 0.1; avg = total / len(orders); print(...). Автор запускал их в порядке 1, 3, 2, 4, 5.',
    mount(root, api) {
      const { esc, hl } = api;
      let sig = '', prevVars = new Set();
      return {
        render(k, p) {
          const s = stateAt(k, p);
          const vars = Object.keys(s.env);
          const call = CALLS[k] && p >= 0.6 ? CALLS[k] : null;
          const key = JSON.stringify([s.order, s.cnt, s.out, vars, s.active, s.hist, k, !!call]);
          api.hud('cnt', s.n ? `[${s.n}]` : '[ ]');
          api.hud('vars', String(vars.length));
          api.hud('err', String(s.errors), s.errors ? 'NameError' : '');
          if (key === sig) return; sig = key;
          const cells = s.order.map((id, i) => {
            const run = s.active && s.active[0] === 'run' && s.active[1] === id, er = s.err[id];
            const o = s.out[id];
            return `<div class="nb-cell${run ? ' run' : ''}${er ? ' err' : ''}${s.moved === id ? ' moved' : ''}"><span class="nb-in">In [${s.cnt[id] || ' '}]:</span><pre class="nb-code">${hl(SC[id].code)}</pre>${o ? `<div class="nb-out${er ? ' err' : ''}">${esc(o)}</div>` : ''}${call && call[0] === id ? `<span class="nb-call">${esc(call[1])}</span>` : ''}</div>`;
          }).join('');
          const v = vars.map(n => `<div class="nb-var${prevVars.has(n) ? '' : ' fresh'}"><b>${n}</b><span>${esc(pyRepr(s.env[n]))}</span></div>`).join('') || `<div class="nb-empty">${s.restarted || (s.active && s.active[0] === 'restart') ? 'память очищена' : 'пусто'}</div>`;
          const hist = s.hist.map((id, i) => `<span><i>[${i + 1}]</i>яч.&nbsp;${s.order.indexOf(id) + 1}</span>`).join('');
          root.innerHTML = `<div class="nbsc"><div class="nb-file"><div class="nb-hd"><span>orders_report.ipynb</span><span class="nb-tag">файл</span></div><div class="nb-cells">${cells}</div><div class="nb-hist"><span class="lb">Запуски:</span>${hist || '<span class="none">ещё не было</span>'}</div></div>
<div class="nb-kern${s.active && s.active[0] === 'restart' ? ' wipe' : ''}"><div class="nb-hd"><span>Ядро · память</span><span class="nb-tag">процесс Python</span></div><div class="nb-vars">${v}</div></div></div>`;
          prevVars = new Set(vars);
        }
      };
    }
  };

  /* ===================== Интерактив «Порядок выполнения» ===================== */
  const W = [
    { code: 'orders = [1200, 850, 2300, 640, 1750]', run: e => { e.orders = [1200, 850, 2300, 640, 1750]; } },
    { code: 'discount = 0.1', run: e => { e.discount = 0.1; }, del: true },
    { code: 'orders.append(990)  # заказ из вчерашней выгрузки', run: e => { need(e, 'orders'); e.orders = e.orders.concat(990); } },
    { code: 'total = sum(orders) * (1 - discount)', run: e => { need(e, 'orders', 'discount'); e.total = sum(e.orders) * (1 - e.discount); e._basis = e.orders.length; } },
    { code: 'print(f"Заказов: {len(orders)}, выручка: {total:.0f} ₽")', run: e => { need(e, 'orders', 'total'); return `Заказов: ${e.orders.length}, выручка: ${f0(e.total)} ₽`; } }
  ];
  function buildOrder(box, api) {
    const { $, esc, hl, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Порядок выполнения <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn small" id="ow-all">▶▶ Запустить всё</button><button type="button" class="btn ghost small" id="ow-restart">↻ Перезапустить ядро</button><button type="button" class="btn ghost small" id="ow-reset">Сбросить</button></div></div>
<p class="hint ow-do">Запускайте ячейки кнопкой ▶ в любом порядке. Справа — что сейчас лежит в памяти ядра.</p>
<div class="stage"><div class="ow-nb" id="ow-nb"></div>
<div class="narr"><p class="cap">Память ядра</p><div class="ow-mem" id="ow-mem"></div><p class="cap">Задания</p><ol class="steps ow-tasks" id="ow-tasks"></ol><div class="narr-text" id="ow-msg"></div></div></div>
<div class="status"><span><span class="dot live" id="ow-dot"></span><span id="ow-k"></span></span><span id="ow-n"></span><span id="ow-e"></span><span class="grow"></span><span id="ow-h"></span></div>`;
    const TASKS = ['Уроните ноутбук: найдите порядок запуска, при котором появляется NameError.', 'Добейтесь, чтобы отчёт напечатал «Заказов: 7».', 'Удалите ячейку 2 после того, как она отработала, и снова получите отчёт. Потом перезапустите ядро и запустите всё.'];
    let s;
    const fresh = () => ({ env: {}, n: 0, cnt: {}, out: {}, err: {}, stale: {}, hist: [], errors: 0, deleted: false, delAfterRun: false, restartAfterDel: false, done: [false, false, false], msg: 'Начните с любой ячейки. Например, попробуйте сразу запустить ячейку 4.' });
    const order = () => W.map((c, i) => i).filter(i => !(s.deleted && W[i].del));
    function runCell(i) {
      s.n++; s.cnt[i] = s.n; s.hist.push(i); delete s.stale[i];
      const before = s.env.orders ? s.env.orders.length : null;
      try {
        const o = W[i].run(s.env); s.out[i] = o || ''; delete s.err[i];
        if (i === 2) s.msg = before && before >= 6 ? `Ячейка 3 запущена ещё раз: в списке уже ${s.env.orders.length} заказов. Повторный запуск этой ячейки меняет данные.` : `Ячейка 3 дописала заказ: в списке ${s.env.orders.length} ${plural(s.env.orders.length, ['заказ', 'заказа', 'заказов'])}.`;
        else if (i === 4) {
          const st = s.env._basis !== s.env.orders.length;
          s.msg = st ? `Отчёт напечатан, но total посчитан, когда в списке было ${s.env._basis} заказов, а сейчас их ${s.env.orders.length}. Отчёт смешивает старое и новое: запустите ячейку 4 ещё раз.` : 'Отчёт напечатан. Попробуйте получить другой результат, не меняя код.';
          if (/Заказов: 7/.test(o)) s.done[1] = true;
          if (s.deleted && s.delAfterRun) s.msg += ' Ячейки 2 в файле нет, а discount в памяти остался.';
        } else s.msg = `Ячейка ${i + 1} выполнена как In [${s.n}].`;
        return true;
      } catch (e) {
        s.out[i] = e.message; s.err[i] = true; s.errors++; s.done[0] = true;
        const who = { orders: 'ячейка 1', discount: 'ячейка 2', total: 'ячейка 4' }[e.pyName];
        s.msg = `Ячейка ${i + 1} упала: имени ${e.pyName} нет в памяти ядра. Его создаёт ${who}${e.pyName === 'discount' && s.deleted ? ', но её больше нет в файле. Вот оно, скрытое состояние: пока ядро было живо, ноутбук работал' : ''}.`;
        if (e.pyName === 'discount' && s.deleted && s.delAfterRun && s.restartAfterDel) s.done[2] = true;
        return false;
      }
    }
    function draw() {
      const ids = order();
      $('ow-nb').innerHTML = ids.map((i, pos) => {
        const o = s.out[i], er = s.err[i];
        return `<div class="ow-cell${er ? ' err' : ''}${s.stale[i] ? ' stale' : ''}"><button type="button" class="ow-run" data-run="${i}" aria-label="Запустить ячейку ${i + 1}">▶</button><span class="ow-in">In [${s.cnt[i] || ' '}]:</span><span class="ow-num">${i + 1}</span><pre class="ow-code">${hl(W[i].code)}</pre>${W[i].del ? `<button type="button" class="ow-del" data-del="${i}" aria-label="Удалить ячейку 2">Удалить</button>` : ''}${o ? `<div class="ow-out${er ? ' err' : ''}">${esc(o)}</div>` : ''}</div>`;
      }).join('') + (s.deleted ? '<p class="ow-gone">Ячейка 2 удалена из файла.</p>' : '');
      const vars = Object.keys(s.env).filter(n => n[0] !== '_');
      $('ow-mem').innerHTML = vars.length ? vars.map(n => `<div class="ow-var"><b>${n}</b><span>${esc(pyRepr(s.env[n]))}</span></div>`).join('') : '<div class="ow-empty">пусто</div>';
      $('ow-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t)}</li>`).join('');
      $('ow-msg').textContent = s.msg;
      $('ow-k').textContent = `Ядро: ${vars.length} ${plural(vars.length, ['переменная', 'переменные', 'переменных'])}`;
      $('ow-n').textContent = `Счётчик: In [${s.n || ' '}]`;
      $('ow-e').textContent = `Ошибок: ${s.errors}`;
      $('ow-h').textContent = s.hist.length ? `Запуски: ${s.hist.slice(-9).map(i => i + 1).join(' → ')}${s.hist.length > 9 ? ' …' : ''}` : 'Запусков ещё не было';
    }
    box.addEventListener('click', e => {
      const r = e.target.closest('[data-run]'), d = e.target.closest('[data-del]');
      if (r) { runCell(+r.dataset.run); draw(); }
      else if (d) { s.deleted = true; s.delAfterRun = 'discount' in s.env; s.msg = s.delAfterRun ? 'Ячейка 2 удалена из файла, но discount = 0.1 остался в памяти ядра. Запустите ячейки 4 и 5: ноутбук по-прежнему считает.' : 'Ячейка 2 удалена, а discount в памяти не было. Ячейка 4 теперь не сможет посчитать выручку.'; draw(); }
    });
    $('ow-all').addEventListener('click', () => { for (const i of order()) { if (!runCell(i)) break; } draw(); });
    $('ow-restart').addEventListener('click', () => {
      Object.keys(s.out).forEach(i => { s.stale[i] = true; });
      Object.assign(s, { env: {}, n: 0, hist: [] }); s.cnt = Object.assign({}, s.cnt);
      if (s.deleted) s.restartAfterDel = true;
      s.msg = 'Ядро перезапущено: память пуста, счётчик начнётся с 1. Старые выводы остались на экране, но за ними больше ничего не стоит.';
      draw();
    });
    $('ow-reset').addEventListener('click', () => { s = fresh(); draw(); });
    s = fresh(); draw();
    return {
      describe() {
        const vars = Object.keys(s.env).filter(n => n[0] !== '_');
        return `порядок запусков: ${s.hist.map(i => i + 1).join(', ') || 'не было'}; в памяти ядра: ${vars.map(n => `${n} = ${pyRepr(s.env[n])}`).join('; ') || 'пусто'}; ошибок: ${s.errors}${s.deleted ? '; ячейка 2 удалена из файла' : ''}; выполнено заданий: ${s.done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-1-1',
    short: 'DA-01',
    title: 'Среда: Jupyter, Colab, состояние ядра',
    where: 'блок «Дата аналитика», тема 01 «Python для анализа», страница 1.1',
    aiData: 'ноутбук из пяти ячеек, который считает выручку по пяти заказам со скидкой 10%',
    scene,
    widgets: { order: buildOrder },
    code: {
      first: { title: 'Первая ячейка: импорты и версии', badge: 'проверено: Python 3.13', lang: 'python',
        code: `# Ячейка 1: импорты и версии. Читатель ноутбука сразу видит, на чём он работает
import platform

import numpy as np
import pandas as pd

print("Python", platform.python_version())
print("numpy", np.__version__, "| pandas", pd.__version__)`,
        out: 'Python 3.13.18\nnumpy 2.5.3 | pandas 3.0.5',
        note: 'Версии в выводе — те, на которых проверен код всего блока: Python 3.13, NumPy 2.5, pandas 3.0; SQL запускался на PostgreSQL 16. У вас версии будут свои, и вывод может отличаться в мелочах — ради этого первая ячейка и нужна.' },
      check: { title: 'Проверка с чистого листа из терминала', badge: 'проверено: nbconvert 7.17', lang: 'bash',
        code: `# порядок ячеек как в анимации: discount задан ниже, чем используется
jupyter nbconvert --to notebook --execute orders_report.ipynb

# после переноса ячейки со скидкой выше расчёта
jupyter nbconvert --to notebook --execute orders_report_fixed.ipynb --output checked.ipynb`,
        outLabel: 'Вывод: сообщение об ошибке от nbconvert сокращено, цветовые коды убраны',
        out: `[NbConvertApp] Converting notebook orders_report.ipynb to notebook
nbclient.exceptions.CellExecutionError: An error occurred while executing the following cell:
------------------
total = sum(orders) * (1 - discount)
------------------

NameError                                 Traceback (most recent call last)
Cell In[2], line 1
----> 1 total = sum(orders) * (1 - discount)

NameError: name 'discount' is not defined

[NbConvertApp] Converting notebook orders_report_fixed.ipynb to notebook
[NbConvertApp] Writing 2768 bytes to checked.ipynb`,
        note: 'В checked.ipynb все пять ячеек получили номера In [1]–In [5] подряд, последняя напечатала «Выручка: 6066 ₽, средний чек: 1213 ₽».' },
      script: { title: 'Тот же расчёт как скрипт report.py', badge: 'проверено: Python 3.13', lang: 'python',
        code: `# report.py — тот же расчёт, что в ноутбуке, но в файле:
# порядок строк и есть порядок выполнения, скрытого состояния нет
orders = [1200, 850, 2300, 640, 1750]  # суммы заказов, ₽
discount = 0.1

total = sum(orders) * (1 - discount)
avg = total / len(orders)

print(f"Выручка: {total:.0f} ₽, средний чек: {avg:.0f} ₽")`,
        outLabel: 'Терминал', out: '$ python report.py\nВыручка: 6066 ₽, средний чек: 1213 ₽' }
    },
    questions: {
    q1: { sec: 'order', title: 'Сначала предскажите', q: 'После ячеек 1 и 2 ячейку 3 с orders.append(990) запустили два раза подряд, потом ячейки 4 и 5. Что напечатает отчёт?', opts: [['Заказов: 6, выручка: 6957 ₽'], ['Заказов: 7, выручка: 7848 ₽', 1], ['Заказов: 5, выручка: 6066 ₽'], ['NameError: список нельзя менять дважды']],
      why: 'Каждый запуск ячейки — новая команда ядру. append добавляет 990 к тому списку, что уже лежит в памяти, поэтому после двух запусков в нём 7 заказов на 8 720 ₽, а со скидкой 10% — 7 848 ₽. Проверьте в интерактиве ниже.' },
    q2: { sec: 'idea', q: 'В анимации ячейки запускали в порядке 1, 3, 2, 4, 5. Какой номер In стоял у ячейки 2?', opts: [['In [2]'], ['In [3]', 1], ['In [1]'], ['Номер не ставится, раз ячейку запустили не по порядку']],
      why: 'Счётчик считает команды, которые получило ядро: ячейка 1 — первая, ячейка 3 — вторая, ячейка 2 — третья. Поэтому у неё In [3], хотя она стоит второй.' },
    q3: { sec: 'nuances', q: 'Вы удалили ячейку discount = 0.1, а ноутбук по-прежнему считает выручку со скидкой. Почему?', opts: [['Jupyter хранит удалённые ячейки в файле до сохранения'], ['Переменная осталась в памяти ядра: удаление ячейки ядро не трогает', 1], ['Python подставляет ноль вместо неизвестной переменной'], ['Скидка записалась в выводе ячейки 4 и берётся оттуда']],
      why: 'Удаление меняет только файл. discount создан раньше и лежит в памяти ядра, пока ядро живо. После перезапуска он исчезнет, и ячейка с расчётом упадёт с NameError.' },
    q4: { sec: 'idea', q: 'Что останется после перезапуска ядра?', opts: [['Код и все переменные'], ['Код в файле и старые выводы, если их не очистили; переменных в памяти не будет', 1], ['Ничего: ноутбук очищается целиком'], ['Переменные, но без импортированных библиотек']],
      why: 'Перезапуск останавливает процесс ядра и запускает новый с пустой памятью. Файл .ipynb не меняется: в нём остаются код и выводы прошлого запуска, но за этими выводами больше нет переменных.' },
    q5: { sec: 'idea', q: 'Вы загрузили orders.csv в файловую панель Colab и ушли на обед. Где искать файл через час?', opts: [['В той же панели: файлы Colab хранятся всегда'], ['В Google Drive, рядом с ноутбуком'], ['Скорее всего, нигде: машина могла удалиться после простоя, файл надо загрузить заново или держать на Drive', 1], ['В корзине Google Drive']],
      why: 'Файловая панель показывает диск виртуальной машины, а не Drive. По данным Colab, машины удаляются после простоя и живут ограниченное время, и вместе с машиной пропадают загруженные на неё файлы.' },
    q6: { sec: 'code', q: 'Почему эта команда падает на ноутбуке из анимации, хотя у автора всё работало?', code: 'jupyter nbconvert --to notebook --execute orders_report.ipynb', lang: 'bash', opts: [['nbconvert не умеет выполнять ноутбуки, только конвертирует'], ['Она запускает ячейки с новым ядром сверху вниз, а discount создаётся ниже места, где используется', 1], ['Файл .ipynb нельзя запускать из терминала'], ['Ядро автора ещё занято и не отдаёт переменные']],
      why: 'Флаг --execute запускает свежее ядро и выполняет ячейки по порядку. У автора discount был в памяти заранее, а у нового ядра — нет, поэтому вторая ячейка падает с NameError, как у коллеги.' },
    q7: { sec: 'limits', q: 'Отчёт по выручке должен каждое утро собираться сам. В каком виде держать код?', opts: [['В ноутбуке: в нём видны графики'], ['В скрипте .py, который запускается одной командой', 1], ['Неважно, лишь бы лежал в Git'], ['В ноутбуке с %%timeit в каждой ячейке']],
      why: 'Скрипт выполняется целиком сверху вниз и не зависит от состояния чьего-то ядра. Его запускает планировщик, его можно импортировать и проверять тестами. Ноутбук остаётся для исследования.' }
    },
    glossary: {
      notebook: { t: 'Ноутбук', en: 'notebook, Jupyter Notebook', d: 'Интерактивный документ из ячеек: в одних код, в других текст с пояснениями. Код запускают по кусочку и сразу видят результат под ячейкой. Хранится в файле .ipynb, открывается в Jupyter, Colab и VS Code.' },
      kernel: { t: 'Ядро', en: 'kernel', d: 'Процесс Python, который выполняет код ячеек и хранит в памяти все переменные ноутбука. Перезапуск ядра стирает эту память.' },
      cell: { t: 'Ячейка', en: 'cell', d: 'Кусок ноутбука с кодом или текстом. Кодовую ячейку запускают отдельно от остальных, её вывод появляется прямо под ней.' },
      state: { t: 'Состояние ядра', en: 'kernel state', d: 'Всё, что накопилось в памяти ядра к текущему моменту: переменные, импорты, загруженные данные. В файле ноутбука его нет.' },
      execcount: { t: 'Счётчик выполнения', en: 'execution count', d: 'Номер в скобках In [n] слева от ячейки: порядковый номер команды, которую получило ядро. Показывает порядок запуска, а не порядок ячеек.' },
      nameerror: { t: 'NameError', en: 'NameError', d: 'Ошибка Python «имя не определено»: код обращается к переменной, которой нет в памяти. В ноутбуке чаще всего значит, что ячейку с этой переменной не запускали.' },
      restart: { t: 'Перезапуск ядра', en: 'restart kernel', d: 'Остановка процесса ядра и запуск нового с пустой памятью. Код в файле остаётся, все переменные пропадают.' },
      reproducible: { t: 'Воспроизводимость', en: 'reproducibility', d: 'Свойство расчёта давать тот же результат у другого человека и на другой машине. Для ноутбука проверяется перезапуском ядра и запуском всех ячеек сверху вниз.' },
      runtime: { t: 'Виртуальная машина Colab', en: 'Colab runtime, VM', d: 'Машина Google, на которой работает ядро ноутбука Colab. Удаляется после простоя или по истечении лимита времени вместе со всеми файлами на ней.' },
      ipynb: { t: '.ipynb', en: 'Jupyter notebook file', d: 'Формат файла ноутбука: JSON с ячейками, их выводами и номерами In. Открывается в Jupyter, Colab и VS Code.' },
      script: { t: 'Скрипт', en: 'script', d: 'Файл .py с кодом, который Python выполняет целиком от первой строки до последней. Запускается командой python имя_файла.py.' },
      magic: { t: 'Магическая команда', en: 'magic command', d: 'Команда оболочки IPython, начинается с % или %%: замер времени, установка пакетов, справка. Работает в Jupyter и Colab, но не в обычном скрипте.' },
      idempotent: { t: 'Идемпотентность', en: 'idempotence', d: 'Свойство операции давать тот же результат при повторном выполнении. Присваивание идемпотентно, а добавление элемента в список — нет.' }
    },
    materials: [
      ['da-1-1-jupyter-kernel.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['orders_report.ipynb', 'Ноутбук из анимации: ячейка со скидкой стоит ниже расчёта'],
      ['orders_report_fixed.ipynb', 'Тот же ноутбук после исправления'],
      ['report.py', 'Расчёт в виде скрипта для запуска из терминала']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне пять вопросов по источнику о ядре Jupyter и порядке выполнения ячеек. По одному за раз; после моего ответа объясни, где я ошибся, со ссылкой на текст источника.'],
      ['Разбор чужого ноутбука', 'Я вставлю код ячеек ноутбука вместе с номерами In. Найди ячейки, которые зависят от переменных, созданных ниже, и предложи порядок ячеек, при котором ноутбук пройдёт «перезапустить и выполнить всё». Опирайся на правила из источника.'],
      ['Colab без потерь', 'Составь по источнику чек-лист из пяти пунктов: что сделать в Colab, чтобы после удаления виртуальной машины ноутбук снова запускался за минуту.']
    ]
  };
})();
