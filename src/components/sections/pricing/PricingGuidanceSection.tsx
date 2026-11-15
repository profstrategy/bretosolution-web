import { useState, type MouseEvent } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  LayoutGrid,
  Search,
  TrendingUp,
} from 'lucide-react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import {
  pricingContent,
  type PricingGuidancePackage,
} from '@/content/pricing';
import { cn } from '@/lib/utils';

const PACKAGE_PANEL_ID = 'pricing-packages-dropdown-panel';

function PackageIcon({ iconKey }: { iconKey: PricingGuidancePackage['iconKey'] }) {
  switch (iconKey) {
    case 'search':
      return <Search className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />;
    case 'layout':
      return <LayoutGrid className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />;
    case 'trending':
      return <TrendingUp className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />;
  }
}

export function PricingGuidanceSection() {
  const { leftPanel, rightPanel, dropdown } = pricingContent.pricingGuidance;
  const [isOpen, setIsOpen] = useState(false);

  const handleDiscussSmallProject = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const targetEl =
        document.getElementById('quote-form') ??
        document.getElementById('quote');
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      targetEl?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });

      window.dispatchEvent(new CustomEvent('breto:focus-quote-form'));

      const firstField = document.getElementById('quote-business-type');
      firstField?.focus({ preventScroll: true });
    } catch {
      // Ignore DOM access errors
    }
  };

  return (
    <Section tone="bg">
      <div className="overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--panelhead)] md:rounded-none">
        {/* Top row: two panels side by side on desktop (approx 58/42), stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr]">
          {/* Left panel */}
          <div className="bg-[var(--panelhead)] p-6 sm:p-8 md:p-[40px]">
            <Eyebrow>{leftPanel.eyebrow}</Eyebrow>

            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(30px,3.6vw,48px)] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
              <span className="block">{leftPanel.heading}</span>
              <span className="mt-1.5 block font-[family-name:var(--font-script)] text-[1.25em] font-normal leading-[1.1] text-[var(--accent)]">
                {leftPanel.headingScript}
              </span>
            </h2>

            <p className="mt-5 max-w-[52ch] font-[family-name:var(--font-sans)] text-[16px] leading-[1.65] text-[var(--muted)]">
              {leftPanel.description}
            </p>
          </div>

          {/* Right panel */}
          <div className="border-t border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8 md:p-[40px] lg:border-t-0 lg:border-l">
            <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
              {/* Item 1: Free Diagnostic */}
              <div className="min-w-[160px] flex-1">
                <p className="font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                  {rightPanel.diagnostic.tag}
                </p>
                <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-[22px] font-semibold leading-[1.2] text-[var(--ink)]">
                  {rightPanel.diagnostic.title}
                </h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]">
                    {rightPanel.diagnostic.pricePrefix}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-[clamp(32px,3.2vw,40px)] font-semibold leading-none text-[var(--ink)]">
                    {rightPanel.diagnostic.priceValue}
                  </span>
                </div>
              </div>

              {/* Item 2: One-time project */}
              <div className="min-w-[200px] flex-[1.25]">
                <p className="font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {rightPanel.optimization.tag}
                </p>
                <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-[22px] font-semibold leading-[1.2] text-[var(--ink)]">
                  {rightPanel.optimization.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]">
                    {rightPanel.optimization.pricePrefix}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-[clamp(32px,3.2vw,40px)] font-semibold leading-none text-[var(--ink)]">
                    {rightPanel.optimization.ngnPrice}
                  </span>
                  <span className="font-[family-name:var(--font-sans)] text-[16px] text-[var(--muted)]">
                    {rightPanel.optimization.priceSeparator}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-[22px] font-semibold leading-none text-[var(--ink)]">
                    {rightPanel.optimization.usdPrice}
                  </span>
                  <span className="font-[family-name:var(--font-sans)] text-[12px] uppercase tracking-[0.06em] text-[var(--muted)]">
                    {rightPanel.optimization.usdLabel}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 font-[family-name:var(--font-sans)] text-[14px] leading-[1.6] text-[var(--muted)]">
              {rightPanel.description}
            </p>

            <div className="mt-5">
              <a
                href={rightPanel.discussLinkHref}
                onClick={handleDiscussSmallProject}
                className="inline-flex min-h-[44px] items-center gap-1.5 font-[family-name:var(--font-sans)] text-[14px] font-semibold text-[var(--ink)] underline underline-offset-4 transition-colors hover:text-[var(--accent)]"
              >
                <span>{rightPanel.discussLinkLabel}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Dropdown trigger bar */}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={PACKAGE_PANEL_ID}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between border-t border-[var(--line)] bg-[var(--alt)] px-6 py-5 text-left transition-colors hover:bg-[var(--panel)] md:px-[40px] md:py-[24px]"
        >
          <span className="font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)]">
            {dropdown.triggerLabel}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'h-5 w-5 shrink-0 text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Expandable panel */}
        <div
          id={PACKAGE_PANEL_ID}
          aria-hidden={!isOpen}
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-250 ease-out motion-reduce:transition-none',
            isOpen
              ? 'grid-rows-[1fr] border-t border-[var(--line)] opacity-100'
              : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="bg-[var(--panelhead)] px-6 pb-8 pt-6 md:px-[40px] md:pb-[40px] md:pt-[28px]">
              <p className="font-[family-name:var(--font-sans)] text-[14px] leading-[1.6] text-[var(--muted)]">
                {dropdown.intro}
              </p>

              {/* Responsive 3-column card grid */}
              <div className="mt-6 grid grid-cols-1 items-stretch gap-[24px] sm:grid-cols-2 lg:grid-cols-3">
                {dropdown.packages.map((pkg) => (
                  <article
                    key={pkg.name}
                    className="flex h-full flex-col justify-between rounded-[12px] border border-[var(--line)] bg-[var(--alt)] p-6"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--bg)]">
                          <PackageIcon iconKey={pkg.iconKey} />
                        </div>
                        <span className="font-[family-name:var(--font-sans)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--accent)]">
                          {pkg.typeTag}
                        </span>
                      </div>

                      <h3 className="mt-4 font-[family-name:var(--font-display)] text-[22px] font-semibold leading-[1.2] text-[var(--ink)]">
                        {pkg.name}
                      </h3>

                      <div className="mt-3">
                        <p className="font-[family-name:var(--font-display)] text-[28px] font-semibold leading-[1.15] text-[var(--ink)]">
                          {pkg.ngnPrice}
                        </p>
                        <p className="mt-1 font-[family-name:var(--font-sans)] text-[13px] font-medium text-[var(--muted)]">
                          {pkg.intlPrice}
                        </p>
                      </div>

                      <div className="mt-5 space-y-3">
                        <p className="font-[family-name:var(--font-sans)] text-[14px] leading-[1.55] text-[var(--muted)]">
                          <strong className="font-semibold text-[var(--ink)]">
                            {dropdown.problemLabel}:
                          </strong>{' '}
                          {pkg.problem}
                        </p>
                        <p className="font-[family-name:var(--font-sans)] text-[14px] leading-[1.55] text-[var(--muted)]">
                          <strong className="font-semibold text-[var(--ink)]">
                            {dropdown.whatYouGetLabel}:
                          </strong>{' '}
                          {pkg.whatYouGet}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[var(--line)] pt-5">
                      <p className="font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                        {dropdown.scopeLabel}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {pkg.scopeItems.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 font-[family-name:var(--font-sans)] text-[14px] leading-[1.5] text-[var(--ink)]"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>

              <p className="mt-6 font-[family-name:var(--font-sans)] text-[13px] leading-[1.6] text-[var(--muted)]">
                {dropdown.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
