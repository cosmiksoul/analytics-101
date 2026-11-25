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
  const CALLS = { 1: ['a', 'In [1] — первый запуск'], 2: ['c', 'запущена второй'], 3: ['b', 'In [3], хотя ячейка вторая'], 7: ['b', 'скидка ещё не задана'], 8: ['c', 'теперь выше расчёта'], 9: ['e', 'все пять ячеек выполнены'] };
  const blank = () => ({ order: ['a', 'b', 'c', 'd', 'e'], cnt: {}, out: {}, err: {}, env: {}, n: 0, errors: 0, hist: [], moved: null, stopped: false });
  function apply(s, a) {
    if (a[0] === 'run') {
      const id = a[1]; s.n++; s.cnt[id] = s.n; s.hist.push(s.order.indexOf(id) + 1);
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
    parts: [{ n: '01', name: 'Ноутбук', s: [0, 1] }, { n: '02', name: 'Первый запуск', s: [2, 3, 4] }, { n: '03', name: 'Перезапуск', s: [5] }, { n: '04', name: 'Новое ядро', s: [6, 7] }, { n: '05', name: 'Исправление', s: [8, 9] }],
    steps: [
      { title: 'Пять ячеек с кодом', dur: 2600, body: '<p>В&nbsp;файле <b>orders_report.ipynb</b> записан расчёт выручки по&nbsp;пяти заказам. В&nbsp;панели «Файл» виден код ячеек. В&nbsp;панели «Ядро» будут появляться переменные, которые создаёт Python.</p><p>Пока ни одна ячейка не выполнена. У&nbsp;всех ячеек пустые скобки In&nbsp;[&nbsp;], и&nbsp;список переменных пуст.</p>' },
      { title: 'Список заказов', dur: 2400, body: '<p>Автор запускает ячейку 1. Python создаёт список сумм заказов и&nbsp;присваивает его переменной <b>orders</b>.</p><p>Рядом с&nbsp;ячейкой появляется In&nbsp;[1]. Это первый запуск в&nbsp;текущем сеансе.</p>' },
      { title: 'Скидка из третьей ячейки', dur: 2400, body: '<p>Автор пропускает ячейку 2 и&nbsp;сразу запускает ячейку 3. В&nbsp;памяти появляется переменная <b>discount</b> со значением 0.1. Ячейка получает номер In&nbsp;[2].</p>' },
      { title: 'Выручка с учётом скидки', dur: 2600, body: '<p>Теперь автор возвращается к&nbsp;ячейке 2. Для расчёта выручки нужны список <b>orders</b> и&nbsp;скидка <b>discount</b>. Обе переменные уже заданы.</p><p>Теперь рядом со второй ячейкой стоит In&nbsp;[3]. Это её место в&nbsp;последовательности запусков.</p>' },
      { title: 'Результат первого запуска', dur: 3200, body: '<p>Ячейка 4 рассчитывает средний чек. Ячейка 5 печатает выручку и&nbsp;средний чек. Отчёт готов.</p><p>Посмотрите на&nbsp;номера In: автор выполнил ячейки в&nbsp;порядке 1, 3, 2, 4, 5. При запуске сверху вниз Python обратился бы к&nbsp;переменной discount раньше, чем она задана.</p>' },
      { title: 'Что исчезает после перезапуска', dur: 2600, body: '<p>Перезапускаем ядро. Новый процесс Python пока не знает ни сумм заказов, ни скидки.</p><p>Для этого примера мы также очистили вывод и&nbsp;номера запусков. Это отдельное действие. При обычном перезапуске прежний отчёт может оставаться на&nbsp;экране.</p>' },
      { title: 'Коллега запускает все ячейки', dur: 2400, body: '<p>Коллега открывает тот же ноутбук с&nbsp;новым ядром и&nbsp;нажимает «Запустить всё». Первой выполняется ячейка со списком <b>orders</b>.</p>' },
      { title: 'Почему возникла ошибка NameError', dur: 2800, body: '<p>Во второй ячейке для расчёта выручки нужно значение <b>discount</b>. При запуске сверху вниз ячейка со скидкой ещё впереди.</p><p>Python сообщает <b>NameError</b>. В&nbsp;этом запуске выполнение остановилось на&nbsp;второй ячейке.</p>' },
      { title: 'Скидка перед расчётом', dur: 2200, body: '<p>Переносим ячейку с <b>discount = 0.1</b> выше той, в&nbsp;которой вычисляется выручка. Теперь оба значения, необходимые для расчёта, заданы до их использования.</p>' },
      { title: 'Проверка в новом сеансе', dur: 4200, next: 'Читать страницу', body: '<p>Ещё раз перезапускаем ядро и&nbsp;выполняем ячейки сверху вниз. Номера In идут от&nbsp;1 до 5.</p><p>Сверяем итог с&nbsp;первым запуском: выручка составляет 6&nbsp;066&nbsp;₽, средний чек с&nbsp;округлением до рубля — 1&nbsp;213&nbsp;₽. Для получения этих чисел достаточно ячеек, сохранённых в&nbsp;файле.</p>' }
    ],
    hud: [{ id: 'cnt', label: 'Счётчик In' }, { id: 'vars', label: 'Переменных' }, { id: 'err', label: 'Ошибок' }],
    legend: '<span><i class="sq" style="background:#24304a"></i>ячейка</span><span><i style="background:#36b8a6"></i>переменная в ядре</span><span><i style="background:#f2756a"></i>ошибка</span>',
    info: 'НОУТБУК',
    aiNote: 'В анимации автор запускает ячейки в порядке 1, 3, 2, 4, 5. Первая задаёт список заказов, третья — скидку. Вторая считает выручку. Если запустить ячейки подряд с новым ядром, во второй возникает NameError, потому что переменная discount ещё не задана. После переноса ячейки со скидкой выше расчёта выручка составляет 6 066 ₽, а средний чек с округлением до рубля — 1 213 ₽.',
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
          const hist = s.hist.map((pos, i) => `<span><i>[${i + 1}]</i>яч.&nbsp;${pos}</span>`).join('');
          root.innerHTML = `<div class="nbsc"><div class="nb-file"><div class="nb-hd"><span>orders_report.ipynb</span><span class="nb-tag">файл</span></div><div class="nb-cells">${cells}</div><div class="nb-hist"><span class="lb">Запуски:</span>${hist || '<span class="none">ещё не было</span>'}</div></div>
<div class="nb-kern${s.active && s.active[0] === 'restart' ? ' wipe' : ''}"><div class="nb-hd"><span>Переменные ядра</span><span class="nb-tag">процесс Python</span></div><div class="nb-vars">${v}</div></div></div>`;
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
<p class="hint ow-do">Запускайте ячейки кнопкой ▶ в любом порядке. После каждого запуска смотрите, какие имена и значения показаны в панели «Память ядра».</p>
<div class="stage"><div class="ow-nb" id="ow-nb"></div>
<div class="narr"><p class="cap">Память ядра</p><div class="ow-mem" id="ow-mem"></div><p class="cap">Задания</p><ol class="steps ow-tasks" id="ow-tasks"></ol><div class="narr-text" id="ow-msg"></div></div></div>
<div class="status"><span><span class="dot live" id="ow-dot"></span><span id="ow-k"></span></span><span id="ow-n"></span><span id="ow-e"></span><span class="grow"></span><span id="ow-h"></span></div>`;
    const TASKS = ['Найдите порядок запуска, при котором возникает NameError.', 'Получите отчёт, в котором будет семь заказов.', 'Запустите ячейку со скидкой, удалите её и проверьте, удастся ли посчитать выручку. Затем перезапустите ядро и нажмите «Запустить всё».'];
    let s;
    const fresh = () => ({ env: {}, n: 0, cnt: {}, out: {}, err: {}, stale: {}, hist: [], errors: 0, deleted: false, delAfterRun: false, restartAfterDel: false, done: [false, false, false], msg: 'Начните с любой ячейки. Например, попробуйте сразу запустить ячейку 4.' });
    const order = () => W.map((c, i) => i).filter(i => !(s.deleted && W[i].del));
    function runCell(i) {
      s.n++; s.cnt[i] = s.n; s.hist.push(i); delete s.stale[i];
      const before = s.env.orders ? s.env.orders.length : null;
      try {
        const o = W[i].run(s.env); s.out[i] = o || ''; delete s.err[i];
        if (i === 2) s.msg = before && before >= 6 ? `После повторного запуска в списке ${s.env.orders.length} ${plural(s.env.orders.length, ['заказ', 'заказа', 'заказов'])}. Сумма 990 ₽ добавилась ещё раз.` : `В список добавлен заказ на 990 ₽. Теперь в нём ${s.env.orders.length} ${plural(s.env.orders.length, ['заказ', 'заказа', 'заказов'])}.`;
        else if (i === 4) {
          const st = s.env._basis !== s.env.orders.length;
          s.msg = st ? `Сумма total рассчитана для прежнего списка (${s.env._basis} ${plural(s.env._basis, ['заказ', 'заказа', 'заказов'])}). Сейчас в списке ${s.env.orders.length} ${plural(s.env.orders.length, ['заказ', 'заказа', 'заказов'])}. Запустите ячейку 4, чтобы пересчитать выручку, а затем ячейку 5, чтобы обновить отчёт.` : 'Отчёт напечатан. Попробуйте получить другой результат, не меняя код.';
          if (/^Заказов: 7,/.test(o)) s.done[1] = true;
          if (s.deleted && s.delAfterRun) s.msg += ' Ячейка со скидкой удалена. Переменная discount по-прежнему доступна в этом сеансе.';
        } else s.msg = `Ячейка ${i + 1} выполнена. Номер запуска — In [${s.n}].`;
        return true;
      } catch (e) {
        s.out[i] = e.message; s.err[i] = true; s.errors++; s.done[0] = true;
        const who = { orders: 'ячейка 1', discount: 'ячейка 2', total: 'ячейка 4' }[e.pyName];
        s.msg = `В ячейке ${i + 1} возникла ошибка NameError. Имя ${e.pyName} не определено. ${e.pyName === 'discount' && s.deleted ? 'Скидка задавалась в удалённой ячейке 2.' : 'Это имя задаёт ' + who + '.'}`;
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
      $('ow-h').textContent = s.hist.length ? `Запуски: ${s.hist.length > 9 ? '… ' : ''}${s.hist.slice(-9).map(i => i + 1).join(' → ')}` : 'Запусков ещё не было';
    }
    box.addEventListener('click', e => {
      const r = e.target.closest('[data-run]'), d = e.target.closest('[data-del]');
      if (r) { runCell(+r.dataset.run); draw(); }
      else if (d) { s.deleted = true; s.delAfterRun = 'discount' in s.env; s.msg = s.delAfterRun ? 'Ячейка 2 удалена. Ядро по-прежнему хранит discount = 0.1. Если список заказов уже задан, можно выполнить ячейки 4 и 5.' : 'Ячейка 2 удалена до запуска. Скидка не задана, и при расчёте выручки в ячейке 4 возникнет NameError.'; draw(); }
    });
    $('ow-all').addEventListener('click', () => { for (const i of order()) { if (!runCell(i)) break; } draw(); });
    $('ow-restart').addEventListener('click', () => {
      Object.keys(s.out).forEach(i => { s.stale[i] = true; });
      Object.assign(s, { env: {}, n: 0, hist: [] }); s.cnt = Object.assign({}, s.cnt);
      if (s.deleted) s.restartAfterDel = true;
      s.msg = 'Ядро перезапущено. Для следующей ячейки счётчик начнётся с 1. Прежний вывод может оставаться на экране. Чтобы восстановить переменные, снова выполните ячейки, которые их задают.';
      draw();
    });
    $('ow-reset').addEventListener('click', () => { s = fresh(); draw(); });
    s = fresh(); draw();
    return {
      describe() {
        const vars = Object.keys(s.env).filter(n => n[0] !== '_');
        return `Ячейки в текущем сеансе запускались в таком порядке: ${s.hist.map(i => i + 1).join(' → ') || 'запусков ещё не было'}. Переменные ядра: ${vars.map(n => `${n} = ${pyRepr(s.env[n])}`).join(', ') || 'пока нет'}. Число ошибок за всё упражнение — ${s.errors}. ${s.deleted ? 'Ячейка со скидкой удалена. ' : ''}Выполнено заданий: ${s.done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-1-1',
    short: 'DA-01',
    title: 'Среда: Jupyter, Colab и состояние ядра',
    where: 'блок «Дата аналитика», тема 01 «Python для анализа», страница 1.1',
    aiData: 'В ноутбуке из анимации выручку по пяти заказам считают со скидкой 10%. В интерактивном примере отдельная ячейка добавляет заказ на 990 ₽.',
    scene,
    widgets: { order: buildOrder },
    code: {
      first: { title: 'Версии Python и библиотек', badge: 'проверено: Python 3.13', lang: 'python',
        code: `# Сохраним в выводе версии Python, NumPy и pandas
import platform

import numpy as np
import pandas as pd

print("Python", platform.python_version())
print("numpy", np.__version__, "| pandas", pd.__version__)`,
        out: 'Python 3.13.18\nnumpy 2.5.3 | pandas 3.0.5',
        note: 'В примере указаны версии среды, в которой проверяли код. Запустите ячейку у себя и сравните её вывод с этими значениями. Если у коллеги отчёт ведёт себя иначе, сведения о версиях помогут найти причину.' },
      check: { title: 'Запуск ноутбука с новым ядром из терминала', badge: 'проверено: nbconvert 7.17', lang: 'bash',
        code: `# Исходный ноутбук использует discount до присваивания
jupyter nbconvert --to notebook --execute orders_report.ipynb

# В исправленном ноутбуке скидка задана до расчёта
jupyter nbconvert --to notebook --execute orders_report_fixed.ipynb --output checked.ipynb`,
        outLabel: 'Вывод двух команд nbconvert. Сообщение об ошибке показано в сокращении',
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
        note: 'В файле checked.ipynb ячейки получили номера от In [1] до In [5]. В выводе последней ячейки видно «Выручка: 6066 ₽, средний чек: 1213 ₽».' },
      script: { title: 'Расчёт выручки в скрипте report.py', badge: 'проверено: Python 3.13', lang: 'python',
        code: `# report.py
# Задаём исходные данные перед расчётом выручки
orders = [1200, 850, 2300, 640, 1750]  # суммы заказов, ₽
discount = 0.1

total = sum(orders) * (1 - discount)
avg = total / len(orders)

print(f"Выручка: {total:.0f} ₽, средний чек: {avg:.0f} ₽")`,
        outLabel: 'Терминал', out: '$ python report.py\nВыручка: 6066 ₽, средний чек: 1213 ₽' }
    },
    questions: {
    q1: { sec: 'order', title: 'Сначала предскажите', q: 'Сначала выполнили ячейки 1 и 2. Затем дважды запустили ячейку 3 с командой orders.append(990) и по одному разу ячейки 4 и 5. Что напечатает отчёт?', opts: [['Заказов: 6, выручка: 6957 ₽'], ['Заказов: 7, выручка: 7848 ₽', 1], ['Заказов: 5, выручка: 6066 ₽'], ['Возникнет NameError, потому что ячейка 3 запущена дважды']],
      why: 'В исходном списке пять заказов на 6 740 ₽. Два запуска append добавили к списку два заказа по 990 ₽. Получилось семь заказов на 8 720 ₽ до скидки. После скидки 10% выручка составила 7 848 ₽.' },
    q2: { sec: 'idea', q: 'В анимации автор запускал ячейки в порядке 1, 3, 2, 4, 5. Какой номер появился слева от второй ячейки?', opts: [['In [2]'], ['In [3]', 1], ['In [1]'], ['При запуске ячеек в таком порядке скобки остаются пустыми']],
      why: 'Первый номер получила ячейка со списком заказов, второй — ячейка со скидкой. Ячейка с расчётом выручки стоит в файле второй, но автор запустил её третьей. Поэтому у неё номер In [3].' },
    q3: { sec: 'nuances', q: 'Вы выполнили ячейку discount = 0.1, а затем удалили её. Почему при повторном запуске ячейки с расчётом выручки скидка всё ещё применяется?', opts: [['При каждом расчёте Jupyter заново выполняет удалённые ячейки'], ['Переменная discount осталась в памяти текущего ядра', 1], ['Если скидка не задана, Python автоматически применяет 10%'], ['Значение скидки восстанавливается из напечатанного отчёта']],
      why: 'Удаление ячейки меняет содержимое ноутбука. Уже выполненное присваивание сохраняет силу в текущем сеансе. После перезапуска ядра придётся снова задать discount, иначе ячейка с расчётом выдаст NameError.' },
    q4: { sec: 'idea', q: 'Вы сохранили ноутбук вместе с выводом, затем перезапустили ядро. Команду очистки вывода не использовали. Что вы увидите?', opts: [['Код и прежние переменные в памяти нового ядра'], ['Код и сохранённый вывод. Чтобы восстановить переменные, нужно выполнить ячейки заново', 1], ['Пустой документ без кода'], ['Прежние переменные, кроме импортированных модулей']],
      why: 'Код и вывод записаны в .ipynb. Перезапуск создаёт новый процесс Python. Если под ячейкой по-прежнему видно число, это может быть результат прошлого запуска. Для нового расчёта переменные нужно создать заново.' },
    q5: { sec: 'idea', q: 'Вы загрузили orders.csv только на временный диск Colab и сохранили ноутбук на Google Диске. Позже Colab удалил прежнюю виртуальную машину. Как снова прочитать CSV на новой машине?', opts: [['Запустить ячейку ещё раз. Colab автоматически переносит файлы со старой машины'], ['Найти orders.csv рядом с ноутбуком. Команда сохранения ноутбука копирует туда и данные'], ['Загрузить CSV из исходного файла или прочитать отдельно сохранённую копию с Google Диска', 1], ['Открыть корзину Google Диска. Colab перемещает туда все временные файлы']],
      why: 'На Google Диске сохранён ноутбук с его ячейками. Сам CSV находился на временном диске прежней машины. Если сохранить отдельную копию CSV на Google Диске или предусмотреть скачивание из источника, эти данные можно снова открыть в новом сеансе.' },
    q6: { sec: 'code', q: 'У автора ноутбук вывел выручку. Почему при проверке из терминала эта команда останавливается на второй ячейке?', code: 'jupyter nbconvert --to notebook --execute orders_report.ipynb', lang: 'bash', opts: [['Программа nbconvert умеет только менять формат документа'], ['Команда выполняет ячейки с новым ядром сверху вниз. Код во второй ячейке использует discount до присваивания', 1], ['Файлы .ipynb можно выполнять только в браузере'], ['Команда ожидает, пока автор освободит память своего ядра']],
      why: 'С флагом --execute программа nbconvert запускает новое ядро. В первой ячейке задан только список заказов. К моменту расчёта выручки переменная discount отсутствует, и Python сообщает NameError. У автора скидка была задана отдельным запуском третьей ячейки.' },
    q7: { sec: 'limits', q: 'Для ежедневного отчёта нужен только итог расчёта. Как подготовить программу, чтобы планировщик мог запускать её обычным интерпретатором Python?', opts: [['Оставить ячейки в .ipynb и изменить расширение файла на .py'], ['Сохранить расчёт в скрипте .py и задать или загрузить все исходные данные до их использования', 1], ['Сохранить только код печати отчёта. Планировщик возьмёт переменные из открытого ноутбука'], ['Добавить %%timeit в каждую ячейку, чтобы она запускалась по расписанию']],
      why: 'При вызове python report.py запускается отдельный процесс. Ему нужны источник заказов, значение скидки и код расчёта. Если требуется выполнять именно ноутбук и сохранять вывод под ячейками, планировщику можно поручить другую команду — nbconvert с флагом --execute.' }
    },
    glossary: {
      notebook: { t: 'Ноутбук', en: 'notebook, Jupyter Notebook', d: 'Интерактивный документ, в котором можно чередовать пояснения и ячейки с кодом. Ячейки запускают по отдельности, а вывод виден под кодом. Такие документы в формате .ipynb открываются, например, в JupyterLab, Colab и VS Code.' },
      kernel: { t: 'Ядро', en: 'kernel', d: 'Процесс, который выполняет код ячеек. В примерах урока ядро выполняет Python и хранит созданные переменные между запусками ячеек.' },
      cell: { t: 'Ячейка', en: 'cell', d: 'Часть ноутбука с кодом или пояснениями. Ячейку с кодом можно запустить отдельно. Её вывод отображается под ней.' },
      state: { t: 'Состояние ядра', en: 'kernel state', d: 'Переменные и другие объекты, доступные в текущем сеансе, например импортированный модуль или список заказов. Для восстановления состояния после перезапуска нужно снова выполнить соответствующий код.' },
      execcount: { t: 'Счётчик выполнения', en: 'execution count', d: 'Номер запуска кода в текущем сеансе ядра. Ячейка показывает номер своего последнего выполнения, например In [3].' },
      nameerror: { t: 'NameError', en: 'NameError', d: 'Ошибка Python, которая возникает при обращении к неопределённому имени. Например, в расчёте использовали discount, прежде чем задали значение скидки.' },
      restart: { t: 'Перезапуск ядра', en: 'restart kernel', d: 'Завершение работающего ядра и запуск нового. Созданные в прежнем сеансе переменные теряются. Сохранённый файл ноутбука при этом остаётся на месте.' },
      reproducible: { t: 'Воспроизводимость', en: 'reproducibility', d: 'Возможность повторить расчёт с тем же кодом и исходными данными в подходящей среде и получить тот же результат. Один из способов проверки ноутбука — выполнить все ячейки по порядку в новом ядре.' },
      runtime: { t: 'Виртуальная машина Colab', en: 'Colab runtime, VM', d: 'Временная машина, которую Colab предоставляет для выполнения кода. После её удаления файлы на её локальном диске теряются.' },
      ipynb: { t: '.ipynb', en: 'Jupyter notebook file', d: 'Расширение файла ноутбука Jupyter. Внутри находится документ в формате JSON с ячейками, их кодом или текстом, а также сохранённым выводом и номерами запусков.' },
      script: { t: 'Скрипт', en: 'script', d: 'Файл с программой. Скрипт на Python обычно сохраняют с расширением .py и запускают из терминала, например командой python report.py.' },
      magic: { t: 'Магическая команда', en: 'magic command', d: 'Команда, которую предоставляет IPython. Запись с одним знаком процента, например %time, действует на строку, а с двумя, например %%timeit, на ячейку.' },
      idempotent: { t: 'Идемпотентность', en: 'idempotence', d: 'Свойство операции оставлять данные в том же состоянии, если после первого выполнения повторить её ещё раз. Например, discount = 0.1 повторно задаёт ту же скидку, а orders.append(990) каждый раз добавляет элемент.' }
    },
    materials: [
      ['da-1-1-jupyter-kernel.md', 'Текст урока в Markdown с примерами кода, вопросами и глоссарием'],
      ['orders_report.ipynb', 'Исходный ноутбук из анимации. При запуске сверху вниз Python обращается к переменной discount до присваивания'],
      ['orders_report_fixed.ipynb', 'Исправленный ноутбук. Скидка задана до расчёта выручки'],
      ['report.py', 'Скрипт для расчёта выручки и среднего чека из терминала']
    ],
    prompts: [
      ['Проверка понимания', 'Задай мне пять вопросов о ядре Jupyter и порядке выполнения ячеек. Задавай по одному вопросу. После каждого ответа дай короткий разбор со ссылкой на соответствующий фрагмент урока.'],
      ['Разбор чужого ноутбука', 'Я пришлю код ячеек и их номера In. Покажи, какие переменные нужны каждой ячейке и где они задаются. Предложи порядок, в котором можно повторить расчёт после перезапуска ядра. Объясни выводы на примерах из урока.'],
      ['Как восстановить расчёт в Colab', 'Помоги подготовить ноутбук к запуску на новой виртуальной машине Colab. Сначала спроси, где лежат исходные данные и какие пакеты нужны для расчёта. Затем предложи, какие файлы сохранить и какие ячейки выполнить в начале.']
    ]
  };
})();
