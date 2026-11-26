// Считает ложные победы в ста показанных тестах так же, как интерактив страницы 11.5: по данным, вшитым в page.js.
const fs = require('fs'); const src = fs.readFileSync(process.argv[2], 'utf8');
const m = src.match(/\/\*data:start\*\/const DATA = (\{.*?\});\r?\n/s); const DATA = JSON.parse(m[1]); const SQ = DATA.seq;
const B64 = src.match(/const B64 = '([^']+)'/) || src.match(/B64\s*=\s*"([^"]+)"/);
const alph = B64 ? B64[1] : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const dec = s => [...s].reduce((a, c) => a * 64 + alph.indexOf(c), 0);
const decPaths = s => { const out = []; for (let t = 0; t < 100; t++) { const row = []; for (let d = 0; d < 28; d++) { const o = (t * 28 + d) * 2; row.push((dec(s.slice(o, o + 2)) - 2048) / 100); } out.push(row); } return out; };
const P = { aa: decPaths(SQ.aa), ab: decPaths(SQ.ab) };
const bounds = (mth, K) => { const looks = [], b = []; for (let j = 1; j <= K; j++) { const d = 28 * j / K; looks.push(d); b.push(mth === 'naive' ? 1.96 : mth === 'pocock' ? SQ.poc[K] : mth === 'obf' ? SQ.obf[K] * Math.sqrt(K / j) : SQ.av[d - 1]); } return { looks, b: b.map(v => Math.round(v * 1000) / 1000) }; };
let bad = 0;
for (const mth of ['naive', 'pocock', 'obf', 'av']) for (const K of SQ.ks) {
  const { looks, b } = bounds(mth, K);
  const res = d => P[d].map(z => { for (let j = 0; j < looks.length; j++) { const v = z[looks[j] - 1]; if (Math.abs(v) >= b[j]) return { up: v > 0 }; } return null; });
  const aa = res('aa').filter(Boolean).length, ab = res('ab').filter(r => r && r.up).length, want = SQ.shown[mth][K];
  if (aa !== want[0] || ab !== want[1]) { bad++; console.log('расхождение', mth, K, [aa, ab], want); }
}
console.log(bad ? 'ЕСТЬ РАСХОЖДЕНИЯ: ' + bad : 'счёт интерактива совпал с Python во всех 24 сочетаниях; ежедневно без поправки: ' + SQ.shown.naive[28][0] + ', Pocock ' + SQ.shown.pocock[28][0] + ', OBF ' + SQ.shown.obf[28][0] + ', always-valid ' + SQ.shown.av[28][0]);
if (bad) process.exitCode = 1;
