import 'server-only';
import { z } from 'zod';

/**
 * Admin authentication configuration. Every value is read lazily, on first
 * use at request time, so `next build` succeeds with none of them set.
 * Values are never logged; errors name the variable, never its value.
 */
export interface AdminAuthEnv {
  nextAuthUrl: string;
  nextAuthSecret: string;
  /** Lower-cased admin email address. */
  adminEmail: string;
  /** Decoded bcrypt hash (from ADMIN_PASSWORD_HASH_B64). */
  adminPasswordHash: string;
  googleClientId: string;
  googleClientSecret: string;
}

const requiredString = z.string().trim().min(1);
const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

function read(name: string): string {
  const parsed = requiredString.safeParse(process.env[name]);
  if (!parsed.success) {
    throw new Error(`Missing or invalid environment variable: ${name}`);
  }
  return parsed.data;
}

function readUrl(name: string): string {
  const value = read(name);
  if (!z.string().url().safeParse(value).success) {
    throw new Error(`Missing or invalid environment variable: ${name}`);
  }
  return value;
}

function readEmail(name: string): string {
  const value = read(name);
  if (!z.string().email().safeParse(value).success) {
    throw new Error(`Missing or invalid environment variable: ${name}`);
  }
  return value.toLowerCase();
}

/**
 * The bcrypt hash is stored base64-encoded because bcrypt hashes contain `$`,
 * which Next.js env loading can treat as variable expansion.
 */
function readPasswordHash(name: string): string {
  const decoded = Buffer.from(read(name), 'base64').toString('utf8').trim();
  if (!BCRYPT_HASH.test(decoded)) {
    throw new Error(`Missing or invalid environment variable: ${name}`);
  }
  return decoded;
}

let cached: AdminAuthEnv | null = null;

export function getAdminAuthEnv(): AdminAuthEnv {
  if (cached === null) {
    cached = {
      nextAuthUrl: readUrl('NEXTAUTH_URL'),
      nextAuthSecret: read('NEXTAUTH_SECRET'),
      adminEmail: readEmail('ADMIN_EMAIL'),
      adminPasswordHash: readPasswordHash('ADMIN_PASSWORD_HASH_B64'),
      googleClientId: read('GOOGLE_CLIENT_ID'),
      googleClientSecret: read('GOOGLE_CLIENT_SECRET'),
    };
  }
  return cached;
}
