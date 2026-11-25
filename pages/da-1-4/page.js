/* Страница 1.4 · Файлы, исключения и классы на базовом уровне */
(() => {
  /* ===================== Учебная выгрузка orders.csv =====================
     Заголовок и 1 200 заказов; строка файла 1 000 (заказ 999) сохранена в cp1251, остальное — в UTF-8.
     Файл сгенерирован в песочнице с random.Random(14). Здесь он сжат: на заказ три символа —
     категория (0–4) и сумма / 10 в base36; дата заказа i — 2026-01-01 + (i − 1) · 90 // 1200 дней. */
  const PACK = '0ic47u2lq2940jk39g3ka3c108b19t2nt2b34531gi25i0jd04b4af03726n3cb4db43i0ha4iy25z0m23fg18j3il1em2f223q0o308r24705f3424hi0cx3kb1g13ds2em3d93hr0843c11dm4eq0h01eq2h331d3cv0ap4ba38b29f4670ip4e623j33m06b21j0hi48v4np27z01t1mv10v17y48c17w1i029421q4hs1fa1b93br1bv4gk2ep41q1j43e623d2ns04j12d16u2eo34e4bn0n50842g83cq1dh13e1nt1500ju1j82hr4ku0h93e52e723022l4o802s3op02a12r0ne2231bm4530dm3n53l941e23527w2k74j740u4nh1lg0b004c3bp3962lf21n24q2gy26z4hg31k0da2h83nf4cu2k636i0bj37s3nz4491od16d2p007u0dq4290684jb2mv3dw1m00im0ku1l92dx1br0hy2ea1ma2ab3g12291i634m2ec2g00570fn0k82en2iw2bb14k06s4mq04k47b2oz3hn3o94nx25v27u4iw2ad4d401909i25p26h1434oz1bv2hq3403mv0da4mk0kv4o612i4ga1g94m74bj1fz04k2in3og0340gn47e13u1ea4e82bt42o24a4ag25j3el0it21y4do2190g136l1g70av4kt18t3291m80cv2ej1gp3564g839e1nr26z1kn0821fe06n16w38107h1141lv21t2gq17324o12b2o210w4ox3iw48m3do1m20ew1dr1l226i4hf24d3j031n3fy2cw2934a042t0al07u16737z3ew3mh30x3h21ku08z0fb4h31mn4ei3l53a82bp4ea2bu2b811c1ll24a3o03jp07g31h04r3j21hq1ki1bs06t24g0a522n46o03v0go0md1gs3520ad2h14np3if3og41a4eh02b03i36a4hs0nq13r2a10204li1oh3mq26318w2o23cm1en1fe1n44f018l35e0353ac35y1nd4fs39t2cx4al02921x4fc11n41b0a70fw1mh2i13bo3h41a836a04k4bk36f24c2io0hq2iu48g48z37s0lx4ix33y3453bw24723b2j619o1oi09z3kv3m808t49449644k2gs28433c0dl3mg20u2j838s2l615908h4ie45l1m83hz1l14c82bv39q03q4f239y07g35o3dk0gy2nl2i52e83ly38o2e335y2lj1dq3ln3jr4h938n11z39013x4720mn0la1h90hn1o20gg1em1h61kg11x3a311m4nt3dk44413k3781ls46l2eh25g1bd2es2fc1d62mi1812fk4jl42y0693c448w0hu0ku41b3er3ov16f0bf3fx04f2l03954973mu0100bx02j37q0gf12h48j35024c1jx2gj0a019805c4cn3gb3162fk4d10h74nx22o05l4ag42933x3o00g61hh1mz32n4of4ji0251b447o14o07r1kw1gz1ai2hm36s46102g33s3o52ll3483ep39u0b01fw0ln1am21k36r4cc0f624l02h17p03n4791mm2452im37f2ih1kl4m93353ei02u23y03v4120kt0273bk45y3l840y3lm1bv1811df3b04824483o10lt49z42l4ov1d94gc2fc2bs4704nh4al3142m242h43w4bd3kd43n05a4kk2364ke3o801d1jo2ms1e12er1dv0br4mj1hk1jm1974ee1co1k305l3ka3c42663m94593ep1ay4bk1hk1461ll4bw4n335t05g12q2lt4i91kc2j339j0lp4kr15d3mu1d41jj4i71k53bc35o2os06j34k0872h53341ie3fz3jo2ko0ok01q24x4ag10z2393dp3e84gt11046t42w2562lv0220fz2e41n62c34n51fr14g0md4862f41jx19n1801c228h37f4kb22h29d2nk2l043v4ih25y4os4lm2ld1em1i336811z3af2c32442f542545k4404b638a4gh0kl0au1131ae2og0bj3gk3972et29836z3be1oi3or0jd0a13dl3h930w46b2b00d02l50kr3c32ea1fm2kj0224o44m13152de4ni2cp12g3772m328535k46g0a74gp2ot13t0k02ad1no4ne4de1gi1me0fa01w36m44c15x01c1em12z4144531h600z1oa1f536e0h302507q1jp2nn04p22v24c2bu34y08p3e52k94no2ib31c3fx0cx46y2hj2aw09j3f349k4m941a0no0j201s2ev1fe2el1na15e3o204o35k2a44j52ly1at2bk45c0lv0b72n12lj1kl1eu3dh32a2j12bf44z2hj43d1hu2mo0be36u38k09742o31y0me32f0jv4gl15y2ab1c90bm33m43b4n30od03p0df1hk2im38w2dv4l826k1dz2651573o23np24532a0l50nr43u4832m61kz02z3by0n44nd1hh27w2h91cu2jp19o0d93m92e215n24501444c1ju11m1lj47v05f3m11es0jh4dt47r4je3dd43z3iu3mq1op0ah06i0nx0bg4ew2dm1e43ik11e3m44dt38n2dc37938u1134ny0901710d22d14bn2bp37v2jb2eu0fd2j128d2651jr4d11mi1nl4ca39n1o229305l33215y18r23y15w13o24b0gl3ee1lc17z01q45z3l141b2ku12d1md1ag09g0b428r3hs1d013o17w4900mh2fh4h707k0c94fj12p19808f17k18v4ic1kq0ba2bm21t1eb4it1gj1iv4cb1m634f15z0a33600db4f108322g0c83fy1aw47v3cw4eu1830oe39124w35y0om34i1ju0kf34404p20y3763nr3in14m4533eu2du4240cj3mi2cp1om1hk1jl17436x4gp4b40mw0do02m3dy17y1hn3m525k1os2cq3ef02i36v18t31s3d42jg0ha25x46b18q4j00hm3da02t37649p2ik2aa4jt09a4os1980ka0p03c40fl4hg4le3la01f4fv48l2c24620ib4n91kc0ev0j727f2bj14f2eo4763bj38r06w1nq2dr2n21204d82eg3di2e535625x3a741949d1mm0nw3jf0nn21q4hn2460m148m2163du1jl2g926x31z13o2974kb3ih2by0oz2ca4hc4id1le3ny2fr3gn0cd49a1fc1224ax07715t4go2hy3bd1n548g2fh1og2hm3843fa0dl1h22510n243o1nl1jt1jb32v0l231z36440w06o0g14gm3nn1jv0nw3bg3au2o049l28e15l2250nh07j4710be1hl4na';
  const CATS = ['Электроника', 'Дом и сад', 'Книги', 'Одежда', 'Игрушки'];
  const TOTAL = 1201, BAD = 1000;
  const DAY0 = Date.UTC(2026, 0, 1);
  const order = i => { const j = (i - 1) * 3; return { id: i, date: new Date(DAY0 + Math.floor((i - 1) * 90 / 1200) * 864e5).toISOString().slice(0, 10), cat: CATS[+PACK[j]], amt: parseInt(PACK.substr(j + 1, 2), 36) * 10 }; };
  const fileLine = n => n === 1 ? 'order_id,date,category,amount' : (o => `${o.id},${o.date},${o.cat},${o.amt}`)(order(n - 1));
  const BAD_TEXT = '999,2026-03-16,\uFFFD\uFFFD\uFFFD \uFFFD \uFFFD\uFFFD\uFFFD,7460';            // так строку 1 000 показывает редактор в UTF-8
  const BAD_BYTES = "b'999,2026-03-16,\\xc4\\xee\\xec \\xe8 \\xf1\\xe0\\xe4,7460\\n'";            // те же байты, как их печатает Python
  const ERRMSG = "'utf-8' codec can't decode byte 0xc4 in position 15: invalid continuation byte"; // настоящее сообщение из песочницы
  const fmtN = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const ease = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const cyc = (p, arr, sp = 34) => arr[Math.floor(Math.min(p, .999) * sp) % arr.length];
  const memAt = n => Math.max(0, n - 1 - (n >= BAD ? 1 : 0));   // заказов прочитано к строке n (без заголовка и битой)

  /* ===================== Сцена ===================== */
  // Номера строк — как в настоящих файлах из раздела «Код»; у класса и ноутбука номера не показываем
  const CODE = {
    plain: [[5, 'orders = []'], [6, 'with open(path, "rb") as f:'], [7, '    for n, raw in enumerate(f, start=1):'], [8, '        line = raw.decode("utf-8")'], [9, '        if n > 1:'], [10, '            orders.append(line.rstrip("\\n").split(","))']],
    try: [[5, 'orders, bad = [], []'], [6, 'with open(path, "rb") as f:'], [7, '    for n, raw in enumerate(f, start=1):'], [8, '        try:'], [9, '            line = raw.decode("utf-8")'], [10, '        except UnicodeDecodeError as e:'], [11, '            bad.append(n)'], [12, '            print(f"строка {n}: {e}")'], [13, '            continue'], [14, '        if n > 1:'], [15, '            orders.append(line.rstrip("\\n").split(","))']],
    cls: [[0, 'class Report:'], [0, '    def __init__(self, path, orders, bad_lines):'], [0, '        self.path = path'], [0, '        self.orders = orders'], [0, '        self.bad_lines = bad_lines'], [0, '    @classmethod'], [0, '    def from_csv(cls, path): ...  # цикл с try'], [0, '    def revenue(self): ...        # сумма заказов'], [0, '    def avg_check(self):'], [0, '        return self.revenue() / len(self.orders)'], [0, ''], [0, 'report = Report.from_csv("data/orders.csv")'], [0, 'report.avg_check()']],
    df: [[0, 'import pandas as pd'], [0, ''], [0, 'cols = ["order_id", "date", "category", "amount"]'], [0, 'df = pd.DataFrame(report.orders, columns=cols)'], [0, 'type(df)     # класс'], [0, 'df.shape     # атрибут'], [0, 'df.head()    # метод']]
  };
  const FILE_OF = { plain: ['read_orders.py', 'скрипт'], try: ['read_orders.py', 'скрипт'], cls: ['report.py', 'модуль'], df: ['ноутбук', 'ячейка'] };
  const TB = ['Traceback (most recent call last):', '  File "read_orders.py", line 8, in <module>', '    line = raw.decode("utf-8")', 'UnicodeDecodeError: ' + ERRMSG];
  const RUN = '$ python read_orders.py';
  const ENTRY = { n: 1000, err: 'UnicodeDecodeError', b: '0xc4' };

  function stateAt(k, p) {
    const S = { mode: 'plain', act: -1, n: 0, mem: 0, lost: 0, log: null, logOff: false, term: [], obj: { kind: 'vars', rows: [] }, call: null, bytes: false, err: false, collapsed: false, mob: ['file', 'code'] };
    const vars = () => { S.obj = { kind: 'vars', rows: [['path', "'data/orders.csv'"], ['orders', `список · ${fmtN(S.mem)}`]].concat(S.mode === 'try' ? [['bad', S.log && S.log.length ? '[1000]' : '[]']] : []) }; };
    switch (k) {
      case 0:
        S.call = p > .45 ? ['file', 'строка 1 000 — в cp1251', 1] : null; break;
      case 1:
        S.n = 1 + Math.round(ease(p) * 998); S.mem = memAt(S.n); S.act = cyc(p, [2, 3, 4, 5]); S.term = [RUN]; vars();
        S.call = p > .5 ? ['code', 'open вернул файловый объект'] : null; break;
      case 2:
        S.n = BAD; S.mem = memAt(BAD); S.act = 3; S.bytes = true; S.term = [RUN]; vars(); S.mob = ['file', 'code', 'term'];
        if (p > .45) { S.err = true; S.term = [RUN, 'UnicodeDecodeError: ' + ERRMSG]; S.call = ['file', 'C4 EE недопустимы в UTF-8', 1]; }
        break;
      case 3:
        S.n = BAD; S.err = true; S.bytes = true; S.lost = memAt(BAD); S.term = TB; S.mob = ['code', 'term', 'obj'];
        S.obj = { kind: 'vars', lost: true, rows: [['path', "'data/orders.csv'"], ['orders', `список · ${fmtN(S.lost)}`]] };
        S.call = p > .4 ? ['code', 'при выходе из with файл закрылся'] : null; break;
      case 4:
        S.mode = 'try'; S.log = []; S.n = 1 + Math.round(ease(p) * 998); S.mem = memAt(S.n); S.act = cyc(p, [2, 4, 9, 10]); S.term = [RUN]; vars();
        S.call = p > .5 ? ['code', 'обработчик UnicodeDecodeError'] : null; break;
      case 5:
        S.mode = 'try'; S.n = BAD; S.mem = memAt(BAD); S.bytes = true; S.mob = ['file', 'code', 'log'];
        S.act = p < .2 ? 4 : p < .4 ? 5 : p < .6 ? 6 : p < .8 ? 7 : 8;
        S.log = p >= .5 ? [ENTRY] : []; S.term = p >= .7 ? [RUN, 'строка 1000: ' + ERRMSG] : [RUN]; vars();
        S.call = p > .55 ? ['log', 'номер строки записан'] : null; break;
      case 6:
        S.mode = 'try'; S.log = [ENTRY]; S.collapsed = true; S.n = BAD + Math.round(ease(p) * 201); S.mem = memAt(S.n); S.mob = ['code', 'term'];
        S.act = p < .9 ? cyc(p, [2, 4, 9, 10]) : -1; vars();
        S.term = ['строка 1000: ' + ERRMSG].concat(p >= .9 ? ['заказов прочитано: 1199', 'пропущено строк: 1 [1000]', 'файл закрыт: True'] : []);
        S.call = p >= .9 ? ['term', '1 199 заказов, 1 пропущенная строка'] : null; break;
      case 7:
        S.mode = 'cls'; S.logOff = true; S.collapsed = true; S.act = p < .5 ? 0 : 1; S.obj = { kind: 'blue' }; S.mob = ['code', 'obj'];
        S.call = p > .4 ? ['obj', 'экземпляр пока не создан'] : null; break;
      case 8: {
        S.mode = 'cls'; S.logOff = true; S.collapsed = true; S.act = 11; S.mob = ['code', 'obj'];
        const ready = p >= .65;
        S.n = ready ? TOTAL : 1 + Math.round(Math.min(1, p / .6) * 1200); S.mem = memAt(S.n); S.log = S.n >= BAD ? [ENTRY] : [];
        S.obj = { kind: 'inst', ready };
        S.term = ['>>> report = Report.from_csv("data/orders.csv")'].concat(ready ? ['>>> report.bad_lines', '[1000]'] : []);
        S.call = p > .7 ? ['obj', 'у экземпляра свои значения'] : null; break;
      }
      case 9:
        S.mode = 'cls'; S.logOff = true; S.collapsed = true; S.n = TOTAL; S.mem = memAt(TOTAL); S.log = [ENTRY]; S.mob = ['code', 'obj'];
        S.act = p < .45 ? 12 : 9; S.obj = { kind: 'inst', ready: true, avg: p >= .45 };
        S.term = ['>>> report.avg_check()'].concat(p >= .45 ? ['4510.3586321934945'] : []);
        S.call = p > .55 ? ['code', 'self — это report'] : null; break;
      case 10:
        S.mode = 'df'; S.logOff = true; S.collapsed = true; S.n = TOTAL; S.mem = memAt(TOTAL); S.log = [ENTRY]; S.mob = ['code', 'obj', 'term'];
        S.act = p < .3 ? 3 : p < .55 ? 4 : p < .8 ? 5 : 6; S.obj = { kind: 'df' };
        S.term = ['>>> type(df)', "<class 'pandas.DataFrame'>"].concat(p >= .55 ? ['>>> df.shape', '(1199, 4)'] : []);
        S.call = p > .6 ? ['obj', 'df — экземпляр DataFrame'] : null; break;
    }
    return S;
  }

  function objHtml(o, esc) {
    const f = (n, v, x = '') => `<div class="rs-f${x}"><b>${n}</b><span>${esc(v)}</span></div>`;
    const m = (n, v = '') => `<div class="rs-m"><b>${n}</b><span>${esc(v)}</span></div>`;
    const sep = '<div class="rs-sep">методы</div>';
    if (o.kind === 'vars') return { cls: '', hd: 'Память скрипта', tag: '', body: o.rows.length ? o.rows.map(r => f(r[0], r[1], o.lost ? ' lost' : '')).join('') + (o.lost ? '<p class="rs-note">скрипт завершился до сохранения отчёта</p>' : '') : '<p class="rs-empty">пусто: скрипт ещё не запускали</p>' };
    if (o.kind === 'blue') return { cls: ' blue', hd: 'class Report', tag: 'определение класса', body: '<div class="rs-sep">атрибуты будущего отчёта</div>' + f('path', 'путь') + f('orders', 'заказы') + f('bad_lines', 'пропущенные строки') + sep + m('from_csv(path)', 'метод класса') + m('revenue()') + m('avg_check()') };
    if (o.kind === 'inst') { const v = x => o.ready ? x : '…'; return { cls: ' inst', hd: 'report', tag: o.ready ? 'экземпляр Report' : 'собирается…', body: f('path', v("'data/orders.csv'")) + f('orders', v('1 199 заказов')) + f('bad_lines', v('[1000]')) + sep + m('revenue()', o.avg ? '5 407 920 ₽' : '') + m('avg_check()', o.avg ? '4 510,36 ₽' : '') }; }
    return { cls: ' inst', hd: 'df', tag: 'экземпляр DataFrame', body: f('shape', '(1199, 4)') + f('columns', 'order_id, date, category, amount') + sep + m('head()', 'первые 5 строк') + m('to_csv(path)', 'записать в файл') };
  }

  const scene = {
    parts: [{ n: '01', name: 'Файл', s: [0, 1] }, { n: '02', name: 'Без обработчика', s: [2, 3] }, { n: '03', name: 'Обработка ошибки', s: [4, 5, 6] }, { n: '04', name: 'Класс', s: [7, 8, 9] }, { n: '05', name: 'DataFrame', s: [10] }],
    steps: [
      { title: 'Что в файле заказов', dur: 3600, body: '<p>В&nbsp;<b>orders.csv</b> одна строка заголовка и&nbsp;1&nbsp;200 заказов. Большая часть файла записана в&nbsp;<b>UTF-8</b>. Строка 1&nbsp;000 попала сюда из старой выгрузки в&nbsp;кодировке <b>cp1251</b>.</p><p>Если редактор откроет файл как UTF-8 и&nbsp;заменит недопустимые байты, вместо букв в&nbsp;названии категории появятся знаки «�».</p>' },
      { title: 'Как скрипт читает строки', dur: 3400, body: '<p>Функция <b>open</b> открывает файл в&nbsp;двоичном режиме <b>"rb"</b>. Цикл получает байты одной строки, а&nbsp;вызов <b>raw.decode("utf-8")</b> преобразует их в&nbsp;текст.</p><p>Скрипт пропускает заголовок. Каждый прочитанный заказ он добавляет в&nbsp;список <b>orders</b>.</p>' },
      { title: 'Почему не читается строка 1 000', dur: 3200, body: '<p>В&nbsp;названии категории «Дом и&nbsp;сад» первые две буквы записаны байтами <b>C4 EE</b>. В&nbsp;UTF-8 байт C4 может начинать двухбайтовую последовательность, а&nbsp;EE не может её продолжать.</p><p>Поэтому <b>raw.decode("utf-8")</b> выдаёт <b>UnicodeDecodeError</b>.</p>' },
      { title: 'Почему отчёт не сформировался', dur: 3600, body: '<p>В&nbsp;этой версии скрипта нет обработчика ошибки. Python выводит трассировку и&nbsp;завершает программу. К&nbsp;этому моменту в&nbsp;списке было 998 заказов, но результат ещё не был сохранён.</p><p>При выходе из блока <b>with</b> файл закрылся. Исходный CSV можно прочитать снова.</p>' },
      { title: 'Обработчик ошибки кодировки', dur: 3200, body: '<p>Добавим <b>try</b> перед вызовом <b>decode</b>. Если байты строки не удастся прочитать как UTF-8, Python перейдёт в&nbsp;обработчик <b>except UnicodeDecodeError</b>.</p><p>Теперь запустим скрипт заново. Он откроет исходный файл и&nbsp;начнёт чтение с&nbsp;первой строки.</p>' },
      { title: 'Как запомнить пропущенную строку', dur: 3600, body: '<p>На строке 1&nbsp;000 снова возникает <b>UnicodeDecodeError</b>. Обработчик добавляет её номер в&nbsp;список <b>bad</b> и&nbsp;выводит сообщение об ошибке.</p><p>Команда <b>continue</b> пропускает оставшиеся действия с&nbsp;этой строкой. На следующей итерации цикл прочитает строку 1&nbsp;001.</p>' },
      { title: 'По каким заказам построен отчёт', dur: 3400, body: '<p>После строки с&nbsp;неподходящей кодировкой скрипт прочитал ещё 201 заказ. Всего в&nbsp;список попало <b>1&nbsp;199 заказов</b>.</p><p>В&nbsp;журнале остался номер 1&nbsp;000. По нему можно найти пропущенный заказ в&nbsp;исходной выгрузке и&nbsp;проверить его отдельно.</p>' },
      { title: 'Какие данные нужны отчёту', dur: 3400, body: '<p>Для каждого файла понадобятся путь, список заказов и&nbsp;номера пропущенных строк. Опишем класс <b>Report</b>. В&nbsp;его методе <b>__init__</b> эти данные будут сохранены в&nbsp;атрибутах нового отчёта.</p><p>Пока мы только определили класс. Отчёт по нашей выгрузке появится на следующем шаге.</p>' },
      { title: 'Как создать отчёт из CSV', dur: 3600, body: '<p>Вызов <b>Report.from_csv(path)</b> читает файл, обрабатывает ошибки кодировки и&nbsp;возвращает экземпляр <b>Report</b>. Сохраним его в&nbsp;переменной <b>report</b>.</p><p>В&nbsp;этом отчёте 1&nbsp;199 заказов. В&nbsp;его атрибуте <b>bad_lines</b> хранится список с&nbsp;одним номером — 1&nbsp;000.</p>' },
      { title: 'Как метод получает заказы', dur: 3400, body: '<p>При вызове <b>report.avg_check()</b> параметр <b>self</b> получает именно этот экземпляр <b>report</b>. Метод берёт заказы из его списка.</p><p>Общая сумма прочитанных заказов — 5&nbsp;407&nbsp;920&nbsp;₽. Разделим её на 1&nbsp;199 и&nbsp;получим средний чек 4&nbsp;510,36&nbsp;₽.</p>' },
      { title: 'Как это выглядит в pandas', dur: 4200, next: 'Читать страницу', body: '<p>Создадим таблицу <b>df</b> по прочитанным заказам. Это экземпляр класса <b>pd.DataFrame</b>. Атрибут <b>df.shape</b> показывает размер таблицы — 1&nbsp;199 строк и&nbsp;4 столбца.</p><p>Вызов <b>df.head()</b> возвращает первые пять строк. Как и&nbsp;для <b>Report</b>, точка даёт доступ к&nbsp;атрибуту, а&nbsp;скобки вызывают метод.</p>' }
    ],
    hud: [{ id: 'line', label: 'Строка' }, { id: 'mem', label: 'Заказов' }, { id: 'log', label: 'В журнале' }],
    legend: '<span><i style="background:#36b8a6"></i>строка в UTF-8</span><span><i style="background:#f2756a"></i>строка в cp1251</span><span><i class="sq" style="background:#f0a247"></i>объект</span>',
    info: 'ВЫГРУЗКА ЗАКАЗОВ',
    aiNote: 'В orders.csv есть заголовок и 1 200 заказов. Название категории в строке 1 000 записано в cp1251, остальные строки — в UTF-8. Скрипт открывает файл в режиме "rb" и декодирует каждую строку отдельно. Без обработчика UnicodeDecodeError он завершается до формирования отчёта. С обработчиком пропускает одну строку и читает 1 199 заказов. Метод Report.from_csv возвращает экземпляр Report, в котором хранятся путь, заказы и список пропущенных строк. Метод report.avg_check() даёт средний чек 4 510,36 ₽. Созданная по этим заказам таблица df — экземпляр pandas.DataFrame.',
    mount(root, api) {
      const { esc, hl } = api;
      let sig = '';
      const tcls = l => /^(\$|>>>)/.test(l) ? 'cmd' : /^(Traceback|  File|    line|UnicodeDecodeError)/.test(l) ? 'er' : '';
      return {
        render(k, p) {
          const S = stateAt(k, p);
          api.hud('line', S.n ? fmtN(S.n) : '—', S.n ? 'из 1 201' : '');
          api.hud('mem', fmtN(S.mem), S.lost ? `потеряно ${S.lost}` : '');
          api.hud('log', S.log ? String(S.log.length) : '—');
          const key = JSON.stringify([k, S.n, S.act, S.term, S.obj, S.log, S.call, S.err]);
          if (key === sig) return; sig = key;
          const call = id => S.call && S.call[0] === id ? `<span class="rs-call${S.call[2] ? ' warn' : ''}">${esc(S.call[1])}</span>` : '';
          const mh = id => S.mob.includes(id) ? '' : ' mh';
          // файл: окно из трёх строк вокруг текущей или обзор целиком
          let rows = '';
          if (!S.collapsed) {
            const ids = S.n ? (a => [a, a + 1, a + 2])(Math.max(1, Math.min(TOTAL - 2, S.n - 1))) : [1, 2, 0, BAD, 0, TOTAL];
            rows = `<div class="rs-lines">${ids.map(i => {
              if (!i) return '<div class="rs-row gap"><span class="no">⋮</span><span></span></div>';
              const bad = i === BAD, cur = i === S.n;
              return `<div class="rs-row${cur ? ' cur' : ''}${bad ? ' bad' : ''}"><span class="no">${i}</span><span>${esc(bad ? (S.bytes && cur ? BAD_BYTES : BAD_TEXT) : fileLine(i))}</span></div>`;
            }).join('')}</div>`;
          }
          const pos = S.n ? (S.n / TOTAL * 100).toFixed(2) : 0;
          const file = `<div class="rs-p rs-file${mh('file')}"><div class="rs-hd"><span>data/orders.csv</span><span class="rs-tag">1 201 строка</span></div><div class="rs-map" aria-hidden="true"><i style="width:${pos}%"></i><b style="left:${(BAD / TOTAL * 100).toFixed(2)}%"></b></div>${rows}${call('file')}</div>`;
          const src = CODE[S.mode].map(([ln, t], i) => `<div class="cl${i === S.act ? ' on' : ''}${i === S.act && S.err ? ' bad' : ''}"><span class="ln">${ln || ''}</span><span>${t ? hl(t) : ' '}</span></div>`).join('');
          const code = `<div class="rs-p rs-code m-${S.mode}${S.mode === 'cls' || S.mode === 'df' ? ' nonum' : ''}${mh('code')}"><div class="rs-hd"><span>${FILE_OF[S.mode][0]}</span><span class="rs-tag">${FILE_OF[S.mode][1]}</span></div><div class="rs-src">${src}</div>${call('code')}</div>`;
          const term = `<div class="rs-p rs-term${mh('term')}"><div class="rs-hd"><span>${S.mode === 'cls' || S.mode === 'df' ? 'Консоль Python' : 'Терминал'}</span></div><div class="rs-out">${S.term.length ? S.term.map(l => `<div class="${tcls(l)}">${esc(l)}</div>`).join('') : '<div class="dim">скрипт ещё не запускали</div>'}</div>${call('term')}</div>`;
          const log = S.logOff ? '' : `<div class="rs-p rs-log${mh('log')}"><div class="rs-hd"><span>Журнал ошибок</span><span class="rs-tag">bad</span></div><div class="rs-lg">${S.log === null ? '<p class="rs-empty">в этой версии журнала нет</p>' : S.log.length ? S.log.map(e => `<div class="rs-e"><b>строка ${fmtN(e.n)}</b><span>${e.err} · байт ${e.b}</span></div>`).join('') : '<p class="rs-empty">пусто</p>'}</div>${call('log')}</div>`;
          const o = objHtml(S.obj, esc);
          const obj = `<div class="rs-p rs-obj${o.cls}${mh('obj')}"><div class="rs-hd"><span>${o.hd}</span><span class="rs-tag">${o.tag}</span></div><div class="rs-ob">${o.body}</div>${call('obj')}</div>`;
          root.innerHTML = `<div class="rs${S.err ? ' crash' : ''}"><div class="rs-l">${file}${code}${term}</div><div class="rs-r">${log}${obj}</div></div>`;
        }
      };
    }
  };

  /* ===================== Интерактив «Что поймает except» ===================== */
  // Дерево собрано по __mro__ настоящих классов в Python 3.13.18 (родитель — следующий класс в __mro__).
  // ReportError — своё исключение из кода ниже: class ReportError(Exception).
  const TREE = [
    ['BaseException', null, 'вершина дерева'],
    ['SystemExit', 'BaseException', 'выход через sys.exit()'],
    ['KeyboardInterrupt', 'BaseException', 'остановка по Ctrl+C'],
    ['Exception', 'BaseException', 'обычные ошибки программы'],
    ['ArithmeticError', 'Exception', 'ошибки арифметики'],
    ['ZeroDivisionError', 'ArithmeticError', 'деление на ноль'],
    ['LookupError', 'Exception', 'ошибка доступа по ключу или индексу'],
    ['IndexError', 'LookupError', 'нет такого индекса'],
    ['KeyError', 'LookupError', 'нет такого ключа'],
    ['NameError', 'Exception', 'имя не определено'],
    ['OSError', 'Exception', 'файлы и система'],
    ['FileNotFoundError', 'OSError', 'файла нет по пути'],
    ['TypeError', 'Exception', 'тип объекта не подходит для операции'],
    ['ValueError', 'Exception', 'недопустимое значение'],
    ['UnicodeError', 'ValueError', 'ошибки кодировок'],
    ['UnicodeDecodeError', 'UnicodeError', 'ошибка декодирования'],
    ['ReportError', 'Exception', 'своё исключение']
  ];
  const PARENT = Object.fromEntries(TREE.map(t => [t[0], t[1]]));
  const chain = c => { const a = []; for (let x = c; x; x = PARENT[x]) a.push(x); return a; };
  // Ошибки для броска: класс, строка кода, настоящее сообщение из песочницы, что случилось с выгрузкой
  const THROWS = [
    ['UnicodeDecodeError', 'raw.decode("utf-8")', ERRMSG, 'строка 1 000 в cp1251'],
    ['ValueError', 'int("12O0")', "invalid literal for int() with base 10: '12O0'", 'буква O вместо нуля'],
    ['KeyError', 'row["amount "]', "'amount '", 'лишний пробел в имени ключа'],
    ['IndexError', 'parts[3]', 'list index out of range', 'в строке три поля'],
    ['FileNotFoundError', 'open("data/orders.csv")', "[Errno 2] No such file or directory: 'data/orders.csv'", 'запуск из другой папки'],
    ['ZeroDivisionError', 'revenue / len(orders)', 'division by zero', 'пустой файл'],
    ['TypeError', '"1290" + 10', 'can only concatenate str (not "int") to str', 'сумма осталась строкой'],
    ['NameError', 'print(totl)', "name 'totl' is not defined", 'опечатка в имени'],
    ['KeyboardInterrupt', 'Ctrl+C', '', 'запрос на прерывание'],
    ['ReportError', 'raise ReportError(…)', 'data/orders.csv: пропущено 1 стр., допустимо 0', 'число пропусков превысило лимит']
  ];
  const TASKS = [
    { t: 'Выберите обработчик для двух случаев: строка не читается как UTF-8 или в числе «12O0» встретилась буква O. Ошибка в имени переменной должна остаться видна.', ok: s => s === 'ValueError' },
    { t: 'Подберите общий обработчик для KeyError и IndexError, который пропускает ValueError.', ok: s => s === 'LookupError' },
    { t: 'Найдите обработчик, который перехватит KeyboardInterrupt при нажатии Ctrl+C.', ok: s => s === 'BaseException' || s === '*' }
  ];

  function buildCatch(box, api) {
    const { $, esc, hl, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Какие исключения перехватит except? <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn small" id="xw-all">Проверить все</button><button type="button" class="btn ghost small" id="xw-reset">Сбросить</button></div></div>
<p class="hint xw-do">Выберите класс в дереве, затем исключение под схемой. Подсветка покажет, подходит ли выбранный обработчик для этого типа исключения.</p>
<div class="stage"><div class="xw-left"><div class="xw-tree" id="xw-tree" role="group" aria-label="Иерархия исключений Python"></div><button type="button" class="xw-bare" data-c="*">except: <span>без указания типа</span></button></div>
<div class="narr"><p class="cap">Код с перехватом</p><pre class="xw-code" id="xw-code"></pre><div class="narr-text" id="xw-msg"></div><p class="cap">Задания</p><ol class="steps xw-tasks" id="xw-tasks"></ol></div></div>
<div class="xw-throw"><p class="cap">Проверить исключение</p><div class="xw-chips" id="xw-chips"></div></div>
<div class="status"><span><span class="dot live"></span><span id="xw-s1"></span></span><span id="xw-s2"></span><span class="grow"></span><span id="xw-s3"></span></div>`;
    $('xw-tree').innerHTML = TREE.map(([c, , ru]) => `<button type="button" class="xw-node${PARENT[c] ? '' : ' root'}" data-c="${c}" style="--lv:${chain(c).length - 1}"><span class="xw-nm">${c}</span><small>${esc(ru)}</small><em class="xw-mk"></em></button>`).join('');
    $('xw-chips').innerHTML = THROWS.map(([c, code, , ru], i) => `<button type="button" class="xw-chip" data-t="${i}"><b>${c}</b><code>${esc(code)}</code><small>${esc(ru)}</small><em class="xw-mk"></em></button>`).join('');
    let s;
    const fresh = () => ({ sel: 'Exception', thrown: new Set(), last: null, msg: 'Сейчас выбран except Exception. Чтобы проверить ответ на вопрос выше, выберите ValueError в дереве, а затем UnicodeDecodeError под схемой.', done: [false, false, false] });
    const label = () => s.sel === '*' ? 'except:' : `except ${s.sel}`;
    const catches = c => s.sel === '*' || chain(c).includes(s.sel);
    const caughtList = () => THROWS.map(t => t[0]).filter(catches);
    const errLine = t => `<code>${esc(t[0] + (t[2] ? ': ' + t[2] : ''))}</code>`;
    function throwOne(i) {
      const t = THROWS[i]; s.thrown.add(i); s.last = t[0];
      const ch = chain(t[0]), ok = catches(t[0]);
      if (ok) {
        const upTo = s.sel === '*' ? ch : ch.slice(0, ch.indexOf(s.sel) + 1);
        s.msg = upTo.length === 1 ? `Тип исключения совпадает с типом в обработчике: ${t[0]}. В этом примере обработчик записывает номер строки, и цикл продолжается.`
          : `Цепочка наследования: ${upTo.join(' → ')}. ${s.sel === '*' ? 'Обработчик без указания типа перехватит это исключение' : `Обработчик except ${s.sel} подходит и для подкласса ${t[0]}`}. Номер строки попадёт в журнал.`;
      } else s.msg = `Цепочка наследования: ${ch.join(' → ')}. В ней нет класса ${s.sel}, поэтому обработчик пропустит исключение. Без другого подходящего обработчика скрипт завершится. Сообщение Python: ${errLine(t)}`;
    }
    function draw(anim) {
      const last = s.last ? chain(s.last) : [], lastOk = s.last && catches(s.last);
      box.querySelectorAll('.xw-node').forEach(b => {
        const c = b.dataset.c, ti = THROWS.findIndex(t => t[0] === c), thrown = ti >= 0 && s.thrown.has(ti);
        const inPath = last.includes(c) && (!lastOk || s.sel === '*' || last.indexOf(c) <= last.indexOf(s.sel));
        b.classList.toggle('sel', s.sel === c || (s.sel === '*' && c === 'BaseException'));
        b.classList.toggle('zone', catches(c));
        b.classList.toggle('path', inPath);
        b.classList.toggle('hit', lastOk && (s.sel === c || (s.sel === '*' && c === 'BaseException')));
        b.classList.toggle('leak', !!s.last && !lastOk && c === 'BaseException');
        b.style.setProperty('--d', `${(inPath ? last.indexOf(c) : 0) * 110}ms`);
        b.setAttribute('aria-pressed', String(s.sel === c));
        const mk = b.querySelector('.xw-mk'); mk.textContent = thrown ? (catches(c) ? '✓' : '✗') : ''; mk.className = `xw-mk${thrown ? (catches(c) ? ' ok' : ' no') : ''}`;
      });
      box.querySelector('.xw-bare').classList.toggle('sel', s.sel === '*');
      box.querySelector('.xw-bare').setAttribute('aria-pressed', String(s.sel === '*'));
      box.querySelectorAll('.xw-chip').forEach(b => {
        const i = +b.dataset.t, th = s.thrown.has(i), ok = catches(THROWS[i][0]);
        b.classList.toggle('ok', th && ok); b.classList.toggle('no', th && !ok); b.classList.toggle('now', THROWS[i][0] === s.last);
        b.querySelector('.xw-mk').textContent = th ? (ok ? '✓ перехвачено' : '✗ без обработки') : '';
      });
      if (anim) { const tr = $('xw-tree'); tr.classList.remove('anim'); void tr.offsetWidth; tr.classList.add('anim'); }
      $('xw-code').innerHTML = hl(`for n, raw in enumerate(f, 1):\n    try:\n        process(raw)\n    ${s.sel === '*' ? 'except:' : `except ${s.sel}:`}\n        log.append(n)`).split('\n').map((l, i) => i === 3 ? `<span class="xw-ex">${l}</span>` : l).join('\n');
      $('xw-msg').innerHTML = s.msg;
      TASKS.forEach((t, i) => { if (t.ok(s.sel) && s.thrown.size) s.done[i] = true; });
      $('xw-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t.t)}</li>`).join('');
      const cl = caughtList(), th = [...s.thrown], c = th.filter(i => catches(THROWS[i][0])).length;
      $('xw-s1').textContent = label();
      $('xw-s2').textContent = `ловит ${cl.length} из ${THROWS.length} ${plural(THROWS.length, ['ошибки', 'ошибок', 'ошибок'])}`;
      $('xw-s3').textContent = th.length ? `проверено ${th.length} · перехвачено ${c} · без обработки ${th.length - c}` : 'ещё нет проверок';
    }
    function select(c) {
      s.sel = c; s.last = null;
      const cl = caughtList();
      s.msg = c === '*' || c === 'BaseException'
        ? `${c === '*' ? 'Обработчик без указания типа' : 'Обработчик except BaseException'} перехватит все исключения на схеме, в том числе KeyboardInterrupt. В нашем цикле Ctrl+C приведёт к записи в журнал вместо немедленной остановки.`
        : cl.length ? `Обработчик except ${c} подходит для класса ${c} и его подклассов. Проверьте на примерах под схемой. Подходят ${cl.length} из ${THROWS.length}: ${cl.join(', ')}.` : `Среди примеров под схемой нет исключений класса ${c} и его подклассов.`;
      draw();
    }
    box.addEventListener('click', e => {
      const n = e.target.closest('[data-c]'), t = e.target.closest('[data-t]');
      if (n) select(n.dataset.c);
      else if (t) { throwOne(+t.dataset.t); draw(true); }
    });
    $('xw-all').addEventListener('click', () => {
      THROWS.forEach((t, i) => s.thrown.add(i)); s.last = null;
      const cl = caughtList();
      s.msg = `Проверены все примеры. Обработчик ${label()} подходит для ${cl.length} из ${THROWS.length} исключений. Без обработки осталось ${THROWS.length - cl.length}. Выберите другой класс, чтобы сравнить результаты.`;
      draw();
    });
    $('xw-reset').addEventListener('click', () => { s = fresh(); draw(); });
    s = fresh(); draw();
    return {
      describe() {
        const th = [...s.thrown].map(i => THROWS[i][0]);
        return `Выбран обработчик ${label()}. Проверенные исключения: ${th.join(', ') || 'пока нет'}. Перехвачены: ${th.filter(catches).join(', ') || 'нет'}. Без обработки: ${th.filter(c => !catches(c)).join(', ') || 'нет'}. Выполнено заданий: ${s.done.filter(Boolean).length} из 3.`;
      }
    };
  }

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-1-4',
    short: 'DA-01',
    title: 'Файлы, исключения и классы',
    where: 'блок «Дата аналитика», тема 01 «Python для анализа», страница 1.4',
    aiData: 'В учебной выгрузке orders.csv 1 200 заказов. Строка 1 000 записана в cp1251, а остальные строки — в UTF-8. По этому файлу строится отчёт Report.',
    scene,
    widgets: { catch: buildCatch },
    code: {
      crash: { title: `Чтение файла без обработчика ошибок`, badge: `проверено: Python 3.13`, lang: 'python', outLabel: `Терминал · путь в трассировке сокращён до имени файла`,
        code: `from pathlib import Path

path = Path("data") / "orders.csv"      # учебная выгрузка: заголовок + 1 200 заказов

orders = []
with open(path, "rb") as f:             # в режиме "rb" получаем байты
    for n, raw in enumerate(f, start=1):  # n — номер строки файла, с единицы
        line = raw.decode("utf-8")      # байты → текст по таблице UTF-8
        if n > 1:                       # строка 1 — заголовок
            orders.append(line.rstrip("\\n").split(","))

print("заказов прочитано:", len(orders))`,
        out: `$ python read_orders.py
Traceback (most recent call last):
  File "read_orders.py", line 8, in <module>
    line = raw.decode("utf-8")      # байты → текст по таблице UTF-8
UnicodeDecodeError: 'utf-8' codec can't decode byte 0xc4 in position 15: invalid continuation byte` },
      count: { title: `Чтение файла с обработчиком UnicodeDecodeError`, badge: `проверено: Python 3.13`, lang: 'python', outLabel: `Терминал`,
        code: `from pathlib import Path

path = Path("data") / "orders.csv"

orders, bad = [], []                    # заказы и номера пропущенных строк
with open(path, "rb") as f:
    for n, raw in enumerate(f, start=1):
        try:
            line = raw.decode("utf-8")
        except UnicodeDecodeError as e:  # ловим только эту ошибку
            bad.append(n)
            print(f"строка {n}: {e}")
            continue                    # сразу к следующей строке
        if n > 1:
            orders.append(line.rstrip("\\n").split(","))

print("заказов прочитано:", len(orders))
print("пропущено строк:", len(bad), bad)
print("файл закрыт:", f.closed)`,
        out: `$ python read_orders.py
строка 1000: 'utf-8' codec can't decode byte 0xc4 in position 15: invalid continuation byte
заказов прочитано: 1199
пропущено строк: 1 [1000]
файл закрыт: True` },
      report: { title: `Отчёт по файлу и допустимое число пропусков`, badge: `проверено: Python 3.13, pandas 3.0.5`, lang: 'python', outLabel: `Терминал`,
        code: `from pathlib import Path

import pandas as pd


class ReportError(Exception):
    """Своё исключение: отчёт собрать нельзя."""


class Report:
    """Отчёт по заказам из одного файла."""

    def __init__(self, path, orders, bad_lines):
        self.path = Path(path)        # атрибуты экземпляра
        self.orders = orders          # [(id, дата, категория, сумма), …]
        self.bad_lines = bad_lines    # номера пропущенных строк

    @classmethod
    def from_csv(cls, path, max_bad=5):
        """Собрать отчёт из файла: сохранить заказы и номера строк с ошибкой кодировки."""
        orders, bad = [], []
        with open(path, "rb") as f:
            for n, raw in enumerate(f, start=1):
                try:
                    line = raw.decode("utf-8")
                except UnicodeDecodeError:
                    bad.append(n)
                    continue
                if n > 1:
                    oid, date, cat, amount = line.rstrip("\\n").split(",")
                    orders.append((int(oid), date, cat, int(amount)))
        if len(bad) > max_bad:
            raise ReportError(f"{path}: пропущено {len(bad)} стр., допустимо {max_bad}")
        return cls(path, orders, bad)  # здесь cls — класс Report

    def revenue(self):
        return sum(o[3] for o in self.orders)

    def avg_check(self):
        return self.revenue() / len(self.orders)


report = Report.from_csv(Path("data") / "orders.csv")
print(type(report).__name__, "|", report.path, "|", len(report.orders), "заказов | пропущенные строки:", report.bad_lines)
print("выручка:", report.revenue(), "₽, средний чек:", round(report.avg_check()), "₽")

try:
    Report.from_csv(Path("data") / "orders.csv", max_bad=0)
except ReportError as e:
    print("отчёт не собран:", e)

df = pd.DataFrame(report.orders, columns=["order_id", "date", "category", "amount"])
print(type(df), isinstance(df, pd.DataFrame), df.shape)`,
        out: `$ python report.py
Report | data/orders.csv | 1199 заказов | пропущенные строки: [1000]
выручка: 5407920 ₽, средний чек: 4510 ₽
отчёт не собран: data/orders.csv: пропущено 1 стр., допустимо 0
<class 'pandas.DataFrame'> True (1199, 4)`,
        note: `В последней строке type(df) показывает класс таблицы. Значение True — результат проверки isinstance(df, pd.DataFrame), а (1199, 4) — число строк и столбцов.` },
      logline: { title: `Запись в журнал с помощью dataclass`, badge: `проверено: Python 3.13`, lang: 'python', outLabel: `Терминал`,
        code: `from dataclasses import dataclass
from pathlib import Path


@dataclass
class LogLine:
    """Одна запись журнала ошибок."""
    line_no: int     # номер строки в файле
    error: str       # тип ошибки
    raw: bytes       # что лежало в строке

    def to_tsv(self):
        return f"{self.line_no}\\t{self.error}\\t{self.raw!r}\\n"


raw = Path("data/orders.csv").read_bytes().splitlines()[999]   # строка 1 000
entry = LogLine(1000, "UnicodeDecodeError", raw)
print(entry)
print(entry == LogLine(1000, "UnicodeDecodeError", raw))

with open("errors.log", "w", encoding="utf-8") as log:   # "w" — записать заново
    log.write(entry.to_tsv())

print(Path("errors.log").read_text(encoding="utf-8"), end="")
print("в cp1251 это:", entry.raw.decode("cp1251"))`,
        out: `$ python log_line.py
LogLine(line_no=1000, error='UnicodeDecodeError', raw=b'999,2026-03-16,\\xc4\\xee\\xec \\xe8 \\xf1\\xe0\\xe4,7460')
True
1000	UnicodeDecodeError	b'999,2026-03-16,\\xc4\\xee\\xec \\xe8 \\xf1\\xe0\\xe4,7460'
в cp1251 это: 999,2026-03-16,Дом и сад,7460`,
        note: `В третьей строке показана запись из errors.log. Номер строки, тип исключения и представление исходных байтов разделены знаками табуляции.` }
    },
    questions: {
    q1: { sec: 'except', title: 'Сначала предскажите', q: 'При чтении строки возникло исключение UnicodeDecodeError. Выполнится ли блок except ValueError?', opts: [['Нет, тип исключения должен в точности совпадать с указанным в except'], ['Да, UnicodeDecodeError наследует от ValueError через UnicodeError', 1], ['Python заменит недопустимые байты и продолжит чтение без обработчика'], ['Для этой ошибки подходит только except UnicodeError']],
      why: 'Обработчик перехватывает исключения указанного класса и его подклассов. В цепочке наследования UnicodeDecodeError за UnicodeError следует ValueError. Поэтому except ValueError сработает. Это можно проверить на схеме ниже.' },
    q2: { sec: 'idea', q: 'Скрипт без обработчика остановился на строке 1 000. Сколько заказов вошло в готовый отчёт?', opts: [['998 заказов, которые скрипт успел прочитать'], ['999 заказов, по числу предыдущих строк'], ['Отчёт не был сформирован', 1], ['1 199 заказов, по числу строк без ошибки']],
      why: 'До ошибки скрипт прочитал заголовок и 998 заказов. Они хранились только в списке работающей программы. Команды расчёта и вывода находились после цикла, поэтому скрипт завершился, не выполнив их. Исходные строки в CSV сохранились.' },
    q3: { sec: 'idea', q: 'Что даёт конструкция with open(path) as f при чтении выгрузки?', opts: [['Строки файла читаются быстрее'], ['Файл закрывается при выходе из блока, в том числе при исключении', 1], ['Python автоматически определяет кодировку каждой строки'], ['Любая ошибка чтения перехватывается, и цикл переходит к следующей строке']],
      why: 'Файловый объект поддерживает протокол контекстного менеджера. При выходе из блока он закрывает файл. Если во время чтения возникло исключение, его обработка зависит от окружающего кода. Для пропуска строки в нашем примере нужен try/except внутри цикла.' },
    q4: { sec: 'except', q: 'В цикле заменили except ValueError на except Exception. Как изменится поведение обработчика?', opts: [['Он начнёт перехватывать только ValueError'], ['Он перехватит больше типов ошибок, в том числе NameError при опечатке в коде', 1], ['Он перестанет перехватывать UnicodeDecodeError'], ['Он перехватит KeyboardInterrupt при нажатии Ctrl+C']],
      why: 'ValueError и NameError входят в разные ветви иерархии, и обе начинаются от Exception. Если после такой замены обработчик просто запишет номер строки и продолжит цикл, ошибка в программе может выглядеть как дефект выгрузки. KeyboardInterrupt наследует напрямую от BaseException.' },
    q5: { sec: 'classes', q: 'Чему равен параметр self внутри avg_check, когда мы вызываем report.avg_check()?', opts: [['Классу Report'], ['Экземпляру report, у которого вызвали метод', 1], ['Копии списка заказов'], ['Имени файла с выгрузкой']],
      why: 'Python связывает метод с конкретным экземпляром. При вызове report.avg_check() первым аргументом передаётся report. Поэтому через self.orders метод получает заказы именно этого отчёта.' },
    q6: { sec: 'code', q: 'Что возвращает эта строка при вызове Report.from_csv(path)?', code: 'return cls(path, orders, bad)  # здесь cls — класс Report', lang: 'python', opts: [['Результат второго вызова from_csv'], ['Новый экземпляр Report, инициализированный данными прочитанного файла', 1], ['Сам класс Report'], ['Исключение ReportError при любом числе пропущенных строк']],
      why: 'В этом вызове параметр cls получает класс Report. Выражение cls(path, orders, bad) создаёт экземпляр и передаёт данные для его инициализации в __init__. Проверка допустимого числа пропусков находится выше. Если лимит превышен, до return дело не дойдёт.' },
    q7: { sec: 'nuances', q: 'Скрипт читает data/orders.csv при запуске из папки проекта. При запуске через планировщик тот же скрипт получает FileNotFoundError. Как это объяснить?', opts: [['Планировщик не поддерживает формат CSV'], ['У процесса другая рабочая папка, и по относительному пути из неё файла нет', 1], ['Модуль pathlib поддерживает только Windows'], ['Планировщик всегда открывает файлы в двоичном режиме']],
      why: 'Относительный путь отсчитывается от текущей рабочей папки процесса. Её можно проверить вызовом Path.cwd(). Если данные расположены рядом с файлом скрипта, путь к ним удобно построить от Path(__file__).resolve().parent.' }
    },
    glossary: {
      csv: { t: 'CSV', en: 'comma-separated values', d: 'Текстовый формат табличных данных. Каждая запись состоит из полей, разделённых запятыми. В первой записи часто указывают названия столбцов.' },
      encoding: { t: 'Кодировка', en: 'encoding', d: 'Набор правил, по которым символы записывают в виде байтов и восстанавливают при чтении.' },
      utf8: { t: 'UTF-8', en: 'UTF-8', d: 'Кодировка Юникода. Один символ занимает от одного до четырёх байтов. Например, английская буква A занимает один байт, а русская «Д» — два.' },
      cp1251: { t: 'cp1251', en: 'Windows-1251', d: 'Однобайтовая кодировка Windows для текстов с кириллицей. Встречается в старых выгрузках.' },
      binmode: { t: 'Двоичный режим', en: 'binary mode', d: 'Режим работы с байтами. Например, при чтении файла в режиме "rb" Python возвращает байты, которые можно декодировать отдельно.' },
      ctxman: { t: 'Контекстный менеджер', en: 'context manager, with', d: 'Объект, который задаёт действия при входе в блок with и выходе из него. Например, открытый файл закрывается при выходе из блока.' },
      path: { t: 'Путь', en: 'path', d: 'Запись, по которой можно найти файл или папку в файловой системе.' },
      relpath: { t: 'Относительный путь', en: 'relative path', d: 'Путь, который отсчитывается от текущей рабочей папки процесса. Например, data/orders.csv.' },
      pathlib: { t: 'pathlib', en: 'pathlib', d: 'Модуль стандартной библиотеки Python для работы с путями. Позволяет соединять части пути оператором / и читать файлы методами объекта Path.' },
      module: { t: 'Модуль', en: 'module', d: 'Отдельная часть программы со своим пространством имён. Наш модуль report хранится в файле report.py, а его класс Report можно импортировать в другой скрипт.' },
      exception: { t: 'Исключение', en: 'exception', d: 'Объект, которым Python или программа сообщает об особой ситуации. Например, при чтении недопустимой последовательности байтов возникает UnicodeDecodeError.' },
      traceback: { t: 'Трассировка ошибки', en: 'traceback', d: 'Сведения о последовательности вызовов, которая привела к исключению. В сообщении о необработанной ошибке после трассировки Python выводит тип исключения и подробности.' },
      tryexcept: { t: 'try/except', en: 'try/except', d: 'Конструкция для обработки исключений. Если при выполнении блока try возникло исключение указанного типа, управление получает соответствующий блок except.' },
      finally: { t: 'finally', en: 'finally', d: 'Блок, который выполняется при выходе из try. Например, сюда можно поместить закрытие соединения с базой данных.' },
      hierarchy: { t: 'Иерархия исключений', en: 'exception hierarchy', d: 'Отношения наследования между классами исключений. Обработчик для родительского класса подходит и для исключений его подклассов.' },
      raise: { t: 'raise', en: 'raise', d: 'Команда, с помощью которой код явно вызывает исключение, например raise ReportError("Слишком много пропусков").' },
      customexc: { t: 'Своё исключение', en: 'custom exception', d: 'Класс исключения, который определяет автор программы. В этом уроке ReportError сообщает, что в файле пропущено слишком много строк.' },
      bareexcept: { t: 'Голый except', en: 'bare except', d: 'Обработчик except: без указания типа. Он перехватывает любое исключение, в том числе KeyboardInterrupt.' },
      cls: { t: 'Класс', en: 'class', d: 'Тип объектов, который можно определить в программе. Класс Report задаёт методы отчёта, а его экземпляры хранят данные отдельных выгрузок. У самого класса также могут быть собственные атрибуты.' },
      instance: { t: 'Экземпляр', en: 'instance', d: 'Объект определённого класса. Например, таблица df — экземпляр класса pandas.DataFrame.' },
      attribute: { t: 'Атрибут', en: 'attribute', d: 'Имя, по которому можно обратиться к данным или методу объекта через точку. Например, report.orders или report.avg_check.' },
      method: { t: 'Метод', en: 'method', d: 'Функция, доступная через класс или его экземпляр. Например, метод report.avg_check() считает средний чек по заказам этого отчёта.' },
      init: { t: '__init__', en: 'initializer', d: 'Метод, который инициализирует созданный экземпляр. В классе Report он сохраняет путь, заказы и номера пропущенных строк в атрибутах экземпляра.' },
      self: { t: 'self', en: 'self', d: 'Принятое имя первого параметра метода экземпляра. При вызове через экземпляр Python автоматически передаёт в этот параметр сам экземпляр.' },
      classmethod: { t: 'Метод класса', en: 'class method, @classmethod', d: 'Метод, который получает класс в качестве первого аргумента. Например, Report.from_csv(path) создаёт отчёт из файла.' },
      decorator: { t: 'Декоратор', en: 'decorator', d: 'Средство применить функцию или другой вызываемый объект к определению функции или класса. Например, @classmethod превращает функцию в метод класса.' },
      dataclass: { t: 'dataclass', en: 'data class', d: 'Класс, оформленный декоратором @dataclass. По описанию полей декоратор может создать методы инициализации, сравнения и представления объекта для вывода.' },
      dataframe: { t: 'DataFrame', en: 'pandas.DataFrame', d: 'Класс двумерных таблиц в pandas. У экземпляра есть атрибут shape с размерами таблицы и метод head(), который возвращает первые строки.' }
    },
    materials: [
      ['da-1-4-files-exceptions.md', 'Текст урока в Markdown с примерами кода, вопросами и глоссарием'],
      ['data/orders.csv', 'Учебная выгрузка из 1 200 заказов. Строка 1 000 записана в cp1251'],
      ['gen_orders.py', 'Генератор учебной выгрузки'],
      ['read_orders_v0.py', 'Чтение файла без обработчика ошибок'],
      ['read_orders.py', 'Чтение файла с обработчиком ошибки кодировки'],
      ['report.py', 'Класс Report и исключение ReportError'],
      ['log_line.py', 'Класс LogLine и запись ошибок в файл errors.log']
    ],
    prompts: [
      ['Выбор обработчика исключений', 'Дай пять задач на выбор обработчика. В каждой назови тип исключения и покажи блок except. Я попробую предсказать, сработает ли он. Задавай задачи по одной и разбирай ответ по иерархии исключений.'],
      ['Разбор моего скрипта', 'Я пришлю свой скрипт чтения файлов. Проверь, как он обрабатывает ошибки в отдельных строках, закрывает ли файл и откуда отсчитывает пути. Объясни, какие места стоит исправить и почему.'],
      ['Свой класс для выгрузки', 'Помоги спроектировать класс для моей выгрузки по образцу Report из источника. Сначала уточни, какие столбцы есть в файле и что я по ним считаю. Затем помоги выбрать атрибуты и методы отчёта. Попроси меня объяснить, что будет храниться в self.orders.']
    ]
  };
})();
