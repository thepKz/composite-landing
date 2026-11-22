import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; preview?: boolean; external?: boolean };

/** Liên kết nội bộ dùng Link, liên kết ngoài dùng thẻ a, bản xem trước thì không đi đâu cả. */
export function Anchor({ preview, external, href, children, ...rest }: AnchorProps) {
  if (preview) return <a {...rest} href="#" onClick={event => event.preventDefault()}>{children}</a>;
  if (external) return <a {...rest} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  return <Link {...rest} href={href}>{children}</Link>;
}
