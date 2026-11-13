/* Аналитика 101: отметки «пройдено» на главной и в оглавлении, переключение модулей в оглавлении.
   Отметки — массив id страниц в localStorage под ключом из course.json; тот же ключ читает движок страниц. */
(() => {
  'use strict';
  const KEY = (window.A101 || {}).storageKey || 'a101-done';
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

  // Оглавление: виден один модуль. Ссылки #da и #da-03 ведут на модуль и тему, а id у секций m-da и t-da-03,
  // чтобы браузер сам не прокручивал к скрытому блоку: прокрутку делает show().
  const mods = [...document.querySelectorAll('section.mod')];
  if (mods.length) {
    const show = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      const mod = mods.find(m => m.id === `m-${h.split('-')[0]}`) || mods[0];
      mods.forEach(m => { m.hidden = m !== mod; });
      document.querySelectorAll('.chips a').forEach(a => a.setAttribute('aria-current', String(`m-${a.getAttribute('href').slice(1)}` === mod.id)));
      const topic = document.getElementById(`t-${h}`);
      if (topic) topic.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', show);
    window.addEventListener('load', () => { if (document.getElementById(`t-${location.hash.slice(1)}`)) show(); });
    show();
  }
  render();
})();
