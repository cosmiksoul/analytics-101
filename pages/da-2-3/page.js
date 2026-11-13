/* Страница 2.3 · Очистка: пропуски, дубликаты, выбросы */
(() => {
  const nb = s => String(s).replace(/ /g, ' ');
  const sp = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');   // 182199 → 182 199

  /* ===================== Сцена =====================
     Фрагмент учебной выгрузки orders_raw.csv: заказы 1041–1051, заказ 1047 загружен дважды.
     Все числа табло посчитаны pandas 3.0.5 на этом фрагменте:
       сырая: 12 строк, mean 182 199,00, median 3 240; без дубликата: 11, 202 075,56, 3 170;
       IQR: Q1 2 630, Q3 4 660, граница 7 705 → 1041 и 1046; 1046 → NaN: 11 строк, по 8 суммам mean 3 585, median 3 115;
       dropna: 8, 3 585, 3 115, сумма 28 680; fillna(медиана 3 115): 11, 3 456,82, 3 115, сумма 38 025; флаг: 11, 3 585, 3 115. */
  const ROWS = [
    [1041, '2026-01-14', 'Луч', 4, 9510], [1042, '2026-01-15', 'Сова', 2, null], [1043, '2026-01-15', 'Бриз', 1, 2630],
    [1044, null, 'Луч', 3, 4660], [1045, '2026-01-15', null, 3, 3170], [1046, '2026-01-15', 'Луч', 1, 1790000],
    [1047, '2026-01-15', 'Бриз', 2, 3310], [1047, '2026-01-15', 'Бриз', 2, 3310], [1048, '2026-01-16', 'Сова', 1, null],
    [1049, '2026-01-16', 'Сова', 1, 3060], [1050, '2026-01-17', 'Луч', 1, 730], [1051, '2026-01-17', 'Сова', 1, 1610]
  ];
  const ST = { raw: [12, 182199, 3240, '10 из 12'], dedup: [11, 202076, 3170, '9 из 11'], fixed: [11, 3585, 3115, '8 из 11'], drop: [8, 3585, 3115, ''], fill: [11, 3457, 3115, ''], flag: [11, 3585, 3115, '8 из 11'] };
  const CARDS = [
    { id: 'drop', t: 'Удалить строки', r: 8, m: 3585, md: 3115, s: 28680, note: 'три заказа пропали из отчёта' },
    { id: 'fill', t: 'Заполнить медианой', r: 11, m: 3457, md: 3115, s: 38025, note: '+9 345 ₽, которых в данных нет' },
    { id: 'flag', t: 'Пометить флагом', r: 11, m: 3585, md: 3115, s: 28680, note: '3 суммы честно неизвестны' }
  ];
  const LOG = [
    { id: 'dup', a: '1047', b: 'полный дубликат удалён', n: '−1 строка' },
    { id: 'keep', a: '1041', b: 'выброс по IQR: 4 товара, оставлен', n: 'флаг' },
    { id: 'typo', a: '1046', b: '1 790 000 → NaN: ошибка ввода', n: '1 строка' },
    { id: 'miss', a: 'amount', b: 'пропуски помечены amount_missing', n: '3 строки' }
  ];
  const IDX = { 1041: 0, 1042: 1, 1044: 3, 1045: 4, 1046: 5, 1047: 6, 1048: 8 };
  const NAROWS = [1, 5, 8];     // строки, где в конце сумма неизвестна: 1042, 1046, 1048

  function stateAt(k, p) {
    const S = { rows: ROWS.map((r, i) => ({ i, cls: '', cell: {} })), shown: 12, hud: ST.raw, code: '', out: '', notes: [], call: null, cards: 0, cardOn: null, log: 0, logOn: false, flagCol: false, mob: ['tab', 'code'], typo: false };
    const row = i => S.rows.find(r => r.i === i);           // строка по номеру в ROWS, а не по позиции
    const mark = (i, col, cls) => { const r = row(i); if (r) r.cell[col] = cls; };
    const naMarks = () => { mark(1, 'amt', 'na'); mark(8, 'amt', 'na'); mark(3, 'date', 'na'); mark(4, 'brand', 'na'); };
    const dropDup = () => { S.rows = S.rows.filter(r => r.i !== 7); };
    switch (k) {
      case 0:
        S.shown = Math.min(12, Math.ceil(p * 1.7 * 12)); S.hud = p > .62 ? ST.raw : [S.shown, null, null, ''];
        S.code = 'df = pd.read_csv("orders_raw.csv")'; S.out = p > .62 ? 'df.shape → (12, 5)' : '';
        S.call = p > .65 ? ['tab', 'среднее в 56 раз больше медианы'] : null; break;
      case 1:
        naMarks(); S.code = 'df.isna().sum()'; S.out = p > .3 ? 'date 1 · brand 1 · amount 2' : '';
        if (p > .45) S.notes = [[3, 'NaT — пустая дата'], [1, 'NaN — пустая сумма']]; break;
      case 2:
        naMarks(); S.rows.forEach(r => { if (r.i !== 1 && r.i !== 8) mark(r.i, 'amt', 'on'); });
        S.code = 'df["amount"].mean()'; S.out = p > .35 ? '182199.0   # по 10 суммам из 12' : '';
        if (p > .5) S.notes = [[8, 'в среднее не вошла']]; break;
      case 3:
        row(6).cls = 'dup'; row(7).cls = 'dup'; S.code = 'df.duplicated()'; S.out = p > .35 ? 'True только у второй копии 1047' : '';
        if (p > .45) S.notes = [[7, 'та же строка целиком']]; break;
      case 4:
        S.code = 'df = df.drop_duplicates()';
        if (p < .55) { row(7).cls = 'dup out'; row(6).cls = 'dup'; }
        else { dropDup(); S.hud = ST.dedup; S.log = 1; S.out = 'строк: 12 → 11'; S.notes = [[6, 'осталась одна копия']]; S.mob = ['tab', 'log']; }
        break;
      case 5:
        dropDup(); S.hud = ST.dedup; S.log = 1; mark(5, 'amt', 'big'); S.code = 'df["amount"].max()'; S.out = p > .3 ? '1790000.0' : '';
        if (p > .45) S.notes = [[5, '1 товар за 1 790 000 ₽']]; break;
      case 6:
        dropDup(); S.hud = ST.dedup; S.log = 1; mark(5, 'amt', 'big');
        S.code = 'q1, q3 = df["amount"].quantile([.25, .75])'; S.out = p > .25 ? 'Q1 = 2630, Q3 = 4660, граница: Q3 + 1,5·IQR = 7705' : '';
        if (p > .5) { mark(0, 'amt', 'big'); S.notes = [[0, '9 510 > 7 705'], [5, '1 790 000 > 7 705']]; }
        break;
      case 7:
        dropDup(); S.log = 1; S.code = 'df["amount"] / df["items"]   # цена одного товара';
        mark(0, 'amt', 'keep');
        if (p < .5) { S.hud = ST.dedup; mark(5, 'amt', 'big'); S.out = p > .2 ? '1041: 2378 ₽ за товар · 1046: 1790000 ₽ за товар' : ''; S.notes = p > .2 ? [[0, '4 товара по 2 378 ₽ — честно']] : []; }
        else { S.hud = ST.fixed; S.typo = true; mark(5, 'amt', 'na'); S.log = 3; S.out = '1046: цена за товар > 50 000 ₽ → amount = NaN'; S.notes = [[0, 'крупный, но настоящий'], [5, 'ошибка ввода → NaN']]; S.mob = ['tab', 'log']; }
        break;
      case 8:
        dropDup(); S.typo = true; S.log = 3; S.code = 'df.dropna(subset=["amount"])'; S.mob = ['tab', 'board'];
        NAROWS.forEach(i => mark(i, 'amt', 'na'));
        if (p < .55) { S.hud = ST.fixed; NAROWS.forEach(i => { row(i).cls = 'strike'; }); }
        else { S.hud = ST.drop; S.rows = S.rows.filter(r => !NAROWS.includes(r.i)); S.cards = 1; S.cardOn = 'drop'; S.out = 'строк: 11 → 8'; S.call = ['board', 'бренд, дата, товары — тоже ушли']; }
        break;
      case 9:
        dropDup(); S.typo = true; S.log = 3; S.code = 'df["amount"].fillna(df["amount"].median())'; S.cards = 1; S.mob = ['tab', 'board'];
        if (p < .4) { S.hud = ST.fixed; NAROWS.forEach(i => mark(i, 'amt', 'na')); }
        else { S.hud = ST.fill; S.fill = true; NAROWS.forEach(i => mark(i, 'amt', 'fill')); S.out = 'медиана 3115.0 → в три пустые ячейки'; }
        if (p > .6) { S.cards = 2; S.cardOn = 'fill'; S.call = ['board', 'выручка выросла на 9 345 ₽']; }
        break;
      case 10:
        dropDup(); S.typo = true; S.log = 3; S.cards = 2; S.hud = ST.flag; S.code = 'df["amount_missing"] = df["amount"].isna()'; S.mob = ['tab', 'board'];
        NAROWS.forEach(i => mark(i, 'amt', 'na'));
        if (p > .3) { S.flagCol = true; S.out = 'True у 1042, 1046, 1048'; }
        if (p > .6) { S.cards = 3; S.cardOn = 'flag'; S.log = 4; S.notes = [[5, 'флаг: суммы нет, строка на месте']]; }
        break;
      case 11:
        dropDup(); S.typo = true; S.log = 4; S.cards = 3; S.hud = ST.flag; S.flagCol = true; S.logOn = true; S.mob = ['board', 'log'];
        NAROWS.forEach(i => mark(i, 'amt', 'na'));
        S.code = 'pd.DataFrame(log)'; S.out = '4 записи: что нашли, что сделали, сколько строк';
        if (p > .35) S.call = ['log', 'журнал едет вместе с отчётом'];
        break;
    }
    return S;
  }

  const fmtAmt = v => v == null ? 'NaN' : `${v}.0`;
  function tableHtml(S, esc) {
    const head = `<tr><th>order_id</th><th class="c-date">date</th><th>brand</th><th class="c-n">items</th><th class="c-n">amount</th>${S.flagCol ? '<th class="c-flag">amount_<wbr>missing</th>' : ''}</tr>`;
    const notes = Object.fromEntries(S.notes.map(n => [n[0], n[1]]));
    const body = S.rows.filter(r => r.i < S.shown || S.shown >= 12).map(r => {
      const [id, date, brand, items, amt0] = ROWS[r.i];
      let amt = amt0;
      if (S.typo && r.i === 5) amt = null;
      const c = r.cell;
      const amtTxt = c.amt === 'fill' ? '3115.0' : fmtAmt(amt);
      const dateTxt = date ? `<span class="dl">${date}</span><span class="ds">${date.slice(5)}</span>` : 'NaT';
      const miss = (S.typo && r.i === 5) || amt0 == null;
      const tr = `<tr class="${r.cls}"><td>${id}</td><td class="c-date ${c.date || ''}">${dateTxt}</td><td class="${c.brand || ''}">${brand ? esc(brand) : 'NaN'}</td><td class="c-n">${items}</td><td class="c-n ${c.amt || ''}">${amtTxt}</td>${S.flagCol ? `<td class="c-flag ${miss ? 'yes' : ''}">${miss ? 'True' : 'False'}</td>` : ''}</tr>`;
      return notes[r.i] ? tr + `<tr class="cs-note"><td colspan="${S.flagCol ? 6 : 5}"><span>${esc(notes[r.i])}</span></td></tr>` : tr;
    }).join('');
    return `<table class="cs-t${S.flagCol ? ' wide' : ''}"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  }

  const scene = {
    parts: [{ n: '01', name: 'Выгрузка', s: [0, 1, 2] }, { n: '02', name: 'Дубликат', s: [3, 4] }, { n: '03', name: 'Выброс', s: [5, 6, 7] }, { n: '04', name: 'Три решения', s: [8, 9, 10] }, { n: '05', name: 'Журнал', s: [11] }],
    steps: [
      { title: 'Двенадцать строк выгрузки', dur: 3400, body: '<p>Фрагмент учебной выгрузки заказов: 12&nbsp;строк, у&nbsp;каждого заказа дата, бренд, число товаров <b>items</b> и&nbsp;сумма <b>amount</b>. Табло наверху считает сумму так, как это сделал&nbsp;бы pandas.</p><p>Среднее — 182&nbsp;199&nbsp;₽, медиана — 3&nbsp;240&nbsp;₽. Разница в&nbsp;56&nbsp;раз говорит, что с&nbsp;данными что-то не&nbsp;так.</p>' },
      { title: 'Пустота трёх видов', dur: 3400, body: '<p>Пустая сумма в&nbsp;pandas — <b>NaN</b>, пустая дата — <b>NaT</b>, пустой бренд в&nbsp;pandas&nbsp;3 — тоже NaN. <b>None</b> из&nbsp;Python при загрузке превращается в&nbsp;один из&nbsp;них.</p><p>Метод <b>isna()</b> находит пропуски любого вида: здесь их&nbsp;четыре в&nbsp;трёх столбцах.</p>' },
      { title: 'Пропуски не считаются', dur: 3400, body: '<p>В&nbsp;обычной арифметике пустота заразна: NaN&nbsp;+&nbsp;1 даёт NaN, и&nbsp;даже NaN&nbsp;==&nbsp;NaN — ложь. Методы pandas по&nbsp;умолчанию пропуски обходят: среднее посчитано по&nbsp;10 суммам из&nbsp;12.</p><p>Табло не&nbsp;сообщает, что двух сумм не&nbsp;хватает. Об&nbsp;этом надо спросить самим.</p>' },
      { title: 'Заказ 1047 дважды', dur: 3000, body: '<p>Две строки заказа 1047 совпадают во&nbsp;всех столбцах: его загрузили дважды. Это <b>полный дубликат</b>.</p><p><b>duplicated()</b> помечает вторую и&nbsp;следующие копии, первая считается оригиналом.</p>' },
      { title: 'Повтор удалён', dur: 3200, body: '<p><b>drop_duplicates()</b> оставил одну копию: строк 11. Среднее при этом выросло до&nbsp;202&nbsp;076&nbsp;₽: ушёл обычный заказ, и&nbsp;вес странной суммы стал больше.</p><p>Первая запись в&nbsp;журнале очистки: что удалили и&nbsp;сколько строк.</p>' },
      { title: '1 790 000 ₽ за один товар', dur: 3400, body: '<p>Одна сумма тянет среднее в&nbsp;сотни тысяч, хотя остальные заказы стоят от&nbsp;730 до&nbsp;9&nbsp;510&nbsp;₽. Медиана на&nbsp;неё почти не&nbsp;реагирует: ей&nbsp;важен порядок значений, а&nbsp;не&nbsp;их&nbsp;размер.</p><p>Такое значение называют <b>выбросом</b>. Но&nbsp;выброс — ещё не&nbsp;ошибка.</p>' },
      { title: 'Правило IQR', dur: 3600, body: '<p>Между первым и&nbsp;третьим <b>квартилями</b> лежит средняя половина сумм: от&nbsp;2&nbsp;630 до&nbsp;4&nbsp;660&nbsp;₽. Всё, что дальше полутора таких размахов, правило считает выбросом: здесь это суммы выше 7&nbsp;705&nbsp;₽.</p><p>Под правило попали два заказа: 1041 на&nbsp;9&nbsp;510&nbsp;₽ и&nbsp;1046.</p>' },
      { title: 'Решает здравый смысл', dur: 3800, body: '<p>Правило только показывает кандидатов. Заказ 1041 — четыре товара по&nbsp;2&nbsp;378&nbsp;₽: крупный, но&nbsp;настоящий, его оставляем.</p><p>Один товар за&nbsp;1&nbsp;790&nbsp;000&nbsp;₽ магазин не&nbsp;продаёт: это ошибка ввода с&nbsp;тремя лишними нулями. Настоящей суммы мы&nbsp;не&nbsp;знаем и&nbsp;ставим NaN. Пропусков в&nbsp;amount теперь три.</p>' },
      { title: 'Решение 1: удалить', dur: 3400, body: '<p><b>dropna(subset=["amount"])</b> удаляет строки без суммы. Среднее и&nbsp;медиана теперь по&nbsp;восьми заказам.</p><p>Вместе с&nbsp;суммой ушли дата, бренд и&nbsp;товары трёх заказов: в&nbsp;отчёте по&nbsp;брендам Сова недосчитается двух заказов.</p>' },
      { title: 'Решение 2: заполнить', dur: 3400, body: '<p><b>fillna</b> ставит в&nbsp;пустые ячейки медиану, 3&nbsp;115&nbsp;₽. Строк снова 11, среднее сдвинулось к&nbsp;медиане: 3&nbsp;457&nbsp;₽.</p><p>Цена — придуманные значения: в&nbsp;выручке появились 9&nbsp;345&nbsp;₽, которых в&nbsp;данных нет.</p>' },
      { title: 'Решение 3: пометить', dur: 3400, body: '<p>Третий путь — оставить NaN и&nbsp;добавить столбец-флаг <b>amount_missing</b>. Все 11 заказов на&nbsp;месте, статистики считаются по&nbsp;восьми известным суммам.</p><p>Из&nbsp;таблицы видно, чего мы&nbsp;не&nbsp;знаем, и&nbsp;это можно показать в&nbsp;отчёте.</p>' },
      { title: 'Журнал очистки', dur: 4400, next: 'Читать страницу', body: '<p>Три решения дали три ответа: 8 строк или 11, среднее 3&nbsp;585 или 3&nbsp;457&nbsp;₽. Ни&nbsp;один не&nbsp;верен без объяснения, что сделано.</p><p><b>Журнал очистки</b> записывает каждый шаг: что нашли, что сделали, сколько строк затронуто. С&nbsp;ним расчёт можно повторить и&nbsp;оспорить.</p>' }
    ],
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'mean', label: 'Среднее, ₽' }, { id: 'med', label: 'Медиана, ₽' }],
    legend: '<span><i style="background:#f2756a"></i>пропуск</span><span><i style="background:#a48af0"></i>дубликат</span><span><i style="background:#f0a247"></i>выброс</span><span><i style="background:#36b8a6"></i>заполнено</span>',
    info: 'ОЧИСТКА',
    aiNote: 'В анимации фрагмент учебной выгрузки заказов из 12 строк (заказы 1041–1051, заказ 1047 загружен дважды): пустые суммы у 1042 и 1048, пустая дата (NaT) у 1044, пустой бренд у 1045, у 1046 сумма 1 790 000 ₽ за один товар — ошибка ввода. Сырые данные: среднее 182 199 ₽, медиана 3 240 ₽. После drop_duplicates — 11 строк, среднее 202 076 ₽. Правило IQR (граница 7 705 ₽) отмечает 1041 (9 510 ₽ за 4 товара, оставлен) и 1046 (заменён на NaN). Три решения для трёх пустых сумм: dropna — 8 строк, среднее 3 585 ₽; fillna медианой 3 115 ₽ — 11 строк, среднее 3 457 ₽, выручка +9 345 ₽; флаг amount_missing — 11 строк, среднее 3 585 ₽ по 8 известным суммам. Всё записано в журнал очистки.',
    mount(root, api) {
      const { esc } = api;
      let sig = '', seen = new Set();
      return {
        render(k, p) {
          const S = stateAt(k, p);
          api.hud('rows', String(S.hud[0]));
          api.hud('mean', S.hud[1] == null ? '—' : sp(S.hud[1]), S.hud[1] == null ? '' : S.hud[3]);
          api.hud('med', S.hud[2] == null ? '—' : sp(S.hud[2]));
          const key = JSON.stringify([k, S.shown, S.rows, S.notes, S.call, S.cards, S.cardOn, S.log, S.flagCol, S.code, S.out, S.typo]);
          if (key === sig) return; sig = key;
          const fresh = id => { const f = !seen.has(id); seen.add(id); return f ? ' fresh' : ''; };
          const mh = id => S.mob.includes(id) ? '' : ' mh';
          const call = id => S.call && S.call[0] === id ? `<span class="cs-call${fresh(`c${k}${id}`)}">${esc(S.call[1])}</span>` : '';
          const tab = `<div class="cs-p cs-tab${mh('tab')}"><div class="cs-hd"><span>df</span><span class="cs-tag">orders_raw.csv · фрагмент</span></div><div class="cs-tw">${tableHtml(S, esc)}</div>${call('tab')}</div>`;
          const code = `<div class="cs-p cs-code${mh('code')}"><div class="cs-src"><span class="cs-pr">&gt;&gt;&gt;</span> ${esc(S.code)}</div>${S.out ? `<div class="cs-out">${esc(S.out)}</div>` : ''}</div>`;
          const cards = CARDS.slice(0, S.cards).map(c => `<div class="cs-card${S.logOn ? ' mini' : ''}${c.id === S.cardOn ? ' on' : ''}${fresh('card' + c.id)}"><b>${esc(c.t)}</b><span class="cs-sum">${c.r} строк · среднее ${sp(c.m)} ₽</span><div class="cs-kv"><span>строк <i>${c.r}</i></span><span>среднее <i>${sp(c.m)}</i></span><span>медиана <i>${sp(c.md)}</i></span><span>выручка <i>${sp(c.s)}</i></span></div><small>${esc(c.note)}</small></div>`).join('');
          const board = `<div class="cs-p cs-board${mh('board')}"><div class="cs-hd"><span>Три решения</span><span class="cs-tag">amount</span></div><div class="cs-cards">${cards || '<p class="cs-empty">появятся в части 04</p>'}</div>${call('board')}</div>`;
          const logs = LOG.slice(0, S.log).map(e => `<div class="cs-e${fresh('log' + e.id)}"><b>${esc(e.a)}</b><i>${esc(e.n)}</i><span>${esc(e.b)}</span></div>`).join('');
          const log = `<div class="cs-p cs-log${S.logOn ? ' on' : S.cards ? ' compact' : ''}${mh('log')}"><div class="cs-hd"><span>Журнал очистки</span><span class="cs-tag">log</span></div><div class="cs-lg">${logs || '<p class="cs-empty">пока пусто</p>'}</div>${call('log')}</div>`;
          root.innerHTML = `<div class="cs"><div class="cs-l">${tab}${code}</div><div class="cs-r">${board}${log}</div></div>`;
        }
      };
    }
  };

  /* ===================== Интерактив «Цена пропуска» =====================
     200 заказов в «чистой» версии учебной выгрузки: сумма amount и число товаров items известны все.
     Пропуски прячем сами: первые k индексов из заранее посчитанного порядка (numpy, seed 2303).
     mcar — случайный порядок; mnar — чем больше сумма, тем раньше заказ теряет её (вес exp(3 · ранг суммы)).
     Расчёты сверены с pandas 3.0.5 во всех 130 положениях: см. отчёт сборки. */
  const D = {"amt":[4490,3270,10900,1610,520,780,1140,1990,1540,5890,2280,5630,2020,4240,3410,1750,1240,2310,8920,3960,2750,2510,1230,9140,2190,880,820,6920,6640,2750,5610,710,10530,10150,3390,1640,2850,5780,3570,3250,9510,2300,2630,4660,3170,1790,3310,1080,3060,730,1610,1720,1080,4460,2510,1830,930,5060,1800,2330,5580,2740,4650,1970,2240,730,720,2190,3590,1430,910,4600,5140,2360,1750,2890,3910,8020,2780,1620,1920,2010,2910,820,2530,1310,2970,3750,1140,760,1410,930,7040,470,3470,4240,3130,1460,7950,1270,1140,7970,4920,3320,2390,2640,4050,1100,1670,1840,2190,1880,9820,1520,3020,3820,4890,4470,1280,2520,2740,10350,990,1830,990,3100,1480,1240,1540,4920,2550,2630,3370,1330,6250,6350,2730,5180,2300,2980,1450,1450,1830,3280,2690,2390,6650,1030,2130,1430,1520,3930,3670,4420,6080,5820,2380,11300,4130,1530,2560,3090,470,3960,3310,2720,4390,1620,10370,700,4370,4240,3290,3610,1940,5490,4630,1330,1020,1590,3160,1400,2890,4840,4420,2330,1230,5130,940,5070,1360,14440,3580,6960,1530,1150,2240,1460,1300,3010],"items":[3,2,5,1,1,1,1,1,1,3,1,3,2,2,4,2,1,4,3,1,2,2,2,5,2,1,1,5,5,2,5,1,4,5,3,2,3,3,2,2,4,2,1,3,3,1,2,1,1,1,1,1,1,3,1,2,1,4,1,1,3,3,2,1,1,1,1,2,3,1,1,5,3,4,2,2,2,5,1,1,1,1,2,1,2,1,3,2,1,1,1,1,4,1,5,3,2,1,3,1,1,4,4,2,1,2,3,1,1,1,1,1,3,1,2,3,2,3,1,3,2,5,2,2,1,3,1,1,1,3,1,2,2,1,4,5,3,3,1,3,1,1,3,1,1,1,3,1,4,1,1,3,3,2,3,4,2,3,2,1,3,4,1,3,2,2,3,1,5,1,5,2,2,2,2,2,3,1,1,1,2,1,1,2,3,2,1,3,2,3,1,4,2,5,1,1,2,1,2,2],"mcar":[180,199,28,52,171,131,155,81,64,172,119,73,109,198,194,84,127,37,29,152,174,137,153,72,130,24,182,193,124,151,58,9,78,148,35,93,22,65,23,85,154,77,128,94,185,111,188,129,86,7,99,83,105,123,157,167,13,66,49,14,161,63,184,166,156,48,91,17,120,176,165,162,50,69,75,100,11,61,26,122,34,170,44,62,3,95,10,40,38,117,144,2,118,116,0,114,110,53,54,5,143,16,197,92,108,138,71,31,32,20,139,134,159,45,163,136,51,67,33,196,190,195,96,12,150,21,39,183,121,191,140,132,169,87,168,104,112,135,98,177,56,145,142,74,179,55,27,68,158,89,42,30,160,107,70,36,4,133,1,189,146,192,41,57,102,47,125,103,76,147,187,115,97,175,88,15,106,181,141,178,113,59,90,173,25,43,19,82,126,46,164,79,8,101,18,60,149,186,6,80],"mnar":[28,180,199,155,171,172,131,37,193,137,64,72,9,119,81,23,73,153,77,152,157,154,151,84,52,109,29,129,182,40,2,11,78,130,194,13,176,184,94,166,32,198,92,174,24,33,62,14,191,170,121,134,86,117,168,116,95,112,148,0,161,58,98,48,53,127,34,71,105,135,27,38,185,120,44,35,75,183,165,30,163,146,61,156,111,7,143,17,114,123,189,124,128,63,87,57,158,144,102,139,167,132,85,68,187,175,96,39,22,20,10,54,18,101,136,50,99,192,110,138,76,65,93,106,43,115,1,60,69,21,188,3,103,196,67,36,104,83,145,125,42,173,19,12,160,108,100,45,91,49,66,51,197,122,46,159,164,118,142,162,26,55,74,150,16,41,82,179,190,140,59,5,195,177,31,15,133,56,107,97,169,113,141,89,181,70,79,90,47,80,126,8,147,88,4,178,149,25,186,6]};
  const N = D.amt.length;
  const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
  const med = a => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN; };
  const pearson = (x, y) => { const mx = avg(x), my = avg(y); let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < x.length; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sxx += a * a; syy += b * b; } return sxy / Math.sqrt(sxx * syy); };
  function calc(mech, strat, pct) {
    const k = Math.round(N * pct / 100), hidden = new Set(D[mech].slice(0, k));
    const oA = [], oI = [];
    D.amt.forEach((v, i) => { if (!hidden.has(i)) { oA.push(v); oI.push(D.items[i]); } });
    const fill = new Array(N).fill(null);
    let A = oA, I = oI;
    if (strat === 'mean' || strat === 'median' || strat === 'group') {
      const one = strat === 'mean' ? avg(oA) : med(oA);
      const g = {};
      if (strat === 'group') [1, 2, 3, 4, 5].forEach(n => { const v = med(oA.filter((x, j) => oI[j] === n)); g[n] = isNaN(v) ? med(oA) : v; });
      A = D.amt.map((v, i) => hidden.has(i) ? (fill[i] = strat === 'group' ? g[D.items[i]] : one) : v); I = D.items;
    }
    const hi = [...hidden].map(i => D.items[i]);
    return { k, hidden, fill, rows: strat === 'drop' ? N - k : N, mean: avg(A), median: med(A), corr: pearson(A, I), missItems: k ? avg(hi) : NaN, keepItems: avg(oI) };
  }
  const TRUTH = calc('mcar', 'flag', 0);
  const STRATS = [['drop', 'Удалить'], ['mean', 'Среднее'], ['median', 'Медиана'], ['group', 'Медиана группы'], ['flag', 'Пометить']];
  const SNAME = { drop: 'удалить строки', mean: 'заполнить средним', median: 'заполнить медианой', group: 'заполнить медианой группы по числу товаров', flag: 'оставить NaN и пометить флагом' };
  const MNAME = { mcar: 'пропадают случайные заказы', mnar: 'чаще пропадают крупные заказы' };

  function buildCost(box, api) {
    const { $, esc, fmt, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Цена пропуска: любое решение что-то сдвигает <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="cw-reset">Сбросить</button></div></div>
<p class="hint cw-do">Двигайте долю пропусков и переключайте решение. Серые кольца — настоящие суммы, которые мы спрятали: в жизни их не видно.</p>
<div class="cw-ctrls">
<div class="cw-c"><span class="cw-l">Кто теряет сумму</span><span class="seg" role="group" aria-label="Механизм пропусков"><button type="button" data-m="mcar">Случайные заказы</button><button type="button" data-m="mnar">Чаще крупные</button></span></div>
<div class="cw-c"><label class="cw-l" for="cw-p">Доля пропусков</label><span class="krange"><input type="range" id="cw-p" min="0" max="60" step="5" value="40"><b id="cw-pv"></b></span></div>
<div class="cw-c cw-wide"><span class="cw-l">Что делаем с пропусками</span><span class="seg cw-seg" role="group" aria-label="Решение">${STRATS.map(([s, t]) => `<button type="button" data-s="${s}">${t}</button>`).join('')}</span></div>
</div>
<div class="stage"><div class="cw-left"><div class="cw-plot" id="cw-plot"></div><div class="cw-leg"><span><i class="o"></i>известная сумма</span><span><i class="g"></i>спрятанная (правда)</span><span><i class="f"></i>заполненная</span><span><i class="lt"></i>среднее: правда</span><span><i class="lm"></i>среднее сейчас</span><span><i class="ld"></i>медиана сейчас</span></div></div>
<div class="narr"><p class="cap">Сумма заказа: сейчас и в правде</p><div class="cw-read" id="cw-read"></div><div class="narr-text" id="cw-msg"></div><p class="cap">Задания</p><ol class="steps cw-tasks" id="cw-tasks"></ol></div></div>
<div class="status"><span><span class="dot live"></span><span id="cw-s1"></span></span><span id="cw-s2"></span><span class="grow"></span><span id="cw-s3"></span></div>`;
    const TASKS = [
      'Случайные пропуски, 40% и больше: найдите решение, при котором связь с числом товаров слабеет сильнее всего.',
      'Найдите заполнение, которое не рвёт эту связь. Не преувеличивает ли оно её?',
      '«Чаще крупные», 40%: переберите все пять решений. Вернёт ли хоть одно среднее к правде?'
    ];
    let s;
    const fresh = () => ({ mech: 'mcar', pct: 40, strat: 'drop', done: [false, false, false], seen: new Set() });
    const pctTxt = v => `${v}%`;
    const money = v => `${fmt(Math.round(v))} ₽`;
    const dPct = (v, t) => { const d = (v / t - 1) * 100; return `${d > 0 ? '+' : d < 0 ? '−' : ''}${fmt(Math.abs(d), 1)}%`; };
    const dAbs = (v, t) => { const d = v - t; return `${d > 0 ? '+' : d < 0 ? '−' : ''}${fmt(Math.abs(d), 2)}`; };
    const tone = (v, t, rel) => { const d = Math.abs(rel ? v / t - 1 : v - t); return d < (rel ? .03 : .03) ? 'ok' : d < (rel ? .1 : .1) ? 'mid' : 'bad'; };

    function plot(R) {
      const host = $('cw-plot'), W = Math.max(280, Math.round(host.clientWidth || 600)), narrow = W < 520;
      const H = narrow ? 300 : 340, L = narrow ? 40 : 54, Rm = 12, T = 12, B = 46;
      const pw = W - L - Rm, ph = H - T - B, band = pw / 5, YMAX = 15000;
      const x = n => L + band * (n - .5), y = v => T + ph * (1 - Math.min(v, YMAX) / YMAX);
      const jit = i => (((i * 0.6180339887) % 1) - .5) * Math.min(band * .62, 46);
      let g = '';
      for (let v = 0; v <= YMAX; v += 5000) g += `<line class="cw-grid" x1="${L}" x2="${W - Rm}" y1="${y(v)}" y2="${y(v)}"/><text class="cw-ax" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v ? fmt(v / 1000) + (narrow ? 'k' : ' 000') : '0'}</text>`;
      const lost = [0, 0, 0, 0, 0, 0], tot = [0, 0, 0, 0, 0, 0];
      D.items.forEach((n, i) => { tot[n]++; if (R.hidden.has(i)) lost[n]++; });
      for (let n = 1; n <= 5; n++) g += `<text class="cw-ax" x="${x(n)}" y="${T + ph + 17}" text-anchor="middle">${n} шт.</text><text class="cw-lost${lost[n] ? '' : ' z'}" x="${x(n)}" y="${T + ph + 33}" text-anchor="middle">${narrow ? `−${lost[n]}` : `пропало ${lost[n]} из ${tot[n]}`}</text>`;
      let pts = '';
      D.amt.forEach((v, i) => {
        const cx = (x(D.items[i]) + jit(i)).toFixed(1);
        if (R.hidden.has(i)) {
          pts += `<circle class="cw-pt g" cx="${cx}" cy="${y(v).toFixed(1)}" r="3.6"/>`;
          if (R.fill[i] != null) pts += `<rect class="cw-pt f" x="${(cx - 3.4).toFixed(1)}" y="${(y(R.fill[i]) - 3.4).toFixed(1)}" width="6.8" height="6.8" transform="rotate(45 ${cx} ${y(R.fill[i]).toFixed(1)})"/>`;
        } else pts += `<circle class="cw-pt o" cx="${cx}" cy="${y(v).toFixed(1)}" r="3.2"/>`;
      });
      const ln = (v, c) => `<line class="cw-ln ${c}" x1="${L}" x2="${W - Rm}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>`;
      host.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Сумма заказа против числа товаров: ${R.k} сумм спрятано">${g}${pts}${ln(TRUTH.mean, 'lt')}${ln(R.median, 'ld')}${ln(R.mean, 'lm')}<text class="cw-ax ttl" x="${L - 6}" y="${T + ph + 33}" text-anchor="end">${narrow ? '' : 'товаров'}</text></svg>`;
    }

    function message(R) {
      const k = R.k, tr = TRUTH;
      if (!k) return 'Пропусков нет: все три статистики совпадают с правдой. Сдвиньте ползунок вправо.';
      const bias = s.mech === 'mnar' ? ` Пропали в основном крупные заказы, и оставшиеся суммы уже не похожи на все: среднее ниже правды на ${fmt(Math.abs((R.mean / tr.mean - 1) * 100), 0)}%.` : '';
      const sig = `У строк с пропуском в среднем ${fmt(R.missItems, 2)} товара, у остальных — ${fmt(R.keepItems, 2)}${s.mech === 'mnar' ? ': сам факт пропуска говорит о заказе.' : ': пропуск ни о чём не говорит.'}`;
      switch (s.strat) {
        case 'drop': return `<b>dropna</b> убрал ${k} ${plural(k, ['строку', 'строки', 'строк'])}, в таблице ${N - k}.${s.mech === 'mcar' ? ' Пропуски случайны, поэтому статистики гуляют только оттого, что данных меньше.' : bias} Вместе с суммами из отчёта ушли бренд, страна и канал этих заказов.`;
        case 'mean': return `Все ${k} пропусков получили одно число — ${money(R.fill.find(v => v != null))}. Заполненные ромбы легли горизонтальной линией, разброс сжался, и связь с числом товаров ослабла: корреляция ${fmt(R.corr, 2)} вместо ${fmt(tr.corr, 2)}.${bias}`;
        case 'median': return `Все ${k} пропусков получили медиану — ${money(R.fill.find(v => v != null))}. Суммы скошены вправо, медиана ниже среднего, поэтому среднее сдвинулось вниз. Ромбы легли линией, корреляция ${fmt(R.corr, 2)} вместо ${fmt(tr.corr, 2)}.${bias}`;
        case 'group': return `Каждый пропуск получил медиану своей группы по числу товаров. Связь не рвётся: корреляция ${fmt(R.corr, 2)} при правде ${fmt(tr.corr, 2)}${R.corr > tr.corr + .02 ? ' — даже сильнее правды: заполненные ромбы стоят ровно в центре групп, без разброса' : ''}.${s.mech === 'mnar' ? ' Но внутри групп пропадали самые крупные заказы, и медианы групп занижены.' : ''}`;
        default: return `Строк осталось ${N}: суммы не придуманы, а помечены флагом. Статистики посчитаны по ${N - k} известным суммам, как при удалении, но заказы, бренды и страны на месте. ${sig}`;
      }
    }

    function render() {
      const R = calc(s.mech, s.strat, s.pct), tr = TRUTH;
      box.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === s.mech)));
      box.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.s === s.strat)));
      $('cw-p').value = s.pct; $('cw-pv').textContent = pctTxt(s.pct);
      plot(R);
      const row = (lbl, v, t, d, cls) => `<div class="cw-r"><span class="lb">${lbl}</span><b>${v}</b><span class="tr">правда ${t}</span><em class="${cls}">${d}</em></div>`;
      $('cw-read').innerHTML = row('Среднее', money(R.mean), money(tr.mean), dPct(R.mean, tr.mean), tone(R.mean, tr.mean, true))
        + row('Медиана', money(R.median), money(tr.median), dPct(R.median, tr.median), tone(R.median, tr.median, true))
        + row('Корреляция с товарами', fmt(R.corr, 2), fmt(tr.corr, 2), dAbs(R.corr, tr.corr), tone(R.corr, tr.corr, false))
        + row('Строк в таблице', String(R.rows), String(N), R.rows < N ? `−${N - R.rows}` : '0', R.rows < N ? 'bad' : 'ok');
      $('cw-msg').innerHTML = message(R);
      // задания
      if (s.mech === 'mcar' && s.pct >= 40) { const lo = STRATS.map(([id]) => [id, calc('mcar', id, s.pct).corr]).sort((a, b) => a[1] - b[1])[0][0]; if (s.strat === lo) s.done[0] = true; }
      if (s.strat === 'group' && s.pct >= 20) s.done[1] = true;
      if (s.mech === 'mnar' && s.pct >= 40) { s.seen.add(s.strat); if (s.seen.size === STRATS.length) s.done[2] = true; }
      $('cw-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t)}</li>`).join('');
      $('cw-s1').textContent = `Пропусков: ${R.k} из ${N}`;
      $('cw-s2').textContent = s.mech === 'mcar' ? 'пропадают случайные' : 'чаще пропадают крупные';
      $('cw-s3').textContent = `Решение: ${STRATS.find(x => x[0] === s.strat)[1].toLowerCase()} · строк ${R.rows}`;
    }
    box.addEventListener('click', e => {
      const m = e.target.closest('[data-m]'), st = e.target.closest('[data-s]');
      if (m) { s.mech = m.dataset.m; render(); } else if (st) { s.strat = st.dataset.s; render(); }
    });
    $('cw-p').addEventListener('input', e => { s.pct = +e.target.value; render(); });
    $('cw-reset').addEventListener('click', () => { s = fresh(); render(); });
    s = fresh(); render();
    if ('ResizeObserver' in window) { let w0 = 0; new ResizeObserver(es => { const w = Math.round(es[0].contentRect.width); if (w && Math.abs(w - w0) > 4) { w0 = w; plot(calc(s.mech, s.strat, s.pct)); } }).observe($('cw-plot')); }
    return {
      redraw() { plot(calc(s.mech, s.strat, s.pct)); },
      describe() {
        const R = calc(s.mech, s.strat, s.pct), tr = TRUTH;
        return `${MNAME[s.mech]}; доля пропусков ${s.pct}%; решение: ${SNAME[s.strat]}; среднее ${Math.round(R.mean)} ₽ при правде ${Math.round(tr.mean)} ₽; медиана ${R.median} ₽ при правде ${tr.median} ₽; корреляция с числом товаров ${R.corr.toFixed(2)} при правде ${tr.corr.toFixed(2)}; строк ${R.rows} из ${N}; выполнено заданий ${s.done.filter(Boolean).length} из 3.`;
      }
    };
  }
  buildCost.calc = calc;    // для сверки с pandas в песочнице

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-2-3',
    short: 'DA-02',
    title: 'Очистка: пропуски, дубликаты, выбросы',
    where: 'блок «Дата аналитика», тема 02 «Pandas и подготовка данных», страница 2.3',
    aiData: 'учебная выгрузка заказов интернет-магазина orders_raw.csv (январь–март 2026, бренды Сова, Кедр, Луч, Бриз, страны BY, RU, KZ, UZ): 207 строк с пропусками, дубликатами, суммой 1 790 000 ₽ за один товар и грязным написанием брендов',
    scene,
    widgets: { cost: buildCost },
    code: {
      report: { title: `Отчёт о пропусках по столбцам`, badge: `проверено: Python 3.13, pandas 3.0.5`, lang: 'python', outLabel: `Вывод`,
        code: `import pandas as pd

df = pd.read_csv("data/orders_raw.csv", parse_dates=["date", "updated_at"])
log = []                      # журнал очистки: шаг, что сделано, сколько строк

report = pd.DataFrame({
    "тип": df.dtypes.astype(str),
    "пропусков": df.isna().sum(),
    "доля, %": (df.isna().mean() * 100).round(1),
}).sort_values("пропусков", ascending=False)

print("строк, столбцов:", df.shape)
print(report)
print("строк после dropna():", len(df.dropna()))
print('строк после dropna(subset=["amount"]):', len(df.dropna(subset=["amount"])))`,
        out: `строк, столбцов: (207, 9)
                       тип  пропусков  доля, %
channel                str         28     13.5
amount             float64         12      5.8
brand                  str          5      2.4
date        datetime64[us]          3      1.4
order_id             int64          0      0.0
country                str          0      0.0
items                int64          0      0.0
status                 str          0      0.0
updated_at  datetime64[us]          0      0.0
строк после dropna(): 163
строк после dropna(subset=["amount"]): 195`,
        note: `Тип str у brand, country, channel и status — строковый тип pandas 3 по умолчанию. Из 207 строк dropna() оставил 163, хотя сумм не хватает только в 12.` },
      dedup: { title: `Дубликаты: полные и по ключу, остаётся свежая версия`, badge: `проверено: Python 3.13, pandas 3.0.5`, lang: 'python', outLabel: `Вывод`,
        code: `full = df.duplicated()                      # строка целиком повторяет одну из предыдущих
print("полных дубликатов:", full.sum(), df.loc[full, "order_id"].tolist())
df = df[~full]
log.append(("полные дубликаты", "удалены", int(full.sum())))

dup_key = df.duplicated("order_id", keep=False)   # все версии заказов с повторным id
print(df.loc[dup_key, ["order_id", "status", "updated_at"]]
        .sort_values(["order_id", "updated_at"]).head(4).to_string(index=False))

before = len(df)
df = (df.sort_values("updated_at")
        .drop_duplicates("order_id", keep="last")   # остаётся самая свежая версия
        .sort_values("order_id"))
log.append(("повторы order_id", "оставлена свежая версия", before - len(df)))
print("строк:", before, "→", len(df), "| order_id уникален:", df["order_id"].is_unique)`,
        out: `полных дубликатов: 3 [1047, 1113, 1178]
 order_id    status          updated_at
     1022      paid 2026-01-08 21:09:00
     1022 cancelled 2026-01-10 23:26:00
     1089      paid 2026-02-06 09:06:00
     1089 cancelled 2026-02-07 11:23:00
строк: 204 → 200 | order_id уникален: True`,
        note: `Сначала полные дубликаты, потом дубликаты по ключу: в обратном порядке drop_duplicates("order_id") удалил бы и полные копии, но журнал смешал бы два разных решения.` },
      iqr: { title: `Флаг выброса по IQR и проверка здравым смыслом`, badge: `проверено: Python 3.13, pandas 3.0.5`, lang: 'python', outLabel: `Вывод`,
        code: `q1, q3 = df["amount"].quantile([0.25, 0.75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
df["amount_outlier"] = df["amount"].notna() & ~df["amount"].between(low, high)
print(f"Q1 = {q1:.0f}, Q3 = {q3:.0f}, IQR = {iqr:.0f}, границы: {low:.0f} … {high:.0f}")

per_item = df["amount"] / df["items"]           # здравый смысл: цена одного товара
cols = ["order_id", "items", "amount"]
print(df.loc[df["amount_outlier"], cols].assign(за_товар=per_item.round()).to_string(index=False))

z = (df["amount"] - df["amount"].mean()) / df["amount"].std()
print("|z| > 3:", df.loc[z.abs() > 3, "order_id"].tolist())

typo = per_item > 50_000                         # дороже 50 000 ₽ за штуку товаров нет
df.loc[typo, "amount"] = float("nan")            # ошибка ввода: настоящей суммы не знаем
df.loc[typo, "amount_outlier"] = False
z = (df["amount"] - df["amount"].mean()) / df["amount"].std()
print("|z| > 3 после исправления:", df.loc[z.abs() > 3, "order_id"].tolist())
log.append(("ошибка ввода в amount", "заменена на NaN", int(typo.sum())))
log.append(("крупные заказы по IQR", "оставлены, флаг amount_outlier", int(df["amount_outlier"].sum())))`,
        out: `Q1 = 1530, Q3 = 4420, IQR = 2890, границы: -2805 … 8755
 order_id  items    amount  за_товар
     1003      5   10900.0    2180.0
     1019      3    8920.0    2973.0
     1024      5    9140.0    1828.0
     1033      4   10530.0    2632.0
     1034      5   10150.0    2030.0
     1041      4    9510.0    2378.0
     1046      1 1790000.0 1790000.0
     1113      3    9820.0    3273.0
     1122      5   10350.0    2070.0
     1158      3   11300.0    3767.0
     1169      5   10370.0    2074.0
     1192      4   14440.0    3610.0
|z| > 3: [1046]
|z| > 3 после исправления: [1003, 1158, 1192]`,
        note: `Нижняя граница IQR отрицательна, а суммы меньше нуля не бывают, поэтому правило работает только сверху. Ошибкой признан один заказ, 1046; флаг amount_outlier остался у одиннадцати настоящих крупных заказов.` },
      strings: { title: `Нормализация брендов и журнал очистки`, badge: `проверено: Python 3.13, pandas 3.0.5`, lang: 'python', outLabel: `Вывод`,
        code: `raw = df["brand"]
brand = (raw.str.strip()
            .str.lower()
            .str.replace(r"[^а-яёa-z0-9\\s]", "", regex=True)  # всё, кроме букв и цифр
            .str.replace(r"\\s+", " ", regex=True)             # двойные пробелы
            .str.strip()
            .str.capitalize())
print("написаний бренда:", raw.nunique(), "→", brand.nunique())
print(raw[brand == "Луч"].unique().tolist())

changed = raw.notna() & (raw != brand)          # NaN != NaN, поэтому пустые отсекаем
log.append(("написание бренда", "strip, lower, регулярные выражения", int(changed.sum())))
log.append(("пустой бренд", "«неизвестно»", int(brand.isna().sum())))
log.append(("пустой канал", "«неизвестно»", int(df["channel"].isna().sum())))
log.append(("пропуск в amount", "флаг amount_missing", int(df["amount"].isna().sum())))
df["brand"] = brand.fillna("неизвестно")
df["channel"] = df["channel"].fillna("неизвестно")
df["amount_missing"] = df["amount"].isna()       # пометить, а не заполнить

print(df["brand"].value_counts().to_dict())
print(pd.DataFrame(log, columns=["шаг", "что сделано", "строк"]).to_string(index=False))`,
        out: `написаний бренда: 29 → 4
['Луч.', 'Луч!', 'Луч ', 'Луч', ' Луч', 'луч', 'луч  ', '«Луч»']
{'Сова': 59, 'Луч': 51, 'Кедр': 44, 'Бриз': 41, 'неизвестно': 5}
                  шаг                        что сделано  строк
     полные дубликаты                            удалены      3
     повторы order_id            оставлена свежая версия      4
ошибка ввода в amount                    заменена на NaN      1
крупные заказы по IQR     оставлены, флаг amount_outlier     11
     написание бренда strip, lower, регулярные выражения     74
         пустой бренд                       «неизвестно»      5
         пустой канал                       «неизвестно»     26
     пропуск в amount                флаг amount_missing     13`,
        note: `Буквы в шаблоне перечислены явно не случайно. В pandas 3 строки хранит pyarrow, и регулярное выражение выполняет его движок, а не модуль re: в нём \\w — только латиница, цифры и подчёркивание. Шаблон [^\\w\\s] в нашей проверке стёр бы бренды целиком, а на столбце типа object сработал бы как обычно.` }
    },
    questions: {
    q1: { sec: 'missing', title: 'Сначала предскажите', q: 'Суммы пропали у 40% заказов, случайным образом. Вы заполнили пропуски медианой. Что станет с корреляцией суммы и числа товаров?', opts: [['Не изменится: медиана — устойчивая статистика'], ['Ослабнет: все пропуски получат одно число, не связанное с числом товаров', 1], ['Усилится: в данных станет меньше шума'], ['Станет отрицательной']],
      why: 'Заполнение одним числом ставит все 80 пропусков на одну горизонтальную линию, сколько бы товаров ни было в заказе. Разброс сжимается, связь размывается: в интерактиве корреляция падает с 0,76 до 0,62. Устойчивость медианы касается выбросов, а не связей между столбцами. Отрицательной связь не станет: у известных сумм она прежняя. Проверьте ниже.' },
    q2: { sec: 'idea', q: 'В анимации решения «удалить» и «пометить» дали одинаковое среднее, 3 585 ₽. Чем они различаются?', opts: [['Ничем: флаг — просто лишний столбец'], ['После удаления в таблице 8 заказов, с флагом — 11: даты, бренды и товары трёх заказов остаются в отчёте', 1], ['Флаг заполняет пропуски медианой'], ['Удаление точнее, потому что в таблице не остаётся NaN']],
      why: 'Оба решения считают среднее и медиану по восьми известным суммам, поэтому числа совпадают. Но dropna убирает строки целиком, и вместе с суммой пропадают остальные столбцы: заказов по брендам и датам станет меньше. Флаг ничего не заполняет и не удаляет, он записывает, где суммы нет. Точнее удаление не становится: оно прячет неизвестное.' },
    q3: { sec: 'idea', q: 'Вы ищете пустые суммы так, а результат — пустая таблица, хотя пропусков 12. Почему?', code: 'df[df["amount"] == np.nan]', lang: 'python', opts: [['В столбце amount пропуски хранятся как None, а не NaN'], ['NaN не равен ничему, даже себе: сравнение всегда даёт False, пропуски ищут через isna()', 1], ['Нужно писать "NaN" в кавычках'], ['pandas удаляет NaN перед сравнением']],
      why: 'По правилам чисел с плавающей точкой NaN не равен ни одному значению, включая другой NaN, поэтому маска из == np.nan состоит из одних False. Для поиска пропусков есть isna() и notna(). В числовом столбце pandas хранит пустоту как NaN, а не None; "NaN" в кавычках — обычная строка; сравнение ничего не удаляет.' },
    q4: { sec: 'missing', q: 'Что потеряется после df.dropna() без параметров на учебной выгрузке из раздела «Код»?', opts: [['Только 12 строк без суммы'], ['44 строки из 207: всё, где пусто хоть в одном столбце, — в основном заказы без канала, у которых сумма есть', 1], ['Ничего: без параметров dropna удаляет только полностью пустые строки'], ['Столбцы, в которых есть пропуски']],
      why: 'По умолчанию dropna удаляет строку, если пусто хоть в одном столбце (how="any"). В выгрузке 28 строк без канала, 12 без суммы, 5 без бренда и 3 без даты, и после dropna() остаются 163 строки из 207. Если чистили сумму, пишут dropna(subset=["amount"]) — останется 195. Полностью пустые строки удаляет how="all", столбцы — axis=1.' },
    q5: { sec: 'missing', q: 'Платёжный шлюз теряет суммы у самых крупных заказов. Почему такие пропуски нельзя заполнять медианой?', opts: [['Медиану дольше считать, чем среднее'], ['Пропуск зависит от самой суммы: медиана известных занижена, и заполнение выдаст смещение за настоящие данные', 1], ['Медианой нельзя заполнять целые числа'], ['Можно: медиана устойчива к выбросам, значит, и к пропускам']],
      why: 'Когда теряются именно крупные суммы, оставшиеся — смещённая выборка, и их медиана ниже настоящей. Заполнение подставит заниженное число в каждую дыру, и смещение станет выглядеть как данные: в интерактиве при 40% таких пропусков среднее после заполнения медианой ниже правды на 36%. Честнее пометить пропуски флагом и выяснить причину. Медиана устойчива к выбросам, но не к неслучайным пропускам.' },
    q6: { sec: 'code', q: 'У заказа 1022 две версии: paid от 8 января и cancelled от 10 января. Какую оставит эта строка?', code: 'df.sort_values("updated_at").drop_duplicates("order_id", keep="last")', lang: 'python', opts: [['Версию paid: drop_duplicates всегда оставляет первую строку'], ['Версию cancelled: после сортировки по updated_at последней идёт самая свежая', 1], ['Обе: они различаются статусом'], ['Ни одной: дубликаты по ключу удаляются целиком']],
      why: 'drop_duplicates("order_id") сравнивает только ключ, поэтому две версии заказа — дубликаты, хотя статусы разные. keep="last" оставляет последнюю, а сортировка по updated_at делает последней самую свежую, cancelled от 10 января. По умолчанию keep="first", и без сортировки результат зависел бы от порядка строк в файле. Удалить все копии сразу можно через keep=False.' },
    q7: { sec: 'outliers', q: 'Правило IQR отметило 12 заказов, среди них 1192 — 14 440 ₽ за 4 товара и 1046 — 1 790 000 ₽ за один. Что с ними делать?', opts: [['Удалить оба: это выбросы по правилу'], ['1192 оставить с флагом, это настоящий крупный заказ; 1046 признать ошибкой ввода: исправить по источнику или поставить NaN и записать в журнал', 1], ['Заменить оба на границу IQR, 8 755 ₽'], ['Оставить оба как есть: правило IQR ничего не доказывает']],
      why: 'Правило только находит кандидатов. 14 440 ₽ за четыре товара — 3 610 ₽ за штуку, обычная цена в этом магазине, и такой заказ — часть выручки. Один товар за 1 790 000 ₽ невозможен: это ошибка ввода, её исправляют по первоисточнику, а без него ставят NaN. Удаление настоящих крупных заказов занизит выручку, замена на границу придумает значения, а бездействие оставит в отчёте ошибку, которая тянет среднее.' }
    },
    glossary: {
      missing: { t: 'Пропуск', en: 'missing value', d: 'Ячейка без значения: его не прислали, не записали или потеряли. В pandas — NaN, NaT или pd.NA.' },
      duplicate: { t: 'Дубликат', en: 'duplicate', d: 'Строка, которая повторяет другую целиком или по ключу.' },
      outlier: { t: 'Выброс', en: 'outlier', d: 'Значение, далёкое от остальных: ошибка ввода или настоящее редкое событие.' },
      cleanlog: { t: 'Журнал очистки', en: 'cleaning log', d: 'Список решений по очистке: шаг, что сделано, сколько строк затронуто.' },
      nan: { t: 'NaN', en: 'Not a Number', d: 'Значение типа float для пропуска. Арифметика с ним даёт NaN, и он не равен даже себе.' },
      nat: { t: 'NaT', en: 'Not a Time', d: 'Пропуск в столбце дат и времени, ведёт себя как NaN.' },
      none: { t: 'None', en: 'None', d: '«Ничего» в Python. В столбцах чисел, строк и дат pandas превращает его в NaN или NaT.' },
      strdtype: { t: 'Тип str', en: 'string dtype', d: 'Строковый тип pandas 3 по умолчанию: хранит только строки, пропуск в нём — NaN.' },
      isna: { t: 'isna() и notna()', en: 'isna, notna', d: 'Методы, которые возвращают маску True/False: где значение пропущено и где оно есть.' },
      median: { t: 'Медиана', en: 'median', d: 'Значение посередине упорядоченного ряда: половина значений меньше, половина больше.' },
      robust: { t: 'Устойчивая статистика', en: 'robust statistic', d: 'Статистика, которую трудно сдвинуть несколькими крайними значениями, например медиана.' },
      imputation: { t: 'Заполнение пропусков', en: 'imputation', d: 'Замена пропуска правдоподобным значением: средним, медианой, медианой группы, «неизвестно».' },
      flag: { t: 'Флаг пропуска', en: 'missing indicator', d: 'Столбец True/False рядом с исходным: где значение было пустым.' },
      mech: { t: 'Механизм пропусков', en: 'missingness mechanism', d: 'Причина пропуска: случайно (MCAR), из-за других столбцов (MAR) или из-за самого значения (MNAR).' },
      corr: { t: 'Корреляция', en: 'Pearson correlation', d: 'Число от −1 до 1: насколько согласованно растут два столбца.' },
      key: { t: 'Ключ', en: 'key', d: 'Столбец, который однозначно задаёт строку, например order_id.' },
      quartile: { t: 'Квартиль', en: 'quartile', d: 'Точка, которая делит упорядоченные значения на четверти: ниже Q1 — четверть значений, ниже Q3 — три четверти.' },
      iqr: { t: 'Межквартильный размах', en: 'interquartile range, IQR', d: 'Разность Q3 − Q1, ширина средней половины данных.' },
      zscore: { t: 'z-оценка', en: 'z-score', d: 'На сколько стандартных отклонений значение отстоит от среднего.' },
      masking: { t: 'Маскировка', en: 'masking', d: 'Эффект, когда крайнее значение раздувает среднее и отклонение и прячет другие выбросы от z-оценки.' },
      normalize: { t: 'Нормализация строк', en: 'string normalization', d: 'Приведение разных написаний одного значения к одному виду.' },
      regex: { t: 'Регулярное выражение', en: 'regular expression, regex', d: 'Шаблон для поиска и замены текста: \\s+ — пробелы подряд, [^а-я] — всё, кроме строчных русских букв.' }
    },
    materials: [
      ['da-2-3-cleaning.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/orders_raw.csv', 'Учебная выгрузка на 207 строк со всей грязью страницы'],
      ['data/orders_true.csv', 'Те же 200 заказов без порчи, «правда» интерактива'],
      ['clean_orders.ipynb', 'Четыре ячейки раздела «Код»'],
      ['cost_of_missing.py', 'Расчёт интерактива «Цена пропуска» на pandas'],
      ['gen_data.py', 'Генератор обеих выгрузок, зёрна 23 и 230']
    ],
    prompts: [
      ['План очистки моей выгрузки', 'Я вставлю вывод df.isna().sum() и df.duplicated().sum() своей выгрузки. Спроси о причинах пропусков и по источнику предложи для каждого столбца решение — удалить, заполнить или пометить — и что оно сдвинет.'],
      ['Выброс или ошибка', 'Дай по очереди пять подозрительных сумм интернет-магазина. Я скажу, выброс это или ошибка ввода и что делать; проверяй меня по источнику.'],
      ['Журнал очистки', 'Помоги составить журнал очистки для моего отчёта по образцу из источника, чтобы коллега мог повторить расчёт.']
    ]
  };
})();
