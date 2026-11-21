'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import { X, ArrowLeft, Eye, Save, Send, Monitor, Smartphone, ExternalLink, SlidersHorizontal, CheckCircle2, AlertTriangle, LoaderCircle, Undo2 } from 'lucide-react';
import { postPath } from '@/lib/post-path';
import { slugify, safeLink } from '@/lib/text';
import { documentWords, type RichNode } from '@/lib/rich-text';
import { formatVietnamDateTime, publicationState, vietnamDateTimeInput, vietnamInputToUtc } from '@/lib/post-time';
import type { PublicationAction } from '@/lib/publication';
import { api, ApiError, jsonOptions, uploadFile, checkUpload } from './client-api';
import { Dialog, Skeleton, useConfirm, useToast } from './ui';
import MediaLibrary, { type Media } from './media-library';
import ImageEditor from './image-editor';
import FormatBar from './editor/format-bar';
import EditorOverlays, { type KeyHandlerRef } from './editor/overlays';
import SidePanel from './editor/side-panel';
import PreviewPane from './editor/preview-pane';
import { buildExtensions } from './editor/extensions';
import { readingMinutes, type Template } from './editor/guidance';
import { emptyPost, type MediaKind, type Post } from './editor/types';

type Upload = { key: number; name: string; progress: number; error?: string };
type Saved = Post & { updated_at?: string };
const mediaId = (src: unknown) => String(src ?? '').split('/').pop() ?? '';
const clock = (value: Date) => new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh', hourCycle: 'h23' }).format(value);

