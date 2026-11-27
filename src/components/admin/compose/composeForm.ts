import {
  createDraftSchema,
  draftRuleErrors,
  sendRuleErrors,
  MAX_ROWS,
  type NormalisedDraft,
} from '@/schemas/adminEmail';
import { adminComposerCopy } from '@/content/admin';
import { defaultSubjectFor } from '@/lib/admin/emailFormat';
import type { DraftInput, DraftPatch, PreviewInput } from '@/lib/admin/apiClient';
import type { AdminEmailDTO, AdminEmailKind, AdminEmailSourceDTO } from '@/state';

/**
 * Local (unsaved) composer state and its validation. Nothing here touches the
 * domain store: the modal hands the built payloads to the store actions.
 */

/** How the composer was opened. */
export type ComposeMode =
  | { type: 'new' }
  | { type: 'edit'; email: AdminEmailDTO }
  | {
      type: 'reply';
      toEmail: string;
      /** Subject of the message being answered ("Re: " is added). */
      subject: string;
      inReplyToMessageId: string;
      recipientName?: string;
    };

export interface RowValue {
  /** Stable React key for the row (never sent). */
  key: string;
  label: string;
  value: string;
}

export interface AttachmentValue {
  name: string;
  size: number;
  /**
   * Storage path of a new upload. null = the attachment already saved on the
   * draft (the API never exposes its path; it is kept by omitting the field).
   */
  storagePath: string | null;
}

export interface ComposeValues {
  kind: AdminEmailKind;
  toEmail: string;
  recipientName: string;
  businessName: string;
  subject: string;
  /** false while the subject still shows the template default. */
  subjectEdited: boolean;
  calendlyUrl: string;
  rows: RowValue[];
  attachment: AttachmentValue | null;
  /** true once the attachment was added, replaced or removed in this session. */
  attachmentChanged: boolean;
}

/** Fields that are fixed by how the composer was opened (not editable). */
export interface ComposeContext {
  inReplyToMessageId: string | null;
  source: AdminEmailSourceDTO | null;
}

/** Field keys used for inline errors, in the order fields appear. */
export const FIELD_ORDER = [
  'toEmail',
  'recipientName',
  'businessName',
  'subject',
  'bodyHtml',
  'attachment',
  'calendlyUrl',
  'rows',
] as const;

export type FieldErrors = Record<string, string>;

let rowSequence = 0;
export function newRow(label = '', value = ''): RowValue {
  rowSequence += 1;
  return { key: `row-${rowSequence}`, label, value };
}

/** "Re: <subject>" unless it already starts with "Re:" (any case). */
export function replySubject(subject: string): string {
  const trimmed = subject.trim();
  return /^re:/i.test(trimmed) ? trimmed : `Re: ${trimmed}`;
}

export function initialValues(mode: ComposeMode): ComposeValues {
  if (mode.type === 'edit') {
    const { email } = mode;
    return {
      kind: email.kind,
      toEmail: email.toEmail,
      recipientName: email.recipientName,
      businessName: email.businessName,
      subject: email.subject,
      subjectEdited: true,
      calendlyUrl: email.calendlyUrl ?? '',
      rows: email.rows.map((row) => newRow(row.label, row.value)),
      attachment: email.attachment
        ? { name: email.attachment.name, size: email.attachment.size, storagePath: null }
        : null,
      attachmentChanged: false,
    };
  }
  if (mode.type === 'reply') {
    return {
      kind: 'GENERAL',
      toEmail: mode.toEmail,
      recipientName: mode.recipientName ?? '',
      businessName: '',
      subject: replySubject(mode.subject),
      subjectEdited: true,
      calendlyUrl: '',
      rows: [],
      attachment: null,
      attachmentChanged: false,
    };
  }
  return {
    kind: 'AUDIT',
    toEmail: '',
    recipientName: '',
    businessName: '',
    subject: defaultSubjectFor('AUDIT', ''),
    subjectEdited: false,
    calendlyUrl: '',
    rows: [],
    attachment: null,
    attachmentChanged: false,
  };
}

export function initialContext(mode: ComposeMode): ComposeContext {
  if (mode.type === 'edit') {
    return { inReplyToMessageId: mode.email.inReplyToMessageId, source: mode.email.source };
  }
  if (mode.type === 'reply') {
    return { inReplyToMessageId: mode.inReplyToMessageId, source: null };
  }
  return { inReplyToMessageId: null, source: null };
}

/** Keeps the template default subject in step with the type and business. */
export function withDefaultSubject(values: ComposeValues): ComposeValues {
  if (values.subjectEdited) return values;
  const subject = defaultSubjectFor(values.kind, values.businessName);
  return subject === values.subject ? values : { ...values, subject };
}

function usesCalendly(kind: AdminEmailKind): boolean {
  return kind === 'AUDIT' || kind === 'QUOTE';
}

/**
 * Rows that will be sent: QUOTE only. Blank rows are kept so their errors
 * ("rows.<index>.label") point at the row the admin sees.
 */
