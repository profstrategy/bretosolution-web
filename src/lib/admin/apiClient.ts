/**
 * Typed fetch client for the Stage 4 admin API (`/api/admin/*`).
 *
 * - Parses JSON and validates the response envelope with type guards.
 * - Maps non-2xx responses, timeouts and network failures to `AdminApiError`,
 *   whose message is always our own safe copy, never server text.
 * - Aborts every request after 20 seconds.
 *
 * Response contract that Stage 4 must implement:
 *   GET    /api/admin/emails?cursor=      -> { items: AdminEmailDTO[]; nextCursor: string | null }
 *   POST   /api/admin/emails              -> { email: AdminEmailDTO }
 *   GET    /api/admin/emails/[id]         -> { email: AdminEmailDTO }
 *   PATCH  /api/admin/emails/[id]         -> { email: AdminEmailDTO }
 *   DELETE /api/admin/emails/[id]         -> 204, or { ok: true }
 *   POST   /api/admin/emails/[id]/send    -> { email: AdminEmailDTO }
 *   POST   /api/admin/emails/[id]/refresh -> { email: AdminEmailDTO }
 *   POST   /api/admin/emails/preview      -> { html: string }
 *   POST   /api/admin/attachments/upload-url -> { path: string; signedUrl: string; token: string }
 *   GET    /api/admin/inbox?after=        -> { items: InboxItemDTO[]; nextCursor: string | null; notice?: 'receiving-not-configured' }
 *   GET    /api/admin/inbox/[id]?images=1 -> { message: InboxMessageDTO }
 *   GET    /api/admin/inbox/[id]/attachments/[attachmentId] -> file download (use as a link href)
 *
 * `uploadFile` PUTs a PDF straight to the Supabase signed upload URL from
 * `createUploadUrl` (same request shape as storage-js `uploadToSignedUrl`).
 * It uses XMLHttpRequest because fetch cannot report upload progress.
 */
import type {
  AdminEmailDTO,
  AdminEmailKind,
  AdminEmailRowDTO,
  AdminEmailSourceDTO,
  AdminEmailStatus,
  InboxAttachmentDTO,
  InboxItemDTO,
  InboxMessageDTO,
} from '@/state/domain.state';

export const ADMIN_API_TIMEOUT_MS = 20_000;

// ---------------------------------------------------------------------------
// Request and response types
// ---------------------------------------------------------------------------

export interface DraftAttachmentInput {
  name: string;
  size: number;
  /** Path in the private storage bucket returned by `createUploadUrl`. */
  storagePath: string;
}

export interface DraftInput {
  kind: AdminEmailKind;
  toEmail: string;
  recipientName: string;
  businessName: string;
  subject: string;
  bodyHtml: string;
  calendlyUrl: string | null;
  rows: AdminEmailRowDTO[];
  attachment: DraftAttachmentInput | null;
  /** RFC Message-ID being replied to (threads the email); optional. */
  inReplyToMessageId?: string | null;
  /** Website request this email answers; enables the footer reason line. */
  source?: AdminEmailSourceDTO | null;
}

export type DraftPatch = Partial<DraftInput>;

/**
 * Preview accepts a draft whose recipient is not filled in yet, and an
 * attachment without a storage path (a PDF already saved on the draft).
 */
export type PreviewInput = Omit<DraftInput, 'toEmail' | 'attachment'> & {
  toEmail?: string;
  attachment: { name: string; size: number; storagePath?: string } | null;
};

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface InboxPage extends Page<InboxItemDTO> {
  /** Set when Resend receiving is not available for this account. */
  notice?: 'receiving-not-configured';
}

export interface PageOptions {
  cursor?: string | null;
}

export interface InboxPageOptions {
  after?: string | null;
}

export interface InboxMessageOptions {
  /** Load remote (https) images in the message HTML. */
  images?: boolean;
}

export interface EmailPreview {
  html: string;
}

export interface UploadUrlRequest {
  filename: string;
  contentType: 'application/pdf';
  size: number;
}

