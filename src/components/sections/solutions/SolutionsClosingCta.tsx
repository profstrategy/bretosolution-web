import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { solutionsContent } from '@/content/solutions';

export function SolutionsClosingCta() {
  const { closingCta } = solutionsContent;

  return (
    <Section tone="bg" id="solutions-cta">
      <Container className="text-center">
        <SectionHeading
          align="center"
          script={closingCta.headingScript}
          className="max-w-[20ch]"
        >
          {closingCta.heading}
        </SectionHeading>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-[14px]">
          <Button variant="primary" href={closingCta.primaryCta.href}>
            {closingCta.primaryCta.label}
          </Button>
          <Button variant="secondary" href={closingCta.secondaryCta.href}>
            {closingCta.secondaryCta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
