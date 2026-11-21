import sharp from 'sharp';
const [dir, out, ...names] = process.argv.slice(2);
const w = 450, h = 270; const t = [];
for (let i = 0; i < names.length; i++) t.push({ input: await sharp(`${dir}/${names[i]}-600-fold.png`).resize(w, h).toBuffer(), left: (i % 2) * (w + 6), top: Math.floor(i / 2) * (h + 6) });
await sharp({ create: { width: w * 2 + 6, height: Math.ceil(names.length / 2) * (h + 6), channels: 3, background: '#888' } }).composite(t).jpeg({ quality: 78 }).toFile(out);