export interface UploadUrlResponse {
  /** Storage path to save on the draft as `attachment.storagePath`. */
  path: string;
  signedUrl: string;
  token: string;
}

export interface UploadFileOptions {
  /** Called with 0..1 while the file uploads. */
  onProgress?: (fraction: number) => void;
  /** Aborting rejects with an `AdminApiError` whose code is `aborted`. */
  signal?: AbortSignal;
}

export interface AdminApiClient {
  listEmails(options?: PageOptions): Promise<Page<AdminEmailDTO>>;
  createEmail(input: DraftInput): Promise<AdminEmailDTO>;
  getEmail(id: string): Promise<AdminEmailDTO>;
  updateEmail(id: string, patch: DraftPatch): Promise<AdminEmailDTO>;
  deleteEmail(id: string): Promise<void>;
  sendEmail(id: string): Promise<AdminEmailDTO>;
  refreshEmail(id: string): Promise<AdminEmailDTO>;
  previewEmail(input: PreviewInput): Promise<EmailPreview>;
  createUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse>;
  uploadFile(signedUrl: string, file: Blob, options?: UploadFileOptions): Promise<void>;
  listInbox(options?: InboxPageOptions): Promise<InboxPage>;
  getInboxMessage(id: string, options?: InboxMessageOptions): Promise<InboxMessageDTO>;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export type AdminApiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'invalid'
  | 'too_large'
  | 'rate_limited'
  | 'server'
  | 'timeout'
  | 'network'
  | 'aborted'
  | 'bad_response';

const SAFE_MESSAGES: Record<AdminApiErrorCode, string> = {
  unauthorized: 'Your session has ended. Please sign in again.',
  forbidden: 'You do not have access to this.',
  not_found: 'That item no longer exists.',
  conflict: 'That item was changed elsewhere. Reload and try again.',
  invalid: 'Some details are missing or invalid.',
  too_large: 'That file or request is too large.',
  rate_limited: 'Too many attempts. Please wait a moment and try again.',
  server: 'The server could not complete the request.',
  timeout: 'The request timed out. Please try again.',
  network: 'Network problem. Check your connection and try again.',
  aborted: 'The request was cancelled.',
  bad_response: 'The server sent an unexpected response.',
};

/**
 * Codes whose message is more useful to the admin than the action's own
 * fallback ("Couldn't send the email."). For other codes the fallback wins.
 */
const USER_FACING_CODES: ReadonlySet<AdminApiErrorCode> = new Set([
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'invalid',
  'too_large',
  'rate_limited',
  'timeout',
  'network',
]);

export class AdminApiError extends Error {
  readonly code: AdminApiErrorCode;
  readonly status: number | null;
  /** Safe message to show the admin, or null to use the caller's fallback. */
  readonly userMessage: string | null;

  constructor(code: AdminApiErrorCode, status: number | null) {
    super(SAFE_MESSAGES[code]);
    this.name = 'AdminApiError';
    this.code = code;
    this.status = status;
    this.userMessage = USER_FACING_CODES.has(code) ? SAFE_MESSAGES[code] : null;
  }
}

function codeForStatus(status: number): AdminApiErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 413) return 'too_large';
  if (status === 429) return 'rate_limited';
  if (status === 400 || status === 422) return 'invalid';
  return 'server';
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

const EMAIL_KINDS: readonly string[] = ['AUDIT', 'QUOTE', 'GENERAL'];
const EMAIL_STATUSES: readonly string[] = ['DRAFT', 'SENDING', 'SENT', 'FAILED'];

function isEmailKind(value: unknown): value is AdminEmailKind {
  return isString(value) && EMAIL_KINDS.includes(value);
}

function isEmailStatus(value: unknown): value is AdminEmailStatus {
  return isString(value) && EMAIL_STATUSES.includes(value);
}

function isRow(value: unknown): value is AdminEmailRowDTO {
  return isRecord(value) && isString(value.label) && isString(value.value);
}

