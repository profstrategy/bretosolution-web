import { guardAdmin, notFound, serverError, validId } from '@/lib/server/adminApi';
import { attachmentDisposition, safeContentType } from '@/lib/server/inbox';
import { getResendClient } from '@/lib/server/resendClient';
import { PROVIDER_ID_PATTERN } from '@/schemas/adminEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string; attachmentId: string }>;
}

const DOWNLOAD_TIMEOUT_MS = 30_000;

/**
 * GET /api/admin/inbox/[id]/attachments/[attachmentId]
 * Streams a received attachment through this server, so the admin session
 * protects it. Resend returns a temporary signed URL (download_url), fetched
 * fresh on every request.
 */
export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: false });
  if (auth instanceof Response) return auth;
  const params = await context.params;
  const emailId = validId(params.id, PROVIDER_ID_PATTERN);
  const attachmentId = validId(params.attachmentId, PROVIDER_ID_PATTERN);
  if (!emailId || !attachmentId) return notFound();

  try {
    const { data, error } = await getResendClient().emails.receiving.attachments.get({
      emailId,
      id: attachmentId,
    });
    if (error) {
      if (error.statusCode === 404 || error.name === 'not_found') return notFound();
      return serverError('inbox/attachment:resend', error, error.name);
    }

    const upstream = await fetch(data.download_url, {
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!upstream.ok || !upstream.body) {
      return serverError('inbox/attachment:download', null, upstream.status);
    }

    const headers = new Headers({
      'Content-Type': safeContentType(data.content_type),
      'Content-Disposition': attachmentDisposition(data.filename),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    const length = upstream.headers.get('content-length');
    if (length && /^\d+$/.test(length)) headers.set('Content-Length', length);

    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    return serverError('inbox/attachment', error);
  }
}
