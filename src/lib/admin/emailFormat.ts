import { replyCopy } from '@/emails/reply/copy';
import type { AdminEmailKind } from '@/state/domain.state';

/**
 * Pure formatting shared by the composer (client) and the renderer (server),
 * so the subject the admin confirms is the subject that is sent.
 */

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Template default subject for a kind (GENERAL has none: it must be written). */
export function defaultSubjectFor(kind: AdminEmailKind, businessName: string): string {
  const business = businessName.trim();
  if (kind === 'AUDIT') {
    return business ? `${replyCopy.audit.defaultSubject} for ${business}` : replyCopy.audit.defaultSubject;
  }
  if (kind === 'QUOTE') return replyCopy.quote.defaultSubject;
  return '';
}

const PLACEHOLDER = /\{\s*(name|business)\s*\}/gi;

export interface SubjectInput {
  kind: AdminEmailKind;
  subject: string;
  recipientName: string;
  businessName: string;
}

/**
 * Resolves the subject. `{name}` and `{business}` are replaced with the
 * recipient's details, so one subject pattern can be personalised per
 * client. An empty subject falls back to the template default
 * (AUDIT/QUOTE only; GENERAL requires a subject).
 */
export function resolveSubject(draft: SubjectInput): string {
  const filled = draft.subject
    .replace(PLACEHOLDER, (_match, key: string) =>
      key.toLowerCase() === 'name' ? draft.recipientName : draft.businessName
    )
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (filled) return filled;
  return defaultSubjectFor(draft.kind, draft.businessName) || '(no subject)';
}
