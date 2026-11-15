import { useEffect } from 'react';
import { BookCallSection } from '@/components/sections/booking/BookCallSection';
import { bookCallContent } from '@/content/bookCall';

export function BookCall() {
  useEffect(() => {
    try {
      document.title = bookCallContent.documentTitle;
    } catch {
      // Ignore document errors
    }
  }, []);

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <BookCallSection />
    </main>
  );
}
