import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { homeContent } from '@/content/home';

export function Restaurants() {
  const { restaurants } = homeContent;

  return (
    <Section tone="alt" id="restaurants">
      <Container>
        <div className="flex flex-wrap items-start gap-y-[48px] gap-x-[64px]">
          {/* Left column */}
          <div className="min-w-0 flex-[1_1_400px]">
            <Eyebrow className="mb-3">{restaurants.eyebrow}</Eyebrow>
            <SectionHeading script={restaurants.headingScript}>
              {restaurants.heading}
            </SectionHeading>
            <p className="mt-5 max-w-[50ch] font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]">
              {restaurants.description}
            </p>

            <div className="mt-8">
              <p className="font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
                {restaurants.loseGuestsLabel}
              </p>
              <ul className="mt-3.5 list-none space-y-2.5 p-0 m-0">
                {restaurants.loseGuestsItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 font-[family-name:var(--font-sans)] text-[15.5px] text-[var(--ink)]"
                  >
                    <span
                      aria-hidden="true"
                      className="h-[2px] w-[10px] shrink-0 bg-[var(--accent)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div className="min-w-0 flex-[1.15_1_420px]">
            <p className="mb-3.5 font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
              {restaurants.queriesLabel}
            </p>
            <div className="space-y-3">
              {restaurants.queries.map((query) => (
                <div
                  key={query}
                  className="rounded-[10px] border border-[var(--line)] bg-[var(--bg)] py-[14px] px-[18px] font-[family-name:var(--font-sans)] text-[15px] text-[var(--ink)]"
                >
                  {query}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
