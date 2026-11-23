import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { z } from 'zod';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { uploadRoot } from '@/lib/upload';
import { mediaCacheHeaders,etagMatches } from '@/lib/media-cache';
export const runtime='nodejs';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const id=z.uuid().safeParse((await params).id);if(!id.success)return new Response(null,{status:404});
  const result=await db.query(`SELECT m.*, (EXISTS(SELECT 1 FROM post_media pm JOIN posts p ON p.id=pm.post_id WHERE pm.media_id=m.id AND p.status='published' AND p.published_at<=now()) OR EXISTS(SELECT 1 FROM products p WHERE p.cover_id=m.id AND p.is_published=true) OR EXISTS(SELECT 1 FROM product_media pm JOIN products p ON p.id=pm.product_id WHERE pm.media_id=m.id AND p.is_published=true)) AS public FROM media_assets m WHERE id=$1`,[id.data]);
  const media=result.rows[0];const admin=media&&!media.public?await currentUser():null;if(!media||(!media.public&&!admin))return new Response(null,{status:404});
  if(!/^[a-f0-9-]+\.(webp|mp4|webm)$/.test(media.storage_key))return new Response(null,{status:404});
  const file=path.join(uploadRoot(),media.storage_key);
  let size:number;try{size=(await stat(file)).size;}catch{return new Response(null,{status:404});}
  const headers:Record<string,string>={'Content-Type':media.mime_type,'Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'};
  const cache=mediaCacheHeaders(Boolean(media.public),media);headers['Cache-Control']=cache.cacheControl;if(cache.etag){headers['ETag']=cache.etag;if(etagMatches(request.headers.get('if-none-match'),cache.etag))return new Response(null,{status:304,headers:{'ETag':cache.etag,'Cache-Control':cache.cacheControl,'X-Content-Type-Options':'nosniff'}});}
  let start=0,end=size-1,status=200;
  const range=request.headers.get('range');
  if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});if(!match[1]){start=Math.max(0,size-Number(match[2]));}else{start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;}if(start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;}
  headers['Content-Length']=String(end-start+1);
  return new Response(Readable.toWeb(createReadStream(file,{start,end})) as ReadableStream,{status,headers});
}
