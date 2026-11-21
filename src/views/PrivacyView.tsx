import { LegalDocument } from '@/components/legal/LegalDocument';
import {
  LEGAL_LAST_UPDATED,
  privacyPolicy,
} from '@/content/legal';

export default function PrivacyView() {
  return (
    <LegalDocument
      eyebrow="Privacy"
      title="Privacy Policy"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro="This policy explains what the Bretosolution website collects, why it uses that information, and the choices available to people who submit a request."
      sections={privacyPolicy}
    />
  );
}
