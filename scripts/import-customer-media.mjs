import { createHash } from 'node:crypto';
import { readFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const root = path.resolve(process.env.UPLOAD_DIR || './data/uploads');
const labels = ['Lòng bể composite màu xanh', 'Bồn bể composite tại xưởng', 'Các cấu kiện tại xưởng', 'Cấu kiện bồn bể ngoài trời', 'Bể màu xanh với nước và đường ống', 'Bể dạng hộp màu xanh', 'Bể composite chữ nhật', 'Các bể màu xanh và cam'];
try {
  await mkdir(root, { recursive: true });
  for (let index = 1; index <= 8; index++) {
    const name = `customer-${String(index).padStart(2, '0')}.webp`;
    const source = path.resolve('public/images/customer', name);
    const bytes = await readFile(source);
    const hash = createHash('sha256').update(bytes).digest('hex');
    const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    const key = `${id}.webp`;
    // Stable content-derived IDs make repeated imports safe without overwriting edited captions.
    if ((await pool.query('SELECT 1 FROM media_assets WHERE id=$1', [id])).rowCount) continue;
    await copyFile(source, path.join(root, key));
    await pool.query('INSERT INTO media_assets(id,storage_key,original_name,mime_type,size_bytes,alt,caption) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING', [id, key, name, 'image/webp', bytes.length, labels[index - 1], 'Tư liệu do Thành Lợi cung cấp']);
    console.log(`Imported ${name}`);
  }
} finally { await pool.end(); }
