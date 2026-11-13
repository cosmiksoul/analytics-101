const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const m = src.match(/\/\*tvl:start\*\/([\s\S]*?)\/\*tvl:end\*\//);
const CONDS = new Function(m[1] + '; return CONDS;')();
const R = [5, 4, 3, 2, 1, null], P = ['ЗИМА10', 'ВЕСНА15', '', null];
const out = [];
for (const c of CONDS) for (const r of R) for (const p of P) {
  const e = c.ev({ rating: r, promo: p });
  out.push({ id: c.id, sql: c.sql, rating: r, promo: p, res: e.res, parts: e.parts.map(x => ({ q: x.q, v: x.v })) });
}
console.log(JSON.stringify(out));
