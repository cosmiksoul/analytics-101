// Достаёт данные страницы (window.PAGE) из pages/<id>/page.js без браузера.
// node tools/extract_page.js da-1-2 code        → JSON блоков кода
// node tools/extract_page.js da-1-2 materials   → JSON списка материалов
const fs = require('fs'), vm = require('vm'), path = require('path');
const [id, key] = process.argv.slice(2);
const src = fs.readFileSync(path.join(__dirname, '..', 'pages', id, 'page.js'), 'utf8');
const noop = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : noop), apply: () => noop, construct: () => noop });
const win = { PAGE: null, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
win.window = win; win.document = noop; win.navigator = {}; win.console = console; win.requestAnimationFrame = () => 0; win.performance = { now: () => 0 };
vm.createContext(win); vm.runInContext(src, win);
const P = win.PAGE; if (!P) { console.error('PAGE не найден'); process.exit(1); }
process.stdout.write(JSON.stringify(key ? P[key] : Object.keys(P), null, 1));
