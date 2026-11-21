// Mỗi lần đổi trang công khai, khối nội dung được dựng lại và hiện dần nhẹ.
// Dùng template thay vì layout để hoạt họa chạy lại theo từng đường dẫn.
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="tl-page-enter">{children}</div>;
}
