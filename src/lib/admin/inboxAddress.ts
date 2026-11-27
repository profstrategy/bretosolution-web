import 'server-only';
import { z } from 'zod';
import { DEFAULT_ADMIN_INBOX_ADDRESS } from '@/content/admin';

const emailSchema = z.string().trim().email();

/**
 * The public support address shown in the admin UI, from ADMIN_INBOX_ADDRESS,
 * with a fixed fallback when it is unset or not a valid email address.
 */
export function getAdminInboxAddress(): string {
  const parsed = emailSchema.safeParse(process.env.ADMIN_INBOX_ADDRESS);
  return parsed.success ? parsed.data : DEFAULT_ADMIN_INBOX_ADDRESS;
}
