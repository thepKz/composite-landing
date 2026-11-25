import { randomBytes, randomUUID } from 'node:crypto';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/security';
import { usesSupabaseAuth, verifySupabasePassword } from '../src/lib/supabase-auth';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) for this command.');
  process.exit(1);
}
try {
  const supabase = usesSupabaseAuth();
  if (supabase && !await verifySupabasePassword(email, password)) {
    throw new Error('Create and confirm this email in Supabase Auth first. No administrator was added.');
  }
  const hash = await hashPassword(supabase ? randomBytes(32).toString('hex') : password);
  await db.query('INSERT INTO users(id,email,name,password_hash) VALUES ($1,$2,$3,$4)', [randomUUID(), email, process.env.ADMIN_NAME || 'Quản trị viên', hash]);
  console.log('Administrator created. Existing accounts are never overwritten.');
} finally { await db.end(); }
