import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { solutionsContent } from '@/content/solutions';

export function OngoingGrowthSection() {
  const { ongoingGrowth } = solutionsContent;

  return (
    <Section tone="bg" id="ongoing-digital-growth">
      <Container>
        <div className="flex flex-wrap items-start gap-y-10 gap-x-[64px]">
          {/* Left column */}
          <div className="min-w-0 flex-[1_1_360px]">
            <Eyebrow className="mb-3">{ongoingGrowth.eyebrow}</Eyebrow>
            <SectionHeading tabIndex={-1} className="max-w-[16ch] outline-none">
              {ongoingGrowth.heading}
            </SectionHeading>
            <div className="mt-5 space-y-4">
              {ongoingGrowth.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-[46ch] font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="min-w-0 flex-[1.25_1_420px]">
            <p className="mb-2.5 font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
              {ongoingGrowth.reportEyebrow}
            </p>
            <ul className="m-0 list-none divide-y divide-[var(--line)] border-t border-b border-[var(--line)] p-0">
              {ongoingGrowth.reportItems.map((item) => (
                <li
                  key={item}
                  className="py-3 font-[family-name:var(--font-sans)] text-[15px] text-[var(--ink)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
