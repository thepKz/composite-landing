import { requireAdmin, apiError } from '@/lib/admin-api';
import { db } from '@/lib/db';
import { readJson } from '@/lib/http';
import { savePost } from '@/lib/posts';
export async function GET(request:Request){try{await requireAdmin(request);return Response.json((await db.query("SELECT id,title,slug,excerpt,status,kind,version,cover_id,updated_at,published_at,clock_timestamp() AS server_now,CASE WHEN status='draft' OR published_at IS NULL THEN 'draft' WHEN published_at>clock_timestamp() THEN 'scheduled' ELSE 'published' END AS publication_state FROM posts ORDER BY updated_at DESC LIMIT 500")).rows);}catch(error){return apiError(error);}}
export async function POST(request:Request){try{await requireAdmin(request);return Response.json(await savePost(await readJson(request,1000000)));}catch(error){return apiError(error);}}
