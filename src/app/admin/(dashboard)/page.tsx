import { redirect } from 'next/navigation';
import { requireAdminPage } from '@/lib/auth/requireAdmin';

export default async function AdminIndexPage() {
  // The layout already guards this route; pages check too (defence in depth).
  await requireAdminPage();
  redirect('/admin/emails');
}
