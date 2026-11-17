/* Аналитика 101: отметки «пройдено» на главной и в оглавлении, переключение модулей в оглавлении, боковина на телефоне.
   Отметки — массив id страниц в localStorage под ключом из course.json; тот же ключ читает движок страниц. */
(() => {
  'use strict';
  const KEY = (window.A101 || {}).storageKey || 'a101-done';
  const $ = id => document.getElementById(id);
  const load = () => {
    try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return new Set(Array.isArray(v) ? v : []); }
    catch (e) { return new Set(); }
  };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch (e) { /* хранилище недоступно */ } };
  let done = load();

  // Счётчики: data-pages — id страниц через пробел, data-fmt — шаблон с {n} и {t}; полоса — .bar с data-pages.
  const render = () => {
    document.querySelectorAll('input[data-page]').forEach(c => {
      c.checked = done.has(c.dataset.page);
      c.closest('li').classList.toggle('done', c.checked);
    });
    document.querySelectorAll('[data-pages]').forEach(el => {
      const ids = el.dataset.pages.split(' ');
      const n = ids.filter(id => done.has(id)).length;
      if (el.classList.contains('bar')) { el.firstElementChild.style.width = `${(100 * n / ids.length).toFixed(1)}%`; return; }
      if (el.dataset.hideZero !== undefined) el.hidden = n === 0;
      el.textContent = (el.dataset.fmt || '{n} из {t}').replace('{n}', n).replace('{t}', ids.length);
      el.classList.toggle('full', n === ids.length);
    });
  };

  document.addEventListener('change', e => {
    const c = e.target.closest('input[data-page]');
    if (!c) return;
    done = load();
    if (c.checked) done.add(c.dataset.page); else done.delete(c.dataset.page);
    save(done);
    render();
  });
  window.addEventListener('storage', e => { if (e.key === KEY) { done = load(); render(); } });

  // Закладки (a101-marks): звёздочки у страниц в оглавлении и список в боковине. Названия берём из строк оглавления.
  const MARKS = 'a101-marks';
  const marks = () => { try { const v = JSON.parse(localStorage.getItem(MARKS) || '[]'); return new Set(Array.isArray(v) ? v : []); } catch (e) { return new Set(); } };
  const renderMarks = () => {
    const m = marks();
    document.querySelectorAll('[data-mark]').forEach(b => { const on = m.has(b.dataset.mark); b.classList.toggle('on', on); b.textContent = on ? '★' : '☆'; b.setAttribute('aria-label', on ? 'Убрать из закладок' : 'В закладки'); });
    document.querySelectorAll('.side-marks').forEach(box => {
      const mod = box.closest('.side-mod');
      const rows = [...document.querySelectorAll(`#m-${mod.dataset.mod} .lesson`)].filter(li => m.has(li.querySelector('input[data-page]').dataset.page));
      box.hidden = rows.length === 0;
      box.querySelector('ul').innerHTML = rows.map(li => { const a = li.querySelector('.lt'); return `<li><a href="${a.getAttribute('href')}"><b class="n">${li.querySelector('.pn').textContent}</b>${a.textContent}</a></li>`; }).join('');
    });
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-mark]'); if (!b) return;
    const m = marks(); if (m.has(b.dataset.mark)) m.delete(b.dataset.mark); else m.add(b.dataset.mark);
    try { localStorage.setItem(MARKS, JSON.stringify([...m])); } catch (err) { /* хранилище недоступно */ }
    renderMarks();
  });
  window.addEventListener('storage', e => { if (e.key === MARKS) renderMarks(); });
  renderMarks();

  // Главная: «Продолжить» ведёт на последнюю открытую страницу (a101-last пишет движок страниц).
  const resume = document.getElementById('resume');
  if (resume) {
    try {
      const last = JSON.parse(localStorage.getItem('a101-last') || 'null');
      if (last && last.file) { resume.href = `${last.file}.html`; resume.textContent = `Продолжить: ${last.num} ${last.title}`; resume.hidden = false; }
    } catch (e) { /* нет данных */ }
  }

  // Боковина на узком экране: кнопка «Содержание», затемнение, Escape — как на страницах курса.
  const side = $('side'), scrim = $('scrim'), menuBtn = $('menuBtn');
  const closeSide = () => {
    if (!side) return;
    side.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    if (scrim) scrim.hidden = true;
  };
  if (side && menuBtn) {
    menuBtn.addEventListener('click', () => { side.classList.add('open'); menuBtn.setAttribute('aria-expanded', 'true'); if (scrim) scrim.hidden = false; });
    side.addEventListener('click', e => { if (e.target.closest('a')) closeSide(); });
    if (scrim) scrim.addEventListener('click', closeSide);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSide(); });
  }

  // Оглавление: виден один модуль и его темы в боковине. Ссылки #da и #da-03 ведут на модуль и тему, а id у секций
  // m-da и t-da-03, чтобы браузер сам не прокручивал к скрытому блоку: прокрутку делает show().
  const mods = [...document.querySelectorAll('section.mod')];
  if (mods.length) {
    const crumbs = $('crumbs');
    const show = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      const mod = mods.find(m => m.dataset.mod === h.split('-')[0]) || mods[0];
      const key = mod.dataset.mod;
      mods.forEach(m => { m.hidden = m !== mod; });
      document.querySelectorAll('.side-mod').forEach(s => { s.hidden = s.dataset.mod !== key; });
      document.querySelectorAll('.blocks a').forEach(a => a.classList.toggle('on', a.dataset.mod === key));
      if (crumbs) crumbs.textContent = `Оглавление · ${mod.dataset.name}`;
      const topic = $(`t-${h}`);
      if (topic) topic.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', show);
    window.addEventListener('load', () => { if ($(`t-${location.hash.slice(1)}`)) show(); });
    show();
  }
  // Главная: анимация JOIN рядом с примером страницы. Состояние считается из номера такта, поэтому цикл детерминирован.
  // Такты: по одному на заказ (подсветка пары и строка результата), затем пауза с итогом; INNER и LEFT JOIN по очереди.
  const jl = $('joinL');
  if (jl) {
    const orders = [['o-101', 1], ['o-102', 2], ['o-103', 2], ['o-104', 5]];
    const customers = [[1, 'Аня'], [2, 'Борис'], [3, 'Вера']];
    const kinds = [
      { name: 'INNER JOIN', keepMiss: false, note: 'Заказ без покупателя в результат не попадает', total: 'INNER JOIN: 3 строки из 4 заказов' },
      { name: 'LEFT JOIN', keepMiss: true, note: 'Заказ без покупателя остаётся, вместо имени — NULL', total: 'LEFT JOIN: 4 строки, у одной NULL' },
    ];
    const PAUSE = 2, PER = orders.length + PAUSE;
    const jr = $('joinR'), out = $('joinOut'), kindEl = $('joinKind'), note = $('joinNote'), cnt = $('joinCnt');
    const esc = v => String(v).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const draw = tick => {
      const k = kinds[Math.floor(tick / PER) % kinds.length];
      const step = tick % PER, cur = step < orders.length ? step : -1, shown = Math.min(step, orders.length);
      kindEl.textContent = k.name;
      jl.innerHTML = orders.map(([id, c], i) => {
        const match = customers.some(x => x[0] === c);
        const cls = i === cur ? (match ? 'hot' : 'miss') : i < shown ? 'dim' : '';
        return `<tr class="${cls}"><td>${esc(id)}</td><td>${c}</td></tr>`;
      }).join('');
      const curKey = cur >= 0 ? orders[cur][1] : null;
      jr.innerHTML = customers.map(([c, n]) => `<tr class="${c === curKey ? 'hot' : ''}"><td>${c}</td><td>${esc(n)}</td></tr>`).join('');
      const rows = [];
      orders.slice(0, shown).forEach(([id, c], i) => {
        const m = customers.find(x => x[0] === c);
        if (m) rows.push(`<tr class="${i === cur ? 'new' : ''}"><td>${esc(id)}</td><td>${c}</td><td>${esc(m[1])}</td></tr>`);
        else if (k.keepMiss) rows.push(`<tr class="${i === cur ? 'new' : ''}"><td>${esc(id)}</td><td>${c}</td><td class="null">NULL</td></tr>`);
      });
      out.innerHTML = rows.join('');
      cnt.textContent = `строк: ${rows.length}`;
      if (cur < 0) note.textContent = k.total;
      else if (!customers.some(x => x[0] === curKey)) note.textContent = `customer_id = ${curKey}: такого покупателя нет`;
      else note.textContent = `customer_id = ${curKey}: пара найдена, строка в результат`;
    };
    let tick = 0;
    draw(tick);
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) { draw(PER - 1); }
    else {
      let timer = null;
      const start = () => { if (!timer) timer = setInterval(() => { tick += 1; draw(tick); }, 1100); };
      const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? start() : stop())), { threshold: .2 }).observe(jl.closest('.join'));
      } else start();
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    }
  }

  render();
})();
