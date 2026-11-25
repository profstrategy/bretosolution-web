import { getPrismaClient } from '@/lib/db';
import {
  badRequest,
  conflict,
  guardAdmin,
  json,
  notFound,
  readValidatedJson,
  serverError,
  validId,
} from '@/lib/server/adminApi';
import { draftToColumns, recordToDraft, toAdminEmailDTO } from '@/lib/server/adminEmailDto';
import { sanitizeComposerHtml } from '@/lib/server/emailHtml';
import { removeAttachment } from '@/lib/server/storage';
import {
  ADMIN_EMAIL_ID_PATTERN,
  draftRuleErrors,
  patchDraftSchema,
  type NormalisedDraft,
} from '@/schemas/adminEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const EDITABLE = ['DRAFT', 'FAILED'] as const;
const ALREADY_SENT = 'This email has already been sent and cannot be edited.';

/** GET /api/admin/emails/[id] */
export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: false });
  if (auth instanceof Response) return auth;
  const id = validId((await context.params).id, ADMIN_EMAIL_ID_PATTERN);
  if (!id) return notFound();

  try {
    const record = await getPrismaClient().adminEmail.findUnique({ where: { id } });
    return record ? json({ email: toAdminEmailDTO(record) }) : notFound();
  } catch (error) {
    return serverError('emails/get', error);
  }
}

/** PATCH /api/admin/emails/[id]  Only DRAFT or FAILED; an edit returns it to DRAFT. */
export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: true });
  if (auth instanceof Response) return auth;
  const id = validId((await context.params).id, ADMIN_EMAIL_ID_PATTERN);
  if (!id) return notFound();

  const body = await readValidatedJson(request, patchDraftSchema);
  if (!body.ok) return body.response;
  const patch = body.data;

  try {
    const prisma = getPrismaClient();
    const existing = await prisma.adminEmail.findUnique({ where: { id } });
    if (!existing) return notFound();
    if (!EDITABLE.some((status) => status === existing.status)) return conflict(ALREADY_SENT);

    const current = recordToDraft(existing);
    const merged: NormalisedDraft = {
      kind: patch.kind ?? current.kind,
      toEmail: patch.toEmail ?? current.toEmail,
      recipientName: patch.recipientName ?? current.recipientName,
      businessName: patch.businessName ?? current.businessName,
      subject: patch.subject ?? current.subject,
      bodyHtml: patch.bodyHtml !== undefined ? sanitizeComposerHtml(patch.bodyHtml) : current.bodyHtml,
      calendlyUrl: patch.calendlyUrl !== undefined ? patch.calendlyUrl : current.calendlyUrl,
      rows: patch.rows ?? current.rows,
      attachment: patch.attachment !== undefined ? patch.attachment : current.attachment,
      inReplyToMessageId:
        patch.inReplyToMessageId !== undefined ? patch.inReplyToMessageId : current.inReplyToMessageId,
      source: patch.source !== undefined ? patch.source : current.source,
    };
    const ruleErrors = draftRuleErrors(merged);
    if (Object.keys(ruleErrors).length > 0) return badRequest(ruleErrors);

    // Guarded update: a concurrent send can no longer be edited.
    const updated = await prisma.adminEmail.updateMany({
      where: { id, status: { in: [...EDITABLE] } },
      data: { ...draftToColumns(merged), status: 'DRAFT', error: null },
    });
    if (updated.count === 0) return conflict(ALREADY_SENT);

    const oldPath = current.attachment?.storagePath;
    if (oldPath && oldPath !== merged.attachment?.storagePath) {
      await removeAttachment(oldPath).catch((error: unknown) => {
        console.error('[admin-api] emails/update: old attachment removal failed.', error instanceof Error ? error.name : typeof error);
      });
    }

    const record = await prisma.adminEmail.findUniqueOrThrow({ where: { id } });
    return json({ email: toAdminEmailDTO(record) });
  } catch (error) {
    return serverError('emails/update', error);
  }
}

/** DELETE /api/admin/emails/[id]  Only DRAFT or FAILED; also removes the PDF. */
export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: true });
  if (auth instanceof Response) return auth;
  const id = validId((await context.params).id, ADMIN_EMAIL_ID_PATTERN);
  if (!id) return notFound();

  try {
    const prisma = getPrismaClient();
    const existing = await prisma.adminEmail.findUnique({
      where: { id },
      select: { status: true, attachmentPath: true },
    });
    if (!existing) return notFound();
    if (!EDITABLE.some((status) => status === existing.status)) return conflict(ALREADY_SENT);

    const deleted = await prisma.adminEmail.deleteMany({
      where: { id, status: { in: [...EDITABLE] } },
    });
    if (deleted.count === 0) return conflict(ALREADY_SENT);

    if (existing.attachmentPath) {
      await removeAttachment(existing.attachmentPath).catch((error: unknown) => {
        console.error('[admin-api] emails/delete: attachment removal failed.', error instanceof Error ? error.name : typeof error);
      });
    }
    return json({ ok: true });
  } catch (error) {
    return serverError('emails/delete', error);
  }
}
