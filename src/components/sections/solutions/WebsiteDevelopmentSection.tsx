import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { solutionsContent } from '@/content/solutions';

export function WebsiteDevelopmentSection() {
  const { websiteDevelopment } = solutionsContent;

  return (
    <Section tone="alt" id="website-development">
      <Container>
        <Eyebrow className="mb-3">{websiteDevelopment.eyebrow}</Eyebrow>
        <SectionHeading className="max-w-[18ch]">
          {websiteDevelopment.heading}
        </SectionHeading>
        <p className="mt-4 max-w-[58ch] font-[family-name:var(--font-sans)] text-[16px] leading-relaxed text-[var(--muted)]">
          {websiteDevelopment.description}
        </p>

        {/* Four phase cards */}
        <div className="mt-12 flex flex-wrap gap-6">
          {websiteDevelopment.phases.map((item) => (
            <div
              key={item.phase}
              className="min-w-0 flex-[1_1_280px] rounded-[14px] border border-[var(--line)] bg-[var(--bg)] p-[26px]"
            >
              <Eyebrow>{item.phase}</Eyebrow>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-[21px] font-semibold leading-snug text-[var(--ink)]">
                {item.title}
              </h3>
              <p className="mt-2.5 font-[family-name:var(--font-sans)] text-[15px] leading-relaxed text-[var(--muted)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Two-column Add-on modules block */}
        <div className="mt-14 flex flex-wrap items-start gap-y-8 gap-x-[64px]">
          <div className="min-w-0 flex-[1_1_320px]">
            <h3 className="font-[family-name:var(--font-display)] text-[26px] font-semibold leading-snug text-[var(--ink)]">
              {websiteDevelopment.addOnsHeading}
            </h3>
            <p className="mt-3 max-w-[44ch] font-[family-name:var(--font-sans)] text-[15.5px] leading-relaxed text-[var(--muted)]">
              {websiteDevelopment.addOnsDescription}
            </p>
          </div>

          <div className="min-w-0 flex-[1.4_1_440px]">
            <ul className="m-0 list-none divide-y divide-[var(--line)] border-t border-b border-[var(--line)] p-0">
              {websiteDevelopment.addOns.map((addon) => (
                <li
                  key={addon.title}
                  className="py-3.5 font-[family-name:var(--font-sans)] text-[15px] leading-relaxed"
                >
                  <span className="font-semibold text-[var(--ink)]">
                    {addon.title}
                  </span>
                  <span className="text-[var(--muted)]">
                    {' · '}
                    {addon.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
