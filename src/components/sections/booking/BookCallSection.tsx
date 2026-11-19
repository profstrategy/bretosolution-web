import { ArrowUpRight } from 'lucide-react';
import { CalendlyEmbed } from '@/components/booking/CalendlyEmbed';
import { AppLink } from '@/components/ui/AppLink';
import { Container } from '@/components/ui/Container';
import {
  bookCallContent,
  isPlaceholderCalendlyUrl,
} from '@/content/bookCall';
import { calendlyUrl } from '@/content/site';

export function BookCallSection() {
  const isPlaceholder = isPlaceholderCalendlyUrl(calendlyUrl);

  return (
    <section className="overflow-x-clip bg-[linear-gradient(180deg,var(--herotop)_0%,var(--herobot)_100%)] pt-[120px] pb-[96px] md:pt-[148px]">
      <Container>
        <h1 className="font-serif text-[clamp(34px,4.4vw,58px)] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
          {bookCallContent.headingPrefix}{' '}
          <span className="font-script text-[1.25em] font-normal leading-[1.05] text-[var(--accent)]">
            {bookCallContent.headingScript}
          </span>
        </h1>

        <p className="mt-[20px] max-w-[56ch] text-[15px] leading-[1.6] text-[var(--muted)]">
          {bookCallContent.description}
        </p>

        <div className="mt-[40px] border border-[var(--line)] bg-[var(--panelhead)]">
          <div className="p-[20px] md:p-[40px]">
            <CalendlyEmbed url={calendlyUrl} />
          </div>

          <div className="flex items-center justify-end border-t border-[var(--line)] px-[24px] py-[16px] text-[14px] text-[var(--muted)]">
            {isPlaceholder ? (
              <span
                aria-disabled="true"
                className="inline-flex cursor-not-allowed select-none items-center gap-1.5 text-[var(--muted)] opacity-75"
              >
                <span>{bookCallContent.openNewTabLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </span>
            ) : (
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
              >
                <span>{bookCallContent.openNewTabLabel}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-[20px]">
          <AppLink
            href={bookCallContent.auditFormLink.href}
            className="inline-flex min-h-[44px] items-center text-[14px] text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-[var(--ink)]"
          >
            {bookCallContent.auditFormLink.label}
          </AppLink>
        </div>
      </Container>
    </section>
  );
}
