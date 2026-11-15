import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { homeContent } from '@/content/home';

export function HomeClosingCta() {
  const { closingCta } = homeContent;

  return (
    <Section tone="bg">
      <Container className="text-center">
        <SectionHeading align="center" className="max-w-[20ch]">
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
