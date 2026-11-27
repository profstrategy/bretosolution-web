import 'server-only';
import { z } from 'zod';

const requiredStringSchema = z.string().trim().min(1);
const emailSchema = z.string().trim().email();

function readRequiredString(name: string): string {
  const parsed = requiredStringSchema.safeParse(process.env[name]);
  if (!parsed.success) {
    throw new Error(`Missing or invalid environment variable: ${name}`);
  }

  return parsed.data;
}

function readRequiredEmail(name: string): string {
  const parsed = emailSchema.safeParse(process.env[name]);
  if (!parsed.success) {
    throw new Error(`Missing or invalid environment variable: ${name}`);
  }

  return parsed.data;
}

export function getDatabaseUrl(): string {
  return readRequiredString('DATABASE_URL');
}

export function getRateLimitSalt(): string {
  return readRequiredString('RATE_LIMIT_SALT');
}

export function getResendConfig() {
  return {
    apiKey: readRequiredString('RESEND_API_KEY'),
    from: readRequiredString('LEAD_FROM_EMAIL'),
    to: readRequiredEmail('LEAD_NOTIFY_EMAIL'),
  };
}
