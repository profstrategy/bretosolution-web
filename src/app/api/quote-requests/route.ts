import { randomUUID } from 'node:crypto';
import { getPrismaClient } from '@/lib/db';
import {
  getFieldErrors,
  hasFilledHoneypot,
  jsonError,
  jsonResponse,
  readJsonBody,
} from '@/lib/server/http';
import { notifyQuoteRequest } from '@/lib/server/notify';
import {
  recordRateLimitHit,
  type RateLimitResult,
} from '@/lib/server/rateLimit';
import { quoteRequestSchema } from '@/schemas/quote';
import { LEGAL_VERSION } from '@/content/legal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  if (hasFilledHoneypot(bodyResult.value)) {
    console.warn('Honeypot triggered on /api/quote-requests');
    return jsonResponse({ ok: true, id: randomUUID() }, 201);
  }

  let rateLimit: RateLimitResult;
  try {
    rateLimit = await recordRateLimitHit(request, '/api/quote-requests');
  } catch (error) {
    console.error('Quote request rate limit failed.', error);
    rateLimit = { limited: false, ipHash: 'rate-limit-unavailable' };
  }

  if (rateLimit.limited) {
    return jsonResponse(
      { ok: false, message: 'Too many requests. Please try again later.' },
      429,
      { 'Retry-After': String(rateLimit.retryAfterSeconds) }
    );
  }

  const parsed = quoteRequestSchema.safeParse(bodyResult.value);
  if (!parsed.success) {
    return jsonResponse(
      { ok: false, errors: getFieldErrors(parsed.error) },
      400
    );
  }

  const values = {
    businessType: parsed.data.businessType,
    helpNeeded: parsed.data.helpNeeded,
    mainChallenge: parsed.data.mainChallenge,
    contactName: parsed.data.contactName,
    businessName: parsed.data.businessName,
    email: parsed.data.email,
    phoneOrWhatsapp: parsed.data.phoneOrWhatsapp,
    websiteOrInstagram: parsed.data.websiteOrInstagram,
    countryRegion: parsed.data.countryRegion,
  };
  const consentAcceptedAt = new Date();
  const userAgent = request.headers.get('user-agent')?.slice(0, 200) ?? null;

  let id: string;
  try {
    const saved = await getPrismaClient().quoteRequest.create({
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
    console.error('Quote request database write failed.', error);
    return jsonError('Unable to save your request right now.', 500);
  }

  try {
    const notification = await notifyQuoteRequest(values, {
      acceptedAt: consentAcceptedAt,
      version: LEGAL_VERSION,
    });
    if (!notification.ok) {
      console.error('Quote request notification failed.', notification.error);
    } else {
      try {
        await getPrismaClient().quoteRequest.update({
          where: { id },
          data: { notifiedAt: new Date() },
        });
      } catch (error) {
        console.error('Quote request notification status update failed.', error);
      }
    }
  } catch (error) {
    console.error('Quote request notification failed.', error);
  }

  return jsonResponse({ ok: true, id }, 201);
}
