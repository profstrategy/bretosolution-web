import 'server-only';
import { getPrismaClient } from '@/lib/db';
import {
  buildAuditReply,
  buildGeneralReply,
  buildQuoteReply,
  type AttachmentInfo,
  type BuiltEmail,
} from '@/emails/reply/build';
import { formatFileSize, resolveSubject } from '@/lib/admin/emailFormat';
import { htmlToPlainText, sanitizeComposerHtml, toEmailBodyHtml } from '@/lib/server/emailHtml';
import type { NormalisedDraft } from '@/schemas/adminEmail';

export { formatFileSize, resolveSubject };

const PREVIEW_ATTACHMENT: AttachmentInfo = { name: 'audit-report.pdf', sizeLabel: 'PDF' };

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
