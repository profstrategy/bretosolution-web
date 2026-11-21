import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import type { LegalSection } from '@/content/legal';

export interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalDocument({
  eyebrow,
  title,
  lastUpdated,
  intro,
  sections,
}: LegalDocumentProps) {
  return (
    <Section tone="bg" className="pt-[56px] pb-[88px]">
      <Container>
        <header className="mb-[40px]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-3 max-w-[20ch] font-[family-name:var(--font-display)] text-[clamp(42px,6vw,68px)] font-semibold leading-[1.05] [text-wrap:balance] text-[var(--ink)]">
            {title}
          </h1>
          <p className="mt-4 font-[family-name:var(--font-sans)] text-[14px] text-[var(--muted)]">
            Last updated: {lastUpdated}
          </p>
        </header>

        <nav className="legal-toc mb-8 lg:hidden" aria-label="Table of contents">
          <details className="rounded-[10px] border border-[var(--line)] bg-[var(--panel)]">
            <summary className="flex min-h-[44px] cursor-pointer items-center rounded-[10px] px-4 py-3 font-[family-name:var(--font-sans)] text-[15px] font-semibold text-[var(--ink)]">
              Table of contents
            </summary>
            <ul className="m-0 border-t border-[var(--line)] px-4 py-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex min-h-[44px] items-center rounded-[6px] text-[15px] leading-[1.4] text-[var(--muted)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </nav>

        <div className="lg:grid lg:grid-cols-[240px_minmax(0,72ch)] lg:gap-[48px]">
          <nav
            className="legal-toc hidden lg:block"
            aria-label="Table of contents"
          >
            <div className="sticky top-[96px]">
              <p className="mb-3 font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
                Table of contents
              </p>
              <ul className="m-0 border-l border-[var(--line)] p-0">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex min-h-[44px] items-center border-l-2 border-transparent px-3 text-[14px] leading-[1.4] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <article className="min-w-0">
            <p className="mb-[40px] max-w-[72ch] font-[family-name:var(--font-sans)] text-[16px] leading-[1.7] text-[var(--muted)]">
              {intro}
            </p>

            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-[96px] border-t border-[var(--line)] pt-[32px] pb-[40px]"
              >
                <h2 className="mb-4 font-[family-name:var(--font-display)] text-[clamp(26px,3vw,34px)] font-semibold leading-[1.2] text-[var(--ink)]">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mb-4 max-w-[72ch] font-[family-name:var(--font-sans)] text-[16px] leading-[1.7] text-[var(--muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.list ? (
                  <ul className="mb-4 ml-5 max-w-[72ch] list-disc space-y-3 font-[family-name:var(--font-sans)] text-[16px] leading-[1.7] text-[var(--muted)] marker:text-[var(--accent)]">
                    {section.list.map((item) => (
                      <li key={item} className="pl-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </Container>

      <style>{`
        @media print {
          body > header,
          body > footer,
          .legal-toc {
            display: none !important;
          }
          main {
            width: 100%;
          }
          body {
            background: var(--alt);
          }
        }
      `}</style>
    </Section>
  );
}
