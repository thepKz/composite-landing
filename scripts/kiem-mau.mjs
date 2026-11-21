import { readFileSync } from 'node:fs';
const d = JSON.parse(readFileSync('docs/nang-cap-2026-11/kiem-doc-lap/du-lieu-noidung.json', 'utf8'));
const colors = {};
for (const r of d.filter(x => x.size === '1366' || x.size==='390')) for (const t of r.texts) {
  const key = t.color; colors[key] ??= { n: 0, minC: 99, fs: new Set(), ex: [] };
  colors[key].n++; colors[key].minC = Math.min(colors[key].minC, t.contrast); colors[key].fs.add(t.fs);
  if (colors[key].ex.length < 3) colors[key].ex.push(`${r.route}:"${t.t.slice(0,22)}"`);
}
for (const [c, v] of Object.entries(colors).sort((a,b)=>b[1].n-a[1].n).slice(0,25)) console.log(c, v.n, 'minContrast', v.minC, 'fs', [...v.fs].sort((a,b)=>a-b).join('/'), v.ex.join(' '));
// kích thước chữ
const fs = {}; for (const r of d.filter(x=>x.size==='1366')) for (const t of r.texts) fs[t.fs]=(fs[t.fs]||0)+1; console.log('fs', JSON.stringify(fs));
const fs2 = {}; for (const r of d.filter(x=>x.size==='1366')) for (const t of r.texts) if (t.fs<16) { const k=t.fs+'px '+t.cls; fs2[k]=(fs2[k]||0)+1;} console.log(Object.entries(fs2).sort((a,b)=>b[1]-a[1]).slice(0,25).map(e=>e.join(' x')).join('\n'));
