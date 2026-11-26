/* Страница 6.5 · Корреляция и причинность */
(() => {
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  // число по-русски: пробел между разрядами, десятичная запятая, настоящий минус
  const num = (v, d = 2, plus = false) => {
    if (!isFinite(v)) return '—';
    const r = Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v, s = Math.abs(r).toFixed(d).split('.');
    return (r < 0 ? '−' : plus && r > 0 ? '+' : '') + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (s[1] ? ',' + s[1] : '');
  };
  // var() и color-mix() в атрибутах SVG работают не везде: переносим fill, stroke и шрифт в style
  const vs = h => h.replace(/<(\w+)([^>]*?)(\/?)>/g, (m, tag, at, sl) => {
    let st = '';
    at = at.replace(/\s(fill|stroke|stop-color|font-family)="((?:var|color-mix)\([^"]*\))"/g, (mm, k, v) => { st += `${k}:${v};`; return ''; });
    if (!st) return m;
    at = /\sstyle="/.test(at) ? at.replace(/\sstyle="/, ` style="${st}`) : `${at} style="${st}"`;
    return `<${tag}${at}${sl}>`;
  });
  const escX = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Данные посчитаны NumPy и pandas в data/gen.py (seed 6501, 6505, 6510), квартет Энскомба — из статьи 1973 года
  /*data:start*/const DATA = {"circ":{"x":[-0.2808,-0.7116,1.0633,0.9707,0.2218,-0.8414,-0.2811,-0.5519,1.4153,-0.4637,-1.686,0.5935,0.7557,-0.2815,1.7979,1.2341,-0.4888,-1.5491,1.7126,1.3103,-0.3427,0.2711,-0.6066,1.1597,-0.3727,-1.891,-0.5649,-0.8118,-0.7005,-0.0797],"e":[-0.2662,0.0003,0.0969,-0.6818,-0.6288,-0.6972,0.3317,1.2055,-0.5349,0.3535,-0.8943,1.2828,1.0611,-0.6175,-1.1739,0.8778,1.3671,2.2794,-0.4486,-0.3435,-1.474,-0.2673,-0.4455,0.1492,0.5489,-2.2224,0.8704,0.4192,-1.39,1.2421],"circR":[-0.0,0.01,0.02,0.03,0.04,0.05,0.06,0.07,0.08,0.09,0.1,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,0.2,0.21,0.22,0.23,0.24,0.25,0.26,0.27,0.28,0.29,0.3,0.31,0.32,0.33,0.34,0.35,0.36,0.37,0.38,0.39,0.4,0.41,0.42,0.43,0.44,0.45,0.46,0.47,0.48,0.49,0.5,0.51,0.52,0.53,0.54,0.55,0.56,0.57,0.58,0.59,0.6,0.61,0.62,0.63,0.64,0.65,0.66,0.67,0.68,0.69,0.7,0.71,0.72,0.73,0.74,0.75,0.76,0.77,0.78,0.79,0.8,0.81,0.82,0.83,0.84,0.85,0.86,0.87,0.88,0.89,0.9,0.91,0.92,0.93,0.94,0.95,0.96,0.97,0.98,0.99,1.0],"circCov":[-0.0,0.03,0.06,0.09,0.12,0.15,0.18,0.21,0.24,0.27,0.3,0.33,0.36,0.39,0.42,0.45,0.48,0.51,0.54,0.57,0.6,0.63,0.66,0.69,0.72,0.75,0.78,0.81,0.84,0.87,0.9,0.93,0.96,0.99,1.02,1.05,1.08,1.11,1.14,1.17,1.2,1.23,1.26,1.29,1.32,1.35,1.38,1.41,1.44,1.47,1.5,1.53,1.56,1.59,1.62,1.65,1.68,1.71,1.74,1.77,1.8,1.83,1.86,1.89,1.92,1.95,1.98,2.01,2.04,2.07,2.1,2.13,2.16,2.19,2.22,2.25,2.28,2.31,2.34,2.37,2.4,2.43,2.46,2.49,2.52,2.55,2.58,2.61,2.64,2.67,2.7,2.73,2.76,2.79,2.82,2.85,2.88,2.91,2.94,2.97,3.0],"circSp":[0.0171,0.0278,0.0278,0.0296,0.0296,0.0429,0.0465,0.0465,0.0683,0.0683,0.0736,0.079,0.0808,0.0945,0.1034,0.1101,0.115,0.143,0.1582,0.1786,0.1786,0.1786,0.1853,0.192,0.1969,0.2067,0.2196,0.2294,0.236,0.2458,0.2489,0.2538,0.2565,0.2721,0.2819,0.2894,0.2912,0.3037,0.3112,0.3184,0.3388,0.3446,0.3446,0.3771,0.3842,0.3967,0.402,0.4198,0.4198,0.4198,0.4198,0.43,0.4443,0.475,0.4839,0.4919,0.5057,0.5119,0.527,0.5475,0.5537,0.5537,0.5635,0.5742,0.5956,0.6222,0.6352,0.6463,0.6614,0.6845,0.6845,0.6948,0.7281,0.7281,0.7348,0.7433,0.7473,0.7606,0.7664,0.7749,0.7802,0.7855,0.8011,0.8127,0.822,0.8296,0.8394,0.8434,0.8576,0.8665,0.8857,0.8954,0.9079,0.9181,0.923,0.9301,0.9417,0.9475,0.9657,0.98,1.0],"sx":2.0,"sy":1.5,"cov":1.8,"covK":1800.0,"r06":0.6,"r06k":0.6,"sp06":0.5537,"pos":20},"anscombe":[{"k":"I","x":[10.0,8.0,13.0,9.0,11.0,14.0,6.0,4.0,12.0,7.0,5.0],"y":[8.04,6.95,7.58,8.81,8.33,9.96,7.24,4.26,10.84,4.82,5.68],"r":0.8164,"sp":0.8182,"mx":9.0,"vx":11.0,"my":7.5009,"vy":4.1273,"w":[0.5001,3.0001],"cov":5.501},{"k":"II","x":[10.0,8.0,13.0,9.0,11.0,14.0,6.0,4.0,12.0,7.0,5.0],"y":[9.14,8.14,8.74,8.77,9.26,8.1,6.13,3.1,9.13,7.26,4.74],"r":0.8162,"sp":0.6909,"mx":9.0,"vx":11.0,"my":7.5009,"vy":4.1276,"w":[0.5,3.0009],"cov":5.5},{"k":"III","x":[10.0,8.0,13.0,9.0,11.0,14.0,6.0,4.0,12.0,7.0,5.0],"y":[7.46,6.77,12.74,7.11,7.81,8.84,6.08,5.39,8.15,6.42,5.73],"r":0.8163,"sp":0.9909,"mx":9.0,"vx":11.0,"my":7.5,"vy":4.1226,"w":[0.4997,3.0025],"cov":5.497},{"k":"IV","x":[8.0,8.0,8.0,8.0,8.0,8.0,8.0,19.0,8.0,8.0,8.0],"y":[6.58,5.76,7.71,8.84,8.47,7.04,5.25,12.5,5.56,7.91,6.89],"r":0.8165,"sp":0.5,"mx":9.0,"vx":11.0,"my":7.5009,"vy":4.1232,"w":[0.4999,3.0017],"cov":5.499}],"conf":{"z":[2.4,1.7,5.0,1.1,3.8,5.7,1.1,5.1,1.7,2.8,4.8,1.9,0.4,3.1,1.7,4.0,3.3,4.7,2.7,4.7,3.8,2.7,3.1,5.9,3.6,5.6,2.1,1.7,2.6,5.0],"s":[12.0,9.0,23.0,5.0,13.0,23.0,6.0,23.0,11.0,13.0,22.0,9.0,4.0,14.0,4.0,18.0,13.0,13.0,18.0,21.0,13.0,13.0,12.0,20.0,15.0,18.0,12.0,4.0,10.0,26.0],"y":[4.7,5.6,8.9,2.9,6.2,12.3,4.7,8.6,4.4,2.7,8.0,3.5,6.9,6.1,7.7,9.0,8.1,7.6,6.2,10.1,8.0,5.6,8.3,10.2,7.0,8.7,6.5,2.3,4.2,7.4],"g":[1,0,2,0,1,2,0,2,0,1,2,0,0,1,0,2,1,2,1,2,1,1,1,2,1,2,1,0,1,2],"r":0.6724,"partial":0.0276,"within":[-0.1736,0.1879,0.1609],"ng":[8,12,10],"rz":[0.8859,0.7494],"sp":0.6806,"cov":10.0117,"fit":[0.2586,3.152],"fits":[[-0.1185,5.5204],[0.1616,4.0056],[0.0644,7.746]],"sr":[[4.0,11.0],[10.0,18.0],[13.0,26.0]]},"simpson":{"cats":["посуда","текстиль","свет"],"pts":[[0,4,2470],[0,3,2550],[0,5,2280],[0,11,1880],[0,2,2240],[0,9,2110],[0,11,1820],[0,6,2050],[0,8,1940],[0,3,2090],[0,10,2370],[0,12,2050],[0,6,2240],[0,6,1800],[0,1,2770],[0,9,2300],[0,4,1950],[0,2,2560],[0,6,2250],[0,0,2620],[0,4,2220],[0,4,2050],[0,11,1820],[0,2,2650],[0,3,2190],[0,10,2200],[0,12,1910],[0,11,2090],[0,4,2560],[0,6,2340],[0,12,1860],[0,11,1910],[0,3,2000],[0,10,2040],[0,9,2410],[0,2,2640],[0,1,2440],[0,5,1920],[0,8,2020],[0,3,2560],[1,10,5480],[1,20,3470],[1,9,4850],[1,13,5620],[1,8,5310],[1,21,4040],[1,14,5660],[1,21,4420],[1,9,5030],[1,16,4170],[1,19,3790],[1,10,4870],[1,13,4950],[1,17,4180],[1,18,3940],[1,18,4560],[1,14,5830],[1,22,3970],[1,9,5540],[1,11,6070],[1,17,3470],[1,9,4390],[1,20,4310],[1,21,3670],[1,18,4170],[1,10,4700],[1,21,3720],[1,10,4820],[1,16,3760],[1,18,4250],[1,19,4790],[1,13,5100],[1,19,3890],[1,9,4690],[1,11,5570],[1,12,5440],[1,11,4840],[1,9,5270],[1,8,5020],[1,14,4760],[2,16,7220],[2,29,5240],[2,24,6050],[2,20,7390],[2,25,6130],[2,24,5950],[2,25,7610],[2,24,7110],[2,19,8210],[2,26,6370],[2,21,7390],[2,24,6380],[2,25,7140],[2,23,7020],[2,25,7030],[2,21,6270],[2,23,6270],[2,27,6560],[2,19,6990],[2,28,5830],[2,19,8750],[2,26,7420],[2,25,7290],[2,22,6870],[2,20,6950],[2,20,6860],[2,23,6730],[2,22,6560],[2,19,8930],[2,29,6660],[2,20,6500],[2,20,7680],[2,17,7330],[2,19,7500],[2,18,8310],[2,20,8560],[2,19,6950],[2,20,6720],[2,26,6620],[2,18,6890]],"r":0.7298,"fit":[197.5926,1797.676],"within":[-0.6504,-0.7028,-0.5607],"fits":[[-48.0216,2503.1842],[-107.7849,6214.2969],[-131.2682,9926.7183]],"ranges":[[0,12],[8,22],[16,29]]},"heat":{"cols":["age","income","orders","spend"],"m":[[1.0,0.15,0.08,0.04],[0.15,1.0,0.42,0.5],[0.08,0.42,1.0,0.84],[0.04,0.5,0.84,1.0]]}};/*data:end*/

  /* ===================== Сцена ===================== */
  const CI = DATA.circ, AN = DATA.anscombe, CF = DATA.conf;
  const SC = { ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#8d95aa', dim: '#5d6880', frame: '#0e1422', line: '#24304a', acc: '#36b8a6', pink: '#f06ba5', yel: '#e3c04d', blue: '#6fa2ea' };
  const GCOL = ['#8a7a3c', '#c2a443', '#f2d36b'];          // стаж: светлее — дольше
  const GNAME = ['до 2 лет', '2–4 года', 'от 4 лет'];
  const rAt = (k, p) => {                                    // задуманное r облака на шаге k
    if (k === 0) return 0;
    if (k === 1) return lerp(0, .5, ease(seg(p, .05, .85)));
    if (k === 2) return lerp(.5, 1, ease(seg(p, .05, .8)));
    if (k === 3) return lerp(1, .6, ease(seg(p, 0, .18)));
    return .6;
  };

  function sceneState(k, p) {
    if (k <= 4) {
      const ri = Math.round(rAt(k, p) * 100);
      const s = { mode: 'cloud', ri, ptsA: k === 0 ? seg(p, 0, .4) : 1, mean: 0, rect: 0, ticks: k >= 3 ? 1 : 0, kilo: 0, calls: [] };
      if (k === 0) s.calls.push(['zero', seg(p, .5, .62)]);
      if (k === 1) s.calls.push(['half', seg(p, .86, .96)]);
      if (k === 2) s.calls.push(['one', seg(p, .82, .92)]);
      if (k === 3) { s.mean = seg(p, .18, .3); s.rect = seg(p, .3, .75); s.calls.push(['plus', seg(p, .76, .84)], ['cov', seg(p, .86, .94)]); }
      if (k === 4) { s.mean = 1; s.rect = 1; s.kilo = p >= .3 ? 1 : 0; s.stretch = seg(p, .12, .3); s.calls.push(['kilo', seg(p, .34, .44)], ['r', seg(p, .66, .76)]); }
      return s;
    }
    if (k <= 6) {
      const s = { mode: 'ans', panA: k === 5 ? seg(p, 0, .3) : 1, lineA: k === 5 ? seg(p, .3, .5) : 1, cap: [0, 1, 2, 3].map(i => (k === 5 ? seg(p, .52 + i * .1, .6 + i * .1) : 1)), rA: k === 5 ? seg(p, .92, 1) : 1, spA: k === 6 ? [0, 1, 2, 3].map(i => seg(p, .15 + i * .14, .25 + i * .14)) : [0, 0, 0, 0], hi: k === 6 ? seg(p, .1, .25) : 0 };
      return s;
    }
    const s = { mode: 'conf', ptsA: k === 7 ? seg(p, 0, .3) : 1, lineA: k === 7 ? seg(p, .3, .45) : k === 8 ? 1 - seg(p, .7, .85) : 0, arrA: k === 7 ? seg(p, .45, .6) : 1, lab: k === 7 ? seg(p, .6, .75) : k === 8 ? 1 - seg(p, .25, .4) : 0, zIn: k === 7 ? 0 : k === 8 ? ease(seg(p, .05, .35)) : 1, pull: k === 7 ? 0 : k === 8 ? ease(seg(p, .4, .7)) : 1, zLab: k === 8 ? seg(p, .72, .84) : k === 9 ? 1 : 0, col: k === 7 ? 0 : k === 8 ? seg(p, .72, .9) : 1, gl: k === 9 ? seg(p, .1, .4) : 0, glLab: k === 9 ? seg(p, .4, .6) : 0, q: k === 8 ? seg(p, .7, .85) : k === 9 ? 1 : 0, calls: [] };
    if (k === 7) s.calls.push(['r67', seg(p, .5, .62)]);
    if (k === 9) s.calls.push(['part', seg(p, .66, .8)]);
    return s;
  }

  const scene = {
    parts: [{ n: '01', name: 'От облака к прямой', s: [0, 1, 2] }, { n: '02', name: 'Ковариация', s: [3, 4] }, { n: '03', name: 'Энскомб', s: [5, 6] }, { n: '04', name: 'Визиты и траты', s: [7] }, { n: '05', name: 'Стаж клиента', s: [8, 9] }],
    steps: [
      { title: 'Облако с нулевой корреляцией', dur: 2600, body: '<p>У&nbsp;каждой из&nbsp;30 точек есть две координаты, x и&nbsp;y. Мы&nbsp;подобрали их&nbsp;так, чтобы коэффициент Пирсона равнялся нулю.</p><p>У&nbsp;этого облака нет заметного наклона. Само значение <b>r = 0</b> ещё не&nbsp;означает, что переменные независимы.</p>' },
      { title: 'Как появляется наклон', dur: 3200, body: '<p>Оставим x без изменений. Каждую координату y вычислим как сумму двух слагаемых. Одно пропорционально x, другое задаёт разброс вокруг прямой.</p><p>При <b>r = 0,5</b> большим x чаще соответствуют большие y. Точки при этом заметно отклоняются от&nbsp;линии.</p>' },
      { title: 'Все точки на прямой', dur: 3000, body: '<p>При <b>r = 1</b> слагаемое, которое задавало разброс, равно нулю. Все точки лежат на&nbsp;возрастающей прямой.</p><p>Если бы&nbsp;все точки лежали на&nbsp;убывающей прямой, коэффициент был бы&nbsp;равен −1.</p>' },
      { title: 'Как складываются отклонения', dur: 4200, body: '<p>Линии через средние x̄ и&nbsp;ȳ делят диаграмму на&nbsp;четыре части. В&nbsp;правой верхней и&nbsp;левой нижней частях отклонения от&nbsp;средних имеют один знак, поэтому их&nbsp;произведение положительно. В&nbsp;двух других частях произведение отрицательно.</p><p>Площадь каждого прямоугольника показывает модуль произведения. Сложим площади с&nbsp;учётом знака и&nbsp;разделим на&nbsp;29, то&nbsp;есть на&nbsp;n − 1. Выборочная <b>ковариация</b> равна 1,80.</p>' },
      { title: 'Как единицы влияют на ковариацию', dur: 4200, body: '<p>Переведём x из&nbsp;тысяч рублей в&nbsp;рубли. Ковариация вырастет с&nbsp;1,80 до&nbsp;1 800. Стандартное отклонение x тоже увеличится в&nbsp;тысячу раз, с&nbsp;2 до&nbsp;2 000.</p><p>Коэффициент Пирсона сохранится. Делим ковариацию на&nbsp;произведение стандартных отклонений и&nbsp;получаем <b>r = 1 800 / (2 000 · 1,5) = 0,60</b>.</p>' },
      { title: 'Четыре набора с r около 0,82', dur: 4400, body: '<p>Фрэнсис Энскомб подобрал четыре набора по&nbsp;11 точек. После округления у&nbsp;всех <b>r = 0,82</b>. Средние, дисперсии и&nbsp;уравнения прямых регрессии тоже почти совпадают.</p><p>В&nbsp;первом наборе точки разбросаны вдоль прямой, во&nbsp;втором образуют дугу. В&nbsp;третьем одна точка отклоняется от&nbsp;прямой, а&nbsp;в&nbsp;четвёртом только у&nbsp;одной точки значение x отличается от&nbsp;остальных.</p>' },
      { title: 'Те же точки в рангах', dur: 4000, body: '<p>Заменим значения каждой переменной их&nbsp;местами в&nbsp;упорядоченном ряду&nbsp;— <b>рангами</b>. Корреляция Пирсона между рангами и&nbsp;есть коэффициент Спирмена.</p><p>В&nbsp;четырёх наборах он&nbsp;равен 0,82, 0,69, 0,99 и&nbsp;0,50. В&nbsp;третьем наборе выброс мало меняет порядок точек. Во&nbsp;втором после вершины дуги y начинает убывать, хотя x продолжает расти.</p>' },
      { title: 'Что появилось раньше?', dur: 3600, body: '<p>Теперь каждая точка&nbsp;— клиент учебного магазина. По&nbsp;горизонтали отложено число визитов в&nbsp;приложение за&nbsp;месяц, по&nbsp;вертикали&nbsp;— траты за&nbsp;тот же&nbsp;месяц. Коэффициент Пирсона равен <b>0,67</b>.</p><p>Возможно, после визита клиент делает покупку. Возможно и&nbsp;<b>обратное направление связи</b>. Сделав заказ, покупатель открывает приложение, чтобы проверить доставку.</p>' },
      { title: 'Что меняется со стажем клиента', dur: 4200, body: '<p>Стаж показывает, сколько лет человек остаётся клиентом магазина. В&nbsp;учебных данных он&nbsp;связан и&nbsp;с&nbsp;числом визитов (r = 0,89), и&nbsp;с&nbsp;тратами (r = 0,75).</p><p>Так устроен генератор данных. Чем больше стаж, тем выше в&nbsp;среднем оба показателя. В&nbsp;этом примере стаж&nbsp;— их&nbsp;<b>общая причина</b>.</p>' },
      { title: 'Как связаны визиты и траты после учёта стажа', dur: 4400, next: 'Читать страницу', body: '<p>Разделим клиентов на&nbsp;три группы по&nbsp;стажу. Внутри групп коэффициенты равны −0,17, 0,19 и&nbsp;0,16. В&nbsp;каждой группе всего от&nbsp;8 до&nbsp;12 клиентов.</p><p>Если учесть стаж с&nbsp;помощью линейной регрессии, частная корреляция составит <b>0,03</b>. В&nbsp;этой выборке после такой поправки линейная связь близка к&nbsp;нулю.</p>' }
    ],
    hud: [{ id: 'r', label: 'Пирсон' }, { id: 'sp', label: 'Спирмен' }, { id: 'cov', label: 'Ковариация' }],
    legend: '<span><i style="background:#b7c0d2"></i>точка</span><span><i class="sq" style="background:#36b8a6"></i>положительный вклад</span><span><i class="sq" style="background:#f06ba5"></i>отрицательный вклад</span><span><i style="background:#f2d36b"></i>стаж</span>',
    info: 'КОРРЕЛЯЦИЯ',
    aiNote: 'На первом графике корреляция 30 точек меняется от нуля до единицы. Выборочная ковариация равна сумме произведений отклонений от средних, делённой на 29. При r = 0,6 она равна 1,80, а после перевода x из тысяч рублей в рубли — 1 800. В квартете Энскомба r округляется до 0,82 во всех четырёх наборах. У 30 учебных клиентов r между числом визитов и тратами равен 0,67, а частная корреляция после линейного учёта стажа равна 0,03.',
    mount(root, api) {
      root.innerHTML = '<div class="cc-sc"><svg class="cc-svg" aria-hidden="true"></svg><div class="cc-calls"></div></div>';
      const box = root.firstChild, svg = box.firstChild, layer = box.lastChild;
      let W = 0, H = 0, sig = '', lk = 0, lp = 0, mob = false, fs = 12;

      function fit() {
        W = box.clientWidth; H = box.clientHeight; if (!W || !H) return;
        mob = W < 520; fs = mob ? 10.5 : 12;
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
        sig = ''; draw(lk, lp);
      }
      const T = (x, y, t, o = {}) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.fs || fs}" fill="${o.c || SC.mut}" text-anchor="${o.a || 'start'}"${o.w ? ` font-weight="${o.w}"` : ''}${o.op != null ? ` opacity="${o.op.toFixed(3)}"` : ''}${o.mono ? ' font-family="JetBrains Mono, ui-monospace, monospace"' : ''}>${escX(t)}</text>`;
      const dot = (x, y, r, c, op = 1, extra = '') => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}" opacity="${op.toFixed(3)}"${extra}/>`;
      const fr = (x, y, w, h) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="9" fill="${SC.frame}" stroke="${SC.line}"/>`;
      function line(x1, y1, x2, y2, c, w, op = 1, dash) { return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${w}" opacity="${op.toFixed(3)}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`; }

      // ---------- облако: части 1 и 2 ----------
      function cloud(s, calls) {
        const S = Math.max(120, Math.min(W - 34, H - 26)), x0 = (W - S) / 2 + 12, y0 = Math.max(0, (H - 26 - S) / 2);
        const D = 3.2, X = v => x0 + (v / (D * CI.sx) + 1) / 2 * S, Y = v => y0 + (1 - (v / (D * CI.sy) + 1) / 2) * S;
        const r = s.ri / 100, q = Math.sqrt(Math.max(0, 1 - r * r));
        const P = CI.x.map((x, i) => [x * CI.sx, (r * x + q * CI.e[i]) * CI.sy]);
        let o = fr(x0, y0, S, S);
        if (s.ticks) {
          [-4, 0, 4].forEach(t => { o += T(X(t), y0 + S + 15, s.kilo ? num(t * 1000, 0) : num(t, 0), { a: 'middle', fs: fs - 1, mono: 1 }); });
          [-3, 0, 3].forEach(t => { o += T(x0 - 6, Y(t) + 4, num(t, 0), { a: 'end', fs: fs - 1, mono: 1 }); });
        }
        o += T(x0 + S - 8, y0 + S - 8, s.kilo ? 'x, ₽' : s.ticks ? 'x, тыс. ₽' : 'x', { a: 'end', c: SC.ink2 });
        o += T(x0 + 8, y0 + 16, 'y', { c: SC.ink2 });
        if (s.rect > 0) P.forEach(([x, y], i) => {
          const a = seg(s.rect, i / 30 * .8, i / 30 * .8 + .2); if (a <= 0) return;
          const pos = x * y > 0, c = pos ? SC.acc : SC.pink;
          const rx = Math.min(X(0), X(x)), ry = Math.min(Y(0), Y(y));
          o += `<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${Math.abs(X(x) - X(0)).toFixed(1)}" height="${Math.abs(Y(y) - Y(0)).toFixed(1)}" fill="${c}" fill-opacity="${(.11 * a).toFixed(3)}" stroke="${c}" stroke-opacity="${(.5 * a).toFixed(3)}" stroke-width="1"/>`;
        });
        if (s.mean > 0) {
          o += line(X(0), y0 + 4, X(0), y0 + S - 4, SC.yel, 1.2, .8 * s.mean, '4 4') + line(x0 + 4, Y(0), x0 + S - 4, Y(0), SC.yel, 1.2, .8 * s.mean, '4 4');
          o += T(X(0) + 5, y0 + 18, 'x', { c: SC.yel, op: s.mean }) + line(X(0) + 5.5, y0 + 18 - fs * .78, X(0) + 5 + fs * .55, y0 + 18 - fs * .78, SC.yel, 1.1, s.mean) + T(x0 + S - 10, Y(0) - 6, 'ȳ', { c: SC.yel, a: 'end', op: s.mean });
        }
        const pr = S > 360 ? 5 : 4;
        P.forEach(([x, y], i) => { const a = s.ptsA >= 1 ? 1 : seg(s.ptsA, i / 30 * .7, i / 30 * .7 + .3); if (a > 0) o += dot(X(x), Y(y), pr, SC.ink2, a, ` stroke="${SC.frame}" stroke-width="1.5"`); });
        const TL = [x0 + 12, y0 + 30], BR = [x0 + S - 12, y0 + S - 30];
        s.calls.forEach(([id, a]) => {
          if (!(a > 0)) return;
          if (id === 'zero') calls.push({ x: TL[0], y: TL[1], d: 'tl', t: 'r = 0: линейной связи нет', a });
          if (id === 'half') calls.push({ x: BR[0], y: BR[1], d: 'br', t: mob ? 'r = 0,5: заметен наклон' : 'r = 0,50: наклон заметен, разброс велик', a });
          if (id === 'one') calls.push({ x: BR[0], y: BR[1], d: 'br', t: 'r = 1: все точки на прямой', a });
          if (id === 'plus') calls.push({ x: TL[0], y: TL[1], d: 'tl', t: `Положительных вкладов: ${CI.pos} из 30`, a, c: SC.acc });
          if (id === 'cov') calls.push({ x: BR[0], y: BR[1], d: 'br', t: `ковариация ≈ ${num(CI.cov)}`, a });
          if (id === 'kilo') calls.push({ x: BR[0], y: BR[1], d: 'br', t: `x ×1 000: cov = ${num(CI.covK, 0)}`, a });
          if (id === 'r') calls.push({ x: TL[0], y: TL[1], d: 'tl', t: `r = ${num(CI.covK, 0)} / (2 000 · 1,5) = ${num(CI.r06k)}`, a, c: SC.yel });
        });
        return o;
      }

      // ---------- квартет Энскомба ----------
      function ans(s) {
        const g = mob ? 10 : 16, pw = (W - g) / 2, ph = (H - g) / 2, cap = ['прямая с шумом', 'дуга', 'прямая и выброс', mob ? 'одна точка в стороне' : 'одна точка вдали от остальных'];
        let o = '';
        AN.forEach((A, i) => {
          const px = (i % 2) * (pw + g), py = Math.floor(i / 2) * (ph + g), pad = mob ? 10 : 16, top = mob ? 30 : 36;
          const X = v => px + pad + (v - 2) / 18 * (pw - 2 * pad), Y = v => py + ph - pad - (v - 2) / 12 * (ph - top - pad);
          o += `<g opacity="${s.panA.toFixed(3)}">` + fr(px, py, pw, ph);
          o += T(px + pad, py + (mob ? 18 : 22), A.k, { c: SC.ink, w: 600, fs: fs + 1 });
          o += T(px + pad + A.k.length * (mob ? 7 : 9) + 8, py + (mob ? 18 : 22), cap[i], { c: SC.ink2, op: s.cap[i], fs: fs - .5 });
          if (s.lineA > 0) { const xe = lerp(2, 20, s.lineA); o += line(X(2), Y(3 + .5 * 2), X(xe), Y(3 + .5 * xe), SC.yel, 1.6, .85); }
          A.x.forEach((x, j) => {
            const out = (i === 2 && j === 2) || (i === 3 && j === 7);
            o += dot(X(x), Y(A.y[j]), mob ? 3.2 : 4, out && s.hi > 0 ? SC.pink : SC.ink2, 1, ` stroke="${SC.frame}" stroke-width="1.2"`);
          });
          const by = py + ph - (mob ? 10 : 14);
          if (s.rA > 0) o += T(px + pw - pad, py + (mob ? 34 : 42), `r = ${num(A.r)}`, { a: 'end', c: SC.yel, op: s.rA, mono: 1, fs: fs - .5 });
          if (s.spA[i] > 0) o += T(px + pw - pad, by, `Спирмен ${num(A.sp)}`, { a: 'end', c: SC.acc, op: s.spA[i], mono: 1, fs: fs - .5, w: 600 });
          o += '</g>';
        });
        return o;
      }

      // ---------- третья переменная ----------
      function conf(s, calls) {
        let sx, sy, sw, sh, dx, dy, dw, dh;
        dx = 0; dy = 0; dw = W; dh = Math.round(H * .34); sx = 0; sy = dh + 10; sw = W; sh = H - sy;
        const pad = 14, bot = 28, lef = 34;
        const XM = 34, YM = 14;
        const X = v => sx + lef + v / XM * (sw - lef - pad), Y = v => sy + sh - bot - v / YM * (sh - bot - pad - 6);
        let o = fr(sx, sy, sw, sh);
        [0, 10, 20, 30].forEach(t => { o += T(X(t), sy + sh - bot + 15, num(t, 0), { a: 'middle', fs: fs - 1, mono: 1 }); });
        [0, 5, 10].forEach(t => { o += T(sx + lef - 6, Y(t) + 4, num(t, 0), { a: 'end', fs: fs - 1, mono: 1 }); });
        o += T(sx + sw - pad, sy + sh - bot - 6, mob ? 'заходов за месяц' : 'заходов в приложение за месяц', { a: 'end', c: SC.ink2, fs: fs - .5 });
        o += T(sx + lef + 6, sy + pad + 8, 'траты, тыс. ₽', { c: SC.ink2, fs: fs - .5 });
        if (s.lineA > 0) { const [a, b] = CF.fit; o += line(X(1), Y(a + b * 1), X(32), Y(a * 32 + b), SC.ink, 1.6, .75 * s.lineA, '6 4'); }
        if (s.gl > 0) CF.fits.forEach(([a, b], g) => {
          const [l, r] = CF.sr[g], re = lerp(l, r, ease(s.gl));
          o += line(X(l), Y(a * l + b), X(re), Y(a * re + b), GCOL[g], 2.4, 1);
          if (s.glLab > 0) o += mob ? T(X(r), Y(a * r + b) - 7, `${GNAME[g]}: ${num(CF.within[g])}`, { a: 'end', c: SC.ink, op: s.glLab, fs: fs - 1, mono: 1 }) : T(X(r) + 6, Y(a * r + b) + 4, `${GNAME[g]}: ${num(CF.within[g])}`, { c: SC.ink, op: s.glLab, fs: fs - 1, mono: 1 });
        });
        CF.s.forEach((v, i) => {
          const c = s.col > 0 ? GCOL[CF.g[i]] : SC.ink2, a = s.ptsA >= 1 ? 1 : seg(s.ptsA, i / 30 * .7, i / 30 * .7 + .3);
          if (a > 0) o += dot(X(v), Y(CF.y[i]), mob ? 3.6 : 4.6, c, a, ` stroke="${SC.frame}" stroke-width="1.4"`);
        });
        s.calls.forEach(([id, a]) => {
          if (!(a > 0)) return;
          if (id === 'r67') calls.push({ x: sx + sw - 12, y: sy + sh - bot - 26, d: 'br', t: `r = ${num(CF.r)}`, a });
          if (id === 'part') calls.push({ x: sx + sw - 12, y: sy + sh - bot - 26, d: 'br', t: `с учётом стажа r ≈ ${num(CF.partial)}`, a, c: SC.yel });
        });
        // схема причин
        const nw = mob ? 92 : 112, nh = mob ? 26 : 32, ny = dy + dh * .28;
        const A = [mob ? dx + nw / 2 + 6 : dx + dw * .2, ny], B = [mob ? dx + dw - nw / 2 - 6 : dx + dw * .8, ny], Zf = [dx + dw * .5, dy + dh * .8];
        const Z = [lerp(W + nw, Zf[0], s.zIn), Zf[1]];
        const trim = (p, q, inset) => { const vx = q[0] - p[0], vy = q[1] - p[1], L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L, t = 1 / Math.sqrt((ux / (nw / 2 + 4)) ** 2 + (uy / (nh / 2 + 4)) ** 2); return inset ? [q[0] - ux * t, q[1] - uy * t] : [p[0] + ux * t, p[1] + uy * t]; };
        function arrow(t, h, bend, c, op, dash) {
          if (!(op > 0)) return '';
          const a = trim(t, h, false), b = trim(t, h, true), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, vx = b[0] - a[0], vy = b[1] - a[1], L = Math.hypot(vx, vy) || 1;
          const cx = mx - vy / L * bend, cy = my + vx / L * bend;
          return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}" fill="none" stroke="${c}" stroke-width="2" opacity="${op.toFixed(3)}" marker-end="url(#cc-ah-${c === SC.yel ? 'y' : 'w'})"${dash ? ' stroke-dasharray="5 4"' : ''}/>`;
        }
        o += `<defs><marker id="cc-ah-w" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${SC.ink2}"/></marker><marker id="cc-ah-y" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${SC.yel}"/></marker></defs>`;
        const bend = mob ? 12 : 22;
        const t1 = [lerp(A[0], Z[0], s.pull), lerp(A[1], Z[1], s.pull)], t2 = [lerp(B[0], Z[0], s.pull), lerp(B[1], Z[1], s.pull)];
        const ac = s.pull > .5 ? SC.yel : SC.ink2;
        o += arrow(t1, B, bend * (1 - s.pull), ac, s.arrA) + arrow(t2, A, bend * (1 - s.pull), ac, s.arrA);
        if (s.q > 0) { o += line(A[0] + nw / 2 + 6, A[1], B[0] - nw / 2 - 6, B[1], SC.dim, 1.4, s.q, '3 5') + T((A[0] + B[0]) / 2, A[1] - 6, '?', { a: 'middle', c: SC.mut, op: s.q, fs: fs + 2, w: 600 }); }
        if (s.lab > 0) {
          o += T((A[0] + B[0]) / 2, ny - bend - (mob ? 6 : 10), 'приложение → траты?', { a: 'middle', c: SC.ink, op: s.lab, fs: fs - .5 });
          o += T((A[0] + B[0]) / 2, ny + bend + (mob ? 14 : 20), 'траты → приложение?', { a: 'middle', c: SC.ink, op: s.lab, fs: fs - .5 });
        }
        if (s.zLab > 0) {
          const m1 = [(Z[0] + A[0]) / 2, (Z[1] + A[1]) / 2], m2 = [(Z[0] + B[0]) / 2, (Z[1] + B[1]) / 2];
          o += T(m1[0] - 8, m1[1] + 4, `r = ${num(CF.rz[0])}`, { a: 'end', c: SC.yel, op: s.zLab, fs: fs - .5, mono: 1 });
          o += T(m2[0] + 8, m2[1] + 4, `r = ${num(CF.rz[1])}`, { c: SC.yel, op: s.zLab, fs: fs - .5, mono: 1 });
        }
        const node = (p, t, c, op = 1) => `<g opacity="${op.toFixed(3)}"><rect x="${(p[0] - nw / 2).toFixed(1)}" y="${(p[1] - nh / 2).toFixed(1)}" width="${nw}" height="${nh}" rx="${nh / 2}" fill="#141b2b" stroke="${c}" stroke-width="1.5"/>${T(p[0], p[1] + fs * .36, t, { a: 'middle', c: SC.ink, w: 600, fs })}</g>`;
        o += node(A, 'Приложение', SC.ink2, s.arrA > 0 ? Math.max(.25, s.arrA) : .25) + node(B, 'Траты', SC.ink2, s.arrA > 0 ? Math.max(.25, s.arrA) : .25);
        if (s.zIn > 0) o += node(Z, 'Стаж', SC.yel);
        return o;
      }

      function placeCalls(list) {
        layer.innerHTML = list.map(c => `<div class="cc-call" style="opacity:${c.a.toFixed(3)};border-color:${c.c || SC.acc}">${escX(c.t)}</div>`).join('');
        [...layer.children].forEach((el, i) => {
          const c = list[i], w = el.offsetWidth, h = el.offsetHeight;
          let x = c.d === 'br' ? c.x - w : c.x, y = c.d === 'br' ? c.y - h : c.y;
          el.style.left = `${clamp(x, 2, W - w - 2)}px`; el.style.top = `${clamp(y, 2, H - h - 2)}px`;
        });
      }

      function draw(k, p) {
        lk = k; lp = p; if (!W) return;
        const key = `${k}|${Math.round(p * 300)}|${W}x${H}`; if (key === sig) return; sig = key;
        const s = sceneState(k, p), calls = [];
        svg.innerHTML = s.mode === 'cloud' ? cloud(s, calls) : s.mode === 'ans' ? ans(s) : conf(s, calls);
        placeCalls(calls);
      }
      function hud(k, p) {
        const s = sceneState(k, p);
        if (s.mode === 'cloud') {
          const kilo = k === 4 && p >= .3;
          api.hud('r', num(CI.circR[s.ri])); api.hud('sp', num(CI.circSp[s.ri]));
          api.hud('cov', kilo ? num(CI.covK, 0) : num(CI.circCov[s.ri]), k >= 3 ? (kilo ? 'x в рублях' : 'x в тыс.') : '');
        } else if (s.mode === 'ans') {
          api.hud('r', num(AN[0].r), 'у всех'); api.hud('cov', num(AN[0].cov), 'после округления');
          api.hud('sp', k === 6 && p >= .2 ? `${num(Math.min(...AN.map(a => a.sp)))}–${num(Math.max(...AN.map(a => a.sp)))}` : '—');
        } else {
          api.hud('r', num(CF.r), k === 9 && p >= .66 ? `с учётом стажа ${num(CF.partial)}` : '');
          api.hud('sp', num(CF.sp)); api.hud('cov', num(CF.cov));
        }
      }
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box);
      fit();
      return { render(k, p) { hud(k, p); draw(k, p); } };
    }
  };

  /* ===================== Интерактив «Угадай корреляцию» ===================== */
  /*gen:start*/
  // Свой генератор псевдослучайных чисел mulberry32 с зерном: одинаковые действия дают одинаковые облака
  function mulberry32(a) { return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function seedOf(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
  // корреляция Пирсона: ковариация, делённая на произведение стандартных отклонений
  function pearson(xs, ys) {
    const n = xs.length; let mx = 0, my = 0;
    for (let i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; }
    mx /= n; my /= n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { const a = xs[i] - mx, b = ys[i] - my; sxy += a * b; sxx += a * a; syy += b * b; }
    return sxy / Math.sqrt(sxx * syy);
  }
  const N_CLOUD = 60;
  function makeCloud(round) {                       // раунд → то же облако при каждом запуске
    const r = mulberry32(seedOf('da-6-5|' + round));
    const rho = Math.round((r() * 1.9 - 0.95) * 100) / 100;   // задуманная сила связи
    const xs = [], ys = [];
    for (let i = 0; i < N_CLOUD; i++) { const a = gauss(r), b = gauss(r); xs.push(a); ys.push(rho * a + Math.sqrt(1 - rho * rho) * b); }
    return { rho, xs, ys, r: pearson(xs, ys) };
  }
  /*gen:end*/
  const SIM = DATA.simpson;
  const SHAPE = ['круг', 'квадрат', 'треугольник'];
  function mark(i, x, y, rr, fill, stroke) {
    const st = `fill="${fill}" stroke="${stroke}" stroke-width="1.4"`;
    if (i === 1) return `<rect x="${(x - rr * .9).toFixed(1)}" y="${(y - rr * .9).toFixed(1)}" width="${(rr * 1.8).toFixed(1)}" height="${(rr * 1.8).toFixed(1)}" rx="1.5" ${st}/>`;
    if (i === 2) return `<path d="M${x.toFixed(1)} ${(y - rr * 1.15).toFixed(1)}L${(x + rr * 1.05).toFixed(1)} ${(y + rr * .75).toFixed(1)}L${(x - rr * 1.05).toFixed(1)} ${(y + rr * .75).toFixed(1)}z" ${st}/>`;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr}" ${st}/>`;
  }

  function buildGuess(box, api) {
    const { plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t"><span id="cg-title"></span> <i>интерактив</i></span><div class="ctrls"><button type="button" class="btn ghost small" id="cg-reset">Сбросить</button></div></div>
<div class="tabs" role="group" aria-label="Режим интерактива"><button type="button" data-m="guess">Угадай корреляцию</button><button type="button" data-m="simpson">Парадокс Симпсона</button></div>
<p class="hint cg-do" id="cg-hint"></p>
<div class="stage">
  <div class="cg-plot" id="cg-plot"><svg id="cg-svg" role="img"></svg></div>
  <div class="narr">
    <div id="cg-guess">
      <label class="cap" for="cg-num">Ваша оценка r</label>
      <div class="cg-in"><input type="range" id="cg-range" min="-1" max="1" step="0.01" value="0" aria-label="Оценка r ползунком"><input type="text" id="cg-num" inputmode="decimal" autocomplete="off" value="0,00" aria-describedby="cg-msg"></div>
      <div class="wbtns"><button type="button" class="btn small" id="cg-check">Проверить</button><button type="button" class="btn ghost small" id="cg-next">Следующее облако</button></div>
      <div class="readout cg-ro"><div><span class="big" id="cg-r">?</span><span class="lbl">выборочный r</span></div><div><span class="big" id="cg-pts">—</span><span class="lbl">очков за раунд</span></div></div>
      <ol class="cg-hist" id="cg-hist"></ol>
    </div>
    <div id="cg-simp" hidden>
      <button type="button" class="btn small" id="cg-color" aria-pressed="false">Выделить категории</button>
      <div class="readout cg-ro"><div><span class="big" id="cg-all">${num(SIM.r, 2, true)}</span><span class="lbl">r по всем заказам</span></div><div><span class="big" id="cg-inr">?</span><span class="lbl">r внутри категорий</span></div></div>
      <ul class="cg-leg" id="cg-leg"></ul>
    </div>
    <div class="narr-text" id="cg-msg" aria-live="polite"></div>
  </div>
</div>
<div class="status"><span><span class="dot live"></span><span id="cg-s1"></span></span><span class="grow"></span><span id="cg-s2"></span></div>`;
    const q = s => box.querySelector(s);
    const plot = q('#cg-plot'), svg = q('#cg-svg');
    let st;
    const fresh = () => ({ mode: 'guess', round: 1, cloud: makeCloud(1), guess: 0, shown: false, pts: null, hist: [], score: 0, err: 0, color: false, msg: '' });

    const parse = t => { const v = parseFloat(String(t).trim().replace(',', '.').replace('−', '-').replace('–', '-')); return isFinite(v) ? v : NaN; };
    const grade = e => (e <= .05 ? 'очень близко' : e <= .15 ? 'близко' : e <= .3 ? 'приблизительно' : 'далеко от рассчитанного r');

    function dims() { const w = Math.max(240, plot.clientWidth - 24), h = Math.round(clamp(w * .72, 250, 380)); return { w, h }; }
    function drawGuess() {
      const { w, h } = dims(), c = st.cloud, pad = 18;
      const ext = a => { let lo = Infinity, hi = -Infinity; a.forEach(v => { if (v < lo) lo = v; if (v > hi) hi = v; }); const m = (hi - lo) * .06; return [lo - m, hi + m]; };
      const [x0, x1] = ext(c.xs), [y0, y1] = ext(c.ys);
      const X = v => pad + (v - x0) / (x1 - x0) * (w - 2 * pad), Y = v => h - pad - (v - y0) / (y1 - y0) * (h - 2 * pad);
      let o = `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="10" fill="var(--paper)" stroke="var(--line)"/>`;
      if (st.shown) {
        let mx = 0, my = 0; c.xs.forEach((v, i) => { mx += v; my += c.ys[i]; }); mx /= c.xs.length; my /= c.ys.length;
        let sxy = 0, sxx = 0; c.xs.forEach((v, i) => { sxy += (v - mx) * (c.ys[i] - my); sxx += (v - mx) ** 2; });
        const b = sxy / sxx, f = v => my + b * (v - mx);
        o += `<line x1="${X(x0)}" y1="${Y(f(x0))}" x2="${X(x1)}" y2="${Y(f(x1))}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6 4" clip-path="url(#cg-clip)"/>`;
      }
      c.xs.forEach((v, i) => { o += `<circle cx="${X(v).toFixed(1)}" cy="${Y(c.ys[i]).toFixed(1)}" r="4.5" fill="var(--c1)" fill-opacity=".78" stroke="var(--surface)" stroke-width="1.2"/>`; });
      o += `<defs><clipPath id="cg-clip"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="10"/></clipPath></defs>`;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('width', w); svg.setAttribute('height', h);
      svg.setAttribute('aria-label', `Облако номер ${st.round}: ${N_CLOUD} точек${st.shown ? `, выборочный r = ${num(c.r)}` : ''}`);
      svg.innerHTML = vs(o);
    }
    function drawSimp() {
      const { w, h } = dims(), L = 50, R = mobile() ? 12 : 104, Tp = 14, Bt = 34;
      const X = v => L + v / 31 * (w - L - R), Y = v => h - Bt - v / 11000 * (h - Bt - Tp);
      let o = `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="10" fill="var(--paper)" stroke="var(--line)"/>`;
      [0, 2000, 4000, 6000, 8000, 10000].forEach(t => { o += `<line x1="${L}" x2="${w - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${Y(t) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${num(t, 0)}</text>`; });
      [0, 10, 20, 30].forEach(t => { o += `<text x="${X(t)}" y="${h - Bt + 16}" text-anchor="middle" font-size="11" fill="var(--muted)">${t}%</text>`; });
      o += `<text x="${w - R}" y="${h - 6}" text-anchor="end" font-size="11.5" fill="var(--ink-2)">скидка</text><text x="${L + 6}" y="${Tp + 12}" font-size="11.5" fill="var(--ink-2)">чек, ₽</text>`;
      SIM.pts.forEach(([c, d, k]) => { o += st.color ? mark(c, X(d), Y(k), 4.3, `var(--c${c + 1})`, 'var(--surface)') : mark(0, X(d), Y(k), 4.3, 'var(--muted)', 'var(--surface)').replace('stroke-width', 'fill-opacity=".7" stroke-width'); });
      const [a, b] = SIM.fit;
      o += `<line x1="${X(0)}" y1="${Y(b)}" x2="${X(30)}" y2="${Y(a * 30 + b)}" stroke="var(--ink)" stroke-width="2" stroke-dasharray="7 5" opacity="${st.color ? .45 : .9}"/>`;
      if (!mobile()) o += `<text x="${X(30) + 6}" y="${Y(a * 30 + b) + 4}" font-size="11.5" fill="var(--ink)">r = ${num(SIM.r, 2, true)}</text>`;
      if (st.color) SIM.fits.forEach(([s, i0], c) => {
        const [lo, hi] = SIM.ranges[c];
        o += `<line x1="${X(lo)}" y1="${Y(s * lo + i0)}" x2="${X(hi)}" y2="${Y(s * hi + i0)}" stroke="var(--c${c + 1})" stroke-width="3" stroke-linecap="round"/>`;
        if (!mobile()) o += `<text x="${X(hi) + 6}" y="${Y(s * hi + i0) + 4}" font-size="11.5" fill="var(--ink)">${SIM.cats[c]} ${num(SIM.within[c], 2, true)}</text>`;
      });
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('width', w); svg.setAttribute('height', h);
      svg.setAttribute('aria-label', `120 учебных заказов: скидка и чек. ${st.color ? 'Раскрашены по категориям, внутри каждой линия идёт вниз' : 'Одна линия по всем заказам идёт вверх'}`);
      svg.innerHTML = vs(o);
    }
    const mobile = () => plot.clientWidth < 460;
    function sync() {
      const g = st.mode === 'guess';
      box.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === st.mode)));
      q('#cg-title').textContent = g ? 'Оцените корреляцию по расположению точек' : 'Как связаны скидка и чек в каждой категории?';
      q('#cg-hint').textContent = g ? 'Передвиньте ползунок или введите число от −1 до 1. Нажмите «Проверить». За точную оценку можно получить 100 очков. За каждые 0,01 абсолютной ошибки вычитаются 2 очка, минимум — 0.' : 'Каждая точка — заказ. Выделите категории и сравните наклоны общей прямой и прямых для отдельных категорий.';
      q('#cg-guess').hidden = !g; q('#cg-simp').hidden = g;
      if (g) {
        q('#cg-r').textContent = st.shown ? num(st.cloud.r, 2) : '?';
        q('#cg-pts').textContent = st.shown ? String(st.pts) : '—';
        q('#cg-check').disabled = st.shown;
        q('#cg-hist').innerHTML = st.hist.slice(-5).reverse().map(h => `<li><b>№${h.n}</b><span>оценка ${num(h.g)} · r = ${num(h.r)}</span><em>${h.p}</em></li>`).join('');
        const n = st.hist.length;
        q('#cg-s1').textContent = `Облако ${st.round} · ${N_CLOUD} точек`;
        q('#cg-s2').textContent = n ? `${n} ${plural(n, ['ответ', 'ответа', 'ответов'])} · очков ${st.score} · средняя ошибка ${num(st.err / n)}` : 'Ответов пока нет';
        drawGuess();
      } else {
        const cb = q('#cg-color'); cb.setAttribute('aria-pressed', String(st.color)); cb.textContent = st.color ? 'Объединить категории' : 'Выделить категории';
        q('#cg-inr').textContent = st.color ? `${num(Math.min(...SIM.within))}…${num(Math.max(...SIM.within))}` : '?';
        q('#cg-leg').innerHTML = vs(SIM.cats.map((c, i) => `<li><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">${mark(i, 7, 7.5, 4.6, st.color ? `var(--c${i + 1})` : 'var(--muted)', 'var(--surface)')}</svg><span>${c}</span><b>${st.color ? num(SIM.within[i], 2, true) : '?'}</b></li>`).join(''));
        q('#cg-s1').textContent = `По всем заказам r = ${num(SIM.r, 2, true)}`;
        q('#cg-s2').textContent = st.color ? `Внутри категорий: ${SIM.within.map(v => num(v, 2, true)).join(' · ')}` : 'Коэффициенты по категориям пока скрыты';
        drawSimp();
      }
      q('#cg-msg').textContent = st.msg;
    }
    function setGuess(v, from) {
      st.guess = clamp(Math.round(v * 100) / 100, -1, 1);
      if (from !== 'range') q('#cg-range').value = String(st.guess);
      if (from !== 'num') q('#cg-num').value = num(st.guess);
    }
    function check() {
      if (st.shown) return;
      const v = parse(q('#cg-num').value);
      if (!isFinite(v) || v < -1 || v > 1) { st.msg = 'Введите число от −1 до 1, например 0,45 или −0,3.'; sync(); return; }
      setGuess(v);
      const e = Math.abs(st.guess - st.cloud.r), p = Math.max(0, Math.round(100 - 200 * e));
      st.shown = true; st.pts = p; st.score += p; st.err += e;
      st.hist.push({ n: st.round, g: st.guess, r: st.cloud.r, p });
      st.msg = `${grade(e)[0].toUpperCase() + grade(e).slice(1)}: ошибка ${num(e)}. ${Math.abs(st.cloud.r) < .3 ? 'У этого облака слабая линейная связь.' : Math.abs(st.cloud.r) > .8 ? 'Точки располагаются близко к прямой.' : 'Пунктир показывает прямую регрессии.'} Прямая описывает около ${num(100 * st.cloud.r ** 2, 0)}% разброса y в выборке.`;
      sync();
    }
    function next() { st.round++; st.cloud = makeCloud(st.round); st.shown = false; st.pts = null; setGuess(0); st.msg = ''; sync(); }

    box.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
      st.mode = b.dataset.m;
      st.msg = st.mode === 'simpson' ? (st.color ? '' : 'Общая прямая идёт вверх. Как изменится её наклон, если рассмотреть каждую категорию отдельно?') : '';
      sync();
    }));
    q('#cg-range').addEventListener('input', e => setGuess(+e.target.value, 'range'));
    q('#cg-num').addEventListener('change', e => { const v = parse(e.target.value); if (isFinite(v)) setGuess(v, 'num'); });
    q('#cg-num').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    q('#cg-check').addEventListener('click', check);
    q('#cg-next').addEventListener('click', next);
    q('#cg-color').addEventListener('click', () => {
      st.color = !st.color;
      st.msg = st.color ? `В каждой категории большим скидкам соответствуют в среднем меньшие чеки. Категории различаются по обоим показателям. Для товаров категории «свет» средняя скидка равна 22%, средний чек — 7 006 ₽. Для посуды это 6% и 2 204 ₽.` : 'На общей диаграмме прямая идёт вверх.';
      sync();
    });
    q('#cg-reset').addEventListener('click', () => { st = fresh(); setGuess(0); sync(); });
    if ('ResizeObserver' in window) { let lw = 0; new ResizeObserver(() => { const w = plot.clientWidth; if (w !== lw) { lw = w; sync(); } }).observe(plot); }
    st = fresh(); setGuess(0); sync();
    return {
      redraw: sync,
      describe() {
        if (st.mode === 'simpson') return `режим «Парадокс Симпсона», разбивка по категориям ${st.color ? 'включена' : 'выключена'}; r по всем 120 заказам ${num(SIM.r, 2, true)}, внутри категорий ${SIM.cats.map((c, i) => `${c} ${num(SIM.within[i], 2, true)}`).join(', ')}.`;
        const n = st.hist.length;
        return `режим «Угадай корреляцию», облако № ${st.round}${st.shown ? `: моя оценка ${num(st.guess)}, выборочный r ${num(st.cloud.r)}` : ', ещё не ответил'}; ответов ${n}, очков ${st.score}${n ? `, средняя ошибка ${num(st.err / n)}` : ''}.`;
      }
    };
  }

  /* ===================== Тепловая карта под блоком кода ===================== */
  function heatmap(el) {
    const { cols, m } = DATA.heat, n = cols.length, c = 64, L = 64, Tp = 30, w = L + n * c + 10, h = Tp + n * c + 46;
    let o = '';
    const names = { age: 'возраст', income: 'доход', orders: 'заказы', spend: 'траты' };
    cols.map(col => names[col]).forEach((name, j) => { o += `<text x="${L + j * c + c / 2}" y="${Tp - 10}" text-anchor="middle" font-size="12" fill="var(--ink-2)" font-family="var(--mono)">${name}</text><text x="${L - 8}" y="${Tp + j * c + c / 2 + 4}" text-anchor="end" font-size="12" fill="var(--ink-2)" font-family="var(--mono)">${name}</text>`; });
    m.forEach((row, i) => row.forEach((v, j) => {
      const pct = Math.round(Math.abs(v) * 88), base = v >= 0 ? 'var(--c1)' : 'var(--c2)';
      o += `<g><title>${names[cols[i]]} и ${names[cols[j]]}: r = ${num(v)}</title><rect x="${L + j * c + 1}" y="${Tp + i * c + 1}" width="${c - 2}" height="${c - 2}" rx="4" style="fill: color-mix(in srgb, ${base} ${pct}%, var(--surface))"/><text x="${L + j * c + c / 2}" y="${Tp + i * c + c / 2 + 5}" text-anchor="middle" font-size="14" font-weight="600" style="fill: ${Math.abs(v) > .55 ? 'var(--paper)' : 'var(--ink)'}" font-family="var(--mono)">${num(v)}</text></g>`;
    }));
    const by = Tp + n * c + 18, bw = n * c;
    o += `<defs><linearGradient id="hm-g"><stop offset="0" style="stop-color: color-mix(in srgb, var(--c2) 88%, var(--surface))"/><stop offset=".5" style="stop-color: var(--surface)"/><stop offset="1" style="stop-color: color-mix(in srgb, var(--c1) 88%, var(--surface))"/></linearGradient></defs>`;
    o += `<rect x="${L}" y="${by}" width="${bw}" height="8" rx="4" fill="url(#hm-g)" stroke="var(--line)"/>`;
    [[-1, '−1'], [0, '0'], [1, '+1']].forEach(([v, t]) => { o += `<text x="${L + (v + 1) / 2 * bw}" y="${by + 24}" text-anchor="middle" font-size="11" fill="var(--muted)">${t}</text>`; });
    el.innerHTML = `<figcaption>Чем больше заказов у&nbsp;клиента, тем выше в&nbsp;среднем его траты (r = 0,84)</figcaption><svg viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="Матрица корреляций Пирсона для возраста, дохода, числа заказов и трат клиентов. Для числа заказов и трат r = 0,84, для возраста и трат r = 0,04.">${vs(o)}</svg>`;
  }

  /*code:start*/const CODE = {"matrix": {"title": "Квартальные траты теснее всего связаны с числом заказов", "badge": "проверено: Python 3.13, pandas 3.0.5, matplotlib 3.10.0", "lang": "python", "code": "import matplotlib\nimport pandas as pd\n\nmatplotlib.use(\"Agg\")                       # рисуем в файл, без окна\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv(\"data/clients/clients.csv\").drop(columns=\"client_id\")\ncorr = df.corr()                            # коэффициенты Пирсона для всех пар столбцов\nprint(corr.round(2), end=\"\\n\\n\")\n\n# Для одной пары столбцов рассчитаем выборочную ковариацию и коэффициент Пирсона вручную.\nx, y = df[\"income\"], df[\"spend\"]\ncov = ((x - x.mean()) * (y - y.mean())).sum() / (len(df) - 1)\nprint(f\"ковариация = {cov:,.0f}\".replace(\",\", \" \"))\nprint(f\"r вручную = {cov / (x.std() * y.std()):.4f}, pandas = {x.corr(y):.4f}\")\n\nfig, ax = plt.subplots(figsize=(4.6, 4))\nim = ax.imshow(corr, cmap=\"RdBu_r\", vmin=-1, vmax=1)   # 0 — белый, ±1 — насыщенный\nax.set_xticks(range(4), corr.columns)\nax.set_yticks(range(4), corr.columns)\nfor i in range(4):\n    for j in range(4):\n        ax.text(j, i, f\"{corr.iloc[i, j]:.2f}\", ha=\"center\", va=\"center\")\nfig.colorbar(im)\nfig.savefig(\"corr_heatmap.svg\", bbox_inches=\"tight\")\nprint(\"тепловая карта сохранена: corr_heatmap.svg\")", "out": "         age  income  orders  spend\nage     1.00    0.15    0.08   0.04\nincome  0.15    1.00    0.42   0.50\norders  0.08    0.42    1.00   0.84\nspend   0.04    0.50    0.84   1.00\n\nковариация = 139 563 886\nr вручную = 0.5003, pandas = 0.5003\nтепловая карта сохранена: corr_heatmap.svg", "note": "Код сохраняет тепловую карту в файл corr_heatmap.svg. Под примером показана та же матрица корреляций."}, "spearman": {"title": "Как один покупатель меняет коэффициенты Пирсона и Спирмена", "badge": "проверено: Python 3.13, pandas 3.0.5", "lang": "python", "code": "import pandas as pd\n\ndf = pd.read_csv(\"data/clients/clients.csv\").head(40)[[\"income\", \"spend\"]]   # 40 учебных клиентов\n\ndef both(d):\n    p = d[\"income\"].corr(d[\"spend\"])                       # Пирсон по значениям\n    s = d[\"income\"].corr(d[\"spend\"], method=\"spearman\")    # Спирмен по рангам\n    return f\"Пирсон {p:+.3f}   Спирмен {s:+.3f}\"\n\nprint(\"40 клиентов:      \", both(df))\n\n# один оптовый покупатель: доход 30 000 ₽, траты за квартал 1,5 млн ₽\nwholesale = pd.DataFrame({\"income\": [30_000], \"spend\": [1_500_000]})\nout = pd.concat([df, wholesale], ignore_index=True)\nprint(\"плюс один выброс: \", both(out))\n\n# По тратам оптовый покупатель занимает 41-е место из 41.\nranks = out.rank()\nprint(ranks.tail(2))\nprint(f\"Пирсон по рангам: {ranks['income'].corr(ranks['spend']):+.3f}\")\n\n# При x от 1 до 20 значения 2**x строго возрастают. Ранги x и y совпадают.\nx = pd.Series(range(1, 21))\ny = 2.0 ** x\nprint(f\"y = 2^x:          Пирсон {x.corr(y):+.3f}   Спирмен {x.corr(y, method='spearman'):+.3f}\")", "out": "40 клиентов:       Пирсон +0.627   Спирмен +0.661\nплюс один выброс:  Пирсон -0.152   Спирмен +0.573\n    income  spend\n39    25.5   22.0\n40     6.5   41.0\nПирсон по рангам: +0.573\ny = 2^x:          Пирсон +0.619   Спирмен +1.000"}, "simpson": {"title": "Знак корреляции между скидкой и чеком зависит от группировки", "badge": "проверено: Python 3.13, pandas 3.0.5, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\nimport pandas as pd\n\ndf = pd.read_csv(\"data/inference/discounts.csv\")   # 120 учебных заказов со скидкой\nprint(df.head(3), end=\"\\n\\n\")\n\ndef stats(g):\n    slope = np.polyfit(g[\"discount\"], g[\"check\"], 1)[0]   # ₽ чека на 1 п. п. скидки\n    return pd.Series({\"заказов\": len(g), \"скидка\": g[\"discount\"].mean(), \"чек\": g[\"check\"].mean(),\n                      \"r\": g[\"discount\"].corr(g[\"check\"]), \"наклон\": slope})\n\ntable = df.groupby(\"category\", sort=False).apply(stats, include_groups=False)\ntable.loc[\"все заказы\"] = stats(df)\ntable = table.round({\"скидка\": 1, \"чек\": 0, \"r\": 2, \"наклон\": 0}).astype({\"заказов\": int, \"чек\": int, \"наклон\": int})\nprint(table)", "out": "   order_id category  discount  check\n0         1   посуда         4   2470\n1         2   посуда         3   2550\n2         3   посуда         5   2280\n\n            заказов  скидка   чек     r  наклон\ncategory                                       \nпосуда           40     6.2  2204 -0.65     -48\nтекстиль         40    14.4  4660 -0.70    -108\nсвет             40    22.2  7006 -0.56    -131\nвсе заказы      120    14.3  4623  0.73     198"}, "nonlinear": {"title": "Больше всего активных дней у тех, кто получал по три уведомления в неделю", "badge": "проверено: Python 3.13, pandas 3.0.5, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\nimport pandas as pd\n\nrng = np.random.default_rng(6521)\npush = rng.integers(0, 7, 300)                     # уведомлений в неделю у 300 пользователей\ndays = 20 - 1.5 * (push - 3) ** 2 + rng.normal(0, 2, 300)   # активных дней за месяц\ndf = pd.DataFrame({\"push\": push, \"days\": days.clip(0, 30).round()})\n\nprint(f\"Пирсон {df['push'].corr(df['days']):+.3f}   Спирмен {df['push'].corr(df['days'], method='spearman'):+.3f}\")\nprint(df.groupby(\"push\")[\"days\"].mean().round(1).to_string())\nprint(f\"Пирсон для (push − 3)² и дней: {((df['push'] - 3) ** 2).corr(df['days']):+.3f}\")", "out": "Пирсон +0.001   Спирмен -0.062\npush\n0     6.3\n1    13.9\n2    18.7\n3    19.7\n4    18.7\n5    13.9\n6     6.7\nПирсон для (push − 3)² и дней: -0.937"}, "aggregate": {"title": "После усреднения по возрастным группам r вырос с 0,15 до 0,94", "badge": "проверено: Python 3.13, pandas 3.0.5", "lang": "python", "code": "import pandas as pd\n\ndf = pd.read_csv(\"data/clients/clients.csv\")   # 1 000 учебных клиентов\n\nby_age = df.groupby(\"age\", as_index=False)[\"income\"].mean()           # 53 точки: средний доход по возрасту\nby_dec = df.groupby(df[\"age\"] // 10 * 10)[[\"age\", \"income\"]].mean()   # 7 точек: по десятилетиям\n\nprint(f\"по клиентам:       r = {df['age'].corr(df['income']):.2f}  ({len(df)} точек)\")\nprint(f\"по годам возраста: r = {by_age['age'].corr(by_age['income']):.2f}  ({len(by_age)} точки)\")\nprint(f\"по десятилетиям:   r = {by_dec['age'].corr(by_dec['income']):.2f}  ({len(by_dec)} точек)\")", "out": "по клиентам:       r = 0.15  (1000 точек)\nпо годам возраста: r = 0.62  (53 точки)\nпо десятилетиям:   r = 0.94  (7 точек)"}, "trend": {"title": "У двух растущих рядов r = 0,90, у их дневных изменений r = −0,05", "badge": "проверено: Python 3.13, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\n\nrng = np.random.default_rng(6522)\nt = np.arange(365)\norders = 200 + 0.3 * t + rng.normal(0, 12, 365)       # заказы учебного магазина в день\nsubs = 9_000 + 15 * t + rng.normal(0, 400, 365)       # подписчики другого канала, отдельный тренд и независимый шум\nprint(f\"уровни:    r = {np.corrcoef(orders, subs)[0, 1]:.2f}\")\nprint(f\"изменения: r = {np.corrcoef(np.diff(orders), np.diff(subs))[0, 1]:+.2f}\")\n\n# 1 000 пар независимых случайных блужданий по 365 дней\nwalks = rng.normal(size=(1000, 2, 365)).cumsum(axis=2)\nr = np.array([np.corrcoef(a, b)[0, 1] for a, b in walks])\nrd = np.array([np.corrcoef(np.diff(a), np.diff(b))[0, 1] for a, b in walks])\nprint(f\"блуждания: |r| > 0,5 у {np.mean(np.abs(r) > 0.5):.0%} пар, медиана |r| = {np.median(np.abs(r)):.2f}\")\nprint(f\"их изменения: |r| > 0,5 у {np.mean(np.abs(rd) > 0.5):.0%} пар, медиана |r| = {np.median(np.abs(rd)):.2f}\")", "out": "уровни:    r = 0.90\nизменения: r = -0.05\nблуждания: |r| > 0,5 у 41% пар, медиана |r| = 0.42\nих изменения: |r| > 0,5 у 0% пар, медиана |r| = 0.04"}};/*code:end*/

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-6-5',
    short: 'DA-06',
    title: 'Корреляция и причинность',
    where: 'блок «Дата аналитика», тема 06 «Статистический вывод», страница 6.5',
    aiData: '1 000 учебных клиентов (возраст, доход, заказы, траты), квартет Энскомба, 120 учебных заказов со скидкой по трём категориям (посуда, текстиль, свет) и 30 учебных клиентов, у которых стаж влияет и на число визитов в приложение, и на траты',
    scene,
    widgets: { guess: buildGuess },
    code: CODE,
    start() { const el = document.getElementById('cc-hm'); if (el) heatmap(el); },
    questions: {
    q1: { sec: 'guess', title: 'Сначала предскажите', q: 'По всем 120 заказам корреляция между скидкой и чеком положительна (r = 0,73). Может ли она быть отрицательной в каждой товарной категории?', opts: [['Нет, связь внутри каждой категории должна иметь тот же знак'], ['Да, если категории различаются и по средней скидке, и по среднему чеку', 1], ['Только если в категориях разное число заказов'], ['Только если есть выбросы']],
      why: 'В каждой категории большим скидкам соответствуют меньшие чеки. При этом у более дорогих категорий выше и типичные скидки. В общей выборке преобладают различия между категориями. В этом примере в каждой категории по 40 заказов.' },
    q2: { sec: 'idea', q: 'В каждом из четырёх наборов Энскомба коэффициент Пирсона после округления равен 0,82. Какой вывод из этого следует?', opts: [['Во всех четырёх наборах с ростом x значения y растут одинаково'], ['Во всех наборах сходная положительная линейная корреляция', 1], ['Для каждого набора прямая точно предсказывает y по x'], ['Точки на четырёх диаграммах должны располагаться одинаково']],
      why: 'Коэффициенты близки, но в одном наборе точки образуют дугу, а в другом только одна точка отличается от остальных по x. В последнем случае именно она определяет наклон прямой. Поэтому одних коэффициентов для интерпретации недостаточно.' },
    q3: { sec: 'nuances', q: 'Среднее число активных дней растёт по мере увеличения числа уведомлений с нуля до трёх в неделю, а затем снижается. При этом r после округления равен 0,00. Как это объяснить?', opts: [['Число уведомлений и активность независимы'], ['Коэффициент Пирсона близок к нулю, хотя на графике видна нелинейная зависимость', 1], ['При такой зависимости в данных обязательно есть ошибка'], ['Коэффициент Спирмена обязательно будет близок к единице']],
      why: 'По одну сторону от трёх уведомлений среднее число активных дней растёт, по другую — убывает. Обе части вместе плохо описываются прямой. По той же причине коэффициент Спирмена, который измеряет монотонную связь, здесь тоже близок к нулю.' },
    q4: { sec: 'idea', q: 'Клиенты с приложением тратят больше. Какой показатель может быть общей причиной установки приложения и более высоких трат?', opts: [['Число покупок клиента через приложение после установки'], ['Доход до установки, если он влияет и на вероятность установки, и на траты', 1], ['Сумма покупок клиента через месяц после установки'], ['Оценка, которую клиент поставил приложению после первой покупки']],
      why: 'В этой гипотезе доход предшествует установке и может влиять и на решение установить приложение, и на покупки. Остальные показатели получены уже после установки. Чтобы проверить роль дохода, нужно выяснить, измеряли ли его до установки и как он связан с обоими показателями.' },
    q5: { sec: 'cause', q: 'Какое преимущество даёт случайное назначение уведомлений при сравнении двух групп?', opts: [['Коэффициент корреляции между визитами и тратами обязательно вырастет'], ['В среднем группы сопоставимы даже по исходным признакам, которых аналитик не измерял', 1], ['В каждой отдельной выборке группы получаются совершенно одинаковыми'], ['После рассылки пропуски в данных больше не влияют на вывод']],
      why: 'При случайном назначении исходные характеристики клиентов не определяют, кто попадёт в группу рассылки. По этой причине назначения не связаны систематически ни с измеренными, ни с неизмеренными исходными признаками. В конкретном эксперименте различия между группами всё же возможны.' },
    q6: { sec: 'code', q: 'Как pandas рассчитывает коэффициент в этой строке?', code: 'df["income"].corr(df["spend"], method="spearman")', opts: [['Удаляет наблюдения дальше трёх стандартных отклонений от среднего'], ['Присваивает значениям каждого столбца ранги и вычисляет корреляцию Пирсона между рангами', 1], ['Логарифмирует доход и траты'], ['Стандартизует значения и считает корреляцию между исходными наблюдениями']],
      why: 'Ранги присваиваются отдельно доходу и тратам. Одинаковые значения получают среднее занятых ими мест. Если самые большие траты станут ещё больше, их ранг сохранится. Само добавление нового наблюдения при этом может изменить коэффициент.' },
    q7: { sec: 'nuances', q: 'У 1 000 клиентов корреляция возраста и дохода равна 0,15. По средним доходам семи возрастных групп она равна 0,94. Какой коэффициент описывает связь на уровне отдельных клиентов?', opts: [['0,94, поскольку средние по группам точнее'], ['0,15, поскольку в этом расчёте каждое наблюдение соответствует одному клиенту', 1], ['Оба, поскольку в расчёте использованы одни и те же исходные данные'], ['Ни один, поскольку после группировки корреляция должна сохраниться']],
      why: 'При расчёте r = 0,94 каждая точка представляет возрастную группу. Усреднение скрывает различия в доходах людей внутри группы. Для вопроса о возрасте и доходе конкретных людей нужны исходные 1 000 наблюдений.' }
    },
    glossary: {
      causal: { t: 'Причинная связь', en: 'causation', d: 'Если изменить воздействие, при прочих равных изменится результат или его распределение.' },
      pearson: { t: 'Коэффициент корреляции Пирсона', en: 'Pearson correlation coefficient, r', d: 'Показатель направления и силы линейной связи. Равен ковариации, делённой на произведение стандартных отклонений. Определён, когда обе величины меняются, и принимает значения от −1 до 1.' },
      spearman: { t: 'Коэффициент корреляции Спирмена', en: 'Spearman rank correlation', d: 'Корреляция Пирсона между рангами двух переменных. Показывает, насколько согласован их порядок. Пока ранги сохраняются, изменение величины выброса не меняет коэффициент.' },
      confounder: { t: 'Смешивающая переменная', en: 'confounder', d: 'Общая причина воздействия и результата. Например, стаж клиента может влиять и на число визитов, и на траты. Смешивающая переменная может быть измерена. Другое название — конфаундер.' },
      cov: { t: 'Ковариация', en: 'covariance', d: 'Мера совместного изменения двух величин. Для выборки сумму произведений отклонений от соответствующих средних делят на n − 1. Численное значение зависит от единиц измерения обеих переменных.' },
      rank: { t: 'Ранг', en: 'rank', d: 'Место значения в упорядоченном ряду. При расчёте корреляции Спирмена совпадающим значениям присваивают среднее занятых ими мест.' },
      mono: { t: 'Монотонная зависимость', en: 'monotonic relationship', d: 'При увеличении x величина y либо нигде не убывает, либо нигде не возрастает. На графике такая зависимость может быть кривой.' },
      anscombe: { t: 'Квартет Энскомба', en: 'Anscombe’s quartet', d: 'Четыре набора по 11 точек с почти одинаковыми средними, дисперсиями, прямыми регрессии и коэффициентами Пирсона. Формы диаграмм существенно различаются.' },
      reverse: { t: 'Обратная причинность', en: 'reverse causality', d: 'Направление влияния противоположно исходной гипотезе. Например, покупка может побудить открыть приложение, чтобы узнать статус заказа.' },
      selection: { t: 'Смещение отбора', en: 'selection bias', d: 'Систематическое искажение вывода из-за того, какие наблюдения попали в выборку. Если отбор зависит от двух показателей, в отобранной группе между ними может появиться связь.' },
      simpson: { t: 'Парадокс Симпсона', en: 'Simpson’s paradox', d: 'При объединении групп направление связи между показателями может измениться. Например, общая корреляция скидки и чека положительна, а внутри каждой категории отрицательна.' },
      control: { t: 'Контроль переменных', en: 'controlling for variables', d: 'Учёт других переменных при сравнении групп или оценке связи. Например, клиентов сравнивают внутри возрастных групп или включают возраст в модель.' },
      partial: { t: 'Частная корреляция', en: 'partial correlation', d: 'Корреляция остатков двух линейных регрессий. Каждую из двух переменных предсказывают по одному и тому же набору других признаков.' },
      natural: { t: 'Естественный эксперимент', en: 'natural experiment', d: 'Исследование, в котором условия воздействия определяются внешним событием или правилом. Для причинного вывода нужно обосновать сопоставимость групп.' },
      random: { t: 'Рандомизация', en: 'randomization', d: 'Случайное назначение участникам условий эксперимента. Исходные признаки групп в среднем сбалансированы, хотя в конкретной выборке возможны различия.' },
      ecological: { t: 'Экологическая корреляция', en: 'ecological correlation', d: 'Корреляция между групповыми показателями, например между возрастом группы и средним доходом. Может отличаться и по величине, и по знаку от корреляции по отдельным людям.' },
      spurious: { t: 'Ложная корреляция', en: 'spurious correlation', d: 'Наблюдаемая связь, которой ошибочно дают содержательное объяснение. Например, два показателя могут расти со временем по разным причинам.' },
      walk: { t: 'Случайное блуждание', en: 'random walk', d: 'Последовательность, в которой очередное значение равно предыдущему плюс случайное приращение. Даже при нулевом среднем приращении уровни могут долго расти или снижаться.' },
      causalinf: { t: 'Причинный вывод', en: 'causal inference', d: 'Методы, которые помогают оценить, как изменится результат при изменении воздействия. Используются данные экспериментов и наблюдений.' },
      did: { t: 'Разность разностей', en: 'difference-in-differences', d: 'Сравнение изменений результата в группе воздействия и в группе сравнения за один период. Ключевое допущение состоит в том, что без воздействия средние результаты изменились бы параллельно.' },
      matching: { t: 'Матчинг', en: 'matching', d: 'Подбор участников из разных групп, близких по измеренным характеристикам до воздействия.' },
      rdd: { t: 'Разрывный дизайн', en: 'regression discontinuity design', d: 'Оценка локального эффекта воздействия по скачку результата у порога, по которому назначают воздействие.' },
      iv: { t: 'Инструментальная переменная', en: 'instrumental variable', d: 'Переменная, которая влияет на назначение воздействия, связана с результатом только через него и не связана с общими причинами воздействия и результата.' }
    },
    materials: [
      ['da-6-5-correlation-causation.md', 'Текст урока, примеры кода, вопросы и глоссарий в формате Markdown'],
      ['data/clients/', 'Общий набор главы 4. Для урока понадобится файл clients.csv с данными 1 000 клиентов.'],
      ['data/inference/', 'Общий набор главы 6. Файл discounts.csv содержит 120 заказов со скидкой. Скрипт gen_discounts.py воспроизводит эти данные.'],
      ['correlation.ipynb', 'Шесть примеров на Python и данные квартета Энскомба для проверки расчётов'],
      ['anscombe.csv', 'Квартет Энскомба: четыре набора по 11 точек из статьи 1973 года']
    ],
    prompts: [
      ['Проверка понимания', 'Задавай по одному вопросу о коэффициентах Пирсона и Спирмена, квартете Энскомба и парадоксе Симпсона. После каждого из моих пяти ответов разбери рассуждение и укажи, где в уроке это объясняется.'],
      ['Разбор утверждения', 'Я вставлю фразу вида «X связан с Y, значит, X повышает Y». Предложи несколько объяснений такой связи и подскажи, какие данные помогли бы их различить.'],
      ['План проверки', 'Помоги проверить, повышает ли уведомление траты клиентов. Что можно узнать из имеющихся данных? Как выбрать группы, период и показатель для A/B-теста?']
    ]
  };
})();
