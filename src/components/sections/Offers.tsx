import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AppLink } from '@/components/ui/AppLink';
import { homeContent } from '@/content/home';
import { cn } from '@/lib/utils';

export function Offers() {
  const { offers } = homeContent;

  return (
    <Section tone="bg" id="offers">
      <Container>
        <Eyebrow className="mb-3">{offers.eyebrow}</Eyebrow>
        <SectionHeading className="mb-[48px] max-w-[20ch]">
          {offers.heading}
        </SectionHeading>

        <div className="flex flex-wrap gap-[24px]">
          {offers.cards.map((card) => (
            <div
              key={card.title}
              className={cn(
                'min-w-0 flex-[1_1_240px] rounded-[14px] p-[28px]',
                card.inverted
                  ? 'border border-[var(--btn)] bg-[var(--btn)] text-[var(--btnfg)]'
                  : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)]'
              )}
            >
              {card.inverted ? (
                <p className="font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--btnfg)] opacity-80">
                  {card.badge}
                </p>
              ) : (
                <Eyebrow>{card.badge}</Eyebrow>
              )}

              <h3
                className={cn(
                  'mt-3 font-[family-name:var(--font-display)] text-[22px] font-semibold leading-snug',
                  card.inverted ? 'text-[var(--btnfg)]' : 'text-[var(--ink)]'
                )}
              >
                {card.title}
              </h3>

              <p
                className={cn(
                  'mt-2.5 font-[family-name:var(--font-sans)] text-[15px] leading-relaxed',
                  card.inverted
                    ? 'text-[var(--btnfg)] opacity-85'
                    : 'text-[var(--muted)]'
                )}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 font-[family-name:var(--font-sans)] text-[15px] text-[var(--muted)]">
          {offers.note}{' '}
          <AppLink
            href={offers.linkHref}
            className="font-semibold text-[var(--ink)] underline underline-offset-4 transition-colors hover:text-[var(--accent)]"
          >
            {offers.linkLabel}
          </AppLink>
        </p>
      </Container>
    </Section>
  );
}
