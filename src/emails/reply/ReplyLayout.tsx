import type { ReactNode } from 'react';
import { emailTokens as t } from './tokens';
import { emailBrand as brand } from './brand';
import { replyCopy } from './copy';

export interface ReplyLayoutProps {
  title: string;
  preheader: string;
  /** Shown only for emails that answer a confirmed website request. */
  footerReason?: string;
  logoUrl?: string;
  children: ReactNode;
}

const hidden = {
  display: 'none',
  fontSize: 1,
  lineHeight: '1px',
  maxHeight: 0,
  maxWidth: 0,
  opacity: 0,
  overflow: 'hidden',
  msoHide: 'all',
} as const;

function Logo({ logoUrl }: { logoUrl?: string }) {
  if (logoUrl) {
    return (
      // Email HTML: next/image does not apply.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        width={44}
        height={44}
        alt={brand.name}
        style={{ display: 'block', border: 0, borderRadius: 10 }}
      />
    );
  }
  // Fallback when no PNG logo is configured: a black tile with a B.
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td
            align="center"
            valign="middle"
            width={44}
            height={44}
            style={{
              width: 44,
              height: 44,
              background: t.ink,
              borderRadius: 10,
              fontFamily: t.fontHeading,
              fontSize: 22,
              fontWeight: 700,
              color: t.bg,
            }}
          >
            B
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function ReplyLayout({
  title,
  preheader,
  footerReason,
  logoUrl,
  children,
}: ReplyLayoutProps) {
  const small = {
    fontFamily: t.fontBody,
    fontSize: 12,
    lineHeight: '1.6',
    color: t.muted,
    margin: 0,
  } as const;

  return (
    <html lang="en">
      {/* Email HTML document, not a Next.js page. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>{title}</title>
      </head>
      <body style={{ margin: 0, padding: 0, background: t.bg }}>
        <div style={hidden}>{preheader}</div>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ background: t.bg, width: '100%' }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: '32px 16px' }}>
                <table
                  role="presentation"
                  width={600}
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ width: '100%', maxWidth: 600 }}
                >
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td style={{ padding: '0 4px 20px' }}>
                        <table
                          role="presentation"
                          cellPadding={0}
                          cellSpacing={0}
                        >
                          <tbody>
                            <tr>
                              <td valign="middle" style={{ paddingRight: 12 }}>
                                <Logo logoUrl={logoUrl} />
                              </td>
                              <td valign="middle">
                                <a
                                  href={brand.siteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontFamily: t.fontHeading,
                                    fontSize: 20,
                                    fontWeight: 700,
                                    letterSpacing: '0.2em',
                                    color: t.ink,
                                    textDecoration: 'none',
                                  }}
                                >
                                  BRETO
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    {/* Card */}
                    <tr>
                      <td
                        style={{
                          background: t.card,
                          border: `1px solid ${t.line}`,
                          borderRadius: 14,
                          padding: '36px 32px',
                        }}
                      >
                        {children}
                      </td>
                    </tr>
                    {/* Footer */}
                    <tr>
                      <td style={{ padding: '22px 8px 0' }}>
                        {footerReason ? <p style={small}>{footerReason}</p> : null}
                        <p style={{ ...small, marginTop: footerReason ? 6 : 0 }}>
                          Questions? Just reply to this email, or write to{' '}
                          <a
                            href={`mailto:${brand.contactEmail}`}
                            style={{ color: t.muted }}
                          >
                            {brand.contactEmail}
                          </a>
                          .{' '}
                          <a
                            href={replyCopy.common.unsubscribeHref}
                            style={{ color: t.muted }}
                          >
                            {replyCopy.common.unsubscribeLabel}
                          </a>
                        </p>
                        <p style={{ ...small, marginTop: 6 }}>
                          {replyCopy.common.contact.websiteLabel}:{' '}
                          <a href={replyCopy.common.websiteUrl} style={{ color: t.muted }}>
                            {replyCopy.common.websiteLabel}
                          </a>
                          {' · '}
                          {replyCopy.common.contact.whatsappLabel}:{' '}
                          <a href={replyCopy.common.contact.whatsappUrl} style={{ color: t.muted }}>
                            {replyCopy.common.contact.whatsapp}
                          </a>
                        </p>
                        <p style={{ ...small, marginTop: 12 }}>
                          {brand.name}
                          {brand.addressLines.map((line, i) => (
                            <span key={i}>
                              <br />
                              {line}
                            </span>
                          ))}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
