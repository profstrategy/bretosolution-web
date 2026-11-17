import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home';
import { Solutions } from '@/pages/Solutions';
import { Pricing } from '@/pages/Pricing';
import { Audit } from '@/pages/Audit';
import { BookCall } from '@/pages/BookCall';
import { routes, site } from '@/content/site';

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    let rafId = 0;
    let cancelled = false;

    try {
      if (!location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        return;
      }

      const rawId = decodeURIComponent(location.hash.slice(1));
      if (!rawId) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        return;
      }

      const startTime = window.performance.now();

      const attemptScroll = () => {
        if (cancelled) return;

        const targetEl = document.getElementById(rawId);
        if (targetEl) {
          const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches;

          targetEl.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });

          if (rawId === 'quote') {
            window.dispatchEvent(new CustomEvent('breto:focus-quote-form'));
            const firstField = document.getElementById('quote-business-type');
            firstField?.focus({ preventScroll: true });
          } else {
            const heading =
              targetEl.querySelector<HTMLElement>('h1, h2, h3') ?? targetEl;
            if (!heading.hasAttribute('tabindex')) {
              heading.setAttribute('tabindex', '-1');
            }
            heading.focus({ preventScroll: true });
          }
          return;
        }

        if (window.performance.now() - startTime < 500) {
          rafId = window.requestAnimationFrame(attemptScroll);
        }
      };

      rafId = window.requestAnimationFrame(attemptScroll);
    } catch {
      // Ignore DOM/window errors
    }

    return () => {
      cancelled = true;
      try {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
        }
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [location.pathname, location.hash, location.key]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToHash />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-[10px] focus:bg-[var(--btn)] focus:px-4 focus:py-2.5 focus:font-[family-name:var(--font-sans)] focus:text-[14px] focus:font-semibold focus:text-[var(--btnfg)] focus:shadow-lg"
      >
        {site.header.skipToContentLabel}
      </a>
      <Header />
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.solutions} element={<Solutions />} />
        <Route path={routes.pricing} element={<Pricing />} />
        <Route path={routes.audit} element={<Audit />} />
        <Route path={routes.bookCall} element={<BookCall />} />
      </Routes>
      <Footer />
    </>
  );
}
