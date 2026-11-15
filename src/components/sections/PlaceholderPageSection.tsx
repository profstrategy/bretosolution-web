import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';

export interface PlaceholderPageSectionProps {
  eyebrow: string;
  heading: string;
  description: string;
}

export function PlaceholderPageSection({
  eyebrow,
  heading,
  description,
}: PlaceholderPageSectionProps) {
  return (
    <section className="overflow-x-clip bg-gradient-to-b from-[var(--herotop)] to-[var(--herobot)] pt-[120px] md:pt-[156px] pb-[104px] text-[var(--ink)]">
      <Container>
        <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
        <h1 className="max-w-[20ch] font-[family-name:var(--font-display)] font-bold text-[clamp(38px,5vw,70px)] leading-[1.04] tracking-[-0.02em] text-[var(--ink)]">
          {heading}
        </h1>
        <p className="mt-6 max-w-[54ch] font-[family-name:var(--font-sans)] text-[19px] leading-[1.6] text-[var(--muted)]">
          {description}
        </p>
      </Container>
    </section>
  );
}
