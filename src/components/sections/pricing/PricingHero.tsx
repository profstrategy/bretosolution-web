import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { pricingContent } from '@/content/pricing';

export function PricingHero() {
  const { hero } = pricingContent;

  return (
    <section className="overflow-x-clip bg-gradient-to-b from-[var(--herotop)] to-[var(--herobot)] pt-[120px] md:pt-[156px] pb-[96px] text-[var(--ink)]">
      <Container>
        <Eyebrow className="mb-4">{hero.eyebrow}</Eyebrow>

        <h1 className="max-w-[16ch] font-[family-name:var(--font-display)] font-bold text-[clamp(38px,5vw,70px)] leading-[1.04] tracking-[-0.02em] text-[var(--ink)]">
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
      </Container>
    </section>
  );
}
