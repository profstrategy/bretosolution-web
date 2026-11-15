import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pricingContent } from '@/content/pricing';

export function PaymentWorksSection() {
  const { paymentWorks } = pricingContent;

  return (
    <Section tone="alt" id="payment-works">
      <Container>
        <Eyebrow className="mb-3">{paymentWorks.eyebrow}</Eyebrow>
        <SectionHeading>{paymentWorks.heading}</SectionHeading>

        <div className="mt-12 flex flex-wrap gap-8">
          {paymentWorks.columns.map((col) => (
            <div
              key={col.title}
              className="min-w-0 flex-[1_1_260px] border-t-2 border-[var(--ink)] pt-[18px]"
            >
              <h3 className="font-[family-name:var(--font-display)] text-[22px] font-semibold leading-snug text-[var(--ink)]">
                {col.title}
              </h3>
              <p className="mt-2 font-[family-name:var(--font-sans)] text-[15.5px] leading-relaxed text-[var(--muted)]">
                {col.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
