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

function ScrollToTopHandler() {
  const location = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {
      // Ignore DOM/window errors
    }
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTopHandler />
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
