import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import AdminShell from '@/components/admin/admin-shell';
export default async function ProtectedLayout({children}:{children:React.ReactNode}){const user=await currentUser();if(!user)redirect('/admin/login');return <AdminShell name={user.name}>{children}</AdminShell>;}
