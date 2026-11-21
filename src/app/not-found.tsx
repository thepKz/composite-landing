import NotFoundView from '@/components/pages/not-found-view';

// Trang 404 gốc: dự phòng khi lỗi xảy ra ngoài khu vực công khai. Khu công khai dùng not-found riêng có đầu và chân trang.
export default function NotFound() { return <div className="public-site"><NotFoundView/></div>; }
