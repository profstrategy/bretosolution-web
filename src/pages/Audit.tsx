import { useEffect } from 'react';
import { AuditPageSection } from '@/components/sections/audit/AuditPageSection';
import { auditPageContent } from '@/content/audit';

export function Audit() {
  useEffect(() => {
    try {
      document.title = auditPageContent.documentTitle;
    } catch {
      // Ignore document errors
    }
  }, []);

  return (
    <main>
      <AuditPageSection />
    </main>
  );
}
