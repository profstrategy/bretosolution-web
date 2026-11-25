import { getPrismaClient } from '@/lib/db';
import {
  conflict,
  guardAdmin,
  json,
  notFound,
  serverError,
  validId,
} from '@/lib/server/adminApi';
import { toAdminEmailDTO } from '@/lib/server/adminEmailDto';
import { getResendClient } from '@/lib/server/resendClient';
import { ADMIN_EMAIL_ID_PATTERN } from '@/schemas/adminEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** POST /api/admin/emails/[id]/refresh  Stores Resend's last_event for a SENT email. */
export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const auth = await guardAdmin(request, { mutation: true });
  if (auth instanceof Response) return auth;
  const id = validId((await context.params).id, ADMIN_EMAIL_ID_PATTERN);
  if (!id) return notFound();

  try {
    const prisma = getPrismaClient();
    const record = await prisma.adminEmail.findUnique({ where: { id } });
    if (!record) return notFound();
    if (record.status !== 'SENT' || !record.resendId) {
      return conflict('Only sent emails have a delivery status.');
    }

    const { data, error } = await getResendClient().emails.get(record.resendId);
    if (error || !data) return serverError('emails/refresh:resend', error, error?.name ?? null);

    const updated = await prisma.adminEmail.update({
      where: { id },
      data: { lastEvent: data.last_event },
    });
    return json({ email: toAdminEmailDTO(updated) });
  } catch (error) {
    return serverError('emails/refresh', error);
  }
}
