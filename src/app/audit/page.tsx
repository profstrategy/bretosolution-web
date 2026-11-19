import type { Metadata } from 'next';
import { auditPageContent } from '@/content/audit';
import { siteDescription } from '@/content/site';
import AuditView from '@/views/AuditView';

export const metadata: Metadata = {
  title: auditPageContent.documentTitle,
  description: siteDescription,
};

export default function AuditPage() {
  return <AuditView />;
}
