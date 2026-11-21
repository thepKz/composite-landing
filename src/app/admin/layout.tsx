import './admin.css';
import './admin-editor.css';

export const metadata = { title: 'Quản trị Thành Lợi', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default function AdminRoot({ children }: { children: React.ReactNode }) { return children; }
