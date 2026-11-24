import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactNode } from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { emailFooterCopy, getUnsubscribeUrl } from '@/content/emails';
import { site } from '@/content/site';
import { seoContent } from '@/content/seo';
import { emailColors } from '@/emails/tokens';

const emailLogoPath = join(
  process.cwd(),
  'public',
  'brand',
  'breto-logo-email.png'
);

interface EmailLayoutProps {
  preheader: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function EmailFooter() {
  return (
    <Section style={{ backgroundColor: emailColors.footer }}>
      <Text
        style={{
          margin: '0 0 8px',
          color: emailColors.muted,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '12px',
          lineHeight: '1.5',
        }}
      >
        {emailFooterCopy.submittedNotice}
      </Text>
      <Text
        style={{
          margin: '0 0 8px',
          color: emailColors.text,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '12px',
          lineHeight: '1.5',
        }}
      >
        <Link
          href={getUnsubscribeUrl()}
          style={{ color: emailColors.accent, textDecoration: 'underline' }}
        >
          {emailFooterCopy.unsubscribeLabel}
        </Link>
      </Text>
      <Text
        style={{
          margin: '0',
          color: emailColors.muted,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '12px',
          lineHeight: '1.5',
        }}
      >
        {emailFooterCopy.postalAddress.map((line, index) => (
          <span key={line}>
            {index > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </Text>
    </Section>
  );
}

export function EmailLayout({
  preheader,
  children,
  footer,
}: EmailLayoutProps) {
  const hasEmailLogo = existsSync(emailLogoPath);

  return (
    <Html lang="en" style={{ backgroundColor: emailColors.background }}>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preheader}</Preview>
      <Body
        style={{
          margin: '0',
          padding: '24px 12px',
          backgroundColor: emailColors.background,
          color: emailColors.text,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: '16px',
          lineHeight: '1.6',
        }}
      >
        <Container
          style={{
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <Section
            style={{
              padding: '8px 0 20px',
              backgroundColor: emailColors.background,
            }}
          >
            {hasEmailLogo ? (
              <Img
                src={`${seoContent.siteUrl}/brand/breto-logo-email.png`}
                width="112"
                height="112"
                alt="Bretosolution"
                style={{
                  display: 'block',
                  width: '112px',
                  height: '112px',
                  border: '0',
                }}
              />
            ) : (
              <Text
                style={{
                  margin: '0',
                  color: emailColors.text,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: '28px',
                  fontWeight: '700',
                  lineHeight: '1.2',
                }}
              >
                {site.wordmark}
              </Text>
            )}
          </Section>
          <Section
            style={{
              padding: '32px 28px',
              backgroundColor: emailColors.card,
              border: `1px solid ${emailColors.line}`,
            }}
          >
            {children}
          </Section>
          {footer ? (
            <Section
              style={{
                padding: '20px 24px',
                backgroundColor: emailColors.footer,
              }}
            >
              {footer}
            </Section>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}
