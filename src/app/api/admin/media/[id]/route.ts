import { z } from 'zod';
import { requireAdmin, apiError } from '@/lib/admin-api';
import { db } from '@/lib/db';
import { readJson,RequestError } from '@/lib/http';
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{await requireAdmin(request);const id=z.uuid().parse((await params).id);const data=z.object({alt:z.string().max(500),caption:z.string().max(500)}).parse(await readJson(request));const result=await db.query('UPDATE media_assets SET alt=$2,caption=$3,updated_at=now() WHERE id=$1 RETURNING *',[id,data.alt,data.caption]);if(!result.rowCount)throw new RequestError('Tệp không còn tồn tại.',404);return Response.json(result.rows[0]);}catch(error){return apiError(error);}}
