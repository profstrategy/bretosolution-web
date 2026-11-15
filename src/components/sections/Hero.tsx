import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { homeContent } from '@/content/home';

export function Hero() {
  const { hero } = homeContent;

  return (
    <section className="overflow-x-clip bg-gradient-to-b from-[var(--herotop)] to-[var(--herobot)] pt-[120px] md:pt-[148px] pb-[104px] text-[var(--ink)]">
      <Container>
        <div className="flex flex-wrap items-center gap-y-[56px] gap-x-[48px]">
          {/* Left column */}
          <div className="min-w-0 flex-[1_1_480px]">
            <Eyebrow className="mb-4">{hero.eyebrow}</Eyebrow>

            <h1 className="font-[family-name:var(--font-display)] font-bold text-[clamp(38px,5vw,70px)] leading-[1.04] tracking-[-0.02em] text-[var(--ink)]">
              <span>{hero.heading}</span>
              <span className="mt-[8px] block font-[family-name:var(--font-script)] font-normal text-[var(--accent)] text-[1.3em] leading-[1.1] tracking-normal">
                {hero.headingScript}
              </span>
            </h1>

            <p className="mt-6 max-w-[54ch] font-[family-name:var(--font-sans)] text-[19px] leading-[1.6] text-[var(--muted)]">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-[14px]">
              <Button variant="primary" href={hero.primaryCta.href}>
                {hero.primaryCta.label}
              </Button>
              <Button variant="secondary" href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
              </Button>
            </div>
          </div>

          {/* Right column: two overlapping app windows */}
          <div className="min-w-0 flex-[1_1_440px]">
            <div className="relative mx-auto w-full">
              {/* Window 1 */}
              <div className="w-full -rotate-[1deg] md:-rotate-[2.5deg] rounded-[14px] border border-[var(--line)] bg-[var(--panel)] shadow-[0_24px_60px_var(--shadow)] overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--panelhead)] px-4 py-2.5">
                  <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--dot-red)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--dot-yellow)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--dot-green)]" />
                  </div>
                  <span className="truncate text-center font-[family-name:var(--font-sans)] text-[12px] font-medium text-[var(--muted)]">
                    {hero.window1.title}
                  </span>
                  <span className="shrink-0 rounded-full border border-[var(--accent)] px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10.5px] uppercase tracking-wider text-[var(--accent)]">
                    {hero.window1.badge}
                  </span>
                </div>

                <div className="divide-y divide-[var(--line)] px-4 sm:px-5 py-1 pb-7">
                  {hero.window1.rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-wrap sm:flex-nowrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5"
                    >
                      <span className="font-[family-name:var(--font-mono)] text-[11.5px] uppercase tracking-wide text-[var(--muted)] shrink-0">
                        {row.label}
                      </span>
                      <span className="font-[family-name:var(--font-sans)] text-[14px] text-[var(--ink)] text-right ml-auto">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Window 2 */}
              <div className="relative z-10 -mt-[36px] ml-auto w-full md:w-[82%] rotate-[1deg] md:rotate-[1.5deg] rounded-[14px] border border-[var(--line)] bg-[var(--panel)] shadow-[0_24px_60px_var(--shadow)] overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[var(--panelhead)] px-4 py-2.5">
                  <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--dot-red)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--dot-yellow)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--dot-green)]" />
                  </div>
                  <span className="flex-1 text-center font-[family-name:var(--font-sans)] text-[12px] font-medium text-[var(--muted)]">
                    {hero.window2.title}
                  </span>
                  <div className="w-10 shrink-0" aria-hidden="true" />
                </div>

                <div className="space-y-3 p-4">
                  <div className="ml-auto w-fit max-w-[90%] rounded-[10px] bg-[var(--btn)] px-3.5 py-2 font-[family-name:var(--font-sans)] text-[13.5px] font-medium text-[var(--btnfg)]">
                    {hero.window2.userBubble}
                  </div>
                  <div className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 font-[family-name:var(--font-sans)] text-[13.5px] text-[var(--muted)]">
                    {hero.window2.assistantBubble}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer under both columns */}
        <p className="mt-[40px] max-w-[70ch] font-[family-name:var(--font-sans)] text-[13px] leading-relaxed text-[var(--muted)]">
          {hero.disclaimer}
        </p>
      </Container>
    </section>
  );
}
