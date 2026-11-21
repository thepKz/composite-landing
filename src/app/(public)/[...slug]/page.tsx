import { notFound } from 'next/navigation';

// Mọi đường dẫn không khớp trang nào sẽ rơi vào đây, trả mã 404 và hiện trang 404 có đầu trang, chân trang của website.
export const metadata = { title: 'Không tìm thấy trang', robots: { index: false } };
export default function CatchAll() { notFound(); }
