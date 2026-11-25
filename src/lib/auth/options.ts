import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { getAdminAuthEnv } from '@/lib/auth/env';
import { LOGIN_ERROR } from '@/lib/auth/errors';
import {
  recordRateLimitHit,
  type RateLimitResult,
} from '@/lib/server/rateLimit';

export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
export const ADMIN_LOGIN_BUCKET = 'admin-login';
export const ADMIN_LOGIN_LIMIT = 5;
export const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;

/**
 * bcrypt (cost 12) of random bytes. Compared against when the email is wrong,
 * so a wrong email costs the same time as a wrong password.
 */
const DUMMY_BCRYPT_HASH =
  '$2b$12$U6e8qzJ.1nMc.pSHxAqHjO1JkFswfz4ZWVDv4J43pc.X6Sb7XYtRu';

/** Constant-time string comparison (via fixed-length digests). */
function safeEqual(a: string, b: string): boolean {
  const digestA = createHash('sha256').update(a).digest();
  const digestB = createHash('sha256').update(b).digest();
  return timingSafeEqual(digestA, digestB);
}

/** next-auth passes request headers as a plain object; the limiter wants Headers. */
function toHeaders(raw: Record<string, unknown> | undefined): Headers {
  const headers = new Headers();
  if (!raw) return headers;
  for (const [name, value] of Object.entries(raw)) {
    if (typeof value === 'string') headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.filter((v) => typeof v === 'string').join(', '));
  }
  return headers;
}

function normaliseEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

let cachedOptions: AuthOptions | null = null;

/**
 * Builds the next-auth options on first use (request time), so `next build`
 * never reads auth environment variables.
 */
export function getAuthOptions(): AuthOptions {
  if (cachedOptions !== null) return cachedOptions;
  const env = getAdminAuthEnv();

  cachedOptions = {
    secret: env.nextAuthSecret,
    session: { strategy: 'jwt', maxAge: ADMIN_SESSION_MAX_AGE_SECONDS },
    pages: { signIn: '/admin/login', error: '/admin/login' },
    providers: [
      CredentialsProvider({
        name: 'Email and password',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials, req) {
          let rateLimit: RateLimitResult;
          try {
            rateLimit = await recordRateLimitHit(
              { headers: toHeaders(req.headers) },
              ADMIN_LOGIN_BUCKET,
              { limit: ADMIN_LOGIN_LIMIT, windowMs: ADMIN_LOGIN_WINDOW_MS }
            );
          } catch (error) {
            // Fail closed. Log only the error class, never request data.
            console.error(
              'Admin login rate limit check failed.',
              error instanceof Error ? error.name : 'UnknownError'
            );
            throw new Error(LOGIN_ERROR.unavailable);
          }
          if (rateLimit.limited) {
            throw new Error(LOGIN_ERROR.rateLimited);
          }

          const email = normaliseEmail(credentials?.email);
          const password = typeof credentials?.password === 'string' ? credentials.password : '';
          const emailMatches = safeEqual(email, env.adminEmail);
          // Always run bcrypt so response time does not reveal the email.
          const passwordMatches = await bcrypt.compare(
            password,
            emailMatches ? env.adminPasswordHash : DUMMY_BCRYPT_HASH
          );

          if (!emailMatches || !passwordMatches) return null;
          return { id: 'admin', email: env.adminEmail, name: 'Admin', role: 'admin' };
        },
      }),
      GoogleProvider({
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret,
      }),
    ],
    callbacks: {
      async signIn({ account, profile }) {
        if (account?.provider === 'credentials') {
          // authorize() already verified the email and password.
          return true;
        }
        if (account?.provider === 'google' && profile) {
          const verified = 'email_verified' in profile ? profile.email_verified : undefined;
          return normaliseEmail(profile.email) === env.adminEmail && verified === true;
        }
        return false;
      },
      async jwt({ token, user }) {
        if (user) {
          token.role = 'admin';
          token.email = normaliseEmail(user.email);
        }
        return token;
      },
      async session({ session, token }) {
        session.user = {
          ...session.user,
          email: typeof token.email === 'string' ? token.email : null,
          role: token.role === 'admin' ? 'admin' : undefined,
        };
        return session;
      },
    },
  };

  return cachedOptions;
}
