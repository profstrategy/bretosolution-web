import 'server-only';
import type { AdminEmail } from '@prisma/client';
import { z } from 'zod';
import type { AdminEmailDTO } from '@/state/domain.state';
import { emailRowSchema, type NormalisedDraft } from '@/schemas/adminEmail';

const storedRowsSchema = z.array(emailRowSchema).max(8);

/** Rows are stored as JSON; anything unexpected becomes []. */
export function readRows(value: AdminEmail['rows']): NormalisedDraft['rows'] {
  const parsed = storedRowsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

/** Database record → normalised draft (used for PATCH merges and rendering). */
export function recordToDraft(record: AdminEmail): NormalisedDraft {
  return {
    kind: record.kind,
    toEmail: record.toEmail,
    recipientName: record.recipientName ?? '',
    businessName: record.businessName ?? '',
    subject: record.subject,
    bodyHtml: record.bodyHtml,
    calendlyUrl: record.calendlyUrl,
    rows: readRows(record.rows),
    attachment:
      record.attachmentPath && record.attachmentName && record.attachmentSize
        ? { name: record.attachmentName, size: record.attachmentSize, storagePath: record.attachmentPath }
        : null,
    inReplyToMessageId: record.inReplyToMessageId,
    source:
      record.sourceRequestType && record.sourceRequestId
        ? { type: record.sourceRequestType, id: record.sourceRequestId }
        : null,
  };
}

/** Database record → client DTO. The storage path is never exposed. */
export function toAdminEmailDTO(record: AdminEmail): AdminEmailDTO {
  const draft = recordToDraft(record);
  return {
    id: record.id,
    kind: record.kind,
    status: record.status,
    toEmail: draft.toEmail,
    recipientName: draft.recipientName,
    businessName: draft.businessName,
    subject: draft.subject,
    bodyHtml: draft.bodyHtml,
    calendlyUrl: draft.calendlyUrl,
    rows: draft.rows,
    attachment: draft.attachment ? { name: draft.attachment.name, size: draft.attachment.size } : null,
    inReplyToMessageId: draft.inReplyToMessageId,
    source: draft.source,
    lastEvent: record.lastEvent,
    error: record.error,
    sentAt: record.sentAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/** Normalised draft → Prisma columns. */
export function draftToColumns(draft: NormalisedDraft) {
  return {
    kind: draft.kind,
    toEmail: draft.toEmail,
    recipientName: draft.recipientName || null,
    businessName: draft.businessName || null,
    subject: draft.subject,
    bodyHtml: draft.bodyHtml,
    calendlyUrl: draft.calendlyUrl,
    rows: draft.rows,
    attachmentPath: draft.attachment?.storagePath ?? null,
    attachmentName: draft.attachment?.name ?? null,
    attachmentSize: draft.attachment?.size ?? null,
    inReplyToMessageId: draft.inReplyToMessageId,
    sourceRequestType: draft.source?.type ?? null,
    sourceRequestId: draft.source?.id ?? null,
  };
}
