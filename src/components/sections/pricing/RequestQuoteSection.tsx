import { QuoteRequestForm } from '@/components/forms/QuoteRequestForm';
import { AppLink } from '@/components/ui/AppLink';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { pricingContent } from '@/content/pricing';

export function RequestQuoteSection() {
  const { requestQuote } = pricingContent;

  return (
    <section
      id={requestQuote.id}
      className="scroll-mt-[96px] overflow-x-clip bg-[linear-gradient(180deg,var(--herotop)_0%,var(--herobot)_100%)] pt-[120px] pb-[96px] md:pt-[148px]"
    >
      <Container>
        <div className="flex flex-wrap items-start gap-x-[64px] gap-y-[56px]">
          {/* Left column */}
          <div className="min-w-0 flex-[1_1_420px]">
            <Eyebrow>{requestQuote.eyebrow}</Eyebrow>

            <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(34px,4.4vw,58px)] font-bold leading-[1.06] tracking-[-0.02em] text-[var(--ink)]">
              <span className="block">{requestQuote.heading}</span>
              <span className="mt-2 block font-[family-name:var(--font-script)] text-[1.28em] font-normal leading-[1.08] text-[var(--accent)]">
                {requestQuote.headingScript}
              </span>
            </h1>

            <p className="mt-6 max-w-[46ch] font-[family-name:var(--font-sans)] text-[18px] leading-[1.6] text-[var(--muted)]">
              {requestQuote.description}
            </p>

            {/* Numbered list with 1px --line rules */}
            <ol className="mt-8 border-t border-[var(--line)]">
              {requestQuote.steps.map((step) => (
                <li
                  key={step.number}
                  className="flex items-baseline gap-3.5 border-b border-[var(--line)] py-3.5"
                >
                  <span className="shrink-0 font-[family-name:var(--font-mono)] text-[12px] font-medium tracking-[0.04em] text-[var(--accent)]">
                    {step.number}
                  </span>
                  <span className="font-[family-name:var(--font-sans)] text-[15px] leading-[1.5] text-[var(--ink)]">
                    {step.text}
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-6 font-[family-name:var(--font-sans)] text-[14px] leading-[1.6] text-[var(--muted)]">
              {requestQuote.notReadyPrefix}{' '}
              <AppLink
                href={requestQuote.notReadyLinkHref}
                className="font-semibold text-[var(--ink)] underline underline-offset-4 transition-colors hover:text-[var(--accent)]"
              >
                {requestQuote.notReadyLinkLabel}
              </AppLink>
              .
            </p>
          </div>

          {/* Right column: two-step quote form */}
          <div className="min-w-0 flex-[1_1_460px]">
            <QuoteRequestForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
