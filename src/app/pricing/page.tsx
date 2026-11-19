import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { pricingContent } from '@/content/pricing';
import { seoContent } from '@/content/seo';
import PricingView from '@/views/PricingView';

export const metadata: Metadata = {
  title: seoContent.pages.pricing.title,
  description: seoContent.pages.pricing.description,
  alternates: {
    canonical: seoContent.pages.pricing.canonicalPath,
  },
  openGraph: {
    type: 'website',
    siteName: seoContent.siteName,
    locale: 'en',
    title: seoContent.pages.pricing.title,
    description: seoContent.pages.pricing.description,
    url: seoContent.pages.pricing.canonicalPath,
  },
};

export default function PricingPage() {
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
        name: 'Pricing',
        item: new URL(seoContent.pages.pricing.canonicalPath, seoContent.siteUrl).toString(),
      },
    ],
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pricingContent.straightAnswers.rows.map((row) => ({
      '@type': 'Question',
      name: row.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: row.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={faqData} />
      <PricingView />
    </>
  );
}
