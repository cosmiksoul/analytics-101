// Сверка интерактива «Слои помех» и сцены: JS-модель PAGE.calc.state против таблицы CHECK из simulate() в Python (build_page.py).
// node pages/da-11-1/data/check_widget.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'page.js'), 'utf8');
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(src, ctx);
const C = ctx.window.PAGE && ctx.window.PAGE.calc;
if (!C || !C.CHECK) { console.log('check_widget: в page.js нет PAGE.calc.CHECK'); process.exit(1); }
let bad = 0, n = 0, worst = 0;
for (const [key, want] of Object.entries(C.CHECK)) {
  const on = {}; C.LAY.forEach((k, i) => { if (key[i] === '1') on[k] = true; });
  const got = C.state(on); n++;
  const d = Math.max(Math.abs(got[0] - want[0]), Math.abs(got[1] - want[1])); worst = Math.max(worst, d);
  if (d > 0.005) { bad++; console.log('расхождение', key, got, want); }
}
console.log(bad ? `check_widget: ${bad} из ${n} состояний разошлись` : `check_widget: JS совпал с Python во всех ${n} состояниях (наибольшее расхождение ${worst.toExponential(1)} п. п.)`);
process.exit(bad ? 1 : 0);
