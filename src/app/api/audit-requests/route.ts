import { randomUUID } from 'node:crypto';
import { getPrismaClient } from '@/lib/db';
import {
  getFieldErrors,
  hasFilledHoneypot,
  jsonError,
  jsonResponse,
  readJsonBody,
} from '@/lib/server/http';
import {
  notifyAuditRequest,
  sendAuditConfirmation,
} from '@/lib/server/notify';
import { sendLeadNotifications } from '@/lib/server/leadNotifications';
import {
  recordRateLimitHit,
  type RateLimitResult,
} from '@/lib/server/rateLimit';
import { auditRequestSchema } from '@/schemas/audit';
import { LEGAL_VERSION } from '@/content/legal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  if (hasFilledHoneypot(bodyResult.value)) {
    console.warn('Honeypot triggered on /api/audit-requests');
    return jsonResponse({ ok: true, id: randomUUID() }, 201);
  }

  let rateLimit: RateLimitResult;
  try {
    rateLimit = await recordRateLimitHit(request, '/api/audit-requests');
  } catch (error) {
    console.error('Audit request rate limit failed.', error);
    rateLimit = { limited: false, ipHash: 'rate-limit-unavailable' };
  }

  if (rateLimit.limited) {
    return jsonResponse(
      { ok: false, message: 'Too many requests. Please try again later.' },
      429,
      { 'Retry-After': String(rateLimit.retryAfterSeconds) }
    );
  }

  const parsed = auditRequestSchema.safeParse(bodyResult.value);
  if (!parsed.success) {
    return jsonResponse(
      { ok: false, errors: getFieldErrors(parsed.error) },
      400
    );
  }

  const values = {
    businessName: parsed.data.businessName,
    websiteOrInstagram: parsed.data.websiteOrInstagram,
    city: parsed.data.city,
    businessType: parsed.data.businessType,
    email: parsed.data.email,
  };
  const consentAcceptedAt = new Date();
  const userAgent = request.headers.get('user-agent')?.slice(0, 200) ?? null;

  let id: string;
  try {
    const saved = await getPrismaClient().auditRequest.create({
      data: {
        ...values,
        ipHash: rateLimit.ipHash,
        userAgent,
        consentAcceptedAt,
        consentVersion: LEGAL_VERSION,
      },
      select: { id: true },
    });
    id = saved.id;
  } catch (error) {
    console.error('Audit request database write failed.', error);
    return jsonError('Unable to save your request right now.', 500);
  }

  await sendLeadNotifications({
    label: 'Audit request',
    recipientEmail: values.email,
    notifyOwner: () =>
      notifyAuditRequest(values, {
        acceptedAt: consentAcceptedAt,
        version: LEGAL_VERSION,
      }),
    sendConfirmation: () => sendAuditConfirmation(values),
    updateNotifiedAt: async () => {
      await getPrismaClient().auditRequest.update({
        where: { id },
        data: { notifiedAt: new Date() },
      });
    },
  });

  return jsonResponse({ ok: true, id }, 201);
}
