import type { ReactElement } from 'react';
// Next.js 16 forbids importing react-dom/server directly in App Route modules;
// @react-email/render (already used by src/emails/render.tsx) renders the same
// static markup and adds the doctype.
import { render } from '@react-email/render';
import { AuditReply, type AttachmentInfo } from './AuditReply';
import { GeneralReply } from './GeneralReply';
import { QuoteReply } from './QuoteReply';
import { replyCopy } from './copy';
import { emailBrand as brand } from './brand';

export type { AttachmentInfo } from './AuditReply';

export interface BuildInput {
  name?: string;
  business?: string;
  /** Final subject line (placeholders already resolved). */
  subject: string;
  /** Sanitised message HTML with email inline styles. */
  bodyHtml: string;
  /** Plain-text version of the same message. */
  bodyText: string;
  signer?: string;
  calendlyUrl?: string;
  logoUrl?: string;
  attachment?: AttachmentInfo;
  /**
   * true only when the email answers a website request (AuditRequest or
   * QuoteRequest) whose email matches the recipient. Controls the
   * "You received this email because…" footer line.
   */
  confirmedWebsiteRequest: boolean;
}

export interface QuoteBuildInput extends BuildInput {
  rows?: { label: string; value: string }[];
}

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

const LINE_BREAKS = new RegExp(
  '[\\r\\n' + String.fromCharCode(0x85, 0x2028, 0x2029) + ']+',
  'g'
);

function clean(value: string): string {
  return value.replace(LINE_BREAKS, ' ').trim();
}

function greetingFor(name?: string): string {
  const n = name ? clean(name) : '';
  return n ? `Hi ${n},` : replyCopy.common.greetingFallback;
}

function preheaderFrom(bodyText: string): string {
  return clean(bodyText).slice(0, 110);
}

function toHtml(element: ReactElement): Promise<string> {
  return render(element);
}

function footerText(reason: string | undefined): string[] {
  return [
    '--',
    ...(reason ? [reason] : []),
    `Questions? Reply to this email or write to ${brand.contactEmail}.`,
    `Unsubscribe: ${replyCopy.common.unsubscribeHref}`,
    '',
    brand.name,
    ...brand.addressLines,
  ];
}

function attachmentText(title: string, note: string, attachment?: AttachmentInfo): string[] {
  return attachment
    ? [`${title}: ${attachment.name} (${attachment.sizeLabel})`, note, '']
    : [];
}

function ctaText(lead: string, label: string, url?: string): string[] {
  return url ? [lead, `${label}: ${url}`, ''] : [];
}

export async function buildAuditReply(input: BuildInput): Promise<BuiltEmail> {
  if (!input.attachment) {
    throw new Error('The audit reply needs the PDF attachment details.');
  }
  const c = replyCopy.audit;
  const subject = clean(input.subject);
  const signer = clean(input.signer ?? replyCopy.common.defaultSigner);
  const greeting = greetingFor(input.name);
  const footerReason = input.confirmedWebsiteRequest ? c.footerReason : undefined;
  const html = await toHtml(
    <AuditReply
      subject={subject}
      preheader={preheaderFrom(input.bodyText)}
      greeting={greeting}
      business={input.business}
      bodyHtml={input.bodyHtml}
      attachment={input.attachment}
      calendlyUrl={input.calendlyUrl}
      signer={signer}
      logoUrl={input.logoUrl ?? brand.logoUrl}
      footerReason={footerReason}
    />
  );
  const text = [
    c.heading.toUpperCase(),
    input.business ? `Prepared for ${input.business}` : '',
    '',
    greeting,
    '',
    input.bodyText,
    '',
    ...attachmentText(c.attachmentTitle, c.attachmentNote, input.attachment),
    ...ctaText(c.ctaLead, c.ctaLabel, input.calendlyUrl),
    'Best regards,',
    signer,
    '',
    ...footerText(footerReason),
  ].join('\n');
  return { subject, html, text };
}

export async function buildQuoteReply(input: QuoteBuildInput): Promise<BuiltEmail> {
  const c = replyCopy.quote;
  const rows = input.rows ?? [];
  const subject = clean(input.subject);
  const signer = clean(input.signer ?? replyCopy.common.defaultSigner);
  const greeting = greetingFor(input.name);
  const footerReason = input.confirmedWebsiteRequest ? c.footerReason : undefined;
  const html = await toHtml(
    <QuoteReply
      subject={subject}
      preheader={preheaderFrom(input.bodyText)}
      greeting={greeting}
      business={input.business}
      bodyHtml={input.bodyHtml}
      rows={rows}
      attachment={input.attachment}
      calendlyUrl={input.calendlyUrl}
      signer={signer}
      logoUrl={input.logoUrl ?? brand.logoUrl}
      footerReason={footerReason}
    />
  );
  const text = [
    c.heading.toUpperCase(),
    input.business ? `Prepared for ${input.business}` : '',
    '',
    greeting,
    '',
    input.bodyText,
    '',
    ...(rows.length
      ? [c.rowsTitle, ...rows.map((r) => `- ${r.label}: ${r.value}`), '']
      : []),
    ...attachmentText(c.attachmentTitle, c.attachmentNote, input.attachment),
    ...ctaText(c.ctaLead, c.ctaLabel, input.calendlyUrl),
    'Best regards,',
    signer,
    '',
    c.bindingNote,
    '',
    ...footerText(footerReason),
  ].join('\n');
  return { subject, html, text };
}

export async function buildGeneralReply(input: BuildInput): Promise<BuiltEmail> {
  const c = replyCopy.general;
  const subject = clean(input.subject);
  const signer = clean(input.signer ?? replyCopy.common.defaultSigner);
  const greeting = greetingFor(input.name);
  const footerReason = input.confirmedWebsiteRequest ? c.footerReason : undefined;
  const html = await toHtml(
    <GeneralReply
      subject={subject}
      preheader={preheaderFrom(input.bodyText)}
      greeting={greeting}
      bodyHtml={input.bodyHtml}
      attachment={input.attachment}
      calendlyUrl={input.calendlyUrl}
      signer={signer}
      logoUrl={input.logoUrl ?? brand.logoUrl}
      footerReason={footerReason}
    />
  );
  const text = [
    greeting,
    '',
    input.bodyText,
    '',
    ...attachmentText(c.attachmentTitle, c.attachmentNote, input.attachment),
    ...ctaText(c.ctaLead, c.ctaLabel, input.calendlyUrl),
    'Best regards,',
    signer,
    '',
    ...footerText(footerReason),
  ].join('\n');
  return { subject, html, text };
}
