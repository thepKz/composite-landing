'use client';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Droplets, Fish, Flame, Lightbulb, LoaderCircle, Phone, Shapes } from 'lucide-react';
import { facts, quoteScales } from '@/lib/site-facts';
import './inquiry-form.css';

type Key = keyof typeof quoteScales;
type Status = 'idle' | 'sending' | 'done' | 'error';
type Values = { name: string; phone: string; province: string; consent: boolean; website: string; message: string };

const productChoices: { key: Key; Icon: typeof Flame }[] = [
  { key: 'biogas', Icon: Flame },
  { key: 'septic', Icon: Droplets },
  { key: 'fish', Icon: Fish },
  { key: 'other', Icon: Shapes },
];
const stepNames = ['Liên hệ', 'Sản phẩm', 'Quy mô', 'Gửi'];

// Đoán nhóm từ tên sản phẩm mà các trang khác truyền vào.
function keyFromName(name: string): Key | null {
  const text = name.toLowerCase();
  if (!text.trim()) return null;
  if (/thùng|xe gom|hóa chất|yêu cầu/.test(text)) return 'other';
  if (text.includes('biogas')) return 'biogas';
  if (/phốt|xử lý nước thải/.test(text)) return 'septic';
  if (/thủy sản|koi|nuôi trồng|\bcá\b/.test(text)) return 'fish';
  return 'other';
}

function checkField(field: 'name' | 'phone' | 'province' | 'consent', values: Values) {
  if (field === 'name') return values.name.trim().length >= 2 ? '' : 'Nhập họ tên từ 2 chữ cái trở lên.';
  if (field === 'phone') {
    const digits = values.phone.replace(/\D/g, '');
    return /^\+?[0-9\s().-]{9,20}$/.test(values.phone.trim()) && digits.length >= 9 && digits.length <= 15 ? '' : 'Nhập số điện thoại có ít nhất 9 chữ số, ví dụ 0912345678.';
  }
  if (field === 'province') return values.province.trim().length >= 2 ? '' : 'Nhập tỉnh hoặc thành phố nơi lắp đặt, ví dụ Phú Thọ.';
  return values.consent ? '' : 'Chọn ô đồng ý để Thành Lợi được gọi lại cho anh/chị.';
}

// Tên sự kiện để trang khác (khối chọn nhanh quy mô ở trang sản phẩm) chọn sẵn quy mô cho biểu mẫu mà không tải lại trang.
export const QUOTE_SCALE_EVENT = 'tl:quote-scale';
export type QuoteScaleDetail = { product?: string; label: string; hint?: string };
const plain = (text: string) => text.toLowerCase().replace(/s+/g, ' ').trim();

