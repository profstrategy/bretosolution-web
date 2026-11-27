import type { Metadata } from 'next';
import { EmailsView } from '@/components/admin/emails/EmailsView';
import { adminEmailsCopy } from '@/content/admin';
import { getAdminInboxAddress } from '@/lib/admin/inboxAddress';
import { requireAdminPage } from '@/lib/auth/requireAdmin';

export const metadata: Metadata = {
  title: adminEmailsCopy.metaTitle,
};

export default async function AdminEmailsPage() {
  // The layout already guards this route; pages check too (defence in depth).
  await requireAdminPage();
  return <EmailsView inboxAddress={getAdminInboxAddress()} />;
}
