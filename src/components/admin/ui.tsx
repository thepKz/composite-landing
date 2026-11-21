'use client';
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

/* ------------------------------ Hộp thoại ------------------------------ */

const dialogStack: symbol[] = [];
const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Hộp thoại dùng chung. Tiêu điểm vào trong, Tab giữ bên trong, Esc đóng, đóng xong tiêu điểm về nút đã mở.
 * Có chuyển cảnh mở và đóng (giữ trong cây thêm 160ms để chạy xong chuyển cảnh đóng).
 */
export function Dialog({ open, onClose, title, children, footer, width = 520, drawer = false, hideHead = false, label }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode; width?: number; drawer?: boolean; hideHead?: boolean; label?: string;
}) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<'open' | 'closed'>('closed');
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const me = useRef(Symbol('dialog'));
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setState('open')));
      return () => cancelAnimationFrame(frame);
    }
    setState('closed');
    const timer = window.setTimeout(() => setMounted(false), 160);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return;
    const token = me.current;
    dialogStack.push(token);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      const target = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current?.querySelector<HTMLElement>(focusable);
      (target ?? panel.current)?.focus({ preventScroll: true });
    }, 30);
    function onKey(event: KeyboardEvent) {
      if (dialogStack[dialogStack.length - 1] !== token) return;
      if (event.key === 'Escape') { event.stopPropagation(); close.current(); return; }
      if (event.key !== 'Tab' || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(focusable)].filter(item => item.offsetParent !== null || item === document.activeElement);
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey, true);
      const at = dialogStack.indexOf(token); if (at >= 0) dialogStack.splice(at, 1);
      document.body.style.overflow = previousOverflow;
      const back = opener.current;
      if (back && document.contains(back)) back.focus({ preventScroll: true });
    };
  }, [mounted, open]);

  if (!mounted) return null;
  return <div className="adm-overlay" data-state={state} data-drawer={drawer ? '' : undefined} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={panel} className="adm-dialog" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : label} tabIndex={-1} style={{ ['--dialog-w' as string]: `${width}px` }}>
      {!hideHead && <div className="adm-dialog-head"><h2 id={titleId}>{title}</h2><button type="button" className="icon-button" aria-label="Đóng" onClick={onClose}><X size={18} /></button></div>}
      {drawer ? children : <div className="adm-dialog-body">{children}</div>}
      {footer && <div className="adm-dialog-foot">{footer}</div>}
    </div>
  </div>;
}

/* ------------------------------ Xác nhận ------------------------------ */

type ConfirmOptions = { title: string; body?: ReactNode; confirmLabel?: string; cancelLabel?: string; danger?: boolean };
type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const value = useContext(ConfirmContext);
  if (!value) throw new Error('Thiếu ConfirmProvider');
  return value;
}

/* ------------------------------ Thông báo ------------------------------ */

type ToastAction = { label: string; onClick: () => void };
type Toast = { id: number; text: string; tone: 'success' | 'error'; leaving?: boolean; action?: ToastAction };
/** Thông báo ngắn. Có action thì hiện nút (ví dụ Hoàn tác) và giữ lâu hơn. */
type ToastFn = (text: string, tone?: 'success' | 'error', action?: ToastAction) => void;
const ToastContext = createContext<ToastFn | null>(null);

export function useToast(): ToastFn {
  const value = useContext(ToastContext);
  if (!value) throw new Error('Thiếu ToastProvider');
  return value;
}

export function AdminProviders({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);
  const [open, setOpen] = useState(false);

  const dismiss = useCallback((id: number) => {
    setToasts(items => items.map(item => item.id === id ? { ...item, leaving: true } : item));
    window.setTimeout(() => setToasts(items => items.filter(item => item.id !== id)), 160);
  }, []);
  const push = useCallback<ToastFn>((text, tone = 'success', action) => {
    const id = ++counter.current;
    setToasts(items => [...items.slice(-3), { id, text, tone, action }]);
    window.setTimeout(() => dismiss(id), tone === 'error' ? 8000 : action ? 9000 : 4500);
  }, [dismiss]);

  const confirm = useCallback<ConfirmFn>(options => new Promise(resolve => { setDialog({ ...options, resolve }); setOpen(true); }), []);
  function answer(value: boolean) { dialog?.resolve(value); setOpen(false); }

  const confirmValue = useMemo(() => confirm, [confirm]);
  return <ToastContext.Provider value={push}><ConfirmContext.Provider value={confirmValue}><div className="adm-root" style={{ display: 'contents' }}>
    {children}
    <div className="adm-toasts" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => <div key={toast.id} className="adm-toast" data-tone={toast.tone} data-leaving={toast.leaving ? 'true' : undefined} role={toast.tone === 'error' ? 'alert' : 'status'}>
        {toast.tone === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
        <span>{toast.text}</span>
        {toast.action && <button type="button" className="adm-toast-action" onClick={() => { toast.action?.onClick(); dismiss(toast.id); }}>{toast.action.label}</button>}
        <button type="button" aria-label="Tắt thông báo" onClick={() => dismiss(toast.id)}><X size={16} /></button>
      </div>)}
    </div>
    <Dialog open={open} onClose={() => answer(false)} title={dialog?.title ?? ''} width={460} footer={<>
      <button type="button" className="button button-outline" onClick={() => answer(false)}>{dialog?.cancelLabel ?? 'Hủy'}</button>
      <button type="button" className={dialog?.danger ? 'button button-solid-danger' : 'button'} data-autofocus onClick={() => answer(true)}>{dialog?.confirmLabel ?? 'Đồng ý'}</button>
    </>}>{dialog?.body && <div>{dialog.body}</div>}</Dialog>
  </div></ConfirmContext.Provider></ToastContext.Provider>;
}

/* ------------------------------ Khung xương ------------------------------ */

export function Skeleton({ width = '100%', height = 16, style }: { width?: number | string; height?: number | string; style?: React.CSSProperties }) {
  return <span className="adm-skeleton" aria-hidden="true" style={{ width, height, ...style }} />;
}

export function SkeletonRows({ rows = 5, height = 56 }: { rows?: number; height?: number }) {
  return <div role="status" aria-label="Đang tải" style={{ display: 'grid', gap: 8 }}>{Array.from({ length: rows }, (_, index) => <Skeleton key={index} height={height} />)}</div>;
}
