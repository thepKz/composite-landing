import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { transaction } from './db';
import { cleanDocument, documentMedia, documentText } from './rich-text';
import { RequestError } from './http';
import { resolvePublicationTime } from './publication';
import { publicationState } from './post-time';

export const postInput=z.object({id:z.uuid().optional(),title:z.string().trim().min(3).max(200),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),excerpt:z.string().trim().max(600).default(''),content:z.unknown(),kind:z.enum(['article','project']),status:z.enum(['draft','published']),cover_id:z.uuid().nullable().default(null),seo_title:z.string().trim().max(200).default(''),seo_description:z.string().trim().max(400).default(''),version:z.number().int().min(1).optional(),publication_action:z.enum(['publish','schedule','save']).optional(),scheduled_at:z.iso.datetime().optional()});
export async function savePost(input:unknown){
  const data=postInput.parse(input);
  const content=cleanDocument(data.content);
  if(data.status==='published'&&documentText(content).length<30)throw new RequestError('Hãy bổ sung nội dung trước khi xuất bản (ít nhất 30 ký tự).',400);
  const id=data.id??randomUUID();
  return transaction(async client=>{
    const previous=data.id?(await client.query('SELECT * FROM posts WHERE id=$1 FOR UPDATE',[id])).rows[0]:null;
    if(data.id&&!previous)throw new RequestError('Không tìm thấy bài viết.',404);
    if(previous&&previous.version!==data.version)throw new RequestError('Bài viết đã được cập nhật ở nơi khác. Nội dung của anh/chị vẫn còn trong trình soạn thảo. Hãy mở phiên bản mới ở tab khác để đối chiếu trước khi lưu.',409);
    const now=(await client.query('SELECT clock_timestamp() AS now')).rows[0].now as Date;
    const publishedAt=resolvePublicationTime(data.status,data.publication_action,data.scheduled_at,previous??null,now);
    const source=`/tin-tuc/${data.slug}`;
    const redirect=(await client.query('SELECT 1 FROM redirects WHERE source_path=ANY($1::text[])',[[source,`/kien-thuc/${data.slug}`,`/du-an/${data.slug}`]])).rowCount;
    if(redirect)throw new RequestError('Đường dẫn này từng được sử dụng. Vui lòng chọn đường dẫn khác để giữ liên kết cũ hoạt động.',409);
    const mediaIds=[...new Set([...documentMedia(content),...(data.cover_id?[data.cover_id]:[])])];
    if(mediaIds.length){
      const found=await client.query('SELECT id,mime_type FROM media_assets WHERE id=ANY($1::uuid[]) FOR SHARE',[mediaIds]);
      if(found.rowCount!==mediaIds.length)throw new RequestError('Một ảnh/video không còn trong thư viện. Vui lòng chọn lại.',400);
      if(data.cover_id&&!found.rows.find(m=>m.id===data.cover_id)?.mime_type.startsWith('image/'))throw new RequestError('Ảnh đại diện cần là một tệp hình ảnh.',400);
    }
    if(previous){
      await client.query('INSERT INTO post_revisions(id,post_id,snapshot) VALUES ($1,$2,$3)',[randomUUID(),id,JSON.stringify(previous)]);
      if(previous.slug!==data.slug){
        const oldPaths=[`/tin-tuc/${previous.slug}`,`/kien-thuc/${previous.slug}`,...(previous.kind==='project'?[`/du-an/${previous.slug}`]:[])];
        await client.query('UPDATE redirects SET target_path=$1 WHERE target_path=ANY($2::text[])',[source,oldPaths]);
        for(const oldPath of oldPaths)await client.query('INSERT INTO redirects(source_path,target_path) VALUES ($1,$2) ON CONFLICT(source_path) DO UPDATE SET target_path=EXCLUDED.target_path',[oldPath,source]);
      }
    }
    const result=await client.query(`INSERT INTO posts(id,title,slug,excerpt,content,kind,status,cover_id,seo_title,seo_description,published_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,slug=EXCLUDED.slug,excerpt=EXCLUDED.excerpt,content=EXCLUDED.content,kind=EXCLUDED.kind,status=EXCLUDED.status,cover_id=EXCLUDED.cover_id,seo_title=EXCLUDED.seo_title,seo_description=EXCLUDED.seo_description,published_at=EXCLUDED.published_at,updated_at=now(),version=posts.version+1 RETURNING *`,[id,data.title,data.slug,data.excerpt,JSON.stringify(content),data.kind,data.status,data.cover_id,data.seo_title,data.seo_description,publishedAt]);
    await client.query('DELETE FROM post_media WHERE post_id=$1',[id]);
    for(const mediaId of mediaIds)await client.query('INSERT INTO post_media(post_id,media_id) VALUES ($1,$2)',[id,mediaId]);
    return {...result.rows[0],server_now:now.toISOString(),publication_state:publicationState(data.status,publishedAt,now.getTime())};
  });
}

