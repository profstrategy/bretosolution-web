import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Home } from '@/pages/Home';
import { Solutions } from '@/pages/Solutions';
import { Pricing } from '@/pages/Pricing';
import { Audit } from '@/pages/Audit';
import { BookCall } from '@/pages/BookCall';
import { DevFoundationSection } from '@/components/sections/DevFoundationSection';
import { devFoundationCopy } from '@/content/devFoundation';
import { routes } from '@/content/site';

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

function FoundationPage() {
  return (
    <main>
      <DevFoundationSection title={devFoundationCopy.pageTitle} />
    </main>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTopHandler />
      <Header />
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.solutions} element={<Solutions />} />
        <Route path={routes.pricing} element={<Pricing />} />
        <Route path={routes.audit} element={<Audit />} />
        <Route path={routes.bookCall} element={<BookCall />} />
        <Route path={routes.devFoundation} element={<FoundationPage />} />
      </Routes>
      <Footer />
    </>
  );
}
