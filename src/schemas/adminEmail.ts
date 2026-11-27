import { z } from 'zod';

/**
 * Shared validation for the admin email API (server routes and, later, the
 * composer form). Field limits match the Prisma model and the templates.
 */

export const ADMIN_EMAIL_KINDS = ['AUDIT', 'QUOTE', 'GENERAL'] as const;
export const ADMIN_EMAIL_SOURCE_TYPES = ['AUDIT', 'QUOTE'] as const;

export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;
export const MAX_ROWS = 8;
export const MAX_ROW_LABEL = 40;
export const MAX_ROW_VALUE = 120;
export const MAX_BODY_HTML = 50_000;
export const MAX_SUBJECT = 200;

/** Storage object path produced by POST /api/admin/attachments/upload-url. */
export const ATTACHMENT_PATH_PATTERN =
  /^admin-emails\/[a-f0-9]{32}\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}\.pdf$/;

/** Links allowed in composed emails (server sanitiser and the editor): https and mailto only. */
export const SAFE_LINK_PATTERN = /^(https:\/\/[^\s]+|mailto:[^\s]+)$/i;

/** Prisma cuid ids. */
export const ADMIN_EMAIL_ID_PATTERN = /^[a-z0-9]{20,40}$/i;
/** Resend ids (UUIDs) and similar opaque ids. */
export const PROVIDER_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

const kindSchema = z.enum(ADMIN_EMAIL_KINDS, { message: 'Choose AUDIT, QUOTE or GENERAL.' });

const shortText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);

export const emailRowSchema = z.object({
  label: z.string().trim().min(1, 'Each row needs a label.').max(MAX_ROW_LABEL, `Row labels must be ${MAX_ROW_LABEL} characters or fewer.`),
  value: z.string().trim().min(1, 'Each row needs a value.').max(MAX_ROW_VALUE, `Row values must be ${MAX_ROW_VALUE} characters or fewer.`),
});

const calendlyUrlSchema = z
  .string()
  .trim()
  .max(500, 'The Calendly link is too long.')
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        url.protocol === 'https:' &&
        (url.hostname === 'calendly.com' || url.hostname.endsWith('.calendly.com'))
      );
    } catch {
      return false;
    }
  }, 'Enter a https://calendly.com link.');

export const attachmentInputSchema = z.object({
  name: z.string().trim().min(1, 'The attachment needs a name.').max(200, 'The file name is too long.'),
  size: z.number().int().min(1, 'The file is empty.').max(MAX_ATTACHMENT_BYTES, 'The file must be 15 MB or smaller.'),
  storagePath: z.string().regex(ATTACHMENT_PATH_PATTERN, 'Upload the PDF again.'),
});

/** RFC 5322 Message-ID, stored with angle brackets. */
const messageIdSchema = z
  .string()
  .trim()
  .max(998, 'The message id is too long.')
  .regex(/^<?[^<>\s@]+@[^<>\s]+>?$/, 'Invalid message id.')
  .transform((value) => `<${value.replace(/^<|>$/g, '')}>`);

export const sourceSchema = z.object({
  type: z.enum(ADMIN_EMAIL_SOURCE_TYPES),
  id: z.string().regex(ADMIN_EMAIL_ID_PATTERN, 'Invalid request id.'),
});

const draftFields = {
  kind: kindSchema,
  toEmail: z.string().trim().max(254, 'The address is too long.').email('Enter a valid email address.'),
  recipientName: shortText(100, 'Name').optional(),
  businessName: shortText(100, 'Business name').optional(),
  /** May contain {name} and {business} placeholders. */
  subject: shortText(MAX_SUBJECT, 'Subject').optional(),
  bodyHtml: z.string().max(MAX_BODY_HTML, 'The message is too long.').optional(),
  calendlyUrl: calendlyUrlSchema.nullable().optional(),
  rows: z.array(emailRowSchema).max(MAX_ROWS, `Add at most ${MAX_ROWS} rows.`).optional(),
  attachment: attachmentInputSchema.nullable().optional(),
  inReplyToMessageId: messageIdSchema.nullable().optional(),
  source: sourceSchema.nullable().optional(),
};

