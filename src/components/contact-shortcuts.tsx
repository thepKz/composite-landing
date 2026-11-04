'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Phone, MessageCircle, ArrowUpRight } from 'lucide-react';

export default function ContactShortcuts({ company }: { company?: { phone?: string; zalo?: string } }) {
  const pathname = usePathname();
  const [formVisible, setFormVisible] = useState(false);
  const [quoteHref, setQuoteHref] = useState('/lien-he#gui-yeu-cau');
  useEffect(() => {
    const form = document.querySelector('.inquiry-form');
    const section = form?.closest<HTMLElement>('section[id]');
    setQuoteHref(section ? `#${section.id}` : '/lien-he#gui-yeu-cau');
    setFormVisible(false);
    const targets = [form, document.querySelector('.cinematic-hero')].filter((target): target is Element => !!target);
    if (!targets.length) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      setFormVisible(visible.size > 0);
    }, { threshold: 0 });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);
  const phone = company?.phone?.replace(/[\s.()-]/g, '') || '';
  const zalo = company?.zalo?.replace(/[\s.()-]/g, '') || '';
  const valid = (value: string) => /^(?:0\d{9}|\+?84\d{9})$/.test(value);
  return <nav className="contact-shortcuts" aria-label="Liên hệ nhanh">
    {valid(phone) && <a href={`tel:${phone}`}><Phone size={18}/><span>Gọi ngay</span></a>}
    {valid(zalo) && <a href={`https://zalo.me/${zalo.replace(/^\+/, '')}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/><span>Chat Zalo</span></a>}
    {!formVisible && <Link href={quoteHref}><ArrowUpRight size={18}/><span>Nhận báo giá</span></Link>}
  </nav>;
}
