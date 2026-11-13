// node tools/shot.js <standalone.html> <prefix> '[".sel1", ".sel2"]'
// Считает слова (без кода и кнопок), снимает сцену на шагах 0, середина, последний и первый интерактив после кликов.
const { chromium } = require('playwright');
(async () => {
  const [file, prefix, clicks] = process.argv.slice(2);
  const b = await chromium.launch();
  for (const [w, h, tag] of [[1280, 860, 'd'], [360, 780, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.goto('file://' + file); await p.addStyleTag({ content: '.top{position:static!important}' }); await p.waitForTimeout(500);
    if (tag === 'd') {
      const words = await p.evaluate(() => { const a = document.querySelector('.article').cloneNode(true); a.querySelectorAll('pre,.code-hd,.out,.code-note,.sc-hud,.sc-foot,.sc-info,.sc-bar,.sc-nav,.sc-ask,.ask,button,.dl,.mat-all,.soon').forEach(x => x.remove()); return a.innerText.split(/\s+/).filter(Boolean).length; });
      console.log('слов (сцена, текст, вопросы, глоссарий; без кода и кнопок):', words);
    }
    const n = await p.$$eval('.sc-sg', x => x.length);
    const sc = await p.$('#scene');
    for (const k of [0, Math.floor(n / 2), n - 1]) { await p.click(`.sc-sg[data-s="${k}"]`); await p.waitForTimeout(250); await sc.screenshot({ path: `${prefix}-${tag}-scene${k}.png` }); }
    const w0 = await p.$('[data-w]');
    if (w0) { for (const s of JSON.parse(clicks || '[]')) { try { await p.click(s, { timeout: 2000 }); } catch (e) { console.log('не нажалось:', s); } } await w0.scrollIntoViewIfNeeded(); await w0.screenshot({ path: `${prefix}-${tag}-widget.png` }); }
    await p.close();
  }
  await b.close();
})();
