import 'server-only';
import { getPrismaClient } from '@/lib/db';
import {
  buildAuditReply,
  buildGeneralReply,
  buildQuoteReply,
  type AttachmentInfo,
  type BuiltEmail,
} from '@/emails/reply/build';
import { replyCopy } from '@/emails/reply/copy';
import { htmlToPlainText, sanitizeComposerHtml, toEmailBodyHtml } from '@/lib/server/emailHtml';
import type { NormalisedDraft } from '@/schemas/adminEmail';

const PREVIEW_ATTACHMENT: AttachmentInfo = { name: 'audit-report.pdf', sizeLabel: 'PDF' };

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PLACEHOLDER = /\{\s*(name|business)\s*\}/gi;

/**
 * Resolves the subject. `{name}` and `{business}` are replaced with the
 * recipient's details, so one subject pattern can be personalised per
 * client. An empty subject falls back to the template default
 * (AUDIT/QUOTE only; GENERAL requires a subject).
 */
export function resolveSubject(draft: Pick<NormalisedDraft, 'kind' | 'subject' | 'recipientName' | 'businessName'>): string {
  const filled = draft.subject
    .replace(PLACEHOLDER, (_match, key: string) =>
      key.toLowerCase() === 'name' ? draft.recipientName : draft.businessName
    )
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (filled) return filled;
  if (draft.kind === 'AUDIT') {
    return draft.businessName
      ? `${replyCopy.audit.defaultSubject} for ${draft.businessName}`
      : replyCopy.audit.defaultSubject;
  }
  if (draft.kind === 'QUOTE') return replyCopy.quote.defaultSubject;
  return '(no subject)';
}

/**
 * True only when the draft is linked to a website request (AuditRequest or
 * QuoteRequest) that exists and was submitted from the recipient's address.
 * This controls the "You received this email because…" footer line; a new
 * or cold email never shows it.
 */
export async function isConfirmedWebsiteRequest(
  draft: Pick<NormalisedDraft, 'source' | 'toEmail'>
): Promise<boolean> {
  if (!draft.source || !draft.toEmail) return false;
  const prisma = getPrismaClient();
  const request =
    draft.source.type === 'AUDIT'
      ? await prisma.auditRequest.findUnique({ where: { id: draft.source.id }, select: { email: true } })
      : await prisma.quoteRequest.findUnique({ where: { id: draft.source.id }, select: { email: true } });
  if (!request) return false;
  return request.email.trim().toLowerCase() === draft.toEmail.trim().toLowerCase();
}

export interface RenderOptions {
  /** Preview only: show a placeholder when an AUDIT draft has no PDF yet. */
  preview?: boolean;
}

/** Draft → { subject, html, text } in the branded reply templates. */
export async function renderAdminEmail(
  draft: NormalisedDraft,
  { preview = false }: RenderOptions = {}
): Promise<BuiltEmail> {
  const clean = sanitizeComposerHtml(draft.bodyHtml);
  const bodyHtml = toEmailBodyHtml(clean);
  const bodyText = htmlToPlainText(clean);
  const attachment: AttachmentInfo | undefined = draft.attachment
    ? { name: draft.attachment.name, sizeLabel: formatFileSize(draft.attachment.size) }
    : undefined;

  const input = {
    name: draft.recipientName || undefined,
    business: draft.businessName || undefined,
    subject: resolveSubject(draft),
    bodyHtml,
    bodyText,
    calendlyUrl: draft.calendlyUrl ?? undefined,
    attachment,
    confirmedWebsiteRequest: await isConfirmedWebsiteRequest(draft),
  };

  switch (draft.kind) {
    case 'AUDIT':
      return buildAuditReply({
        ...input,
        attachment: attachment ?? (preview ? PREVIEW_ATTACHMENT : undefined),
      });
    case 'QUOTE':
      return buildQuoteReply({ ...input, rows: draft.rows });
    case 'GENERAL':
      return buildGeneralReply(input);
  }
}
