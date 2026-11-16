/* ===================== Движок страницы учебника =====================
   Общий для всех страниц: подсказки к терминам, сноски, вопросы, меню ИИ,
   плеер сцены, блоки кода, глоссарий, материалы. Содержание страницы — в window.PAGE. */
(() => {
  'use strict';
  const P = window.PAGE;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmt = (v, d = 0) => Number(v).toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const plural = (n, f) => { const a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; };
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = () => { const s = getComputedStyle(document.documentElement), g = n => s.getPropertyValue(n).trim(); return { ink: g('--ink'), ink2: g('--ink-2'), muted: g('--muted'), line: g('--line'), line2: g('--line-2'), surface: g('--surface'), paper: g('--paper'), sunk: g('--sunk'), accent: g('--accent'), good: g('--good'), bad: g('--bad'), warn: g('--warn'), c: [1, 2, 3, 4, 5, 6, 7, 8].map(i => g(`--c${i}`)) }; };
  const BUBBLE = '<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const CHATS = [['Claude', 'https://claude.ai/new'], ['ChatGPT', 'https://chatgpt.com/'], ['Gemini', 'https://gemini.google.com/app']];

  /* ---------- уведомления, буфер, хранилище ---------- */
  let tt = 0;
  function toast(m, links) {
    const t = $('toast');
    t.innerHTML = `<div>${esc(m)}</div>${links ? `<div class="tl"><span>Открыть:</span>${CHATS.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join('')}</div>` : ''}`;
    t.hidden = false; clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, links ? 8000 : 2600);
  }
  function copy(text, ok, links) {
    const fallback = () => {
      const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); let d = false; try { d = document.execCommand('copy'); } catch (e) { d = false; } ta.remove();
      toast(d ? ok : 'Не удалось скопировать: браузер запретил доступ к буферу обмена', d && links);
    };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(ok, links), fallback); else fallback(); } catch (e) { fallback(); }
  }
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* хранилище недоступно */ } }
  };

  /* ---------- подсветка кода ---------- */
  const KW = {
    python: 'import|from|as|def|return|for|in|if|else|elif|break|continue|while|True|False|None|and|or|not|is|with|lambda|class|try|except|finally|raise|yield|pass|del|global|nonlocal|assert|async|await',
    sql: 'SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|ON|AS|AND|OR|NOT|NULL|IS|IN|LIMIT|WITH|CASE|WHEN|THEN|ELSE|END|DISTINCT|COUNT|SUM|AVG|MIN|MAX|OVER|PARTITION|UNION|ALL|INSERT|INTO|VALUES|CREATE|TABLE|UPDATE|SET|DELETE|DESC|ASC|BETWEEN|LIKE|COALESCE|CAST|OFFSET|NULLS|FIRST|LAST|FETCH|NEXT|ONLY|ILIKE|TOP|FILTER|ROLLUP|CUBE|GROUPING|SETS|ROUND|NULLIF|EXISTS|EXCEPT|INTERSECT|CROSS|USING|TRUE|FALSE|UNKNOWN|DATE_TRUNC|EXTRACT|EXPLAIN|ANALYZE|MATERIALIZED|ROWS|RANGE|GROUPS|PRECEDING|FOLLOWING|UNBOUNDED|CURRENT|ROW|INTERVAL|WINDOW|QUALIFY|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|FIRST_VALUE|LAST_VALUE|NTILE|DATE|TIMESTAMP|TEMP|TEMPORARY|LATERAL|DROP|IF',
    bash: 'cd|python|python3|pip|jupyter|ls|cat|echo|export|source'
  };
  const escC = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function hl(code, lang = 'python') {
    if (lang === 'text') return escC(code);
    const kw = KW[lang] || KW.python, flags = lang === 'sql' ? 'gi' : 'g';
    const com = lang === 'sql' ? '--.*$' : '#.*$';
    const re = new RegExp(`(${com})|([rbfRBF]{0,2}"(?:\\\\.|[^"\\\\])*"|[rbfRBF]{0,2}'(?:\\\\.|[^'\\\\])*')|(@[A-Za-z_][\\w.]*)|\\b(${kw})\\b|\\b(\\d+(?:[._]\\d+)*(?:e-?\\d+)?)\\b`, flags);
    return code.split('\n').map(line => {
      let out = '', last = 0, m;
      re.lastIndex = 0;
      while ((m = re.exec(line))) {
        out += escC(line.slice(last, m.index));
        const cls = m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'dec' : m[4] ? 'kw' : 'num';
        out += `<span class="${cls}">${escC(m[0])}</span>`;
        last = m.index + m[0].length;
        if (!m[0].length) re.lastIndex++;
      }
      return out + escC(line.slice(last));
    }).join('\n');
  }

  const API = { $, esc, fmt, clamp, plural, reduced, css, copy, toast, hl, store, BUBBLE };
  window.TB = API;

  /* ---------- блоки кода ---------- */
  const codeOut = {};
  function buildCode(box) {
    const k = box.dataset.code, C = P.code[k];
    if (!C) return;
    const badge = C.badge ? `<span class="badge${C.badgeKind ? ' ' + C.badgeKind : ''}">${esc(C.badge)}</span>` : '';
    box.innerHTML = `<div class="code-hd"><span class="t">${esc(C.title)}</span>${badge}<button type="button" class="btn ghost small" data-cc="${k}">Скопировать</button></div>
<pre class="code">${hl(C.code, C.lang)}</pre>${C.out != null ? `<div class="out one"><span class="olbl">${esc(C.outLabel || 'Вывод')}</span><pre>${esc(C.out)}</pre></div>` : ''}${C.note ? `<div class="code-note">${C.note}</div>` : ''}`;
    box.querySelector('[data-cc]').addEventListener('click', () => copy(C.code, 'Код скопирован'));
    if (C.out != null) codeOut[k] = C.out;
  }

  /* ---------- вопросы ---------- */
  const QS = P.questions || {}, QK = Object.keys(QS), QN = QK.length;
  const ANS = store.get(`${P.id}-answers`, {});
  Object.keys(ANS).forEach(k => { if (!QS[k]) delete ANS[k]; });
  function renderQ(box) {
    const id = box.dataset.q, Q = QS[id], n = QK.indexOf(id) + 1, done = ANS[id] !== undefined;
    box.innerHTML = `<div class="qn"><span>${Q.title ? esc(Q.title) : `Вопрос ${n} из ${QN}`}</span><button type="button" class="ask" data-ask="${id}">${BUBBLE}<span>${done ? 'Разобрать с ИИ' : 'Подсказка от ИИ'}</span></button></div>
<p class="q">${esc(Q.q)}</p>${Q.code ? `<pre class="code">${hl(Q.code, Q.lang)}</pre>` : ''}
<div class="choices">${Q.opts.map((o, i) => `<button type="button" class="choice" data-i="${i}"><span class="mk">${'АБВГ'[i]}</span><span>${esc(o[0])}</span></button>`).join('')}</div><div class="fbw"></div>`;
    const btns = [...box.querySelectorAll('.choice')];
    const settle = i => {
      btns.forEach((b, j) => { b.disabled = true; const ok = !!Q.opts[j][1]; if (j === i) b.classList.add(ok ? 'right' : 'wrong'); else if (ok) b.classList.add('missed'); b.querySelector('.mk').textContent = j === i ? (ok ? '✓' : '×') : 'АБВГ'[j]; });
      const ok = !!Q.opts[i][1];
      box.querySelector('.fbw').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><p><b>${ok ? 'Верно.' : `Верный ответ: «${esc(Q.opts.find(o => o[1])[0])}».`}</b> ${esc(Q.why)}</p></div>`;
    };
    if (done) settle(ANS[id]);
    btns.forEach((b, i) => b.addEventListener('click', () => { if (ANS[id] !== undefined) return; ANS[id] = i; store.set(`${P.id}-answers`, ANS); settle(i); qprog(); box.querySelector('[data-ask] span').textContent = 'Разобрать с ИИ'; }));
    box.querySelector('[data-ask]').addEventListener('click', () => copyPrompt(qPrompt(id), ANS[id] === undefined ? 'с подсказкой к вопросу' : 'с разбором вопроса'));
  }
  function qprog() { const n = Object.keys(ANS).length, ok = Object.entries(ANS).filter(([k, v]) => QS[k] && QS[k].opts[v][1]).length; const el = $('progQ'); if (el) el.textContent = `Вопросы: ${n} из ${QN}${n ? ` · верно ${ok}` : ''}`; }

  /* ---------- навигация ---------- */
  const secs = [...document.querySelectorAll('section[data-sec]')];
  let curSec = secs[0];
  $('onpage').innerHTML = secs.map(s => `<li><a href="#${s.querySelector('h2').id}" data-s="${s.dataset.sec}">${esc(s.dataset.title)}</a></li>`).join('');
  const ai = { refresh() { const n = $('aiSecName'); if (n && curSec) n.textContent = curSec.dataset.sec === 'watch' && scene ? `Анимация, шаг ${scene.current().n} из ${scene.current().total}` : `Раздел «${curSec.dataset.title}»`; } };
  const setCur = s => { curSec = s; document.querySelectorAll('#onpage a').forEach(a => a.classList.toggle('on', a.dataset.s === s.dataset.sec)); ai.refresh(); };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { es.filter(e => e.isIntersecting).forEach(e => setCur(e.target)); }, { rootMargin: '-35% 0px -60% 0px' });
    secs.forEach(s => io.observe(s));
  }
  const side = $('side'), scrim = $('scrim');
  const closeSide = () => { side.classList.remove('open'); $('menuBtn').setAttribute('aria-expanded', 'false'); scrim.hidden = true; };
  $('menuBtn').addEventListener('click', () => { side.classList.add('open'); $('menuBtn').setAttribute('aria-expanded', 'true'); scrim.hidden = false; });
  side.addEventListener('click', e => { if (e.target.closest('a')) closeSide(); });

  /* ---------- подсказки к терминам и сноски ---------- */
  const GL = P.glossary || {};
  const lc = d => d[0].toLowerCase() + d.slice(1);
  // в экспорте строчная буква только у обычного русского слова: «Python», «SQL», «A/B-тест» остаются как есть
  const lcMd = d => /^[А-ЯЁ][а-яё]/.test(d) ? lc(d) : d;
  const tip = $('tip'); let tipFor = null;
  function showTip(el) {
    const g = GL[el.dataset.g]; tip.innerHTML = g ? `<b>${esc(g.t)}</b> — ${esc(lc(g.d))}` : esc(el.dataset.tip || ''); tip.hidden = false; tipFor = el;
    const r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
    const x = clamp(r.left + r.width / 2 - tw / 2, 12, window.innerWidth - tw - 12); let y = r.bottom + 8;
    if (y + th > window.innerHeight - 8) y = r.top - th - 8;
    tip.style.left = `${x}px`; tip.style.top = `${Math.max(8, y)}px`;
  }
  const hideTip = () => { tip.hidden = true; tipFor = null; };
  document.addEventListener('pointerover', e => { const t = e.target.closest && e.target.closest('.term'); if (t && e.pointerType === 'mouse') showTip(t); });
  document.addEventListener('pointerout', e => { const t = e.target.closest && e.target.closest('.term'); if (t && e.pointerType === 'mouse') hideTip(); });
  document.addEventListener('focusin', e => { if (e.target.classList && e.target.classList.contains('term')) showTip(e.target); });
  document.addEventListener('focusout', e => { if (e.target.classList && e.target.classList.contains('term')) hideTip(); });
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('.term');
    if (t) { if (tipFor === t) hideTip(); else showTip(t); return; }
    if (tipFor) hideTip();
    const ref = e.target.closest && e.target.closest('.ref');
    if (ref) { e.preventDefault(); const li = $(ref.dataset.ref); if (li) { li.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); li.classList.add('flash'); setTimeout(() => li.classList.remove('flash'), 1600); } }
  });
  window.addEventListener('scroll', () => { if (tipFor) hideTip(); }, { passive: true });

  /* ---------- глоссарий ---------- */
  const firstUse = id => document.querySelector(`.article .term[data-g="${id}"]`);
  const secOf = el => el && el.closest('section[data-sec]');
  const secLabel = s => { const sn = s.querySelector('h2 .sn'); return `${sn ? `раздел ${sn.textContent} · ` : ''}${s.dataset.title}`; };
  function buildGlossary() {
    const box = $('gloss'); if (!box) return;
    box.innerHTML = Object.keys(GL).sort((a, b) => GL[a].t.localeCompare(GL[b].t, 'ru')).map(k => {
      const g = GL[k], el = firstUse(k), s = secOf(el);
      return `<div id="g-${k}"><dt>${esc(g.t)}<small>${esc(g.en)}</small></dt><dd>${esc(g.d)}${s ? `<br><a href="#" data-goto="${k}">→ ${esc(secLabel(s))}</a>` : ''}</dd></div>`;
    }).join('');
    box.addEventListener('click', e => {
      const a = e.target.closest('[data-goto]'); if (!a) return;
      e.preventDefault(); const el = firstUse(a.dataset.goto);
      el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1800);
    });
  }

  /* ---------- ИИ: готовые промпты ---------- */
  // заголовок страницы (h1) — тот же, что в оглавлении курса; P.title — короткое название для вкладки
  const H1 = (() => { const h = document.querySelector('#article h1'); return h ? h.textContent.replace(/\s+/g, ' ').trim() : P.title; })();
  const INTRO = `Я изучаю страницу «${H1}» курса «Аналитика 101» (${P.where}). Будь моим наставником.`;
  const RULES = `Правила:
1. Опирайся на материал ниже. Если чего-то в нём нет, скажи об этом и отвечай из общих знаний, пометив это.
2. Объясняй по-русски, коротко, на примере данных страницы: ${P.aiData}.
3. Если я спрашиваю про вопрос из раздела «Проверь себя», не называй ответ: веди вопросами, по одной подсказке за раз.
4. В конце ответа задай мне один вопрос, который проверит понимание.`;
  const txt = n => [...n.childNodes].map(c => c.nodeType === 3 ? c.textContent : c.nodeType !== 1 ? '' : c.classList.contains('ref') ? `[${c.textContent}]` : c.classList.contains('sn') ? '' : c.tagName === 'SUB' ? `_{${txt(c)}}` : c.tagName === 'SUP' ? `^{${txt(c)}}` : c.tagName === 'SMALL' ? `\n${txt(c)}` : c.tagName === 'BR' ? '\n' : txt(c)).join('');
  const clean = t => t.replace(/[ \t ]+/g, ' ').replace(/ ?\n ?/g, '\n').trim();
  const secText = s => [...s.querySelectorAll('h2, h3.sub-h, p:not(.hint):not(.note):not(.scene-hint), li, .formula, .callout, .tbl tr')].filter(el => !el.closest('.block:not(.tbl), .check, .scene, .callout p, .gloss, .matlist, .prompts, .sec-end')).map(el => el.matches('tr') ? [...el.children].map(c => clean(txt(c))).join(' | ') : clean(txt(el))).filter(Boolean).join('\n');
  const widgets = {};
  function interState(only) {
    return Object.entries(widgets).filter(([k, w]) => w && w.describe && (!only || w.sec === only)).map(([k, w]) => { const s = secOf(w.box); const d = w.describe(); return d ? `${s ? secLabel(s) : 'Интерактив'}: ${d}` : ''; }).filter(Boolean).join('\n');
  }
  const answersText = () => Object.entries(ANS).map(([k, v]) => `— ${QS[k].q} Мой ответ: «${QS[k].opts[v][0]}» (${QS[k].opts[v][1] ? 'верно' : 'неверно'}).`).join('\n');
  let scene = null;
  const stepPrompt = () => { const c = scene.current(); return `${INTRO}\n\n${RULES}\n\n=== Анимация в начале страницы, шаг ${c.n} из ${c.total} «${c.title}» ===\n${c.text}${P.scene && P.scene.aiNote ? `\n\n${P.scene.aiNote}` : ''}\n\nОбъясни этот шаг другими словами и спроси, что мне в нём непонятно.`; };
  function secPrompt(s) {
    s = s || curSec;
    if (s.dataset.sec === 'watch' && scene) return stepPrompt();
    const st = interState(s.dataset.sec);
    return `${INTRO}\n\n${RULES}\n\n=== Раздел «${s.dataset.title}» ===\n${secText(s)}${st ? `\n\n=== Что сейчас на интерактиве раздела ===\n${st}` : ''}\n\nНачни так: в двух-трёх предложениях перескажи главную мысль раздела и спроси, что мне в нём непонятно.`;
  }
  function pageMd(withCode) {
    const L = [`# ${H1}`, '', `Аналитика 101 · ${P.where}.`, '', clean(txt(document.querySelector('.lead')))];
    if (scene) { L.push('', '## Анимация по шагам'); scene.steps.forEach((s, i) => L.push('', `${i + 1}. **${s.title}.** ${s.text.replace(/\n/g, ' ')}`)); }
    secs.filter(s => s.querySelector('h2 .sn') && !['check', 'glossary', 'materials'].includes(s.dataset.sec)).forEach(s => {
      L.push('', `## ${clean(txt(s.querySelector('h2')))}`, '', secText(s).split('\n').slice(1).join('\n\n'));
      if (withCode) s.querySelectorAll('[data-code]').forEach(b => { const C = P.code[b.dataset.code]; if (C) L.push('', `**${C.title}**`, '', '```' + (C.lang || 'python'), C.code, '```', ...(C.out != null ? ['', 'Вывод:', '', '```', C.out, '```'] : [])); });
    });
    L.push('', '## Вопросы для самопроверки');
    QK.forEach((k, i) => { const Q = QS[k]; L.push('', `${i + 1}. ${Q.q}${Q.code ? `\n\n\`\`\`\n${Q.code}\n\`\`\`` : ''}`, ...Q.opts.map((o, j) => `   ${'АБВГ'[j]}) ${o[0]}`)); });
    L.push('', '## Глоссарий', '', ...Object.values(GL).sort((a, b) => a.t.localeCompare(b.t, 'ru')).map(g => `- **${g.t}**${g.en && g.en.toLowerCase() !== g.t.toLowerCase() ? ` (${g.en})` : ''} — ${lcMd(g.d)}`));
    const src = document.querySelectorAll('.sources li');
    if (src.length) L.push('', '## Источники', '', ...[...src].map((li, i) => `${i + 1}. ${clean(li.textContent)}${[...li.querySelectorAll('a')].map(a => ` ${a.href}`).join('')}`));
    return L.join('\n');
  }
  const chapterPrompt = () => `${INTRO}\n\n${RULES}\n\nНиже вся страница в Markdown.\n\n${pageMd(true)}\n\n=== Что сейчас на интерактивах ===\n${interState() || 'Интерактивы не трогал.'}\n\n=== Мои ответы на вопросы ===\n${answersText() || 'Пока не отвечал.'}\n\nНачни так: спроси, что я уже знаю по теме страницы, и предложи маршрут из 3–4 шагов. После каждого шага проверяй понимание одним вопросом.`;
  function qPrompt(id) {
    const Q = QS[id], a = ANS[id], s = document.querySelector(`section[data-sec="${Q.sec}"]`) || curSec;
    const opts = Q.opts.map((o, i) => `${'АБВГ'[i]}) ${o[0]}`).join('\n');
    const head = `${INTRO}\n\n${RULES}\n\n=== Вопрос со страницы ===\n${Q.q}${Q.code ? `\nКод:\n${Q.code}` : ''}\nВарианты:\n${opts}`;
    const ctx = `\n\n=== Раздел «${s.dataset.title}», к которому относится вопрос ===\n${secText(s)}`;
    if (a === undefined) return `${head}${ctx}\n\nЯ ещё не ответил. Не называй правильный вариант и не исключай варианты за меня. Задай наводящий вопрос, который поможет мне рассуждать самому.`;
    const ok = !!Q.opts[a][1];
    return `${head}\n\nЯ выбрал «${Q.opts[a][0]}», и это ${ok ? 'верно' : 'неверно'}. Разбор со страницы: ${Q.why}${ctx}\n\nПомоги разобраться глубже: объясни, ${ok ? 'почему остальные варианты неверны' : 'почему мой вариант не подходит и откуда берётся такая ошибка'}, и дай похожую задачу для самопроверки.`;
  }
  const copyPrompt = (text, what) => copy(text, `Промпт ${what} скопирован. Вставьте его в чат.`, true);
  API.copyPrompt = copyPrompt; API.INTRO = INTRO; API.RULES = RULES;

  const menu = $('aiMenu'), aiBtn = $('aiBtn');
  const openMenu = () => { ai.refresh(); menu.hidden = false; aiBtn.setAttribute('aria-expanded', 'true'); };
  const closeMenu = () => { menu.hidden = true; aiBtn.setAttribute('aria-expanded', 'false'); };
  aiBtn.addEventListener('click', e => { e.stopPropagation(); if (menu.hidden) openMenu(); else closeMenu(); });
  document.addEventListener('click', e => { if (!menu.hidden && !e.target.closest('.aimenu')) closeMenu(); });
  menu.addEventListener('click', e => {
    const b = e.target.closest('[data-ai]'); if (!b) { if (e.target.closest('a')) closeMenu(); return; }
    closeMenu();
    if (b.dataset.ai === 'sec') copyPrompt(secPrompt(), curSec.dataset.sec === 'watch' ? 'по шагу анимации' : `по разделу «${curSec.dataset.title}»`);
    else if (b.dataset.ai === 'chapter') copyPrompt(chapterPrompt(), 'по всей странице');
  });

  /* ---------- материалы ---------- */
  function buildMaterials() {
    const box = $('mat');
    if (box) {
      // ссылки на файлы — из карты материалов, которую build.py берёт из dist/materials/index.json
      const MAT = (window.A101 || {}).materials;
      const size = n => n >= 1048576 ? `${fmt(n / 1048576, 1)} МБ` : `${fmt(Math.max(1, Math.round(n / 1024)))} КБ`;
      const link = f => {
        if (!MAT) return '<span class="soon">—</span>';
        const set = f.match(/^data\/([\w-]+)\/$/);
        if (set && MAT.sets[set[1]]) return `<a class="dl" href="${MAT.sets[set[1]].zip}" download>архив · ${size(MAT.sets[set[1]].bytes)}</a>`;
        const it = MAT.files[f];
        return it ? `<a class="dl" href="${it.path}" download>скачать · ${size(it.bytes)}</a>` : '<span class="soon">—</span>';
      };
      const shared = (P.materials || []).some(([f]) => /^data\/[\w-]+\/$/.test(f));
      const all = MAT && MAT.zip ? `<div class="acts mat-all"><a class="btn small accent" href="${MAT.zip}" download>Скачать всё архивом · ${size(MAT.zipBytes)}</a>${shared ? '<span class="hint">Общие данные темы — отдельным архивом в списке: распакуйте его рядом с папкой страницы.</span>' : ''}</div>` : '';
      box.innerHTML = `${all}<ul class="files">${(P.materials || []).map(([f, d]) => `<li><span><code>${esc(f)}</code><small>${esc(d)}</small></span>${link(f)}</li>`).join('')}</ul>
<div class="acts"><button type="button" class="btn small" id="mdCopy">Скопировать страницу в Markdown</button><span class="hint">Текст, код, вопросы и глоссарий одним куском — для заметок или своего чата с ИИ.</span></div>`;
      $('mdCopy').addEventListener('click', () => copy(pageMd(true), 'Страница в Markdown скопирована'));
    }
    const pr = $('prompts');
    if (pr) {
      pr.innerHTML = (P.prompts || []).map(([t, p], i) => `<div class="pr"><span class="ext">${esc(t)}</span><p>${esc(p)}</p><div class="acts"><button type="button" class="btn ghost small" data-pr="${i}">Скопировать</button></div></div>`).join('');
      pr.addEventListener('click', e => { const b = e.target.closest('[data-pr]'); if (b) copy(P.prompts[+b.dataset.pr][1], 'Промпт скопирован. Вставьте его в чат блокнота NotebookLM'); });
    }
  }

  /* ---------- кнопки «Обсудить с ИИ» в тексте ---------- */
  function buildSecAsk() {
    secs.filter(s => s.querySelector('h2 .sn') && !['check', 'glossary', 'materials'].includes(s.dataset.sec)).forEach(s => {
      const d = document.createElement('div'); d.className = 'sec-end';
      d.innerHTML = `<button type="button" class="ask quiet">${BUBBLE}Обсудить раздел с ИИ</button>`;
      d.firstChild.addEventListener('click', () => copyPrompt(secPrompt(s), `по разделу «${s.dataset.title}»`));
      s.appendChild(d);
    });
  }
  /* ---------- выделение: спросить ИИ, предложить исправление ---------- */
  const selTools = $('selTools'), selAsk = $('selAsk'), selFix = $('selFix');
  document.addEventListener('mouseup', e => {
    if (e.target.closest && e.target.closest('.seltools, .menu, .fix')) return;
    setTimeout(() => {
      const s = window.getSelection(), t = s ? s.toString().trim() : '';
      const node = s && s.anchorNode, el = node && (node.nodeType === 1 ? node : node.parentElement);
      if (!t || t.length < 3 || t.length > 600 || !el || !$('article').contains(el)) { selTools.hidden = true; return; }
      selAsk.hidden = !!el.closest('.block, textarea, .scene');  // внутри интерактивов и сцены промпт по фрагменту не нужен, правка — нужна
      const r = s.getRangeAt(0).getBoundingClientRect();
      selTools.style.left = `${clamp(r.left + window.scrollX, 8, document.documentElement.clientWidth - 340)}px`; selTools.style.top = `${r.bottom + window.scrollY + 6}px`;
      selTools.hidden = false; selTools.dataset.text = t.replace(/[  ]/g, ' '); selTools.dataset.sec = (secOf(el) || curSec).dataset.sec;
    }, 0);
  });
  selAsk.addEventListener('click', () => {
    selTools.hidden = true;
    const s = document.querySelector(`section[data-sec="${selTools.dataset.sec}"]`) || curSec;
    copyPrompt(`${INTRO}\n\n${RULES}\n\nОбъясни этот фрагмент проще и на примере: «${selTools.dataset.text}»\n\n=== Раздел «${s.dataset.title}», откуда фрагмент ===\n${secText(s)}`, 'с выделенным фрагментом');
  });

  // «Предложить исправление»: окно с цитатой и полями, из него — issue на GitHub с заполненными полями
  // (шаблон .github/ISSUE_TEMPLATE/proofread.yml, параметры адреса = id полей) или отчёт в буфер обмена.
  const fixDlg = $('fixDlg');
  const cut = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  const fragLink = q => {
    const w = q.split(/\s+/);
    const f = q.length <= 100 ? encodeURIComponent(q) : `${encodeURIComponent(w.slice(0, 5).join(' '))},${encodeURIComponent(w.slice(-5).join(' '))}`;
    return `${location.href.split('#')[0]}#:~:text=${f}`;
  };
  let fixCtx = { quote: '', sec: '' };
  function fixReport() {
    const q = $('fixQuote').value.trim(), fx = $('fixText').value.trim(), note = $('fixNote').value.trim();
    const A1 = window.A101 || {}, pg = A1.page || {};
    const where = [`Страница ${pg.num || ''} «${H1}» (${P.id})`, fixCtx.sec ? `раздел «${fixCtx.sec}»` : '', q ? fragLink(q) : location.href.split('#')[0], `сборка ${A1.build || '—'}`].filter(Boolean).join('\n');
    const title = `Вычитка ${pg.num || ''} ${H1}${fixCtx.sec ? `: ${fixCtx.sec}` : ''}`.replace(/\s+/g, ' ').trim();
    return { title, where, quote: q, fix: fx, comment: note, repo: A1.repo };
  }
  function fixUrl() {
    const r = fixReport();
    if (!r.repo) return '';
    const p = new URLSearchParams({ template: 'proofread.yml', title: cut(r.title, 120), where: r.where, quote: cut(r.quote, 400), fix: cut(r.fix, 700), comment: cut(r.comment, 500) });
    return `${r.repo}/issues/new?${p}`;
  }
  const fixText = () => { const r = fixReport(); return [`# ${r.title}`, '', `Где: ${r.where.replace(/\n/g, ' · ')}`, r.quote ? `\nФрагмент:\n«${r.quote}»` : '', `\nКак должно быть:\n${r.fix || '—'}`, r.comment ? `\nКомментарий:\n${r.comment}` : ''].filter(s => s !== '').join('\n'); };
  function openFix(quote, sec) {
    if (!fixDlg || !fixDlg.showModal) return;
    fixCtx = { quote: quote || '', sec: sec || '' };
    const pg = (window.A101 || {}).page || {};
    $('fixWhere').textContent = `${pg.num || ''} ${H1}${sec ? ` · раздел «${sec}»` : ''}`.trim();
    $('fixQuote').value = fixCtx.quote; $('fixQuote').closest('label').hidden = !fixCtx.quote;
    $('fixText').value = ''; $('fixNote').value = '';
    $('fixGh').href = fixUrl(); $('fixGh').hidden = !(window.A101 || {}).repo;
    selTools.hidden = true; closeProg();
    fixDlg.showModal(); $('fixText').focus();
  }
  if (fixDlg) {
    fixDlg.addEventListener('input', () => { $('fixGh').href = fixUrl(); });
    $('fixX').addEventListener('click', () => fixDlg.close());
    fixDlg.addEventListener('click', e => { if (e.target === fixDlg) fixDlg.close(); });
    $('fixGh').addEventListener('click', e => { if (!$('fixText').value.trim()) { e.preventDefault(); $('fixText').focus(); toast('Напишите, как должно быть, — это обязательное поле'); return; } setTimeout(() => fixDlg.close(), 300); });
    $('fixCopy').addEventListener('click', () => { copy(fixText(), 'Отчёт скопирован. Отправьте его автору любым способом'); fixDlg.close(); });
    selFix.addEventListener('click', () => { const s = document.querySelector(`section[data-sec="${selTools.dataset.sec}"]`); openFix(selTools.dataset.text, s ? s.dataset.title : ''); });
  }
  /* ---------- прогресс, закладки, печать ---------- */
  // Отметки «пройдено» — массив id страниц под ключом из course.json (его же читают главная и оглавление),
  // закладки — под a101-marks, последняя открытая страница — под a101-last. Панель строится из window.A101.course.
  const A = window.A101 || {}, CR = A.course, PG = A.page || { id: P.id, title: H1, num: '', file: '' };
  const DONE_KEY = A.storageKey || 'a101-done', MARK_KEY = 'a101-marks', LAST_KEY = 'a101-last';
  const getDone = () => new Set(store.get(DONE_KEY, [])), getMarks = () => new Set(store.get(MARK_KEY, []));
  const PAGES = CR ? CR.topics.flatMap(t => t.pages) : [];
  const BYID = Object.fromEntries(PAGES.map(p => [p.id, p]));
  const hm = m => { m = Math.round(m / 5) * 5; return m < 60 ? `${m} мин` : m % 60 ? `${Math.floor(m / 60)} ч ${m % 60} мин` : `${m / 60} ч`; };
  const prog = $('prog'), progBtn = $('progBtn');
  const closeProg = () => { if (!prog) return; prog.classList.remove('open'); prog.setAttribute('aria-hidden', 'true'); progBtn.setAttribute('aria-expanded', 'false'); if (!side.classList.contains('open')) scrim.hidden = true; };
  const openProg = () => { prog.classList.add('open'); prog.setAttribute('aria-hidden', 'false'); progBtn.setAttribute('aria-expanded', 'true'); scrim.hidden = false; };
  function renderProgress() {
    const done = getDone(), marks = getMarks();
    document.querySelectorAll('[data-done]').forEach(b => { const on = done.has(b.dataset.done); b.classList.toggle('on', on); b.innerHTML = on ? '✓ Пройдено<small>снять отметку</small>' : '○ Отметить пройденной'; b.setAttribute('aria-pressed', String(on)); });
    document.querySelectorAll('[data-mark]').forEach(b => { const on = marks.has(b.dataset.mark); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Убрать из закладок' : 'В закладки'); if (b.classList.contains('btn')) b.textContent = on ? '★ В закладках' : '☆ В закладки'; else b.textContent = on ? '★' : '☆'; });
    document.querySelectorAll('.prog input[data-page]').forEach(c => { c.checked = done.has(c.dataset.page); c.closest('li').classList.toggle('done', c.checked); });
    document.querySelectorAll('.toc [data-page]').forEach(li => li.classList.toggle('done', done.has(li.dataset.page)));
    document.querySelectorAll('[data-tcnt]').forEach(el => { const ids = el.dataset.tcnt.split(' '), n = ids.filter(i => done.has(i)).length; el.textContent = `${n}/${ids.length}`; el.classList.toggle('full', n === ids.length); });
    if (!CR) return;
    const n = PAGES.filter(p => done.has(p.id)).length, total = PAGES.length;
    const mDone = PAGES.filter(p => done.has(p.id)).reduce((s, p) => s + p.minutes, 0), mAll = PAGES.reduce((s, p) => s + p.minutes, 0);
    $('progN').textContent = `${n}/${total}`;
    $('progBar').firstElementChild.style.width = `${(100 * n / total).toFixed(1)}%`;
    $('progCnt').textContent = `Пройдено ${n} из ${total} · ${hm(mDone)} из ${hm(mAll)}`;
    const ml = PAGES.filter(p => marks.has(p.id));
    $('progMarks').innerHTML = ml.length
      ? ml.map(p => `<li><span class="pn">${p.num}</span>${p.id === PG.id ? `<span class="lt">${esc(p.title)}</span>` : `<a class="lt" href="${p.file}.html">${esc(p.title)}</a>`}<button type="button" class="mk" data-mark="${p.id}" aria-label="Убрать из закладок">★</button></li>`).join('')
      : '<li class="empty">Закладок пока нет. Звёздочка ☆ у страницы добавит её сюда.</li>';
    $('progMarks').querySelectorAll('[data-mark]').forEach(b => { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); });
  }
  function buildProgress() {
    if (!prog || !CR) { if (progBtn) progBtn.hidden = true; return; }
    store.set(LAST_KEY, { id: PG.id, file: PG.file, num: PG.num, title: PG.title });
    const row = p => `<li class="${p.id === PG.id ? 'here' : ''}"><input type="checkbox" data-page="${p.id}" aria-label="Пройдено: ${p.num} ${esc(p.title)}"><span class="pn">${p.num}</span>${p.id === PG.id ? `<span class="lt">${esc(p.title)}</span>` : `<a class="lt" href="${p.file}.html">${esc(p.title)}</a>`}<span class="pm">${p.minutes ? `≈ ${p.minutes} мин` : ''}</span><button type="button" class="mk" data-mark="${p.id}">☆</button></li>`;
    prog.innerHTML = `<div class="prog-hd"><b>Мой прогресс</b><button type="button" class="prog-x" id="progX" aria-label="Закрыть">✕</button></div>
<div class="prog-body">
<section class="prog-page"><p class="eyebrow">Эта страница</p><h4>${esc(PG.num)} ${esc(PG.title)}</h4>
<div class="acts"><button type="button" class="btn small done-btn" data-done="${PG.id}"></button><button type="button" class="btn ghost small" data-mark="${PG.id}"></button></div>
<p class="hint" id="progQ"></p></section>
<section><p class="eyebrow">Модуль «${esc(CR.name)}»</p><div class="bar" id="progBar"><i></i></div><p class="hint" id="progCnt"></p></section>
<section><p class="eyebrow">Закладки</p><ul class="prog-list" id="progMarks"></ul></section>
<section><p class="eyebrow">Программа модуля</p>
${CR.topics.map(t => `<details class="prog-t"${t.pages.some(p => p.id === PG.id) ? ' open' : ''}><summary><b class="n">${t.n}</b><span>${esc(t.name)}</span><small data-tcnt="${t.pages.map(p => p.id).join(' ')}"></small></summary><ul class="prog-list">${t.pages.map(row).join('')}</ul></details>`).join('')}
<p class="hint"><a href="course.html#${CR.key}">Оглавление курса →</a></p></section>
<section class="prog-tools"><div class="acts"><button type="button" class="btn ghost small" id="printBtn">Версия для печати</button><button type="button" class="btn ghost small" id="fixBtn">Сообщить об ошибке</button></div><span class="hint">Печать: текст, код и вопросы без сцены и интерактивов. Нашли опечатку в тексте? Выделите её и нажмите «Предложить исправление».</span></section>
<p class="note">Отметки и закладки хранятся только в этом браузере.</p>
</div>`;
    const nav = document.createElement('nav'); nav.className = 'page-end'; nav.setAttribute('aria-label', 'Соседние страницы');
    nav.innerHTML = `${A.prev ? `<a class="pe prev" href="${A.prev.file}.html"><small>← Предыдущая</small><span>${esc(A.prev.num)} ${esc(A.prev.title)}</span></a>` : '<span></span>'}
<button type="button" class="btn done-btn" data-done="${PG.id}"></button>
${A.next ? `<a class="pe next" href="${A.next.file}.html"><small>Следующая →</small><span>${esc(A.next.num)} ${esc(A.next.title)}</span></a>` : `<a class="pe next" href="course.html#${CR.key}"><small>Дальше →</small><span>Оглавление курса</span></a>`}`;
    $('article').appendChild(nav);
    progBtn.addEventListener('click', () => (prog.classList.contains('open') ? closeProg() : openProg()));
    $('progX').addEventListener('click', closeProg);
    $('printBtn').addEventListener('click', () => { closeProg(); window.print(); });
    $('fixBtn').addEventListener('click', () => openFix('', curSec ? curSec.dataset.title : ''));
    document.addEventListener('click', e => {
      const d = e.target.closest('[data-done]'), m = e.target.closest('[data-mark]');
      if (d) { const s = getDone(); if (s.has(d.dataset.done)) s.delete(d.dataset.done); else s.add(d.dataset.done); store.set(DONE_KEY, [...s]); renderProgress(); toast(s.has(d.dataset.done) ? 'Страница отмечена пройденной' : 'Отметка снята'); }
      else if (m) { const s = getMarks(); if (s.has(m.dataset.mark)) s.delete(m.dataset.mark); else s.add(m.dataset.mark); store.set(MARK_KEY, [...s]); renderProgress(); toast(s.has(m.dataset.mark) ? `Закладка: ${BYID[m.dataset.mark] ? BYID[m.dataset.mark].num + ' ' + BYID[m.dataset.mark].title : 'добавлена'}` : 'Закладка убрана'); }
    });
    prog.addEventListener('change', e => { const c = e.target.closest('input[data-page]'); if (!c) return; const s = getDone(); if (c.checked) s.add(c.dataset.page); else s.delete(c.dataset.page); store.set(DONE_KEY, [...s]); renderProgress(); });
    prog.addEventListener('click', e => { if (e.target.closest('a[href]')) closeProg(); });
    window.addEventListener('storage', e => { if (e.key === DONE_KEY || e.key === MARK_KEY) renderProgress(); });
    renderProgress(); qprog();
  }

  scrim.addEventListener('click', () => { closeSide(); closeProg(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { hideTip(); closeMenu(); closeSide(); closeProg(); } });

  /* ---------- сцена: плеер по шагам ---------- */
  // P.scene = { parts:[{n,name,s:[i…]}], steps:[{title, body, dur, next?}], hud:[{id,label}], legend, info,
  //             mount(stageEl, api) → { render(k, p) } }   p — прогресс шага от 0 до 1
  function buildScene(root) {
    const S = P.scene, CH = S.parts, STEPS = S.steps;
    root.innerHTML = `<div class="sc-grid">
<div class="sc-panel"><div class="sc-meta"><span class="sc-ch" id="sc-ch"></span><span id="sc-n"></span></div><h3 id="sc-title"></h3><div class="sc-body" id="sc-body"></div>
<button type="button" class="sc-ask" id="sc-ask">${BUBBLE.replace('13', '14').replace('13', '14')}Обсудить этот шаг с ИИ</button>
<div class="sc-nav"><button type="button" class="sc-back" id="sc-back">← Назад</button><button type="button" class="sc-next" id="sc-next"><small>Далее</small><span id="sc-nt"></span><b aria-hidden="true">→</b></button></div></div>
<div class="sc-stage" id="sc-stage"><div class="sc-html" id="sc-html"></div>
<div class="sc-hud">${(S.hud || []).map(h => `<div class="hb"><span>${esc(h.label)}</span><b id="sc-h-${h.id}">—</b><small id="sc-hs-${h.id}"></small></div>`).join('')}</div>
<div class="sc-foot"><div class="sc-leg">${S.legend || ''}</div>
<div class="sc-player"><button type="button" id="sc-pause" aria-label="Пауза">❚❚</button><span class="sc-speed" role="group" aria-label="Скорость"><button type="button" data-sp="0.5">0.5×</button><button type="button" data-sp="1" aria-pressed="true">1×</button><button type="button" data-sp="2">2×</button></span><button type="button" id="sc-replay" aria-label="Повторить шаг">↺<span class="rp"> Повторить</span></button><button type="button" id="sc-fs" aria-label="На весь экран">⤢<span class="rp"> На весь экран</span></button></div></div>
<button type="button" class="sc-close" id="sc-close">✕ Свернуть<small>Esc</small></button>
<div class="sc-info"><div><span>${esc(P.short || '')}</span><b>${esc(S.info || '')}</b></div><div><span id="sc-i3"></span><b id="sc-i4"></b></div></div>
</div></div>
<div class="sc-bar" id="sc-bar">${CH.map(c => `<div class="sc-cb"><span class="sc-cn"><b>${c.n}</b><span class="nm">${esc(c.name)}</span></span><span class="sc-segs">${c.s.map(s => `<button type="button" class="sc-sg" data-s="${s}" aria-label="Шаг ${s + 1}"><i></i></button>`).join('')}</span></div>`).join('')}</div>`;
    const $s = id => root.querySelector('#' + id);
    const hud = (id, v, small) => { const b = $s('sc-h-' + id); if (b) b.textContent = v; const sm = $s('sc-hs-' + id); if (sm) sm.textContent = small || ''; };
    const view = S.mount($s('sc-html'), Object.assign({ hud }, API));
    const chOf = k => CH.find(c => c.s.includes(k)) || CH[0];
    let cur = 0, t = 0, last = 0, raf = 0, speed = 1, paused = false, seen = false;
    function panel() {
      const st = STEPS[cur], ch = chOf(cur);
      $s('sc-ch').textContent = `Часть ${ch.n} · ${ch.name}`;
      $s('sc-n').textContent = `${String(cur + 1).padStart(2, '0')} / ${STEPS.length}`;
      $s('sc-title').textContent = st.title; $s('sc-body').innerHTML = st.body;
      $s('sc-back').disabled = cur === 0;
      $s('sc-nt').textContent = cur < STEPS.length - 1 ? STEPS[cur + 1].title : (st.next || 'Читать страницу');
      $s('sc-i3').textContent = `${String(cur + 1).padStart(2, '0')}/${STEPS.length}`; $s('sc-i4').textContent = st.title.toUpperCase();
      root.querySelectorAll('.sc-cb').forEach((el, k) => el.classList.toggle('on', CH[k] === ch));
    }
    function bar() { root.querySelectorAll('.sc-sg').forEach(b => { const k = +b.dataset.s; b.querySelector('i').style.width = k < cur ? '100%' : k > cur ? '0%' : `${Math.min(100, t / STEPS[cur].dur * 100)}%`; b.classList.toggle('now', k === cur); }); }
    function frame(now) {
      if (!paused) t += (now - last) * speed; last = now;
      const d = STEPS[cur].dur;
      view.render(cur, t >= d ? 1 : t / d); bar();
      root.classList.toggle('sc-done', t >= d);
      if (t < d) raf = requestAnimationFrame(frame); else raf = 0;
    }
    function go(k, instant) {
      seen = true; cur = clamp(k, 0, STEPS.length - 1); t = instant || reduced() ? Infinity : 0; panel(); root.classList.remove('sc-done');
      cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
      $s('sc-pause').textContent = '❚❚'; paused = false; ai.refresh();
    }
    $s('sc-next').addEventListener('click', () => { if (cur < STEPS.length - 1) go(cur + 1); else { let nx = root.nextElementSibling; if (nx && nx.classList.contains('scene-hint')) nx = nx.nextElementSibling; if (nx) nx.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    $s('sc-back').addEventListener('click', () => go(cur - 1));
    $s('sc-replay').addEventListener('click', () => go(cur));
    $s('sc-pause').addEventListener('click', () => { paused = !paused; $s('sc-pause').textContent = paused ? '▶' : '❚❚'; $s('sc-pause').setAttribute('aria-label', paused ? 'Продолжить' : 'Пауза'); if (!paused && !raf && t < STEPS[cur].dur) { last = performance.now(); raf = requestAnimationFrame(frame); } });
    root.querySelectorAll('.sc-speed button').forEach(b => b.addEventListener('click', () => { speed = +b.dataset.sp; root.querySelectorAll('.sc-speed button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }));
    root.querySelectorAll('.sc-sg').forEach(b => b.addEventListener('click', () => go(+b.dataset.s)));
    let inView = false;
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { inView = es[0].isIntersecting; if (inView && !seen) { seen = true; go(0); } }, { threshold: 0.35 }).observe(root);
    else go(0);
    document.addEventListener('keydown', e => {
      if (!inView || e.defaultPrevented || /input|textarea|select/i.test(e.target.tagName) || (e.target.closest && e.target.closest('.block, [contenteditable]'))) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); if (cur < STEPS.length - 1) go(cur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });
    panel(); view.render(0, 0); bar();
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (!raf) { const d = STEPS[cur].dur; view.render(cur, t >= d ? 1 : t / d); } }).observe(root);

    // Полный экран: сцена раскрывается на весь экран, когда читатель доскролливает до неё (один раз за страницу),
    // и по кнопке в плеере. Выход — кнопка «Свернуть», Esc или та же кнопка плеера. Пока сцена раскрыта, страница
    // под ней не прокручивается; на месте сцены стоит заглушка той же высоты, поэтому текст не сдвигается.
    const ph = document.createElement('div'); ph.className = 'sc-ph'; ph.hidden = true; root.insertAdjacentElement('afterend', ph);
    const html = document.documentElement;
    let fs = false, fsTimer = 0, autoDone = false, scrolled = false;
    const box = (r) => { root.style.top = `${r.top}px`; root.style.left = `${r.left}px`; root.style.width = `${r.width}px`; root.style.height = `${r.height}px`; };
    const fsLabel = () => { $s('sc-fs').setAttribute('aria-label', fs ? 'Свернуть' : 'На весь экран'); $s('sc-fs').innerHTML = fs ? '⤡<span class="rp"> Свернуть</span>' : '⤢<span class="rp"> На весь экран</span>'; };
    function enterFs() {
      if (fs) return;
      fs = true; clearTimeout(fsTimer);
      const r = root.getBoundingClientRect();
      ph.style.height = `${r.height}px`; ph.hidden = false;
      const sbw = window.innerWidth - html.clientWidth;
      html.style.setProperty('--sbw', `${sbw}px`); html.classList.add('sc-lock');
      root.classList.add('fs'); box(r);
      void root.offsetWidth;  // зафиксировать стартовые размеры, затем анимировать к экрану
      root.classList.add('fs-on'); box({ top: 0, left: 0, width: html.clientWidth, height: window.innerHeight });
      fsLabel(); $s('sc-close').focus({ preventScroll: true });
    }
    function exitFs() {
      if (!fs) return;
      fs = false; clearTimeout(fsTimer);
      const r = ph.getBoundingClientRect();
      root.classList.remove('fs-on'); box(r);
      const done = () => {
        root.classList.remove('fs'); root.style.cssText = ''; ph.hidden = true;
        html.classList.remove('sc-lock'); html.style.removeProperty('--sbw');
      };
      fsTimer = setTimeout(done, 520);
      fsLabel();
    }
    window.addEventListener('resize', () => { if (fs) box({ top: 0, left: 0, width: html.clientWidth, height: window.innerHeight }); });
    $s('sc-fs').addEventListener('click', () => (fs ? exitFs() : enterFs()));
    $s('sc-close').addEventListener('click', exitFs);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && fs) { e.preventDefault(); exitFs(); } });
    window.addEventListener('scroll', () => { scrolled = true; }, { passive: true, once: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => {
      if (es[0].isIntersecting && !autoDone && !fs && scrolled && !reduced() && !document.hidden) { autoDone = true; enterFs(); }
    }, { threshold: 0.6 }).observe(root);
    const plain = h => { const t = document.createElement('textarea'); t.innerHTML = h.replace(/<li>/g, '\n- ').replace(/<\/(p|ul)>/g, '\n').replace(/<[^>]+>/g, ''); return t.value.replace(/[\u00a0\u202f]/g, ' ').replace(/\n{2,}/g, '\n').trim(); };
    $s('sc-ask').addEventListener('click', () => copyPrompt(stepPrompt(), 'по шагу анимации'));
    return { go, steps: STEPS.map(s => ({ title: s.title, text: plain(s.body) })), current: () => ({ n: cur + 1, total: STEPS.length, title: STEPS[cur].title, text: plain(STEPS[cur].body) }) };
  }

  /* ---------- сборка ---------- */
  if (P.scene && $('scene')) scene = buildScene($('scene'));
  document.querySelectorAll('[data-code]').forEach(buildCode);
  document.querySelectorAll('[data-w]').forEach(box => {
    const f = P.widgets && P.widgets[box.dataset.w];
    if (!f) return;
    const w = f(box, API) || {};
    w.box = box; w.sec = (secOf(box) || {}).dataset ? secOf(box).dataset.sec : null;
    widgets[box.dataset.w] = w;
  });
  document.querySelectorAll('.check[data-q]').forEach(renderQ);
  buildGlossary(); buildMaterials(); buildSecAsk(); buildProgress();
  const tst = $('toast');
  tst.addEventListener('pointerenter', () => clearTimeout(tt));
  tst.addEventListener('pointerleave', () => { tt = setTimeout(() => { tst.hidden = true; }, 2500); });
  qprog(); setCur(secs[0]);
  if (P.start) P.start(API);
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', () => Object.values(widgets).forEach(w => w.redraw && w.redraw()));
})();
