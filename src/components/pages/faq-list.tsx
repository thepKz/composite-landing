import { Plus } from 'lucide-react';

// Hỏi đáp dạng mở rộng bằng thẻ details gốc: chạy được cả khi không có JavaScript, có chuyển cảnh bằng CSS.
export default function FaqList({ items, name = 'faq' }: { items: readonly { q: string; a: string }[]; name?: string }) {
  return <div className="tp-faq">
    {items.map(item => <details key={item.q} name={name} className="tp-faq-item">
      <summary><span>{item.q}</span><Plus size={22} aria-hidden="true"/></summary>
      <p>{item.a}</p>
    </details>)}
  </div>;
}
