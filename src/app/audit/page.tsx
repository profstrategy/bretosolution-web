import type { Metadata } from 'next';
import { seoContent } from '@/content/seo';
import AuditView from '@/views/AuditView';

export const metadata: Metadata = {
  title: seoContent.pages.audit.title,
  description: seoContent.pages.audit.description,
  alternates: {
    canonical: seoContent.pages.audit.canonicalPath,
  },
  openGraph: {
    type: 'website',
    siteName: seoContent.siteName,
    locale: 'en',
    title: seoContent.pages.audit.title,
    description: seoContent.pages.audit.description,
    url: seoContent.pages.audit.canonicalPath,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AuditPage() {
  return <AuditView />;
}
