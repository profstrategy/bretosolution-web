import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { homeContent } from '@/content/home';
import { cn } from '@/lib/utils';

export function Services() {
  const { services } = homeContent;

  return (
    <Section tone="alt" id="services">
      <Container>
        <Eyebrow className="mb-3">{services.eyebrow}</Eyebrow>
        <SectionHeading className="mb-[48px] max-w-[20ch]">
          {services.heading}
        </SectionHeading>

        <div>
          {services.rows.map((row, index) => {
            const isFirst = index === 0;
            const isLast = index === services.rows.length - 1;

            return (
              <div
                key={row.title}
                className={cn(
                  'flex flex-wrap items-start justify-between gap-y-5 gap-x-8 py-[32px]',
                  isFirst
                    ? 'border-t border-[var(--ink)]'
                    : 'border-t border-[var(--line)]',
                  isLast && 'border-b border-[var(--line)]'
                )}
              >
                <h3 className="min-w-0 flex-[1_1_240px] font-[family-name:var(--font-display)] text-[28px] font-semibold leading-snug text-[var(--ink)]">
                  {row.title}
                </h3>

                <p className="min-w-0 flex-[1.2_1_260px] font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--ink)]">
                  {row.scope}
                </p>

                <div className="min-w-0 flex-[1.2_1_260px]">
                  <Eyebrow>{services.youGetLabel}</Eyebrow>
                  <p className="mt-1.5 font-[family-name:var(--font-sans)] text-[15.5px] leading-relaxed text-[var(--muted)]">
                    {row.youGet}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-[36px]">
          <Button variant="secondary" href={services.cta.href}>
            {services.cta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
