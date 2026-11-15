import { Sun, Moon } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/theme';
import { allBrandAssetList } from '@/content/assets';
import { devFoundationCopy } from '@/content/devFoundation';
import { routes } from '@/content/site';

export interface DevFoundationSectionProps {
  title?: string;
}

export function DevFoundationSection({
  title = devFoundationCopy.pageTitle,
}: DevFoundationSectionProps) {
  const { theme, toggle } = useTheme();

  return (
    <Section
      tone="bg"
      id="dev-foundation"
      className="pt-[120px] md:pt-[148px] bg-gradient-to-b from-[var(--herotop)] to-[var(--herobot)]"
    >
      <Container className="space-y-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
            {title}
          </h1>
          <Button variant="small" onClick={toggle}>
            {theme === 'light' ? (
              <Moon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              {devFoundationCopy.themeButtonPrefix} {theme}
            </span>
          </Button>
        </div>

        <div className="space-y-4">
          <Eyebrow>{devFoundationCopy.eyebrow}</Eyebrow>
          <SectionHeading
            script={devFoundationCopy.headingScript}
            align="left"
          >
            {devFoundationCopy.heading}
          </SectionHeading>
          <p className="max-w-2xl text-[var(--muted)]">
            {devFoundationCopy.bodySample}
          </p>
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
            {devFoundationCopy.monoSample}
          </p>
        </div>

        <div className="space-y-4">
          <Eyebrow>{devFoundationCopy.buttonsHeading}</Eyebrow>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" href={routes.audit}>
              {devFoundationCopy.primaryLabel}
            </Button>
            <Button variant="secondary" href={routes.solutions}>
              {devFoundationCopy.secondaryLabel}
            </Button>
            <Button variant="small" onClick={toggle}>
              {devFoundationCopy.smallLabel}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Eyebrow>{devFoundationCopy.assetsHeading}</Eyebrow>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {allBrandAssetList.map((asset) => (
              <div
                key={asset.src}
                className="flex flex-col items-center justify-center gap-3 border border-[var(--line)] bg-[var(--panel)] p-4 rounded-lg"
              >
                <img
                  src={asset.src}
                  alt={asset.alt}
                  width={asset.width}
                  height={asset.height}
                  className="h-12 w-auto object-contain"
                />
                <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)] text-center">
                  {asset.alt || devFoundationCopy.decorativeLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
