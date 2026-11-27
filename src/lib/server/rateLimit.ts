import 'server-only';
import { createHash } from 'node:crypto';
import { getPrismaClient } from '@/lib/db';
import { getRateLimitSalt } from '@/lib/server/env';

const REQUEST_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const RETENTION_MS = 24 * 60 * 60 * 1000;

export type RateLimitResult =
  | { limited: false; ipHash: string }
  | { limited: true; ipHash: string; retryAfterSeconds: number };

export interface RateLimitOptions {
  /** Maximum hits allowed in the window. Defaults to the form-API limit. */
  limit?: number;
  /** Window length in milliseconds. Defaults to one hour. */
  windowMs?: number;
}

export async function recordRateLimitHit(
  request: { headers: Headers },
  bucket: string,
  { limit = REQUEST_LIMIT, windowMs = WINDOW_MS }: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const forwardedIp = request.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    .trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  const ip = forwardedIp || realIp || 'unknown';
  const ipHash = createHash('sha256')
    .update(ip + getRateLimitSalt())
    .digest('hex');
  const cleanupCutoff = new Date(Date.now() - RETENTION_MS);
  const prisma = getPrismaClient();

  await prisma.rateLimitHit.deleteMany({
    where: {
      createdAt: {
        lt: cleanupCutoff,
      },
    },
  });

  return prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`
      SELECT pg_advisory_xact_lock(hashtext(${bucket}), hashtext(${ipHash}))
    `;

    const now = new Date();
    const where = {
      bucket,
      ipHash,
      createdAt: {
        gte: new Date(now.getTime() - windowMs),
      },
    };
    const hitCount = await transaction.rateLimitHit.count({ where });
    if (hitCount >= limit) {
      const oldestHit = await transaction.rateLimitHit.findFirst({
        where,
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      });
      const retryAt =
        (oldestHit?.createdAt.getTime() ?? now.getTime()) + windowMs;

      return {
        limited: true as const,
        ipHash,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((retryAt - now.getTime()) / 1000)
        ),
      };
    }

    await transaction.rateLimitHit.create({
      data: { bucket, ipHash },
    });

    return { limited: false as const, ipHash };
  });
}
