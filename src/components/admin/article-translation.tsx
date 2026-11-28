'use client';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Languages, ExternalLink } from 'lucide-react';
import type { TranslatedArticle } from '@/lib/article-translation';
import { slugify } from '@/lib/text';
import RichContent from '@/components/rich-content';
import type { Post } from './editor/types';
import { api, jsonOptions } from './client-api';
import { Dialog } from './ui';

export default function ArticleTranslation({ snapshot, disabled }: { snapshot: () => Post; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [translated, setTranslated] = useState<TranslatedArticle | null>(null);
  const [source, setSource] = useState<Post | null>(null);
  const [created, setCreated] = useState('');
  const locked = useRef(false);
  const draftSlug = useRef('');

  async function translate() {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError(''); setCreated(''); setTranslated(null);
    const current = structuredClone(snapshot());
    setSource(current); setOpen(true);
    try {
      const result = await api<TranslatedArticle>('/api/admin/translate', jsonOptions('POST', {
        title: current.title, excerpt: current.excerpt, seo_title: current.seo_title, seo_description: current.seo_description, content: current.content,
      }));
      const base = slugify(result.title).slice(0, 90).replace(/-$/, '') || 'article';
      draftSlug.current = `${base}-en-${crypto.randomUUID().slice(0, 8)}`;
      setTranslated(result);
    }
    catch (failure) { setError((failure as Error).message); }
    finally { locked.current = false; setBusy(false); }
  }

  async function createDraft() {
    if (locked.current || !translated || !source || created) return;
    locked.current = true; setBusy(true); setError('');
    try {
      const result = await api<Post>('/api/admin/posts', jsonOptions('POST', {
        ...translated, slug: draftSlug.current, kind: source.kind, cover_id: source.cover_id, status: 'draft',
      }));
      setCreated(result.id!);
    } catch (failure) { setError((failure as Error).message); }
    finally { locked.current = false; setBusy(false); }
  }

  return <section className="ed-section" aria-label="Dịch bài viết">
    <div className="ed-section-body">
      <button type="button" className="button button-outline" disabled={disabled || busy} onClick={() => void translate()}><Languages size={17} />Dịch sang tiếng Anh</button>
      <p className="field-help">Xem bản dịch trước, sau đó lưu thành bài nháp riêng.</p>
    </div>
    {typeof document !== 'undefined' && createPortal(<Dialog open={open} onClose={() => { if (!busy) setOpen(false); }} title="Bản dịch tiếng Anh" width={900} footer={<>
      <button type="button" className="button button-outline" disabled={busy} onClick={() => setOpen(false)}>Đóng</button>
      {created ? <a className="button" href={`/admin/bai-viet/${created}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={17} />Mở bản nháp tiếng Anh</a>
        : translated ? <button type="button" className="button" disabled={busy} onClick={() => void createDraft()}>{busy ? 'Đang tạo bản nháp…' : 'Lưu thành bản nháp tiếng Anh'}</button>
        : !busy && <button type="button" className="button" onClick={() => void translate()}>Thử dịch lại</button>}
    </>}>
      {error && <p className="error-message" role="alert">{error}</p>}
      {busy && <p role="status">{translated ? 'Đang lưu bản nháp tiếng Anh…' : 'Đang dịch nội dung, giữ nguyên hình ảnh và bố cục…'}</p>}
      {created && <p className="save-status" role="status">Đã tạo bản nháp tiếng Anh. Mở bản nháp để chỉnh sửa và xuất bản khi đã duyệt.</p>}
      {translated && <>
        <p className="field-help">Bản dịch dựa trên nội dung lúc bấm Dịch. Bài gốc vẫn giữ nguyên. Kiểm tra thuật ngữ, số liệu và tên sản phẩm trước khi xuất bản.</p>
        <article lang="en" className="ed-prose" style={{ overflowWrap: 'anywhere', overflowX: 'auto', minWidth: 0 }}>
          <h2>{translated.title}</h2>
          {translated.excerpt && <p>{translated.excerpt}</p>}
          <RichContent document={translated.content} />
        </article>
        {(translated.seo_title || translated.seo_description) && <details><summary>Tiêu đề và mô tả SEO</summary><p lang="en">{translated.seo_title}</p><p lang="en">{translated.seo_description}</p></details>}
      </>}
    </Dialog>, document.querySelector('.adm-root') ?? document.body)}
  </section>;
}
