import {
  Ban,
  CalendarClock,
  CheckCircle2,
  FileText,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { pricingContent, type SignedScopeCard } from '@/content/pricing';
import { Container } from '@/components/ui/Container';

function ScopeCardIcon({ iconKey }: { iconKey: SignedScopeCard['iconKey'] }) {
  const iconClass = 'h-5 w-5 text-[var(--accent)]';
  switch (iconKey) {
    case 'fileText':
      return <FileText className={iconClass} aria-hidden="true" />;
    case 'checkCircle2':
      return <CheckCircle2 className={iconClass} aria-hidden="true" />;
    case 'refreshCw':
      return <RefreshCw className={iconClass} aria-hidden="true" />;
    case 'calendarClock':
      return <CalendarClock className={iconClass} aria-hidden="true" />;
    case 'ban':
      return <Ban className={iconClass} aria-hidden="true" />;
    case 'keyRound':
      return <KeyRound className={iconClass} aria-hidden="true" />;
  }
}

export function SignedScopeSection() {
  const { signedScope } = pricingContent;

  return (
    <Section tone="bg" id="signed-scope">
      <Container>
        {/* Heading block on top */}
        <div>
          <Eyebrow className="mb-3">{signedScope.eyebrow}</Eyebrow>
          <SectionHeading className="max-w-[20ch]">
            {signedScope.heading}
          </SectionHeading>
          <p className="mt-4 max-w-[54ch] font-[family-name:var(--font-sans)] text-[16px] leading-[1.6] text-[var(--muted)]">
            {signedScope.description}
          </p>
        </div>

        {/* Six-card grid */}
        <div className="mt-12 grid items-stretch gap-[24px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))] lg:[grid-template-columns:repeat(3,minmax(0,1fr))]">
          {signedScope.cards.map((card) => (
            <article
              key={card.title}
              className="flex h-full flex-col gap-[14px] rounded-[14px] border border-[var(--line)] bg-[var(--panel)] p-[28px] transition-colors duration-200 hover:border-[var(--muted)]"
            >
              <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--bg)]">
                <ScopeCardIcon iconKey={card.iconKey} />
              </div>

              <h3 className="font-[family-name:var(--font-display)] text-[21px] font-semibold leading-[1.28] text-[var(--ink)]">
                {card.title}
              </h3>

              <p className="font-[family-name:var(--font-sans)] text-[15px] leading-[1.6] text-[var(--muted)]">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
