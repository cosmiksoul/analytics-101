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
  render();
})();