function isSource(value: unknown): value is AdminEmailSourceDTO | null {
  return (
    value === null ||
    (isRecord(value) && (value.type === 'AUDIT' || value.type === 'QUOTE') && isString(value.id))
  );
}

export function isAdminEmailDTO(value: unknown): value is AdminEmailDTO {
  if (!isRecord(value)) return false;
  const attachment = value.attachment;
  return (
    isString(value.id) &&
    isEmailKind(value.kind) &&
    isEmailStatus(value.status) &&
    isString(value.toEmail) &&
    isString(value.recipientName) &&
    isString(value.businessName) &&
    isString(value.subject) &&
    isString(value.bodyHtml) &&
    isStringOrNull(value.calendlyUrl) &&
    Array.isArray(value.rows) &&
    value.rows.every(isRow) &&
    (attachment === null ||
      (isRecord(attachment) && isString(attachment.name) && isNumber(attachment.size))) &&
    isStringOrNull(value.inReplyToMessageId) &&
    isSource(value.source) &&
    isStringOrNull(value.lastEvent) &&
    isStringOrNull(value.error) &&
    isStringOrNull(value.sentAt) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

export function isInboxItemDTO(value: unknown): value is InboxItemDTO {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.from) &&
    isStringArray(value.to) &&
    isString(value.subject) &&
    isString(value.createdAt) &&
    isNumber(value.attachmentCount)
  );
}

function isInboxAttachmentDTO(value: unknown): value is InboxAttachmentDTO {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.filename) &&
    isString(value.contentType) &&
    isNumber(value.size)
  );
}

export function isInboxMessageDTO(value: unknown): value is InboxMessageDTO {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.from) &&
    isStringArray(value.to) &&
    isString(value.subject) &&
    isString(value.createdAt) &&
    isStringOrNull(value.html) &&
    isStringOrNull(value.text) &&
    Array.isArray(value.attachments) &&
    value.attachments.every(isInboxAttachmentDTO) &&
    isString(value.messageId) &&
    typeof value.hasRemoteImages === 'boolean'
  );
}

type Parser<T> = (data: unknown) => T | null;

function pageParser<T>(isItem: (value: unknown) => value is T): Parser<Page<T>> {
  return (data) => {
    if (!isRecord(data)) return null;
    const { items, nextCursor } = data;
    if (!Array.isArray(items) || !items.every(isItem)) return null;
    if (!isStringOrNull(nextCursor)) return null;
    return { items, nextCursor };
  };
}

const parseEmailEnvelope: Parser<AdminEmailDTO> = (data) =>
  isRecord(data) && isAdminEmailDTO(data.email) ? data.email : null;

const parseMessageEnvelope: Parser<InboxMessageDTO> = (data) =>
  isRecord(data) && isInboxMessageDTO(data.message) ? data.message : null;

const parsePreview: Parser<EmailPreview> = (data) =>
  isRecord(data) && isString(data.html) ? { html: data.html } : null;

const parseUploadUrl: Parser<UploadUrlResponse> = (data) =>
  isRecord(data) && isString(data.path) && isString(data.signedUrl) && isString(data.token)
    ? { path: data.path, signedUrl: data.signedUrl, token: data.token }
    : null;

