import { z } from 'zod';
import { requireAdmin, apiError } from '@/lib/admin-api';
import { duplicatePost } from '@/lib/posts';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    return Response.json(await duplicatePost(z.uuid().parse((await params).id)), { status: 201 });
  } catch (error) { return apiError(error); }
}
