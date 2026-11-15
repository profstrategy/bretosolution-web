import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { pricingContent } from '@/content/pricing';

export function PricingClosingCta() {
  const { closingCta } = pricingContent;

  return (
    <Section tone="bg" id="pricing-cta">
      <Container className="text-center">
        <SectionHeading
          align="center"
          script={closingCta.headingScript}
          className="max-w-[20ch]"
        >
          {closingCta.heading}
        </SectionHeading>

        <div className="mt-8 flex items-center justify-center">
          <Button variant="primary" href={closingCta.cta.href}>
            {closingCta.cta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
