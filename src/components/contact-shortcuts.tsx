'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FileText, MessageCircle, Phone } from 'lucide-react';
import { resolveContact, type ContactInfo } from '@/lib/contact-info';

// Ba nút ghim: ở điện thoại là thanh dưới cùng, ở máy bàn là cụm nút nổi góc phải dưới.
// Tự lùi xuống khi biểu mẫu báo giá đang hiện để không đè lên ô nhập.
export default function ContactShortcuts({ contact = resolveContact() }: { contact?: ContactInfo }) {
  const pathname = usePathname();
  const [formVisible, setFormVisible] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const sentinel = useRef<HTMLSpanElement>(null);
  const [quoteHref, setQuoteHref] = useState('/lien-he#gui-yeu-cau');

  useEffect(() => {
    const form = document.querySelector('.tl-form');
    const section = form?.closest<HTMLElement>('section[id]');
    setQuoteHref(section ? `#${section.id}` : '/lien-he#gui-yeu-cau');
    setFormVisible(false);
    if (!form) return;
    const observer = new IntersectionObserver(entries => setFormVisible(entries.some(entry => entry.isIntersecting)), { threshold: 0.05 });
    observer.observe(form);
    return () => observer.disconnect();
  }, [pathname]);

  // Ở đầu trang thì khung thấp ẩn thanh liên hệ cho đỡ chiếm chỗ, cuộn đi thì hiện (quan sát một mốc ở đầu trang, không nghe sự kiện cuộn).
  useEffect(() => {
    const mark = sentinel.current;
    if (!mark) return;
    const observer = new IntersectionObserver(entries => setAtTop(entries[0].isIntersecting));
    observer.observe(mark);
    return () => observer.disconnect();
  }, [pathname]);

  const phone = contact.hotlines[0].tel;
  const zalo = contact.zalo;

  return <><span ref={sentinel} className="tl-top-sentinel" aria-hidden="true" /><nav className="tl-dock" data-hidden={formVisible} data-top={atTop} aria-label="Liên hệ nhanh">
    <a href={`tel:${phone}`} className="tl-dock-call pressable" aria-label="Gọi ngay"><Phone size={20} aria-hidden="true" /><span>Gọi ngay</span></a>
    <a href={`https://zalo.me/${zalo}`} target="_blank" rel="noopener noreferrer" className="tl-dock-zalo pressable" aria-label="Chat Zalo"><MessageCircle size={20} aria-hidden="true" /><span>Chat Zalo</span></a>
    <Link href={quoteHref} className="tl-dock-quote pressable" aria-label="Nhận báo giá"><FileText size={20} aria-hidden="true" /><span>Nhận báo giá</span></Link>
  </nav></>;
}
