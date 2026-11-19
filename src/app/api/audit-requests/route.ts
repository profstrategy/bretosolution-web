import { randomUUID } from 'node:crypto';
import { getPrismaClient } from '@/lib/db';
import {
  getFieldErrors,
  hasFilledHoneypot,
  jsonError,
  jsonResponse,
  readJsonBody,
} from '@/lib/server/http';
import { notifyAuditRequest } from '@/lib/server/notify';
import {
  recordRateLimitHit,
  type RateLimitResult,
} from '@/lib/server/rateLimit';
import { auditRequestSchema } from '@/schemas/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  if (hasFilledHoneypot(bodyResult.value)) {
    return jsonResponse({ ok: true, id: randomUUID() }, 201);
  }

  let rateLimit: RateLimitResult;
  try {
    rateLimit = await recordRateLimitHit(request, '/api/audit-requests');
  } catch (error) {
    console.error('Audit request rate limit failed.', error);
    return jsonError('Unable to process your request right now.', 500);
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
  const userAgent = request.headers.get('user-agent')?.slice(0, 200) ?? null;

  let id: string;
  try {
    const saved = await getPrismaClient().auditRequest.create({
      data: {
        ...values,
        ipHash: rateLimit.ipHash,
        userAgent,
      },
      select: { id: true },
    });
    id = saved.id;
  } catch (error) {
    console.error('Audit request database write failed.', error);
    return jsonError('Unable to save your request right now.', 500);
  }

  try {
    const notification = await notifyAuditRequest(values);
    if (!notification.ok) {
      console.error('Audit request notification failed.', notification.error);
    } else {
      try {
        await getPrismaClient().auditRequest.update({
          where: { id },
          data: { notifiedAt: new Date() },
        });
      } catch (error) {
        console.error('Audit request notification status update failed.', error);
      }
    }
  } catch (error) {
    console.error('Audit request notification failed.', error);
  }

  return jsonResponse({ ok: true, id }, 201);
}
