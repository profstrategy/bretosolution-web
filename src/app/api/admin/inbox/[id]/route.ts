import { guardAdmin, json, notFound, serverError, validId } from '@/lib/server/adminApi';
import { sanitizeInboundHtml } from '@/lib/server/emailHtml';
import { getResendClient } from '@/lib/server/resendClient';
import { PROVIDER_ID_PATTERN } from '@/schemas/adminEmail';
import type { InboxMessageDTO } from '@/state/domain.state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/inbox/[id]?images=1
 * Returns the received email with strictly sanitised HTML. Remote images are
 * removed (hasRemoteImages: true) unless ?images=1.
 */
export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: false });
  if (auth instanceof Response) return auth;
  const id = validId((await context.params).id, PROVIDER_ID_PATTERN);
  if (!id) return notFound();
  const allowRemoteImages = new URL(request.url).searchParams.get('images') === '1';

  try {
    const { data, error } = await getResendClient().emails.receiving.get(id);
    if (error) {
      if (error.statusCode === 404 || error.name === 'not_found') return notFound();
      return serverError('inbox/get:resend', error, error.name);
    }

    const sanitized = data.html
      ? sanitizeInboundHtml(data.html, { allowRemoteImages })
      : { html: null, hasRemoteImages: false };

    const message: InboxMessageDTO = {
      id: data.id,
      from: data.from,
      to: data.to,
      subject: data.subject,
      createdAt: data.created_at,
      html: sanitized.html,
      text: data.text,
      attachments: data.attachments.map((attachment) => ({
        id: attachment.id,
        filename: attachment.filename ?? 'attachment',
        contentType: attachment.content_type,
        size: attachment.size,
      })),
      messageId: data.message_id,
      hasRemoteImages: sanitized.hasRemoteImages,
    };
    return json({ message });
  } catch (error) {
    return serverError('inbox/get', error);
  }
}
