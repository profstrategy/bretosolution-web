import type { Metadata } from 'next';
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
  return <PricingView />;
}
