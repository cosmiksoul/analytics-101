// Сверка интерактива «Собери сессии»: JS-расчёт PAGE.calc против таблицы CHECK из pandas и PostgreSQL (gen_page.py).
// node pages/da-9-1/data/check_widget.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'page.js'), 'utf8');
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(src, ctx);
const P = ctx.window.PAGE;
if (!P || !P.calc) { console.log('check_widget: в page.js нет PAGE.calc'); process.exit(0); }
let bad = 0, n = 0;
for (const m of P.calc.STOPS) for (const st of [0, 1]) {
  const r = P.calc.run(m, !!st), got = [r.sessions.length, r.withOrder, r.users.size, r.buyers.size], want = P.calc.CHECK[`${m}_${st}`];
  n++; if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log('расхождение', m, st, got, want); }
}
console.log(bad ? `check_widget: ${bad} из ${n} состояний разошлись` : `check_widget: JS совпал с pandas и PostgreSQL во всех ${n} состояниях`);
process.exit(bad ? 1 : 0);
