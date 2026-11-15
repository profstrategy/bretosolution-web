import { useEffect } from 'react';
import { RequestQuoteSection } from '@/components/sections/pricing/RequestQuoteSection';
import { PricingGuidanceSection } from '@/components/sections/pricing/PricingGuidanceSection';
import { PaymentWorksSection } from '@/components/sections/pricing/PaymentWorksSection';
import { SignedScopeSection } from '@/components/sections/pricing/SignedScopeSection';
import { StraightAnswersSection } from '@/components/sections/pricing/StraightAnswersSection';
import { PricingClosingCta } from '@/components/sections/pricing/PricingClosingCta';
import { pricingContent } from '@/content/pricing';

export function Pricing() {
  useEffect(() => {
    try {
      document.title = pricingContent.documentTitle;
    } catch {
      // Ignore document errors
    }
  }, []);

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <RequestQuoteSection />
      <PricingGuidanceSection />
      <PaymentWorksSection />
      <SignedScopeSection />
      <StraightAnswersSection />
      <PricingClosingCta />
    </main>
  );
}
