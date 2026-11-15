import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { AuditRequestForm } from '@/components/forms/AuditRequestForm';
import { auditPageContent } from '@/content/audit';

export function AuditPageSection() {
  const copy = auditPageContent;

  return (
    <section className="overflow-x-clip bg-gradient-to-b from-[var(--herotop)] to-[var(--herobot)] pt-[120px] md:pt-[148px] pb-[96px] text-[var(--ink)]">
      <Container>
        <div className="flex flex-wrap items-start gap-y-[56px] gap-x-[64px]">
          {/* Left column */}
          <div className="min-w-0 flex-[1_1_420px]">
            <Eyebrow className="mb-4">{copy.eyebrow}</Eyebrow>

            <h1 className="font-[family-name:var(--font-display)] font-semibold text-[clamp(34px,4.4vw,58px)] leading-[1.06] [text-wrap:balance] text-[var(--ink)]">
              <span>{copy.heading}</span>
              <span className="mt-1.5 block font-[family-name:var(--font-script)] font-normal text-[var(--accent)] text-[1.3em] leading-[1.1]">
                {copy.headingScript}
              </span>
            </h1>

            <p className="mt-6 max-w-[46ch] font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]">
              {copy.description}
            </p>
          </div>

          {/* Right column: form card + Ready to talk block */}
          <div className="min-w-0 flex-[1_1_460px]">
            <AuditRequestForm />

            <div className="mt-[28px] border-t border-[var(--line)] pt-6 text-left">
              <p className="font-[family-name:var(--font-sans)] text-[15px] text-[var(--muted)]">
                {copy.readyToTalkText}
              </p>
              <div className="mt-3.5">
                <Button variant="primary" href={copy.readyToTalkCta.href}>
                  <span>{copy.readyToTalkCta.label}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
