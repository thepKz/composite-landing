'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2, Crop } from 'lucide-react';
import { Dialog, useToast } from './ui';
import { api, jsonOptions } from './client-api';

export type EditedMedia = { id: string; original_name: string; mime_type: string; size_bytes: number; alt: string; caption: string; used_count?: number };
type Rect = { x: number; y: number; w: number; h: number };
type Ratio = 'free' | '16:9' | '4:3' | '1:1';
const ratios: { id: Ratio; label: string; value?: number }[] = [
  { id: 'free', label: 'Tự do' },
  { id: '16:9', label: '16:9', value: 16 / 9 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '1:1', label: '1:1', value: 1 },
];
const full: Rect = { x: 0, y: 0, w: 1, h: 1 };
const minimum = 0.05;
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Khung lớn nhất đúng tỉ lệ, đặt giữa ảnh. Tỉ lệ tính theo điểm ảnh của ảnh sau khi xoay. */
function fitRatio(ratio: number, width: number, height: number): Rect {
  let w = 1, h = (width / ratio) / height;
  if (h > 1) { h = 1; w = (height * ratio) / width; }
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

/**
 * Cắt, xoay, lật ảnh trong thư viện. Xem trước ngay trong trang, lưu thành ảnh MỚI qua máy chủ.
 * Ảnh gốc giữ nguyên vì bài khác có thể đang dùng.
 */
export default function ImageEditor({ mediaId, initialRatio = 'free', onClose, onSaved }: { mediaId: string; initialRatio?: Ratio; onClose: () => void; onSaved: (media: EditedMedia) => void }) {
  const toast = useToast();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState('');
  const [rotate, setRotate] = useState<0 | 90 | 180 | 270>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [ratio, setRatio] = useState<Ratio>(initialRatio);
  const [crop, setCrop] = useState<Rect>(full);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 640, h: 400 });

  useEffect(() => {
    const element = new window.Image();
    element.onload = () => setImage(element);
    element.onerror = () => setLoadError('Không mở được ảnh này.');
    element.src = `/api/media/${mediaId}`;
  }, [mediaId]);

  useEffect(() => {
    const target = stage.current;
    if (!target) return;
    const measure = () => setStageSize({ w: Math.max(240, target.clientWidth - 24), h: Math.min(440, Math.max(240, window.innerHeight - 320)) });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    return () => observer.disconnect();
  }, [image]);

  const turned = rotate === 90 || rotate === 270;
  const naturalW = image ? (turned ? image.naturalHeight : image.naturalWidth) : 1;
  const naturalH = image ? (turned ? image.naturalWidth : image.naturalHeight) : 1;
  const scale = Math.min(stageSize.w / naturalW, stageSize.h / naturalH, 1);
  const shownW = Math.max(1, Math.round(naturalW * scale));
  const shownH = Math.max(1, Math.round(naturalH * scale));
  const ratioValue = ratios.find(item => item.id === ratio)?.value;

  // Vẽ ảnh đã xoay và lật: xoay trước, lật sau, giống thứ tự máy chủ xử lý.
  useEffect(() => {
    if (!image || !canvas.current) return;
    const element = canvas.current;
    element.width = shownW; element.height = shownH;
    const context = element.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, shownW, shownH);
    context.save();
    context.translate(shownW / 2, shownH / 2);
    context.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    context.rotate((rotate * Math.PI) / 180);
    const drawW = image.naturalWidth * scale, drawH = image.naturalHeight * scale;
    context.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    context.restore();
  }, [image, rotate, flipH, flipV, shownW, shownH, scale]);

  const resetCrop = useCallback((nextRatio: Ratio, width: number, height: number) => {
    const value = ratios.find(item => item.id === nextRatio)?.value;
    setCrop(value ? fitRatio(value, width, height) : full);
  }, []);

  // Đặt khung cắt theo tỉ lệ ban đầu khi ảnh đã nạp xong.
  const first = useRef(true);
  useEffect(() => { if (image && first.current) { first.current = false; resetCrop(initialRatio, image.naturalWidth, image.naturalHeight); } }, [image, initialRatio, resetCrop]);

  function transform(change: () => void) { change(); }
  function turn(direction: 1 | -1) {
    const next = ((rotate + direction * 90 + 360) % 360) as 0 | 90 | 180 | 270;
    const nextTurned = next === 90 || next === 270;
    setRotate(next);
    if (image) resetCrop(ratio, nextTurned ? image.naturalHeight : image.naturalWidth, nextTurned ? image.naturalWidth : image.naturalHeight);
  }
  function chooseRatio(next: Ratio) { setRatio(next); resetCrop(next, naturalW, naturalH); }

  const drag = useRef<{ mode: string; startX: number; startY: number; origin: Rect } | null>(null);
  function startDrag(event: React.PointerEvent, mode: string) {
    event.preventDefault(); event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    drag.current = { mode, startX: event.clientX, startY: event.clientY, origin: crop };
  }
  function moveDrag(event: React.PointerEvent) {
    const state = drag.current, bounds = box.current?.getBoundingClientRect();
    if (!state || !bounds) return;
    const dx = (event.clientX - state.startX) / bounds.width, dy = (event.clientY - state.startY) / bounds.height;
    const o = state.origin;
    if (state.mode === 'move') { setCrop({ ...o, x: clamp(o.x + dx, 0, 1 - o.w), y: clamp(o.y + dy, 0, 1 - o.h) }); return; }
    // Kéo góc: góc đối diện đứng yên.
    const left = state.mode.includes('w'), top = state.mode.includes('n');
    const anchorX = left ? o.x + o.w : o.x, anchorY = top ? o.y + o.h : o.y;
    let pointX = clamp((left ? o.x : o.x + o.w) + dx, 0, 1), pointY = clamp((top ? o.y : o.y + o.h) + dy, 0, 1);
    let w = Math.max(minimum, Math.abs(pointX - anchorX)), h = Math.max(minimum, Math.abs(pointY - anchorY));
    if (ratioValue) {
      // Giữ tỉ lệ theo điểm ảnh thật: w * naturalW / (h * naturalH) = ratioValue.
      const heightFromWidth = (w * naturalW) / ratioValue / naturalH;
      if (heightFromWidth <= h) h = heightFromWidth; else w = (h * naturalH * ratioValue) / naturalW;
      const maxW = left ? anchorX : 1 - anchorX, maxH = top ? anchorY : 1 - anchorY;
      if (w > maxW) { w = maxW; h = (w * naturalW) / ratioValue / naturalH; }
      if (h > maxH) { h = maxH; w = (h * naturalH * ratioValue) / naturalW; }
    }
    pointX = left ? anchorX - w : anchorX; pointY = top ? anchorY - h : anchorY;
    setCrop({ x: clamp(left ? pointX : anchorX, 0, 1), y: clamp(top ? pointY : anchorY, 0, 1), w, h });
  }
  function endDrag() { drag.current = null; }

  const isFullCrop = crop.w > 0.999 && crop.h > 0.999;
  const changed = rotate !== 0 || flipH || flipV || !isFullCrop;
  const resultSize = useMemo(() => image ? `${Math.round(crop.w * naturalW)} x ${Math.round(crop.h * naturalH)} điểm ảnh` : '', [image, crop, naturalW, naturalH]);

  async function save() {
    if (!changed || busy) return;
    setBusy(true); setError('');
    try {
      const result = await api<EditedMedia>(`/api/admin/media/${mediaId}/edit`, jsonOptions('POST', {
        rotate, flip_h: flipH, flip_v: flipV, crop: isFullCrop ? null : { x: crop.x, y: crop.y, width: crop.w, height: crop.h },
      }));
      toast('Đã lưu thành ảnh mới. Ảnh gốc vẫn giữ nguyên.');
      onSaved(result);
    } catch (failure) { setError((failure as Error).message); }
    finally { setBusy(false); }
  }

  const handles: [string, React.CSSProperties][] = [
    ['nw', { left: -11, top: -11, cursor: 'nwse-resize' }], ['ne', { right: -11, top: -11, cursor: 'nesw-resize' }],
    ['sw', { left: -11, bottom: -11, cursor: 'nesw-resize' }], ['se', { right: -11, bottom: -11, cursor: 'nwse-resize' }],
  ];

  return <Dialog open onClose={onClose} title="Chỉnh sửa ảnh" width={940} footer={<>
    <button type="button" className="button button-outline" onClick={onClose}>Hủy</button>
    <button type="button" className="button" disabled={!changed || busy || !image} onClick={() => void save()}>{busy ? 'Đang lưu' : 'Lưu thành ảnh mới'}</button>
  </>}>
    {loadError ? <p className="error-message" role="alert">{loadError}</p> : <div className="adm-imgedit">
      <div className="adm-imgedit-stage" ref={stage}>
        {!image ? <span style={{ color: '#fff' }} role="status">Đang mở ảnh</span> : <div className="adm-imgedit-box" ref={box} style={{ width: shownW, height: shownH }}>
          <canvas ref={canvas} aria-label="Xem trước ảnh đang chỉnh" />
          <div className="adm-crop" role="group" aria-label="Vùng cắt" style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }}
            onPointerDown={event => startDrag(event, 'move')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
            {handles.map(([mode, style]) => <span key={mode} className="adm-crop-handle" style={style} onPointerDown={event => startDrag(event, mode)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} />)}
          </div>
        </div>}
      </div>
      <div className="adm-imgedit-side">
        <div><p className="adm-side-title">Tỉ lệ cắt</p>
          <div className="adm-seg" role="group" aria-label="Tỉ lệ cắt">{ratios.map(item => <button key={item.id} type="button" aria-pressed={ratio === item.id} onClick={() => chooseRatio(item.id)}>{item.id === 'free' && <Crop size={16} />}{item.label}</button>)}</div>
        </div>
        <div><p className="adm-side-title">Xoay và lật</p>
          <div className="adm-seg">
            <button type="button" onClick={() => turn(-1)} aria-label="Xoay trái"><RotateCcw size={16} />Trái</button>
            <button type="button" onClick={() => turn(1)} aria-label="Xoay phải"><RotateCw size={16} />Phải</button>
            <button type="button" aria-pressed={flipH} onClick={() => transform(() => setFlipH(value => !value))} aria-label="Lật ngang"><FlipHorizontal2 size={16} />Ngang</button>
            <button type="button" aria-pressed={flipV} onClick={() => transform(() => setFlipV(value => !value))} aria-label="Lật dọc"><FlipVertical2 size={16} />Dọc</button>
          </div>
        </div>
        <p className="field-help">Kéo khung sáng để chọn vùng giữ lại. Kéo bốn góc để đổi cỡ.</p>
        {resultSize && <p className="field-help">Ảnh mới: {resultSize}</p>}
        <p className="field-help">Kết quả được lưu thành ảnh mới trong thư viện. Ảnh gốc không bị thay đổi.</p>
        {error && <p className="error-message" role="alert">{error}</p>}
      </div>
    </div>}
  </Dialog>;
}
