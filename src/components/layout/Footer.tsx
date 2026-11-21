import { Container } from '@/components/ui/Container';
import { AppLink } from '@/components/ui/AppLink';
import { assets } from '@/content/assets';
import { site } from '@/content/site';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--foot)] pt-[56px] pb-[40px] text-[var(--ink)]">
      <Container>
        <div className="flex flex-wrap justify-between gap-y-[40px] gap-x-[64px]">
          {/* 1. Brand */}
          <div className="min-w-0 flex-[1.4_1_280px]">
            <div className="flex items-center gap-3">
              <img
                src={assets.bretoLogo.src}
                alt=""
                width={36}
                height={36}
                className="h-[36px] w-[36px] shrink-0 rounded-[9px] object-cover"
              />
              <span className="font-[family-name:var(--font-display)] text-[20px] font-semibold tracking-[0.08em] text-[var(--ink)] leading-none">
                {site.wordmark}
              </span>
            </div>
            <p className="mt-4 max-w-[38ch] font-[family-name:var(--font-sans)] text-[14px] leading-relaxed text-[var(--muted)]">
              {site.footer.brandDescription}
            </p>
          </div>

          {/* 2. Company */}
          <div className="min-w-0 flex-[1_1_180px]">
            <p className="mb-3 font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
              {site.footer.companyEyebrow}
            </p>
            <ul className="m-0 list-none space-y-1 p-0">
              {site.footer.companyLinks.map((link) => (
                <li key={link.label}>
                  <AppLink
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center font-[family-name:var(--font-sans)] text-[15px] text-[var(--ink)] transition-colors hover:text-[var(--accent)] rounded-[6px]"
                  >
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact */}
          <div className="min-w-0 flex-[1_1_220px]">
            <p className="mb-3 font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-[0.09em] text-[var(--muted)]">
              {site.footer.contactEyebrow}
            </p>
            <ul className="m-0 list-none space-y-2.5 p-0">
              {site.footer.contactItems.map((item) => (
                <li
                  key={item}
                  className="py-1.5 font-[family-name:var(--font-sans)] text-[15px] text-[var(--ink)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-[48px] flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-[24px] font-[family-name:var(--font-sans)] text-[13px] text-[var(--muted)]">
          <p>
            &copy; {currentYear} {site.footer.rightsSuffix}
          </p>
          <p className="flex items-center gap-3">
            <AppLink
              href="/privacy"
              className="inline-flex min-h-[44px] items-center rounded-[6px] transition-colors hover:text-[var(--accent)]"
            >
              Privacy
            </AppLink>
            <span aria-hidden="true">·</span>
            <AppLink
              href="/terms"
              className="inline-flex min-h-[44px] items-center rounded-[6px] transition-colors hover:text-[var(--accent)]"
            >
              Terms
            </AppLink>
          </p>
        </div>
      </Container>
    </footer>
  );
}
