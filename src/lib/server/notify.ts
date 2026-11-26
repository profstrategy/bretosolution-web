import 'server-only';
import { createElement } from 'react';
import { Resend } from 'resend';
import type { AuditRequestValues } from '@/schemas/audit';
import type { QuoteRequestValues } from '@/schemas/quote';
import { HONEYPOT_FIELD } from '@/schemas/honeypot';
import {
  auditConfirmationCopy,
  ownerNotificationCopy,
  quoteConfirmationCopy,
} from '@/content/emails';
import { site } from '@/content/site';
import { AuditConfirmation } from '@/emails/AuditConfirmation';
import { AuditRequestNotification } from '@/emails/AuditRequestNotification';
import { QuoteConfirmation } from '@/emails/QuoteConfirmation';
import { QuoteRequestNotification } from '@/emails/QuoteRequestNotification';
import { renderEmail } from '@/emails/render';
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
  const { html, text } = await renderEmail(
    createElement(AuditRequestNotification, {
      values,
      consent,
      receivedAt: consent.acceptedAt,
    })
  );
  const { error } = await resend.emails.send({
    from: config.from,
    to: [config.to],
    subject: `New audit request: ${safeSubjectValue(values.businessName)}`,
    replyTo: values.email,
    html,
    text,
  });

  return error ? { ok: false, error } : { ok: true };
}

export async function notifyQuoteRequest(
  values: QuoteLead,
  consent: ConsentRecord
): Promise<NotificationResult> {
  const config = getResendConfig();
  const resend = new Resend(config.apiKey);
  const { html, text } = await renderEmail(
    createElement(QuoteRequestNotification, {
      values,
      consent,
      receivedAt: consent.acceptedAt,
    })
  );
  const { error } = await resend.emails.send({
    from: config.from,
    to: [config.to],
    subject: `New quote request: ${safeSubjectValue(values.businessName)}`,
    replyTo: values.email,
    html,
    text,
  });

  return error ? { ok: false, error } : { ok: true };
}

export async function sendAuditConfirmation(
  values: AuditLead
): Promise<NotificationResult> {
  const config = getResendConfig();
  const resend = new Resend(config.apiKey);
  const { html, text } = await renderEmail(
    createElement(AuditConfirmation, { businessName: values.businessName }),
    { includeUnsubscribeUrl: true }
  );
  const { error } = await resend.emails.send({
    from: config.from,
    to: [values.email],
    subject: auditConfirmationCopy.subject,
    replyTo: site.contactEmail,
    headers: {
      'List-Unsubscribe': `<mailto:${site.contactEmail}?subject=Unsubscribe>`,
    },
    html,
    text,
  });

  return error ? { ok: false, error } : { ok: true };
}

export async function sendQuoteConfirmation(
  values: QuoteLead
): Promise<NotificationResult> {
  const config = getResendConfig();
  const resend = new Resend(config.apiKey);
  const { html, text } = await renderEmail(
    createElement(QuoteConfirmation, { contactName: values.contactName }),
    { includeUnsubscribeUrl: true }
  );
  const { error } = await resend.emails.send({
    from: config.from,
    to: [values.email],
    subject: quoteConfirmationCopy.subject,
    replyTo: site.contactEmail,
    headers: {
      'List-Unsubscribe': `<mailto:${site.contactEmail}?subject=Unsubscribe>`,
    },
    html,
    text,
  });

  return error ? { ok: false, error } : { ok: true };
}