// ---------------------------------------------------------------------------
// Thao tác nhanh trên danh sách bài viết (khu quản trị).
// ---------------------------------------------------------------------------

/** Tạo bản sao dạng nháp với tiêu đề và đường dẫn mới, không trùng đường dẫn hay chuyển hướng cũ. */
export async function duplicatePost(id: string) {
  const source = await transaction(async client => {
    const row = (await client.query('SELECT * FROM posts WHERE id=$1', [id])).rows[0];
    if (!row) throw new RequestError('Không tìm thấy bài viết.', 404);
    return row;
  });
  const title = `Bản sao của ${source.title}`.slice(0, 200);
  const base = String(source.slug).slice(0, 100).replace(/-$/, '');
  for (let attempt = 2; attempt < 50; attempt++) {
    const slug = `${base}-ban-sao${attempt === 2 ? '' : `-${attempt}`}`;
    try {
      return await savePost({
        title, slug, excerpt: source.excerpt, content: source.content, kind: source.kind, status: 'draft',
        cover_id: source.cover_id, seo_title: source.seo_title, seo_description: source.seo_description,
      });
    } catch (error) {
      const taken = error instanceof RequestError ? error.status === 409 : (error as { code?: string })?.code === '23505';
      if (!taken) throw error;
    }
  }
  throw new RequestError('Không tạo được bản sao. Hãy thử lại sau.', 409);
}

/** Đưa bài về nháp, giữ khoá phiên bản và lưu lại bản trước vào lịch sử. */
export async function setPostDraft(id: string, version: number) {
  return transaction(async client => {
    const previous = (await client.query('SELECT * FROM posts WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!previous) throw new RequestError('Không tìm thấy bài viết.', 404);
    if (previous.version !== version) throw new RequestError('Bài viết vừa được cập nhật ở nơi khác. Hãy tải lại danh sách rồi thử lại.', 409);
    await client.query('INSERT INTO post_revisions(id,post_id,snapshot) VALUES ($1,$2,$3)', [randomUUID(), id, JSON.stringify(previous)]);
    const result = await client.query(
      "UPDATE posts SET status='draft',published_at=CASE WHEN published_at<=now() THEN published_at ELSE NULL END,updated_at=now(),version=version+1 WHERE id=$1 RETURNING *",
      [id],
    );
    return result.rows[0];
  });
}

/** Xoá bài cùng lịch sử sửa và liên kết ảnh. Gỡ luôn các chuyển hướng trỏ về bài này để không dẫn khách tới trang trống. */
export async function deletePost(id: string) {
  return transaction(async client => {
    const post = (await client.query('SELECT id,slug,kind FROM posts WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!post) throw new RequestError('Không tìm thấy bài viết.', 404);
    const targets = [`/tin-tuc/${post.slug}`, `/du-an/${post.slug}`, `/kien-thuc/${post.slug}`];
    await client.query('DELETE FROM redirects WHERE target_path=ANY($1::text[]) OR source_path=ANY($1::text[])', [targets]);
    await client.query('DELETE FROM posts WHERE id=$1', [id]);
    return { id };
  });
}
