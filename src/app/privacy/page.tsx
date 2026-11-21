import type { Metadata } from 'next';
import { seoContent } from '@/content/seo';
import PrivacyView from '@/views/PrivacyView';

export const metadata: Metadata = {
  title: seoContent.pages.privacy.title,
  description: seoContent.pages.privacy.description,
  alternates: {
    canonical: seoContent.pages.privacy.canonicalPath,
  },
  openGraph: {
    type: 'website',
    siteName: seoContent.siteName,
    locale: 'en',
    title: seoContent.pages.privacy.title,
    description: seoContent.pages.privacy.description,
    url: seoContent.pages.privacy.canonicalPath,
  },
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
