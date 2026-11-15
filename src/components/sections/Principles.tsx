import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { homeContent } from '@/content/home';

export function Principles() {
  const { principles } = homeContent;

  return (
    <Section tone="bg">
      <Container>
        <div className="flex flex-wrap items-start gap-y-[40px] gap-x-[64px]">
          {/* Left column */}
          <div className="min-w-0 flex-[1_1_320px]">
            <Eyebrow className="mb-3">{principles.eyebrow}</Eyebrow>
            <SectionHeading className="max-w-[14ch]">
              {principles.heading}
            </SectionHeading>
          </div>

          {/* Right column: three columns */}
          <div className="min-w-0 flex-[2_1_560px]">
            <div className="flex flex-wrap gap-y-8 gap-x-8">
              {principles.items.map((item) => (
                <div
                  key={item.title}
                  className="min-w-0 flex-[1_1_220px] border-t-2 border-[var(--ink)] pt-[18px]"
                >
                  <h3 className="font-[family-name:var(--font-display)] text-[22px] font-semibold leading-snug text-[var(--ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-[family-name:var(--font-sans)] text-[15.5px] leading-relaxed text-[var(--muted)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
