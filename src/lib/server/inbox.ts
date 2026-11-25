import 'server-only';
import type { ErrorResponse } from 'resend';

/** "Name <a@b.co>" or "a@b.co" → "a@b.co" (lower-cased). */
export function extractAddress(value: string): string {
  const match = /<([^<>]+)>/.exec(value);
  return (match?.[1] ?? value).trim().toLowerCase();
}

/** True when any of the given header values is the inbox address. */
export function addressedTo(values: readonly (string | null | undefined)[], inbox: string): boolean {
  const target = inbox.trim().toLowerCase();
  return values.some((value) => typeof value === 'string' && extractAddress(value) === target);
}

/**
 * Resend errors that mean receiving is not available for this account or key
 * (feature not enabled, sending-only key, unknown resource). The exact code
 * Resend returns when receiving is not set up is not documented in the SDK
 * types, so 403/404 and these codes are treated as "not configured".
 */
export function isReceivingNotConfigured(error: ErrorResponse): boolean {
  return (
    error.statusCode === 403 ||
    error.statusCode === 404 ||
    error.name === 'restricted_api_key' ||
    error.name === 'invalid_access' ||
    error.name === 'not_found'
  );
}

const SAFE_CONTENT_TYPE = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i;

export function safeContentType(value: string | null | undefined): string {
  return value && SAFE_CONTENT_TYPE.test(value.trim()) ? value.trim() : 'application/octet-stream';
}

/** Content-Disposition with an ASCII fallback and an RFC 5987 UTF-8 name. */
export function attachmentDisposition(filename: string | null | undefined): string {
  const name = (filename ?? 'attachment').replace(/[\r\n"\\]/g, '').trim() || 'attachment';
  const ascii = name.replace(/[^\x20-\x7e]/g, '_');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}
