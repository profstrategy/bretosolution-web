import { createHash } from 'node:crypto';
import type { Attachment } from 'resend';
import { getPrismaClient } from '@/lib/db';
import {
  badRequest,
  conflict,
  guardAdmin,
  json,
  notFound,
  serverError,
  validId,
} from '@/lib/server/adminApi';
import { recordToDraft, toAdminEmailDTO } from '@/lib/server/adminEmailDto';
import { renderAdminEmail } from '@/lib/server/adminEmailRender';
import { hasVisibleText } from '@/lib/server/emailHtml';
import { getAdminSendIdentity, getResendClient, safeSendError } from '@/lib/server/resendClient';
import { AttachmentTooLargeError, downloadAttachment } from '@/lib/server/storage';
import { site } from '@/content/site';
import {
  ADMIN_EMAIL_ID_PATTERN,
  MAX_ATTACHMENT_BYTES,
  sendRuleErrors,
} from '@/schemas/adminEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const SENDABLE = ['DRAFT', 'FAILED'] as const;
const NOT_SENDABLE = 'This email has already been sent or is being sent.';

class SendFailure extends Error {
  readonly safeMessage: string;
  readonly code: string | number | null;
  constructor(safeMessage: string, code: string | number | null = null) {
    super('Send failed.');
    this.name = 'SendFailure';
    this.safeMessage = safeMessage;
    this.code = code;
  }
}

function isPdf(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString('latin1') === '%PDF-';
}

/**
 * POST /api/admin/emails/[id]/send
 * Claims the email atomically (DRAFT|FAILED → SENDING) so it cannot be sent
 * twice, renders it, attaches the verified PDF and sends it through Resend.
 */
export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: true });
  if (auth instanceof Response) return auth;
  const id = validId((await context.params).id, ADMIN_EMAIL_ID_PATTERN);
  if (!id) return notFound();

  const prisma = getPrismaClient();

  let draft;
  try {
    const existing = await prisma.adminEmail.findUnique({ where: { id } });
    if (!existing) return notFound();
    if (!SENDABLE.some((status) => status === existing.status)) return conflict(NOT_SENDABLE);
    draft = recordToDraft(existing);
  } catch (error) {
    return serverError('emails/send:load', error);
  }

  const ruleErrors = sendRuleErrors(draft, hasVisibleText(draft.bodyHtml));
  if (Object.keys(ruleErrors).length > 0) return badRequest(ruleErrors);

  // Atomic claim: only one request can move this email to SENDING.
  try {
    const claimed = await prisma.adminEmail.updateMany({
      where: { id, status: { in: [...SENDABLE] } },
      data: { status: 'SENDING', error: null },
    });
    if (claimed.count === 0) return conflict(NOT_SENDABLE);
  } catch (error) {
    return serverError('emails/send:claim', error);
  }

  try {
    const rendered = await renderAdminEmail(draft);

    const attachments: Attachment[] = [];
    if (draft.attachment) {
      let pdf: Buffer;
      try {
        pdf = await downloadAttachment(draft.attachment.storagePath, MAX_ATTACHMENT_BYTES);
      } catch (error) {
        if (error instanceof AttachmentTooLargeError) {
          throw new SendFailure('The attachment is larger than 15 MB. Upload a smaller PDF.', 'too-large');
        }
        throw new SendFailure('The attachment could not be found. Upload the PDF again.', 'storage');
      }
      if (pdf.length === 0 || pdf.length > MAX_ATTACHMENT_BYTES || !isPdf(pdf)) {
        throw new SendFailure('The attachment is not a valid PDF. Upload it again.', 'not-pdf');
      }
      attachments.push({ filename: draft.attachment.name, content: pdf, contentType: 'application/pdf' });
    }

    const headers: Record<string, string> = {
      'List-Unsubscribe': `<mailto:${site.contactEmail}?subject=Unsubscribe>`,
    };
    if (draft.inReplyToMessageId) {
      headers['In-Reply-To'] = draft.inReplyToMessageId;
      headers['References'] = draft.inReplyToMessageId;
    }

    const { from, replyTo } = getAdminSendIdentity();
    const payload = {
      from,
      to: [draft.toEmail],
      replyTo,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      headers,
      ...(attachments.length > 0 ? { attachments } : {}),
    };

    // Same email + same content → same key, so a retry after an unknown
    // outcome cannot deliver twice; an edited email gets a new key.
    const contentHash = createHash('sha256')
      .update(JSON.stringify({ to: payload.to, subject: payload.subject, html: payload.html, text: payload.text, headers, attachment: draft.attachment?.storagePath ?? null }))
      .digest('hex')
      .slice(0, 32);

    const { data, error } = await getResendClient().emails.send(payload, {
      idempotencyKey: `admin-email/${id}/${contentHash}`,
    });
    if (error || !data) {
      throw new SendFailure(safeSendError(error?.name), error?.name ?? 'no-data');
    }

    const sent = await prisma.adminEmail.update({
      where: { id },
      data: { status: 'SENT', resendId: data.id, sentAt: new Date(), error: null },
    });
    return json({ email: toAdminEmailDTO(sent) });
  } catch (error) {
    const safeMessage = error instanceof SendFailure ? error.safeMessage : 'The email could not be sent.';
    await prisma.adminEmail
      .update({ where: { id }, data: { status: 'FAILED', error: safeMessage } })
      .catch((updateError: unknown) => {
        console.error('[admin-api] emails/send: could not mark FAILED.', updateError instanceof Error ? updateError.name : typeof updateError);
      });
    if (error instanceof SendFailure && (error.code === 'storage' || error.code === 'not-pdf' || error.code === 'too-large')) {
      return badRequest({ attachment: error.safeMessage });
    }
    return serverError('emails/send', error, error instanceof SendFailure ? error.code : null);
  }
}
