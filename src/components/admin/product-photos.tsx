'use client';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react';
import { MAX_PRODUCT_PHOTOS, moveItem, photoCountText } from '@/lib/product-media';

// Mục "Ảnh sản phẩm" trong màn sửa sản phẩm: lưới ảnh nhỏ theo thứ tự, thêm, bỏ, đưa lên trước hoặc xuống sau bằng nút.
// Ảnh đầu tiên là ảnh đại diện. Việc lưu do nút lưu của cả màn sản phẩm lo.
export default function ProductPhotos({ ids, onChange, onAdd, status, statusKind, hasBuiltIn, disabled }: {
  ids: string[]; onChange: (ids: string[]) => void; onAdd: () => void; status: string; statusKind: 'error' | 'busy' | 'warn' | 'ok' | ''; hasBuiltIn: boolean; disabled?: boolean;
}) {
  const [announce, setAnnounce] = useState('');
  const addButton = useRef<HTMLButtonElement>(null);
  const full = ids.length >= MAX_PRODUCT_PHOTOS;

  function move(index: number, step: -1 | 1) {
    const target = index + step;
    if (target < 0 || target >= ids.length) return;
    onChange(moveItem(ids, index, step));
    setAnnounce(`Ảnh đã chuyển sang vị trí ${target + 1}${target === 0 ? ', thành ảnh đại diện' : ''}`);
  }
  function remove(index: number) {
    onChange(ids.filter((_, i) => i !== index));
    setAnnounce(`Đã bỏ ảnh ${index + 1}`);
    requestAnimationFrame(() => addButton.current?.focus({ preventScroll: true }));
  }

  return <section className="admin-panel settings-form pp-section" aria-labelledby="pp-title">
    <div className="panel-title"><h2 id="pp-title">Ảnh sản phẩm</h2><button ref={addButton} type="button" className="button button-outline" disabled={disabled || full} onClick={onAdd}><ImagePlus size={17} aria-hidden="true" />Thêm ảnh</button></div>
    <p className="pp-count" role="status">{photoCountText(ids.length)}</p>
    <p className="field-help">Ảnh đầu tiên là ảnh đại diện. Dùng nút mũi tên để đổi chỗ ảnh.</p>
    {ids.length ? <ol className="pp-grid" aria-label="Ảnh của sản phẩm theo thứ tự">
      {ids.map((id, index) => <li key={id} className="pp-tile" data-first={index === 0 || undefined}>
        <div className="pp-frame"><img src={`/api/media/${id}`} alt={`Ảnh ${index + 1}`} loading="lazy" width={200} height={150} /></div>
        <span className="pp-number">{index === 0 ? 'Ảnh đại diện' : `Ảnh ${index + 1}`}</span>
        <div className="pp-actions">
          <button type="button" className="icon-button" aria-label={`Đưa ảnh ${index + 1} lên trước`} disabled={disabled || index === 0} onClick={() => move(index, -1)}><ArrowLeft size={18} aria-hidden="true" /></button>
          <button type="button" className="icon-button" aria-label={`Đưa ảnh ${index + 1} xuống sau`} disabled={disabled || index === ids.length - 1} onClick={() => move(index, 1)}><ArrowRight size={18} aria-hidden="true" /></button>
          <button type="button" className="icon-button pp-remove" aria-label={`Bỏ ảnh ${index + 1}`} disabled={disabled} onClick={() => remove(index)}><Trash2 size={18} aria-hidden="true" /></button>
        </div>
      </li>)}
    </ol> : <p className="product-cover-empty">{hasBuiltIn ? 'Bạn chưa thêm ảnh nào. Website đang dùng ảnh có sẵn của sản phẩm này.' : 'Chưa có ảnh. Hãy thêm ảnh thật để khách nhìn thấy sản phẩm.'}</p>}
    {ids.length > 0 && hasBuiltIn && <p className="field-help">Ảnh có sẵn của website vẫn hiện sau ảnh bạn thêm.</p>}
    <div className="inline-actions pp-foot">
      {full && <span className="field-help">Đã đủ {MAX_PRODUCT_PHOTOS} ảnh, bỏ bớt ảnh để thêm ảnh khác.</span>}
      {status && <span className={`pp-status${statusKind ? ` is-${statusKind}` : ''}`} role={statusKind === 'error' ? 'alert' : 'status'}>{status}</span>}
    </div>
    <p className="tp-sr pp-live" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{announce}</p>
  </section>;
}
