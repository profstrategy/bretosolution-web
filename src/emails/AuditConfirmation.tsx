import { Heading, Text } from '@react-email/components';
import { auditConfirmationCopy } from '@/content/emails';
import {
  EmailFooter,
  EmailLayout,
} from '@/emails/components/EmailLayout';
import { emailColors } from '@/emails/tokens';

export interface AuditConfirmationProps {
  businessName: string;
}

export const defaultProps: AuditConfirmationProps = {
  businessName: 'Sample Kitchen',
};

const unsafeGreetingValue = /http|www\.|@|[\r\n\u0085\u2028\u2029]/i;

function getGreeting(businessName: string): string {
  if (unsafeGreetingValue.test(businessName)) {
    return auditConfirmationCopy.fallbackGreeting;
  }

  const safeName = Array.from(businessName).slice(0, 60).join('').trim();
  return safeName
    ? `Hi ${safeName} team,`
    : auditConfirmationCopy.fallbackGreeting;
}

export function AuditConfirmation({ businessName }: AuditConfirmationProps) {
  return (
    <EmailLayout
      preheader={auditConfirmationCopy.preheader}
      footer={<EmailFooter />}
    >
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
        {auditConfirmationCopy.subject}
      </Heading>
      <Text
        style={{
          margin: '0 0 16px',
          color: emailColors.text,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6',
        }}
      >
        {getGreeting(businessName)}
      </Text>
      {auditConfirmationCopy.paragraphs.map((paragraph) => (
        <Text
          key={paragraph}
          style={{
            margin: '0 0 16px',
            color: emailColors.text,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '16px',
            lineHeight: '1.6',
          }}
        >
          {paragraph}
        </Text>
      ))}
      <Text
        style={{
          margin: '24px 0 0',
          color: emailColors.text,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6',
        }}
      >
        {auditConfirmationCopy.signoff}
      </Text>
    </EmailLayout>
  );
}
