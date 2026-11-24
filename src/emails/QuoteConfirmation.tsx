import { Heading, Text } from '@react-email/components';
import { quoteConfirmationCopy } from '@/content/emails';
import {
  EmailFooter,
  EmailLayout,
} from '@/emails/components/EmailLayout';
import { emailColors } from '@/emails/tokens';

export interface QuoteConfirmationProps {
  contactName: string;
}

export const defaultProps: QuoteConfirmationProps = {
  contactName: 'Sample Owner',
};

const unsafeGreetingValue = /http|www\.|@|[\r\n\u0085\u2028\u2029]/i;

function getGreeting(contactName: string): string {
  if (unsafeGreetingValue.test(contactName)) {
    return quoteConfirmationCopy.fallbackGreeting;
  }

  const safeName = Array.from(contactName).slice(0, 60).join('').trim();
  return safeName
    ? `Hi ${safeName},`
    : quoteConfirmationCopy.fallbackGreeting;
}

export function QuoteConfirmation({ contactName }: QuoteConfirmationProps) {
  return (
    <EmailLayout
      preheader={quoteConfirmationCopy.preheader}
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
        {quoteConfirmationCopy.subject}
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
        {getGreeting(contactName)}
      </Text>
      {quoteConfirmationCopy.paragraphs.map((paragraph) => (
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
        {quoteConfirmationCopy.signoff}
      </Text>
    </EmailLayout>
  );
}
