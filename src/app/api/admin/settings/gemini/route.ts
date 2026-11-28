import { z } from 'zod';
import { requireAdmin, apiError } from '@/lib/admin-api';
import { readJson, RequestError } from '@/lib/http';
import { geminiStatus, getGeminiConfig, saveGeminiConfig } from '@/lib/gemini-config';
import { translateArticle } from '@/lib/article-translation';
import { consumeLimit } from '@/lib/auth';

export const maxDuration = 60;

const schema = z.object({
  model: z.string().regex(/^gemini-[a-z0-9.-]+$/).max(100),
  apiKey: z.string().trim().min(20).max(512).regex(/^[A-Za-z0-9._-]+$/).optional(),
});

export async function GET(request: Request) {
  try { await requireAdmin(request); return Response.json(await geminiStatus(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { return apiError(error); }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin(request);
    const input = schema.parse(await readJson(request, 2000));
    const apiKey = input.apiKey || (await getGeminiConfig()).apiKey;
    if (!await consumeLimit('admin:gemini-config', 10, 3600)) throw new RequestError('Đã kiểm tra cấu hình nhiều lần. Hãy thử lại sau.', 429);
    await translateArticle({ title: 'Bồn composite', content: { type: 'doc', content: [{ type: 'paragraph' }] } }, { apiKey, model: input.model });
    return Response.json(await saveGeminiConfig(input.model, input.apiKey));
  } catch (error) { return apiError(error); }
}
