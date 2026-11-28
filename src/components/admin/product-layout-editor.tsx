'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Trash2 } from 'lucide-react';
import { emptySection, moveSectionImage, productSections, type ProductSection, type SectionLayout } from '@/lib/product-layout';
import { Dialog } from './ui';
import MediaLibrary from './media-library';
import './product-layout-editor.css';

export default function ProductLayoutEditor({ value, onChange, disabled }: { value: SectionLayout[]; onChange: (value: SectionLayout[]) => void; disabled?: boolean }) {
  const [selecting, setSelecting] = useState<ProductSection | null>(null);
  const [dragged, setDragged] = useState<{ section: ProductSection; id: string } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const update = (section: SectionLayout) => onChange(value.some(item => item.section === section.section) ? value.map(item => item.section === section.section ? section : item) : [...value, section]);
  function move(from: ProductSection, id: string, to: ProductSection, before?: string) {
    if (disabled) return;
    const next = moveSectionImage(value, from, id, to, before);
    if (next === value) setAnnouncement('Không thể chuyển: phần nhận đã đủ 6 ảnh hoặc đã có ảnh này.');
    else { onChange(next); setAnnouncement(`Đã chuyển ảnh vào phần ${productSections.find(item => item.id === to)?.label}. Chưa lưu.`); }
    setDragged(null);
  }
  const selection = selecting ? value.find(item => item.section === selecting) ?? emptySection(selecting) : null;

  return <section className="admin-panel settings-form product-layout-editor" aria-labelledby="section-photos-title">
    <h2 id="section-photos-title">Ảnh trong từng phần</h2>
    <p className="field-help">Thêm ảnh cạnh bảng dung tích, phần cấu tạo hoặc nội dung khác. Kéo ảnh để đổi thứ tự, kéo sang phần khác để chuyển. Trên điện thoại, dùng nút mũi tên và ô Chuyển đến.</p>
    {productSections.map(({ id, label }) => {
      const section = value.find(item => item.section === id) ?? emptySection(id);
      return <details key={id} className="product-layout-section" open={undefined} onDragOver={event => { if (dragged && !disabled) event.preventDefault(); }} onDrop={event => { event.preventDefault(); if (dragged) move(dragged.section, dragged.id, id); }}>
        <summary>{label}<span>{section.images.length ? `${section.images.length} ảnh` : 'Chưa thêm ảnh'}</span></summary>
        <div className="product-layout-body">
          <div className="form-row">
            <label>Vị trí ảnh<select disabled={disabled} value={section.position} onChange={event => update({ ...section, position: event.target.value as SectionLayout['position'] })}>
              <option value="right">Bên phải nội dung</option><option value="left">Bên trái nội dung</option><option value="before">Trước nội dung, toàn chiều rộng</option><option value="after">Sau nội dung, toàn chiều rộng</option>
            </select></label>
            <label>Cách xếp ảnh<select disabled={disabled} value={section.layout} onChange={event => update({ ...section, layout: event.target.value as SectionLayout['layout'] })}><option value="stack">Xếp dọc</option><option value="grid">Lưới 2 cột</option></select></label>
          </div>
          {section.images.length > 0 && <div className={`product-layout-preview is-${section.position}`} aria-label={`Xem bố cục: ${label}`}>
            <div className="product-layout-preview__copy"><strong>{label}</strong><span>Vị trí nội dung hiện có</span></div>
            <div className={`product-layout-preview__images is-${section.layout}`}>{section.images.map(image => <img key={image.media_id} src={`/api/media/${image.media_id}`} alt={image.alt || 'Ảnh xem bố cục'} width={160} height={120} loading="lazy" style={{ objectFit: image.fit }}/>)}</div>
          </div>}
          <ol className="product-layout-images" aria-label={`Ảnh trong phần ${label}`}>
            {section.images.map((image, index) => <li key={image.media_id} draggable={!disabled} onDragStart={event => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', image.media_id); setDragged({ section: id, id: image.media_id }); }} onDragEnd={() => setDragged(null)} onDrop={event => { if (!dragged) return; event.preventDefault(); event.stopPropagation(); move(dragged.section, dragged.id, id, image.media_id); }}>
              <div className="product-layout-image-head"><GripVertical size={18} aria-hidden="true"/><strong>Ảnh {index + 1}</strong><div className="inline-actions">
                <button type="button" className="icon-button" disabled={disabled || index === 0} aria-label={`Đưa ảnh ${index + 1} lên trước trong ${label}`} onClick={() => move(id, image.media_id, id, section.images[index - 1]?.media_id)}><ArrowLeft size={18}/></button>
                <button type="button" className="icon-button" disabled={disabled || index === section.images.length - 1} aria-label={`Đưa ảnh ${index + 1} xuống sau trong ${label}`} onClick={() => move(id, image.media_id, id, section.images[index + 2]?.media_id)}><ArrowRight size={18}/></button>
                <button type="button" className="icon-button" disabled={disabled} aria-label={`Bỏ ảnh ${index + 1} khỏi ${label}`} onClick={() => update({ ...section, images: section.images.filter(item => item.media_id !== image.media_id) })}><Trash2 size={18}/></button>
              </div></div>
              <div className="product-layout-image-fields">
                <img src={`/api/media/${image.media_id}`} alt={image.alt || `Ảnh ${index + 1}`} width={160} height={120} loading="lazy"/>
                <div><label>Mô tả ảnh<input disabled={disabled} maxLength={500} value={image.alt} onChange={event => update({ ...section, images: section.images.map(item => item.media_id === image.media_id ? { ...item, alt: event.target.value } : item) })}/></label>
                <label>Chú thích dưới ảnh<input disabled={disabled} maxLength={500} value={image.caption} onChange={event => update({ ...section, images: section.images.map(item => item.media_id === image.media_id ? { ...item, caption: event.target.value } : item) })}/></label>
                <div className="form-row"><label>Khung ảnh<select disabled={disabled} value={image.fit} onChange={event => update({ ...section, images: section.images.map(item => item.media_id === image.media_id ? { ...item, fit: event.target.value as 'contain' | 'cover' } : item) })}><option value="contain">Hiện toàn bộ ảnh</option><option value="cover">Lấp đầy khung</option></select></label>
                <label>Chuyển đến<select disabled={disabled} value={id} onChange={event => move(id, image.media_id, event.target.value as ProductSection)}>{productSections.map(target => <option key={target.id} value={target.id}>{target.label}</option>)}</select></label></div></div>
              </div>
            </li>)}
          </ol>
          <button type="button" className="button button-outline" disabled={disabled || section.images.length >= 6} onClick={() => setSelecting(id)}><ImagePlus size={17} aria-hidden="true"/>Thêm ảnh vào phần này</button>
          <p className="field-help">Tối đa 6 ảnh mỗi phần. Trên màn hình nhỏ, ảnh xếp trên hoặc dưới nội dung để giữ độ rộng dễ đọc.</p>
        </div>
      </details>;
    })}
    <p role="status" className="field-help">{announcement}</p>
    <Dialog open={Boolean(selection)} onClose={() => setSelecting(null)} width={1080} title={`Chọn ảnh: ${productSections.find(item => item.id === selecting)?.label ?? ''}`}>
      {selection && <MediaLibrary imagesOnly taken={selection.images.map(image => image.media_id)} room={6 - selection.images.length} onSelectMany={items => { update({ ...selection, images: [...selection.images, ...items.map(item => ({ media_id: item.id, alt: item.alt, caption: item.caption, fit: 'contain' as const }))] }); setSelecting(null); }}/>}
    </Dialog>
  </section>;
}
