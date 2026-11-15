import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { AppLink } from '@/components/ui/AppLink';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/theme';
import { assets } from '@/content/assets';
import { site, routes } from '@/content/site';
import { cn } from '@/lib/utils';

const MOBILE_PANEL_ID = 'mobile-nav-panel';

export function Header() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    try {
      window.addEventListener('keydown', handleKeyDown);
    } catch {
      // Ignore listener errors
    }

    return () => {
      try {
        window.removeEventListener('keydown', handleKeyDown);
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 h-0 overflow-visible pointer-events-none">
      <Container className="pt-[16px]">
        <div className="pointer-events-auto flex items-center justify-between rounded-[20px] border border-[var(--pillline)] bg-[var(--pill)] backdrop-blur-[14px] py-[10px] pr-[14px] pl-[16px]">
          <AppLink
            href={routes.home}
            aria-label={site.header.homeAriaLabel}
            onClick={closeMenu}
            className="inline-flex min-h-[44px] items-center gap-3 rounded-[10px] pr-2 text-[var(--ink)]"
          >
            <img
              src={assets.bretoLogo.src}
              alt={assets.bretoLogo.alt}
              width={40}
              height={40}
              className="h-[40px] w-[40px] shrink-0 rounded-[10px] object-cover"
            />
            <span className="font-[family-name:var(--font-display)] text-[21px] font-semibold tracking-[0.08em] text-[var(--ink)] leading-none">
              {site.wordmark}
            </span>
          </AppLink>

          <nav
            aria-label={site.header.mainNavAriaLabel}
            className="hidden md:flex items-center gap-7"
          >
            {site.navItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                location.pathname.startsWith(`${item.href}/`);

              return (
                <AppLink
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex min-h-[44px] items-center px-[6px] py-[10px] font-[family-name:var(--font-sans)] text-[15px] font-medium text-[var(--ink)] transition-colors hover:text-[var(--accent)] rounded-[6px]',
                    isActive &&
                      'after:absolute after:bottom-[4px] after:left-[6px] after:right-[6px] after:h-[2px] after:bg-[var(--accent)]'
                  )}
                >
                  {item.label}
                </AppLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggle}
              aria-label={
                theme === 'light'
                  ? site.header.switchToDarkLabel
                  : site.header.switchToLightLabel
              }
              className="inline-flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] border border-[var(--pillline)] bg-transparent text-[var(--ink)] transition-colors hover:bg-[var(--btn2)] cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
              ) : (
                <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </button>

            <Button
              variant="small"
              href={routes.audit}
              onClick={closeMenu}
              className="hidden md:inline-flex"
            >
              {site.auditCtaLabel}
            </Button>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-controls={MOBILE_PANEL_ID}
              aria-label={
                menuOpen
                  ? site.header.closeMenuLabel
                  : site.header.openMenuLabel
              }
              className="inline-flex md:hidden h-[44px] w-[44px] min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] border border-[var(--pillline)] bg-transparent text-[var(--ink)] transition-colors hover:bg-[var(--btn2)] cursor-pointer"
            >
              {menuOpen ? (
                <X className="h-[20px] w-[20px]" aria-hidden="true" />
              ) : (
                <Menu className="h-[20px] w-[20px]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div
            id={MOBILE_PANEL_ID}
            className="pointer-events-auto mt-[12px] md:hidden rounded-[20px] border border-[var(--pillline)] bg-[var(--pill)] backdrop-blur-[14px] p-4"
          >
            <nav
              aria-label={site.header.mainNavAriaLabel}
              className="flex flex-col gap-1"
            >
              {site.navItems.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  location.pathname.startsWith(`${item.href}/`);

                return (
                  <AppLink
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={closeMenu}
                    className={cn(
                      'inline-flex min-h-[44px] items-center px-[10px] py-[10px] font-[family-name:var(--font-sans)] text-[15px] font-medium text-[var(--ink)] rounded-[8px] transition-colors hover:bg-[var(--btn2)]',
                      isActive &&
                        'underline decoration-[var(--accent)] decoration-2 underline-offset-8'
                    )}
                  >
                    {item.label}
                  </AppLink>
                );
              })}

              <div className="pt-2">
                <Button
                  variant="small"
                  href={routes.audit}
                  onClick={closeMenu}
                  className="w-full justify-center"
                >
                  {site.auditCtaLabel}
                </Button>
              </div>
            </nav>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
