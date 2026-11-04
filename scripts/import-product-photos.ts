import { createHash } from 'node:crypto';
import { readFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { productAssetBySlug, editorialAssets, additionalCustomerAssets } from '../src/lib/customer-product-assets';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const root = path.resolve(process.env.UPLOAD_DIR || './data/uploads');
const photos = [...Object.values(productAssetBySlug), ...Object.values(editorialAssets).flat(), ...additionalCustomerAssets].filter(photo => photo !== undefined);
const unique = new Map(photos.map(photo => [photo.src, photo]));
let imported = 0;
try {
  await mkdir(root, { recursive: true });
  for (const photo of unique.values()) {
    const source = path.resolve('public', photo.src.slice(1));
    const bytes = await readFile(source);
    const hash = createHash('sha256').update(bytes).digest('hex');
    const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    // Same content-derived identity as the original importer; preserve edited metadata on reruns.
    if ((await pool.query('SELECT 1 FROM media_assets WHERE id=$1', [id])).rowCount) continue;
    const key = `${id}.webp`;
    await copyFile(source, path.join(root, key));
    await pool.query('INSERT INTO media_assets(id,storage_key,original_name,mime_type,size_bytes,alt,caption) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING', [id, key, path.basename(source), 'image/webp', bytes.length, photo.alt, photo.label]);
    imported++;
  }
  console.log(`Imported ${imported} product photographs; ${unique.size} unique source files checked.`);
} finally {
  await pool.end();
}
