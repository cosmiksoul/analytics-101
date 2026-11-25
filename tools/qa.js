// QA страницы: ошибки консоли, все шаги сцены, клики по интерактиву, вопрос, 360 px, термины без словаря, битые ссылки на сноски
const { chromium } = require('playwright');
(async () => {
  const file = process.argv[2], shots = process.argv[3] || '';
  const b = await chromium.launch();
  const out = {};
  for (const [w, h, name] of [[1440, 900, 'desk'], [360, 780, 'mob']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
    await p.goto('file://' + file, { waitUntil: 'load' }); await p.waitForTimeout(800);
    // шаги сцены
    const nSteps = await p.$$eval('.sc-sg', x => x.length);
    for (let i = 0; i < nSteps; i++) { await p.click(`.sc-sg[data-s="${i}"]`); await p.waitForTimeout(120); await p.evaluate(() => { const r = document.getElementById('sc-replay'); }); }
    // финал каждого шага мгновенно: эмулируем reduced? просто ждём последнего
    await p.waitForTimeout(4500);
    const info = await p.evaluate(() => {
      const G = window.PAGE.glossary || {};
      const terms = [...document.querySelectorAll('.term')].map(t => t.dataset.g);
      const missingTerms = [...new Set(terms.filter(g => !G[g]))];
      const unusedGloss = Object.keys(G).filter(k => !terms.includes(k));
      const refs = [...document.querySelectorAll('.ref')].map(r => r.dataset.ref).filter(id => !document.getElementById(id));
      const ids = [...document.querySelectorAll('[data-q]')].map(x => x.dataset.q).filter(q => !window.PAGE.questions[q]);
      const art = document.querySelector('.article');
      const body = art.cloneNode(true); body.querySelectorAll('script,.block,.check,.scene,.gloss,.matlist,.prompts,pre,.sources').forEach(x => x.remove());
      const words = body.innerText.split(/\s+/).filter(Boolean).length;
      return { scrollW: document.documentElement.scrollWidth, missingTerms, unusedGloss, badRefs: refs, badQ: ids, words, qprog: document.getElementById('progQ').textContent, scTitle: document.getElementById('sc-title').textContent };
    });
    // Завершаем сцену сначала во весь экран, затем на странице.
    if (!await p.locator('#scene.fs-on').count()) await p.click('#sc-fs');
    for (let attempt = 0; attempt < 2; attempt++) {
      await p.click('#sc-next');
      await p.waitForFunction(() => {
        const text = document.querySelector('.scene-hint + *');
        if (!text || document.activeElement !== text || document.querySelector('#scene.fs, html.sc-lock')) return false;
        const top = text.getBoundingClientRect().top;
        return top >= document.querySelector('.top').getBoundingClientRect().bottom && top < innerHeight / 2;
      });
    }
    await p.click('.check .choice >> nth=0'); await p.waitForTimeout(100);
    info.qprogAfter = await p.$eval('#progQ', e => e.textContent);
    if (shots) { await p.screenshot({ path: `${shots}-${name}.png`, fullPage: false }); }
    info.errs = errs; out[name] = info; await p.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
