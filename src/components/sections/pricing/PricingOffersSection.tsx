import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pricingContent } from '@/content/pricing';
import { cn } from '@/lib/utils';

export function PricingOffersSection() {
  const { offers } = pricingContent;

  return (
    <Section tone="bg" id="pricing-offers">
      <Container>
        <Eyebrow className="mb-3">{offers.eyebrow}</Eyebrow>
        <SectionHeading className="mb-[48px] max-w-[18ch]">
          {offers.heading}
        </SectionHeading>

        <div>
          {offers.rows.map((row, index) => {
            const isLast = index === offers.rows.length - 1;

            return (
              <div
                key={row.title}
                className={cn(
                  'flex flex-wrap items-start justify-between gap-y-5 gap-x-8 border-t border-[var(--line)] py-[32px]',
                  isLast && 'border-b border-[var(--line)]'
                )}
              >
                {/* Name block */}
                <div className="min-w-0 flex-[1_1_240px]">
                  <Eyebrow>{row.tag}</Eyebrow>
                  <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-[26px] font-semibold leading-snug text-[var(--ink)]">
                    {row.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="min-w-0 flex-[1.5_1_300px] font-[family-name:var(--font-sans)] text-[15.5px] leading-relaxed text-[var(--muted)]">
                  {row.description}
                </p>

                {/* Price block */}
                <div className="min-w-0 flex-[0.8_1_200px]">
                  <Eyebrow>{offers.priceLabel}</Eyebrow>
                  {row.isDisplayPrice ? (
                    <p className="mt-1.5 font-[family-name:var(--font-display)] text-[26px] font-semibold leading-snug text-[var(--ink)]">
                      {row.price}
                    </p>
                  ) : (
                    <p className="mt-2 font-[family-name:var(--font-mono)] text-[15px] text-[var(--ink)]">
                      {row.price}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 max-w-[66ch] font-[family-name:var(--font-sans)] text-[15px] leading-relaxed text-[var(--muted)]">
          {offers.note}
        </p>
      </Container>
    </Section>
  );
}
