import { getPrismaClient } from '@/lib/db';

const confirmationWindowMs = 24 * 60 * 60 * 1000;
const maxConfirmationsPerRecipient = 2;

export async function canSendConfirmation(email: string): Promise<boolean> {
  const prisma = getPrismaClient();
  const cutoff = new Date(Date.now() - confirmationWindowMs);
  const normalizedEmail = email.trim();
  const where = {
    createdAt: { gte: cutoff },
    email: { equals: normalizedEmail, mode: 'insensitive' as const },
  };
  const [auditCount, quoteCount] = await Promise.all([
    prisma.auditRequest.count({ where }),
    prisma.quoteRequest.count({ where }),
  ]);

  return auditCount + quoteCount <= maxConfirmationsPerRecipient;
}