/** POST /api/admin/emails */
export const createDraftSchema = z.object(draftFields).strict();
/** PATCH /api/admin/emails/[id] (any subset of fields) */
export const patchDraftSchema = z.object(draftFields).partial().strict();
/**
 * POST /api/admin/emails/preview (recipient optional). The attachment may
 * omit its storage path: an edited draft's saved PDF has no path on the
 * client, and the preview only shows the file's name and size.
 */
export const previewDraftSchema = z
  .object({
    ...draftFields,
    toEmail: draftFields.toEmail.optional(),
    attachment: attachmentInputSchema
      .extend({ storagePath: attachmentInputSchema.shape.storagePath.optional() })
      .nullable()
      .optional(),
  })
  .strict();

export type CreateDraftInput = z.infer<typeof createDraftSchema>;
export type PatchDraftInput = z.infer<typeof patchDraftSchema>;
export type PreviewDraftInput = z.infer<typeof previewDraftSchema>;
export type EmailRow = z.infer<typeof emailRowSchema>;
export type AdminEmailKindValue = (typeof ADMIN_EMAIL_KINDS)[number];
export type AdminEmailSourceTypeValue = (typeof ADMIN_EMAIL_SOURCE_TYPES)[number];

/** A complete draft after defaults are applied (what is stored). */
export interface NormalisedDraft {
  kind: AdminEmailKindValue;
  toEmail: string;
  recipientName: string;
  businessName: string;
  subject: string;
  bodyHtml: string;
  calendlyUrl: string | null;
  rows: EmailRow[];
  attachment: { name: string; size: number; storagePath: string } | null;
  inReplyToMessageId: string | null;
  source: { type: AdminEmailSourceTypeValue; id: string } | null;
}

/**
 * Rules that span fields; checked on create, after merging a PATCH, and on
 * preview. Returns field errors keyed like the zod errors.
 */
export function draftRuleErrors(draft: NormalisedDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (draft.kind !== 'QUOTE' && draft.rows.length > 0) {
    errors.rows = 'Only quote emails can include rows.';
  }
  if (draft.kind === 'GENERAL' && draft.subject.trim().length === 0) {
    errors.subject = 'Write a personalised subject for this email.';
  }
  if (draft.source && draft.kind !== 'GENERAL' && draft.source.type !== draft.kind) {
    errors.source = 'An audit email must answer an audit request, and a quote email a quote request.';
  }
  return errors;
}

/** Extra rules that must hold before sending. */
export function sendRuleErrors(draft: NormalisedDraft, bodyHasText: boolean): Record<string, string> {
  const errors = draftRuleErrors(draft);
  if (!bodyHasText) errors.bodyHtml = 'Write a message before sending.';
  if (draft.kind === 'AUDIT' && !draft.attachment) {
    errors.attachment = 'Attach the audit report (PDF) before sending.';
  }
  return errors;
}

/** GET /api/admin/emails?cursor= */
export const emailListQuerySchema = z.object({
  cursor: z.string().regex(ADMIN_EMAIL_ID_PATTERN, 'Invalid cursor.').optional(),
});

/** GET /api/admin/inbox?after= */
export const inboxListQuerySchema = z.object({
  after: z.string().regex(PROVIDER_ID_PATTERN, 'Invalid cursor.').optional(),
});

/** POST /api/admin/attachments/upload-url */
export const uploadUrlRequestSchema = z
  .object({
    filename: z
      .string()
      .trim()
      .min(1, 'Choose a file.')
      .max(200, 'The file name is too long.')
      .refine((name) => /\.pdf$/i.test(name), 'Only PDF files are allowed.'),
    size: z.number().int().min(1, 'The file is empty.').max(MAX_ATTACHMENT_BYTES, 'The file must be 15 MB or smaller.'),
    contentType: z.literal('application/pdf', { message: 'Only PDF files are allowed.' }),
  })
  .strict();
