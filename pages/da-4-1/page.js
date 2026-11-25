/* Страница 4.1 · Векторы и матрицы в NumPy */
(() => {
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ===================== Учебные данные =====================
     data/clients/clients.csv: 1000 клиентов, seed 404. На клиента 7 знаков: возраст (2), доход в тыс. ₽ (3), заказы (2).
     Доход в файле кратен 1000 ₽, поэтому запись в тысячах точна. */
  const RAW = '6608002340250348069074106701590730434032035606506470620325066033912304210250038078076704204191130564060024312608570770523044033502802240710770194042813005390790665118043602502620540518030014808108400580418026043805304411260220134073909503330440527040026505904381820939140034007706260690536039033305303590740358052003804605200950833037055711806351140333105007007803360500558107032112403200640255219103410607350630169057023603203600690355095062904802220950366096053605700510630742059051904704581280518058072908302381020628031035704302661090541026044706004500620870026042805501220430052067033408504241090639128053603402410940855062024609908401220553097045116200331450724088041803605580960926082041903404201850629034016910106311340769041025205201660440055069052605503261010953136102105702480890726076046205002220440449062054611000210510253113022906703671040854130066615800381020543095026204204570590564068036603903651020833096045309403440300468109036507902421550819042066904201550980242058036012504460560149054064503804690630433049025408705670390365046042303101480340454071056607503420860747041045606404591370432075022605405460480551102016106305331060618081052313011420820370057014108905380640552042062005004600770418111062611604561280465193073010305700500256125096604502240680639053056416806460700347086045008806241060327033024905204300920320049042102501291820841025025206304251050450077012602902470700367054012505105240560153100093404606300310360059054710706481020458057066810304390910361099035805301500910443066056507403360870469079084908803620960648060052704802210610447182095012504641080451079076111004250550568113032606003440850141045005609302671040718084054403904470420150175054012404360700165057006505205220330244065056408406580400533082045103103660810449063076813903300900837056012305803611230760148092704800371170862131055710805330430323041046109906211040333045036310607390330535081043303701340840437098024210604471470448112036415608600460428056043607904580730358026012004403350280163220064407805640400255057043304603390400137122016605805660690165114036509804582680533056033009104650970334091053307504620950437065014904406231240466116095702602610900423051042306606270690535058025408103360660126063032611007290250331055026213203180400653084055804301190870347031036706901560680843069034703202310550432071045906901321000370130063609604180700264048074606905441240640068042512705671700635094041906203650530423065034106705380710669070066912305450700126081026807001200330366126022406103240510433090086114504370730518046052714409440830354081041906402570550436087023305003540870549056045311502360710155046032604103450380255036015008802390960521073042806207521460738068022404403190300562147064006402370740462112066807302250770335052054307201380570146106031906304590940734140056716304590750569058035606604650560346026053007603610870941108023602903220750626045053804003520430530069016509304530770422035033908405360700144150072105008521200869074046508604280590528049035513103461140469085044303405210460642054075003201291070559066056103000351120136178086210601380490155075022908903640731054044015312205540610238052074007405551040167079053005003621630625065055906503221000531055016805203430640639035025017008631070331122066104206470700463084035206303540900221060033609909220440133055001807504540450320081033508602480590452191071805001450570549095035707405191950728025012906902550770418035022808205300880270077025905104271140560314153702704411450429066031805804700710148106054008905590560543059062408404501741022146045515905390450154048047014105320890449103043808306450840568050052706205270650440082033707103400440363094036604304490290470053033706702451140541049022608505240490167073032907902230700570029011912906442731226127052305400490510634145031911001281280734112022007603441010369063032908503340430361086066705005400960435071063710204671020540085024406204380740138035066109008361090319099054008610560700945114031904306310850353048014104902691171029076042507106540570360113003813008490600058071023521009280480652057046211006470410864092043803804651010926041066304706220520319086072107502580830367051021803203300800231049023607802260500650038054308306271210351087063106105180510226092036308203701050551079043608604520580647068031805202490610331084035311304190990326050041903000410590263099055305504211710561063026012105541090332087035404103700730656140032708603270640243079042907201250490561054042407203332350347044012207505700580722096014609502441140618148064912504670600523072044905103460710669070012906505320480540086042904507350350253099034408105391110440045023610103310970325078014905403331430319038044607205330530340061036309304570750250062034207902291120423076024404904700630451068075205303281260338041026306004681180531050015104803450990349061052306406220290429073057006306521020332079023105001660490067086056209803620430158102033205502470910945095023416804620730125087063302904631040723069074909604191130725075056608905610530324091035506404571300769070026602501450510644177052705504572270523080046904704350690330044033109604350380261055054805905281550660091075111105460480634032005007803520530137061034517307671040764167093003702350320218040014406001521030626073015005002700460132045005005302451081054035025910906400600324093055805904580540266159021905105590690322062023104103530760659058065108007310500451074082906301450510030039043905604290360461059026809903690600345056055503905260400161041035707204370450064056003305905600620120075024404702220980431165036105105680650361072056007504280540424053053605304690410159050022306504530690423033033110806590970342047065416707530650351041074311403610890336050052305803371871158046012702500550640119195056505406410900421088077007005330250166110091909905631650519069036509102190850636074082303905501170370087046312806400330727134045606303280340450084053308306670320222092026410403220900155036043809703320450236061045003804660450432066023307905490950627082022705101360390152044034303904320380254100046405604640450562041023406605331030341093023603001350510249145064612905190880663035085512705451950227073046119106471550352076032615507461150253066044107804420250128045046602701590890256088077003200410930640039051905704330280340088044316105180390323064017012303460730425054055812301451140153111026008707551110360110042507807250780243062032812501300450825066022904406701851249025034604404460740924052013909802661190863057026405705670660238081034906204540900661081026410603490690438071036607504681150347053042604703260390443070035903905560770568111115107704500800557099025003701220900266075042010005410900430047042304603590770152098012212104691940970088044113910560440339121062302804460770629065044415406381050244176072908007692080920136043414104491600542115104704303390740259122065005301290310065082056106303401070570103085617306300730433042063505902390700540059025605201490880719039026303804610730465089074810809700460262077015502802701190429058012909903640590334045054406004471290630053042102502531200256144053707706250780327051066013207190540266094043407305';
  const N = 1000, AGE = new Float64Array(N), INC = new Float64Array(N), ORD = new Float64Array(N);
  for (let i = 0; i < N; i++) { const r = RAW.substr(i * 7, 7); AGE[i] = +r.slice(0, 2); INC[i] = +r.slice(2, 5) * 1000; ORD[i] = +r.slice(5, 7); }

  /*calc:start*/
  // Среднее и стандартное отклонение (ddof=0) по 1000 учебным клиентам, посчитаны NumPy:
  // X.mean(axis=0), X.std(axis=0) для столбцов age, income, orders
  const MU = [43.802, 79323, 3.975];
  const SD = [15.516017401382353, 38232.324948922476, 2.1731026206785544];
  // Вектор клиента на плоскости «возраст, доход»: в исходных единицах или стандартизованный
  function vec2(c, scaled) { return scaled ? [(c.age - MU[0]) / SD[0], (c.inc - MU[1]) / SD[1]] : [c.age, c.inc]; }
  // Длина, расстояние, скалярное произведение, косинус и угол — те же формулы, что np.linalg.norm, a @ b и a @ b / (|a| |b|)
  function twoCalc(A, B, scaled) {
    const a = vec2(A, scaled), b = vec2(B, scaled);
    const dx = a[0] - b[0], dy = a[1] - b[1], d2 = dx * dx + dy * dy;
    const dot = a[0] * b[0] + a[1] * b[1];
    const na = Math.hypot(a[0], a[1]), nb2 = Math.hypot(b[0], b[1]);
    const cos = na > 0 && nb2 > 0 ? dot / (na * nb2) : null;
    // угол через atan2: точнее arccos, когда cos почти 1
    const ang = cos == null ? null : Math.atan2(Math.abs(a[0] * b[1] - a[1] * b[0]), dot) * 180 / Math.PI;
    return { a, b, dx, dy, d: Math.sqrt(d2), d2, dot, cos, ang, na, nb: nb2, shareAge: d2 > 0 ? dx * dx / d2 : null };
  }
  /*calc:end*/

  /* ===================== Сцена: клиенты как стрелки ===================== */
  // Номера строк (с нуля) клиентов сцены и числа, посчитанные NumPy на стандартизованной матрице Z
  const IA = 48;                                   // клиент 49: 57 лет, 118 000 ₽, 6 заказов
  const IR = 880;                                  // клиент 881: в рублях угол с 49 — 0,04°
  const PV = {
    6: { i: 880, dot: '−2,37', cos: '−0,93', ang: '158°', lab: '881 · 33 года, 28 тыс. ₽' },
    7: { i: 174, dot: '0,005', cos: '0,002', ang: '≈90°', lab: '175 · 26 лет, 116 тыс. ₽' },
    8: { i: 988, dot: '2,36', cos: '0,90', ang: '25°', lab: '989 · 47 лет, 129 тыс. ₽' }
  };
  const TROWS = [[47, 20, 95000, 8], [48, 33, 37000, 5], [49, 57, 118000, 6], [50, 35, 114000, 3], [51, 33, 105000, 0]];
  const fmtR = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const COL = { acc: '#36b8a6', amb: '#e3c04d', pink: '#f06ba5', ink: '#e8ecf4', ink2: '#b7c0d2', mut: '#6f7a91', line: '#232c42' };

  const scene = {
    parts: [{ n: '01', name: 'Строка', s: [0, 1] }, { n: '02', name: 'Вектор', s: [2, 3] }, { n: '03', name: 'Масштаб', s: [4, 5] }, { n: '04', name: 'Угол', s: [6, 7, 8] }, { n: '05', name: 'Матрица', s: [9] }],
    steps: [
      { title: "Три признака одного клиента", dur: 3200, body: "<p>В&nbsp;таблице собраны данные о тысяче клиентов магазина. Для каждого известны возраст, месячный доход и&nbsp;число заказов за квартал.</p><p>Строка клиента 49 содержит три значения в&nbsp;этом порядке: <b>(57, 118&nbsp;000, 6)</b>. Они образуют вектор.</p>" },
      { title: "Три координаты задают точку", dur: 3600, body: "<p>Отведём каждому признаку свою ось. Клиенту 49 соответствует точка с&nbsp;координатами 57&nbsp;лет, 118&nbsp;000&nbsp;₽ и&nbsp;6&nbsp;заказов.</p><p>Пока у каждой оси свой масштаб, поэтому хорошо видны все три координаты.</p>" },
      { title: "Стрелка из начала координат", dur: 3400, body: "<p>Проведём стрелку из&nbsp;начала координат до точки клиента 49. Её длина и&nbsp;направление зависят от&nbsp;всех трёх координат.</p><p>По&nbsp;исходным значениям длина ‖a‖ = √(57² + 118 000² + 6²) ≈ 118&nbsp;000,01. Основной вклад в&nbsp;сумму квадратов вносит доход.</p>" },
      { title: "Тысяча клиентов в одной матрице", dur: 3800, body: "<p>Каждая новая стрелка соответствует ещё одной строке таблицы. Всего в&nbsp;матрице <b>X</b> тысяча строк и&nbsp;три столбца, поэтому её форма — (1000, 3).</p>" },
      { title: "В исходных единицах угол меньше 0,15°", dur: 4200, body: "<p>Покажем один год, один рубль и&nbsp;один заказ отрезками одинаковой длины. Числа в&nbsp;столбце дохода намного больше остальных, и&nbsp;стрелки почти совпадают с&nbsp;осью дохода.</p><p>Для клиентов 49 и&nbsp;881 угол равен примерно 0,04°. Для любой пары в&nbsp;этой таблице он меньше 0,15°.</p>" },
      { title: "Новое начало координат после стандартизации", dur: 4000, body: "<p>Из&nbsp;каждого значения вычтем среднее по&nbsp;столбцу и&nbsp;разделим разность на&nbsp;стандартное отклонение этого столбца: <b>z = (x − μ) / σ</b>.</p><p>Теперь в&nbsp;начале координат все признаки равны своим средним значениям. По&nbsp;каждой координате видно, на&nbsp;сколько стандартных отклонений показатель клиента выше или ниже среднего.</p>" },
      { title: "Тупой угол и отрицательное произведение", dur: 3800, body: "<p>Клиенту 881 — 33 года, его доход — 28&nbsp;000&nbsp;₽, за квартал он сделал 3&nbsp;заказа. Все три показателя ниже среднего. У клиента 49 каждый из&nbsp;них выше среднего.</p><p>Попарные произведения координат отрицательны. Их сумма a · b ≈ −2,37, а угол между векторами — около 158°.</p>" },
      { title: "Угол близок к прямому", dur: 3800, body: "<p>Клиент 175 моложе среднего, а его доход выше среднего. У клиента 49 и&nbsp;возраст, и&nbsp;доход выше среднего. В&nbsp;скалярном произведении вклад возраста отрицательный, а дохода — положительный.</p><p>Эти вклады почти компенсируют друг друга. С&nbsp;учётом числа заказов a · b ≈ 0,005, а угол составляет около 89,9°.</p>" },
      { title: "Острый угол и положительное произведение", dur: 3800, body: "<p>Клиенту 989 — 47&nbsp;лет, его доход — 129&nbsp;000&nbsp;₽, за квартал он сделал 6&nbsp;заказов. Как и&nbsp;у клиента 49, все три показателя выше среднего.</p><p>Угол между векторами — около 25°, a · b ≈ 2,36. Длины векторов трёх клиентов, с&nbsp;которыми мы сравнивали клиента 49, близки (от&nbsp;1,50 до 1,61). Различие в&nbsp;результатах связано главным образом с&nbsp;углом.</p>" },
      { title: "Тысяча сравнений с клиентом 49", dur: 4200, next: 'Читать страницу', body: "<p>Пусть <b>a</b> — вектор клиента 49, а <b>Z</b> — матрица стандартизованных признаков всех клиентов. Выражение <b>Z @ a</b> даёт тысячу скалярных произведений, по&nbsp;одному для каждой строки.</p><p>Положительный результат получили для 461 клиента, включая самого клиента 49. Концы их стрелок лежат по&nbsp;ту же сторону от&nbsp;плоскости, перпендикулярной вектору a и&nbsp;проходящей через начало координат, что и&nbsp;конец a.</p>" }
    ],
    hud: [{ id: 'shape', label: 'Форма' }, { id: 'dot', label: 'a · b' }, { id: 'cos', label: 'Косинус' }],
    legend: '<span><i style="background:#36b8a6"></i>клиент 49 (a)</span><span><i style="background:#e3c04d"></i>второй клиент (b)</span><span><i style="background:#8d95aa"></i>остальные</span>',
    info: 'КЛИЕНТЫ КАК ВЕКТОРЫ',
    aiNote: "В clients.csv приведены признаки тысячи покупателей: возраст, месячный доход и число заказов за квартал. У клиента 49 они равны 57 годам, 118 000 ₽ и 6 заказам. Длина вектора в исходных единицах равна примерно 118 000,01. Матрица X имеет форму (1000, 3). Без стандартизации угол между векторами клиентов 49 и 881 составляет около 0,04°, а для любой пары из таблицы он меньше 0,15°. После стандартизации начало координат соответствует средним значениям признаков. Для клиента 49 и клиентов 881, 175 и 989 углы равны примерно 158°, 89,9° и 25°, а скалярные произведения — примерно −2,37, 0,005 и 2,36. Выражение Z @ a даёт тысячу скалярных произведений с вектором клиента 49. Из них 461 положительное, включая сравнение клиента 49 с самим собой.",
    mount(root, api) {
      root.innerHTML = '<div class="v41"><canvas class="v41-cv" aria-hidden="true"></canvas><div class="v41-tbl"></div><div class="v41-call"></div><div class="v41-call v41-c2"></div></div>';
      const box = root.firstChild, cv = box.firstChild, ctx = cv.getContext('2d');
      const tbl = box.children[1], c1 = box.children[2], c2 = box.children[3];
      tbl.innerHTML = `<table><thead><tr><th>client_id</th><th>age</th><th>income</th><th>orders</th></tr></thead><tbody>${TROWS.map(r => `<tr${r[0] === 49 ? ' class="v41-on"' : ''}><td>${r[0]}</td><td>${r[1]}</td><td>${fmtR(r[2])}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table><p class="v41-tn">X[48] = [57, 118000, 6]</p>`;
      [tbl, c1, c2].forEach(el => { el._c = {}; });
      let W = 0, H = 0, sig = '';
      const fit = () => {
        W = box.clientWidth; H = box.clientHeight; if (!W || !H) return;
        const r = Math.min(2, window.devicePixelRatio || 1);
        cv.width = Math.round(W * r); cv.height = Math.round(H * r); cv.style.width = W + 'px'; cv.style.height = H + 'px';
        ctx.setTransform(r, 0, 0, r, 0, 0); sig = '';
      };
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box);
      fit();

      // Координаты: «коробка» (каждая ось под свой диапазон), настоящий масштаб и стандартизованные
      const BX = new Float64Array(N * 3), ZS = new Float64Array(N * 3);
      for (let i = 0; i < N; i++) {
        BX[i * 3] = AGE[i] / 40 - 1; BX[i * 3 + 1] = ORD[i] / 8 - 1; BX[i * 3 + 2] = INC[i] / 160000 - 1;
        ZS[i * 3] = (AGE[i] - MU[0]) / SD[0]; ZS[i * 3 + 1] = (ORD[i] - MU[2]) / SD[2]; ZS[i * 3 + 2] = (INC[i] - MU[1]) / SD[1];
      }
      const DOTA = new Float64Array(N);
      for (let i = 0; i < N; i++) DOTA[i] = ZS[i * 3] * ZS[IA * 3] + ZS[i * 3 + 1] * ZS[IA * 3 + 1] + ZS[i * 3 + 2] * ZS[IA * 3 + 2];
      const FX = 80 / 320000, FY = 16 / 320000;   // во сколько раз ось возраста и заказов короче оси дохода, если 1 год = 1 заказ = 1 ₽

      let st, cam;
      // мировые координаты клиента i при текущем состоянии
      const P3 = [0, 0, 0];
      function pos(i, o) {
        const fx = lerp(1, FX, st.ft), fy = lerp(1, FY, st.ft);
        const tx = -1 + (BX[i * 3] + 1) * fx, ty = -1 + (BX[i * 3 + 1] + 1) * fy, tz = BX[i * 3 + 2];
        const m = st.mt, g = st.G;
        o[0] = lerp(tx, ZS[i * 3] / g, m); o[1] = lerp(ty, ZS[i * 3 + 1] / g, m); o[2] = lerp(tz, ZS[i * 3 + 2] / g, m);
        return o;
      }
      const org = () => [lerp(-1, 0, st.mt), lerp(-1, 0, st.mt), lerp(-1, 0, st.mt)];
      // ортогональная проекция; поворот камеры psi вокруг оси дохода, наклон .42 рад
      function proj(a, o, z) {
        const x1 = o * cam.c - a * cam.s, d = o * cam.s + a * cam.c;
        return [cam.cx + cam.S * x1, cam.cy - cam.S * (z * cam.cp + d * cam.sp)];
      }
      const pw = (v) => proj(v[0], v[1], v[2]);
      function arrow(o, t, color, lw, head) {
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(t[0], t[1]); ctx.stroke();
        const dx = t[0] - o[0], dy = t[1] - o[1], L = Math.hypot(dx, dy); if (L < 10 || !head) return;
        const ux = dx / L, uy = dy / L, hb = head;
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(t[0], t[1]);
        ctx.lineTo(t[0] - ux * hb - uy * hb * .45, t[1] - uy * hb + ux * hb * .45); ctx.lineTo(t[0] - ux * hb + uy * hb * .45, t[1] - uy * hb - ux * hb * .45); ctx.closePath(); ctx.fill();
      }
      function dash(a, b, color) { ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore(); }
      function label(txt, p, color, align, dy) {
        ctx.fillStyle = color; ctx.textAlign = 'left';
        const w = ctx.measureText(txt).width, x0 = align === 'center' ? p[0] - w / 2 : align === 'right' ? p[0] - w : p[0];
        const x = Math.max(4, Math.min(W - w - 4, x0)), y = Math.max(12, Math.min(H - 4, p[1] + (dy || 0)));
        ctx.fillText(txt, x, y);
      }
      // выноски и таблица — HTML-элементы поверх холста
      function placeEl(el, x, y, op) {
        const c = el._c, t = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
        if (c.t !== t) { el.style.transform = t; c.t = t; }
        const o = op <= .001 ? '0' : op >= .999 ? '1' : op.toFixed(3);
        if (c.o !== o) { el.style.opacity = o; el.style.visibility = o === '0' ? 'hidden' : 'visible'; c.o = o; }
      }
      // dx = 'c' — по центру точки
      function place(el, txt, p, op, dx, dy) {
        const c = el._c;
        if (c.txt !== txt) { el.textContent = txt; c.txt = txt; c.w = el.offsetWidth; c.h = el.offsetHeight; }
        const x0 = dx === 'c' ? p[0] - c.w / 2 : p[0] + (dx || 0);
        const x = Math.max(2, Math.min(W - c.w - 2, x0)), y = Math.max(2, Math.min(H - c.h - 2, p[1] + (dy || 0)));
        placeEl(el, x, y, op);
      }
      const hide = el => placeEl(el, 0, 0, 0);

      function axesBox(alpha) {
        if (alpha <= 0) return;
        ctx.globalAlpha = alpha;
        const fx = lerp(1, FX, st.ft), fy = lerp(1, FY, st.ft);
        const O = [-1, -1, -1], ex = [-1 + 2 * fx, -1, -1], ey = [-1, -1 + 2 * fy, -1], ez = [-1, -1, 1];
        // рамка коробки
        ctx.strokeStyle = COL.line; ctx.lineWidth = 1; ctx.beginPath();
        const P = c => pw([-1 + 2 * fx * c[0], -1 + 2 * fy * c[1], -1 + 2 * c[2]]);
        [[[1, 0, 0], [1, 1, 0]], [[0, 1, 0], [1, 1, 0]], [[0, 0, 1], [1, 0, 1]], [[0, 0, 1], [0, 1, 1]], [[1, 0, 1], [1, 1, 1]], [[0, 1, 1], [1, 1, 1]], [[1, 0, 0], [1, 0, 1]], [[0, 1, 0], [0, 1, 1]], [[1, 1, 0], [1, 1, 1]]].forEach(([a, b]) => { const p = P(a), q = P(b); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); });
        ctx.stroke();
        const o = pw(O);
        [[ex, 'возраст, лет'], [ey, 'заказы'], [ez, 'доход, ₽']].forEach(([e, t], k) => {
          const q = pw(e); ctx.strokeStyle = COL.mut; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
          if (k === 2 || st.ft < .5) label(t, q, COL.ink2, k === 2 ? 'center' : k === 0 ? 'left' : 'right', k === 2 ? -8 : 14);
        });
        // деления
        ctx.fillStyle = COL.mut;
        if (st.ft < .4) {
          // на шаге с точкой 49 деления 60 и 5 убраны: рядом подписи 57 и 6
          (st.k === 1 ? [20, 40] : [20, 40, 60]).forEach(v => { const q = pw([-1 + v / 40 * fx, -1, -1]); label(String(v), q, COL.mut, 'center', 14); });
          (st.k === 1 ? [10, 15] : [5, 10, 15]).forEach(v => { const q = pw([-1, -1 + v / 8 * fy, -1]); label(String(v), q, COL.mut, 'right', 12); });
        }
        [100000, 200000, 300000].forEach(v => { const q = pw([-1, -1, -1 + v / 160000]); label(fmtR(v), q, COL.mut, 'right', 4); ctx.fillRect(q[0] - 3, q[1], 6, 1); });
        label('0', [o[0] - 6, o[1]], COL.mut, 'right', 4);
        ctx.globalAlpha = 1;
      }
      function axesStd(alpha) {
        if (alpha <= 0) return;
        ctx.globalAlpha = alpha;
        const g = st.G, R = 2.6 / g;
        [[[1, 0, 0], 'возраст, σ'], [[0, 1, 0], 'заказы, σ'], [[0, 0, 1], 'доход, σ']].forEach(([e, t], k) => {
          const a = pw([-e[0] * R, -e[1] * R, -e[2] * R]), b = pw([e[0] * R, e[1] * R, e[2] * R]);
          ctx.strokeStyle = COL.mut; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          for (let s = -2; s <= 2; s++) { if (!s) continue; const q = pw([e[0] * s / g, e[1] * s / g, e[2] * s / g]); ctx.fillStyle = COL.mut; ctx.fillRect(q[0] - 2, q[1] - 2, 4, 4); }
          label(t, b, COL.ink2, k === 2 ? 'center' : k === 0 ? 'left' : 'right', k === 2 ? -8 : 14);
        });
        const q = pw([0, 0, 1 / g]); label('+1σ', [q[0] + 6, q[1]], COL.mut, 'left', 4);
        ctx.globalAlpha = 1;
      }
      function cloud(n, alpha, signed) {
        if (alpha <= 0 || n <= 0) return;
        const o = pw(org());
        const draw = (want, color) => {
          ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = alpha; ctx.beginPath();
          for (let i = 0; i < n; i++) { if (i === IA) continue; if (want && (DOTA[i] > 0) !== (want > 0)) continue; const q = pw(pos(i, P3)); ctx.moveTo(o[0], o[1]); ctx.lineTo(q[0], q[1]); }
          ctx.stroke();
          ctx.globalAlpha = Math.min(1, alpha * 3.2); ctx.fillStyle = color;
          for (let i = 0; i < n; i++) { if (i === IA) continue; if (want && (DOTA[i] > 0) !== (want > 0)) continue; const q = pw(pos(i, P3)); ctx.fillRect(q[0] - 1, q[1] - 1, 2, 2); }
        };
        if (signed) { draw(1, COL.acc); draw(-1, COL.pink); } else draw(0, '#8d95aa');
        ctx.globalAlpha = 1;
      }
      function arcAB(a, b, r, op) {
        const na = Math.hypot(...a), nb = Math.hypot(...b);
        const u = a.map(v => v / na), v = b.map(x => x / nb);
        const om = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1] + u[2] * v[2])));
        if (om < 1e-3) return null;
        ctx.globalAlpha = op; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.3; ctx.beginPath();
        let mid = null;
        for (let j = 0; j <= 32; j++) {
          const t = j / 32, s0 = Math.sin((1 - t) * om) / Math.sin(om), s1 = Math.sin(t * om) / Math.sin(om);
          const q = pw([r * (s0 * u[0] + s1 * v[0]), r * (s0 * u[1] + s1 * v[1]), r * (s0 * u[2] + s1 * v[2])]);
          if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]);
          if (j === 16) mid = q;
        }
        ctx.stroke(); ctx.globalAlpha = 1;
        return mid;
      }
      function plane(a, op) {
        if (op <= 0) return;
        const na = Math.hypot(...a), u = a.map(x => x / na);
        let e1 = [u[1], -u[0], 0]; const l1 = Math.hypot(...e1); e1 = e1.map(x => x / l1);
        const e2 = [u[1] * e1[2] - u[2] * e1[1], u[2] * e1[0] - u[0] * e1[2], u[0] * e1[1] - u[1] * e1[0]];
        const R = .95;
        ctx.globalAlpha = op; ctx.beginPath();
        for (let j = 0; j <= 48; j++) { const t = j / 48 * Math.PI * 2; const q = pw([R * (e1[0] * Math.cos(t) + e2[0] * Math.sin(t)), R * (e1[1] * Math.cos(t) + e2[1] * Math.sin(t)), R * (e1[2] * Math.cos(t) + e2[2] * Math.sin(t))]); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
        ctx.fillStyle = 'rgba(232,236,244,.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(232,236,244,.35)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.globalAlpha = 1;
      }

      return {
        render(k, p) {
          // счётчики
          const nCloud = k === 3 ? Math.round(N * ease(seg(p, .05, .85))) : k > 3 ? N : 0;
          if (k <= 2) api.hud('shape', '(3,)', 'X[48]');
          else if (k === 3) api.hud('shape', `(${nCloud}, 3)`, 'X');
          else if (k <= 8) api.hud('shape', '(1000, 3)', k >= 5 ? 'Z' : 'X');
          else api.hud('shape', '(1000,)', 'Z @ a');
          const pv = PV[k], prev = PV[k - 1], landed = k === 6 || p >= .45;
          if (k === 4) { api.hud('dot', '3,3 млрд', 'до стандартизации'); api.hud('cos', '0,9999998', '0,04°'); }
          else if (pv) { const v = landed ? pv : prev; api.hud('dot', v.dot, ''); api.hud('cos', v.cos, v.ang); }
          else if (k === 9) { api.hud('dot', '461', '> 0'); api.hud('cos', '—', ''); }
          else { api.hud('dot', '—', ''); api.hud('cos', '—', ''); }

          const key = `${k}|${Math.round(p * 500)}|${W}|${H}`;
          if (key === sig || !W) return; sig = key;

          // состояние мира
          st = { k, ft: k < 4 ? 0 : k === 4 ? ease(seg(p, .1, .75)) : 1, mt: k < 5 ? 0 : k === 5 ? ease(seg(p, .1, .75)) : 1, G: k < 6 ? 2.4 : k === 6 ? lerp(2.4, 1.8, ease(seg(p, 0, .35))) : 1.8 };
          // камера: для «коробки» — сбоку и чуть сверху; после схлопывания (шаг 5) поворачивается к виду,
          // где стрелки 49, 881, 175 и 989 почти параллельны экрану (подобрано по NumPy: вектор, ортогональный им в среднем)
          const m = Math.min(W, H), turn = k < 4 ? 0 : k === 4 ? ease(seg(p, .2, .8)) : 1;
          const psi = lerp(-2.1 + .03 * Math.min(k + p, 4), 1.91 - 2 * Math.PI, turn) + (k >= 5 ? .03 * (k - 5 + p) : 0), phi = lerp(.28, .41, turn);
          cam = { c: Math.cos(psi), s: Math.sin(psi), cp: Math.cos(phi), sp: Math.sin(phi), cx: W / 2, cy: H / 2 + m * lerp(.06, .04, st.mt), S: m * lerp(.3, .36, st.mt) };
          ctx.clearRect(0, 0, W, H);
          ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace'; ctx.textBaseline = 'alphabetic';

          // таблица
          const to = k === 0 ? seg(p, 0, .2) : k === 1 ? 1 - seg(p, 0, .3) : 0;
          const tw = tbl.offsetWidth, th = tbl.offsetHeight;
          placeEl(tbl, Math.max(0, (W - tw) / 2), Math.max(0, (H - th) / 2 - 14), to);
          if (k === 0) { place(c1, 'одна строка — три числа — вектор', [W / 2, (H + th) / 2], seg(p, .45, .6), 'c', 0); hide(c2); return; }

          // оси
          axesBox(k === 1 ? seg(p, 0, .4) : k <= 4 ? 1 : k === 5 ? 1 - seg(p, 0, .35) : 0);
          axesStd(k === 5 ? seg(p, .4, .8) : k > 5 ? 1 : 0);

          // облако
          const ca = k === 3 ? .11 : k === 4 || k === 5 ? .11 : k <= 8 ? .045 : .16 * seg(p, .1, .5) + .045 * (1 - seg(p, .1, .5));
          if (k === 9) cloud(N, ca, p > .1);
          else cloud(nCloud, ca, false);

          const O = pw(org()), A3 = pos(IA, [0, 0, 0]), A = pw(A3);
          if (k === 9) plane(A3, seg(p, .3, .6));
          // клиент 881 рядом с 49 при схлопывании
          if (k === 4 || k === 5) {
            const D = pw(pos(IR, [0, 0, 0])), op = k === 4 ? seg(p, 0, .15) : 1 - seg(p, .0, .3);
            ctx.globalAlpha = op; arrow(O, D, COL.amb, 2.2, 8); ctx.globalAlpha = 1;
            if (k === 4) place(c2, '881', D, op, 8, -22); else hide(c2);
          }
          // партнёр в скалярных шагах
          let Bp = null, B3 = null;
          if (k >= 6 && k <= 9) {
            const cur = PV[Math.min(8, k)], from = PV[k - 1] || cur;
            const t = k === 6 ? 1 : k === 9 ? 1 : ease(seg(p, 0, .45));
            const f3 = pos(from.i, [0, 0, 0]), c3 = pos(cur.i, [0, 0, 0]);
            B3 = [lerp(f3[0], c3[0], t), lerp(f3[1], c3[1], t), lerp(f3[2], c3[2], t)];
            Bp = pw(B3);
            const op = k === 6 ? seg(p, .2, .45) : k === 9 ? 1 - seg(p, 0, .25) : 1;
            if (op > 0) { ctx.globalAlpha = op; arrow(O, Bp, COL.amb, 2.6, 9); ctx.globalAlpha = 1; }
            const mid = op > 0 ? arcAB(A3, B3, .3, op * (k === 6 ? seg(p, .35, .6) : 1)) : null;
            if (k <= 8) {
              const lb = landed ? cur : from;
              place(c2, lb.lab, Bp, op, 8, Bp[1] > O[1] ? 6 : -26);
              if (mid) place(c1, lb.ang, mid, op * (k === 6 ? seg(p, .45, .65) : 1), -14, -24); else hide(c1);
            } else hide(c2);
          }
          // клиент 49
          if (k === 1) {
            const ap = seg(p, .3, .5), gp = seg(p, .5, .8);
            const f = [A3[0], A3[1], -1], ax = [A3[0], -1, -1], ay = [-1, A3[1], -1], az = [-1, -1, A3[2]];
            ctx.globalAlpha = gp; dash(A, pw(f), COL.ink2); dash(pw(f), pw(ax), COL.ink2); dash(pw(f), pw(ay), COL.ink2); dash(A, pw(az), COL.ink2);
            label('57', pw(ax), COL.acc, 'center', 15); label('6', pw(ay), COL.acc, 'right', 13); label('118 000', pw(az), COL.acc, 'right', -6);
            ctx.globalAlpha = ap; ctx.fillStyle = COL.acc; ctx.beginPath(); ctx.arc(A[0], A[1], 5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
            place(c1, '(57; 118 000; 6)', A, seg(p, .55, .7), 10, -30); hide(c2);
          } else {
            const t = k === 2 ? ease(seg(p, 0, .55)) : 1;
            const tip = [lerp(O[0], A[0], t), lerp(O[1], A[1], t)];
            arrow(O, tip, COL.acc, 2.8, 10);
            if (k === 2) { ctx.fillStyle = COL.acc; ctx.beginPath(); ctx.arc(A[0], A[1], 4, 0, Math.PI * 2); ctx.fill(); }
          }
          // выноски по шагам
          if (k === 2) { place(c1, '‖a‖ ≈ 118 000,01', [(O[0] + A[0]) / 2, (O[1] + A[1]) / 2], seg(p, .55, .7), 12, -10); place(c2, '0 = (0; 0; 0)', O, seg(p, .1, .25), -40, 10); }
          else if (k === 3) { place(c1, 'Матрица X: 1 000 строк и 3 столбца', [W / 2, 6], seg(p, .6, .75), 'c', 0); hide(c2); }
          else if (k === 4) place(c1, '49 и 881: угол 0,04°', A, seg(p, .75, .9), 12, -8);
          else if (k === 5) { place(c1, '0 — средние значения', O, seg(p, .7, .85), 10, 12); place(c2, 'z = (x − μ) / σ', [8, 8], seg(p, .25, .4), 0, 0); }
          else if (k === 9) place(c1, 'Z @ a: 461 из 1 000 значений больше нуля', [W / 2, H - 30], seg(p, .55, .7), 'c', 0);
          if (k >= 6 && k <= 8 && !Bp) hide(c1);
        }
      };
    }
  };

  /* ===================== Интерактив «Два клиента» ===================== */
  const START = () => ({ A: { age: 26, inc: 116000 }, B: { age: 64, inc: 60000 } });   // клиенты 175 и 15 из учебной таблицы
  const TASKS = [
    { t: 'В исходных единицах задайте клиентам одинаковый доход. Расстояние станет равно разнице в возрасте.', ok: (s, R) => !s.scaled && s.A.inc === s.B.inc },
    { t: 'Включите стандартизацию. Сделайте угол близким к прямому (|cos θ| < 0,05).', ok: (s, R) => s.scaled && R.cos != null && Math.abs(R.cos) < .05 },
    { t: 'После стандартизации добейтесь угла, при котором cos θ > 0,95.', ok: (s, R) => s.scaled && R.cos != null && R.cos > .95 }
  ];

  function buildTwo(box, api) {
    const { esc, fmt, plural } = api;
    const yrs = n => `${n} ${plural(n, ['год', 'года', 'лет'])}`;
    const rub = v => `${fmt(v)} ₽`;
    // доля в процентах: у почти 0 и почти 100% показываем столько знаков, сколько нужно, чтобы не округлить до 0 или 100
    const pct = sh => {
      const v = sh * 100;
      if (v === 0 || v === 100) return `${v}%`;
      if (v > 99 && v < 100) return `${fmt(v, Math.min(9, Math.ceil(-Math.log10(100 - v))))}%`;
      if (v >= 1) return `${fmt(v, 1)}%`;
      return `${fmt(v, Math.min(9, Math.ceil(-Math.log10(v))))}%`;
    };
    box.innerHTML = `<div class="block-hd"><span class="t">Как единицы измерения меняют расстояние и угол <i>интерактив</i></span><div class="ctrls"><label class="chk tc-sw"><input type="checkbox" id="tc-sc"><span>стандартизовать признаки</span></label><button type="button" class="btn ghost small" id="tc-reset">Сбросить</button></div></div>
<p class="hint tc-do">Перемещайте точки A и B мышью или пальцем. Для управления с клавиатуры выберите точку клавишей Tab и нажимайте стрелки. Можно также воспользоваться кнопками под графиком.</p>
<div class="stage"><div class="tc-main"><div class="tc-plot"><svg class="tc-svg" id="tc-svg" role="group" aria-label="Возраст и доход двух клиентов. Стрелки проведены из начала координат к точкам A и B."><g id="tc-g0"></g><g id="tc-g1"></g>${['A', 'B'].map(k => `<g class="tc-h tc-h${k}" id="tc-h${k}" tabindex="0" role="button"><circle class="tc-hit" r="24"></circle><circle class="tc-hd" r="10"></circle><text class="tc-hl" text-anchor="middle" dy="4">${k}</text></g>`).join('')}</svg></div>
<div class="tc-pad"><span class="tc-lb">Клиент</span><span class="seg" role="group" aria-label="Выбор клиента" id="tc-who"><button type="button" data-k="A">A</button><button type="button" data-k="B">B</button></span><span class="tc-mv"><button type="button" class="btn ghost small" data-mv="inc,-5000">доход −5 000</button><button type="button" class="btn ghost small" data-mv="inc,5000">доход +5 000</button><button type="button" class="btn ghost small" data-mv="age,-5">возраст −5</button><button type="button" class="btn ghost small" data-mv="age,5">возраст +5</button></span></div><div class="tc-tw"><p class="cap">Задания</p><ol class="tc-tasks" id="tc-tasks"></ol></div></div>
<div class="narr"><p class="cap" id="tc-cap"></p><p class="tc-vec" id="tc-vec"></p>
<div class="readout tc-ro"><div><span class="big" id="tc-d"></span><span class="lbl">расстояние ‖a − b‖</span></div><div><span class="big" id="tc-dot"></span><span class="lbl">скалярное произведение a · b</span></div><div><span class="big" id="tc-cos"></span><span class="lbl" id="tc-cosl">косинус cos θ</span></div></div>
<div class="tc-share"><span class="tc-sl">Вклад признаков в квадрат расстояния</span><div class="tc-bar" aria-hidden="true"><i class="tc-ba" id="tc-ba"></i><i class="tc-bi" id="tc-bi"></i></div><div class="tc-bl"><span><i class="tc-ka"></i>возраст <b id="tc-pa"></b></span><span><i class="tc-ki"></i>доход <b id="tc-pi"></b></span></div></div>
<div class="narr-text" id="tc-msg"></div></div></div>
<div class="status"><span><span class="dot live"></span><span id="tc-s1"></span></span><span id="tc-s2"></span><span class="grow"></span><span id="tc-s3"></span></div>`;
    const $ = id => box.querySelector('#' + id);
    const svg = $('tc-svg'), g0 = $('tc-g0'), g1 = $('tc-g1'), H = { A: $('tc-hA'), B: $('tc-hB') };
    let s, geo, dotsD = '', drag = null, raf = 0, R;
    const fresh = () => Object.assign(START(), { scaled: false, sel: 'A', done: [false, false, false] });

    function layout() {
      const wrap = box.querySelector('.tc-plot'), W = Math.max(280, wrap.clientWidth), mob = W < 520;
      const Hh = mob ? Math.round(Math.max(250, W * .86)) : Math.round(Math.min(420, Math.max(320, W * .58)));
      const L = mob ? 34 : 46, Rr = 12, T = 14, B = 34, pw = W - L - Rr, ph = Hh - T - B;
      const pyY = ph / 80, pxR = pyY * SD[0] / SD[1];          // один и тот же масштаб в σ по обеим осям
      geo = { W, H: Hh, L, T, pw, ph, pyY, pxR, xmax: pw / pxR, mob };
      svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); svg.setAttribute('width', W); svg.setAttribute('height', Hh);
      let d = '';
      for (let i = 0; i < N; i++) if (INC[i] <= geo.xmax) d += `M${X(INC[i]).toFixed(1)} ${Y(AGE[i]).toFixed(1)}h0`;
      dotsD = d;
      ['A', 'B'].forEach(k => { s[k].inc = Math.min(s[k].inc, Math.floor(geo.xmax / 1000) * 1000); });
      drawStatic(); draw();
    }
    const X = v => geo.L + v * geo.pxR, Y = v => geo.T + geo.ph - v * geo.pyY;
    const sig = k => k === 0 ? '0' : `${k > 0 ? '+' : '−'}${Math.abs(k)}σ`;

    function drawStatic() {
      const g = geo; let h = '';
      if (!s.scaled) {
        const st = g.mob ? 100000 : 50000;
        for (let v = 0; v <= g.xmax; v += st) h += `<line class="tc-gr" x1="${X(v)}" y1="${g.T}" x2="${X(v)}" y2="${g.T + g.ph}"/><text class="tc-tk" x="${X(v)}" y="${g.T + g.ph + 15}" text-anchor="middle">${v / 1000}</text>`;
        for (let v = 0; v <= 80; v += 20) h += `<line class="tc-gr" x1="${g.L}" y1="${Y(v)}" x2="${g.L + g.pw}" y2="${Y(v)}"/><text class="tc-tk" x="${g.L - 6}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`;
        h += `<text class="tc-ax" x="${g.L + g.pw}" y="${g.T + g.ph + 30}" text-anchor="end">доход, тыс. ₽</text><text class="tc-ax" x="${g.L + 4}" y="${g.T + 12}">возраст, лет</text>`;
      } else {
        for (let k = -3; k <= 9; k++) { const v = MU[1] + k * SD[1]; if (v < 0 || v > g.xmax) continue; h += `<line class="tc-gr${k ? '' : ' z'}" x1="${X(v)}" y1="${g.T}" x2="${X(v)}" y2="${g.T + g.ph}"/><text class="tc-tk" x="${X(v)}" y="${g.T + g.ph + 15}" text-anchor="middle">${sig(k)}</text>`; }
        for (let k = -3; k <= 3; k++) { const v = MU[0] + k * SD[0]; if (v < 0 || v > 80) continue; h += `<line class="tc-gr${k ? '' : ' z'}" x1="${g.L}" y1="${Y(v)}" x2="${g.L + g.pw}" y2="${Y(v)}"/><text class="tc-tk" x="${g.L - 6}" y="${Y(v) + 4}" text-anchor="end">${sig(k)}</text>`; }
        h += `<text class="tc-ax" x="${g.L + g.pw}" y="${g.T + g.ph + 30}" text-anchor="end">доход, σ от среднего</text><text class="tc-ax" x="${g.L + 4}" y="${g.T + 12}">возраст, σ</text>`;
      }
      h += `<rect class="tc-fr" x="${g.L}" y="${g.T}" width="${g.pw}" height="${g.ph}"/><path class="tc-pts" d="${dotsD}"/>`;
      g0.innerHTML = h;
    }

    function head(o, t, cls) {
      const dx = t[0] - o[0], dy = t[1] - o[1], L = Math.hypot(dx, dy);
      if (L < 24) return `<line class="${cls}" x1="${o[0]}" y1="${o[1]}" x2="${t[0]}" y2="${t[1]}"/>`;
      const ux = dx / L, uy = dy / L, e = [t[0] - ux * 10, t[1] - uy * 10], b = [t[0] - ux * 21, t[1] - uy * 21];
      return `<line class="${cls}" x1="${o[0].toFixed(1)}" y1="${o[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/><path class="${cls} f" d="M${e[0].toFixed(1)} ${e[1].toFixed(1)}L${(b[0] - uy * 5).toFixed(1)} ${(b[1] + ux * 5).toFixed(1)}L${(b[0] + uy * 5).toFixed(1)} ${(b[1] - ux * 5).toFixed(1)}Z"/>`;
    }

    function draw() {
      const g = geo, sc = s.scaled;
      R = twoCalc(s.A, s.B, sc);
      TASKS.forEach((t, i) => { if (t.ok(s, R)) s.done[i] = true; });
      const pa = [X(s.A.inc), Y(s.A.age)], pb = [X(s.B.inc), Y(s.B.age)];
      const o = sc ? [X(MU[1]), Y(MU[0])] : [X(0), Y(0)];
      let h = '';
      if (sc) {
        // подпись «средние значения» — с той стороны от начала, куда не смотрят стрелки
        const ua = [pa[0] - o[0], pa[1] - o[1]], ub = [pb[0] - o[0], pb[1] - o[1]], la = Math.hypot(...ua) || 1, lb = Math.hypot(...ub) || 1;
        let qx = -(ua[0] / la + ub[0] / lb), qy = -(ua[1] / la + ub[1] / lb); const ql = Math.hypot(qx, qy);
        if (ql < .3) { qx = -ub[1] / lb; qy = ub[0] / lb; } else { qx /= ql; qy /= ql; }
        h += `<circle class="tc-o" cx="${o[0]}" cy="${o[1]}" r="4"/><text class="tc-ot" x="${(o[0] + qx * 16).toFixed(1)}" y="${(o[1] + qy * 16 + 4).toFixed(1)}" text-anchor="${qx > .3 ? 'start' : qx < -.3 ? 'end' : 'middle'}">средние значения</text>`;
      }
      else h += `<circle class="tc-o" cx="${o[0]}" cy="${o[1]}" r="4"/><text class="tc-ot" x="${o[0] + 7}" y="${o[1] - 7}">0</text>`;
      // расстояние
      h += `<line class="tc-dl" x1="${pa[0]}" y1="${pa[1]}" x2="${pb[0]}" y2="${pb[1]}"/>`;
      // подпись расстояния — у конца A, сбоку от отрезка, с той стороны, где нет начала координат
      const mx = pa[0] + (pb[0] - pa[0]) * .3, my = pa[1] + (pb[1] - pa[1]) * .3, sl = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) || 1;
      let nx = -(pb[1] - pa[1]) / sl, ny = (pb[0] - pa[0]) / sl;
      if (nx * (mx - o[0]) + ny * (my - o[1]) < 0) { nx = -nx; ny = -ny; }
      h += `<text class="tc-dt" x="${(mx + nx * 14).toFixed(1)}" y="${(my + ny * 14 + 4).toFixed(1)}" text-anchor="${nx > .35 ? 'start' : nx < -.35 ? 'end' : 'middle'}">${esc(dval(R.d))}</text>`;
      h += head(o, pa, 'tc-ar a') + head(o, pb, 'tc-ar b');
      // угол: в стандартных единицах масштаб осей одинаковый, угол на экране настоящий
      if (sc && R.cos != null) {
        const a1 = Math.atan2(o[1] - pa[1], pa[0] - o[0]), a2 = Math.atan2(o[1] - pb[1], pb[0] - o[0]);
        let da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        const r = 30, p1 = [o[0] + r * Math.cos(a1), o[1] - r * Math.sin(a1)], p2 = [o[0] + r * Math.cos(a1 + da), o[1] - r * Math.sin(a1 + da)];
        h += `<path class="tc-arc" d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}A${r} ${r} 0 0 ${da > 0 ? 0 : 1} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}"/>`;
        const am = a1 + da / 2;
        h += `<text class="tc-at" x="${(o[0] + 48 * Math.cos(am)).toFixed(1)}" y="${(o[1] - 48 * Math.sin(am) + 4).toFixed(1)}" text-anchor="middle">${fmt(R.ang, 0)}°</text>`;
      }
      // вставка: настоящий масштаб в исходных единицах
      if (!sc) {
        const iw = g.mob ? 128 : 156, ih = 62, ix = g.L + g.pw - iw - 6, iy = g.T + 6;
        const ln = Math.max(R.na, R.nb), sx = (iw - 26) / ln;
        const o2 = [ix + 10, iy + ih - 14];
        const ta = [o2[0] + R.a[1] * sx, o2[1] - R.a[0] * sx], tb = [o2[0] + R.b[1] * sx, o2[1] - R.b[0] * sx];
        h += `<g class="tc-in"><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="8"/><text x="${ix + 8}" y="${iy + 15}">равный шаг осей</text><line class="tc-ar a" x1="${o2[0]}" y1="${o2[1]}" x2="${ta[0].toFixed(1)}" y2="${ta[1].toFixed(2)}"/><line class="tc-ar b" x1="${o2[0]}" y1="${o2[1] + 3}" x2="${tb[0].toFixed(1)}" y2="${(tb[1] + 3).toFixed(2)}"/><text x="${ix + iw - 8}" y="${iy + ih - 4}" text-anchor="end">угол ${fmt(R.ang, R.ang < 1 ? 2 : 1)}°</text></g>`;
      }
      g1.innerHTML = h;
      ['A', 'B'].forEach(k => {
        const c = s[k], el = H[k], p = k === 'A' ? pa : pb;
        el.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
        el.setAttribute('aria-label', `Клиент ${k}: ${yrs(c.age)}, ${rub(c.inc)}. Стрелки клавиатуры двигают точку.`);
        el.classList.toggle('sel', s.sel === k);
      });
      box.querySelectorAll('#tc-who button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === s.sel)));
      $('tc-sc').checked = sc;
      // разбор
      const cf = v => v == null ? '—' : sc ? fmt(v, 3) : v.toFixed(7).replace('.', ',');
      $('tc-cap').textContent = sc ? 'После стандартизации' : 'В исходных единицах (годы и рубли)';
      const vf = v => sc ? fmt(v, 2) : fmt(v);
      $('tc-vec').textContent = `a = (${vf(R.a[0])}; ${vf(R.a[1])})\nb = (${vf(R.b[0])}; ${vf(R.b[1])})`;
      $('tc-d').textContent = dval(R.d);
      $('tc-dot').textContent = sc ? fmt(R.dot, 3) : fmt(R.dot);
      $('tc-cos').textContent = cf(R.cos);
      $('tc-cosl').textContent = R.cos == null ? 'косинус не определён' : `косинус cos θ, угол ${fmt(R.ang, R.ang < 1 ? 3 : 1)}°`;
      const sa = R.shareAge == null ? .5 : R.shareAge;
      $('tc-ba').style.width = `${(sa * 100).toFixed(3)}%`; $('tc-bi').style.width = `${((1 - sa) * 100).toFixed(3)}%`;
      $('tc-pa').textContent = R.shareAge == null ? '—' : pct(sa); $('tc-pi').textContent = R.shareAge == null ? '—' : pct(1 - sa);
      const dA = Math.abs(s.A.age - s.B.age);
      let m;
      if (R.d === 0) m = 'У точек A и B одинаковые координаты, поэтому расстояние равно нулю.';
      else if (!sc) m = `В формулу входят численные значения в годах и рублях. Разница в возрасте даёт слагаемое ${fmt(dA * dA)}, разница в доходе — ${fmt(R.dy * R.dy)}. Угол между стрелками показан на вставке.`;
      else {
        m = `Разница в&nbsp;возрасте — ${fmt(Math.abs(R.dx), 2)}&nbsp;σ, в&nbsp;доходе — ${fmt(Math.abs(R.dy), 2)}&nbsp;σ. `;
        if (R.cos == null) m += 'У одного клиента оба показателя равны средним. Его вектор нулевой, поэтому угол и косинус не определены.';
        else if (R.cos >= .5) m += 'Косинус положительный, поэтому угол между стрелками меньше 90°.';
        else if (R.cos <= -.5) m += 'Косинус отрицательный, поэтому угол между стрелками больше 90°.';
        else if (Math.abs(R.cos) < .2) m += 'Косинус близок к нулю, а угол между стрелками близок к прямому.';
        else m += `Угол между стрелками — около ${fmt(R.ang, 0)}°.`;
      }
      $('tc-msg').innerHTML = m;
      $('tc-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'on' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t.t)}</li>`).join('');
      $('tc-s1').textContent = `A: ${yrs(s.A.age)}, ${rub(s.A.inc)}`;
      $('tc-s2').textContent = `B: ${yrs(s.B.age)}, ${rub(s.B.inc)}`;
      $('tc-s3').textContent = sc ? 'ноль на каждой оси соответствует среднему' : 'возраст в годах, доход в рублях';
    }
    const dval = d => s.scaled ? fmt(d, 3) : fmt(d, 2);
    const later = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };

    function setC(k, age, inc, snap) {
      const o = s[k === 'A' ? 'B' : 'A'];
      let a = Math.round(age), v = Math.round(inc / 1000) * 1000;
      if (snap) { if (Math.abs(v - o.inc) * geo.pxR < 7) v = o.inc; if (Math.abs(a - o.age) * geo.pyY < 7) a = o.age; }
      s[k].age = Math.max(1, Math.min(80, a)); s[k].inc = Math.max(1000, Math.min(Math.floor(geo.xmax / 1000) * 1000, v));
    }
    const local = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) * geo.W / r.width, (e.clientY - r.top) * geo.H / r.height]; };
    svg.addEventListener('pointerdown', e => {
      const q = local(e); let best = null, bd = 30;
      ['A', 'B'].forEach(k => { const d = Math.hypot(X(s[k].inc) - q[0], Y(s[k].age) - q[1]); if (d < bd) { bd = d; best = k; } });
      if (!best) return;
      e.preventDefault(); drag = best; s.sel = best;
      try { svg.setPointerCapture(e.pointerId); } catch (er) { /* без захвата тоже работает */ }
      H[best].focus({ preventScroll: true });
    });
    svg.addEventListener('pointermove', e => { if (!drag) return; const q = local(e); setC(drag, (geo.T + geo.ph - q[1]) / geo.pyY, (q[0] - geo.L) / geo.pxR, true); later(); });
    const up = () => { drag = null; };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    ['A', 'B'].forEach(k => {
      H[k].addEventListener('focus', () => { if (s.sel !== k) { s.sel = k; draw(); } });
      H[k].addEventListener('keydown', e => {
        const big = e.shiftKey ? 10 : 1, c = s[k];
        let da = 0, di = 0;
        if (e.key === 'ArrowUp') da = big; else if (e.key === 'ArrowDown') da = -big; else if (e.key === 'ArrowRight') di = 1000 * big; else if (e.key === 'ArrowLeft') di = -1000 * big; else return;
        e.preventDefault(); e.stopPropagation(); setC(k, c.age + da, c.inc + di, false); draw();
      });
    });
    box.querySelector('#tc-who').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { s.sel = b.dataset.k; draw(); } });
    box.querySelector('.tc-mv').addEventListener('click', e => {
      const b = e.target.closest('[data-mv]'); if (!b) return;
      const [f, d] = b.dataset.mv.split(','), c = s[s.sel];
      setC(s.sel, c.age + (f === 'age' ? +d : 0), c.inc + (f === 'inc' ? +d : 0), false); draw();
    });
    $('tc-sc').addEventListener('change', e => { s.scaled = e.target.checked; drawStatic(); draw(); });
    $('tc-reset').addEventListener('click', () => { s = fresh(); layout(); });
    s = fresh();
    layout();
    if ('ResizeObserver' in window) { let lw = 0; new ResizeObserver(() => { const w = box.querySelector('.tc-plot').clientWidth; if (Math.abs(w - lw) > 2) { lw = w; layout(); } }).observe(box.querySelector('.tc-plot')); }
    return {
      describe() {
        const c = R.cos == null ? 'не определён' : (s.scaled ? fmt(R.cos, 3) : R.cos.toFixed(7).replace('.', ','));
        return `стандартизация ${s.scaled ? 'включена (по всем 1 000 клиентам)' : 'выключена (годы и рубли)'}; A: ${yrs(s.A.age)}, ${rub(s.A.inc)}; B: ${yrs(s.B.age)}, ${rub(s.B.inc)}; расстояние ${dval(R.d)}; a·b ${s.scaled ? fmt(R.dot, 3) : fmt(R.dot)}; cos ${c}; доля возраста в квадрате расстояния ${R.shareAge == null ? '—' : pct(R.shareAge)}; заданий выполнено ${s.done.filter(Boolean).length} из 3.`;
      },
      redraw() { drawStatic(); draw(); }
    };
  }

  // Блоки кода: запущены в Python 3.13.18, NumPy 2.5.3, pandas 3.0.5; вывод вставлен как есть
  const CODE = {"arrays": {"title": "Форма матрицы клиентов и прогноз квартальных трат", "badge": "проверено: Python 3.13, NumPy 2.5.3, pandas 3.0.5", "lang": "python", "code": "import numpy as np\nimport pandas as pd\nnp.set_printoptions(precision=3, suppress=True)\n\na = np.array([57, 118_000, 6])          # клиент 49: возраст, доход, заказы\nprint(a, a.shape, a.ndim, a.dtype)\n\ndf = pd.read_csv(\"data/clients/clients.csv\")\nX = df[[\"age\", \"income\", \"orders\"]].to_numpy()   # матрица «клиенты × признаки»\nprint(X.shape, X.dtype)\n\nprint(X[48])              # строка 48 — клиент 49 (счёт с нуля)\nprint(X[:3, 1])           # срез: доход первых трёх клиентов\nprint(X[:, 2].max())      # столбец «заказы» целиком, максимум\nprint(X[X[:, 2] >= 12])   # строки по условию: 12 заказов и больше\n\nX1 = np.c_[np.ones(len(X)), X[:, 1:]]   # (1000, 3): единица, доход, заказы\nw = np.array([205, 0.0347, 2550])        # коэффициенты прогноза трат (подбор весов — в уроке 4.2)\npred = X1 @ w                            # скалярное произведение каждой строки и w\nprint(X1.shape, w.shape, pred.shape)\nprint(pred[:3], df[\"spend\"].to_numpy()[:3])", "out": "[    57 118000      6] (3,) 1 int64\n(1000, 3) int64\n[    57 118000      6]\n[80000 25000 69000]\n15\n[[    60 314000     15]\n [    44 273000     12]\n [    70 185000     12]]\n(1000, 3) (3,) (1000,)\n[ 8081.   8722.5 20449.3] [ 9080 10020 15900]", "note": "В X1 три столбца: единица, месячный доход и число заказов. Выражение X1 @ w даёт по одному прогнозу для каждого клиента. Сравните первые три прогноза с фактическими тратами, напечатанными рядом."}, "dist": {"title": "Попарные расстояния между клиентами", "badge": "проверено: Python 3.13, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\nimport pandas as pd\nnp.set_printoptions(precision=2, suppress=True)\ndf = pd.read_csv(\"data/clients/clients.csv\")\nX = df[[\"age\", \"income\", \"orders\"]].to_numpy()\n\nZ = (X - X.mean(axis=0)) / X.std(axis=0)   # стандартизация: (1000, 3) − (3,), потом / (3,)\n\nS = Z[:6]                                  # первые 6 клиентов\ndiff = S[:, None, :] - S[None, :, :]       # (6, 1, 3) − (1, 6, 3) → (6, 6, 3)\nD = np.sqrt((diff ** 2).sum(axis=-1))      # сумма по признакам → (6, 6)\nprint(diff.shape, D.shape)\nprint(D)\n\nR = X[:6]                                  # те же клиенты в исходных единицах\nprint(np.sqrt(((R[:, None, :] - R[None, :, :]) ** 2).sum(axis=-1)).round())\n\n# все 1000 × 1000 через скалярные произведения: |a − b|² = |a|² + |b|² − 2 a·b\nsq = (Z ** 2).sum(axis=1)                            # (1000,)\nD2 = sq[:, None] + sq[None, :] - 2 * Z @ Z.T         # (1000, 1000)\nD_all = np.sqrt(np.clip(D2, 0, None))                # отрицательные значения около нуля возникают из-за округления\nnear = np.argsort(D_all[48])[:4]                     # клиент 49 и трое ближайших\nprint(df.iloc[near, :4].assign(dist=D_all[48, near].round(3)).to_string(index=False))", "out": "(6, 6, 3) (6, 6)\n[[0.   2.56 2.59 1.71 1.04 2.46]\n [2.56 0.   2.35 1.5  2.09 0.18]\n [2.59 2.35 0.   2.8  1.56 2.27]\n [1.71 1.5  2.8  0.   1.81 1.37]\n [1.04 2.09 1.56 1.81 0.   1.99]\n [2.46 0.18 2.27 1.37 1.99 0.  ]]\n[[    0. 55000. 11000. 13000.  7000. 48000.]\n [55000.     0. 44000. 42000. 48000.  7000.]\n [11000. 44000.     0.  2000.  4000. 37000.]\n [13000. 42000.  2000.     0.  6000. 35000.]\n [ 7000. 48000.  4000.  6000.     0. 41000.]\n [48000.  7000. 37000. 35000. 41000.     0.]]\n client_id  age  income  orders  dist\n        49   57  118000       6 0.000\n       960   59  122000       6 0.166\n       745   59  109000       6 0.268\n       387   62  112000       6 0.358", "outLabel": "Вывод: три результата подряд", "note": "Для первых шести клиентов показаны две матрицы расстояний. В исходных единицах (вторая матрица) ближе всего клиенты 3 и 4 с доходами 69 000 и 67 000 ₽. После стандартизации (первая матрица) между ними наибольшее расстояние среди этих шести клиентов — 2,80. Один сделал семь заказов, другой — один. При расчёте по скалярным произведениям возможна погрешность округления. clip заменяет малые отрицательные значения квадратов расстояний нулём перед извлечением корня."}, "cosprod": {"title": "По составу покупателей к пледу ближе всего три товара того же бренда", "badge": "проверено: Python 3.13, NumPy 2.5.3, pandas 3.0.5", "lang": "python", "code": "import sqlite3\nimport numpy as np\nimport pandas as pd\nnp.set_printoptions(precision=3, suppress=True)\n\ncon = sqlite3.connect(\"data/shop/shop.sqlite\")\nlong = pd.read_sql(\"\"\"\n    SELECT o.customer_id, p.product_name, SUM(oi.qty) AS qty\n    FROM order_items AS oi\n    JOIN orders   AS o USING (order_id)\n    JOIN products AS p USING (product_id)\n    WHERE o.status = 'paid'\n    GROUP BY o.customer_id, p.product_name\"\"\", con)\n\nM = long.pivot_table(index=\"customer_id\", columns=\"product_name\",\n                     values=\"qty\", fill_value=0)       # клиенты × товары\nP = M.to_numpy(dtype=float)\nprint(P.shape)\n\na = P[:, M.columns.get_loc(\"Плед «Сова»\")]             # столбец: кто сколько купил\nb = P[:, M.columns.get_loc(\"Наволочка «Сова»\")]\nprint(a @ b, np.linalg.norm(a).round(3), np.linalg.norm(b))\nprint(round(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)), 3))\n\nPn = P / np.linalg.norm(P, axis=0)                     # (51, 32) / (32,): столбцы длины 1\nC = Pn.T @ Pn                                          # (32, 32): косинусы всех пар\ni = M.columns.get_loc(\"Плед «Сова»\")\ntop = np.argsort(-C[i])[1:4]                           # [0] — сам плед, cos = 1\nprint(pd.Series(C[i, top], index=M.columns[top]).round(3).to_string())\nprint((C[i] == 0).sum(), \"товаров без единого общего покупателя: cos = 0\")", "out": "(51, 32)\n44.0 9.165 8.0\n0.6\nproduct_name\nСвеча «Сова»        0.767\nЧайник «Сова»       0.706\nНаволочка «Сова»    0.600\n10 товаров без единого общего покупателя: cos = 0", "note": "Из 60 клиентов оплатили хотя бы один заказ 51, поэтому в матрице 51 строка. Для пледа и наволочки a @ b = 44. Клиент, который купил оба товара, вносит в эту сумму произведение двух количеств. Три товара с наибольшим косинусом для пледа принадлежат «Сове». У десяти других товаров с пледом нет общих покупателей, и косинус равен нулю."}, "shape1": {"title": "Одномерный массив (5,) и столбец (5, 1)", "badge": "проверено: Python 3.13, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\nimport pandas as pd\ndf = pd.read_csv(\"data/clients/clients.csv\")\nX = df[[\"age\", \"income\", \"orders\"]].to_numpy()\n\nage = X[:5, 0]                 # один индекс — ось пропадает\nprint(age, age.shape)\nprint(X[:5, [0]].shape, X[:5, 0:1].shape)   # список или срез — ось остаётся\ncol = age.reshape(-1, 1)       # то же, что age[:, None]\nprint(col.shape)\nprint(age.T.shape)             # транспонирование сохраняет форму одномерного массива\nprint(col.T.shape)", "out": "[66 34 48 41 59] (5,)\n(5, 1) (5, 1)\n(5, 1)\n(5,)\n(1, 5)", "note": "После транспонирования одномерный массив сохраняет форму (5,). Чтобы получить из него столбец с пятью строками, используйте reshape(-1, 1) или добавьте ось с помощью [:, None]."}, "bcast": {"title": "Почему получается миллион разностей вместо тысячи", "badge": "проверено: Python 3.13, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\nimport pandas as pd\ndf = pd.read_csv(\"data/clients/clients.csv\")\nX = df[[\"age\", \"income\", \"orders\"]].to_numpy()\n\na = np.array([1, 2, 3])           # (3,)\nb = np.array([[10], [20], [30]])  # (3, 1)\nprint(a + b)                      # элемент каждого вектора складывается с каждым элементом другого\nprint((a + b).shape)\n\nX1 = np.c_[np.ones(len(X)), X[:, 1:]]\nw = np.array([205, 0.0347, 2550])\nspend = df[\"spend\"].to_numpy()          # (1000,)\npred = (X1 @ w).reshape(-1, 1)          # (1000, 1): прогноз случайно стал столбцом\nerr = spend - pred                      # (1000,) − (1000, 1) → (1000, 1000), без ошибки\nprint(err.shape)\nprint(np.abs(err).mean().round())               # среднее абсолютное значение разности по всем парам\nprint(np.abs(spend - pred.ravel()).mean().round())  # средняя абсолютная ошибка по клиентам", "out": "[[11 12 13]\n [21 22 23]\n [31 32 33]]\n(3, 3)\n(1000, 1000)\n7532.0\n3017.0", "note": "Формы совместимы по правилам broadcasting в обоих случаях. При сопоставлении каждой фактической суммы со всеми прогнозами среднее абсолютное значение разностей равно 7 532 ₽. Средняя абсолютная ошибка по парам «факт и прогноз одного клиента» равна 3 017 ₽."}, "dtype": {"title": "Что происходит при записи дробного числа в целочисленный массив и при переполнении", "badge": "проверено: Python 3.13, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\nimport pandas as pd\ndf = pd.read_csv(\"data/clients/clients.csv\")\nX = df[[\"age\", \"income\", \"orders\"]].to_numpy()\nprint(X.dtype)                     # все столбцы целые → int64\n\nX[0, 1] = 80_500.7                 # в целочисленном массиве сохранится только целая часть\nprint(X[0])\n\ntry:\n    X -= X.mean(axis=0)            # результат float64 нельзя записать обратно по правилам этой операции\nexcept TypeError as e:\n    print(type(e).__name__, e)\nXc = X - X.mean(axis=0)            # новый массив: NumPy сам повышает до float64\nprint(Xc.dtype)\n\ninc32 = X[:3, 1].astype(np.int32)  # переводим доходы в 32-битные целые\nprint(inc32 * inc32)               # 80 500² > 2 147 483 647: переполнение без предупреждения\nprint(X[:3, 1] * X[:3, 1])         # в int64 верно\nprint(X[:3, 1] // 1000, X[:3, 1] / 1000)   # // округляет частное вниз, / даёт вещественное частное", "out": "int64\n[   66 80500     2]\nUFuncTypeError Cannot cast ufunc 'subtract' output from dtype('float64') to dtype('int64') with casting rule 'same_kind'\nfloat64\n[-2109684592   625000000   466032704]\n[6480250000  625000000 4761000000]\n[80 25 69] [80.5 25.  69. ]", "note": "UFuncTypeError — подкласс TypeError. Наибольшее значение типа int32 равно 2 147 483 647. Квадрат числа 80 500 равен 6 480 250 000, поэтому при умножении массивов типа int32 произошло переполнение."}};

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-4-1',
    short: 'DA-04',
    title: 'Векторы и матрицы в NumPy',
    where: 'блок «Дата аналитика», тема 04 «Математика для данных», страница 4.1',
    aiData: 'учебная таблица clients.csv — 1000 клиентов интернет-магазина: возраст, доход в месяц (₽), число заказов за квартал, траты; в анимации клиенты 49, 881, 175, 989, в интерактиве клиенты 175 (26 лет, 116 000 ₽) и 15 (64 года, 60 000 ₽); для косинуса товаров — учебная база shop.sqlite, матрица «клиенты × товары» 51 × 32 по оплаченным заказам',
    scene,
    widgets: { two: buildTwo },
    code: CODE,
    questions: {
    q1: { sec: 'two', title: 'Сначала предскажите', q: "Клиенту A 26 лет, его доход — 116 000 ₽. Клиенту B 64 года, его доход — 60 000 ₽. Насколько уменьшится расстояние в исходных единицах, если задать клиенту A возраст 64 года?", opts: [["Ровно на 38, по числу лет разницы"], ["Примерно на треть"], ["Примерно на одну сотую", 1], ["Расстояние увеличится"]],
      why: "До изменения расстояние равно √(38² + 56 000²) ≈ 56 000,013. После разница в возрасте равна нулю, и расстояние составляет 56 000. Оно уменьшилось примерно на 0,013. В квадрат расстояния входили 1 444 от возраста и 3 136 000 000 от дохода." },
    q2: { sec: 'idea', q: "Длины стандартизованных векторов клиентов 49 и 175 равны примерно 1,62 и 1,50, а их скалярное произведение — около 0,005. Что можно сказать об угле между векторами?", opts: [["Угол близок к 0°"], ["Угол близок к 90°", 1], ["Угол не определён"], ["Угол близок к 180°"]],
      why: "Косинус равен скалярному произведению, делённому на произведение длин. Получается около 0,002, что соответствует углу примерно 89,9°. Возраст клиента 175 ниже среднего, а доход выше среднего. У клиента 49 оба показателя выше среднего, поэтому в скалярном произведении вклады возраста и дохода имеют разные знаки и почти компенсируют друг друга." },
    q3: { sec: 'nuances', q: "Почему сумма np.array([1, 2, 3]) и np.array([[10], [20], [30]]) имеет форму (3, 3)?", opts: [["NumPy сначала превращает массивы в списки"], ["При совмещении форм (3,) трактуется как (1, 3). Каждый из трёх элементов столбца складывается со всеми элементами строки", 1], ["NumPy автоматически транспонирует второй массив"], ["При сложении массивов разных форм всегда получается квадратная матрица"]],
      why: "Формы выравниваются по правому краю. Для вычисления NumPy трактует одномерный массив как строку (1, 3), а второй массив уже имеет форму (3, 1). В первой строке результата к числам 1, 2 и 3 прибавляется 10, во второй — 20, в третьей — 30. При сложении (2,) и (3, 1) получилась бы форма (3, 2)." },
    q4: { sec: 'idea', q: "В матрице X по строкам записана тысяча клиентов, по столбцам — пять признаков. У X форма (1000, 5), у вектора весов w — (5,). Какую форму имеет X @ w?", opts: [["(5,)"], ["(1000,)", 1], ["(1000, 5)"], ["(1000, 1)"]],
      why: "Каждая строка содержит пять значений. После умножения на соответствующие веса и сложения получается одно число для каждого клиента. Для одномерного w результат тоже одномерен и имеет форму (1000,). При w формы (5, 1) результат был бы столбцом (1000, 1)." },
    q5: { sec: 'code', q: "У массива S с признаками первых шести клиентов форма (6, 3). Какая форма у массива разностей diff?", code: 'diff = S[:, None, :] - S[None, :, :]', lang: 'python', opts: [["(6, 3)"], ["(6, 6)"], ["(6, 6, 3)", 1], ["(36, 3)"]],
      why: "S[:, None, :] добавляет ось посередине и даёт форму (6, 1, 3). У S[None, :, :] новая ось в начале, форма (1, 6, 3). Результат вычитания содержит для каждой упорядоченной пары клиентов три разности координат: (6, 6, 3). Возведение diff в квадрат и суммирование по последней оси дадут матрицу квадратов расстояний формы (6, 6)." },
    q6: { sec: 'idea', q: "В исходных единицах косинус между векторами любой пары клиентов из таблицы больше 0,99999. Почему?", opts: [["У всех клиентов одинаковые признаки"], ["Значения дохода в рублях намного больше численных значений возраста и числа заказов. Все векторы направлены почти вдоль оси дохода", 1], ["Если координаты положительны, косинус всегда близок к 1"], ["NumPy округляет любой положительный косинус до единицы"]],
      why: "Угол между любой парой векторов в исходных единицах меньше 0,15°. Все векторы близки к оси дохода из-за выбора шкалы. После стандартизации угол между векторами клиентов 49 и 881 составляет около 158°. Положительные координаты сами по себе не гарантируют близости косинуса к единице." },
    q7: { sec: 'nuances', q: "Что напечатает этот код?", code: 'a = np.array([57, 118000, 6])\na[1] = 118500.7\nprint(a)', lang: 'python', opts: [["Массив вещественных чисел со значением 118500.7"], ["Целые числа 57, 118500 и 6", 1], ["Целые числа 57, 118501 и 6"], ["Сообщение об ошибке при записи дробного числа"]],
      why: "Тип массива определяется при создании. При записи 118500.7 в элемент целочисленного массива NumPy отбрасывает дробную часть, поэтому в массиве остаётся 118500. Чтобы сохранить дробное значение, можно предварительно преобразовать массив с помощью a.astype(float)." }
    },
    glossary: {
      vector: { t: 'Вектор', en: 'vector', d: "В этом уроке вектор задаётся упорядоченным набором чисел — координатами. Его можно изобразить стрелкой из начала координат." },
      matrix: { t: 'Матрица', en: 'matrix', d: "Прямоугольная таблица чисел. В нашей матрице каждая строка описывает клиента, а столбец — один признак." },
      dot: { t: 'Скалярное произведение', en: 'dot product', d: "Сумма попарных произведений соответствующих координат. Для ненулевых векторов равна произведению их длин на косинус угла между ними." },
      feature: { t: 'Признак', en: 'feature', d: 'Столбец таблицы, одно свойство объекта, например возраст.' },
      coord: { t: 'Координата', en: 'coordinate, component', d: "Число, которое задаёт положение точки по одной оси. Для клиента это значение одного признака." },
      norm: { t: 'Длина вектора, норма', en: 'norm, Euclidean norm', d: "Евклидова норма равна корню из суммы квадратов координат вектора." },
      dist: { t: 'Евклидово расстояние', en: 'Euclidean distance', d: 'Длина разности двух векторов.' },
      orth: { t: 'Перпендикулярные векторы', en: 'orthogonal vectors', d: "Два ненулевых вектора перпендикулярны, когда угол между ними равен 90°, а скалярное произведение равно нулю." },
      cos: { t: 'Косинусная близость', en: 'cosine similarity', d: "Косинус угла между двумя ненулевыми векторами. Принимает значения от −1 до 1 и зависит только от направлений векторов." },
      matmul: { t: 'Матричное умножение @', en: 'matrix multiplication, matmul', d: "Произведение X @ w даёт для каждой строки матрицы X её скалярное произведение с вектором w." },
      ndarray: { t: 'ndarray', en: 'N-dimensional array', d: "Многомерный массив NumPy. Все его элементы имеют один тип." },
      shape: { t: 'Форма массива', en: 'shape', d: "Кортеж размеров массива по каждой оси. У таблицы из тысячи строк и трёх столбцов форма (1000, 3)." },
      dtype: { t: 'dtype', en: 'data type', d: "Тип, общий для всех элементов массива, например int64 или float64." },
      axis: { t: 'Ось массива', en: 'axis', d: "Одно из измерений массива. В двумерной таблице axis=0 указывает на ось строк, а axis=1 — на ось столбцов." },
      slice: { t: 'Срез', en: 'slicing', d: "Выбор элементов с помощью диапазона индексов. Например, X[:3, 1] возвращает первые три значения второго столбца." },
      vectorize: { t: 'Векторизация', en: 'vectorization', d: 'Операция над целым массивом вместо цикла Python.' },
      bcast: { t: 'Broadcasting', en: 'broadcasting', d: "Правила совмещения форм массивов при операциях. Размеры осей сравнивают справа налево, а ось размера 1 можно расширить до нужного размера." },
      std: { t: 'Стандартизация', en: 'standardization, z-score', d: "Вычитание среднего значения признака и деление разности на его стандартное отклонение. Применяется к признакам с ненулевым стандартным отклонением." },
      sigma: { t: 'Стандартное отклонение', en: 'standard deviation', d: "Мера разброса значений. В этом уроке σ — корень из среднего квадрата отклонений от среднего значения." },
      overflow: { t: 'Переполнение', en: 'integer overflow', d: "Ситуация, когда результат вычисления выходит за диапазон значений типа. Для целочисленных массивов NumPy результат умножения при этом может даже сменить знак." },
      curse: { t: 'Проклятие размерности', en: 'curse of dimensionality', d: "Трудности работы с данными, у которых много признаков. Например, чтобы покрыть пространство с прежней плотностью, требуется всё больше наблюдений. В некоторых наборах расстояния до ближайших и далёких точек различаются всё слабее относительно их величины." }
    },
    materials: [
      ['da-4-1-vectors-numpy.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/clients/', '1 000 учебных клиентов — общий набор темы 04'],
      ['data/shop/', 'Учебная база магазина — общий набор темы 03'],
      ['vectors_numpy.ipynb', 'Код страницы и упражнения на формы массивов'],
      ['vectors_numpy_solutions.ipynb', 'Решения упражнений'],
      ['curse.py', 'Расчёт расстояний и косинусов для таблицы в разделе «Ограничения»']
    ],
    prompts: [
      ['Тренажёр по формам', 'Предложи пять примеров операций NumPy с массивами разных форм. Давай их по одному. После каждого я назову форму результата или объясню, почему возникнет ошибка. Проверь мой ответ.'],
      ['Сравнить двух клиентов', 'Выбери двух клиентов из учебной таблицы и приведи их признаки. Я вычислю расстояние, скалярное произведение и косинус до и после стандартизации. Проверь ход расчёта.'],
      ['Проверка моего кода', 'Я пришлю код на NumPy. Проверь формы массивов и типы элементов. Если расчёт может дать неожиданный результат, помоги мне найти причину с помощью вопросов.']
    ]
  };
})();
