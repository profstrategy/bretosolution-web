import { Resend } from 'resend';
import type { AuditRequestValues } from '@/schemas/audit';
import type { QuoteRequestValues } from '@/schemas/quote';
import { HONEYPOT_FIELD } from '@/schemas/honeypot';
import { getResendConfig } from '@/lib/server/env';

type AuditLead = Omit<
  AuditRequestValues,
  typeof HONEYPOT_FIELD | 'consent'
>;
type QuoteLead = Omit<
  QuoteRequestValues,
  typeof HONEYPOT_FIELD | 'consent'
>;
interface ConsentRecord {
  acceptedAt: Date;
  version: string;
}

export type NotificationResult =
  | { ok: true }
  | { ok: false; error: unknown };

function safeSubjectValue(value: string): string {
  return value.replace(/[\r\n\u0085\u2028\u2029]+/g, ' ').trim();
}

export async function notifyAuditRequest(
  values: AuditLead,
  consent: ConsentRecord
): Promise<NotificationResult> {
  const config = getResendConfig();
  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to: [config.to],
    subject: `New audit request: ${safeSubjectValue(values.businessName)}`,
    text: [
      'New audit request',
      '',
      `Business name: ${values.businessName}`,
      `Website or Instagram: ${values.websiteOrInstagram}`,
      `City: ${values.city}`,
      `Business type: ${values.businessType}`,
      `Email: ${values.email}`,
      `Consent: accepted ${consent.acceptedAt.toISOString()} (policy version ${consent.version})`,
    ].join('\n'),
  });

  return error ? { ok: false, error } : { ok: true };
}

export async function notifyQuoteRequest(
  values: QuoteLead,
  consent: ConsentRecord
): Promise<NotificationResult> {
  const config = getResendConfig();
  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to: [config.to],
    subject: `New quote request: ${safeSubjectValue(values.businessName)}`,
    text: [
      'New quote request',
      '',
      `Business type: ${values.businessType}`,
      `Help needed: ${values.helpNeeded}`,
      `Main challenge: ${values.mainChallenge ?? ''}`,
      `Contact name: ${values.contactName}`,
      `Business name: ${values.businessName}`,
      `Email: ${values.email}`,
      `Phone or WhatsApp: ${values.phoneOrWhatsapp ?? ''}`,
      `Website or Instagram: ${values.websiteOrInstagram ?? ''}`,
      `Country or region: ${values.countryRegion}`,
      `Consent: accepted ${consent.acceptedAt.toISOString()} (policy version ${consent.version})`,
    ].join('\n'),
  });

  return error ? { ok: false, error } : { ok: true };
}
