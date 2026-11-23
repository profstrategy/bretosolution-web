import {
  Column,
  Heading,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import type { QuoteRequestValues } from '@/schemas/quote';
import { HONEYPOT_FIELD } from '@/schemas/honeypot';
import { ownerNotificationCopy } from '@/content/emails';
import { EmailLayout } from '@/emails/components/EmailLayout';
import { emailColors } from '@/emails/tokens';

type QuoteLead = Omit<
  QuoteRequestValues,
  typeof HONEYPOT_FIELD | 'consent'
>;

interface ConsentRecord {
  acceptedAt: Date;
  version: string;
}

export interface QuoteRequestNotificationProps {
  values: QuoteLead;
  consent: ConsentRecord;
  receivedAt: Date;
}

export const defaultProps: QuoteRequestNotificationProps = {
  values: {
    businessType: 'Restaurant',
    helpNeeded: 'AI Visibility Optimization',
    mainChallenge: undefined,
    contactName: 'Sample Owner',
    businessName: 'Sample Kitchen',
    email: 'owner@example.com',
    phoneOrWhatsapp: undefined,
    websiteOrInstagram: undefined,
    countryRegion: 'Nigeria',
  },
  consent: {
    acceptedAt: new Date('2000-01-01T00:00:00.000Z'),
    version: 'sample',
  },
  receivedAt: new Date('2000-01-01T00:00:00.000Z'),
};

function displayValue(value: string | undefined) {
  return value?.trim() || 'Not provided';
}

export function QuoteRequestNotification({
  values,
  consent,
  receivedAt,
}: QuoteRequestNotificationProps) {
  const copy = ownerNotificationCopy.quote;
  const rows = [
    [copy.labels.businessType, displayValue(values.businessType)],
    [copy.labels.helpNeeded, displayValue(values.helpNeeded)],
    [copy.labels.mainChallenge, displayValue(values.mainChallenge)],
    [copy.labels.contactName, displayValue(values.contactName)],
    [copy.labels.businessName, displayValue(values.businessName)],
    [
      copy.labels.email,
      <Link
        key="email"
        href={`mailto:${values.email}`}
        style={{ color: emailColors.accent, textDecoration: 'underline' }}
      >
        {values.email}
      </Link>,
    ],
    [copy.labels.phoneOrWhatsapp, displayValue(values.phoneOrWhatsapp)],
    [copy.labels.websiteOrInstagram, displayValue(values.websiteOrInstagram)],
    [copy.labels.countryRegion, displayValue(values.countryRegion)],
    [
      copy.labels.consent,
      `Accepted ${consent.acceptedAt.toISOString()} (policy version ${consent.version})`,
    ],
    [copy.labels.received, receivedAt.toISOString()],
  ] as const;

  return (
    <EmailLayout preheader={copy.title}>
      <Heading
        as="h1"
        style={{
          margin: '0 0 24px',
          color: emailColors.text,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: '28px',
          fontWeight: '700',
          lineHeight: '1.25',
        }}
      >
        {copy.title}
      </Heading>
      <Section style={{ backgroundColor: emailColors.card }}>
        {rows.map(([label, value]) => (
          <Row key={label} style={{ borderBottom: `1px solid ${emailColors.line}` }}>
            <Column
              style={{
                width: '34%',
                padding: '12px 12px 12px 0',
                verticalAlign: 'top',
              }}
            >
              <Text
                style={{
                  margin: '0',
                  color: emailColors.muted,
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: '700',
                  lineHeight: '1.5',
                }}
              >
                {label}
              </Text>
            </Column>
            <Column
              style={{
                padding: '12px 0',
                verticalAlign: 'top',
              }}
            >
              <Text
                style={{
                  margin: '0',
                  color: emailColors.text,
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  overflowWrap: 'anywhere',
                }}
              >
                {value}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>
    </EmailLayout>
  );
}
