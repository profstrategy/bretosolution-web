import type { CSSProperties, ReactNode } from 'react';
import { emailTokens as t } from './tokens';

const body: CSSProperties = {
  fontFamily: t.fontBody,
  fontSize: 16,
  lineHeight: '1.65',
  color: t.ink,
  margin: 0,
};

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: t.fontBody,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: t.accent,
        margin: '0 0 10px',
      }}
    >
      {children}
    </p>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: t.fontHeading,
        fontSize: 28,
        lineHeight: '1.25',
        fontWeight: 700,
        color: t.ink,
        margin: '0 0 8px',
      }}
    >
      {children}
    </h1>
  );
}

export function Subheading({ children }: { children: ReactNode }) {
  return (
    <p style={{ ...body, fontSize: 15, color: t.muted, margin: '0 0 24px' }}>
      {children}
    </p>
  );
}

/** One paragraph of the personal message. Single line breaks are kept. */
export function Para({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <p style={{ ...body, margin: '0 0 16px' }}>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

/**
 * The personal message as HTML. `html` MUST already be sanitised and given
 * email-safe inline styles by `toEmailBodyHtml()` in
 * src/lib/server/emailHtml.ts; this component does not sanitise.
 */
export function BodyHtml({ html }: { html: string }) {
  return <div style={{ margin: '0 0 8px' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Callout({
  title,
  note,
  detail,
}: {
  title: string;
  note: string;
  detail: string;
}) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ margin: '8px 0 24px', width: '100%' }}
    >
      <tbody>
        <tr>
          <td
            style={{
              background: t.panel,
              border: `1px solid ${t.line}`,
              borderRadius: 10,
              padding: '16px 18px',
            }}
          >
            <p
              style={{
                ...body,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: t.muted,
                margin: '0 0 6px',
              }}
            >
              {title}
            </p>
            <p
              style={{
                ...body,
                fontFamily: t.fontHeading,
                fontSize: 17,
                fontWeight: 700,
                margin: '0 0 6px',
                wordBreak: 'break-word',
              }}
            >
              {detail}
            </p>
            <p style={{ ...body, fontSize: 14, color: t.muted }}>{note}</p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function KeyValueTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ margin: '8px 0 24px', width: '100%' }}
    >
      <tbody>
        <tr>
          <td
            style={{
              background: t.panel,
              border: `1px solid ${t.line}`,
              borderRadius: 10,
              padding: '16px 18px',
            }}
          >
            <p
              style={{
                ...body,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: t.muted,
                margin: '0 0 10px',
              }}
            >
              {title}
            </p>
            <table
              role="presentation"
              width="100%"
              cellPadding={0}
              cellSpacing={0}
            >
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td
                      valign="top"
                      style={{
                        ...body,
                        fontSize: 14,
                        color: t.muted,
                        padding: '8px 12px 8px 0',
                        width: '38%',
                        borderTop: i === 0 ? 'none' : `1px solid ${t.line}`,
                      }}
                    >
                      {row.label}
                    </td>
                    <td
                      valign="top"
                      style={{
                        ...body,
                        fontSize: 15,
                        fontWeight: 700,
                        padding: '8px 0',
                        borderTop: i === 0 ? 'none' : `1px solid ${t.line}`,
                        wordBreak: 'break-word',
                      }}
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function CtaButton({
  lead,
  label,
  href,
}: {
  lead: string;
  label: string;
  href: string;
}) {
  return (
    <div style={{ margin: '8px 0 24px' }}>
      <p style={{ ...body, margin: '0 0 14px' }}>{lead}</p>
      <table role="presentation" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td
              style={{
                background: t.accent,
                borderRadius: 8,
                padding: '14px 26px',
              }}
            >
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 16,
                  fontWeight: 700,
                  color: t.accentInk,
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                {label}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function SignOff({ signer }: { signer: string }) {
  return (
    <p style={{ ...body, margin: '8px 0 0' }}>
      Best regards,
      <br />
      <strong>{signer}</strong>
    </p>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p style={{ ...body, fontSize: 13, color: t.muted, margin: '20px 0 0' }}>
      {children}
    </p>
  );
}
