import { db } from './db';
import { RequestError } from './http';
import { openGeminiKey, sealGeminiKey } from './gemini-secret';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';
type Config = { encryptedKey?: string; model?: string };

async function storedConfig(): Promise<Config> {
  return (await db.query("SELECT value FROM site_settings WHERE key='gemini_translation'")).rows[0]?.value ?? {};
}

export async function geminiStatus() {
  const config = await storedConfig();
  return { configured: Boolean(config.encryptedKey || process.env.GEMINI_API_KEY), model: config.model || DEFAULT_GEMINI_MODEL };
}

export async function getGeminiConfig() {
  const config = await storedConfig();
  let apiKey = process.env.GEMINI_API_KEY ?? '';
  if (config.encryptedKey) {
    try { apiKey = openGeminiKey(config.encryptedKey, process.env.GEMINI_ENCRYPTION_KEY ?? ''); }
    catch { throw new RequestError('Không đọc được khóa dịch. Kiểm tra GEMINI_ENCRYPTION_KEY trên máy chủ.', 503); }
  }
  if (!apiKey) throw new RequestError('Chưa cấu hình Gemini. Mở Thông tin website để thêm khóa API.', 503);
  return { apiKey, model: config.model || DEFAULT_GEMINI_MODEL };
}

export async function saveGeminiConfig(model: string, apiKey?: string) {
  const update: Config = { model };
  if (apiKey) {
    try { update.encryptedKey = sealGeminiKey(apiKey, process.env.GEMINI_ENCRYPTION_KEY ?? ''); }
    catch { throw new RequestError('Máy chủ chưa có GEMINI_ENCRYPTION_KEY hợp lệ để lưu khóa an toàn.', 503); }
  }
  if (!apiKey && !(await geminiStatus()).configured) throw new RequestError('Vui lòng nhập khóa Gemini.', 400);
  await db.query("INSERT INTO site_settings(key,value) VALUES ('gemini_translation',$1) ON CONFLICT(key) DO UPDATE SET value=site_settings.value || EXCLUDED.value,updated_at=now()", [JSON.stringify(update)]);
  return geminiStatus();
}
