import { requireAdmin, apiError } from '@/lib/admin-api';
import { consumeLimit } from '@/lib/auth';
import { readJson, RequestError } from '@/lib/http';
import { getGeminiConfig } from '@/lib/gemini-config';
import { prepareTranslation, translateArticle } from '@/lib/article-translation';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const input = await readJson(request, 500000);
    prepareTranslation(input);
    const config = await getGeminiConfig();
    if (!await consumeLimit('admin:translation', 20, 3600)) throw new RequestError('Đã dịch 20 lần trong giờ này. Hãy thử lại sau.', 429);
    return Response.json(await translateArticle(input, config), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return apiError(error); }
}
