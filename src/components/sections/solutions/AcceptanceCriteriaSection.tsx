import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { solutionsContent } from '@/content/solutions';

export function AcceptanceCriteriaSection() {
  const { acceptanceCriteria } = solutionsContent;

  return (
    <Section tone="alt" id="acceptance-criteria">
      <Container>
        <Eyebrow className="mb-3">{acceptanceCriteria.eyebrow}</Eyebrow>
        <SectionHeading className="max-w-[22ch]">
          {acceptanceCriteria.heading}
        </SectionHeading>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-6">
          {acceptanceCriteria.cells.map((cell) => (
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
