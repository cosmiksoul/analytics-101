/* Страница 4.2 · Матричные операции как преобразования */
(() => {
  /* ===================== Общая математика 2 × 2 =====================
     Матрица хранится строками: [a, b, c, d] = [[a, b], [c, d]]. Столбцы (a, c) и (b, d) — куда уходят î и ĵ. */
  const I2 = [1, 0, 0, 1];
  const lerp = (A, B, e) => A.map((v, i) => v + (B[i] - v) * e);
  const mul = (A, B) => [A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3], A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]];
  const ap = (M, x, y) => [M[0] * x + M[1] * y, M[2] * x + M[3] * y];
  const detOf = M => M[0] * M[3] - M[1] * M[2];
  const ease = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  const clamp01 = t => Math.max(0, Math.min(1, t));
  const EPS = 1e-9;
  // число с запятой и настоящим минусом; −0,00 не бывает
  const f = (v, d = 2) => { const r = Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v; return (r < 0 ? '−' : '') + Math.abs(r).toFixed(d).replace('.', ','); };

  // собственные значения и векторы 2 × 2 по формуле; сверено с np.linalg.eig (NumPy 2.5.3) на 24 матрицах
  function eig2(M) {
    const [a, b, c, d] = M, tr = a + d, dt = a * d - b * c, disc = tr * tr / 4 - dt;
    const vec = l => {
      const v = Math.abs(b) > EPS ? [b, l - a] : Math.abs(c) > EPS ? [l - d, c] : (Math.abs(l - a) <= Math.abs(l - d) ? [1, 0] : [0, 1]);
      const n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n];
    };
    if (disc < -EPS) return { kind: 'complex', tr, det: dt, re: tr / 2, im: Math.sqrt(-disc) };
    if (Math.abs(disc) <= EPS) {
      const l = tr / 2;
      if (Math.abs(b) <= EPS && Math.abs(c) <= EPS) return { kind: 'scalar', tr, det: dt, l1: l, l2: l };
      return { kind: 'defective', tr, det: dt, l1: l, l2: l, v1: vec(l) };
    }
    const s = Math.sqrt(disc), l1 = tr / 2 + s, l2 = tr / 2 - s;
    return { kind: 'real', tr, det: dt, l1, l2, v1: vec(l1), v2: vec(l2) };
  }
  const rankOf = M => Math.abs(detOf(M)) > EPS ? 2 : M.some(v => Math.abs(v) > EPS) ? 1 : 0;

  /* ===================== Данные =====================
     30 учебных клиентов из data/clients/clients.csv: доход и траты, стандартизованные по всем 1 000 клиентам
     (Z = (X − X.mean(0)) / X.std(0)), выбор np.random.default_rng(58).choice(1000, 30). Точка 8 — клиент 137:
     доход 155 000 ₽, траты 23 690 ₽. Ковариационная матрица всех 1 000 стандартизованных клиентов:
     C = ZᵀZ / n = [[1, 0,50030], [0,50030, 1]], собственные значения 1,50030 и 0,49970 (75% и 25% разброса). */
  const PTS = [[0.096, 1.63], [-0.296, -0.459], [-0.741, -1.451], [-1.238, -1.078], [-1.055, -0.335], [-1.212, 1.352], [-0.872, -1.363], [1.587, 0.492], [1.979, 1.454], [-1.159, -0.532], [-0.924, -0.678], [1.247, 0.175], [-0.113, -0.167], [-0.558, -0.751], [-1.264, -1.397], [0.541, 1.249], [-0.532, 0.213], [0.175, 1.178], [-0.898, 1.054], [0.253, 1.478], [0.018, 0.39], [-0.976, -0.379], [0.07, 0.467], [0.279, 1.989], [1.796, 1.009], [0.907, -0.049], [-0.061, 1.397], [1.352, 0.618], [-0.532, -0.194], [0.698, 0.388]];
  const CR = 0.5002970053859407;

  /* ===================== Сцена ===================== */
  const MS = {
    I: I2, S: [2, 0, 0, 1], H: [1, 0.8, 0, 1], R: [0.8, -0.6, 0.6, 0.8],
    A: [1.5, 1, 0.5, 1], B: [1, 2, 0.5, 1], C: [1, CR, CR, 1]
  };
  MS.SR = mul(MS.S, MS.R); MS.RS = mul(MS.R, MS.S);
  const r5 = Math.sqrt(5), r2 = Math.SQRT1_2;
  const EIG = {
    A: [{ v: [2 / r5, 1 / r5], l: 2, c: 'e1' }, { v: [r2, -r2], l: 0.5, c: 'e2' }],
    B: [{ v: [2 / r5, 1 / r5], l: 2, c: 'e1' }, { v: [2 / r5, -1 / r5], l: 0, c: 'e0' }],
    C: [{ v: [r2, r2], l: 1 + CR, c: 'e1' }, { v: [-r2, r2], l: 1 - CR, c: 'e2' }]
  };
  const deg = a => [Math.cos(a * Math.PI / 180), Math.sin(a * Math.PI / 180)];
  const FAN = [-67.5, -45, -22.5, 0, 22.5, 45, 67.5, 90].map(deg);
  const FAN_A = FAN.concat([[2 / r5, 1 / r5]]);          // плюс второе собственное направление A
  const isEigA = v => Math.abs(v[0] * 1 - v[1] * 2) < 1e-9 || Math.abs(v[0] + v[1]) < 1e-9;
  const L = 1.7;                                         // длина стрелок веера и собственных стрелок до преобразования

  function stateAt(k, p) {
    const e = ease(clamp01(p / 0.72)), late = t => clamp01((p - t) / 0.08);
    const S = { M: I2, name: 'I', em: false, fan: null, fanHi: 0, eig: [], ghost: null, line: null, marks: null, oval: 0, calls: [], pts: 1 };
    const tip = (M, x, y) => ap(M, x, y);
    switch (k) {
      case 0:
        S.pts = p * 1.6;
        S.calls = [{ at: PTS[8], t: 'клиент 137 · доход 155 000 ₽/мес., траты 23 690 ₽ за квартал', s: 'r', a: late(0.62) }];
        break;
      case 1:
        S.em = true;
        S.calls = [{ at: [1, 0], t: 'î = (1, 0) → 1-й столбец', s: 'b', a: late(0.12) }, { at: [0, 1], t: 'ĵ = (0, 1) → 2-й столбец', s: 'l', a: late(0.4) }];
        break;
      case 2:
        S.M = lerp(I2, MS.S, e); S.name = 'S';
        S.calls = [{ at: tip(S.M, 1, 0), t: 'î → (2, 0)', s: 'b', a: late(0.72) }, { at: tip(S.M, 1, 1), t: 'площадь клетки равна 2', s: 'r', a: late(0.8) }];
        break;
      case 3:
        S.M = lerp(I2, MS.H, e); S.name = 'H';
        S.calls = [{ at: tip(S.M, 0, 1), t: 'ĵ → (0,8; 1)', s: 't', a: late(0.72) }, { at: tip(S.M, 1, 0), t: 'площадь клетки равна 1', s: 'b', a: late(0.8) }];
        break;
      case 4:
        S.M = lerp(I2, MS.R, e); S.name = 'R'; S.fan = FAN;
        S.calls = [{ at: tip(S.M, 0, L), t: 'поворот примерно на 37°', s: 'l', a: late(0.74) }];
        break;
      case 5:
        if (p < 0.45) { S.M = lerp(I2, MS.R, ease(p / 0.45)); S.name = 'R'; }
        else { S.M = lerp(MS.R, MS.SR, ease(clamp01((p - 0.45) / 0.33))); S.name = 'S·R'; }
        S.ghost = p > 0.8 ? MS.RS : null;
        S.calls = [{ at: tip(MS.SR, 1, 0), t: 'S·R: сначала поворот', s: 'r', a: late(0.8) }, { at: tip(MS.RS, 1, 1), t: 'R·S: сначала растяжение', s: 't', a: late(0.86) }];
        break;
      case 6:
        S.M = lerp(I2, MS.A, e); S.name = 'A'; S.fan = FAN_A; S.fanHi = late(0.76);
        S.calls = [{ at: tip(S.M, 2 / r5 * L, 1 / r5 * L), t: 'вдоль (2, 1)', s: 't', a: late(0.8) }, { at: tip(S.M, r2 * L, -r2 * L), t: 'вдоль (1, −1)', s: 'b', a: late(0.84) }];
        break;
      case 7:
        S.M = lerp(I2, MS.A, e); S.name = 'A'; S.eig = EIG.A;
        S.calls = [{ at: tip(MS.A, 2 / r5 * L, 1 / r5 * L), t: 'λ₁ = 2: вдвое длиннее', s: 'r', a: late(0.74) }, { at: tip(MS.A, r2 * L, -r2 * L), t: 'λ₂ = 0,5: вдвое короче', s: 'r', a: late(0.8) }];
        break;
      case 8:
        S.M = lerp(I2, MS.B, e); S.name = 'B'; S.eig = EIG.B; S.line = late(0.72);
        S.calls = [{ at: [-2.4, -1.2], t: 'все точки попали на прямую', s: 'b', a: late(0.76) }, { at: [0, 0], t: '(2, −1) → (0, 0)', s: 'l', a: late(0.84) }];
        break;
      case 9:
        S.M = MS.B; S.name = 'B'; S.line = 1; S.marks = late(0.1);
        S.calls = [{ at: [3, 1.5], t: '(1, 1) и (3, 0) → (3; 1,5)', s: 't', a: late(0.3) }, { at: [2, 1], t: 'B·ĵ = 2 · (B·î)', s: 'b', a: late(0.55) }];
        break;
      case 10:
        S.M = lerp(I2, MS.C, e); S.name = 'C'; S.eig = EIG.C;
        S.calls = [{ at: tip(MS.C, r2 * L, r2 * L), t: 'λ₁ = 1,50', s: 'r', a: late(0.74) }, { at: tip(MS.C, -r2 * L, r2 * L), t: 'λ₂ = 0,50', s: 'l', a: late(0.8) }];
        break;
      case 11: {
        const o = clamp01((p - 0.62) / 0.15);
        S.M = lerp(MS.C, I2, e); S.name = 'I'; S.eig = o > 0 ? [] : EIG.C; S.oval = o;
        const a1 = 2 * Math.sqrt(1 + CR), a2 = 2 * Math.sqrt(1 - CR);
        S.calls = [{ at: [r2 * a1, r2 * a1], t: 'v₁ · 75% общей дисперсии', s: 'r', a: late(0.7) }, { at: [-r2 * a2, r2 * a2], t: 'v₂ · 25% общей дисперсии', s: 'l', a: late(0.78) }];
        break;
      }
    }
    return S;
  }

  const scene = {
    parts: [{ n: '01', name: 'Облако', s: [0, 1] }, { n: '02', name: 'Площадь', s: [2, 3] }, { n: '03', name: 'Поворот', s: [4, 5] }, { n: '04', name: 'Направления', s: [6, 7] }, { n: '05', name: 'Ранг', s: [8, 9] }, { n: '06', name: 'Оси облака', s: [10, 11] }],
    steps: [
      { title: 'Тридцать клиентов на плоскости', dur: 3600, body: '<p>Каждая точка соответствует клиенту. По горизонтали отложен его месячный доход, по&nbsp;вертикали — траты за&nbsp;квартал. Оба признака <b>стандартизованы</b> по&nbsp;всей тысяче клиентов. Нулевая координата означает среднее значение, единица — значение на&nbsp;одно стандартное отклонение выше среднего.</p><p>Стрелки <b>î</b> и <b>ĵ</b> показывают единичные векторы вдоль осей. Сейчас матрица единичная, поэтому все точки остаются на&nbsp;месте.</p>' },
      { title: 'Что показывают столбцы матрицы', dur: 3800, body: '<p>Первый столбец матрицы 2&nbsp;×&nbsp;2 показывает, куда перейдёт вектор î. Второй показывает, куда перейдёт ĵ.</p><p>Точка с&nbsp;координатами (x, y) задаётся вектором x·î + y·ĵ. Чтобы найти её положение после преобразования, умножьте первый столбец на&nbsp;x, второй на&nbsp;y и сложите результаты.</p>' },
      { title: 'Растяжение удваивает площадь', dur: 3400, body: '<p>Матрица S переводит î в&nbsp;(2, 0), а ĵ оставляет на&nbsp;месте. У&nbsp;каждой точки облака горизонтальная координата удваивается, а вертикальная сохраняется.</p><p>Исходная клетка стала вдвое шире при той же высоте. Её площадь теперь равна 2. У&nbsp;матрицы S <b>определитель</b> равен 2.</p>' },
      { title: 'Сдвиг сохраняет площадь', dur: 3400, body: '<p>При сдвиге точка (x, y) переходит в&nbsp;(x + 0,8·y, y). Поэтому выше горизонтальной оси ряды сетки смещаются вправо, ниже — влево. На самой оси точки остаются на&nbsp;месте.</p><p>Квадрат стал параллелограммом. Длины основания и высоты сохранились, поэтому площадь клетки равна 1. Определитель матрицы тоже равен 1.</p>' },
      { title: 'Поворот сохраняет длины', dur: 3600, body: '<p>Матрица R поворачивает все стрелки примерно на&nbsp;37° против часовой стрелки. Длины стрелок и площадь клетки после поворота остаются прежними. Определитель равен 1.</p><p>Бледные стрелки показывают исходные направления. При таком угле поворота ни одна ненулевая стрелка не остаётся на&nbsp;своей прямой.</p>' },
      { title: 'Что изменится при перестановке матриц', dur: 4400, body: '<p>Сначала повернём сетку матрицей R, затем растянем её по&nbsp;горизонтали матрицей S. Сплошной контур показывает результат действия произведения <b>S·R</b>.</p><p>Пунктир показывает R·S. Здесь сетку сначала растянули, а потом повернули. Формы двух клеток различаются, а площади совпадают. Каждая равна 2.</p>' },
      { title: 'Какие стрелки останутся на своих прямых', dur: 3800, body: '<p>У&nbsp;матрицы A первый столбец равен (1,5; 0,5), второй — (1, 1). Бледные стрелки показывают девять векторов до&nbsp;преобразования, яркие — после.</p><p>Сравните каждую пару. Семь стрелок изменили направление. Две другие сохранили его, хотя их длина изменилась.</p>' },
      { title: 'Два собственных направления матрицы A', dur: 4200, body: '<p>Стрелки вдоль (2, 1) и (1, −1) изображают <b>собственные векторы</b> матрицы A. Первая стала вдвое длиннее, вторая — вдвое короче. Соответствующие <b>собственные значения</b> равны 2 и 0,5.</p><p>Определитель равен произведению этих значений. Поскольку 2 · 0,5 = 1, площадь клетки сохранилась.</p>' },
      { title: 'Все точки попадают на прямую', dur: 4000, body: '<p>У&nbsp;матрицы B второй столбец (2, 1) равен удвоенному первому (1; 0,5). Оба базисных вектора переходят в&nbsp;векторы на&nbsp;одной прямой. После преобразования на&nbsp;этой же прямой окажутся все точки сетки.</p><p>Площадь клетки и определитель равны нулю. Вектор (2, −1) переходит в&nbsp;(0, 0). Его собственное значение λ равно 0.</p>' },
      { title: 'Почему у матрицы ранга 1 нет обратной', dur: 4200, body: '<p>Матрица B переводит точки (1, 1) и (3, 0) в&nbsp;одну точку (3; 1,5). По результату нельзя определить, какая точка была исходной. Поэтому <b>обратной матрицы</b> у&nbsp;B нет.</p><p>Образ плоскости — прямая. У&nbsp;неё одно измерение, поэтому <b>ранг</b> B равен 1. В&nbsp;таблице признаков ранг также снижается, если один столбец дублирует другой в&nbsp;иных единицах измерения.</p>' },
      { title: 'Оси облака доходов и трат', dur: 4200, body: '<p><b>Ковариационная матрица</b> C рассчитана по&nbsp;стандартизованным доходам и тратам всех 1&nbsp;000 клиентов. На диагонали стоят единицы, вне диагонали — корреляция между этими признаками, примерно 0,50.</p><p>Собственные векторы C на&nbsp;рисунке взаимно перпендикулярны. Вдоль прямой y = x матрица растягивает векторы примерно в&nbsp;полтора раза, вдоль y = −x уменьшает их длину примерно вдвое.</p>' },
      { title: 'На первую ось приходится 75% разброса', dur: 4800, next: 'Читать страницу', body: '<p>Вернём точки в&nbsp;исходное положение. Нарисуем поверх облака оси вдоль собственных векторов C. Вдоль первой оси клиенты различаются сильнее всего. На эту ось приходится около 75% общей дисперсии двух признаков во всей таблице, на&nbsp;вторую — около 25%.</p><p><b>Метод главных компонент</b> (PCA) описывает данные в&nbsp;таких координатах. Если оставить только координату вдоль первой оси, у&nbsp;каждого клиента останется одно число вместо двух.</p>' }
    ],
    hud: [{ id: 'det', label: 'Определитель' }, { id: 'area', label: 'Площадь клетки' }, { id: 'rank', label: 'Ранг' }],
    legend: '<span><i style="background:#f0a247"></i>î</span><span><i style="background:#a48af0"></i>ĵ</span><span><i class="sq" style="background:#e3c04d"></i>исходная клетка&nbsp;1&nbsp;×&nbsp;1</span><span><i style="background:#36b8a6"></i>собственные&nbsp;векторы</span>',
    info: 'МАТРИЦА 2 × 2',
    aiNote: 'В анимации показаны 30 из 1 000 учебных клиентов. По горизонтали отложен стандартизованный месячный доход, по вертикали — стандартизованные траты за квартал. Значения в матрицах ниже записаны как в Python. S = [[2, 0], [0, 1]] растягивает сетку по горизонтали. H = [[1, 0.8], [0, 1]] сдвигает горизонтальные слои. R = [[0.8, -0.6], [0.6, 0.8]] поворачивает сетку примерно на 37°. У S·R и R·S разная форма клетки, но одинаковая площадь 2. У A = [[1.5, 1], [0.5, 1]] собственные направления вдоль (2, 1) и (1, −1), собственные значения 2 и 0,5. Матрица B = [[1, 2], [0.5, 1]] имеет ранг 1 и переводит (1, 1) и (3, 0) в одну точку (3; 1,5). Ковариационная матрица двух стандартизованных признаков по всем клиентам имеет диагональные элементы 1 и внедиагональные около 0,50. Первая главная компонента объясняет около 75% общей дисперсии этих двух признаков.',
    mount(root, api) {
      const { esc } = api;
      root.innerHTML = '<div class="mt-sc"><svg class="mt-svg" aria-hidden="true"></svg><div class="mt-mx"></div><div class="mt-calls"></div></div>';
      const box = root.firstChild, svg = box.querySelector('svg'), mx = box.querySelector('.mt-mx'), cl = box.querySelector('.mt-calls');
      let sig = '', last = [0, 0];
      const R1 = v => Math.round(v * 10) / 10;
      function arrow(x1, y1, x2, y2, cls) {
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
        if (len < 3) return '';
        const ux = dx / len, uy = dy / len, h = Math.min(10, len * 0.42), bx = x2 - ux * h, by = y2 - uy * h, w = h * 0.5;
        return `<line class="${cls}" x1="${R1(x1)}" y1="${R1(y1)}" x2="${R1(bx)}" y2="${R1(by)}"/><polygon class="${cls} hd" points="${R1(x2)},${R1(y2)} ${R1(bx - uy * w)},${R1(by + ux * w)} ${R1(bx + uy * w)},${R1(by - ux * w)}"/>`;
      }
      function draw(k, p) {
        const S = stateAt(k, p), M = S.M;
        const dt = detOf(M), rk = Math.abs(dt) < 1e-6 ? rankOf(M.map(v => Math.abs(v) < 1e-6 ? 0 : v)) : 2;
        api.hud('det', f(dt), '');
        api.hud('area', f(Math.abs(dt)), '');
        api.hud('rank', String(rk), rk === 2 ? 'плоскость' : rk === 1 ? 'прямая' : 'точка');
        const W = box.clientWidth, H = box.clientHeight;
        if (!W || !H) return;
        const key = JSON.stringify([k, M.map(v => Math.round(v * 1e4)), S.pts > 1 ? 1 : Math.round(S.pts * 60), S.fanHi, S.ghost ? 1 : 0, S.line, S.marks, S.oval, S.calls.map(c => c.a), W, H]);
        if (key === sig) return; sig = key;
        const narrow = W < 560, top = narrow ? 62 : 76, bot = narrow ? 50 : 56;
        const u = Math.min((W - 24) / 2, (H - top - bot) / 2) / (narrow ? 3.3 : 4), cx = W / 2, cy = top + (H - top - bot) / 2;
        const X = x => cx + x * u, Y = y => cy - y * u, P = ([x, y]) => [X(x), Y(y)];
        const T = (x, y) => P(ap(M, x, y));
        let g = '';
        // исходная сетка — бледно, для сравнения
        for (let i = -9; i <= 9; i++) g += `<line class="mt-g0" x1="${R1(X(i))}" y1="0" x2="${R1(X(i))}" y2="${H}"/><line class="mt-g0" x1="0" y1="${R1(Y(i))}" x2="${W}" y2="${R1(Y(i))}"/>`;
        // сетка после преобразования
        for (let i = -9; i <= 9; i++) {
          const c = i === 0 ? 'mt-ax' : 'mt-g1';
          const [a1, b1] = T(i, -12), [a2, b2] = T(i, 12), [a3, b3] = T(-12, i), [a4, b4] = T(12, i);
          g += `<line class="${c}" x1="${R1(a1)}" y1="${R1(b1)}" x2="${R1(a2)}" y2="${R1(b2)}"/><line class="${c}" x1="${R1(a3)}" y1="${R1(b3)}" x2="${R1(a4)}" y2="${R1(b4)}"/>`;
        }
        const poly = (Mx, cls) => { const q = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => P(ap(Mx, x, y)).map(R1).join(',')).join(' '); return `<polygon class="${cls}" points="${q}"/>`; };
        if (S.ghost) g += poly(S.ghost, 'mt-cell ghost');
        g += poly(M, 'mt-cell');
        // прямая, на которую легла плоскость, и направление, сжатое в ноль
        if (S.line) {
          const [x1, y1] = P([-12 * 2 / r5, -12 / r5]), [x2, y2] = P([12 * 2 / r5, 12 / r5]);
          const [n1, m1] = P([-12 * 2 / r5, 12 / r5]), [n2, m2] = P([12 * 2 / r5, -12 / r5]);
          g += `<g style="opacity:${S.line.toFixed(2)}"><line class="mt-img" x1="${R1(x1)}" y1="${R1(y1)}" x2="${R1(x2)}" y2="${R1(y2)}"/><line class="mt-null" x1="${R1(n1)}" y1="${R1(m1)}" x2="${R1(n2)}" y2="${R1(m2)}"/></g>`;
        }
        // собственные прямые
        S.eig.forEach(E => { const [x1, y1] = P([-12 * E.v[0], -12 * E.v[1]]), [x2, y2] = P([12 * E.v[0], 12 * E.v[1]]); g += `<line class="mt-el ${E.c}" x1="${R1(x1)}" y1="${R1(y1)}" x2="${R1(x2)}" y2="${R1(y2)}"/>`; });
        // эллипс и главные оси облака
        if (S.oval) {
          const a1 = 2 * Math.sqrt(1 + CR) * u, a2 = 2 * Math.sqrt(1 - CR) * u;
          g += `<g style="opacity:${S.oval.toFixed(2)}"><ellipse class="mt-oval" cx="${R1(cx)}" cy="${R1(cy)}" rx="${R1(a1)}" ry="${R1(a2)}" transform="rotate(-45 ${R1(cx)} ${R1(cy)})"/>${arrow(cx, cy, cx + a1 * r2, cy - a1 * r2, 'mt-ea e1')}${arrow(cx, cy, cx - a2 * r2, cy - a2 * r2, 'mt-ea e2')}</g>`;
        }
        // веер направлений: бледные — до, яркие — после
        if (S.fan) S.fan.forEach(v => {
          const hi = S.fanHi && isEigA(v), [gx, gy] = P([v[0] * L, v[1] * L]), [tx, ty] = T(v[0] * L, v[1] * L);
          g += arrow(cx, cy, gx, gy, 'mt-fg') + arrow(cx, cy, tx, ty, hi ? 'mt-fa hi' : 'mt-fa');
        });
        // клиенты
        PTS.forEach((pt, i) => {
          const a = clamp01(S.pts * 30 - i); if (a <= 0) return;
          const [x, y] = T(pt[0], pt[1]);
          g += `<circle class="mt-pt${i === 8 && k === 0 ? ' on' : ''}" cx="${R1(x)}" cy="${R1(y)}" r="${i === 8 && k === 0 ? 4.6 : 3.4}" style="opacity:${(a * 0.88).toFixed(2)}"/>`;
        });
        // две точки, которые слились в одну
        if (S.marks) {
          const [ax, ay] = P([1, 1]), [bx, by] = P([3, 0]), [ix, iy] = P([3, 1.5]);
          g += `<g style="opacity:${S.marks.toFixed(2)}"><line class="mt-mk-l" x1="${R1(ax)}" y1="${R1(ay)}" x2="${R1(ix)}" y2="${R1(iy)}"/><line class="mt-mk-l" x1="${R1(bx)}" y1="${R1(by)}" x2="${R1(ix)}" y2="${R1(iy)}"/><circle class="mt-mk" cx="${R1(ax)}" cy="${R1(ay)}" r="5"/><circle class="mt-mk" cx="${R1(bx)}" cy="${R1(by)}" r="5"/><circle class="mt-mk on" cx="${R1(ix)}" cy="${R1(iy)}" r="5.5"/></g>`;
        }
        // базисные стрелки
        const [ix, iy] = T(1, 0), [jx, jy] = T(0, 1);
        g += arrow(cx, cy, ix, iy, `mt-bi${S.em ? ' em' : ''}`) + arrow(cx, cy, jx, jy, `mt-bj${S.em ? ' em' : ''}`);
        // собственные стрелки: бледная — до, яркая — после
        S.eig.forEach(E => { const [gx, gy] = P([E.v[0] * L, E.v[1] * L]), [tx, ty] = T(E.v[0] * L, E.v[1] * L); g += arrow(cx, cy, gx, gy, `mt-eg ${E.c}`) + arrow(cx, cy, tx, ty, `mt-ea ${E.c}`); });
        g += `<circle class="mt-o" cx="${R1(cx)}" cy="${R1(cy)}" r="2.6"/>`;
        svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.innerHTML = g;
        // карточка матрицы: столбцы в цветах î и ĵ
                mx.innerHTML = `<span class="mt-mn">${esc(S.name)}</span><span class="mt-mb"><i class="c1">${f(M[0])}</i><i class="c2">${f(M[1])}</i><i class="c1">${f(M[2])}</i><i class="c2">${f(M[3])}</i></span>`;
        // выноски: позиция по объекту, затем сдвиг внутрь сцены
        cl.innerHTML = S.calls.filter(c => c.a > 0).map(c => `<span class="mt-call" style="opacity:${c.a.toFixed(2)}">${esc(c.t)}</span>`).join('');
        const shown = S.calls.filter(c => c.a > 0);
        [...cl.children].forEach((el, i) => {
          const c = shown[i], [x, y] = P(c.at), w = el.offsetWidth, h = el.offsetHeight;
          let l = x, t = y;
          if (c.s === 'r') { l = x + 12; t = y - h / 2; } else if (c.s === 'l') { l = x - w - 12; t = y - h / 2; } else if (c.s === 't') { l = x - w / 2; t = y - h - 12; } else { l = x - w / 2; t = y + 12; }
          l = Math.max(6, Math.min(W - w - 6, l)); t = Math.max(top - 6, Math.min(H - bot - h, t));
          el.style.left = `${Math.round(l)}px`; el.style.top = `${Math.round(t)}px`;
        });
      }
      if ('ResizeObserver' in window) new ResizeObserver(() => { sig = ''; draw(last[0], last[1]); }).observe(box);
      return { render(k, p) { last = [k, p]; draw(k, p); } };
    }
  };

  /* ===================== Интерактив «Матрица как деформация» ===================== */
  const PRE = [['id', 'Единичная', [1, 0, 0, 1]], ['st', 'Растяжение', [2, 0, 0, 1]], ['sh', 'Сдвиг', [1, 0.8, 0, 1]], ['rot', 'Поворот', [0.8, -0.6, 0.6, 0.8]], ['ref', 'Отражение', [-1, 0, 0, 1]]];
  const START = [1.5, 1, 0.5, 1];
  const NM = ['a', 'b', 'c', 'd'], POS = ['верхний левый', 'верхний правый', 'нижний левый', 'нижний правый'];
  const TASKS = ['Подберите матрицу с нулевым определителем. Что получится из жёлтой клетки?', 'Подберите матрицу без вещественных собственных векторов.', 'Подберите матрицу с отрицательным определителем. Проследите за порядком вершин клетки.'];

  function buildDeform(box, api) {
    const { $, esc } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Как матрица меняет форму и площадь клетки <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="mw-reset">Сбросить</button></div></div>
<p class="hint mw-do">Каждый ползунок меняет один элемент матрицы. Следите за точками и жёлтой клеткой. На исходной сетке у неё стороны длины 1. Бледные стрелки показывают выбранные собственные векторы до преобразования, яркие — после.</p>
<div class="mw-pre"><span class="mw-l">Готовые матрицы</span><span class="seg mw-seg" role="group" aria-label="Готовые матрицы">${PRE.map(([id, t]) => `<button type="button" data-pre="${id}">${t}</button>`).join('')}</span></div>
<div class="stage"><div class="mw-left"><div class="mw-plot" id="mw-plot"></div><div class="mw-leg"><span><i class="bi"></i>î → 1-й столбец</span><span><i class="bj"></i>ĵ → 2-й столбец</span><span><i class="cell"></i>исходная клетка 1 × 1</span><span><i class="e1"></i>v₁</span><span><i class="e2"></i>v₂</span><span><i class="nl"></i>прообраз начала координат</span></div></div>
<div class="narr"><p class="cap">Матрица A</p><div class="mw-mat">${NM.map((n, i) => `<label class="mw-s ${i % 2 ? 'c2' : 'c1'}"><span class="mw-sn"><b>${n}</b><em id="mw-v${i}"></em></span><input type="range" id="mw-r${i}" min="-2" max="2" step="0.1" aria-label="Элемент ${n}, ${POS[i]}"></label>`).join('')}</div>
<div class="mw-read" id="mw-read"></div><div class="narr-text" id="mw-msg"></div><p class="cap">Задания</p><ol class="steps mw-tasks" id="mw-tasks"></ol></div></div>
<div class="status"><span><span class="dot live"></span><span id="mw-s1"></span></span><span id="mw-s2"></span><span class="grow"></span><span id="mw-s3"></span></div>`;
    let s;
    const fresh = () => ({ M: START.slice(), done: [false, false, false] });
    const R1 = v => Math.round(v * 10) / 10;
    const cur = () => { const M = s.M.map(v => Math.round(v * 10) / 10); const dt = Math.round(detOf(M) * 1e6) / 1e6; return { M, dt, E: eig2(M), rk: rankOf(M) }; };
    const lamTxt = E => E.kind === 'complex' ? `${f(E.re)} ± ${f(E.im)}i` : E.kind === 'real' ? `${f(E.l1)} и ${f(E.l2)}` : `${f(E.l1)} дважды`;

    function plot(Q) {
      const host = $('mw-plot'), W = Math.max(260, Math.round(host.clientWidth || 600)), H = W < 520 ? W : Math.min(440, Math.round(W * 0.72));
      const u = Math.min(W, H) / 2 / 3.6, cx = W / 2, cy = H / 2, M = Q.M;
      const X = x => cx + x * u, Y = y => cy - y * u, P = ([x, y]) => [X(x), Y(y)], T = (x, y) => P(ap(M, x, y));
      const ln = (a, b, cls) => `<line class="${cls}" x1="${R1(a[0])}" y1="${R1(a[1])}" x2="${R1(b[0])}" y2="${R1(b[1])}"/>`;
      const arrow = (b, cls) => {
        const dx = b[0] - cx, dy = b[1] - cy, len = Math.hypot(dx, dy); if (len < 3) return '';
        const ux = dx / len, uy = dy / len, h = Math.min(10, len * 0.42), bx = b[0] - ux * h, by = b[1] - uy * h, w = h * 0.5;
        return ln([cx, cy], [bx, by], cls) + `<polygon class="${cls} hd" points="${R1(b[0])},${R1(b[1])} ${R1(bx - uy * w)},${R1(by + ux * w)} ${R1(bx + uy * w)},${R1(by - ux * w)}"/>`;
      };
      let g = '';
      for (let i = -6; i <= 6; i++) g += ln([X(i), 0], [X(i), H], 'mw-g0') + ln([0, Y(i)], [W, Y(i)], 'mw-g0');
      for (let i = -8; i <= 8; i++) { const c = i === 0 ? 'mw-ax' : 'mw-g1'; g += ln(T(i, -10), T(i, 10), c) + ln(T(-10, i), T(10, i), c); }
      g += `<polygon class="mw-cell${Q.dt < 0 ? ' neg' : ''}" points="${[[0, 0], [1, 0], [1, 1], [0, 1]].map(([x, y]) => T(x, y).map(R1).join(',')).join(' ')}"/>`;
      const far = (v, k) => P([v[0] * k, v[1] * k]);
      if (Q.rk === 1) {
        const col = Math.hypot(M[0], M[2]) > EPS ? [M[0], M[2]] : [M[1], M[3]], cn = Math.hypot(col[0], col[1]), cv = [col[0] / cn, col[1] / cn];
        const nv0 = Math.hypot(M[0], M[1]) > EPS ? [-M[1], M[0]] : [-M[3], M[2]], nn = Math.hypot(nv0[0], nv0[1]), nv = [nv0[0] / nn, nv0[1] / nn];
        g += ln(far(cv, -10), far(cv, 10), 'mw-img') + ln(far(nv, -10), far(nv, 10), 'mw-null');
      }
      const E = Q.E, eigs = E.kind === 'real' ? [[E.v1, E.l1, 'e1'], [E.v2, E.l2, 'e2']] : E.kind === 'defective' ? [[E.v1, E.l1, 'e1']] : [];
      eigs.forEach(([v]) => { g += ln(far(v, -10), far(v, 10), 'mw-el'); });
      PTS.forEach(pt => { const [x, y] = T(pt[0], pt[1]); g += `<circle class="mw-pt" cx="${R1(x)}" cy="${R1(y)}" r="3.2"/>`; });
      g += arrow(T(1, 0), 'mw-bi') + arrow(T(0, 1), 'mw-bj');
      const LL = 1.5;
      eigs.forEach(([v, l, c]) => {
        g += arrow(far(v, LL), `mw-eg ${c}`) + arrow(far(v, LL * l), `mw-ea ${c}`);
        // подпись у конца стрелки; у края холста прижимаем её внутрь
        const t = far(v, LL * (Math.abs(l) < 0.35 ? 1 : l)), right = t[0] >= cx, tw = 74;
        const lx = right ? Math.max(6, Math.min(W - tw - 6, t[0] + 10)) : Math.max(tw + 6, Math.min(W - 6, t[0] - 10)), ly = Math.max(14, Math.min(H - 8, t[1] - 8));
        g += `<text class="mw-lt ${c}" x="${R1(lx)}" y="${R1(ly)}" text-anchor="${right ? 'start' : 'end'}">λ = ${f(l)}</text>`;
      });
      g += `<circle class="mw-o" cx="${R1(cx)}" cy="${R1(cy)}" r="2.6"/>`;
      host.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Сетка после преобразования матрицей: определитель ${f(Q.dt)}, ранг ${Q.rk}">${g}</svg>`;
    }

    function message(Q) {
      const E = Q.E, flip = Q.dt < -EPS ? ' При отрицательном определителе меняется ориентация. Если до преобразования обойти вершины клетки против часовой стрелки, то после преобразования тот же порядок вершин даст обход по часовой.' : '';
      if (Q.rk === 0) return 'Все элементы равны нулю. Каждая точка сетки перешла в начало координат, поэтому <b>ранг равен 0</b>.';
      if (Q.rk === 1) return '<b>Определитель равен 0, ранг равен 1.</b> Все точки сетки оказались на одной прямой. Красный пунктир показывает, какие исходные точки перешли в начало координат. Однозначно восстановить исходную точку нельзя, поэтому обратной матрицы нет.';
      if (E.kind === 'complex') return `У матрицы два комплексных собственных значения, λ = ${f(E.re)} ± ${f(E.im)}i. Ни одна прямая через начало координат не переходит в себя. <b>Вещественных собственных векторов нет.</b>`;
      if (E.kind === 'scalar') return Math.abs(E.l1 - 1) < EPS ? 'Единичная матрица оставляет каждую точку на месте. Любой ненулевой вектор — собственный, λ = 1.' : `Матрица умножает каждый вектор на ${f(E.l1)}. Любой ненулевой вектор — собственный.${E.l1 < 0 ? ' Каждая стрелка меняет направление на противоположное.' : ''}`;
      if (E.kind === 'defective') return `Собственное значение λ = ${f(E.l1)} повторяется дважды. Все собственные векторы лежат на одной прямой. При сдвиге слоёв вдоль горизонтали это ось x.`;
      const neg = E.l2 < -EPS ? ' Каждый собственный вектор с отрицательным λ меняет направление на противоположное.' : '';
      return `У матрицы два собственных направления. Вектор v₁ умножается на ${f(E.l1)}, вектор v₂ — на ${f(E.l2)}. Произведение собственных значений равно определителю (${f(Q.dt)}).${neg}${flip}`;
    }

    function render() {
      const Q = cur();
      Q.M.forEach((v, i) => { $(`mw-r${i}`).value = v; $(`mw-v${i}`).textContent = f(v, 1); });
      box.querySelectorAll('[data-pre]').forEach(b => { const m = PRE.find(x => x[0] === b.dataset.pre)[2]; b.setAttribute('aria-pressed', String(m.every((v, i) => Math.abs(v - Q.M[i]) < 1e-9))); });
      plot(Q);
      const row = (lb, v, cls = '', w = '') => `<div class="mw-r${w}"><span>${lb}</span><b class="${cls}">${v}</b></div>`;
      $('mw-read').innerHTML = row('Определитель', f(Q.dt), Q.dt < -EPS ? 'neg' : Math.abs(Q.dt) <= EPS ? 'zero' : '') + row('Площадь клетки', f(Math.abs(Q.dt))) + row('Ранг', String(Q.rk)) + row('Собственные значения', lamTxt(Q.E), '', ' wide');
      $('mw-msg').innerHTML = message(Q);
      if (Q.rk < 2) s.done[0] = true;
      if (Q.E.kind === 'complex') s.done[1] = true;
      if (Q.dt < -EPS) s.done[2] = true;
      $('mw-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t)}</li>`).join('');
      $('mw-s1').textContent = `det = ${f(Q.dt)} · площадь ×${f(Math.abs(Q.dt))}`;
      $('mw-s2').textContent = `ранг ${Q.rk}`;
      $('mw-s3').textContent = `λ: ${Q.E.kind === 'complex' ? lamTxt(Q.E) + ' (комплексные)' : lamTxt(Q.E)}`;
    }
    NM.forEach((n, i) => $(`mw-r${i}`).addEventListener('input', e => { s.M[i] = +e.target.value; render(); }));
    box.addEventListener('click', e => { const b = e.target.closest('[data-pre]'); if (b) { s.M = PRE.find(x => x[0] === b.dataset.pre)[2].slice(); render(); } });
    $('mw-reset').addEventListener('click', () => { s = fresh(); render(); });
    s = fresh(); render();
    if ('ResizeObserver' in window) { let w0 = 0; new ResizeObserver(es => { const w = Math.round(es[0].contentRect.width); if (w && Math.abs(w - w0) > 4) { w0 = w; plot(cur()); } }).observe($('mw-plot')); }
    return {
      redraw() { plot(cur()); },
      describe() {
        const Q = cur(), m = Q.M.map(v => f(v, 1));
        return `матрица A = [[${m[0]}; ${m[1]}], [${m[2]}; ${m[3]}]]; определитель ${f(Q.dt)}; ранг ${Q.rk}; собственные значения ${lamTxt(Q.E)}${Q.E.kind === 'complex' ? ' (комплексные, вещественных собственных векторов нет)' : ''}; выполнено заданий ${s.done.filter(Boolean).length} из 3.`;
      }
    };
  }
  buildDeform.eig2 = eig2;       // для сверки с NumPy в песочнице
  buildDeform.rankOf = rankOf;

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-4-2',
    short: 'DA-04',
    title: 'Матричные операции как преобразования',
    where: 'блок «Дата аналитика», тема 04 «Математика для данных», страница 4.2',
    aiData: 'В clients.csv есть данные о 1 000 клиентах интернет-магазина: возраст, месячный доход, число заказов и траты за квартал. В анимации и интерактиве показаны 30 клиентов. Их координаты — стандартизованные месячный доход и траты за квартал.',
    scene,
    widgets: { deform: buildDeform },
    code: {
      cloud: { title: 'Как пять матриц преобразуют точки', badge: 'проверено: Python 3.13, NumPy 2.5.3', lang: 'python', outLabel: 'Вывод',
        code: `import numpy as np
import pandas as pd
np.set_printoptions(precision=3, suppress=True)

df = pd.read_csv("data/clients/clients.csv")
X = df[["income", "spend"]].to_numpy(dtype=float)
Z = (X - X.mean(axis=0)) / X.std(axis=0)        # у каждого столбца среднее 0 и стандартное отклонение 1
idx = np.random.default_rng(58).choice(len(Z), 30, replace=False)
P = Z[idx]                                      # две координаты каждого из 30 клиентов на рисунке

M = {"растяжение":  np.array([[2.0, 0.0], [0.0, 1.0]]),
     "сдвиг":       np.array([[1.0, 0.8], [0.0, 1.0]]),
     "поворот":     np.array([[0.8, -0.6], [0.6, 0.8]]),
     "общая":       np.array([[1.5, 1.0], [0.5, 1.0]]),
     "вырожденная": np.array([[1.0, 2.0], [0.5, 1.0]])}

for name, A in M.items():
    Q = P @ A.T                                 # строка результата хранит координаты вектора A @ p
    lam = np.linalg.eigvals(A)
    print(f"{name:11} det = {np.linalg.det(A):4.2f}  ранг облака "
          f"{np.linalg.matrix_rank(P)} → {np.linalg.matrix_rank(Q)}  λ = {np.round(lam, 2)}")

A = M["общая"]
lam, V = np.linalg.eig(A)                       # столбцы V — собственные векторы длины 1
lam, V = lam.real, V.real                       # для этой матрицы мнимые части равны нулю
print("A @ v₁ =", A @ V[:, 0], "  λ₁ · v₁ =", lam[0] * V[:, 0])
print("v₁ ∥", V[:, 0] / V[1, 0], "  v₂ ∥", V[:, 1] / V[0, 1])`,
        out: `растяжение  det = 2.00  ранг облака 2 → 2  λ = [2.+0.j 1.+0.j]
сдвиг       det = 1.00  ранг облака 2 → 2  λ = [1.+0.j 1.+0.j]
поворот     det = 1.00  ранг облака 2 → 2  λ = [0.8+0.6j 0.8-0.6j]
общая       det = 1.00  ранг облака 2 → 2  λ = [2. +0.j 0.5+0.j]
вырожденная det = 0.00  ранг облака 2 → 1  λ = [2.+0.j 0.+0.j]
A @ v₁ = [1.789 0.894]   λ₁ · v₁ = [1.789 0.894]
v₁ ∥ [2. 1.]   v₂ ∥ [ 1. -1.]`,
        note: 'В выводе NumPy 2.5 запись 2.+0.j означает вещественное значение 2 с нулевой мнимой частью. В более ранних версиях его можно увидеть как 2. У матрицы поворота на 37° оба значения имеют ненулевую мнимую часть (0,8 ± 0,6i). У матрицы сдвига одно и то же значение 1 встречается дважды, а все собственные векторы лежат на одной прямой.' },
      pca: { title: 'Сколько дисперсии сохраняет первая главная компонента', badge: 'проверено: Python 3.13, NumPy 2.5.3', lang: 'python', outLabel: 'Вывод',
        code: `cols = ["age", "income", "orders", "spend"]
X = df[cols].to_numpy(dtype=float)              # (1000, 4)
Z = (X - X.mean(axis=0)) / X.std(axis=0)
C = Z.T @ Z / len(Z)                            # ковариационная матрица, (4, 4)
print(C)
print("совпадает с np.cov:", np.allclose(C, np.cov(Z, rowvar=False, ddof=0)))

lam, V = np.linalg.eig(C)
lam, V = lam.real, V.real                       # у симметричной матрицы всё вещественное
order = np.argsort(lam)[::-1]                   # по убыванию λ
lam, V = lam[order], V[:, order]
print("λ:", lam, " сумма:", lam.sum().round(3))
print("доля разброса:", (lam / lam.sum()).round(3))
print("v₁:", "  ".join(f"{c} {v:.3f}" for c, v in zip(cols, V[:, 0])))
pc1 = Z @ V[:, 0]                               # координата каждого клиента вдоль v₁
print("дисперсия вдоль v₁:", pc1.var().round(3))`,
        out: `[[1.    0.146 0.08  0.04 ]
 [0.146 1.    0.418 0.5  ]
 [0.08  0.418 1.    0.836]
 [0.04  0.5   0.836 1.   ]]
совпадает с np.cov: True
λ: [2.208 1.005 0.631 0.156]  сумма: 4.0
доля разброса: [0.552 0.251 0.158 0.039]
v₁: age 0.119  income 0.482  orders 0.605  spend 0.622
дисперсия вдоль v₁: 2.208`,
        note: 'Таблица df загружается в предыдущей ячейке. Для вещественных симметричных матриц можно также вызвать eigh. Она возвращает вещественные собственные значения в порядке возрастания.' },
      lstsq: { title: 'Прогноз трат по доходу и числу заказов', badge: 'проверено: Python 3.13, NumPy 2.5.3', lang: 'python', outLabel: 'Вывод',
        code: `np.set_printoptions(precision=4, suppress=True)
X = np.c_[np.ones(len(df)), df["income"], df["orders"]]   # (1000, 3): единицы — свободный член
y = df["spend"].to_numpy(dtype=float)                       # (1000,)

w, rss, rank, sv = np.linalg.lstsq(X, y)
print("w =", w, " ранг X:", rank)

w_ne = np.linalg.solve(X.T @ X, X.T @ y)       # нормальное уравнение XᵀX w = Xᵀy
print("через нормальное уравнение:", w_ne, np.allclose(w, w_ne))

pred = X @ w                                    # (1000, 3) @ (3,) → (1000,)
r2 = 1 - ((y - pred) ** 2).sum() / ((y - y.mean()) ** 2).sum()
print("R² =", round(r2, 3))
print("клиент 1:", df.loc[0, ["income", "orders", "spend"]].tolist(), "→ прогноз", round(pred[0]))
print("Xᵀ(y − Xw) / n =", X.T @ (y - pred) / len(y))   # остатки перпендикулярны столбцам X`,
        out: `w = [ 204.6891    0.0347 2549.5291]  ранг X: 3
через нормальное уравнение: [ 204.6891    0.0347 2549.5291] True
R² = 0.727
клиент 1: [80000, 2, 9080] → прогноз 8083
Xᵀ(y − Xw) / n = [0. 0. 0.]`,
        note: 'Последняя строка показывает скалярные произведения вектора остатков со столбцами X, делённые на число наблюдений. С точностью до округления все они равны нулю, как и следует из нормального уравнения.' },
      order: { title: 'Когда важен порядок матриц и какие размерности совместимы', badge: 'проверено: Python 3.13, NumPy 2.5.3', lang: 'python', outLabel: 'Вывод',
        code: `import numpy as np
np.set_printoptions(precision=3, suppress=True)

S = np.array([[2.0, 0.0], [0.0, 1.0]])     # растяжение по горизонтали
R = np.array([[0.8, -0.6], [0.6, 0.8]])    # поворот на 36,87°
print("S @ R — сначала поворот, потом растяжение:\\n", S @ R)
print("R @ S — сначала растяжение, потом поворот:\\n", R @ S)
print("det:", np.linalg.det(S @ R).round(3), np.linalg.det(R @ S).round(3))

A = np.ones((3, 4))
B = np.ones((3, 4))
print("A * B:", (A * B).shape, "  A @ B.T:", (A @ B.T).shape, "  A.T @ B:", (A.T @ B).shape)
try:
    A @ B
except ValueError as e:
    print("A @ B → ValueError:", e)`,
        out: `S @ R — сначала поворот, потом растяжение:
 [[ 1.6 -1.2]
 [ 0.6  0.8]]
R @ S — сначала растяжение, потом поворот:
 [[ 1.6 -0.6]
 [ 1.2  0.8]]
det: 2.0 2.0
A * B: (3, 4)   A @ B.T: (3, 3)   A.T @ B: (4, 4)
A @ B → ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?) (size 3 is different from 4)` },
      cond: { title: 'Погрешность двух способов решить систему', badge: 'проверено: Python 3.13, NumPy 2.5.3', lang: 'python', outLabel: 'Вывод',
        code: `import numpy as np
import pandas as pd

n = 10
H = 1 / (np.arange(1, n + 1)[:, None] + np.arange(n))   # матрица Гильберта 10 × 10
x_true = np.ones(n)
b = H @ x_true                                           # знаем ответ заранее: x = (1, …, 1)
print(f"cond(H) = {np.linalg.cond(H):.1e}")
x_solve = np.linalg.solve(H, b)
for name, x in [("inv(H) @ b ", np.linalg.inv(H) @ b), ("solve(H, b)", x_solve)]:
    print(f"{name}  ошибка в x: {np.abs(x - x_true).max():.1e}   невязка H·x − b: {np.abs(H @ x - b).max():.1e}")
np.testing.assert_allclose(H @ x_solve, b, rtol=1e-12, atol=1e-14)

df = pd.read_csv("data/clients/clients.csv")
X = np.c_[np.ones(len(df)), df["income"], df["orders"]]
Z = np.c_[np.ones(len(df)), (df[["income", "orders"]] - df[["income", "orders"]].mean()) / df[["income", "orders"]].std(ddof=0)]
print(f"рубли:          cond(X) = {np.linalg.cond(X):.1e}   cond(XᵀX) = {np.linalg.cond(X.T @ X):.1e}")
print(f"стандартизация: cond(X) = {np.linalg.cond(Z):.1f}       cond(XᵀX) = {np.linalg.cond(Z.T @ Z):.1f}")`,
        out: `cond(H) = 1.6e+13
inv(H) @ b   ошибка в x: 4.9e-03   невязка H·x − b: 9.7e-05
solve(H, b)  ошибка в x: 2.4e-05   невязка H·x − b: 4.4e-16
рубли:          cond(X) = 2.2e+05   cond(XᵀX) = 5.0e+10
стандартизация: cond(X) = 1.6       cond(XᵀX) = 2.4`,
        note: 'В этом запуске solve даёт меньшую ошибку решения и меньшую невязку. Невязка показывает, насколько H·x отличается от b. Числа при повторном запуске зависят от библиотеки линейной алгебры, которую использует NumPy.' },
      rank: { title: 'Ранг при коллинеарных признаках', badge: 'проверено: Python 3.13, NumPy 2.5.3', lang: 'python', outLabel: 'Вывод',
        code: `import numpy as np
import pandas as pd
np.set_printoptions(precision=4, suppress=True)

df = pd.read_csv("data/clients/clients.csv")
y = df["spend"].to_numpy(dtype=float)
X = np.c_[np.ones(len(df)), df["income"], df["orders"], df["income"] / 1000]   # доход ещё раз, в тысячах
print("столбцов:", X.shape[1], "  ранг:", np.linalg.matrix_rank(X))
print("det(XᵀX) =", np.linalg.det(X.T @ X))
try:
    np.linalg.solve(X.T @ X, X.T @ y)
except np.linalg.LinAlgError as e:
    print("solve → LinAlgError:", e)
w, rss, rank, sv = np.linalg.lstsq(X, y)
print("lstsq: ранг", rank, "  сингулярные числа:", sv.round(1))
print("w =", w, "  вклад дохода:", round(w[1] + w[3] / 1000, 4))`,
        out: `столбцов: 4   ранг: 3
det(XᵀX) = 0.0
solve → LinAlgError: Singular matrix
lstsq: ранг 3   сингулярные числа: [2784574.8      68.9      12.4       0. ]
w = [ 204.6891    0.0347 2549.5291    0.    ]   вклад дохода: 0.0347`,
        note: 'Коэффициент при доходе в тысячах рублей равен примерно 3,5 · 10⁻⁵ и округляется до нуля на экране. Из всех решений lstsq выбрала вектор с наименьшей евклидовой нормой. Последнее сингулярное число близко к нулю, ранг равен 3. Из-за округления в другой сборке solve иногда возвращает коэффициенты. Их наличие ещё не означает, что решение единственно.' }
    },
    questions: {
    q1: { sec: 'deform', title: 'Сначала предскажите', q: 'Вы подобрали матрицу с нулевым определителем. Что произойдёт с облаком из 30 точек?', opts: [['Оно повернётся на 90°'], ['Все точки окажутся на одной прямой или совпадут в начале координат', 1], ['Облако сохранит форму и займёт вдвое меньшую площадь'], ['Расстояния между всеми точками увеличатся']],
      why: 'Нулевой определитель означает, что у преобразованной клетки нулевая площадь. Если хотя бы один элемент матрицы отличен от нуля, все точки окажутся на одной прямой. При нулевой матрице все они перейдут в начало координат. Сравните оба случая с помощью ползунков.' },
    q2: { sec: 'idea', q: 'У матрицы A собственные значения 2 и 0,5. Почему после преобразования площадь клетки не изменилась?', opts: [['Определитель не зависит от собственных значений'], ['Площадь умножилась на произведение собственных значений, равное 1', 1], ['Площадь определяется суммой собственных значений'], ['Любая матрица с двумя собственными векторами задаёт поворот']],
      why: 'Вдоль одного собственного направления A растягивает векторы вдвое, вдоль другого сжимает вдвое. Произведение 2 · 0,5 равно 1, это и есть определитель. Сумма собственных значений даёт другую величину — след матрицы, то есть сумму элементов на главной диагонали.' },
    q3: { sec: 'nuances', q: 'Почему при вычислении A @ B возникает ValueError?', code: 'A = np.ones((3, 4))\nB = np.ones((3, 4))\nA @ B', lang: 'python', opts: [['Матрицы заполнены единицами'], ['Четыре столбца A не соответствуют трём строкам B', 1], ['Матричное умножение запрещено для двух массивов одинаковой формы'], ['Перед умножением нужно явно задать тип float']],
      why: 'Для произведения A @ B число столбцов A должно равняться числу строк B. Здесь эти числа равны 4 и 3. Произведение A @ B.T допустимо и имеет форму (3, 3), а A.T @ B имеет форму (4, 4). И значения элементов, и их тип для этого примера подходят.' },
    q4: { sec: 'idea', q: 'Что означает равенство det(XᵀX) = 0 для столбцов матрицы X и коэффициентов регрессии?', opts: [['Столбцы линейно зависимы, поэтому коэффициенты по этим данным не определяются однозначно', 1], ['Во всех столбцах стоят нули'], ['Все признаки независимы друг от друга'], ['После стандартизации всех признаков определитель обязательно станет ненулевым']],
      why: 'Если столбцы линейно зависимы, один и тот же прогноз можно получить с разными коэффициентами. Например, два столбца могут содержать доход в рублях и в тысячах рублей. Пересчёт единиц и стандартизация сохраняют эту зависимость. Ранг X покажет, сколько столбцов линейно независимы.' },
    q5: { sec: 'code', q: 'Какое направление выбирают для первой главной компоненты?', opts: [['Ось признака, записанного в первом столбце'], ['Направление, вдоль которого дисперсия проекций точек максимальна', 1], ['Направление, вдоль которого дисперсия проекций точек минимальна'], ['Прямую под углом 45° независимо от данных']],
      why: 'Возьмём единичный собственный вектор ковариационной матрицы и спроецируем на него точки. Дисперсия их координат будет равна соответствующему собственному значению. Поэтому для первой компоненты выбирают наибольшее значение. В примере с двумя признаками на первую компоненту приходится около 75% общей дисперсии, с четырьмя — около 55%.' },
    q6: { sec: 'nuances', q: 'Почему в примере с квадратной невырожденной матрицей для решения A·x = b выбрали np.linalg.solve(A, b)?', opts: [['inv работает только с матрицами 2 × 2'], ['solve решает систему напрямую и не требует вычислять обратную матрицу', 1], ['solve сама удаляет коллинеарные признаки'], ['solve всегда даёт точный ответ без округления']],
      why: 'Построение обратной матрицы для вычисления inv(A) @ b требует дополнительных операций и может увеличить погрешность. В примере с матрицей Гильберта максимальная ошибка в координатах решения составила около 5 · 10⁻³ для inv и 2 · 10⁻⁵ для solve. Даже при использовании solve результат чувствителен к округлению, если система плохо обусловлена.' },
    q7: { sec: 'nuances', q: 'S растягивает плоскость по горизонтали, R поворачивает её. Что произойдёт с точкой p?', code: 'q = S @ R @ p', lang: 'python', opts: [['Сначала растяжение, затем поворот'], ['Сначала поворот, затем растяжение', 1], ['Результат обязательно совпадёт с R @ S @ p'], ['Порядок преобразований зависит от координат p']],
      why: 'На вектор первой действует матрица R, потому что (S·R)·p = S·(R·p). В Python оператор @ группируется слева направо, поэтому выражение без скобок сначала вычисляет произведение S @ R. Эта составная матрица задаёт те же два геометрических действия. В общем случае перестановка S и R меняет результат.' }
    },
    glossary: {
      lintrans: { t: 'Линейное преобразование', en: 'linear transformation', d: 'Преобразование T, которое сохраняет сложение векторов и умножение на число. Если известны образы базисных векторов, действие T можно записать матрицей.' },
      basis: { t: 'Базисные векторы', en: 'basis vectors', d: 'Набор векторов, через который любой вектор пространства единственным образом представляется как линейная комбинация. В обычном базисе плоскости это î = (1, 0) и ĵ = (0, 1).' },
      det: { t: 'Определитель', en: 'determinant', d: 'Характеристика квадратной матрицы. На плоскости модуль определителя равен коэффициенту изменения площади, а знак показывает, сохранилась ли ориентация.' },
      rank: { t: 'Ранг', en: 'rank', d: 'Максимальное число линейно независимых столбцов матрицы. Ранг равен размерности пространства, в которое матрица отображает исходные векторы.' },
      eigvec: { t: 'Собственный вектор', en: 'eigenvector', d: 'Ненулевой вектор v, для которого A·v = λ·v. Множитель λ может быть положительным, отрицательным или нулевым, если собственное значение вещественно.' },
      eigval: { t: 'Собственное значение', en: 'eigenvalue', d: 'Число λ, для которого у матрицы A есть ненулевой вектор v, удовлетворяющий равенству A·v = λ·v.' },
      cov: { t: 'Ковариационная матрица', en: 'covariance matrix', d: 'Квадратная матрица, в которой для каждой пары признаков записана их ковариация. На главной диагонали стоят дисперсии самих признаков.' },
      pca: { t: 'Метод главных компонент', en: 'principal component analysis, PCA', d: 'Способ выразить данные в новых, взаимно перпендикулярных координатах. Оси задают собственные векторы ковариационной матрицы в порядке убывания собственных значений. Первая координата имеет наибольшую дисперсию.' },
      linreg: { t: 'Линейная регрессия', en: 'linear regression', d: 'Модель, в которой прогноз складывается из свободного члена и взвешенной суммы признаков.' },
      system: { t: 'Система линейных уравнений', en: 'system of linear equations', d: 'Набор линейных уравнений с общими неизвестными. В матричной записи A·x = b матрица A содержит коэффициенты, x — неизвестные, b — правые части уравнений.' },
      standardize: { t: 'Стандартизация', en: 'standardization, z-score', d: 'Из каждого значения признака вычитают среднее и делят разность на стандартное отклонение. Если исходное стандартное отклонение ненулевое, среднее результата равно 0, а стандартное отклонение — 1.' },
      transpose: { t: 'Транспонирование', en: 'transpose', d: 'Операция, при которой строки матрицы становятся столбцами. В NumPy для двумерной матрицы X результат записывают как X.T.' },
      identity: { t: 'Единичная матрица', en: 'identity matrix', d: 'Квадратная матрица с единицами на главной диагонали и нулями вне неё. Она переводит любой вектор в него самого.' },
      inverse: { t: 'Обратная матрица', en: 'inverse matrix', d: 'Матрица A⁻¹, которая отменяет действие A. У квадратной матрицы она существует тогда и только тогда, когда det A ≠ 0.' },
      singular: { t: 'Вырожденная матрица', en: 'singular matrix', d: 'Квадратная матрица, определитель которой равен нулю. Она может перевести разные векторы в один и тот же вектор, поэтому у неё нет обратной.' },
      collinear: { t: 'Коллинеарность', en: 'collinearity', d: 'Линейная зависимость между признаками. При точной коллинеарности столбец можно выразить как линейную комбинацию остальных. При близкой к точной зависимости оценки коэффициентов чувствительны к изменениям данных.' },
      complex: { t: 'Комплексное число', en: 'complex number', d: 'Число вида x + y·i, где x и y вещественны и i² = −1. В Python мнимую единицу записывают как 1j.' },
      symmetric: { t: 'Симметричная матрица', en: 'symmetric matrix', d: 'Квадратная матрица, которая при транспонировании совпадает с собой. Её элементы симметричны относительно главной диагонали.' },
      lsq: { t: 'Метод наименьших квадратов', en: 'least squares', d: 'Способ подобрать коэффициенты модели так, чтобы сумма квадратов разностей между наблюдениями и прогнозами была минимальной.' },
      normaleq: { t: 'Нормальное уравнение', en: 'normal equation', d: 'Условие XᵀX·w = Xᵀy для коэффициентов, минимизирующих сумму квадратов остатков. Решение единственно, если столбцы X линейно независимы.' },
      cond: { t: 'Число обусловленности', en: 'condition number', d: 'Мера чувствительности решения к изменению исходных данных. Для невырожденной матрицы в евклидовой норме это отношение наибольшего сингулярного числа к наименьшему.' },
      svd: { t: 'Сингулярное разложение', en: 'singular value decomposition, SVD', d: 'Разложение матрицы в произведение X = U·Σ·Vᵀ. Вещественные ортогональные матрицы U и V задают повороты или отражения, а неотрицательные числа на диагонали Σ — коэффициенты масштабирования.' },
      tensor: { t: 'Тензор', en: 'tensor', d: 'В машинном обучении тензоры представляют массивами с любым числом осей. Например, у набора цветных изображений четыре оси — номер изображения, высота, ширина и цветовой канал.' }
    },
    materials: [
      ['da-4-2-matrix-transforms.md', 'Текст урока, примеры кода, вопросы и глоссарий в Markdown'],
      ['data/clients/', 'Таблица с данными 1 000 клиентов учебного магазина'],
      ['matrix_transforms.ipynb', 'Ноутбук с шестью примерами, от умножения матриц до регрессии'],
      ['deform.py', 'Скрипт для проверки своей матрицы 2 × 2 с помощью NumPy']
    ],
    prompts: [
      ['Как матрица меняет сетку', 'Предложи матрицу 2 × 2. Я попробую описать, куда перейдут векторы (1, 0) и (0, 1), как изменится площадь клетки и чему равен определитель. Проверь мой ответ, а затем предложи другую матрицу.'],
      ['Главные компоненты моей таблицы', 'Помоги найти первую главную компоненту в моей таблице. Сначала выясни, какие у меня признаки и в каких единицах они измерены. Затем разберём подготовку данных, ковариационную матрицу и долю дисперсии, которую объясняет первая компонента. Предлагай по одному шагу и жди моего ответа.'],
      ['Почему не решается система уравнений', 'В моей модели np.linalg.solve(X.T @ X, X.T @ y) выдаёт LinAlgError. Помоги проверить размерности, ранг и зависимость между столбцами. Спрашивай по одному признаку за раз и объясни, как подтвердить причину ошибки.']
    ]
  };
})();
