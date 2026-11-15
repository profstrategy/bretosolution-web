import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { homeContent } from '@/content/home';

export function Proof() {
  const { proof } = homeContent;

  return (
    <Section tone="alt" id="proof">
      <Container>
        <div className="flex flex-wrap items-start gap-y-[48px] gap-x-[64px]">
          {/* Left column */}
          <div className="min-w-0 flex-[1_1_360px]">
            <Eyebrow className="mb-3">{proof.eyebrow}</Eyebrow>
            <SectionHeading className="max-w-[18ch]">
              {proof.heading}
            </SectionHeading>
            <p className="mt-5 max-w-[46ch] font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]">
              {proof.description}
            </p>
          </div>

          {/* Right column */}
          <div className="min-w-0 flex-[1.25_1_440px]">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border-[1.5px] border-dashed border-[var(--muted)] p-[24px]">
              <span className="font-[family-name:var(--font-display)] text-[20px] font-semibold text-[var(--ink)]">
                {proof.boxTitle}
              </span>
              <span className="rounded-full border border-[var(--accent)] px-3 py-0.5 font-[family-name:var(--font-sans)] text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                {proof.boxPill}
              </span>
            </div>

            <div className="mt-7">
              <p className="mb-2 font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
                {proof.listEyebrow}
              </p>
              <ul className="m-0 list-none divide-y divide-[var(--line)] border-t border-b border-[var(--line)] p-0">
                {proof.listItems.map((item) => (
                  <li
                    key={item}
                    className="py-3 font-[family-name:var(--font-sans)] text-[15px] text-[var(--ink)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
