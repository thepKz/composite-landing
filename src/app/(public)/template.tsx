import { ViewTransition } from 'react';

// Mỗi lần đổi trang công khai, khối nội dung được dựng lại. Dùng template thay vì layout để chạy lại theo từng đường dẫn.
// Trình duyệt có View Transitions: ViewTransition lo hiện dần (tl-page-in) và mờ đi (tl-page-out), cùng các cặp morph đặt tên ở từng trang.
// Trình duyệt không hỗ trợ: lớp tl-page-enter (chrome.css) hiện dần như cũ. Motion.css tắt lớp này khi View Transitions chạy để tránh chụp trang mới lúc còn trong suốt.
export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition name="tl-page" enter="tl-page-in" exit="tl-page-out" default="none">
      <div className="tl-page-enter">{children}</div>
    </ViewTransition>
  );
}
