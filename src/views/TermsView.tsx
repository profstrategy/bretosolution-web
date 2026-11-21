import { LegalDocument } from '@/components/legal/LegalDocument';
import {
  LEGAL_LAST_UPDATED,
  termsOfService,
} from '@/content/legal';

export default function TermsView() {
  return (
    <LegalDocument
      eyebrow="Terms"
      title="Terms of Service"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro="These terms explain how visitors and people submitting forms may use the Bretosolution website and request an audit or quote."
      sections={termsOfService}
    />
  );
}
