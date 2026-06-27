import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
