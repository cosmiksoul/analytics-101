// Служебный скрипт сборки (в материалы не попадает): формулы интерактива страницы 4.2 на наборе матриц.
// node _eig_dump.js <page.js> <matrices.json> → JSON: kind, det, rank, λ и векторы по формулам страницы; 30 точек сцены.
const fs = require('fs'), vm = require('vm');
const ctx = { window: {}, Math, JSON, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2], 'utf8'), ctx);
const W = ctx.window.PAGE.widgets.deform;
const Ms = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const out = Ms.map(m => Object.assign({ m, rank: W.rankOf(m) }, W.eig2(m)));
console.log(JSON.stringify(out));
