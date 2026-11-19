import type { Metadata } from 'next';
import { siteDescription } from '@/content/site';
import { pricingContent } from '@/content/pricing';
import PricingView from '@/views/PricingView';

export const metadata: Metadata = {
  title: pricingContent.documentTitle,
  description: siteDescription,
};

export default function PricingPage() {
  return <PricingView />;
}
