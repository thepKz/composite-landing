import { z } from 'zod';
import { requireAdmin,apiError } from '@/lib/admin-api';
import { db } from '@/lib/db';
import { readJson,RequestError } from '@/lib/http';
export async function GET(request:Request){try{await requireAdmin(request);return Response.json((await db.query('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 1000')).rows);}catch(error){return apiError(error);}}
export async function PATCH(request:Request){try{await requireAdmin(request);const data=z.object({id:z.uuid(),status:z.enum(['new','contacted','closed'])}).parse(await readJson(request));const result=await db.query('UPDATE inquiries SET status=$2,updated_at=now() WHERE id=$1 RETURNING *',[data.id,data.status]);if(!result.rowCount)throw new RequestError('Không tìm thấy yêu cầu.',404);return Response.json(result.rows[0]);}catch(error){return apiError(error);}}
