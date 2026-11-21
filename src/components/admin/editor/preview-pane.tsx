'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PreviewArticle, type PreviewData } from '../preview-frame';

let stylesheetCache: string[] | null = null;

/** Lấy các bảng kiểu của trang xem trước (cùng bảng kiểu với trang công khai) để nạp vào khung xem. */
async function previewStylesheets(): Promise<string[]> {
  if (stylesheetCache) return stylesheetCache;
  const response = await fetch('/admin/xem-truoc', { credentials: 'same-origin' });
  const html = await response.text();
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  stylesheetCache = [...parsed.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map(link => link.getAttribute('href') ?? '').filter(Boolean);
  return stylesheetCache;
}

/**
 * Khung xem trước ngay trong trang. Website đặt X-Frame-Options là DENY nên không nhúng được một trang riêng,
 * thay vào đó khung này tự nạp bảng kiểu công khai rồi dựng bài vào bên trong (cùng nguồn, không qua mạng thêm).
 */
export default function PreviewPane({ data, device }: { data: PreviewData; device: 'desktop' | 'phone' }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [srcDoc, setSrcDoc] = useState('');
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    previewStylesheets().then(hrefs => {
      if (cancelled) return;
      const links = hrefs.map(href => `<link rel="stylesheet" href="${href.replace(/"/g, '')}">`).join('');
      setSrcDoc(`<!doctype html><html lang="vi" class="${document.documentElement.className}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${links}<base target="_blank"></head><body><div class="public-site" id="preview-root"></div></body></html>`);
    }).catch(() => { if (!cancelled) setError('Không mở được bản xem trước. Hãy thử lại.'); });
    return () => { cancelled = true; };
  }, []);

  function attach() {
    const root = frame.current?.contentDocument?.getElementById('preview-root');
    if (root) setTarget(root);
  }

  return <div className="ed-preview-stage" data-device={device}>
    {error ? <p className="error-message" role="alert">{error}</p> : <iframe ref={frame} title="Xem trước bài viết" className="ed-preview-frame" srcDoc={srcDoc || undefined} onLoad={attach} />}
    {target && createPortal(<PreviewArticle data={data} />, target)}
  </div>;
}
