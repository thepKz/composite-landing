'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProductCard from '@/components/product-card';
import type { Product } from '@/lib/catalogue';

export type CatalogueItem = { key: string; product: Product; href: string; title: string; field: string; rank?: number };
type Field = { key: string; label: string };

// Danh mục có bộ lọc theo lĩnh vực. Lọc ngay tại chỗ, không tải lại trang, có chuyển cảnh nhẹ.
export default function CatalogueBrowser({ items, fields, initial }: { items: CatalogueItem[]; fields: Field[]; initial: string }) {
  const [active, setActive] = useState(initial);
  const [round, setRound] = useState(0);
  const shown = active ? items.filter(item => item.field === active) : items;
  const flagship = shown.filter(item => item.rank);
  const others = shown.filter(item => !item.rank);
  // Đủ ba dòng mũi nhọn thì bày thành khối bento: một thẻ lớn bên trái, hai thẻ nằm ngang bên phải.
  const bento = flagship.length === 3;

  function choose(key: string) {
    if (key === active) return;
    setActive(key);
    setRound(value => value + 1);
    try { window.history.replaceState(null, '', key ? `?nhom=${encodeURIComponent(key)}` : window.location.pathname); } catch { /* bỏ qua */ }
  }

  return <div className="tp-browser">
    <div className="tp-filter-row">
      <div className="tp-filters" role="group" aria-label="Lọc theo lĩnh vực">
        <button type="button" className="tp-filter pressable" aria-pressed={!active} onClick={() => choose('')}>Tất cả<span>{items.length}</span></button>
        {fields.map(field => {
          const count = items.filter(item => item.field === field.key).length;
          return count ? <button type="button" key={field.key} className="tp-filter pressable" aria-pressed={active === field.key} onClick={() => choose(field.key)}>{field.label}<span>{count}</span></button> : null;
        })}
      </div>
      <Link href="/lien-he#gui-yeu-cau" className="tp-text-link">Nhờ kỹ sư chọn giúp <ArrowUpRight size={18} aria-hidden="true"/></Link>
    </div>
    <p className="tp-sr" role="status" aria-live="polite">Hiển thị {shown.length} nhóm sản phẩm</p>

    {flagship.length > 0 && <section aria-labelledby="tp-flagship-title">
      <h2 id="tp-flagship-title" className="tp-sr">{active ? 'Dòng mũi nhọn' : 'Ba dòng mũi nhọn'}</h2>
      <div className={bento ? 'tp-bento' : 'tp-grid tp-grid-3'} key={`f${round}`}>
        {flagship.map((item, index) => <ProductCard key={item.key} product={item.product} href={item.href} title={item.title} rank={item.rank} index={index} still showCategory={!active} feature={bento && index === 0} wide={bento && index > 0}/>)}
      </div>
    </section>}

    {others.length > 0 && <section aria-labelledby="tp-others-title">
      <h2 id="tp-others-title" className="tp-sr">{flagship.length ? 'Các dòng khác' : 'Sản phẩm'}</h2>
      <div className="tp-grid tp-grid-4" key={`o${round}`}>
        {others.map((item, index) => <ProductCard key={item.key} product={item.product} href={item.href} title={item.title} index={index + flagship.length} still compact showCategory={!active}/>)}
      </div>
    </section>}
  </div>;
}
