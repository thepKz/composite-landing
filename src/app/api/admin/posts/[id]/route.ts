import { z } from 'zod';
import { requireAdmin, apiError } from '@/lib/admin-api';
import { db } from '@/lib/db';
import { RequestError } from '@/lib/http';
import { deletePost } from '@/lib/posts';

const stateSql = "CASE WHEN status='draft' OR published_at IS NULL THEN 'draft' WHEN published_at>clock_timestamp() THEN 'scheduled' ELSE 'published' END";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const id = z.uuid().parse((await params).id);
    const result = await db.query(`SELECT *,clock_timestamp() AS server_now,${stateSql} AS publication_state FROM posts WHERE id=$1`, [id]);
    if (!result.rowCount) throw new RequestError('Không tìm thấy bài viết.', 404);
    const revisions = (await db.query('SELECT id,created_at,snapshot FROM post_revisions WHERE post_id=$1 ORDER BY created_at DESC LIMIT 20', [id])).rows;
    return Response.json({ ...result.rows[0], revisions });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    return Response.json(await deletePost(z.uuid().parse((await params).id)));
  } catch (error) { return apiError(error); }
}
