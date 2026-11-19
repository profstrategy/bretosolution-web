import { RequestQuoteSection } from '@/components/sections/pricing/RequestQuoteSection';
import { PricingGuidanceSection } from '@/components/sections/pricing/PricingGuidanceSection';
import { PaymentWorksSection } from '@/components/sections/pricing/PaymentWorksSection';
import { SignedScopeSection } from '@/components/sections/pricing/SignedScopeSection';
import { StraightAnswersSection } from '@/components/sections/pricing/StraightAnswersSection';
import { PricingClosingCta } from '@/components/sections/pricing/PricingClosingCta';

export default function PricingView() {
  return (
    <>
      <RequestQuoteSection />
      <PricingGuidanceSection />
      <PaymentWorksSection />
      <SignedScopeSection />
      <StraightAnswersSection />
      <PricingClosingCta />
    </>
  );
}
