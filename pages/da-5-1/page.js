/* Страница 5.1 · Вероятность, условная вероятность, Байес */
(() => {
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ===================== Учебные данные =====================
     data/probability/visits.csv: 100 000 учебных визитов. Тысяча точек — пропорциональная выборка:
     из каждой клетки «источник × покупка» столько визитов, сколько приходится на тысячу (seed 505).
     Раскладка — pages/da-5-1/data/scene_points.py: прямоугольник 4 : 3, круги с площадями по числу точек.
     На точку 7 знаков: x и y в тысячных долях высоты. Порядок: 12 «оба», 22 «только купил», 287 «только реклама», 679 остальных. */
  const RAW = '0868421088050508575630846465089947108875350846517087444908905600830504090044608425471001571099344209155950939401094051209905090951471104150010024771028458096156709284500947597101653409785990964532093142309885380963442092953109284870978464031574107356220377431061935403652460594708043359602563440273537053223504547780541510076128507084400853615080652705468290424355026843405163210452480071652106682790610838062320207657230576630053940603476230525720035252906264430677709043726407853750394687066648605095790580263067835004721970608537032530407936620695796086235104746710272652072857206946040702207063676105601680479735063230906636480481526046439805677650488811040354007994450246596076748903264000782576064158508197270410194026548905174660320453058422303123520514770059047904423090747370072274906755270686402037235308183250402635022954403415730381594046961807342440575418060166402935930814266042380506246270640802053267005533430329254071529303016880376725049442904237380415411065041503134950370307065024707257000312634047433307473260308527022644608295960358666050839108204110541274029730404485560367766057458205096420247396060129205435910756650069849203765130836669076953805585450407241044564303634790578821048624104124780449511058915806747420605737058637806221660666316045343406485490804684049735407477480509533066045406915560423226073145805082680675187067822807762440404769044517803722160628711070664507062610371382056672705356440459701060740607614300464265042366902923870514177048570808082960673817060958404024410626499024945907673980408290054644903857930871384066137507823080587794085432107173330602815051982006945760758779056629807827510347274084136303795440277620065421808806260480302052520805764540308563033466006414740737212045736207237850782619054079307404030633827068377103277080400509045622906212480460818034933105476960699725063273603975650578514063239802685140823436065168908206280631273040233903303730385480043162206805020384404034450205397570714411079670707615660265573077834302275100553370082869703246010708677029046805174360451744047855306516180437709050368402495230591607053061503355510226572041638507082400795554057468706115610748513034274807123720697751024962407496750861645083630004027110425575051449204927610332473040826503493890506055131475400452691098284081403010127690779973129810212484550201148011498604339220022569105302008602101107933005104301437430925912059497411510911301974023088400138620383031024804111445230122382113567312122180687097007214812198330597026094733811424010142593110583110311440420140069285909087941312649131234401644810302974111217800798580027694094701812705410797844034283610776080682981004746607641801217747112375112958490200656028818509602141003875132201201452850491976131017111799120888984107852401036660051939120832309966780169824032001812456170826117091869304520890017756023777310059820225957094612811629820044383100425808117830051643123503801422130149041116859908758491306243015853803511670173919013014202552750026208105921010940811297397131146605639110084736107945907659000913265123014107440290839920125293006081070182429088309500920840323906075109700843211115019088102303130851130248100634810746940387962045186511870370937298011280001740910653030086825611738070130880120665900223271224393102292700290911030609113856506571451052887087516112422840166692023410411118771080347068192404349880304139104041511373240214241118112602412000882733064610609539720092511117136213215160087602035811605409600091415021537011628621299578095763210866421214092128430709648050528876100418500989330373878047902009338471165176121797811414690485921105792700428031077976122650501722610543090103708700802520902639054102001553700436044062391409710700281869125935307050471046316101638705810830015614020002709727501060789020873309971140734150073184206270630717941126420012860410260915063898100319781083141124169801619870182771051113213220630873804046013600284310193200081218008440551264875117429601331051191531116976100720111154017034097602651471115442011447310436450167871127777412777300915063011218111914360372080007582010232220214840120278605958760769130106425907129881128361090532608229861302895092016401995760883900004360702446961119137093773312941380406886127149910525660643871126881811112160998832011743312108911009034026681411398290022151029224612644070977918084077013229310078468008298611927061222184013993812355730116700003951407951070908208126264508168720172324017161509677760722118008020102113260839829129827310934830774061117324011297231026708013132905229280134066130180001641740113566041384909797161250241030821312358050304804025774908019480757818020527900547690380841116694904041051027740126501609031201015298098235401556620661901107438003951650295054003689900174860052718131661800150260298842126497901823590273103113161012490811206249010328200581130878702011475704699450012270119148501296530405068105517806620681144786108086301849530959669033086911211010205401051309608422351174067004934609110210745983077887103367990138251057004011379321291689030777100877031208617104268409873230261973117155809958070731901111898203881281124057014578711023970080357127960312406630907828108357202060810190497072804707870851089726094508510550630314950023530412849310121533033820713178730645945019861409067190838156104528510877720044867018745701119091058735018654805671320354021010903912224420967884097815100718870930946118838813177110826956078301600665501201157014085108799350279215111869100395381126288095224407789260916367018105501611290061494085908200208210277780001365702037020109832059391602292680403927061213504761110906931098022708852850482074065392405669851156641107281609762810921879091075810488160802212023180508900560850881032516013042211188972110752809008720369186111056411572110253839124155010789000040302115014204629100439953026424010503481250764015741411083160091221094605901092530200989078981010901110147158014244309103000060084085197110369691066298099337306988890747940035291801358310100139050189008571341227906015071912229381276433121141807688390698144104537808467391053107056206505349040201927109567111947310789892041391013125511154727033688902331480613043121635809770411003912097294701978991221719099374213074241178098061394310338750938197092166308031480987632122147212427370148908031411709698510147813007539411975820139690128936613201191086188088376601725900575946100894402409780346064101364303041671187643088018811634320032773008104804660450946925005416912811730734072117051302236771320492125513304351111050757124252612752330850015116033612814690672124122129709511810014934102411800260591138118090396106160120150963011330510942391093592008164011036120797064017151511674670012791028395410897991241329127206708298100697024104994710020830053212127789408258991317034124395513161981180618092498800321111211067109442311716661001157122959400431350521986094515112210160022394055987913108320106884080691902919110847797023091400606920344087018830509181860886671082809607771641114501063413103779300090962100371910841660199796036197500534350876232048286310810201252788';
  const NP = 1000, PX = new Float64Array(NP), PY = new Float64Array(NP), CAT = new Uint8Array(NP);
  const CUT = [12, 34, 321, 1000];                       // границы групп в RAW: 0 — оба, 1 — только купил, 2 — только реклама, 3 — остальные
  for (let i = 0; i < NP; i++) { PX[i] = +RAW.substr(i * 7, 4) / 1000; PY[i] = +RAW.substr(i * 7 + 4, 3) / 1000; CAT[i] = CUT.findIndex(c => i < c); }
  const AX = 4 / 3, CELL = AX / NP;                      // площадь на одну точку
  const RB = Math.sqrt(299 * CELL / Math.PI), RA = Math.sqrt(34 * CELL / Math.PI);
  const CB = { x: .56, y: .5 }, CA = { x: .56 + .3779373692033068, y: .5 };   // расстояние между центрами подобрано так, чтобы в пересечении было 12 точек

  /*calc:start*/
  // Сколько точек внутри кругов A и B: точка внутри, если расстояние до центра меньше радиуса
  function countIn(X, Y, n, A, B) {
    let nA = 0, nB = 0, nAB = 0;
    for (let i = 0; i < n; i++) {
      const a = (X[i] - A.x) ** 2 + (Y[i] - A.y) ** 2 < A.r * A.r, b = (X[i] - B.x) ** 2 + (Y[i] - B.y) ** 2 < B.r * B.r;
      if (a) nA++; if (b) nB++; if (a && b) nAB++;
    }
    return { n, nA, nB, nAB };
  }
  // Доли из счётчиков: P(A | B) = |A ∩ B| / |B|, P(B | A) = |A ∩ B| / |A|; при независимости в пересечении было бы |A| · |B| / n
  function condStats(c) {
    const aB = c.nB ? c.nAB / c.nB : null, bA = c.nA ? c.nAB / c.nA : null;
    return { pA: c.nA / c.n, pB: c.nB / c.n, pAB: c.nAB / c.n, pUnion: (c.nA + c.nB - c.nAB) / c.n, aGivenB: aB, bGivenA: bA,
      ratio: aB && bA ? Math.max(aB, bA) / Math.min(aB, bA) : null, expAB: c.nA * c.nB / c.n };
  }
  // Антифрод на натуральных частотах: 10 000 транзакций, фрод 1%; правило ловит m из 100 и ложно срабатывает на k из 9 900
  function fraudStats(m, k) {
    const N = 10000, F = 100, H = N - F, alarms = m + k;
    return { N, F, H, tp: m, fn: F - m, fp: k, tn: H - k, alarms, ppv: alarms ? m / alarms : null, sens: m / F, spec: (H - k) / H };
  }
  /*calc:end*/

  // Площадь пересечения двух кругов и расстояние между центрами, при котором она равна target
  function lens(d, r1, r2) {
    if (d >= r1 + r2) return 0;
    if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
    const a1 = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1)), a2 = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
    return a1 + a2 - .5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
  }
  function solveD(r1, r2, target) {
    let lo = Math.abs(r1 - r2), hi = r1 + r2;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (lens(m, r1, r2) > target) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  // Детерминированный генератор (mulberry32): одинаковое зерно — одинаковые точки
  function rnd(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // Мир антифрода: 10 000 точек на сетке 115 × 87 с дрожанием, пять лишних клеток убраны; фрод — 100 точек, ближайших к центру FC
  let FW = null;
  const FC = { x: .58, y: .5 }, FN = 10000, FCELL = AX / FN;
  function fraudWorld() {
    if (FW) return FW;
    const r = rnd(505), cols = 115, rows = 87, all = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) all.push([(i + .5 + (r() - .5) * .7) * AX / cols, (j + .5 + (r() - .5) * .7) / rows]);
    for (let q = 0; q < 5; q++) all.splice(Math.floor(r() * all.length), 1);
    const X = new Float64Array(FN), Y = new Float64Array(FN);
    all.forEach((p, i) => { X[i] = p[0]; Y[i] = p[1]; });
    const byF = [...X.keys()].sort((a, b) => ((X[a] - FC.x) ** 2 + (Y[a] - FC.y) ** 2) - ((X[b] - FC.x) ** 2 + (Y[b] - FC.y) ** 2));
    const isF = new Uint8Array(FN); byF.slice(0, 100).forEach(i => { isF[i] = 1; });
    FW = { X, Y, isF, fIdx: byF.slice(0, 100), hIdx: byF.slice(100) };
    return FW;
  }
  // Круг сработок: площадь по числу сработок, перекрытие с кругом фрода — по числу пойманных; точки раздаются по близости к центру
  function fraudLayout(m, k) {
    const w = fraudWorld(), rF = Math.sqrt(100 * FCELL / Math.PI), rS = Math.sqrt((m + k) * FCELL / Math.PI);
    const d = m + k ? solveD(rF, rS, m * FCELL) : rF, S = { x: FC.x + d, y: FC.y, r: rS };
    const dS = i => (w.X[i] - S.x) ** 2 + (w.Y[i] - S.y) ** 2, inB = new Uint8Array(FN);
    w.fIdx.slice().sort((a, b) => dS(a) - dS(b)).slice(0, m).forEach(i => { inB[i] = 1; });
    w.hIdx.slice().sort((a, b) => dS(a) - dS(b)).slice(0, k).forEach(i => { inB[i] = 1; });
    return { X: w.X, Y: w.Y, n: FN, inA: w.isF, inB, A: { x: FC.x, y: FC.y, r: rF }, B: S };
  }

  const fp = (v, d = 1) => v == null ? '—' : `${TBf(v * 100, d)}%`;
  const TBf = (v, d) => Number(v).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ===================== Сцена: камера на круге ===================== */
  const COL = { g: '#4a5368', amb: '#e3c04d', teal: '#36b8a6', pink: '#f06ba5' };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], t))).join(',')})`; };
  // Конец каждого шага: камера, цвет и прозрачность групп [остальные, только реклама, только купил, оба], круги [реклама, купил]
  const G = COL.g, AM = COL.amb, TE = COL.teal, PI = COL.pink;
  const ST = [
    { cam: 'all', f: [G, G, G, G], o: [1, 1, 1, 1], c: [0, 0] },
    { cam: 'all', f: [G, AM, G, AM], o: [1, 1, 1, 1], c: [1, 0] },
    { cam: 'all', f: [G, AM, TE, TE], o: [1, 1, 1, 1], c: [1, 1] },
    { cam: 'all', f: [G, AM, TE, PI], o: [1, 1, 1, 1], c: [1, 1] },
    { cam: 'B', f: [G, AM, TE, PI], o: [.1, 1, .1, 1], c: [1, .3] },
    { cam: 'B', f: [G, AM, TE, PI], o: [.1, .42, .1, 1], c: [1, .3] },
    { cam: 'A', f: [G, AM, TE, PI], o: [.1, .1, 1, 1], c: [.3, 1] },
    { cam: 'A', f: [G, AM, TE, PI], o: [.1, .1, .42, 1], c: [.3, 1] },
    { cam: 'all', f: [G, AM, TE, PI], o: [1, 1, 1, 1], c: [1, 1] },
    { cam: 'all', f: [G, AM, TE, PI], o: [.4, .75, 1, 1], c: [1, 1] }
  ];
  // Выноски: [к кругу «реклама», к кругу «купил», к пересечению или прямоугольнику]; точка привязки в мировых координатах
  const LX = (CB.x + RB + CA.x - RA) / 2;                // середина пересечения по горизонтали
  const CALL = [
    [null, null, ['Всего 1 000 визитов', AX / 2, 0, 'c', 'above']],
    [['реклама: 299 из 1 000', CB.x - RB * .72, CB.y - RB * .72, 'r', 'above'], null, null],
    [['реклама: 299', CB.x - RB * .72, CB.y - RB * .72, 'r', 'above'], ['с покупкой: 34 из 1 000', CA.x + RA * .7, CA.y - RA * .7, 'l', 'above'], null],
    [['∪ хотя бы одно: 299 + 34 − 12 = 321', CB.x, CB.y + RB, 'c', 'below'], null, ['∩ оба: 12', LX, CB.y - RA, 'c', 'above']],
    [['299 рекламных визитов', CB.x, CB.y - RB, 'c', 'above'], null, null],
    [['знаменатель: 299', CB.x, CB.y - RB, 'c', 'above'], null, ['12 / 299 ≈ 4,0%', LX, CB.y + RA * .9, 'c', 'below']],
    [null, ['34 визита с покупкой', CA.x, CA.y - RA, 'c', 'above'], null],
    [null, ['знаменатель: 34', CA.x, CA.y - RA, 'c', 'above'], ['из рекламы: 12 / 34 ≈ 35%', LX, CA.y + RA * .95, 'c', 'below']],
    [['P(купил | реклама) ≈ 4,0%', CB.x - RB * .2, CB.y + RB, 'c', 'below'], ['P(реклама | купил) ≈ 35%', CA.x + RA * .4, CA.y - RA, 'l', 'above'], null],
    [['из рекламы: 12 / 299 ≈ 4,0%', CB.x - RB * .2, CB.y + RB, 'c', 'below'], ['при независимости ожидается ≈ 10', CA.x + RA * .4, CA.y - RA, 'l', 'above'], ['без условия: 34 / 1 000 = 3,4%', AX / 2, 0, 'c', 'above']]
  ];

  const scene = {
    parts: [{ n: '01', name: 'Доля', s: [0, 1] }, { n: '02', name: 'Два события', s: [2, 3] }, { n: '03', name: 'Условие', s: [4, 5] }, { n: '04', name: 'Байес', s: [6, 7] }, { n: '05', name: 'Сравнение', s: [8, 9] }],
    steps: [
      { title: 'Тысяча визитов', dur: 3400, body: '<p>Каждая точка обозначает один визит в&nbsp;учебный магазин. Всего на&nbsp;рисунке 1&nbsp;000 точек.</p><p>Если выбрать одну точку наугад, вероятность события равна доле точек, у которых есть нужный нам признак.</p>' },
      { title: '299 визитов из рекламы', dur: 3800, body: '<p>Жёлтый круг охватывает 299 визитов, начавшихся с&nbsp;перехода по&nbsp;рекламе.</p><p><b>P(реклама) = 299 / 1&nbsp;000 = 0,299.</b> В&nbsp;этой выборке на&nbsp;рекламу приходится около 30% визитов.</p>' },
      { title: '34 визита с покупкой', dur: 3600, body: '<p>Зелёный круг охватывает 34 визита, которые закончились покупкой. <b>P(купил) = 34 / 1&nbsp;000 = 0,034.</b></p><p>Некоторые точки попали в&nbsp;оба круга. Это визиты, которые начались с&nbsp;рекламы и&nbsp;закончились покупкой.</p>' },
      { title: 'Пересечение и объединение', dur: 4200, body: '<p>В&nbsp;пересечении кругов 12 точек. <b>P(реклама ∩ купил) = 12 / 1&nbsp;000 = 0,012.</b></p><p>Сколько визитов попало хотя бы в&nbsp;один круг? Складываем 299 и&nbsp;34, затем вычитаем 12 общих точек. Получаем 321 визит.</p>' },
      { title: 'Выбираем рекламные визиты', dur: 4000, body: '<p>Какая доля рекламных визитов закончилась покупкой? Для ответа оставим только точки в&nbsp;жёлтом круге.</p><p>Теперь в&nbsp;знаменателе 299 рекламных визитов. Ещё 701 визит пришёл из&nbsp;других источников.</p>' },
      { title: 'Конверсия рекламы', dur: 3600, body: '<p>Из&nbsp;299 рекламных визитов покупкой закончились 12. Получаем <b>P(купил | реклама) = 12 / 299 ≈ 4,0%.</b></p><p>Вертикальная черта читается «при условии». Справа от&nbsp;неё стоит условие отбора визитов.</p>' },
      { title: 'Выбираем визиты с покупкой', dur: 4200, body: '<p>Теперь узнаем, какая доля визитов с&nbsp;покупкой началась с&nbsp;рекламы. Для этого выберем зелёный круг.</p><p>В&nbsp;знаменателе все 34 визита с&nbsp;покупкой. Среди них есть визиты из&nbsp;каждого источника.</p>' },
      { title: 'Доля рекламы среди визитов с покупкой', dur: 3600, body: '<p>Из&nbsp;34 визитов с&nbsp;покупкой 12 пришли из&nbsp;рекламы. Получаем <b>P(реклама | купил) = 12 / 34 ≈ 35%.</b></p><p>В&nbsp;числителе по-прежнему 12 точек пересечения. Знаменатель уменьшился с&nbsp;299 до&nbsp;34, поэтому доля стала больше.</p>' },
      { title: 'Как связаны две вероятности', dur: 4400, body: '<p>В&nbsp;рекламном круге примерно в&nbsp;8,8 раза больше точек, чем в&nbsp;круге покупок (299 / 34). Поэтому 12 / 34 во столько же раз больше, чем 12 / 299.</p><p>Эту связь даёт теорема Байеса. <b>P(реклама | купил) = P(купил | реклама) · P(реклама) / P(купил).</b></p>' },
      { title: 'Сколько покупок ожидать при независимости', dur: 4400, next: 'Читать страницу', body: '<p>Покупкой закончились 3,4% всех визитов и&nbsp;около 4,0% визитов из&nbsp;рекламы.</p><p>При независимости событий ожидаемое число точек в&nbsp;пересечении равно 299 · 34 / 1&nbsp;000 ≈ 10. На&nbsp;рисунке таких точек 12. Как оценить расхождение по&nbsp;полной таблице визитов, разберём в&nbsp;тексте урока.</p>' }
    ],
    hud: [{ id: 'all', label: 'Знаменатель' }, { id: 'in', label: 'Из них' }, { id: 'share', label: 'Доля' }],
    legend: `<span><i style="background:${COL.amb}"></i>реклама</span><span><i style="background:${COL.teal}"></i>покупка</span><span><i style="background:${COL.pink}"></i>оба события</span><span><i style="background:${COL.g}"></i>остальные</span>`,
    info: 'УСЛОВНАЯ ВЕРОЯТНОСТЬ',
    aiNote: 'В анимации показана выборка из 1 000 визитов. Её состав по источнику и наличию покупки примерно совпадает с составом полных данных (100 000 визитов, visits.csv). В выборке 299 рекламных визитов и 34 визита с покупкой. Из них 12 сочетают оба признака. Вероятность покупки среди рекламных визитов равна 12 / 299 ≈ 4,0%, вероятность рекламного источника среди визитов с покупкой — 12 / 34 ≈ 35%. При независимости ожидается около 10 рекламных визитов с покупкой. Для всей таблицы две условные вероятности равны 1 172 / 29 848 ≈ 3,93% и 1 172 / 3 376 ≈ 34,7%.',
    mount(root, api) {
      const grp = [3, 2, 1, 0].map(c => `<g data-c="${c}">${[...Array(NP).keys()].filter(i => CAT[i] === c).map(i => `<circle cx="${Math.round(PX[i] * 1000)}" cy="${Math.round(PY[i] * 1000)}" r="10.5"/>`).join('')}</g>`).join('');
      root.innerHTML = `<div class="d51"><svg class="d51-svg" aria-hidden="true"><g class="d51-cam"><rect class="d51-rect" x="0" y="0" width="${Math.round(AX * 1000)}" height="1000" rx="8" vector-effect="non-scaling-stroke"/>${grp}</g><circle class="d51-ring d51-rB"/><circle class="d51-ring d51-rA"/></svg><div class="d51-call d51-cB"></div><div class="d51-call d51-cA"></div><div class="d51-call d51-cX"></div></div>`;
      const box = root.firstChild, svg = box.firstChild, cam = svg.firstChild;
      const G4 = [...cam.querySelectorAll('g[data-c]')].reverse();    // по индексу группы: 0 — оба … 3 — остальные
      const groupAB = G4[0].children;
      const rings = [svg.querySelector('.d51-rB'), svg.querySelector('.d51-rA')];
      const calls = [...box.querySelectorAll('.d51-call')];
      calls.forEach(el => { el._c = {}; });
      let W = 0, H = 0, sig = '';
      const fit = () => { W = box.clientWidth; H = box.clientHeight; if (W && H) svg.setAttribute('viewBox', `0 0 ${W} ${H}`); sig = ''; };
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box);
      fit();
      const s0 = () => Math.min(W / AX, H) * .95;
      const camOf = n => {
        if (n === 'all') return { x: AX / 2, y: .5, z: 1 };
        const c = n === 'B' ? CB : CA, r = n === 'B' ? RB : RA;
        // на круге «реклама» камера чуть смещена к пересечению, чтобы оно не уходило за край
        return { x: c.x + (n === 'B' ? r * .15 : 0), y: c.y, z: Math.max(1, .42 * Math.min(W, H) / (r * s0())) };
      };
      // группы в порядке ST: [остальные, только реклама, только купил, оба] → индексы CAT 3, 2, 1, 0
      const GI = [3, 2, 1, 0];
      function place(el, txt, x, y, al, side, op) {
        const c = el._c;
        if (c.txt !== txt) { el.textContent = txt || ''; c.txt = txt; c.w = el.offsetWidth; c.h = el.offsetHeight; }
        const w = c.w || 0, h = c.h || 0;
        let lx = al === 'c' ? x - w / 2 : al === 'r' ? x - w : x, ly = side === 'above' ? y - h - 8 : y + 8;
        lx = Math.max(4, Math.min(W - w - 4, lx)); ly = Math.max(4, Math.min(H - h - 4, ly));
        const t = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
        if (c.t !== t) { el.style.transform = t; c.t = t; }
        const o = op <= .001 ? '0' : op >= .999 ? '1' : op.toFixed(3);
        if (c.o !== o) { el.style.opacity = o; el.style.visibility = o === '0' ? 'hidden' : 'visible'; c.o = o; }
      }
      function hudFor(k, p, t) {
        const f = v => api.fmt(v);
        if (k === 0) { api.hud('all', f(Math.round(1000 * ease(seg(p, 0, .55)))), ''); api.hud('in', '—', ''); api.hud('share', '—', ''); }
        else if (k <= 3) {
          const on = k === 3 ? p > .15 : p > .45, v = [null, ['299', 'реклама', '29,9%'], ['34', 'с покупкой', '3,4%'], ['12', 'оба события', '1,2%']][k], pv = [null, null, ['299', 'реклама', '29,9%'], ['34', 'с покупкой', '3,4%']][k];
          const u = on ? v : pv;
          api.hud('all', '1\u00a0000', ''); api.hud('in', u ? u[0] : '—', u ? u[1] : ''); api.hud('share', u ? u[2] : '—', '');
        } else if (k === 4 || k === 6) {
          api.hud('all', f(Math.round(k === 4 ? lerp(1000, 299, t) : lerp(299, 34, t))), k === 4 ? 'из рекламы' : 'с покупкой'); api.hud('in', '—', ''); api.hud('share', '—', '');
        } else if (k === 5 || k === 7) {
          const on = p > .3;
          api.hud('all', k === 5 ? '299' : '34', k === 5 ? 'из рекламы' : 'с покупкой'); api.hud('in', on ? '12' : '—', on ? (k === 5 ? 'с покупкой' : 'из рекламы') : ''); api.hud('share', on ? (k === 5 ? '4,0%' : '35,3%') : '—', '');
        } else if (k === 8) { api.hud('all', '299\u00a0и\u00a034', ''); api.hud('in', '12', 'в обоих кругах'); api.hud('share', '×\u00a08,8', 'отношение'); }
        else { api.hud('all', '1\u00a0000', ''); api.hud('in', '34', 'с покупкой'); api.hud('share', '3,4%', '≠\u00a04,0%'); }
      }
      return {
        render(k, p) {
          const prev = ST[Math.max(0, k - 1)], cur = ST[k];
          const t = k === 0 ? 1 : ease(seg(p, 0, .6));
          hudFor(k, p, t);
          const key = `${k}|${Math.round(p * 700)}|${W}|${H}`;
          if (key === sig || !W || !H) return; sig = key;
          // камера: перелёт с круга на круг чуть отъезжает назад
          const a = camOf(prev.cam), b = camOf(cur.cam);
          let z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), t));
          if (prev.cam !== cur.cam && prev.cam !== 'all' && cur.cam !== 'all') z *= 1 - .45 * Math.sin(Math.PI * t);
          const cx = lerp(a.x, b.x, t), cy = lerp(a.y, b.y, t), S = s0() * z, tx = W / 2 - cx * S, ty = H / 2 - cy * S;
          cam.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${(S / 1000).toFixed(5)})`);
          // цвет групп: на шагах 1–3 краска ложится после обводки
          const tc = k === 0 ? 1 : k <= 2 ? seg(p, .45, .75) : k === 3 ? seg(p, .1, .4) : t;
          const fin = k === 0 ? ease(seg(p, 0, .55)) : 1;
          for (let g = 0; g < 4; g++) {
            const el = G4[GI[g]];
            el.setAttribute('fill', mix(prev.f[g], cur.f[g], tc));
            el.setAttribute('opacity', (lerp(prev.o[g], cur.o[g], t) * fin).toFixed(3));
          }
          // пульс пересечения на шаге 3
          const pr = k === 3 ? (10.5 * (1 + .55 * Math.sin(Math.PI * seg(p, .12, .5)))).toFixed(2) : '10.5';
          if (groupAB._r !== pr) { for (const c of groupAB) c.setAttribute('r', pr); groupAB._r = pr; }
          // обводки кругов в экранных координатах: на шагах 1 и 2 круг рисуется
          [[CB, RB, 0], [CA, RA, 1]].forEach(([c, r, j]) => {
            const el = rings[j], R = r * S, L = 2 * Math.PI * R;
            const drawn = k < j + 1 ? 0 : k === j + 1 ? ease(seg(p, .05, .5)) : 1;
            el.setAttribute('cx', (tx + c.x * S).toFixed(1)); el.setAttribute('cy', (ty + c.y * S).toFixed(1)); el.setAttribute('r', R.toFixed(1));
            el.setAttribute('stroke-dasharray', `${(drawn * L).toFixed(1)} ${L.toFixed(1)}`);
            el.setAttribute('opacity', (k === j + 1 ? 1 : lerp(prev.c[j], cur.c[j], t)).toFixed(3));
          });
          // выноски
          const C = CALL[k], P = CALL[Math.max(0, k - 1)];
          const tIn = k === 1 || k === 2 ? seg(p, .5, .7) : seg(p, .45, .65);
          calls.forEach((el, j) => {
            const c = C[j], pc = P[j];
            if (c) {
              const same = pc && pc[0] === c[0], op = same ? 1 : tIn;
              place(el, c[0], tx + c[1] * S, ty + c[2] * S, c[3], c[4], op);
            } else if (pc && k > 0) place(el, pc[0], tx + pc[1] * S, ty + pc[2] * S, pc[3], pc[4], 1 - seg(p, 0, .2));
            else place(el, el._c.txt || '', 0, 0, 'l', 'below', 0);
          });
        }
      };
    }
  };

  /* ===================== Интерактив «Камера на круге» ===================== */
  const NAMES = { v: { A: 'купил', B: 'реклама', all: 'все визиты' }, f: { A: 'фрод', B: 'сигнал', all: 'все транзакции' } };
  const TASKS = [
    { t: 'Добейтесь, чтобы обе условные вероятности были положительными, а отношение большей к меньшей не превышало 1,05.', ok: (S) => S.ratio != null && S.ratio <= 1.05 },
    { t: 'Сделайте события несовместными: P(купил | реклама) = 0.', ok: (S, c) => c.nA > 0 && c.nB > 0 && c.nAB === 0 },
    { t: 'Оставьте в пересечении хотя бы одну точку. Добейтесь, чтобы P(купил | реклама) отличалась от P(купил) меньше чем на 0,3 п. п.', ok: (S, c) => c.nAB > 0 && c.nA > 0 && S.aGivenB != null && Math.abs(S.aGivenB - S.pA) < .003 }
  ];

  function buildCam(box, api) {
    const { esc, fmt, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Пересечение одно, знаменатели разные <i>интерактив</i></span><div class="ctrls"><span class="seg" role="group" aria-label="Режим" id="cc-mode"><button type="button" data-m="v">Визиты</button><button type="button" data-m="f">Антифрод</button></span><button type="button" class="btn ghost small" id="cc-reset">Сбросить</button></div></div>
<p class="hint cc-do" id="cc-do"></p>
<div class="cc-bar"><span class="cc-lb">условие</span><span class="seg" role="group" aria-label="Условие: на какой круг навести камеру" id="cc-cond"><button type="button" data-c="none"></button><button type="button" data-c="B"></button><button type="button" data-c="A"></button></span></div>
<div class="stage"><div class="cc-main"><div class="cc-plot" id="cc-plot"><canvas id="cc-cv" role="img"></canvas>${['A', 'B'].map(k => `<button type="button" class="cc-h cc-h${k}" id="cc-h${k}"></button>`).join('')}</div>
<div class="cc-pad" id="cc-padv"><span class="cc-lb">круг</span><span class="seg" role="group" aria-label="Какой круг двигать кнопками" id="cc-who"><button type="button" data-k="A">купил</button><button type="button" data-k="B">реклама</button></span><span class="cc-mv"><button type="button" class="btn ghost small" data-mv="-1,0" aria-label="Сдвинуть круг влево">←</button><button type="button" class="btn ghost small" data-mv="1,0" aria-label="Сдвинуть круг вправо">→</button><button type="button" class="btn ghost small" data-mv="0,-1" aria-label="Сдвинуть круг вверх">↑</button><button type="button" class="btn ghost small" data-mv="0,1" aria-label="Сдвинуть круг вниз">↓</button><button type="button" class="btn ghost small" data-sz="1">шире</button><button type="button" class="btn ghost small" data-sz="-1">уже</button></span></div>
<div class="cc-pad" id="cc-padf" hidden><label class="cc-rg"><span>обнаружено мошеннических</span><input type="range" id="cc-m" min="50" max="100" step="1" aria-label="Сколько из 100 мошеннических операций обнаружило правило"><b id="cc-mo"></b></label><label class="cc-rg"><span>ложных предупреждений</span><input type="range" id="cc-k" min="0" max="990" step="1" aria-label="Сколько из 9 900 обычных операций правило отметило по ошибке"><b id="cc-ko"></b></label><span class="cc-pre"><span class="cc-lb">чувствительность и специфичность</span><button type="button" class="btn ghost small" data-pre="90">90%</button><button type="button" class="btn ghost small" data-pre="95">95%</button><button type="button" class="btn ghost small" data-pre="99">99%</button></span></div><ol class="cc-tasks" id="cc-tasks"></ol></div>
<div class="narr"><p class="cap" id="cc-cap"></p>
<div class="cc-ro"><div class="cc-r" id="cc-r1"><span class="cc-big" id="cc-p1"></span><span class="cc-lbl" id="cc-l1"></span></div><div class="cc-r" id="cc-r2"><span class="cc-big" id="cc-p2"></span><span class="cc-lbl" id="cc-l2"></span></div></div>
<p class="cc-gap" id="cc-gap"></p><div class="cc-tree" id="cc-tree"></div><div class="narr-text" id="cc-msg"></div></div></div>
<div class="status"><span><span class="dot live"></span><span id="cc-s1"></span></span><span id="cc-s2"></span><span class="grow"></span><span id="cc-s3"></span></div>`;
    const $ = id => box.querySelector('#' + id);
    const cv = $('cc-cv'), ctx = cv.getContext('2d'), plot = $('cc-plot'), H = { A: $('cc-hA'), B: $('cc-hB') };
    const fresh = () => ({ mode: 'v', cond: 'none', sel: 'A', A: { x: CA.x, y: CA.y, r: RA }, B: { x: CB.x, y: CB.y, r: RB }, m: 99, k: 99, done: [false, false, false] });
    let s = fresh(), W = 0, Hh = 0, s0 = 1, dpr = 1, view = { x: AX / 2, y: .5, z: 1 }, anim = null, raf = 0, drag = null, col = api.css(), wd = null, wkey = '';
    const lim = (v, a, b) => Math.max(a, Math.min(b, v));
    // размер, близкий к размеру второго круга, прилипает к нему: так круги легко сделать одинаковыми
    const snap = k => { const C = s[k], O = s[k === 'A' ? 'B' : 'A']; if (Math.abs(C.r - O.r) / O.r < .06) C.r = O.r; };

    // мир текущего режима: точки, флаги «внутри A» и «внутри B», круги, счётчики
    function world() {
      const key = s.mode === 'v' ? `v|${s.A.x}|${s.A.y}|${s.A.r}|${s.B.x}|${s.B.y}|${s.B.r}` : `f|${s.m}|${s.k}`;
      if (key === wkey) return wd;
      if (s.mode === 'v') {
        const inA = new Uint8Array(NP), inB = new Uint8Array(NP);
        for (let i = 0; i < NP; i++) { inA[i] = (PX[i] - s.A.x) ** 2 + (PY[i] - s.A.y) ** 2 < s.A.r * s.A.r ? 1 : 0; inB[i] = (PX[i] - s.B.x) ** 2 + (PY[i] - s.B.y) ** 2 < s.B.r * s.B.r ? 1 : 0; }
        wd = { X: PX, Y: PY, n: NP, inA, inB, A: s.A, B: s.B, dot: .0105, cnt: countIn(PX, PY, NP, s.A, s.B) };
      } else {
        const L = fraudLayout(s.m, s.k), f = fraudStats(s.m, s.k);
        wd = Object.assign(L, { dot: .0042, cnt: { n: FN, nA: f.F, nB: f.alarms, nAB: f.tp }, fr: f });
      }
      wkey = key; return wd;
    }
    const toS = (x, y) => [W / 2 + (x - view.x) * s0 * view.z, Hh / 2 + (y - view.y) * s0 * view.z];
    const toW = (px, py) => [view.x + (px - W / 2) / (s0 * view.z), view.y + (py - Hh / 2) / (s0 * view.z)];
    function target() {
      const w = world(), C = s.cond === 'A' ? w.A : s.cond === 'B' ? w.B : null;
      if (!C || C.r <= 0) return { x: AX / 2, y: .5, z: 1 };
      return { x: C.x, y: C.y, z: lim(.38 * Math.min(W, Hh) / (C.r * s0), 1, 7) };
    }
    function fly(instant) {
      const to = target();
      if (instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { anim = null; view = to; draw(); return; }
      anim = { from: Object.assign({}, view), to, t0: performance.now() };
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick(now) {
      raf = 0;
      if (anim) {
        const u = ease(Math.min(1, (now - anim.t0) / 650)), a = anim.from, b = anim.to;
        view = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)) };
        if (u >= 1) { view = b; anim = null; }
      }
      draw();
      if (anim) raf = requestAnimationFrame(tick);
    }
    const later = () => { if (!raf) raf = requestAnimationFrame(tick); };

    function layout() {
      W = Math.max(260, plot.clientWidth); Hh = Math.round(lim(W * .7, 230, 470));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr); cv.style.width = W + 'px'; cv.style.height = Hh + 'px'; plot.style.height = Hh + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s0 = Math.min((W - 16) / AX, Hh - 16);
      view = target(); anim = null; draw();
    }

    function label(txt, x, y, align, color) {
      ctx.font = '600 12.5px Onest, system-ui, sans-serif'; ctx.textBaseline = 'alphabetic';
      const w = ctx.measureText(txt).width; let lx = align === 'r' ? x - w : align === 'c' ? x - w / 2 : x;
      lx = lim(lx, 6, W - w - 6); const ly = lim(y, 16, Hh - 6);
      ctx.lineWidth = 4; ctx.strokeStyle = col.surface; ctx.lineJoin = 'round'; ctx.strokeText(txt, lx, ly);
      ctx.fillStyle = color; ctx.fillText(txt, lx, ly);
    }
    function draw() {
      const w = world(), nm = NAMES[s.mode], S = s0 * view.z;
      ctx.clearRect(0, 0, W, Hh);
      const [x0, y0] = toS(0, 0), [x1, y1] = toS(AX, 1);
      ctx.fillStyle = col.paper; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      ctx.strokeStyle = col.line2; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, y0 + .5, x1 - x0 - 1, y1 - y0 - 1);
      // точки: четыре группы, вне круга-условия — бледные
      const colors = [col.c[3], col.accent, col.c[1], col.line2], R = Math.max(.9, w.dot * S);
      const dimOf = i => s.cond === 'A' ? !w.inA[i] : s.cond === 'B' ? !w.inB[i] : false;
      for (const dim of [true, false]) for (let g = 0; g < 4; g++) {
        ctx.beginPath(); let any = false;
        for (let i = 0; i < w.n; i++) {
          const a = w.inA[i], b = w.inB[i], gi = a ? (b ? 0 : 1) : (b ? 2 : 3);
          if (gi !== g || dimOf(i) !== dim) continue;
          const px = W / 2 + (w.X[i] - view.x) * S, py = Hh / 2 + (w.Y[i] - view.y) * S;
          if (px < -R || py < -R || px > W + R || py > Hh + R) continue;
          if (R < 1.6) ctx.rect(px - R, py - R, 2 * R, 2 * R); else { ctx.moveTo(px + R, py); ctx.arc(px, py, R, 0, 2 * Math.PI); }
          any = true;
        }
        if (!any) continue;
        ctx.globalAlpha = dim ? .16 : (g === 3 ? .9 : 1); ctx.fillStyle = colors[g]; ctx.fill();
      }
      ctx.globalAlpha = 1;
      // круги
      [['B', col.c[1]], ['A', col.accent]].forEach(([k, c]) => {
        const C = w[k]; if (!(C.r > 0)) return;
        const [cx, cy] = toS(C.x, C.y);
        ctx.beginPath(); ctx.arc(cx, cy, C.r * S, 0, 2 * Math.PI); ctx.lineWidth = s.cond === k ? 3 : 2; ctx.strokeStyle = c; ctx.stroke();
      });
      // подписи кругов и прямоугольника
      const c = w.cnt;
      const [bx, by] = toS(w.B.x - w.B.r * .72, w.B.y - w.B.r * .72), [ax, ay] = toS(w.A.x + w.A.r * .7, w.A.y - w.A.r * .7);
      if (w.B.r > 0) label(`${nm.B} · ${fmt(c.nB)}`, bx, by - 6, 'r', col.c[1]);
      label(`${nm.A} · ${fmt(c.nA)}`, ax + 4, ay - 6, 'l', col.accent);
      if (s.cond === 'none') label(`${nm.all} · ${fmt(w.n)}`, x0 + 10, y0 + 20, 'l', col.ink2);
      // ручки
      ['A', 'B'].forEach(k => {
        const el = H[k], C = s[k], [hx, hy] = toS(C.x, C.y), vis = s.mode === 'v' && hx > 4 && hy > 4 && hx < W - 4 && hy < Hh - 4;
        el.hidden = !vis;
        if (vis) el.style.transform = `translate(${(hx - 17).toFixed(1)}px,${(hy - 17).toFixed(1)}px)`;
        el.classList.toggle('sel', s.sel === k);
      });
      panel(w);
    }

    function panel(w) {
      const c = w.cnt, S = condStats(c), v = s.mode === 'v', nm = NAMES[s.mode];
      if (v) TASKS.forEach((t, i) => { if (t.ok(S, c)) s.done[i] = true; });
      box.querySelectorAll('#cc-mode button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === s.mode)));
      const cl = v ? { none: 'все визиты', B: 'из рекламы', A: 'с покупкой' } : { none: 'все операции', B: 'с сигналом', A: 'мошеннические' };
      box.querySelectorAll('#cc-cond button').forEach(b => { b.textContent = cl[b.dataset.c]; b.setAttribute('aria-pressed', String(b.dataset.c === s.cond)); });
      box.querySelectorAll('#cc-who button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === s.sel)));
      $('cc-padv').hidden = !v; $('cc-padf').hidden = v;
      $('cc-do').innerHTML = v ? 'Выберите условие над диаграммой. Круги можно перемещать за&nbsp;центр или кнопками под рисунком. Для управления с&nbsp;клавиатуры выберите центр круга. Стрелки перемещают его, клавиши + и − меняют размер.'
        : 'Первый ползунок задаёт число обнаруженных мошеннических операций, второй — число ложных предупреждений. Выберите условие над диаграммой, чтобы рассмотреть нужную группу.';
      const N = c.n, un = s.cond === 'A' ? c.nA : s.cond === 'B' ? c.nB : N;
      $('cc-cap').textContent = s.cond === 'none' ? `Без условия считаем все ${fmt(N)} ${v ? 'визитов' : 'транзакций'}` : `Условие «${nm[s.cond]}». В знаменателе ${fmt(un)} ${plural(un, ['точка', 'точки', 'точек'])}`;
      // две условные вероятности
      $('cc-p1').textContent = fp(S.aGivenB); $('cc-l1').textContent = `P(${nm.A} | ${nm.B}) ${c.nB ? `= ${fmt(c.nAB)} / ${fmt(c.nB)}` : 'не определена'}`;
      $('cc-p2').textContent = fp(S.bGivenA); $('cc-l2').textContent = `P(${nm.B} | ${nm.A}) ${c.nA ? `= ${fmt(c.nAB)} / ${fmt(c.nA)}` : 'не определена'}`;
      $('cc-r1').classList.toggle('on', s.cond === 'B'); $('cc-r2').classList.toggle('on', s.cond === 'A');
      $('cc-gap').innerHTML = S.ratio == null ? (c.nA && c.nB ? 'В пересечении нет точек. Обе доли равны нулю, их отношение не определено.' : 'В одном из кругов нет точек. Если взять его за условие, знаменатель будет равен нулю.')
        : `Отношение большей доли к меньшей равно ${fmt(Math.max(c.nA, c.nB))} / ${fmt(Math.min(c.nA, c.nB))} ≈ <b>${TBf(S.ratio, 2)}</b>. Доли различаются на ${TBf(Math.abs(S.bGivenA - S.aGivenB) * 100, 1)}&nbsp;п.&nbsp;п.`;
      if (v) {
        const d = S.aGivenB == null ? null : (S.aGivenB - S.pA) * 100;
        $('cc-tree').innerHTML = `<span>Доля визитов с покупкой среди всех визитов — <b>${fp(S.pA)}</b>, среди рекламных — <b>${fp(S.aGivenB)}</b>${d == null ? '' : ` (${d >= 0 ? '+' : '−'}${TBf(Math.abs(d), 1)}&nbsp;п.&nbsp;п.)`}.</span><span>Ожидаемое число точек в пересечении при независимости — ${TBf(S.expAB, 1)}. На диаграмме — ${fmt(c.nAB)}.</span>`;
        $('cc-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'cc-ok' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t.t)}</li>`).join('');
      } else {
        const f = w.fr;
        $('cc-tree').innerHTML = `<span>Мошеннических операций — <b>100</b>. Правило обнаружило ${f.tp} и пропустило ${f.fn}.</span><span>Обычных операций — <b>9&nbsp;900</b>. Правило ошибочно отметило ${fmt(f.fp)} из них и пропустило ${fmt(f.tn)}.</span><span>Мошеннических среди отмеченных операций: ${fmt(f.tp)} из ${fmt(f.alarms)} (<b>${fp(f.ppv)}</b>).</span><span>Чувствительность ${TBf(f.sens * 100, 0)}%, специфичность ${TBf(f.spec * 100, 1)}%.</span>`;
        $('cc-tasks').innerHTML = '';
      }
      $('cc-tasks').hidden = !v;
      let m;
      if (!v) {
        const f = w.fr;
        if (f.tp === f.fp) m = 'Верных и ложных предупреждений поровну. Среди отмеченных операций ровно половина мошеннических.';
        else if (f.fp > f.tp) m = `Ложных предупреждений больше, чем верных. Обычных операций в 99 раз больше, чем мошеннических. Даже при доле ошибок ${TBf(f.fp / f.H * 100, 1)}% в этой группе число ложных предупреждений достигает ${fmt(f.fp)}.`;
        else m = `Верных предупреждений больше, чем ложных. Среди отмеченных операций мошеннических — ${fmt(f.tp)}, обычных — ${fmt(f.fp)}.`;
      } else if (!c.nA || !c.nB) m = 'В знаменателе получилось 0. Сдвиньте пустой круг или увеличьте его, чтобы внутрь попала хотя бы одна точка.';
      else if (!c.nAB) m = 'Ни одна точка не попала сразу в оба круга. Для этой выборки события несовместны. Поскольку в каждом круге есть точки, события зависимы.';
      else if (S.ratio <= 1.05) m = 'В кругах примерно поровну точек, поэтому и условные вероятности близки. Если в кругах будет поровну точек, обе доли совпадут.';
      else m = `Пересечение одно&nbsp;— ${fmt(c.nAB)} ${plural(c.nAB, ['точка', 'точки', 'точек'])}, а&nbsp;знаменатели разные: ${fmt(c.nB)} и&nbsp;${fmt(c.nA)}.`;
      $('cc-msg').innerHTML = m;
      if (!v) { const f = w.fr; $('cc-m').value = s.m; $('cc-k').value = s.k; $('cc-mo').textContent = `${s.m} из 100`; $('cc-ko').textContent = `${fmt(s.k)} из 9\u00a0900`; }
      cv.setAttribute('aria-label', v ? `Каждая точка обозначает один из 1 000 визитов. В круге «купил» точек — ${c.nA}, в круге «реклама» — ${c.nB}, в пересечении — ${c.nAB}.` : `На 10 000 транзакций приходится 100 мошеннических. Всего операций с предупреждением — ${c.nB}, из них мошеннических — ${c.nAB}.`);
      ['A', 'B'].forEach(k => H[k].setAttribute('aria-label', `Число точек в круге «${NAMES.v[k]}» — ${k === 'A' ? c.nA : c.nB}. Клавиши со стрелками перемещают круг, плюс и минус меняют его размер.`));
      $('cc-s1').textContent = v ? 'визиты: 1 000 точек' : '10 000 транзакций, доля фрода — 1%';
      $('cc-s2').textContent = `условие: ${s.cond === 'none' ? 'без ограничений' : `«${nm[s.cond]}»`}`;
      $('cc-s3').textContent = `в пересечении ${fmt(c.nAB)}`;
    }

    // перетаскивание: камера на время перетаскивания замирает
    function local(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * Hh / r.height]; }
    function startDrag(k, e, el) {
      e.preventDefault(); if (anim) { anim = null; }
      const [wx, wy] = toW(...local(e)); drag = { k, dx: s[k].x - wx, dy: s[k].y - wy, id: e.pointerId, el };
      s.sel = k; try { el.setPointerCapture(e.pointerId); } catch (er) { /* без захвата тоже работает */ }
      H[k].focus({ preventScroll: true }); draw();
    }
    function moveDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const [wx, wy] = toW(...local(e)), C = s[drag.k];
      C.x = lim(wx + drag.dx, 0, AX); C.y = lim(wy + drag.dy, 0, 1); later();
    }
    function endDrag(e) { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; if (s.cond !== 'none') fly(); }
    ['A', 'B'].forEach(k => {
      H[k].addEventListener('pointerdown', e => startDrag(k, e, H[k]));
      H[k].addEventListener('pointermove', moveDrag); H[k].addEventListener('pointerup', endDrag); H[k].addEventListener('pointercancel', endDrag);
      H[k].addEventListener('focus', () => { if (s.sel !== k) { s.sel = k; draw(); } });
      H[k].addEventListener('keydown', e => {
        const st = (e.shiftKey ? .08 : .02), C = s[k];
        if (e.key === 'ArrowLeft') C.x -= st; else if (e.key === 'ArrowRight') C.x += st; else if (e.key === 'ArrowUp') C.y -= st; else if (e.key === 'ArrowDown') C.y += st;
        else if (e.key === '+' || e.key === '=') { C.r = lim(C.r * 1.1, .04, .6); snap(k); } else if (e.key === '-' || e.key === '_') { C.r = lim(C.r / 1.1, .04, .6); snap(k); } else return;
        e.preventDefault(); e.stopPropagation(); C.x = lim(C.x, 0, AX); C.y = lim(C.y, 0, 1);
        if (s.cond !== 'none') fly(true); else draw();
      });
    });
    // мышью можно взять и сам круг; на сенсорном экране холст прокручивает страницу
    cv.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || s.mode !== 'v') return;
      const [wx, wy] = toW(...local(e)), inside = k => (wx - s[k].x) ** 2 + (wy - s[k].y) ** 2 < s[k].r ** 2;
      const k = inside('A') && (!inside('B') || s.A.r <= s.B.r) ? 'A' : inside('B') ? 'B' : null;
      if (k) startDrag(k, e, cv);
    });
    cv.addEventListener('pointermove', e => {
      if (drag) { moveDrag(e); return; }
      if (e.pointerType !== 'mouse' || s.mode !== 'v') return;
      const [wx, wy] = toW(...local(e));
      cv.style.cursor = ['A', 'B'].some(k => (wx - s[k].x) ** 2 + (wy - s[k].y) ** 2 < s[k].r ** 2) ? 'grab' : 'default';
    });
    cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);

    $('cc-mode').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b || b.dataset.m === s.mode) return; s.mode = b.dataset.m; s.cond = 'none'; fly(); });
    $('cc-cond').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; s.cond = b.dataset.c; fly(); });
    $('cc-who').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { s.sel = b.dataset.k; draw(); } });
    $('cc-padv').addEventListener('click', e => {
      const b = e.target.closest('[data-mv],[data-sz]'); if (!b) return; const C = s[s.sel];
      if (b.dataset.mv) { const [dx, dy] = b.dataset.mv.split(',').map(Number); C.x = lim(C.x + dx * .02, 0, AX); C.y = lim(C.y + dy * .02, 0, 1); }
      else { C.r = lim(+b.dataset.sz > 0 ? C.r * 1.12 : C.r / 1.12, .04, .6); snap(s.sel); }
      if (s.cond !== 'none') fly(); else draw();
    });
    const onRange = () => { s.m = +$('cc-m').value; s.k = +$('cc-k').value; if (s.cond !== 'none') fly(true); else draw(); };
    $('cc-m').addEventListener('input', onRange); $('cc-k').addEventListener('input', onRange);
    box.querySelector('.cc-pre').addEventListener('click', e => {
      const b = e.target.closest('[data-pre]'); if (!b) return; const a = +b.dataset.pre;
      s.m = a; s.k = Math.round(9900 * (100 - a) / 100); if (s.cond !== 'none') fly(); else draw();
    });
    $('cc-reset').addEventListener('click', () => { s = fresh(); wkey = ''; layout(); });
    if ('ResizeObserver' in window) { let lw = 0; new ResizeObserver(() => { const w = plot.clientWidth; if (Math.abs(w - lw) > 2) { lw = w; layout(); } }).observe(box.querySelector('.cc-main')); }
    layout();
    return {
      describe() {
        const w = world(), c = w.cnt, S = condStats(c), nm = NAMES[s.mode];
        const base = s.mode === 'v'
          ? `Режим «Визиты». Всего 1 000 визитов. Число точек в круге «купил» — ${c.nA}, в круге «реклама» — ${c.nB}, в их пересечении — ${c.nAB}`
          : `Режим «Антифрод». Правило обнаружило ${s.m} из 100 мошеннических операций и ошибочно отметило ${fmt(s.k)} из 9 900 обычных. Всего предупреждений: ${fmt(c.nB)}`;
        return `${base}. Выбор группы: ${s.cond === 'none' ? 'без условия' : `при условии «${nm[s.cond]}»`}. P(${nm.A} | ${nm.B}) = ${fp(S.aGivenB)}, P(${nm.B} | ${nm.A}) = ${fp(S.bGivenA)}${s.mode === 'v' ? `. Выполнено заданий: ${s.done.filter(Boolean).length} из 3` : ''}.`;
      },
      redraw() { col = api.css(); draw(); }
    };
  }

  // Блоки кода: запущены в Python 3.13, NumPy 2.5.3, pandas 3.0.5, SciPy 1.18.1; вывод вставлен как есть
  const CODE = {"sim": {"title": "Оценка условных вероятностей по 100 000 визитов", "badge": "проверено: Python 3.13, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\n\nrng = np.random.default_rng(51)\nn = 100_000\n# Доли источников и вероятность покупки задаём так же, как в генераторе visits.csv.\nsource = rng.choice([\"органика\", \"реклама\", \"рассылка\"], n, p=[0.55, 0.30, 0.15])\np_buy = np.select([source == \"органика\", source == \"реклама\", source == \"рассылка\"],\n                  [0.025, 0.040, 0.060])\nbought = rng.random(n) < p_buy          # Вероятность покупки зависит от источника визита.\n\nad = source == \"реклама\"\nprint(\"P(купил)           \", bought.mean().round(4))\nprint(\"P(купил | реклама) \", bought[ad].mean().round(4))   # доля внутри круга «реклама»\nprint(\"P(реклама | купил) \", ad[bought].mean().round(4))   # доля внутри круга «купил»\n\n# Вычислим теоретические вероятности по формулам полной вероятности и Байеса.\np_b = 0.55 * 0.025 + 0.30 * 0.040 + 0.15 * 0.060\nprint(\"по формулам:        \", round(p_b, 4), 0.04, round(0.04 * 0.30 / p_b, 4))\n\n# Теперь моделируем платежи. Правило отмечает 99% мошеннических операций и 1% обычных.\nfraud = rng.random(n) < 0.01\nalarm = np.where(fraud, rng.random(n) < 0.99, rng.random(n) < 0.01)\nprint(\"операций с предупреждением:\", alarm.sum(), \"из них мошеннических:\", (fraud & alarm).sum())\nprint(\"P(фрод | сигнал)   \", fraud[alarm].mean().round(3))", "out": "P(купил)            0.0342\nP(купил | реклама)  0.0394\nP(реклама | купил)  0.3448\nпо формулам:         0.0348 0.04 0.3453\nопераций с предупреждением: 1938 из них мошеннических: 948\nP(фрод | сигнал)    0.489", "note": "Параметры симуляции те же, что у учебной таблицы. Другое начальное значение генератора (51) даёт другую выборку. Для доли рекламы среди визитов с покупкой симуляция и формула дают 34,5% при округлении. В примере с платежами среди 1 938 отмеченных транзакций оказались мошенническими 948, или 48,9%. По формуле ожидаем 50%."}, "crosstab": {"title": "Как выбрать знаменатель в pd.crosstab", "badge": "проверено: Python 3.13, pandas 3.0.5", "lang": "python", "code": "import pandas as pd\n\nv = pd.read_csv(\"data/probability/visits.csv\")   # 100 000 учебных визитов: source, bought\nt = pd.crosstab(v[\"source\"], v[\"bought\"], margins=True, margins_name=\"всего\")\nprint(t)\n\n# В столбце 1 видна конверсия каждого источника.\nprint(pd.crosstab(v[\"source\"], v[\"bought\"], normalize=\"index\").round(4))\n# В столбце 1 видна доля каждого источника среди визитов с покупкой.\nprint(pd.crosstab(v[\"source\"], v[\"bought\"], normalize=\"columns\").round(4))\n\n# Проверим формулу Байеса по той же таблице: P(реклама | купил) = P(купил | реклама) · P(реклама) / P(купил)\nn = t.loc[\"всего\", \"всего\"]\np_ad = t.loc[\"реклама\", \"всего\"] / n\np_buy = t.loc[\"всего\", 1] / n\np_buy_ad = t.loc[\"реклама\", 1] / t.loc[\"реклама\", \"всего\"]\nprint(\"Байес:\", round(p_buy_ad * p_ad / p_buy, 4),\n      \"  прямо из столбца:\", round(t.loc[\"реклама\", 1] / t.loc[\"всего\", 1], 4))\n\n# полная вероятность: P(купил) = сумма P(купил | источник) · P(источник)\nw = v[\"source\"].value_counts(normalize=True)\nconv = v.groupby(\"source\")[\"bought\"].mean()\nprint(\"полная вероятность:\", round((conv * w).sum(), 5), \" среднее bought:\", v[\"bought\"].mean())", "out": "bought        0     1   всего\nsource                       \nорганика  53802  1307   55109\nрассылка  14146   897   15043\nреклама   28676  1172   29848\nвсего     96624  3376  100000\nbought         0       1\nsource                  \nорганика  0.9763  0.0237\nрассылка  0.9404  0.0596\nреклама   0.9607  0.0393\nbought         0       1\nsource                  \nорганика  0.5568  0.3871\nрассылка  0.1464  0.2657\nреклама   0.2968  0.3472\nБайес: 0.3472   прямо из столбца: 0.3472\nполная вероятность: 0.03376  среднее bought: 0.03376", "outLabel": "Число визитов, доли по строкам и столбцам, проверка по формуле Байеса", "note": "В строке «реклама» и столбце 1 доля по строке равна 0,0393. Это конверсия рекламы. Доля по столбцу равна 0,3472. Это доля рекламы среди визитов с покупкой. Теорема Байеса связывает эти две вероятности. По формуле полной вероятности получаем общую конверсию 0,03376."}, "indep": {"title": "Проверка независимости с помощью критерия хи-квадрат", "badge": "проверено: Python 3.13, pandas 3.0.5, SciPy 1.18.1", "lang": "python", "code": "import pandas as pd\nfrom scipy.stats import chi2_contingency\n\nv = pd.read_csv(\"data/probability/visits.csv\")\nt = pd.crosstab(v[\"source\"], v[\"bought\"])\n\n# 1. Сравним доли визитов с покупкой по источникам с общей долей.\nprint(v.groupby(\"source\")[\"bought\"].mean().round(4).to_dict(), round(v[\"bought\"].mean(), 4))\n\n# 2. Число визитов, которое ожидается в каждой ячейке при независимости.\nres = chi2_contingency(t)\nprint(pd.DataFrame(res.expected_freq, index=t.index, columns=t.columns).round(1))\n\n# 3. Критерий хи-квадрат оценивает расхождение наблюдаемых и ожидаемых частот.\nprint(f\"хи-квадрат = {res.statistic:.1f}, степеней свободы {res.dof}, p = {res.pvalue:.1e}\")\n\n# Для сравнения проверим, связана ли покупка с чётностью номера визита.\neven = v[\"visit_id\"] % 2 == 0\nr2 = chi2_contingency(pd.crosstab(even, v[\"bought\"]))\nprint(f\"чётность: хи-квадрат = {r2.statistic:.2f}, p = {r2.pvalue:.2f}\")", "out": "{'органика': 0.0237, 'рассылка': 0.0596, 'реклама': 0.0393} 0.0338\nbought          0       1\nsource                   \nорганика  53248.5  1860.5\nрассылка  14535.1   507.9\nреклама   28840.3  1007.7\nхи-квадрат = 506.8, степеней свободы 2, p = 9.1e-111\nчётность: хи-квадрат = 0.33, p = 0.56", "note": "При независимости в ячейке «реклама, есть покупка» ожидалось бы 1 007,7 визита. В таблице их 1 172. Для рассылки ожидалось 507,9, а наблюдалось 897. По всей таблице статистика хи-квадрат равна 506,8 при двух степенях свободы, p ≈ 9,1 · 10⁻¹¹¹. При независимости расхождение такой величины или больше крайне маловероятно. Для чётности номера визита p = 0,56. На обычном уровне значимости 0,05 оснований отвергнуть независимость нет. Подробнее об этом в уроках 6.3 и 6.4."}};

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-5-1',
    short: 'DA-05',
    title: 'Условная вероятность и теорема Байеса',
    where: 'блок «Дата аналитика», тема 05 «Вероятность», страница 5.1',
    aiData: 'В файле visits.csv 100 000 учебных визитов с источником трафика и отметкой о покупке. Покупкой закончились 3,38% визитов, среди рекламных визитов — 3,93%. Из рекламы пришли 34,7% визитов с покупкой. На диаграмме 1 000 визитов, из них 299 рекламных, 34 с покупкой, 12 с обоими признаками. В режиме «Антифрод» из 10 000 транзакций 100 мошеннические.',
    scene,
    widgets: { cam: buildCam },
    code: CODE,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'В учебной таблице около 3,4% всех визитов закончились покупкой. На рекламу пришлось около 30% визитов, конверсия рекламы составила примерно 4%. Какая доля визитов с покупкой пришлась на рекламу?', opts: [['Около 3,9%'], ['Около 30%'], ['Около 35%', 1], ['Около 90%']],
      why: 'Для ответа нужны визиты с покупкой. Умножим долю рекламных визитов на их конверсию и разделим на общую конверсию. С округлёнными числами получится 0,30 · 0,04 / 0,034 ≈ 0,35. Можно проверить по числу визитов в таблице. Из 3 376 визитов с покупкой 1 172 начались с перехода по рекламе.' },
    q2: { sec: 'idea', q: 'В анимации мы выбрали круг «купил». Как теперь посчитать долю визитов из рекламы?', opts: [['Разделить 12 на 1 000. Получится 1,2%'], ['Разделить 12 на 299. Получится около 4%'], ['Разделить 12 на 34. Получится около 35%', 1], ['Разделить 12 на 12. Получится 100%']],
      why: 'В круге «купил» 34 визита. Из них 12 начались с перехода по рекламе. Поэтому P(реклама | купил) = 12 / 34 ≈ 35%. Если разделить 12 на все 1 000 визитов, получим вероятность пересечения. Если разделить 12 на 299 рекламных визитов, получим конверсию рекламы.' },
    q3: { sec: 'check', q: 'На каждые 10 000 транзакций приходится 100 мошеннических. Правило обнаруживает 99% мошеннических операций и ошибочно помечает 1% обычных. Какова вероятность, что отмеченная операция мошенническая?', opts: [['99%'], ['50%', 1], ['1%'], ['Около 90%']],
      why: 'Правило верно отметит 99 из 100 мошеннических операций и ошибочно отметит 99 из 9 900 обычных. Из 198 предупреждений верными окажутся 99, то есть ровно половина. Показатель 99% отвечает на другой вопрос. Это вероятность получить предупреждение, если операция мошенническая.' },
    q4: { sec: 'check', q: 'Как по таблице «источник трафика × покупка» проверить гипотезу о независимости этих признаков?', opts: [['Проверить, что в каждой ячейке есть хотя бы один визит'], ['Сравнить числа визитов в ячейках с ожидаемыми при независимости с помощью критерия хи-квадрат', 1], ['Сравнить число визитов с покупкой в каждом источнике'], ['Проверить, что доли в каждой строке в сумме дают 1']],
      why: 'При независимости вероятность покупки одинакова для всех источников. В выборке доли могут различаться случайно. Критерий хи-квадрат учитывает размеры групп и сравнивает наблюдаемое число визитов в каждой ячейке с ожидаемым. В visits.csv конверсия равна 2,4% для органики, 3,9% для рекламы и 6,0% для рассылки. При независимости расхождение такой величины или больше было бы крайне маловероятно.' },
    q5: { sec: 'check', q: 'Чем несовместные события отличаются от независимых?', opts: [['Оба термина означают, что знание об одном событии не меняет вероятность другого'], ['Несовместные события не могут произойти вместе. Если вероятность каждого больше нуля, они зависимы', 1], ['Независимые события не могут произойти вместе'], ['Для несовместных событий всегда выполняется равенство P(A ∩ B) = P(A) · P(B)']],
      why: 'У несовместных событий нет общих исходов, поэтому P(A ∩ B) = 0. Если P(A) и P(B) положительны, их произведение больше нуля. Значит, условие независимости не выполняется. Например, у каждого визита один источник. Если мы знаем, что визит начался с рекламы, вероятность того, что он начался с рассылки, равна нулю.' },
    q6: { sec: 'code', q: 'Какое число вернёт эта строка для данных из visits.csv?', code: 'pd.crosstab(v["source"], v["bought"], normalize="columns").loc["реклама", 1]', lang: 'python', opts: [['P(купил | реклама) ≈ 0,039'], ['P(реклама | купил) ≈ 0,347', 1], ['P(реклама ∩ купил) ≈ 0,012'], ['P(реклама) ≈ 0,298']],
      why: 'При normalize="columns" значение каждой ячейки делится на сумму по столбцу. В столбце bought = 1 всего 3 376 визитов с покупкой, из них 1 172 рекламных. Их доля равна 1 172 / 3 376 ≈ 0,347. Параметр normalize="index" дал бы конверсию рекламы, а normalize="all" — долю этой ячейки среди всех визитов. Долю рекламы во всём трафике можно получить с помощью v["source"].value_counts(normalize=True).' },
    q7: { sec: 'check', q: 'Конверсия органики составляет 2,4%, рекламы — 3,9%, рассылки — 6,0%. На эти источники приходится 55%, 30% и 15% трафика соответственно. Почему общая конверсия составляет около 3,4%, хотя среднее трёх конверсий равно 4,1%?', opts: [['У источников разные доли трафика. Общая конверсия учитывает долю каждого источника', 1], ['У части визитов с покупкой источник не указан'], ['Конверсии источников зависимы, поэтому их нельзя складывать'], ['Общая конверсия всегда ниже конверсии каждого источника']],
      why: 'По формуле полной вероятности получаем 0,024 · 0,55 + 0,039 · 0,30 + 0,060 · 0,15 ≈ 0,034. На органику приходится больше половины визитов, поэтому её низкая конверсия сильнее влияет на результат. Простое среднее подошло бы, если бы все три источника дали поровну визитов.' }
    },
    glossary: {
      prob: { t: 'Вероятность', en: 'probability', d: 'Число от 0 до 1, которое показывает, насколько вероятно событие. Если все исходы равновероятны, это доля исходов, при которых событие происходит.' },
      event: { t: 'Событие', en: 'event', d: 'Множество исходов, например визиты с покупкой.' },
      outcome: { t: 'Исход', en: 'outcome', d: 'Один возможный результат случайного опыта. Например, при выборе визита из таблицы каждому визиту соответствует отдельный исход.' },
      cond: { t: 'Условная вероятность', en: 'conditional probability', d: 'Вероятность события A, когда известно, что произошло B. Если P(B) > 0, то P(A | B) = P(A ∩ B) / P(B).' },
      bayes: { t: 'Теорема Байеса', en: "Bayes' theorem", d: 'Связывает две условные вероятности. Если P(A) и P(B) положительны, то P(B | A) = P(A | B) · P(B) / P(A).' },
      base: { t: 'Базовая частота', en: 'base rate', d: 'Доля случаев в исходной группе. Например, доля мошеннических операций среди всех транзакций до проверки.' },
      inter: { t: 'Пересечение событий', en: 'intersection, A ∩ B', d: 'Исходы, где случились оба события.' },
      union: { t: 'Объединение событий', en: 'union, A ∪ B', d: 'Исходы, где случилось хотя бы одно событие.' },
      compl: { t: 'Противоположное событие', en: 'complement', d: 'Событие, которое происходит, когда A не происходит. Его вероятность равна 1 − P(A).' },
      disjoint: { t: 'Несовместные события', en: 'mutually exclusive events', d: 'События без общих исходов. Вероятность их пересечения равна нулю.' },
      indep: { t: 'Независимые события', en: 'independent events', d: 'Для независимых событий P(A ∩ B) = P(A) · P(B). Если вероятность одного из них положительна, знание о том, что оно произошло, не меняет вероятность другого.' },
      total: { t: 'Формула полной вероятности', en: 'law of total probability', d: 'Если группы Bᵢ охватывают все исходы, не пересекаются и каждая имеет положительную вероятность, то P(A) = Σ P(A | Bᵢ) · P(Bᵢ).' },
      prior: { t: 'Априорная вероятность', en: 'prior probability', d: 'Вероятность гипотезы до новых данных.' },
      posterior: { t: 'Апостериорная вероятность', en: 'posterior probability', d: 'Вероятность гипотезы после учёта данных.' },
      natfreq: { t: 'Натуральные частоты', en: 'natural frequencies', d: 'Числа случаев в группах, по которым удобно вычислять вероятности. Например, из 198 отмеченных операций 99 оказались мошенническими.' },
      sens: { t: 'Чувствительность', en: 'sensitivity, recall', d: 'Доля обнаруженных случаев среди всех случаев, которые нужно выявить. Например, доля отмеченных мошеннических операций среди всех мошеннических операций.' },
      spec: { t: 'Специфичность', en: 'specificity', d: 'Доля верно пропущенных обычных случаев. Например, доля обычных транзакций без предупреждения среди всех обычных транзакций.' },
      fp: { t: 'Ложное срабатывание', en: 'false positive', d: 'Предупреждение при отсутствии события, которое ищет проверка. Например, обычную транзакцию пометили как подозрительную.' },
      neglect: { t: 'Игнорирование базовой частоты', en: 'base rate neglect', d: 'Ошибка в оценке вероятности, когда учитывают результат проверки, но упускают частоту события в исходной группе.' },
      inverse: { t: 'Ошибка инверсии', en: "confusion of the inverse, prosecutor's fallacy", d: 'Ошибка, при которой P(A | B) принимают за P(B | A).' },
      crosstab: { t: 'Таблица сопряжённости', en: 'contingency table, crosstab', d: 'Таблица, в ячейках которой указано число наблюдений для каждого сочетания значений двух признаков.' },
      chi2: { t: 'Критерий хи-квадрат', en: 'chi-squared test', d: 'В проверке независимости этот критерий сравнивает число наблюдений в каждой ячейке таблицы с ожидаемым числом при независимости признаков.' },
      pvalue: { t: 'p-значение', en: 'p-value', d: 'Вероятность при верной нулевой гипотезе получить значение статистики не менее экстремальное, чем наблюдаемое. В критерии хи-квадрат это вероятность такого же или большего значения.' },
      sim: { t: 'Метод Монте-Карло', en: 'Monte Carlo simulation', d: 'Способ приближённого расчёта с помощью случайных испытаний. Например, долей успехов в симуляции можно оценить вероятность события.' },
      bayesinf: { t: 'Байесовский вывод', en: 'Bayesian inference', d: 'Способ обновить представление о параметре с учётом наблюдений. Теорема Байеса связывает априорное и апостериорное распределения через правдоподобие данных.' },
      priordist: { t: 'Априорное распределение', en: 'prior distribution', d: 'Распределение вероятностей, которое описывает представления о значениях параметра до получения новых данных.' }
    },
    materials: [
      ['da-5-1-conditional-bayes.md', 'Текст урока, код, вопросы и глоссарий в Markdown'],
      ['data/probability/', 'Данные главы 5. Для этого урока понадобится visits.csv'],
      ['conditional_bayes.ipynb', 'Ноутбук с симуляцией, таблицей сопряжённости и проверкой независимости'],
      ['scene_points.py', 'Как отобрали 1 000 визитов и разместили их на диаграмме']
    ],
    prompts: [
      ['Знаменатель в новостях', 'Предложи пять примеров с процентами из отчётов или новостей. Показывай их по одному. Я назову условную вероятность и группу, которую взяли за 100%. Проверь мой ответ и объясни, если я ошибся.'],
      ['Байес на натуральных частотах', 'Предложи задачу о проверке на редкое событие. Я попробую решить её, подсчитав число случаев на 10 000 наблюдений. После каждого шага задавай вопрос, по которому я смогу проверить свой расчёт.'],
      ['Проверка независимости', 'Я опишу два признака из своих данных. Помоги составить таблицу сопряжённости и проверить гипотезу о независимости. Давай по одной подсказке и жди моего ответа.']
    ]
  };
})();
