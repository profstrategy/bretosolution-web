import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { homeContent } from '@/content/home';

export function AuditProcess() {
  const { auditProcess } = homeContent;

  return (
    <Section tone="bg" id="audit-process">
      <Container>
        <div className="flex flex-wrap items-start gap-y-[48px] gap-x-[64px]">
          {/* Left column */}
          <div className="min-w-0 flex-[1_1_360px]">
            <Eyebrow className="mb-3">{auditProcess.eyebrow}</Eyebrow>
            <SectionHeading script={auditProcess.headingScript}>
              {auditProcess.heading}
            </SectionHeading>
            <p className="mt-5 max-w-[46ch] font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]">
              {auditProcess.description}
            </p>
            <div className="mt-7">
              <Button variant="primary" href={auditProcess.cta.href}>
                {auditProcess.cta.label}
              </Button>
            </div>
          </div>

          {/* Right column: ordered list */}
          <div className="min-w-0 flex-[1.3_1_440px]">
            <ol className="m-0 list-none space-y-8 p-0">
              {auditProcess.steps.map((item) => (
                <li key={item.step} className="flex items-start gap-5">
                  <span
                    aria-hidden="true"
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[var(--btn)] font-[family-name:var(--font-display)] text-[18px] font-semibold text-[var(--btnfg)]"
                  >
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-[21px] font-semibold leading-snug text-[var(--ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 font-[family-name:var(--font-sans)] text-[15.5px] leading-relaxed text-[var(--muted)]">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
