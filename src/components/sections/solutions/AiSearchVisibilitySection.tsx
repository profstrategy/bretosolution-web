import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { solutionsContent } from '@/content/solutions';

export function AiSearchVisibilitySection() {
  const { aiVisibility } = solutionsContent;

  return (
    <Section tone="bg" id="ai-search-visibility">
      <Container>
        <Eyebrow className="mb-3">{aiVisibility.eyebrow}</Eyebrow>
        <SectionHeading tabIndex={-1} className="max-w-[20ch] outline-none">
          {aiVisibility.heading}
        </SectionHeading>
        <p className="mt-4 max-w-[56ch] font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]">
          {aiVisibility.description}
        </p>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-6">
          {aiVisibility.cells.map((cell) => (
            <div
              key={cell.title}
              className="min-w-0 flex-[1_1_300px] border-t border-[var(--line)] py-[20px]"
            >
              <h3 className="font-[family-name:var(--font-display)] text-[20px] font-semibold leading-snug text-[var(--ink)]">
                {cell.title}
              </h3>
              <p className="mt-2 font-[family-name:var(--font-sans)] text-[15px] leading-relaxed text-[var(--muted)]">
                {cell.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
