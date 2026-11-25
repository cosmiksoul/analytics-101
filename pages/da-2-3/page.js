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
    { id: 'drop', t: 'Удалить строки', r: 8, m: 3585, md: 3115, s: 28680, note: 'исключены три заказа' },
    { id: 'fill', t: 'Заполнить медианой', r: 11, m: 3457, md: 3115, s: 38025, note: '9 345 ₽ добавлено при заполнении' },
    { id: 'flag', t: 'Пометить флагом', r: 11, m: 3585, md: 3115, s: 28680, note: 'для трёх заказов сумма неизвестна' }
  ];
  const LOG = [
    { id: 'dup', a: '1047', b: 'полный дубликат удалён', n: '−1 строка' },
    { id: 'keep', a: '1041', b: '4 товара по обычной цене, заказ сохранён', n: 'флаг' },
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
        S.code = 'cols = ["order_id", "date", "brand", "items", "amount"]\ndf = orders.loc[orders["order_id"].between(1041, 1051), cols]'; S.out = p > .62 ? 'df.shape → (12, 5)' : '';
        S.call = p > .65 ? ['tab', 'среднее примерно в 56 раз больше медианы'] : null; break;
      case 1:
        naMarks(); S.code = 'df.isna().sum()'; S.out = p > .3 ? 'date 1 · brand 1 · amount 2' : '';
        if (p > .45) S.notes = [[3, 'NaT — дата неизвестна'], [1, 'NaN — сумма неизвестна']]; break;
      case 2:
        naMarks(); S.rows.forEach(r => { if (r.i !== 1 && r.i !== 8) mark(r.i, 'amt', 'on'); });
        S.code = 'df["amount"].mean()'; S.out = p > .35 ? '182199.0   # по 10 суммам из 12' : '';
        if (p > .5) S.notes = [[8, 'сумма пропущена при расчёте']]; break;
      case 3:
        row(6).cls = 'dup'; row(7).cls = 'dup'; S.code = 'df.duplicated()'; S.out = p > .35 ? 'True только у второй копии 1047' : '';
        if (p > .45) S.notes = [[7, 'все поля совпадают']]; break;
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
        if (p < .5) { S.hud = ST.dedup; mark(5, 'amt', 'big'); S.out = p > .2 ? '1041: 2378 ₽ за товар · 1046: 1790000 ₽ за товар' : ''; S.notes = p > .2 ? [[0, 'около 2 378 ₽ за товар']] : []; }
        else { S.hud = ST.fixed; S.typo = true; mark(5, 'amt', 'na'); S.log = 3; S.out = '1046: цена за товар > 50 000 ₽ → amount = NaN'; S.notes = [[0, 'цена в пределах нормы'], [5, 'ошибка ввода → NaN']]; S.mob = ['tab', 'log']; }
        break;
      case 8:
        dropDup(); S.typo = true; S.log = 3; S.code = 'df.dropna(subset=["amount"])'; S.mob = ['tab', 'board'];
        NAROWS.forEach(i => mark(i, 'amt', 'na'));
        if (p < .55) { S.hud = ST.fixed; NAROWS.forEach(i => { row(i).cls = 'strike'; }); }
        else { S.hud = ST.drop; S.rows = S.rows.filter(r => !NAROWS.includes(r.i)); S.cards = 1; S.cardOn = 'drop'; S.out = 'строк: 11 → 8'; S.call = ['board', 'у трёх заказов потеряны и другие поля']; }
        break;
      case 9:
        dropDup(); S.typo = true; S.log = 3; S.code = 'df["amount"].fillna(df["amount"].median())'; S.cards = 1; S.mob = ['tab', 'board'];
        if (p < .4) { S.hud = ST.fixed; NAROWS.forEach(i => mark(i, 'amt', 'na')); }
        else { S.hud = ST.fill; S.fill = true; NAROWS.forEach(i => mark(i, 'amt', 'fill')); S.out = 'медиана 3115.0 → в три пустые ячейки'; }
        if (p > .6) { S.cards = 2; S.cardOn = 'fill'; S.call = ['board', 'сумма выросла на 9 345 ₽']; }
        break;
      case 10:
        dropDup(); S.typo = true; S.log = 3; S.cards = 2; S.hud = ST.flag; S.code = 'df["amount_missing"] = df["amount"].isna()'; S.mob = ['tab', 'board'];
        NAROWS.forEach(i => mark(i, 'amt', 'na'));
        if (p > .3) { S.flagCol = true; S.out = 'True у 1042, 1046, 1048'; }
        if (p > .6) { S.cards = 3; S.cardOn = 'flag'; S.log = 4; S.notes = [[5, 'сумма неизвестна, строка сохранена']]; }
        break;
      case 11:
        dropDup(); S.typo = true; S.log = 4; S.cards = 3; S.hud = ST.flag; S.flagCol = true; S.logOn = true; S.mob = ['board', 'log'];
        NAROWS.forEach(i => mark(i, 'amt', 'na'));
        S.code = 'pd.DataFrame(log)'; S.out = '4 записи: что нашли, что сделали, сколько строк';
        if (p > .35) S.call = ['log', 'приложите журнал к отчёту'];
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
      { title: 'Двенадцать строк выгрузки', dur: 3400, body: '<p>В таблице показаны заказы с&nbsp;номерами от&nbsp;1041 до&nbsp;1051. Для одного заказа в&nbsp;выгрузке есть две строки. Столбец <b>items</b> содержит число товаров, <b>amount</b> — сумму заказа.</p><p>Среднее по&nbsp;известным суммам составляет 182&nbsp;199&nbsp;₽, медиана — 3&nbsp;240&nbsp;₽. Посмотрим, откуда взялась такая разница.</p>' },
      { title: 'Пропуски в трёх столбцах', dur: 3400, body: '<p>В&nbsp;этом фрагменте пропущены две суммы, одна дата и&nbsp;один бренд. В&nbsp;столбце дат пропуск обозначен как <b>NaT</b>, а&nbsp;в&nbsp;столбцах суммы и&nbsp;бренда — как <b>NaN</b>.</p><p>Метод <b>isna()</b> находит все четыре пропуска независимо от&nbsp;типа столбца.</p>' },
      { title: 'Среднее по десяти известным суммам', dur: 3400, body: '<p>При сложении числа с&nbsp;NaN результатом будет NaN. Метод <b>mean()</b> по&nbsp;умолчанию пропускает отсутствующие значения.</p><p>Из&nbsp;двенадцати строк в&nbsp;расчёт вошли десять. Чтобы проверить их&nbsp;число, вызовите <b>df["amount"].count()</b>.</p>' },
      { title: 'Две записи о заказе 1047', dur: 3000, body: '<p>Строки заказа 1047 совпадают по&nbsp;всем полям. Заказ загрузили дважды, поэтому для отчёта достаточно одной записи.</p><p>По&nbsp;умолчанию <b>duplicated()</b> отмечает True только у&nbsp;повторных вхождений. В&nbsp;нашем фрагменте это вторая строка заказа 1047.</p>' },
      { title: 'После удаления дубликата', dur: 3200, body: '<p>Метод <b>drop_duplicates()</b> оставил 11 строк. Повторная сумма 3&nbsp;310&nbsp;₽ исчезла из&nbsp;расчёта. Она была ниже среднего, поэтому среднее выросло до&nbsp;202&nbsp;076&nbsp;₽.</p><p>В&nbsp;журнале отметим, какую строку удалили и&nbsp;почему.</p>' },
      { title: '1 790 000 ₽ за один товар', dur: 3400, body: '<p>У&nbsp;заказа 1046 указана сумма 1&nbsp;790&nbsp;000&nbsp;₽, а&nbsp;остальные известные суммы лежат между 730 и&nbsp;9&nbsp;510&nbsp;₽. Поэтому при среднем выше 200&nbsp;000&nbsp;₽ медиана равна всего 3&nbsp;170&nbsp;₽.</p><p>Чтобы решить, как поступить с&nbsp;таким <b>выбросом</b>, проверим, сколько товаров было в&nbsp;заказе и&nbsp;сколько они могли стоить.</p>' },
      { title: 'Какие суммы выходят за границы IQR', dur: 3600, body: '<p>Первый <b>квартиль</b> равен 2&nbsp;630&nbsp;₽, третий — 4&nbsp;660&nbsp;₽. Межквартильный размах равен разнице между ними, 2&nbsp;030&nbsp;₽. Верхняя граница по&nbsp;правилу Тьюки составляет 4&nbsp;660 + 1,5 × 2&nbsp;030 = 7&nbsp;705&nbsp;₽.</p><p>За&nbsp;этой границей оказались заказы 1041 на&nbsp;9&nbsp;510&nbsp;₽ и&nbsp;1046 на&nbsp;1&nbsp;790&nbsp;000&nbsp;₽.</p>' },
      { title: 'Проверяем цену товара', dur: 3800, body: '<p>В&nbsp;заказе 1041 четыре товара на&nbsp;9&nbsp;510&nbsp;₽. Это около 2&nbsp;378&nbsp;₽ за&nbsp;штуку, обычная для магазина цена. Оставляем заказ в&nbsp;таблице.</p><p>В&nbsp;заказе 1046 один товар стоит дороже допустимых в&nbsp;этом магазине 50&nbsp;000&nbsp;₽. Точную сумму по&nbsp;этой записи восстановить нельзя. Заменяем её на&nbsp;NaN. Теперь в&nbsp;столбце amount три пропуска.</p>' },
      { title: 'Удаляем строки без суммы', dur: 3400, body: '<p>Если применить <b>dropna(subset=["amount"])</b>, останутся восемь строк. Среднее по&nbsp;ним — 3&nbsp;585&nbsp;₽.</p><p>Из&nbsp;любой последующей группировки исчезнут все три заказа с&nbsp;пропущенной суммой. Например, у&nbsp;бренда «Сова» окажется на&nbsp;два заказа меньше.</p>' },
      { title: 'Заполняем пропуски медианой', dur: 3400, body: '<p>Вернёмся к&nbsp;11 строкам. Подставим медиану 3&nbsp;115&nbsp;₽ в&nbsp;три пустые ячейки с&nbsp;помощью <b>fillna()</b>. Теперь среднее по&nbsp;всем 11 заказам равно 3&nbsp;457&nbsp;₽.</p><p>Общая сумма выросла на&nbsp;9&nbsp;345&nbsp;₽. Эта прибавка целиком состоит из&nbsp;подставленных значений.</p>' },
      { title: 'Отмечаем пропуски', dur: 3400, body: '<p>Оставим все 11 строк и&nbsp;запишем в&nbsp;<b>amount_missing</b>, у&nbsp;каких заказов пропущена сумма. Среднее и&nbsp;медиана по-прежнему рассчитаны по&nbsp;восьми известным значениям.</p><p>Теперь в&nbsp;отчёте можно отдельно указать, по&nbsp;скольким заказам известна сумма, и&nbsp;посчитать все заказы по&nbsp;брендам.</p>' },
      { title: 'Что записать в журнал', dur: 4400, next: 'Читать страницу', body: '<p>Удаление трёх строк и&nbsp;добавление флага дали одинаковое среднее, 3&nbsp;585&nbsp;₽. При этом в&nbsp;первом случае в&nbsp;таблице восемь заказов, а&nbsp;во&nbsp;втором — одиннадцать. После заполнения медианой среднее составило 3&nbsp;457&nbsp;₽.</p><p>В&nbsp;<b>журнале очистки</b> укажите, что обнаружили, какое решение приняли и&nbsp;сколько строк оно затронуло. Так коллега сможет проверить ваш отчёт.</p>' }
    ],
    hud: [{ id: 'rows', label: 'Строк' }, { id: 'mean', label: 'Среднее, ₽' }, { id: 'med', label: 'Медиана, ₽' }],
    legend: '<span><i style="background:#f2756a"></i>пропуск</span><span><i style="background:#a48af0"></i>дубликат</span><span><i style="background:#f0a247"></i>выброс</span><span><i style="background:#36b8a6"></i>заполнено</span>',
    info: 'ОЧИСТКА',
    aiNote: 'Анимация показывает 12 строк выгрузки со столбцами order_id, date, brand, items и amount. У заказов 1042 и 1048 пропущена сумма, у 1044 отсутствует дата, у 1045 — бренд. Среднее по десяти известным суммам равно 182 199 ₽, медиана — 3 240 ₽. После удаления повторной записи о заказе 1047 осталось 11 строк, среднее выросло до 202 076 ₽. Верхняя граница по IQR равна 7 705 ₽. Заказ 1041 на 9 510 ₽ за четыре товара оставили. В заказе 1046 сумма за один товар (1 790 000 ₽) превышает предельную цену магазина (50 000 ₽). Её заменили на NaN. Если удалить три строки с пропусками, остаются восемь заказов со средним 3 585 ₽. Если подставить медиану 3 115 ₽, среднее по 11 заказам составит 3 457 ₽, а общая сумма увеличится на 9 345 ₽. Флаг amount_missing сохраняет все 11 строк и среднее по восьми известным суммам. Решения записаны в журнал.',
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
          const cards = CARDS.slice(0, S.cards).map(c => `<div class="cs-card${S.logOn ? ' mini' : ''}${c.id === S.cardOn ? ' on' : ''}${fresh('card' + c.id)}"><b>${esc(c.t)}</b><span class="cs-sum">${c.r} строк · среднее ${sp(c.m)} ₽</span><div class="cs-kv"><span>строк <i>${c.r}</i></span><span>среднее <i>${sp(c.m)}</i></span><span>медиана <i>${sp(c.md)}</i></span><span>сумма, ₽ <i>${sp(c.s)}</i></span></div><small>${esc(c.note)}</small></div>`).join('');
          const board = `<div class="cs-p cs-board${mh('board')}"><div class="cs-hd"><span>Три решения</span><span class="cs-tag">amount</span></div><div class="cs-cards">${cards || '<p class="cs-empty">появятся на шаге 9</p>'}</div>${call('board')}</div>`;
          const logs = LOG.slice(0, S.log).map(e => `<div class="cs-e${fresh('log' + e.id)}"><b>${esc(e.a)}</b><i>${esc(e.n)}</i><span>${esc(e.b)}</span></div>`).join('');
          const log = `<div class="cs-p cs-log${S.logOn ? ' on' : S.cards ? ' compact' : ''}${mh('log')}"><div class="cs-hd"><span>Журнал очистки</span><span class="cs-tag">log</span></div><div class="cs-lg">${logs || '<p class="cs-empty">записей пока нет</p>'}</div>${call('log')}</div>`;
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
  const MNAME = { mcar: 'суммы скрыты у случайных заказов', mnar: 'чаще скрыты крупные суммы' };

  function buildCost(box, api) {
    const { $, esc, fmt, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Как пропуски меняют среднее и корреляцию <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="cw-reset">Сбросить</button></div></div>
<p class="hint cw-do">Выберите долю пропусков и способ обработки. Серые кольца показывают исходные суммы заказов, которые мы временно скрыли.</p>
<div class="cw-ctrls">
<div class="cw-c"><span class="cw-l">У каких заказов скрыта сумма</span><span class="seg" role="group" aria-label="Механизм пропусков"><button type="button" data-m="mcar">Случайные заказы</button><button type="button" data-m="mnar">Чаще крупные</button></span></div>
<div class="cw-c"><label class="cw-l" for="cw-p">Доля пропусков</label><span class="krange"><input type="range" id="cw-p" min="0" max="60" step="5" value="40"><b id="cw-pv"></b></span></div>
<div class="cw-c cw-wide"><span class="cw-l">Способ обработки</span><span class="seg cw-seg" role="group" aria-label="Решение">${STRATS.map(([s, t]) => `<button type="button" data-s="${s}">${t}</button>`).join('')}</span></div>
</div>
<div class="stage"><div class="cw-left"><div class="cw-plot" id="cw-plot"></div><div class="cw-leg"><span><i class="o"></i>известная сумма</span><span><i class="g"></i>исходная скрытая сумма</span><span><i class="f"></i>подставленная сумма</span><span><i class="lt"></i>исходное среднее</span><span><i class="lm"></i>среднее после обработки</span><span><i class="ld"></i>медиана после обработки</span></div></div>
<div class="narr"><p class="cap">До и после обработки</p><div class="cw-read" id="cw-read"></div><div class="narr-text" id="cw-msg"></div><p class="cap">Задания</p><ol class="steps cw-tasks" id="cw-tasks"></ol></div></div>
<div class="status"><span><span class="dot live"></span><span id="cw-s1"></span></span><span id="cw-s2"></span><span class="grow"></span><span id="cw-s3"></span></div>`;
    const TASKS = [
      'Скройте суммы у 40% или более случайных заказов. При каком способе обработки корреляция окажется самой низкой?',
      'При доле пропусков от 20% найдите способ заполнения, который учитывает число товаров в заказе. Сравните корреляцию с исходной.',
      'Выберите «Чаще крупные». При доле пропусков от 40% попробуйте все пять способов. Удалось ли получить исходное среднее?'
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
      host.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Сумма заказа в рублях в зависимости от числа товаров. Скрытые суммы: ${R.k} из ${N}">${g}${pts}${ln(TRUTH.mean, 'lt')}${ln(R.median, 'ld')}${ln(R.mean, 'lm')}<text class="cw-ax ttl" x="${L - 6}" y="${T + ph + 33}" text-anchor="end">${narrow ? '' : 'товаров'}</text></svg>`;
    }

    function message(R) {
      const k = R.k, tr = TRUTH;
      if (!k) return 'Все суммы известны. Среднее, медиана и корреляция совпадают с исходными значениями. Сдвиньте ползунок вправо, чтобы скрыть часть сумм.';
      const bias = s.mech === 'mnar' ? ` В этом режиме чаще скрыты крупные суммы. Отклонение среднего от исходного составляет ${dPct(R.mean, tr.mean)}.` : '';
      const sig = `Среднее число товаров в заказе со скрытой суммой — ${fmt(R.missItems, 2)}, с известной — ${fmt(R.keepItems, 2)}.`;
      switch (s.strat) {
        case 'drop': return `<b>dropna</b> удаляет ${k} ${plural(k, ['строку', 'строки', 'строк'])}. Осталось строк: ${N - k}. Удалённые заказы больше не попадут в отчёты по брендам, странам или каналам.${bias}`;
        case 'mean': return `Все пропуски заполнены средним по известным суммам (${money(R.fill.find(v => v != null))}). На графике ромбы лежат на одной горизонтали при любом числе товаров. Корреляция после заполнения — ${fmt(R.corr, 2)}, исходная — ${fmt(tr.corr, 2)}.${bias}`;
        case 'median': return `Вместо каждого пропуска подставлена медиана известных сумм (${money(R.fill.find(v => v != null))}). На графике ромбы лежат на одной горизонтали. Корреляция после заполнения — ${fmt(R.corr, 2)}, исходная — ${fmt(tr.corr, 2)}.${bias}`;
        case 'group': return `В каждом заказе со скрытой суммой подставлена медиана заказов с тем же числом товаров. Корреляция после заполнения — ${fmt(R.corr, 2)}, исходная — ${fmt(tr.corr, 2)}.${R.corr > tr.corr + .02 ? ' Получилась более сильная связь. Внутри каждой группы подставленные суммы совпадают.' : ''}${bias}`;
        default: return `Все ${N} заказов остались в таблице. Флаг показывает, у каких заказов нет суммы. Среднее и медиана рассчитаны по известным суммам (их ${N - k}), как при удалении строк. ${sig}`;
      }
    }

    function render() {
      const R = calc(s.mech, s.strat, s.pct), tr = TRUTH;
      box.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === s.mech)));
      box.querySelectorAll('[data-s]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.s === s.strat)));
      $('cw-p').value = s.pct; $('cw-pv').textContent = pctTxt(s.pct);
      plot(R);
      const row = (lbl, v, t, d, cls) => `<div class="cw-r"><span class="lb">${lbl}</span><b>${v}</b><span class="tr">исходно ${t}</span><em class="${cls}">${d}</em></div>`;
      $('cw-read').innerHTML = row('Среднее', money(R.mean), money(tr.mean), dPct(R.mean, tr.mean), tone(R.mean, tr.mean, true))
        + row('Медиана', money(R.median), money(tr.median), dPct(R.median, tr.median), tone(R.median, tr.median, true))
        + row('Корреляция с числом товаров', fmt(R.corr, 2), fmt(tr.corr, 2), dAbs(R.corr, tr.corr), tone(R.corr, tr.corr, false))
        + row('Строк в таблице', String(R.rows), String(N), R.rows < N ? `−${N - R.rows}` : '0', R.rows < N ? 'bad' : 'ok');
      $('cw-msg').innerHTML = message(R);
      // задания
      if (s.mech === 'mcar' && s.pct >= 40) { const lo = STRATS.map(([id]) => [id, calc('mcar', id, s.pct).corr]).sort((a, b) => a[1] - b[1])[0][0]; if (s.strat === lo) s.done[0] = true; }
      if (s.strat === 'group' && s.pct >= 20) s.done[1] = true;
      if (s.mech === 'mnar' && s.pct >= 40) { s.seen.add(s.strat); if (s.seen.size === STRATS.length) s.done[2] = true; }
      $('cw-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t)}</li>`).join('');
      $('cw-s1').textContent = `Пропусков: ${R.k} из ${N}`;
      $('cw-s2').textContent = s.mech === 'mcar' ? 'случайный выбор заказов' : 'чаще скрыты крупные суммы';
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
        return `${MNAME[s.mech]}. Доля пропусков ${s.pct}%. Способ обработки — ${SNAME[s.strat]}. Среднее после обработки ${money(R.mean)}, исходное ${money(tr.mean)}. Медиана ${money(R.median)}, исходная ${money(tr.median)}. Корреляция с числом товаров ${fmt(R.corr, 2)}, исходная ${fmt(tr.corr, 2)}. В таблице ${R.rows} из ${N} строк. Выполнено заданий: ${s.done.filter(Boolean).length} из 3.`;
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
    aiData: 'Учебная выгрузка orders_raw.csv содержит 207 строк за январь–март 2026 года. Магазин продаёт четыре бренда в Беларуси, России, Казахстане и Узбекистане. В данных есть пропуски, повторные записи о заказах, несколько вариантов написания названий брендов и ошибочная сумма 1 790 000 ₽ за один товар.',
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
        note: `В pandas 3 столбцы с текстом по умолчанию получают тип str. Из 207 строк dropna() оставил 163. Если проверять только сумму, останется 195 строк.` },
      dedup: { title: `Как оставить последний статус заказа`, badge: `проверено: Python 3.13, pandas 3.0.5`, lang: 'python', outLabel: `Вывод`,
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
        note: `Три строки полностью совпадают с предыдущими. Ещё в четырёх сохранён прежний статус заказа. Два шага очистки позволяют отдельно учесть эти причины в журнале.` },
      iqr: { title: `Отбор по IQR и проверка цены товара`, badge: `проверено: Python 3.13, pandas 3.0.5`, lang: 'python', outLabel: `Вывод`,
        code: `q1, q3 = df["amount"].quantile([0.25, 0.75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
df["amount_outlier"] = df["amount"].notna() & ~df["amount"].between(low, high)
print(f"Q1 = {q1:.0f}, Q3 = {q3:.0f}, IQR = {iqr:.0f}, границы: {low:.0f} … {high:.0f}")

per_item = df["amount"] / df["items"]           # средняя цена одного товара в заказе
cols = ["order_id", "items", "amount"]
print(df.loc[df["amount_outlier"], cols].assign(за_товар=per_item.round()).to_string(index=False))

z = (df["amount"] - df["amount"].mean()) / df["amount"].std()
print("|z| > 3:", df.loc[z.abs() > 3, "order_id"].tolist())

typo = per_item > 50_000                         # предельная цена одного товара в учебном магазине
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
        note: `В этой выгрузке суммы положительны, а нижняя граница по IQR равна −2 805 ₽. Поэтому все 12 отмеченных заказов лежат выше верхней границы. После проверки заменили на NaN сумму заказа 1046 и сохранили флаг у остальных одиннадцати.` },
      strings: { title: `Нормализация брендов и журнал очистки`, badge: `проверено: Python 3.13, pandas 3.0.5`, lang: 'python', outLabel: `Вывод`,
        code: `raw = df["brand"]
brand = (raw.str.strip()
            .str.lower()
            .str.replace(r"[^а-яёa-z0-9\\s]", "", regex=True)  # сохраняем указанные буквы, цифры и пробельные символы
            .str.replace(r"\\s+", " ", regex=True)             # заменяем группы пробельных символов одним пробелом
            .str.strip()
            .str.capitalize())
print("написаний бренда:", raw.nunique(), "→", brand.nunique())
print(raw[brand == "Луч"].unique().tolist())

changed = raw.notna() & (raw != brand)          # сравниваем только известные названия
log.append(("написание бренда", "strip, lower, регулярные выражения", int(changed.sum())))
log.append(("пустой бренд", "«неизвестно»", int(brand.isna().sum())))
log.append(("пустой канал", "«неизвестно»", int(df["channel"].isna().sum())))
log.append(("пропуск в amount", "флаг amount_missing", int(df["amount"].isna().sum())))
df["brand"] = brand.fillna("неизвестно")
df["channel"] = df["channel"].fillna("неизвестно")
df["amount_missing"] = df["amount"].isna()       # сохраняем отметку об отсутствующей сумме

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
        note: `В этом примере pandas использует PyArrow для строк. В регулярных выражениях его движка класс \\w охватывает латинские буквы ASCII, цифры и подчёркивание. Шаблон [^\\w\\s] удалил бы кириллицу в наших названиях брендов. Чтобы сохранить русские буквы, перечисляем их в шаблоне явно.` }
    },
    questions: {
    q1: { sec: 'missing', title: 'Сначала предскажите', q: 'В учебном примере у 40% случайно выбранных заказов скрыли сумму, а затем заполнили пропуски общей медианой. Как изменится корреляция суммы и числа товаров?', opts: [['Останется прежней, поскольку медиана устойчива к выбросам'], ['Уменьшится, поскольку для любого числа товаров подставили одну и ту же сумму', 1], ['Увеличится, поскольку разброс сумм уменьшился'], ['Станет отрицательной']],
      why: 'У каждого из 80 заказов со скрытой суммой теперь одна и та же сумма независимо от количества товаров. На графике все подставленные значения лежат на одной горизонтали. В этой выборке корреляция снизилась с 0,76 до 0,62. Величину и знак изменения можно проверить в интерактиве.' },
    q2: { sec: 'idea', q: 'В анимации после удаления строк и после добавления флага среднее одинаково и равно 3 585 ₽. Чем различаются результаты?', opts: [['В таблицах одинаковое число заказов'], ['После удаления осталось 8 заказов, а с флагом сохранились все 11, в том числе даты, бренды и число товаров для трёх заказов без суммы', 1], ['Флаг заполнил три пропуска медианой'], ['После удаления строк известные суммы стали точнее']],
      why: 'Оба расчёта используют восемь известных сумм. Метод dropna удаляет строки целиком, поэтому три заказа исчезают и из последующей группировки по бренду. Флаг позволяет учесть все заказы и отдельно указать, по скольким из них известна сумма.' },
    q3: { sec: 'idea', q: 'В числовом столбце amount пропущены 12 сумм. Почему эта команда возвращает пустую таблицу?', code: 'df[df["amount"] == np.nan]', lang: 'python', opts: [['Пропуски в этом столбце представлены строкой «NaN»'], ['Для значений float64 сравнение с np.nan даёт False даже там, где хранится NaN', 1], ['Чтобы найти пропуск, нужно добавить кавычки вокруг np.nan'], ['Перед сравнением pandas удаляет строки с пропусками']],
      why: 'В этом примере столбец имеет тип float64. Даже np.nan == np.nan возвращает False, поэтому в маске нет ни одного значения True. Для отбора используйте df[df["amount"].isna()]. Сравнение с текстом «NaN» тоже не найдёт числовой пропуск.' },
    q4: { sec: 'missing', q: 'Какие строки удалит df.dropna() без параметров из исходной учебной выгрузки?', opts: [['Только 12 строк с неизвестной суммой'], ['Все 44 строки с пропуском хотя бы в одном столбце', 1], ['Только строки, в которых пропущены все значения'], ['Вместо строк исчезнут столбцы с пропусками']],
      why: 'В выгрузке 28 строк без канала, 12 без суммы, 5 без бренда и 3 без даты. Часть этих пропусков приходится на одни и те же строки. Всего dropna() удаляет 44 строки из 207. Если стоит задача исключить только неизвестные суммы, dropna(subset=["amount"]) оставит 195 строк.' },
    q5: { sec: 'missing', q: 'Платёжная система чаще теряет крупные суммы. Что произойдёт, если подставить во все пропуски медиану известных сумм?', opts: [['Уменьшится число заказов'], ['Медиана известных сумм будет плохо представлять пропущенные крупные суммы, и средняя сумма заказа может оказаться заниженной', 1], ['Целочисленные суммы пропадут, поскольку их нельзя заполнять медианой'], ['Медиана восполнит крупные суммы, поскольку устойчива к выбросам']],
      why: 'Если вероятность пропуска зависит от суммы, среди известных значений крупные заказы представлены реже. В нашем примере при 40% пропусков заполнение общей медианой даёт среднюю сумму на 36% ниже исходной. Флаг поможет сопоставить заказы с пропуском и без него. Чтобы восстановить фактические суммы, понадобятся дополнительные данные.' },
    q6: { sec: 'code', q: 'У заказа 1022 есть запись paid от 8 января и cancelled от 10 января. Какая запись останется после выполнения кода?', code: 'df.sort_values("updated_at").drop_duplicates("order_id", keep="last")', lang: 'python', opts: [['paid от 8 января, поскольку drop_duplicates всегда оставляет первую строку'], ['cancelled от 10 января, поскольку после сортировки это последняя запись для заказа 1022', 1], ['Сохранятся обе записи, поскольку у них различаются статусы'], ['Обе записи исчезнут, поскольку номер повторяется']],
      why: 'Строки отсортированы по времени обновления от раннего к позднему. Метод drop_duplicates сравнивает только order_id и при keep="last" сохраняет последнюю запись с этим номером. Поэтому останется cancelled от 10 января. Чтобы удалить все строки с повторяющимся ключом, используют keep=False.' },
    q7: { sec: 'outliers', q: 'Правило IQR отметило заказы 1192 (14 440 ₽ за четыре товара) и 1046 (1 790 000 ₽ за один товар). В магазине единица товара стоит не дороже 50 000 ₽. Как обработать эти записи?', opts: [['Удалить оба заказа, поскольку суммы за верхней границей'], ['Оставить заказ 1192 с флагом. Для 1046 проверить сумму по первоисточнику, а если уточнить её нельзя, поставить NaN и сделать запись в журнале', 1], ['Заменить обе суммы верхней границей по IQR, 8 755 ₽'], ['Сохранить обе суммы и снять флаги']],
      why: 'В заказе 1192 средняя цена товара составляет 3 610 ₽. Такая покупка укладывается в обычный диапазон цен магазина. В заказе 1046 всего один товар, а его стоимость превышает установленный предел. Проверка IQR указала на оба заказа, но причина заменить сумму нашлась только во втором.' }
    },
    glossary: {
      missing: { t: 'Пропуск', en: 'missing value', d: 'Отсутствующее значение в ячейке. В зависимости от типа столбца pandas распознаёт NaN, NaT, pd.NA и None.' },
      duplicate: { t: 'Дубликат', en: 'duplicate', d: 'Повторная запись об одном наблюдении. Дубликаты можно искать по всем столбцам или по выбранному ключу.' },
      outlier: { t: 'Выброс', en: 'outlier', d: 'Значение, которое заметно отличается от большинства наблюдений. Причиной может быть как ошибка записи, так и редкое событие.' },
      cleanlog: { t: 'Журнал очистки', en: 'cleaning log', d: 'Записи о том, какие изменения внесли в данные, почему приняли эти решения и сколько строк они затронули.' },
      nan: { t: 'NaN', en: 'Not a Number', d: 'Специальное значение чисел с плавающей точкой. В числовом столбце может обозначать пропуск. При сложении с NaN результат тоже NaN. Сравнение NaN с самим собой даёт False.' },
      nat: { t: 'NaT', en: 'Not a Time', d: 'Обозначение пропуска в столбцах с датами, временем или длительностями.' },
      none: { t: 'None', en: 'None', d: 'Объект Python, который обозначает отсутствие значения. При создании столбца pandas может сохранить None или заменить его маркером пропуска для выбранного типа.' },
      strdtype: { t: 'Тип str', en: 'string dtype', d: 'Тип по умолчанию для текстовых данных в pandas 3. Использует NaN для отсутствующих значений.' },
      isna: { t: 'isna() и notna()', en: 'isna, notna', d: 'Методы для проверки ячеек. isna() возвращает True для пропуска, notna() — для известного значения.' },
      median: { t: 'Медиана', en: 'median', d: 'Центральное значение упорядоченного числового ряда. При чётном количестве значений берут среднее двух центральных.' },
      robust: { t: 'Устойчивая статистика', en: 'robust statistic', d: 'Показатель, сравнительно слабо меняющийся при появлении отдельных крайних значений. Пример — медиана.' },
      imputation: { t: 'Заполнение пропусков', en: 'imputation', d: 'Замена неизвестного значения оценкой, например медианой известных сумм в группе.' },
      flag: { t: 'Флаг пропуска', en: 'missing indicator', d: 'Дополнительный столбец, в котором True отмечает строки с пропущенным исходным значением.' },
      mech: { t: 'Механизм пропусков', en: 'missingness mechanism', d: 'Зависимость вероятности пропуска от наблюдаемых и ненаблюдаемых данных. По характеру этой зависимости различают MCAR, MAR и MNAR.' },
      corr: { t: 'Корреляция', en: 'Pearson correlation', d: 'Коэффициент от −1 до 1, который описывает направление и силу линейной связи между двумя числовыми величинами. Для постоянной величины коэффициент не определён.' },
      key: { t: 'Ключ', en: 'key', d: 'Столбец или сочетание столбцов, по которым можно однозначно определить наблюдение. В отчёте по заказам это номер заказа.' },
      quartile: { t: 'Квартиль', en: 'quartile', d: 'Один из трёх порогов, соответствующих 25-му, 50-му и 75-му процентилям ряда. Второй квартиль равен медиане.' },
      iqr: { t: 'Межквартильный размах', en: 'interquartile range, IQR', d: 'Разность между третьим и первым квартилями (Q3 − Q1). Показывает разброс центральной половины данных.' },
      zscore: { t: 'z-оценка', en: 'z-score', d: 'Разность между значением и средним, делённая на стандартное отклонение. Знак показывает, по какую сторону от среднего находится значение.' },
      masking: { t: 'Маскировка', en: 'masking', d: 'Ситуация, когда одно крайнее значение изменяет среднее и стандартное отклонение настолько, что другие выбросы перестают превышать порог по модулю z-оценки.' },
      normalize: { t: 'Нормализация строк', en: 'string normalization', d: 'Приведение вариантов написания к общей форме, например удаление пробелов по краям и перевод букв в нижний регистр.' },
      regex: { t: 'Регулярное выражение', en: 'regular expression, regex', d: 'Шаблон для поиска текста. Например, \\s+ обозначает один или несколько пробельных символов, а [^а-яё] — любой символ, кроме строчной русской буквы.' }
    },
    materials: [
      ['da-2-3-cleaning.md', 'Текст урока, код, вопросы и глоссарий в формате Markdown'],
      ['data/orders_raw.csv', '207 строк с пропусками, повторными записями и ошибочной суммой'],
      ['data/orders_true.csv', 'Полные данные по 200 заказам для сравнения способов обработки пропусков'],
      ['clean_orders.ipynb', 'Ноутбук с четырьмя шагами очистки и журналом изменений'],
      ['cost_of_missing.py', 'Сравнение пяти способов обработки пропусков на pandas'],
      ['gen_data.py', 'Генератор двух учебных выгрузок с фиксированными параметрами случайности']
    ],
    prompts: [
      ['План очистки моей выгрузки', 'Я пришлю число пропусков по столбцам и число полных дубликатов. Уточни, что означает одна строка, для какого отчёта мне нужны данные и почему могли пропасть значения. Предложи способ обработки для каждого столбца и объясни, как он повлияет на мой отчёт.'],
      ['Выброс или ошибка', 'Предложи по очереди пять заказов с необычной суммой. Укажи число товаров и диапазон цен в магазине. Дай мне решить, какие данные проверить и что записать в журнал. Затем разбери моё решение с опорой на материалы урока.'],
      ['Журнал очистки', 'Помоги оформить журнал для моего отчёта по образцу из урока. Спроси, какие строки я изменил, почему и как коллега сможет проверить результат.']
    ]
  };
})();