export default function PostEditor({ id }: { id?: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [post, setPost] = useState<Saved>(emptyPost);
  const [loaded, setLoaded] = useState(!id);
  const [loadError, setLoadError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop');
  const [mediaMode, setMediaMode] = useState<MediaKind | 'replace' | null>(null);
  const [imageEdit, setImageEdit] = useState<{ mediaId: string; target: 'cover' | 'node'; ratio: 'free' | '16:9' } | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [linkError, setLinkError] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [scheduleInput, setScheduleInput] = useState('');
  const [now, setNow] = useState(Date.now());
  const [doc, setDoc] = useState<RichNode>(emptyPost.content);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  // Các giá trị mới nhất cho trình soạn và bộ đếm giờ dùng, tránh dữ liệu cũ.
  const latest = useRef({ post, dirty, busy, scheduleInput, savedId: id });
  latest.current = { post, dirty, busy, scheduleInput, savedId: post.id ?? id };
  const changeId = useRef(0);
  const savingRef = useRef(false);
  const autosaveTimer = useRef<number>(0);
  const snapshotTimer = useRef<number>(0);
  const keyHandler: KeyHandlerRef = useRef(null);
  const canvas = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const actionsRef = useRef<{ openLink: () => void; ingest: (files: File[], position?: number) => void; autosave: () => void; save: () => void }>({ openLink: () => {}, ingest: () => {}, autosave: () => {}, save: () => {} });

  useEffect(() => {
    const serverTime = post.server_now ? new Date(post.server_now).getTime() : Date.now();
    const started = performance.now();
    const tick = () => setNow(serverTime + performance.now() - started);
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [post.server_now]);

  // Ngăn thiết lập (khung hẹp hoặc thấp): tiêu điểm vào trong, Tab giữ bên trong, Esc đóng, đóng xong tiêu điểm về nút đã mở.
  const drawerRef = useRef<HTMLElement>(null);
  const panelOpener = useRef<HTMLElement | null>(null);
  const openPanel = useCallback(() => { panelOpener.current = document.activeElement as HTMLElement | null; setPanelOpen(true); }, []);
  useEffect(() => {
    if (!panelOpen) return;
    const aside = drawerRef.current;
    const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const timer = window.setTimeout(() => aside?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true }), 40);
    const onKey = (event: KeyboardEvent) => {
      if (!window.matchMedia('(max-width: 1100px), (max-height: 520px)').matches || !aside) return;
      if (document.querySelector('.adm-overlay')) return;
      if (event.key === 'Escape') { event.stopPropagation(); setPanelOpen(false); return; }
      if (event.key !== 'Tab') return;
      const items = [...aside.querySelectorAll<HTMLElement>(focusable)].filter(item => item.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !aside.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !aside.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey, true);
      const back = panelOpener.current;
      if (back && document.contains(back)) back.focus({ preventScroll: true });
    };
  }, [panelOpen]);

  const markDirty = useCallback(() => {
    changeId.current++;
    setDirty(true);
    setError('');
    window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => actionsRef.current.autosave(), 3500);
  }, []);

  const editor = useEditor({
    extensions: buildExtensions(),
    content: emptyPost.content,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor: instance }) => {
      markDirty();
      window.clearTimeout(snapshotTimer.current);
      snapshotTimer.current = window.setTimeout(() => setDoc(instance.getJSON() as RichNode), 500);
    },
    editorProps: {
      attributes: { class: 'article-editor ed-prose', spellcheck: 'false', role: 'textbox', 'aria-label': 'Nội dung bài viết', 'aria-multiline': 'true' },
      handleKeyDown: (_view, event) => {
        if (keyHandler.current?.(event)) { event.preventDefault(); return true; }
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'k') { event.preventDefault(); actionsRef.current.openLink(); return true; }
        return false;
      },
      handlePaste: (_view, event) => {
        const files = [...(event.clipboardData?.files ?? [])].filter(file => file.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault(); actionsRef.current.ingest(files); return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = moved ? [] : [...(event.dataTransfer?.files ?? [])];
        if (!files.length) return false;
        event.preventDefault();
        actionsRef.current.ingest(files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos);
        return true;
      },
    },
  });

  // Nạp bài đã có
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api<Saved>(`/api/admin/posts/${id}`).then(value => {
      if (cancelled) return;
      setPost(value);
      setScheduleInput(publicationState(value.status, value.published_at, new Date(value.server_now ?? Date.now()).getTime()) === 'scheduled' && value.published_at ? vietnamDateTimeInput(value.published_at) : '');
      setSavedAt(value.updated_at ? new Date(value.updated_at) : null);
      setSlugEdited(true);
      setLoaded(true);
    }).catch(failure => { if (!cancelled) setLoadError(failure.message); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!editor || !loaded) return;
    // Hoãn một nhịp để khung nhìn ảnh của trình soạn không vẽ lồng trong lúc React đang vẽ.
    const timer = window.setTimeout(() => { editor.commands.setContent(post.content, { emitUpdate: false }); setDoc(editor.getJSON() as RichNode); }, 0);
    return () => window.clearTimeout(timer);
    // chỉ nạp nội dung một lần khi bài đã về
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, loaded]);

  // Bản phục hồi trong tab
  const recoveryChecked = useRef(false);
  const recoveryKey = `thanhloi-post-draft:${post.id ?? id ?? 'new'}`;
  useEffect(() => {
    if (!editor || !loaded || recoveryChecked.current) return;
    recoveryChecked.current = true;
    let stored: string | null = null;
    try { stored = sessionStorage.getItem(recoveryKey); } catch { /* không có bộ nhớ */ }
    if (!stored) return;
    void (async () => {
      const yes = await confirm({ title: 'Khôi phục bài đang viết dở?', body: 'Trong tab này còn nội dung chưa lưu từ lần soạn trước. Khôi phục để viết tiếp?', confirmLabel: 'Khôi phục', cancelLabel: 'Bỏ bản cũ' });
      try {
        if (!yes) { sessionStorage.removeItem(recoveryKey); return; }
        const draft = JSON.parse(stored) as Post & { schedule_input?: string };
        setPost(previous => ({ ...previous, title: draft.title, slug: draft.slug, excerpt: draft.excerpt, kind: draft.kind, cover_id: draft.cover_id, seo_title: draft.seo_title, seo_description: draft.seo_description }));
        if (draft.schedule_input) setScheduleInput(draft.schedule_input);
        editor.commands.setContent(draft.content, { emitUpdate: false });
        setDoc(draft.content);
        setDirty(true);
      } catch { toast('Không đọc được bản phục hồi. Bài đã lưu trên máy chủ vẫn còn.', 'error'); }
    })();
  }, [editor, loaded, recoveryKey, confirm, toast]);

  useEffect(() => {
    if (!dirty || !editor || !recoveryChecked.current) return;
    const timer = window.setTimeout(() => {
      try { sessionStorage.setItem(recoveryKey, JSON.stringify({ ...latest.current.post, content: editor.getJSON(), schedule_input: latest.current.scheduleInput, revisions: undefined })); }
      catch { /* bộ nhớ trình duyệt đầy hoặc bị chặn */ }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [dirty, doc, post, scheduleInput, editor, recoveryKey]);

  // Cảnh báo khi rời trang còn thay đổi chưa lưu
  useEffect(() => {
    if (!dirty) return;
    const leave = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const navigate = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest?.('a');
      if (!anchor || anchor.target === '_blank' || !anchor.href || event.ctrlKey || event.metaKey || anchor.href.startsWith('javascript') || anchor.getAttribute('href')?.startsWith('#')) return;
      event.preventDefault(); event.stopPropagation();
      void confirm({ title: 'Rời trang khi chưa lưu?', body: 'Bài viết còn thay đổi chưa lưu. Rời đi bây giờ sẽ không giữ lại phần đó.', confirmLabel: 'Rời trang', cancelLabel: 'Ở lại viết tiếp', danger: true }).then(yes => {
        if (!yes) return;
        const target = new URL(anchor.href);
        if (target.origin === window.location.origin) { setDirty(false); router.push(target.pathname + target.search); } else window.location.href = anchor.href;
      });
    };
    document.documentElement.dataset.unsavedPost = 'true';
    window.addEventListener('beforeunload', leave);
    document.addEventListener('click', navigate, true);
    return () => { delete document.documentElement.dataset.unsavedPost; window.removeEventListener('beforeunload', leave); document.removeEventListener('click', navigate, true); };
  }, [dirty, confirm, router]);

  useEffect(() => () => { window.clearTimeout(autosaveTimer.current); window.clearTimeout(snapshotTimer.current); }, []);

  function change<K extends keyof Post>(key: K, value: Post[K]) {
    setPost(previous => ({ ...previous, [key]: value }));
    markDirty();
  }

  /** Lưu bài. silent là tự lưu nháp: không khoá nút, không báo toast, chỉ cập nhật phiên bản. */
  const persist = useCallback(async (status: 'draft' | 'published', action?: PublicationAction, silent = false): Promise<boolean> => {
    const current = latest.current;
    if (!editor || savingRef.current) return false;
    if (current.post.title.trim().length < 3) { if (!silent) { setError('Hãy nhập tiêu đề bài viết, ít nhất 3 ký tự.'); titleRef.current?.focus(); } return false; }
    const scheduled = action === 'schedule' ? vietnamInputToUtc(current.scheduleInput) : null;
    if (action === 'schedule' && (!scheduled || new Date(scheduled).getTime() <= Date.now())) { setError('Chọn ngày giờ đăng ở tương lai theo giờ Việt Nam.'); return false; }
    if (action === 'schedule' && publicationState(current.post.status, current.post.published_at, Date.now()) === 'published' && !await confirm({ title: 'Hẹn giờ cho bài đang đăng?', body: 'Bài sẽ tạm ẩn khỏi website cho tới giờ đã chọn.', confirmLabel: 'Hẹn giờ', cancelLabel: 'Giữ nguyên' })) return false;
    savingRef.current = true;
    if (silent) setAutosaving(true); else { setBusy(true); setError(''); }
    const startedAt = changeId.current;
    try {
      const body = { ...current.post, revisions: undefined, updated_at: undefined, server_now: undefined, slug: current.post.slug || slugify(current.post.title), content: editor.getJSON(), status, publication_action: action, ...(scheduled ? { scheduled_at: scheduled } : {}) };
      const result = await api<Saved>('/api/admin/posts', jsonOptions('POST', body));
      // Cập nhật ngay phiên bản mới nhất, để một lần lưu khác nổ ra trước khi trang vẽ lại không gửi phiên bản cũ.
      latest.current = { ...latest.current, post: { ...latest.current.post, id: result.id, version: result.version }, savedId: result.id };
      setPost(previous => ({ ...previous, id: result.id, version: result.version, status: result.status, published_at: result.published_at, server_now: result.server_now, updated_at: result.updated_at, slug: previous.slug || result.slug }));
      setScheduleInput(publicationState(result.status, result.published_at, new Date(result.server_now ?? Date.now()).getTime()) === 'scheduled' && result.published_at ? vietnamDateTimeInput(result.published_at) : '');
      setSavedAt(new Date());
      setConflict(false);
      // Làm mới danh sách Lịch sử đã lưu sau lần lưu chủ động (tự lưu thì bỏ qua cho nhẹ).
      if (!silent) void api<Saved>(`/api/admin/posts/${result.id}`).then(value => setPost(previous => ({ ...previous, revisions: value.revisions }))).catch(() => {});
      if (changeId.current === startedAt) {
        setDirty(false);
        try { sessionStorage.removeItem(recoveryKey); } catch { /* bỏ qua */ }
      }
      if (!current.post.id) window.history.replaceState(null, '', `/admin/bai-viet/${result.id}`);
      if (!silent) {
        const state = publicationState(result.status, result.published_at, new Date(result.server_now ?? Date.now()).getTime());
        toast(state === 'scheduled' ? `Đã hẹn đăng lúc ${formatVietnamDateTime(result.published_at!)}. Bài chưa hiện ra website.` : state === 'published' ? (current.post.status === 'published' ? 'Đã cập nhật bài trên website.' : 'Đã xuất bản. Bài đang hiện trên website.') : 'Đã lưu bản nháp. Chỉ quản trị viên xem được.');
      }
      return true;
    } catch (failure) {
      const message = (failure as Error).message;
      if (failure instanceof ApiError && failure.status === 409 && message.startsWith('Bài viết đã được cập nhật')) setConflict(true);
      else setError(message);
      return false;
    } finally {
      savingRef.current = false;
      if (silent) setAutosaving(false); else setBusy(false);
    }
  }, [editor, confirm, toast, recoveryKey]);

  const state = publicationState(post.status, post.published_at, now);
  const scheduleChanged = state === 'scheduled' && scheduleInput !== vietnamDateTimeInput(post.published_at!);

  const primary = useCallback((): Promise<boolean> => {
    const status = latest.current.post;
    const current = publicationState(status.status, status.published_at, Date.now());
    if (current === 'scheduled') return persist('published', latest.current.scheduleInput !== vietnamDateTimeInput(status.published_at!) ? 'schedule' : 'save');
    return persist('published', 'publish');
  }, [persist]);

  actionsRef.current = {
    openLink: () => { setLinkValue(String(editor?.getAttributes('link').href ?? '')); setLinkError(''); setLinkOpen(true); },
    ingest: (files, position) => void ingest(files, position),
    autosave: () => {
      const current = latest.current;
      if (!current.dirty || current.busy || publicationState(current.post.status, current.post.published_at, Date.now()) !== 'draft' || current.post.title.trim().length < 3) return;
      void persist('draft', undefined, true);
    },
    save: () => {
      const current = latest.current.post;
      if (publicationState(current.status, current.published_at, Date.now()) === 'draft') void persist('draft'); else void primary();
    },
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); actionsRef.current.save(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ----------------------------- Ảnh, video ----------------------------- */

  async function ingest(files: File[], position?: number) {
    if (!editor) return;
    let at = position ?? editor.state.selection.to;
    for (const file of files) {
      const key = Date.now() + Math.random();
      const problem = checkUpload(file);
      if (problem) { toast(problem, 'error'); continue; }
      setUploads(previous => [...previous, { key, name: file.name, progress: 0 }]);
      try {
        const media = await uploadFile<Media>(file, percent => setUploads(previous => previous.map(item => item.key === key ? { ...item, progress: percent } : item)));
        const isImage = media.mime_type.startsWith('image/');
        const node = isImage ? { type: 'image', attrs: { src: `/api/media/${media.id}`, alt: '', title: '' } } : { type: 'video', attrs: { src: `/api/media/${media.id}`, alt: '', title: '' } };
        editor.chain().insertContentAt(at, node).run();
        if (isImage) { try { editor.commands.setNodeSelection(at); } catch { /* vị trí đã đổi */ } }
        at += 1;
        toast(isImage ? 'Đã chèn ảnh. Hãy thêm mô tả cho ảnh.' : 'Đã chèn video.');
      } catch (failure) { toast((failure as Error).message, 'error'); }
      finally { setUploads(previous => previous.filter(item => item.key !== key)); }
    }
  }

  function insertMedia(media: Media) {
    if (!editor) return;
    if (mediaMode === 'cover') change('cover_id', media.id);
    else if (mediaMode === 'replace') {
      const attrs = editor.getAttributes('image') as { alt?: string; title?: string };
      editor.chain().updateAttributes('image', { src: `/api/media/${media.id}`, alt: media.alt || attrs.alt || '', title: attrs.title || media.caption || '' }).run();
    } else if (media.mime_type.startsWith('image/')) editor.chain().focus().setImage({ src: `/api/media/${media.id}`, alt: media.alt, title: media.caption }).run();
    else editor.chain().focus().insertContent({ type: 'video', attrs: { src: `/api/media/${media.id}`, alt: media.alt, title: media.caption } }).run();
    setMediaMode(null);
  }

  const overlayActions = useMemo(() => ({
    pickMedia: (kind: 'image' | 'video') => setMediaMode(kind),
    replaceImage: () => setMediaMode('replace'),
    editImage: () => { const src = editor?.getAttributes('image').src; if (src) setImageEdit({ mediaId: mediaId(src), target: 'node', ratio: 'free' }); },
    openLink: () => actionsRef.current.openLink(),
  }), [editor]);

  function applyLink() {
    if (!editor) return;
    const value = linkValue.trim();
    if (!value) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setLinkOpen(false); return; }
    if (!safeLink(value)) { setLinkError('Liên kết cần bắt đầu bằng https://, http:// hoặc là đường dẫn trong website, ví dụ /lien-he.'); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: value }).run();
    setLinkOpen(false);
  }

  /* ------------------------------ Khung gợi ý ------------------------------ */

  async function applyTemplate(template: Template) {
    if (!editor) return;
    if (!editor.isEmpty && !await confirm({ title: 'Thay nội dung bằng dàn ý này?', body: 'Nội dung đang viết sẽ được thay bằng các tiêu đề mục của khung.', confirmLabel: 'Thay bằng dàn ý', cancelLabel: 'Giữ nội dung', danger: true })) return;
    editor.commands.setContent({ type: 'doc', content: template.headings.flatMap(text => [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text }] }, { type: 'paragraph' }]) }, { emitUpdate: false });
    setDoc(editor.getJSON() as RichNode);
    change('kind', template.kind);
  }
  async function applyTopic(topic: string) {
    if (post.title.trim() && !await confirm({ title: 'Đổi tiêu đề theo chủ đề này?', body: 'Tiêu đề hiện tại sẽ được thay.', confirmLabel: 'Đổi tiêu đề', cancelLabel: 'Giữ tiêu đề' })) return;
    setPost(previous => ({ ...previous, title: topic, slug: slugEdited ? previous.slug : slugify(topic) }));
    markDirty();
  }
  async function restore(revision: NonNullable<Post['revisions']>[number]) {
    if (!editor || !await confirm({ title: 'Nạp bản cũ vào trình soạn?', body: 'Nội dung hiện tại sẽ được thay bằng bản này. Website chỉ đổi khi anh chị bấm lưu.', confirmLabel: 'Nạp bản cũ', cancelLabel: 'Hủy' })) return;
    const snapshot = revision.snapshot;
    setPost(previous => ({ ...previous, title: snapshot.title, excerpt: snapshot.excerpt, kind: snapshot.kind, cover_id: snapshot.cover_id, seo_title: snapshot.seo_title, seo_description: snapshot.seo_description }));
    editor.commands.setContent(snapshot.content, { emitUpdate: false });
    setDoc(snapshot.content);
    markDirty();
  }

  /* ------------------------------ Xem trước ------------------------------ */

  const previewPayload = useCallback(() => ({
    title: latest.current.post.title, excerpt: latest.current.post.excerpt, kind: latest.current.post.kind, cover_id: latest.current.post.cover_id,
    content: editor?.getJSON() ?? latest.current.post.content, date: new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
  }), [editor]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.type !== 'preview-ready') return;
      (event.source as Window | null)?.postMessage({ type: 'preview-data', payload: previewPayload() }, window.location.origin);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [previewPayload]);

  /* ------------------------------ Hiển thị ------------------------------ */

  if (loadError) return <div className="ed-load"><p className="error-message" role="alert">{loadError}</p><Link href="/admin/bai-viet" className="button button-outline">Về danh sách bài viết</Link></div>;
  if (!loaded) return <div className="ed-load" role="status" aria-label="Đang mở bài viết"><Skeleton height={48} width="60%" /><Skeleton height={28} /><Skeleton height={44} /><Skeleton height={320} /></div>;

  const words = documentWords(doc);
  const secondaryLabel = state === 'scheduled' ? 'Hủy lịch, lưu nháp' : state === 'published' ? 'Chuyển về nháp' : 'Lưu nháp';
  const primaryLabel = state === 'scheduled' ? (scheduleChanged ? 'Đổi lịch đăng' : 'Lưu thay đổi') : state === 'published' ? 'Cập nhật bài' : 'Xuất bản';
  const statusText = busy || autosaving ? 'Đang lưu' : dirty ? (state === 'draft' ? 'Có thay đổi, sẽ tự lưu sau vài giây' : 'Có thay đổi chưa lưu') : savedAt ? `Đã lưu lúc ${clock(savedAt)}` : 'Chưa lưu';
  const shortSecondary = state === 'scheduled' ? 'Hủy lịch' : state === 'published' ? 'Về nháp' : 'Lưu nháp';
  const shortPrimary = state === 'scheduled' ? (scheduleChanged ? 'Đổi lịch' : 'Lưu lịch') : state === 'published' ? 'Cập nhật' : 'Xuất bản';
  const shortStatus = busy || autosaving ? 'Đang lưu' : dirty ? (state === 'draft' ? 'Sẽ tự lưu' : 'Chưa lưu') : savedAt ? `Đã lưu ${clock(savedAt)}` : 'Chưa lưu';
  const statusTone = busy || autosaving ? 'saving' : dirty ? 'dirty' : savedAt ? 'saved' : 'idle';
  const actions = <>
    <button type="button" className="button button-outline" disabled={busy} title="Ctrl+S" onClick={() => void persist('draft')}><Save size={17} /><span className="ed-lbl-long">{secondaryLabel}</span><span className="ed-lbl-short">{shortSecondary}</span></button>
    <button type="button" className="button pressable" disabled={busy} onClick={() => void primary()}>{busy ? <LoaderCircle size={17} className="ed-spin" /> : <Send size={17} />}{busy ? 'Đang lưu' : <><span className="ed-lbl-long">{primaryLabel}</span><span className="ed-lbl-short">{shortPrimary}</span></>}</button>
  </>;

  return <div className="ed-root">
    <div className="ed-top">
      <Link href="/admin/bai-viet" className="back-link"><ArrowLeft size={17} /><span className="ed-top-back">Bài viết</span></Link>
      <span className={`status-badge ${state}`}>{state === 'scheduled' ? 'Đã hẹn đăng' : state === 'published' ? 'Đang đăng' : 'Bản nháp'}</span>
      <span className="ed-status" data-tone={statusTone} role="status" aria-live="polite">{statusTone === 'saving' ? <LoaderCircle size={16} className="ed-spin" /> : statusTone === 'saved' ? <CheckCircle2 size={16} /> : statusTone === 'dirty' ? <AlertTriangle size={16} /> : null}<span className="ed-status-long">{statusText}</span><span className="ed-status-short">{shortStatus}</span></span>
      {post.id && state === 'published' && !dirty && <Link href={postPath(post)} target="_blank" className="link-button ed-top-view"><ExternalLink size={16} />Xem bài trên website</Link>}
      <div className="ed-top-actions">
        <button type="button" className="button button-outline" onClick={() => setPreviewing(value => !value)} aria-pressed={previewing} aria-label={previewing ? 'Tiếp tục viết' : 'Xem trước'}>{previewing ? <><Undo2 size={17} /><span className="ed-btn-label">Tiếp tục viết</span></> : <><Eye size={17} /><span className="ed-btn-label">Xem trước</span></>}</button>
        <button type="button" className="button button-outline ed-panel-toggle" aria-label="Mở thiết lập bài" aria-expanded={panelOpen} aria-controls="ed-aside" onClick={() => panelOpen ? setPanelOpen(false) : openPanel()}><SlidersHorizontal size={17} /><span className="ed-btn-label">Thiết lập</span></button>
        <span className="ed-top-save">{actions}</span>
      </div>
    </div>

    {error && <div className="error-message ed-banner" role="alert">{error}</div>}
    {conflict && <div className="ed-conflict" role="alert">
      <strong>Bài này vừa được lưu ở nơi khác</strong>
      <p>Có thể anh chị đang mở bài ở một tab hoặc một máy khác. Nội dung đang viết ở đây vẫn còn nguyên, chưa bị mất và chưa ghi đè bản kia.</p>
      <div className="ed-stack-row">
        {post.id && <a className="button button-outline" href={`/admin/bai-viet/${post.id}`} target="_blank" rel="noreferrer">Mở bản mới ở tab khác</a>}
        <button type="button" className="button button-outline" onClick={() => { setDirty(false); window.location.reload(); }}>Tải bản mới, bỏ phần đang viết</button>
      </div>
    </div>}

    <div className="ed-body">
      <div className="ed-main" hidden={previewing}>
        <div className="ed-sheet">
          <textarea className="ed-title" ref={titleRef} aria-invalid={Boolean(error) && post.title.trim().length < 3} spellCheck={false} aria-label="Tiêu đề bài viết" rows={1} value={post.title} placeholder="Tiêu đề bài viết" maxLength={200}
            onChange={event => { const title = event.target.value.replace(/[\r\n]+/g, ' '); setPost(previous => ({ ...previous, title, slug: slugEdited ? previous.slug : slugify(title) })); markDirty(); }}
            onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); editor?.commands.focus('start'); } }} />
          <textarea className="ed-excerpt" spellCheck={false} aria-label="Tóm tắt ngắn" rows={2} value={post.excerpt} maxLength={600} placeholder="Tóm tắt ngắn: bài này giúp người đọc biết điều gì" onChange={event => change('excerpt', event.target.value)} />
          <FormatBar editor={editor} onLink={() => actionsRef.current.openLink()} onMedia={kind => setMediaMode(kind)} />
          {uploads.length > 0 && <ul className="adm-uploads ed-uploads" aria-label="Đang tải ảnh lên">{uploads.map(item => <li key={item.key}><span>{item.name}</span><progress value={item.progress} max={100} aria-label={`Tiến trình ${item.name}`} /><span>{item.progress}%</span></li>)}</ul>}
          <div className="ed-canvas" ref={canvas}>
            <EditorContent editor={editor} />
            <EditorOverlays editor={editor} container={canvas} actions={overlayActions} keyHandler={keyHandler} />
          </div>
          <div className="ed-footer"><span>{words} từ</span><span>Khoảng {readingMinutes(words)} phút đọc</span><span className="ed-hint"><kbd>/</kbd> chèn khối<span className="ed-hint-gap" /><kbd>Ctrl+S</kbd> lưu<span className="ed-hint-gap" /><kbd>Ctrl+K</kbd> liên kết<span className="ed-hint-gap" />Kéo thả hoặc dán ảnh vào bài</span></div>
        </div>
      </div>

      {previewing && <div className="ed-preview">
        <div className="ed-preview-bar">
          <div className="adm-seg" role="group" aria-label="Kích thước xem trước">
            <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}><Monitor size={17} />Máy bàn</button>
            <button type="button" aria-pressed={device === 'phone'} onClick={() => setDevice('phone')}><Smartphone size={17} />Điện thoại</button>
          </div>
          <button type="button" className="button button-outline button-small" onClick={() => window.open('/admin/xem-truoc', '_blank')}><ExternalLink size={16} />Mở ở tab mới</button>
        </div>
        <PreviewPane data={previewPayload()} device={device} />
      </div>}

      {panelOpen && <div className="ed-scrim" onClick={() => setPanelOpen(false)} aria-hidden="true" />}
      <aside className="ed-aside" id="ed-aside" ref={drawerRef} data-open={panelOpen} aria-label="Thiết lập bài viết">
        <div className="ed-aside-head"><strong>Thiết lập bài</strong><button type="button" className="button button-outline button-small ed-aside-close" data-autofocus onClick={() => setPanelOpen(false)}><X size={17} />Đóng</button></div>
        <SidePanel post={post} state={state} busy={busy} doc={doc} scheduleInput={scheduleInput} scheduleMin={vietnamDateTimeInput(now + 60000)}
          onScheduleInput={value => { setScheduleInput(value); markDirty(); }}
          onChange={change}
          onSlug={value => { setSlugEdited(true); change('slug', value); }}
          onSave={(status, action) => void persist(status, action)}
          onPickCover={() => setMediaMode('cover')}
          onRemoveCover={() => { const previous = post.cover_id; change('cover_id', null); toast('Đã bỏ ảnh bìa.', 'success', { label: 'Hoàn tác', onClick: () => change('cover_id', previous) }); }}
          onEditCover={() => post.cover_id && setImageEdit({ mediaId: post.cover_id, target: 'cover', ratio: '16:9' })}
          onTemplate={template => void applyTemplate(template)} onTopic={topic => void applyTopic(topic)} onRestore={revision => void restore(revision)} />
      </aside>
    </div>

    <div className="ed-mobilebar">
      <button type="button" className="button button-outline" aria-controls="ed-aside" aria-expanded={panelOpen} onClick={openPanel}><SlidersHorizontal size={17} />Thiết lập</button>
      <button type="button" className="button button-outline" disabled={busy} onClick={() => void persist('draft')}>{shortSecondary}</button>
      <button type="button" className="button pressable" disabled={busy} onClick={() => void primary()}>{busy ? <LoaderCircle size={17} className="ed-spin" /> : <Send size={17} />}{busy ? 'Đang lưu' : shortPrimary}</button>
    </div>

    <Dialog open={mediaMode !== null} onClose={() => setMediaMode(null)} width={1080} title={mediaMode === 'cover' ? 'Chọn ảnh bìa' : mediaMode === 'replace' ? 'Thay ảnh trong bài' : mediaMode === 'video' ? 'Chèn video' : 'Chèn ảnh vào bài'}>
      {mediaMode && <MediaLibrary onSelect={insertMedia} imagesOnly={mediaMode !== 'video'} selectLabel={mediaMode === 'cover' ? 'Chọn làm ảnh bìa' : mediaMode === 'replace' ? 'Dùng ảnh này' : 'Chèn vào bài'} />}
    </Dialog>

    <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} title="Liên kết" width={460} footer={<>
      {editor?.isActive('link') && <button type="button" className="button button-outline" onClick={() => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setLinkOpen(false); }}>Bỏ liên kết</button>}
      <button type="button" className="button" onClick={applyLink}>Áp dụng</button>
    </>}>
      <label>Địa chỉ liên kết<input data-autofocus type="text" inputMode="url" placeholder="https://" value={linkValue} onChange={event => { setLinkValue(event.target.value); setLinkError(''); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); applyLink(); } }} /></label>
      {linkError && <p className="error-message" role="alert">{linkError}</p>}
    </Dialog>

    {imageEdit && <ImageEditor mediaId={imageEdit.mediaId} initialRatio={imageEdit.ratio} onClose={() => setImageEdit(null)} onSaved={media => {
      if (imageEdit.target === 'cover') change('cover_id', media.id);
      else editor?.chain().updateAttributes('image', { src: `/api/media/${media.id}` }).run();
      setImageEdit(null);
    }} />}
  </div>;
}
