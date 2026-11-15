import { PricingHero } from '@/components/sections/pricing/PricingHero';
import { PricingOffersSection } from '@/components/sections/pricing/PricingOffersSection';
import { PaymentWorksSection } from '@/components/sections/pricing/PaymentWorksSection';
import { SignedScopeSection } from '@/components/sections/pricing/SignedScopeSection';
import { StraightAnswersSection } from '@/components/sections/pricing/StraightAnswersSection';
import { PricingClosingCta } from '@/components/sections/pricing/PricingClosingCta';

export function Pricing() {
  return (
    <main>
      <PricingHero />
      <PricingOffersSection />
      <PaymentWorksSection />
      <SignedScopeSection />
      <StraightAnswersSection />
      <PricingClosingCta />
    </main>
  );
}
