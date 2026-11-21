import { z } from 'zod';
import { requireAdmin, apiError } from '@/lib/admin-api';
import { readJson } from '@/lib/http';
import { setPostDraft } from '@/lib/posts';

/** Đưa bài về nháp nhanh từ danh sách. Thân yêu cầu: { version } lấy từ danh sách để chống ghi đè. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const id = z.uuid().parse((await params).id);
    const data = z.object({ version: z.number().int().min(1) }).parse(await readJson(request));
    return Response.json(await setPostDraft(id, data.version));
  } catch (error) { return apiError(error); }
}
