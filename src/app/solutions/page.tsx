import type { Metadata } from 'next';
import { seoContent } from '@/content/seo';
import SolutionsView from '@/views/SolutionsView';

export const metadata: Metadata = {
  title: seoContent.pages.solutions.title,
  description: seoContent.pages.solutions.description,
  alternates: {
    canonical: seoContent.pages.solutions.canonicalPath,
  },
  openGraph: {
    type: 'website',
    siteName: seoContent.siteName,
    locale: 'en',
    title: seoContent.pages.solutions.title,
    description: seoContent.pages.solutions.description,
    url: seoContent.pages.solutions.canonicalPath,
  },
};

export default function SolutionsPage() {
  return <SolutionsView />;
}