const parseDeleted: Parser<true> = (data) =>
  data === null || (isRecord(data) && data.ok === true) ? true : null;

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(
  method: Method,
  path: string,
  parse: Parser<T>,
  body?: unknown
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

  try {
    let response: Response;
    try {
      response = await fetch(path, {
        method,
        headers:
          body === undefined
            ? { Accept: 'application/json' }
            : { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      });
    } catch {
      throw new AdminApiError(controller.signal.aborted ? 'timeout' : 'network', null);
    }

    if (!response.ok) {
      throw new AdminApiError(codeForStatus(response.status), response.status);
    }

    let data: unknown = null;
    try {
      const raw = await response.text();
      if (raw.trim().length > 0) data = JSON.parse(raw);
    } catch {
      throw new AdminApiError(
        controller.signal.aborted ? 'timeout' : 'bad_response',
        response.status
      );
    }

    const parsed = parse(data);
    if (parsed === null) {
      throw new AdminApiError('bad_response', response.status);
    }
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

function withCursor(path: string, options?: PageOptions): string {
  const cursor = options?.cursor;
  return cursor ? `${path}?cursor=${encodeURIComponent(cursor)}` : path;
}

function emailPath(id: string, suffix = ''): string {
  return `/api/admin/emails/${encodeURIComponent(id)}${suffix}`;
}

const parseEmailPage = pageParser(isAdminEmailDTO);
const parseInboxItems = pageParser(isInboxItemDTO);
const parseInboxPage: Parser<InboxPage> = (data) => {
  const page = parseInboxItems(data);
  if (page === null || !isRecord(data)) return null;
  return data.notice === 'receiving-not-configured'
    ? { ...page, notice: 'receiving-not-configured' }
    : page;
};

function withQuery(path: string, params: Record<string, string | null | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

/** Upload timeout: generous, a 15 MB PDF on a slow connection. */
export const UPLOAD_TIMEOUT_MS = 5 * 60_000;

function uploadFile(signedUrl: string, file: Blob, options: UploadFileOptions = {}): Promise<void> {
  const { onProgress, signal } = options;
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AdminApiError('aborted', null));
      return;
    }
    const xhr = new XMLHttpRequest();
    const onAbort = () => xhr.abort();
    const cleanup = () => signal?.removeEventListener('abort', onAbort);

    xhr.open('PUT', signedUrl);
    xhr.timeout = UPLOAD_TIMEOUT_MS;
    xhr.setRequestHeader('content-type', 'application/pdf');
    xhr.setRequestHeader('cache-control', 'max-age=3600');
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
      } else {
        // Supabase answers 400 for size/MIME rejections as well; never echo its text.
        reject(new AdminApiError(xhr.status === 413 ? 'too_large' : codeForStatus(xhr.status), xhr.status));
      }
    };
    xhr.onerror = () => {
      cleanup();
      reject(new AdminApiError('network', null));
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new AdminApiError('timeout', null));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new AdminApiError('aborted', null));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    xhr.send(file);
  });
}

export const adminApiClient: AdminApiClient = {
  listEmails: (options) =>
    request('GET', withCursor('/api/admin/emails', options), parseEmailPage),
  createEmail: (input) =>
    request('POST', '/api/admin/emails', parseEmailEnvelope, input),
  getEmail: (id) => request('GET', emailPath(id), parseEmailEnvelope),
  updateEmail: (id, patch) =>
    request('PATCH', emailPath(id), parseEmailEnvelope, patch),
  deleteEmail: async (id) => {
    await request('DELETE', emailPath(id), parseDeleted);
  },
  sendEmail: (id) => request('POST', emailPath(id, '/send'), parseEmailEnvelope, {}),
  refreshEmail: (id) =>
    request('POST', emailPath(id, '/refresh'), parseEmailEnvelope, {}),
  previewEmail: (input) =>
    request('POST', '/api/admin/emails/preview', parsePreview, input),
  createUploadUrl: (uploadRequest) =>
    request('POST', '/api/admin/attachments/upload-url', parseUploadUrl, uploadRequest),
  uploadFile,
  listInbox: (options) =>
    request('GET', withQuery('/api/admin/inbox', { after: options?.after }), parseInboxPage),
  getInboxMessage: (id, options) =>
    request(
      'GET',
      withQuery(`/api/admin/inbox/${encodeURIComponent(id)}`, {
        images: options?.images ? '1' : null,
      }),
      parseMessageEnvelope
    ),
};

/** Download URL for a received attachment (protected by the admin session). */
export function inboxAttachmentUrl(emailId: string, attachmentId: string): string {
  return `/api/admin/inbox/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`;
}
