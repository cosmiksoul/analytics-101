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
    [null, null, ['1 000 визитов — это «всё», P = 1', AX / 2, 0, 'c', 'above']],
    [['реклама: 299 из 1 000', CB.x - RB * .72, CB.y - RB * .72, 'r', 'above'], null, null],
    [['реклама: 299', CB.x - RB * .72, CB.y - RB * .72, 'r', 'above'], ['купил: 34 из 1 000', CA.x + RA * .7, CA.y - RA * .7, 'l', 'above'], null],
    [['∪ хотя бы одно: 299 + 34 − 12 = 321', CB.x, CB.y + RB, 'c', 'below'], null, ['∩ оба: 12', LX, CB.y - RA, 'c', 'above']],
    [['новое «всё»: 299 визитов', CB.x, CB.y - RB, 'c', 'above'], null, null],
    [['новое «всё»: 299', CB.x, CB.y - RB, 'c', 'above'], null, ['12 / 299 = 4,0%', LX, CB.y + RA * .9, 'c', 'below']],
    [null, ['новое «всё»: 34 покупателя', CA.x, CA.y - RA, 'c', 'above'], null],
    [null, ['новое «всё»: 34', CA.x, CA.y - RA, 'c', 'above'], ['12 из рекламы: 12 / 34 = 35%', LX, CA.y + RA * .95, 'c', 'below']],
    [['P(купил | реклама) = 4,0%', CB.x - RB * .2, CB.y + RB, 'c', 'below'], ['P(реклама | купил) = 35%', CA.x + RA * .4, CA.y - RA, 'l', 'above'], null],
    [['внутри рекламы: 12 / 299 = 4,0%', CB.x - RB * .2, CB.y + RB, 'c', 'below'], ['при независимости в ∩ было бы ≈ 10', CA.x + RA * .4, CA.y - RA, 'l', 'above'], ['без условия: 34 / 1 000 = 3,4%', AX / 2, 0, 'c', 'above']]
  ];

  const scene = {
    parts: [{ n: '01', name: 'Доля', s: [0, 1] }, { n: '02', name: 'Два события', s: [2, 3] }, { n: '03', name: 'Условие', s: [4, 5] }, { n: '04', name: 'Байес', s: [6, 7] }, { n: '05', name: 'Переворот', s: [8, 9] }],
    steps: [
      { title: 'Тысяча визитов — это «всё»', dur: 3400, body: '<p>Каждая точка&nbsp;— визит в&nbsp;учебный магазин. Прямоугольник&nbsp;— все исходы сразу, его вероятность равна&nbsp;1.</p><p>Вероятность события здесь&nbsp;— доля точек: сколько визитов из&nbsp;тысячи попали в&nbsp;событие.</p>' },
      { title: 'Событие — круг, вероятность — доля', dur: 3800, body: '<p>Обведём визиты, которые пришли из&nbsp;рекламы. Это событие: 299 точек из&nbsp;1&nbsp;000.</p><p><b>P(реклама) = 299 / 1&nbsp;000 ≈ 0,30.</b> Чем больше круг, тем больше вероятность.</p>' },
      { title: 'Второй круг: «купил»', dur: 3600, body: '<p>Покупка&nbsp;— событие куда реже: 34 точки, <b>P(купил) = 0,034</b>.</p><p>Круги пересекаются: часть покупателей пришла из&nbsp;рекламы.</p>' },
      { title: 'Пересечение и объединение', dur: 4200, body: '<p>В&nbsp;пересечении&nbsp;— визиты, где случилось и&nbsp;то и&nbsp;другое: 12 точек, <b>P(реклама&nbsp;∩&nbsp;купил) = 0,012</b>.</p><p>Объединение&nbsp;— хотя&nbsp;бы одно из&nbsp;двух: 299 + 34 − 12 = 321. Пересечение вычитают, иначе его посчитали&nbsp;бы дважды.</p>' },
      { title: 'Условие — камера наезжает на круг', dur: 4000, body: '<p>Какая доля рекламных визитов закончилась покупкой? Условие «пришёл из&nbsp;рекламы» выбрасывает всё, что вне круга.</p><p>Круг становится новым «всем»: знаменатель теперь 299, а&nbsp;не&nbsp;1&nbsp;000.</p>' },
      { title: 'Доля внутри круга', dur: 3600, body: '<p>Внутри&nbsp;— 12 покупок. <b>P(купил&nbsp;|&nbsp;реклама) = 12 / 299 ≈ 4,0%</b>.</p><p>Черта «|» читается «при условии»: после неё стоит то, что стало «всем».</p>' },
      { title: 'Байес: камера на другом круге', dur: 4200, body: '<p>Обратный вопрос: какая доля покупателей пришла из&nbsp;рекламы? Камера переезжает на&nbsp;круг «купил».</p><p>Новое «всё»&nbsp;— 34 покупателя.</p>' },
      { title: 'Та же дюжина — другая доля', dur: 3600, body: '<p>Из&nbsp;34 покупателей 12 пришли из&nbsp;рекламы: <b>P(реклама&nbsp;|&nbsp;купил) = 12 / 34 ≈ 35%</b>.</p><p>Пересечение то&nbsp;же самое, 12 точек. Изменился только знаменатель.</p>' },
      { title: 'Числитель один, знаменатели разные', dur: 4400, body: '<p>4% и&nbsp;35% различаются в&nbsp;8,8 раза&nbsp;— ровно во&nbsp;столько круг «реклама» больше круга «купил»: 299 / 34.</p><p>Теорема Байеса переводит одно число в&nbsp;другое через размеры кругов: <b>P(реклама&nbsp;|&nbsp;купил) = P(купил&nbsp;|&nbsp;реклама) · P(реклама) / P(купил)</b>.</p>' },
      { title: 'Независимость: камера ничего не меняет', dur: 4400, next: 'Читать страницу', body: '<p>Без условия покупают 3,4% визитов, внутри рекламы&nbsp;— 4,0%. Условие сдвинуло долю, значит, события зависимы.</p><p>Если&nbsp;бы реклама не&nbsp;влияла на&nbsp;покупку, в&nbsp;пересечении было&nbsp;бы 299 · 34 / 1&nbsp;000 ≈ 10 точек, а&nbsp;не&nbsp;12.</p>' }
    ],
    hud: [{ id: 'all', label: 'Всё' }, { id: 'in', label: 'Внутри' }, { id: 'share', label: 'Доля' }],
    legend: `<span><i style="background:${COL.amb}"></i>реклама</span><span><i style="background:${COL.teal}"></i>купил</span><span><i style="background:${COL.pink}"></i>оба сразу</span><span><i style="background:${COL.g}"></i>остальные</span>`,
    info: 'КАМЕРА НА КРУГЕ',
    aiNote: 'В анимации 1 000 точек — пропорциональная выборка из учебного файла visits.csv (100 000 визитов интернет-магазина): из каждой клетки «источник × покупка» взято столько визитов, сколько приходится на тысячу, seed 505. Из рекламы пришли 299 визитов, купили 34, из рекламы и с покупкой — 12. P(реклама) = 0,299, P(купил) = 0,034, P(реклама ∩ купил) = 0,012, объединение 321. Камера на круге «реклама»: P(купил | реклама) = 12/299 ≈ 4,0%. Камера на круге «купил»: P(реклама | купил) = 12/34 ≈ 35%. Разрыв 8,8 раза = 299/34. На полных данных: 1 172 / 29 848 = 3,93% и 1 172 / 3 376 = 34,7%. При независимости в пересечении было бы 299 · 34 / 1000 ≈ 10 точек.',
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
          const on = k === 3 ? p > .15 : p > .45, v = [null, ['299', 'реклама', '29,9%'], ['34', 'купил', '3,4%'], ['12', 'оба', '1,2%']][k], pv = [null, null, ['299', 'реклама', '29,9%'], ['34', 'купил', '3,4%']][k];
          const u = on ? v : pv;
          api.hud('all', '1\u00a0000', ''); api.hud('in', u ? u[0] : '—', u ? u[1] : ''); api.hud('share', u ? u[2] : '—', '');
        } else if (k === 4 || k === 6) {
          api.hud('all', f(Math.round(k === 4 ? lerp(1000, 299, t) : lerp(299, 34, t))), k === 4 ? 'реклама' : 'купил'); api.hud('in', '—', ''); api.hud('share', '—', '');
        } else if (k === 5 || k === 7) {
          const on = p > .3;
          api.hud('all', k === 5 ? '299' : '34', k === 5 ? 'реклама' : 'купил'); api.hud('in', on ? '12' : '—', on ? (k === 5 ? 'купили' : 'из рекламы') : ''); api.hud('share', on ? (k === 5 ? '4,0%' : '35,3%') : '—', '');
        } else if (k === 8) { api.hud('all', '299\u00a0и\u00a034', ''); api.hud('in', '12', 'общее'); api.hud('share', '×\u00a08,8', 'разрыв'); }
        else { api.hud('all', '1\u00a0000', ''); api.hud('in', '34', 'купил'); api.hud('share', '3,4%', '≠\u00a04,0%'); }
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
  const NAMES = { v: { A: 'купил', B: 'реклама', all: 'все визиты' }, f: { A: 'фрод', B: 'сработка', all: 'все транзакции' } };
  const TASKS = [
    { t: 'Сделайте условные вероятности почти равными: одна больше другой не более чем в 1,05 раза.', ok: (S) => S.ratio != null && S.ratio <= 1.05 },
    { t: 'Сделайте события несовместными: P(купил | реклама) = 0.', ok: (S, c) => c.nA > 0 && c.nB > 0 && c.nAB === 0 },
    { t: 'Сделайте события почти независимыми: P(купил | реклама) в пределах 0,3 п. п. от P(купил).', ok: (S, c) => c.nAB > 0 && c.nA > 0 && S.aGivenB != null && Math.abs(S.aGivenB - S.pA) < .003 }
  ];

  function buildCam(box, api) {
    const { esc, fmt, plural } = api;
    box.innerHTML = `<div class="block-hd"><span class="t">Пересечение одно, знаменатели разные <i>интерактив</i></span><div class="ctrls"><span class="seg" role="group" aria-label="Режим" id="cc-mode"><button type="button" data-m="v">Визиты</button><button type="button" data-m="f">Антифрод</button></span><button type="button" class="btn ghost small" id="cc-reset">Сбросить</button></div></div>
<p class="hint cc-do" id="cc-do"></p>
<div class="cc-bar"><span class="cc-lb">камера</span><span class="seg" role="group" aria-label="Условие: на какой круг навести камеру" id="cc-cond"><button type="button" data-c="none"></button><button type="button" data-c="B"></button><button type="button" data-c="A"></button></span></div>
<div class="stage"><div class="cc-main"><div class="cc-plot" id="cc-plot"><canvas id="cc-cv" role="img"></canvas>${['A', 'B'].map(k => `<button type="button" class="cc-h cc-h${k}" id="cc-h${k}"></button>`).join('')}</div>
<div class="cc-pad" id="cc-padv"><span class="cc-lb">круг</span><span class="seg" role="group" aria-label="Какой круг двигать кнопками" id="cc-who"><button type="button" data-k="A">купил</button><button type="button" data-k="B">реклама</button></span><span class="cc-mv"><button type="button" class="btn ghost small" data-mv="-1,0" aria-label="Сдвинуть круг влево">←</button><button type="button" class="btn ghost small" data-mv="1,0" aria-label="Сдвинуть круг вправо">→</button><button type="button" class="btn ghost small" data-mv="0,-1" aria-label="Сдвинуть круг вверх">↑</button><button type="button" class="btn ghost small" data-mv="0,1" aria-label="Сдвинуть круг вниз">↓</button><button type="button" class="btn ghost small" data-sz="1">шире</button><button type="button" class="btn ghost small" data-sz="-1">уже</button></span></div>
<div class="cc-pad" id="cc-padf" hidden><label class="cc-rg"><span>ловит фрод</span><input type="range" id="cc-m" min="50" max="100" step="1" aria-label="Сколько мошеннических транзакций из 100 ловит правило"><b id="cc-mo"></b></label><label class="cc-rg"><span>ложно срабатывает</span><input type="range" id="cc-k" min="0" max="990" step="1" aria-label="На скольких честных транзакциях из 9 900 правило срабатывает по ошибке"><b id="cc-ko"></b></label><span class="cc-pre"><span class="cc-lb">точность</span><button type="button" class="btn ghost small" data-pre="90">90%</button><button type="button" class="btn ghost small" data-pre="95">95%</button><button type="button" class="btn ghost small" data-pre="99">99%</button></span></div><ol class="cc-tasks" id="cc-tasks"></ol></div>
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
      const cl = v ? { none: 'всё', B: 'при «реклама»', A: 'при «купил»' } : { none: 'всё', B: 'при сработке', A: 'при фроде' };
      box.querySelectorAll('#cc-cond button').forEach(b => { b.textContent = cl[b.dataset.c]; b.setAttribute('aria-pressed', String(b.dataset.c === s.cond)); });
      box.querySelectorAll('#cc-who button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === s.sel)));
      $('cc-padv').hidden = !v; $('cc-padf').hidden = v;
      $('cc-do').innerHTML = v ? 'Тащите круг за&nbsp;ручку в&nbsp;центре, мышью&nbsp;— и&nbsp;за&nbsp;сам круг. Без&nbsp;мыши: кнопки под&nbsp;рисунком или стрелки и&nbsp;+&nbsp;− на&nbsp;ручке. «Камера» выбирает условие.'
        : 'Ползунки задают, сколько фрода ловит правило и&nbsp;на&nbsp;скольких честных ошибается. «Камера» наводится на&nbsp;сработки или фрод.';
      const N = c.n, un = s.cond === 'A' ? c.nA : s.cond === 'B' ? c.nB : N;
      $('cc-cap').textContent = s.cond === 'none' ? `Без условия: «всё» — ${fmt(N)} ${v ? 'визитов' : 'транзакций'}` : `Условие «${nm[s.cond]}»: новое «всё» — ${fmt(un)} ${plural(un, ['точка', 'точки', 'точек'])}`;
      // две условные вероятности
      $('cc-p1').textContent = fp(S.aGivenB); $('cc-l1').textContent = `P(${nm.A} | ${nm.B}) = ${fmt(c.nAB)} из ${fmt(c.nB)}`;
      $('cc-p2').textContent = fp(S.bGivenA); $('cc-l2').textContent = `P(${nm.B} | ${nm.A}) = ${fmt(c.nAB)} из ${fmt(c.nA)}`;
      $('cc-r1').classList.toggle('on', s.cond === 'B'); $('cc-r2').classList.toggle('on', s.cond === 'A');
      $('cc-gap').innerHTML = S.ratio == null ? (c.nA && c.nB ? 'Пересечение пустое: обе условные вероятности равны нулю.' : 'Один круг пуст: при пустом условии делить не&nbsp;на&nbsp;что.')
        : `Различаются в&nbsp;<b>${TBf(S.ratio, 1)}&nbsp;раза</b> (${TBf(Math.abs(S.bGivenA - S.aGivenB) * 100, 1)}&nbsp;п.&nbsp;п.)&nbsp;— как размеры кругов: ${fmt(Math.max(c.nA, c.nB))} / ${fmt(Math.min(c.nA, c.nB))}.`;
      if (v) {
        const d = S.aGivenB == null ? null : (S.aGivenB - S.pA) * 100;
        $('cc-tree').innerHTML = `<span>Без условия «купил» — <b>${fp(S.pA)}</b>, внутри «реклама» — <b>${fp(S.aGivenB)}</b>${d == null ? '' : ` (${d >= 0 ? '+' : '−'}${TBf(Math.abs(d), 1)}&nbsp;п.&nbsp;п.)`}.</span><span>При независимости в&nbsp;пересечении было&nbsp;бы ≈&nbsp;${TBf(S.expAB, 1)}, а&nbsp;там ${fmt(c.nAB)}.</span>`;
        $('cc-tasks').innerHTML = TASKS.map((t, i) => `<li class="${s.done[i] ? 'cc-ok' : ''}"><b>${s.done[i] ? '✓' : i + 1}</b>${esc(t.t)}</li>`).join('');
      } else {
        const f = w.fr;
        $('cc-tree').innerHTML = `<span>Из&nbsp;10&nbsp;000 транзакций фрод&nbsp;— <b>100</b>: поймано ${f.tp}, пропущено ${f.fn}.</span><span>Честных <b>9&nbsp;900</b>: ложных сработок ${fmt(f.fp)}, без сработки ${fmt(f.tn)}.</span><span>Сработок ${fmt(f.alarms)}, из них фрод ${f.tp}: <b>${fp(f.ppv)}</b>.</span><span>Чувствительность ${TBf(f.sens * 100, 0)}%, специфичность ${TBf(f.spec * 100, 1)}%.</span>`;
        $('cc-tasks').innerHTML = '';
      }
      $('cc-tasks').hidden = !v;
      let m;
      if (!v) {
        const f = w.fr;
        m = f.ppv == null ? 'Правило молчит: сработок нет, и P(фрод | сработка) не&nbsp;определена.'
          : f.ppv < .5 ? `Правило чаще ошибается, чем попадает: верна примерно одна сработка из&nbsp;${Math.round(1 / f.ppv)}. Честных в&nbsp;99&nbsp;раз больше, чем мошеннических, и&nbsp;даже ${TBf(f.fp / f.H * 100, 1)}% ошибок на&nbsp;них&nbsp;— это ${fmt(f.fp)} ложных сработок против ${f.tp} настоящих.`
          : f.ppv < .55 ? 'Половина сработок ложная: ложных столько&nbsp;же, сколько пойманного фрода, хотя правило ошибается всего на&nbsp;1% честных.'
          : `Верных сработок больше половины, но&nbsp;только потому, что ложных мало: ${fmt(f.fp)} на&nbsp;9&nbsp;900 честных.`;
      } else if (!c.nA || !c.nB) m = 'Сдвиньте пустой круг на&nbsp;точки: событие без&nbsp;исходов нельзя взять условием.';
      else if (!c.nAB) m = 'Круги не&nbsp;пересекаются: события несовместны. Они&nbsp;при этом зависимы: знание об&nbsp;одном исключает другое.';
      else if (S.ratio <= 1.05) m = 'Круги почти одного размера&nbsp;— и&nbsp;условные вероятности почти совпали: P(A&nbsp;|&nbsp;B) = P(B&nbsp;|&nbsp;A), только когда P(A) = P(B).';
      else m = `Пересечение одно&nbsp;— ${fmt(c.nAB)} ${plural(c.nAB, ['точка', 'точки', 'точек'])}, а&nbsp;знаменатели разные: ${fmt(c.nB)} и&nbsp;${fmt(c.nA)}.`;
      $('cc-msg').innerHTML = m;
      if (!v) { const f = w.fr; $('cc-m').value = s.m; $('cc-k').value = s.k; $('cc-mo').textContent = `${s.m} из 100`; $('cc-ko').textContent = `${fmt(s.k)} из 9\u00a0900`; }
      cv.setAttribute('aria-label', v ? `Тысяча визитов точками, круг «купил» — ${c.nA} точек, круг «реклама» — ${c.nB}, в пересечении ${c.nAB}` : `Десять тысяч транзакций, фрод — 100 точек, сработок ${c.nB}, из них фрод ${c.nAB}`);
      ['A', 'B'].forEach(k => H[k].setAttribute('aria-label', `Круг «${NAMES.v[k]}»: ${k === 'A' ? c.nA : c.nB} точек. Стрелки двигают круг, плюс и минус меняют размер.`));
      $('cc-s1').textContent = v ? 'визиты: 1 000 точек' : 'антифрод: 10 000 точек, фрод 1%';
      $('cc-s2').textContent = `камера: ${s.cond === 'none' ? 'всё' : `«${nm[s.cond]}»`}`;
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
          ? `режим «Визиты», 1000 учебных точек; круг «купил»: ${c.nA} точек, круг «реклама»: ${c.nB}, в пересечении ${c.nAB}`
          : `режим «Антифрод», 10 000 транзакций, фрод 100; правило ловит ${s.m} из 100, ложно срабатывает на ${s.k} из 9900; сработок ${c.nB}`;
        return `${base}; камера: ${s.cond === 'none' ? 'без условия' : `при условии «${nm[s.cond]}»`}; P(${nm.A} | ${nm.B}) = ${fp(S.aGivenB)}, P(${nm.B} | ${nm.A}) = ${fp(S.bGivenA)}${s.mode === 'v' ? `; заданий выполнено ${s.done.filter(Boolean).length} из 3` : ''}.`;
      },
      redraw() { col = api.css(); draw(); }
    };
  }

  // Блоки кода: запущены в Python 3.13.18, NumPy 2.5.3, pandas 3.0.5, SciPy 1.18.1; вывод вставлен как есть
  const CODE = {"sim": {"title": "Сто тысяч пользователей: условная доля — маска внутри круга", "badge": "проверено: Python 3.13, NumPy 2.5.3", "lang": "python", "code": "import numpy as np\n\nrng = np.random.default_rng(51)\nn = 100_000\n# учебный мир: доли источников и конверсия каждого — как в генераторе visits.csv\nsource = rng.choice([\"органика\", \"реклама\", \"рассылка\"], n, p=[0.55, 0.30, 0.15])\np_buy = np.select([source == \"органика\", source == \"реклама\", source == \"рассылка\"],\n                  [0.025, 0.040, 0.060])\nbought = rng.random(n) < p_buy          # у каждого своя монетка с весом p_buy\n\nad = source == \"реклама\"\nprint(\"P(купил)           \", bought.mean().round(4))\nprint(\"P(купил | реклама) \", bought[ad].mean().round(4))   # доля внутри круга «реклама»\nprint(\"P(реклама | купил) \", ad[bought].mean().round(4))   # доля внутри круга «купил»\n\n# те же числа по формулам: полная вероятность и Байес\np_b = 0.55 * 0.025 + 0.30 * 0.040 + 0.15 * 0.060\nprint(\"по формулам:        \", round(p_b, 4), 0.04, round(0.04 * 0.30 / p_b, 4))\n\n# антифрод: фрод 1%, тест ловит 99% фрода и срабатывает на 1% честных\nfraud = rng.random(n) < 0.01\nalarm = np.where(fraud, rng.random(n) < 0.99, rng.random(n) < 0.01)\nprint(\"сработок\", alarm.sum(), \"из них фрод\", (fraud & alarm).sum())\nprint(\"P(фрод | сработка) \", fraud[alarm].mean().round(3))", "out": "P(купил)            0.0342\nP(купил | реклама)  0.0394\nP(реклама | купил)  0.3448\nпо формулам:         0.0348 0.04 0.3453\nсработок 1938 из них фрод 948\nP(фрод | сработка)  0.489", "note": "Зерно 51, а не 505, как у visits.csv, поэтому числа чуть отличаются от учебного файла: это другая случайная выборка из того же мира. От формул симуляция отходит на десятые доли процентного пункта, у антифрода сильнее: мошеннических транзакций среди 100 000 всего около тысячи."}, "crosstab": {"title": "pd.crosstab: normalize выбирает знаменатель", "badge": "проверено: Python 3.13, pandas 3.0.5", "lang": "python", "code": "import pandas as pd\n\nv = pd.read_csv(\"data/probability/visits.csv\")   # 100 000 учебных визитов: source, bought\nt = pd.crosstab(v[\"source\"], v[\"bought\"], margins=True, margins_name=\"всего\")\nprint(t)\n\n# доли по строкам: P(купил | источник) — конверсия каждого источника\nprint(pd.crosstab(v[\"source\"], v[\"bought\"], normalize=\"index\").round(4))\n# доли по столбцам: P(источник | купил) — откуда пришли покупатели\nprint(pd.crosstab(v[\"source\"], v[\"bought\"], normalize=\"columns\").round(4))\n\n# Байес из той же таблицы: P(реклама | купил) = P(купил | реклама) · P(реклама) / P(купил)\nn = t.loc[\"всего\", \"всего\"]\np_ad = t.loc[\"реклама\", \"всего\"] / n\np_buy = t.loc[\"всего\", 1] / n\np_buy_ad = t.loc[\"реклама\", 1] / t.loc[\"реклама\", \"всего\"]\nprint(\"Байес:\", round(p_buy_ad * p_ad / p_buy, 4),\n      \"  прямо из столбца:\", round(t.loc[\"реклама\", 1] / t.loc[\"всего\", 1], 4))\n\n# полная вероятность: P(купил) = сумма P(купил | источник) · P(источник)\nw = v[\"source\"].value_counts(normalize=True)\nconv = v.groupby(\"source\")[\"bought\"].mean()\nprint(\"полная вероятность:\", round((conv * w).sum(), 5), \" среднее bought:\", v[\"bought\"].mean())", "out": "bought        0     1   всего\nsource                       \nорганика  53802  1307   55109\nрассылка  14146   897   15043\nреклама   28676  1172   29848\nвсего     96624  3376  100000\nbought         0       1\nsource                  \nорганика  0.9763  0.0237\nрассылка  0.9404  0.0596\nреклама   0.9607  0.0393\nbought         0       1\nsource                  \nорганика  0.5568  0.3871\nрассылка  0.1464  0.2657\nреклама   0.2968  0.3472\nБайес: 0.3472   прямо из столбца: 0.3472\nполная вероятность: 0.03376  среднее bought: 0.03376", "outLabel": "Вывод: счётчики, доли по строкам, доли по столбцам, Байес", "note": "Столбец 1 в долях по строкам — конверсия источника: у рекламы 0,0393. Столбец 1 в долях по столбцам — откуда пришли покупатели: реклама 0,3472. Это два числа из задачи, и Байес переводит первое во второе. Полная вероятность собирает 0,03376 из трёх конверсий."}, "indep": {"title": "Независимость по таблице: доли, ожидаемые числа, хи-квадрат", "badge": "проверено: Python 3.13, pandas 3.0.5, SciPy 1.18.1", "lang": "python", "code": "import pandas as pd\nfrom scipy.stats import chi2_contingency\n\nv = pd.read_csv(\"data/probability/visits.csv\")\nt = pd.crosstab(v[\"source\"], v[\"bought\"])\n\n# 1. P(купил | источник) против P(купил): при независимости все строки одинаковы\nprint(v.groupby(\"source\")[\"bought\"].mean().round(4).to_dict(), round(v[\"bought\"].mean(), 4))\n\n# 2. Сколько было бы в клетках при независимости: n · P(источник) · P(купил)\nres = chi2_contingency(t)\nprint(pd.DataFrame(res.expected_freq, index=t.index, columns=t.columns).round(1))\n\n# 3. Хи-квадрат: насколько наблюдаемая таблица далека от ожидаемой\nprint(f\"хи-квадрат = {res.statistic:.1f}, степеней свободы {res.dof}, p = {res.pvalue:.1e}\")\n\n# для сравнения — признак, который с покупкой не связан: чётность номера визита\neven = v[\"visit_id\"] % 2 == 0\nr2 = chi2_contingency(pd.crosstab(even, v[\"bought\"]))\nprint(f\"чётность: хи-квадрат = {r2.statistic:.2f}, p = {r2.pvalue:.2f}\")", "out": "{'органика': 0.0237, 'рассылка': 0.0596, 'реклама': 0.0393} 0.0338\nbought          0       1\nsource                   \nорганика  53248.5  1860.5\nрассылка  14535.1   507.9\nреклама   28840.3  1007.7\nхи-квадрат = 506.8, степеней свободы 2, p = 9.1e-111\nчётность: хи-квадрат = 0.33, p = 0.56", "note": "При независимости в клетке «реклама, купил» ожидалось бы 1 007,7 визита, а там 1 172; у рассылки разрыв больше: 507,9 против 897. Хи-квадрат 506,8 при двух степенях свободы и p = 9,1·10⁻¹¹¹: при независимости такое расхождение практически не встречается. У чётности номера p = 0,56 — разница в пределах шума. Выбор критерия и чтение p — страницы 6.3 и 6.4."}};

  /* ===================== Данные страницы ===================== */
  window.PAGE = {
    id: 'da-5-1',
    short: 'DA-05',
    title: 'Вероятность, условная вероятность, Байес',
    where: 'блок «Дата аналитика», тема 05 «Вероятность», страница 5.1',
    aiData: 'учебный файл visits.csv — 100 000 визитов интернет-магазина с источником (органика 55%, реклама 30%, рассылка 15%) и отметкой покупки; P(купил) = 3,38%, P(купил | реклама) = 3,93%, P(реклама | купил) = 34,7%; в анимации и интерактиве — пропорциональная тысяча визитов (299 из рекламы, 34 покупки, 12 и то и другое); режим «антифрод» — 10 000 транзакций с фродом 1%',
    scene,
    widgets: { cam: buildCam },
    code: CODE,
    questions: {
    q1: { sec: 'method', title: 'Сначала предскажите', q: 'Из рекламы пришли 30% визитов, купили 3,4% всех визитов, а среди рекламных — 3,9%. Какая доля покупателей пришла из рекламы, P(реклама | купил)?', opts: [['Около 3,9% — пересечение то же самое'], ['Около 30% — как доля рекламы в трафике'], ['Около 35%', 1], ['Около 90%']],
      why: 'Пересечение одно — визиты из рекламы с покупкой, но знаменатели разные. На 1 000 визитов: из рекламы 300, из них купили 3,9%, это около 12. Всего покупателей 34, и 12 из них — около 35%. Формула Байеса даёт то же: 0,039 · 0,30 / 0,034 ≈ 0,34. 3,9% — это P(купил | реклама), классическая подмена условия. 30% было бы при независимости: тогда доля рекламы среди покупателей совпала бы с долей в трафике, но рекламные визиты покупают чаще среднего. До 90% не хватает покупателей: из рекламы их всего 12 из 34.' },
    q2: { sec: 'idea', q: 'В анимации камера наехала на круг «купил». Что стало знаменателем и какая доля получилась?', opts: [['1 000 визитов; 12 из них в пересечении — 1,2%'], ['299 рекламных визитов; 12 купили — 4,0%'], ['34 покупателя; 12 из них из рекламы — 35%', 1], ['12 точек пересечения; все они в круге — 100%']],
      why: 'Условие «купил» выбрасывает всё вне круга покупателей, и новым «всем» становятся 34 точки. Внутри 12 пришли из рекламы: P(реклама | купил) = 12 / 34 ≈ 35%. 1,2% — вероятность пересечения без условия, знаменатель там вся тысяча. 4,0% — обратная условная вероятность, камера тогда стоит на круге «реклама». 100% получилось бы, если бы знаменателем взяли само пересечение: такая доля ничего не говорит.' },
    q3: { sec: 'check', q: 'Правило антифрода точно на 99%: ловит 99% мошеннических транзакций и ошибочно срабатывает на 1% честных. Фрод — 1% транзакций. Правило сработало. Какова вероятность, что это фрод?', opts: [['99%'], ['Около 50%', 1], ['1%'], ['Около 90%']],
      why: 'Из 10 000 транзакций мошеннических 100, правило поймает 99. Честных 9 900, и 1% из них, тоже 99, вызовут ложную сработку. Сработок 198, фрод среди них 99 — половина. 99% — чувствительность, P(сработка | фрод): это условная вероятность в обратную сторону. 1% — базовая частота, она была бы ответом, если бы правило срабатывало случайно. Около 90% получилось бы при специфичности 99,9%: тогда ложных сработок около 10.' },
    q4: { sec: 'check', q: 'Как по таблице сопряжённости «источник × покупка» проверить, что покупка не зависит от источника?', opts: [['Убедиться, что в таблице нет пустых клеток'], ['Сравнить P(купил | источник) по строкам с общей P(купил) и проверить хи-квадратом, не шум ли разница', 1], ['Сравнить число покупок по источникам: где покупок больше, там и зависимость'], ['Проверить, что доли в каждой строке в сумме дают 1']],
      why: 'Независимость означает P(купил | источник) = P(купил) для каждого источника: доли покупок по строкам одинаковы. В visits.csv они 2,4%, 3,9% и 6,0% против общих 3,4%. На выборке доли всегда немного разные, поэтому хи-квадрат сравнивает таблицу с ожидаемой при независимости и говорит, не шум ли расхождение. Число покупок зависит ещё и от размера источника: органики больше всего, и покупок там больше даже при самой низкой конверсии. Пустые клетки и суммы долей по строке ничего не говорят о связи.' },
    q5: { sec: 'check', q: 'Чем несовместные события отличаются от независимых?', opts: [['Ничем: и те и другие не влияют друг на друга'], ['Несовместные не случаются вместе, поэтому одно исключает другое: при ненулевых вероятностях они всегда зависимы', 1], ['Независимые события не могут случиться вместе'], ['Несовместные — частный случай независимых, у них P(A ∩ B) = P(A) · P(B)']],
      why: 'У несовместных событий пересечение пустое: P(A ∩ B) = 0. Если P(A) и P(B) больше нуля, то P(A) · P(B) > 0, и равенство независимости нарушено. Знание «визит из рекламы» сразу говорит, что он не из рассылки: P(рассылка | реклама) = 0 при P(рассылка) = 0,15. Это сильнейшая зависимость, а не её отсутствие. Независимые события как раз случаются вместе — с вероятностью P(A) · P(B).' },
    q6: { sec: 'code', q: 'Какое число вернёт эта строка на visits.csv?', code: 'pd.crosstab(v["source"], v["bought"], normalize="columns").loc["реклама", 1]', lang: 'python', opts: [['P(купил | реклама) ≈ 0,039'], ['P(реклама | купил) ≈ 0,347', 1], ['P(реклама ∩ купил) ≈ 0,012'], ['P(реклама) ≈ 0,298']],
      why: 'normalize="columns" делит каждую клетку на сумму её столбца. Столбец bought = 1 — все 3 376 покупок, клетка «реклама» в нём — 1 172. Получается 1 172 / 3 376 ≈ 0,347: доля рекламы среди покупателей, P(реклама | купил). P(купил | реклама) дал бы normalize="index" — деление на сумму строки. Пересечение без условия дал бы normalize="all". P(реклама) — доля строки в общем итоге, её даёт столбец margins или value_counts.' },
    q7: { sec: 'check', q: 'Конверсия органики 2,4%, рекламы 3,9%, рассылки 6,0%; доли трафика — 55%, 30% и 15%. Почему общая P(купил) = 3,4%, а не среднее трёх конверсий, 4,1%?', opts: [['Простое среднее не учитывает, сколько визитов в каждом источнике: P(купил) — среднее, взвешенное по долям трафика', 1], ['Часть покупок не попала ни в один источник'], ['Конверсии зависимы, поэтому их нельзя складывать'], ['Общая доля всегда меньше любой из частных']],
      why: 'Формула полной вероятности: P(купил) = 0,024 · 0,55 + 0,039 · 0,30 + 0,060 · 0,15 ≈ 0,034. Органики больше половины, и её низкая конверсия тянет итог вниз. Простое среднее дало бы каждому источнику одинаковый вес, как будто визитов там поровну. Покупки без источника в данных нет: у каждого визита ровно один источник. Общая доля лежит между самой низкой и самой высокой частной, а не ниже всех.' }
    },
    glossary: {
      prob: { t: 'Вероятность', en: 'probability', d: 'Число от 0 до 1: доля исходов, где событие случилось, или степень уверенности в нём.' },
      event: { t: 'Событие', en: 'event', d: 'Множество исходов, например визиты с покупкой.' },
      outcome: { t: 'Исход', en: 'outcome', d: 'Один возможный результат, например один визит.' },
      cond: { t: 'Условная вероятность', en: 'conditional probability', d: 'Вероятность A при условии B: доля A внутри B, P(A ∩ B) / P(B).' },
      bayes: { t: 'Теорема Байеса', en: "Bayes' theorem", d: 'P(B | A) = P(A | B) · P(B) / P(A): переворот условия.' },
      base: { t: 'Базовая частота', en: 'base rate', d: 'Доля события до всяких проверок, например 1% фрода.' },
      inter: { t: 'Пересечение событий', en: 'intersection, A ∩ B', d: 'Исходы, где случились оба события.' },
      union: { t: 'Объединение событий', en: 'union, A ∪ B', d: 'Исходы, где случилось хотя бы одно событие.' },
      compl: { t: 'Противоположное событие', en: 'complement', d: 'Исходы, где событие не случилось: 1 − P(A).' },
      disjoint: { t: 'Несовместные события', en: 'mutually exclusive events', d: 'События без общих исходов: P(A ∩ B) = 0.' },
      indep: { t: 'Независимые события', en: 'independent events', d: 'P(A ∩ B) = P(A) · P(B): знание об одном не меняет шанс другого.' },
      total: { t: 'Формула полной вероятности', en: 'law of total probability', d: 'P(A) = сумма P(A | Bᵢ) · P(Bᵢ) по группам, делящим всё без пересечений.' },
      prior: { t: 'Априорная вероятность', en: 'prior probability', d: 'Вероятность гипотезы до новых данных.' },
      posterior: { t: 'Апостериорная вероятность', en: 'posterior probability', d: 'Вероятность гипотезы после учёта данных.' },
      natfreq: { t: 'Натуральные частоты', en: 'natural frequencies', d: 'Вероятности числами случаев: «из 10 000 транзакций 100 мошеннических».' },
      sens: { t: 'Чувствительность', en: 'sensitivity, recall', d: 'Доля настоящих случаев, которые тест ловит.' },
      spec: { t: 'Специфичность', en: 'specificity', d: 'Доля чистых случаев, на которых тест молчит.' },
      fp: { t: 'Ложная сработка', en: 'false positive', d: 'Тест сработал, а события нет.' },
      neglect: { t: 'Игнорирование базовой частоты', en: 'base rate neglect', d: 'Судить по точности теста, забыв, как редко само событие.' },
      inverse: { t: 'Ошибка инверсии', en: "confusion of the inverse, prosecutor's fallacy", d: 'Подмена P(A | B) на P(B | A).' },
      crosstab: { t: 'Таблица сопряжённости', en: 'contingency table, crosstab', d: 'Счётчики по всем парам значений двух признаков.' },
      chi2: { t: 'Критерий хи-квадрат', en: 'chi-squared test', d: 'Насколько таблица сопряжённости далека от ожидаемой при независимости.' },
      pvalue: { t: 'p-значение', en: 'p-value', d: 'Шанс получить такое же или большее расхождение, если связи нет.' },
      sim: { t: 'Метод Монте-Карло', en: 'Monte Carlo simulation', d: 'Оценка вероятности долей в многих случайных испытаниях.' },
      bayesinf: { t: 'Байесовский вывод', en: 'Bayesian inference', d: 'Априорное распределение параметра плюс данные дают апостериорное.' },
      priordist: { t: 'Априорное распределение', en: 'prior distribution', d: 'Насколько правдоподобны значения параметра до данных.' }
    },
    materials: [
      ['da-5-1-conditional-bayes.md', 'Страница целиком в Markdown: текст, код, вопросы и глоссарий'],
      ['data/probability/', 'Учебные данные темы 05 — общий набор: здесь нужен visits.csv'],
      ['conditional_bayes.ipynb', 'Три блока кода страницы: симуляция, таблица сопряжённости, хи-квадрат'],
      ['scene_points.py', 'Пропорциональная тысяча визитов для анимации и интерактива, seed 505']
    ],
    prompts: [
      ['Знаменатель в новостях', 'Дай по одной пять фраз с процентами, как в отчётах и новостях. Я называю условную вероятность и её знаменатель, ты проверяешь и объясняешь ошибку.'],
      ['Байес на натуральных частотах', 'Задай задачу про тест на редкое событие. Я решаю её через «из 10 000…», ты проверяешь каждый шаг вопросами.'],
      ['Проверка независимости', 'Я опишу два признака из своих данных. Помоги проверить их независимость по таблице сопряжённости: подсказывай, а не решай за меня.']
    ]
  };
})();
