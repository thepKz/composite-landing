import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import AdminShell from '@/components/admin/admin-shell';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  const fresh = await db.query("SELECT count(*)::int AS total FROM inquiries WHERE status='new'").catch(() => null);
  return <AdminShell name={user.name} newInquiries={fresh?.rows[0].total ?? 0}>{children}</AdminShell>;
}
