// Проверка настоящим plotly.js (вызывает data/build_code.py): текст подсказки, ось Y при анимации без range_y и свайп на эмуляции телефона.
// node data/check_browser.js <папка с _hover_check.html, _anim_check.html, _touch_zoom.html, _touch_off.html>
const { chromium, devices } = require('playwright');
const { pathToFileURL } = require('node:url');
const { join } = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const dir = process.argv[2], res = {};
  const file = name => pathToFileURL(join(dir, name)).href;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 600 } });
  await p.goto(file('_hover_check.html')); await p.waitForTimeout(800);
  res.hover = await p.evaluate(() => {
    const gd = document.querySelector('.plotly-graph-div');
    Plotly.Fx.hover(gd, [{ curveNumber: 2, pointNumber: 18 }]);   // приложение, июль 2025
    return [...document.querySelectorAll('.hoverlayer .hovertext text tspan.line')].map(t => t.textContent);
  });
  assert.deepEqual(res.hover, ['приложение · июль 2025', '5,91 млн ₽ · 18% выручки месяца']);
  await p.evaluate(() => Plotly.Fx.hover(document.querySelector('.plotly-graph-div'), [{ curveNumber: 1, pointNumber: 18 }]));
  await p.waitForFunction(() => document.querySelector('.hoverlayer .hovertext text')?.textContent.includes('маркетплейс'));
  const market = await p.locator('.hoverlayer .hovertext text').textContent();
  assert.match(market, /5,71 млн ₽/);
  await p.goto(file('_anim_check.html')); await p.waitForTimeout(800);
  await p.evaluate(() => {   // анимация без range_y: верх оси до и после проигрывания кнопкой ▶
    const gd = document.querySelector('.plotly-graph-div'), r0 = gd._fullLayout.yaxis.range[1];
    window.__anim = new Promise(done => gd.on('plotly_animated', () => setTimeout(() => done([r0, gd._fullLayout.yaxis.range[1]]), 300)));
  });
  await p.click('.updatemenu-button >> nth=0');
  res.anim = (await p.evaluate(() => window.__anim)).map(v => v.toFixed(1).replace('.', ','));
  await p.close();
  for (const n of ['zoom', 'off']) {
    const ctx = await b.newContext({ ...devices['Pixel 5'] });
    const q = await ctx.newPage();
    await q.goto(file(`_touch_${n}.html`)); await q.waitForTimeout(1000);
    const cdp = await ctx.newCDPSession(q);
    const x = 180, y0 = 600, y1 = 350;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
    for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + i * 2, y: y0 + (y1 - y0) * i / 10 }] }); await q.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await q.waitForTimeout(600);
    res[n] = await q.evaluate(() => {
      const r = document.querySelector('.plotly-graph-div')._fullLayout.xaxis.range.map(v => String(v).slice(0, 10));
      return { scroll: Math.round(window.scrollY), raw: r };
    });
    const M = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
    const [a, z] = res[n].raw, m = s => M[+s.slice(5, 7) - 1];
    res[n].range = a.slice(0, 4) === z.slice(0, 4) ? `${m(a)}–${m(z)} ${a.slice(0, 4)}` : `${m(a)} ${a.slice(0, 4)} — ${m(z)} ${z.slice(0, 4)}`;
    await ctx.close();
  }
  await b.close();
  assert.notEqual(res.anim[0], res.anim[1]);
  assert.equal(res.zoom.scroll, 0);
  assert.ok(res.off.scroll > 100);
  assert.notDeepEqual(res.zoom.raw, res.off.raw);
  console.log(JSON.stringify(res));
})();
