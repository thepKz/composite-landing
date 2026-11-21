import sharp from 'sharp';
const [dir, out, size, cols, scale, ...names] = process.argv.slice(2);
const dims = { 1366: [1366, 768], 390: [390, 844], 600: [600, 360] }[size]; const s = +scale; const w = Math.round(dims[0] * s), h = Math.round(dims[1] * s); const c = +cols; const t = [];
for (let i = 0; i < names.length; i++) t.push({ input: await sharp(`${dir}/${names[i]}-${size}-fold.png`).resize(w, h).toBuffer(), left: (i % c) * (w + 6), top: Math.floor(i / c) * (h + 6) });
await sharp({ create: { width: w * c + 6 * (c - 1), height: Math.ceil(names.length / c) * (h + 6), channels: 3, background: '#777' } }).composite(t).jpeg({ quality: 78 }).toFile(out);
