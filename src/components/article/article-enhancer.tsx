'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ChevronLeft, ChevronRight, X } from 'lucide-react';

type Zoomable = { src: string; alt: string; caption: string };

/**
 * Phần chạy trên máy người đọc của trang bài viết, gắn vào markup đã dựng sẵn trên máy chủ bằng data-attribute.
 * Không có JavaScript thì bài vẫn đọc được đầy đủ.
 */
export default function ArticleEnhancer() {
  const progress = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [items, setItems] = useState<Zoomable[]>([]);
  const [index, setIndex] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);
  const closing = useRef(false);

  const say = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);
  }, []);

  const closeLightbox = useCallback(() => {
    const element = dialog.current;
    if (!element || !element.open || closing.current) return;
    closing.current = true;
    element.classList.add('is-closing');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => { element.close(); element.classList.remove('is-closing'); closing.current = false; }, reduce ? 0 : 170);
  }, []);

  // Tiến độ đọc và nút lên đầu trang
  useEffect(() => {
    const body = document.querySelector<HTMLElement>('[data-art-body]');
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      let ratio = 0;
      if (body) {
        const rect = body.getBoundingClientRect();
        const total = rect.height - viewport * 0.4;
        ratio = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : (rect.top < 0 ? 1 : 0);
      }
      if (progress.current) progress.current.style.transform = `scaleX(${ratio})`;
      setShowTop(window.scrollY > viewport * 0.9);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  // Mục lục: đánh dấu mục đang đọc
  useEffect(() => {
    const headings = [...document.querySelectorAll<HTMLElement>('.art-prose h2[id], .art-prose h3[id]')];
    const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
    if (!headings.length || !links.length) return;
    const mark = (id: string) => {
      for (const link of links) {
        const on = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      }
    };
    const visible = new Set<string>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) { if (entry.isIntersecting) visible.add(entry.target.id); else visible.delete(entry.target.id); }
      const current = headings.find(heading => visible.has(heading.id));
      if (current) { mark(current.id); return; }
      // Không có tiêu đề nào trong vùng đọc: lấy tiêu đề gần nhất phía trên
      const above = headings.filter(heading => heading.getBoundingClientRect().top < 140);
      mark(above.length ? above[above.length - 1].id : '');
    }, { rootMargin: '-120px 0px -62% 0px', threshold: 0 });
    headings.forEach(heading => observer.observe(heading));
    return () => observer.disconnect();
  }, []);

  // Bảng rộng: báo còn cuộn được
  useEffect(() => {
    const tables = [...document.querySelectorAll<HTMLElement>('[data-table]')];
    if (!tables.length) return;
    const clean: (() => void)[] = [];
    for (const wrap of tables) {
      const update = () => {
        const max = wrap.scrollWidth - wrap.clientWidth;
        wrap.classList.toggle('is-scrollable', max > 2);
        wrap.classList.toggle('at-end', wrap.scrollLeft >= max - 2);
        wrap.classList.toggle('at-start', wrap.scrollLeft <= 2);
      };
      update();
      wrap.addEventListener('scroll', update, { passive: true });
      const observer = new ResizeObserver(update);
      observer.observe(wrap);
      clean.push(() => { wrap.removeEventListener('scroll', update); observer.disconnect(); });
    }
    return () => clean.forEach(fn => fn());
  }, []);

  // Bấm trong trang: phóng to ảnh, chép liên kết, mục lục, lên đầu trang
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const zoom = target.closest<HTMLElement>('[data-zoom]');
      if (zoom && zoom.closest('.art')) {
        const all = [...document.querySelectorAll<HTMLElement>('.art [data-zoom]')];
        const list = all.map(button => {
          const img = button.querySelector('img');
          const figure = button.closest('figure');
          return { src: img?.currentSrc || img?.src || '', alt: img?.alt ?? '', caption: figure?.querySelector('figcaption')?.textContent ?? '' };
        });
        setItems(list);
        setIndex(Math.max(0, all.indexOf(zoom)));
        dialog.current?.showModal();
        return;
      }
      const copy = target.closest<HTMLElement>('[data-copy-link]');
      if (copy) {
        const url = window.location.origin + window.location.pathname;
        const done = () => say('Đã sao chép liên kết');
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done, () => say('Chưa sao chép được, hãy chép từ thanh địa chỉ'));
        else {
          const area = document.createElement('textarea');
          area.value = url; area.style.position = 'fixed'; area.style.opacity = '0';
          document.body.appendChild(area); area.select();
          try { document.execCommand('copy'); done(); } catch { say('Chưa sao chép được, hãy chép từ thanh địa chỉ'); }
          area.remove();
        }
        return;
      }
      const toc = target.closest<HTMLAnchorElement>('[data-toc-link]');
      if (toc) {
        const details = toc.closest('details');
        if (details) details.open = false;
        return;
      }
      if (target.closest('[data-to-top]')) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [say]);

  const step = useCallback((delta: number) => setIndex(current => (current + delta + items.length) % Math.max(items.length, 1)), [items.length]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const onCancel = (event: Event) => { event.preventDefault(); closeLightbox(); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    element.addEventListener('cancel', onCancel);
    element.addEventListener('keydown', onKey);
    return () => { element.removeEventListener('cancel', onCancel); element.removeEventListener('keydown', onKey); };
  }, [closeLightbox, step]);

  const current = items[index];
  return <>
    <div className="art-progress" aria-hidden="true"><div ref={progress} /></div>
    <button type="button" className={`art-top pressable${showTop ? ' is-on' : ''}`} data-to-top aria-label="Lên đầu trang" tabIndex={showTop ? 0 : -1}><ArrowUp size={20} aria-hidden="true" /></button>
    <div className={`art-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">{toast}</div>
    <dialog ref={dialog} className="art-lightbox" aria-label="Xem ảnh lớn" onClick={event => { if (event.target === dialog.current) closeLightbox(); }}>
      <div className="art-lightbox-bar">
        <span className="art-lightbox-count">{items.length > 1 ? `${index + 1} trên ${items.length}` : ''}</span>
        <button ref={closeButton} type="button" className="art-lightbox-btn pressable" onClick={closeLightbox} aria-label="Đóng"><X size={22} aria-hidden="true" /></button>
      </div>
      {current && <figure className="art-lightbox-fig">
        <img key={current.src} src={current.src} alt={current.alt} />
        {current.caption && <figcaption>{current.caption}</figcaption>}
      </figure>}
      {items.length > 1 && <>
        <button type="button" className="art-lightbox-btn art-lightbox-prev pressable" onClick={() => step(-1)} aria-label="Ảnh trước"><ChevronLeft size={26} aria-hidden="true" /></button>
        <button type="button" className="art-lightbox-btn art-lightbox-next pressable" onClick={() => step(1)} aria-label="Ảnh sau"><ChevronRight size={26} aria-hidden="true" /></button>
      </>}
    </dialog>
  </>;
}
