import type { CSSProperties } from 'react';
import type { Photo } from '@/lib/product-photos';

type Props = {
  photo: Photo;
  /** 'contain' (mặc định): thấy trọn ảnh trên nền trung tính. 'natural': khung theo đúng tỉ lệ ảnh, không để dải nền. */
  fit?: 'contain' | 'natural';
  /** Tỉ lệ khung (rộng chia cao) khi fit là contain. Mặc định 4/3 */
  ratio?: number;
  /** Cỡ ảnh: 'm' ảnh chính, 't' ảnh nhỏ, 'f' ảnh lớn */
  size?: 'm' | 't' | 'f';
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Chữ thay thế khác alt gốc */
  alt?: string;
};

/** Khung ảnh chữ nhật bo nhẹ cho trang phụ. Không cắt góc, không dáng lạ, không object-fit: cover. */
export default function PhotoFrame({ photo, fit = 'contain', ratio = 4 / 3, size = 'm', sizes, priority = false, className, style, alt }: Props) {
  const src = size === 't' ? photo.thumb : size === 'f' ? photo.full : photo.src;
  const r = fit === 'natural' ? photo.width / photo.height : ratio;
  return <figure className={`pf${fit === 'natural' ? ' is-natural' : ''}${className ? ` ${className}` : ''}`} style={{ aspectRatio: String(r), ...style }}>
    <img src={src} alt={alt ?? photo.alt} width={photo.width} height={photo.height} sizes={sizes} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async"/>
  </figure>;
}
