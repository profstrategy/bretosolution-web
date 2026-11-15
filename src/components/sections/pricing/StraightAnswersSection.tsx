import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pricingContent } from '@/content/pricing';

export function StraightAnswersSection() {
  const { straightAnswers } = pricingContent;

  return (
    <Section tone="alt" id="straight-answers">
      <Container>
        <Eyebrow className="mb-3">{straightAnswers.eyebrow}</Eyebrow>
        <SectionHeading className="mb-[48px] max-w-[18ch]">
          {straightAnswers.heading}
        </SectionHeading>

        <div className="divide-y divide-[var(--line)] border-t border-b border-[var(--line)]">
          {straightAnswers.rows.map((row) => (
            <div
              key={row.question}
              className="flex flex-wrap items-start justify-between gap-y-3 gap-x-10 py-[28px]"
            >
              <h3 className="min-w-0 flex-[1_1_320px] font-[family-name:var(--font-display)] text-[22px] font-semibold leading-snug text-[var(--ink)]">
                {row.question}
              </h3>
              <p className="min-w-0 flex-[1.4_1_380px] font-[family-name:var(--font-sans)] text-[15.5px] leading-relaxed text-[var(--muted)]">
                {row.answer}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
