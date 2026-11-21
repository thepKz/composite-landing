import './product-tile.css';

type Kind = 'septic' | 'modules' | 'tank' | 'generic';

// Ô thay thế cho nhóm chưa có ảnh xác nhận: không gán ảnh sản phẩm sai, thay bằng nền vật liệu trang trí,
// màu thương hiệu, thông số lớn và hình vẽ nét đơn giản của dạng bể (tự vẽ bằng SVG).
export function kindOf(slug: string): Kind {
  if (slug === 'be-phot-composite' || slug === 'be-phot-va-xu-ly-nuoc-thai') return 'septic';
  if (slug === 'be-xu-ly-nuoc-thai') return 'modules';
  if (slug === 'bon-chua-hoa-chat') return 'tank';
  return 'generic';
}

const baseLine = { strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

// Hình vẽ nét của dạng bể. Màu nét truyền vào để dùng được cả trên nền tối (chanh) và nền sáng (xanh lá).
export function Drawing({ kind, color = '#d3f56b', className = 'pt-art' }: { kind: Kind; color?: string; className?: string }) {
  const line = { ...baseLine, stroke: color };
  const body = { ...line, fill: color + '1a' };
  return <svg className={className} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
    <path d="M12 124 H228" {...line} strokeDasharray="2 8" />
    {kind === 'septic' && <>
      <rect x="30" y="58" width="180" height="58" rx="29" {...body} />
      <path d="M90 58 V116 M150 58 V116" {...line} strokeWidth={2} />
      <path d="M54 58 V46 H74 V58 M114 58 V46 H134 V58 M174 58 V46 H194 V58" {...line} />
      <path d="M8 78 H30 M210 96 H232" {...line} />
    </>}
    {kind === 'modules' && <>
      <rect x="12" y="66" width="60" height="50" rx="8" {...body} />
      <rect x="90" y="50" width="60" height="66" rx="8" {...body} />
      <rect x="168" y="66" width="60" height="50" rx="8" {...body} />
      <path d="M72 90 H90 M150 90 H168 M30 66 V56 H54 V66 M108 50 V38 H132 V50 M186 66 V56 H210 V66" {...line} />
      <circle cx="120" cy="96" r="4" {...line} strokeWidth={2} /><circle cx="132" cy="84" r="3" {...line} strokeWidth={2} />
    </>}
    {kind === 'tank' && <>
      <path d="M82 38 Q120 6 158 38 V112 H82 Z" {...body} />
      <path d="M82 38 H158" {...line} strokeWidth={2} />
      <path d="M96 112 V124 M144 112 V124" {...line} />
      <path d="M158 100 H196 M178 44 V112 M178 56 H168 M178 72 H168 M178 88 H168" {...line} strokeWidth={2} />
      <path d="M110 22 V12 H130 V22" {...line} />
    </>}
    {kind === 'generic' && <>
      <rect x="40" y="48" width="160" height="68" rx="10" {...body} />
      <path d="M40 72 H200" {...line} strokeWidth={2} />
    </>}
  </svg>;
}

export default function ProductTile({ slug, stat, label, compact = false }: { slug: string; stat?: string; label?: string; compact?: boolean }) {
  // Con số lớn đã tự nói nghĩa nên không in nhãn kèm theo (label chỉ dùng khi có chủ ý truyền vào).
  return <div className={`pt-tile${compact ? ' is-compact' : ''}`}>
    <Drawing kind={kindOf(slug)} />
    {stat && <strong className="pt-stat">{stat}</strong>}
    {label && <span className="pt-label">{label}</span>}
  </div>;
}
