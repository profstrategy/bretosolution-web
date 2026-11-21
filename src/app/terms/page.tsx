import type { Metadata } from 'next';
import { seoContent } from '@/content/seo';
import TermsView from '@/views/TermsView';

export const metadata: Metadata = {
  title: seoContent.pages.terms.title,
  description: seoContent.pages.terms.description,
  alternates: {
    canonical: seoContent.pages.terms.canonicalPath,
  },
  openGraph: {
    type: 'website',
    siteName: seoContent.siteName,
    locale: 'en',
    title: seoContent.pages.terms.title,
    description: seoContent.pages.terms.description,
    url: seoContent.pages.terms.canonicalPath,
  },
};

export default function TermsPage() {
  return <TermsView />;
}
