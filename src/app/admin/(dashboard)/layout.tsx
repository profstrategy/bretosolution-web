import type { ReactNode } from 'react';
import { AdminProviders } from '@/components/admin/AdminProviders';
import { AdminShell } from '@/components/admin/AdminShell';
import { Toaster } from '@/components/admin/Toaster';
import { requireAdminPage } from '@/lib/auth/requireAdmin';

export const dynamic = 'force-dynamic';

/** Every page in (dashboard) requires an admin session. */
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();

  return (
    <AdminProviders>
      <AdminShell email={session.email}>{children}</AdminShell>
      <Toaster />
    </AdminProviders>
  );
}
