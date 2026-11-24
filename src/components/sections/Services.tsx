import { ArrowUpRight } from 'lucide-react';
import { AppLink } from '@/components/ui/AppLink';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { assets } from '@/content/assets';
import { homeContent } from '@/content/home';

const SVC_V_CSS = `
.svc-v { --svc-tilt: 6deg; position: relative; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: center; padding: 24px 0 64px; isolation: isolate; }
.svc-v__dash { position: relative; z-index: 2; flex: 0 0 66%; max-width: 66%; border-radius: 12px; border: 1px solid var(--line); overflow: hidden; background: var(--panel);
  box-shadow: 0 40px 70px -30px var(--shadow); transform-origin: 100% 100%; transform: rotate(calc(var(--svc-tilt) * -1)); }
.svc-v__dash img { display: block; width: 100%; height: auto; }
.svc-v__map { position: relative; z-index: 1; flex: 0 0 34%; max-width: 34%; margin-left: -2px; aspect-ratio: 650 / 520; border-radius: 12px; border: 1px solid var(--line); overflow: hidden; background: var(--panel);
  box-shadow: 0 24px 50px -30px var(--shadow); transform-origin: 0 100%; transform: rotate(var(--svc-tilt)); }
.svc-v__map img { position: absolute; top: 0; left: 0; width: 209.1%; max-width: none; height: auto; }
.svc-v > figcaption { flex: 0 0 100%; width: 100%; margin-top: 8px; transform: translateY(50px); }
@media (max-width: 639px) { .svc-v { --svc-tilt: 4deg; padding-bottom: 40px; } .svc-v > figcaption { transform: translateY(26px); } }
`;

export function Services() {
  const { services } = homeContent;

  return (
    <Section tone="alt" id="services">
      <style>{SVC_V_CSS}</style>
      <Container className="max-w-[1280px] px-[clamp(16px,2.5vw,32px)]">
        <div className="overflow-clip rounded-[24px] border border-[var(--line)] bg-[linear-gradient(180deg,var(--panel)_0%,var(--bg)_100%)] p-[clamp(24px,4vw,56px)]">
          {/* Heading block */}
          <div className="max-w-[640px] text-left">
            <Eyebrow className="mb-3">{services.eyebrow}</Eyebrow>
            <SectionHeading tabIndex={-1} className="outline-none">
              {services.heading}
            </SectionHeading>
            <p className="mt-[16px] font-[family-name:var(--font-sans)] text-[17px] leading-[1.6] text-[var(--muted)]">
              {services.description}
            </p>
          </div>

          {/* Two-column body */}
          <div className="mt-[48px] flex flex-col gap-[32px] lg:grid lg:grid-cols-[minmax(220px,260px)_1fr] lg:items-end lg:gap-[48px]">
            {/* Left column: three links (second on mobile, first on desktop) */}
            <div className="order-2 flex flex-col items-start gap-[20px] lg:order-1">
              {services.links.map((link) => (
                <AppLink
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center gap-[8px] rounded-[6px] font-[family-name:var(--font-sans)] text-[17px] font-medium text-[var(--ink)] transition-colors hover:text-[var(--accent)] hover:underline hover:decoration-1 hover:underline-offset-[4px]"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight
                    className="h-[16px] w-[16px] shrink-0"
                    aria-hidden="true"
                  />
                </AppLink>
              ))}
            </div>

            {/* Right column: V-shaped visual (first on mobile, second on desktop) */}
            <div className="order-1 min-w-0 lg:order-2">
              <figure className="svc-v m-0 w-full max-w-[820px] lg:ml-auto">
                <div className="svc-v__dash">
                  <img
                    src={assets.servicesDashboard.src}
                    alt={assets.servicesDashboard.alt}
                    width={assets.servicesDashboard.width}
                    height={assets.servicesDashboard.height}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="svc-v__map">
                  <img
                    src={assets.servicesMap.src}
                    alt={assets.servicesMap.alt}
                    width={assets.servicesMap.width}
                    height={assets.servicesMap.height}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {/* <figcaption className="mt-[8px] text-center font-[family-name:var(--font-sans)] text-[13px] leading-[1.5] text-[var(--muted)]">
                  {services.caption}
                </figcaption> */}
              </figure>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
