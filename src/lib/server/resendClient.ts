import 'server-only';
import { Resend } from 'resend';
import { getResendConfig } from '@/lib/server/env';
import { getAdminInboxAddress } from '@/lib/admin/inboxAddress';

let client: Resend | null = null;

/** Shared Resend client, created on first use (no env read at build time). */
export function getResendClient(): Resend {
  if (!client) client = new Resend(getResendConfig().apiKey);
  return client;
}

/** Sender and reply-to for admin emails. */
export function getAdminSendIdentity(): { from: string; replyTo: string } {
  return { from: getResendConfig().from, replyTo: getAdminInboxAddress() };
}

/** Short, safe messages for Resend error codes (never the provider's text). */
export function safeSendError(name: string | undefined): string {
  switch (name) {
    case 'validation_error':
    case 'invalid_parameter':
    case 'missing_required_field':
      return 'The email was rejected as invalid. Check the recipient and content.';
    case 'invalid_attachment':
      return 'The attachment was rejected. Upload the PDF again.';
    case 'invalid_from_address':
      return 'The sender address is not verified.';
    case 'rate_limit_exceeded':
      return 'Too many emails at once. Try again in a minute.';
    case 'daily_quota_exceeded':
    case 'monthly_quota_exceeded':
      return 'The sending quota has been reached.';
    case 'invalid_idempotent_request':
    case 'concurrent_idempotent_requests':
      return 'A send for this email is already in progress. Refresh and try again.';
    default:
      return 'The email could not be sent.';
  }
}