function rowsToSend(values: ComposeValues): { label: string; value: string }[] {
  if (values.kind !== 'QUOTE') return [];
  return values.rows.map((row) => ({ label: row.label.trim(), value: row.value.trim() }));
}

function baseFields(values: ComposeValues, bodyHtml: string) {
  const calendly = values.calendlyUrl.trim();
  return {
    kind: values.kind,
    recipientName: values.recipientName.trim(),
    businessName: values.businessName.trim(),
    subject: values.subject.trim(),
    bodyHtml,
    calendlyUrl: usesCalendly(values.kind) && calendly ? calendly : null,
    rows: rowsToSend(values),
  };
}

/** The attachment as the API expects it, or undefined to leave it unchanged. */
function attachmentField(values: ComposeValues): DraftInput['attachment'] | undefined {
  if (!values.attachment) return values.attachmentChanged ? null : undefined;
  if (values.attachment.storagePath === null) return undefined;
  return {
    name: values.attachment.name,
    size: values.attachment.size,
    storagePath: values.attachment.storagePath,
  };
}

export function toDraftInput(values: ComposeValues, bodyHtml: string, context: ComposeContext): DraftInput {
  return {
    ...baseFields(values, bodyHtml),
    toEmail: values.toEmail.trim(),
    attachment: attachmentField(values) ?? null,
    inReplyToMessageId: context.inReplyToMessageId,
    source: context.source,
  };
}

/** PATCH body: every editable field; the attachment only when it changed. */
export function toDraftPatch(values: ComposeValues, bodyHtml: string): DraftPatch {
  const attachment = attachmentField(values);
  return {
    ...baseFields(values, bodyHtml),
    toEmail: values.toEmail.trim(),
    ...(attachment === undefined ? {} : { attachment }),
  };
}

export function toPreviewInput(values: ComposeValues, bodyHtml: string, context: ComposeContext): PreviewInput {
  const toEmail = values.toEmail.trim();
  const valid = createDraftSchema.shape.toEmail.safeParse(toEmail).success;
  const { attachment } = values;
  return {
    ...baseFields(values, bodyHtml),
    // The footer reason needs the recipient; leave it out until it is valid.
    ...(valid ? { toEmail } : {}),
    // A PDF already on the draft has no path here; the preview needs only name and size.
    attachment: attachment
      ? {
          name: attachment.name,
          size: attachment.size,
          ...(attachment.storagePath ? { storagePath: attachment.storagePath } : {}),
        }
      : null,
    inReplyToMessageId: context.inReplyToMessageId,
    source: context.source,
  };
}

export type ValidationPurpose = 'save' | 'send' | 'preview';

/**
 * Validates with the shared zod schema and the shared cross-field rules
 * (src/schemas/adminEmail.ts), plus the composer's required fields.
 */
export function validate(
  values: ComposeValues,
  bodyHtml: string,
  bodyEmpty: boolean,
  context: ComposeContext,
  purpose: ValidationPurpose
): FieldErrors {
  const errors: FieldErrors = {};
  const add = (key: string, message: string) => {
    if (errors[key] === undefined) errors[key] = message;
  };

  const base = baseFields(values, bodyHtml);
  const attachment = attachmentField(values);
  const candidate = {
    ...base,
    toEmail: values.toEmail.trim(),
    // An attachment already on the draft has no path here; checked below.
    attachment: attachment ?? null,
    inReplyToMessageId: context.inReplyToMessageId,
    source: context.source,
  };
  const parsed = createDraftSchema.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      add(issue.path.map(String).join('.') || 'form', issue.message);
    }
  }
  if (values.kind === 'QUOTE' && values.rows.length > MAX_ROWS) {
    add('rows', `Add at most ${MAX_ROWS} rows.`);
  }

  const draft: NormalisedDraft = {
    ...base,
    toEmail: candidate.toEmail,
    attachment: values.attachment
      ? { name: values.attachment.name, size: values.attachment.size, storagePath: values.attachment.storagePath ?? '' }
      : null,
    inReplyToMessageId: context.inReplyToMessageId,
    source: context.source,
  };
  const rules = purpose === 'send' ? sendRuleErrors(draft, !bodyEmpty) : draftRuleErrors(draft);
  for (const [key, message] of Object.entries(rules)) add(key, message);

  if (base.subject === '') add('subject', adminComposerCopy.errors.subjectRequired);
  if (bodyEmpty) add('bodyHtml', adminComposerCopy.errors.messageRequired);

  if (purpose === 'preview') {
    // A preview may be built before the recipient, subject or message exist.
    delete errors.toEmail;
    delete errors.subject;
    delete errors.bodyHtml;
    delete errors.attachment;
  }
  return errors;
}

/** First field (in display order) that has an error. */
export function firstErrorKey(errors: FieldErrors): string | null {
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;
  for (const field of FIELD_ORDER) {
    const match = keys.find((key) => key === field || key.startsWith(`${field}.`));
    if (match) {
      if (field !== 'rows') return match;
      // Rows: the earliest row, label before value.
      return keys
        .filter((key) => key === 'rows' || key.startsWith('rows.'))
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))[0] ?? match;
    }
  }
  return keys[0] ?? null;
}
