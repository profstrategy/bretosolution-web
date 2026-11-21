import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
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
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: seoContent.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Solutions',
        item: new URL(seoContent.pages.solutions.canonicalPath, seoContent.siteUrl).toString(),
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <SolutionsView />
    </>
  );
}