export default function InquiryForm({ product = '', scale = '', demo = false, hours = facts.hours, hotlineTel = facts.hotlines[0].tel }: { product?: string; scale?: string; compact?: boolean; demo?: boolean; hours?: string; hotlineTel?: string }) {
  const preset = keyFromName(product);
  const uid = useId();
  const [step, setStep] = useState(preset ? 3 : 1);
  const [maxStep, setMaxStep] = useState(preset ? 3 : 1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [productKey, setProductKey] = useState<Key | null>(preset);
  const [scaleIndex, setScaleIndex] = useState(-1);
  const [extraScale, setExtraScale] = useState<{ label: string; hint: string } | null>(null);
  const [values, setValues] = useState<Values>({ name: '', phone: '', province: '', consent: false, website: '', message: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [jumpToSend, setJumpToSend] = useState(false);
  const submitting = useRef(false);
  const title = useRef<HTMLHeadingElement>(null);
  const successTitle = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const auto = useRef<number>(0);
  const latestNext = useRef<() => void>(() => {});

  const errors = {
    name: checkField('name', values),
    phone: checkField('phone', values),
    province: checkField('province', values),
    consent: checkField('consent', values),
  };
  const contactValid = !errors.name && !errors.phone && !errors.province;
  const scales = productKey ? quoteScales[productKey] : null;
  const options: { label: string; hint: string }[] = scales ? [...scales.options, ...(extraScale ? [extraScale] : [])] : [];
  const chosenScale = scaleIndex >= 0 ? options[scaleIndex] ?? null : null;
  const productLabel = productKey ? (preset && product.trim() ? product.trim() : quoteScales[productKey].label) : '';

  // Đổi bước thì đưa tiêu điểm về tiêu đề bước mới để người dùng bàn phím và đọc màn hình đi tiếp.
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    title.current?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => { if (status === 'done') successTitle.current?.focus({ preventScroll: true }); }, [status]);
  useEffect(() => () => window.clearTimeout(auto.current), []);

  // Chọn sẵn quy mô: từ thuộc tính scale lúc dựng, hoặc từ sự kiện của trang khi khách bấm một quy mô.
  function applyScale(detail: QuoteScaleDetail) {
    const key = (detail.product ? keyFromName(detail.product) : null) ?? productKey ?? preset;
    if (!key) return;
    const list = quoteScales[key].options;
    const found = list.findIndex(option => plain(option.label) === plain(detail.label));
    setProductKey(key);
    if (found >= 0) { setExtraScale(null); setScaleIndex(found); }
    else { setExtraScale({ label: detail.label, hint: detail.hint ?? '' }); setScaleIndex(list.length); }
    setStep(current => current < 3 ? 3 : current);
    setMaxStep(current => Math.max(current, 3));
  }
  const applyRef = useRef(applyScale);
  applyRef.current = applyScale;
  useEffect(() => {
    const listener = (event: Event) => { const detail = (event as CustomEvent<QuoteScaleDetail>).detail; if (detail?.label) applyRef.current(detail); else if (detail && detail.label === '') { setScaleIndex(-1); setExtraScale(null); } };
    window.addEventListener(QUOTE_SCALE_EVENT, listener);
    return () => window.removeEventListener(QUOTE_SCALE_EVENT, listener);
  }, []);
  useEffect(() => { if (scale) applyRef.current({ product, label: scale }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  function setField<K extends keyof Values>(field: K, value: Values[K]) { setValues(current => ({ ...current, [field]: value })); }
  function touch(...fields: string[]) { setTouched(current => ({ ...current, ...Object.fromEntries(fields.map(field => [field, true])) })); }
  function show(field: 'name' | 'phone' | 'province' | 'consent') { return touched[field] ? errors[field] : ''; }

  function goTo(target: number, mode: 'forward' | 'back') {
    window.clearTimeout(auto.current);
    setDirection(mode);
    setStep(target);
    setMaxStep(current => Math.max(current, target));
  }
  function focusFirstInvalid() {
    const order: ('name' | 'phone' | 'province')[] = ['name', 'phone', 'province'];
    const first = order.find(field => errors[field]);
    if (first) requestAnimationFrame(() => document.getElementById(`${uid}-${first}`)?.focus());
  }
  function next() {
    if (step === 1) {
      touch('name', 'phone', 'province');
      if (!contactValid) { focusFirstInvalid(); return; }
      if (jumpToSend && productKey) { setJumpToSend(false); goTo(4, 'forward'); } else goTo(2, 'forward');
    } else if (step === 2) {
      if (!productKey) return;
      goTo(3, 'forward');
    } else if (step === 3) {
      if (!contactValid) { setJumpToSend(true); goTo(1, 'back'); }
      else goTo(4, 'forward');
    }
  }
  latestNext.current = next;
  function back() { if (step > 1) goTo(step - 1, 'back'); }
  // Chọn bằng chuột hoặc chạm thì tự sang bước kế tiếp, bàn phím thì giữ nguyên để người dùng tự quyết.
  function advanceAfterPointer(detail: number) {
    if (detail === 0) return;
    window.clearTimeout(auto.current);
    auto.current = window.setTimeout(() => latestNext.current(), 240);
  }
  function chooseProduct(key: Key) {
    if (key !== productKey) { setProductKey(key); setScaleIndex(-1); setExtraScale(null); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4) { next(); return; }
    if (demo || submitting.current) return;
    touch('consent', 'name', 'phone', 'province');
    if (!contactValid) { setJumpToSend(true); goTo(1, 'back'); focusFirstInvalid(); return; }
    if (errors.consent || !productKey) return;
    submitting.current = true; setStatus('sending'); setError('');
    const body = {
      name: values.name, phone: values.phone, province: values.province, product: productLabel,
      scale: chosenScale?.label ?? '', scaleHint: chosenScale?.hint ?? '',
      message: values.message, purpose: 'quotation', consent: 'yes', website: values.website,
    };
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Chưa gửi được yêu cầu. Anh/chị vui lòng thử lại.');
      setStatus('done');
    } catch (failure) {
      const offline = failure instanceof TypeError;
      setError(offline || !(failure instanceof Error) ? 'Mất kết nối mạng. Thông tin của anh/chị vẫn còn nguyên, hãy bấm Gửi yêu cầu để thử lại.' : failure.message);
      setStatus('error');
    } finally { submitting.current = false; }
  }

  function reset() {
    setValues({ name: '', phone: '', province: '', consent: false, website: '', message: '' });
    setTouched({}); setScaleIndex(-1); setExtraScale(null); setProductKey(preset); setStatus('idle'); setError(''); setJumpToSend(false);
    setStep(preset ? 3 : 1); setMaxStep(preset ? 3 : 1); setDirection('forward');
  }

  if (status === 'done') {
    const rows = [['Họ tên', values.name.trim()], ['Điện thoại', values.phone.trim()], ['Tỉnh thành', values.province.trim()], ['Sản phẩm', productLabel], chosenScale ? ['Quy mô', chosenScale.label] : null].filter((row): row is string[] => !!row);
    return <div className="tl-form tl-form-success" role="status">
      <CheckCircle2 size={48} aria-hidden="true" />
      <h3 ref={successTitle} tabIndex={-1}>Đã nhận yêu cầu</h3>
      <p>Kỹ sư Thành Lợi sẽ gọi lại trong 15 đến 60 phút giờ làm việc.</p>
      <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <p className="tl-form-hours">Giờ làm việc: {hours}</p>
      <div className="tl-form-actions">
        <a className="tl-form-button is-solid pressable" href={`tel:${hotlineTel}`}><Phone size={20} aria-hidden="true" />Gọi hotline</a>
        <button type="button" className="tl-form-button is-line pressable" onClick={reset}>Gửi thêm</button>
      </div>
    </div>;
  }

  const titles = ['Thông tin liên hệ', 'Anh/chị quan tâm sản phẩm nào', scales?.question ?? 'Quy mô sử dụng', 'Ghi chú và gửi'];
  const sending = status === 'sending';

  return <form onSubmit={submit} className="tl-form" noValidate aria-busy={sending}>
    {demo && <p className="tl-form-demo" role="note">Bản xem thử: biểu mẫu chưa gửi hoặc lưu thông tin.</p>}
    <ol className="tl-form-steps" aria-label="Các bước">
      {stepNames.map((name, index) => {
        const number = index + 1;
        const state = number === step ? 'current' : number < step || (number <= maxStep && number !== step) ? 'done' : 'todo';
        return <li key={name} data-state={state}>
          <button type="button" disabled={number > maxStep || sending} aria-current={number === step ? 'step' : undefined} aria-label={`Bước ${number}: ${name}`} onClick={() => goTo(number, number < step ? 'back' : 'forward')}>
            <span className="tl-form-dot">{state === 'done' ? <Check size={16} aria-hidden="true" /> : number}</span>
            <span className="tl-form-step-name">{name}</span>
          </button>
        </li>;
      })}
    </ol>
    <p className="tl-sr" aria-live="polite">Bước {step} trên 4: {titles[step - 1]}</p>

    <div className="tl-form-panel" key={step} data-direction={direction}>
      <h3 className="tl-form-title" ref={title} tabIndex={-1} id={`${uid}-title`}>{titles[step - 1]}</h3>

      {step === 1 && <div className="tl-form-fields">
        {jumpToSend && <p className="tl-form-note">Quy mô đã chọn. Cho Thành Lợi biết cách liên hệ để gửi báo giá.</p>}
        <div className="tl-field" data-invalid={!!show('name')}>
          <label htmlFor={`${uid}-name`}>Họ và tên</label>
          <input id={`${uid}-name`} className="tl-input" value={values.name} maxLength={100} autoComplete="name" placeholder="Nguyễn Văn A" aria-invalid={!!show('name')} aria-describedby={show('name') ? `${uid}-name-error` : undefined} onChange={event => setField('name', event.target.value)} onBlur={() => touch('name')} />
          {show('name') && <p className="tl-field-error" id={`${uid}-name-error`}>{show('name')}</p>}
        </div>
        <div className="tl-field" data-invalid={!!show('phone')}>
          <label htmlFor={`${uid}-phone`}>Số điện thoại có Zalo</label>
          <input id={`${uid}-phone`} className="tl-input" type="tel" inputMode="tel" value={values.phone} maxLength={20} autoComplete="tel" placeholder="0912345678" aria-invalid={!!show('phone')} aria-describedby={show('phone') ? `${uid}-phone-error` : undefined} onChange={event => setField('phone', event.target.value)} onBlur={() => touch('phone')} />
          {show('phone') && <p className="tl-field-error" id={`${uid}-phone-error`}>{show('phone')}</p>}
        </div>
        <div className="tl-field" data-invalid={!!show('province')}>
          <label htmlFor={`${uid}-province`}>Tỉnh thành</label>
          <input id={`${uid}-province`} className="tl-input" value={values.province} maxLength={100} autoComplete="address-level1" placeholder="Phú Thọ" aria-invalid={!!show('province')} aria-describedby={show('province') ? `${uid}-province-error` : undefined} onChange={event => setField('province', event.target.value)} onBlur={() => touch('province')} />
          {show('province') && <p className="tl-field-error" id={`${uid}-province-error`}>{show('province')}</p>}
        </div>
      </div>}

      {step === 2 && <fieldset className="tl-choices tl-choices-grid" aria-labelledby={`${uid}-title`}>
        {productChoices.map(({ key, Icon }) => <label key={key} className="tl-choice tl-choice-product">
          <input type="radio" name={`${uid}-product`} value={key} checked={productKey === key} onChange={() => chooseProduct(key)} onClick={event => advanceAfterPointer(event.detail)} />
          <span className="tl-choice-body"><Icon size={32} aria-hidden="true" /><strong>{quoteScales[key].label}</strong></span>
        </label>)}
      </fieldset>}

      {step === 3 && scales && <>
        <fieldset className="tl-choices" aria-labelledby={`${uid}-title`}>
          {options.map((option, index) => <label key={option.label} className="tl-choice">
            <input type="radio" name={`${uid}-scale`} value={option.label} checked={scaleIndex === index} onChange={() => setScaleIndex(index)} onClick={event => advanceAfterPointer(event.detail)} />
            <span className="tl-choice-body"><strong>{option.label}</strong>{option.hint && <small>{option.hint}</small>}</span>
          </label>)}
        </fieldset>
        <div className="tl-hint" aria-live="polite" data-visible={!!chosenScale?.hint}>{chosenScale?.hint && <><Lightbulb size={20} aria-hidden="true" /><span>{chosenScale.hint}</span></>}</div>
      </>}
      {step === 3 && !scales && <p className="tl-form-note">Hãy quay lại và chọn sản phẩm trước.</p>}

      {step === 4 && <div className="tl-form-fields">
        <ul className="tl-summary" aria-label="Lựa chọn của anh/chị">
          {productLabel && <li>{productLabel}</li>}
          {chosenScale && <li>{chosenScale.label}</li>}
          {values.province.trim() && <li>{values.province.trim()}</li>}
        </ul>
        <div className="tl-field">
          <label htmlFor={`${uid}-message`}>Ghi chú</label>
          <textarea id={`${uid}-message`} className="tl-input" rows={3} maxLength={2000} value={values.message} placeholder="Số lượng, kích thước mặt bằng, địa điểm lắp đặt" onChange={event => setField('message', event.target.value)} />
        </div>
        <div className="tl-hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={event => setField('website', event.target.value)} /></label></div>
        <div className="tl-field" data-invalid={!!show('consent')}>
          <label className="tl-consent"><input type="checkbox" checked={values.consent} aria-invalid={!!show('consent')} aria-describedby={show('consent') ? `${uid}-consent-error` : undefined} onChange={event => { setField('consent', event.target.checked); touch('consent'); }} /><span>Tôi đồng ý để Thành Lợi dùng thông tin này để liên hệ tư vấn. <a href="/chinh-sach-bao-mat">Chính sách bảo mật</a></span></label>
          {show('consent') && <p className="tl-field-error" id={`${uid}-consent-error`}>{show('consent')}</p>}
        </div>
        {status === 'error' && <p className="tl-form-alert" role="alert">{error}</p>}
      </div>}
    </div>

    <div className="tl-form-actions">
      {step > 1 && <button type="button" className="tl-form-button is-line pressable" onClick={back} disabled={sending}><ArrowLeft size={20} aria-hidden="true" />Quay lại</button>}
      {step < 4 && <button type="button" className="tl-form-button is-solid pressable" onClick={next} disabled={step === 2 && !productKey}>Tiếp tục<ArrowRight size={20} aria-hidden="true" /></button>}
      {step === 4 && <button type="submit" className="tl-form-button is-cta pressable" disabled={demo || sending}>{demo ? 'Chưa mở nhận yêu cầu' : sending ? <><LoaderCircle className="tl-spin" size={20} aria-hidden="true" />Đang gửi</> : <>Gửi yêu cầu<ArrowRight size={20} aria-hidden="true" /></>}</button>}
    </div>
    {step === 4 && !demo && <p className="tl-form-promise">Báo giá trong 15 đến 60 phút, hỗ trợ vận chuyển và lắp đặt toàn quốc.</p>}
  </form>;
}
