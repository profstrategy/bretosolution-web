import { getAdminInboxAddress } from '@/lib/admin/inboxAddress';
import { badRequest, guardAdmin, json, serverError } from '@/lib/server/adminApi';
import { getFieldErrors } from '@/lib/server/http';
import { addressedTo, isReceivingNotConfigured } from '@/lib/server/inbox';
import { getResendClient } from '@/lib/server/resendClient';
import { inboxListQuerySchema } from '@/schemas/adminEmail';
import type { InboxItemDTO } from '@/state/domain.state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

/**
 * GET /api/admin/inbox?after=
 * Resend 6.39.0 `emails.receiving.list` accepts only { limit, after/before }
 * (no `to` filter), so a page of 20 is fetched and filtered to messages
 * addressed to ADMIN_INBOX_ADDRESS. A page may therefore hold fewer than 20.
 */
export async function GET(request: Request): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: false });
  if (auth instanceof Response) return auth;

  const query = inboxListQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  if (!query.success) return badRequest(getFieldErrors(query.error));

  try {
    const { data, error } = await getResendClient().emails.receiving.list({
      limit: PAGE_SIZE,
      ...(query.data.after ? { after: query.data.after } : {}),
    });
    if (error) {
      if (isReceivingNotConfigured(error)) {
        return json({ items: [], nextCursor: null, notice: 'receiving-not-configured' });
      }
      return serverError('inbox/list:resend', error, error.name);
    }

    const inbox = getAdminInboxAddress();
    const items: InboxItemDTO[] = data.data
      // The SDK types say `received_for` is always an array, but the list
      // response leaves it out, so spreading it unguarded throws (HTTP 500).
      .filter((email) =>
        addressedTo([...email.to, ...(Array.isArray(email.received_for) ? email.received_for : [])], inbox))
      .map((email) => ({
        id: email.id,
        from: email.from,
        to: email.to,
        subject: email.subject,
        createdAt: email.created_at,
        attachmentCount: email.attachments.length,
      }));
    const last = data.data[data.data.length - 1];
    const nextCursor = data.has_more && last ? last.id : null;
    return json({ items, nextCursor });
  } catch (error) {
    return serverError('inbox/list', error);
  }
}
