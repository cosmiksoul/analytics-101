// Экспорт страницы в Markdown — тот же текст, что даёт кнопка «Скопировать страницу в Markdown».
// node tools/export_md.js <абсолютный путь к standalone.html> <куда.md> [--review]
// --review добавляет разборы вопросов, бейджи кода, материалы и промпты: удобно для вычитки.
// --notebook добавляет верные ответы и разборы вопросов: версия для блокнота темы в NotebookLM.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [file, out, flag] = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await pg.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: t => { window.__md = t; return Promise.resolve(); } } });
  });
  await pg.goto('file://' + file);
  await pg.waitForTimeout(600);
  await pg.evaluate(() => document.getElementById('mdCopy').click());
  await pg.waitForTimeout(200);
  let md = await pg.evaluate(() => window.__md);
  if (flag === '--review') {
    md += await pg.evaluate(() => {
      const P = window.PAGE, L = ['', '', '---', '', '# Служебное для вычитки'];
      L.push('', '## Разборы вопросов');
      Object.entries(P.questions || {}).forEach(([k, Q]) => {
        L.push('', `**${k}.** ${Q.q}`, ...Q.opts.map((o, j) => `   ${'АБВГ'[j]}) ${o[0]}${o[1] ? '  ← верно' : ''}`), `   Разбор: ${Q.why}`);
      });
      L.push('', '## Блоки кода: заголовок · бейдж · язык');
      Object.entries(P.code || {}).forEach(([k, C]) => L.push(`- ${k}: ${C.title} · ${C.badge || '—'} · ${C.lang || 'python'}${C.note ? ` · примечание: ${C.note}` : ''}${C.outLabel ? ` · подпись вывода: ${C.outLabel}` : ''}`));
      L.push('', '## Материалы');
      (P.materials || []).forEach(([f, d]) => L.push(`- ${f} — ${d}`));
      L.push('', '## Промпты');
      (P.prompts || []).forEach(([t, p]) => L.push(`- ${t}: ${p}`));
      L.push('', '## Пилюли и подписи интерактивов');
      L.push([...document.querySelectorAll('.pills span, .pill')].map(e => e.textContent.trim()).join(' · '));
      document.querySelectorAll('.block[data-w]').forEach(w => { const h = w.querySelector('.bh, header, h4'); const hint = w.querySelector('.hint, .note'); L.push(`- [${w.dataset.w}] ${h ? h.textContent.replace(/\s+/g, ' ').trim() : ''} — ${hint ? hint.textContent.replace(/\s+/g, ' ').trim() : ''}`); });
      return L.join('\n');
    });
  }
  if (flag === '--notebook') {
    md += await pg.evaluate(() => {
      const P = window.PAGE, L = ['', '## Ответы и разборы вопросов для самопроверки', '',
        'Верные ответы и разборы к вопросам выше. На странице курса они открываются после того, как читатель выбрал ответ.'];
      Object.values(P.questions || {}).forEach((Q, i) => {
        const j = Q.opts.findIndex(o => o[1]);
        L.push('', `${i + 1}. ${Q.q}`, '', `   Верный ответ: ${'АБВГ'[j]}) ${Q.opts[j][0]}`, '', `   Разбор: ${Q.why}`);
      });
      return L.join('\n');
    });
  }
  fs.writeFileSync(out, md);
  console.log(out, md.length);
  await b.close();
})();
