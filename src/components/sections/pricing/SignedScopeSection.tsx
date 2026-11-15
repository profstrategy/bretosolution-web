import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pricingContent } from '@/content/pricing';

export function SignedScopeSection() {
  const { signedScope } = pricingContent;

  return (
    <Section tone="bg" id="signed-scope">
      <Container>
        <div className="flex flex-wrap items-start gap-y-10 gap-x-[64px]">
          {/* Left column */}
          <div className="min-w-0 flex-[1_1_360px]">
            <Eyebrow className="mb-3">{signedScope.eyebrow}</Eyebrow>
            <SectionHeading className="max-w-[18ch]">
              {signedScope.heading}
            </SectionHeading>
            <p className="mt-5 max-w-[44ch] font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]">
              {signedScope.description}
            </p>
          </div>

          {/* Right column: ruled list */}
          <div className="min-w-0 flex-[1.25_1_420px]">
            <ul className="m-0 list-none divide-y divide-[var(--line)] border-t border-b border-[var(--line)] p-0">
              {signedScope.items.map((item) => (
                <li
                  key={item}
                  className="py-3.5 font-[family-name:var(--font-sans)] text-[15px] text-[var(--ink)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
