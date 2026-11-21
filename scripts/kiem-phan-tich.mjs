import { readFileSync } from 'node:fs';
const d = JSON.parse(readFileSync('docs/nang-cap-2026-11/kiem-doc-lap/du-lieu-noidung.json', 'utf8'));
const bad = /[·—;!]/;
const out = [];
for (const r of d) {
  const tag = `${r.size} ${r.route}`;
  if (r.status !== 200 && !(r.route.includes('khong-ton-tai') && r.status === 404)) out.push(`STATUS ${tag} ${r.status}`);
  if (r.errors.length) out.push(`CONSOLE ${tag}: ${r.errors.join(' | ')}`);
  if (r.failed.length) out.push(`NET ${tag}: ${r.failed.slice(0,5).join(' | ')}`);
  if (r.overflowX > 0) out.push(`TRAN ${tag} +${r.overflowX}`);
  if (r.imgBroken.length) out.push(`ANH ${tag} ${r.imgBroken}`);
  if (r.h1 !== 1) out.push(`H1 ${tag} count=${r.h1}`);
  if (r.stuck.length) out.push(`KET ${tag} ${r.stuck.slice(0,3)}`);
  const lines = r.bodyText.split('\n');
  for (const l of lines) { if (bad.test(l)) out.push(`CHUCAM ${tag}: ${l.slice(0,100)}`); }
  for (const w of ['slug','database','SEO','Error','undefined','null','NaN','lorem','Lorem']) if (new RegExp('\b'+w+'\b').test(r.bodyText)) out.push(`TUKYTHUAT ${tag}: ${w}`);
  const caps = lines.filter(l => /^[A-ZÀ-Ỹ0-9 \-–.,]{12,}$/.test(l.trim()) && /[A-ZÀ-Ỹ]{4}/.test(l));
  for (const c of caps) out.push(`INHOA ${tag}: ${c.slice(0,60)}`);
  for (const o of r.orphans) out.push(`MOCOI ${tag}: ${o}`);
  const minfs = r.texts.filter(t => t.fs < (r.route.startsWith('/admin') ? 14 : 14));
  if (minfs.length) out.push(`CHUNHO ${tag}: ${minfs.length} cụm <14px, vd ${minfs.slice(0,4).map(t=>`"${t.t}" ${t.fs}px`).join('; ')}`);
  const lowc = r.texts.filter(t => t.contrast < 4.5 && !/^(A|BUTTON)$/.test('') );
  if (lowc.length) out.push(`TUONGPHAN ${tag}: ${lowc.length} cụm <4.5, vd ${lowc.slice(0,5).map(t=>`"${t.t}" ${t.contrast}`).join('; ')}`);
  const faded = r.texts.filter(t => t.op < 0.95);
  if (faded.length) out.push(`MO ${tag}: ${faded.length} vd ${faded.slice(0,3).map(t=>`"${t.t}" op${t.op}`)}`);
  if (r.size==='390'||r.size==='600') { const sm = r.small.filter(s=>!/Chính sách|Quản trị/.test(s)); if (sm.length) out.push(`BAMNHO ${tag}: ${sm.length} vd ${sm.slice(0,4).join('; ')}`); }
  if (r.iframes.length) out.push(`IFRAME ${tag}: ${JSON.stringify(r.iframes)}`);
}
console.log(out.join('\n'));
